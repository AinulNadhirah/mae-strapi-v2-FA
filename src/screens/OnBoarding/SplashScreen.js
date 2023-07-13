// @ts-check
import { HmsPushEvent, RNRemoteMessage, HmsPushMessaging } from "@hmscore/react-native-hms-push";
import notifee, { EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import messaging from "@react-native-firebase/messaging";
import compareVersion from "compare-versions";
import { parseInt } from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { AppState, Platform, Appearance } from "react-native";
import Biometrics from "react-native-biometrics";
import RNBootSplash from "react-native-bootsplash";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import RNExitApp from "react-native-exit-app";
import RsaSdk from "react-native-rsa-sdk";
import RNSafetyNet from "react-native-safety-net";
import { closeContactPicker } from "react-native-select-contact";

import { checkApplePayEligibility } from "@screens/ApplePay/ApplePayController";
import { notificationController } from "@screens/Notifications";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { m2uEnrollment } from "@services";
import { withApi } from "@services/api";
import { SAFETY_NET } from "@services/api/endpoints";
import { createLocalNotification, getFCMToken } from "@services/pushNotifications";

import { AUTHENTICATION_ERROR, ERROR_TYPE_NO_NETWORK, ERROR_TYPE_TIMEOUT } from "@constants/api";
import * as Strings from "@constants/strings";
import { EXTERNAL_CALL } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { storeCloudLogs } from "@utils/cloudLog";
import { s2uV4load } from "@utils/dataModel/s2uSDKUtil";
import {
    getDeviceRSAInformation,
    unregisterS2uOta,
    updateS2UToken,
    getInitItem,
    removeLocalStorage,
    saveAndSetDigitalIdentity,
    setCloudTokenRequired,
    saveCloudToken,
    getIsAnalyticsExpired,
    removeInitCache,
    checkAnalyticsExpired,
    saveAppEnv,
    setCrashlyticsAttributes,
} from "@utils/dataModel/utility";
import { setRefreshToken, getCustomerKey } from "@utils/dataModel/utilitySecureStorage";
import { useErrorLog } from "@utils/logs";

class SplashScreenRoot extends Component {
    static propTypes = {
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        resetModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
        errorLogger: PropTypes.func,
        api: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            preloadError: false,
            errorTitle: "",
            errorDescription: "",
            isRootedDevice: false,
            isThirdPartyKeyboard: false,
            isS2uAuth: false,
            rsaCount: 0,
        };
        this.notificationListener = null;
        this.notificationOpenedListener = null;
        this.messageListener = null;
        this.bgMessageListener = null;
        this.notifeeForegroundListener = null;
        this.huaweiNotificationOpenedListener = null;
        this.huaweiMessageListener = null;
        this.huaweiNotificationListener = null;
        this.huaweiDataMessageListener = null;
    }

    componentDidMount() {
        this._setupAppEnv();
        const { route } = this.props;
        if (route?.params?.rsaLocked) {
            this.handleRsaLockedSignOff();
        } else if (route?.params?.isMarketPushShow) {
            /* Marketing Push structure change
            - Load the Token/server call after Marketing Push Display
            - set the CTA data into context to display in dashboard
            */
            route?.params?.CTAData && this.setCtaData(route?.params?.CTAData);
            this.requestPreloadToken();
        } else {
            this.checkBiometricsAvailable();
            this._getDeviceInformation();
        }

        AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                this.screenLockCheck();
            } else {
                if (Platform.OS === "ios") closeContactPicker();
            }
        });
    }

    componentWillUnmount() {
        this.notificationListener && this.notificationListener();
        this.notificationOpenedListener && this.notificationOpenedListener();
        this.messageListener && this.messageListener();
        if (this.huaweiNotificationOpenedListener) {
            this.huaweiNotificationOpenedListener.remove();
        }
        if (this.huaweiMessageListener) {
            this.huaweiMessageListener.remove();
        }
        if (this.huaweiNotificationListener) {
            this.huaweiNotificationListener.remove();
        }
        if (this.huaweiDataMessageListener) {
            this.huaweiDataMessageListener.remove();
        }
        this.bgMessageListener && this.bgMessageListener();
        this.notifeeForegroundListener && this.notifeeForegroundListener();
    }

    handleRsaLockedSignOff = async () => {
        // reset everything except for device details
        this.props.resetModel(null, ["device", "appSession"]);

        await removeLocalStorage();

        this.props.updateModel({
            ui: {
                ssoPopup: false,
                suspendOrLockedPopup: false,
                rsaLockedPopup: true,
            },
        });

        // proceed with the rest
        this.checkBiometricsAvailable();
        this._getDeviceInformation();
    };

    filterMerchants = (merchants, name) => {
        const merchantData = merchants.filter((merchantInfo) => {
            return merchantInfo?.code === name;
        });
        if (merchantData?.length === 1) {
            console.info("merchantData: ", merchantData);
            return merchantData[0];
        }
        return null;
    };

    getInitAPI = async (customerKey) => {
        return this.props.api.get(`${SAFETY_NET}?custKey=${customerKey || ""}`);
    };

    getInitConfig = async (customerKey) => {
        try {
            const initCache = await getInitItem("initCache");
            const initCacheData = await getInitItem("initCacheData");
            const isFromCacheInit = this.props?.route?.params?.isFromCacheInit;
            const data =
                initCache && !isFromCacheInit
                    ? initCacheData
                        ? initCacheData
                        : await this.getInitAPI(customerKey)
                    : await this.getInitAPI(customerKey);
            // updaate context when init api triggered
            this.props.updateModel({
                misc: {
                    isInitApiTriggered: !initCache || !initCacheData,
                    initVersionData: data?.data?.initVersion ?? "",
                },
            });
            return data;
        } catch (error) {
            //throw new Error(error);
            throw error;
        }
    };

    showSecureStorageErrorPopup() {
        this.props.updateModel({
            ui: {
                secureStorageFailedPopup: true,
            },
        });
    }

    requestPreloadToken = async () => {
        const customerKey = await getCustomerKey(this.props.getModel, true, false);

        //If customer key retrive fail, show error popup
        if (customerKey && customerKey.error) {
            this.showSecureStorageErrorPopup();
            return;
        }

        const isOnboardCompleted = await AsyncStorage.getItem("isOnboardCompleted");
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const params = {
            grantType: "PASSWORD",
            tokenType: "PRELOGIN",
            customerKey,
            mobileSDKData,
            limitApproved: false,
            marketing: !!this.props.route?.params?.isMarketPushShow,
        };

        /**
         * Call the init API all the time app launch. For 2 things; attestation only when user onboard
         * another is for app version check
         */
        try {
            /**
             * Added init cache changes
             * Take the config from async storage to implememnt init cache or init api
             * const response = await this.props.api.get(`${SAFETY_NET}?custKey=${customerKey || ""}`);
             * */
            const response = await this.getInitConfig(customerKey);

            if (response?.data) {
                /**
                 * version check
                 */
                const {
                    appVersion,
                    appStatus,
                    appMessage,
                    maintenance,
                    maintenanceTitle,
                    maintenanceMsg,
                    campaignInfo,
                    referralInfo,
                    specialOccasionData,
                    s2uReady,
                    s2uCoolingReady,
                    gameText,
                    atReady,
                    btReady,
                    ezypayReady,
                    cardStpReady,
                    suppCardStpReady,
                    snEnabled,
                    fdPlacementReady,
                    bakongReady,
                    sslInfo,
                    applePayProvision,
                    rtpReady,
                    homeInfo,
                    partnerMerchants,
                    m2uIdDeletionReady,
                    atmCashoutInfoResponse,
                    statementPrintingReady,
                    statementCasaPrintingReady,
                    retryCount,
                    retryWait,
                    retry,
                    retryThreshold,
                    ipCheckUrl,
                    cloudLogs,
                    cloudConfig,
                    financialGoal,
                    zakatService,
                    cmsUrl,
                    cmsReady,
                    asbStp,
                    zestIInfoResponse,
                    casaInfoResponse,
                    purchaseLimitReady,
                    secureSwitchFlag,
                    secureSwitchPrompter,
                    cardRenewalReady,
                    reprintReceiptReady,
                    contactBlacklistingValidation,
                    cardUnsettledTxnHistory,
                    overseasMobileNoEnableAppVersion,
                    walletBalanceReady, //On/Off flag for conditional balance update
                    secureSwitchS2UBypass, // On/Off flag for S2U bypass
                    blockCardFlag, // On/Off flag for Block card flow
                    blockAccountFlag, // On/Off flag for suspend account
                    blockDebitCardFlag, // On/Off flag for block debit card flow
                    s2uV4Flag,
                    s2uV4ToastFlag,
                    disabledPNSCall, //On/Off flag for disabledPNSCall
                    notificationCenterReady, //On/Off flag for Notification Center
                    ekycZolozFlag,
                    forceS2uReady,
                    rpp2bAbWidget,
                } = response.data;
                const currentVersion = DeviceInfo.getVersion();
                await AsyncStorage.setItem("initCacheData", JSON.stringify(response));

                /**
                 * lets check for maintenance status first,
                 * so we can stop the rest of the request since
                 * we know we are under planned maintenance
                 */
                if (maintenance) {
                    this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                        screen: "UnderMaintenance",
                        params: {
                            title: maintenanceTitle,
                            message: maintenanceMsg,
                        },
                    });

                    //Remove the Init Cache
                    await removeInitCache();
                    return;
                }

                /**
                 * Special occasion or festival or s2u interops
                 */
                this.props.updateModel({
                    misc: {
                        isCampaignPeriod: campaignInfo?.newCampaignReady ?? false,
                        isReferralCampaign: referralInfo?.campaignReady ?? false,
                        isSignupCampaignPeriod: campaignInfo?.signUpCampaignReady ?? false,
                        isFestivalReady: campaignInfo?.newFestivalReady ?? false,
                        // isTapTasticReady:
                        //     (campaignInfo?.newFestivalReady || campaignInfo?.tapTasticReady) ??
                        //     false,
                        tapTasticType: campaignInfo?.tapTasticType,
                        isNewTapTasticReady: campaignInfo?.newTapTasticReady ?? false,
                        isZakatReady: campaignInfo?.zakatReady ?? false,
                        isDonationReady: campaignInfo?.newDonationReady ?? false,
                        isTapTasticDonationReady: campaignInfo?.tapTasticDonationReady ?? false,
                        isBakongReady: bakongReady ?? false,
                        specialOccasionData,
                        gameMetadata: gameText,
                        snEnabled: snEnabled ?? false,
                        isRtpEnabled: rtpReady ?? false,
                        propertyMetadata: { ...homeInfo, showBanner: campaignInfo?.mayaHomeReady },
                        atmCashOutReady: atmCashoutInfoResponse?.flagEnable === "Y",
                        atmCashOutBanner:
                            atmCashoutInfoResponse?.bannerEnable ||
                            atmCashoutInfoResponse?.bannerEnable === "Y" ||
                            false,
                        m2uDeletion: m2uIdDeletionReady ?? false,
                        isShowSecureSwitch: secureSwitchFlag ?? false,
                        isSecureSwitchCampaign: secureSwitchPrompter ?? false,
                        isSecureSwitchS2UBypass: secureSwitchS2UBypass ?? false,
                        isShowBlockCard: blockCardFlag ?? false,
                        isShowSuspendCASA: blockAccountFlag ?? false,
                        isShowBlockDebitCard: blockDebitCardFlag ?? false,
                        showFestiveSendMoney: campaignInfo?.festiveIconReady ?? false,
                        cardStatement: statementPrintingReady ?? false,
                        casaStatement: statementCasaPrintingReady ?? false,
                        campaignWebViewUrl: campaignInfo?.cepTrackerUrl ?? "",
                        campaignTrackerUrl: campaignInfo?.dashboardCampaignUrl ?? "",
                        isCampaignTrackerEnable: campaignInfo?.dashboardCampaignEnabled ?? false,
                        maeCardUpdateLimitReady: purchaseLimitReady ?? true,
                        cardRenewalReady: cardRenewalReady ?? false,
                        isReprintReceiptReady: reprintReceiptReady ?? false,
                        isContactBlacklistingValidation: contactBlacklistingValidation ?? false,
                        isCardUnsettledTxnHistory: cardUnsettledTxnHistory ?? false,
                        isOverseasMobileNoEnabled: overseasMobileNoEnableAppVersion ?? false,
                        isS2uV4Flag: s2uV4Flag ?? false,
                        isS2uV4ToastFlag: s2uV4ToastFlag ?? false,
                        isDisablePNSCall: disabledPNSCall ?? true, //Default BAU is true
                        isNotificationCenterReady: notificationCenterReady ?? true, //Default show notification is true
                        isZoloz: ekycZolozFlag ?? false,
                        isForceS2uReady: forceS2uReady ?? false,
                        autoBillingEnable: rpp2bAbWidget ?? false,
                    },
                    applePay: {
                        isApplePayEnable: applePayProvision?.applePayProvision ?? false,
                        widgetEntryPoint: applePayProvision?.applePayWidget ?? false,
                        prompterEntryPoint: applePayProvision?.applePayPrompter ?? false,
                        cardsDashboardEntryPoint:
                            applePayProvision?.applePayCardsDashboard ?? false,
                        applePayPromotion: applePayProvision?.applePayPromotion ?? true,
                        applePayPromotionID: applePayProvision?.applePayPromotionID ?? 686304,
                        dashboardWidget: applePayProvision?.dashboardWidget ?? {},
                        cardsDashboardWidget: applePayProvision?.cardsDashboardWidget ?? {},
                    },
                    s2w: {
                        txnTypeList: campaignInfo?.txnList || [],
                    },
                    logs: {
                        cloudFlag: cloudLogs,
                        cloudCounter: cloudConfig,
                    },
                    s2uIntrops: {
                        mdipS2uEnable: s2uReady,
                        mdipS2uCoolingReady: s2uCoolingReady ?? false,
                    },
                    ccBTEZY: {
                        btEnable: btReady,
                        ezyPayEnable: ezypayReady,
                    },
                    cardsStp: {
                        ccEnable: cardStpReady ?? false,
                        ccSuppEnable: suppCardStpReady ?? false,
                    },
                    autoTopup: {
                        autoTopupEnable: atReady ?? false,
                    },
                    fixedDeposit: {
                        showFDPlacementEntryPoint: fdPlacementReady ?? true,
                    },
                    ssl: {
                        sslPrompterUrl: sslInfo?.dataPowerInfo?.sslPrompter ?? "",
                        sslL2CategoriesUrl: sslInfo?.dataPowerInfo?.sslL2Categories ?? "",
                        sslPromoCategoriesUrl: sslInfo?.dataPowerInfo?.sslPromoCategories ?? "",
                        sslReady: sslInfo?.sslReady ?? false,
                        sandboxUrl: sslInfo?.sandboxUrl ?? "",
                        geolocationUrl: sslInfo?.geolocationUrl?.replace("/partner", "") ?? "",
                    },
                    myGroserReady: this.filterMerchants(partnerMerchants, "MYGROSER"),
                    partnerMerchants,
                    atm: {
                        statusMsg: atmCashoutInfoResponse?.flagMsg,
                        statusHeader: atmCashoutInfoResponse?.flagHeaderMsg,
                    },
                    pushNotification: {
                        isTokenLoaded: true, //once load the token update as TRUE, Used in FCM Marketing push event
                    },
                    financialGoal: {
                        showFinancialGoal: financialGoal?.showFinancialGoal ?? false,
                    },
                    zakatService: {
                        showZakatService: zakatService?.showZakatService ?? false,
                    },
                    networkRetry: {
                        retryErrorCount: retryCount,
                        retryErrorWait: retryWait,
                        isRetry: retry ?? false,
                        retryFailedThreshold: retryThreshold ?? 8000,
                        internetCheckAPIURL: ipCheckUrl ?? EXTERNAL_CALL,
                    },
                    cloud: {
                        cmsUrl: cmsUrl ?? "",
                        cmsCloudEnabled: cmsReady ?? false,
                    },
                    zestModule: {
                        isZestiEnable: zestIInfoResponse?.zestiFlag ?? false,
                        isM2uPremierEnable: zestIInfoResponse?.m2uPremierFlag ?? false,
                        isResumeZestOrM2UActivateEnable:
                            zestIInfoResponse?.activateAccount ?? false,
                        isZestApplyDebitCardEnable: zestIInfoResponse?.applyDebitCardFlag ?? false,
                        isZestActivateDebitCardEnable:
                            zestIInfoResponse?.activateDebitCardFlag ?? false,
                    },
                    asbStpModule: {
                        isGuarantorFlagEnable: asbStp?.guarantorFlag ?? false,
                        isMainApplicantFlagEnable: asbStp?.mainApplicantFlag ?? false,
                    },
                    casaModule: {
                        isPM1Enable: casaInfoResponse?.pm1Flag ?? false,
                        isPMAEnable: casaInfoResponse?.pmaFlag ?? false,
                        isCasaActivateAccount: casaInfoResponse?.casaActivateAccount ?? false,
                        isKawankuEnable: casaInfoResponse?.kawanKuFlag ?? false,
                        isSavingsIEnable: casaInfoResponse?.savingIFlag ?? false,
                    },
                    wallet: {
                        isUpdateBalanceEnabled: walletBalanceReady ?? false,
                    },
                });

                // compare for lesser version, since we might get the app updated earlier than backend
                // could increase the app version in server
                if (
                    !__DEV__ &&
                    appVersion &&
                    compareVersion.compare(currentVersion, appVersion, "<")
                ) {
                    // notify the user with popup, but let other process proceed
                    if (appStatus === 1) {
                        this.props.updateModel({
                            ui: {
                                appVersionUnmatched: true,
                                appVersionUnmatchedMessage: appMessage || "App outdated.",
                            },
                        });
                        //Remove the Init Cache
                        await removeInitCache();
                    }

                    // notify to download latest app and block the rest
                    if (appStatus === 2) {
                        this.props.updateModel({
                            ui: {
                                appVersionUnmatched: true,
                                appVersionUnmatchedBlock: true,
                                appVersionUnmatchedMessage: appMessage || "App outdated.",
                            },
                        });

                        //Remove the Init Cache
                        await removeInitCache();
                        return;
                    }

                    // if 0 proceed
                }

                await setCloudTokenRequired(params);

                // do attestation on android, only on release
                // uncomment to test
                if (customerKey && isOnboardCompleted === "true") {
                    if (await getIsAnalyticsExpired()) {
                        params.mdipRequired = true;
                    }

                    if (!__DEV__ && Platform.OS === "android" && snEnabled) {
                        const { nonce } = response.data;

                        try {
                            const safetyNet = await RNSafetyNet.getSafetyNetAttestationToken(nonce);

                            if (safetyNet) {
                                params.attestationPayload = safetyNet.JW_TOKEN;

                                this.enrollmentCall(params, customerKey);
                            }
                        } catch (error) {
                            console.tron.log("safetynet error", error);

                            this.enrollmentCall(params, customerKey);
                        }
                    } else {
                        //iOS
                        if (applePayProvision?.applePayProvision)
                            checkApplePayEligibility(this.props.updateModel);
                        this.enrollmentCall(params, customerKey);
                    }
                } else {
                    if (Platform.OS === "ios") {
                        if (applePayProvision?.applePayProvision)
                            checkApplePayEligibility(this.props.updateModel);
                    }
                    throw new Error("Not onboarded. Go to onboarding.");
                }
            } else {
                throw new Error("No response from server");
            }
        } catch (error) {
            this.props.errorLogger(error);

            // In case wanna show no internet screen
            if (error?.status === AUTHENTICATION_ERROR) {
                // this.setState({
                //     preloadError: true,
                //     errorTitle: "",
                //     errorDescription: Strings.FAILED_AUTH,
                // });
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                    screen: "BackSoon",
                });
                return;
            } else if (error?.status === ERROR_TYPE_NO_NETWORK) {
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                    screen: "NoInternet",
                });
                return;
            } else if (error?.status) {
                const desc =
                    error?.status === ERROR_TYPE_TIMEOUT
                        ? Strings.TIMEOUT_ERROR
                        : Strings.SERVER_HTTP_ERROR;
                this.setState({
                    preloadError: true,
                    errorTitle: "",
                    errorDescription: desc,
                });
            } else {
                // in case init failed
                // do regular flow
                if (
                    typeof customerKey === "string" &&
                    customerKey &&
                    isOnboardCompleted === "true"
                ) {
                    this.enrollmentCall(params, customerKey);
                } else {
                    //remove SecureStorage (uninstall is not wiping value for SecureStorage) and AsyncStorage
                    await removeLocalStorage();
                    //removed FCM event because it's calling before token load
                    //await this.registerNotificationListener();
                    this._syncLocalStorageToAppState();
                }
            }
        }
    };

    enrollmentCall = async (params, customerKey) => {
        try {
            const { updateModel, getModel } = this.props;
            const fcmSync = await AsyncStorage.getItem("fcmSync");
            const isOtaEnabled = await AsyncStorage.getItem("isOtaEnabled");
            const { isInitApiTriggered, initVersionData } = getModel("misc");
            const isFromCacheInit = this.props?.route?.params?.isFromCacheInit;
            const enrollResponse = this.props?.route?.params?.enrollResponse;

            const response = isFromCacheInit ? enrollResponse : await m2uEnrollment(params, true);
            if (response?.data) {
                const {
                    access_token,
                    refresh_token,
                    contact_number,
                    cus_type,
                    digitalIdentity,
                    cloudToken,
                    initCacheRequired,
                    initVersion,
                    serverDate,
                    analyticsExpiry,
                    isUnderCoolDown,
                    coolDownPeriod,
                    mdipS2uReady,
                } = response.data;
                const initCache = initCacheRequired ?? false;
                const versionCheck =
                    initVersionData && initVersion ? initVersion === initVersionData : false;
                await AsyncStorage.setItem("initCache", JSON.stringify(initCache));
                if (
                    !isInitApiTriggered &&
                    !isFromCacheInit &&
                    (!initCache || (initCache && !versionCheck))
                ) {
                    this.props.navigation.setParams({
                        isFromCacheInit: true,
                        enrollResponse: response,
                    });
                    await this.requestPreloadToken();
                    return;
                }
                updateModel({
                    auth: {
                        token: access_token,
                        refreshToken: refresh_token,
                        isSessionTimeout: false,
                        customerKey,
                        fallBack: false,
                    },
                    m2uDetails: {
                        m2uPhoneNumber: contact_number,
                    },
                    user: {
                        isOnboard: true,
                        isNTB: cus_type === "10",
                        soleProp: cus_type === "02",
                        cus_type,
                        icNumber: response?.data?.ic_number,
                    },
                    ota: {
                        isUnderCoolDown,
                        coolDownPeriod,
                        serverDateTime: serverDate,
                    },
                    s2uIntrops: {
                        mdipS2uEnable: mdipS2uReady,
                    },
                });
                // store refresh token in secure storage
                setRefreshToken(refresh_token);
                //await this.registerNotificationListener();
                this._syncLocalStorageToAppState();

                // Prod s2u DB need to update with dynamic FCM token keys,
                // Currently its hardcoded so need to sync, untill return success need to retry
                if (isOtaEnabled && mdipS2uReady && fcmSync !== "true") {
                    this.syncS2uFCMToken();
                }

                // store mdipObject in local storage
                await saveAndSetDigitalIdentity(serverDate, digitalIdentity, getModel);

                if (serverDate && analyticsExpiry) {
                    await checkAnalyticsExpired(serverDate, analyticsExpiry, getModel);
                }

                //store cloudToken in local storage
                await saveCloudToken(cloudToken);
                // initialize crashlytics
                await setCrashlyticsAttributes(getModel);

                // if (isTapTasticReady) {
                //     launchMae();
                //     const resp = await checkS2WEarnedChances({ txnType: "MAELAUNCH" });
                //     if (resp?.data) {
                //         const { displayPopup, chance } = resp.data;
                //         if (displayPopup && tapTasticType === "cny") {
                //             this.props.navigation.push("TabNavigator", {
                //                 screen: "CampaignChancesEarned",
                //                 params: {
                //                     chances: chance,
                //                     isCapped: true,
                //                     isTapTasticReady,
                //                     tapTasticType,
                //                 },
                //             });
                //         }
                //     }
                // }
            }
        } catch (error) {
            this.props.errorLogger(error);
            console.log("Error when authenticating", error);

            if (
                error.status === 403 ||
                (error.status === 2400 && error?.error?.message.indexOf("Locked") > -1)
            ) {
                // shouldn't need this as it was handled by api manager
            } else if (error?.status === "nonetwork") {
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                    screen: "NoInternet",
                });
            } else {
                const desc =
                    error?.status === "timeout" ? Strings.TIMEOUT_ERROR : Strings.SERVER_HTTP_ERROR;
                this.setState({
                    preloadError: true,
                    errorTitle: "",
                    errorDescription: desc,
                });
            }
        }
    };

    _setupAppEnv = async () => {
        const appEnv = await AsyncStorage.getItem("appEnv");
        Config.APP_ENV = appEnv ?? "";
    };

    _getDeviceInformation = async () => {
        try {
            await this._getRsaDSK();
        } catch (error) {
            console.error(error);
            //Log the SDK error to cloud
            this._logSDKError(error, "RSA SDK");
            setTimeout(() => {
                this._retryFetchRSASDK();
            }, 2000);
        }
    };

    _getRsaDSK = async () => {
        const deviceInformation = await RsaSdk.getRSAMobileSDK();
        if (deviceInformation) {
            if (Platform.OS === "ios") {
                const { result } = JSON.parse(deviceInformation);
                const { KeyChainErrorOnRetrieve, KeychainErrorOnStoring } = JSON.parse(result);
                console.log(
                    "RSA Device Information : 5.0 -> KeyChainErrorOnRetrieve : ",
                    KeyChainErrorOnRetrieve,
                    "  KeyChainErrorOnStoring :  ",
                    KeychainErrorOnStoring
                );
                /**
                 * KeyChainErrorOnRetrieve : "-25300" : Item could not found in keychain
                 * KeyChainErrorOnRetrieve : "-25308" : User interaction not allowed (When device is locked)
                 */
                if (KeyChainErrorOnRetrieve === "Success" && KeychainErrorOnStoring === "Success") {
                    await this._handleDeviceInformation(deviceInformation);
                } else {
                    this._logSDKError(deviceInformation, "RSA Keychain");
                    throw new Error(" deviceInformation RSA SDK " + deviceInformation);
                }
            } else {
                await this._handleDeviceInformation(deviceInformation);
            }
        } else {
            throw new Error(" deviceInformation RSA SDK " + deviceInformation);
        }
    };

    _retryFetchRSASDK = async () => {
        const { rsaCount } = this.state;
        try {
            this.setState({ rsaCount: rsaCount + 1 });
            await this._getRsaDSK();
        } catch (error) {
            console.error(error);
            //trigger Popup
            if (rsaCount < 3) {
                setTimeout(() => {
                    this._retryFetchRSASDK();
                }, 1000);
                //Log the SDK error to cloud
                this._logSDKError(error, "RSA SDK Retry " + rsaCount);
            } else {
                RNBootSplash.hide({ duration: 250 });
                this.props.updateModel({
                    ui: {
                        rsaSDKPopup: true,
                    },
                });
                //Log the SDK error to cloud
                this._logSDKError(error, "RSA SDK Retry Failed");
            }
        }
    };

    _logSDKError = (error, errorType) => {
        const { getModel } = this.props;
        storeCloudLogs(getModel, {
            errorType,
            errorDetails: error,
        });
    };

    _handleDeviceInformation = async (deviceInformation, androidUuid) => {
        try {
            const { result } = JSON.parse(deviceInformation);
            const { HardwareID, Compromised } = JSON.parse(result);
            const deviceTheme = Appearance.getColorScheme();

            if (Compromised > 0) {
                // Emulator == 1 Rooted Device
                if (!__DEV__) {
                    this.setState({ isRootedDevice: true });
                    return;
                }
            }

            const systemVersion = DeviceInfo.getSystemVersion();
            const deviceId = Platform.select({
                ios: HardwareID ?? DeviceInfo.getUniqueId(),
                android:
                    systemVersion > 9
                        ? androidUuid ?? DeviceInfo.getUniqueId()
                        : HardwareID ?? DeviceInfo.getUniqueId(),
            });
            const DeviceName = !__DEV__ ? DeviceInfo.getDeviceNameSync() : "developmentDevice";
            const deviceInfo = {
                ...JSON.parse(result),
                DeviceName,
            };

            RNBootSplash.hide({ duration: 250 });

            await this._checkAppPermission();

            console.log("_handleDeviceInformation", this.props);
            // Marketing push: checking FCM event before init & enrollement api to get details and display the Marketing Notifiction
            await this.registerNotificationListener();
            const { getModel } = this.props;
            const { isMarketingPush } = getModel("pushNotification");
            const isOnboardCompleted = await AsyncStorage.getItem("isOnboardCompleted");

            // store in context
            this.props.updateModel(
                {
                    device: {
                        hardwareId: HardwareID,
                        deviceId,
                        deviceInformation: deviceInfo,
                        deviceTheme,
                    },
                    misc: {
                        appVersion: DeviceInfo.getVersion(),
                    },
                    user: {
                        isOnboard: isOnboardCompleted === "true",
                    },
                },
                /*  Marketing Push structure change
                    -check the flag to display marketing push and hold token or regular Token load flow
                  */
                isMarketingPush
                    ? this._handleNavigation(isOnboardCompleted === "true")
                    : this.requestPreloadToken()
            );

            console.log("after updateModel", this.props);
        } catch (error) {
            this.props.errorLogger(error);
            RNBootSplash.hide({ duration: 250 });
            throw new Error(" deviceInformation Device SDK " + error);
        }
    };

    _checkAppPermission = async () => {
        if (isPureHuawei) {
            // Huawei permissions are enabled by default. Added the method incase if we need to modify
            this.checkHuaweiPushKitPermission();
        } else {
            if (Platform.OS === "android") {
                const AndroidPermissionCheck = require("./PermissionsCheck.android").default;

                AndroidPermissionCheck();
            }

            this._requestFirebaseMessagingPermission();
        }
    };

    checkHuaweiPushKitPermission = () => {
        const { updateModel } = this.props;
        updateModel({
            permissions: {
                notifications: true, // permissions are enabled by default
            },
        });
    };

    _requestFirebaseMessagingPermission = async () => {
        const { updateModel } = this.props;
        const permission = await messaging().hasPermission();

        if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
            updateModel({
                permissions: {
                    notifications: true,
                },
            });
        } else {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            console.log("authStatus", authStatus, "enabled", enabled);
            if (enabled) {
                updateModel({
                    permissions: {
                        notifications: true,
                    },
                });
            } else {
                showInfoToast({
                    message:
                        "Denying the permission request will stop you from receiving any push notification for this application. Go to your phone settings to enable notifications.",
                });
            }
        }
    };

    syncS2uFCMToken = async () => {
        // Prod s2u DB need to update with dynamic FCM token keys, Currently its hardcoded so need to sync
        const { getModel } = this.props;
        const { fcmToken } = getModel("auth");
        const latestToken = await getFCMToken(fcmToken);
        const result = await updateS2UToken(latestToken);

        if (result) {
            await AsyncStorage.setItem("fcmSync", "true");
        }
    };

    _syncLocalStorageToAppState = async () => {
        const { updateModel, getModel } = this.props;
        const results = await AsyncStorage.multiGet([
            "isOnboardCompleted",
            "isOtaEnabled",
            "mdipCounter",
            "SEC2U_MDIP_COUNTER",
            "otaHotp",
            "otaTotp",
            "deviceKeys",
            "serverPublicKey",
            "qrEnabled",
            "otaDeviceId",
            "fcmToken",
            "isPromotionsEnabled",
            "isCustomAlertEnabled",
            "isNotificationVisited",
            "welcomeMessageAddedDate",
            "welcomeMessageDeletedDate",
            "welcomeMessageSeenDate",
            "walletShowBalance",
            "showBalanceDashboard",
            "supOn",
            "cartV1",
            "locationHistoryArrV1",
            "currSelectedLocationV1",
            "fnbCurrLocation",
            "isAtmEnabled",
            "isAtmOnboarded",
        ]);
        const [
            isOnboardCompleted,
            isOtaEnabled,
            mdipCounter,
            s2uMdipCounter,
            otaHotp,
            otaTotp,
            deviceKeys,
            serverPublicKey,
            qrEnabled,
            otaDeviceId,
            fcmToken,
            isPromotionsEnabled,
            isCustomAlertEnabled,
            isNotificationVisited,
            welcomeMessageAddedDate,
            welcomeMessageDeletedDate,
            welcomeMessageSeenDate,
            walletShowBalance,
            showBalanceDashboard,
            supOn,
            cartV1,
            locationHistoryArrV1,
            currSelectedLocationV1,
            fnbCurrLocation,
            isAtmEnabled,
            isAtmOnboarded,
        ] = results.map((result) => result[1]);

        const s2uOta = {
            isEnabled: isOtaEnabled === "true",
            mdipCounter: s2uMdipCounter ? parseInt(s2uMdipCounter) : 1,
            hOtp: otaHotp,
            tOtp: otaTotp,
            serverPublicKey,
            devicePublicKey: deviceKeys && JSON.parse(deviceKeys).pk,
            deviceSecretKey: deviceKeys && JSON.parse(deviceKeys).sk,
            deviceId: otaDeviceId,
        };

        updateModel({
            auth: {
                fcmToken,
                fallBack: false,
            },
            ota: s2uOta,
            atm: { isEnabled: isAtmEnabled === "true", isOnboarded: isAtmOnboarded === "true" },
            user: {
                isOnboard: isOnboardCompleted === "true",
            },
            qrPay: {
                isEnabled: qrEnabled === "true",
            },
            misc: {
                isPromotionsEnabled: !isPromotionsEnabled ? true : isPromotionsEnabled === "true",
                isCustomAlertEnabled: !isCustomAlertEnabled
                    ? null
                    : isCustomAlertEnabled === "true",
                isNotificationVisited: isNotificationVisited === "true",
                welcomeMessageAddedDate: welcomeMessageAddedDate === "true",
                welcomeMessageDeletedDate: welcomeMessageDeletedDate === "true",
                welcomeMessageSeenDate: welcomeMessageSeenDate === "true",
                supsonic: supOn === "true",
            },
            wallet: {
                showBalance: !walletShowBalance ? true : walletShowBalance === "true",
                showBalanceDashboard: JSON.parse(showBalanceDashboard),
            },
            fnb: { fnbCurrLocation: (fnbCurrLocation && JSON.parse(fnbCurrLocation)) || {} },
            ssl: {
                cartV1: cartV1 && JSON.parse(cartV1),
                locationHistoryArrV1:
                    (locationHistoryArrV1 && JSON.parse(locationHistoryArrV1)) || [],
                currSelectedLocationV1:
                    (currSelectedLocationV1 && JSON.parse(currSelectedLocationV1)) || {},
            },
        });
        this.screenLockCheck();
        console.log("Load V4 data ::: ");
        s2uV4load(s2uOta, getModel, updateModel);
        this._handleNavigation(isOnboardCompleted === "true");
    };

    screenLockCheck = async () => {
        const { getModel, resetModel } = this.props;
        const { isEnabled: isOtaEnabled, deviceId: otaDeviceId } = getModel("ota");

        this.checkBiometricsAvailable();

        if (isOtaEnabled) {
            const isPinOrFingerprintSet = await DeviceInfo.isPinOrFingerprintSet();

            if (!isPinOrFingerprintSet) {
                const { deviceId } = getModel("device");
                const { mdipS2uEnable } = getModel("s2uIntrops");
                const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/deRegister`; //s2u interops changes call v2 url when MDIP migrated
                const result = await unregisterS2uOta(otaDeviceId, deviceId, subUrl);

                if (result) {
                    await AsyncStorage.multiRemove([
                        "isOtaEnabled",
                        "mdipCounter",
                        "SEC2U_MDIP_COUNTER",
                        "otaHotp",
                        "otaTotp",
                        "deviceKeys",
                        "serverPublicKey",
                        "otaDeviceId",
                    ]);

                    // clear the context
                    resetModel(["ota"]);
                }
            }
        }
    };

    _handleNavigation = async (isOnboardCompleted) => {
        const { isRootedDevice, isThirdPartyKeyboard, isS2uAuth } = this.state;
        if (isRootedDevice || isThirdPartyKeyboard) {
            return;
        }
        const skipIntro = this.props.route.params?.skipIntro;
        const emptyState = this.props.route.params?.emptyState ?? false;
        const sessionTimeout = this.props.route.params?.sessionTimeout ?? false;
        const ssoPopup = this.props.route.params?.ssoPopup ?? false;
        const suspendOrLockedPopup = this.props.route.params?.suspendOrLockedPopup ?? false;
        const suspendOrLockedTitle = this.props.route.params?.suspendOrLockedTitle ?? "";
        const suspendOrLockedMessage = this.props.route.params?.suspendOrLockedMessage ?? "";
        const tagBlockPopup = this.props.route.params?.tagBlockPopup ?? false;
        const deactivatedAccountPopup = this.props.route.params?.deactivatedAccountPopup ?? false;
        const rsaLockedPopup = this.props.route.params?.rsaLockedPopup ?? false;
        const {
            pushNotification: { isMarketingPush, marketingData },
            ui: { notificationControllerNavigation },
        } = this.props.getModel(["pushNotification", "ui"]);
        const appEnv = this.props.route.params?.appEnv;
        this.props.updateModel({
            moduleLoader: {
                shouldLoadOnboardingModule: true,
                shouldLoadOtherModule: true,
            },
        });

        // clear params, if any
        this.props.navigation.setParams({
            rsaLocked: false,
            skipIntro: null,
            sessionTimeout: false,
            unregisterPns: false,
            mobileNumber: null,
            deviceId: null,
            fcmToken: null,
        });

        if (sessionTimeout) {
            this.props.updateModel({
                ui: {
                    sessionTimeoutPopup: isS2uAuth ? false : true,
                },
            });
        }
        if (emptyState) {
            // copy any info from misc first if needed
            const {
                misc: {
                    isCampaignPeriod,
                    isReferralCampaign,
                    isZakatReady,
                    isFestivalReady,
                    isDonationReady,
                    appVersion,
                    specialOccasionData,
                    gameMetadata,
                    snEnabled,
                    isTapTasticReady,
                    tapTasticType,
                    isNewTapTasticReady,
                    propertyMetadata,
                    atmCashOutReady,
                    m2uDeletion,
                    showFestiveSendMoney,
                    cardStatement,
                    isReprintReceiptReady,
                    isShowSecureSwitch,
                    isSecureSwitchCampaign,
                    isSecureSwitchS2UBypass,
                    isShowBlockCard,
                    isShowSuspendCASA,
                    isShowBlockDebitCard,
                    isContactBlacklistingValidation,
                    isCardUnsettledTxnHistory,
                    isDisablePNSCall,
                    isNotificationCenterReady,
                    isS2uV4Flag,
                    isS2uV4ToastFlag,
                    isZoloz,
                    isForceS2uReady,
                },
                s2w: { txnTypeList },
                s2uIntrops: { mdipS2uEnable },
                autoTopup: { autoTopupEnable },
                ccBTEZY: { btEnable, ezyPayEnable },
                cardsStp: { ccEnable, ccSuppEnable },
                ssl: {
                    sslPrompterUrl,
                    sslL2CategoriesUrl,
                    sslPromoCategoriesUrl,
                    sslReady,
                    sandboxUrl,
                    geolocationUrl,
                },
                myGroserReady,
                partnerMerchants,
                financialGoal: { showFinancialGoal },
                cloud: { cmsUrl, cmsCloudEnabled },
                wallet: { isUpdateBalanceEnabled },
            } = this.props.getModel([
                "misc",
                "s2w",
                "s2uIntrops",
                "autoTopup",
                "ccBTEZY",
                "cardsStp",
                "ssl",
                "myGroserReady",
                "partnerMerchants",
                "financialGoal",
                "cloud",
                "wallet",
            ]);

            this.props.resetModel(null, ["ui", "device", "moduleLoader", "appSession"]);

            this.props.updateModel({
                misc: {
                    isCampaignPeriod,
                    isZakatReady,
                    isFestivalReady,
                    isDonationReady,
                    appVersion,
                    specialOccasionData,
                    isReferralCampaign,
                    gameMetadata,
                    snEnabled,
                    isTapTasticReady,
                    tapTasticType,
                    isNewTapTasticReady,
                    propertyMetadata,
                    atmCashOutReady,
                    m2uDeletion,
                    showFestiveSendMoney,
                    cardStatement,
                    isReprintReceiptReady,
                    isShowSecureSwitch,
                    isSecureSwitchCampaign,
                    isSecureSwitchS2UBypass,
                    isShowBlockCard,
                    isShowSuspendCASA,
                    isShowBlockDebitCard,
                    isContactBlacklistingValidation,
                    isCardUnsettledTxnHistory,
                    isDisablePNSCall,
                    isNotificationCenterReady,
                    isS2uV4Flag,
                    isS2uV4ToastFlag,
                    isZoloz,
                    isForceS2uReady,
                },
                s2w: { txnTypeList },
                s2uIntrops: { mdipS2uEnable },
                autoTopup: { autoTopupEnable },
                ccBTEZY: { btEnable, ezyPayEnable },
                cardsStp: { ccEnable, ccSuppEnable },
                ui: {
                    ssoPopup,
                    suspendOrLockedPopup,
                    suspendOrLockedTitle,
                    suspendOrLockedMessage,
                    tagBlockPopup,
                    rsaLockedPopup,
                    deactivatedAccountPopup,
                    sessionTimeoutPopup: false,
                },
                ssl: {
                    sslPrompterUrl,
                    sslL2CategoriesUrl,
                    sslPromoCategoriesUrl,
                    sslReady,
                    sandboxUrl,
                    geolocationUrl,
                },
                myGroserReady,
                partnerMerchants,
                financialGoal: {
                    showFinancialGoal,
                },
                cloud: {
                    cmsUrl,
                    cmsCloudEnabled,
                },
                wallet: { isUpdateBalanceEnabled },
            });
        }

        if (appEnv) {
            saveAppEnv(appEnv);
        }
        this.setState(
            {
                preloadError: false,
                isS2uAuth: false,
            },
            () => {
                if (!isOnboardCompleted && !skipIntro) {
                    this.props.navigation.navigate("OnboardingIntro");
                } else if (isOnboardCompleted && isMarketingPush) {
                    /*
                    Marketing Push structure change
                    - Added Extra stack navigation to show the marketing push before Token load
                    - After onBoarding and FCM event check to have marketing push then it will come to this loop
                    */
                    this.props.navigation.navigate("ExternalPnsPromotion", {
                        data: marketingData,
                        moduleFrom: "Marketing",
                    });
                } else if (
                    isOnboardCompleted &&
                    notificationControllerNavigation?.screen ===
                        navigationConstant.SECURE2U_DETAIL_SCREEN &&
                    notificationControllerNavigation?.appState === "killState"
                ) {
                    /*
                        -s2u push notification not going to dashboard but own s2u
                    */
                    this.props.navigation.navigate(notificationControllerNavigation.stack, {
                        screen: notificationControllerNavigation.screen,
                        params: {
                            ...notificationControllerNavigation?.params,
                            appState: "killState",
                        },
                    });
                } else {
                    this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                        screen: "Tab",
                        params: {
                            screen: "Dashboard",
                        },
                    });
                }
            }
        );
    };

    checkBiometricsAvailable = async () => {
        const { updateModel } = this.props;
        const biometricEnabled = await AsyncStorage.getItem("biometricEnabled");
        const { available, biometryType } = await Biometrics.isSensorAvailable();

        if (available) {
            updateModel({
                auth: {
                    biometricEnabled: biometricEnabled === "true",
                },
                device: {
                    isBiometricAvailable: true,
                    biometricType: biometryType, // face id, touch id and biometrics (android)
                },
            });
        } else {
            if (biometricEnabled) {
                await AsyncStorage.removeItem("biometricEnabled");
            }

            updateModel({
                auth: {
                    biometricEnabled: false,
                },
                device: {
                    isBiometricAvailable: false,
                    biometricType: null,
                },
            });
        }
    };

    handleRetryPreload = () => {
        if (this.state.errorTitle) {
            this.setState(
                {
                    preloadError: false,
                    errorTitle: "",
                    errorDescription: "",
                },
                () => this._handleNavigation(false)
            );
        } else {
            this.setState(
                {
                    preloadError: false,
                },
                () => this.requestPreloadToken()
            );
        }
    };

    _onSubmitPressed = () => {
        RNExitApp.exitApp();
    };

    handleHuaweiNotificationMessages = async () => {
        const { updateModel, getModel } = this.props;
        const { mdipS2uEnable, s2uNotificationPayload, pushReceived } = getModel("s2uIntrops");
        let appState = "";
        try {
            this.huaweiNotificationListener = HmsPushEvent.onNotificationOpenedApp((payload) => {
                try {
                    console.log(
                        "[SplashScreen] >> [handleHuaweiNotificationMessages] onNotificationOpenedApp payload: ",
                        JSON.stringify(payload)
                    );

                    const values = Object.values(payload);
                    const hasNotification = values[0].notification; //TODO: Check for a better way to do this
                    const payloadData = hasNotification
                        ? { data: JSON.parse(payload.extras.notification.data) }
                        : { data: payload.extras };
                    notificationController(payloadData, updateModel, getModel);
                } catch (error) {
                    console.tron.log("on Tap error : ", error);
                }
            });

            this.huaweiDataMessageListener = HmsPushEvent.onRemoteMessageReceived((payload) => {
                console.log(
                    "[SplashScreen] >> [handleHuaweiNotificationMessages] onRemoteMessageReceived payload: ",
                    JSON.stringify(payload)
                );
                const remoteMessage = new RNRemoteMessage(payload.msg);
                const { notif_title, full_desc, template_id } = JSON.parse(remoteMessage.getData());

                //s2u push will automatically open instead of alert notification
                if (template_id.toString() === "0") {
                    const data = { data: JSON.parse(remoteMessage.getData()) };
                    notificationController(data, updateModel, getModel);
                } else {
                    createLocalNotification(notif_title, full_desc, remoteMessage);
                }
            });
        } catch (error) {
            console.tron.log(" Remote message Error Occured : ", error);
        }

        //to handle notifications when the app is killed
        try {
            const initialNotification = await HmsPushMessaging.getInitialNotification();
            console.log("KILLED", initialNotification.result.extras);
            appState = "killState";

            if (Object.keys(initialNotification.result).length !== 0) {
                //let data = { data: initialNotification.result.extras };
                const temp = initialNotification.result.extras;

                const data = temp?.notification
                    ? {
                          data: JSON.parse(initialNotification.result.extras.notification.data),
                      }
                    : { data: initialNotification.result.extras };
                console.log("LOG", data);
                notificationController(data, updateModel, getModel, appState);
            }
        } catch (error) {
            console.tron.log("getInitialNotification Error Occured : ", error);
        }

        if (mdipS2uEnable && pushReceived && s2uNotificationPayload) {
            notificationController(s2uNotificationPayload.notification, updateModel, getModel);
        }
    };

    setCtaData = (data) => {
        /*
        Marketing Push structure change
        - set the CTA data into context
        */
        const pushNotification = this.props.getModel("pushNotification");
        this.props.updateModel({
            pushNotification: { ...pushNotification, ctaData: data },
        });
    };

    registerNotificationListener = async () => {
        const { updateModel, getModel } = this.props;
        const { mdipS2uEnable, s2uNotificationPayload, pushReceived } = getModel("s2uIntrops");

        let appState = "";
        if (isPureHuawei) {
            await this.handleHuaweiNotificationMessages();
        } else {
            // All listeners below is when user tap / app receive push notification

            /**
             * App Kill -> App Launch
             */
            let openedNotification = null;
            if (Platform.OS === "ios") {
                openedNotification = await messaging().getInitialNotification();
                console.log("ios getInitialNotification", openedNotification);
            } else {
                openedNotification = await notifee.getInitialNotification();
                console.log("android notifee getInitialNotification", openedNotification);
                openedNotification = openedNotification?.notification;
            }
            if (openedNotification) {
                if (Platform.OS === "ios") this.hidePopup();
                appState = "killState";
                console.log(
                    "SplashScreen PN: Killed -> Launched via Push notification on tap",
                    openedNotification
                );
                notificationController(
                    openedNotification,
                    updateModel,
                    this.props.getModel,
                    appState
                );
            }

            /**
             * App receives push notification
             * App foreground -> create a local notification
             */
            this.messageListener = messaging().onMessage(async (message) => {
                console.tron.log("SplashScreen PN: Foreground -> receive push", message);
                console.tron.log("foreground", message);
                if (Platform.OS === "ios") this.hidePopup();
                const { notif_title, full_desc, template_id } = message.data;
                //s2u push will automatically open instead of alert notification
                if (template_id.toString() === "0") {
                    notificationController(message, updateModel, this.props.getModel);
                } else {
                    await createLocalNotification(notif_title, full_desc, message.data);
                }
            });

            // Notifee's foreground -> foreground onTap local notification
            this.notifeeForegroundListener = notifee.onForegroundEvent((data) => {
                const { type, detail } = data;
                console.log("SplashScreen PN: waiting for tap", data, type, detail);
                if (type === EventType.PRESS && detail?.notification?.id) {
                    console.log(
                        "SplashScreen PN: Foreground -> on tap local notification",
                        data,
                        type,
                        detail
                    );
                    notificationController(detail.notification, updateModel, this.props.getModel);
                }
            });

            /**
             * App background -> App Foreground
             * User tap push notification
             */
            if (Platform.OS === "ios") {
                this.bgMessageListener = messaging().onNotificationOpenedApp((message) => {
                    console.log(
                        "SplashScreen PN: iOS on tap push background to foreground",
                        message
                    );
                    this.hidePopup();
                    notificationController(message, updateModel, this.props.getModel);
                });
            } else {
                // Notifee's background -> foreground onTap local notification. See index.js setBackgroundMessageHandler
                this.bgMessageListener = notifee.onBackgroundEvent(async (data) => {
                    const { type, detail } = data;
                    console.log(
                        "SplashScreen PN: Android on tap push background to foreground",
                        type,
                        detail
                    );
                    if (type === EventType.PRESS) {
                        notificationController(
                            detail.notification,
                            updateModel,
                            this.props.getModel
                        );
                    }
                });
            }

            if (mdipS2uEnable && pushReceived && s2uNotificationPayload) {
                if (Platform.OS === "ios") this.hidePopup();
                notificationController(
                    s2uNotificationPayload.notification,
                    updateModel,
                    this.props.getModel
                );
            }
        }
    };

    hidePopup = () => {
        closeContactPicker();
        this.setState({ isS2uAuth: true });
    };

    render() {
        const { preloadError, errorTitle, errorDescription } = this.state;

        return (
            <>
                <ScreenLoader showLoader />
                <Popup
                    visible={preloadError}
                    title={errorTitle ? errorTitle : "Be Right Back!"}
                    description={errorDescription ? errorDescription : Strings.SERVER_OTHER_ERROR}
                    onClose={this.handleRetryPreload}
                    primaryAction={{
                        text: preloadError ? "Try again" : "Got it",
                        onPress: this.handleRetryPreload,
                    }}
                />
                <Popup
                    visible={this.state.isRootedDevice}
                    title="Oh no!"
                    description={
                        Platform.OS === "ios"
                            ? Strings.DEVICE_IS_JAILBREAK
                            : Strings.DEVICE_IS_ROOTED
                    }
                    onClose={this._onSubmitPressed}
                    primaryAction={{
                        text: "Okay",
                        onPress: this._onSubmitPressed,
                    }}
                />

                <Popup
                    visible={this.state.isThirdPartyKeyboard}
                    title="Oh no!"
                    description={Strings.THIRD_PARTY_KEYBOARD}
                    onClose={this._onSubmitPressed}
                    primaryAction={{
                        text: "Okay",
                        onPress: this._onSubmitPressed,
                    }}
                />
            </>
        );
    }
}

function SplashScreen(props) {
    const { errorLogger } = useErrorLog();

    return <SplashScreenRoot errorLogger={errorLogger} {...props} />;
}

export default withApi(withModelContext(SplashScreen));

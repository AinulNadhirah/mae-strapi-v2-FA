import HMSLocation from "@hmscore/react-native-hms-location";
import { HmsPushEvent } from "@hmscore/react-native-hms-push";
import AsyncStorage from "@react-native-community/async-storage";
import "@react-native-firebase/analytics";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/dynamic-links";
import messaging from "@react-native-firebase/messaging";
import "@react-native-firebase/perf";
import { NavigationContainer } from "@react-navigation/native";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useRef } from "react";
import {
    StatusBar,
    StyleSheet,
    Platform,
    BackHandler,
    AppState,
    Linking,
    View,
} from "react-native";
import Config from "react-native-config";
import RNExitApp from "react-native-exit-app";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView, State, TapGestureHandler } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import SoftInputMode from "react-native-set-soft-input-mode";

import {
    FORGOT_PINSCREEN,
    SETTINGS_MODULE,
    MAE_MODULE_STACK,
    MAE_REUPLOAD,
    MAE_ADDRESS_ENTRY_SCREEN,
    DASHBOARD,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    FORGOT_LOGIN_DETAILS,
} from "@navigation/navigationConstant";
import NavigationService, { navigationRef, isMountedRef } from "@navigation/navigationService";
import Router from "@navigation/routes";

import M2uLogin from "@components/Auth/M2uLogin";
import TouchIdLogin from "@components/Auth/TouchIdLogin";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import { LogGesture } from "@components/NetworkLog";
import Popup from "@components/Popup";
import Toast, { showErrorToast } from "@components/Toast";

import { INITIAL_MODEL, ModelProvider, useModelController } from "@context";

import { unregisterM2U } from "@services";
import ApiManager from "@services/ApiManager";
import ApiManagerSSO from "@services/ApiManagerSSO";
import UserActivity from "@services/UserActivity";
import { logEvent } from "@services/analytics";
import { clearAll } from "@services/localStorage";
import { registerPushNotification, unregisterPushNotification } from "@services/pushNotifications";

import {
    DEVICE_IS_ROOTED,
    DEVICE_IS_JAILBREAK,
    FORGOT_PIN,
    FRGT_LOGIN_PWD,
    EKYC_REUPLOAD,
    EKYC_UPDATE,
    LOGIN_CANCELLED,
    LOGIN_FAILED,
    LOGIN_RSA_DENY,
    SECURE_STORAGE_ERROR_TITLE,
    SECURE_STORAGE_ERROR_MSG,
    SECURE_STORAGE_ERROR_PRIMARY_BTN,
    SECURE_STORAGE_ERROR_SECONDARY_BTN,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_DEVICE_SIGNOUT,
    FA_SESSION_EXPIRED,
    FA_LOGIN,
    FA_METHOD,
    FA_PASSWORD,
    TRY_AGAIN,
    QUIT,
    FAILED_AUTH,
    GOT_IT,
    MAE_SECURE2U_DESC,
    MAE_SECURE2U_HEADER,
    QUIT_APP_DESC,
    QUIT_APP_HEADER,
    YES,
    NO,
    SESSION_EXPIRED_DESC,
    SESSION_EXPIRED_HEADER,
    OKAY,
    APP_UPDATE_REQUIRED,
    APP_UPDATE_AVAILABLE,
    UPDATE_NOW,
    DEVICE_SIGNED_OUT_DESC,
    DEVICE_SIGNED_OUT_TITLE,
    CALL_US,
    CALL_NOW,
    VERIFICATION_UNSUCCESSFUL,
    ACCOUNT_SUSPENDED,
    CONTACT_BANK,
    ACCOUNT_LOCKED,
    ACCOUNT_GOT_IT,
    DONE,
    M2U_ACCESS_TEMP_DEACTIVATED,
    SIGN_IN_TO_ACCOUNT_AGAIN,
    TO_REACTIVATE_M2U_ACCESS,
    UNBLOCK_TAC,
    YOUR_TAC_BLOCKED,
    YOU_HAVE_BEEN_SIGNED_OUT,
    UNABLE_TO_UNLINK,
    RESET_PASSWORD_LBL,
} from "@constants/strings";

import { generateHaptic } from "@utils";
import { isPureHuawei } from "@utils/checkHMSAvailability";
import { contactBankcall, updateS2UToken, getLinkParams } from "@utils/dataModel/utility";
import { removeLocalStorage } from "@utils/dataModel/utilityPartial.4";
import { handleErrorUnlinkM2U } from "@utils/dataModel/utilityPartial.6";
import { removeCustomerKey } from "@utils/dataModel/utilitySecureStorage";
import { EventLogProvider, interceptJSException, LogStart, simpleId } from "@utils/logs";
import { S2uNacl } from "@utils/s2usdk/s2uNacl";

import {
    MISSING_USERNAME,
    MISSING_USERNAME_ERR_TITLE,
    PLEASE_RETRY_UNLINK_ERROR_MESSAGE,
    UNLINK_M2U_CTA,
} from "./src/constants/strings";
import { checkSimulator } from "./src/utilities";

/*if (Config?.DEV_ENABLE === "true" || Config?.LOG_RESPONSE_REQUEST === "true") {
    // console.disableYellowBox = true;
    // Remove sentry for Prod Env, Only available for DEV
    Sentry.init({
        dsn: "https://805345a011bc49ef8003b16ce8d00f0b@o874787.ingest.sentry.io/5825155",
        environment: Config.ENV_FLAG || "development",
        // release: `mae@${DeviceInfo.getReadableVersion()}`,
        // dist: DeviceInfo.getBuildNumber(),
    });
}*/

if (__DEV__) {
    import("./src/config/reactotronConfig").then(() => console.log("Reactotron Configured"));
}

const Preloader = ({ isVisible }) => <ScreenLoader showLoader={isVisible} />;

Preloader.propTypes = {
    isVisible: PropTypes.bool,
};

async function handleErrorDispatch(error, isFatal, prevHandler) {
    prevHandler(error, isFatal);

    const timestamp = Date.now();
    const entry = {
        id: simpleId(),
        name: "global_js_error_logger",
        value: {
            name: error?.name,
            message: error?.message,
            isFatal,
        },
        timestamp,
        isFatal,
    };

    global.errorLogs = [entry, ...global.errorLogs];

    // get the current logs
    const localLogs = await AsyncStorage.getItem("eventLogs");
    const parseLogs = localLogs ? JSON.parse(localLogs) : [];
    const mergedEvents = [...parseLogs, entry];
    const sortedEvents = _.orderBy(mergedEvents, ["timestamp"], ["desc"]);

    await AsyncStorage.setItem("eventLogs", JSON.stringify(sortedEvents));
}

if (Config?.DEV_ENABLE === "true" || Config?.LOG_RESPONSE_REQUEST === "true") {
    // error for event log
    global.errorLogs = [];

    interceptJSException(handleErrorDispatch, true);
}

class AppRoot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            idleManagerStarted: false,
            isJailBroken: false,
            sessionExpired: false,
            showQuitPopup: false,
            showS2uDeregPopup: false,
        };
        this.toastRef = {};

        // this.fcmTokenChanges = null;
    }

    static propTypes = {
        navigation: PropTypes.object,
        controller: PropTypes.object,
    };

    async componentDidMount() {
        this.initHmsLocation();
        this.initAPNSToken();

        isMountedRef.current = true;

        this.setInputMode();

        AppState.addEventListener("change", async (nextAppState) => {
            if (nextAppState === "active") this.setInputMode();
        });

        if (isPureHuawei) {
            const AgcAppLinking = require("@react-native-agconnect/applinking").default;
            AgcAppLinking.getAGConnectAppLinkingResolvedLinkData()
                .then((result) => {
                    console.log(
                        "[getAGConnectAppLinkingResolvedLinkData] " + JSON.stringify(result)
                    );
                    this.handleDynamicLink(result?.deepLink);
                })
                .catch((err) => {
                    console.log(
                        "[getAGConnectAppLinkingResolvedLinkData] Error/Exception: " +
                            JSON.stringify(err)
                    );
                });
        } else {
            const links = await firebase.dynamicLinks();

            /** Dynamic Linking */
            //Background/Quit events
            links.getInitialLink().then((link) => {
                link?.url && this.handleDynamicLink(link.url);
            });

            //Foreground events
            links.onLink((link) => {
                link?.url && this.handleDynamicLink(link.url);
            });
        }

        /** Dynamic Linking */

        /** DeepLinking Start (Only for SamaSamaLokal)*/
        // Launch event
        const initialUrl = await Linking.getInitialURL();
        initialUrl && this.handleSSLDeepLinking(initialUrl);

        // Background/Foreground events
        Linking.addEventListener("url", (obj) => {
            obj?.url && this.handleSSLDeepLinking(obj.url);
        });
        /** DeepLinking End */

        this.generateTraceId();
    }

    initHmsLocation = async () => {
        // Initialize Location Kit
        try {
            const init = await HMSLocation.LocationKit.Native.init();
            if (init) {
                console.tron.log("Done initializing HMS location kit");
            }
        } catch (error) {
            console.tron.log("Error when initializing HMS location kit", error);
        }
    };

    initAPNSToken = async () => {
        const isSimulator = await checkSimulator();
        if (__DEV__ && isSimulator && Platform.OS === "ios") {
            await messaging().setAPNSToken("MAE", "sandbox");
        }
    };

    handleSSLDeepLinking = (link) => {
        console.log("handleSSLDeepLinking", link);
        // m2ulife://m2usamasama
        // m2ulife://m2usamasama?cid=16
        // m2ulife://m2usamasama?mid=MBUAT1205391
        // m2ulife://m2usamasama?mid=MBUAT1205391&pid=MKPRD1000734
        const validDeeplinkUrl =
            !link ||
            (link && !(String(link).includes("m2usamasama") || String(link).includes("atm")));
        if (validDeeplinkUrl) return;

        const deepLinkParams = getLinkParams({ link });
        deepLinkParams.module = link.includes("m2usamasama") ? "m2usamasama" : "atm";
        const { updateModel } = this.props.controller;
        updateModel({
            deeplink: {
                url: link,
                params: deepLinkParams,
            },
        });
    };

    handleDynamicLink = (link) => {
        if (link === "https://www.maybank2u.com.my") {
            console.log(link);
        }

        if (!link) return;

        const deepLinkParams = getLinkParams({ link });
        const { updateModel } = this.props.controller;
        // Capture deeplink details and store it in Context
        updateModel({
            deeplink: {
                url: link,
                params: deepLinkParams,
            },
        });

        console.log("[App][handleDynamicLink] >> Deep Link: ", link, " | Params: ", deepLinkParams);
    };

    componentWillUnmount() {
        isMountedRef.current = false;

        // clear notification listener
        // this.fcmTokenChanges();
    }

    setInputMode = () => {
        // set input mode on android dynamically
        if (Platform.OS === "android") SoftInputMode.set(SoftInputMode.ADJUST_PAN);
    };

    updateTokenChanges = async (token) => {
        console.log("updateTokenChanges");
        const isOnboardCompleted = await AsyncStorage.getItem("isOnboardCompleted");
        const isOtaEnabled = await AsyncStorage.getItem("isOtaEnabled");

        // we only want to update when user have onboarded
        if (isOnboardCompleted === "true") {
            this.updatePNSToken(token);
        }
        //when user have s2u, update FCM token
        if (isOtaEnabled === "true") {
            updateS2UToken(token);
        }
    };

    updatePNSToken = async (token) => {
        const { getModel, updateModel } = this.props.controller;
        const {
            auth: { fcmToken },
            user: { mobileNumber },
            device: { deviceId },
            misc: { isPromotionsEnabled },
        } = getModel(["auth", "user", "device", "misc"]);

        const osFCMToken =
            Platform.OS === "ios" && !fcmToken ? await AsyncStorage.getItem("fcmToken") : fcmToken;
        console.tron.log(`Received token changes from ${osFCMToken} to ${token}`);
        try {
            if (token && osFCMToken && mobileNumber && deviceId) {
                const notifyType = isPromotionsEnabled ? "A" : "T";

                // just unregister and register pns
                await unregisterPushNotification(mobileNumber, deviceId, osFCMToken, notifyType);
                await registerPushNotification(mobileNumber, deviceId, token, notifyType);

                AsyncStorage.setItem("fcmToken", token);

                // update context
                updateModel({
                    auth: {
                        fcmToken: token,
                    },
                });
            } else {
                throw new Error();
            }
        } catch (error) {
            // if its not able to unregsister/register, lets clear the token from storage, so next run we
            // will able to try to register it again
            if ((Platform.OS === "ios" && token !== osFCMToken) || Platform.OS === "android") {
                AsyncStorage.removeItem("fcmToken");
            }
        }
    };

    handleCancelQuit = () => {
        const { updateModel } = this.props.controller;

        updateModel({
            ui: {
                showQuitPopup: false,
            },
        });
    };

    handleQuitApp = () => {
        Platform.OS === "ios" ? RNExitApp.exitApp() : BackHandler.exitApp();
    };

    handleCancelS2U = () => {
        const { updateModel } = this.props.controller;

        updateModel({
            ui: {
                showS2uDeregPopup: false,
                missingUsernamePopup: false,
            },
        });

        //DeRegister RMBP silently- Pass M2U app id
        unregisterM2U();
    };

    updateRootedStatus = (isJailBroken) => {
        this.setState({ isJailBroken });
    };

    onErrorMessageDismissed = () => {
        if (this.state.isJailBroken) {
            RNExitApp.exitApp();
        }
    };

    handleSessionExpired = () => {
        this.props.controller.updateModel({
            ui: {
                sessionTimeoutPopup: false,
            },
        });

        ApiManager.killQueue();
    };

    handleIdleTimeout = async () => {
        const { getModel, updateModel } = this.props.controller;
        const { isPostLogin } = getModel("auth");
        const {
            ssoPopup,
            suspendOrLockedPopup,
            tagBlockPopup,
            rsaLockedPopup,
            deactivatedAccountPopup,
        } = getModel("ui");
        const { mdipS2uEnable } = getModel("s2uIntrops");

        if (isPostLogin) {
            updateModel({
                auth: {
                    isPostLogin: false,
                    isPostPassword: false,
                    isSessionTimeout: true,
                },
                qrPay: {
                    authenticated: false,
                },
                ui: {
                    m2uLogin: false,
                    touchId: false,
                    onCancelLogin: null,
                },
                property: {
                    isConsentGiven: false,
                    JAAcceptance: false,
                },
            });

            //added for s2u interops in sessiontimeout scenario where holding data to display after token refresh
            if (mdipS2uEnable) {
                if (isPureHuawei) {
                    this.huaweiNotificationListener = await HmsPushEvent.onNotificationOpenedApp(
                        (payload) => {
                            updateModel({
                                s2uIntrops: {
                                    s2uNotificationPayload: payload,
                                    pushReceived: true,
                                },
                            });
                        }
                    );
                } else {
                    messaging().onNotificationOpenedApp((payload) => {
                        updateModel({
                            s2uIntrops: {
                                s2uNotificationPayload: payload,
                                pushReceived: true,
                            },
                        });
                    });
                }
            }

            NavigationService.resetAndNavigateToModule("Splashscreen", "", {
                skipIntro: true,
                sessionTimeout:
                    !ssoPopup &&
                    !suspendOrLockedPopup &&
                    !tagBlockPopup &&
                    !rsaLockedPopup &&
                    !deactivatedAccountPopup,
            });
        }
    };

    resumeMaeReupload = (data) => {
        const { ic_number, resident_country } = data;
        const entryParams = {
            screen: "Dashboard",
            params: { refresh: true },
        };

        NavigationService.navigateToModule(MAE_MODULE_STACK, MAE_REUPLOAD, {
            ic_number,
            resident_country,
            entryStack: "TabNavigator",
            entryScreen: "Tab",
            entryParams,
        });
    };

    resumeMaeAddressUpdate = (data) => {
        const entryParams = {
            screen: "Dashboard",
            params: { refresh: true },
        };

        const filledUserDetails = {
            entryStack: "TabNavigator",
            entryScreen: "Tab",
            entryParams,
            from: "updateDetails",
            loginData: data,
        };

        NavigationService.navigateToModule(MAE_MODULE_STACK, MAE_ADDRESS_ENTRY_SCREEN, {
            filledUserDetails,
        });
    };

    onLoginSuccess = (data) => {
        const { onLogicSuccess } = this.props.controller.getModel("ui");
        logEvent(FA_LOGIN, {
            [FA_METHOD]: FA_PASSWORD,
        });
        this.props.controller.updateModel({
            ui: {
                m2uLogin: false,
                touchId: false,
            },
            auth: {
                isPostLogin: true,
                lastSuccessfull: new Date(),
            },
        });

        if (data?.ekyc_status === "03") {
            this.resumeMaeReupload(data);
            ApiManager.callQueue(EKYC_REUPLOAD);
        } else if (
            (data?.ekyc_status === "00" ||
                data?.ekyc_status === "01" ||
                (data?.resumeStageInd && data?.resumeStageInd != "2") ||
                (data?.rsaIndicator && data?.rsaIndicator != "2")) &&
            data?.cus_type === "10"
        ) {
            this.resumeMaeAddressUpdate(data);
            ApiManager.callQueue(EKYC_UPDATE);
        } else {
            ApiManager.callQueue();

            if (onLogicSuccess && typeof onLogicSuccess === "function") {
                this.props.controller.updateModel({
                    ui: {
                        onLogicSuccess: null,
                    },
                });

                onLogicSuccess();
            }
        }
    };

    onLoginFailed = () => {
        ApiManager.callQueue(LOGIN_FAILED);
    };

    onLoginCancelled = (reason, error) => {
        const { onCancelLogin } = this.props.controller.getModel("ui");

        ApiManager.callQueue(LOGIN_CANCELLED);

        this.props.controller.updateModel({
            ui: {
                m2uLogin: false,
                touchId: false,
            },
        });

        // if provided, manually control the ui
        if (onCancelLogin && typeof onCancelLogin === "function") {
            this.props.controller.updateModel({
                ui: {
                    onCancelLogin: null,
                },
            });
            onCancelLogin();
        }

        /**
         * Handle RSA deny from m2u login
         */
        if (reason === LOGIN_RSA_DENY) {
            const { statusDescription, serverDate } = error;
            const params = {
                statusDescription,
                additionalStatusDescription: "",
                serverDate,
                nextParams: { screen: DASHBOARD },
                nextModule: TAB_NAVIGATOR,
                nextScreen: "Tab",
            };
            NavigationService.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params,
            });
        } else if (reason === FORGOT_PIN) {
            // delay to make sure race condition
            this.delay = setTimeout(() => {
                NavigationService.navigateToModule(SETTINGS_MODULE, FORGOT_PINSCREEN);
            }, 0);
        } else if (reason === FRGT_LOGIN_PWD) {
            // delay to make sure race condition
            this.delay = setTimeout(() => {
                NavigationService.navigate("Onboarding", { screen: FORGOT_LOGIN_DETAILS });
            }, 0);
        } else if (reason === MISSING_USERNAME) {
            console.log("Missing username handling");
            this.props.controller.updateModel({
                ui: {
                    missingUsernamePopup: true,
                },
            });
        }
    };

    handleGeneralErrorPrimaryCTA = (CTA = "") => {
        this.props.controller.updateModel({
            ui: {
                ssoPopup: false,
                rsaLockedPopup: false,
                suspendOrLockedPopup: false,
                suspendOrLockedTitle: "",
                suspendOrLockedMessage: "",
                generalErrorPopup: false,
                missingUsernamePopup: false,
            },
            moduleLoader: {
                shouldLoadOnboardingModule: true,
                shouldLoadOtherModule: true,
            },
        });
        if (CTA === RESET_PASSWORD_LBL) {
            NavigationService.navigate("Onboarding", {
                screen: FORGOT_LOGIN_DETAILS,
                params: { hideBackButton: true, isFromLdapLock: true },
            });
        } else {
            NavigationService.resetAndNavigateToModule("Splashscreen", "");
        }
    };

    handleUnlink = async () => {
        try {
            await handleErrorUnlinkM2U(this.props.controller);
        } catch (error) {
            showErrorToast({ message: UNABLE_TO_UNLINK });
        }
    };

    handleSsoReset = () => {
        // reset everything except for device details
        this.props.controller.updateModel({
            ui: {
                ssoPopup: false,
                rsaLockedPopup: false,
                suspendOrLockedPopup: false,
                suspendOrLockedTitle: "",
                suspendOrLockedMessage: "",
            },
            moduleLoader: {
                shouldLoadOnboardingModule: true,
                shouldLoadOtherModule: true,
            },
        });

        clearAll();
        removeCustomerKey();

        this.setState({
            idleManagerStarted: false,
        });
    };

    handleSsoToDashboard = () => {
        this.handleSsoReset();
    };

    handleSsoOnboard = () => {
        this.handleSsoReset();

        NavigationService.navigate("Onboarding");
    };

    handleSsoNotYou = () => {
        contactBankcall("1300886688");
        this.handleSsoReset();
    };

    handleTagblockCallNow = () => {
        contactBankcall("1300886688");
        this.handleTagblockClose();
    };

    handleTagblockClose = () => {
        this.props.controller.updateModel({
            ui: {
                tagBlockPopup: false,
                suspendOrLockedTitle: "",
                suspendOrLockedMessage: "",
            },
        });
    };

    handleDeactivatedAccountClose = async () => {
        this.props.controller.resetModel(null, ["device", "appSession"]);
        await removeLocalStorage();
        this.props.controller.updateModel({
            ui: {
                deactivatedAccountPopup: false,
                suspendOrLockedTitle: "",
                suspendOrLockedMessage: "",
            },
        });
    };

    handleVersionUnmatched = () => {
        const { appVersionUnmatchedBlock } = this.props.controller.getModel("ui");
        if (appVersionUnmatchedBlock) {
            // open app store / play store url
            if (Platform.OS === "ios") {
                Linking.openURL(`https://apps.apple.com/us/app/mae-by-maybank2u/id1481028763`);
            } else {
                Linking.openURL(`https://play.google.com/store/apps/details?id=com.maybank2u.life`);
            }
            return;
        }
        this.props.controller.updateModel({
            ui: {
                appVersionUnmatched: false,
                appVersionUnmatchedBlock: false,
                appVersionUnmatchedMessage: "",
            },
        });
    };

    handleReloadApp = () => {
        this.props.controller.updateModel({
            ui: {
                rsaSDKPopup: false,
            },
        });
        // this.props.navigation.replace("Splashscreen");
        NavigationService.resetAndNavigateToModule("Splashscreen", "");
    };

    componentDidUpdate(prevProps) {
        const { ssoPopup, sessionTimeoutPopup } = this.props.controller.getModel("ui");
        if (!prevProps.controller.getModel("ui").ssoPopup && ssoPopup)
            this.analyticsLogEvent(FA_DEVICE_SIGNOUT);
        else if (!prevProps.controller.getModel("ui").sessionTimeoutPopup && sessionTimeoutPopup)
            this.analyticsLogEvent(FA_SESSION_EXPIRED);
    }

    analyticsLogEvent = (logEvents) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: logEvents,
        });
    };

    generateTraceId = async () => {
        const { traceId } = this.props.controller.getModel("appSession");

        if (!traceId) {
            try {
                const randomString = S2uNacl.generateAESKey();

                this.props.controller.updateModel({
                    appSession: { traceId: randomString },
                });
            } catch (error) {
                this.props.controller.updateModel({
                    appSession: { traceId: "N/A" },
                });
            }
        }
    };

    getPopupState = () => {
        const {
            sessionTimeoutPopup,
            rsaLockedPopup,
            ssoPopup,
            suspendOrLockedPopup,
            suspendOrLockedTitle,
            suspendOrLockedMessage,
            showQuitPopup,
            tagBlockPopup,
            appVersionUnmatched,
            appVersionUnmatchedMessage,
            appVersionUnmatchedBlock,
            showS2uDeregPopup,
            rsaSDKPopup,
            generalErrorPopup,
            generalErrorMessage: { title, message, primaryCTA, secondaryCTA, hideCloseButton },
            secureStorageFailedPopup,
            deactivatedAccountPopup,
            missingUsernamePopup,
        } = this.props.controller.getModel("ui");
        const { isJailBroken } = this.state;

        if (rsaSDKPopup) {
            return {
                visible: true,
                title: "Oh no!",
                description: FAILED_AUTH,
                onClose: RNExitApp.exitApp,
                primaryAction: {
                    text: TRY_AGAIN,
                    onPress: this.handleReloadApp,
                },
                secondaryAction: {
                    text: QUIT,
                    onPress: RNExitApp.exitApp,
                },
            };
        }

        if (secureStorageFailedPopup) {
            return {
                visible: true,
                title: SECURE_STORAGE_ERROR_TITLE,
                description: SECURE_STORAGE_ERROR_MSG,
                onClose: this.handleQuitApp,
                primaryAction: {
                    text: SECURE_STORAGE_ERROR_PRIMARY_BTN,
                    onPress: this.handleQuitApp,
                },
                secondaryAction: {
                    text: SECURE_STORAGE_ERROR_SECONDARY_BTN,
                    onPress: this.handleUnlink,
                },
            };
        }

        if (isJailBroken) {
            return {
                visible: true,
                title: "Oh no!",
                description: Platform.OS === "ios" ? DEVICE_IS_JAILBREAK : DEVICE_IS_ROOTED,
                onClose: RNExitApp.exitApp,
                primaryAction: {
                    text: OKAY,
                    onPress: RNExitApp.exitApp,
                },
            };
        }

        if (rsaLockedPopup) {
            return {
                visible: true,
                title: YOU_HAVE_BEEN_SIGNED_OUT,
                description: SIGN_IN_TO_ACCOUNT_AGAIN,
                onClose: this.handleSsoToDashboard,
                primaryAction: {
                    text: DONE,
                    onPress: this.handleSsoToDashboard,
                },
                textLink: {
                    text: CALL_US,
                    onPress: this.handleSsoNotYou,
                },
            };
        }

        if (suspendOrLockedPopup) {
            return {
                visible: true,
                title: suspendOrLockedTitle || VERIFICATION_UNSUCCESSFUL,
                description: suspendOrLockedMessage || ACCOUNT_SUSPENDED,
                onClose: this.handleSsoToDashboard,
                primaryAction: {
                    text: ACCOUNT_GOT_IT,
                    onPress: this.handleSsoToDashboard,
                },
            };
        }

        if (tagBlockPopup) {
            return {
                visible: true,
                title: YOUR_TAC_BLOCKED,
                description: UNBLOCK_TAC,
                onClose: this.handleTagblockClose,
                primaryAction: {
                    text: DONE,
                    onPress: this.handleTagblockClose,
                },
                textLink: {
                    text: CALL_US,
                    onPress: this.handleSsoNotYou,
                },
            };
        }

        if (deactivatedAccountPopup) {
            return {
                visible: true,
                title: M2U_ACCESS_TEMP_DEACTIVATED,
                description: TO_REACTIVATE_M2U_ACCESS,
                onClose: this.handleDeactivatedAccountClose,
                primaryAction: {
                    text: DONE,
                    onPress: this.handleDeactivatedAccountClose,
                },
                textLink: {
                    text: CALL_US,
                    onPress: this.handleSsoNotYou,
                },
            };
        }

        if (ssoPopup) {
            return {
                visible: true,
                title: DEVICE_SIGNED_OUT_TITLE,
                description: DEVICE_SIGNED_OUT_DESC,
                onClose: this.handleSsoToDashboard,
                primaryAction: {
                    text: YES,
                    onPress: this.handleSsoOnboard,
                },
                textLink: {
                    text: CALL_US,
                    onPress: this.handleSsoNotYou,
                },
            };
        }

        if (generalErrorPopup) {
            return {
                visible: true,
                title,
                description: message,
                onClose: hideCloseButton ? null : this.handleGeneralErrorPrimaryCTA,
                hideCloseButton,
                primaryAction: {
                    text: primaryCTA,
                    onPress: () => this.handleGeneralErrorPrimaryCTA(primaryCTA),
                },
                ...(secondaryCTA
                    ? {
                          secondaryAction: {
                              text: secondaryCTA,
                              onPress: this.handleUnlink,
                          },
                      }
                    : {}),
            };
        }

        if (appVersionUnmatched) {
            return {
                visible: true,
                title: appVersionUnmatchedBlock ? APP_UPDATE_REQUIRED : APP_UPDATE_AVAILABLE,
                description: appVersionUnmatchedMessage,
                onClose: this.handleVersionUnmatched,
                primaryAction: {
                    text: appVersionUnmatchedBlock ? UPDATE_NOW : ACCOUNT_GOT_IT,
                    onPress: this.handleVersionUnmatched,
                },
            };
        }

        // we don't want it to overlap with SSO or suspension if its already visibly
        if (
            !ssoPopup &&
            !suspendOrLockedPopup &&
            !tagBlockPopup &&
            !rsaLockedPopup &&
            !appVersionUnmatched &&
            !deactivatedAccountPopup &&
            sessionTimeoutPopup
        ) {
            return {
                visible: true,
                title: SESSION_EXPIRED_HEADER,
                description: SESSION_EXPIRED_DESC,
                onClose: this.handleSessionExpired,
                primaryAction: {
                    text: OKAY,
                    onPress: this.handleSessionExpired,
                },
            };
        }

        if (showQuitPopup) {
            return {
                visible: true,
                title: QUIT_APP_HEADER,
                description: QUIT_APP_DESC,
                onClose: this.handleCancelQuit,
                primaryAction: {
                    text: YES,
                    onPress: this.handleQuitApp,
                },
                secondaryAction: { text: NO, onPress: this.handleCancelQuit },
            };
        }

        //s2u registered in both MAYA and RMBP, show popup to dereg RMBP
        if (showS2uDeregPopup) {
            return {
                visible: true,
                hideCloseButton: true,
                title: MAE_SECURE2U_HEADER,
                description: MAE_SECURE2U_DESC,
                onClose: this.handleCancelS2U,
                primaryAction: {
                    text: GOT_IT,
                    onPress: this.handleCancelS2U,
                },
            };
        }

        if (missingUsernamePopup) {
            return {
                visible: true,
                hideCloseButton: false,
                title: MISSING_USERNAME_ERR_TITLE,
                description: PLEASE_RETRY_UNLINK_ERROR_MESSAGE,
                onClose: this.handleCancelS2U,
                primaryAction: {
                    text: QUIT,
                    onPress: this.handleQuitApp,
                },
                secondaryAction: { text: UNLINK_M2U_CTA, onPress: this.handleUnlink },
            };
        }

        return {
            visible: false,
        };
    };

    triggerNetworkLog = () => {
        const { supsonic } = this.props.controller.getModel("misc");

        if ((Config?.DEV_ENABLE === "true" && Config?.LOG_RESPONSE_REQUEST === "true") || supsonic)
            this.props.controller.updateModel({
                ui: {
                    showNetLog: true,
                },
            });
    };

    handleLogOn = ({ nativeEvent }) => {
        const { supsonic } = this.props.controller.getModel("misc");

        if (
            ((Config?.DEV_ENABLE === "true" && Config?.LOG_RESPONSE_REQUEST === "true") ||
                supsonic) &&
            nativeEvent.state === State.FAILED &&
            nativeEvent.numberOfPointers === 2
        ) {
            generateHaptic("impact", false);
            this.triggerNetworkLog();
        }
    };

    render() {
        const { m2uLogin, touchId, showLoader, showNetLog } = this.props.controller.getModel("ui");
        const showPopup = this.getPopupState();
        return (
            <NavigationContainer ref={navigationRef}>
                <UserActivity onTimeout={this.handleIdleTimeout}>
                    <TapGestureHandler
                        onHandlerStateChange={this.handleLogOn}
                        minPointers={2}
                        maxDurationMs={800}
                    >
                        <View style={styles.wrap}>
                            {!this.state.isJailBroken && <Router />}
                            {m2uLogin && (
                                <M2uLogin
                                    onLoginSuccess={this.onLoginSuccess}
                                    onLoginFailed={this.onLoginFailed}
                                    onLoginCancelled={this.onLoginCancelled}
                                />
                            )}
                            {touchId && (
                                <TouchIdLogin
                                    onLoginSuccess={this.onLoginSuccess}
                                    onLoginFailed={this.onLoginFailed}
                                    onLoginCancelled={this.onLoginCancelled}
                                />
                            )}
                            {showNetLog && <LogStart />}
                            <Popup {...showPopup} />
                            <Preloader isVisible={showLoader} />
                        </View>
                    </TapGestureHandler>
                </UserActivity>
            </NavigationContainer>
        );
    }
}

const AppContextWrapper = (props) => {
    const controller = useModelController();

    if (!controller) return null;

    return <AppRoot controller={controller} {...props} />;
};

const App = (props) => {
    const toastRef = useRef();

    enableScreens();

    function renderToastComponent(props) {
        return <Toast {...props} />;
    }

    return (
        <GestureHandlerRootView style={styles.wrap}>
            <ModelProvider initialState={INITIAL_MODEL}>
                <SafeAreaProvider>
                    <EventLogProvider>
                        <LogGesture>
                            <StatusBar
                                barStyle={Platform.OS === "android" ? "default" : "dark-content"}
                                animated
                            />
                            <AppContextWrapper {...props} />
                            {/* Mount ApiManager, IdleManager as a component to initialize the model context access */}
                            <ApiManager />
                            <ApiManagerSSO />
                            <FlashMessage MessageComponent={renderToastComponent} ref={toastRef} />
                        </LogGesture>
                    </EventLogProvider>
                </SafeAreaProvider>
            </ModelProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
    },
});

export default App;

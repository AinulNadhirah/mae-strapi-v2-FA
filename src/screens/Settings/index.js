import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";
import SwitchToggle from "react-native-switch-toggle";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    SETTINGS_MODULE,
    PROFILE_SCREEN,
    DUITNOW_DASHBOARD,
    CHANGE_M2U_PASSWORD,
    ONE_TAP_AUTH_MODULE,
    ATM_CASHOUT_STACK,
    ATM_CASHOUT_CONFIRMATION,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    MAE_MODULE_STACK,
    MAE_SECURITY_QUESTIONS,
    M2U_DELETE,
    SECURE_SWITCH_STACK,
    SECURE_SWITCH_LANDING,
    MORE,
    SETTINGS_HOME,
    DASHBOARD,
    SETTINGS,
    LOGOUT,
    ZAKAT_SERVICES_STACK,
    ZAKAT_SERVICES_ENTRY,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import EnableBiometrics from "@components/Auth/EnableBiometrics";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ManageDevices from "@components/ManageDevices";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showSuccessToast, showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { unregisterOta, invokeL3, combinedATMActions, checkzakatCutOffTimeAPI, fetchZakatDetailsAPI } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";
import { clearAll } from "@services/localStorage";
import { unregisterPushNotification } from "@services/pushNotifications";

import {
    MEDIUM_GREY,
    GREY,
    LIGHT_GREY,
    SWITCH_GREEN,
    SWITCH_GREY,
    WHITE,
    GARGOYLE,
} from "@constants/colors";
import { DELETE, M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_DELETE_M2U } from "@constants/fundConstants";
import { GOAL_NOTIFICATION_SHOWN } from "@constants/localStorage";
import {
    APP_ID,
    CANCEL,
    CONFIRM,
    DELETED_DESC,
    DELETED_TITLE,
    SECURE2U_UNDER_COOLING,
    KILL_SWITCH,
    SS_SETTING_DESC,
    CC,
    PP,
    SP,
    TNC,
    FAQ,
    FA_SETTINGS,
    FA_SETTINGS_PROFILE,
    FA_SETTINGS_MAYBANK,
    FA_SETTINGS_SUPPORT,
    FA_SETTINGS_ABOUT,
    FA_SETTINGS_NOTIFICATIONS,
    FA_SETTINGS_SECURITY,
    FA_SETTINGS_HELPLINE,
    FA_SETTINGS_CHANGE_PIN,
    FA_SETTINGS_ABOUTUS,
    FA_SETTINGS_TERMS_AND_CONDITIONS,
    FA_SETTINGS_PRIVACY_POLICY,
    FA_SETTINGS_SECURITY_POLICY,
    FA_SETTINGS_CLILENT_CHARTER,
    FA_SETTINGS_FAQ,
    FA_SETTINGS_CHANGE_PASSWORD,
    FA_SETTINGS_CHANGE_SECURITY_QUESTION,
    FA_SETTINGS_UNLINK_MAYBANK_ACCOUNT,
    FA_SETTINGS_DUITNOW,
    FA_SETTINGS_SCANANDPAY,
    FA_SETTINGS_DEACTIVATE_M2U,
    DELETE_M2U_ACCOUNT_SUCCESS,
    DELETE_M2U_ACCOUNT,
    FA_SETTINGS_ZAKATAUTODEBIT,
    SUCC_STATUS,
    COMMON_ERROR_MSG
} from "@constants/strings";

import { maskName } from "@utils";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    s2uV4load,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import { getDeviceRSAInformation, removeLocalStorage } from "@utils/dataModel/utility";
import { removeCustomerKey, removeRefreshToken } from "@utils/dataModel/utilitySecureStorage";

import Images from "@assets";

const styles = StyleSheet.create({
    settingItem: {
        backgroundColor: LIGHT_GREY,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    settingItemChild: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    settingItemChildChevron: { height: 24, width: 24 },
    settingItemChildInner: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 36,
        paddingRight: 24,
        paddingVertical: 30,
    },
    settingItemChildInnerText: {
        width: "90%",
    },
    settingItemChildSwitchCircle: {
        backgroundColor: WHITE,
        borderRadius: 10,
        height: 20,
        width: 20,
    },
    settingItemChildSwitchContainer: {
        backgroundColor: SWITCH_GREY,
        borderRadius: 20,
        height: 22,
        padding: 1,
        width: 40,
    },
    settingItemChildTitle: {
        marginBottom: 4,
    },
    settingItemIcon: { height: 24, width: 24 },
    settingItemInner: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    settingItemTitle: {
        marginBottom: 4,
    },
});

function ItemChild({ index, title, description, isSwitch, isToggled, onPress, canRender = true }) {
    function handlePress() {
        typeof onPress === "function" && onPress();
    }

    if (!canRender) return null;

    return (
        <Animatable.View
            animation="fadeInDown"
            duration={200}
            delay={index * 50}
            style={styles.settingItemChild}
            useNativeDriver
        >
            <TouchableOpacity onPress={handlePress} style={styles.settingItemChildInner}>
                <View style={styles.settingItemChildInnerText}>
                    <Typo
                        text={title}
                        fontWeight="normal"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                        style={styles.settingItemChildTitle}
                    />
                    {!!description && (
                        <Typo
                            text={description}
                            fontWeight="normal"
                            fontSize={12}
                            lineHeight={14}
                            textAlign="left"
                        />
                    )}
                </View>

                <View>
                    {isSwitch ? (
                        <SwitchToggle
                            containerStyle={styles.settingItemChildSwitchContainer}
                            circleStyle={styles.settingItemChildSwitchCircle}
                            switchOn={isToggled}
                            onPress={handlePress}
                            backgroundColorOn={SWITCH_GREEN}
                            backgroundColorOff={SWITCH_GREY}
                            circleColorOff={WHITE}
                            circleColorOn={WHITE}
                            duration={200}
                        />
                    ) : (
                        <Image
                            source={Images.icChevronRight24Black}
                            style={styles.settingItemChildChevron}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
}

ItemChild.propTypes = {
    index: PropTypes.number,
    title: PropTypes.string,
    isSwitch: PropTypes.bool,
    isToggled: PropTypes.bool,
    onPress: PropTypes.func,
    canRender: PropTypes.bool,
    description: PropTypes.string,
};

function SettingItem({
    index,
    title,
    descriptions,
    icon,
    child,
    openedSetting,
    onPress,
    onPressItem,
    accessibilityLabel,
}) {
    function handlePress() {
        if (child) onPressItem(index, child);
        else onPress();
    }

    return (
        <>
            <View style={styles.settingItem}>
                <TouchableOpacity
                    onPress={handlePress}
                    accessible
                    accessibilityLabel={accessibilityLabel || title}
                    style={styles.settingItemInner}
                >
                    <View>
                        <Typo
                            text={title}
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={18}
                            textAlign="left"
                            style={styles.settingItemTitle}
                        />
                        <Typo
                            text={descriptions}
                            fontWeight="normal"
                            fontSize={12}
                            lineHeight={18}
                            textAlign="left"
                        />
                    </View>
                    <View>
                        <Image source={icon} style={styles.settingItemIcon} />
                    </View>
                </TouchableOpacity>
            </View>
            {openedSetting === index &&
                child &&
                child.length &&
                child.map((item, index) => <ItemChild index={index} key={item.title} {...item} />)}
        </>
    );
}

SettingItem.propTypes = {
    index: PropTypes.number,
    title: PropTypes.string,
    descriptions: PropTypes.string,
    icon: PropTypes.number,
    child: PropTypes.array,
    openedSetting: PropTypes.number,
    onPress: PropTypes.func,
    onPressItem: PropTypes.func,
    accessibilityLabel: PropTypes.string,
};

function Settings({ navigation, getModel, updateModel, resetModel, route }) {
    const [showPopup, setShowPopup] = useState(null);
    const [loadingUnlink, setLoadingUnlink] = useState(false);
    const [openedSetting, setOpenedSetting] = useState(null);
    const [biometricVisible, setBiometricVisible] = useState(false);
    const [manageDeviceVisible, setManageDeviceVisible] = useState(false);
    const [challengeRequest, setChallengeRequest] = useState(null);
    const [isRsaRequired, setIsRsaRequired] = useState(false);
    const [isRsaLoader, setIsRsaLoader] = useState(false);
    const [challengeQuestion, setChallengeQuestion] = useState(null);
    const [rsaCount, setRsaCount] = useState(0);
    const [rsaError, setRsaError] = useState(false);
    //S2U V4
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const nonTxnData = { isNonTxn: true };

    const { isPostPassword, biometricEnabled, fcmToken } = getModel("auth");
    const { isEnabled: otaEnabled, isUnderCoolDown, deviceId: otaDeviceId } = getModel("ota");
    const { mdipS2uEnable } = getModel("s2uIntrops");
    const { isEnabled: atmEnabled } = getModel("atm");
    const { isPromotionsEnabled, atmCashOutReady, m2uDeletion, isShowSecureSwitch } =
        getModel("misc");
    const { isEnabled: qrEnabled } = getModel("qrPay");
    const { isBiometricAvailable, deviceId } = getModel("device");
    const { mobileNumber, username } = getModel("user");

    const [cutOffTimeMessage, setCutOffTimeMessage] = useState("");

    const { showZakatService } = getModel("zakatService");

    function handleClosePopup() {
        setShowPopup(null);
    }

    function handleFALogging(index) {
        let eventName;
        switch (index) {
            // m2u
            case 1:
                eventName = FA_SETTINGS_MAYBANK;
                break;
            case 2:
                eventName = FA_SETTINGS_SECURITY;
                break;
            case 4:
                eventName = FA_SETTINGS_SUPPORT;
                break;
            case 5:
                eventName = FA_SETTINGS_ABOUT;
                break;
            default:
                eventName = "";
                break;
        }
        GASettingsScreen.onMenuSelect(eventName);
        GASettingsScreen.onExpandMenu(eventName);
    }

    async function handleTriggerPassword(index) {
        try {
            const response = await invokeL3(true);

            if (response) {
                // open the row
                setOpenedSetting(index);
                handleFALogging(index);
            }
        } catch (error) {
            // console.log(error);
            // do nothing
        }
    }

    function handleCancelDelete() {
        setShowPopup(null);
        navigation.canGoBack() && navigation.goBack();
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleOnTapParentSettings(index, haveChild) {
        if (index === openedSetting) {
            setOpenedSetting(null);
            return;
        }

        if (haveChild) {
            if ((index === 1 || index === 2) && !isPostPassword) {
                handleTriggerPassword(index);
                return;
            }

            handleFALogging(index);
            setOpenedSetting(index);
        }
    }

    function handleGoToUpdateProfile() {
        GASettingsScreen.onMenuSelect(FA_SETTINGS_PROFILE);
        navigation.navigate(SETTINGS_MODULE, {
            screen: PROFILE_SCREEN,
        });
    }

    function handleGoToChangePassword() {
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_CHANGE_PASSWORD);
        navigation.navigate(SETTINGS_MODULE, {
            screen: CHANGE_M2U_PASSWORD,
        });
    }

    function handleGoToChangeSecurityQuestion() {
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_CHANGE_SECURITY_QUESTION);
        navigation.navigate(MAE_MODULE_STACK, {
            screen: MAE_SECURITY_QUESTIONS,
            params: { filledUserDetails: { from: "Settings" } },
        });
    }

    function handleOnScanPay() {
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_SCANANDPAY);
        if (!qrEnabled) {
            navigation.navigate("QrStack", {
                screen: "QrStart",
                params: { primary: true, settings: true },
            });
        } else {
            navigation.navigate("QrStack", {
                screen: "QrLimit",
                params: { primary: true, settings: true },
            });
        }
    }

    function handleGoToRsaLocked({ reason, loggedOutDateTime, lockedOutDateTime }) {
        navigation.navigate(ONE_TAP_AUTH_MODULE, {
            screen: "Locked",
            params: {
                reason,
                loggedOutDateTime,
                lockedOutDateTime,
            },
        });
    }

    async function handleUnregisterOta(cqParams) {
        const newParams = cqParams ?? {};
        const { deviceId, deviceInformation } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
        const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/deRegister`; //s2u interops changes call v2 url when MDIP migrated
        const params = {
            app_id: APP_ID,
            device_id: otaDeviceId,
            hardware_id: deviceId,
            mobileSDKData,
            ...newParams,
        };

        try {
            const response = await unregisterOta(JSON.stringify(params), subUrl);

            if (response && response.data.status === "000") {
                setIsRsaLoader(false);
                setIsRsaRequired(false);

                // clear the flags
                await AsyncStorage.multiRemove([
                    "isOtaEnabled",
                    "isUnderCoolDown",
                    "mdipCounter",
                    "otaHotp",
                    "otaTotp",
                    "deviceKeys",
                    "serverPublicKey",
                    "otaDeviceId",
                ]);

                // clear the context
                resetModel(["ota"]);
                s2uV4load({}, getModel, updateModel);

                // show the toast
                showSuccessToast({
                    message: "Secure2u disabled.",
                });
                GASettingsScreen.onDisableSecure2U();
            } else {
                throw new Error(
                    response?.data?.status ?? "Failed to un-register Secure2u. Try again later."
                );
            }
        } catch (error) {
            if (error.status == 428) {
                setChallengeRequest({
                    ...challengeRequest,
                    challenge: error.error.challenge,
                });

                setIsRsaRequired(true);
                setIsRsaLoader(false);

                setChallengeQuestion(error.error.challenge.questionText);
                setRsaCount(rsaCount + 1);
                setRsaError(rsaCount > 0);
            } else if (error.status == 423) {
                const { statusDescription, serverDate } = error.error;

                setIsRsaRequired(false);
                setIsRsaLoader(false);

                handleGoToRsaLocked({
                    reason: statusDescription,
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                });
            } else if (error.status == 422) {
                /**
                 * RSA Deny
                 */
                const { statusDescription, serverDate } = error.error;

                const params = {
                    statusDescription,
                    additionalStatusDescription: "",
                    serverDate,
                    nextParams: {},
                    nextModule: "Dashboard",
                    nextScreen: "Settings",
                };

                navigation.navigate(COMMON_MODULE, {
                    screen: RSA_DENY_SCREEN,
                    params,
                });
            } else {
                showErrorToast({
                    message: error.message || "Failed to un-register Secure2u. Try again later.",
                });
            }
        } finally {
            handleClosePopup();
        }
    }

    async function handleOnAtmCashout() {
        // setAtmStatus((t) => !t);
        if (!atmEnabled) {
            navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_CASHOUT_CONFIRMATION,
                params: { primary: true, settings: true },
            });
        } else {
            // do unregister
            setShowPopup("atm");
        }
        GASettingsScreen.onToggleATMCashout(atmEnabled);
    }

    async function handleDisableAtmCashout() {
        handleClosePopup();
        const deviceInfo = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const params = {
            mobileSDKData,
            requestType: "QRCLW_003",
            isEnable: "N",
        };
        try {
            const response = await combinedATMActions(params);

            if (response?.data?.code === 200) {
                // clear the flags
                await AsyncStorage.removeItem("isAtmEnabled");
                await AsyncStorage.removeItem("isAtmOnboarded");
                // clear the context
                resetModel(["atm"]);
                // show the toast
                showInfoToast({
                    message: "ATM Cash-out successfully disabled.",
                });
                GASettingsScreen.onDisableATMCashout();
            } else {
                throw new Error(response.data.status);
            }
        } catch (error) {
            handleClosePopup();
            showErrorToast({
                message: error?.message ?? "Failed to disable ATM Cash-out. Try again later.",
            });
        }
    }

    async function onChallengeQuestionSubmitPress(answer) {
        const { challenge } = challengeRequest;
        const mergedChallenge = {
            ...challengeRequest,
            challenge: {
                ...challenge,
                answer,
            },
        };

        setChallengeRequest(mergedChallenge);
        setIsRsaLoader(true);
        setRsaError(false);

        handleUnregisterOta(mergedChallenge);
    }

    function onChallengeSnackClosePress() {
        setRsaError(false);
    }

    // check for OTA if already register, if not, go to OTA onboarding,
    // check for S2UCooling progress
    // else do un-register
    async function handleOnOneTapAuth() {
        // check cooldown status, if true, show block access
        // if not enabled, go to activate screen
        if (isUnderCoolDown) {
            showInfoToast({
                message: SECURE2U_UNDER_COOLING,
            });
            return;
        }
        GASettingsScreen.onToggleSecure2U(otaEnabled);
        if (!otaEnabled) {
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        fail: {
                            stack: MORE,
                            screen: SETTINGS_HOME,
                        },
                        params: { showS2UCoolingToast: false },
                    },
                },
            });
            return;
        }

        // do unregister
        setShowPopup("ota");
    }

    function handleBiometric() {
        // show biometric stuff
        if (!biometricEnabled) {
            // show biometric enabler component
            setBiometricVisible(true);
        } else {
            setShowPopup("biometric");
        }
        GASettingsScreen.onHandleBiometric(biometricEnabled);
    }

    function handleOnCloseBio() {
        setBiometricVisible(false);
    }

    function handleOnEnableBio() {
        handleOnCloseBio();

        showSuccessToast({
            message: "Biometric successfully enabled.",
        });
        GASettingsScreen.onSuccessfulEnableBiometric();
    }

    async function handleDisableBiometric() {
        handleClosePopup();

        // update AS and context
        await AsyncStorage.setItem("biometricEnabled", `false`);

        updateModel({
            auth: {
                biometricEnabled: false,
            },
        });

        showSuccessToast({
            message: "Biometric successfully disabled.",
        });
        GASettingsScreen.onSuccessfulDisableBiometric();
    }

    function handleOnUnlinkM2u() {
        setShowPopup("unlink");
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_UNLINK_MAYBANK_ACCOUNT);
    }

    function handleSecureSwitch() {
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: SECURE_SWITCH_LANDING,
            params: { fromModule: "Dashboard", fromScreen: "Settings" },
        });
    }

    function handleDuitnowTap() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: DUITNOW_DASHBOARD,
        });
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_DUITNOW);
    }

    //S2U V4
    const doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: DASHBOARD,
            succScreen: SETTINGS,
        };
        navigateToS2UReg(navigate, route?.params, redirect, getModel);
    };
    //S2U V4
    const s2uSDKInit = async () => {
        const { deviceInformation } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
        return await init(FN_DELETE_M2U, { mobileSDKData });
    };
    //S2U V4
    const initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    showS2UDownToast();
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: M2U_DELETE,
                        params: { from: "M2UDeletion" },
                    });
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration(navigation.navigate);
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "Delete M2U Access");
            s2uSdkLogs(error, "Delete M2U Access IOS");
        }
    };
    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        const { navigate } = navigation;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration(navigate);
        }
    };

    function handleS2U() {
        initiateS2USdk();
    }
    //S2U V4
    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    //S2U V4
    const onS2uDone = (response) => {
        // Close S2u popup
        onS2uClose();
        navigateToAcknowledgementScreen(response);
    };
    //S2U V4
    const navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        const titleMessage =
            executePayload?.body?.message === SUCC_STATUS
                ? DELETE_M2U_ACCOUNT_SUCCESS
                : DELETE_M2U_ACCOUNT;
        let entryPoint = {
            entryStack: DASHBOARD,
            entryScreen: SETTINGS,
        };
        let ackDetails = {
            executePayload: {
                ...executePayload,
                ...executePayload?.body,
                executed: executePayload?.executed,
            },
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: navigation.navigate,
        };
        if (executePayload?.executed) {
            if (transactionStatus) {
                clearAll();
                removeCustomerKey();
                removeRefreshToken();
                entryPoint = {
                    entryStack: LOGOUT,
                    entryScreen: LOGOUT,
                    params: {
                        type: DELETE,
                        screenBasedNavigation: true,
                    },
                };
                const transactionDetails = {
                    transactionToken: executePayload?.body?.referenceNo,
                };
                ackDetails = { ...ackDetails, entryPoint, transactionDetails };
            }

            ackDetails = {
                ...ackDetails,
                titleMessage,
            };
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    async function gotoZakatDetailsPage() {
        try {
            const response = await fetchZakatDetailsAPI(true);
            if (response?.data) {
                const { data, status, errorCode } = { ...response?.data };
                if (errorCode === "BE001") {
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: "ZakatAutoDebitCancelled"
                    });
                } else {
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: "ZakatAutoDebitSettings",
                        params: {
                            isDebitSetupSuccess: status.toLowerCase() === "SUCCESS".toLowerCase(),
                            zakatDetailsData: data
                        }
                    });
                }
            }
        } catch (error) {
            navigation.goBack();
            showErrorToast({ message: error?.message });
        }
    }

    async function handleZakatAutoDebitTap() {
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_ZAKATAUTODEBIT);
        try {
            const response = await checkzakatCutOffTimeAPI();
            const { status, message } = { ...response.data };
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                await gotoZakatDetailsPage();
            } else {
                setCutOffTimeMessage(message);
                setShowPopup("zakatautodebit");
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }
    function handleOnM2uDeletion() {
        setShowPopup("delete");
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_MAYBANK, FA_SETTINGS_DEACTIVATE_M2U);
    }

    async function handleM2uDeletion() {
        // close popup
        handleClosePopup();
        handleS2U();
    }

    function handleGottoZakatDebitCalculation() {
        handleClosePopup();
    }

    function setUpZakatDebitRegPage() {
        handleClosePopup();
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_SERVICES_ENTRY
        });
    }

    async function handleUnlinkM2u() {
        // close popup
        handleClosePopup();

        // unregister the PNS
        if (fcmToken) {
            setLoadingUnlink(true);

            try {
                const response = await unregisterPushNotification(
                    mobileNumber,
                    deviceId,
                    fcmToken,
                    isPromotionsEnabled ? "A" : "T"
                );
                //dereg s2u - trigger transaction from web or RMBP shows maya still s2u registered
                if (otaEnabled) {
                    await handleUnregisterOta();
                }
                if (response) {
                    showSuccessToast({
                        message: `M2U access (${maskName(username)}) has been unlinked.`,
                    });
                    GASettingsScreen.onSuccessfulUnlinkM2U();
                }
                await AsyncStorage.removeItem("isAtmEnabled");
                await AsyncStorage.removeItem("isAtmOnboarded");
            } catch (error) {
                showErrorToast({
                    message: "Unable to unregister PNS",
                });
            } finally {
                setLoadingUnlink(false);

                // clear and reset everything except device, appSession as usual.
                resetModel(null, ["device", "appSession"]);

                await removeLocalStorage();

                // reset to splash and to dashboard
                NavigationService.resetAndNavigateToModule("Splashscreen", "", { skipIntro: true });
            }
        } else {
            //dereg s2u - trigger transaction from web or RMBP shows maya still s2u registered
            try {
                if (otaEnabled) {
                    await handleUnregisterOta();
                }
            } catch (error) {
                console.log(error);
            }
            // clear and reset everything except device, as usual.
            resetModel(null, ["device", "appSession"]);

            await removeLocalStorage();

            showSuccessToast({
                message: "Maybank2u account successfully unlinked.",
            });
            GASettingsScreen.onSuccessfulUnlinkM2U();

            // reset to splash and to dashboard
            NavigationService.resetAndNavigateToModule("Splashscreen", "", { skipIntro: true });
        }

        // reset financial goals notification flag
        await AsyncStorage.setItem(GOAL_NOTIFICATION_SHOWN, JSON.stringify(false));
    }

    function handleGoToChangePin() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ChangePin",
        });
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_SECURITY, FA_SETTINGS_CHANGE_PIN);
    }

    // function handleOpenManageDevice() {
    //     setManageDeviceVisible(true);
    // }

    function handelGoToNotifications() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "Notifications",
        });
        GASettingsScreen.onMenuSelect(FA_SETTINGS_NOTIFICATIONS);
    }

    function handleOnManageDeviceClose() {
        setManageDeviceVisible(false);
    }

    function getPdfProps(screen) {
        switch (screen) {
            case "FAQ":
                return {
                    headerColor: GARGOYLE,
                    title: "FAQ",
                    source: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_FAQ_202009.pdf",
                };
            case "TnC":
                return {
                    headerColor: GARGOYLE,
                    title: "Terms & Conditions",
                    source: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
                };
            case "PP":
                return {
                    headerColor: GARGOYLE,
                    title: "Privacy Policy",
                    source: "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/security_privacy/security_statement.page",
                };
            case "SP":
                return {
                    headerColor: GARGOYLE,
                    title: "Security Policy",
                    source: "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/security_privacy/security_statement.page",
                };
            case "CC":
                return {
                    headerColor: GARGOYLE,
                    title: "Client Charter",
                    source: "https://www.maybank2u.com.my/iwov-resources/pdf/client_charter/fair-treatment-policy.pdf",
                };

            default:
                return null;
        }
    }

    function handleGoToPdfScreen(screen) {
        const props = getPdfProps(screen);

        if (props) {
            navigation.navigate(SETTINGS_MODULE, {
                screen: "PdfSetting",
                params: props,
            });
        }
    }

    function handleGoToHelpline() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "Helpline",
        });
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_SUPPORT, FA_SETTINGS_HELPLINE);
    }

    function handleGoToAbout() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "About",
        });
        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_ABOUT, FA_SETTINGS_ABOUTUS);
    }

    function getPopupProps() {
        switch (showPopup) {
            case "zakatautodebit":
                return {
                    visible: true,
                    title: "Setup Auto Debit for Zakat",
                    onClose: handleClosePopup,
                    description: cutOffTimeMessage,
                    primaryAction: {
                        text: "Ok",
                        onPress: handleGottoZakatDebitCalculation,
                    }
                };
            case "setupzakatreg":
                return {
                    visible: true,
                    title: "Setup Auto Debit for Zakat",
                    onClose: handleClosePopup,
                    description: "Get your Zakat Simpanan & Pelaburan automatically calculated and paid every year.",
                    primaryAction: {
                        text: "Set Up Now",
                        onPress: setUpZakatDebitRegPage,
                    }
                };
            case "delete":
                return {
                    visible: true,
                    title: DELETED_TITLE,
                    onClose: handleClosePopup,
                    description: DELETED_DESC,
                    primaryAction: {
                        text: CONFIRM,
                        onPress: handleM2uDeletion,
                    },
                    secondaryAction: {
                        text: CANCEL,
                        onPress: handleCancelDelete,
                    },
                };
            case "unlink":
                return {
                    visible: true,
                    title: "Unlink M2U Access From MAE",
                    onClose: handleClosePopup,
                    description:
                        "Are you sure you want to unlink your M2U access from the MAE app?",
                    primaryAction: {
                        text: "Confirm",
                        onPress: handleUnlinkM2u,
                    },
                    secondaryAction: {
                        text: "Cancel",
                        onPress: handleClosePopup,
                    },
                };
            case "ota":
                return {
                    visible: true,
                    title: "Disable Secure2u",
                    description: "Are you sure want to disable Secure2u?",
                    onClose: handleClosePopup,
                    primaryAction: {
                        text: "Confirm",
                        onPress: handleUnregisterOta,
                    },
                    secondaryAction: {
                        text: "Cancel",
                        onPress: handleClosePopup,
                    },
                };

            case "biometric":
                return {
                    visible: true,
                    title: "Disable Biometric Login",
                    description: "Are you sure want to disable biometric login?",
                    onClose: handleClosePopup,
                    primaryAction: {
                        text: "Confirm",
                        onPress: handleDisableBiometric,
                    },
                    secondaryAction: {
                        text: "Cancel",
                        onPress: handleClosePopup,
                    },
                };

            case "atm":
                return {
                    visible: true,
                    title: "Unlink ATM Cash-out",
                    description:
                        "Are you sure want to disable this feature? This means that you will not be able to withdraw money via app",
                    onClose: handleClosePopup,
                    primaryAction: {
                        text: "Confirm",
                        onPress: handleDisableAtmCashout,
                    },
                    secondaryAction: {
                        text: "Cancel",
                        onPress: handleClosePopup,
                    },
                };

            default:
                return {
                    visible: false,
                };
        }
    }
    const defaultSettings = [
        {
            title: "Profile",
            descriptions: "Manage profile details",
            icon: Images.personal,
            onPress: handleGoToUpdateProfile,
            accessibilityLabel: "go to profile",
        },
        {
            title: "Maybank2u",
            descriptions: "Manage banking accounts",
            accessibilityLabel: "open m2u settings",
            icon: Images.maybank,
            child: [
                {
                    title: "Scan & Pay",
                    onPress: handleOnScanPay,
                },
                {
                    title: "ATM Cash-out",
                    isSwitch: true,
                    isToggled: atmEnabled,
                    onPress: handleOnAtmCashout,
                    canRender: atmCashOutReady,
                },
                {
                    title: "Secure2u",
                    isSwitch: true,
                    isToggled: otaEnabled ? (mdipS2uEnable ? !isUnderCoolDown : false) : false,
                    onPress: mdipS2uEnable ? handleOnOneTapAuth : null,
                },
                {
                    title: "DuitNow",
                    onPress: handleDuitnowTap,
                },
                ...(showZakatService
                    ? [
                        {
                            title: "Auto Debit for Zakat",
                            onPress: handleZakatAutoDebitTap,
                        },
                      ]
                    : []),
                {
                    title: "Change Password",
                    onPress: handleGoToChangePassword,
                },
                {
                    title: "Change Security Question",
                    onPress: handleGoToChangeSecurityQuestion,
                },
                {
                    title: "Unlink M2U Access From MAE",
                    onPress: handleOnUnlinkM2u,
                },
                ...(isShowSecureSwitch
                    ? [
                          {
                              title: KILL_SWITCH,
                              description: SS_SETTING_DESC,
                              onPress: handleSecureSwitch,
                          },
                      ]
                    : []),
                ...(m2uDeletion
                    ? [{ title: "Delete M2U Access", onPress: handleOnM2uDeletion }]
                    : []),
            ],
        },
        {
            title: "Security",
            descriptions: "Manage security",
            icon: Images.lock,
            accessibilityLabel: "open security settings",
            child: [
                {
                    title: "Biometric Login",
                    canRender: isBiometricAvailable,
                    isSwitch: true,
                    isToggled: biometricEnabled,
                    onPress: handleBiometric,
                },
                {
                    title: "Change PIN",
                    onPress: handleGoToChangePin,
                },
                // {
                //     title: "Manage Devices",
                //     onPress: handleOpenManageDevice,
                // },
            ],
        },
        {
            title: "Notifications",
            descriptions: "Manage notifications",
            icon: Images.menuNotifications,
            onPress: handelGoToNotifications,
            accessibilityLabel: "go to notifications settings",
        },
        {
            title: "Support",
            descriptions: "Feedback & FAQ",
            icon: Images.speaker,
            accessibilityLabel: "go to support settings",
            child: [
                {
                    title: "FAQ",
                    onPress: () => {
                        handleGoToPdfScreen(FAQ);
                        GASettingsScreen.onSubMenuSelect(FA_SETTINGS_SUPPORT, FA_SETTINGS_FAQ);
                    },
                },
                {
                    title: "Helpline",
                    onPress: handleGoToHelpline,
                },
            ],
        },
        {
            title: "About",
            descriptions: "About MAE",
            icon: Images.mobile,
            accessibilityLabel: "go to about details",
            child: [
                {
                    title: "About Us",
                    onPress: handleGoToAbout,
                },
                {
                    title: "Terms & Conditions",
                    onPress: () => {
                        handleGoToPdfScreen(TNC);
                        GASettingsScreen.onSubMenuSelect(
                            FA_SETTINGS_ABOUT,
                            FA_SETTINGS_TERMS_AND_CONDITIONS
                        );
                    },
                },
                {
                    title: "Privacy Policy",
                    onPress: () => {
                        handleGoToPdfScreen(PP);
                        GASettingsScreen.onSubMenuSelect(
                            FA_SETTINGS_ABOUT,
                            FA_SETTINGS_PRIVACY_POLICY
                        );
                    },
                },
                {
                    title: "Security Policy",
                    onPress: () => {
                        handleGoToPdfScreen(SP);
                        GASettingsScreen.onSubMenuSelect(
                            FA_SETTINGS_ABOUT,
                            FA_SETTINGS_SECURITY_POLICY
                        );
                    },
                },
                {
                    title: "Client Charter",
                    onPress: () => {
                        handleGoToPdfScreen(CC);
                        GASettingsScreen.onSubMenuSelect(
                            FA_SETTINGS_ABOUT,
                            FA_SETTINGS_CLILENT_CHARTER
                        );
                    },
                },
            ],
        },
    ];

    const popupProps = getPopupProps();

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loadingUnlink}
            analyticScreenName={FA_SETTINGS}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={GARGOYLE}
                            headerCenterElement={
                                <Typo
                                    text="Settings"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <ScrollView>
                        {defaultSettings.map((setting, index) => (
                            <SettingItem
                                key={setting.title}
                                index={index}
                                openedSetting={openedSetting}
                                {...setting}
                                onPressItem={handleOnTapParentSettings}
                            />
                        ))}
                    </ScrollView>

                    <Popup {...popupProps} />
                </ScreenLayout>
                {biometricVisible && (
                    <EnableBiometrics
                        onEnable={handleOnEnableBio}
                        onClose={handleOnCloseBio}
                        onSetupLater={handleOnCloseBio}
                        isManage
                    />
                )}
                {manageDeviceVisible && (
                    <ManageDevices isManage onClose={handleOnManageDeviceClose} />
                )}
                {isRsaRequired && (
                    <ChallengeQuestion
                        loader={isRsaLoader}
                        display={isRsaRequired}
                        displyError={rsaError}
                        questionText={challengeQuestion}
                        onSubmitPress={onChallengeQuestionSubmitPress}
                        onSnackClosePress={onChallengeSnackClosePress}
                    />
                )}
                {showS2UModal && (
                    <Secure2uAuthenticationModal
                        token=""
                        onS2UDone={onS2uDone}
                        onS2uClose={onS2uClose}
                        s2uPollingData={mapperData}
                        transactionDetails={mapperData}
                        secure2uValidateData={mapperData}
                        nonTxnData={nonTxnData}
                        s2uEnablement={true}
                        navigation={navigation}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

Settings.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
};

export default withModelContext(Settings);

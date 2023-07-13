import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    TAB_NAVIGATOR,
    SETTINGS_MODULE,
    FORGOT_PINSCREEN,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { updateWalletPIN } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MAE_FORGOT_PIN_OTP } from "@constants/api";
import { MEDIUM_GREY, FADE_GREY } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_CHANGE_PIN } from "@constants/fundConstants";
import {
    PIN_RESET_SUCCESSFUL,
    PIN_RESET_UNSUCCESSFUL,
    RESET_PIN_SUCC,
    SUCC_STATUS,
} from "@constants/strings";

import { encryptData } from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";

function ForgotPin({ navigation, route, getModel }, props) {
    const [pin, setPin] = useState("");
    const [confirmPin, setconfirmPin] = useState("");
    const [pinType, setPinType] = useState("CreatePin");

    //S2U V4
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const nonTxnData = { isNonTxn: true };
    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }
    function handleOnSuccess() {
        showSuccessToast({
            message: RESET_PIN_SUCC,
        });
        GASettingsScreen.onSuccessResetPIN();
        navigation.navigate(TAB_NAVIGATOR);
    }
    function handleOnError(error) {
        showErrorToast({
            message: error.message,
        });
    }

    async function updateValidatePIN() {
        const pinNo = await encryptData(confirmPin);
        const data = {
            pinNo,
        };
        updateWalletPIN(data)
            .then((respone) => {
                console.log("Change Password ", respone);
                handleOnSuccess();
            })
            .catch((error) => {
                console.log(`is Error`, error);
                handleOnError(error);
            });
    }

    useEffect(() => {
        if (route?.params?.auth === "successful") {
            // Forgot Pin API Call
            updateValidatePIN();
        }
    }, [navigation, route]);

    useEffect(() => {
        GASettingsScreen.onScreenResetPIN(pinType);
    }, [pinType]);

    function handleKeyboardChange(text) {
        if (pinType === "CreatePin") {
            setPin(text);
            return;
        }
        setconfirmPin(text);
    }
    function handleKeyboardDone() {
        if (pin && pin.length === 6) {
            setPinType("ConfirmPin");
            if (confirmPin && confirmPin.length === 6) {
                if (pin === confirmPin) {
                    initiateS2USdk();
                    return;
                }
                showErrorToast({
                    message: "PIN number entered is not same. Please enter again",
                });
            }
        } else {
            showErrorToast({
                message: "PIN must consist of at least 6 digits.",
            });
            setPin("");
            setconfirmPin("");
        }
    }

    const navigateToTacFlow = () => {
        const { mobileNumber } = getModel("user");
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ConfirmPhoneNumber",
            params: {
                externalSource: {
                    stack: SETTINGS_MODULE,
                    screen: FORGOT_PINSCREEN,
                },
                // temp fix since userDetails still doesn't save the number with 60
                phone: mobileNumber.indexOf("60") < 0 ? `60${mobileNumber}` : mobileNumber,
                type: MAE_FORGOT_PIN_OTP,
            },
        });
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
                    navigateToTacFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration();
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log("Forgot Pin Initiate S2U error : ", error);
            s2uSdkLogs(error, "Forgot Pin");
        }
    };
    //S2U V4
    const s2uSDKInit = async () => {
        const pinNo = await encryptData(confirmPin);
        const params = {
            pinNo,
        };
        return await init(FN_CHANGE_PIN, params);
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation?.navigate);
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
            doS2uRegistration();
        }
    };

    const doS2uRegistration = () => {
        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: FORGOT_PINSCREEN,
        };

        navigateToS2UReg(navigation.navigate, route?.params, redirect, getModel);
    };

    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    const onS2uDone = (response) => {
        const { transactionStatus, executePayload } = response;
        // Close S2u popup
        onS2uClose();
        const entryPoint = {
            entryStack: TAB_NAVIGATOR,
            entryScreen: DASHBOARD,
            params: {},
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: navigation.navigate,
        };
        if (executePayload?.executed) {
            ackDetails.titleMessage =
                executePayload?.message === SUCC_STATUS
                    ? PIN_RESET_SUCCESSFUL
                    : PIN_RESET_UNSUCCESSFUL;
            ackDetails.transactionSuccess = executePayload?.message === SUCC_STATUS;
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="6-digit PIN"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={
                                    pinType === "CreatePin"
                                        ? "Create your PIN for the app"
                                        : "Confirm your new 6-digit PIN"
                                }
                                textAlign="left"
                            />
                            {pinType === "CreatePin" && (
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    color={FADE_GREY}
                                    text="This 6-digit PIN will be used each time you access your account or as backup to your biometric login."
                                    textAlign="left"
                                />
                            )}

                            <View style={styles.pinContainer}>
                                <OtpPin
                                    pin={pinType === "CreatePin" ? pin : confirmPin}
                                    space="15%"
                                    ver={8}
                                    hor={8}
                                    border={5}
                                />
                            </View>
                        </View>
                        <NumericalKeyboard
                            value={pinType === "CreatePin" ? pin : confirmPin}
                            onChangeText={handleKeyboardChange}
                            maxLength={6}
                            onDone={handleKeyboardDone}
                        />
                    </View>
                </ScreenLayout>
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
                        navigation={props.navigation}
                        extraParams={{
                            metadata: {
                                txnType: "FORGOT_PIN", // Transaction type identifier
                            },
                        }}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

ForgotPin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    client: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    pinContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(ForgotPin);

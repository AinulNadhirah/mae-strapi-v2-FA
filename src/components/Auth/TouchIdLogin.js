import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal, TouchableOpacity, Image, StyleSheet, View } from "react-native";
import Biometrics from "react-native-biometrics";
import DeviceInfo from "react-native-device-info";
import FlashMessage from "react-native-flash-message";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { handleRequestClose } from "@components/BackHandlerInterceptor";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { LogGesture } from "@components/NetworkLog";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import Toast, { errorToastProp, infoToastProp } from "@components/Toast";

import { withModelContext } from "@context";

import { m2uEnrollment, findAndm2uLinked } from "@services";

import { ROYAL_BLUE } from "@constants/colors";
import { FORGOT_PIN } from "@constants/strings";

import { generateHaptic } from "@utils";
import * as DataModel from "@utils/dataModel";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { getCustomerKey, setRefreshToken } from "@utils/dataModel/utilitySecureStorage";

import Images from "@assets";

// temp
const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    forgotPin: { flexDirection: "row" },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    // loginContainer: {
    //     ...StyleSheet.absoluteFillObject,
    //     elevation: 9999,
    //     zIndex: 99999,
    // },
    metaContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pinContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    touchIcon: {
        height: 40,
        width: 40,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

function PinAndBiometricAuth({
    getModel,
    updateModel,
    onLoginSuccess,
    onLoginFailed,
    onLoginCancelled,
}) {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [pinCount, setPinCount] = useState(0);
    const toastRef = useRef();
    const { biometricEnabled } = getModel("auth");
    const { isBiometricAvailable, biometricType } = getModel("device");

    function onFallBack() {
        updateModel({
            auth: { fallBack: false, loginWith: "PIN" },
        });
        typeof onLoginCancelled === "function" && onLoginCancelled(); //change to loginfailed-check with idraki
    }

    function handleClose() {
        updateModel({
            auth: { fallBack: false },
        });
        typeof onLoginCancelled === "function" && onLoginCancelled();
    }

    // function handleAndroidBack() {
    //     handleRequestClose(updateModel);
    //     handleClose();
    // }

    function handleCloseToast() {
        toastRef.current.hideMessage();
    }

    function handleForgotPin() {
        typeof onLoginCancelled === "function" && onLoginCancelled(FORGOT_PIN);
    }

    function handleKeyboardChange(value) {
        setPin(value);

        if (value.length === 6) {
            handleKeyboardDone(value);
            setPin("");
        }
    }

    async function handleKeyboardDone(pin) {
        if (pin && pin.length === 6) {
            const encryptedPin = await DataModel.encryptData(pin);

            setLoading(true);

            try {
                const response = await findAndm2uLinked({ pinNo: encryptedPin });

                const { data = {} } = response;

                if (data?.m2uLinked) {
                    // some hapctic when pin auth success
                    generateHaptic("notification", true);

                    // do enrollment
                    requestTouchIdToken("PIN");
                } else {
                    const { fallBack } = getModel("auth");
                    console.log(fallBack);
                    if (fallBack) {
                        onFallBack();
                        setLoading(false);
                    } else {
                        throw new Error();
                    }
                }
            } catch (e) {
                setLoading(false);
                setPinCount(pinCount + 1);

                toastRef.current.showMessage(
                    errorToastProp({
                        message:
                            pinCount === 0 || pinCount === 1
                                ? "You've entered the wrong PIN. Please try again."
                                : "You've exceed the number of tries. Reset PIN by clicking 'Forgot PIN'",
                        onToastPress: handleCloseToast,
                    })
                );
            }
        } else {
            toastRef.current.showMessage(
                errorToastProp({
                    message: "PIN must consist of at least 6 digits.",
                    onToastPress: handleCloseToast,
                })
            );
        }
    }

    function renderToastComponent(props) {
        return <Toast onClose={handleCloseToast} {...props} />;
    }

    const handleLoginSuccess = useCallback(
        (data) => {
            updateModel({
                auth: { fallBack: false },
            });
            typeof onLoginSuccess === "function" && onLoginSuccess(data);
        },
        [updateModel, onLoginSuccess]
    );

    const handleLoginFailed = useCallback(
        (error) => {
            updateModel({
                auth: { fallBack: false },
            });
            toastRef.current.showMessage(
                errorToastProp({
                    message: error.message,
                })
            );

            typeof onLoginFailed === "function" && onLoginFailed(error);
        },
        [updateModel, onLoginFailed]
    );

    const requestTouchIdToken = useCallback(
        async (loginWith) => {
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const { limitExceeded } = getModel("qrPay");

            const customerKey = await getCustomerKey(getModel, true);

            if (customerKey) {
                const params = {
                    grantType: "PASSWORD",
                    tokenType: "TOUCHID",
                    bioEventCode: "FR",
                    customerKey,
                    mobileSDKData,
                    // mobileSDKData: mobileSDK,
                    limitApproved: limitExceeded,
                };

                setLoading(true);

                try {
                    const response = await m2uEnrollment(params, false);

                    if (response && response.data) {
                        const { access_token, refresh_token, contact_number, cus_type, cus_name } =
                            response.data;
                        updateModel({
                            auth: {
                                token: access_token,
                                refreshToken: refresh_token,
                                customerKey,
                                loginWith,
                                fallBack: false,
                            },
                            m2uDetails: {
                                m2uPhoneNumber: contact_number,
                            },
                            user: {
                                cus_type,
                                soleProp: cus_type === "02",
                                cus_name,
                            },
                        });
                        // store refresh token in secure storage
                        setRefreshToken(refresh_token);

                        handleLoginSuccess();
                    }
                } catch (error) {
                    console.tron.log("Error when authenticating", error);

                    handleLoginFailed(error);
                    setLoading(false);
                }
            }
        },
        [getModel, updateModel, handleLoginSuccess, handleLoginFailed]
    );

    const handleBiometric = useCallback(
        async (biometricType) => {
            try {
                const prompt = await Biometrics.simplePrompt({
                    promptMessage:
                        biometricType === Biometrics.FaceID ? "Face ID" : "Confirm biometrics",
                });

                if (prompt) {
                    const { success } = prompt;

                    if (success) {
                        requestTouchIdToken("TOUCH");
                    } else {
                        toastRef.current.showMessage(
                            infoToastProp({
                                message: "Biometric authentication cancelled",
                                onToastPress: handleCloseToast,
                            })
                        );
                    }
                }
            } catch (error) {
                toastRef.current.showMessage(
                    infoToastProp({
                        message: "Biometric authentication unsuccessful",
                        onToastPress: handleCloseToast,
                    })
                );
            }
        },
        [requestTouchIdToken]
    );

    const fingerPrintEvent = useCallback(async () => {
        try {
            const { biometryType } = await Biometrics.isSensorAvailable();

            if (biometryType) {
                handleBiometric(biometryType);
            }
        } catch (error) {
            toastRef.current.showMessage(
                infoToastProp({
                    message: "Error in biometric authentication.",
                    onToastPress: handleCloseToast,
                })
            );
        }
    }, [handleBiometric]);

    function handleTouch() {
        fingerPrintEvent();
    }

    function handleAndroid() {
        handleRequestClose(updateModel);
    }

    useEffect(() => {
        if (isBiometricAvailable && biometricEnabled) {
            fingerPrintEvent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal visible hardwareAccelerated animationType="slide" onRequestClose={handleAndroid}>
            <LogGesture modal>
                <ScreenContainer backgroundType={"color"} showLoaderModal={loading}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={<CloseButton onPress={handleClose} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={16}
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
                                    text="Enter your 6-digit PIN"
                                    textAlign="left"
                                />
                                <View style={styles.pinContainer}>
                                    <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                                </View>
                                <View style={styles.metaContainer}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.forgotPin}
                                        onPress={handleForgotPin}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={19}
                                            text="Forgot PIN"
                                            textAlign="left"
                                            color={ROYAL_BLUE}
                                        />
                                    </TouchableOpacity>
                                    {isBiometricAvailable && biometricEnabled && (
                                        <TouchableOpacity onPress={handleTouch}>
                                            <Image
                                                style={styles.touchIcon}
                                                source={
                                                    biometricType === Biometrics.FaceID
                                                        ? Images.biometricFaceId
                                                        : Images.biometricPrintCircular
                                                }
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <NumericalKeyboard
                                value={pin}
                                onChangeText={handleKeyboardChange}
                                maxLength={6}
                                onDone={handleKeyboardDone}
                            />
                        </View>
                    </ScreenLayout>
                </ScreenContainer>
                {/* because its in modal so we need to use it in here. USE REF ONLY */}
                <FlashMessage MessageComponent={renderToastComponent} ref={toastRef} />
                {/* </Animatable.View> */}
            </LogGesture>
        </Modal>
    );
}

PinAndBiometricAuth.propTypes = {
    client: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    onLoginSuccess: PropTypes.func,
    onLoginFailed: PropTypes.func,
    onLoginCancelled: PropTypes.func,
};

export default withModelContext(PinAndBiometricAuth);

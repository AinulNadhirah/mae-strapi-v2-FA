import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Biometrics from "react-native-biometrics";

import useTempPIN from "@screens/OnBoarding/M2U/useTempPIN";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import EnableBiometrics from "@components/Auth/EnableBiometrics";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { createWalletAndPin } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_PIN_CONFIRM, FA_SETTINGS_CHANGEPIN_CONFIRMPIN } from "@constants/strings";

import * as DataModel from "@utils/dataModel";

function OnboardingConfirmPin({ navigation, route, updateModel }) {
    const [pin, setPin] = useState("");
    const [showBiometric, setShowBiometric] = useState(false);
    const isMaeOnboarding = route?.params?.isMaeOnboarding ?? false;
    const { tempPin, TempPINDisplay, setEmptyPIN } = useTempPIN();

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleKeyboardChange(text) {
        setPin(text);
    }

    function handleOnLaterBiometric() {
        // fix: don't forget to close the biometric
        setShowBiometric(false);

        if (isMaeOnboarding) {
            // mae will go to account straight
            navigation.navigate("OnboardingM2uAccounts", {
                ...route?.params,
                profileName: route?.params?.authData?.cus_name, // the user profile name, probably need to carry on from mae onboarding
            });
        } else {
            // navigate to next screen (OTP)
            navigation.navigate("OnboardingM2uPhoneNumberConfirmation", {
                pin,
                ...route.params,
            });
        }
    }

    function handleBiometricCheck() {
        // check if biometric available, if available, go to enable,
        // else go to otp
        Biometrics.isSensorAvailable()
            .then((biometryType) => {
                if (biometryType) {
                    console.log(biometryType);

                    // if (biometryType && biometryType === Biometrics.TouchID) {
                    setShowBiometric(true);
                    updateModel({
                        device: {
                            isBiometricAvailable: true,
                        },
                    });
                } else {
                    throw new Error("No supported biometric ");
                }
            })
            .catch(() => {
                handleOnLaterBiometric();
            });
    }

    async function handleKeyboardDone() {
        const originalPin = route.params?.pin ?? "";

        if (pin && pin.length === 6 && originalPin === pin) {
            if (route.params?.externalSource) {
                // if have an externalsource param, reroute back to source, with the given pin
                const source = route.params.externalSource;

                // reset param
                navigation.setParams({ externalSource: null });

                navigation.navigate(source?.stack, {
                    screen: source?.screen,
                    params: {
                        pinNo: pin,
                    },
                });
            } else if (isMaeOnboarding) {
                const pinNo = await DataModel.encryptData(pin);
                const params = {
                    pinNo,
                };

                createWalletAndPin(params)
                    .then((response) => {
                        if (response?.data) {
                            handleBiometricCheck();
                        }
                    })
                    .catch((error) => {
                        showErrorToast({
                            message: error.message,
                        });
                    });
            } else {
                // create wallet
                handleBiometricCheck();
            }
        } else {
            if (pin.length < 6) {
                showErrorToast({
                    message: "PIN must consist of at least 6 digits.",
                });
            } else if (originalPin !== pin) {
                showErrorToast({
                    message: "PIN must match the 6-digit PIN created.",
                });
            }

            setPin("");
        }
    }

    function handleOnEnableBiometric() {
        setShowBiometric(false);
        if (isMaeOnboarding) {
            // mae will go to account straight
            navigation.navigate("OnboardingM2uAccounts", {
                ...route?.params,
                profileName: route?.params?.authData?.cus_name, // the user profile name, probably need to carry on from mae onboarding
            });
        } else {
            navigation.navigate("OnboardingM2uPhoneNumberConfirmation", {
                pin,
                ...route.params,
            });
        }
    }

    function onPinPress() {
        handleKeyboardChange(tempPin);
        setEmptyPIN();
    }

    const analyticScreenName = route?.params?.externalSource
        ? FA_SETTINGS_CHANGEPIN_CONFIRMPIN
        : FA_PIN_CONFIRM;
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            headerRightElement={
                                !route.params?.externalSource ? (
                                    <HeaderCloseButton onPress={handleClose} />
                                ) : null
                            }
                        />
                    }
                    scrollable
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
                                    route.params?.externalSource
                                        ? "Confirm your new 6-digit PIN"
                                        : "Confirm your 6-digit PIN"
                                }
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>
                <TempPINDisplay onPinPress={onPinPress} />
                <NumericalKeyboard
                    value={pin}
                    onChangeText={handleKeyboardChange}
                    maxLength={6}
                    onDone={handleKeyboardDone}
                />
                {showBiometric && (
                    <EnableBiometrics
                        onClose={handleOnLaterBiometric}
                        onEnable={handleOnEnableBiometric}
                        onSetupLater={handleOnLaterBiometric}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

OnboardingConfirmPin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
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

export default withModelContext(OnboardingConfirmPin);

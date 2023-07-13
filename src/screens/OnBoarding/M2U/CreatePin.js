import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import useTempPIN from "@screens/OnBoarding/M2U/useTempPIN";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, FADE_GREY } from "@constants/colors";
import { FA_PIN_CREATE, FA_SETTINGS_CHANGEPIN_NEW_PIN } from "@constants/strings";

function OnboardingCreatePin({ navigation, route }) {
    const [pin, setPin] = useState("");
    const { tempPin, TempPINDisplay, setEmptyPIN } = useTempPIN();

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleBack() {
        if (route.params?.externalSource) {
            // if have an externalsource param, reroute back to source, with the given pin
            const source = route.params.externalSource;

            // reset param
            navigation.setParams({ externalSource: null });

            navigation.navigate(source?.stack, {
                screen: source?.screen,
                params: {
                    status: "cancel",
                },
            });
        } else {
            navigation.canGoBack() && navigation.goBack();
        }
    }

    function handleKeyboardChange(text) {
        setPin(text);
    }
    function handleKeyboardDone() {
        if (pin && pin.length === 6) {
            navigation.navigate("OnboardingM2uConfirmPin", {
                pin,
                ...route.params,
            });
        } else {
            showErrorToast({
                message: "PIN must consist of at least 6 digits.",
            });
            setPin("");
        }
    }

    function onPinPress() {
        handleKeyboardChange(tempPin);
        setEmptyPIN();
    }

    const analyticScreenName = route?.params?.externalSource
        ? FA_SETTINGS_CHANGEPIN_NEW_PIN
        : FA_PIN_CREATE;

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
                            headerLeftElement={
                                route.params?.externalSource ? (
                                    <HeaderBackButton onPress={handleBack} />
                                ) : null
                            }
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
                                        ? "Create your new PIN for the app"
                                        : "Create your PIN for the app"
                                }
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                color={FADE_GREY}
                                text="The 6-digit PIN will be used each time you access your account or as backup to your biometric login."
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
            </>
        </ScreenContainer>
    );
}

OnboardingCreatePin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
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

export default OnboardingCreatePin;

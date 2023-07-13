import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Typo from "@components/Text";
import { FA_SETTINGS_CHANGEPIN_CURRENT_PIN } from "@constants/strings";
import { MEDIUM_GREY, ROYAL_BLUE } from "@constants/colors";
import { TAB_NAVIGATOR, SETTINGS_MODULE, FORGOT_PINSCREEN } from "@navigation/navigationConstant";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";
import OtpPin from "@components/OtpPin";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { withModelContext } from "@context";
import { encryptData } from "@utils/dataModel";
import { updateWalletPIN, findAndm2uLinked } from "@services";
import NumericalKeyboard from "@components/NumericalKeyboard";

function ChangePin({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [pin, setPin] = useState("");

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleKeyboardChange(text) {
        setPin(text);

        if (text.length === 6) handleVerifyPin(text);
    }

    async function handleVerifyPin(pin) {
        const pinNo = await encryptData(pin);

        setLoading(true);

        try {
            const response = await findAndm2uLinked({ pinNo });

            if (response && response?.data?.m2uLinked) {
                // go to change pin
                navigation.navigate("Onboarding", {
                    screen: "OnboardingM2uCreatePin",
                    params: {
                        externalSource: {
                            stack: SETTINGS_MODULE,
                            screen: "ChangePin",
                        },
                    },
                });
            } else {
                throw new Error();
            }
        } catch (error) {
            setPin("");
            setLoading(false);

            showErrorToast({
                message: "Incorrect PIN entered",
            });
        }
    }

    function handleKeyboardDone() {
        if (pin && pin.length === 6) {
            handleVerifyPin(pin);
        } else {
            showErrorToast({
                message: "PIN must consist of at least 6 digits.",
            });

            setPin("");
        }
    }

    function handleForgetPin() {
        navigation.navigate(FORGOT_PINSCREEN);
    }

    useFocusEffect(
        useCallback(() => {
            // we got auth to change mobile no
            const handleUpdatePin = async () => {
                const pinNo = await encryptData(route?.params?.pinNo);
                const params = {
                    pinNo,
                };

                try {
                    const response = await updateWalletPIN(params);

                    if (response && response?.data?.code === 0) {
                        showSuccessToast({
                            message: "PIN successfully updated.",
                        });
                        GASettingsScreen.onSuccessfulPINChange();
                    }
                } catch (error) {
                    showErrorToast({
                        message: "PIN unsuccessfully updated.",
                    });

                    console.log(error);
                } finally {
                    setLoading(false);
                    navigation.goBack();
                }
            };

            if (route?.params?.pinNo) {
                handleUpdatePin();
            }

            if (route?.params?.status === "cancel") {
                navigation.goBack();
            }

            return () => navigation.setParams({ pinNo: null });
        }, [navigation, route])
    );

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
            analyticScreenName={FA_SETTINGS_CHANGEPIN_CURRENT_PIN}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={26}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    scrollable
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
                                text="Enter your current PIN"
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                            <TouchableOpacity onPress={handleForgetPin}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Forgot PIN"
                                    textAlign="left"
                                    color={ROYAL_BLUE}
                                />
                            </TouchableOpacity>
                        </View>
                        <NumericalKeyboard
                            value={pin}
                            onChangeText={handleKeyboardChange}
                            maxLength={6}
                            onDone={handleKeyboardDone}
                        />
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

ChangePin.propTypes = {
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

export default withModelContext(ChangePin);

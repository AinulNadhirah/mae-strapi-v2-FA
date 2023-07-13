import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Typography from "@components/Text";
import OtpPin from "@components/OtpPin";
import { showErrorToast } from "@components/Toast";
import NumericalKeyboard from "@components/NumericalKeyboard";
import { MEDIUM_GREY, FADE_GREY } from "@constants/colors";
import { invokeL3 } from "@services";
import { ErrorLogger } from "@utils/logs";

function CreditCardSetPin({ navigation, route }) {
    const [pin, setPin] = useState("");

    useEffect(() => {
        checkL3Permission();
    }, [checkL3Permission, navigation]);

    async function _requestL3Permission() {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    }

    const checkL3Permission = useCallback(async () => {
        const request = await _requestL3Permission();
        if (!request) {
            navigation.goBack();
            return;
        }
    }, [navigation]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(text) {
        setPin(text);
    }
    function handleKeyboardDone() {
        if (pin && pin.length === 6) {
            navigation.navigate("CCConfirmPinScreen", {
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

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    scrollable
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Set Card PIN"
                                textAlign="left"
                            />
                            <Typography
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Enter your 6-digit PIN"
                                textAlign="left"
                            />
                            <Typography
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                color={FADE_GREY}
                                text="This PIN will be used for ATM withdrawals and purchases."
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>

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
CreditCardSetPin.propTypes = {
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

export default CreditCardSetPin;

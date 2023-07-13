import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Config from "react-native-config";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { onboardingOtp } from "@services";
import { logEvent } from "@services/analytics";

import { FADE_GREY, MEDIUM_GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_ONBOARD_WELCOME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_USE_A_DIFFERENT_NUMBER,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";

function OnboardingPhoneNumberConfirmation({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const _loading = useRef(false);
    const phoneNumber =
        route?.params?.phone.indexOf("XXXX") > -1
            ? route.params.phone
            : maskedMobileNumber(`${route.params.phone}`);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARD_WELCOME,
        });
    }, []);

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    async function handleProceedOtp() {
        if (!loading && !_loading.current) {
            const params = {
                m2uPasswd: route?.params?.pw,
                m2uUsername: route?.params?.username,
            };

            _loading.current = true;
            setLoading(true);

            // call API for OTP
            try {
                const response = await onboardingOtp(params, false);

                if (response) {
                    const { data } = response;

                    if (data && data.message === "successful") {
                        navigation.navigate("OnboardingM2uOtp", {
                            ...route.params,
                            otp: Config?.DEV_ENABLE === "true" ? data?.result?.otpValue : "",
                        });
                    }
                }
            } catch (error) {
                console.log("Error getting OTP");
            } finally {
                _loading.current = false;
                setLoading(false);
            }
        }
    }

    function handleChangePhone() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_ONBOARD_WELCOME,
            [FA_ACTION_NAME]: FA_USE_A_DIFFERENT_NUMBER,
        });

        navigation.navigate("OnboardingM2uChangePhoneNumber", {
            ...route.params,
        });
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
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Verify Number"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={`Your mobile number in our records is ${phoneNumber}. Would you like to set up MAE by Maybank2u with this number?`}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                text="Changing your number will not replace your current mobile number used for Maybank2u transactions."
                                textAlign="left"
                                color={FADE_GREY}
                            />
                        </View>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    disabled={_loading.current}
                                    isLoading={loading}
                                    borderRadius={25}
                                    onPress={handleProceedOtp}
                                    backgroundColor={YELLOW}
                                    testID="phone_number_proceed"
                                    componentCenter={
                                        <Typo
                                            text="Yes, Proceed"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                                <TouchableOpacity
                                    disabled={_loading.current}
                                    onPress={handleChangePhone}
                                    activeOpacity={0.8}
                                    testID="phone_number_change"
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Use a Different Number"
                                        textAlign="left"
                                        style={styles.changeNumber}
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}
OnboardingPhoneNumberConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    label: {
        paddingVertical: 8,
    },
});

export default OnboardingPhoneNumberConfirmation;

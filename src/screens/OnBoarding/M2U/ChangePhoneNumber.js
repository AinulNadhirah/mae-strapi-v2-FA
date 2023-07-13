import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { onboardingOtp, contactValidation } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, FADE_GREY } from "@constants/colors";
import { FA_ONBOARD_MOBILENUMBER, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { validateBlacklistContacts } from "@utils";
import { isMalaysianMobileNum } from "@utils/dataModel";

function formatNumber(number) {
    return number.toString().replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
        let output = "";
        if (p1) output = `${p1}`;
        if (p2) output += ` ${p2}`;
        if (p3) output += ` ${p3}`;
        return output;
    });
}

function OnboardingChangePhoneNumber({ navigation, route }) {
    const [phoneNo, setPhoneNo] = useState("");
    const [formattedPhoneNo, setformattedPhoneNo] = useState("");
    const [error, setError] = useState(false);
    const { getModel } = useModelController();
    const { isContactBlacklistingValidation } = getModel("misc");

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARD_MOBILENUMBER,
        });
    }, []);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleKeyboardChange(value) {
        if (error) setError(false);

        setPhoneNo(value);
        setformattedPhoneNo(formatNumber(value));
    }

    async function handleProceedOtp() {
        const params = {
            m2uPasswd: route?.params?.pw,
            m2uUsername: route?.params?.username,
            phoneNo: `60${phoneNo}`,
        };

        // call API for OTP
        try {
            const response = await onboardingOtp(params, true);

            if (response) {
                const { data } = response;

                if (data && data.message === "successful") {
                    const {
                        result: { otpValue },
                    } = data;

                    navigation.navigate("OnboardingM2uOtp", {
                        ...route.params,
                        phone: `60${phoneNo}`,
                        otp: otpValue,
                    });
                }
            }
        } catch (error) {
            console.log("Error getting OTP");
        }
    }

    async function handleKeyboardDone() {
        const params = {
            userName: route?.params?.username,
            phoneNo,
        };
        if (phoneNo.length >= 8 && phoneNo.length <= 10 && isMalaysianMobileNum(`60${phoneNo}`)) {
            const { status, message } = await validateBlacklistContacts(
                isContactBlacklistingValidation,
                params,
                contactValidation
            );
            status
                ? handleProceedOtp()
                : showErrorToast({
                      message,
                  });
        } else {
            setError(true);
            setPhoneNo("");
            setformattedPhoneNo("");
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
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Welcome Onboard"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="What's your mobile number?"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.info}
                                color={FADE_GREY}
                                text="Take note that this number will not replace your current mobile number used for Maybank2u transactions."
                                textAlign="left"
                            />
                            <TextInput
                                importantForAutofill="no"
                                maxLength={18}
                                editable={false}
                                value={formattedPhoneNo}
                                prefix="+60"
                                isValidate
                                isValid={!error}
                                errorMessage={
                                    "Please enter a valid mobile number in order to continue."
                                }
                            />
                        </View>
                        <NumericalKeyboard
                            value={phoneNo}
                            onChangeText={handleKeyboardChange}
                            maxLength={11}
                            onDone={handleKeyboardDone}
                        />
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OnboardingChangePhoneNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    info: {
        paddingBottom: 8,
    },
    label: {
        paddingVertical: 8,
    },
    meta: {
        paddingHorizontal: 36,
    },
});

export default OnboardingChangePhoneNumber;

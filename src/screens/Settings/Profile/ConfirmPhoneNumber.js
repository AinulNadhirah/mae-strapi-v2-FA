import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Config from "react-native-config";

import { SETTINGS_OTP_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

// import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { requestOTP, createOtp, requesandValidateOTP } from "@services";
import { logEvent } from "@services/analytics";

import { OTP_TYPE_CREATEUSER } from "@constants/api";
import { MEDIUM_GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_OTP_REQUEST } from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { contactBankcall } from "@utils/dataModel/utility";

function ConfirmPhoneNumber({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const phoneNumber = maskedMobileNumber(`${route?.params?.phone}`);
    const [notMine, setNotMine] = useState(false);
    const otpType = route?.params?.otpType ?? "";
    const otpTypeVerify = route?.params?.otpTypeVerify ?? "";
    const otpParams = route?.params?.otpParams ?? {};
    const reqParams = route?.params?.externalSource?.params?.reqParams;
    const regBody = route?.params?.externalSource?.params?.reqParams?.reqBody ?? {};

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    async function handleProceedOtp() {
        setLoading(true);

        if (reqParams) {
            const reqURL = reqParams?.reqOTPURL ?? "";

            try {
                const response = await requesandValidateOTP(reqURL, regBody);

                if (response && response.data) {
                    if (response.data.statusDesc === "Success") {
                        navigation.navigate(SETTINGS_OTP_SCREEN, {
                            ...route.params,
                            otp: Config?.DEV_ENABLE === "true" ? response?.data?.token : "",
                        });

                        return;
                    }
                    throw new Error(response.data.statusDesc);
                } else {
                    throw new Error("Couldn't get response for OTP");
                }
            } catch (error) {
                showErrorToast({
                    message: error.message ?? "Something is wrong. Try again later.",
                });
            } finally {
                setLoading(false);
            }
            return;
        }

        if (otpType) {
            const params = {
                fundTransferType: otpType,
                ...otpParams,
            };

            try {
                const response = await createOtp("/tac", params);

                if (response && response.data) {
                    navigation.navigate(SETTINGS_OTP_SCREEN, {
                        ...route.params,
                        otpType: otpTypeVerify || otpType,
                        otp: Config?.DEV_ENABLE === "true" ? response?.data?.token : "",
                    });
                    new Error("Couldn't get response for OTP");
                } else {
                    throw new Error("Couldn't get response for OTP");
                }
            } catch (error) {
                showErrorToast({
                    message: error.message ?? "Something is wrong. Try again later.",
                });
            } finally {
                setLoading(false);
            }
        } else {
            const params = {
                mobileNo: route?.params?.phone,
                otpType: OTP_TYPE_CREATEUSER,
                transactionType: route?.params?.type ?? undefined,
            };

            try {
                const response = await requestOTP(params);

                if (response && response.data) {
                    navigation.navigate(SETTINGS_OTP_SCREEN, {
                        ...route.params,
                        otp: Config?.DEV_ENABLE === "true" ? response?.data?.result?.otpValue : "",
                    });
                } else {
                    throw new Error("Couldn't get response for OTP");
                }
            } catch (error) {
                showErrorToast({
                    message: error.message ?? "Something is wrong. Try again later.",
                });
            } finally {
                setLoading(false);
            }
        }
    }
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_REQUEST,
        });
    }, []);

    function handleChangePhone() {
        if (route?.params?.externalSource) {
            setNotMine(true);
        } else {
            navigation.navigate("ChangePhoneNumber", {
                ...route?.params,
            });
        }
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={24}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            // headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="One Time Password"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={`Your OTP will be sent to\n${phoneNumber}. Please confirm your mobile number.`}
                                textAlign="left"
                            />
                        </View>
                        <View style={styles.footer}>
                            <ActionButton
                                fullWidth
                                disabled={loading}
                                isLoading={loading}
                                borderRadius={25}
                                onPress={handleProceedOtp}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        text="Confirm"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                            <TouchableOpacity
                                disabled={loading}
                                onPress={handleChangePhone}
                                activeOpacity={0.8}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={
                                        route?.params?.externalSource
                                            ? "Not Mine"
                                            : "Use a Different Number"
                                    }
                                    textAlign="left"
                                    style={styles.changeNumber}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={notMine}
                    onClose={handleCloseNotMine}
                    title="Contact Bank"
                    description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                    primaryAction={{
                        text: "Call Now",
                        onPress: handleCallHotline,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

ConfirmPhoneNumber.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    label: {
        paddingVertical: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default ConfirmPhoneNumber;

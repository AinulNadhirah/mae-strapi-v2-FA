import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Config from "react-native-config";
import CountDown from "react-native-countdown-component";

import { TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpDisplay from "@components/OtpDisplay";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import { onboardingValidateOtp, onboardingOtp } from "@services";
import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { addDevice } from "@services/api/methods";

import { MEDIUM_GREY, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    FA_OTP_VALIDATE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    ONE_TIME_PASSWORD,
    OTP_ERR_MSG,
    RESEND_OTP_SCREEN,
} from "@constants/strings";
import { TAC_RESEND_COUNTDOWN_SECONDS } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import * as DataModel from "@utils/dataModel";
import {
    getDeviceRSAInformation,
    saveAndSetDigitalIdentity,
    saveCloudToken,
    setCloudTokenRequired,
} from "@utils/dataModel/utility";

const TRANSPARENT = "transparent";
const PH_MASK_CHARS = ["XXXX", "****"];
const now = moment().valueOf();

function OnboardingOtp({ navigation, route, getModel, updateModel, api }) {
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [tempOtp, setTempOtp] = useState(Config?.DEV_ENABLE === "true" ? route.params?.otp : "");
    const [isCountdownOver, setCountdownOver] = useState(false);
    const [randomId, setRandomId] = useState(now);
    const { deviceInformation, deviceId } = getModel("device");
    const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_VALIDATE,
        });
    }, []);

    const phoneNumber =
        route?.params?.phone.indexOf("XXXX") > -1
            ? route.params.phone
            : maskedMobileNumber(`${route.params.phone}`);

    function checkIfMaskedNumber(maskedNo) {
        return PH_MASK_CHARS.some((mask) => maskedNo.includes(mask));
    }

    function handleClose() {
        updateModel({
            auth: {
                token: "",
                refreshToken: "",
            },
        });

        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleCountdownFinish() {
        setCountdownOver(true);
        setIsDisabled(true);
    }

    function handleKeyboardChange(text) {
        !isCountdownOver && setOtp(text);
    }

    async function addNewDevice(otpResponse) {
        const params = {
            mobileSDKData,
        };

        try {
            const response = await addDevice(api, params);

            if (response && response.data) {
                // go to create profile name
                navigation.navigate("OnboardingM2uProfile", {
                    ...route?.params,
                    authData: otpResponse,
                });
            }
        } catch (error) {
            showErrorToast({
                message: "Could not register the device. Try again.",
            });
        }
    }

    async function handleKeyboardDone() {
        if (!isCountdownOver && otp && otp.length === 6) {
            const username = route?.params?.username;
            const phoneNo = checkIfMaskedNumber(route?.params?.phone)
                ? ""
                : `${route?.params?.phone}`;
            const pw = route?.params?.pw;
            const encryptedPin = await DataModel.encryptData(route?.params?.pin);
            const encryptedOtp = await DataModel.encryptData(otp);

            // validate the OTP
            const params = {
                grantType: "PASSWORD",
                tokenType: "LOGIN",
                username,
                passwd: pw,
                mobileSDKData,
                // mobileSDKData: {
                //     deviceDetail: deviceInformation.DeviceName,
                //     deviceId,
                //     deviceModel: deviceInformation.DeviceModel,
                //     deviceName: deviceInformation.DeviceName,
                //     devicePrint: deviceInformation.DeviceName,
                //     osType: Platform.OS,
                //     osVersion: deviceInformation.DeviceSystemVersion,
                //     rsaKey: deviceInformation.RSA_ApplicationKey,
                // },
                pinNo: encryptedPin,
                otp: encryptedOtp,
                phoneNo,
            };

            await setCloudTokenRequired(params);

            setLoading(true);

            try {
                const response = await onboardingValidateOtp(params, true);

                if (response && response.data && response.data.access_token) {
                    const {
                        access_token,
                        refresh_token,
                        contact_number,
                        cus_key,
                        cus_type,
                        cus_segment,
                        cus_name,
                        digitalIdentity,
                        cloudToken,
                        serverDate,
                    } = response.data;

                    if (!cus_key) {
                        console.log("Missing cus_key");
                        throw new Error("Something wrong. Try again later.");
                    }

                    // hide any toast just in case
                    hideToast();

                    // update context with the token, so ApiManager will be able to use it
                    updateModel({
                        auth: {
                            token: access_token,
                            refreshToken: refresh_token,
                        },
                        m2uDetails: {
                            m2uPhoneNumber: contact_number,
                        },
                        user: {
                            soleProp: cus_type === "02",
                            cus_type,
                            cus_segment,
                            cus_name,
                            icNumber: response?.data?.ic_number,
                        },
                    });

                    // wait till context done, then add the device and go to profile
                    addNewDevice(response.data);

                    await saveAndSetDigitalIdentity(serverDate, digitalIdentity, getModel);

                    await saveCloudToken(cloudToken);
                } else {
                    console.log(response.data?.message);

                    throw new Error(response.data?.message ?? "You have entered invalid OTP");
                }
            } catch (error) {
                console.log(error);
                setOtp("");
                setLoading(false);

                if (error && error.error && error.error.error == "suspended") {
                    return;
                }

                showErrorToast({
                    message:
                        error.message || error?.error?.message || "You have entered invalid OTP",
                });
            }
        } else {
            showErrorToast({
                message: OTP_ERR_MSG,
            });
        }
    }

    async function handleResendOtp() {
        if (isCountdownOver) {
            // send otp
            const params = {
                m2uPasswd: route?.params?.pw,
                m2uUsername: route?.params?.username,
                phoneNo: checkIfMaskedNumber(route?.params?.phone) ? "" : `${route?.params?.phone}`,
            };

            // call API for OTP
            try {
                const response = await onboardingOtp(params, true);

                if (response) {
                    const { data } = response;

                    if (data && data.message === "successful") {
                        Config?.DEV_ENABLE === "true" && setTempOtp(data?.result?.otpValue);
                        const timestamp = moment().valueOf();

                        // update the countdown
                        setCountdownOver(false);
                        setIsDisabled(false);
                        setRandomId(timestamp);
                    } else {
                        throw new Error(response.data);
                    }
                }
            } catch (error) {
                showErrorToast({
                    message: error.message,
                });
                console.log("Error getting OTP");
            }
        }
    }

    function onOtpPress() {
        handleKeyboardChange(tempOtp);

        Config?.DEV_ENABLE === "true" && setTempOtp("");
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
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
                    neverForceInset={["bottom"]}
                    scrollable
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={ONE_TIME_PASSWORD}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={`Enter OTP sent to \n${phoneNumber}`}
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={otp} space="15%" ver={8} hor={8} border={5} />
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.countdownContainer}
                                disabled={!isCountdownOver}
                                onPress={handleResendOtp}
                            >
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    lineHeight={19}
                                    textAlign="left"
                                >
                                    {isCountdownOver ? (
                                        <>
                                            <Text>OTP timeout. </Text>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                color={ROYAL_BLUE}
                                                text={RESEND_OTP_SCREEN}
                                            />
                                        </>
                                    ) : (
                                        <Text>Resend OTP in</Text>
                                    )}
                                </Typo>
                                <CountDown
                                    id={`${randomId}`}
                                    until={TAC_RESEND_COUNTDOWN_SECONDS}
                                    onFinish={handleCountdownFinish}
                                    size={7}
                                    timeToShow={["M", "S"]}
                                    timeLabels={{ m: null, s: null }}
                                    digitStyle={styles.digitStyle}
                                    separatorStyle={styles.separatorStyle}
                                    digitTxtStyle={styles.digitTextStyle}
                                    style={[
                                        styles.countdown,
                                        isCountdownOver && styles.hideCountdown,
                                    ]}
                                    showSeparator
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScreenLayout>
                {!!tempOtp && (
                    <OtpDisplay text={`Your OTP no. is ${tempOtp}`} onPress={onOtpPress} />
                )}
                <NumericalKeyboard
                    value={otp}
                    onChangeText={handleKeyboardChange}
                    maxLength={6}
                    onDone={handleKeyboardDone}
                    disabled={isDisabled}
                />
            </>
        </ScreenContainer>
    );
}
OnboardingOtp.propTypes = {
    api: PropTypes.object,
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    countdown: {
        fontFamily: "montserrat",
        paddingHorizontal: 4,
    },
    countdownContainer: {
        flexDirection: "row",
    },
    digitStyle: {
        backgroundColor: TRANSPARENT,
        fontFamily: "montserrat",
    },
    digitTextStyle: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        lineHeight: 18,
        textAlign: "center",
        width: 26,
    },
    hideCountdown: {
        opacity: 0,
    },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    pinContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    separatorStyle: {
        backgroundColor: TRANSPARENT,
        margin: 0,
        padding: 0,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withApi(withModelContext(OnboardingOtp));

import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform, Text } from "react-native";
import Config from "react-native-config";
import CountDown from "react-native-countdown-component";

import {
    BANKINGV2_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpDisplay from "@components/OtpDisplay";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import * as services from "@services";
import { logEvent } from "@services/analytics";

import { OTP_TYPE_CREATEUSER } from "@constants/api";
import { MEDIUM_GREY, BLACK, ROYAL_BLUE } from "@constants/colors";
import { WRONG_OTP } from "@constants/data";
import {
    DUITNOW_TXN_FAIL,
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

import * as DuitNowController from "../DuitNow/DuitNowController";

const TRANSPARENT = "transparent";
const now = moment().valueOf();

function Otp({ navigation, route }) {
    const { getModel } = useModelController();
    const [otp, setOtp] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [tempOtp, setTempOtp] = useState(Config?.DEV_ENABLE === "true" ? route.params?.otp : "");
    const [randomId, setRandomId] = useState(now);
    const [isCountdownOver, setCountdownOver] = useState(false);
    const { fullName } = getModel("user");
    const phoneNumber = maskedMobileNumber(`${route.params.phone}`);
    const otpType = route?.params?.otpType;
    const otpParams = route?.params?.otpParams ?? {};
    const reqParams = route?.params?.externalSource?.params?.reqParams;
    const serviceName = route?.params?.serviceName;
    const serviceParams = route?.params?.serviceParams ?? {};
    const onServiceCompleteNav = route?.params?.onServiceCompleteNav ?? {};

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_VALIDATE,
        });
    }, []);

    function handleClose() {
        const { externalSource } = route.params;
        if (externalSource) {
            if (externalSource?.params?.from === "asnbconsent") {
                const { origin, index } = externalSource?.params;
                if (origin === BANKINGV2_MODULE) {
                    navigation.navigate("TabNavigator", {
                        screen: "Tab",
                        params: {
                            screen: "Maybank2u",
                            params: {
                                index,
                            },
                        },
                    });
                } else {
                    navigation.navigate(FUNDTRANSFER_MODULE, {
                        screen: TRANSFER_TAB_SCREEN,
                        params: { index, screenDate: { routeFrom: "ASNBConsent" } },
                    });
                }
                return;
            }
            navigation.navigate(externalSource.stack, {
                screen: externalSource.screen,
            });
        } else {
            // go to to setting sprofile
            navigation.navigate("Profile");
        }
    }
    function showErrorMessage(message) {
        showErrorToast({
            message,
        });
    }

    function handleCountdownFinish() {
        setCountdownOver(true);
        setIsDisabled(true);
    }

    function handleKeyboardChange(text) {
        !isCountdownOver && setOtp(text);
    }

    function onOtpPress() {
        handleKeyboardChange(tempOtp);
        setTempOtp("");
    }

    async function handleKeyboardDone() {
        if (!isCountdownOver && otp && otp.length === 6) {
            const mobileNo = route.params.phone;

            if (reqParams) {
                const { externalSource } = route.params;
                const { from } = externalSource?.params;

                if (from === "register") {
                    duitNowRegister();
                } else if (from === "asnbconsent") {
                    asnbConsent();
                } else {
                    duitNowSwitchAccount();
                }
                return;
            }

            // if otp type exists, we uses the 2fa API, else the user OTP
            if (otpType) {
                const params = {
                    fundTransferType: otpType,
                    // based on transfertagscreen, otp doesn't seems to be encrypt, so...
                    tacNumber: otp,
                };

                try {
                    const response = await services.createOtp("/tac/validate", params);

                    if (response && response.data && response.data.responseStatus === "0000") {
                        if (route?.params?.externalSource) {
                            const { externalSource } = route.params;
                            navigation.navigate(externalSource.stack, {
                                screen: externalSource.screen,
                                params: {
                                    auth: response.data.statusDesc,
                                    ...externalSource.params,
                                    s2uTransactionId: response.data.s2uTransactionId,
                                },
                            });
                        }
                    } else {
                        throw new Error("Couldn't get response for OTP");
                    }
                } catch (error) {
                    setOtp("");

                    showErrorMessage(error?.error?.message || error.message);
                }
            } else {
                const encryptedOtp = await DataModel.encryptData(otp);

                if (route?.params?.externalSource) {
                    const { deviceInformation, deviceId } = getModel("device");
                    const params = {
                        mobileNo,
                        fullName,
                        otp: encryptedOtp,
                        deviceId,
                        deviceOs: Platform.OS,
                        deviceOsVersion: deviceInformation.DeviceSystemVersion,
                        deviceDetail: deviceInformation.DeviceName,
                    };

                    try {
                        const response = await services.validateOTP(params);

                        if (response && response.data && response.data.message === "successful") {
                            const { externalSource } = route.params;
                            navigation.navigate(externalSource.stack, {
                                screen: externalSource.screen,
                                params: {
                                    auth: response.data.message,
                                    ...externalSource.params,
                                },
                            });
                        }
                    } catch (error) {
                        console.log(error);

                        setOtp("");

                        showErrorMessage(error?.error?.message || error?.message);
                    }
                } else if (serviceName) {
                    // try to call the service
                    try {
                        const response = await services[serviceName]({
                            ...serviceParams,
                            otp: encryptedOtp,
                        });

                        if (response) {
                            if (onServiceCompleteNav?.stack) {
                                navigation.navigate(onServiceCompleteNav?.stack, {
                                    screen: onServiceCompleteNav?.screen,
                                    params: {
                                        serviceResult: "success",
                                        serviceParams,
                                    },
                                });
                            }
                        }
                    } catch (error) {
                        console.log(error);

                        setOtp("");

                        showErrorMessage(error?.error?.message || error?.message);
                    }
                }
            }
        } else {
            setOtp("");

            if (otp.length < 6) {
                showErrorMessage(OTP_ERR_MSG);
            }
        }
    }

    async function asnbConsent() {
        try {
            const { externalSource } = route.params;
            const { otpSubmissionParams, reqParams } = externalSource.params;
            const params = { ...otpSubmissionParams, tac: otp, tacLength: otp.length };
            const response = await services.submitASNBConsent(reqParams?.validateOTPURL, params);
            if (response.message) {
                setOtp("");
                showErrorMessage(response.message || DUITNOW_TXN_FAIL);
            } else {
                const result = response.data;
                const resultParam = { ...externalSource.params, ...result };
                if (result.statusCode === "0000") {
                    navigation.navigate(externalSource.stack, {
                        screen: externalSource.screen,
                        params: {
                            isLinkingSuccess: true,
                            ...resultParam,
                        },
                    });
                    return;
                } else if (result.statusCode === "00A5") {
                    showErrorMessage(result?.statusDesc ? result?.statusDesc : WRONG_OTP);
                } else {
                    showErrorMessage(result?.statusDesc ? result?.statusDesc : DUITNOW_TXN_FAIL);
                }
                setOtp("");
            }
        } catch (e) {
            setOtp("");
            showErrorMessage(e.message || DUITNOW_TXN_FAIL);
        }
    }

    async function duitNowRegister() {
        const { externalSource } = route.params;
        const { screenParams } = externalSource.params;
        try {
            const accountDetails = screenParams?.selectedAccount;
            const params = DuitNowController.getServiceParams(screenParams, accountDetails, otp);
            const response = await DuitNowController.getDuitNowAPICall(params);
            if (response.message) {
                DuitNowController.getDuitNowGADetails(screenParams?.serviceType, false);
                showErrorMessage(response.message || DUITNOW_TXN_FAIL);
            } else {
                const result = response.data.result;
                if (result.status === "SUCCESS") {
                    DuitNowController.getDuitNowGADetails(screenParams?.serviceType, true);
                    navigation.navigate(externalSource.stack, {
                        screen: externalSource.screen,
                        params: {
                            auth: "successful",
                            ...externalSource.params,
                        },
                    });
                    return;
                }
                DuitNowController.getDuitNowGADetails(screenParams?.serviceType, false);
                showErrorMessage(result?.duitnowResponseList[0]?.esbErrorValue || DUITNOW_TXN_FAIL);
            }
        } catch (e) {
            DuitNowController.getDuitNowGADetails(screenParams?.serviceType, false);

            showErrorMessage(e.message || DUITNOW_TXN_FAIL);
        }
    }

    async function duitNowSwitchAccount() {
        try {
            const { externalSource } = route.params;
            const { screenParams } = externalSource.params;
            const params = DuitNowController.getParams(otp, screenParams);
            const response = await DuitNowController.getDuitNowAPICall(params);

            if (response.message) {
                showErrorMessage(response.message || DUITNOW_TXN_FAIL);
            } else {
                const result = response.data.result;
                if (result.status === "SUCCESS") {
                    navigation.navigate(externalSource.stack, {
                        screen: externalSource.screen,
                        params: {
                            auth: "successful",
                            selectedAccInfo: screenParams.selectedAccInfo,
                            selectedProxyInfo: screenParams.selectedProxyInfo,
                        },
                    });
                } else {
                    navigation.navigate(externalSource.stack, {
                        screen: externalSource.screen,
                        params: {
                            auth: "fail",
                            seletedItem: screenParams.selectedProxyInfo,
                            errorobj: result?.duitnowResponseList[0],
                        },
                    });
                }
            }
        } catch (e) {
            showErrorMessage(e.message || DUITNOW_TXN_FAIL);
        }
    }

    async function handleResendOtp() {
        if (isCountdownOver) {
            if (reqParams) {
                const reqURL = reqParams?.reqOTPURL ?? "";
                const regBody = reqParams?.reqBody ?? {};

                try {
                    const response = await services.requesandValidateOTP(reqURL, regBody);

                    if (response && response.data && response.data) {
                        if (response.data.statusDesc === "Success") {
                            const timestamp = moment().valueOf();

                            Config?.DEV_ENABLE === "true" &&
                                setTempOtp(response?.data?.token ?? "");
                            setCountdownOver(false);
                            setIsDisabled(false);
                            setRandomId(timestamp);
                            return;
                        }
                        throw new Error(response.data.statusDesc);
                    } else {
                        throw new Error("Couldn't get response for OTP");
                    }
                } catch (error) {
                    showErrorMessage(error.message || DUITNOW_TXN_FAIL);
                }
                return;
            }

            if (otpType) {
                const params = {
                    fundTransferType: "SEC2U_REGISTRATION_REQ",
                    ...otpParams,
                };

                try {
                    const response = await services.createOtp("/tac", params);

                    if (response && response.data) {
                        const timestamp = moment().valueOf();

                        // setTempOtp(token);
                        Config?.DEV_ENABLE === "true" && setTempOtp(response?.data?.token ?? "");
                        setCountdownOver(false);
                        setIsDisabled(false);
                        setRandomId(timestamp);
                    } else {
                        throw new Error("Couldn't get response for OTP");
                    }
                } catch (error) {
                    showErrorMessage(error.message || DUITNOW_TXN_FAIL);
                }
            } else {
                const params = {
                    mobileNo: route?.params?.phone,
                    otpType: OTP_TYPE_CREATEUSER,
                    transactionType: route?.params?.type ?? undefined,
                };

                try {
                    const response = await services.requestOTP(params);

                    if (response && response.data && response.data.result) {
                        const timestamp = moment().valueOf();

                        // setTempOtp(otpValue);
                        Config?.DEV_ENABLE === "true" &&
                            setTempOtp(response.data?.result?.otpValue ?? "");
                        setIsDisabled(false);
                        setCountdownOver(false);
                        setRandomId(timestamp);
                    } else {
                        throw new Error("Couldn't get response for OTP");
                    }
                } catch (error) {
                    showErrorMessage(error.message || DUITNOW_TXN_FAIL);
                }
            }
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={12}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            // headerLeftElement={<HeaderBackButton onPress={handleBack} />}
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
                                    {isCountdownOver
                                        ? (
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
                                        )
                                        : (
                                            <Text>Resend OTP in</Text>
                                        )}
                                </Typo>
                                <CountDown
                                    until={TAC_RESEND_COUNTDOWN_SECONDS}
                                    id={`${randomId}`}
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

Otp.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
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

export default Otp;

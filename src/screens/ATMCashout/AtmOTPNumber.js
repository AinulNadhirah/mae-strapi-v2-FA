import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import DeviceInfo from "react-native-device-info";

import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";

import {
    ATM_CASHOUT_STACK,
    ATM_CASHOUT_STATUS,
    COMMON_MODULE,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { combinedATMActions, requestTAC } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { contactBankcall, getDeviceRSAInformation } from "@utils/dataModel/utility";
import { errorCodeMap } from "@utils/errorMap";

function AtmOTPNumber({ navigation, route, updateModel, getModel }) {
    const [notMine, setNotMine] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [idNumber] = useState(route?.params?.idNum);
    const [mobileNumber] = useState(route?.params?.mobileNum);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [challengeData, setChallengeData] = useState({
        challengeRequest: {},
        isRSARequired: false,
        isRSALoader: false,
        challengeQuestion: "",
        RSACount: 0,
        RSAError: false,
    });
    // const [flow] = useState(route?.params?.flow);

    console.info("challengeData ", challengeData);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(() => {
        setMaskedMobileNumber(maskedMobileNumber(mobileNumber));
    }, [mobileNumber]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    function handleProceedOtp() {
        requestOTP();
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleNotMine() {
        setNotMine(true);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }
    function showLoader(visible) {
        setLoading(visible);
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    }
    function showOTPModal() {
        setShowOTP(true);
    }
    function hideOTPModal() {
        setShowOTP(false);
    }
    function onOTPDone(otp, otpModalErrorCb) {
        if (!loading) {
            showLoader(true);
            verifyOTPApi(otp, null, otpModalErrorCb);
        }
    }

    async function verifyOTPApi(otp, challengeParams = {}, cb) {
        try {
            console.log("### verifyOTPApi challengeParams", challengeParams);
            const deviceInfo = getModel("device");
            const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            const deviceName = await DeviceInfo.getDeviceName();
            const param = {
                requestType: "QRCLW_001",
                mobileSDKData: { ...mobileSDK, deviceName },
                mobileNo: mobileNumber,
                idNumber: idNumber,
                otp: otp,
                transactionType: "QR_CONTACTLESS_WITHDRAWAL_OTP_VERIFY",
                preOrPostFlag: "prelogin",
                idNo: idNumber,
                ...challengeParams,
            };
            const response = await combinedATMActions(param);
            const { code, result } = response?.data;
            console.log("### verifyOTPApi response", response);
            if (code === 200) {
                AsyncStorage.setItem("isAtmEnabled", "true");
                updateModel({
                    atm: {
                        isOnboarded: true,
                        isEnabled: true,
                        lastQrString: "",
                    },
                });
                hideOTPModal();
                navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_CASHOUT_STATUS,
                    params: { ...route?.params },
                });
            } else {
                showLoader(false);
                if (code === 428 || code === 423 || code === 422) {
                    _handleRSA(code, {
                        rsaResponse: result?.rsaStatus
                            ? result
                            : result?.error ?? result?.errors?.error ?? result?.errors ?? result,
                    });
                } else {
                    AsyncStorage.removeItem("isAtmOnboarded");
                    navigation.pop(2);
                    if (!cb) {
                        showErrorToast({
                            message:
                                result?.result?.statusInfoMsg ??
                                result?.statusInfoMsg ??
                                "Something went wrong",
                        });
                    } else {
                        cb(
                            result?.result?.statusInfoMsg ??
                                result?.statusInfoMsg ??
                                "Something went wrong"
                        );
                    }
                }
            }
        } catch (ex) {
            showLoader(false);
            setLoading(false);
            console.log("ex: ", ex);

            AsyncStorage.setItem("isAtmEnabled", "");
            const exObj = errorCodeMap(ex);
            const code = ex?.status;
            const errorMessage = ex?.message || ex?.error?.message || exObj?.message;

            if (
                code === 428 ||
                exObj?.code === 428 ||
                code === 423 ||
                exObj?.code === 423 ||
                code === 422 ||
                exObj?.code === 422
            ) {
                _handleRSA(!code ? exObj?.code : code, {
                    rsaResponse: ex?.rsaStatus
                        ? ex
                        : ex?.error ?? ex?.errors?.error ?? ex?.errors ?? ex,
                });
                return;
            }

            if (!errorMessage?.includes("Wrong TAC")) {
                handleBack();
                showErrorToast({ message: errorMessage });
            } else if (cb && errorMessage) {
                cb(errorMessage);
            } else {
                showErrorToast({ message: errorMessage ?? COMMON_ERROR_MSG });
            }

            showLoader(false);
        } finally {
            showLoader(false);
        }
    }

    function _handleRSA(status, result) {
        showLoader(false);
        hideOTPModal();
        if (status === 428) {
            console.log("_handleRSA: ", result?.rsaResponse);
            setChallengeData({
                challengeRequest: {
                    ...challengeData?.challengeRequest,
                    challenge: result?.rsaResponse?.challenge,
                },
                challengeQuestion: result?.rsaResponse?.challenge?.questionText,
                isRSARequired: true,
                isRSALoader: false,
                RSACount: challengeData?.RSACount + 1,
                RSAError: challengeData.RSACount > 0,
            });
        } else if (status === 423) {
            setChallengeData({
                ...challengeData,
                isRSARequired: false,
            });
            const serverDate = result?.rsaResponse?.serverDate ?? "N/A";
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: result?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            setChallengeData({
                ...challengeData,
                isRSARequired: false,
            });
            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: result?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription: result?.rsaResponse?.statusDescription
                        ? ""
                        : result?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: result?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: {
                        screen: DASHBOARD,
                        params: { refresh: false },
                    },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    }
    function closeOTPModal() {
        setShowOTP(false);
        setToken(null);
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    async function onRsaDone(answer) {
        setChallengeData({ ...challengeData, isRSARequired: false });
        const params = {
            challenge: {
                ...challengeData?.challengeRequest?.challenge,
                answer,
            },
        };
        await verifyOTPApi(token, params);
    }
    function onRsaClose() {
        setChallengeData({ ...challengeData, isRSARequired: false });
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            try {
                const param = {
                    mobileNo: mobileNumber,
                    // otp: "",
                    idNo: idNumber ? idNumber : route?.params?.userAction?.idNumber?.displayValue,
                    fundTransferType: "QR_CONTACTLESS_WITHDRAWAL_OTP_REQ",
                    preOrPostFlag: "prelogin",
                };
                const httpResp = await requestTAC(param, false, "2fa/v1/tac");
                const serverToken = httpResp?.data?.token ?? null;
                // Update token and show OTP modal
                setToken(serverToken);
                showOTPModal();
                if (isResend) showOTPCb();
            } catch (error) {
                console.log("[requestTAC] >> Exception: ", error?.error?.message);
                if (error?.error?.message) {
                    showErrorToast({
                        message: error?.error?.message,
                    });
                    if (error?.error?.message?.includes("already submitted a TAC request")) {
                        handleBack();
                    }
                }
            }
            // const statusCode = httpResp?.data?.statusCode ?? null;
            // const statusDesc = httpResp?.data?.statusDesc ?? null;

            // if (statusCode !== "0000") {
            //     showErrorToast({
            //         message: statusDesc || COMMON_ERROR_MSG,
            //     });
            //     return;
            // }
        },
        [idNumber, mobileNumber, route?.params?.userAction?.idNumber?.displayValue, handleBack]
    );
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <ScreenLayout
                paddingBottom={20}
                paddingTop={0}
                paddingHorizontal={20}
                neverForceInset={["bottom"]}
                useSafeArea
                scrollable
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={handleBack} />} />
                }
            >
                <ConfirmNumberScreen
                    reqType="OTP"
                    otpText="One Time Password"
                    mobileNumber={maskedMobileNo}
                    btnText="Confirm"
                    subBtnText="Not Mine"
                    onConfirmBtnPress={handleProceedOtp}
                    onNotMeBtnPress={handleNotMine}
                />
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
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                />
            )}
            {challengeData?.isRSARequired && (
                <ChallengeQuestion
                    loader={challengeData?.isRSALoader}
                    display={challengeData?.isRSARequired}
                    displyError={challengeData?.RSAError}
                    questionText={challengeData?.challengeQuestion}
                    onSubmitPress={onRsaDone}
                    onSnackClosePress={onRsaClose}
                />
            )}
        </ScreenContainer>
    );
}

AtmOTPNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

export default withModelContext(AtmOTPNumber);

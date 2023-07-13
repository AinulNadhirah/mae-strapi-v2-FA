import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    TAB_NAVIGATOR,
    SECURE2U_COOLING,
    RSA_DENY_SCREEN,
    COMMON_MODULE,
    DEACTIVATE_M2U_CARDS_CASA_LANDING,
    SECURE_SWITCH_STACK,
    TAB,
    DASHBOARD,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { deactivateM2UAccess, requestTACDelete } from "@services";

import {
    DATE_AND_TIME,
    REFERENCE_ID,
    COMMON_ERROR_MSG,
    TRANSACTION_TYPE,
    DEACTIVATE_M2U,
    TRANSACTION_UNSUCCESS,
    DEACTIVATE_M2U_ACCESS,
    DEACTIVATE_M2U_S2U_SUBS,
    USERNAME,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { getDeviceRSAInformation, S2UFlowEnum, removeLocalStorage } from "@utils/dataModel/utility";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

const ATtxnCodeS2u = 55;
const fundTransferType = "M2U_IB_DEACTIVATION";

function M2UDeactivate({ route, navigation, resetModel }) {
    const param = route?.params ?? {};
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [userInputToken, setUserInputToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const { getModel, updateModel } = useModelController();
    const [s2uData, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: DEACTIVATE_M2U_ACCESS },
        secure2uExtraParams: {
            metadata: { txnType: fundTransferType },
        },
        subTitle: DEACTIVATE_M2U_S2U_SUBS,
        s2uTrxRefNo: "",
    });
    const [loadingScreen, setloadingScreen] = useState(true);
    const [showAcknowledgement, setshowAcknowledgement] = useState(false);
    const { deviceId, deviceInformation } = getModel("device");
    const { username } = getModel("user");
    const [successful, setSuccess] = useState(false);
    const [detailsArray, setDetailsArray] = useState([]);
    const [statusDesc, setStatusDesc] = useState("");
    const [ackMessage, setAckMessage] = useState("");
    const [RSAData, setRSAData] = useState({
        challengeRequest: {},
        isRSARequired: false,
        isRSALoader: false,
        challengeQuestion: "",
        RSACount: 0,
        RSAError: false,
        otpFlow: false,
    });
    const [isS2UDown, setIsS2UDown] = useState(false);
    const { goBack } = navigation;
    const { fromScreen, fromModule } = route?.params;

    useEffect(() => {
        init();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (param.isS2UReg) handleS2uFlow();
        }, [param.isS2UReg])
    );

    const init = () => {
        console.log("[M2UDeactivate] >> [init]");
        checkS2UStatus();
    };

    const handleS2uFlow = async () => {
        console.log("[M2UDeactivate] >> [handleS2uFlow]");
        //passing new parameter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            ATtxnCodeS2u,
            getModel,
            updateModel
        );
        const { goBack } = navigation;
        const {
            params: { isS2UReg },
        } = route;
        if (flow === S2UFlowEnum.s2uReg && isS2UReg) goBack();
        setS2uData({ ...s2uData, secure2uValidateData, flow });
    };

    const checkS2UStatus = async () => {
        const { isSecureSwitchS2UBypass } = getModel("misc");
        try {
            const { flow, secure2uValidateData } = await checks2UFlow(
                ATtxnCodeS2u,
                getModel,
                updateModel
            );
            console.log("[M2UDeactivate] >> [checkS2UStatus]", flow);
            setS2uData({ ...s2uData, flow, secure2uValidateData });
            const { setParams, navigate } = navigation;

            if (flow === S2UFlowEnum.s2uCooling && !isSecureSwitchS2UBypass) {
                navigateToS2UCooling(navigate);
            } else if (flow === S2UFlowEnum.s2uReg && !isSecureSwitchS2UBypass) {
                setParams({ isS2UReg: true });
                navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: SECURE_SWITCH_STACK,
                                screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
                            },
                            fail: {
                                stack: SECURE_SWITCH_STACK,
                                screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
                            },
                            params: { ...route.params },
                        },
                    },
                });
            } else if (flow === S2UFlowEnum.tac) {
                const { isS2uV4ToastFlag } = getModel("misc");
                setIsS2UDown(isS2uV4ToastFlag ?? false);
                requestOTP();
            } else if (flow === S2UFlowEnum.s2u) {
                const s2uType =
                    secure2uValidateData?.pull === "N" ? S2UFlowEnum.s2uPush : S2UFlowEnum.s2uPull;
                const params = {
                    ...getDeactivateParams(),
                    twoFAType: s2uType,
                };
                M2UDeactivateAPI(params, s2uType);
            } else {
                requestOTP();
            }
        } catch (error) {
            goBack();
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    const getDeactivateParams = () => {
        console.log("[M2UDeactivate] >> [getDeactivateParams]");

        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        return {
            twoFAType: "",
            mobileSDKData: mobileSDK,
            username,
        };
    };

    const showOTPModal = () => {
        setloadingScreen(false);
        setShowOTP(true);
    };

    const onOTPDone = (otp, otpModalErrorCb) => {
        setUserInputToken(otp);
        const params = {
            ...getDeactivateParams(),
            tac: otp,
            twoFAType: S2UFlowEnum.tac,
        };

        M2UDeactivateAPI(params, S2UFlowEnum.tac, otpModalErrorCb);
    };

    const closeOTPModal = () => {
        setShowOTP(false);
        setloadingScreen(false);
        setToken(null);
        goBack();
    };

    const onOTPClose = () => {
        closeOTPModal();
    };

    const onOTPResend = (showOTPCb) => {
        requestOTP(true, showOTPCb);
    };

    const requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);

        const { m2uPhoneNumber } = getModel("m2uDetails");
        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));

        const params = {
            fundTransferType,
            deviceName: mobileSDKData?.deviceName,
        };

        try {
            const httpResp = await requestTACDelete(params);
            const statusCode = httpResp?.data?.statusCode ?? null;
            const serverToken = httpResp?.data?.token ?? null;

            if (statusCode === "0000" || statusCode === "0") {
                // Update token and show OTP modal
                setToken(serverToken);
                showOTPModal();
            } else {
                goBack();
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
            if (isResend) showOTPCb();
        } catch (error) {
            console.log("[requestOTP] >> Exception: ", error);
            showErrorToast({
                message: error?.error?.message ?? COMMON_ERROR_MSG,
            });
            goBack();
        } finally {
            setloadingScreen(false);
        }
    };

    const handleDeactivate = async () => {
        console.log("handleDeactivate");
        resetModel(null, ["device", "appSession"]);

        // clear local stuff
        await removeLocalStorage();
        navigation.navigate("Logout", { type: "deactivate" });
    };

    const onS2uDone = (response) => {
        console.log("[M2UDeactivate] >> [onS2uDone]", response);
        const { transactionStatus, s2uSignRespone } = response;
        const { text, dateTime } = s2uSignRespone;
        const dtArray = [];

        // Check for Reference ID
        if (s2uSignRespone) {
            dtArray.push({
                title: REFERENCE_ID,
                value: s2uData.s2uTrxRefNo,
            });
        }
        // Check for Server Date/Time
        if (dateTime) {
            dtArray.push({
                title: DATE_AND_TIME,
                value: dateTime,
            });
        }
        dtArray.push({
            title: TRANSACTION_TYPE,
            value: DEACTIVATE_M2U,
        });
        setDetailsArray(dtArray);

        onS2uClose();
        setloadingScreen(true);
        setStatusDesc(text);
        if (transactionStatus) {
            handleDeactivate();
        } else {
            setAckMessage(TRANSACTION_UNSUCCESS);
            setSuccess(false);
            setshowAcknowledgement(true);
            setloadingScreen(false);
        }
    };

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2uData, showS2u: false });
    }, [s2uData]);

    const showS2uModal = (response) => {
        console.log("[M2UDeactivate] >> [showS2uModal]", response);
        const { pollingToken, token, serverDate, txnRefNo } = response;
        const s2uPollingToken = pollingToken || token || "";
        const s2uTransactionDetails = [
            {
                label: USERNAME,
                value: username,
            },
            {
                label: DATE_AND_TIME,
                value: serverDate,
            },
        ];
        setS2uData({
            ...s2uData,
            pollingToken: s2uPollingToken,
            s2uTransactionDetails,
            showS2u: true,
            s2uTrxRefNo: txnRefNo,
        });
    };

    const M2UDeactivateAPI = async (params, twoFAType, otpModalErrorCb) => {
        try {
            const httpResp = await deactivateM2UAccess(params);
            const { result } = httpResp?.data;
            if (!result) {
                // Close OTP modal
                onOTPClose();
                setSuccess(false);
                setshowAcknowledgement(true);
                return;
            }
            const { statusCode, serverDate, txnRefNo, statusDesc } = result;
            const dtArray = [];

            // Check for Reference ID
            if (txnRefNo) {
                dtArray.push({
                    title: REFERENCE_ID,
                    value: txnRefNo,
                });
            }
            // Check for Server Date/Time
            if (serverDate) {
                dtArray.push({
                    title: DATE_AND_TIME,
                    value: serverDate,
                });
            }

            dtArray.push({
                title: TRANSACTION_TYPE,
                value: DEACTIVATE_M2U,
            });
            setDetailsArray(dtArray);

            switch (statusCode) {
                case "0000":
                    if (twoFAType === S2UFlowEnum.tac) {
                        setShowOTP(false);
                        setloadingScreen(true);
                        setToken(null);
                        handleDeactivate();
                    } else {
                        setloadingScreen(true);
                        setDetailsArray(dtArray);
                        showS2uModal(result);
                    }
                    break;
                default:
                    if (twoFAType === S2UFlowEnum.tac) {
                        setShowOTP(false);
                    }
                    setAckMessage(TRANSACTION_UNSUCCESS);
                    setStatusDesc(statusDesc);
                    setSuccess(false);
                    setshowAcknowledgement(true);
                    setloadingScreen(false);
                    break;
            }
        } catch (error) {
            console.log("[M2UDeactivateAPI] >> Exception: ", error);
            callAPIErrorHandler(error, twoFAType);
        }
    };

    const callAPIErrorHandler = (err, twoFAType) => {
        console.log("[M2UDeactivateAPI] >> callAPIErrorHandler: ", err);
        if (twoFAType === S2UFlowEnum.tac) {
            setShowOTP(false);
        }

        if (err.status === 428) {
            console.log("428 RSA", err.error.challenge);
            // Display RSA Challenge Questions if status is 428
            setRSAData({
                challengeRequest: {
                    ...RSAData?.challengeRequest,
                    challenge: err.error.challenge,
                },
                challengeQuestion: err.error.challenge.questionText,
                isRSARequired: true,
                isRSALoader: false,
                RSACount: RSAData?.RSACount + 1,
                RSAError: RSAData.RSACount > 0,
                otpFlow: twoFAType,
            });
        } else if (err.status === 423) {
            setRSAData({
                ...RSAData,
                isRSARequired: false,
            });
            const serverDate = err.error.serverDate ?? "N/A";
            navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: err.error.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else if (err.status === 422) {
            // RSA Deny
            const { statusDescription, serverDate } = err.error;

            const params = {
                statusDescription,
                serverDate,
                nextParams: {},
                nextModule: fromModule ?? TAB,
                nextScreen: fromScreen ?? DASHBOARD,
            };
            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params,
            });
        } else {
            setloadingScreen(false);
            goBack();
            showErrorToast({
                message: err?.message || err?.error?.message || COMMON_ERROR_MSG,
            });
        }
    };

    async function onRsaDone(answer) {
        setRSAData({ ...RSAData, isRSARequired: false });
        const params = {
            ...getDeactivateParams(),
            challenge: {
                ...RSAData?.challengeRequest?.challenge,
                answer,
            },
            tac: userInputToken,
            twoFAType: RSAData.otpFlow,
        };

        M2UDeactivateAPI(params, RSAData.otpFlow);
    }

    function onRsaClose() {
        setRSAData({ ...RSAData, isRSARequired: false });
    }

    const handleOnPress = () => {
        if (successful) {
            handleDeactivate();
            navigation.navigate("Logout", { type: "deactivate" });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                },
            });
        }
    };

    return (
        <>
            {showAcknowledgement ? (
                <AcknowledgementScreenTemplate
                    isSuccessful={successful}
                    message={ackMessage}
                    isSubMessage={!!statusDesc}
                    detailsData={detailsArray}
                    errorMessage={statusDesc}
                    ctaComponents={[
                        <ActionButton
                            key="1"
                            fullWidth
                            onPress={handleOnPress}
                            componentCenter={
                                <Typography
                                    text="Done"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />,
                    ]}
                />
            ) : (
                <ScreenContainer backgroundType="color" showLoaderModal={loadingScreen} />
            )}
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                    isS2UDown={isS2UDown}
                />
            )}
            {/* S2u Modal */}
            {s2uData.showS2u && (
                <Secure2uAuthenticationModal
                    token={s2uData.pollingToken}
                    onS2UDone={onS2uDone}
                    onS2UClose={onS2uClose}
                    nonTxnData={s2uData.nonTxnData}
                    s2uPollingData={s2uData.secure2uValidateData}
                    transactionDetails={s2uData.s2uTransactionDetails}
                    extraParams={s2uData.secure2uExtraParams}
                    subTitle={s2uData.subTitle}
                />
            )}

            {/* Challenge Question */}
            {RSAData.isRSARequired && (
                <ChallengeQuestion
                    loader={false}
                    display={RSAData.isRSARequired}
                    displyError={RSAData.RSAError}
                    questionText={RSAData.challengeQuestion}
                    onSubmitPress={onRsaDone}
                    onSnackClosePress={onRsaClose}
                />
            )}
        </>
    );
}

M2UDeactivate.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    resetModel: PropTypes.func,
};

export default withModelContext(M2UDeactivate);

import { isNull } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typography from "@components/Text";
import { errorToastProp, showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    deregistrationPayer,
    deregistrationMerchant,
    getCancelReasonList,
    nonMonetoryValidate,
} from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    BLACK,
    DISABLED,
    DISABLED_TEXT,
    MEDIUM_GREY,
    PINKISH_GREY,
    YELLOW,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
} from "@constants/colors";
import * as FundConstants from "@constants/fundConstants";
import {
    SECURE2U_IS_DOWN,
    WE_FACING_SOME_ISSUE,
    PAY_TO,
    PAY_FROM,
    DATE_AND_TIME,
    SERVER_OTHER_ERROR,
    COMMON_ERROR_MSG,
    S2U_REGISTER_ERROR,
    PLEASE_SELECT,
    CONFIRM,
    MAX_LIMIT_ERROR,
    PAYMENT_DECLINED,
    UNABLE_FETCH_CANCEL_LIST,
    REASON_CANCEL,
    SELECT_REASON_CANCEL,
    SELECT_REASON_PROCEED,
    SETTING_AD,
    S2U_AUTH_REJECTED,
    CANCEL_DEBTOR_OTP_VERIFY,
    CANCEL_CREDITOR_OTP_VERIFY,
    CANCEL_DEBTOR_S2U,
    CANCEL_CREDITOR_S2U,
    CANCEL_DEBTOR_OTP_REQ,
    CANCEL_CREDITOR_OTP_REQ,
    CANCEL_DUITNOW_AD,
} from "@constants/strings";

import { getFormatedDateMoments } from "@utils/dataModel";
import { formateRefnumber, accountNumSeparator } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

function ABCancelDuitNowAD({ navigation, route, getModel }) {
    const { merchantInquiry } = getModel("rpp");
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [transferParams, setTransferParams] = useState({});
    const [showCancelScrollPicker, setShowCancelScrollPicker] = useState(false);
    const [cancelReasonList, setCancelReasonList] = useState([]);
    const [selectedCancel, setSelectedCancel] = useState("");
    const [transferFlow, setTransferFlow] = useState(27);
    const [stateUseData, setStateUseData] = useState(null);
    const selectedAccNum = useState("");
    const expiryDate = useState(moment(new Date()).add(14, "day"));
    // RSA State Objects
    const [latestParamsCreated, setLatestParamsCreated] = useState({});
    const [challengeRequest, setChallengeRequest] = useState({});
    const [RSACount, setRSACount] = useState(0);
    // S2U
    const [secure2uValidateData, setSecure2uValidateData] = useState({});
    const [authFlow, setAuthFlow] = useState("");
    const [showS2u, setShowS2u] = useState(false);
    const [pollingToken, setPollingToken] = useState("");
    const [s2uTransactionDetails, setS2uTransactionDetails] = useState([]);
    // TacModal
    const [showTAC, setShowTAC] = useState(false);
    const [tacParams, setTacParams] = useState({});

    const [msgId, setMsgId] = useState({});
    const [selectedCancelIndex, setSelectedCancelIndex] = useState({});

    const expiryDateFormatted = getFormatedDateMoments(
        moment(new Date()).add(14, "day"),
        "D MMM YYYY"
    );

    useEffect(() => {
        RTPanalytics.screenLoadABCancelReason();
        getCancels();
        updateData();
    }, [showCancelScrollPicker]);

    /***
     * getCancels
     * Get list of Cancels/sub-Cancels from api
     */
    async function getCancels() {
        try {
            setShowLoaderModal(true);
            const response = await getCancelReasonList();

            // array mapping
            const CancelList = response?.data?.list.map((Cancel, index) => ({
                value: index,
                title: Cancel?.sub_service_name,
                oid: Cancel?.oid,
                subServiceCode: Cancel?.sub_service_code,
            }));
            setCancelReasonList(CancelList);
            setShowLoaderModal(false);
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message: error.message ?? UNABLE_FETCH_CANCEL_LIST,
                })
            );
            ErrorLogger(error);

            // go back
            navigation.goBack();
        }
    }

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async function updateData() {
        const stateData = !stateUseData ? route?.params : route?.params?.params;

        const { transferParams } = route.params || {};

        const secure2uValidateData = route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };

        // get Payment method flow TAC / S2U
        let flow = stateData?.flow ?? route.params?.cancelFlow;
        const s2uEnabled = secure2uValidateData?.s2u_enabled;

        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth === "fail") {
                    showErrorToast({
                        message: S2U_REGISTER_ERROR,
                    });
                    flow = "TAC";
                } else {
                    flow = "S2U";
                }
                break;
            case "S2U":
                flow = "S2U";
                break;
            case "TAC":
                if (!s2uEnabled) {
                    setTimeout(() => {
                        showInfoToast({
                            message: SECURE2U_IS_DOWN,
                        });
                    }, 1);
                }
                flow = "TAC";
                break;
            default:
                break;
        }
        setTransferParams(transferParams);
        setAuthFlow(flow);
        setSecure2uValidateData(secure2uValidateData);
        setStateUseData(stateData);
        setTransferFlow(transferParams?.transferFlow ?? transferFlow);
    }

    function doneClick() {
        RTPanalytics.formABCancel(selectedCancel);
        try {
            if (isNull(selectedCancel) || !selectedCancel) {
                showInfoToast({ message: SELECT_REASON_CANCEL });
                return false;
            }
            const item = transferParams;

            const apiTransferParams =
                item?.isMyBills || item?.transferParams?.item?.canTrmByDbtr
                    ? getCancelParams()
                    : item?.isCustomer
                    ? getCancelCustomerListParams()
                    : "";
            if (item?.isMyBills || item?.isCustomer || item?.transferParams?.item?.canTrmByDbtr) {
                autoDebitCancel(apiTransferParams);
            }
        } catch (ex) {
            showInfoToast({
                message: ex?.message ?? SERVER_OTHER_ERROR,
            });
        }
    }

    function onBackPress() {
        navigation.goBack();
    }

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    function onS2uDone(response) {
        const { transactionStatus, s2uSignRespone } = response || {};
        transferParams.s2uSignRespone = s2uSignRespone;
        const item = transferParams;
        const checkSetting = route.params?.from;
        // Close S2u popup
        onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            const { statusDescription, text, status } = s2uSignRespone || {};
            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription || status;
            transferParams.transactionResponseError = text;
            transferParams.s2uType = true;
            transferParams.selectedCreditorAccount = selectedAccNum;
            transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            if (transferParams?.statusDescription !== "Accepted") {
                transferParams.transactionResponseError = "";
            }
            if (s2uSignRespone?.consentId && s2uSignRespone?.mbbRefNo) {
                transferParams.transactionresponse = {
                    msgId: s2uSignRespone?.mbbRefNo,
                    consentId: s2uSignRespone?.consentId,
                };
            }
            transferParams.transactionStatus = true;
            transferParams.showDesc = true;
            transferParams.expiryDateTime = expiryDate ?? "";
            transferParams.expiryDateFormatted = expiryDateFormatted ?? "";
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    transferParams,
                    transactionResponseObject: s2uSignRespone.payload,
                    screenDate: route.params?.screenDate,
                    errorMessge: null,
                    from: checkSetting === SETTING_AD ? checkSetting : null,
                },
            });
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone || {};
            const serverError = text || "";
            transferParams.s2uType = false;
            transferParams.selectedCreditorAccount = selectedAccNum;
            transferParams.transactionStatus = false;
            transferParams.transactionResponseError = serverError;
            transferParams.statusDescription = statusDescription;
            transferParams.formatRefNumber = msgId;
            // s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.formattedTransactionRefNumber ?? "";
            transferParams.status = status;

            const transactionId =
                status === "M408"
                    ? transferParams.referenceNumber
                    : transferParams?.formattedTransactionRefNumber ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = S2U_AUTH_REJECTED;
                transferParams.transferMessage = PAYMENT_DECLINED;
                transferParams.s2uReject = S2U_AUTH_REJECTED;
                transferParams.s2uRejectMsg = S2U_AUTH_REJECTED;
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transferParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text,
                });
            }
            if (item?.isMyBills || item?.isCustomer || item?.item?.canTrmByDbtr) {
                navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                    screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                    params: {
                        item: transferParams,
                        transferParams,
                        transactionResponseObject: s2uSignRespone,
                        transactionReferenceNumber: transactionId,
                        screenDate: route.params?.screenDate,
                        from: checkSetting === SETTING_AD ? checkSetting : null,
                    },
                });
            }
        }
    }

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    function onS2uClose() {
        // will close tac popup
        setShowS2u(false);
    }

    /***
     * hideTAC
     * Close TAc Model
     */
    function hideTAC() {
        if (showTAC) {
            setShowTAC(false);
            setShowLoaderModal(false);
        }
    }

    function getCancelParams() {
        const { transferParams } = route?.params || {};

        return {
            debtorAcctNum:
                transferParams?.debtorAccountNumber ?? transferParams?.item?.debtorAcctNum ?? "",
            creditorAcctNum: transferParams?.creditorAccount ?? "",
            creditorName: transferParams?.merchantName ?? transferParams?.item?.creditorName ?? "",
            endToEndId: transferParams?.item?.canTrmByDbtr
                ? transferParams?.item?.endToEndId
                : transferParams?.endToEndId ?? "",
            orgnlMndtId: transferParams?.item?.canTrmByDbtr
                ? transferParams?.item?.consentId
                : transferParams?.consentId ?? "",
            cancelReason: selectedCancelIndex,
            refs1: transferParams?.ref1 ?? "",
        };
    }

    function getCancelCustomerListParams() {
        const { transferParams } = route?.params || {};

        return {
            debtorAcctNum: transferParams?.debtorAccountNumber ?? "",
            creditorAcctNum: transferParams?.creditorAccount ?? "",
            debtorName: transferParams?.debtorName ?? "",
            merchantId: transferParams?.merchantId ?? "",
            productId: transferParams?.productId ?? "",
            endToEndId: transferParams?.endToEndId ?? "",
            orgnlMndtId: transferParams?.consentId ?? "",
            cancelReason: selectedCancelIndex,
            refs1: transferParams?.ref1 ?? "",
        };
    }

    /***
     * rtpActionApiSuccess
     * Handle TAC Success Flow
     */

    async function onTacSuccess(response) {
        const item = transferParams;
        hideTAC();
        if (response) {
            const tacParams = {
                fundTransferType:
                    item?.isMyBills || item?.item?.canTrmByDbtr
                        ? CANCEL_DEBTOR_OTP_VERIFY
                        : item?.isCustomer
                        ? CANCEL_CREDITOR_OTP_VERIFY
                        : "",
                payeeName: item?.item?.canTrmByDbtr ? item?.item?.debtorName : item?.merchantName,
                toAcctNo: item?.item?.canTrmByDbtr
                    ? item?.item?.debtorAcctNum
                    : item?.debtorAccountNumber,
                cardNo: item?.item?.canTrmByDbtr ? item?.item?.freqMode : item?.frequency,
                tacNumber: response,
            };

            try {
                const result = await nonMonetoryValidate(tacParams);

                if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
                    const params =
                        item?.isMyBills || item?.item?.canTrmByDbtr
                            ? getCancelParams()
                            : item?.isCustomer
                            ? getCancelCustomerListParams()
                            : "";
                    if (item?.isMyBills || item?.item?.canTrmByDbtr) {
                        try {
                            const response = await deregistrationPayer(params);
                            billingApiSuccess(response?.data?.result ?? {});
                        } catch (error) {
                            billingApiFailed(error);
                        }
                    } else if (item?.isCustomer) {
                        try {
                            const response = await deregistrationMerchant(params);
                            billingApiSuccess(response?.data?.result ?? {});
                        } catch (error) {
                            billingApiFailed(error);
                        }
                    }
                }
            } catch (err) {
                const tacWrong = [{ ...err?.error, tacWrong: true }];
                billingApiFailed(tacWrong);
            }
        }
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    async function showS2uModal(response) {
        const item = transferParams;
        const params = {
            twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
            fundTransferType: item?.isCustomer
                ? CANCEL_CREDITOR_S2U
                : item?.isMyBills || item?.item?.canTrmByDbtr
                ? CANCEL_DEBTOR_S2U
                : "",
            payeeName: item?.item?.canTrmByDbtr ? item?.item?.debtorName : item?.merchantName,
            toAcctNo: item?.item?.canTrmByDbtr
                ? item?.item?.debtorAcctNum
                : item?.debtorAccountNumber,
            cardNo: item?.item?.canTrmByDbtr ? item?.item?.freqMode : item?.frequency,
        };
        const result = await nonMonetoryValidate(params);

        if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
            const item = transferParams || {};
            const { s2uTransactionId } = result?.data || null;
            const s2uTransDetails = [
                {
                    // Upper Label and Value
                    label: item?.isCustomer
                        ? PAY_FROM //debtor - phone user -106 noraini
                        : item?.isMyBills || item?.item?.canTrmByDbtr
                        ? PAY_TO //creditor
                        : "",
                    value: item?.isCustomer
                        ? transferParams.debtorName
                        : item?.isMyBills
                        ? transferParams.merchantName
                        : item?.item?.canTrmByDbtr
                        ? item?.item?.creditorName
                        : item?.name,
                },
                {
                    // Lower Label and Value

                    label: item?.isCustomer
                        ? PAY_TO
                        : item?.isMyBills || item?.item?.canTrmByDbtr
                        ? PAY_FROM
                        : "",
                    value: item?.isCustomer
                        ? `${item?.merchantName}\n${
                              accountNumSeparator(merchantInquiry?.accNo) ??
                              transferParams?.selectedAccountNumber ??
                              item?.accountNumber
                          }`
                        : item?.isMyBills
                        ? `${transferParams?.debtorName}\n${accountNumSeparator(
                              transferParams?.debtorAccountNumber
                          )}`
                        : item?.item?.canTrmByDbtr
                        ? `${transferParams?.debtorName} \n ${accountNumSeparator(
                              transferParams?.debtorAcctNum
                          )}`
                        : item?.name,
                },
                {
                    label: REASON_CANCEL,
                    value: selectedCancel,
                },
                {
                    label: DATE_AND_TIME,
                    value: moment().format("DD MMM YYYY, hh:mm A"),
                },
            ];
            //Show S2U Model update the payload
            setPollingToken(s2uTransactionId);
            setS2uTransactionDetails(s2uTransDetails);
            setShowS2u(true);
        } else {
            showErrorToast({
                message: result?.data?.statusDesc || result?.data?.message || COMMON_ERROR_MSG,
            });
        }
    }

    async function autoDebitCancel(params) {
        const item = route?.params?.transferParams;
        try {
            setLatestParamsCreated(params);
            setShowLoaderModal(true);

            if (authFlow === "TAC") {
                const tacParameter = {
                    fundTransferType:
                        item?.isMyBills || item?.item?.canTrmByDbtr
                            ? CANCEL_DEBTOR_OTP_REQ
                            : item?.isCustomer
                            ? CANCEL_CREDITOR_OTP_REQ
                            : "",
                    payeeName: item?.item?.canTrmByDbtr
                        ? item?.item?.debtorName
                        : item?.merchantName,
                    toAcctNo: item?.item?.canTrmByDbtr
                        ? item?.item?.debtorAcctNum
                        : item?.debtorAccountNumber,
                    cardNo: item?.item?.canTrmByDbtr ? item?.item?.freqMode : item?.frequency,
                };
                setTacParams(tacParameter);
                setShowTAC(true);
            } else {
                const response =
                    item?.isMyBills || item?.transferParams?.item?.canTrmByDbtr
                        ? await deregistrationPayer({
                              ...params,
                              twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                          })
                        : item?.isCustomer
                        ? await deregistrationMerchant({
                              ...params,
                              twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                          })
                        : "";
                setMsgId(response?.data?.result?.msgId);

                if (response?.data.code === 200) {
                    if (
                        (item?.isMyBills || item?.isCustomer || item?.item?.canTrmByDbtr) &&
                        authFlow === "S2U"
                    ) {
                        setShowLoaderModal(false);
                        showS2uModal(params);
                    } else {
                        billingApiSuccess(response?.data?.result ?? {});
                    }
                } else {
                    billingApiFailed(response?.data?.result);
                }
            }
        } catch (error) {
            billingApiFailed(error);
        }
    }

    /***
     * rtpActionCallApiSuccess
     * Handle Transfer Success Flow
     */
    function billingApiSuccess(response) {
        const checkSetting = route.params?.from;

        setShowLoaderModal(false);
        if (
            response.statusCode === "000" ||
            response.statusCode === "0000" ||
            response.statusCode === "0"
        ) {
            const transactionDate = response?.serverDate ?? null;

            transferParams.additionalStatusDescription = response?.additionalStatusDescription;
            transferParams.statusDescription = response?.statusDescription;
            transferParams.transactionRefNo = response?.transactionRefNumber;
            transferParams.transactionRefNumber = response?.formattedTransactionRefNumber;
            transferParams.formattedTransactionRefNumber = response?.formattedTransactionRefNumber;
            transferParams.nonModifiedTransactionRefNo = response?.transactionRefNumber;
            transferParams.referenceNumberFull = response?.transactionRefNumber;
            transferParams.referenceNumber = response?.formattedTransactionRefNumber;
            transferParams.transactionDate = transactionDate;
            transferParams.serverDate = response?.serverDate;
            transferParams.transactionresponse = response;
            transferParams.transactionRefNumberFull = response?.transactionRefNumber;
            transferParams.transactionStatus = true;
            transferParams.showDesc = true;
            transferParams.expiryDateTime = expiryDate ?? "";
            transferParams.expiryDateFormatted = expiryDateFormatted ?? "";

            //  Response navigate to Acknowledge Screen
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    item: transferParams,
                    transferParams,
                    transactionReferenceNumber: response?.formattedTransactionRefNumber,
                    errorMessge: "",
                    screenDate: route.params?.screenDate,
                    from: checkSetting === SETTING_AD ? checkSetting : null,
                },
            });
        } else {
            error200Handler(response);
        }
    }

    /***
     * billingApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     */
    function billingApiFailed(error, token) {
        hideTAC();
        const checkSetting = route.params?.from;

        const errors = error;
        const errorsInner = error?.error;
        const isAmountIssue = errorsInner?.message?.toLowerCase()?.includes(MAX_LIMIT_ERROR);
        transferParams.statusDescription = errorsInner?.statusDescription ?? "";
        if (errors?.message && !isAmountIssue) {
            showErrorToast({
                message: errors.message,
            });
        }

        if (errors.status === 428) {
            if (token) {
                setLatestParamsCreated({
                    ...latestParamsCreated,
                    smsTac: token,
                    tac: token,
                });
            }

            hideTAC();

            setChallengeRequest({
                ...challengeRequest,
                challenge: errorsInner.challenge,
            });
            setShowLoaderModal(false);
            setRSACount(RSACount + 1);
        } else if (errors.status === 423) {
            // Display RSA Account Locked Error Message
            setShowLoaderModal(false);
            const reason = errorsInner?.statusDescription ?? "";
            const loggedOutDateTime = errorsInner.serverDate;
            const lockedOutDateTime = errorsInner.serverDate;
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason,
                    loggedOutDateTime,
                    lockedOutDateTime,
                },
            });
        } else if (errors.status === 422) {
            // Display RSA Deny Error Message
            setShowLoaderModal(false);
            // Add Completion
            transferParams.transactionStatus = false;
            transferParams.transactionDate = errorsInner.serverDate;
            transferParams.error = error;
            transferParams.transactionResponseError = "";
            hideTAC();
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    errorMessge:
                        errorsInner && errorsInner.statusDescription
                            ? errorsInner.statusDescription
                            : WE_FACING_SOME_ISSUE,
                    transferParams,
                    transactionReferenceNumber: "",
                    isRsaLock: false,
                    screenDate: route.params?.screenDate,
                },
            });
        } else {
            //Handle All other failure cases
            setShowLoaderModal(false);
            hideTAC();

            const transferParamsTemp = {
                ...transferParams,
                additionalStatusDescription: errorsInner?.additionalStatusDescription,
                statusDescription: errors[0]?.tacWrong ? "Declined" : "",
                tacType: errors[0]?.tacWrong,
                transactionResponseError: error?.message ?? WE_FACING_SOME_ISSUE,
                showDesc: true,
                transactionStatus: false,
                formattedTransactionRefNumber:
                    errorsInner?.formattedTransactionRefNumber ?? errorsInner?.transactionRefNumber,
                transactionDate: errorsInner?.serverDate ?? "",
                transferFlow,
                errorMessage: error?.[0]?.message,
            };
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    transferParams: transferParamsTemp,
                    screenDate: route.params?.screenDate,
                    errors,
                    from: checkSetting === SETTING_AD ? checkSetting : null,
                },
            });
        }
    }

    /***
     * rtpActionApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA.... rtpActionCallApiFailed
     */

    // error200

    function error200Handler(response) {
        const responseObject = response?.result ?? response;
        const checkSetting = route.params?.from;
        const transferParamsError = {
            ...transferParams,
            additionalStatusDescription: responseObject?.additionalStatusDescription,
            statusDescription: "unsuccessful",
            transactionResponseError: responseObject?.statusDescription ?? WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber:
                responseObject?.formattedTransactionRefNumber || formateRefnumber(response?.msgId),
            transactionDate: response?.serverDate ?? "",
            transferFlow,
            //Tac passing with error data
            tacType: true,
        };

        hideTAC();
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
            params: {
                transferParams: transferParamsError,
                screenDate: route.params?.screenDate,
                from: checkSetting === SETTING_AD ? checkSetting : null,
            },
        });
    }

    function onCancelScrollPickerShow() {
        setShowCancelScrollPicker(true);
    }

    function onCancelScrollPickerDismissed() {
        setShowCancelScrollPicker(false);
    }

    function onCancelScrollPickerDoneButtonPressed(value) {
        setSelectedCancel(cancelReasonList[value].title);
        setShowCancelScrollPicker(false);
        setSelectedCancelIndex(cancelReasonList[value].subServiceCode);
    }

    const item = route?.params?.transferParams;
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                showLoaderModal={showLoaderModal}
                showOverlay={showCancelScrollPicker}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            <KeyboardAvoidingView
                                style={Styles.flexItem}
                                keyboardVerticalOffset={100}
                                behavior="position"
                            >
                                <View style={Styles.container}>
                                    <View style={Styles.formTitleContainer}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="300"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            textAlign="left"
                                            text={CANCEL_DUITNOW_AD}
                                        />

                                        <View style={Styles.formSubTitleContainer}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                textAlign="left"
                                                text={SELECT_REASON_PROCEED}
                                            />
                                        </View>
                                    </View>

                                    <View style={Styles.formBodyContainer}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={REASON_CANCEL}
                                        />

                                        <View style={Styles.formEditableContainer}>
                                            <View style={Styles.dropdownInputContainer}>
                                                <Dropdown
                                                    title={
                                                        selectedCancel === ""
                                                            ? PLEASE_SELECT
                                                            : selectedCancel
                                                    }
                                                    align="left"
                                                    onPress={onCancelScrollPickerShow}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={selectedCancel === ""}
                                fullWidth
                                borderRadius={25}
                                onPress={doneClick}
                                backgroundColor={!selectedCancel ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={!selectedCancel ? DISABLED_TEXT : BLACK}
                                        text={CONFIRM}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
            <ScrollPicker
                showPicker={showCancelScrollPicker}
                items={cancelReasonList}
                onDoneButtonPressed={onCancelScrollPickerDoneButtonPressed}
                onCancelButtonPressed={onCancelScrollPickerDismissed}
            />
            {showTAC && (
                <TacModal
                    tacParams={tacParams}
                    validateByOwnAPI
                    validateTAC={onTacSuccess}
                    onTacClose={hideTAC}
                />
            )}
            {/* S2U MODAL */}
            {showS2u && (
                <Secure2uAuthenticationModal
                    customTitle={CANCEL_DUITNOW_AD}
                    token={pollingToken}
                    onS2UDone={onS2uDone}
                    onS2UClose={onS2uClose}
                    transactionDetails={s2uTransactionDetails}
                    nonTxnData={{
                        isNonTxn: true,
                    }}
                    s2uPollingData={secure2uValidateData}
                    extraParams={{
                        metadata: {
                            txnType: item?.isCustomer
                                ? CANCEL_CREDITOR_S2U
                                : item?.isMyBills || item?.item?.canTrmByDbtr
                                ? CANCEL_DEBTOR_S2U
                                : "",
                            refId: msgId,
                        },
                    }}
                />
            )}
        </React.Fragment>
    );
}

ABCancelDuitNowAD.propTypes = {
    getModel: PropTypes.func.isRequired,
    resetModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        isVertical: PropTypes.bool,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            confirmation: PropTypes.any,
            transferParams: PropTypes.shape({
                Cancel: PropTypes.string,
                recipientRef: PropTypes.string,
                relationship: PropTypes.string,
                subCancel: PropTypes.string,
                subCancelBopCode: PropTypes.string,
                subCancelCode: PropTypes.string,
                subCancelMbbCode: PropTypes.string,
                transferFlow: PropTypes.number,
            }),
            cancelFlow: PropTypes.string,
            secure2uValidateData: PropTypes.object,
            params: PropTypes.any,
            screenDate: PropTypes.any,
            from: PropTypes.any,
        }),
    }),
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    flexItem: { flex: 1 },
    formTitleContainer: {
        paddingTop: 16,
        marginBottom: 10,
    },
    formSubTitleContainer: {
        marginTop: 10,
    },
    formBodyContainer: {
        paddingTop: 16,
    },
    formEditableContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 32,
        width: "100%",
    },
    headerContainer: {
        justifyContent: "flex-start",
    },
    dropdownInputContainer: { flex: 1, marginTop: 8 },
    inputContainer: { flex: 1 },
    touchableCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        paddingVertical: 13,
        marginRight: 14,
    },
    radioButtonContainer: { flexDirection: "row", marginRight: 40, marginTop: 16 },
    radioButtonTitle: { marginLeft: 12 },
};

export default withModelContext(ABCancelDuitNowAD);

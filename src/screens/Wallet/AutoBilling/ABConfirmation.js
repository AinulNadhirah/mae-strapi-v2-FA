import { useFocusEffect } from "@react-navigation/native";
import { isEmpty, isNull } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    TextInput,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import DatePicker from "@components/Pickers/DatePicker";
import Popup from "@components/Popup";
import RSAHandler from "@components/RSA/RSAHandler";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { consentRegister, nonMonetoryValidate, chargeCustomerAPI, senderDetails } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    MEDIUM_GREY,
    ROYAL_BLUE,
    FADE_GREY,
} from "@constants/colors";
import { idMapProxy, termsAndConditionUrl } from "@constants/data/DuitNowRPP";
import * as FundConstants from "@constants/fundConstants";
import * as Strings from "@constants/strings";

import { paymentDetailsRegex, getFormatedDateMoments, validateEmail } from "@utils/dataModel";
import { numberMasking, toTitleCase } from "@utils/dataModel/rtdHelper";
import { formateAccountNumber, getDeviceRSAInformation } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";

export const { width, height } = Dimensions.get("window");

function ABConfirmation({ navigation, route, getModel, resetModel, updateModel }) {
    const { transferParams } = route.params || {};
    const [state, setState] = useState({
        transferFlow: 27,
        loader: false,
        selectedAccount: null,
        showOverlay: false,
        errorMessage: "",
        transferParams: {},
        showLoaderModal: false,
        showDatePicker: false,
        expiryDate: moment(new Date()).add(route.params?.soleProp ? 14 : 7, "day"),
        expiryDateFormatted: getFormatedDateMoments(
            moment(new Date()).add(route.params?.soleProp ? 14 : 7, "day"),
            "D MMM YYYY"
        ),
        // S2u/TAC related
        secure2uValidateData: {},
        flow: "",
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        // TacModal
        showTAC: false,
        tacParams: {},
        // scroll picker 2
        showAccountScrollPickerView: false,
        accountDropDown: [],
        notifyEmail: "",
        infoTitle: "",
        infoMessage: "",
        showFrequencyInfo: false,
        disableBtn: false,
        msgId: {},
        // secondary debtor ID
        scnSndrId: {},
        scnSndrIc: {},
        usrDbrtScndType: {},
        custName: {},
        countryCode: "",
        rsaObject: {
            showRSA: false,
            errorObj: null,
            postCallback: makeAPICall,
            navigation,
        },
    });
    const [msgId, setMsgId] = useState("");
    const [isStateUpdated, setIsStateUpdated] = useState(false);

    function updateState(stateData) {
        setState((prevState) => {
            return { ...prevState, ...stateData };
        });
    }

    function makeAPICall(params) {
        const rsaObject = {
            ...state.rsaObject,
            showRSA: false,
            errorObj: null,
        };
        updateState({ rsaObject });
        const request = getRequest(state.transferFlow === 27 ? "821" : "");
        const requestParams = state.transferFlow === 27 ? getRTPRequestParams() : getChargeParams();
        request({ ...params, ...requestParams });
    }

    function getRequest(type) {
        if (type === Strings.CONSENT_REGISTER_DEBTOR) return billingCallRequest;
        return duitNowRtp;
    }

    useEffect(() => {
        RTPanalytics.screenLoadABConfirmation();
        updateDataInScreenAlways();
    }, []);
    useFocusEffect(
        useCallback(() => {
            updateDataInScreenAlways();
            onFocusScreenUpdate();
        }, [])
    );

    useEffect(() => {
        if (state.transferFlow) {
            setIsStateUpdated(true);
        }
    }, [state.transferFlow]);

    async function onFocusScreenUpdate() {
        const transferParams = route.params?.transferParams;
        if (!transferParams?.productId && route.params?.productId) {
            transferParams.productId = route.params?.productId ?? transferParams?.productId;
            transferParams.merchantId = route.params?.merchantId ?? transferParams?.merchantId;
        }
        transferParams.timeInSecs = new Date().getTime();
        let resData = "";
        let idType = "";

        const senderDetailsContext = getModel("rpp")?.senderDetails;
        //if senderDetails not in context initiate api call
        if (senderDetailsContext?.apiCalled === false) {
            const response = !transferParams?.isChargeCustomer ? await senderDetails() : "";
            resData = response?.data ?? "";
            idType = resData ? idMapProxy.find((item) => item.name === resData?.idType) : "";
            updateModel({
                rpp: {
                    senderDetails: {
                        data: resData,
                        apiCalled: true,
                    },
                },
            });
        } else {
            resData = senderDetailsContext?.data;
            idType = resData ? idMapProxy.find((item) => item.name === resData?.idType) : "";
        }

        updateState({
            transferParams,
            paymentDesc: transferParams?.paymentDesc ?? state.paymentDesc,
            notifyEmail: transferParams?.notifyEmail ?? state.notifyEmail,
            reference: transferParams?.reference ?? state.reference,
            scnSndrId: resData?.sdrId,
            scnSndrIc: resData?.newICNumber,
            countryCode: resData?.idCountryCode,
            usrDbrtScndType: idType.code,
            custName: resData?.customerName,
            transferFlow: transferParams?.transferFlow ?? state.transferFlow,
        });
        commonToast();
    }

    function updateDataInScreenAlways() {
        const transferParams = route.params?.transferParams || {};
        // get Payment method flow TAC / S2U Data from Validate Api
        const secure2uValidateData = route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };

        const stateData = route?.params;

        // get Payment method flow TAC / S2U
        let flow = stateData?.flow ?? route.params?.flow ?? "NA";

        const s2uEnabled = secure2uValidateData.s2u_enabled;

        // Show S2U Down or Register Failed role back to TAC Toast
        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth === "fail") {
                    showErrorToast({
                        message: Strings.S2U_REGISTER_ERROR,
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
                            message: Strings.SECURE2U_IS_DOWN,
                        });
                    }, 1);
                }
                flow = "TAC";
                break;
            default:
                break;
        }
        transferParams.productId = route.params?.productId ?? transferParams?.productId;
        transferParams.merchantId = route.params?.merchantId ?? transferParams?.merchantId;
        transferParams.senderBrn = route.params?.senderBrn ?? transferParams?.senderBrn;
        // update source of funds from fpx
        const sourceFunds = route.params?.sourceFunds?.split(/(..)/g).filter((s) => s);
        let paymentMethods = [];
        if (!isEmpty(sourceFunds)) {
            paymentMethods = [...state.paymentMethods]?.filter((el) =>
                sourceFunds.includes(el?.key)
            );
        }
        if (route.params?.isAmountHigher || parseFloat(transferParams.amount) > 5000.0) {
            transferParams.serviceFee = 0.5;
        }
        // update Transfer Params data to state
        updateState({
            transferFlow: transferParams?.transferFlow ?? state.transferFlow,
            selectedAccount: transferParams?.selectedAccount ?? null,
            loader: false,
            showOverlay: false,
            transferParams,
            errorMessage: Strings.AMOUNT_ERROR,
            flow,
            reference: transferParams?.reference ?? state.reference,
            paymentDesc: transferParams?.paymentDesc ?? state.paymentDesc,
            notifyEmail: transferParams?.notifyEmail ?? state.notifyEmail,
            secure2uValidateData,
            paymentMethods,
        });
        commonToast();
    }

    function commonToast() {
        const transferParams = route.params?.transferParams;

        if (route.params?.isAmountHigher || parseFloat(transferParams?.amount) > 5000.0) {
            setTimeout(() => {
                showInfoToast({
                    message: route.params?.errorMessage ?? Strings.SERVICE_FEE_CONFIRM,
                });
            }, 1000);
        }
    }

    /***
     * _onPaymentOptionTextChange
     * Notes / Payment option text change listener
     */
    function onPaymentOptionTextChange(text) {
        const disableBtn = !!(text?.length > 0 && text?.length < 3);
        updateState({ paymentDesc: text || null, disableBtn });
    }

    function onEmailOptionTextChange(text) {
        updateState({ notifyEmail: text || null });
    }

    async function onConfirmClick() {
        const accType =
            state.transferParams?.selectedAccount?.type === "D" ||
            state.transferParams?.selectedAccount?.type === "S"
                ? Strings.SAVINGS_CURRENT_ACCOUNT
                : state.transferParams?.selectedAccount?.type === "C"
                ? Strings.CREDIT_CARD
                : Strings.E_WALLET;
        const GAData = {
            autodebit: true,
            frequency: state.transferParams?.consentFrequencyText,
            editAmount: "N/A",
            cancellation: true,
            paymentMethod: accType,
            productName: state.transferParams?.selectedMerchant?.merchantName,
            numRequest: "N/A",
        };
        RTPanalytics.formABConfirmation(GAData);

        const flow = route.params?.flow ?? "NA";
        try {
            const { notifyEmail, paymentDesc } = state || {};
            if (
                state.transferFlow === 27 &&
                (isNull(transferParams?.selectedAccount) || !transferParams?.selectedAccount)
            ) {
                showInfoToast({ message: Strings.SELECT_PAY_FROM });
                return false;
            }
            const validateNotes =
                paymentDesc?.length > 0 && paymentDesc?.length < 3
                    ? paymentDetailsRegex(paymentDesc)
                    : true;
            const isEmailValid = notifyEmail?.length > 0 ? validateEmail(notifyEmail) : true;
            if (validateNotes && isEmailValid) {
                updateState({
                    showLoaderModal: true,
                });
                const apiTransferParams = getRTPRequestParams();
                if (state.transferFlow === 27) {
                    if (flow === "TAC") {
                        const tacParams = {
                            fundTransferType: Strings.AB_OTP_REQ,
                            payeeName: transferParams?.selectedAccount?.name,
                            toAcctNo: transferParams?.selectedAccount?.number,
                            cardNo: transferParams?.consentFrequency,
                        };
                        //if Flow is TAC open TAC model
                        updateState({ showTAC: true, tacParams });
                    } else {
                        billingCallRequest(apiTransferParams);
                    }
                } else {
                    if (flow === "TAC") {
                        const tacParams = {
                            fundTransferType: Strings.CHARGE_CUST_OTP_REQ,
                            payeeName: transferParams?.debtorName,
                            toAcctNo: transferParams?.debtorAccountNumber,
                            amount: transferParams?.amount,
                        };
                        //if Flow is TAC open TAC model
                        updateState({ showTAC: true, tacParams });
                    } else {
                        const chargeParams = getChargeParams();
                        chargeCustomer(chargeParams);
                    }
                }
            } else {
                if (!isEmailValid) {
                    showInfoToast({
                        message: Strings.PLEASE_REMOVE_INVALID_EMAIL,
                    });
                } else {
                    showErrorToast({
                        message: Strings.PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
                    });
                }
            }
        } catch (ex) {
            showInfoToast({
                message: ex.message || Strings.REQUEST_COULD_NOT_BE_PROCESSED,
            });
            updateState({
                showLoaderModal: false,
            });
        }
    }

    /***
     * rtpACallRequest
     * Pay for Request Money Flow Api call
     */
    async function chargeCustomer(params) {
        updateState({ showLoaderModal: true });
        const flow = route.params?.flow ?? "NA";
        try {
            const response = await chargeCustomerAPI(params);

            // updateState({ msgId: response?.data?.result?.msgId });
            setMsgId(response?.data?.result?.msgId);
            if (flow === "S2U") {
                const { transferParams } = state || {};
                transferParams.transactionresponse = response?.data?.result;
                updateState({ transferParams, showLoaderModal: false });
                showS2uModal();
            } else {
                billingApiSuccess(response?.data?.result ?? {});
            }
        } catch (error) {
            billingApiFailed(error);
        }
    }

    /***
     * rtpACallRequest
     * Pay for Request Money Flow Api call
     */
    async function billingCallRequest(params) {
        updateState({ showLoaderModal: true });
        const flow = route.params?.flow ?? "NA";
        try {
            const response = await consentRegister({
                ...params,
                twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
            });
            const msgId = response?.data?.result?.msgId;
            setMsgId(msgId);
            if (flow === "S2U") {
                const { transferParams } = state || {};
                transferParams.transactionresponse = response?.data?.result;
                updateState({ transferParams, showLoaderModal: false });
                showS2uModal();
            } else {
                billingApiSuccess(response?.data?.result ?? {});
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
        const { transferParams } = state || {};
        resetModel(["accounts"]);
        updateState({
            loader: false,
            showLoaderModal: false,
            showOverlay: false,
        });
        hideTAC();
        if (["0", "0000", "000"].includes(response?.statusCode)) {
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
            transferParams.expiryDateTime = state.expiryDate ?? "";
            transferParams.expiryDateFormatted = state.expiryDateFormatted ?? "";

            //  Response navigate to Acknowledge Screen
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    ...route.params,
                    transferParams,
                    transactionReferenceNumber: response?.formattedTransactionRefNumber,
                    errorMessge: "",
                    screenDate: route.params?.screenDate,
                },
            });
        } else {
            error200Handler(response);
        }
    }

    // error200
    function error200Handler(response) {
        const responseObject = response?.result ?? response;

        const transferParams = {
            ...state.transferParams,
            additionalStatusDescription: responseObject?.additionalStatusDescription,
            statusDescription: Strings.UNSUCCESSFUL,
            transactionResponseError: state.transferParams?.refundIndicator
                ? Strings.REQUEST_UNSUCCESSFUL
                : responseObject?.statusDescription ?? Strings.WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber: responseObject?.formattedTransactionRefNumber,
            transactionDate: response?.serverDate ?? "",
            transferFlow: route.params?.transferParams?.transferFlow ?? state.transferFlow,
        };
        hideTAC();
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
            params: {
                ...route.params,
                transferParams,
                screenDate: route.params?.screenDate,
            },
        });
    }

    async function duitNowRtp() {
        const { transferParams } = state || {};
        const params = transferParams?.isChargeCustomer ? getChargeParams() : getRTPRequestParams();
        try {
            const response = transferParams?.isChargeCustomer
                ? await chargeCustomerAPI(params)
                : await consentRegister(params);

            if (["0", "0000", "000"].includes(response?.data?.result?.statusCode)) {
                billingApiSuccess(response?.data?.result ?? {});
            } else {
                billingApiFailed(response?.data);
            }
        } catch (err) {
            billingApiFailed(err);
        }
    }

    /***
     * onTacSuccess
     * Handle TAC Success Flow
     */
    async function onTacSuccess(response) {
        if (response) {
            const { transferParams } = state || {};
            const tacParams = transferParams?.isChargeCustomer
                ? {
                      fundTransferType: Strings.CHARGE_CUST_OTP_VERIFY,
                      payeeName: transferParams?.debtorName,
                      toAcctNo: transferParams?.debtorAccountNumber,
                      amount: transferParams?.amount,
                      tacNumber: response,
                  }
                : {
                      fundTransferType: Strings.AB_OTP_VERIFY,
                      payeeName: transferParams?.selectedAccount?.name,
                      toAcctNo: transferParams?.selectedAccount?.number,
                      cardNo: transferParams?.consentFrequency,
                      tacNumber: response,
                  };

            try {
                const result = await nonMonetoryValidate(tacParams);
                if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
                    try {
                        duitNowRtp();
                    } catch (error) {
                        billingApiFailed(error);
                    }
                }
            } catch (err) {
                const tacWrong = [{ ...err?.error, tacWrong: true }];
                billingApiFailed(tacWrong);
            }
        }
    }

    /***
     * billingApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     */
    function billingApiFailed(error) {
        const { transferParams } = state || {};
        hideTAC();

        resetModel(["accounts"]);
        const errorsInner = error?.error;
        transferParams.statusDescription = errorsInner?.statusDescription ?? "";

        if ([428, 423, 422].includes(error.status)) {
            const rsaObject = {
                ...state.rsaObject,
                showRSA: true,
                errorObj: error,
                postCallback: makeAPICall,
                navigation,
            };
            updateState({ rsaObject, showLoaderModal: false });
        } else {
            let TacReqParam = {};
            if (error.code === 400) {
                //Handle All other failure cases
                updateState({
                    loader: false,
                    showLoaderModal: false,
                    showOverlay: false,
                });
                TacReqParam = {
                    ...state.transferParams,
                    additionalStatusDescription: errorsInner?.additionalStatusDescription,
                    statusDescription: Strings.UNSUCCESSFUL,
                    transactionResponseError: error?.message ?? Strings.WE_FACING_SOME_ISSUE,
                    showDesc: true,
                    transactionStatus: false,
                    formattedTransactionRefNumber:
                        errorsInner?.formattedTransactionRefNumber ??
                        errorsInner?.transactionRefNumber,
                    transactionDate: errorsInner?.serverDate ?? "",
                    transferFlow: transferParams?.transferFlow ?? state.transferFlow,
                    errorMessage: "",
                };
                if (error?.result?.msgId) {
                    TacReqParam.transactionresponse = {
                        msgId: error?.result?.msgId,
                        consentId: TacReqParam?.consentId,
                    };
                }
            } else {
                updateState({
                    loader: false,
                    showLoaderModal: false,
                    showOverlay: false,
                });
                TacReqParam = {
                    ...state.transferParams,
                    statusDescription: "Declined",
                    transactionResponseError: error?.[0]?.message ?? Strings.WE_FACING_SOME_ISSUE,
                    showDesc: true,
                    transactionStatus: false,
                    transactionresponse: {
                        msgId: error?.[0]?.refId,
                    },
                    transferFlow: transferParams?.transferFlow ?? state.transferFlow,
                    errorMessage: error?.[0]?.message,
                };
            }
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    ...route.params,
                    transferParams: TacReqParam,
                    screenDate: route.params?.screenDate,
                },
            });
        }
    }

    /***
     * showS2uModal;
     * show S2u modal to approve the Transaction
     */
    async function showS2uModal() {
        const params = state.transferParams?.isChargeCustomer
            ? {
                  twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                  fundTransferType: Strings.CHARGE_CUST_S2U,
                  payeeName: state.transferParams?.debtorName,
                  toAcctNo: state.transferParams?.debtorAccountNumber,
                  amount: state.transferParams?.amount,
              }
            : {
                  twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                  fundTransferType: Strings.AB_S2U,
                  payeeName: state.transferParams?.selectedAccount?.name,
                  toAcctNo: state.transferParams?.selectedAccount?.number,
                  cardNo: state.transferParams?.consentFrequency,
              };

        const result = await nonMonetoryValidate(params);
        if (state.transferParams?.isChargeCustomer) {
            const { s2uTransactionId } = result?.data || null;
            const s2uTransactionDetails = [
                {
                    label: Strings.TRANSACTION_TYPE,
                    value: Strings.RTP_CHARGE_CUSTOMER,
                },
                {
                    label: Strings.PAY_TO,
                    value: `${
                        state.transferParams?.creditorAccountObj?.name
                    }\n${formateAccountNumber(
                        state.transferParams?.creditorAccountObj?.number,
                        12
                    )}`,
                },
                {
                    label: "Charge to",
                    value: `${state.transferParams?.debtorName}`,
                },
                { label: "Date & time", value: moment().format("DD MMM YYYY, hh:mm A") },
            ];
            //Show S2U Model update the payload
            updateState({
                pollingToken: s2uTransactionId,
                s2uTransactionDetails,
                showS2u: true,
            });
        } else if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
            const { s2uTransactionId } = result?.data || null;

            const s2uTransactionDetails = [
                {
                    label: Strings.PAY_TO,
                    value: `${state.transferParams?.selectedMerchant?.merchantName}`,
                },
                {
                    label: Strings.PAY_FROM,
                    value: `${state.transferParams?.selectedAccount?.name}\n${formateAccountNumber(
                        state.transferParams?.selectedAccount?.number,
                        12
                    )}`,
                },
                {
                    label: Strings.FREQUENCY,
                    value: state?.transferParams?.consentFrequencyText,
                },
                {
                    label: Strings.DATE_AND_TIME,
                    value: moment().format(Strings.DATE_TIME_FORMAT_DISPLAY2),
                },
            ];
            //Show S2U Model update the payload
            updateState({
                pollingToken: s2uTransactionId,
                s2uTransactionDetails,
                showS2u: true,
            });
        }
    }

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    function onS2uDone(response) {
        const { transferParams } = state;
        const { transactionStatus, s2uSignRespone } = response || {};
        transferParams.s2uSignRespone = s2uSignRespone;
        // Close S2u popup
        onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            // Show success page
            const { statusDescription, text, status } = s2uSignRespone || {};
            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription || status;
            transferParams.transactionResponseError = text;
            transferParams.s2uType = true;
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
            transferParams.expiryDateTime = state.expiryDate ?? "";
            transferParams.expiryDateFormatted = state.expiryDateFormatted ?? "";
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    ...route.params,
                    transferParams,
                    transactionResponseObject: s2uSignRespone.payload,
                    screenDate: route.params?.screenDate,
                    errorMessge: null,
                },
            });
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone || {};
            const serverError = text || "";
            transferParams.s2uType = false;
            transferParams.formatRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber;
            transferParams.transactionStatus = false;
            transferParams.transactionResponseError = serverError;
            transferParams.statusDescription = statusDescription;
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
                transferParams.errorMessage = Strings.S2U_AUTH_REJECTED;
                transferParams.transferMessage = Strings.PAYMENT_DECLINED;
                transferParams.s2uReject = Strings.AUTHORISATION;
                transferParams.s2uRejectMsg = Strings.S2U_AUTH_REJECTED;
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = Strings.ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transferParams.transferMessage = Strings.ONE_TAP_AUTHORISATION_HAS_EXPIRED;
            }

            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.AUTOBILLING_ACKNOWLEDGEMNT,
                params: {
                    ...route.params,
                    transferParams,
                    transactionResponseObject: s2uSignRespone.payload,
                    transactionReferenceNumber: transactionId,
                    screenDate: route.params?.screenDate,
                },
            });
        }
    }

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    function onS2uClose() {
        // will close tac popup
        updateState({ showS2u: false });
    }

    /***
     * hideTAC
     * Close TAc Model
     */
    function hideTAC() {
        const { showTAC } = state || {};
        if (showTAC) {
            updateState({
                showTAC: false,
                showOverlay: false,
                loader: false,
                showLoaderModal: false,
            });
        }
    }

    /***
     * _onRightButtonPressAccount
     * Close Account Dropdown
     */
    function onRightButtonPressAccount(value, index) {
        updateState({
            showAccountScrollPickerView: false,
            selectedAccount: value,
        });
    }

    /***
     * _onLeftButtonPressAccount
     * Close Account Dropdown
     */
    function onLeftButtonPressAccount() {
        updateState({
            showAccountScrollPickerView: false,
        });
    }

    /***
     * _onClosePress
     * On Header Close Button Click Event Listener
     */
    function onClosePress() {
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_DASHBOARD,
            params: { updateScreenData: true, doneFlow: true },
        });
    }

    /***
     * _onTeamsConditionClick
     * Open DuitNow Teams and Conditions PDF view
     */
    async function onTeamsConditionClick() {
        const navParams = {
            file: termsAndConditionUrl,
            share: false,
            showShare: false,
            type: "url",
            pdfType: Strings.SHARERECEIPT,
            title: Strings.TERMS_CONDITIONS,
        };

        // Navigate to PDF viewer to display PDF
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });
    }

    /***
     * hideDatePicker
     * hide Calender picker
     */
    function hideDatePicker() {
        updateState({
            showDatePicker: false,
        });
    }

    /***
     * onDateDonePress
     * handle done pressed on Calender picker
     */
    function onDateDonePress(date) {
        const formatedDate = getFormatedDateMoments(date, Strings.DATE_SHORT_FORMAT);
        updateState({ expiryDateFormatted: formatedDate, expiryDate: date });
        hideDatePicker();
    }

    /***
     * _onRecipientReferenceClick
     * On payment Reference click navigate to Reference to get updated reference
     */
    function onRecipientReferenceClick() {
        const transferParams = {
            ...route.params?.transferParams,
            notifyEmail: state.notifyEmail,
            paymentDesc: state.paymentDesc,
            expiryDateFormatted: state.expiryDateFormatted,
        };

        navigation.push(navigationConstant.AUTOBILLING_MERCHANT_DETAILS, {
            ...route.params,
            transferParams,
            isEdit: true,
        });
    }

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    function onBackPress() {
        navigation.goBack();
    }

    function getRTPRequestParams() {
        const {
            transferParams,
            scnSndrId,
            scnSndrIc,
            paymentDesc,
            expiryDateFormatted,
            expiryDate,
            usrDbrtScndType,
            countryCode,
            custName,
        } = state || {};
        const sof = transferParams?.productInfo?.acceptableSourceOfFunds?.join("");
        const user = getModel("user");

        const UsrScndId = scnSndrId || scnSndrIc;
        const checkPass = usrDbrtScndType === "03" ? UsrScndId + countryCode : UsrScndId;

        const accNumber = transferParams?.selectedAccount?.number?.substring(0, 12);
        const ABReqAgain = route.params?.isRequestAgain;
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        return {
            typeUpdate: ABReqAgain ? "REQUESTAGAIN" : "",
            consentExpiryDate: transferParams?.consentExpiryDate
                ? moment(transferParams?.consentExpiryDate).format(Strings.DATE_SHORT_FORMAT2)
                : transferParams?.consentExpiryDate,
            consentStartDate: transferParams?.consentStartDate
                ? moment(transferParams?.consentStartDate).format(Strings.DATE_SHORT_FORMAT2)
                : transferParams?.consentStartDate,
            consentFrequency: transferParams?.consentFrequency,
            consentMaxLimit: transferParams?.consentMaxLimit,
            expiryDateTime: expiryDate ?? "",
            expiryDateFormatted: expiryDateFormatted ?? "",

            refs1: transferParams?.reference ?? "",
            refs2: paymentDesc ?? "",
            frstPrtyPymtVal: transferParams?.frstPrtyPymtVal ?? "00",
            merchantId: transferParams?.merchantId ?? transferParams?.selectedMerchant?.merchantId,
            productId: transferParams?.productId,
            sourceOfFunds: sof,

            creditorName: transferParams?.selectedMerchant?.merchantName,
            creditorScndTp: "D",
            creditorScndVal: "",

            debtorName: user?.cus_name ?? custName,
            debtorAcctNum: accNumber,
            debtorType: usrDbrtScndType,
            debtorVal: checkPass,
            debtorAcctType: transferParams?.selectedAccount?.type,
            debtorScndVal: checkPass,
            debtorScndType: usrDbrtScndType,

            email: state.notifyEmail,
            transferFlow: 27,
            mobileSDKData: mobileSDK, // Required For RSA
        };
    }

    function getChargeParams() {
        const { transferParams } = state || {};
        const flow = route.params?.flow ?? "NA";
        const twoFAType = flow === "S2U" ? FundConstants.TWO_FA_TYPE_SECURE2U_PULL : undefined;
        const { merchantInquiry } = getModel("rpp");
        return {
            twoFAType,
            consentId: transferParams?.consentId,
            merchantId: transferParams?.merchantId ?? transferParams?.selectedMerchant?.merchantId,
            productId: transferParams?.productId,
            creditorName: transferParams?.merchantName,
            creditorAcctNum: transferParams?.creditorAccount ?? merchantInquiry?.accNo,
            creditorAcctType: "CACC", //merchant account type always CACC

            //Default values as per paynet specs
            debtorName: "DD Debtor",
            debtorAcctNum: "DD Debtor Account",
            debtorAcctType: "SVGS",
            trxAmount: transferParams?.amount,
            refs1: transferParams?.ref1 ?? "",
            realDebtorName: transferParams?.debtorName,
            realDebtorAcctNum: transferParams?.debtorAccountNumber,
        };
    }

    function handleInfoPress(type) {
        const infoTitle =
            type === Strings.FREQUENCY ? Strings.FREQUENCY_TRN : Strings.LIMIT_PER_TRANSACTION;
        const infoMessage =
            type === Strings.FREQUENCY ? Strings.FREQUENCY_DETAILS : Strings.LIMIT_DETAILS;

        updateState({ infoTitle, infoMessage, showFrequencyInfo: !state.showFrequencyInfo });
    }

    function onToggle() {
        const { transferParams } = state || {};
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.AUTOBILLING_AUTODEBIT,
            params: {
                transferParams: {
                    ...transferParams,
                    paymentDesc: state.paymentDesc,
                    notifyEmail: state.notifyEmail,
                    reference: state.reference,
                },
            },
        });
    }

    /***
     * _onEditAmount
     * On Click listener to open Amount edit screen
     */
    function onEditAmount() {
        navigation.goBack();
    }

    const paymentDescIos =
        state.paymentDesc && state.paymentDesc?.length >= 1
            ? Styles.commonInputConfirmIosText
            : Styles.commonInputConfirmIos;

    const paymentDescAndroid =
        state.paymentDesc && state.paymentDesc?.length >= 1
            ? Styles.commonInputConfirmText
            : Styles.commonInputConfirm;
    const font = {
        color: ROYAL_BLUE,
        fontFamily: "Montserrat-SemiBold",
        marginRight: 4,
    };
    const inputStyling = [Platform.OS === "ios" ? paymentDescIos : paymentDescAndroid, font];

    const { transferFlow } = state || {};
    const auDebitParams = {
        transferParams: {
            ...state.transferParams,
        },
        autoDebitEnabled: true,
        showProductInfo: true,
        transferFlow: 25,
        handleInfoPress,
        showTooltip: false,
        onToggle,
    };

    return (
        <ScreenContainer
            backgroundType="color"
            showErrorModal={state.showErrorModal}
            errorMessage={state.errorMessage}
            showOverlay={state.showOverlay}
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={state.showLoaderModal || !isStateUpdated}
            analyticScreenName={"DuitNow_ReviewDetails"}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={Strings.CONFIRMATION}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                        headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                useSafeArea
            >
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={Styles.parentBlockConfirm}>
                        <View style={Styles.blockConfirm}>
                            <TransferImageAndDetails
                                title={toTitleCase(
                                    transferFlow === 27
                                        ? state.transferParams?.selectedMerchant?.merchantName
                                        : state.transferParams?.debtorName
                                )}
                                subtitle={
                                    transferFlow !== 27
                                        ? numberMasking(transferParams?.debtorAccountNumber) || null
                                        : ""
                                }
                                image={{
                                    type: "local",
                                    source: Assets.icDuitNowCircle,
                                }}
                                isVertical={transferFlow !== 27}
                            />
                            {transferFlow === 27 ? (
                                <View style={Styles.mVertical20}>
                                    <View style={Styles.viewRow3}>
                                        <View style={Styles.viewRowLeftItem}>
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={19}
                                                textAlign="left"
                                                text={Strings.DUITNOW_AUTODEBIT_CARD_TITLE}
                                            />
                                        </View>
                                    </View>
                                    <AutoDebitCard {...auDebitParams} />
                                </View>
                            ) : null}
                            {transferFlow !== 27 ? (
                                <View style={Styles.amountCenterConfirm}>
                                    <TouchableOpacity
                                        onPress={
                                            state.transferParams?.isChargeCustomer
                                                ? onEditAmount
                                                : null
                                        }
                                        testID="btnEditAmount"
                                        accessibilityLabel="btnEditAmount"
                                    >
                                        <Typography
                                            fontSize={24}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={31}
                                            textAlign="center"
                                            color={
                                                state.transferParams?.isChargeCustomer
                                                    ? ROYAL_BLUE
                                                    : BLACK
                                            }
                                            text={`${Strings.CURRENCY}${
                                                state.transferParams?.amount ?? ""
                                            }`}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {transferFlow === 27 ? (
                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            textAlign="left"
                                            color={BLACK}
                                            text={Strings.PAY_FROM}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            color={BLACK}
                                            text={
                                                state.transferParams?.selectedAccount?.name +
                                                "\n" +
                                                formateAccountNumber(
                                                    state.transferParams?.selectedAccount?.number,
                                                    12
                                                )
                                            }
                                        />
                                    </View>
                                </View>
                            ) : null}

                            <View style={Styles.viewRow}>
                                <View style={Styles.viewRowLeftItem}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        color={BLACK}
                                        text={Strings.RECIPIENT_REFERENCE}
                                    />
                                </View>
                                <View style={Styles.viewRowRightItem}>
                                    <TouchableOpacity
                                        disabled={
                                            transferFlow === 26 ||
                                            state.transferParams?.isChargeCustomer
                                        }
                                        onPress={onRecipientReferenceClick}
                                        testID="txtRECIPIENT_REFERENCE"
                                        accessibilityLabel="txtRECIPIENT_REFERENCE"
                                    >
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            maxLength={20}
                                            color={
                                                transferFlow === 26 ||
                                                state.transferParams?.isChargeCustomer
                                                    ? BLACK
                                                    : ROYAL_BLUE
                                            }
                                            text={
                                                state.transferParams.reference ??
                                                state.transferParams?.ref1
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {transferFlow === 27 || state.transferParams?.paymentDesc ? (
                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            textAlign="left"
                                            color={BLACK}
                                            text={Strings.PAYMENT_DETAILS}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItemOption}>
                                        {state.transferParams?.paymentDesc &&
                                        transferFlow !== 27 ? (
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="right"
                                                maxLength={20}
                                                text={state.transferParams?.paymentDesc ?? ""}
                                            />
                                        ) : (
                                            <TextInput
                                                placeholderTextColor={ROYAL_BLUE}
                                                textAlign="right"
                                                autoCorrect={false}
                                                autoFocus={false}
                                                allowFontScaling={false}
                                                style={[inputStyling, Styles.textBox]}
                                                testID="inputReference"
                                                accessibilityLabel="inputReference"
                                                secureTextEntry={false}
                                                maxLength={20}
                                                placeholder={Strings.OPTIONAL1}
                                                value={state.paymentDesc}
                                                onChangeText={onPaymentOptionTextChange}
                                            />
                                        )}
                                    </View>
                                </View>
                            ) : null}
                            {transferFlow === 27 ? (
                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            textAlign="left"
                                            color={BLACK}
                                            text={Strings.NOTIFY_VIA_EMAIL}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItemOption}>
                                        {state.transferParams?.notifyEmail &&
                                        transferFlow !== 27 ? (
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="right"
                                                maxLength={20}
                                                text={state.transferParams?.notifyEmail}
                                            />
                                        ) : (
                                            <TextInput
                                                placeholderTextColor={ROYAL_BLUE}
                                                textAlign="right"
                                                autoCorrect={false}
                                                autoFocus={false}
                                                allowFontScaling={false}
                                                style={[inputStyling, Styles.textBox]}
                                                testID="emailReference"
                                                accessibilityLabel="emailReference"
                                                secureTextEntry={false}
                                                placeholder={Strings.OPTIONAL1}
                                                keyboardType="email-address"
                                                maxLength={40}
                                                value={state.notifyEmail}
                                                onChangeText={onEmailOptionTextChange}
                                            />
                                        )}
                                    </View>
                                </View>
                            ) : null}
                            {transferFlow !== 28 ? <View style={Styles.lineConfirm} /> : null}

                            <View style={transferFlow !== 28 && Styles.viewRowDescriberItem}>
                                {transferFlow === 27 ? (
                                    <View>
                                        <View style={Styles.viewRowDescriberOne}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={Strings.NOTES1}
                                            />
                                        </View>

                                        <View style={Styles.viewRowDescriberTwo}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={
                                                    Strings.MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT
                                                }
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                <View style={Styles.viewRowDescriberThree}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={FADE_GREY}
                                        text={Strings.DECLARATION + ":"}
                                    />
                                </View>

                                <View style={Styles.viewRowDescriberTwo}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={FADE_GREY}
                                        text={Strings.I_HEREBY_DECLARE_DUIT_NOW}
                                    />
                                </View>

                                <View style={Styles.viewRowTermsItem1}>
                                    <TouchableOpacity onPress={onTeamsConditionClick}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={BLACK}
                                            textDecorationLine="underline"
                                        >
                                            <Text
                                                style={commonStyles.termsConditionsLabel2}
                                                accessible
                                                testID="txtExistingUser"
                                                accessibilityLabel="txtExistingUser"
                                            >
                                                {Strings.TERMS_CONDITIONS}
                                            </Text>
                                        </Typography>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                    <ActionButton
                        disabled={state.loader}
                        fullWidth
                        borderRadius={25}
                        onPress={onConfirmClick}
                        backgroundColor={state.loader || state.disableBtn ? DISABLED : YELLOW}
                        componentCenter={
                            <Typography
                                color={state.loader || state.disableBtn ? DISABLED_TEXT : BLACK}
                                text={transferFlow === 28 ? "Charge Now" : "Request Now"}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>

            {state.showDatePicker && (
                <DatePicker
                    showDatePicker={state.showDatePicker}
                    onCancelButtonPressed={hideDatePicker}
                    onDoneButtonPressed={onDateDonePress}
                    dateRangeStartDate={moment(new Date()).add(1, "day")}
                    dateRangeEndDate={moment(new Date()).add(4, "months")}
                    defaultSelectedDate={moment(state.expiryDate).toDate()}
                />
            )}

            {state.showS2u && (
                <Secure2uAuthenticationModal
                    customTitle={
                        state.transferParams?.isChargeCustomer
                            ? "RM " + state.transferParams?.amount
                            : Strings.SETUP_AUTOBILLING_VIA
                    }
                    token={state.pollingToken}
                    onS2UDone={onS2uDone}
                    onS2UClose={onS2uClose}
                    transactionDetails={state.s2uTransactionDetails}
                    nonTxnData={{
                        isNonTxn: true,
                    }}
                    s2uPollingData={state.secure2uValidateData}
                    extraParams={{
                        metadata: {
                            txnType: state.transferParams?.isChargeCustomer
                                ? Strings.CHARGE_CUST_S2U
                                : Strings.AB_S2U,
                            refId: msgId,
                            creditorName: !state.transferParams?.isChargeCustomer
                                ? state.transferParams?.selectedMerchant?.merchantName
                                : "",
                        },
                    }}
                />
            )}

            {state.showTAC && (
                <TacModal
                    tacParams={state.tacParams}
                    validateByOwnAPI
                    validateTAC={onTacSuccess}
                    onTacClose={hideTAC}
                />
            )}

            <ScrollPickerView
                showMenu={state.showAccountScrollPickerView}
                list={state.accountDropDown}
                onRightButtonPress={onRightButtonPressAccount}
                onLeftButtonPress={onLeftButtonPressAccount}
                rightButtonText="Done"
                leftButtonText="Cancel"
            />
            <Popup
                visible={state.showFrequencyInfo}
                title={state.infoTitle}
                description={state.infoMessage}
                onClose={handleInfoPress}
            />
            {state.rsaObject?.showRSA ? <RSAHandler {...state.rsaObject} /> : null}
        </ScreenContainer>
    );
}

ABConfirmation.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default withModelContext(ABConfirmation);

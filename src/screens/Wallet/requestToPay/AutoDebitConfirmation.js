import { useFocusEffect } from "@react-navigation/native";
import { isEmpty, isNull } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import {
    fundTransferApi,
    bankingGetDataMayaM2u,
    rtpActionApi,
    fundRtpTransferInquiryApi,
    autoDebitAcceptance,
    senderDetails,
} from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { YELLOW, BLACK, MEDIUM_GREY, BLUE, TRANSPARENT, FADE_GREY } from "@constants/colors";
import { idMapProxy, termsAndConditionUrl } from "@constants/data/DuitNowRPP";
import * as FundConstants from "@constants/fundConstants";
import {
    SECURE2U_IS_DOWN,
    AMOUNT_ERROR,
    TO,
    FROM,
    TRANSACTION_TYPE,
    DATE,
    WE_FACING_SOME_ISSUE,
    CONFIRMATION,
    RECIPIENT_REFERENCE,
    PAYMENT_DETAILS,
    DECLARATION,
    I_HEREBY_DECLARE_DUIT_NOW,
    TERMS_CONDITIONS,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    PAY_RTP_FROM,
    NOTES1,
    PLEASE_SELECT_FROM_ACCOUNT,
    DUITNOW_ID_INQUIRY_FAILED,
    RTP_AUTODEBIT,
    REFUND_TO,
    APPROVE_AD,
    REJECT_AD,
    MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT,
} from "@constants/strings";

import {
    formateAccountNumber,
    getDeviceRSAInformation,
    formateIDName,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";

export const { width, height } = Dimensions.get("window");
function AutoDebitConfirmation({ navigation, route, getModel, resetModel, updateModel }) {
    const [state, setState] = useState({
        transferFlow: 1,
        accounts: [],
        loader: false,
        duitNowRecurring: false,
        selectedAccount: null,
        showOverlay: false,
        errorMessage: "",
        transferParams: {},
        primaryAccount: "",
        fromAccount: "",
        fromAccountCode: "",
        fromAccountName: "",
        formatedFromAccount: "",
        effectiveDate: "00000000",
        stateData: {},
        paymentRef: "",
        expiryDate: moment(new Date()).add(route.params?.soleProp ? 14 : 7, "day"),
        formatedStartDate: "",
        formatedEndDate: "",
        endDateInt: 0,
        startDateInt: 0,

        // RSA State Objects
        isRSARequired: false,
        challengeQuestion: "",
        challengeRequest: {},
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,

        latestParamsCreated: null,
        latestAPiCalled: null,

        // S2u/TAC related
        secure2uValidateData: {},
        flow: "",
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],

        // TacModal
        apiTransferParams: {},
        showTAC: false,
        tacParams: {},
        selectedEditable: { code: "noteditable", name: "Not editable" },
        accountScrollPickerSelected: false,

        // enable auto debit
        paymentMethods: [
            { key: "01", title: "Saving & current account", isSelected: true },
            { key: "02", title: "Credit card", isSelected: true },
            { key: "03", title: "E-Wallet", isSelected: true },
        ],
        notifyEmail: "",
        popupTitle: "",
        popupDesc: "",
        popupPrimaryAction: {
            text: "Confirm",
            onPress: () => {},
        },
        popupSecondaryAction: {
            text: "Back",
            onPress: () => {},
        },
        senderBrn: "",

        paymentMethodGA: [],

        //passport user
        countryCode: "",
    });

    const [isPopupDisplay, setIsPopupDisplay] = useState(false);

    function updateState(stateData) {
        setState((prevState) => {
            return { ...prevState, ...stateData };
        });
    }

    useEffect(() => {
        RTPanalytics.screenLoadDuitNowRequestADConfirmation();
        updateDataInScreenAlways();
    }, []);

    useFocusEffect(
        useCallback(() => {
            onFocusScreenUpdate();
        }, [])
    );

    async function onFocusScreenUpdate() {
        const transferParams = route.params?.transferParams;

        if (!transferParams?.productId && route.params?.productId) {
            transferParams.productId = route.params?.productId;
            transferParams.merchantId = route.params?.merchantId;
            transferParams.senderBrn = route.params?.senderBrn;
        }
        transferParams.timeInSecs = new Date().getTime();
        let resData = "";
        let idType = "";
        let idValue = "";
        const senderDetailsContext = getModel("rpp")?.senderDetails;
        //if senderDetails not in context initiate api call
        if (senderDetailsContext?.apiCalled === false) {
            const response = await senderDetails();
            resData = response?.data ?? "";
            idType = idMapProxy.find((item) => item.name === resData?.idType);
            idValue = resData?.newICNumber || resData?.sdrId;
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
            idType = idMapProxy.find((item) => item.name === resData?.idType);
            idValue = resData?.newICNumber || resData?.sdrId;
        }

        // for individual, need to use IC number instead of brn, type is 01
        const transParams = { ...transferParams, ...route.params?.autoDebitParams };

        updateState({
            paymentRef: transferParams?.reference,
            transferParams: transParams,
            senderBrn: route.params?.senderBrn || idValue,
            debtorScndVal: idValue,
            debtorScndType: idType.code,
            countryCode: resData?.idCountryCode,
        });
    }

    /**
     *_updateDataInScreenAlways
     * @memberof AutoDebitConfirmation
     */
    async function updateDataInScreenAlways() {
        // get transferParams for screen data
        const transferParams = route.params?.transferParams;

        // get Payment method flow TAC / S2U Data from Validate Api
        const secure2uValidateData = route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };
        const formatedStartDate = transferParams?.formatedStartDate ?? "";
        const formatedEndDate = transferParams?.formatedEndDate ?? "";
        const startDateInt = transferParams?.startDateInt ?? "00000000";
        const endDateInt = transferParams?.endDateInt ?? "00000000";
        const effectiveDate = transferParams?.effectiveDate ?? "00000000";
        const isFutureTransfer = transferParams?.isFutureTransfer ?? false;
        const duitNowRecurring = transferParams?.duitNowRecurring ?? false;
        const selectedAccount = transferParams?.selectedAccount ?? null;
        const methodPaymentGA = state.paymentMethods;
        const stateData = route?.params?.params ?? route?.params;

        // get Payment method flow TAC / S2U
        let flow = stateData?.flow ?? route.params?.flow ?? "NA";

        const s2uEnabled = secure2uValidateData.s2u_enabled;

        // Show S2U Down or Register Failed role back to TAC Toast
        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth === "fail") {
                    showErrorToast({
                        message: "Failed to register for Secure2u.Please use TAC.",
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
        transferParams.productId = transferParams?.originalData?.productId;
        transferParams.merchantId = transferParams?.originalData?.merchantId;
        transferParams.senderBrn = route.params?.senderBrn ?? state?.senderBrn;

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
            formatedStartDate,
            formatedEndDate,
            startDateInt,
            endDateInt,
            effectiveDate,
            duitNowRecurring,
            isFutureTransfer,
            selectedAccount,
            loader: false,
            showOverlay: false,
            transferParams,
            transferFlow: transferParams?.transferFlow,
            errorMessage: AMOUNT_ERROR,
            flow,
            stateData,
            paymentRef: transferParams?.reference,
            paymentDesc: transferParams?.paymentDesc,
            notifyEmail: transferParams?.notifyEmail,
            secure2uValidateData,
            accountScrollPickerSelected: false,
            paymentMethods,
            senderBrn: route.params?.senderBrn || state.debtorScndVal,
            paymentMethodGA: methodPaymentGA,
        });

        getAllAccounts();
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    async function getAllAccounts() {
        try {
            showLoader(true);
            const path = "/summary?type=A";
            //get the user accounts
            const response = await bankingGetDataMayaM2u(path, false);
            if (response?.data?.code === 0) {
                const { accountListings } = response?.data?.result;

                if (accountListings?.length > 0) {
                    const listData = accountListings;
                    const listWithPrimaryAcc = accountListings.filter((acc) => {
                        return acc?.primary;
                    });
                    const primaryAccount = listWithPrimaryAcc[0]?.number;
                    updateState({
                        primaryAccount,
                    });
                    setSelectFromAccount(listData);
                }
            }
        } catch (error) {
            // error when retrieving the data
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
            showLoader(false);
        }
    }

    function getAdditionalTransferParams(accountItem) {
        return {
            fromAccount: accountItem?.number,
            formatedFromAccount: formateAccountNumber(accountItem?.number, 12),
            formattedFromAccount: formateAccountNumber(accountItem?.number, 12),
            fromAccountCode: accountItem?.code,
            fromAccountName: accountItem?.name,
        };
    }

    /***
     * _setSelectFromAccount
     * set selected Acccount either from account or primary account
     */
    function setSelectFromAccount(newAccountList) {
        const { primaryAccount } = state;
        const { transferParams } = route?.params;
        const targetSelectedAccounts = [];
        const nonSelectedAccounts = [];
        //Remove To Account From Account List  //Set Selected Account in Account List
        const fromAccountTempSelected = transferParams?.fromAccount ?? primaryAccount;
        const tempArray = newAccountList.slice();
        const accountsArray = tempArray.map((accountItem, index) => {
            //Compare from Account with account number and marked as selected
            if (
                fromAccountTempSelected?.substring(0, 12) !== accountItem?.number?.substring(0, 12)
            ) {
                nonSelectedAccounts.push(accountItem);
            }

            return {
                ...accountItem,
                selectionIndex: index,
                isSelected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                selected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                description: accountItem?.number,
                type:
                    fromAccountTempSelected?.substring(0, 12) ===
                        accountItem?.number?.substring(0, 12) && accountItem?.type,
            };
        });

        const selectedAccount = accountsArray.filter((selectedAcc) => {
            return selectedAcc.isSelected === true;
        });
        if (selectedAccount?.length === 1) targetSelectedAccounts.push(selectedAccount[0]);

        const selectedAccountObj = !targetSelectedAccounts?.length
            ? nonSelectedAccounts[0]
            : selectedAccount[0];
        const { fromAccount, formatedFromAccount, fromAccountCode, fromAccountName } =
            getAdditionalTransferParams(selectedAccountObj);

        //if no account match set first account as selected Account
        if (nonSelectedAccounts?.length >= 1 && !targetSelectedAccounts?.length) {
            selectedAccountObj.selected = true;
            nonSelectedAccounts[0] = selectedAccountObj;
            transferParams.fromAccount = fromAccount;
            transferParams.formattedFromAccount = formatedFromAccount;
            transferParams.fromAccountCode = fromAccountCode;
            transferParams.fromAccountName = fromAccountName;
        }
        //push non selected list to display account list
        targetSelectedAccounts.push(...nonSelectedAccounts);

        if (targetSelectedAccounts.length < 1) {
            targetSelectedAccounts.push(...newAccountList);
        }
        //Update this transfer params
        const newTransferParams = {
            ...transferParams,
            fromAccount,
            fromAccountCode,
            fromAccountName,
            formatedFromAccount,
            selectedAccount: selectedAccountObj,
        };
        //Update this transfer params and selected Accounts to state
        updateState({
            fromAccount,
            fromAccountCode,
            fromAccountName,
            formatedFromAccount,
            accounts: targetSelectedAccounts,
            selectedAccount: selectedAccountObj,
            transferParams: newTransferParams,
            accountScrollPickerSelected: true,
        });
        showLoader(false);
    }

    /***
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    function onAccountListClick(item) {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const selectedAcc = item;
        if (!(parseFloat(item.acctBalance) <= 0.0 && itemType === "account")) {
            const tempArray = state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
                tempArray[i].isSelected = tempArray[i].selected;
            }
            updateState({
                accounts: tempArray,
                selectedAccount: selectedAcc,
                fromAccount: item.number,
                fromAccountCode: item.code,
                fromAccountName: item.name,
                formatedFromAccount: formateAccountNumber(item.number, 12),
            });
        }
    }

    /**
     *_onConfirmClick
     * @memberof AutoDebitConfirmation
     */
    async function onConfirmClick() {
        onPopupClosePress();
        const {
            formatedStartDate,
            formatedEndDate,
            duitNowRecurring,
            isFutureTransfer,
            fromAccount,
            fromAccountCode,
            fromAccountName,
            formatedFromAccount,
            effectiveDate,
            paymentDesc,
            transferFlow,
            startDateInt,
            endDateInt,
            accountScrollPickerSelected,
            transferParams,
            notifyEmail,
            selectedEditable,
            selectedAccount,
            sourceOfFunds,
        } = state;
        const item = route.params?.transferParams;
        if (isNull(selectedAccount) || !selectedAccount) {
            showInfoToast({ message: "Please select pay from account." });
            return false;
        }
        if (transferFlow === 26 || accountScrollPickerSelected) {
            const swiftCode = route.params?.transferParams?.swiftCode ?? "";

            updateState({
                showOverlay: true,
                loader: true,
            });

            const deviceInfo = getModel("device");
            const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            transferParams.transactionStartDate = formatedStartDate;
            transferParams.transactionEndDate = formatedEndDate;
            transferParams.isRecurringTransfer = duitNowRecurring;
            transferParams.isFutureTransfer = isFutureTransfer;
            transferParams.fromAccount = fromAccount;
            transferParams.formattedFromAccount = formatedFromAccount;
            transferParams.fromAccountCode = fromAccountCode;
            transferParams.fromAccountName = fromAccountName;
            transferParams.effectiveDate = effectiveDate;
            transferParams.deviceInfo = deviceInfo;
            transferParams.mobileSDK = mobileSDK;
            transferParams.paymentDesc = paymentDesc;
            transferParams.startDateInt = startDateInt;
            transferParams.endDateInt = endDateInt;
            transferParams.transferType = null;
            transferParams.transferSubType = null;
            transferParams.twoFAType = null;
            transferParams.swiftCode = swiftCode;

            //new params p2b
            transferParams.amountEditable = selectedEditable?.code === "editable";
            transferParams.expiryDateTime = state.expiryDate;
            transferParams.sourceOfFunds = sourceOfFunds;
            transferParams.notifyEmail = notifyEmail;
            transferParams.senderName = transferParams.payerName ?? transferParams.senderName;
            transferParams.receiverAcct = (
                transferParams?.receiverAcct ??
                transferParams?.formattedToAccount ??
                transferParams?.toAccount
            ).replace(/[^0-9]|[ ]/g, "");

            try {
                const result = await performFirstPartyValidation(transferParams);
                if (result?.data?.accountExists) {
                    if (transferFlow === 26) {
                        // Maybank Open Account Fund transfer and Send Money Transfer
                        transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;
                        transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_MAYBANK;
                        transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                        transferParams.twoFAType = null;

                        //GA
                        const GAData = {
                            autodebit:
                                state?.autoDebitStatus === "REJECT" ||
                                item?.coupleIndicator === false
                                    ? false
                                    : state?.autoDebitStatus === "APPROVE" &&
                                      item?.coupleIndicator === true
                                    ? true
                                    : "",
                            frequency: state.transferParams?.consentFrequencyText,
                            edit_amount: "N/A",
                            cancellation: "N/A",
                            payment_method: state?.paymentMethodGA[0]?.title,
                            product_name: state.transferParams?.productInfo?.productName,
                            num_request: "N/A",
                        };
                        RTPanalytics.formADuitNowRequestADConfirmation(GAData);

                        if (state.flow === "S2U") {
                            // Call S2u API
                            transferParams.twoFAType =
                                state.secure2uValidateData?.pull === "N"
                                    ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                    : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                            callRtpActionApi(transferParams, state.flow);
                        } else {
                            // Save params in state until TAC is complete
                            //MayBank Third Party Fund Transfer TAG
                            transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                            const params = getTacParams();
                            updateState({
                                transferParams,
                                tacParams: params,
                            });
                            callRtpActionApi(transferParams, state.flow);
                        }
                    } else {
                        updateState({ loader: false });
                    }
                } else {
                    updateState({ transferParams });
                }
            } catch (e) {
                showErrorToast({
                    message: e?.message ?? DUITNOW_ID_INQUIRY_FAILED,
                });
            }

            updateState({
                showOverlay: false,
                loader: false,
            });
        } else {
            showInfoToast({
                message: PLEASE_SELECT_FROM_ACCOUNT,
            });
        }
    }

    function performFirstPartyValidation(item) {
        try {
            const params = {
                debtorCreditorInd: "D",
                bizMsgId: item?.requestId,
                firstPartyPayeeIndicator: item?.firstPartyPayeeIndicator,
                payeeName: item?.requestType === "REJECTED" ? item?.receiverName : item?.senderName,
                senderName: item?.senderName,
                senderAccountNo: item?.senderAcct,
                toAccount: item?.senderAcct,
                bankCode: item.swiftCode,
                payeeCode: "000000",
                swiftCode: item?.swiftCode,
                transferType: "RTP_TRANSFER",
            };
            return fundRtpTransferInquiryApi(params);
        } catch (e) {
            showErrorToast({ message: WE_FACING_SOME_ISSUE });
        }
    }

    /***
     * _rtpActionApi
     * Build Transaction params for TAC and S2U flow and Call transfer Api
     * And Show TAC or S2U Model
     */
    //
    function callRtpActionApi(transferParams, flow) {
        const apiTransferParams = getRTPPaymentParams();
        apiTransferParams.twoFAType = transferParams.twoFAType;
        if (transferParams.challenge) {
            apiTransferParams.challenge = transferParams.challenge;
        }

        updateState({
            latestParamsCreated: apiTransferParams,
            latestAPiCalled: rtpCallPayment,
        });

        if (flow === "TAC") {
            //if Flow is TAC open TAC model
            updateState({ showTAC: true, apiTransferParams });
        } else {
            rtpCallPayment(apiTransferParams);
        }
    }

    /***
     * rtpACallRequest
     * Pay for Request Money Flow Api call
     */
    async function rtpCallRequest(params) {
        updateState({
            latestParamsCreated: params,
            latestAPiCalled: rtpCallRequest,
        });

        updateState({ isRSARequired: false });

        try {
            const response = await rtpActionApi(params);
            rtpApiSuccess(response?.data?.result ?? {});
        } catch (error) {
            rtpApiFailed(error);
        }
    }

    /***
     * rtpCallPayment
     * Pay for Request Money Flow Api call
     */
    async function rtpCallPayment(params) {
        updateState({ isRSARequired: false });

        try {
            const response = await fundTransferApi(params);
            // if S2u get Polling Token and Open S2u Model
            if (state.flow === "S2U") {
                showS2uModal(response?.data, params);
            } else {
                if (params?.challenge) {
                    const routeParams = {
                        transferParams: {
                            ...state.transferParams,
                            actionFlow: state.flow,
                        },
                        transactionReferenceNumber:
                            state.transferParams?.formattedTransactionRefNumber,
                        errorMessge: "",
                        screenDate: route.params?.screenDate,
                    };
                    callAutoDebitAcceptance(routeParams);
                } else {
                    rtpApiSuccess(response?.data);
                }
            }
        } catch (error) {
            rtpApiFailed(error);
        }
    }

    /***
     * rtpActionCallApiSuccess
     * Handle Transfer Success Flow
     */
    function rtpApiSuccess(response) {
        const { transferParams } = state;
        resetModel(["accounts"]);

        updateState({
            // update state values
            isRSARequired: false,
            isRSALoader: false,
            loader: false,
            showOverlay: false,
        });

        if (["0", "000", "0000"].includes(response.statusCode)) {
            const transactionDate = response && response.serverDate ? response.serverDate : null;

            transferParams.additionalStatusDescription = response.additionalStatusDescription;
            transferParams.statusDescription = response.statusDescription;
            transferParams.transactionRefNo = response.transactionRefNumber;
            transferParams.transactionRefNumber = response.formattedTransactionRefNumber;
            transferParams.formattedTransactionRefNumber = response.formattedTransactionRefNumber;
            transferParams.nonModifiedTransactionRefNo = response.transactionRefNumber;
            transferParams.referenceNumberFull = response.transactionRefNumber;
            transferParams.referenceNumber = response.formattedTransactionRefNumber;
            transferParams.transactionDate = transactionDate;
            transferParams.serverDate = response.serverDate;
            transferParams.transactionresponse = response;
            transferParams.transactionRefNumberFull = response.transactionRefNumber;
            transferParams.transactionStatus = true;
            transferParams.consentStatus = state.autoDebitStatus === "REJECT" ? "REJECTED" : "";

            //  Response navigate to Acknowledge Screen
            const routeParams = {
                transferParams,
                transactionReferenceNumber: response.formattedTransactionRefNumber,
                consentId: response?.consentId,
                errorMessge: "",
                screenDate: route.params?.screenDate,
            };

            const screenName = navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN;
            navigation.navigate(screenName, routeParams);
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
            statusDescription: "unsuccessful",
            transactionResponseError:
                responseObject?.statusDescription ??
                responseObject?.additionalStatusDescription ??
                WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber: responseObject?.formattedTransactionRefNumber,
            transactionDate: response?.serverDate ?? "",
            transferFlow: state.transferFlow,
        };

        hideTAC();
        // if Failed navigate to Acknowledge Screen with Failure message
        navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
            transferParams,
            screenDate: route.params?.screenDate,
        });
    }

    /***
     * rtpActionApiSuccess
     * Handle Transfer Success Flow
     */
    function onTacSuccess(response) {
        const { transferParams } = state;
        const responseObject = response;

        updateState({
            // update state values
            isRSARequired: false,
            isRSALoader: false,
            loader: false,
        });

        // Add Completion
        const transactionResponseObject = responseObject;
        // Added All Transaction Status Special cases Handling
        const responseStatus = responseObject?.statusCode ?? "";
        const responseStatusDescription = responseObject?.statusDescription ?? "";
        if (
            ["0", "M000", "M001", "M100", "00U1", "000", "0", "Accepted"].includes(
                responseStatus
            ) ||
            responseStatusDescription === "Accepted"
        ) {
            const transactionDate = responseObject?.serverDate ? responseObject?.serverDate : null;

            if (responseObject?.onHold) {
                transferParams.onHold = responseObject?.onHold;
                transferParams.statusDescription = "Accepted";
                transferParams.transactionResponseError =
                    responseObject?.additionalStatusDescription;
            } else {
                transferParams.statusDescription =
                    responseObject?.statusDescription === "Accepted"
                        ? "Successful"
                        : responseObject?.statusDescription;
            }
            transferParams.additionalStatusDescription =
                responseObject?.additionalStatusDescription;
            transferParams.actionFlow = state.flow;
            transferParams.transactionRefNo = responseObject?.transactionRefNumber;
            transferParams.transactionRefNumber = responseObject?.formattedTransactionRefNumber;
            transferParams.formattedTransactionRefNumber =
                responseObject?.formattedTransactionRefNumber;
            transferParams.nonModifiedTransactionRefNo =
                responseObject?.nonModifiedTransactionRefNo;
            transferParams.referenceNumberFull = responseObject?.transactionRefNumber;
            transferParams.referenceNumber = responseObject?.formattedTransactionRefNumber;
            transferParams.transactionDate = transactionDate;
            transferParams.serverDate = responseObject?.serverDate;
            transferParams.transactionStatus = true;
            transferParams.transactionResponseObject = transactionResponseObject;
            transferParams.transactionRefNumberFull = responseObject?.transactionRefNumber;
            transferParams.consentStatus = state.autoDebitStatus === "REJECT" ? "REJECTED" : "";

            // if S2u get Polling Token and Open S2u Model
            if (state.flow === "S2U") {
                // if S2u get Polling Token and Open S2u Model
                updateState({
                    transferParams,
                });
                showS2uModal(responseObject, transferParams);
            } else {
                hideTAC();
                // if TAC Response navigate to Acknowledge Screen
                transferParams.transactionResponseError =
                    responseObject?.additionalStatusDescription;

                const routeParams = {
                    transferParams,
                    transactionReferenceNumber: responseObject?.formattedTransactionRefNumber,
                    errorMessge: "",
                    screenDate: route.params?.screenDate,
                    token: response?.pollingToken,
                };
                callAutoDebitAcceptance(routeParams);
            }
        } else {
            const transactionResponseError =
                responseObject?.additionalStatus ??
                responseObject?.additionalStatusDescription ??
                WE_FACING_SOME_ISSUE;

            transferParams.additionalStatusDescription =
                responseObject?.additionalStatusDescription;
            transferParams.statusDescription =
                responseObject?.statusDescription === "Accepted"
                    ? "successful"
                    : responseObject?.statusDescription;
            transferParams.transactionResponseError = transactionResponseError;
            transferParams.transactionStatus = false;
            transferParams.formattedTransactionRefNumber =
                responseObject?.formattedTransactionRefNumber;
            hideTAC();
            // if Failed navigate to Acknowledge Screen with Failure message
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
                transferParams,
                transactionResponseObject,
                transactionReferenceNumber: responseObject?.transactionRefNumber ?? "",
                screenDate: route.params?.screenDate,
            });
        }
    }

    /***
     * rtpActionApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA.... rtpActionCallApiFailed
     */
    function rtpApiFailed(error, token) {
        hideTAC();
        const { transferParams } = state;
        resetModel(["accounts"]);
        const errors = error;
        const errorsInner = error?.error;
        const isAmountIssue = errorsInner?.message
            ?.toLowerCase()
            ?.includes("exceeds maximum transaction limit");
        transferParams.statusDescription = errorsInner.statusDescription;
        if (errors?.message && !isAmountIssue) {
            showErrorToast({
                message: errors.message,
            });
        }

        if (errors.status === 428) {
            if (token) {
                state.latestParamsCreated = {
                    ...state.latestParamsCreated,
                    smsTac: token,
                    tac: token,
                };
            }

            hideTAC();
            updateState({
                loader: false,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion:
                    errorsInner && errorsInner.challenge && errorsInner.challenge.questionText
                        ? errorsInner.challenge.questionText
                        : WE_FACING_SOME_ISSUE,
                challengeRequest: errorsInner.challenge,
            });
        } else if (errors.status === 423) {
            // Display RSA Account Locked Error Message
            updateState({
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showOverlay: false,
            });

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
            updateState({
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showOverlay: false,
            });

            // Add Completion
            transferParams.transactionStatus = false;
            transferParams.transactionDate = errorsInner.serverDate;
            transferParams.error = error;
            transferParams.transactionResponseError = "";
            hideTAC();
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
                errorMessge:
                    errorsInner && errorsInner.statusDescription
                        ? errorsInner.statusDescription
                        : WE_FACING_SOME_ISSUE,
                transferParams,
                transactionReferenceNumber: "",
                isRsaLock: false,
                screenDate: route.params?.screenDate,
            });
        } else {
            //Handle All other failure cases
            updateState({
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showOverlay: false,
            });

            hideTAC();
            const transferParamsTemp = {
                ...state.transferParams,
                additionalStatusDescription: errorsInner.additionalStatusDescription,
                statusDescription: "unsuccessful",
                transactionResponseError: isAmountIssue
                    ? "Your amount exceeds your set payment limit. Change your payment limit on the Maybank2u website."
                    : errorsInner?.message ?? WE_FACING_SOME_ISSUE,
                showDesc: isAmountIssue,
                transactionStatus: false,
                formattedTransactionRefNumber:
                    errorsInner?.formattedTransactionRefNumber ?? errorsInner?.transactionRefNumber,
                transactionDate: errorsInner?.serverDate ?? "",
                transferFlow: state.transferFlow,
                errorMessage: "",
            };

            // if Failed navigate to Acknowledge Screen with Failure message
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
                transferParams: transferParamsTemp,
                screenDate: route.params?.screenDate,
            });
        }
    }

    function getAutoDebitParams(checkRsa) {
        const { transferParams, soleProp } = route.params;
        const { sourceOfFunds, senderBrn, debtorScndType, debtorScndVal, countryCode } = state;
        const amount = transferParams.amount;
        const transferAmount = amount ? amount.replace(/,/g, "") : "0.00";
        const checkPassport = senderBrn + countryCode;
        return {
            senderAcct: transferParams?.receiverAcct,
            receiverAcct: transferParams?.senderAcct,
            swiftCode: transferParams?.swiftCode,
            senderName: transferParams?.receiverName,
            reference: transferParams.reference,
            sourceOfFunds: transferParams?.sourceOfFunds ?? sourceOfFunds,
            bankName: formateIDName(transferParams.bankName),
            receiverName: transferParams?.senderName,
            amount: transferAmount,
            consentStartDate: transferParams?.consentStartDate
                ? moment(transferParams?.consentStartDate, "YYYY-MM-DD").add(1, "days")
                : transferParams?.consentStartDate,
            consentExpiryDate: transferParams?.consentExpiryDate
                ? moment(transferParams?.consentExpiryDate, "YYYY-MM-DD").add(1, "days")
                : transferParams?.consentExpiryDate,
            consentFrequency: transferParams?.consentFrequency ?? null,
            consentMaxLimit: transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null,
            productId: transferParams?.originalData?.productId,
            merchantId: transferParams?.originalData?.merchantId,
            senderBrn: soleProp
                ? transferParams?.originalData?.debtorIdValue ?? debtorScndVal
                : debtorScndType === "03"
                ? checkPassport
                : senderBrn ??
                  route.params?.senderBrn ??
                  transferParams?.originalData?.senderBrn ??
                  state?.debtorScndVal,
            senderIdType: debtorScndType,
            requestId: transferParams?.requestId,
            rsa: checkRsa ? "Y" : "N",
        };
    }

    async function callAutoDebitAcceptance(routeParams) {
        const { autoDebitStatus } = state;

        const checkRsa =
            routeParams?.transferParams?.onHold || routeParams?.transferParams?.status === "M100";

        if (autoDebitStatus === "APPROVE") {
            const autodebitParams = getAutoDebitParams(checkRsa);
            const params = {
                ...autodebitParams,
                token: routeParams?.token ?? routeParams?.transactionResponseObject?.TokenNum,
            };
            try {
                const response = await autoDebitAcceptance(params);
                const statusDescription = routeParams?.transferParams?.onHold
                    ? "Accepted"
                    : routeParams?.transferParams?.statusDescription === "Accepted"
                    ? "Successful"
                    : response?.statusDescription;
                const responseObj =
                    routeParams?.transferParams?.statusDescription === "Accepted" ||
                    routeParams?.transferParams?.onHold
                        ? {
                              ...response?.data?.result,
                              statusDescription,
                          }
                        : response?.data?.result;
                rtpApiSuccess(responseObj);
            } catch (error) {
                rtpApiFailed(error);
            }
        } else {
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, routeParams);
        }
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    function showS2uModal(response, transferParams) {
        const { formatedFromAccount, selectedAccount } = state;

        const { pollingToken, token } = response;
        const s2uTransactionDetails = [];

        s2uTransactionDetails.push({
            label: transferParams?.refundIndicator ? REFUND_TO : TO,
            value: `${formateIDName(state.transferParams.senderName, " ", 2)}`,
        });
        s2uTransactionDetails.push({
            label: FROM,
            value: `${selectedAccount.name}\n${formatedFromAccount}`,
        });
        s2uTransactionDetails.push({
            label: TRANSACTION_TYPE,
            value: "DuitNow & AutoDebit Requests",
        });
        s2uTransactionDetails.push({
            label: state.transferParams?.refundIndicator ? "Date & time" : "Date",
            value: response.serverDate,
        });
        const s2uPollingToken = pollingToken || token || "";

        //Show S2U Model update the payload
        updateState({
            pollingToken: s2uPollingToken,
            s2uTransactionDetails,
            transferParams: {
                ...state.transferParams,
                onHold: response.onHold,
                statusDescription: response.onHold
                    ? "Accepted"
                    : response?.statusDescription === "Accepted"
                    ? "Successful"
                    : response.statusDescription,
                additionalStatusDescription: response?.additionalStatusDescription,
                transactionResponseError: response?.additionalStatusDescription,
            },
            showS2u: true,
        });
    }

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    function onS2uDone(response) {
        const { transferParams } = state;
        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            // Show success page

            const { statusDescription, text, status } = s2uSignRespone;

            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription || status;
            transferParams.statusCode = s2uSignRespone?.statusCode ?? "";
            transferParams.status = s2uSignRespone?.status;
            transferParams.transactionResponseError = text;
            transferParams.formattedTransactionRefNumber =
                s2uSignRespone.formattedTransactionRefNumber;
            transferParams.consentStatus = state.autoDebitStatus === "REJECT" ? "REJECTED" : "";

            if (transferParams?.statusDescription !== "Accepted") {
                transferParams.transactionResponseError = "";
            }
            const routeParams = {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                screenDate: route.params?.screenDate,
                errorMessge: null,
            };
            callAutoDebitAcceptance(routeParams);
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone;
            const serverError = text || "";
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
                transferParams.errorMessage = "Payment declined";
                transferParams.transferMessage = "Payment declined";
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
            const routeParams = {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId,
                screenDate: route.params?.screenDate,
            };
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, routeParams);
        }
    }

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    function onS2uClose() {
        updateState({ showS2u: false });
    }

    /***
     * hideTAC
     * Close TAc Model
     */
    function hideTAC() {
        const { showTAC } = state;
        if (showTAC) {
            updateState({ showTAC: false, showOverlay: false, loader: false });
        }
    }

    /***
     * _onClosePress
     * On Header Close Button Click Event Listener
     */
    function onClosePress() {
        //If Send or Request Money Flow Navigate to Send Money Dashboard
        navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
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
            pdfType: "shareReceipt",
            title: "Terms & Conditions",
        };

        // Navigate to PDF viewer to display PDF
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });
    }

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    function onBackPress() {
        navigation.goBack();
    }

    function getRTPPaymentParams() {
        const { transferParams } = state;
        const amount = transferParams.amount;
        const transferAmount = transferParams.amount ? amount.replace(/,/g, "") : "0.00";

        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const accNumber = transferParams?.fromAccount.replace(/[^0-9]|[ ]/g, "");

        return {
            recipientName: transferParams?.senderName,
            effectiveDate: transferParams?.effectiveDate,
            fromAccount: accNumber?.substring(0, 12),
            fromAccountCode: transferParams?.fromAccountCode,
            paymentRef: state.paymentRef,
            toAccount: transferParams?.senderAcct,
            toAccountCode: "000000",
            paymentDesc: transferParams?.paymentDesc,
            transferAmount,
            proxyId: transferParams?.idValue.length
                ? transferParams.idValue.replace(/\s/g, "")
                : "",
            proxyIdType: transferParams?.idType ?? null,
            mbbbankCode: transferParams?.mbbbankCode,
            transferType: transferParams?.refundIndicator ? "RTP_REFUND" : "RTP_TRANSFER",
            transferSubType: transferParams?.transferSubType,
            twoFAType: transferParams?.twoFAType,
            interbankPaymentType: "TRANSFER",
            mobileSDKData: mobileSDK, // Required For RSA
            recipientMayaName: "",
            challenge: {},
            specialOccasion: false,
            swiftCode: transferParams?.swiftCode,
            proxyRefNum: transferParams?.requestId,
            payeeName:
                transferParams?.requestType === "REJECTED"
                    ? transferParams?.receiverName
                    : transferParams?.senderName,
            serviceFee: transferParams?.serviceFee ? transferParams.serviceFee : undefined,
            expiryDate: transferParams?.expiryDate ?? undefined,
            requestedAmount: transferParams?.requestedAmount ?? undefined,
            refundIndicator: transferParams?.refundIndicator ?? false,
            mbbaccountType: transferParams?.mbbaccountType ?? "",
            //new params p2b
            consentStartDate: transferParams?.consentStartDate ?? null,
            consentExpiryDate: transferParams?.consentExpiryDate ?? null,
            consentFrequency: transferParams?.consentFrequency ?? null,
            consentMaxLimit: transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null,
            reference: transferParams?.reference,
            bankName: transferParams?.bankName ?? "",
        };
    }

    function getTacParams() {
        const { transferParams } = state;
        const amount = transferParams.amount;
        const fromAccountNo = transferParams?.fromAccount;
        const transferAmount =
            transferParams && transferParams.amount ? amount.replace(/,/g, "") : "0.00";

        return {
            amount: transferAmount,
            fromAcctNo: fromAccountNo,
            fundTransferType: transferParams?.refundIndicator ? "RTP_REFUND" : "RTP_TRANSFER",
            accCode: transferParams?.fromAccountCode,
            toAcctNo: transferParams?.senderAcct,
            payeeName:
                transferParams?.requestType === "REJECTED"
                    ? transferParams?.receiverName
                    : transferParams?.senderName,
            bizMsgId: transferParams?.requestId,
        };
    }

    function showLoader(visible) {
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    }

    function onPopupClosePress() {
        setIsPopupDisplay(false);
        updateState({
            popupTitle: "",
            popupDesc: "",
        });
    }

    function showRejectPopup() {
        updateState({
            popupTitle: "Reject DuitNow AutoDebit",
            popupDesc: `Are you sure you’d like to reject\nthis DuitNow AutoDebit request\nfrom ${route.params?.transferParams?.senderName}?`,
            popupPrimaryAction: {
                text: "Confirm",
                onPress: onConfirmClick,
            },
            popupSecondaryAction: {
                text: "Back",
                onPress: onPopupClosePress,
            },
        });
    }

    function approveAutoDebit(type) {
        setIsPopupDisplay(true);
        updateState({ autoDebitStatus: type });

        if (type === "REJECT") {
            showRejectPopup();
            RTPanalytics.screenLoadRejectPopupDNR();
        } else {
            onConfirmClick();
        }
    }

    // Card number masking
    function onCardMasking(cardNumber) {
        return cardNumber
            .replace(/.(?=.{4})/g, "*")
            .match(/.{1,4}/g)
            .join(" ");
    }

    /***
     * onChallengeQuestionSubmitPress
     * Handle RSA Challenge answered call the particular api again
     */
    function onChallengeQuestionSubmitPress(answer) {
        const { challengeRequest } = state;

        const challengeObj = {
            ...challengeRequest,
            answer,
        };

        updateState({
            challengeRequest: {
                challenge: challengeObj,
            },
            isRSALoader: true,
            RSAError: false,
        });

        const params = {
            ...state.latestParamsCreated,
            challenge: challengeObj,
        };

        state.latestAPiCalled(params);
    }

    /***
     * onChallengeSnackClosePress
     * Handle RSA Challenge close
     */
    function onChallengeSnackClosePress() {
        updateState({ RSAError: false });
    }

    const {
        showErrorModal,
        errorMessage,
        showOverlay,
        transferParams,
        transferFlow,
        secure2uValidateData,
    } = state;

    const auDebitParams = {
        autoDebitEnabled: true,
        showProductInfo: true,
        transferParams,
        transferFlow,
        handleInfoPress: () => {},
        onToggle: () => {},
    };

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={showOverlay}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <>
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={CONFIRMATION}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                                headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
                            />
                        </>
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    useSafeArea
                >
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <React.Fragment>
                            <View style={Styles.parentBlockConfirm}>
                                <View style={Styles.blockConfirm}>
                                    <TransferImageAndDetails
                                        title={transferParams?.senderName}
                                        subtitle={onCardMasking(
                                            `${
                                                transferParams?.coupleIndicator
                                                    ? transferParams?.senderAcct
                                                    : transferParams?.idValue
                                            }`
                                        )}
                                        description={transferParams?.bankName}
                                        image={{
                                            type: "local",
                                            source: Assets.icDuitNowCircle,
                                        }}
                                        isVertical={false}
                                    />

                                    <View style={Styles.mVertical20}>
                                        <View style={Styles.viewRow3}>
                                            <View style={Styles.viewRowLeftItem}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="DuitNow AutoDebit Details"
                                                />
                                            </View>
                                        </View>
                                        <AutoDebitCard {...auDebitParams} />
                                    </View>

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
                                                text={DATE}
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
                                                text="Today"
                                            />
                                        </View>
                                    </View>

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
                                                text={RECIPIENT_REFERENCE}
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
                                                text={transferParams.reference}
                                            />
                                        </View>
                                    </View>

                                    {transferParams?.paymentDesc && (
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
                                                    text={PAYMENT_DETAILS}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItemOption}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    maxLength={20}
                                                    text={transferParams?.paymentDesc}
                                                />
                                            </View>
                                        </View>
                                    )}
                                    <View style={Styles.lineConfirm} />
                                    <View style={Styles.viewRowDescriberItem}>
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
                                                    text={NOTES1}
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
                                                    text={MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT}
                                                />
                                            </View>
                                        </View>

                                        <View style={Styles.viewRowDescriberThree}>
                                            <Typography
                                                fontSize={12}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                color={FADE_GREY}
                                                text={DECLARATION + ":"}
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
                                                text={I_HEREBY_DECLARE_DUIT_NOW}
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
                                                        accessible={true}
                                                        testID="txtExistingUser"
                                                        accessibilityLabel="txtExistingUser"
                                                    >
                                                        {TERMS_CONDITIONS}
                                                    </Text>
                                                </Typography>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={Styles.accList}>
                                <AccountList
                                    title={PAY_RTP_FROM}
                                    data={state.accounts}
                                    onPress={onAccountListClick}
                                    extraData={state}
                                    paddingLeft={24}
                                />
                            </View>
                        </React.Fragment>
                    </ScrollView>

                    <View style={Styles.footerButton2}>
                        <ActionButton
                            disabled={state.loader}
                            fullWidth
                            borderRadius={25}
                            onPress={() => approveAutoDebit("APPROVE")}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typography
                                    color={BLACK}
                                    text={APPROVE_AD}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </View>
                    <View style={Styles.footerButton2}>
                        <ActionButton
                            disabled={state.loader}
                            fullWidth
                            borderRadius={25}
                            onPress={() => approveAutoDebit("REJECT")}
                            backgroundColor={TRANSPARENT}
                            componentCenter={
                                <Typography
                                    color={BLUE}
                                    text={REJECT_AD}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </View>
                </ScreenLayout>
                <ChallengeQuestion
                    loader={state.isRSALoader}
                    display={state.isRSARequired}
                    displyError={state.RSAError}
                    questionText={state.challengeQuestion}
                    onSubmitPress={onChallengeQuestionSubmitPress}
                    onSnackClosePress={onChallengeSnackClosePress}
                />
                {state.showS2u && (
                    <Secure2uAuthenticationModal
                        token={state.pollingToken}
                        amount={state.transferParams.amount}
                        onS2UDone={onS2uDone}
                        onS2UClose={onS2uClose}
                        transactionDetails={state.s2uTransactionDetails}
                        s2uPollingData={secure2uValidateData}
                    />
                )}

                {state.showTAC && (
                    <TacModal
                        transferApi={fundTransferApi}
                        transferAPIParams={state.apiTransferParams}
                        tacParams={state.tacParams}
                        validateByOwnAPI={false}
                        onTacClose={hideTAC}
                        onTacSuccess={onTacSuccess}
                        onTacError={rtpApiFailed}
                    />
                )}
                <Popup
                    visible={isPopupDisplay}
                    onClose={onPopupClosePress}
                    title={state.popupTitle}
                    description={state.popupDesc}
                    primaryAction={state.popupPrimaryAction}
                    secondaryAction={state.popupSecondaryAction}
                />
            </ScreenContainer>
        </React.Fragment>
    );
}

AutoDebitConfirmation.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default withModelContext(AutoDebitConfirmation);

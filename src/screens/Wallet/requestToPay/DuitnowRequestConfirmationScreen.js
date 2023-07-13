import { useFocusEffect } from "@react-navigation/native";
import { isEmpty, isNull } from "lodash";
import moment from "moment";
import { Numeral } from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import RadioButton from "@components/Buttons/RadioButton";
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
import AccountList from "@components/Transfers/TransferConfirmationAccountList";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext, useModelController } from "@context";

import { fundTransferApi, rtpActionApi, nonMonetoryValidate } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    MEDIUM_GREY,
    ROYAL_BLUE,
    BLUE,
    FADE_GREY,
} from "@constants/colors";
import {
    frequencyList,
    paymentMethodsList,
    termsAndConditionUrl,
    mapProxy,
} from "@constants/data/DuitNowRPP";
import {
    SECURE2U_IS_DOWN,
    AMOUNT_ERROR,
    ENTER_AMOUNT,
    CURRENCY,
    TRANSACTION_TYPE,
    WE_FACING_SOME_ISSUE,
    CONFIRMATION,
    OPTIONAL1,
    RECIPIENT_REFERENCE,
    PAYMENT_DETAILS,
    DECLARATION,
    I_HEREBY_DECLARE_DUIT_NOW,
    TERMS_CONDITIONS,
    SEND_NOW,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
    PAY_FROM,
    PLEASE_SELECT_FROM_ACCOUNT,
    REQUEST_TO_PAY,
    SERVICE_FEES,
    REQUEST_EXPIRY_DATE,
    REQUESTED_AMOUNT_ERROR,
    PAY_TO,
    FREQUENCY,
    PLEASE_REMOVE_INVALID_EMAIL,
    RTP_AUTODEBIT,
    DUITNOW_REQUEST,
    AMOUNT_ERROR_RTP,
    SETTINGS_VALID_EMAIL,
    SERVICE_FEE_CONFIRM,
    FREQUENCY_DETAILS,
    LIMIT_DETAILS,
    REFUND_FROM,
    RECIPIENT_AMOUNT_EDITABLE,
    SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST,
    VALID_AMOUNT_ERROR,
    SELECT_PAY_FROM_ACCOUNT,
    FREQUENCY_TRN,
    REQUEST_UNSUCCESSFUL,
    MAX_LIMIT_ERROR,
    DUITNOW_REQUEST_ACKNOWLEDGE_FAILURE,
    AUTHORISATION_FAILED_TITLE,
    PURCHASE_LIMIT_REJECTED_DESC,
    PAYMENT_DECLINED,
    DUITNOW_AUTODEBIT_CARD_TITLE,
    CONTINUE,
    CANCEL,
    DONE,
    PAYMENT_METHOD_PLACEHOLDER,
    NOTIFY_VIA_EMAIL,
    SERVICE_FEE_PLACEHOLDER,
    S2U_REGISTER_ERROR,
    PAYMENT_LIMIT_ERROR,
    LIMIT_PER_TRN,
    REQUEST_COULD_NOT_BE_PROCESSED,
} from "@constants/strings";

import { paymentDetailsRegex, getFormatedDateMoments, validateEmail } from "@utils/dataModel";
import {
    formateAccountNumber,
    getDeviceRSAInformation,
    formateIDName,
    checks2UFlow,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";

export const { width, height } = Dimensions.get("window");

const DuitnowRequestConfirmationScreen = (props) => {
    const [transferFlow, setTransferFlow] = useState(1);
    const [accounts, setAccounts] = useState([]);
    const [loader, setLoader] = useState(false);
    const [duitNowRecurring, setDuitNowRecurring] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [fromAccount, setFromAccount] = useState("");
    const [fromAccountCode, setFromAccountCode] = useState("");
    const [fromAccountName, setFromAccountName] = useState("");
    const [formatedFromAccount, setFormatedFromAccount] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("00000000");
    const [paymentRef, setPaymentRef] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expiryDate, setExpiryDate] = useState(
        moment(new Date()).add(props?.route?.params?.soleProp ? 14 : 7, "day")
    );
    const [expiryDateFormatted, setExpiryDateFormatted] = useState(
        getFormatedDateMoments(moment(new Date()).add(14, "day"), "D MMM YYYY")
    );
    const [formatedStartDate, setFormatedStartDate] = useState("");
    const [formatedEndDate, setFormatedEndDate] = useState("");
    const [endDateInt, setEndDateInt] = useState(0);
    const [startDateInt, setStartDateInt] = useState(0);

    // S2u/TAC related
    const [secure2uValidateData, setSecure2uValidateData] = useState({});
    const [flow, setFlow] = useState("");
    const [showS2u, setShowS2u] = useState(false);
    const [pollingToken, setPollingToken] = useState("");
    const [s2uTransactionDetails, setS2uTransactionDetails] = useState([]);

    // TacModal
    const [apiTransferParams, setApiTransferParams] = useState({});
    const [showTAC, setShowTAC] = useState(false);
    const [tacParams, setTacParams] = useState(null);

    // scroll picker 2
    const [showAccountScrollPickerView, setShowAccountScrollPickerView] = useState(false);
    const [showEditable, setShowEditable] = useState(false);

    const [editableDropDown] = useState([
        { code: "yes", name: "Yes" },
        { code: "no", name: "No" },
    ]);
    const [selectedEditable, setSelectedEditable] = useState({ code: "yes", name: "Yes" });
    const [accountDropDown, setAccountDropDown] = useState([]);

    // enable auto debit
    const [autoDebitEnabled, setAutoDebitEnabled] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState(paymentMethodsList);
    const [notifyEmail, setNotifyEmail] = useState("");
    const [isPopupDisplay, setIsPopupDisplay] = useState(false);
    const [popupTitle, setPopupTitle] = useState(false);
    const [popupDesc, setPopupDesc] = useState("");
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [nonTxnData] = useState({ isNonTxn: true });
    const [rtpFormattedRefNumber, setRtpFormattedRefNumber] = useState(null);
    const [isFutureTransfer, setIsFutureTransfer] = useState(false);
    const [paymentDesc, setPaymentDesc] = useState("");
    const [selectedAccountItem, setSelectedAccountItem] = useState({});
    const [rtpActionData, setRtpActionData] = useState(null);
    const paramsRef = useRef();
    const [rsaObject, setRSAObject] = useState({
        showRSA: false,
        errorObj: null,
        postCallback: makeAPICall,
        navigation: props.navigation,
    });
    const [lastAPIDetails, setLastAPIDetails] = useState({
        lastTacValidateParams: null,
        params: null,
        apiCalled: null,
    });
    const { getModel, updateModel } = useModelController();

    //metadata
    const [txnId, setTxnId] = useState("");

    useFocusEffect(
        useCallback(() => {
            setLoader(false);
            setShowOverlay(false);
            setDisableBtn(false);
        }, [])
    );

    useEffect(() => {
        setShowOverlay(false);
        setDisableBtn(false);
        getAllAccounts();
        _updateDataInScreenAlways();
        if (props?.route?.params?.transferParams?.isEditReference) {
            _updateDataInScreenAlways();
        }
    }, []);

    useEffect(() => {
        if (props.route.params.isFromS2uReg) {
            setLoader(false);
            setShowOverlay(false);
            setDisableBtn(false);
            setFlow(props.route.params?.isFromS2uReg ? "S2U" : flow);
        }
    }, [props.route.params.isFromS2uReg]);

    useEffect(() => {
        if (props?.route?.params?.transferParams?.isEditReference) {
            _updateDataInScreenAlways();
        }
    }, [
        props?.route?.params?.transferParams?.isEditReference,
        props?.route?.params?.transferParams?.reference,
    ]);

    useEffect(() => {
        commonToast();
    }, [paymentRef, autoDebitEnabled, transferParams]);

    function makeAPICall(params) {
        setRSAObject({
            ...rsaObject,
            showRSA: false,
            errorObj: null,
        });
        if (!lastAPIDetails.apiCalled) {
            duitNowRtp(params);
        } else {
            lastAPIDetails.apiCalled(params);
        }
    }

    /**
     *_updateDataInScreenAlways
     */
    async function _updateDataInScreenAlways() {
        const { params } = props.route;
        // get transferParams for screen data
        let tParams = { ...params?.transferParams };
        const { flow, secure2uValidateData } = await checks2UFlow(74, props.getModel);
        const formatedStartDate = tParams?.formatedStartDate ?? "";
        const formatedEndDate = tParams?.formatedEndDate ?? "";
        const startDateInt = tParams?.startDateInt ?? "00000000";
        const endDateInt = tParams?.endDateInt ?? "00000000";
        const effectiveDate = tParams?.effectiveDate ?? "00000000";
        const isFutureTransfer = tParams?.isFutureTransfer ?? false;
        const duitNowRecurring = tParams?.duitNowRecurring ?? false;
        const selectedAcc = tParams?.selectedAccount ?? selectedAccount;

        const stateData = props?.route?.params;

        const s2uEnabled = secure2uValidateData.s2u_enabled;

        // Show S2U Down or Register Failed role back to TAC Toast
        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth === "fail") {
                    showErrorToast({
                        message: S2U_REGISTER_ERROR,
                    });
                }
                break;
            case "TAC":
                if (!s2uEnabled) {
                    setTimeout(() => {
                        showInfoToast({
                            message: SECURE2U_IS_DOWN,
                        });
                    }, 1);
                }
                break;
            default:
                break;
        }
        tParams.productId = params?.productId ?? tParams?.productId;
        tParams.merchantId = params?.merchantId ?? tParams?.merchantId;
        tParams.senderBrn = params?.senderBrn ?? tParams?.senderBrn;
        // update source of funds from fpx
        const sourceFunds = params?.sourceFunds?.split(/(..)/g).filter((s) => s);
        let paymentMethodList = [];
        if (!isEmpty(sourceFunds)) {
            paymentMethodList = [...paymentMethods]?.filter((el) => sourceFunds.includes(el?.key));
        }
        if (params?.isAmountHigher || parseFloat(tParams.amount) > 5000.0) {
            tParams.serviceFee = 0.5;
        }
        const isAutoDebitEnabled = params?.isAutoDebitEnabled === true;
        if (!tParams?.productId && params?.productId) {
            tParams.productId = params?.productId ?? tParams?.productId;
            tParams.merchantId = params?.merchantId ?? tParams?.merchantId;
        }
        tParams.timeInSecs = new Date().getTime();
        if (isAutoDebitEnabled) {
            tParams = { ...tParams, ...params?.autoDebitParams };
            setAutoDebitEnabled(isAutoDebitEnabled);
        }

        // update Transfer Params data to state
        setFormatedStartDate(formatedStartDate);
        setFormatedEndDate(formatedEndDate);
        setStartDateInt(startDateInt);
        setEndDateInt(endDateInt);
        setEffectiveDate(effectiveDate);
        setDuitNowRecurring(duitNowRecurring);
        setIsFutureTransfer(isFutureTransfer);
        if (tParams?.transferFlow !== 25) {
            setSelectedAccount(selectedAcc);
        }
        setLoader(false);
        setShowOverlay(false);
        setTransferFlow(tParams?.transferFlow);
        setErrorMessage(AMOUNT_ERROR);
        setFlow(stateData?.flow);
        setPaymentRef(tParams?.reference);
        setPaymentDesc(tParams?.paymentDesc);
        setNotifyEmail(tParams?.notifyEmail);
        setSecure2uValidateData(secure2uValidateData);
        setFlow(flow);
        setPaymentMethods(paymentMethodList);
        setTransferParams(tParams);
    }

    useEffect(() => {
        commonToast();
    }, [transferParams?.notifyEmail]);

    function commonToast() {
        const { params } = props.route;
        const tParams = { ...params?.transferParams };

        if (params?.isAmountHigher || parseFloat(tParams?.amount) > 5000.0) {
            setTimeout(() => {
                showInfoToast({
                    message: params?.errorMessage ?? SERVICE_FEE_CONFIRM,
                });
            }, 1000);
        }
    }

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    async function getAllAccounts() {
        const { primaryAccount } = getModel("wallet");
        const userAccountsContext = getModel("userAccounts");
        const { merchantInquiry } = getModel("rpp");
        const { cus_type } = getModel("user");

        if (!isEmpty(primaryAccount?.number) && cus_type !== "02") {
            _setSelectFromAccount(userAccountsContext?.accountListings, primaryAccount?.number);
            updateModel({ userAccounts: { accountListings: [primaryAccount] } });
        } else if (userAccountsContext?.apiCalled) {
            let primaryAcct;
            //if userAccountsContext in context initiate api call
            if (cus_type === "02") {
                // soleprop
                primaryAcct = userAccountsContext?.accountListings.filter((acc) => {
                    return acc?.number.substring(0, 12) === merchantInquiry?.accNo;
                });
            } else {
                // individual
                primaryAcct = userAccountsContext?.accountListings.filter((acc) => {
                    return acc?.primary;
                });
            }
            _setSelectFromAccount(userAccountsContext?.accountListings, primaryAcct[0]?.number);
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
    function _setSelectFromAccount(newAccountList, primaryAccountData) {
        const accountDropDown = [];
        const targetSelectedAccounts = [];
        const nonSelectedAccounts = [];
        const fromAccountTempSelected = transferParams?.fromAccount ?? primaryAccountData;
        const tempArray = newAccountList.slice();
        const accountsArray = tempArray.map((accountItem, index) => {
            //Compare from Account with account number and marked as selected
            if (
                fromAccountTempSelected?.substring(0, 12) !== accountItem?.number?.substring(0, 12)
            ) {
                nonSelectedAccounts.push(accountItem);
            }

            const accUpdated = {
                ...accountItem,
                selectionIndex: index,
                isSelected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                selected: !!(
                    fromAccountTempSelected?.substring(0, 12) ===
                        accountItem?.number?.substring(0, 12) && !transferParams?.isOnlineBanking
                ),
                description: accountItem?.number,
                type: accountItem?.type,
            };

            accountDropDown.push({
                ...accUpdated,
                formatedAccount: formateAccountNumber(accountItem?.number, 12),
                name: `${accountItem?.name} \n ${formateAccountNumber(accountItem?.number, 12)} \n`,
                accountName: accountItem?.name,
            });
            return accUpdated;
        });

        let selectedAcc = accountsArray.filter((selectedAcc) => {
            return selectedAcc.isSelected === true;
        });
        if (!selectedAcc && accountsArray?.length > 0) {
            selectedAcc = accountsArray;
        }
        if (selectedAcc?.length === 1) targetSelectedAccounts.push(selectedAcc[0]);
        const selectedAccountObj = !targetSelectedAccounts?.length
            ? nonSelectedAccounts[0]
            : selectedAcc[0];
        const { fromAccount, formatedFromAccount, fromAccountCode, fromAccountName } =
            getAdditionalTransferParams(selectedAccountObj);

        const updatedTransferParams = {};
        //if no account match set first account as selected Account
        if (nonSelectedAccounts?.length >= 1 && !targetSelectedAccounts?.length) {
            selectedAccountObj.selected = true;
            nonSelectedAccounts[0] = selectedAccountObj;
            updatedTransferParams.fromAccount = fromAccount;
            updatedTransferParams.formattedFromAccount = formatedFromAccount;
            updatedTransferParams.fromAccountCode = fromAccountCode;
            updatedTransferParams.fromAccountName = fromAccountName;
        }
        //push non selected list to display account list
        targetSelectedAccounts.push(...nonSelectedAccounts);

        if (targetSelectedAccounts.length < 1) {
            targetSelectedAccounts.push(...newAccountList);
        }

        //Update this transfer params and selected Accounts to state
        setDisableBtn(transferParams?.isOnlineBanking);
        setFromAccount(fromAccount);
        setFromAccountCode(fromAccountCode);
        setFromAccountName(fromAccountName);
        setFormatedFromAccount(formatedFromAccount);
        setAccounts(targetSelectedAccounts);
        setSelectedAccount(selectedAccountObj);
        setAccountDropDown(accountDropDown);
        setSelectedAccountItem(selectedAccountObj);
    }

    /**
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    function _onAccountListClick(item) {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const selectedAcc = item;
        let isValid = disableBtn;
        if (!(parseFloat(item.acctBalance) <= 0.0 && itemType === "account")) {
            const tempArray = accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                    isValid = false;
                } else {
                    tempArray[i].selected = false;
                }
                tempArray[i].isSelected = tempArray[i].selected;
            }
            setDisableBtn(transferParams?.isOnlineBanking ? isValid : disableBtn);
            setFromAccount(item.number);
            setFromAccountCode(item.code);
            setFromAccountName(item.name);
            setFormatedFromAccount(formateAccountNumber(item.number, 12));
            setAccounts(tempArray);
            setSelectedAccount(selectedAcc);
        }
    }

    /***
     * _onPaymentOptionTextChange
     * Notes / Payment option text change listener
     */
    function _onPaymentOptionTextChange(text) {
        const disableBtn = !!(text?.length > 0 && text?.length < 3);
        setPaymentDesc(text ?? null);
        setDisableBtn(disableBtn);
    }

    function _onEmailOptionTextChange(text) {
        setNotifyEmail(text);
    }

    function _onRecipientReferenceClick() {
        const _transferParams = transferParams;
        _transferParams.selectedAccountItem = selectedAccountItem;
        _transferParams.paymentDesc = paymentDesc;
        _transferParams.notifyEmail = notifyEmail;
        _transferParams.isEditReference = true;
        setTransferParams(_transferParams);

        props.navigation.push(navigationConstant.DUITNOW_DECOUPLED_REQUEST_SCREEN, {
            ...props.route.params,
            transferParams: _transferParams,
        });
    }

    /***
     * _onEditAmount
     * On Click listener to open Amount edit screen
     */
    function _onEditAmount() {
        const _transferParams = transferParams;
        _transferParams.imageBase64 = true;
        _transferParams.minAmount = 0.01;
        _transferParams.maxAmount = 50000.0;
        _transferParams.screenTitle = REQUEST_TO_PAY;
        _transferParams.screenLabel = ENTER_AMOUNT;
        _transferParams.amountError = VALID_AMOUNT_ERROR;
        _transferParams.maxAmountError = transferParams.amountEditable
            ? REQUESTED_AMOUNT_ERROR
            : AMOUNT_ERROR_RTP;
        _transferParams.amountLength = 8;
        const screenData = {
            formattedToAccount: transferParams.idValueFormatted,
            accountName: transferParams.accHolderName,
            bankName: transferParams.bankName,
        };
        props?.navigation?.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.AMOUNT_TOGGLE_SCREEN,
            params: {
                isRTPAmount: true,
                transferParams: { ..._transferParams, ...screenData },
                screenData,
                isEdit: true,
            },
        });
    }

    /**
     *_onConfirmClick
     * @memberof RequestToPayConfirmationScreen
     *
     * transferFlow === 25 --> Request To Pay (RTP)
     */
    async function _onConfirmClick() {
        try {
            const updatedTransferParam = { ...transferParams };
            let sourceOfFunds = "";
            if (!isEmpty(paymentMethods)) {
                paymentMethods?.forEach((el) => {
                    if (el?.isSelected) {
                        sourceOfFunds += el.key;
                    }
                });
            }
            if (autoDebitEnabled) {
                const sslObj = {
                    autodebit: autoDebitEnabled,
                    frequency: transferParams?.consentFrequencyText ?? null,
                    limit_transaction: transferParams?.consentMaxLimitFormatted,
                    cancellation: true,
                };
                RTPanalytics.screenLoadADformProceed(sslObj);
            }
            if ((isNull(selectedAccount) || !selectedAccount) && !transferParams?.isSendAgain) {
                showInfoToast({ message: SELECT_PAY_FROM_ACCOUNT });
                return false;
            }

            if (transferFlow === 25 || transferParams?.isSendAgain) {
                const swiftCode = props?.route?.params?.transferParams?.swiftCode ?? "";
                const validateNotes =
                    paymentDesc?.length > 0 && paymentDesc?.length < 3
                        ? paymentDetailsRegex(paymentDesc)
                        : true;
                const isEmailValid = notifyEmail?.length > 0 ? validateEmail(notifyEmail) : true;
                if (!isEmailValid) {
                    showErrorToast({
                        message: SETTINGS_VALID_EMAIL,
                    });
                }
                if (validateNotes && isEmailValid) {
                    setShowOverlay(true);
                    setLoader(true);

                    const deviceInfo = props?.getModel("device");
                    const mobileSDK = getDeviceRSAInformation(
                        deviceInfo.deviceInformation,
                        DeviceInfo
                    );
                    updatedTransferParam.transactionStartDate = formatedStartDate;
                    updatedTransferParam.transactionEndDate = formatedEndDate;
                    updatedTransferParam.isRecurringTransfer = duitNowRecurring;
                    updatedTransferParam.isFutureTransfer = isFutureTransfer;
                    updatedTransferParam.fromAccount = fromAccount;
                    updatedTransferParam.formattedFromAccount = formatedFromAccount;
                    updatedTransferParam.fromAccountCode = fromAccountCode;
                    updatedTransferParam.fromAccountName = fromAccountName;
                    updatedTransferParam.effectiveDate = effectiveDate;
                    updatedTransferParam.deviceInfo = deviceInfo;
                    updatedTransferParam.mobileSDK = mobileSDK;
                    updatedTransferParam.paymentDesc = paymentDesc;
                    updatedTransferParam.startDateInt = startDateInt;
                    updatedTransferParam.endDateInt = endDateInt;
                    updatedTransferParam.transferType = null;
                    updatedTransferParam.transferSubType = null;
                    updatedTransferParam.swiftCode = swiftCode;

                    //new params p2b
                    updatedTransferParam.amountEditable = selectedEditable?.code === "editable";
                    updatedTransferParam.expiryDateTime = expiryDate;
                    updatedTransferParam.sourceOfFunds = sourceOfFunds;
                    updatedTransferParam.senderName =
                        updatedTransferParam.payerName ?? transferParams.senderName;
                    const accountNumber = transferParams?.toAccount;
                    const receiverAcctData = transferParams?.receiverAcct;
                    const toAccountData = transferParams?.formattedToAccount;
                    const formattedReceiverAccount = (
                        accountNumber ??
                        receiverAcctData ??
                        toAccountData ??
                        ""
                    ).replace(/[^0-9]|[ ]/g, "");
                    updatedTransferParam.receiverAcct = formattedReceiverAccount;
                    updatedTransferParam.toAccount = formattedReceiverAccount;
                    setTransferParams((prevState) => ({ ...prevState, ...updatedTransferParam }));
                    _rtpActionApi(updatedTransferParam, flow);
                } else {
                    showInfoToast({
                        message: !isEmailValid
                            ? PLEASE_REMOVE_INVALID_EMAIL
                            : PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
                    });
                }
            } else {
                showInfoToast({
                    message: PLEASE_SELECT_FROM_ACCOUNT,
                });
            }
        } catch (ex) {
            showInfoToast({
                message: ex?.message || REQUEST_COULD_NOT_BE_PROCESSED,
            });
            setShowOverlay(false);
            setLoader(false);
        }
    }

    /***
     * _rtpActionApi
     * Build Transaction params for TAC and S2U flow and Call transfer Api
     * And Show TAC or S2U Model
     */
    //
    function _rtpActionApi(transferParamsData, flow) {
        const { transferFlow } = transferParamsData;
        const apiTransferParams = getRTPRequestParams();

        if (transferFlow === 25) {
            setLastAPIDetails({ params: apiTransferParams, apiCalled: rtpCallRequest });
            setRtpActionData(null);
            rtpCallRequest(apiTransferParams);
        } else if (transferFlow === 26) {
            //if Flow is S2u call api to get polling token
            if (transferParamsData?.coupleIndicator) {
                const freqObj = frequencyList.find(
                    (el) => el.code === transferParamsData?.consentFrequency
                );
                transferParamsData.consentStartDate = moment(
                    transferParamsData?.consentStartDate
                ).format("DD MMM YYYY");
                transferParamsData.consentExpiryDate = moment(
                    transferParamsData?.consentExpiryDate
                ).format("DD MMM YYYY");
                transferParamsData.consentFrequency = freqObj?.name ?? "";
                transferParamsData.consentMaxLimit = Numeral(
                    transferParamsData?.consentMaxLimit
                ).format("0,0.00");
            }

            if (flow === "TAC") {
                //if Flow is TAC open TAC model
                setShowTAC(true);
                setApiTransferParams(apiTransferParams);
            } else {
                setLastAPIDetails({ params: apiTransferParams, apiCalled: rtpCallPayment });

                rtpCallPayment(apiTransferParams);
            }
        }
    }

    async function rtpCallRequest(params) {
        const { flow } = await checks2UFlow(74, props.getModel);
        if (flow === "S2UReg") {
            props?.navigation?.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen: navigationConstant.DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                        },
                        fail: {
                            stack: navigationConstant.REQUEST_TO_PAY_STACK,
                            screen: navigationConstant.DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                        },

                        params: {
                            ...props?.route?.params,
                            secure2uValidateData,
                            flow,
                            isFromS2uReg: true,
                        },
                    },
                },
            });
        } else if (flow === "S2U") {
            try {
                const s2uObj = flow === "S2U" ? { twoFAType: "SECURE2U_PULL" } : {};
                const modParams = { ...s2uObj, ...params };
                const response = await rtpActionApi(modParams);

                setTxnId(response?.data?.result?.transactionRefNumber);
                setShowOverlay(true);
                if (response?.data?.result?.pollingToken) {
                    setPollingToken(response?.data?.result?.pollingToken);
                    setRtpFormattedRefNumber(response?.data?.result?.transactionRefNumber);
                    setRtpActionData(response?.data);
                } else {
                    setRtpFormattedRefNumber(response?.data?.result?.transactionRefNumber);
                    rtpApiFailed(response);
                }
            } catch (error) {
                rtpApiFailed(error);
            }
        } else {
            const amount = transferParams.amount;
            const transferAmount = transferParams?.amount ? amount.replace(/,/g, "") : "0.00";
            const _params = {
                fundTransferType: "RTP_REQUEST_REQ",
                payeeName: transferParams?.isSendAgain
                    ? transferParams?.receiverName
                    : params?.senderName,
                toAcctNo: transferParams?.isSendAgain
                    ? transferParams?.receiverProxyValue
                    : params?.receiverAcct?.length === 12
                    ? params?.receiverAcct
                    : params?.receiverAcct?.substring(0, 12),
                amount: transferAmount,
            };
            setTacParams(_params);
            setApiTransferParams(params);
        }
    }

    useEffect(() => {
        if (tacParams && apiTransferParams) {
            setShowTAC(true);
        }
    }, [tacParams, apiTransferParams]);

    useEffect(() => {
        if (rtpActionData) {
            showS2uModal({
                response: rtpActionData,
                tParams: {
                    ...props?.route?.params?.transferParams,
                    ...transferParams,
                },
            });
        }
    }, [rtpActionData]);

    /***
     * rtpCallPayment
     * Pay for Request Money Flow Api call
     */
    async function rtpCallPayment(params) {
        try {
            const response = await fundTransferApi(params);
            // if S2u get Polling Token and Open S2u Model
            if (flow === "S2U") {
                showS2uModal({
                    response: response?.data,
                    tParams: {
                        ...props?.route?.params?.transferParams,
                        ...transferParams,
                    },
                });
            } else {
                rtpApiSuccess(response?.data);
            }
        } catch (error) {
            rtpApiFailed(error);
        }
    }

    function error200Handler(response) {
        const responseObject = response?.result ?? response;

        const _transferParams = {
            ...transferParams,
            additionalStatusDescription: responseObject?.additionalStatusDescription,
            statusDescription: "unsuccessful",
            transactionResponseError: transferParams?.refundIndicator
                ? REQUEST_UNSUCCESSFUL
                : responseObject?.statusDescription ?? WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber: responseObject?.formattedTransactionRefNumber,
            transactionDate: response?.serverDate ?? "",
            transferFlow,
        };

        hideTAC();
        // if Failed navigate to Acknowledge Screen with Failure message
        props?.navigation?.navigate(
            navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN,
            {
                transferParams: _transferParams,
                screenDate: props?.route?.params?.screenDate,
            }
        );
    }

    /***
     * rtpActionApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA.... rtpActionCallApiFailed
     */
    const rtpApiFailed = (error, token) => {
        hideTAC();

        const { resetModel } = props;
        resetModel(["accounts"]);
        const errors = error;
        const errorsInner = error?.error;
        const isAmountIssue = errorsInner?.message?.toLowerCase()?.includes(MAX_LIMIT_ERROR);
        const tParams = { ...transferParams };
        tParams.statusDescription = errorsInner?.statusDescription ?? "";

        if (errors?.message && !isAmountIssue) {
            showErrorToast({
                message: errors.message,
            });
        }
        if ([428, 423, 422].includes(errors.status)) {
            const tparams = getRTPRequestParams();
            setRSAObject({
                ...rsaObject,
                showRSA: true,
                errorObj: error,
                payload: tparams,
                acknowledgeParams: transferParams,
            });
        } else {
            //Handle All other failure cases
            setLoader(false);
            setShowOverlay(false);
            hideTAC();
            const transferParamsTemp = {
                ...transferParams,
                additionalStatusDescription: errorsInner?.additionalStatusDescription,
                statusDescription: "unsuccessful",
                transactionResponseError: isAmountIssue
                    ? PAYMENT_LIMIT_ERROR
                    : errorsInner?.message ?? WE_FACING_SOME_ISSUE,
                showDesc: isAmountIssue,
                transactionStatus: false,
                formattedTransactionRefNumber:
                    errorsInner?.formattedTransactionRefNumber ?? errorsInner?.transactionRefNumber,
                transactionDate: errorsInner?.serverDate ?? "",
                transferFlow,
                errorMessage: "",
            };

            // if Failed navigate to Acknowledge Screen with Failure message
            props?.navigation?.navigate(
                navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN,
                {
                    transferParams: transferParamsTemp,
                    screenDate: props?.route?.params?.screenDate,
                }
            );
        }
    };

    /***
     * rtpActionCallApiSuccess
     * Handle Transfer Success Flow
     */
    function rtpApiSuccess(response) {
        const { resetModel } = props;
        resetModel(["accounts"]);
        setLoader(false);
        setShowOverlay(false);

        if (response.statusCode === "000" || response.statusCode === "0") {
            const transactionDate = response && response.serverDate ? response.serverDate : null;
            const _transferParams = { ...transferParams };
            _transferParams.additionalStatusDescription = response.additionalStatusDescription;
            _transferParams.statusDescription = response.statusDescription;
            _transferParams.transactionRefNo = response?.transactionRefNumber ?? response?.msgId;
            _transferParams.transactionRefNumber = response?.formattedTransactionRefNumber;
            _transferParams.formattedTransactionRefNumber =
                response.formattedTransactionRefNumber ?? response?.msgId;
            _transferParams.nonModifiedTransactionRefNo =
                response.transactionRefNumber ?? response?.msgId;
            _transferParams.referenceNumberFull = response?.transactionRefNumber ?? response?.msgId;
            _transferParams.referenceNumber =
                response?.formattedTransactionRefNumber ?? response?.msgId;
            _transferParams.transactionDate = transactionDate;
            _transferParams.serverDate = response.serverDate;
            _transferParams.transactionresponse = response;
            _transferParams.transactionRefNumberFull =
                response?.transactionRefNumber ?? response?.msgId;
            _transferParams.transactionStatus = true;
            _transferParams.transactionType = SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST;

            //  Response navigate to Acknowledge Screen
            const screenName = navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN;
            let params = {};
            if (_transferParams?.isOnlineBanking) {
                params = {
                    isFromAcknowledge: false,
                    isCancelled: true,
                };
            }

            props?.navigation?.navigate(screenName, {
                transferParams: { ..._transferParams, ...params },
                transactionReferenceNumber: response.formattedTransactionRefNumber,
                errorMessge: "",
                screenDate: props?.route?.params?.screenDate,
            });
        } else {
            error200Handler(response);
        }
    }

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    function showS2uModal({ response, tParams }) {
        const s2uTransactionDetails = [];

        s2uTransactionDetails.push({
            label: PAY_TO,
            value: `${selectedAccount?.name}\n${formatedFromAccount}`,
        });
        s2uTransactionDetails.push({
            label: PAY_FROM,
            value: tParams?.debtorName ?? transferParams?.debtorName,
        });
        s2uTransactionDetails.push({
            label: TRANSACTION_TYPE,
            value: SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST,
        });

        s2uTransactionDetails.push({
            label: "Date & time",
            value: moment(new Date()).format("D MMM YYYY, h:mm A"),
        });

        //Show S2U Model update the payload
        setS2uTransactionDetails(s2uTransactionDetails);
        setShowS2u(true);
    }

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    function onS2uDone(response) {
        const { transactionStatus, s2uSignRespone } = response;
        // Close S2u popup
        onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            // Show success page
            const { statusDescription, text, status } = s2uSignRespone;
            const _transferParams = { ...transferParams };
            _transferParams.transactionStatus = true;
            _transferParams.statusDescription = statusDescription || status;
            _transferParams.transactionResponseError = text;
            _transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.formattedTransactionRefNumber;
            _transferParams.transactionType = SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST;
            if (_transferParams?.statusDescription !== "Accepted") {
                _transferParams.transactionResponseError = "";
            }
            _transferParams.consentStartDate = _transferParams?.consentStartDate ?? null;
            _transferParams.consentExpiryDate =
                _transferParams?.consentExpiryDate ?? expiryDate ?? null;
            _transferParams.requestExpiryDate = expiryDate ?? null;
            _transferParams.consentFrequency = _transferParams?.consentFrequency ?? null;
            _transferParams.consentMaxLimit =
                _transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null;

            _transferParams.requestId = s2uSignRespone?.payload?.WUPointEarned ?? null;
            const screenName = navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN;
            props?.navigation?.navigate(screenName, {
                transferParams: _transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                screenDate: props?.route?.params?.screenDate,
                errorMessge: null,
            });
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone;
            const serverError = text || "";
            const _transferParams = { ...transferParams };
            _transferParams.transactionStatus = false;
            _transferParams.transactionResponseError = serverError;
            _transferParams.statusDescription = statusDescription;
            _transferParams.errorMessage = DUITNOW_REQUEST_ACKNOWLEDGE_FAILURE;
            _transferParams.status = status;

            const transactionId =
                status === "M408"
                    ? rtpFormattedRefNumber
                    : _transferParams?.formattedTransactionRefNumber ?? "";
            _transferParams.formattedTransactionRefNumber =
                (s2uSignRespone?.transactionReferenceNumber || transactionId) ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                _transferParams.transactionResponseError = "";
                _transferParams.errorMessage = AUTHORISATION_FAILED_TITLE;
                _transferParams.subMessage = PURCHASE_LIMIT_REJECTED_DESC;
                _transferParams.transferMessage = PAYMENT_DECLINED;
                _transferParams.transactionType = SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST;
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                _transferParams.transactionResponseError = "";
                _transferParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text,
                });
            }
            props?.navigation?.navigate(
                navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN,
                {
                    transferParams: _transferParams,
                    transactionResponseObject: s2uSignRespone.payload,
                    transactionReferenceNumber: transactionId,
                    screenDate: props?.route?.params?.screenDate,
                    expiryDate,
                }
            );
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
            setShowOverlay(false);
            setLoader(false);
        }
    }

    function _onRightButtonPressEditable(value, index) {
        setShowEditable(false);
        setSelectedEditable(value);
    }

    function _onLeftButtonPressEditable() {
        setShowEditable(false);
    }

    /***
     * _onRightButtonPressAccount
     * Close Account Dropdown
     */
    function _onRightButtonPressAccount(value, index) {
        setShowAccountScrollPickerView(false);
        setSelectedAccount(value);
        setFromAccount(value.number);
        setFromAccountCode(value.code);
        setFromAccountName(value.accountName);
        setFormatedFromAccount(value.formatedAccount);
        setSelectedAccountItem(value);
    }

    /***
     * _onLeftButtonPressAccount
     * Close Account Dropdown
     */
    function _onLeftButtonPressAccount() {
        setShowAccountScrollPickerView(false);
    }

    /***
     * _onSetCalenderDates
     *
     */
    function _onSetCalenderDates() {
        const maxDate = new Date();

        if (duitNowRecurring) {
            const fullYear = maxDate.getFullYear() + 10;
            maxDate.setDate(maxDate.getFullYear() + 10);
            maxDate.setFullYear(fullYear);
            maxDate.setMonth(maxDate.getMonth());
            maxDate.setDate(maxDate.getDate());
        } else {
            maxDate.setDate(maxDate.getDate() + 28);
        }
    }

    /***
     * _onClosePress
     * On Header Close Button Click Event Listener
     */
    function _onClosePress() {
        props?.navigation?.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
            params: { updateScreenData: true, doneFlow: true },
        });
    }

    /***
     * _onTeamsConditionClick
     * Open DuitNow Teams and Conditions PDF view
     */
    async function _onTeamsConditionClick() {
        const file = termsAndConditionUrl;
        const navParams = {
            file,
            share: false,
            showShare: false,
            type: "url",
            pdfType: "shareReceipt",
            title: TERMS_CONDITIONS,
        };

        // Navigate to PDF viewer to display PDF
        props?.navigation?.navigate(navigationConstant.PDF_VIEWER, navParams);
    }

    /***
     * _onDateEditClick
     * Fund Transfer on Date click open Calender View
     */
    function _onDateEditClick() {
        _onSetCalenderDates();
        setShowDatePicker(true);
    }

    /***
     * hideDatePicker
     * hide Calender picker
     */
    function hideDatePicker() {
        setShowDatePicker(false);
    }

    /***
     * onDateDonePress
     * handle done pressed on Calender picker
     */
    function onDateDonePress(date) {
        const formatedDate = getFormatedDateMoments(date, "D MMM YYYY");
        setExpiryDateFormatted(formatedDate);
        setExpiryDate(date);
        hideDatePicker();
    }

    /***
     * _onTransferModeClick
     * on Transfer Mode Click update state
     */
    function _onEditableDropDownClick() {
        if (editableDropDown && editableDropDown.length > 0) {
            setShowEditable(true);
        }
    }

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    function _onBackPress() {
        props?.navigation?.goBack();
    }

    function getRTPRequestParams() {
        const _transferParams = { ...transferParams };
        const amount = _transferParams.amount;
        const transferAmount = _transferParams?.amount ? amount.replace(/,/g, "") : "0.00";

        const deviceInfo = props?.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { rtpType } = props.route.params;
        const proxyType = _transferParams?.requestId?.substring(16, 19);
        const idType =
            proxyType === "853" ? "ACCT" : mapProxy[_transferParams?.originalData?.debtorIdType];
        const idValue = _transferParams?.originalData?.debtorIdValue;
        const sendAgain = _transferParams?.isSendAgain;
        const s2uObj = flow === "S2U" ? { twoFAType: "SECURE2U_PULL" } : {};

        const returnObj = {
            ...s2uObj,
            requestId: sendAgain ? _transferParams?.requestId : undefined,
            paymentDesc,
            receiverAcct: sendAgain ? _transferParams?.senderAcct : fromAccount?.substring(0, 12),
            requestType: "REQUEST",
            accCode: sendAgain ? "07" : fromAccountCode,
            senderAcct: sendAgain
                ? _transferParams?.receiverAcct
                : _transferParams?.toAccount ?? _transferParams?.receiverProxyValue,
            senderAcctType: sendAgain ? "S" : _transferParams?.transferAccType,
            senderProxyType: sendAgain
                ? idType
                : _transferParams?.idType ?? _transferParams?.receiverProxyType,
            senderProxyValue: sendAgain
                ? idValue
                : _transferParams?.selectedProxy?.no === 3
                ? _transferParams.idValue + _transferParams?.countryCode ??
                  _transferParams?.receiverProxyValue
                : _transferParams?.idValue ?? _transferParams?.receiverProxyValue,
            swiftCode: _transferParams?.swiftCode ?? _transferParams.bankCode,
            trxDate: _transferParams?.effectiveDate,
            receiverAcctType: selectedAccountItem.type,
            senderName: _transferParams?.nameMasked
                ? _transferParams?.actualAccHolderName
                : _transferParams?.accHolderName,
            reference: paymentRef,
            mobileSDKData: mobileSDK, // Required For RSA
            amountEditable: selectedEditable?.code !== "yes",
            expiryDateTime: _transferParams?.expiryDateTime || expiryDate,
            email: notifyEmail,
            sourceOfFunds: _transferParams?.sourceOfFunds,
            bankName: formateIDName(
                _transferParams?.bankName || _transferParams?.selectedBank?.bankName
            ),
            receiverName: _transferParams?.userName,
        };

        if (rtpType !== RTP_AUTODEBIT) {
            returnObj.amount = transferAmount;
        }
        if (rtpType === DUITNOW_REQUEST) {
            if (autoDebitEnabled) {
                returnObj.transactionType = "COUPLED_REQUEST";
            } else {
                returnObj.transactionType = "REQUEST";
            }
        } else if (rtpType === RTP_AUTODEBIT) {
            returnObj.transactionType = "DECOUPLED_REQUEST";
        }
        //new params p2b
        returnObj.consentStartDate = _transferParams?.consentStartDate ?? null;
        returnObj.consentExpiryDate = _transferParams?.consentExpiryDate ?? null;
        returnObj.consentFrequency = _transferParams?.consentFrequency ?? null;
        returnObj.consentMaxLimit = _transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null;

        returnObj.productId = _transferParams.productId;
        returnObj.merchantId = _transferParams.merchantId;
        returnObj.autoDebitEnabled = sendAgain ? true : _transferParams.autoDebitEnabled;
        returnObj.senderBrn = sendAgain
            ? props.route.params?.merchantDetails?.brn
            : _transferParams?.senderBrn ?? "";
        if (!paramsRef.current) {
            paramsRef.current = returnObj;
        }
        return paramsRef.current ? paramsRef.current : returnObj;
    }

    function showLoader(visible) {
        props?.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    }

    function onPress(title) {
        const temp = [...paymentMethods]?.map((el, key) => ({
            ...el,
            isSelected:
                title === el.title && el.key !== "01"
                    ? !paymentMethods[key]?.isSelected
                    : paymentMethods[key]?.isSelected,
        }));
        setPaymentMethods(temp);
    }

    function onPopupClosePress() {
        setIsPopupDisplay(false);
        setPopupTitle("");
        setPopupDesc("");
    }

    function onPopupPrimaryActionPress() {
        onPopupClosePress();
        _onConfirmClick();
    }

    function handleInfoPress(type) {
        const infoTitle = type === FREQUENCY ? FREQUENCY_TRN : LIMIT_PER_TRN;
        const infoMessage = type === FREQUENCY ? FREQUENCY_DETAILS : LIMIT_DETAILS;
        setInfoTitle(infoTitle);
        setInfoMessage(infoMessage);
        setShowFrequencyInfo(!showFrequencyInfo);
    }

    function redirectToAcknowledge(payload) {
        const { route, navigation } = props;
        const navParams = {
            ...route?.params,
            origin: route?.params?.origin,
            ...payload,
            transferParams: {
                ...payload.transferParams,
                ...transferParams,
                transactionType: SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST,
            },
        };

        setShowS2u(false);
        navigation.navigate(
            navigationConstant.DUITNOW_DECOUPLED_REQUEST_ACKNOWLEDGE_SCREEN,
            navParams
        );
    }

    async function onTACDone(tac) {
        setShowTAC(false);
        const amount = transferParams.amount;
        const transferAmount = transferParams?.amount ? amount.replace(/,/g, "") : "0.00";

        const payload = {
            fundTransferType: "RTP_REQUEST_VERIFY",
            payeeName: transferParams?.isSendAgain
                ? transferParams?.receiverName
                : apiTransferParams?.senderName,
            // cardNo: transferParams?.isSendAgain ? transferParams?.consentFrequency : "",
            toAcctNo: transferParams?.isSendAgain
                ? transferParams?.receiverProxyValue
                : apiTransferParams?.receiverAcct?.length === 12
                ? apiTransferParams?.receiverAcct
                : apiTransferParams?.receiverAcct?.substring(0, 12),
            amount: transferAmount,

            tacNumber: tac,
        };

        setLastAPIDetails({ params: apiTransferParams, apiCalled: duitNowRtp });
        try {
            const response = await nonMonetoryValidate(payload);
            if (response?.data?.responseStatus === "0000") {
                duitNowRtp();
            } else {
                showErrorToast({
                    message:
                        response?.data?.responseStatus === "00A5" ||
                        response?.data?.responseStatus === "00A4"
                            ? response?.data?.statusDesc
                            : WE_FACING_SOME_ISSUE,
                });
                showLoader(false);
            }
        } catch (error) {
            _handleTACFailedCall(error);
        }
    }

    async function duitNowRtp(params) {
        const apiTransferParams = params || getRTPRequestParams();

        try {
            const res = await rtpActionApi(apiTransferParams);
            const redirectParams = {
                ...apiTransferParams,
                ...transferParams,
                formattedTransactionRefNumber: res?.data?.result?.transactionRefNumber ?? "",
                transactionType: SEND_DUITNOW_AUTODEBIT_DECOUPLED_REQUEST,
                transferFlow: 25,
                requestId: res?.data?.result?.bizMsgId ?? "",
            };
            setTxnId(res?.data?.result?.transactionRefNumber);
            if (res?.data?.result?.statusCode === "000" || res?.data?.result?.statusCode === "0") {
                if (flow === "S2U" || params?.twoFAType === "SECURE2U_PULL") {
                    setShowOverlay(true);
                    if (res?.data?.result?.pollingToken) {
                        setPollingToken(res?.data?.result?.pollingToken);
                        setRtpFormattedRefNumber(res?.data?.result?.transactionRefNumber);
                        setRtpActionData(res?.data);
                    } else {
                        setRtpFormattedRefNumber(res?.data?.result?.transactionRefNumber);
                        rtpApiSuccess(res?.data?.result);
                    }
                } else {
                    rtpApiSuccess(res?.data?.result);
                }
            } else {
                rtpApiFailed({
                    ...res,
                    ...redirectParams,
                    statusDescription: "unsuccessful",
                    transactionStatus: false,
                });
            }
        } catch (error) {
            //lastAPIDetails
            setLastAPIDetails({
                params: apiTransferParams,
                apiCalled: duitNowRtp,
            });
            rtpApiFailed(error);
        }
    }

    function _handleTACFailedCall(tacResponse) {
        const _transferParams = getRTPRequestParams();
        const _params = {
            transferParams: {
                ..._transferParams,
                transactionStatus: false,
                statusDescription: "unsuccessful",
                transactionresponse: {
                    msgId: tacResponse?.error?.refId || tacResponse?.data?.mbbRefNo,
                },
                errorMessage: REQUEST_UNSUCCESSFUL,
            },
            subMessage: null,
            showDesc: false,
            formattedTransactionRefNumber: tacResponse?.error?.refId,
        };
        redirectToAcknowledge(_params);
        setTacParams(null);
    }

    const { soleProp, rtpType, isSendAgain } = props?.route?.params || {};

    const paymentDescIos =
        paymentDesc?.length >= 1 ? Styles.commonInputConfirmIosText : Styles.commonInputConfirmIos;

    const paymentDescAndroid =
        paymentDesc?.length >= 1 ? Styles.commonInputConfirmText : Styles.commonInputConfirm;
    const font = {
        color: transferParams?.transferFlow === 25 ? ROYAL_BLUE : BLACK,
        fontFamily: "Montserrat-SemiBold",
        marginRight: 4,
    };
    const inputStyling = [Platform.OS === "ios" ? paymentDescIos : paymentDescAndroid, font];
    const auDebitParams = {
        autoDebitEnabled: isSendAgain ? true : autoDebitEnabled,
        transferParams: {
            ...transferParams,
            isDuitnowRequest: true,
            allowCancel: transferParams?.allowCancel,
            isProductNameWithCap: true,
        },
        transferFlow: isSendAgain ? 25 : transferFlow,
        handleInfoPress,
        showProductInfo: true,
        amount: transferParams?.amount,
        onToggle: _onEditAmount,
    };
    const tparams = props?.route?.params;
    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                errorMessage={errorMessage}
                showOverlay={showOverlay}
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={"DuitNowRequest_ReviewDetails"}
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
                                headerLeftElement={
                                    transferParams?.isOnlineBanking ? null : (
                                        <HeaderBackButton onPress={_onBackPress} />
                                    )
                                }
                                headerRightElement={<HeaderCloseButton onPress={_onClosePress} />}
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
                                        title={
                                            isSendAgain
                                                ? transferParams.senderName
                                                : transferParams?.accHolderName
                                        }
                                        subtitle={transferParams?.idValueFormatted}
                                        image={{
                                            type: "local",
                                            source: Assets.icDuitNowCircle,
                                        }}
                                        isVertical={rtpType !== RTP_AUTODEBIT}
                                        additionalData={{ noStyleTitle: true }}
                                    />
                                    <View style={Styles.amountCenterConfirm}>
                                        <TouchableOpacity
                                            onPress={
                                                tparams?.autoDebitParams?.editAmount === true ||
                                                tparams?.decoupleTransaction
                                                    ? _onEditAmount
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
                                                color={ROYAL_BLUE}
                                                text={`${CURRENCY}${transferParams?.amount ?? ""}`}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {!transferParams?.isOnlineBanking &&
                                    transferParams?.refundIndicator &&
                                    !isSendAgain ? (
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
                                                    maxLength={20}
                                                    color={BLACK}
                                                    text={transferParams.reference}
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
                                                text={REQUEST_EXPIRY_DATE}
                                            />
                                        </View>
                                        <View>
                                            <TouchableOpacity
                                                onPress={
                                                    tparams?.autoDebitParams?.editExpiryDate ===
                                                        false || tparams?.decoupleTransaction
                                                        ? _onDateEditClick
                                                        : null
                                                }
                                                testID="txtSELECT_date"
                                                accessibilityLabel="txtSELECT_date"
                                            >
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    maxLength={20}
                                                    color={BLUE}
                                                    text={expiryDateFormatted}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {isSendAgain ||
                                    (rtpType !== RTP_AUTODEBIT &&
                                        !transferParams?.refundIndicator) ? (
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
                                                <TouchableOpacity
                                                    onPress={_onRecipientReferenceClick}
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
                                                        color={ROYAL_BLUE}
                                                        text={transferParams.reference}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : null}

                                    {isSendAgain ||
                                    (!transferParams?.refundIndicator &&
                                        (parseFloat(transferParams?.amount) > 5000.0 ||
                                            transferParams?.serviceFee > 0) &&
                                        !transferParams?.isOnlineBanking) ? (
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
                                                    text={SERVICE_FEES}
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
                                                    maxLength={20}
                                                    color={BLACK}
                                                    text={`RM ${
                                                        transferParams?.serviceFee
                                                            ? transferParams?.serviceFee?.toFixed(2)
                                                            : "0.00"
                                                    }`}
                                                />
                                            </View>
                                        </View>
                                    ) : null}

                                    {!transferParams?.refundIndicator &&
                                    parseFloat(transferParams?.amount) <= 5000.0 &&
                                    transferParams?.serviceFee === 0 &&
                                    !transferParams?.isOnlineBanking ? (
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
                                                    text={SERVICE_FEES}
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
                                                    maxLength={20}
                                                    color={BLACK}
                                                    text={SERVICE_FEE_PLACEHOLDER}
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                    {isSendAgain ||
                                    (rtpType !== RTP_AUTODEBIT && transferFlow === 25) ? (
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
                                                    text={RECIPIENT_AMOUNT_EDITABLE}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItem}>
                                                {transferFlow === 25 || isSendAgain ? (
                                                    <TouchableOpacity
                                                        onPress={_onEditableDropDownClick}
                                                        testID="txtSELECT_date"
                                                        accessibilityLabel="txtSELECT_date"
                                                    >
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            maxLength={20}
                                                            color={BLUE}
                                                            text={selectedEditable?.name}
                                                        />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        maxLength={20}
                                                        color={BLACK}
                                                        text={selectedEditable?.name}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    ) : null}

                                    {isSendAgain ||
                                    (!transferParams?.refundIndicator &&
                                        (transferFlow === 25 ||
                                            paymentDesc ||
                                            transferParams?.paymentDesc)) ? (
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
                                                <TextInput
                                                    disabled={false}
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
                                                    placeholder={OPTIONAL1}
                                                    value={paymentDesc}
                                                    onChangeText={_onPaymentOptionTextChange}
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                    {isSendAgain ||
                                    (!transferParams?.refundIndicator &&
                                        !transferParams?.coupleIndicator) ? (
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
                                                    text={NOTIFY_VIA_EMAIL}
                                                />
                                            </View>
                                            <View style={Styles.viewRowRightItemOption}>
                                                {notifyEmail &&
                                                !isSendAgain &&
                                                transferFlow !== 25 ? (
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        maxLength={20}
                                                        text={notifyEmail}
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
                                                        placeholder={OPTIONAL1}
                                                        keyboardType="email-address"
                                                        maxLength={40}
                                                        value={notifyEmail}
                                                        onChangeText={_onEmailOptionTextChange}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    ) : null}

                                    <View style={Styles.lineConfirm} />
                                    {isSendAgain ||
                                        (soleProp && autoDebitEnabled && (
                                            <View style={Styles.mVertical20}>
                                                <View style={Styles.viewRow3}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text={DUITNOW_AUTODEBIT_CARD_TITLE}
                                                        />
                                                    </View>
                                                </View>
                                                <AutoDebitCard {...auDebitParams} />
                                            </View>
                                        ))}

                                    {soleProp && !isEmpty(paymentMethods) ? (
                                        <View style={Styles.mt10}>
                                            <Typography
                                                text={PAYMENT_METHOD_PLACEHOLDER}
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={19}
                                                textAlign="left"
                                                style={Styles.mb20}
                                            />
                                            {paymentMethods?.map((value, index) => {
                                                const { title, isSelected } = value;
                                                return (
                                                    <View key={value?.key} style={Styles.listItem}>
                                                        <RadioButton
                                                            {...props}
                                                            key={`radio-${value?.key}`}
                                                            title={title}
                                                            isSelected={isSelected}
                                                            onRadioButtonPressed={() =>
                                                                onPress(title)
                                                            }
                                                            fontSize={14}
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ) : null}

                                    <View style={Styles.viewRowDescriberItem}>
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
                                            <TouchableOpacity onPress={_onTeamsConditionClick}>
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

                            {transferFlow === 26 && (
                                <View style={Styles.accList}>
                                    <AccountList
                                        title={
                                            transferParams?.refundIndicator ? REFUND_FROM : PAY_FROM
                                        }
                                        data={accounts}
                                        onPress={_onAccountListClick}
                                        extraData={accounts}
                                        paddingLeft={24}
                                    />
                                </View>
                            )}
                        </React.Fragment>
                    </ScrollView>
                    <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                        <View alignItems="center" justifyContent="center" width="100%">
                            <ActionButton
                                disabled={loader}
                                fullWidth
                                borderRadius={25}
                                onPress={_onConfirmClick}
                                backgroundColor={loader || disableBtn ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={loader || disableBtn ? DISABLED_TEXT : BLACK}
                                        text={SEND_NOW}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>

                {showDatePicker && (
                    <DatePicker
                        showDatePicker={showDatePicker}
                        onCancelButtonPressed={hideDatePicker}
                        onDoneButtonPressed={onDateDonePress}
                        dateRangeStartDate={moment(new Date()).add(1, "day")}
                        dateRangeEndDate={moment(new Date()).add(4, "months")}
                        defaultSelectedDate={moment(expiryDate).toDate()}
                    />
                )}
                {rsaObject?.showRSA ? <RSAHandler {...rsaObject} /> : null}

                {showS2u && (
                    <Secure2uAuthenticationModal
                        token={pollingToken}
                        amount={transferParams.amount}
                        onS2UDone={onS2uDone}
                        onS2UClose={onS2uClose}
                        transactionDetails={s2uTransactionDetails}
                        s2uPollingData={secure2uValidateData}
                        nonTxnData={{
                            ...nonTxnData,
                            nonTxnTitle: `${CURRENCY} ${transferParams?.formattedAmount}`,
                        }}
                        extraParams={{
                            metadata: { txnType: "RTP_REQUEST", refId: txnId },
                        }}
                    />
                )}

                {showTAC && tacParams && (
                    <TacModal
                        tacParams={tacParams}
                        validateByOwnAPI={true}
                        validateTAC={onTACDone}
                        onTacClose={hideTAC}
                        onTacError={_handleTACFailedCall}
                    />
                )}

                <ScrollPickerView
                    showMenu={showAccountScrollPickerView}
                    list={accountDropDown}
                    onRightButtonPress={_onRightButtonPressAccount}
                    onLeftButtonPress={_onLeftButtonPressAccount}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={showEditable}
                    list={editableDropDown}
                    onRightButtonPress={_onRightButtonPressEditable}
                    onLeftButtonPress={_onLeftButtonPressEditable}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <Popup
                    visible={isPopupDisplay}
                    title={popupTitle}
                    description={popupDesc}
                    onClose={onPopupClosePress}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupClosePress,
                    }}
                    primaryAction={{
                        text: CONTINUE,
                        onPress: onPopupPrimaryActionPress,
                    }}
                    hideCloseButton={!transferParams?.isOnlineBanking}
                />
                <Popup
                    visible={showFrequencyInfo}
                    title={infoTitle}
                    description={infoMessage}
                    onClose={handleInfoPress}
                />
            </ScreenContainer>
        </React.Fragment>
    );
};

DuitnowRequestConfirmationScreen.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};
export default withModelContext(DuitnowRequestConfirmationScreen);

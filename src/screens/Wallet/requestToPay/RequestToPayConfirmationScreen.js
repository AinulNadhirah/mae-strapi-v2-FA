import { isEmpty, isNull } from "lodash";
import moment from "moment";
import { Numeral } from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
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

import { timeDifference } from "@screens/ATMCashout/helper";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import DatePicker from "@components/Pickers/DatePicker";
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
    fundTransferOnlineBkngApi,
    onlineBkngRedirect,
} from "@services";
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
import { frequencyList, termsAndConditionUrl } from "@constants/data/DuitNowRPP";
import * as FundConstants from "@constants/fundConstants";
import {
    SECURE2U_IS_DOWN,
    AMOUNT_ERROR,
    ENTER_AMOUNT,
    CURRENCY,
    TO,
    FROM,
    TRANSACTION_TYPE,
    DATE,
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
    PAY_NOW,
    PAY_FROM,
    FORWARD_NOW,
    MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT,
    NOTES1,
    PLEASE_SELECT_FROM_ACCOUNT,
    REQUEST_TO_PAY,
    SERVICE_FEES,
    REQUESTED_AMOUNT,
    REQUEST_EXPIRY_DATE,
    REQUESTED_AMOUNT_ERROR,
    DUITNOW_ID_INQUIRY_FAILED,
    PAY_TO,
    FREQUENCY,
    AMOUNT_EDITABLE,
    PLEASE_REMOVE_INVALID_EMAIL,
    RTP_AUTODEBIT,
    DUITNOW_REQUEST,
    REQUEST_VIA,
    AMOUNT_ERROR_RTP,
    SETTINGS_VALID_EMAIL,
    SERVICE_FEE_CONFIRM,
    REFUND_TO,
    REFERENCE_ID,
    FREQUENCY_DETAILS,
    LIMIT_DETAILS,
    RTP_ONLINE_BANKING,
    REFUND_NOW,
    REFUND_FROM,
    PRODUCT_NAME,
    AUTODEBIT_NOTE,
    PAY_NOW_CONTINUE,
    RTP_REQUEST_ID,
    RECIPIENT_CAN_EDIT_AMOUNT_SM,
    MAX_LIMIT_ERROR,
    PAYMENT_LIMIT_ERROR,
    REQUEST_COULD_NOT_BE_PROCESSED,
    DATE_SHORT_FORMAT,
} from "@constants/strings";

import { paymentDetailsRegex, getFormatedDateMoments, validateEmail } from "@utils/dataModel";
import {
    formateReferenceNumber,
    formateReqIdNumber,
    formateAccountNumber,
    getDeviceRSAInformation,
    formateIDName,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";
import RTPTimer from "./RTPTimer";

export const { width, height } = Dimensions.get("window");
class RequestToPayConfirmationScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.forwardItem = this.props.route.params?.forwardItem || null;
        this.state = {
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
            paymentRef: "",
            selectedAccountText: "Select account",
            selectedAccountDescriptionText: " ",
            showDatePicker: false,
            expiryDate: moment(new Date()).add(this.props.route.params?.soleProp ? 14 : 7, "day"),
            expiryDateFormatted: getFormatedDateMoments(
                moment(new Date()).add(14, "day"),
                DATE_SHORT_FORMAT
            ),
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

            // scroll picker 2
            showAccountScrollPickerView: false,
            showEditable: false,
            editableDropDown: [],
            selectedEditable: null,
            accountDropDown: [],
            accountScrollPickerSelected: !!this.forwardItem,

            // enable auto debit
            autoDebitEnabled: false,
            paymentMethods: [
                { key: "01", title: "Saving & current account", isSelected: true },
                { key: "02", title: "Credit card", isSelected: true },
                { key: "03", title: "E-Wallet", isSelected: true },
            ],
            notifyEmail: "",
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryActionText: "Continue",
            infoTitle: "",
            infoMessage: "",
            showFrequencyInfo: false,
            disableBtn: false,

            //Cancel timer
            allowToCancelTimer: true,

            screenNameAnalytic: "",
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateDataInScreenAlways();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.onFocusScreenUpdate();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {}

    onFocusScreenUpdate = () => {
        const transferParams = this.props.route.params?.transferParams;
        const isAutoDebitEnabled = this.props.route.params?.isAutoDebitEnabled === true;
        if (!transferParams?.productId && this.props.route.params?.productId) {
            transferParams.productId =
                this.props.route.params?.productId ?? transferParams?.productId;
            transferParams.merchantId =
                this.props.route.params?.merchantId ?? transferParams?.merchantId;
        }
        transferParams.timeInSecs = new Date().getTime();

        const transParams = { ...transferParams, ...this.props.route.params?.autoDebitParams };
        if (this.props.route.params?.isAmountHigher || parseFloat(transferParams.amount) > 5000.0) {
            transParams.serviceFee = 0.5;
        }
        const isSendAgain = this.props.route.params?.isSendAgain;
        const editableDropDown = [
            { code: "editable", name: isSendAgain ? "Yes" : "Editable" },
            {
                code: "noteditable",
                name: isSendAgain ? "No" : "Not editable",
            },
        ];
        const selectedEditable = {
            code: transferParams?.amountEditable !== "False" ? "editable" : "noteditable",
            name:
                transferParams?.amountEditable !== "False"
                    ? editableDropDown?.[0]?.name
                    : editableDropDown?.[1]?.name,
        };
        const screenNameAnalytic = this.props.route.params?.autoDebitParams
            ? "DuitNowRequest_ReviewDetails"
            : this.props.route.params?.transferParams?.isOnlineBanking
            ? "Duitnow_OnlineBanking_ReviewDetails"
            : this.props.route.params?.rtpType === RTP_AUTODEBIT
            ? "DuitNowRequest_AutoDebitRequestSuccessful"
            : "DuitNowRequest_ReviewDetails";
        this.setState(
            {
                screenNameAnalytic,
                editableDropDown,
                selectedEditable,
                paymentRef: transferParams?.reference,
                autoDebitEnabled: isAutoDebitEnabled,
                transferParams: transParams,
            },
            () => {
                this.commonToast();
            }
        );
    };

    /**
     *_updateDataInScreenAlways
     * @memberof RequestToPayConfirmationScreen
     */
    _updateDataInScreenAlways = async () => {
        // get transferParams for screen data
        const transferParams = this.props.route.params?.transferParams; // ?? this.state.screenData;

        // get Payment method flow TAC / S2U Data from Validate Api
        const secure2uValidateData = this.props.route.params?.secure2uValidateData ?? {
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

        const stateData = this.props?.route?.params ?? this.props?.route?.params?.params;

        // get Payment method flow TAC / S2U
        let flow = stateData?.flow ?? this.props.route.params?.flow ?? "NA";

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
        transferParams.productId = this.props.route.params?.productId ?? transferParams?.productId;
        transferParams.merchantId =
            this.props.route.params?.merchantId ?? transferParams?.merchantId;
        transferParams.senderBrn = this.props.route.params?.senderBrn ?? transferParams?.senderBrn;
        // update source of funds from fpx
        const sourceFunds = this.props.route.params?.sourceFunds?.split(/(..)/g).filter((s) => s);
        let paymentMethods = [];
        if (!isEmpty(sourceFunds)) {
            paymentMethods = [...this.state.paymentMethods]?.filter((el) =>
                sourceFunds.includes(el?.key)
            );
        }
        if (this.props.route.params?.isAmountHigher || parseFloat(transferParams.amount) > 5000.0) {
            transferParams.serviceFee = 0.5;
        }
        const isSendAgain = this.props.route.params?.isSendAgain;
        const editableDropDown = [
            { code: "editable", name: isSendAgain ? "Yes" : "Editable" },
            {
                code: "noteditable",
                name: isSendAgain ? "No" : "Not editable",
            },
        ];
        const selectedEditable = {
            code: transferParams?.amountEditable ? "editable" : "noteditable",
            name: transferParams?.amountEditable
                ? editableDropDown?.[0]?.name
                : editableDropDown?.[1]?.name,
        };
        flow = this.props.route.params?.isFromS2uReg ? "S2U" : flow;
        // update Transfer Params data to state
        this.setState(
            {
                editableDropDown,
                selectedEditable,
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
                paymentRef: this.forwardItem
                    ? this.forwardItem.reference
                    : transferParams?.reference,
                paymentDesc: this.forwardItem
                    ? this.forwardItem.paymentDesc
                    : transferParams?.paymentDesc,
                notifyEmail: this.forwardItem
                    ? this.forwardItem.notifyEmail
                    : transferParams?.notifyEmail,
                secure2uValidateData,
                accountScrollPickerSelected: !!this.forwardItem,
                paymentMethods,
                stateData,
            },
            () => {
                this.commonToast();

                this.getAllAccounts();
            }
        );
    };

    commonToast = () => {
        const transferParams = this.props.route.params?.transferParams;

        if (
            this.props.route.params?.isAmountHigher ||
            parseFloat(transferParams?.amount) > 5000.0
        ) {
            setTimeout(() => {
                showInfoToast({
                    message: this.props.route.params?.errorMessage ?? SERVICE_FEE_CONFIRM,
                });
            }, 1000);
        }
    };

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    getAllAccounts = async () => {
        try {
            this.showLoader(true);
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
                    this.setState(
                        {
                            primaryAccount,
                        },
                        () => {
                            //set selected Account
                            this._setSelectFromAccount(listData);
                        }
                    );
                }
            }
        } catch (error) {
            // error when retrieving the data
            this.showLoader(false);
        }
    };

    getAdditionalTransferParams = (accountItem) => {
        return {
            fromAccount: accountItem?.number,
            formatedFromAccount: formateAccountNumber(accountItem?.number, 12),
            formattedFromAccount: formateAccountNumber(accountItem?.number, 12),
            fromAccountCode: accountItem?.code,
            fromAccountName: accountItem?.name,
        };
    };

    /***
     * _setSelectFromAccount
     * set selected Acccount either from account or primary account
     */
    _setSelectFromAccount = (newAccountList) => {
        const { transferParams, primaryAccount } = this.state;
        const accountDropDown = [];
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

            const accUpdated = {
                ...accountItem,
                selectionIndex: index,
                isSelected:
                    fromAccountTempSelected?.substring(0, 12) ===
                    accountItem?.number?.substring(0, 12),
                selected:
                    fromAccountTempSelected?.substring(0, 12) ===
                        accountItem?.number?.substring(0, 12) &&
                    !transferParams?.isDuitNowOnlineBanking,
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

        const selectedAccount = accountsArray.filter((selectedAcc) => {
            return selectedAcc.isSelected === true;
        });
        if (selectedAccount?.length === 1) targetSelectedAccounts.push(selectedAccount[0]);

        const selectedAccountObj = !targetSelectedAccounts?.length
            ? nonSelectedAccounts[0]
            : selectedAccount[0];
        const { fromAccount, formatedFromAccount, fromAccountCode, fromAccountName } =
            this.getAdditionalTransferParams(selectedAccountObj);

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
        this.setState(
            {
                disableBtn: transferParams?.isDuitNowOnlineBanking,
                fromAccount,
                fromAccountCode,
                fromAccountName,
                formatedFromAccount,
                accounts: targetSelectedAccounts,
                selectedAccount: selectedAccountObj,
                transferParams: newTransferParams,
                accountDropDown,
                accountScrollPickerSelected: true,
                selectedAccountDescriptionText: newTransferParams.formatedFromAccount,
                selectedAccountText: newTransferParams.fromAccountName,
                selectedAccountItem: selectedAccountObj,
            },
            () => {
                this.showLoader(false);
            }
        );
    };

    /***
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    _onAccountListClick = (item) => {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const { transferParams } = this.state;
        const selectedAcc = item;
        let isValid = this.state.disableBtn;
        if (!(parseFloat(item.acctBalance) <= 0.0 && itemType === "account")) {
            const tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                    isValid = false;
                } else {
                    tempArray[i].selected = false;
                }
                tempArray[i].isSelected = tempArray[i].selected;
            }
            this.setState({
                disableBtn: transferParams?.isOnlineBanking ? isValid : this.state.disableBtn,
                accounts: tempArray,
                selectedAccount: selectedAcc,
                fromAccount: item.number,
                fromAccountCode: item.code,
                fromAccountName: item.name,
                formatedFromAccount: formateAccountNumber(item.number, 12),
            });
        }
    };

    /***
     * _onPaymentOptionTextChange
     * Notes / Payment option text change listener
     */
    _onPaymentOptionTextChange = (text) => {
        const disableBtn = text?.length > 0 && text?.length < 3;
        this.setState({ paymentDesc: text ?? null, disableBtn });
    };

    _onEmailOptionTextChange = (text) => {
        this.setState({ notifyEmail: text ?? null });
    };

    /***
     *_onPaymentOptionTextDone
     * Notes / Payment option keyboard Done click listener
     */
    _onPaymentOptionTextDone = (text) => {};
    _onEmailOptionTextDone = (text) => {
        this.setState({ notifyEmail: text || null });
    };

    /***
     * _onEditAmount
     * On Click listener to open Amount edit screen
     */
    _onEditAmount = () => {
        if (this.forwardItem) {
            return;
        }
        const { transferParams } = this.state;

        transferParams.imageBase64 = true;
        transferParams.minAmount = 0.01;
        transferParams.maxAmount = 50000.0;
        transferParams.screenTitle = REQUEST_TO_PAY;
        transferParams.screenLabel = ENTER_AMOUNT;
        transferParams.amountError = "Please input a valid amount";
        transferParams.maxAmountError = transferParams.amountEditable
            ? REQUESTED_AMOUNT_ERROR
            : AMOUNT_ERROR_RTP;
        transferParams.amountLength = 8;
        const screenData = {
            formattedToAccount: transferParams.idValueFormatted,
            accountName: transferParams.accHolderName,
            bankName: transferParams.bankName,
        };
        this.props.navigation.navigate(navigationConstant.AMOUNT_STACK, {
            screen: navigationConstant.AMOUNT_SCREEN,
            params: {
                isRTPAmount: true,
                transferParams: { ...transferParams, ...screenData },
                screenData,
            },
        });
    };

    _coupledCheck = async () => {
        const { transferParams } = this.state;
        if (transferParams?.isOnlineBanking) {
            const sslObj = {
                autodebit: false,
                frequency: transferParams?.consentFrequencyText ?? null,
                limit_transaction: !!transferParams.consentMaxLimitFormatted,
                cancellation: true,
            };
            RTPanalytics.onlineBankingProceed(sslObj);
        }
        if (
            transferParams?.transferFlow === 26 &&
            parseFloat(transferParams?.amount?.replace(/,/g, "")) >
                parseFloat(this.state.selectedAccount?.value)
        ) {
            showErrorToast({
                message: "Your account balance is insufficient. Please try again.",
            });
            return false;
        } else if (transferParams?.coupleIndicator && !transferParams?.isSendAgain) {
            const { merchantInquiry } = this.props.getModel("rpp");
            const { cus_type } = this.props.getModel("user");
            if (merchantInquiry?.statusdesc === "Active" || cus_type !== "02") {
                // individual validation as not have merchantInquiry
                this.props.navigation.navigate(navigationConstant.RTP_AUTODEBIT_CONFIRMATION, {
                    ...this.props.route.params,
                    senderBrn: cus_type === "02" ? merchantInquiry?.brn : null,
                });
            }
        } else if (transferParams?.autoDebitEnabled === true) {
            this.props.navigation.navigate(navigationConstant.RTP_AUTODEBIT_CONFIRMATION_SCREEN, {
                ...this.props.route.params,
            });
        } else {
            this._onConfirmClick();
        }
    };

    /**
     *_onConfirmClick
     * @memberof RequestToPayConfirmationScreen
     *
     * transferFlow === 25 --> Request To Pay (RTP)
     * transferFlow === 26 --> Pay for Request To Pay (RTP)
     */
    _onConfirmClick = async () => {
        try {
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
                paymentMethods,
                selectedAccount,
            } = this.state || {};
            let sourceOfFunds = "";
            if (!isEmpty(paymentMethods)) {
                paymentMethods?.forEach((el) => {
                    if (el?.isSelected) {
                        sourceOfFunds += el.key;
                    }
                });
            }
            if (this.state.autoDebitEnabled) {
                const sslObj = {
                    autodebit: this.state.autoDebitEnabled,
                    frequency: transferParams?.consentFrequencyText ?? null,
                    limit_transaction: !!transferParams.consentMaxLimitFormatted,
                    cancellation: true,
                };
                RTPanalytics.screenLoadADformProceed(sslObj);
            }
            if ((isNull(selectedAccount) || !selectedAccount) && !transferParams?.isSendAgain) {
                showInfoToast({ message: "Please select pay from account." });
                return false;
            }
            if (transferFlow === 26 || accountScrollPickerSelected || transferParams?.isSendAgain) {
                const swiftCode = this.props.route.params?.transferParams?.swiftCode ?? "";
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
                    this.setState({
                        showOverlay: true,
                        loader: true,
                    });
                    // To DO : use mobile SDK for RSA Integration
                    const deviceInfo = this.props.getModel("device");
                    const mobileSDK = getDeviceRSAInformation(
                        deviceInfo.deviceInformation,
                        DeviceInfo
                    );
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
                    transferParams.expiryDateTime = this.state.expiryDate;
                    transferParams.sourceOfFunds = sourceOfFunds;
                    transferParams.notifyEmail = notifyEmail;
                    if (!this.state.autoDebitEnabled && transferFlow === 25) {
                        transferParams.autoDebitEnabled = this.state.autoDebitEnabled;
                        transferParams.consentStartDate = "";
                        transferParams.consentExpiryDate = "";
                        transferParams.consentFrequency = "";
                        transferParams.consentMaxLimit = "";
                    }

                    if (transferFlow === 25 || transferParams?.isSendAgain) {
                        this._rtpActionApi(transferParams, this.state.flow);
                    } else {
                        transferParams.senderName =
                            transferParams.payerName ?? transferParams.senderName;
                        const acc =
                            transferParams?.receiverAcct ??
                            transferParams?.formattedToAccount ??
                            transferParams?.toAccount;
                        transferParams.receiverAcct = acc?.replace(/[^0-9]|[ ]/g, "");
                        this.performFirstPartyValidation(transferParams)
                            .then((result) => {
                                if (result?.data?.accountExists) {
                                    if (transferFlow === 26) {
                                        // Maybank Open Account Fund transfer and Send Money Transfer
                                        transferParams.mbbbankCode =
                                            FundConstants.MBB_BANK_CODE_MAYBANK;
                                        transferParams.transferType =
                                            FundConstants.FUND_TRANSFER_TYPE_MAYBANK;
                                        transferParams.transferSubType =
                                            FundConstants.SUB_TYPE_OPEN;
                                        transferParams.twoFAType = null;

                                        if (this.state.flow === "S2U") {
                                            // Call S2u API
                                            transferParams.twoFAType =
                                                this.state.secure2uValidateData?.pull === "N"
                                                    ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                                    : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                                            this._rtpActionApi(transferParams, this.state.flow);
                                        } else {
                                            // Save params in state until TAC is complete
                                            //MayBank Third Party Fund Transfer TAG
                                            transferParams.twoFAType =
                                                FundConstants.TWO_FA_TYPE_TAC;
                                            const params = this.getTacParams();
                                            this.setState(
                                                {
                                                    transferParams,
                                                    tacParams: params,
                                                },
                                                () => {
                                                    this._rtpActionApi(
                                                        transferParams,
                                                        this.state.flow
                                                    );
                                                }
                                            );
                                        }
                                    } else {
                                        this.setState({ loader: false });
                                    }
                                } else {
                                    this.setState({ transferParams });
                                }
                            })
                            .catch((e) => {
                                showErrorToast({
                                    message: e?.message ?? DUITNOW_ID_INQUIRY_FAILED,
                                });
                            });
                        this.setState({
                            showOverlay: false,
                            loader: false,
                        });
                    }
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
            if (ex?.message) {
                showInfoToast({
                    message: ex.message,
                });
                this.setState({
                    showOverlay: false,
                    loader: false,
                });
            }
        }
    };

    performFirstPartyValidation = (item) => {
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
                payeeCode: "000000", // default, on fav will have the value - acquirerId
                swiftCode: item?.swiftCode,
                transferType: item?.refundIndicator
                    ? "RTP_REFUND"
                    : item?.isOnlineBanking
                    ? "RTP_REDIRECT"
                    : "RTP_TRANSFER",
            };
            return fundRtpTransferInquiryApi(params);
        } catch (e) {
            showErrorToast({
                message: e.message || REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    };

    /***
     * _rtpActionApi
     * Build Transaction params for TAC and S2U flow and Call transfer Api
     * And Show TAC or S2U Model
     */
    _rtpActionApi = (transferParams, flow) => {
        const { transferFlow } = transferParams;

        if (transferFlow === 25 || transferParams?.isSendAgain) {
            const requestParams = this.getRTPRequestParams();
            this.rtpCallRequest(requestParams);
        } else if (transferFlow === 26) {
            //if Flow is S2u call api to get polling token
            const apiTransferParams = this.getRTPPaymentParams();
            apiTransferParams.twoFAType = transferParams.twoFAType;
            if (transferParams.challenge) {
                apiTransferParams.challenge = transferParams.challenge;
            }
            if (transferParams?.coupleIndicator) {
                const freqObj = frequencyList.find(
                    (el) => el.code === transferParams?.consentFrequency
                );
                transferParams.consentStartDate = moment(transferParams?.consentStartDate).format(
                    "DD MMM YYYY"
                );
                transferParams.consentExpiryDate = moment(transferParams?.consentExpiryDate).format(
                    "DD MMM YYYY"
                );
                transferParams.consentFrequency = freqObj?.name ?? "";
                transferParams.consentMaxLimit = Numeral(transferParams?.consentMaxLimit).format(
                    "0,0.00"
                );
            }

            this.latestParamsCreated = apiTransferParams;
            this.latestAPiCalled = this.rtpCallPayment;

            if (flow === "TAC") {
                //if Flow is TAC open TAC model
                this.setState({ showTAC: true, allowToCancelTimer: false, apiTransferParams });
            } else {
                if (transferParams?.isOnlineBanking) {
                    this.rtpOnlinineBkngPayment(apiTransferParams);
                } else {
                    this.rtpCallPayment(apiTransferParams);
                }
            }
        }
    };

    /***
     * rtpACallRequest
     * Pay for Request Money Flow Api call
     */
    rtpCallRequest = (params) => {
        this.latestParamsCreated = params;
        this.latestAPiCalled = this.rtpCallRequest;
        this.setState({ isRSARequired: false });

        rtpActionApi(params)
            .then((response) => {
                this.rtpApiSuccess(response?.data?.result ?? {});
            })
            .catch((error) => {
                this.rtpApiFailed(error);
            });
    };

    /***
     * rtpCallPayment
     * Pay for Request Money Flow Api call
     */
    rtpCallPayment = (params) => {
        this.setState({ isRSARequired: false });

        fundTransferApi(params)
            .then((response) => {
                // if S2u get Polling Token and Open S2u Model
                if (this.state.flow === "S2U") {
                    this.showS2uModal(response?.data, params);
                } else {
                    this.rtpApiSuccess(response?.data);
                }
            })
            .catch((error) => {
                this.rtpApiFailed(error);
            });
    };

    /***
     * rtpOnlinineBkngPayment
     * Pay for Online Banking Flow Api call
     */
    rtpOnlinineBkngPayment = async (params) => {
        this.setState({ isRSARequired: false, allowToCancelTimer: false });

        const response = await fundTransferOnlineBkngApi(params);
        if (
            response?.data?.statusCode === "0" ||
            response?.data?.statusCode === "0000" ||
            response?.data?.statusCode === "000"
        ) {
            // if S2u get Polling Token and Open S2u Model
            if (this.state.flow === "S2U") {
                this.showS2uModal(response?.data, params);
            } else {
                this.rtpApiSuccess(response?.data);
            }
        } else {
            this.rtpApiFailed(response?.data);
        }
    };

    /***
     * rtpActionCallApiSuccess
     * Handle Transfer Success Flow
     */
    rtpApiSuccess = (response) => {
        const { transferParams } = this.state;

        const { resetModel } = this.props;
        resetModel(["accounts"]);

        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showOverlay: false,
            },
            () => {
                if (response.statusCode === "000" || response.statusCode === "0") {
                    const transactionDate =
                        response && response.serverDate ? response.serverDate : null;

                    transferParams.additionalStatusDescription =
                        response.additionalStatusDescription;
                    transferParams.statusDescription = response.statusDescription;
                    transferParams.transactionRefNo =
                        response?.transactionRefNumber ?? response?.msgId;
                    transferParams.transactionRefNumber = response?.formattedTransactionRefNumber;
                    transferParams.formattedTransactionRefNumber =
                        response.formattedTransactionRefNumber ?? response?.msgId;
                    transferParams.nonModifiedTransactionRefNo =
                        response.transactionRefNumber ?? response?.msgId;
                    transferParams.referenceNumberFull =
                        response?.transactionRefNumber ?? response?.msgId;
                    transferParams.referenceNumber =
                        response?.formattedTransactionRefNumber ?? response?.msgId;
                    transferParams.transactionDate = transactionDate;
                    transferParams.serverDate = response.serverDate;
                    transferParams.transactionresponse = response;
                    transferParams.transactionRefNumberFull =
                        response?.transactionRefNumber ?? response?.msgId;
                    transferParams.transactionStatus = true;

                    //  Response navigate to Acknowledge Screen
                    const screenName = navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN;
                    let params = {};
                    if (transferParams?.isOnlineBanking) {
                        params = {
                            isFromAcknowledge: false,
                            isCancelled: true,
                        };
                    }

                    this.props.navigation.navigate(screenName, {
                        transferParams: { ...transferParams, ...params },
                        transactionReferenceNumber: response.formattedTransactionRefNumber,
                        errorMessge: "",
                        forwardItem: this.forwardItem,
                        screenDate: this.props.route.params?.screenDate,
                    });
                } else {
                    this.error200Handler(response);
                }
            }
        );
    };

    // error200

    error200Handler = (response) => {
        const responseObject = response?.result ?? response;
        const params = {
            isFromAcknowledge: false,
            showDesc: true,
            transactionResponseError:
                "Please refer to the merchant page for the status of your payment.",
            isCancelled: true,
        };

        const transferParams = {
            ...this.state.transferParams,
            additionalStatusDescription: responseObject?.additionalStatusDescription,
            statusDescription: "unsuccessful",
            transactionResponseError: this.state.transferParams?.refundIndicator
                ? "Request unsuccessful"
                : responseObject?.statusDescription ?? WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber: responseObject?.formattedTransactionRefNumber,
            transactionDate: response?.serverDate ?? "",
            transferFlow: this.state.transferFlow,
        };

        this.hideTAC();
        // if Failed navigate to Acknowledge Screen with Failure message
        if (transferParams?.isOnlineBanking) {
            this.props.navigation.replace(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
                transferParams: { ...transferParams, ...params },
                forwardItem: this.forwardItem,
                screenDate: this.props.route.params?.screenDate,
            });
        } else {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN, {
                transferParams,
                forwardItem: this.forwardItem,
                screenDate: this.props.route.params?.screenDate,
            });
        }
    };

    /***
     * rtpActionApiSuccess
     * Handle Transfer Success Flow
     */

    // TODO: refactor this
    onTacSuccess = (response) => {
        const { transferParams } = this.state;
        const responseObject = response;

        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
            },
            () => {
                // Add Completion
                const transactionResponseObject = responseObject;
                // Added All Transaction Status Special cases Handling
                const responseStatus = responseObject?.statusCode ?? "";
                const responseStatusDescription = responseObject?.statusDescription ?? "";
                if (
                    responseStatus === "0" ||
                    responseStatus === "M000" ||
                    responseStatus === "M001" ||
                    responseStatus === "M100" ||
                    responseStatus === "00U1" ||
                    responseStatus === "000" ||
                    responseStatus === "0" ||
                    responseStatus === "Accepted" ||
                    responseStatusDescription === "Accepted"
                ) {
                    const transactionDate = responseObject?.serverDate
                        ? responseObject?.serverDate
                        : null;

                    if (responseObject?.onHold) {
                        transferParams.onHold = responseObject?.onHold;
                        transferParams.transactionResponseError =
                            responseObject?.additionalStatusDescription;
                        transferParams.statusDescription = "Accepted";
                    } else {
                        transferParams.statusDescription =
                            responseObject?.statusDescription === "Accepted"
                                ? "Successful"
                                : responseObject?.statusDescription;
                    }
                    transferParams.additionalStatusDescription =
                        responseObject?.additionalStatusDescription;
                    transferParams.actionFlow = "TAC";
                    transferParams.transactionRefNo = responseObject?.transactionRefNumber;
                    transferParams.transactionRefNumber =
                        responseObject?.formattedTransactionRefNumber;
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

                    // if S2u get Polling Token and Open S2u Model
                    if (this.state.flow === "S2U") {
                        // if S2u get Polling Token and Open S2u Model
                        this.setState(
                            {
                                transferParams,
                            },
                            () => {
                                this.showS2uModal(responseObject, transferParams);
                            }
                        );
                    } else {
                        this.hideTAC();
                        // if TAC Response navigate to Acknowledge Screen
                        transferParams.transactionResponseError =
                            responseObject?.additionalStatusDescription;
                        const screenName = navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN;

                        this.props.navigation.navigate(screenName, {
                            transferParams,
                            transactionReferenceNumber:
                                responseObject?.formattedTransactionRefNumber,
                            errorMessge: "",
                            forwardItem: this.forwardItem,
                            screenDate: this.props.route.params?.screenDate,
                        });
                    }
                } else {
                    const transactionResponseError =
                        responseObject?.additionalStatus ?? WE_FACING_SOME_ISSUE;

                    transferParams.additionalStatusDescription =
                        responseObject?.additionalStatusDescription;
                    transferParams.statusDescription =
                        responseObject?.statusDescription?.toLowerCase() === "success"
                            ? "successful"
                            : responseObject?.statusDescription;
                    transferParams.transactionResponseError = transactionResponseError;
                    transferParams.transactionStatus = false;
                    transferParams.formattedTransactionRefNumber =
                        responseObject?.formattedTransactionRefNumber;
                    this.hideTAC();
                    // if Failed navigate to Acknowledge Screen with Failure message
                    this.props.navigation.navigate(
                        navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                        {
                            transferParams,
                            transactionResponseObject,
                            transactionReferenceNumber: responseObject?.transactionRefNumber ?? "",
                            forwardItem: this.forwardItem,
                            screenDate: this.props.route.params?.screenDate,
                        }
                    );
                }
            }
        );
    };

    /***
     * rtpActionApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA.... rtpActionCallApiFailed
     */
    rtpApiFailed = (error, token) => {
        this.hideTAC();
        const { transferParams } = this.state;

        const { resetModel } = this.props;
        resetModel(["accounts"]);
        const errors = error;
        const errorsInner = error?.error;
        const isAmountIssue = errorsInner?.message?.toLowerCase()?.includes(MAX_LIMIT_ERROR);
        transferParams.statusDescription = errorsInner?.statusDescription ?? "";
        if (errors?.message && !transferParams?.isOnlineBanking) {
            showErrorToast({
                message: errors.message || REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }

        if (errors.status === 428) {
            if (token) {
                this.latestParamsCreated = {
                    ...this.latestParamsCreated,
                    smsTac: token,
                    tac: token,
                };
            }

            this.hideTAC();
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: errorsInner.challenge,
                },
                loader: false,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion:
                    errorsInner && errorsInner.challenge && errorsInner.challenge.questionText
                        ? errorsInner.challenge.questionText
                        : WE_FACING_SOME_ISSUE,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
            }));
        } else if (errors.status === 423) {
            // Display RSA Account Locked Error Message
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showOverlay: false,
                },
                () => {
                    const reason = errorsInner?.statusDescription ?? "";
                    const loggedOutDateTime = errorsInner.serverDate;
                    const lockedOutDateTime = errorsInner.serverDate;
                    this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                        screen: "Locked",
                        params: {
                            reason,
                            loggedOutDateTime,
                            lockedOutDateTime,
                        },
                    });
                }
            );
        } else if (errors.status === 422) {
            // Display RSA Deny Error Message
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showOverlay: false,
                },
                () => {
                    // Add Completion
                    transferParams.transactionStatus = false;
                    transferParams.transactionDate = errorsInner.serverDate;
                    transferParams.error = error;
                    transferParams.transactionResponseError = "";
                    this.hideTAC();
                    this.props.navigation.navigate(
                        navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                        {
                            errorMessge:
                                errorsInner && errorsInner.statusDescription
                                    ? errorsInner.statusDescription
                                    : WE_FACING_SOME_ISSUE,
                            transferParams,
                            transactionReferenceNumber: "",
                            isRsaLock: false,
                            forwardItem: this.forwardItem,
                            screenDate: this.props.route.params?.screenDate,
                        }
                    );
                }
            );
        } else {
            //Handle All other failure cases
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showOverlay: false,
                },
                () => {
                    this.hideTAC();
                    const transferParamsTemp = {
                        ...this.state.transferParams,
                        additionalStatusDescription: errorsInner?.additionalStatusDescription,
                        statusDescription: "unsuccessful",
                        transactionResponseError: isAmountIssue
                            ? PAYMENT_LIMIT_ERROR
                            : errorsInner?.message ?? WE_FACING_SOME_ISSUE,
                        showDesc: isAmountIssue,
                        transactionStatus: false,
                        formattedTransactionRefNumber:
                            errorsInner?.formattedTransactionRefNumber ??
                            errorsInner?.transactionRefNumber,
                        transactionDate: errorsInner?.serverDate ?? "",
                        transferFlow: this.state.transferFlow,
                        errorMessage: this.forwardItem
                            ? "Request forward unsuccessful. Please try again."
                            : transferParams?.isOnlineBanking &&
                              ["Success", "Failed"].includes(errors.message)
                            ? ""
                            : errors.message,
                    };

                    // if Failed navigate to Acknowledge Screen with Failure message
                    this.props.navigation.navigate(
                        navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                        {
                            transferParams: transferParamsTemp,
                            forwardItem: this.forwardItem,
                            screenDate: this.props.route.params?.screenDate,
                        }
                    );
                }
            );
        }
    };

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    showS2uModal = (response, transferParams) => {
        const { formatedFromAccount, selectedAccount, autoDebitEnabled } = this.state || {};

        const { pollingToken, token } = response;
        const s2uTransactionDetails = [];

        s2uTransactionDetails.push({
            label: transferParams?.refundIndicator ? REFUND_TO : TO,
            value: `${formateIDName(this.state.transferParams.senderName, " ", 2)}`,
        });
        s2uTransactionDetails.push({
            label: FROM,
            value: `${selectedAccount.name}\n${formatedFromAccount}`,
        });
        s2uTransactionDetails.push({
            label: TRANSACTION_TYPE,
            value: this.state.transferParams?.refundIndicator
                ? "Refund - DuitNow"
                : this.state.transferParams?.coupleIndicator
                ? "DuitNow & AutoDebit Requests"
                : this.state.transferParams?.isOnlineBanking
                ? RTP_ONLINE_BANKING
                : autoDebitEnabled
                ? "DuitNow AutoDebit"
                : "DuitNow Request",
        });
        s2uTransactionDetails.push({
            label: this.state.transferParams?.refundIndicator ? "Date & time" : "Date",
            value: this.state.transferParams?.isOnlineBanking
                ? getFormatedDateMoments(new Date(), DATE_SHORT_FORMAT)
                : response.serverDate,
        });
        const s2uPollingToken = pollingToken || token || "";

        //Show S2U Model update the payload
        this.setState(
            {
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
                transferParams: {
                    ...this.state.transferParams,
                    onHold: response.onHold,
                    statusDescription: response.onHold
                        ? "Accepted"
                        : response?.statusDescription === "Accepted"
                        ? "Successful"
                        : response.statusDescription,
                    additionalStatusDescription: response?.additionalStatusDescription,
                    transactionResponseError: response?.additionalStatusDescription,
                    actionFlow: "S2U",
                },
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    onS2uDone = (response) => {
        const { transferParams } = this.state;
        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        this.onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            // Show success page

            const { statusDescription, text, status } = s2uSignRespone;
            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription ?? status;
            transferParams.statusCode = s2uSignRespone?.statusCode ?? "";
            transferParams.status = s2uSignRespone?.status ?? "";
            transferParams.transactionResponseError = text;
            transferParams.formattedTransactionRefNumber =
                s2uSignRespone.formattedTransactionRefNumber;
            const screenName = navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN;
            this.props.navigation.navigate(screenName, {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                screenDate: this.props.route.params?.screenDate,
                errorMessge: null,
                forwardItem: this.forwardItem,
            });
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
            // TODO: maybe need to remove transactionId
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
                    message: text || REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
            if (transferParams?.isOnlineBanking) {
                this.cancelOnlineBanking();
            } else {
                this.props.navigation.navigate(
                    navigationConstant.REQUEST_TO_PAY_ACKNOWLEDGE_SCREEN,
                    {
                        transferParams,
                        transactionResponseObject: s2uSignRespone.payload,
                        // TODO: maybe need to remove transactionId
                        transactionReferenceNumber: transactionId,
                        forwardItem: this.forwardItem,
                        screenDate: this.props.route.params?.screenDate,
                    }
                );
            }
        }
    };

    /***
     * onS2uClose
     * close S2u Auth Model
     */
    onS2uClose = () => {
        // will close tac popup
        this.setState({ showS2u: false });
    };

    /***
     * hideTAC
     * Close TAc Model
     */
    hideTAC = () => {
        const { showTAC } = this.state;
        if (showTAC) {
            this.setState({ showTAC: false, showOverlay: false, loader: false });
        }
    };

    _onRightButtonPressEditable = (value, index) => {
        this.setState({
            showEditable: false,
            selectedEditable: value,
        });
    };

    _onLeftButtonPressEditable = () => {
        this.setState({
            showEditable: false,
        });
    };

    /***
     * _onRightButtonPressAccount
     * Close Account Dropdown
     */
    _onRightButtonPressAccount = (value, index) => {
        this.setState({
            accountScrollPickerSelected: true,
            showAccountScrollPickerView: false,
            selectedAccountDescriptionText: value.formatedAccount,
            selectedAccountText: value.accountName,
            selectedAccount: value,
            fromAccount: value.number,
            fromAccountCode: value.code,
            fromAccountName: value.accountName,
            formatedFromAccount: value.formatedAccount,
            selectedAccountItem: value,
        });
    };

    /***
     * _onLeftButtonPressAccount
     * Close Account Dropdown
     */
    _onLeftButtonPressAccount = () => {
        this.setState({
            showAccountScrollPickerView: false,
        });
    };

    /***
     * _onClosePress
     * On Header Close Button Click Event Listener
     */
    _onClosePress = () => {
        const { transferParams } = this.state;

        if (transferParams?.isOnlineBanking) {
            this.setState({
                isPopupDisplay: true,
                popupTitle: "Cancel Payment",
                popupDesc:
                    "Closing this screen means that\nyour payment to the merchant will\nbe incomplete.\n\nWould you like to proceed with\ncancellation of this payment\nrequest?",
                popupPrimaryActionText: "Confirm",
            });
        } else {
            //If Send or Request Money Flow Navigate to Send Money Dashboard
            this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
    };

    /***
     * onChallengeSnackClosePress
     * Handle RSA Challenge close
     */
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    /***
     * onChallengeQuestionSubmitPress
     * Handle RSA Challenge answered call the particular api again
     */
    onChallengeQuestionSubmitPress = (answer) => {
        const {
            challengeRequest: { challenge },
        } = this.state;

        const challengeObj = {
            ...challenge,
            answer,
        };

        this.setState(
            {
                challengeRequest: {
                    ...this.state.challengeRequest,
                    challenge: challengeObj,
                },
                isRSALoader: true,
                RSAError: false,
            },
            () => {
                const params = {
                    ...this.latestParamsCreated,
                    challenge: challengeObj,
                };

                this.latestAPiCalled(params);
            }
        );
    };

    /***
     * _onTeamsConditionClick
     * Open DuitNow Teams and Conditions PDF view
     */
    _onTeamsConditionClick = async () => {
        const navParams = {
            file: termsAndConditionUrl,
            share: false,
            showShare: false,
            type: "url",
            pdfType: "shareReceipt",
            title: "Terms & Conditions",
        };
        // Navigate to PDF viewer to display PDF
        this.props.navigation.navigate(navigationConstant.PDF_VIEWER, navParams);
    };

    /***
     * _onDateEditClick
     * Fund Transfer on Date click open Calender View
     */
    _onDateEditClick = async () => {
        this.setState({
            showDatePicker: true,
        });
    };

    /***
     * hideDatePicker
     * hide Calender picker
     */
    hideDatePicker = () => {
        this.setState({
            showDatePicker: false,
        });
    };

    /***
     * onDateDonePress
     * handle done pressed on Calender picker
     */
    onDateDonePress = (date) => {
        const formatedDate = getFormatedDateMoments(date, DATE_SHORT_FORMAT);
        this.setState({ expiryDateFormatted: formatedDate, expiryDate: date });
        this.hideDatePicker();
    };

    /***
     * _onRecipientReferenceClick
     * On payment Reference click navigate to Reference to get updated reference
     */
    _onRecipientReferenceClick = () => {
        if (this.forwardItem) {
            return;
        }

        const transferParams = this.getRTPBackParams();

        this.props.navigation.push(navigationConstant.REQUEST_TO_PAY_REFERENCE, {
            ...this.props.route.params,
            transferParams,
        });
    };

    /***
     * _onTransferModeClick
     * on Transfer Mode Click update state
     */
    _onAccountDropDownClick = () => {
        const { accountDropDown } = this.state;
        if (accountDropDown && accountDropDown.length > 0) {
            this.setState({
                showAccountScrollPickerView: true,
            });
        }
    };

    /***
     * _onTransferModeClick
     * on Transfer Mode Click update state
     */
    _onEditableDropDownClick = () => {
        const { editableDropDown } = this.state;

        if (editableDropDown && editableDropDown.length > 0) {
            this.setState({
                showEditable: true,
            });
        }
    };

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    getRTPBackParams = () => {
        const { transferParams, selectedAccountItem, paymentDesc, autoDebitEnabled } = this.state;

        transferParams.selectedAccountItem = selectedAccountItem;
        transferParams.paymentDesc = paymentDesc;
        transferParams.autoDebitEnabled = autoDebitEnabled;

        return transferParams;
    };

    getRTPRequestParams = () => {
        const { transferParams, selectedAccountItem, stateData } = this.state;

        const amount = transferParams.amount;
        const transferAmount = transferParams?.amount ? amount.replace(/,/g, "") : "0.00";

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const { rtpType } = this.props.route.params;
        const returnObj = {
            paymentDesc: this.state.paymentDesc,
            receiverAcct: transferParams?.isSendAgain
                ? transferParams?.senderAcct
                : this.forwardItem
                ? this.forwardItem.senderAcct
                : transferParams?.fromAccount,
            requestType: this.forwardItem ? "FORWARD" : "REQUEST",
            accCode: transferParams?.isSendAgain ? "07" : transferParams?.fromAccountCode,
            senderAcct: transferParams?.isSendAgain
                ? transferParams?.receiverAcct
                : transferParams?.toAccount ?? transferParams?.receiverProxyValue,
            senderAcctType: transferParams?.transferAccType,
            senderProxyType: transferParams?.idType ?? transferParams?.receiverProxyType,
            senderProxyValue: transferParams?.idValue ?? transferParams?.receiverProxyValue,
            swiftCode: transferParams?.swiftCode ?? transferParams.bankCode, // if idCode(proxyType) = "CASA" , use swiftCode, others? use bankCode
            trxDate: transferParams?.effectiveDate,
            receiverAcctType: this.forwardItem?.receiverAcctType ?? selectedAccountItem?.type, // S-saving / D-Current / C- creditcard / M - mae account
            senderName: transferParams?.isSendAgain
                ? transferParams?.receiverName
                : transferParams?.isOnlineBanking
                ? transferParams?.senderName
                : transferParams?.nameMasked
                ? transferParams?.actualAccHolderName
                : transferParams?.accHolderName, // get from /duitNow/status/inquiry or /fundTransferInquiry
            reference: this.state.paymentRef,
            mobileSDKData: mobileSDK, // Required For RSA
            amountEditable: transferParams?.amountEditable,
            expiryDateTime: transferParams?.expiryDateTime, //"2022-09-05T02:42:04.766Z",
            email: this.state.notifyEmail,
            sourceOfFunds: transferParams?.sourceOfFunds,
            bankName: formateIDName(transferParams.bankName),
            receiverName:
                transferParams?.isSendAgain || this.forwardItem
                    ? transferParams?.senderName ?? stateData?.forwardItem?.senderName
                    : transferParams?.accHolderName,
            oldSenderName: stateData?.forwardItem?.receiverName, //Required for email forward txn
            oldSenderAcct: stateData?.forwardItem?.receiverAcct, //Required for email forward txn
            oldBankName: stateData?.forwardItem?.bankName, //Required for email forward txn (always Maybank)
            creditorName: stateData?.forwardItem?.senderName, //Required for email forward txn
        };
        if (rtpType !== RTP_AUTODEBIT) {
            returnObj.amount = transferAmount;
        }
        if (transferParams?.isSendAgain) {
            returnObj.transactionType = "COUPLED_REQUEST";
        }
        if (this.forwardItem) {
            returnObj.transactionType = rtpType === RTP_AUTODEBIT ? "COUPLED_FORWARD" : "FORWARD";
        } else if (rtpType === DUITNOW_REQUEST) {
            if (this.state.autoDebitEnabled) {
                if (this.forwardItem) {
                    returnObj.transactionType = "COUPLED_FORWARD";
                } else {
                    returnObj.transactionType = "COUPLED_REQUEST";
                }
            } else {
                returnObj.transactionType = "REQUEST";
            }
        } else if (rtpType === RTP_AUTODEBIT) {
            returnObj.transactionType = "DECOUPLED_REQUEST";
        }
        //new params p2b
        returnObj.consentStartDate = transferParams?.consentStartDate ?? null;
        returnObj.consentExpiryDate = transferParams?.consentExpiryDate ?? null;
        returnObj.consentFrequency = transferParams?.consentFrequency ?? null;
        returnObj.consentMaxLimit = transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null;

        returnObj.productId = transferParams.productId;
        returnObj.merchantId = transferParams.merchantId;
        returnObj.autoDebitEnabled = transferParams?.isSendAgain
            ? true
            : transferParams.autoDebitEnabled;
        returnObj.senderBrn = transferParams?.isSendAgain
            ? this.props.route.params?.merchantDetails?.brn
            : transferParams?.senderBrn ?? "";
        if (this.forwardItem) {
            returnObj.requestId = this.forwardItem.requestId;
        }

        return returnObj;
    };

    getRTPPaymentParams = () => {
        const { transferParams } = this.state;
        const amount = transferParams.amount;
        const transferAmount = transferParams.amount ? amount.replace(/,/g, "") : "0.00";

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const accNumber = transferParams?.fromAccount.replace(/[^0-9]|[ ]/g, "");
        return {
            recipientName: transferParams?.senderName,
            effectiveDate: transferParams?.effectiveDate,
            fromAccount: accNumber?.substring(0, 12), //transferParams?.isOnlineBanking ?  : accNumber,
            fromAccountCode: transferParams?.fromAccountCode,
            paymentRef: this.state.paymentRef,
            toAccount: transferParams?.senderAcct,
            toAccountCode: "000000", // acquirerId - maybe if from fav will have this
            paymentDesc: transferParams?.paymentDesc,
            transferAmount,
            proxyId: transferParams?.idValue.length
                ? transferParams.idValue.replace(/\s/g, "")
                : "",
            proxyIdType: transferParams?.refundIndicator ? "01" : transferParams?.idType, // return 01 if refund indicator true
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
            bankName: transferParams?.originalData?.creditorBankName ?? "",
            email: this.state.notifyEmail,
            debtorName: transferParams?.receiverName,
        };
    };

    getTacParams = () => {
        const { transferParams } = this.state;
        const { isDuitNowOnlineBanking } = this.props?.route?.params || "";
        const amount = transferParams.amount;
        const fromAccountNo = transferParams?.fromAccount;
        const transferAmount =
            transferParams && transferParams.amount ? amount.replace(/,/g, "") : "0.00";

        return {
            amount: transferAmount,
            fromAcctNo: fromAccountNo,
            fundTransferType: transferParams?.refundIndicator
                ? "RTP_REFUND"
                : isDuitNowOnlineBanking
                ? "RTP_REDIRECT"
                : "RTP_TRANSFER",
            accCode: transferParams?.fromAccountCode,
            toAcctNo: transferParams?.senderAcct,
            payeeName:
                transferParams?.requestType === "REJECTED"
                    ? transferParams?.receiverName
                    : transferParams?.senderName,
            bizMsgId: transferParams?.requestId,
        };
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    disableAutoDebit = () => {
        this.setState({ autoDebitEnabled: !this.state.autoDebitEnabled });
    };

    onPress = (title) => {
        const temp = [...this.state.paymentMethods]?.map((el, key) => ({
            ...el,
            isSelected:
                title === el.title && el.key !== "01"
                    ? !this.state.paymentMethods[key]?.isSelected
                    : this.state.paymentMethods[key]?.isSelected,
        }));
        this.setState({ paymentMethods: temp });
    };

    onPopupClosePress = () => {
        this.setState({
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
        });
    };

    onPopupPrimaryActionPress = () => {
        this.setState(
            {
                isPopupDisplay: false,
                popupTitle: "",
                popupDesc: "",
            },
            () => {
                const { transferParams } = this.state;
                if (transferParams?.isOnlineBanking) {
                    this.cancelOnlineBanking();
                } else {
                    this._onConfirmClick();
                }
            }
        );
    };

    cancelOnlineBanking = async () => {
        const { transferParams } = this.state;
        const params = {
            endToEndId: transferParams?.endToEndId,
            merchantId: transferParams?.merchantId ?? "",
        };
        const response = await onlineBkngRedirect(params);
        const result = { ...response?.data };
        if (
            response?.data?.code === "0" ||
            response?.data?.code === "0000" ||
            response?.data?.code === "000"
        ) {
            this.rtpApiSuccess(result);
        } else {
            this.rtpApiFailed(result);
        }
    };

    handleInfoPress = (type) => {
        const infoTitle = type === FREQUENCY ? "Transaction frequency" : "Limit per transaction";
        const infoMessage = type === FREQUENCY ? FREQUENCY_DETAILS : LIMIT_DETAILS;

        this.setState({ infoTitle, infoMessage, showFrequencyInfo: !this.state.showFrequencyInfo });
    };

    // Card number masking
    onCardMasking = (cardNumber) => {
        return cardNumber
            .replace(/.(?=.{4})/g, "*")
            .match(/.{1,4}/g)
            .join(" ");
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            showOverlay,
            transferParams,
            secure2uValidateData,
            autoDebitEnabled,
            transferFlow,
        } = this.state;
        const { soleProp, rtpType, isSendAgain } = this.props.route.params;

        const paymentDescIos =
            this.state.paymentDesc && this.state.paymentDesc.length >= 1
                ? Styles.commonInputConfirmIosText
                : Styles.commonInputConfirmIos;

        const paymentDescAndroid =
            this.state.paymentDesc && this.state.paymentDesc.length >= 1
                ? Styles.commonInputConfirmText
                : Styles.commonInputConfirm;
        const font = {
            color: transferParams?.transferFlow === 25 && !this.forwardItem ? ROYAL_BLUE : BLACK,
            fontFamily: "Montserrat-SemiBold",
            marginRight: 4,
        };
        const inputStyling = [Platform.OS === "ios" ? paymentDescIos : paymentDescAndroid, font];

        const auDebitParams = {
            showProductInfo: isSendAgain,
            autoDebitEnabled:
                transferParams?.isConsentOnlineBanking || isSendAgain ? true : autoDebitEnabled,
            transferParams,
            transferFlow: isSendAgain ? 25 : transferFlow,
            handleInfoPress: this.handleInfoPress,
            item: transferParams,
        };
        const onlineBkngData = {
            isFromAcknowledge: false,
            showDesc: true,
            transactionResponseError:
                "Please refer to the merchant's page for the status of your payment.",
            allowToCancelTimer: this.state.allowToCancelTimer,
        };
        const isEditable =
            transferParams?.refundIndicator || transferParams?.amountEditable === "True";
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={showOverlay}
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={this.state.screenNameAnalytic}
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
                                            <HeaderBackButton onPress={this._onBackPress} />
                                        )
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this._onClosePress} />
                                    }
                                />
                                {transferParams?.isOnlineBanking ? (
                                    <RTPTimer
                                        time={timeDifference(transferParams.timeInSecs, 4)}
                                        cancelTimeout={
                                            this.state.allowToCancelTimer &&
                                            this.props.navigation.isFocused()
                                        }
                                        cancelOnlineBanking={this.cancelOnlineBanking}
                                        terminate={!this.state.allowToCancelTimer}
                                        navigation={this.props.navigation}
                                        params={{
                                            transferParams: {
                                                ...transferParams,
                                                ...onlineBkngData,
                                            },
                                            transactionReferenceNumber: "",
                                            errorMessge: "Request timeout",
                                            screenDate: this.props.route.params?.screenDate,
                                        }}
                                    />
                                ) : null}
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
                                                transferParams?.isOnlineBanking
                                                    ? transferParams?.merchantName
                                                    : this.state.transferFlow === 25 && !isSendAgain
                                                    ? transferParams.accHolderName
                                                    : transferParams.senderName
                                            }
                                            subtitle={
                                                this.state.transferFlow === 25 ||
                                                transferParams?.coupleIndicator
                                                    ? this.onCardMasking(
                                                          `${
                                                              transferParams?.coupleIndicator
                                                                  ? transferParams?.senderAcct
                                                                  : transferParams?.idValue
                                                          }`
                                                      )
                                                    : ""
                                            }
                                            image={{
                                                type: "local",
                                                source: Assets.icDuitNowCircle,
                                            }}
                                            isVertical={
                                                rtpType !== RTP_AUTODEBIT &&
                                                !transferParams?.isConsentOnlineBanking
                                            }
                                        />
                                        {!transferParams?.isConsentOnlineBanking ? (
                                            isEditable || isSendAgain ? (
                                                <View style={Styles.amountCenterConfirm}>
                                                    <TouchableOpacity
                                                        onPress={this._onEditAmount}
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
                                                            text={`${CURRENCY}${
                                                                transferParams?.amount ?? ""
                                                            }`}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={Styles.editIconViewTransfer}>
                                                    <Typography
                                                        fontSize={24}
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={31}
                                                        textAlign="center"
                                                        color={BLACK}
                                                        text={`${CURRENCY}${transferParams?.amount}`}
                                                    />
                                                </View>
                                            )
                                        ) : null}
                                        {rtpType === RTP_AUTODEBIT ||
                                        transferParams?.isConsentOnlineBanking ? (
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
                                        ) : null}
                                        {!transferParams?.isConsentOnlineBanking && !isSendAgain ? (
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
                                        ) : null}
                                        {isSendAgain ? (
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
                                                <View style={Styles.viewRowRightItem}>
                                                    <TouchableOpacity
                                                        onPress={this._onDateEditClick}
                                                        testID="txtSELECT_date"
                                                        accessibilityLabel="txtSELECT_date"
                                                        disabled={!soleProp}
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
                                                            text={this.state.expiryDateFormatted}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}

                                        {isSendAgain ||
                                        (!transferParams?.isOnlineBanking &&
                                            transferParams?.refundIndicator) ? (
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
                                                    {isSendAgain ? (
                                                        <TouchableOpacity
                                                            onPress={
                                                                this._onRecipientReferenceClick
                                                            }
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
                                                            text={transferParams.reference}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        ) : null}
                                        {!transferParams?.coupleIndicator &&
                                            !transferParams?.refundIndicator &&
                                            !transferParams?.isOnlineBanking &&
                                            transferParams?.requestId && (
                                                <View style={Styles.viewRow2}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text={
                                                                transferParams?.refundIndicator
                                                                    ? RTP_REQUEST_ID
                                                                    : REFERENCE_ID
                                                            }
                                                        />
                                                    </View>
                                                    <View style={Styles.viewRowRightItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={
                                                                formateReqIdNumber(
                                                                    transferParams.requestId
                                                                ) ?? ""
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        {transferParams?.refundIndicator &&
                                        transferParams?.productInfo?.productName ? (
                                            <View style={Styles.viewRow2}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={PRODUCT_NAME}
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItem}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        color={BLACK}
                                                        text={
                                                            transferParams?.productInfo?.productName
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        ) : null}
                                        {/* MRP-8827 RTP Expiry date */}
                                        {!transferParams?.refundIndicator &&
                                        !transferParams?.coupleIndicator &&
                                        !transferParams?.isOnlineBanking &&
                                        ((soleProp &&
                                            this.state.transferFlow === 25 &&
                                            this.state?.expiryDateFormatted) ||
                                            this.forwardItem?.expiryDate ||
                                            (this.state.transferFlow === 26 &&
                                                transferParams?.expiryDate)) ? (
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
                                                <View style={Styles.viewRowRightItem}>
                                                    {this.state.transferFlow === 26 ||
                                                    this.forwardItem?.expiryDate ? (
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typography
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={
                                                                    transferParams?.expiryDate ??
                                                                    getFormatedDateMoments(
                                                                        this.forwardItem
                                                                            ?.expiryDate,
                                                                        DATE_SHORT_FORMAT
                                                                    )
                                                                }
                                                            />
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={this._onDateEditClick}
                                                            testID="txtSELECT_date"
                                                            accessibilityLabel="txtSELECT_date"
                                                            disabled={!soleProp}
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
                                                                text={
                                                                    this.state.expiryDateFormatted
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        ) : null}
                                        {this.forwardItem?.senderName && (
                                            <View style={Styles.viewRow}>
                                                <View style={Styles.viewRowLeftItem}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Request initiator"
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
                                                        text={this.forwardItem?.senderName}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {!transferParams?.refundIndicator &&
                                        (parseFloat(transferParams?.amount) > 5000.0 ||
                                            transferParams?.serviceFee > 0) &&
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
                                                        text={`RM ${transferParams?.serviceFee?.toFixed(
                                                            2
                                                        )}`}
                                                    />
                                                </View>
                                            </View>
                                        ) : null}

                                        {isSendAgain ||
                                        (!transferParams?.refundIndicator &&
                                            parseFloat(transferParams?.amount) <= 5000.0 &&
                                            transferParams?.serviceFee === 0 &&
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
                                                        text="RM 0.00"
                                                    />
                                                </View>
                                            </View>
                                        ) : null}

                                        {rtpType !== RTP_AUTODEBIT &&
                                        !isSendAgain &&
                                        !autoDebitEnabled &&
                                        !transferParams?.refundIndicator ? (
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
                                                        disabled={
                                                            this.state.transferFlow === 26 ||
                                                            this.forwardItem
                                                        }
                                                        onPress={this._onRecipientReferenceClick}
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
                                                                this.state.transferFlow === 26 ||
                                                                this.forwardItem
                                                                    ? BLACK
                                                                    : ROYAL_BLUE
                                                            }
                                                            text={transferParams.reference}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}
                                        {(transferParams?.refundIndicator ||
                                            transferParams?.isOnlineBanking) &&
                                            !transferParams?.isConsentOnlineBanking &&
                                            transferParams?.requestId && (
                                                <View style={Styles.viewRow2}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text={
                                                                transferParams?.isOnlineBanking
                                                                    ? "Transaction ID"
                                                                    : RTP_REQUEST_ID
                                                            }
                                                        />
                                                    </View>
                                                    <View style={Styles.viewRowRightItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={
                                                                formateReferenceNumber(
                                                                    transferParams.requestId
                                                                ) ?? ""
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}

                                        {this.state.transferFlow === 25 &&
                                            !transferParams?.isOnlineBanking &&
                                            !this.forwardItem &&
                                            transferParams.idTypeText === "Account number" &&
                                            transferParams?.bankName && (
                                                <View style={Styles.viewRow}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={REQUEST_VIA}
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
                                                            text={transferParams.bankName}
                                                        />
                                                    </View>
                                                </View>
                                            )}

                                        {isSendAgain ||
                                        (rtpType !== RTP_AUTODEBIT &&
                                            !this.forwardItem &&
                                            this.state.transferFlow === 25) ? (
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
                                                        text={
                                                            isSendAgain
                                                                ? RECIPIENT_CAN_EDIT_AMOUNT_SM
                                                                : AMOUNT_EDITABLE
                                                        }
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItem}>
                                                    {this.state.transferFlow === 25 ||
                                                    isSendAgain ? (
                                                        <TouchableOpacity
                                                            onPress={this._onEditableDropDownClick}
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
                                                                text={
                                                                    this.state.selectedEditable
                                                                        ?.name
                                                                }
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
                                                            text={this.state.selectedEditable?.name}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        ) : null}
                                        {/* MRP-8827 Request amount -> only if amount is editable (flag from BE) */}
                                        {transferParams?.requestedAmount &&
                                            transferParams?.requestedAmount !==
                                                transferParams?.amount && (
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
                                                            text={REQUESTED_AMOUNT}
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
                                                            text={`${CURRENCY}${
                                                                transferParams?.requestedAmount ??
                                                                "0.00"
                                                            }`}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        {!transferParams?.refundIndicator &&
                                        ((this.forwardItem && this.forwardItem?.paymentDesc) ||
                                            isSendAgain ||
                                            (!this.forwardItem &&
                                                (this.state.transferFlow === 25 ||
                                                    this.state.paymentDesc ||
                                                    transferParams?.paymentDesc))) ? (
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
                                                    {this.forwardItem?.paymentDesc ||
                                                    (transferParams?.paymentDesc &&
                                                        this.state.transferFlow === 26 &&
                                                        !isSendAgain) ? (
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            maxLength={20}
                                                            text={
                                                                transferParams?.paymentDesc ??
                                                                this.forwardItem?.paymentDesc
                                                            }
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            disabled={!!this.forwardItem}
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
                                                            onSubmitEditing={
                                                                this._onPaymentOptionTextDone
                                                            }
                                                            value={this.state.paymentDesc}
                                                            onChangeText={
                                                                this._onPaymentOptionTextChange
                                                            }
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        ) : null}
                                        {isSendAgain ||
                                        (!transferParams?.refundIndicator &&
                                            !transferParams?.isConsentOnlineBanking &&
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
                                                        text="Notify via email"
                                                    />
                                                </View>
                                                <View style={Styles.viewRowRightItemOption}>
                                                    {isSendAgain ? (
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            maxLength={20}
                                                            text={this.state.notifyEmail}
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
                                                            onSubmitEditing={
                                                                this._onEmailOptionTextDone
                                                            }
                                                            value={this.state.notifyEmail}
                                                            onChangeText={
                                                                this._onEmailOptionTextChange
                                                            }
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        ) : null}

                                        <View style={Styles.lineConfirm} />

                                        {isSendAgain ? (
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
                                        ) : null}

                                        {this.state.transferFlow === 25 &&
                                            !this.forwardItem &&
                                            !isSendAgain && (
                                                <View>
                                                    <View style={Styles.viewRowDescriberItem}>
                                                        <View style={Styles.viewRowDescriberOne}>
                                                            <Typography
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color={BLACK}
                                                                text={PAY_TO}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View style={Styles.viewRowAccountDropdown}>
                                                        <Dropdown
                                                            title={this.state.selectedAccountText}
                                                            descriptionText={
                                                                this.state
                                                                    .selectedAccountDescriptionText
                                                            }
                                                            disable={false}
                                                            align="left"
                                                            testID="transferMode"
                                                            accessibilityLabel="transferMode"
                                                            borderWidth={0.5}
                                                            onPress={this._onAccountDropDownClick}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        {(soleProp || isSendAgain) &&
                                        !isEmpty(this.state.paymentMethods) ? (
                                            <View style={Styles.mt10}>
                                                <Typography
                                                    text="Accepted payment methods"
                                                    fontWeight="400"
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    style={Styles.mb20}
                                                />
                                                {this.state.paymentMethods?.map((value, index) => {
                                                    const { title, isSelected } = value;
                                                    return (
                                                        <View
                                                            key={value?.key}
                                                            style={Styles.listItem}
                                                        >
                                                            <RadioButton
                                                                {...this.props}
                                                                key={`radio-${value?.key}`}
                                                                title={title}
                                                                isSelected={isSelected}
                                                                onRadioButtonPressed={() =>
                                                                    this.onPress(title)
                                                                }
                                                                fontSize={14}
                                                            />
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        ) : null}

                                        <View style={Styles.viewRowDescriberItem}>
                                            {this.state.transferFlow === 26 && (
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
                                                            text={
                                                                transferParams?.coupleIndicator
                                                                    ? AUTODEBIT_NOTE
                                                                    : MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}
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
                                                <TouchableOpacity
                                                    onPress={this._onTeamsConditionClick}
                                                >
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
                                                            style={
                                                                commonStyles.termsConditionsLabel2
                                                            }
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

                                {this.state.transferFlow === 26 && (
                                    <View style={Styles.accList}>
                                        <AccountList
                                            title={
                                                transferParams?.isConsentOnlineBanking
                                                    ? "Pay AutoDebit from"
                                                    : transferParams?.refundIndicator
                                                    ? REFUND_FROM
                                                    : PAY_FROM
                                            }
                                            data={this.state.accounts}
                                            onPress={this._onAccountListClick}
                                            extraData={this.state}
                                            paddingLeft={24}
                                        />
                                    </View>
                                )}
                            </React.Fragment>
                        </ScrollView>

                        {this.state.transferFlow === 26 ? (
                            <View style={Styles.footerButton}>
                                <ActionButton
                                    disabled={this.state.loader || this.state.disableBtn}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this._coupledCheck}
                                    backgroundColor={
                                        this.state.loader || this.state.disableBtn
                                            ? DISABLED
                                            : YELLOW
                                    }
                                    componentCenter={
                                        <Typography
                                            color={
                                                this.state.loader || this.state.disableBtn
                                                    ? DISABLED_TEXT
                                                    : BLACK
                                            }
                                            text={
                                                transferParams?.refundIndicator
                                                    ? REFUND_NOW
                                                    : transferParams?.coupleIndicator
                                                    ? PAY_NOW_CONTINUE
                                                    : PAY_NOW
                                            }
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        ) : (
                            <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                                <ActionButton
                                    disabled={
                                        this.state.loader ||
                                        (this.state.transferFlow === 25 &&
                                            !this.state.accountDropDown?.length)
                                    }
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this._coupledCheck}
                                    backgroundColor={
                                        this.state.loader || this.state.disableBtn
                                            ? DISABLED
                                            : YELLOW
                                    }
                                    componentCenter={
                                        <Typography
                                            color={
                                                this.state.loader || this.state.disableBtn
                                                    ? DISABLED_TEXT
                                                    : BLACK
                                            }
                                            text={this.forwardItem ? FORWARD_NOW : SEND_NOW}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        )}
                    </ScreenLayout>

                    {this.state.showDatePicker && (
                        <DatePicker
                            showDatePicker={this.state.showDatePicker}
                            onCancelButtonPressed={this.hideDatePicker}
                            onDoneButtonPressed={this.onDateDonePress}
                            dateRangeStartDate={moment(new Date()).add(1, "day")}
                            dateRangeEndDate={moment(new Date()).add(4, "months")}
                            defaultSelectedDate={moment(this.state.expiryDate).toDate()}
                        />
                    )}
                    <ChallengeQuestion
                        loader={this.state.isRSALoader}
                        display={this.state.isRSARequired}
                        displyError={this.state.RSAError}
                        questionText={this.state.challengeQuestion}
                        onSubmitPress={this.onChallengeQuestionSubmitPress}
                        onSnackClosePress={this.onChallengeSnackClosePress}
                    />
                    {this.state.showS2u && (
                        <Secure2uAuthenticationModal
                            token={this.state.pollingToken}
                            amount={this.state.transferParams.amount}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            transactionDetails={this.state.s2uTransactionDetails}
                            s2uPollingData={secure2uValidateData}
                            extraParams={{
                                metadata: { txnType: "RTP_TRANSFER" },
                            }}
                        />
                    )}

                    {this.state.showTAC && (
                        <TacModal
                            transferApi={
                                this.state.transferParams?.isOnlineBanking
                                    ? fundTransferOnlineBkngApi
                                    : fundTransferApi
                            }
                            transferAPIParams={this.state.apiTransferParams}
                            tacParams={this.state.tacParams}
                            validateByOwnAPI={false}
                            onTacClose={this.hideTAC}
                            onTacSuccess={this.onTacSuccess}
                            onTacError={
                                this.state.transferParams?.isOnlineBanking
                                    ? this.cancelOnlineBanking
                                    : this.rtpApiFailed
                            }
                        />
                    )}

                    <ScrollPickerView
                        showMenu={this.state.showAccountScrollPickerView}
                        list={this.state.accountDropDown}
                        onRightButtonPress={this._onRightButtonPressAccount}
                        onLeftButtonPress={this._onLeftButtonPressAccount}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                    <ScrollPickerView
                        showMenu={this.state.showEditable}
                        list={this.state.editableDropDown}
                        onRightButtonPress={this._onRightButtonPressEditable}
                        onLeftButtonPress={this._onLeftButtonPressEditable}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                    <Popup
                        visible={this.state.isPopupDisplay}
                        title={this.state.popupTitle}
                        description={this.state.popupDesc}
                        onClose={this.onPopupClosePress}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this.onPopupClosePress,
                        }}
                        primaryAction={{
                            text: this.state.popupPrimaryActionText,
                            onPress: this.onPopupPrimaryActionPress,
                        }}
                        hideCloseButton={!transferParams?.isOnlineBanking}
                    />
                    <Popup
                        visible={this.state.showFrequencyInfo}
                        title={this.state.infoTitle}
                        description={this.state.infoMessage}
                        onClose={this.handleInfoPress}
                    />
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default withModelContext(RequestToPayConfirmationScreen);

import { isEmpty } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    Linking,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { timeDifference } from "@screens/ATMCashout/helper";
import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

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

import { withModelContext } from "@context";

import {
    consentRedirectUpdate,
    bankingGetDataMayaM2u,
    autoDebitAcceptance,
    consentRequest,
    consentApproval,
    consentStatus,
    consentIncomingRequest,
    nonMonetoryValidate,
    senderDetails,
    invokeL3,
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
import { getAllAccountSubUrl, idMapProxy, termsAndConditionUrl } from "@constants/data/DuitNowRPP";
import * as FundConstants from "@constants/fundConstants";
import {
    SECURE2U_IS_DOWN,
    AMOUNT_ERROR,
    WE_FACING_SOME_ISSUE,
    CONFIRMATION,
    OPTIONAL1,
    RECIPIENT_REFERENCE,
    PAYMENT_DETAILS,
    DECLARATION,
    I_HEREBY_DECLARE_DUIT_NOW,
    APPROVE_AD,
    TERMS_CONDITIONS,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
    MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT,
    NOTES1,
    REQUEST_EXPIRY_DATE,
    FREQUENCY,
    PLEASE_REMOVE_INVALID_EMAIL,
    SERVICE_FEE_CONFIRM,
    FREQUENCY_DETAILS,
    LIMIT_DETAILS,
    COMMON_ERROR_MSG,
    PAY_TO,
    PAY_FROM,
    DATE_AND_TIME,
    SERVER_OTHER_ERROR,
    SERVICE_FEES,
    SEND_NOW,
    ONLINE_BANKING_CONFIRM_POP_UP_TITLE,
    ONLINE_BANKING_CONFIRM_POP_UP_DESC,
    CONFIRM,
    CANCEL,
    CONSENT_REGISTER_DEBTOR,
    CONSENT_REQ_PROXY_CREDITOR,
    CONSENT_REQ_ACC_CREDITOR,
    DATE_SHORT_FORMAT2,
    CREDIT_CARD,
    START_DATE_PASSED,
} from "@constants/strings";

import { paymentDetailsRegex, getFormatedDateMoments, validateEmail } from "@utils/dataModel";
import { toTitleCase } from "@utils/dataModel/rtdHelper";
import {
    formateAccountNumber,
    formateIDName,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import AutoDebitCard from "./AutoDebitCard";
import RTPTimer from "./RTPTimer";

export const { width, height } = Dimensions.get("window");
class ADConfirmation extends Component {
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
        this.state = {
            transferFlow: 27,
            accounts: [],
            editableDropDown: [
                { code: "yes", name: "Yes" },
                { code: "no", name: "No" },
            ],
            loader: false,
            duitNowRecurring: false,
            selectedAccount: null,
            showOverlay: false,
            errorMessage: "",
            transferParams: {},
            primaryAccount: "",
            fromAccount: "",
            fromAccountName: "",
            formatedFromAccount: "",
            stateData: {},
            reference: "",
            showDatePicker: false,
            expiryDate: moment(new Date()).add(this.props.route.params?.soleProp ? 14 : 7, "day"),
            expiryDateFormatted: getFormatedDateMoments(
                moment(new Date()).add(14, "day"),
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
            showEditable: false,
            accountDropDown: [],
            notifyEmail: "",
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupPrimaryActionText: "Continue",
            infoTitle: "",
            infoMessage: "",
            showFrequencyInfo: false,
            paymentMethods: [
                { key: "01", title: "Saving & current account", isSelected: true },
                { key: "02", title: CREDIT_CARD, isSelected: true },
                { key: "03", title: "E-Wallet", isSelected: true },
            ],
            disableBtn: false,
            originalData: {},
            primaryAccountName: "",
            selectedAccNum: {},
            msgId: {},

            //cancel online banking timer
            allowToCancelTimer: true,
            scnSndrId: "",
            scnSndrIc: "",
            lastAPIDetails: {
                params: null,
                apiCalled: null,
            },
            rsaObject: {
                showRSA: false,
                errorObj: null,
                postCallback: this.makeAPICall,
                navigation: this.props.navigation,
            },

            countryCode: "",
            userName: "",
        };
    }

    makeAPICall = (params) => {
        const { lastAPIDetails } = this.state || {};
        const rsaObject = {
            ...this.state.rsaObject,
            showRSA: false,
            errorObj: null,
        };
        this.setState({ rsaObject });

        lastAPIDetails.apiCalled(params);
    };

    _requestL2Permission = async () => {
        try {
            const response = await invokeL3();
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    init = async () => {
        const { isPostPassword } = this.props.getModel("auth");
        if (!isPostPassword) {
            const request = await this._requestL2Permission();
            if (!request) {
                this.props.navigation.goBack();
            }
        }
    };

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this.init();
        this.showLoader(true);
        this._updateDataInScreenAlways();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.onFocusScreenUpdate();
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    componentDidUpdate(prevData) {
        if (prevData.route.params?.isEdit !== this.props.route.params?.isEdit) {
            this.getAllAccounts();
        }
    }

    onFocusScreenUpdate = async () => {
        const transferParams = this.props.route.params?.transferParams;
        if (!transferParams?.productId && this.props.route.params?.productId) {
            transferParams.productId =
                this.props.route.params?.productId ?? transferParams?.productId;
            transferParams.merchantId =
                this.props.route.params?.merchantId ?? transferParams?.merchantId;
        }

        if (
            transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            transferParams?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR ||
            transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR
        ) {
            let accNumber =
                transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                    ? transferParams?.senderAcct
                    : transferParams?.receiverAcct;
            if (!accNumber) {
                const { merchantInquiry } = this.props.getModel("rpp");
                accNumber = merchantInquiry?.accNo;
            }

            this.setState({
                selectedAccNum: accNumber,
            });
        }

        transferParams.timeInSecs = new Date().getTime();
        this.setState(
            {
                reference: transferParams?.reference ?? this.state.reference,
                transferParams,
                transferFlow: transferParams?.transferFlow ?? this.state.transferFlow,
                paymentDesc: transferParams.paymentDesc ?? this.state.paymentDesc,
                notifyEmail: transferParams.notifyEmail ?? this.state.notifyEmail,
                expiryDate: transferParams.expiryDate ?? this.state.expiryDate,
                expiryDateFormatted:
                    transferParams.expiryDateFormatted ?? this.state.expiryDateFormatted,
            },
            () => {
                if (this.state.transferFlow === 29 || this.state.transferFlow === 28) {
                    RTPanalytics.screenLoadABApproveDetail();
                } else if (this.state.transferFlow === 27) {
                    RTPanalytics.screenLoadADReviewDetails();
                }
                this.commonToast();
            }
        );
    };

    /**
     *_updateDataInScreenAlways
     * @memberof ADConfirmation
     */
    _updateDataInScreenAlways = async () => {
        // get transferParams for screen data
        const transferParams = this.props.route.params?.transferParams;
        // get Payment method flow TAC / S2U Data from Validate Api
        const secure2uValidateData = this.props.route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };
        const user = this.props.getModel("user");
        const userName = user?.cus_name;
        const duitNowRecurring = transferParams?.duitNowRecurring ?? false;
        const selectedAccount = transferParams?.selectedAccount ?? null;
        const stateData = !this.state.stateData
            ? this.props?.route?.params
            : this.props?.route?.params?.params;
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

        // update source of funds from fpx, source of fund renew autodebit request is from bts listing
        const sourceFunds = this.props.route.params?.sourceFunds
            ? this.props.route.params?.sourceFunds?.split(/(..)/g).filter((s) => s)
            : this.props.route?.params?.sourceOfFunds
            ? this.props.route?.params?.sourceOfFunds.replace(/(\[")|("])/g, "")
            : "";

        let paymentMethods = [];
        if (!isEmpty(sourceFunds)) {
            paymentMethods = [...this.state.paymentMethods]?.filter((el) =>
                sourceFunds.includes(el?.key)
            );
        }
        if (this.props.route.params?.isAmountHigher || parseFloat(transferParams.amount) > 5000.0) {
            transferParams.serviceFee = 0.5;
        }
        let resData = "";
        let idType = "";
        const { getModel, updateModel } = this.props || {};
        const senderDetailsContext = getModel("rpp")?.senderDetails;
        //if senderDetails not in context initiate api call
        if (senderDetailsContext?.apiCalled === false) {
            const response = await senderDetails();
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

        // update Transfer Params data to state
        this.setState(
            {
                duitNowRecurring,
                selectedAccount,
                loader: false,
                showOverlay: false,
                transferParams,
                transferFlow: transferParams?.transferFlow ?? this.state.transferFlow,
                errorMessage: AMOUNT_ERROR,
                flow,
                stateData,
                reference: transferParams?.reference ?? this.state.reference,
                paymentDesc: transferParams.paymentDesc ?? this.state.paymentDesc,
                notifyEmail: transferParams.notifyEmail ?? this.state.notifyEmail,
                secure2uValidateData,
                paymentMethods,
                expiryDate: transferParams.expiryDate ?? this.state.expiryDate,
                expiryDateFormatted:
                    transferParams.expiryDateFormatted ?? this.state.expiryDateFormatted,
                scnSndrId: resData?.sdrId,
                scnSndrIc: resData?.newICNumber,
                countryCode: resData?.idCountryCode,
                usrDbrtScndType: idType.code,
                userName,
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
        const { transferParams } = this.props.route.params || {};
        const { getModel, updateModel } = this.props;
        const { cus_type } = getModel("user");

        if (!isEmpty(transferParams?.primaryAccount?.number) && cus_type !== "02") {
            this.setState(
                {
                    primaryAccount: transferParams?.primaryAccount?.number,
                    primaryAccountName: transferParams?.primaryAccount?.name,
                },
                () => {
                    //set selected Account
                    this._setSelectFromAccount(transferParams?.accountListings);
                }
            );
        } else {
            try {
                const userAccountsContext = getModel("userAccounts");

                if (userAccountsContext?.apiCalled) {
                    //if userAccountsContext in context initiate api call
                    this.updateSelectedAccount(userAccountsContext?.accountListings);
                } else {
                    //get the user accounts
                    const response = await bankingGetDataMayaM2u(getAllAccountSubUrl, false);
                    if (response?.data?.code === 0) {
                        const { accountListings } = response?.data?.result ?? [];
                        if (accountListings?.length > 0) {
                            updateModel({
                                userAccounts: { accountListings, apiCalled: true },
                            });
                            this.updateSelectedAccount(accountListings);
                        }
                    }
                }
            } catch (error) {
                // error when retrieving the data
                this.showLoader(false);
            }
        }
    };

    updateSelectedAccount = (accountListings) => {
        const { getModel } = this.props;
        const { merchantInquiry } = getModel("rpp");
        const { cus_type } = getModel("user");
        let listWithPrimaryAcc;
        //get from Account
        if (cus_type === "02") {
            // soleprop
            listWithPrimaryAcc = accountListings.filter((acc) => {
                return acc?.number.substring(0, 12) === merchantInquiry?.accNo;
            });
        } else {
            listWithPrimaryAcc = accountListings.filter((acc) => {
                return acc?.primary;
            });
        }
        const primaryAccount = listWithPrimaryAcc?.[0]?.number;
        const primaryAccountName = listWithPrimaryAcc?.[0]?.name;
        this.setState(
            {
                primaryAccount,
                primaryAccountName,
            },
            () => {
                //set selected Account
                this._setSelectFromAccount(accountListings);
            }
        );
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
        const item = this.props?.route?.params?.transferParams;
        const { transferParams, primaryAccount } = this.state || {};
        const accountDropDown = [];
        const targetSelectedAccounts = [];
        const nonSelectedAccounts = [];
        try {
            const fromAccountTempSelected = transferParams?.fromAccount ?? primaryAccount;
            const tempArray = newAccountList.slice();
            const accountsArray = tempArray.map((accountItem, index) => {
                //Compare from Account with account number and marked as selected
                if (
                    fromAccountTempSelected?.substring(0, 12) !==
                    accountItem?.number?.substring(0, 12)
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
                        accountItem?.number?.substring(0, 12),
                    description: accountItem?.number,
                    type:
                        fromAccountTempSelected?.substring(0, 12) ===
                            accountItem?.number?.substring(0, 12) && accountItem?.type,
                };
                accountDropDown.push({
                    ...accUpdated,
                    formatedAccount: formateAccountNumber(accountItem?.number, 12),
                    name: `${accountItem?.name} \n ${formateAccountNumber(
                        accountItem?.number,
                        12
                    )} \n`,
                    accountName: accountItem?.name,
                });
                return accUpdated;
            });
            const selectedAccount = accountsArray.filter((selectedAcc) => {
                return selectedAcc.isSelected === true;
            });

            const ABselectedAcc = accountsArray.filter((item) => {
                return item?.number.substring(0, 12) === this.state.selectedAccNum;
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
            if (targetSelectedAccounts?.length < 1) {
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
                    disableBtn: false,
                    fromAccount,
                    fromAccountName,
                    formatedFromAccount,
                    accounts:
                        item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                            ? ABselectedAcc
                            : targetSelectedAccounts,
                    selectedAccount: selectedAccountObj,
                    transferParams: newTransferParams,
                    accountDropDown,
                    selectedAccountItem: selectedAccountObj,
                },
                () => {
                    this.showLoader(false);
                }
            );
        } catch (e) {
            showErrorToast({ message: e?.message ?? COMMON_ERROR_MSG });
        }
    };

    /***
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    _onAccountListClick = (item) => {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        const selectedAcc = item;
        if (!(parseFloat(item.acctBalance) <= 0.0 && itemType === "account")) {
            const tempArray = this.state.accounts;
            for (let i = 0; i < tempArray?.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
                tempArray[i].isSelected = tempArray[i].selected;
            }
            this.setState({
                disableBtn: this.state.disableBtn,
                accounts: tempArray,
                selectedAccount: selectedAcc,
                fromAccount: item.number,
                fromAccountName: item.name,
                formatedFromAccount: formateAccountNumber(item.number, 12),
                selectedAccountItem: selectedAcc,
            });
        }
    };

    /***
     * _onPaymentOptionTextChange
     * Notes / Payment option text change listener
     */
    _onPaymentOptionTextChange = (text) => {
        const disableBtn = !!(text?.length > 0 && text?.length < 3);
        this.setState({ paymentDesc: text || null, disableBtn });
    };

    _onEmailOptionTextChange = (text) => {
        this.setState({ notifyEmail: text || null });
    };

    /***
     *_onPaymentOptionTextDone
     * Notes / Payment option keyboard Done click listener
     */
    _onPaymentOptionTextDone = () => {};
    _onEmailOptionTextDone = (text) => {
        this.setState({ notifyEmail: text || null });
    };

    getOnlineBankingParams = () => {
        RTPanalytics.duitNowOnlineBankingReview();
        const { transferParams } = this.props.route.params || {};
        const { selectedAccount, countryCode, usrDbrtScndType, userName } = this.state || {};
        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");

        const UsrScndId = this.state.scnSndrId || this.state.scnSndrIc;
        const checkPassport = usrDbrtScndType === "03" ? UsrScndId + countryCode : UsrScndId;

        const twoFAType =
            this.state.flow === "S2U" ? FundConstants.TWO_FA_TYPE_SECURE2U_PULL : undefined;
        return {
            twoFAType,
            creditorName: transferParams?.creditorName,
            debtorName: userName,
            sourceOfFunds: transferParams?.sourceOfFunds,
            consentExpiryDate: transferParams?.consentExpiryDate,
            consentStartDate: transferParams?.consentStartDate,
            consentSts: "ACTV",
            debtorScndVal: checkPassport,
            debtorScndType: usrDbrtScndType,
            debtorVal: m2uPhoneNumber,
            debtorType: "05",
            debtorAcctNum: selectedAccount?.number?.substring(0, 12),
            debtorAcctType: selectedAccount?.type,
            debtorAcctName: selectedAccount?.name,
            consentId: transferParams?.consentId,
            canTrmByDebtor: transferParams?.canTrmByDebtor,
            consentFrequency: transferParams?.consentFrequency,
            amount: transferParams?.amount,
            consentTp: transferParams?.consentTp,
            expiryDateTime: moment(transferParams?.expiryDateTime),
            refs1: transferParams?.refs1,
            reserved1: transferParams?.reserved1,
            merchantId: transferParams?.merchantId,
        };
    };

    getConsentRedirectUpdate = async () => {
        const { transferParams } = this.props?.route?.params ?? null;
        const { selectedAccount } = this.state;
        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");
        const result = {
            creditorName: transferParams?.creditorName,
            debtorName: transferParams?.debtorName,
            sourceOfFunds: transferParams?.sourceOfFunds,
            consentExpiryDate: transferParams?.consentExpiryDate,
            consentStartDate: transferParams?.consentStartDate,
            consentSts: "RJCT",
            debtorScndVal: m2uPhoneNumber,
            debtorScndType: "05",
            debtorVal: m2uPhoneNumber,
            debtorType: "05",
            debtorAcctNum: selectedAccount?.number?.substring(0, 12),
            debtorAcctType: selectedAccount?.type,
            debtorAcctName: selectedAccount?.name,
            consentId: transferParams?.consentId,
            canTrmByDebtor: transferParams?.canTrmByDebtor,
            consentFrequency: transferParams?.consentFrequency,
            amount: transferParams?.amount,
            consentTp: transferParams?.consentTp,
            expiryDateTime: moment(transferParams?.expiryDateTime),
            refs1: transferParams?.refs1,
            reserved1: transferParams?.reserved1,
            merchantId: transferParams?.merchantId,
        };

        try {
            const response = await consentRedirectUpdate(result);
            if (
                response?.data?.result?.statusCode === "0" ||
                response?.data?.result?.statusCode === "000"
            ) {
                if (transferParams?.isConsentOnlineBanking) {
                    this.props.navigation.replace(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                        screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                    });
                }
                Linking.openURL(response?.data?.result?.merchantUrl);
            }
        } catch (error) {
            showErrorToast({
                message: error?.message === "Success" ? "Failed" : error?.message,
            });
        }
    };

    /**
     *_onConfirmClick
     * @memberof ADConfirmation
     *
     * transferFlow === 27 --> Request Autodebit
     * transferFlow === 28 --> Update Autodebit Status
     */
    _onConfirmClick = async () => {
        try {
            const { notifyEmail, paymentDesc, transferFlow } = this.state || {};
            const item = this.props?.route?.params.transferParams;
            const validateNotes =
                paymentDesc?.length > 0 && paymentDesc?.length < 3
                    ? paymentDetailsRegex(paymentDesc)
                    : true;
            const isEmailValid =
                notifyEmail?.length > 0 && notifyEmail?.length < 3
                    ? validateEmail(notifyEmail)
                    : true;
            if (validateNotes && isEmailValid) {
                this.setState({
                    originalData: this.props?.route?.params.transferParams?.originalData,
                    showOverlay: true,
                    loader: true,
                });

                if (item?.originalData?.funId === CONSENT_REGISTER_DEBTOR) {
                    const apiTransferParams = this.getRTPRegisterParams();
                    this.autoBillingRegister(apiTransferParams);
                } else if (
                    item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                    item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                ) {
                    const apiTransferParams = this.getAutoDebitRequestParams();
                    const lastAPIDetails = {
                        params: apiTransferParams,
                        apiCalled: this.consentApprovalAPI,
                    };
                    this.setState({ lastAPIDetails });
                    this.consentApprovalAPI(apiTransferParams);
                } else if (transferFlow === 27) {
                    const apiTransferParams = item?.isConsentOnlineBanking
                        ? this.getOnlineBankingParams()
                        : this.getRTPRequestParams(); //send request 801/802

                    //request autodebit and online banking GA
                    if (item?.isConsentOnlineBanking) {
                        const GAData = {
                            autodebit: "N/A",
                            frequency: item?.consentFrequency,
                            edit_amount: "N/A",
                            cancellation: item?.canTrmByDebtor,
                            payment_method: "N/A",
                            product_name: "N/A",
                            num_request: "N/A",
                        };
                        RTPanalytics.duitNowOnlineBankingFormProceed(GAData);
                    } else {
                        const GAData = {
                            autodebit: true,
                            frequency: this.state.transferParams?.consentFrequencyText,
                            edit_amount: "N/A",
                            cancellation: this.state.transferParams?.allowCancel,
                            payment_method: this.state?.paymentMethods[0]?.title,
                            product_name: this.state.transferParams?.productInfo?.productName,
                            num_request: "N/A",
                        };
                        RTPanalytics.formADReviewDetails(GAData);
                    }
                    if (this.state.flow === "TAC") {
                        const fundTransferType = item?.isConsentOnlineBanking
                            ? "RPP_CONSENT_APPROVE_OTP_REQ"
                            : "RPP_AUTODEBIT_OTP_REQ";
                        const payeeName = item?.isConsentOnlineBanking
                            ? item?.creditorName
                            : item?.actualAccHolderName ?? item?.accHolderName;
                        const toAcctNo = item?.isConsentOnlineBanking
                            ? this.state.selectedAccount?.number?.substring(0, 12)
                            : this.state.transferParams?.selectedAccount?.number ??
                              this.state?.selectedAccountItem?.name;
                        const cardNo = item?.isConsentOnlineBanking
                            ? item?.consentFrequency
                            : this.state.transferParams?.consentFrequency;

                        const tacParams = {
                            fundTransferType,
                            payeeName,
                            toAcctNo,
                            cardNo,
                        };

                        //if Flow is TAC open TAC model
                        this.setState({ showTAC: true, allowToCancelTimer: false, tacParams });
                    } else if (this.state.flow === navigationConstant.SECURE2U_COOLING) {
                        const {
                            navigation: { navigate },
                        } = this.props;
                        navigateToS2UCooling(navigate);
                    } else {
                        const lastAPIDetails = {
                            params: apiTransferParams,
                            apiCalled: this.autoDebitRequest,
                        };
                        this.setState({ lastAPIDetails });
                        this.autoDebitRequest(apiTransferParams);
                    }
                }
            } else {
                showInfoToast({
                    message: !isEmailValid
                        ? PLEASE_REMOVE_INVALID_EMAIL
                        : PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
                });
            }
        } catch (ex) {
            showInfoToast({
                message: ex?.message ?? SERVER_OTHER_ERROR,
            });
            this.setState({
                showOverlay: false,
                loader: false,
            });
        }
    };

    /***
     * rtpACallRequest
     * Pay for Request Money Flow Api call
     */
    autoDebitRequest = async (params) => {
        const { transferParams } = this.state;
        try {
            const response = transferParams?.isConsentOnlineBanking
                ? await consentRedirectUpdate(params)
                : transferParams?.idType === "ACCT"
                ? await consentIncomingRequest(params)
                : await consentRequest(params);
            this.setState({ msgId: response?.data?.result?.msgId });
            if (response?.data?.code === 200) {
                if (this.state.flow === "S2U") {
                    this.setState(
                        {
                            transferParams: {
                                ...this.state.transferParams,
                                transactionresponse: response?.data?.result,
                            },
                        },
                        () => {
                            this.showS2uModal({
                                ...this.props?.route?.params,
                                ...this.state.transferParams,
                                ...params,
                                transactionresponse: response?.data?.result,
                            });
                        }
                    );
                } else if (this.state.flow === "TAC") {
                    this.setState(
                        {
                            transferParams: {
                                ...this.state.transferParams,
                                transactionresponse: response?.data?.result,
                            },
                        },
                        () => {
                            //if Flow is TAC open TAC model
                            this.setState({ showTAC: true });
                        }
                    );
                } else {
                    this.autoDebitApiSuccess(response?.data?.result ?? {});
                }
            } else {
                this.autoDebitApiFailed(response?.data?.result);
            }
        } catch (error) {
            this.autoDebitApiFailed(error);
        }
    };

    /***
     * consentApprovalAPI
     * Pay for Request Money Flow Api call
     */
    consentApprovalAPI = async (params) => {
        const item = this.props?.route?.params?.transferParams;
        // approve autodebit GA
        const accType =
            item.originalData?.debtorAccountType === "CACC" ||
            item.originalData?.debtorAccountType === "SVGS"
                ? "Savings and current account"
                : item.originalData?.debtorAccountType === "CCRD"
                ? CREDIT_CARD
                : "E-wallet";
        const GAData = {
            autodebit: true,
            frequency: item?.consentFrequencyText,
            edit_amount: "N/A",
            cancellation: item.originalData?.canTerminateByDebtor,
            payment_method: accType,
            product_name: item.originalData?.productName,
            num_request: "N/A",
        };
        RTPanalytics.formABApprove(GAData);
        try {
            if (this.state.flow === "TAC") {
                const tacParams = {
                    fundTransferType:
                        item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                            ? "RPP_CREDITOR_APPROVE_OTP_REQ"
                            : item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                              item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                            ? "RPP_DEBTOR_APPROVE_OTP_REQ"
                            : "",
                    payeeName: item.originalData?.merchantName,
                    toAcctNo: item?.originalData?.accountNumber,
                    cardNo: item?.originalData?.frequency,
                };
                this.setState({ showTAC: true, tacParams });
            } else {
                const response = await consentApproval({
                    ...params,
                    twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                });
                this.setState({ msgId: response?.data?.result?.msgId });
                if (response?.data?.code === 200) {
                    if (this.state.flow === "S2U") {
                        this.showS2uModal(params);
                    } else {
                        this.autoDebitApiSuccess(response?.data?.result ?? {});
                    }
                } else {
                    this.autoDebitApiFailed(response?.data?.result);
                }
            }
        } catch (error) {
            this.autoDebitApiFailed(error);
        }
    };

    autoBillingRegister = async (params) => {
        const item = this.props?.route?.params?.transferParams;
        // approve autobilling GA
        const accType =
            item.originalData?.debtorAccountType === "CACC" ||
            item.originalData?.debtorAccountType === "SVGS"
                ? "Savings and current account"
                : item.originalData?.debtorAccountType === "CCRD"
                ? CREDIT_CARD
                : "E-wallet";
        const GAData = {
            autodebit: true,
            frequency: item?.consentFrequencyText,
            edit_amount: "N/A",
            cancellation: item.originalData?.canTerminateByDebtor,
            payment_method: accType,
            product_name: item.originalData?.productName,
            num_request: "N/A",
        };
        RTPanalytics.formABApprove(GAData);

        try {
            if (this.state.flow === "TAC") {
                const tacParams = {
                    fundTransferType:
                        item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                            ? "RPP_CREDITOR_APPROVE_OTP_REQ"
                            : item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                              item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                            ? "RPP_DEBTOR_APPROVE_OTP_REQ"
                            : "",
                    payeeName: item.originalData?.merchantName,
                    toAcctNo: item?.originalData?.accountNumber,
                    cardNo: item?.originalData?.frequency,
                };
                this.setState({ showTAC: true, tacParams });
            } else {
                const response = await consentStatus({
                    ...params,
                    twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
                });
                this.setState({ msgId: response?.data?.result?.msgId });
                if (response?.data?.code === 200) {
                    if (this.state.flow === "S2U") {
                        this.showS2uModal(params);
                    } else {
                        this.autoDebitApiSuccess(response?.data?.result ?? {});
                    }
                } else {
                    this.autoDebitApiFailed(response?.data?.result);
                }
            }
        } catch (error) {
            this.autoDebitApiFailed(error);
        }
    };

    /***
     * rtpActionCallApiSuccess
     * Handle Transfer Success Flow
     */
    autoDebitApiSuccess = (response) => {
        const { transferParams, originalData } = this.state || {};
        const { resetModel } = this.props;
        resetModel(["accounts"]);
        this.setState(
            {
                loader: false,
                showOverlay: false,
            },
            () => {
                if (
                    response.statusCode === "0000" ||
                    response.statusCode === "000" ||
                    response.statusCode === "0"
                ) {
                    const transactionDate =
                        response && response.serverDate ? response.serverDate : null;
                    transferParams.additionalStatusDescription =
                        response.additionalStatusDescription;
                    transferParams.statusDescription = response.statusDescription;
                    transferParams.transactionRefNo = response.transactionRefNumber;
                    transferParams.transactionRefNumber = response.formattedTransactionRefNumber;
                    transferParams.formattedTransactionRefNumber =
                        response.formattedTransactionRefNumber;
                    transferParams.nonModifiedTransactionRefNo = response.transactionRefNumber;
                    transferParams.referenceNumberFull = response.transactionRefNumber;
                    transferParams.referenceNumber = response.formattedTransactionRefNumber;
                    transferParams.transactionDate = transactionDate;
                    transferParams.serverDate = response.serverDate;
                    if (!transferParams.transactionresponse?.msgId && response?.msgId) {
                        transferParams.transactionresponse = response;
                    }
                    transferParams.transactionRefNumberFull = this.state?.primaryAccountName;
                    transferParams.transactionStatus = true;
                    transferParams.expiryDateFormatted = this.state.expiryDateFormatted;

                    //  Response navigate to Acknowledge Screen
                    const routeParams = {
                        item: transferParams,
                        transferParams,
                        transactionReferenceNumber: response.formattedTransactionRefNumber,
                        errorMessge: "",
                        screenDate: this.props.route.params?.screenDate,
                        originalData,
                        fullRedirectUrl: response?.merchantUrl ?? "",
                        redirectToMerchantOnSuccess: this.redirectToMerchantOnSuccess,
                    };
                    const screenName = navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN;
                    this.props.navigation.navigate(screenName, routeParams);
                } else {
                    this.error200Handler(response);
                }
            }
        );
    };

    // error200
    error200Handler = (response) => {
        const responseObject = response?.result ?? response;
        const transferParams = {
            ...this.state.transferParams,
            additionalStatusDescription: responseObject?.additionalStatusDescription,
            statusDescription: "unsuccessful",
            transactionResponseError: responseObject?.statusDescription ?? WE_FACING_SOME_ISSUE,
            transactionStatus: false,
            formattedTransactionRefNumber: responseObject?.formattedTransactionRefNumber,
            transactionDate: response?.serverDate ?? "",
            transferFlow: this.state.transferFlow,
        };
        this.hideTAC();
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN,
            params: {
                transferParams,
                screenDate: this.props.route.params?.screenDate,
                redirectToMerchant: this.getConsentRedirectUpdate,
            },
        });
    };

    duitNowRtp = async (apiTransferParams) => {
        const item = this.props?.route?.params.transferParams;
        const params =
            apiTransferParams ||
            (item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                ? this.getRTPRegisterParams()
                : item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                  item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                ? this.getAutoDebitRequestParams()
                : this.getRTPRequestParams());
        const lastAPIDetails = { params, apiCalled: this.duitNowRtp };
        this.setState({ lastAPIDetails });
        try {
            if (item?.originalData?.funId === CONSENT_REGISTER_DEBTOR) {
                const response = await consentStatus(params);
                if (
                    response?.data?.result?.statusCode === "0" ||
                    response?.data?.result?.statusCode === "000" ||
                    response?.data?.result?.statusCode === "0000"
                ) {
                    this.autoDebitApiSuccess(response?.data?.result ?? {});
                } else {
                    this.autoDebitApiFailed(response?.data);
                }
            } else if (
                item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
            ) {
                const response = await consentApproval(params);
                if (
                    response?.data?.result?.statusCode === "0" ||
                    response?.data?.result?.statusCode === "000" ||
                    response?.data?.result?.statusCode === "0000"
                ) {
                    this.autoDebitApiSuccess(response?.data?.result ?? {});
                } else {
                    this.autoDebitApiFailed(response?.data);
                }
            } else if (item?.isConsentOnlineBanking) {
                const params = this.getOnlineBankingParams();
                const response = await consentRedirectUpdate(params);
                if (
                    response?.data?.result?.statusCode === "0" ||
                    response?.data?.result?.statusCode === "000" ||
                    response?.data?.result?.statusCode === "0000"
                ) {
                    const { transferParams } = this.state;
                    transferParams.transactionresponse = response?.data?.result;

                    this.setState({ transferParams }, () => {
                        this.autoDebitApiSuccess(response?.data?.result ?? {});
                    });
                } else {
                    this.autoDebitApiFailed(response?.data);
                }
            } else {
                const params = apiTransferParams ?? this.getRTPRequestParams();
                const response =
                    item?.idType === "ACCT"
                        ? await consentIncomingRequest(params)
                        : await consentRequest(params);
                if (
                    response?.data?.result?.statusCode === "0" ||
                    response?.data?.result?.statusCode === "000" ||
                    response?.data?.result?.statusCode === "0000"
                ) {
                    const { transferParams } = this.state;
                    transferParams.transactionresponse = response?.data?.result;

                    this.setState({ transferParams }, () => {
                        this.autoDebitApiSuccess(response?.data?.result ?? {});
                    });
                } else {
                    this.autoDebitApiFailed(response?.data);
                }
            }
        } catch (err) {
            const tacWrong = { ...err, tacWrong: true };
            this.autoDebitApiFailed(tacWrong);
        }
    };
    /***
     * rtpActionApiSuccess
     * Handle TAC Success Flow
     *
     */

    onTacSuccess = async (response) => {
        const item = this.props?.route?.params.transferParams;
        this.hideTAC();

        if (response) {
            const consentCond =
                item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
                item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR;

            const consentCreditorCond =
                item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR;

            const fundTransferType = item?.isConsentOnlineBanking
                ? "RPP_CONSENT_APPROVE_OTP_VERIFY"
                : item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                ? "RPP_CREDITOR_APPROVE_OTP_VERIFY"
                : consentCreditorCond
                ? "RPP_DEBTOR_APPROVE_OTP_VERIFY"
                : "RPP_AUTODEBIT_OTP_VERIFY";

            const payeeName = item?.isConsentOnlineBanking
                ? item?.creditorName
                : consentCond
                ? item.originalData?.merchantName
                : item?.actualAccHolderName ?? item?.accHolderName;

            const toAcctNo = item?.isConsentOnlineBanking
                ? this.state.selectedAccount?.number?.substring(0, 12)
                : consentCond
                ? item?.originalData?.accountNumber
                : this.state.transferParams?.selectedAccount?.number ??
                  this.state?.selectedAccountItem?.number;

            const cardNo = item?.isConsentOnlineBanking
                ? item?.consentFrequency
                : consentCond
                ? item?.originalData?.frequency
                : this.state.transferParams?.consentFrequency;

            const tacParams = {
                fundTransferType,
                payeeName,
                toAcctNo,
                cardNo,
                tacNumber: response,
            };

            try {
                const result = await nonMonetoryValidate(tacParams);
                if (
                    result?.data?.statusCode === "0" ||
                    response?.data?.result?.statusCode === "000" ||
                    result?.data?.responseStatus === "0000"
                ) {
                    this.duitNowRtp();
                } else {
                    this.autoDebitApiFailed(result?.data);
                }
            } catch (err) {
                const tacWrong = { ...err, tacWrong: true };
                this.autoDebitApiFailed(tacWrong);
            }
        }
    };

    /***
     * autoDebitApiFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA.... autoDebitApiFailed
     */
    autoDebitApiFailed = (error, token) => {
        this.hideTAC();
        const { transferParams } = this.state;
        const { resetModel } = this.props;
        resetModel(["accounts"]);
        const errors = error;
        const errorsInner = error?.error;
        const isAmountIssue = errorsInner?.message
            ?.toLowerCase()
            ?.includes("exceeds maximum transaction limit");
        transferParams.statusDescription = errorsInner?.statusDescription ?? "Declined";
        if (errors?.message && !isAmountIssue) {
            showErrorToast({
                message:
                    errors?.result?.hostStatusCode === "U224" ? START_DATE_PASSED : errors.message,
            });
        }
        if ([428, 423, 422].includes(errors.status)) {
            const rsaObject = {
                ...this.state.rsaObject,
                showRSA: true,
                errorObj: error,
                payload: this.state.lastAPIDetails.params,
                postCallback: this.makeAPICall,
                navigation: this.props.navigation,
            };
            this.setState({ rsaObject });
        } else {
            //Handle All other failure cases
            this.setState(
                {
                    loader: false,
                    showOverlay: false,
                },
                () => {
                    this.hideTAC();
                    const transferParamsTemp = {
                        ...this.state.transferParams,
                        statusDescription: "Declined",
                        tacType: !errors?.tacWrong,
                        transactionResponseError: error?.message ?? WE_FACING_SOME_ISSUE,
                        showDesc: true,
                        transactionStatus: false,
                        formattedTransactionRefNumber:
                            errorsInner?.formattedTransactionRefNumber ??
                            errorsInner?.transactionRefNumber,
                        transactionDate: errorsInner?.serverDate ?? "",
                        transferFlow: this.state.transferFlow,
                        errorMessage: error?.[0]?.message,
                    };
                    this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                        screen: navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN,
                        params: {
                            transferParams: transferParamsTemp,
                            screenDate: this.props.route.params?.screenDate,
                            errors,
                            redirectToMerchant: this.getConsentRedirectUpdate,
                        },
                    });
                }
            );
        }
    };

    getAutoDebitParams = () => {
        const { transferParams } = this.props.route.params;
        const { sourceOfFunds, senderBrn, usrDbrtScndType, countryCode, selectedAccount } =
            this.state || {};
        const amount = transferParams.amount;
        const transferAmount = amount ? amount.replace(/,/g, "") : "0.00";
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        const checkPassport = senderBrn + countryCode;

        return {
            senderAcct: transferParams?.senderAcct,
            swiftCode: transferParams?.swiftCode,
            senderName: transferParams?.receiverName,
            reference: transferParams.reference,
            sourceOfFunds: transferParams?.sourceOfFunds ?? sourceOfFunds,
            bankName: formateIDName(transferParams.bankName),
            receiverName: transferParams?.senderName,
            amount: transferAmount,
            consentStartDate: transferParams?.consentStartDate
                ? moment(transferParams?.consentStartDate, DATE_SHORT_FORMAT2)
                : transferParams?.consentStartDate,
            consentExpiryDate: transferParams?.consentExpiryDate
                ? moment(transferParams?.consentExpiryDate, DATE_SHORT_FORMAT2)
                : transferParams?.consentExpiryDate,
            consentFrequency: transferParams?.consentFrequency ?? null,
            consentMaxLimit: transferParams?.consentMaxLimit?.replace(/,/g, "") ?? null,
            productId: transferParams?.originalData?.productId,
            merchantId: transferParams?.originalData?.merchantId,
            senderBrn:
                usrDbrtScndType === "03"
                    ? checkPassport
                    : senderBrn ?? transferParams?.originalData?.senderBrn,
            mobileSDKData: mobileSDK, // Required For RSA
            debtorAcctType: selectedAccount?.type,
        };
    };

    autoDebitAcceptance = async (routeParams) => {
        const { autoDebitStatus } = this.state;
        const { transferParams } = this.state;
        if (autoDebitStatus === "APPROVE") {
            const params = this.getAutoDebitParams();
            try {
                const response = await autoDebitAcceptance(params);
                this.autoDebitApiSuccess(response?.data?.result);
            } catch (error) {
                this.autoDebitApiFailed(error);
            }
        } else {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN,
                params: {
                    transferParams: {
                        ...transferParams,
                        formattedTransactionRefNumber:
                            routeParams?.transferParams?.transactionResponseObject?.result?.msgId,
                    },
                    redirectToMerchant: this.getConsentRedirectUpdate,
                },
                routeParams,
            });
        }
    };

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    showS2uModal = async (transferParams) => {
        const item = this.props?.route?.params.transferParams;
        const userProxy = transferParams?.selectedProxy?.no;

        const userIdValue =
            userProxy === 0 || userProxy === 1 || userProxy === 2
                ? transferParams?.idValueFormatted
                : transferParams?.idValue;

        const isApproveFlow =
            item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR;

        const consentCreditorCond =
            transferParams?.transferFlow === 27 && transferParams?.idType === "ACCT"
                ? "RPP_AUTODEBIT_ACCT_S2U"
                : "RPP_AUTODEBIT_PROXY_S2U";

        const consentCond =
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR;

        const fundTransferType = transferParams?.isConsentOnlineBanking
            ? "RPP_CONSENT_APPROVE_AUTODEBIT_S2U"
            : item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
            ? "RPP_CREDITOR_APPROVE_AUTODEBIT_S2U"
            : consentCond
            ? "RPP_DEBTOR_APPROVE_AUTODEBIT_S2U"
            : consentCreditorCond;
        const payeeName = transferParams?.isConsentOnlineBanking
            ? transferParams?.creditorName
            : isApproveFlow
            ? item.originalData?.merchantName
            : transferParams?.actualAccHolderName ?? transferParams?.accHolderName;

        const toAcctNo = transferParams?.isConsentOnlineBanking
            ? this.state.selectedAccount?.number?.substring(0, 12)
            : isApproveFlow
            ? item?.originalData?.accountNumber
            : this.state.transferParams?.selectedAccount?.number ??
              this.state?.selectedAccountItem?.name;

        const cardNo = transferParams?.isConsentOnlineBanking
            ? transferParams?.consentFrequency
            : isApproveFlow
            ? item?.originalData?.frequency
            : this.state.transferParams?.consentFrequency;
        const params = {
            twoFAType: FundConstants.TWO_FA_TYPE_SECURE2U_PULL,
            fundTransferType,
            payeeName,
            toAcctNo,
            cardNo,
        };
        const result = await nonMonetoryValidate(params);
        if (result?.data?.statusCode === "0" || result?.data?.responseStatus === "0000") {
            const item = this.props?.route?.params.transferParams || {};
            const { s2uTransactionId } = result?.data || null;

            const s2uTransactionDetails = [
                {
                    label:
                        item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
                        transferParams?.transferFlow === 27
                            ? PAY_FROM
                            : PAY_TO,
                    value: transferParams?.isConsentOnlineBanking
                        ? transferParams?.creditorName
                        : isApproveFlow
                        ? `${
                              item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                                  ? item?.originalData?.debtorName
                                  : consentCond
                                  ? item?.originalData?.merchantName
                                  : item?.name
                          }`
                        : `${transferParams?.actualAccHolderName ?? transferParams?.accHolderName}`,
                },
                {
                    label:
                        item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                            ? PAY_TO
                            : consentCond || transferParams?.isConsentOnlineBanking
                            ? PAY_FROM
                            : "",
                    value: transferParams?.isConsentOnlineBanking
                        ? `${this.state.selectedAccount?.name}\n${formateAccountNumber(
                              this.state.selectedAccount?.number,
                              12
                          )}`
                        : isApproveFlow
                        ? `${
                              item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                                  ? `${this.state?.fromAccountName}\n${this.state?.formatedFromAccount}`
                                  : consentCond || transferParams?.transferFlow === 27
                                  ? `${this.state?.primaryAccountName}\n${formateAccountNumber(
                                        this.state?.fromAccount,
                                        12
                                    )}`
                                  : item?.name
                          }`
                        : `${transferParams?.idTypeText}\n${userIdValue}`,
                },
                {
                    label: FREQUENCY,
                    value: isApproveFlow
                        ? this.state?.transferParams?.consentFrequencyText
                        : transferParams?.consentFrequencyText,
                },
                {
                    label: DATE_AND_TIME,
                    value: moment().format("DD MMM YYYY, hh:mm A"),
                },
            ];
            if (transferParams?.transferFlow === 27) {
                s2uTransactionDetails?.splice(1, 1);
            }
            //Show S2U Model update the payload
            this.setState(
                {
                    pollingToken: s2uTransactionId,
                    s2uTransactionDetails,
                },
                () => {
                    this.setState({ showS2u: true });
                }
            );
        } else {
            showErrorToast({
                message: result?.data?.statusDesc || result?.data?.message || COMMON_ERROR_MSG,
            });
        }
    };

    redirectToMerchantOnSuccess = (merchantUrl) => {
        this.props.navigation.replace(navigationConstant.SEND_REQUEST_MONEY_STACK, {
            screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
        });
        Linking.openURL(merchantUrl);
    };

    /***
     * onS2uDone
     * Handle S2U Approval or Rejection Flowresponse?.token, response, this.state
     */
    onS2uDone = (response) => {
        const { transferParams, originalData } = this.state || {};
        const { transactionStatus, s2uSignRespone } = response;
        const url = response?.s2uSignRespone?.consentId ?? "";

        // Close S2u popup
        this.onS2uClose();
        //Transaction Sucessful
        if (transactionStatus) {
            const { statusDescription, text, status } = s2uSignRespone;
            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription || status;
            transferParams.transactionResponseError = text;
            transferParams.s2uType = true;
            transferParams.accSelector = this.state?.fromAccount;
            transferParams.selectedCreditorAccount = this.state?.selectedAccNum;
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
            transferParams.transactionRefNumberFull = this.state?.primaryAccountName;
            transferParams.showDesc = true;
            transferParams.expiryDateTime = this.state.expiryDate ?? "";
            transferParams.expiryDateFormatted = this.state.expiryDateFormatted ?? "";
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                screen: navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN,
                params: {
                    transferParams,
                    transactionResponseObject: s2uSignRespone.payload,
                    screenDate: this.props.route.params?.screenDate,
                    errorMessge: null,
                    originalData,
                    fullRedirectUrl: url,
                    redirectToMerchantOnSuccess: this.redirectToMerchantOnSuccess,
                },
            });
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone;
            const serverError = text || "";
            transferParams.s2uType = false;
            transferParams.selectedCreditorAccount = this.state?.selectedAccNum;
            transferParams.accSelector = this.state?.fromAccount;
            transferParams.transactionStatus = false;
            transferParams.transactionResponseError = serverError;
            transferParams.statusDescription = statusDescription;
            transferParams.formatRefNumber = this.state?.msgId;
            transferParams.formattedTransactionRefNumber =
                s2uSignRespone?.mbbRefNo ?? s2uSignRespone.formattedTransactionRefNumber ?? "";
            transferParams.status = status;

            const transactionId =
                status === "M408"
                    ? transferParams.referenceNumber
                    : transferParams?.formattedTransactionRefNumber ?? "";
            //M201 When User Rejects the Transaction inb S2U
            if (status === "M201") {
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = "Your Secure Verification authorisation was rejected";
                transferParams.transferMessage =
                    "Your Secure Verification authorisation was rejected";
            } else if (status === "M408") {
                //M408 Custom error handling if Transaction Approval Timeout
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transferParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
            }
            if (statusDescription === "Failed") {
                showErrorToast({
                    message: text == "U224" ? START_DATE_PASSED : text ?? statusDescription,
                });
            }
            if (transferParams?.transferFlow === 27) {
                this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                    screen: navigationConstant.RTP_AUTODEBIT_ACKNOWLEDGE_SCREEN,
                    params: {
                        transferParams,
                        transactionResponseObject: s2uSignRespone.payload,
                        transactionReferenceNumber: transactionId,
                        screenDate: this.props.route.params?.screenDate,
                    },
                });
            } else {
                const routeParams = {
                    transferParams,
                    transactionResponseObject: s2uSignRespone.payload,

                    transactionReferenceNumber: transactionId,
                    forwardItem: this.forwardItem,
                    screenDate: this.props.route.params?.screenDate,
                };
                this.autoDebitAcceptance(routeParams);
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
    /***
     * onDateFieldPress
     * On Date pressed Calender Even
     */

    _onRightButtonPressEditable = (value) => {
        this.setState({
            showEditable: false,
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
            showAccountScrollPickerView: false,
            selectedAccount: value,
            fromAccount: value.number,
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
     * _onSetCalenderDates
     *
     */
    _onSetCalenderDates = () => {
        const maxDate = new Date();
        const { duitNowRecurring } = this.state;
        if (duitNowRecurring) {
            const fullYear = maxDate.getFullYear() + 10;
            maxDate.setDate(maxDate.getFullYear() + 10);
            maxDate.setFullYear(fullYear);
            maxDate.setMonth(maxDate.getMonth());
            maxDate.setDate(maxDate.getDate());
        } else {
            maxDate.setDate(maxDate.getDate() + 28);
        }
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
                popupTitle: ONLINE_BANKING_CONFIRM_POP_UP_TITLE,
                popupDesc: ONLINE_BANKING_CONFIRM_POP_UP_DESC,
                popupPrimaryActionText: CONFIRM,
            });
        } else {
            this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
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
                this.getConsentRedirectUpdate();
            }
        );
    };

    /***
     * getRecipientName
     * Display Recipient Name Field
     */
    getRecipientName = () => {};

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
        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEWER,
            params: navParams,
        });
    };

    /***
     * _onDateEditClick
     * Fund Transfer on Date click open Calender View
     */
    _onDateEditClick = async () => {
        this._onSetCalenderDates();
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
        const formatedDate = getFormatedDateMoments(date, "D MMM YYYY");
        this.setState({ expiryDateFormatted: formatedDate, expiryDate: date });
        this.hideDatePicker();
    };

    /***
     * _onRecipientReferenceClick
     * On payment Reference click navigate to Reference to get updated reference
     */
    _onRecipientReferenceClick = () => {
        const transferParams = {
            ...this.props.route.params?.transferParams,
            notifyEmail: this.state.notifyEmail,
            paymentDesc: this.state.paymentDesc,
            expiryDateFormatted: this.state.expiryDateFormatted,
        };
        this.props.navigation.push(navigationConstant.RTP_AUTODEBIT_ID_SCREEN, {
            ...this.props.route.params,
            transferParams,
            isEdit: true,
        });
    };

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    getRTPRequestParams = () => {
        // new autodebit request params
        const { productId, merchantId, senderBrn, merchantDetails } = this.props.route.params || {};
        // renew request autodebit params
        const { merchantName, creditorIdValue, ref1, ref2 } = this.props.route.params || {};
        const { transferParams, paymentMethods, scnSndrId, scnSndrIc, usrDbrtScndType } =
            this.state || {};
        const isAccount = transferParams?.idType === "ACCT";
        let sourceOfFunds = "";
        if (!isEmpty(paymentMethods)) {
            paymentMethods?.forEach((el) => {
                if (el?.isSelected) {
                    sourceOfFunds += el.key;
                }
            });
        }
        const passParams = this.props.route.params.transferParams;
        const params = isAccount
            ? transferParams?.selectedBank?.bankCode === "MAYBANK"
                ? {}
                : { debtorSwiftCode: transferParams?.selectedBank?.swiftCode }
            : {
                  debtorScndTp: transferParams?.idType,
                  debtorScndVal:
                      passParams?.selectedProxy?.no === 3
                          ? transferParams?.idValue + passParams.countryCode
                          : transferParams?.idValue,
                  debtorTp: transferParams?.idType,
                  debtorVal:
                      passParams?.selectedProxy?.no === 3
                          ? transferParams?.idValue + passParams.countryCode
                          : transferParams?.idValue,
              };
        const twoFAType =
            this.state.flow === "S2U" ? FundConstants.TWO_FA_TYPE_SECURE2U_PULL : undefined;

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const formattedSelectedBank = toTitleCase(transferParams?.selectedBank?.bankName); //802 request selected bank name
        return {
            ...params,
            twoFAType,
            sourceOfFunds,
            creditorName: merchantDetails?.merchantName ?? merchantName ?? "",
            creditorType: usrDbrtScndType,
            creditorVal: scnSndrId ?? scnSndrIc,
            creditorScndType: usrDbrtScndType,
            creditorScndVal: senderBrn ?? creditorIdValue ?? "",
            creditorAcctNum: transferParams?.selectedAccount?.number,
            debtorName: transferParams?.actualAccHolderName ?? transferParams?.accHolderName,
            debtorAcctNum: transferParams?.toAccount,
            debtorAcctType: isAccount ? undefined : transferParams?.idType, //"CACC",
            refs1: transferParams.reference ?? ref1,
            refs2: this.state.paymentDesc ?? ref2 ?? "",
            productId,
            merchantId,
            maxAmount: transferParams?.consentMaxLimit,
            consentStartDate: transferParams?.consentStartDate
                ? moment(transferParams?.consentStartDate).format(DATE_SHORT_FORMAT2)
                : transferParams?.consentStartDate,
            consentExpiryDate: transferParams?.consentExpiryDate
                ? moment(transferParams?.consentExpiryDate).format(DATE_SHORT_FORMAT2)
                : transferParams?.consentExpiryDate,
            consentFrequency: transferParams?.consentFrequency,
            allowCancel: transferParams?.allowCancel,
            expiryDateTime: this.state.expiryDate,
            email: this.state.notifyEmail,
            typeUpdate: this.props.route.params.from === "renewRequest" ? "RENEW" : "",
            mobileSDKData: mobileSDK, // Required For RSA
            debtorBankName: transferParams?.toAccountBank ?? formattedSelectedBank,
            creditorBankName: transferParams?.bankName,
        };
    };

    getAutoDebitRequestParams = () => {
        const item = this.props?.route?.params.transferParams || {};
        const { usrDbrtScndType, fromAccount, countryCode, selectedAccount } = this.state || {};
        const regex = /(\[")|(",")|("\])/g;
        const SOF = (item?.originalData?.sourceOfFunds).replace(regex, "") || {};
        const UsrScndId = this.state.scnSndrId || this.state.scnSndrIc;
        const checkPassport = UsrScndId + countryCode;
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        return {
            endToEndId: item?.originalData?.endToEndId ?? "",
            orgnlMndId: item?.originalData?.endToEndId ?? "",
            consentId: item?.originalData?.consentId ?? "",
            sourceOfFunds: SOF,
            creditorName: item?.originalData?.merchantName,
            creditorVal: item?.originalData?.creditorIdValue ?? "",
            creditorScndVal: item?.originalData?.creditorSecondaryIdValue ?? "",
            debtorName: item?.originalData?.debtorName,
            debtorScndType: this.state?.usrDbrtScndType,
            debtorScndVal: usrDbrtScndType === "03" ? checkPassport : UsrScndId,
            debtorType: usrDbrtScndType,
            debtorVal: usrDbrtScndType === "03" ? checkPassport : UsrScndId,
            debtorAcctNum: fromAccount.substring(0, 12),
            debtorAcctType: selectedAccount?.type ?? item?.originalData?.debtorAccountType,
            productId: item?.originalData?.productId,
            merchantId: item?.originalData?.merchantId,
            refs1: item?.originalData?.ref1 ?? "",
            refs2: item?.originalData?.ref2 ?? "",
            maxAmount: item?.originalData?.limitAmount,
            consentStartDate: item?.originalData?.startDate
                ? moment(item?.originalData?.startDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.startDate,
            consentExpiryDate: item?.originalData?.expiryDate
                ? moment(item?.originalData?.expiryDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.expiryDate,
            consentFrequency: item?.originalData?.frequency,
            allowCancel: item?.originalData?.canTerminateByDebtor,
            expiryDateTime: item?.originalData?.reqExpiryDate,
            mobileSDKData: mobileSDK, // Required For RSA
        };
    };

    getRTPRegisterParams = () => {
        const item = this.props?.route?.params.transferParams;
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        return {
            consentId: item?.originalData?.consentId,
            consentFrequency: item?.originalData?.frequency,
            consentMaxLimit: item?.originalData?.limitAmount,
            consentSts: "ACTV",
            consentTp: "DDPT",
            consentStartDate: item?.originalData?.startDate
                ? moment(item?.originalData?.startDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.startDate,
            consentExpiryDate: item?.originalData?.expiryDate
                ? moment(item?.originalData?.expiryDate).format(DATE_SHORT_FORMAT2)
                : item?.originalData?.expiryDate,
            expiryDateTime: item?.originalData?.reqExpiryDate,
            refs1: item?.originalData?.ref1,
            refs2: item?.originalData?.ref2,
            productId: item?.originalData?.productId,
            merchantId: item?.originalData?.merchantId,
            frstPrtyPymtVal: "01",
            creditorName: item?.originalData?.merchantName,
            creditorAcctNum: item?.senderAcct,
            debtorName: item?.originalData?.debtorName,
            debtorAcctNum: item?.originalData?.debtorAccountNumber,
            debtorType: item?.originalData?.debtorIdType, //"BUSINESS",
            debtorVal: item?.originalData?.debtorIdValue,
            debtorScndType: item?.originalData?.debtorSecondaryIdType, //"BUSINESS",
            debtorScndVal: item?.originalData?.debtorIdValue,
            debtorAcctType: item?.originalData?.debtorAccountType, //"CACC",
            debtorSwiftCode: item?.originalData?.debtorBankCode,
            mobileSDKData: mobileSDK, // Required For RSA
        };
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
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

    handleInfoPress = (type) => {
        const infoTitle = type === FREQUENCY ? "Transaction frequency" : "Limit per transaction";
        const infoMessage = type === FREQUENCY ? FREQUENCY_DETAILS : LIMIT_DETAILS;
        this.setState({ infoTitle, infoMessage, showFrequencyInfo: !this.state.showFrequencyInfo });
    };

    onToggle = (isEdit) => {
        const { transferParams } = this.state;
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.RTP_AUTODEBIT_DECOUPLE_SCREEN,
            params: {
                transferParams,
            },
        });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            showOverlay,
            secure2uValidateData,
            transferFlow,
            showFrequencyInfo,
            infoTitle,
            infoMessage,
            userName,
            transferParams,
        } = this.state || {};
        const { soleProp, flagExpiryDate } = this.props.route.params;
        const item = this.props?.route?.params.transferParams || {};
        const { params } = this.props?.route?.params || {};
        const auDebitParams = {
            transferParams:
                transferParams?.transferFlow === 27 || transferParams?.isConsentOnlineBanking
                    ? transferParams
                    : {
                          consentStartDate: item?.consentStartDate,
                          consentExpiryDate: item?.consentExpiryDate,
                          consentMaxLimit: item?.consentMaxLimit,
                          consentMaxLimitFormatted: item?.originalData?.consentMaxLimit,
                          consentFrequencyText: item?.consentFrequencyText,
                          productInfo: item?.productInfo,
                          consentId: item?.originalData?.consentId,
                      },
            autoDebitEnabled: true,
            showProductInfo: !transferParams?.isConsentOnlineBanking,
            transferFlow: item?.transferFlow === 27 ? 25 : transferFlow,
            handleInfoPress: this.handleInfoPress,
            showTooltip: false,
            onToggle: this.onToggle,
        };
        const s2uCond =
            item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR ||
            item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
            transferParams?.isConsentOnlineBanking;
        const userProxy = item?.selectedProxy?.no;
        const userIdValue =
            userProxy === 0 || userProxy === 1 || userProxy === 2
                ? transferParams?.idValueFormatted
                : transferParams?.idValue;

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
                                    headerLeftElement={
                                        transferParams?.isConsentOnlineBanking ? null : (
                                            <HeaderBackButton onPress={this._onBackPress} />
                                        )
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this._onClosePress} />
                                    }
                                />
                                {transferParams?.isConsentOnlineBanking ? (
                                    <RTPTimer
                                        time={timeDifference(transferParams.timeInSecs, 3)}
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
                                                allowToCancelTimer: this.state.allowToCancelTimer,
                                            },
                                            transactionReferenceNumber: "",
                                            errorMessge: "Request timeout",
                                            screenDate: this.props.route.params?.screenDate,
                                            isAutoDebit: true,
                                            redirectToMerchant: this.getConsentRedirectUpdate,
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
                                                transferParams?.isConsentOnlineBanking
                                                    ? transferParams?.creditorName
                                                    : transferFlow === 27
                                                    ? userIdValue ??
                                                      this.props?.route?.params.transferParams
                                                          .senderName
                                                    : item?.originalData?.funId ===
                                                          CONSENT_REQ_PROXY_CREDITOR ||
                                                      item?.originalData?.funId ===
                                                          CONSENT_REQ_ACC_CREDITOR
                                                    ? this.state?.transferParams?.senderName
                                                    : item?.originalData?.funId ===
                                                      CONSENT_REGISTER_DEBTOR
                                                    ? this.state?.transferParams?.receiverName
                                                    : transferParams?.senderName
                                            }
                                            subtitle={
                                                transferFlow === 27
                                                    ? transferParams?.actualAccHolderName ??
                                                      transferParams?.accHolderName
                                                    : ""
                                            }
                                            description={
                                                transferFlow === 27
                                                    ? transferParams.idType === "ACCT"
                                                        ? transferParams?.selectedBank?.bankName
                                                        : transferParams?.idTypeText
                                                    : transferParams?.bankName
                                            }
                                            image={{
                                                type: "local",
                                                source: Assets.icDuitNowCircle,
                                            }}
                                            isVertical={false}
                                            additionalData={{ noStyleTitle: true }}
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
                                        {!transferParams?.isConsentOnlineBanking &&
                                        (item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                                            item?.originalData?.funId ===
                                                CONSENT_REQ_ACC_CREDITOR ||
                                            !item?.originalData?.funId ===
                                                CONSENT_REGISTER_DEBTOR ||
                                            transferFlow === 27) ? (
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
                                                    {transferParams?.expiryDate ? (
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typography
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={params?.expiryDate ?? ""}
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
                                            <View style={[Styles.viewRowRightItem, Styles.wrap]}>
                                                <TouchableOpacity
                                                    disabled={
                                                        this.state.transferFlow === 26 ||
                                                        transferParams?.isConsentOnlineBanking
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
                                                        style={
                                                            transferParams?.isConsentOnlineBanking
                                                                ? Styles.wrap
                                                                : ""
                                                        }
                                                        color={
                                                            transferParams?.isConsentOnlineBanking ||
                                                            this.state.transferFlow === 26 ||
                                                            item?.originalData?.funId ===
                                                                CONSENT_REQ_PROXY_CREDITOR ||
                                                            item?.originalData?.funId ===
                                                                CONSENT_REQ_ACC_CREDITOR ||
                                                            item?.originalData?.funId ===
                                                                CONSENT_REGISTER_DEBTOR
                                                                ? BLACK
                                                                : ROYAL_BLUE
                                                        }
                                                        text={
                                                            item?.originalData?.funId ===
                                                                CONSENT_REQ_PROXY_CREDITOR ||
                                                            item?.originalData?.funId ===
                                                                CONSENT_REQ_ACC_CREDITOR ||
                                                            item?.originalData?.funId ===
                                                                CONSENT_REGISTER_DEBTOR
                                                                ? item.reference
                                                                : this.state.reference
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {!(
                                            transferParams?.isConsentOnlineBanking ||
                                            item?.originalData?.funId ===
                                                CONSENT_REQ_PROXY_CREDITOR ||
                                            item?.originalData?.funId ===
                                                CONSENT_REQ_ACC_CREDITOR ||
                                            item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                                        ) ? (
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
                                                            transferParams?.serviceFee?.toFixed(
                                                                2
                                                            ) ?? "0.00"
                                                        }`}
                                                    />
                                                </View>
                                            </View>
                                        ) : null}
                                        {!transferParams?.isConsentOnlineBanking &&
                                        (transferFlow === 27 ||
                                            transferParams?.paymentDesc?.replace(/ /g, "") ||
                                            item?.paymentDesc?.replace(/ /g, "")) ? (
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
                                                    {transferFlow !== 27 ||
                                                    transferParams?.isConsentOnlineBanking ? (
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            maxLength={20}
                                                            text={
                                                                item.paymentDesc ??
                                                                transferParams?.paymentDesc
                                                            }
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            placeholderTextColor={ROYAL_BLUE}
                                                            textAlign="right"
                                                            autoCorrect={false}
                                                            autoFocus={false}
                                                            allowFontScaling={false}
                                                            style={Styles.textBox}
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
                                        {!transferParams?.isConsentOnlineBanking &&
                                        (!item?.originalData?.funId ===
                                            CONSENT_REQ_PROXY_CREDITOR ||
                                            !item?.originalData?.funId ===
                                                CONSENT_REQ_ACC_CREDITOR ||
                                            !item?.originalData?.funId ===
                                                CONSENT_REGISTER_DEBTOR ||
                                            transferFlow === 27) ? (
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
                                                    {transferParams.notifyEmail ? (
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
                                                            style={Styles.textBox}
                                                            testID="emailReference"
                                                            accessibilityLabel="emailReference"
                                                            secureTextEntry={false}
                                                            placeholder={OPTIONAL1}
                                                            maxLength={40}
                                                            keyboardType="email-address"
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
                                        {soleProp && !isEmpty(this.state.paymentMethods) ? (
                                            <View style={Styles.mt20}>
                                                <Typography
                                                    text="Accepted payment methods"
                                                    fontWeight="400"
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    style={Styles.mb20}
                                                />
                                                {this.state.paymentMethods?.map((value) => {
                                                    const { title, isSelected } = value;
                                                    return (
                                                        <View
                                                            key={value?.key}
                                                            style={Styles.listItem}
                                                        >
                                                            <RadioButton
                                                                {...this.props}
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
                                                            MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT
                                                        }
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
                                {s2uCond || transferFlow !== 27 ? (
                                    <View style={Styles.accList}>
                                        <AccountList
                                            title={
                                                transferParams?.isConsentOnlineBanking
                                                    ? "Pay AutoDebit from"
                                                    : item?.originalData?.funId ===
                                                          CONSENT_REQ_PROXY_CREDITOR ||
                                                      item?.originalData?.funId ===
                                                          CONSENT_REQ_ACC_CREDITOR
                                                    ? "Pay AutoDebit from"
                                                    : item?.originalData?.funId ===
                                                      CONSENT_REGISTER_DEBTOR
                                                    ? "Account to receive payment"
                                                    : ""
                                            }
                                            data={this.state.accounts}
                                            onPress={this._onAccountListClick}
                                            extraData={this.state}
                                            paddingLeft={24}
                                            showAmount={
                                                item?.originalData?.funId !==
                                                CONSENT_REGISTER_DEBTOR
                                            }
                                            showSelectedAccount={
                                                item?.originalData?.funId !==
                                                CONSENT_REGISTER_DEBTOR
                                            }
                                        />
                                    </View>
                                ) : null}
                            </React.Fragment>
                        </ScrollView>
                        <FixedActionContainer backgroundColor={MEDIUM_GREY}>
                            <ActionButton
                                disabled={this.state.loader}
                                fullWidth
                                borderRadius={25}
                                onPress={this._onConfirmClick}
                                backgroundColor={
                                    this.state.loader || this.state.disableBtn ? DISABLED : YELLOW
                                }
                                componentCenter={
                                    <Typography
                                        color={
                                            this.state.loader || this.state.disableBtn
                                                ? DISABLED_TEXT
                                                : BLACK
                                        }
                                        text={
                                            transferParams?.isConsentOnlineBanking
                                                ? "Approve Now"
                                                : transferFlow !== 27
                                                ? item?.originalData?.funId ===
                                                      CONSENT_REQ_PROXY_CREDITOR ||
                                                  item?.originalData?.funId ===
                                                      CONSENT_REQ_ACC_CREDITOR
                                                    ? APPROVE_AD
                                                    : "Approve Now"
                                                : SEND_NOW
                                        }
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                    {this.state.showDatePicker && (
                        <DatePicker
                            showDatePicker={this.state.showDatePicker}
                            onCancelButtonPressed={this.hideDatePicker}
                            onDoneButtonPressed={this.onDateDonePress}
                            dateRangeStartDate={moment(new Date()).add(1, "day")}
                            dateRangeEndDate={moment()
                                .add(flagExpiryDate ?? 120, "days")
                                .toDate()}
                            defaultSelectedDate={moment(this.state.expiryDate).toDate()}
                        />
                    )}
                    {this.state.showS2u && (
                        <Secure2uAuthenticationModal
                            customTitle={
                                transferFlow === 27 && !transferParams?.isConsentOnlineBanking
                                    ? "Set Up Auto Billing via DuitNow AutoDebit"
                                    : s2uCond
                                    ? "Approve DuitNow AutoDebit Request"
                                    : ""
                            }
                            token={this.state.pollingToken}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            transactionDetails={this.state.s2uTransactionDetails}
                            nonTxnData={{
                                isNonTxn: true,
                            }}
                            s2uPollingData={secure2uValidateData}
                            extraParams={{
                                metadata: {
                                    txnType: transferParams?.isConsentOnlineBanking
                                        ? "RPP_CONSENT_APPROVE_AUTODEBIT_S2U"
                                        : item?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                                        ? "RPP_CREDITOR_APPROVE_AUTODEBIT_S2U"
                                        : item?.originalData?.funId ===
                                              CONSENT_REQ_PROXY_CREDITOR ||
                                          item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                                        ? "RPP_DEBTOR_APPROVE_AUTODEBIT_S2U"
                                        : transferFlow === 27 && transferParams?.idType === "ACCT"
                                        ? "RPP_AUTODEBIT_ACCT_S2U"
                                        : "RPP_AUTODEBIT_PROXY_S2U",
                                    debtorName: transferFlow === 27 ? userName : null,
                                    refId: this.state.msgId,
                                },
                            }}
                        />
                    )}
                    {this.state.showTAC && (
                        <TacModal
                            tacParams={this.state.tacParams}
                            validateByOwnAPI
                            validateTAC={this.onTacSuccess}
                            onTacClose={this.hideTAC}
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
                    <Popup
                        visible={this.state.isPopupDisplay}
                        title={this.state.popupTitle}
                        description={this.state.popupDesc}
                        onClose={this.onPopupClosePress}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: this.onPopupClosePress,
                        }}
                        primaryAction={{
                            text: this.state.popupPrimaryActionText,
                            onPress: this.onPopupPrimaryActionPress,
                        }}
                        hideCloseButton={!transferParams?.isOnlineBanking}
                    />
                    <Popup
                        visible={showFrequencyInfo}
                        title={infoTitle}
                        description={infoMessage}
                        onClose={this.handleInfoPress}
                    />
                    <ScrollPickerView
                        showMenu={this.state.showEditable}
                        list={this.state.editableDropDown}
                        onRightButtonPress={this._onRightButtonPressEditable}
                        onLeftButtonPress={this._onLeftButtonPressEditable}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                    {this.state.rsaObject?.showRSA ? (
                        <RSAHandler {...this.state.rsaObject} />
                    ) : null}
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default withModelContext(ADConfirmation);

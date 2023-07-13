import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Platform,
    TextInput,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import { CircularLogoImage, CircularTextImage, MyView, ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import DatePicker from "@components/Pickers/DatePicker";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";

import { withModelContext } from "@context";

import {
    fundTransferApi,
    duItNowRecurring,
    bankingGetDataMayaM2u,
    sendMoneyPaidApi,
    requestMoneyAPI,
    sendMoneyApi,
} from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import {
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    MEDIUM_GREY,
    ROYAL_BLUE,
    TRANSPARENT,
    FADE_GREY,
    WHITE,
} from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC, S2U_PULL } from "@constants/data";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import * as dateScenarios from "@constants/dateScenarios";
import { FN_DUITNOW_RECURRING } from "@constants/fundConstants";
import * as FundConstants from "@constants/fundConstants";
import {
    ONE_OFF_TRANSFER,
    SECURE2U_IS_DOWN,
    AMOUNT_ERROR,
    YOU_RE_REQUESTING_MONEY_FROM,
    FIRST_TIME_FAVOURITES,
    RECURRING,
    DUITNOW,
    ENTER_AMOUNT,
    AMOUNT_NEEDS_TO_BE_001,
    AMOUNT_EXCEEDS_MAXIMUM,
    TRANSFER,
    CURRENCY,
    TO,
    FROM,
    TRANSACTION_TYPE,
    DATE,
    SEND_TO,
    SEND_FROM,
    SEND_ON,
    WE_FACING_SOME_ISSUE,
    YOUR_REQUEST_COULD_NOT_COMPLETED,
    REQUEST_FAILED,
    CONFIRMATION,
    NOTES,
    OPTIONAL1,
    START_DATE,
    END_DATE,
    TRANSFER_TYPE,
    ID_TYPE,
    TRANSFER_MODE,
    RECIPIENT_REFERENCE,
    CDD_BANK_NAME,
    PAYMENT_DETAILS,
    NOTES1,
    MONEY_WITHDRAWN_FROM_YOUR_INSURED,
    MONEY_WITHDRAWN_FROM_YOUR_INSURED_DEPOSIT,
    NO_SERVICE_CHARGE_APPICABLE,
    MONEY_WITHDRAW_FROM_YOUR_INSURED,
    DECLARATION,
    I_HEREBY_DECLARE_DUIT_NOW,
    TERMS_CONDITIONS,
    LOAN_CNF_NOTE_TEXT,
    TRANSFER_FROM,
    SEND_REQUEST,
    SEND_NOW,
    TRANSFER_NOW,
    TRANSACTION_DECLINED,
    ONE_TAP_AUTHORISATION_HAS_EXPIRED,
    FIRST_TIME_FAVOURITES_S2U,
    PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
    DUITNOW_INSTANT_TRANSFER,
    SERVICE_FEES,
    COMMON_ERROR_MSG,
    TRANSFER_RECCURRING_M2U,
    TRANSFER_UNSUCCESSFUL,
} from "@constants/strings";

import {
    getFormatedDateMoments,
    getformteddate,
    getNextDates,
    getCurrentMonthName,
    getcurrentDate,
    getDayDateFormat,
    paymentDetailsRegexOtherBank,
    getRequiredDateFormat,
} from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import {
    formateAccountNumber,
    getDeviceRSAInformation,
    formateIDName,
    formatMobileNumbersRequest,
    getContactNameInitial,
    transferFlowEnum,
    getTransferAccountType,
    SSLUserContacteNoClass,
    formatICNumber,
} from "@utils/dataModel/utility";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";
import useFestive from "@utils/useFestive";
import withFestive from "@utils/withFestive";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";

import Assets from "@assets";

import { FASendRequestDashboard } from "../../../services/analytics/analyticsSendRequest";
import { formateReferenceNumber } from "../../../utilities/dataModel/utilityPartial.3";

("use strict");

class TransferConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        festiveAssets: PropTypes.object,
    };
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            disabled: false,
            transferFlow: 1,
            notesText: null,
            client: null,
            amountText: 0.0,
            currentScreen: 0,
            userName: "",
            password: "",
            secText: "",
            ic: "",
            isDueDate: false,
            allowDebit: false,
            showInfo: false,
            errorOtp: false,
            errorPassword: false,
            errorNetwork: false,
            walletSuccess: false,
            mobileNo: "",
            accounts: [],
            minDate: new Date(),
            maxDate: getformteddate(getNextDates(28)),
            dropDownmonthView: false,
            dropdownYearView: false,
            showAccounts: true,
            isDisplayCalender: false,
            month: getCurrentMonthName(),
            yearsArray: [],
            monthsArray: [],
            amountZeroError: false,
            notesError: false,
            seletedYear: getCurrentMonthName(),
            seletedDate: getcurrentDate(),
            validSchdule: false,
            loader: false,
            dateSelected: "",
            displayDate: "Today",
            displayTransferDate: "",
            minimumDATE: getDayDateFormat(getNextDates(1)),
            amountView: false,
            selectedAmount: "Select Amount",
            selectedAmountValue: 0.0,
            showDateOptionsView: false,
            showDuitNowDateOptionsView: false,
            showTransferDateView: false,
            duitNowRecurring: false,
            fromAccountError: false,
            noConnectionError: false,
            selectedAccount: null,
            errorDescription: "",
            errorTitle: "",
            showError: false,
            showOverlay: false,
            errorMessage: "",
            select: { start: 0, end: 0 },
            showDatePicker: false,
            showScrollPickerView: false,
            list: [],
            selectedIndex: 0,
            duitNowTransferType: ONE_OFF_TRANSFER,
            mobileLoadAmount: 0.0,
            confirmDateStartDate: {},
            confirmDateEndDate: {},
            confirmDateSelectedCalender: {},
            selectedStartDate: new Date(),
            selectedEndDate: new Date(),
            minAllowedEndDate: new Date(),
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
            isRegisterFlow: false,
            transferAmount: "",
            image: Assets.icMaybankAccount,
            screenData: {
                image: Assets.icMaybankAccount,
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            bankName: "",
            primaryAccount: "",
            fromAccountTemp: "",
            fromAccount: "",
            fromAccountCode: "",
            fromAccountName: "",
            formatedFromAccount: "",
            effectiveDate: "00000000",
            userToAccountList: [],
            mainTitle: "",
            nameText: "",
            mainImage: "",
            screenIDValue: "",
            idTypeText: "",
            confirmDateEditFlow: 0,
            payRequest: false,
            transactionType: "",

            // S2u/TAC related
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            showV4S2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            showTAC: false,
            tacParams: {},
            duItNowParams: {},
            transactionRefNumber: null,
            serverDate: null,
            secure2uExtraParams: null,
            detailsArray: [],
            stateData: {},
            paymentRef: "",
            functionsCode: 0,
            transactionMode: "",
            serviceFee: "",
            showLoaderModal: false,
            params: {},
            sendMoneyParams: {},
            transactionReferenceNumber: "",
            isSubmitDisable: false,
            recipientNotes: "",
            s2uPollingFlow: false,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
            showInitLoader: true,
            fromCta: false,
            sendMoneyFlow: 0,
            validStartDateRangeData: getDateRangeDefaultData(dateScenarios.DUITNOW_RECURRING_START),
            validEndDateRangeData: getDateRangeDefaultData(dateScenarios.DUITNOW_RECURRING_END),
            validDateRangeData: getDateRangeDefaultData(dateScenarios.TRANSFER_ONE_OFF),
            isFavAnd10KAbove: false,
            //S2U V4
            mapperData: [],
            s2uEnablement: false,
            isS2UDown: false,
            //nonTxnData: { isNonTxn: true },
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        const flow = this.props.route.params?.transferParams.transferFlow;
        const payRequest = this.props.route.params?.transferParams.payRequest;
        console.log(
            "[TransferConfirmationScreen] >> [componentDidMount] : ",
            this.props.route.params
        );
        if (flow === transferFlowEnum.requestMoney || flow === transferFlowEnum.sendMoney) {
            FASendRequestDashboard.reviewDetails(flow, payRequest);
        }

        this._getDatePickerData();

        GATransfer.viewScreenTransferDetails(getTransferAccountType(flow));

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (!this.dontUpdateNextFocus) {
                this._updateDataInScreenAlways();
            }

            this.dontUpdateNextFocus = false;
        });
    }

    _getDatePickerData() {
        getDateRange(dateScenarios.DUITNOW_RECURRING_START).then((data) => {
            this.setState({
                validStartDateRangeData: data,
            });
        });
        getDateRange(dateScenarios.DUITNOW_RECURRING_END).then((data) => {
            this.setState({
                validEndDateRangeData: data,
            });
        });
        getDateRange(dateScenarios.TRANSFER_ONE_OFF).then((data) => {
            this.setState({
                validDateRangeData: data,
            });
        });
        this.setState({
            confirmDateSelectedCalender: getDefaultDate(this.state.validDateRangeData),
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        this.focusSubscription();
    }

    /***
     * toggleDueDate
     * toggle Due Date
     */
    toggleDueDate(val) {
        this.setState({ isDueDate: !val });
    }

    /***
     * toggleAllowDebit
     * toggle Allow Debit
     */
    toggleAllowDebit(val) {
        this.setState({ allowDebit: !val });
    }

    /**
     *_updateDataInScreenAlways
     * @memberof TransferConfirmationScreen
     */
    _updateDataInScreenAlways = async () => {
        const params = this.props?.route?.params ?? {};
        const festiveFlag = params?.festiveFlag ?? false;
        const isFavAnd10KAbove = params?.isFavAnd10KAbove ?? false;
        const fromCta = params?.fromCta ?? false;
        const festiveImage = params?.festiveObj?.backgroundImage ?? {};
        const festiveNotes = params?.festiveObj?.note ?? "";

        // get transferParams for screen data
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

        // get Payment method flow TAC / S2U Data from Validate Api
        const secure2uValidateData = this.props.route.params?.secure2uValidateData ?? {
            action_flow: "NA",
        };
        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: formateIDName(transferParams.bankName, " ", 2),
        };
        let idTypeText = "";
        let payRequest = false;
        let transactionType = "";
        let functionsCode = 0;
        let image = "";
        let selectedIndex = 0;
        let duitNowTransferType = ONE_OFF_TRANSFER;
        let formatedStartDate = "";
        let formatedEndDate = "";
        let startDateInt = "000000";
        let endDateInt = "000000";
        let effectiveDate = "00000000";
        let displayDate = "Today";
        let isFutureTransfer = false;
        let isRecurringTransfer = false;
        let duitNowRecurring = false;
        let selectedAccount = null;

        if (transferParams) {
            functionsCode = transferParams.functionsCode;
            transactionType = transferParams.transactionType;
            idTypeText = transferParams.idTypeText;
            idTypeText = formateIDName(idTypeText, " ", 2);
            payRequest = transferParams?.payRequest ?? false;
            image = transferParams.image;
            selectedIndex = transferParams?.transferTypeIndex ?? 0;
            duitNowTransferType = transferParams?.duitNowTransferType ?? ONE_OFF_TRANSFER;
            formatedStartDate = transferParams?.formatedStartDate ?? "";
            formatedEndDate = transferParams?.formatedEndDate ?? "";
            startDateInt = transferParams?.startDateInt ?? "00000000";
            endDateInt = transferParams?.endDateInt ?? "00000000";
            effectiveDate = transferParams?.effectiveDate ?? "00000000";
            displayDate = transferParams?.displayDate ?? "Today";
            isRecurringTransfer = transferParams?.isRecurringTransfer ?? false;
            duitNowRecurring = transferParams?.duitNowRecurring ?? false;
            isFutureTransfer = transferParams?.isFutureTransfer ?? false;
            selectedAccount = transferParams?.selectedAccount ?? null;
        }

        let stateData = this.props?.route?.params?.params;
        if (!stateData) {
            stateData = this.props?.route?.params;
        }

        // get Payment method flow TAC / S2U
        let flow = stateData?.flow;

        const s2u_enabled = secure2uValidateData.s2u_enabled;
        const s2uPollingFlow = secure2uValidateData?.pull === "N";
        if (!flow) {
            flow = this.props.route.params?.flow ?? "NA";
        }
        // Show S2U Down or Register Failed role back to TAC Toast
        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth == "fail") {
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
                if (
                    functionsCode != 2 &&
                    functionsCode != 5 &&
                    functionsCode != 6 &&
                    functionsCode != 7 &&
                    functionsCode != 25 &&
                    functionsCode != 26 &&
                    functionsCode != 28 &&
                    functionsCode != 29 &&
                    !s2u_enabled
                ) {
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
        // update Transfer Params data to state
        this.setState(
            {
                selectedIndex,
                duitNowTransferType,
                formatedStartDate,
                formatedEndDate,
                startDateInt,
                endDateInt,
                effectiveDate,
                displayDate,
                isRecurringTransfer,
                duitNowRecurring,
                isFutureTransfer,
                selectedAccount,
                loader: false,
                showOverlay: false,
                transferParams,
                transferFlow: transferParams.transferFlow,
                functionsCode: transferParams.functionsCode,
                bankName: formateIDName(transferParams.bankName),
                image,
                errorMessage: AMOUNT_ERROR,
                screenData,
                recipientNotes:
                    transferParams &&
                    transferParams.transferFlow === 15 &&
                    payRequest &&
                    transferParams.recipientNotes
                        ? transferParams.recipientNotes
                        : null,
                mainTitle: transferParams.transferFlow === 16 ? YOU_RE_REQUESTING_MONEY_FROM : "",
                idTypeText,
                confirmDateEditFlow: 0,
                payRequest,
                transactionType,
                flow,
                stateData,
                paymentRef: transferParams.reference,
                secure2uValidateData,
                // transactionMode: transferParams.transactionMode,
                transactionMode: transferParams?.transactionMode ?? DUITNOW_INSTANT_TRANSFER,
                serviceFee: transferParams.serviceFee,
                s2uPollingFlow,

                festiveFlag,
                festiveImage,
                notesText: festiveFlag ? festiveNotes : null,
                fromCta,
                isFavAnd10KAbove,
            },
            () => {
                // Show Favourite flow toast for DuitNow / Transfer
                if (
                    this.state.functionsCode === 6 ||
                    this.state.functionsCode === 7 ||
                    this.state.functionsCode === 26 ||
                    this.state.functionsCode === 29
                ) {
                    if (transferParams.transferAuthenticateRequired) {
                        if (this.state.flow == "S2U") {
                            showSuccessToast({
                                message: FIRST_TIME_FAVOURITES_S2U,
                            });
                        } else {
                            showSuccessToast({
                                message: FIRST_TIME_FAVOURITES,
                            });
                        }
                    }
                }
                // if transferFlow not Request money flow get user accounts
                if (this.state.transferFlow != 16) {
                    this.getAllAccounts();
                }
                // update screen Recipient Name and Other Screen Data
                this.getRecipientName();
                // update screen currency and Other Screen Data
                this.renderCurrency();

                // if DuitNow display Transfer Type option
                if (this.state.transferFlow === 12) {
                    this.setState({
                        list: [
                            {
                                name: ONE_OFF_TRANSFER,
                                index: 0,
                                const: "ONE_OFF_TRANSFER",
                                isSelected: false,
                            },
                            {
                                name: RECURRING,
                                index: 1,
                                const: "RECURRING",
                                isSelected: false,
                            },
                        ],
                    });
                }
                this.setState({ showInitLoader: false });
            }
        );
    };

    //S2U V4
    s2uSDKInit = async (params) => {
        try {
            params.formattedDate = `${getRequiredDateFormat(
                params.startDate
            )} - ${getRequiredDateFormat(params.endDate)}`;
            if (params.proxyIdType === "MBNO") {
                params.customerId = SSLUserContacteNoClass(params.proxyId).inFullDisplayFormat();
            } else if (params.proxyIdType === "NRIC") {
                params.customerId = formatICNumber(params.proxyId);
            } else {
                params.customerId = params.proxyId;
            }
            delete params.twoFAType;
            params.formattedAccNumber = formateAccountNumber(params.fromAccNo, 12);
            params.fromAccountName = this.state.fromAccountName;
            return await init(FN_DUITNOW_RECURRING, params);
        } catch (err) {
            console.log(err);
        }
    };

    //S2U V4
    initiateS2USdk = async (params, transferParams) => {
        try {
            const s2uInitResponse = await this.s2uSDKInit(params);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message || COMMON_ERROR_MSG,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    const { getModel } = this.props;
                    const { isS2uV4ToastFlag } = getModel("misc");
                    this.setState({ isS2UDown: isS2uV4ToastFlag ?? false });
                    this.handleProceedOtp(params, transferParams);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log("Duitnow details s2u catch : ", error);
            s2uSdkLogs(error, "DuitNow Details");
        }
    };

    handleProceedOtp = (params, transferParams) => {
        this.setState(
            {
                challengeRequest: params,
                params,
                duItNowParams: params,
                transferParams,
            },
            () => {
                //if DuitNow Recurring Open or first time favourite Transactions show TAC
                this.setState({ showTAC: true, showOverlay: true, loader: true });
            }
        );
    };
    //S2U V4
    initS2UPull = async (s2uInitResponse) => {
        const {
            navigation: { navigate },
        } = this.props;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.mapperData) {
                    this.setState({
                        showV4S2u: true,
                        mapperData: challengeRes.mapperData,
                        secure2uValidateData: challengeRes.mapperData,
                        s2uTransactionDetails: challengeRes.mapperData,
                        s2uEnablement: true,
                    });
                } else {
                    showErrorToast({ message: challengeRes?.message });
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    //S2U V4
    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: navigationConstant.TAB_NAVIGATOR,
            succScreen: navigationConstant.TAB,
        };
        navigateToS2UReg(navigate, this?.route?.params, redirect);
    };

    /***
     * getAllAccounts
     * get the user accounts and filter from and To accounts
     * if from account not there set primary account as from account
     */
    getAllAccounts = async () => {
        const { transferParams } = this.state;
        console.log("getAllAccounts  transferParams ======>  ", transferParams);
        try {
            const path = `/summary?type=A`;
            //get the user accounts
            const response = await bankingGetDataMayaM2u(path, false);
            if (response && response.data && response.data.code === 0) {
                const { accountListings } = response.data.result;
                if (accountListings && accountListings.length) {
                    const listData = accountListings;
                    if (listData) {
                        //get from Account
                        const fromAccount =
                            transferParams && transferParams.fromAccount
                                ? transferParams.fromAccount.substring(0, 12)
                                : "";

                        const newAccountList = [];
                        let accountItem = "";
                        let primaryAccount = "";
                        for (let i = 0; i < listData.length; i++) {
                            accountItem = listData[i];
                            //get primary Account
                            if (accountItem.primary) {
                                primaryAccount = accountItem.number;
                            }
                            newAccountList.push(listData[i]);
                        }
                        this.setState(
                            {
                                userToAccountList: newAccountList,
                                fromAccountTemp: fromAccount,
                                primaryAccount,
                            },
                            () => {
                                //set selected Account
                                this._setSelectFromAccount(newAccountList);
                            }
                        );
                    }
                }
            }
        } catch (error) {
            // error when retrieving the data
            console.log("getAllAccounts error : ", error);
        }
    };

    /***
     * _setSelectFromAccount
     * set selected Acccount either from account or primary account
     */
    _setSelectFromAccount = (newAccountList) => {
        const { transferParams, fromAccountTemp, primaryAccount } = this.state;
        try {
            //Remove To Account From Account List  //Set Selected Account in Account List

            const tempArray = newAccountList.slice();
            let tempAccount = "";
            let selectedAccountObj = "";
            const nonSelectedAccounts = [];
            const targetSelectedAccounts = [];
            let toAccount = "";
            let fromAccountTempSelected = "";
            let formatedFromAccountTemp = "";

            let fromAccount = "";
            let fromAccountCode = "";
            let fromAccountName = "";
            let formatedFromAccount = "";

            fromAccountTempSelected = transferParams.fromAccount;
            //if No Primary Account Select primary account as from account
            const fromAccountFromScreen = !fromAccountTempSelected
                ? primaryAccount
                : fromAccountTempSelected;
            fromAccountTempSelected = fromAccountFromScreen;
            toAccount = transferParams.toAccount;

            let accountItem = "";
            for (let j = 0; j < tempArray.length; j++) {
                //Remove To Account  From Accounts in List
                accountItem = tempArray[j];
                tempAccount = tempArray[j].number;
                //if Own account Transfer filter To account from list
                if (this.state.transferFlow != 1) {
                    toAccount = "";
                }
                //Remove To Account  From Accounts in List
                if (
                    accountItem &&
                    (!toAccount ||
                        (toAccount && toAccount.substring(0, 12) != tempAccount.substring(0, 12)))
                ) {
                    //Compare from Account with account number and marked as selected
                    if (
                        tempAccount != undefined &&
                        fromAccountTempSelected != undefined &&
                        fromAccountTempSelected.substring(0, 12) === tempAccount.substring(0, 12)
                    ) {
                        tempArray[j].selected = true;
                        selectedAccountObj = tempArray[j];
                        formatedFromAccountTemp = formateAccountNumber(tempArray[j].number, 12);

                        fromAccount = tempArray[j].number;
                        fromAccountCode = tempArray[j].code;
                        fromAccountName = tempArray[j].name;
                        formatedFromAccount = formatedFromAccountTemp;
                    } else {
                        //Filter non selected Acoounts
                        tempArray[j].selected = false;
                        nonSelectedAccounts.push(tempArray[j]);
                    }
                }
            }
            //Set Selected Account in Account List add it First to Account list
            if (selectedAccountObj != null && selectedAccountObj != "") {
                targetSelectedAccounts.push(selectedAccountObj);
            }
            //if no account match set first account as selected Account
            if (
                nonSelectedAccounts &&
                nonSelectedAccounts.length >= 1 &&
                targetSelectedAccounts.length < 1
            ) {
                selectedAccountObj = nonSelectedAccounts[0];
                selectedAccountObj.selected = true;
                formatedFromAccountTemp = formateAccountNumber(selectedAccountObj.number, 12);
                fromAccount = selectedAccountObj.number;
                fromAccountCode = selectedAccountObj.code;
                fromAccountName = selectedAccountObj.name;
                nonSelectedAccounts[0] = selectedAccountObj;
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
            this.setState({
                fromAccount,
                fromAccountCode,
                fromAccountName,
                formatedFromAccount,
                accounts: targetSelectedAccounts,
                selectedAccount: selectedAccountObj,
                transferParams: newTransferParams,
            });
        } catch (e) {
            console.log("catch ==> ", e);
        }
    };

    /***
     * _onAccountListClick
     * Change Selected Account Click listener
     */
    _onAccountListClick = (item) => {
        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType == "account") {
            this.setState({ amountZeroError: true });
        } else {
            const tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }

            this.setState({
                accounts: tempArray,
                selectedAccount: item,
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
        this.setState({ notesText: text || null });
    };

    /***
     *_onPaymentOptionTextDone
     * Notes / Payment option keyboard Done click listener
     */
    _onPaymentOptionTextDone = (text) => {
        if (text != null && text != undefined && text != "" && text.length >= 1) {
            const validate = getDayDateFormat(text);
            if (!validate) {
                this.setState({ notesError: true });
            }
        }
    };

    /***
     * _onEditAmount
     * On Click listener to open Amount edit screen
     */
    _onEditAmount = () => {
        this.dontUpdateNextFocus = true;
        const { transferParams, transferFlow, festiveFlag, fromCta } = this.state;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};

        if (transferFlow === 12) {
            transferParams.imageBase64 = true;
            transferParams.minAmount = 0.01;
            transferParams.maxAmount = 999999.99;
            transferParams.screenTitle = DUITNOW;
            transferParams.screenLabel = ENTER_AMOUNT;
            transferParams.amountError = AMOUNT_NEEDS_TO_BE_001;
            transferParams.maxAmountError = AMOUNT_EXCEEDS_MAXIMUM;
            transferParams.amountLength = 8;
            transferParams.formattedToAccount = transferParams.idValueFormatted;
        } else if (transferFlow === 15 || transferFlow === 16) {
            transferParams.imageBase64 = !transferParams.image;
            transferParams.minAmount = 0.01;
            transferParams.maxAmount = 99999.99;
            transferParams.screenTitle = festiveFlag
                ? this.props.festiveAssets.sendMoney.headerTitleEnterAmount
                : "";
            transferParams.screenLabel = ENTER_AMOUNT;
            transferParams.amountError = AMOUNT_NEEDS_TO_BE_001;
            transferParams.amountLength = 8;
        } else {
            transferParams.imageBase64 = true;
            transferParams.minAmount = 0.01;
            transferParams.maxAmount = 999999.99;
            transferParams.screenTitle = TRANSFER;
            transferParams.screenLabel = ENTER_AMOUNT;
            transferParams.amountError = AMOUNT_ERROR;
            transferParams.amountLength = 8;
        }
        this.props.navigation.navigate(navigationConstant.AMOUNT_STACK, {
            screen: navigationConstant.AMOUNT_SCREEN,
            params: {
                onLoginSuccess: (val) => {
                    this._onEitAmountSuccess(val);
                },
                transferParams,
                festiveFlag,
                festiveObj,
                fromCta,
            },
        });
    };

    /***
     * _onEitAmountSuccess
     * Listener to update the new amount
     */
    _onEitAmountSuccess = (val) => {
        const { transferParams } = this.state;
        const amountValue = val ? val.toString().replace(/,/g, "").replace(".", "") : 0;
        transferParams.amount = val;
        transferParams.formattedAmount = val;
        transferParams.amountValue = amountValue;
        this.setState(
            {
                transferAmount: CURRENCY + val,
                transferParams,
            },
            () => {
                this.renderCurrency();
            }
        );
    };

    /**
     *_onConfirmClick
     * @memberof TransferConfirmationScreen
     *
     * this.state.transferFlow Transfer Flows
     * transferFlow == 1 --> Own Account Fund transfer
     * transferFlow == 2 --> Favourite Maybank Account Fund transfer
     * transferFlow == 3 --> MayBank Third Party Fund Transfer Secure2u / MayBank Third Party Fund Transfer TAG
     * transferFlow == 4 --> IBFT Other Bank Fund Transfer TAC / IBFT Other Bank Fund Transfer Secure2u
     * transferFlow == 5 --> IBFT Favorite Fund Transfer
     * transferFlow == 2 && functionsCode == 6 --> Favourite Maybank Account Fund transfer First Time
     * transferFlow == 5 && functionsCode == 7 --> IBFT Favorite Fund Transfer First Time
     *
     *  transferFlow == 11 --> Mobile RELOAD
     *  transferFlow == 12 / 2 --> ( transferMaybank == true &&  .transferFav  == true &&  .isRecurringTransfer == false)
     *                         --> DuIt Now Maybank Favourite
     *  transferFlow == 12 / 3 --> ( transferMaybank == true &&  .transferFav  == false &&  .isRecurringTransfer == false)
     *                         --> DuIt Now Maybank Open Transfer
     *  transferFlow == 12 / 4 --> ( transferOtherBank == true )
     *                         --> DuIt Now Other Bank Open IBFT  / Credit Transfer
     *  transferFlow == 12  && functionsCode == 30 --> DuIt Now Recurring Transfer
     *  transferFlow == 13 --> Pay to Cards
     *  transferFlow == 14 --> PartnerPayment
     *  transferFlow == 15 --> Send Money
     *  transferFlow == 16 --> Request Money
     *  transferFlow == 17 --> Pay bills
     *  transferFlow == 18 --> Goal Tabung Funding
     * transferFlow == 19 --> Goal Tabung  Withdraw
     * transferFlow == 20 --> Goal Remove
     * transferFlow == 21 --> Wetix setup / payment
     * transferFlow == 22 --> Airpass setup / payment
     * transferFlow == 23 -->  KLIA
     * transferFlow == 24 --> Catch the Bus setup / payment
     */
    _onConfirmClick = async () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        const {
            disabled,
            formatedStartDate,
            formatedEndDate,
            duitNowRecurring,
            isFutureTransfer,
            fromAccount,
            fromAccountCode,
            fromAccountName,
            formatedFromAccount,
            effectiveDate,
            notesText,
            secure2uValidateData,
            selectedAccount,
            transferFlow,
            startDateInt,
            endDateInt,
            accounts,
            payRequest,
        } = this.state;
        const { transferParams } = this.state;
        // If the transferFlow is 16 (Request Money), no SelectedAccount required
        if (disabled || (!selectedAccount && transferFlow !== 16)) {
            return;
        }
        this.setState({ disabled: true });
        console.log("[TransferConfirmationScreen] >> [_onConfirmClick]  : ");

        let validateNotes = true;

        if (notesText && notesText.length >= 1) {
            validateNotes = paymentDetailsRegexOtherBank(notesText);
        }
        if (validateNotes || (transferFlow === 15 && payRequest)) {
            if (transferFlow === 16 || (transferFlow != 16 && accounts && accounts.length >= 1)) {
                this.setState({
                    showOverlay: true,
                    loader: true,
                });
                // To DO : use mobile SDK for RSA Integration
                const deviceInfo = this.props.getModel("device");
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
                transferParams.notesText = notesText;
                transferParams.startDateInt = startDateInt;
                transferParams.endDateInt = endDateInt;
                transferParams.transferType = null;
                transferParams.transferSubType = null;
                transferParams.twoFAType = null;

                const amount = transferParams.amount;
                let transferAmount = "0.00";

                if (transferParams && transferParams.amount) {
                    transferAmount = amount.indexOf(",") === -1 ? amount : amount.replace(/,/g, "");
                }
                // Own Account Fund transfer
                if (transferFlow === 1) {
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_OWN_ACCT;
                    transferParams.transferSubType = null;
                    transferParams.twoFAType = null;

                    this._fundTransferApi(transferParams, "", this.state.flow);
                } else if (transferFlow === 2) {
                    // Favourite Maybank Account Fund transfer
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_MAYBANK;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_FAVORITE;
                    transferParams.twoFAType = null;

                    if (
                        transferParams.transferAuthenticateRequired ||
                        this.state.isFavAnd10KAbove
                    ) {
                        if (this.state.flow === "S2U" || this.state.isFavAnd10KAbove) {
                            // Call S2u API
                            transferParams.twoFAType = this.state.s2uPollingFlow
                                ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                            transferParams.transferSubType =
                                this.state.isFavAnd10KAbove &&
                                !transferParams.transferAuthenticateRequired
                                    ? FundConstants.SUB_TYPE_OPEN
                                    : FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME; // For subsequent fav transfer above 10K limit we have to pass OPEN payload rest all remains same
                            this.setState(
                                {
                                    transferParams,
                                },
                                () => {
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        } else {
                            // Save params in state until TAC is complete
                            //MayBank Third Party Fund Transfer TAG
                            transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                            transferParams.transferSubType =
                                FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME;

                            const params = {
                                amount: transferAmount,
                                fromAcctNo: transferParams.fromAccount,
                                fundTransferType: FundConstants.THIRD_PARTY_FUND_TRANSFER,
                                accCode: transferParams.fromAccountCode,
                                toAcctNo: transferParams.toAccount,
                                payeeName: transferParams.accountName,
                                payeeBank: transferParams.bankName,
                            };
                            this.setState(
                                {
                                    transferParams,
                                    tacParams: params,
                                },
                                () => {
                                    //this.setState({ showTAC: true });
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        }
                    } else {
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    }
                } else if (transferFlow === 3) {
                    // Maybank Open Account Fund transfer and Send Money Transfer
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_MAYBANK;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                    transferParams.twoFAType = null;

                    if (this.state.transferFlow === 15) {
                        transferParams.transactionMode = "Send Money";
                    }

                    if (this.state.flow == "S2U") {
                        // Call S2u API
                        transferParams.twoFAType = this.state.s2uPollingFlow
                            ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                            : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    } else {
                        // Save params in state until TAC is complete
                        //MayBank Third Party Fund Transfer TAG
                        transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                        const params = {
                            amount: transferAmount,
                            fromAcctNo: transferParams.fromAccount,
                            fundTransferType: FundConstants.THIRD_PARTY_FUND_TRANSFER,
                            accCode: transferParams.fromAccountCode,
                            toAcctNo: transferParams.toAccount,
                            payeeName: transferParams.accountName,
                            payeeBank: transferParams.bankName,
                        };
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                            },
                            () => {
                                //this.setState({ showTAC: true });
                                this._fundTransferApi(transferParams, "", this.state.flow);
                            }
                        );
                    }
                } else if (transferFlow === 4) {
                    //Other Bank Fund Transfer
                    transferParams.mbbbankCode = transferParams.transferBankCode;
                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_INTERBANK;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                    transferParams.twoFAType = null;

                    if (this.state.flow == "S2U") {
                        // Call S2u API
                        transferParams.twoFAType = this.state.s2uPollingFlow
                            ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                            : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    } else {
                        // Save params in state until TAC is complete
                        //MayBank Third Party Fund Transfer TAG
                        transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;

                        const params = {
                            amount: parseFloat(transferAmount),
                            fromAcctNo: transferParams.fromAccount,
                            fundTransferType:
                                transferParams.transactionMode === "GIRO"
                                    ? "GIRO_FUND_TRANSFER"
                                    : FundConstants.IBFT_FUND_TRANSFER,
                            accCode: transferParams.fromAccountCode,
                            toAcctNo: transferParams.toAccount,
                            payeeName: transferParams.accountName,
                            payeeBank: transferParams.bankName,
                        };
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                            },
                            () => {
                                // this.setState({ showTAC: true });
                                this._fundTransferApi(transferParams, "", this.state.flow);
                            }
                        );
                    }
                } else if (transferFlow === 5) {
                    //Other Bank Fund Transfer TAC
                    transferParams.mbbbankCode = transferParams.transferBankCode;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_INTERBANK;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_FAVORITE;
                    transferParams.twoFAType = null;

                    if (
                        transferParams.transferAuthenticateRequired ||
                        this.state.isFavAnd10KAbove
                    ) {
                        if (this.state.flow === "S2U" || this.state.isFavAnd10KAbove) {
                            // Call S2u API
                            transferParams.twoFAType = this.state.s2uPollingFlow
                                ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                            transferParams.transferSubType =
                                this.state.isFavAnd10KAbove &&
                                !transferParams.transferAuthenticateRequired
                                    ? FundConstants.SUB_TYPE_OPEN
                                    : FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME; // For subsequent fav transfer above 10K limit we have to pass OPEN payload rest all remains same
                            this._fundTransferApi(transferParams, "", this.state.flow);
                        } else {
                            // Save params in state until TAC is complete
                            //MayBank Third Party Fund Transfer TAG
                            transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                            transferParams.transferSubType =
                                FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME;

                            const params = {
                                amount: transferAmount,
                                fromAcctNo: transferParams.fromAccount,
                                // fundTransferType: FundConstants.IBFT_FUND_TRANSFER,
                                fundTransferType:
                                    transferParams.transactionMode === "GIRO"
                                        ? "GIRO_FUND_TRANSFER"
                                        : FundConstants.IBFT_FUND_TRANSFER,
                                accCode: transferParams.fromAccountCode,
                                toAcctNo: transferParams.toAccount,
                                payeeName: transferParams.accountName,
                                payeeBank: transferParams.bankName,
                            };
                            this.setState(
                                {
                                    transferParams,
                                    tacParams: params,
                                },
                                () => {
                                    // this.setState({ showTAC: true });
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        }
                    } else {
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    }
                } else if (
                    transferFlow === 12 &&
                    transferParams.transferMaybank &&
                    !transferParams.transferFav &&
                    !duitNowRecurring
                ) {
                    //Duit Now Maybank Open

                    console.log(" this.state.transferFlow ", this.state.transferFlow);

                    transferParams.swiftCode = FundConstants.MBB_BANK_CODE_MAYBANK;
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_DUITNOW_ON_US;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                    transferParams.twoFAType = null;

                    if (this.state.flow == "S2U") {
                        // Call S2u API
                        transferParams.twoFAType = this.state.s2uPollingFlow
                            ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                            : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    } else {
                        // Save params in state until TAC is complete
                        //MayBank Third Party Fund Transfer TAG
                        transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;

                        const transferRegRefNo = transferParams.transferRegRefNo;

                        const params = {
                            amount: transferAmount,
                            fundTransferType: isFutureTransfer
                                ? FundConstants.DUITNOW_CREDIT_TRANSFER_OTP
                                : FundConstants.THIRD_PARTY_FUND_TRANSFER,
                            fromAcctNo: transferParams.fromAccount,
                            accCode: transferParams.fromAccountCode,
                            toAcctNo: transferRegRefNo,
                            payeeName: transferParams.actualAccHolderName,
                            payeeBank: transferParams.bankName,
                        };
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                            },
                            () => {
                                //this.setState({ showTAC: true });
                                this._fundTransferApi(transferParams, "", this.state.flow);
                            }
                        );
                    }
                } else if (
                    transferFlow === 12 &&
                    transferParams.transferMaybank &&
                    transferParams.transferFav &&
                    !duitNowRecurring
                ) {
                    //Duit Now Maybank Favourite Account

                    transferParams.swiftCode = FundConstants.MBB_BANK_CODE_MAYBANK;
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_DUITNOW_ON_US;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_FAVORITE;
                    transferParams.twoFAType = null;
                    if (
                        transferParams.transferAuthenticateRequired ||
                        this.state.isFavAnd10KAbove
                    ) {
                        //MayBank Third Party Fund Transfer TAG

                        if (this.state.flow === "S2U" || this.state.isFavAnd10KAbove) {
                            // Call S2u API
                            transferParams.twoFAType = this.state.s2uPollingFlow
                                ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                            transferParams.transferSubType =
                                this.state.isFavAnd10KAbove &&
                                !transferParams.transferAuthenticateRequired
                                    ? FundConstants.SUB_TYPE_OPEN
                                    : FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME; // For subsequent above 10K limit we have to pass OPEN payload rest all remains same
                            this.setState(
                                {
                                    transferParams,
                                },
                                () => {
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        } else {
                            // Save params in state until TAC is complete
                            //MayBank Third Party Fund Transfer TAG
                            transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                            transferParams.transferSubType =
                                FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME;

                            const toAcctNo = transferParams.idValue.replace(/\s/g, "");

                            const params = {
                                amount: transferAmount,
                                fundTransferType: FundConstants.DUITNOW_FIRST_TIME_REQ,
                                fromAcctNo: transferParams.fromAccount,
                                accCode: transferParams.fromAccountCode,
                                toAcctNo,
                                payeeName: transferParams.actualAccHolderName,
                                payeeBank: transferParams.bankName,
                            };
                            this.setState(
                                {
                                    transferParams,
                                    tacParams: params,
                                },
                                () => {
                                    //this.setState({ showTAC: true });
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        }
                    } else {
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    }
                } else if (
                    transferFlow === 12 &&
                    !transferParams.transferMaybank &&
                    !transferParams.transferFav &&
                    !duitNowRecurring
                ) {
                    //Duit Now Other Bank TAC & Secure2u
                    console.log(" Duit Now Other Bank TAC & Secure2u ");

                    transferParams.swiftCode = transferParams.transferBankCode;
                    transferParams.mbbbankCode = transferParams.transferBankCode;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_DUITNOW_OFF_US;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                    transferParams.twoFAType = null;
                    if (this.state.flow == "S2U") {
                        // Call S2u API
                        transferParams.twoFAType = this.state.s2uPollingFlow
                            ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                            : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                        this.setState({
                            transferParams,
                        });
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    } else {
                        // Save params in state until TAC is complete
                        //MayBank Third Party Fund Transfer TAG
                        transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;

                        const transferRegRefNo = transferParams.transferRegRefNo;

                        const params = {
                            amount: transferAmount,
                            fundTransferType: FundConstants.DUITNOW_CREDIT_TRANSFER_OTP,
                            fromAcctNo: transferParams.fromAccount,
                            accCode: transferParams.fromAccountCode,
                            toAcctNo: transferRegRefNo,
                            payeeName: transferParams.actualAccHolderName,
                            payeeBank: transferParams.bankName,
                        };
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                            },
                            () => {
                                // this.setState({ showTAC: true });
                                this._fundTransferApi(transferParams, "", this.state.flow);
                            }
                        );
                    }
                } else if (
                    transferFlow === 12 &&
                    !transferParams.transferMaybank &&
                    transferParams.transferFav &&
                    !duitNowRecurring
                ) {
                    //Duit Now Other Bank Favorite  TAC & Secure2u
                    transferParams.swiftCode = transferParams.transferBankCode;
                    transferParams.mbbbankCode = transferParams.transferBankCode;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_DUITNOW_OFF_US;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_FAVORITE;
                    transferParams.twoFAType = null;

                    if (
                        transferParams.transferAuthenticateRequired ||
                        this.state.isFavAnd10KAbove
                    ) {
                        //MayBank Third Party Fund Transfer TAG

                        if (this.state.flow === "S2U" || this.state.isFavAnd10KAbove) {
                            // Call S2u API
                            transferParams.twoFAType = this.state.s2uPollingFlow
                                ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                                : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                            transferParams.transferSubType =
                                !transferParams.transferAuthenticateRequired
                                    ? FundConstants.SUB_TYPE_OPEN
                                    : FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME; // For subsequent above 10K limit we have to pass OPEN payload rest all remains same

                            this.setState(
                                {
                                    transferParams,
                                },
                                () => {
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        } else {
                            // Save params in state until TAC is complete
                            transferParams.transferSubType =
                                FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME;
                            transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;

                            const transferRegRefNo = transferParams.transferRegRefNo;

                            const params = {
                                amount: transferAmount,
                                fundTransferType: FundConstants.DUITNOW_CREDIT_TRANSFER_OTP,
                                fromAcctNo: transferParams.fromAccount,
                                accCode: transferParams.fromAccountCode,
                                toAcctNo: transferRegRefNo,
                                payeeName: transferParams.actualAccHolderName,
                                payeeBank: transferParams.bankName,
                            };
                            this.setState(
                                {
                                    transferParams,
                                    tacParams: params,
                                },
                                () => {
                                    this._fundTransferApi(transferParams, "", this.state.flow);
                                }
                            );
                        }
                    } else {
                        transferParams.twoFAType = null;
                        this.setState({
                            transferParams,
                        });
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    }
                } else if (transferFlow === 12 && duitNowRecurring) {
                    //DuIt Now isRecurringTransfer = true
                    transferParams.duitNowRecurring = true;
                    if (transferParams.transferMaybank) {
                        transferParams.transferType =
                            FundConstants.FUND_TRANSFER_TYPE_DUITNOW_ON_US;
                    } else {
                        transferParams.transferType =
                            FundConstants.FUND_TRANSFER_TYPE_DUITNOW_OFF_US;
                    }

                    if (transferParams.transferMaybank) {
                        transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;
                    } else {
                        transferParams.mbbbankCode = transferParams.transferBankCode;
                    }

                    const fundTransferType = FundConstants.DUITNOW_RECURRING_TRANSFER_OTP;
                    let flow = S2U_PULL;

                    const toAcctNo = transferParams.idValue.replace(/\s/g, "");

                    const params = {
                        amount: transferAmount,
                        fundTransferType,
                        fromAcctNo: transferParams.fromAccount,
                        accCode: transferParams.fromAccountCode,
                        toAcctNo,
                        payeeName: transferParams.actualAccHolderName,
                        payeeBank: transferParams.bankName,
                    };

                    if (transferParams.transferFav) {
                        if (transferParams.transferAuthenticateRequired) {
                            transferParams.transferSubType =
                                FundConstants.SUB_TYPE_FAVORITE_FIRST_TIME;
                            transferParams.twoFAType = FundConstants.S2U_PULL;
                        } else {
                            transferParams.transferSubType = FundConstants.SUB_TYPE_FAVORITE;
                            transferParams.twoFAType = null;
                        }
                    } else {
                        transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                        transferParams.twoFAType = S2U_PULL;
                    }
                    if (
                        transferParams.transferFav &&
                        !transferParams.transferAuthenticateRequired
                    ) {
                        //DuIt Now isRecurringTransfer = true fav
                        flow = "Fav";
                        this.setState({ tacParams: params, loader: true, transferParams }, () => {
                            this._duItNowRecurring("", transferParams, flow);
                        });
                    } else {
                        //DuIt Now isRecurringTransfer = true
                        //flow = "TAC";
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                                loader: false,
                            },
                            () => {
                                //this.setState({ showTAC: true });
                                this._duItNowRecurring("", transferParams, flow);
                            }
                        );
                    }
                } else if (transferFlow === 15) {
                    //Send Money Transfer
                    transferParams.mbbbankCode = FundConstants.MBB_BANK_CODE_MAYBANK;

                    transferParams.transferType = FundConstants.FUND_TRANSFER_TYPE_MAYBANK;
                    transferParams.transferSubType = FundConstants.SUB_TYPE_OPEN;
                    transferParams.twoFAType = null;

                    transferParams.transactionMode = "Send Money";

                    if (this.state.flow == "S2U") {
                        // Call S2u API
                        transferParams.twoFAType = this.state.s2uPollingFlow
                            ? FundConstants.TWO_FA_TYPE_SECURE2U_PUSH
                            : FundConstants.TWO_FA_TYPE_SECURE2U_PULL;
                        this._fundTransferApi(transferParams, "", this.state.flow);
                    } else {
                        // Save params in state until TAC is complete
                        //MayBank Third Party Fund Transfer TAG
                        transferParams.twoFAType = FundConstants.TWO_FA_TYPE_TAC;
                        const params = {
                            amount: transferAmount,
                            fromAcctNo: transferParams.fromAccount,
                            fundTransferType: FundConstants.SEND_RCV_MONEY,
                            accCode: transferParams.fromAccountCode,
                            toAcctNo: transferParams.toAccount,
                            payeeName: transferParams.accountName,
                            payeeBank: transferParams.bankName,
                        };
                        this.setState(
                            {
                                transferParams,
                                tacParams: params,
                            },
                            () => {
                                //this.setState({ showTAC: true });
                                this._fundTransferApi(transferParams, "", this.state.flow);
                            }
                        );
                    }
                } else if (transferFlow === 16) {
                    //Request Money
                    this._onRequestMoneyAPI();
                } else {
                    this.setState({ loader: false });
                }
                this.setState({ transferParams });
            } else {
                this.setState({ loader: false, fromAccountError: true, showOverlay: false });
            }
        } else {
            showErrorToast({
                message: PLEASE_REMOVE_INVALID_PAYMENT_DETAILS,
            });
        }
    };

    /***
     * showS2uModal
     * show S2u modal to approve the Transaction
     */
    showS2uModal = (response, transferParams) => {
        const {
            transferFlow,
            isFutureTransfer,
            formatedFromAccount,
            formatedStartDate,
            functionsCode,
        } = this.state;
        const {
            recipientName,
            formattedToAccount,
            fromAccountName,
            amount,
            toAccountBank,
            idValueFormatted,
            phoneNumber,
            actualAccHolderName,
            transactionMode,
        } = transferParams;
        const { pollingToken, token } = response;
        const s2uTransactionDetails = [];
        if (transferFlow <= 3) {
            //Maybank Third Party Fund Transfer
            s2uTransactionDetails.push({
                label: TO,
                value: `${formateIDName(recipientName, " ", 2)}\n${formattedToAccount}`,
            });
            s2uTransactionDetails.push({
                label: FROM,
                value: `${fromAccountName}\n${formatedFromAccount}`,
            });
            s2uTransactionDetails.push({
                label: TRANSACTION_TYPE,
                value: "Transfer",
            });
            s2uTransactionDetails.push({
                label: DATE,
                value: isFutureTransfer ? formatedStartDate : response.serverDate,
            });
        } else if (transferFlow === 15) {
            //Send Money Transfer
            s2uTransactionDetails.push({
                label: SEND_TO,
                value: `${formateIDName(recipientName, " ", 2)}\n${formatMobileNumbersRequest(
                    phoneNumber
                )}`,
            });
            s2uTransactionDetails.push({
                label: SEND_FROM,
                value: `${fromAccountName}\n${formatedFromAccount}`,
            });
            s2uTransactionDetails.push({
                label: TRANSACTION_TYPE,
                value: "Transfer",
            });
            s2uTransactionDetails.push({
                label: SEND_ON,
                value: isFutureTransfer ? formatedStartDate : response.serverDate,
            });
        } else if (transferFlow === 4 || transferFlow === 5 || functionsCode === 7) {
            //Other bank Party Fund Transfer
            s2uTransactionDetails.push({
                label: TO,
                value: `${formateIDName(toAccountBank, " ", 2)}\n${formateIDName(
                    recipientName,
                    " ",
                    2
                )}\n${formattedToAccount}`,
            });
            s2uTransactionDetails.push({
                label: FROM,
                value: `${fromAccountName}\n${formatedFromAccount}`,
            });
            s2uTransactionDetails.push({
                label: TRANSACTION_TYPE,
                value: transactionMode || DUITNOW_INSTANT_TRANSFER,
            });
            s2uTransactionDetails.push({
                label: DATE,
                value: isFutureTransfer ? formatedStartDate : response.serverDate,
            });
        } else if (transferFlow === 12) {
            //DuitNow Transfer
            s2uTransactionDetails.push({
                label: TO,
                value: `${formateIDName(actualAccHolderName, " ", 2)}\n${idValueFormatted}`,
            });
            s2uTransactionDetails.push({
                label: FROM,
                value: `${fromAccountName}\n${formatedFromAccount}`,
            });
            s2uTransactionDetails.push({
                label: TRANSACTION_TYPE,
                value: "DuitNow",
            });
            s2uTransactionDetails.push({
                label: DATE,
                value: isFutureTransfer ? formatedStartDate : response.serverDate,
            });
        }
        const s2uPollingToken = pollingToken || token || "";
        //Show S2U Model update the payload
        this.setState(
            {
                seletedAmount: amount,
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    /*
     * onS2uDone
     * Handle S2U Approval or Rejection Flow
     */
    onS2uDone = (response) => {
        let { transferParams, festiveFlag, fromCta } = this.state;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};
        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        this.onS2uClose();
        console.log("[TransferConfirmationScreen] >> [onS2uDone] s2uSignRespone  ", s2uSignRespone);
        //Transaction Sucessful
        if (transactionStatus) {
            // Show success page
            const transactionId = transferParams.formattedTransactionRefNumber;
            //transferParams.transactionDate = this.state.todayDate;
            const { statusDescription, text, status } = s2uSignRespone;
            transferParams.transactionStatus = true;
            transferParams.statusDescription = statusDescription || status;
            transferParams.transactionResponseError = text;
            if (
                transferParams &&
                transferParams.statusDescription &&
                transferParams.statusDescription != "Accepted"
            ) {
                transferParams.transactionResponseError = "";
            }

            this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId || "",
                errorMessge: null,
                festiveFlag,
                festiveObj,
                fromCta,
                isS2uFlow: this.state.flow === "S2U",
            });
        } else {
            //Transaction Failed
            const { text, status, statusDescription } = s2uSignRespone;
            const serverError = text || "";
            transferParams.transactionStatus = false;
            transferParams.transactionResponseError = serverError;
            transferParams.statusDescription = statusDescription;
            let transactionId =
                transferParams && transferParams.formattedTransactionRefNumber
                    ? transferParams.formattedTransactionRefNumber
                    : "";
            //M201 When User Rejects the Transaction inb S2U

            if (status === "M201") {
                console.log("[TransferConfirmationScreen] >> [onS2uDone] failed status : M201 ");
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = TRANSACTION_DECLINED;
                transferParams.transferMessage = TRANSACTION_DECLINED;
            } else if (status === "M408") {
                console.log("[TransferConfirmationScreen] >> [onS2uDone] failed status : M408 ");
                //M408 Custom error handling if Transaction Approval Timeout
                transferParams.transactionResponseError = "";
                transferParams.errorMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transferParams.transferMessage = ONE_TAP_AUTHORISATION_HAS_EXPIRED;
                transactionId = transferParams.referenceNumber;
            }
            console.log("[TransferConfirmationScreen] >> [onS2uDone] failed status  ", status);
            console.log(
                "[TransferConfirmationScreen] >> [onS2uDone] failed transferParams  ",
                transferParams
            );
            this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                transferParams,
                transactionResponseObject: s2uSignRespone.payload,
                transactionReferenceNumber: transactionId,
                festiveFlag,
                festiveObj,
                fromCta,
            });
        }
    };
    onS2uV4Done = (response) => {
        const { transactionStatus, executePayload } = response;
        this.onS2uV4Close();
        const entryPoint = {
            entryStack: navigationConstant.TAB_NAVIGATOR,
            entryScreen: navigationConstant.TAB,
            params: {},
        };
        let ackDetails = {
            transactionDetails: this.state.mapperData,
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            //Navigate to Transaction success screen
            if (transactionStatus) {
                this.s2uTransactionSuccess(response);
                return;
            } else {
                const titleMessage = TRANSFER_UNSUCCESSFUL;
                ackDetails = {
                    ...ackDetails,
                    titleMessage,
                };
            }
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    s2uTransactionSuccess = (response) => {
        const { transferParams, festiveFlag, fromCta } = this.state;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};
        const { executePayload } = response;
        const mapperDataArr = [...this.state.mapperData.body];
        mapperDataArr.splice(0, 2);
        const transactionDate = mapperDataArr.pop();
        mapperDataArr.unshift(transactionDate);
        const txnNumber = formateReferenceNumber(
            executePayload?.transactionRefNumber
        ).toUpperCase();
        mapperDataArr.unshift({
            key: "Reference ID",
            value: txnNumber,
        });
        // Show success page
        const transactionId = transferParams.formattedTransactionRefNumber;
        const { statusDescription, status } = executePayload;
        transferParams.transactionStatus = true;
        transferParams.statusDescription = statusDescription || status;
        if (
            transferParams &&
            transferParams.statusDescription &&
            transferParams.statusDescription !== "Accepted"
        ) {
            transferParams.transactionResponseError = "";
        }
        this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
            transferParams,
            transactionResponseObject: executePayload.payload,
            transactionReferenceNumber: transactionId || "",
            errorMessge: null,
            festiveFlag,
            festiveObj,
            fromCta,
            isS2uFlow: this.state.flow === "S2U",
            s2uV4MapperData: mapperDataArr,
            descriptionMessage: TRANSFER_RECCURRING_M2U,
        });
    };
    /*
     * onS2uClose
     * close S2u Auth Model
     */
    onS2uClose = () => {
        console.log("[TransferConfirmationScreen] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };
    onS2uV4Close = () => {
        this.setState({ showV4S2u: false });
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
     * navigateToTACFlow
     * Show TAC Model
     */
    navigateToTACFlow = (params) => {
        // Show TAC Modal

        this.setState({ showTAC: true, tacParams: params });
    };

    /***
     * _fundTransferApi
     * Build Transaction params for TAC and S2U flow and Call transfer Api
     * And Show TAC or S2U Model
     */
    _fundTransferApi = async (transferParams, tac, flow) => {
        const { payRequest, festiveFlag } = this.state;
        // const { transferParams } = this.state;
        const {
            amount,
            actualAccHolderName,
            accountName,
            transferFlow,
            sendMoneyId,
            phoneNumber,
            fullName,
        } = transferParams;
        const transferAmount = amount.indexOf(",") === -1 ? amount : amount.replace(/,/g, "");

        //Construct Transfer params for Fund transfer, DuitNow and Send Money
        const params = {
            recipientName: transferFlow === 12 ? actualAccHolderName : accountName,
            effectiveDate: transferParams.effectiveDate,
            fromAccount: transferParams.fromAccount,
            fromAccountCode: transferParams.fromAccountCode,
            paymentRef: transferParams.reference,
            toAccount: transferParams.toAccount,
            toAccountCode: transferParams.toAccountCode,
            paymentDesc: transferParams.notesText,
            transferAmount,
            proxyId:
                transferParams.idValue &&
                transferParams.idValue != undefined &&
                transferParams.idValue.length >= 1
                    ? transferParams.idValue.replace(/\s/g, "")
                    : "",
            proxyRefNum: transferParams.transferProxyRefNo,
            proxyIdType: transferParams.idType,
            mbbbankCode: transferParams.mbbbankCode,
            transferType: transferParams.transferType,
            transferSubType: transferParams.transferSubType,
            twoFAType: transferParams.twoFAType,
            interbankPaymentType: transferParams.interbankPaymentType,
            swiftCode: transferParams.swiftCode,
            mobileSDKData: transferParams.mobileSDK, // Required For RSA
            smsTac: tac,
            recipientMayaName: transferFlow === 15 ? fullName : null,
            challenge: {},
            specialOccasion: festiveFlag,
            rayaMessage: festiveFlag ? this.props.route?.params?.festiveObj?.greetingMessage : null,
            template: festiveFlag ? this.props.route?.params?.festiveObj?.templateId : null,
            s2ufavLimitFlag: this.state.isFavAnd10KAbove ? "Y" : "N",
        };

        if (transferParams.transactionMode === "GIRO") {
            params.interbankTransferType = "IBG";
        }
        if (transferFlow === 15) {
            //Send Money or pay Money Api calls
            let sendMoneyParams = {};
            //Pay Money Params
            if (payRequest) {
                sendMoneyParams = {
                    fundTransferReq: params,
                    status: "PAID",
                    type: "SEND",
                    amount: transferAmount,
                    id: sendMoneyId,
                    mobileNo: phoneNumber,
                    challenge: {},
                    specialOccasion: !!(
                        festiveFlag ||
                        this.props.route?.params?.festiveObj?.greetingMessage ||
                        this.props.route?.params?.fromCta ||
                        this.props.route?.params?.festiveObj?.fromCta
                    ),
                    rayaMessage: this.props.route?.params?.festiveObj?.greetingMessage
                        ? this.props.route?.params?.festiveObj?.greetingMessage
                        : null,
                    template: festiveFlag ? this.props.route?.params?.festiveObj?.templateId : null,
                };
            } else {
                //Send Money Params
                sendMoneyParams = {
                    fundTransferReq: params,
                    status: "PAID",
                    type: "SEND",
                    amount: transferAmount,
                    mobileNo: phoneNumber,
                    challenge: {},
                    specialOccasion: !!(
                        festiveFlag ||
                        this.props.route?.params?.fromCta ||
                        this.props.route?.params?.festiveObj?.fromCta
                    ),
                    rayaMessage: this.props.route?.params?.festiveObj?.greetingMessage
                        ? this.props.route?.params?.festiveObj?.greetingMessage
                        : null,
                    template: festiveFlag ? this.props.route?.params?.festiveObj?.templateId : null,
                };
            }
            //Store Params for transfer params and RSA challenge
            this.setState(
                { challengeRequest: sendMoneyParams, params: sendMoneyParams, sendMoneyParams },
                () => {
                    //if Flow is S2u call api to get polling token
                    if (flow === "S2U") {
                        if (payRequest) {
                            this.payMoneyAPI(sendMoneyParams);
                        } else {
                            this.sendMoneyAPI(sendMoneyParams);
                        }
                    } else if (flow === "TAC") {
                        //if Flow is TAC open TAC model
                        this.setState({ showTAC: true });
                    } else {
                        //Default to S2u
                        if (payRequest) {
                            this.payMoneyAPI(sendMoneyParams);
                        } else {
                            this.sendMoneyAPI(sendMoneyParams);
                        }
                    }
                }
            );
        } else {
            // xxxxxxx
            //Fund Transfer or DuitNow Flow
            this.setState({ challengeRequest: params, params }, () => {
                //if Flow is S2u call api to get polling token
                if (flow === "S2U" || this.state.isFavAnd10KAbove) {
                    this.fundTransferRequest(params);
                } else if (flow === "TAC") {
                    //if Flow is TAC open TAC model
                    this.setState({ showTAC: true });
                } else {
                    //Default to S2u
                    this.fundTransferRequest(params);
                }
            });
        }
        // } else {
        //     this.setState({ notesError: true });
        // }
    };

    getTxnTypeForS2u = (isTapTasticReady) => {
        const { festiveFlag, transferParams } = this.props.route.params;
        if (transferParams?.transferFlow === 15 && festiveFlag && isTapTasticReady) {
            return "MAYASENDMONEY";
        } else if (transferParams?.transferFlow === 12) {
            return "MAEDUITNOW";
        }
    };

    /***
     * sendMoneyAPI()
     * Open Send Money Flow API Call
     */
    sendMoneyAPI = (params) => {
        this.setState({ showLoaderModal: true });

        sendMoneyApi(params)
            .then((response) => {
                //If Transfer successful
                this._fundTransferSuccess(response.data);
            })
            .catch((error) => {
                //if Transfer Failed
                this._fundTransferFailed(error);
            });
    };

    /***
     * payMoneyAPI
     * Pay for Request Money Flow Api call
     */
    payMoneyAPI = (params) => {
        this.setState({ showLoaderModal: true });

        sendMoneyPaidApi(params)
            .then((response) => {
                //If Transfer successful
                this._fundTransferSuccess(response.data);
            })
            .catch((error) => {
                //if Transfer Failed
                this._fundTransferFailed(error);
            });
    };

    /***
     * fundTransferRequest
     * Pay for Request Money Flow Api call
     */
    fundTransferRequest = (params) => {
        this.setState({ showLoaderModal: true });

        fundTransferApi(params)
            .then((response) => {
                //If Transfer successful
                this._fundTransferSuccess(response.data);
            })
            .catch((error) => {
                //if Transfer Failed
                this._fundTransferFailed(error);
            });
    };

    /***
     * _fundTransferSuccess
     * Handle Transfer Success Flow
     */
    _fundTransferSuccess = (response) => {
        const { transferParams, payRequest, transferFlow, festiveFlag, fromCta } = this.state;
        const { resetModel } = this.props;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};

        const responseObject = response;
        resetModel(["accounts"]);

        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showLoaderModal: false,
            },
            () => {
                // Add Completion
                const transactionResponseObject = responseObject;
                // Added All Transaction Status Special cases Handling
                const responseStatus = responseObject?.statusCode ?? "";
                const responseStatusDescription = responseObject?.statusDescription ?? "";
                if (
                    (responseStatus &&
                        (responseStatus === "0" ||
                            responseStatus === "M000" ||
                            responseStatus === "M001" ||
                            responseStatus === "M100" ||
                            responseStatus === "00U1" ||
                            responseStatus === "000" ||
                            responseStatus === "Accepted")) ||
                    (responseStatusDescription && responseStatusDescription === "Accepted")
                ) {
                    const transactionDate =
                        responseObject && responseObject.serverDate
                            ? responseObject.serverDate
                            : null;

                    if (
                        responseObject.statusDescription &&
                        responseObject.statusDescription === "Accepted"
                    ) {
                        transferParams.transactionResponseError =
                            responseObject.additionalStatusDescription;
                    }
                    transferParams.additionalStatusDescription =
                        responseObject.additionalStatusDescription;
                    transferParams.statusDescription = responseObject.statusDescription;
                    transferParams.transactionRefNo = responseObject.transactionRefNumber;
                    transferParams.transactionRefNumber =
                        responseObject.formattedTransactionRefNumber;
                    transferParams.formattedTransactionRefNumber =
                        responseObject.formattedTransactionRefNumber;
                    transferParams.nonModifiedTransactionRefNo =
                        responseObject.nonModifiedTransactionRefNo;
                    transferParams.referenceNumberFull = responseObject.transactionRefNumber;
                    transferParams.referenceNumber = responseObject.formattedTransactionRefNumber;
                    transferParams.transactionDate = transactionDate;
                    transferParams.serverDate = responseObject.serverDate;
                    transferParams.transactionStatus = true;
                    transferParams.transactionResponseObject = transactionResponseObject;
                    transferParams.transactionRefNumberFull = responseObject.transactionRefNumber;

                    // For subsequent fav transfer below 10K limit we have to redirect it to Transfer Acknowledgment screen
                    if (
                        (transferFlow === 5 || transferFlow === 2 || transferFlow === 12) &&
                        transferParams.transferFav &&
                        !this.state.isFavAnd10KAbove &&
                        !transferParams.transferAuthenticateRequired
                    ) {
                        this.props.navigation.navigate("TransferAcknowledgeScreen", {
                            transferParams,
                            transactionReferenceNumber:
                                responseObject.formattedTransactionRefNumber,
                            errorMessge: "",
                            festiveFlag,
                            festiveObj,
                            fromCta,
                        });
                    }

                    // if S2u get Polling Token and Open S2u Model
                    else if (this.state.flow === "S2U" || this.state.isFavAnd10KAbove) {
                        console.log("[TransferConfirmationScreen] >> [showS2uModal]");
                        if (transferFlow === 15) {
                            const { sendMoneyId } = transferParams;
                            //If Send Money or pay money add extra payload to signTranaction
                            // Request object
                            const params = {
                                sendRcvId: payRequest ? sendMoneyId : responseObject.sendRcvId,
                                txnType: payRequest ? "PAY_MONEY" : "SEND_MONEY",
                            };
                            const isFestiveFlowEntryPoint =
                                this.props.route?.params?.fromCta ||
                                this.props.route?.params?.festiveObj?.fromCta ||
                                transferParams?.includeGreeting ||
                                this.props.route?.params?.festiveObj?.greetingMessage !== "";
                            // Update Secure2u Extra Params
                            const noSpecialOccasionFlag =
                                params?.txnType !== "PAY_MONEY" &&
                                !(isFestiveFlowEntryPoint && this.props.route.params?.festiveFlag);
                            const secure2uExtraParams = {
                                metadata: {
                                    ...params,
                                    specialOccasion: !noSpecialOccasionFlag,
                                },
                                s2wTxnType: noSpecialOccasionFlag ? "SEND_MONEY_NO_CHANCE" : "",
                            };
                            console.log(
                                "[TransferConfirmationScreen] >> [_fundTransferSuccess] secure2uExtraParams : ",
                                secure2uExtraParams
                            );
                            this.setState(
                                {
                                    secure2uExtraParams,
                                    transferParams,
                                },
                                () => {
                                    this.showS2uModal(responseObject, transferParams);
                                }
                            );
                        } else {
                            const { isTapTasticReady } = this.props.getModel("misc");
                            const txnType = this.getTxnTypeForS2u();
                            let secure2uExtraParams = null;
                            if (transferParams.transactionMode === "GIRO") {
                                secure2uExtraParams = {
                                    metadata: { txnType: "IBG" },
                                };
                            }

                            if (txnType && isTapTasticReady) {
                                secure2uExtraParams = { ...secure2uExtraParams, txnType };
                            }

                            // if S2u get Polling Token and Open S2u Model
                            this.setState(
                                {
                                    transferParams,
                                    secure2uExtraParams,
                                },
                                () => {
                                    this.showS2uModal(responseObject, transferParams);
                                }
                            );
                        }
                    } else {
                        console.log(
                            "[TransferConfirmationScreen] >> [_fundTransferSuccess] TAC : ",
                            responseObject
                        );
                        console.log("[TransferConfirmationScreen] >> [TAC]");
                        this.hideTAC();
                        // if TAC Response navigate to Acknowledge Screen
                        this.props.navigation.navigate("TransferAcknowledgeScreen", {
                            transferParams,
                            transactionReferenceNumber:
                                responseObject.formattedTransactionRefNumber,
                            errorMessge: "",
                            festiveFlag,
                            festiveObj,
                            fromCta,
                        });
                    }
                } else {
                    const transactionResponseError =
                        responseObject && responseObject.additionalStatus
                            ? responseObject.additionalStatus
                            : WE_FACING_SOME_ISSUE;
                    console.log(
                        "[TransferConfirmationScreen] >> [_fundTransferSuccess] Error : ",
                        transferParams
                    );
                    transferParams.additionalStatusDescription =
                        responseObject.additionalStatusDescription;
                    transferParams.statusDescription = responseObject.statusDescription;
                    transferParams.transactionResponseError = transactionResponseError;
                    transferParams.transactionStatus = false;
                    transferParams.formattedTransactionRefNumber =
                        responseObject.formattedTransactionRefNumber;
                    this.hideTAC();
                    // if Failed navigate to Acknowledge Screen with Failure message
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        transferParams,
                        transactionResponseObject,
                        transactionReferenceNumber:
                            responseObject && responseObject.transactionRefNumber
                                ? responseObject.transactionRefNumber
                                : "",
                        festiveFlag,
                        festiveObj,
                        fromCta,
                    });
                }
            }
        );
    };

    /***
     * _fundTransferFailed
     * if Failed navigate to Acknowledge Screen with Failure message
     * And handle RSA
     */
    _fundTransferFailed = (error, token) => {
        console.log("[TransferConfirmationScreen] >> [fundTransferFailed]");
        const { transferParams, festiveFlag, fromCta } = this.state;
        const festiveObj = this.props.route?.params?.festiveObj ?? {};

        console.log("fundTransferFailed transferParams ==> ", transferParams);
        const { transferFlow } = transferParams;
        const { resetModel } = this.props;
        console.log(" ERROR error ==> ", error);
        resetModel(["accounts"]);
        let errors = {};
        let errorsInner = {};

        errors = error;
        errorsInner = error.error;

        console.log(" ERROR errors ==> ", errors);
        console.log(" ERROR errorsInner ==> ", errorsInner);
        if (transferFlow != 16) {
            transferParams.statusDescription = errorsInner.statusDescription;
        }
        if (errors.status == 428) {
            this.hideTAC();
            // Display RSA Challenge Questions if status is 428
            GATransfer.viewScreenChallengeQuestion(getTransferAccountType(this.state.transferFlow));
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: errorsInner.challenge,
                },
                loader: false,
                isRSARequired: true,
                showLoaderModal: false,
                isRSALoader: false,
                challengeQuestion:
                    errorsInner && errorsInner.challenge && errorsInner.challenge.questionText
                        ? errorsInner.challenge.questionText
                        : WE_FACING_SOME_ISSUE,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
                token,
            }));
        } else if (errors.status == 423) {
            // Display RSA Account Locked Error Message
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showLoaderModal: false,
                },
                () => {
                    // Add Completion
                    transferParams.transactionStatus = false;
                    transferParams.transactionDate = errorsInner.serverDate;
                    transferParams.error = error;
                    transferParams.transactionResponseError = "";
                    this.hideTAC();
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        errorMessge:
                            errorsInner && errorsInner.additionalStatusDescription
                                ? errorsInner.additionalStatusDescription
                                : WE_FACING_SOME_ISSUE,
                        transferParams,
                        transactionReferenceNumber: "",
                        isRsaLock: true,
                        festiveFlag,
                        festiveObj,
                        fromCta,
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
                    showLoaderModal: false,
                },
                () => {
                    // Add Completion
                    transferParams.transactionStatus = false;
                    transferParams.transactionDate = errorsInner.serverDate;
                    transferParams.error = error;
                    transferParams.transactionResponseError = "";
                    this.hideTAC();
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        errorMessge:
                            errorsInner && errorsInner.statusDescription
                                ? errorsInner.statusDescription
                                : WE_FACING_SOME_ISSUE,
                        transferParams,
                        transactionReferenceNumber: "",
                        isRsaLock: false,
                        festiveFlag,
                        festiveObj,
                        fromCta,
                    });
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
                    showLoaderModal: false,
                },
                () => {
                    // Add Completion
                    const { serverDate } = errors;
                    let transactionResponseError = "";
                    if (transferFlow === 15) {
                        transactionResponseError =
                            errorsInner &&
                            errorsInner.statusDescription &&
                            errorsInner.statusDescription != ""
                                ? errorsInner.statusDescription
                                : WE_FACING_SOME_ISSUE;
                    } else if (transferFlow != 16) {
                        transactionResponseError =
                            errors &&
                            errors.message &&
                            errors.message != undefined &&
                            errors.message != ""
                                ? errors.message
                                : WE_FACING_SOME_ISSUE;
                    }

                    let transactionRefNumber;
                    //Get Transaction Reference Number
                    if (errorsInner && errorsInner.transactionRefNumber) {
                        transactionRefNumber = errorsInner.transactionRefNumber;
                        transferParams.referenceNumber = transactionRefNumber;
                    }
                    transferParams.additionalStatusDescription =
                        errorsInner.additionalStatusDescription;
                    transferParams.transactionDate = serverDate;
                    transferParams.transactionStatus = false;
                    console.log(
                        "TransferConfirmationScreen fundTransferRequest catch(errors) transferParams ==> ",
                        transferParams
                    );
                    transferParams.transactionResponseError = transactionResponseError;
                    this.hideTAC();
                    if (transferFlow === 16) {
                        transferParams.transactionResponseError = "";
                        transactionResponseError = "";
                    }
                    // if Failed navigate to Acknowledge Screen with Failure message
                    this.props.navigation.navigate("TransferAcknowledgeScreen", {
                        transferParams,
                        transactionResponseObject: errorsInner,
                        transactionReferenceNumber: transactionRefNumber || "",
                        festiveFlag,
                        festiveObj,
                        fromCta,
                    });
                }
            );
        }
    };

    /***
     * _duItNowRecurringRequest
     * DuitNow Request Flow Api call
     */
    _duItNowRecurringRequest = (params) => {
        this.setState({ showLoaderModal: true });

        duItNowRecurring(params)
            .then((response) => {
                const responseObject = response.data;
                this._recurringSuccess(responseObject);
            })
            .catch((error) => {
                this._recurringFailure(error);
            });
    };

    /***
     * _duItNowRecurring
     * DuitNow Recurring params build and call API
     * Handle Recurring Favourite
     */
    _duItNowRecurring = async (code, transferParams, flow) => {
        const { endDateInt, startDateInt, notesText, fromAccountCode, fromAccount } = this.state;
        let params = {};
        const amount = transferParams.amount;
        let transferAmount = "0.00";

        if (transferParams && transferParams.amount) {
            transferAmount = amount.indexOf(",") === -1 ? amount : amount.replace(/,/g, "");
        }
        try {
            //Create Recurring params
            params = {
                bankCode:
                    transferParams && transferParams.transferBankCode
                        ? transferParams.transferBankCode.replace("****", "")
                        : "",
                curCodeValue: "MYR",
                endDate: endDateInt,
                favourite: false,
                fromAccNo: fromAccount,
                fromAcctCode: fromAccountCode,
                mbbAmt: transferAmount,
                paymentRef: transferParams.reference,
                paymnetDesc: notesText,
                proxyId:
                    transferParams && transferParams.idValue
                        ? transferParams.idValue.replace(/\s/g, "")
                        : "",
                proxyIdType: transferParams.idType,
                recipientName: transferParams.actualAccHolderName,
                regRefNo: transferParams.transferRegRefNo,
                startDate: startDateInt,
                tac: code,
                mbbbankCode: transferParams.mbbbankCode,
                transferType: transferParams.transferType,
                transferSubType: transferParams.transferSubType,
                twoFAType: transferParams.twoFAType,
                mobileSDKData: transferParams.mobileSDK, // Required For RSA
            };
            //this._markAsPaid();
            if (flow === S2U_PULL) {
                //     // s2u v4
                this.initiateS2USdk(params, transferParams);
            } else {
                this.setState({ challengeRequest: params, params, transferParams }, () => {
                    //if DuitNow open favourite Transactions
                    this._duItNowRecurringRequest(params);
                });
            }
        } catch (e) {
            this.setState({ loader: false });
            console.log(" catch ERROR==> " + e);
        }
    };

    /***
     * _recurringSuccess
     * handle Recurring Success
     */
    _recurringSuccess = (responseObject) => {
        const result = responseObject;
        const { transferParams } = this.state;
        transferParams.statusDescription = result.statusDescription;
        transferParams.referenceNumber = result.formattedTransactionRefNumber;
        transferParams.transactionRefNumber = result.transactionRefNumber;
        transferParams.transactionDate = result.serverDate;
        transferParams.formattedTransactionRefNumber = result.formattedTransactionRefNumber;
        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showLoaderModal: false,
            },
            () => {
                if (
                    (responseObject &&
                        responseObject.statusCode &&
                        responseObject.statusCode === "0000") ||
                    (responseObject.statusDescription &&
                        responseObject.statusDescription === "Accepted")
                ) {
                    if (responseObject.additionalStatusDescription) {
                        transferParams.transactionResponseError =
                            responseObject.additionalStatusDescription;
                    }
                    if (this.state.showTAC) {
                        this.setState({ showTAC: false });
                    }
                    transferParams.transactionStatus = true;
                    //Navigate to Acknowledgment screen with success
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        transferParams,
                        transactionResponseObject: responseObject,
                        transactionReferenceNumber: result.transactionRefNumber,
                    });
                } else {
                    if (this.state.showTAC) {
                        this.setState({ showTAC: false });
                    }
                    if (result) {
                        transferParams.transactionResponseError = result.statusDescription;
                    }

                    transferParams.transactionStatus = false;
                    //Navigate to Acknowledgment screen with Failure
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        transferParams,
                        transactionResponseObject: responseObject,
                        transactionReferenceNumber: result.transactionRefNumber,
                    });
                }
            }
        );
    };

    /***
     * _recurringFailure
     * handle Recurring Failure
     * Navigate to Acknowledgment screen with Failure
     */
    _recurringFailure = (error, token) => {
        const { transferParams } = this.state;
        console.log("[TransferConfirmationScreen] >> [recurringFailure] error : ", error);
        console.log("[TransferConfirmationScreen] >> [recurringFailure] token : ", token);
        const result = error.error;
        // if (this.state.showTAC) {
        //     this.setState({ showTAC: false });
        // }
        let transactionRefNumber = "";
        if (result) {
            transferParams.transactionResponseError = result.statusDescription;
            transactionRefNumber = result.formattedTransactionRefNumber
                ? result.formattedTransactionRefNumber
                : result.transactionRefNumber;
            transferParams.formattedTransactionRefNumber = result.formattedTransactionRefNumber;
            transferParams.transactionRefNumber = result.transactionRefNumber;
            transferParams.statusDescription = result.statusDescription;
        }
        //transferParams.statusDescription = result.statusDescription;
        transferParams.transactionStatus = false;
        //Navigate to Acknowledgment screen with Failure
        let errors = {};
        let errorsInner = {};

        errors = error;
        errorsInner = error.error;

        console.log(" ERROR errors ==> ", errors);
        console.log(" ERROR errorsInner ==> ", errorsInner);
        console.log("[TransferConfirmationScreen] >> [recurringFailure] ", errors);
        console.log("[TransferConfirmationScreen] >> [recurringFailure] ", errorsInner);
        if (errors.status === 428) {
            console.log("[TransferConfirmationScreen] >> [recurringFailure] 428 : ", errorsInner);
            this.hideTAC();
            // Display RSA Challenge Questions if status is 428
            GATransfer.viewScreenChallengeQuestion(getTransferAccountType(this.state.transferFlow));
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
                token,
                showLoaderModal: false,
            }));
        } else if (errors.status == 423) {
            // Display RSA Account Locked Error Message
            console.log("[TransferConfirmationScreen] >> [recurringFailure] 423  :", errorsInner);
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    showLoaderModal: false,
                    isRSALoader: false,
                    loader: false,
                },
                () => {
                    // Add Completion
                    transferParams.transactionStatus = false;
                    transferParams.transactionResponseError = "";
                    this.hideTAC();
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        errorMessge:
                            errorsInner && errorsInner.additionalStatusDescription
                                ? errorsInner.additionalStatusDescription
                                : WE_FACING_SOME_ISSUE,
                        transferParams,
                        transactionReferenceNumber: "",
                        isRsaLock: true,
                    });
                }
            );
        } else if (errors.status === 422) {
            // Display RSA Deny Error Message
            console.log("[TransferConfirmationScreen] >> [recurringFailure] Deny  :", errorsInner);
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showLoaderModal: false,
                },
                () => {
                    // Add Completion
                    transferParams.transactionStatus = false;
                    transferParams.transactionDate = errorsInner.serverDate;
                    transferParams.error = error;
                    transferParams.transactionResponseError = "";
                    this.hideTAC();
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        errorMessge:
                            errorsInner && errorsInner.statusDescription
                                ? errorsInner.statusDescription
                                : WE_FACING_SOME_ISSUE,
                        transferParams,
                        transactionReferenceNumber: "",
                        isRsaLock: false,
                    });
                }
            );
        } else {
            console.log(
                "[TransferConfirmationScreen] >> [recurringFailure] Common error : ",
                error
            );
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                    showLoaderModal: false,
                },
                () => {
                    this.hideTAC();
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        transferParams,
                        transactionResponseObject: error,
                        transactionReferenceNumber: transactionRefNumber,
                    });
                }
            );
        }
    };

    /***
     * _onRequestMoneyAPI
     * Request Money Flow create a request api call
     */
    _onRequestMoneyAPI = () => {
        console.log("[TransferConfirmationScreen] >> [_onRequestMoneyAPI]  ");
        const { transferParams } = this.state;
        const { notesText, fromAccount } = this.state;
        console.log(
            "[TransferConfirmationScreen] >> [_onRequestMoneyAPI] transferParams ==> ",
            transferParams
        );
        const { amount } = transferParams;
        const transferAmount = amount.indexOf(",") === -1 ? amount : amount.replace(/,/g, "");

        console.log(
            "[TransferConfirmationScreen] >> [_onRequestMoneyAPI] transferAmount ==> ",
            transferAmount
        );
        const fundTransferReq = {
            fromAccount: transferParams.userMobileNumber,
            toAccount: transferParams.phoneNumber,
            transferAmount,
            mobileSDKData: transferParams.mobileSDK, // Required For RSA
        };
        try {
            //construct params
            const params = {
                type: "REQUEST",
                status: "PENDING",
                amount: transferAmount,
                mobileNo: transferParams.phoneNumber,
                note: notesText,
                receiverAcct: fromAccount,
                fundTransferReq,
                trxRefId: "",
                trxDate: "",
            };
            console.log(
                "[TransferConfirmationScreen] >> [_onRequestMoneyAPI] params  ==> ",
                params
            );
            this.setState(
                {
                    challengeRequest: params,
                    params,
                    transferParams,
                },
                () => {
                    console.log(
                        "[TransferConfirmationScreen] >> [_onRequestMoneyAPI] challengeRequest  ==> ",
                        params
                    );
                    this._onRequestMoneyAPIRequest(params);
                }
            );
        } catch (e) {
            console.log("[TransferConfirmationScreen] >> [_onRequestMoneyAPI] catch ERROR==> " + e);
            this.setState({ loader: false });
        }
    };

    /***
     * _onRequestMoneyAPIRequest
     * Request Money Flow Api call
     */
    _onRequestMoneyAPIRequest = (params) => {
        console.log("[TransferConfirmationScreen] >> [_onRequestMoneyAPIRequest] params ", params);
        this.setState({ showLoaderModal: true });

        //Call request money API
        requestMoneyAPI(params)
            .then((response) => {
                console.log(
                    "[TransferConfirmationScreen] >> [_onRequestMoneyAPIRequest] Success : "
                );
                this._onRequestMoneyAPISuccess(response);
            })
            .catch((error) => {
                console.log(
                    "[TransferConfirmationScreen] >> [_onRequestMoneyAPIRequest] ERROR==> ",
                    error
                );
                this._onRequestMoneyAPIFailed(error);
            });
    };

    /***
     * _onRequestMoneyAPISuccess
     * On Request Money API Success
     */
    _onRequestMoneyAPISuccess = (response) => {
        console.log("[TransferConfirmationScreen] >> [_onRequestMoneyAPISuccess]");
        const { transferParams } = this.state;
        const responseObject = response.data;
        console.log("requestMoneyAPI RESPONSE RECEIVED: ", response.data);
        this.setState(
            {
                // update state values
                isRSARequired: false,
                isRSALoader: false,
                loader: false,
                showLoaderModal: false,
            },
            () => {
                if (
                    responseObject &&
                    responseObject.message &&
                    responseObject.message.toString().toLowerCase() == "success"
                ) {
                    const result = responseObject.result;
                    console.log("requestMoneyAPI _onRequestMoneyAPI Success==> ", result);
                    const trxRefId = result.trxRefId;
                    const referenceNumber = trxRefId;
                    // trxRefId != undefined
                    //     ? trxRefId.toString().substr(trxRefId.length - 10)
                    //     : "";
                    console.log("requestMoneyAPI referenceNumber Success==> ", referenceNumber);
                    const transactionDate = result.createdDate;
                    // const statusDescriptionText =
                    //     YOUR_REQUEST_FOR +
                    //     CURRENCY +
                    //     transferParams.formattedAmount +
                    //     HAS_BEEN_SENT_TO +
                    //     (transferParams.accountName === "#"
                    //         ? transferParams.detailsMobileNumber
                    //         : transferParams.accountName) +
                    //     ".";

                    transferParams.transactionStatus = true;
                    transferParams.referenceNumber = referenceNumber;
                    transferParams.transactionDate = transactionDate;
                    //transferParams.statusDescriptionText = statusDescriptionText;
                    transferParams.statusDescription = result.statusDescription;
                    //transferParams.transactionResponseError = statusDescriptionText;
                    transferParams.transactionResponseError = "";
                    const sendMoneyFlow = this.props.route.params?.sendMoneyFlow;
                    this.setState({ loader: false });
                    //Navigate to Acknowledgment screen with success
                    this.props.navigation.navigate(navigationConstant.TRANSFER_ACKNOWLEDGE_SCREEN, {
                        transferParams,
                        transactionReferenceNumber: referenceNumber,
                        transactionResponseObject: result,
                        sendMoneyFlow,
                    });
                }
            }
        );
    };

    /***
     * _onRequestMoneyAPIFailed
     * On Request Money API Failed
     */
    _onRequestMoneyAPIFailed = (error) => {
        console.log("[TransferConfirmationScreen] >> [_onRequestMoneyAPIFailed]");
        const { transferParams } = this.state;
        if (error.error) {
            transferParams.transactionResponseError = error.error.message;
        }
        transferParams.transactionResponseError = YOUR_REQUEST_COULD_NOT_COMPLETED;

        const referenceNumber = "";
        const transactionDate = "";
        transferParams.transactionStatus = false;
        transferParams.referenceNumber = referenceNumber;
        transferParams.transactionDate = transactionDate;
        transferParams.statusDescriptionText = REQUEST_FAILED;
        this.setState({ loader: false, transferParams }, () => {
            this._fundTransferFailed(error, this.state.token);
        });
    };

    /***
     * onDateFieldPress
     * On Date pressed Calender Even
     */
    onDateFieldPress = () => {
        console.log("[TransferConfirmationScreen] >> [onDateFieldPress]");

        //Keyboard.dismiss();
        this.setState({
            showDatePicker: true,
        });
    };

    /***
     * hideDatePicker
     * hide Calender picker
     */
    hideDatePicker = () => {
        console.log("[TransferConfirmationScreen] >> [hideDatePicker]");

        this.setState({
            showDatePicker: false,
        });
    };

    /***
     * _onRightButtonPress
     * Handle Transfer type pop ok click event and Update UI based on that
     */
    _onRightButtonPress = (value, index) => {
        console.log("onRightButtonPress");
        console.log("value ", value);
        console.log("index ", index);
        const { transferParams, transferFlow } = this.state;
        console.log("transferFlow ", transferFlow);
        const selected = value.const;

        if (transferFlow === 12) {
            //If on off Transfer Type display Date field Only and hide Start and End End Fields
            if (selected === "ONE_OFF_TRANSFER") {
                console.log("ONE_OFF_TRANSFER checking1...");
                transferParams.isRecurringTransfer = false;
                transferParams.duitNowRecurring = false;
                transferParams.selectedIndex = index;
                transferParams.transferTypeIndex = index;
                transferParams.duitNowTransferType = value.name;
                transferParams.confirmDateStartDate = new Date();
                transferParams.confirmDateSelectedCalender = new Date();
                this.setState({
                    isRecurringTransfer: false,
                    showScrollPickerView: false,
                    showTransferDateView: false,
                    duitNowRecurring: false,
                    selectedIndex: index,
                    duitNowTransferType: value.name,
                    confirmDateStartDate: this.state.confirmDateStartDate,
                    confirmDateSelectedCalender: this.state.confirmDateSelectedCalender,
                    confirmDateEndDate: this.state.confirmDateEndDate,
                    displayDate: "Today",
                    effectiveDate: "00000000",
                });
                getDateRange(dateScenarios.DUITNOW_ONE_OFF).then((data) => {
                    this.setState({
                        validDateRangeData: data,
                    });
                });
            } else if (selected === "RECURRING") {
                //If Recurring Transfer Type display Start and End End Fields Hide Date field
                const today = new Date();
                const tomorrow = new Date();
                today.setDate(today.getDate() + 1);
                const month =
                    today.getMonth() + 1 < 10
                        ? `0${today.getMonth() + 1}`
                        : `${today.getMonth() + 1}`;
                const days = today.getDate() < 10 ? `0${today.getDate()}` : `${today.getDate()}`;
                const year = today.getFullYear().toString();

                const todayInt = year + month + days;

                tomorrow.setDate(today.getDate() + 30);

                const monthNextDay =
                    tomorrow.getMonth() + 1 < 10
                        ? `0${tomorrow.getMonth() + 1}`
                        : `${tomorrow.getMonth() + 1}`;
                const daysNextDay =
                    tomorrow.getDate() < 10 ? `0${tomorrow.getDate()}` : `${tomorrow.getDate()}`;
                const yearNextDay = tomorrow.getFullYear().toString();
                const nextDayInt = yearNextDay + monthNextDay + daysNextDay;

                const formatedStartDate = getFormatedDateMoments(today, "D MMM YYYY");
                const formatedEndDate = getFormatedDateMoments(tomorrow, "D MMM YYYY");

                transferParams.isRecurringTransfer = true;
                transferParams.duitNowRecurring = true;
                transferParams.transferTypeIndex = index;
                transferParams.duitNowTransferType = value.name;
                transferParams.formatedStartDate = formatedStartDate;
                transferParams.formatedEndDate = formatedEndDate;
                transferParams.confirmDateStartDate = today;
                transferParams.confirmDateEndDate = tomorrow;
                transferParams.startDateInt = todayInt;
                transferParams.endDateInt = nextDayInt;

                this.setState({
                    isRecurringTransfer: true,
                    showScrollPickerView: false,
                    showTransferDateView: true,
                    duitNowRecurring: true,
                    selectedIndex: index,
                    duitNowTransferType: value.name,
                    formatedStartDate,
                    formatedEndDate,
                    confirmDateStartDate: todayInt,
                    confirmDateEndDate: nextDayInt,
                    confirmDateSelectedCalender: today,
                    startDateInt: todayInt,
                    endDateInt: nextDayInt,
                    transferParams,
                    selectedStartDate: today,
                    selectedEndDate: tomorrow,
                    minAllowedEndDate: tomorrow,
                });
            }
        }
    };

    /***
     * _onLeftButtonPress
     * Close Transfer Type Dropdown
     */
    _onLeftButtonPress = (value, index) => {
        console.log("onLeftButtonPress");
        console.log("value ", value);
        console.log("index ", index);
        this.setState({
            showScrollPickerView: false,
        });
    };

    /***
     * _onShowDuitNowMenu
     * Show Transfer Type Dropdown Menu
     */
    _onShowDuitNowMenu = () => {
        console.log("_onShowDuitNowMenu");
        this.setState({
            showScrollPickerView: true,
            showDatePicker: false,
        });
        console.log("showScrollPickerView", this.state.showScrollPickerView);
    };

    /***
     * onDateDonePress
     * On Calender Date Select event store and close calender view
     */
    onDateDonePress = (date) => {
        console.log("=================== ");
        console.log("  [onDateDonePress] ", date);
        let formatedDate = getFormatedDateMoments(date, "D MMM YYYY");
        console.log("  [formatedDate] ", formatedDate);
        const today = new Date();
        let nextDay = new Date();
        let effectiveDate = "00000000";

        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
        const year = date.getFullYear().toString();

        const todayInt = year + month + days;
        console.log("Original days ", date.getDate());
        console.log("Original Month ", date.getMonth());
        console.log("=================== ");
        console.log("month ", month);
        console.log("days ", days);
        console.log("year ", year);
        console.log("todayInt ", todayInt);
        console.log("=================== ");
        let isFutureTransfer = false;
        if (this.state.confirmDateEditFlow === 0) {
            if (
                getFormatedDateMoments(today, "D MMM YYYY") ===
                getFormatedDateMoments(date, "D MMM YYYY")
            ) {
                formatedDate = "Today";
                effectiveDate = "00000000";
                isFutureTransfer = false;
            } else {
                isFutureTransfer = true;
                //console.log("selectDateInt ", selectDateInt);
                effectiveDate = todayInt;
            }
        }
        console.log("=================== ");
        const nextDayMoments = moment(date).add(30, "days");
        console.log("nextDayMoments ", nextDayMoments);
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);
        const monthNextDay =
            nextDay.getMonth() + 1 < 10
                ? `0${nextDay.getMonth() + 1}`
                : `${nextDay.getMonth() + 1}`;
        const daysNextDay =
            nextDay.getDate() < 10 ? `0${nextDay.getDate()}` : `${nextDay.getDate()}`;
        const yearNextDay = nextDay.getFullYear().toString();

        let nextDayInt = "";
        let formatedDateNextDay;
        console.log("=================== ");
        console.log("date ", date);
        console.log("nextDay ", nextDay);
        console.log("monthNextDay ", monthNextDay);
        console.log("daysNextDay ", daysNextDay);
        console.log("yearNextDay ", yearNextDay);
        console.log("nextDayInt ", nextDayInt);
        nextDayInt = yearNextDay + monthNextDay + daysNextDay;
        console.log("formatedDateNextDay ", formatedDateNextDay);
        const { transferParams } = this.state;
        if (this.state.confirmDateEditFlow === 1) {
            formatedDateNextDay = getFormatedDateMoments(date, "D MMM YYYY");
            transferParams.formatedEndDate = formatedDateNextDay;
            nextDayInt = todayInt;
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            nextDayInt = yearNextDay + monthNextDay + daysNextDay;
            formatedDateNextDay = getFormatedDateMoments(nextDay, "D MMM YYYY");
            transferParams.formatedEndDate = formatedDateNextDay;
        }

        console.log(" confirmDateEditFlow ", this.state.confirmDateEditFlow);
        console.log("  today ", today);
        console.log("  nextDay ", nextDay);

        console.log("  [formatedDate] ", formatedDate);

        console.log("=================== ");
        console.log("startDateInt ", effectiveDate);
        console.log("endDateInt ", nextDayInt);
        console.log("=================== ");
        console.log("[TransferConfirmationScreen] >> [onDateDonePress] selectedStartDate : ", date);
        console.log("[TransferConfirmationScreen] >> [onDateDonePress] selectedEndDate : ", date);
        console.log(
            "[TransferConfirmationScreen] >> [onDateDonePress] selectedEndDate nextDayMoments : ",
            nextDayMoments
        );
        if (date instanceof Date) {
            if (this.state.confirmDateEditFlow === 1) {
                //Update End Date only
                transferParams.formatedEndDate = formatedDate;
                transferParams.endDateInt = nextDayInt;
                console.log(
                    "[TransferConfirmationScreen] >> [onDateDonePress] transferParams ",
                    transferParams
                );
                this.setState({
                    endDateInt: nextDayInt,
                    formatedEndDate: formatedDate,
                    transferParams,
                    selectedEndDate: date,
                    isFutureTransfer,
                    confirmDateSelectedCalender: date,
                });
            } else {
                //Update Start date and Date Fields
                const newTransferParams = {
                    ...transferParams,
                    displayDate: formatedDate,
                    effectiveDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    isFutureTransfer,
                    startDateInt: effectiveDate,
                    endDateInt: nextDayInt,
                    dateText: date.toISOString().split("T")[0],
                };
                console.log(
                    "[TransferConfirmationScreen] >> [onDateDonePress] newTransferParams ",
                    newTransferParams
                );
                this.setState({
                    dateText: date.toISOString().split("T")[0],
                    date,
                    displayDate: formatedDate,
                    effectiveDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    isFutureTransfer,
                    startDateInt: effectiveDate,
                    endDateInt: nextDayInt,
                    transferParams: newTransferParams,
                    minAllowedEndDate: nextDayMoments.toDate(),
                    selectedEndDate: nextDayMoments.toDate(),
                    confirmDateSelectedCalender: date,
                });
            }
        }
        //Close the Calender View
        this.hideDatePicker();
    };

    /***
     * _onEditStartDate
     * On Start date click set min and max dates and open calender View
     */
    _onEditStartDate = () => {
        this.setState(
            {
                confirmDateEditFlow: 0,
                confirmDateStartDate: getStartDate(this.state.validStartDateRangeData),
                confirmDateEndDate: getEndDate(this.state.validStartDateRangeData),
                confirmDateSelectedCalender: this.state.selectedStartDate, //getDefaultDate(this.state.validDateRangeData),
            },
            () => {
                //show the Calender View
                this._onopenNewCalenderFlow();
            }
        );
    };

    /***
     * _onEditEndDate
     * On End date click set min and max dates and open calender View
     */
    _onEditEndDate = () => {
        this.setState(
            {
                confirmDateEditFlow: 1,
                confirmDateStartDate: getStartDate(
                    this.state.validEndDateRangeData,
                    moment(this.state.formatedStartDate, "D MMM YYYY")
                ),
                confirmDateEndDate: getEndDate(
                    this.state.validEndDateRangeData,
                    moment(this.state.formatedStartDate, "D MMM YYYY")
                ),
                confirmDateSelectedCalender: this.state.selectedEndDate,
            },
            () => {
                //show the Calender View
                this._onopenNewCalenderFlow();
            }
        );
    };

    /***
     * _onSetCalenderDates
     *
     */
    _onSetCalenderDates = () => {
        this.setState({
            confirmDateStartDate: this.state.confirmDateStartDate,
            confirmDateEndDate: this.state.confirmDateEndDate,
            confirmDateSelectedCalender: this.state.confirmDateSelectedCalender, //getDefaultDate(this.state.validDateRangeData),
        });
    };

    /***
     * _onopenNewCalenderFlow
     * Open calender View
     */
    _onopenNewCalenderFlow = () => {
        this.state.transferFlow != 15 && this.state.transferFlow != 16
            ? this.state.transferFlow === 12
                ? this.setState({
                      showDatePicker: true,
                      showScrollPickerView: false,
                      confirmDateStartDate: this.state.confirmDateStartDate,
                      confirmDateEndDate: this.state.confirmDateEndDate,
                      confirmDateSelectedCalender: this.state.confirmDateSelectedCalender, //getDefaultDate(this.state.validDateRangeData),
                  })
                : this.setState({ showDatePicker: true, showScrollPickerView: false })
            : this.setState({ showDatePicker: false });
    };

    /***
     * _onClosePress
     * On Header Close Button Click Event Listener
     */
    _onClosePress = () => {
        const { transferParams, transferFlow } = this.state;
        const { routeFrom, activeTabIndex } = transferParams;
        console.log(
            "[TransferConfirmationScreen] >> [_onClosePress] transferParams : ",
            transferParams
        );
        console.log(
            "[TransferConfirmationScreen] >> [_onClosePress] transferFlow : ",
            transferFlow
        );
        const route = routeFrom || "Dashboard";
        const routedFromQuickAction =
            routeFrom !== "SortToWin" &&
            routeFrom !== "SendGreetingsReceived" &&
            routeFrom !== "SendGreetingsReview";
        console.log("[TransferConfirmationScreen] >> [_onClosePress] route : ", route);
        console.log("[TransferConfirmationScreen] >> [_onClosePress] routeFrom : ", routeFrom);

        // uncomment this when campaign have entry point from festives QA
        // if (festiveFlag && (transferFlow === 15 || transferFlow === 12)) {
        // Handle screen navigation back to Festive entry points
        if (
            routedFromQuickAction &&
            this.props.route?.params?.festiveFlag &&
            this.props.route?.params?.fromCta
        ) {
            this.props.navigation.navigate("DashboardStack", {
                screen: "Dashboard",
                params: {
                    screen: "FestiveQuickActionScreen",
                },
            });
        } else if (transferFlow === 15 || transferFlow === 16) {
            if (!routedFromQuickAction) {
                this.props.navigation.pop(2);
            } else {
                //If Send or Request Money Flow Navigate to Send Money Dashboard
                if (routeFrom === "SortToWin") {
                    this.props.navigation.pop(3);
                    return;
                }
                this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                    screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                    params: { updateScreenData: true, doneFlow: true },
                });
            }
        } else {
            this.props.navigation.navigate(navigationConstant.TRANSFER_TAB_SCREEN, {
                transferParams,
                activeTabIndex: activeTabIndex || 0,
            });
            //If flow start from any specific account details screen navigate back to AccountDetails screen
            // if (route == "AccountDetails") {
            //     this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
            //         screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
            //     });
            // } else if (route === "WalletMainDashboard") {
            //     //If flow start from any Wallet Main Dashboard screen navigate back to WalletMainDashboard screen
            //     this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
            //         screen: "More",
            //     });
            // } else {
            //     // TODO: Add necessary params
            //     //If flow start from any Other screen navigate back to Main Dashboard screen
            //     this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
            //         screen: "Tab",
            //         params: {
            //             screen: navigationConstant.DASHBOARD,
            //             params: { refresh: false },
            //         },
            //     });
            // }
        }
    };

    /***
     * getRecipientName
     * Display Recipient Name Field
     */
    getRecipientName = () => {
        let name = "";
        let screenIDValue = "";
        let mainImage = "";
        const { transferParams, transferFlow } = this.state;
        console.log("getRecipientName transferParams ", transferParams);
        if (transferFlow == 12) {
            screenIDValue = transferParams.idValueFormatted;
            name = transferParams.recipientName;
        } else if (transferFlow == 15 || this.state.transferFlow == 16) {
            name = transferParams.name;
            screenIDValue = formatMobileNumbersRequest(transferParams.phoneNumber);
            mainImage = transferParams.image;
        } else {
            name = transferParams.recipientName;
            screenIDValue = transferParams.formattedToAccount;
        }
        name = formateIDName(name, " ", 2);
        console.log("transferFlow ", transferFlow);
        console.log("getRecipientName ", name);
        console.log("screenIDValue ", screenIDValue);
        this.setState({ nameText: name, screenIDValue, mainImage });
        //return name;
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
            token,
        } = this.state;
        console.log(
            "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] answer : ",
            answer
        );
        console.log("button disable is", this.state.isSubmitDisable);
        const challengeObj = {
            ...challenge,
            answer,
        };
        console.log(
            "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeObj : ",
            challengeObj
        );
        this.setState(
            {
                challengeRequest: {
                    ...this.state.challengeRequest,
                    challenge: challengeObj,
                },
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                console.log(
                    "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeObj : ",
                    challengeObj
                );
                console.log(
                    "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeRequest : ",
                    this.state.challengeRequest
                );
                const transferType = parseInt(this.state.transferFlow);
                console.log(
                    "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] transferType : ",
                    transferType
                );
                const { challengeRequest, payRequest } = this.state;
                challengeRequest.tac = token;
                challengeRequest.smsTac = token;
                console.log(
                    "[TransferConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeRequest : ",
                    challengeRequest
                );
                if ((transferType >= 1 && transferType <= 5) || transferType === 12) {
                    if (this.state.duitNowRecurring) {
                        this._duItNowRecurringRequest(challengeRequest);
                    } else {
                        this.fundTransferRequest(challengeRequest);
                    }
                } else if (transferType === 15) {
                    if (payRequest) {
                        this.payMoneyAPI(challengeRequest);
                    } else {
                        this.sendMoneyAPI(challengeRequest);
                    }
                } else if (transferType === 16) {
                    this._onRequestMoneyAPIRequest(challengeRequest);
                }
            }
        );
    };

    /***
     * _onTeamsConditionClick
     * Open DuitNow Teams and Conditions PDF view
     */
    _onTeamsConditionClick = async () => {
        console.log("_onTearmsConditionClick");

        const file =
            "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/NAD_TNC.pdf";
        const navParams = {
            file,
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
        console.log("_onDateEditClick ", this.state.transferFlow);
        this._onSetCalenderDates();
        this.state.transferFlow != 15 && this.state.transferFlow != 16
            ? this.setState({
                  showDatePicker: true,
                  showScrollPickerView: false,
                  confirmDateStartDate: getStartDate(this.state.validDateRangeData),
                  confirmDateEndDate: getEndDate(this.state.validDateRangeData),
                  confirmDateSelectedCalender: this.state.confirmDateSelectedCalender, //getDefaultDate(this.state.validDateRangeData),
              })
            : this.setState({ showDatePicker: false });
    };

    /***
     * _onRecipientReferenceClick
     * On payment Reference click navigate to Reference to get updated reference
     */
    _onRecipientReferenceClick = () => {
        console.log("_onRecipientReferenceClick ");
        const { transferParams } = this.state;
        console.log(
            "[TransferConfirmationScreen] >> [_onRecipientReferenceClick] transferParams : ",
            transferParams
        );
        if (this.state.transferFlow <= 3) {
            console.log("All Maybank transfer");
            this.props.navigation.navigate(navigationConstant.TRANSFER_REFERENCE_AMOUNT, {
                transferParams,
            });
        } else if (this.state.transferFlow == 4 || this.state.transferFlow == 5) {
            console.log("All Other transfer");
            this.props.navigation.navigate(navigationConstant.TRANSFER_REFERENCE_AMOUNT, {
                transferParams,
                referenceEdit: true,
            });
        } else if (this.state.transferFlow === 12) {
            console.log("DuitNow transfer");
            this.props.navigation.navigate(navigationConstant.DUITNOW_ENTER_REFERENCE, {
                transferParams,
                referenceEdit: true,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    /***
     * _onBackPress
     * On Screen handle Back Button click handle
     */
    _onBackPress = () => {
        console.log("_onBackPress", this.state.transferFlow);

        const { transferParams } = this.state;

        if (this.state.transferFlow <= 3) {
            console.log("All Maybank transfer");
            this.props.navigation.navigate(navigationConstant.TRANSFER_REFERENCE_AMOUNT, {
                transferParams,
            });
        } else if (this.state.transferFlow == 4 || this.state.transferFlow == 5) {
            console.log("All Other transfer");

            if (transferParams.transactionMode === "GIRO" && !transferParams?.transferFav) {
                this.props.navigation.navigate(navigationConstant.TRANSFER_USER_NAME, {
                    transferParams,
                });
            } else {
                this.props.navigation.navigate(navigationConstant.TRANSFER_TYPE_MODE_SCREEN, {
                    transferParams,
                });
            }
        } else if (this.state.transferFlow === 12) {
            console.log("DuitNow");
            this.props.navigation.navigate(navigationConstant.DUITNOW_ENTER_REFERENCE, {
                transferParams,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    /***
     * renderCurrency
     * render Amount in UI editable or on editable
     */
    renderCurrency = () => {
        const { transferParams } = this.state;
        console.log("AmountScreen transferParams : ", transferParams);

        const { amount } = transferParams;
        console.log("transferParams amount : ", amount);

        console.log("renderCurrency : ");
        let amountObj = "0.00";
        if (this.state.transferFlow === 15) {
            amountObj =
                transferParams.formattedAmount.toString().indexOf(CURRENCY) === -1
                    ? CURRENCY + transferParams.formattedAmount
                    : transferParams.formattedAmount;
        } else {
            amountObj = CURRENCY + amount;
        }
        console.log("renderCurrency transferAmount : ", amountObj);
        this.setState({
            transferAmount: amountObj,
        });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            showOverlay,
            showLoaderModal,
            festiveFlag,
            festiveImage,
        } = this.state;
        const { isTapTasticReady } = this.props.getModel("misc");
        const { getModel, route } = this.props;
        // const { festiveAssets = {} } = route?.params || useFestive();
        const { festiveAssets } = this.props;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={showOverlay || this.state.showDatePicker}
                    showLoaderModal={showLoaderModal}
                >
                    <>
                        {festiveFlag && (
                            <CacheeImageWithDefault
                                resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                                style={Styles.topContainer}
                                image={festiveAssets?.qrPay.background}
                            />
                        )}
                        <ScreenLayout
                            header={
                                <HeaderLayout
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={19}
                                            text={CONFIRMATION}
                                            color={
                                                festiveAssets?.isWhiteColorOnFestive ? WHITE : BLACK
                                            }
                                        />
                                    }
                                    headerLeftElement={
                                        <HeaderBackButton
                                            isWhite={festiveAssets?.isWhiteColorOnFestive}
                                            onPress={this._onBackPress}
                                        />
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton
                                            isWhite={festiveAssets?.isWhiteColorOnFestive}
                                            onPress={this._onClosePress}
                                        />
                                    }
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
                                <React.Fragment>
                                    <View style={Styles.parentBlockConfirm}>
                                        <View style={Styles.blockConfirm}>
                                            <View style={Styles.cardSmallContainerColumnCenter}>
                                                {this.state.transferFlow === 16 && (
                                                    <View style={Styles.descriptionContainerCenter}>
                                                        <Typo
                                                            fontSize={20}
                                                            fontWeight="300"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={28}
                                                            text={this.state.mainTitle}
                                                        />
                                                    </View>
                                                )}
                                                {this.state.transferFlow === 15 ||
                                                this.state.transferFlow === 16 ? (
                                                    <View style={Styles.logoView}>
                                                        <CircularTextImage
                                                            source={this.state.image}
                                                            defaultImage={Assets.yellowMoney}
                                                            showText={
                                                                this.state.image &&
                                                                this.state.image.length < 1
                                                            }
                                                            text={getContactNameInitial(
                                                                this.state.nameText
                                                            )}
                                                        />
                                                    </View>
                                                ) : this.state.transferFlow === 12 ? (
                                                    <View style={Styles.logoImageFullViewConfirm}>
                                                        <View style={Styles.logoImageViewConfirm}>
                                                            <ImageBackground
                                                                style={Styles.logoImageConfirm}
                                                                source={Assets.icDuitNowCircle}
                                                                resizeMode="stretch"
                                                            />
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View>
                                                        <CircularLogoImage
                                                            source={this.state.image}
                                                            isLocal={false}
                                                        />
                                                    </View>
                                                )}
                                            </View>

                                            <View>
                                                <View style={Styles.descriptionContainerCenter}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        text={this.state.nameText}
                                                    />
                                                </View>
                                                {(this.state.transferFlow === 12 ||
                                                    this.state.transferFlow === 16 ||
                                                    this.state.transferFlow === 15) && (
                                                    <View
                                                        style={Styles.descriptionContainer2Center}
                                                    >
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={20}
                                                            text={this.state.screenIDValue}
                                                        />
                                                    </View>
                                                )}
                                                <View style={Styles.titleContainerCenter1}>
                                                    {this.state.transferFlow != 12 &&
                                                        this.state.transferFlow != 15 &&
                                                        this.state.transferFlow != 16 && (
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={20}
                                                                color="#000000"
                                                                text={this.state.screenIDValue}
                                                            />
                                                        )}
                                                </View>
                                            </View>

                                            {/* select edit amount */}
                                            {!this.state.payRequest ? (
                                                <View style={Styles.amountCenterConfirm}>
                                                    <TouchableOpacity
                                                        onPress={this._onEditAmount}
                                                        testID="btnEditAmount"
                                                        accessibilityLabel="btnEditAmount"
                                                    >
                                                        <Typo
                                                            fontSize={24}
                                                            fontWeight="bold"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={31}
                                                            textAlign="center"
                                                            color={ROYAL_BLUE}
                                                            text={this.state.transferAmount}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={Styles.editIconViewTransfer}>
                                                    <Typo
                                                        fontSize={24}
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={31}
                                                        textAlign="center"
                                                        color={BLACK}
                                                        text={this.state.transferAmount}
                                                    />
                                                </View>
                                            )}

                                            <MyView
                                                hide={
                                                    (this.state.duitNowRecurring === true &&
                                                        this.state.transferFlow === 12) ||
                                                    this.state.transferFlow === 16
                                                }
                                            >
                                                {this.state.transferFlow <= 5 ||
                                                this.state.transferFlow === 12 ? (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={DATE}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <TouchableOpacity
                                                                onPress={this._onDateEditClick}
                                                                testID="txtSELECT_date"
                                                                accessibilityLabel="txtSELECT_date"
                                                            >
                                                                <Typo
                                                                    fontSize={14}
                                                                    fontWeight="600"
                                                                    fontStyle="normal"
                                                                    letterSpacing={0}
                                                                    lineHeight={18}
                                                                    textAlign="right"
                                                                    color="#4a90e2"
                                                                    text={this.state.displayDate}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={DATE}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color={
                                                                    this.state.transferFlow === 15
                                                                        ? BLACK
                                                                        : ROYAL_BLUE
                                                                }
                                                                text={this.state.displayDate}
                                                            />
                                                        </View>
                                                    </View>
                                                )}
                                            </MyView>

                                            {(this.state.transferFlow === 15 ||
                                                this.state.transferFlow === 16) &&
                                                !this.state.payRequest && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={NOTES}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <TextInput
                                                                textAlign="right"
                                                                autoCorrect={false}
                                                                autoFocus={false}
                                                                allowFontScaling={false}
                                                                // selection={this.state.select}
                                                                style={
                                                                    Platform.OS === "ios"
                                                                        ? Styles.commonInputConfirmIosText
                                                                        : Styles.commonInputConfirm
                                                                }
                                                                testID="inputReference"
                                                                accessibilityLabel="inputReference"
                                                                secureTextEntry={false}
                                                                maxLength={
                                                                    this.state.transferFlow ===
                                                                        15 ||
                                                                    this.state.transferFlow === 16
                                                                        ? 20
                                                                        : 15
                                                                }
                                                                placeholder={OPTIONAL1}
                                                                placeholderTextColor="rgb(199,199,205)"
                                                                underlineColorAndroid={TRANSPARENT}
                                                                onSubmitEditing={
                                                                    this._onPaymentOptionTextDone
                                                                }
                                                                value={this.state.notesText}
                                                                onChangeText={
                                                                    this._onPaymentOptionTextChange
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                            {this.state.transferFlow === 15 &&
                                                this.state.payRequest &&
                                                this.state.recipientNotes &&
                                                this.state.recipientNotes.length >= 1 && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={NOTES}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color={BLACK}
                                                                text={this.state.recipientNotes}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                            {this.state.duitNowRecurring === true &&
                                                this.state.transferFlow === 12 && (
                                                    <View>
                                                        <View style={Styles.viewRow}>
                                                            <View style={Styles.viewRowLeftItem}>
                                                                <Typo
                                                                    fontSize={14}
                                                                    fontWeight="400"
                                                                    fontStyle="normal"
                                                                    letterSpacing={0}
                                                                    lineHeight={19}
                                                                    textAlign="left"
                                                                    color="#000000"
                                                                    text={START_DATE}
                                                                />
                                                            </View>
                                                            <View style={Styles.viewRowRightItem}>
                                                                <TouchableOpacity
                                                                    onPress={this._onEditStartDate}
                                                                    testID="txtSELECT_date"
                                                                    accessibilityLabel="txtSELECT_date"
                                                                >
                                                                    <Typo
                                                                        fontSize={14}
                                                                        fontWeight="600"
                                                                        fontStyle="normal"
                                                                        letterSpacing={0}
                                                                        lineHeight={14}
                                                                        textAlign="right"
                                                                        color={ROYAL_BLUE}
                                                                        text={
                                                                            this.state
                                                                                .formatedStartDate
                                                                        }
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>

                                                        <View style={Styles.viewRow}>
                                                            <View style={Styles.viewRowLeftItem}>
                                                                <Typo
                                                                    fontSize={14}
                                                                    fontWeight="400"
                                                                    fontStyle="normal"
                                                                    letterSpacing={0}
                                                                    lineHeight={19}
                                                                    textAlign="left"
                                                                    color="#000000"
                                                                    text={END_DATE}
                                                                />
                                                            </View>
                                                            <View style={Styles.viewRowRightItem}>
                                                                <TouchableOpacity
                                                                    onPress={this._onEditEndDate}
                                                                    testID="txtSELECT_date"
                                                                    accessibilityLabel="txtSELECT_date"
                                                                >
                                                                    <Typo
                                                                        fontSize={14}
                                                                        fontWeight="600"
                                                                        fontStyle="normal"
                                                                        letterSpacing={0}
                                                                        lineHeight={18}
                                                                        textAlign="right"
                                                                        color={ROYAL_BLUE}
                                                                        text={
                                                                            this.state
                                                                                .formatedEndDate
                                                                        }
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}
                                            {this.state.transferFlow === 12 && (
                                                <View style={Styles.viewRow}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={TRANSFER_TYPE}
                                                        />
                                                    </View>
                                                    <View style={Styles.viewRowRightItem}>
                                                        <TouchableOpacity
                                                            onPress={this._onShowDuitNowMenu}
                                                            testID="txtTRANSFER_TYPE"
                                                            accessibilityLabel="txtTRANSFER_TYPE"
                                                        >
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color="#4a90e2"
                                                                text={
                                                                    this.state.duitNowTransferType
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}

                                            {this.state.transferFlow === 12 && (
                                                <View style={Styles.viewRow}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={ID_TYPE}
                                                        />
                                                    </View>
                                                    <View style={Styles.viewRowRightItem}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={this.state.idTypeText}
                                                        />
                                                    </View>
                                                </View>
                                            )}

                                            {this.state.transferFlow === 12 &&
                                                this.state.serviceFee && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={SERVICE_FEES}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={"RM " + this.state.serviceFee}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                            {(this.state.transferFlow === 4 ||
                                                this.state.transferFlow === 5) && (
                                                <View>
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={TRANSFER_TYPE}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItemWrap}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color="#000000"
                                                                text={this.state.transactionType}
                                                                style={Styles.textItemWrap}
                                                            />
                                                        </View>
                                                    </View>

                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={TRANSFER_MODE}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color="#000000"
                                                                text={this.state.transactionMode}
                                                            />

                                                            {/* <Typo
                                                            fontSize={9}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={9}
                                                            textAlign="right"
                                                            color="#8F8F8F"
                                                            text={
                                                                SERVICE_FEE + this.state.serviceFee
                                                            }
                                                        /> */}
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            {(this.state.transferFlow === 4 ||
                                                this.state.transferFlow === 5) &&
                                                this.state.serviceFee && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={SERVICE_FEES}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                text={"RM " + this.state.serviceFee}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                            {this.state.transferFlow != 15 &&
                                                this.state.transferFlow != 16 &&
                                                this.state.transferFlow != 17 && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={RECIPIENT_REFERENCE}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <TouchableOpacity
                                                                onPress={
                                                                    this._onRecipientReferenceClick
                                                                }
                                                                testID="txtRECIPIENT_REFERENCE"
                                                                accessibilityLabel="txtRECIPIENT_REFERENCE"
                                                            >
                                                                <Typo
                                                                    fontSize={14}
                                                                    fontWeight="600"
                                                                    fontStyle="normal"
                                                                    letterSpacing={0}
                                                                    lineHeight={18}
                                                                    textAlign="right"
                                                                    color={ROYAL_BLUE}
                                                                    text={this.state.paymentRef}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            {this.state.transferFlow <= 5 &&
                                                this.state.transferFlow != 15 &&
                                                this.state.transferFlow != 16 && (
                                                    <View style={Styles.viewRow}>
                                                        <View style={Styles.viewRowLeftItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="400"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                textAlign="left"
                                                                color="#000000"
                                                                text={CDD_BANK_NAME}
                                                            />
                                                        </View>
                                                        <View style={Styles.viewRowRightItem}>
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="right"
                                                                color="#000000"
                                                                text={formateIDName(
                                                                    this.state.bankName,
                                                                    " ",
                                                                    2
                                                                )}
                                                            />
                                                        </View>
                                                    </View>
                                                )}
                                            <MyView
                                                hide={
                                                    this.state.transferFlow === 15 ||
                                                    this.state.transferFlow === 16
                                                }
                                            >
                                                <View style={Styles.viewRow}>
                                                    <View style={Styles.viewRowLeftItem}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            color="#000000"
                                                            text={PAYMENT_DETAILS}
                                                        />
                                                    </View>
                                                    <View style={Styles.viewRowRightItemOption}>
                                                        <TextInput
                                                            placeholderTextColor="rgb(199,199,205)"
                                                            textAlign="right"
                                                            autoCorrect={false}
                                                            autoFocus={false}
                                                            allowFontScaling={false}
                                                            style={
                                                                Platform.OS === "ios"
                                                                    ? Styles.commonInputConfirmIosText
                                                                    : Styles.commonInputConfirmText
                                                            }
                                                            testID="inputReference"
                                                            accessibilityLabel="inputReference"
                                                            secureTextEntry={false}
                                                            maxLength={20}
                                                            placeholder={OPTIONAL1}
                                                            onSubmitEditing={
                                                                this._onPaymentOptionTextDone
                                                            }
                                                            value={this.state.notesText}
                                                            onChangeText={
                                                                this._onPaymentOptionTextChange
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </MyView>

                                            {/* {this.state.transferFlow != 16 && (
                                            <View style={Styles.lineConfirm} />
                                        )} */}
                                            <View style={Styles.lineConfirm} />
                                            {this.state.transferFlow === 1 && (
                                                <View style={Styles.viewRowDescriberItem}>
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        color={FADE_GREY}
                                                        text={NOTES1}
                                                    />
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="normal"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        color={FADE_GREY}
                                                        text={MONEY_WITHDRAWN_FROM_YOUR_INSURED}
                                                    />
                                                </View>
                                            )}

                                            {(this.state.transferFlow === 2 ||
                                                this.state.transferFlow === 3) && (
                                                <View style={Styles.viewRowDescriberItem}>
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        color={FADE_GREY}
                                                        text={NOTES1}
                                                    />
                                                    <Typo
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
                                            )}

                                            {(this.state.transferFlow === 4 ||
                                                this.state.transferFlow === 5) && (
                                                <View style={Styles.viewRowDescriberItem}>
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        color={FADE_GREY}
                                                        text={NOTES1}
                                                    />
                                                    <View style={Styles.viewRowDescriberTwo}>
                                                        <Typo
                                                            fontSize={12}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            color={FADE_GREY}
                                                            text="1."
                                                        />
                                                        <View
                                                            style={Styles.viewRowDescriberOneInner}
                                                        >
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="left"
                                                                color={FADE_GREY}
                                                                text={NO_SERVICE_CHARGE_APPICABLE}
                                                            />
                                                        </View>
                                                    </View>

                                                    <View style={Styles.viewRowDescriberTwo}>
                                                        <Typo
                                                            fontSize={12}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            color={FADE_GREY}
                                                            text="2."
                                                        />
                                                        <View
                                                            style={Styles.viewRowDescriberOneInner}
                                                        >
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="left"
                                                                color={FADE_GREY}
                                                                text={
                                                                    MONEY_WITHDRAW_FROM_YOUR_INSURED
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            {this.state.transferFlow === 12 && (
                                                <View style={Styles.viewRowDescriberItem}>
                                                    <View style={Styles.viewRowDescriberOne}>
                                                        <Typo
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
                                                        <Typo
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

                                                    <View style={Styles.viewRowDescriberThree}>
                                                        <Typo
                                                            fontSize={12}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            color={FADE_GREY}
                                                            text={`${DECLARATION}:`}
                                                        />
                                                    </View>

                                                    <View style={Styles.viewRowDescriberOne}>
                                                        <Typo
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

                                                    <View style={Styles.viewRowTermsItem}>
                                                        <TouchableOpacity
                                                            onPress={this._onTeamsConditionClick}
                                                        >
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="500"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={18}
                                                                textAlign="left"
                                                                color="#000000"
                                                                textDecorationLine="underline"
                                                            >
                                                                <Text
                                                                    style={[
                                                                        commonStyles.termsConditionsLabel,
                                                                        commonStyles.font,
                                                                    ]}
                                                                    accessible={true}
                                                                    testID="txtExistingUser"
                                                                    accessibilityLabel="txtExistingUser"
                                                                >
                                                                    {TERMS_CONDITIONS}
                                                                </Text>
                                                            </Typo>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}

                                            {this.state.transferFlow === 15 && (
                                                <View style={Styles.viewRowDescriberItem}>
                                                    <View style={Styles.viewRowDescriberOne}>
                                                        <Typo
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
                                                        <Typo
                                                            fontSize={12}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            color={FADE_GREY}
                                                            text={LOAN_CNF_NOTE_TEXT}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {this.state.transferFlow !== 16 && this.state.showAccounts && (
                                        <View style={{ paddingTop: 25 }}>
                                            <AccountList
                                                title={
                                                    this.state.transferFlow === 15
                                                        ? SEND_FROM
                                                        : TRANSFER_FROM
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
                            {this.state.transferFlow === 16 ? (
                                <View style={Styles.footerButton}>
                                    <ActionButton
                                        disabled={this.state.loader}
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this._onConfirmClick}
                                        backgroundColor={this.state.loader ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                color={this.state.loader ? DISABLED_TEXT : BLACK}
                                                text={SEND_REQUEST}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <FixedActionContainer
                                    hideGradient={isTapTasticReady && festiveFlag && festiveImage}
                                >
                                    <ActionButton
                                        disabled={this.state.loader}
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this._onConfirmClick}
                                        backgroundColor={this.state.loader ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                color={this.state.loader ? DISABLED_TEXT : BLACK}
                                                text={
                                                    this.state.transferFlow === 15
                                                        ? SEND_NOW
                                                        : TRANSFER_NOW
                                                }
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </FixedActionContainer>
                            )}
                        </ScreenLayout>
                    </>

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
                            amount={this.state.seletedAmount}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            s2uPollingData={this.state.secure2uValidateData}
                            transactionDetails={this.state.s2uTransactionDetails}
                            extraParams={this.state.secure2uExtraParams}
                        />
                    )}
                    {this.state.showV4S2u && (
                        <Secure2uAuthenticationModal
                            token=""
                            onS2UDone={this.onS2uV4Done}
                            onS2UClose={this.onS2uV4Close}
                            s2uPollingData={this.state.mapperData}
                            transactionDetails={this.state.mapperData}
                            secure2uValidateData={this.state.mapperData}
                            s2uEnablement
                            navigation={this.props.navigation}
                            extraParams={{
                                metadata: {
                                    txnType: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                                },
                            }}
                        />
                    )}
                    {this.state.showTAC && (
                        <TacModal
                            transferApi={
                                this.state.transferFlow === 12 && this.state.duitNowRecurring
                                    ? duItNowRecurring
                                    : this.state.transferFlow === 15 && this.state.payRequest
                                    ? sendMoneyPaidApi
                                    : this.state.transferFlow === 15 && !this.state.payRequest
                                    ? sendMoneyApi
                                    : fundTransferApi
                            }
                            transferAPIParams={
                                this.state.transferFlow === 12 && this.state.duitNowRecurring
                                    ? this.state.duItNowParams
                                    : this.state.params
                            }
                            tacParams={this.state.tacParams}
                            validateByOwnAPI={false}
                            onTacClose={this.hideTAC}
                            onTacSuccess={
                                this.state.transferFlow === 12 && this.state.duitNowRecurring
                                    ? this._recurringSuccess
                                    : this._fundTransferSuccess
                            }
                            onTacError={
                                this.state.transferFlow === 12 && this.state.duitNowRecurring
                                    ? this._recurringFailure
                                    : this._fundTransferFailed
                            }
                            festiveFlag={festiveFlag}
                            festiveImage={festiveImage}
                            isS2UDown={this.state.isS2UDown}
                        />
                    )}
                    <ScrollPickerView
                        showMenu={this.state.showScrollPickerView}
                        list={this.state.list}
                        selectedIndex={this.state.selectedIndex}
                        onRightButtonPress={this._onRightButtonPress}
                        onLeftButtonPress={this._onLeftButtonPress}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                </ScreenContainer>
                {this.state.showDatePicker && (
                    <DatePicker
                        showDatePicker={this.state.showDatePicker}
                        onCancelButtonPressed={this.hideDatePicker}
                        onDoneButtonPressed={this.onDateDonePress}
                        dateRangeStartDate={this.state.confirmDateStartDate}
                        dateRangeEndDate={this.state.confirmDateEndDate}
                        defaultSelectedDate={moment(
                            this.state.confirmDateSelectedCalender
                        ).toDate()}
                    />
                )}
            </React.Fragment>
        );
    }
}
export default withModelContext(withFestive(TransferConfirmationScreen));

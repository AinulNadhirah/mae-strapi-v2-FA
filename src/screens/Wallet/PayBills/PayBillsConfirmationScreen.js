import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, TouchableOpacity, TextInput, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast } from "@components/Toast";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferConfirmation from "@components/Transfers/TransferConfirmationScreenTemplate";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, payBill, payBillInquiry } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, GREY, ROYAL_BLUE } from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { PAYMENTS_ONE_OFF } from "@constants/dateScenarios";
import * as FundConstants from "@constants/fundConstants";
import {
    ADD_DETAILS,
    CONFIRMATION,
    DATE,
    DONATE_NOW,
    FAILED,
    FAILED_REGISTER_S2U_PLEASE_USE_TAC,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_PAY_BILLERS_REVIEW_PAYMENT_DETAILS,
    FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FROM,
    OPTIONAL1,
    PAY_BILLS,
    PAY_NOW,
    SERVICE_FEES,
    TO,
    ZAKAT_TYPE,
} from "@constants/strings";
import { PAY_BILL_API, ZAKAT_PAY_BILL_API } from "@constants/url";

import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import { getDateRange, getStartDate, getEndDate, getDefaultDate } from "@utils/dateRange";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");
// ===========
// VAR
// ===========
// this value as a flag user is editing startDate or endDate, there is a logic to handle after user click done on calendar
let confirmDateEditFlow = 0;
const todayDateCode = "00000000";

class PayBillsConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        console.log("PayBillsConfirmationScreen :::", props.route.params);

        super(props);

        this.prevSelectedAccount = props.route.params.prevSelectedAccount;
        this.fromModule = props.route.params?.fromModule;
        this.fromScreen = props.route.params?.fromScreen;

        const billRef2Required = props.route.params?.billerInfo?.billRef2Required === "1";
        const requiredFields = props.route.params?.requiredFields ?? [];
        const isDoneDisabled =
            billRef2Required && requiredFields.length > 1 && requiredFields[1]?.fieldValue === "";
        // if (billRef2Required && requiredFields.length > 1 && requiredFields[1]?.fieldValue === "") {
        //     isDoneDisabled = true;
        // }

        this.state = {
            disabled: false,
            notesText: "",
            amount: props.route.params?.amount,
            flow: props.route.params.auth === "fail" ? "TAC" : props.route.params.flow,
            accounts: [],
            title: props.route.params?.billerInfo?.fullName
                ? props.route.params?.billerInfo?.fullName
                : props.route.params?.billerInfo?.shortName,
            subTitle:
                props.route.params?.billerInfo?.subName ?? requiredFields?.[0].fieldValue ?? "",
            logoImage: props.route.params?.billerInfo?.imageUrl,
            displayDate: "Today",
            showTransferDateView: false,
            selectedAccount: null,
            select: { start: 0, end: 0 },
            showDatePicker: false,
            showScrollPickerView: false,
            selectedIndex: 0, // scrollViewSelectedIndex
            dateRangeStart: new Date(),
            dateRangeEnd: new Date(),
            defaultSelectedDate: new Date(),
            selectedStartDate: new Date(),
            formatedStartDate: "", // toshowonscreen
            formatedEndDate: "", // toshowonscreen
            effectiveDate: todayDateCode, // to use in api call
            requiredFields,
            billRef2Required: billRef2Required,

            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            secure2uValidateData: props.route.params?.secure2uValidateData,
            transferAmount: props.route.params?.amount,
            image: Assets.icMaybankAccount,
            screenData: {
                image: Assets.icMaybankAccount,
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            bankName: "",
            tacParams: null,
            transferAPIParams: null,
            isShowS2u: false,
            transactionResponseObject: null, // to pass to s2uAuth modal
            s2uExtraParams: {
                metadata: {
                    txnType: "PAY_BILL",
                    donation: props.route.params?.donationFlow ?? false,
                },
            },
            isDoneDisabled,
            isFav: props.route.params?.isFav ?? false,
            // Donation related
            donationFlow: props.route.params?.donationFlow ?? false,
            // Zakat Related
            zakatFlow: props.route.params?.zakatFlow ?? false,
            zakatFitrahFlow: props.route.params?.zakatFitrahFlow ?? false,
            zakatType: "",
            serviceFee: "",
            riceType: "",
            numOfPeople: "",
            radioBtnText: false,
            zakatRadioBtn: true,
            ref2Val: "",
            isLoading: false,
            validDateRangeData: getDateRangeDefaultData(PAYMENTS_ONE_OFF),
        };
    }

    componentDidMount() {
        console.log("[PayBillsConfirmationScreen] >> [componentDidMount]");
        this._getDatePickerData();
        const zakatFlow = this.props.route.params?.zakatFlow ?? false;
        logEvent(
            FA_VIEW_SCREEN,
            zakatFlow
                ? {
                      [FA_SCREEN_NAME]: FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
                  }
                : { [FA_SCREEN_NAME]: FA_PAY_BILLERS_REVIEW_PAYMENT_DETAILS }
        );

        this.updateDataInScreenAlways();
        this.getAccountsList();
    }
    _getDatePickerData() {
        getDateRange(PAYMENTS_ONE_OFF).then((data) => {
            this.setState({
                validDateRangeData: data,
                defaultSelectedDate: getDefaultDate(data),
            });
        });
    }

    updateDataInScreenAlways = () => {
        console.log("[PayBillsConfirmationScreen] >> [updateDataInScreenAlways]");

        const params = this.props?.route?.params ?? {};
        const zakatFlow = params?.zakatFlow ?? false;
        const secure2uValidateData = params?.secure2uValidateData ?? {
            action_flow: "TAC",
        };

        const transferParams = params?.transferParams ?? this.state.screenData;

        console.log("PayBillsConfirmationScreen transferParams : ", transferParams);
        console.log("updateData ==> ", transferParams);
        const screenData = {
            image: transferParams?.image,
            name: transferParams?.formattedToAccount,
            description1: transferParams?.accountName,
            description2: transferParams?.bankName,
        };

        this.setState({
            bankName: transferParams?.bankName,
            image: Assets.icMaybankAccount,
            transferParams: transferParams,
            screenData: screenData,
            secure2uValidateData: secure2uValidateData,
        });

        if (zakatFlow) {
            this.initZakatData();
        }
    };

    initZakatData = () => {
        console.log("[PayBillsConfirmationScreen] >> [initZakatData]");

        const params = this.props?.route?.params ?? {};
        const zakatFitrahFlow = params?.zakatFitrahFlow ?? false;

        const { isTapTasticReady } = this.props.getModel("misc");
        this.setState({
            zakatType: params?.zakatType ?? "",
            serviceFee: "RM 0.00",
            riceType: params?.riceType ?? "",
            numOfPeople: params?.payingForNum,
            subTitle: params?.formattedMobileNumber ?? "",
            radioBtnText: params?.radioBtnText ?? false,
            s2uExtraParams: {
                metadata: {
                    txnType: zakatFitrahFlow ? "ZAKAT_FITRAH" : "ZAKAT",
                },
                txnType: isTapTasticReady ? "M2UZAKAT" : "",
            },
        });
    };

    onZakatRadioTap = () => {
        console.log("[PayBillsConfirmationScreen] >> [onZakatRadioTap]");

        const { zakatRadioBtn } = this.state;

        this.setState({ zakatRadioBtn: !zakatRadioBtn, isDoneDisabled: zakatRadioBtn });
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    // -----------------------
    // API CALL
    // -----------------------
    getAccountsList = () => {
        console.log("[PayBillsConfirmationScreen] >> [getAccountsList]");

        const subUrl = "/summary";
        const params = "?type=A";

        this.newAccountList = [];

        // this.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                this.showLoader(false);
                const result = response.data.result;

                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                if (
                    this.props.route.params.billerInfo.creditCardPayment === "0" ||
                    this.prevSelectedAccount?.accountType === "card"
                ) {
                    this.getCardsList();
                } else {
                    this.doPreSelectAccount();
                }
            })
            .catch((error) => {
                this.showLoader(false);
                this.doPreSelectAccount();
                console.log("getAccountsList:error", error);
            });
    };

    getCardsList = () => {
        console.log("[PayBillsConfirmationScreen] >> [getCardsList]");

        const subUrl = "/summary";
        const params = "?type=C";

        // this.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                this.showLoader(false);
                const result = response.data.result;
                if (result) {
                    this.newAccountList = [...this.newAccountList, ...result.accountListings];
                }

                this.doPreSelectAccount();
            })
            .catch((error) => {
                this.showLoader(false);
                console.log("getCardsList:error", error);
                this.doPreSelectAccount();
            });
    };

    doPreSelectAccount = () => {
        console.log("[PayBillsConfirmationScreen] >> [doPreSelectAccount]");

        let propsToCompare = "acctNo";
        let selectedAccount;
        let selectedIndex = null;

        if (this.prevSelectedAccount && this.prevSelectedAccount.accountType === "card") {
            propsToCompare = "cardNo";
        }

        if (this.prevSelectedAccount) {
            selectedAccount = this.newAccountList.find((item, i) => {
                const isFind = item.number == this.prevSelectedAccount[propsToCompare];
                if (isFind) {
                    selectedIndex = i;
                }
                return isFind;
            });
        } else {
            selectedAccount = this.newAccountList.find((item, i) => {
                if (item.primary) {
                    selectedIndex = i;
                }
                return item.primary;
            });
        }

        if (!selectedAccount && this.newAccountList.length > 0) {
            selectedAccount = this.newAccountList[0];
            selectedIndex = 0;
        }

        if (selectedAccount) {
            const temp = this.newAccountList[selectedIndex];
            this.newAccountList.splice(selectedIndex, 1);
            this.newAccountList.unshift(temp);
            selectedAccount.selected = true;
        }

        if (this.props.route.params.auth === "fail") {
            showErrorToast({ message: FAILED_REGISTER_S2U_PLEASE_USE_TAC });
        }

        this.setState({ accounts: this.newAccountList, selectedAccount: selectedAccount });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onBackPress]");

        const { zakatFlow, zakatFitrahFlow, isFav } = this.state;
        if (!isFav && zakatFlow && zakatFitrahFlow) {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_MOBILE_NUMBER,
                params: {
                    ...this.props.route.params,
                },
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    onClosePress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onClosePress]");
        const { donationFlow } = this.state;

        if (this.prevSelectedAccount) {
            this.props.navigation.navigate(this.fromModule, {
                screen: this.fromScreen,
                params: {
                    prevData: this.prevSelectedAccount,
                    // onGoBack: this._refresh
                },
            });
        } else {
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: navigationConstant.DASHBOARD,
                    params: { refresh: donationFlow },
                },
            });
        }
    };

    // scrollPicker event
    scrollPickerDonePress = (value, index) => {
        console.log("[PayBillsConfirmationScreen] >> [scrollPickerDonePress]");

        const selected = value.const;
        if (selected === "ONE_OFF_TRANSFER") {
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: false,
                selectedIndex: index,
                formatedStartDate: "",
                formatedEndDate: "",
            });
        } else if (selected === "RECURRING") {
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startDate = DataModel.getFormatedTodaysMoments("DD MMM YYYY");
            const endDate = DataModel.getFormatedDateMoments(tomorrow, "DD MMM YYYY");
            this.setState({
                showScrollPickerView: false,
                showTransferDateView: true,
                selectedIndex: index,
                formatedStartDate: startDate,
                formatedEndDate: endDate,
            });
        }
    };

    scrollPickerCancelPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [scrollPickerCancelPress]");

        this.setState({
            showScrollPickerView: false,
        });
    };

    // Calendar Event
    onDateDonePress = (date) => {
        console.log("[PayBillsConfirmationScreen] >> [onDateDonePress]");

        // TODO: need to understand this!!!
        console.log("  [onDateDonePress] ", date);
        let formatedDate = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
        // console.log("  [formatedDate] ", formatedDate);
        const today = new Date();
        let nextDay = new Date();
        let effectiveDate = todayDateCode;

        const month =
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        const days = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
        const year = date.getFullYear().toString();

        const todayInt = year + month + days;

        if (
            DataModel.getFormatedDateMoments(today, "DD MMM YYYY") ===
            DataModel.getFormatedDateMoments(date, "DD MMM YYYY")
        ) {
            formatedDate = "Today";
            effectiveDate = todayDateCode;
        } else {
            effectiveDate = todayInt;
        }

        const nextDayMoments = moment(date).add(1, "days");
        nextDay = nextDayMoments.toDate();
        //nextDay.setDate(date.getDate() + 1);
        const monthNextDay =
            nextDay.getMonth() + 1 < 10
                ? `0${nextDay.getMonth() + 1}`
                : `${nextDay.getMonth() + 1}`;
        const daysNextDay =
            nextDay.getDate() + 1 < 10 ? `0${nextDay.getDate() + 1}` : `${nextDay.getDate() + 1}`;
        const yearNextDay = nextDay.getFullYear().toString();

        let nextDayInt = "";

        let formatedDateNextDay;

        if (confirmDateEditFlow === 1) {
            formatedDateNextDay = DataModel.getFormatedDateMoments(date, "DD MMM YYYY");
            this.setState({
                formatedEndDate: formatedDate,
            });
        } else {
            // setStartDate
            nextDayInt = yearNextDay + monthNextDay + daysNextDay;
            formatedDateNextDay = DataModel.getFormatedDateMoments(nextDay, "DD MMM YYYY");
        }

        if (date instanceof Date) {
            if (confirmDateEditFlow === 1) {
                this.setState({
                    formatedEndDate: formatedDate,
                });
            } else {
                this.setState({
                    dateText: date.toISOString().split("T")[0],
                    date: date,
                    displayDate: formatedDate,
                    selectedStartDate: date,
                    formatedStartDate: formatedDate,
                    formatedEndDate: formatedDateNextDay,
                    effectiveDate: effectiveDate,
                });
            }
        }
        this.onDateCancelPress();
    };

    onDateCancelPress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onDateCancelPress]");

        this.setState({
            showDatePicker: false,
        });
    };

    onEditStartDate = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditStartDate]");

        confirmDateEditFlow = 0;

        const startDate = new Date();
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    onEditEndDate = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditEndDate]");

        confirmDateEditFlow = 1;

        const startDate = this.state.selectedStartDate;
        const maxDate = new Date();

        maxDate.setDate(maxDate.getDate() + 28);

        this.setState({
            dateRangeStart: startDate,
            dateRangeEnd: maxDate,
            defaultSelectedDate: startDate,
        });
        this.onOpenNewCalenderFlow();
    };

    // Calendar Related function
    onDateEditClick = () => {
        console.log("[PayBillsConfirmationScreen] >> [onDateEditClick]");

        this.setState({
            dateRangeStart: getStartDate(this.state.validDateRangeData),
            dateRangeEnd: getEndDate(this.state.validDateRangeData),
            defaultSelectedDate: this.state.displayDate,
            showDatePicker: true,
        });
    };

    onOpenNewCalenderFlow = () => {
        console.log("[PayBillsConfirmationScreen] >> [onOpenNewCalenderFlow]");

        this.setState({
            showDatePicker: true,
            // showScrollPickerView: false,
        });
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        console.log("[PayBillsConfirmationScreen] >> [onChallengeSnackClosePress]");

        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("[PayBillsConfirmationScreen] >> [onChallengeQuestionSubmitPress]");

        const { challenge } = this.state;

        let params = this.getTransferAPIParams(this.isS2u);

        this.setState(
            {
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                this.callTransferAPI({ ...params, challenge: { ...challenge, answer } });
            }
        );
    };

    onAccountListClick = (item) => {
        console.log("[PayBillsConfirmationScreen] >> [onAccountListClick]");

        const itemType =
            item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
        if (parseFloat(item.acctBalance) <= 0.0 && itemType === "account") {
            // TODO: show zero error
        } else {
            let tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].number === item.number) {
                    console.log("selectedAccount Obj ==> ", tempArray[i]);
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }
            this.setState({ accounts: tempArray, selectedAccount: item });
        }
    };

    // TODO: need to understand this!!!
    onConfirmClick = async () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        if (this.state.disabled || !this.state.selectedAccount) {
            return;
        }
        console.log("[PayBillsConfirmationScreen] >> [onConfirmClick]");
        const zakatType = this.props.route.params?.zakatType ?? false;
        zakatType &&
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: FA_PAY_ZAKAT_REVIEW_PAYMENT_DETAILS,
                [FA_FIELD_INFORMATION]: zakatType,
            });
        const { selectedAccount, donationFlow } = this.state;

        this.setState({ isLoading: true, disabled: true });

        let inqResult;

        try {
            const params = this.getTransferAPIParams(false);
            const payeeCode = this.props?.route?.params?.billerInfo?.payeeCode;

            inqResult = await payBillInquiry({
                billAcctNo: donationFlow
                    ? payeeCode
                    : params.billAcctNo != ""
                    ? params.billAcctNo
                    : params.billRefNo,
                payeeCode,
            });

            // TODO:, backend should change to "0"
            if (inqResult.statusCode !== "0000") {
                this.setState({ isLoading: false, disabled: false });
                showErrorToast({ message: inqResult.statusDescription });
                return;
            }
        } catch (err) {
            console.log(err); // TypeError: failed to fetch
            if (err?.message) {
                this.setState({ isLoading: false, disabled: false });
                showErrorToast({ message: err.message });
            }
            return;
        }

        console.log("payBillInquiry result:", inqResult);

        const validateAccount = selectedAccount.number.length >= 1;
        console.log("validateAccount:", validateAccount);
        if (validateAccount) {
            this.payBillFlow();
        } else {
            this.setState({ disabled: false });
        }
    };

    onEditAmount = () => {
        console.log("[PayBillsConfirmationScreen] >> [onEditAmount]");

        this.props.navigation.goBack();
    };

    onRef2Change = (val) => {
        val = val.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        const requiredFields = [...this.state.requiredFields];
        const { billRef2Required } = this.state;
        // requiredFields[1].fieldName = "billRefNo";
        // requiredFields[1].fieldValue = val;

        // if (requiredFields?.length === 2) {
        //     requiredFields.push({ fieldName: "billRef2", fieldValue: val });
        // } else {
        //     requiredFields[requiredFields?.length > 1 ? 2 : 1].fieldName =
        //         requiredFields?.length > 1 ? "billRef2" : "billRef";
        //     requiredFields[requiredFields?.length > 1 ? 2 : 1].fieldValue = val;
        // }
        requiredFields[2].fieldValue = val;
        const isDoneDisabled = val?.length < 3 && billRef2Required;
        this.setState({ requiredFields, isDoneDisabled, ref2Val: val });
    };

    onRef1Change = (val) => {
        val = val.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        const { billRef2Required } = this.state;
        const requiredFields = [...this.state.requiredFields];
        requiredFields[1].fieldValue = val;
        const isDoneDisabled = val?.length < 3;
        this.setState({ requiredFields, isDoneDisabled });
    };

    onRiceTypeEdit = () => {
        console.log("[PayBillsConfirmationScreen] >> [onRiceTypeEdit]");

        const { isFav } = this.state;

        if (isFav) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_DETAILS,
                params: {
                    ...this.props.route.params,
                    routeBackFrom: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                },
            });
        }
    };

    onNumOfPeopleEdit = () => {
        console.log("[PayBillsConfirmationScreen] >> [onNumOfPeopleEdit]");

        const { isFav } = this.state;

        if (isFav) {
            this.props.navigation.goBack();
        } else {
            this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
                screen: navigationConstant.ZAKAT_DETAILS,
                params: {
                    ...this.props.route.params,
                    routeBackFrom: navigationConstant.PAYBILLS_CONFIRMATION_SCREEN,
                },
            });
        }
    };

    // -----------------------
    // OTHERS
    // -----------------------

    // make flow decision
    payBillFlow = () => {
        console.log("[PayBillsConfirmationScreen] >> [payBillFlow]");

        const { secure2uValidateData, donationFlow } = this.state;
        console.log("secure2uValidateData:", secure2uValidateData);
        console.log("this.props.route.params.isFav:", this.props.route.params.isFav);
        /////// reflow
        if (this.props.route.params.isFav || this.state.flow === "NA") {
            // this.props.route.params.isFav
            // do pay
            const params = this.getTransferAPIParams(false);
            this.isS2u = false;
            this.callTransferAPI(params);
        } else {
            if (this.state.flow === "S2U" || this.state.flow === "S2UReg") {
                // if (secure2uValidateData && secure2uValidateData.action_flow === "S2U") {
                // go pay and go to sec2u
                const params = this.getTransferAPIParams(true);
                this.isS2u = true;
                this.callTransferAPI(params);
            } else {
                console.log("TAC");
                const params = this.getTransferAPIParams(false);
                this.isS2u = false;

                const tacParams = {
                    amount: params.transferAmount,
                    donation: donationFlow,
                    fromAcctNo: params.fromAccount,
                    fundTransferType: params.transactionType,
                    accCode: params.fromAcctCode,
                    toAcctNo: params.billAcctNo != "" ? params.billAcctNo : params.billRefNo,
                    payeeName: this.props.route.params?.billerInfo?.fullName
                        ? this.props.route.params?.billerInfo?.fullName
                        : this.props.route.params?.billerInfo?.shortName,
                };

                // show tac ui
                this.setState({ tacParams, transferAPIParams: params });
            }
        }
    };

    // prepare paybill params
    getTransferAPIParams = (isS2u) => {
        console.log("[PayBillsConfirmationScreen] >> [getTransferAPIParams]");

        const params = this.props?.route?.params ?? {};
        const {
            selectedAccount,
            effectiveDate,
            amount,
            zakatFlow,
            zakatFitrahFlow,
            donationFlow,
            zakatType,
        } = this.state;

        let billAcctNo = "";
        let billRefNo = "";

        const billParams = {};
        const requiredFields = this.state?.requiredFields ?? [];

        console.log("requiredFields:", requiredFields);

        requiredFields.forEach((field) => {
            if (field?.fieldName === "bilAcct") {
                billAcctNo = field.fieldValue;
            } else if (field?.fieldName === "billRef") {
                billRefNo = field.fieldValue; // TODO: double confirm with backend, billRefNo or billRefNo2
                // } else if (field?.fieldName === "billRef2") {
                //     billParams.billRef2No = field.fieldValue;
                //     billParams.billRefNo2 = field.fieldValue;
            }
        });

        const deviceInfo = this.props.getModel("device");
        const mobileSDK = Utility.getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        let transferParams = {
            accountType: selectedAccount.accountType,
            billAcctNo: donationFlow ? "AJD" : billAcctNo,
            billRefNo: billRefNo,
            ...billParams,
            effectiveDateTime: effectiveDate, //"00000000"
            fromAccount: selectedAccount.number,
            fromAcctCode: selectedAccount.code,
            onlinePayment: params?.billerInfo.onlinePayment,
            payeeCode: params?.billerInfo.payeeCode,
            tacrequired: params?.billerInfo.tacRequired,
            transactionType: FundConstants.BILL_PAYMENT_OTP,
            transferAmount: amount,
            tac: this.tac ? this.tac : "",
            startDate: "",
            endDate: "",
            payeeName: params?.billerInfo?.fullName
                ? params?.billerInfo?.fullName
                : params?.billerInfo?.shortName,
            mobileSDKData: mobileSDK, // Required For RSA
            type: params.isFav ? "FAVORITE" : "OPEN",
            zakat: zakatFlow,
            donation: donationFlow,
            zakatFitrah: zakatFitrahFlow,
            zakatType,
        };

        if (!params.isFav) {
            if (isS2u) {
                const { secure2uValidateData } = this.state;
                transferParams.twoFAType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL";
            } else {
                transferParams.twoFAType = "TAC";
            }
        }

        return transferParams;
    };

    callTransferAPI = (params) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPI]");

        const { zakatFlow } = this.state;
        const url = zakatFlow ? ZAKAT_PAY_BILL_API : PAY_BILL_API;

        payBill(params, url)
            .then((response) => {
                console.log("payBill respone**:", response);
                this.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });

                const responseObject = response.data;
                if (responseObject?.statusCode === "0") {
                    const { isFav } = this.props.route.params;
                    if (isFav || this.state.flow === "TAC" || this.state.flow === "NA") {
                        console.log("#success, isfav or tac, go to done");
                        this.goToAcknowledgeScreen(responseObject);
                    } else {
                        console.log("#success, OPEN S2U");
                        this.openS2UModal(responseObject);
                    }
                } else {
                    // FAIL
                    console.log("#fail 1", responseObject);
                    this.goToAcknowledgeScreen(responseObject);
                }
            })
            .catch((data) => {
                this.showLoader(false);
                this.callTransferAPIErrorHandler(data);
            });
    };

    callTransferAPIForTac = (params) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPIForTac]");

        const { zakatFlow } = this.state;
        const url = zakatFlow ? ZAKAT_PAY_BILL_API : PAY_BILL_API;

        return payBill(params, url);
    };

    callTransferAPIErrorHandler = (err) => {
        console.log("[PayBillsConfirmationScreen] >> [callTransferAPIErrorHandler]");

        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428
            this.setState((prevState) => ({
                challenge: err.error.challenge,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: err.error.challenge.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
                tacParams: null,
                transferAPIParams: null,
            }));
        } else if (err.status === 423) {
            console.log("423:", err);
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    const reason = err?.error?.statusDescription;
                    const loggedOutDateTime = err?.error?.serverDate;
                    const lockedOutDateTime = err?.error?.serverDate;
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
        } else if (err.status === 422) {
            // RSA deny handler
            let errorObj = err?.error;
            errorObj = errorObj?.error ?? errorObj;

            const { statusDescription, additionalStatusDescription, serverDate } = errorObj;

            let rsaDenyScreenParams = {
                statusDescription,
                additionalStatusDescription,
                serverDate,
                nextParams: { screen: navigationConstant.DASHBOARD, params: { refresh: false } },
                nextModule: navigationConstant.TAB_NAVIGATOR,
                nextScreen: "Tab",
            };

            if (this.prevSelectedAccount) {
                rsaDenyScreenParams.nextParams = this.prevSelectedAccount;
                rsaDenyScreenParams.nextModule = this.fromModule;
                rsaDenyScreenParams.nextScreen = this.fromScreen;
            }

            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
                params: rsaDenyScreenParams,
            });
        } else {
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    let errorObj = err?.error;
                    errorObj = errorObj?.error ?? errorObj;
                    if (err.status >= 500 && err.status < 600) {
                        showErrorToast({ message: errorObj.message ?? "Error" });
                    } else if (err.status >= 400 && err.status < 500) {
                        this.goToAcknowledgeScreen({
                            formattedTransactionRefNumber:
                                errorObj?.formattedTransactionRefNumber ?? null,
                            serverDate: errorObj?.serverDate ?? null,
                            additionalStatusDescription: errorObj?.message ?? null,
                            statusDescription: FAILED,
                            statusCode: errorObj.statusCode,
                        });
                    }
                }
            );
        }
    };

    getAddFavParam = () => {
        //
        return {};
    };

    openS2UModal = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [openS2UModal]");

        console.log(response);
        this.setState({ isShowS2u: true, transactionResponseObject: response });
    };

    onS2UDone = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [onS2UDone]");

        // will close s2u popup
        this.setState({ isShowS2u: false });

        let customResponse = {
            ...this.state.transactionResponseObject,
            statusCode: response.transactionStatus ? "0" : "1",
            ...(response?.s2uSignRespone && {
                additionalStatusDescription: response.s2uSignRespone.additionalStatusDescription,
                formattedTransactionRefNumber:
                    response.s2uSignRespone.formattedTransactionRefNumber,
            }),
        };

        this.goToAcknowledgeScreen(customResponse, response);
    };

    onS2UClose = () => {
        console.log("[PayBillsConfirmationScreen] >> [onS2UClose]");

        // will close tac popup
        this.setState({ isShowS2u: false });
    };

    onTacSuccess = (response) => {
        console.log("[PayBillsConfirmationScreen] >> [onTacSuccess]");

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null });

        this.goToAcknowledgeScreen(response);
    };

    onTacError = (err, tac) => {
        console.log("[PayBillsConfirmationScreen] >> [onTacError]");

        this.tac = tac;
        this.setState({ tacParams: null, transferAPIParams: null }, () =>
            this.callTransferAPIErrorHandler(err)
        );
    };

    onTacClose = () => {
        console.log("[PayBillsConfirmationScreen] >> [onTacClose]");

        // will close tac popup
        this.setState({ tacParams: null, transferAPIParams: null, isLoading: false });
    };

    goToAcknowledgeScreen = (response, s2uSignData = null) => {
        console.log("[PayBillsConfirmationScreen] >> [goToAcknowledgeScreen]");

        const { donationFlow, zakatFlow, zakatFitrahFlow } = this.state;

        const statusDescription =
            response.statusCode === "0" ? response?.statusDescription.toLowerCase() : "Failed";

        const statusCode = s2uSignData?.s2uSignRespone?.status ?? "";

        const s2uStatusDesc =
            s2uSignData?.s2uSignRespone?.statusDescription?.toLowerCase() ?? "Failed";

        if (s2uSignData) {
            const transferType = statusCode === "M201" ? "Transaction" : "Payment";
            response.statusDescription = `${transferType} ${s2uStatusDesc}`;

            if (statusCode === "M408") {
                response.statusDescription = `${s2uStatusDesc}`;
            }
        } else {
            response.statusDescription = `Payment ${statusDescription}`;
        }

        if (zakatFlow) {
            response.statusDescription = `Zakat ${statusDescription}`;
        }

        if (donationFlow) {
            response.statusDescription = `Donation ${statusDescription}`;
        }

        // effectiveDateType
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_ACKNOWLEDGE_SCREEN,
            params: {
                transferResponse: response,
                transferParams: {
                    ...this.props.route.params,
                    isToday: this.state.effectiveDate === todayDateCode ? true : false,
                    effectiveDate: this.state.effectiveDate,
                },
                s2uSignRespone: s2uSignData?.s2uSignRespone,
                zakatFlow,
                zakatFitrahFlow,
                donationFlow,
                isS2uFlow: s2uSignData !== null,
            },
        });
    };

    //Prod issue- this function is to mask the Card number in Approve/Reject page.
    processAccountNo = () => {
        const accType = this.state.selectedAccount.type;
        const accNum = this.state.selectedAccount.number;
        if (accType === "C" || accType === "J" || accType === "DC" || accType === "R") {
            return Utility.maskCard(accNum);
        } else {
            return Utility.getFormatedAccountNumber(accNum);
        }
    };

    // -----------------------
    // UI
    // -----------------------
    render() {
        const {
            title,
            subTitle,
            transferAmount,
            logoImage,
            accounts,
            selectedAccount,
            tacParams,
            transferAPIParams,
            transactionResponseObject,
            isShowS2u,
            showDatePicker,
            dateRangeStart,
            dateRangeEnd,
            defaultSelectedDate,
            secure2uValidateData,
            s2uExtraParams,
            displayDate,
            isDoneDisabled,
            donationFlow,
            zakatFlow,
            zakatFitrahFlow,
            zakatType,
            serviceFee,
            riceType,
            numOfPeople,
            radioBtnText,
            zakatRadioBtn,
            requiredFields,
            billRef2Required,
            isLoading,
        } = this.state;

        let transactionDetails = [];
        const refPlaceholder = billRef2Required ? ADD_DETAILS : OPTIONAL1;

        if (isShowS2u && selectedAccount) {
            if (zakatFlow) {
                transactionDetails = [
                    {
                        label: TO,
                        value: `${title}`,
                    },
                    {
                        label: FROM,
                        value: `${this.state.selectedAccount.name}\n${this.processAccountNo()}`,
                    },
                    { label: "Transaction Type", value: zakatType },
                    {
                        label: DATE,
                        value: `${moment(
                            this.state.transactionResponseObject.serverDate,
                            "D MMM YYYY, hh:mm a"
                        ).format("DD MMM YYYY")}`,
                    },
                ];
            } else {
                transactionDetails = [
                    {
                        label: TO,
                        value: `${this.state.title}\n${this.state.subTitle}`,
                    },
                    {
                        label: FROM,
                        value: `${this.state.selectedAccount.name}\n${this.processAccountNo()}`,
                    },
                    { label: "Transaction Type", value: PAY_BILLS },
                    {
                        label: DATE,
                        value: `${moment(
                            this.state.transactionResponseObject.serverDate,
                            "D MMM YYYY, hh:mm a"
                        ).format("DD MMM YYYY")}`,
                    }, //
                ];
            }
        }

        return (
            <TransferConfirmation
                headTitle={CONFIRMATION}
                payLabel={donationFlow ? DONATE_NOW : PAY_NOW}
                amount={transferAmount}
                onEditAmount={zakatFlow && zakatFitrahFlow ? null : this.onEditAmount}
                logoTitle={title}
                logoSubtitle={
                    zakatFlow || donationFlow ? subTitle : Utility.addSpaceAfter4Chars(subTitle)
                }
                logoImg={{
                    type: "url",
                    source: logoImage,
                }}
                onDonePress={this.onConfirmClick}
                isDoneDisabled={isDoneDisabled}
                onBackPress={this.onBackPress}
                onClosePress={this.onClosePress}
                accounts={accounts}
                extraData={this.state}
                onAccountListClick={this.onAccountListClick}
                selectedAccount={selectedAccount}
                tacParams={tacParams}
                transferAPIParams={transferAPIParams}
                transferApi={this.callTransferAPIForTac}
                onTacSuccess={this.onTacSuccess}
                onTacError={this.onTacError}
                onTacClose={this.onTacClose}
                transactionResponseObject={transactionResponseObject}
                isShowS2u={isShowS2u}
                onS2UDone={this.onS2UDone}
                onS2UClose={this.onS2UClose}
                s2uExtraParams={s2uExtraParams}
                transactionDetails={transactionDetails}
                isLoading={isLoading}
                showDatePicker={showDatePicker}
                onCancelButtonPressed={this.onDateCancelPress}
                onDoneButtonPressed={this.onDateDonePress}
                dateRangeStartDate={dateRangeStart}
                dateRangeEndDate={dateRangeEnd}
                defaultSelectedDate={defaultSelectedDate}
                secure2uValidateData={secure2uValidateData}
            >
                {zakatFlow ? (
                    <View style={Styles.detailsViewCls}>
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={DATE} />}
                            right={<TransferDetailValue value={displayDate} />}
                        />
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={ZAKAT_TYPE} />}
                            right={<TransferDetailValue value={zakatType} />}
                        />
                        <TransferDetailLayout
                            left={<TransferDetailLabel value={SERVICE_FEES} />}
                            right={<TransferDetailValue value={serviceFee} />}
                        />

                        {zakatFitrahFlow ? (
                            <>
                                <TransferDetailLayout
                                    left={<TransferDetailLabel value="Rice type" />}
                                    right={
                                        <TransferDetailValue
                                            value={riceType}
                                            onPress={this.onRiceTypeEdit}
                                        />
                                    }
                                />
                                <TransferDetailLayout
                                    left={<TransferDetailLabel value="No. of people" />}
                                    right={
                                        <TransferDetailValue
                                            value={numOfPeople}
                                            onPress={this.onNumOfPeopleEdit}
                                        />
                                    }
                                />

                                <View style={Styles.lineConfirm} />

                                {radioBtnText && (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={this.onZakatRadioTap}
                                        style={Styles.radioBtnViewCls}
                                    >
                                        {zakatRadioBtn ? (
                                            <RadioChecked
                                                label={radioBtnText}
                                                paramLabelCls={Styles.radioBtnLabelCls}
                                                paramContainerCls={Styles.radioBtnContainerStyle}
                                                checkType="image"
                                                imageSrc={Assets.icRadioChecked}
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label={radioBtnText}
                                                paramLabelCls={Styles.radioBtnLabelCls}
                                                paramContainerCls={Styles.radioBtnContainerStyle}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <View style={Styles.lineConfirm} />
                        )}
                    </View>
                ) : (
                    <View style={Styles.detailsViewCls}>
                        {!donationFlow && (
                            <TransferDetailLayout
                                left={<TransferDetailLabel value={DATE} />}
                                right={
                                    <TransferDetailValue
                                        value={this.state.displayDate}
                                        onPress={this.onDateEditClick}
                                    />
                                }
                            />
                        )}
                        <>
                            {requiredFields?.length > 1 && (
                                <TransferDetailLayout
                                    left={
                                        <TransferDetailLabel
                                            value={
                                                requiredFields[1]?.fieldLabel ??
                                                requiredFields[1].alternateLabel
                                            }
                                        />
                                    }
                                    right={
                                        <TextInput
                                            textAlign="right"
                                            autoCorrect={false}
                                            autoFocus={false}
                                            allowFontScaling={false}
                                            style={Styles.textInput}
                                            placeholderTextColor={GREY}
                                            testID={"inputReference"}
                                            accessibilityLabel={"inputReference"}
                                            secureTextEntry={false}
                                            placeholder={ADD_DETAILS}
                                            value={requiredFields[1]?.fieldValue}
                                            onChangeText={this.onRef1Change}
                                            maxLength={20}
                                            keyboardType={"ascii-capable"}
                                        />
                                    }
                                />
                            )}
                            {/*{this.state.isFav && requiredFields?.length > 2 && (
                                <TransferDetailLayout
                                    left={
                                        <TransferDetailLabel
                                            value={
                                                requiredFields[2]?.fieldLabel ??
                                                requiredFields[2]?.alternateLabel
                                            }
                                            // value={`${Strings.EXTRA_FIELD} 2`}
                                        />
                                    }
                                    right={
                                        <TextInput
                                            textAlign="right"
                                            autoCorrect={false}
                                            autoFocus={false}
                                            allowFontScaling={false}
                                            style={Styles.textInput}
                                            testID={"inputReference"}
                                            accessibilityLabel={"inputReference"}
                                            secureTextEntry={false}
                                            placeholder={Strings.OPTIONAL1}
                                            value={this.state.ref2Val}
                                            onChangeText={this.onRef2Change}
                                            maxLength={20}
                                            keyboardType={"ascii-capable"}
                                        />
                                    }
                                />
                            )}*/}
                        </>
                        <View style={Styles.lineConfirm} />
                    </View>
                )}

                <ChallengeQuestion
                    loader={this.state.isRSALoader}
                    display={this.state.isRSARequired}
                    displyError={this.state.RSAError}
                    questionText={this.state.challengeQuestion}
                    onSubmitPress={this.onChallengeQuestionSubmitPress}
                    onSnackClosePress={this.onChallengeSnackClosePress}
                />
            </TransferConfirmation>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: "flex-start",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    scrollViewContainer: {
        width: "100%",
        paddingHorizontal: 12,
    },
    notesContainer: {
        paddingTop: 24,
    },

    lineConfirm: {
        backgroundColor: "#cccccc",
        flexDirection: "row",
        height: 1,
        marginTop: 15,
    },

    detailsViewCls: {
        paddingHorizontal: 24,
    },

    radioBtnViewCls: {
        alignItems: "flex-start",
        marginTop: 25,
    },

    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
        paddingLeft: 10,
    },

    radioBtnContainerStyle: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    textInput: {
        paddingTop: 0,
        marginTop: 0,
        paddingBottom: 0,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 14,
        width: "100%",
        textAlignVertical: "top",
        color: ROYAL_BLUE,
        fontWeight: "600",
    },
};

export default withModelContext(PayBillsConfirmationScreen);

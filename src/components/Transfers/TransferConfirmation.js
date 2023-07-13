/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable require-atomic-updates */
/* eslint-disable react/prop-types */
"use strict";
import React, { Component } from "react";
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    FlatList,
    Dimensions,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";
import SwitchToggle from "react-native-switch-toggle";
export const { width, height } = Dimensions.get("window");
import AccountDetailList from "@components/Others/AccountDetailList";
import {
    ErrorMessage,
    HeaderPageIndicator,
    Input,
    DropDownButtonNoIcon,
    DropDownButtonCenter,
    CircularNameView,
    CircularDefaultButtonText,
    MyView,
    CustomCalender,
    ImageView,
    Dropdown,
    DropdownSelection,
} from "@components/Common";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";
import { PAY_CARDS_DATES, DUIT_NOW_DATES } from "@constants/data";
import { regCountAPI } from "@services/index";
// import AsyncStorage from "@react-native-community/async-storage";
// import CustomFlashMessage from "@components/Toast";
import FlashMessage from "react-native-flash-message";
import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";

class TransferConfirmationScreen extends Component {
    static navigationOptions = { title: "", header: null };
    // **
    constructor(props) {
        super(props);
        this.state = {
            notesText:
                ModelClass.COMMON_DATA.transferFlow === 15
                    ? ModelClass.TRANSFER_DATA.recipientNotes
                    : "",
            client: null,
            amountText: 0.0,
            random: 100,
            currentScreen: 0,
            userName: "",
            password: "",
            image: "",
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
            maxDate: DataModel.getformteddate(DataModel.getNextDates(28)),
            dropDownmonthView: false,
            dropDoenyearView: false,
            isDisplayCalender: false,
            month: DataModel.getCurrentMonthName(),
            yearsArray: [],
            monthsArray: [],
            amountZeroError: false,
            notesError: false,
            seletedYear: DataModel.getCurrentYear(),
            seletedDate: DataModel.getcurrentDate(),
            validSchdule: false,
            loader: false,
            dateSelected: "",
            displayDate: "Today",
            displayTransferDate: "",
            minimumDATE: DataModel.getDayDateFormat(DataModel.getNextDates(1)),
            amountView: false,
            selectedAmount: "Select Amount",
            selectedAmountValue: 0.0,
            reloadError: false,
            reloadErrorMessage: "",
            showDateOptionsView: false,
            showDuitNowDateOptionsView: false,
            showTransferDateView: false,
            fromAccountError: false,
        };
        this.onTextChange = this._onTextChange.bind(this);
        this.onTextDone = this._onTextDone.bind(this);
        this.onEditAmount = this._onEditAmount.bind(this);
        this.onAccountItemClick = this._onAccountItemClick.bind(this);
        this.onAccountItemSwipeChange = this._onAccountItemSwipeChange.bind(this);
        this.onConfirmClick = this._onConfirmClick.bind(this);
        console.log(" minimumDATE Date is", this.state.minimumDATE);

        this.onAccountListClick = this._onAccountListClick.bind(this);
    }

    // **
    async componentDidMount() {
        await DataModel._getDeviceInformation();
        console.log(" SECURE2U_SERVICE_ENABLE: ", ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE);
        ModelClass.TRANSFER_DATA.isFutureTransfer = false;
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("transferFav ", ModelClass.DUITNOW_DATA.transferFav);
            console.log("isRecurringTransfer ", ModelClass.DUITNOW_DATA.isRecurringTransfer);
            console.log("startDateEndDateStr ", ModelClass.TRANSFER_DATA.startDateEndDateStr);
            this._updateDataInScreenAlways();
            this.setState({
                amountText: ModelClass.TRANSFER_DATA.transferAmount,
                showTransferDateView:
                    ModelClass.TRANSFER_DATA.startDateEndDateStr.length >= 0 ? true : false,
                displayTransferDate: ModelClass.TRANSFER_DATA.startDateEndDateStr,
            });
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});

        this._setSelectFromAccount();

        this._setUserDetails();
    }

    //**
    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // ----------------------
    // EVENT HANDLER
    // ----------------------
    // **
    // public
    _onAccountListClick = (item) => {
        if (parseFloat(item.acctBalance) <= 0.0) {
            this.setState({ amountZeroError: true });
        } else {
            let tempArray = this.state.accounts;
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].acctNo === item.acctNo) {
                    console.log("selectedAccount Obj ==> ", tempArray[i]);
                    tempArray[i].selected = true;
                } else {
                    tempArray[i].selected = false;
                }
            }
            this.setState({ accounts: tempArray });
            console.log("Item", item);

            // TODO: need to isolate
            if (ModelClass.COMMON_DATA.transferFlow === 13) {
                ModelClass.TRANSFER_DATA.formatedToAccount = Utility.getFormatedAccountNumber(
                    item.acctNo
                );
            }

            ModelClass.TRANSFER_DATA.fromAccountName = item.acctName;
            ModelClass.TRANSFER_DATA.fromAccount = item.acctNo;
            ModelClass.TRANSFER_DATA.fromAccountCode = item.acctCode;
        }
    };

    // **
    // private
    _onTextChange = (text) => {
        ModelClass.TRANSFER_DATA.recipientNotes = text;
        this.setState({ notesText: text });
    };

    // **
    // TODO: need to isolate
    // public
    _onEditAmount = () => {
        if (
            ModelClass.COMMON_DATA.transferFlow === 15 &&
            !ModelClass.SEND_MONEY_DATA.isSendMoneyAsOpen
        ) {
            ModelClass.TRANSFER_DATA.amountFlow = 1;
        } else {
            ModelClass.TRANSFER_DATA.amountFlow = 2;
            NavigationService.navigate(navigationConstant.TRANSFER_ENTER_AMOUNT);
        }
    };

    // **
    // private
    _onTextDone = (text) => {
        if (text != null && text != undefined && text != "" && text.length >= 1) {
            let validate = DataModel.alphaNumericRegex(text);
            if (!validate) {
                this.setState({ notesError: true });
            }
        }
    };

    // **
    // private
    _onAccountItemClick = (item) => {
        console.log("Item", item);
    };

    // **
    // private
    _onAccountItemSwipeChange = (text) => {
        console.log("text", text);
    };

    /**
     *_onConfirmClick()
     * @memberof TransferConfirmationScreen
     */

    // **
    // public
    _onConfirmClick = async () => {
        ModelClass.settings.moduleName = navigationConstant.WALLET_MODULE;
        ModelClass.settings.routeName = navigationConstant.WALLET_TAB_SCREEN;

        ModelClass.TRANSFER_DATA.formatedFromAccount = Utility.formateAccountNumber(
            ModelClass.TRANSFER_DATA.fromAccount,
            ModelClass.COMMON_DATA.maybankAccountLength
        );
        console.log("_onConfirmClick ==> ");
        console.log(
            " ModelClass.COMMON_DATA.transferFlow ==> " + ModelClass.COMMON_DATA.transferFlow
        );
        console.log(
            " ModelClass.DUITNOW_DATA.transferMaybank ==> ",
            ModelClass.DUITNOW_DATA.transferMaybank
        );
        console.log(
            " ModelClass.DUITNOW_DATA.transferOtherBank ==> ",
            ModelClass.DUITNOW_DATA.transferOtherBank
        );
        console.log(
            " ModelClass.DUITNOW_DATA.transferFav ==> ",
            ModelClass.DUITNOW_DATA.transferFav
        );
        console.log(
            " ModelClass.DUITNOW_DATA.isRecurringTransfer ==> ",
            ModelClass.DUITNOW_DATA.isRecurringTransfer
        );
        console.log(
            " ModelClass.SECURE2U_DATA.isSecure2uEnable ==> ",
            ModelClass.SECURE2U_DATA.isSecure2uEnable
        );
        console.log(
            " ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE ==> ",
            ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE
        );
        console.log(
            " ModelClass.SECURE2U_DATA.USE_SECURE2U ==> ",
            ModelClass.SECURE2U_DATA.USE_SECURE2U
        );
    };

    // **
    // TODO: need to isolate
    // public
    _onClosePress() {
        if (ModelClass.COMMON_DATA.transferFlow === 14) {
            ModelClass.fitnessDashboardScreen = 1;
            ModelClass.fitnessDashboardChange = true;
            NavigationService.resetAndNavigateToModule("fitnessModule", "FitnessDashboard");
        } else {
            NavigationService.resetAndNavigateToModule(
                this.getModuleName(ModelClass.COMMON_DATA.transferFlow),
                this.getRouteName(ModelClass.COMMON_DATA.transferFlow)
            );
        }
    }

    // TODO: need to isolate
    // public
    _secure2uRegCountHandler = () => {
        try {
            ModelClass.TRANSFER_DATA.secure2uProcessFailed = false;
            ModelClass.TRANSFER_DATA.transactionResponseError = "";
            if (ModelClass.COMMON_DATA.transferFlow === 2) {
                if (ModelClass.TRANSFER_DATA.validationBit == "1") {
                    // CustomFlashMessage.showContentSaveMessageLong(
                    //     Strings.FIRST_TIME_FAVOURITES,
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     3000,
                    //     "#4cd863"
                    // );
                }
            }

            // if (
            // 	ModelClass.SECURE2U_DATA.isSecure2uEnable &&
            // 	!ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE
            // )
            if (
                !ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE &&
                ModelClass.COMMON_DATA.transferFlow != 12 &&
                ModelClass.DUITNOW_DATA.transferFav == false &&
                ModelClass.COMMON_DATA.transferFlow != 13 &&
                ModelClass.COMMON_DATA.transferFlow != 16 &&
                ModelClass.COMMON_DATA.transferFlow != 1 &&
                ModelClass.COMMON_DATA.transferFlow != 2
            ) {
                // CustomFlashMessage.showContentSaveMessageLong(
                //     "",
                //     Strings.SECURE2U_IS_DOWN,
                //     "bottom",
                //     "info",
                //     3000,
                //     "#4cd863"
                // );
            }
        } catch (e) {
            console.log(" catch  ", e);
        }
    };
    //--------------
    // private
    getAllMonths = () => {
        var tempArray = [
            {
                Name: DataModel.getCurrentMonthName(),
                month: DataModel.getmonthNumber(DataModel.getCurrentMonthName()),
                Day: "1",
            },
            {
                Name: DataModel.getmonthNameFromNumber(
                    DataModel.getNextMonthNumber(DataModel.getNextMonths(1))
                ),
                month: DataModel.getNextMonthNumber(DataModel.getNextMonths(1)),
                Day: "1",
            },
        ];
        return tempArray;
    };

    // private
    addDataToArray = async () => {
        console.log("addDataToArray callimh", this.state.seletedDate);
        var lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        console.log(
            "Differnce is",
            DataModel.getDifferenceBetweenTwoDates(
                DataModel.getDayDateFormat(new Date()),
                DataModel.getDayDateFormat(lastDayOfMonth)
            )
        );
        if (
            DataModel.getDifferenceBetweenTwoDates(
                DataModel.getDayDateFormat(new Date()),
                DataModel.getDayDateFormat(lastDayOfMonth)
            ) > 28
        ) {
            console.log("grater Than  28", DataModel.getCurrentMonthName());
            var tempArray = [
                {
                    Name: DataModel.getCurrentMonthName(),
                    month: DataModel.getmonthNumber(DataModel.getCurrentMonthName()),
                    Day: "1",
                },
            ];
            await this.setState({
                monthsArray: tempArray,
                yearsArray: DataModel.getNextYearsData(new Date().getFullYear(), 1),
            });
        } else {
            console.log("lesser Than ", DataModel.getCurrentMonthName());
            // eslint-disable-next-line no-redeclare
            var tempArray = [
                {
                    Name: DataModel.getCurrentMonthName(),
                    month: DataModel.getmonthNumber(DataModel.getCurrentMonthName()),
                    Day: "1",
                },
                {
                    Name: DataModel.getmonthNameFromNumber(
                        DataModel.getNextMonthNumber(DataModel.getNextMonths(1))
                    ),
                    month: DataModel.getNextMonthNumber(DataModel.getNextMonths(1)),
                    Day: "1",
                },
            ];
            if (DataModel.getCurrentMonthName() == "December") {
                await this.setState({
                    monthsArray: tempArray,
                    yearsArray: DataModel.getNextYearsData(new Date().getFullYear(), 2),
                    validSchdule: true,
                });
            } else {
                await this.setState({
                    monthsArray: tempArray,
                    yearsArray: DataModel.getNextYearsData(new Date().getFullYear(), 1),
                });
            }
        }
        console.log(" Selected Date is", this.state.seletedDate);
    };

    // private
    seletedMonth = async (month) => {
        var year;
        if (month.Name == "January") {
            year = this.state.seletedYear + 1;
        } else {
            year = this.state.seletedYear;
        }
        var date = year + "/" + month.month + "/" + month.Day;
        console.log("Date is", date);
        await this.setState(
            {
                dropDownmonthView: false,
                month: month.Name,
                seletedDate: date,
                seletedYear: year,
            },
            () => {
                console.log(" Selected Date is", this.state.seletedDate);
                // do something after the stars are rendered
            }
        );
        // console.log(" Selected Date is", this.state.seletedDate);
    };

    // private
    seletedYear = (year) => {
        var montObj;
        var monthName;
        var lastItem = this.state.yearsArray[this.state.yearsArray.length - 1];
        console.log("array first Index", this.state.monthsArray[0]);
        if (this.state.validSchdule) {
            console.log("array first Index", this.state.monthsArray[0]);

            if (lastItem.year == year.year) {
                montObj = this.state.monthsArray[1].month;
                monthName = this.state.monthsArray[1].Name;
            } else {
                montObj = this.state.monthsArray[0].month;
                monthName = this.state.monthsArray[0].Name;
            }
        } else {
            montObj = DataModel.getmonthNumber(this.state.month);
            monthName = this.state.month;
        }

        var date = year.year + "/" + montObj + "/" + "1";
        console.log(" year  date is", date);

        this.setState({
            dropDoenyearView: false,
            seletedYear: year.year,
            seletedDate: date,
            month: monthName,
        });
    };

    // private
    selectedDay(day) {
        console.log("converted", DataModel.getSendingFormatDate(day.dateString));
        console.log("converted  bbb", day.dateString);

        let d = new Date(),
            month = "" + (d.getMonth() + 1),
            days = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (days.length < 2) days = "0" + days;

        let todayInt = year + month + days;
        let selectDateInt = day.dateString.replace("-", "").replace("-", "");
        let effectiveDateFormated = "";

        console.log("converted  today year+month+days ", year + month + days);

        try {
            if (todayInt === selectDateInt) {
                ModelClass.TRANSFER_DATA.isFutureTransfer = false;
                ModelClass.TRANSFER_DATA.effectiveDate = "00000000";
                this.setState({ displayDate: "Today" });
                console.log("Selected Today ");
            } else {
                effectiveDateFormated = DataModel.getSendingFormatDate(day.dateString);
                ModelClass.TRANSFER_DATA.effectiveDate = selectDateInt;
                ModelClass.TRANSFER_DATA.effectiveDateFormated = effectiveDateFormated;
                ModelClass.TRANSFER_DATA.isFutureTransfer = true;
                this.setState({
                    displayDate: effectiveDateFormated,
                });
                this.setState({ dateSelected: ModelClass.TRANSFER_DATA.effectiveDate });
                console.log("Selected NOT Today ");
            }

            console.log("displayDate ", this.state.displayDate);
            console.log("EffectiveDate ", ModelClass.TRANSFER_DATA.effectiveDate);

            this.setState({ isDisplayCalender: false });
        } catch (e) {
            console.log("catch ", e);
        }

        this.setState({ isDisplayCalender: false });
    }

    // private
    editDateClicked = () => {
        console.log("Edit Button Clicked");
        this.setState({ isDisplayCalender: true });
    };

    // ----------------------
    // Other operations
    // ----------------------

    // ******
    // TODO: need to isolate
    // public
    getModuleName(transferFlow) {
        let returnVal = navigationConstant.WALLET_MODULE;
        switch (transferFlow) {
            case 11:
                returnVal = navigationConstant.RELOAD_MODULE;
                break;
            case 12:
                returnVal = navigationConstant.WALLET_MODULE;
                break;
            case 13:
                returnVal = navigationConstant.WALLET_MODULE;
                break;
            case 14:
                returnVal = navigationConstant.FITNESS_MODULE;
                break;
        }
        return returnVal;
    }

    // ******
    // TODO: need to isolate
    // public
    getRouteName(transferFlow) {
        let returnVal = navigationConstant.WALLET_TAB_SCREEN;
        switch (transferFlow) {
            case 11:
                returnVal = navigationConstant.RELOAD_SELECT_TELCO;
                break;
            case 12:
                returnVal = navigationConstant.WALLET_VIEW_ACCOUNT;
                break;
            case 13:
                returnVal = navigationConstant.WALLET_VIEW_ACCOUNT;
                break;
            case 14:
                returnVal = navigationConstant.PLAN_CONFIRMATION;
        }
        return returnVal;
    }

    // ******
    // TODO: need to isolate
    // public
    getRecipientName = () => {
        if (ModelClass.COMMON_DATA.transferFlow == 17) {
            return ModelClass.TRANSFER_DATA.recipientName;
        } else {
            return ModelClass.TRANSFER_DATA.accountName;
        }
    };

    // private
    toggleDueDate(val) {
        this.setState({ isDueDate: !val });
    }

    // private
    toggleAllowDebit(val) {
        this.setState({ allowDebit: !val });
    }

    // private
    formatNumber(val) {
        let first = val.substring(0, 3);
        let second = val.substring(3, val.length).replace(/\d{4}(?=.)/g, "$& ");
        return first + " " + second;
    }

    // private
    _updateDataInScreenAlways = async () => {
        // TODO: create function secure2uRegCount
        try {
            ModelClass.SECURE2U_DATA.isSecure2uEnable = await AsyncStorage.getItem(
                "isSecure2uEnable"
            );
            console.log("isSecure2uEnable ==> " + ModelClass.SECURE2U_DATA.isSecure2uEnable);

            let params = {};
            let subUrl = "/secure2u/regCount";
            params = JSON.stringify({
                app_id: Strings.APP_ID,
            });

            let regCount = "";

            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    regCountAPI(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(" secure2u/regCount RESPONSE RECEIVED: ", response.data);
                            if (
                                responseObject.text == "success" ||
                                responseObject.status == "M000" ||
                                responseObject.status == "000"
                            ) {
                                ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE =
                                    ModelClass.SECURE2U_DATA.USE_SECURE2U;
                                regCount = responseObject.payload[0];
                                ModelClass.SECURE2U_DATA.regCount = regCount;
                                ModelClass.SECURE2U_DATA.device_name = regCount.device_name;
                                ModelClass.SECURE2U_DATA.device_status = regCount.device_status;
                                ModelClass.SECURE2U_DATA.hardware_id = regCount.hardware_id;
                                ModelClass.SECURE2U_DATA.mdip_id = regCount.mdip_id;
                                ModelClass.SECURE2U_DATA.registration_attempts =
                                    regCount.registration_attempts;
                                ModelClass.SECURE2U_DATA.updateGCM = regCount.updateGCM;
                                ModelClass.SECURE2U_DATA.updateMutliOTP = regCount.updateMutliOTP;
                                ModelClass.SECURE2U_DATA.updatePublicKey = regCount.updatePublicKey;

                                console.log(
                                    "\n regCount: ",
                                    JSON.stringify(regCount) +
                                        "\n device_name " +
                                        ModelClass.SECURE2U_DATA.device_name +
                                        "\n device_status " +
                                        ModelClass.SECURE2U_DATA.device_status +
                                        "\n hardware_id " +
                                        ModelClass.SECURE2U_DATA.hardware_id +
                                        "\n mdip_id " +
                                        ModelClass.SECURE2U_DATA.mdip_id +
                                        "\n registration_attempts " +
                                        ModelClass.SECURE2U_DATA.registration_attempts +
                                        "\n updateGCM " +
                                        ModelClass.SECURE2U_DATA.updateGCM +
                                        "\n updateMutliOTP " +
                                        ModelClass.SECURE2U_DATA.updateMutliOTP +
                                        "\n updatePublicKey " +
                                        ModelClass.SECURE2U_DATA.updatePublicKey
                                );
                            } else {
                                ModelClass.SECURE2U_DATA.regCount = null;
                                ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE = false;
                            }
                            console.log(
                                " SECURE2U_SERVICE_ENABLE: ",
                                ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE
                            );
                        })
                        .catch((error) => {
                            console.log("secure2u/regCount ERROR: ", error);
                        });
                }
            });
        } catch (e) {
            console.log("secure2u/regCount ERROR: ", e);
        }

        // TODO: create ****** function secure2uRegCountHandler
        this._secure2uRegCountHandler();
    };

    // ******
    // Private
    _setUserDetails = async () => {
        let m2uUserName = null;
        console.log(" component didmount calling", this.state.seletedDate);
        this.addDataToArray();
        try {
            m2uUserName = await AsyncStorage.getItem("m2uUserName");
            ModelClass.TRANSFER_DATA.m2uUserName = m2uUserName;
            let m2uUserId = await AsyncStorage.getItem("m2uUserId");
            this.setState({
                userName: m2uUserName,
                m2uUserId: m2uUserId,
                m2uUserName: m2uUserName,
            });
        } catch (e) {
            console.log("catch ==> ", e);
        }
    };

    // ******
    // private
    _setSelectFromAccount = () => {
        try {
            //Remove To Account From Account List  //Set Selected Account in Account List

            console.log(" userAccountList ==> ", ModelClass.TRANSFER_DATA.userAccountList);
            console.log("fromAccount ==> " + ModelClass.TRANSFER_DATA.fromAccount);
            // this.state.accounts = ModelClass.TRANSFER_DATA.userAccountList;
            let tempArray = ModelClass.TRANSFER_DATA.userAccountList;
            let tempAccount = "";
            let selectedAccountObj = "";
            let nonSelectedAccounts = [];
            let targetSelectedAccounts = [];
            let toAccount = "";
            let fromAccount = "";

            //if No Primary Account Select primary account as from account
            ModelClass.TRANSFER_DATA.fromAccount =
                ModelClass.TRANSFER_DATA.fromAccount === undefined ||
                ModelClass.TRANSFER_DATA.fromAccount === null ||
                ModelClass.TRANSFER_DATA.fromAccount === ""
                    ? ModelClass.TRANSFER_DATA.primaryAccount
                    : ModelClass.TRANSFER_DATA.fromAccount;

            toAccount = ModelClass.TRANSFER_DATA.toAccount;
            fromAccount = ModelClass.TRANSFER_DATA.fromAccount;

            console.log("fromAccount ==> " + ModelClass.TRANSFER_DATA.fromAccount);
            console.log("toAccount ==> " + ModelClass.TRANSFER_DATA.toAccount);
            console.log("primaryAccount ==> " + ModelClass.TRANSFER_DATA.primaryAccount);
            for (let j = 0; j < tempArray.length; j++) {
                console.log("acctNo ==> " + tempArray[j].acctNo);

                //Remove To  From Account in List

                tempAccount = tempArray[j].acctNo;

                if (
                    toAccount === undefined ||
                    toAccount === null ||
                    toAccount === "" ||
                    (toAccount != undefined &&
                        toAccount != "undefined" &&
                        toAccount.substring(0, 12) != tempAccount.substring(0, 12))
                ) {
                    console.log("acctNo view ==> " + j + 1);
                    if (
                        tempAccount != undefined &&
                        fromAccount != undefined &&
                        fromAccount.substring(0, 12) === tempAccount.substring(0, 12)
                    ) {
                        console.log(j + 1 + " Account ==> ", tempArray[j].acctNo);
                        tempArray[j].selected = true;
                        selectedAccountObj = tempArray[j];
                        console.log("selectedAccount Obj ==> ", tempArray[j]);
                        ModelClass.TRANSFER_DATA.fromAccount = tempArray[j].acctNo;
                        ModelClass.TRANSFER_DATA.fromAccountCode = tempArray[j].acctCode;
                        ModelClass.TRANSFER_DATA.fromAccountName = tempArray[j].acctName;
                        ModelClass.TRANSFER_DATA.formatedFromAccount = Utility.formateAccountNumber(
                            tempArray[j].acctNo,
                            ModelClass.COMMON_DATA.maybankAccountLength
                        );

                        console.log("selectedAccount ==> " + ModelClass.TRANSFER_DATA.fromAccount);
                        console.log(
                            "selected fromAccountCode ==> " +
                                ModelClass.TRANSFER_DATA.fromAccountCode
                        );
                        console.log(
                            "selected fromAccountName ==> " +
                                ModelClass.TRANSFER_DATA.fromAccountName
                        );
                    } else {
                        tempArray[j].selected = false;
                        nonSelectedAccounts.push(tempArray[j]);
                        console.log(j + 1 + " Account ==> ", tempArray[j].acctNo);
                    }
                }
            }

            //Set Selected Account in Account List add it First to Account list
            if (selectedAccountObj != null && selectedAccountObj != "") {
                targetSelectedAccounts.push(selectedAccountObj);
            }
            console.log(" Account selectedAccountObj ==> ", selectedAccountObj);
            console.log(" Account nonSelectedAccounts==> ", nonSelectedAccounts);
            targetSelectedAccounts.push(...nonSelectedAccounts);

            console.log(" Account 1 targetSelectedAccounts ==> ", nonSelectedAccounts);
            if (targetSelectedAccounts.length < 1) {
                targetSelectedAccounts.push(...ModelClass.TRANSFER_DATA.userAccountList);
                console.log(
                    "No selected Accounts targetSelectedAccounts ==> ",
                    targetSelectedAccounts
                );
            }
            console.log(" Account 2 targetSelectedAccounts ==> ", targetSelectedAccounts);
            this.setState({ accounts: targetSelectedAccounts });
        } catch (e) {
            console.log("catch ==> ", e);
        }
    };

    // ----------------------
    // UI RENDER
    // ----------------------
    // **
    render() {
        console.log("ModelClass.COMMON_DATA.transferFlow :", ModelClass.COMMON_DATA.transferFlow);
        return (
            <View
                style={[
                    this.state.dropDownmonthView || this.state.dropDoenyearView
                        ? Styles.blurContainer
                        : Styles.containerWhiteLight,
                ]}
            >
                <HeaderPageIndicator
                    showBack={true}
                    showClose={true}
                    showShare={false}
                    showIndicator={false}
                    showTitle={false}
                    noClose={true}
                    onClosePress={() => this._onClosePress()}
                    showTitleCenter={false}
                    showBackIndicator={true}
                    pageTitle={""}
                    numberOfPages={0}
                    currentPage={0}
                    noPop={
                        ModelClass.COMMON_DATA.transferFlow === 11 ||
                        ModelClass.COMMON_DATA.transferFlow === 12 ||
                        ModelClass.COMMON_DATA.transferFlow === 13 ||
                        ModelClass.COMMON_DATA.transferFlow === 14 ||
                        ModelClass.COMMON_DATA.transferFlow === 17
                    }
                    onBackPress={() => {
                        console.log("onBackPress", ModelClass.COMMON_DATA.transferFlow);
                        if (ModelClass.COMMON_DATA.transferFlow === 13) {
                            NavigationService.navigateToModule(
                                navigationConstant.PAYCARDS_MODULE,
                                ModelClass.TRANSFER_DATA.payCardsAmountType == 4
                                    ? navigationConstant.PAYCARDS_ENTER_AMOUNT
                                    : navigationConstant.PAYCARDS_SELECT_AMOUNT
                            );
                        } else if (ModelClass.COMMON_DATA.transferFlow === 12) {
                            console.log("ReloadEnterNumberScreen");
                            NavigationService.navigateToModule(
                                navigationConstant.DUITNOW_MODULE,
                                navigationConstant.DUITNOW_ENTER_REFERENCE
                            );
                        } else if (ModelClass.COMMON_DATA.transferFlow === 11) {
                            console.log("ReloadEnterNumberScreen");
                            this.props.navigation.pop();
                        } else if (ModelClass.COMMON_DATA.transferFlow === 14) {
                            console.log("partner application");
                            NavigationService.navigateToModule(
                                navigationConstant.FITNESS_MODULE,
                                navigationConstant.PLAN_CONFIRMATION
                            );
                        } else if (ModelClass.COMMON_DATA.transferFlow === 17) {
                            console.log("partner application");
                            NavigationService.navigateToModule(
                                navigationConstant.PAYBILLS_MODULE,
                                navigationConstant.PAYBILLS_ENTER_AMOUNT
                            );
                        }
                    }}
                    navigation={this.props.navigation}
                    // moduleName={this.getModuleName(ModelClass.COMMON_DATA.transferFlow)
                    //     // ModelClass.COMMON_DATA.transferFlow === 11
                    //     //     ? navigationConstant.RELOAD_MODULE
                    //     //     : navigationConstant.WALLET_MODULE
                    // }
                    // routeName={this.getRouteName(ModelClass.COMMON_DATA.transferFlow)
                    //     // ModelClass.COMMON_DATA.transferFlow === 11
                    //     //     ? navigationConstant.RELOAD_SELECT_TELCO
                    //     //     : navigationConstant.WALLET_TAB_SCREEN
                    // }
                    testID={"header"}
                    accessibilityLabel={"header"}
                />

                {/* SCROLLABLE AREA--------------------- */}
                <ScrollView>
                    {/* create method - getScrollAreaUI */}
                    <View style={Styles.block}>
                        {/* ====================================================================================== */}
                        <MyView hide={ModelClass.COMMON_DATA.transferFlow === 11}>
                            <View style={Styles.cardSmallContainerCenter}>
                                {ModelClass.COMMON_DATA.transferFlow === 1 ||
                                ModelClass.COMMON_DATA.transferFlow === 14 ||
                                ModelClass.COMMON_DATA.transferFlow === 13 ? (
                                    <ImageBackground
                                        style={[Styles.cardImageSmall]}
                                        source={
                                            ModelClass.COMMON_DATA.transferFlow === 13
                                                ? require("@assets/icons/ic_maybank_visa_small.png")
                                                : require("@assets/icons/ic_maybank_casa_small.png")
                                        }
                                    />
                                ) : ModelClass.COMMON_DATA.transferFlow === 15 ||
                                  ModelClass.COMMON_DATA.transferFlow === 16 ? (
                                    <CircularDefaultButtonText
                                        source={ModelClass.SEND_MONEY_DATA.userImage}
                                        onPress={() => {}}
                                        defaultImage={require("@assets/icons/yellowMoney.png")}
                                        showText={ModelClass.SEND_MONEY_DATA.userImage.length < 1}
                                        text={Utility.getShortName(
                                            ModelClass.SEND_MONEY_DATA.detailsUserName
                                        )}
                                    />
                                ) : (
                                    <CircularNameView
                                        isBig={false}
                                        text={Utility.getShortNameTransfer(
                                            ModelClass.COMMON_DATA.transferFlow === 1
                                                ? ModelClass.TRANSFER_DATA.accountName
                                                : ModelClass.TRANSFER_DATA.recipientName
                                        )}
                                    />
                                )}
                            </View>
                            {ModelClass.COMMON_DATA.transferFlow === 13 ? (
                                <View>
                                    <View style={Styles.titleContainerCenter1}>
                                        <Text
                                            style={[
                                                Styles.titleTextConfirmation,
                                                commonStyles.font,
                                            ]}
                                        >
                                            {Utility.maskAccount(
                                                ModelClass.VIEW_CARD_DATA.description
                                            )}
                                        </Text>
                                    </View>

                                    <View style={Styles.descriptionContainerCenter}>
                                        <Text style={[Styles.titleTextName, commonStyles.font]}>
                                            {ModelClass.TRANSFER_DATA.payCardsName}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={Styles.titleContainerCenter1}>
                                        <Text
                                            style={[
                                                Styles.titleTextConfirmation,
                                                commonStyles.font,
                                            ]}
                                        >
                                            {ModelClass.COMMON_DATA.transferFlow != 1 &&
                                            ModelClass.COMMON_DATA.transferFlow != 12 &&
                                            ModelClass.COMMON_DATA.transferFlow !== 14 &&
                                            ModelClass.COMMON_DATA.transferFlow != 15 &&
                                            ModelClass.COMMON_DATA.transferFlow != 16 &&
                                            ModelClass.COMMON_DATA.transferFlow != 17
                                                ? ModelClass.TRANSFER_DATA.toAccountBank + " - "
                                                : ""}
                                            {ModelClass.TRANSFER_DATA.formatedToAccount}
                                        </Text>
                                    </View>

                                    <View style={Styles.descriptionContainerCenter}>
                                        <Text style={[Styles.titleTextName, commonStyles.font]}>
                                            {this.getRecipientName()}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {ModelClass.COMMON_DATA.transferFlow === 13 ? (
                                <View style={Styles.referenceViewCenter1}>
                                    <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                        {ModelClass.TRANSFER_DATA.payCardsAmountTypeStr}
                                    </Text>
                                </View>
                            ) : (
                                <View />
                            )}

                            <View style={Styles.amountCenter}>
                                <TouchableOpacity
                                    style={Styles.editIconViewTransfer}
                                    onPress={() => this.onEditAmount()}
                                    testID={"btnEditAmount"}
                                    accessibilityLabel={"btnEditAmount"}
                                >
                                    <Text
                                        style={[
                                            ModelClass.COMMON_DATA.transferFlow === 15 &&
                                            !ModelClass.SEND_MONEY_DATA.isSendMoneyAsOpen
                                                ? Styles.amountTextBlack
                                                : Styles.amountTextBlue,
                                            commonStyles.font,
                                        ]}
                                    >
                                        {ModelClass.COMMON_DATA.transferFlow === 14
                                            ? Strings.CURRENCY +
                                              Utility.commaAdder(
                                                  ModelClass.PARTNER_APPLICATION.totalPrice.toFixed(
                                                      2
                                                  )
                                              )
                                            : ModelClass.COMMON_DATA.transferFlow === 15
                                            ? ModelClass.TRANSFER_DATA.formatedTransferAmount
                                                  .toString()
                                                  .indexOf(Strings.CURRENCY) === -1
                                                ? Strings.CURRENCY +
                                                  ModelClass.TRANSFER_DATA.formatedTransferAmount
                                                : ModelClass.TRANSFER_DATA.formatedTransferAmount
                                            : Strings.CURRENCY_CODE +
                                              " " +
                                              ModelClass.TRANSFER_DATA.formatedTransferAmount}
                                    </Text>
                                </TouchableOpacity>

                                {ModelClass.COMMON_DATA.transferFlow === 11 ||
                                (ModelClass.COMMON_DATA.transferFlow === 15 &&
                                    !ModelClass.SEND_MONEY_DATA.isSendMoneyAsOpen) ||
                                (ModelClass.COMMON_DATA.transferFlow === 13 &&
                                    ModelClass.TRANSFER_DATA.payCardsAmountType != 4) ||
                                ModelClass.COMMON_DATA.transferFlow === 14 ? (
                                    <View />
                                ) : (
                                    <TouchableOpacity
                                        style={Styles.editIconViewTransfer}
                                        onPress={() => this.onEditAmount()}
                                        testID={"btnEditAmount"}
                                        accessibilityLabel={"btnEditAmount"}
                                    >
                                        <Image
                                            style={Styles.editIcon}
                                            source={require("@assets/icons/ic_edit_black.png")}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <MyView
                                hide={
                                    ModelClass.COMMON_DATA.transferFlow == 4 ||
                                    ModelClass.COMMON_DATA.transferFlow === 13 ||
                                    ModelClass.COMMON_DATA.transferFlow === 12 ||
                                    ModelClass.COMMON_DATA.transferFlow === 14
                                }
                            >
                                <View style={Styles.dateView}>
                                    <View style={Styles.dateViewInnerBig}>
                                        <View style={commonStyles.roundButtonWithImage}>
                                            <DropDownButtonCenter
                                                headerText={this.state.displayDate}
                                                iconType={1}
                                                showIconType={
                                                    ModelClass.COMMON_DATA.transferFlow === 15 ||
                                                    ModelClass.COMMON_DATA.transferFlow === 16
                                                        ? false
                                                        : true
                                                }
                                                testID={"txtSELECT_date"}
                                                accessibilityLabel={"txtSELECT_date"}
                                                onPress={() => {
                                                    ModelClass.COMMON_DATA.transferFlow != 15 &&
                                                    ModelClass.COMMON_DATA.transferFlow != 16
                                                        ? ModelClass.COMMON_DATA.isSplitBillsFlow
                                                            ? this.setState({
                                                                  isDisplayCalender: false,
                                                              })
                                                            : ModelClass.COMMON_DATA.transferFlow ==
                                                              17
                                                            ? this.setState({
                                                                  showDuitNowDateOptionsView: true,
                                                                  isDisplayCalender: false,
                                                              })
                                                            : this.setState({
                                                                  isDisplayCalender: true,
                                                              })
                                                        : this.setState({
                                                              isDisplayCalender: false,
                                                          });
                                                }}

                                                // :
                                            />
                                        </View>
                                    </View>
                                </View>
                            </MyView>

                            {ModelClass.COMMON_DATA.transferFlow === 12 ? (
                                <View style={Styles.dateView}>
                                    <View style={Styles.dateViewInnerBig}>
                                        <View style={commonStyles.roundButtonWithImage}>
                                            <DropDownButtonCenter
                                                headerText={this.state.displayDate}
                                                iconType={1}
                                                testID={"txtSELECT_date"}
                                                accessibilityLabel={"txtSELECT_date"}
                                                onPress={() => {
                                                    this.setState({
                                                        showDuitNowDateOptionsView: true,
                                                    });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View />
                            )}

                            {ModelClass.COMMON_DATA.transferFlow === 13 ? (
                                <View style={Styles.dateView}>
                                    <View style={Styles.dateViewInnerBig}>
                                        <View style={commonStyles.roundButtonWithImage}>
                                            <DropDownButtonCenter
                                                headerText={this.state.displayDate}
                                                iconType={1}
                                                testID={"txtSELECT_date"}
                                                accessibilityLabel={"txtSELECT_date"}
                                                onPress={() => {
                                                    this.setState({ showDateOptionsView: true });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View />
                            )}

                            {this.state.showTransferDateView &&
                            ModelClass.COMMON_DATA.transferFlow === 12 &&
                            ModelClass.DUITNOW_DATA.isRecurringTransfer ? (
                                <View style={Styles.transferTypeViewCenter1}>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                            {Strings.TRANSFER_DATE}
                                        </Text>
                                    </View>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.titleText, commonStyles.font]}>
                                            {this.state.displayTransferDate}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View />
                            )}

                            <MyView hide={ModelClass.COMMON_DATA.transferFlow != 4}>
                                <View style={Styles.transferTypeViewCenter1}>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                            {Strings.TRANSFER_TYPE}
                                        </Text>
                                    </View>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.titleText, commonStyles.font]}>
                                            {ModelClass.TRANSFER_DATA.transactionType}
                                        </Text>
                                    </View>

                                    <View style={Styles.referenceModeViewCenter}>
                                        <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                            {Strings.TRANSFER_MODE}
                                        </Text>
                                    </View>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.titleText, commonStyles.font]}>
                                            {" "}
                                            {ModelClass.TRANSFER_DATA.transactionMode}
                                        </Text>
                                    </View>
                                    <View style={Styles.referenceViewCenter1}>
                                        <Text style={[Styles.serviceTaxText, commonStyles.font]}>
                                            {" "}
                                            {Strings.SERVICE_FEE + "0.00"}
                                        </Text>
                                    </View>
                                </View>
                            </MyView>

                            <MyView
                                hide={
                                    ModelClass.COMMON_DATA.transferFlow === 13 ||
                                    ModelClass.COMMON_DATA.transferFlow === 15 ||
                                    ModelClass.COMMON_DATA.transferFlow === 16 ||
                                    ModelClass.COMMON_DATA.transferFlow === 17
                                }
                            >
                                <View style={Styles.referenceViewCenter3}>
                                    <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                        {ModelClass.COMMON_DATA.transferFlow === 11
                                            ? Strings.BILL_NAME
                                            : Strings.RECIPIENT_REFERENCE}
                                    </Text>
                                </View>
                                <View style={Styles.referenceViewCenter1}>
                                    <Text style={[Styles.titleText, commonStyles.font]}>
                                        {ModelClass.COMMON_DATA.transferFlow === 14
                                            ? Strings.GYM_MEMBERSHIP
                                            : ModelClass.TRANSFER_DATA.recipientReference}
                                    </Text>
                                </View>
                            </MyView>

                            <MyView
                                hide={
                                    ModelClass.COMMON_DATA.transferFlow === 13 ||
                                    ModelClass.COMMON_DATA.transferFlow === 17
                                }
                            >
                                <MyView hide={ModelClass.COMMON_DATA.transferFlow === 11}>
                                    <View style={Styles.notesViewCenter1}>
                                        <Text style={[Styles.referenceLabel, commonStyles.font]}>
                                            {Strings.NOTES}
                                        </Text>
                                    </View>

                                    <View style={Styles.notesInputView}>
                                        <View style={Styles.notesViewCenter4}>
                                            <Input
                                                label=""
                                                style={[Styles.commonInput1, commonStyles.font]}
                                                testID={"inputReference"}
                                                accessibilityLabel={"inputReference"}
                                                secureTextEntry="false"
                                                maxLength={14}
                                                // minLength={2}
                                                placeholder={Strings.OPTIONAL1}
                                                autoFocus={false}
                                                onSubmitEditing={this.onTextDone}
                                                value={this.state.notesText}
                                                //ref={ref => (this.inputs["username"] = ref)}
                                                onChangeText={this.onTextChange.bind(this)}
                                            />
                                        </View>
                                    </View>
                                </MyView>
                            </MyView>
                        </MyView>

                        {/* ====================================================================================== */}
                        <MyView hide={ModelClass.COMMON_DATA.transferFlow != 11}>
                            <View
                                style={{
                                    alignContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <View
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 60,
                                        marginLeft: 7,
                                        marginTop: 8,
                                        backgroundColor: "#D8D8D8",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <ImageBackground
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 50,
                                            backgroundColor: "#D8D8D8",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            alignItems: "center",
                                        }}
                                        source={{
                                            uri: `data:image/gif;base64,${ModelClass.RELOAD_DATA.image}`,
                                        }}
                                        resizeMode="stretch"
                                    />
                                </View>

                                <View style={[Styles.referenceViewCenter1, { marginTop: 15 }]}>
                                    <Text style={[Styles.telcoNameText, commonStyles.font]}>
                                        {ModelClass.RELOAD_DATA.telcoName}
                                    </Text>
                                </View>
                                <View style={[Styles.referenceViewCenter1, { marginTop: 5 }]}>
                                    <Text style={[Styles.titleText, commonStyles.font]}>
                                        {this.formatNumber(ModelClass.RELOAD_DATA.selectedNumber)}
                                    </Text>
                                </View>

                                <View style={[Styles.referenceViewCenter1, { marginTop: 60 }]}>
                                    <Text style={[Styles.telcoNameText, commonStyles.font]}>
                                        Amount
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        justifyContent: "center",
                                        flexDirection: "row",
                                        marginTop: 10,
                                        marginLeft: 0,
                                        flex: 1.5,
                                    }}
                                >
                                    <View
                                        style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "row",
                                            width: 240,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: "100%",
                                            }}
                                        >
                                            <DropDownButtonCenter
                                                headerText={this.state.selectedAmount}
                                                iconType={1}
                                                qrScreen={false}
                                                isBig={false}
                                                showDescription={false}
                                                testID={"txtSELECT_RL"}
                                                accessibilityLabel={"txtSELECT_RZ"}
                                                onPress={() => {
                                                    this.setState({ amountView: true });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </MyView>

                        {/* ====================================================================================== */}
                        {ModelClass.COMMON_DATA.transferFlow === 14 ? (
                            <View style={{ marginTop: (-50 * height) / 667 }}>
                                <Text style={[Styles.commonInput1, commonStyles.font]}>
                                    {moment(new Date()).format("DD MMMM, YYYY")}
                                </Text>
                                <View style={Styles.alerBillView}>
                                    <Text style={Styles.refLabelText}>
                                        {Strings.ALERT_BILL_DATE}
                                    </Text>
                                    <View style={Styles.toggleView}>
                                        <SwitchToggle
                                            switchOn={this.state.isDueDate}
                                            duration={200}
                                            onPress={() => this.toggleDueDate(this.state.isDueDate)}
                                            containerStyle={{
                                                marginTop: 0,
                                                width: (40 * width) / 375,
                                                height: (22 * height) / 667,
                                                borderRadius: (11 * height) / 667,
                                                backgroundColor: "#cccccc",
                                                padding: 1,
                                            }}
                                            circleStyle={{
                                                width: (20 * height) / 667,
                                                height: (20 * height) / 667,
                                                borderRadius: (10 * height) / 667,
                                                backgroundColor: "#ffffff",
                                            }}
                                            backgroundColorOn="#67CC89"
                                            backgroundColorOff="#cccccc"
                                            circleColorOff="#ffffff"
                                            circleColorOn="#ffffff"
                                            type={0}
                                        />
                                    </View>
                                </View>

                                <View style={Styles.alerBillView}>
                                    <Text style={Styles.refLabelText}>
                                        {Strings.ALLOW_DIRECT_DEBIT}
                                    </Text>
                                    <TouchableOpacity
                                        style={Styles.infoImage}
                                        onPress={() => this.setState({ showInfo: true })}
                                    >
                                        <Image
                                            source={require("@assets/Fitness/info_black.png")}
                                            style={Styles.infoImage}
                                        />
                                    </TouchableOpacity>
                                    <View style={Styles.toggleView1}>
                                        <SwitchToggle
                                            switchOn={this.state.allowDebit}
                                            duration={200}
                                            onPress={() =>
                                                this.toggleAllowDebit(this.state.allowDebit)
                                            }
                                            containerStyle={{
                                                marginTop: 0,
                                                width: (40 * width) / 375,
                                                height: (22 * height) / 667,
                                                borderRadius: (11 * height) / 667,
                                                backgroundColor: "#cccccc",
                                                padding: 1,
                                            }}
                                            circleStyle={{
                                                width: (20 * height) / 667,
                                                height: (20 * height) / 667,
                                                borderRadius: (10 * height) / 667,
                                                backgroundColor: "#ffffff",
                                            }}
                                            backgroundColorOn="#67CC89"
                                            backgroundColorOff="#cccccc"
                                            circleColorOff="#ffffff"
                                            circleColorOn="#ffffff"
                                            type={0}
                                        />
                                    </View>
                                </View>
                                {/* </View> */}
                            </View>
                        ) : (
                            <View />
                        )}
                    </View>
                </ScrollView>

                {/* ACCOUNT LIST --------------------- */}
                {ModelClass.COMMON_DATA.transferFlow === 16 ? (
                    <View />
                ) : (
                    <View style={Styles.bottomView}>
                        <View>
                            <FlatList
                                style={Styles.accountsFlatlist}
                                data={this.state.accounts}
                                extraData={this.state}
                                horizontal={true}
                                scrollToIndex={0}
                                showsHorizontalScrollIndicator={false}
                                showIndicator={false}
                                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                                //renderItem={({ item, index }) => renderItem(item)}
                                renderItem={({ item, index }) => (
                                    <AccountDetailList
                                        item={item}
                                        index={index}
                                        scrollToIndex={0}
                                        isSingle={this.state.accounts.length === 1}
                                        onPress={() => this.onAccountListClick(item)}
                                        // itemChange={(account) => {
                                        //   Alert.alert(account)
                                        //   //this.state.payAccount = account;
                                        // }}
                                    />
                                )}
                                testID={"accountsList"}
                                accessibilityLabel={"accountsList"}
                                // viewabilityConfig={{
                                //   itemVisiblePercentThreshold: 50
                                // }}
                                // onViewableItemsChanged={() =>this.onViewableItemsChanged }
                            />
                        </View>
                    </View>
                )}

                {/* CONFIRM BUTTON -------------------*/}
                <View style={Styles.confirmView1}>
                    <View style={Styles.buttonViewInner}>
                        <View style={commonStyles.roundButtonWithImage}>
                            <DropDownButtonNoIcon
                                headerText={
                                    ModelClass.COMMON_DATA.transferFlow === 16
                                        ? Strings.SEND_REQUEST
                                        : Strings.CONFIRM
                                }
                                iconType={1}
                                showIconType={false}
                                testID={"txtSELECT_BOOSTER"}
                                backgroundColor={"#ffde00"}
                                accessibilityLabel={"txtSELECT_BOOSTER"}
                                onPress={async () => {
                                    this.onConfirmClick();
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* CALENDAR DROPDOWN ?? ----------- */}
                <DropdownSelection
                    displayLoader={this.state.showDuitNowDateOptionsView}
                    data={DUIT_NOW_DATES}
                    keyName="Date"
                    qrScreen={false}
                    onItemPress={async (val) => {
                        console.log("Val1", val);
                    }}
                    onItemClick={async (val) => {
                        console.log("Val1", val);
                        ModelClass.DUITNOW_DATA.isRecurringTransfer = false;
                        let displayCalender = false;
                        let showTransferDateView = false;
                        if (val.id === 0) {
                            // today
                            ModelClass.TRANSFER_DATA.effectiveDate = "00000000";
                            ModelClass.DUITNOW_DATA.isFeutureransfer = false;
                        } else if (val.id === 1) {
                            //  shcedule
                            displayCalender = true;
                            ModelClass.DUITNOW_DATA.isFeutureransfer = true;
                        } else if (val.id === 2) {
                            // recurring
                            displayCalender = false;
                            showTransferDateView = true;
                            ModelClass.DUITNOW_DATA.isFeutureransfer = false;
                            ModelClass.DUITNOW_DATA.isRecurringTransfer = true;
                            ModelClass.SECURE2U_DATA.isSecure2uEnable = true;
                            NavigationService.navigate(navigationConstant.SELECT_START_DATE);
                        }

                        let displayDate = val.type;
                        this.setState({
                            showDuitNowDateOptionsView: false,
                            displayDate: displayDate,
                            isDisplayCalender: displayCalender,
                            showTransferDateView: showTransferDateView,
                        });
                    }}
                />

                <DropdownSelection
                    displayLoader={this.state.showDateOptionsView}
                    data={PAY_CARDS_DATES}
                    keyName="Date"
                    qrScreen={false}
                    onItemPress={async (val) => {
                        console.log("Val1", val);
                    }}
                    onItemClick={async (val) => {
                        console.log("Val1", val);
                        let isDisplayCalender = val.id == 1 ? true : false;
                        if (val.id === 0) {
                            ModelClass.TRANSFER_DATA.effectiveDate = "00000000";
                        }
                        //let displayDate = val.id == 1 ? ModelClass.TRANSFER_DATA.payCardsPaymentDueDate  : val.type
                        let displayDate = val.type;
                        this.setState({
                            showDateOptionsView: false,
                            displayDate: displayDate,
                            isDisplayCalender: isDisplayCalender,
                        });
                    }}
                />

                <DropdownSelection
                    displayLoader={this.state.amountView}
                    data={ModelClass.RELOAD_DATA.amounts}
                    keyName="account"
                    qrScreen={false}
                    onItemPress={async (val) => {
                        console.log("Val1", val);
                    }}
                    onItemClick={async (val, index) => {
                        console.log("Val2", val);
                        for (let item in ModelClass.RELOAD_DATA.amounts) {
                            ModelClass.RELOAD_DATA.amounts[item].selected = false;
                        }
                        ModelClass.RELOAD_DATA.amounts[index].selected = true;
                        this.setState({
                            amountView: false,
                            selectedAmount: val.type,
                            selectedAmountValue: parseFloat(val.amount),
                        });
                    }}
                />
                {/* ERROR MSG----------- */}
                {this.state.isDisplayCalender === true ? this.renderCalender() : null}
                {this.state.notesError ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ notesError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={Strings.NOTES_ERROR}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ notesError: false });
                        }}
                    />
                ) : (
                    <View />
                )}
                {this.state.amountZeroError ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ amountZeroError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={Strings.FROM_ACCOUNT_BALANCE_ERROR}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ amountZeroError: false });
                        }}
                    />
                ) : (
                    <View />
                )}

                {this.state.fromAccountError ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ fromAccountError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={Strings.PLEASE_SELECT_FROM_ACCOUNT}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ fromAccountError: false });
                        }}
                    />
                ) : (
                    <View />
                )}

                {this.state.error === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={
                            ModelClass.TRANSFER_DATA.transactionResponseError == "" ||
                            ModelClass.TRANSFER_DATA.transactionResponseError === null ||
                            ModelClass.TRANSFER_DATA.transactionResponseError.length === 0 ||
                            ModelClass.TRANSFER_DATA.transactionResponseError === undefined
                                ? Strings.WE_FACING_SOME_ISSUE
                                : ModelClass.TRANSFER_DATA.transactionResponseError
                        }
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                ) : null}

                {this.state.reloadError === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ reloadError: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={this.state.reloadErrorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ reloadError: false });
                        }}
                    />
                ) : null}
                {this.state.showInfo ? (
                    <ErrorMessage
                        showDefault={true}
                        isError={false}
                        onClose={() => this.setState({ showInfo: false })}
                        title={Strings.DIRECT_DEBIT}
                        description={Strings.DIRECT_DEBIT_ALERT_MSG}
                    />
                ) : null}

                <FlashMessage />
            </View>
        );
    }

    // ****
    // private
    renderCalender() {
        return (
            <View style={commonStyles.calender}>
                <View style={commonStyles.dropDownsView}>
                    <View style={commonStyles.dropdownViewone}>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ dropDownmonthView: true });
                            }}
                            style={commonStyles.touchableView}
                        >
                            <View>
                                <Text
                                    style={commonStyles.dropdownoneLabel}
                                    accessibilityLabel={"dropDownLabel"}
                                    testID={"dropDownLabel"}
                                >
                                    {this.state.month}
                                </Text>

                                <ImageView
                                    url={require("@assets/icons/dropDownIcon.png")}
                                    ImageStyle={commonStyles.dropdownoneicon}
                                    accessibilityLabel={"dropDownImage"}
                                    testID={"dropDownImage"}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={commonStyles.dropdownViewTwo}>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ dropDoenyearView: true });
                            }}
                            style={commonStyles.touchableView}
                        >
                            <View>
                                <Text
                                    style={commonStyles.dropdownoneLabel}
                                    accessibilityLabel={"dropDownLabel"}
                                    testID={"dropDownLabel"}
                                >
                                    {this.state.seletedYear}
                                </Text>

                                <ImageView
                                    url={require("@assets/icons/dropDownIcon.png")}
                                    ImageStyle={commonStyles.dropdownoneicon}
                                    accessibilityLabel={"dropDownImage"}
                                    testID={"dropDownImage"}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <CustomCalender
                    minDate={this.state.minimumDATE}
                    currentDate={this.state.seletedDate}
                    calenDerType={"DropdownCalender"}
                    monthView={true}
                    calenderStylebool={false}
                    maxDate={this.state.maxDate}
                    onDonePress={(val) => {
                        this.selectedDay(val);
                    }}
                />
                <Dropdown
                    displayLoader={this.state.dropDownmonthView}
                    data={this.state.monthsArray}
                    keyName="Name"
                    onDonePress={(val) => {
                        this.seletedMonth(val);
                    }}
                />

                <Dropdown
                    displayLoader={this.state.dropDoenyearView}
                    data={this.state.yearsArray}
                    keyName="year"
                    onDonePress={(val) => {
                        this.seletedYear(val);
                    }}
                />
            </View>
        );
    }
}
export default TransferConfirmationScreen;

/*
react life cycle
----------------
constructor
componentDidMount
componentWillUnmount
render


extra private method - event **
----------------------------------
TODO: secure2uRegCount

extra public method - event **
----------------------------------
_onClosePress
_onAccountListClick
_onTextChange
_onEditAmount
_onTextDone
_onAccountItemClick
_onAccountItemSwipeChange
_onConfirmClick

extra public method - UI ****
----------------------------------
renderCalender

extra public method - others ******
-----------------------------------
_setUserDetails
_setSelectFromAccount
getRecipientName
getRouteName
getModuleName
secure2uRegCountHandler

remove to individu screen - others ####
-----------------------------------
_interBankFundTransferSecure2u
_IBFTFundTransferSecure2u
_ibftFavoriteFundTransfer
_IBFTFundTransfer
_mobileReloadSecure2u
_payCards
_partnerPayment
_onSendRcvMoneySaveAPI
_thirdPartyFundTransferSecure2uAPI
_payBillSecure2u
*/

import HMSLocation from "@hmscore/react-native-hms-location";
import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Clipboard, Image } from "react-native";
import Geocoder from "react-native-geocoder";

import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";

import * as navigationConstant from "@navigation/navigationConstant";

import AccountDetailsLayout from "@layouts/AccountDetailsLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Fade from "@components/Animations/Fade";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import CallUsNowModel from "@components/CallUsNowModel";
import ProductCardBigLoader from "@components/Cards/ProductCardBigLoader";
import { ContactBankDialog } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    pfmGetData,
    bankingGetDataMayaM2u,
    getVirtualCards,
    getDashboardWalletBalance,
    invokeL2,
    invokeL3,
    maeCustomerInfo,
} from "@services";
import { FAwalletDashboard } from "@services/analytics/analyticsWallet";

import { MEDIUM_GREY, WARNING_YELLOW, WHITE, DARK_YELLOW } from "@constants/colors";
import * as Strings from "@constants/strings";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as utility from "@utils/dataModel/utility";

import assets from "@assets";

import TopExpensesWidget from "../../components/Widgets/TopExpensesWidget";

/*
 * DO NOT REMOVE - BELOW INDICATORS USED TO DETERMINE ETB(different types) OR NTB
 *
 * applicantType values
 * 0,5,6,7,8 - ETB
 * 1,2,3,4   - NTB
 *
 *
 * m2uInd values
 * 0 - Loan/FD account only
 * 1 - Card only
 * 2 - Credit card with CASA OR CASA only
 * 3 - Credit card only
 */

class WalletMainDashboard extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };

    state = {
        showMenu: false,
        errorMessage: "",
        showContactBankModal: false,
        maeCardsSection: false,
        loaded: false,
        sslReady: this.props.getModel("ssl")?.sslReady,
        isShowCallUsNow: false,
    };

    componentDidMount() {
        const { navigation } = this.props;

        this.focusSubscription = navigation.addListener("focus", this.onScreenFocus);
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    onScreenFocus = () => {
        console.log("[WalletMainDashboard] >> [onScreenFocus]");

        this.invokeL2();
    };

    invokeL2 = async () => {
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");

        if (!isPostLogin) {
            try {
                await invokeL2(true);
                this._loadWallet();
            } catch (error) {
                this._onBackPress();
            }
        } else {
            this._loadWallet();
        }
    };

    _loadWallet = () => {
        console.log("[WalletMainDashboard] >> [_loadWallet]");

        // Reset state
        this.setState({
            showMenu: false,
            errorMessage: "",
            showContactBankModal: false,
            maeCardsSection: false,
            maeCardTitle: null,
            virtualCardData: null,
            virtualCardDetails: null,
            maybankAvailable: null,
            maeActivateStatus: null,
            type: null,
            data: null,
            refresh: null,
            maeData: null,
            topExpensesData: null,
            topExpensesLoaded: null,
            loaded: false,
        });

        // so we can update context
        // technically, the screen can use the value from this api instead.
        this.getPrimaryAccount();
        this._getShowBalanceStatus();
    };

    getPrimaryAccount = async () => {
        const { updateModel } = this.props;

        try {
            const response = await getDashboardWalletBalance();

            if (response && response.data) {
                const { result } = response.data;

                console.log("result...", result);

                if (result) {
                    updateModel({
                        wallet: {
                            primaryAccount: result,
                        },
                    });

                    const data = {
                        acctNo: result.number,
                        acctCode: result.code,
                        acctType: result.type,
                        acctName: result.name,
                        acctBalance: result.currentBalance,
                        currentBalance: result.currentBalance,
                        oneDayFloat: result.oneDayFloat,
                        twoDayFloat: result.twoDayFloat,
                        lateClearing: result.lateClearing,
                        primary: result.primary,
                        acctStatusCode: result.statusCode,
                        acctStatusValue: result.statusMessage,
                        rawBalance: result.value,
                        group: result.group,
                        jointAccount: result.jointAccount,
                    };

                    this.setState({ data, prevData: result }, this._setAccountType);
                }
            }
        } catch (error) {
            // If something went wrong, go back to dashboard
            this._onBackPress();
        }
    };

    _getShowBalanceStatus = async () => {
        const { getModel } = this.props;
        const { showBalanceDashboard } = getModel("wallet");
        console.log(
            "[WalletMainDashboard][_getShowBalanceStatus] showBalance is ",
            showBalanceDashboard
        );

        // we already have this value in context, if exists since its in the dashboard
        this._updateShowBalanceStatus(!!showBalanceDashboard);
    };

    _updateShowBalanceStatus = (showBalanceDashboard) => {
        const { updateModel } = this.props;

        //update context
        updateModel({
            wallet: {
                showBalanceDashboard,
            },
        });

        //update AsyncStorage
        AsyncStorage.setItem("showBalanceDashboard", `${showBalanceDashboard}`);
    };

    _setAccountType = () => {
        // Figure out account type and set it in the state
        const { data } = this.state;

        let detectedType = "";
        if (data.acctType === "S") {
            detectedType = "SAVINGS";
        } else if (data.acctType === "D") {
            if (data.group === "CCD" || data.group === "0YD") {
                detectedType = "MAE";
            } else {
                detectedType = "CURRENT";
            }
        } else {
            detectedType = "CC";
        }

        console.log(
            "[WalletMainDashboard][_setAccountType] 💥 Account type detected is ",
            detectedType
        );

        // Save type into state
        this.setState({ type: detectedType }, () => {
            // Check for any redirection info from props
            this._checkRedirect();

            if (detectedType == "MAE") {
                this._getLowAccuracyLoc();
                this._fetchMAECardDetails();
            } else {
                this.setState({ refresh: !this.state.refresh, loaded: true }, () => {
                    this._getTopExpenses();
                });
            }
        });
    };

    _checkRedirect = () => {
        const { route } = this.props;
        const screen = route.params?.screen;

        switch (screen) {
            // case "WALLET_PAYBILL":
            //     this.gotoPayBill();
            //     return;

            // case "WALLET_BUYRELOAD":
            //     this.props.navigation.navigate(navigationConstant.RELOAD_MODULE, {
            //         screen: navigationConstant.RELOAD_SELECT_TELCO,
            //         params: { routeFrom: "WALLET_DASHBOARD" },
            //     });
            //     return;

            // case "WALLET_TRANSFERDASHBOARD":
            //     this.props.navigation.navigate(navigationConstant.FUNDTRANSFER_MODULE, {
            //         screen: navigationConstant.TRANSFER_TAB_SCREEN,
            //         params: {
            //             data,
            //             acctNo,
            //             prevData,
            //             screenDate: { routeFrom: "WalletMainDashboard" },
            //         },
            //     });
            //     this._clearNavigationParam();
            //     return;

            case "WALLET_TRXHISTORY":
                this._onPressTxnHistory();
                this._clearNavigationParam();
                return;

            default:
                return;
        }
    };

    _clearNavigationParam = () => {
        this.props.navigation.setParams({
            screen: null,
        });
    };

    _getAccountDetails = async () => {
        const { data, countryCode, type } = this.state;

        if (countryCode && countryCode !== "MY") {
            const url = `/details/casa?acctNo=${data.acctNo}&acctCode=${data.acctCode}&countryCode=${countryCode}`;

            bankingGetDataMayaM2u(url, false)
                .then((response) => {
                    const data = response.data.casaDetail;
                    let maeData = null;

                    if (type == "MAE") {
                        maeData = response.data.maeCustomerInfo;
                    }

                    console.log(
                        "[WalletMainDashboard][_getAccountDetails] " + url + " ==> ",
                        response
                    );
                    if (data != null) {
                        console.log(data);
                        this.setState(
                            { data: data, refresh: !this.state.refresh, maeData, loaded: true },
                            () => {
                                this._getTopExpenses();
                            }
                        );
                    } else {
                        this.setState({ data: null, refresh: !this.state.refresh, loaded: true });
                        // this.props.navigation.goBack();
                        // TODO: Trigger empty state
                    }
                })
                .catch((Error) => {
                    console.log("[WalletMainDashboard][_getAccountDetails] ERROR: ", Error);
                    this.props.navigation.goBack();
                    // TODO: Trigger empty state
                });
        } else {
            this.setState({ refresh: !this.state.refresh, loaded: true }, () => {
                this._getTopExpenses();
            });
        }
    };

    _getTopExpenses = () => {
        const { data, refresh } = this.state;

        const month = moment().format("YYYYMM").toUpperCase();
        const startDate = month + "01";
        const endDate = moment().format("YYYYMMDD").toUpperCase();

        const url = `/pfm/creditCard/transaction/history?startDate=${startDate}&endDate=${endDate}&acctNos=${data.acctNo}`;

        pfmGetData(url, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/transaction/history ==> ");
                // console.log(result);
                if (result != null) {
                    console.log("[WalletMainDashboard][_getTopExpenses] Response: ", result);

                    this.setState({
                        topExpensesData: result,
                        topExpensesLoaded: true,
                        refresh: !refresh,
                    });
                } else {
                    this.setState({
                        topExpensesData: null,
                        refresh: !refresh,
                        topExpensesLoaded: true,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    topExpensesData: null,
                    refresh: !refresh,
                    topExpensesLoaded: true,
                });
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _fetchMAECardDetails = async () => {
        console.log("[WalletBankCardScreen] >> [fetchMAECardDetails]");

        const params = {
            applicantType: ModelClass.COMMON_DATA.applicant_type,
        };
        getVirtualCards(params)
            .then((response) => {
                console.log("[BankingL1Screen][_fetchMAECardDetails] >> Success", response);
                const virtualCardData = response.data.result;

                if (virtualCardData.statusCode == "000") {
                    const applicantType = ModelClass.COMMON_DATA.applicant_type;
                    const maeCardStatus = virtualCardData.debitInq.cardStatus;
                    const maeNextAction = virtualCardData.debitInq.cardNextAction;
                    let maeCardTitle = "";
                    // If either of status or next action is empty, do not show the card

                    if (utility.isEmpty(maeCardStatus) || utility.isEmpty(maeNextAction)) {
                        return;
                    } // Specific check for ETB users - Show card for ETB only after card application // if (applicantType != "1" && applicantType != "2" && applicantType != "3" && applicantType != "4") {

                    // Specific check for 0C01 customer Type

                    if (
                        !isNaN(applicantType) &&
                        (parseInt(applicantType) < 1 || parseInt(applicantType) > 4) &&
                        applicantType != "7"
                    ) {
                        if (maeCardStatus == "000" || maeCardStatus == "024") {
                            if (maeNextAction == "001") {
                                return;
                            }
                        } else {
                            return;
                        }
                    }

                    // Activate Status
                    let maeCardsSection = false;
                    let activateStatus = false;

                    if (
                        maeCardStatus == "000" &&
                        (maeNextAction == "002" || maeNextAction == "003")
                    ) {
                        maeCardsSection = true;
                        activateStatus = true;
                        maeCardTitle = "MAE Debit Card";
                    } else if (maeCardStatus == "024" || maeCardStatus == "000") {
                        maeCardsSection = true;
                        maeCardTitle = virtualCardData.cardTitle;
                    }

                    // Apply Status
                    // let applyStatus = false;
                    // if (maeCardStatus == "000" && maeNextAction == "001") {
                    // 	applyStatus = true;
                    // 	maeCardTitle = virtualCardData.cardTitle;
                    // }

                    const cardDetailsObj = {};
                    cardDetailsObj.id = 1;
                    cardDetailsObj.description = virtualCardData.cardNo;
                    cardDetailsObj.title = virtualCardData.cardTitle;
                    cardDetailsObj.value = "";
                    cardDetailsObj.primary = false;
                    cardDetailsObj.image = "";
                    cardDetailsObj.type = "V";
                    cardDetailsObj.name = " my v card";
                    cardDetailsObj.acctStatusCode = activateStatus === true ? "00" : "11"; //  Blur Card Status
                    cardDetailsObj.acctStatusValue = "0";
                    cardDetailsObj.acctCode = "0";
                    cardDetailsObj.status = activateStatus; // Card Status (Apply | Activate)
                    cardDetailsObj.maeApplyCardInd = virtualCardData.maeApplyCardInd;
                    cardDetailsObj.maeAccountNuber = virtualCardData.maeAcctNo;
                    cardDetailsObj.cardExpiry = virtualCardData.cardExpiry;
                    cardDetailsObj.cardNo = virtualCardData.cardNo;
                    cardDetailsObj.cardTitle = virtualCardData.cardTitle;

                    this.setState({
                        maeCardsSection,
                        maeCardTitle,
                        virtualCardDetails: cardDetailsObj,
                        maybankAvailable: "true",
                        virtualCardData,
                        maeActivateStatus: activateStatus,
                    });

                    console.log("[BankingL1Screen][_fetchMAECardDetails] >> State", this.state);
                }
            })
            .catch((error) => {
                console.log("[BankingL1Screen][_fetchMAECardDetails] >> Failure", error);
            });
    };

    _onBackPress = () => {
        const { route, navigation } = this.props;

        if (route?.params?.redirect) {
            navigation.navigate(route?.params?.redirect.screen, route?.params?.redirect.params);
        } else {
            navigation.goBack();
        }
    };

    _handleTopMenuItemPress = (param) => {
        const { getModel } = this.props;
        const { showBalanceDashboard } = getModel("wallet");

        this.setState({ showMenu: false });
        FAwalletDashboard.topMenuItemPress(param);

        switch (param) {
            case "copyAccNo":
                // Copy acc no. to clipboard
                this._writeToClipboard();
                break;
            case "hideBalance":
                // Toggle showing acc balance
                // if (showBalance == "true") {
                // set to opposite of current value
                this._updateShowBalanceStatus(!showBalanceDashboard);
                // } else {
                //     this._updateShowBalanceStatus("true");
                // }
                break;
            case "changeWallet":
                // Call api to set account as wallet
                this._changeWallet();
                break;
            case "contact":
                // Call api to set account as wallet
                this.setState({ showMenu: false });
                setTimeout(() => this.setState({ showContactBankModal: true }), 0);
                FAwalletDashboard.onModalPopUp();
                break;
        }
    };

    _toggleMenu = () => {
        FAwalletDashboard.menuTap();

        this.setState({ showMenu: !this.state.showMenu });
    };

    // Copy account number to clipboard
    _writeToClipboard = async () => {
        const { data } = this.state;
        await Clipboard.setString(utility.formateAccountNumber(data.acctNo, 12));
    };

    //Change wallet account
    _changeWallet = () => {
        this.props.navigation.navigate("Onboarding", {
            screen: "OnboardingM2uAccounts",
            params: {
                pageTitle: "Change Primary Account",
                pageSubtitle:
                    "This account will be your primary account for daily transactions and more.",
                proceedTitle: "Confirm",
                goBack: true,
                onGoBack: this._loadWallet,
                from: "WalletMainDashboard",
            },
        });
    };

    _getMaeCustInfoData = async () => {
        console.log("[WalletMainDashboard] >> [_getMaeCustInfoData]");
        // MAE Customer Info call
        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, false).catch((error) => {
            console.log("[WalletMainDashboard][maeCustomerInfo] >> Exception: ", error);
        });

        const maeCustomerInfoData = httpResp?.data?.result;

        console.log("[WalletMainDashboard][_getMaeCustInfoData] ", maeCustomerInfoData);
        if (!maeCustomerInfoData) {
            return null;
        }

        return maeCustomerInfoData;
    };

    _onAutoTopupTap = async () => {
        const { data } = this.state;
        // condition to check that the account is suspended or not
        if (data?.acctStatusCode !== "06") {
            console.log("[WalletMainDashboard] >> [onAutoTopupTap]");

            const { countryCode } = this.state;
            const maeData =
                countryCode === "MY" ? await this._getMaeCustInfoData() : this.state.maeData;

            if (maeData) {
                const maeCustomerInfo = maeData;
                // L3 call to invoke login page
                const httpRes = await invokeL3(true);
                const result = httpRes.data;
                const { code } = result;
                if (code !== 0) return;

                const navParams = {
                    fromModule: navigationConstant.TAB,
                    fromScreen: navigationConstant.MORE,
                    moreParams: {},
                };

                const res = await utility.autoTopupNavigate(maeCustomerInfo, navParams);

                if (res) {
                    const { screen, params } = res;
                    this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                        screen,
                        params,
                    });
                }
            } else {
                showErrorToast({ message: Strings.COMMON_ERROR_MSG });
            }
        }
    };

    gotoPayBill = () => {
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_LANDING_SCREEN,
            params: {
                data: this.state.data,
                fromModule: navigationConstant.TAB_NAVIGATOR,
                fromScreen: "more",
                onGoBack: this._loadWallet,
            },
        });
    };

    _onDismissCallNow = () => {
        this.setState({ showContactBankModal: false });
    };

    // Shortcut Grid
    _onPressGridItem = async (item) => {
        console.log(
            "[WalletMainDashboard][_onPressGridItem] 💥 Shortcut pressed with details: ",
            item
        );
        const { data, prevData } = this.state;
        const { isEnabled: qrEnabled } = this.props.getModel("qrPay");
        const { isEnabled: atmEnabled, isOnboarded } = this.props.getModel("atm");

        // Exposing account details here which might be required to start other flows
        // Note: 'number' is account number
        const { number, acctNo, acctStatusCode } = this.state.data;
        console.log("WalletMainDashboard _onPressGridItem ==> ", this.state.data);
        if (acctStatusCode !== "06") {
            //TODO: Other devs should place their own logic here to start their respective shortcut flows
            FAwalletDashboard.selectQuickAction(item.title, this.state.type);
            switch (item.title) {
                case "Transfer":
                    this.props.navigation.navigate(navigationConstant.FUNDTRANSFER_MODULE, {
                        screen: navigationConstant.TRANSFER_TAB_SCREEN,
                        params: {
                            data,
                            acctNo,
                            prevData,
                            screenDate: { routeFrom: "WalletMainDashboard" },
                        },
                    });

                    break;
                case "Pay Bills":
                    this.gotoPayBill();
                    break;
                case "Reload":
                    this.props.navigation.navigate(navigationConstant.RELOAD_MODULE, {
                        screen: navigationConstant.RELOAD_SELECT_TELCO,
                        params: { routeFrom: "WALLET_DASHBOARD" },
                    });
                    break;
                case "Pay Card":
                case "Pay Cards":
                    this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
                        screen: navigationConstant.PAYCARDS_ADD,
                        params: {
                            data: this.state.data,
                            fromModule: navigationConstant.TAB_NAVIGATOR,
                            fromScreen: "more",
                            onGoBack: this._loadWallet,
                        },
                    });
                    break;
                case "Split Bill":
                    this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                        screen: navigationConstant.SB_DASHBOARD,
                        params: { routeFrom: "WALLET_DASHBOARD", refId: null, activeTabIndex: 1 },
                    });
                    break;
                case "Send & Request":
                    this.props.navigation.navigate(navigationConstant.SEND_REQUEST_MONEY_STACK, {
                        screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                        params: {
                            data,
                            acctNo: number,
                            prevData,
                            screenDate: { routeFrom: "WalletMainDashboard" },
                        },
                    });
                    break;
                case "Auto\nBilling":
                    this.props.navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                        screen: navigationConstant.AUTOBILLING_DASHBOARD,
                        params: {
                            data,
                            acctNo: number,
                            prevData,
                            screenDate: { routeFrom: "WalletMainDashboard" },
                        },
                    });
                    break;
                case "Scan & Pay":
                    if (!qrEnabled) {
                        this.props.navigation.navigate("QrStack", {
                            screen: "QrStart",
                            params: { primary: false, settings: false, wallet: true, data },
                        });
                    } else {
                        this.props.navigation.navigate("QrStack", {
                            screen: "QrMain",
                            params: { primary: false, settings: false, wallet: true, data },
                        });
                    }
                    break;
                case "Movies & Leisure":
                    this.props.navigation.navigate(navigationConstant.TICKET_STACK, {
                        screen: navigationConstant.WETIX_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "Bus Tickets":
                    this.props.navigation.navigate(navigationConstant.TICKET_STACK, {
                        screen: navigationConstant.CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "Flight Tickets":
                    this.props.navigation.navigate(navigationConstant.TICKET_STACK, {
                        screen: navigationConstant.AIR_PAZ_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "ERL Tickets":
                    this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
                        screen: navigationConstant.KLIA_EKSPRESS_DASHBOARD,
                        params: {
                            data: this.state.data,
                            fromModule: navigationConstant.TAB_NAVIGATOR,
                            fromScreen: "more",
                            onGoBack: this._loadWallet,
                        },
                    });
                    break;
                case "View Statements": {
                    let statementType;
                    if (this.state.data.cardType) {
                        statementType = "card";
                    }
                    if (this.state.data.acctType) {
                        statementType = "acct";
                    }
                    this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                        screen: "ViewStatements",
                        params: {
                            data,
                            statementType,
                        },
                    });
                    break;
                }
                case "Top Up\nMAE": {
                    const maeData = this.state.maeData ?? (await this._getMaeCustInfoData());

                    const navParams = {
                        data,
                        maeData,
                        routeFrom: "WalletMainDashboard",
                        onGoBack: this._loadWallet,
                    };
                    onMAETopUpButtonTap(navParams);
                    break;
                }
                case "Groceries":
                    this.props.navigation.navigate(navigationConstant.TICKET_STACK, {
                        screen: navigationConstant.MY_GROSER_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "Travel Deals":
                    this.props.navigation.navigate(navigationConstant.TICKET_STACK, {
                        screen: navigationConstant.EXPEDIA_INAPP_WEBVIEW_SCREEN,
                    });
                    break;
                case "ATM Cash-out":
                    this.props.navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
                        screen: atmEnabled
                            ? navigationConstant.ATM_PREFERRED_AMOUNT
                            : navigationConstant.ATM_CASHOUT_CONFIRMATION,
                        params: {
                            routeFrom: "Dashboard",
                            is24HrCompleted: isOnboarded,
                            originStack: navigationConstant.TAB_NAVIGATOR,
                            origin: "More",
                            data,
                        },
                    });
                    break;
                case "Sama2 Lokal":
                    this.props.navigation.navigate(navigationConstant.SSL_STACK, {
                        screen: navigationConstant.SSL_START,
                    });
                    break;
                case "Deactivate account":
                    this.onPressSuspendAccount();
                    break;

                default:
                    console.log(
                        "[WalletMainDashboard][_onPressGridItem] ❓Unknown shortcut: ",
                        item
                    );
                    break;
            }
        }
    };

    // Transaction History
    _onPressTxnHistory = () => {
        console.log("[WalletMainDashboard][_onPressTxnHistory] 💥");

        FAwalletDashboard.viewTransaction();
        const { data, type, prevData } = this.state;

        this.props.navigation.navigate("TransactionHistory", {
            data,
            prevData,
            type,
        });
    };

    // MAE - Card management
    _onPressSettings = () => {
        // TODO: go to MAE card management module
        console.log(
            "[WalletMainDashboard][_onPressSettings] 💥 TODO: trigger MAE card management module"
        );
    };

    _onPressCallNow = () => {
        this.setState({ showContactBankModal: false });
        utility.contactBankcall("1300886688");
    };

    // MAE - Get current coordinates
    _getLowAccuracyLoc = async () => {
        try {
            const data = await utility.getLocationDetails();

            console.log(
                `[WalletMainDashboard][_getLowAccuracyLoc] checkLocationPermission data`,
                data
            );

            const lat = data?.location?.latitude ?? "";
            const lng = data?.location?.longitude ?? "";

            // GEOCODE POSITION
            if (isPureHuawei) {
                await this.getHMSLocation();
            } else {
                const response = await Geocoder.geocodePosition({ lat, lng });
                const { country, countryCode } = response[0];
                console.log(
                    "[WalletMainDashboard][_getLowAccuracyLoc] Geocode result: ",
                    response[0]
                );
                this.setState({ countryCode, country }, this._getAccountDetails);
            }
        } catch (error) {
            console.log(
                "[WalletMainDashboard][_getLowAccuracyLoc] Couldn't get location! Error:",
                error
            );
            this.setState({ countryCode: null, refresh: !this.state.refresh, loaded: true });
        }
    };

    getHMSLocation = async () => {
        const locationRequest = {
            priority: HMSLocation.FusedLocation.Native.PriorityConstants.PRIORITY_NO_POWER,
            interval: 3,
            numUpdates: 1,
            fastestInterval: 1000.0,
            expirationTime: 200000.0,
            expirationTimeDuration: 200000.0,
            smallestDisplacement: 0.0,
            maxWaitTime: 7000.0,
            needAddress: true,
            language: "en",
            // countryCode: "MY",
        };

        try {
            // check for HMS availability

            if (isPureHuawei) {
                const permission = await HMSLocation.FusedLocation.Native.requestPermission();

                if (permission?.granted && permission?.fineLocation) {
                    // call the location update first to make sure we use the location service,
                    // so the cache will probably not be empty when we use getLastLocation
                    const updateLocation =
                        await HMSLocation.FusedLocation.Native.requestLocationUpdatesWithCallback(
                            locationRequest
                        );
                    const lastLocation =
                        await HMSLocation.FusedLocation.Native.getLastLocationWithAddress(
                            locationRequest
                        );

                    console.tron.log("lastLocation", lastLocation);
                    if (updateLocation && lastLocation) {
                        /* setLocation({
                            country: lastLocation?.countryName,
                            code: lastLocation?.countryCode,
                        }); */
                        let country = lastLocation?.countryName;
                        let countryCode = lastLocation?.countryCode;
                        this.setState({ countryCode, country }, this._getAccountDetails);
                    }
                }
            }
        } catch (error) {
            if (error > 0) {
                console.tron.log("HMS Mobile service might not be available", error);
            } else {
                console.tron.log("Error in getting current location", error);
            }
        }
    };

    accDisableItems = () => {
        let disableItems = [];
        if (!this.props.getModel("misc")?.atmCashOutReady) {
            disableItems.push("ATM Cash-out");
        }
        if (!this.props.getModel("misc")?.casaStatement) {
            disableItems.push("View Statements");
        }
        return disableItems;
    };

    _navigateToExpenses = () => {
        FAwalletDashboard.viewAllSpendingSummary();
        //navigate to expenses here..
        this.props.navigation.navigate(navigationConstant.TRACKER_MODULE, {
            screen: navigationConstant.EXPENSES_DASHBOARD,
        });
    };

    handleCallUsNow = () => {
        this.setState({
            isShowCallUsNow: true,
        });
    };

    onCloseCallUsNow = () => {
        this.setState({
            isShowCallUsNow: false,
        });
    };

    onClickLocateUsNow = () => {
        this.props.navigation.navigate(navigationConstant.SECURE_SWITCH_STACK, {
            screen: navigationConstant.LOCATE_US_NOW_SCREEN,
            params: {
                ...this.props.route?.params,
                fromModule: navigationConstant.TAB,
                fromScreen: navigationConstant.MORE,
            },
        });
    };

    onPressSuspendAccount = () => {
        const { isAccountSuspended } = this.state;
        if (!isAccountSuspended) {
            const { acctNo: number, acctName: name, acctType, jointAccount } = this.state.data;
            const accDetails = [
                {
                    number,
                    name,
                    acctType,
                    isJointAccount: jointAccount,
                },
            ];
            this.props.navigation.navigate(navigationConstant.SECURE_SWITCH_STACK, {
                screen: navigationConstant.DEACTIVATE_M2U_CARDS_CASA_LANDING,
                params: {
                    ...this.props.route?.params,
                    fromModule: navigationConstant.TAB,
                    fromScreen: navigationConstant.WALLET_MAIN_DASHBOARD,
                    content: Strings.SUSPEND_CASA_LANDING,
                    accDetails,
                },
            });
        }
    };

    render() {
        const {
            sslReady,
            data,
            maeData,
            type,
            showMenu,
            showContactBankModal,
            topExpensesData,
            topExpensesLoaded,
            loaded,
        } = this.state;

        const { getModel } = this.props;
        const { showBalanceDashboard } = getModel("wallet");

        const menuArrayHideBal = [
            {
                menuLabel: "Copy Account Number",
                menuParam: "copyAccNo",
            },
            {
                menuLabel: "Hide Balance on Dashboard",
                menuParam: "hideBalance",
            },
            {
                menuLabel: "Change Primary Account",
                menuParam: "changeWallet",
            },
            {
                menuLabel: "Contact Bank",
                menuParam: "contact",
            },
        ];

        const menuArrayShowBal = [
            {
                menuLabel: "Copy Account Number",
                menuParam: "copyAccNo",
            },
            { menuLabel: "Show Balance on Dashboard", menuParam: "hideBalance" },
            {
                menuLabel: "Change Primary Account",
                menuParam: "changeWallet",
            },
            {
                menuLabel: "Contact Bank",
                menuParam: "contact",
            },
        ];

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={!loaded}
                    analyticScreenName="Wallet"
                >
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            neverForceInset={["bottom"]}
                            useSafeArea
                            header={
                                <HeaderLayout
                                    horizontalPaddingMode="custom"
                                    horizontalPaddingCustomLeftValue={16}
                                    horizontalPaddingCustomRightValue={16}
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                    headerCenterElement={
                                        <Typo
                                            text="Wallet"
                                            fontWeight="600"
                                            fontSize={16}
                                            lineHeight={19}
                                        />
                                    }
                                    headerRightElement={
                                        <HeaderDotDotDotButton onPress={this._toggleMenu} />
                                    }
                                />
                            }
                        >
                            <ScrollView>
                                {data && data.acctStatusCode === "06" && (
                                    <View style={widgetStyles.killSwitchWarning}>
                                        <Image
                                            source={assets.icWarningYellow}
                                            style={widgetStyles.warningIcon}
                                        />
                                        <Typo
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={16}
                                            textAlign="left"
                                            text={Strings.SUSPEND_ACC_WARNING_MSG}
                                            style={widgetStyles.killSwitchWarningText}
                                        />
                                    </View>
                                )}
                                <View style={styles.container}>
                                    {!data && (
                                        <View style={styles.loaderContainer}>
                                            <ProductCardBigLoader />
                                        </View>
                                    )}

                                    {data && type && (
                                        <AccountDetailsLayout
                                            disabledItems={this.accDisableItems()}
                                            myGroserAvailable={
                                                this.props.getModel("myGroserReady")?.code
                                            }
                                            sslReady={sslReady}
                                            data={data}
                                            maeData={maeData}
                                            type={type}
                                            onPressGridItem={this._onPressGridItem}
                                            onPressViewTxn={this._onPressTxnHistory}
                                            onPressSettings={this._onPressSettings}
                                            onAutoTopup={this._onAutoTopupTap}
                                            showSettings={false}
                                            isWallet
                                            isAccountSuspended={data.acctStatusCode === "06"}
                                            getModel={this.props.getModel}
                                        >
                                            {/* Widgets here */}

                                            {topExpensesLoaded && (
                                                <Fade duration={200} delay={0} fadeMode="fadeIn">
                                                    <View
                                                        style={widgetStyles.widgetHeaderContainer}
                                                    >
                                                        <View
                                                            style={
                                                                widgetStyles.widgetTitleContainer
                                                            }
                                                        >
                                                            <Typo
                                                                text="Account Spending"
                                                                fontSize={16}
                                                                lineHeight={16}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                            />
                                                        </View>
                                                        <TouchableOpacity
                                                            onPress={this._navigateToExpenses}
                                                        >
                                                            <Typo
                                                                text="View All"
                                                                textAlign="right"
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                color="#4a90e2"
                                                            />
                                                        </TouchableOpacity>
                                                    </View>

                                                    <TopExpensesWidget
                                                        // isDemo
                                                        items={
                                                            topExpensesData &&
                                                            topExpensesData.topTransactions
                                                        }
                                                        onListItemPressed={this._navigateToExpenses}
                                                        amount={
                                                            topExpensesData &&
                                                            topExpensesData.totalAmount
                                                        }
                                                    />
                                                </Fade>
                                            )}
                                        </AccountDetailsLayout>
                                    )}
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                {data && data.acctStatusCode === "06" && (
                                    <View style={widgetStyles.bottomBtnContCls}>
                                        <View style={widgetStyles.locateBranchButton}>
                                            <ActionButton
                                                backgroundColor={WHITE}
                                                fullWidth
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={Strings.LOCATE_NEAREST_BRANCH}
                                                    />
                                                }
                                                onPress={this.onClickLocateUsNow}
                                            />
                                        </View>
                                        <View style={widgetStyles.callUsNowButton}>
                                            <ActionButton
                                                fullWidth
                                                borderRadius={24}
                                                backgroundColor={DARK_YELLOW}
                                                onPress={this.handleCallUsNow}
                                                componentCenter={
                                                    <Typo
                                                        text={Strings.CALL_US_NOW}
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </View>
                                    </View>
                                )}
                            </FixedActionContainer>
                        </ScreenLayout>

                        {showContactBankModal && (
                            <ContactBankDialog
                                onClose={this._onDismissCallNow}
                                onParam1Press={this._onPressCallNow}
                            />
                        )}
                    </>
                </ScreenContainer>
                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this._toggleMenu}
                    navigation={this.props.navigation}
                    menuArray={showBalanceDashboard ? menuArrayHideBal : menuArrayShowBal}
                    onItemPress={this._handleTopMenuItemPress}
                />
                <CallUsNowModel
                    visible={this.state.isShowCallUsNow}
                    onClose={this.onCloseCallUsNow}
                />
            </>
        );
    }
}
export default withModelContext(WalletMainDashboard);

const styles = StyleSheet.create({
    container: {
        alignContent: "center",
        flex: 1,
    },
    loaderContainer: {
        marginHorizontal: 24,
        marginTop: 16,
    },
});

const widgetStyles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    callUsNowButton: {
        marginBottom: 16,
        marginTop: 0,
    },
    killSwitchWarning: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 0,
        backgroundColor: WARNING_YELLOW,
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        borderRadius: 8,
    },
    killSwitchWarningText: {
        width: "90%",
    },
    locateBranchButton: {
        marginBottom: 16,
        marginTop: 16,
    },
    warningIcon: {
        marginRight: 10,
        width: 16,
    },
    widgetHeaderContainer: {
        flexDirection: "row",
        height: 18,
        marginBottom: 28,
        marginTop: 40,
    },
    widgetTitleContainer: {
        flex: 1,
    },
});

import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Image, Clipboard, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import Geocoder from "react-native-geocoder";
import PassKit from "react-native-passkit-wallet";

import {
    checkCardEligibility,
    payWithApplePay,
    onApplePayBtnPress,
    getAPCardNumber,
    rsaChallengeQuestion,
} from "@screens/ApplePay/ApplePayController";
import {
    RenderAddedItems,
    RenderFooterItems,
    RenderWatchItems,
    RenderDeviceItems,
    LearnAP,
} from "@screens/ApplePay/ApplePayUI";
import AccountDetailsTabView from "@screens/Banking/AccountDetailsTabView";
import * as CardManagementController from "@screens/MAE/CardManagement/CardManagementController";
import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";

import {
    BANKING_TXNHISTORY_SCREEN,
    PAYBILLS_LANDING_SCREEN,
    PAYBILLS_MODULE,
    BANKINGV2_MODULE,
    APPLY_CARD_INTRO,
    FUNDTRANSFER_MODULE,
    TRANSFER_TAB_SCREEN,
    ACCOUNT_DETAILS_SCREEN,
    PAYCARDS_MODULE,
    PAYCARDS_ADD,
    SB_DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    TICKET_STACK,
    WETIX_INAPP_WEBVIEW_SCREEN,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    KLIA_EKSPRESS_STACK,
    KLIA_EKSPRESS_DASHBOARD,
    EXPEDIA_INAPP_WEBVIEW_SCREEN,
    MAE_WALLET_SETUP,
    SWITCH_MAE_ACCOUNT,
    SSL_STACK,
    SETTINGS_MODULE,
    APPLE_PAY_FAIL_SCREEN,
    APPLE_PAY_ACK,
    SSL_START,
    RELOAD_MODULE,
    RELOAD_SELECT_TELCO,
    ATM_CASHOUT_STACK,
    ATM_CASHOUT_CONFIRMATION,
    ATM_PREFERRED_AMOUNT,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    ONE_TAP_AUTH_MODULE,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    DASHBOARD,
    TAB_NAVIGATOR,
    AUTOBILLING_STACK,
    AUTOBILLING_DASHBOARD,
    LOCATE_US_NOW_SCREEN,
    SECURE_SWITCH_STACK,
    DEACTIVATE_M2U_CARDS_CASA_LANDING,
} from "@navigation/navigationConstant";

import AccountDetailsLayout from "@layouts/AccountDetailsLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import CallUsNowModel from "@components/CallUsNowModel";
import ProductCardBigLoader from "@components/Cards/ProductCardBigLoader";
import { ContactBankDialog } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import CreditCardScrollPickerItem from "@components/Pickers/ScrollPicker/CreditCardScrollPickerItem";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showSuccessToast, showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import {
    updatePrimaryAccount,
    maeStepupCusEnquiry,
    bankingGetDataMayaM2u,
    getDashboardWalletBalance,
    checkOperationTime,
    invokeL3,
    switchRequestStatus,
} from "@services";
import ApiManager, { TIMEOUT, METHOD_POST } from "@services/ApiManager";
import { GABankingAccDetails, GABankingApplePay } from "@services/analytics/analyticsBanking";
import { FAwalletDashboard } from "@services/analytics/analyticsWallet";

import { TOKEN_TYPE_M2U } from "@constants/api";
import { MEDIUM_GREY, TRANSPARENT, WHITE, WARNING_YELLOW, DARK_YELLOW } from "@constants/colors";
import { CURRENT, SAVINGS } from "@constants/data";
import {
    APPLE_PAY,
    COMMON_ERROR_MSG,
    FA_CARD_DETAILS,
    STEPUP_BRANCH_VISIT,
    SWITCH_TO_ISLAMIC,
    TRANSACTION_TYPE,
    SUSPEND_ACC_WARNING_MSG,
    CALL_US_NOW,
    LOCATE_NEAREST_BRANCH,
    BLOCKED_CARD_WARNING_MSG,
    MAE_TITLE,
    CC,
    CC_EXPIRED,
    BLOCK_CARDS_LANDING,
    SUSPEND_CASA_LANDING,
} from "@constants/strings";
import { ENDPOINT_BASE, ABOUT_APPLE_PAY } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import * as ModelClass from "@utils/dataModel/modelClass";
import {
    maskCards,
    getLocationDetails,
    formateAccountNumber,
    maskAccount,
    isEmpty,
    getCardNoLength,
    getDeviceRSAInformation,
    autoTopupNavigate,
} from "@utils/dataModel/utility";
import * as utility from "@utils/dataModel/utility";
import { returnCardDetails, isCardProvisioned } from "@utils/dataModel/utilityApplePay";
import { ErrorLogger } from "@utils/logs";

import assets from "@assets";

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

class AccountDetailsScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object.isRequired,
    };

    state = {
        showMenu: false,
        menuArray: [],
        type: "",
        supplementaryCards: [],
        showScrollPicker: false,
        prevData: this.props.route.params?.prevData ?? {},
        tabName: this.props.route.params?.tabName ?? "",
        fromScreen: this.props.route.params?.fromScreen ?? "",
        maeCardDetails: null,

        redirectScreen: this.props.route.params?.redirectScreen ?? null,

        isPopupDisplay: false,
        popupTitle: "",
        popupDesc: "",
        popupType: "",
        popupPrimaryActionText: "",

        showDotDotDot: false,
        setPin: true,

        sslReady: this.props.getModel("ssl")?.sslReady,

        //Apple Pay
        cardDevProv: false,
        cardWatchProv: false,
        appleWalletEligibility: false,

        //CQ
        showRSALoader: false,
        showRSAChallengeQuestion: false,
        rsaChallengeQuestion: "",
        showRSAError: false,
        challengeRequest: {},
        rsaCount: 0,

        // kill switch
        isAccountSuspended: this.props.route.params?.isAccountSuspended,
        isShowCallUsNow: false,
    };

    componentDidMount() {
        const { tabName } = this.state;
        GABankingAccDetails.viewScreenAccountDetails(tabName);
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    componentWillUnmount() {
        // Remove event listener
        if (this.state.appleWalletEligibility) {
            PassKit.removeEventListener(
                "addPassesViewControllerDidFinish",
                this.onAddPassesViewControllerDidFinish
            );
        }
    }

    onAddPassesViewControllerDidFinish = () => {
        console.log("onAddPassesViewControllerDidFinish");
        PassKit.getAddCardResult()
            .then((res) => {
                console.log("In App Provisioning Final Result ::: ", res);
                this.storeResult(res);
                if (res?.cardNo && res?.cardName) {
                    const details = [
                        {
                            title: TRANSACTION_TYPE,
                            value: "Apple Pay Activation",
                        },
                        {
                            title: "Card details",
                            value: `${res?.cardName} ${maskCards(res?.cardNo)}`, //TODO : APPLE
                        },
                    ];
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_FAIL_SCREEN,
                        params: {
                            details,
                            entryPoint: "CARD_DETAILS",
                        },
                    });
                } else if (res === "launch") {
                    console.log("Stay in this screen");
                } else {
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_ACK,
                        params: {
                            entryPoint: "CARD_DETAILS",
                        },
                    });
                }
            })
            .catch((err) => console.log(" Pass Error ****", err));
    };

    onScreenFocus = () => {
        console.log("[AccountDetailsScreen] >> [onScreenFocus]");
        this._setAccountType();
    };

    storeResult = (res) => {
        const { updateModel } = this.props;
        updateModel({
            applePayData: {
                inAppProvisionResult: res,
            },
        });
    };

    _setupMenu = () => {
        const {
            misc: { isShowBlockCard },
            wallet: { showBalanceDashboard },
        } = this.props.getModel(["misc", "wallet"]);
        const { type, data, setPin } = this.state;
        console.log("[_setupMenu]", data);
        // If account is wallet OR type card, don't show "Set as Wallet"
        if (data.primary || data.type === "C") {
            let menuItems = [
                {
                    menuLabel: "Copy Account Number",
                    menuParam: "copyAccNo",
                },
            ];

            if (data.primary) {
                menuItems = [
                    {
                        menuLabel: "Copy Account Number",
                        menuParam: "copyAccNo",
                    },
                    {
                        menuLabel: `${showBalanceDashboard ? "Hide" : "Show"} Balance on Dashboard`,
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
            }

            //If account is MAE and conventional type then add an extra menu item as Switch to Islamic
            if (data.acctType === "D" && data.acctCode === "0Y") {
                const menuItem = {
                    menuLabel: SWITCH_TO_ISLAMIC,
                    menuParam: "switchToIslamic",
                };
                menuItems.push(menuItem);
            }
            this.setState({
                menuArray: menuItems,
            });
        } else if (type === "CC" && setPin && !isShowBlockCard) {
            this.setState({
                menuArray: [
                    {
                        menuLabel: "Set Card PIN",
                        menuParam: "setCardPin",
                    },
                ],
            });
        } else {
            const menuItems = [
                {
                    menuLabel: "Copy Account Number",
                    menuParam: "copyAccNo",
                },
            ];
            //If account is MAE and conventional type then add an extra menu item as Switch to Islamic
            if (data.acctType === "D" && data.acctCode === "0Y") {
                const menuItem = {
                    menuLabel: SWITCH_TO_ISLAMIC,
                    menuParam: "switchToIslamic",
                };
                menuItems.push(menuItem);
            }
            this.setState({
                menuArray: menuItems,
            });
        }
    };

    _checkAccSuspended = () => {
        const {
            data: { acctStatusCode },
        } = this.state;
        this.setState({
            isAccountSuspended: acctStatusCode === "06",
        });
    };

    _setAccountType = () => {
        // Figure out account type and set it in the state
        const { prevData, setPin } = this.state;
        const { isShowBlockCard } = this.props.getModel("misc");
        let detectedType = "";
        if (prevData.type === "S") {
            detectedType = SAVINGS;
        } else if (prevData.type === "D") {
            if (prevData.group === "CCD" || prevData.group === "0YD") {
                detectedType = MAE_TITLE;
            } else {
                detectedType = CURRENT;
            }
        } else {
            detectedType = prevData.statusCode === "05" ? CC_EXPIRED : CC;
        }

        console.log(
            "[AccountDetailsScreen][_setAccountType] 💥 Account type detected is ",
            detectedType
        );

        // Show dot dot dot button check
        const showDotDotDot =
            (detectedType === "CC" && setPin && !isShowBlockCard) ||
            detectedType === SAVINGS ||
            detectedType === CURRENT ||
            detectedType === MAE_TITLE;

        // Save type and 3xDot menu visibility into state
        this.setState({ type: detectedType, showDotDotDot }, () => {
            if (detectedType === MAE_TITLE) {
                this._getLowAccuracyLoc();
            } else {
                this._getAccountDetails();
            }
        });
    };

    _getAccountDetails = async () => {
        const { prevData, type, countryCode } = this.state;

        let subUrl = "";
        let params = "";

        if (type === CC || type === CC_EXPIRED) {
            subUrl = "/details/card";
            params = "?acctNo=" + prevData.number;
        } else {
            subUrl = "/details/casa";
            params =
                "?acctNo=" +
                prevData.number +
                "&acctCode=" +
                prevData.code +
                "&countryCode=" +
                countryCode;
        }

        bankingGetDataMayaM2u(subUrl + params, false)
            .then(async (response) => {
                let data = null;
                let maeData = null;
                const { btEnable, ezyPayEnable } = this.props.getModel("ccBTEZY");
                const { cardStatement, casaStatement } = this.props.getModel("misc");

                if (type === CC || type === CC_EXPIRED) {
                    data = response.data.cardsDetail;
                } else {
                    data = response.data.casaDetail;
                    if (type === MAE_TITLE) {
                        maeData = response.data.maeCustomerInfo;
                    }
                }
                console.log(
                    "[AccountDetailsScreen][_getAccountDetails] " +
                        subUrl +
                        " with param: " +
                        params +
                        " ==> ",
                    response
                );
                if (data != null) {
                    this.setState(
                        {
                            data: {
                                ...data,
                                btEnable,
                                ezyPayEnable,
                                cardStatement,
                                casaStatement,
                            },
                            refresh: !this.state.refresh,
                            maeData,
                        },
                        () => {
                            this._setupMenu();
                            this._checkRedirect();
                            if (type === MAE_TITLE) this._getMAEData();
                            this._checkAccSuspended();
                        }
                    );

                    if (this.state.tabName === "Cards") {
                        const { isApplePayEnable, isEligibleDevice, cards } =
                            this.props.getModel("applePay");
                        const isValidCard = ["3", "4", "5"].includes(data?.cardNo.substring(0, 1));
                        if (
                            Platform.OS === "ios" &&
                            isApplePayEnable &&
                            isEligibleDevice &&
                            type === CC &&
                            isValidCard
                        ) {
                            //TODO : pass card array that returns from BE
                            const cardNo = getAPCardNumber(data.cardNo);
                            const cardDetails = returnCardDetails(cards, cardNo);
                            if (!cardDetails) return;
                            const suffix = cardNo.substring(cardNo.length - 4, cardNo.length);
                            const res = await checkCardEligibility(cardDetails?.fpanID, suffix);
                            if (res) {
                                this.setState({
                                    cardDevProv: res.device,
                                    cardWatchProv: res.watch,
                                });
                                if (!res.device || !res.watch) {
                                    this.setState({
                                        appleWalletEligibility: true,
                                    });
                                }
                                //TODO: remove later, for testing purpose, to check result in context
                                const { updateModel } = this.props;
                                updateModel({
                                    applePayData: {
                                        isCardProvisioned: res,
                                    },
                                });
                            }
                        }
                    }
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh, maeData });
                    this.props.navigation.goBack();
                }
            })
            .catch((Error) => {
                console.log("[AccountDetailsScreen][_getCASAData] ERROR: ", Error);
                this.props.navigation.goBack();
            });
    };

    _onBackPress = () => {
        // this.props.navigation.goBack();
        // this.props.route.params.onGoBack();
        this.props.navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: this.state.fromScreen ?? "Maybank2u",
                params: {
                    ...this.props.route?.params,
                },
            },
        });
    };

    _handleTopMenuItemPress = (param) => {
        const { getModel } = this.props;
        const { showBalanceDashboard } = getModel("wallet");
        this.setState({ showMenu: false });
        switch (param) {
            case "copyAccNo":
                GABankingAccDetails.selectMenuCopyAccNum();
                // Copy acc no. to clipboard
                this._writeToClipboard();
                break;
            case "switchToIslamic":
                this._switchToIslamic();
                break;
            case "setCardPin":
                // Navigate to set pin flow
                this._navigateToSetPin(param);
                break;
            case "changeWallet":
                // Call api to set account as wallet
                this._changeWallet();
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
            case "contact":
                // Call api to set account as wallet
                this.setState({ showMenu: false });
                setTimeout(() => this.setState({ showContactBankModal: true }), 0);
                FAwalletDashboard.onModalPopUp();
                break;
        }
    };

    _navigateToSetPin = (param) => {
        const { isAccountSuspended } = this.state;
        if (!isAccountSuspended) {
            GABankingAccDetails.selectMenuSetCardPin(param);
            this.props.navigation.push(BANKINGV2_MODULE, {
                screen: "CCSetPinScreen",
                params: {
                    prevData: {
                        ...this.state.prevData,
                    },
                    onGoBack: () => {
                        return this._getAccountDetails;
                    },
                },
            });
        }
    };

    _onAutoTopupTap = async () => {
        const { isAccountSuspended } = this.state;
        if (!isAccountSuspended) {
            console.log("[AutoTopupController] >> [onAutoTopupTap]");

            const maeCustomerInfo = this.state?.maeData ?? {};
            // L3 call to invoke login page
            const httpRes = await invokeL3(true);
            const result = httpRes.data;
            const { code } = result;
            if (code !== 0) return;

            const navParams = {
                fromModule: BANKINGV2_MODULE,
                fromScreen: "AccountDetailsScreen",
                moreParams: {},
            };

            const res = await autoTopupNavigate(maeCustomerInfo, navParams);

            if (res) {
                const { screen, params } = res;
                this.props.navigation.navigate(screen, params);
            }
        }
    };

    _checkRedirect = () => {
        const { redirectScreen } = this.state;

        if (redirectScreen && redirectScreen === "MAETOPUP") {
            const navParams = {
                data: this.state.data,
                routeFrom: "AccountDetails",
                onGoBack: this._getAccountDetails,
            };
            onMAETopUpButtonTap(navParams);
            this.props.navigation.setParams({
                redirectScreen: null,
            });
            this.setState({ redirectScreen: null });
        }
    };

    _toggleMenu = () => {
        const { tabName, showMenu } = this.state;
        if (!showMenu) {
            GABankingAccDetails.openMenuToggleMenu(tabName);
        }

        this.setState({ showMenu: !this.state.showMenu });
    };

    // Copy account number
    _writeToClipboard = async () => {
        const { data, type } = this.state;
        let copyToClipboard = "";

        if (type === CC) {
            const length = getCardNoLength(data.cardNo);
            copyToClipboard = formateAccountNumber(data.cardNo, length);
        } else {
            copyToClipboard = formateAccountNumber(data.acctNo, 12);
        }

        console.log(copyToClipboard);

        await Clipboard.setString(copyToClipboard);
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
                onGoBack: this.getPrimaryAccount,
                from: "WalletMainDashboard",
            },
        });
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

    _reloadLoginSuccess = () => {
        console.log("[AccountDetailsScreen] >> [_transferLoginSuccess]");
        this.props.navigation.navigate(RELOAD_MODULE, RELOAD_SELECT_TELCO);
    };

    gotoPayBill = () => {
        console.log("[AccountDetailsScreen] >> [gotoPayBill]");
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: PAYBILLS_LANDING_SCREEN,
            params: { data: this.state.data },
        });
    };

    // Shortcut Grid
    _onPressGridItem = async (item) => {
        console.log(
            "[AccountDetailsScreen][_onPressGridItem] 💥 Shortcut pressed with details: ",
            item
        );
        if (item.isAccountSuspended) return;
        const { data, prevData, tabName, maeData } = this.state;
        const { isEnabled: qrEnabled } = this.props.getModel("qrPay");
        const { isEnabled: atmEnabled, isOnboarded } = this.props.getModel("atm");
        const { isOnboard } = this.props.getModel("user");

        GABankingAccDetails.selectQuickActionPressGridItem(tabName, item);

        // Exposing account details here which might be required to start other flows
        // Note: 'number' is account number
        const { number, acctNo, name } = data;

        //TODO: Other devs should place their own logic here to start their respective shortcut flows
        switch (item.title) {
            case "Transfer":
                // TODO: To be removed once API manager login is included
                this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
                    screen: TRANSFER_TAB_SCREEN,
                    params: {
                        data,
                        acctNo,
                        prevData,
                        screenDate: { routeFrom: "AccountDetails" },
                        asnbTransferState: {
                            selectedCASAAccountNumber: acctNo,
                        },
                    },
                });
                break;
            case "Pay Bills":
                this.props.navigation.navigate(PAYBILLS_MODULE, {
                    screen: PAYBILLS_LANDING_SCREEN,
                    params: {
                        data: this.state.data,
                        fromModule: BANKINGV2_MODULE,
                        fromScreen: ACCOUNT_DETAILS_SCREEN,
                        onGoBack: this._getAccountDetails,
                    },
                });
                break;
            case "Reload":
                this.props.navigation.navigate(RELOAD_MODULE, {
                    screen: RELOAD_SELECT_TELCO,
                    params: { routeFrom: "AccountDetails", data, acctNo, prevData },
                });

                break;
            case "Pay Card":
            case "Pay Cards":
                // "J" cardType is prepaid card. user cannot pay prepaid card
                if (this.state.data.cardType && this.state.data?.cardType.toLowerCase() === "j") {
                    // TODO: add error message(waiting for business to give)
                } else {
                    this.props.navigation.navigate(PAYCARDS_MODULE, {
                        screen: PAYCARDS_ADD,
                        params: {
                            data: {
                                ...this.state.data,
                                isSupplementary:
                                    this.props?.route?.params?.isSupplementary ?? false,
                                primaryAcc: this.props?.route?.params?.primaryAcc,
                            },
                            fromModule: BANKINGV2_MODULE,
                            fromScreen: ACCOUNT_DETAILS_SCREEN,
                            onGoBack: () => {
                                this._getAccountDetails();
                            },
                        },
                    });
                }
                break;

            case "Split Bill":
                this.props.navigation.navigate(SB_DASHBOARD, {
                    prevData,
                    routeFrom: "ACCOUNT_DETAILS",
                });
                break;
            case "Send & Request":
                this.props.navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                    screen: SEND_REQUEST_MONEY_DASHBOARD,
                    params: { data, acctNo, prevData, screenDate: { routeFrom: "AccountDetails" } },
                });
                break;
            case "Auto\nBilling":
                this.props.navigation.navigate(AUTOBILLING_STACK, {
                    screen: AUTOBILLING_DASHBOARD,
                    params: { data, acctNo, prevData, screenDate: { routeFrom: "AccountDetails" } },
                });
                break;

            case "Scan & Pay":
                if (!qrEnabled) {
                    this.props.navigation.navigate("QrStack", {
                        screen: "QrStart",
                        params: { primary: false, settings: false, wallet: false, data },
                    });
                } else {
                    this.props.navigation.navigate("QrStack", {
                        screen: "QrMain",
                        params: { primary: false, settings: false, wallet: false, data },
                    });
                }
                break;
            case "View Statements": {
                let statementType;
                if (this.state.data.cardType) {
                    statementType = "card";
                }
                if (this.state.data.acctType) {
                    statementType = "acct";
                }
                this.props.navigation.navigate("ViewStatements", {
                    data,
                    statementType,
                });
                break;
            }
            case "Groceries":
                this.props.navigation.navigate(TICKET_STACK, {
                    screen: MY_GROSER_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "AccountDetails", data, acctNo, prevData },
                });
                break;
            case "Movies & Leisure":
                this.props.navigation.navigate(TICKET_STACK, {
                    screen: WETIX_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "AccountDetails", data, acctNo, prevData },
                });
                break;
            case "Bus Tickets":
                this.props.navigation.navigate(TICKET_STACK, {
                    screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "AccountDetails", data, acctNo, prevData },
                });
                break;
            case "Flight Tickets":
                this.props.navigation.navigate(TICKET_STACK, {
                    screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
                    params: { routeFrom: "AccountDetails", data, acctNo, prevData },
                });
                break;
            case "ERL Tickets":
                this.props.navigation.navigate(KLIA_EKSPRESS_STACK, {
                    screen: KLIA_EKSPRESS_DASHBOARD,
                    params: {
                        data: this.state.data,
                        fromModule: BANKINGV2_MODULE,
                        fromScreen: ACCOUNT_DETAILS_SCREEN,
                    },
                });
                break;
            case "Top Up\nMAE": {
                const navParams = {
                    data,
                    maeData,
                    routeFrom: "AccountDetails",
                    onGoBack: this._getAccountDetails,
                };
                onMAETopUpButtonTap(navParams);
                break;
            }
            case "Travel Deals":
                this.props.navigation.navigate(TICKET_STACK, {
                    screen: EXPEDIA_INAPP_WEBVIEW_SCREEN,
                });
                break;
            case "ATM Cash-out":
                this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                    screen:
                        isOnboard && (atmEnabled || isOnboarded)
                            ? ATM_PREFERRED_AMOUNT
                            : ATM_CASHOUT_CONFIRMATION,
                    params: {
                        originStack: BANKINGV2_MODULE,
                        origin: ACCOUNT_DETAILS_SCREEN,
                        routeFrom: ACCOUNT_DETAILS_SCREEN,
                        selectedAccount: {
                            acctNo: number ?? data?.acctNo ?? data?.number,
                            acctName: name ?? data?.acctName,
                        },
                        is24HrCompleted: isOnboarded,
                        data,
                    },
                });
                break;
            case "Supp. Card":
                this._onViewSuppCardPressed();
                break;
            case "Activate Card":
                this.props.navigation.navigate("CCAEnterCardExpiryYearScreen", {
                    prevData,
                });
                break;
            case "EzyPay Plus":
                this.props.navigation.navigate("EZYPayLanding", {
                    prevData,
                    data,
                });
                break;
            case "Balance Transfer":
                this.props.navigation.navigate("BTLanding", {
                    prevData,
                    data,
                });
                break;

            case "Sama2 Lokal":
                GABankingAccDetails.selectQuickActionSama2Local(this.state.type);
                this.props.navigation.navigate(SSL_STACK, {
                    screen: SSL_START,
                });
                break;
            case "Block Card":
                this.onPressBlockCard();
                break;
            case "Deactivate account":
                this.onPressSuspendAccount();
                break;
            default:
                console.log("[AccountDetailsScreen][_onPressGridItem] ❓Unknown shortcut: ", item);
                break;
        }
    };

    _onViewSuppCardPressed = async () => {
        if (this.state.supplementaryCards.length > 0) {
            this.setState({
                showScrollPicker: true,
            });
            return;
        }
        const request = await this._getSupplementaryCardList();
        if (request?.status === 200) {
            const cards = request.data?.result?.suppCardDetails ?? [];
            const supplementaryCards = cards.map((card) => ({
                ...card,
                title: card.plasticCardType,
                value: card.cardNumber,
            }));
            this.setState({
                showScrollPicker: true,
                supplementaryCards,
            });
        }
    };

    // Transaction History
    _onPressTxnHistory = () => {
        GABankingApplePay.viewTransactionsApplePay();
        console.log("[AccountDetailsScreen][_onPressTxnHistory] 💥");

        const { data, prevData, type } = this.state;

        this.props.navigation.navigate(BANKING_TXNHISTORY_SCREEN, {
            data,
            prevData,
            type,
        });
    };

    // MAE Stuff
    _getMAEData = () => {
        console.log("[AccountDetailsScreen] >> [_getMAEData]");

        const { maeData } = this.state;

        if (maeData) {
            const {
                applicantType,
                debitInq: maeCardDetails,
                m2uIndicator,
                stepUpEligible: isSetupAllow,
                stepUpIndicator: stepIndicator,
            } = maeData;

            // const maeApplied = maeData?.maeApplied ?? false;

            let stepupAllowed = false;
            let isApplyCardAllowed = false;

            if (maeCardDetails) {
                const cardStatus = maeCardDetails?.cardStatus ?? null;
                const cardNextAction = maeCardDetails?.cardNextAction ?? null;

                // Conditions to determine if stepup is allowed or not
                if (ModelClass.COMMON_DATA.cus_type === "10" || m2uIndicator !== "2") {
                    if (isSetupAllow && (stepIndicator === 0 || stepIndicator > 2)) {
                        stepupAllowed = true;
                    }
                } else if (
                    m2uIndicator === "2" &&
                    (stepIndicator === 0 || stepIndicator > 2) &&
                    isSetupAllow &&
                    (applicantType === "1" ||
                        applicantType === "2" ||
                        applicantType === "3" ||
                        applicantType === "4")
                ) {
                    stepupAllowed = true;
                }

                // Conditions to determine if apply card is allowed or not
                isApplyCardAllowed =
                    (cardStatus === "000" || cardStatus === "023") && cardNextAction === "001";
            }

            console.log(
                "[AccountDetailsScreen][_getMAEData]  💥 stepupAllowed: " +
                    stepupAllowed +
                    " isApplyCardAllowed: " +
                    isApplyCardAllowed
            );

            const bannerData = [];
            if (stepupAllowed) {
                bannerData.push({
                    id: 1,
                    categoryName: "StepUp",
                    imageUrl: assets.stepUp,
                });
            }
            if (isApplyCardAllowed) {
                bannerData.push({
                    id: 2,
                    categoryName: "ApplyCard",
                    imageUrl: assets.applyCard,
                });
            }

            if (!isEmpty(bannerData)) {
                this.setState({
                    showMAEBanner: true,
                    maeBannerData: bannerData,
                    maeCardDetails,
                });
            } else {
                this.setState({
                    showMAEBanner: false,
                    maeCardDetails,
                });
            }
        } else {
            console.log("[AccountDetailsScreen][_getMAEData] maeData missing!");
        }
    };

    // MAE Stuff
    _onPressBanner = (bannerId) => {
        console.log("[AccountDetailsScreen] >> [_onPressBanner]");

        if (bannerId === 1) {
            this._navigateToStepup();
        } else {
            this.initApplyMAECard();
        }
    };

    // MAE Stuff
    initApplyMAECard = async () => {
        console.log("[AccountDetailsScreen] >> [initApplyMAECard]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // Retrieve Card & Account Details
        const { maeData: maeCustomerInfo } = this.state;

        // Check Operation time
        const operationTime = await CardManagementController.checkServerOperationTime(
            "maePhysicalCard"
        );
        const statusCode = operationTime?.statusCode ?? "";
        const statusDesc = operationTime?.statusDesc ?? COMMON_ERROR_MSG;
        const trinityFlag = operationTime?.trinityFlag ?? "";
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc,
            });
            return;
        }

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch((error) => {
                console.log("[AccountDetailsScreen][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;
        }

        const navParams = CardManagementController.getApplyMAECardNavParams(
            maeCustomerInfo,
            trinityFlag
        );
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLY_CARD_INTRO,
            params: {
                ...navParams,
                entryPoint: "ACCOUNT_DETAILS",
            },
        });
    };

    // MAE Stuff
    _navigateToStepup = async () => {
        console.log("[AccountDetailsScreen] >> [_navigateToStepup]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");
        const { data } = this.state;
        const maeAcctNo = data.acctNo.substring(0, 12);

        // Check Operation time
        const operationTimeResponse = await checkOperationTime(true, {
            requestType: "stepup",
        }).catch((error) => {
            console.log("[AccountDetailsScreen][checkOperationTime] >> Exception: ", error);
        });
        const operationTimeResult = operationTimeResponse?.data?.result ?? null;
        const statusCode = operationTimeResult?.statusCode ?? "";
        const statusDesc = operationTimeResult?.statusDesc ?? COMMON_ERROR_MSG;
        const trinityFlag = operationTimeResult?.trinityFlag ?? "";

        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc,
            });
            return;
        }

        // MAE Stepup Customer Enquiry
        const enquiryResponse = await maeStepupCusEnquiry({
            maeAcctNo,
        }).catch((error) => {
            console.log("[AccountDetailsScreen][maeStepupCusEnquiry] >> Exception: ", error);
        });
        const enquiryResult = enquiryResponse?.data?.result ?? null;
        const stepUpIndicator = enquiryResult?.stepUpIndicator ?? null;
        const statusDescription = enquiryResult?.statusDesc ?? COMMON_ERROR_MSG;

        if (stepUpIndicator === "0") {
            // L3 call to invoke login page
            if (!isPostPassword) {
                const httpResp = await invokeL3(true).catch((error) => {
                    console.log("[AccountDetailsScreen][invokeL3] >> Exception: ", error);
                });
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            }

            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: MAE_WALLET_SETUP,
                params: {
                    stepup_details: {
                        ...enquiryResult,
                        maeAcctNo,
                    },
                    idType: enquiryResult?.idType,
                    routeFrom: "AccountDetails",
                    trinityFlag,
                },
            });
        } else if (stepUpIndicator === "1") {
            this.setState({
                isPopupDisplay: true,
                popupTitle: "Activate Your Account",
                popupDesc: STEPUP_BRANCH_VISIT,
                popupType: "stepup",
                popupPrimaryActionText: "Got It",
            });
        } else {
            showErrorToast({
                message: statusDescription,
            });
        }
    };

    // MAE - Get current coordinates
    _getLowAccuracyLoc = async () => {
        try {
            const data = await getLocationDetails();

            if (isPureHuawei) {
                // GEOCODE POSITION
                // const response = await Geocoder.geocodePosition({ lat, lng });
                const { countryName, countryCode } = data.location;
                this.setState({ countryCode, country: countryName }, this._getAccountDetails);
            } else {
                const lat = data?.location?.latitude ?? "";
                const lng = data?.location?.longitude ?? "";

                // GEOCODE POSITION
                const response = await Geocoder.geocodePosition({ lat, lng });
                const { country, countryCode } = response[0];
                console.tron.log(
                    "[AccountDetailsScreen][_getLowAccuracyLoc] Geocode result: ",
                    response[0]
                );
                this.setState({ countryCode, country }, this._getAccountDetails);
            }
        } catch (error) {
            console.tron.log(
                "[AccountDetailsScreen][_getLowAccuracyLoc] Couldn't get location! Error:" + error
            );
            this.setState({ countryCode: null }, this._getAccountDetails);
        }
    };

    _updatePrimary = () => {
        // TODO: EXTRACTED FROM WalletViewAccount.js, have not tested yet.
        const { data, isAccountSuspended } = this.state;
        if (!isAccountSuspended && !data.primary) {
            // get user info from modelcontext
            const { getModel } = this.props;
            const { m2uUserId } = getModel("user");
            const { walletId } = getModel("wallet");

            const request = {
                accountNo: data.acctNo,
                accountCode: data.acctStatusCode,
                hasPrimaryAccount: true,
                id: parseInt(walletId),
                m2uLinked: true,
                mayaUserId: parseInt(m2uUserId),
                pinNo: "",
            };

            console.log("[AccountDetailsScreen][_updatePrimary] 🚀 /wallet/updateAccountNo");

            updatePrimaryAccount("/wallet/updateAccountNo", JSON.stringify(request))
                .then((response) => {
                    console.log("[AccountDetailsScreen][_updatePrimary] 🚀 response:", response);
                    // const regObject = response.data;
                    // console.log("Object", regObject);

                    showSuccessToast({
                        message: "Account updated to primary",
                    });

                    this.getPrimaryAccount();

                    //Change primary status
                    this.setState(
                        {
                            data: { ...data, primary: true },
                        },
                        () => this._setupMenu()
                    );
                })
                .catch((err) => {
                    console.log("ERR", err);
                    this.setState({ error: true, ErrorMessage: "Server communication error" });
                });
        }
    };

    getPrimaryAccount = async () => {
        const { updateModel } = this.props;

        try {
            const response = await getDashboardWalletBalance();

            if (response && response.data) {
                const { result } = response.data;

                if (result) {
                    updateModel({
                        wallet: {
                            primaryAccount: result,
                        },
                    });
                }
            }
        } catch (error) {
            // error when retrieving the data
        }
    };

    // MAE Stuff
    _getStepUpEnquiry = () => {
        // TODO: EXTRACTED FROM WalletViewAccount, might not work.
        try {
            const { data } = this.state;
            const variables = {
                maeAcctNo: data.number,
            };

            console.log("[AccountDetailsScreen][_getStepUpEnquiry] 🚀 maeStepupCusEnquiry");

            maeStepupCusEnquiry(true, variables).then((response) => {
                return response.data.result;
            });
        } catch (e) {
            // leave cardDetails null
            console.log("E  " + e);
        }
    };

    _getSupplementaryCardList = async () => {
        try {
            const { data } = this.state;
            const response = await ApiManager.service({
                url: `${ENDPOINT_BASE}/wallet/v1/suppcard/details?principalCardNo=${data.cardNo}`,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
            });
            if (response) return response;
            throw new Error(response);
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _onScrollPickerDismissed = () => this.setState({ showScrollPicker: false });

    _renderCreditCardScrollPickerItems = (_, index, isSelected) => (
        <CreditCardScrollPickerItem
            cardName={this.state.supplementaryCards?.[index]?.plasticCardType ?? ""}
            cardNumber={maskAccount(this.state.supplementaryCards?.[index]?.cardNumber ?? "", 12)}
            isSelected={isSelected}
        />
    );

    _onScrollPickerItemPressed = (number) => {
        this.setState({ showScrollPicker: false });
        this.props.navigation.push(BANKINGV2_MODULE, {
            screen: "AccountDetailsScreen",
            params: {
                prevData: {
                    ...this.state.prevData,
                    number,
                    supplementaryAvailable: false,
                },
                onGoBack: () => {},
                isSupplementary: true,
                primaryAcc: this.state.data,
            },
        });
    };

    //switch to Islamic
    _switchToIslamic = async () => {
        const { data } = this.state;

        // Check Operation time
        const params = {
            requestType: "maeIslamicSwitch",
        };
        const operationTimeResponse = await checkOperationTime(true, params);
        const operationTimeResult = operationTimeResponse.data.result;
        const statusCode = operationTimeResult?.statusCode ?? "";
        const statusDesc = operationTimeResult?.statusDesc ?? COMMON_ERROR_MSG;

        if (statusCode !== "0000") {
            this.setState({
                isPopupDisplay: true,
                popupTitle: "Service Unavailable",
                popupDesc: statusDesc,
                popupType: "switchToIslamic",
                popupPrimaryActionText: "Got It",
            });
            return;
        }

        const reqParams = {
            maeAcctNo: data.acctNo.substring(0, 12),
        };

        const httpRespStepup = await switchRequestStatus(reqParams, true);
        const responseSteup = httpRespStepup.data;
        const enquiryData = responseSteup.result;
        const enquiryStatusCode = enquiryData?.statusCode ?? "";
        const enquiryStatusDesc = enquiryData?.statusDesc ?? COMMON_ERROR_MSG;

        if (enquiryStatusCode === "0000") {
            console.log("Enquiry Data is ", enquiryData);
            //N - Not Submitted; Y- Submitted
            if (enquiryData.switchRequestStatus === "N") {
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: SWITCH_MAE_ACCOUNT,
                    params: {
                        data,
                        routeFrom: "AccountDetails",
                    },
                });
            } else if (enquiryData.switchRequestStatus === "Y") {
                this.setState({
                    isPopupDisplay: true,
                    popupTitle: "Request in Progress",
                    popupDesc: enquiryStatusDesc,
                    popupType: "switchToIslamic",
                    popupPrimaryActionText: "Got It",
                });
            } else {
                showErrorToast({
                    message: enquiryStatusDesc,
                });
            }
        } else {
            showErrorToast({
                message: statusDesc,
            });
        }
    };

    onPopupClosePress = () => {
        this.setState({
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupType: "",
            popupPrimaryActionText: "",
        });
    };

    onPopupPrimaryActionPress = () => {
        this.setState({
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupType: "",
            popupPrimaryActionText: "",
        });
    };

    checkRSA = async (challengeParams = {}) => {
        console.log("check RSA CQ");
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const deviceDetails = {
            device_model: deviceInformation.DeviceModel,
            os_version: deviceInformation.DeviceSystemVersion,
        };
        const { data } = this.state;
        const cardNo = getAPCardNumber(data?.cardNo);
        const params = {
            mobileSDKData,
            deviceDetails,
            challengeMode: "",
            notifyStatus: "",
            cardNo,
            ...challengeParams,
        };
        console.log(params);
        const result = await rsaChallengeQuestion(params);
        console.log("checkRSA result ::: ", result);
        const code = result?.status;
        if (code === 428 || code === 423 || code === 422) {
            this._handleRSAFailure(result);
        } else {
            //200
            this.setState({ showRSAChallengeQuestion: false });
            this.onAPBtnPress();
        }
    };

    _handleRSAFailure = (error) => {
        if (error.status === 428) {
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error?.error?.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error?.error?.challenge.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        } else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: error?.error?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const params = {
                challenge: {
                    ...this.state.challengeRequest.challenge,
                    answer,
                },
            };
            await this.checkRSA(params);
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    onAPBtnPress = () => {
        GABankingApplePay.addToAppleWallet(FA_CARD_DETAILS);
        console.log("CardsList ::: onAPBtnPress ::: ", this.state.prevData.number);
        const { customerName } = this.props.getModel("user");
        const { token } = this.props.getModel("auth");
        const { data } = this.state;

        const { cards } = this.props.getModel("applePay");
        const cardNo = getAPCardNumber(data.cardNo);
        const selectedCardDetails = isCardProvisioned(cardNo, cards);
        console.log("card details ::: ", selectedCardDetails);
        PassKit.addEventListener(
            "addPassesViewControllerDidFinish",
            this.onAddPassesViewControllerDidFinish
        );
        onApplePayBtnPress(
            token,
            cardNo,
            data?.cardHolderName,
            customerName,
            false,
            selectedCardDetails?.fpanID
        );
    };

    aboutApplePay = () => {
        GABankingApplePay.learnAboutApplePay(FA_CARD_DETAILS);
        console.log("Show about apple pay in inapp browser");
        const props = {
            title: APPLE_PAY,
            source: ABOUT_APPLE_PAY,
            headerColor: TRANSPARENT,
        };

        this.props.navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    };

    onPayBtnPress = () => {
        GABankingApplePay.payWithApplePay(FA_CARD_DETAILS);
        console.log("onPayBtnPress"); //Need to redirect to apple wallet screen
        const { data } = this.state;
        const { cards } = this.props.getModel("applePay");
        const cardNo = getAPCardNumber(data.cardNo);
        const selectedCardDetails = isCardProvisioned(cardNo, cards);
        const suffix = selectedCardDetails.number?.substring(cardNo.length - 4, cardNo.length);
        payWithApplePay(selectedCardDetails?.fpanID, suffix);
    };

    accDisableItems = () => {
        const disableItems = [];
        if (!this.props.getModel("misc")?.atmCashOutReady) {
            disableItems.push("ATM Cash-out");
        }
        if (!this.props.getModel("misc")?.casaStatement) {
            disableItems.push("View Statements");
        }
        return disableItems;
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
        this.props.navigation.navigate(SECURE_SWITCH_STACK, {
            screen: LOCATE_US_NOW_SCREEN,
            params: {
                ...this.props.route?.params,
                fromModule: BANKINGV2_MODULE,
                fromScreen: ACCOUNT_DETAILS_SCREEN,
            },
        });
    };

    onPressBlockCard = () => {
        const {
            isAccountSuspended,
            prevData: { cardImage },
        } = this.state;
        if (!isAccountSuspended) {
            const {
                cardNo: number,
                cardHolderName: name,
                cardType,
                mainCardType,
            } = this.state.data;
            const accDetails = [
                {
                    number,
                    name,
                    cardType,
                    mainCardType,
                    cardImage,
                },
            ];
            this.props.navigation.navigate(SECURE_SWITCH_STACK, {
                screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
                params: {
                    ...this.props.route?.params,
                    fromModule: BANKINGV2_MODULE,
                    fromScreen: ACCOUNT_DETAILS_SCREEN,
                    content: BLOCK_CARDS_LANDING,
                    accDetails,
                },
            });
        }
    };

    onPressSuspendAccount = () => {
        const { isAccountSuspended } = this.state;
        if (!isAccountSuspended) {
            const { acctNo: number, acctName: name, acctType } = this.state.data;
            const { isJointAccount } = this.props.route.params;
            const accDetails = [
                {
                    number,
                    name,
                    acctType,
                    isJointAccount,
                },
            ];
            this.props.navigation.navigate(SECURE_SWITCH_STACK, {
                screen: DEACTIVATE_M2U_CARDS_CASA_LANDING,
                params: {
                    ...this.props.route?.params,
                    fromModule: BANKINGV2_MODULE,
                    fromScreen: ACCOUNT_DETAILS_SCREEN,
                    content: SUSPEND_CASA_LANDING,
                    accDetails,
                },
            });
        }
    };
    _onDismissCallNow = () => {
        this.setState({ showContactBankModal: false });
    };

    _onPressCallNow = () => {
        this.setState({ showContactBankModal: false });
        utility.contactBankcall("1300886688");
    };

    render() {
        const {
            sslReady,
            data,
            type,
            showMenu,
            menuArray,
            showScrollPicker,
            supplementaryCards,
            maeData,
            showDotDotDot,
            appleWalletEligibility,
            cardDevProv,
            cardWatchProv,
            showRSALoader,
            showRSAChallengeQuestion,
            rsaChallengeQuestion,
            showRSAError,
            isAccountSuspended,
            showContactBankModal,
        } = this.state;

        const isMyGroserAvailable = !!this.props.getModel("myGroserReady")?.code;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={showScrollPicker}
                >
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea={true}
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
                                            text={
                                                type === CC || type === CC_EXPIRED
                                                    ? "Card"
                                                    : "Accounts"
                                            }
                                            fontWeight="600"
                                            fontSize={16}
                                            lineHeight={19}
                                        />
                                    }
                                    headerRightElement={
                                        showDotDotDot && (
                                            <HeaderDotDotDotButton onPress={this._toggleMenu} />
                                        )
                                    }
                                />
                            }
                        >
                            <ScrollView>
                                {isAccountSuspended && (
                                    <View style={styles.killSwitchWarning}>
                                        <Image
                                            source={assets.icWarningYellow}
                                            style={styles.warningIcon}
                                        />
                                        <Typo
                                            fontWeight="600"
                                            fontSize={12}
                                            lineHeight={16}
                                            textAlign="left"
                                            text={
                                                type === CC
                                                    ? BLOCKED_CARD_WARNING_MSG
                                                    : SUSPEND_ACC_WARNING_MSG
                                            }
                                            style={styles.killSwitchWarningText}
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
                                            sslReady={sslReady}
                                            applePay={cardDevProv}
                                            myGroserAvailable={isMyGroserAvailable}
                                            data={data}
                                            maeData={maeData}
                                            type={type}
                                            onAutoTopup={this._onAutoTopupTap}
                                            onPressGridItem={this._onPressGridItem}
                                            onPressViewTxn={this._onPressTxnHistory}
                                            onPressApplePay={this.onPayBtnPress}
                                            isAccountSuspended={isAccountSuspended}
                                            getModel={this.props.getModel}
                                        >
                                            <AccountDetailsTabView
                                                state={this.state}
                                                getModel={this.props.getModel}
                                                navigation={this.props.navigation}
                                                route={this.props.route}
                                                isSupplementary={
                                                    this.props?.route?.params?.isSupplementary ??
                                                    false
                                                }
                                                _navigateToSetPin={this._navigateToSetPin}
                                                _updatePrimary={this._changeWallet}
                                                _onPressBanner={this._onPressBanner}
                                                onPressSuspendAccount={this.onPressSuspendAccount}
                                                onPressBlockCard={this.onPressBlockCard}
                                            />
                                        </AccountDetailsLayout>
                                    )}
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                {cardDevProv && cardWatchProv && (
                                    <View style={styles.bottomBtnContCls}>
                                        <React.Fragment>
                                            <RenderAddedItems />
                                        </React.Fragment>
                                    </View>
                                )}
                                {appleWalletEligibility && !isAccountSuspended && (
                                    <View style={styles.bottomBtnContCls}>
                                        {cardDevProv && !cardWatchProv && (
                                            <React.Fragment>
                                                <RenderWatchItems onPress={this.checkRSA} />
                                            </React.Fragment>
                                        )}
                                        {!cardDevProv && cardWatchProv && (
                                            <React.Fragment>
                                                <RenderDeviceItems onPress={this.checkRSA} />
                                            </React.Fragment>
                                        )}
                                        {!cardDevProv && !cardWatchProv && (
                                            <React.Fragment>
                                                <RenderFooterItems onPress={this.checkRSA} />
                                            </React.Fragment>
                                        )}
                                        <LearnAP onPress={this.aboutApplePay} />
                                    </View>
                                )}
                                {isAccountSuspended && (
                                    <View style={styles.bottomBtnContCls}>
                                        <View style={styles.locateBranchButton}>
                                            <ActionButton
                                                backgroundColor={WHITE}
                                                fullWidth
                                                componentCenter={
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={LOCATE_NEAREST_BRANCH}
                                                    />
                                                }
                                                onPress={this.onClickLocateUsNow}
                                            />
                                        </View>
                                        <View style={styles.callUsNowButton}>
                                            <ActionButton
                                                fullWidth
                                                borderRadius={24}
                                                backgroundColor={DARK_YELLOW}
                                                onPress={this.handleCallUsNow}
                                                componentCenter={
                                                    <Typo
                                                        text={CALL_US_NOW}
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
                    </React.Fragment>
                    <ChallengeQuestion
                        loader={showRSALoader}
                        display={showRSAChallengeQuestion}
                        displyError={showRSAError}
                        questionText={rsaChallengeQuestion}
                        onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                        onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                    />
                    {showContactBankModal && (
                        <ContactBankDialog
                            onClose={this._onDismissCallNow}
                            onParam1Press={this._onPressCallNow}
                        />
                    )}
                </ScreenContainer>

                <TopMenu
                    showTopMenu={showMenu}
                    onClose={this._toggleMenu}
                    navigation={this.props.navigation}
                    menuArray={menuArray}
                    onItemPress={this._handleTopMenuItemPress}
                />
                <ScrollPicker
                    showPicker={showScrollPicker}
                    items={supplementaryCards}
                    itemHeight={60}
                    onCancelButtonPressed={this._onScrollPickerDismissed}
                    renderCustomItems
                    customItemRenderer={this._renderCreditCardScrollPickerItems}
                    onDoneButtonPressed={this._onScrollPickerItemPressed}
                />
                <Popup
                    visible={this.state.isPopupDisplay}
                    title={this.state.popupTitle}
                    description={this.state.popupDesc}
                    onClose={this.onPopupClosePress}
                    primaryAction={{
                        text: this.state.popupPrimaryActionText,
                        onPress: this.onPopupPrimaryActionPress,
                    }}
                />
                <CallUsNowModel
                    visible={this.state.isShowCallUsNow}
                    onClose={this.onCloseCallUsNow}
                />
            </React.Fragment>
        );
    }
}
export default withModelContext(AccountDetailsScreen);

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    callUsNowButton: {
        marginBottom: 16,
    },
    container: {
        alignContent: "center",
        flex: 1,
    },
    killSwitchWarning: {
        marginHorizontal: 24,
        marginTop: 16,
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
    loaderContainer: {
        marginHorizontal: 24,
        marginTop: 16,
    },
    locateBranchButton: {
        marginBottom: 16,
        marginTop: 16,
    },
    warningIcon: {
        marginRight: 10,
        width: 16,
    },
});

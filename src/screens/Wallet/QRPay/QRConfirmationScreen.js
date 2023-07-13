import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, TouchableOpacity, Dimensions, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { debounce } from "lodash";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import { ErrorMessage, Input } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import DynamicImage from "@components/Others/DynamicImage";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    executeQRTransaction,
    verifyQRLimit,
    checkPromoStatus,
    executeQRPushCashBack,
    invokeL3,
    invokeL2,
} from "@services";
import { logEvent } from "@services/analytics";
import { ScanPayGA } from "@services/analytics/analyticsScanPay";

import { BLACK, MEDIUM_GREY, ROYAL_BLUE, WHITE, YELLOW } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import { getShadow } from "@utils/dataModel/utility";
import withFestive from "@utils/withFestive";

import commonStyles from "@styles/main";

import { NETWORK_ERROR, NETWORK_ERROR_MSG_DESC } from "../../../constants/strings";
import { QRAccountSelect } from "./QRAccountSelect";
import { QREnterAmount } from "./QREnterAmount";

const { width } = Dimensions.get("window");

class QRConfirmationScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.object,
        updateModel: PropTypes.func,
        festiveAssets: PropTypes.object,
    };
    static payDisabled = false;

    constructor(props) {
        super(props);
        this.state = {
            referenceText: "",
            enterAmount: false,
            amount: "0.00",
            ref: "",
            payerCustomerKey: "",
            payeeCustomerKey: "",
            payerAccNo: "",
            payeeAccNo: "",
            status: "",
            payeeName: "",
            txnReceipientPhoneNo: "",
            payerName: "",
            payeeGcif: "",
            payeePhoneNo: "",
            dynamic: "",
            accounts: [],
            qrError: false,
            error: "",
            errorMessage: "",
            payAccount: "",
            payAccountType: "",
            payAccountCode: "",
            isMerchant: false,
            cyclicRedunChk: "",
            merchantCity: "",
            txnCurrCode: "",
            postalCode: "",
            merchant: "",
            mobileNo: "",
            terminalId: "",
            merchantCatgCode: "",
            merchantAcctNo: "",
            acquirerFIID: "",
            merchantName: "",
            paymentType: "",
            merchantId: "",
            countryCode: "",
            trxRefNo: "",
            qrType: "",
            applicationId: "",
            txnAmt: "",
            qrVersion: "",
            selectedAccountsDetails: 0,
            enterPromo: false,
            validPromo: false,
            promoAmount: 0,
            promoPct: 0,
            promoType: "",
            promoError: false,
            qrtext: "",
            lookUpRef: "",
            promoCodeM: "",
            qrCategory: "",
            qraccptdSrcOfFund: "",
            creditorAcctTyp: "",
            primary: false,
            wallet: false,
            selectedAccNo: "",
            selectedAccName: "",
            changeAccount: false,
            accChanged: false,
            isMaybank: false,
            isSensorAvailable: false,
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            pinCount: 1,
            loader: false,
            payDisabled: false,
            quickAction: false,
            date: "",
            dailyLimitExceeded: false,
            dailyLimitScreen: "",
        };
        //this.onTextChange = this._onTextChange.bind(this);
        //this.onTextDone = this._onTextDone.bind(this);
        this.onAccountItemClick = this._onAccountItemClick.bind(this);
        this.onAccountItemSwipeChange = this._onAccountItemSwipeChange.bind(this);
        this.onConfirmClickQR = debounce(this._onConfirmClickQR.bind(this), 500);
        this.onConfirmClickPromo = this._onConfirmClickPromo.bind(this);
        this.onAccountListClick = this._onAccountListClick.bind(this);
    }

    async componentDidMount() {
        await this.initData();

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            const { route } = this.props;
            console.log("params > ", route.params);
            const limitUpdate = route.params?.limitUpdate ?? false;
            if (limitUpdate) {
                const state = route.params?.qrState ?? {};
                console.log("QR State > ", state);
                this.setState(state);
                this.setState({ loader: false });
                this.setPayDisabled(false);
            } else {
                this.initData();
            }
        });

        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            this.setPayDisabled(false);
        });

        // Get any applied promo code from promotions module
        this._getAppliedPromoCodeFromPromos();
        if (this.props.route?.params?.crossBorderMerchantData?.foreignCurrency) {
            ScanPayGA.viewScreenPaymentConfirmation(
                this.props.route?.params?.crossBorderMerchantData?.foreignCurrency
            );
        }
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    setPayDisabled = (toggle) => {
        this.payDisabled = toggle;
        this.setState({ payDisabled: toggle });
    };

    async initData() {
        this.setPayDisabled(false);
        const { route } = this.props;
        console.log("params > ", route.params);
        const acctNo = route.params?.accountNo ?? "";
        const accounts = route.params?.accounts ?? [];
        // const selectedAcc = accounts.filter((accData) => {});

        if (accounts?.length) {
            for (let j = 0; j < accounts.length; j++) {
                const accNoT = accounts[j].description;
                const accNameT = accounts[j].title;
                console.log(accNoT);
                accounts[j].isSelected = false;
                if (accNoT.substring(0, 12) === acctNo.substring(0, 12)) {
                    accounts[j].isSelected = true;
                    this.setState({
                        selectedAccNo: accNoT,
                        selectedAccName: accNameT,
                        payAccount: accounts[j].description,
                        payAccountType: accounts[j].type,
                        payAccountCode: accounts[j].code,
                        selectedAccBalance: accounts[j].value,
                    });
                }
            }
        }
        const data = this.getQrStateData(route, accounts, route.params?.merchant === "N");
        console.log("QT", this.state.qrtext);

        console.log("data ", data);

        this.setState({ ...data });
    }

    getQrStateData = (route, accounts, isMerchant) => {
        if (isMerchant)
            return {
                amount: route.params?.amount ?? "",
                txnAmt: route.params?.crossBorderMerchantData?.amount ?? route.params?.txnAmt ?? "",
                ref: route.params?.ref ?? "",
                trxRefNo: route.params?.trxRefNo ?? "",
                payerCustomerKey: route.params?.payerCustomerKey ?? "",
                payeeCustomerKey: route.params?.payeeCustomerKey ?? "",
                payerAccNo: route.params?.payerAccNo ?? "",
                payeeAccNo: route.params?.payeeAccNo ?? "",
                status: route.params?.status ?? "",
                payeeName: route.params?.payeeName ?? "",
                payerName: route.params?.payerName ?? "",
                payeeGcif: route.params?.payeeGcif ?? "",
                payeePhoneNo: route.params?.payeePhoneNo ?? "",
                merchant: route.params?.merchant ?? "",
                dynamic: route.params?.dynamic ?? "",
                qrtext: route.params?.qrtext ?? "",
                isMerchant: false,
                accounts,
                payAccount: route.params?.accountNo ?? "",
                payAccountType: route.params?.accountType ?? "",
                payAccountCode: route.params?.accountCode ?? "",
                primary: route.params?.primary ?? false,
                wallet: route.params?.wallet ?? false,
                isMaybank: route.params?.isMaybank ?? false,
                creditorAcctTyp: route.params?.creditorAcctTyp ?? "",
                acquirerFIID: route.params?.acquirerFIID ?? "",
                lookUpRef: route.params?.lookUpRef ?? "",
                promoCodeM: route.params?.promoCodeM ?? "",
                qrCategory: route.params?.qrCategory ?? "",
                qraccptdSrcOfFund: route.params?.qraccptdSrcOfFund ?? "",
                pymtType: route.params?.pymtType ?? "",
                pinCount: 1,
                payDisabled: false,
                quickAction: route.params?.quickAction ?? false,
                date: route.params?.date ?? Math.random(),
                dailyLimitExceeded: false,
                dailyLimitScreen: "",
            };
        return {
            amount: route.params?.amount ?? "",
            cyclicRedunChk: route.params?.cyclicRedunChk ?? "",
            merchantCity: route.params?.merchantCity ?? "",
            txnCurrCode: route.params?.txnCurrCode ?? "",
            postalCode: route.params?.postalCode ?? "",
            merchant: route.params?.merchant ?? "",
            mobileNo: route.params?.mobileNo ?? "",
            terminalId: route.params?.terminalId ?? "",
            merchantCatgCode: route.params?.merchantCatgCode ?? "",
            merchantAcctNo: route.params?.merchantAcctNo ?? "",
            acquirerFIID: route.params?.acquirerFIID ?? "",
            merchantName: route.params?.merchantName ?? "",
            paymentType: route.params?.paymentType ?? "",
            merchantId: route.params?.merchantId ?? "",
            countryCode: route.params?.countryCode ?? "",
            trxRefNo: route.params?.trxRefNo ?? "",
            qrType: route.params?.qrType ?? "",
            applicationId: route.params?.applicationId ?? "",
            txnAmt: route.params?.crossBorderMerchantData?.amount ?? route.params?.txnAmt ?? "",
            qrVersion: route.params?.qrVersion ?? "",
            dynamic: route.params?.dynamic ?? "",
            qrtext: route.params?.qrtext ?? "",
            lookUpRef: route.params?.lookUpRef ?? "",
            promoCodeM: route.params?.promoCodeM ?? "",
            qrCategory: route.params?.qrCategory ?? "",
            qraccptdSrcOfFund: route.params?.qraccptdSrcOfFund ?? "",
            creditorAcctTyp: route.params?.creditorAcctTyp ?? "",
            isMerchant: true,
            accounts,
            payAccount: route.params?.accountNo ?? "",
            payAccountType: route.params?.accountType ?? "",
            payAccountCode: route.params?.accountCode ?? "",
            primary: route.params?.primary ?? false,
            wallet: route.params?.wallet ?? false,
            isMaybank:
                route.params?.isMaybank ??
                route.params?.crossBorderMerchantData?.acquirerBank === Strings.QR_CROSS_BORDER ??
                false,
            pymtType: route.params?.pymtType ?? "",
            pinCount: 1,
            payDisabled: false,
            quickAction: route.params?.quickAction ?? false,
            date: route.params?.date ?? Math.random(),
            dailyLimitExceeded: false,
            dailyLimitScreen: "",
        };
    };

    changeAccount = async () => {
        const { getModel, updateModel, route } = this.props;
        const { isPostPassword } = getModel("auth");
        const quickAction = route.params?.quickAction ?? false;

        if (isPostPassword) {
            this.setState({ changeAccount: true });
        } else {
            updateModel({
                misc: {
                    isFestiveFlow: quickAction,
                },
            });

            try {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                console.log("result > ", result);
                const { code } = result;
                if (code == 0) {
                    this.setState({ changeAccount: true });
                }
            } catch (err) {
                console.log("err", err);
            }
        }

        logEvent(Strings.FA_SELECT_ACTION, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_SCANPAY_PAY_REVIEWDETAILS,
            [Strings.FA_ACTION_NAME]: Strings.FA_SCANPAY_CHANGEACCOUNT,
            [Strings.FA_CURRENCY]: route.params?.crossBorderMerchantData?.foreignCurrency,
        });
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    closeClick = () => {
        this.setState({
            referenceText: "",
            enterAmount: false,
            amount: "0.00",
            ref: "",
            payerCustomerKey: "",
            payeeCustomerKey: "",
            payerAccNo: "",
            payeeAccNo: "",
            status: "",
            payeeName: "",
            txnReceipientPhoneNo: "",
            payerName: "",
            payeeGcif: "",
            payeePhoneNo: "",
            dynamic: "",
            accounts: [],
            qrError: false,
            error: "",
            errorMessage: "",
            payAccount: "",
            isMerchant: false,
            cyclicRedunChk: "",
            merchantCity: "",
            txnCurrCode: "",
            postalCode: "",
            merchant: "",
            mobileNo: "",
            terminalId: "",
            merchantCatgCode: "",
            merchantAcctNo: "",
            acquirerFIID: "",
            merchantName: "",
            paymentType: "",
            merchantId: "",
            countryCode: "",
            trxRefNo: "",
            qrType: "",
            applicationId: "",
            txnAmt: "",
            qrVersion: "",
            selectedAccountsDetails: 0,
            enterPromo: false,
            validPromo: false,
            promoAmount: 0,
            promoPct: 0,
            promoType: "",
            lookUpRef: "",
            promoCodeM: "",
            qrCategory: "",
            qraccptdSrcOfFund: "",
            pymtType: "",
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            challenge: {},
            token: "",
            quickAction: false,
        });
        console.log("Close");
        if (this.state.primary) {
            if (this.state.wallet) {
                this.props.navigation.navigate(navigationConstant.MORE, {
                    screen: "Wallet",
                });
            } else {
                this.props.navigation.navigate("Tab", {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                });
            }
        } else {
            if (this.state.wallet) {
                this.props.navigation.navigate(navigationConstant.MORE, {
                    screen: "Wallet",
                });
            } else {
                this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                    screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                });
            }
        }
    };

    dailyLimitExceededCall = () => {
        this.setState({ dailyLimitScreen: "Push", dailyLimitExceeded: true });
    };

    _toggleCancelModal = () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
        this.setPayDisabled(false);
        this.forceFail("exceed daily limit");
    };

    _toggleCloseModal = () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
        this.setPayDisabled(false);
    };

    changeDailyLimit = async () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
        const { getModel, updateModel } = this.props;
        const { isPostPassword, isPostLogin } = getModel("auth");

        if (isPostPassword || isPostLogin) {
            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                screen: "QrLimit",
                params: {
                    limitUpdate: true,
                    qrType: this.state.dailyLimitScreen,
                    qrState: this.state,
                },
            });
        } else {
            try {
                this.setState({ loader: true });
                updateModel({
                    auth: { fallBack: true },
                    qrPay: { limitExceeded: true },
                });
                const httpResp = await invokeL2(true);
                const result = httpResp.data;
                console.log("result > ", result);
                const { code } = result;
                const { loginWith } = getModel("auth");
                updateModel({
                    qrPay: { limitExceeded: false },
                });
                if (code == 0) {
                    this.props.navigation.navigate(navigationConstant.QR_STACK, {
                        screen: "QrLimit",
                        params: {
                            limitUpdate: true,
                            qrType: this.state.dailyLimitScreen,
                            qrState: this.state,
                        },
                    });
                } else {
                    if (loginWith == "PIN") {
                        this.props.navigation.navigate(navigationConstant.QR_STACK, {
                            screen: "QrLimit",
                            params: {
                                limitUpdate: true,
                                qrType: this.state.dailyLimitScreen,
                                qrState: this.state,
                            },
                        });
                    } else {
                        this.setPayDisabled(false);
                        showErrorToast({ message: "Authentication failed" });
                    }
                }
            } catch (err) {
                console.log("Limit err", err);
                this.setPayDisabled(false);
                showErrorToast({ message: err.message });
                this.setState({ loader: false });
                updateModel({
                    qrPay: { limitExceeded: false },
                });
            }
        }
    };

    _getAppliedPromoCodeFromPromos = () => {
        console.log("[QRConfirmationScreen]>[promosApplyCode]");

        // Get any applied promo code from promotions module
        try {
            const { getModel } = this.props;
            const { promosApplyCode } = getModel("qrPay");
            //let promosApplyCode = await AsyncStorage.getItem("promosApplyCode");
            console.log(
                "[QRConfirmationScreen]>[promosApplyCode] promosApplyCode: " + promosApplyCode
            );

            if (promosApplyCode != null && promosApplyCode.length > 0) {
                this.setState({
                    referenceText: promosApplyCode,
                    enterPromo: true,
                });

                console.log(
                    "[QRConfirmationScreen]>[promosApplyCode] - PROMO CODE APPLIED! " +
                        promosApplyCode
                );
            }
        } catch (error) {
            console.log("[QRConfirmationScreen]>[promosApplyCode] - Exception: " + error);
        }
    };

    onTextChange = (text) => {
        console.log("textC", text);
        if (text.length > 0) {
            this.setState({ referenceText: text, enterPromo: true });
        } else {
            this.setState({
                referenceText: text,
                enterPromo: false,
                validPromo: false,
                promoAmount: "",
                promoType: "",
                promoPct: 0,
            });
        }
    };

    onTextDone = () => {
        console.log("textD", this.state.referenceText);
        if (this.state.referenceText.length > 0) {
            this.setState({ enterPromo: true });
        } else {
            this.setState({
                enterPromo: false,
                validPromo: false,
                promoAmount: "",
                promoType: "",
                promoPct: 0,
            });
        }
    };

    _onAccountItemClick = (item) => {
        this.setState({ selectedAccountsDetails: item });
    };

    _onAccountListClick = (item) => {
        const tempArray = this.state.accounts;
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i].id = i;
            if (tempArray[i].description === item.description) {
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }
        this.setState({
            accounts: tempArray,
            payAccount: item.description,
            payAccountType: item.type,
            payAccountCode: item.code,
        });
    };

    _onAccountItemSwipeChange = () => {
        //this.setState({ referenceText: text });
    };

    handleRSA = (error, token) => {
        //showErrorToast({ message: err.message });
        //this.forceFail(err.message);

        const { resetModel } = this.props;
        console.log(" ERROR error ==> ", error);
        resetModel(["accounts"]);
        let errors = {};
        let errorsInner = {};
        let errorsIn = {};
        let errorsMid = {};

        errors = error;
        errorsMid = error.error;
        errorsIn = error.error.error;
        errorsInner = error.error.result;

        console.log(" ERROR errors ==> ", errors);
        console.log(" ERROR errorsMid ==> ", errorsMid);
        console.log(" ERROR errorsIn ==> ", errorsIn);
        console.log(" ERROR errorsInner ==> ", errorsInner);
        if (errors.status == 428) {
            console.log("RSA Challenge");
            // Display RSA Challenge Questions if status is 428
            this.setState(() => ({
                challenge: errorsInner.challenge,
                loader: false,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion:
                    errorsInner && errorsInner.challenge && errorsInner.challenge.questionText
                        ? errorsInner.challenge.questionText
                        : errorsMid && errorsMid.message
                        ? errorsMid.message
                        : Strings.WE_FACING_SOME_ISSUE,
                RSACount: this.state.RSACount + 1,
                RSAError: this.state.RSACount > 0,
                token,
            }));
        } else if (errors.status == 423) {
            // Display RSA Account Locked Error Message
            console.log("RSA Lock");
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                },
                () => {
                    // Add Completion
                    let refId = "";
                    let serverDate = "";
                    const msg = errorsInner?.challenge?.errorMessage
                        ? errorsInner.challenge.errorMessage
                        : errorsMid && errorsMid.message
                        ? errorsMid.message
                        : Strings.WE_FACING_SOME_ISSUE;
                    if (errorsInner.paymentRef != null && errorsInner.paymentRef != undefined) {
                        refId = errorsInner.paymentRef;
                        serverDate = errorsInner.serverDate;
                    } else {
                        refId = errorsInner.refId;
                        serverDate = errorsInner.serverDate;
                    }
                    this.forceFail(msg, refId, serverDate);
                }
            );
        } else if (errors.status == 422) {
            // Display RSA Account Locked Error Message
            console.log("RSA Deny");
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loader: false,
                },
                () => {
                    // Add Completion
                    let refId = "";
                    let serverDate = "";
                    const msg =
                        errorsInner && errorsInner.statusDescription
                            ? errorsInner.statusDescription
                            : Strings.WE_FACING_SOME_ISSUE;
                    if (errorsInner != null && errorsInner != undefined) {
                        refId = errorsInner.paymentRef;
                        serverDate = errorsInner.serverDate;
                    }
                    this.forceFail(msg, refId, serverDate, "Deny");
                }
            );
        } else {
            console.log("Failure");
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                },
                () => {
                    let message = "Server communication error";
                    let refId = "";
                    let serverDate = "";
                    let rsaStatus = "";
                    if (errors != null && errors != undefined && errors.message != undefined) {
                        message = errors.message;
                        if (errors.error.result != null && errors.error.result != undefined) {
                            refId = errors.error.result.paymentRef;
                            serverDate = errors.error.result.serverDate;
                            rsaStatus = errors.error.result.rsaStatus;
                        } else {
                            refId = errors.error.refId;
                            serverDate = errors.error.serverDate;
                        }
                    } else if (
                        errorsMid != null &&
                        errorsMid != undefined &&
                        errorsMid.message != undefined
                    ) {
                        message = errorsMid.message;
                        if (errors.error.result != null && errors.error.result != undefined) {
                            refId = errorsMid.result.paymentRef;
                            serverDate = errorsMid.result.serverDate;
                            rsaStatus = errorsMid.result.rsaStatus;
                        } else {
                            refId = errorsMid.refId;
                            serverDate = errorsMid.serverDate;
                        }
                    } else if (errorsInner != null && errorsInner != undefined) {
                        message = errorsInner.statusDescription;
                        if (errorsInner.paymentRef != null && errorsInner.paymentRef != undefined) {
                            refId = errorsInner.paymentRef;
                            serverDate = errorsInner.serverDate;
                            rsaStatus = errorsInner.rsaStatus;
                        } else {
                            refId = errorsInner.refId;
                            serverDate = errorsInner.serverDate;
                        }
                    } else if (
                        errorsIn != null &&
                        errorsIn != undefined &&
                        errorsIn.message != undefined
                    ) {
                        message = errorsIn.message;
                        if (errors.error.result != null && errors.error.result != undefined) {
                            refId = errorsIn.result.paymentRef;
                            serverDate = errorsIn.result.serverDate;
                            rsaStatus = errorsIn.result.rsaStatus;
                        } else {
                            refId = errorsIn.refId;
                            serverDate = errorsIn.serverDate;
                        }
                    }

                    this.forceFail(message, refId, serverDate, rsaStatus);
                }
            );
        }
    };

    p2pCall = (challenge) => {
        console.log("P2P < ", this.state);
        console.log("P2P challenge < ", challenge);
        const { getModel } = this.props;
        const { authenticated } = getModel("qrPay");
        const { isPostLogin } = getModel("auth");
        const { isFestivalReady } = getModel("misc");
        const limitApproved = authenticated ? true : isPostLogin ? true : false;
        const mode = isPostLogin ? "P" : "N";
        const deviceInfo = this.props.getModel("device");
        const mobileSDKData = Utility.getDeviceRSAInformation(
            deviceInfo.deviceInformation,
            DeviceInfo
        );
        executeQRTransaction(
            "/qrpay/duitnow/payTransactionDuitQR",
            JSON.stringify({
                fromAccountNo: this.state.payAccount,
                toAccountNo: this.state.payeeAccNo,
                merchantName: this.state.payeeName,
                paymentAmount: this.state.amount.replace(",", ``),
                transactionRefNo: this.state.trxRefNo,
                qrtext: this.state.qrtext,
                limitApproved,
                fromAccountType: this.state.payAccountType,
                authMode: mode,
                acquirerId: this.state.acquirerFIID,
                qrCategory: this.state.qrCategory,
                fromAcctCode: this.state.payAccountCode,
                beneID: this.state.merchantId,
                qrAccptdSrcOfFund: this.state.qraccptdSrcOfFund,
                qrPromCod: this.state.promoCodeM,
                lookUpRef: this.state.lookUpRef,
                qrType: this.state.qrType,
                payerName: this.state.payerName,
                payeeName: this.state.payeeName,
                payeeCustomerKey: this.state.payeeCustomerKey,
                merchantId: this.state.merchantId,
                pymtType: this.state.pymtType,
                specialOccasion: isFestivalReady,
                mobileSDKData,
                challenge,
            })
        )
            .then(async (response) => {
                console.log("RES", response);
                const qrObject = await response.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null) {
                    console.log(qrObject);

                    if (qrObject.result.qrCategory === "true") {
                        executeQRPushCashBack(
                            "/cashback/cashBackStatus",
                            JSON.stringify({
                                txnRefNo: qrObject.result.paymentRef,
                            })
                        )
                            .then(async (res) => {
                                const qrcbObject = await res.data;
                                if (qrcbObject !== null) {
                                    console.log("QrcbObject", qrcbObject);
                                    this.props.navigation.navigate("QrStack", {
                                        screen: "QrAck",
                                        params: {
                                            primary: this.state.primary,
                                            wallet: this.state.wallet,
                                            authRequired: false,
                                            fallBack: false,
                                            trxRef: qrObject.result.trxRef,
                                            paymentRef: qrObject.result.paymentRef,
                                            trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                                            amount: qrObject.result.payAmount,
                                            payeeAccountNo: qrObject.result.payeeAccountNo,
                                            payeeName: qrObject.result.payeeName,
                                            merchant: this.state.merchant,
                                            code: qrObject.code.toString(),
                                            message: qrObject.result.statusDescription,
                                            validPromo: this.state.validPromo,
                                            promoPct: this.state.promoPct,
                                            promoType: this.state.promoType,
                                            referenceText: this.state.referenceText,
                                            isMaybank: this.state.isMaybank,
                                            regFlow: false,
                                            pull: "N",
                                            cashBackAmt: qrcbObject.result.cashBackAmt,
                                            showCB: true,
                                            quickAction: isFestivalReady,
                                            // quickAction: this.state.quickAction,
                                            s2w: qrObject.result?.s2w,
                                            chanceScreen: true,
                                            showChance: false,
                                        },
                                    });
                                } else {
                                    this.props.navigation.navigate("QrStack", {
                                        screen: "QrAck",
                                        params: {
                                            primary: this.state.primary,
                                            wallet: this.state.wallet,
                                            authRequired: false,
                                            fallBack: false,
                                            trxRef: qrObject.result.trxRef,
                                            paymentRef: qrObject.result.paymentRef,
                                            trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                                            amount: qrObject.result.payAmount,
                                            payeeAccountNo: qrObject.result.payeeAccountNo,
                                            payeeName: qrObject.result.payeeName,
                                            merchant: this.state.merchant,
                                            code: qrObject.code.toString(),
                                            message: qrObject.result.statusDescription,
                                            validPromo: this.state.validPromo,
                                            promoPct: this.state.promoPct,
                                            promoType: this.state.promoType,
                                            referenceText: this.state.referenceText,
                                            isMaybank: this.state.isMaybank,
                                            regFlow: false,
                                            pull: "N",
                                            showCB: false,
                                            quickAction: isFestivalReady,
                                            // quickAction: this.state.quickAction,
                                            s2w: qrObject.result?.s2w,
                                            chanceScreen: true,
                                            showChance: false,
                                        },
                                    });
                                }
                            })
                            .catch((err) => {
                                this.setPayDisabled(false);
                                console.log("ERR", err);
                                this.handleRSA(err);
                            });
                    } else {
                        this.props.navigation.navigate("QrStack", {
                            screen: "QrAck",
                            params: {
                                primary: this.state.primary,
                                wallet: this.state.wallet,
                                authRequired: false,
                                fallBack: false,
                                trxRef: qrObject.result.trxRef,
                                paymentRef: qrObject.result.paymentRef,
                                trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                                amount: qrObject.result.payAmount,
                                payeeAccountNo: qrObject.result.payeeAccountNo,
                                payeeName: qrObject.result.payeeName,
                                merchant: this.state.merchant,
                                code: qrObject.code.toString(),
                                message: qrObject.result.statusDescription,
                                validPromo: this.state.validPromo,
                                promoPct: this.state.promoPct,
                                promoType: this.state.promoType,
                                referenceText: this.state.referenceText,
                                isMaybank: this.state.isMaybank,
                                regFlow: false,
                                pull: "N",
                                showCB: false,
                                quickAction: this.props.route.params?.quickAction ?? false,
                                // quickAction: this.state.quickAction,
                                s2w: qrObject.result?.s2w,
                                chanceScreen: true,
                                showChance: false,
                            },
                        });
                    }
                } else {
                    this.setPayDisabled(false);
                }
                this.setState({ loader: false });
            })
            .catch((err) => {
                this.setPayDisabled(false);
                console.log("ERR", err);
                this.handleRSA(err);
            });

        const { updateModel } = this.props;
        updateModel({
            qrPay: { limitExceeded: false },
        });
    };

    gotToQrAck = (params) => {
        this.props.navigation.navigate("QrStack", {
            screen: "QrAck",
            params,
        });
    };

    merchantCall = async (challenge) => {
        console.log("MERCHANT < ", this.state);
        console.log("MERCHANT challenge < ", challenge);
        try {
            const {
                qrPay: { authenticated, qrtext },
                auth: { isPostLogin },
                misc: { isFestivalReady },
                device: { deviceInformation },
            } = this.props.getModel(["qrPay", "auth", "misc", "device"]);
            const limitApproved = authenticated || isPostLogin;
            const mode = isPostLogin ? "P" : "N";
            const mobileSDKData = Utility.getDeviceRSAInformation(deviceInformation, DeviceInfo);
            const { crossBorderMerchantData } = this.props.route?.params ?? {};
            const qrCrossBorderParams = crossBorderMerchantData
                ? {
                      rppRefNo: crossBorderMerchantData?.rppRefNo,
                      lookupRef: crossBorderMerchantData?.rppRefNo,
                      rmAmount: String(
                          crossBorderMerchantData?.dynamic === "Y"
                              ? crossBorderMerchantData?.amount
                              : (1 / parseFloat(crossBorderMerchantData?.exchangeRate)) *
                                    parseFloat(crossBorderMerchantData?.amount.replace(",", ""))
                      ),
                      foreignAmount: (crossBorderMerchantData?.dynamic === "Y"
                          ? crossBorderMerchantData?.foreignAmount
                          : crossBorderMerchantData?.amount
                      )?.replace(",", ""),
                      foreignCurrency: crossBorderMerchantData?.foreignCurrency,
                      exchangeRate: crossBorderMerchantData?.exchangeRate,
                  }
                : {};

            const params = JSON.stringify({
                ...qrCrossBorderParams,
                fromAccountNo: this.state.payAccount,
                toAccountNo: this.state.merchantAcctNo,
                merchantName: this.state.merchantName,
                paymentAmount: crossBorderMerchantData
                    ? qrCrossBorderParams.rmAmount
                    : this.state.validPromo
                    ? this.state.promoAmount.replace(",", ``)
                    : this.state.txnAmt.replace(",", ``),
                transactionRefNo: this.state.trxRefNo,
                qrtext: this.state.qrtext || qrtext,
                limitApproved,
                fromAccountType: this.state.payAccountType,
                authMode: mode,
                acquirerId: this.state.acquirerFIID,
                qrCategory: this.state.qrCategory,
                fromAcctCode: this.state.payAccountCode,
                beneID: this.state.merchantId,
                qrAccptdSrcOfFund: this.state.qraccptdSrcOfFund,
                qrPromCod: this.state.promoCodeM,
                lookUpRef: this.state.lookUpRef,
                qrType: this.state.qrType,
                payerName: this.state.payerName,
                payeeName: this.state.payeeName,
                payeeCustomerKey: this.state.payeeCustomerKey,
                merchantId: this.state.merchantId,
                pymtType: this.state.pymtType,
                specialOccasion: isFestivalReady,
                mobileSDKData,
                challenge,
            });
            const response = await executeQRTransaction(
                "/qrpay/duitnow/payTransactionDuitQR",
                params
            );
            const qrObject = response?.data;
            console.log("Qrobject", qrObject);
            if (qrObject) {
                console.log(qrObject);

                if (qrObject?.result?.qrCategory === "true") {
                    try {
                        const res = await executeQRPushCashBack(
                            "/cashback/cashBackStatus",
                            JSON.stringify({
                                txnRefNo: qrObject.result.paymentRef,
                            })
                        );
                        const qrcbObject = res?.data;
                        const navParams =
                            qrcbObject !== null
                                ? {
                                      primary: this.state.primary,
                                      wallet: this.state.wallet,
                                      authRequired: false,
                                      fallBack: false,
                                      trxRef: qrObject.result.trxRef,
                                      paymentRef: qrObject.result.paymentRef,
                                      trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                                      amount: qrObject.result.payAmount,
                                      payeeAccountNo: qrObject.result.payeeAccountNo,
                                      payeeName: qrObject.result.payeeName,
                                      merchant: this.state.merchant,
                                      code: qrObject.code.toString(),
                                      message: qrObject.result.statusDescription,
                                      validPromo: this.state.validPromo,
                                      promoPct: this.state.promoPct,
                                      promoType: this.state.promoType,
                                      referenceText: this.state.referenceText,
                                      isMaybank: this.state.isMaybank,
                                      regFlow: false,
                                      pull: "N",
                                      cashBackAmt: qrcbObject.result.cashBackAmt,
                                      showCB: true,
                                      quickAction: this.state.quickAction,
                                      s2w: qrObject.result?.s2w,
                                      chanceScreen: true,
                                      showChance: false,
                                  }
                                : {
                                      primary: this.state.primary,
                                      wallet: this.state.wallet,
                                      authRequired: false,
                                      fallBack: false,
                                      trxRef: qrObject.result.trxRef,
                                      paymentRef: qrObject.result.paymentRef,
                                      trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                                      amount: qrObject.result.payAmount,
                                      payeeAccountNo: qrObject.result.payeeAccountNo,
                                      payeeName: qrObject.result.payeeName,
                                      merchant: this.state.merchant,
                                      code: qrObject.code.toString(),
                                      message: qrObject.result.statusDescription,
                                      validPromo: this.state.validPromo,
                                      promoPct: this.state.promoPct,
                                      promoType: this.state.promoType,
                                      referenceText: this.state.referenceText,
                                      isMaybank: this.state.isMaybank,
                                      regFlow: false,
                                      pull: "N",
                                      showCB: false,
                                      quickAction: this.state.quickAction,
                                      s2w: qrObject.result?.s2w,
                                      chanceScreen: true,
                                      showChance: false,
                                  };
                        this.gotToQrAck({
                            showCB: qrcbObject !== null,
                            crossBorderMerchantData:
                                this.props.route?.params?.crossBorderMerchantData,
                            ...navParams,
                        });
                        return;
                    } catch (error) {
                        this.setPayDisabled(false);
                        console.log("ERR", error);
                        this.handleRSA(error);
                    }
                } else {
                    this.gotToQrAck({
                        primary: this.state.primary,
                        wallet: this.state.wallet,
                        authRequired: false,
                        fallBack: false,
                        trxRef: qrObject.result.trxRef,
                        paymentRef: qrObject.result.paymentRef,
                        trxDateTimeFomat: qrObject.result.trxDateTimeFomat,
                        amount: qrObject.result.payAmount,
                        payeeAccountNo: qrObject.result.payeeAccountNo,
                        payeeName: qrObject.result.payeeName,
                        merchant: this.state.merchant,
                        code: qrObject.code.toString(),
                        message: qrObject.result.statusDescription,
                        validPromo: this.state.validPromo,
                        promoPct: this.state.promoPct,
                        promoType: this.state.promoType,
                        referenceText: this.state.referenceText,
                        isMaybank: this.state.isMaybank,
                        regFlow: false,
                        pull: "N",
                        showCB: false,
                        quickAction: this.state.quickAction,
                        s2w: qrObject.result?.s2w,
                        chanceScreen: true,
                        showChance: false,
                        crossBorderMerchantData: this.props.route?.params?.crossBorderMerchantData,
                    });
                    return;
                }
            } else {
                this.setPayDisabled(false);
            }
            this.setState({ loader: false });
        } catch (err) {
            this.setPayDisabled(false);
            console.log("ERR", err);
            this.handleRSA(err);
        } finally {
            const { updateModel } = this.props;
            updateModel({
                qrPay: { limitExceeded: false },
            });
        }
    };

    forceFail = (message, paymentRef, trxDateTimeFomat, rsaStatus) => {
        if (message === NETWORK_ERROR) message = NETWORK_ERROR_MSG_DESC;
        this.props.navigation.navigate("QrStack", {
            screen: "QrAck",
            params: {
                primary: this.state.primary,
                wallet: this.state.wallet,
                authRequired: false,
                fallBack: false,
                merchant: this.state.merchant,
                code: "1",
                message,
                paymentRef,
                trxDateTimeFomat,
                validPromo: this.state.validPromo,
                promoPct: this.state.promoPct,
                promoType: this.state.promoType,
                referenceText: this.state.referenceText,
                rsaStatus,
                isMaybank: this.state.isMaybank,
                regFlow: false,
                quickAction: this.state.quickAction,
                chanceScreen: false,
                showChance: false,
            },
        });
        this.setState({ loader: false });
        const { updateModel } = this.props;
        updateModel({
            qrPay: { limitExceeded: false },
        });
    };

    _onConfirmClickPromo = async () => {
        checkPromoStatus(
            "/qrpay/merchant/verifyPromo",
            JSON.stringify({
                qrtext: this.state.qrtext,
                amount: this.state.txnAmt,
                promoCode: this.state.referenceText,
                fromAccount: this.state.payAccount,
            })
        )
            .then(async (response) => {
                console.log("RES", response);
                const promoObject = await response.data;
                console.log("Qrobject", promoObject);
                if (promoObject !== null) {
                    if (promoObject.code === 0) {
                        this.setState({
                            validPromo: true,
                            merchantAcctNo: promoObject.result.account,
                            promoAmount: promoObject.result.amount,
                            promoType: "M",
                            trxRefNo: promoObject.result.trxRefNo,
                            promoPct: 0,
                            enterPromo: false,
                        });
                        showSuccessToast({ message: "Promo code applied" });
                    } else {
                        this.setState({
                            validPromo: false,
                            promoAmount: 0,
                            promoType: "M",
                            promoPct: 0,
                            enterPromo: true,
                        });
                        showErrorToast({ message: promoObject.message });
                    }
                } else {
                    this.setState({
                        validPromo: false,
                        promoAmount: 0,
                        promoType: "M",
                        promoPct: 0,
                        enterPromo: true,
                    });
                    showErrorToast({ message: "Error in promo code" });
                }
                Keyboard.dismiss();
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    handleLimitExceed = async () => {
        try {
            this.setState({ loader: true });
            const { updateModel } = this.props;
            updateModel({
                auth: { fallBack: true },
                qrPay: { limitExceeded: true },
            });
            const httpResp = await invokeL2(true);
            const result = httpResp.data;
            console.log("result > ", result);
            const { code } = result;
            const { getModel } = this.props;
            const { loginWith } = getModel("auth");
            updateModel({
                qrPay: { limitExceeded: false },
            });
            if (code == 0) {
                if (this.state.isMerchant) {
                    this.merchantCall();
                } else {
                    this.p2pCall();
                }
            } else {
                if (loginWith == "PIN") {
                    //this.forceFail("Limit not approved");
                    if (this.state.isMerchant) {
                        this.merchantCall();
                    } else {
                        this.p2pCall();
                    }
                } else {
                    this.setPayDisabled(false);
                    showErrorToast({ message: "Authentication failed" });
                }
            }
        } catch (err) {
            console.log("Limit err", err);
            this.setPayDisabled(false);
            if (err.message === "login cancelled") {
                const { getModel } = this.props;
                const { loginWith } = getModel("auth");
                console.log(loginWith);
                if (this.state.pinCount === 3) {
                    // if (loginWith == "PIN") {
                    //     if (this.state.isMerchant) {
                    //         this.merchantCall();
                    //     } else {
                    //         this.p2pCall();
                    //     }
                    // } else {
                    //     showErrorToast({ message: "Authentication failed" });
                    // }
                    this.forceFail(
                        "Sorry, you've exceeded the number of tries for your PIN. Please try again later."
                    );
                } else {
                    if (loginWith === "PIN") {
                        showErrorToast({
                            message: "You've entered the wrong PIN. Please try again.",
                        });
                        this.setState({ pinCount: this.state.pinCount + 1 });
                    } else {
                        showErrorToast({ message: err.message });
                    }
                }
            } else {
                showErrorToast({ message: err.message });
            }
            this.setState({ loader: false });
            const { updateModel } = this.props;
            updateModel({
                qrPay: { limitExceeded: false },
            });
        }
    };

    _onConfirmClickQR = async () => {
        console.log("_onConfirmClickQR", this.props);

        if (!this.payDisabled) {
            this.setPayDisabled(true);
            const { getModel } = this.props;
            const { isPostLogin, isPostPassword } = getModel("auth");
            const mode = isPostPassword ? "P" : isPostLogin ? "P" : "N";
            const { updateModel } = this.props;
            updateModel({
                qrPay: { authenticated: false },
            });

            const { crossBorderMerchantData } = this.props.route?.params ?? {};
            const tempRMAmount = crossBorderMerchantData?.amount
                ? numeral(
                      (1 / parseFloat(crossBorderMerchantData?.exchangeRate)) *
                          parseFloat(crossBorderMerchantData?.amount.replace(/,/g, ""))
                  ).format("0,0.00")
                : null;
            const qrAmount = tempRMAmount
                ? tempRMAmount?.replace(",", "")
                : this.state.merchant === "Y"
                ? this.state.validPromo
                    ? this.state.promoAmount
                    : this.state.txnAmt
                : this.state.amount;

            const queryQrl =
                "/qrpay/v2/checkAmountLimit?amount=" +
                qrAmount.replace(",", ``) +
                "&authMode=" +
                mode +
                "&trxRefNo=" +
                this.state.trxRefNo;
            console.log("queryQrl " + queryQrl);
            if (this.state.payAccount !== "") {
                verifyQRLimit(queryQrl)
                    .then(async (response) => {
                        console.log("RES", response);
                        const limitObject = await response.data;
                        console.log("Qrobject", limitObject);
                        if (limitObject != null) {
                            if (limitObject?.code === 0) {
                                if (this.state.isMerchant) {
                                    this.merchantCall();
                                } else {
                                    this.p2pCall();
                                }
                            } else if (limitObject?.code === 2000) {
                                this.handleLimitExceed();
                            } else if (limitObject?.code === 1500) {
                                this.dailyLimitExceededCall();
                            } else if (limitObject?.code === 2500 || limitObject?.code === 1000) {
                                this.forceFail(
                                    limitObject?.message,
                                    limitObject?.result.trxRefNo,
                                    limitObject?.result.serverDate
                                );
                                this.setPayDisabled(false);
                            } else {
                                this.setPayDisabled(false);
                                showErrorToast({ message: limitObject?.message });
                            }
                        } else {
                            this.setPayDisabled(false);
                            showErrorToast({ message: limitObject?.message });
                        }
                    })
                    .catch((err) => {
                        this.setPayDisabled(false);
                        console.log("ERR", err);
                        showErrorToast({ message: err.message });
                    });
            } else {
                showErrorToast({ message: "Please Select any Account to Pay" });
                this.setPayDisabled(false);
            }
        }
    };

    accountSelect = (accounts) => {
        for (let j = 0; j < accounts.length; j++) {
            if (accounts[j].isSelected) {
                this.setState({
                    selectedAccNo: accounts[j].description || "",
                    selectedAccName: accounts[j].title || "",
                    payAccount: accounts[j].description || "",
                    payAccountType: accounts[j].type || "",
                    payAccountCode: accounts[j].code || "",
                });
            }
        }
        this.setState({ accounts, changeAccount: false, accChanged: true });
    };

    accountCancel = () => {
        this.setState({ changeAccount: false });
    };

    customPopup = () => {
        return (
            <QRAccountSelect
                onConfirm={this.accountSelect}
                onCancel={this.accountCancel}
                accounts={this.state.accounts}
                type=""
                navigation={this.props.navigation}
            />
        );
    };

    onChallengeQuestionSubmitPress = (answer) => {
        const { challenge } = this.state;
        const challengeObj = {
            ...challenge,
            answer,
        };
        console.log(
            "[QRConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeObj After : ",
            challengeObj
        );
        this.setState({ RSAError: false, isRSARequired: false });
        if (this.state.isMerchant) {
            this.merchantCall(challengeObj);
        } else {
            this.p2pCall(challengeObj);
        }
    };

    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false, isRSARequired: false });
    };

    render() {
        const { getModel, festiveAssets, route } = this.props;
        const { crossBorderMerchantData } = route?.params ?? {};
        const { isTapTasticReady } = getModel("misc");

        if (this.state.enterAmount == true) {
            return (
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={this.state.loader}
                >
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            // header={
                            //     <HeaderLayout
                            //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            //     />
                            // }
                        >
                            <QREnterAmount
                                fxData={crossBorderMerchantData}
                                amount={
                                    this.state.isMerchant ? this.state.txnAmt : this.state.amount
                                }
                                onDonePress={(amount) => {
                                    console.log("Amount > ", amount);

                                    if (amount >= 0.01 && amount <= 1000.0) {
                                        this.setState(
                                            this.state.isMerchant
                                                ? {
                                                      amountSet: true,
                                                      txnAmt: amount,
                                                      enterAmount: false,
                                                  }
                                                : {
                                                      amountSet: true,
                                                      amount,
                                                      enterAmount: false,
                                                  }
                                        );
                                    } else {
                                        this.setState({
                                            enterAmount: true,
                                        });
                                        showErrorToast({
                                            message: "Amount must be between RM0.01 and RM1,000",
                                        });
                                    }
                                }}
                                onBackPress={() => {
                                    this.setState({ enterAmount: false });
                                }}
                            />
                            {this.state.qrError === true ? (
                                <ErrorMessage
                                    onClose={() => {
                                        this.setState({ qrError: false });
                                    }}
                                    title={Strings.APP_NAME_ALERTS}
                                    description={
                                        this.state.errorMessage != undefined ||
                                        this.state.errorMessage != null
                                            ? this.state.errorMessage
                                            : Strings.WE_FACING_SOME_ISSUE
                                    }
                                    showOk={true}
                                    onOkPress={() => {
                                        this.setState({ qrError: false });
                                    }}
                                />
                            ) : null}
                            {/* </View> */}
                        </ScreenLayout>
                    </>
                </ScreenContainer>
            );
        } else if (this.state.changeAccount) {
            return (
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={this.state.loader}
                >
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            // header={
                            //     <HeaderLayout
                            //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            //     />
                            // }
                        >
                            {/* <Popup
                                visible={this.state.changeAccount}
                                title=""
                                ContentComponent={this.customPopup}
                                onClose={this.accountCancel}
                            /> */}
                            <QRAccountSelect
                                onConfirm={this.accountSelect}
                                onCancel={this.accountCancel}
                                accounts={this.state.accounts}
                                type="push"
                                navigation={this.props.navigation}
                            />
                        </ScreenLayout>
                    </>
                </ScreenContainer>
            );
        }

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.loader}
                analyticScreenName={
                    !this.props.route?.params?.crossBorderMerchantData?.foreignCurrency
                        ? Strings.FA_SCANPAY_PAY_REVIEWDETAILS
                        : null
                }
            >
                <>
                    <CacheeImageWithDefault
                        resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                        style={styles.imgBg}
                        image={festiveAssets?.qrPay.background}
                    />
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <View>
                                <HeaderLayout
                                    horizontalPaddingMode="custom"
                                    horizontalPaddingCustomLeftValue={16}
                                    horizontalPaddingCustomRightValue={16}
                                    headerLeftElement={
                                        <View style={styles.headerBtnContainer}>
                                            <HeaderBackButton onPress={this.onBackPress} />
                                        </View>
                                    }
                                    headerCenterElement={
                                        <Typo
                                            text="Scan & Pay"
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={32}
                                            color={isTapTasticReady && BLACK}
                                        />
                                    }
                                    headerRightElement={
                                        <View style={styles.headerBtnContainer}>
                                            <HeaderCloseButton
                                                onPress={this.closeClick}
                                                // isWhite={isTapTasticReady}
                                            />
                                        </View>
                                    }
                                />
                            </View>
                        }
                        useSafeArea
                    >
                        <KeyboardAwareScrollView>
                            <View style={styles.main}>
                                <View style={styles.mainSubContainer}>
                                    <View style={styles.subContainer}>
                                        {this.state.isMerchant ||
                                        crossBorderMerchantData?.acquirerBank ===
                                            Strings.QR_CROSS_BORDER ? (
                                            <DynamicImage
                                                item={{
                                                    imageName:
                                                        this.state.isMaybank ||
                                                        crossBorderMerchantData?.acquirerBank ===
                                                            Strings.QR_CROSS_BORDER
                                                            ? "qrMerchant"
                                                            : "qrDuitNow",
                                                }}
                                            />
                                        ) : (
                                            <DynamicImage
                                                item={
                                                    this.state.isMaybank
                                                        ? {
                                                              shortName: this.state.payeeName,
                                                          }
                                                        : {
                                                              imageName: "qrDuitNow",
                                                          }
                                                }
                                            />
                                        )}
                                    </View>

                                    <View style={styles.midContainer}>
                                        <View style={styles.midSubContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="500"
                                                lineHeight={18}
                                                text={
                                                    this.state.isMerchant
                                                        ? this.state.merchantName.replace(
                                                              /\s+/g,
                                                              " "
                                                          )
                                                        : this.state.payeeName.replace(/\s+/g, " ")
                                                }
                                            />
                                        </View>

                                        <View style={styles.accNoContainer}>
                                            {!this.state.isMerchant && (
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    text={this.state.payeeAccNo
                                                        .replace(/[^\dA-Z]/g, "")
                                                        .replace(/(.{4})/g, "$1 ")
                                                        .trim()}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.subContainer2}>
                                    {this.state.isMerchant ? (
                                        <View>
                                            <View style={styles.amountContainer}>
                                                {this.state.dynamic == "N" ? (
                                                    <TouchableOpacity
                                                        testID="btnEditAmount"
                                                        accessibilityLabel="btnEditAmount"
                                                        onPress={() => {
                                                            this.setState({
                                                                enterAmount: true,
                                                                enterPromo: false,
                                                                validPromo: false,
                                                                promoAmount: "",
                                                                promoType: "",
                                                                promoPct: 0,
                                                                referenceText: "",
                                                            });
                                                        }}
                                                    >
                                                        <Typo
                                                            fontSize={24}
                                                            fontWeight="bold"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            color={ROYAL_BLUE}
                                                            lineHeight={31}
                                                            text={`${
                                                                crossBorderMerchantData?.foreignCurrency
                                                                    ? crossBorderMerchantData?.foreignCurrency
                                                                    : "RM"
                                                            } ${Utility.floatWithCommas(
                                                                this.state.validPromo
                                                                    ? this.state.promoAmount
                                                                    : this.state.txnAmt
                                                            )}`}
                                                        />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Typo
                                                        fontSize={24}
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={31}
                                                        color={
                                                            crossBorderMerchantData
                                                                ? ROYAL_BLUE
                                                                : BLACK
                                                        }
                                                        text={`${
                                                            crossBorderMerchantData?.foreignCurrency ??
                                                            "RM"
                                                        } ${Utility.floatWithCommas(
                                                            this.state.validPromo
                                                                ? this.state.promoAmount
                                                                : (crossBorderMerchantData?.dynamic ===
                                                                  "Y"
                                                                      ? crossBorderMerchantData?.foreignAmount
                                                                      : crossBorderMerchantData?.amount
                                                                  )?.replace(",", "") ??
                                                                      this.state.txnAmt
                                                        )}`}
                                                    />
                                                )}
                                            </View>
                                            {crossBorderMerchantData?.amount && (
                                                <View style={styles.block}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        color={ROYAL_BLUE}
                                                        text={`MYR ${numeral(
                                                            crossBorderMerchantData?.dynamic === "Y"
                                                                ? parseFloat(
                                                                      crossBorderMerchantData?.amount?.replace(
                                                                          ",",
                                                                          ""
                                                                      )
                                                                  )
                                                                : (1 /
                                                                      parseFloat(
                                                                          crossBorderMerchantData?.exchangeRate
                                                                      )) *
                                                                      parseFloat(
                                                                          crossBorderMerchantData?.amount.replace(
                                                                              ",",
                                                                              ""
                                                                          )
                                                                      )
                                                        ).format("0,0.00")}`}
                                                    />
                                                </View>
                                            )}
                                            {crossBorderMerchantData?.foreignCurrency && (
                                                <View style={styles.blockPadding}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="400"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        text={`${
                                                            crossBorderMerchantData?.foreignCurrency
                                                        } 1.00 = MYR ${numeral(
                                                            String(
                                                                1 /
                                                                    parseFloat(
                                                                        crossBorderMerchantData?.exchangeRate
                                                                    )
                                                            )
                                                        ).format("0,0.000000")}`}
                                                    />
                                                </View>
                                            )}

                                            <View style={styles.selectedAccContainer}>
                                                {!!(
                                                    this.state.selectedAccNo &&
                                                    this.state.selectedAccName
                                                ) && (
                                                    <View style={styles.selectedAccDetailContainer}>
                                                        <View
                                                            style={styles.selectedAccSubContainer}
                                                        >
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                textAlign="left"
                                                                text={this.state.selectedAccName}
                                                            />
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                style={styles.selectedAccNoText}
                                                                textAlign="left"
                                                                text={DataModel.maskAccount(
                                                                    this.state.selectedAccNo
                                                                )}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                                <View style={styles.changeAccountBtn}>
                                                    {this.state.isMaybank ||
                                                    !!crossBorderMerchantData ? (
                                                        <TouchableOpacity
                                                            onPress={this.changeAccount}
                                                        >
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                color={ROYAL_BLUE}
                                                                lineHeight={18}
                                                                text="Change"
                                                            />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View />
                                                    )}
                                                </View>
                                            </View>

                                            {this.state.validPromo ? (
                                                <View style={styles.promoInputContainer}>
                                                    {this.state.promoType === "P" ? (
                                                        <View>
                                                            <Typo
                                                                fontSize={16}
                                                                fontWeight="500"
                                                                lineHeight={20}
                                                                style={styles.lineThrough}
                                                                text={`RM ${Utility.floatWithCommas(
                                                                    this.state.txnAmt
                                                                )}`}
                                                            />
                                                        </View>
                                                    ) : (
                                                        <View>
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="500"
                                                                color={BLACK}
                                                                lineHeight={16}
                                                                textAlign="center"
                                                                style={styles.lineThrough}
                                                                text={`RM ${Utility.floatWithCommas(
                                                                    this.state.txnAmt
                                                                )}`}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : (
                                        <View>
                                            <View style={styles.amountContainer}>
                                                {this.state.dynamic == "N" ? (
                                                    <TouchableOpacity
                                                        testID="btnEditAmount"
                                                        accessibilityLabel="btnEditAmount"
                                                        onPress={() => {
                                                            this.setState({
                                                                enterAmount: true,
                                                            });
                                                        }}
                                                    >
                                                        <Typo
                                                            fontSize={24}
                                                            fontWeight="bold"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            color={ROYAL_BLUE}
                                                            lineHeight={31}
                                                            text={`RM ${Utility.floatWithCommas(
                                                                this.state.amount
                                                            )}`}
                                                        />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Typo
                                                        fontSize={24}
                                                        fontWeight="bold"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={31}
                                                        text={`RM ${Utility.floatWithCommas(
                                                            this.state.amount
                                                        )}`}
                                                    />
                                                )}
                                            </View>
                                            <View style={styles.selectedAccContainer}>
                                                <View
                                                    style={{
                                                        flex: 2,
                                                        borderTopRightRadius: 50,
                                                        borderBottomRightRadius: 50,
                                                        justifyContent: "center",
                                                        flexDirection: "column",
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    <View style={{ marginLeft: 20 }}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            color={BLACK}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            text={this.state.selectedAccName}
                                                        />
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            style={{ marginTop: 10 }}
                                                            textAlign="left"
                                                            text={DataModel.maskAccount(
                                                                this.state.selectedAccNo
                                                            )}
                                                        />
                                                    </View>
                                                </View>

                                                <View
                                                    style={{
                                                        flex: 1,
                                                        justifyContent: "center",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {this.state.isMaybank ? (
                                                        <TouchableOpacity
                                                            onPress={this.changeAccount}
                                                        >
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                color={ROYAL_BLUE}
                                                                lineHeight={18}
                                                                text="Change"
                                                            />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        marginTop: 5,
                                    }}
                                />

                                {crossBorderMerchantData ||
                                (this.state.isMerchant && this.state.isMaybank) ? (
                                    <View style={styles.promoContainer}>
                                        <View style={styles.promoSubContainer}>
                                            <View style={styles.promoFieldContainer}>
                                                <Typo
                                                    fontSize={15}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Promo"
                                                />
                                            </View>
                                            <View style={styles.inputReferenceContainer}>
                                                <Input
                                                    label=""
                                                    style={[
                                                        styles.inputReference,
                                                        commonStyles.font,
                                                    ]}
                                                    testID="inputReference"
                                                    accessibilityLabel="inputReference"
                                                    secureTextEntry="false"
                                                    maxLength={20}
                                                    minLength={4}
                                                    autoFocus={false}
                                                    onSubmitEditing={this.onTextDone}
                                                    value={this.state.referenceText}
                                                    //ref={ref => (this.inputs["username"] = ref)}
                                                    onChangeText={this.onTextChange}
                                                    placeholder="Enter Promo"
                                                    placeholderTextColor={ROYAL_BLUE}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        </KeyboardAwareScrollView>

                        <View style={styles.applyPromoContainer}>
                            {this.state.enterPromo ? (
                                <View style={styles.flex1}>
                                    <TouchableOpacity
                                        style={styles.buttonContainer}
                                        onPress={this.onConfirmClickPromo}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Apply Promo"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity
                                        disabled={this.state.payDisabled}
                                        style={styles.buttonContainer}
                                        onPress={this.onConfirmClickQR}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Pay Now"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <ChallengeQuestion
                            loader={this.state.isRSALoader}
                            display={this.state.isRSARequired}
                            displyError={this.state.RSAError}
                            questionText={this.state.challengeQuestion}
                            onSubmitPress={this.onChallengeQuestionSubmitPress}
                            onSnackClosePress={this.onChallengeSnackClosePress}
                        />
                        {this.state.qrError === true ? (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ qrError: false });
                                }}
                                title={Strings.APP_NAME_ALERTS}
                                description={
                                    this.state.errorMessage != "" ||
                                    this.state.errorMessage != undefined ||
                                    this.state.errorMessage != null ||
                                    this.state.errorMessage.length != 0
                                        ? this.state.errorMessage
                                        : Strings.WE_FACING_SOME_ISSUE
                                }
                                showOk={true}
                                onOkPress={() => {
                                    this.setState({ qrError: false });
                                }}
                            />
                        ) : null}

                        {this.state.promoError === true ? (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ promoError: false });
                                }}
                                title={Strings.APP_NAME_ALERTS}
                                description={
                                    this.state.errorMessage != "" ||
                                    this.state.errorMessage != undefined ||
                                    this.state.errorMessage != null ||
                                    this.state.errorMessage.length != 0
                                        ? this.state.errorMessage
                                        : Strings.WE_FACING_SOME_ISSUE
                                }
                                showOk={true}
                                onOkPress={() => {
                                    this.setState({ promoError: false });
                                }}
                            />
                        ) : null}
                    </ScreenLayout>
                </>

                {this.state.dailyLimitExceeded && (
                    <Popup
                        visible={true}
                        onClose={this._toggleCloseModal}
                        title="Daily limit exceeded"
                        description="Would you like to increase your Scan & Pay daily limit and continue with this transaction?"
                        primaryAction={{
                            text: "Confirm",
                            onPress: this.changeDailyLimit,
                        }}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this._toggleCancelModal,
                        }}
                    />
                )}
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accNoContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 5,
    },
    amountContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    applyPromoContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 24,
        marginTop: 24,
        marginBottom: 40,
    },
    block: { flexDirection: "column" },
    blockPadding: {
        flexDirection: "column",
        paddingTop: 10,
    },
    buttonContainer: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        marginTop: 10,
        width: "100%",
    },
    changeAccountBtn: {
        alignItems: "center",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    descriptionContainer: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: width - 48,
    },
    flex1: { flex: 1 },
    headerBtnContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    image: { height: 64, padding: 5, width: 64 },
    imgBg: {
        flex: 1,
        height: "25%",
        position: "absolute",
        width,
    },
    inputReference: {
        alignContent: "center",
        alignItems: "center",
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "bold",
        height: 70,
        justifyContent: "center",
        letterSpacing: 0,
        lineHeight: 18,
        paddingVertical: 0,
        textAlign: "right",
        textAlignVertical: "center",
        width: "100%",
    },
    inputReferenceContainer: { width: "60%" },
    lineThrough: {
        textDecorationLine: "line-through",
    },
    main: {
        flexDirection: "column",
        flex: 1,
    },
    mainSubContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    midContainer: {
        flex: 3,
        flexDirection: "column",
        marginTop: 10,
    },
    midSubContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    promoContainer: {
        alignSelf: "center",
        width: width - 72,
    },
    promoFieldContainer: { width: "40%" },
    promoInputContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    promoSubContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 1,
        width: "100%",
    },
    selectedAccContainer: {
        alignSelf: "center",
        backgroundColor: WHITE,
        borderColor: MEDIUM_GREY,
        borderRadius: 8,
        borderWidth: 1.25,
        flex: 1.5,
        flexDirection: "row",
        height: 100,
        marginBottom: 10,
        marginTop: 30,
        width: width - 72,
        ...Utility.getShadow({}),
    },
    selectedAccDetailContainer: {
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        flex: 2,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 8,
    },
    subContainer: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 0,
        marginTop: 5,
    },
    subContainer2: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 40,
    },
    selectedAccNoText: {
        marginTop: 10,
    },
    selectedAccSubContainer: {
        marginLeft: 20,
    },
});
export default withModelContext(withFestive(QRConfirmationScreen));

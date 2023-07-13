import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
} from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { ScanPayGA } from "@services/analytics/analyticsScanPay";

import {
    MEDIUM_GREY,
    DARK_GREY,
    BLACK,
    DARK_YELLOW,
    WHITE,
    VERY_LIGHT_GREY,
} from "@constants/colors";
import {
    RECEIPT_NOTE,
    REFERENCE_ID,
    SEND_MESSAGE_DEEPAMONEY,
    SERVICE_FEES,
    SHARE_RECEIPT,
    DONE,
    FLEX_START,
} from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import * as Utility from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import withFestive from "@utils/withFestive";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

import { QRCategoryScreen } from "./QRCategoryScreen";

("use strict");

const { height, width } = Dimensions.get("window");
class QRAcknowledgeScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
        updateModel: PropTypes.func,
        festiveAssets: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            referenceText: "",
            success: true,
            message: "",
            code: "",
            enterCategory: false,
            categoryName: "Add Category",
            trxRef: "",
            paymentRef: "",
            trxDateTime: "",
            amount: "",
            payeeAccountNo: "",
            payeeName: null,
            merchant: "",
            viewPdf: false,
            pdfFile: "",
            pdfBase64: "",
            validPromo: false,
            promoPct: 0,
            promoType: "",
            rsaDenined: false,
            isMaybank: false,
            settings: false,
            setup: false,
            regFlow: false,
            primary: false,
            wallet: false,
            cashBackAmt: 0,
            showCB: false,
            loader: false,
            quickAction: false,
            isS2WEarnedChance: false,
            chance: "",
            showS2wPopUp: false,
        };
        this.onTextChange = this._onTextChange.bind(this);
        this.onTextDone = this._onTextDone.bind(this);
        this.onAccountItemClick = this._onAccountItemClick.bind(this);
        this.onAccountItemSwipeChange = this._onAccountItemSwipeChange.bind(this);
        //this.onConfirmClick = this._onConfirmClick.bind(this);
    }

    _onTextChange = (text) => {
        this.setState({ referenceText: text });
    };

    _onTextDone = async () => {
        //this.setState({ referenceText: text });
    };

    _onAccountItemClick = () => {
        //this.setState({ referenceText: text });
    };

    _onAccountItemSwipeChange = () => {
        //this.setState({ referenceText: text });
    };

    qrCategoryOnDone = (item) => {
        this.setState({
            enterCategory: false,
            categoryName: item.title,
        });
    };

    qrCategoryOnClose = () => {
        this.setState({ enterCategory: false });
    };

    onConfirmClick = async () => {
        // updateTxnCategory('/qrpay/updateCategory', JSON.stringify({
        //   "categoryId": 1,
        //   "trxId": this.state.trxRef
        // })).then(async (response) => {
        //   console.log("RES", response)
        //   qrObject = await response.data;
        //   console.log('Qrobject', qrObject)
        //   if (qrObject !== null && qrObject.code === 0) {
        //     NavigationService.navigate(navigationConstant.WALLET_TAB_SCREEN);
        //   }

        // }).catch((err) => {
        //   console.log("ERR", err)
        // })

        if (this.state.categoryName != "Add Category") {
            // const response = await updateTxnCategory('/qrpay/updateCategory', JSON.stringify({
            //   "categoryId": 1,
            //   "trxId": this.state.trxRef
            // }));
            // const qrObject = await response.json();
            // console.log(qrObject)
        }

        console.log("Done");
        this.handleNavigation();
    };

    closeClick = () => {
        console.log("Close");
        this.handleNavigation();
    };

    handleNavigation = () => {
        const { regFlow, primary, settings, wallet } = this.state || {};
        if (regFlow) {
            if (primary) {
                if (settings) {
                    this.props.navigation.navigate("Settings");
                } else if (wallet) {
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
                if (wallet) {
                    this.props.navigation.navigate(navigationConstant.MORE, {
                        screen: "Wallet",
                    });
                } else {
                    this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                        screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                    });
                }
            }
        } else {
            if (primary) {
                this.props.navigation.navigate("Tab", {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                });
            } else {
                if (wallet) {
                    this.props.navigation.navigate(navigationConstant.MORE, {
                        screen: "Wallet",
                    });
                } else {
                    this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                        screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                    });
                }
            }
        }
    };

    qrAcknowledgeGASharePDF = (reloadShare) => {
        const crossBorderForeignCurrency =
            this.props.route?.params?.crossBorderMerchantData?.foreignCurrency;
        ScanPayGA.paymentShareReceipt(reloadShare, crossBorderForeignCurrency);
    };

    qrAcknowledgePdfView = () => {
        const crossBorderForeignCurrency =
            this.props.route?.params?.crossBorderMerchantData?.foreignCurrency;
        ScanPayGA.viewScreenPaymentShareReceipt(crossBorderForeignCurrency);
    };

    getReceiptParams = () => {
        const crossBorderParams = this.props.route?.params?.crossBorderMerchantData;
        const {
            merchant,
            payeeAccountNo,
            payeeName,
            paymentRef,
            trxDateTimeFomat,
            amount,
            isMaybank,
        } = this.state || {};
        let receiptBody = [
            {
                label: "Beneficiary Name",
                value: payeeName,
                showRightText: false,
            },
        ];
        if (merchant === "Y") {
            receiptBody = [
                {
                    label: "Merchant Name",
                    value: payeeName,
                    showRightText: false,
                },
            ];
            if (crossBorderParams?.amount) {
                receiptBody.push({
                    label: "Foreign currency amount",
                    value: `${crossBorderParams?.foreignCurrency} ${crossBorderParams?.amount}`,
                    showRightText: false,
                });
            }
            if (crossBorderParams?.merchantName) {
                receiptBody.push({
                    label: "Pay to",
                    value: crossBorderParams?.merchantName,
                    showRightText: false,
                });
            }
        }

        if (isMaybank) {
            receiptBody = [
                {
                    label: "Recipient Name",
                    value: payeeName,
                    showRightText: false,
                },
                {
                    label: "Recipient Account Number",
                    value: payeeAccountNo,
                    showRightText: false,
                },
            ];
        }
        if (crossBorderParams?.merchantName) {
            receiptBody = [
                {
                    label: "Pay to",
                    value: crossBorderParams?.merchantName,
                    showRightText: false,
                },
                {
                    label: "Foreign currency amount",
                    value: `${crossBorderParams?.foreignCurrency} ${
                        crossBorderParams?.dynamic === "Y"
                            ? crossBorderParams?.foreignAmount
                            : crossBorderParams?.amount
                    }`,
                    showRightText: false,
                },
                {
                    label: SERVICE_FEES,
                    value: `RM 0.00`,
                    showRightText: false,
                },
            ];
        }

        return [
            {
                label: "Reference ID",
                value: paymentRef,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: trxDateTimeFomat,
            },
            ...receiptBody,
            {
                label: "Amount",
                value: `RM ${amount}`,
                showRightText: false,
                isAmount: true,
            },
        ];
    };
    moreClick = async () => {
        this.setState({ loader: true });

        const {
            merchant,
            payeeAccountNo,
            payeeName,
            paymentRef,
            trxDateTimeFomat,
            amount,
            isMaybank,
            success,
        } = this.state || {};

        let params =
            merchant === "Y"
                ? [
                      {
                          label: REFERENCE_ID,
                          value: paymentRef,
                          showRightText: true,
                          rightTextType: "text",
                          rightStatusType: "",
                          rightText: trxDateTimeFomat,
                      },
                      {
                          label: "Merchant Name",
                          value: payeeName,
                          showRightText: false,
                      },
                      {
                          label: "Amount",
                          value: `RM ${amount}`,
                          showRightText: false,
                          isAmount: true,
                      },
                  ]
                : isMaybank
                ? [
                      {
                          label: REFERENCE_ID,
                          value: paymentRef,
                          showRightText: true,
                          rightTextType: "text",
                          rightStatusType: "",
                          rightText: trxDateTimeFomat,
                      },
                      {
                          label: "Recipient Name",
                          value: payeeName,
                          showRightText: false,
                      },
                      {
                          label: "Recipient Account Number",
                          value: payeeAccountNo,
                          showRightText: false,
                      },
                      {
                          label: "Amount",
                          value: `RM ${amount}`,
                          showRightText: false,
                          isAmount: true,
                      },
                  ]
                : [
                      {
                          label: REFERENCE_ID,
                          value: paymentRef,
                          showRightText: true,
                          rightTextType: "text",
                          rightStatusType: "",
                          rightText: trxDateTimeFomat,
                      },
                      {
                          label: "Beneficiary Name",
                          value: payeeName,
                          showRightText: false,
                      },
                      {
                          label: "Amount",
                          value: `RM ${amount}`,
                          showRightText: false,
                          isAmount: true,
                      },
                  ];

        const file = await CustomPdfGenerator.generateReceipt(
            true,
            "Scan & Pay",
            true,
            RECEIPT_NOTE,
            params,
            true,
            success ? "success" : "fail",
            success ? "Successful" : "Failed"
        );

        this.setState({ loader: false });
        if (file === null) {
            showErrorToast({ message: "Please allow permission" });
        } else {
            this.props.navigation.navigate("commonModule", {
                screen: "PDFViewer",
                params: {
                    file,
                    share: true,
                    type: "file",
                    pdfType: "shareReceipt",
                    title: "Share Receipt",
                    sharePdfGaHandler: this.qrAcknowledgeGASharePDF,
                    GAPdfView: this.qrAcknowledgePdfView,
                },
            });
            // const params = {
            //     file: file,
            //     share: true,
            //     type: "base64",
            //     route: "QrAck",
            //     module: "QrStack",
            //     title: "MAYA RECEIPT",
            //     pdfType: "shareReceipt",
            //     reset: false,
            //     primary: false,
            // };
            // this.props.navigation.navigate("commonModule", {
            //     screen: "PdfViewScreen",
            //     params: { params },
            // });
        }

        ScanPayGA.selectActionShareReceipt(
            this.props.route?.params?.code === "0",
            this.props.route?.params?.crossBorderMerchantData?.foreignCurrency
        );
    };

    componentDidMount() {
        // this.initData();

        // check for winning duit raya, also handle chances if available
        this.checkForDuitRayaAndChances();

        const { route } = this.props;
        ScanPayGA.viewScreenPayment(
            route?.params?.code === "0",
            route?.params?.crossBorderMerchantData?.foreignCurrency
        );
        ScanPayGA.formPayment(
            route.params?.code === "0",
            route.params?.paymentRef ?? null,
            route.params?.crossBorderMerchantData?.promoCode ?? null,
            route?.params?.crossBorderMerchantData?.rppRefNo ?? null,
            route?.params?.crossBorderMerchantData?.foreignCurrency ?? null
        );

        this.focusSubscription = this.props.navigation.addListener("focus", this.initData);
        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            this.setState({ showS2wPopUp: false });
        });

        // [[UPDATE_BALANCE]] Update the wallet balance if success
        const isSuccess = route.params?.code === "0";
        const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
        if (isUpdateBalanceEnabled && isSuccess) {
            updateWalletBalance(this.props.updateModel);
        }
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    checkForDuitRayaAndChances = () => {
        if (this.props.route.params.s2w) {
            const { txnType, displayPopup, chance, amount, formattedAmount } =
                this.props.route.params.s2w;

            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            if ((isTapTasticReady || isCampaignPeriod) && txnTypeList.includes(txnType)) {
                // win duit raya
                if (amount > 0) {
                    // the screen will handle chances screen by using the parameter so we can opt out of the
                    // local variable, since it will only apply to p2p qr, so no worry about clashing with
                    // qr cashback
                    this.props.navigation.push("DashboardStack", {
                        screen: "Dashboard",
                        params: {
                            screen: "CashbackCampaign",
                            params: {
                                success: true,
                                amount: formattedAmount,
                                displayPopup,
                                chance,
                                isCapped: isTapTasticReady,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        },
                    });
                }
            }
        }
    };

    initData = async () => {
        const { route } = this.props;
        console.log("Params > ", route.params);
        const status = route.params?.code == "0" ? true : false;
        const merchant = route.params?.merchant ?? "";
        const showCB = route.params?.showCB ?? false;
        const showChance = route.params?.showChance ?? false;
        const pull = route.params?.pull ?? "N";
        const cashBackAmt = route.params?.cashBackAmt ?? 0;
        const paymentRef = route.params?.paymentRef ?? "";
        const quickAction = route.params?.quickAction ?? false;
        const chanceScreen = route.params?.chanceScreen ?? false;
        let isS2WEarnedChance = false;
        let chances = 0;
        let isGeneric = false;
        const {
            misc: { isCampaignPeriod, isTapTasticReady },
            s2w: { txnTypeList },
        } = this.props.getModel(["misc", "s2w"]);

        this.setState(
            {
                trxRef: route.params?.trxRef ?? "",
                paymentRef: paymentRef.substr(paymentRef.length > 10 ? paymentRef.length - 10 : 0),
                trxDateTimeFomat: route.params?.trxDateTimeFomat ?? "",
                amount: route.params?.amount ?? "",
                payeeAccountNo: route.params?.payeeAccountNo ?? "",
                payeeName: route.params?.payeeName ?? "",
                merchant,
                success: status,
                message: route.params?.message ?? "",
                validPromo: route.params?.validPromo ?? "",
                promoPct: route.params?.promoPct ?? "",
                promoType: route.params?.promoType ?? "",
                referenceText: route.params?.referenceText ?? "",
                pull,
                loader: false,
                primary: route.params?.primary ?? false,
                wallet: route.params?.wallet ?? false,
                rsaDenined: route.params?.rsaStatus == "Deny" ? true : false,
                isMaybank: route.params?.isMaybank ?? false,
                settings: route.params?.settings ?? false,
                setup: route.params?.setup ?? false,
                regFlow: route.params?.regFlow ?? false,
                cashBackAmt,
                showCB,
                quickAction,
            },
            () => {
                if (this.props.route.params.s2w) {
                    const { txnType, displayPopup, chance, amount, generic } =
                        this.props.route.params.s2w;

                    // only for chances without amount,
                    // as amount are handled in above with chances
                    // and generic is to show plain chances screen
                    if (
                        (isCampaignPeriod || isTapTasticReady) &&
                        txnTypeList.includes(txnType) &&
                        (displayPopup || generic) &&
                        !amount
                    ) {
                        isS2WEarnedChance = true;
                        chances = chance;
                        isGeneric = generic;
                    }
                }

                // console.tron.log(status, showChance, chanceScreen);

                if (status === true && showChance === true && chanceScreen === true) {
                    if (isS2WEarnedChance && isTapTasticReady) {
                        // this is only for campaign while using tracker and earned entries / chances for user
                        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
                        // this.showChanceScreen(chances, isGeneric, isTapTasticReady, tapTasticType);
                    }
                } else if (status === true) {
                    this.cashBackCall(showCB, isS2WEarnedChance, chances, chanceScreen, isGeneric);
                }
            }
        );
    };
    /*
    showChanceScreen = (chances, isGeneric, isTapTasticReady, tapTasticType) => {
        if (!this.state.showS2wPopUp) {
            this.setState({ showS2wPopUp: true }, () => {
                this.props.navigation.push("TabNavigator", {
                    screen: "CampaignChancesEarned",
                    params: {
                        chances,
                        isCapped: isGeneric,
                        isTapTasticReady,
                        tapTasticType,
                    },
                });
                setTimeout(() => {
                    this.props.navigation.setParams({
                        showChance: false,
                        showCB: false,
                        chanceScreen: false,
                    });
                }, 1000);
            });
        }
    };
*/
    cashBackCall = (showCB, isS2WEarnedChance, chances, chanceScreen, isGeneric) => {
        // read from params, no point using the state, as it is async and might not be ready here.
        const cashBackAmt = this.props.route.params?.cashBackAmt ?? 0;
        const { isFestivalReady, tapTasticType, isTapTasticReady } = this.props.getModel("misc");

        if (this.state.pull === "Y") {
            if (cashBackAmt > 0 && this.state.merchant === "Y" && showCB) {
                const amount = `RM ` + parseFloat(cashBackAmt / 100).toFixed(2);
                console.log("amount", amount);
                //set amount
                if (isTapTasticReady) {
                    this.props.navigation.push("DashboardStack", {
                        screen: "Dashboard",
                        params: {
                            screen: "CashbackCampaign",
                            params: {
                                success: true,
                                amount,
                                isCapped: isTapTasticReady,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        },
                    });
                } else {
                    this.props.navigation.navigate(navigationConstant.QR_STACK, {
                        screen: "QrCB",
                        params: {
                            text: "Awesome!",
                            amount,
                            success: true,
                            desc: "QrPull",
                            quickAction: isFestivalReady && !isTapTasticReady,
                            tapTasticType,
                            isTapTasticReady,
                        },
                    });
                }
                this.props.navigation.setParams({
                    showChance: true,
                    showCB: false,
                });
            } else {
                if (cashBackAmt === 0 && showCB) {
                    if (isTapTasticReady) {
                        this.props.navigation.push("DashboardStack", {
                            screen: "Dashboard",
                            params: {
                                screen: "CashbackCampaign",
                                params: {
                                    success: false,
                                    amount: 0,
                                    isCapped: isTapTasticReady,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            },
                        });
                    } else {
                        this.props.navigation.navigate(navigationConstant.QR_STACK, {
                            screen: "QrCB",
                            params: {
                                text: "Okay",
                                success: false,
                                desc: "QrPull",
                                quickAction: isFestivalReady,
                                tapTasticType,
                                isTapTasticReady,
                            },
                        });
                    }
                    this.props.navigation.setParams({
                        showChance: true,
                        showCB: false,
                    });
                } else if (isS2WEarnedChance && chanceScreen) {
                    // this is only for campaign while using tracker and earned entries / chances for user
                    // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
                    //this.showChanceScreen(chances, isGeneric, isTapTasticReady, tapTasticType);
                }
            }
        } else {
            if (cashBackAmt > 0 && this.state.merchant === "Y" && showCB) {
                const amount = `RM ` + parseFloat(cashBackAmt / 100).toFixed(2);
                console.log("amount", amount);
                if (isTapTasticReady) {
                    this.props.navigation.push("DashboardStack", {
                        screen: "Dashboard",
                        params: {
                            screen: "CashbackCampaign",
                            params: {
                                success: true,
                                amount,
                                isCapped: isTapTasticReady,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        },
                    });
                } else {
                    this.props.navigation.navigate(navigationConstant.QR_STACK, {
                        screen: "QrCB",
                        params: {
                            text: "Awesome!",
                            amount,
                            success: true,
                            desc: "QrPush",
                            quickAction: isFestivalReady && !isTapTasticReady,
                            tapTasticType,
                            isTapTasticReady,
                        },
                    });
                }
                this.props.navigation.setParams({
                    showChance: true,
                    showCB: false,
                });
            } else {
                if (this.state.merchant === "Y") {
                    if (cashBackAmt === -1 && showCB) {
                        if (isTapTasticReady) {
                            this.props.navigation.push("DashboardStack", {
                                screen: "Dashboard",
                                params: {
                                    screen: "CashbackCampaign",
                                    params: {
                                        success: false,
                                        amount: 0,
                                        isCapped: isTapTasticReady,
                                        isTapTasticReady,
                                        tapTasticType,
                                    },
                                },
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                                screen: "QrCB",
                                params: {
                                    text: "Okay",
                                    success: false,
                                    desc: "QrPush",
                                    quickAction: isFestivalReady && !isTapTasticReady,
                                    tapTasticType,
                                    isTapTasticReady,
                                },
                            });
                        }
                        this.props.navigation.setParams({
                            showChance: true,
                            showCB: false,
                        });
                    } else if (isS2WEarnedChance && chanceScreen) {
                        // if (!isTapTasticReady) {
                        // this is only for campaign while using tracker and earned entries / chances for user
                        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
                        //this.showChanceScreen(chances, isGeneric, isTapTasticReady, tapTasticType);
                        // }
                    }
                } else {
                    if (cashBackAmt === -1 && showCB) {
                        if (isTapTasticReady) {
                            this.props.navigation.push("DashboardStack", {
                                screen: "Dashboard",
                                params: {
                                    screen: "CashbackCampaign",
                                    params: {
                                        success: false,
                                        amount: 0,
                                        isCapped: isTapTasticReady,
                                        isTapTasticReady,
                                        tapTasticType,
                                    },
                                },
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                                screen: "QrCB",
                                params: {
                                    text: "Okay",
                                    success: false,
                                    desc: "QrPush",
                                    quickAction: isFestivalReady && !isTapTasticReady,
                                    tapTasticType,
                                    isTapTasticReady,
                                },
                            });
                        }
                        this.props.navigation.setParams({
                            showChance: true,
                            showCB: false,
                        });
                    } else if (isS2WEarnedChance && this.state.quickAction && chanceScreen) {
                        // this is only for campaign while using tracker and earned entries / chances for user
                        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
                        //this.showChanceScreen(chances, isGeneric, isTapTasticReady, tapTasticType);
                    }
                }
            }
        }

        this.props.navigation.setParams({
            showCB: false,
        });
    };

    getFestiveStatus = () => {
        const {
            misc: { specialOccasionData },
        } = this.props.getModel(["misc"]);

        // since got no data for qr pay, but the message are generic so we use the one from snr money
        const festiveData = specialOccasionData.find((item) => item.module === "SEND_RCV");

        return specialOccasionData?.length > 0
            ? festiveData?.successMsg ?? "Payment successful"
            : "Payment successful";
    };

    render() {
        const { getModel, festiveAssets, route } = this.props;
        const { isTapTasticReady, showFestiveSendMoney } = getModel("misc");
        const festiveSuccessHeader = this.getFestiveStatus();
        const paymentSuccessHeader =
            !isTapTasticReady && this.state.quickAction && festiveSuccessHeader?.length > 0
                ? festiveSuccessHeader
                : "Payment successful";

        const { crossBorderMerchantData } = route?.params || {};
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.loader}
            >
                <>
                    <CacheeImageWithDefault
                        resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                        style={styles.containerBgImage}
                        image={festiveAssets?.qrPay.background}
                    />
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={32}
                        // header={
                        //     <HeaderLayout
                        //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        //     />
                        // }
                        useSafeArea
                    >
                        <ScrollView style={styles.scrollViewContainer}>
                            <View style={Styles.blockSpace}>
                                {this.state.success
? (
                                    <View style={styles.scrollViewSubContainer}>
                                        <Image style={styles.image} source={Assets.icTickNew} />

                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            lineHeight={28}
                                            textAlign="left"
                                            style={styles.headerContainer}
                                            text={
                                                isTapTasticReady &&
                                                showFestiveSendMoney &&
                                                this.state.merchant !== "Y"
                                                    ? SEND_MESSAGE_DEEPAMONEY
                                                    : paymentSuccessHeader
                                            }
                                        />
                                    </View>
                                )
: (
                                    <View style={styles.scrollViewFailedSubContainer}>
                                        <Image style={styles.image} source={Assets.icFailedIcon} />
                                        {this.state.rsaDenined
? (
                                            <Typo
                                                fontSize={20}
                                                fontWeight="300"
                                                lineHeight={28}
                                                textAlign="left"
                                                style={styles.headerContainer}
                                                text={this.state.message}
                                            />
                                        )
: (
                                            <View style={styles.paymentFailedHeader}>
                                                <Typo
                                                    fontSize={20}
                                                    fontWeight="300"
                                                    lineHeight={28}
                                                    textAlign="left"
                                                    style={styles.failedHeaderMarginTop}
                                                    text="Payment unsuccessful"
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="300"
                                                    color={DARK_GREY}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    style={styles.generalMarginTop}
                                                    text={this.state.message}
                                                />
                                            </View>
                                        )}
                                    </View>
                                )}

                                {this.state.success && crossBorderMerchantData?.merchantName && (
                                    <View style={styles.crossBorderContainer}>
                                        <Typo
                                            fontSize={24}
                                            fontWeight="700"
                                            color={BLACK}
                                            lineHeight={32}
                                            textAlign="left"
                                            style={styles.generalMarginTop}
                                            text={`RM ${numeral(
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
                                        <Typo
                                            fontSize={22}
                                            fontWeight="400"
                                            color={BLACK}
                                            lineHeight={32}
                                            textAlign="left"
                                            style={styles.generalMarginTop}
                                            text={`${
                                                crossBorderMerchantData?.foreignCurrency
                                            } ${(crossBorderMerchantData?.dynamic === "Y"
                                                ? crossBorderMerchantData?.foreignAmount
                                                : crossBorderMerchantData?.amount
                                            )?.replace(",", "")}`}
                                        />
                                    </View>
                                )}

                                <View style={styles.contentAlignent}>
                                    {!crossBorderMerchantData &&
                                        this.state.success &&
                                        this.state.amount !== "" &&
                                        this.state.payeeName !== "" && (
                                            <View>
                                                <View style={styles.amountData}>
                                                    <Typo
                                                        fontSize={24}
                                                        fontWeight="bold"
                                                        lineHeight={30}
                                                        textAlign="left"
                                                        style={styles.generalMarginTop}
                                                        text={`RM ${Utility.floatWithCommas(
                                                            this.state.amount
                                                        )}`}
                                                    />
                                                    <Typo
                                                        fontSize={20}
                                                        fontWeight="normal"
                                                        lineHeight={30}
                                                        textAlign="left"
                                                        style={styles.generalMarginTop}
                                                        text={this.state.payeeName}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                </View>
                                <View
                                    style={[
                                        styles.rsaDeniedStyle,
                                        { marginTop: this.state.rsaDenined ? 120 : 40 },
                                    ]}
                                >
                                    {this.state.paymentRef != null &&
                                    this.state.paymentRef !== ""
? (
                                        <View style={styles.paymentRefStyle}>
                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={REFERENCE_ID}
                                                />
                                            </View>

                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="500"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={this.state.paymentRef}
                                                />
                                            </View>
                                        </View>
                                    )
: (
                                        <View />
                                    )}
                                    {this.state.trxDateTimeFomat != null &&
                                    this.state.trxDateTimeFomat !== ""
? (
                                        <View style={styles.trxDateTimeFomat}>
                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="300"
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text="Date & time"
                                                />
                                            </View>
                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="500"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={this.state.trxDateTimeFomat}
                                                />
                                            </View>
                                        </View>
                                    )
: (
                                        <View />
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.bottomContainer}>
                            {this.state.success && (
                                <View style={styles.generalMarginTop}>
                                    <TouchableOpacity
                                        style={styles.buttonContainerSh}
                                        onPress={this.moreClick}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={SHARE_RECEIPT}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.doneBtn}>
                                <TouchableOpacity
                                    style={styles.buttonContainer}
                                    onPress={this.onConfirmClick}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={DONE}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {this.state.enterCategory && this.state.success
? (
                            <View style={styles.qrCategoryContainer}>
                                <QRCategoryScreen
                                    onDonePress={this.qrCategoryOnDone}
                                    onClose={this.qrCategoryOnClose}
                                />
                            </View>
                        )
: null}
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    ackDataRow: { flexDirection: "row" },
    amountData: {
        alignContent: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 20,
    },
    bottomContainer: { alignItems: "center", justifyContent: "center" },
    buttonContainer: {
        alignItems: "center",
        backgroundColor: DARK_YELLOW,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        marginTop: 10,
        width: width - 48,
    },
    buttonContainerSh: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: VERY_LIGHT_GREY,
        borderRadius: 48,
        borderWidth: 1,
        height: 48,
        justifyContent: "center",
        marginTop: 20,
        width: width - 48,
    },
    containerBgImage: {
        flex: 1,
        height: "25%",
        position: "absolute",
        width,
    },
    contentAlignent: {
        alignContent: FLEX_START,
        justifyContent: FLEX_START,
    },
    crossBorderContainer: { flexDirection: "column", marginTop: 20 },
    doneBtn: { marginBottom: 30 },
    headerContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        marginTop: 30,
    },
    image: { borderRadius: 56 / 2, height: 56, width: 56 },
    generalMarginTop: { marginTop: 10 },
    failedHeaderMarginTop: { marginTop: 30 },
    paymentFailedHeader: {
        alignContent: "center",
        alignItems: FLEX_START,
    },
    qrCategoryContainer: { height: "100%", position: "absolute", width: "100%" },
    paymentRefStyle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    rsaDeniedStyle: {
        flex: 1,
        flexDirection: "column",
    },
    scrollViewContainer: { flex: 1 },
    scrollViewFailedSubContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        marginTop: height / 6 - 10,
    },
    scrollViewSubContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        marginTop: height / 6 - 10,
    },
    trxDateTimeFomat: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});
export default withModelContext(withFestive(QRAcknowledgeScreen));

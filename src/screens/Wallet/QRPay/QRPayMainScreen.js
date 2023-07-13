import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Alert,
    AppState,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import Barcode from "react-native-barcode-builder";
import { RNCamera } from "react-native-camera";
import CountdownCircle from "react-native-countdown-circle";
import ImagePicker from "react-native-image-crop-picker";
import Permissions from "react-native-permissions";
import QRCodew from "react-native-qrcode-image";
import QRCodeScanner from "react-native-qrcode-scanner";
import PDFView from "react-native-view-pdf";
import RNQRGenerator from "rn-qr-generator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderRefreshButton from "@components/Buttons/HeaderRefreshButton";
import SwitchButton from "@components/Buttons/SwitchButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import { ErrorMessage } from "@components/Common";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    bankingGetDataMayaM2u,
    checkQRStatus,
    getQRPullStatus,
    getQRPullString,
    getQRPullTranAuth,
    getQRPushString,
    getQRUserName,
    invokeL2,
    invokeL3,
    maeCustomerInfo,
    qrMerchantInquiry,
    verifyQRString,
    validateATMQR,
    checkAtmOnboarding,
} from "@services";
import { ScanPayGA } from "@services/analytics/analyticsScanPay";

import {
    BLACK,
    FADE_GREY,
    GREY,
    MEDIUM_GREY,
    ROYAL_BLUE,
    TRANSPARENT,
    WHITE,
    YELLOW,
    DARK_GREY_200,
} from "@constants/colors";
import * as Strings from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";
import { getQRParams, getShadow } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";
import { errorMessageMap } from "@utils/errorMap";
import withFestive from "@utils/withFestive";

import Assets from "@assets";

import { QRAccountSelect } from "./QRAccountSelect";
import { QREnterAmount } from "./QREnterAmount";

const { width, height } = Dimensions.get("window");

const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const isIPhoneX =
    Platform.OS === "ios" && !Platform.isPad && !Platform.isTVOS
        ? (width === X_WIDTH && height === X_HEIGHT) ||
          (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
        : false;

const tabNameEnum = Object.freeze({
    pay: 0,
    receive: 1,
});

const tabOption = Object.freeze([
    {
        label: "PAY",
        value: tabNameEnum.pay,
        activeColor: WHITE,
    },
    {
        label: "RECEIVE",
        value: tabNameEnum.receive,
        activeColor: WHITE,
    },
]);

class QRPayMainScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
            pop: PropTypes.func,
            setParams: PropTypes.func,
        }),
        route: PropTypes.object,
        updateModel: PropTypes.func,
        festiveAssets: PropTypes.object,
    };
    static pullRefList = [];

    constructor(props) {
        super(props);
        this.camera = null;
        this.state = this.getInitialState();
        this.hasScanned = false;
        this.checkPermission = this.checkPermission.bind(this);
        this.getUI1 = this.getUI1.bind(this);
        this.getUI2 = this.getUI2.bind(this);
        this.getUI3 = this.getUI3.bind(this);
        this.getUI4 = this.getUI4.bind(this);
        this.getUI5 = this.getUI5.bind(this);
        this.getUIPdf = this.getUIPdf.bind(this);
        this.getQrErrorScreen = this.getQrErrorScreen.bind(this);
        this.getPullDoneScreen = this.getPullDoneScreen.bind(this);
    }

    componentDidMount() {
        this.initData();
        this.getBGImage();
        AppState.addEventListener("change", this._handleAppStateChange);
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            const { route } = this.props;
            console.log("params > ", route.params);
            const refresh = route.params?.refresh ?? false;
            const limitUpdate = route.params?.limitUpdate ?? false;
            if (refresh) {
                this.initData();
            }
            if (this.hasScanned) {
                this.hasScanned = false;
            }
            if (limitUpdate) {
                const pullStatus = this.state.refresNeed;
                const state = route.params?.qrState ?? {};
                console.log("QR State > ", state);
                this.setState(state);
                const { getModel } = this.props;
                const { isPostLogin } = getModel("auth");
                const mode = isPostLogin ? "P" : "N";
                this.authTransaction(this.state.pullRefNo, mode, true, false);
                if (pullStatus) {
                    this.setState({ pullRefreshed: true });
                    this.pullRefresh();
                    this.setState({ refresNeed: false });
                }
            }
            setTimeout(() => this.setState({ pinRaised: false }), 5000);
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});

        this.checkPermission();

        // send default current tab
        ScanPayGA.viewScreenMainQR(this.state.currentTab);
    }

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
        clearInterval(this.state.loop);

        AppState.removeEventListener("change", this._handleAppStateChange);
        this.setState({ currentScreen: 1, pinRaised: false, qrActive: true });
        this.pullRefList = [];
        this.clearLoops();
        this.focusSubscription();
        this.blurSubscription();
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
            this.handleActive();
        }
        this.setState({ appState: nextAppState });
    };

    onSuccess(e) {
        Alert.alert(JSON.stringify(e.data));
        this.setState({ data: e.data });
    }

    async checkPermission() {
        const permissionResult = await Permissions.request("camera").then((response) => {
            console.log("R", response);
            return response;
        });

        if (
            permissionResult == "denied" ||
            permissionResult == "undetermined" ||
            permissionResult == "restricted"
        ) {
            //this.props.navigation.pop();
            //NavigationService.navigate(navigationConstant.QRPAY_CAMER_DENY);
            // this.props.navigation.navigate("QrStack", {
            //     screen: "QrCamera",
            // });
            showErrorToast({ message: "Required camera permission" });
        } else {
            this.setState({ permissionCheck: true });
        }
    }

    handleActive = () => {
        console.log("Active");
        if (this.state.currentScreen == 3) {
            //this.pullRefresh();
            this.setState({
                barHeight: this.state.barHeight == height / 15 ? height / 15.1 : height / 15,
            });
        }
    };

    initData = () => {
        const { route } = this.props;
        const primary = route.params?.primary ?? false;
        const wallet = route.params?.wallet ?? false;
        const fromRoute = route.params?.fromRoute ?? null;
        const fromStack = route.params?.fromStack ?? null;
        const screen = route.params?.screen ?? 1;
        const resetState = route.params?.resetState ?? false;
        const setup = route.params?.setup ?? false;
        const quickAction = route.params?.quickAction ?? false; //false
        if (resetState) {
            const state = route.params?.qrState ?? {};
            console.log("State > ", state);
            this.setState(state);
            const validateAccount = route.params?.validateAccount ?? false;
            if (validateAccount) {
                this.setState({ currentScreen: 5 });
            }
        } else {
            this.setState({
                currentScreen: screen,
                primary,
                setup,
                wallet,
                pullRefreshed: false,
                qrActive: true,
                quickAction,
                dailyLimitExceeded: false,
                dailyLimitScreen: "",
            });
            if (!primary) {
                const data = route.params?.data ?? null;
                if (data != null) {
                    console.log("AC Data > ", data);
                    this.setState({
                        accData: data,
                    });
                }
            }
        }
        this.props.navigation.setParams({
            data: {},
            qrState: {},
            resetState: false,
            validateAccount: false,
            refresh: false,
        });
        const { updateModel } = this.props;
        updateModel({
            qrPay: { limitExceeded: false },
        });
    };

    updateAccounts = async (type) => {
        try {
            this.setState({ loader: true });
            const path = `/summary/qr?type=`;
            let primaryAccount = "";
            if (type == "show") {
                const response = await bankingGetDataMayaM2u(path + "A", false);
                console.log("CASA > ", response);
                if (response?.data?.code === 0) {
                    const { accountListings } = response.data.result;
                    const accountList = [];
                    if (accountListings && accountListings.length) {
                        for (const item in accountListings) {
                            if (this.state.primary) {
                                if (accountListings[item].primary) {
                                    primaryAccount = accountListings[item].number;
                                    this.setState({
                                        paymentAccountNo: accountListings[item].number,
                                        paymentAccountCode: accountListings[item].code,
                                        paymentAccountType: accountListings[item].type,
                                        selectedAccount: accountListings[item].number,
                                        selectedPayAccount: accountListings[item].number,
                                        accountHolder: accountListings[item].name,
                                        accountPayHolder: accountListings[item].name,
                                        accountCode: accountListings[item].code,
                                        accountType: accountListings[item].type,
                                    });
                                }
                            } else {
                                if (accountListings[item].number == this.state.accData.acctNo) {
                                    primaryAccount = accountListings[item].number;
                                    this.setState({
                                        paymentAccountNo: accountListings[item].number,
                                        paymentAccountCode: accountListings[item].code,
                                        paymentAccountType: accountListings[item].type,
                                        selectedAccount: accountListings[item].number,
                                        selectedPayAccount: accountListings[item].number,
                                        accountHolder: accountListings[item].name,
                                        accountPayHolder: accountListings[item].name,
                                        accountCode: accountListings[item].code,
                                        accountType: accountListings[item].type,
                                    });
                                }
                            }
                            const acc = {};
                            acc.name =
                                accountListings[item].name +
                                "\n" +
                                DataModel.maskAccount(accountListings[item].number);
                            acc.const = accountListings[item].number;
                            acc.description = accountListings[item].number;
                            acc.title = accountListings[item].name;
                            acc.value = accountListings[item].balance;
                            acc.type = accountListings[item].type;
                            acc.code = accountListings[item].code;
                            acc.isSelected = primaryAccount == accountListings[item].number;
                            acc.index = item;
                            accountList.push(acc);
                        }
                    }
                    this.setState({ selectionAccountList: accountList });
                }
            } else {
                const dataList = [];
                const casaResponse = await bankingGetDataMayaM2u(path + "A", false);
                console.log("casaResponse > ", casaResponse);
                if (casaResponse && casaResponse.data && casaResponse.data.code === 0) {
                    const { accountListings } = casaResponse.data.result;
                    dataList.push(...accountListings);
                }

                const cardResponse = await bankingGetDataMayaM2u(path + "C", false);
                console.log("cardResponse > ", cardResponse);
                if (cardResponse && cardResponse.data && cardResponse.data.code === 0) {
                    const { accountListings } = cardResponse.data.result;
                    dataList.push(...accountListings);
                }

                const debitResponse = await bankingGetDataMayaM2u(path + "D", false);
                console.log("debitResponse > ", debitResponse);
                if (debitResponse && debitResponse.data && debitResponse.data.code === 0) {
                    const { accountListings } = debitResponse.data.result;
                    dataList.push(...accountListings);
                }

                const accountList = [];
                if (dataList && dataList.length) {
                    for (const item in dataList) {
                        if (
                            dataList[item] != null &&
                            dataList[item] != "Undefined" &&
                            dataList[item].type != "R" &&
                            dataList[item].type != "J"
                        ) {
                            if (this.state.primary) {
                                if (dataList[item].primary) {
                                    primaryAccount = dataList[item].number;
                                    this.setState({
                                        paymentAccountNo: dataList[item].number,
                                        paymentAccountCode: dataList[item].code,
                                        paymentAccountType: dataList[item].type,
                                        selectedAccount: dataList[item].number,
                                        selectedPayAccount: dataList[item].number,
                                        accountHolder: dataList[item].name,
                                        accountPayHolder: dataList[item].name,
                                        accountCode: dataList[item].code,
                                        accountType: dataList[item].type,
                                    });
                                }
                            } else {
                                if (dataList[item].number == this.state.accData.acctNo) {
                                    primaryAccount = dataList[item].number;
                                    this.setState({
                                        paymentAccountNo: dataList[item].number,
                                        paymentAccountCode: dataList[item].code,
                                        paymentAccountType: dataList[item].type,
                                        selectedAccount: dataList[item].number,
                                        selectedPayAccount: dataList[item].number,
                                        accountHolder: dataList[item].name,
                                        accountPayHolder: dataList[item].name,
                                        accountCode: dataList[item].code,
                                        accountType: dataList[item].type,
                                    });
                                }
                            }
                            const acc = {};
                            const mask =
                                dataList[item].type == "DC" || dataList[item].type == "J"
                                    ? DataModel.maskDCard(dataList[item].number)
                                    : dataList[item].type == "R" || dataList[item].type == "C"
                                    ? DataModel.maskCard(dataList[item].number)
                                    : DataModel.maskAccount(dataList[item].number);
                            acc.name = dataList[item].name + "\n" + mask;
                            acc.const = dataList[item].number;
                            acc.description = dataList[item].number;
                            acc.title = dataList[item].name;
                            acc.value = dataList[item].balance;
                            acc.type = dataList[item].type;
                            acc.code = dataList[item].code;
                            acc.isSelected = primaryAccount == dataList[item].number;
                            acc.index = item;
                            accountList.push(acc);
                        }
                    }
                }
                // const vcard = await this.updateVirtualCards(accountList.size);
                // if (vcard != null) {
                //     accountList.push(vcard);
                // }
                console.log("accountList > ", accountList);
                this.setState({ selectionPayAccountList: accountList });
            }
        } catch (err) {
            showErrorToast({ message: err.message });
        }
    };

    updateVirtualCards = async (index) => {
        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, true);

        const maeCustomerInfoData = httpResp?.data?.result ?? null;
        console.log("maeCustomerInfoData", maeCustomerInfoData);
        if (!maeCustomerInfoData) return null;

        const { debitInq } = maeCustomerInfoData;
        const maeCardStatus = debitInq?.cardStatus ?? null;
        const maeNextAction = debitInq?.cardNextAction ?? null;

        if (!maeCardStatus || !maeNextAction || !debitInq) {
            return null;
        }
        const maeCardTitle = debitInq.cardType;
        const maeCardNo = debitInq.cardNo;
        const mask = DataModel.maskCard(maeCardNo);
        const acc = {
            name: `${maeCardTitle} \n ${mask}`,
            const: maeCardNo,
            description: maeCardNo,
            title: maeCardTitle,
            value: `0.00`,
            type: `MAE`,
            code: `0`,
            isSelected: false,
            index: index + 1,
        };

        return acc;
    };

    getInitialState = () => {
        this.pullRefList = [];
        return {
            currentScreen: 1,
            data: "",
            dataBar: "",
            torchOn: false,
            timeExpired: false,
            time: 60,
            blure: false,
            dropDownView: false,
            selectedAccount: "",
            accountHolder: "",
            amountSet: false,
            amount: "",
            reactivate: true,
            accountList: [],
            m2uUserId: 0,
            mayaUserId: 0,
            flashOn: false,
            qrError: false,
            error: "",
            errorMessage: "",
            staticScan: false,
            staticQR: {},
            pullDone: false,
            permissionCheck: false,
            imageData: "",
            viewPdf: false,
            pdfFile: "",
            pdfBase64: "",
            selectionAccountList: [],
            qrtext: "",
            selectionPayAccountList: [],
            selectedPayAccount: "",
            accountPayHolder: "",
            pullRefNo: "",
            pullRefNoPrv: "",
            isCard: false,
            isDCard: false,
            pullStatusTime: moment().valueOf(),
            loader: false,
            pullCount: 0,
            dqTime: "",
            pqTime: "",
            primary: false,
            quickAction: false,
            wallet: false,
            fromRoute: "",
            fromStack: "",
            accData: {},
            showIndex: 0,
            payIndex: 0,
            setup: false,
            loop: 0,
            dailyLimitExceeded: false,
            dailyLimitScreen: "",
            filterTabs: ["PAY", "RECEIVE"],
            selectedTab: "PAY",
            accScreen: "",
            qrId: 0,
            paymentAccountNo: "",
            paymentAccountCode: "",
            paymentAccountType: "",
            isMaybank: false,
            m2uName: "",
            curTime: "",
            appState: AppState.currentState,
            barHeight: height / 15,
            pullRefreshed: false,
            currentTab: tabNameEnum.pay,
            loopList: [],
            pinRaised: false,
            refresNeed: false,
            // reactivateTime: 3000,
            qrActive: true,
            camera: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.auto,
                barcodeFinderVisible: true,
            },
            imageBG: null,
            crossBorderMerchantData: {},
        };
    };

    dailyLimitExceededCall = () => {
        this.setState({ dailyLimitScreen: "Pull", dailyLimitExceeded: true });
    };

    _toggleCancelModal = () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        const mode = isPostLogin ? "P" : "N";
        this.authTransaction(this.state.pullRefNo, mode, true, true);
        this.forceFail("exceed daily limit");
    };

    _toggleCloseModal = () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
    };

    changeDailyLimit = async () => {
        this.setState({ dailyLimitExceeded: !this.state.dailyLimitExceeded });
        const { getModel, updateModel } = this.props;
        const { isPostPassword, isPostLogin } = getModel("auth");
        this.setState({ pinRaised: true });
        if (isPostPassword || isPostLogin) {
            this.clearLoops();
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
                updateModel({
                    auth: { fallBack: true },
                });
                const httpResp = await invokeL2(true);
                const result = httpResp.data;
                console.log("result > ", result);
                const { code } = result;
                const { loginWith } = getModel("auth");
                if (code == 0) {
                    this.clearLoops();
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
                        this.clearLoops();
                        this.props.navigation.navigate(navigationConstant.QR_STACK, {
                            screen: "QrLimit",
                            params: {
                                limitUpdate: true,
                                qrType: this.state.dailyLimitScreen,
                                qrState: this.state,
                            },
                        });
                    } else {
                        this.setState({ pinRaised: false });
                        showErrorToast({ message: "Authentication failed" });
                    }
                }
            } catch (err) {
                console.log("err", err);
                //showErrorToast({ message: err.message });
                //this.setState({ pinRaised: false });
            }
        }
    };

    rightShowPress = (val, index) => {
        console.log("rightShowPress ", val);

        const account = val.description;
        const holder = val.title;
        const type = val.type;
        const request = {
            accountNo: account,
            amount: "",
            qrId: this.state.qrId,
        };
        getQRPushString("/qrpay/duitnow/generateTextDuitQR", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const qrObject = response?.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null && qrObject.code == 0) {
                    for (const item in this.state.selectionAccountList) {
                        this.state.selectionAccountList[item].primary = false;
                        this.state.selectionAccountList[item].selected = false;
                    }
                    this.state.selectionAccountList[index].primary = true;
                    this.state.selectionAccountList[index].selected = false;
                    if (this.state.time === 60) {
                        this.setState({
                            time: 59,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            dropDownView: false,
                            selectedAccount: account,
                            accountHolder: holder,
                            accountType: type,
                            showIndex: index,
                        });
                    } else {
                        this.setState({
                            time: 60,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            dropDownView: false,
                            selectedAccount: account,
                            accountHolder: holder,
                            accountType: type,
                            showIndex: index,
                        });
                    }
                } else {
                    showErrorToast({
                        message: qrObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
                this.setState({
                    dropDownView: false,
                });
            });
    };

    leftShowPress = () => {
        console.log("leftPullPress");

        this.setState({
            dropDownView: false,
            rand: Date.now(),
        });
    };

    rightPayPress = (val, index) => {
        clearInterval(this.state.loop);
        console.log("rightPayPress ", val);
        console.log("VAL", val);
        const account = val.description;
        const holder = val.title;
        const type = val.type;
        const isDCard = val.debitCard;
        //let holder = isDCard === true ? this.state.accountPayHolder : val.name;
        const isCard = val.card;
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        const mode = isPostLogin ? "P" : "N";
        //pull
        getQRPullString("/qrpay/pull/generate?accountNo=" + account + "&authMode=" + mode)
            .then(async (response) => {
                console.log("RES", response);
                const qrObject = response?.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null && qrObject.code === 0) {
                    for (const item in this.state.selectionPayAccountList) {
                        this.state.selectionPayAccountList[item].primary = false;
                        this.state.selectionPayAccountList[item].selected = false;
                    }
                    this.state.selectionPayAccountList[index].primary = true;
                    this.state.selectionPayAccountList[index].selected = false;
                    await clearInterval(this.state.loop);
                    if (this.state.time === 60) {
                        this.setState({
                            time: 59,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            dataBar: qrObject?.result?.barcode,
                            pullRefNo: qrObject?.result?.trxRefNo,
                            dropDownView: false,
                            selectedPayAccount: account,
                            accountPayHolder: holder,
                            accountType: type,
                            payIndex: index,
                            enableDone: false,
                            pullStatusTime: moment().valueOf(),
                            pullCount: 0,
                            loop: setInterval(this.pullRefreshCheck, 5000),
                            pqTime: moment().valueOf(),
                            pullRefNoPrv: "",
                        });
                    } else {
                        this.setState({
                            time: 60,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            dataBar: qrObject?.result?.barcode,
                            pullRefNo: qrObject?.result?.trxRefNo,
                            dropDownView: false,
                            selectedPayAccount: account,
                            accountPayHolder: holder,
                            accountType: type,
                            payIndex: index,
                            enableDone: false,
                            pullStatusTime: moment().valueOf(),
                            pullCount: 0,
                            loop: setInterval(this.pullRefreshCheck, 5000),
                            pqTime: moment().valueOf(),
                            pullRefNoPrv: "",
                        });
                    }
                    this.state.loopList.push(this.state.loop);
                } else {
                    showErrorToast({
                        message: qrObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.error.message });
                this.setState({
                    dropDownView: false,
                });
            });
    };

    leftPayPress = () => {
        console.log("leftPushPress");

        this.setState({
            dropDownView: false,
            rand: Date.now(),
        });
    };

    handleClose = () => {
        clearInterval(this.state.loop);
        console.log("this.state.setup " + this.state.setup);
        console.log("this.state.primary " + this.state.primary);
        if (this.state.setup) {
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
        } else {
            this.props.navigation.goBack();
        }
    };

    showClick = async (tabName) => {
        if (this.state.selectionAccountList.length == 0) {
            await this.updateAccounts("show");
        }
        this.setState({ loader: false, blure: false });
        if (this.state.selectionAccountList.length > 0) {
            const request = {
                accountNo: this.state.selectedAccount,
                amount: this.state.amount,
                qrId: this.state.qrId,
            };
            getQRPushString("/qrpay/duitnow/generateTextDuitQR", JSON.stringify(request))
                .then(async (response) => {
                    console.log("RES", response);
                    const qrObject = response.data;
                    console.log("Qrobject", qrObject);
                    if (qrObject !== null && qrObject.code == 0) {
                        await this.setM2uName();
                        this.setState({
                            currentScreen: 2,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            currentTab: tabName,
                            accScreen: "push",
                            dqTime: moment().valueOf(),
                        });
                    } else {
                        showErrorToast({
                            message: qrObject.message,
                        });
                    }
                })
                .catch((err) => {
                    console.log("ERR", err);
                    showErrorToast({ message: err.message });
                });
        } else {
            showErrorToast({
                message: "Server communication error",
            });
        }
    };

    pushRefresh = async () => {
        const request = {
            accountNo: this.state.selectedAccount,
            amount: this.state.amount,
            qrId: this.state.qrId,
        };
        getQRPushString("/qrpay/duitnow/generateTextDuitQR", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const qrObject = response?.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null && qrObject.code == 0) {
                    if (this.state.time === 60) {
                        this.setState({
                            time: 59,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            dqTime: moment().valueOf(),
                        });
                    } else {
                        this.setState({
                            time: 60,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            dqTime: moment().valueOf(),
                        });
                    }
                } else {
                    showErrorToast({
                        message: qrObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    dropClick = async () => {
        const { getModel, updateModel, route } = this.props;
        const { isPostPassword } = getModel("auth");
        const quickAction = route.params?.quickAction ?? false;

        if (isPostPassword) {
            this.setState({ currentScreen: 5 });
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
                    this.setState({ currentScreen: 5 });
                }
            } catch (err) {
                console.log("err", err);
            }
        }

        ScanPayGA.selectActionChangeAccount();
    };

    forceFail = (message) => {
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
                regFlow: false,
                quickAction: this.state.quickAction,
                chanceScreen: false,
                showChance: false,
            },
        });
        this.setState({ currentScreen: 1 });
        this.clearLoops();
    };

    authTransaction = (pullRefNo, mode, dailyLimit, cancelled) => {
        getQRPullTranAuth(
            "/qrpay/pull/transactionAuthorization?trxRefNo=" +
                pullRefNo +
                "&authMode=" +
                mode +
                "&totalDailyExceed=" +
                dailyLimit +
                "&cancelled=" +
                cancelled
        )
            .then((response) => {
                console.log("RES", response);
                const qrObject = response.data;
                console.log("Qrobject", qrObject);
                this.setState({ pinRaised: false });
                return true;
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
                this.setState({ pinRaised: false, pullRefNoPrv: "" });
                return false;
            });
    };

    pullPendingAuth = async (pullRefNo) => {
        try {
            this.setState({ pinRaised: true, pullRefNoPrv: pullRefNo });
            const { updateModel } = this.props;
            updateModel({
                auth: { fallBack: true },
            });
            const httpResp = await invokeL2(true);
            const result = httpResp.data;
            console.log("result > ", result);
            const { code } = result;
            const { getModel } = this.props;
            const { isPostLogin, loginWith } = getModel("auth");
            const mode = isPostLogin ? "P" : "N";
            if (code == 0) {
                if (!this.pullRefList.includes(pullRefNo)) {
                    this.pullRefList.push(pullRefNo);

                    return await this.authTransaction(pullRefNo, mode, false, false);
                }
            } else {
                if (loginWith == "PIN") {
                    this.forceFail("Limit not approved");
                } else {
                    showErrorToast({ message: "Authentication failed" });
                }
                this.setState({ pinRaised: false, pullRefNoPrv: "" });
                return false;
            }
        } catch (err) {
            console.log("err", err);
            showErrorToast({ message: err.message });
            this.setState({ pinRaised: false, pullRefNoPrv: "" });
            return false;
        }
    };

    navigateJomPayQR = async (merchantName, payeeCode, dynamicQrData) => {
        const { isPostLogin, isPostPassword } = this.props.getModel("auth");

        try {
            if (!isPostPassword || !isPostLogin) {
                const httpResp = await invokeL3(true);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    return;
                }
            }
            this.props.navigation.navigate(navigationConstant.JOMPAY_MODULE, {
                screen: navigationConstant.JOMPAY_PAYEE_DETAILS,
                params: {
                    isJomPayQR: true,
                    isFav: false,
                    billerInfo: {
                        billerName: merchantName,
                        billerCode: payeeCode,
                        billRef1: dynamicQrData?.billRef1,
                        billRef2: dynamicQrData?.billRef2,
                        amount: dynamicQrData?.amount,
                    },
                    // prevSelectedAccount: this.prevSelectedAccount,
                    fromModule: "QrStack",
                    fromScreen: "QrMain",
                    onGoBack: this.handleClose,
                },
            });
        } catch (error) {
            console.log("[QRPayMainScreen][invokeL3] >> Exception: ", error);
        } finally {
            this.setState({ loader: false });
        }
    };

    pullClick = async () => {
        if (this.state.selectionPayAccountList.length == 0) {
            await this.updateAccounts("pay");
            this.setState({ loader: false });
        }
        if (this.state.selectionPayAccountList.length > 0) {
            const { getModel } = this.props;
            const { isPostLogin } = getModel("auth");
            const mode = isPostLogin ? "P" : "N";
            getQRPullString(
                "/qrpay/pull/generate?accountNo=" +
                    this.state.selectedPayAccount +
                    "&authMode=" +
                    mode
            )
                .then(async (response) => {
                    console.log("RES", response);
                    const qrObject = response?.data;
                    console.log("Qrobject", qrObject);
                    if (qrObject !== null && qrObject.code === 0) {
                        await clearInterval(this.state.loop);
                        this.setState({
                            currentScreen: 3,
                            data: qrObject?.result?.qrtext,
                            dataBar: qrObject?.result?.barcode,
                            pullRefNo: qrObject?.result?.trxRefNo,
                            accountList: this.state.accountList,
                            selectedPayAccount: this.state.selectedPayAccount,
                            accountPayHolder: this.state.accountPayHolder,
                            enableDone: false,
                            pullStatusTime: moment().valueOf(),
                            pullCount: 0,
                            loop: setInterval(this.pullRefreshCheck, 5000),
                            accScreen: "pull",
                            pqTime: moment().valueOf(),
                            pullRefreshed: false,
                            pullRefNoPrv: "",
                        });
                        this.state.loopList.push(this.state.loop);
                    } else {
                        showErrorToast({
                            message: qrObject.message,
                        });
                    }
                })
                .catch((err) => {
                    console.log("ERR", err);
                });
        } else {
            showErrorToast({
                message: "Server communication error",
            });
        }

        ScanPayGA.selectActionShowQR();
    };

    onScanAvoid = async (e) => {
        console.log("onScanAvoid : " + JSON.stringify(e));
    };

    _onHandleDynamicQr = (dataFromQr, commonParams) => {
        const navigateParams =
            dataFromQr?.merchant === "N"
                ? {
                      ...commonParams,
                      trxRefNo: dataFromQr?.ref,
                      payerCustomerKey: dataFromQr?.payerCustomerKey,
                      payeeCustomerKey: dataFromQr?.payeeCustomerKey,
                      payerAccNo: dataFromQr?.payerAccNo,
                      payeeAccNo: dataFromQr?.payeeAccNo,
                      status: dataFromQr?.status,
                      payeeName: dataFromQr?.payeeName,
                      payerName: dataFromQr?.payerName,
                      payeeGcif: dataFromQr?.payeeGcif,
                      payeePhoneNo: dataFromQr?.payeePhoneNo,
                      dynamic: dataFromQr?.dynamic,
                      merchant: dataFromQr?.merchant,
                      accounts: this.state.selectionAccountList,
                  }
                : {
                      ...commonParams,
                      cyclicRedunChk: dataFromQr?.cyclicRedunChk,
                      merchantCity: dataFromQr?.merchantCity,
                      txnCurrCode: dataFromQr?.txnCurrCode,
                      postalCode: dataFromQr?.postalCode,
                      merchant: dataFromQr?.merchant,
                      mobileNo: dataFromQr?.mobileNo,
                      terminalId: dataFromQr?.terminalId,
                      merchantCatgCode: dataFromQr?.merchantCatgCode,
                      merchantAcctNo: dataFromQr?.accountNo,
                      acquirerFIID: dataFromQr?.acquirerId,
                      acquirerBank: dataFromQr?.acquirerBank,
                      merchantName: dataFromQr?.merchantName,
                      paymentType: dataFromQr?.paymentType,
                      merchantId: dataFromQr?.merchantId,
                      countryCode: dataFromQr?.countryCode,
                      trxRefNo: dataFromQr?.trxRefNo,
                      qrType: dataFromQr?.qrType,
                      applicationId: dataFromQr?.applicationId,
                      dynamic: dataFromQr?.dynamic,
                      qrVersion: dataFromQr?.qrVersion,
                      accounts: this.state.selectionAccountList,
                      lookUpRef: dataFromQr?.lookUpRef,
                      pymtType: dataFromQr?.pymtType,
                      qrCategory: dataFromQr?.qrCategory,
                      qraccptdSrcOfFund: dataFromQr?.qraccptdSrcOfFund,
                      promoCode: dataFromQr?.promoCode,
                  };

        this.props.navigation.navigate("QrStack", {
            screen: "QrConf",
            params: navigateParams,
        });
    };

    _handleJompayQR = (qrData, payeeCode) => {
        this.setState({ loader: true }, () => {
            if (qrData?.merchantName) {
                this.navigateJomPayQR(
                    qrData?.merchantName,
                    payeeCode,
                    qrData?.dynamic === "Y"
                        ? {
                              amount: qrData?.amount ?? "0.00",
                              billRef1: qrData?.reference1 ?? "",
                              billRef2: qrData?.reference2 ?? "",
                          }
                        : null
                );
            } else {
                this.setState({ loader: false });
                this.hasScanned = false;
                showErrorToast({ message: Strings.QR_ISSUE });
            }
        });
    };

    _validateDuitNow = async (e) => {
        this.showLoader(true);
        console.log("_validateDuitNow : " + JSON.stringify(e));
        try {
            if (this.state.selectionAccountList.length > 0) {
                const qrSString = e?.data;
                const response = await verifyQRString(
                    "/qrpay/duitnow/verifyMessageDuitQR",
                    JSON.stringify({
                        qrtext: qrSString.replace(`"`, `\"`),
                        fromAccountNo: this.state.selectedAccount,
                        fromAccountCode: this.state.accountCode,
                    })
                );
                console.log("RES", response);
                const qrObject = response?.data;
                console.log("Qrobject", qrObject);
                if (qrObject?.code === 0 && qrObject?.statusCode !== "9999") {
                    const crossBorderMerchantData =
                        qrObject?.result?.acquirerBank === Strings.QR_CROSS_BORDER ||
                        qrObject?.acquirerBank === Strings.QR_CROSS_BORDER
                            ? { ...qrObject, ...qrObject?.result }
                            : null;
                    if (qrObject?.result?.acquirerId === "898989") {
                        const disabledJompayQR =
                            qrObject?.result?.acquirerBank === "JOMPAYQR_DISABLE" ||
                            qrObject?.acquirerBank === "JOMPAYQR_DISABLE";
                        if (disabledJompayQR) {
                            showErrorToast({
                                message: Strings.QR_INVALID,
                                loader: false,
                            });
                        } else {
                            this.setState({ loader: true }, () => {
                                if (qrObject?.result?.merchantName) {
                                    this.navigateJomPayQR(
                                        qrObject?.result?.merchantName,
                                        qrObject?.payeeCode,
                                        qrObject?.result?.dynamic === "Y"
                                            ? {
                                                  amount: qrObject?.result?.amount ?? "0.00",
                                                  billRef1: qrObject?.result?.reference1 ?? "",
                                                  billRef2: qrObject?.result?.reference2 ?? "",
                                              }
                                            : null
                                    );
                                } else {
                                    this.setState({ loader: false });
                                    this.hasScanned = false;
                                    showErrorToast({ message: Strings.QR_ISSUE });
                                }
                            });
                        }
                    } else if (
                        (qrObject?.result?.dynamic === "Y" && !crossBorderMerchantData) ||
                        (qrObject?.result?.dynamic === "Y" &&
                            crossBorderMerchantData?.amount !== "")
                    ) {
                        const navQrParams =
                            qrObject?.result?.merchant === "N"
                                ? {
                                      crossBorderMerchantData,
                                      primary: this.state.primary,
                                      wallet: this.state.wallet,
                                      accountNo: this.state.paymentAccountNo,
                                      accountCode: this.state.paymentAccountCode,
                                      accountType: this.state.paymentAccountType,
                                      amount: qrObject?.result?.amount,
                                      txnAmt: qrObject?.result?.amount,
                                      ref: qrObject?.result?.ref,
                                      trxRefNo: qrObject?.result?.ref,
                                      payerCustomerKey: qrObject?.result?.payerCustomerKey,
                                      payeeCustomerKey: qrObject?.result?.payeeCustomerKey,
                                      payerAccNo: qrObject?.result?.payerAccNo,
                                      payeeAccNo: qrObject?.result?.payeeAccNo,
                                      status: qrObject?.result?.status,
                                      payeeName: qrObject?.result?.payeeName,
                                      payerName: qrObject?.result?.payerName,
                                      payeeGcif: qrObject?.result?.payeeGcif,
                                      payeePhoneNo: qrObject?.result?.payeePhoneNo,
                                      dynamic: qrObject?.result?.dynamic,
                                      merchant: qrObject?.result?.merchant,
                                      accounts: this.state.selectionAccountList,
                                      qrtext: e?.data,
                                      isMaybank: qrObject?.result?.maybank,
                                      quickAction: this.state.quickAction,
                                      date: moment().valueOf(),
                                  }
                                : {
                                      primary: this.state.primary,
                                      wallet: this.state.wallet,
                                      accountNo: this.state.paymentAccountNo,
                                      accountCode: this.state.paymentAccountCode,
                                      accountType: this.state.paymentAccountType,
                                      amount: qrObject?.result?.amount,
                                      txnAmt: qrObject?.result?.amount,
                                      cyclicRedunChk: qrObject?.result?.cyclicRedunChk,
                                      merchantCity: qrObject?.result?.merchantCity,
                                      txnCurrCode: qrObject?.result?.txnCurrCode,
                                      postalCode: qrObject?.result?.postalCode,
                                      merchant: qrObject?.result?.merchant,
                                      mobileNo: qrObject?.result?.mobileNo,
                                      terminalId: qrObject?.result?.terminalId,
                                      merchantCatgCode: qrObject?.result?.merchantCatgCode,
                                      merchantAcctNo: qrObject?.result?.accountNo,
                                      acquirerFIID: qrObject?.result?.acquirerId,
                                      acquirerBank: qrObject?.result?.acquirerBank,
                                      merchantName: qrObject?.result?.merchantName,
                                      paymentType: qrObject?.result?.paymentType,
                                      merchantId: qrObject?.result?.merchantId,
                                      countryCode: qrObject?.result?.countryCode,
                                      ref: qrObject?.result?.ref,
                                      trxRefNo: qrObject?.result?.trxRefNo,
                                      qrType: qrObject?.result?.qrType,
                                      applicationId: qrObject?.result?.applicationId,
                                      dynamic: qrObject?.result?.dynamic,
                                      qrVersion: qrObject?.result?.qrVersion,
                                      accounts: this.state.selectionAccountList,
                                      qrtext: e?.data,
                                      isMaybank: qrObject?.result?.maybank,
                                      lookUpRef: qrObject?.result?.lookUpRef,
                                      pymtType: qrObject?.result?.pymtType,
                                      qrCategory: qrObject?.result?.qrCategory,
                                      qraccptdSrcOfFund: qrObject?.result?.qraccptdSrcOfFund,
                                      promoCode: qrObject?.result?.promoCode,
                                      quickAction: this.state.quickAction,
                                      date: moment().valueOf(),
                                      crossBorderMerchantData,
                                  };

                        if (
                            qrObject?.result?.amount?.length <= 1 ||
                            qrObject?.result?.amount <= 0.01
                        ) {
                            showErrorToast({
                                message: "Your amount should be at least RM 0.01",
                            });
                        } else if (
                            qrObject?.result?.amount?.length <= 1 ||
                            qrObject?.result?.amount >= 1000
                        ) {
                            showErrorToast({
                                message: "Maximum limit per transfer is up to RM1,000",
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.QR_STACK, {
                                screen: "QrConf",
                                params: navQrParams,
                            });
                        }

                        this.setState({ loader: false });
                    } else {
                        console.log("sucesss is", qrObject);
                        this.setState({
                            qrActive: false,
                            staticScan: true,
                            staticQR: qrObject,
                            currentScreen: 4,
                            qrtext: e?.data,
                            isMaybank: qrObject?.result?.maybank,
                            loader: false,
                            crossBorderMerchantData,
                        });
                    }
                } else if (qrObject?.reason === "MB03") {
                    showErrorToast({
                        message: "Scan & Pay is not available in this country yet. Stay tuned!",
                        loader: false,
                    });
                    this.setState({
                        qrActive: false,
                        loader: false,
                    });
                    this.setState({ lastQrXBorderString: e.data.replace(`"`, `\``) });
                    this.disableRepeatedQRScans(this.state.lastQrXBorderString, e?.data);
                } else {
                    console.log("Error one object is", qrObject);
                    const errorMessage =
                        qrObject?.internalProperties?.message ||
                        qrObject?.statusDesc ||
                        errorMessageMap(qrObject?.errors);
                    console.log("errorMessage is", errorMessage);
                    if (errorMessage) {
                        showErrorToast({
                            message:
                                qrObject?.statusCode === "9999" ||
                                qrObject?.internalProperties?.message
                                    ? `Invalid QR Code. Please try again. [${
                                          qrObject?.reason ?? qrObject?.statusCode
                                      }]`
                                    : errorMessage,
                            qrActive: false,
                            loader: false,
                        });
                        this.setState({
                            qrActive: false,
                            loader: false,
                        });
                        this.setState({ lastQrXBorderString: e.data.replace(`"`, `\``) });
                        this.disableRepeatedQRScans(this.state.lastQrXBorderString, e?.data);
                    }
                }
            } else {
                this.setState({ loader: false });
                this.hasScanned = false;
                showErrorToast({ message: "Server communication error" });
            }
        } catch (err) {
            this.setState({ loader: false });
            console.log("Error", err);
            showErrorToast({ message: err.message });
        } finally {
            this.closeScanner();
        }
    };

    closeScanner = () => {
        const maxDelay = 150;
        this.endTime = new Date();
        const timeDiff = this.endTime - this.startTime;
        let delay = maxDelay - timeDiff;
        delay = delay < 0 ? maxDelay : delay;
        setTimeout(() => {
            this.hasScanned = false;
            this.setState({
                qrActive: true,
            });
        }, delay);

        this.showLoader(false);
    };

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    disableRepeatedQRScans = (lastQrXBorderString, qrString) => {
        if (lastQrXBorderString === qrString.replace(`"`, `\``)) {
            setTimeout(() => {
                this.setState({ lastQrXBorderString: "" });
            }, 2000);
            this.setState({ qrActive: true });
            this.hasScanned = false;
        }
    };

    navigateToAtmQrReg = (lastQrString, qrString) => {
        if (lastQrString === qrString.replace(`"`, `\"`) || !this.hasScanned) {
            setTimeout(() => {
                this.props.updateModel({
                    atm: {
                        lastQrString: "",
                    },
                });
            }, 30000);
            return;
        }
        this.props.updateModel({
            atm: {
                lastQrString: qrString,
            },
        });
        this.props.navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_CASHOUT_CONFIRMATION,
            params: { routeFrom: Strings.ATM_QR },
        });
    };

    onScan = async (e, isCCW) => {
        const { isEnabled, isOnboarded, lastQrString } = this.props.getModel("atm");
        const { atmCashOutReady } = this.props.getModel("misc");

        try {
            if (!this.state.qrActive) {
                return;
            }
            if (Platform.OS === "ios") {
                if (e === null) {
                    this.setState({ loader: false });
                    this.hasScanned = false;
                    return;
                }
            } else {
                e.data = e?.barcodes?.length > 0 ? e?.barcodes[0]?.data || e?.data : e?.data;
                // if (isPureHuawei) {
                if (e?.data !== null) {
                    if (e?.data?.length === 0) {
                        this.hasScanned = false;
                        return;
                    }
                    this.setState({
                        qrActive: false,
                    });
                    this.startTime = new Date();
                }
                Vibration?.vibrate();
            }

            const qrParams = getQRParams(e.data);

            if (isCCW) {
                this.showLoader(true);
                if (!atmCashOutReady) {
                    showErrorToast({
                        message: Strings.QR_INVALID,
                        loader: false,
                    });
                    this.showLoader(false);
                } else if (isEnabled || isOnboarded) {
                    const { routeFrom, transferAmount } = this.props.route?.params;
                    if (lastQrString === e.data.replace(`"`, `\"`) || !this.hasScanned) {
                        return;
                    }
                    const entryPoint =
                        routeFrom &&
                        (routeFrom === Strings.PREFERRED_AMOUNT ||
                            routeFrom === navigationConstant.ATM_PREFERRED_AMOUNT)
                            ? navigationConstant.ATM_PREFERRED_AMOUNT
                            : Strings.ATM_QR;
                    const onboardingResponse = await checkAtmOnboarding();
                    if (onboardingResponse?.status === 200) {
                        const { result, code } = onboardingResponse?.data;
                        if (result?.status === "ACTIVE") {
                            const preferredList = onboardingResponse?.data?.result?.preferred_amount
                                ? JSON.parse(onboardingResponse?.data?.result?.preferred_amount)
                                : null;
                            const invalidVal = !preferredList || preferredList === {};
                            const listOfAmount =
                                preferredList?.length > 0 && !invalidVal ? preferredList : [];
                            const response = await validateATMQR(
                                JSON.stringify({
                                    qrtext: e.data.replace(`"`, `\"`),
                                })
                            );
                            const timestamp = new Date().getTime();
                            const atmQRresponse = response?.data;
                            // console.log("### atmQRresponse", atmQRresponse);
                            if (atmQRresponse?.code === 200 && atmQRresponse?.result?.qrtext) {
                                this.props.updateModel({
                                    atm: {
                                        lastQrString: atmQRresponse?.result?.qrtext,
                                        preferredAmount: listOfAmount,
                                    },
                                });
                                const scanWithAmount =
                                    entryPoint === navigationConstant.ATM_PREFERRED_AMOUNT &&
                                    transferAmount;
                                const hasFavs = listOfAmount && listOfAmount.length > 0;
                                const scanWithOutAmountPage =
                                    hasFavs &&
                                    entryPoint !== navigationConstant.ATM_PREFERRED_AMOUNT
                                        ? navigationConstant.ATM_PREFERRED_AMOUNT
                                        : navigationConstant.ATM_AMOUNT_SCREEN;
                                this.props.navigation.navigate(
                                    navigationConstant.ATM_CASHOUT_STACK,
                                    {
                                        screen: scanWithAmount
                                            ? navigationConstant.ATM_WITHDRAW_CONFIRMATION
                                            : scanWithOutAmountPage,

                                        params: {
                                            ...this.props.route?.params,
                                            routeFrom: Strings.ATM_QR,
                                            qrText: atmQRresponse?.result?.qrtext,
                                            refNo: atmQRresponse?.result?.refNo,
                                            timestamp,
                                            transferAmount: this.props.route.params?.transferAmount,
                                            is24HrCompleted: true,
                                            mins: atmQRresponse?.result?.timeoutTimer
                                                ? parseInt(atmQRresponse?.result?.timeoutTimer, 10)
                                                : null,
                                            preferredAmountList: listOfAmount,
                                            custName:
                                                onboardingResponse?.data?.result?.customerName,
                                            feeCharge: atmQRresponse?.result?.serviceFee,
                                            favAmountList:
                                                listOfAmount?.length > 0
                                                    ? listOfAmount.map(
                                                          (favAmount) => favAmount?.amount
                                                      )
                                                    : [],
                                        },
                                    }
                                );
                            } else {
                                showErrorToast({ message: atmQRresponse?.result?.statusDesc });
                                this.hasScanned = false;
                            }
                        } else if (code === 400) {
                            showErrorToast({ message: Strings.COMMON_ERROR_MSG });
                            this.hasScanned = false;
                        } else {
                            showInfoToast({
                                message:
                                    "For security purposes, there will be 24-hour waiting period after set up before you can use the ATM Cash-out feature to withdraw cash.",
                            });
                            this.hasScanned = false;
                        }
                    }
                } else {
                    this.navigateToAtmQrReg(lastQrString, e?.data);
                }
            } else if (qrParams?.module === "SSL") {
                this.handleSSLTableOrderLink({ params: qrParams });
            } else {
                console.info("this.props.route?.params: ", this.props.route?.params);
                if (
                    this.props.route?.params?.routeFrom === Strings.PREFERRED_AMOUNT ||
                    this.props.route?.params?.routeFrom === "PreferredAmount"
                ) {
                    return;
                }

                if (this.state.selectionAccountList.length === 0) {
                    await this.updateAccounts("show");
                    this.setState({ loader: false });
                }
                if (this.state.lastQrXBorderString === e.data.replace(`"`, `\``)) {
                    this.hasScanned = false;
                    this.setState({ qrActive: true });
                    return;
                }
                this._validateDuitNow(e);
            }
        } catch (ex) {
            console.log("### [QRPayMainScreen] >> [onScan]: ", ex);
            if (ex?.error?.error?.message) {
                showErrorToast({ message: ex?.error?.error?.message });
            }
            this.showLoader(false);
            this.hasScanned = false;
        } finally {
            this.setState({
                loader: false,
                qrActive: true,
            });
            this.showLoader(false);
        }
    };

    handleSSLTableOrderLink = ({ params }) => {
        const { updateModel, navigation } = this.props;
        if (params?.merchant_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: navigationConstant.SSL_MERCHANT_DETAILS,
                        merchantId: params?.merchant_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }
        if (params?.chain_id && params?.table_no) {
            updateModel({
                ssl: {
                    redirect: {
                        screen: navigationConstant.SSL_MERCHANT_LISTING_V2,
                        chainId: params?.chain_id,
                        tableNo: params?.table_no,
                    },
                },
            });
        }

        navigation.navigate(navigationConstant.SSL_STACK, {
            screen: navigationConstant.SSL_START,
        });
    };

    filterPreferredAmount = (preferredList) => {
        const newArr = [];
        for (const acc in preferredList) {
            if (acc.length > 10 && newArr.length < 3) {
                const amountInfo = JSON.parse(preferredList[acc]);
                for (const counter in amountInfo) {
                    if (amountInfo[counter].includes(".00")) {
                        newArr.push({
                            id: newArr.length + 1,
                            amount: amountInfo[counter],
                            accountNo: acc,
                        });
                    }
                }
            }
        }
        return newArr;
    };

    onScan_ = async (e, isCCW) => {
        const { isEnabled, isOnboarded, lastQrString } = this.props.getModel("atm");
        const { atmCashOutReady } = this.props.getModel("misc");

        try {
            if (!this.state.qrActive) {
                return;
            }
            if (Platform.OS === "ios") {
                if (e === null) {
                    this.setState({ loader: false });
                    this.hasScanned = false;
                    return;
                }
            } else {
                if (e?.barcodes) {
                    if (e?.barcodes.length === 0) {
                        this.hasScanned = false;
                        return;
                    }

                    e.data = e?.barcodes[0].data;
                    console.log(JSON.stringify(e));
                    this.setState({
                        qrActive: false,
                    });

                    this.startTime = new Date();
                }
                Vibration?.vibrate();
            }

            const { updateModel } = this.props;
            updateModel({
                qrPay: { qrtext: e?.data },
            });

            if (isCCW) {
                this.showLoader(true);
                if (!atmCashOutReady) {
                    showErrorToast({
                        message: Strings.QR_INVALID,
                        loader: false,
                    });
                    this.showLoader(false);
                    this.hasScanned = false;
                } else if (isEnabled || isOnboarded) {
                    const { routeFrom, transferAmount } = this.props.route?.params;
                    if (lastQrString === e.data.replace(`"`, `\"`) || !this.hasScanned) {
                        return;
                    }
                    const entryPoint =
                        routeFrom &&
                        (routeFrom === Strings.PREFERRED_AMOUNT ||
                            routeFrom === navigationConstant.ATM_PREFERRED_AMOUNT)
                            ? navigationConstant.ATM_PREFERRED_AMOUNT
                            : Strings.ATM_QR;
                    const onboardingResponse = await checkAtmOnboarding();
                    // console.log("onboardingResponse > ", onboardingResponse?.data);
                    if (onboardingResponse?.status === 200) {
                        const { result, code } = onboardingResponse?.data;
                        if (result?.status === "ACTIVE") {
                            const preferredList = onboardingResponse?.data?.result?.preferred_amount
                                ? JSON.parse(onboardingResponse?.data?.result?.preferred_amount)
                                : null;
                            const invalidVal = !preferredList || preferredList === {};
                            const listOfAmount =
                                preferredList?.length > 0 && !invalidVal ? preferredList : [];
                            const response = await validateATMQR(
                                JSON.stringify({
                                    qrtext: e.data.replace(`"`, `\"`),
                                })
                            );
                            const timestamp = new Date().getTime();
                            const atmQRresponse = response?.data;
                            // console.log("### atmQRresponse", atmQRresponse);
                            if (atmQRresponse?.code === 200 && atmQRresponse?.result?.qrtext) {
                                this.props.updateModel({
                                    atm: {
                                        lastQrString: atmQRresponse?.result?.qrtext,
                                        preferredAmount: listOfAmount,
                                    },
                                });
                                const scanWithAmount =
                                    entryPoint === navigationConstant.ATM_PREFERRED_AMOUNT &&
                                    transferAmount;
                                const hasFavs = listOfAmount && listOfAmount.length > 0;
                                const scanWithOutAmountPage =
                                    hasFavs &&
                                    entryPoint !== navigationConstant.ATM_PREFERRED_AMOUNT
                                        ? navigationConstant.ATM_PREFERRED_AMOUNT
                                        : navigationConstant.ATM_AMOUNT_SCREEN;
                                this.props.navigation.navigate(
                                    navigationConstant.ATM_CASHOUT_STACK,
                                    {
                                        screen: scanWithAmount
                                            ? navigationConstant.ATM_WITHDRAW_CONFIRMATION
                                            : scanWithOutAmountPage,

                                        params: {
                                            ...this.props.route?.params,
                                            routeFrom: Strings.ATM_QR,
                                            qrText: atmQRresponse?.result?.qrtext,
                                            refNo: atmQRresponse?.result?.refNo,
                                            timestamp,
                                            transferAmount: this.props.route.params?.transferAmount,
                                            is24HrCompleted: true,
                                            mins: atmQRresponse?.result?.timeoutTimer
                                                ? parseInt(atmQRresponse?.result?.timeoutTimer)
                                                : null,
                                            preferredAmountList: listOfAmount,
                                            custName:
                                                onboardingResponse?.data?.result?.customerName,
                                            feeCharge: atmQRresponse?.result?.serviceFee,
                                            favAmountList:
                                                listOfAmount?.length > 0
                                                    ? listOfAmount.map(
                                                          (favAmount) => favAmount?.amount
                                                      )
                                                    : [],
                                        },
                                    }
                                );
                            } else {
                                showErrorToast({ message: atmQRresponse?.result?.statusDesc });
                                this.hasScanned = false;
                            }
                        } else if (code === 400) {
                            showErrorToast({ message: Strings.COMMON_ERROR_MSG });
                            this.hasScanned = false;
                        } else {
                            showInfoToast({
                                message:
                                    "For security purposes, there will be 24-hour waiting period after set up before you can use the ATM Cash-out feature to withdraw cash.",
                            });
                            this.hasScanned = false;
                        }
                    }
                } else {
                    this.navigateToAtmQrReg(lastQrString, e?.data);
                }
            } else {
                console.info("this.props.route?.params: ", this.props.route?.params);
                if (
                    this.props.route?.params?.routeFrom === Strings.PREFERRED_AMOUNT ||
                    this.props.route?.params?.routeFrom === "PreferredAmount"
                ) {
                    return;
                }

                if (this.state.selectionAccountList.length === 0) {
                    await this.updateAccounts("show");
                    this.setState({ loader: false });
                }
                if (this.state.lastQrXBorderString === e.data.replace(`"`, `\``)) {
                    this.hasScanned = false;
                    this.setState({ qrActive: true });
                    return;
                }
                this._validateDuitNow(e);
            }
        } catch (ex) {
            console.log("### [QRPayMainScreen] >> [onScan]: ", ex);
            if (ex?.error?.error?.message) {
                showErrorToast({ message: ex?.error?.error?.message });
            }
            this.showLoader(false);
            this.hasScanned = false;
        } finally {
            this.setState({
                loader: false,
                qrActive: true,
            });
            this.showLoader(false);
        }
    };

    handleOnRead = async (barcode) => {
        if (Platform.OS !== "ios") return;

        if (barcode?.type !== "UNKNOWN_FORMAT" && barcode?.data && !this?.hasScanned) {
            this.hasScanned = true;
            await this.onScan(barcode, barcode?.data?.includes("01ATMCC"));
        }
    };

    /**
     * there's a bug onGoogleMLscan
     * starting on Google Play Services 20.21.17 where it
     * seems to be triggering the callback all the time
     *
     * to limit this, we check for
     * 1) the barcodes entry to exists
     * 2) we also check so that the type are not an unknown format
     * 3) and since its always scanning, we use a static flag to keep track scanned status
     *
     * Does not seems to be resolve yet and not on the library AFAIK.
     *
     * https://github.com/react-native-camera/react-native-camera/issues/2875
     */
    handleOnBarcodesDetected = async (data) => {
        if (Platform.OS === "ios" || !this.state.qrActive) {
            return;
        }
        if (
            data?.barcodes?.length &&
            data?.barcodes[0].type !== "UNKNOWN_FORMAT" &&
            !this.hasScanned
        ) {
            this.hasScanned = true;

            await this.onScan(data, data?.barcodes[0]?.data?.includes("01ATMCC"));
        }
    };

    navigateToStaticCrossBorder = (qrObject, qrText, amount) => {
        this.props.navigation.navigate("QrStack", {
            screen: "QrConf",
            params: {
                primary: this.state.primary,
                wallet: this.state.wallet,
                accountNo: this.state.paymentAccountNo,
                accountCode: this.state.paymentAccountCode,
                accountType: this.state.paymentAccountType,
                amount: qrObject?.result?.amount || amount,
                txnAmt: qrObject?.result?.amount || amount,
                cyclicRedunChk: qrObject?.result?.cyclicRedunChk,
                merchantCity: qrObject?.result?.merchantCity,
                txnCurrCode: qrObject?.result?.txnCurrCode,
                postalCode: qrObject?.result?.postalCode,
                merchant: qrObject?.result?.merchant,
                mobileNo: qrObject?.result?.mobileNo,
                terminalId: qrObject?.result?.terminalId,
                merchantCatgCode: qrObject?.result?.merchantCatgCode,
                merchantAcctNo: qrObject?.result?.accountNo,
                acquirerFIID: qrObject?.result?.acquirerId,
                acquirerBank: qrObject?.result?.acquirerBank,
                merchantName: qrObject?.result?.merchantName,
                paymentType: qrObject?.result?.paymentType,
                merchantId: qrObject?.result?.merchantId,
                countryCode: qrObject?.result?.countryCode,
                ref: qrObject?.result?.ref,
                trxRefNo: qrObject?.result?.trxRefNo,
                qrType: qrObject?.result?.qrType,
                applicationId: qrObject?.result?.applicationId,
                dynamic: qrObject?.result?.dynamic,
                qrVersion: qrObject?.result?.qrVersion,
                accounts: this.state.selectionAccountList,
                qrtext: qrText || qrObject?.data,
                isMaybank: qrObject?.result?.maybank,
                lookUpRef: qrObject?.result?.lookUpRef,
                pymtType: qrObject?.result?.pymtType,
                qrCategory: qrObject?.result?.qrCategory,
                qraccptdSrcOfFund: qrObject?.result?.qraccptdSrcOfFund,
                promoCode: qrObject?.result?.promoCode,
                quickAction: this.state.quickAction,
                date: moment().valueOf(),
                crossBorderMerchantData: { ...qrObject, amount },
            },
        });
    };
    verifyOtherBankQrCode = async (qrObject, qrText, amount) => {
        if (qrObject != null) {
            if (qrObject?.acquirerBank === Strings.QR_CROSS_BORDER) {
                this.navigateToStaticCrossBorder(qrObject, qrText, amount);
                return;
            }
            console.log("QRDATA > ", qrObject);
            try {
                const request = {
                    qrText,
                    amount,
                    fromAccountNo: this.state.selectedAccount,
                    fromAccountCode: this.state.accountCode,
                };
                const respo = await qrMerchantInquiry(
                    "/qrpay/merchant/duitnowQRInquiry",
                    JSON.stringify(request)
                );

                const miObject = respo?.data;
                console.log("MiObject", miObject);
                if (miObject?.result && miObject?.code == 200) {
                    const {
                        acquirerBank,
                        acquirerId,
                        cyclicRedunChk,
                        dynamic,
                        merchantCity,
                        merchantCatgCode,
                        mobileNo,
                        payeeAccNo,
                        postalCode,
                        txnCurrCode,
                        terminalId,
                    } = qrObject?.result || {};
                    const commonParams = {
                        primary: this.state.primary,
                        wallet: this.state.wallet,
                        accountNo: this.state.paymentAccountNo,
                        accountCode: this.state.paymentAccountCode,
                        accountType: this.state.paymentAccountType,
                        cyclicRedunChk,
                        merchantCity,
                        txnCurrCode,
                        postalCode,
                        merchant: miObject.result.merchant,
                        mobileNo,
                        terminalId,
                        merchantCatgCode,
                        merchantAcctNo: payeeAccNo,
                        acquirerFIID: acquirerId,
                        acquirerBank,
                        merchantName: miObject.result.payeeName,
                        paymentType: miObject.result.paymentType,
                        merchantId: miObject.result.merchantId,
                        countryCode: miObject.result.countryCode,
                        ref: miObject.result.ref,
                        trxRefNo: miObject.result.ref,
                        qrType: miObject.result.qrType,
                        applicationId: miObject.result.applicationId,
                        dynamic,
                        txnAmt: amount,
                        amount,
                        qrVersion: miObject.result.qrVersion,
                        accounts: this.state.selectionAccountList,
                        qrtext: qrText,
                        lookUpRef: miObject.result.lookUpRef,
                        promoCodeM: miObject.result.promoCode,
                        qrCategory: miObject.result.qrCategory,
                        creditorAcctTyp: miObject.result.creditorAcctTyp,
                        qraccptdSrcOfFund: miObject.result.qraccptdSrcOfFund,
                        pymtType: miObject.result.pymtTyp,
                        quickAction: this.state.quickAction,
                        date: moment().valueOf(),
                    };
                    const navParams =
                        miObject?.result?.merchant === "N"
                            ? {
                                  ...commonParams,
                                  payeeName: miObject.result.payeeName,
                              }
                            : commonParams;

                    this.props.navigation.navigate("QrStack", {
                        screen: "QrConf",
                        params: navParams,
                    });
                } else {
                    showErrorToast({
                        message: miObject.result.statusDesc ?? "Server communication error",
                    });
                }
            } catch (err) {
                showErrorToast({ message: err.message });
            }
        }
    };

    accountSelect = (accounts) => {
        let account = {};
        let index = 0;
        for (let j = 0; j < accounts.length; j++) {
            if (accounts[j].isSelected) {
                account = accounts[j];
                index = j;
            }
        }
        if (this.state.accScreen == "pull") {
            this.setState({ currentScreen: 3, selectionPayAccountList: accounts });
            this.rightPayPress(account, index);
        } else {
            this.setState({ currentScreen: 2, selectionAccountList: accounts });
            this.rightShowPress(account, index);
        }
    };

    accountCancel = (accounts) => {
        let account = {};
        let index = 0;
        if (this.state.accScreen == "pull") {
            this.setState({ currentScreen: 3 });
            for (let j = 0; j < accounts.length; j++) {
                if (accounts[j].isSelected) {
                    account = accounts[j];
                    index = j;
                }
            }
            this.rightPayPress(account, index);
        } else {
            this.setState({ currentScreen: 2 });
            for (let j = 0; j < accounts.length; j++) {
                if (accounts[j].isSelected) {
                    account = accounts[j];
                    index = j;
                }
            }
            this.rightShowPress(account, index);
        }
    };

    amountEnter = async (amount) => {
        console.log("Amount > ", amount);
        if (this.state.staticScan) {
            if (this.state.staticQR !== null && this.state.staticQR.code === 0) {
                if (this.state.selectionAccountList.length == 0) {
                    await this.updateAccounts("show");
                    this.setState({ loader: false });
                }
                console.log("qr object is", this.state.staticQR);

                if (this.state.isMaybank) {
                    if (this.state.staticQR.result.merchant == "N") {
                        this.props.navigation.navigate("QrStack", {
                            screen: "QrConf",
                            params: {
                                primary: this.state.primary,
                                wallet: this.state.wallet,
                                accountNo: this.state.paymentAccountNo,
                                accountCode: this.state.paymentAccountCode,
                                accountType: this.state.paymentAccountType,
                                amount,
                                ref: this.state.staticQR.result.ref,
                                trxRefNo: this.state.staticQR.result.ref,
                                payerCustomerKey: this.state.staticQR.result.payerCustomerKey,
                                payeeCustomerKey: this.state.staticQR.result.payeeCustomerKey,
                                payerAccNo: this.state.staticQR.result.payerAccNo,
                                payeeAccNo: this.state.staticQR.result.payeeAccNo,
                                status: this.state.staticQR.result.status,
                                payeeName: this.state.staticQR.result.payeeName,
                                payerName: this.state.staticQR.result.payerName,
                                payeeGcif: this.state.staticQR.result.payeeGcif,
                                payeePhoneNo: this.state.staticQR.result.payeePhoneNo,
                                merchant: this.state.staticQR.result.merchant,
                                dynamic: this.state.staticQR.result.dynamic,
                                accounts: this.state.selectionAccountList,
                                qrtext: this.state.qrtext,
                                isMaybank: this.state.staticQR.result.maybank,
                                quickAction: this.state.quickAction,
                                date: moment().valueOf(),
                            },
                        });
                    } else {
                        this.props.navigation.navigate("QrStack", {
                            screen: "QrConf",
                            params: {
                                primary: this.state.primary,
                                wallet: this.state.wallet,
                                accountNo: this.state.paymentAccountNo,
                                accountCode: this.state.paymentAccountCode,
                                accountType: this.state.paymentAccountType,
                                amount,
                                cyclicRedunChk: this.state.staticQR.result.cyclicRedunChk,
                                merchantCity: this.state.staticQR.result.merchantCity,
                                txnCurrCode: this.state.staticQR.result.txnCurrCode,
                                postalCode: this.state.staticQR.result.postalCode,
                                merchant: this.state.staticQR.result.merchant,
                                mobileNo: this.state.staticQR.result.mobileNo,
                                terminalId: this.state.staticQR.result.terminalId,
                                merchantCatgCode: this.state.staticQR.result.merchantCatgCode,
                                merchantAcctNo: this.state.staticQR.result.accountNo,
                                acquirerFIID: this.state.staticQR.result.acquirerId,
                                acquirerBank: this.state.staticQR.result.acquirerBank,
                                merchantName: this.state.staticQR.result.merchantName,
                                paymentType: this.state.staticQR.result.paymentType,
                                merchantId: this.state.staticQR.result.merchantId,
                                countryCode: this.state.staticQR.result.countryCode,
                                ref: this.state.staticQR.result.ref,
                                trxRefNo: this.state.staticQR.result.trxRefNo,
                                qrType: this.state.staticQR.result.qrType,
                                applicationId: this.state.staticQR.result.applicationId,
                                dynamic: this.state.staticQR.result.dynamic,
                                txnAmt: amount,
                                qrVersion: this.state.staticQR.result.qrVersion,
                                accounts: this.state.selectionAccountList,
                                qrtext: this.state.qrtext,
                                isMaybank: this.state.staticQR.result.maybank,
                                quickAction: this.state.quickAction,
                                date: moment().valueOf(),
                            },
                        });
                    }
                } else {
                    await this.verifyOtherBankQrCode(
                        this.state.staticQR,
                        this.state.qrtext,
                        amount
                    );
                }
            }
        } else {
            const request = {
                accountNo: this.state.selectedAccount,
                amount,
                qrId: this.state.qrId,
            };
            getQRPushString("/qrpay/duitnow/generateTextDuitQR", JSON.stringify(request))
                .then(async (response) => {
                    console.log("RES", response);
                    const qrObject = response?.data;
                    console.log("Qrobject", qrObject);
                    if (qrObject !== null && qrObject.code == 0) {
                        this.setState({
                            amountSet: true,
                            amount,
                            currentScreen: 2,
                            data: qrObject?.result?.qrtext,
                            qrId:
                                qrObject?.result?.qrId != null
                                    ? qrObject?.result?.qrId
                                    : this.state.qrId,
                            dqTime: moment().valueOf(),
                        });
                    } else {
                        showErrorToast({
                            message: qrObject.message,
                        });
                    }
                })
                .catch((err) => {
                    console.log("ERR", err);
                    showErrorToast({ message: err.message });
                });

            logEvent(Strings.FA_VIEW_SCREEN, {
                [Strings.FA_SCREEN_NAME]: Strings.FA_SCANPAY_RECEIVE_QRCODE,
            });
            ScanPayGA.viewScreenReceiveQR();
        }
    };

    amountBack = () => {
        this.hasScanned = false;
        if (this.state.staticScan) {
            this.setState({ currentScreen: 1 });
        } else {
            this.setState({ currentScreen: 2 });
        }
    };

    setM2uName = () => {
        getQRUserName("/qrpay/getFullUserName")
            .then(async (response) => {
                console.log("RES", response);
                const Object = response.data;
                console.log("Object", Object);
                this.setState({
                    m2uName: Object.result,
                });
            })
            .catch((err) => {
                this.setState({
                    m2uName: "UnKnown",
                });
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    clearLoops = () => {
        for (const l in this.state.loopList) {
            console.log("Clear > " + l);
            clearInterval(l);
        }
        this.setState({ enableDone: false, loopList: [] });
    };

    pullScanCheck = () => {
        if (
            this.state.enableDone === true &&
            this.state.currentScreen === 3 &&
            !this.state.pinRaised
        ) {
            getQRPullStatus("/qrpay/pull/status?trxRefNo=" + this.state.pullRefNo)
                .then(async (response) => {
                    console.log("RES", response);
                    const qrObject = response?.data;
                    console.log("Qrobject", qrObject);
                    if (qrObject !== null) {
                        //check
                        if (
                            qrObject?.result?.status == "Pending" ||
                            qrObject?.result?.status == "pending"
                        ) {
                            if (this.state.pullRefNo !== this.state.pullRefNoPrv) {
                                const status = await this.pullPendingAuth(this.state.pullRefNo);
                                if (status) {
                                    showInfoToast({
                                        message: "Transaction Authorized",
                                        position: "top",
                                        duration: 3000,
                                        autoHide: true,
                                    });
                                }
                            }
                            this.setState({ pinRaised: false });
                        } else if (qrObject?.result?.status == "Success") {
                            clearInterval(this.state.loop);
                            this.props.navigation.navigate("QrStack", {
                                screen: "QrAck",
                                params: {
                                    primary: this.state.primary,
                                    wallet: this.state.wallet,
                                    trxRef:
                                        qrObject?.result?.trxRef == null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    paymentRef:
                                        qrObject?.result?.paymentRef == null
                                            ? "NA"
                                            : qrObject?.result?.paymentRef,
                                    trxDateTimeFomat: qrObject?.result?.trxTime,
                                    amount: qrObject?.result?.amount,
                                    payeeAccountNo: "",
                                    payeeName: qrObject?.result?.merchantName,
                                    merchant: "Y",
                                    code: "0",
                                    message: qrObject?.result?.description,
                                    validPromo: "false",
                                    promoPct: "",
                                    promoType: "",
                                    referenceText: "",
                                    pull: "Y",
                                    regFlow: false,
                                    cashBackAmt: qrObject?.result?.cashBackAmt,
                                    showCB: true,
                                    s2w: qrObject?.result?.s2w,
                                    chanceScreen: true,
                                    showChance: false,
                                },
                            });
                            this.setState({ currentScreen: 1 });
                            clearInterval(this.state.loop);
                            this.clearLoops();
                        } else if (qrObject?.result?.status == "Initiated") {
                            showInfoToast({
                                message: "Transaction is still pending.",
                                position: "top",
                                duration: 3000,
                                autoHide: true,
                            });
                        } else if (qrObject?.result?.status == "Limit") {
                            this.dailyLimitExceededCall();
                        } else if (qrObject?.result?.status == "Failed") {
                            clearInterval(this.state.loop);
                            this.props.navigation.navigate("QrStack", {
                                screen: "QrAck",
                                params: {
                                    primary: this.state.primary,
                                    wallet: this.state.wallet,
                                    trxRef:
                                        qrObject?.result?.trxRef === null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    paymentRef:
                                        qrObject?.result?.trxRef === null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    trxDateTimeFomat: qrObject?.result?.trxTime,
                                    amount: qrObject?.result?.amount,
                                    payeeAccountNo: "",
                                    payeeName: qrObject?.result?.merchantName,
                                    merchant: "Y",
                                    code: "1",
                                    message:
                                        qrObject?.result?.description === "pending" ||
                                        qrObject?.result?.description === "Pending"
                                            ? ""
                                            : qrObject?.result?.description,
                                    validPromo: "false",
                                    promoPct: "",
                                    promoType: "",
                                    referenceText: "",
                                    pull: "Y",
                                    regFlow: false,
                                    cashBackAmt: qrObject?.result?.cashBackAmt,
                                    showCB: true,
                                    chanceScreen: true,
                                    showChance: false,
                                },
                            });
                            this.setState({ currentScreen: 1 });
                            clearInterval(this.state.loop);
                            this.clearLoops();
                        } else {
                            showInfoToast({
                                message: `System not responding`,
                                position: "top",
                                duration: 3000,
                                autoHide: true,
                            });
                        }
                    } else {
                        showErrorToast({
                            message: qrObject.message,
                        });
                    }
                })
                .catch((err) => {
                    console.log("ERR", err);
                    showErrorToast({ message: err.message });
                });
        }

        if (this.state.currentScreen !== 3) {
            this.clearLoops();
        }
    };

    pullRefreshCheck = () => {
        console.log("Call > " + this.state.enableDone);
        if (
            this.state.enableDone &&
            !this.state.blure &&
            this.state.currentScreen === 3 &&
            !this.state.pinRaised
        ) {
            getQRPullStatus("/qrpay/pull/status?trxRefNo=" + this.state.pullRefNo)
                .then(async (response) => {
                    console.log("RES", response);
                    const qrObject = response?.data;
                    console.log("Qrobject", qrObject);
                    if (qrObject !== null) {
                        if (
                            qrObject?.result?.status == "Pending" ||
                            qrObject?.result?.status == "pending"
                        ) {
                            if (this.state.pullRefNo !== this.state.pullRefNoPrv) {
                                const status = await this.pullPendingAuth(this.state.pullRefNo);
                                if (status) {
                                    showInfoToast({
                                        message: "Transaction Authorized",
                                        position: "top",
                                        duration: 3000,
                                        autoHide: true,
                                    });
                                }
                            }
                            this.setState({ pinRaised: false });
                        } else if (qrObject?.result?.status == "Success") {
                            clearInterval(this.state.loop);
                            this.props.navigation.navigate("QrStack", {
                                screen: "QrAck",
                                params: {
                                    primary: this.state.primary,
                                    wallet: this.state.wallet,
                                    trxRef:
                                        qrObject?.result?.trxRef == null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    paymentRef:
                                        qrObject?.result?.paymentRef == null
                                            ? "NA"
                                            : qrObject?.result?.paymentRef,
                                    trxDateTimeFomat: qrObject?.result?.trxTime,
                                    amount: qrObject?.result?.amount,
                                    payeeAccountNo: "",
                                    payeeName: qrObject?.result?.merchantName,
                                    merchant: "Y",
                                    code: "0",
                                    message: qrObject?.result?.description,
                                    validPromo: "false",
                                    promoPct: "",
                                    promoType: "",
                                    referenceText: "",
                                    pull: "Y",
                                    regFlow: false,
                                    cashBackAmt: qrObject?.result?.cashBackAmt,
                                    showCB: true,
                                    s2w: qrObject?.result?.s2w,
                                    chanceScreen: true,
                                    showChance: false,
                                },
                            });
                            this.setState({ currentScreen: 1 });
                            clearInterval(this.state.loop);
                            this.clearLoops();
                        } else if (qrObject?.result?.status == "Limit") {
                            this.dailyLimitExceededCall();
                        } else if (qrObject?.result?.status == "Failed") {
                            clearInterval(this.state.loop);
                            this.props.navigation.navigate("QrStack", {
                                screen: "QrAck",
                                params: {
                                    primary: this.state.primary,
                                    wallet: this.state.wallet,
                                    trxRef:
                                        qrObject?.result?.trxRef === null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    paymentRef:
                                        qrObject?.result?.trxRef === null
                                            ? "NA"
                                            : qrObject?.result?.trxRef,
                                    trxDateTimeFomat: qrObject?.result?.trxTime,
                                    amount: qrObject?.result?.amount,
                                    payeeAccountNo: "",
                                    payeeName: qrObject?.result?.merchantName,
                                    merchant: "Y",
                                    code: "1",
                                    message:
                                        qrObject?.result?.description === "pending" ||
                                        qrObject?.result?.description === "Pending"
                                            ? ""
                                            : qrObject?.result?.description,
                                    validPromo: "false",
                                    promoPct: "",
                                    promoType: "",
                                    referenceText: "",
                                    pull: "Y",
                                    regFlow: false,
                                    cashBackAmt: qrObject?.result?.cashBackAmt,
                                    showCB: true,
                                    chanceScreen: true,
                                    showChance: false,
                                },
                            });
                            this.setState({ currentScreen: 1 });
                            clearInterval(this.state.loop);
                            this.clearLoops();
                        }
                    }
                })
                .catch((err) => {
                    console.log("ERR", err);
                    showErrorToast({ message: err.message });
                });
        }

        if (this.state.currentScreen !== 3) {
            this.clearLoops();
        }
    };

    pullRefresh = async () => {
        await clearInterval(this.state.loop);
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        const mode = isPostLogin ? "P" : "N";
        getQRPullString(
            "/qrpay/pull/generate?accountNo=" + this.state.selectedPayAccount + "&authMode=" + mode
        )
            .then(async (response) => {
                console.log("RES", response);
                const qrObject = response?.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null && qrObject.code === 0) {
                    ModelClass.QR_DATA.pullRefNo = qrObject?.result?.trxRefNo;
                    if (this.state.time === 60) {
                        this.setState({
                            time: 59,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            dataBar: qrObject?.result?.barcode,
                            pullRefNo: qrObject?.result?.trxRefNo,
                            enableDone: false,
                            pullStatusTime: moment().valueOf(),
                            pullCount: 0,
                            loop: setInterval(this.pullRefreshCheck, 5000),
                            pqTime: moment().valueOf(),
                            pullRefNoPrv: "",
                        });
                    } else {
                        this.setState({
                            time: 60,
                            blure: false,
                            data: qrObject?.result?.qrtext,
                            dataBar: qrObject?.result?.barcode,
                            pullRefNo: qrObject?.result?.trxRefNo,
                            enableDone: false,
                            pullStatusTime: moment().valueOf(),
                            pullCount: 0,
                            loop: setInterval(this.pullRefreshCheck, 5000),
                            pqTime: moment().valueOf(),
                            pullRefNoPrv: "",
                        });
                    }
                    this.state.loopList.push(this.state.loop);
                } else {
                    showErrorToast({
                        message: qrObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    scanClick = () => {
        this.setState({
            currentScreen: 1,
            blure: false,
            data: "",
            enableDone: false,
            accountList: [],
            reactivate: true,
        });
        clearInterval(this.state.loop);
    };

    checkStatusPress = () => {
        checkQRStatus(
            "/qrpay/checkStatus",
            JSON.stringify({
                qrtext: this.state.data,
            })
        )
            .then((response) => {
                console.log("RES", response);
                const statusObject = response.data;
                console.log("Qrobject", statusObject);
                if (statusObject !== null) {
                    if (statusObject.code === 0) {
                        ModelClass.PDF_DATA.reset = true;
                        ModelClass.PDF_DATA.status = 0;
                        ModelClass.PDF_DATA.message = "You have successfully received the transfer";
                        ModelClass.PDF_DATA.amount = "RM " + this.state.amount;
                        this.props.navigation.navigate("commonModule", {
                            screen: "StatusCheckScreen",
                            params: {
                                status: 0,
                                message: "You have successfully received the transfer",
                                amount: "RM " + this.state.amount,
                                primary: this.state.primary,
                                data: this.state.data,
                                screen: 2,
                                qrState: this.state,
                            },
                        });
                    } else if (statusObject.code === 100) {
                        ModelClass.PDF_DATA.reset = false;
                        ModelClass.PDF_DATA.status = 1;
                        ModelClass.PDF_DATA.message = "Transfer is still pending";
                        ModelClass.PDF_DATA.amount = "";
                        this.props.navigation.navigate("commonModule", {
                            screen: "StatusCheckScreen",
                            params: {
                                status: 1,
                                message: "Transfer is still pending",
                                amount: "",
                                primary: this.state.primary,
                                data: this.state.data,
                                screen: 2,
                                qrState: this.state,
                            },
                        });
                    } else if (statusObject.code === 150) {
                        ModelClass.PDF_DATA.reset = false;
                        ModelClass.PDF_DATA.status = 2;
                        ModelClass.PDF_DATA.message = "Please try again later";
                        ModelClass.PDF_DATA.amount = "";
                        this.props.navigation.navigate("commonModule", {
                            screen: "StatusCheckScreen",
                            params: {
                                status: 2,
                                message: "Please try again later",
                                amount: "",
                                primary: this.state.primary,
                                data: this.state.data,
                                screen: 2,
                                qrState: this.state,
                            },
                        });
                    } else if (statusObject.code === 200) {
                        ModelClass.PDF_DATA.reset = false;
                        ModelClass.PDF_DATA.status = 2;
                        ModelClass.PDF_DATA.message = "Failed to receive the transfer";
                        ModelClass.PDF_DATA.amount = "";
                        this.props.navigation.navigate("commonModule", {
                            screen: "StatusCheckScreen",
                            params: {
                                status: 2,
                                message: "Failed to receive the transfer",
                                amount: "",
                                primary: this.state.primary,
                                data: this.state.data,
                                screen: 2,
                                qrState: this.state,
                            },
                        });
                    } else {
                        ModelClass.PDF_DATA.reset = false;
                        ModelClass.PDF_DATA.status = 2;
                        ModelClass.PDF_DATA.message = "Failed to receive the transfer";
                        ModelClass.PDF_DATA.amount = "";
                        this.props.navigation.navigate("commonModule", {
                            screen: "StatusCheckScreen",
                            params: {
                                status: 2,
                                message: "Failed to receive the transfer",
                                amount: "",
                                primary: this.state.primary,
                                data: this.state.data,
                                screen: 2,
                                qrState: this.state,
                            },
                        });
                    }
                } else {
                    ModelClass.PDF_DATA.reset = false;
                    ModelClass.PDF_DATA.status = 2;
                    ModelClass.PDF_DATA.message = "Please try again later";
                    ModelClass.PDF_DATA.amount = "";
                    this.props.navigation.navigate("commonModule", {
                        screen: "StatusCheckScreen",
                        params: {
                            status: 2,
                            message: "Please try again later",
                            amount: "",
                            primary: this.state.primary,
                            data: this.state.data,
                            screen: 2,
                            qrState: this.state,
                        },
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    camelize = (str) =>
        str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
            .join(" ");

    qrEnterAmount = () => {
        this.setState({ currentScreen: 4, blure: false });
    };

    qrCodeGASharePDF = (reloadShare) => {
        ScanPayGA.shareQrCode(reloadShare);
    };

    qrCodePdfView = () => {
        ScanPayGA.viewScreenShareQrCode();
    };

    qrShare = async () => {
        try {
            this.setState({ loader: true });
            const name = await this.camelize(this.state.m2uName);
            const file = await CustomPdfGenerator.viewMyQr("MAE QR", name, this.state.qrCode);
            this.setState({ loader: false });
            if (file === null) {
                showErrorToast({ message: "Please allow permission" });
            } else {
                const params = {
                    file,
                    share: true,
                    type: "Html",
                    route: "QrMain",
                    module: "QrStack",
                    title: "Share QR Code",
                    pdfType: "shareMyQr",
                    reset: false,
                    qrCode: this.state.qrCode,
                    name,
                    qrState: this.state,
                    sharePdfGaHandler: this.qrCodeGASharePDF,
                    GAPdfView: this.qrCodePdfView,
                };
                this.props.navigation.pop();
                this.props.navigation.navigate("commonModule", {
                    screen: "PdfViewScreen",
                    params: { params },
                });
            }
        } catch (e) {
            this.setState({ loader: false });
            console.log(e);
        }

        ScanPayGA.selectActionShareQr();
    };

    donePress = () => {
        const request = {
            accountNo: this.state.selectedAccount,
            amount: "",
            qrId: this.state.qrId,
        };
        getQRPushString("/qrpay/duitnow/generateTextDuitQR", JSON.stringify(request))
            .then((response) => {
                console.log("RES", response);
                const qrObject = response.data;
                console.log("Qrobject", qrObject);
                if (qrObject !== null && qrObject.code == 0) {
                    this.setState({
                        blure: false,
                        amountSet: false,
                        currentScreen: 2,
                        data: qrObject?.result?.qrtext,
                        qrId:
                            qrObject?.result?.qrId != null
                                ? qrObject?.result?.qrId
                                : this.state.qrId,
                        accountList: this.state.accountList,
                    });
                } else {
                    this.setState({
                        blure: false,
                        amountSet: false,
                    });
                    showErrorToast({
                        message: qrObject.message,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.message });
            });
    };

    _onToggleTab = async (tab) => {
        if (tab == 0) {
            this.setState({
                currentScreen: 1,
                blure: false,
                amountSet: false,
                currentTab: tab,
                amount: "",
            });
        } else {
            this.showClick(tab);
            // [[UPDATE_BALANCE]] Update the wallet balance if navigate to receive tab
            const { isUpdateBalanceEnabled } = this.props.getModel("wallet");
            if (isUpdateBalanceEnabled) {
                updateWalletBalance(this.props.updateModel);
            }
        }
        this.clearLoops();

        // current tab = 0 => pay
        // current tab = 1 => receive
        ScanPayGA.viewScreenMainQR(tab);

        // if (tabName != this.state.selectedTab) {
        //     clearInterval(this.state.loop);
        //     switch (tabName) {
        //         case "PAY":
        //             this.setState({
        //                 currentScreen: 1,
        //                 blure: false,
        //                 amountSet: false,
        //                 selectedTab: tabName,
        //                 amount: "",
        //             });
        //             break;
        //         case "RECEIVE":
        //             this.showClick(tabName);
        //             break;
        //     }
        // }
    };

    takePicture = async () => {
        try {
            this.setState({ loader: true }, async () => {
                const image = await ImagePicker.openPicker({
                    cropping: false,
                    includeBase64: true,
                    compressImageQuality: 1,
                    includeExif: true,
                    freeStyleCropEnabled: false,
                    mediaType: "photo",
                    cropperCircleOverlay: false,
                    showCropGuidelines: false,
                    hideBottomControls: false,
                });
                if (image) {
                    const path = image?.path;
                    const base64Data = image?.data ?? "";
                    const response = await RNQRGenerator.detect({
                        uri: path,
                        base64: base64Data,
                        useMLKit: true,
                    });
                    console.log(`### qr scan response ====> `, JSON.stringify(response));
                    if (response?.values.length > 0) {
                        this.onScan({ data: response.values[0], barcodes: null }, false);
                    } else {
                        showErrorToast({
                            message: "Unable to identify the image. Please try again.",
                        });
                    }
                }
            });
        } catch (err) {
            this.setState({ loader: false });
            if (err?.message !== "User cancelled image selection") {
                showErrorToast({ message: err.message });
            }
        } finally {
            this.setState({ loader: false });
        }
    };

    onBackClick = () => {
        clearInterval(this.state.loop);
        this.setState({
            currentScreen: 1,
            currentTab: tabNameEnum.pay,
            blure: false,
            amountSet: false,
            amount: "",
        });

        ScanPayGA.selectActionBackToQr();
    };

    getTabs = () => {
        return (
            <View
                style={{
                    marginBottom: 26,
                    marginHorizontal: 40,
                    marginTop: 16,
                }}
            >
                <SwitchButton
                    initial={this.state.currentTab}
                    onPress={this._onToggleTab}
                    options={tabOption}
                    indicator={this.state.newNotifications}
                />
            </View>
            // <View
            //     style={{
            //         flexDirection: "row",
            //         alignContent: "center",
            //         alignItems: "center",
            //         justifyContent: "center",
            //         backgroundColor: TRANSPARENT,
            //         marginBottom: 10,
            //     }}
            // >
            //     <View
            //         style={{
            //             width: width - 72,
            //             height: 50,
            //             borderRadius: 22.5,
            //             marginTop: 0,
            //             marginBottom: 2,
            //             borderStyle: "solid",
            //             borderWidth: 0,
            //             backgroundColor: "#e5e5e5",
            //             flexDirection: "row",
            //             alignSelf: "center",
            //         }}
            //     >
            //         <TouchableOpacity
            //             onPress={() => this._onToggleTab(this.state.filterTabs[0])}
            //             style={
            //                 this.state.selectedTab == this.state.filterTabs[0]
            //                     ? {
            //                           width: (width - 72) / 2,
            //                           alignItems: "center",
            //                           justifyContent: "center",
            //                           backgroundColor: WHITE,
            //                           borderRadius: 22.5,
            //                           marginRight: 0,
            //                           ...getShadow({}),
            //                       }
            //                     : {
            //                           width: (width - 72) / 2,
            //                           alignItems: "center",
            //                           justifyContent: "center",
            //                           marginLeft: 0,
            //                       }
            //             }
            //         >
            //             <Typo
            //                 fontSize={12}
            //                 lineHeight={18}
            //                 fontWeight={
            //                     this.state.selectedTab == this.state.filterTabs[0]
            //                         ? "600"
            //                         : "normal"
            //                 }
            //                 color={BLACK}
            //                 textAlign={"center"}
            //             >
            //                 <Text>{this.state.filterTabs[0].toUpperCase()}</Text>
            //             </Typo>
            //         </TouchableOpacity>

            //         <TouchableOpacity
            //             onPress={() => this._onToggleTab(this.state.filterTabs[1])}
            //             style={
            //                 this.state.selectedTab == this.state.filterTabs[1]
            //                     ? {
            //                           width: (width - 72) / 2,
            //                           alignItems: "center",
            //                           justifyContent: "center",
            //                           backgroundColor: WHITE,
            //                           borderRadius: 22.5,
            //                           marginright: 0,
            //                           ...getShadow({}),
            //                       }
            //                     : {
            //                           width: (width - 72) / 2,
            //                           alignItems: "center",
            //                           justifyContent: "center",
            //                           marginLeft: 0,
            //                       }
            //             }
            //         >
            //             <Typo
            //                 fontSize={12}
            //                 lineHeight={18}
            //                 fontWeight={
            //                     this.state.selectedTab == this.state.filterTabs[1]
            //                         ? "600"
            //                         : "normal"
            //                 }
            //                 color={BLACK}
            //                 textAlign={"center"}
            //             >
            //                 <Text>{this.state.filterTabs[1].toUpperCase()}</Text>
            //             </Typo>
            //         </TouchableOpacity>
            //     </View>
            // </View>
        );
    };

    getUI1 = () => {
        return (
            this.state.currentScreen === 1 && (
                <View style={{ width, height }}>
                    {this.getTabs()}
                    <QRCodeScanner
                        onRead={this.handleOnRead}
                        reactivate={this.state.reactivate}
                        showMarker={true}
                        // reactivateTimeout={this.state.reactivateTime}
                        flashMode={RNCamera.Constants.FlashMode.on}
                        cameraProps={{
                            autoFocus: RNCamera.Constants.AutoFocus.on,
                            barCodeTypes: [RNCamera.Constants.BarCodeType.qr],
                            googleVisionBarcodeType:
                                Platform.OS === "ios"
                                    ? null
                                    : RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType
                                          .QR_CODE,
                            googleVisionBarcodeMode:
                                Platform.OS === "ios"
                                    ? null
                                    : RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode
                                          .ALTERNATE,
                            flashMode: this.state.flashOn
                                ? RNCamera.Constants.FlashMode.torch
                                : RNCamera.Constants.FlashMode.off,
                            onGoogleVisionBarcodesDetected:
                                Platform.OS !== "ios" && this.handleOnBarcodesDetected,
                        }}
                        vibrate={false}
                        customMarker={
                            <View style={styles.pushMainView0}>
                                <View style={styles.pushMainView1}>
                                    <View style={styles.pushMainView2}>
                                        <Image
                                            style={styles.qrBorder}
                                            source={require("@assets/icons/ic_qr_border.png")}
                                            resizeMode="stretch"
                                        />
                                    </View>
                                </View>

                                <View style={styles.pushTopView1}>
                                    <View style={styles.valueContainer}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="300"
                                            color={WHITE}
                                            lineHeight={18}
                                            text="Place QR code in the scan area"
                                        />
                                    </View>
                                </View>
                                <View style={styles.pushTopImageView}>
                                    <View style={styles.pushTopImageViewMainContainer}>
                                        <View style={styles.pushTopImageViewSubContainer}>
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    this.setState({ flashOn: !this.state.flashOn });
                                                }}
                                            >
                                                <View style={styles.pushImageView}>
                                                    <Image
                                                        style={styles.pushImageCont1}
                                                        source={
                                                            this.state.flashOn
                                                                ? require("@assets/icons/ic_qr_torch_off.png")
                                                                : require("@assets/icons/ic_qr_torch_on.png")
                                                        }
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.showQrContainer}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.pullButtonContainer,
                                                    { ...getShadow({}) },
                                                ]}
                                                onPress={this.pullClick}
                                            >
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="500"
                                                    color={BLACK}
                                                    lineHeight={18}
                                                    textAlign="center"
                                                    text="Show QR Code"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.pushBottomView}>
                                        <TouchableOpacity onPress={this.takePicture}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                color={ROYAL_BLUE}
                                                lineHeight={20}
                                                text="Scan QR Code from Gallery"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        }
                        cameraStyle={styles.cameraContainerView}
                        containerStyle={styles.cameraContainerView}
                    />
                </View>
            )
        );
    };

    getUI2 = () => {
        return (
            this.state.currentScreen === 2 &&
            this.state.viewPdf === false && (
                <View style={styles.flex1}>
                    {this.getTabs()}

                    <View
                        style={{
                            flex: this.state.amountSet ? 4 : 5,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 20,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: TRANSPARENT,
                                position: "absolute",
                                marginTop: 1,
                                width: width - 160,
                                height: width - 140,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 20,
                            }}
                        >
                            <View
                                pointerEvents="none"
                                style={{
                                    backgroundColor: "#ed2e67",
                                    width: width - 160,
                                    height: width - 140,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 20,
                                    ...getShadow({}),
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        width: width - 190,
                                        height: width - 190,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        backgroundColor: WHITE,
                                        alignItems: "center",
                                        alignContent: "center",
                                    }}
                                >
                                    <View style={{ margin: 15, backgroundColor: WHITE }}>
                                        <QRCodew
                                            getBase64={(base64) => {
                                                //console.log("B>  " + base64);
                                                this.state.qrCode = base64;
                                            }}
                                            value={this.state.data}
                                            size={width - 220}
                                            bgColor={WHITE}
                                            fgColor="#ed2e67"
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        marginTop: 10,
                                        height: 20,
                                        width,
                                        flexDirection: "row",
                                        alignContent: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typo
                                        fontSize={10}
                                        fontWeight="500"
                                        color={WHITE}
                                        lineHeight={18}
                                        textAlign="center"
                                        text="MALAYSIA NATIONAL QR"
                                    />
                                </View>
                            </View>
                        </View>
                        {this.state.blure == true ? (
                            <View
                                style={{
                                    position: "absolute",
                                    marginTop: 1,
                                    backgroundColor: DARK_GREY_200,
                                    width: width - 160,
                                    height: width - 140,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 20,
                                    ...getShadow({}),
                                }}
                            >
                                <TouchableOpacity onPress={this.pushRefresh}>
                                    <Image
                                        style={{ width: 60, height: 60 }}
                                        source={Assets.icQrRefresh}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        {this.state.amountSet ? (
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: width - 100,
                                    height: 50,
                                    alignSelf: "flex-start",
                                    alignItems: "flex-end",
                                    justifyContent: "flex-end",
                                    position: "absolute",
                                    marginTop: 20,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "column",
                                        backgroundColor: WHITE,
                                        width: 50,
                                        height: 50,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 25,
                                        ...getShadow({}),
                                    }}
                                >
                                    <View style={{ flex: 1, marginTop: 1, ...getShadow({}) }}>
                                        <CountdownCircle
                                            seconds={this.state.time}
                                            radius={20}
                                            borderWidth={0}
                                            color="transparent"
                                            bgColor="transparent"
                                            shadowColor="transparent"
                                            textStyle={{
                                                fontSize: 20,
                                                fontWeight: "800",
                                                color: BLACK,
                                            }}
                                            onTimeElapsed={() => {}}
                                            updateText={(elapsedSecs, totalSecs) => {
                                                const curTime = moment().valueOf();
                                                let difTime = (curTime - this.state.dqTime) / 1000;
                                                difTime = parseInt(difTime);
                                                if (totalSecs - difTime <= 0) {
                                                    if (this.state.blure == false) {
                                                        this.setState({ blure: true });
                                                    }
                                                    return "0";
                                                } else {
                                                    return (totalSecs - difTime).toString();
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginTop: 5 }}>
                                        <Text>sec</Text>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </View>
                    <View
                        style={{
                            flex: 0.8,
                            alignSelf: "center",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            marginBottom: 5,
                        }}
                    >
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: width - 72,
                            }}
                        >
                            <Typo
                                fontSize={12}
                                fontWeight="300"
                                lineHeight={18}
                                color={FADE_GREY}
                                text="Show your QR code to your friends or family to receive money"
                            />
                        </View>
                    </View>
                    {this.state.amountSet ? (
                        <View />
                    ) : (
                        <View style={styles.roundViewC}>
                            <View style={[styles.roundView, { ...getShadow({}) }]}>
                                <View
                                    style={{
                                        flex: 1.6,
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
                                            lineHeight={18}
                                            textAlign="left"
                                            text={this.state.accountHolder}
                                        />
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            style={{ marginTop: 5 }}
                                            textAlign="left"
                                            text={DataModel.maskAccount(this.state.selectedAccount)}
                                        />
                                    </View>
                                </View>

                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        marginRight: 16,
                                    }}
                                >
                                    <TouchableOpacity onPress={this.dropClick}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            color={ROYAL_BLUE}
                                            lineHeight={18}
                                        >
                                            <Text>Change</Text>
                                        </Typo>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {this.state.amountSet ? (
                        <View
                            style={{
                                flex: isIPhoneX ? 2 : 1,
                                flexDirection: "column",
                                marginTop: 10,
                                marginBottom: 10,
                                alignItems: "center",
                                alignContent: "center",
                            }}
                        >
                            <Typo
                                fontSize={24}
                                fontWeight="500"
                                color={BLACK}
                                lineHeight={24}
                                textAlign="center"
                            >
                                <Text>RM {this.state.amount}</Text>
                            </Typo>
                        </View>
                    ) : null}
                    {this.state.amountSet ? (
                        <View
                            style={{
                                flex: isIPhoneX ? 2 : 1.5,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around",
                                alignContent: "space-around",
                                marginBottom: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.dnButtonContainer}
                                    onPress={this.donePress}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={18}
                                        textAlign="center"
                                        text="Done"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.subButtonContainer}>
                            <View style={styles.flex1}>
                                <ActionButton
                                    backgroundColor={WHITE}
                                    height={48}
                                    borderRadius={24}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Share"
                                        />
                                    }
                                    onPress={this.qrShare}
                                />
                            </View>
                            <View style={styles.width16} />
                            <View style={styles.flex1}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    height={48}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Enter Amount"
                                        />
                                    }
                                    onPress={this.qrEnterAmount}
                                />
                            </View>
                        </View>
                    )}
                </View>
            )
        );
    };

    getUI3 = () => {
        return (
            this.state.currentScreen === 3 && (
                <View style={styles.flex1}>
                    {this.getTabs()}

                    <View style={styles.ui3Container}>
                        <View style={styles.ui3SubContainer}>
                            <View
                                pointerEvents="none"
                                style={{
                                    backgroundColor: WHITE,
                                    width: width - 120,
                                    height: width - 100,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 20,
                                    ...getShadow({}),
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        width: width - 190,
                                        height: width - 190,
                                        overflow: "hidden",
                                        marginTop: 10,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <QRCodew
                                        value={this.state.data}
                                        size={width - 230}
                                        bgColor={WHITE}
                                        fgColor={BLACK}
                                    />
                                    <View style={styles.mbbLogo}>
                                        <Image
                                            style={styles.mbbLogo}
                                            source={require("@assets/icons/ic_maybank_circle.png")}
                                        />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.barCodeView}>
                                    <Barcode
                                        value={this.state.dataBar}
                                        width={height > 650 ? 1.3 : 0.9}
                                        height={this.state.barHeight}
                                        format="CODE128"
                                    />
                                </View>
                            </View>
                        </View>

                        {this.state.blure === true ? (
                            <View style={styles.qrRefreshContainer}>
                                <TouchableOpacity onPress={this.pullRefresh}>
                                    <Image
                                        style={{ width: 60, height: 60 }}
                                        source={Assets.icQrRefresh}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <View
                            style={{
                                flexDirection: "row",
                                width: width - 50,
                                height: 50,
                                alignSelf: "flex-start",
                                alignItems: "flex-end",
                                justifyContent: "flex-end",
                                position: "absolute",
                                marginTop: height > 750 ? height / 50 : 0,
                                backgroundColor: TRANSPARENT,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "column",
                                    position: "absolute",
                                    backgroundColor: WHITE,
                                    width: 50,
                                    height: 50,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 25,
                                    ...getShadow({}),
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        marginTop: 1,
                                        ...getShadow({ elevation: 10 }),
                                    }}
                                >
                                    <CountdownCircle
                                        seconds={this.state.time}
                                        radius={20}
                                        borderWidth={0}
                                        color="transparent"
                                        bgColor="transparent"
                                        shadowColor="transparent"
                                        textStyle={{
                                            fontSize: 20,
                                            fontWeight: "800",
                                            color: BLACK,
                                        }}
                                        onTimeElapsed={() => {}}
                                        updateText={(elapsedSecs, totalSecs) => {
                                            const curTime = moment().valueOf();
                                            let difTime = (curTime - this.state.pqTime) / 1000;
                                            difTime = parseInt(difTime);
                                            if (this.state.currentScreen === 3) {
                                                if (this.state.time == 60) {
                                                    if (elapsedSecs >= 10) {
                                                        this.setState({ enableDone: true });
                                                    }
                                                } else {
                                                    if (elapsedSecs >= 9) {
                                                        this.setState({ enableDone: true });
                                                    }
                                                }
                                            } else {
                                                this.setState({ enableDone: false });
                                            }
                                            if (totalSecs - difTime <= 0) {
                                                // if (this.state.blure == false) {
                                                //     this.setState({ blure: true });
                                                // }
                                                if (!this.state.pullRefreshed) {
                                                    if (this.state.pinRaised) {
                                                        this.setState({ refresNeed: true });
                                                    } else {
                                                        this.setState({ pullRefreshed: true });
                                                        this.pullRefresh();
                                                    }
                                                }

                                                return "0";
                                            } else {
                                                if (this.state.pullRefreshed) {
                                                    this.setState({ pullRefreshed: false });
                                                }
                                                return (totalSecs - difTime).toString();
                                            }
                                        }}
                                    />
                                </View>
                                <View style={{ flex: 1, marginTop: 5 }}>
                                    <Text>sec</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 0.8,
                            alignItems: "flex-end",
                            justifyContent: "center",
                            flexDirection: "row",
                            width: "100%",
                        }}
                    >
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: width - 72,
                            }}
                        >
                            <Typo
                                fontSize={12}
                                fontWeight="300"
                                color={FADE_GREY}
                                lineHeight={18}
                                text="Show this to the cashier to make payment"
                            />
                        </View>
                    </View>

                    <View style={[styles.roundView, { ...getShadow({}) }]}>
                        <View
                            style={{
                                flex: 1.6,
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
                                >
                                    <Text>{this.state.accountPayHolder}</Text>
                                </Typo>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={18}
                                    style={{ marginTop: 5 }}
                                    textAlign="left"
                                >
                                    <Text>
                                        {this.state.accountType == "DC" ||
                                        this.state.accountType == "J"
                                            ? DataModel.maskDCard(this.state.selectedPayAccount)
                                            : this.state.accountType == "R" ||
                                              this.state.accountType == "C"
                                            ? DataModel.maskCard(this.state.selectedPayAccount)
                                            : DataModel.maskAccount(this.state.selectedPayAccount)}
                                    </Text>
                                </Typo>
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                flexDirection: "column",
                                marginRight: 16,
                            }}
                        >
                            <TouchableOpacity onPress={this.dropClick}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    color={ROYAL_BLUE}
                                    lineHeight={18}
                                >
                                    <Text>Change</Text>
                                </Typo>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: isIPhoneX ? 2 : 1.4,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10,
                            marginTop: 10,
                            marginLeft: 36,
                            marginRight: 36,
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.pullButtonContainer, { ...getShadow({}) }]}
                            onPress={this.onBackClick}
                        >
                            <Typo
                                fontSize={14}
                                fontWeight="500"
                                lineHeight={18}
                                text="Back to Scanner"
                            />
                        </TouchableOpacity>
                    </View>

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
                </View>
            )
        );
    };

    getUI4 = () => {
        return this.state.currentScreen === 4 ? (
            <QREnterAmount
                onDonePress={this.amountEnter}
                onBackPress={this.amountBack}
                noBack={this.state.staticScan}
                quickAction={this.state.quickAction}
                date={`${moment().valueOf()}`}
                fxData={this.state.staticQR}
                routeFromTab={this.state.currentTab}
            />
        ) : null;
    };

    getUI5 = () => {
        const accList =
            this.state.accScreen === "pull"
                ? this.state.selectionPayAccountList
                : this.state.selectionAccountList;
        return this.state.currentScreen === 5 ? (
            <QRAccountSelect
                onConfirm={this.accountSelect}
                onCancel={this.accountCancel}
                accounts={accList}
                type={this.state.accScreen}
                navigation={this.props.navigation}
            />
        ) : null;
    };

    getQrErrorScreen = () => {
        const errMsg =
            this.state.errorMessage !== "" ||
            this.state.errorMessage !== undefined ||
            this.state.errorMessage !== null ||
            this.state.errorMessage.length !== 0
                ? this.state.errorMessage
                : Strings.QR_ISSUE;
        return this.state.qrError === true ? (
            <ErrorMessage
                onClose={() => {
                    this.setState({ qrError: false, reactivate: true });
                }}
                title={Strings.APP_NAME_ALERTS}
                description={errMsg}
                showOk
                onOkPress={() => {
                    this.setState({ qrError: false, reactivate: true });
                }}
            />
        ) : null;
    };

    getPullDoneScreen = () => {
        return this.state.pullDone === true ? (
            <ErrorMessage
                onClose={() => {
                    this.setState({ pullDone: false });
                }}
                title="MAYA"
                description="Transaction Completed"
                showOk
                onOkPress={() => {
                    this.setState({ pullDone: false });
                }}
            />
        ) : null;
    };

    getUIPdf = () => {
        return this.state.viewPdf === true ? (
            <View style={styles.flex1}>
                <View style={styles.viewPdfContainer}>
                    <View style={styles.backBtnContainer}>
                        <TouchableOpacity
                            style={styles.backBtnSubContainer}
                            onPress={() => {
                                this.setState({ viewPdf: false });
                            }}
                            accessibilityLabel="btnShare"
                        >
                            <Image
                                style={styles.shareIcon}
                                source={require("@assets/icons/icn_back.png")}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shareBtnContainer}>
                        <TouchableOpacity
                            style={styles.shareBtnSubContainer}
                            onPress={async () => {
                                await CustomPdfGenerator.shareMyQr(this.state.pdfBase64);
                            }}
                            accessibilityLabel="btnShare"
                        >
                            <Image style={styles.shareIcon} source={Assets.icShareBlack} />
                        </TouchableOpacity>
                    </View>
                </View>

                <PDFView
                    fadeInDuration={250.0}
                    style={{ flex: 9 }}
                    resource={this.state.pdfFile}
                    resourceType="file"
                    onLoad={() => console.log("PDF rendered from " + this.state.pdfFile)}
                    onError={(error) => console.log("Cannot render PDF", error)}
                />
            </View>
        ) : null;
    };

    getImageUrl = (currentScreen, quickAction, isFestiveSeason) => {
        const scanPayBgFileName =
            !quickAction && currentScreen === 1 ? "scan-pay-01" : "scan-pay-02";
        return `${ENDPOINT_BASE}/cms/document-view/${
            isFestiveSeason ? "festival-01" : scanPayBgFileName
        }.jpg?date=${moment().valueOf()}`;
    };

    getBGImage = () => {
        const { currentScreen } = this.state;
        const { isFestivalReady } = this.props.getModel("misc");
        const imgUrl =
            currentScreen > 0 &&
            currentScreen < 3 &&
            this.getImageUrl(currentScreen, this.state?.quickAction, isFestivalReady);

        if (currentScreen > 0 && currentScreen <= 3) {
            this.setState({
                imageBG: imgUrl ?? null,
            });
        }
    };

    render() {
        const { currentScreen } = this.state;
        const { getModel, festiveAssets } = this.props;
        const { isTapTasticReady } = getModel("misc");
        const isRaya = false;
        const scanPayImg = currentScreen >= 0 && currentScreen <= 3;

        return (
            <ScreenContainer
                backgroundColor={MEDIUM_GREY}
                backgroundType="color"
                showLoaderModal={this.state.loader}
                analyticScreenName="M2U - Scan & Pay"
            >
                <>
                    <CacheeImageWithDefault
                        resizeMode={Platform.OS === "ios" || isTapTasticReady ? "stretch" : "cover"}
                        style={styles.imageBG}
                        image={scanPayImg ? festiveAssets?.qrPay.background : null}
                    />
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <View>
                                {this.state.currentScreen !== 4 &&
                                    this.state.currentScreen !== 5 && (
                                        <HeaderLayout
                                            horizontalPaddingMode="custom"
                                            horizontalPaddingCustomLeftValue={16}
                                            horizontalPaddingCustomRightValue={16}
                                            headerLeftElement={
                                                <View style={styles.leftBtn}>
                                                    {this.state.currentScreen === 3 && (
                                                        <HeaderBackButton
                                                            isWhite={isRaya}
                                                            onPress={this.onBackClick}
                                                        />
                                                    )}
                                                </View>
                                            }
                                            headerCenterElement={
                                                <Typo
                                                    text="Scan & Pay"
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={32}
                                                />
                                            }
                                            headerRightElement={
                                                <View style={styles.leftBtn}>
                                                    {(this.state.currentScreen === 1 ||
                                                        this.state.currentScreen === 2) && (
                                                        <HeaderCloseButton
                                                            onPress={this.handleClose}
                                                            isWhite={isRaya}
                                                        />
                                                    )}
                                                    {this.state.currentScreen === 3 &&
                                                        this.state.enableDone && (
                                                            <HeaderRefreshButton
                                                                onPress={this.pullScanCheck}
                                                                isWhite={isRaya}
                                                            />
                                                        )}
                                                </View>
                                            }
                                        />
                                    )}
                            </View>
                        }
                    >
                        <>
                            {this.state.permissionCheck && this.getUI1()}
                            {this.getUI2()}
                            {this.getUI3()}
                            {this.getUI4()}
                            {this.getUI5()}
                            {this.getUIPdf()}
                            {this.getQrErrorScreen()}
                            {this.getPullDoneScreen()}
                        </>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    backBtnContainer: { alignItems: "flex-start", marginLeft: 30, width: "50%" },
    backBtnSubContainer: {
        alignItems: "center",
        flex: 1,
        height: 50,
        justifyContent: "center",
        width: 50,
    },
    barCodeView: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        height: height / 10,
        justifyContent: "center",
        marginBottom: 5,
        marginTop: 2,
        overflow: "visible",
        width: width - 120,
    },
    cameraContainerView: { height: "100%", width: "100%" },
    dnButtonContainer: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 48,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-around",
        width: width - 72,
    },
    flex1: {
        flex: 1,
    },
    imageBG: {
        flex: 1,
        height: "25%",
        position: "absolute",
        width: "100%",
    },
    leftBtn: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    mbbLogo: { height: 40, position: "absolute", width: 40 },
    pullButtonContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        marginTop: 0,
        width: width / 2.5,
    },
    pushBottomView: {
        flex: 0.3,
        flexDirection: "row",
        marginTop: height > 675 ? 10 : 5,
        height: 30,
        width,
        alignItems: height > 675 ? "center" : "flex-start",
        justifyContent: "center",
    },
    pushImageCont1: {
        flex: 1,
        height: 40,
        resizeMode: "contain",
        width: 40,
    },
    pushImageView: {
        alignItems: "flex-start",
        height: 40,
        justifyContent: "flex-start",
        width: 40,
    },
    pushMainView0: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        height,
        width,
        //backgroundColor: "rgba(0,0,0,0.5)",
    },
    pushMainView1: {
        alignItems: "center",
        flex: 2,
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 10,
    },
    pushMainView2: {
        borderRadius: width / 15,
        height: width / 1.4,
        overflow: "hidden",
        width: width / 1.4,
    },
    pushTopImageView: {
        flex: isIPhoneX ? 1.4 : 1.2,
        flexDirection: "column",
        marginBottom: 10,
        height: 100,
        width,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    pushTopImageViewMainContainer: { flexDirection: "row" },
    pushTopImageViewSubContainer: { marginLeft: 30 },
    pushTopView1: {
        alignItems: "center",
        flex: 0.5,
        justifyContent: "center",
    },
    qrBorder: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        height: undefined,
        overflow: "hidden",
        width: undefined,
    },
    qrRefreshContainer: {
        alignItems: "center",
        backgroundColor: DARK_GREY_200,
        borderRadius: 20,
        height: height / 2.4,
        justifyContent: "center",
        position: "absolute",
        width: width - 150,
    },
    roundView: {
        backgroundColor: WHITE,
        borderColor: MEDIUM_GREY,
        borderRadius: 8,
        borderWidth: 1,
        flex: 1.5,
        flexDirection: "row",
        height: 80,
        marginBottom: 1,
        marginLeft: 36,
        marginRight: 36,
        marginTop: 1,
        width: width - 72,
    },
    roundViewC: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        height: 82,
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 10,
        width,
    },
    shareBtnContainer: { alignItems: "flex-end", marginRight: 30, width: "50%" },
    shareBtnSubContainer: {
        alignItems: "center",
        flex: 1,
        height: 50,
        justifyContent: "center",
        width: 50,
    },
    shareIcon: {
        height: 30,
        width: 50,
    },
    showQrContainer: { marginLeft: 50 },
    subButtonContainer: {
        alignItems: "center",
        alignSelf: "center",
        bottom: 6,
        flex: 1.4,
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        width: width - 48,
    },
    ui3Container: {
        flex: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        // marginTop: 200,
    },
    ui3SubContainer: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        borderRadius: 20,
        height: width - 100,
        justifyContent: "center",
        marginTop: height / 30,
        position: "absolute",
        width: width - 120,
    },
    valueContainer: { alignItems: "flex-end", flex: 1, marginRight: 10 },
    viewPdfContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
    },
    width16: {
        width: 16,
    },
});

export default withModelContext(withFestive(QRPayMainScreen));

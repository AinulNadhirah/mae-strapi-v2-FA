import AsyncStorage from "@react-native-community/async-storage";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from "react-native";
import Slider from "react-native-slider";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { ScanPayGA } from "@services/analytics/analyticsScanPay";
import { getDashboardWalletBalance, getQRLimit, getQRMobileNo } from "@services/index";

import { MEDIUM_GREY, WHITE, BLACK, DARK_YELLOW, ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
import { M2U, QRREGISTER, REGISTER, S2U_PUSH, SMS_TAC, UPDATE_LIMIT } from "@constants/data";
import { FN_QRPAY_LIMIT_CHANGE, FN_QRPAY_REG } from "@constants/fundConstants";
import {
    FA_SCANPAY_SETUP_CUMULATIVELIMIT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_SCANPAY_TRANSACTIONLIMIT,
    FA_SETTINGS_SCANPAY_ADJUSTLIMIT,
    SCAN_AND_PAY_LIMIT_UPDATE_SUCCESS,
    SCAN_AND_PAY_ACTIVATION_UNSUCCESS,
    SUCC_STATUS,
    SCAN_AND_PAY_LIMIT_UPDATE_UNSUCCESS,
} from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import { addDecimals, numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import Assets from "@assets";

export const { width, height } = Dimensions.get("screen");
class QRDailyLimit extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        // route: PropTypes.object.isRequired,
        route: PropTypes.shape({
            params: PropTypes.shape({
                setup: PropTypes.any,
                settings: PropTypes.any,
                routeFromModule: PropTypes.any,
                routeFrom: PropTypes.any,
                routeToModule: PropTypes.any,
                primary: PropTypes.any,
                wallet: PropTypes.any,
                data: PropTypes.any,
                quickAction: PropTypes.any,
                limitUpdate: PropTypes.any,
                qrState: PropTypes.any,
                qrType: PropTypes.any,
                dLimit: PropTypes.any,
            }),
        }),
    };
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            dLimit: 0,
            cLimit: 0,
            maxLimit: 0,
            interval: 0,
            showInfo: false,
            routeFrom: "",
            routeFromModule: "",
            routeToModule: "",
            settings: false,
            setup: false,
            primary: false,
            wallet: false,
            quickAction: false,
            limitUpdate: false,
            qrState: {},
            qrType: "",
            //S2U V4
            showS2UModal: false,
            mapperData: {},
            nonTxnData: { isNonTxn: true },
            phNo: "",
        };
        this.confirmClickHandler = this.confirmClickHandler.bind(this);
        this.cLimitSliderHandler = this.cLimitSliderHandler.bind(this);
        this.dLimitSliderHandler = this.dLimitSliderHandler.bind(this);
    }

    componentDidMount() {
        // this.initData();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.initData();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        ScanPayGA.viewScreenTransactionLimit();
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    initData = () => {
        console.log(width + "    " + height);
        const { route } = this.props;
        const routeFrom = route.params?.routeFrom ?? "";
        const routeFromModule = route.params?.routeFromModule ?? "";
        const routeToModule = route.params?.routeToModule ?? "";
        const settings = route.params?.settings ?? false;
        const setup = route.params?.setup ?? false;
        const primary = route.params?.primary ?? false;
        const wallet = route.params?.wallet ?? false;
        const data = route.params?.data ?? {};
        const quickAction = route.params?.quickAction ?? false;
        const limitUpdate = route.params?.limitUpdate ?? false;
        const qrState = route.params?.qrState ?? {};
        const qrType = route.params?.qrType ?? "";
        this.setState({
            routeFrom,
            routeFromModule,
            routeToModule,
            settings,
            setup,
            primary,
            wallet,
            data,
            quickAction,
            limitUpdate,
            qrState,
            qrType,
        });
        if (route?.params?.dLimit) {
            const { cLimit, dLimit, interval, phNo, maxLimit } = route && route.params;
            this.setState({ cLimit, dLimit, interval, maxLimit, phNo });
            return;
        }
        if ((settings && !setup) || limitUpdate) {
            try {
                getQRLimit("/qrpay/customerLimit")
                    .then(async (response) => {
                        console.log("RES 2", response);
                        const qrObject = await response.data;
                        console.log("Qrobject", qrObject);
                        if (qrObject !== null && qrObject.code === 0) {
                            this.setState({
                                maxLimit: Number(qrObject.result.maxlimit),
                                interval: qrObject.result.interval,
                                dLimit: qrObject.result.qrPayLimit,
                                cLimit: qrObject.result.noAuthLimit,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("ERR", err);
                        this.setState({ maxLimit: 1000, interval: 50, dLimit: 250, cLimit: 250 });
                    });
            } catch (e) {
                console.log(e);
                this.setState({ maxLimit: 1000, interval: 50, dLimit: 250, cLimit: 250 });
            }
        } else {
            try {
                getQRLimit("/qrpay/customerDefaultLimit")
                    .then(async (response) => {
                        console.log("RES 1", response);
                        const qrObject = await response.data;
                        console.log("Qrobject", qrObject);
                        if (qrObject !== null && qrObject.code === 0) {
                            this.setState({
                                maxLimit: Number(qrObject.result.maxlimit),
                                interval: Number(qrObject.result.interval),
                                dLimit: Number(qrObject.result.qrPayLimit),
                                cLimit: Number(qrObject.result.noAuthLimit),
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("ERR", err);
                        this.setState({
                            maxLimit: Number(1000),
                            interval: Number(50),
                            dLimit: Number(250),
                            cLimit: Number(250),
                        });
                    });
            } catch (e) {
                console.log(e);
                this.setState({
                    maxLimit: Number(1000),
                    interval: Number(50),
                    dLimit: Number(250),
                    cLimit: Number(250),
                });
            }
        }
    };

    confirmClickHandler = async () => {
        const {
            cLimit,
            dLimit,
            interval,
            maxLimit,
            routeFrom,
            routeFromModule,
            routeToModule,
            settings,
            primary,
            wallet,
            setup,
            data,
            quickAction,
            limitUpdate,
            qrState,
            qrType,
        } = this.state;
        if (cLimit > dLimit) {
            Alert.alert(`Cumulative limit is (RM ${cLimit}) is more than Ddily limit (${dLimit})`);
            return;
        }
        await getQRMobileNo("/qrpay/getMobileNo")
            .then(async (response) => {
                console.log("RES", response);
                const Object = await response.data;
                console.log("Object", Object);
                ModelClass.QR_DATA.limitApproved = false;
                const { getModel } = this.props;
                const { deviceId } = getModel("device");
                const tacParams = {
                    interval: interval.toString(),
                    maxLimit: maxLimit.toString(),
                    qrPayLimit: dLimit.toString(),
                    noAuthLimit: cLimit.toString(),
                    routeFrom,
                    routeTo: navigationConstant.QRPAY_NUMBER_VALIDATE,
                    routeFromModule,
                    routeToModule,
                    mobileNo: Object.result,
                    deviceId,
                    settings,
                    primary,
                    wallet,
                    setup,
                    data,
                    quickAction,
                    limitUpdate,
                    qrState,
                    qrType,
                };
                this.setState(
                    {
                        phNo: Object.result,
                    },
                    () => {
                        this.initiateS2USdk(tacParams);
                    }
                );
            })
            .catch((err) => {
                console.log("ERR", err);
            });
    };

    dLimitSliderHandler = (val) => {
        if (this.state.cLimit > val) {
            this.setState({ dLimit: val, cLimit: val });
        } else {
            this.setState({ dLimit: val });
        }
    };

    cLimitSliderHandler = (val) => {
        if (this.state.dLimit < val) {
            this.setState({ dLimit: val, cLimit: val });
        } else {
            this.setState({ cLimit: val });
        }
    };

    infoIconHandler = () => {
        this.setState({ showInfo: true });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SCANPAY_SETUP_CUMULATIVELIMIT,
        });
    };

    onPopupClose = () => {
        this.setState({ showInfo: false });
    };

    onBackPressHandler = () => {
        this.setState({
            data: {},
            dLimit: 0,
            cLimit: 0,
            maxLimit: 0,
            interval: 0,
            showInfo: false,
        });
        this.props.navigation.setParams({
            routeFrom: "",
            routeTo: "",
            routeFromModule: "",
            routeToModule: "",
            settings: false,
            setup: false,
            primary: false,
            wallet: false,
            quickAction: false,
        });
        const { limitUpdate, qrType, qrState } = this.state;
        if (limitUpdate) {
            if (qrType === "Push") {
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrConf",
                    params: {
                        limitUpdate,
                        qrState,
                    },
                });
            } else {
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrMain",
                    params: {
                        limitUpdate,
                        qrState,
                    },
                });
            }
        } else {
            this.props.navigation.goBack();
        }
    };

    //S2U V4
    s2uSDKInit = async () => {
        const { interval, maxLimit, dLimit, cLimit, phNo } = this.state;
        const { getModel } = this.props;
        const { deviceId } = getModel("device");
        const { isEnabled } = getModel("qrPay");
        let { primaryAccount } = getModel("wallet");
        if (primaryAccount?.number === 0) {
            const response = await getDashboardWalletBalance();
            if (response && response.data && response.data.code === 0) {
                primaryAccount = response.data.result;
                this.props.updateModel({
                    wallet: {
                        primaryAccount,
                    },
                });
            }
        }
        const accountNumber =
            primaryAccount?.number?.length > 11 ? primaryAccount?.number?.slice(0, 12) : "";

        const transactionPayload = {
            interval: interval.toString(),
            maxLimit: maxLimit.toString(),
            qrPayLimit: dLimit.toString(),
            noAuthLimit: cLimit.toString(),
            hpNo: phNo,
            deviceId,
            accountNumber,
            accountType: primaryAccount?.type,
            accountName: accountNumber ? primaryAccount?.name : "",
            scanAndPayType: isEnabled ? UPDATE_LIMIT : REGISTER,
        };
        const functionCode = isEnabled ? FN_QRPAY_LIMIT_CHANGE : FN_QRPAY_REG;
        return await init(functionCode, transactionPayload);
    };

    //S2U V4
    initiateS2USdk = async (tacParams) => {
        try {
            const s2uInitResponse = await this.s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    showS2UDownToast();
                    this.navToTacFlow(tacParams);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (err) {
            console.log(err, " QRDailyLimit");
            s2uSdkLogs(err, "Scan And Pay");
        }
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
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.mapperData) {
                    this.setState({
                        showS2UModal: true,
                        mapperData: challengeRes?.mapperData,
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

    doS2uRegistration = (navigate) => {
        const { maxLimit, interval, dLimit, cLimit, phNo } = this.state;
        const params = {
            ...this?.props?.route?.params,
            maxLimit,
            interval,
            dLimit,
            cLimit,
            phNo,
        };
        const redirect = {
            succStack: navigationConstant.QR_STACK,
            succScreen: navigationConstant.QR_LIMIT,
            failStack: navigationConstant.BANKINGV2_MODULE,
        };
        navigateToS2UReg(navigate, params, redirect);
    };

    //S2U V4
    navToTacFlow = (params) => {
        this.props.navigation.navigate(navigationConstant.QR_STACK, {
            screen: "QrNumber",
            params,
        });
    };
    //S2U V4
    onS2uDone = (response) => {
        const { transactionStatus, executePayload } = response;
        const { settings, setup } = this.state;
        // Close S2u popup
        this.onS2uClose();
        if (executePayload?.executed) {
            if (
                (settings || (setup && executePayload?.message !== SUCC_STATUS)) &&
                executePayload?.result?.s2w?.txnType !== QRREGISTER
            ) {
                this.s2uAcknowledgementScreen(executePayload, transactionStatus);
            } else {
                this.navigateToQrSucc(executePayload);
            }
        } else {
            //S2U V4 handle RSA
            this.handleError(executePayload, transactionStatus);
        }
    };

    updateQRValue = async () => {
        this.props.updateModel({
            qrPay: {
                isEnabled: true,
            },
        });
        await AsyncStorage.setItem("qrEnabled", "true");
    };

    //S2U V4
    navigateToQrSucc = (response) => {
        this.updateQRValue();
        const {
            settings,
            setup,
            primary,
            walletF,
            data,
            dLimit,
            quickAction,
            limitUpdate,
            qrState,
            qrType,
        } = this.state;

        this.props.navigation.navigate(navigationConstant.QR_STACK, {
            screen: "QrSucc",
            params: {
                primary,
                wallet: walletF,
                settings,
                setup,
                data,
                dLimit: dLimit.toString(),
                quickAction,
                s2w: response?.result?.s2w,
                limitUpdate,
                qrState,
                qrType,
            },
        });
    };
    //S2U V4
    handleError = async (error, transactionSuccess) => {
        if (error.code === 423) {
            // Display RSA Account Locked Error Message
            console.log("RSA Lock");
            const msg = error?.payload?.message;
            const refId = error?.payload?.paymentRef || "";
            const serverDate = error?.payload?.serverDate || "";
            this.forceFail(msg, refId, serverDate, "Lock");
        } else if (error.code === 422) {
            // Display RSA Account Locked Error Message
            console.log("RSA Deny");
            const msg = error?.payload?.message;
            const refId = error?.payload?.paymentRef || "";
            const serverDate = error?.payload?.serverDate || "";
            this.forceFail(msg, refId, serverDate, "Deny");
        } else {
            this.s2uAcknowledgementScreen(error, transactionSuccess);
        }
    };

    s2uAcknowledgementScreen = (executePayload, transactionSuccess) => {
        const { dLimit, cLimit, setup } = this.state;
        const entryStack = this.props?.route?.params?.settings
            ? navigationConstant.SETTINGS
            : navigationConstant.DASHBOARD;
        const entryScreen =
            this.props?.route?.params?.settings && navigationConstant.PROFILE_MODULE;
        const entryPoint = {
            entryStack,
            entryScreen,
            params: {
                ...this.props.route.params,
            },
        };
        const ackDetails = {
            executePayload,
            transactionSuccess,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };

        if (executePayload?.executed) {
            let titleMessage = "";
            let transactionDetails = {};
            if (executePayload?.message === SUCC_STATUS) {
                this.updateQRValue();
                titleMessage = SCAN_AND_PAY_LIMIT_UPDATE_SUCCESS;
                transactionDetails = {
                    cumulativeLimit: `RM ${numberWithCommas(addDecimals(cLimit))}`,
                    dailyLimit: `RM ${numberWithCommas(addDecimals(dLimit))}`,
                };
            } else {
                titleMessage = setup
                    ? SCAN_AND_PAY_ACTIVATION_UNSUCCESS
                    : SCAN_AND_PAY_LIMIT_UPDATE_UNSUCCESS;
            }
            ackDetails.titleMessage = titleMessage;
            ackDetails.transactionDetails = transactionDetails;
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    //S2U V4
    forceFail = (message, paymentRef, trxDateTimeFomat, rsaStatus) => {
        const {
            merchant,
            validPromo,
            promoPct,
            settings,
            setup,
            primary,
            walletF,
            quickAction,
            promoType,
            referenceText,
            isMaybank,
        } = this.state;
        this.props.navigation.navigate("QrStack", {
            screen: "QrAck",
            params: {
                primary,
                wallet: walletF,
                authRequired: false,
                fallBack: false,
                merchant,
                code: "1",
                message,
                paymentRef,
                trxDateTimeFomat,
                validPromo,
                promoPct,
                promoType,
                referenceText,
                rsaStatus,
                isMaybank,
                settings,
                setup,
                regFlow: true,
                quickAction,
            },
        });
    };
    //S2U V4
    onS2uClose = () => {
        this.setState({ showS2UModal: false });
    };

    tncClick = () => {
        const params = {
            file: "https://www.maybank2u.com.my/WebBank/QRBuyer_TnC.pdf",
            share: false,
            type: "url",
            route: "QrNumber",
            module: "QrStack",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
            reset: false,
        };
        this.props.navigation.navigate("commonModule", {
            screen: "PdfViewScreen",
            params: { params },
        });
    };

    render() {
        const { dLimit, cLimit, showS2UModal, mapperData, nonTxnData, showInfo } = this.state;
        const params = this.props?.route?.params;
        const analyticScreenName =
            params?.settings && !params?.setup
                ? FA_SETTINGS_SCANPAY_ADJUSTLIMIT
                : FA_SCANPAY_TRANSACTIONLIMIT;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={analyticScreenName}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this.onBackPressHandler} />
                                }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={18}
                                        text="Scan & Pay"
                                    />
                                }
                                backgroundColor={TRANSPARENT}
                            />
                        }
                    >
                        <ScrollView style={styles.scrollView}>
                            <View style={styles.container}>
                                <View style={styles.containerSubview}>
                                    <View style={styles.titleContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={18}
                                            text="Daily Limit"
                                        />
                                    </View>
                                    <View style={styles.descriptionContainer}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="300"
                                            color={BLACK}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.note}
                                            text="Drag the slider to adjust your daily limit."
                                        />
                                    </View>
                                </View>
                                <View style={styles.dLimitHeaderView}>
                                    <View style={styles.dLimitView}>
                                        <Typo
                                            fontSize={24}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={28}
                                            text={`RM ${numeral(Math.floor(dLimit)).format(
                                                "0,000"
                                            )}`}
                                        />
                                    </View>

                                    <Slider
                                        step={50}
                                        maximumValue={1000}
                                        value={Number(dLimit)}
                                        onValueChange={this.dLimitSliderHandler}
                                        testID="sliderSpending1"
                                        accessibilityLabel="sliderSpending1"
                                        style={styles.spendingSlider}
                                        thumbTintColor={ROYAL_BLUE}
                                        minimumTrackTintColor={ROYAL_BLUE}
                                        maximumTrackTintColor={WHITE}
                                        trackStyle={styles.trackStyle}
                                        thumbStyle={styles.thumbStyle}
                                    />
                                    <View style={styles.cLimitHeaderView}>
                                        <View style={styles.limitViewStart}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="300"
                                                color={BLACK}
                                                lineHeight={18}
                                                textAlign="left"
                                                style={styles.limitWidth}
                                                text="RM 0"
                                            />
                                        </View>
                                        <View style={styles.limitView}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="300"
                                                color={BLACK}
                                                lineHeight={18}
                                                textAlign="right"
                                                style={styles.limitWidth}
                                                text="RM 1,000"
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cumilativeView}>
                                    <View style={[styles.titleContainer, styles.cumilativeLimit]}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={18}
                                            text="Cumulative Limit"
                                        />
                                        <View style={styles.infoHeaderView}>
                                            <TouchableOpacity onPress={this.infoIconHandler}>
                                                <Image
                                                    style={styles.infoImage}
                                                    source={Assets.icInformation}
                                                    accessible={true}
                                                    testID="imgSetup"
                                                    accessibilityLabel="imgSetup"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.descriptionContainer}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="300"
                                            color={BLACK}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.note}
                                            text="Drag the slider to adjust your cumulative limit."
                                        />
                                    </View>
                                </View>
                                <View style={styles.dLimitHeaderView}>
                                    <View style={styles.cLimitView}>
                                        <Typo
                                            fontSize={24}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={28}
                                            text={`RM ${Math.floor(cLimit)}`}
                                        />
                                    </View>
                                    <Slider
                                        step={50}
                                        maximumValue={250}
                                        value={Number(cLimit)}
                                        onValueChange={this.cLimitSliderHandler}
                                        testID="sliderSpending2"
                                        accessibilityLabel="sliderSpending2"
                                        style={styles.spendingSlider}
                                        thumbTintColor={ROYAL_BLUE}
                                        minimumTrackTintColor={ROYAL_BLUE}
                                        maximumTrackTintColor={WHITE}
                                        trackStyle={styles.trackStyle}
                                        thumbStyle={styles.thumbStyle}
                                    />
                                    <View style={styles.limitHeaderView}>
                                        <View style={styles.limitViewStart}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="300"
                                                color={BLACK}
                                                lineHeight={18}
                                                textAlign="left"
                                                style={styles.limitWidth}
                                                text="RM 0"
                                            />
                                        </View>
                                        <View style={styles.limitView}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="300"
                                                color={BLACK}
                                                lineHeight={18}
                                                textAlign="right"
                                                style={styles.limitWidth}
                                                text="RM 250"
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.noteContainer}>
                                    <View style={styles.descriptionContainer}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="300"
                                            color={BLACK}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.note}
                                            text="Note: For purchases above the cumulative limit, payment validation will be required using your password or biometric ID. No authentication is required for QR code generation."
                                        />
                                    </View>
                                </View>
                                <View style={styles.tncContainer}>
                                    <TouchableOpacity
                                        style={[styles.descriptionContainer, styles.touchableStyle]}
                                        onPress={this.tncClick}
                                    >
                                        <Typo
                                            fontSize={12}
                                            fontWeight="300"
                                            color={BLACK}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={styles.tnc}
                                            text="Terms & Conditions"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {showS2UModal && (
                                <Secure2uAuthenticationModal
                                    token=""
                                    onS2UDone={this.onS2uDone}
                                    onS2uClose={this.onS2uClose}
                                    s2uPollingData={mapperData}
                                    transactionDetails={mapperData}
                                    secure2uValidateData={mapperData}
                                    nonTxnData={nonTxnData}
                                    s2uEnablement={true}
                                    navigation={this.props.navigation}
                                    extraParams={{
                                        metadata: {
                                            txnType: "QR_REG",
                                        },
                                    }}
                                />
                            )}
                        </ScrollView>

                        <View style={styles.confirmButton}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={this.confirmClickHandler}
                            >
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={18}
                                    textAlign="center"
                                    text="Confirm"
                                />
                            </TouchableOpacity>
                        </View>
                    </ScreenLayout>
                </>
                {showInfo && (
                    <React.Fragment>
                        <Popup
                            visible={showInfo}
                            title="Cumulative Limit"
                            description={`You may make purchases up to RM250 using Scan & Pay without any password or biometric authentication required.\n\nYou’ll need to provide your password or biometric authentication each time you reach your Cumulative Limit.\n\nIf the Daily Limit is set to be lower than RM250, your Cumulative Limit will follow your Daily Limit.`}
                            onClose={this.onPopupClose}
                        />
                    </React.Fragment>
                )}
            </ScreenContainer>
        );
    }
}
const flexStart = "flex-start";

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        backgroundColor: DARK_YELLOW,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        width: width - 48,
    },
    cLimitHeaderView: {
        alignContent: "space-between",
        flexDirection: "row",
        flex: 1,
        marginTop: 5,
        width: width - 48,
    },
    cLimitView: {
        alignContent: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 20,
        width: width - 48,
    },
    confirmButton: {
        alignItems: "center",
        alignSelf: "center",
        bottom: 30,
        height: 50,
        justifyContent: "center",
        position: "absolute",
    },
    container: { alignItems: "center" },
    containerSubview: {
        alignItems: "center",
        marginTop: 20,
    },
    cumilativeView: { alignItems: "center", marginTop: 30 },
    dLimitHeaderView: {
        alignItems: "center",
        justifyContent: "center",
        width: width - 48,
    },
    dLimitView: {
        alignContent: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginTop: 20,
    },
    descriptionContainer: {
        alignItems: flexStart,
        justifyContent: flexStart,
        width: width - 48,
    },
    cumilativeLimit: { flexDirection: "row" },
    infoHeaderView: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
    },
    infoImage: { height: 15, width: 15 },
    limitHeaderView: {
        alignContent: "space-between",
        flexDirection: "row",
        flex: 1,
        marginTop: 5,
        width: width - 48,
    },
    limitView: {
        alignItems: "flex-end",
        flex: 1,
        justifyContent: "center",
    },
    limitViewStart: {
        alignItems: flexStart,
        flex: 1,
        justifyContent: "center",
    },
    limitWidth: { width: 60 },
    note: { marginTop: 10 },
    noteContainer: { alignItems: "center", marginTop: 10 },
    scrollView: {
        marginBottom: 80,
    },
    spendingSlider: {
        marginTop: 1,
        width: width - 48,
    },
    thumbStyle: {
        backgroundColor: WHITE,
        borderColor: ROYAL_BLUE,
        borderStyle: "solid",
        borderWidth: 6.0,
    },
    titleContainer: { alignItems: flexStart, justifyContent: flexStart, width: width - 48 },
    tnc: {
        marginTop: 10,
        textDecorationLine: "underline",
    },
    tncContainer: {
        marginTop: 10,
        width: width - 48,
    },
    touchableStyle: {
        alignSelf: flexStart,
        width: width / 2 + 10,
    },
    trackStyle: { borderRadius: 2, height: 5 },
});
export default withModelContext(QRDailyLimit);

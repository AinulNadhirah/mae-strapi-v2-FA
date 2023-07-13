/* eslint-disable react/jsx-no-bind */

/* eslint-disable prettier/prettier */
import AsyncStorage from "@react-native-community/async-storage";
import React, { Component } from "react";
import { Query, ApolloConsumer } from "react-apollo";
import {
    Text,
    View,
    ScrollView,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Alert,
    Linking,
    Platform,
    StyleSheet,
    Dimensions,
} from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import FlashMessage from "react-native-flash-message";
import call from "react-native-phone-call";
import PDFView from "react-native-view-pdf";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import {
    AvatarCircle,
    ButtonRound,
    ImageButtonCustom,
    SetupNow,
    MyView,
    Input,
    HeaderPageIndicator,
    ErrorMessage,
} from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpEnter from "@components/OtpEnter";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showInfoToast, showErrorToast, showSuccessToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import { REQUEST_SMS_OTP } from "@services/Query";
import { VALIDATE_SMS_OTP, GET_USER_BY_ID } from "@services/Query";
// import CustomFlashMessage from "@components/Toast";
import {
    doMobileOTPAuthentication,
    updateQRLimit,
    requestM2UOTP,
    validateM2UOTP,
    createOtp,
} from "@services/index";

import { GASettingsScreen } from "@services/analytics/analyticsSettings";
import {
    QRPAY_OTP_REQ,
    QRPAY_OTP_VERIFY,
    OTP_TYPE_QRPAYREG,
    QRPAY_UPDATE_DAILY_LIMIT_REQ,
} from "@constants/api";
import { MEDIUM_GREY, ROYAL_BLUE, WHITE, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/WalletScreen";
import commonStyle from "@styles/main";
import { convertMayaMobileFormat } from "@utils/dataModel/utilityPartial.4";

import BottomView from "./BottomView";
import { REGISTER, UPDATE_LIMIT } from "@constants/data";


export const { width, height } = Dimensions.get("window");

class QRNumberValidate extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            otpRequested: false,
            errorOtp: false,
            wallet: false,
            notMine: false,
            resendOtp: false,
            mobileNo: null,
            mobileAvailable: false,
            maskMobileNo: null,
            userName: null,
            userId: null,
            maybankNumber: "1300886688",
            viewPdf: false,
            routeFrom: "",
            routeTo: "",
            routeFromModule: "",
            routeToModule: "",
            deviceId: "",
            settings: false,
            setup: false,
            primary: false,
            isRSARequired: false,
            challengeQuestion: "",
            challengeRequest: {},
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            challenge: {},
            RSACount: 0,
            token: "",
            otpCode: "",
            walletF: false,
            quickAction: false,
            limitUpdate: false,
            qrState: {},
            qrType: "",
        };
    }

    componentDidMount() {
        this.initData();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.initData();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    initData = () => {
        const { route } = this.props;
        const routeFrom = route.params?.routeFrom ?? "";
        const routeTo = route.params?.routeTo ?? "";
        const routeFromModule = route.params?.routeFromModule ?? "";
        const routeToModule = route.params?.routeToModule ?? "";
        const settings = route.params?.settings ?? false;
        const setup = route.params?.setup ?? false;
        const primary = route.params?.primary ?? false;
        const wallet = route.params?.wallet ?? false;
        const deviceId = route.params?.deviceId ?? "";
        const m2uMobile = route.params?.mobileNo ?? "";
        const data = route.params?.data ?? {};
        const quickAction = route.params?.quickAction ?? false;
        const limitUpdate = route.params?.limitUpdate ?? false;
        const qrState = route.params?.qrState ?? {};
        const qrType = route.params?.qrType ?? "";
        console.log("@deviceId ", deviceId);
        console.log("@mobileNumber ", m2uMobile);
        const { isOverseasMobileNoEnabled } = this.props.getModel("misc");
        const m2uNumber = isOverseasMobileNoEnabled ? m2uMobile : convertMayaMobileFormat(m2uMobile);
        const mask = maskedMobileNumber(m2uNumber);
        this.setState({
            mobileAvailable: true,
            mobileNumber: m2uMobile,
            maskMobileNo: mask,
            deviceId: deviceId,
            routeFrom,
            routeTo,
            routeFromModule,
            routeToModule,
            settings,
            setup,
            primary,
            walletF: wallet,
            data,
            quickAction,
            limitUpdate,
            qrState,
            qrType,
        });
    };

    onClosePressHandler = () => {
        if (this.state.limitUpdate) {
            if (this.state.qrType === "Push") {
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrConf",
                    params: {
                        limitUpdate: this.state.limitUpdate,
                        qrState: this.state.qrState,
                    },
                });
            } else {
                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                    screen: "QrMain",
                    params: {
                        limitUpdate: this.state.limitUpdate,
                        qrState: this.state.qrState,
                    },
                });
            }
        } else {
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
                if (this.state.walletF) {
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

    onBackPressHandler = () => {
        this.props.navigation.goBack();
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

    confirmPress = () => {
        requestM2UOTP(
            "/requestotp",
            JSON.stringify({
                mobileNo: this.state.mobileNumber,
                otpType: OTP_TYPE_QRPAYREG,
            })
        )
            .then(async (response) => {
                console.log("RES", response);
                const authenticationObject = await response.data;
                console.log("Qrobject", authenticationObject);
                if (authenticationObject.code === 0) {
                    showInfoToast({
                        message: `Your OTP no. is ${authenticationObject.result.otpValue}`,
                        position: "top",
                        duration: 10000,
                        autoHide: true,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.error.message });
            });
        this.setState({ otpRequested: true });
    };

    getTac = () => {
        console.log("getTac", this.props);
        const params = {
            fundTransferType: this.state.setup ? QRPAY_OTP_REQ : QRPAY_UPDATE_DAILY_LIMIT_REQ,
        };

        createOtp("/tac", params)
            .then((result) => {
                const responsedata = result.data;
                console.log("responsedata:", responsedata);
                if (responsedata.statusDesc.toLowerCase() == "success") {
                    if (Config?.DEV_ENABLE === "true" && responsedata.token != null) {
                        const message = `${responsedata.token}`;
                        showInfoToast({
                            message: `Your OTP no. is ${message}`,
                            position: "top",
                            duration: 10000,
                            autoHide: true,
                        });
                    }
                } else {
                    if (Config?.DEV_ENABLE === "true" && responsedata.statusDesc != null) {
                        const message = `${responsedata.statusDesc}`;
                        showInfoToast({
                            message: `Your OTP no. is ${message}`,
                            position: "top",
                            duration: 10000,
                            autoHide: true,
                        });
                    }
                }
            })
            .catch((err) => {
                console.log("err:", err);
                const message = `${err.message}`;
                showErrorToast({ message });
            });
        this.setState({ otpRequested: true });
    };

    differentPress = () => {
        this.setState({ notMine: true });
    };

    donePress = async (code, challenge) => {
        console.log("Code ", code);
        this.setState({ otpCode: code });
        try {
            if (code.length === 6) {
                const { route } = this.props;
                const { isEnabled } = this.props.getModel("qrPay");
                const deviceInfo = this.props.getModel("device");
                const mobileSDKData = Utility.getDeviceRSAInformation(
                    deviceInfo.deviceInformation,
                    DeviceInfo
                );
                const interval = route.params?.interval ?? "";
                const maxlimit = route.params?.maxLimit ?? "";
                const noAuthLimit = route.params?.noAuthLimit ?? "";
                const qrPayLimit = route.params?.qrPayLimit ?? "";
                const request = JSON.stringify({
                    interval,
                    maxlimit,
                    noAuthLimit,
                    qrPayLimit,
                    hpNo: this.state.mobileNumber,
                    //otp: await DataModel.encryptData(code),
                    otp: code,
                    deviceId: this.state.deviceId,
                    transactionType: QRPAY_OTP_VERIFY,
                    mobileSDKData: this.state.setup ? mobileSDKData : null,
                    challenge,
                    scanAndPayType: isEnabled ? UPDATE_LIMIT : REGISTER,
                });
                updateQRLimit("/qrpay/updateCustomerLimit", request)
                    .then((response) => {
                        console.log("RES", response);
                        const qrObject = response.data;
                        console.log("Qrobject", qrObject);
                        if (qrObject !== null && qrObject.code == 0) {
                            AsyncStorage.setItem("qrEnabled", "true");

                            this.props.updateModel({
                                qrPay: {
                                    isEnabled: true,
                                },
                            });

                            if (this.state.settings) {
                                if (this.state.setup) {
                                    this.props.navigation.navigate(navigationConstant.QR_STACK, {
                                        screen: "QrSucc",
                                        params: {
                                            primary: this.state.primary,
                                            wallet: this.state.walletF,
                                            settings: this.state.settings,
                                            setup: this.state.setup,
                                            data: this.state.data,
                                            dLimit: qrPayLimit,
                                            quickAction: this.state.quickAction,
                                            s2w: response.data.result?.s2w,
                                            limitUpdate: this.state.limitUpdate,
                                            qrState: this.state.qrState,
                                            qrType: this.state.qrType,
                                        },
                                    });
                                } else {
                                    showSuccessToast({
                                        message: this.state.setup
                                            ? "Scan & Pay successfully enabled."
                                            : "Changes successfully saved.",
                                    });
                                    this.props.navigation.navigate("Settings");
                                    if (this.state.setup) {
                                        GASettingsScreen.onEnableScanPay();
                                    } else {
                                        GASettingsScreen.onScanPayLimitUpdate();
                                    }
                                }
                            } else {
                                this.props.navigation.navigate(navigationConstant.QR_STACK, {
                                    screen: "QrSucc",
                                    params: {
                                        primary: this.state.primary,
                                        wallet: this.state.walletF,
                                        settings: this.state.settings,
                                        setup: this.state.setup,
                                        data: this.state.data,
                                        dLimit: qrPayLimit,
                                        quickAction: this.state.quickAction,
                                        s2w: response.data.result?.s2w,
                                        limitUpdate: this.state.limitUpdate,
                                        qrState: this.state.qrState,
                                        qrType: this.state.qrType,
                                    },
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
                        this.handleRSA(err);
                        //showErrorToast({ message: err.message });
                    });
            } else {
                showErrorToast({ message: "OTP must consist of 6 digits" });
            }
        } catch (e) {
            console.log(e);
            showErrorToast({ message: "Wrong OTP entered" });
        }
    };

    footerPress = () => {
        requestM2UOTP(
            "/requestotp",
            JSON.stringify({
                mobileNo: this.state.mobileNumber,
                otpType: OTP_TYPE_QRPAYREG,
            })
        )
            .then(async (response) => {
                console.log("RES", response);
                const authenticationObject = await response.data;
                console.log("Qrobject", authenticationObject);
                if (authenticationObject.code === 0) {
                    showInfoToast({
                        message: `Your OTP no. is ${authenticationObject.result.otpValue}`,
                        position: "top",
                        duration: 10000,
                        autoHide: true,
                    });
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                showErrorToast({ message: err.error.message });
            });

        this.setState({ otpRequested: true });
    };

    callPress = () => {
        this.setState({ notMine: false });
        Utility.contactBankcall(this.state.maybankNumber);
    };

    callClose = () => {
        this.setState({ notMine: false });
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
        if (errors.status === 428) {
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
                token: token,
            }));
        } else if (errors.status === 423) {
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
                    let refId = "";
                    let serverDate = "";
                    const msg =
                        errorsInner && errorsInner.challenge && errorsInner.challenge.errorMessage
                            ? errorsInner.challenge.errorMessage
                            : errorsMid && errorsMid.message
                            ? errorsMid.message
                            : Strings.WE_FACING_SOME_ISSUE;
                    this.setState({ otpRequested: false });
                    if (errorsInner) {
                        refId = errorsInner.paymentRef;
                        serverDate = errorsInner.serverDate;
                    }
                    this.forceFail(msg, refId, serverDate, "Deny");
                }
            );
        } else if (errors.status === 422) {
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
                    let refId = "";
                    let serverDate = "";
                    const msg =
                        errorsInner && errorsInner.statusDescription
                            ? errorsInner.statusDescription
                            : Strings.WE_FACING_SOME_ISSUE;
                    if (errorsInner) {
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
                    loader: false,
                },
                () => {
                    let message = "Server communication error";
                    let refId = "";
                    let serverDate = "";
                    let rsaStatus = "";
                    if (errors?.message) {
                        message = errors.message;
                        if (errors.error.result) {
                            refId = errors.error.result.paymentRef;
                            serverDate = errors.error.result.serverDate;
                            rsaStatus = errors.error.result.rsaStatus;
                        } else {
                            refId = errors.error.refId;
                            serverDate = errors.error.serverDate;
                        }
                    } else if (errorsMid?.message) {
                        message = errorsMid.message;
                        if (errorsMid.result) {
                            refId = errorsMid.result.paymentRef;
                            serverDate = errorsMid.result.serverDate;
                            rsaStatus = errorsMid.result.rsaStatus;
                        } else {
                            refId = errorsMid.refId;
                            serverDate = errorsMid.serverDate;
                        }
                    } else if (errorsInner?.statusDescription) {
                        message = errorsInner.statusDescription;
                        if (errorsInner.paymentRef) {
                            refId = errorsInner.paymentRef;
                            serverDate = errorsInner.serverDate;
                            rsaStatus = errorsInner.rsaStatus;
                        } else {
                            refId = errorsInner.refId;
                            serverDate = errorsInner.serverDate;
                        }
                    } else if (errorsIn?.message) {
                        message = errorsIn.message;
                        if (errors.error.result) {
                            refId = errorsIn.result.paymentRef;
                            serverDate = errorsIn.result.serverDate;
                            rsaStatus = errorsIn.result.rsaStatus;
                        } else {
                            refId = errorsIn.refId;
                            serverDate = errorsIn.serverDate;
                        }
                    }
                    //this.forceFail(message, refId, serverDate, rsaStatus);
                    showErrorToast({ message: message });
                }
            );
        }
    };

    forceFail = (message, paymentRef, trxDateTimeFomat, rsaStatus) => {
        this.props.navigation.navigate("QrStack", {
            screen: "QrAck",
            params: {
                primary: this.state.primary,
                wallet: this.state.walletF,
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
                settings: this.state.settings,
                setup: this.state.setup,
                regFlow: true,
                quickAction: this.state.quickAction,
            },
        });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        const { challenge, token } = this.state;
        const challengeObj = {
            ...challenge,
            answer,
        };
        console.log(
            "[QRConfirmationScreen] >> [onChallengeQuestionSubmitPress] challengeObj After : ",
            challengeObj
        );
        this.setState({ RSAError: false, isRSARequired: false });
        this.donePress(this.state.otpCode, challengeObj);
    };

    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false, isRSARequired: false });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={5}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={this.onClosePressHandler} />
                                }
                                headerLeftElement={
                                    !this.state.otpRequested ? (
                                        <HeaderBackButton onPress={this.onBackPressHandler} />
                                    ) : (
                                        <View />
                                    )
                                }
                            />
                        }
                    >
                        {this.state.otpRequested ? (
                            <OtpEnter
                                onDonePress={this.donePress}
                                title="One Time Password"
                                description={"Enter OTP sent to \n" + this.state.maskMobileNo}
                                footer="Resend OTP"
                                withTouch={false}
                                disabled={this.state.errorOtp}
                                securepin={false}
                                otpScreen={true}
                                onFooterPress={this.getTac}
                            />
                        ) : (
                            <View style={{ width, height }}>
                                <View style={{ alignItems: "center", justifyContent: "center" }}>
                                    <View style={styles.titleContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={"One Time Password"}
                                        />
                                    </View>
                                    <View style={styles.descriptionContainer}>
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            lineHeight={28}
                                            textAlign="left"
                                            style={{ marginTop: 10 }}
                                            text={
                                                "Your OTP will be sent to \n" +
                                                this.state.maskMobileNo +
                                                ". Please confirm your mobile number."
                                            }
                                        />
                                    </View>
                                </View>
                                <View
                                    style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        alignSelf: "center",
                                        position: "absolute",
                                        bottom: 1,
                                    }}
                                >
                                    <BottomView
                                        notMinePress={this.differentPress}
                                        getTacPressed={this.getTac}
                                    />
                                </View>
                            </View>
                        )}
                        {this.state.errorOtp === true ? (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ errorOtp: false });
                                }}
                                title={Strings.APP_NAME_ALERTS}
                                description={this.state.ErrorMessage}
                                showOk={true}
                                onOkPress={() => {
                                    if (this.state.wallet) {
                                        this.setState({ errorOtp: false, wallet: false });
                                    } else {
                                        this.setState({ errorOtp: false });
                                    }
                                }}
                            />
                        ) : null}

                        {this.state.resendOtp === true ? (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ resendOtp: false });
                                }}
                                title={Strings.APP_NAME_ALERTS}
                                description="Otp send"
                                showOk={true}
                                onOkPress={() => {
                                    this.setState({ resendOtp: false });
                                }}
                            />
                        ) : null}

                        {/* {this.state.notMine === true ? (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ notMine: false });
                                }}
                                title="Need help?"
                                description=""
                                callBank={true}
                                onOkPress={() => {
                                    this.setState({ notMine: false });
                                    Utility.contactBankcall(this.state.maybankNumber);
                                }}
                            />
                        ) : null} */}
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
                <Popup
                    visible={this.state.notMine}
                    onClose={this.callClose}
                    title="Contact Bank"
                    description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                    primaryAction={{
                        text: "Call Now",
                        onPress: this.callPress,
                    }}
                />
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    titleContainer: { alignItems: "flex-start", justifyContent: "flex-start", width: width - 48 },
    descriptionContainer: {
        width: width - 48,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    buttonContainer: {
        width: width - 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffdd00",
        borderRadius: 48,
    },
});
export default withModelContext(QRNumberValidate);

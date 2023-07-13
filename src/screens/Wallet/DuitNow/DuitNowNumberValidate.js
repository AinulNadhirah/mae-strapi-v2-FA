/* eslint-disable react/jsx-no-bind */
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
} from "react-native";
import DeviceInfo from "react-native-device-info";
import FlashMessage from "react-native-flash-message";
import call from "react-native-phone-call";
import PDFView from "react-native-view-pdf";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

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
import OtpEnter from "@components/OtpEnter";

import { REQUEST_SMS_OTP } from "@services/Query";
import { VALIDATE_SMS_OTP, GET_USER_BY_ID, GET_DUITNOW_INQUIRY } from "@services/Query";
// import CustomFlashMessage from "@components/Toast";
import { duitnowRegister, requestM2UOTP, validateM2UOTP } from "@services/index";

import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA, OTP_TYPE_QRPAYREG } from "@constants/api";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/WalletScreen";
import commonStyle from "@styles/main";

class DuitNowNumberValidate extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
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
        };
    }

    async componentDidMount() {
        const userId = JSON.parse(await AsyncStorage.getItem("mayaUserId"));
        // let part = ModelClass.COMMON_DATA.m2uMobileNo;
        // let n = part.length;
        // let f = part.substring(0, 3);
        // let l = part.substring(n - 3, n);
        // let mask = f;
        // for (let i = 0; i < n - 6; i++) {
        //   mask += "*";
        // }
        // mask += l;

        this.setState({ userId: userId });
    }

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
    }

    _duitnowEditApi = async (client) => {
        let item = ModelClass.DUITNOW_DATA.modifyItem;
        let request = {};
        let registrationRequests = [];
        let object = {};

        object.accHolderName = ModelClass.DUITNOW_DATA.cusName;
        object.accHolderType = "S";
        object.accName = ModelClass.DUITNOW_DATA.selectedNricAccoutName;
        object.accNo = ModelClass.DUITNOW_DATA.selectedNricAccoutNo;
        object.accType = ModelClass.DUITNOW_DATA.selectedNricAccoutType;
        object.proxyIdNo = item.source;
        object.proxyIdType = item.proxyTypeCode;
        object.regRefNo = item.regRefNo;
        object.regStatus = "";
        registrationRequests.push(object);

        request.pan = "";
        request.actionForceExpire = "000";
        request.noOfTrx = 1;
        request.proxyBankCode = "MBBEMYKL";
        request.registrationRequests = registrationRequests;
        request.secondaryId = ModelClass.DUITNOW_DATA.secondaryId;
        request.secondaryIdType = ModelClass.DUITNOW_DATA.secondaryIdType;
        request.service = "update";
        request.tac = "";

        await duitnowRegister("/duitnow/register", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                if (regObject !== null && regObject.code === 200) {
                    ModelClass.DUITNOW_DATA.success = true;
                    //this.duitnowInquiry(client, 'Your Duitnow account is updated successfully');
                    ModelClass.DUITNOW_DATA.edit = false;
                    // setTimeout(async () => {
                    //   CustomFlashMessage.showContentSaveMessageLong(
                    //     'Your Duitnow account is updated successfully',
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     10000,
                    //     "#ffde00"
                    //   );
                    // }, 500);
                    ModelClass.DUITNOW_DATA.flashMessage =
                        "Your Duitnow account is updated successfully";
                    ModelClass.DUITNOW_DATA.flashSuccess = true;
                    NavigationService.resetAndNavigateToModule(
                        navigationConstant.SETTINGS_MODULE,
                        navigationConstant.SETTINGS_HOME
                    );
                } else {
                    // setTimeout(async () => {
                    //   CustomFlashMessage.showContentSaveMessageLong(
                    //     "Your Duitnow account update failed",
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     10000,
                    //     "#dc143c"
                    //   );
                    // }, 500);
                    ModelClass.DUITNOW_DATA.flashMessage = "Your DuitNow account update failed";
                    ModelClass.DUITNOW_DATA.flashSuccess = false;
                    ModelClass.DUITNOW_DATA.success = false;
                    ModelClass.DUITNOW_DATA.edit = false;
                    NavigationService.resetAndNavigateToModule(
                        navigationConstant.SETTINGS_MODULE,
                        navigationConstant.SETTINGS_HOME
                    );
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                // setTimeout(async () => {
                //   CustomFlashMessage.showContentSaveMessageLong(
                //     "Your Duitnow account update failed",
                //     "",
                //     "bottom",
                //     "info",
                //     10000,
                //     "#dc143c"
                //   );
                // }, 500);
                ModelClass.DUITNOW_DATA.flashMessage = "Your Duitnow account update failed";
                ModelClass.DUITNOW_DATA.flashSuccess = false;
                ModelClass.DUITNOW_DATA.success = false;
                NavigationService.resetAndNavigateToModule(
                    navigationConstant.SETTINGS_MODULE,
                    navigationConstant.SETTINGS_HOME
                );
            });
    };

    _duitnowAlterApi = async (type, client) => {
        console.log(type);
        let item = ModelClass.DUITNOW_DATA.modifyItem;
        console.log(JSON.stringify(item));
        let request = {};
        let registrationRequests = [];
        let object = {};
        let requestType = "";
        let requestSuccess = "";
        let requestFail = "";
        if (type === 1) {
            requestType = "activate";
            requestSuccess = "Your DuitNow ID is successfully activated";
            requestFail = "Your DuitNow ID activation failed";
        } else if (type === 2) {
            requestType = "deregister";
            requestSuccess = "Your DuitNow ID is successfully deregistered";
            requestFail = "Your DuitNow ID deregistration failed";
        } else if (type === 3) {
            requestType = "suspend";
            requestSuccess = "Your DuitNow ID is temporarily deactivated";
            requestFail = "Your DuitNow ID de-activation failed";
        } else if (type === 4) {
            requestType = "transfer";
            requestSuccess = "Your DuitNow ID is successfully switched to Maybank";
            requestFail = "Your DuitNow ID switch to Maybank failed";
        }
        console.log(requestType);
        if (ModelClass.DUITNOW_DATA.edit === true) {
            object.accHolderName = ModelClass.DUITNOW_DATA.cusName;
            object.accHolderType = "S";
            object.accName = ModelClass.DUITNOW_DATA.selectedNricAccoutName;
            object.accNo = ModelClass.DUITNOW_DATA.selectedNricAccoutNo;
            object.accType = ModelClass.DUITNOW_DATA.selectedNricAccoutType;
            object.proxyIdNo = item.source;
            object.proxyIdType = item.proxyTypeCode;
            object.regRefNo = item.regRefNo;
            object.regStatus = "";
            registrationRequests.push(object);
        } else {
            object.accHolderName = ModelClass.DUITNOW_DATA.cusName;
            object.accHolderType = "S";
            object.accName = item.accountType;
            object.accNo = item.account;
            object.accType = item.accountTypeCode;
            object.proxyIdNo = item.source;
            object.proxyIdType = item.proxyTypeCode;
            object.regRefNo = item.regRefNo;
            object.regStatus = "";
            registrationRequests.push(object);
        }

        request.pan = "";
        request.actionForceExpire = "000";
        request.noOfTrx = 1;
        request.proxyBankCode = "MBBEMYKL";
        request.registrationRequests = registrationRequests;
        request.secondaryId = ModelClass.DUITNOW_DATA.secondaryId;
        request.secondaryIdType = ModelClass.DUITNOW_DATA.secondaryIdType;
        request.service = requestType;
        request.tac = "";
        console.log(JSON.stringify(request));

        await duitnowRegister("/duitnow/register", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                if (regObject !== null && regObject.code === 200) {
                    ModelClass.DUITNOW_DATA.success = true;
                    //this.duitnowInquiry(client, requestSuccess);
                    ModelClass.DUITNOW_DATA.edit = false;
                    // setTimeout(async () => {
                    //   CustomFlashMessage.showContentSaveMessageLong(
                    //     requestSuccess,
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     10000,
                    //     "#ffde00"
                    //   );
                    // }, 500);
                    ModelClass.DUITNOW_DATA.flashMessage = requestSuccess;
                    ModelClass.DUITNOW_DATA.flashSuccess = true;
                    NavigationService.resetAndNavigateToModule(
                        navigationConstant.SETTINGS_MODULE,
                        navigationConstant.SETTINGS_HOME
                    );
                } else {
                    // setTimeout(async () => {
                    //   CustomFlashMessage.showContentSaveMessageLong(
                    //     requestFail,
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     10000,
                    //     "#dc143c"
                    //   );
                    // }, 500);
                    ModelClass.DUITNOW_DATA.flashMessage = requestFail;
                    ModelClass.DUITNOW_DATA.flashSuccess = false;
                    ModelClass.DUITNOW_DATA.success = false;
                    ModelClass.DUITNOW_DATA.edit = false;
                    NavigationService.resetAndNavigateToModule(
                        navigationConstant.SETTINGS_MODULE,
                        navigationConstant.SETTINGS_HOME
                    );
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                // setTimeout(async () => {
                //   CustomFlashMessage.showContentSaveMessageLong(
                //     requestFail,
                //     "",
                //     "bottom",
                //     "info",
                //     10000,
                //     "#dc143c"
                //   );
                // }, 500);
                ModelClass.DUITNOW_DATA.flashMessage = requestFail;
                ModelClass.DUITNOW_DATA.flashSuccess = false;

                ModelClass.DUITNOW_DATA.success = false;
                ModelClass.DUITNOW_DATA.edit = false;
                NavigationService.resetAndNavigateToModule(
                    navigationConstant.SETTINGS_MODULE,
                    navigationConstant.SETTINGS_HOME
                );
            });
    };

    async duitnowInquiry(client, message) {
        console.log("Done");
        const { data } = await client.query({
            query: GET_DUITNOW_INQUIRY,
            fetchPolicy: "network-only",
            variables: {
                tokenType: TOKEN_TYPE_M2U,
                m2uAuthorization:
                    ModelClass.COMMON_DATA.serverAuth + ModelClass.COMMON_DATA.m2uAccessToken,
            },
        });
        console.log("INQ Data", data);
        if (data && data.duitnowInquiry) {
            if (data.duitnowInquiry.code === 200 && data.duitnowInquiry.result) {
                let regCount = 0;
                let nonRegCount = 0;
                let { duitnowInquiry = {} } = data;
                ModelClass.DUITNOW_DATA.registered = duitnowInquiry.result.registeredFlag;
                ModelClass.DUITNOW_DATA.secondaryId = duitnowInquiry.result.secondaryId;
                ModelClass.DUITNOW_DATA.secondaryIdType = duitnowInquiry.result.secondaryIdType;
                if (duitnowInquiry.result.registeredFlag === true) {
                    let ptype = "";
                    let proxyList = [];
                    for (let item in duitnowInquiry.result.registeredProxy) {
                        let proxy = {};
                        proxy.bank = duitnowInquiry.result.registeredProxy[item].bankName;
                        proxy.status = duitnowInquiry.result.registeredProxy[item].proxyStatus;
                        proxy.account = duitnowInquiry.result.registeredProxy[item].accountNo;
                        proxy.accountName = duitnowInquiry.result.registeredProxy[item].accountName;
                        proxy.maybank = duitnowInquiry.result.registeredProxy[item].maybank;
                        proxy.idType = duitnowInquiry.result.registeredProxy[item].idType;
                        proxy.source = duitnowInquiry.result.registeredProxy[item].idVal;
                        proxy.type = duitnowInquiry.result.registeredProxy[item].proxyType;
                        proxy.by = duitnowInquiry.result.registeredProxy[item].isProxySuspendedBy;
                        proxy.key = duitnowInquiry.result.registeredProxy[item].proxyKey;
                        proxy.proxyTypeCode =
                            duitnowInquiry.result.registeredProxy[item].proxyTypeCode;
                        proxy.regRefNo = duitnowInquiry.result.registeredProxy[item].regRefNo;
                        proxy.accountTypeCode =
                            duitnowInquiry.result.registeredProxy[item].accountTypeCode;
                        ptype = duitnowInquiry.result.registeredProxy[item].proxyTypeCode;
                        regCount = regCount + 1;
                        proxyList.push(proxy);
                    }
                    ModelClass.DUITNOW_DATA.duitNowData = proxyList;
                }
                ModelClass.DUITNOW_DATA.regCount = regCount;
                ModelClass.DUITNOW_DATA.showAdd = duitnowInquiry.result.nonRegestredExists;
                if (duitnowInquiry.result.nonRegestredExists === true) {
                    for (let item in duitnowInquiry.result.nonRegisteredProxy) {
                        console.log(item);
                        nonRegCount = nonRegCount + 1;
                        console.log(JSON.stringify(duitnowInquiry.result.nonRegisteredProxy[item]));
                        if (item === "0") {
                            ModelClass.DUITNOW_DATA.dynamicProxyNameAdd1 =
                                duitnowInquiry.result.nonRegisteredProxy[item].text;
                            ModelClass.DUITNOW_DATA.dynamicProxyValueAdd1 =
                                duitnowInquiry.result.nonRegisteredProxy[item].value;
                            ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd1 =
                                duitnowInquiry.result.nonRegisteredProxy[item].proxyTypeCode;
                        } else {
                            ModelClass.DUITNOW_DATA.dynamicProxyNameAdd2 =
                                duitnowInquiry.result.nonRegisteredProxy[item].text;
                            ModelClass.DUITNOW_DATA.dynamicProxyValueAdd2 =
                                duitnowInquiry.result.nonRegisteredProxy[item].value;
                            ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd2 =
                                duitnowInquiry.result.nonRegisteredProxy[item].proxyTypeCode;
                        }
                    }
                }

                ModelClass.DUITNOW_DATA.nonRegCount = nonRegCount;
                setTimeout(async () => {
                    // CustomFlashMessage.showContentSaveMessageLong(
                    //     message,
                    //     "",
                    //     "bottom",
                    //     "info",
                    //     10000,
                    //     "#ffde00"
                    // );
                }, 500);
                ModelClass.DUITNOW_DATA.edit = false;
                NavigationService.resetAndNavigateToModule(
                    navigationConstant.DUITNOW_MODULE,
                    navigationConstant.DUITNOW_REGISTER
                );
            } else {
                this.setState({
                    errorPassword: true,
                    errorMessage: data.duitnowInquiry.result.statusDesc,
                });
            }
        } else {
            this.setState({ errorPassword: true, errorMessage: "DuitNow inquiry failed" });
        }
    }

    render() {
        return (
            <View style={[commonStyle.childContainer, commonStyle.blueBackgroundColor]}>
                <HeaderPageIndicator
                    showBack={false}
                    showClose={true}
                    showIndicator={false}
                    showTitle={false}
                    showBackIndicator={false}
                    pageTitle={""}
                    numberOfPages={1}
                    currentPage={1}
                    navigation={this.props.navigation}
                    moduleName={navigationConstant.DUITNOW_MODULE}
                    routeName={navigationConstant.DUITNOW_REGISTER}
                    testID={"header"}
                    accessibilityLabel={"header"}
                />
                {this.state.otpRequested ? (
                    <ApolloConsumer>
                        {(client) => (
                            <OtpEnter
                                onDonePress={async (code) => {
                                    //add for testing purpose
                                    try {
                                        if (code.length === 6) {
                                            await validateM2UOTP(
                                                "/m2uValidateotp",
                                                JSON.stringify({
                                                    m2uPhone: ModelClass.COMMON_DATA.m2uMobileNo,
                                                    otp: await DataModel.encryptData(code),
                                                    deviceId: ModelClass.COMMON_DATA.hardwareId,
                                                })
                                            )
                                                .then(async (response) => {
                                                    console.log("RES", response);
                                                    const authenticationObject =
                                                        await response.data;
                                                    console.log("Qrobject", authenticationObject);
                                                    if (authenticationObject.code === 0) {
                                                        console.log(
                                                            ModelClass.DUITNOW_DATA.otpCondition
                                                        );

                                                        if (
                                                            ModelClass.DUITNOW_DATA.otpCondition ===
                                                            1
                                                        ) {
                                                            //$$$  duitnow enable  api call
                                                            this._duitnowAlterApi(
                                                                ModelClass.DUITNOW_DATA
                                                                    .otpCondition,
                                                                client
                                                            );
                                                        } else if (
                                                            ModelClass.DUITNOW_DATA.otpCondition ===
                                                            2
                                                        ) {
                                                            //$$$  duitnow remove  api call
                                                            this._duitnowAlterApi(
                                                                ModelClass.DUITNOW_DATA
                                                                    .otpCondition,
                                                                client
                                                            );
                                                        } else if (
                                                            ModelClass.DUITNOW_DATA.otpCondition ===
                                                            3
                                                        ) {
                                                            //$$$  duitnow disable  api call
                                                            this._duitnowAlterApi(
                                                                ModelClass.DUITNOW_DATA
                                                                    .otpCondition,
                                                                client
                                                            );
                                                        } else if (
                                                            ModelClass.DUITNOW_DATA.otpCondition ===
                                                            4
                                                        ) {
                                                            //$$$  duitnow switch bank  api call
                                                            this._duitnowAlterApi(
                                                                ModelClass.DUITNOW_DATA
                                                                    .otpCondition,
                                                                client
                                                            );
                                                        } else if (
                                                            ModelClass.DUITNOW_DATA.otpCondition ===
                                                            5
                                                        ) {
                                                            ModelClass.DUITNOW_DATA.edit = false;
                                                            this._duitnowEditApi(client);
                                                        }
                                                    } else {
                                                        this.setState({
                                                            errorOtp: true,
                                                            ErrorMessage: "Wrong OTP entered",
                                                        });
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.log("ERR", err);
                                                    this.setState({
                                                        errorOtp: true,
                                                        ErrorMessage: "Server communication error",
                                                    });
                                                });
                                        } else {
                                            this.setState({
                                                errorOtp: true,
                                                ErrorMessage: "OTP must consist of 6 digits",
                                            });
                                        }
                                    } catch (e) {
                                        console.log(e);
                                        this.setState({
                                            errorOtp: true,
                                            ErrorMessage: "Wrong OTP entered",
                                        });
                                    }
                                }}
                                title="One Time Password"
                                description="Enter OTP sent to your mobile number \n"
                                footer="Resend OTP"
                                withTouch={false}
                                disabled={this.state.errorOtp}
                                securepin={false}
                                otpScreen={true}
                                onFooterPress={async () => {
                                    await requestM2UOTP(
                                        "/requestotp",
                                        JSON.stringify({
                                            mobileNo: ModelClass.COMMON_DATA.m2uMobileNo,
                                            otpType: OTP_TYPE_QRPAYREG,
                                        })
                                    )
                                        .then(async (response) => {
                                            console.log("RES", response);
                                            const authenticationObject = await response.data;
                                            console.log("Qrobject", authenticationObject);
                                            if (ModelClass.COMMON_DATA.showTacOtp) {
                                                if (authenticationObject.code === 0) {
                                                    ModelClass.QR_DATA.otp =
                                                        authenticationObject.result.otpValue;
                                                    // CustomFlashMessage.showContentSaveMessageLong(
                                                    //     "Your OTP no. is " +
                                                    //         authenticationObject.result.otpValue,
                                                    //     "",
                                                    //     "top",
                                                    //     "info",
                                                    //     20000,
                                                    //     "#ffde00"
                                                    // );
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("ERR", err);
                                        });

                                    this.setState({ otpRequested: true });
                                }}
                            />
                        )}
                    </ApolloConsumer>
                ) : (
                    <ScrollView>
                        <View style={Styles.addedTitleContainer}>
                            <Text
                                style={[Styles.addedTitle, commonStyle.font]}
                                accessible={true}
                                testID={"txtLoyaltyRewards"}
                                accessibilityLabel={"txtLoyaltyRewards"}
                            >
                                One Time Password
                            </Text>
                        </View>
                        {this.state.mobileAvailable ? (
                            <View style={Styles.addedDescriptionContainer}>
                                <Text
                                    style={[Styles.addedDescription, commonStyle.font]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    {"Will be sent to " +
                                        this.state.maskMobileNo +
                                        " Is this your mobile number?"}
                                </Text>
                            </View>
                        ) : (
                            <View style={Styles.addedDescriptionContainer}>
                                {this.state.userId != null && this.state.mobileNo == null && (
                                    <Query
                                        query={GET_USER_BY_ID}
                                        variables={{
                                            tokenType: TOKEN_TYPE_MAYA,
                                            mayaAuthorization:
                                                ModelClass.COMMON_DATA.serverAuth +
                                                ModelClass.COMMON_DATA.mayaToken,
                                        }}
                                        fetchPolicy="cache-first"
                                    >
                                        {({ loading, error, data, refetch }) => {
                                            //console.log(this.state.userId);
                                            if (
                                                data &&
                                                data.getUserById &&
                                                data.getUserById.result.hpNo
                                            ) {
                                                ModelClass.COMMON_DATA.mobileNo =
                                                    data.getUserById.result.hpNo;
                                                this.state.mobileNo =
                                                    ModelClass.COMMON_DATA.m2uMobileNo;
                                                //this.state.mobileNo = data.getUserById.result.hpNo;
                                                //let part = this.state.mobileNo.substring(2, this.state.mobileNo.length);
                                                let part = this.state.mobileNo;
                                                let n = part.length;
                                                let f = part.substring(0, 3);
                                                let l = part.substring(n - 3, n);
                                                let mask = f;
                                                for (let i = 0; i < n - 6; i++) {
                                                    mask += "*";
                                                }
                                                mask += l;
                                                this.state.maskMobileNo = mask;
                                                this.state.mobileAvailable = true;
                                            }

                                            return (
                                                <Text
                                                    style={[
                                                        Styles.addedDescription,
                                                        commonStyle.font,
                                                    ]}
                                                    accessible={true}
                                                    testID={"txtLoyaltyRewards"}
                                                    accessibilityLabel={"txtLoyaltyRewards"}
                                                >
                                                    {"Will be sent to " +
                                                        this.state.maskMobileNo +
                                                        " Is this your mobile number?"}
                                                </Text>
                                            );
                                        }}
                                    </Query>
                                )}
                            </View>
                        )}

                        <View style={{ marginLeft: 50, marginTop: 20, marginBottom: 10 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    ModelClass.PDF_DATA.file =
                                        "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/NAD_TNC.pdf";
                                    ModelClass.PDF_DATA.share = false;
                                    ModelClass.PDF_DATA.type = "url";
                                    ModelClass.PDF_DATA.route =
                                        navigationConstant.DUITNOW_NUMBER_VALIDATE;
                                    ModelClass.PDF_DATA.module = navigationConstant.DUITNOW_MODULE;
                                    ModelClass.PDF_DATA.title = "Terms & Conditions";
                                    ModelClass.PDF_DATA.pdfType = "shareReceipt";
                                    NavigationService.navigateToModule(
                                        navigationConstant.COMMON_MODULE,
                                        navigationConstant.PDF_VIEW
                                    );
                                }}
                            >
                                <Text
                                    style={[
                                        {
                                            fontWeight: "100",
                                            fontSize: 14,
                                            textDecorationLine: "underline",
                                        },
                                        commonStyle.font,
                                    ]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    {Strings.TERMS_CONDITIONS}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ApolloConsumer>
                            {(client) => (
                                <View style={Styles.addedSetupTop}>
                                    <SetupNow
                                        isBigIcon={true}
                                        text="Yes It's Mine"
                                        url={require("@assets/icons/ic_yellow_tick.png")}
                                        onPress={async () => {
                                            console.log("Click");
                                            await requestM2UOTP(
                                                "/requestotp",
                                                JSON.stringify({
                                                    mobileNo: ModelClass.COMMON_DATA.m2uMobileNo,
                                                    otpType: OTP_TYPE_QRPAYREG,
                                                })
                                            )
                                                .then(async (response) => {
                                                    console.log("RES", response);
                                                    const authenticationObject =
                                                        await response.data;
                                                    console.log("Qrobject", authenticationObject);
                                                    if (ModelClass.COMMON_DATA.showTacOtp) {
                                                        if (authenticationObject.code === 0) {
                                                            ModelClass.QR_DATA.otp =
                                                                authenticationObject.result.otpValue;
                                                            // CustomFlashMessage.showContentSaveMessageLong(
                                                            //     "Your OTP no. is " +
                                                            //         authenticationObject.result
                                                            //             .otpValue,
                                                            //     "",
                                                            //     "top",
                                                            //     "info",
                                                            //     20000,
                                                            //     "#ffde00"
                                                            // );
                                                        }
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.log("ERR", err);
                                                });

                                            this.setState({ otpRequested: true });
                                        }}
                                    />
                                </View>
                            )}
                        </ApolloConsumer>

                        <View style={Styles.addedSetupDown}>
                            <SetupNow
                                isBigIcon={true}
                                text={"Not Mine"}
                                url={require("@assets/icons/ic_close_blue.png")}
                                onPress={() => {
                                    this.setState({ notMine: true });
                                }}
                            />
                        </View>
                    </ScrollView>
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
                            setTimeout(async function () {
                                NavigationService.resetAndNavigateToModule(
                                    navigationConstant.DUITNOW_MODULE,
                                    navigationConstant.DUITNOW_REGISTER
                                );
                            }, 500);
                            setTimeout(async () => {
                                // CustomFlashMessage.showContentSaveMessageLong(
                                //     "Your DuitNow update failed, due to wrong OTP entered",
                                //     "",
                                //     "bottom",
                                //     "info",
                                //     10000,
                                //     "#dc143c"
                                // );
                            }, 1000);

                            this.setState({ errorOtp: false });
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

                {this.state.notMine === true ? (
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
                ) : null}
                <FlashMessage />
            </View>
        );
    }
}

export default DuitNowNumberValidate;

/* eslint-disable react/jsx-no-bind */

/* eslint-disable require-atomic-updates */
import AsyncStorage from "@react-native-community/async-storage";
import React, { Component } from "react";
import { Query, ApolloConsumer } from "react-apollo";
import { View, Alert, Text, TouchableOpacity, Image, Platform, Keyboard } from "react-native";
import DeviceInfo from "react-native-device-info";
// import CustomFlashMessage from "@components/Toast";
import FlashMessage from "react-native-flash-message";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import {
    HeaderPageIndicator,
    WalletEnter,
    ErrorMessage,
    NextRightButton,
} from "@components/Common";

import { VERIFY_M2U_USERNAME } from "@services/Query";
import { LOGIN_M2U } from "@services/Query";
import { REQUEST_SMS_OTP } from "@services/Query";
import { VALIDATE_SMS_OTP } from "@services/Query";
import { UPDATE_WALLET_ACCOUNTS_CARDS } from "@services/Query";
import { GET_USER_ACCOUNTS } from "@services/Query";
import { GET_DUITNOW_INQUIRY } from "@services/Query";
import { verifyM2uUserName, loginM2u, executeQRTransaction } from "@services/index";

import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";

import commonStyle from "@styles/main";

var { JSEncrypt } = require("@libs/jsencrypt.js");

class DuitNowLogin extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            client: null,
            currentScreen: 0,
            userName: "",
            password: "",
            image: "",
            secText: "",
            ic: "",
            errorOtp: false,
            errorPassword: false,
            errorNetwork: false,
            walletSuccess: false,
            mobileNo: "",
            routeFrom: "",
            routeTo: "",
            data: {},
            errorMessage: "",
        };

        this.getUI1 = this.getUI1.bind(this);
        this.getUI2 = this.getUI2.bind(this);
        this.getQrErrorScreen = this.getQrErrorScreen.bind(this);
        this.getErrorPassword = this.getErrorPassword.bind(this);
    }

    state = {
        client: null,
        currentScreen: 0,
        userName: "",
        password: "",
        image: "",
        secText: "",
        ic: "",
        errorOtp: false,
        qrError: false,
        errorPassword: false,
        walletSuccess: false,
        m2uUserId: 0,
        routeFrom: "",
        routeTo: "",
        data: {},
    };

    async componentWillMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            let m2uUserName = null;
            try {
                //todo call cusKey API
                m2uUserName = await AsyncStorage.getItem("m2uUserName");
                this.setState({
                    userName: m2uUserName,
                });
                ModelClass.TRANSFER_DATA.m2uUserName = m2uUserName;
            } catch (e) {}

            try {
                verifyM2uUserName(false, this.state.userName)
                    .then(async (response) => {
                        console.log("RES", response);
                        const authenticationObject = await response.data;
                        console.log("Qrobject", authenticationObject);
                        if (authenticationObject !== null && authenticationObject.code === "200") {
                            const { route } = this.props;
                            this.state.routeFrom = route.params?.routeFrom ?? "";
                            this.state.routeTo = route.params?.routeTo ?? "";
                            this.state.data = route.params?.data ?? {};
                            this.setState({
                                currentScreen: 1,
                                image: authenticationObject.url,
                                secText: authenticationObject.caption,
                                routeFrom: route.params?.routeFrom ?? "",
                                routeTo: route.params?.routeTo ?? "",
                                data: route.params?.data ?? {},
                            });
                        } else {
                            this.setState({
                                currentScreen: 1,
                                image: "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                                secText: "I'm cool",
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("ERR", err);
                        this.setState({
                            qrError: true,
                            errorMessage: "Server communication error",
                            currentScreen: 2,
                            image: "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                            secText: "I'm good",
                        });
                    });

                // const doAuthenticationResponse = await verifyM2uUserName('/verifyUserName?userName=' + this.state.userName);
                // const authenticationObject = await doAuthenticationResponse.json();
            } catch (e) {
                console.log(e);
                this.setState({
                    currentScreen: 1,
                    image: "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                    secText: "I'm good",
                });
            }
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            this.setState({
                client: null,
                currentScreen: 0,
                userName: "",
                password: "",
                image: "",
                secText: "",
                ic: "",
                errorOtp: false,
                errorPassword: false,
                errorNetwork: false,
                walletSuccess: false,
                mobileNo: "",
                routeFrom: "",
                routeTo: "",
                data: "",
                mayaUserId: "",
            });
        });
        // const { route } = this.props;
        // this.state.routeFrom = navigation.getParam('routeFrom', "");
        // this.state.routeTo = navigation.getParam('routeTo', "");
        // this.state.data = navigation.getParam('data', {});
    }

    async componentDidMount() {
        let mayaUserId = await AsyncStorage.getItem("mayaUserId");
        this.setState({ mayaUserId: mayaUserId });
        console.log("settings is", ModelClass.settings.isLoginM2uRoute);
        if (ModelClass.settings.isLoginM2uRoute == "Settings") {
            this.setState({
                currentScreen: 1,
                image: authenticationObject.url,
                secText: authenticationObject.caption,
                routeFrom: route.params?.routeFrom ?? "",
                routeTo: route.params?.routeTo ?? "",
                data: route.params?.data ?? {},
            });
        }
    }

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
        this.focusSubscription();
        this.blurSubscription();
    }

    onUserNameChange(text) {
        this.setState({ userName: text });
    }

    onICChange(text) {
        this.setState({ ic: text });
    }

    onPasswordChange(text) {
        this.setState({ password: text });
    }

    async duitnowInquiry(client) {
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
                        proxy.accountType = duitnowInquiry.result.registeredProxy[item].accountType;
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
                NavigationService.navigateToModule(
                    navigationConstant.DUITNOW_MODULE,
                    navigationConstant.DUITNOW_REGISTER
                );
            } else {
                this.setState({
                    errorPassword: true,
                    errorMessage: data.duitnowInquiry.result.statusDesc,
                    password: "",
                });
            }
        } else {
            this.setState({
                errorPassword: true,
                errorMessage: "DuitNow inquiry failed",
                password: "",
            });
        }
    }

    getUI1 = () => {
        return this.state.currentScreen === 1 ? (
            <ApolloConsumer>
                {(client) => (
                    <WalletEnter
                        onNextPress={async () => {
                            try {
                                Keyboard.dismiss();
                                if (this.state.password !== null && this.state.password !== "") {
                                    let pw = await DataModel.encryptData(this.state.password);
                                    loginM2u(
                                        "/token",
                                        JSON.stringify({
                                            username: this.state.userName,
                                            password: pw,
                                            grantType: "PASSWORD",
                                            loginFrom: "ACTIVATION",
                                            phoneNo: ModelClass.COMMON_DATA.mobileNo,
                                            withAccounts: true,
                                            limitApproved: true,
                                            mobileSDKData: {
                                                deviceId: ModelClass.COMMON_DATA.hardwareId,
                                                deviceName: ModelClass.COMMON_DATA.device_name,
                                                deviceModel: ModelClass.COMMON_DATA.device_model,
                                                rsaKey:
                                                    ModelClass.COMMON_DATA.rsa_key == ""
                                                        ? "87275AA18A09854DEDB6177645D5C1BD"
                                                        : ModelClass.COMMON_DATA.rsa_key,
                                                osType: Platform.OS,
                                                osVersion: ModelClass.COMMON_DATA.os_version,
                                                deviceDetail: ModelClass.COMMON_DATA.device_name,
                                            },
                                        })
                                    )
                                        .then(async (response) => {
                                            console.log("RES", response);
                                            const authenticationObject = await response.data;
                                            console.log("Qrobject", authenticationObject);
                                            if (
                                                authenticationObject !== null &&
                                                authenticationObject.code === "200"
                                            ) {
                                                ModelClass.COMMON_DATA.m2uAccessToken =
                                                    authenticationObject.access_token.toString();
                                                ModelClass.COMMON_DATA.m2uAccessRefreshToken =
                                                    authenticationObject.refresh_token.toString();
                                                ModelClass.TRANSFER_DATA.m2uToken =
                                                    authenticationObject.access_token.toString();
                                                ModelClass.COMMON_DATA.m2uMobileNo =
                                                    authenticationObject.contact_number.toString();
                                                ModelClass.TRANSFER_DATA.nric =
                                                    authenticationObject.ic_number.toString();
                                                //ModelClass.DUITNOW_DATA.dynamicProxyValue1 = authenticationObject.ic_number.toString();
                                                //ModelClass.DUITNOW_DATA.dynamicProxyValue2 = authenticationObject.contact_number.toString();
                                                ModelClass.DUITNOW_DATA.cusName =
                                                    authenticationObject.cus_name.toString();
                                                ModelClass.DUITNOW_DATA.ic =
                                                    authenticationObject.ic_number.toString();
                                                ModelClass.DUITNOW_DATA.phone =
                                                    authenticationObject.contact_number.toString();
                                                this.state.data.m2uUserId =
                                                    authenticationObject.user_id;

                                                console.log(this.state.mayaUserId);

                                                if (ModelClass.DUITNOW_DATA.transfer === true) {
                                                    if (ModelClass.DUITNOW_DATA.isSendMoneyFlow) {
                                                        NavigationService.navigateToModule(
                                                            navigationConstant.DUITNOW_MODULE,
                                                            navigationConstant.DUITNOW_ENTER_ID
                                                        );
                                                    } else {
                                                        NavigationService.navigateToModule(
                                                            navigationConstant.DUITNOW_MODULE,
                                                            navigationConstant.DUITNOW_TRANSFER
                                                        );
                                                    }
                                                } else {
                                                    const { data } = await client.query({
                                                        query: GET_USER_ACCOUNTS,
                                                        fetchPolicy: "network-only",
                                                        variables: {
                                                            tokenType: TOKEN_TYPE_M2U,
                                                            m2uauthorization:
                                                                ModelClass.COMMON_DATA.serverAuth +
                                                                ModelClass.COMMON_DATA
                                                                    .m2uAccessToken,
                                                            mayaUserId: this.state.mayaUserId,
                                                            showPreloader: false,
                                                            promptError: false,
                                                        },
                                                    });
                                                    console.log(data);
                                                    if (data && data.getAllUserAccounts) {
                                                        let { getAllUserAccounts = {} } = data;
                                                        let accList = [];
                                                        let accList2 = [];
                                                        for (let item in getAllUserAccounts) {
                                                            console.log(item);
                                                            let acc = {};
                                                            acc.acctStatus = "";
                                                            acc.id = item;
                                                            acc.curCode =
                                                                getAllUserAccounts[item].curCode;
                                                            acc.primary = false;
                                                            acc.select = false;
                                                            acc.type =
                                                                getAllUserAccounts[item].acctType;
                                                            acc.acctBalance =
                                                                getAllUserAccounts[
                                                                    item
                                                                ].acctBalance;
                                                            acc.title =
                                                                getAllUserAccounts[item].acctName;
                                                            acc.description = getAllUserAccounts[
                                                                item
                                                            ].acctNo.substring(0, 12);
                                                            if (item === "0") {
                                                                ModelClass.TRANSFER_DATA.fromAccount =
                                                                    getAllUserAccounts[
                                                                        item
                                                                    ].acctNo.substring(0, 12);
                                                                acc.primary = true;
                                                                acc.select = true;
                                                            }
                                                            accList.push(acc);
                                                            accList2.push(acc);
                                                        }
                                                        ModelClass.DUITNOW_DATA.nricAccounts =
                                                            accList;
                                                        ModelClass.DUITNOW_DATA.mobileAccounts =
                                                            accList2;
                                                    }
                                                    await this.duitnowInquiry(client);
                                                }
                                            } else {
                                                Keyboard.dismiss();
                                                this.setState({
                                                    errorPassword: true,
                                                    errorMessage: authenticationObject.message,
                                                    password: "",
                                                });
                                            }
                                        })
                                        .catch((err) => {
                                            Keyboard.dismiss();
                                            this.setState({
                                                errorPassword: true,
                                                errorMessage: "Server communication error",
                                                password: "",
                                            });
                                            console.log("ERR", err);
                                        });
                                } else {
                                    Keyboard.dismiss();
                                    this.setState({
                                        errorPassword: true,
                                        errorMessage: "Password cannot be empty",
                                        password: "",
                                    });
                                }
                            } catch (e) {
                                console.log(e);
                                Keyboard.dismiss();
                                this.setState({
                                    errorPassword: true,
                                    errorMessage: "M2U Login failed",
                                    password: "",
                                });
                            }
                        }}
                        onChangeText={this.onPasswordChange.bind(this)}
                        title="Login to Maybank2u"
                        description="Please enter your password "
                        image={this.state.image}
                        //footer="Forgot Password"
                        footer=""
                        secure="true"
                        passwordScreen={true}
                        userName={this.state.userName}
                        phrase={this.state.secText}
                        placeHolder="Enter M2U Password"
                        qr={true}
                        value={this.state.password}
                    />
                )}
            </ApolloConsumer>
        ) : null;
    };

    getUI2 = () => {
        return (
            <ApolloConsumer>
                {(client) => (
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                        }}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 10,
                                backgroundColor: "transparent",
                            }}
                        >
                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        Keyboard.dismiss();
                                        if (
                                            this.state.password !== null &&
                                            this.state.password !== ""
                                        ) {
                                            let pw = await DataModel.encryptData(
                                                this.state.password
                                            );
                                            this.setState({ loader: true });
                                            loginM2u(
                                                "/token",
                                                JSON.stringify({
                                                    username: this.state.userName,
                                                    password: await DataModel.encryptData(
                                                        this.state.password
                                                    ),
                                                    grantType: "PASSWORD",
                                                    loginFrom: "ACTIVATION",
                                                    phoneNo: ModelClass.COMMON_DATA.mobileNo,
                                                    withAccounts: true,
                                                    limitApproved: true,
                                                    mobileSDKData: {
                                                        deviceId: ModelClass.COMMON_DATA.hardwareId,
                                                        deviceName:
                                                            ModelClass.COMMON_DATA.device_name,
                                                        deviceModel:
                                                            ModelClass.COMMON_DATA.device_model,
                                                        rsaKey:
                                                            ModelClass.COMMON_DATA.rsa_key == ""
                                                                ? "87275AA18A09854DEDB6177645D5C1BD"
                                                                : ModelClass.COMMON_DATA.rsa_key,
                                                        osType: Platform.OS,
                                                        osVersion:
                                                            ModelClass.COMMON_DATA.os_version,
                                                        deviceDetail:
                                                            ModelClass.COMMON_DATA.device_name,
                                                    },
                                                })
                                            )
                                                .then(async (response) => {
                                                    console.log("RES", response);
                                                    const authenticationObject =
                                                        await response.data;
                                                    console.log("Qrobject", authenticationObject);
                                                    if (
                                                        authenticationObject !== null &&
                                                        authenticationObject.code === "200"
                                                    ) {
                                                        ModelClass.COMMON_DATA.m2uAccessToken =
                                                            authenticationObject.access_token.toString();
                                                        ModelClass.COMMON_DATA.m2uAccessRefreshToken =
                                                            authenticationObject.refresh_token.toString();
                                                        ModelClass.TRANSFER_DATA.m2uToken =
                                                            authenticationObject.access_token.toString();
                                                        ModelClass.TRANSFER_DATA.m2uAccessRefreshToken =
                                                            authenticationObject.refresh_token.toString();
                                                        ModelClass.COMMON_DATA.m2uMobileNo =
                                                            authenticationObject.contact_number.toString();
                                                        ModelClass.TRANSFER_DATA.nric =
                                                            authenticationObject.ic_number.toString();
                                                        //ModelClass.DUITNOW_DATA.dynamicProxyValue1 = authenticationObject.ic_number.toString();
                                                        //ModelClass.DUITNOW_DATA.dynamicProxyValue2 = authenticationObject.contact_number.toString();
                                                        ModelClass.DUITNOW_DATA.cusName =
                                                            authenticationObject.cus_name.toString();
                                                        ModelClass.DUITNOW_DATA.ic =
                                                            authenticationObject.ic_number.toString();
                                                        ModelClass.DUITNOW_DATA.phone =
                                                            authenticationObject.contact_number.toString();
                                                        this.state.data.m2uUserId =
                                                            authenticationObject.user_id;
                                                        console.log(this.state.mayaUserId);

                                                        if (
                                                            ModelClass.DUITNOW_DATA.transfer ===
                                                            true
                                                        ) {
                                                            NavigationService.navigateToModule(
                                                                navigationConstant.DUITNOW_MODULE,
                                                                navigationConstant.DUITNOW_TRANSFER
                                                            );
                                                        } else {
                                                            const { data } = await client.query({
                                                                query: GET_USER_ACCOUNTS,
                                                                fetchPolicy: "network-only",
                                                                variables: {
                                                                    tokenType: TOKEN_TYPE_M2U,
                                                                    m2uauthorization:
                                                                        ModelClass.COMMON_DATA
                                                                            .serverAuth +
                                                                        ModelClass.COMMON_DATA
                                                                            .m2uAccessToken,
                                                                    mayaUserId:
                                                                        this.state.mayaUserId,
                                                                    showPreloader: false,
                                                                    promptError: false,
                                                                },
                                                            });
                                                            console.log(data);
                                                            console.log(data);
                                                            if (data && data.getAllUserAccounts) {
                                                                let { getAllUserAccounts = {} } =
                                                                    data;
                                                                let accList = [];
                                                                let accList2 = [];
                                                                for (let item in getAllUserAccounts) {
                                                                    console.log(item);
                                                                    let acc = {};
                                                                    acc.acctStatus = "";
                                                                    acc.id = item;
                                                                    acc.curCode =
                                                                        getAllUserAccounts[
                                                                            item
                                                                        ].curCode;
                                                                    acc.primary = false;
                                                                    acc.select = false;
                                                                    acc.type =
                                                                        getAllUserAccounts[
                                                                            item
                                                                        ].acctType;
                                                                    acc.acctBalance =
                                                                        getAllUserAccounts[
                                                                            item
                                                                        ].acctBalance;
                                                                    acc.title =
                                                                        getAllUserAccounts[
                                                                            item
                                                                        ].acctName;
                                                                    acc.description =
                                                                        getAllUserAccounts[
                                                                            item
                                                                        ].acctNo.substring(0, 12);
                                                                    if (item === "0") {
                                                                        ModelClass.TRANSFER_DATA.fromAccount =
                                                                            getAllUserAccounts[
                                                                                item
                                                                            ].acctNo.substring(
                                                                                0,
                                                                                12
                                                                            );
                                                                        acc.primary = true;
                                                                        acc.select = true;
                                                                    }
                                                                    accList.push(acc);
                                                                    accList2.push(acc);
                                                                }
                                                                ModelClass.DUITNOW_DATA.nricAccounts =
                                                                    accList;
                                                                ModelClass.DUITNOW_DATA.mobileAccounts =
                                                                    accList2;
                                                            }
                                                            await this.duitnowInquiry(client);
                                                        }
                                                    } else {
                                                        Keyboard.dismiss();
                                                        this.setState({
                                                            errorPassword: true,
                                                            errorMessage:
                                                                authenticationObject.message,
                                                            password: "",
                                                        });
                                                    }
                                                })
                                                .catch((err) => {
                                                    Keyboard.dismiss();
                                                    this.setState({
                                                        errorPassword: true,
                                                        errorMessage: "Server communication error",
                                                        password: "",
                                                    });
                                                    console.log("ERR", err);
                                                });
                                        } else {
                                            Keyboard.dismiss();
                                            this.setState({
                                                errorPassword: true,
                                                errorMessage: "Password cannot be empty",
                                                password: "",
                                            });
                                        }
                                    } catch (e) {
                                        console.log(e);
                                        Keyboard.dismiss();
                                        this.setState({
                                            errorPassword: true,
                                            errorMessage: "M2U login failed",
                                            password: "",
                                        });
                                    }
                                }}
                            >
                                <Image
                                    accessible={true}
                                    testID={"imgWalDone"}
                                    accessibilityLabel={"imgWalDone"}
                                    style={{
                                        height: 70,
                                        width: 70,
                                    }}
                                    source={require("@assets/icons/ic_tick.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ApolloConsumer>
        );
    };

    getQrErrorScreen = () => {
        return this.state.qrError === true ? (
            <ErrorMessage
                onClose={() => {
                    this.setState({ qrError: false });
                    this.props.navigation.pop();
                    NavigationService.navigate(
                        navigationConstant.HOME_DASHBOARD,
                        navigationConstant.HOME_DASHBOARD
                    );
                }}
                title={Strings.APP_NAME_ALERTS}
                description={
                    this.state.errorMessage != undefined ||
                    this.state.errorMessage != null ||
                    this.state.errorMessage.length != 0
                        ? this.state.errorMessage
                        : Strings.WE_FACING_SOME_ISSUE
                }
                showOk={true}
                onOkPress={() => {
                    this.setState({ qrError: false });
                    this.props.navigation.pop();
                    NavigationService.navigate(this.state.routeTo, this.state.data);
                }}
            />
        ) : null;
    };

    getErrorPassword = () => {
        return this.state.errorPassword === true ? (
            <ErrorMessage
                onClose={() => {
                    this.setState({ errorPassword: false });
                }}
                title={Strings.APP_NAME_ALERTS}
                description={this.state.errorMessage}
                showOk={true}
                onOkPress={() => {
                    this.setState({ errorPassword: false });
                }}
            />
        ) : null;
    };

    render() {
        return (
            <View style={[commonStyle.wrapperPlain, commonStyle.blueBackgroundColor]}>
                <HeaderPageIndicator
                    showBack={true}
                    showClose={false}
                    showIndicator={false}
                    showTitle={false}
                    showBackIndicator={true}
                    pageTitle={""}
                    numberOfPages={1}
                    currentPage={this.state.currentScreen}
                    navigation={this.props.navigation}
                    noPop={true}
                    moduleName={ModelClass.DUITNOW_DATA.routeModule}
                    routeName={ModelClass.DUITNOW_DATA.routeFrom}
                    onBackPress={() => {
                        NavigationService.navigateToModule(
                            ModelClass.DUITNOW_DATA.routeModule,
                            ModelClass.DUITNOW_DATA.routeFrom
                        );
                    }}
                />

                {this.getUI1()}
                {this.state.currentScreen === 1 ? this.getUI2() : null}

                {this.getQrErrorScreen()}
                {this.getErrorPassword()}

                <FlashMessage />
            </View>
        );
    }
}

export default DuitNowLogin;

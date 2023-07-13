"use strict";
import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Picker,
    Text,
    Keyboard,
    Alert,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    FlatList,
} from "react-native";
import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyles from "@styles/main";
import AccountDetailList from "@components/Others/AccountDetailList";
import commonStyle from "@styles/main";

import {
    ErrorMessage,
    HeaderPageIndicator,
    Input,
    DropDownButtonNoIcon,
    DropDownButtonCenter,
    SetupNow,
    CustomCircularNameView,
    ButtonRoundLong,
} from "@components/Common";
import PropTypes from "prop-types";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";
import { ACCOUNTS_DUMMY } from "@constants/data";
import { CustomAvatarCircle } from "@components/Common";
import { updateTxnCategory } from "@services/index";
import * as Utility from "@utils/dataModel/utility";
import PDFView from "react-native-view-pdf";
// import CustomFlashMessage from "@components/Toast";
import { GET_DUITNOW_INQUIRY } from "@services/Query";
import { Query, ApolloConsumer } from "react-apollo";
import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";

class DuitNowAck extends Component {
    static navigationOptions = { title: "", header: null };

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
            payeeName: "",
            merchant: "",
            viewPdf: false,
            pdfFile: "",
            pdfBase64: "",
            validPromo: false,
            promoPct: 0,
            promoType: "",
            errorPassword: false,
            errorMessage: "",
        };
        this.onTextChange = this._onTextChange.bind(this);
        this.onTextDone = this._onTextDone.bind(this);
        this.onAccountItemClick = this._onAccountItemClick.bind(this);
        this.onAccountItemSwipeChange = this._onAccountItemSwipeChange.bind(this);
        this.onConfirmClick = this._onConfirmClick.bind(this);
    }

    _onTextChange = (text) => {
        this.setState({ referenceText: text });
    };

    _onTextDone = async (text) => {
        //this.setState({ referenceText: text });
    };

    _onAccountItemClick = (item) => {
        //this.setState({ referenceText: text });
    };

    _onAccountItemSwipeChange = (text) => {
        //this.setState({ referenceText: text });
    };

    _onConfirmClick = async (client) => {
        // if (ModelClass.DUITNOW_DATA.success === true) {
        //   //await this.duitnowInquiry(client);

        // } else {

        //   NavigationService.navigateToModule(
        //     navigationConstant.DUITNOW_MODULE,
        //     navigationConstant.DUITNOW_REGISTER
        //   )
        // }

        if (ModelClass.DUITNOW_DATA.success === true) {
            ModelClass.DUITNOW_DATA.flashMessage = "";
            ModelClass.DUITNOW_DATA.flashSuccess = true;
        } else {
            ModelClass.DUITNOW_DATA.flashMessage = "";
            ModelClass.DUITNOW_DATA.flashSuccess = false;
        }
        NavigationService.resetAndNavigateToModule(
            navigationConstant.SETTINGS_MODULE,
            navigationConstant.SETTINGS_HOME
        );
    };

    async onDoneClick(client) {}

    async duitnowInquiry(client) {
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

    componentWillMount() {}

    render() {
        return (
            <ApolloConsumer>
                {(client) => (
                    <View style={Styles.containerWhiteLight}>
                        <HeaderPageIndicator
                            showBack={false}
                            showClose={false}
                            showShare={false}
                            showIndicator={false}
                            showTitle={false}
                            showTitleCenter={false}
                            showBackIndicator={true}
                            pageTitle={Strings.TRANSFER_TO}
                            numberOfPages={0}
                            currentPage={0}
                            onBackPress={this.onBackPress}
                            navigation={this.props.navigation}
                            moduleName={navigationConstant.HOME_DASHBOARD}
                            routeName={navigationConstant.HOME_DASHBOARD}
                            testID={"header"}
                            accessibilityLabel={"header"}
                            onMorePress={async () => {}}
                        />
                        <ScrollView>
                            <View style={Styles.block}>
                                {ModelClass.DUITNOW_DATA.success ? (
                                    <View style={Styles.titleContainerCenter2}>
                                        {ModelClass.DUITNOW_DATA.partiallySuccess ? (
                                            <Text style={[Styles.titleText2, commonStyles.font]}>
                                                Unfortunately! Your DuitNow registration is
                                                partially successful
                                            </Text>
                                        ) : (
                                            <Text style={[Styles.titleText2, commonStyles.font]}>
                                                You have successfully registered for DuitNow
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <View style={Styles.titleContainerCenter2}>
                                        <Text style={[Styles.titleText2, commonStyles.font]}>
                                            DuitNow registration failed
                                        </Text>
                                    </View>
                                )}
                                {ModelClass.DUITNOW_DATA.success ? null : (
                                    <View style={Styles.titleContainerCenter2}>
                                        <Text
                                            style={[Styles.titleText2ErrorMsg, commonStyles.font]}
                                        >
                                            {ModelClass.DUITNOW_DATA.message}
                                        </Text>
                                    </View>
                                )}

                                <View style={Styles.cardSmallContainerCenter1}>
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
                                            source={require("@assets/icons/Ic_doit_now.png")}
                                            resizeMode="stretch"
                                        >
                                            {ModelClass.DUITNOW_DATA.partiallySuccess ? null : (
                                                <Image
                                                    style={{
                                                        height: 18,
                                                        width: 18,
                                                        marginLeft: 60,
                                                        marginTop: 30,
                                                    }}
                                                    source={
                                                        ModelClass.DUITNOW_DATA.success
                                                            ? require("@assets/icons/ic_done_green.png")
                                                            : require("@assets/icons/ic_error_msg.png")
                                                    }
                                                />
                                            )}
                                        </ImageBackground>
                                    </View>
                                </View>

                                {ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 3 ||
                                ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 1 ? (
                                    <View
                                        style={{
                                            marginLeft: 50,
                                            marginTop: 10,
                                            flex: 1,
                                            flexDirection: "column",
                                        }}
                                    >
                                        <View style={{ flexDirection: "row" }}>
                                            <Text style={[styles.subTitleText, commonStyle.font]}>
                                                {ModelClass.DUITNOW_DATA.dynamicProxyName1}
                                            </Text>
                                        </View>

                                        <View>
                                            <Text
                                                style={[
                                                    styles.subDescriptionText1,
                                                    commonStyle.font,
                                                ]}
                                            >
                                                {Utility.maskFirstPart(
                                                    ModelClass.DUITNOW_DATA.dynamicProxyValue1
                                                )}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: "row", width: "90%" }}>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        styles.subTitleText1,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-start",
                                                            textAlign: "left",
                                                        },
                                                    ]}
                                                >
                                                    Account
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1.8, flexDirection: "column" }}>
                                                <Text
                                                    style={[
                                                        styles.subTitleText2,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-end",
                                                            textAlign: "right",
                                                        },
                                                    ]}
                                                >
                                                    {ModelClass.DUITNOW_DATA.selectedNricAccoutName}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.subTitleText3,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-end",
                                                            textAlign: "right",
                                                        },
                                                    ]}
                                                >
                                                    {Utility.getFormatedAccountNumber(
                                                        ModelClass.DUITNOW_DATA.selectedNricAccoutNo
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : null}

                                {ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 3 ? (
                                    <View
                                        style={{
                                            width: "80%",
                                            borderWidth: 0.4,
                                            borderColor: "#cccccc",
                                            marginTop: 1,
                                            alignSelf: "center",
                                        }}
                                    />
                                ) : null}

                                {ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 3 ||
                                ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 2 ? (
                                    <View
                                        style={{
                                            marginLeft: 50,
                                            marginTop: 10,
                                            flex: 1,
                                            flexDirection: "column",
                                        }}
                                    >
                                        <View style={{ flexDirection: "row" }}>
                                            <Text
                                                style={[
                                                    styles.subTitleText,
                                                    commonStyle.font,
                                                    { marginTop: 10 },
                                                ]}
                                            >
                                                {ModelClass.DUITNOW_DATA.dynamicProxyName2}
                                            </Text>
                                        </View>

                                        <View>
                                            <Text
                                                style={[
                                                    styles.subDescriptionText1,
                                                    commonStyle.font,
                                                ]}
                                            >
                                                {Utility.maskFirstPart(
                                                    ModelClass.DUITNOW_DATA.dynamicProxyValue2
                                                )}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: "row", width: "90%" }}>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={[
                                                        styles.subTitleText1,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-start",
                                                            textAlign: "left",
                                                        },
                                                    ]}
                                                >
                                                    Account
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1.8, flexDirection: "column" }}>
                                                <Text
                                                    style={[
                                                        styles.subTitleText2,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-end",
                                                            textAlign: "right",
                                                        },
                                                    ]}
                                                >
                                                    {
                                                        ModelClass.DUITNOW_DATA
                                                            .selectedMobileAccoutName
                                                    }
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.subTitleText3,
                                                        commonStyle.font,
                                                        {
                                                            alignSelf: "flex-end",
                                                            textAlign: "right",
                                                        },
                                                    ]}
                                                >
                                                    {Utility.getFormatedAccountNumber(
                                                        ModelClass.DUITNOW_DATA
                                                            .selectedMobileAccoutNo
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : null}

                                {this.state.errorPassword === true ? (
                                    <ErrorMessage
                                        onClose={() => {
                                            this.setState({ errorPassword: false });
                                            // CustomFlashMessage.showContentSaveMessageLong(
                                            //     "DuitNow inquiry failed",
                                            //     "",
                                            //     "bottom",
                                            //     "info",
                                            //     10000,
                                            //     "#dc143c"
                                            // );
                                            NavigationService.navigateToModule(
                                                navigationConstant.DUITNOW_MODULE,
                                                navigationConstant.DUITNOW_REGISTER
                                            );
                                        }}
                                        title={Strings.APP_NAME_ALERTS}
                                        description={this.state.errorMessage}
                                        showOk={true}
                                        onOkPress={() => {
                                            // CustomFlashMessage.showContentSaveMessageLong(
                                            //     "DuitNow inquiry failed",
                                            //     "",
                                            //     "bottom",
                                            //     "info",
                                            //     10000,
                                            //     "#dc143c"
                                            // );
                                            NavigationService.navigateToModule(
                                                navigationConstant.DUITNOW_MODULE,
                                                navigationConstant.DUITNOW_REGISTER
                                            );
                                            this.setState({ errorPassword: false });
                                        }}
                                    />
                                ) : null}
                                <View style={[Styles.backToButtonView]}>
                                    <SetupNow
                                        isBigIcon={true}
                                        text={Strings.DONE}
                                        url={require("@assets/icons/ic_yellow_tick.png")}
                                        onPress={async () => {
                                            this.onConfirmClick(client);
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </ApolloConsumer>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    titleContainer: { marginTop: 30, marginLeft: 50, justifyContent: "flex-start" },
    titleText: {
        fontFamily: "Montserrat",
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    descriptionContainer: {
        marginTop: 5,
        marginLeft: 50,
        width: 280,
        justifyContent: "flex-start",
    },
    descriptionText: {
        fontFamily: "Montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "#000000",
    },
    subDescriptionText: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.4,
        color: "#000000",
        marginLeft: 30,
    },
    subDescriptionText1: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.4,
        color: "#000000",
    },
    subTitleText: {
        fontFamily: "Montserrat",
        fontSize: 17,
        fontWeight: "500",
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: 0,
        color: "#000000",
    },
    subTitleText1: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: 0,
    },
    subTitleText2: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "500",
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: 0,
        color: "#000000",
    },
    subTitleText3: {
        fontFamily: "Montserrat",
        fontSize: 15,
        fontWeight: "100",
        fontStyle: "normal",
        lineHeight: 24,
        letterSpacing: 0,
        color: "#000000",
    },
    imageContainer: { marginTop: 20, justifyContent: "center", alignItems: "center" },
    imageText: { color: "#000000", fontWeight: "400", fontSize: 20 },
    setupContainer: { marginLeft: 30, marginTop: 30 },
    bgContainer: { width: "100%", marginTop: 10, marginBottom: 1, backgroundColor: "blue" },
    bg: {
        marginLeft: 50,
        marginRight: 10,
        marginTop: 10,
        width: "90%",
        height: "90%",
    },
    dateView1: {
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 40,
        marginLeft: 0,
        flex: 1.5,
    },
    dateViewInnerBig: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        width: 260,
    },
});

export default DuitNowAck;

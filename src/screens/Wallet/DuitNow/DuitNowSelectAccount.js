import React, { Component } from "react";
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
    StyleSheet,
} from "react-native";
import {
    AvatarCircle,
    ButtonRound,
    ImageButtonCustom,
    SetupNow,
    MyView,
    Input,
    HeaderPageIndicator,
    ErrorMessage,
    DropDownButtonCenter,
    DropdownSelection,
} from "@components/Common";
import commonStyle from "@styles/main";
import Styles from "@styles/Wallet/WalletScreen";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";

import Permissions from "react-native-permissions";
import DuitnowList from "@components/Others/DuitnowList";
import { Register } from "./Start/Register";
import { Welcome } from "./Start/Welcome";
import * as Utility from "@utils/dataModel/utility";
import { duitnowRegister } from "@services/index";
import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";

class DuitNowSelectAccount extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
            error: false,
            errorMessage: "",
            currentScreen: 1,
            nricAccount: "Select an account",
            mobileAccount: "Select an account",
            nricDropDownView: false,
            mobileDropDownView: false,
            nricList: ModelClass.DUITNOW_DATA.nricAccounts,
            mobileList: ModelClass.DUITNOW_DATA.mobileAccounts,
        };
    }
    componentDidMount() {
        this.setState({
            nricList: ModelClass.DUITNOW_DATA.nricAccounts,
            mobileList: ModelClass.DUITNOW_DATA.mobileAccounts,
        });
    }

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
    }

    _duitnowRegisterApi = async () => {
        let request = {};
        let registrationRequests = [];
        let count = 0;

        if (this.state.nricAccount !== "Select an account") {
            let object = {};
            object.accHolderName = ModelClass.DUITNOW_DATA.cusName;
            object.accHolderType = "S";
            object.accName = ModelClass.DUITNOW_DATA.selectedNricAccoutName;
            object.accNo = ModelClass.DUITNOW_DATA.selectedNricAccoutNo;
            object.accType = ModelClass.DUITNOW_DATA.selectedNricAccoutType;
            object.proxyIdNo = ModelClass.DUITNOW_DATA.dynamicProxyValue1;
            object.proxyIdType = ModelClass.DUITNOW_DATA.dynamicProxyType1;
            object.regRefNo = "";
            object.regStatus = "";
            registrationRequests.push(object);
            count = count + 1;
        }

        if (this.state.mobileAccount !== "Select an account") {
            let object = {};
            object.accHolderName = ModelClass.DUITNOW_DATA.cusName;
            object.accHolderType = "S";
            object.accName = ModelClass.DUITNOW_DATA.selectedMobileAccoutName;
            object.accNo = ModelClass.DUITNOW_DATA.selectedMobileAccoutNo;
            object.accType = ModelClass.DUITNOW_DATA.selectedMobileAccoutType;
            object.proxyIdNo = ModelClass.DUITNOW_DATA.dynamicProxyValue2;
            object.proxyIdType = ModelClass.DUITNOW_DATA.dynamicProxyType2;
            object.regRefNo = "";
            object.regStatus = "";
            registrationRequests.push(object);
            count = count + 1;
        }

        request.pan = "";
        request.actionForceExpire = "000";
        request.noOfTrx = count;
        request.proxyBankCode = "MBBEMYKL";
        request.registrationRequests = registrationRequests;
        request.secondaryId = ModelClass.DUITNOW_DATA.secondaryId;
        request.secondaryIdType = ModelClass.DUITNOW_DATA.secondaryIdType;
        request.service = "register";
        request.tac = "";

        await duitnowRegister("/duitnow/register", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                if (regObject !== null && regObject.code === 200) {
                    if (regObject.message === "Success") {
                        ModelClass.DUITNOW_DATA.success = true;
                        ModelClass.DUITNOW_DATA.partiallySuccess = false;
                    } else {
                        ModelClass.DUITNOW_DATA.success = true;
                        ModelClass.DUITNOW_DATA.partiallySuccess = true;
                        for (let item in regObject.result.duitnowResponseList) {
                            if (regObject.result.duitnowResponseList[item].status === false) {
                                ModelClass.DUITNOW_DATA.message =
                                    regObject.result.duitnowResponseList[item].esbErrorValue;
                            }
                        }
                    }
                } else {
                    try {
                        for (let item in regObject.result.duitnowResponseList) {
                            if (regObject.result.duitnowResponseList[item].status === false) {
                                ModelClass.DUITNOW_DATA.message =
                                    regObject.result.duitnowResponseList[item].esbErrorValue;
                            }
                        }
                    } catch (err) {
                        ModelClass.DUITNOW_DATA.message = "server error";
                    }
                    ModelClass.DUITNOW_DATA.success = false;
                }
            })
            .catch((err) => {
                console.log("ERR", err);
                ModelClass.DUITNOW_DATA.message = "server error.";
                ModelClass.DUITNOW_DATA.success = false;
            });

        NavigationService.navigateToModule(
            navigationConstant.DUITNOW_MODULE,
            navigationConstant.DUITNOW_ACKNOWLEDGE
        );
    };

    render() {
        return (
            <View style={[commonStyle.childContainer, commonStyle.blueBackgroundColor]}>
                <HeaderPageIndicator
                    showBack={ModelClass.DUITNOW_DATA.showBack}
                    showClose={true}
                    showIndicator={false}
                    showTitle={false}
                    showTitleCenter={false}
                    showBackIndicator={false}
                    pageTitle={""}
                    numberOfPages={2}
                    currentPage={this.state.currentScreen}
                    navigation={this.props.navigation}
                    moduleName={navigationConstant.DUITNOW_MODULE}
                    routeName={navigationConstant.DUITNOW_REGISTER}
                    testID={"header"}
                    accessibilityLabel={"header"}
                    noPop={true}
                    onBackPress={() => {
                        //todo revert back api
                        if (this.state.currentScreen > 1) {
                            this.setState({ currentScreen: this.state.currentScreen - 1 });
                        } else {
                            this.props.navigation.pop();
                        }
                    }}
                />

                {this.state.currentScreen === 1 ? (
                    <View style={styles.container}>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.titleText, commonStyle.font]}>DuitNow</Text>
                            </View>
                            <View style={styles.descriptionContainer}>
                                <Text style={[styles.descriptionText, commonStyle.font]}>
                                    Select an account to pair for DuitNow
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                marginLeft: 50,
                                marginTop: 2,
                            }}
                        >
                            {ModelClass.DUITNOW_DATA.dynamicAccountSelection === 3 ||
                            ModelClass.DUITNOW_DATA.dynamicAccountSelection === 1 ? (
                                <View style={{ marginTop: 20, flex: 1, flexDirection: "column" }}>
                                    <View style={{ flexDirection: "row" }}>
                                        {this.state.nricAccount === "Select an account" ? (
                                            <Image
                                                accessible={true}
                                                testID={"imgWalNext"}
                                                accessibilityLabel={"imgWalNext"}
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    marginRight: 10,
                                                    marginTop: 3,
                                                }}
                                                source={require("@assets/icons/ic_din_uncheck.png")}
                                            />
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.setState({
                                                        nricAccount: "Select an account",
                                                    });
                                                }}
                                            >
                                                <Image
                                                    accessible={true}
                                                    testID={"imgWalNext"}
                                                    accessibilityLabel={"imgWalNext"}
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        marginRight: 10,
                                                        marginTop: 3,
                                                    }}
                                                    source={require("@assets/icons/ic_din_check.png")}
                                                />
                                            </TouchableOpacity>
                                        )}
                                        <Text style={[styles.subTitleText, commonStyle.font]}>
                                            {ModelClass.DUITNOW_DATA.dynamicProxyName1}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.subDescriptionText, commonStyle.font]}>
                                            {Utility.maskFirstPart(
                                                ModelClass.DUITNOW_DATA.dynamicProxyValue1
                                            )}
                                        </Text>
                                    </View>
                                    <View>
                                        <View style={styles.dateView1}>
                                            <View style={styles.dateViewInnerBig}>
                                                <View style={commonStyle.roundButtonWithImage}>
                                                    <DropDownButtonCenter
                                                        headerText={
                                                            this.state.nricAccount === null
                                                                ? ""
                                                                : this.state.nricAccount
                                                        }
                                                        iconType={1}
                                                        qrScreen={false}
                                                        isBig={false}
                                                        showDescription={false}
                                                        testID={"dropNric"}
                                                        accessibilityLabel={"dropNric"}
                                                        onPress={() => {
                                                            this.setState({
                                                                nricDropDownView: true,
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : null}

                            {ModelClass.DUITNOW_DATA.dynamicAccountSelection === 3 ||
                            ModelClass.DUITNOW_DATA.dynamicAccountSelection === 2 ? (
                                <View style={{ marginTop: 20, flex: 1.5, flexDirection: "column" }}>
                                    <View style={{ flexDirection: "row" }}>
                                        {this.state.mobileAccount === "Select an account" ? (
                                            <Image
                                                accessible={true}
                                                testID={"imgWalNext"}
                                                accessibilityLabel={"imgWalNext"}
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    marginRight: 10,
                                                    marginTop: 3,
                                                }}
                                                source={require("@assets/icons/ic_din_uncheck.png")}
                                            />
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.setState({
                                                        mobileAccount: "Select an account",
                                                    });
                                                }}
                                            >
                                                <Image
                                                    accessible={true}
                                                    testID={"imgWalNext"}
                                                    accessibilityLabel={"imgWalNext"}
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        marginRight: 10,
                                                        marginTop: 3,
                                                    }}
                                                    source={require("@assets/icons/ic_din_check.png")}
                                                />
                                            </TouchableOpacity>
                                        )}
                                        <Text style={[styles.subTitleText, commonStyle.font]}>
                                            {ModelClass.DUITNOW_DATA.dynamicProxyName2}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.subDescriptionText, commonStyle.font]}>
                                            {Utility.maskFirstPart(
                                                ModelClass.DUITNOW_DATA.dynamicProxyValue2
                                            )}
                                        </Text>
                                    </View>
                                    <View>
                                        <View style={styles.dateView1}>
                                            <View style={styles.dateViewInnerBig}>
                                                <View style={commonStyle.roundButtonWithImage}>
                                                    <DropDownButtonCenter
                                                        headerText={
                                                            this.state.mobileAccount === null
                                                                ? ""
                                                                : this.state.mobileAccount
                                                        }
                                                        iconType={1}
                                                        qrScreen={false}
                                                        isBig={false}
                                                        showDescription={false}
                                                        testID={"dropMobile"}
                                                        accessibilityLabel={"dropMobile"}
                                                        onPress={() => {
                                                            this.setState({
                                                                mobileDropDownView: true,
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}

                {this.state.currentScreen === 1 ? (
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
                                onPress={() => {
                                    if (
                                        this.state.mobileAccount === "Select an account" &&
                                        this.state.nricAccount === "Select an account"
                                    ) {
                                        this.setState({
                                            error: true,
                                            errorMessage:
                                                "Please add at least one Account to proceed",
                                        });
                                    } else {
                                        if (
                                            this.state.mobileAccount !== "Select an account" &&
                                            this.state.nricAccount !== "Select an account"
                                        ) {
                                            ModelClass.DUITNOW_DATA.dynamicAccountDisplay = 3;
                                        } else if (this.state.nricAccount !== "Select an account") {
                                            ModelClass.DUITNOW_DATA.dynamicAccountDisplay = 1;
                                        } else {
                                            ModelClass.DUITNOW_DATA.dynamicAccountDisplay = 2;
                                        }
                                        this.setState({ currentScreen: 2 });
                                    }
                                }}
                            >
                                <Image
                                    accessible={true}
                                    testID={"imgWalNext"}
                                    accessibilityLabel={"imgWalNext"}
                                    style={{
                                        height: 70,
                                        width: 70,
                                    }}
                                    source={require("@assets/icons/ic_next_white.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {this.state.currentScreen === 2 ? (
                    <View style={styles.container}>
                        <View style={styles.block}>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.titleText, commonStyle.font]}>DuitNow</Text>
                            </View>
                            <View style={styles.descriptionContainer}>
                                <Text style={[styles.descriptionText, commonStyle.font]}>
                                    Please confirm your account details
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginLeft: 50, marginTop: 20, marginBottom: 10 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    ModelClass.PDF_DATA.file =
                                        "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/NAD_TNC.pdf";
                                    ModelClass.PDF_DATA.share = false;
                                    ModelClass.PDF_DATA.type = "url";
                                    ModelClass.PDF_DATA.route =
                                        navigationConstant.DUITNOW_SELECT_ACCOUNT;
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

                        {ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 3 ||
                        ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 1 ? (
                            <View
                                style={{
                                    marginLeft: 50,
                                    marginTop: 20,
                                    flex: 0.4,
                                    flexDirection: "column",
                                }}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={[styles.subTitleText, commonStyle.font]}>
                                        {ModelClass.DUITNOW_DATA.dynamicProxyName1}
                                    </Text>
                                </View>

                                <View>
                                    <Text style={[styles.subDescriptionText1, commonStyle.font]}>
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
                                                { alignSelf: "flex-start", textAlign: "left" },
                                            ]}
                                        >
                                            Account
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: "column" }}>
                                        <Text
                                            style={[
                                                styles.subTitleText2,
                                                commonStyle.font,
                                                { alignSelf: "flex-end", textAlign: "right" },
                                            ]}
                                        >
                                            {ModelClass.DUITNOW_DATA.selectedNricAccoutName}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.subTitleText3,
                                                commonStyle.font,
                                                { alignSelf: "flex-end", textAlign: "right" },
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
                                    borderWidth: 0.6,
                                    borderColor: "#cccccc",
                                    marginTop: 1,
                                    alignSelf: "center",
                                }}
                            ></View>
                        ) : null}

                        {ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 3 ||
                        ModelClass.DUITNOW_DATA.dynamicAccountDisplay === 2 ? (
                            <View
                                style={{
                                    marginLeft: 50,
                                    marginTop: 20,
                                    flex: 0.4,
                                    flexDirection: "column",
                                }}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={[styles.subTitleText, commonStyle.font]}>
                                        {ModelClass.DUITNOW_DATA.dynamicProxyName2}
                                    </Text>
                                </View>

                                <View>
                                    <Text style={[styles.subDescriptionText1, commonStyle.font]}>
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
                                                { alignSelf: "flex-start", textAlign: "left" },
                                            ]}
                                        >
                                            Account
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: "column" }}>
                                        <Text
                                            style={[
                                                styles.subTitleText2,
                                                commonStyle.font,
                                                { alignSelf: "flex-end", textAlign: "right" },
                                            ]}
                                        >
                                            {ModelClass.DUITNOW_DATA.selectedMobileAccoutName}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.subTitleText3,
                                                commonStyle.font,
                                                { alignSelf: "flex-end", textAlign: "right" },
                                            ]}
                                        >
                                            {Utility.getFormatedAccountNumber(
                                                ModelClass.DUITNOW_DATA.selectedMobileAccoutNo
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                {this.state.currentScreen === 2 ? (
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
                                onPress={() => {
                                    if (ModelClass.DUITNOW_DATA.edit === true) {
                                        NavigationService.navigateToModule(
                                            navigationConstant.DUITNOW_MODULE,
                                            navigationConstant.DUITNOW_NUMBER_VALIDATE
                                        );
                                    } else {
                                        this._duitnowRegisterApi();
                                    }
                                }}
                            >
                                <Image
                                    accessible={true}
                                    testID={"imgWalNext"}
                                    accessibilityLabel={"imgWalNext"}
                                    style={{
                                        height: 70,
                                        width: 70,
                                    }}
                                    source={require("@assets/icons/ic_done_click.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {this.state.error === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                ) : null}

                <DropdownSelection
                    accessible={true}
                    testID={"dropNric"}
                    accessibilityLabel={"dropNric"}
                    ref={(dn) => (this.dropdownNric = dn)}
                    displayLoader={this.state.nricDropDownView}
                    data={this.state.nricList}
                    keyName="account"
                    qrScreen={true}
                    unmask={true}
                    onItemPress={async (val, index) => {
                        console.log("Val1", val);
                    }}
                    onItemClick={async (val, index) => {
                        console.log("DN Val " + index, val);
                        for (let item in this.state.nricList) {
                            this.state.nricList[item].select = false;
                            this.state.nricList[item].primary = false;
                        }
                        this.state.nricList[index].select = true;
                        this.state.nricList[index].primary = true;
                        ModelClass.DUITNOW_DATA.selectedNricAccoutName = val.title;
                        ModelClass.DUITNOW_DATA.selectedNricAccoutType = val.type;
                        ModelClass.DUITNOW_DATA.selectedNricAccoutNo = val.description;
                        this.setState({ nricDropDownView: false, nricAccount: val.title });
                    }}
                />

                <DropdownSelection
                    accessible={true}
                    testID={"dropMobile"}
                    accessibilityLabel={"dropMobile"}
                    ref={(dm) => (this.dropdownMobile = dm)}
                    displayLoader={this.state.mobileDropDownView}
                    data={this.state.mobileList}
                    keyName="account"
                    qrScreen={true}
                    unmask={true}
                    onItemPress={async (val, index) => {
                        console.log("Val1", val);
                    }}
                    onItemClick={async (val, index) => {
                        console.log("DM Val " + index, val);
                        for (let item in this.state.mobileList) {
                            this.state.mobileList[item].select = false;
                            this.state.mobileList[item].primary = false;
                        }
                        this.state.mobileList[index].select = true;
                        this.state.mobileList[index].primary = true;
                        ModelClass.DUITNOW_DATA.selectedMobileAccoutName = val.title;
                        ModelClass.DUITNOW_DATA.selectedMobileAccoutType = val.type;
                        ModelClass.DUITNOW_DATA.selectedMobileAccoutNo = val.description;
                        this.setState({ mobileDropDownView: false, mobileAccount: val.title });
                    }}
                />
            </View>
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

export default DuitNowSelectAccount;

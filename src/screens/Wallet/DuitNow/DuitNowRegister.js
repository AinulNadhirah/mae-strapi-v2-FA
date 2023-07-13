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
    Linking,
    Platform,
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
} from "@components/Common";
import commonStyle from "@styles/main";
import Styles from "@styles/Wallet/WalletScreen";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Permissions from "react-native-permissions";
import DuitnowList from "@components/Others/DuitnowList";
import FlashMessage from "react-native-flash-message";
import call from "react-native-phone-call";

class DuitNowRegister extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
            error: false,
            remove: false,
            removeItem: {},
            disable: false,
            disableItem: {},
            switchBank: false,
            switchBankItem: {},
            bankSuspend: false,
            maybankNumber: "1300886688",
            rand: 0,
            invalid: false,
            noAcc: false,
        };
    }
    componentDidMount() {}

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
        this.focusSubscription();
        this.blurSubscription();
    }

    async componentWillMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            //this.forceUpdate();
            this.setState({ rand: Math.random() + 100 });
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {
            this.setState({
                rand: 0,
            });
        });
    }

    async removeDuitNow() {
        ModelClass.DUITNOW_DATA.partiallySuccess = false;
        ModelClass.DUITNOW_DATA.otpCondition = 2;
        NavigationService.navigateToModule(
            navigationConstant.DUITNOW_MODULE,
            navigationConstant.DUITNOW_NUMBER_VALIDATE
        );
    }

    async disableDuitNow() {
        ModelClass.DUITNOW_DATA.partiallySuccess = false;
        ModelClass.DUITNOW_DATA.otpCondition = 3;
        NavigationService.navigateToModule(
            navigationConstant.DUITNOW_MODULE,
            navigationConstant.DUITNOW_NUMBER_VALIDATE
        );
    }

    async switchBankDuitNow() {
        ModelClass.DUITNOW_DATA.partiallySuccess = false;
        ModelClass.DUITNOW_DATA.otpCondition = 4;
        NavigationService.navigateToModule(
            navigationConstant.DUITNOW_MODULE,
            navigationConstant.DUITNOW_SELECT_ACCOUNT
        );
    }

    render() {
        return (
            <View style={[commonStyle.childContainer, commonStyle.whiteBackgroundColor]}>
                <View style={{ backgroundColor: "#ffdd00", width: "100%" }}>
                    <HeaderPageIndicator
                        showBack={true}
                        showClose={false}
                        showIndicator={false}
                        showTitle={true}
                        showTitleCenter={true}
                        showBackIndicator={false}
                        pageTitle={"Wallet"}
                        numberOfPages={1}
                        currentPage={1}
                        navigation={this.props.navigation}
                        moduleName={navigationConstant.HOME_DASHBOARD}
                        routeName={navigationConstant.HOME_DASHBOARD}
                        testID={"header"}
                        accessibilityLabel={"header"}
                        noPop={true}
                        onBackPress={() => {
                            ModelClass.DUITNOW_DATA.duitNowData = [];
                            NavigationService.resetAndNavigateToModule(
                                navigationConstant.SETTINGS_MODULE,
                                navigationConstant.SETTINGS_HOME
                            );
                        }}
                    />
                </View>
                <View
                    style={{
                        width: "100%",
                        height: 80,
                        backgroundColor: "#f8f5f3",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        alignContent: "flex-start",
                    }}
                >
                    <Text
                        style={[
                            { color: "#000000", fontWeight: "400", fontSize: 20, marginLeft: 50 },
                            commonStyle.font,
                        ]}
                        accessible={true}
                        testID={"txtLoyaltyRewards"}
                        accessibilityLabel={"txtLoyaltyRewards"}
                    >
                        DuitNow
                    </Text>
                </View>

                {ModelClass.DUITNOW_DATA.registered ? (
                    <View style={{ flex: 1, flexDirection: "column" }}>
                        <View
                            style={{
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                alignContent: "flex-start",
                                marginBottom: 20,
                            }}
                        >
                            <DuitnowList
                                showAdd={ModelClass.DUITNOW_DATA.showAdd}
                                data={ModelClass.DUITNOW_DATA.duitNowData}
                                removeCall={(item) => {
                                    ModelClass.DUITNOW_DATA.modifyItem = item;
                                    ModelClass.DUITNOW_DATA.edit = false;
                                    this.setState({ remove: true, removeItem: item });
                                }}
                                editCall={(item) => {
                                    ModelClass.DUITNOW_DATA.showBack = true;
                                    ModelClass.DUITNOW_DATA.modifyItem = item;
                                    ModelClass.DUITNOW_DATA.dynamicAccountSelection = 1;
                                    ModelClass.DUITNOW_DATA.dynamicProxyName1 = item.idType;
                                    ModelClass.DUITNOW_DATA.dynamicProxyValue1 = item.source;
                                    ModelClass.DUITNOW_DATA.otpCondition = 5;
                                    ModelClass.DUITNOW_DATA.edit = true;
                                    console.log(ModelClass.DUITNOW_DATA.mobileAccounts);
                                    NavigationService.navigateToModule(
                                        navigationConstant.DUITNOW_MODULE,
                                        navigationConstant.DUITNOW_SELECT_ACCOUNT
                                    );
                                }}
                                switchCall={(item) => {
                                    ModelClass.DUITNOW_DATA.showBack = true;
                                    ModelClass.DUITNOW_DATA.modifyItem = item;
                                    ModelClass.DUITNOW_DATA.dynamicAccountSelection = 1;
                                    ModelClass.DUITNOW_DATA.dynamicProxyName1 = item.idType;
                                    ModelClass.DUITNOW_DATA.dynamicProxyValue1 = item.source;
                                    console.log("switch", JSON.stringify(item));
                                    if (item.status) {
                                        if (item.maybank === true) {
                                            ModelClass.DUITNOW_DATA.edit = false;
                                            this.setState({ disable: true, removeItem: item });
                                        } else {
                                            ModelClass.DUITNOW_DATA.edit = true;
                                            this.setState({
                                                switchBank: true,
                                                switchBankItem: item,
                                            });
                                        }
                                    } else {
                                        if (item.maybank === true) {
                                            if (item.by === "BANK") {
                                                ModelClass.DUITNOW_DATA.edit = false;
                                                this.setState({ bankSuspend: true });
                                            } else {
                                                ModelClass.DUITNOW_DATA.edit = false;
                                                ModelClass.DUITNOW_DATA.otpCondition = 1;
                                                NavigationService.navigateToModule(
                                                    navigationConstant.DUITNOW_MODULE,
                                                    navigationConstant.DUITNOW_NUMBER_VALIDATE
                                                );
                                            }
                                        } else {
                                            this.setState({ invalid: true });
                                        }
                                    }
                                }}
                                addCall={() => {
                                    console.log("ACC", ModelClass.DUITNOW_DATA.nricAccounts);
                                    ModelClass.DUITNOW_DATA.showBack = true;
                                    if (
                                        ModelClass.DUITNOW_DATA.nricAccounts != null &&
                                        ModelClass.DUITNOW_DATA.nricAccounts.length > 0
                                    ) {
                                        if (ModelClass.DUITNOW_DATA.nonRegCount < 2) {
                                            ModelClass.DUITNOW_DATA.dynamicAccountSelection = 1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyName1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyNameAdd1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyValue1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyValueAdd1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyType1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd1;
                                        } else {
                                            ModelClass.DUITNOW_DATA.dynamicAccountSelection = 3;
                                            ModelClass.DUITNOW_DATA.dynamicProxyName1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyNameAdd1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyValue1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyValueAdd1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyType1 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd1;
                                            ModelClass.DUITNOW_DATA.dynamicProxyName2 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyNameAdd2;
                                            ModelClass.DUITNOW_DATA.dynamicProxyValue2 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyValueAdd2;
                                            ModelClass.DUITNOW_DATA.dynamicProxyType2 =
                                                ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd2;
                                        }
                                        ModelClass.DUITNOW_DATA.partiallySuccess = false;
                                        ModelClass.DUITNOW_DATA.edit = false;
                                        NavigationService.navigateToModule(
                                            navigationConstant.DUITNOW_MODULE,
                                            navigationConstant.DUITNOW_SELECT_ACCOUNT
                                        );
                                    } else {
                                        this.setState({ noAcc: true });
                                    }
                                }}
                            />
                        </View>
                    </View>
                ) : (
                    <View
                        style={{
                            height: 40,
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <View
                            style={{
                                height: 40,
                                alignItems: "flex-start",
                                justifyContent: "center",
                                flex: 4,
                            }}
                        >
                            <Text
                                style={[
                                    {
                                        color: "#000000",
                                        marginLeft: 50,
                                        fontWeight: "700",
                                        fontSize: 18,
                                        fontFamily: "montserrat",
                                    },
                                    commonStyle.font,
                                ]}
                            >
                                Register DuitNow
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                ModelClass.DUITNOW_DATA.showBack = false;
                                ModelClass.DUITNOW_DATA.partiallySuccess = false;
                                ModelClass.DUITNOW_DATA.edit = false;
                                console.log("ACC", ModelClass.DUITNOW_DATA.nricAccounts);
                                if (
                                    ModelClass.DUITNOW_DATA.nricAccounts != null &&
                                    ModelClass.DUITNOW_DATA.nricAccounts.length > 0
                                ) {
                                    if (ModelClass.DUITNOW_DATA.nonRegCount < 2) {
                                        ModelClass.DUITNOW_DATA.dynamicAccountSelection = 1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyName1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyNameAdd1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyValue1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyValueAdd1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyType1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd1;
                                    } else {
                                        ModelClass.DUITNOW_DATA.dynamicAccountSelection = 3;
                                        ModelClass.DUITNOW_DATA.dynamicProxyName1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyNameAdd1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyValue1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyValueAdd1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyType1 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd1;
                                        ModelClass.DUITNOW_DATA.dynamicProxyName2 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyNameAdd2;
                                        ModelClass.DUITNOW_DATA.dynamicProxyValue2 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyValueAdd2;
                                        ModelClass.DUITNOW_DATA.dynamicProxyType2 =
                                            ModelClass.DUITNOW_DATA.dynamicProxyTypeAdd2;
                                    }
                                    NavigationService.navigateToModule(
                                        navigationConstant.DUITNOW_MODULE,
                                        navigationConstant.DUITNOW_INTRO
                                    );
                                } else {
                                    this.setState({ noAcc: true });
                                }
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flex: 1,
                                    marginRight: 10,
                                }}
                            >
                                <Image
                                    accessible={true}
                                    testID={"imgWalAddMay"}
                                    accessibilityLabel={"imgWalAddMay"}
                                    style={{
                                        height: 40,
                                        width: 40,
                                    }}
                                    source={require("@assets/icons/ic_add_white.png")}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {this.state.remove === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ remove: false });
                        }}
                        title={"Remove DuitNow"}
                        description={"Are you sure you want to permanently remove DuitNow"}
                        showYesNo={true}
                        showyesText={"Yes"}
                        showNoText={"No"}
                        onYesPress={() => {
                            this.removeDuitNow();
                            this.setState({ remove: false });
                        }}
                        onNoPress={() => {
                            this.setState({ remove: false });
                        }}
                    />
                ) : null}

                {this.state.disable === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ disable: false });
                        }}
                        title={"Disable DuitNow"}
                        description={
                            "You can choose to temporarily disable or permanently remove DuitNow"
                        }
                        showYesNo={true}
                        showyesText={"Yes"}
                        showNoText={"No"}
                        onYesPress={() => {
                            this.disableDuitNow();
                            this.setState({ disable: false });
                        }}
                        onNoPress={() => {
                            this.setState({ disable: false });
                        }}
                    />
                ) : null}

                {this.state.bankSuspend === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ bankSuspend: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"Your DuitNow ID is suspended by bank"}
                        showYesNo={true}
                        showyesText={"Contact bank"}
                        showNoText={"Ok"}
                        onNoPress={() => {
                            this.setState({ bankSuspend: false });
                        }}
                        onYesPress={() => {
                            this.setState({ bankSuspend: false });
                            Utility.contactBankcall(this.state.maybankNumber);
                        }}
                    />
                ) : null}

                {this.state.switchBank === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ switchBank: false });
                        }}
                        title={"Switch bank"}
                        description={"Your DuitNow is tied to another bank account, are you sure?"}
                        showYesNo={true}
                        showyesText={"Switch to Maybank"}
                        showNoText={"No"}
                        onYesPress={() => {
                            this.switchBankDuitNow();
                            this.setState({ switchBank: false });
                        }}
                        onNoPress={() => {
                            this.setState({ switchBank: false });
                        }}
                    />
                ) : null}

                {this.state.error === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"Please go to mobile settings and enable camera"}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                ) : null}

                {this.state.invalid === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ invalid: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"Suspended DuitNow ID, Please contact bank"}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ invalid: false });
                        }}
                    />
                ) : null}

                {this.state.noAcc === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ noAcc: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"No valid accounts"}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ noAcc: false });
                        }}
                    />
                ) : null}
                <FlashMessage />
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
});

export default DuitNowRegister;

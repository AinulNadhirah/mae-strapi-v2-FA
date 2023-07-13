import moment from "moment";
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Image,
} from "react-native";
import FlashMessage from "react-native-flash-message";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductCardBig from "@components/Cards/ProductCardBig";
import {
    PinInput,
    VirtualKeyboard,
    ErrorMessage,
    HighlightAmount,
    HeaderPageIndicator,
} from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import ApiManager, { METHOD_GET, TIMEOUT, METHOD_POST, METHOD_PUT } from "@services/ApiManager";
import { pfmPutData, pfmPostData } from "@services/index";

import { TOKEN_TYPE_M2U } from "@constants/api";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";
import { PFM_ENDPOINT_V1 } from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import commonStyle from "@styles/main";

const width = Dimensions.get("window").width;

class CashWalletEditScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        // expenseData: this.props.route.params.data
        amount: "000",
        lengthError: false,
        showKeyboard: true,
        accountNumber: this.props.route.params.accountNumber,
        btsId: this.props.route.params.btsId,
        gcif: this.props.route.params.gcif,
        // mode: this.props.route.params.mode,
        // balance: this.props.route.params.balance
    };

    componentDidMount = async () => {
        // if (this.props.amount != null) {
        // 	this._virtualKeyboard.setValue(this.state.amount);
        // }
    };

    componentWillUnmount() {
        // this.focusSubscription();
        // this.blurSubscription();
    }

    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    _onConfirmPressed = () => {
        //TODO: call API

        this.props.navigation.goBack();
    };

    changeText(val) {
        let amt = val.replace(/^0+/, "");

        if (amt.length === 0) {
            this.setState({ amount: "000" });
        } else {
            if (parseInt(amt) > 0) {
                this.setState({ amount: amt });
            } else {
                this.setState({ amount: "000" });
            }
        }

        if (parseInt(val) > 0) {
            this._virtualKeyboard.setValue(val);
        } else {
            this._virtualKeyboard.setValue("");
        }
    }

    doneClick = async () => {
        const { mode, balance } = this.props.route.params;
        const { amount } = this.state;

        console.log("doneClick with amount: ", amount);

        if (amount) {
            let val = Utility.formateAmountZero(amount);

            if (val > 0.0 && val <= 999999.99) {
                if (mode == "add") {
                    // call add cash wallet API
                    const result = await this._addCashWallet(val);
                    const {
                        navigation: { goBack },
                        route,
                    } = this.props;
                    const onGoBackToAddEditTxnScreen =
                        route.params?.onGoBackToAddEditTxnScreen ?? function () {};
                    onGoBackToAddEditTxnScreen(result);
                    if (result) {
                        goBack();
                    }
                } else if (mode == "edit") {
                    // call update cash wallet API
                    this._updateCashWallet(val, balance);
                }
            } else {
                this.setState({ lengthError: true });
            }
        }
    };

    _addCashWallet = async (amount) => {
        const subUrl = "/pfm/cashWallet/add";
        const body = {
            initialBalance: Number(amount),
        };
        console.log("/pfm/cashWallet/add ==> ");
        try {
            const {
                data: { result },
            } = await ApiManager.service({
                url: PFM_ENDPOINT_V1 + subUrl,
                data: body,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: false,
            });
            console.log("Result > ", result);
            if (result != null) {
                console.log(result);
                this.setState({ responseData: result, refresh: !this.state.refresh });

                this.props.route.params.onGoBack(null, true);
                this.props.navigation.goBack();
                return true;
            } else {
                this.setState({
                    responseData: null,
                    refresh: !this.state.refresh,
                    error: true,
                });

                // TODO: show error message
                showErrorToast({
                    message: "Unable to create cash wallet.\nPlease try again.",
                });
                return false;
            }
        } catch (err) {
            console.log("ERR > ", err);
            showErrorToast({ message: err.message });
            return false;
        }
    };

    _updateCashWallet = (amount, initialAmount) => {
        const { btsId } = this.state;

        const subUrl = "/pfm/cashWallet/update";
        const body = {
            btsId: btsId,
            balance: Number(amount),
            initialBalance: Number(initialAmount),
        };

        pfmPutData(subUrl, body, true)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/cashWallet/update ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({ responseData: result, refresh: !this.state.refresh });

                    const {
                        navigation: { goBack },
                        route,
                    } = this.props;
                    const onGoBack = route.params?.onGoBack ?? function () {};
                    onGoBack(result, true);
                    goBack();
                } else {
                    this.setState({
                        responseData: null,
                        refresh: !this.state.refresh,
                        error: true,
                    });

                    // TODO: show error message
                    showErrorToast({
                        message: "Unable to update cash balance.\nPlease try again.",
                    });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _updateCashWallet ERROR: ", Error);
            });
    };

    render() {
        const { mode } = this.props.route.params;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color">
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea={true}
                            header={
                                <HeaderLayout
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={19}
                                            text="Cash"
                                        />
                                    }
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                <ScrollView style={styles.container}>
                                    <View>
                                        <View style={styles.contentContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight={"600"}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={
                                                    mode == "edit"
                                                        ? "Edit Cash"
                                                        : mode == "add" && "Starting Balance"
                                                }
                                            />

                                            <View style={{ marginTop: 8, marginBottom: 32 }}>
                                                <Typo
                                                    fontSize={20}
                                                    fontWeight={"300"}
                                                    lineHeight={28}
                                                    textAlign="left"
                                                    text="How much cash do you have on hand?"
                                                />
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <Text
                                                    style={{
                                                        color: "#cfcfcf",
                                                        fontWeight: "600",
                                                        fontSize: 20,
                                                        marginRight: 4,
                                                    }}
                                                    accessible={true}
                                                    testID={"txtByClickingNext"}
                                                    accessibilityLabel={"txtByClickingNext"}
                                                >
                                                    {Strings.CURRENCY_CODE + " "}
                                                </Text>
                                                <HighlightAmount
                                                    highlightStyle={{
                                                        color: "#000000",
                                                        fontWeight: "800",
                                                        fontSize: 20,
                                                    }}
                                                    searchWords={[this.state.amount.toString()]}
                                                    style={[
                                                        { marginLeft: 0 },
                                                        {
                                                            color: "#000000",
                                                            fontWeight: "800",
                                                            fontSize: 20,
                                                        },
                                                        commonStyle.font,
                                                    ]}
                                                    textToHighlight={this.state.amount.toString()}
                                                    testID={"inputAmount"}
                                                    accessibilityLabel={"inputAmount"}
                                                />
                                            </View>

                                            <View style={styles.underline} />
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={styles.bottomContainer}>
                                    <ActionButton
                                        componentCenter={
                                            <Typo fontSize={14} fontWeight={"600"} lineHeight={18}>
                                                <Text>Confirm</Text>
                                            </Typo>
                                        }
                                        width={width - 48}
                                        backgroundColor={YELLOW}
                                        onPress={this._onConfirmPressed}
                                    />
                                </View>
                            </React.Fragment>
                        </ScreenLayout>

                        {/* Virtual keyboard */}
                        {this.state.showKeyboard && (
                            <VirtualKeyboard
                                ref={(vk) => (this._virtualKeyboard = vk)}
                                color="black"
                                pressMode="string"
                                decimal={true}
                                validate={true}
                                onPress={(val) => this.changeText(val)}
                                onDonePress={this.doneClick}
                                size={8}
                            />
                        )}

                        {/* Error message - length */}
                        {this.state.lengthError == true && (
                            <ErrorMessage
                                onClose={() => {
                                    this.setState({ lengthError: false });
                                }}
                                title="Alert"
                                description="Please enter valid Amount"
                                showOk={true}
                                onOkPress={() => {
                                    this.setState({ lengthError: false });
                                }}
                            />
                        )}

                        {/* START: Top menu view */}
                        {this.state.showMenu && (
                            <TopMenu
                                onClose={() => {
                                    this.setState({ showMenu: false });
                                }}
                                navigation={this.props.navigation}
                                menuArray={this.menuArray}
                                onItemPress={(obj) => this._handleTopMenuItemPress(obj)}
                            />
                        )}
                        {/* END: Top menu view */}

                        {this.state.error && <FlashMessage />}
                    </React.Fragment>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default CashWalletEditScreen;

const styles = StyleSheet.create({
    bottomContainer: {
        alignItems: "center",
        bottom: 36,
        left: 0,
        position: "absolute",
        right: 0,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        marginHorizontal: 36,
        paddingTop: 16,
    },
    inputContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 50,
        width: "100%",
    },
    underline: {
        backgroundColor: BLACK,
        height: 1,
        width: "100%",
    },
});

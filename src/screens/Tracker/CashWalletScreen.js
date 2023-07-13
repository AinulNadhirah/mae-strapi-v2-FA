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

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ProductCardBig from "@components/Cards/ProductCardBig";
import { ErrorMessageV2 } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { pfmGetData, pfmGetDataMaya, pfmDeleteData } from "@services";

import { YELLOW, WHITE } from "@constants/colors";

const width = Dimensions.get("window").width;

class CashWalletScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        // expenseData: this.props.route.params.expenseData
        showMenu: false,
        showRemoveConfirm: false,
        showSnackbar: false,
        walletData: this.props.route.params.data,
    };

    menuArray = [
        {
            menuLabel: "Edit Cash",
            menuParam: "edit",
        },
        {
            menuLabel: "Remove Cash",
            menuParam: "remove",
        },
    ];

    componentDidMount = async () => {
        // await this._fetchCashBalance();
    };

    // _fetchCashBalance = async () => {
    // 	let subUrl = "/totalBalance/cashBalance";

    // 	pfmGetData(subUrl, true)
    // 		.then(async response => {
    // 			const result = response.data.result;
    // 			console.log("/totalBalance/cashBalance ==> ");
    // 			if (result != null) {
    // 				console.log(result);
    // 				this.setState({ cashBalanceData: result, refresh: !this.state.refresh });
    // 			} else {
    // 				this.setState({ cashBalanceData: null, refresh: !this.state.refresh });
    // 			}
    // 		})
    // 		.catch(Error => {
    // 			console.log("pfmGetData _fetchCashBalance ERROR: ", Error);
    // 		});
    // };

    _onBackPress = (removeWalletSuccess) => {
        this.props.route.params.onGoBack(removeWalletSuccess);
        this.props.navigation.goBack();
    };

    _onViewTransactionDetailsPressed = () => {
        this.props.navigation.navigate(navigationConstant.TOTAL_BALANCE_TRANSACTIONS_SCREEN, {
            data: null,
            mode: "cashWallet",
        });
    };

    _onGoBack = (data, success) => {
        console.log("_onGoBack", data, success);
        const { walletData } = this.state;

        // refresh data
        var walletDataNew = walletData;
        walletDataNew.balance = data.balance;

        this.setState({ walletData: walletDataNew, showSnackbar: true });

        // show success/fail message
        if (success) {
            showSuccessToast({ message: "Cash balance edited successfully." });
        }
    };

    _handleTopMenuItemPress = (param) => {
        const { walletData } = this.state;

        if (param == "edit") {
            this.setState({ showMenu: false });
            this.props.navigation.navigate(navigationConstant.CASH_WALLET_EDIT_SCREEN, {
                accountNumber: walletData.accountNumber,
                btsId: walletData.btsId,
                gcif: walletData.gcif,
                mode: "edit",
                onGoBack: this._onGoBack,
                balance: walletData.balance,
            });
        } else if (param == "remove") {
            console.log("[_handleTopMenuItemPress] remove");
            this.setState({ showMenu: false });
            setTimeout(() => this.setState({ showRemoveConfirm: true }), 0);
        }
    };

    _onAddManualTransactionButtonPressed = () =>
        this.props.navigation.navigate("AddOrEditTransactionScreen", {
            addEditTransactionCallback: this._handleAddEditTransactionResult,
            editingMode: "add",
            isCashWalletTransaction: true,
        });

    _onRemoveCashWallet = () => {
        this.setState({ showRemoveConfirm: false });
        //TODO: Remove cash balance API call

        const { walletData } = this.state;
        const btsId = walletData.btsId;

        let param = "?btsId=" + btsId;
        let subUrl = "/pfm/cashWallet/delete" + param;
        let body = null;

        pfmDeleteData(subUrl, body, true)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/cashWallet/delete ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({ responseData: result });

                    // go back and refresh data in previous screen
                    this._onBackPress(true);
                } else {
                    this.setState({ responseData: null, error: true, showSnackbar: true });

                    showErrorToast({ message: "Unable to remove cash wallet.\nPlease try again." });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _onRemoveCashWallet ERROR: ", Error);
                showErrorToast({ message: "Unable to remove cash wallet.\nPlease try again." });
            });
    };

    _handleAddEditTransactionResult = (isSuccessful) => {
        // if (isSuccessful) CustomFlashMessage.showTxnSuccessMessage();
        // else CustomFlashMessage.showTxnErrorMessage();
    };

    _onCloseMenu = () => {
        this.setState({ showMenu: false });
    };

    _onDismissRemoveWalletConfirmation = () => {
        this.setState({ showRemoveConfirm: false });
    };

    render() {
        const { walletData, showRemoveConfirm, showMenu } = this.state;
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
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                    headerRightElement={
                                        <HeaderDotDotDotButton
                                            onPress={() => this.setState({ showMenu: true })}
                                        />
                                    }
                                />
                            }
                        >
                            <ScrollView style={styles.container}>
                                <View style={{ alignItems: "center", paddingTop: 16 }}>
                                    {walletData != null ? (
                                        <ProductCardBig
                                            title={"Cash"}
                                            desc={"Available Balance"}
                                            amount={walletData.balance}
                                            isPrimary={false}
                                            image={require("@assets/tracker/cardBackgroundBig.png")}
                                        />
                                    ) : (
                                        <ProductCardBig
                                            title={"Cash"}
                                            desc={"Available Balance"}
                                            amount={0}
                                            isPrimary={false}
                                            image={require("@assets/tracker/cardBackgroundBig.png")}
                                        />
                                    )}

                                    <View style={styles.buttonContainer}>
                                        <ActionButton
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight={"600"}
                                                    lineHeight={18}
                                                >
                                                    <Text>View Transaction Details</Text>
                                                </Typo>
                                            }
                                            width={width - 48}
                                            backgroundColor={WHITE}
                                            borderColor={"#eaeaea"}
                                            borderWidth={1}
                                            borderStyle={"solid"}
                                            onPress={this._onViewTransactionDetailsPressed}
                                        />
                                    </View>

                                    <Typo fontSize={18} fontWeight="bold" lineHeight={32}>
                                        <Text>Cash</Text>
                                    </Typo>

                                    <View style={styles.descContainer}>
                                        <Typo fontSize={12} lineHeight={18}>
                                            <Text>
                                                This space represents your cash's movements. Here's
                                                where you keep track of how much cash you have on
                                                hand and manually record any expenses.
                                            </Text>
                                        </Typo>
                                    </View>

                                    <ActionButton
                                        componentCenter={
                                            <Typo fontSize={14} fontWeight={"600"} lineHeight={18}>
                                                <Text>Add Transaction</Text>
                                            </Typo>
                                        }
                                        width={165}
                                        backgroundColor={YELLOW}
                                        onPress={this._onAddManualTransactionButtonPressed}
                                    />
                                </View>
                            </ScrollView>
                        </ScreenLayout>

                        {/* START: Top menu view */}
                        {showMenu && (
                            <TopMenu
                                onClose={this._onCloseMenu}
                                navigation={this.props.navigation}
                                menuArray={this.menuArray}
                                onItemPress={(obj) => this._handleTopMenuItemPress(obj)}
                            />
                        )}
                        {/* END: Top menu view */}

                        {this.state.showSnackbar && <FlashMessage />}
                    </React.Fragment>
                </ScreenContainer>

                {showRemoveConfirm && (
                    <ErrorMessageV2
                        onClose={this._onDismissRemoveWalletConfirmation}
                        title="Remove Cash"
                        description="Are you sure you want to remove your cash balance?"
                        customParam1="Confirm"
                        onParam1Press={this._onRemoveCashWallet}
                        customParam2="Cancel"
                        onParam2Press={this._onDismissRemoveWalletConfirmation}
                    />
                )}
            </React.Fragment>
        );
    }
}
export default CashWalletScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonContainer: {
        marginTop: 28,
        marginBottom: 30,
    },
    descContainer: {
        width: 280,
        marginBottom: 22,
        marginTop: 8,
    },
});

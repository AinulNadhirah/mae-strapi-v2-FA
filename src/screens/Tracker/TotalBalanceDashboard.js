import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground,
} from "react-native";
import moment from "moment";
import PropTypes from "prop-types";

import { showSuccessToast } from "@components/Toast";
import FlashMessage from "react-native-flash-message";

import { pfmGetData, pfmGetDataMaya, pfmGetDataMayaM2u } from "@services/index";

import * as Strings from "@constants/strings";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductCard from "@components/Cards/ProductCard";
import ProductCardLoader from "@components/Cards/ProductCardLoader";
import FloatingBarButton from "@components/Buttons/FloatingBarButton";
import { ErrorMessageV2 } from "@components/Common";
import ActionButton from "@components/Buttons/ActionButton";
import PfmFilterModal from "@components/Modals/PfmFilterModal";

import * as utility from "@utils/dataModel/utility";

const { width, height } = Dimensions.get("window");

class TotalBalanceDashboard extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };

    state = {
        showInfo: false,
        noAccounts: false,
        showPfmFilterModal: false,
        isAccountsListLoading: true,
        showSnackbar: false,
    };

    componentWillMount() {
        // fetch data
        this._fetchAllData();
    }

    _fetchAllData = async () => {
        console.log("_fetchAllData");
        // Start loading state
        this.setState({
            isAccountsListLoading: true,
            totalBalanceData: null,
            spentSoFar: null,
            accountsList: null,
            cashWallets: null,
            lastPeriodPercent: null,
            showSnackbar: false,
        });

        // API calls
        await this._fetchTotalBalance();
        await this._fetchTotalBalanceLastPeriod();
        // await this._fetchOpeningBalance();
        await this._fetchSpentSoFar();
        await this._fetchAccountsList();
        await this._fetchCashWallets();

        // LOG: Check state
        // console.log("data state: ", this.state);
    };

    _fetchTotalBalance = async () => {
        let subUrl = "/totalBalance";

        pfmGetData(subUrl, true)
            .then(async (response) => {
                const result = response.data.totalBalance;
                console.log("/totalBalance ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ totalBalanceData: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ totalBalanceData: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchTotalBalance ERROR: ", Error);
            });
    };

    _fetchSpentSoFar = async () => {
        let subUrl = "/totalBalance/spentSoFar";

        pfmGetData(subUrl, true)
            .then(async (response) => {
                const result = response.data.result.spentSoFar;
                console.log("/totalBalance/spentSoFar ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({ spentSoFar: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ spentSoFar: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchSpentSoFar ERROR: ", Error);
            });
    };

    _fetchAccountsList = () => {
        let subUrl = "/totalBalance/accountListing";

        pfmGetDataMayaM2u(subUrl, true)
            .then((response) => {
                const result = response.data.result;
                console.log("/totalBalance/accountListing ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({
                        accountsList: result,
                        refresh: !this.state.refresh,
                        isAccountsListLoading: false,
                    });
                } else {
                    this.setState({
                        accountsList: null,
                        refresh: !this.state.refresh,
                        isAccountsListLoading: false,
                    });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchAccountsList ERROR: ", Error);
            });
    };

    _fetchCashWallets = () => {
        let subUrl = "/pfm/cashWallet/all";

        pfmGetData(subUrl, true)
            .then((response) => {
                const result = response.data.cashWalletRs;
                console.log("/pfm/cashWallet/all ==> ");
                if (result != null) {
                    console.log(result);
                    this.setState({ cashWallets: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ cashWallets: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchCashWallets ERROR: ", Error);
            });
    };

    _fetchTotalBalanceLastPeriod = async () => {
        let subUrl = "/totalBalance/lastPeriod";

        pfmGetData(subUrl, false)
            .then(async (response) => {
                const result = response.data.result.lastPeriodResultFormat;
                console.log("/totalBalance/lastPeriod ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ lastPeriodPercent: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ lastPeriodPercent: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchTotalBalanceLastPeriod ERROR: ", Error);
            });
    };

    // _fetchOpeningBalance = async () => {
    // 	let subUrl = "/totalBalance/openingBalance";

    // 	pfmGetData(subUrl, true)
    // 		.then(async response => {
    // 			const result = response.data.result.openingBalance;
    // 			console.log("/totalBalance/openingBalance ==> ");
    // 			// console.log(result);
    // 			if (result != null) {
    // 				console.log(result);

    // 				await this.setState({
    // 					openingBalanceData: result,
    // 					refresh: !this.state.refresh
    // 				});

    // 				this._calculatePercentageChange();
    // 			} else {
    // 				this.setState({ openingBalanceData: null, refresh: !this.state.refresh });
    // 			}
    // 		})
    // 		.catch(Error => {
    // 			console.log("pfmGetData _fetchOpeningBalance ERROR: ", Error);
    // 		});
    // };

    // _togglePfmFilterModal = () => {
    // 	//console.log("togglePfmFilterModal triggered!");
    // 	this.setState({ showPfmFilterModal: !this.state.showPfmFilterModal });
    // };

    // _onAddTxnPressed = () => {
    // 	//console.log("togglePfmFilterModal triggered!");
    // 	this.props.navigation.navigate(navigationConstant.CASH_WALLET_EDIT_SCREEN, {
    // 		mode: "add",
    // 		onGoBack: this._onGoBack
    // 	});
    // };

    _showTxnAddedSuccessfullyModal = () => {
        // CustomFlashMessage.showTxnSuccessMessage();
    };

    _showWalletRemovedSuccessfullyModal = () => {
        console.log("[_showWalletRemovedSuccessfullyModal]");
        showSuccessToast({ message: "Cash balance removed successfully" });
    };

    _onBackPress = () => {
        // console.log("_onBackPress");
        // this.props.navigation.goBack();

        const {
            navigation: { goBack },
            route,
        } = this.props;
        const onGoBack = route.params?.onGoBack ?? function () {};
        onGoBack();
        goBack();
    };

    _onInfoPressed = () => {
        //do something
        this.setState({ showInfo: !this.state.showInfo });
    };

    _onViewTransactionDetailsPressed = () => {
        this.props.navigation.navigate(navigationConstant.TOTAL_BALANCE_TRANSACTIONS_SCREEN, {
            data: null,
            mode: "all",
        });
    };

    _onGoBack = (removeWalletSuccess) => {
        console.log("_onGoBack");

        // refresh data
        this._fetchAllData();

        if (removeWalletSuccess) {
            console.log("_onGoBack: remove wallet show prompt");

            this.setState({ showSnackbar: true });
            this._showWalletRemovedSuccessfullyModal();
        }
    };

    _onProductCardPressed = () => {
        // Redirect to wallet
        NavigationService.navigateToModule(
            navigationConstant.WALLET_MODULE,
            navigationConstant.WALLET_TAB_SCREEN
        );
    };

    _onCreateAccountPressed = () => {
        // Redirect to apply dashboard
        NavigationService.navigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    _openCashWallet = (data) => {
        this.props.navigation.navigate(navigationConstant.CASH_WALLET_SCREEN, {
            data: data,
            onGoBack: this._onGoBack,
        });
    };

    // _calculatePercentageChange = () => {
    // 	const { totalBalanceData, openingBalanceData } = this.state;

    // 	let result = Math.round(((totalBalanceData - openingBalanceData) / openingBalanceData) * 100);

    // 	this.setState({ percentageChange: result });
    // };

    _queryBuilder = async (query) => {
        await this.setState({ query: query });
        console.log("[TotalBalanceDashboard][_queryBuilder]: " + this.state.query);

        // trigger SearchScreen result list reload
        //this.PromotionsTabScreen._loadQuery(this.state.query);
        this.setState({
            accountsList: [],
            refresh: !this.state.refresh,
            additionalQuery: query,
        });

        //call api again
        //this._prepareSearch(0);
    };

    handleTabChange = (index) => {
        this.setState({ activeTabIndex: index });
        console.log(
            "[TotalBalanceDashboard][handleTabChange] activeTabIndex: " + this.state.activeTabIndex
        );
    };

    _handleAddEditTransactionResult = (isSuccessfull) => {
        if (isSuccessfull) {
            // CustomFlashMessage.showTxnSuccessMessage();
            this._fetchAllData();
        }
        // else CustomFlashMessage.showTxnErrorMessage();
    };

    renderEmptyState() {
        return (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View style={{ marginTop: 40, marginBottom: 8 }}>
                    <Typo lineHeight={32} fontSize={18} fontWeight={"bold"}>
                        <Text>No Account Yet</Text>
                    </Typo>
                </View>
                <View style={{ width: 280 }}>
                    <Typo lineHeight={18} fontSize={12}>
                        <Text>
                            View all your Maybank account information here once you sign up for an
                            account with us.
                        </Text>
                    </Typo>
                </View>
                <View
                    style={{
                        marginTop: 30,
                        marginBottom: 30,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActionButton
                        height={48}
                        width={186}
                        backgroundColor={YELLOW}
                        borderRadius={16}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                lineHeight={18}
                                color={BLACK}
                            >
                                <Text>Create Account</Text>
                            </Typo>
                        }
                        onPress={this._onCreateAccountPressed}
                    />
                </View>
                <ImageBackground
                    style={{
                        width: width,
                        height: height * 0.4,
                    }}
                    source={require("@assets/icons/Tracker/illustration.png")}
                    imageStyle={{
                        resizeMode: "cover",
                        alignSelf: "flex-end",
                    }}
                />
            </View>
        );
    }

    _convertStringToNumber = (val) => {
        if (val) {
            let num = Number(val.replace(/,/g, ""));
            return num;
        }

        return 0;
    };

    render() {
        const {
            showPfmFilterModal,
            totalBalanceData,
            lastPeriodPercent,
            spentSoFar,
            accountsList,
            cashWallets,
            refresh,
            isAccountsListLoading,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showPfmFilterModal}
                    overlayType="gradient"
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerCenterElement={
                                    <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                        <Text>Total Balance</Text>
                                    </Typo>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                <View style={styles.container}>
                                    {/* Header */}
                                    <View>
                                        <Typo textAlign="left" fontSize={14} lineHeight={18}>
                                            <Text>Your accounts</Text>
                                        </Typo>

                                        <View style={styles.totalBalContentContainer}>
                                            <React.Fragment>
                                                <Typo
                                                    fontSize={24}
                                                    fontWeight="bold"
                                                    textAlign="left"
                                                    lineHeight={32}
                                                    style={{ width: 0.6 * width }}
                                                    numberOfLines={1}
                                                >
                                                    <Text>
                                                        {Math.sign(totalBalanceData) == -1 && "-"}RM{" "}
                                                        {utility.commaAdder(
                                                            Math.abs(totalBalanceData).toFixed(2)
                                                        )}
                                                    </Text>
                                                </Typo>
                                            </React.Fragment>

                                            <View style={styles.totalBalRightContainer}>
                                                <Typo fontSize={10} lineHeight={13}>
                                                    <Text>vs. Last Month</Text>
                                                </Typo>
                                                {lastPeriodPercent != null ? (
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                        // color={
                                                        // 	Math.sign(lastPeriodPercent) == -1 ? "#e35d5d" : "#5dbc7d"
                                                        // }
                                                    >
                                                        <Text>{lastPeriodPercent}</Text>
                                                    </Typo>
                                                ) : (
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                    >
                                                        <Text>-</Text>
                                                    </Typo>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View style={styles.divider} />

                                    {/* Spent So Far */}
                                    <View style={styles.spentSoFarContainer}>
                                        <View style={styles.spentSoFarLabelContainer}>
                                            <Typo textAlign="left" fontSize={14} lineHeight={18}>
                                                <Text>Spent so Far</Text>
                                            </Typo>
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                onPress={this._onInfoPressed}
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={require("@assets/icons/Tracker/iconBlackInfo.png")}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="bold"
                                            textAlign="left"
                                            lineHeight={32}
                                        >
                                            <Text>
                                                {Math.sign(spentSoFar) == -1 && "-"}RM{" "}
                                                {utility.commaAdder(
                                                    Math.abs(spentSoFar).toFixed(2)
                                                )}
                                            </Text>
                                        </Typo>
                                    </View>
                                </View>

                                {isAccountsListLoading ? (
                                    <View style={styles.productsListContainer}>
                                        <ProductCardLoader />
                                    </View>
                                ) : (
                                    <React.Fragment>
                                        {/* If no accounts yet, show empty state */}
                                        {accountsList == null || accountsList.length == 0 ? (
                                            this.renderEmptyState()
                                        ) : (
                                            <View style={{ alignItems: "center" }}>
                                                {accountsList != null && accountsList.length != 0 && (
                                                    <FlatList
                                                        data={accountsList}
                                                        extraData={refresh}
                                                        renderItem={({ item }) => (
                                                            <React.Fragment>
                                                                <View
                                                                    style={
                                                                        styles.productsListContainer
                                                                    }
                                                                >
                                                                    <ProductCard
                                                                        title={item.name}
                                                                        desc={utility.formateAccountNumber(
                                                                            item.acctCode.substring(
                                                                                0,
                                                                                12
                                                                            )
                                                                        )}
                                                                        amount={this._convertStringToNumber(
                                                                            item.value
                                                                        )}
                                                                        isPrimary={item.primary}
                                                                        onCardPressed={
                                                                            this
                                                                                ._onProductCardPressed
                                                                        }
                                                                        image={require("@assets/tracker/cardBackground.png")}
                                                                        isMasked={false}
                                                                    />
                                                                </View>
                                                            </React.Fragment>
                                                        )}
                                                        keyExtractor={(item) =>
                                                            item.acctCode.toString()
                                                        }
                                                    />
                                                )}

                                                {cashWallets != null && (
                                                    <FlatList
                                                        data={cashWallets}
                                                        extraData={refresh}
                                                        renderItem={({ item }) => (
                                                            <React.Fragment>
                                                                <View
                                                                    style={
                                                                        styles.productsListContainer
                                                                    }
                                                                >
                                                                    <ProductCard
                                                                        title={"Cash Wallet"}
                                                                        // desc={item.accountNumber}
                                                                        amount={item.balance}
                                                                        onCardPressed={() =>
                                                                            this._openCashWallet(
                                                                                item
                                                                            )
                                                                        }
                                                                        image={require("@assets/tracker/cardBackground.png")}
                                                                    />
                                                                </View>
                                                            </React.Fragment>
                                                        )}
                                                        keyExtractor={(item) =>
                                                            item.accountNumber.toString()
                                                        }
                                                    />
                                                )}

                                                <View style={styles.detailsButtonContainer}>
                                                    <ActionButton
                                                        componentCenter={
                                                            <Typo
                                                                fontSize={14}
                                                                fontWeight={"600"}
                                                                lineHeight={18}
                                                            >
                                                                <Text>
                                                                    View Transaction Details
                                                                </Text>
                                                            </Typo>
                                                        }
                                                        width={width - 48}
                                                        backgroundColor={WHITE}
                                                        borderColor={"#eaeaea"}
                                                        borderWidth={1}
                                                        borderStyle={"solid"}
                                                        onPress={
                                                            this._onViewTransactionDetailsPressed
                                                        }
                                                    />
                                                </View>

                                                <View style={{ height: 100 }} />
                                            </View>
                                        )}
                                    </React.Fragment>
                                )}
                            </ScrollView>

                            {/* Footer */}
                            {/* {!this.state.noAccounts && (
								<View style={styles.footerBar}>
									<FloatingBarButton
										backgroundColor={WHITE}
										componentLeft={
											<TouchableOpacity onPress={this._onAddNewTransactionButtonPressed}>
												<View style={styles.footerLeftButtonContainer}>
													<Image
														style={styles.iconAdd}
														source={require("@assets/icons/icon32BlackAdd.png")}
													/>

													<Typo fontSize={14} lineHeight={14} fontWeight="600">
														<Text>New Transaction</Text>
													</Typo>
												</View>
											</TouchableOpacity>
										}
										componentCenter={<View style={styles.verticalDivider} />}
										componentRight={
											<TouchableOpacity onPress={this._togglePfmFilterModal}>
												<View style={styles.footerRightButtonContainer}>
													<Image
														style={styles.iconFilter}
														source={require("@assets/icons/filter.png")}
													/>

													<Typo fontSize={14} lineHeight={14} fontWeight="600">
														<Text>Filter</Text>
													</Typo>
												</View>
											</TouchableOpacity>
										}
									/>
								</View>
							)} */}

                            {this.state.showInfo && (
                                <ErrorMessageV2
                                    onClose={this._onInfoPressed}
                                    title={"Spent so Far"}
                                    description={
                                        "'Spent so Far' tracks your current spending to date. This includes all your money out from Maybank current accounts, savings accounts, cards (where applicable) and cash."
                                    }
                                />
                            )}

                            {this.state.showSnackbar && <FlashMessage />}
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>

                {/* <PfmFilterModal
					showPfmFilterModal={this.state.showPfmFilterModal}
					togglePfmFilterModal={this._togglePfmFilterModal}
					queryBuilder={this._queryBuilder}
				/> */}
            </React.Fragment>
        );
    }
}
export default TotalBalanceDashboard;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginTop: 14,
    },
    bottomContainer: {
        marginHorizontal: 24,
    },
    totalBalContentContainer: {
        flexDirection: "row",
        height: 34,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-end",
    },
    totalBalRightContainer: {
        height: 34,
        width: 80,
        flexDirection: "column",
        alignItems: "center",
    },
    spentSoFarLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    spentSoFarContainer: {
        marginBottom: 44,
    },
    detailsButtonContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: 8,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#eaeaea",
        marginVertical: 24,
    },
    dividerBottom: {
        width: "100%",
        height: 1,
        backgroundColor: "#eaeaea",
        marginVertical: 24,
    },
    verticalDivider: {
        width: 1,
        height: "100%",
        backgroundColor: "#eaeaea",
    },
    infoIcon: {
        width: 16,
        height: 16,
        marginLeft: 2,
    },
    footerBar: {
        position: "absolute",
        bottom: 30,
        left: 46,
        right: 46,
        height: 40,
    },
    iconAdd: {
        width: 16,
        height: 16,
        marginRight: 6,
    },
    iconFilter: {
        width: 38,
        height: 38,
        marginRight: -2,
    },
    footerLeftButtonContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    footerRightButtonContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
    },
    productsListContainer: {
        marginHorizontal: 24,
    },
});

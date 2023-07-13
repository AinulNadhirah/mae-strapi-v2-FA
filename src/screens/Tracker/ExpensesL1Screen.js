/**
 * TODO
 *
 * Please look into converting this component without nesting Flatlist
 * within a scrollview. If you do not need refresh data on scroll end support,
 * you can drop flat list and wrap inside normal view.
 */
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";
import { ScrollView, FlatList } from "react-native-gesture-handler";

import * as navigationConstant from "@navigation/navigationConstant";

import Fade from "@components/Animations/Fade";
import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import FloatingBarButton from "@components/Buttons/FloatingBarButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import {
    errorToastProp,
    showErrorToast,
    showSuccessToast,
    successToastProp,
} from "@components/Toast";

import { withModelContext } from "@context";

import { pfmGetData, invokeL2Challenge } from "@services";
import { FAExpensesScreen } from "@services/analytics/analyticsExpenses";

import { BLACK, WHITE, RED, YELLOW, MEDIUM_GREY } from "@constants/colors";

import assets from "@assets";

import PieChartWidget from "../Tracker/Widgets/PieChartWidget";

export const { width, height } = Dimensions.get("window");

class ExpensesL1Screen extends Component {
    static propTypes = {
        activeTabIndex: PropTypes.number.isRequired,
        currentMonth: PropTypes.any.isRequired,
        filterParam: PropTypes.any.isRequired,
        hideInfo: PropTypes.func,
        index: PropTypes.number.isRequired,
        navigation: PropTypes.object.isRequired,
        renderPfmFilterModal: PropTypes.func,
        selectedCategoryTab: PropTypes.string.isRequired,
        showInfo: PropTypes.func,
        togglePfmFilterModal: PropTypes.any,
        getModel: PropTypes.func,
    };

    state = {
        selectedCategoryTab: this.props.selectedCategoryTab,
        renderCurrentTab: false,
        categoryData: null,
        countryData: null,
        latestTransactionsData: null,
        merchantData: null,
        onlineData: null,
        onlineDataTxnCount: 0,
        refresh: false,
        currentMonth: this.props.currentMonth,
        amountAvg: "-",
        amountSum: "-",
        index: this.props.index,
        showInitialBalanceSetupPrompt: false,
        filterParam: this.props.filterParam,
        alreadyAnimated: false,
    };

    componentDidMount() {
        const { activeTabIndex, index } = this.props;
        const { categoryData, latestTransactionsData, countryData, merchantData, onlineData } =
            this.state;
        const isCurrentActiveTab = activeTabIndex === index;
        const isScreenHydrated =
            categoryData && latestTransactionsData && countryData && merchantData && onlineData;
        if (isCurrentActiveTab && !isScreenHydrated) this.getMonthData();
    }

    componentDidUpdate(nextProps) {
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex != nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex == this.props.index) {
                //render view
                // console.log("trigger render tab: " + nextProps.activeTabIndex);
                // prepareCurrentMonth();
                if (
                    (this.state.categoryData == null &&
                        this.state.latestTransactionsData == null &&
                        this.state.countryData == null) ||
                    this.state.needRefresh
                ) {
                    //if not rendered yet
                    this.getMonthData();

                    if (this.state.needRefresh) {
                        this.setState({ needRefresh: false });
                    }
                }
            }
        }

        if (nextProps.activeTabIndex == this.props.index) {
            if (nextProps.filterParam != this.props.filterParam) {
                setTimeout(() => this.getMonthData(), 0);
            }
        } else {
            if (nextProps.filterParam != this.props.filterParam) {
                this.setState({ needRefresh: true });
            }
        }
    }

    togglePfmFilterModal = () => {
        FAExpensesScreen.filterExpenses(this.state.selectedCategoryTab);
        this.props.togglePfmFilterModal();
    };

    getMonthData = () => {
        // const httpResp = await invokeL3(true);
        // const result = httpResp.data;
        // const { code, message } = result;
        // if (code != 0) return;

        this.setState(
            {
                latestTransactionsData: null,
                categoryData: null,
                amountAvg: "-",
                amountSum: "-",
                countryData: null,
                merchantData: null,
                onlineData: null,
                latestLoaded: false,
                countryLoaded: false,
                categoryLoaded: false,
                merchantLoaded: false,
                onlineLoaded: false,
                alreadyAnimated: false,
            },
            async () => {
                const { currentMonth, selectedCategoryTab } = this.state;

                const { getModel } = this.props;
                const isL2ChallengeNeeded = await invokeL2Challenge(getModel);
                if (isL2ChallengeNeeded) {
                    this.props.navigation.goBack();
                    return;
                }

                await this._fetchTransactionHistory(currentMonth);
                await this._fetchSpendingByCategory(currentMonth);
                await this._fetchSpendingByCountry(currentMonth);
                await this._fetchSpendingByMerchant(currentMonth);
                await this._fetchSpendingByOnline(currentMonth);

                this.setState({ renderCurrentTab: true });
                this.props.renderPfmFilterModal();

                // Analytics - Log default tab upon screen mounted
                FAExpensesScreen.onScreen(selectedCategoryTab);
            }
        );
    };

    tabScrollToCorrectIndex() {
        try {
            const { selectedCategoryTab } = this.state;
            var index = 0;
            var vp = 0;

            if (selectedCategoryTab === "Merchants") {
                index = 2;
                vp = 0.5;
            } else if (selectedCategoryTab === "Online") {
                index = 3;
                vp = 0.5;
            } else if (selectedCategoryTab === "Countries") {
                index = 4;
                vp = 0.5;
            }

            // scroll to index
            setTimeout(() => {
                this?.tabRef?.scrollToIndex?.({ index: index, animated: true, viewPosition: vp });
            }, 0);
        } catch (error) {
            console.log("scrollToIndex error:", error);
        }
    }

    _fetchSpendingByCategory = async (month) => {
        const { refresh } = this.state;
        const { filterParam } = this.props;

        let subUrl = "/pfm/creditCard/category/spendingPattern";
        let param = "?month=" + month + "01" + filterParam;

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/category/spendingPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState(
                        {
                            categoryData: result.spendingPatterns,
                            amountAvg: result.amountAvg,
                            amountSum: result.amountSum,
                            refresh: !refresh,
                            categoryLoaded: true,
                            filterParam,
                        },
                        () => {
                            setTimeout(() => {
                                this.setState({ alreadyAnimated: true });

                                if (
                                    this.state.latestTransactionsData &&
                                    this.state.latestTransactionsData.length
                                ) {
                                    this.tabScrollToCorrectIndex();
                                }
                            }, 300);
                        }
                    );
                    //console.log(this.state);
                } else {
                    this.setState({
                        categoryData: null,
                        refresh: !refresh,
                        categoryLoaded: true,
                        alreadyAnimated: false,
                    });
                    showErrorToast({
                        message:
                            "Your request could not be processed at this time. Please try again later.",
                    });
                }
            })
            .catch((Error) => {
                console.log("1 - Error, navigating to dashboard");
                this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _fetchSpendingByCountry = async (month) => {
        const { refresh } = this.state;
        const { filterParam } = this.props;

        let subUrl = "/pfm/creditCard/country/spendingPattern";
        let param = "?month=" + month + "01" + filterParam;

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/country/spendingPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        countryData: result.spendingPatterns,
                        refresh: !refresh,
                        countryLoaded: true,
                    });
                } else {
                    this.setState({ countryData: null, refresh: !refresh, countryLoaded: true });
                    showErrorToast(
                        errorToastProp({
                            message:
                                "Your request could not be processed at this time. Please try again later.",
                        })
                    );
                }
            })
            .catch((Error) => {
                // console.log("2 - Error, navigating to dashboard");
                // this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _fetchTransactionHistory = (month) => {
        const { refresh } = this.state;
        const { filterParam } = this.props;

        let subUrl = "/pfm/creditCard/transaction/history";
        // let param = "?month=" + month + "01";

        let startDate = month + "01";
        var endDate = "";

        if (moment(startDate).isSame(new Date(), "month")) {
            endDate = moment().format("YYYYMMDD");
        } else {
            endDate = moment(startDate).add(1, "months").subtract(1, "days").format("YYYYMMDD");
        }

        console.log("calculate last date of month: ", endDate);

        let param = "?startDate=" + startDate + "&endDate=" + endDate + filterParam;

        pfmGetData(subUrl + param, false)
            .then((response) => {
                const result = response.data;
                console.log("/pfm/creditCard/transaction/history ==> ");
                console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        latestTransactionsData: result.historyItemList,
                        refresh: !refresh,
                        latestLoaded: true,
                    });
                    console.log(this.state);
                } else {
                    this.setState({
                        latestTransactionsData: null,
                        refresh: !refresh,
                        latestLoaded: true,
                    });
                    showErrorToast(
                        errorToastProp({
                            message:
                                "Your request could not be processed at this time. Please try again later.",
                        })
                    );
                }
            })
            .catch((Error) => {
                // console.log("3 - Error, navigating to dashboard");
                // this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _fetchSpendingByMerchant = async (month) => {
        const { refresh } = this.state;
        const { filterParam } = this.props;

        let subUrl = "/pfm/merchant/spendingPattern";
        let param = "?month=" + month + "01" + filterParam;

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/merchant/spendintPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        merchantData: result.spendingPatterns,
                        refresh: !refresh,
                        merchantLoaded: true,
                    });
                    //console.log(this.state);
                } else {
                    this.setState({ merchantData: null, refresh: !refresh, merchantLoaded: true });
                    showErrorToast(
                        errorToastProp({
                            message:
                                "Your request could not be processed at this time. Please try again later.",
                        })
                    );
                }
            })
            .catch((Error) => {
                // console.log("4 - Error, navigating to dashboard");
                // this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _fetchSpendingByOnline = async (month) => {
        const { refresh } = this.state;
        const { filterParam } = this.props;

        let subUrl = "/pfm/expenses/online";
        let param = "?date=" + month + "01" + filterParam;

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/expenses/online ==> ", result);
                if (result != null) {
                    const txnCount = result.reduce((r, d) => r + d.totalCountOnline, 0);

                    this.setState({
                        onlineData: result,
                        refresh: !refresh,
                        onlineLoaded: true,
                        onlineDataTxnCount: txnCount,
                    });
                    //console.log(this.state);
                } else {
                    this.setState({
                        onlineData: null,
                        onlineDataTxnCount: 0,
                        refresh: !refresh,
                        onlineLoaded: true,
                    });
                    showErrorToast({
                        message:
                            "Your request could not be processed at this time. Please try again later.",
                    });
                }
            })
            .catch((Error) => {
                // console.log("4 - Error, navigating to dashboard");
                // this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData ERROR: ", Error);
            });
    };

    _onExpenseMerchantItemPressed = (merchantID, merchantName) => {
        FAExpensesScreen.selectCategoryItem("Merchant", merchantName);
        this.props.navigation.navigate("trackerModule", {
            screen: navigationConstant.EXPENSES_L2_SCREEN,
            params: {
                mode: "merchant",
                month: this.state.currentMonth,
                merchantID,
                title: merchantName,
                filterParam: this.props.filterParam,
                deleteTransactionCallback: this._handleDeleteTransactionResult,
                screenToPop: 3,
                refreshCallBack: this.getMonthData,
            },
        });
    };

    _onExpenseCategoryItemPressed = (categoryID, categoryName, from) => {
        const fromCarousell = from === "carousellItem" ? true : false;
        FAExpensesScreen.selectCategoryItem(
            fromCarousell ? this.state.selectedCategoryTab : "Categories",
            categoryName
        );

        this.props.navigation.navigate("trackerModule", {
            screen: navigationConstant.EXPENSES_L2_SCREEN,
            params: {
                mode: "categoryL1",
                month: this.state.currentMonth,
                categoryID,
                title: categoryName,
                filterParam: this.props.filterParam,
                deleteTransactionCallback: this._handleDeleteTransactionResult,
                screenToPop: 3,
                refreshCallBack: this.getMonthData,
            },
        });
    };

    _onExpenseOnlineItemPressed = (data, categoryName, classificationId) => {
        console.tron.log("[_onExpenseOnlineItemPressed] classificationId:", classificationId);
        FAExpensesScreen.selectCategoryItem("Online", categoryName);
        this.props.navigation.navigate("trackerModule", {
            screen: navigationConstant.EXPENSES_L2_SCREEN,
            params: {
                mode: "onlineL1",
                month: this.state.currentMonth,
                data,
                classificationId,
                title: categoryName,
                filterParam: this.props.filterParam,
                deleteTransactionCallback: this._handleDeleteTransactionResult,
                screenToPop: 3,
                refreshCallBack: this.getMonthData,
            },
        });
    };

    _onExpenseCountryItemPressed = (countryCode, countryName) => {
        FAExpensesScreen.selectCategoryItem("Country", countryName);
        this.props.navigation.navigate("trackerModule", {
            screen: navigationConstant.EXPENSES_L2_SCREEN,
            params: {
                mode: "country",
                month: this.state.currentMonth,
                countryCode,
                countryName,
                filterParam: this.props.filterParam,
                deleteTransactionCallback: this._handleDeleteTransactionResult,
                screenToPop: 3,
                refreshCallBack: this.getMonthData,
                categoryL1Name: countryName,
                title: countryName,
            },
        });
    };

    _onExpenseItemPressed = (item) => {
        FAExpensesScreen.onItemPressed();

        this.props.navigation.navigate("trackerModule", {
            screen: navigationConstant.EXPENSE_DETAIL_SCREEN,
            params: {
                expenseData: item,
                deleteTransactionCallback: this._handleDeleteTransactionResult,
                screenToPop: 1,
                refreshCallBack: this.getMonthData,
            },
        });
    };

    _onTabBarItemPressed = (item) => {
        this.setState({ selectedCategoryTab: item }, () => {
            this.tabScrollToCorrectIndex();

            FAExpensesScreen.onScreen(item);

            this.props.onGetCurrentTab(item);
        });
    };

    _showInfo = (title) => {
        this.props.showInfo(title);
    };

    _hideInfo = () => {
        this.props.hideInfo();
    };

    _keyExtractorBtsID = (item) => {
        return item.btsId.toString();
    };

    renderFooter() {
        let autoScroll = true;
        return (
            <SpaceFiller height={1} width={autoScroll ? Dimensions.get("window").width / 2 : 24} />
        );
    }

    renderTabBarItem = ({ item, index }) => {
        return (
            <View style={styles.categoryContainer}>
                {item === this.state.selectedCategoryTab ? (
                    <ActionButton
                        height={34}
                        width={96}
                        backgroundColor={BLACK}
                        borderRadius={16}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={-0.08}
                                lineHeight={15}
                                color={WHITE}
                                text={item}
                            />
                        }
                        onPress={() => this._onTabBarItemPressed(item)}
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.unselectedTabBarItem}
                        onPress={() => this._onTabBarItemPressed(item)}
                    >
                        <Typo
                            fontWeight={"600"}
                            textAlign={"center"}
                            fontSize={14}
                            lineHeight={15}
                            color={"#7c7c7d"}
                            text={item}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    renderTabBar() {
        let categories = [];
        if (this.state.countryData !== null && this.state.countryData.length !== 0) {
            categories = ["Latest", "Categories", "Merchants", "Online", "Countries"];
        } else {
            categories = ["Latest", "Categories", "Merchants", "Online"];
        }

        return (
            <FlatList
                data={categories}
                extraData={this.state.refresh}
                getItemLayout={(data, index) => ({ length: 96, offset: 96 * index, index })}
                ListFooterComponent={<View style={styles.tabBarSpacer} />}
                ListHeaderComponent={<View style={styles.tabBarSpacer} />}
                ref={(ref) => {
                    this.tabRef = ref;
                }}
                renderItem={this.renderTabBarItem}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        );
    }

    renderCarouselItem = ({ item, index }) => {
        return (
            <View style={styles.carouselItemContainer}>
                <TouchableOpacity
                    style={styles.containerCategoryItem}
                    onPress={() =>
                        this._onExpenseCategoryItemPressed(item.btsId, item.name, "carousellItem")
                    }
                >
                    <View style={styles.avatarContainer}>
                        <BorderedAvatar backgroundColor={item.colorCode}>
                            <View style={styles.imageContainer}>
                                <Image style={styles.image} source={{ uri: item.imageUrl }} />
                            </View>
                        </BorderedAvatar>
                    </View>
                    <Typo
                        fontWeight={"600"}
                        textAlign={"center"}
                        fontSize={11}
                        lineHeight={14}
                        color={BLACK}
                        text={item.name}
                    />
                    <View style={styles.amountContainer}>
                        <Typo
                            fontWeight={"600"}
                            textAlign={"center"}
                            fontSize={11}
                            lineHeight={14}
                            color={RED}
                            text={`${Math.sign(item.amount) === -1 ? "-" : ""}RM ${numeral(
                                Math.abs(item.amount)
                            ).format("0,0.00")}`}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    renderHorizontalCarousel() {
        return (
            <FlatList
                data={this.state.categoryData}
                // extraData={this.state.refresh}
                renderItem={this.renderCarouselItem}
                keyExtractor={this._keyExtractorBtsID}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={<View style={styles.spacer} />}
                ListFooterComponent={<View style={styles.categoryRightContainer} />}
                style={{ marginBottom: 32 }}
            />
        );
    }

    renderEmptyState() {
        return (
            <View style={styles.emptyStateContainer}>
                <ImageBackground
                    source={assets.dashboardTrackerEmptyBg}
                    // resizeMethod={'auto'}
                    style={styles.imgBackgroundContainer}
                    imageStyle={styles.imgBackgroundStyle}
                />
                <View style={styles.emptyStateContentContainer}>
                    <View style={styles.emptyStateTitleContainer}>
                        <Typo
                            lineHeight={32}
                            fontSize={18}
                            fontWeight={"bold"}
                            text="Hi! Meet your finance BFF"
                        />
                    </View>
                    <View style={styles.emptyStateDescContainer}>
                        <Typo
                            lineHeight={18}
                            fontSize={12}
                            textBreakStrategy="simple"
                            text="We're here to give you a rundown of your expenses with Maybank, be it locally or abroad. You can add cash transactions too."
                        />
                    </View>
                    <View style={styles.emptyStateButtonContainer}>
                        <ActionButton
                            height={48}
                            width={186}
                            backgroundColor={YELLOW}
                            borderRadius={24}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    color={BLACK}
                                    text="Add Now"
                                />
                            }
                            // onPress={() => this.setState({ selectedTab: item })}
                            onPress={this._onAddNewTransactionButtonPressed}
                        />
                    </View>
                </View>
            </View>
        );
    }

    renderNoTransactions() {
        return (
            <View style={styles.noTxnContainer}>
                {this.state.filterParam != "" && (
                    <>
                        <View style={styles.noTxnTitleContainer}>
                            <Typo
                                lineHeight={32}
                                fontSize={18}
                                fontWeight={"bold"}
                                text="No Transactions Found"
                            />
                        </View>
                        <View style={styles.noTxnDescContainer}>
                            <Typo
                                lineHeight={18}
                                fontSize={12}
                                text="Sorry, we couldn't find any transactions based on the filters
                                    you've selected. Try again or clear out the options."
                            />
                        </View>
                    </>
                )}
            </View>
        );
    }

    _onAddNewTransactionButtonPressed = () => {
        FAExpensesScreen.addExpenses(this.state.selectedCategoryTab);

        this.props.navigation.navigate("trackerModule", {
            screen: "AddOrEditTransactionScreen",
            params: {
                addEditTransactionCallback: this._handleAddEditTransactionResult,
                editingMode: "add",
                isCashWalletTransaction: true,
            },
        });
    };

    _handleAddEditTransactionResult = (isSuccessful) => isSuccessful && this.getMonthData();

    _handleDeleteTransactionResult = (isSuccessful) => {
        if (isSuccessful) {
            showSuccessToast(
                successToastProp({
                    message: "You've successfully deleted an expense from your list.",
                })
            );
            FAExpensesScreen.logDeleteSuccess();

            this.getMonthData();
        } else {
            showErrorToast(
                errorToastProp({
                    message: "Your expense could not be deleted at this time. Please try again.",
                })
            );
        }
    };

    getIconColor = (item) => {
        if (item.btsMerchant != null) {
            return item.btsMerchant.colorCode;
        } else if (item.btsCategory != null) {
            return item.btsCategory.colorCode;
        } else if (item.btsSubCategory != null) {
            return item.btsSubCategory.colorCode;
        } else {
            return "#ffffff";
        }
    };

    getIconImage = (item) => {
        if (item.btsMerchant && item.btsMerchant?.image) return item.btsMerchant.image;
        else if (item.btsSubCategory && item.btsSubCategory?.image)
            return item.btsSubCategory.image;
        else return item.btsCategory?.image ?? "";
    };

    renderCategoryTabItem = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <TrackerListItem
                    title={item.name}
                    desc={
                        item.transCount > 1
                            ? item.transCount + " Transactions"
                            : item.transCount + " Transaction"
                    }
                    amount={item.amount}
                    points={item.pointsEarned}
                    iconBgColor={item.colorCode}
                    iconImgUrl={{ uri: item.imageUrl }}
                    onListItemPressed={() =>
                        this._onExpenseCategoryItemPressed(item.btsId, item.name, "categoryTab")
                    }
                    mode={"categories"}
                    iconPadded={false}
                />
            </View>
        );
    };

    renderTabCategories() {
        return (
            <View>
                {this.state.categoryData !== null && this.state.categoryData.length !== 0 ? (
                    <React.Fragment>
                        <FlatList
                            data={this.state.categoryData}
                            extraData={this.state.refresh}
                            renderItem={this.renderCategoryTabItem}
                            keyExtractor={this._keyExtractorBtsID}
                            style={styles.flatListWithTopPadding}
                        />
                        <View style={styles.tabSpacer} />
                    </React.Fragment>
                ) : (
                    this.renderNoTransactions()
                )}
            </View>
        );
    }

    renderCountryTabItem = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <TrackerListItem
                    title={item.name}
                    amount={item.amount}
                    desc={
                        item.transCount > 1
                            ? item.transCount + " Transactions"
                            : item.transCount + " Transaction"
                    }
                    points={item.pointsEarned}
                    iconBgColor={item.colorCode !== null ? item.colorCode : "#FFFFFF"}
                    iconImgUrl={{ uri: item.imageUrl }}
                    onListItemPressed={() =>
                        this._onExpenseCountryItemPressed(item.code, item.name)
                    }
                    mode={"categories"}
                    iconPadded={false}
                />
            </View>
        );
    };

    renderTabCountries() {
        return (
            <View>
                {this.state.countryLoaded && (
                    <React.Fragment>
                        {this.state.countryData !== null && this.state.countryData.length !== 0 ? (
                            <React.Fragment>
                                <FlatList
                                    data={this.state.countryData}
                                    extraData={this.state.refresh}
                                    renderItem={this.renderCountryTabItem}
                                    keyExtractor={(item) => item.code.toString()}
                                    style={styles.flatListWithTopPadding}
                                />
                                <View style={styles.tabSpacer} />
                            </React.Fragment>
                        ) : (
                            this.renderNoTransactions()
                        )}
                    </React.Fragment>
                )}
            </View>
        );
    }

    renderTabOnline() {
        const { onlineLoaded, onlineData, onlineDataTxnCount, refresh } = this.state;

        return (
            <View>
                {onlineLoaded && onlineData && onlineData.length ? (
                    <>
                        <FlatList
                            data={onlineData}
                            extraData={refresh}
                            renderItem={this.renderOnlineTabItem}
                            keyExtractor={this._keyExtractorBtsID}
                            style={styles.flatListWithTopPadding}
                        />
                        <View style={styles.onlineTabFooterContainer}>
                            {onlineDataTxnCount === 0 && (
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    text="Pay subscriptions and shop online with Maybank. Track them with ease here!"
                                />
                            )}
                            <View style={styles.tabSpacer} />
                        </View>
                    </>
                ) : (
                    this.renderNoTransactions()
                )}
            </View>
        );
    }

    renderOnlineTabItem = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <TrackerListItem
                    title={item.name}
                    desc={
                        item.totalCountOnline > 1
                            ? item.totalCountOnline + " Transactions"
                            : item.totalCountOnline + " Transaction"
                    }
                    amount={item.totalAmountOnline}
                    points={item.pointsEarned}
                    iconBgColor={item.colorCode}
                    iconImgUrl={{ uri: item.imageUrl }}
                    onListItemPressed={() => {
                        if (item.totalCountOnline !== 0)
                            this._onExpenseOnlineItemPressed(
                                item.onlineSpendingList,
                                item.name,
                                item.btsId
                            );
                    }}
                    mode={"categories"}
                    iconPadded={false}
                />
            </View>
        );
    };

    _getTitle = (item) => {
        if (item.btsProductTypeCode === "CASH_WALLET") {
            return "CASH";
        } else {
            if (item.description) {
                return item.description.trim();
            } else {
                return "-";
            }
        }
    };

    renderLatestTransactionItem = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <TrackerListItem
                    title={this._getTitle(item)}
                    desc={item.btsSubCategory !== null && item.btsSubCategory.name}
                    amount={item.amount}
                    // points={item.pointsEarned}
                    iconBgColor={this.getIconColor(item)}
                    iconImgUrl={{ uri: this.getIconImage(item) }}
                    onListItemPressed={() => this._onExpenseItemPressed(item)}
                    iconPadded={false}
                />
            </View>
        );
    };

    _renderLatestTransactions(data, date, index) {
        return (
            <FlatList
                data={data}
                extraData={this.state.refresh}
                renderItem={this.renderLatestTransactionItem}
                listKey={`${date}-${index}`}
                keyExtractor={this._keyExtractorBtsID}
            />
        );
    }

    renderLatestTabItem = ({ item, index }) => {
        return (
            <React.Fragment>
                <TrackerSectionItem
                    date={item.date}
                    dateFormat="YYYY-MM-DD"
                    amount={item.totalAmount}
                />
                {this._renderLatestTransactions(item.historyList, item.date.toString(), index)}
            </React.Fragment>
        );
    };

    renderTabLatest() {
        console.log("renderTabLatest");
        return (
            <View style={styles.tabContainer}>
                {this.state.categoryData !== null &&
                    this.state.categoryData.length !== 0 &&
                    this.renderHorizontalCarousel()}

                {this.state.latestLoaded && (
                    <React.Fragment>
                        {this.state.latestTransactionsData !== null &&
                        this.state.latestTransactionsData.length !== 0 ? (
                            <React.Fragment>
                                <FlatList
                                    data={this.state.latestTransactionsData}
                                    extraData={this.state.refresh}
                                    renderItem={this.renderLatestTabItem}
                                    keyExtractor={(item, index) => `${item.date}-${index}`}
                                    style={styles.flatList}
                                />
                                <View style={styles.tabSpacer} />
                            </React.Fragment>
                        ) : (
                            this.renderNoTransactions()
                        )}
                    </React.Fragment>
                )}
            </View>
        );
    }

    renderMerchantTabItem = ({ item, index }) => {
        return (
            <View style={styles.containerTrackerListItem}>
                <TrackerListItem
                    title={item.name}
                    desc={
                        item.transCount > 1
                            ? item.transCount + " Transactions"
                            : item.transCount + " Transaction"
                    }
                    amount={item.amount}
                    points={item.pointsEarned}
                    iconBgColor={item.colorCode}
                    iconImgUrl={{ uri: item.imageUrl }}
                    onListItemPressed={() =>
                        this._onExpenseMerchantItemPressed(item.btsId, item.name)
                    }
                    mode={"categories"}
                    iconPadded={false}
                />
            </View>
        );
    };

    renderTabMerchants() {
        return (
            <View>
                {this.state.merchantLoaded && (
                    <React.Fragment>
                        {this.state.merchantData != null && this.state.merchantData.length != 0 ? (
                            <React.Fragment>
                                <FlatList
                                    data={this.state.merchantData}
                                    extraData={this.state.refresh}
                                    renderItem={this.renderMerchantTabItem}
                                    keyExtractor={this._keyExtractorBtsID}
                                    style={styles.flatListWithTopPadding}
                                />
                                <View style={styles.tabSpacer} />
                            </React.Fragment>
                        ) : (
                            this.renderNoTransactions()
                        )}
                    </React.Fragment>
                )}
            </View>
        );
    }

    _calculatePercentageValues = () => {
        // var max = 0;

        const { categoryData } = this.state;
        const max = categoryData.reduce((result, { amount }) => result + amount, 0);

        // for (var i = 0; i < this.state.categoryData.length; i++) {
        //     max += this.state.categoryData[i].amount;
        // }

        const valArr = this.state.categoryData.map((d, i) => {
            return Math.round(((100 * d.amount) / max) * 10) / 10;
        });

        return valArr;
    };

    render() {
        const {
            renderCurrentTab,
            selectedCategoryTab,
            categoryData,
            index,
            filterParam,
            latestLoaded,
            categoryLoaded,
            alreadyAnimated,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={!categoryLoaded}
            >
                {renderCurrentTab && latestLoaded && categoryLoaded && (
                    <>
                        {this.state.categoryData != null && this.state.categoryData.length != 0 ? (
                            <ScrollView style={styles.container}>
                                <View style={styles.tabContainer}>
                                    <Fade
                                        alreadyAnimated={alreadyAnimated}
                                        duration={200}
                                        delay={50}
                                        fadeMode="fadeIn"
                                    >
                                        <PieChartWidget
                                            categories={categoryData.map((d, i) => d.name)}
                                            categoryColors={categoryData.map((d, i) => {
                                                return d.colorCode;
                                            })}
                                            categoryIcons={categoryData.map((d, i) => {
                                                if (d.imageUrl != null) {
                                                    return { uri: d.imageUrl };
                                                } else {
                                                    return { uri: "" };
                                                }
                                                // return require("@assets/icons/Tracker/iconEntertaimentWhite.png");
                                            })}
                                            categoryValues={this._calculatePercentageValues()}
                                            chevronKeys={
                                                index === 11
                                                    ? ["Spent So Far", "Daily Average Spending"]
                                                    : [
                                                          "This month's spending",
                                                          "Daily Average Spending",
                                                      ]
                                            }
                                            chevronValues={[
                                                this.state.amountSum,
                                                this.state.amountAvg,
                                            ]}
                                            showInfo={this._showInfo}
                                        />
                                    </Fade>

                                    {this.state.countryLoaded && (
                                        <Fade
                                            alreadyAnimated={alreadyAnimated}
                                            duration={200}
                                            delay={100}
                                            fadeMode="fadeIn"
                                        >
                                            <View style={styles.tabBarContainer}>
                                                {this.renderTabBar()}
                                            </View>
                                        </Fade>
                                    )}

                                    <View style={styles.divider} />

                                    {/* todo: check if there's data or no data */}
                                    {/* {this.renderNoTransactions()} */}

                                    <Fade
                                        alreadyAnimated={alreadyAnimated}
                                        duration={200}
                                        delay={150}
                                        fadeMode="fadeIn"
                                    >
                                        <>
                                            {selectedCategoryTab === "Latest" &&
                                                this.renderTabLatest()}
                                            {selectedCategoryTab === "Categories" &&
                                                this.renderTabCategories()}
                                            {selectedCategoryTab === "Merchants" &&
                                                this.renderTabMerchants()}
                                            {selectedCategoryTab === "Countries" &&
                                                this.renderTabCountries()}
                                            {selectedCategoryTab === "Online" &&
                                                this.renderTabOnline()}
                                        </>
                                    </Fade>
                                </View>
                            </ScrollView>
                        ) : (
                            <Fade
                                alreadyAnimated={alreadyAnimated}
                                duration={200}
                                delay={50}
                                fadeMode="fadeIn"
                            >
                                {this.renderEmptyState()}
                            </Fade>
                        )}
                    </>
                )}

                {/* {this.state.categoryData != null && this.state.categoryData.length != 0 && ( */}
                <View style={styles.footerBar}>
                    <FloatingBarButton
                        backgroundColor={WHITE}
                        componentLeft={
                            <TouchableOpacity
                                style={styles.footerLeftButtonContainer}
                                onPress={this._onAddNewTransactionButtonPressed}
                            >
                                <Image style={styles.iconAdd} source={assets.icon32BlackAdd} />
                                <View style={styles.footerButtonTextContainer}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={14}
                                        fontWeight="600"
                                        text="Add Expense"
                                    />
                                </View>
                            </TouchableOpacity>
                        }
                        componentCenter={<View style={styles.verticalDivider} />}
                        componentRight={
                            <TouchableOpacity onPress={this.togglePfmFilterModal}>
                                <View style={styles.footerRightButtonContainer}>
                                    <Image
                                        style={styles.iconFilter}
                                        source={assets.icFilter}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.footerButtonTextContainer}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={14}
                                            fontWeight="600"
                                            text="Filter"
                                        />
                                    </View>
                                    {filterParam.length > 0 && <View style={styles.redDot} />}
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            </ScreenContainer>
        );
    }
}
export default withModelContext(ExpensesL1Screen);

const styles = StyleSheet.create({
    amountContainer: { marginTop: 2 },
    avatarContainer: { height: 36, marginBottom: 9, width: 36 },
    carouselItemContainer: { marginRight: 12, marginTop: 12, minWidth: 80 },
    categoryContainer: { marginRight: 18 },
    categoryRightContainer: { width: 15 },
    container: {
        flex: 1,
        marginTop: 8,
    },
    containerCategoryItem: { alignItems: "center", justifyContent: "center" },
    containerTrackerListItem: {
        marginHorizontal: 8,
    },
    divider: {
        borderColor: "#eaeaea",
        borderStyle: "solid",
        borderWidth: 0.5,
        height: 0.5,
        marginHorizontal: 24,
        width: width - 48,
    },
    emptyStateButtonContainer: {
        alignItems: "center",
        flex: 1,
        marginBottom: 30,
        marginTop: 30,
    },
    emptyStateContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    emptyStateContentContainer: {
        position: "relative",
        zIndex: 1,
    },
    emptyStateDescContainer: { marginHorizontal: 54 },
    emptyStateTitleContainer: { marginBottom: 8, marginTop: 24 },
    flatList: { backgroundColor: WHITE },
    flatListWithTopPadding: { backgroundColor: WHITE, paddingTop: 10 },
    footerBar: {
        bottom: 30,
        height: 40,
        left: 46,
        position: "absolute",
        right: 46,
        zIndex: 2,
    },
    footerButtonTextContainer: {
        marginTop: 2,
    },
    footerLeftButtonContainer: {
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        marginRight: -8,
    },
    footerRightButtonContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: -8,
    },
    iconAdd: {
        height: 16,
        marginRight: 6,
        width: 16,
    },
    iconFilter: {
        height: 24,
        marginRight: 2,
        width: 24,
    },
    image: {
        height: "100%",
        resizeMode: "contain",
        width: "100%",
    },
    imageContainer: {
        alignItems: "center",
        borderRadius: 22,
        height: 36,
        justifyContent: "center",
        overflow: "hidden",
        width: 36,
    },
    imgBackgroundContainer: {
        bottom: 0,
        height: width * 0.75,
        position: "absolute",
        width: width,
        zIndex: 0,
    },
    imgBackgroundStyle: {
        alignSelf: "flex-end",
        resizeMode: "stretch",
    },
    noTxnContainer: { alignItems: "center", justifyContent: "center" },
    noTxnDescContainer: { width: 280 },
    noTxnTitleContainer: { marginBottom: 8, marginTop: 40 },
    onlineTabFooterContainer: {
        backgroundColor: WHITE,
        paddingHorizontal: 60,
        paddingTop: 32,
    },
    redDot: {
        backgroundColor: "#f80000",
        borderRadius: 4,
        height: 8,
        marginLeft: 8,
        width: 8,
    },
    spacer: { alignContent: "center", height: 75, width: 14 },
    tabBarContainer: { marginBottom: 20 },
    tabBarSpacer: { width: 14 },
    tabContainer: { flex: 1 },
    tabSpacer: { height: 120, width: "100%" },
    unselectedTabBarItem: {
        alignItems: "center",
        height: 34,
        justifyContent: "center",
        width: 96,
    },
    verticalDivider: {
        backgroundColor: "#eaeaea",
        height: "100%",
        width: 1,
    },
});

import { string } from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import Typo from "@components/Text";

import { FAExpensesScreen } from "@services/analytics/analyticsExpenses";
import { pfmGetData } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_EXPENSES_SCREEN } from "@constants/strings";

import CategoryListItem from "./EditTransactionCategoryScreen/CategoryListItem";

class ExpensesL2Screen extends Component {
    state = {
        // expenses: this.props.route.params.expenses
        mode: this.props.route.params.mode,
        month: this.props.route.params.month,
        countryCode: this.props.route.params.countryCode,
        countryName: this.props.route.params.countryName,
        categoryID: this.props.route.params.categoryID,
        merchantID: this.props.route.params.merchantID ?? null,
        title: this.props.route.params.title,
        filterParam: this.props.route.params.filterParam,
        passthrough: this.props.route.params.passthrough,
        data: this.props.route.params.mode !== "merchant" ? this.props.route.params.data : null,
        classificationId: this.props.route.params.classificationId ?? null,
        edited: false,
    };

    componentDidMount = () => {
        this.eventLogViewScreen();
        this._fetchData();
    };

    //logEvent for view_screen event L2 screen
    eventLogViewScreen = () => {
        const screenName =
            this.state.mode === "categoryL2"
                ? FA_EXPENSES_SCREEN +
                  "_" +
                  this.formatTitle(this.props.route.params.categoryL1Name) +
                  "_" +
                  this.formatTitle(this.state.title)
                : FA_EXPENSES_SCREEN + "_" + this.formatTitle(this.state.title);

        if (
            (this.state.mode === "categoryL2" &&
                this.props.route.params.categoryL1Name !== this.state.title) ||
            this.state.mode === "categoryL1" ||
            this.state.mode === "merchant" ||
            this.state.mode === "onlineL1" ||
            this.state.mode === "country"
        ) {
            FAExpensesScreen.onCategoriesScreen(screenName);
        }
    };

    formatTitle = (params) => {
        let formattedTitle = params.replace(/\s/g, "");
        return formattedTitle;
    };

    getIconColor = (item) => {
        if (item.btsMerchant != null) {
            return item.btsMerchant.colorCode;
        } else if (item.btsSubCategory != null) {
            return item.btsSubCategory.colorCode;
        } else if (item.btsCategory != null) {
            return item.btsCategory.colorCode;
        } else {
            return "#ffffff";
        }
    };

    getIconImage = (item) => {
        if (item.btsMerchant != null && item.btsMerchant.image != null) {
            return item.btsMerchant.image;
        } else if (item.btsSubCategory != null && item.btsSubCategory.image != null) {
            return item.btsSubCategory.image;
        } else if (item.btsCategory != null && item.btsCategory.image != null) {
            return item.btsCategory.image;
        }
    };

    _fetchData = () => {
        const { mode, month, countryCode, merchantID, categoryID, classificationId } = this.state;

        console.log("[ExpensesL2] data: ", this.state.data);

        if (mode === "country") {
            this._fetchSpendingByCountryCode(month, countryCode);
        } else if (mode === "merchant") {
            this._fetchSpendingByMerchantID(month, merchantID, classificationId);
        } else if (mode === "categoryL1") {
            // fetch spending pattern by category code
            this._fetchSubCatByCategoryCode(month, categoryID);
        } else if (mode === "categoryL2") {
            this._fetchSubCategoryHistory(month, categoryID);
        }
    };

    _fetchSubCategoryHistory = async (month, categoryID) => {
        let subUrl = "/pfm/creditCard/subCategory/history";
        let param =
            "?month=" + month + "01" + "&subCategory=" + categoryID + this.state.filterParam;
        console.log(param);

        pfmGetData(subUrl + param)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/subCategory/history ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });

                    if (
                        result.historyItemList.length == 1 &&
                        result.historyItemList[0].historyList.length == 1
                    ) {
                        const item = result.historyItemList[0].historyList[0];

                        const {
                            navigation: { navigate },
                            route,
                        } = this.props;
                        navigate(navigationConstant.EXPENSE_DETAIL_SCREEN, {
                            expenseData: item,
                            onGoBack: () => {
                                this.props.navigation.goBack();
                            },
                            deleteTransactionCallback: route.params?.deleteTransactionCallback,
                            screenToPop: route.params?.screenToPop,
                            refreshCallBack: route.params?.refreshCallBack,
                        });
                    }
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchSubCategoryHistory ERROR: ", Error);
            });
    };

    _fetchSubCatByCategoryCode = async (month, categoryID) => {
        let subUrl = "/pfm/creditCard/subCategory/spendingPattern";
        let param =
            "?month=" + month + "01" + "&subCategory=" + categoryID + this.state.filterParam;
        console.log(param);

        pfmGetData(subUrl + param)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/subCategory/spendingPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });

                    if (result.spendingPatternSub.length == 1) {
                        // navigate to that category straight away
                        // this._onExpenseCategoryItemPressed(
                        //     result.spendingPatternSub[0].btsId,
                        //     result.spendingPatternSub[0].name
                        // );

                        const {
                            navigation: { push },
                            route,
                        } = this.props;

                        push(navigationConstant.EXPENSES_L2_SCREEN, {
                            mode: "categoryL2",
                            month: this.state.month,
                            categoryID: result.spendingPatternSub[0].btsId,
                            title: result.spendingPatternSub[0].name,
                            filterParam: this.state.filterParam,
                            onGoBack: (parentCategoryId = this.state.categoryID) =>
                                this._fetchSubCatByCategoryCode(this.state.month, parentCategoryId),
                            deleteTransactionCallback: route.params?.deleteTransactionCallback,
                            screenToPop: route.params?.screenToPop,
                            passthrough: true,
                            refreshCallBack: route.params?.refreshCallBack,
                            categoryL1Name: this.state.title,
                        });
                    }
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchSubcatByCategoryCode ERROR: ", Error);
            });
    };

    _fetchSpendingByCountryCode = async (month, countryCode) => {
        let subUrl = "/pfm/creditCard/countryById/history";
        let param =
            "?month=" + month + "01" + "&countryCode=" + countryCode + this.state.filterParam;
        console.log(param);

        pfmGetData(subUrl + param)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/countryById/history ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchSpendingByCountryCode ERROR: ", Error);
            });
    };

    _fetchSpendingByMerchantID = async (month, merchantID, classificationId) => {
        let subUrl = "/pfm/merchant/history";
        let param = "?date=" + month + "01" + "&merchantId=" + merchantID + this.state.filterParam;
        if (classificationId) {
            param += "&classificationId=" + classificationId;
        }
        console.log(param);

        pfmGetData(subUrl + param)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/merchant/history ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({ data: result, refresh: !this.state.refresh });
                } else {
                    this.setState({ data: null, refresh: !this.state.refresh });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchSpendingByMerchantID ERROR: ", Error);
            });
    };

    _onBackPress = () => {
        const {
            navigation: { goBack, navigate },
            route,
        } = this.props;
        const { mode, passthrough } = this.state;
        if (mode === "categoryL2") {
            if (passthrough) {
                navigate("TabNavigator", {
                    screen: "Expenses",
                });
            } else {
                const onGoBackToCallerScreen = route.params?.onGoBack ?? function () {};
                onGoBackToCallerScreen();
            }
        }
        goBack();
    };

    _onClosePress = () => {
        const {
            navigation: { pop, goBack, navigate },
        } = this.props;
        if (this.state.mode === "categoryL2") {
            console.log("[_onClosePress] categoryL2");
            navigate("TabNavigator", {
                screen: "Expenses",
            });
        } else {
            goBack();
        }
    };

    _onExpenseItemPressed = (item) => {
        const screenName =
            this.state.mode === "categoryL2"
                ? FA_EXPENSES_SCREEN +
                  "_" +
                  this.formatTitle(this.props.route.params.categoryL1Name) +
                  "_" +
                  this.formatTitle(this.state.title)
                : FA_EXPENSES_SCREEN + "_" + this.formatTitle(this.state.title);
        FAExpensesScreen.viewTransaction(screenName);

        const {
            navigation: { navigate },
            route,
        } = this.props;
        navigate(navigationConstant.EXPENSE_DETAIL_SCREEN, {
            expenseData: item,
            onGoBack: (subCategoryId, categoryID) => {
                if (this.state.mode === "categoryL1")
                    this.setState({ categoryID, edited: true }, () => this._fetchData());
                else
                    this.setState({ categoryID: subCategoryId, edited: true }, () =>
                        this._fetchData()
                    );
            },
            deleteTransactionCallback: route.params?.deleteTransactionCallback,
            screenToPop: route.params?.screenToPop,
            refreshCallBack: route.params?.refreshCallBack,
        });
    };

    _onExpenseCategoryItemPressed = (categoryID, categoryName) => {
        console.log("_onExpenseCategoryItemPressed, month: " + this.state.month);

        const screenName =
            this.state.mode === "categoryL1"
                ? FA_EXPENSES_SCREEN + "_" + this.formatTitle(this.state.title)
                : FA_EXPENSES_SCREEN + "_" + categoryName + "_" + categoryName;
        FAExpensesScreen.selectExpenses(screenName, categoryName);

        const {
            navigation: { push },
            route,
        } = this.props;

        push(navigationConstant.EXPENSES_L2_SCREEN, {
            mode: "categoryL2",
            month: this.state.month,
            categoryID: categoryID,
            title: categoryName,
            filterParam: this.state.filterParam,
            onGoBack: (parentCategoryId = this.state.categoryID) =>
                this._fetchSubCatByCategoryCode(this.state.month, parentCategoryId),
            deleteTransactionCallback: route.params?.deleteTransactionCallback,
            screenToPop: route.params?.screenToPop,
            refreshCallBack: route.params?.refreshCallBack,
            categoryL1Name: this.state.title,
        });
    };

    _onExpenseOnlineMerchantItemPressed = (merchantID, categoryName) => {
        const {
            navigation: { push },
            route,
        } = this.props;

        const screenName = FA_EXPENSES_SCREEN + "_" + this.formatTitle(this.state.title);
        FAExpensesScreen.selectExpenses(screenName, categoryName);

        push(navigationConstant.EXPENSES_L2_SCREEN, {
            mode: "merchant",
            month: this.state.month,
            merchantID,
            classificationId: this.state.classificationId,
            title: categoryName,
            filterParam: this.state.filterParam,
            onGoBack: (parentCategoryId = this.state.categoryID) =>
                this._fetchSubCatByCategoryCode(this.state.month, parentCategoryId),
            deleteTransactionCallback: route.params?.deleteTransactionCallback,
            screenToPop: route.params?.screenToPop,
            refreshCallBack: route.params?.refreshCallBack,
            categoryL1Name: this.state.title,
        });
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

    _renderLatestTransactions(data, date, index) {
        return (
            <FlatList
                data={data}
                extraData={this.state.refresh}
                renderItem={({ item }) => (
                    <View style={styles.containerTrackerListItem}>
                        <TrackerListItem
                            title={this._getTitle(item)}
                            desc={item.btsSubCategory != null && item.btsSubCategory.name}
                            amount={item.amount}
                            points={item.pointsEarned}
                            iconBgColor={this.getIconColor(item)}
                            iconImgUrl={{ uri: this.getIconImage(item) }}
                            onListItemPressed={() => this._onExpenseItemPressed(item)}
                            currencyCode={item.currencyCode && item.currencyCode}
                            amountForeign={item.currencyCode && item.amountForeign}
                            iconPadded={false}
                        />
                    </View>
                )}
                listKey={`${date}-${index}`}
                keyExtractor={(item) => item.btsId.toString()}
            />
        );
    }

    render() {
        const { data, title, mode, refresh, countryName } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={!data}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                // headerRightElement={
                                //     <HeaderCloseButton onPress={this._onClosePress} />
                                // }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        numberOfLines={1}
                                        text={
                                            title
                                                ? title
                                                : mode == "country"
                                                ? countryName
                                                : "Transactions"
                                        }
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                    >
                        <ScrollView style={styles.container}>
                            {/* Render expenses */}

                            {mode === "country" && data != null && data.historyItemList != null && (
                                <React.Fragment>
                                    <FlatList
                                        data={data.historyItemList}
                                        extraData={refresh}
                                        renderItem={({ item, index }) => (
                                            <React.Fragment>
                                                <TrackerSectionItem
                                                    date={item.date}
                                                    dateFormat="YYYY-MM-DD"
                                                    amount={item.totalAmount}
                                                />
                                                {this._renderLatestTransactions(
                                                    item.historyList,
                                                    item.date,
                                                    index
                                                )}
                                            </React.Fragment>
                                        )}
                                        keyExtractor={(item, index) => `${item.date}-${index}`}
                                    />
                                </React.Fragment>
                            )}

                            {mode === "merchant" && data != null && data.historyItemList != null && (
                                <React.Fragment>
                                    <FlatList
                                        data={data.historyItemList}
                                        extraData={refresh}
                                        renderItem={({ item, index }) => (
                                            <React.Fragment>
                                                <TrackerSectionItem
                                                    date={item.date}
                                                    dateFormat="YYYY-MM-DD"
                                                    amount={item.totalAmount}
                                                />
                                                {this._renderLatestTransactions(
                                                    item.historyList,
                                                    item.date,
                                                    index
                                                )}
                                            </React.Fragment>
                                        )}
                                        keyExtractor={(item, index) => `${item.date}-${index}`}
                                    />
                                </React.Fragment>
                            )}

                            {mode === "categoryL1" && data && (
                                <FlatList
                                    data={data.spendingPatternSub}
                                    extraData={refresh}
                                    renderItem={({ item }) => (
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
                                                    this._onExpenseCategoryItemPressed(
                                                        item.btsId,
                                                        item.name
                                                    )
                                                }
                                                mode={"categories"}
                                                iconPadded={false}
                                            />
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.btsId.toString()}
                                />
                            )}

                            {mode === "onlineL1" && data && (
                                <FlatList
                                    data={data}
                                    extraData={refresh}
                                    renderItem={({ item }) => (
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
                                                    this._onExpenseOnlineMerchantItemPressed(
                                                        item.btsId,
                                                        item.name
                                                    )
                                                }
                                                mode={"categories"}
                                                iconPadded={false}
                                            />
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.btsId.toString()}
                                />
                            )}

                            {mode === "categoryL2" && data != null && data.historyItemList != null && (
                                <React.Fragment>
                                    <FlatList
                                        data={data.historyItemList}
                                        extraData={refresh}
                                        renderItem={({ item, index }) => {
                                            return (
                                                <React.Fragment>
                                                    <TrackerSectionItem
                                                        date={item.date}
                                                        dateFormat="YYYY-MM-DD"
                                                        amount={item.totalAmount}
                                                    />
                                                    {this._renderLatestTransactions(
                                                        item.historyList,
                                                        item.date,
                                                        index
                                                    )}
                                                </React.Fragment>
                                            );
                                        }}
                                        keyExtractor={(item, index) => `${item.date}-${index}`}
                                    />
                                </React.Fragment>
                            )}
                        </ScrollView>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default ExpensesL2Screen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerTrackerListItem: {
        marginHorizontal: 8,
    },
});

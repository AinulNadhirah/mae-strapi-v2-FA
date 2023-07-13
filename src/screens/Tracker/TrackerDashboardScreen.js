import React, { Component } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, AsyncStorage } from "react-native";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Strings from "@constants/strings";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

import { pfmGetData, pfmGetDataMaya, pfmGetDataMayaM2u } from "@services";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";

import Modal from "react-native-modal";
import Browser from "@components/Specials/Browser";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { TopMenu } from "@components/TopMenu";
import { ErrorMessageV2 } from "@components/Common";
import moment from "moment";

import TrackerWidgetCardLoader from "@components/Cards/TrackerWidgetCardLoader";
import EmptyStateWidget from "../Tracker/Widgets/EmptyStateWidget";
import LoadingFailedWidget from "../Tracker/Widgets/LoadingFailedWidget";
import TotalBalanceWidget from "../Tracker/Widgets/TotalBalanceWidget";
import ExpensesByCategoryWidget from "../Tracker/Widgets/ExpensesByCategoryWidget";
import ExpensesByCountryWidget from "../Tracker/Widgets/ExpensesByCountryWidget";
import LatestExpensesWidget from "../Tracker/Widgets/LatestExpensesWidget";
import TabungWidget from "../Tracker/Widgets/TabungWidget";
import ProductHoldingsWidget from "./Widgets/ProductHoldingsWidget";
import CreditCardUtilisationWidget from "./Widgets/CreditCardUtilisationWidget";

class TrackerDashboardScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        enabledWidgets: [],
        showMenu: false,
        expensesByCategoryData: null,
        latestExpensesData: null,
        tabungData: null,
        currentMonth: "201910",
        showInfo: false,
        isLoading: true,
        showBrowser: false,
        browserUrl: "",
        browserTitle: "",
        productHoldingLoading: true,
        tabungLoading: true,
        creditLoading: true,
        totalBalanceLoading: true,
    };

    menuArray = [
        {
            menuLabel: "Manage Widgets",
            menuParam: "manage",
        },
    ];

    _showInfo = (title) => {
        var msg = "";

        if (title === "Total Balance") {
            msg = "Text to be provided here.";
        } else if (title === "Expenses by Category") {
            msg = "Text to be provided here.";
        } else if (title === "Latest Expenses") {
            msg = "Text to be provided here.";
        } else if (title === "Expenses by Country") {
            msg = "Text to be provided here.";
        } else if (title === "Tabung") {
            msg = "Text to be provided here.";
        }

        // console.log(title, msg);

        this.setState({ showInfo: true, showInfoTitle: title, showInfoMsg: msg });
    };

    _onExpensesCardBodyPress = (callWidget) => {
        console.log("[_onExpensesCardBodyPress] step 1");
        // const { expensesByCategoryData, latestExpensesData, expensesByCountryData } = this.state;

        // console.log(expensesByCategoryData);
        // console.log(latestExpensesData);
        // console.log(expensesByCountryData);

        console.log("[_onExpensesCardBodyPress] step 2");
        this.props.navigation.navigate(navigationConstant.EXPENSES_DASHBOARD, {
            callPage: "Tracker-Dashboard",
            callWidget: callWidget,
            onGoBack: () => this._fetchAllData(),
        });
    };

    _onProductHoldingsCardBodyPress = (title) => {
        console.log("[TrackerDashboardScreen][_onProductHoldingsCardBodyPress]");
        this.props.navigation.navigate(navigationConstant.PRODUCT_HOLDINGS_DASHBOARD, {
            selectedCategoryTab: title,
            accountBalanceList: this.state.productHoldingsData.accountBalanceList,
        });
    };

    _onCreditCardUtilisationCardBodyPress = () => {
        console.log("[TrackerDashboardScreen][_onCreditCardUtilisationCardBodyPress]");
        this.props.navigation.navigate(navigationConstant.CREDIT_CARD_UTILISATION_DASHBOARD);
    };

    _onTabungCardBodyPress = () => {
        NavigationService.navigateToModule(
            navigationConstant.TABUNG_STACK,
            navigationConstant.TABUNG_TAB_SCREEN
        );
    };

    _onTotalBalanceCardBodyPress = () => {
        console.log("[_onTotalBalanceCardBodyPress]");

        this.props.navigation.navigate(navigationConstant.TOTAL_BALANCE_DASHBOARD, {
            onGoBack: () => this._fetchAllData(),
        });
    };

    _handleTopMenuItemPress = async (param) => {
        this.setState({ showMenu: false });
        switch (param) {
            case "manage":
                //await this._requestDislikeContent(this.state.item.id.toString());
                //await this.props.route.params.onGoBack(this.state.item, this.state.index);
                this.props.navigation.navigate(navigationConstant.MANAGE_WIDGETS);
                break;
        }
    };

    _onCCUApplyNowPress = () => {
        this.setState({
            browserTitle: "Maybank - Credit Card Application",
            browserUrl:
                "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/cards_landing.page",
            showBrowser: true,
        });
    };

    _onCloseBrowser = () => this.setState({ showBrowser: false, browserTitle: "", browserUrl: "" });

    _retrieveWidgetsData = async () => {
        console.log("[TrackerDashboardScreen][_retrieveWidgetsData]");
        try {
            const enabledWidgetsStored = await AsyncStorage.getItem("PfmEnabledWidgets");
            // const disabledWidgetsStored = await AsyncStorage.getItem("PfmDisabledWidgets");
            var enabledWidgets = JSON.parse(enabledWidgetsStored);

            if (enabledWidgets !== null) {
                if (enabledWidgets.length > 0) {
                    console.log(
                        "[TrackerDashboardScreen][_retrieveWidgetsData][_setState]: ",
                        enabledWidgets
                    );
                    this.setState({
                        enabledWidgets: enabledWidgets,
                        refresh: !this.state.refresh,
                    });
                } else {
                    console.log("[TrackerDashboardScreen][_retrieveWidgetsData][_initWidgetsData]");
                    this._initWidgetsData();
                }
            }
        } catch (error) {
            // Error retrieving data
            console.log(
                "[TrackerDashboardScreen][_retrieveWidgetsData] ERROR: " + error.toString()
            );
        }
    };

    // _initWidgetsData = async () => {
    // 	console.log("[TrackerDashboardScreen][_initWidgetsData]");

    // 	const enabledWidgetsDefault = [
    // 		{ title: "Total Balance", fixed: true },
    // 		{ title: "Expenses by Category", fixed: true },
    // 		{ title: "Latest Expenses", fixed: false },
    // 		{ title: "Expenses by Country", fixed: false }
    // 	];

    // 	const disabledWidgetsDefault = [
    // 		{ title: "Product Holdings", fixed: false },
    // 		{ title: "Credit Card Utilisation", fixed: false },
    // 		{ title: "Currency", fixed: false },
    // 		{ title: "Budget", fixed: false },
    // 		{ title: "Recurring Payments", fixed: false },
    // 		{ title: "Tabung", fixed: false }
    // 	];

    // 	try {
    // 		await AsyncStorage.setItem("PfmEnabledWidgets", JSON.stringify(enabledWidgetsDefault));
    // 		await AsyncStorage.setItem("PfmDisabledWidgets", JSON.stringify(disabledWidgetsDefault));

    // 		await this._retrieveWidgetsData();
    // 	} catch (error) {
    // 		// Error saving data
    // 	}
    // };

    _fetchTabungData = () => {
        const subUrl = "/pfm/goal/sum";
        // let param = "?Authorization=bearer " + ModelClass.TRANSFER_DATA.m2uToken;

        pfmGetDataMaya(subUrl, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/goal/sum ==> ");
                console.log(result);
                if (result != null) {
                    // console.log(result);
                    this.setState({
                        tabungData: result,
                        refresh: !this.state.refresh,
                        tabungLoading: false,
                        tabungLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        tabungData: null,
                        refresh: !this.state.refresh,
                        tabungLoading: false,
                        tabungLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    tabungData: null,
                    refresh: !this.state.refresh,
                    tabungLoading: false,
                    tabungLoadingFailed: true,
                });
                console.log("pfmGetData _fetchTabungData ERROR: ", Error);
            });
    };

    _fetchSpendingByCategory = (month) => {
        let subUrl = "/pfm/creditCard/category/spendingPattern";
        let param = "?month=" + month + "01";

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/category/spendingPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        expensesByCategoryData: result,
                        refresh: !this.state.refresh,
                        expensesByCategoryLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        expensesByCategoryData: null,
                        refresh: !this.state.refresh,
                        expensesByCategoryLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    expensesByCategoryData: null,
                    refresh: !this.state.refresh,
                    expensesByCategoryLoadingFailed: true,
                });
                console.log("pfmGetData _fetchSpendingByCategory ERROR: ", Error);
            });
    };

    _fetchTransactionHistory = (month) => {
        let subUrl = "/pfm/creditCard/transaction/history";

        let startDate = month + "01";
        var endDate = "";

        if (moment(startDate).isSame(new Date(), "month")) {
            endDate = moment().format("YYYYMMDD");
        } else {
            endDate = moment(startDate).add(1, "months").subtract(1, "days").format("YYYYMMDD");
        }

        console.log("calculate last date of month: ", endDate);

        let param = "?startDate=" + startDate + "&endDate=" + endDate;

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/transaction/history ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        latestExpensesData: result,
                        refresh: !this.state.refresh,
                        latestExpensesLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        latestExpensesData: null,
                        refresh: !this.state.refresh,
                        latestExpensesLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    latestExpensesData: null,
                    refresh: !this.state.refresh,
                    latestExpensesLoadingFailed: true,
                });
                console.log("pfmGetData _fetchTransactionHistory ERROR: ", Error);
            });
    };

    _fetchSpendingByCountry = (month) => {
        let subUrl = "/pfm/creditCard/country/spendingPattern";
        let param = "?month=" + month + "01";

        pfmGetData(subUrl + param, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/creditCard/country/spendingPattern ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        expensesByCountryData: result,
                        refresh: !this.state.refresh,
                        expensesByCountryLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        expensesByCountryData: null,
                        refresh: !this.state.refresh,
                        expensesByCountryLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    expensesByCountryData: null,
                    refresh: !this.state.refresh,
                    expensesByCountryLoadingFailed: true,
                });
                console.log("pfmGetData _fetchSpendingByCountry ERROR: ", Error);
            });
    };

    _fetchProductHoldings = () => {
        let subUrl = "/pfm/productHolding/totalBalance";

        pfmGetData(subUrl, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/productHolding/totalBalance ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        productHoldingsData: result,
                        refresh: !this.state.refresh,
                        productHoldingLoading: false,
                        productHoldingLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        productHoldingsData: null,
                        refresh: !this.state.refresh,
                        productHoldingLoading: false,
                        productHoldingLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    productHoldingsData: null,
                    refresh: !this.state.refresh,
                    productHoldingLoading: false,
                    productHoldingLoadingFailed: true,
                });
                console.log("pfmGetData _fetchProductHoldings ERROR: ", Error);
            });
    };

    _fetchTotalBalance = () => {
        let subUrl = "/totalBalance";

        pfmGetData(subUrl, false)
            .then(async (response) => {
                const result = response.data.totalBalance;
                console.log("/totalBalance ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        totalBalanceData: result,
                        refresh: !this.state.refresh,
                        totalBalanceLoading: false,
                        totalBalanceLoadingFailed: false,
                    });
                } else {
                    this.setState({
                        totalBalanceData: null,
                        refresh: !this.state.refresh,
                        totalBalanceLoading: false,
                        totalBalanceLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    totalBalanceData: null,
                    refresh: !this.state.refresh,
                    totalBalanceLoading: false,
                    totalBalanceLoadingFailed: true,
                });
                console.log("pfmGetData _fetchTotalBalance ERROR: ", Error);
            });
    };

    _fetchTotalBalanceLastPeriod = () => {
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

    // 	pfmGetData(subUrl, false)
    // 		.then(async response => {
    // 			const result = response.data.result.openingBalance;
    // 			console.log("/totalBalance/openingBalance ==> ");
    // 			// console.log(result);
    // 			if (result != null) {
    // 				console.log(result);
    // 				this.setState({ openingBalanceData: result, refresh: !this.state.refresh });
    // 			} else {
    // 				this.setState({ openingBalanceData: null, refresh: !this.state.refresh });
    // 			}
    // 		})
    // 		.catch(Error => {
    // 			console.log("pfmGetData _fetchOpeningBalance ERROR: ", Error);
    // 		});
    // };

    _fetchCreditData = () => {
        let subUrl = "/pfm/card/summary";

        pfmGetData(subUrl, false)
            .then(async (response) => {
                const result = response.data;
                console.log("/pfm/card/summary ==> ");
                // console.log(result);
                if (result != null) {
                    console.log(result);
                    this.setState({
                        creditData: result,
                        refresh: !this.state.refresh,
                        creditLoading: false,
                        creditLoadingFailed: false,
                    });
                    console.log(this.state);
                } else {
                    this.setState({
                        creditData: null,
                        refresh: !this.state.refresh,
                        creditLoading: false,
                        creditLoadingFailed: false,
                    });
                }
            })
            .catch((Error) => {
                this.setState({
                    creditData: null,
                    refresh: !this.state.refresh,
                    creditLoading: false,
                    creditLoadingFailed: true,
                });
                console.log("pfmGetData _fetchCreditData ERROR: ", Error);
            });
    };

    componentDidMount = async () => {
        // fetch list of enabled widgets from localstorage
        // this._initWidgetsData();
        await this._retrieveWidgetsData();

        // get and set current month
        var currentMonth = moment().format("YYYYMM");
        this.setState({ currentMonth: currentMonth });

        // fetch data from API
        this._fetchAllData();
    };

    _fetchAllData = async () => {
        // Start loading state
        this.setState({ isLoading: true });

        // Get array of enabled widgets
        // console.log("[TrackerDashboardScreen][_fetchAllData] enabled widgets: ", enabledWidgets);

        for (let widget of this.state.enabledWidgets) {
            const { title } = widget;

            switch (title) {
                case "Expenses by Category":
                    await this._fetchSpendingByCategory(this.state.currentMonth);
                    break;
                case "Total Balance":
                    await this._fetchTotalBalance();
                    await this._fetchTotalBalanceLastPeriod();
                    break;
                case "Expenses by Country":
                    await this._fetchSpendingByCountry(this.state.currentMonth);
                    break;
                case "Latest Expenses":
                    await this._fetchTransactionHistory(this.state.currentMonth);
                    break;
                case "Credit Card Utilisation":
                    await this._fetchCreditData();
                    break;
                case "Tabung":
                    await this._fetchTabungData();
                    break;
                case "Product Holdings":
                    await this._fetchProductHoldings();
                    break;
                default:
                    console.log("[TrackerDashboardScreen][_fetchAllData] Widget API not found");
            }
        }

        // Stop loading state
        this.setState({ isLoading: false });

        // LOG: Check state
        // console.log("pfmDataState", this.state);
    };

    _createTabung = () => {
        ModelClass.GOAL_DATA.editSummary = false;
        ModelClass.SELECTED_CONTACT = [];
        ModelClass.GOAL_DATA.friendList = [];
        ModelClass.GOAL_DATA.esiActivation = false;
        ModelClass.GOAL_DATA.esiDiactivation = false;
        ModelClass.GOAL_DATA.pinValidate = 0;
        ModelClass.GOAL_DATA.withdrawing = false;
        ModelClass.GOAL_DATA.goalName = "";
        ModelClass.GOAL_DATA.goalStart = "";
        ModelClass.GOAL_DATA.goalEnd = "";
        ModelClass.GOAL_DATA.goalAmount = "";
        ModelClass.GOAL_DATA.goalFlow = 1;
        ModelClass.GOAL_DATA.startFrom = false;
        ModelClass.GOAL_DATA.editing = false;
        ModelClass.GOAL_DATA.esiEnabled = false;
        ModelClass.GOAL_DATA.fundingTabung = false;
        ModelClass.GOAL_DATA.noChange = false;
        ModelClass.GOAL_DATA.joinGoal = false;
        ModelClass.GOAL_DATA.frequencyList = [];
        //
        NavigationService.navigateToModule(
            navigationConstant.GOALS_MODULE,
            navigationConstant.CREATE_GOALS_START
        );
    };

    _calculateCreditPercentage = (creditLimit, outstandingBalance) => {
        try {
            let lim = Number(creditLimit.replace(/,/g, ""));
            let bal = Number(outstandingBalance.replace(/,/g, ""));

            let result = ((bal / lim) * 100).toFixed(1);

            console.log("bal: " + bal + " lim: " + lim + " result: " + result);

            if (isNaN(result)) {
                return 0;
            } else {
                return result;
            }
        } catch (err) {
            return 0;
        }
    };

    _calculateCreditBalance(limit, outstanding) {
        let creditLimit = this._convertStringToNumber(limit);
        let totalOutstanding = Math.abs(this._convertStringToNumber(outstanding));

        let totalCreditBalance = creditLimit - totalOutstanding;

        return totalCreditBalance;
    }

    _convertStringToNumber = (val) => {
        if (val) {
            let num = Number(val.replace(/,/g, ""));
            return num;
        }

        return 0;
    };

    renderWidget(title) {
        // console.log("rendering: " + title);
        const {
            expensesByCategoryData,
            expensesByCategoryLoadingFailed,
            latestExpensesData,
            latestExpensesLoadingFailed,
            expensesByCountryData,
            expensesByCountryLoadingFailed,
            tabungData,
            tabungLoading,
            tabungLoadingFailed,
            productHoldingsData,
            productHoldingLoading,
            productHoldingLoadingFailed,
            totalBalanceData,
            lastPeriodPercent,
            totalBalanceLoading,
            totalBalanceLoadingFailed,
            creditData,
            creditLoading,
            creditLoadingFailed,
        } = this.state;

        switch (title) {
            case "Total Balance":
                return (
                    <React.Fragment>
                        {totalBalanceLoading ? (
                            <TrackerWidgetCardLoader />
                        ) : (
                            <React.Fragment>
                                {totalBalanceLoadingFailed ? (
                                    <LoadingFailedWidget title={"Total Balance"} />
                                ) : (
                                    <React.Fragment>
                                        {totalBalanceData != null ? (
                                            <TotalBalanceWidget
                                                totalBalanceAmount={totalBalanceData}
                                                percentageChange={lastPeriodPercent}
                                                onCardPressed={this._onTotalBalanceCardBodyPress}
                                                showInfo={this._showInfo}
                                            />
                                        ) : (
                                            <TotalBalanceWidget
                                                totalBalanceAmount={0}
                                                onCardPressed={this._onTotalBalanceCardBodyPress}
                                                showInfo={this._showInfo}
                                            />
                                        )}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Expenses by Category":
                // console.log("rendering 2: " + title);
                return (
                    <React.Fragment>
                        {expensesByCategoryLoadingFailed ? (
                            <LoadingFailedWidget title={"Expenses by Category"} />
                        ) : (
                            <React.Fragment>
                                {expensesByCategoryData != null &&
                                expensesByCategoryData.spendingPatterns != null &&
                                expensesByCategoryData.spendingPatterns.length != 0 ? (
                                    <ExpensesByCategoryWidget
                                        onListItemPressed={() =>
                                            this._onExpensesCardBodyPress("ExpensesByCategory")
                                        }
                                        amount={expensesByCategoryData.amountSum}
                                        items={expensesByCategoryData.spendingPatterns.slice(0, 3)}
                                        showInfo={this._showInfo}
                                    />
                                ) : (
                                    <EmptyStateWidget
                                        title={"Expenses by Category"}
                                        description={
                                            "No expenses to show. Start spending and all your expenses will automate themselves here. "
                                        }
                                        actionTitle={"Add manually"}
                                        onActionPressed={() =>
                                            this._onExpensesCardBodyPress("ExpensesByCategory")
                                        }
                                        showInfo={this._showInfo}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Expenses by Country":
                return (
                    <React.Fragment>
                        {expensesByCountryLoadingFailed ? (
                            <LoadingFailedWidget title={"Expenses by Country"} />
                        ) : (
                            <React.Fragment>
                                {expensesByCountryData != null &&
                                expensesByCountryData.spendingPatterns != null &&
                                expensesByCountryData.spendingPatterns.length != 0 ? (
                                    <ExpensesByCountryWidget
                                        onListItemPressed={() =>
                                            this._onExpensesCardBodyPress("ExpensesByCountry")
                                        }
                                        amount={expensesByCountryData.amountSum}
                                        items={expensesByCountryData.spendingPatterns.slice(0, 3)}
                                        showInfo={this._showInfo}
                                    />
                                ) : (
                                    <EmptyStateWidget
                                        title={"Expenses by Country"}
                                        description={
                                            "No expenses to show. Start spending with your MAE card abroad to enjoy competitive rates."
                                        }
                                        actionTitle={"Add manually"}
                                        onActionPressed={() =>
                                            this._onExpensesCardBodyPress("ExpensesByCountry")
                                        }
                                        showInfo={this._showInfo}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Latest Expenses":
                return (
                    <React.Fragment>
                        {latestExpensesLoadingFailed ? (
                            <LoadingFailedWidget title={"Latest Expenses"} />
                        ) : (
                            <React.Fragment>
                                {latestExpensesData != null &&
                                latestExpensesData.latestTransactions != null &&
                                latestExpensesData.latestTransactions.length != 0 ? (
                                    <LatestExpensesWidget
                                        onListItemPressed={() =>
                                            this._onExpensesCardBodyPress("LatestExpenses")
                                        }
                                        amount={latestExpensesData.totalAmount}
                                        items={latestExpensesData.latestTransactions}
                                        showInfo={this._showInfo}
                                    />
                                ) : (
                                    <EmptyStateWidget
                                        title={"Latest Expenses"}
                                        description={
                                            "No expenses to show. Start spending and all your expenses will automate themselves here. "
                                        }
                                        actionTitle={"Add manually"}
                                        onActionPressed={() =>
                                            this._onExpensesCardBodyPress("LatestExpenses")
                                        }
                                        showInfo={this._showInfo}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Product Holdings":
                return (
                    <React.Fragment>
                        {productHoldingLoading ? (
                            <TrackerWidgetCardLoader />
                        ) : (
                            <React.Fragment>
                                {productHoldingLoadingFailed ? (
                                    <LoadingFailedWidget title={"Product Holdings"} />
                                ) : (
                                    <React.Fragment>
                                        {productHoldingsData != null &&
                                        productHoldingsData.accountBalanceList != null &&
                                        productHoldingsData.accountBalanceList.length != 0 ? (
                                            <ProductHoldingsWidget
                                                data={productHoldingsData}
                                                onListItemPressed={
                                                    this._onProductHoldingsCardBodyPress
                                                }
                                            />
                                        ) : (
                                            <EmptyStateWidget
                                                title={"Product Holdings"}
                                                description={"No product holdings yet."}
                                                actionTitle={""}
                                                onActionPressed={() => {}}
                                                showInfo={this._showInfo}
                                            />
                                        )}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Credit Card Utilisation":
                return (
                    <React.Fragment>
                        {creditLoading ? (
                            <TrackerWidgetCardLoader />
                        ) : (
                            <React.Fragment>
                                {creditLoadingFailed ? (
                                    <LoadingFailedWidget title={"Credit Card Utilisation"} />
                                ) : (
                                    <React.Fragment>
                                        {creditData != null &&
                                        creditData.totalCreditLimit != null &&
                                        creditData.totalOutstandingBalance != null &&
                                        creditData.cardsList != null &&
                                        creditData.cardsList.length != 0 ? (
                                            <CreditCardUtilisationWidget
                                                progress={this._convertStringToNumber(
                                                    this._calculateCreditPercentage(
                                                        creditData.totalCreditLimit,
                                                        creditData.totalOutstandingBalance
                                                    )
                                                )}
                                                creditBalance={this._calculateCreditBalance(
                                                    creditData.totalCreditLimit,
                                                    creditData.totalOutstandingBalance
                                                )}
                                                totalLimit={this._convertStringToNumber(
                                                    creditData.totalCreditLimit
                                                )}
                                                onBodyPress={() =>
                                                    this._onCreditCardUtilisationCardBodyPress()
                                                }
                                            />
                                        ) : (
                                            <EmptyStateWidget
                                                title={"Credit Card Utilisation"}
                                                description={"No cards yet."}
                                                actionTitle={"Apply Now"}
                                                onActionPressed={() => this._onCCUApplyNowPress()}
                                                showInfo={this._showInfo}
                                            />
                                        )}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            case "Tabung":
                return (
                    <React.Fragment>
                        {tabungLoading ? (
                            <TrackerWidgetCardLoader />
                        ) : (
                            <React.Fragment>
                                {tabungLoadingFailed ? (
                                    <LoadingFailedWidget title={"Tabung"} />
                                ) : (
                                    <React.Fragment>
                                        {tabungData != null && tabungData.result != null ? (
                                            <TabungWidget
                                                progressBarTarget={
                                                    tabungData.result.contributedAmount != null &&
                                                    tabungData.result.totalAmount != null
                                                        ? this._calculatePercentage(
                                                              tabungData.result.contributedAmount,
                                                              tabungData.result.totalAmount
                                                          )
                                                        : "0%"
                                                }
                                                amount={
                                                    tabungData.result.contributedAmount != null
                                                        ? tabungData.result.contributedAmount
                                                        : 0
                                                }
                                                total={
                                                    tabungData.result.totalAmount != null
                                                        ? tabungData.result.totalAmount
                                                        : 0
                                                }
                                                onBodyPress={() => this._onTabungCardBodyPress()}
                                            />
                                        ) : (
                                            <EmptyStateWidget
                                                title={"Tabung"}
                                                description={
                                                    "No Tabung to show. Start a Tabung now to save on the things that matter."
                                                }
                                                actionTitle={"Create a Tabung"}
                                                onActionPressed={() => this._createTabung()}
                                                showInfo={this._showInfo}
                                            />
                                        )}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            default:
                return null;
        }
    }

    _calculatePercentage = (amount, totalAmount) => {
        let val = Math.round((100 * amount) / totalAmount);

        if (val > 100) {
            return "100%";
        } else {
            return val + "%";
        }
    };

    _calculatePercentageChange = (currentBalance, previousMonthBalance) => {
        return Math.round(((currentBalance - previousMonthBalance) / previousMonthBalance) * 100);
    };

    _reverseArray = (arr) => {
        return arr.reduce((acc, cur) => (acc.unshift(cur), acc), []);
    };

    _onBackButtonPressed() {
        // clear m2u token to reset session
        //ModelClass.TRANSFER_DATA.m2uToken = null;
        this.props.navigation.goBack();

        // navigate back to home dashboard
        // NavigationService.resetAndNavigateToModule(
        // 	navigationConstant.HOME_DASHBOARD,
        // 	navigationConstant.HOME_DASHBOARD
        // );
    }

    _renderLoadingState() {
        return (
            <View>
                <TrackerWidgetCardLoader />
            </View>
        );
    }

    render() {
        const {
            showQuickActions,
            overlayType,
            enabledWidgets,
            refresh,
            isLoading,
            showBrowser,
            browserUrl,
            browserTitle,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showQuickActions || showBrowser}
                    overlayType={"solid"}
                >
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea={true}
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton
                                            onPress={() => this._onBackButtonPressed()}
                                        />
                                    }
                                    headerCenterElement={
                                        <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                            <Text>Tracker</Text>
                                        </Typo>
                                    }
                                    headerRightElement={
                                        <HeaderDotDotDotButton
                                            onPress={() => this.setState({ showMenu: true })}
                                        />
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                <ScrollView style={styles.container}>
                                    {isLoading ? (
                                        <View>{this._renderLoadingState()}</View>
                                    ) : (
                                        <FlatList
                                            data={enabledWidgets}
                                            extraData={refresh}
                                            renderItem={({ item, index }) => (
                                                <React.Fragment>
                                                    {this.renderWidget(item.title)}
                                                </React.Fragment>
                                            )}
                                            keyExtractor={(item) => item.title.toString()}
                                        />
                                    )}

                                    <View style={{ height: 40, width: "100%" }} />
                                </ScrollView>
                            </React.Fragment>
                        </ScreenLayout>

                        {/* Info view */}
                        {this.state.showInfo && (
                            <ErrorMessageV2
                                onClose={() => {
                                    this.setState({ showInfo: false });
                                }}
                                title={this.state.showInfoTitle}
                                description={this.state.showInfoMsg}
                            />
                        )}

                        {/* Browser modal view */}
                        <Modal
                            isVisible={showBrowser}
                            hasBackdrop={false}
                            useNativeDriver
                            style={styles.modal}
                        >
                            <Browser
                                source={{ uri: browserUrl }}
                                title={browserTitle}
                                onCloseButtonPressed={this._onCloseBrowser}
                            />
                        </Modal>
                    </React.Fragment>
                </ScreenContainer>
                {/* START: Top menu view */}
                <TopMenu
                    showTopMenu={this.state.showMenu}
                    onClose={() => {
                        this.setState({ showMenu: false });
                    }}
                    navigation={this.props.navigation}
                    menuArray={this.menuArray}
                    onItemPress={(obj) => this._handleTopMenuItemPress(obj)}
                />
                {/* END: Top menu view */}
            </React.Fragment>
        );
    }
}
export default TrackerDashboardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
        paddingBottom: 24,
    },
    modal: {
        margin: 0,
    },
});

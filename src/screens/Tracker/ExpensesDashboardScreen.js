import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Text } from "react-native";

import ExpensesL1Screen from "@screens/Tracker/ExpensesL1Screen";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import PfmFilterModalV2 from "@components/Modals/PfmFilterModalV2";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { TopMenu } from "@components/TopMenu";

import { FAExpensesScreen } from "@services/analytics/analyticsExpenses";

import { MEDIUM_GREY } from "@constants/colors";

const topMenuOptions = Object.freeze([
    { menuLabel: "Manage Categories", menuParam: "MANAGE_CATEGORIES" },
]);

class ExpensesDashboardScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        hideBackButton: PropTypes.any,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.shape({
            params: PropTypes.shape({
                selectedCategoryTab: PropTypes.string,
            }),
        }),
    };

    state = {
        initLoading: true,
        selectedCategoryTab: "Latest",
        // callWidget: this.props.route.params.callWidget,
        monthsArr: [],
        monthsNumArr: [],
        activeTabIndex: 11,
        filterParam: "",
        showPfmFilterModal: false,
        hideBackButton: this.props.hideBackButton,

        // info popup/tooltip
        showInfo: false,
        showInfoTitle: "",
        showInfoMsg: "",
        showTopMenu: false,
    };

    componentDidMount() {
        // this.getPast12Months();
        this.init();
    }

    init = async () => {
        this.getPast12Months();
        this.setState(
            {
                initLoading: false,
                renderFilterModal: true,
            },
            () => console.log("[ExpensesDashboardScreen][init] 3", this.state)
        );
    };
    _onBackPress = () => {
        const {
            navigation: { goBack },
        } = this.props;
        // const onGoBack = route.params?.onGoBack ?? function() {};
        // onGoBack();
        goBack();
    };

    _togglePfmFilterModal = () => {
        console.log("[ExpensesDashboardScreen][_togglePfmFilterModal] function called!");
        this.setState({ showPfmFilterModal: !this.state.showPfmFilterModal });
    };

    _renderPfmFilterModal = () => {
        this.setState({ renderFilterModal: true });
    };

    _showInfo = (title) => {
        var msg = "";

        if (title === "Daily Average Spending") {
            msg =
                "Daily Average Spending is the total amount you've spent divided by number of days in a month. It gives you a good grasp on how much you spend daily!";
        } else if (title === "Monthly Average Spending") {
            msg =
                "Monthly Average Spending captures the average amount of money spent on a monthly basis.";
        } else if (title === "Monthly Spending") {
            msg = "Monthly Spending captures the sum amount of money spent within the month.";
        } else if (title === "Spent So Far") {
            msg = `'Spent So Far' tracks all your accounts and cards transactions to date including Tabung/Goal Savings Plan transfer and most investment products (e.g. Unit Trust, Shares, Silver & more.)\n\nYour expenses will be updated a day after the transaction has taken place.`;
        } else if (title === "This month's spending") {
            msg =
                "This month's spending tracks how much you've spent to the end of the month. It includes all expenses from Maybank accounts and cards.";
        }

        console.log(title, msg);

        this.setState({ showInfo: true, showInfoTitle: "What's " + title + "?", showInfoMsg: msg });
    };

    _hideInfo = () => {
        this.setState({ showInfo: false, showInfoTitle: "", showInfoMsg: "" });
    };

    getPast12Months() {
        const monthsArr = [];
        const monthsNumArr = [];

        for (var i = 0; i < 12; i++) {
            var month = "";
            var monthNum = "";

            if (i == 0) {
                month = moment().format("MMM").toUpperCase();

                monthNum = moment().format("YYYYMM");
            } else {
                month = moment().subtract(i, "month").format("MMM").toUpperCase();

                monthNum = moment().subtract(i, "month").format("YYYYMM");
            }

            // if january, append current year to the title
            if (month === "JAN") {
                month = moment().format("YYYY") + "JAN";
            }

            monthsArr.push(month);
            monthsNumArr.push(monthNum);
        }

        this.setState({
            monthsArr: monthsArr.reverse(),
            monthsNumArr: monthsNumArr.reverse(),
        });
    }

    handleTabChange = (index) => {
        this.setState({ activeTabIndex: index });
        console.log(
            "[ExpensesDashboardScreen][handleTabChange] activeTabIndex: " +
                this.state.activeTabIndex
        );
    };

    _setFilterParam = (param) => {
        this.setState({ filterParam: param });
    };

    _refreshWithFilter = (newParam) => {
        this._setFilterParam(newParam);
    };

    _showTopMenu = () => {
        // logEven tap open menu
        FAExpensesScreen.openMenu(this.state.selectedCategoryTab);
        this.setState({ showTopMenu: true });
    };

    getCurrentTabName = (tab) => {
        this.setState({ selectedCategoryTab: tab });
    };

    _hideTopMenu = () => this.setState({ showTopMenu: false });

    _navigateToEditCategoryScreen = () => {
        FAExpensesScreen.manageCategories();

        this.setState({ showTopMenu: false }, () =>
            this.props.navigation.navigate("trackerModule", {
                screen: "EditTransactionCategoryScreen",
                params: {
                    isManagingCategoriesFlow: true,
                },
            })
        );
    };

    render() {
        const {
            activeTabIndex,
            monthsNumArr,
            monthsArr,
            filterParam,
            hideBackButton,
            renderFilterModal,
            initLoading,
            showTopMenu,
        } = this.state;
        const { navigation, route } = this.props;
        const selectedCategoryTab = route?.params?.selectedCategoryTab ?? "Latest";

        const screens = monthsNumArr.map((item, index) => {
            return (
                <ExpensesL1Screen
                    index={index}
                    navigation={navigation}
                    selectedCategoryTab={selectedCategoryTab}
                    activeTabIndex={activeTabIndex}
                    currentMonth={item}
                    key={item}
                    toggleOverlay={this._toggleOverlay}
                    filterParam={filterParam}
                    togglePfmFilterModal={this._togglePfmFilterModal}
                    renderPfmFilterModal={this._renderPfmFilterModal}
                    showInfo={this._showInfo}
                    hideInfo={this._hideInfo}
                    onGetCurrentTab={this.getCurrentTabName}
                />
            );
        });

        return (
            <>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    overlayType="solid"
                    overlaySolidColor={MEDIUM_GREY}
                    showLoaderModal={initLoading}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        neverForceInset={["bottom"]}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    hideBackButton ? (
                                        <SpaceFiller width={45} height={45} />
                                    ) : (
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    )
                                }
                                headerCenterElement={
                                    <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                        <Text>Expenses</Text>
                                    </Typo>
                                }
                                headerRightElement={
                                    <HeaderDotDotDotButton onPress={this._showTopMenu} />
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <TabView
                                defaultTabIndex={activeTabIndex}
                                titles={monthsArr}
                                onTabChange={this.handleTabChange}
                                scrollToEnd={true}
                                screens={screens}
                            />

                            {renderFilterModal && (
                                <PfmFilterModalV2
                                    showPfmFilterModal={this.state.showPfmFilterModal}
                                    togglePfmFilterModal={this._togglePfmFilterModal}
                                    refreshWithFilter={this._refreshWithFilter}
                                    navigation={navigation}
                                />
                            )}
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={this.state.showInfo}
                    onClose={this._hideInfo}
                    title={this.state.showInfoTitle}
                    description={this.state.showInfoMsg}
                />
                <TopMenu
                    showTopMenu={showTopMenu}
                    onClose={this._hideTopMenu}
                    menuArray={topMenuOptions}
                    onItemPress={this._navigateToEditCategoryScreen}
                />
            </>
        );
    }
}

export default ExpensesDashboardScreen;

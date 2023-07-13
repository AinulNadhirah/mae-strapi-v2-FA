import cloneDeep from "lodash/cloneDeep";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
} from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FilterListItem from "@components/ListItems/FilterListItem";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { pfmGetData } from "@services/index";

import {
    YELLOW,
    WHITE,
    MEDIUM_GREY,
    LIGHT_GREY,
    LIGHTER_YELLOW,
    GREY,
    BLACK,
} from "@constants/colors";

import assets from "@assets";

export const { width, height } = Dimensions.get("window");

class PfmFilterModalV2 extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        showPfmFilterModal: PropTypes.bool,
    };
    state = {
        // filterCategories: ["All", "Wallet", "Cash"],
        // accountsArray: [
        // 	{ title: "Current Account", accNo: "243590364532", selected: false },
        // 	{ title: "Savings Account", accNo: "353609470989", selected: false },
        // 	{ title: "Maybank Visa Platinum", accNo: "", selected: false }
        // ],
        cardsArray: [],
        accountsArray: [],
        selectedCategory: "All",
        selectedAccountsArray: [],
        selectedCardsArray: [],
        allAccountsSelected: false,
        allCardsSelected: false,
        accountListLoaded: false,
        refresh: false,
        filterApplied: false,
        appliedState: {},
        updated: false,
        isDonePostLogin: false,
    };

    componentDidMount = () => {
        // this._prepareCategories();
        if (this.state.accountsArray.length == 0) {
            this._fetchAccountList();
        }
    };

    componentDidUpdate(prevProps) {
        let { isDonePostLogin } = this.state;
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        if (
            this.props.showPfmFilterModal !== prevProps.showPfmFilterModal &&
            isPostLogin !== isDonePostLogin
        ) {
            this._fetchAccountList();
            isDonePostLogin = isPostLogin;
            this.setState({ isDonePostLogin });
        }
    }

    saveState = () => {
        this.setState({ appliedState: cloneDeep(this.state) });
    };

    _fetchAccountList = async () => {
        const subUrl = "/pfm/accountCardList";

        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        if (isPostLogin) {
            try {
                const response = await pfmGetData(subUrl, false);
                const result = response.data;
                console.log(subUrl + " ==> ");
                if (result != null) {
                    console.log(result);

                    // split accounts / cards into separate arrays
                    const accounts = result.filter(
                        (data) => data.type === "D" || data.type === "S"
                    );
                    const cards = result.filter(
                        (data) =>
                            data.type === "C" ||
                            data.type === "DEBIT" ||
                            data.type === "J" ||
                            data.type === "R" ||
                            data.type === "MAE_DEBIT"
                    );

                    this.setState(
                        {
                            accountsArray: accounts,
                            cardsArray: cards,
                            refresh: !this.state.refresh,
                            accountListLoaded: true,
                        },
                        () => console.log("_fetchAccountList state ", this.state)
                    );
                } else {
                    this.setState({
                        accountsArray: null,
                        cardsArray: null,
                        refresh: !this.state.refresh,
                        accountListLoaded: true,
                    });
                }
            } catch (error) {
                console.log("[PfmFilterModalV2] Error, navigating to dashboard");
                // this.props.navigation.navigate("Dashboard");
                console.log("pfmGetData _fetchAccountList ERROR: ", Error);
            }
        }
    };

    _dismissModalWithParam = (param) => {
        this.props.refreshWithFilter(param);
        this.props.togglePfmFilterModal();
    };

    _onPressClose = () => {
        console.log("Is filter applied during closing?", this.state.filterApplied);
        console.log("Is the state the same?", this.state);
        if (!this.state.filterApplied) {
            this.setState(
                {
                    selectedCategory: "All",
                    selectedAccountsArray: [],
                    selectedCardsArray: [],
                    allAccountsSelected: false,
                    allCardsSelected: false,
                    refresh: !this.state.refresh,
                    updated: false,
                },
                () => {
                    this.props.togglePfmFilterModal();
                }
            );
        } else {
            const { updated } = this.state;
            if (updated) {
                let appliedState = cloneDeep(this.state.appliedState);
                console.log("reset applied state", appliedState);
                let {
                    selectedCategory,
                    selectedAccountsArray,
                    selectedCardsArray,
                    allAccountsSelected,
                    allCardsSelected,
                } = appliedState;

                this.setState(
                    {
                        selectedCategory,
                        selectedAccountsArray: [...selectedAccountsArray],
                        selectedCardsArray: [...selectedCardsArray],
                        allAccountsSelected,
                        allCardsSelected,
                        refresh: !this.state.refresh,
                        updated: false,
                    },
                    () => {
                        console.log("latest state:", this.state);
                        this.props.togglePfmFilterModal();
                    }
                );
            } else {
                this.props.togglePfmFilterModal();
            }
        }
    };

    _onPressApply = () => {
        const { selectedAccountsArray, selectedCardsArray, selectedCategory } = this.state;

        console.log("[_onPressApply] state", this.state);

        this.setState({ filterApplied: true, updated: false }, () => this.saveState());

        switch (selectedCategory) {
            case "All":
                this._dismissModalWithParam("");
                console.log("All");
                break;
            case "Wallet":
                if (selectedAccountsArray.length || selectedCardsArray.length > 0) {
                    console.log("wallet - specific/all accounts and cards selected");
                    const accList = selectedAccountsArray.map((d, i) => {
                        return d.number;
                    });
                    const cardsList = selectedCardsArray.map((d, i) => {
                        return d.number;
                    });

                    const unifiedList = [...accList, ...cardsList];

                    const param = "&acctNos=" + unifiedList.toString();
                    this._dismissModalWithParam(param);
                }
                break;
            case "Cash":
                let param = "&paymentMethod=CASH";
                this._dismissModalWithParam(param);
                console.log("Cash");
                break;
        }
    };

    _onAllSelected = () => {
        const { selectedCategory } = this.state;

        this.setState({
            allAccountsSelected: false,
            allCardsSelected: false,
            selectedAccountsArray: [],
            selectedCardsArray: [],
            refresh: !this.state.refresh,
            selectedCategory: selectedCategory === "All" ? "" : "All",
            updated: true,
        });
    };

    _onCashSelected = () => {
        this.setState({
            allAccountsSelected: false,
            allCardsSelected: false,
            selectedAccountsArray: [],
            selectedCardsArray: [],
            refresh: !this.state.refresh,
            selectedCategory: this.state.selectedCategory == "Cash" ? "" : "Cash",
            updated: true,
        });
    };

    _onAllAccountsSelected = () => {
        const { allAccountsSelected, selectedCardsArray, accountsArray, refresh } = this.state;

        this.setState({
            allAccountsSelected: allAccountsSelected ? false : true,
            selectedAccountsArray: allAccountsSelected ? [] : accountsArray.slice(0),
            refresh: !refresh,
            selectedCategory: allAccountsSelected
                ? selectedCardsArray.length != 0
                    ? "Wallet"
                    : ""
                : "Wallet",
            updated: true,
        });
    };

    _onAllCardsSelected = () => {
        const { allCardsSelected, selectedAccountsArray, cardsArray, refresh } = this.state;

        this.setState({
            allCardsSelected: allCardsSelected ? false : true,
            selectedCardsArray: allCardsSelected ? [] : cardsArray.slice(0),
            refresh: !refresh,
            selectedCategory: allCardsSelected
                ? selectedAccountsArray.length != 0
                    ? "Wallet"
                    : ""
                : "Wallet",
            updated: true,
        });
    };

    _onAccountsListItemSelected = (item) => {
        const { selectedCardsArray, selectedAccountsArray, refresh } = this.state;

        if (!selectedAccountsArray.some((account) => account.number === item.number)) {
            // if it's not a selected item
            // add acc number to selected array

            // make a copy of the array
            const array = selectedAccountsArray;
            array.push(item);

            this.setState(
                {
                    selectedCategory: "Wallet",
                    allAccountsSelected: false,
                    selectedAccountsArray: array,
                    refresh: !refresh,
                    updated: true,
                },
                () => console.log("[PfmFilterModalV2] account added, current state is", this.state)
            );
        } else {
            //else, if it is a selected item
            // remove acc number from selected array

            // make a copy of the array
            const array = selectedAccountsArray;
            // get index of selected value in array
            const index = array.findIndex((account) => account.number === item.number);
            // let index = array.indexOf(item);
            if (index !== -1) {
                // remove selected value at index
                array.splice(index, 1);
                // update state array
                if (array.length == 0) {
                    // nothing has been selected left
                    this.setState({
                        allAccountsSelected: false,
                        selectedAccountsArray: [],
                        refresh: !refresh,
                        selectedCategory: selectedCardsArray.length > 0 ? "Wallet" : "All",
                        updated: true,
                    });
                } else {
                    this.setState({
                        selectedCategory: "Wallet",
                        allAccountsSelected: false,
                        selectedAccountsArray: array,
                        refresh: !refresh,
                        updated: true,
                    });
                }
            }

            // //check if none selected, all should be selected by default
            // if (selectedAccountsArray.length == 0) {
            //     this.setState({
            //         selectedCategory: "Wallet",
            //         allAccountsSelected: true,
            //         selectedAccountsArray: accountsArray,
            //         refresh: !refresh,
            //     });
            // }
        }
    };

    _onCardsListItemSelected = (item) => {
        const { selectedCardsArray, selectedAccountsArray, refresh } = this.state;
        console.log("[_onCardsListItemSelected] this.state", this.state);

        // if (!selectedCardsArray.includes(item)) {
        if (!selectedCardsArray.some((card) => card.number === item.number)) {
            console.log("[_onCardsListItemSelected] item not in array, adding..", this.state);
            // if it's not a selected item
            // add acc number to selected array

            // make a copy of the array
            var array = selectedCardsArray;
            array.push(item);

            this.setState({
                selectedCategory: "Wallet",
                allCardsSelected: false,
                selectedCardsArray: array,
                refresh: !refresh,
                updated: true,
            });
        } else {
            console.log("[_onCardsListItemSelected] item in array, removing..", this.state);
            //else, if it is a selected item
            // remove acc number from selected array

            // make a copy of the array
            var array = selectedCardsArray;
            // get index of selected value in array
            // let index = array.indexOf(item);
            const index = array.findIndex((card) => card.number === item.number);
            if (index !== -1) {
                // remove selected value at index
                array.splice(index, 1);
                // update state array
                if (array.length == 0) {
                    // nothing has been selected left
                    this.setState({
                        allCardsSelected: false,
                        selectedCardsArray: [],
                        refresh: !refresh,
                        selectedCategory: selectedAccountsArray.length ? "Wallet" : "All",
                        updated: true,
                    });
                } else {
                    this.setState({
                        selectedCategory: "Wallet",
                        allCardsSelected: false,
                        selectedCardsArray: [...array],
                        refresh: !refresh,
                        updated: true,
                    });
                }
            }

            // //check if none selected, all should be selected by default
            // if (selectedCardsArray.length == 0) {
            //     this.setState({
            //         selectedCategory: "Wallet",
            //         allCardsSelected: true,
            //         selectedCardsArray: cardsArray,
            //         refresh: !refresh,
            //     });
            // }
        }
    };

    renderAccountsListItem = ({ item, index }) => {
        const { accountsArray, selectedCategory, selectedAccountsArray } = this.state;

        return (
            <FilterListItem
                title={item.name}
                subtitle={item.number}
                subItem
                selected={
                    selectedAccountsArray.some((account) => account.number === item.number) ||
                    selectedAccountsArray.length == accountsArray.length ||
                    selectedCategory == "All"
                }
                onListItemPressed={() => this._onAccountsListItemSelected(item)}
            />
        );
    };

    renderCardsListItem = ({ item, index }) => {
        const { cardsArray, selectedCategory, selectedCardsArray } = this.state;

        return (
            <FilterListItem
                title={item.name}
                subtitle={item.number}
                subItem
                selected={
                    selectedCardsArray.some((account) => account.number === item.number) ||
                    selectedCardsArray.length == cardsArray.length ||
                    selectedCategory == "All"
                }
                onListItemPressed={() => this._onCardsListItemSelected(item)}
                creditCard
            />
        );
    };

    render() {
        const { showPfmFilterModal } = this.props;
        const {
            accountsArray,
            cardsArray,
            selectedCategory,
            selectedCardsArray,
            selectedAccountsArray,
            accountListLoaded,
            refresh,
        } = this.state;

        return (
            <Modal
                animationIn={"fadeIn"}
                animationOut={"fadeOut"}
                visible={showPfmFilterModal}
                style={{ margin: 0 }}
                hideModalContentWhileAnimating
                useNativeDriver
            >
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={!accountListLoaded}
                    analyticScreenName="Expenses_Filter"
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={24}
                        useSafeArea
                        header={
                            <HeaderLayout
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={24}
                                horizontalPaddingCustomRightValue={24}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Filter"
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <React.Fragment>
                                <ScrollView
                                    horizontal={false}
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled
                                >
                                    <View style={styles.container}>
                                        <FilterListItem
                                            title="Show All Expenses"
                                            boldTitle
                                            selected={selectedCategory == "All"}
                                            onListItemPressed={this._onAllSelected}
                                        />

                                        <FilterListItem
                                            title="Cash"
                                            boldTitle
                                            selected={
                                                selectedCategory == "Cash" ||
                                                selectedCategory == "All"
                                            }
                                            onListItemPressed={this._onCashSelected}
                                        />

                                        <View style={styles.divider} />

                                        {accountsArray && accountsArray.length > 0 && (
                                            <View>
                                                <FilterListItem
                                                    title="All Accounts"
                                                    boldTitle
                                                    selected={
                                                        selectedAccountsArray.length ==
                                                            accountsArray.length ||
                                                        selectedCategory == "All"
                                                    }
                                                    onListItemPressed={this._onAllAccountsSelected}
                                                />

                                                <FlatList
                                                    data={accountsArray}
                                                    extraData={refresh}
                                                    renderItem={this.renderAccountsListItem}
                                                    keyExtractor={(item) => item.number}
                                                />
                                            </View>
                                        )}

                                        <View style={styles.divider} />

                                        {cardsArray && cardsArray.length > 0 && (
                                            <View style={styles.containerCards}>
                                                <FilterListItem
                                                    title="All Cards"
                                                    boldTitle
                                                    selected={
                                                        selectedCardsArray.length ==
                                                            cardsArray.length ||
                                                        selectedCategory == "All"
                                                    }
                                                    onListItemPressed={this._onAllCardsSelected}
                                                />

                                                <FlatList
                                                    data={cardsArray}
                                                    extraData={refresh}
                                                    renderItem={this.renderCardsListItem}
                                                    keyExtractor={(item) => item.number}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </ScrollView>

                                <View style={styles.containerFooter}>
                                    <ActionButton
                                        backgroundColor={
                                            selectedCategory === "" ? LIGHTER_YELLOW : YELLOW
                                        }
                                        borderRadius={20}
                                        height={40}
                                        width={155}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Apply Filters"
                                                color={selectedCategory === "" ? GREY : BLACK}
                                            />
                                        }
                                        disabled={selectedCategory === ""}
                                        onPress={() => this._onPressApply()}
                                    />
                                </View>
                            </React.Fragment>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </Modal>
        );
    }
}
export default withModelContext(PfmFilterModalV2);

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    containerCards: { marginBottom: 80 },
    containerLoader: {
        alignItems: "center",
        bottom: 0,
        flex: 1,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    containerFooter: {
        position: "absolute",
        flex: 1,
        bottom: 36,
        width: width,
        alignItems: "center",
    },
    divider: {
        height: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: LIGHT_GREY,
        width: "100%",
        marginBottom: 24,
    },
});

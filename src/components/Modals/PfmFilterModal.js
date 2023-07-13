import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    FlatList,
} from "react-native";
import LottieView from "lottie-react-native";
// import ScrollPicker from "react-native-picker-scrollview";
//import { Picker, DatePicker } from 'react-native-wheel-pick';
import LinearGradient from "react-native-linear-gradient";

import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import { BLACK, BLUE, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import * as utility from "@utils/dataModel/utility";

// import { getTagsByRouting } from "@services/index";
import { pfmGetData } from "@services/index";

export const { width, height } = Dimensions.get("window");

class PfmFilterModal extends Component {
    state = {
        filterTabs: ["All", "Wallet", "Cash"],
        // accountsArray: [
        // 	{ title: "Current Account", accNo: "243590364532", selected: false },
        // 	{ title: "Savings Account", accNo: "353609470989", selected: false },
        // 	{ title: "Maybank Visa Platinum", accNo: "", selected: false }
        // ],
        selectedAccountsArray: [],
        selectedTab: "All",
        refresh: false,
        allAccAndCardsSelected: true,
        accountListLoaded: false,
    };

    componentDidMount = () => {
        // this._prepareCategories();
        if (this.state.accountsArray == null) {
            this._fetchAccountList();
        }
    };

    _fetchAccountList = async () => {
        let subUrl = "/pfm/accountCardList";

        pfmGetData(subUrl, false)
            .then(async (response) => {
                const result = response.data;
                console.log(subUrl + " ==> ");
                if (result != null) {
                    console.log(result);

                    this.setState({
                        accountsArray: result,
                        refresh: !this.state.refresh,
                        accountListLoaded: true,
                    });
                } else {
                    this.setState({
                        accountsArray: null,
                        refresh: !this.state.refresh,
                        accountListLoaded: true,
                    });
                }
            })
            .catch((Error) => {
                console.log("pfmGetData _fetchAccountList ERROR: ", Error);
            });
    };

    // _onPressSortBy = sortBy => {
    // 	console.log("[PfmFilterModal][_onPressSortBy]: " + sortBy);

    // 	this.setState({ sortByValue: sortBy });
    // };

    // // Check this when user presses "Apply" button
    // _getSortByQuery = () => {
    // 	console.log("[PfmFilterModal][_getSortByQuery]");

    // 	const { sortByValue } = this.state;
    // 	switch (sortByValue) {
    // 		case "popularity":
    // 			return "&sort=seenUser,desc";
    // 		case "latest":
    // 			return "&sort=updatedDate,desc";
    // 		case "oldest":
    // 			return "&sort=updatedDate,asc";
    // 		default:
    // 			return "";
    // 	}
    // };

    // _onPressApply = () => {
    // 	//combine sortByQuery and category filter query
    // 	const query = this._getFilterByCategoryQuery() + this._getSortByQuery();
    // 	const queryFormatted = query.replace(new RegExp(" ", "g"), "_");
    // 	console.log("[PfmFilterModal][_onPressApply]: " + queryFormatted);
    // 	this.props.queryBuilder(queryFormatted);

    // 	// set appliedBefore to true
    // 	this.setState({ appliedBefore: true });

    // 	// hide modal
    // 	this.props.togglePfmFilterModal();
    // };

    _dismissModalWithParam = (param) => {
        this.props.refreshWithFilter(param);
        this.props.togglePfmFilterModal();
    };

    _onPressClear = () => {
        //clear filter
        // this.props.queryBuilder("");

        //reset filter back to "All"
        this.setState({
            selectedTab: "All",
            selectedAccountsArray: [],
            allAccAndCardsSelected: true,
        });

        // hide modal
        // this.props.togglePfmFilterModal();
    };

    _onPressClose = () => {
        // if(!this.state.appliedBefore){
        //     //clear filter
        //     this.props.queryBuilder('');
        //     //reset sort back to "Latest"
        //     this.setState({ sortByValue: 'latest' });
        // }

        // this._onPressApply();

        // hide modal
        // this.props.togglePfmFilterModal();
        this._onPressApply();
    };

    _onPressApply = () => {
        const {
            accountsArray,
            selectedTab,
            refresh,
            allAccAndCardsSelected,
            selectedAccountsArray,
        } = this.state;

        switch (selectedTab) {
            case "All":
                this._dismissModalWithParam("");
                console.log("All");
                break;
            case "Wallet":
                if (allAccAndCardsSelected) {
                    //get list of all accounts and cards, insert into params
                    let accList = accountsArray.map((d, i) => {
                        return d.number;
                    });

                    let param = "&acctNos=" + accList.toString();

                    this._dismissModalWithParam(param);

                    console.log("wallet - all cards and wallet selected");
                    console.log("param: ", param);
                } else {
                    let param = "&acctNos=" + selectedAccountsArray.toString();

                    this._dismissModalWithParam(param);

                    console.log("wallet - specific accounts selected");
                    console.log("param: ", param);
                }
                break;
            case "Cash":
                let param = "&paymentMethod=CASH";
                this._dismissModalWithParam(param);
                console.log("Cash");
                break;
        }
    };

    // _prepareAccounts = async () => {
    //     const categoriesData = await this._getAccounts();

    //     console.log("[PfmFilterModal][_prepareCategories]");

    //     //var categoryNames = await categoriesData.map(function(item) { return item['name']; });
    //     var categoryNames = await categoriesData.flatMap(i => i.used > 0 ? [i.name.replace(new RegExp("_", 'g'), " ")] : []);
    //     categoryNames.unshift('');

    //     console.log(categoryNames);

    //     this.setState({
    //         categoryNames: categoryNames,
    //         fetchedFilters: true
    //     })

    //     console.log(this.state);
    // }

    // _getAccounts = async () => {
    //     try {
    //         const {
    //             data: { content: data }
    //         } = await getTagsByRouting(false, 'PROMOTION');
    //         console.log(data);
    //         return data;
    //     } catch (error) {
    //         this.setState({ getFilterCategoriesError: true });
    //         console.log(error);
    //         // todo: hide featured section?
    //         throw error;
    //     }
    // }

    _onToggleTab = (tabName) => {
        this.setState({ selectedTab: tabName });

        if (tabName == "Wallet") {
            this.setState({
                allAccAndCardsSelected: true,
                selectedAccountsArray: [],
                refresh: !this.state.refresh,
            });
        }
    };

    renderTabs() {
        return (
            <View
                style={{
                    width: width - 48,
                    height: 45,
                    borderRadius: 22.5,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "#7c7c7d",
                    flexDirection: "row",
                }}
            >
                <TouchableOpacity
                    onPress={() => this._onToggleTab(this.state.filterTabs[0])}
                    style={
                        this.state.selectedTab == this.state.filterTabs[0]
                            ? {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 22.5,
                                  backgroundColor: "#ffffff",
                              }
                            : {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                              }
                    }
                >
                    <Typo
                        color={
                            this.state.selectedTab == this.state.filterTabs[0]
                                ? "#000000"
                                : "#ffffff"
                        }
                        fontWeight={"bold"}
                        fontSize={13}
                    >
                        <Text>{this.state.filterTabs[0].toUpperCase()}</Text>
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => this._onToggleTab(this.state.filterTabs[1])}
                    style={
                        this.state.selectedTab == this.state.filterTabs[1]
                            ? {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 22.5,
                                  backgroundColor: "#ffffff",
                              }
                            : {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                              }
                    }
                >
                    <Typo
                        color={
                            this.state.selectedTab == this.state.filterTabs[1]
                                ? "#000000"
                                : "#ffffff"
                        }
                        fontWeight={"bold"}
                        fontSize={13}
                    >
                        <Text>{this.state.filterTabs[1].toUpperCase()}</Text>
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => this._onToggleTab(this.state.filterTabs[2])}
                    style={
                        this.state.selectedTab == this.state.filterTabs[2]
                            ? {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 22.5,
                                  backgroundColor: "#ffffff",
                              }
                            : {
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                              }
                    }
                >
                    <Typo
                        color={
                            this.state.selectedTab == this.state.filterTabs[2]
                                ? "#000000"
                                : "#ffffff"
                        }
                        fontWeight={"bold"}
                        fontSize={13}
                    >
                        <Text>{this.state.filterTabs[2].toUpperCase()}</Text>
                    </Typo>
                </TouchableOpacity>
            </View>
        );
    }

    _onAllAccAndCardsSelected = () => {
        const { refresh } = this.state;

        this.setState({
            allAccAndCardsSelected: true,
            selectedAccountsArray: [],
            refresh: !refresh,
        });
    };

    _onWalletListItemSelected = (accNo) => {
        const { selectedAccountsArray, refresh } = this.state;

        if (!selectedAccountsArray.includes(accNo)) {
            // if it's not a selected item
            // add acc number to selected array

            // make a copy of the array
            var array = selectedAccountsArray;
            array.push(accNo);

            this.setState({
                allAccAndCardsSelected: false,
                selectedAccountsArray: array,
                refresh: !refresh,
            });
        } else {
            //else, if it is a selected item
            // remove acc number from selected array

            // make a copy of the array
            var array = selectedAccountsArray;
            // get index of selected value in array
            let index = array.indexOf(accNo);
            if (index !== -1) {
                // remove selected value at index
                array.splice(index, 1);
                // update state array
                this.setState({
                    allAccAndCardsSelected: false,
                    selectedAccountsArray: array,
                    refresh: !refresh,
                });
            }

            //check if none selected, all should be selected by default
            if (selectedAccountsArray.length == 0) {
                this.setState({ allAccAndCardsSelected: true });
            }
        }
    };

    _renderWalletList() {
        const {
            allAccAndCardsSelected,
            accountsArray,
            selectedAccountsArray,
            refresh,
        } = this.state;

        return (
            <View style={{ marginTop: 38, marginBottom: 120 }}>
                <TouchableOpacity
                    style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 16 }}
                    onPress={() => this._onAllAccAndCardsSelected()}
                >
                    <View style={{ height: 20, width: 20, marginRight: 8 }}>
                        {allAccAndCardsSelected ? (
                            <Image
                                style={{ height: 20, width: 20 }}
                                source={require("@assets/icons/Tracker/checkboxChecked.png")}
                            />
                        ) : (
                            <Image
                                style={{ height: 20, width: 20 }}
                                source={require("@assets/icons/Tracker/checkbox.png")}
                            />
                        )}
                    </View>
                    <View>
                        <View style={{ height: 20, marginBottom: 4, justifyContent: "center" }}>
                            <Typo fontSize={14} textAlign={"left"} color={WHITE} lineHeight={20}>
                                <Text>All Accounts and Cards</Text>
                            </Typo>
                        </View>
                    </View>
                </TouchableOpacity>

                <FlatList
                    data={accountsArray}
                    extraData={refresh}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                marginBottom: 16,
                            }}
                            onPress={() => this._onWalletListItemSelected(item.number)}
                        >
                            <View style={{ height: 20, width: 20, marginRight: 8 }}>
                                {selectedAccountsArray.includes(item.number) ? (
                                    <Image
                                        style={{ height: 20, width: 20 }}
                                        source={require("@assets/icons/Tracker/checkboxChecked.png")}
                                    />
                                ) : (
                                    <Image
                                        style={{ height: 20, width: 20 }}
                                        source={require("@assets/icons/Tracker/checkbox.png")}
                                    />
                                )}
                            </View>
                            <View>
                                <View
                                    style={{
                                        height: 20,
                                        marginBottom: 4,
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typo
                                        fontSize={14}
                                        textAlign={"left"}
                                        color={WHITE}
                                        lineHeight={20}
                                    >
                                        <Text>{item.name}</Text>
                                    </Typo>
                                </View>
                                <Typo fontSize={12} textAlign={"left"} color={WHITE}>
                                    <Text>
                                        {item.type == "S" || item.type == "D"
                                            ? utility.formateAccountNumber(item.number, 12)
                                            : item.type == "C" ||
                                              item.type == "DEBIT" ||
                                              item.type == "J"
                                            ? utility.maskAccount(item.number)
                                            : item.type == "R" &&
                                              utility.maskAccount(item.number.substring(1, 16))}
                                    </Text>
                                </Typo>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.number}
                />
            </View>
        );
    }

    render() {
        const { showPfmFilterModal } = this.props;
        const { filterTabs, selectedTab, fetchedAccounts, accountListLoaded } = this.state;

        return (
            <Modal
                animationIn={"fadeIn"}
                animationOut={"fadeOut"}
                hasBackdrop={false}
                visible={showPfmFilterModal}
                style={{ margin: 0 }}
                hideModalContentWhileAnimating
                useNativeDriver
                transparent
                // onRequestClose={() => {
                //     Alert.alert('Modal has been closed.');
                // }}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={24}
                    useSafeArea={true}
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={24}
                            horizontalPaddingCustomRightValue={24}
                            headerLeftElement={
                                <TouchableOpacity onPress={() => this._onPressClose()}>
                                    {/* <Typo fontSize={14} fontWeight="600" color={WHITE} lineHeight={18}>
                                        <Text style={{color: "white"}}>Close</Text>
                                    </Typo> */}
                                    <Image
                                        source={require("@assets/icons/cancel_white.png")}
                                        style={{ height: 44, width: 44, marginLeft: -14 }}
                                    />
                                </TouchableOpacity>
                            }
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" color={WHITE} lineHeight={19}>
                                    <Text style={{ color: "white" }}>Filter</Text>
                                </Typo>
                            }
                            headerRightElement={
                                <TouchableOpacity onPress={() => this._onPressClear()}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        color={WHITE}
                                        lineHeight={18}
                                    >
                                        <Text style={{ color: "white" }}>Clear</Text>
                                    </Typo>
                                </TouchableOpacity>
                            }
                        />
                    }
                >
                    <React.Fragment>
                        {accountListLoaded ? (
                            <React.Fragment>
                                <ScrollView
                                    horizontal={false}
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Sort section  */}
                                    <View style={styles.containerSortTitle}>
                                        <Typo fontWeight="600" color={WHITE} textAlign="left">
                                            <Text>Accounts</Text>
                                        </Typo>
                                    </View>

                                    <View>
                                        <View style={{ width: "100%", alignItems: "center" }}>
                                            {this.renderTabs()}
                                        </View>

                                        {selectedTab == "Wallet" && this._renderWalletList()}
                                    </View>
                                </ScrollView>
                                <View
                                    style={{
                                        position: "absolute",
                                        flex: 1,
                                        bottom: 0,
                                        height: 130,
                                        width: width,
                                    }}
                                >
                                    <LinearGradient
                                        colors={["transparent", "black"]}
                                        style={{ flex: 1 }}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                    />
                                </View>
                                <View
                                    style={{
                                        position: "absolute",
                                        flex: 1,
                                        bottom: 36,
                                        width: width,
                                        alignItems: "center",
                                    }}
                                >
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        borderRadius={24}
                                        height={48}
                                        width={width - 48}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                color={BLACK}
                                                fontWeight="600"
                                                lineHeight={18}
                                            >
                                                <Text>Apply</Text>
                                            </Typo>
                                        }
                                        onPress={() => this._onPressApply()}
                                    />
                                </View>
                            </React.Fragment>
                        ) : (
                            <View style={styles.containerLoader}>
                                <LottieView
                                    source={require("@assets/lottie/maya_temp_loader.json")}
                                    autoPlay
                                    loop
                                />
                            </View>
                        )}
                    </React.Fragment>
                </ScreenLayout>
            </Modal>
        );
    }
}
export default PfmFilterModal;

const styles = StyleSheet.create({
    containerSortTitle: {
        marginTop: 26,
        marginBottom: 14,
    },
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
});

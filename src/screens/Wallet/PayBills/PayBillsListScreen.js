import React, { Component } from "react";
import { Text, View, FlatList, TouchableOpacity, Keyboard } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";
// import { getShadow } from "@utils/dataModel/utility";
// import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import { getPayees } from "@services/index";
import { sortByPropName, arraySearchByObjProp } from "@utils/array";
import SearchInput from "@components/SearchInput";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";
import { MEDIUM_GREY } from "@constants/colors";

const ListItem = ({ title, item, image, onPress }) => {
    console.log(title);
    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.9}
            style={Styles.listItem}
            key={item.key}
        >
            <TransferImageAndDetails title={title} image={image}></TransferImageAndDetails>
            <View style={Styles.bottomLine}></View>
        </TouchableOpacity>
    );
};

const BillerFavList = ({ list, createRenderItem }) => {
    return (
        <FlatList
            removeClippedSubviews={true}
            // getItemLayout={(data, index) => ({ length: 100, offset: 100 * index, index })}
            // initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={20}
            style={{ width: "100%" }}
            data={list}
            // extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={createRenderItem}
            testID={"BillerList"}
            accessibilityLabel={"favBillerList"}
            ListEmptyComponent={
                <NoDataView
                    title={"No Results Found"}
                    description={"We couldn't find any items matching your search."}
                />
            }
        />
    );
};

// No Data View Class
const NoDataView = ({ title, description }) => {
    return (
        <View style={Styles.noData}>
            <View style={Styles.noDataTitle}>
                <Typo
                    fontSize={18}
                    fontWeight="bold"
                    letterSpacing={0}
                    lineHeight={32}
                    color="#000000"
                >
                    <Text>{title}</Text>
                </Typo>
            </View>
            <View style={Styles.noDataDesc}>
                <Typo fontSize={14} lineHeight={20}>
                    <Text>{description}</Text>
                </Typo>
            </View>
        </View>
    );
};

class PayBillsListScreen extends Component {
    constructor(props) {
        super(props);
        console.log("PayBillsListScreen:", props.route.params);
        this.state = {
            bills: [],
            showSearchInput: false,
            searchText: "",
            isLoading: true,
        };
    }

    componentDidMount() {
        //
        this.fetchListData();
    }

    componentWillUnmount() {
        //
    }

    fetchListData = () => {
        getPayees()
            .then((response) => {
                const result = response.data;
                if (result != null) {
                    const list = result.resultList.map((item, index) => {
                        item.key = index;
                        return item;
                    });
                    this.setState({ bills: list, isLoading: false });
                } else {
                    this.setState({ isLoading: false });
                }
            })
            .catch((Error) => {
                this.setState({ isLoading: false });
                console.log("PayeeBillList ERROR: ", Error);
            });
    };

    processSelectedItem = (item) => {
        let requiredFieldArray = [];

        if (item.billAcctRequired == "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.bilAcctDispName, item.acctId, "bilAcct")
            );
        }

        if (item.billRefRequired == "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRefDispName, "", "billRef")
            );
        }

        return requiredFieldArray;
    };

    // TODO: remove fieldValue
    createRequiredFieldObj(fieldLabel, fieldValue, fieldName) {
        const alternateLabel =
            fieldName == "bilAcct" ? "Bill Account Number" : "Bill Reference Number";
        return {
            fieldLabel: fieldLabel,
            fieldValue: "",
            fieldName: fieldName,
            alternateLabel: alternateLabel,
        };
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        console.log("back now");
        this.props.navigation.goBack();
    };

    billerItemPress = (item) => {
        console.log(item);
        const requiredFields = this.processSelectedItem(item);
        this.props.navigation.navigate(navigationConstant.PAYBILLS_MODULE, {
            screen: navigationConstant.PAYBILLS_PAYEE_DETAILS,
            params: {
                ...this.props.route.params,
                billerInfo: item,
                requiredFields: [...requiredFields],
            },
        });
    };

    // SearchInput Event
    onSearchTextChange = (val) => {
        this.setState({ searchText: val });
    };

    doSearchToogle = () => {
        Keyboard.dismiss;
        this.setState({ showSearchInput: !this.state.showSearchInput, searchText: "" });
    };

    // -----------------------
    // GET UI
    // -----------------------

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <HeaderLabel>
                        <Text>Pay Bills</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    createRenderItem = ({ item, index }) => {
        return (
            <ListItem
                title={item.fullName}
                item={item}
                image={{
                    type: "url",
                    source: item.imageUrl,
                }}
                onPress={this.billerItemPress}
            />
        );
    };

    render() {
        console.log("render");
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
            >
                {!this.state.isLoading && (
                    <ScreenLayout
                        keyboardShouldPersistTaps="handled"
                        scrollable={false}
                        header={this.getHeaderUI()}
                        paddingHorizontal={0}
                    >
                        <View style={Styles.container}>
                            <View style={Styles.searchContainer}>
                                <SearchInput
                                    doSearchToogle={this.doSearchToogle}
                                    showSearchInput={this.state.showSearchInput}
                                    onSearchTextChange={this.onSearchTextChange}
                                    marginHorizontal={0}
                                />
                            </View>

                            {/* List */}
                            <View style={Styles.listContainer}>
                                {/* Fav Biller List */}

                                <BillerFavList
                                    list={sortByPropName(
                                        arraySearchByObjProp(
                                            this.state.bills,
                                            this.state.searchText,
                                            ["fullName"]
                                        ),
                                        "fullName"
                                    )}
                                    createRenderItem={this.createRenderItem}
                                />
                            </View>
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}
export default PayBillsListScreen;

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    listContainer: {
        width: "100%",
        alignItems: "flex-start",
        paddingHorizontal: 8,
        paddingBottom: 40,
        // borderWidth: 1,
        // borderColor: "#ff0000",
    },
    searchContainer: { width: "100%", paddingTop: 16, paddingHorizontal: 24 },
    noData: { flex: 1, paddingTop: 20, justifyContent: "center" },
    noDataDesc: { paddingTop: 10 },
    listItem: {
        paddingTop: 22,
        // paddingBottom: 17,
        // borderBottomWidth: 1,
        // borderBottomColor: "#cfcfcf",
        paddingLeft: 10,
        paddingRight: 10,
    },
    bottomLine: {
        paddingTop: 17,
        marginLeft: 6,
        marginRight: 6,
        // paddingRight: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
    },
};

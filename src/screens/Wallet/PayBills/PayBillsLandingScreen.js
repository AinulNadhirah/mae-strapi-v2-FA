import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    Text,
    View,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Keyboard,
    ScrollView,
} from "react-native";

import {
    PAYBILLS_MODULE,
    PAYBILLS_LIST_SCREEN,
    JOMPAY_MODULE,
    JOMPAY_PAYEE_DETAILS,
    JOMPAY_ENTER_AMOUNT,
    PAYBILLS_ENTER_AMOUNT,
    ZAKAT_TYPE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { GridButtons } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import SearchInput from "@components/SearchInput";
import RollingTab from "@components/Tabs/RollingTab";
import Typo from "@components/Text";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { getFavPayees, getFavJompay, getZakatFavList, invokeL3Challenge } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    ZAKAT,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_M2U_PAY,
    FA_BILLERS,
    FA_BILL_PAYMENT,
    FA_JOMPAY,
    FA_ZAKAT,
    FA_FAVOURITE_PAYMENT,
    PAY_BILLS,
    JOMPAY,
    NEW_PAYMENT,
    NO_RESULT_FOUND,
    NO_FAVOURITES_YET,
    ADD_BILLERS_AFTER_PAYMENT,
    FAVOURITES,
    BILL_ACCOUNT_NO,
    BILL_REF_NO,
} from "@constants/strings";

import { sortByPropName, arraySearchByObjProp } from "@utils/array";
import { addSpaceAfter4Chars } from "@utils/dataModel/utility";

import Assets from "@assets";

const ListItem = ({ title, subtitle, description, item, image, onPress }) => {
    return (
        <TouchableOpacity
            key={item.index}
            onPress={() => onPress(item)}
            activeOpacity={0.9}
            style={Styles.listItem}
        >
            <TransferImageAndDetails
                title={title}
                subtitle={subtitle}
                description={description}
                image={image}
            ></TransferImageAndDetails>
            <View style={Styles.bottomLine}></View>
        </TouchableOpacity>
    );
};

ListItem.propTypes = {
    description: PropTypes.any,
    image: PropTypes.any,
    item: PropTypes.shape({
        index: PropTypes.any,
    }),
    onPress: PropTypes.func,
    subtitle: PropTypes.any,
    title: PropTypes.any,
};

const JompayFavList = ({ list, onItemPress, isSearchMode }) => {
    return (
        <FlatList
            style={Styles.flatList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <ListItem
                    title={`${item.billerCode} - ${item.billerName}`}
                    subtitle={`Ref 1: ${addSpaceAfter4Chars(item.billRef1)}`}
                    description={item.acctHolderName}
                    item={item}
                    image={{ type: "local", source: Assets.jompayLogo }}
                    onPress={onItemPress}
                />
            )}
            testID="favJompayList"
            accessibilityLabel="favJompayList"
            ListEmptyComponent={
                <NoDataView
                    title={isSearchMode ? NO_RESULT_FOUND : NO_FAVOURITES_YET}
                    description={
                        isSearchMode
                            ? WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                            : ADD_BILLERS_AFTER_PAYMENT
                    }
                />
            }
        />
    );
};

JompayFavList.propTypes = {
    isSearchMode: PropTypes.any,
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

const BillerFavList = ({ list, onItemPress, isSearchMode }) => {
    return (
        <FlatList
            nestedScrollEnabled={true}
            style={Styles.flatList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item }) => (
                <ListItem
                    title={`${item.fullName}`}
                    subtitle={item.acctId}
                    description={item.mbbAccountName ? item.mbbAccountName : "-"}
                    item={item}
                    // image={{ uri: item.imageUrl }}
                    image={{
                        type: "url",
                        source: item.imageUrl,
                    }}
                    onPress={onItemPress}
                />
            )}
            testID="BillerList"
            accessibilityLabel="favBillerList"
            ListEmptyComponent={
                <NoDataView
                    title={isSearchMode ? NO_RESULT_FOUND : NO_FAVOURITES_YET}
                    description={
                        isSearchMode
                            ? WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                            : ADD_BILLERS_AFTER_PAYMENT
                    }
                />
            }
        />
    );
};

const ZakatFavList = ({ list, onItemPress, isSearchMode }) => {
    return (
        <FlatList
            nestedScrollEnabled={true}
            style={Styles.flatList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <ListItem
                    title={`${item.fullName}`}
                    subtitle={item.acctId}
                    description={item.mbbAccountName ? item.mbbAccountName : "-"}
                    item={item}
                    // image={{ uri: item.imageUrl }}
                    image={{
                        type: "url",
                        source: item.imageUrl,
                    }}
                    onPress={onItemPress}
                />
            )}
            testID="ZakatFavList"
            accessibilityLabel="favZakatList"
            ListEmptyComponent={
                <NoDataView
                    title={isSearchMode ? NO_RESULT_FOUND : NO_FAVOURITES_YET}
                    description={
                        isSearchMode
                            ? WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                            : ADD_BILLERS_AFTER_PAYMENT
                    }
                />
            }
        />
    );
};

ZakatFavList.propTypes = {
    list: PropTypes.array,
    onItemPress: PropTypes.func,
    isSearchMode: PropTypes.bool,
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

NoDataView.propTypes = {
    description: PropTypes.any,
    title: PropTypes.any,
};

class PayBillsLandingScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        console.log("PayBillsLandingScreen:", props.route.params);

        if (props.route.params.data) {
            if (props.route.params.data.cardType) {
                // cardType, acctType
                this.prevSelectedAccount = {
                    ...props.route.params.data,
                    accountType: "card",
                    number: props.route.params.data.cardNo,
                    type: props.route.params.data.acctType,
                };
            } else {
                this.prevSelectedAccount = {
                    ...props.route.params.data,
                    number: props.route.params.data.acctNo,
                    type: props.route.params.data.acctType,
                };
            }

            this.fromModule = this.props.route.params.fromModule;
            this.fromScreen = this.props.route.params.fromScreen;
            this.onGoBack = this.props.route.params.onGoBack;
        }

        const { width, height } = Dimensions.get("window");
        this.state = {
            bills: [],
            jompay: [],
            zakatFaves: [],

            error: "",
            width,
            height,
            showSearchInput: false,
            searchText: "",
            isLoading: true,
            contentOffset: 0,
            zakatFavListLoaded: false,
            jompayFavListLoaded: false,
            // Tab Bar related
            currentTabIndex: 0,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    componentDidMount() {
        this.fetchFavBillerList();
        this.analyticsLogCurrentTab(this.state.currentTabIndex);
    }

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    onCancelLogin = () => {
        console.log("[PayBillsLandingScreen] >> [onCancelLogin]");

        this.props.navigation.goBack();
    };

    // -----------------------
    // API CALL
    // -----------------------

    fetchFavBillerList = async () => {
        console.log("[PayBillsLandingScreen] >> [fetchFavBillerList]");
        const { getModel } = this.props;
        const isL3ChallengeNeeded = await invokeL3Challenge(getModel);
        if (isL3ChallengeNeeded) return;
        try {
            const response = await getFavPayees();
            const result = response.data;
            if (result != null) {
                let sortedArray = sortByPropName([...result.resultList], "fullName");
                sortedArray = sortedArray.map((item, index) => {
                    return { ...item, index };
                });
                this.setState({ bills: sortedArray, isLoading: false });
            }
        } catch (error) {
            this.showLoader(false);
            console.log("PayeeBillList ERROR: ", Error);
            this.setState({ isLoading: false });
        }
    };

    fetchFavJompayList = () => {
        console.log("[PayBillsLandingScreen] >> [fetchFavJompayList]");
        this.setState({ isLoading: true });
        getFavJompay()
            .then((response) => {
                const result = response.data;
                if (result != null) {
                    let sortedArray = sortByPropName([...result.payeeList], "billerName");
                    sortedArray = sortedArray.map((item, index) => {
                        return { ...item, index };
                    });
                    this.setState({
                        jompay: sortedArray,
                        isLoading: false,
                        jompayFavListLoaded: true,
                    });
                } else {
                    this.setState({ isLoading: false });
                }
            })
            .catch((Error) => {
                console.log("JompayList ERROR: ", Error);
                this.setState({ isLoading: false });
            });
    };

    fetchZakatFavList = () => {
        console.log("[PayBillsLandingScreen] >> [fetchZakatFavList]");

        const { zakatFaves } = this.state;

        // Avoid calling API again if data already fetched
        if (zakatFaves instanceof Array && zakatFaves.length > 0) return;

        getZakatFavList()
            .then((response) => {
                const result = response.data;
                if (result != null) {
                    let sortedArray = sortByPropName([...result.resultList], "fullName");
                    sortedArray = sortedArray.map((item, index) => {
                        return { ...item, index };
                    });
                    this.setState({
                        zakatFaves: sortedArray,
                        isLoading: false,
                        zakatFavListLoaded: true,
                    });
                } else {
                    this.setState({ isLoading: false });
                }
            })
            .catch((error) => {
                console.log("[PayBillsLandingScreen][fetchZakatFavList] >> Exception: ", error);
                this.setState({ isLoading: false });
            });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onTabPressed = (idx) => {
        console.log("[PayBillsLandingScreen] >> [onTabPressed]");
        this.setState({ currentTabIndex: idx });
        this.setState({ showSearchInput: false, searchText: "" });
        this.analyticsLogCurrentTab(idx);
        this.fetchData(idx);
    };

    fetchData = (idx) => {
        const { zakatFavListLoaded, jompayFavListLoaded } = this.state;
        if (idx === 1 && !jompayFavListLoaded) {
            this.fetchFavJompayList();
        }
        if (idx === 2 && !zakatFavListLoaded) {
            this.fetchZakatFavList();
        }
    };

    onTabPressedLogEvents = () => {
        switch (this.state.currentTabIndex) {
            case 0:
                return FA_BILLERS;
            case 1:
                return FA_JOMPAY;
            case 2:
                return FA_ZAKAT;
            default:
                return "";
        }
    };

    newBillerClicked = () => {
        console.log("newBillerClicked");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: this.onTabPressedLogEvents(),
            [FA_ACTION_NAME]: FA_BILL_PAYMENT,
        });
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: PAYBILLS_LIST_SCREEN,
            params: {
                isFav: false,
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
                onGoBack: this.onGoBack,
            },
        });
    };

    newJomPAYClicked = () => {
        console.log("newJomPAYClicked");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: this.onTabPressedLogEvents(),
            [FA_ACTION_NAME]: FA_JOMPAY,
        });
        this.props.navigation.navigate(JOMPAY_MODULE, {
            screen: JOMPAY_PAYEE_DETAILS,
            params: {
                isFav: false,
                billerInfo: { billerCode: "", billRef1: "", billRef2: "" },
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
                onGoBack: this.onGoBack,
            },
        });
    };

    newZakatClicked = () => {
        console.log("[PayBillsLandingScreen] >> [newZakatClicked]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: this.onTabPressedLogEvents(),
            [FA_ACTION_NAME]: FA_ZAKAT,
        });
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: ZAKAT_TYPE,
            params: {
                zakatFlow: true,
                isFav: false,
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
            },
        });
    };

    favJompayItemPress = (item) => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: FA_JOMPAY,
            [FA_ACTION_NAME]: FA_FAVOURITE_PAYMENT,
        });
        this.props.navigation.navigate(JOMPAY_MODULE, {
            screen: JOMPAY_ENTER_AMOUNT,
            params: {
                extraInfo: {
                    billerCode: item.billerCode,
                    billRef1: item.billRef1,
                    billRef2: item.billRef2,
                    billerName: item.billerName,
                    isFav: true,
                    effectiveDateType: "today",
                    amount: "0.00",
                    secure2uValidateData: {},
                    prevSelectedAccount: this.prevSelectedAccount,
                    fromModule: this.fromModule,
                    fromScreen: this.fromScreen,
                    onGoBack: this.onGoBack,
                },
                billerInfo: item,
                selectedAccount: { accountType: "" },
            },
        });
    };

    favBillerItemPress = (item) => {
        console.log("[PayBillsLandingScreen] >> [favBillerItemPress]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: FA_BILLERS,
            [FA_ACTION_NAME]: FA_FAVOURITE_PAYMENT,
        });
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: PAYBILLS_ENTER_AMOUNT,
            params: {
                isFav: true,
                isEbp: item.ebpp,
                billerInfo: item,
                requiredFields: this.processSelectedItem(item),
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
                onGoBack: this.onGoBack,
            },
        });
    };

    favZakatItemPress = (item) => {
        console.log("[PayBillsLandingScreen] >> [favZakatItemPress]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_PAY,
            [FA_TAB_NAME]: FA_ZAKAT,
            [FA_ACTION_NAME]: FA_FAVOURITE_PAYMENT,
        });
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: ZAKAT_TYPE,
            params: {
                zakatFlow: true,
                isFav: true,
                billerInfo: item,
                requiredFields: [
                    this.createRequiredFieldObj(item.bilAcctDispName, item.acctId, "bilAcct"),
                ],
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
                onGoBack: this.onGoBack,
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

    onBackPress = () => {
        console.log("back now");
        this.props.navigation.goBack();
    };

    // -----------------------
    // OTHERS
    // -----------------------

    analyticsLogCurrentTab = (index) => {
        console.log("[PayBillsLandingScreen] >> [analyticsLogCurrentTab]");

        if (index === 0) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_M2U_PAY,
                [FA_TAB_NAME]: FA_BILLERS,
            });
        } else if (index === 1) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_M2U_PAY,
                [FA_TAB_NAME]: FA_JOMPAY,
            });
        } else {
            // TODO: Add correct values when they are provided by Business.
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_M2U_PAY,
                [FA_TAB_NAME]: FA_ZAKAT,
            });
        }
    };

    createRequiredFieldObj(fieldLabel, fieldValue, fieldName) {
        const alternateLabel = fieldName === "bilAcct" ? BILL_ACCOUNT_NO : BILL_REF_NO;
        return {
            fieldLabel,
            fieldValue,
            fieldName,
            alternateLabel,
        };
    }

    // TODO:
    processSelectedItem = (item) => {
        const requiredFieldArray = [];

        if (item?.billAcctRequired === "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.bilAcctDispName, item.acctId, "bilAcct")
            );
        }

        if (item?.billRefRequired === "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRefDispName, "", "billRef")
            );
        }
        /*
        if (
            item.billRef2Required === "0" &&
            item.billRefRequired === "1" &&
            item?.billRef2DispName !== item?.billRefDispName
        ) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRefDispName, "", "billRef")
            );
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRef2DispName, "", "billRef2")
            );
        } else if (item.billRef2Required === "0" && requiredFieldArray.length < 4) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRef2DispName, "", "billRef2")
            );
        }
*/
        return requiredFieldArray;
    };

    // -----------------------
    // GET UI
    // -----------------------

    renderHeader = () => {
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

    render() {
        console.log("contentOffset:", this.state.contentOffset);

        const {
            currentTabIndex,
            showSearchInput,
            isLoading,
            searchText,

            zakatFaves,
        } = this.state;
        let billerList = [];

        if (currentTabIndex == 0) {
            billerList = arraySearchByObjProp(this.state.bills, this.state.searchText, [
                "fullName",
                "acctId",
                "acctHolderName",
            ]);
        }

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={isLoading}
            >
                {!isLoading && (
                    <ScreenLayout
                        scrollable={false}
                        header={this.renderHeader()}
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <View style={Styles.container}>
                            {/* Tab */}
                            {!showSearchInput && (
                                <View style={Styles.tabContainer}>
                                    <RollingTab
                                        defaultTabIndex={0}
                                        currentTabIndex={currentTabIndex}
                                        tabs={["BILLERS", "JOMPAY", "ZAKAT"]}
                                        onTabPressed={this.onTabPressed}
                                    />
                                </View>
                            )}

                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                ref={(ref) => {
                                    this.scrollView = ref;
                                }}
                                onScrollEndDrag={({ nativeEvent }) =>
                                    this.setState({
                                        contentOffset: nativeEvent.contentOffset,
                                    })
                                }
                                contentContainerStyle={Styles.containerScrollView}
                                stickyHeaderIndices={showSearchInput ? [0] : [1]}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                            >
                                {!showSearchInput && (
                                    <>
                                        {/* New payment */}
                                        <View style={Styles.newPaymentTitleContaier}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={NEW_PAYMENT}
                                            />
                                        </View>

                                        {/* Grid Buttons */}
                                        <View>
                                            <View style={Styles.newPaymentButtonContaier}>
                                                <GridButtons
                                                    data={{
                                                        key: "1",
                                                        title: PAY_BILLS,
                                                        source: Assets.icPayBill,
                                                    }}
                                                    callback={this.newBillerClicked}
                                                />
                                                <GridButtons
                                                    data={{
                                                        key: "2",
                                                        title: JOMPAY,
                                                        source: Assets.icJompay,
                                                    }}
                                                    callback={this.newJomPAYClicked}
                                                />
                                                <GridButtons
                                                    data={{
                                                        key: "3",
                                                        title: ZAKAT,
                                                        source: Assets.zakatIcon,
                                                    }}
                                                    callback={this.newZakatClicked}
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}

                                {/* Favourites */}
                                <View style={{ backgroundColor: MEDIUM_GREY }}>
                                    <View style={Styles.favTitle}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={FAVOURITES}
                                        />
                                    </View>
                                    <View style={Styles.searchContainer}>
                                        <SearchInput
                                            doSearchToogle={this.doSearchToogle}
                                            showSearchInput={this.state.showSearchInput}
                                            onSearchTextChange={this.onSearchTextChange}
                                            marginHorizontal={0}
                                        />
                                    </View>
                                </View>

                                {/* List */}
                                <View style={Styles.listContainer}>
                                    {/* Fav Biller List */}
                                    {currentTabIndex == 0 && (
                                        <BillerFavList
                                            list={billerList}
                                            onItemPress={this.favBillerItemPress}
                                            isSearchMode={!!this.state.searchText}
                                        />
                                    )}

                                    {/* Fav JomPAY List */}
                                    {currentTabIndex == 1 && (
                                        <JompayFavList
                                            list={arraySearchByObjProp(
                                                this.state.jompay,
                                                this.state.searchText,
                                                ["billerName", "acctHolderName", "billRef1"]
                                            )}
                                            onItemPress={this.favJompayItemPress}
                                            isSearchMode={!!this.state.searchText}
                                        />
                                    )}

                                    {/* Fav Zakat List */}
                                    {currentTabIndex == 2 && (
                                        <ZakatFavList
                                            list={zakatFaves}
                                            onItemPress={this.favZakatItemPress}
                                            isSearchMode={!!searchText}
                                        />
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

PayBillsLandingScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        setParams: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            data: PropTypes.shape({
                acctNo: PropTypes.any,
                acctType: PropTypes.any,
                cardNo: PropTypes.any,
                cardType: PropTypes.any,
            }),
            fromModule: PropTypes.any,
            fromScreen: PropTypes.any,
            onGoBack: PropTypes.any,
        }),
    }),
    updateModel: PropTypes.func,
};

export default withModelContext(PayBillsLandingScreen);

const generalPaddingHorizontal = 22;

const Styles = {
    container: {
        flex: 1,
    },
    flatList: {
        width: "100%",
    },
    containerScrollView: {
        width: "100%",
        paddingHorizontal: 0,
    },
    tabContainer: {
        marginTop: 10,
        width: "100%",
        marginHorizontal: generalPaddingHorizontal,
    },
    newPaymentContaier: {
        marginHorizontal: generalPaddingHorizontal,
    },
    newPaymentTitleContaier: {
        paddingTop: 29,
        marginHorizontal: generalPaddingHorizontal,
    },
    newPaymentButtonContaier: {
        paddingTop: 16,
        flexDirection: "row",
        flex: 1,
        marginLeft: 22,
        paddingBottom: 40,
    },
    favTitle: {
        marginHorizontal: generalPaddingHorizontal,
    },
    searchContainer: {
        paddingTop: 16,
        marginHorizontal: 24,
    },
    listContainer: {
        width: "100%",
        paddingHorizontal: generalPaddingHorizontal - 14,
    },
    noData: {
        flex: 1,
        paddingTop: 20,
        justifyContent: "center",
    },
    noDataDesc: {
        paddingTop: 10,
    },
    listItem: {
        paddingTop: 22,
        paddingLeft: 10,
        paddingRight: 10,
    },
    bottomLine: {
        paddingTop: 17,
        marginLeft: 6,
        marginRight: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
    },
};

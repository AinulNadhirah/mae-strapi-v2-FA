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
    REQUEST_TO_PAY_STACK,
    REQUEST_TO_PAY_ID_SCREEN,
    REQUEST_TO_PAY_DETAILS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { GridButtons } from "@components/Common";
import DynamicImageSmall from "@components/Common/DynamicImageSmall";
import { HighlightText } from "@components/Common/HighlightText";
import { StatusTextView } from "@components/Common/StatusTextView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import SearchInput from "@components/SearchInput";
import RollingTab from "@components/Tabs/RollingTab";
import Typography from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { getFavPayees, getPendingMoneyList, getPastMoneyList } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import { WHITE, FADE_GREY, VERY_LIGHT_GREY, BLACK } from "@constants/colors";
import {
    WE_COULDNT_FIND_ANY_ITEMS_MATCHING,
    DUITNOW_REQUEST,
    NEW,
    RECEIVE,
    SENT,
    PAST,
    FAVOURITES,
    REQUEST_MONEY,
} from "@constants/strings";
import * as Strings from "@constants/strings";

import { sortByPropName, arraySearchByObjProp } from "@utils/array";
import { getShadow } from "@utils/dataModel/utility";

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

const ListItemOthers = ({ item, onPress, index, length }) => {
    return (
        <TouchableOpacity
            key={item.index}
            onPress={() => onPress(item)}
            activeOpacity={0.9}
            style={length === index + 1 ? Styles.mainContainerLast : Styles.mainContainer}
        >
            <View style={Styles.mainContainerView}>
                <View style={Styles.innerView}>
                    <View style={Styles.statusView}>
                        <StatusTextView status={item.status} />

                        <DynamicImageSmall data={item} />
                    </View>
                    <View style={Styles.titleView}>
                        <HighlightText
                            highlightStyle={Styles.modelTextBold}
                            searchWords={[item.highlightText]}
                            style={Styles.modelText}
                            textToHighlight={item.title}
                            numberOfLines={2}
                        />
                        <Typography
                            fontSize={14}
                            fontWeight="normal"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            text={item.reference}
                            color={FADE_GREY}
                        />
                    </View>
                    <View style={Styles.dateView}>
                        <Typography
                            fontSize={12}
                            fontWeight="normal"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={FADE_GREY}
                            textAlign="left"
                            text={item.date}
                        />
                    </View>
                </View>
            </View>
            <View style={Styles.bottomLine}></View>
        </TouchableOpacity>
    );
};

const OtherList = ({ list, onItemPress, isSearchMode }) => {
    return (
        <FlatList
            style={Styles.fullWidth}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <ListItemOthers
                    item={item}
                    onPress={onItemPress}
                    index={index}
                    length={list.length}
                />
            )}
            testID={"favJompayList"}
            accessibilityLabel={"favJompayList"}
            ListEmptyComponent={
                <NoDataView
                    title={isSearchMode ? "No Results Found" : "No Favourites Yet"}
                    description={
                        isSearchMode
                            ? WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                            : "Add billers to your favourites list at the end of a successful payment. This will help you access them quicker in the future."
                    }
                />
            }
        />
    );
};

const FavList = ({ list, onItemPress, isSearchMode }) => {
    return (
        <FlatList
            nestedScrollEnabled={true}
            style={Styles.fullWidth}
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
            testID={"BillerList"}
            accessibilityLabel={"favBillerList"}
            ListEmptyComponent={
                <NoDataView
                    title={isSearchMode ? "No Results Found" : "Need to ask for money?"}
                    description={
                        isSearchMode
                            ? WE_COULDNT_FIND_ANY_ITEMS_MATCHING
                            : "Get your dues paid, in a less awkward way. Save your Favourites to access them in a few quick taps."
                    }
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
                <Typography
                    fontSize={18}
                    fontWeight="bold"
                    letterSpacing={0}
                    lineHeight={32}
                    color={BLACK}
                >
                    <Text>{title}</Text>
                </Typography>
            </View>
            <View style={Styles.noDataDesc}>
                <Typography fontSize={14} lineHeight={20}>
                    <Text>{description}</Text>
                </Typography>
            </View>
        </View>
    );
};

class RequestToPayDetailsScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);

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
            receivedList: [],
            receiveFavList: [],
            error: "",
            width: width,
            height: height,
            currentTabIndex: 0,
            showSearchInput: false,
            searchText: "",
            isLoading: false,
            contentOffset: 0,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    onCancelLogin = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        if (this.state.receiveFavList && this.state.receiveFavList.length < 1) {
            this.fetchFavBillerList();
        }
        this.analyticsLogCurrentTab(this.state.currentTabIndex);
    }

    // -----------------------
    // API CALL
    // -----------------------

    getPendingSendRequestList = async () => {
        const subUrl = "/sendRcvMoney/list/pending-past?pageSize=1000&label=PENDING&page=0";
        try {
            const response = await getPendingMoneyList(subUrl);
            const responseObject = response?.data;
            if (responseObject?.resultList.length >= 1) {
                this.setState({ loader: false, refreshing: false });
                this._updateScreenData(responseObject?.resultList);
            } else {
                this.setState({
                    loader: false,
                    refreshing: false,
                    receivedList: [],
                });
            }
        } catch (error) {
            this.setState({ loader: false, refreshing: false });
        }
    };

    _updateScreenData = (resultList) => {
        const dataList = [];
        for (let i = 0; i < resultList.length; i++) {
            const item = resultList[i];
            if (item) {
                const receiverName = item?.receiverName ?? "";
                const senderName = item?.senderName ?? "";
                item.receiverName = receiverName;
                item.senderName = senderName;
                let title = "";
                if (item.isSender) {
                    if (item.status === "PENDING") {
                        title = `${receiverName}${Strings.HAS_REQUESTED}\n${Strings.CURRENCY}${item.formattedAmount} from you.`;
                    } else {
                        title = `${receiverName}${Strings.HAS_REQUESTED}\n${Strings.CURRENCY}${item.formattedAmount} from you.`;
                    }
                } else {
                    if (item.status === "PENDING") {
                        title = `${Strings.YOU_REQUESTED_MONEY_FROM}${Strings.CURRENCY}${item.formattedAmount} from ${senderName}.`;
                    } else {
                        title = `${Strings.YOU_REQUESTED_MONEY_FROM}${Strings.CURRENCY}${item.formattedAmount} from ${senderName}.`;
                    }
                }
                item.title = title;
                if (item.originalStatus === "REJECT") {
                    item.detailTitle = item.isSender
                        ? Strings.YOUR_REQUEST_HAS_BEEN_REJECTED_BY
                        : Strings.YOU_VE_CANCELLED_YOUR_REQUEST;
                } else if (item.originalStatus === "EXPIRED") {
                    item.detailTitle = item.isSender
                        ? Strings.YOUR_REQUEST_HAS_EXPIRED
                        : Strings.YOUR_REQUEST_HAS_EXPIRED;
                } else {
                    item.detailTitle = item.isSender
                        ? Strings.YOU_VE_RECEIVED_REQUEST_FROM
                        : Strings.YOU_VE_REQUESTED_MONEY_FROM;
                }

                item.highlightText = Strings.CURRENCY + item.formattedAmount;
                item.reference = "Mike’s Birthday Gift";
                item.paymentDetails = "Pay soon";
                item.date =
                    "Expires on " +
                    (item.trxDate === null || item.trxDate === undefined
                        ? item.createdDate
                        : item.trxDate);
                item.name = item.isSender ? receiverName : senderName;
                item.originalStatus = item.status;
                // || item.originalStatus === "APROVED"
                item.status =
                    item.originalStatus === "PENDING" || item.originalStatus === "APROVED"
                        ? item.isSender
                            ? "Pending"
                            : "Outgoing"
                        : item.originalStatus === "PAID"
                        ? "Completed"
                        : item.originalStatus === "REJECT"
                        ? "Rejected"
                        : item.originalStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Completed";
                item.flow = "PENDING";
                item.image = item.isSender ? item.receiverProfilePic : item.senderProfilePic;
                dataList.push(item);
            }
        }
        this.setState({ receivedList: dataList, refreshing: false }, () => {
            this._getPastSendRequestList();
        });
    };

    _getPastSendRequestList = () => {
        const subUrl = "/sendRcvMoney/list/pending-past?pageSize=1000&label=PAST&page=0";

        getPastMoneyList(subUrl)
            .then((response) => {
                let responseObject = response?.data;
                if (responseObject?.resultList.length >= 1) {
                    this.setState({ loader: false, refreshing: false });
                    this._updatePastScreenData(responseObject?.resultList);
                } else {
                    this.setState({ loader: false, refreshing: false, dataArray: [] });
                }
            })
            .catch((error) => {
                this.setState({ loader: false, refreshing: false });
            });
    };

    _updatePastScreenData = (resultList) => {
        const dataList = [];
        const { receivedList } = this.state;
        for (let i = 0; i < resultList.length; i++) {
            const item = resultList[i];
            const receiverName = item.receiverName ? item.receiverName : "";
            const senderName = item.senderName ? item.senderName : "";
            item.receiverName = receiverName;
            item.senderName = senderName;
            item.originalStatus = item.status;
            let title = "";
            let dateCaption = "Created ";
            if (item.isSender) {
                if (item.type === "SEND") {
                    title = `You've sent ${Strings.CURRENCY}${item.formattedAmount} to ${receiverName}.`;
                    dateCaption = "Sent on ";
                } else if (item.status === "REJECT") {
                    title = `You've rejected ${Strings.CURRENCY}${item.formattedAmount} request from ${receiverName}.`;
                    dateCaption = "Created ";
                } else if (item.status === "CANCELLED") {
                    title = `You've cancelled ${Strings.CURRENCY}${item.formattedAmount} request from ${receiverName}.`;
                    dateCaption = "Created ";
                } else {
                    title = `You've sent ${Strings.CURRENCY}${item.formattedAmount} to ${receiverName}.`;
                    dateCaption = "Sent on ";
                }
            } else {
                if (item.status === "CANCELLED") {
                    title = `You've cancelled ${Strings.CURRENCY}${item.formattedAmount} request from ${receiverName}.`;
                    dateCaption = "Created ";
                } else if (item.status === "REJECT") {
                    title = `${senderName} rejected ${Strings.CURRENCY}${item.formattedAmount} request from you.`;
                    dateCaption = "Created ";
                } else {
                    title = `You've received ${Strings.CURRENCY}${item.formattedAmount} from ${senderName}.`;
                    dateCaption = "Received on ";
                }
            }
            item.title = title;
            let detailTitle = "";
            if (item.isSender && item.isSender !== null) {
                if (item.status === "REJECT") {
                    detailTitle = "You've rejected\nthe request from ";
                } else {
                    detailTitle = Strings.YOU_VE_SENT_MONEY_TO;
                }
            } else {
                if (item.status === "REJECT") {
                    detailTitle = "Your request\n rejected by";
                } else if (item.originalStatus === "PAID") {
                    detailTitle = Strings.YOU_VE_RECEIVED_MONEY_FROM1;
                } else if (item.originalStatus === "REJECT") {
                    item.detailTitle = item.isSender
                        ? Strings.YOUR_REQUEST_HAS_BEEN_REJECTED_BY
                        : Strings.YOU_VE_CANCELLED_YOUR_REQUEST;
                } else if (item.originalStatus === "EXPIRED") {
                    item.detailTitle = item.isSender
                        ? Strings.YOUR_REQUEST_HAS_EXPIRED
                        : Strings.YOUR_REQUEST_HAS_EXPIRED;
                } else {
                    item.detailTitle = item.isSender
                        ? Strings.YOU_VE_RECEIVED_REQUEST_FROM
                        : Strings.YOU_VE_REQUESTED_MONEY_FROM;
                }
            }
            item.detailTitle = detailTitle;
            item.highlightText = Strings.CURRENCY + item.formattedAmount;
            item.date =
                dateCaption +
                (item.trxDate === null || item.trxDate === undefined || item.status === "REJECT"
                    ? item.createdDate
                    : item.trxDate);
            item.name = item.isSender ? receiverName : senderName;

            item.status =
                item.originalStatus === "PAID"
                    ? "Completed"
                    : item.originalStatus === "REJECT"
                    ? "Rejected"
                    : item.originalStatus === "CANCELLED"
                    ? "Cancelled"
                    : "Completed";
            item.flow = "PAST";
            item.image = item.isSender ? item.receiverProfilePic : item.senderProfilePic;
            dataList.push(item);
        }
        this.setState({ receivedList: [...receivedList, ...dataList] });
    };

    fetchFavBillerList = () => {
        getFavPayees()
            .then((response) => {
                const result = response?.data;
                if (result !== null) {
                    const sortedArray = sortByPropName([...result.resultList], "fullName").map(
                        (item, index) => {
                            return { ...item, index };
                        }
                    );
                    this.setState({ receiveFavList: sortedArray });
                }
                // this.fetchFavJompayList();
            })
            .catch((Error) => {
                console.log("PayeeBillList ERROR: ", Error);
            });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onTabPressed = (ind) => {
        const { receivedList } = this.state;
        this.setState({ currentTabIndex: ind }, () => {
            if (ind && ind === 1 && receivedList && receivedList.length < 1) {
                this.getPendingSendRequestList();
            }
        });
        this.setState({ showSearchInput: false, searchText: "" });
        this.analyticsLogCurrentTab(ind);
    };

    newRequestMoney = () => {
        this.props.navigation.navigate(REQUEST_TO_PAY_STACK, {
            screen: REQUEST_TO_PAY_ID_SCREEN,
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

    _onListClick = (item, isReplace = false) => {
        const transferParams = {
            transferFlow: 15,
            accountName: "",
            toAccount: "",
            toAccountCode: "",
            accounts: "",
            fromAccount: "",
            fromAccountCode: "",
            fromAccountName: "",
            formattedToAccount: "",
            image: "",
            imageBase64: false,
            bankName: "Maybank",
            amount: "0.00",
            formattedAmount: "0.00",
            reference: "",
            minAmount: 0.0,
            maxAmount: 999999.99,
            amountError: Strings.AMOUNT_ERROR,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.TRANSFER,
            receiptTitle: Strings.OWN_ACCOUNT_TRANSFER,
            recipientName: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isFutureTransfer: false,
            isRecurringTransfer: false,
            toAccountBank: "Maybank",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            swiftCode: null,
            routeFrom: "",
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            phoneNumber: "",
            name: "",
            contactObj: "",
            notificationClickHandled: false,
        };

        if (item) {
            if (item.isSender && item.originalStatus === "PENDING") {
                const title =
                    item.title.toString().substring(0, item.title.toString().length - 1) +
                    (item.note && item.note.length >= 1 ? " for " + item.note + "." : ".");
                this.setState({
                    item: item,
                    incomingRequestTitle: title,
                    showIncomingRequestPopup: false,
                });
                // this.props.onShowIncomingRequestPopupPress(title, item);
                this.props.navigation.replace(REQUEST_TO_PAY_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            } else if (item.isSender && item.originalStatus === "APROVED") {
                const title =
                    item.title +
                    (item.note && item.note.length >= 1 ? " for " + item.note + "." : "");
                this.setState({
                    item: item,
                    incomingRequestTitle: title,
                    showIncomingRequestPopup: false,
                });
                //this.props.onPayAcceptedRequest(item);
                this.props.navigation.replace(REQUEST_TO_PAY_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            } else {
                // is replace to accomodate notification centre
                if (isReplace) {
                    this.props.navigation.replace(REQUEST_TO_PAY_DETAILS_SCREEN, {
                        item,
                        transferParams,
                    });
                } else {
                    this.props.navigation.navigate(REQUEST_TO_PAY_DETAILS_SCREEN, {
                        item,
                        transferParams,
                    });
                }
            }
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    };

    favBillerItemPress = (item) => {
        console.log("favBillerItemPress", item);
        // this.props.navigation.navigate(PAYBILLS_MODULE, {
        //     screen: PAYBILLS_ENTER_AMOUNT,
        //     params: {
        //         isFav: true,
        //         billerInfo: item,
        //         requiredFields: [
        //             this.createRequiredFieldObj(item.bilAcctDispName, item.acctId, "bilAcct"),
        //         ],
        //         prevSelectedAccount: this.prevSelectedAccount,
        //         fromModule: this.fromModule,
        //         fromScreen: this.fromScreen,
        //         onGoBack: this.onGoBack,
        //     },
        // });
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
        this.props.navigation.goBack();
    };

    // -----------------------
    // OTHERS
    // -----------------------

    analyticsLogCurrentTab = (index) => {
        // logEvent(FA_VIEW_SCREEN, {
        //     [FA_SCREEN_NAME]: index === 0 ? "M2U - Pay" : "M2U - Transfer",
        //     [FA_TAB_NAME]: index === 0 ? "Billers" : "JomPAY",
        // });
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
                        <Text>{DUITNOW_REQUEST}</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    render() {
        const billerList =
            this.state.currentTabIndex === 0
                ? arraySearchByObjProp(this.state.receiveFavList, this.state.searchText, [
                      "fullName",
                      "acctId",
                      "acctHolderName",
                  ])
                : [];

        if (this.state.showSearchInput) {
            // const newHight = this.state.height - 225;
            // containerStyleHeight = {
            //     height: newHight,
            //     // borderWidth: 2,
            //     // borderColor: "red",
            // };
        }

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
            >
                {!this.state.isLoading && (
                    <ScreenLayout
                        scrollable={false}
                        header={this.getHeaderUI()}
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <View style={Styles.container}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                ref={(ref) => {
                                    this.scrollView = ref;
                                }}
                                // onContentSizeChange={() => {
                                //     if (this.state.showSearchInput) {
                                //         this.scrollView.scrollToEnd();
                                //     }
                                // }}
                                onScrollEndDrag={({ nativeEvent }) =>
                                    this.setState({ contentOffset: nativeEvent.contentOffset })
                                }
                                contentContainerStyle={Styles.containerScrollView}
                                stickyHeaderIndices={this.state.showSearchInput ? [0] : [1]}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                            >
                                {/* Tab */}

                                <View>
                                    {!this.state.showSearchInput && (
                                        <View style={Styles.tabContainer}>
                                            <RollingTab
                                                defaultTabIndex={0}
                                                currentTabIndex={this.state.currentTabIndex}
                                                tabs={[NEW, RECEIVE, SENT, PAST]}
                                                onTabPressed={this.onTabPressed}
                                            />
                                        </View>
                                    )}
                                    {/* New payment */}
                                    {!this.state.showSearchInput &&
                                        this.state.currentTabIndex === 0 && (
                                            <View>
                                                <View style={Styles.newPaymentTitleContaier}></View>
                                                <View>
                                                    <View style={Styles.newPaymentButtonContaier}>
                                                        <GridButtons
                                                            data={{
                                                                key: "1",
                                                                title: REQUEST_MONEY,
                                                                source: Assets.icRTPsendMoney,
                                                            }}
                                                            callback={this.newRequestMoney}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                </View>

                                {/* </View> */}

                                {/* Favourites */}
                                {this.state.currentTabIndex === 0 && (
                                    <View style={{ backgroundColor: MEDIUM_GREY }}>
                                        <View style={Styles.favTitle}>
                                            <Typography
                                                fontSize={16}
                                                fontWeight="bold"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                textAlign="left"
                                            >
                                                {FAVOURITES}
                                            </Typography>
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
                                )}
                                {/* List */}
                                <View style={Styles.listContainer}>
                                    {/* Fav New List */}
                                    {this.state.currentTabIndex === 0 && (
                                        <FavList
                                            list={billerList}
                                            onItemPress={this.favBillerItemPress}
                                            isSearchMode={this.state.searchText ? true : false}
                                        />
                                    )}

                                    {/* Receive List */}
                                    {this.state.currentTabIndex === 1 && (
                                        <View style={Styles.flatListContainer}>
                                            <OtherList
                                                list={this.state.receivedList}
                                                onItemPress={this._onListClick}
                                                isSearchMode={this.state.searchText ? true : false}
                                            />
                                        </View>
                                    )}
                                    {/* Sent List */}
                                    {this.state.currentTabIndex === 2 && (
                                        <View style={Styles.flatListContainer}>
                                            <OtherList
                                                list={this.state.receivedList}
                                                onItemPress={this._onListClick}
                                                isSearchMode={this.state.searchText ? true : false}
                                            />
                                        </View>
                                    )}
                                    {/* Past List */}
                                    {this.state.currentTabIndex === 3 && (
                                        <View style={Styles.flatListContainer}>
                                            <OtherList
                                                list={this.state.receivedList}
                                                onItemPress={this._onListClick}
                                                isSearchMode={this.state.searchText ? true : false}
                                            />
                                        </View>
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
export default withModelContext(RequestToPayDetailsScreen);

const generalPaddingHorizontal = 22;

const Styles = {
    container: {
        flex: 1,
    },
    fullWidth: { width: "100%" },
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
    newPaymentTitleContaier: { paddingTop: 29, marginHorizontal: generalPaddingHorizontal },
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
    noDataDesc: { paddingTop: 10 },
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
        borderBottomColor: VERY_LIGHT_GREY,
    },

    mainContainer: {
        width: "88%",
        height: 161,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 14,
        marginTop: 2,
        marginLeft: 24,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainContainerLast: {
        width: "88%",
        height: 161,
        borderRadius: 8,
        backgroundColor: WHITE,
        marginBottom: 100,
        marginTop: 2,
        marginLeft: 24,
        ...getShadow({
            elevation: 4, // android
        }),
    },
    mainOuterView: {
        marginRight: 24,
    },
    mainContainerView: {
        flex: 1,
    },
    innerView: {
        flex: 1,
        borderRadius: 12,
        marginLeft: 23,
        marginRight: 21,
        justifyContent: "space-between",
    },

    titleText: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },
    statusView: {
        width: "100%",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dateText: {
        fontFamily: "montserrat",
        fontSize: 9,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
    },
    titleView: {
        marginTop: -7,
        width: "85%",
    },
    dateView: {
        marginTop: 5,
    },
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: BLACK,
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: BLACK,
    },

    flatListContainer: {
        marginBottom: 30,
        marginTop: 30,
    },
};

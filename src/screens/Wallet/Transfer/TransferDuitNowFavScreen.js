import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Dimensions, StyleSheet } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { showErrorToast, hideToast } from "@components/Toast";
import TransferTabItem from "@components/TransferTabItem";

import { GATransfer } from "@services/analytics/analyticsTransfer";
import { duitnowStatusInquiry, getGenericFavoritesList } from "@services/index";

import * as Strings from "@constants/strings";

import { formatICNumber, formatMobileNumbersList } from "@utils/dataModel/utility";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");

const NEW_TRANSFER_ITEMS = Object.freeze([
    {
        title: Strings.BANKS,
        imageSource: Assets.icInstant,
        key: 1,
    },
    {
        title: Strings.OTHERS,
        imageSource: Assets.icDuitNow,
        key: 2,
    },
]);

class TransferDuitNowFavScreen extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        activeTabIndex: PropTypes.number.isRequired,
        route: PropTypes.object.isRequired,
        toggleSearchMode: PropTypes.func.isRequired,
    };

    state = {
        mayaUserId: 0,
        duitNowList: [],
        update: 1,
        error: "",
        rand: 1,
        showSearchInput: false,
        searchInputText: "",
        fromAccount: "",
        screenDate: {},
        data: {},
        duitNowFullList: [],
        searchResultHeight: height - 50,
        activeTabIndex: 0,
        index: 0,
        renderCurrentTab: false,
        isLoadingFavouritesItems: true,
        isFavouritesListSuccessfullyFetched: false,
    };

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferDuitNowFavScreen] >> [componentDidMount] : ");
        this._updateDataInScreen();

        const { activeTabIndex, index } = this.props;
        const { duitNowFullList } = this.state;

        // Render if first tab
        if (activeTabIndex === index) {
            console.log("Render tab: " + index);
            if (duitNowFullList && duitNowFullList.length == 0) {
                this.getGenericFavoritesListApi();
            }
        }
    }

    /***
     * componentDidUpdate
     * Handle every new Props received event
     */
    componentDidUpdate(nextProps) {
        console.log("[TransferDuitNowFavScreen] >> [componentDidUpdate] : ");
        if (this.props.activeTabIndex !== nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex === this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                if (this.state.duitNowFullList.length === 0) {
                    this.getGenericFavoritesListApi();
                }
            }
        }
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[TransferDuitNowFavScreen] >> [_updateDataInScreen] ==> ");
        const fromAccount = this.props?.fromAccount ?? null;
        console.log("TransferDuitNowFavScreen FromAccount ==> ", fromAccount);
        const screenDate = this.props?.screenDate ?? null;
        console.log("TransferDuitNowFavScreen screenDate ==> ", screenDate);
        const data = this.props?.data ?? null;
        console.log("TransferDuitNowFavScreen data ==> ", data);
        this.setState({ fromAccount: fromAccount, data: data, screenDate: screenDate });
    };

    /**
     *_onNewTransferClick
     * on New Transfer Click
     */
    _onNewTransferClick = () => {
        console.log("[TransferDuitNowFavScreen] >> [_onNewTransferClick] ==> ");
        hideToast();

        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("_onNewTransferClick routeFrom : ", routeFrom);
        const transferParams = {
            transferFlow: 3,
            transferTypeName: "Third Party Transfer",
            isMaybankTransfer: true,
            accountName: "",
            fromAccount: this.state.fromAccount,
            fromAccountCode: "",
            fromAccountName: "",
            toAccount: "",
            formattedToAccount: "",
            image: "",
            bankName: "Maybank",
            amount: "0.00",
            formattedAmount: "0.00",
            reference: "",
            minAmount: 0.0,
            maxAmount: 999999.99,
            amountError: Strings.AMOUNT_ERROR,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.TRANSFER,
            receiptTitle: Strings.THIRD_PARTY_TRANSFER,
            recipientName: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isRecurringTransfer: false,
            isFutureTransfer: false,
            toAccountBank: "Maybank",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            routeFrom: routeFrom,
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            getListCalled: false,
            prevData: this.props?.data ?? {},
            activeTabIndex: 2,
        };
        console.log("TransferDuitNowFavScreen NewTransfer transferParams ==> ", transferParams);
        this.props.navigation.navigate(navigationConstant.TRANSFER_SELECT_BANK, {
            transferParams,
        });
    };

    /**
     *_onAccountItemClick
     * on Account Item Click
     */
    _onAccountItemClick = (item) => {
        console.log("[TransferDuitNowFavScreen] >> [_onAccountItemClick] ==> ");
        if (item.key === "INSTANT") {
            this._onNewTransferClick();
        } else if (item.key === "INSTANT") {
            this._onNewTransferClick();
        }
    };

    /**
     * getGenericFavoritesListApi
     * get Generic Favorites List Api for DuitNow
     */
    getGenericFavoritesListApi = () => {
        console.log("[TransferDuitNowFavScreen] >> [getGenericFavoritesListApi] : ");
        /*Get Favorite List*/
        console.log("getGenericFavoritesListApi");
        hideToast();
        let subUrl = "/favorites/list?indicator=DUITNOW";
        getGenericFavoritesList(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log("/favorites/list?indicator=FUND_TRANSFER favoriteList ==> ", result);
                if (result && result !== null && Array.isArray(result)) {
                    let filteredList = [];

                    result.map((accountItem, index) => {
                        let obj = {};
                        const idTypeCode = accountItem.idTypeCode;
                        const idValue = accountItem.accountNo;
                        const idValueFormatted =
                            idTypeCode === "MBNO"
                                ? formatMobileNumbersList(idValue)
                                : idTypeCode === "NRIC"
                                ? formatICNumber(idValue)
                                : idValue;
                        obj.id = index;
                        obj.emailId = accountItem.emailId;

                        obj.idNo = idValue;
                        obj.accountName = accountItem.accountName;
                        obj.accountNo = idValue;
                        obj.acquirerId = accountItem.acquirerId;
                        obj.tacIndicator = accountItem.tacIndicator;
                        obj.duitnow = accountItem.duitnow;
                        obj.fundTransfer = accountItem.fundTransfer;
                        obj.idValueFormatted = idValueFormatted;
                        obj.idType = accountItem.idType;
                        obj.idTypeCode = accountItem.idTypeCode;
                        obj.nickName = accountItem.nickName;
                        obj.recipientName = accountItem.recipientName;
                        obj.statusCode = accountItem.statusCode;
                        obj.tacIndent = accountItem.tacIndent;
                        obj.name = accountItem.nickName;
                        obj.description1 = idValueFormatted;
                        obj.description2 = accountItem.idType;
                        // obj.image = "icDuitNowCircle.png";
                        obj.image = {
                            image: "icDuitNowCircle.png",
                            imageName: "icDuitNowCircle.png",
                            imageUrl: "icDuitNowCircle.png",
                            shortName: accountItem.accountName,
                            type: true,
                        };

                        console.log("duitNowList ACCOUNT ", obj);
                        filteredList.push(obj);
                    });
                    console.log("duitNowList Favourite List ", filteredList);
                    this.setState({
                        getListCalled: true,
                        duitNowList: filteredList,
                        duitNowFullList: filteredList,
                        searchResultHeight: filteredList.length * 125,
                        isLoadingFavouritesItems: false,
                        isFavouritesListSuccessfullyFetched: true,
                    });
                } else {
                    this.setState({
                        getListCalled: true,
                        isLoadingFavouritesItems: false,
                        isFavouritesListSuccessfullyFetched: false,
                    });
                }
            })
            .catch((Error) => {
                console.log(" favoriteListApi ERROR: ", Error);
                this.setState({
                    getListCalled: true,
                    isLoadingFavouritesItems: false,
                    isFavouritesListSuccessfullyFetched: false,
                });
            });
    };

    /**
     * _onDuitNowItemClick
     * on Duit Now Item Click
     */
    _onDuitNowItemClick = (_, item) => {
        console.log("[TransferOwnAccount] >> [_onAccountListClick]", item);
        GATransfer.selectActionFavList("DuitNow", item?.idTypeCode === "ACCT" ? "Banks" : "Others");
        hideToast();
        this.duitnowIdInquiry(item, true);
    };

    /**
     * duitnowIdInquiry
     * duitnow Id Inquiry call
     */
    duitnowIdInquiry = (item, transferFav) => {
        console.log("[TransferDuitNowFavScreen] >> [duitnowIdInquiry] : ");
        console.log("duitnowIdInquiry ==> ");
        hideToast();
        const { screenDate } = this.state;
        const { idNo, idTypeCode, idType } = item;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("duitnowIdInquiry routeFrom : ", routeFrom);
        let subUrl = "/duitnow/status/inquiry?proxyId=" + idNo + "&proxyIdType=" + idTypeCode;
        console.log("duitnowIdInquiry ==> ", item);
        duitnowStatusInquiry(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log("/duitnow/status/inquiry data ==> ", result);
                if (result != null) {
                    const resultData = result.result;
                    if (result.code === 200 && resultData) {
                        const resultData = result.result;

                        const transferAuthenticateRequired =
                            item.tacIndicator === "1" ? true : false;

                        let transferParams = {
                            transferFlow: 12,
                            transferTypeName: "Duit Now",
                            transactionMode: "Duit Now",
                            isMaybankTransfer: false,
                            transferRetrievalRefNo: resultData.retrievalRefNo,
                            transferProxyRefNo: resultData.proxyRefNo,
                            serviceFee: resultData.paymentMode?.serviceFee,
                            transferRegRefNo: resultData.regRefNo,
                            transferAccType: resultData.accType,
                            transferBankCode: resultData.bankCode,
                            recipientNameMaskedMessage: resultData.recipientNameMaskedMessage,
                            recipientNameMasked: resultData.recipientNameMasked,
                            nameMasked: resultData.nameMasked,
                            actualAccHolderName: resultData.actualAccHolderName,
                            accountName: resultData.accHolderName,
                            transferBankName: resultData.bankName,
                            transferAccHolderName: resultData.accHolderName,
                            transferLimitInd: resultData.limitInd,
                            transferMaybank: resultData.maybank,
                            transferOtherBank: !resultData.maybank,
                            transferAccNumber: resultData.accNo,
                            formattedToAccount: resultData.accNo,
                            idValueFormatted: item.idValueFormatted,
                            idValue: idNo,
                            idType: idTypeCode,
                            idTypeText: idType,
                            transferFav: transferFav,
                            image: item.image,
                            bankName: resultData.maybank ? "Maybank" : "",
                            imageBase64: true,
                            amount: "0.00",
                            formattedAmount: "0.00",
                            reference: "",
                            minAmount: 0.0,
                            maxAmount: 999999.99,
                            amountError: Strings.AMOUNT_ERROR,
                            screenLabel: Strings.ENTER_AMOUNT,
                            screenTitle: Strings.DUITNOW,
                            fromAccount: this.state.fromAccount,
                            fromAccountCode: "",
                            fromAccountName: "",
                            toAccount: resultData.accNo,
                            receiptTitle: Strings.DUITNOW,
                            recipientName: resultData.accHolderName,
                            transactionDate: "",
                            transactionStartDate: "",
                            transactionEndDate: "",
                            isRecurringTransfer: false,
                            isFutureTransfer: false,
                            toAccountBank: resultData.maybank ? "Maybank" : "",
                            formattedFromAccount: "",
                            transferType: null,
                            transferSubType: null,
                            twoFAType: null,
                            mbbbankCode: null,
                            routeFrom: routeFrom,
                            endDateInt: 0,
                            startDateInt: 0,
                            transactionResponseError: "",
                            tacIndicator: item.tacIndicator,
                            transferAuthenticateRequired: transferAuthenticateRequired,
                            selectedIDTypeIndex: 0,
                            functionsCode: resultData.maybank
                                ? transferAuthenticateRequired
                                    ? 26
                                    : 25
                                : transferAuthenticateRequired
                                ? 29
                                : 28,
                            prevData: this.props?.data ?? {},
                            activeTabIndex: 2,
                        };
                        console.log("DuitNowEnterID transferParams ==> ", transferParams);
                        this.props.navigation.navigate(navigationConstant.DUITNOW_ENTER_AMOUNT, {
                            transferParams,
                        });

                        // this.props.navigation.navigate(navigationConstant.DUITNOW_MODULE, {
                        //     screen: navigationConstant.DUITNOW_ENTER_AMOUNT,
                        //     params: {
                        //         transferParams,
                        //     },
                        // });
                    } else {
                        showErrorToast({
                            message: resultData.statusDesc,
                        });
                    }
                } else {
                    showErrorToast({
                        message: Strings.DUITNOW_ID_INQUIRY_FAILED,
                    });
                }
            })
            .catch((Error) => {
                showErrorToast({
                    message: Strings.DUITNOW_ID_INQUIRY_FAILED,
                });
                console.log("ERROR: ", Error);
            });
    };

    /**
     * _duitNowOpenClick
     * _duitNow Open Click
     */
    _duitNowOpenClick = () => {
        console.log("[TransferDuitNowFavScreen] >> [_duitNowOpenClick] : ");
        hideToast();

        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("_duitNowOpenClick routeFrom : ", routeFrom);

        let transferParams = {
            transferFlow: 12,
            transferTypeName: "Duit Now",
            transactionMode: "Duit Now",
            isMaybankTransfer: false,
            transferRetrievalRefNo: "",
            transferProxyRefNo: "",
            transferRegRefNo: "",
            transferAccType: "",
            transferBankCode: "",
            accountName: "",
            transferBankName: "",
            transferAccHolderName: "",
            transferLimitInd: "",
            transferMaybank: "",
            transferOtherBank: "",
            transferAccNumber: "",
            formattedToAccount: "",
            fromAccount: this.state.fromAccount,
            fromAccountCode: "",
            fromAccountName: "",
            // image: "icDuitNowCircle.png",
            image: {
                image: "icDuitNowCircle.png",
                imageName: "icDuitNowCircle.png",
                imageUrl: "icDuitNowCircle.png",
                shortName: "Duit Now",
                type: true,
            },
            bankName: "",
            idTypeText: "",
            imageBase64: false,
            amount: "0.00",
            formattedAmount: "0.00",
            reference: "",
            minAmount: 0.0,
            maxAmount: 999999.99,
            amountError: Strings.AMOUNT_ERROR,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.DUITNOW,
            toAccount: "",
            receiptTitle: Strings.DUITNOW,
            recipientName: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isRecurringTransfer: false,
            isFutureTransfer: false,
            toAccountBank: "",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            routeFrom: routeFrom,
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            transferFav: false,
            selectedIDTypeIndex: 0,
            prevData: this.props?.data ?? {},
            activeTabIndex: 2,
        };
        this.props.navigation.navigate(navigationConstant.DUITNOW_ENTER_ID, {
            transferParams,
        });
    };

    /**
     * navigateToDuitNow
     * navigate To DuitNow Id Screen
     */
    navigateToDuitNow = () => {
        console.log("[TransferDuitNowFavScreen] >> [navigateToDuitNow] : ");
        hideToast();
        this.props.navigation.navigate(navigationConstant.DUITNOW_MODULE, {
            screen: navigationConstant.DUITNOW_ENTER_ID,
        });
    };

    _checkSelectedTransferType = (key) => {
        switch (key) {
            case 1:
                GATransfer.selectActionNewTransfer("DuitNow", "Banks");
                this._onNewTransferClick();
                break;
            case 2:
                GATransfer.selectActionNewTransfer("DuitNow", "Others");
                this._duitNowOpenClick();
                break;
            default:
                return;
        }
    };

    render() {
        const { isLoadingFavouritesItems, isFavouritesListSuccessfullyFetched, duitNowList } =
            this.state;

        return (
            <View style={styles.container}>
                <TransferTabItem
                    newTransferItems={NEW_TRANSFER_ITEMS}
                    favouritesItems={duitNowList}
                    isLoadingFavouritesItems={isLoadingFavouritesItems}
                    isFavouritesListSuccessfullyFetched={isFavouritesListSuccessfullyFetched}
                    onNewTransferButtonPressed={this._checkSelectedTransferType}
                    onFavouritesItemPressed={this._onDuitNowItemClick}
                    toggledSearchMode={this.props.toggleSearchMode}
                />
            </View>
        );
    }
}

TransferDuitNowFavScreen.propTypes = {
    activeTabIndex: PropTypes.any,
    data: PropTypes.object,
    fromAccount: PropTypes.any,
    index: PropTypes.any,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
    }),
    screenDate: PropTypes.any,
};
export default TransferDuitNowFavScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Dimensions, findNodeHandle } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { GridButtons } from "@components/Common";
import OwnAccountList from "@components/Others/OwnAccountList";
import OwnAccountShimmerView from "@components/Others/OwnAccountShimmerView";
import SearchInput from "@components/SearchInput";
import Typography from "@components/Text";
import { showErrorToast, hideToast, errorToastProp } from "@components/Toast";

import { duitnowStatusInquiry, getGenericFavoritesList } from "@services";
import ApiManager, { METHOD_GET, TIMEOUT } from "@services/ApiManager";

import { TOKEN_TYPE_M2U } from "@constants/api";
import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { arraySearchByObjProp } from "@utils/array";
import { formatICNumber, formatMobileNumbersList } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const { height } = Dimensions.get("window");

class TransferOverseasScreen extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            mayaUserId: 0,
            favoriteList: [],
            error: "",
            bakongButton: { key: "BAKONG", title: Strings.BAKONG, source: Assets.icBakong },
            showSearchInput: false,
            searchInputText: "",
            fromAccount: "",
            screenDate: {},
            data: {},
            favoriteListFull: [],
            searchResultHeight: height - 50,
            activeTabIndex: 0,
            index: 0,
            renderCurrentTab: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferOverseasScreen] >> [componentDidMount] : ");
        this._updateDataInScreen();

        const { activeTabIndex, index } = this.props;
        const { favoriteListFull } = this.state;

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this._updateDataInScreenAlways();
        });
        // Render if first tab
        if (activeTabIndex === index) {
            console.log("Render tab: " + index);
            if (favoriteListFull && favoriteListFull.length == 0) {
                // this.getGenericFavoritesListApi();
                this._getBakongFavorites();
            }
        }
    }

    /***
     * componentWillReceiveProps
     * Handle every new Props received event
     */
    componentDidUpdate(nextProps) {
        console.log("[TransferOverseasScreen] >> [componentWillReceiveProps] : ");
        // to handle triggering API + rendering only when tab is visible
        if (this.props.activeTabIndex != nextProps.activeTabIndex) {
            if (nextProps.activeTabIndex == this.props.index) {
                //render view
                console.log("trigger render tab: " + nextProps.activeTabIndex);
                if (this.state.favoriteListFull.length == 0) {
                    // this.getGenericFavoritesListApi();
                    this._getBakongFavorites();
                }
            }
        }
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferOverseasScreen] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * onScreenFocus
     * Handle on screen focus event
     */
    onScreenFocus = () => {
        console.log("[TransferOverseasScreen] >> [onScreenFocus] : ");
        // const { renderCurrentTab } = this.state;
        // // this.getGenericFavoritesListApi();
        // if (renderCurrentTab) {
        // }
    };

    /**
     *_updateDataInScreenAlways
     * update Data In Screen Always
     */
    _updateDataInScreenAlways = () => {
        console.log("[TransferOverseasScreen] >> [TransferOverseasScreen] : ");
    };

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[TransferOverseasScreen] >> [_updateDataInScreen] ==> ");
        const fromAccount = this.props?.fromAccount ?? null;
        console.log("TransferOverseasScreen FromAccount ==> ", fromAccount);
        const screenDate = this.props?.screenDate ?? null;
        console.log("TransferOverseasScreen screenDate ==> ", screenDate);
        const data = this.props?.data ?? null;
        console.log("TransferOverseasScreen data ==> ", data);
        this.setState({ fromAccount: fromAccount, data: data, screenDate: screenDate });
    };

    /**
     *_onNewBakongTransferClick
     * on New Transfer Click
     */
    _onNewBakongTransferClick = () => {
        console.log("[TransferOverseasScreen] >> [_onNewBakongTransferClick] ==> ");
        hideToast();

        const { screenDate } = this.state;
        const routeFrom = screenDate?.routeFrom ?? "Dashboard";
        console.log("_onNewBakongTransferClick routeFrom : ", routeFrom);
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
            activeTabIndex: 3,
        };
        console.log("TransferOverseasScreen NewTransfer transferParams ==> ", transferParams);
        this.props.navigation.navigate("BakongEnterMobileNo", {
            transferParams,
        });
    };

    /**
     *_onSearchTextChange
     * on Search Text Change
     */
    _onSearchTextChange = (text) => {
        this.scrollToList();
        const list = arraySearchByObjProp(this.state.favoriteListFull, text, [
            "idNo",
            "nickname",
            "mobileNum",
        ]);
        console.log("account ==> ", list);
        this.setState({
            searchInputText: text,
            favoriteList: text && text.length >= 1 ? list : this.state.favoriteListFull,
        });
    };

    _handleSearchByKeyword = (text) => {
        const searchResultByKeyword = this.state.favoriteListFull.filter(
            (item) => text.search(item.nickname) !== -1
        );
        this.setState({
            favouritesArray: searchResultByKeyword,
        });
    };

    /**
     * scrollToList
     * scroll To List
     */
    scrollToList = () => {
        console.log("[TransferOverseasScreen] >> [scrollToList] ==> ");
        requestAnimationFrame(() => {
            if (this.favouritesTextList && this.myScroll) {
                this.favouritesTextList.measureLayout(findNodeHandle(this.myScroll), (x, y) => {
                    this.myScroll.scrollTo({ x: 0, y: y, animated: true });
                });
            }
        });
    };

    /**
     * scrollToTopView
     * scroll To Top View
     */
    scrollToTopView = () => {
        console.log("[TransferOverseasScreen] >> [scrollToTopView] : ");
        requestAnimationFrame(() => {
            if (this.topView && this.myScroll) {
                this.topView.measureLayout(findNodeHandle(this.myScroll), (x, y) => {
                    this.myScroll.scrollTo({ x: 0, y: y, animated: true });
                });
            }
        });
    };

    /**
     * doSearchToogle
     * Toggle SearchInput Event
     */
    doSearchToogle = () => {
        console.log("[TransferOverseasScreen] >> [doSearchToogle] : ");
        const { showSearchInput, searchInputText, favoriteListFull } = this.state;
        if (favoriteListFull && favoriteListFull.length >= 1) {
            console.log(
                "[TransferOverseasScreen] >> [doSearchToogle] showSearchInput  ==> ",
                showSearchInput
            );
            const list = showSearchInput
                ? this.state.favoriteListFull
                : searchInputText.length < 3
                ? this.state.favoriteListFull
                : [];

            if (!showSearchInput) {
                this.scrollToList();
            } else {
                this.scrollToTopView();
            }
            console.log("duitNow account  ==> ", list);
            let searchResultHeight = height;

            console.log("favoriteListFull  ==> ", favoriteListFull);
            if (!showSearchInput) {
                if (favoriteListFull && favoriteListFull.length > 3) {
                    searchResultHeight = favoriteListFull.length * 125;
                } else {
                    searchResultHeight = height - (height / 10) * 1;
                }

                this.scrollToList();
            } else {
                this.scrollToTopView();
            }
            console.log("height  ==> ", height);
            console.log("searchResultHeight  ==> ", searchResultHeight);
            this.setState({
                searchResultHeight: searchResultHeight,
                showSearchInput: !showSearchInput,
                searchInputText:
                    showSearchInput || searchInputText.length <= 1 ? "" : searchInputText,
                favoriteList: list.slice(),
            });
        }
    };

    // Get Bakong Favorites
    _getBakongFavorites = async () => {
        try {
            const response = await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/payment/favorites`,
                data: null,
                reqType: METHOD_GET,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: false,
            });
            console.log("[_getBakongFavorites] response: ", response);

            // array mapping
            const favoriteList = response.data.favoriteItems.map((item, index) => ({
                id: index,
                name: item.regName,
                description1: item.mobileNum,
                description2: "Bakong Wallet",
                image: {
                    image: "icBakong.png",
                    imageName: "icBakong.png",
                    imageUrl: "icBakong.png",
                    shortName: item.nickName,
                    type: true,
                },
                mobileNo: item.mobileNum,
                idNo: item.idNum,
                address1: item.address1,
                address2: item.address2,
                bankName: item.bankName,
                country: item.country,
                nationality: item.nationality,
                nickname: item.nickname,
                favorite: true,
            }));

            this.setState({
                favoriteList,
                favoriteListFull: favoriteList,
                getListCalled: true,
                searchResultHeight: favoriteList.length * 125,
            });
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message: error.message ?? "Unable to fetch list of favorites.",
                })
            );
            ErrorLogger(error);

            this.setState({
                getListCalled: true,
            });

            // go back
            this.props.navigation.goBack();
        }
    };

    /**
     * getGenericFavoritesListApi
     * get Generic Favorites List Api for DuitNow
     */
    getGenericFavoritesListApi = () => {
        console.log("[TransferOverseasScreen] >> [getGenericFavoritesListApi] : ");
        /*Get Favorite List*/
        console.log("getGenericFavoritesListApi");
        hideToast();
        let subUrl = "/favorites/list?indicator=DUITNOW";
        getGenericFavoritesList(subUrl)
            .then(async (response) => {
                const result = response.data;
                console.log("/favorites/list?indicator=DUITNOW favoriteList ==> ", result);
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
                            image: "icBakong.png",
                            imageName: "icBakong.png",
                            imageUrl: "icBakong.png",
                            shortName: accountItem.accountName,
                            type: true,
                        };

                        console.log("favoriteList ACCOUNT ", obj);
                        filteredList.push(obj);
                    });
                    console.log("favoriteList Favourite List ", filteredList);
                    this.setState({
                        getListCalled: true,
                        favoriteList: filteredList,
                        favoriteListFull: filteredList,
                        searchResultHeight: filteredList.length * 125,
                    });
                } else {
                    this.setState({
                        getListCalled: true,
                    });
                }
            })
            .catch((Error) => {
                console.log(" favoriteListApi ERROR: ", Error);
                this.setState({
                    getListCalled: true,
                });
            });
    };

    /**
     * _onDuitNowItemClick
     * on Duit Now Item Click
     */
    _onDuitNowItemClick = (item) => {
        console.log("[TransferOwnAccount] >> [_onAccountListClick]", item);
        hideToast();
        this.duitnowIdInquiry(item, true);
    };

    /**
     * duitnowIdInquiry
     * duitnow Id Inquiry call
     */
    duitnowIdInquiry = (item, transferFav) => {
        console.log("[TransferOverseasScreen] >> [duitnowIdInquiry] : ");
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
        console.log("[TransferOverseasScreen] >> [_duitNowOpenClick] : ");
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
            activeTabIndex: 4,
        };
        // this.props.navigation.navigate(navigationConstant.DUITNOW_MODULE, {
        //     screen: navigationConstant.DUITNOW_ENTER_ID,
        //     params: { transferParams },
        // });
        this.props.navigation.navigate("BakongEnterMobileNo", {
            transferParams,
        });
    };

    /**
     * navigateToDuitNow
     * navigate To DuitNow Id Screen
     */
    navigateToDuitNow = () => {
        console.log("[TransferOverseasScreen] >> [navigateToDuitNow] : ");
        hideToast();
        this.props.navigation.navigate(navigationConstant.DUITNOW_MODULE, {
            screen: navigationConstant.DUITNOW_ENTER_ID,
        });
    };

    render() {
        return (
            <View style={Styles.container}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    ref={(ref) => {
                        this.myScroll = ref;
                    }}
                    onScrollEndDrag={({ nativeEvent }) =>
                        this.setState({ contentOffset: nativeEvent.contentOffset })
                    }
                    contentContainerStyle={Styles.containerScrollView}
                    stickyHeaderIndices={this.state.showSearchInput ? [0] : [1]}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                >
                    <View style={Styles.containerScroll}>
                        {/* Tab */}
                        <View ref={(ref) => (this.topView = ref)} />
                        {!this.state.showSearchInput && (
                            <View>
                                <View style={Styles.newPaymentTitleContaier}>
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        color="#000000"
                                        textAlign="left"
                                        text={Strings.NEW_TRANSFER}
                                    />
                                </View>
                                <View>
                                    <View style={Styles.newPaymentButtonContaier}>
                                        <GridButtons
                                            data={this.state.bakongButton}
                                            callback={this._onNewBakongTransferClick}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
                        {/* Favourites */}
                        <View>
                            {!this.state.showSearchInput && (
                                <View style={Styles.favTitle}>
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        color="#000000"
                                        textAlign="left"
                                        text={Strings.FAVOURITES}
                                    />
                                </View>
                            )}
                            <View ref={(ref) => (this.favouritesTextList = ref)} />
                            <View style={Styles.searchContainer}>
                                <SearchInput
                                    doSearchToogle={this.doSearchToogle}
                                    showSearchInput={this.state.showSearchInput}
                                    onSearchTextChange={this._onSearchTextChange}
                                    useMargin={false}
                                />
                            </View>
                        </View>
                        {/* List */}
                        <View style={Styles.listContainer}>
                            {this.state.showSearchInput && this.state.favoriteList.length < 1 && (
                                <View style={Styles.emptyTextView}>
                                    <Typography
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        textAlign="center"
                                        text={Strings.NO_RESULT_FOUND}
                                    />
                                    <View style={Styles.emptyText2View}>
                                        <Typography
                                            fontSize={14}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            textAlign="center"
                                            text={Strings.WE_COULDNT_FIND_ANY_ITEMS_MATCHING}
                                        />
                                    </View>
                                </View>
                            )}
                            {this.state.getListCalled &&
                                !this.state.showSearchInput &&
                                this.state.favoriteListFull.length < 1 && (
                                    <View style={Styles.emptyTextView}>
                                        <Typography
                                            fontSize={18}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={32}
                                            textAlign="center"
                                            text={Strings.ADD_FAVOURITES_TO_LIST}
                                        />
                                        <View style={Styles.emptyText2View}>
                                            <Typography
                                                fontSize={14}
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                textAlign="center"
                                                text={Strings.YOU_CAN_ALWAYS_ADD_FAVOURITE}
                                            />
                                        </View>
                                    </View>
                                )}
                            {!this.state.getListCalled && <OwnAccountShimmerView />}
                            <OwnAccountList
                                showLastLine={
                                    this.state.favoriteList && this.state.favoriteList.length === 1
                                }
                                extraData={this.state.favoriteList}
                                data={this.state.favoriteList}
                                callback={this._onDuitNowItemClick}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

TransferOverseasScreen.propTypes = {
    activeTabIndex: PropTypes.any,
    data: PropTypes.object,
    fromAccount: PropTypes.any,
    index: PropTypes.any,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    screenDate: PropTypes.any,
};
export default TransferOverseasScreen;

const generalPaddingHorizontal = 24;

const Styles = {
    container: {
        flex: 1,
        backgroundColor: MEDIUM_GREY,
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
        paddingHorizontal: generalPaddingHorizontal,
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
        borderBottomColor: "#cfcfcf",
    },
    containerScroll: {
        flex: 1,
    },
};

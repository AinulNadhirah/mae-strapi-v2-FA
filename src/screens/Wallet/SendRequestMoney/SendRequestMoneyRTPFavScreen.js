import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    RefreshControl,
    findNodeHandle,
    Dimensions,
    Keyboard,
} from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import OwnAccountList from "@components/Others/OwnAccountList";
import OwnAccountShimmerView from "@components/Others/OwnAccountShimmerView";
import SearchInput from "@components/SearchInput";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    getRtpFavoritesList,
    duitnowStatusInquiry,
    fundTransferInquiryApi,
    invokeL3,
} from "@services";
import { FASendRequestDashboard } from "@services/analytics/analyticsSendRequest";

import { BLACK } from "@constants/colors";
import { FUND_TRANSFER_TYPE_MAYBANK } from "@constants/fundConstants";
import * as Strings from "@constants/strings";

import { arraySearchByObjProp } from "@utils/array";
import { analyticsDashboard } from "@utils/dataModel/rtdHelper";
import {
    formatICNumber,
    formatMobileNumbersList,
    getProxyList,
    isIPhoneSmall,
} from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/SendAndRequestStyle";
import commonStyle from "@styles/main";

import Assets from "@assets";

import SendRequestTypes from "./SendRequestTypes";

export const { width, height } = Dimensions.get("window");
class SendRequestMoneyRTPFavScreen extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        activeTabIndex: PropTypes.any,
        reqId: PropTypes.any,
        index: PropTypes.any,
        isRtpEnabled: PropTypes.any,
        fromAccount: PropTypes.any,
        screenDate: PropTypes.any,
        data: PropTypes.any,
        toggleLoader: PropTypes.func,
        onSendMoneyPress: PropTypes.func,
        onAutoDebitPress: PropTypes.func,
        onRequestMoneyPress: PropTypes.func,
        onRequestToPayPress: PropTypes.func,
        toggleShowInScreenLoaderModal: PropTypes.func,
        onNotificationRequestReqId: PropTypes.func,
        updateModel: PropTypes.func,
        isCustomerTypeSoleProp: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            showSearchInput: false,
            fromAccount: "",
            refreshing: false,
            duitNowList: [],
            duitNowFullList: [],
            apiCalled: false,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: null,
            },
        });
    }

    componentDidMount() {
        this._updateDataInScreen();
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.activeTabIndex !== prevProps.activeTabIndex &&
            prevProps.activeTabIndex === this.props.index &&
            this.state.duitNowList &&
            this.state.duitNowList.length < 1
        ) {
            this.getRtpFavoritesListAPI();
        }
    }

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _updateDataInScreen = () => {
        this.setState({
            apiCalled: false,
        });
        const { activeTabIndex, index } = this.props;

        // Render if first tab
        if (activeTabIndex === index) {
            this.getRtpFavoritesListAPI();
        }
    };

    _refresh = () => {
        if (this.props.isRtpEnabled) {
            this.setState({ refreshing: true });
            this.getRtpFavoritesListAPI();
        }
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    triggerParam = (data) => {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        const reqId = Number(this.props.route?.params?.refId);
        const request = reqId && reqId >= 0 && data ? data.find((data) => data.id === reqId) : -1;
        const reqIdLast = this.props?.reqId ?? -1;
        this.timer = setTimeout(() => {
            // find the item and trigger on tap
            if (request && request !== -1 && reqIdLast && reqIdLast !== reqId) {
                this.props.onNotificationRequestReqId(reqId);
                this._onListClick(request, true);
            } else {
                this.props.toggleShowInScreenLoaderModal(false);
            }
        }, 800);
    };

    /**
     *_onSearchTextChange
     * on Search Text Change
     */
    _onSearchTextChange = (text) => {
        this.scrollToList();
        const list = arraySearchByObjProp(this.state.duitNowFullList, text, [
            "idNo",
            "nickName",
            "idType",
        ]);
        this.setState({
            // searchInputText: text,
            duitNowList: text && text.length >= 1 ? list : this.state.duitNowFullList,
        });
    };

    /**
     * scrollToList
     * scroll To List
     */
    scrollToList = () => {
        requestAnimationFrame(() => {
            if (this.favouritesTextList && this.myScroll) {
                this.favouritesTextList.measureLayout(findNodeHandle(this.myScroll), (x, y) => {
                    this.myScroll.scrollTo({ x: 0, y, animated: true });
                });
            }
        });
    };

    /**
     * scrollToTopView
     * scroll To Top View
     */
    scrollToTopView = () => {
        requestAnimationFrame(() => {
            if (this.topView && this.myScroll) {
                this.topView.measureLayout(findNodeHandle(this.myScroll), (x, y) => {
                    this.myScroll.scrollTo({ x: 0, y, animated: true });
                });
            }
        });
    };

    doSearchToogle = () => {
        Keyboard.dismiss();
        this.setState({ showSearchInput: !this.state.showSearchInput });
        this._onSearchTextChange("");
    };

    handleAccOrProxyVal = (idTypeCode, idValue) => {
        if (idTypeCode === "MBNO") {
            return formatMobileNumbersList(idValue);
        }
        if (idTypeCode === "NRIC") {
            return formatICNumber(idValue);
        }
        if (idTypeCode === "ACCT") {
            return idValue
                .substring(0, idValue.length)
                .replace(/[^\dA-Z]/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim();
        }
        if (idTypeCode === "PSPT" && /[A-Z]{3}$/.test(idValue)) {
            return idValue.substring(0, idValue.length - 3);
        }
        return idValue;
    };

    /**
     * getRtpFavoritesListAPI
     * get Generic Favorites List Api for RTP
     */
    getRtpFavoritesListAPI = async () => {
        const { isRtpEnabled } = this.props;
        if (!isRtpEnabled) {
            return;
        }
        try {
            this.props.toggleLoader(true);
            const subUrl = "/favorite/inquiry";
            const payloadData = {
                transactionType: "TRANSFERS",
                pageLimit: 9999,
                transactionSubType: "RPP",
            };
            const response = await getRtpFavoritesList(subUrl, payloadData);
            const data = response?.data;

            if (data) {
                const result = data?.result;
                const filteredList = [];

                if (result?.data?.length > 0) {
                    const favListItems = result?.data;

                    if (favListItems && Array.isArray(favListItems)) {
                        favListItems.map((accountItem, index) => {
                            const obj = { ...accountItem };
                            const idTypeCode = accountItem?.idType;
                            const idValue = accountItem?.idNumber;
                            const idValueFormatted = this.handleAccOrProxyVal(idTypeCode, idValue);
                            obj.id = index;
                            obj.emailId = accountItem?.emailId;

                            obj.idNo = idValue;
                            obj.accountName = accountItem?.accountName;
                            obj.accountNo = idValue;
                            obj.acquirerId = accountItem?.acquirerId;
                            obj.tacIndicator = accountItem?.tacIndicator;
                            obj.duitnow = accountItem?.duitnow;
                            obj.fundTransfer = accountItem?.fundTransfer;
                            obj.idValueFormatted = idValueFormatted;
                            obj.idType = accountItem?.idType;
                            obj.idTypeCode = accountItem?.idTypeCode ?? accountItem?.idType;
                            obj.nickName = accountItem?.nickName;
                            obj.recipientName = accountItem?.recipientName;
                            obj.statusCode = accountItem?.statusCode;
                            obj.tacIndent = accountItem?.tacIndent;
                            obj.name = accountItem?.nickName;
                            obj.description1 = idValueFormatted;
                            obj.description2 = getProxyList(accountItem?.idType);
                            obj.image = {
                                image: Strings.DUINTNOW_IMAGE,
                                imageName: Strings.DUINTNOW_IMAGE,
                                imageUrl: Strings.DUINTNOW_IMAGE,
                                shortName: accountItem?.accountName,
                                type: true,
                            };

                            filteredList.push(obj);
                        });
                    }
                }
                this.setState({
                    getListCalled: true,
                    duitNowList: filteredList,
                    duitNowFullList: filteredList,
                    apiCalled: true,
                    refreshing: false,
                });
                this.props.toggleShowInScreenLoaderModal(false);
            } else {
                this.setState({
                    getListCalled: true,
                    apiCalled: true,
                    refreshing: false,
                });
                showErrorToast({
                    message: Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        } catch (error) {
            this.setState({
                getListCalled: true,
                apiCalled: true,
            });
            this.props.toggleShowInScreenLoaderModal(false);
            showErrorToast({
                message: error?.error?.error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
            });
        } finally {
            setTimeout(() => {
                this.props.toggleLoader(false);
            }, 1500);
        }
    };

    /**
     * _onDuitNowItemClick
     * on Duit Now Item Click
     */
    _onDuitNowItemClick = async (item) => {
        FASendRequestDashboard.onSelectRequest("Favourites");
        const request = await this._requestL3Permission();
        if (!request) {
            return;
        }
        if (item.idTypeCode === "ACCT" || item.idType === "ACCT") {
            this.fundTransferInquiryApi(item, true);
        } else {
            this.duitnowIdInquiry(item, true);
        }
    };

    /**
     * duitnowIdInquiry
     * duitnow Id Inquiry call
     */
    duitnowIdInquiry = async (item) => {
        const { idNumber, idType } = item;
        try {
            const subUrl =
                "/duitnow/status/inquiry?proxyId=" +
                idNumber +
                "&proxyIdType=" +
                idType +
                "&requestType=RTP";
            const response = await duitnowStatusInquiry(subUrl);
            const resultData = response?.data?.result;
            const statusCode = response?.data?.code;

            if (resultData && statusCode === 200) {
                const transferParams = {
                    transferFlow: 25,
                    transferTypeName: "Duit Now",
                    transactionMode: "Duit Now",
                    isMaybankTransfer: false,
                    transferRetrievalRefNo: resultData?.retrievalRefNo,
                    transferProxyRefNo: resultData?.proxyRefNo,
                    transferRegRefNo: resultData?.regRefNo,
                    transferAccType: resultData?.accType,
                    transferBankCode: resultData?.bankCode,
                    toAccountCode: resultData?.bankCode,
                    accountName: resultData?.accHolderName,
                    transferBankName: resultData?.bankName,
                    transferAccHolderName: resultData?.accHolderName,
                    transferLimitInd: resultData?.limitInd,
                    transferMaybank: resultData?.maybank,
                    transferOtherBank: !resultData.maybank,
                    transferAccNumber: resultData?.accNo,
                    formattedToAccount: resultData?.accNo,
                    idValueFormatted: item?.idValueFormatted,
                    idValue: idNumber,
                    idType,
                    idCode: idType,
                    idTypeText: idType,
                    transferFav: true,
                    image: item?.image ?? {
                        image: Assets.icDuitNowCircle,
                        type: "local",
                    },
                    bankName: resultData?.maybank ? "Maybank" : "",
                    imageBase64: true,
                    amount: "0.00",
                    formattedAmount: "0.00",
                    reference: "",
                    minAmount: 0.0,
                    maxAmount: 999999.99,
                    amountError: Strings.AMOUNT_ERROR,
                    screenLabel: Strings.ENTER_AMOUNT,
                    screenTitle: Strings.DUITNOW_REQUEST,
                    fromAccount: this.state.fromAccount,
                    fromAccountCode: "",
                    fromAccountName: "",
                    toAccount: resultData?.accNo,
                    receiptTitle: Strings.DUITNOW,
                    transactionDate: "",
                    nameMasked: resultData?.nameMasked,
                    recipientNameMaskedMessage: resultData?.recipientNameMaskedMessage,
                    recipientNameMasked: resultData?.recipientNameMasked,
                    actualAccHolderName: resultData?.actualAccHolderName,
                    accHolderName: resultData?.accHolderName,
                    isFutureTransfer: false,
                    toAccountBank: resultData?.maybank ? "Maybank" : "",
                    formattedFromAccount: "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: resultData?.bankCode,
                    bankCode: resultData?.bankCode,
                    swiftCode: resultData?.bankCode,
                    endDateInt: 0,
                    startDateInt: 0,
                    tacIndicator: item.tacIndicator,
                    selectedIDTypeIndex: 2,
                    functionsCode: resultData?.maybank ? 12 : 27,
                    activeTabIndex: 2,
                    countryCode: "",
                };

                this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                    screen: navigationConstant.REQUEST_TO_PAY_AMOUNT,
                    params: {
                        transferParams,
                    },
                });
            } else {
                showErrorToast({
                    message: resultData?.statusDesc ?? Strings.ENTER_VALID_TRANSFER_DETAILS,
                });
            }
        } catch (error) {
            if (error?.message) {
                showErrorToast({
                    message: error?.message,
                });
            }
        }
    };

    fundTransferInquiryApi = (item) => {
        const subUrl = "/fundTransfer/inquiry";

        const params = {
            bankCode: "MAYBANK",
            fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
            toAccount: item.idNumber,
            payeeCode: "000000",
            swiftCode: "MBBEMYKL",
        };

        fundTransferInquiryApi(subUrl, params)
            .then((response) => {
                const responseObject = response.data;
                if (responseObject && responseObject.accountHolderName) {
                    const transferParams = {
                        nameMasked: responseObject.nameMasked,
                        recipientNameMaskedMessage: responseObject.recipientNameMaskedMessage,
                        recipientNameMasked: responseObject.recipientNameMasked,
                        actualAccHolderName: responseObject.actualAccHolderName,
                        accHolderName: responseObject.accountHolderName,
                        transferProxyRefNo: responseObject.lookupReference,
                        idTypeText: "Account number",
                        idValue: item.idNo,
                        idValueFormatted: item.idValueFormatted,
                        toAccount: item.idNo,
                        transferAccType: "",
                        idType: "ACCT",
                        amount: "0.00",
                        reference: "",
                        paymentDesc: "",
                        transferFlow: 25,
                        swiftCode: "MBBEMYKL",
                        transferFav: true,
                        image: {
                            image: Strings.DUINTNOW_IMAGE,
                            imageName: Strings.DUINTNOW_IMAGE,
                            imageUrl: Strings.DUINTNOW_IMAGE,
                            shortName:
                                responseObject?.actualAccHolderName ??
                                responseObject?.accHolderName,
                            type: true,
                        },
                    };

                    this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                        screen: navigationConstant.REQUEST_TO_PAY_AMOUNT,
                        params: {
                            transferParams,
                        },
                    });
                } else {
                    showErrorToast({
                        message: Strings.ENTER_VALID_TRANSFER_DETAILS,
                    });
                }
            })
            .catch(() => {
                showErrorToast({
                    message: Strings.ENTER_VALID_TRANSFER_DETAILS,
                });
            });
    };

    onFocus = () => {
        analyticsDashboard("Favourites", "Search");
    };

    render() {
        const { isRtpEnabled } = this.props;
        const { duitNowList } = this.state;
        const marginIphoneSmall = {
            marginTop: isIPhoneSmall() ? 10 : Styles.emptyTextView.marginTop,
        };
        return (
            <View style={commonStyle.contentTab}>
                <View style={commonStyle.wrapperBlue}>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._refresh}
                            />
                        }
                        ref={(view) => (this._scrollView = view)}
                        scrollEventThrottle={10}
                        refreshing={this.state.refreshing}
                    >
                        <View style={Styles.flex}>
                            <View style={Styles.innerFlex}>
                                {!this.state.showSearchInput && (
                                    <View style={Styles.idLikeView}>
                                        <Typography
                                            fontSize={16}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            textAlign="left"
                                            text={Strings.ID_LIKE_TO}
                                        />
                                    </View>
                                )}

                                {!this.state.showSearchInput && (
                                    <SendRequestTypes {...this.props} />
                                )}

                                <View style={[Styles.favouriteView2, duitNowList?.length > 0]}>
                                    {isRtpEnabled && !this.state.showSearchInput && (
                                        <Typography
                                            fontSize={16}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            textAlign="left"
                                            text="DuitNow Request Favourites"
                                        />
                                    )}

                                    <View style={Styles.searchContainer}>
                                        <SearchInput
                                            doSearchToogle={this.doSearchToogle}
                                            showSearchInput={this.state.showSearchInput}
                                            onSearchTextChange={this._onSearchTextChange}
                                            focusSearch={this.onFocus}
                                        />
                                    </View>
                                </View>
                                {(!isRtpEnabled ||
                                    (this.state.apiCalled &&
                                        duitNowList &&
                                        duitNowList.length < 1)) &&
                                    !this.state.showSearchInput && (
                                        <View style={[Styles.emptyTextView, marginIphoneSmall]}>
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
                                                    fontWeight="200"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={20}
                                                    textAlign="center"
                                                    text={Strings.YOU_CAN_ALWAYS_ADD_FAVOURITE}
                                                />
                                            </View>
                                        </View>
                                    )}
                                {isRtpEnabled && !this.state.getListCalled && (
                                    <OwnAccountShimmerView />
                                )}
                            </View>
                            {isRtpEnabled && duitNowList?.length >= 1 && (
                                <View style={Styles.row}>
                                    <OwnAccountList
                                        showLastLine={duitNowList && duitNowList.length === 1}
                                        extraData={duitNowList}
                                        data={duitNowList}
                                        callback={this._onDuitNowItemClick}
                                    />
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

export default withModelContext(SendRequestMoneyRTPFavScreen);

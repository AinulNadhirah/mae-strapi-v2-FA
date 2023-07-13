import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, ImageBackground, RefreshControl, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { SendRequestToPayList } from "@components/Common/SendRequestToPayList";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getRtpList, getPastMoneyList, getBillingList } from "@services";
import { FASendRequestDashboard } from "@services/analytics/analyticsSendRequest";

import { BLACK, BLUE } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    analyticsDashboard,
    mapRTPData,
    mapAutoDebitData,
    filterAutoDebitBasedOnUser,
} from "@utils/dataModel/rtdHelper";

import Styles from "@styles/Wallet/SendAndRequestStyle";
import commonStyle from "@styles/main";

import Assets from "@assets";

import SendRequestTypes from "./SendRequestTypes";

class SendRequestMoneyPastScreen extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        activeTabIndex: PropTypes.any,
        index: PropTypes.any,
        reqId: PropTypes.any,
        isRtpEnabled: PropTypes.any,
        fromAccount: PropTypes.any,
        screenDate: PropTypes.any,
        data: PropTypes.any,
        toggleLoader: PropTypes.func,
        onShowIncomingRequestPopupPress: PropTypes.func,
        onPayAcceptedRequest: PropTypes.func,
        onSendMoneyPress: PropTypes.func,
        onAutoDebitPress: PropTypes.func,
        onRequestMoneyPress: PropTypes.func,
        onRequestToPayPress: PropTypes.func,
        toggleShowInScreenLoaderModal: PropTypes.func,
        onNotificationRequestReqId: PropTypes.func,
        onPayRequestPress: PropTypes.func,
        updateDataInChild: PropTypes.func,
        updateModel: PropTypes.func,
        isCustomerTypeSoleProp: PropTypes.bool,
        isAutoDebitEnabled: PropTypes.any,
        utilFlg: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            refreshing: false,
            apiCalled: false,
            rtpApiCalled: false,
            dataRTPArray: [],
            offsetNo: "",
            autoDebitDataArray: [],
            autoDebitApiCalled: false,
        };
    }

    componentDidMount() {
        this._updateDataInScreen();
    }

    componentDidUpdate(prevProps) {
        // to handle triggering API + rendering only when tab is visible
        if (
            this.props.activeTabIndex !== prevProps.activeTabIndex &&
            prevProps.activeTabIndex === this.props.index
        ) {
            //render view
            if (this.state.dataArray.length === 0) {
                this._getPastSendRequestList();
            }
            if (this.state.autoDebitDataArray === 0) {
                this.getAutoDebitListAPI({ status: "PAST" });
            }
        }

        if (
            this.props.isRtpEnabled !== prevProps.isRtpEnabled &&
            !this.state.rtpApiCalled &&
            this.state.dataRTPArray.length === 0 &&
            this.props.isRtpEnabled
        ) {
            this.getRtpListAPI();
        }
    }

    _updateDataInScreen = () => {
        const { activeTabIndex, index } = this.props;

        // Render if first tab
        if (activeTabIndex === index) {
            this.props.toggleLoader(true);
            this._getPastSendRequestList();
        }
    };

    getAutoDebitListAPI = async (params) => {
        const { status, offsetNo } = params;
        if (this.isAutoDebitLoading) {
            this.props.toggleLoader(false);
            return;
        }
        this.isAutoDebitLoading = true;
        if (!offsetNo) {
            this.offsetNo = null;
            this.setState({ offsetNo: null });
        }
        try {
            const response = await getBillingList({
                offset: offsetNo ?? 1,
                pageLimit: 999999,
                requestStatus: status,
                autoType: "AUTO_DEBIT",
            });
            const data = response?.data?.result?.data?.transactions;
            const retrievalRefNo = response?.data?.result?.meta?.pagination?.offset ?? 1;
            if (data) {
                if (data.length > 0) {
                    this._updateAutoDebitScreenData(data);
                    this.offsetNo = retrievalRefNo;
                    this.setState({
                        offsetNo: retrievalRefNo,
                        refreshing: false,
                    });
                } else {
                    this.setState(
                        {
                            refreshing: false,
                            autoDebitDataArray: [],
                            autoDebitApiCalled: true,
                        },
                        () => {
                            setTimeout(() => {
                                this.props.toggleLoader(false);
                            }, 1500);
                        }
                    );
                }
            } else {
                const statusDescription = response?.data?.errors[0]?.message;
                this.setState(
                    {
                        refreshing: false,
                        autoDebitDataArray: [],
                        autoDebitApiCalled: true,
                    },
                    () => {
                        this.props.toggleLoader(false);
                        if (this.props.isAutoDebitEnabled) {
                            showErrorToast({
                                message:
                                    statusDescription ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                            });
                        }
                    }
                );
            }
        } catch (error) {
            this.setState(
                {
                    autoDebitApiCalled: true,
                },
                () => {
                    setTimeout(() => {
                        this.props.toggleLoader(false);
                    }, 1500);
                }
            );
            if (this.props.isRtpEnabled) {
                showErrorToast({
                    message: error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        } finally {
            this.isAutoDebitLoading = false;
        }
    };

    _updateAutoDebitScreenData = (resultList) => {
        const filterList = filterAutoDebitBasedOnUser(resultList, false);

        const dataList = filterList?.length > 0 ? mapAutoDebitData(filterList, true) : [];
        const tempDataList =
            this.offsetNo > 1 ? [...this.state.autoDebitDataArray, ...dataList] : [...dataList];
        this.setState(
            {
                autoDebitDataArray: tempDataList,
                refreshing: false,
                autoDebitApiCalled: true,
            },
            () => {
                setTimeout(() => {
                    this.props.toggleLoader(false);
                }, 1500);
            }
        );
        // if id parameter exists
        if (this.props.route?.params?.refId) {
            this.triggerParam(tempDataList);
        } else {
            this.props.toggleShowInScreenLoaderModal(false);
        }
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
            maxAmount: 50000.0,
            amountError: Strings.AMOUNT_ERROR_RTP,
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
        };
        if (item) {
            if (isReplace) {
                this.props.navigation.replace(navigationConstant.REQUESTS_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            } else {
                this.props.navigation.navigate(navigationConstant.REQUESTS_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            }
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
        setTimeout(() => {
            this.props.toggleShowInScreenLoaderModal(false);
        }, 500);
    };

    _onAutoDebitListClick = (item, isReplace = false) => {
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
            maxAmount: 50000.0,
            amountError: Strings.AMOUNT_ERROR_RTP,
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
            utilFlg: this.props.utilFlg,
        };
        if (item) {
            this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_DETAILS_SCREEN, {
                item,
                transferParams,
            });
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    };

    _onRTPListClick = (item, isReplace = false) => {
        FASendRequestDashboard.onSelectRequest("Past");
        if (item.rtpRequest || item.autoDebitRequest) {
            const transferParams = {
                // transferFlow: 15,
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
                maxAmount: 50000.0,
                amountError: Strings.AMOUNT_ERROR_RTP,
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
                dataRTPArray: [],
                utilFlg: this.props.utilFlg,
            };

            if (item) {
                this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                    screen: navigationConstant.REQUEST_TO_PAY_DETAILS_SCREEN,
                    params: {
                        item,
                        transferParams,
                        isPast: true,
                    },
                });
            } else {
                showErrorToast({
                    message: Strings.COMMON_ERROR_MSG,
                });
            }
        } else {
            if (item.autoDebitRequest) {
                this._onAutoDebitListClick(item);
            } else {
                this._onListClick(item);
            }
        }
    };

    /**
     * getRtpListAPI
     * get Generic Favorites List Api for RTP
     */
    getRtpListAPI = async (offsetNo) => {
        if (this.isRTPLoading) {
            this.props.toggleLoader(false);
            return;
        }
        this.isRTPLoading = true;
        this.props.toggleLoader(true);

        if (!offsetNo) {
            this.offsetNo = null;
            this.setState({ offsetNo: null });
        }
        /*Get Favorite List*/
        const subUrl = "/requests";
        try {
            const response = await getRtpList(subUrl, {
                requestStatus: "PAST",
                offset: offsetNo ?? 1,
            });

            const { retrievalRefNo, paymentMode } = response.data?.result?.data || {};
            const data = response?.data?.result?.data?.requests;

            if (data) {
                if (data?.length > 0 && this.props.isRtpEnabled) {
                    this.setState({ refreshing: false });
                    const listRtp = paymentMode
                        ? data.map((rtpItem) => {
                              if (
                                  rtpItem?.requestType !== "OUTGOING" &&
                                  parseFloat(rtpItem?.transactionAmount) > 5000.0
                              ) {
                                  return { ...rtpItem, paymentMode };
                              } else {
                                  return rtpItem;
                              }
                          })
                        : data;
                    this._updateRTPScreenData(listRtp);
                    this.offsetNo = retrievalRefNo;
                    this.setState({ offsetNo: retrievalRefNo });
                } else {
                    this.setState(
                        {
                            refreshing: false,
                            dataRTPArray: [],
                            rtpApiCalled: true,
                        },
                        () => {
                            setTimeout(() => {
                                this.props.toggleLoader(false);
                            }, 1500);
                        }
                    );
                }
            } else {
                const statusDescription = response?.data?.errors[0]?.message;
                this.setState({
                    refreshing: false,
                    dataRTPArray: [],
                    rtpApiCalled: true,
                });
                if (this.props.isRtpEnabled) {
                    showErrorToast({
                        message: statusDescription ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                    });
                }
            }
        } catch (error) {
            this.setState({
                rtpApiCalled: true,
            });
            if (this.props.isRtpEnabled) {
                showErrorToast({
                    message: error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        } finally {
            this.isRTPLoading = false;
            setTimeout(() => {
                this.props.toggleLoader(false);
            }, 1500);
        }
    };

    _updateRTPScreenData = (resultList) => {
        const filteredDataList = mapRTPData(resultList, true);

        const tempDataList = this.offsetNo
            ? [...this.state.dataRTPArray, ...filteredDataList]
            : [...filteredDataList];

        this.setState({ dataRTPArray: tempDataList, refreshing: false, rtpApiCalled: true });

        // if id parameter exists
        if (this.props.route?.params?.refId) {
            this.triggerParam(tempDataList);
        } else {
            this.props.toggleShowInScreenLoaderModal(false);
        }
    };

    _getPastSendRequestList = () => {
        const subUrl = "/sendRcvMoney/list/pending-past?pageSize=1000&label=PAST&page=0";

        getPastMoneyList(subUrl)
            .then((response) => {
                const responseObject = response?.data;
                if (responseObject?.resultList?.length >= 1) {
                    this.setState({ refreshing: false, apiCalled: true });
                    this._updateScreenData(responseObject.resultList);
                } else {
                    // this.props.toggleLoader(false);
                    this.setState({
                        refreshing: false,
                        dataArray: [],
                        apiCalled: true,
                    });
                }
            })
            .catch((error) => {
                // this.props.toggleLoader(false);
                console.log(subUrl + "  ERROR==> ", error);
                this.setState({ refreshing: false, dataArray: [], apiCalled: true });
            })
            .finally(() => {
                if (!this.props.isRtpEnabled) {
                    setTimeout(() => {
                        this.props.toggleLoader(false);
                    }, 1500);

                    this.setState({
                        refreshing: false,
                        apiCalled: true,
                    });
                }
                this.getRtpListAPI();
                this.getAutoDebitListAPI({ status: "PAST" });
            });
    };

    _refresh = () => {
        this.setState({ refreshing: true, apiCalled: false, rtpApiCalled: false });
        this._getPastSendRequestList();
        this.getRtpListAPI();
        this.getAutoDebitListAPI({ status: "PAST" });
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        if (this.state?.offsetNo) {
            this.props.toggleLoader(true);
            this.nextPageRTPList();
        }
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    nextPageRTPList = () => {
        if (this.state?.offsetNo) {
            this.getRtpListAPI(this.state?.offsetNo);
        } else {
            this.props.toggleLoader(false);
        }
    };

    setStatus = (item) => {
        if (item.originalStatus === "REJECT") {
            return "Rejected";
        } else if (item.originalStatus === "CANCELLED") {
            return "Cancelled";
        }
        return "Completed";
    };

    _updateScreenData = (resultList) => {
        const dataList = [];
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
                title = `You've sent ${Strings.CURRENCY}${item.formattedAmount} to ${receiverName}.`;
                dateCaption = "Sent on ";
                if (item.status === "REJECT") {
                    title = `You've rejected ${Strings.CURRENCY}${item.formattedAmount} request from ${receiverName}.`;
                    dateCaption = "Created ";
                } else if (item.status === "CANCELLED") {
                    title = `You've cancelled ${Strings.CURRENCY}${item.formattedAmount} request from ${receiverName}.`;
                    dateCaption = "Created ";
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
            if (item.isSender) {
                if (item.status === "REJECT") {
                    detailTitle = "You've rejected\nthe request from ";
                } else {
                    detailTitle = Strings.YOU_VE_SENT_MONEY_TO;
                }
            } else {
                if (item.status === "REJECT") {
                    detailTitle = "Your request has been\n rejected by";
                } else if (item.originalStatus === "PAID") {
                    detailTitle = Strings.YOU_VE_RECEIVED_MONEY_FROM1;
                } else {
                    detailTitle = Strings.YOU_VE_REQUESTED_MONEY_FROM;
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

            item.status = this.setStatus(item);

            item.flow = "PAST";
            item.image = item.isSender ? item.receiverProfilePic : item.senderProfilePic;
            dataList.push(item);
        }
        this.setState({ dataArray: dataList });
        // if id parameter exists
        if (this.props.route?.params?.refId) {
            this.props.toggleShowInScreenLoaderModal(true);
            this.triggerParam(dataList);
        } else {
            this.props.toggleLoader(false);
            this.props.toggleShowInScreenLoaderModal(false);
        }
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
                this.props.toggleLoader(true);
                this._onListClick(request, true);
            } else {
                this.props.toggleLoader(false);
                this.props.toggleShowInScreenLoaderModal(false);
            }
        }, 800);
    };

    handleViewAll = (reqType, dataArr, isRTPRequest, isAutoDebitRequest) => {
        analyticsDashboard("Past", reqType);
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_VIEW_ALL,
            params: {
                ...this.props.route?.params,
                reqType,
                dataArr,
                isRTPRequest,
                requestStatus: "PAST",
                isRtpEnabled: this.props?.isRtpEnabled,
                isAutoDebitRequest,
                isAutoDebitEnabled: this.props?.isAutoDebitEnabled,
                isPast: true,
                utilFlg: this.props.utilFlg,
            },
        });
    };

    render() {
        const {
            isRtpEnabled,
            data: { permission },
        } = this.props;
        const noRequests =
            this.state.apiCalled &&
            !this.state.dataArray.length &&
            ((this.state.rtpApiCalled && !this.state.dataRTPArray.length) ||
                !permission?.hasPermissionViewDuitNow) &&
            ((this.state.autoDebitApiCalled && !this.state.autoDebitDataArray.length) ||
                !permission?.hasPermissionViewAutoDebitList);

        return (
            <View style={commonStyle.contentTab}>
                <View style={commonStyle.wrapperBlue}>
                    {this.state.apiCalled &&
                        ((isRtpEnabled && this.state.rtpApiCalled) || !isRtpEnabled) &&
                        !this.state.dataArray.length &&
                        ((isRtpEnabled && noRequests) || !isRtpEnabled) && (
                            <ImageBackground
                                style={Styles.noTrxBgImage}
                                source={Assets.sendRequestEmptyState}
                                imageStyle={Styles.noTrxBgImageStyle}
                            />
                        )}
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
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (this.isCloseToBottom(nativeEvent)) {
                                console.log("isCloseToBottom");
                            }
                        }}
                        scrollEventThrottle={10}
                        refreshing={this.state.refreshing}
                    >
                        <View style={Styles.flex}>
                            <View style={Styles.innerFlex}>
                                <View style={Styles.idLikeView}>
                                    <Typo
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
                                <SendRequestTypes {...this.props} />

                                {noRequests ||
                                (!permission?.hasPermissionViewDuitNow &&
                                    !permission?.hasPermissionViewAutoDebitList &&
                                    this.state.apiCalled &&
                                    !this.state.dataArray.length) ? (
                                    <View style={Styles.emptyTextView}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={32}
                                            textAlign="center"
                                            text={Strings.NEED_TO_ASK_FOR_MONEY}
                                        />
                                        <View style={Styles.emptyText2View}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="200"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                textAlign="center"
                                                text={Strings.GET_YOUR_DUES_PAID}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                            </View>

                            {this.state.dataArray?.length > 0 && (
                                <>
                                    <View
                                        style={[
                                            Styles.favouriteView,
                                            Styles.leftMargin,
                                            Styles.viewAll,
                                        ]}
                                    >
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            textAlign="left"
                                            text={Strings.SEND_AND_REQUEST}
                                        />
                                        {this.state.dataArray.length > 2 && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    this.handleViewAll(
                                                        Strings.SEND_AND_REQUEST,
                                                        [...this.state.dataArray],
                                                        false
                                                    )
                                                }
                                            >
                                                <Typo
                                                    fontSize={15}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    color={BLUE}
                                                    textAlign="left"
                                                    text="View All"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={Styles.favouriteListView}>
                                        <SendRequestToPayList
                                            data={[...this.state.dataArray]?.slice(0, 2)}
                                            extraData={[...this.state.dataArray]}
                                            callback={this._onRTPListClick}
                                            additionalData={{
                                                length: this.state.dataArray?.length,
                                                titleLines: 1,
                                                subtitleLines: 1,
                                            }}
                                        />
                                    </View>
                                </>
                            )}

                            {isRtpEnabled &&
                                permission?.hasPermissionViewDuitNow &&
                                this.state.rtpApiCalled &&
                                this.state.dataRTPArray.length > 0 && (
                                    <>
                                        <View
                                            style={[
                                                Styles.favouriteView,
                                                Styles.leftMargin,
                                                Styles.viewAll,
                                            ]}
                                        >
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                textAlign="left"
                                                text={Strings.REQUEST_TO_PAY}
                                            />
                                            {this.state.dataRTPArray.length > 2 && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        this.handleViewAll(
                                                            Strings.REQUEST_TO_PAY,
                                                            [...this.state.dataRTPArray],
                                                            true
                                                        )
                                                    }
                                                >
                                                    <Typo
                                                        fontSize={15}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={18}
                                                        color={BLUE}
                                                        textAlign="left"
                                                        text="View All"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={Styles.favouriteListView}>
                                            <SendRequestToPayList
                                                data={[...this.state.dataRTPArray]?.slice(0, 2)}
                                                extraData={[...this.state.dataRTPArray]}
                                                callback={this._onRTPListClick}
                                                additionalData={{
                                                    length: this.state.dataRTPArray?.length,
                                                    titleLines: 1,
                                                    subtitleLines: 1,
                                                }}
                                                tab="PAST"
                                            />
                                        </View>
                                    </>
                                )}
                            {this.state.autoDebitDataArray?.length > 0 &&
                            permission?.hasPermissionViewAutoDebitList ? (
                                <>
                                    <View
                                        style={[
                                            Styles.favouriteView,
                                            Styles.leftMargin,
                                            Styles.viewAll,
                                        ]}
                                    >
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            textAlign="left"
                                            text={Strings.REQUEST_TO_PAY_AUTODEBIT}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                this.handleViewAll(
                                                    Strings.REQUEST_TO_PAY_AUTODEBIT,
                                                    [...this.state.autoDebitDataArray],
                                                    false,
                                                    true
                                                )
                                            }
                                        >
                                            <Typo
                                                fontSize={15}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLUE}
                                                textAlign="left"
                                                text="View All"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.favouriteListView}>
                                        <SendRequestToPayList
                                            data={[...this.state.autoDebitDataArray]?.slice(0, 2)}
                                            extraData={[...this.state.autoDebitDataArray]}
                                            callback={this._onRTPListClick}
                                            additionalData={{
                                                length: this.state.autoDebitDataArray?.length,
                                                titleLines: 1,
                                                subtitleLines: 1,
                                            }}
                                        />
                                    </View>
                                </>
                            ) : null}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
export default withModelContext(SendRequestMoneyPastScreen);

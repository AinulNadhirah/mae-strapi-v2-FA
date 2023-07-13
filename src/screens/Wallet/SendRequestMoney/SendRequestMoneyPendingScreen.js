import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, ImageBackground, RefreshControl, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { SendRequestToPayList } from "@components/Common/SendRequestToPayList";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import {
    FASendRequestDashboard,
    FASendRequestTransaction,
} from "@services/analytics/analyticsSendRequest";
import {
    getPendingMoneyList,
    getRtpList,
    updateStatusSendRcvMoney,
    getBillingList,
} from "@services/index";

import { BLACK, BLUE } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    analyticsDashboard,
    analyticsSelectItem,
    mapRTPData,
    mapAutoDebitData,
    filterAutoDebitBasedOnUser,
} from "@utils/dataModel/rtdHelper";

import Styles from "@styles/Wallet/SendAndRequestStyle";
import commonStyle from "@styles/main";

import Assets from "@assets";

import SendRequestTypes from "./SendRequestTypes";

class SendRequestMoneyPendingScreen extends Component {
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
        utilFlg: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            item: {},
            refreshing: false,
            apiCalled: false,
            rtpApiCalled: false,
            dataRTPArray: [],
            autoDebitDataArray: [],
            autoDebitApiCalled: false,
        };
    }

    getAutoDebitListAPI = async (params) => {
        const { status, offsetNo } = params;
        if (this.isAutoDebitLoading) {
            this.props.toggleLoader(false);
            return;
        }
        this.isAutoDebitLoading = true;
        try {
            const response = await getBillingList({
                offSet: offsetNo ?? 1,
                pageLimit: 999999,
                requestStatus: status,
                autoType: "AUTO_DEBIT",
            });
            const data = response?.data?.result?.data?.transactions;
            const retrievalRefNo = response?.data?.result?.meta?.pagination?.offset ?? 1;
            if (data) {
                if (data.length > 0) {
                    this.setState({ refreshing: false });
                    this._updateAutoDebitScreenData(data);
                    this.offsetNo = retrievalRefNo;
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
        const dataList = filterList?.length > 0 ? mapAutoDebitData(filterList, false) : [];
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
            notificationClickHandled: false,
        };
        FASendRequestDashboard.onSelectRequest("Pending");
        if (item) {
            if (item.isSender && item.originalStatus === "PENDING") {
                const title =
                    item.title.toString().substring(0, item.title.toString().length - 1) +
                    (item.note && item.note.length >= 1 ? " for " + item.note + "." : ".");

                this.props.onShowIncomingRequestPopupPress(title, item);
                this.setState({
                    item: item,
                });
            } else if (item.isSender && item.originalStatus === "APROVED") {
                this.setState({
                    item: item,
                });
                this.props.onPayAcceptedRequest(item);
            } else {
                // is replace to accomodate notification centre
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
            }
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    };

    _onRTPListClick = (item, isReplace = false) => {
        if (item.rtpRequest || item.autoDebitRequest) {
            FASendRequestDashboard.onSelectRequest("Pending");
            const transferParams = {
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
                serviceFee: "",
                requestedAmount: "",
                amountEditable: false,
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
                this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                    screen: navigationConstant.REQUEST_TO_PAY_DETAILS_SCREEN,
                    params: {
                        item,
                        transferParams,
                    },
                });
            } else {
                showErrorToast({
                    message: Strings.COMMON_ERROR_MSG,
                });
            }
        } else {
            analyticsSelectItem(Strings.REQUEST_TO_PAY);
            if (item?.autoDebitRequest) {
                this._onAutoDebitListClick(item, true);
            } else {
                this._onListClick(item, true);
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

        if (!offsetNo) {
            this.offsetNo = null;
        }

        const subUrl = "/requests";
        try {
            const response = await getRtpList(subUrl, {
                requestStatus: "PENDING",
                offset: offsetNo ?? 1,
            });

            const { paymentMode } = response?.data?.result || {};
            const data = response?.data?.result?.data?.requests;
            const retrievalRefNo = response?.data?.result?.meta?.pagination?.offset ?? 1;
            const totalRecords = response?.data?.result?.meta?.pagination?.totalOutgoingRecords;

            if (data) {
                if (data.length > 0) {
                    this.setState({ refreshing: false, totalRecords });
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
                } else {
                    this.setState(
                        {
                            refreshing: false,
                            dataRTPArray: [],
                            rtpApiCalled: true,
                            totalRecords,
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
                        dataRTPArray: [],
                        rtpApiCalled: true,
                        totalRecords,
                    },
                    () => {
                        this.props.toggleLoader(false);
                        if (this.props.isRtpEnabled) {
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
                    rtpApiCalled: true,
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
            this.isRTPLoading = false;
        }
    };

    _updateRTPScreenData = (resultList) => {
        const dataList = mapRTPData(resultList, false);

        const tempDataList =
            this.offsetNo > 1 ? [...this.state.dataRTPArray, ...dataList] : [...dataList];

        this.setState(
            {
                dataRTPArray: tempDataList,
                refreshing: false,
                rtpApiCalled: true,
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

    _getPendingSendRequestList = () => {
        const subUrl = "/sendRcvMoney/list/pending-past?pageSize=1000&label=PENDING&page=0";

        getPendingMoneyList(subUrl)
            .then((response) => {
                const responseObject = response.data;
                if (responseObject?.resultList.length >= 1) {
                    this.setState({ refreshing: false });
                    this._updateScreenData(responseObject.resultList);
                } else {
                    this.setState({
                        refreshing: false,
                        dataArray: [],
                        apiCalled: true,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    refreshing: false,
                    apiCalled: true,
                });
            })
            .finally(() => {
                if (!this.props.isRtpEnabled) {
                    setTimeout(() => {
                        this.props.toggleLoader(false);
                    }, 1500);
                }
                this.getRtpListAPI();
                this.getAutoDebitListAPI({ status: "PENDING" });
            });
    };

    _refresh = (isRtpEnabled) => {
        this.setState({ refreshing: true, apiCalled: false, rtpApiCalled: isRtpEnabled });
        this._getPendingSendRequestList();
    };

    _setRtpRequestTitle = (item) => {
        const { formattedAmount, receiverName, senderName } = item;
        if (item.status === "PENDING") {
            return item.isSender
                ? `${receiverName}${Strings.HAS_REQUESTED}${Strings.CURRENCY}${formattedAmount} from you.`
                : `${Strings.YOU_REQUESTED_MONEY_FROM}${Strings.CURRENCY}${formattedAmount} from ${senderName}.`;
        }
        return item.isSender
            ? `${receiverName}${Strings.HAS_REQUESTED}${Strings.CURRENCY}${formattedAmount} from you.`
            : `${Strings.YOU_REQUESTED_MONEY_FROM}${Strings.CURRENCY}${formattedAmount} from ${senderName}.`;
    };

    _setRtpRequestStatus = (originalStatus, isSender) => {
        if (originalStatus === "PENDING" || originalStatus === "APROVED") {
            return isSender ? "Incoming" : "Outgoing";
        } else if (originalStatus === "PAID") return "Completed";
        else if (originalStatus === "REJECT") return "Rejected";
        else if (originalStatus === "CANCELLED") return "Cancelled";
        return "Completed";
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
                const title = item.isSender
                    ? `${receiverName}${Strings.HAS_REQUESTED}${Strings.CURRENCY}${item.formattedAmount} from you.`
                    : `${Strings.YOU_REQUESTED_MONEY_FROM}${Strings.CURRENCY}${item.formattedAmount} from ${senderName}.`;

                item.title = title;
                item.detailTitle = item?.isSender
                    ? Strings.YOU_VE_GOT_A_REQUEST_FROM
                    : Strings.YOU_VE_REQUESTED_MONEY_FROM;
                item.highlightText = Strings.CURRENCY + item.formattedAmount;
                item.date =
                    "Created " +
                    (item.trxDate === null || item.trxDate === undefined
                        ? item.createdDate
                        : item.trxDate);
                item.name = item?.isSender ? receiverName : senderName;
                item.originalStatus = item?.status;
                item.status =
                    item.originalStatus === "PENDING" || item.originalStatus === "APROVED"
                        ? item.isSender
                            ? "Incoming"
                            : "Outgoing"
                        : item.originalStatus === "PAID"
                        ? "Completed"
                        : item.originalStatus === "REJECT"
                        ? "Rejected"
                        : item.originalStatus === "CANCELLED"
                        ? "Cancelled"
                        : "Completed";
                item.flow = "PENDING";
                item.image = item?.isSender ? item.receiverProfilePic : item.senderProfilePic;
                dataList.push(item);
            }
        }
        this.setState({ dataArray: dataList, refreshing: false });
        // if id parameter exists
        if (this.props.route?.params?.refId) {
            this.triggerParam(dataList);
        } else {
            this.props.toggleShowInScreenLoaderModal(false);
        }
    };

    _onNotificationClickHandled = (value) => {};

    triggerParam = (data) => {
        if (this.timer) clearTimeout(this.timer);

        const reqId = Number(this.props.route?.params?.refId);
        const request = reqId && reqId >= 0 && data ? data.find((data) => data.id === reqId) : -1;
        const reqIdLast = this.props.reqId;
        this.timer = setTimeout(() => {
            // find the item and trigger on tap
            if (request && request !== -1 && reqIdLast && reqIdLast !== reqId) {
                this.props.onNotificationRequestReqId(reqId);
                this._onListClick(request, true);
            }
        }, 800);
    };

    _updateStatusSendRcvMoney = async (updatedStatus) => {
        const { item } = this.state;
        if (item) {
            try {
                const subUrl = `/sendRcvMoney/updateStatus?msgId=${item.id}&status=${updatedStatus}`;
                const response = await updateStatusSendRcvMoney(subUrl);
                const responseObject = response?.data;

                if (responseObject?.message === "success") {
                    if (updatedStatus === "PAID") {
                        showSuccessToast({
                            message: Strings.REQUEST_MARKED_AS_COLLECTED,
                        });
                    }
                    if (updatedStatus === Strings.FA_REJECT) {
                        FASendRequestTransaction.formCompleteRejected(
                            responseObject?.result?.trxRefId
                        );
                    }

                    this.props.updateDataInChild();
                } else {
                    showErrorToast({
                        message: Strings.QR_ISSUE,
                    });
                    this.setState({ refreshing: false });
                }
            } catch (error) {
                showErrorToast({
                    message: Strings.QR_ISSUE,
                });
                this.setState({ refreshing: false });
            }
        }
    };

    handleViewAll = (reqType, dataArr, isRTPRequest, isAutoDebitRequest) => {
        analyticsDashboard("Pending", reqType);
        this.props.navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_VIEW_ALL,
            params: {
                ...this.props.route?.params,
                reqType,
                dataArr,
                requestStatus: "PENDING",
                isRTPRequest,
                isRtpEnabled: this.props?.isRtpEnabled,
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
        const props = { totalRecords: this.state.totalRecords, ...this.props };

        return (
            <View style={commonStyle.contentTab}>
                <View style={commonStyle.wrapperBlue}>
                    {noRequests && (
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
                                <SendRequestTypes {...props} />
                                {noRequests ? (
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
                                            text={Strings.REQUESTS}
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
                            this.state.dataRTPArray.length > 0 ? (
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
                                        />
                                    </View>
                                </>
                            ) : null}
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
                                        {this.state.autoDebitDataArray.length > 2 && (
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
                                        )}
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
export default SendRequestMoneyPendingScreen;

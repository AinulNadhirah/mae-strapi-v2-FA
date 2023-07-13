import AsyncStorage from "@react-native-community/async-storage";
import _, { isEmpty } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
} from "react-native";
import ScrollPicker from "react-native-picker-scrollview";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import TxnHistoryListItem from "@components/ListItems/TxnHistoryListItem";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, wuTxnList, bankingGetCCTxnHistory } from "@services";
import { GABankingTransactionHistory } from "@services/analytics/analyticsBanking";

import {
    BLACK,
    YELLOW,
    WHITE,
    BLUE,
    MEDIUM_GREY,
    OFF_WHITE,
    BLACK_700,
    NOTIF_RED,
    GREY_200,
    DARK_GREY,
    GREY,
} from "@constants/colors";
import {
    PER_PAGE_DATA_TRANSACTION_HISTORY,
    PAGINATION_REF,
    PAGINATION_REF_CC,
    NO_TRANSACTION_AVAILABLE_DESC,
    NO_TRANSACTION_AVAILABLE_HEADING,
    NO_TRANSACTION_AVAILABLE_24_HOUR_MODE_HEADING,
    NO_TRANSACTION_AVAILABLE_24_HOUR_MODE_DESC,
    FA_DEBITCARD_HISTORY,
    FA_M2U_HISTORY,
    FA_TRANSACTION_HISTORY,
    FA_MAYBANK2U_TRANSACTIONHISTORY_FILTER,
    FA_MAYBANK2U_M2UHISTORY_FILTER,
    FA_MAYBANK2U_DEBITCARD_HISTORY_FILTER,
    RECEIPT_NOTE,
    TRANSACTION_RECEIPT_NOT_FOUND,
    PDF_VIEW_ERROR,
    COMMON_ERROR_MSG,
    UNPOSTED_TXN_TYPE,
    POSTED_TXN_TYPE,
    DONE,
    CREDIT,
    NO_FURTHER_TRANSACTION_HISTORY_AVAILABLE_HEADING, 
    NO_FURTHER_TRANSACTION_HISTORY_AVAILABLE_DESC,
    CONTINUATION_TOKEN_LAST_PAGE
} from "@constants/strings";
import { TXN_HISTORY_RECEIPT } from "@constants/url";

import assets from "@assets";

import TransactionFilterPage from "./TransactionFilterPage";

const { width } = Dimensions.get("window");
const ccTxnType = ["CC", "CC_EXPIRED"];

class TransactionHistoryScreen extends Component {
    state = {
        showFilterByModal: false,
        filterByIndex: 0,
        filterViewTxnsNames: [
            "Transaction History",
            "Debit Card History",
            "M2U History",
            "WU Transfer Status",
        ],
        filterCCNames: ["Transaction History", "Pending Transactions"],
        loaded: false,
        data: this.props.route.params.data,
        prevData: this.props.route.params.prevData,
        type: this.props.route.params.type,
        showFilterPage: false,
        oneMonthFilter: false,
        twoMonthsFilter: false,
        threeMonthsFilter: false,
        isPaginatedViaServer: true,
        statusCode: 0,
        txnReceiptResult: {},
        isLoading: false,
        isTxnHistoryLoaded: false,
    };

    componentDidMount = async () => {
        //logEvent view transaction history screen
        GABankingTransactionHistory.viewScreenAccTransaction();
        const txnType = this.state.type;
        if (ccTxnType.includes(txnType)) {
            await this._fetchTxnHistory(4);
        } else {
            await this._fetchTxnHistory(0);
        }
    };
    componentDidUpdate() {
        if (this.props.route?.params?.isCancelled) {
            this._fetchTxnHistory(3);
            this.props.navigation.setParams({ isCancelled: false });
        }
    }
    componentWillUnmount = async () => {
        await this._clearAll();
    };
    _clearAll = () => AsyncStorage.setItem("endDateToFilterData", "");

    parseDateTime = (date, getTime) => {
        const dateArray = date?.split(" T ");
        if (getTime) return dateArray[1];
        return moment(dateArray[0]).format("YYYY-MM-DD");
    };

    _mapTrxRecord = (formattedAmt, formattedFees, formatedRecipientAmt, wuTrx, trxDate, i) => {
        return {
            amt: formattedAmt,
            curCode: wuTrx?.DestCurCode,
            curAmt: formatedRecipientAmt,
            recipientAmt: formatedRecipientAmt,
            desc: "TRANSFER FR A/C WESTERN UNION",
            postingDate: moment(trxDate).format("DD MMM YYYY"),
            indicator: "D",
            expDate: moment(trxDate).format("DD MMM YYYY"),
            dueDate: "",
            transactionCode: "6610",
            transactionRefNo: "",
            wuFees: formattedFees,
            refNo: wuTrx?.MTCNNum,
            firstName: wuTrx?.ReceiverFirstName,
            lastName: wuTrx?.ReceiverLastName,
            countryCode: wuTrx?.DestCountryISOCode,
            transDate: wuTrx?.TransDate,
            accNo: wuTrx?.FromAcctNo,
            pinVerification: wuTrx?.TransDate,
            senderFirstName: wuTrx?.SenderFirstName,
            senderLastName: wuTrx?.SenderLastName,
            cancelFlag: wuTrx?.CancelFlag,
            txnType: wuTrx?.TransType,
            index: i,
            time: wuTrx?.time,
        };
    };

    _filterWuHistoryData = (list) => {
        const filteredWUHistory = list
            .filter((data) => {
                return data.FromAcctNo === this.state.data.acctNo;
            })
            .map((dataTrx) => {
                return {
                    ...dataTrx,
                    dateFormatted: this.parseDateTime(dataTrx?.TransDate),
                    time: this.parseDateTime(dataTrx?.TransDate, true),
                };
            });

        const dateArray = filteredWUHistory.map((wuTrxData) => {
            return this.parseDateTime(wuTrxData?.TransDate);
        });

        const listOfUniqueDates = _.orderBy(
            [...new Set(dateArray)],
            function (dateObj) {
                return moment(dateObj);
            },
            ["desc"]
        );
        return listOfUniqueDates.map((trxDate) => {
            const trxData = filteredWUHistory.filter((trxData) => {
                return trxData?.TransDate?.split(" T ")[0] === trxDate;
            });

            const trxObj = trxData.map((wuTrx, i) => {
                const formattedAmt = String(
                    parseFloat(wuTrx?.OriginationPrincipalAmt / 100).toFixed(2)
                );
                const formattedFees = String(parseFloat(wuTrx?.Fees / 100).toFixed(2));
                const formatedRecipientAmt = String(
                    parseFloat(wuTrx?.DestExpectedAmt / 100).toFixed(2)
                );

                return this._mapTrxRecord(
                    formattedAmt,
                    formattedFees,
                    formatedRecipientAmt,
                    wuTrx,
                    trxDate,
                    i
                );
            });

            const orderedTransactionList =
                trxObj?.length > 1
                    ? _.orderBy(
                          trxObj,
                          function (trxObjItem) {
                              return trxObjItem?.time;
                          },
                          ["desc"]
                      )
                    : trxObj;
            return {
                transactionList: orderedTransactionList,
                date: moment(trxDate).format("DD MMM YYYY"),
            };
        });
    };

    getWuTxnList = async () => {
        this.setState({ showArrow: true });
        try {
            const response = await wuTxnList();
            const result = response?.data?.txnList?.AcctTrnInfo;
            if (result?.length) {
                const transactionHistoryList = this._filterWuHistoryData(result);
                this.setState({
                    transactionHistoryList,
                    isTxnHistoryLoaded: false,
                });
                return transactionHistoryList;
            }
            this.setState({ isTxnHistoryLoaded: false });
        } catch (err) {
            showErrorToast({ message: COMMON_ERROR_MSG });
        } finally {
            this.setState({ loaded: true });
        }
    };

    _fetchTxnHistory = async (index) => {
        const { prevData, type } = this.state;
        // on/off flag for showing txn history for CC handles failed BTS. If BTS fails it will show us the previous CC txn behaviour
        const { isCardUnsettledTxnHistory } = this.props.getModel("misc");
        const ccOnFlag = isCardUnsettledTxnHistory && ccTxnType.includes(type);
        // index translation:
        // 0 - A - Transaction History/ CC Transaction History (when isCardUnsettledTxnHistory switch is enabled)
        // 1 - D - Debit Card History
        // 2 - M - M2U History
        // 3 - WU - WU Status
        // 4 - C - Credit Card History

        let option = "";
        this.setState({ isPaginatedViaServer: false, currentPage: 0, loaded: false });
        switch (index) {
            case 0:
                option = "A";
                !ccTxnType.includes(type) && this.setState({ isPaginatedViaServer: true });
                break;
            case 1:
                option = "D";
                break;
            case 2:
                option = "M";
                break;
            case 3:
                option = "WU";
                break;
            case 4:
                option = "C";
                break;
            default:
                // Fetch all by default
                option = "A";
                break;
        }
        // Reset data
        this.setState(
            {
                transactionHistoryList: [],
                totalTxnHistoryList: [],
                initialcount: 0,
                totalTransactionsOnPage: [],
                transactionsHistoryDataForFiltration: [],
                paginationRef: ccOnFlag ? PAGINATION_REF_CC : PAGINATION_REF,
                paginationStorage: [],
                accNo: prevData.number,
                option,
                accType: prevData.type,
                errorCode: null,
                type: ccOnFlag && "CC",
            },
            this._fetchData
        );
    };

    _fetchData = async (isWU) => {
        if (this.state.option === "WU") {
            await this.getWuTxnList();
            return;
        }
        await this._fetchTransaction();
    };

    _fetchTransaction = async () => {
        if (this.state.type !== "CC") {
            const endDate = await AsyncStorage.getItem("endDateToFilterData");
            const endPoint = this.state.isPaginatedViaServer
                ? "transactions/history"
                : "transactionhistory/filter";
            const extraParamsToPass = this.state.isPaginatedViaServer
                ? "&endDate=" +
                  this._calculateStartOrEndDate(endDate) +
                  "&paginationRef=" +
                  this.state.paginationRef
                : "";
            const url = `/casa/${endPoint}`;
            const params =
                "?accountNo=" +
                this.state.accNo +
                "&accountType=" +
                this.state.accType +
                "&option=" +
                this.state.option +
                extraParamsToPass;
            try {
                const response = await bankingGetDataMayaM2u(
                    url + params,
                    true,
                    true,
                    this.state.isPaginatedViaServer
                );
                if (this.state.isPaginatedViaServer) {
                    let { transactionHistoryList, paginationRef, noOfRecords, errorCode } =
                        response.data.result;
                    if (_.isNil(transactionHistoryList)) {
                        transactionHistoryList = [];
                        paginationRef = PAGINATION_REF;
                        noOfRecords = 0;
                    }
                    if (transactionHistoryList.length !== 0) {
                        this.setState({ isTxnHistoryLoaded: true });
                    }
                    await this._setTransactionLists(transactionHistoryList);
                    this.setState(
                        (prevState) => ({
                            loaded: true,
                            paginationRef,
                            perPageData: noOfRecords,
                            errorCode,
                            paginationStorage: [
                                ...prevState.paginationStorage,
                                {
                                    nextPageId: paginationRef,
                                    data: transactionHistoryList,
                                    perPageData: noOfRecords,
                                },
                            ],
                            currentPage: this.state.paginationStorage.length,
                        }),
                        () => {
                            this._loadInitialOrNextScreen();
                        }
                    );
                } else {
                    const { transactionHistoryList = [] } = response?.data?.result ?? {};
                    this.setState(
                        {
                            transactionHistoryList,
                            totalTxnHistoryList: transactionHistoryList,
                            transactionsHistoryDataForFiltration: transactionHistoryList,
                            totalTransactionsOnPage: transactionHistoryList,
                            loaded: true,
                            isTxnHistoryLoaded: false,
                        },
                        () => {
                            this.setState(
                                {
                                    perPageData:
                                        PER_PAGE_DATA_TRANSACTION_HISTORY > this._countTxn()
                                            ? this._countTxn()
                                            : PER_PAGE_DATA_TRANSACTION_HISTORY,
                                },
                                () => {
                                    this._loadInitialOrNextScreen();
                                }
                            );
                        }
                    );
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            // handle for CC txn only, "A" & "C" is for CC check with Posted transaction, Other than "A" & "C" is for CC check with Unposted transaction when switch is enabled
            const transactionType =
                this.state.option === "A" || this.state.option === "C"
                    ? POSTED_TXN_TYPE
                    : UNPOSTED_TXN_TYPE;

            this.setState({ transactionType });
            const url = `/transactions-history`;

            const oldCardNumber = this.state.data.cardNo;
            let newCardNumberGenerated = "";
            // Amex card transactions
            if (oldCardNumber.startsWith(3)) {
                newCardNumberGenerated = `0${oldCardNumber.substring(0, 15)}`;
            } else {
                newCardNumberGenerated = oldCardNumber.substring(0, 16);
            }
            const extraParams = {
                cardNumber: newCardNumberGenerated,
                continuationTokenPageNo: this.state.paginationRef,
                limitRecordPerPage: PER_PAGE_DATA_TRANSACTION_HISTORY,
                startDate: this._calculateStartOrEndDate(),
                endDate: null,
                source: CREDIT,
                transactionType,
            };

            try {
                const response = await bankingGetCCTxnHistory(url, extraParams);
                const ccResponse = response?.data;
                let creditCardTxnsList = ccResponse?.result?.data;
                let { continuationToken, totalSize } = ccResponse?.result?.pagination ?? "";
                const codeStatus = ccResponse?.code;
                if (_.isNil(creditCardTxnsList)) {
                    creditCardTxnsList = [];
                    totalSize = 0;
                }
                if (creditCardTxnsList.length !== 0) {
                    this.setState({ isTxnHistoryLoaded: true });
                }
                await this._setTransactionLists(creditCardTxnsList);
                this.setState(
                    (prevState) => ({
                        loaded: true,
                        paginationRef: continuationToken,
                        perPageData: totalSize,
                        errorCode: codeStatus === 400,
                        paginationStorage: [
                            ...prevState.paginationStorage,
                            {
                                nextPageId: continuationToken,
                                data: creditCardTxnsList,
                                perPageData: totalSize,
                            },
                        ],
                        currentPage: this.state.paginationStorage.length,
                    }),
                    () => {
                        this._loadInitialOrNextScreen();
                    }
                );
            } catch (error) {
                console.log(error);
            }
        }
    };

    _setTransactionLists = async (listReceived) => {
        this.setState({
            transactionHistoryList: listReceived,
            totalTxnHistoryList: listReceived,
            transactionsHistoryDataForFiltration: listReceived,
            totalTransactionsOnPage: listReceived,
            currentPage: 0,
        });
    };
    _calculateStartOrEndDate = (endDate) => {
        if (endDate != null) {
            return endDate;
        }
        const daysToReduce = this.state.accType === "S" || this.state.type === "CC" ? 90 : 60;
        const date = new Date();
        date.setDate(date.getDate() - daysToReduce);
        return `${date.getFullYear()}${this.getCalculatedMonth(date)}${date.getDate()}`;
    };

    _numberIndicatorCheck = (amt, indicator) => {
        if (amt) {
            const txnIndicator = ["D", "DR"];
            if (typeof amt === "string") {
                const num = Number(amt.replace(/,/g, ""));
                // "D" and "DR" symbolizes amount debited and is denoted with "-"
                return txnIndicator.includes(indicator) ? -num : num;
            }
            return txnIndicator.includes(indicator) ? -amt : amt;
        }
        return 0;
    };

    _onBackPress = () => this.props.navigation.goBack();
    _onPressViewMore = () =>
        this.props.navigation.navigate(navigationConstant.TRACKER_MODULE, {
            screen: navigationConstant.EXPENSES_DASHBOARD,
        });

    _toggleFilterByModal = () => {
        this.setState({
            showFilterByModal: !this.state.showFilterByModal,
            oneMonthFilter: false,
            twoMonthsFilter: false,
            threeMonthsFilter: false,
        });
    };

    _onFilterByPressDone = async () => {
        const { showFilterByModal, selectedFilterByIndex } = this.state;
        if (!selectedFilterByIndex || selectedFilterByIndex === 0) this._clearAll();
        this.setState(
            {
                showFilterByModal: !showFilterByModal,
                filterByIndex: selectedFilterByIndex || 0,
                oneMonthFilter: false,
                twoMonthsFilter: false,
                threeMonthsFilter: false,
            },
            async () => {
                //fetch new transactions based on filter index
                await this._fetchTxnHistory(selectedFilterByIndex || 0);
            }
        );
    };

    _onFilterValueChange = (data, selectedIndex) => {
        this.setState({ filterByCertificateValue: data, selectedFilterByIndex: selectedIndex });
        //to logEvent for filter
        this._logEventFilterValueChange(this.state.selectedFilterByIndex, "FilterValue");
    };

    _renderFilterByModal = () => {
        const { filterViewTxnsNames, filterCCNames, filterByIndex } = this.state;
        return (
            <View style={stylesFilterBy.containerBottom}>
                <View style={stylesFilterBy.containerModal}>
                    {/* Top bar section */}
                    <View style={stylesFilterBy.containerTopBar}>
                        {/* Close button */}
                        <View style={stylesFilterBy.btnClose}>
                            <TouchableOpacity onPress={this._toggleFilterByModal}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={BLUE}
                                    text="Cancel"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Done button */}
                        <View style={stylesFilterBy.btnDone}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={15}
                                height={30}
                                width={96}
                                componentCenter={
                                    <Typo
                                        fontSize={12}
                                        color={BLACK}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text={DONE}
                                    />
                                }
                                onPress={this._onFilterByPressDone}
                            />
                        </View>
                    </View>

                    {/* Picker section */}
                    <View style={stylesFilterBy.containerPicker}>
                        <ScrollPicker
                            //ref={(sp) => {this.sp = sp}}
                            dataSource={
                                this.state.type === "CC" ? filterCCNames : filterViewTxnsNames
                            }
                            selectedIndex={filterByIndex}
                            itemHeight={44}
                            wrapperHeight={240}
                            wrapperColor={WHITE}
                            highlightColor={GREY_200}
                            renderItem={this._renderSelectedDropdown}
                            onValueChange={this._onFilterValueChange}
                        />
                    </View>
                </View>
            </View>
        );
    };

    _onCancelSuccess = () => {
        this._fetchTxnHistory(3);
    };

    _onGoBack = () => {
        this.props.navigation.navigate(navigationConstant.BANKING_TXNHISTORY_SCREEN, {
            ...this.props.route?.params,
            isCancelled: true,
        });
    };
    _onPressWuTrx = (data) => {
        console.tron.log("test", {
            transferParams: data?.item,
            ...data,
        });
        this.props.navigation.navigate("TransactionStatus", {
            params: {
                transferParams: data?.item,
                ...data,
            },
            onGoBack: this._onGoBack,
            onCancelSuccess: this._onCancelSuccess,
        });
    };

    checkWUTC = (wuTC, title) => {
        if (this.state.showArrow === true) { return wuTC === "6610" || title.includes("WESTERN UNION"); }
    };

    _renderSelectedDropdown = (data, index, isSelected) => {
        return (
            <View>
                {isSelected
                ? (
                    <View style={stylesFilterBy.selectedItemContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={19}
                            color={BLACK}
                            text={data}
                        />
                    </View>
                ) 
                : (
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={19}
                        color={DARK_GREY}
                        text={data}
                    />
                )}
            </View>
        );
    };

    _renderItems = ({ item }) => {
        const { type, accType, option } = this.state;
        const { getModel } = this.props;
        const { isReprintReceiptReady } = getModel("misc");
        const currentCode = item.curCode;
        const hasForeignAmt = currentCode !== "000" && parseFloat(item?.curAmt) > 0.0;
        const isWUTrx = this.checkWUTC(item?.transactionCode, item?.desc);
        const amount =
            currentCode === "000" || currentCode === "" || hasForeignAmt ? item.amt : item.curAmt;
        const foreignAmt = hasForeignAmt
            ? this._numberIndicatorCheck(item.curAmt, item.indicator)
            : "";
        return (
            <View style={styles.containerTrackerListItem}>
                {type !== "CC"
? (
                    <TxnHistoryListItem
                        title={item.desc}
                        desc={accType === "C" ? item.postingDate : ""}
                        amount={this._numberIndicatorCheck(amount, item.indicator)}
                        hideIcon
                        isReprintReceiptReady={isReprintReceiptReady}
                        option={option}
                        isShowReceiptEnabled={item.reprintReceiptEnableFlag}
                        onShareReceiptButtonPressed={() =>
                            this._onShareReceiptButtonPressed(
                                item.transactionRefNo,
                                parseFloat(item.amt).toFixed(2)
                            )
                        }
                        showArrowIcon={isWUTrx}
                        onListItemPressed={
                            isWUTrx
                                ? () => {
                                      this._onPressWuTrx({
                                          transcodeWU: item?.transactionCode,
                                          item,
                                          refNo: item?.refNo,
                                          ...item,
                                      });
                                  }
                                : null
                        }
                        foreignCurr={currentCode}
                        foreignAmt={foreignAmt}
                    />
                )
: (
                    <TxnHistoryListItem
                        title={item.description}
                        desc={item.transactionType === POSTED_TXN_TYPE ? item.transactionDate : ""}
                        amount={this._numberIndicatorCheck(
                            item.amountLocal,
                            item.transactionIndicator
                        )}
                        foreignAmt={this._numberIndicatorCheck(
                            item.amountForeign,
                            item.transactionIndicator
                        )}
                        foreignCurr={item.currencyForeign}
                        hideIcon
                    />
                )}
            </View>
        );
    };

    _renderTxnItems = (data, date, index) => {
        return (
            <FlatList
                data={data}
                extraData={this.state.refresh}
                renderItem={this._renderItems}
                listKey={`${date}-${index}`}
                keyExtractor={(item, index) => `${date}-${index}`}
            />
        );
    };

    _flattenTransactionList = (totalTxnHistoryList) => {
        const transactionHistoryData = totalTxnHistoryList?.map((txn) =>
            this.state.type !== "CC" ? txn.transactionList : txn
        );
        return transactionHistoryData.flat().map((txn) => txn);
    };
    /**
     * Refactor the flattened array to the form of array which is being used in render(means segregated by date)
     * @param {Array} flatTransactionHistoryPerList recieving a flat transaction array
     * @returns {Array} the array which will be of the same form transactionHistoryList
     */
    _refactorTransactionList = (flatTransactionHistoryPerList) => {
        const transactionHistoryObjectsPerList = flatTransactionHistoryPerList.reduce(
            (objectsByKeyValue, obj) => {
                let value = "";
                if (this.state.type === "CC") {
                    if (this.state.transactionType === POSTED_TXN_TYPE) {
                        value = obj.postingDate;
                    } else {
                        value = obj.transactionDate;
                    }
                } else {
                    value = obj.postingDate;
                }
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            },
            {}
        );
        return Object.entries(transactionHistoryObjectsPerList).map(
            ([key, value]) => {
                return { date: key, transactionList: value };
            }
        );
    };
    _loadInitialOrNextScreen = () => {
        const { totalTxnHistoryList } = this.state;
        const flatData = this._flattenTransactionList(totalTxnHistoryList);
        const flatTransactionHistoryPerList = flatData?.filter((txn, count) => {
            if (
                count >= this.state.initialcount &&
                count < this.state.initialcount + PER_PAGE_DATA_TRANSACTION_HISTORY
            ) {
                return txn;
            }
        });
        const transactionHistoryPerList = this._refactorTransactionList(
            flatTransactionHistoryPerList
        );
        this.setState({ transactionHistoryList: transactionHistoryPerList });
    };
    _txnDataAfter = async () => {
        const { currentPage, paginationStorage, type } = this.state;
        if (this.state.isPaginatedViaServer || type === "CC") {
            const nextPage = currentPage + 1;
            if (nextPage < paginationStorage.length) {
                await this._setTransactionLists(paginationStorage[nextPage].data);
                this.setState(
                    {
                        paginationRef: paginationStorage[nextPage].nextPageId,
                        perPageData: paginationStorage[nextPage].noOfRecords,
                        currentPage: nextPage,
                    },
                    () => {
                        this._loadInitialOrNextScreen();
                    }
                );
            } else {
                this._fetchTransaction();
                this._loadInitialOrNextScreen();
            }
        } else {
            const { initialcount, perPageData, currentPage } = this.state;
            const nextPage = currentPage + 1;
            const currentPageCount = perPageData + PER_PAGE_DATA_TRANSACTION_HISTORY;
            this.setState(
                {
                    initialcount: initialcount + PER_PAGE_DATA_TRANSACTION_HISTORY,
                    perPageData:
                        currentPageCount > this._countTxn() ? this._countTxn() : currentPageCount,
                    currentPage: nextPage,
                },
                () => {
                    this._loadInitialOrNextScreen();
                }
            );
        }
    };
    _txnDataBefore = async () => {
        const { currentPage, paginationStorage, type } = this.state;
        const prevPage = currentPage - 1;
        if ((this.state.isPaginatedViaServer || type === "CC") && currentPage > 0) {
            await this._setTransactionLists(paginationStorage[prevPage].data);
            this.setState(
                {
                    paginationRef: paginationStorage[prevPage].nextPageId,
                    perPageData: paginationStorage[prevPage].noOfRecords,
                    currentPage: prevPage,
                },
                () => {
                    this._loadInitialOrNextScreen();
                }
            );
        } else {
            const { totalTxnHistoryList, initialcount } = this.state;
            const flatData = this._flattenTransactionList(totalTxnHistoryList);
            const flatTransactionHistoryPerList = flatData?.filter((txn, count) => {
                if (
                    count < this.state.initialcount &&
                    count >= this.state.initialcount - PER_PAGE_DATA_TRANSACTION_HISTORY
                ) {
                    return txn;
                }
            });
            const transactionHistoryPerList = this._refactorTransactionList(
                flatTransactionHistoryPerList
            );
            const currentPageData = initialcount;
            this.setState({
                transactionHistoryList: transactionHistoryPerList,
                initialcount: initialcount - PER_PAGE_DATA_TRANSACTION_HISTORY,
                perPageData: currentPageData < 0 ? 0 : currentPageData,
                currentPage: prevPage,
            });
        }
    };
    _checkIfPrevDisabled = () => {
        if (this.state.isPaginatedViaServer || this.state.type === "CC") {
            return this.state.currentPage === 0;
        } else {
            return this.state.initialcount === 0;
        }
    };
    _checkIfNextDisabled = () => {
        if (this.state.isPaginatedViaServer && this.state.type !== "CC") {
            return this.state.paginationRef === PAGINATION_REF;
        } else if (this.state.type === "CC") {
            return this.state.paginationRef === ("" || CONTINUATION_TOKEN_LAST_PAGE);
        }
        return this.state.perPageData === this._countTxn();
    };

    _paginationFooter = () => {
        const { currentPage } = this.state;
        return currentPage + 1;
    };

    _countTxn = () => {
        if (this.state.isPaginatedViaServer) {
            return this.state.perPageData;
        }
        const { totalTransactionsOnPage } = this.state;
        const initialValue = 0;
        const transactionHistoryPerList =
            this.state.type !== "CC"
                ? totalTransactionsOnPage?.map((c) => {
                      return c.transactionList?.length;
                  })
                : totalTransactionsOnPage.length;

        return transactionHistoryPerList?.reduce(
            (previousValue, currentValue) => previousValue + currentValue,
            initialValue
        );
    };

    _onFilterTransactionPressed = () => {
        if (!this.state.showFilterPage) {
            GABankingTransactionHistory.selectActionFilterTransaction();
            this._logEventFilterValueChange(this.state.filterByIndex, "FilterTransaction");
        }
        this.setState((prevState) => ({ showFilterPage: !prevState.showFilterPage }));
    };

    _logEventFilterValueChange = (index, from) => {
        if (from === "FilterTransaction") {
            const fieldName =
                index === 0
                    ? FA_MAYBANK2U_TRANSACTIONHISTORY_FILTER
                    : index === 1
                    ? FA_MAYBANK2U_DEBITCARD_HISTORY_FILTER
                    : FA_MAYBANK2U_M2UHISTORY_FILTER;

            GABankingTransactionHistory.viewScreenFromFilterTransaction(fieldName);
        } else {
            const fieldName =
                index === 0
                    ? FA_TRANSACTION_HISTORY
                    : index === 1
                    ? FA_DEBITCARD_HISTORY
                    : FA_M2U_HISTORY;

            GABankingTransactionHistory.selectDropDownAccTransaction(fieldName);
        }
    };

    _showDataAsPerFiltration = (days) => {
        const { transactionsHistoryDataForFiltration } = this.state;
        const today = new Date();
        const priorMonth = moment(new Date().setDate(today.getDate() - days));
        const priorTxnData = transactionsHistoryDataForFiltration.filter((txn) => {
            return moment(txn.date, "DD MMM YYYYY") >= priorMonth;
        });

        this.setState(
            {
                totalTransactionsOnPage: priorTxnData,
                transactionHistoryList: priorTxnData,
                totalTxnHistoryList: priorTxnData,
            },
            () => {
                this.setState(
                    {
                        initialcount: 0,
                        perPageData:
                            PER_PAGE_DATA_TRANSACTION_HISTORY > this._countTxn()
                                ? this._countTxn()
                                : PER_PAGE_DATA_TRANSACTION_HISTORY,
                    },
                    () => {
                        this._loadInitialOrNextScreen();
                    }
                );
            }
        );
    };

    getCalculatedMonth = (date) => {
        if (date.getMonth() >= 9) {
            return date.getMonth() + 1;
        } else {
            return "0" + (date.getMonth() + 1);
        }
    };

    _applyFilterTransactions = (days) => {
        if (this.state.isPaginatedViaServer) {
            this._setTransactionLists([]);
            this.setState({
                paginationRef: "",
                perPageData: 0,
                paginationStorage: [],
                loaded: false,
            });

            const date = new Date();
            date.setDate(date.getDate() - days);
            const endDateToFilterData = `${date.getFullYear()}${this.getCalculatedMonth(
                date
            )}${date.getDate()}`;
            AsyncStorage.setItem("endDateToFilterData", endDateToFilterData);
            this._fetchTransaction();
        }
        this.setState({
            currentPage: 0,
        });
        this._showDataAsPerFiltration(days);
        if (days === 30) {
            this.setState({
                oneMonthFilter: true,
                twoMonthsFilter: false,
                threeMonthsFilter: false,
            });
        }
        if (days === 60) {
            this.setState({
                oneMonthFilter: false,
                twoMonthsFilter: true,
                threeMonthsFilter: false,
            });
        }
        if (days === 90) {
            this.setState({
                oneMonthFilter: false,
                twoMonthsFilter: false,
                threeMonthsFilter: true,
            });
        }
    };

    _renderTxnSections = () => {
        const { transactionHistoryList } = this.state;
        return (
            <React.Fragment>
                <FlatList
                    scrollsToTop
                    data={transactionHistoryList}
                    // extraData={refresh}
                    // eslint-disable-next-line react/jsx-no-bind
                    renderItem={({ item, index }) => (
                        <React.Fragment>
                            <TrackerSectionItem date={item.date} hideAmount />
                            {this._renderTxnItems(item.transactionList, item.date, index)}
                        </React.Fragment>
                    )}
                    keyExtractor={(item, index) => `${item.date}-${index}`}
                />
            </React.Fragment>
        );
    };

    _renderEmptyState = (header, description) => {
        return (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateTxtContainer}>
                    <View style={styles.emptyStateTitle}>
                        <Typo text={header} fontSize={18} lineHeight={32} fontWeight="700" />
                    </View>
                    <Typo text={description} fontSize={12} lineHeight={18} />
                </View>
                <View style={styles.emptyStateBgImgContainer}>
                    <Image
                        source={assets.noTransactionIllustration}
                        style={styles.noTransactionsImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    };
    _getReceiptDetails = async (transactionRefNo, amount) => {
        const transactionDetailsForReceipt = {
            transactionDetails: [],
        };
        let txnReceiptDetails;
        const url = TXN_HISTORY_RECEIPT;
        const params = "?transactionRef=" + transactionRefNo + "&amount=RM%20" + amount;

        await bankingGetDataMayaM2u(url + params, false)
            .then(async (response) => {
                if (response) {
                    this.setState({
                        statusCode: response?.data?.code,
                        txnReceiptResult: response?.data?.result,
                    });
                }
                const { receiptDetails, transactionType, txnStatus, txnStatusText } =
                    response?.data?.result ?? {};
                transactionDetailsForReceipt.transactionTypeHeadToDisplay = transactionType || "";

                txnReceiptDetails = receiptDetails;
                if (txnReceiptDetails === null || txnReceiptDetails === undefined) {
                    txnReceiptDetails = [];
                }

                transactionDetailsForReceipt.transactionDetails = txnReceiptDetails;
                transactionDetailsForReceipt.transactionStatus = txnStatus;
                transactionDetailsForReceipt.transactionStatusText = txnStatusText;
            })
            .catch((err) => {
                showErrorToast({
                    message: TRANSACTION_RECEIPT_NOT_FOUND,
                });
                return [];
            });
        return transactionDetailsForReceipt;
    };

    _openPDFViewer(file) {
        this.props.navigation.navigate("commonModule", {
            screen: "PDFViewer",
            params: {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
            },
        });
    }

    /**
     * handler for view reciept pdf for transaction
     * @param {String} transactionRefNo transaction id received
     * @returns {Undefined}
     */
    _onShareReceiptButtonPressed = async (transactionRefNo, amount) => {
        this.setState({ isLoading: true });
        const transactionDetailsForReceipt = await this._getReceiptDetails(
            transactionRefNo,
            amount
        );
        try {
            if (transactionDetailsForReceipt.transactionDetails.length > 0) {
                const file = await CustomPdfGenerator.generateReceipt(
                    true,
                    transactionDetailsForReceipt?.transactionTypeHeadToDisplay,
                    true,
                    RECEIPT_NOTE,
                    transactionDetailsForReceipt?.transactionDetails,
                    true,
                    transactionDetailsForReceipt?.transactionStatus,
                    transactionDetailsForReceipt?.transactionStatusText
                );
                if (!file) {
                    return;
                }
                if (this.state.statusCode === 200 && this.state.txnReceiptResult != null) {
                    this._openPDFViewer(file);
                } else {
                    throw new Error(TRANSACTION_RECEIPT_NOT_FOUND);
                }
            } else {
                throw new Error(TRANSACTION_RECEIPT_NOT_FOUND);
            }
        } catch (error) {
            showErrorToast({
                message: error?.message,
            });
        } finally {
            this.setState({ isLoading: false });
        }
    };
    /**
     * Handler to show screen with No further txn history found when txns are in multiple of 20.
     * @returns {Boolean} return true if txns are in multiple of 20, and show screen no further txn history found instead of start spending.
     */
    _isFurtherTxnHistoryNotFound = () => {
        return isEmpty(this.state.transactionHistoryList) && this.state.isTxnHistoryLoaded;
    };

    _checkTypeandAccType = () => {
        return this.state.transactionHistoryList?.length > 0 && (this.state.type === "CC" || this.state.accType !== "C");
    };

    render() {
        const {
            showFilterByModal,
            filterViewTxnsNames,
            filterCCNames,
            filterByIndex,
            transactionHistoryList,
            type,
            loaded,
            prevData,
            showFilterPage,
            oneMonthFilter,
            twoMonthsFilter,
            threeMonthsFilter,
            errorCode,
            accType,
            option,
            isLoading,
        } = this.state;
        return showFilterPage 
        ? (
            <TransactionFilterPage
                accType={prevData.type}
                stateToggle={this._onFilterTransactionPressed}
                filterTransactionData={this._applyFilterTransactions}
                historySelected={filterViewTxnsNames[filterByIndex]}
                oneMonthFilter={oneMonthFilter}
                twoMonthsFilter={twoMonthsFilter}
                threeMonthsFilter={threeMonthsFilter}
            />
        )
        : (
            <ScreenContainer
                backgroundType="color"
                backgroundColor="#efeff3"
                showLoaderModal={!loaded || isLoading}
            >
                <>
                    <Modal
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                        hasBackdrop={false}
                        visible={showFilterByModal}
                        style={styles.filterModal}
                        hideModalContentWhileAnimating
                        useNativeDriver
                        transparent
                    >
                        {this._renderFilterByModal()}
                    </Modal>

                    <ScreenLayout
                        paddingBottom={
                            transactionHistoryList?.length > 0 &&
                            (accType === "D" || accType === "S" || type === "CC") &&
                            option !== "WU"
                                ? 36
                                : 0
                        }
                        paddingTop={0}
                        paddingHorizontal={0}
                        neverForceInset={["bottom"]}
                        useSafeArea
                        header={
                            loaded && (
                                <HeaderLayout
                                    headerCenterElement={
                                        <Typo
                                            text="Transactions"
                                            fontWeight="600"
                                            fontSize={16}
                                            lineHeight={19}
                                        />
                                    }
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this._onBackPress} />
                                    }
                                />
                            )
                        }
                    >
                        <View style={styles.container}>
                            {/* Show dropdown list, unless it's a Credit Card */}
                            {type === "CC"
? (
                                <View style={styles.dropDownContainer}>
                                    <ActionButton
                                        width={width - 48}
                                        backgroundColor={WHITE}
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentLeft={
                                            <View style={styles.componentContainer}>
                                                <Typo text={filterCCNames[filterByIndex]} />
                                            </View>
                                        }
                                        componentRight={
                                            <View style={styles.componentContainer}>
                                                <Image
                                                    source={assets.dropdownIcon}
                                                    style={styles.dropDownIcon}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                        }
                                        onPress={this._toggleFilterByModal}
                                    />
                                </View>
                            ) : (
                                accType !== "C" &&
                                loaded && (
                                    <View style={styles.dropDownContainer}>
                                        <ActionButton
                                            width={
                                                option !== "WU" &&
                                                transactionHistoryList?.length > 0 &&
                                                (accType === "D" || accType === "S")
                                                    ? width - 100
                                                    : width - 48
                                            }
                                            backgroundColor={WHITE}
                                            borderWidth={1}
                                            borderColor={GREY}
                                            componentLeft={
                                                <View style={styles.componentContainer}>
                                                    <Typo
                                                        text={filterViewTxnsNames[filterByIndex]}
                                                    />
                                                </View>
                                            }
                                            componentRight={
                                                <View style={styles.componentContainer}>
                                                    <Image
                                                        source={assets.dropdownIcon}
                                                        style={styles.dropDownIcon}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            }
                                            onPress={this._toggleFilterByModal}
                                        />
                                        {option !== "WU" &&
                                            transactionHistoryList?.length > 0 &&
                                            (accType === "D" || accType === "S") && (
                                                <TouchableOpacity
                                                    onPress={this._onFilterTransactionPressed}
                                                >
                                                    <Image
                                                        source={assets.iconFilter}
                                                        style={styles.iconFilter}
                                                        resizeMode="contain"
                                                    />
                                                    {(oneMonthFilter ||
                                                        twoMonthsFilter ||
                                                        threeMonthsFilter) && (
                                                        <View style={styles.redDot} />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                    </View>
                                )
                            )}

                            {/* Body */}
                            {loaded && (
                                <>
                                    {transactionHistoryList && transactionHistoryList.length > 0 && (
                                        <ScrollView style={styles.svContainer}>
                                            {this._renderTxnSections()}
                                            <View style={styles.bottomContainer} />
                                        </ScrollView>
                                    )}
                                    {this._isFurtherTxnHistoryNotFound() && this._renderEmptyState(
                                        NO_FURTHER_TRANSACTION_HISTORY_AVAILABLE_HEADING, 
                                        NO_FURTHER_TRANSACTION_HISTORY_AVAILABLE_DESC
                                    )}
                                    {transactionHistoryList &&
                                        !transactionHistoryList.length && !this.state.isTxnHistoryLoaded &&
                                        (errorCode
                                            ? this._renderEmptyState(
                                                  NO_TRANSACTION_AVAILABLE_24_HOUR_MODE_HEADING,
                                                  NO_TRANSACTION_AVAILABLE_24_HOUR_MODE_DESC
                                              )
                                            : this._renderEmptyState(
                                                  NO_TRANSACTION_AVAILABLE_HEADING,
                                                  NO_TRANSACTION_AVAILABLE_DESC
                                              ))}

                                    {!transactionHistoryList && !this.state.isTxnHistoryLoaded &&
                                        !errorCode &&
                                        this._renderEmptyState(
                                            NO_TRANSACTION_AVAILABLE_HEADING,
                                            NO_TRANSACTION_AVAILABLE_DESC
                                        )}
                                </>
                            )}
                            {option !== "WU" &&
                                (this._checkTypeandAccType() ||
                                    this._isFurtherTxnHistoryNotFound()) &&
                                loaded && (
                                    <View
                                        // eslint-disable-next-line react-native/no-inline-styles
                                        style={this._isFurtherTxnHistoryNotFound() ? [styles.noFurtherTxnPagination, styles.transactionListStyle] : styles.transactionListStyle }
                                    >
                                        <TouchableOpacity
                                            onPress={this._txnDataBefore}
                                            disabled={this._checkIfPrevDisabled()}
                                        >
                                            {this._checkIfPrevDisabled()
? (
                                                <Image
                                                    source={assets.disabledArrowLeftIcon}
                                                    style={styles.leftArrowPaginationDisabled}
                                                    resizeMode="contain"
                                                />
                                            )
: (
                                                <Image
                                                    source={assets.enabledArrowLeftIcon}
                                                    style={styles.leftArrowPagination}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </TouchableOpacity>
                                        <Typo
                                            text={this._paginationFooter()}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                        <TouchableOpacity
                                            onPress={this._txnDataAfter}
                                            disabled={this._checkIfNextDisabled()}
                                        >
                                            {this._checkIfNextDisabled() 
                                            ? (
                                                <Image
                                                    source={assets.disabledArrowRightIcon}
                                                    style={styles.rightArrowPaginationDisabled}
                                                    resizeMode="contain"
                                                />
                                            )
                                            : (
                                                <Image
                                                    source={assets.enabledArrowRightIcon}
                                                    style={styles.rightArrowPagination}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                        </View>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

TransactionHistoryScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    isReprintReceiptReady: PropTypes.bool,
    getModel: PropTypes.func,
};
export default withModelContext(TransactionHistoryScreen);

const styles = StyleSheet.create({
    bottomContainer: {
        marginBottom: 24,
    },
    componentContainer: {
        marginHorizontal: 24,
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    containerTrackerListItem: {
        marginHorizontal: 4,
    },
    dropDownContainer: {
        backgroundColor: MEDIUM_GREY,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 24,
        width: "100%",
    },
    dropDownIcon: {
        height: 10,
        width: 16,
    },
    emptyStateBgImgContainer: {
        alignItems: "center",
        flex: 0.6,
    },
    emptyStateContainer: {
        backgroundColor: WHITE,
        flex: 1,
    },
    emptyStateTitle: {
        marginBottom: 8,
    },
    emptyStateTxtContainer: {
        flex: 0.4,
        marginHorizontal: 48,
        marginTop: 24,
    },
    filterModal: {
        margin: 0,
    },
    iconFilter: {
        height: 22,
        marginTop: 10,
        width: 22,
    },
    leftArrowPagination: {
        marginRight: 28,
    },
    leftArrowPaginationDisabled: {
        marginRight: 28,
    },
    noTransactionsImage: {
        flex: 1,
    },
    redDot: {
        backgroundColor: NOTIF_RED,
        borderRadius: 4,
        bottom: 21,
        height: 8,
        marginLeft: 24,
        width: 8,
    },
    rightArrowPagination: {
        marginLeft: 28,
    },
    rightArrowPaginationDisabled: {
        marginLeft: 28,
    },
    svContainer: {
        backgroundColor: WHITE,
        flex: 1,
    },
    transactionListStyle: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        paddingTop: 37,
    },
    noFurtherTxnPagination: {
        paddingBottom: 36,
    }
});

const stylesFilterBy = StyleSheet.create({
    btnClose: {
        backgroundColor: WHITE,
        flex: 1,
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: WHITE,
    },
    containerBottom: {
        alignItems: "center",
        backgroundColor: BLACK_700,
        flex: 1,
        justifyContent: "flex-end",
    },
    containerModal: {
        height: 300,
        width,
    },
    containerPicker: {
        height: 240,
        width,
    },
    containerTopBar: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        height: 60,
        paddingHorizontal: 24,
        width,
    },
    selectedItemContainer: {
        alignItems: "center",
        backgroundColor: OFF_WHITE,
        height: 44,
        justifyContent: "center",
        width,
    },
});

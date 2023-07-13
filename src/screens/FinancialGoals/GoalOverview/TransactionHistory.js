import { groupBy } from "lodash";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, SectionList } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_TRANSACTION_DETAILS,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getTransactionHistory } from "@services";

import { GREEN, RED, WHITE, BLACK, GREY_200, GRAY } from "@constants/colors";
import { TRANSACTION_HISTORY, TODAY, YESTERDAY, COMMON_ERROR_MSG } from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const TransactionHistory = ({ navigation, route }) => {
    const [transactionHistoryList, setTransactionHistoryList] = useState(null);
    const [transactionTypeMap, setTransactionTypeMap] = useState(null);

    const [pageCount, setPageCount] = useState(0);
    const [pageOffset, setPageOffset] = useState(1);

    function onPressClose() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
            params: {
                currentTab: "PERFORMANCE",
            },
        });
    }

    const init = useCallback(async () => {
        try {
            const response = await getTransactionHistory(
                route?.params?.data?.goalId,
                pageOffset,
                10,
                false
            );
            if (response?.data?.data) {
                if (transactionHistoryList && transactionHistoryList.length) {
                    setTransactionHistoryList([...transactionHistoryList, ...response?.data?.data]);
                } else {
                    setTransactionHistoryList(response?.data?.data);
                }
            }

            if (response?.data?.transTypeMap) {
                setTransactionTypeMap(response?.data?.transTypeMap);
            }

            if (response?.data?.paginationDTO) {
                const noOfPages =
                    Number(response?.data?.paginationDTO?.totalSize) /
                    Number(response?.data?.paginationDTO?.limit);

                setPageCount(
                    noOfPages % 2 === 0 ? Math.floor(noOfPages) : Math.floor(noOfPages) + 1
                );
            }
        } catch (e) {
            showErrorToast({
                message: e?.message ?? COMMON_ERROR_MSG,
            });
        }
    }, [route, pageOffset]);

    useEffect(() => {
        init();
    }, [init]);

    function onPressItem(details) {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TRANSACTION_DETAILS,
            params: {
                details,
                title: details?.refDesc,
                govCharge: route?.params?.data?.govCharge,
            },
        });
    }

    const groupDataByDate = (data) => {
        if (!data) return [];
        const result = groupBy(data, (data) => data.createdDate);
        const formattedData = [];
        Object.keys(result).forEach((key, _) => {
            formattedData.push({
                title: key,
                data: result?.[key],
            });
        });
        return formattedData;
    };

    function renderTransactionHistory({ item }) {
        return (
            <TransactionHistoryItem
                transType={item?.transType}
                transTypeMap={transactionTypeMap}
                amount={item?.totalAmount}
                item={item}
                onPressItem={onPressItem}
            />
        );
    }

    // eslint-disable-next-line react/prop-types
    function renderTransactionHeader({ section: { title } }) {
        return <TransactionHistoryHeader transDate={title} />;
    }

    function keyExtractor(item, index) {
        return `${item}-${index}`;
    }

    function onEndReachedEvent() {
        if (pageOffset < pageCount) {
            setPageOffset(pageOffset + 1);
        }
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onPressClose} />}
                        headerCenterElement={
                            <View>
                                <View style={Styles.paddingVertical10}>
                                    <HeaderLabel>{TRANSACTION_HISTORY}</HeaderLabel>
                                </View>
                            </View>
                        }
                        backgroundColor={WHITE}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <SectionList
                    sections={groupDataByDate(transactionHistoryList)}
                    renderItem={renderTransactionHistory}
                    renderSectionHeader={renderTransactionHeader}
                    showVerticalScrollIndicator={false}
                    onEndReached={onEndReachedEvent}
                    keyExtractor={keyExtractor}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

TransactionHistory.propTypes = {
    navigation: PropTypes.object,
    item: PropTypes.object,
    route: PropTypes.object,
};

const TransactionHistoryHeader = ({ transDate }) => {
    function getDateHeader() {
        if (moment(transDate).isSame(Date.now(), "day")) {
            return TODAY;
        } else if (
            moment(transDate).isSame(
                moment(Date.now()).subtract(1, "days").startOf("day"),
                "day"
            ) === true
        ) {
            return YESTERDAY;
        } else {
            return transDate;
        }
    }
    return (
        <View style={Styles.headerContainer}>
            <Typo
                text={getDateHeader()}
                lineHeight={24}
                textAlign="left"
                fontWeight="600"
                fontSize={12}
                color={BLACK}
            />
        </View>
    );
};

TransactionHistoryHeader.propTypes = {
    transDate: PropTypes.string,
};

const TransactionHistoryItem = ({ transType, transTypeMap, amount, item, onPressItem }) => {
    const transactionAmount = (() => {
        return amount < 0
            ? `- RM ${numeral(amount).format("0.00")}`
            : `RM ${numeral(amount).format("0.00")}`;
    })();

    function onPressCell() {
        onPressItem(item);
    }

    return (
        <TouchableOpacity style={Styles.contentContainer} onPress={onPressCell}>
            <View style={Styles.transHistoryDescStyle}>
                <Typo
                    text={item?.refDesc}
                    lineHeight={24}
                    textAlign="left"
                    fontWeight="600"
                    fontSize={12}
                    color={BLACK}
                    style={Styles.label}
                />
                <Typo
                    text={`Status: ${item?.statusCd}`}
                    lineHeight={24}
                    textAlign="left"
                    fontWeight="600"
                    fontSize={12}
                    color={GRAY}
                    style={Styles.label}
                />
            </View>
            <View style={Styles.transHistoryAmtStyle}>
                <Typo
                    text={
                        transType === "02"
                            ? "-" + numberWithCommas(transactionAmount)
                            : numberWithCommas(transactionAmount)
                    }
                    lineHeight={24}
                    textAlign="right"
                    fontWeight="600"
                    fontSize={14}
                    color={transType === "02" ? RED : GREEN}
                    style={Styles.label}
                />
            </View>
        </TouchableOpacity>
    );
};

TransactionHistoryItem.propTypes = {
    transType: PropTypes.string,
    transTypeMap: PropTypes.object,
    amount: PropTypes.number,
    item: PropTypes.object,
    onPressItem: PropTypes.func,
};

const Styles = StyleSheet.create({
    contentContainer: {
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContainer: {
        backgroundColor: GREY_200,
        borderRadius: 0,
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    label: {
        flex: 1,
    },
    paddingVertical10: { paddingVertical: 10 },
    transHistoryAmtStyle: {
        flex: 1,
    },
    transHistoryDescStyle: {
        flex: 2,
    },
});

export default TransactionHistory;

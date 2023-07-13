import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, RefreshControl, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { SendRequestToPayList } from "@components/Common/SendRequestToPayList";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getRtpList, getBillingList } from "@services";

import { MEDIUM_GREY, FADE_SELECT_GREY, DARK_LIGHT_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    analyticsSelectItem,
    analyticsViewAll,
    mapRTPData,
    mapAutoDebitData,
    filterAutoDebitBasedOnUser,
} from "@utils/dataModel/rtdHelper";

import Assets from "@assets";

function ViewAllScreen({ navigation, route }) {
    const { requestStatus, reqType, dataArr, isRtpEnabled, isRTPRequest } = route.params || {};

    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [offsetNo, setOffsetNo] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [dataRTPArray, setDataRTPArray] = useState(dataArr ?? []);
    const [listRtp, setListRtp] = useState({});

    useEffect(() => {
        analyticsViewAll(reqType);

        if (reqType === Strings.RTP_AUTODEBIT) {
            getAutoDebitListAPI();
        } else {
            getRtpListAPI();
        }
    }, []);

    useEffect(() => {
        if (offsetNo > 1) {
            updateRTPScreenData(listRtp);
        }
    }, [offsetNo, listRtp]);

    function updateRTPScreenData(resultList) {
        const dataList = mapRTPData(resultList, requestStatus === "PAST");

        const tempDataList = Number(offsetNo) > 1 ? [...dataRTPArray, ...dataList] : [...dataList];

        setDataRTPArray(tempDataList);
        setRefreshing(false);
    }

    function updateAutoDebitScreenData(resultList) {
        const filterList = filterAutoDebitBasedOnUser(resultList, false);

        const dataList =
            filterList?.length > 0 ? mapAutoDebitData(filterList, requestStatus === "PAST") : [];
        const tempDataList = Number(offsetNo) > 1 ? [...dataRTPArray, ...dataList] : [...dataList];

        setDataRTPArray(tempDataList);
        setRefreshing(false);
    }

    async function getAutoDebitListAPI(offsetNo) {
        if (reqType === Strings.RTP_AUTODEBIT) {
            setIsLoading(true);

            try {
                const response = await getBillingList({
                    requestStatus,
                    autoType: "AUTO_DEBIT",
                    pageLimit: 999999,
                    offSet: offsetNo ?? offsetNo,
                });
                const data = response?.data?.result?.data?.transactions;

                if (data && data?.length > 0) {
                    const listAutodebit = data;

                    setIsLoading(false);
                    setRefreshing(false);
                    setOffsetNo(Number(response?.data?.result?.meta?.pagination?.offset));
                    setTotalRecords(Number(response?.data?.result?.meta?.pagination?.totalRecords));
                    updateAutoDebitScreenData(listAutodebit);
                } else {
                    setIsLoading(false);
                    setRefreshing(false);
                    if (reqType === Strings.RTP_AUTODEBIT) {
                        showErrorToast({
                            message: Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                        });
                    }
                }
            } catch (error) {
                showErrorToast({
                    message: error?.error?.error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        } else {
            setDataRTPArray(dataArr);
        }
    }

    /**
     * getRtpListAPI
     * get Generic Favorites List Api for RTP
     */
    async function getRtpListAPI(offsetNo) {
        const subUrl = "/requests";

        if (isRTPRequest) {
            setIsLoading(true);

            try {
                const response = await getRtpList(subUrl, {
                    requestStatus,
                    offset: offsetNo ?? offsetNo,
                });

                const {
                    result: {
                        data: { requests },
                        paymentMode,
                    },
                    statusDescription,
                } = response?.data || {};

                if (requests && requests?.length > 0) {
                    setIsLoading(false);
                    setRefreshing(false);

                    const listRtp = paymentMode
                        ? requests.map((rtpItem) => {
                              if (
                                  rtpItem?.requestType !== "OUTGOING" &&
                                  parseFloat(rtpItem?.transactionAmount) > 5000.0
                              ) {
                                  return { ...rtpItem, paymentMode };
                              } else {
                                  return rtpItem;
                              }
                          })
                        : requests;

                    setOffsetNo(Number(response?.data?.result?.meta?.pagination?.offset));
                    setTotalRecords(Number(response?.data?.result?.meta?.pagination?.totalRecords));
                    setListRtp(listRtp);
                } else {
                    setRefreshing(false);
                    setIsLoading(false);
                    if (isRtpEnabled) {
                        showErrorToast({
                            message: statusDescription || Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                        });
                    }
                }
            } catch (error) {
                if (isRtpEnabled) {
                    showErrorToast({
                        message:
                            error?.error?.error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                    });
                }
            }
        } else {
            setDataRTPArray(dataArr);
        }
    }

    function refresh() {
        setRefreshing(true);
        setOffsetNo(1);
        setTotalRecords(0);

        if (reqType === Strings.RTP_AUTODEBIT) {
            getAutoDebitListAPI();
        } else {
            getRtpListAPI();
        }
    }

    function isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
        const paddingToBottom = 250;
        return (
            layoutMeasurement?.height + contentOffset?.y >= contentSize?.height - paddingToBottom
        );
    }

    function nextPageList() {
        const divide = totalRecords / (offsetNo * 10);
        if (divide > 1 && reqType !== Strings.RTP_AUTODEBIT) {
            getRtpListAPI(offsetNo + 1);
        }
    }

    function onListClick(item, isReplace = false) {
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

        analyticsSelectItem(reqType);

        if (
            item?.isSender &&
            item?.originalStatus !== "APROVED" &&
            item?.isSender &&
            item?.originalStatus !== "PENDING"
        ) {
            // is replace to accomodate notification centre
            if (isReplace) {
                navigation.replace(navigationConstant.REQUESTS_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            } else {
                navigation.navigate(navigationConstant.REQUESTS_DETAILS_SCREEN, {
                    item,
                    transferParams,
                });
            }
        } else if (!item) {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    }

    function onAutoDebitListClick(item, isReplace = false) {
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
            utilFlg: route.params?.utilFlg,
        };
        if (item) {
            navigation.navigate(navigationConstant.REQUEST_TO_PAY_DETAILS_SCREEN, {
                item,
                transferParams,
            });
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    }

    function onRTPListClick(item) {
        if (item?.rtpRequest || item?.autoDebitRequest) {
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
                utilFlg: route.params?.utilFlg,
            };

            if (item) {
                navigation.navigate(navigationConstant.REQUEST_TO_PAY_STACK, {
                    screen: navigationConstant.REQUEST_TO_PAY_DETAILS_SCREEN,
                    params: {
                        item,
                        transferParams,
                        isPast: route?.params.isPast,
                    },
                });
            } else {
                showErrorToast({
                    message: Strings.COMMON_ERROR_MSG,
                });
            }
        } else {
            if (item.autoDebitRequest) {
                onAutoDebitListClick(item, true);
            } else {
                onListClick(item, true);
            }
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={navigation.goBack} />}
                        headerCenterElement={
                            <Typography
                                text={reqType}
                                fontWeight="600"
                                fontSize={18}
                                lineHeight={19}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {
                            nextPageList();
                        }
                    }}
                    scrollEventThrottle={10}
                    refreshing={refreshing}
                >
                    <View style={styles.favouriteListView}>
                        <SendRequestToPayList
                            data={dataRTPArray}
                            extraData={dataRTPArray}
                            callback={onRTPListClick}
                            additionalData={{
                                length: dataRTPArray?.length,
                                titleLines: 1,
                                subtitleLines: 1,
                            }}
                        />
                        {!isLoading ? (
                            <View style={styles.layoutAll}>
                                <Image source={Assets.greyTickIcon} style={styles.imageIcon} />
                                <Typography
                                    fontSize={14}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={DARK_LIGHT_GREY}
                                    text="You're all set for now"
                                />
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ViewAllScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    favouriteListView: {
        marginTop: 16,
    },
    imageIcon: {
        height: 28,
        width: 28,
    },
    layoutAll: {
        alignItems: "center",
        color: FADE_SELECT_GREY,
        flex: 1,
        height: 200,
        justifyContent: "center",
        marginTop: -50,
    },
});

export default ViewAllScreen;

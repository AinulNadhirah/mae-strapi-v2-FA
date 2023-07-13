import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, ScrollView, ImageBackground, RefreshControl, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { GridButtons } from "@components/Common";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getBillingList, rtpStatus, getDuitNowFlags } from "@services/index";

import { BLUE, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    filterAutoBillingBasedOnUser,
    filterAutoBillingCustomerPast,
    filterAutoBillingPast,
    getPermissionObj,
    mapBillingData,
} from "@utils/dataModel/rtdHelper";

import Styles from "@styles/Wallet/SendAndRequestStyle";
import commonStyle from "@styles/main";

import Assets from "@assets";

import ListItem from "./ListItem";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

function BillStatusScreen({
    updateData,
    navigation,
    getModel,
    updateModel,
    toggleLoader,
    onBillingButtonPress,
    activeTabIndex,
    isRtpEnabled,
    route,
    index,
}) {
    const [refreshing, setRefreshing] = useState(false);
    const [billingApiCalled, setBillingApiCalled] = useState(false);
    const [dataBillingArray, setDataBillingArray] = useState([]);
    const [dataCustomerArray, setDataCustomerArray] = useState([]);
    const [soleProp, setSoleProp] = useState(false);
    const [isABRegistered, setIsABRegistered] = useState(false);
    const [setupAutobillingFlag, setSetupAutobillingFlag] = useState(true);
    const [viewAutobillingFlag, setViewAutobillingFlag] = useState(true);
    const [utilFlg, setUtilFlg] = useState(null);
    const [merchantDetails, setMerchantDetails] = useState(null);
    const [isBillingLoading, setIsBillingLoading] = useState(false);
    const preActiveTabIndex = usePrevious(activeTabIndex);
    const preUpdateData = usePrevious(updateData);
    useEffect(() => {
        updateDataInScreen();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // to handle triggering API + rendering only when tab is visible
            if (
                (updateData !== preUpdateData && preUpdateData === false) ||
                (activeTabIndex !== preActiveTabIndex && preActiveTabIndex)
            ) {
                getBillingListAPI();
            }
        }, [activeTabIndex, updateData, billingApiCalled]) //dataBillingArray.length
    );

    async function getDuitNowFlagsAPI() {
        const permissionFlags = getModel("rpp")?.permissions;
        //if permissions not in context initiate api call
        if (permissionFlags?.flagAPICalled === false) {
            const res = await getDuitNowFlags();
            const cusType = getModel("user").cus_type;
            if (res?.data?.list) {
                const listing = res?.data?.list;
                const permissionFlags = getPermissionObj({ listing, cusType });
                updateModel({
                    rpp: {
                        permissions: permissionFlags,
                    },
                });
                updatePermissions(permissionFlags);
            }
        } else {
            updatePermissions(permissionFlags);
        }
    }

    function updatePermissions(permissionFlags) {
        setSetupAutobillingFlag(permissionFlags?.setupAutobillingFlag);
        setViewAutobillingFlag(permissionFlags?.viewAutobillingFlag);
        setUtilFlg(permissionFlags?.utilFlag);
    }

    async function getRtpStatus() {
        try {
            const { merchantInquiry } = getModel("rpp");

            if (merchantInquiry?.merchantId === null) {
                const response = await rtpStatus();
                const result = response?.data?.result;
                if (response?.data?.code === 200) {
                    updateModel({
                        rpp: {
                            merchantInquiry: result,
                        },
                    });
                    updateMerchantDetails(result);
                } else {
                    const msg = result?.statusdesc ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED;
                    showErrorToast({
                        message: msg,
                    });
                }
            } else {
                updateMerchantDetails(merchantInquiry);
            }
        } catch (err) {
            showErrorToast({
                message: err?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
            });
        }
    }
    function updateMerchantDetails(result) {
        const { cus_type } = getModel("user");
        setSoleProp(cus_type === "02");
        setIsABRegistered(result?.status === "00" && result?.rtd === "Y");
        setMerchantDetails(result);
    }
    function updateDataInScreen() {
        // Render if first tab
        if (activeTabIndex === index) {
            toggleLoader(true);
            getBillingListAPI();
        }
    }

    async function onBillingListClick(item) {
        const transferParams = {
            accountName: "",
            toAccount: "",
            toAccountCode: "",
            accounts: "",
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
            amountError: Strings.AMOUNT_ERROR_Billing,
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
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.REQUEST_TO_PAY_AB_DETAILS_SCREEN,
                params: {
                    item,
                    transferParams,
                    utilFlg,
                    merchantDetails,
                },
            });
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
        }
    }

    /**
     * getBillingListAPI
     * get Generic Favorites List Api for Billing
     */
    async function getBillingListAPI() {
        if (isBillingLoading) {
            toggleLoader(false);
            return;
        }
        setIsBillingLoading(true);

        try {
            const response = await getBillingList({
                offSet: 1,
                pageLimit: 999999,
                requestStatus: activeTabIndex === 0 ? "PENDING" : Strings.PAST,
                autoType: Strings.AUTO_BILLING_AUTO_TYPE,
                autoSubType: Strings.BILLS_TYPE,
            });

            const data = response?.data?.result?.data?.transactions;
            if (data) {
                if (data.length > 0) {
                    setRefreshing(false);

                    updateBillingScreenData(data);
                } else {
                    setRefreshing(false);
                    setDataBillingArray([]);
                    setBillingApiCalled(true);

                    setTimeout(() => {
                        toggleLoader(false);
                    }, 1500);
                }
            } else {
                const statusDescription = response?.data?.errors[0]?.message;
                setRefreshing(false);
                setDataBillingArray([]);
                setBillingApiCalled(true);

                toggleLoader(false);
                if (isRtpEnabled) {
                    showErrorToast({
                        message: statusDescription || Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                    });
                }
            }
        } catch (error) {
            setBillingApiCalled(true);

            setTimeout(() => {
                toggleLoader(false);
            }, 1500);
            if (isRtpEnabled) {
                showErrorToast({
                    message: error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        } finally {
            const { cus_type } = getModel("user");
            setSoleProp(cus_type === "02");
            getDuitNowFlagsAPI();
            // individiual user no need to call customer list
            if (cus_type === "02") {
                setIsBillingLoading(false);
                getRtpStatus();
                const response2 = await getBillingList({
                    offSet: 1,
                    pageLimit: 999999,
                    requestStatus: activeTabIndex === 0 ? "PENDING" : Strings.PAST,
                    autoType: Strings.AUTO_BILLING_AUTO_TYPE,
                    autoSubType: Strings.CUSTOMER,
                });
                const data = response2?.data?.result?.data?.transactions;
                if (data?.length > 0) {
                    setRefreshing(false);
                    updateCustomerScreenData(data);
                } else {
                    setRefreshing(false);
                    setDataCustomerArray([]);
                }
                toggleLoader(false);
            }
        }
    }

    function updateBillingScreenData(resultList) {
        const params = {
            tab: activeTabIndex,
            isMyBills: true,
            isPastTab: activeTabIndex === 1,
        };

        const filterList =
            activeTabIndex === 0
                ? filterAutoBillingBasedOnUser(resultList)
                : filterAutoBillingPast(resultList, true);

        const dataList = mapBillingData(filterList, params);

        const tempDataList = [...dataList];

        setDataBillingArray(tempDataList);
        setRefreshing(false);
        setBillingApiCalled(true);

        setTimeout(() => {
            toggleLoader(false);
        }, 1500);

        toggleLoader(false);
    }

    function updateCustomerScreenData(resultList) {
        const params = {
            tab: activeTabIndex,
            isCustomer: true,
            isPastTab: activeTabIndex === 1,
        };
        const filterList =
            activeTabIndex === 0
                ? filterAutoBillingBasedOnUser(resultList)
                : filterAutoBillingCustomerPast(resultList);
        const dataList = mapBillingData(filterList, params);

        const tempDataList = [...dataList];
        setDataCustomerArray(tempDataList);
        setRefreshing(false);
        setTimeout(() => {
            toggleLoader(false);
        }, 1500);

        toggleLoader(false);
    }

    function refresh(isRtpEnabled) {
        setRefreshing(true);
        getBillingListAPI();
    }

    function handleViewAll(reqType, dataArr) {
        navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
            screen: navigationConstant.REQUEST_TO_PAY_AB_VIEW_ALL,
            params: {
                ...route?.params,
                reqType,
                dataArr,
                requestStatus: Strings.AUTO_BILLING_AUTO_TYPE,
                isRtpEnabled,
                utilFlg,
                merchantDetails,
                activeTabIndex,
            },
        });
    }

    const autoBillingBtn = {
        key: Strings.SETUP_AUTO_BILLING,
        title: Strings.SETUP_AUTOBILLING,
        source: Assets.icDuitNow,
    };
    const noRequests = dataBillingArray?.length === 0 || !viewAutobillingFlag;
    const noRequestsCustomer = dataCustomerArray?.length === 0 || !viewAutobillingFlag;

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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                    scrollEventThrottle={10}
                    refreshing={refreshing}
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
                            <View style={Styles.newTransferViewFirst}>
                                {setupAutobillingFlag && (
                                    <GridButtons
                                        data={autoBillingBtn}
                                        callback={onBillingButtonPress}
                                    />
                                )}
                            </View>
                            {noRequestsCustomer && noRequests && (
                                <View>
                                    <View style={Styles.emptyTextView}>
                                        <Typo
                                            fontSize={18}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={32}
                                            textAlign="center"
                                            text={Strings.MANAGE_YOUR_BILLINGS}
                                        />
                                        <View style={Styles.emptyText2View}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="300"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                textAlign="center"
                                                text={
                                                    soleProp && isABRegistered
                                                        ? Strings.BILL_YOUR_CUSTOMERS
                                                        : Strings.PAY_YOUR_BILLS
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                        {viewAutobillingFlag && dataCustomerArray?.length > 0 && (
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
                                        text={Strings.RTP_MY_CUSTOMERS}
                                    />
                                    {dataCustomerArray.length > 2 && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleViewAll(Strings.CUSTOMER, [
                                                    ...dataCustomerArray,
                                                ])
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
                                                text={Strings.VIEW_ALL}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={Styles.favouriteListView}>
                                    <ListItem
                                        data={[...dataCustomerArray]?.slice(0, 2)}
                                        extraData={[...dataCustomerArray]}
                                        callback={onBillingListClick}
                                        length={dataCustomerArray?.length}
                                    />
                                </View>
                            </>
                        )}
                        {viewAutobillingFlag && dataBillingArray?.length > 0 && (
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
                                        text={Strings.RTP_MY_BILLS}
                                    />
                                    {dataBillingArray.length > 2 && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleViewAll(Strings.BILLS_TYPE, [
                                                    ...dataBillingArray,
                                                ])
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
                                                text={Strings.VIEW_ALL}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={Styles.favouriteListView}>
                                    <ListItem
                                        data={[...dataBillingArray]?.slice(0, 2)}
                                        extraData={[...dataBillingArray]}
                                        callback={onBillingListClick}
                                        length={dataBillingArray?.length}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

BillStatusScreen.propTypes = {
    updateData: PropTypes.bool,
    navigation: PropTypes.object,
    route: PropTypes.object,
    activeTabIndex: PropTypes.any,
    index: PropTypes.any,
    isRtpEnabled: PropTypes.any,
    screenDate: PropTypes.any,
    childData: PropTypes.object,
    toggleLoader: PropTypes.func,
    onShowIncomingRequestPopupPress: PropTypes.func,
    onPayAcceptedRequest: PropTypes.func,
    onBillingButtonPress: PropTypes.func,
    onChargeCustomerPress: PropTypes.func,
    onRequestToPayPress: PropTypes.func,
    onPayRequestPress: PropTypes.func,
    updateDataInChild: PropTypes.func,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};
export default withModelContext(BillStatusScreen);

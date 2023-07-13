import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, RefreshControl, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getBillingList } from "@services";

import { MEDIUM_GREY, BLACK, DARK_LIGHT_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import {
    filterAutoBillingBasedOnUser,
    filterAutoBillingCustomerPast,
    filterAutoBillingPast,
    mapBillingData,
} from "@utils/dataModel/rtdHelper";

import assets from "@assets";

import ListItem from "./ListItem";

function ABViewAllScreen({ navigation, route }) {
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [offsetNo, setOffsetNo] = useState(1);
    const [dataRTPArray, setDataRTPArray] = useState(route?.params?.dataArr ?? []);

    const { reqType, activeTabIndex, isRtpEnabled } = route?.params || {};

    useEffect(() => {
        getBillingListAPI();
    }, []);

    function _updateRTPScreenData(resultList) {
        const params = {
            tab: activeTabIndex,
            isMyBills: reqType === Strings.BILLS_TYPE,
            isCustomer: reqType !== Strings.BILLS_TYPE,
            isPastTab: activeTabIndex === 1,
        };
        const filterList =
            activeTabIndex === 0
                ? filterAutoBillingBasedOnUser(resultList)
                : reqType !== Strings.BILLS_TYPE
                ? filterAutoBillingCustomerPast(resultList)
                : filterAutoBillingPast(resultList, reqType === Strings.BILLS_TYPE);
        const dataList = mapBillingData(filterList, params);

        const tempDataList = Number(offsetNo) > 1 ? [...dataRTPArray, ...dataList] : [...dataList];

        setDataRTPArray(tempDataList);
        setRefreshing(false);
    }

    /**
     * getBillingListAPI
     * get Generic Favorites List Api for RTP
     */
    async function getBillingListAPI(offsetNo) {
        setIsLoading(true);

        try {
            const response = await getBillingList({
                offSet: offsetNo ?? 1,
                pageLimit: 999999,
                requestStatus: activeTabIndex === 0 ? "PENDING" : Strings.PAST,
                autoType: Strings.AUTO_BILLING_AUTO_TYPE,
                autoSubType: reqType,
            });

            const data = response?.data?.result?.data?.transactions;

            if (data && data?.length > 0) {
                setIsLoading(false);
                setRefreshing(false);
                setOffsetNo(Number(response?.data?.result?.meta?.pagination?.offset));

                _updateRTPScreenData(data);
            } else {
                setIsLoading(false);
                setRefreshing(false);

                if (isRtpEnabled) {
                    showErrorToast({
                        message: Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                    });
                }
            }
        } catch (error) {
            if (isRtpEnabled) {
                showErrorToast({
                    message: error?.error?.error?.message ?? Strings.REQUEST_COULD_NOT_BE_PROCESSED,
                });
            }
        }
    }

    function refresh() {
        setRefreshing(true);
        setOffsetNo(1);

        getBillingListAPI();
    }

    function onRTPListClick(item) {
        const transferParams = {};

        if (item) {
            navigation.navigate(navigationConstant.AUTOBILLING_STACK, {
                screen: navigationConstant.REQUEST_TO_PAY_AB_DETAILS_SCREEN,
                params: {
                    item,
                    transferParams,
                    utilFlg: route.params?.utilFlg,
                    merchantDetails: route.params?.merchantDetails,
                },
            });
        } else {
            showErrorToast({
                message: Strings.COMMON_ERROR_MSG,
            });
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
                                text={
                                    reqType === Strings.BILLS_TYPE
                                        ? Strings.RTP_MY_BILLS
                                        : Strings.RTP_MY_CUSTOMERS
                                }
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
                    scrollEventThrottle={10}
                    refreshing={refreshing}
                >
                    <View style={styles.containerHeader}>
                        <Typography
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLACK}
                            textAlign="left"
                            text={
                                route?.params?.activeTabIndex === 1
                                    ? Strings.PAST_ACTIVITIES
                                    : Strings.BILL_STATUS
                            }
                        />
                    </View>
                    <View style={styles.favouriteListView}>
                        <ListItem
                            data={dataRTPArray}
                            extraData={dataRTPArray}
                            callback={onRTPListClick}
                            length={dataRTPArray?.length}
                        />
                        {!isLoading ? (
                            <View style={styles.layoutAll}>
                                <Image source={assets.greyTickIcon} style={styles.imageIcon} />
                                <Typography
                                    fontSize={14}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={DARK_LIGHT_GREY}
                                    text={Strings.ALL_SET}
                                />
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ABViewAllScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    activeTabIndex: PropTypes.number,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerHeader: {
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 22,
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
        color: DARK_LIGHT_GREY,
        flex: 1,
        height: 200,
        justifyContent: "center",
        marginTop: -50,
    },
});

export default ABViewAllScreen;

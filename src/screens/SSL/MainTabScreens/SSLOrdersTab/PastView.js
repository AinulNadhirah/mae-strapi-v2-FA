import PropTypes from "prop-types";
import React, { useState, useCallback, useRef } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import EmptyState from "@components/DefaultState/EmptyState";
import FooterText from "@components/SSL/FooterText";
import { showErrorToast } from "@components/Toast";

import { getSSLOrderDetail, getSSLOrderList } from "@services";

import { TRANSPARENT } from "@constants/colors";
import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import { SSL_SERVER_BUSY, SSL_SERVER_BUSY_DESC, SSL_TRY_AGAIN } from "@constants/stringsSSL";

import { useDidMount, useIntervalOnlyIsFocused, useIsFocusedExceptMount } from "@utils/hooks";

import OrderCardFlatList from "./OrderCardFlatList";
import SSLOrdersTabShimmer from "./SSLOrdersTabShimmer";

let page = 1;
const pageSize = 4; // Save bandwidth & faster initial loading (1 order ~.8sec to query)

/**
 * Behaviour:
 *
 * 1. Reset the page when
 * - onMount, Active|Past toggle is changed , user pull to refresh
 *
 * 2. 15sec polling to get latest orders. (When orders in Active just complete and moves to Past)
 *    - Now API get latest 5 orders, and manually prepend any new item to existing on screen list.
 * Limitation: If API gets > 5 new orders (Means probably 10 orders complete at the same second, which is highly unlikely), we don't do anything..
 * Limitation - API doesnt support get newer data by id.
 *
 * 3. Auto refresh one item if user clicked into and out of it - To cater Rating flow
 *
 * Limitation - API side has a hard limit on pageSize max is 10
 */

function PastView({ handleGoTo, onPressReOrder, onPressMerchant, onEmptyViewExploreMoreBtnClick }) {
    const [pastOrders, setPastOrders] = useState([]);
    const [isEndOfPastList, setIsEndOfPastList] = useState(false);

    const [screenState, setScreenState] = useState(SCREEN_SHIMMER);

    const getPastOrderList = useCallback(async () => {
        try {
            const params = {
                orderStatus: "past",
                page,
                pageSize,
            };
            const response = await getSSLOrderList(params);
            const past = response?.data?.result?.orderListDetails?.data ?? [];
            const totalPage = response?.data.result?.orderListDetails?.pageCount;

            setPastOrders(past);
            page >= totalPage && setIsEndOfPastList(true);
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
            setScreenState(SCREEN_ERROR);
        }
    }, []);

    const onEndReachedOrderList = useCallback(async () => {
        if (isEndOfPastList) return;

        try {
            const params = {
                orderStatus: "past",
                page: page + 1,
                pageSize,
            };
            const response = await getSSLOrderList(params);
            const past = response?.data?.result?.orderListDetails?.data ?? [];
            const totalPage = response?.data.result?.orderListDetails?.pageCount;

            setPastOrders([...pastOrders, ...past]);
            page = page + 1;
            page >= totalPage && setIsEndOfPastList(true);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [pastOrders, isEndOfPastList]);

    function init() {
        page = 1;
        setPastOrders([]);
        setIsEndOfPastList(false);
        setScreenState(SCREEN_SHIMMER);
        getPastOrderList();
    }

    useDidMount(() => {
        init();
    });

    /** Background poll latest item START */
    async function getPastOrderListLatest() {
        try {
            const params = {
                orderStatus: "past",
                page: 1,
                pageSize: 5,
            };
            const response = await getSSLOrderList(params);
            let past = response?.data?.result?.orderListDetails?.data ?? [];

            /**
             * 1. past -> reduce if matches on-screen's orders[0].id.
             * If doesn't found, isNotSync = true and throw error (Means there's > 4 new entries, which is highly unlikely)
             * 2. prepend with pastorders
             */
            let inSync = false;
            past = past.filter((item) => {
                if (inSync) return;
                if (item.order_id === pastOrders?.[0]?.order_id) {
                    inSync = true;
                    return;
                }
                return item;
            });

            if (!inSync) {
                throw new Error("More than 4 new entries");
            }

            setPastOrders([...past, ...pastOrders]);
        } catch (e) {
            // fail silently
        }
    }

    useIntervalOnlyIsFocused(() => {
        getPastOrderListLatest();
    }, 15000);
    /** Background poll latest item END */

    /** Auto update rating START */
    // Handle update if user given Rating inside -> SSLOrderDetails -> SSLRating
    const idToRefresh = useRef();
    const getOrderDetail = useCallback(async () => {
        try {
            const body = {
                orderId: idToRefresh.current,
                isMerchant: true,
            };

            const response = await getSSLOrderDetail(body);
            const result = response?.data?.result;

            const index = pastOrders.findIndex((obj) => obj.order_id === result?.orderId);
            if (index > -1) {
                pastOrders[index].rating = result?.rating;
                setPastOrders(pastOrders);
            }

            idToRefresh.current = null;
        } catch (e) {
            // Fail silently
        }
    }, [pastOrders]);
    useIsFocusedExceptMount(() => {
        if (idToRefresh.current) {
            getOrderDetail();
        }
    });
    function handleGoToIntermediate(obj) {
        idToRefresh.current = obj;
        handleGoTo(obj);
    }
    /** Auto update rating END */

    function renderView() {
        switch (screenState) {
            case SCREEN_SUCCESS:
                if (pastOrders?.length) {
                    return (
                        <OrderCardFlatList
                            refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                            items={pastOrders}
                            handleGoTo={handleGoToIntermediate}
                            onPressReOrder={onPressReOrder}
                            onPressMerchant={onPressMerchant}
                            onEndReached={onEndReachedOrderList}
                            ListFooterComponent={
                                isEndOfPastList ? (
                                    <FooterText text="You've seen all orders." />
                                ) : (
                                    <FooterText text="Loading..." />
                                )
                            }
                        />
                    );
                } else {
                    return (
                        <ScrollView
                            refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                            contentContainerStyle={styles.transparentContainer}
                        >
                            <EmptyState
                                title="No Orders"
                                subTitle="You've not placed any orders yet. Shop and order from your favourite local merchants today!"
                                buttonLabel="Explore"
                                onActionBtnClick={onEmptyViewExploreMoreBtnClick}
                            />
                        </ScrollView>
                    );
                }
            case SCREEN_SHIMMER:
                return <SSLOrdersTabShimmer />;
            case SCREEN_ERROR:
            default:
                return (
                    <EmptyState
                        title={SSL_SERVER_BUSY}
                        subTitle={SSL_SERVER_BUSY_DESC}
                        buttonLabel={SSL_TRY_AGAIN}
                        onActionBtnClick={init}
                    />
                );
        }
    }
    return renderView();
}
PastView.propTypes = {
    handleGoTo: PropTypes.func,
    onPressReOrder: PropTypes.func,
    onPressMerchant: PropTypes.func,
    onEmptyViewExploreMoreBtnClick: PropTypes.func,
};

const styles = StyleSheet.create({
    transparentContainer: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
});
export default PastView;

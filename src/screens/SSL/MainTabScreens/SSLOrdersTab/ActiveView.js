import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import EmptyState from "@components/DefaultState/EmptyState";
import FooterText from "@components/SSL/FooterText";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getSSLOrderList } from "@services";

import { TRANSPARENT } from "@constants/colors";
import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import { SSL_SERVER_BUSY, SSL_SERVER_BUSY_DESC, SSL_TRY_AGAIN } from "@constants/stringsSSL";

import { useIntervalOnlyIsFocused, useIsFocusedIncludingMount } from "@utils/hooks";

import OrderCardFlatList from "./OrderCardFlatList";
import SSLOrdersTabShimmer from "./SSLOrdersTabShimmer";

let page = 1;
const pageSize = 3; // Each order takes ~.8sec to load. 3 so that it loads faster on first load

/**
 * 1. Reset the page when
 * - didMount, Active/Past toggle, pullToRefresh
 *
 * 2. Background refresh when
 * - 15 sec polling, screen is focused
 *
 * Current: Background refresh 'resets' with pageSize:10, page:1.
 *
 * Future: Background polling should be 1. Get latest data and 2. refresh on screen data
 *
 * Limitation: API doesnt support get newer data list by id
 * Limitation: API doesnt support get orderList item by id (frontend pass id:[1,2,3] and backend return the orderList for that array)
 * Limitation: API side has a hard limit on pageSize max is 10
 */
function ActiveView({
    handleGoTo,
    onPressReOrder,
    onPressMerchant,
    onEmptyViewExploreMoreBtnClick,
}) {
    const { updateModel } = useModelController();
    const [activeOrders, setActiveOrders] = useState([]);
    const [isEndOfActiveList, setIsEndOfActiveList] = useState(false);

    const [screenState, setScreenState] = useState(SCREEN_SHIMMER);

    const getActiveOrderList = useCallback(async () => {
        try {
            const params = {
                orderStatus: "active",
                page,
                pageSize,
            };
            const response = await getSSLOrderList(params);
            const active = response?.data?.result?.orderListDetails?.data ?? [];
            const totalPage = response?.data.result?.orderListDetails?.pageCount;

            setActiveOrders(active);
            page >= totalPage && setIsEndOfActiveList(true);
            setScreenState(SCREEN_SUCCESS);

            updateModel({
                ssl: {
                    hasSslOngoingOrders: active?.length ? true : false,
                },
            });
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
            setScreenState(SCREEN_ERROR);
        }
    }, [updateModel]);

    const onEndReachedOrderList = useCallback(async () => {
        if (isEndOfActiveList) return;

        try {
            const params = {
                orderStatus: "active",
                page: page + 1,
                pageSize,
            };
            const response = await getSSLOrderList(params);
            const active = response?.data?.result?.orderListDetails?.data ?? [];
            const totalPage = response?.data.result?.orderListDetails?.pageCount;

            setActiveOrders([...activeOrders, ...active]);
            page = page + 1;
            page >= totalPage && setIsEndOfActiveList(true);
        } catch (e) {
            showErrorToast({
                message: e.message,
            });
        }
    }, [activeOrders, isEndOfActiveList]);

    function init() {
        page = 1;
        setIsEndOfActiveList(false);
        setScreenState(SCREEN_SHIMMER);
        getActiveOrderList();
    }

    /** Background Refresh START */
    useIsFocusedIncludingMount(() => {
        page = 1;
        setIsEndOfActiveList(false);
        getActiveOrderList();
    });

    // 15 sec polling
    useIntervalOnlyIsFocused(() => {
        page = 1;
        setIsEndOfActiveList(false);
        getActiveOrderList();
    }, 15000);
    /** Background Refresh END */

    function renderView() {
        switch (screenState) {
            case SCREEN_SUCCESS:
                if (activeOrders?.length) {
                    return (
                        <OrderCardFlatList
                            refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
                            items={activeOrders}
                            handleGoTo={handleGoTo}
                            onPressReOrder={onPressReOrder}
                            onPressMerchant={onPressMerchant}
                            onEndReached={onEndReachedOrderList}
                            ListFooterComponent={
                                isEndOfActiveList ? (
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

ActiveView.propTypes = {
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

export default ActiveView;

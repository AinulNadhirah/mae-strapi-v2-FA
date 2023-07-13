import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getSSLMerchantDetailsV2, getSSLOrderDetail, getSSLProductDetailsV2 } from "@services";
import { FAOrdersTab } from "@services/analytics/analyticsSSL";

import {
    contextCart,
    getAllOptionIdInSelectedOption,
    isStartNewCart,
    keysToCamel,
    syncSelectedOption,
    validateIfOptionStillExist,
} from "@utils/dataModel/utilitySSL";

import ActivePastToggle from "./ActivePastToggle";
import ActiveView from "./ActiveView";
import PastView from "./PastView";

function SSLOrdersTab(props) {
    const navigation = useNavigation();
    const { getModel, updateModel } = useModelController();
    const [selectedTab, setSelectedTab] = useState("Active");

    // ReOrder functions
    const orderObj = useRef({});
    const { cartV1, sandboxUrl } = getModel("ssl");
    useEffect(() => {
        props.startNewCart.current = startNewCart;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function onPressReOrder(order) {
        FAOrdersTab.onPressReorder();
        orderObj.current = order;
        const reorderMerchantId = orderObj.current.merchantId;
        const cartMerchantId = cartV1?.merchantDetail?.merchantId;
        const cartProducts = cartV1?.cartProducts;
        if (isStartNewCart({ merchantId: reorderMerchantId, cartMerchantId, cartProducts })) {
            props?.showNewCartPopup();
            return;
        }
        reOrderFunc();
    }
    async function reOrderFunc() {
        console.log("press reOrderFunc: ", orderObj.current);
        if (!orderObj.current.products.length) return;

        // Call orderDetails to get selected options data
        let orderDetails;
        try {
            const body = {
                orderId: orderObj.current?.orderId,
                isMerchant: true,
            };

            orderDetails = await getSSLOrderDetail(body);
        } catch (e) {
            console.log("getSSLOrderDetails failure", e);
            showErrorToast({
                message: e.message,
            });
        }

        const reorderMerchantId = orderObj.current.merchantId;
        const params = {
            latitude: 3.181899, // any lat long will do
            longitude: 101.6938113,
            merchantId: reorderMerchantId,
        };
        let data;

        try {
            data = await getSSLMerchantDetailsV2({ sandboxUrl, body: params });
        } catch (e) {
            console.log("getSSLMerchantDetails failure", e);
            showErrorToast({
                message: e.message,
            });
        }

        const apiMerchantDetail = data.data.result.merchantDetail;

        /**
         * We skipped product sync with API, it'll happen on SSLMerchantDetails screen
         * Make sure re-order flow ALWAYS go to SSLMerchantDetails screen to ensure the checking happens
         * There's business logic such as prompt user "Item out of stock", etc etc on SSLMerchantDetails screen
         * Can copy the code checking to this screen, but need to copy business logic in here as well
         */
        const productData = orderDetails?.data?.result?.products;

        productData.map((item) => {
            item?.optionGroup?.map(
                (optGroup) => (item.selectedOptions = optGroup.selected_options)
            );
            item.count = item.quantity;
        });

        const result = await validateEachItemBeforeAddCart(
            apiMerchantDetail?.merchantId,
            productData
        );

        const syncedCart = contextCart.generateCartWith({
            merchantDetail: apiMerchantDetail,
            isReorder: true,
            productData: result?.validatedProducts,
            promoCodeString: cartV1?.promoCodeString,
        });
        console.log("syncedCart", syncedCart);
        contextCart.storeCartContextAS({ updateModel, cartObj: syncedCart, AsyncStorage });

        navigation.navigate(navigationConstant.SSL_MERCHANT_DETAILS, {
            merchantId: reorderMerchantId,
            isOptionUnavailable: result?.isOptionUnavailable,
        });
    }

    async function validateEachItemBeforeAddCart(merchantId, products) {
        const { sandboxUrl } = getModel("ssl");
        let validatedProducts = [];
        let isOptionUnavailable = false;
        await Promise.all(
            products.map(async (product, index) => {
                const body = {
                    latitude: 3.181899,
                    longitude: 101.6938113,
                    merchantId: merchantId || "",
                    productId: keysToCamel(product?.productId),
                };
                try {
                    console.log("getSSLProductDetails getProductDetails start");
                    const data = await getSSLProductDetailsV2({ sandboxUrl, body });
                    const productFromCloud = data?.data?.result?.productDetail?.products?.[0];

                    if (validateIfOptionStillExist(product, productFromCloud)) {
                        const syncedSelectedOpt = syncSelectedOption(
                            productFromCloud?.optionGroup,
                            getAllOptionIdInSelectedOption(keysToCamel(product?.optionGroup))
                        );
                        product.selectedOptions = keysToCamel(syncedSelectedOpt);
                        validatedProducts = [...validatedProducts, product];
                    } else {
                        isOptionUnavailable = true;
                    }
                } catch (e) {
                    console.log("SSLProductDetails getProductDetail err", e);
                }
            })
        );
        return { validatedProducts, isOptionUnavailable };
    }

    // Reorder - start new cart? Popup
    function startNewCart() {
        const emptyCart = contextCart.generateEmptyCart();
        contextCart.storeCartContextAS({ updateModel, cartObj: emptyCart, AsyncStorage });

        reOrderFunc();
    }

    function onEmptyViewExploreMoreBtnClick() {
        props.setTabIndex(0);
    }

    function handleGoTo(orderId) {
        navigation.navigate(navigationConstant.SSL_ORDER_DETAILS, { orderId });
    }

    function onPressMerchant(merchantId) {
        navigation.navigate(navigationConstant.SSL_MERCHANT_DETAILS, { merchantId });
    }

    return (
        <View style={styles.container}>
            <ActivePastToggle selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            {selectedTab === "Active" ? (
                <ActiveView
                    handleGoTo={handleGoTo}
                    onPressReOrder={onPressReOrder}
                    onPressMerchant={onPressMerchant}
                    onEmptyViewExploreMoreBtnClick={onEmptyViewExploreMoreBtnClick}
                />
            ) : (
                <PastView
                    handleGoTo={handleGoTo}
                    onPressReOrder={onPressReOrder}
                    onPressMerchant={onPressMerchant}
                    onEmptyViewExploreMoreBtnClick={onEmptyViewExploreMoreBtnClick}
                />
            )}
        </View>
    );
}
SSLOrdersTab.propTypes = {
    getModel: PropTypes.func,
    startNewCart: PropTypes.object,
    showNewCartPopup: PropTypes.func,
    setTabIndex: PropTypes.func,
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15 },
});

export default withModelContext(SSLOrdersTab);

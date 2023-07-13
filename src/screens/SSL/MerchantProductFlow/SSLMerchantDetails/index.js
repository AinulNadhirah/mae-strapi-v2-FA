/**
 * 1. Very logic and feature heavy screen.
 * 2. We delegate tasks to :
 *      - ScreenFlatList
 *          - MerchantDetailsCollapsibleHeader
 */
import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import _ from "lodash";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Share from "react-native-share";

import MerchantDetailsCollapsibleHeader from "@screens/SSL/MerchantProductFlow/SSLMerchantDetails/ScreenFlatList/MerchantDetailsCollapsibleHeader";

import { SSL_CART_SCREEN, SSL_PRODUCT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import Popup from "@components/Popup";
import { DeliveryOptionRadioModal } from "@components/SSL/DeliveryOptionRadioModal";
import CartCheckoutBtn from "@components/SSL/MerchantDetails/CartCheckoutBtn";
import DeliveryOptionDisclaimerModal from "@components/SSL/MerchantDetails/DeliveryOptionDisclaimerModal";
import ManualContactMerchant from "@components/SSL/MerchantDetails/ManualContactMerchant";
import { ProductOrderModal } from "@components/SSL/MerchantDetails/ProductOrderModal";
import SSLMerchantDetailsShimmer from "@components/SSL/MerchantDetails/SSLMerchantDetailsShimmer";
import Typo from "@components/Text";
import { showSuccessToast, showInfoToast, showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { getSSLMerchantDetailsV2 } from "@services";
import { FAMerchantDetails } from "@services/analytics/analyticsSSL";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import { SCREEN_ERROR, SCREEN_SHIMMER, SCREEN_SUCCESS } from "@constants/screenLifecycleConstants";
import {
    CHANGE_DELIVERY_OPTION,
    CONTINUE_WITH_DINE_IN,
    CHANGE_DELIVERY_OPTION_TITLE,
    CHANGE_DELIVERY_OPTION_DESC,
    DELIVER_NOW,
    SSL_SERVER_BUSY,
    SSL_SERVER_BUSY_DESC,
    SSL_TRY_AGAIN,
} from "@constants/stringsSSL";

import { commaAdder } from "@utils/dataModel/utility";
import {
    calculateCartAmount,
    SSLPROMPTUSERMSG,
    isPromptUser,
    contextCart,
    getLatitude,
    getLongitude,
    getAnalyticsCartList,
    validateQRMSResponse,
    groupDeliveryType,
    syncLocalCartWithApiProductData,
    deliveryType,
} from "@utils/dataModel/utilitySSL";
import { useDidMount } from "@utils/hooks";

import assets from "@assets";

// eslint-disable-next-line no-unused-vars
import { merchantDetailSampleResponse } from "./SSLMerchantDetailsDoc";
import ScreenFlatList from "./ScreenFlatList";

function SSLMerchantDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const [screenState, setScreenState] = useState(SCREEN_SHIMMER);
    const [isMerchantNotFound, setIsMerchantNotFound] = useState(false);
    const { getModel, updateModel } = useModelController();

    const { currSelectedLocationV1, sandboxUrl, cartV1 } = getModel("ssl");
    const {
        auth: { token },
    } = getModel(["auth"]);
    const location = getModel("location");
    const latitude = useRef(getLatitude({ location, currSelectedLocationV1 }));
    const longitude = useRef(getLongitude({ location, currSelectedLocationV1 }));

    // UI Top - MerchantDetailsCollapsible
    const [merchantDetail, setMerchantDetail] = useState({});

    // UI Mid - SectionList -  Product listing
    const [categoryTitleArr, setCategoryTitleArr] = useState([]);
    const [productData, setProductData] = useState([]);

    // Popup Prop
    const [popup, setPopup] = useState({});

    const isFirstLoad = useRef(true);

    // Popup - Delivery Option
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(0);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [isShowDeliveryOptionsModal, setIsShowDeliveryOptionsModal] = useState(false);
    const [isShowTableOrderChangeModal, setIsShowTableOrderChangeModal] = useState(false);

    // Table Ordering
    const [tableNo, setTableNo] = useState(route.params?.tableNo ?? null);

    // Popup - Delivery Option Disclaimer
    const DeliveryOptionDisclaimerModalRef = useRef();

    // Popup - Product Order Modal
    const [isShowProductOrderModal, setIsShowProductOrderModal] = useState(false);
    const [productInOrder, setProductInOrder] = useState({});
    const [itemInOrder, setItemInOrder] = useState({});

    const amount = useMemo(() => {
        let amount = null;
        const cartFinalAmount = calculateCartAmount({
            merchantDetail,
            cartProducts: cartV1?.cartProducts,
        });

        if (
            merchantDetail?.merchantId &&
            cartV1?.merchantDetail?.merchantId &&
            merchantDetail.merchantId === cartV1.merchantDetail.merchantId &&
            cartFinalAmount
        )
            amount = `RM ${commaAdder(cartFinalAmount)}`;
        return amount;
    }, [cartV1?.cartProducts, cartV1?.merchantDetail?.merchantId, merchantDetail]);

    /**
     * On first time API call success,
     * 1. Check if prompt user on various scenario
     * 2. Sync cart with API
     * 3. Check if auto scroll & auto navigate to product (if entry point is from search and deeplink)
     * 4. Log analytic
     *
     * IMPORTANT: Keep the dependency to []. Because these 4 functions are called when API success, at the same time with setMerchantDetails(merchantDetails)
     * Inside this function, if we access file level merchantDetails, it'll be empty because setMerchantDetails happens on the next tick.
     * Hence we pass the data as argument and access it in local scope, instead of file scope
     */
    const checkIfPromptingUser = useCallback(
        ({ cartV1, merchantDetail, productData, isOptionUnavailable }) => {
            console.log("promptSyncCartStatus", merchantDetail);
            const response = isPromptUser({
                merchantDetail,
                productData,
                cartV1,
                isOptionUnavailable,
            });
            switch (response) {
                case SSLPROMPTUSERMSG.unavailable:
                    showInfoToast({
                        message:
                            "We're sorry, this merchant is currently unavailable. Please check again later or select another merchant.",
                    });
                    break;
                case SSLPROMPTUSERMSG.success:
                    break;
                case SSLPROMPTUSERMSG.reorderSuccess:
                    showSuccessToast({
                        message: "Products has been successfully added to your cart.",
                    });
                    break;
                case SSLPROMPTUSERMSG.orderLimitChanged:
                case SSLPROMPTUSERMSG.outOfStock:
                    setPopup({
                        visible: true,
                        title: "Out of stock items",
                        description:
                            "Some items are unavailable on the menu and have been removed from your cart.",
                        onClose: () => setPopup({ visible: false }),
                        primaryAction: {
                            text: "Got it",
                            onPress: () => setPopup({ visible: false }),
                        },
                    });
                    break;
                case SSLPROMPTUSERMSG.optionsUnavailable:
                    setPopup({
                        visible: true,
                        title: "Options unavailable",
                        description:
                            "Some options of the items are unavailable on the menu and have been removed from your cart.",
                        onClose: () => setPopup({ visible: false }),
                        primaryAction: {
                            text: "Got it",
                            onPress: () => setPopup({ visible: false }),
                        },
                    });
                    break;
                default:
                    break;
            }
        },
        []
    );

    const syncCartWithLatestApi = useCallback(
        ({ cartV1, merchantDetail, productData, updateModel }) => {
            console.log("syncCartWithLatestApi");

            const merchantId = merchantDetail?.merchantId;
            const cartProducts = cartV1?.cartProducts ?? [];
            const cartMerchantId = cartV1?.merchantDetail?.merchantId;

            if (merchantId === cartMerchantId && merchantDetail?.open) {
                // 1. Cart basket is over new orderLimit, clear cartProducts
                const response = isPromptUser({
                    merchantDetail,
                    productData,
                    cartV1,
                });
                if (response === SSLPROMPTUSERMSG.orderLimitChanged) {
                    console.log("orderLimitChanged", merchantDetail.orderLimit);
                    const clearedCart = contextCart.generateEmptyCart();
                    contextCart.storeCartContextAS({
                        updateModel,
                        cartObj: clearedCart,
                        AsyncStorage,
                    });
                    return;
                }

                const syncedProductData = syncLocalCartWithApiProductData(
                    cartProducts,
                    productData
                );
                const syncedCart = contextCart.generateCartWith({
                    merchantDetail,
                    isReorder: false,
                    productData: syncedProductData,
                    promoCodeString: cartV1?.promoCodeString,
                });
                console.log("syncedCart", syncedCart);
                contextCart.storeCartContextAS({ updateModel, cartObj: syncedCart, AsyncStorage });
            }
        },
        []
    );

    const getMerchant = useCallback(async () => {
        const body = {
            latitude: latitude.current || 3.181899,
            longitude: longitude.current || 101.6938113,
            merchantId: route.params?.merchantId,
            // merchantId: "MBBQR1523438", // Wannah STG
        };
        try {
            console.log("getSSLMerchantDetailsV2 getMerchantDetail start");
            const data = await getSSLMerchantDetailsV2({ sandboxUrl, token, body });
            console.log("cloud merchant detail", data);
            validateQRMSResponse(data);

            const merchantDetail = data?.data?.result?.merchantDetail ?? {};
            // const merchantDetail = merchantDetailSampleResponse?.result?.merchantDetail;

            console.log("SSLMerchantDetails getMerchantDetail success", merchantDetail);
            setMerchantDetail(merchantDetail);

            const tempCategoryTitleArr = [];
            let flatProductData = [];
            merchantDetail?.optionCategory?.map((category) => {
                // Only consider category that is active and has products
                if (category.active && category.products.length > 0) {
                    tempCategoryTitleArr.push(
                        category.name === "All Products" &&
                            merchantDetail?.optionCategory?.length > 1
                            ? "Other Products"
                            : category.name
                    );
                    for (const item of category.products) {
                        item.categoryTitle =
                            category.name === "All Products" &&
                            merchantDetail?.optionCategory?.length > 1
                                ? "Other Products"
                                : category.name;
                    }
                    category.products[0].isFirstProductOfCategory = true;
                    flatProductData = [...flatProductData, ...category.products];
                }
            });
            setCategoryTitleArr(tempCategoryTitleArr); // ["Boba","Nasi","Cake"]
            setProductData(flatProductData); // See productLayoutDoc.js

            if (isFirstLoad.current) {
                checkIfPromptingUser({
                    cartV1,
                    merchantDetail,
                    productData: flatProductData,
                    isOptionUnavailable: route.params?.isOptionUnavailable,
                });

                syncCartWithLatestApi({
                    cartV1,
                    merchantDetail,
                    productData: flatProductData,
                    updateModel,
                });

                if (DeliveryOptionDisclaimerModalRef.current) {
                    DeliveryOptionDisclaimerModalRef.current.checkIfPromptMerchantDeliveryDisclaimer(
                        { merchantDetail }
                    );
                }
                FAMerchantDetails.onScreen(merchantDetail);
            }
            isFirstLoad.current = false;

            const deliveryOptions = groupDeliveryType(merchantDetail?.pills?.deliveryTypePills).map(
                ({ id, name }) => ({
                    id,
                    title: name,
                    isSelected: false,
                })
            );
            setDeliveryOptions(deliveryOptions); // Radio btn modal format is { title,isSelected }

            if (tableNo) {
                setSelectedDeliveryId(deliveryType.DINE_IN);
            } else {
                setSelectedDeliveryId(deliveryOptions?.[0]?.id ?? 0);
            }
            setScreenState(SCREEN_SUCCESS);
        } catch (e) {
            console.log("SSLMerchantDetails getMerchantDetail err", e);
            if (e.status === "QR070") {
                setIsMerchantNotFound(true); // Special handling when merchant manually toggle "Closed" while raining. Merchant not found from API
            } else if (screenState === SCREEN_SHIMMER || screenState === SCREEN_ERROR) {
                setScreenState(SCREEN_ERROR); // Full screen error
            } else {
                showErrorToast({
                    message: e.message, // Screen has data, show toast
                });
            }
            if (cartV1?.isReorder) {
                // Reorder hit error, clear cart
                const emptyCart = contextCart.generateEmptyCart();
                contextCart.storeCartContextAS({ updateModel, cartObj: emptyCart, AsyncStorage });
            }
        }
    }, [
        sandboxUrl,
        token,
        checkIfPromptingUser,
        cartV1,
        route.params?.isOptionUnavailable,
        syncCartWithLatestApi,
        updateModel,
        screenState,
    ]);

    const init = useCallback(async () => {
        setScreenState(SCREEN_SHIMMER);
        getMerchant();
    }, [getMerchant]);

    useDidMount(() => {
        init();
    });

    // Delivery Option modal
    function onDeliveryTypeDropdownPillPressed() {
        if (tableNo && merchantDetail?.deliveryTypes?.length > 1) {
            setIsShowTableOrderChangeModal(true);
            return;
        }
        if (
            merchantDetail?.deliveryTypes?.length === 1 &&
            merchantDetail?.deliveryTypes?.[0] === deliveryType.DINE_IN
        ) {
            return;
        }
        setIsShowDeliveryOptionsModal(true);
    }
    function onDismissDeliveryOptionsModal() {
        setIsShowDeliveryOptionsModal(false);
    }
    function onPressChangeTableOrderModal() {
        setIsShowTableOrderChangeModal(false);
        setIsShowDeliveryOptionsModal(true);
    }
    function onDismissTableOrderChangeModal() {
        setIsShowTableOrderChangeModal(false);
    }
    function onApplyDeliveryOption(id) {
        setTableNo(null);
        setIsShowDeliveryOptionsModal(false);
        setSelectedDeliveryId(id);
        FAMerchantDetails.onApplyDeliveryOption({ merchantDetail, id });
    }

    // Product Order modal
    function onPressOrderAnother() {
        setIsShowProductOrderModal(false);
        navigation.navigate(SSL_PRODUCT_DETAILS, {
            merchantDetail,
            item: itemInOrder,
            tempOrderId: null,
            isNewOrder: true,
        });
    }

    function onEditOrder(order) {
        setIsShowProductOrderModal(false);
        navigation.navigate(SSL_PRODUCT_DETAILS, {
            merchantDetail,
            item: order,
            tempOrderId: order?.tempOrderId,
            isNewOrder: false,
        });
    }

    function showProductOrderModal(productInCart, item) {
        setIsShowProductOrderModal(true);
        setProductInOrder(productInCart);
        setItemInOrder(item);
    }

    function onDismissProductOrderModal() {
        setIsShowProductOrderModal(false);
    }

    /** Other functions */
    function onBackTap() {
        navigation.goBack();
    }

    function onShareBtn() {
        FAMerchantDetails.onShareBtn(merchantDetail);
        if (!merchantDetail?.merchantDeepLinkUrl) return;
        const shareOptions = {
            message: merchantDetail?.merchantDeepLinkUrl,
        };

        Share.open(shareOptions).catch((e) => {
            console.log("Share e", e);
        });
    }

    const onPressViewCart = useCallback(() => {
        const cartItems = getAnalyticsCartList({ cartV1 });
        FAMerchantDetails.viewCart({ merchantDetail, cartItems, cartV1 });
        navigation.navigate(SSL_CART_SCREEN, { selectedDeliveryId, tableNo });
    }, [cartV1, merchantDetail, navigation, selectedDeliveryId]);

    function renderViewState() {
        switch (screenState) {
            case SCREEN_SUCCESS:
                let deliveryOptionTitle = DELIVER_NOW; // deliveryOptions should not be null. We put a default value for isLoading scenario
                if (tableNo) {
                    deliveryOptionTitle = `Dine-In • Table ${tableNo}`;
                } else {
                    deliveryOptionTitle = deliveryOptions.find(
                        (option) => option.id === selectedDeliveryId
                    )?.title;
                }
                return (
                    <ScreenFlatList
                        merchantDetail={merchantDetail}
                        categoryTitleArr={categoryTitleArr}
                        cartV1={cartV1}
                        productData={productData}
                        showProductOrderModal={showProductOrderModal}
                        init={init}
                        ListHeaderComponent={
                            <MerchantDetailsCollapsibleHeader
                                merchantDetail={merchantDetail}
                                setPopup={setPopup}
                                onDeliveryTypeDropdownPillPressed={
                                    onDeliveryTypeDropdownPillPressed
                                }
                                selectedDeliveryOptionTitle={deliveryOptionTitle}
                                showDeliveryDisclaimerMerchantDelivery={
                                    DeliveryOptionDisclaimerModalRef.current
                                        ?.showDeliveryDisclaimerMerchantDelivery
                                }
                                showDeliveryDisclaimerLowestDelivery={
                                    DeliveryOptionDisclaimerModalRef.current
                                        ?.showDeliveryDisclaimerLowestDelivery
                                }
                            />
                        }
                    />
                );
            case SCREEN_SHIMMER:
                return _.isEmpty(merchantDetail) && <SSLMerchantDetailsShimmer />;
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

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerRightElement={
                            <TouchableOpacity onPress={onShareBtn}>
                                <Image style={styles.shareIcon} source={assets.icShareBlack} />
                            </TouchableOpacity>
                        }
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={
                                    merchantDetail?.shopName
                                        ? merchantDetail?.shopName
                                        : "Sama-Sama Lokal"
                                }
                            />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <View style={styles.container}>
                    {isMerchantNotFound ? (
                        <EmptyState
                            title="The shop is unavailable now"
                            subTitle="Check out another one. Give another local a chance to be your next favourite."
                            buttonLabel="Go Back"
                            onActionBtnClick={onBackTap}
                        />
                    ) : (
                        renderViewState()
                    )}
                    {merchantDetail?.orderMethod === 1 && (
                        <ManualContactMerchant
                            businessContactNo={merchantDetail?.businessContactNo}
                        />
                    )}
                    {amount && (
                        <CartCheckoutBtn onPressViewCart={onPressViewCart} amount={amount} />
                    )}
                </View>
            </ScreenLayout>

            <Popup
                visible={popup?.visible}
                title={popup?.title}
                description={popup?.description}
                onClose={popup?.onClose}
                primaryAction={popup?.primaryAction}
                ContentComponent={popup?.contentComponent}
            />
            <Popup
                visible={isShowTableOrderChangeModal}
                title={CHANGE_DELIVERY_OPTION_TITLE}
                description={CHANGE_DELIVERY_OPTION_DESC}
                onClose={onDismissTableOrderChangeModal}
                primaryAction={{
                    text: CHANGE_DELIVERY_OPTION,
                    onPress: onPressChangeTableOrderModal,
                }}
                textLink={{
                    text: CONTINUE_WITH_DINE_IN,
                    onPress: onDismissTableOrderChangeModal,
                }}
            />
            <DeliveryOptionRadioModal
                isShow={isShowDeliveryOptionsModal}
                options={deliveryOptions}
                selectedId={selectedDeliveryId}
                onApply={onApplyDeliveryOption}
                onDismiss={onDismissDeliveryOptionsModal}
            />
            <ProductOrderModal
                isShow={isShowProductOrderModal}
                isSst={merchantDetail?.isSst}
                sstPercentage={merchantDetail?.sstPercentage}
                item={itemInOrder}
                productArr={productInOrder}
                onOrderAnother={onPressOrderAnother}
                onEditOrder={onEditOrder}
                onDismiss={onDismissProductOrderModal}
            />
            <DeliveryOptionDisclaimerModal ref={DeliveryOptionDisclaimerModalRef} />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    shareIcon: { height: 44, width: 44 },
});

export default withModelContext(SSLMerchantDetails);

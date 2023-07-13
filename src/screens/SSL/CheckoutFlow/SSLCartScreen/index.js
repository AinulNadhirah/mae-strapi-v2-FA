import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation } from "@react-navigation/core";
import { useRoute } from "@react-navigation/native";
import _ from "lodash";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import ScreenLoaderWithOpacity from "@components/Loaders/ScreenLoaderWithOpacity";
import Popup from "@components/Popup";
import { BottomDissolveCover, dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import CartItem from "@components/SSL/CartItem";
import { DeliveryOptionRadioModal } from "@components/SSL/DeliveryOptionRadioModal";
import Typo from "@components/Text";
import { showSuccessToast, showInfoToast, showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import {
    getDeliveryCharges,
    getPreviousRecipient,
    createSSLOrder,
    getSSLMerchantDetailsV2,
} from "@services";
import { FACartScreen } from "@services/analytics/analyticsSSL";

import {
    BLACK,
    WHITE,
    MEDIUM_GREY,
    PICTON_BLUE,
    SEPARATOR,
    GREEN,
    DUSTY_GRAY,
} from "@constants/colors";
import {
    SSLCART_MINIMUM_ORDER_NOT_REACHED,
    SSLCART_MINIMUM_ORDER_NOT_REACHED_WOULD_YOU_LIKE,
    SSLCART_PROMO_CANT_BE_USED,
    SSL_CART_ADDITIONAL_DELIVERY_FEE,
    SSL_CART_ADD_ITEMS,
    SSL_CART_CHANGE_ADDRESS,
    SSL_CART_I_UNDERSTAND,
    SSL_CART_MERCHANT_CLOSED,
    SSL_CART_MERCHANT_CLOSED_DESC,
    SSL_CART_OUT_OF_STOCK,
    SSL_CART_OUT_OF_STOCK_DESC,
    SSL_CART_PICKUP,
    SSL_CART_REMOVE_CODE,
    SSL_CART_TRY_ANOTHER_MERCHANT,
    SSL_CART_UNABLE_ADDRESS,
    SSL_CART_UNABLE_ADDRESS_DESC,
    SSL_CART_UNABLE_ADDRESS_PICKUP_DESC,
    GOT_IT,
    POPUP_CLOSE,
    SSL_CART_ADDITIONAL_DELIVERY_FEE_DESC,
    SSL_CART_DELIVERY_FEE,
    SSL_CART_DELIVERY_FEE_DESC,
    SSL_CART_DELIVERY_TNC_DISCLAIMER,
    SSL_CART_DELIVERY_DISTANCE_N_TNC_DISCLAIMER,
    SSL_CART_PROCESSING_FEE,
} from "@constants/stringsSSL";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";
import { getDeviceRSAInformation } from "@utils/dataModel/utilityPartial.2";
import {
    calculateWeight,
    contextCart,
    deliveryType,
    getAnalyticsCartList,
    getLatitude,
    getLongitude,
    groupDeliveryType,
    isPromptUser,
    keysToCamel,
    SSLPROMPTUSERMSG,
    SSLUserContacteNoClass,
    syncLocalCartWithApiProductData,
    validateQRMSResponse,
} from "@utils/dataModel/utilitySSL";
import { displayLocationInCart } from "@utils/dataModel/utilitySSLGeolocation";
import { useUpdateEffect, useIsFocusedIncludingMount } from "@utils/hooks";

import SSLCartPickupInput from "./SSLCartPickupInput";
import SSLCartPromoInput from "./SSLCartPromoInput";
import {
    ActionButtonCheckout,
    ActionButtonEmailEmpty,
    ActionButtonError,
    ActionButtonLoading,
    ActionButtonOutOfCoverage,
    CartDeliveryTypePill,
    CartPickupEmailPill,
    CartLocationPill,
    CartLocationPillShimmer,
    DeliveryFeeLeftRightLbl,
    FootNote,
    LeftRightLbl,
    NoData,
    PromoLbl,
    NoteToRiderPill,
    CartDeliveryMsgPill,
    ProcessingFeeLeftRightLbl,
} from "./SSLCartScreenComponent";

// import { deliveryChargesRes } from "./SSLCartScreenDoc";

export const PROMO_STATUS_EMPTY = "PROMO_STATUS_EMPTY";
export const PROMO_STATUS_VALID = "PROMO_STATUS_VALID";
export const PROMO_STATUS_INVALID = "PROMO_STATUS_INVALID";
export const PROMO_STATUS_MIN_AMT = "PROMO_STATUS_MIN_AMT";
export const PROMO_STATUS_FRAUD = "PROMO_STATUS_FRAUD";

function SSLCartScreen() {
    const navigation = useNavigation();
    const { setParams } = navigation;
    const route = useRoute();
    const { params } = route;
    const { getModel, updateModel } = useModelController();

    // Location pill
    const { currSelectedLocationV1 } = getModel("ssl");
    const location = getModel("location");
    const latitude = useRef(getLatitude({ location, currSelectedLocationV1 }));
    const longitude = useRef(getLongitude({ location, currSelectedLocationV1 }));

    const API_SUCCESS = "API_SUCCESS";
    const API_LOADING = "API_LOADING";
    const API_ERROR = "API_ERROR";
    const [apiStatus, setApiStatus] = useState(API_LOADING);

    const [merchantDetail, setMerchantDetail] = useState({});
    const [isMerchantNotFound, setIsMerchantNotFound] = useState(false);
    const { cartV1, sandboxUrl } = getModel("ssl");

    const [deliveryChargesResponse, setDeliveryChargesResponse] = useState({});

    // Pickup / Email
    const [isShowEmailInputModal, setIsShowEmailInputModal] = useState(false);
    const [emailInputModalTitle, setEmailInputModalTitle] = useState("");
    const [emailString, setEmailString] = useState("");
    const [fullName, setFullName] = useState("");
    const [contactNoString, setContactNoString] = useState("");

    // Promo
    const [isShowPromoInputModal, setIsShowPromoInputModal] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [promoCodeString, setPromoCodeString] = useState(cartV1?.promoCodeString ?? "");

    const [promoCodeStatus, setPromoCodeStatus] = useState(PROMO_STATUS_EMPTY);
    const [promoResponse, setPromoResponse] = useState({});

    // Delivery Option Modal
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(params?.selectedDeliveryId ?? 0);
    const [totalWeight, setTotalWeight] = useState(params?.totalWeight ?? 0);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [isShowDeliveryOptionsModal, setIsShowDeliveryOptionsModal] = useState(false);

    // Table Ordering
    const [tableNo, setTableNo] = useState(params?.tableNo ?? "0");

    // Popups
    const POPUP_ADDITIONAL_FEE = "POPUP_ADDITIONAL_FEE";
    const POPUP_OUT_OF_COVERAGE = "POPUP_OUT_OF_COVERAGE"; // Merchant only have delivery
    const POPUP_OUT_OF_COVERAGE_PICKUP = "POPUP_OUT_OF_COVERAGE_PICKUP"; // Merchant provide pickup as alternative
    const POPUP_PROMO_MIN_AMT_NOT_REACHED = "POPUP_PROMO_MIN_AMT_NOT_REACHED";
    const POPUP_MERCHANT_CLOSED = "POPUP_MERCHANT_CLOSED";
    const POPUP_DELIVERY_FEE = "POPUP_DELIVERY_FEE";
    const POPUP_PROCESSING_FEE = "POPUP_PROCESSING_FEE";
    const POPUP_REHYDRATE_ERROR = "POPUP_REHYDRATE_ERROR"; // Merchant Product not same with local (item out of stock)
    const POPUP_MERCHANT_DELIVERY_PROCEED = "POPUP_MERCHANT_DELIVERY_PROCEED";

    const [popup, setPopup] = useState({});

    let total = 0;

    const syncCartWithLatestApi = useCallback(
        ({ merchantDetail, productData, response }) => {
            const cartProducts = cartV1?.cartProducts ?? [];
            // 1. Cart basket is over new orderLimit, clear cartProducts
            if (response === SSLPROMPTUSERMSG.orderLimitChanged) {
                const clearedCart = contextCart.generateEmptyCart();
                contextCart.storeCartContextAS({
                    updateModel,
                    cartObj: clearedCart,
                    AsyncStorage,
                });
                return;
            }

            // console.log("show product data in checkout: ", productData);
            // console.log("show cart product in checkout: ", cartProducts);

            const syncedProductData = syncLocalCartWithApiProductData(cartProducts, productData);

            // temporarily only, need to sync with API to get the latest product info
            // const syncedProductData = cartProducts;

            console.log("synced product data: ", syncedProductData);

            const syncedCart = contextCart.generateCartWith({
                merchantDetail,
                isReorder: false,
                productData: syncedProductData,
                promoCodeString: cartV1?.promoCodeString,
            });

            // console.log("synced cart: ", syncedCart);
            contextCart.storeCartContextAS({ updateModel, cartObj: syncedCart, AsyncStorage });

            FACartScreen.onScreen();
            if (cartV1?.cartProducts?.length) {
                const cartItems = getAnalyticsCartList({ cartV1 });
                FACartScreen.hasItems({ cartItems, total });
            }
        },
        [cartV1, total, updateModel]
    );

    const call3Api = useCallback(
        async ({ merchantId, deliveryId }) => {
            async function createSSLOrderFunc({
                cartProducts,
                merchantDetail,
                deliveryId,
                tableNo,
                promoCodeString,
                deliveryChargesResponse = {},
            }) {
                console.log("createSSLOrderFunc promoCodeString", promoCodeString);

                if (!promoCodeString) {
                    setPromoResponse({});
                    setPromoCodeStatus(PROMO_STATUS_EMPTY);
                    setPromoError("");

                    setApiStatus(API_SUCCESS);

                    if (params?.isNewAddressCheckoutFlow) {
                        checkIfPromptCheckout();
                        setParams({ isNewAddressCheckoutFlow: null });
                    }
                    return;
                }
                try {
                    const { deviceInformation, deviceId } = getModel("device");
                    const mobileSDKData = getDeviceRSAInformation(
                        deviceInformation,
                        DeviceInfo,
                        deviceId
                    );
                    const { cartProductsWeighted, totalCartWeight } = calculateWeight({
                        cartProducts,
                    });

                    const isSst = merchantDetail?.isSst;
                    const sstPercentage = merchantDetail?.sstPercentage;
                    const basketValue = contextCart.basketValue({
                        cartProducts,
                        isSst,
                        sstPercentage,
                    }); // subtotal
                    let total = parseFloat(basketValue); // total
                    if (deliveryChargesResponse?.deliveryCharge) {
                        total += parseFloat(deliveryChargesResponse?.deliveryCharge);
                    }
                    if (merchantDetail?.tax_processing_fee) {
                        total += parseFloat(merchantDetail?.tax_processing_fee_amount);
                    }

                    const {
                        addressLine1,
                        unitNo,
                        city,
                        state,
                        postcode,
                        note = "",
                    } = currSelectedLocationV1;
                    let { email, recipientName, contactNo } = currSelectedLocationV1;

                    if (selectedDeliveryId === 2 || selectedDeliveryId === 4) {
                        email = emailString;
                        recipientName = fullName;
                        contactNo = contactNoString;
                    }

                    // If don't have contactNo, we pass in "" instead of "60". If backend encounter "", they'll use dummy mobile instead (hardcoded at their end)
                    if (contactNo) contactNo = SSLUserContacteNoClass(contactNo).inBackendFormat();

                    const verifyPromoReq = {
                        transactionRefNo: null,
                        orderDetailVO: {
                            merchantId: merchantDetail.merchantId,
                            merchantName: merchantDetail.shopName,
                            tableNumber: tableNo,
                            subTotalAmount: basketValue, // basketValue is already.toFixed(2)
                            taxAmount: merchantDetail.isSst
                                ? (
                                      (basketValue / (1 + merchantDetail?.sstPercentage / 100)) *
                                      (merchantDetail?.sstPercentage / 100)
                                  ).toFixed(2)
                                : "0",
                            processingFeeAmount: merchantDetail.tax_processing_fee
                                ? merchantDetail.tax_processing_fee_amount.toFixed(2)
                                : "0",
                            totalPaymentAmount: total.toFixed(2),
                            isMkp: true,
                            deliveryType: deliveryId,
                            deliveryChargeDetail: {
                                ...deliveryChargesResponse,
                            },
                            promoCode: promoCodeString,
                            totalWeight: totalCartWeight,
                            recipientName,
                            addressDetail: {
                                addressLine1: unitNo ? `${unitNo}, ${addressLine1}` : addressLine1,
                                city,
                                state,
                                postcode,
                                email,
                                recipientName,
                                contactNo,
                                addressLine3: "", // Not using this
                                noteToRider: note,
                            },
                            products: cartProductsWeighted.map((obj) => {
                                obj.size = "";
                                return obj;
                            }),
                        },
                        mobileSDKData,
                    };
                    const data = await createSSLOrder(verifyPromoReq);

                    if (data?.data?.result?.status === "QR060") {
                        setPromoResponse({});
                        setPromoCodeStatus(PROMO_STATUS_MIN_AMT);
                        setPromoError(SSLCART_MINIMUM_ORDER_NOT_REACHED);
                    } else if (data?.data?.result?.status === "QR000") {
                        setPromoResponse(data.data.result.merchantDetailVOList[0]);
                        setPromoCodeStatus(PROMO_STATUS_VALID);
                        setPromoError("");
                    } else {
                        throw data?.data?.result;
                    }

                    // Save promoCodeString if API success
                    const syncedCart = contextCart.generateCartWith({
                        merchantDetail,
                        productData: cartProducts,
                        promoCodeString,
                    });
                    contextCart.storeCartContextAS({
                        updateModel,
                        cartObj: syncedCart,
                        AsyncStorage,
                    });

                    if (isShowPromoInputModal) setIsShowPromoInputModal(false); // hide only when success
                } catch (e) {
                    setPromoResponse({});
                    setPromoCodeStatus(
                        e.status === "QR054" ? PROMO_STATUS_FRAUD : PROMO_STATUS_INVALID
                    );

                    setPromoError(e.text ? e.text : "Invalid promo code. Please try again");
                } finally {
                    setApiStatus(API_SUCCESS);
                    if (params?.isNewAddressCheckoutFlow) {
                        checkIfPromptCheckout();
                        setParams({ isNewAddressCheckoutFlow: null });
                    }
                }
            }

            async function calculateDeliveryCharge({
                merchantDetail,
                deliveryId,
                deliveryOptions,
                cartProducts,
            }) {
                try {
                    if (
                        deliveryId === deliveryType.PICKUP ||
                        deliveryId === deliveryType.EMAIL ||
                        deliveryId === deliveryType.DINE_IN ||
                        !currSelectedLocationV1?.addressLine1 // No accurate location yet,
                    ) {
                        setDeliveryChargesResponse({});
                        createSSLOrderFunc({
                            cartProducts,
                            merchantDetail,
                            deliveryId,
                            promoCodeString,
                        });
                        return;
                    }
                    const { totalCartWeight, cartProductsWeighted } = calculateWeight({
                        cartProducts,
                    });

                    const {
                        latitude,
                        longitude,
                        addressLine1,
                        unitNo,
                        city,
                        state,
                        postcode,
                        note = "",
                    } = currSelectedLocationV1;
                    const params = {
                        coord: {
                            lat: latitude,
                            lon: longitude,
                        },
                        addressDetail: {
                            addressLine1: unitNo ? `${unitNo}, ${addressLine1}` : addressLine1,
                            city,
                            state,
                            postcode,
                            noteToRider: note,
                        },
                        categoryId: merchantDetail.categoryId,
                        merchantId: merchantDetail.merchantId,
                        deliveryType: deliveryId,
                        products: cartProductsWeighted,
                        totalWeight: totalCartWeight,
                    };
                    console.log("SSLCartScreen getDeliveryCharges start params", params);
                    const data = await getDeliveryCharges(params);
                    validateQRMSResponse(data);
                    setTotalWeight(params?.totalWeight);
                    const result = data?.data?.result;
                    // const result = deliveryChargesRes.result;

                    /**
                     * No need to popup again if same message
                     * 1. If out of coverage
                     *    - out of coverage (only delivery available)
                     *    - out of coverage try pickup (has both delivery and pickup option)
                     * 2. Additional Fee, desc from API (More than >60km / >30km etc)
                     * 3. >20km and no note, we prompt FE hardcoded >20 km message
                     * 4. If switch address from lower fee to higher fee, prompt message
                     */
                    if (!_.isEqual(deliveryChargesResponse, result)) {
                        // No need popup again if same message
                        if (result?.deliveryOutOfCoverage) {
                            if (deliveryOptions.find((obj) => obj.id === 2)) {
                                showPopup({ type: POPUP_OUT_OF_COVERAGE_PICKUP });
                            } else {
                                showPopup({ type: POPUP_OUT_OF_COVERAGE });
                            }
                        }
                        setDeliveryChargesResponse(result);
                    }

                    setSelectedDeliveryId(parseInt(result?.deliveryType)); // if has both deliverytype 1 & 3, QRMS will override and tell us use the cheapest
                    createSSLOrderFunc({
                        cartProducts,
                        merchantDetail,
                        deliveryId: parseInt(result?.deliveryType),
                        promoCodeString,
                        deliveryChargesResponse: result,
                    });
                } catch (e) {
                    setDeliveryChargesResponse({});
                    setApiStatus(API_ERROR);
                    showErrorToast({
                        message: e.message,
                    });
                }
            }

            async function getMerchant() {
                console.log("SSLCartScreen getMerchant");
                setApiStatus(API_LOADING);

                const params = {
                    latitude: latitude.current,
                    longitude: longitude.current,
                    merchantId,
                };
                try {
                    // const data = await getMerchantDetail(params);
                    const data = await getSSLMerchantDetailsV2({ sandboxUrl, body: params });
                    validateQRMSResponse(data);
                    const merchantDetail = data?.data?.result?.merchantDetail ?? {};

                    setMerchantDetail(merchantDetail);

                    console.log("SSLMerchantDetails getMerchantDetail success", merchantDetail);
                    setMerchantDetail(merchantDetail);

                    const activeCategory = merchantDetail?.optionCategory?.filter(
                        (element) => element.active === true
                    );

                    const allProducts = activeCategory?.flatMap((data) => data.products);

                    console.log("allProducts", allProducts);
                    const tempProducts = allProducts.map((obj) => {
                        if (!merchantDetail?.open) obj.avail = false; // Store close = product unavailable
                        obj.priceAmount = parseFloat(obj.priceAmount).toFixed(2); // standardize amount
                        return obj;
                    });
                    // We're not storing productData. It gets refreshed everytime to make sure up to date

                    const deliveryOptions = groupDeliveryType(
                        merchantDetail?.pills?.deliveryTypePills
                    ).map(({ id, name }) => ({
                        id,
                        title: name,
                        isSelected: false,
                    }));
                    setDeliveryOptions(deliveryOptions);

                    /**
                     * Default selectedDeliveryId to 1st item if empty (when user quick nav via floating cart)
                     * SSLMerchantDetails -> SSLCartScreen (has deliveryId)
                     * SSLShopTab(or any other screen) -> tap floating cart -> SSLCartScreen (no deliveryId)
                     * */
                    let tempDeliveryId;
                    if (deliveryId === 0) {
                        tempDeliveryId = deliveryOptions?.[0]?.id;
                        setSelectedDeliveryId(tempDeliveryId);
                    } else {
                        tempDeliveryId = deliveryId;
                    }

                    const response = isPromptUser({
                        merchantDetail,
                        productData: tempProducts,
                        cartV1,
                    });
                    switch (response) {
                        case SSLPROMPTUSERMSG.unavailable:
                            showPopup({ type: POPUP_MERCHANT_CLOSED });
                            return false;
                        case SSLPROMPTUSERMSG.success:
                            break;
                        case SSLPROMPTUSERMSG.reorderSuccess:
                            break;
                        case SSLPROMPTUSERMSG.orderLimitChanged:
                        case SSLPROMPTUSERMSG.outOfStock:
                            showPopup({ type: POPUP_REHYDRATE_ERROR });
                            break;
                        default:
                            break;
                    }
                    syncCartWithLatestApi({ merchantDetail, productData: tempProducts, response });

                    calculateDeliveryCharge({
                        merchantDetail,
                        deliveryId: tempDeliveryId,
                        deliveryOptions,
                        cartProducts: cartV1?.cartProducts,
                    });
                } catch (e) {
                    setApiStatus(API_ERROR);

                    if (e.status === "QR070") {
                        setIsMerchantNotFound(true); // Special handling when merchant manually toggle "Closed" while raining. Merchant not found from API

                        // Clear cart whenever QR070 - biz requirement
                        const clearedCart = contextCart.generateEmptyCart();
                        contextCart.storeCartContextAS({
                            updateModel,
                            cartObj: clearedCart,
                            AsyncStorage,
                        });
                    } else {
                        showErrorToast({
                            message: e.message,
                        });
                    }
                }
            }

            /** In this order
             * 1. getMerchant
             * 2. getDelivery (if any)
             * 3. getPromo (if any)
             */
            if (!merchantId) return;
            getMerchant();
        },
        [
            params?.isNewAddressCheckoutFlow,
            checkIfPromptCheckout,
            setParams,
            getModel,
            currSelectedLocationV1,
            selectedDeliveryId,
            updateModel,
            isShowPromoInputModal,
            emailString,
            fullName,
            contactNoString,
            deliveryChargesResponse,
            promoCodeString,
            showPopup,
            sandboxUrl,
            cartV1,
            syncCartWithLatestApi,
        ]
    );

    const init = useCallback(
        (obj = {}) => {
            const { deliveryId = selectedDeliveryId } = obj;
            console.log("SSLCartScreen init");
            call3Api({
                merchantId: cartV1?.merchantDetail?.merchantId,
                deliveryId,
            });
        },
        [call3Api, cartV1?.merchantDetail?.merchantId, selectedDeliveryId]
    );

    /**
     * Refresh everytime viewDidAppear
     */
    useIsFocusedIncludingMount(() => {
        if (cartV1?.merchantDetail?.merchantId) {
            console.log("SSLCartScreen useIsFocusedExceptMount cartV1");
            init({});
        }
    });

    // Promo Code
    useUpdateEffect(() => {
        console.log("SSLCartScreen useEffect useUpdateEffect", promoCodeStatus);
        switch (promoCodeStatus) {
            case PROMO_STATUS_VALID:
                showSuccessToast({
                    message: "Promo Code Applied.",
                });
                break;
            case PROMO_STATUS_MIN_AMT:
                showInfoToast({
                    message:
                        "Sorry, you haven’t reached the mininum order value to use this promo code.",
                });
                break;
            case PROMO_STATUS_INVALID:
                showInfoToast({
                    message: promoError,
                });
                break;
            case PROMO_STATUS_FRAUD:
                showInfoToast({
                    message:
                        "For further assistance, kindly call our support team at 1-300-88-6688.",
                });
                break;
            default:
                break;
        }
    }, [promoCodeStatus]);
    useUpdateEffect(() => {
        console.log("SSLCartScreen useEffect promoCodeString", promoCodeString);
        init({});
    }, [promoCodeString]);
    function applyPromoCode({ tempPromoCode }) {
        console.log("SSLCartScreen applyPromoCode", tempPromoCode);
        setPromoCodeString(tempPromoCode);
    }
    function onPressEnterPromo() {
        if (
            [deliveryType.PICKUP, deliveryType.EMAIL, deliveryType.DINE_IN].includes(
                selectedDeliveryId
            ) &&
            (!emailString || !fullName || !contactNoString)
        ) {
            showInfoToast({
                message: "Please enter the recipient info first before applying a Promo Code.",
            });
        } else {
            if (apiStatus === API_LOADING) return;
            setIsShowPromoInputModal(true);
        }
    }
    function removePromo() {
        setPromoCodeString("");
        setPromoCodeStatus(PROMO_STATUS_EMPTY);
        const syncedCart = contextCart.generateCartWith({
            merchantDetail,
            productData: cartV1?.cartProducts,
            promoCodeString: "",
        });
        contextCart.storeCartContextAS({ updateModel, cartObj: syncedCart, AsyncStorage });
    }

    // Popups
    // Delivery Fee Popup
    function onPressDeliveryFeeInfo() {
        showPopup({ type: POPUP_DELIVERY_FEE });
    }

    function onPressProcessingFeeInfo() {
        showPopup({ type: POPUP_PROCESSING_FEE });
    }

    // Promo Popup - min amount
    function onPressPromoInfoMinAmt() {
        showPopup({ type: POPUP_PROMO_MIN_AMT_NOT_REACHED });
    }

    // Popup - Delivery Additional Fee || Out of Coverage || Out of Coverage w Pickup - Change Address

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function showPopup({ type, description }) {
        function hidePopup() {
            setPopup({ visible: false });
        }

        function onPressPopupChangeAddress() {
            const screenName =
                popup.title === SSL_CART_UNABLE_ADDRESS
                    ? "SSL_Cart_DeliveryError"
                    : "SSL_Cart_AddDeliveryFee";
            FACartScreen.changeAddress(screenName);

            setPopup({ visible: false });
            onPressLocationPill();
        }

        // Popup - Delivery Out of Coverage || Merchant Closed- Another Merchant
        function onPressPopupAnotherMerchant() {
            if (popup.title === SSL_CART_UNABLE_ADDRESS) {
                FACartScreen.deliveryErrorChangeMerchant();
            }
            setPopup({ visible: false });
            navigation.navigate(navigationConstant.SSL_TAB_SCREEN);
        }

        // Delivery Popup - Out of Coverage - Pickup Instead
        function onPressHideOutOfCoverageTryPickup() {
            FACartScreen.deliveryErrorSelfPickup();
            setPopup({ visible: false });
            setSelectedDeliveryId(2);
            init({ deliveryId: 2 });
        }

        function onPressPromoMinAmtPopupPrimary() {
            setPopup({ visible: false });
            onViewMerchant();
        }
        function onPressPromoMinAmtPopupRemove() {
            setPopup({ visible: false });
            removePromo();
        }

        let analyticScreenName = "";
        switch (type) {
            case POPUP_ADDITIONAL_FEE:
                setPopup({
                    visible: true,
                    title: SSL_CART_ADDITIONAL_DELIVERY_FEE,
                    description,
                    onClose: () => {
                        hidePopup();
                        FACartScreen.addDeliveryFee();
                    },
                    primaryAction: {
                        text: SSL_CART_I_UNDERSTAND,
                        onPress: () => {
                            hidePopup();
                            FACartScreen.addDeliveryFee();
                        },
                    },
                    secondaryAction: null,
                    textLink: {
                        text: SSL_CART_CHANGE_ADDRESS,
                        onPress: onPressPopupChangeAddress,
                    },
                });
                analyticScreenName = "SSL_Cart_AddDeliveryFee";
                break;
            case POPUP_OUT_OF_COVERAGE:
                setPopup({
                    visible: true,
                    title: SSL_CART_UNABLE_ADDRESS,
                    description: SSL_CART_UNABLE_ADDRESS_DESC,
                    onClose: hidePopup,
                    primaryAction: {
                        text: SSL_CART_CHANGE_ADDRESS,
                        onPress: onPressPopupChangeAddress,
                    },
                    secondaryAction: null,
                    textLink: {
                        text: SSL_CART_TRY_ANOTHER_MERCHANT,
                        onPress: onPressPopupAnotherMerchant,
                    },
                });
                analyticScreenName = "SSL_Cart_DeliveryError";
                break;
            case POPUP_OUT_OF_COVERAGE_PICKUP:
                setPopup({
                    visible: true,
                    title: SSL_CART_UNABLE_ADDRESS,
                    description: SSL_CART_UNABLE_ADDRESS_PICKUP_DESC,
                    onClose: hidePopup,
                    primaryAction: {
                        text: SSL_CART_CHANGE_ADDRESS,
                        onPress: onPressPopupChangeAddress,
                    },
                    secondaryAction: null,
                    textLink: {
                        text: SSL_CART_PICKUP,
                        onPress: onPressHideOutOfCoverageTryPickup,
                    },
                });
                analyticScreenName = "SSL_Cart_DeliveryError";
                break;
            case POPUP_PROMO_MIN_AMT_NOT_REACHED:
                setPopup({
                    visible: true,
                    title: SSLCART_PROMO_CANT_BE_USED,
                    description: SSLCART_MINIMUM_ORDER_NOT_REACHED_WOULD_YOU_LIKE,
                    onClose: hidePopup,
                    primaryAction: {
                        text: SSL_CART_ADD_ITEMS,
                        onPress: onPressPromoMinAmtPopupPrimary,
                    },
                    secondaryAction: {
                        text: SSL_CART_REMOVE_CODE,
                        onPress: onPressPromoMinAmtPopupRemove,
                    },
                    textLink: null,
                });
                break;
            case POPUP_MERCHANT_CLOSED:
                setPopup({
                    visible: true,
                    title: SSL_CART_MERCHANT_CLOSED,
                    description: SSL_CART_MERCHANT_CLOSED_DESC,
                    onClose: onPressPopupAnotherMerchant,
                    primaryAction: {
                        text: GOT_IT,
                        onPress: onPressPopupAnotherMerchant,
                    },
                    secondaryAction: null,
                    textLink: null,
                });
                break;
            case POPUP_DELIVERY_FEE:
                setPopup({
                    visible: true,
                    title: SSL_CART_DELIVERY_FEE,
                    description: SSL_CART_DELIVERY_FEE_DESC,
                    onClose: hidePopup,
                    primaryAction: {
                        text: POPUP_CLOSE,
                        onPress: hidePopup,
                    },
                    secondaryAction: null,
                    textLink: null,
                });
                break;
            case POPUP_PROCESSING_FEE:
                setPopup({
                    visible: true,
                    title: SSL_CART_PROCESSING_FEE,
                    description: merchantDetail?.tooltip_description,
                    onClose: hidePopup,
                    secondaryAction: null,
                    textLink: null,
                });
                break;
            case POPUP_REHYDRATE_ERROR:
                setPopup({
                    visible: true,
                    title: SSL_CART_OUT_OF_STOCK,
                    description: SSL_CART_OUT_OF_STOCK_DESC,
                    onClose: hidePopup,
                    primaryAction: {
                        text: GOT_IT,
                        onPress: hidePopup,
                    },
                    secondaryAction: null,
                    textLink: null,
                });
                break;
            case POPUP_MERCHANT_DELIVERY_PROCEED:
                setPopup({
                    visible: true,
                    title: "Merchant Delivery",
                    description:
                        "No delivery tracking is available for this delivery option. Do contact the merchant for the estimated delivery time. ",
                    onClose: hidePopup,
                    primaryAction: {
                        text: "Proceed",
                        onPress: () => {
                            setPopup({ visible: false });
                            onPressCheckout();
                        },
                    },
                    secondaryAction: null,
                    textLink: {
                        text: "Cancel",
                        onPress: hidePopup,
                    },
                });
                break;
            default:
                break;
        }
        if (analyticScreenName) {
            FACartScreen.analyticScreenName(analyticScreenName);
        }
    }

    // Location Pill - Self pickup
    function selfPickupShowEmailInput() {
        setEmailInputModalTitle("Pickup Person Info");
        setIsShowEmailInputModal(true);
    }

    // Location Pill - Dine in
    function dineInShowEmailInput() {
        setEmailInputModalTitle("Recipient Details");
        setIsShowEmailInputModal(true);
    }

    // Location Pill - Email
    function voucherShowEmailInput() {
        setEmailInputModalTitle("Send to Email");
        setIsShowEmailInputModal(true);
    }

    // Modal - Email input
    function onDismissEmailInputModal() {
        setIsShowEmailInputModal(false);
    }
    function onCallbackEmailInputModal({ emailString, fullName, contactNoString }) {
        setEmailString(emailString);
        setFullName(fullName);
        setContactNoString(contactNoString);
        setIsShowEmailInputModal(false);
    }

    const getEmailNameFromPrevious = useCallback(async () => {
        // if email full name already has value, don't proceed
        if (fullName || emailString || contactNoString) {
            return;
        }
        try {
            const response = await getPreviousRecipient();
            setFullName(response.data.result.recipients[0].name);
            setEmailString(response.data.result.recipients[0].email);
            setContactNoString(
                SSLUserContacteNoClass(
                    response.data.result.recipients[0].contactNo
                ).inBackendFormat()
            );
        } catch (e) {
            // do nothing
            // call Addressbook, get default address (or 1st one) and auto populate email fullname
        }
    }, [emailString, fullName, contactNoString]);

    useEffect(() => {
        if (
            [deliveryType.EMAIL, deliveryType.PICKUP, deliveryType.DINE_IN].includes(
                selectedDeliveryId
            )
        ) {
            console.log("SSLCartScreen useEffect selectedDeliveryId");
            getEmailNameFromPrevious();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDeliveryId]);

    // Callback from LocationMain
    useEffect(() => {
        if (params?.isNewLocationSelectedRefresh) {
            // this screen already refresh onFocus. Just set the param to false will do
            const { setParams } = navigation;
            setParams({ isNewLocationSelectedRefresh: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.isNewLocationSelectedRefresh]);

    // Delivery Option modal
    function onPressDeliveryType() {
        FACartScreen.changeDeliveryOption();
        if (apiStatus === API_LOADING) return;
        setIsShowDeliveryOptionsModal(true);
    }
    function onDismissDeliveryOptionsModal() {
        setIsShowDeliveryOptionsModal(false);
    }
    function onApplyDeliveryOption(id) {
        console.log("onApplyDeliveryOption", id);
        setIsShowDeliveryOptionsModal(false);
        if (selectedDeliveryId != id) {
            setSelectedDeliveryId(id);
            init({ deliveryId: id });
        }
    }

    // Other functions
    function onBackTap() {
        navigation.goBack();
    }

    function onPressLocationPill() {
        navigation.navigate(navigationConstant.SSL_LOCATION_MAIN, {
            entryPoint: navigationConstant.SSL_CART_SCREEN,
        });
    }

    function pullToRefresh() {
        init({});
    }

    function onPressEditNoteToRider() {
        let param = {};
        if (currSelectedLocationV1.addressType === 3) {
            param = {
                entryPoint: navigationConstant.SSL_CART_SCREEN,
                item: currSelectedLocationV1, // item = address item
            };
        } else {
            param = {
                entryPoint: navigationConstant.SSL_CART_SCREEN,
                searchLocationItem: currSelectedLocationV1,
            };
        }
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, param);
    }

    function onPressAddLocationToAddress() {
        navigation.navigate(navigationConstant.SSL_ADDRESS_ADDEDIT, {
            entryPoint: navigationConstant.SSL_CART_SCREEN,
            searchLocationItem: currSelectedLocationV1,
            isNewAddressCheckoutFlow: true,
        });
    }

    function onViewMerchant() {
        FACartScreen.viewMenu();
        navigation.navigate(navigationConstant.SSL_MERCHANT_DETAILS, {
            merchantId: merchantDetail.merchantId,
        });
    }

    function editProduct(value) {
        FACartScreen.editMenu();

        navigation.navigate(navigationConstant.SSL_PRODUCT_DETAILS, {
            item: value,
            tempOrderId: value?.tempOrderId,
            merchantDetail,
            isNewOrder: false,
        });
    }

    function checkIfPromptCheckout() {
        if (deliveryChargesResponse?.deliveryType == MERCHANT_DELIVERY) {
            showPopup({ type: POPUP_MERCHANT_DELIVERY_PROCEED });
        } else {
            onPressCheckout();
        }
    }

    function onPressCheckout() {
        const recipientAddressObj = _.cloneDeep(currSelectedLocationV1);
        if (
            [deliveryType.PICKUP, deliveryType.EMAIL, deliveryType.DINE_IN].includes(
                selectedDeliveryId
            )
        ) {
            recipientAddressObj.email = emailString;
            recipientAddressObj.recipientName = fullName;
            recipientAddressObj.contactNo =
                SSLUserContacteNoClass(contactNoString).inBackendFormat();
        }

        // We do additional checking here because there's too many entry point for email, name, contact
        if (
            !recipientAddressObj.email ||
            !recipientAddressObj.recipientName ||
            !SSLUserContacteNoClass(recipientAddressObj?.contactNo).isMalaysianMobileNum()
        ) {
            showErrorToast({
                message: "Recipient name, email, and contact number is required.",
            });
            return;
        }

        FACartScreen.onPressCheckout({
            cartItems: getAnalyticsCartList({ cartV1 }),
            total,
            promoCodeString: PROMO_STATUS_VALID ? promoCodeString : "",
        });

        navigation.navigate(navigationConstant.SSL_CHECKOUT_START, {
            merchantDetail,
            tableNo,
            deliveryChargesResponse,
            promoResponse,
            cartV1,
            selectedDeliveryId,
            promoCodeString: promoCodeStatus === PROMO_STATUS_VALID ? promoCodeString : "",
            recipientAddressObj,
        });
    }

    // On Screen Variables - Location Pill
    const locationInCart = displayLocationInCart({ currSelectedLocationV1 });
    // Is location or saved address?
    const isLocation = currSelectedLocationV1?.addressType !== 3;

    const BUFFER_TIME = 15;
    let instantDeliveryPrepTime = "";
    if (selectedDeliveryId === THIRD_PARTY_DELIVERY) {
        instantDeliveryPrepTime = "~";
        const timeRequired =
            Math.round(deliveryChargesResponse?.deliveryDistance || 0) +
                merchantDetail.prepTime +
                BUFFER_TIME || 0 + BUFFER_TIME;
        instantDeliveryPrepTime += `${timeRequired} mins `;
        if (deliveryChargesResponse?.deliveryServiceName) {
            instantDeliveryPrepTime += `• ${deliveryChargesResponse?.deliveryServiceName}`;
        }
        instantDeliveryPrepTime += " (Powered by Delyva)";
    }

    // On Screen Variables
    const shopName = merchantDetail?.shopName;
    const currency = "RM";

    // On Screen Variables - Subtotal
    const basketValue = contextCart.basketValue({
        cartProducts: cartV1?.cartProducts,
        isSst: merchantDetail?.isSst,
        sstPercentage: merchantDetail?.sstPercentage,
    });
    const subTotal = `${currency} ${basketValue}`;

    // On Screen Variables -  Total + Processing Fee, if any
    // total = parseFloat(basketValue) + merchantDetail?.tax_processing_fee_amount ?? 0;
    total = parseFloat(basketValue);

    if (merchantDetail?.tax_processing_fee) {
        total += parseFloat(merchantDetail?.tax_processing_fee_amount);
    }

    if (parseFloat(promoResponse?.discountAmount) >= parseFloat(basketValue)) {
        total -= parseFloat(basketValue);
    } else {
        total -= parseFloat(promoResponse?.discountAmount ?? 0);
    }

    if (deliveryChargesResponse?.deliveryCharge) {
        total += parseFloat(deliveryChargesResponse?.deliveryCharge);
    }

    if (
        promoResponse?.deliveryDiscountValue &&
        [THIRD_PARTY_DELIVERY, MERCHANT_DELIVERY].includes(selectedDeliveryId)
    ) {
        if (
            parseFloat(promoResponse?.deliveryDiscountValue) >=
            parseFloat(deliveryChargesResponse?.deliveryCharge)
        ) {
            total -= parseFloat(deliveryChargesResponse?.deliveryCharge);
        } else {
            total -= parseFloat(promoResponse?.deliveryDiscountValue);
        }
    }

    const totalLbl = `${currency} ${commaAdder(total.toFixed(2))}`;

    function renderActionButton() {
        if (apiStatus === API_LOADING) {
            return <ActionButtonLoading />;
        } else if (apiStatus === API_ERROR) {
            return <ActionButtonError init={init} />;
        } else if (
            selectedDeliveryId === deliveryType.PICKUP &&
            (!emailString || !fullName || !contactNoString)
        ) {
            return (
                <ActionButtonEmailEmpty
                    title="Enter Pickup Details"
                    onPress={selfPickupShowEmailInput}
                />
            );
        } else if (
            selectedDeliveryId === EMAIL &&
            (!emailString || !fullName || !contactNoString)
        ) {
            return <ActionButtonEmailEmpty title="Enter email" onPress={voucherShowEmailInput} />;
        } else if (deliveryChargesResponse?.deliveryOutOfCoverage) {
            return <ActionButtonOutOfCoverage onPressLocationPill={onPressLocationPill} />;
        } else if (
            (selectedDeliveryId === THIRD_PARTY_DELIVERY ||
                selectedDeliveryId === MERCHANT_DELIVERY) &&
            isLocation
        ) {
            return (
                <ActionButtonCheckout
                    label={`Checkout • ${totalLbl}`}
                    onPressCheckout={onPressAddLocationToAddress}
                />
            );
        } else {
            return (
                <ActionButtonCheckout
                    label={`Checkout • ${totalLbl}`}
                    onPressCheckout={checkIfPromptCheckout}
                />
            );
        }
    }

    function discountAmt(discountValue) {
        return `- ${currency} ${
            parseFloat(discountValue) > parseFloat(basketValue) ? basketValue : discountValue
        }`;
    }

    function deliveryDiscountAmt(deliveryDiscountValue) {
        return `- ${currency} ${
            parseFloat(deliveryDiscountValue) >= parseFloat(deliveryChargesResponse.deliveryCharge)
                ? parseFloat(deliveryChargesResponse.deliveryCharge).toFixed(2)
                : deliveryDiscountValue
        }`;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        backgroundColor={MEDIUM_GREY}
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text="Cart"
                            />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={22}
            >
                {isMerchantNotFound ? (
                    <EmptyState
                        title="The shop is unavailable now"
                        subTitle="Check out another one. Give another local a chance to be your next favourite."
                        buttonLabel="Go Back"
                        onActionBtnClick={onBackTap}
                    />
                ) : !cartV1?.cartProducts?.length ? (
                    <NoData onActionBtnClick={onBackTap} />
                ) : (
                    <>
                        <ScrollView
                            refreshControl={
                                <RefreshControl refreshing={false} onRefresh={pullToRefresh} />
                            }
                        >
                            <View style={styles.containerPadding}>
                                {!selectedDeliveryId ? ( // We don't store deliveryId in user's cart, so if SSL Main -> Cart, the deliveryId is undefined
                                    <CartLocationPillShimmer />
                                ) : (
                                    <CartDeliveryTypePill
                                        onPressDeliveryType={onPressDeliveryType}
                                        deliveryOptions={deliveryOptions}
                                        selectedDeliveryId={selectedDeliveryId}
                                        instantDeliveryPrepTime={instantDeliveryPrepTime}
                                        tableNo={tableNo ?? "0"}
                                    />
                                )}
                                {(selectedDeliveryId === 1 || selectedDeliveryId === 3) && (
                                    <CartLocationPill
                                        onPressLocationPill={onPressLocationPill}
                                        locationLbl={locationInCart}
                                    />
                                )}
                                {selectedDeliveryId === 2 && (
                                    <CartPickupEmailPill
                                        onPress={selfPickupShowEmailInput}
                                        fullNameString={fullName}
                                        value={SSLUserContacteNoClass(
                                            contactNoString
                                        ).inFullDisplayFormat()}
                                    />
                                )}
                                {selectedDeliveryId === 4 && (
                                    <CartPickupEmailPill
                                        onPress={selfPickupShowEmailInput}
                                        fullNameString={fullName}
                                        value={emailString}
                                    />
                                )}
                                {selectedDeliveryId === deliveryType.DINE_IN && (
                                    <CartPickupEmailPill
                                        onPress={dineInShowEmailInput}
                                        fullNameString={fullName}
                                        value={
                                            contactNoString
                                                ? SSLUserContacteNoClass(
                                                      contactNoString
                                                  ).inFullDisplayFormat()
                                                : null
                                        }
                                    />
                                )}
                                {/** Note to rider */}
                                {[deliveryType.THIRD_PARTY, deliveryType.MERCHANT].includes(
                                    selectedDeliveryId
                                ) && (
                                    <NoteToRiderPill
                                        onPress={onPressEditNoteToRider}
                                        note={currSelectedLocationV1?.note}
                                    />
                                )}

                                {[THIRD_PARTY_DELIVERY, MERCHANT_DELIVERY].includes(
                                    selectedDeliveryId
                                ) && (
                                    <CartDeliveryMsgPill
                                        deliveryDistance={deliveryChargesResponse?.deliveryDistance}
                                        deliveryWeight={totalWeight}
                                        selectedDeliveryId={selectedDeliveryId}
                                    />
                                )}
                                {/** Shop name   View Menu */}
                                <View style={styles.shopView}>
                                    <View style={styles.container}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            color={BLACK}
                                            text={shopName}
                                            textAlign="left"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={onViewMerchant}
                                        hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                                    >
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            text="View Menu"
                                            color={PICTON_BLUE}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/** Menu Items */}
                                <View style={styles.cartContainer}>
                                    {cartV1?.cartProducts?.map((product, index) => {
                                        function editProductHandler() {
                                            editProduct(product);
                                        }
                                        const isLastIndex =
                                            cartV1?.cartProducts.length == index + 1;
                                        return (
                                            <>
                                                <CartItem
                                                    // key={`${product.productId}`}
                                                    index={index}
                                                    product={product}
                                                    options={keysToCamel(product?.selectedOptions)}
                                                    editProductHandler={editProductHandler}
                                                    isLastIndex={isLastIndex}
                                                    hasSeeMore={
                                                        product?.selectedOptions?.length > 3
                                                    }
                                                    isSst={merchantDetail?.isSst}
                                                    sstPercentage={merchantDetail?.sstPercentage}
                                                />
                                            </>
                                        );
                                    })}
                                </View>

                                <View style={styles.subtotalPaddingTop} />

                                {/** Subtotal     RM 10.00 */}
                                <LeftRightLbl leftLbl="Subtotal" rightLbl={commaAdder(subTotal)} />

                                {/** Initial Dummy SST UI */}
                                {!!merchantDetail?.isSst && (
                                    <LeftRightLbl
                                        leftLbl="Incl. Tax"
                                        rightLbl={`RM ${(
                                            (basketValue /
                                                (1 + merchantDetail?.sstPercentage / 100)) *
                                            (merchantDetail?.sstPercentage / 100)
                                        ).toFixed(2)}`}
                                        leftLblColor={DUSTY_GRAY}
                                        color={DUSTY_GRAY}
                                    />
                                )}

                                {!!merchantDetail?.tax_processing_fee && (
                                    <ProcessingFeeLeftRightLbl
                                        onPressProcessingFeeInfo={onPressProcessingFeeInfo}
                                        processingFee={`RM ${merchantDetail?.tax_processing_fee_amount?.toFixed(
                                            2
                                        )}`}
                                    />
                                )}

                                {/** Cart Discount     - RM 10.00 */}
                                {!!promoResponse?.discountAmount &&
                                    parseFloat(promoResponse?.discountAmount) > 0 && (
                                        <LeftRightLbl
                                            leftLbl="Cart Discount"
                                            rightLbl={discountAmt(promoResponse?.discountAmount)}
                                            color={GREEN}
                                        />
                                    )}

                                {/** Delivery Fee (Grab)*     + RM 10.00 */}
                                <DeliveryFeeLeftRightLbl
                                    deliveryChargesResponse={deliveryChargesResponse}
                                    onPressDeliveryFeeInfo={onPressDeliveryFeeInfo}
                                />

                                {/** Delivery Discount     - RM 10.00 */}
                                {!!promoResponse?.deliveryDiscountValue &&
                                    parseFloat(promoResponse?.deliveryDiscountValue) > 0 &&
                                    [THIRD_PARTY_DELIVERY, MERCHANT_DELIVERY].includes(
                                        selectedDeliveryId
                                    ) && (
                                        <LeftRightLbl
                                            leftLbl="Delivery Discount"
                                            rightLbl={deliveryDiscountAmt(
                                                promoResponse?.deliveryDiscountValue
                                            )}
                                            color={GREEN}
                                        />
                                    )}

                                {/** Promo     Enter Promo Code */}
                                <PromoLbl
                                    onPressEnterPromo={onPressEnterPromo}
                                    promoCodeString={promoCodeString}
                                    promoCodeStatus={promoCodeStatus}
                                    onPressPromoInfoMinAmt={onPressPromoInfoMinAmt}
                                    removePromo={removePromo}
                                />

                                {/** Total     RM 20.00 */}
                                <LeftRightLbl
                                    leftLbl="Total"
                                    rightLbl={`${commaAdder(totalLbl)}`}
                                />

                                <View style={[styles.separator, styles.separatorMargin]} />

                                <FootNote text={SSL_CART_DELIVERY_TNC_DISCLAIMER} />
                            </View>
                            <View style={dissolveStyle.scrollPadding} />
                        </ScrollView>
                        <View style={dissolveStyle.imageBackground}>
                            <BottomDissolveCover>
                                <View style={styles.centerContainer}>{renderActionButton()}</View>
                            </BottomDissolveCover>
                        </View>
                    </>
                )}
            </ScreenLayout>
            {isShowEmailInputModal && (
                <Animatable.View
                    duration={150}
                    animation="fadeIn"
                    style={styles.promoInputContainer}
                >
                    <SSLCartPickupInput
                        title={emailInputModalTitle}
                        isShow={isShowEmailInputModal}
                        fullName={fullName}
                        contactNoString={contactNoString}
                        emailString={emailString}
                        onDismiss={onDismissEmailInputModal}
                        onCallback={onCallbackEmailInputModal}
                    />
                </Animatable.View>
            )}
            {isShowPromoInputModal && (
                <Animatable.View
                    duration={150}
                    animation="fadeIn"
                    style={styles.promoInputContainer}
                >
                    <SSLCartPromoInput
                        promoCodeStatus={promoCodeStatus}
                        promoCodeString={promoCodeString}
                        applyPromoCode={applyPromoCode}
                        isLoading={apiStatus === API_LOADING}
                        promoError={promoError}
                        isShowPromoInputModal={isShowPromoInputModal}
                        setIsShowPromoInputModal={setIsShowPromoInputModal}
                    />
                </Animatable.View>
            )}

            <Popup
                visible={popup?.visible}
                title={popup?.title}
                description={popup?.description}
                onClose={popup?.onClose}
                primaryAction={popup?.primaryAction}
                textLink={popup?.textLink}
                secondaryAction={popup?.secondaryAction}
            />

            <DeliveryOptionRadioModal
                isShow={isShowDeliveryOptionsModal}
                options={deliveryOptions}
                selectedId={selectedDeliveryId}
                onApply={onApplyDeliveryOption}
                onDismiss={onDismissDeliveryOptionsModal}
            />
            <ScreenLoaderWithOpacity showLoader={apiStatus === "API_LOADING"} opacity="0.5" />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    cartContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginTop: 19,
        overflow: "hidden",
    },
    centerContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    container: { flex: 1 },
    containerPadding: {
        paddingHorizontal: 24,
    },
    promoInputContainer: { height: "100%", position: "absolute", width: "100%", zIndex: 1 },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
    },
    separatorMargin: { marginTop: 16 },
    shopView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 34,
    },
    subtotalPaddingTop: {
        marginTop: 16,
    },
});

export default withModelContext(SSLCartScreen);

const THIRD_PARTY_DELIVERY = 1;
const SELF_PICKUP = 2;
const MERCHANT_DELIVERY = 3;
const EMAIL = 4;

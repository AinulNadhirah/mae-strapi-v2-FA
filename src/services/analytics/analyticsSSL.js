import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FA_TAB_NAME,
    FA_SELECT_QUICK_ACTION,
    FA_VIEW_ITEM,
    FA_SELECT_ITEM,
    FA_ITEMS,
    FA_SELECT_PROMOTION,
    FA_FIELD_INFORMATION,
    FA_SELECT_MERCHANT,
    FA_SEARCH,
    FA_SEARCH_ITEM,
    FA_PURCHASE,
    FA_TRANSACTION_ID,
    FA_CURRENCY,
    FA_VALUE,
    FA_COUPON,
    FA_AFFILIATION,
    FA_SHIPPING_TIER,
    FA_VIEW_CART,
    FA_BEGIN_CHECKOUT,
    FA_SELECT_DROPDOWN,
    FA_APPLY_FILTER,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_ADD_FAVOURITE,
    FA_ADD_TO_CART,
    FA_SHARE,
    FA_SHIPPING,
} from "@constants/strings";
import { SSL_CART_UNABLE_ADDRESS } from "@constants/stringsSSL";

import { calculateCartAmount } from "@utils/dataModel/utilitySSL";

function wrapTryCatch(object) {
    var key, method;

    for (key in object) {
        method = object[key];
        if (typeof method === "function") {
            object[key] = (function (method, key) {
                return function () {
                    try {
                        return method.apply(this, arguments);
                    } catch (e) {
                        showErrorToast({ message: e.message });
                    }
                };
            })(method, key);
        }
    }
    return object;
}

let FAOrderDetails = {
    onScreen(orderDetail) {
        let screenName = "";
        switch (orderDetail?.orderStatus) {
            case 0:
                screenName = "SSL_OrderDetails_Cancelled";
                break;
            case 1:
                screenName = "SSL_OrderDetails_Completed";
                break;
            case 2:
                screenName = "SSL_OrderDetails_Delivering";
                break;
            default:
                screenName = "SSL_OrderDetails";
        }
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },

    orderAgain(orderDetail) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]:
                orderDetail?.orderStatus === 1
                    ? "SSL_OrderDetails_Completed"
                    : "SSL_OrderDetails_Cancelled",
            [FA_ACTION_NAME]: "Order Again",
        });
    },

    onPressCall(orderStatus) {
        let screenName = "";
        switch (orderStatus) {
            case 0:
                screenName = "SSL_OrderDetails_Cancelled";
                break;
            case 1:
                screenName = "SSL_OrderDetails_Completed";
                break;
            default:
                screenName = "SSL_OrderDetails";
        }
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: "Call Merchant",
        });
    },

    contactSupport(orderDetail) {
        let screenName = "";
        switch (orderDetail?.orderStatus) {
            case 0:
                screenName = "SSL_OrderDetails_Cancelled";
                break;
            case 1:
                screenName = "SSL_OrderDetails_Completed";
                break;
            case 2:
                screenName = "SSL_OrderDetails_Delivering";
                break;
            default:
                screenName = "SSL_OrderDetails";
        }
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: "Contact Support",
        });
    },

    onPressCancelOrder() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_OrderDetails_CancelOrder",
        });
    },

    onPressProceedCancelOrder() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_OrderDetails_CancelOrder",
            [FA_ACTION_NAME]: "Cancel Order",
        });
    },

    onPressRateOrder() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_OrderDetails_Completed",
            [FA_ACTION_NAME]: "Rate Order",
        });
    },
};
FAOrderDetails = wrapTryCatch(FAOrderDetails);

let FAShopTab = {
    onGridCategoryPressed(item) {
        logEvent(FA_SELECT_QUICK_ACTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_ACTION_NAME]: item?.title,
        });
    },
    onPromotionPressed(item) {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_FIELD_INFORMATION]: item?.title,
        });
    },
    viewAll() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_ACTION_NAME]: "View All",
        });
    },
    onPressTrackerPill() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_ACTION_NAME]: "Delivery Tracker",
        });
    },
    onMerchantPressed({ fieldInfo, item }) {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_FIELD_INFORMATION]: `${fieldInfo} ${item?.shopName}`,
        });
    },
    onPressLetUsKnow() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_ACTION_NAME]: "Set Up Shop",
        });
    },
    onScreenWebviewSetupShop() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Webview_SSL_SetUpShop",
        });
    },
};
FAShopTab = wrapTryCatch(FAShopTab);

let FAOrdersTab = {
    onPressReorder() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Orders",
            [FA_ACTION_NAME]: "Reorder",
        });
    },
};
FAOrdersTab = wrapTryCatch(FAOrdersTab);

let FAProductDetails = {
    onScreen({ merchantDetail, item, tempCount }) {
        logEvent(FA_VIEW_ITEM, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_ITEMS]: [
                {
                    item_brand: merchantDetail?.shopName,
                    item_name: item?.name,
                    item_id: item?.productId,
                    price: Number(item?.priceAmount),
                    item_category: `${merchantDetail?.sections?.[0]?.categoryId}`,
                    quantity: tempCount,
                },
            ],
            [FA_VALUE]: Number(item?.priceAmount),
            [FA_CURRENCY]: "MYR",
        });
    },
};
FAProductDetails = wrapTryCatch(FAProductDetails);

let FAPromotionsViewAllListing = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Promotion_List",
        });
    },
    handlePromoPress(item) {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: "SSL_Promotion_List",
            [FA_FIELD_INFORMATION]: item?.categoryName,
        });
    },
};
FAPromotionsViewAllListing = wrapTryCatch(FAPromotionsViewAllListing);

let FASearchScreen = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Search",
        });
    },
    onPressMerchant(merchantName) {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "SSL_Search",
            [FA_FIELD_INFORMATION]: merchantName,
        });
    },
    getSearchResult(searchString) {
        logEvent(FA_SEARCH, {
            [FA_SCREEN_NAME]: "SSL_Search",
            [FA_SEARCH_ITEM]: searchString,
        });
    },
};
FASearchScreen = wrapTryCatch(FASearchScreen);

let FACheckoutConfirmation = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Checkout",
        });
    },
};
FACheckoutConfirmation = wrapTryCatch(FACheckoutConfirmation);

let FAMerchantSearchListing = {
    onMerchantPressed(item) {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_FIELD_INFORMATION]: item?.shopName,
        });
    },
};
FAMerchantSearchListing = wrapTryCatch(FAMerchantSearchListing);

let FAMerchantListing = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
        });
    },
    onFilterPress() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_ACTION_NAME]: "Filter",
        });
    },
    onMerchantPressed(item) {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_FIELD_INFORMATION]: item?.shopName,
        });
    },
    scrollPickerOnPressDone(data) {
        logEvent(FA_SELECT_DROPDOWN, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_FIELD_INFORMATION]: data?.name,
        });
    },
    viewCart() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_ACTION_NAME]: "View Cart",
        });
    },
};
FAMerchantListing = wrapTryCatch(FAMerchantListing);

let FATabScreen = {
    onPressCart() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL",
            [FA_TAB_NAME]: "Shop",
            [FA_ACTION_NAME]: "Cart",
        });
    },
};
FATabScreen = wrapTryCatch(FATabScreen);

let FAFilterScreen = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Filter",
        });
    },
    onApplyFiltersPress(filterAnalytics) {
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: "SSL_Filter",
            ...filterAnalytics,
        });
    },
};
FAFilterScreen = wrapTryCatch(FAFilterScreen);

let FACheckoutStatus = {
    onShareReceiptTap() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_OrderPaymentSuccessful",
            [FA_ACTION_NAME]: "Share Receipt",
        });
    },
    onCheckout({
        shopName,
        promoCodeString,
        total,
        shipping,
        cartItems,
        selectedDeliveryId,
        detailsArray,
        status,
    }) {
        console.log("setAnalytics", cartItems, detailsArray);
        let shippingTier = "Deliver Now";
        switch (selectedDeliveryId) {
            case 2:
                shippingTier = "Self Pickup";
                break;
            case 4:
                shippingTier = "Email";
                break;
            default:
                // Do Nothing for empty param value
                break;
        }
        if (status === "failure") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "SSL_OrderPaymentFailed",
            });
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: "SSL_OrderPaymentFailed",
                [FA_TRANSACTION_ID]: detailsArray[0]?.value,
                [FA_SHIPPING_TIER]: shippingTier,
            });
        } else {
            logEvent(FA_PURCHASE, {
                [FA_SCREEN_NAME]: "SSL_Checkout",
                [FA_TRANSACTION_ID]: detailsArray[0]?.value,
                [FA_ITEMS]: cartItems,
                [FA_CURRENCY]: "MYR",
                [FA_VALUE]: Number(total.toFixed(2)),
                [FA_COUPON]: promoCodeString,
                [FA_AFFILIATION]: shopName,
                [FA_SHIPPING_TIER]: shippingTier, // will implement in phase 2 {Pre-Order|Scheduled Delivery|Deliver Now}
                [FA_SHIPPING]: shipping ? Number(shipping.toFixed(2)) : 0,
            });

            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "SSL_OrderPaymentSuccessful",
            });
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: "SSL_OrderPaymentSuccessful",
                [FA_TRANSACTION_ID]: detailsArray[0]?.value,
                [FA_SHIPPING_TIER]: shippingTier,
            });

            console.log("setAnalytics", selectedDeliveryId);
            // props.route.params.selectedDeliveryId === 1 // 3rd party delivery
            // props.route.params.selectedDeliveryId === 2 // self pickup
            // props.route.params.selectedDeliveryId === 3 // merchant delivery
            // props.route.params.selectedDeliveryId === 4 // voucher / email
        }
    },
};
FACheckoutStatus = wrapTryCatch(FACheckoutStatus);

let FAMerchantListingSimple = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
        });
    },
    onMerchantPressed(item) {
        logEvent(FA_SELECT_MERCHANT, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_FIELD_INFORMATION]: item?.shopName,
        });
    },
    viewCart() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Merchant_List",
            [FA_ACTION_NAME]: "View Cart",
        });
    },
};
FAMerchantListingSimple = wrapTryCatch(FAMerchantListingSimple);

let FAMerchantDetails = {
    onScreen(merchantDetail) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
        });
    },
    onApplyDeliveryOption({ merchantDetail, id }) {
        logEvent(FA_SELECT_DROPDOWN, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
            [FA_FIELD_INFORMATION]: id === 2 ? "Self-Pickup" : "Delivery",
        });
    },
    onPressProduct({ merchantDetail, item, tempCount }) {
        logEvent(FA_SELECT_ITEM, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
            [FA_ITEMS]: [
                {
                    item_brand: merchantDetail?.shopName,
                    item_name: item?.name,
                    item_id: item?.productId,
                    price: Number(item?.priceAmount),
                    quantity: tempCount,
                    item_category: `${merchantDetail?.sections?.[0]?.categoryId}`,
                },
            ],
        });
    },
    onPressPromo(merchantDetail) {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
            [FA_FIELD_INFORMATION]: merchantDetail?.pills?.promotionPills[0]?.title,
        });
    },
    onShareBtn(merchantDetail) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
        });
    },
    viewCart({ merchantDetail, cartItems, cartV1 }) {
        logEvent(FA_ADD_TO_CART, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
            [FA_ITEMS]: cartItems,
            [FA_CURRENCY]: "MYR",
            [FA_VALUE]: Number(calculateCartAmount({ cartProducts: cartV1?.cartProducts })),
        });
    },
    onPressFavourite(merchantDetail) {
        logEvent(FA_ADD_FAVOURITE, {
            [FA_SCREEN_NAME]: `SSL_Merchant_${merchantDetail?.shopName}`,
            [FA_TAB_NAME]: "Menu",
        });
    },
};
FAMerchantDetails = wrapTryCatch(FAMerchantDetails);

let FACartScreen = {
    onScreen() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SSL_Cart",
        });
    },
    hasItems({ cartItems, total }) {
        logEvent(FA_VIEW_CART, {
            [FA_SCREEN_NAME]: "SSL_Cart",
            [FA_ITEMS]: cartItems,
            [FA_CURRENCY]: "MYR",
            [FA_VALUE]: Number(total.toFixed(2)),
        });
    },
    addDeliveryFee() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart_AddDeliveryFee",
            [FA_ACTION_NAME]: "Add Delivery Fee",
        });
    },
    changeAddress(popUpTitle) {
        const screenName =
            popUpTitle === SSL_CART_UNABLE_ADDRESS
                ? "SSL_Cart_DeliveryError"
                : "SSL_Cart_AddDeliveryFee";
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: "Change Address",
        });
    },
    deliveryErrorChangeMerchant() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart_DeliveryError",
            [FA_ACTION_NAME]: "Change Merchant",
        });
    },
    deliveryErrorSelfPickup() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart_DeliveryError",
            [FA_ACTION_NAME]: "Self Pick-Up",
        });
    },
    analyticScreenName(analyticScreenName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: analyticScreenName,
        });
    },
    changeDeliveryOption() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart",
            [FA_ACTION_NAME]: "Change Delivery Option",
        });
    },
    viewMenu() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart",
            [FA_ACTION_NAME]: "View Menu",
        });
    },
    editMenu() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "SSL_Cart",
            [FA_ACTION_NAME]: "Edit Menu",
        });
    },
    onPressCheckout({ cartItems, total, promoCodeString }) {
        logEvent(FA_BEGIN_CHECKOUT, {
            [FA_SCREEN_NAME]: "SSL_Cart",
            [FA_ITEMS]: cartItems,
            [FA_CURRENCY]: "MYR",
            [FA_VALUE]: Number(total.toFixed(2)),
            [FA_COUPON]: promoCodeString,
        });
    },
};
FACartScreen = wrapTryCatch(FACartScreen);

export {
    FAMerchantDetails,
    FACartScreen,
    FAMerchantListingSimple,
    FACheckoutStatus,
    FAFilterScreen,
    FATabScreen,
    FAMerchantListing,
    FAMerchantSearchListing,
    FACheckoutConfirmation,
    FASearchScreen,
    FAPromotionsViewAllListing,
    FAProductDetails,
    FAOrdersTab,
    FAShopTab,
    FAOrderDetails,
};

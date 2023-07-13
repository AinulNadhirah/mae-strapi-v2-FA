import ApiManager from "@services/ApiManager";

import {
    METHOD_POST,
    METHOD_GET,
    TOKEN_TYPE_MAYA,
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_M2U_TRANSFER,
    METHOD_DELETE,
    METHOD_PUT,
} from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

export const postIsShownSSLOnboarding = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/isShownSSLOnboarding`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};

export const getSSLInit = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/init`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getPostLoginPrompter = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/prompter`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getSSLLetUsKnow = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/letUsKnow`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getFnBDiscoverPromotion = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/discoverPromotion`;
    const method = METHOD_GET;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        showPreloader: false,
    });
};

export const getPreLoginSSLL2 = (obj = {}) => {
    const { includePromoL2 = false } = obj;
    const data = {
        categoryLevel: "SSL_L2",
        sslIncludePromoL2: includePromoL2,
    };
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/category`;
    const method = METHOD_POST;
    return ApiManager.service({ url, data, reqType: method, showPreloader: false });
};

export const getPreLoginSSLL2PromoOnly = () => {
    const data = {
        categoryLevel: "SSL_PROMOTION",
    };
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/category`;
    const method = METHOD_POST;
    return ApiManager.service({ url, data, reqType: method, showPreloader: false });
};

export const getPreLoginSSLL3 = (obj = {}) => {
    const { L2Category = null } = obj;
    const data = {
        categoryLevel: "SSL_L3",
        sslParentIdL2: L2Category, // null || 0 - return all L3
    };
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/category`;
    const method = METHOD_POST;
    return ApiManager.service({ url, data, reqType: method, showPreloader: false });
};

export const getSSLOrderAgain = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/orderAgain`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getFavouriteLanding = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/favouriteLanding`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getFavouriteFilter = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/favouriteFilter`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getMerchantDetail = (data, isShowPreloader = false) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/postLogin/merchantDetail`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: isShowPreloader,
        promptError: false,
    });
};

export const getDeliveryCharges = (data, isShowPreloader = false) => {
    const url = `${ENDPOINT_BASE}/wallet/v1/ssl/deliveryCharges`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: isShowPreloader,
        promptError: false,
    });
};

export const createSSLOrder = (data) => {
    const url = `${ENDPOINT_BASE}/wallet/v1/ssl/createSSLOrder`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getPreviousRecipient = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/order/previous-recipient`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getPreLoginTrendingNow = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/trendingNow`;
    const method = METHOD_POST;
    // const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        showPreloader: false,
        promptError: false,
    });
};

export const getSSLOrderDetail = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/order/orderDetail`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getSSLOrderList = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/order/orderList`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const postSSLOrderCancel = (data, isShowPreloader = false) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/order/cancelOrder`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: isShowPreloader,
        promptError: false,
    });
};

export const postSSLOrderReview = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/order/orderReview`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getSSLAddress = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    // don't forget to massage the result with massageAddressFormat()
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};
export const getSSLAddressSingle = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address/${data}`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    // don't forget to massage the result with massageAddressFormat()
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getSSLAddressStates = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address/states`;
    const method = METHOD_GET;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        showPreloader: false,
        promptError: false,
    });
};

export const postSSLAddress = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address/add`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const updateSSLAddress = (data) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address/update`;
    const method = METHOD_PUT;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const deleteSSLAddress = (id) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/ssl/address/${id}`;
    const method = METHOD_DELETE;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

// Payment
export const verifySSLPayment = (data) => {
    const url = `${ENDPOINT_BASE}/wallet/v1/ssl/verifyPayment`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};
export const SSLPayment = (data) => {
    const url = `${ENDPOINT_BASE}/wallet/v2/ssl/SSLPayment`;
    // const url = `${ENDPOINT_BASE}/wallet/v1/ssl/sslDeliveryPaymentV2`;

    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};

// All preLogin APIs are not being used anymore
// export const getPreLoginInit = (data) => {
//     const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/init`;
//     const method = METHOD_GET;
//     return ApiManager.service({ url, data, reqType: method, showPreloader: false });
// };
// export const getPreLoginPrompter = (data) => {
//     const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/prompter`;
//     const method = METHOD_GET;
//     const tokenType = TOKEN_TYPE_MAYA;
//     return ApiManager.service({ url, data, reqType: method, tokenType, showPreloader: false });
// };

// export const getPreLoginMerchantDetail = (data) => {
//     const url = `${ENDPOINT_BASE}/fnb/v1/samasamalokal/preLogin/merchantDetail`;
//     const method = METHOD_POST;
//     return ApiManager.service({ url, data, reqType: method, showPreloader: false });
// };

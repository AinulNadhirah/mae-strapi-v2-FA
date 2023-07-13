import ApiManager from "@services/ApiManager";

import {
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    METHOD_POST,
    METHOD_GET,
    TIMEOUT,
    TOKEN_TYPE_M2U_TRANSFER,
    METHOD_PUT,
    METHOD_DELETE,
} from "@constants/api";
import {
    ENDPOINT_BASE_V2,
    ENDPOINT_BASE,
    WALLET_ENDPOINT_V1,
    BILLS_ENDPOINT_V2,
    GOAL_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V2,
    TRANSFER_ENDPOINT_V1,
} from "@constants/url";
import * as URL from "@constants/url";

export const getAllMomentsData = (params) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/moment/api/v1/moment/get${params}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: 10000,
        promptError: false,
        showPreloader: false,
    });

export const getOnBoardMoment = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/rule-service/api/v1/getOnBoard`,
        reqType: METHOD_GET,
        tokenType: null,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const gets2wCampaignInfo = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/campaign/v1/s2w/campaignInfo`,
        reqType: METHOD_GET,
        tokenType: null,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const updatePromosSeenCount = (contentId) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/cms/api/v1/increaseSeen/${contentId}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

// export const getDashboardPromoAndArticles = (data, query) =>
//     ApiManager.service({
//         url: `${ENDPOINT_BASE}/cms/api/v1/content/getAllSearch?${query}`,
//         data,
//         // url: `${ENDPOINT_BASE}/cms/api/v1/onBoard/content/getAll?${query}`,
//         reqType: METHOD_POST,
//         // reqType: METHOD_GET,
//         tokenType: TOKEN_TYPE_M2U,
//         timeout: TIMEOUT,
//         promptError: false,
//         showPreloader: false,
//     });

export const getSavedVouchers = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/cms/api/v1/voucher/getAll`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const requestVoucher = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/cms/api/v1/voucher`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });

export const getDashboardTabungCount = () =>
    ApiManager.service({
        url: `${GOAL_ENDPOINT_V1}/goal/exists`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const getDashboardTabungList = () =>
    ApiManager.service({
        url: `${GOAL_ENDPOINT_V1}/goal`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const getDashboardWallet = () =>
    ApiManager.service({
        url: `${WALLET_ENDPOINT_V1}/walletAccount/get`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        secondTokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });

export const getDashboardWalletBalance = (showPreloader = false) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/summary/getBalance`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        secondTokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showPreloader,
    });
export const getStatementListApi = (suburl, showPreloader) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE + suburl}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        secondTokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showPreloader,
    });

export const getCollectionsRequestWithoutData = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/user/v1/bookmark" + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const postCollectionRequestWithData = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE + "/user/v1/bookmark" + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const fundTransferInquiryAPI = async (data, loader = false) => {
    const url = TRANSFER_ENDPOINT_V2 + URL.FUND_TRANSFER_INQUIRY;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const fundTransferAPI = async (data, loader = false) => {
    const url = TRANSFER_ENDPOINT_V2 + URL.FUND_TRANSFER;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const createBillsAPI = async (data, loader = true) => {
    const url = ENDPOINT_BASE_V2 + "/bills";
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const updateBillNameAPI = async (data, loader = true) => {
    const url = ENDPOINT_BASE + "/bill/v2/bills/editName";
    const body = data;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_PUT,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const deleteBillsApi = async (suburl, loader = true) => {
    const url = ENDPOINT_BASE_V2 + suburl;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const paidBillsAPI = async (suburl, data, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 10000,
        promptError: false,
        showPreloader: loader,
    });
};

export const updateBillReceiptAPI = async (suburl, data, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = data;
    const method = METHOD_PUT;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 10000,
        promptError: false,
        showPreloader: loader,
    });
};

export const sendReminderBillAPI = async (suburl, data, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 10000,
        promptError: true,
        showPreloader: loader,
    });
};

export const splitBillAcceptAPI = async (suburl, data, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 10000,
        promptError: true,
        showPreloader: loader,
    });
};

export const splitBillRejectAPI = async (suburl, data, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 10000,
        promptError: true,
        showPreloader: loader,
    });
};

export const getOwnBillsApi = async (suburl, loader = true) => {
    const url = ENDPOINT_BASE_V2 + suburl;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const getInvitedBillsApi = async (suburl, loader = true) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const getInvitedBillsDetailsApi = async (billId, loader = true) => {
    const url = `${ENDPOINT_BASE}/${URL.SB_INVITED_BILL_DETAILS}${billId}`;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const getPastBillsAPI = async (suburl, loader = true) => {
    const url = ENDPOINT_BASE_V2 + suburl;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const getGroupsApi = async (suburl, loader = true) => {
    const url = ENDPOINT_BASE_V2 + suburl;
    const body = null;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const addGroupsAPI = async (data, loader = true) => {
    const url = ENDPOINT_BASE_V2 + "/bills/groups";
    const body = data;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const deleteGroupsAPI = async (subUrl, loader = true) => {
    const tokenType = TOKEN_TYPE_M2U;
    const url = ENDPOINT_BASE + "/" + subUrl;

    return ApiManager.service({
        url,
        data: null,
        reqType: METHOD_DELETE,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const deleteUserFromGroupAPI = async (subUrl, loader = true) => {
    const tokenType = TOKEN_TYPE_M2U;
    const url = ENDPOINT_BASE + "/" + subUrl;

    return ApiManager.service({
        url,
        data: null,
        reqType: METHOD_DELETE,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const addUserToGroupAPI = async (subUrl, params, loader = true) => {
    const tokenType = TOKEN_TYPE_M2U;
    const url = ENDPOINT_BASE + "/" + subUrl;

    return ApiManager.service({
        url,
        data: params,
        reqType: METHOD_POST,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const getBillCountApi = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const resendNotificationAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const onCallAcceptRejectAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const updateBillBackGroundAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = BILLS_ENDPOINT_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_PUT;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getPollsAndContentData = (suburl) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE + "/cms/api/v1/poll/getPollContent?" + suburl;
        console.log("Request is", url);

        ApiManager.service({
            url,
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_MAYA,
            timeout: 10000,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
                console.log("ess", respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getCardsDetailApi = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const payToCard = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;
        const url = ENDPOINT_BASE + "/" + suburl;

        console.log("Request is", url, JSON.stringify(data));
        ApiManager.service({ url, data: body, reqType: METHOD_POST, tokenType, promptError: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const duItNowRecurring = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;
        const url = TRANSFER_ENDPOINT_V1 + "/duitnow/transfer/recurring";

        // set method
        const method = METHOD_POST;

        console.log("duItNowRecurring Request is", url, JSON.stringify(data));
        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            showPreloader: false,
            promptError: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const duItNowAddToFavorite = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;
        const url = TRANSFER_ENDPOINT_V1 + "/duitnow/favorite/add";

        // set method
        const method = METHOD_POST;

        console.log("Request is", url, JSON.stringify(data));
        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            showPreloader: false,
            promptError: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const getPayees = () => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/pay/bill/payeeList";
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType, timeout: 100000 })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getPayeeDetails = async (data) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + `/payment/v1/pay/bill/payeeDetails`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getZakatPayees = async () => {
    return ApiManager.service({
        url: ENDPOINT_BASE + `/payment/v1/zakat/payeeList`,
        // data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getZakatType = async (payeeCode = null) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + `/payment/v1/zakat/payeeInquiry?payeeCode=${payeeCode}`,
        // data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getZakatFavList = async () => {
    return ApiManager.service({
        url: ENDPOINT_BASE + `/payment/v1/zakat/favList`,
        // data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

export const getFavPayees = () => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/pay/bill/favList";
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType, showPreloader: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const acctDetails = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const sendRcvMoneySaveAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const sendRcvMoneyPaidAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const sendReminderAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_PUT;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getPendingMoneyList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getPastMoneyList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getSendMoneyList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getReceivedMoneyList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

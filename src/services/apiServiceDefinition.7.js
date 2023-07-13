import ApiManager from "@services/ApiManager";
import ApiManagerSSO from "@services/ApiManagerSSO";

import {
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    TOKEN_TYPE_MDIP,
    METHOD_POST,
    METHOD_GET,
    TIMEOUT,
    TOKEN_TYPE_M2U_TRANSFER,
    METHOD_PUT,
    METHOD_DELETE,
} from "@constants/api";
import {
    ENDPOINT_BASE,
    GOAL_ENDPOINT_V1,
    PFM_ENDPOINT_V1,
    NOTIFICATIONS_ENDPOINT_V1,
    NOTIFICATIONS_ENDPOINT_V2,
    BANKING_ENDPOINT_V1,
    BANKING_ENDPOINT_V2,
    DIGITAL_WEALTH_ENDPOINT,
    DEBIT_CARD_DETAILS,
    FREEZE_UNFREEZE_REQ,
    DEBIT_CARD_REPLACE,
    SCORE_PARTY,
    OVERSEAS_FLAG_REQ,
    CVV_INQ_REQ,
    MAE_CARD_APPLICATION,
    MAE_CARD_INFO,
    MAE_PURCHASE_LIMIT,
    MAE_PURCHASE_LIMIT_UPDATE,
    DATE_PICKER_DATA,
    CC_TXN_ENDPOINT_V1,
    ENGAGE_INT,
} from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

export const getBoostersList = () => {
    const url = `${GOAL_ENDPOINT_V1}/booster`;
    const reqType = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const secure2uRegisterApi = (suburl, data) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    const reqType = METHOD_POST;

    // token type
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    //for no preloader
    // const showPreloader = false;
    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const secure2uSignTransactionApi = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE + "/" + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

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

export const secure2uChallengeApi = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE + "/" + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const pfmGetData = (suburl, showPreloader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;
        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            showPreloader: showPreloader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const pfmPostData = (suburl, body, showPreloader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;

        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url + " with body ", body);

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            showPreloader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const pfmPutData = (suburl, body, showPreloader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;

        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url + " with body " + body);

        // set method
        const method = METHOD_PUT;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: 10000,
            promptError: true,
            showPreloader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const pfmDeleteData = (suburl, body, showPreloader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;

        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url + " with body ", body);

        // set method
        const method = METHOD_DELETE;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: 10000,
            promptError: true,
            showPreloader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const pfmGetDataMaya = (suburl, showPreloader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;
        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
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
            timeout: 10000,
            promptError: true,
            showPreloader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const pfmGetDataMayaM2u = (suburl, showPreloader) => {
    // set URL
    const url = PFM_ENDPOINT_V1 + suburl;
    console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
    console.log("req is " + url);
    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 60000,
        showPreloader,
        secondTokenType,
    });
};

export const bankingGetCCTxnHistory = async (suburl, extraParams) => {
    // set URL
    const url = CC_TXN_ENDPOINT_V1 + suburl;

    // set data/body
    const body = extraParams;

    // set method
    const method = METHOD_POST;

    // token type
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
    });
};

export const bankingGetDataMayaM2u = async (
    suburl,
    showPreloader,
    promptError,
    isBankingEndV2 = false
) => {
    // set URL
    const url = isBankingEndV2 ? BANKING_ENDPOINT_V2 + suburl : BANKING_ENDPOINT_V1 + suburl;
    console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
    console.log("req is " + url);
    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 60000,
        showPreloader,
        secondTokenType,
        promptError,
    });
};

export const bankingPostDataMayaM2u = (suburl, body, showPreloader, promptError) => {
    // set URL
    const url = BANKING_ENDPOINT_V1 + suburl;
    console.log("req is " + url);

    // set method
    const method = METHOD_POST;

    // token type
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 60000,
        showPreloader,
        secondTokenType,
        promptError,
    });
};

export const getBoosterTabungsList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
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

export const goalBoosterOnAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

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

export const goalBoosterPostServiceWrapper = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const boosterDetailSpareChangeAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

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

export const getVirtualCardDetails = async (data, loader = true) => {
    const url = `${ENDPOINT_BASE}/${DEBIT_CARD_DETAILS}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const frzUnfrzReq = async (data, loader = true) => {
    const url = `${ENDPOINT_BASE}/${FREEZE_UNFREEZE_REQ}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const dbtCrdRpm = async (data) => {
    const url = `${ENDPOINT_BASE}/${DEBIT_CARD_REPLACE}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: true,
    });
};

export const getMAEPurchaseLimit = async (data) => {
    const url = `${ENDPOINT_BASE}/${MAE_PURCHASE_LIMIT}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const datePickerData = async (moduleKey) => {
    const url = `${ENDPOINT_BASE}/${DATE_PICKER_DATA}?moduleKey=${moduleKey}`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const updateMAEPurchaseLimit = async (data, loader = true) => {
    const url = `${ENDPOINT_BASE}/${MAE_PURCHASE_LIMIT_UPDATE}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const scoreParty = async (data, loader = true) => {
    const url = `${ENDPOINT_BASE}/${SCORE_PARTY}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const ovrSeasFlagReq = async (data) => {
    const url = `${ENDPOINT_BASE}/${OVERSEAS_FLAG_REQ}`;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: true,
    });
};

export const cvvEnquiryReq = async (body) => {
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${CVV_INQ_REQ}`,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const applyMAECardService = (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/mae/api/v1/debitCardApplication";
        console.log("req is " + url);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

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

export const getBoosterCategoriesAPI = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
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

export const maeCardApplication = async (data, paramUrl = MAE_CARD_APPLICATION) => {
    const url = ENDPOINT_BASE + paramUrl;
    const body = data;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getVirtualCards = async (data, loader = false) => {
    const url = ENDPOINT_BASE + MAE_CARD_INFO;
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

export const boosterDetailGuiltyPleasureAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

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

export const boosterDetailQrPaySaversAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

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

export const getBoosterDetail = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
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

export const boosterDetailFitnessAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

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

export const postTicketInit = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/init";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const generateTicket = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/generateTicket";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const notificationCenter = (path, method, handleError = false, showLoader = false) => {
    const url = NOTIFICATIONS_ENDPOINT_V2 + path;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: handleError,
        showPreloader: showLoader,
    });
};

export const notificationCenterMBPNS = (path) => {
    const url = path;
    const tokenType = TOKEN_TYPE_MDIP;

    return ApiManagerSSO.service({
        url,
        reqType: "get",
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const getEngageInitAPI = () => {
    const url = ENGAGE_INT;
    const tokenType = TOKEN_TYPE_MDIP;
    const additionalHeader = {
        channel: "MAE",
        token: "NTBNSUFTMjAyMi0wOC0xMQ==",
    };

    return ApiManagerSSO.service({
        url,
        reqType: "get",
        tokenType,
        promptError: false,
        showPreloader: false,
        additionalHeader,
    });
};

export const getNotificationById = (id, isV1) => {
    const url = `${isV1 ? NOTIFICATIONS_ENDPOINT_V1 : NOTIFICATIONS_ENDPOINT_V2}/${id}`;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType: METHOD_GET,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const postPayTicket = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/init";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const postTicketPayTicket = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/payTicket";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getDigitalWealthModule = async (suburl, showPreloader) => {
    // set URL
    const url = DIGITAL_WEALTH_ENDPOINT + suburl;

    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: 60000,
        showPreloader,
        secondTokenType,
        promptError: false,
    });
};

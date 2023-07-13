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
    STP_ENDPOINT_BASE,
    TRANSFER_ENDPOINT_V1,
    GOAL_ENDPOINT_V1,
    RPP_ENDPOINT_V1,
} from "@constants/url";
import * as URL from "@constants/url";

import * as Utility from "@utils/dataModel/utility";

import { callCloudApi } from "./ApiManagerCloud";

export const updateStatusSendRcvMoney = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_PUT;

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

export const deleteStatusSendRcvMoney = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_DELETE;

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

// export const payBillInquiry = async (data) => {
//     return new Promise((resolve) => {
//         // set URL
//         const url = WALLET_ENDPOINT_V1 + "/paybill/inquiry";
//         console.log("req is " + url, data);
//         // real api call
//         // ApiManager.service({url, data:body, reqType:method, tokenType}).then((respone) => {
//         //   resolve(respone);
//         // }).catch(error => {
//         //   reject(error);
//         // })

//         // mock call
//         resolve({
//             data: {
//                 code: 200,
//                 result: {
//                     statusCode: "0000",
//                     AcctSel: { MBB_PinlessCode: "131831936173619" },
//                 },
//             },
//         });
//     });
// };

export const payBill = async (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/pay/bill";
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType, promptError: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

///v1/pay/payeeInquiry
export const payBillInquiry = (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/pay/payeeInquiry";
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const payBillAddFav = async (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/pay/bill/addFav";
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

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

export const getBillPresentment = (data) => {
    const url = ENDPOINT_BASE + "/bill/v2/bills/getBillsTxnHistory";
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        showPreloader: true,
    });
};

export const getBillPresPDF = (data) => {
    const url = ENDPOINT_BASE + "/bill/v2/bills/getPDFDownload";
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        showPreloader: true,
    });
};

export const createWalletAndPin = (data) => {
    const url = ENDPOINT_BASE + "/v2/users/createWalletAndPin";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const registerRSA = (data) => {
    const urlPath = "/mae/ntb/api/v1/registerRSA";
    const url = ENDPOINT_BASE + urlPath;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const registerCasaRSA = (data) => {
    const urlPath = "/casa/ntb/api/v1/registerRSA";
    const url = STP_ENDPOINT_BASE + urlPath;
    const method = METHOD_POST;
    const tokenType = null;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};
export const retrieveSecurityQuestions = (data) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/securityQuestions/retrieve";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const updateSecurityQuestions = (data) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/securityQuestions/update";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const updateAddressDetails = (data) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/updateCustomerDetails";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/ntb/api/v1/productListDetails",
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const maeCustomerInquiry = (data, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        var token = TOKEN_TYPE_M2U;

        console.log("[maeCustomerInquiry] >> Token Used: " + token);

        ApiManager.service({
            url: ENDPOINT_BASE + url,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const resumeApplication = (data) => {
    return new Promise((resolve, reject) => {
        const body = data;
        var token = TOKEN_TYPE_M2U;

        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/ntb/api/v1/resumeApplication",
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const eKYCReupload = (data) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + "/mae/api/v1/reUploadImage",
        data: data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const maeCustomerInquiryETB = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/api/v1/customerInquiryETB",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_M2U,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const validateMAEInviteCode = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/ntb/api/v1/validateInviteCode",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_M2U,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getMAEMasterData = async (loader = true) => {
    const url = `${ENDPOINT_BASE}/${URL.MAE_MASTER_DATA}`;

    return ApiManager.service({
        url: url,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const getGCIFDetails = async (
    gcifUrl = URL.GCIF_DETAILS_API,
    params = null,
    loader = true
) => {
    const url = `${ENDPOINT_BASE}/${gcifUrl}`;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: params,
        reqType: METHOD_POST,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const getGCIFV2Details = async (loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${URL.MAE_CARD_GCIF_INQUIRY}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const getCardRplmFee = async (loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${URL.MAE_CARD_FEE_INQUIRY}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const requestTAC = async (data, loader, url = "mae/ntb/api/v1/requestTAC") => {
    const urlPath = `${ENDPOINT_BASE}/${url}`;
    const body = data;
    const token = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: urlPath,
        data: body,
        reqType: METHOD_POST,
        tokenType: token,
        promptError: true,
        showPreloader: true,
    });
};

export const maeCreateAccount = (data, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        var token = TOKEN_TYPE_M2U;
        // var urlPath = "mae/ntb/api/v1/createAccount";

        ApiManager.service({
            url: `${ENDPOINT_BASE}/${url}`,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const maeRegisterM2UCASA = (data, loader = true) => {
    const body = data;
    return ApiManager.service({
        url: STP_ENDPOINT_BASE + "/casa/ntb/api/v1/registerUser",
        data: body,
        reqType: METHOD_POST,
        promptError: true,
        showPreloader: loader,
    });
};

export const maeRegisterM2UZestI = (data, loader = true) => {
    const body = data;
    return ApiManager.service({
        url: ENDPOINT_BASE + "/mae/openaccount/api/v1/registerUser",
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: loader,
    });
};

export const maeRegisterM2U = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/ntb/api/v1/registerUser",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const uCodeServiceReq = async (data, loader = true) => {
    const body = data;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${URL.UCODE_SERVICE_REQ}`,
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const getChipMasterData = async (data, loader = true) => {
    const body = data;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${URL.CHIP_MASTER_DATA}`,
        data: body,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const chipValidate = async (data) => {
    const body = data;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${URL.SET_PIN_REQ}`,
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });
};

export const maeSecurityImgPhrase = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/mae/ntb/api/v1/updateImage",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const callMergeFpxPanList = (data, loader, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const token = TOKEN_TYPE_M2U;
        const urlPath = Utility.isEmpty(url) ? "/funding/v1/funding/callMergeFpxPanList" : url;

        ApiManager.service({
            url: ENDPOINT_BASE + urlPath,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getClientToken = async ({ body, headers, url }) => {
    const urlPath = Utility.isEmpty(url) ? "/api/oauth2/v4/clientcred/token" : url;
    const baseUrl = body.environment === "U" ? URL.MGATE_CALL_UAT : URL.MGATE_CALL_PROD;
    const uri = baseUrl + urlPath;

    const reqParams = JSON.stringify({
        grant_type: body?.grantType,
        scope: body?.scope,
        client_id: body?.clientId,
        client_secret: body?.clientSecret,
    });

    const response = await callCloudApi({
        uri,
        headers: headers,
        method: "POST",
        body: reqParams,
    });

    return { data: response };
};

export const callGenerateToken = (data, loader = true, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const token = TOKEN_TYPE_M2U;
        const urlPath = Utility.isEmpty(url) ? "/funding/v1/funding/generate/token" : url;

        ApiManager.service({
            url: ENDPOINT_BASE + urlPath,
            data: body,
            reqType: METHOD_GET,
            tokenType: token,
            showPreloader: loader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const prepareARMessage = (data, loader, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const token = TOKEN_TYPE_M2U;
        const urlPath = Utility.isEmpty(url) ? "/funding/v1/funding/prepareARMessage" : url;

        ApiManager.service({
            url: ENDPOINT_BASE + urlPath,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const prepareAEMessage = (data, loader, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const token = TOKEN_TYPE_M2U;
        const urlPath = Utility.isEmpty(url) ? "/funding/v1/funding/prepareAEMessage" : url;

        ApiManager.service({
            url: ENDPOINT_BASE + urlPath,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getTxn3DMessage = async (data, loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/funding/v1/funding/getTxn3DMessage`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: loader,
    });
};

export const getBPGTxnInqService = async (data, loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/funding/v1/funding/getBPGTxnInqService`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: loader,
    });
};

export const getBPGTxnService = async (data, loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/funding/v1/funding/getBPGTxnService`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: loader,
    });
};

export const removePanList = (data, loader, url) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const token = TOKEN_TYPE_M2U;
        const urlPath = Utility.isEmpty(url) ? "funding/v1/funding/removePan" : url;

        ApiManager.service({
            url: `${ENDPOINT_BASE}/${urlPath}`,
            data: body,
            reqType: METHOD_POST,
            tokenType: token,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const etbFunding = async (data, loader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/funding/v1/funding/etbFunding`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: loader,
    });
};

export const getGoalsList = (suburl) => {
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

export const getPendingGoalsList = (suburl) => {
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

export const payJompay = async (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/jompay/jompayPayment";
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType, promptError: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const payLoan = async (data) => {
    const url = ENDPOINT_BASE + "/payment/v1/pay/loan";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const loanDetails = async (loanNumber, loader = false) => {
    const subUrl = `banking/v1/details/loan?acctNo=${loanNumber}`;
    const url = ENDPOINT_BASE + "/" + subUrl;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    const data = null;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const invokeL2 = async (loader = true) => {
    const url = ENDPOINT_BASE + "/stepUp/L2";
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const invokeL3 = async (loader = true) => {
    const url = ENDPOINT_BASE + "/stepUp/L3";
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: loader,
    });
};

export const addJompayFav = async (data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/jompay/addFavourite";
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

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

// *
export const getFavJompay = () => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/jompay/favorite/inqury";
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

export const inquiryJompayQr = async (data) => {
    console.log("inquiryJompayQr");
    // set URL
    const url = ENDPOINT_BASE + "/payment/v1/jompay/jompayQRInquiry";
    console.log("req is " + url);
    // set data/body
    const body = data;
    // set method
    const method = METHOD_POST;
    // token type
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
    });
};

export const inquiryJompay = async (data) => {
    console.log("inquiryJompay");
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/jompay/inquiry";
        console.log("req is " + url);
        // set data/body
        const body = data;

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const requestTACDelete = async (data, url = "2fa/v1/tac") => {
    const urlPath = `${ENDPOINT_BASE}/${url}`;
    const body = data;
    const token = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: urlPath,
        data: body,
        reqType: METHOD_POST,
        tokenType: token,
        promptError: true,
        showPreloader: true,
    });
};

export const rtpStatus = () => {
    const subUrl = "merchant/inquiry";
    const url = RPP_ENDPOINT_V1 + "/" + subUrl;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    const data = {};

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

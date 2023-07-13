import ApiManager from "@services/ApiManager";

import { TOKEN_TYPE_MAYA, METHOD_POST, TOKEN_TYPE_M2U } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

export const initeKYCAPI = (loader, body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v1/ekyc/eKYCInit`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, data: body, reqType: method, tokenType });
};

export const eKYCCOMMITAPI = (loader, body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v1/ekyc/eKYCommit`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, data: body, reqType: method, tokenType });
};

export const eKYCOCRAPI = (loader, body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v1/ekyc/eKYCOCR`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data: body, reqType: method, tokenType });
};

export const eKYCGetResultAPI = (loader, body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v1/ekyc/eKYCGetResult`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data: body, reqType: method, tokenType });
};

export const initeKYCV2API = (body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v3/ekyc/eKYCInit`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, data: body, reqType: method, tokenType });
};

export const eKYCCheckResult = (body) => {
    const url = `${ENDPOINT_BASE}/mae/ntb/api/v3/ekyc/eKYCCheckResult`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const eKYCGetResultUpdateZestAPI = (body) => {
    const url = `${ENDPOINT_BASE}/mae/openaccount/api/v1/createEKYCRecord`;
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

/** eKYC End */

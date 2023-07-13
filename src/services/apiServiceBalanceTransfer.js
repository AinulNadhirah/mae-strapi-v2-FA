import { METHOD_POST, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const BTInquiry = async (body, subUrl) => {
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${subUrl}`,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const BTCalculatePayment = async (body, subUrl) => {
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${subUrl}`,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const BTPayment = async (body, subUrl) => {
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${subUrl}`,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

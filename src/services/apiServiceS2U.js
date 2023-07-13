/**
 * API definition for Secure2U services
 */
import {
    METHOD_POST,
    TIMEOUT,
    TOKEN_TYPE_M2U_TRANSFER,
    TOKEN_TYPE_M2U,
    METHOD_GET,
} from "@constants/api";
import { S2U_ENDPOINT_V2, S2U_ENDPOINT_V3 } from "@constants/url";

import ApiManager from "./ApiManager";

export const secure2uCheckVerification = (suburl, data) => {
    const url = S2U_ENDPOINT_V2 + suburl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const secure2uPendingChallengeApi = (suburl, isS2uV4Flag) => {
    const endPoint = isS2uV4Flag ? S2U_ENDPOINT_V3 : S2U_ENDPOINT_V2;
    const url = endPoint + suburl;
    const body = null;
    const method = "get";
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const unregisterM2U = () => {
    const url = `${S2U_ENDPOINT_V2}/secure2u/deRegister`;
    const data = JSON.stringify({ app_id: "M2U" });
    return ApiManager.service({
        url,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const syncOsId = (cipher_text, device_nonce) => {
    const url = `${S2U_ENDPOINT_V2}/secure2u/syncOsId`;
    const data = JSON.stringify({ cipher_text, device_nonce });
    return ApiManager.service({
        url,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

/**
 * API definition for BAKONG services
 */
import { METHOD_GET, METHOD_POST, TIMEOUT, TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
import { BAKONG_ENDPOINT } from "@constants/url";

import ApiManager from "./ApiManager";

export const bakongTransferAPI = (suburl, data) => {
    const url = BAKONG_ENDPOINT + suburl;
    console.log("req is " + url);
    // set data/body
    const body = data;

    // set method
    const method = METHOD_POST;

    // token type
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getBakongFavoriteList = () => {
    const url = `${BAKONG_ENDPOINT}/payment/favorites`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

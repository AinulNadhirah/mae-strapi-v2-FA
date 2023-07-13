import ApiManager from "@services/ApiManager";

import { METHOD_POST, METHOD_GET, TIMEOUT, TOKEN_TYPE_M2U_TRANSFER } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

export const validateATMQR = async (data) => {
    console.log("validateATMQR");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/verifyContactlessWithdrawalQR";
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

export const getMobileInfo = async (data = null) => {
    console.log("getMobileInfo");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/getMobileNo";
    console.log("req is " + url);
    // set method
    const method = METHOD_GET;
    // token type
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
    });
};

export const atmWithdrawal = async (data) => {
    console.log("atmWithdrawal");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/processContactlessWithdrawal";
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

export const cancelOrTimeoutRequest = async (data) => {
    console.log("cancelOrTimeoutRequest");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/cancelContactlessWithdrawal";
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

export const checkAtmOnboarding = async (showPreloader) => {
    console.log("checkAtmOnboarding");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/verify";
    console.log("req is " + url);
    // set data/body
    const body = null;
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
        showPreloader: showPreloader,
    });
};

export const combinedATMActions = async (data) => {
    console.log("combinedATMActions");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/action";
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

export const confirmWithdrawal = async (data) => {
    console.log("confirmWithdrawal");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/confirmWithdrawal";
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

export const performWithdrawal = async (data) => {
    console.log("confirmWithdrawal");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/performWithdrawal";
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

export const receiptFromPnsMsg = async (refId) => {
    console.log("receiptFromPnsMsg");
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/pns/receipt?trxRefNo=" + refId;
    console.log("req is " + url);
    // set data/body
    const body = null;
    // set method
    const method = METHOD_GET;
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

export const ccwAction = async (data, subUrl, method = METHOD_POST, showPreloader) => {
    console.log(`ccwAction >> ${subUrl}`);
    // set URL
    const url = ENDPOINT_BASE + "/atm/v1/qrContactlessWithdrawal/" + subUrl;
    console.log("req is " + url);
    // set data/body
    const body = data;
    // token type
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showPreloader,
    });
};

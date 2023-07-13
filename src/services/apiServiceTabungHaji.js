/**
 * API definition for TABUNGHAJI services
 */
import { TOKEN_TYPE_M2U, METHOD_POST, METHOD_GET } from "@constants/api";
import { TRANSFER_ENDPOINT_V1, TRANSFER_ENDPOINT_V2 } from "@constants/url";

import ApiManager from "./ApiManager";

export const getTabungHajiAccounts = () => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/inquiry`,
        // data: data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });
};

export const getTabungHajiFavoriteList = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/favorite/list`,
        data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: false,
    });
};

export const validateMaybankAccount = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V2}/fundTransfer/inquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });
};

export const validateTabungHajiAccount = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/accountInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });
};

export const addFavouriteTabungHajiAccount = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/favorite/action`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

export const transferFundToTabungHaji = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/transfer`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

export const checkTHDownTime = () => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/flag`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

export const balanceInquiryTabungHaji = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/balanceInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

export const getTabungHajiTransactionHistory = (data) => {
    return ApiManager.service({
        url: `${TRANSFER_ENDPOINT_V1}/th/statement`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
    });
};

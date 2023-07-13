import {
    METHOD_DELETE,
    METHOD_GET,
    METHOD_POST,
    METHOD_PUT,
    TIMEOUT,
    TOKEN_TYPE_M2U,
} from "@constants/api";
import { PFM_ENDPOINT_V1 } from "@constants/url";

import ApiManager from "./ApiManager";

export const getExpensesCategories = () => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/all`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const createTransactionSubCategories = (data) => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/add`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
    });
};

export const updateTransactionSubCategories = (data) => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/update`;
    const method = METHOD_PUT;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
    });
};

export const deleteTransactionSubCategories = (id) => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/delete?btsId=${id}`;
    const method = METHOD_DELETE;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
    });
};

export const updatePFMTransaction = (data, showPreloader) => {
    const url = `${PFM_ENDPOINT_V1}/pfm/transaction/edit`;
    const method = METHOD_PUT;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: showPreloader ?? true,
    });
};

export const createPFMTransaction = (data) => {
    const url = `${PFM_ENDPOINT_V1}/pfm/transaction/add`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
    });
};

export const getSubCategoriesIcons = () => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/allIcons`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        showPreloader: false,
    });
};

export const deletePFMTransaction = (transactionId) => {
    return ApiManager.service({
        url: `${PFM_ENDPOINT_V1}/pfm/transaction/delete?btsId=${transactionId}`,
        reqType: METHOD_DELETE,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        showPreloader: true,
    });
};

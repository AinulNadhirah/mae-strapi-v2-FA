import { METHOD_GET, METHOD_POST, TOKEN_TYPE_M2U, TOKEN_TYPE_M2U_TRANSFER } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const getFDPlacementType = (data) => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/getFDPlacementType`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getFDPlacementDetails = (data) => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/getFDPlacementTenureDetails`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
    });
};

export const getFDRiskScoring = (data) => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/fdRiskScoring`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getFDPlacementMinMaxAmount = (data) => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/getMinMaxAmt`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const executeFDPlacement = (data) => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/executeFDPlacement`;
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

export const getJointFDProductCode = () => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/jointFDProdCode`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getFDProductCodes = () => {
    const url = `${ENDPOINT_BASE}/banking/v1/fd/productCodes`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

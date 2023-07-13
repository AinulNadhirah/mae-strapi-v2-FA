import { METHOD_POST, METHOD_GET, TIMEOUT, TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const cardsInquiryGET = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsInquiry = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";
    const reqTyp = isEtb ? METHOD_POST : METHOD_GET;
    console.log(reqTyp);
    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: reqTyp,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const customerInquiry = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsVerify = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsUpdate = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsResume = async (body, subUrl, isEtb) => {
    const tokenType = isEtb ? TOKEN_TYPE_M2U : "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_GET,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
    });
};

export const cardsResumeId = async (body, subUrl) => {
    const tokenType = "PRELOGIN";

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const cardsUploadDoc = (body, subUrl, isMultipart = true) => {
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        secondTokenType,
        isMultipart,
    });
};

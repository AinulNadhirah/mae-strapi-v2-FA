import { METHOD_GET, METHOD_POST, TOKEN_TYPE_MAYA } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const checkZakatEligibilityRegistration = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/customerEligibility`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const fetchZakatDebitAccts = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/zakatDropDown`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const registerForZakatDebit = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/zakat/register`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const updatePhoneNumberAPI = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/zakat/updateContactNo`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const checkzakatDownTimeAPI = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/downtime`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const checkzakatBodyDownTimeAPI = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/zakatbody/downtime`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const fetchZakatDetailsAPI = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/fetchZakatDetails`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const updateZakatBodyAPI = async (data, showPreloader = true) => {
    //mobileNo | zakatBody
    const url = `${ENDPOINT_BASE}/zakat/updateZakatBody`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const updateZakatAccountAPI = async (data, showPreloader = true) => {
    //mobileNo | zakatBody
    const url = `${ENDPOINT_BASE}/zakat/updateZakatAccount`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const cancelAutoDebitAPI = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/zakat/cancelAutoDebit`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const checkzakatCutOffTimeAPI = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/cutofftime`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const fetchzakatCalculationDetailsAPI = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/zakat/introPageDetails`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

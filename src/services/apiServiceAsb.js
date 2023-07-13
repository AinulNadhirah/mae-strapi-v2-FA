import ApiManager from "@services/ApiManager";

import { METHOD_POST, METHOD_GET, TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
import {
    ASB_BECOME_A_GUARATNOR_URL,
    ASB_DECLINE_BECOME_A_GUARATNOR_URL,
    ASB_MASTER_DATA_URL,
    ASB_SEND_NOTIFICATION_URL,
    ASB_UPDATE_CEP_URL,
    ENDPOINT_BASE,
    S2U_ENDPOINT_V1,
    ASB_CONSENT_URL,
    ASB_UPDATE_CONSENT_URL,
    ASB_CALCULATE_PREMIUM_URL,
    ASB_DOWNLOAD_DOC_URL,
    ASB_SAVEINPUT_DATA_CEPDB_URL,
    ASB_APPLICATION_DETAILS_URL,
    ASB_RESUME_APPLICATION_URL,
    ASB_SCOREPARTY_URL,
    ASB_PRODUCT_DESC_URL,
    ASB_SUBMIT_APPLICATION_URL,
    ASB_TAC_REQUEST_URL,
    ASB_ACCEPTANCE_URL,
    ASB_CHECK_OPERATION_TIME_URL,
    TAC,
    ASB_APPLICATION_WITH_TAC_URL,
    TAC_VALIDATE,
    ASB_UPLOAD_URL,
    ASB_ELIGIBILITY_CHECK_URL,
    ASB_CHECK_ELIGIBILITY_URL,
    ASB_UPDATE_APPLICATION_STATUS_URL,
    ASB_DOWNLOAD_DOC_URL_DOCUMENT_LISTING,
} from "@constants/url";

export const getMasterDataService = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_MASTER_DATA_URL}`,
        reqType: METHOD_GET,
        promptError: true,
        showPreloader,
    });
};

export const getPrePostQualService = (endpoint, data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${endpoint}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const checkConsent = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_CONSENT_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const updateConsent = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_UPDATE_CONSENT_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const calculateProfitEarningPremium = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_CALCULATE_PREMIUM_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
    });
};

export const viewPartyDownload = async (data, showPreloader = false, promptError = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_DOWNLOAD_DOC_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        tokenType: TOKEN_TYPE_M2U,
        promptError,
    });
};

export const updateApi = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_SAVEINPUT_DATA_CEPDB_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
        promptError: true,
    });
};

export const updateApiCEP = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_UPDATE_CEP_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const applicationDetailsApi = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_APPLICATION_DETAILS_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        showPreloader,
        isMultipart: false,
        promptError: true,
    });
};

export const applicationDetailsGetApi = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_RESUME_APPLICATION_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        showPreloader,
        isMultipart: false,
        promptError: true,
    });
};

export const scorePartyApi = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_SCOREPARTY_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};
export const getProductDesc = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_PRODUCT_DESC_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
        isMultipart: false,
        promptError: true,
    });
};

export const applicationSubmitApi = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_SUBMIT_APPLICATION_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const tacRequestApi = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_TAC_REQUEST_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const asbPrePostQualGuarantorService = (endpoint, data, needCallbackInExcaption) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${endpoint}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: needCallbackInExcaption ? false : true,
        showPreloader: true,
    });

export const asbSendNotificationService = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_SEND_NOTIFICATION_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const asbligibilityCheckService = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_ELIGIBILITY_CHECK_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const applicationAcceptanceApi = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_ACCEPTANCE_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });
};

export const checkDownTime = async () => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_CHECK_OPERATION_TIME_URL}`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });
};

export const asbBecomeAGuarantorService = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_BECOME_A_GUARATNOR_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const asbDeclineBecomeAGuarantorService = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_DECLINE_BECOME_A_GUARATNOR_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const asbRequestTac = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${S2U_ENDPOINT_V1}/${TAC}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        isMultipart: false,
        tokenType: TOKEN_TYPE_M2U,
    });
};
export const submitApplicationWithTAC = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_APPLICATION_WITH_TAC_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const verifyApplicationWithTAC = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${S2U_ENDPOINT_V1}/${TAC_VALIDATE}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getdocumentUploadURL = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_UPLOAD_URL}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const asbCheckEligibilityService = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_CHECK_ELIGIBILITY_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });
};

export const asbDocumentUpload = async (data, url) => {
    return ApiManager.service({
        url: `${url}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        isMultipart: true,
        showPreloader: true,
    });
};

export const asbUpdateApplicationStatus = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_UPDATE_APPLICATION_STATUS_URL}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });
};
export const asbDocumentListing = async (data, showPreloader = false, promptError = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${ASB_DOWNLOAD_DOC_URL_DOCUMENT_LISTING}`,
        data,
        reqType: METHOD_POST,
        showPreloader,
        tokenType: TOKEN_TYPE_M2U,
        promptError,
    });
};

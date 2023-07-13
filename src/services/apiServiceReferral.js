import ApiManager from "@services/ApiManager";

import { METHOD_GET, METHOD_POST, TOKEN_TYPE_M2U } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

export const getInviteCode = (): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/referral`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({ url, reqType: method, tokenType, promptError: false });
};

export const createReferral = (data: Object): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/referral`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};

export const validateCode = (data: Object): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/referral/validateInviteCode`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};

export const getReferralCount = (): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/referral/referred/count`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({ url, reqType: method, tokenType, promptError: false });
};
export const validateSignUpCode = (data: Object): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/signupCampaign/validateSignUpCode`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};
export const getSignupDetailsForUser = (): Promise => {
    const url = `${ENDPOINT_BASE}/campaign/v1/signupCampaign`;
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

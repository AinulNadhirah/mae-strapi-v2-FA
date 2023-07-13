import ApiManager from "@services/ApiManager";

import { CONTENT_TYPE_URLENCODED, TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA } from "@constants/api";
import { ENDPOINT_BASE, METHOD_POST } from "@constants/url";

export const checkChancesOnS2WWidget = () => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/widget`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const checkHomeStatus = () => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/home.php`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        contentType: CONTENT_TYPE_URLENCODED,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

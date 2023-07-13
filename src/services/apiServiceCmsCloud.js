import ApiManager from "@services/ApiManager";

import { TOKEN_TYPE_MAYA, METHOD_POST, METHOD_GET, TIMEOUT } from "@constants/api";

export const getAllCountdownBanners = (endpoint) => {
    return ApiManager.service({
        url: endpoint + "/countDowns/one",
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getPromosByTag = (
    endpoint,
    term,
    page,
    size,
    query,
    operand,
    token,
    tag,
    articleMode
) => {
    const url = endpoint + "/content/getAllSearch?page=" + page + "&size=" + size + query;
    let tagArray = articleMode ? ["ARTICLES", "ARTICLES_DB"] : ["PROMOTIONS", "PROMODEALS_DB"];
    if (tag) {
        tagArray.push(tag);
    }

    const body = {
        auth: token ? `bearer ${token}` : null,
        publish: true,
        tagSearch: {
            operand: operand,
            tags: tagArray,
        },
        term: term,
    };

    return ApiManager.service({
        url: url,
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getPromosByFilter = (
    endpoint,
    term,
    page,
    size,
    query,
    operand,
    token,
    tag,
    articleMode
) => {
    const url = endpoint + "/content/getAllSearch?page=" + page + "&size=" + size + query;
    let tagArray = articleMode ? ["ARTICLES"] : ["PROMOTIONS"];
    if (tag) {
        tagArray.push(tag);
    }

    const body = {
        auth: token ? `bearer ${token}` : null,
        publish: true,
        tagSearch: {
            operand: operand,
            tags: tagArray,
        },
        term: term,
    };
    return ApiManager.service({
        url: url,
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getFeaturedPromosByTag = (endpoint, term, page, size, operand, token, articleMode) => {
    const url = endpoint + "/content/getAllSearch?page=" + page + "&size=" + size;
    const body = {
        auth: token ? `bearer ${token}` : null,
        publish: true,
        tagSearch: {
            operand: operand,
            tags: articleMode
                ? ["ARTICLES", "ARTICLES_EXPLORE"]
                : ["PROMOTIONS", "PROMODEALS_EXPLORE"],
        },
        term: term,
    };
    return ApiManager.service({
        url: url,
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        timeout: TIMEOUT,
        showPreloader: false,
        promptError: false,
    });
};

export const getTagsByRouting = (endpoint, loader, routing) => {
    const url = endpoint + "/tag/getAllWithDetails?routing=" + routing;
    return ApiManager.service({
        url: url,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: loader,
    });
};

export const getDashboardPromoAndArticles = (endpoint, data, query) => {
    const url = endpoint + `/content/getAllSearch?${query}`;
    return ApiManager.service({
        url: url,
        data: data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
        promptError: false,
    });
};

export const getHomeDetailScreenData = (endpoint, contentId) => {
    const url = endpoint + `/content/${contentId}`;
    return ApiManager.service({
        url: url,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
    });
};

export const LikeHomeContent = (endpoint, contentId, showLoader = true) => {
    const url = endpoint + `/likeContent?contentId=${contentId}`;
    return ApiManager.service({
        url: url,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: showLoader,
    });
};

export const disLikeHomeContent = (endpoint, contentId, showLoader = true) => {
    const url = endpoint + `/dislikeContent?contentId=${contentId}`;
    return ApiManager.service({
        url: url,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: showLoader,
    });
};

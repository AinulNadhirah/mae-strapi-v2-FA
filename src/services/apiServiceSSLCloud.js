import { callCloudApi } from "@services/ApiManagerCloud";

/**
 * Cloud service is under Visva & Nazerin. It contain a snapshot of our QRMS database
 * Cloud service is hosted under AWS and is scalabl unlike our QRMS system
 * We try to transition any non user id specific API to Cloud instead of MayaBE -> QRMS
 */

// Search
export const SSLSearch = async ({
    sandboxUrl,
    searchString,
    categoryId,
    latLong,
    start,
    rows,
    menuType,
}) => {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const uri =
        `${sandboxUrl}/v2/search?` + // Cloud
        new URLSearchParams({
            q: encodeURIComponent(searchString),
            start,
            ...(rows && { rows }),
            ...(latLong && { loc: latLong }),
            ...(categoryId && { categoryId }),
            ...(menuType && { menuType }),
        });

    return callCloudApi({ uri, method: "GET", headers });
};

// Search autosuggest
export const SSLSearchSuggestion = async ({ sandboxUrl, searchString }) => {
    const uri =
        `${sandboxUrl}/v1/suggest?` +
        new URLSearchParams({
            q: encodeURIComponent(searchString),
        });

    return callCloudApi({ uri, method: "GET" });
};

// Search 5 trending keyword
export const SSLSearchGetTrending = async ({ sandboxUrl }) => {
    const uri = `${sandboxUrl}/v1/trending`;

    return callCloudApi({ uri, method: "GET" });
};

export const SSLFavouritesNearMe = async ({ sandboxUrl, body }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl}/v1/favouriteNearYou`;

    return callCloudApi({ uri, headers, method: "POST", body: JSON.stringify(body) });
};

export const SSLMerchantFilter = async ({ sandboxUrl, body }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl}/v1/merchantFilter`;

    return callCloudApi({ uri, headers, method: "POST", body: JSON.stringify(body) });
};

export const SSLMerchantFilterV2 = async ({ sandboxUrl, token, body }) => {
    const headers = { "content-type": "application/json" };
    if (token) headers.authorization = `bearer ${token}`; // this api works without token
    const uri = `${sandboxUrl}/v2/merchantFilter`;

    return callCloudApi({ uri, headers, method: "POST", body: JSON.stringify(body) });
};

export const getSSLMerchantDetailsV2 = async ({ sandboxUrl, token, body }) => {
    const headers = { "content-type": "application/json" };
    if (token) headers.authorization = `bearer ${token}`; // this api works without token
    const uri = `${sandboxUrl}/v2/merchantDetail`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    // manually inject data to match existing Mae backend's response format
    return { data: response };
};

export const sslMerchantAddFav = async ({ sandboxUrl, token, body }) => {
    const headers = { "content-type": "application/json", authorization: `bearer ${token}` };
    const uri = `${sandboxUrl}/v2/addFavourite`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    return response;
};

export const sslMerchantDelFav = async ({ sandboxUrl, token, body }) => {
    const headers = { "content-type": "application/json", authorization: `bearer ${token}` };
    const uri = `${sandboxUrl}/v2/deleteFavourite`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    return response;
};

export const getSSLProductDetailsV2 = async ({ sandboxUrl, body }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl}/v2/productDetail`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    return { data: response };
};

export const getMerchantByChainId = async ({ sandboxUrl, chainId, latitude, longitude }) => {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const uri = `${sandboxUrl}/v2/chainMerchantDetail`;
    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify({ chainId, latitude, longitude }),
    });
    return { data: response };
};

// Trending now
export const getTrendingNow = async ({ sandboxUrl, body }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl}/v2/trendingNow`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    return { data: response };
};

// FnB related API
export const getFnBFilterParam = async ({ sandboxUrl }) => {
    //config API pass as https://search-staging.maybanksandbox.com/samasamalokal .Either to ask them remove samasamalokal or we remove ourself
    const uri = `${sandboxUrl.replace("samasamalokal", "")}fnb/v1/merchants/features`;

    return callCloudApi({ uri, method: "GET" });
};

export const getAllFnBMerchantsCloud = async ({ sandboxUrl, params }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl.replace("samasamalokal", "")}fnb/v2/merchants/getMerchants`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(params),
    });
    return { data: response };
};

export const getFnbMerchantDetailsCloud = async ({ sandboxUrl, params }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl.replace("samasamalokal", "")}fnb/v2/merchants/merchantDetails`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(params),
    });
    return { data: response };
};

export const getFnBMerchantsSearch = async ({ sandboxUrl, params, page }) => {
    const headers = { "content-type": "application/json" };
    const uri = `${sandboxUrl.replace(
        "samasamalokal",
        ""
    )}fnb/v2/merchants/search?pageName=Discover&pageSize=20&page=${page}`;

    const response = await callCloudApi({
        uri,
        headers,
        method: "POST",
        body: JSON.stringify(params),
    });
    return { data: response };
};
// FnB related API end

import ApiManager from "@services/ApiManager";
import { callDPApi } from "@services/ApiManagerDataPower";

import { METHOD_POST, METHOD_GET, TOKEN_TYPE_MAYA } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

// DataPower mainly to facilitate communication between MAE FE and non maya backend (in this case QRMS & Delyva)

/**
 * A JWT token to communicate to outside services. (Not to be confused with SSLCloud, backend should name it DPToken)
 * Pass in Maya token, and Maya BE will return a "Cloud" token without sensitive data.
 * We use the Cloud token to authenticate & communicate with DataPower
 */
export const getMbbCloudTokenByMayaToken = (data) => {
    const url = `${ENDPOINT_BASE}/oauth/v1/thirdparty/generateMbbCloudTokenByKey`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        withSecondaryToken: true, // Omid requested to pass token here, because existing authorization header is reserved
        showPreloader: false,
    });
};

/**
 * QRMS categoryL2, categoryL2Promo, prompter
 * These 3 APIs are mostly static values,
 * Values are cached at DataPower side to improve performance
 */
export const getDPApi = async ({ url }) => {
    let response = await callDPApi({
        getMbbCloudTokenByMayaToken,
        url,
        method: "GET",
    });
    console.log("prompter in apiServiceCloudDP", response);
    response = await response.json();
    return response;
};

/**
 * Delyva location search by string
 * @param {String} locationString search string
 * @param {String} latLong 3.124,1.235
 * @returns {Array} list of matching addresses
 */
export const GeocoderPlaces = async ({ geolocationUrl, locationString, latLong }) => {
    const url =
        `${geolocationUrl}/partner/v2/delyva/geocoder/places?` +
        new URLSearchParams({
            companyId: "b12b9045-82f9-40f6-9a87-cdf9bb25f281",
            q: encodeURIComponent(locationString),
            ...(latLong && { at: `${latLong}` }), // API expects coordinate as string
        });
    const method = METHOD_GET;
    let response = await callDPApi({
        getMbbCloudTokenByMayaToken,
        url,
        method,
    });
    response = await response.json();
    console.log("GeocoderPlaces in apiServiceSSL", response);
    return response;
};

/**
 * Delyva get current location by coordinate
 * @param {Object} body {lat:3.2123, long:1.123}
 * @returns {Object} one address object
 */
export const GeocoderAddress = async ({ geolocationUrl, body }) => {
    const url = `${geolocationUrl}/partner/v2/delyva/address`;
    const method = METHOD_POST;
    function toString(o) {
        Object.keys(o).forEach((k) => {
            if (typeof o[k] === "object") {
                return toString(o[k]);
            }
            o[k] = "" + o[k];
        });
        return o;
    }
    let stringBody = {
        coord: body,
    };
    stringBody = toString(stringBody); // API expects coordinate as string

    let response = await callDPApi({
        getMbbCloudTokenByMayaToken,
        url,
        method,
        body: stringBody,
    });
    console.log("GeocoderAddress in apiServiceSSL", response);
    response = await response.json();
    return response;
};

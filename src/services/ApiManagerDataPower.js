/* eslint-disable no-useless-catch */
import AsyncStorage from "@react-native-community/async-storage";
import DeviceInfo from "react-native-device-info";

export async function callDPApi({ getMbbCloudTokenByMayaToken, url, method, body }) {
    // 2.1 API to retrieve token
    async function refreshMbbCloudToken() {
        let headerToken;
        try {
            const mayaResponse = await getMbbCloudTokenByMayaToken();
            headerToken = mayaResponse?.data?.access_token;
        } catch (e) {
            // Error logging for MbbCloudToken API here
            throw e;
        }
        await AsyncStorage.setItem("MbbCloudToken", headerToken);
        return headerToken;
    }

    // 1. Get locally stored authorisation token "Cloud Token"
    let MbbCloudToken = await AsyncStorage.getItem("MbbCloudToken");
    if (!MbbCloudToken) MbbCloudToken = await refreshMbbCloudToken();

    const headers = {
        "X-MB-API-KEY": "f9eb8faec6f44445bb9d625800e2ada9", // static, hardcoded API KEY
        "X-MB-E2E-ID": `${DeviceInfo.getUniqueId()}`, // unique ID just for tracking purposes, can pass device UID
        "X-MB-Timestamp": `${Date.now()}`,
        "X-MB-SignedHeaders": MbbCloudToken,
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    // 3. Call DP API
    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            ...(body && { body: JSON.stringify(body) }),
        });
    } catch (e) {
        // Error logging for DP API here
        throw e;
    }

    if (response?.status === 200) return response;

    // 4. Stored token expired, retrieve again
    MbbCloudToken = await refreshMbbCloudToken();

    headers["X-MB-SignedHeaders"] = MbbCloudToken;
    // 5. Call DP API again

    try {
        response = await fetch(url, {
            method,
            headers,
            ...(body && { body: JSON.stringify(body) }),
        });
    } catch (e) {
        // Error logging for DP API here
        throw e;
    }

    return response;
}

import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    ACCEPT_APP_JSON,
    ACCEPT_MULTIPART,
    CONTENT_TYPE_APP_JSON,
    TOKEN_TYPE_MAYA,
    TOKEN_TYPE_MDIP,
} from "@constants/api";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { getCasaToken, handleMdipTokenExpiry } from "@utils/mdipToken";

const ApiManagerSSO = () => {
    const controller = useModelController();

    ApiManagerSSO.context = {
        controller,
    };

    return null;
};

const handleRejection = async (response, config) => {
    showLoader(false);
    const errorObj = await response.json();
    return new Promise((resolve, reject) => {
        if (Array.isArray(errorObj.errors)) {
            if (config.promptError) {
                showErrorToast({
                    message: errorObj.errors[0].message,
                });
            }
            return reject({
                error: errorObj.errors[0],
            });
        }
    });
};

function showLoader(visible) {
    const updateModel = ApiManagerSSO?.context?.controller?.updateModel;
    updateModel({
        ui: {
            showLoader: visible,
        },
    });
}

function fetchData(url, reqType, headers, body) {
    return fetch(url, {
        method: reqType,
        headers,
        body,
    });
}

ApiManagerSSO.service = async (config) => {
    const getModel = ApiManagerSSO?.context?.controller?.getModel;
    const updateModel = ApiManagerSSO?.context?.controller?.updateModel;
    let devicePlatform = false;
    if (isPureHuawei) {
        devicePlatform = "HUAWEI";
    } else {
        devicePlatform = Platform.OS.toUpperCase();
    }

    const headers = {
        "Content-Type": config.isMultipart
            ? ACCEPT_MULTIPART
            : config.contentType || CONTENT_TYPE_APP_JSON,
        Accept: config.contentType ? "*/*" : ACCEPT_APP_JSON,
        "X-APP-PLATFORM": devicePlatform, ///Platform.OS.toUpperCase(),
        "X-APP-VERSION": DeviceInfo.getVersion(),
        "X-APP-ENVIRONMENT": config?.APP_ENV ?? "",
        ...(config?.additionalHeader ?? {}), //Additional Header (defaulting to an empty object)
    };
    const { token, casaToken } = getModel("auth");
    if (!casaToken && config.tokenType === TOKEN_TYPE_MDIP) {
        const tokenResponse = await getCasaToken(token, updateModel);
        const refreshToken = tokenResponse?.responseData?.refreshToken;
        const accessToken = tokenResponse?.responseData?.accessToken;
        updateModel({
            auth: {
                casaRefreshToken: refreshToken,
                casaToken: accessToken,
            },
        });
        headers.authorization = `bearer ${accessToken}`;
    } else if (casaToken && config.tokenType === TOKEN_TYPE_MDIP) {
        headers.authorization = `bearer ${casaToken}`;
    }

    if (config.secondTokenType === TOKEN_TYPE_MAYA) {
        headers["maya-authorization"] = `bearer ${token}`;
    }

    try {
        showLoader(config.showPreloader);

        const response = await fetchData(
            config.url,
            config.reqType,
            { ...headers, ...config.headers },
            JSON.stringify(config.data)
        );

        if (response?.status === 200) {
            return await response.json();
        } else if (response?.status === 400) {
            console.log("status 400", response?.status);
            await handleRejection(response, config);
        } else if (response?.status === 401) {
            const { casaRefreshToken, token } = getModel("auth");
            const tokenResponse = await handleMdipTokenExpiry(casaRefreshToken, token);
            const accessToken = tokenResponse?.responseData?.accessToken;
            updateModel({
                auth: {
                    casaToken: tokenResponse?.responseData?.accessToken,
                    casaRefreshToken: tokenResponse?.responseData?.refreshToken,
                },
            });
            headers.authorization = `bearer ${accessToken}`;

            const response = await fetchData(
                config.url,
                config.reqType,
                { ...headers, ...config.headers },
                JSON.stringify(config.data)
            );

            if (response?.status === 200) {
                return await response.json();
            } else if (response?.status === 400) {
                handleRejection(response, config);
            }
        }
    } catch (error) {
        console.log("error log", error);
        throw new Error(error);
    } finally {
        showLoader(false);
    }
};

export default ApiManagerSSO;

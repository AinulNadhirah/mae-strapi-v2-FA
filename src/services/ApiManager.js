import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { Platform } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";

import NavigationService from "@navigation/navigationService";

import { showErrorToast } from "@components/Toast";

import { useModelController, useModelState } from "@context";

import {
    ACCEPT_APP_JSON,
    ACCEPT_MULTIPART,
    CONTENT_TYPE_APP_JSON,
    ERROR_TYPE_NO_NETWORK,
    ERROR_TYPE_TIMEOUT,
    METHOD_DELETE,
    METHOD_GET,
    METHOD_POST,
    METHOD_PUT,
    TIMEOUT,
    TOKEN_TYPE_MAYA,
    AUTHENTICATION_ERROR,
    TOKEN_TYPE_M2U,
} from "@constants/api";
import { LOGIN_CANCELLED, LOGIN_FAILED, EKYC_REUPLOAD, EKYC_UPDATE } from "@constants/strings";
import { ENROLLMENT_ENDPOINT } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { processCloudMsg, storeCloudLogs } from "@utils/cloudLog";
import { getDeviceRSAInformation, removeLocalStorage } from "@utils/dataModel/utility";
import { getGeneralErrorMessage } from "@utils/dataModel/utilityPartial.5";
import {
    getCustomerKey,
    getRefreshToken,
    setRefreshToken,
} from "@utils/dataModel/utilitySecureStorage";
import { useErrorLog } from "@utils/logs";

// for multiple requests
let isRefreshing = false;
let failedQueue = [];
let isHold = false;
let queRequest = [];
let ssoLogoff = false;
let isHMSAvailable = false;
let devicePlatform = "";

setHMSAvailabilityFlag();

const processQueue = (error) => {
    failedQueue.forEach(async (prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};
const processQueueRequest = (error) => {
    isHold = false;

    queRequest.forEach(async (prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    queRequest = [];
};

const killQueue = () => {
    isHold = false;
    queRequest = [];
};

const getCustomerKeyInfo = async () => {
    const { getModel } = ApiManager.context.controller;
    const customerKey = await getCustomerKey(getModel, true);

    if (customerKey) {
        return new Promise((resolve) => {
            resolve(customerKey);
        });
    }

    console.log("CustomerKey NOT Available in Secure Storage:");
};

const addToQue = (originalRequest) => {
    return new Promise(function (resolve, reject) {
        queRequest.push({ resolve, reject, originalRequest });
    })
        .then(async () => {
            // let token = ModelClass.COMMON_DATA.m2uAccessToken;
            const {
                auth: { token },
            } = ApiManager.context.state;

            if (token) {
                originalRequest.headers["authorization"] = `bearer ${token}`;
            }

            return axios(originalRequest);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

const logDiagnosticData = (error, url, config, data) => {
    try {
        const {
            user: { mayaUserId, fullName, email },
            device: { deviceInformation },
        } = ApiManager.context.state;
        const sendConfig = Config?.LOG_RESPONSE_REQUEST === "true";
        const user = {
            id: mayaUserId,
            name: fullName,
            email,
        };
        const diagnosticData = {
            deviceInformation,
            config: sendConfig ? config : {},
            data: sendConfig ? data : {},
            url,
        };

        // ErrorLogger(error, user, diagnosticData);
        ApiManager.context?.errorLogger(error, user, diagnosticData);
    } catch (e) {
        // ErrorLogger(e);
        ApiManager.context?.errorLogger(e);
    }
};

// TODO: move token expired handler here
// const tokenExpiredHandler = () => {};

const l2ErrorHandler = (originalRequest) => {
    const { updateModel } = ApiManager.context.controller;
    // show L2 login page
    if (!isHold) {
        updateModel({
            ui: {
                touchId: true,
            },
        });

        isHold = true;
    }

    return addToQue(originalRequest);
};

const l3ErrorHandler = (originalRequest) => {
    const { updateModel } = ApiManager.context.controller;
    // show L3 login page
    if (!isHold) {
        updateModel({
            ui: {
                m2uLogin: true,
            },
        });

        isHold = true;
    }

    return addToQue(originalRequest);
};

// SET INTERCEPTORS
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async function (error) {
        function logCloudMsg() {
            try {
                const logError = processCloudMsg(error);
                const { getModel } = ApiManager.context.controller;
                if (logError?.url && getModel) {
                    console.log("logCloudMsg", logError);
                    storeCloudLogs(getModel, logError);
                }
            } catch (e) {
                console.error(e);
            }
        }

        function showLoader(visible) {
            ApiManager.context.controller.updateModel({
                ui: {
                    showLoader: visible,
                },
            });
        }

        //store the Network error to push to cloud
        logCloudMsg();
        console.log("axois:response:interceptor:error.response:", error.response);

        if (error) {
            const originalRequest = error?.config;
            const withToken = originalRequest?._withToken;

            function noNetworkHandler() {
                const networkRetryCounter = originalRequest?.retryNetworkCount ?? 0,
                    networkRetryConfig = originalRequest?.networkRetryOption ?? 0,
                    delay = Number(originalRequest?.retryErrorWait) + 100 ?? 300,
                    isRetry = originalRequest?.isRetry,
                    startTime = originalRequest?.ts,
                    failedSec = originalRequest?.retryFailedThreshold ?? 8000,
                    timeInMs = startTime ? `${Number(Date.now() - startTime).toFixed()}` : 0;
                /**
                 * Retrying only when the Network failed based on server config
                 * isRetry -ON/OFF
                 * networkRetryCounter < networkRetryConfig - Comparing incremental count vs Server static count(5 times)
                 * timeInMs - API failed immediately(eg -8 millisec) means retrying
                 * */
                if (isRetry && networkRetryCounter < networkRetryConfig && timeInMs < failedSec) {
                    originalRequest.retryNetworkCount = Number(networkRetryCounter) + 1;
                    return new Promise((resolve) =>
                        setTimeout(() => resolve(axios(originalRequest)), delay)
                    );
                } else {
                    showLoader(false);
                    return Promise.reject(error);
                }
            }

            if (error.message === "Network Error") {
                return noNetworkHandler();
            } else if (error.response && error.response.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject, withToken, originalRequest });
                    })
                        .then(async () => {
                            const {
                                auth: { token },
                            } = ApiManager.context.state("auth");

                            if (withToken) {
                                originalRequest.headers["authorization"] = `bearer ${token}`;
                            }

                            return axios(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshHeader = {
                    "Content-Type": CONTENT_TYPE_APP_JSON,
                    Accept: ACCEPT_APP_JSON,
                    "X-APP-PLATFORM": Platform.OS.toUpperCase(),
                    "X-APP-VERSION": DeviceInfo.getVersion(),
                    "X-APP-ENVIRONMENT": Config?.APP_ENV ?? "",
                };

                const { getModel } = ApiManager.context.controller;
                const refreshToken = await getRefreshToken(getModel);

                // SET REFRESH TOKEN API
                const { device: deviceInfo } = ApiManager.context.state;
                const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

                const customerKey = await getCustomerKeyInfo();

                console.log("customerKey:", customerKey);

                if (customerKey) {
                    return axios
                        .post(
                            ENROLLMENT_ENDPOINT,
                            {
                                // notes: change from "REFRESH_TOKEN" to "PRELOGIN", request by zaki
                                grantType: "PASSWORD",
                                tokenType: "PRELOGIN",
                                refreshToken,
                                mobileSDKData: mobileSDK, // Required For RSA
                                customerKey,
                            },
                            { headers: refreshHeader }
                        )
                        .then(async (res) => {
                            if (res.status === 200) {
                                const { access_token, refresh_token } = res.data;

                                isRefreshing = false;

                                // RECALL PREVIOUS API BEFORE REFRESH
                                if (res.status === 200 || res.status === 201) {
                                    if (access_token && refreshToken) {
                                        ApiManager.context.controller.updateModel({
                                            auth: {
                                                token: access_token,
                                                refreshToken: refresh_token,
                                            },
                                        });
                                        setRefreshToken(refresh_token);
                                        originalRequest.headers.authorization = `bearer ${access_token}`;
                                    }

                                    processQueue(null);
                                    // process the hold queue too
                                    if (isHold) processQueueRequest(null);
                                    // this call seems triggering the catch. not sure what's this for
                                    return axios(originalRequest);
                                }
                            } else {
                                throw new Error(res);
                            }
                        })
                        .catch((err) => {
                            console.tron.log("Error refresh");
                            processQueue(err);
                            isRefreshing = false;
                            // reject(err);
                            // return Promise.reject(err); // Added it but not sure about impact. Will uncomment and test it in OE phase 2.
                        });
                } else {
                    killQueue();
                    // clear local stuff
                    await removeLocalStorage();
                    NavigationService.resetAndNavigateToModule("Splashscreen", "", {
                        skipIntro: true,
                        emptyState: "true",
                    });
                    return Promise.reject(error);
                }
            } else if (error && error.response && error.response.status === 417) {
                return l2ErrorHandler(originalRequest);
            } else if (error && error.response && error.response.status === 418) {
                return l3ErrorHandler(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

// Add a request interceptor
axios.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        config.ts = Date.now();
        console.log("request:", config);
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

/**
 * Modified ApiManager to be an empty component so we can use hook within.
 * The model context's method then assigned on the instance's static property
 * which should be accessible directly.
 */
const ApiManager = () => {
    const controller = useModelController();
    const state = useModelState();
    const { errorLogger } = useErrorLog();

    ApiManager.context = {
        state,
        controller,
        errorLogger,
    };

    return null;
};

async function setHMSAvailabilityFlag() {
    try {
        isHMSAvailable = isPureHuawei;
    } catch (error) {
        console.tron.log("HMS availability check error : " + error);
    }
}

/**
 * The original ApiManager turned into a static function
 * and called with ApiManager.service(path, data, etc)
 */
ApiManager.service = (arg) => {
    const defaultVal = {
        url: "",
        data: {},
        reqType: null,
        tokenType: null,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: true,
        secondTokenType: "",
        isMultipart: false,
    };
    let obj = { ...defaultVal, ...arg };
    let {
        url,
        data,
        withToken,
        withSecondaryToken,
        reqType,
        tokenType,
        timeout,
        promptError,
        showPreloader,
        secondTokenType,
        isMultipart,
        responseType,
        contentType,
        context,
    } = obj;

    const { updateModel } = context ? context?.controller : ApiManager?.context?.controller;
    const contextState = context ? context?.state : ApiManager?.context?.state;
    const {
        auth: { token },
        ui: {
            ssoPopup,
            tagBlockPopup,
            rsaLockedPopup,
            suspendOrLockedPopup,
            deactivatedAccountPopup,
        },
        networkRetry: { retryErrorCount, retryErrorWait, isRetry, retryFailedThreshold },
        appSession: { traceId },
    } = contextState;
    // const { ssoPopup, tagBlockPopup, rsaLockedPopup, suspendOrLockedPopup } = getModel("ui");

    function showLoader(visible) {
        updateModel({
            ui: {
                showLoader: visible,
            },
        });
    }

    if (showPreloader) showLoader(true);

    // IdleManager.doCheck();
    return new Promise((resolve, reject) => {
        // during session timeout, reject/cancel any api call.
        // notes: disable following code for now. Will be enable later
        // if (isSessionTimeout) {
        // showLoader(false);
        // return reject({ status: ERROR_TYPE_TIMEOUT, error: "-", message: "Session time out" });
        // }

        // console.tron.log("ApiManager:", context, auth);
        // SET CONFIG
        const authToken = withToken || tokenType ? token : null;

        if (isHMSAvailable) {
            devicePlatform = "HUAWEI";
        } else {
            devicePlatform = Platform.OS.toUpperCase();
        }

        const headers = {
            "Content-Type": isMultipart ? ACCEPT_MULTIPART : contentType || CONTENT_TYPE_APP_JSON,
            Accept: contentType ? "*/*" : ACCEPT_APP_JSON,
            "X-APP-PLATFORM": devicePlatform, ///Platform.OS.toUpperCase(),
            "X-APP-VERSION": DeviceInfo.getVersion(),
            "X-APP-ENVIRONMENT": Config?.APP_ENV ?? "",
        };

        if (traceId) {
            headers["X-APP-SESSION-TRACE-ID"] = traceId;
        }

        if (authToken) {
            headers.authorization = `bearer ${authToken}`;
        }

        // TODO: need to check if this still needed
        if ((secondTokenType == TOKEN_TYPE_MAYA || withSecondaryToken) && authToken) {
            headers["maya-authorization"] = `bearer ${authToken}`;
        }

        let config = {
            method: reqType,
            headers,
            timeout,
            _withToken: withToken || tokenType,
            responseType: responseType ? responseType : null,
            networkRetryOption: retryErrorCount,
            retryFailedThreshold,
            isRetry,
            retryErrorWait,
        };

        let axiosObj;

        switch (reqType) {
            case METHOD_GET:
                axiosObj = axios(url, config);
                break;
            case METHOD_PUT:
                axiosObj = axios.put(url, data, config);
                break;
            case METHOD_POST:
                axiosObj = axios.post(url, data, config);
                break;
            case METHOD_DELETE:
                axiosObj = axios(url, config);
                break;
            default:
                axiosObj = axios.post(url, data, config);
        }

        // CALL API
        axiosObj
            .then((response) => {
                // CALL API success
                if (ssoLogoff) ssoLogoff = false;

                resolve(response);

                showLoader(false);
            })
            .catch(async (error) => {
                logDiagnosticData(error, url, config, data);
                showLoader(false);

                // CALL API error
                if (error && error.message === "Network Error") {
                    await NetInfo.fetch().then(async (networkInfo) => {
                        if (networkInfo.isConnected) {
                            return reject({
                                status: AUTHENTICATION_ERROR,
                                error: "-",
                                message: error.message,
                            });
                        } else {
                            return reject({
                                status: ERROR_TYPE_NO_NETWORK,
                                error: "-",
                                message: error.message,
                            });
                        }
                    });
                }
                // if time out
                if (error && error.code == "ECONNABORTED") {
                    if (promptError) {
                        showErrorToast({
                            message: "Time out",
                        });
                        // StateManager.updateErrorMessages(["Time out"]); //error.message
                    }
                    console.log("ApiManager:TIME OUT");
                    return reject({ status: ERROR_TYPE_TIMEOUT, error: "-", message: "Time out" });
                }

                try {
                    if (error?.response) {
                        const errorObj = error.response.data;
                        // ERROR HANDLER goes here, except error for expire token
                        console.tron.log("api error in try response:", error);

                        switch (error.response.status) {
                            // case 500:
                            //     if (promptError) {
                            //         // Alert.alert("ERROR:", errorMsg);
                            //         showErrorToast({
                            //             message: `ERROR: ${
                            //                 errorObj?.error?.message ?? "Service is not available."
                            //             }`,
                            //         });
                            //     }

                            //     reject({
                            //         status: ERROR_TYPE_NO_NETWORK,
                            //         error: errorObj.error,
                            //         message:
                            //             errorObj?.error?.message ?? "Service is not available.",
                            //     });
                            //     break;
                            // case 503:
                            //     reject({
                            //         status: ERROR_TYPE_NO_NETWORK,
                            //         error: "-",
                            //         message: "Service is not available.",
                            //     });
                            //     break;
                            case 401:
                                reject({ status: 401, error: errorObj, message: errorObj.message });
                                break;
                            case 417:
                                reject({ status: 417, error: "-", message: errorObj.message });
                                break;
                            case 423:
                                console.log("423");
                                reject({ status: 423, error: errorObj, message: "" });
                                break;
                            case 428:
                                reject({ status: 428, error: errorObj, message: "" });
                                break;
                            case 403:
                                console.log("403 - tokenType", tokenType);

                                if (
                                    !ssoPopup & !suspendOrLockedPopup &&
                                    !tagBlockPopup &&
                                    !rsaLockedPopup &&
                                    !ssoLogoff &&
                                    !deactivatedAccountPopup
                                ) {
                                    const isSuspension =
                                        errorObj?.error === "suspended" ||
                                        errorObj?.error === "locked";
                                    const isTagBlock = errorObj?.error === "tagblock";
                                    const isRsaCqBlock = errorObj?.error === "rsacqblock";
                                    const isDeactivated = errorObj?.error === "deactivated";
                                    const isSsoError = errorObj?.error === "olddevice"; //account login in another device error

                                    if (
                                        !isSuspension &&
                                        !isTagBlock &&
                                        !isRsaCqBlock &&
                                        !isDeactivated &&
                                        !isSsoError
                                    ) {
                                        //error message based on 403 error response
                                        const errorMessage = getGeneralErrorMessage(error);

                                        //show popup with appropriate message
                                        updateModel({
                                            ui: {
                                                touchId: false,
                                                m2uLogin: false,
                                                generalErrorPopup: true,
                                                generalErrorMessage: errorMessage,
                                            },
                                        });

                                        reject({
                                            status: 403,
                                            error: errorObj,
                                            message: errorObj.message,
                                        });
                                    } else {
                                        ssoLogoff = true;

                                        updateModel({
                                            ui: {
                                                // ssoPopup: !isSuspension && !isTagBlock && !isRsaCqBlock,
                                                // suspendOrLockedPopup:
                                                //     isSuspension && !isTagBlock && !isRsaCqBlock,
                                                // suspendOrLockedTitle: errorObj?.error_title,
                                                // suspendOrLockedMessage: errorObj?.error_description,
                                                // tagBlockPopup:
                                                //     isTagBlock && !isSuspension && !isRsaCqBlock,
                                                // rsaLockedPopup:
                                                //     isRsaCqBlock && !isSuspension && !isTagBlock,
                                                touchId: false,
                                                m2uLogin: false,
                                            },
                                        });

                                        // clear AS
                                        await removeLocalStorage();
                                        // go to splash to set up all details back and then go dashboard
                                        NavigationService.resetAndNavigateToModule(
                                            "Splashscreen",
                                            "",
                                            {
                                                skipIntro: true,
                                                emptyState: true,
                                                ssoPopup:
                                                    isSsoError &&
                                                    !isSuspension &&
                                                    !isTagBlock &&
                                                    !isRsaCqBlock &&
                                                    !isDeactivated,
                                                suspendOrLockedPopup:
                                                    isSuspension &&
                                                    !isTagBlock &&
                                                    !isRsaCqBlock &&
                                                    !isDeactivated &&
                                                    !isSsoError,
                                                suspendOrLockedTitle: errorObj?.error_title,
                                                suspendOrLockedMessage: errorObj?.error_description,
                                                tagBlockPopup:
                                                    isTagBlock &&
                                                    !isSuspension &&
                                                    !isRsaCqBlock &&
                                                    !isDeactivated &&
                                                    !isSsoError,
                                                rsaLockedPopup:
                                                    isRsaCqBlock &&
                                                    !isSuspension &&
                                                    !isTagBlock &&
                                                    !isDeactivated &&
                                                    !isSsoError,
                                                deactivatedAccountPopup:
                                                    isDeactivated &&
                                                    !isRsaCqBlock &&
                                                    !isSuspension &&
                                                    !isTagBlock &&
                                                    !isSsoError,
                                            }
                                        );

                                        reject({
                                            status: 403,
                                            error: errorObj,
                                            message: errorObj.message,
                                        });
                                    }
                                } else {
                                    reject({
                                        status: 403,
                                        error: errorObj,
                                        message: errorObj.message,
                                    });
                                }
                                break;
                            // case 502:
                            // case 400:
                            // case 404:
                            default:
                                console.log("DEFAULT:", errorObj);
                                if (errorObj) {
                                    if (Array.isArray(errorObj.errors)) {
                                        if (promptError) {
                                            let errors = errorObj.errors.map(
                                                (error) => error.message
                                            );
                                            // StateManager.updateErrorMessages(errors);
                                            showErrorToast({
                                                message: errors[0],
                                            });
                                        }
                                        reject({
                                            status: error.response.status,
                                            error: errorObj.errors[0],
                                            message: errorObj.errors[0].message,
                                        });
                                    } else {
                                        console.log("ApiManager:default CATCH : ", errorObj);
                                        if (
                                            errorObj?.message !== LOGIN_CANCELLED &&
                                            errorObj?.message !== LOGIN_FAILED &&
                                            errorObj?.message !== EKYC_REUPLOAD &&
                                            errorObj?.message !== EKYC_UPDATE &&
                                            promptError
                                        ) {
                                            console.log(
                                                "ApiManager:default CATCH : ",
                                                errorObj,
                                                errorObj?.message !== LOGIN_CANCELLED ||
                                                    errorObj?.message !== LOGIN_FAILED,
                                                promptError
                                            );

                                            if (promptError) {
                                                // refactor this part
                                                showErrorToast({
                                                    message: `ERROR: ${
                                                        errorObj?.error?.message ??
                                                        "Service is not available."
                                                    }`,
                                                });
                                            }

                                            reject({
                                                status: error.response.status,
                                                error: errorObj,
                                                message: errorObj.error?.message,
                                            });
                                        } else {
                                            // if (errorObj?.message === LOGIN_CANCELLED) {
                                            //     errorObj.data = { code: 1, message: "Failed" };
                                            //     resolve(errorObj);
                                            // } else {
                                            reject({
                                                status: error?.response?.status,
                                                error: errorObj,
                                                message: errorObj?.message,
                                            });
                                            // }
                                        }
                                    }
                                } else {
                                    reject({
                                        status: "-",
                                        error: "-",
                                        message: "ERROR",
                                    });
                                }

                                break;
                        }
                    } else {
                        console.tron.log("ApiManager:error (error.response) : ", error);
                        reject({
                            status: ERROR_TYPE_NO_NETWORK,
                            error: "-",
                            message: "Error",
                        });
                    }
                } catch (error) {
                    // alert("ERROR", error.message);
                    const errorObj = error?.response?.data?.error;
                    const errorMsg = errorObj?.message
                        ? errorObj.message
                        : "Service is not available.";
                    console.tron.log("ApiManager:error CATCH : ", error);
                    showLoader(false);

                    reject({
                        status: ERROR_TYPE_NO_NETWORK,
                        error: "-",
                        message: errorMsg,
                    });
                }
            });
        // });
    });
};

ApiManager.callQueue = (err) => {
    console.tron.log("ApiManager.callQueue");
    const errorObj = {
        response: {
            status: "-",
            data: {
                code: "-",
                error: "-",
                message: err,
            },
        },
    };

    processQueueRequest(err ? errorObj : null);
};

ApiManager.killQueue = () => {
    console.log("ApiManager.killQueue");
    killQueue();
};

//S2U V4
ApiManager.formConfigObj = () => {
    const contextState = ApiManager?.context?.state;
    const {
        auth: { token },
        networkRetry: { retryErrorCount, retryErrorWait, isRetry, retryFailedThreshold },
    } = contextState;

    let devicePlatform = Platform.OS.toUpperCase();
    if (isPureHuawei) {
        devicePlatform = "HUAWEI";
    }
    const headers = {
        "Content-Type": CONTENT_TYPE_APP_JSON,
        Accept: ACCEPT_APP_JSON,
        "X-APP-PLATFORM": devicePlatform,
        "X-APP-VERSION": DeviceInfo.getVersion(),
        "X-APP-ENVIRONMENT": Config?.APP_ENV ?? "",
        authorization: `bearer ${token}`,
    };

    return {
        method: "POST",
        headers,
        timeout: TIMEOUT,
        _withToken: TOKEN_TYPE_M2U,
        networkRetryOption: retryErrorCount,
        retryFailedThreshold,
        isRetry,
        retryErrorWait,
    };
};

export default ApiManager;

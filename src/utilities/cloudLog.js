import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { AppState } from "react-native";
import Conf from "react-native-config";
import DeviceInfo from "react-native-device-info";

import { getMbbCloudTokenByMayaToken } from "@services";
import { callCloudApi } from "@services/ApiManagerCloud";

import { AWS } from "@constants/data";

import { checkVPN } from "@utils";
import { isPureHuawei } from "@utils/checkHMSAvailability";
import {
    getCloudToken,
    saveCloudToken,
    getDigitalIdentityByType,
    getHalfCustomerKey,
} from "@utils/dataModel/utility";

/**
 *
 * @param {get the log contentflush it to cloud} body
 */

async function cloudLogApi(body, isRefresh) {
    try {
        const uri = Conf?.AWS_CLOUDLOG_URL ? Conf?.AWS_CLOUDLOG_URL + `/error` : "";
        // const token = await getCloudToken();
        // const L0 = token ?? (await refreshMbbCloudToken());
        const headers = {
            "Content-Type": `application/json`,
            // Authorization: `Bearer ${L0}`, <--- authorization token not required, commented out for now
        };
        const noJson = true;
        const api = await callCloudApi({ uri, method: "POST", headers, body, noJson });
        return { response: api, ...isRefresh };
    } catch (e) {
        console.log(e);
        return { response: "", ...isRefresh };
    }
}

async function proceedCloudApi(body) {
    try {
        const data = JSON.stringify(body);
        const { response, isRefresh } = await cloudLogApi(data);
        if (response?.status === 202) {
            clearStored();
        }
        if (!isRefresh && response?.status === 403) {
            const token = await refreshMbbCloudToken();
            saveCloudToken(token);
            await cloudLogApi(body, true);
        }
    } catch (e) {
        console.log(e);
    }
}

export async function refreshMbbCloudToken() {
    let headerToken;
    try {
        const mayaResponse = await getMbbCloudTokenByMayaToken();
        headerToken = mayaResponse?.data?.access_token;
        await AsyncStorage.setItem("MbbCloudToken", headerToken);
        return headerToken;
    } catch (e) {
        // Error logging for MbbCloudToken API here
        console.log(e);
    }
}

async function clearStored() {
    await AsyncStorage.removeItem("cloudLogs");
}

/**
 *
 * Checking IPaddress of the network and sending to backend
 * also to check other than maybank api got response or not
 * This api very light weight(100B)
 */
async function getIPaddress(url) {
    try {
        const resp = await fetch(url, {
            method: "GET",
            timeout: 10000,
        });
        const status = await resp?.status;
        if (status === 200) {
            const ip = await resp.text();
            return {
                netAddress: ip,
                isExternalApi: true,
                statusText: resp?.statusText,
                status: resp?.status,
            };
        } else {
            return { ipAddress: "", isExternalApi: false };
        }
    } catch (error) {
        return { ipAddress: "", isExternalApi: false };
    }
}

/**
 *
 * @param {get from rsa sdk} RSAInfo
 * @param {get device info} error
 * @returns
 */

async function getLogsObj(RSAInfo, error, extraData, getModel) {
    const devInfo = RSAInfo?.deviceInformation;
    const { traceId } = getModel("appSession");
    return {
        timestamp: new Date().getTime(),
        data: {
            deviceInfo: await DeviceInfo?.getDeviceId(),
            devName: devInfo?.DeviceName,
            devModel: devInfo?.DeviceModel,
            devOS: devInfo?.DeviceSystemName,
            devId: RSAInfo?.deviceId,
            hardwareId: devInfo?.HardwareID,
            osId: devInfo?.OS_ID,
            oSVersion: DeviceInfo.getSystemVersion(),
            batteryDetails: await DeviceInfo.getPowerState(),
            compromised: devInfo?.Compromised,
            emulator: devInfo?.Emulator,
            freeStorage: await DeviceInfo.getFreeDiskStorage(),
            appVersion: DeviceInfo.getVersion(),
            isAirplane: await DeviceInfo.isAirplaneMode(),
            devType: DeviceInfo.getDeviceType(),
            networkConn: await NetInfo.fetch(),
            error: error || "",
            time: new Date().toString(),
            key: await getHalfCustomerKey(getModel),
            rsaKey: devInfo?.RSA_ApplicationKey,
            isHuaweiAppGallery: isPureHuawei,
            locationDetails: devInfo?.GeoLocationInfo,
            permission: {
                notification: extraData?.notifications ?? "",
                location: extraData?.location ?? "",
            },
            externalApi: error?.apiError ? await getIPaddress(extraData?.url) : {},
            appState: AppState.currentState || "",
            keyChainErrorOnStoring: devInfo?.KeyChainErrorOnStoring || "NA",
            keyChainErrorOnRetrieve: devInfo?.KeyChainErrorOnRetrieve || "NA",
            vpn: await checkVPN(),
            appSessionId: traceId ?? "N/A",
        },
    };
}

async function getCloudLogs() {
    const cloudLogs = await AsyncStorage.getItem("cloudLogs");
    return cloudLogs ? JSON.parse(cloudLogs) : [];
}

async function saveCloudLogs(val) {
    if (val) {
        await AsyncStorage.setItem("cloudLogs", JSON.stringify(val));
    }
}

/**
 *
 * @param {*} cloudCounter - get the limit from init api
 * @param {*} log - Previously stored cloudlogs or empty
 * @param {*} obj - Parameters to send to the cloud
 * @returns
 */
export function getFilterData(cloudCounter, log, obj) {
    if (log?.length) {
        const len = Number(cloudCounter);
        if (log.length > len - 1) {
            // lastin first out
            log.shift();
            log.push(obj);
        } else if (log.length < len) {
            log.push(obj);
        }
        return [...log];
    } else {
        return [obj];
    }
}

/**
 * This function can called whenever need to store the error
 * @param {*} val - get the error value
 * @param {*} controller - get the controller for the model
 */
export async function storeCloudLogs(getModel, val) {
    try {
        //to directly push log for 403 error
        const isPushLog = val.status === 403;
        const awsId = isPushLog ? await getDigitalIdentityByType(AWS) : null;
        const cloudLogs = !isPushLog ? await getCloudLogs() : null;

        const { cloudFlag, cloudCounter } = getModel("logs");
        const deviceInfo = getModel("device");
        const { internetCheckAPIURL } = getModel("networkRetry");

        const { notifications, location } = getModel("permissions");
        const extraParam = {
            notifications,
            location,
            url: internetCheckAPIURL,
        };

        if (cloudFlag) {
            const obj = await getLogsObj(deviceInfo, val, extraParam, getModel);
            // isPushLog will bypass storing log in local and push log right away to cloudwatch
            if (isPushLog) {
                pushDirectCloudLog(awsId, [obj]);
            } else {
                const data = getFilterData(cloudCounter, cloudLogs, obj);
                // save the logs
                await saveCloudLogs(data);
            }
        } else {
            //Remove Localstorage data when turn off
            clearStored();
        }
    } catch (e) {
        console.log("storeCloudLogsCatch----->", e);
    }
}

//receive log and push log without storing in local
export async function pushDirectCloudLog(awsId, errorLogs) {
    try {
        if (errorLogs) {
            const data = {
                logStreamName: awsId || errorLogs[0]?.hardwareId || errorLogs[0]?.devId,
                payload: errorLogs,
            };
            await proceedCloudApi(data);
        }
    } catch (e) {
        console.error(e);
    }
}

// Implemented Pushing Error to cloud
export async function pushCloudLogs({ getModel }) {
    try {
        const isOnboardCompleted = await AsyncStorage.getItem("isOnboardCompleted");
        const { cloudFlag } = getModel("logs");
        if (cloudFlag && isOnboardCompleted !== "true") {
            return;
        }
        const cloudLogs = await getCloudLogs();
        const awsId = await getDigitalIdentityByType(AWS, getModel);
        if (cloudLogs?.length) {
            const data = {
                logStreamName: awsId || cloudLogs[0]?.data?.hardwareId || cloudLogs[0]?.data?.devId,
                payload: cloudLogs,
            };
            console.log(data);
            await proceedCloudApi(data);
        }
    } catch (e) {
        console.error(e);
    }
}

//remove request data from log data
export function getResponseData(error) {
    return {
        ...error.response,
        config: null,
    };
}

export function processCloudMsg(error) {
    let obj = {};
    //isAxiosError = true if the error originated from a Network Request, i.e. was not the result of a syntax error
    const isAxiosError = axios.isAxiosError(error);
    const networkRetryCounter = error.config?.retryNetworkCount ?? 0;
    const networkRetryOption = error.config?.networkRetryOption ?? 0;

    //check for config and append latency and URL
    if (error && error?.config) {
        const config = error.config;
        const timeInMs = config?.ts ? `${Number(Date.now() - config.ts).toFixed()}ms` : "";
        obj = {
            url: config?.url ? config?.url.split("?")[0] : "",
            latency: timeInMs ?? "",
            apiError: true,
            isAxiosError,
        };
    }
    //check for APPside error msg and append
    //timeout, network error - no response
    if (error && error?.message) {
        obj = { ...obj, status: "-", message: error.message };
    }
    //check for HTTPcode error and append
    if (error && error?.response) {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || error.response?.data || getResponseData(error);
        const responseHeaders = error.response?.headers;
        obj = {
            ...obj,
            status,
            ...(error?.response?.data ? { message, responseHeaders } : { message }),
        };
    }

    //ignore  HTTPcode error
    if (obj?.status && (obj?.status === 417 || obj?.status === 418)) obj = {};
    //ignore  Appside error
    if (networkRetryCounter > 0 && networkRetryCounter < networkRetryOption + 1) obj = {};

    return obj;
}

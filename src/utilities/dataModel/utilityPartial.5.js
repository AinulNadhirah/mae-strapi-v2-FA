import AsyncStorage from "@react-native-community/async-storage";
import { useCallback } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNLibSodiumSdk from "react-native-libsodium-sdk";

import { SECURE2U_COOLING } from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import {
    unregisterOta,
    callSecure2uValidateApi,
    updateS2uGcmToken,
    updateS2uMultiOTP,
    autoTopupInquiry,
} from "@services";
import { getFCMToken, unregisterPushNotification } from "@services/pushNotifications";

import * as Strings from "@constants/strings";
import { AUTO_TOPUP_INQ } from "@constants/url";

import { getDeviceRSAInformation } from "./utilityPartial.2";
import { checkNumber, removeLocalStorage } from "./utilityPartial.4";
import { onSyncOsId } from "./utilityS2U";

export const unregisterS2uOta = async (otaDeviceId, deviceId, subUrl) => {
    const params = {
        app_id: Strings.APP_ID,
        device_id: otaDeviceId,
        hardware_id: deviceId,
    };

    try {
        const response = await unregisterOta(JSON.stringify(params), subUrl);

        if (response && response.data.status === "000") {
            // clear the flags
            return true;
        } else {
            console.log("not unregister");
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export function checks2UFlow(functionCode, getModel, updateModel, txnNameData = null) {
    return new Promise((resolve, reject) => {
        const deviceInfo = getModel("device");
        const ota = getModel("ota");
        const { mdipS2uEnable, mdipS2uCoolingReady } = getModel("s2uIntrops");
        const { deviceId: otaDeviceId } = getModel("ota");
        //s2u interops changes call v2 url when MDIP migrated
        const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/validate`;
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const isUserEnabledSecure2U = ota?.isEnabled ?? false;
        mobileSDK.hardwareID = deviceInfo.deviceId; //s2u android 10 and above, same as s2u reg

        callSecure2uValidateApi(functionCode, mobileSDK, subUrl, txnNameData)
            .then(async (secure2uValidateData) => {
                console.log("secure2uValidateData", secure2uValidateData);
                const {
                    action_flow,
                    s2u_registered,
                    pull,
                    s2u_enabled,
                    isUnderCoolDown,
                    status,
                    updateGCM,
                    updateMultiOTP,
                    updateOsid,
                } = secure2uValidateData;

                let flow = "NA";
                if (action_flow == "S2U" && s2u_enabled && status === "M001") {
                    //M001 mean s2u is not reg any channels
                    flow = "S2UReg";
                } else if (action_flow == "S2U" && s2u_enabled) {
                    // if (s2u_registered && isUserEnabledSecure2U) { // disable for a while until backend fully tested
                    if (mdipS2uEnable && mdipS2uCoolingReady && isUnderCoolDown) {
                        // proceed s2u flow
                        flow = SECURE2U_COOLING;
                    } else if (
                        (isUserEnabledSecure2U && !pull) ||
                        (isUserEnabledSecure2U && pull === "Y") ||
                        pull === "N"
                    ) {
                        flow = "S2U";
                    } else {
                        // proceed s2u flow registration
                        flow = "S2UReg";
                    }
                } else if (action_flow == "TAC") {
                    flow = "TAC";
                }
                if (updateOsid) {
                    onSyncOsId(getModel);
                }
                //MDIP will asked to update FCM token and reregister s2u keys
                if (isUserEnabledSecure2U && mdipS2uEnable) {
                    const { fcmToken } = getModel("auth");
                    const token = fcmToken ? fcmToken : getFCMToken(fcmToken);
                    if (updateGCM && token) {
                        //update FCM token
                        updateS2UToken(token);
                    }
                    if (updateMultiOTP && updateModel) {
                        //update s2u token
                        callS2uMultiOTP(otaDeviceId, deviceInfo.deviceId, updateModel);
                    }
                }
                resolve({ flow, secure2uValidateData, isUnderCoolDown });
            })
            .catch((error) => {
                reject({ flow: "TAC", secure2uValidateData: {}, error });
                console.log("error", error);
            });
    });
}

export const updateS2UToken = async (token, from) => {
    /**update FCM for s2u interops in below three places
     * 1.validate API mdip system will return updateGCM true
     * 2.FCM onTokenRefresh event
     * 3.On app launch to sync latest FCM token is to MDIP system DB, Because previously hardcoded
     * 4.Compare new token with existing one. As this method triggers in iOS on every launch
     */
    try {
        const osFCMToken = await AsyncStorage.getItem("fcmToken");
        if (
            (Platform.OS === "ios" && token !== osFCMToken) ||
            (Platform.OS === "android" && token)
        ) {
            const results = await AsyncStorage.multiGet([
                "serverPublicKey",
                "deviceKeys",
                "otaDeviceId",
            ]);
            const [serverPublicKey, deviceKeys, deviceId] = results.map((result) => result[1]);
            const deviceSecretKey = deviceKeys && JSON.parse(deviceKeys).sk;
            const params = {
                message: JSON.stringify({
                    mdip_id: deviceId,
                    gcm_token: token,
                }),
                publicKey: serverPublicKey,
                secretKey: deviceSecretKey,
            };
            const response = await doEncrypt(params);
            if (response && response?.ct && response?.nonce) {
                const { ct, nonce } = response;
                const data = {
                    cipher_text: ct,
                    device_nonce: nonce,
                    app_id: Strings.APP_ID,
                    device_os: Platform.OS === "android" ? "Android" : "iOS",
                };
                if (from === "pushNotifications") {
                    return data;
                } else {
                    const responseData = await updateS2uGcmToken(data);
                    return responseData && responseData.status === "M000";
                }
            }
        }
    } catch (error) {
        console.log(error);
        return from === "pushNotifications" ? {} : false;
    }
};

export const callS2uMultiOTP = async (otaDeviceId, deviceId, updateModel) => {
    /**update s2u token-Reregister for s2u interops in below two places
     * 1.validate API mdip will return updateMultiOTP true
     * 2.when S2u transcation return error code M213 and M208
     */
    const params = {
        device_id: otaDeviceId,
        hardware_id: deviceId,
        app_id: Strings.APP_ID,
    };
    try {
        const response = await updateS2uMultiOTP(
            JSON.stringify(params),
            "2fa/v2/secure2u/updateMultiOTP"
        );
        if (response && response?.data?.status === "M000") {
            const { payload } = response.data;
            const results = await AsyncStorage.multiGet(["serverPublicKey", "deviceKeys"]);
            const [serverPublicKey, deviceKeys] = results.map((result) => result[1]);
            const deviceSecretKey = deviceKeys && JSON.parse(deviceKeys).sk;
            const params = [
                payload[0].encriptedSeeds,
                serverPublicKey,
                payload[0].nonce,
                deviceSecretKey,
            ];
            const data = await doDecryptS2u(params);
            if (data && data?.plainText) {
                const { plainText } = data;
                const { totp, hotp } = JSON.parse(plainText);
                const deviceId = payload[0].deviceId;
                // update AS and context
                updateModel({
                    ota: {
                        isEnabled: true,
                        mdipCounter: 1,
                        hOtp: hotp,
                        tOtp: totp,
                        deviceId,
                    },
                });
                await AsyncStorage.multiSet([
                    ["isOtaEnabled", "true"],
                    ["mdipCounter", "1"],
                    ["otaHotp", hotp],
                    ["otaTotp", totp],
                    ["otaDeviceId", deviceId],
                ]);
                return true;
            }
        } else {
            console.log("not unregister");
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const doEncrypt = async (params) => {
    const encrypt = await RNLibSodiumSdk.encryptAndAuthenticate([
        params.message,
        params.publicKey,
        params.secretKey,
    ]);

    return encrypt;
    // return new Promise((resolve, reject) => {
    //     function handleResponseIos(error, response) {
    //         if (error) reject(error);

    //         resolve(response);
    //     }

    //     function handleErrorAndroid(error) {
    //         reject(error);
    //     }

    //     function handleResponseAndroid(response) {
    //         resolve(JSON.parse(response));
    //     }

    //     RNLibSodiumSdk.encryptAndAuthenticate([params.message, params.publicKey, params.secretKey], handleResponseIos);

    //     if (Platform.OS === "ios") {
    //         const data = [params.message, params.publicKey, params.secretKey];

    //         NativeModules.LibSodiumReact.encryptNauthenticate(data, handleResponseIos);
    //     } else {
    //         NativeModules.LibSodiumReact.encryptNauthenticate(
    //             params.message,
    //             params.publicKey,
    //             params.secretKey,
    //             handleErrorAndroid,
    //             handleResponseAndroid
    //         );
    //     }
    // });
};

async function doDecryptS2u(params) {
    try {
        const decrypt = await RNLibSodiumSdk.decryptAndVerify(params);
        return decrypt;
    } catch (err) {
        return err;
    }
    // return new Promise((resolve, reject) => {
    //     function handleResponseIos(error, response) {
    //         if (error) reject(error);

    //         resolve(response);
    //     }

    //     function handleErrorAndroid(error) {
    //         reject(error);
    //     }

    //     function handleResponseAndroid(response) {
    //         resolve(JSON.parse(response));
    //     }

    //     if (Platform.OS === "ios") {
    //         NativeModules.LibSodiumReact.decryptNverify(params, handleResponseIos);
    //     } else {
    //         NativeModules.LibSodiumReact.decryptNverify(
    //             params[0],
    //             params[1],
    //             params[2],
    //             params[3],
    //             handleErrorAndroid,
    //             handleResponseAndroid
    //         );
    //     }
    // });
}

export const formatBakongMobileNumbers = (val) => {
    /*
    Need to remove country code from Mobile No. first as
    +855 will be appended infront of returning value
*/
    const numberWithoutCode = val?.replace(/^855|^\+855/, "")?.replace(/\s|[^0-9]/g, "");
    const val1 = checkNumber(numberWithoutCode);
    const startVal = 4;
    const first = val1.toString().substring(0, startVal);
    const second = val1
        .toString()
        .substring(startVal, val1.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return `${first} ${second}`.trim();
};

export const getLinkParams = ({ key = "", link = "" }) => {
    const params = {};
    link.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
        params[key] = value;
    });
    return key ? params[key] : params;
};

export const getNetworkOperatorValue = (cardNo) => {
    let operator;
    switch (cardNo) {
        case "5":
            operator = "MASTERCARD";
            break;
        case "4":
            operator = "VISA";
            break;
        case "3":
            operator = "AMEX";
            break;
    }
    return operator;
};

// React Native implementation of Promise.allSettled https://github.com/facebook/react-native/issues/30236
export const allSettled = (promises) => {
    return Promise.all(
        promises.map((promise) =>
            promise
                .then((data) => ({ state: "SUCCESS", data }))
                .catch((data) => ({ state: "FAIL", data }))
        )
    );
};

export function promisedSetState(newState) {
    return new Promise((resolve) => {
        this.setState(newState, () => {
            resolve();
        });
    });
}

export const autoTopupNavigate = async (maeCustomerInfo, navParams) => {
    const { fromScreen, fromModule, moreParams } = navParams;
    const { applicantType, maeAcctNo } = maeCustomerInfo;
    const ntbApplicantTypes = ["1", "2", "3", "4"];
    const isNTB = ntbApplicantTypes.includes(applicantType);

    const param = {
        maeAccNo: maeAcctNo,
        txnType: "0",
    };
    const httpResp = await autoTopupInquiry(param, `${AUTO_TOPUP_INQ}`).catch((error) => {
        console.log("[autoTopupInquiry] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? null;
    console.log("RES", result);
    if (!result) {
        return;
    }
    const { statusCode, statusDesc } = result;
    const statusArr = ["02", "03", "04"];
    if (statusArr.includes(statusCode)) {
        const screen = statusCode === "02" ? "AutoTopupEdit" : "AutoTopupLimit";

        return {
            screen,
            params: {
                isNTB,
                customerInfo: maeCustomerInfo,
                serverData: result,
                fromModule,
                fromScreen,
                moreParams,
            },
        };
    } else {
        showErrorToast({
            message: statusDesc || Strings.COMMON_ERROR_MSG,
        });
    }
    return;
};

export const cardPressedNavigate = (
    onCardPressed,
    accountName,
    beneficiaryId,
    accountNo,
    accountBalance,
    beneficiaryFlag
) => {
    return useCallback(
        () =>
            onCardPressed({
                accountName,
                beneficiaryId,
                accountNo,
                balanceFormatted: accountBalance,
                beneficiaryFlag,
            }),
        [accountNo, beneficiaryId, accountName, onCardPressed, accountBalance, beneficiaryFlag]
    );
};

export const getTransferAccountType = (flow) => {
    let transferFlow;

    switch (flow) {
        case 1:
            transferFlow = "Own";
            break;
        case 2:
        case 3:
        case 4:
            transferFlow = "Others";
            break;
        case 5:
            transferFlow = "Overseas";
            break;
        case 12:
            transferFlow = "DuitNow";
            break;
        case 13:
            transferFlow = "Card";
            break;
        default:
            transferFlow = "Loan";
            break;
    }
    return transferFlow;
};

export const getProviderId = (payeeName) => {
    let payeeCode;

    switch (payeeName) {
        case "FTT":
            payeeCode = "1";
            break;
        case "MOT":
            payeeCode = "4";
            break;
        case "WU":
            payeeCode = "x50255";
            break;
        case "MAYBANK":
            payeeCode = "MBB";
            break;
        case "OWN_ACCT":
            payeeCode = "MBB";
            break;
        default:
            payeeCode = null;
            break;
    }
    return payeeCode;
};

export const getGeneralErrorMessage = (error) => {
    if (error?.response?.headers?.server === "AkamaiGHost") {
        return {
            title: Strings.BE_RIGHT_BACK,
            message: Strings.PLEASE_RETRY_ERROR_MESSAGE,
            hideCloseButton: false,
            primaryCTA: Strings.RETRY,
        };
    } else if (error?.response?.data?.error === "ldaplock") {
        //ldapLock is M2U access Locked when user 3x wrong password
        return {
            title: Strings.M2U_TEMPORARILY_BLOCKED_ERROR_MESSAGE,
            message: Strings.KINDLY_RESET_PASSWORD__ERROR_MESSAGE,
            hideCloseButton: true,
            primaryCTA: Strings.RESET_PASSWORD_LBL,
        };
    } else {
        return {
            title: Strings.BE_RIGHT_BACK,
            message: Strings.PLEASE_RETRY_UNLINK_ERROR_MESSAGE,
            hideCloseButton: false,
            primaryCTA: Strings.RETRY,
            secondaryCTA: Strings.UNLINK_M2U_CTA,
        };
    }
};

export const unlinkM2UAccess = async (getModel, resetModel) => {
    const { fcmToken } = getModel("auth");
    const { mobileNumber } = getModel("user");
    const { deviceId } = getModel("device");
    const { isPromotionsEnabled } = getModel("misc");
    const { isEnabled: otaEnabled, deviceId: otaDeviceId } = getModel("ota");
    const { mdipS2uEnable } = getModel("s2uIntrops");
    const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/deRegister`;

    // unregister the PNS
    if (fcmToken) {
        await unregisterPushNotification(
            mobileNumber,
            deviceId,
            fcmToken,
            isPromotionsEnabled ? "A" : "T"
        );
        //dereg s2u - trigger transaction from web or RMBP shows maya still s2u registered
        if (otaEnabled) {
            await unregisterS2uOta(otaDeviceId, deviceId, subUrl);
        }
    } else {
        //dereg s2u - trigger transaction from web or RMBP shows maya still s2u registered
        if (otaEnabled) {
            await unregisterS2uOta(otaDeviceId, deviceId, subUrl);
        }
    }

    // clear and reset everything except device, appSession as usual.
    resetModel(null, ["device", "appSession"]);
    await removeLocalStorage();
};

export const getProxyList = (proxyCode) => {
    let name;

    switch (proxyCode) {
        case "MBNO":
            name = "Mobile Number";
            break;
        case "NRIC":
            name = "NRIC Number";
            break;
        case "PSPT":
            name = "Passport Number";
            break;
        case "ARMN":
            name = "Army/Police ID";
            break;
        case "BREG":
            name = "Business Registration Number";
            break;
        default:
            name = "Bank/e-Wallet Account Number";
            break;
    }
    return name;
};

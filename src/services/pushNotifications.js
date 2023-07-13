import {
    HmsLocalNotification,
    HmsPushInstanceId,
    HmsPushEvent,
} from "@hmscore/react-native-hms-push";
import notifee, { AndroidCategory, AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

import { registerGcmToken, unregisterGcmToken, updateFcmToken } from "@services";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { updateS2UToken } from "@utils/dataModel/utility";

async function createLocalNotification(title, body, data) {
    try {
        if (isPureHuawei) {
            await handleHuaweiLocalNotification(title, body, data);
        } else {
            console.log("createLocalNotification", title, body, data);
            const soundName = data?.soundName ? data?.soundName.replace(".m4a", "") : "default"; // sound name should be "mae_coin" or "default"
            const channelId = await notifee.createChannel({
                id: soundName,
                name: title,
                importance: AndroidImportance.HIGH,
                sound: soundName,
            });

            await notifee.requestPermission();
            await notifee.displayNotification({
                id: data.msgId,
                title: title,
                body,
                data: data,
                android: {
                    channelId,
                    sound: soundName,
                    smallIcon: "@drawable/ic_stat_maya_notification", // optional, defaults to 'ic_launcher'.
                    largeIcon: "@drawable/ic_mae_large_icon_default",
                    category: AndroidCategory.ALARM,
                    autoCancel: true,
                    pressAction: {
                        id: data?.msgId,
                        launchActivity: "default",
                    },
                },

                ios: {
                    //iOS need to have file extension, android not
                    sound: data?.soundName ?? "default",
                    pressAction: {
                        id: data?.msgId,
                        launchActivity: "default",
                    },
                },
            });
        }
    } catch (error) {
        console.tron.log("Error in registering device", error);
        return error;
    }
}

async function handleHuaweiLocalNotification(title, body, remoteMessage) {
    try {
        await HmsLocalNotification.localNotification({
            [HmsLocalNotification.Attr.title]: title,
            [HmsLocalNotification.Attr.message]: body,
            [HmsLocalNotification.Attr.largeIcon]: "@drawable/ic_mae_large_icon_default",
            [HmsLocalNotification.Attr.smallIcon]: "@drawable/ic_stat_maya_notification",
            [HmsLocalNotification.Attr.importance]: HmsLocalNotification.Importance.max,
            [HmsLocalNotification.Attr.dontNotifyInForeground]: false,
            [HmsLocalNotification.Attr.channelId]: remoteMessage.getChannelId(),
            [HmsLocalNotification.Attr.soundName]: remoteMessage.getSound(),
            [HmsLocalNotification.Attr.playSound]: true,
            [HmsLocalNotification.Attr.data]: remoteMessage.getData(),
        });
    } catch (error) {
        console.log("Local Notification error " + error);
    }
}

async function getGcmParams(mobileNo, deviceId, fcmToken, notifyType = "A") {
    let deviceOS = "";
    try {
        if (isPureHuawei) {
            deviceOS = "Huawei";
        } else {
            deviceOS = Platform.select({ android: "Android", ios: "iOS" });
        }
    } catch (error) {
        console.tron.log("OS identification error : " + error);
    }

    return {
        action: "A",
        gcm_token: fcmToken,
        mobile_no: mobileNo,
        notify_type: notifyType,
        os: deviceOS, // Platform.select({ android: "Android", ios: "iOS" }),
        uuid: deviceId,
    };
}
async function getHuaweiToken() {
    return new Promise((resolve, reject) => {
        // This one works for EMUI >=10 while EMUI < 10 receives empty token
        HmsPushInstanceId.getToken("")
            .then((token) => {
                console.log("HmsPushInstanceId ", JSON.stringify(token));
                if (token?.result) {
                    resolve(token?.result);
                    return;
                }
                // Should trigger if reqToken is empty for EMUI < 10
                HmsPushEvent.onTokenReceived((result) => {
                    const resultToken = result.token;
                    console.log("getHuaweiToken = ", resultToken);
                    resultToken ? resolve(resultToken) : reject("Token not received");
                });
            })
            .catch((err) => {
                console.log("getHuaweiToken error ", err);
                reject(err);
            });
    });
}

async function registerPushNotification(mobileNo, deviceId, fcmToken, notifyType) {
    if (!fcmToken) return checkAndRegisterPushNotification(mobileNo, deviceId, fcmToken);

    try {
        const gcmData = await getGcmParams(mobileNo, deviceId, fcmToken, notifyType);
        const response = await registerGcmToken(gcmData);

        if (response) return fcmToken;
    } catch (error) {
        console.log("Error in registering device", error);
        return error;
    }
}

async function checkAndRegisterPushNotification(mobileNo, deviceId, fcmToken, notifyType) {
    try {
        let requestToken;
        if (!fcmToken) {
            if (isPureHuawei) {
                requestToken = await getHuaweiToken();
            } else {
                requestToken = await messaging().getToken();
            }
        } else {
            requestToken = fcmToken;
        }
        console.log("requestToken = ", requestToken);
        if (fcmToken !== requestToken) {
            AsyncStorage.setItem("fcmToken", requestToken);
            return registerPushNotification(mobileNo, deviceId, requestToken, notifyType);
        }
    } catch (error) {
        console.tron.log("Error in registering device" + error);
        return error;
    }
}

async function unregisterPushNotification(mobileNo, deviceId, fcmToken, notifyType) {
    try {
        if (fcmToken) {
            const gcmData = await getGcmParams(mobileNo, deviceId, fcmToken, notifyType);
            return unregisterGcmToken(gcmData);
        }
    } catch (error) {
        console.log("Error in unregistering device", error);
        return error;
    }
}

async function getFCMToken(fcmToken) {
    if (!fcmToken) {
        if (isPureHuawei) {
            try {
                let huaweiToken = await getHuaweiToken();
                if (!fcmToken || fcmToken !== huaweiToken) {
                    AsyncStorage.setItem("fcmToken", huaweiToken);
                }
                return huaweiToken;
            } catch (error) {
                console.tron.log("Error in getting Huawei token : " + JSON.stringify(error));
                return error;
            }
        } else {
            try {
                const requestToken = await messaging().getToken();
                if (!fcmToken || fcmToken !== requestToken) {
                    AsyncStorage.setItem("fcmToken", requestToken);
                }
                return requestToken;
            } catch (error) {
                console.log("Error in getting fcm token : ", error);
                return error;
            }
        }
    } else {
        return fcmToken;
    }
}

async function updateFCM(mobileNo, deviceId, osFcmToken, notifyType, s2uRegistered) {
    console.log("updateFCM >>> ", osFcmToken);
    let requestToken;
    try {
        if (isPureHuawei) {
            requestToken = await getHuaweiToken();
        } else {
            requestToken = await messaging().getToken();
            const isFCMString = requestToken && typeof requestToken === "string";
            requestToken = !isFCMString ? await messaging().getToken() : requestToken; //If requestToken is not string or null then try again to fetch token
        }

        if (requestToken && typeof requestToken === "string" && osFcmToken !== requestToken) {
            const deRegisterFcmReq = await getGcmParams(mobileNo, deviceId, osFcmToken, notifyType);
            const s2uReqData = s2uRegistered
                ? await updateS2UToken(requestToken, "pushNotifications")
                : {};
            const data = {
                deRegisterFcmReq,
                registerFcmToken: requestToken,
                s2uRegistered,
                updateFcmReq: s2uReqData,
            };
            console.log("new fcm api call request data : ", data);
            const response = await updateFcmToken(data);
            if (response.status === 200) {
                AsyncStorage.setItem("fcmToken", requestToken);
                return requestToken;
            } else {
                return "";
            }
        }
    } catch (error) {
        console.log("Error in registering device", error);
        return error;
    }
}

export {
    checkAndRegisterPushNotification,
    registerPushNotification,
    unregisterPushNotification,
    createLocalNotification,
    getGcmParams,
    getFCMToken,
    updateFCM,
};

import HMSAnalytics from "@hmscore/react-native-hms-analytics";
import firebase from "@react-native-firebase/app";

import { showErrorToast } from "@components/Toast";

import { isPureHuawei } from "@utils/checkHMSAvailability";

/**
 * If true, allows the device to collect analytical data and send it to Firebase.
 * By default it is enabled.
 * enabled: boolean
 */
export const setAnalyticsCollectionEnabled = (enabled) => {
    firebase.analytics().setAnalyticsCollectionEnabled(enabled);
};

/**
 * Log a custom event with optional params.
 * event: string
 * params: object
 */
export const logEvent = (eventName, propertyObject) => {
    try {
        logEventAsync(eventName, propertyObject).then();
    } catch (e) {
        showErrorToast({ message: e.message });
    }
};

export const logEventAsync = async (eventName, propertyObject) => {
    try {
        console.tron.display({
            name: "logEvent",
            value: { eventName, propertyObject },
        });

        if (isPureHuawei) {
            const result = await HMSAnalytics.onEvent(eventName, propertyObject);
            console.tron.log("onEvent result  :" + JSON.stringify(result));
        } else {
            firebase.analytics().logEvent(eventName, propertyObject);
        }
    } catch (e) {
        showErrorToast({ message: e.message });
    }
};

/**
 * Sets the duration of inactivity that terminates the current session.
 * The default value is 1800000 (30 minutes).
 * miliseconds: number
 */
export const setSessionTimeoutDuration = (miliseconds) => {
    firebase.analytics().setSessionTimeoutDuration(miliseconds);
};

/**
 * Gives a user a unique identification.
 * id: string
 */
export const setUserId = async (id) => {
    try {
        if (isPureHuawei) {
            HMSAnalytics.setUserId(id);
        } else {
            await firebase.analytics().setUserId(id);
        }
        return null;
    } catch (error) {
        console.tron.log(" setUserId error :  " + error);
    }
};

/**
 * Sets a key/value pair of data on the current user.
 * name: string
 * value: string
 */
export const setUserProperty = (name, value) => {
    firebase.analytics().setUserProperty(name, value);
};

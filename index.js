import { HmsPushMessaging, RNRemoteMessage } from "@hmscore/react-native-hms-push";
import messaging from "@react-native-firebase/messaging";
import React from "react";
import { AppRegistry, Platform } from "react-native";
import Config from "react-native-config";
import "react-native-get-random-values";
import { Provider } from "react-redux";

import bgMessaging from "@services/bgMessaging";
import { createLocalNotification } from "@services/pushNotifications";

import store from "@redux/store";

import { isPureHuawei } from "@utils/checkHMSAvailability";

import App from "./App";
import { name as appName } from "./app.json";

/**
 * this is to support Buffer as global for usage by the library
 * TODO: FIND A DIFFERENT LIBRARY TO DO THIS WITHOUT THE NEED OF SHIM!
 */
import "./shim";

if (Config?.DEV_ENABLE === "true" && Config?.LOG_RESPONSE_REQUEST === "true") {
    const { startNetworkLogging } = require("react-native-network-logger");
    startNetworkLogging();
}

const Root = () => (
    <Provider store={store}>
        <App />
    </Provider>
);

/**
 * Upon receive push will auto launch app's background task and trigger this function,
 * This function in turn schedules a local notification
 *
 * iOS triggers setBackgroundMessageHandler if background app refresh is turned ON
 *
 * Also iOS, App Background, without setBackgroundMessageHandler also the device will display PN.
 * - Hence we only use for Android. If use for iOS, we'll get 2x push notification
 */
if (Platform.OS === "android") {
    if (isPureHuawei) {
        HmsPushMessaging.setBackgroundMessageHandler((payload) => {
            const remoteMessage = new RNRemoteMessage(payload);
            const { notif_title, full_desc } = JSON.parse(remoteMessage.getData());

            createLocalNotification(notif_title, full_desc, remoteMessage);

            return Promise.resolve();
        });
    } else {
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log("messaging().setBackgroundMessageHandler", remoteMessage);
            bgMessaging(remoteMessage);
        });
    }
}

AppRegistry.registerComponent(appName, () => Root);

import notifee, { AndroidCategory, AndroidImportance } from "@notifee/react-native";

export default async (message) => {
    console.log("bgMessaging", message);
    /**
     * < RNFirebaseV6, sound name should be "mae_coin.m4a" or "default"
     * = RNFirebaseV6, local notification is depreciated in favor of notifee library. Notifee only support .mp3: "mae_coin" or "default"
     * Push payload still sending {soundName: "mae_coin.m4a"}. Once force upgrade we need to tell push to remove the .m4a
     * */
    const soundName = message.data?.soundName
        ? message.data?.soundName.replace(".m4a", "")
        : "default"; // sound name should be "mae_coin" or "default"

    const channelId = await notifee.createChannel({
        id: soundName,
        name: message.data?.notif_title || message.collapseKey,
        importance: AndroidImportance.HIGH,
        sound: soundName,
    });

    await notifee.requestPermission();
    await notifee.displayNotification({
        id: message?.data?.msgId,
        title: message.data?.notif_title || message.collapseKey,
        body: message.data.full_desc,
        data: message.data,
        android: {
            channelId,
            sound: soundName,
            smallIcon: "@drawable/ic_stat_maya_notification", // optional, defaults to 'ic_launcher'.
            largeIcon: "@drawable/ic_mae_large_icon_default",
            category: AndroidCategory.ALARM,
            autoCancel: true,
            pressAction: {
                id: message?.data?.msgId,
                launchActivity: "default",
            },
        },
        ios: {
            pressAction: {
                id: message?.data?.msgId,
                launchActivity: "default",
            },
        },
    });
    return Promise.resolve();
};

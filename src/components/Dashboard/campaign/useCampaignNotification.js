import { RNRemoteMessage } from "@hmscore/react-native-hms-push";
import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import { useCallback } from "react";

import { createLocalNotification } from "@services/pushNotifications";

import { DATE_FORMAT } from "@constants/strings";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { getServerDate } from "@utils/dataModel/utilityPartial.4";

const useCampaignNotification = () => {
    const INIT_DATE_LAUNCH_PN_CAMPAIGN = "initialDateLaunchPNCampaign";

    const getDateInitPushNotifLaunch = () => {
        return AsyncStorage.getItem(INIT_DATE_LAUNCH_PN_CAMPAIGN);
    };

    const saveDateInitPushNotifLaunch = async (date) => {
        if (date) {
            await AsyncStorage.setItem(INIT_DATE_LAUNCH_PN_CAMPAIGN, date);
        }
    };

    const isPushNotificationNeeded = useCallback(async (currentServerDate) => {
        let isMoreThanEqualOneDay;
        const lastDatePNShow = await getDateInitPushNotifLaunch();
        if (lastDatePNShow) {
            const currentDate = moment(currentServerDate).format(DATE_FORMAT);
            const initialDate = moment(lastDatePNShow).format(DATE_FORMAT);
            isMoreThanEqualOneDay = currentDate !== initialDate;
        } else {
            //first onboard
            isMoreThanEqualOneDay = true;
        }
        return isMoreThanEqualOneDay;
    }, []);

    const pushNotificationPrediction = () => {
        const week = moment().week();
        return week % 2 === 0 ? "Even" : "Odd";
    };

    const showPreLoginPushNotification = useCallback(
        async (data) => {
            const { title, desc } = data;
            const notification = {
                msgId: "1",
                soundName: "default",
                notif_title: title,
                template_id: "0",
                type: "Campaign",
                module: "GAME",
                hasAnimation: "true",
            };
            const huaweiPayload = new RNRemoteMessage({
                ChannelId: null,
                Sound: "default",
                data: JSON.stringify(notification),
            });
            const payload = isPureHuawei ? huaweiPayload : notification;
            const initServerDate = await getServerDate();
            const showPushNotification = await isPushNotificationNeeded(initServerDate);

            if (showPushNotification) {
                createLocalNotification(title, desc, payload).then(async () => {
                    await saveDateInitPushNotifLaunch(initServerDate);
                });
            }
        },
        [isPushNotificationNeeded]
    );

    return {
        showPreLoginPushNotification,
        pushNotificationPrediction,
    };
};

export default useCampaignNotification;

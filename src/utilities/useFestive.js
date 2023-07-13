import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";

import {
    DASHBOARD_STACK,
    GATEWAY_SCREEN,
    SEND_REQUEST_MONEY_STACK,
} from "@navigation/navigationConstant";

import DashboardCampaignWidget from "@components/Dashboard/campaign/DashboardCampaignWidget";
import useCampaignNotification from "@components/Dashboard/campaign/useCampaignNotification";

import { useModelController } from "@context";

import { callCloudApi } from "@services/ApiManagerCloud";

import TurboStorage from "@libs/TurboStorage";

const useFestive = () => {
    const { getModel, updateModel } = useModelController();
    const { isTapTasticReady, tapTasticType, campaignAssetsUrl } = getModel("misc");
    const { isEnabled: qrEnabled } = getModel("qrPay");
    const [festiveAssets, setFestiveAssets] = useState(null);
    const FESTIVE_ENDPOINT = `${campaignAssetsUrl}`;
    const { pushNotificationPrediction } = useCampaignNotification();

    const getConfig = useCallback(async () => {
        try {
            const campaignConfig = JSON.parse(TurboStorage.getItem("campaign_config"));
            if (campaignConfig?.campaignWebViewUrl) {
                updateModel({
                    misc: {
                        campaignWebViewUrl: campaignConfig.campaignWebViewUrl,
                    },
                });
                setFestiveAssets(campaignConfig);
            }
        } catch {}
    }, []);

    useEffect(() => {
        getConfig().catch(console.error);
    }, [getConfig]);

    const getImageUrl = (imagePath) => {
        return { uri: `${FESTIVE_ENDPOINT}/${imagePath}` };
    };

    const festiveModuleStack = () => {
        return {
            module: "GameStack",
            screen: "TapTrackWin",
        };
    };

    const getDashboardContent = (statusCheck) => {
        const status = pushNotificationPrediction();
        return festiveAssets?.dashboardstatus[statusCheck][`${statusCheck}${status}`];
    };

    const getSSLDashboardContent = (status) => {
        const title = festiveAssets?.ssl.sslTitle;
        const description = festiveAssets?.ssl.sslDescription;
        const buttonText = festiveAssets?.ssl.orderNow;
        return { title, description, buttonText };
    };

    const getPushNotificationContent = (isBoosterPeriod) => {
        const status = pushNotificationPrediction();
        const title = isBoosterPeriod
            ? festiveAssets?.pushNotification?.festive[`isBoosterFestive${status}`].title
            : festiveAssets?.pushNotification?.festive[`nonBooster${status}`].title;
        const desc = isBoosterPeriod
            ? festiveAssets?.pushNotification?.festive[`isBoosterFestive${status}`].description
            : festiveAssets?.pushNotification?.festive[`nonBooster${status}`].description;
        return { title, desc };
    };

    /*Campaign has Send Greeting feature*/
    function greetingNavigation(navigation, index) {
        if (index === 0) {
            navigation.navigate("QrStack", {
                screen: qrEnabled ? "QrMain" : "QrStart",
                params: {
                    primary: true,
                    settings: false,
                    fromRoute: "",
                    fromStack: "",
                    quickAction: true,
                },
            });
        } else if (index === 1) {
            navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                screen: GATEWAY_SCREEN,
                params: {
                    action: "FESTIVE_SENDMONEY",
                    entryPoint: "festiveScreen",
                },
            });
        } else {
            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: {
                    isTapTasticReady,
                    tapTasticType,
                    screen: "SendGreetingsContacts",
                    eDuitData: null,
                },
            });
        }
    }

    /*Campaign Widget Dashboard Navigation*/
    const festiveNavigation = (navigation, isRefresh = false) => {
        const { module, screen, params } = festiveModuleStack();
        navigation.navigate(module, {
            screen,
            params: { ...params, isRefresh },
        });
    };

    const festiveNavigationObject = festiveModuleStack();

    const getLottieAnimation = (imagePath) => {
        const uri = `${campaignAssetsUrl}/${imagePath}`;
        const asyncStorage = TurboStorage.getItem(uri);
        if (asyncStorage) {
            return JSON.parse(asyncStorage);
        }

        const headers = { "content-type": "application/json" };

        callCloudApi({ uri, headers, method: "GET" })
            .then((lottie) => {
                TurboStorage.setItem(uri, JSON.stringify(lottie));
                return lottie;
            })
            .catch(() => {
                return null;
            });
    };

    return {
        getImageUrl,
        festiveNavigation,
        greetingNavigation,
        festiveAssets,
        festiveNavigationObject,
        getDashboardContent,
        getSSLDashboardContent,
        getPushNotificationContent,
        getLottieAnimation,
    };
};

export function DashboardFestiveWidget({ tapTasticType, gameMetadata, isRefresh }) {
    return <DashboardCampaignWidget isRefresh={isRefresh} />;
}
DashboardFestiveWidget.propTypes = {
    tapTasticType: PropTypes.string,
    gameMetadata: PropTypes.object,
    isRefresh: PropTypes.bool,
};

export default useFestive;

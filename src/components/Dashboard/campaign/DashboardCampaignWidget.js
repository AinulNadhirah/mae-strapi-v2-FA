import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Conf from "react-native-config";

import GameWithTracker from "@components/Dashboard/campaign/GameWithTracker";
import GameWithoutTracker from "@components/Dashboard/campaign/GameWithoutTracker";
import ShimmerLoading from "@components/Dashboard/campaign/ShimmerLoading";
import useCampaignNotification from "@components/Dashboard/campaign/useCampaignNotification";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getCampaignTrackerSummary } from "@services";

import useFestive from "@utils/useFestive";

function DashboardCampaignWidget({ isRefresh, updateModel, getModel }) {
    const { festiveAssets, getDashboardContent, getPushNotificationContent, getLottieAnimation } =
        useFestive();
    const { showPreLoginPushNotification } = useCampaignNotification();
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const {
        dashboard: { isCampaignPushNotificationLaunched },
        misc: { campaignTrackerUrl, isCampaignTrackerEnable },
        auth: { token },
    } = getModel(["dashboard", "auth", "misc"]);
    const [data, setData] = useState(null);
    const dashboardCampaignEndpoint = campaignTrackerUrl || Conf?.CAMPAIGN_TRACKER_URL;
    const uri = `${dashboardCampaignEndpoint}/campaign/tracker?campaign_id=${festiveAssets?.campaignId}`;

    const getData = useCallback(() => {
        getCampaignTrackerSummary({ uri, token })
            .then((response) => {
                const responseData = response?.data;
                const campaignList = responseData.campaignList;
                if (campaignList && campaignList.length > 0) {
                    const campaign = campaignList[0];
                    setData(campaign);
                    if (campaign?.campaign_status === "A") {
                        const data = getPushNotificationContent(campaign?.booster);
                        showPreLoginPushNotification(data).then();
                    }
                }
            })
            .catch((err) => {
                console.log("getTotalEarnedSummary err = ", err);
                setData(null);
            })
            .finally(() => {
                setLoading(false);
                setInitLoading(false);
                updateModel({
                    dashboard: {
                        campaignRefresh: false,
                    },
                });
            });
    }, [showPreLoginPushNotification, token, updateModel, uri]);

    useEffect(() => {
        /*
         * Predownload all the animation/Lottie upfront to reduce the loading/slowness
         */
        if (festiveAssets) {
            getLottieAnimation(festiveAssets?.gameStatus.tapTrackWin);
            getLottieAnimation(festiveAssets?.gameStatus.completed);
            getLottieAnimation(festiveAssets?.gameStatus.booster);
            getLottieAnimation(festiveAssets?.gameStatus.grandPrize);
            getLottieAnimation(festiveAssets?.gameStatus.specialPrize);
            getLottieAnimation(festiveAssets?.qrPay.cashback?.success.animation);
            getLottieAnimation(festiveAssets?.qrPay.cashback?.failed.animation);
        }
    }, [festiveAssets]);

    useEffect(() => {
        if (isCampaignTrackerEnable && (isRefresh || initLoading)) {
            setLoading(true);
            getData();
        } else {
            if (initLoading) {
                const data = getPushNotificationContent(false);
                showPreLoginPushNotification(data).then(() => {
                    setInitLoading(false);
                });
            }
        }
    }, [
        getData,
        initLoading,
        isCampaignPushNotificationLaunched,
        isCampaignTrackerEnable,
        isRefresh,
        showPreLoginPushNotification,
    ]);

    return (
        <>
            <View style={styles.dashboardWidgetHeader}>
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={19.5}
                    text={festiveAssets?.dashboard?.headerTitle} //edit title taptrackwin
                />
            </View>

            {loading ? (
                <ShimmerLoading isTrackerShow={initLoading || !!data} />
            ) : data ? (
                <GameWithTracker data={data} content={getDashboardContent(data?.status)} />
            ) : (
                <GameWithoutTracker />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    dashboardWidgetHeader: {
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 24,
        marginHorizontal: 24,
    },
});

DashboardCampaignWidget.propTypes = {
    isRefresh: PropTypes.bool,
    updateModel: PropTypes.func,
    getModel: PropTypes.func,
};

export default withModelContext(DashboardCampaignWidget);

import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { Viewport } from "@skele/components";
import PropTypes from "prop-types";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateCta } from "@screens/Notifications";
import IntroductionScreen from "@screens/OnBoarding/Introduction/IntroductionScreen";
import { getIsIntroductionHasShow } from "@screens/OnBoarding/Introduction/utility";

import { DASHBOARD_STACK, MANAGE_DASHBOARD } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FeaturedArticles from "@components/Dashboard/FeaturedArticles";
import FeaturedPromos from "@components/Dashboard/FeaturedPromos";
import MaybankHeartWidget from "@components/Dashboard/MaybankHeartWidget";
import Sama2LokalWidget from "@components/Dashboard/Sama2LokalWidget";
import SpendingSummary from "@components/Dashboard/SpendingSummary";
import TabungSummary from "@components/Dashboard/TabungSummary";
import BannerSwiper from "@components/Dashboard/new/BannerSwiper";
import QuickAction from "@components/Dashboard/new/QuickAction";
import TopSections from "@components/Dashboard/new/TopSections";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { requestUserRest } from "@services";
import { callCloudApi } from "@services/ApiManagerCloud";
import { openDeeplink } from "@services/Deeplink";
import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { updateFCM } from "@services/pushNotifications";

import { FADE_GREY, MEDIUM_GREY, SEPARATOR, TRANSPARENT, WHITE, YELLOW } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_DASHBOARD,
    FA_LOGIN,
    FA_MANAGE_WIDGETS,
    FA_METHOD,
    FA_PASSWORD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";
import { CAMPAIGN_BASED_ENDPOINT } from "@constants/url";

import TurboStorage from "@libs/TurboStorage";

import { pushCloudLogs } from "@utils/cloudLog";
import { massageWidgetData } from "@utils/dataModel/utility";
import useFestive from "@utils/useFestive";

import Images from "@assets";

import { defaultWidgets } from "./ManageDashboard";
import { defaultActions, defaultAllActions } from "./QuickActions/data";

function Separator({ noGutter }) {
    return (
        <View style={[styles.separator, noGutter && styles.separatorNoGutter]}>
            <SpaceFiller width="100%" height={1} backgroundColor={SEPARATOR} />
        </View>
    );
}

Separator.propTypes = {
    noGutter: PropTypes.bool,
};

function Footer({ navigation, isOnboard }) {
    function handleManageWidget() {
        if (!isOnboard) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD,
                [FA_ACTION_NAME]: FA_MANAGE_WIDGETS,
            });

            navigation.navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD,
                [FA_ACTION_NAME]: FA_MANAGE_WIDGETS,
            });

            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: { screen: MANAGE_DASHBOARD },
            });
        }
    }

    return (
        <View style={styles.footer}>
            <View style={styles.footerBg}>
                <Image source={Images.dashboardManage} style={styles.footerBgImg} />
            </View>

            <View>
                <Typo
                    fontSize={18}
                    fontWeight="600"
                    lineHeight={32}
                    text="Personalise Your Space"
                    style={styles.footerTitle}
                />
                <Typo
                    fontSize={14}
                    fontWeight="normal"
                    lineHeight={20}
                    text="Choose the widgets that you'd like to see and make this space feel more like you!"
                    style={styles.footerDescription}
                />
                <View style={styles.footerActionContainer}>
                    <ActionButton
                        backgroundColor={YELLOW}
                        borderRadius={20}
                        height={42}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Manage Widgets"
                            />
                        }
                        style={styles.footerAction}
                        onPress={handleManageWidget}
                    />
                </View>
            </View>
        </View>
    );
}

Footer.propTypes = {
    navigation: PropTypes.object,
    isOnboard: PropTypes.bool,
};

function StatusBarCover({ fadeValue }) {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <Animated.View
            style={[
                styles.statusBarCover,
                {
                    height: safeAreaInsets.top,
                    opacity: fadeValue(),
                },
            ]}
            testID="dashboard_status_bar"
        />
    );
}

StatusBarCover.propTypes = {
    fadeValue: PropTypes.func,
};

function RemapWidget({ widget, sslReady, ...props }) {
    switch (widget) {
        case "samaSamaLokalWidget":
            if (sslReady) {
                return <Sama2LokalWidget navigation={props.navigation} {...props} />;
            } else return null;
        case "tabung":
            return <TabungSummary navigation={props.navigation} {...props} />;

        case "spending":
            return <SpendingSummary {...props} />;

        case "promotions":
            return <FeaturedPromos {...props} />;

        case "articles":
            return <FeaturedArticles {...props} />;

        default:
            return null;
    }
}

RemapWidget.propTypes = {
    sslReady: PropTypes.bool,
    widget: PropTypes.string,
    navigation: PropTypes.object,
    applePayEnable: PropTypes.bool,
    isOnboard: PropTypes.bool,
    eligibleDevice: PropTypes.bool,
    dashboardWidget: PropTypes.object,
};

// ref value doesn't been picked up inside the effect
// further troublshoot needed but this static variable
// could solve multi notification navigating when dashboard
// refreshed
let navigating = false;

function Home({ navigation, getModel, updateModel, api }) {
    const [isPullRefresh, setPullRefresh] = useState(false);
    const [isBalanceRefresh, setBalanceRefresh] = useState(false);
    const [isForceUpdate, setForceUpdate] = useState(0);
    const [hasDeeplink, setDeeplink] = useState(false);
    const dashboardScrollRef = useRef();
    const [initialLoaded, setInitialLoaded] = useState(1);
    const [visibleIntroScreen, setVisibleIntroScreen] = useState(false);
    const {
        user: { isOnboard },
        auth: { isPostLogin, fcmToken },
        ui: { notificationControllerNavigation },
        permissions: { notifications: notificationsPermissions },
        dashboard: { widgets, quickActions, refresh, isRendered },
        deeplink: { url: deeplinkUrl, params: deeplinkParams },
        pushNotification: { ctaData },
        misc: {
            isPromotionsEnabled,
            isDonationReady,
            isTapTasticReady,
            isTapTasticDonationReady,
            atmCashOutReady,
            propertyMetadata,
            isShowSecureSwitch,
            tapTasticType,
            rpp2bAbWidget,
        },
        device: { deviceId },
        ssl: { sslReady },
        atm: { isEnabled, isOnboarded, statusMsg, statusHeader },
        s2uIntrops: { mdipS2uEnable },
        myGroserReady,
    } = getModel([
        "user",
        "auth",
        "ui",
        "permissions",
        "dashboard",
        "deeplink",
        "misc",
        "device",
        "ssl",
        "deeplink",
        "atm",
        "pushNotification",
        "myGroserReady",
        "s2uIntrops",
        "wallet",
    ]);

    //first load we set "fadeIn" animation, after rendered we put as undefined (no animation)
    const screenAnimation = isRendered ? undefined : "fadeIn";
    const scrollY = new Animated.Value(0);

    const { festiveAssets } = useFestive();

    useScrollToTop(dashboardScrollRef);

    function fadeCover() {
        return scrollY.interpolate({
            inputRange: [0, 140, 280],
            outputRange: [0, 0.5, 1],
            extrapolate: "clamp",
        });
    }

    const updateWidgetsDashboard = useCallback(
        async (widgets) => {
            console.tron.log("updateWidgetsDashboard");
            updateModel({
                dashboard: {
                    widgets,
                },
            });
            AsyncStorage.setItem("dashboardWidgetsList", JSON.stringify(widgets));
        },
        [updateModel]
    );

    const updateWidgetsQuickActions = useCallback(
        async (quickActionsSource) => {
            const quickActions = quickActionsSource;

            AsyncStorage.setItem("dashboardQuickActions", JSON.stringify(quickActions)).then(() => {
                updateModel({
                    dashboard: {
                        quickActions,
                    },
                });
            });
        },
        [updateModel]
    );

    const getProfile = useCallback(async () => {
        try {
            const response = await requestUserRest(false);

            if (response && response?.data?.result) {
                const {
                    fullName,
                    phone: mobileNumber,
                    imageBase64,
                    username,
                    email,
                    userId,
                    birthDate,
                } = response.data.result;

                updateModel({
                    user: {
                        fullName,
                        mobileNumber,
                        email,
                        birthDate,
                        username,
                        m2uUserId: userId,
                        mayaUserId: userId,
                        profileImage: imageBase64 ? `data:jpeg;base64,${imageBase64}` : null,
                    },
                });

                // see if we need to re-register PNS
                if (notificationsPermissions && mobileNumber) {
                    // checkAndRegisterPushNotification(
                    //     mobileNumber,
                    //     deviceId,
                    //     fcmToken,
                    //     isPromotionsEnabled ? "A" : "T"
                    // );
                    const isOtaEnabled = await AsyncStorage.getItem("isOtaEnabled");
                    //Update S2U and PNS
                    const updateFCMResult = await updateFCM(
                        mobileNumber,
                        deviceId,
                        fcmToken,
                        isPromotionsEnabled ? "A" : "T",
                        isOtaEnabled
                    );
                    console.log("updateFCMResult ::: ", updateFCMResult);
                }
            }
        } catch (error) {
            // can't get the user details
        }
    }, [updateModel, notificationsPermissions, deviceId, isPromotionsEnabled, fcmToken]);

    async function checkIntroductionScreen() {
        const isIntroductionHasShow = await getIsIntroductionHasShow();
        setVisibleIntroScreen(!isIntroductionHasShow);
    }

    function closeIntroScreen() {
        setVisibleIntroScreen(false);
    }

    function updateDashboardIsRendered() {
        //This is for unmountOnBlur, check on TabNavigator.js
        //for unmount the stack, for example
        //open notification inbox from home page, go to another tab
        //and click home tab again
        //will remove notification page
        updateModel({
            dashboard: {
                isRendered: true,
            },
        });
    }

    const prepareDashboard = useCallback(
        async (onBoard = isOnboard) => {
            console.log("prepareDashboard ", isTapTasticReady);
            // Prepare Quick Actions
            let quickActions;
            const storedQuickActions = JSON.parse(
                await AsyncStorage.getItem("dashboardQuickActions")
            );

            const festiveQuickAction = festiveAssets?.quickAction;
            const isEnableFestive = festiveQuickAction?.isEnabled;
            const dashboardQuickActions = storedQuickActions?.data;
            const dashboardQuickActionsLenght = dashboardQuickActions
                ? dashboardQuickActions.length
                : "";
            const newActions = isOnboard
                ? checkMissingQuickActions(dashboardQuickActions, isEnableFestive)
                : [];

            if (newActions && newActions.length < dashboardQuickActionsLenght) {
                //if have missing actions, will reset to defaultActions
                quickActions = {
                    data: defaultActions,
                    selectedCampaign: tapTasticType,
                };
            } else if (newActions && newActions.length === dashboardQuickActionsLenght) {
                //if no missing actions, will set same actions as storedQuickActions in async storage
                quickActions = storedQuickActions;
            } else {
                //for cases that user not onboard yet
                quickActions = {
                    data: defaultActions,
                    selectedCampaign: "default",
                };
            }
            // const isS2uAdded = await AsyncStorage.getItem("s2uQAAdded");
            //
            // const isNotModified = compareArrays(storedQuickActions);
            // if (storedQuickActions?.length === 15 && !isNotModified) {
            //     //Here in this flow S2U will become first tile and Cash Out at 4 (For default user).
            //     quickActions = !(
            //         isS2uAdded !== "true" &&
            //         storedQuickActions[0].id === "payBill" &&
            //         storedQuickActions[1].id === "transfer" &&
            //         storedQuickActions[2].id === "samaSamaLokal"
            //     )
            //         ? storedQuickActions
            //         : quickActions;
            //     AsyncStorage.setItem("s2uQAAdded", "true");
            // }

            updateWidgetsQuickActions(quickActions).then();

            // Prepare Dashboard Banner Widget
            const storedWidgets = await AsyncStorage.getItem("dashboardWidgetsList");
            updateWidgetsDashboard(massageWidgetData({ storedWidgets, defaultWidgets, sslReady }));
        },
        [sslReady, updateWidgetsDashboard, updateWidgetsQuickActions, festiveAssets]
    );

    //To check if there are missing actions in dashboard quick actions
    const checkMissingQuickActions = (dashboardQuickActions, festivePeriod) => {
        //Checking for e-greetings action
        const festiveAction = dashboardQuickActions.find((main) => main.id === "egreetings") ?? "";
        const viewAllAction = dashboardQuickActions.find((main) => main.id === "viewAll") ?? "";
        const newActions = defaultAllActions.filter((action) => {
            return dashboardQuickActions.find((main) => main.id === action.id);
        });
        //if festive period -> push festiveAction into new actions
        if (festivePeriod && festiveAction) {
            newActions.push(festiveAction);
        }
        if (viewAllAction) {
            newActions.push(viewAllAction);
        }
        return newActions;
    };

    const onRefresh = useCallback(
        (skipBalanceRefresh = false) => {
            setPullRefresh(true);
            if (!skipBalanceRefresh) {
                setBalanceRefresh(true);
            }
            setForceUpdate(isForceUpdate + 1);
            setInitialLoaded(initialLoaded + 1); //this one will compare with loaded flag at TabungSummary.js, SpendingSummary.js, FeaturesPromo.js and FeaturesArticle.js after trigger once the api cannot be trigger again until user refresh dashboard because when user refresh initialLoaded will added 1.

            updateModel({
                dashboard: {
                    refresh: false,
                },
            });

            setTimeout(() => {
                setPullRefresh(false);
                if (!skipBalanceRefresh) {
                    setBalanceRefresh(false);
                }
            }, 2000);
            // forceUpdate;
        },
        [isForceUpdate, updateModel]
    );

    const manageNotificationNav = useCallback(() => {
        const { stack, screen, params } = notificationControllerNavigation;

        if (params?.params?.screen === "Notifications") {
            // make sure we just navigate to avoid double screen
            navigation.navigate(stack, {
                screen,
                params,
            });
        } else {
            // the rest is fine for double screen
            navigation.push(stack, {
                screen,
                params,
            });
        }

        updateModel(
            {
                ui: {
                    notificationControllerNavigation: null,
                },
            },
            () => {
                navigating = false;
            }
        );
    }, [navigation, notificationControllerNavigation, updateModel]);

    //Marketing Push notification routing after token load
    const manageCtaData = useCallback(() => {
        navigateCta(ctaData?.data, navigation);

        updateModel({
            pushNotification: {
                ctaData: {},
            },
        });
    }, [ctaData, updateModel, navigation]);

    // Festive Campaign Here
    const fetchS3Config = async () => {
        const currentVersion = DeviceInfo.getVersion();
        const campaignMasterEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/setting/${currentVersion}/masterConfig.json`;
        // Fetch latest Campaign Setting
        getCampaignSetting(campaignMasterEndpoint)
            .then(({ selectCampaign, contentVersion }) => {
                const currentCampaign = `${selectCampaign}/${currentVersion}/${contentVersion}`;
                const festiveEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/${currentCampaign}`;
                // Check if the current_campaign key not same version, it will invalidate the cache and fetech latest CampaignConfig ;)
                if (TurboStorage.resetStorage("current_campaign", currentCampaign)) {
                    getCampaignConfig(`${festiveEndpoint}/config.json`).then(() => {
                        TurboStorage.setItem(
                            "master_campaign",
                            JSON.stringify({ selectCampaign, festiveEndpoint })
                        );
                        // UpdateModel when all ready. =)
                        updateModel({
                            misc: {
                                tapTasticType: selectCampaign,
                                campaignAssetsUrl: festiveEndpoint,
                                isTapTasticReady: true,
                            },
                        });
                    });
                } else {
                    // UpdateModel when all ready. =)
                    updateModel({
                        misc: {
                            tapTasticType: selectCampaign,
                            campaignAssetsUrl: festiveEndpoint,
                            isTapTasticReady: true,
                        },
                    });
                }
            })
            // Fallover to cached current_campaign
            .catch(() => {
                if (TurboStorage.getItem("current_campaign")) {
                    const cacheMaster = TurboStorage.getItem("master_campaign");
                    if (cacheMaster) {
                        const { selectCampaign, festiveEndpoint } = JSON.parse(cacheMaster);

                        updateModel({
                            misc: {
                                tapTasticType: selectCampaign,
                                campaignAssetsUrl: festiveEndpoint.split("/config.json")[0],
                                isTapTasticReady: true,
                            },
                        });
                    }
                }
            });
    };

    const getCampaignConfig = async (festiveEndpoint) => {
        const headers = {
            "content-type": "application/json",
            "cache-control": "no-cache",
        };

        try {
            const response = await callCloudApi({ uri: festiveEndpoint, headers, method: "GET" });
            TurboStorage.setItem("campaign_config", JSON.stringify(response)); //@syn
        } catch (error) {
            console.log("after response campaign_config error", error);
        }
    };

    const getCampaignSetting = async (campaignMasterEndpoint) => {
        const headers = {
            "content-type": "application/json",
        };
        const CONFIG_URL = campaignMasterEndpoint; //calling the cloud api

        try {
            return await callCloudApi({ uri: CONFIG_URL, headers, method: "GET" });
        } catch (error) {
            console.log("after response campaign_master_config error", error);
        }
    };
    // Festive Campaign Bye

    useEffect(() => {
        //Push the logs to AWS Cloud
        pushCloudLogs({ getModel });
        //GA Events
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_DASHBOARD,
        });
        fetchS3Config();
        //please donot add dependency as getModel
    }, []);

    //If onboarded and focused to the dashboard, checkIntroScreen
    useFocusEffect(
        useCallback(() => {
            if (isOnboard) {
                checkIntroductionScreen();
            }
        }, [isOnboard])
    );

    useEffect(() => {
        if (isOnboard) {
            logEvent(FA_LOGIN, {
                [FA_METHOD]: FA_PASSWORD,
            });
            // getCashoutStatus();
            getProfile();
            prepareDashboard(isOnboard);
        }
    }, [isOnboard, getProfile]);

    useEffect(() => {
        prepareDashboard(isOnboard);
        setDeeplink(isOnboard && deeplinkUrl && deeplinkParams);
    }, [prepareDashboard, isForceUpdate, isOnboard]);

    useEffect(() => {
        if (notificationControllerNavigation?.stack && !navigating) {
            navigating = true;
            manageNotificationNav();
        }
    }, [manageNotificationNav, notificationControllerNavigation]);

    useEffect(() => {
        if (ctaData?.isData) {
            manageCtaData();
        }
    }, [manageCtaData, ctaData]);

    useEffect(() => {
        if (refresh) onRefresh(true);
    }, [refresh, onRefresh]);

    useEffect(() => {
        if (hasDeeplink) {
            openDeeplink({ updateModel, getModel, navigation });
        }
    }, [deeplinkUrl, deeplinkParams, isOnboard, hasDeeplink]);

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={WHITE}>
                <Animatable.View
                    animation={screenAnimation}
                    duration={800}
                    delay={500}
                    style={styles.dashboardWrapper}
                    useNativeDriver
                    onAnimationEnd={updateDashboardIsRendered}
                >
                    <StatusBarCover fadeValue={fadeCover} />
                    <Viewport.Tracker>
                        <ScrollView
                            ref={(ref) => (dashboardScrollRef.current = ref)}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: false }
                            )}
                            scrollEventThrottle={20}
                            showsVerticalScrollIndicator={false}
                            style={styles.dashboardScroll}
                            contentContainerStyle={[styles.dashboardContainer]}
                            refreshControl={
                                <RefreshControl
                                    tintColor={FADE_GREY}
                                    refreshing={isPullRefresh}
                                    onRefresh={onRefresh}
                                />
                            }
                            testID="dashboard_scroll_view"
                        >
                            <TopSections
                                isBalanceRefresh={isBalanceRefresh}
                                isTapTasticReady={isTapTasticReady}
                            />
                            <QuickAction
                                quickActions={quickActions}
                                isOnboard={isOnboard}
                                navigation={navigation}
                                isCampaignOn={isTapTasticReady}
                                atmData={{
                                    featureEnabled: atmCashOutReady,
                                    userRegistered: isEnabled,
                                    userVerified: isOnboarded,
                                    statusMsg,
                                    statusHeader,
                                }}
                                propertyMetaData={propertyMetadata}
                                sslReady={sslReady}
                                secureSwitchEnabled={isShowSecureSwitch}
                                myGroserAvailable={myGroserReady.code}
                                mdipS2uEnable={mdipS2uEnable}
                                tapTasticType={tapTasticType}
                                autoBillingEnable={rpp2bAbWidget}
                            />
                            <SpaceFiller height={52} />
                            <BannerSwiper />
                            <SpaceFiller height={36} />

                            <View style={styles.widgetsContainer}>
                                {widgets &&
                                    !!widgets.length &&
                                    widgets.map((widget, index) => (
                                        <Fragment key={index}>
                                            <RemapWidget
                                                key={widget.id}
                                                widget={widget.id}
                                                isOnboard={isOnboard}
                                                isPostLogin={isPostLogin}
                                                isRefresh={isForceUpdate}
                                                navigation={navigation}
                                                sslReady={sslReady}
                                                initialLoaded={initialLoaded}
                                            />
                                        </Fragment>
                                    ))}
                            </View>

                            {(isTapTasticDonationReady || isDonationReady) && (
                                <MaybankHeartWidget
                                    navigation={navigation}
                                    isOnboard={isOnboard}
                                    isPostLogin={isPostLogin}
                                    isRefresh={isForceUpdate}
                                    isTapTastic={isTapTasticReady}
                                />
                            )}
                            <Separator noGutter />

                            <Footer
                                isOnboard={isOnboard}
                                isPostLogin={isPostLogin}
                                navigation={navigation}
                            />
                        </ScrollView>
                    </Viewport.Tracker>
                    {/*</SafeAreaView> */}
                </Animatable.View>
            </ScreenContainer>
            <Modal
                visible={visibleIntroScreen}
                animated
                animationType="slide"
                hardwareAccelerated
                transparent
            >
                <IntroductionScreen onClose={closeIntroScreen} />
            </Modal>
        </>
    );
}

Home.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    api: PropTypes.object,
};

export const styles = StyleSheet.create({
    dashboardContainer: {
        backgroundColor: TRANSPARENT,
        paddingBottom: 0,
    },
    dashboardScroll: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    dashboardWrapper: {
        flex: 1,
        position: "relative",
    },
    footer: {
        paddingBottom: 350,
        paddingHorizontal: 62,
        paddingTop: 34,
        position: "relative",
        backgroundColor: MEDIUM_GREY,
    },
    footerAction: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    footerActionContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    footerBg: {
        bottom: 0,
        height: 436,
        left: 0,
        position: "absolute",
        right: 0,
    },
    footerBgImg: {
        height: 436,
        width: "100%",
    },
    footerDescription: {
        marginBottom: 16,
    },
    footerTitle: {
        marginBottom: 8,
    },
    separator: {
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    separatorNoGutter: {
        paddingVertical: 0,
    },
    statusBarCover: {
        backgroundColor: MEDIUM_GREY,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
        zIndex: 77,
    },
    widgetsContainer: {
        backgroundColor: MEDIUM_GREY,
        paddingVertical: 24,
    },
});

export default React.memo(withApi(withModelContext(Home)));

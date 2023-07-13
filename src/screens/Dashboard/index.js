import HMSLocation from "@hmscore/react-native-hms-location";
import AsyncStorage from "@react-native-community/async-storage";
import { useScrollToTop, useFocusEffect } from "@react-navigation/native";
import { Viewport } from "@skele/components";
import { isEqualWith } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useCallback, useState, useMemo, Fragment } from "react";
import {
    View,
    Image,
    Animated,
    StyleSheet,
    RefreshControl,
    Dimensions,
    Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import Geocoder from "react-native-geocoder";
import Geolocation from "react-native-geolocation-service";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateCta } from "@screens/Notifications";

import {
    BANKINGV2_MODULE,
    CARDS_LIST,
    DASHBOARD_STACK,
    MANAGE_DASHBOARD,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ProductApplyItem from "@components/Cards/ProductApplyItem";
import ScreenContainer from "@components/Containers/ScreenContainer";
import AboveTheFold from "@components/Dashboard/AboveTheFold";
import FeaturedArticles from "@components/Dashboard/FeaturedArticles";
import FeaturedPromos from "@components/Dashboard/FeaturedPromos";
import FnBStart from "@components/Dashboard/FnBStart";
import MaybankHeartWidget from "@components/Dashboard/MaybankHeartWidget";
import PropertyWidget from "@components/Dashboard/PropertyWidget";
import QuickAction from "@components/Dashboard/QuickAction";
import Sama2LokalWidget from "@components/Dashboard/Sama2LokalWidget";
import SpendingSummary from "@components/Dashboard/SpendingSummary";
import TabungSummary from "@components/Dashboard/TabungSummary";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

// import Poll from "./Poll";
// import { APP_ID } from "@constants/strings";
import { requestUserRest } from "@services";
import { callCloudApi } from "@services/ApiManagerCloud";
import { openDeeplink } from "@services/Deeplink";
import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { getFullMoment, getMomentNTB } from "@services/api/methods";
import { checkAndRegisterPushNotification, updateFCM } from "@services/pushNotifications";

import { MEDIUM_GREY, YELLOW, SEPARATOR, TRANSPARENT, FADE_GREY } from "@constants/colors";
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
    DEEPAMONEY_ICON_LABEL,
} from "@constants/strings";
import { CAMPAIGN_BASED_ENDPOINT } from "@constants/url";

import TurboStorage from "@libs/TurboStorage";

import { getUserProfile } from "@utils";
import { isPureHuawei } from "@utils/checkHMSAvailability";
import { pushCloudLogs } from "@utils/cloudLog";
import { massageWidgetData } from "@utils/dataModel/utility";
import { DashboardFestiveWidget } from "@utils/useFestive";

import Images from "@assets";
import { defaultWidgets } from "./ManageDashboard";
import { defaultActions, defaultActionsSSL } from "./ManageQuickActions";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
    aboveFoldCutoff: {
        bottom: 0,
        height: 51,
        position: "absolute",
        right: 0,
        width: 62,
    },
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
    margins: { marginHorizontal: 24, marginBottom: 12 },
    momentBg: {
        bottom: 0,
        height: 272,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width,
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
});

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

function RemapWidget({ widget, sslReady, dashboardWidget, ...props }) {
    switch (widget) {
        case "applePay":
            if (
                widget === "applePay" &&
                Platform.OS === "ios" &&
                props?.applePayEnable &&
                props?.isOnboard &&
                props?.eligibleDevice
            ) {
                return (
                    <View style={styles.margins}>
                        <ProductApplyItem
                            productType="Apple"
                            text={{
                                header: dashboardWidget?.title ?? "Apple Pay is now on MAE!",
                                subHeader:
                                    dashboardWidget?.description ??
                                    "The simple, secure\nand quick way to pay.",
                                button: dashboardWidget?.cta?.title ?? "Set Up Now",
                                subHeaderWidth: "64%",
                            }}
                            bgImageUrl={dashboardWidget?.imageUrl}
                            onCardPressed={addToAppleWallet}
                            cardType="MEDIUM"
                            height={140}
                            bgColor={YELLOW}
                        />
                    </View>
                );
            } else return null;
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

    function addToAppleWallet() {
        props.navigation.navigate(BANKINGV2_MODULE, {
            screen: CARDS_LIST,
            params: {
                entryPoint: "DASHBOARD",
            },
        });
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

function FixedMomentBgRoot({ momentLoading, moments, scrollListener, scrollY }) {
    const safeAreaInsets = useSafeAreaInsets();

    function intpTransform() {
        return scrollY.interpolate({
            inputRange: [0, 140, 200, 280],
            outputRange: [0, -60, -132, -300],
            extrapolate: "clamp",
        });
    }

    function intpOpacity() {
        return scrollY.interpolate({
            inputRange: [-200, 0],
            outputRange: [0.3, 1],
        });
    }

    const opacityInterpolate = useCallback((index) => scrollListener(index), [scrollListener]);

    return (
        <Animated.View
            style={[
                styles.momentBg,
                {
                    opacity: intpOpacity(),
                },
            ]}
        >
            {!momentLoading &&
                !!moments.length &&
                moments.map(({ imageUrl }, index) => (
                    <Animated.Image
                        key={index}
                        source={{ uri: imageUrl }}
                        resizeMethod="resize"
                        resizeMode="stretch"
                        style={[
                            styles.momentBg,
                            {
                                opacity: opacityInterpolate(index),
                            },
                            {
                                transform: [
                                    {
                                        translateY: intpTransform(),
                                    },
                                ],
                            },
                        ]}
                    />
                ))}
            {(!moments.length || momentLoading) && (
                <Animated.Image
                    source={Images.momentDefaultTemp}
                    resizeMethod="resize"
                    resizeMode="stretch"
                    style={[
                        styles.momentBg,
                        {
                            transform: [
                                {
                                    translateY: intpTransform(),
                                },
                            ],
                        },
                    ]}
                />
            )}
            <View style={styles.aboveFoldCutoff}>
                <Image source={Images.dashboardMomentCutoff} width={62} height={51} />
            </View>
        </Animated.View>
    );
}

FixedMomentBgRoot.propTypes = {
    momentLoading: PropTypes.bool,
    moments: PropTypes.array,
    scrollListener: PropTypes.func,
    scrollY: PropTypes.object,
};

const FixedMomentBg = React.memo(FixedMomentBgRoot);

// ref value doesn't been picked up inside the effect
// further troublshoot needed but this static variable
// could solve multi notification navigating when dashboard
// refreshed
let navigating = false;

//*** Currently we are using Home.js, please check on TabNavigator.js as well ***//
function Dashboard({ navigation, getModel, updateModel, api }) {
    const [momentLoading, setMomentLoading] = useState(true);
    const [moments, setMoments] = useState([]);
    const [location, setLocation] = useState({
        country: null,
        code: null,
    });
    const [isPullRefresh, setPullRefresh] = useState(false);
    const [isForceUpdate, setForceUpdate] = useState(0);
    const [showAppleWidget, setShowAppleWidget] = useState(false);
    const [hasDeeplink, setDeeplink] = useState(false);
    const dashboardScrollRef = useRef();
    const [initialLoaded, setInitialLoaded] = useState(1);
    // const { getModel, updateModel: updateModel } = useModelController();

    const {
        user: { isOnboard },
        applePay: { isApplePayEnable, isEligibleDevice, widgetEntryPoint, dashboardWidget },
        auth: { isPostLogin, fcmToken },
        ui: { notificationControllerNavigation },
        permissions: { notifications: notificationsPermissions },
        dashboard: { widgets, quickActions, refresh, campaignRefresh },
        deeplink: { url: deeplinkUrl, params: deeplinkParams },
        pushNotification: { ctaData },
        misc: {
            isPromotionsEnabled,
            isDonationReady,
            gameMetadata,
            isTapTasticReady,
            tapTasticType,
            isTapTasticDonationReady,
            propertyMetadata,
            atmCashOutReady,
            atmCashOutBanner,
            showFestiveSendMoney,
        },
        device: { deviceId },
        ssl: { sslReady },
        atm: { isEnabled, isOnboarded, statusMsg, statusHeader },
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
        "applePay",
        "atm",
        "pushNotification",
    ]);
    const scrollY = new Animated.Value(0);
    const scrollX = useMemo(() => new Animated.Value(1), []);
    const paddingSafeAreaTop = useSafeAreaInsets().top;

    useScrollToTop(dashboardScrollRef);

    const momentScrollListener = useCallback(
        (index) => {
            const previousIndex = index > 0 ? index - 1 : 0;
            const contentPosition = index * width;

            if (contentPosition > 0) {
                return scrollX.interpolate({
                    inputRange: [
                        previousIndex * width + 10,
                        previousIndex * width + width / 2,
                        contentPosition,
                    ],
                    outputRange: [0, 0.5, 1],
                    extrapolate: "clamp",
                });
            } else {
                return scrollX.interpolate({
                    inputRange: [0, width / 2, width],
                    outputRange: [1, 0.5, 0],
                    extrapolate: "clamp",
                });
            }
        },
        [scrollX]
    );

    function fadeMoment() {
        return scrollY.interpolate({
            inputRange: [-120, 0],
            outputRange: [0, 1],
            extrapolate: "clamp",
        });
    }

    function fadeCover() {
        return scrollY.interpolate({
            inputRange: [0, 140, 280],
            outputRange: [0, 0.5, 1],
            extrapolate: "clamp",
        });
    }

    const clearDashboardParam = useCallback(() => {
        navigation.setParams({
            refresh: false,
            screen: null,
        });
    }, [navigation]);

    const handleMoment = useCallback(
        (countryName, countryCode) => {
            getMoment(countryName, countryCode);
        },
        [getMoment, location]
    );

    const getHMSLocation = useCallback(async () => {
        const locationRequest = {
            priority: HMSLocation.FusedLocation.Native.PriorityConstants.PRIORITY_NO_POWER,
            interval: 3,
            numUpdates: 1,
            fastestInterval: 1000.0,
            expirationTime: 200000.0,
            expirationTimeDuration: 200000.0,
            smallestDisplacement: 0.0,
            maxWaitTime: 7000.0,
            needAddress: true,
            language: "en",
            // countryCode: "MY",
        };

        try {
            // check for HMS availability
            if (isPureHuawei) {
                const permission = await HMSLocation.FusedLocation.Native.requestPermission();

                if (permission?.granted && permission?.fineLocation) {
                    // call the location update first to make sure we use the location service,
                    // so the cache will probably not be empty when we use getLastLocation
                    const updateLocation =
                        await HMSLocation.FusedLocation.Native.requestLocationUpdatesWithCallback(
                            locationRequest
                        );
                    const lastLocation =
                        await HMSLocation.FusedLocation.Native.getLastLocationWithAddress(
                            locationRequest
                        );

                    if (updateLocation && lastLocation) {
                        setLocation({
                            country: lastLocation?.countryName,
                            code: lastLocation?.countryCode,
                        });
                        const countryName = lastLocation?.countryName;
                        const countryCode = lastLocation?.countryCode;

                        handleMoment(countryName, countryCode);
                    }
                }
            }
        } catch (error) {
            if (error > 0) {
                console.tron.log("HMS Mobile service might not be available" + error);
            } else {
                console.tron.log("Error in getting current location : ", error);
                handleMoment(); // FIXME: Added to fix the moments loading issue when location is disabled in Huawei devices.
                // Need to find a better way
            }
        }
    }, []);

    const reverseGeocoding = useCallback(({ lat, lng }) => {
        return Geocoder.geocodePosition({ lat, lng });
    }, []);

    const getLocation = useCallback(async (handleLocation, handleLocationError) => {
        try {
            Geolocation.getCurrentPosition(handleLocation, handleLocationError, {
                enableHighAccuracy: false,
                timeout: 7000,
                showLocationDialog: false,
            });
        } catch (error) {
            console.tron.log("Error in getGMSLocation ", error);
        }
    }, []);

    const getNTBMoment = useCallback(async () => {
        if (!isOnboard) {
            setMomentLoading(true);
            try {
                // call different API
                const response = await getMomentNTB(api);
                if (response && response.data) {
                    const { resultList } = response.data;
                    // set state with data from moments
                    setMoments(resultList);
                }
            } catch (error) {
                // moment error
                // TODO: check what to do for this
                setMoments([]);
            } finally {
                setMomentLoading(false);
                setPullRefresh(false);
                setDeeplink(isOnboard && deeplinkUrl && deeplinkParams);
            }
        }
    }, [isOnboard, api, deeplinkUrl, deeplinkParams]);

    const getMoment = useCallback(
        async (country, countryCode) => {
            if (isOnboard) {
                setMomentLoading(true);
                try {
                    const params =
                        countryCode && country
                            ? `countryCode=${countryCode}&country=${country}`
                            : "";
                    const response = await getFullMoment(api, params);

                    if (response && response.data) {
                        const { resultList } = response.data;
                        // set state with data from moments
                        setMoments(resultList);
                    }
                } catch (error) {
                    // moment error
                    // TODO: check what to do for this
                    setMoments([]);
                } finally {
                    setMomentLoading(false);
                    setPullRefresh(false);
                    setDeeplink(isOnboard && deeplinkUrl && deeplinkParams);
                }
            }
        },
        [api, isOnboard, deeplinkUrl, deeplinkParams]
    );

    const getMomentPrepare = useCallback(async () => {
        async function handleLocation(response) {
            const { latitude, longitude } = response.coords;
            updateModel({
                location: { latitude, longitude },
            });
            const { latitude: lat, longitude: lng } = response.coords;
            try {
                const reverse = await reverseGeocoding({ lat, lng });
                if (reverse) {
                    const { country, countryCode } = reverse[0];
                    handleMoment(country, countryCode);
                }
            } catch (error) {
                handleMoment();
            }
        }

        function handleLocationError() {
            handleMoment();
        }

        async function handleMoment(country, countryCode) {
            getMoment(country, countryCode);
        }

        //added the HMS check here to avoid getGMSLocation() execution for Huawei devices with both GMS and HMS

        if (isOnboard) {
            if (isPureHuawei) {
                await handleMoment();
            } else {
                await getLocation(handleLocation, handleLocationError);
            }
        } else {
            await getNTBMoment();
        }
    }, [isOnboard, getNTBMoment, getMoment, getLocation, reverseGeocoding]);

    const updateWidgetsDashboard = useCallback(
        async (widgets) => {
            console.tron.log("updateWidgetsDashboard");
            updateModel({
                dashboard: {
                    widgets,
                },
            });
            AsyncStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
        },
        [updateModel]
    );

    const updateWidgetsQuickActions = useCallback(
        async (quickActionsSource) => {
            const quickActions = quickActionsSource;

            updateModel({
                dashboard: {
                    quickActions,
                },
            });
            AsyncStorage.setItem("dashboardQuickActions", JSON.stringify(quickActions));
        },
        [updateModel]
    );

    const getProfile = useCallback(async () => {
        try {
            const response = await getUserProfile(updateModel);
            console.log("[Dashboard] >> getProfile response ", response);

            if (response && response?.data?.result) {
                const { phone: mobileNumber } = response.data.result;

                console.log("mobile number >> ", mobileNumber);

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

    function compareArrays(arrayA) {
        const currentList = sslReady
            ? [
                  {
                      id: "payBill",
                      title: "Pay Bills",
                  },
                  {
                      id: "transfer",
                      title: "Transfer",
                  },
                  {
                      id: "atm",
                      title: "ATM Cash-out",
                  },
                  {
                      id: "samaSamaLokal",
                      title: "Sama2 Lokal",
                  },
              ]
            : [
                  {
                      id: "payBill",
                      title: "Pay Bills",
                  },
                  {
                      id: "transfer",
                      title: "Transfer",
                  },
                  {
                      id: "atm",
                      title: "ATM Cash-out",
                  },
                  {
                      id: "splitBills",
                      title: "Split Bill",
                  },
              ];
        return isEqualWith(arrayA, currentList);
    }

    const prepareDashboard = useCallback(
        async (onBoard = isOnboard) => {
            // Prepare Quick Actions
            let quickActions = sslReady ? defaultActionsSSL : defaultActions;
            const storedQuickActions = JSON.parse(
                await AsyncStorage.getItem("dashboardQuickActions")
            );
            const isS2uAdded = await AsyncStorage.getItem("s2uQAAdded");

            const isNotModified = compareArrays(storedQuickActions);
            if (storedQuickActions?.length === 4 && !isNotModified) {
                //Here in this flow S2U will become first tile and Cash Out at 4 (For default user).
                quickActions = !(
                    isS2uAdded !== "true" &&
                    storedQuickActions[0].id === "payBill" &&
                    storedQuickActions[1].id === "transfer" &&
                    storedQuickActions[2].id === "samaSamaLokal"
                )
                    ? storedQuickActions
                    : quickActions;
                AsyncStorage.setItem("s2uQAAdded", "true");
            }

            updateWidgetsQuickActions(quickActions);

            // Prepare Dashboard Banner Widget
            const storedWidgets = await AsyncStorage.getItem("dashboardWidgets");
            let applePayFlag = false;
            if (
                Platform.OS === "ios" &&
                onBoard &&
                isApplePayEnable &&
                isEligibleDevice &&
                widgetEntryPoint
            ) {
                applePayFlag = true;
                setShowAppleWidget(true);
            }
            updateWidgetsDashboard(
                massageWidgetData({ storedWidgets, defaultWidgets, sslReady, applePayFlag })
            );
        },
        [sslReady, updateWidgetsDashboard, updateWidgetsQuickActions]
    );

    const onRefresh = useCallback(() => {
        setPullRefresh(true);
        setForceUpdate(isForceUpdate + 1);
        setInitialLoaded(initialLoaded + 1); //this one will compare with loaded flag at TabungSummary.js, SpendingSummary.js, FeaturesPromo.js and FeaturesArticle.js after trigger once the api cannot be trigger again until user refresh dashboard because when user refresh initialLoaded will added 1.
        updateModel({
            dashboard: {
                refresh: false,
            },
        });
        // forceUpdate;
    }, [isForceUpdate, updateModel]);

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

    // get moment every time in focus,
    // but only once
    useFocusEffect(
        useCallback(() => {
            getMomentPrepare();
        }, [getMomentPrepare])
    );

    useEffect(() => {
        //Push the logs to AWS Cloud
        pushCloudLogs({ getModel });
        //GA Events
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_DASHBOARD,
        });
        getMomentPrepare();
        //please donot add dependency as getModel
        fetchS3Config();
    }, []);

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
        selectLocatonService();
    }, [prepareDashboard, isForceUpdate, selectLocatonService, isOnboard]);
    //}, [prepareDashboard]);

    const selectLocatonService = useCallback(async () => {
        try {
            if (isPureHuawei) {
                getHMSLocation();
            } else {
                getMomentPrepare();
            }
        } catch (error) {
            console.tron.log("HMS availability error :" + error);
        }
    }, []);

    useEffect(() => {
        if (isForceUpdate) getMomentPrepare();
    }, [getMomentPrepare, isForceUpdate]);

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
        if (refresh) onRefresh();
    }, [refresh, onRefresh]);

    useEffect(() => {
        if (hasDeeplink) {
            openDeeplink({ updateModel, getModel, navigation });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deeplinkUrl, deeplinkParams, isOnboard, hasDeeplink]);

    const festivalTitleForTaptastic =
        showFestiveSendMoney && isTapTasticReady ? DEEPAMONEY_ICON_LABEL : "";

    const isPropertyModuleEnabled = propertyMetadata?.showBanner ?? false;

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <Animatable.View
                    animation="fadeIn"
                    duration={800}
                    delay={500}
                    style={styles.dashboardWrapper}
                    useNativeDriver
                >
                    <StatusBarCover fadeValue={fadeCover} />
                    {/* <SafeAreaView style={styles.dashboardScroll}> */}

                    <Viewport.Tracker>
                        <Animated.ScrollView
                            ref={dashboardScrollRef}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: false }
                            )}
                            scrollEventThrottle={20}
                            showsVerticalScrollIndicator={false}
                            style={styles.dashboardScroll}
                            contentContainerStyle={[
                                styles.dashboardContainer,
                                Platform.OS === "ios" && { paddingTop: paddingSafeAreaTop },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    tintColor={FADE_GREY}
                                    refreshing={isPullRefresh}
                                    onRefresh={onRefresh}
                                />
                            }
                            testID="dashboard_scroll_view"
                        >
                            <FixedMomentBg
                                momentLoading={momentLoading}
                                moments={moments}
                                scrollListener={momentScrollListener}
                                scrollY={scrollY}
                            />
                            <AboveTheFold
                                momentLoading={momentLoading}
                                moments={moments}
                                navigation={navigation}
                                isRefresh={isForceUpdate}
                                scrollX={scrollX}
                                fadeMoment={fadeMoment}
                            />
                            <QuickAction
                                data={[...quickActions]}
                                isOnboard={isOnboard}
                                isPostLogin={isPostLogin}
                                navigation={navigation}
                                showFestival={showFestiveSendMoney}
                                festivalTitle={
                                    festivalTitleForTaptastic
                                        ? festivalTitleForTaptastic
                                        : gameMetadata?.quickActionTitle
                                }
                                festivalType={isTapTasticReady ? tapTasticType : null}
                                atmData={{
                                    featureEnabled: atmCashOutReady,
                                    userRegistered: isEnabled,
                                    userVerified: isOnboarded,
                                    statusMsg,
                                    statusHeader,
                                }}
                            />
                            <Separator />

                            {isOnboard && isTapTasticReady ? (
                                <DashboardFestiveWidget
                                    tapTasticType={tapTasticType}
                                    gameMetadata={gameMetadata}
                                    isRefresh={isPullRefresh || campaignRefresh}
                                />
                            ) : (
                                (propertyMetadata?.showBanner || atmCashOutBanner) && (
                                    <PropertyWidget
                                        navigation={navigation}
                                        isOnboard={isOnboard}
                                        atmData={{
                                            bannerEnabled: atmCashOutBanner,
                                            featureEnabled: atmCashOutReady,
                                            userRegistered: isEnabled,
                                            userVerified: isOnboarded,
                                            statusMsg,
                                            statusHeader,
                                        }}
                                    />
                                )
                            )}

                            {/* {!isTapTasticReady && (
                            <PropertyWidget navigation={navigation} isOnboard={isOnboard} />
                        )} */}

                            {widgets &&
                                !!widgets.length &&
                                widgets.map((widget, index) => (
                                    <Fragment key={index}>
                                        {/** FnB banner */}
                                        {index === 2 && <FnBStart navigation={navigation} />}
                                        <RemapWidget
                                            key={widget.id}
                                            widget={widget.id}
                                            isOnboard={isOnboard}
                                            isPostLogin={isPostLogin}
                                            isRefresh={isForceUpdate}
                                            initialLoaded={initialLoaded}
                                            navigation={navigation}
                                            sslReady={sslReady}
                                            applePayEnable={showAppleWidget}
                                            dashboardWidget={dashboardWidget}
                                            eligibleDevice={isEligibleDevice}
                                        />
                                    </Fragment>
                                ))}

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
                        </Animated.ScrollView>
                    </Viewport.Tracker>
                    {/* </SafeAreaView> */}
                </Animatable.View>
            </>
        </ScreenContainer>
    );
}

Dashboard.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    api: PropTypes.object,
};

export default React.memo(withApi(withModelContext(Dashboard)));

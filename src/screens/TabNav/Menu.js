import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";
import { useSafeArea } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import {
    AIR_PAZ_INAPP_WEBVIEW_SCREEN,
    BANKINGV2_MODULE,
    CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
    EXPEDIA_INAPP_WEBVIEW_SCREEN,
    FNB_MODULE,
    FNB_TAB_SCREEN,
    KLIA_EKSPRESS_DASHBOARD,
    KLIA_EKSPRESS_STACK,
    SAVED_STACK,
    SETTINGS_MODULE,
    TICKET_STACK,
    WETIX_INAPP_WEBVIEW_SCREEN,
    SSL_STACK,
    SSL_START,
    MY_GROSER_INAPP_WEBVIEW_SCREEN,
    PROPERTY_DASHBOARD,
    FINANCIAL_GOALS_DASHBOARD_SCREEN,
    SECURE_SWITCH_STACK,
    SECURE_SWITCH_LANDING,
    MORE,
    TAB,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ProfileSection from "@components/Dashboard/new/TopSections/ProfileSection";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { m2uEnrollment, notificationCenter } from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, SHADOW, INACTIVE_COLOR, ACTIVE_COLOR, RED, GARGOYLE } from "@constants/colors";
import { GOAL_NOTIFICATION_SHOWN } from "@constants/localStorage";
import {
    ARTICLES,
    EZYQ,
    FA_ACTION_NAME,
    FA_DASHBOARD_MORE,
    FA_LOGOUT,
    FA_PROFILE,
    FA_SCREEN_NAME,
    FA_SELECT_QUICK_ACTION,
    FA_SETTINGS,
    GROCERY,
    PROPERTY,
    REFER_A_FRIEND,
    KILL_SWITCH,
} from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { getCustomerKey } from "@utils/dataModel/utilitySecureStorage";
import useFestive from "@utils/useFestive";

import Images, { tapTasticAssets } from "@assets";

const { width } = Dimensions.get("window");
const itemPerPage = 12;
const itemsInRow = 3;
const icons = Images.dashboard.icons;
const menuItems = [
    {
        id: "apply",
        title: "Apply",
        icon: icons.apply,
        requireOnboard: false,
        navigationTo: {
            module: MORE,
            screen: "Apply",
        },
    },
    {
        id: "tabung",
        title: "Tabung",
        icon: icons.tabung,
        requireOnboard: true,
        navigationTo: {
            screen: "TabungTab",
        },
    },
    {
        id: "promotions",
        title: "Promotions",
        requireOnboard: false,
        icon: icons.promotions,
        navigationTo: {
            screen: "Promotions",
        },
    },
    {
        id: "loyalty",
        title: "Loyalty",
        requireOnboard: true,
        icon: icons.loyalty,
        navigationTo: {
            screen: "Loyalty",
        },
    },
    {
        id: "movie",
        title: "Movies & Leisure",
        requireOnboard: true,
        icon: icons.movieTicket,
        navigationTo: {
            module: TICKET_STACK,
            screen: WETIX_INAPP_WEBVIEW_SCREEN,
        },
    },
    {
        id: "bus",
        title: "Bus Tickets",
        icon: icons.busTicket,
        requireOnboard: true,
        navigationTo: {
            module: TICKET_STACK,
            screen: CATCH_THAT_BUS_INAPP_WEBVIEW_SCREEN,
        },
    },
    {
        id: "travel",
        title: "Travel Deals",
        icon: icons.travelDeals,
        requireOnboard: true,
        navigationTo: {
            module: TICKET_STACK,
            screen: EXPEDIA_INAPP_WEBVIEW_SCREEN,
        },
    },
    {
        id: "erl",
        title: "ERL Tickets",
        icon: icons.erl,
        requireOnboard: true,
        navigationTo: {
            module: KLIA_EKSPRESS_STACK,
            screen: KLIA_EKSPRESS_DASHBOARD,
        },
    },
    {
        id: "flight",
        title: "Flight Tickets",
        icon: icons.flightTicket,
        requireOnboard: true,
        navigationTo: {
            module: TICKET_STACK,
            screen: AIR_PAZ_INAPP_WEBVIEW_SCREEN,
        },
    },
    {
        id: "saved",
        title: "Saved",
        icon: icons.saved,
        requireOnboard: true,
        navigationTo: {
            module: SAVED_STACK,
            screen: "SavedDashboard",
        },
    },
];
/**
 * Notification need to be the 12th item in the list
 * make sure to re-arrange it whenever new item being added
 */
const notificationMenu = {
    id: "notifications",
    title: "Notifications",
    icon: icons.notifications,
    requireOnboard: false,
    navigationTo: {
        screen: "Notifications",
        params: {
            selectedTab: null,
        },
    },
};

function getMenuPage(menuToAdd = [], getModel) {
    let menuItemsMerged = [...menuItems];
    const { isNotificationCenterReady } = getModel("misc");

    if (menuToAdd.length) {
        menuToAdd.forEach((toAdd) => {
            menuItemsMerged = [
                ...menuItemsMerged.slice(0, toAdd.index),
                toAdd.item,
                ...menuItemsMerged.slice(toAdd.index, menuItemsMerged.length),
            ];
        });
    }

    // add the notification
    if (isNotificationCenterReady) {
        menuItemsMerged = [
            ...menuItemsMerged.slice(0, 11),
            notificationMenu,
            ...menuItemsMerged.slice(11, menuItemsMerged.length),
        ];
    }

    const pages = [...Array(Math.ceil(menuItemsMerged.length / itemPerPage)).keys()];
    const rowsInPage = [...Array(Math.ceil(itemPerPage / itemsInRow)).keys()];
    const itemsGroup = pages.map((pageIndex) => {
        const itemsInPage = menuItemsMerged.filter(
            (m, i) => i >= pageIndex * itemPerPage && i < (pageIndex + 1) * itemPerPage
        );

        if (itemsInPage.length) {
            return rowsInPage
                .map((row, index) => {
                    const rangeStart = index * itemsInRow;
                    const rangeEnd = (index + 1) * itemsInRow;

                    return itemsInPage.filter((item, idx) => idx >= rangeStart && idx < rangeEnd);
                })
                .filter((r) => r.length);
        }
    });

    return itemsGroup;
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: GARGOYLE,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerInner: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: { alignItems: "center", justifyContent: "center" },
    menuItemAlert: {
        position: "absolute",
        right: -16,
        top: 0,
    },
    menuItemAlertDot: {
        backgroundColor: RED,
        borderRadius: 4,
        height: 8,
        width: 8,
    },
    menuItemInner: {
        alignItems: "center",
        height: 36,
        justifyContent: "center",
        marginBottom: 8,
        position: "relative",
        width: 36,
    },
    menuSwiper: {
        bottom: 24,
    },
    newAlert: {
        left: -23,
        position: "absolute",
        top: -10,
    },
    newAlertDot: {
        backgroundColor: RED,
        borderRadius: 6,
        height: 14,
        paddingHorizontal: 5,
    },
    profileAvatar: {
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 24,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 12,
        height: 48,
        marginRight: 12,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 12,
        width: 48,
    },
    profileAvatarImg: {
        borderRadius: 22,
        height: 44,
        width: 44,
    },
    profileName: {
        flexDirection: "column",
    },
    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperDotActive: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        paddingHorizontal: 22,
    },
});

function Header({ handleGoToSettings, isPostLogin }) {
    const safeArea = useSafeArea();
    return (
        <View
            style={[
                styles.headerContainer,
                {
                    paddingTop: safeArea.top + 32,
                },
            ]}
        >
            <ProfileSection
                onPressSetting={handleGoToSettings}
                isPostLogin={isPostLogin}
                showNotificationsIcon={false}
            />
        </View>
    );
}

Header.propTypes = {
    handleGoToSettings: PropTypes.func,
    isPostLogin: PropTypes.bool,
};

function MenuItem({
    title,
    icon,
    height,
    navigation,
    navigationTo,
    isOnboard,
    requireOnboard,
    isAlert,
    badge,
    index,
    style = {},
}) {
    const menuItemAnimated = new Animated.Value(1);
    const tension = 150;
    const friction = 7;
    const itemWidth = Math.floor((width - 44) / 3);

    function handleNavigate() {
        if (!isOnboard && requireOnboard) {
            navigation.navigate("Onboarding");
        } else {
            const params = navigationTo.params ?? {};
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD_MORE,
                [FA_ACTION_NAME]: title,
            });

            if (navigationTo.module) {
                navigation.navigate(navigationTo.module, {
                    screen: navigationTo.screen,
                    params: navigationTo.params ?? null,
                });
            } else {
                navigationTo.screen && navigation.navigate(navigationTo.screen, params);
            }
        }
    }

    function onPressIn() {
        Animated.spring(menuItemAnimated, {
            toValue: 0.9,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(menuItemAnimated, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }
    return (
        <Animatable.View animation="bounceIn" duration={200} delay={100} useNativeDriver>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handleNavigate}
                activeOpacity={0.9}
                accessible={true}
                testID={`Menu-${title}`}
                style={[
                    styles.menuItem,
                    {
                        width: itemWidth,
                        height,
                        transform: [
                            {
                                scale: menuItemAnimated,
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.menuItemInner}>
                    {typeof icon === "string" && icon?.indexOf(".gif") > 0 ? (
                        <CacheeImageWithDefault
                            image={icon}
                            resizeMode="stretch"
                            style={style}
                            defaultImage={tapTasticAssets.default.menuIcon}
                        />
                    ) : (
                        <Image
                            source={icon}
                            style={style}
                            loadingIndicatorSource={Images.loading}
                        />
                    )}

                    {isAlert && (
                        <View style={styles.menuItemAlert}>
                            <Animatable.View
                                animation="zoomIn"
                                duration={200}
                                delay={index * 30 + 200}
                                useNativeDriver
                                style={styles.menuItemAlertDot}
                            />
                        </View>
                    )}
                    {badge?.show && (
                        <View style={styles.newAlert}>
                            <View
                                animation="zoomIn"
                                duration={200}
                                delay={index * 30 + 200}
                                useNativeDriver
                                style={styles.newAlertDot}
                            >
                                <Typo
                                    fontSize={8}
                                    fontWeight="normal"
                                    lineHeight={15}
                                    color={WHITE}
                                    text={badge?.text ?? ""}
                                />
                            </View>
                        </View>
                    )}
                </View>
                <Typo fontSize={12} fontWeight="normal" lineHeight={18} text={title} />
            </TouchableOpacity>
        </Animatable.View>
    );
}

MenuItem.propTypes = {
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    height: PropTypes.number,
    navigation: PropTypes.object,
    navigationTo: PropTypes.object,
    isOnboard: PropTypes.bool,
    requireOnboard: PropTypes.bool,
    isAlert: PropTypes.bool,
    isNew: PropTypes.bool,
    index: PropTypes.number,
    style: PropTypes.object,
    badge: PropTypes.object,
};

async function handleFailedLogout() {
    NavigationService.replaceStack("OnboardingIntro");
}

async function logoutAndRefreshToken(getModel, updateModel, navigation, setLoadingLogout) {
    const { deviceInformation, deviceId } = getModel("device");
    const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

    const customerKey = await getCustomerKey(getModel, true);

    if (customerKey) {
        const params = {
            grantType: "PASSWORD",
            tokenType: "LOGOUT",
            customerKey,
            mobileSDKData,
        };

        setLoadingLogout(true);

        // get the L1 token back again
        try {
            const response = await m2uEnrollment(params, true);

            if (response && response.data) {
                const {
                    access_token,
                    refresh_token,
                    contact_number,
                    ic_number,
                    cus_type,
                    cus_name,
                } = response.data;

                setLoadingLogout(false);
                updateModel({
                    auth: {
                        token: access_token,
                        refreshToken: refresh_token,
                        customerKey,
                        isPostLogin: false,
                        isPostPassword: false,
                        lastSuccessfull: null,
                    },
                    m2uDetails: {
                        m2uPhoneNumber: contact_number,
                    },
                    user: {
                        icNumber: ic_number,
                        cus_type,
                        cus_name,
                        soleProp: cus_type === "02",
                    },
                    qrPay: {
                        authenticated: false,
                    },
                    property: {
                        isConsentGiven: false,
                        JAAcceptance: false,
                    },
                });

                navigation.navigate("Logout");
            }
        } catch (error) {
            console.tron.log("Error when authenticating");

            setLoadingLogout(false);

            handleFailedLogout();
        }
    } else {
        handleFailedLogout();
    }
}

function MenuScreen({ navigation, route }) {
    const swiperRef = useRef();
    const [itemHeight, setHeight] = useState(0);
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [menus, setMenus] = useState([]);
    const [alertItem, setAlertItem] = useState([]);
    const { getModel, updateModel } = useModelController();

    const { festiveAssets } = useFestive();

    const festiveIcon = festiveAssets?.moreMenu.festiveIcon;

    const {
        auth: { isPostLogin },
        user: { fullName, isOnboard, profileImage, cus_type },
        misc: {
            isCampaignPeriod,
            isReferralCampaign,
            gameMetadata,
            isTapTasticReady,
            tapTasticType,
            propertyMetadata,
            isShowSecureSwitch,
            isSecureSwitchCampaign,
            isDisablePNSCall,
            inboxUrl,
        },
        s2uIntrops: { mdipS2uEnable },
        ssl: { sslReady },
        myGroserReady,
        partnerMerchants,
        financialGoal: { showFinancialGoal },
    } = getModel([
        "auth",
        "user",
        "ui",
        "misc",
        "s2uIntrops",
        "ssl",
        "myGroserReady",
        "partnerMerchants",
        "financialGoal",
    ]);

    const soleProp = cus_type === "02";

    // Property Menu - To be shown only if homeInfo -> showMayaHome flag is true in init call.
    const isPropertyEnabled = propertyMetadata?.showMayaHome ?? false;

    function handleGoToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    function handleGoToSettings() {
        if (!isOnboard) {
            handleGoToOnboard();
        } else {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD_MORE,
                [FA_ACTION_NAME]: FA_SETTINGS,
            });

            navigation.navigate("Settings");
        }
    }

    function handleGoToProfile() {
        if (!isOnboard) {
            handleGoToOnboard();
        } else {
            logEvent(FA_SELECT_QUICK_ACTION, {
                [FA_SCREEN_NAME]: FA_DASHBOARD_MORE,
                [FA_ACTION_NAME]: FA_PROFILE,
            });

            navigation.navigate(SETTINGS_MODULE, {
                screen: "Profile",
            });
        }
    }

    function handleLogout() {
        // disable temp for ui
        if (!isOnboard) {
            // go onboard
            handleGoToOnboard();
        } else {
            if (isPostLogin) {
                logEvent(FA_LOGOUT, {
                    [FA_SCREEN_NAME]: FA_DASHBOARD_MORE,
                });

                // do logout
                logoutAndRefreshToken(getModel, updateModel, navigation, setLoadingLogout);
            } else {
                // do login manually.
                updateModel({
                    ui: {
                        touchId: true,
                    },
                });
            }
        }
    }

    function layoutChanges({
        nativeEvent: {
            layout: { height },
        },
    }) {
        // 38 being the px of the space at the bottom that we need for steppers
        // added an extra 2 because I'd like to standardize the white space to 24, instead 22
        const maxHeight = (height - 38) / 4;
        setHeight(maxHeight);
    }

    const getNewNotifications = useCallback(async () => {
        if (isOnboard && isDisablePNSCall) {
            try {
                const response = await notificationCenter(`/new`, "get", false, false);

                if (response && response.data) {
                    setAlertItem((state) => [...state, "notifications"]);
                } else {
                    setAlertItem((state) => [
                        ...state.filter((alert) => alert !== "notifications"),
                    ]);
                }
            } catch (error) {
                console.tron.log(error.message);
            }
        }
    }, [isOnboard, isDisablePNSCall]);

    // const checkCampaignChances = useCallback(async () => {
    //     if (isOnboard && isCampaignPeriod) {
    //         // since no APIs to check overall new chances,
    //         // we assume it will always have the new dot
    //         setAlertItem((state) => [...state, "sortToWin"]);
    //     }
    // }, [isOnboard, isCampaignPeriod]);

    const getGoalNotifications = useCallback(async () => {
        const isGoalNotificationShown = JSON.parse(
            await AsyncStorage.getItem(GOAL_NOTIFICATION_SHOWN)
        );

        if (!isGoalNotificationShown) {
            setAlertItem((state) => [...state, "financialGoals"]);
        } else {
            setAlertItem((state) => [...state.filter((item) => item !== "financialGoals")]);
        }
    });

    // useFocusEffect(
    //     useCallback(() => {
    //         const goTo = route.params?.goTo;
    //
    //         if (goTo) {
    //             // clear the param
    //             navigation.setParams({
    //                 goTo: null,
    //             });
    //
    //             // go to screen
    //             navigation.navigate(goTo.screen, goTo.params);
    //         }
    //         return () => {};
    //     }, [route, navigation])
    // );

    useFocusEffect(
        useCallback(() => {
            async function checkActionItem() {
                try {
                    await getNewNotifications();
                    await getGoalNotifications();
                    // await checkCampaignChances()
                } catch {}
            }

            checkActionItem();

            return () => {};
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    useEffect(() => {
        let itemsToAdd = [];

        if (isShowSecureSwitch) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: 5,
                    item: {
                        id: "secureSwitch",
                        title: KILL_SWITCH,
                        icon: Images.menuSecureSwitch,
                        requireOnboard: true,
                        navigationTo: {
                            module: SECURE_SWITCH_STACK,
                            screen: SECURE_SWITCH_LANDING,
                            params: { fromModule: TAB, fromScreen: MORE },
                        },
                        badge: {
                            show: isSecureSwitchCampaign,
                            text: "NEW",
                        },
                    },
                },
            ];
        }

        if (myGroserReady?.code) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: isShowSecureSwitch ? 6 : 5,
                    item: {
                        id: "grocery",
                        title: GROCERY,
                        requireOnboard: true,
                        icon: icons.groceries,
                        navigationTo: {
                            module: TICKET_STACK,
                            screen: MY_GROSER_INAPP_WEBVIEW_SCREEN,
                        },
                    },
                },
            ];
        }

        if (showFinancialGoal) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: 2,
                    item: {
                        id: "financialGoals",
                        title: "Financial Goals",
                        icon: icons.financialGoals,
                        requireOnboard: true,
                        navigationTo: {
                            screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
                        },
                    },
                },
                {
                    index: isShowSecureSwitch ? 13 : 12,
                    item: {
                        id: "food",
                        title: "Food",
                        requireOnboard: false,
                        icon: icons.food,
                        navigationTo: {
                            module: FNB_MODULE,
                            screen: FNB_TAB_SCREEN,
                        },
                    },
                },
            ];
        } else {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: 2,
                    item: {
                        id: "food",
                        title: "Food",
                        requireOnboard: false,
                        icon: icons.food,
                        navigationTo: {
                            module: FNB_MODULE,
                            screen: FNB_TAB_SCREEN,
                        },
                    },
                },
            ];
        }

        //if property is enabled then articles to be moved to 2nd page
        const propertyArticlePosition = sslReady ? 6 : 7;
        if (isPropertyEnabled) {
            const menuTitle = propertyMetadata?.menuTitle ?? PROPERTY;
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: propertyArticlePosition,
                    item: {
                        id: "property",
                        title: menuTitle,
                        requireOnboard: false,
                        icon: icons.home2u,
                        navigationTo: {
                            module: BANKINGV2_MODULE,
                            screen: PROPERTY_DASHBOARD,
                        },
                    },
                },
            ];
        }

        //articles
        itemsToAdd = [
            ...itemsToAdd,
            {
                index: isPropertyEnabled ? (isShowSecureSwitch ? 14 : 13) : propertyArticlePosition,
                item: {
                    id: ARTICLES,
                    title: "Articles",
                    requireOnboard: false,
                    icon: icons.articles,
                    navigationTo: {
                        screen: "Promotions",
                        params: { article: true },
                    },
                },
            },
        ];

        if (isTapTasticReady && !soleProp) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: sslReady ? 8 : 9,
                    item: { ...festiveIcon },
                },

                {
                    index: isShowSecureSwitch ? 15 : 14,
                    item: {
                        id: "referral",
                        title: REFER_A_FRIEND,
                        icon: Images.menuReferral,
                        style: {
                            width: 36,
                            height: 36,
                        },
                        requireOnboard: true,
                        navigationTo: {
                            module: SETTINGS_MODULE,
                            screen: "Referral",
                        },
                    },
                },
                {
                    index: isShowSecureSwitch ? 16 : 15,
                    item: {
                        id: "ezyq",
                        title: EZYQ,
                        requireOnboard: false,
                        icon: Images.ezyQQuickAction,
                        navigationTo: {
                            module: BANKINGV2_MODULE,
                            screen: "EzyQ",
                        },
                    },
                },
            ];
        } else {
            if (isReferralCampaign && !soleProp) {
                itemsToAdd = [
                    ...itemsToAdd,
                    {
                        index: sslReady ? 8 : 9,
                        item: {
                            id: "referral",
                            title: REFER_A_FRIEND,
                            icon: Images.menuReferral,
                            style: {
                                width: 36,
                                height: 36,
                            },
                            requireOnboard: true,
                            navigationTo: {
                                module: SETTINGS_MODULE,
                                screen: "Referral",
                            },
                        },
                    },
                    {
                        index: 14,
                        item: {
                            id: "ezyq",
                            title: EZYQ,
                            requireOnboard: false,
                            icon: Images.ezyQQuickAction,
                            navigationTo: {
                                module: BANKINGV2_MODULE,
                                screen: "EzyQ",
                            },
                        },
                    },
                ];
            } else if (isTapTasticReady) {
                itemsToAdd = [
                    ...itemsToAdd,
                    {
                        index: sslReady ? 8 : 9,
                        item: { ...festiveIcon },
                    },
                    {
                        index: 14,
                        item: {
                            id: "ezyq",
                            title: "Maybank EzyQ",
                            requireOnboard: false,
                            icon: Images.ezyQQuickAction,
                            navigationTo: {
                                module: BANKINGV2_MODULE,
                                screen: "EzyQ",
                            },
                        },
                    },
                ];
            } else {
                itemsToAdd = [
                    ...itemsToAdd,
                    {
                        index: sslReady ? 8 : 9,
                        item: {
                            id: "ezyq",
                            title: "Maybank EzyQ",
                            requireOnboard: false,
                            icon: Images.ezyQQuickAction,
                            navigationTo: {
                                module: BANKINGV2_MODULE,
                                screen: "EzyQ",
                            },
                        },
                    },
                ];
            }
        }

        if (sslReady) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: 5,
                    item: {
                        id: "samaSamaLokal",
                        title: "Sama-Sama Lokal",
                        requireOnboard: true,
                        icon: Images.SSLIconColor,
                        navigationTo: {
                            module: SSL_STACK,
                            screen: SSL_START,
                        },
                    },
                },
            ];
        }

        if (mdipS2uEnable) {
            itemsToAdd = [
                ...itemsToAdd,
                {
                    index: 9,
                    item: {
                        id: "secure2u",
                        title: "Secure2u",
                        icon: Images.quickActionS2u,
                        requireOnboard: true,
                        navigationTo: {
                            screen: "SecureTAC",
                        },
                    },
                },
            ];
        }

        const menuList = getMenuPage(itemsToAdd, getModel);
        setMenus(menuList);
    }, [
        isCampaignPeriod,
        isReferralCampaign,
        mdipS2uEnable,
        gameMetadata,
        getModel,
        isTapTasticReady,
        sslReady,
        propertyMetadata,
        partnerMerchants,
        festiveIcon,
    ]);

    return (
        <ScreenContainer
            backgroundType="color"
            analyticScreenName={FA_DASHBOARD_MORE}
            showOverlay={false}
        >
            <React.Fragment>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                >
                    <>
                        <Header
                            profileName={fullName}
                            profileImage={profileImage}
                            handleGoToSettings={handleGoToSettings}
                            handleGoToProfile={handleGoToProfile}
                            handleLogout={handleLogout}
                            isPostLogin={isPostLogin}
                            loading={loadingLogout}
                        />

                        <View style={styles.menuContainer} onLayout={layoutChanges}>
                            {/*
                                TODO: since only got enough item for one page,
                                no use for Swiper anymore so can replace with regular container
                            */}

                            {!!menuItems.length && itemHeight > 0 && (
                                <Swiper
                                    ref={swiperRef}
                                    loop={false}
                                    paginationStyle={styles.menuSwiper}
                                    dot={<View style={styles.swiperDot} />}
                                    activeDot={
                                        <Animatable.View
                                            animation="bounceIn"
                                            duration={750}
                                            style={styles.swiperDotActive}
                                        />
                                    }
                                >
                                    {menus.map((page) =>
                                        page.map((row, rowIndex) => (
                                            <View key={`${rowIndex}`} style={styles.swiperRow}>
                                                {row.map((item, index) => (
                                                    <MenuItem
                                                        key={`${item.id}-${item.title}`}
                                                        index={index}
                                                        height={itemHeight}
                                                        isAlert={alertItem.indexOf(item.id) > -1}
                                                        badge={item.badge}
                                                        navigation={navigation}
                                                        isOnboard={isOnboard}
                                                        {...item}
                                                    />
                                                ))}
                                            </View>
                                        ))
                                    )}
                                </Swiper>
                            )}
                        </View>
                    </>
                </ScreenLayout>
            </React.Fragment>
        </ScreenContainer>
    );
}

MenuScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default React.memo(MenuScreen);

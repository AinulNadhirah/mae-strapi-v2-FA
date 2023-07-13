// @ts-check
import { RNRemoteMessage } from "@hmscore/react-native-hms-push";
import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, SectionList, TouchableOpacity, Animated } from "react-native";
import * as Anime from "react-native-animatable";
import { SwipeRow } from "react-native-swipe-list-view";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Shimmer from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showInfoToast, hideToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import { notificationCenter, notificationCenterMBPNS, getEngageInitAPI } from "@services";
import ApiManager from "@services/ApiManager";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";
import { createLocalNotification } from "@services/pushNotifications";

import {
    RED,
    YELLOW,
    WHITE,
    MEDIUM_GREY,
    DARK_GREY,
    GREY_200,
    BLACK,
    DUSTY_GRAY,
    GREY,
} from "@constants/colors";
import { FA_SETTINGS_NOTIFICATIONS } from "@constants/strings";

import { generateHaptic } from "@utils";
import { isPureHuawei } from "@utils/checkHMSAvailability";
import { contactBankcall } from "@utils/dataModel/utility";
import useFestive from "@utils/useFestive";

import assets from "@assets";

const FIRST_TIME_TITLE = `Welcome to Notifications`;
const FIRST_TIME_DESC = `Notifications is where you view all your important alerts in one place.\nScroll back and check on anything you might have missed here.`;

// colors
const TIMESTAMP_GREY = "#7f7f7f";
const NOTIFICATION_BORDER_GREY = "#e1e1e1";

// utils
const convertDateToTitle = (date) => {
    if (date) {
        const momentDate = moment(date, "DD MMM YYYY");
        return moment(momentDate).calendar(null, {
            sameDay: "[Today]",
            lastDay: "[Yesterday]",
            lastWeek: "DD MMM YYYY",
            sameElse: "DD MMM YYYY",
        });
    }

    return "";
};

function id() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return "_" + Math.random().toString(36).substr(2, 9);
}

function extractKey(item: { id: string | number }) {
    return item.id;
}

const welcomeMessage = {
    message:
        "Welcome to the MAE app. View your important notifications here to stay on top of your activities.",
    title: "Home",
    id: -1,
    seen: false,
    refId: null,
    module: "HOME",
};

function RedDot() {
    return (
        <View>
            <Anime.View
                animation="zoomIn"
                duration={200}
                delay={200}
                useNativeDriver
                style={styles.redDot}
            />
        </View>
    );
}

function TabContent({ selectedTab, children }) {
    const mapped = React.Children.map(children, (element) => {
        if (!React.isValidElement(element)) return null;

        const { id } = element.props;

        return {
            ...element,
            props: {
                ...element.props,
                visible: id === selectedTab,
            },
        };
    });

    return <View style={styles.tabContentContainer}>{mapped}</View>;
}

TabContent.propTypes = {
    children: PropTypes.node,
    selectedTab: PropTypes.string,
};

function TabContentItem({ children, visible = false }) {
    return (
        <Anime.View
            animation={{
                from: {
                    opacity: visible ? 0 : 1,
                },
                to: {
                    opacity: visible ? 1 : 0,
                },
            }}
            duration={300}
            style={[styles.tabContentItem, visible && styles.tabContentItemVisible]}
            useNativeDriver
        >
            {children}
        </Anime.View>
    );
}

TabContentItem.propTypes = {
    children: PropTypes.node,
    visible: PropTypes.bool,
};

function TabHeaderItem({
    title,
    value,
    isSelected,
    onPress,
    onMount,
    postComponent = null,
    isForcePress,
}) {
    const [itemSize, setSize] = useState(0);

    const handlePress = useCallback(() => {
        onPress(value, { width: itemSize.width, x: itemSize.x });
    }, [itemSize.width, itemSize.x, onPress, value]);

    function onLayout({
        nativeEvent: {
            layout: { x, width },
        },
    }) {
        setSize({
            width: Math.ceil(width - 20),
            x: Math.floor(x),
        });
        onMount(value, {
            width: Math.ceil(width - 20),
            x: Math.floor(x),
        });
    }

    // disabled, because we only have 1 tab and isForcePress based on state TabHeader
    // Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render
    // useEffect(() => {
    //     if (isForcePress) {
    //         handlePress();
    //     }
    // }, [handlePress, isForcePress]);

    return (
        <View style={styles.tabItemContainer} onLayout={onLayout}>
            <TouchableOpacity
                style={styles.tabHeaderItemTouchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Typo
                    fontSize={14}
                    fontWeight={isSelected ? "600" : "normal"}
                    lineHeight={23}
                    color={isSelected ? BLACK : DARK_GREY}
                    text={title}
                />
                {postComponent}
            </TouchableOpacity>
        </View>
    );
}

TabHeaderItem.propTypes = {
    isSelected: PropTypes.bool,
    isForcePress: PropTypes.bool,
    onMount: PropTypes.func,
    onPress: PropTypes.func,
    title: PropTypes.string,
    value: PropTypes.string,
    postComponent: PropTypes.element,
};

function TabHeader({ items, selectedValue, onTabChange, forceTabChange }) {
    const [haveSetInitial, setInitial] = useState(false);
    const selectedBorder = useRef(new Animated.Value(24));
    const selectedBorderWidth = useRef(new Animated.Value(0));

    function animate(offset, width) {
        if (!isNaN(offset)) {
            Animated.spring(selectedBorder.current, {
                // toValue: offset + 12,
                toValue: offset <= 12 ? offset + 12 : offset + 10,
                velocity: 3,
                useNativeDriver: true,
            }).start();
        }

        if (!isNaN(width)) {
            Animated.timing(selectedBorderWidth.current, {
                toValue: width,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }

    function handleOnPress(value, itemSize) {
        onTabChange(value);
        animate(itemSize.x, itemSize.width);
    }

    function handleMountLayout(value, itemSize) {
        if (!haveSetInitial && value === selectedValue) {
            setInitial(true);
            selectedBorder.current.setValue(itemSize.x + 12);
            selectedBorderWidth.current.setValue(itemSize.width);
        }
    }

    return (
        <View style={styles.tabHeaderContainer}>
            <View style={styles.tabHeaderItemContainer}>
                {items.map((item) => (
                    <TabHeaderItem
                        key={item.value}
                        title={item.title}
                        value={item.value}
                        postComponent={item.postComponent}
                        isSelected={selectedValue === item.value}
                        onPress={handleOnPress}
                        isForcePress={forceTabChange === item.value}
                        onMount={handleMountLayout}
                    />
                ))}
            </View>
            <View style={styles.tabHeaderSelectedContainer}>
                <Animated.View
                    style={{
                        width: selectedBorderWidth.current,
                    }}
                >
                    <Animated.View
                        style={[
                            styles.tabHeaderSelectedBorder,
                            {
                                transform: [
                                    {
                                        translateX: selectedBorder.current,
                                    },
                                ],
                            },
                        ]}
                    />
                </Animated.View>
            </View>
        </View>
    );
}

TabHeader.propTypes = {
    items: PropTypes.array,
    onTabChange: PropTypes.func,
    selectedValue: PropTypes.string,
    forceTabChange: PropTypes.string,
};

function NoMoreNotification({ visible }) {
    return (
        <View style={styles.endOfNotificationContainer}>
            {visible && (
                <>
                    <Anime.View animation="fadeInUp" style={styles.endOfNotificationIconContainer}>
                        <Image source={assets.allDoneCheck} style={styles.endOfNotificationIcon} />
                    </Anime.View>
                    <Anime.View animation="fadeInUp" delay={300}>
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            color={DUSTY_GRAY}
                            text="You're all caught up for now."
                        />
                    </Anime.View>
                </>
            )}
        </View>
    );
}

NoMoreNotification.propTypes = {
    visible: PropTypes.bool,
};

const CategoryRibbon = () => (
    <View
        style={[
            styles.ribbon,
            {
                backgroundColor: YELLOW,
            },
        ]}
    />
);

CategoryRibbon.propTypes = {
    module: PropTypes.string,
};

const SubHeader = ({ title = "" }) => (
    <View style={styles.subHeader}>
        <Typo fontSize={12} fontWeight="600" text={title} />
    </View>
);

SubHeader.propTypes = {
    title: PropTypes.string,
};

const Row = ({
    isSwipeable,
    setRef,
    onRowPress,
    onRowOpen,
    onRowClose,
    onSwipeValueChange,
    swipeKey,
    children,
}) => {
    if (isSwipeable)
        return (
            <SwipeRow
                ref={setRef}
                onRowPress={onRowPress}
                onRowOpen={onRowOpen}
                onRowClose={onRowClose}
                onSwipeValueChange={onSwipeValueChange}
                disableRightSwipe
                rightOpenValue={-90}
                friction={8}
                swipeKey={swipeKey}
            >
                {children}
            </SwipeRow>
        );

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onRowPress}>
            {children}
        </TouchableOpacity>
    );
};

Row.propTypes = {
    children: PropTypes.node,
    isSwipeable: PropTypes.bool,
    onRowClose: PropTypes.func,
    onRowOpen: PropTypes.func,
    onRowPress: PropTypes.func,
    onSwipeValueChange: PropTypes.func,
    setRef: PropTypes.func,
    swipeKey: PropTypes.string,
};

const Notification = ({
    isSwipeable = false,
    handleNavigation,
    handleDeleteNotification,
    handleRowOpened,
    handleRowClosed,
    handleOnSwipe,
    message,
    title,
    msgTitle,
    id,
    refId,
    seen,
    module,
    formattedTime,
    payload,
    setSwiperRef,
    swipeAnimatedValue,
    subModule,
    limitDescriptionLineNo = 0,
    isPromo,
}) => {
    function handleRowPress() {
        handleNavigation({
            message,
            title,
            id,
            refId: isPromo ? 1 : refId,
            seen,
            module,
            formattedTime,
            payload,
            subModule,
            isPromo,
        });
    }

    function handleDelete() {
        typeof handleDeleteNotification === "function" && handleDeleteNotification(id);
    }

    function setRef(ref) {
        setSwiperRef(ref, id);
    }

    function handleSwipeOpen() {
        typeof handleRowOpened === "function" && handleRowOpened(id);
    }

    function handleSwipeClose() {
        typeof handleRowClosed === "function" && handleRowClosed(id);
    }

    function handleSwipeChange(value) {
        typeof handleOnSwipe === "function" && handleOnSwipe(value);
    }

    return (
        <Row
            isSwipeable={isSwipeable}
            setRef={setRef}
            onRowPress={handleRowPress}
            onRowOpen={handleSwipeOpen}
            onRowClose={handleSwipeClose}
            onSwipeValueChange={handleSwipeChange}
            disableRightSwipe
            swipeKey={`${id}`}
        >
            {isSwipeable && (
                <Animated.View
                    style={[
                        styles.notificationSwipeRow,
                        {
                            transform: [
                                {
                                    scale: swipeAnimatedValue
                                        ? swipeAnimatedValue.interpolate({
                                              inputRange: [45, 90],
                                              outputRange: [0, 1],
                                              extrapolate: "clamp",
                                          })
                                        : 1,
                                },
                            ],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.notificationDeleteButton}
                        onPress={handleDelete}
                    >
                        <Animated.View style={styles.whiteThrash}>
                            <Image
                                resizeMode="contain"
                                style={styles.whiteThrash}
                                source={assets.whiteTrash}
                            />
                        </Animated.View>
                        <Typo text="Remove" lineHeight={19} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}
            <View style={styles.notificationItemContainer}>
                <View style={styles.seenContainer}>
                    {!isPromo && !seen && (
                        <SpaceFiller width={6} height={6} borderRadius={3} backgroundColor={RED} />
                    )}
                </View>

                <View style={styles.notificationItemTopRow}>
                    <View style={styles.notificationItemTopRow}>
                        {!isPromo && <CategoryRibbon module={module} />}
                        <View style={!isPromo ? styles.notificationItemTitle : null}>
                            <Typo
                                textAlign="left"
                                fontSize={12}
                                fontWeight="600"
                                text={msgTitle || title}
                                numberOfLines={1}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.notificationItemBottomRow}>
                    <View
                        style={
                            !isPromo
                                ? styles.notificationItemMessage
                                : styles.notificationPromoItemMessage
                        }
                    >
                        <Typo
                            textAlign="left"
                            fontSize={12}
                            lineHeight={18}
                            text={`${message}`}
                            numberOfLines={
                                limitDescriptionLineNo > 0 ? limitDescriptionLineNo : null
                            }
                        />
                    </View>
                    {!isPromo && (
                        <View style={styles.notificationItemTimestamp}>
                            <Typo
                                textAlign="right"
                                fontSize={11}
                                lineHeight={18}
                                text={formattedTime}
                                color={TIMESTAMP_GREY}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Row>
    );
};

Notification.propTypes = {
    formattedTime: PropTypes.string,
    handleDeleteNotification: PropTypes.func,
    handleNavigation: PropTypes.func,
    handleOnSwipe: PropTypes.func,
    handleRowClosed: PropTypes.func,
    handleRowOpened: PropTypes.func,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isPromo: PropTypes.bool,
    isSwipeable: PropTypes.bool,
    limitDescriptionLineNo: PropTypes.number,
    message: PropTypes.string,
    module: PropTypes.string,
    msgTitle: PropTypes.string,
    payload: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    refId: PropTypes.number,
    seen: PropTypes.bool,
    setSwiperRef: PropTypes.func,
    subModule: PropTypes.string,
    swipeAnimatedValue: PropTypes.object,
    title: PropTypes.string,
};

const NotificationRowLoader = () => (
    <View>
        <View style={styles.subHeader}>
            <Shimmer autoRun style={styles.loaderDate} />
        </View>
        <View style={styles.notificationItemContainer}>
            <View style={styles.loaderTitleContainer}>
                <Shimmer autoRun style={styles.loaderTitle} />
            </View>
            <View style={styles.loaderDescParagraph}>
                <Shimmer autoRun style={styles.loaderDesc} />
            </View>
            <View>
                <Shimmer autoRun style={styles.loaderDescTwo} />
            </View>
        </View>
    </View>
);

const EmptyNotification = ({ loading }) => {
    if (loading) {
        return (
            <>
                <NotificationRowLoader />
                <NotificationRowLoader />
                <NotificationRowLoader />
            </>
        );
    }

    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyContainerInner}>
                <View>
                    <Typo text="No Notifications" fontSize={18} lineHeight={32} fontWeight="bold" />
                    <View style={styles.emptyContainerText}>
                        <Typo
                            text="No notifications to show here. Interact with the app more and come back for new updates."
                            fontSize={12}
                            lineHeight={18}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

EmptyNotification.propTypes = {
    loading: PropTypes.bool,
};

const FirstTimePopup = ({ handleClose }) => (
    <Popup
        visible
        onClose={handleClose}
        title={FIRST_TIME_TITLE}
        description={FIRST_TIME_DESC}
        primaryAction={{
            text: "Got It",
            onPress: handleClose,
        }}
    />
);

FirstTimePopup.propTypes = {
    handleClose: PropTypes.func,
};

export function navigateCta(ctaMapped, navigation) {
    if (ctaMapped?.module) {
        if (ctaMapped?.screen) {
            navigation.navigate(ctaMapped.module, {
                screen: ctaMapped.screen,
                params: ctaMapped?.params,
            });
        } else {
            navigation.navigate(ctaMapped.module, {
                ...ctaMapped?.params,
            });
        }
    }
}

export function notificationController({ data }, updateContext, getModel, appState) {
    if (data?.notif_title && data?.notif_title === "Maybank2u: Card Transaction") {
        const btsData = JSON.parse(data.bts.replace(/\\/g, ""));

        //Navigate to Virtual Receipt detail screen
        notificationNavigationController(
            "VR_INIT",
            1,
            "VR",
            btsData,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (data?.notif_title && data?.type === "S2uCooling") {
        notificationNavigationController(
            data?.notif_title,
            1,
            "S2U_PUSH",
            data,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (data?.notif_title && data?.type === "Campaign") {
        let module = data?.module;
        console.log("data = ", data);
        if (module !== "GAME") {
            module = "CAMPAIGN_CHANCES";
            const notification = {
                ...data,
                module: "GAME",
            };
            const huaweiPayload = new RNRemoteMessage({
                ChannelId: null,
                Sound: "default",
                data: JSON.stringify(notification),
            });
            const payload = isPureHuawei ? huaweiPayload : notification;
            createLocalNotification(data?.notif_title, data?.full_desc, payload).then(() => {
                updateContext({
                    dashboard: { campaignRefresh: true },
                });
            });
        }

        if (data?.hasAnimation && JSON.parse(data?.hasAnimation)) {
            notificationNavigationController(
                data?.notif_title,
                1,
                module,
                data,
                null,
                updateContext,
                null,
                false,
                null,
                appState
            );
        }
    } else if (data?.notif_title && data?.notif_title?.indexOf("MAE Referral") > -1) {
        /**
         * MAE Referral PNS
         */

        notificationNavigationController(
            data?.notif_title,
            1,
            "REFERRAL",
            data,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (data?.notif_title && data?.module === "SENDMONEYCAMPAIGN") {
        notificationNavigationController(
            data?.notif_title,
            1,
            "SENDMONEYCAMPAIGN",
            data,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (data?.notif_title && data?.notif_title?.indexOf("ATM Cash-out") > -1) {
        /**
         * ATM Cash-out
         */

        notificationNavigationController(
            data?.notif_title,
            1,
            "CASHOUT",
            data,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (data?.type && data?.type === "trns" && data?.template_id.toString() === "0") {
        //s2u notification
        console.log("index----notificationController");
        const { m2uLogin, touchId, notificationControllerNavigation } = getModel("ui");
        if (m2uLogin || touchId) {
            ApiManager.callQueue("login cancelled");
            updateContext(
                {
                    ui: {
                        sessionTimeoutPopup: false,
                        isSessionTimeout: false,
                        touchId: false,
                        m2uLogin: false,
                    },
                    auth: {
                        fallBack: false,
                    },
                },
                () => {
                    this.delay = setTimeout(() => {
                        notificationNavigationController(
                            "S2U Push",
                            1,
                            "S2U_PUSH",
                            data,
                            null,
                            updateContext,
                            null,
                            false,
                            null,
                            appState
                        );
                    }, 0);
                }
            );
        } else {
            updateContext(
                {
                    ui: {
                        sessionTimeoutPopup: false,
                        isSessionTimeout: false,
                    },
                },
                () => {
                    notificationNavigationController(
                        "S2U Push",
                        1,
                        "S2U_PUSH",
                        data,
                        null,
                        updateContext,
                        null,
                        false,
                        null,
                        appState
                    );
                }
            );
        }
    } else if (
        data?.module === "ASB_LOAN" &&
        [
            "RESUME_DOC_UPLOAD",
            "RESUME_APPLICATION",
            "APPROVE_APPLICATION",
            "DISBURSTMENT_APPLICATION",
        ].includes(data?.subModule)
    ) {
        const { notif_title, refId, module, subModule } = data;
        notificationNavigationController(
            notif_title,
            refId,
            module,
            data,
            null,
            updateContext,
            subModule,
            false,
            null,
            appState
        );
    } else if (data?.notif_title && data?.module === "CARD_RENEWAL") {
        /**
         * MAE Card Renewal PNS
         */

        notificationNavigationController(
            data?.notif_title,
            1,
            "CARD_RENEWAL",
            data,
            null,
            updateContext,
            null,
            false,
            null,
            appState
        );
    } else if (!data?.title && !data?.module && !data?.subModule) {
        // if doesn't have field "title" in the data, we know its not coming from MAYA,
        // so we treat it as from MBPNS, excluding VR which handled earlier

        const { isTokenLoaded } = getModel("pushNotification");
        /*
            Marketing push structure change
            Before Token load the marketing pushnotification page
         */
        if (!isTokenLoaded) {
            updateContext({
                pushNotification: { isMarketingPush: true, marketingData: data, ctaData: {} },
            });
        } else {
            updateContext({
                pushNotification: { isMarketingPush: false, marketingData: {}, ctaData: {} },
            });

            notificationNavigationController(
                "",
                1,
                "MBPNS_PROMOTION",
                data,
                null,
                updateContext,
                null,
                false,
                null,
                appState
            );
        }
    } else {
        // other notification that is not MBPNS
        const {
            title,
            refId,
            module,
            subModule,
            // payload,
        } = data;

        notificationNavigationController(
            title,
            refId,
            module,
            data,
            null,
            updateContext,
            subModule,
            false,
            null,
            appState
        );
    }
}
const moduleHasNavigation = [
    "GOAL",
    "BILL",
    "SEND_RCV",
    "SEND_RCV_PAST",
    "VR",
    "S2U_PUSH",
    "MBPNS_PROMOTION",
    "PROPERTY",
    "SENDMONEYCAMPAIGN",
    "REFERRAL",
    "CASHOUT",
    "CARD_RENEWAL",
];

function getStackByModule(
    module: String,
    title: String,
    refId: Number,
    data: String | Object,
    subModule: String,
    isFromNotifCentre: Boolean,
    message: String
) {
    switch (module) {
        case "CAMPAIGN_CHANCES": {
            return {
                stack: navigationConstant.TAB_NAVIGATOR,
                screen: "CampaignChancesEarned",
                params: {
                    refId,
                    data,
                },
            };
        }
        case "GAME": {
            return {
                stack: "GameStack",
                screen: "TapTrackWin",
                params: {
                    tab: "trackers",
                },
            };
        }
        case "GOAL": {
            return {
                stack: navigationConstant.TABUNG_STACK,
                screen: navigationConstant.TABUNG_LANDING_SCREEN,
                params: {
                    title,
                    refId,
                    module,
                },
            };
        }
        case "BILL": {
            return {
                stack: navigationConstant.BANKINGV2_MODULE,
                screen: "SBLanding",
                params: {
                    title,
                    refId,
                    module,
                },
            };
        }
        case "SEND_RCV":
        case "SEND_RCV_PAST": {
            return {
                stack: navigationConstant.SEND_REQUEST_MONEY_STACK,
                screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                params: {
                    refId,
                    module,
                    subModule,
                    data,
                },
            };
        }
        case "VR": {
            return {
                stack: navigationConstant.VIRTUAL_RECEIPT_STACK,
                screen: navigationConstant.RECEIPT_DETAIL_SCREEN,
                params: {
                    data: title === "VR_INIT" ? data : JSON.parse(data.replace(/\\/g, "")),
                },
            };
        }
        case "S2U_PUSH": {
            if (data?.txnRefNo?.indexOf("_t") > -1 && data?.txnRefNo?.indexOf("_t2") === -1) {
                return {
                    stack: navigationConstant.ONE_TAP_AUTH_MODULE,
                    screen: navigationConstant.SECURE2U_SUCCESS,
                };
            } else if (
                data?.txnRefNo?.indexOf("_t2") > -1 ||
                data?.txnRefNo?.indexOf("_Sch") === -1
            ) {
                return {
                    stack: navigationConstant.TAB_NAVIGATOR,
                    screen: navigationConstant.TAB,
                    params: {
                        screen: "Dashboard",
                        params: {
                            screen: "Notifications",
                            params: {
                                selectedTab: "activities",
                            },
                        },
                    },
                };
            } else {
                return {
                    stack: navigationConstant.SECURE2U_PUSH_STACK,
                    screen: navigationConstant.SECURE2U_DETAIL_SCREEN,
                    params: {
                        pushData: data,
                    },
                };
            }
        }
        case "MBPNS_PROMOTION": {
            return {
                stack: navigationConstant.TAB_NAVIGATOR,
                screen: "ExternalPnsPromotion",
                params: {
                    data,
                    moduleFrom: "Notification",
                },
            };
        }
        case "PROPERTY": {
            const dataTemp = { msg: message };
            return {
                stack: navigationConstant.BANKINGV2_MODULE,
                screen: navigationConstant.PROPERTY_NOTIFICATION_LANDING,
                params: {
                    refId,
                    subModule,
                    data: data ?? dataTemp,
                },
            };
        }
        case "SENDMONEYCAMPAIGN": {
            return {
                stack: navigationConstant.DASHBOARD_STACK,
                screen: "Dashboard",
                params: {
                    screen: "SendGreetingsReceived",
                    params: {
                        refId, // notification ID
                        data,
                        routeFrom: "SendGreetingsReceived",
                    },
                },
            };
        }
        case "REFERRAL": {
            /**
             * WIP
             * No info about the payload, or module and how will it
             * look like so for now we just gonna use good ol' string matching
             *
             * if title is "MAE Referral Reward",
             *      if body contained "Activate your MAE account now"
             *          if from PNS
             *              go to notification center
             *          else
             *              go to maybank -> accounts
             *      else if body contained "Perform your first monetary"
             *          go to notification center
             *      else go to transaction history
             * else if title is only "MAE Referral", going to notification center
             */
            // we gotta parse the payload if in notification center
            const payloadString = isFromNotifCentre
                ? data.substr(data.indexOf("("), data.indexOf(")"))
                : data;
            const message = isFromNotifCentre
                ? payloadString
                      .substr(
                          payloadString.indexOf("msg"),
                          payloadString.indexOf(" collapseKey") - 1
                      )
                      .replace("msg=", "")
                : data?.full_desc;

            console.tron.log("message", message);

            if (title === "MAE Referral Reward") {
                if (message.indexOf("Activate your MAE account now") > -1) {
                    if (isFromNotifCentre) {
                        return {
                            stack: navigationConstant.TAB_NAVIGATOR,
                            screen: navigationConstant.TAB,
                            params: {
                                screen: "Maybank2u",
                            },
                        };
                    } else {
                        return {
                            stack: navigationConstant.TAB_NAVIGATOR,
                            screen: navigationConstant.TAB,
                            params: {
                                screen: "Dashboard",
                                params: {
                                    screen: "Notifications",
                                    params: {
                                        selectedTab: "activities",
                                    },
                                },
                            },
                        };
                    }
                } else if (
                    message.indexOf("Perform your first monetary") > -1 ||
                    message.indexOf("You've received RM") > -1
                ) {
                    console.tron.log(
                        message.indexOf() > -1
                            ? "You've received RM"
                            : "Perform your first monetary"
                    );
                    return {
                        stack: navigationConstant.TAB_NAVIGATOR,
                        screen: navigationConstant.TAB,
                        params: {
                            screen: "Dashboard",
                            params: {
                                screen: "Notifications",
                                params: {
                                    selectedTab: "activities",
                                },
                            },
                        },
                    };
                    // } else {
                    // console.tron.log("go to gateway");
                    // // go to gateway and get the mae account
                    // return {
                    //     stack: navigationConstant.BANKINGV2_MODULE,
                    //     screen: navigationConstant.GATEWAY_SCREEN,
                    //     params: {
                    //         action: "REFERRAL_MAE_TRX_HISTORY",
                    //     },
                    // };
                }
            } else if (title === "MAE Referral") {
                console.tron.log('title === "MAE Referral"');
                return {
                    stack: navigationConstant.TAB_NAVIGATOR,
                    screen: navigationConstant.TAB,
                    params: {
                        screen: "Dashboard",
                        params: {
                            screen: "Notifications",
                            params: {
                                selectedTab: "activities",
                            },
                        },
                    },
                };
            }

            // if doeasn't fit anything.
            return {
                stack: navigationConstant.TAB_NAVIGATOR,
                screen: navigationConstant.TAB,
                params: {
                    screen: "Dashboard",
                    params: {
                        screen: "Notifications",
                        params: {
                            selectedTab: "activities",
                        },
                    },
                },
            };
        }
        case "CASHOUT": {
            /**
             * WIP
             * No info about the payload, or module and how will it
             * look like so for now we just gonna use good ol' string matching
             *
             * if title is "MAE Referral Reward",
             *      if body contained "Activate your MAE account now"
             *          if from PNS
             *              go to notification center
             *          else
             *              go to maybank -> accounts
             *      else if body contained "Perform your first monetary"
             *          go to notification center
             *      else go to transaction history
             * else if title is only "MAE Referral", going to notification center
             */
            // we gotta parse the payload if in notification center
            const payloadString = isFromNotifCentre
                ? data.substr(data.indexOf("("), data.indexOf(")"))
                : data;
            const message = isFromNotifCentre
                ? payloadString
                      .substr(
                          payloadString.indexOf("msg"),
                          payloadString.indexOf(" collapseKey") - 1
                      )
                      .replace("msg=", "")
                : data?.full_desc;

            console.tron.log("message", message);
            /*
            if (title.includes("ATM Cash-out")) {
                console.tron.log('title === "ATM Cash-out"');
                const is24HrCompleted =
                    message.includes(
                        "You have successfully created a preferred ATM cash-out amount"
                    ) || message.includes("Your ATM cash-out is now activated")
                        ? true
                        : false;

                const screenData = {
                    screen: navigationConstant.ATM_PREFERRED_AMOUNT,
                    params: { is24HrCompleted: is24HrCompleted, fromPNS: true },
                };

                // message.includes("You have successfully withdrawn ")
                //     ? {
                //           screen: navigationConstant.ATM_SHARE_RECEIPT,
                //           params: { trxId: refId, fromPNS: true },
                //       }
                //     : ;
                return {
                    stack: navigationConstant.ATM_CASHOUT_STACK,
                    screen: screenData?.screen,
                    params: screenData?.params,
                };
            }
            */

            // if doeasn't fit anything.
            return {
                stack: navigationConstant.TAB_NAVIGATOR,
                screen: navigationConstant.TAB,
                params: {
                    screen: "Dashboard",
                    params: {
                        screen: "Notifications",
                        params: {
                            selectedTab: "activities",
                        },
                    },
                },
            };
        }
        case "ASB_LOAN": {
            if (subModule === "RESUME_DOC_UPLOAD" || subModule === "RESUME_APPLICATION") {
                return {
                    stack: navigationConstant.MAE_MODULE_STACK,
                    screen: navigationConstant.MAE_ACC_DASHBOARD,
                    params: {
                        index: 3,
                        isNotificationResume: true,
                    },
                };
            } else if (subModule === "APPROVE_APPLICATION") {
                return {
                    stack: navigationConstant.ASB_STACK,
                    screen: navigationConstant.APPROVEDFINANCEDETAILS,
                };
            } else if (subModule === "DISBURSTMENT_APPLICATION") {
                return {
                    stack: navigationConstant.TAB_NAVIGATOR,
                    screen: navigationConstant.TAB,
                    params: {
                        screen: "Maybank2u",
                        params: {
                            index: 3,
                        },
                    },
                };
            }
        }
        case "CARD_RENEWAL":
            return {
                stack: navigationConstant.BANKINGV2_MODULE,
                screen: navigationConstant.MAE_CARDDETAILS,
                params: {
                    reload: true,
                    redirectFrom: "PUSH_NOTIFICATION",
                },
            };
        /**
         * When module are not part of the above, we direct them to notification center.
         * the tab always gonna be activities because the first tab will always
         * be for promotion, which will not go into notification center
         */
        default: {
            return {
                stack: navigationConstant.TAB_NAVIGATOR,
                screen: navigationConstant.TAB,
                params: {
                    screen: "Dashboard",
                    params: {
                        screen: "Notifications",
                        params: {
                            selectedTab: "activities",
                        },
                    },
                },
            };
        }
    }
}

/**
 * Notification Navigation controller which decided to which module to go. May be used for push notification handler.
 * @param {String} title The notification title. In some cases unfortunately we need to use the string to determine the path to chose
 * @param {Number} refId The reference ID of interest for data fetching. It could be the goals Id, transaction Id etc
 * @param {String} module The module related to this notification
 * @param {Object} data The data object passed in the payload of the notification (if any)
 * @param {Object} navigation The navigation object. Default navigation service
 * @param {Function} updateContext The update model context function, only needed when its coming from notification listener
 * @param {Boolean} isFromNotifCentre Whether this navigation coming from notification center or from other places eg PNS
 */
const notificationNavigationController = async (
    title,
    refId,
    module,
    data,
    navigation = NavigationService,
    updateContext = null,
    subModule = null,
    isFromNotifCentre = false,
    message,
    appState
) => {
    const nav = navigation;

    if (refId) {
        const stackObj = getStackByModule(
            module,
            title,
            refId,
            data,
            subModule,
            isFromNotifCentre,
            message
        );

        if (updateContext && typeof updateContext === "function") {
            /**
             * AS were used to get the value of onboard, because the value might not be ready/updated in context
             * when the app was open from cold start and we only wanna handle notification listener only if they're onboard
             */
            const isOnboardCompleted = await AsyncStorage.getItem("isOnboardCompleted");

            if (isOnboardCompleted) {
                updateContext({
                    ui: {
                        notificationControllerNavigation: { ...stackObj, appState },
                    },
                });
            }
        } else {
            nav.navigate(stackObj.stack, {
                screen: stackObj.screen,
                params: stackObj.params,
            });
        }
    } else {
        const stackObj = getStackByModule(null);
        if (updateContext && typeof updateContext === "function") {
            updateContext({
                ui: {
                    notificationControllerNavigation: { ...stackObj, appState },
                },
            });
        } else {
            nav.navigate(stackObj.stack, {
                screen: stackObj.screen,
                params: stackObj.params,
            });
        }
    }
};

const INITIAL_STATE = {
    loadMore: true,
    stopLoadMore: true,
    stopLoadMorePromo: true,
    showWelcomeMessage: false,
    notifications: [],
    promoNotifications: [],
    openedRow: [],
    promoOpenedRow: [],
    lastDate: null,
    lastDatePromo: null,
    pageSize: 20,
    pageIndex: 0,
    promoPageSize: 20,
    promoPageIndex: 0,
    showTopMenu: false,
    selectedTab: "activities",
    // selectedTab: "new",
};

const INITIAL_TAB = [
    // {
    //     title: `WHAT'S NEW`,
    //     value: "new",
    // },
    {
        title: `ACTIVITIES`,
        value: "activities",
    },
];

const topMenus = [
    {
        menuLabel: "Report Activity",
        menuParam: "report",
    },
];

function NotificationCenter({ navigation, route, getModel, updateModel }) {
    const [state, setState] = useState(INITIAL_STATE);
    const [tabHeaderItems, setTabItems] = useState(INITIAL_TAB);
    const swipeRowRef = useRef({});
    const rowSwipeAnimatedRef = useRef({});

    // to keep track fo the notification list and use within the timer,
    // since the reference will be made to the state when this called
    // has been made, likely to be empty array
    const notificationsListRef = useRef([]);
    const timer = useRef(null);
    const { isOnboard } = getModel("user");

    const { isNotificationVisited, isDisablePNSCall, inboxUrl } = getModel("misc");

    const startSeenTimer = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            if (notificationsListRef.current?.length) handleMarkAsSeen();
        }, 5000);
    }, [handleMarkAsSeen]);

    const getPromotionNotifications = useCallback(
        async (pageIndex) => {
            setState((prev) => ({
                ...prev,
                loadMore: true,
                promoPageIndex: pageIndex,
            }));

            try {
                const request = await notificationCenter(
                    `/promotions/map?page=${pageIndex}&pageSize=${state.promoPageSize}`,
                    "get",
                    false,
                    false
                );

                if (request.data) {
                    const { resultList, resultCount } = request.data;
                    let formattedNotifications = [];
                    let existingNotifications = [...state.promoNotifications];

                    // transform the data into format that we need
                    if (resultList.length) {
                        const existingDate = resultList.find(
                            (section) => convertDateToTitle(section.date) === state.lastDatePromo
                        );
                        const notInExistingDate = resultList.filter(
                            (section) => convertDateToTitle(section.date) !== state.lastDatePromo
                        );

                        if (existingDate) {
                            // merged it with existing
                            const dateInNotificationIndex = existingNotifications.findIndex(
                                (n) => n.title === state.lastDatePromo
                            );

                            if (dateInNotificationIndex > -1) {
                                // append new notification into it
                                const data = existingDate.notifications.map((notif) => ({
                                    ...notif,
                                    payload: {
                                        notif_title: notif?.msgTitle || notif?.title,
                                        full_desc: notif?.message,
                                        recipient_url: notif?.landingUrl,
                                        img_url: notif?.imageUrl,
                                    },
                                    id: id(),
                                    isPromo: true,
                                }));

                                const mergedData = [
                                    ...existingNotifications[dateInNotificationIndex].data,
                                    ...data,
                                ];

                                const mergedDate = {
                                    ...existingNotifications[dateInNotificationIndex],
                                    data: mergedData,
                                };

                                existingNotifications = [
                                    ...existingNotifications.slice(0, dateInNotificationIndex),
                                    mergedDate,
                                ];
                            }
                        }

                        if (notInExistingDate) {
                            formattedNotifications = notInExistingDate.map((section) => {
                                const title = convertDateToTitle(section.date);
                                const data = section.notifications.map((notif) => ({
                                    ...notif,
                                    payload: {
                                        notif_title: notif?.msgTitle || notif?.title,
                                        full_desc: notif?.message,
                                        recipient_url: notif?.landingUrl,
                                        img_url: notif?.imageUrl,
                                    },
                                    id: id(),
                                    isPromo: true,
                                }));

                                return {
                                    title,
                                    data,
                                };
                            });
                        }
                    } else {
                        throw new Error();
                    }

                    setState((prev) => ({
                        ...prev,
                        promoNotifications:
                            pageIndex > 0
                                ? [...existingNotifications, ...formattedNotifications]
                                : formattedNotifications,
                        loadMore: false,
                        lastDatePromo: formattedNotifications.length
                            ? formattedNotifications[formattedNotifications.length - 1].title
                            : prev.lastDatePromo,
                        stopLoadMorePromo: resultCount < 20,
                    }));
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.tron.log(error.message);

                setState((prev) => ({
                    ...prev,
                    loadMore: false,
                    stopLoadMorePromo: true,
                }));
            }
        },
        [state.lastDatePromo, state.promoNotifications, state.promoPageSize]
    );

    const getEngageInboxUrl = async () => {
        try {
            const request = await getEngageInitAPI();
            const ready = request.mbpns?.ready;
            if (ready) {
                const inboxEngageUrl = request.mbpns?.inboxUrl;
                return inboxEngageUrl;
            }
        } catch {
            return "";
        }
    };

    const getNotifications = useCallback(
        async (pageIndex) => {
            setState((prev) => ({
                ...prev,
                loadMore: true,
                pageIndex,
            }));

            if (timer.current) clearTimeout(timer.current);

            let inboxEngageUrl;

            //If isDisablePNSCall is false and inboxURL is empty (Open from notificationCentre directly), it will call the engageInboxURL
            if (!isDisablePNSCall && _.isEmpty(inboxUrl)) {
                const engageInbox = await getEngageInboxUrl();
                const isEngageInboxUrlEmpty = _.isEmpty(engageInbox);
                //If engage is empty, the mbpns ready is false,
                if (!isEngageInboxUrlEmpty) {
                    inboxEngageUrl = engageInbox;
                    updateModel({
                        misc: {
                            inboxUrl: engageInbox,
                        },
                    });
                }
            } else {
                inboxEngageUrl = inboxUrl;
            }

            try {
                //If !isDisablePNSCall is true, call from mbpns, if false call from maya-db
                let request;
                if (!isDisablePNSCall) {
                    const response = await notificationCenterMBPNS(
                        `${inboxEngageUrl}?by=pan&page=${pageIndex + 1}&limit=${
                            state.pageSize
                        }&app_id=10`
                    );
                    request = { data: response };
                } else {
                    request = await notificationCenter(
                        `/map?page=${pageIndex}&pageSize=${state.pageSize}`,
                        "get",
                        false,
                        false
                    );
                }
                if (request.data) {
                    const { resultList, resultCount } = request.data;
                    let formattedNotifications = [];
                    let existingNotifications = [...state.notifications];

                    // transform the data into format that we need
                    if (resultList.length) {
                        const existingDate = resultList.find(
                            (section) => convertDateToTitle(section.date) === state.lastDate
                        );
                        const notInExistingDate = resultList.filter(
                            (section) => convertDateToTitle(section.date) !== state.lastDate
                        );

                        if (existingDate) {
                            // merged it with existing
                            const dateInNotificationIndex = existingNotifications.findIndex(
                                (n) => n.title === state.lastDate
                            );

                            if (dateInNotificationIndex > -1) {
                                // append new notification into it
                                const data = existingDate.notifications;

                                const mergedData = [
                                    ...existingNotifications[dateInNotificationIndex].data,
                                    ...data,
                                ];

                                mergedData.forEach((d) => {
                                    rowSwipeAnimatedRef.current[`${d.id}`] = new Animated.Value(0);
                                });

                                const mergedDate = {
                                    ...existingNotifications[dateInNotificationIndex],
                                    data: mergedData,
                                };

                                existingNotifications = [
                                    ...existingNotifications.slice(0, dateInNotificationIndex),
                                    mergedDate,
                                ];
                            }
                        }

                        if (notInExistingDate) {
                            formattedNotifications = notInExistingDate.map((section, index) => {
                                const title = convertDateToTitle(section.date);
                                const { welcomeMessageDeletedDate, welcomeMessageSeenDate } =
                                    getModel("misc");
                                let data = section.notifications;

                                // the oldest notification data
                                if (
                                    !welcomeMessageDeletedDate &&
                                    index === notInExistingDate.length - 1
                                ) {
                                    welcomeMessage.formattedTime =
                                        data[data.length - 1].formattedTime;
                                    welcomeMessage.seen = Boolean(welcomeMessageSeenDate);

                                    // put the welcome message into notifications
                                    data = [...data, welcomeMessage];
                                }

                                data.forEach((d) => {
                                    rowSwipeAnimatedRef.current[`${d.id}`] = new Animated.Value(0);
                                });

                                return {
                                    title,
                                    data,
                                };
                            });
                        }
                    } else {
                        throw new Error("NO resultList");
                    }

                    setState((prev) => ({
                        ...prev,
                        notifications:
                            pageIndex > 0
                                ? [...existingNotifications, ...formattedNotifications]
                                : formattedNotifications,
                        loadMore: false,
                        lastDate: formattedNotifications.length
                            ? formattedNotifications[formattedNotifications.length - 1].title
                            : prev.lastDate,
                        stopLoadMore: resultCount < 20,
                    }));

                    notificationsListRef.current =
                        pageIndex > 0
                            ? [...existingNotifications, ...formattedNotifications]
                            : formattedNotifications;
                } else {
                    throw new Error("No data");
                }
            } catch (error) {
                const {
                    welcomeMessageAddedDate,
                    welcomeMessageSeenDate,
                    welcomeMessageDeletedDate,
                } = getModel("misc");

                if (!state.notifications.length && !welcomeMessageDeletedDate) {
                    const dateTime = welcomeMessageAddedDate
                        ? welcomeMessageAddedDate
                        : moment().format("DD MMM YYYY, HH:mm a");
                    const date = moment(dateTime, "DD MMM YYYY, HH:mm a").format("DD MMM YYYY");

                    if (!welcomeMessageAddedDate) {
                        await AsyncStorage.setItem(
                            "welcomeMessageAddedDate",
                            JSON.stringify(dateTime)
                        );

                        updateModel({
                            misc: {
                                welcomeMessageAddedDate: dateTime,
                            },
                        });
                    }

                    const noNotification = [
                        {
                            title: convertDateToTitle(date),
                            data: [
                                {
                                    ...welcomeMessage,
                                    formattedTime: moment(dateTime, "DD MMM YYYY, HH:mm a").format(
                                        "h:mm A"
                                    ),
                                    seen: !!welcomeMessageSeenDate,
                                },
                            ],
                        },
                    ];

                    setState((prev) => ({
                        ...prev,
                        notifications: noNotification,
                        loadMore: false,
                        stopLoadMore: true,
                    }));

                    notificationsListRef.current = noNotification;

                    rowSwipeAnimatedRef.current["-1"] = new Animated.Value(0);
                } else {
                    setState((prev) => ({
                        ...prev,
                        loadMore: false,
                        stopLoadMore: true,
                    }));
                }
            } finally {
                // every 5 secs, lets update our seen record
                startSeenTimer();
            }
        },
        [state.lastDate, state.notifications, state.pageSize, getModel, updateModel, startSeenTimer]
    );

    function loadMorePromoData() {
        const { stopLoadMorePromo, promoPageIndex } = state;

        if (!stopLoadMorePromo) {
            getPromotionNotifications(promoPageIndex + 1);
        }
    }

    function loadMoreData() {
        const { stopLoadMore, pageIndex } = state;

        if (!stopLoadMore) {
            getNotifications(pageIndex + 1);
        }
    }

    const handleMarkAsSeen = useCallback(async () => {
        const sectionsWithNotSeen = notificationsListRef.current.reduce((collection, section) => {
            const seenNotification = section.data.filter((n) => !n.seen);

            if (isDisablePNSCall && seenNotification && seenNotification.length) {
                const ids = seenNotification.map((n) => n.id);

                return [...collection, ...ids];
            }

            return collection;
        }, []);

        if (sectionsWithNotSeen.length) {
            const notSeenData = sectionsWithNotSeen.filter((s) => s !== -1);

            // update our state
            const seenNotifications = notificationsListRef.current.map((section) => ({
                ...section,
                data: section.data.map((notification) => ({
                    ...notification,
                    seen: true,
                })),
            }));

            setState((prev) => ({
                ...prev,
                notifications: seenNotifications,
            }));

            if (sectionsWithNotSeen.find((s) => s === -1)) {
                await AsyncStorage.setItem(
                    "welcomeMessageSeenDate",
                    JSON.stringify(moment().toString())
                );

                updateModel({
                    misc: {
                        welcomeMessageSeenDate: moment().toString(),
                    },
                });
            }
            if (notSeenData && notSeenData.length) {
                // shoot the api
                try {
                    const request = await notificationCenter(
                        `/seen?ids=${notSeenData.join(",")}`,
                        "put",
                        false,
                        false
                    );

                    checkForUnseen();

                    if (!request.data) {
                        throw new Error();
                    }
                } catch (error) {
                    console.tron.log(error.message);
                }
            }
        }
    }, [updateModel, checkForUnseen]);

    function handleNavigation(item) {
        const { title, refId, module, payload, subModule, isPromo, seen, message } = item;
        const formattedModule = isPromo ? "MBPNS_PROMOTION" : module;

        if (!isPromo) {
            // close the row if open
            swipeRowRef.current[item.id].closeRow();

            if (timer.current) clearTimeout(timer.current);

            // set all to seen, since we navigating away soon
            // future : need to Mark as seen each notification instead all while clicked
            !seen && handleMarkAsSeen();
        }

        //checking is formattedModule value need to be navigated. [Please check on getStackByModule]
        if (moduleHasNavigation.includes(formattedModule)) {
            // sent to the controller
            notificationNavigationController(
                title,
                refId === 0 ? 1 : refId,
                formattedModule,
                payload,
                navigation,
                null,
                subModule,
                true,
                message
            );
        }
    }

    function onBackButtonPressed() {
        navigation.goBack();
    }

    function handleShowTopMenu() {
        GASettingsScreen.openNotificationTopMenu();
        setState((prev) => ({
            ...prev,
            showTopMenu: true,
        }));
    }

    function handleTabPress(value) {
        setState((prev) => ({
            ...prev,
            selectedTab: value,
        }));

        // only call the API if there's no data for any of the notification
        if (isOnboard) {
            if (value === "new") {
                !state.promoNotifications.length && getPromotionNotifications(0);
            } else {
                !state.notifications.length && getNotifications(0);
            }
        }
    }

    function setSwiperRef(ref, id) {
        swipeRowRef.current[id] = ref;
    }

    async function handleDeleteNotification(id) {
        const { notifications, openedRow } = state;

        // delete locally
        const filtered = notifications.map((section) => {
            const data = section.data.filter((notification) => notification.id !== id);

            return {
                ...section,
                data,
            };
        });

        // Get only sections with notifications
        const processedNotifications = filtered.filter(
            (section) => section.data && section.data.length
        );

        setState((prev) => ({
            ...prev,
            notifications: processedNotifications,
            openedRow: openedRow.filter((row) => row !== id),
        }));

        // show the toast
        showInfoToast({
            message: "Notification deleted",
        });

        generateHaptic("notification", true);

        // if local welcome message, mark it in AS flag
        if (id === -1) {
            await AsyncStorage.setItem("welcomeMessageDeletedDate", moment().toString());

            updateModel({
                misc: {
                    welcomeMessageDeletedDate: moment().toString(),
                },
            });
        } else {
            // TODO: call the API to delete the notification
            try {
                const request = await notificationCenter(`/delete?ids=${id}`, "put", true, false);

                if (!request.data) {
                    throw new Error();
                }
            } catch (error) {
                console.tron.log(error.message);
            }
        }
    }

    function handleRowOpened(id) {
        const { openedRow } = state;

        if (openedRow.length && openedRow.find((row) => row !== id)) {
            // close the opened row
            swipeRowRef.current[openedRow[0]].closeRow();
        }

        setState((prev) => ({
            ...prev,
            openedRow: [id],
        }));
    }

    function handleRowClosed(id) {
        setState((prev) => ({
            ...prev,
            openedRow: state.openedRow.filter((row) => row !== id),
        }));
    }

    function handleOnSwipe(swipeData) {
        const { key, value } = swipeData;

        rowSwipeAnimatedRef.current[key].setValue(Math.abs(value));
    }

    function renderPromoRow({ item }: Object) {
        return (
            <Notification
                {...item}
                limitDescriptionLineNo={2}
                handleNavigation={handleNavigation}
            />
        );
    }

    function renderRow({ item }: Object) {
        //Hide Reddot if !isDisablePNSCall
        if (!isDisablePNSCall) {
            item.seen = true;
        }
        return (
            <Notification
                {...item}
                isSwipeable
                handleNavigation={handleNavigation}
                handleDeleteNotification={handleDeleteNotification}
                handleRowOpened={handleRowOpened}
                handleRowClosed={handleRowClosed}
                handleOnSwipe={handleOnSwipe}
                setSwiperRef={setSwiperRef}
                swipeAnimatedValue={rowSwipeAnimatedRef.current[item.id]}
            />
        );
    }

    function renderSectionHeader({ section }: Object) {
        const { title }: { title: string } = section;
        return <SubHeader title={title} />;
    }

    function handleTopMenuPressed() {
        contactBankcall("+60358914744");
    }

    function handleCloseTopMenu() {
        setState((prev) => ({
            ...prev,
            showTopMenu: false,
        }));
    }

    async function handleFirstTimeClose() {
        // close popup
        updateModel({
            misc: {
                isNotificationVisited: true,
            },
        });

        // mark the flag
        await AsyncStorage.setItem("isNotificationVisited", "true");
    }

    const checkForUnseen = useCallback(async () => {
        if (isOnboard) {
            try {
                const response = await notificationCenter(`/new`, "get", false, false);

                if (response && response.data) {
                    // update activities tab item
                    const newActivity = {
                        ...tabHeaderItems[0],
                        // ...tabHeaderItems[1],
                        postComponent: (
                            <View style={styles.tabHeaderRedDot}>
                                <RedDot />
                            </View>
                        ),
                    };

                    setTabItems([newActivity]);
                    // setTabItems([tabHeaderItems[0], newActivity]);
                } else {
                    setTabItems([...INITIAL_TAB]);
                }
            } catch (error) {
                console.tron.log(error.message);
            }
        }
    }, [isOnboard, tabHeaderItems]);

    /**
     * TODO:
     * Params seems to be persisted event after setparams when navigated from
     * PNS, while you are already inside notification center.
     * navigating back into notification afterwards will have the params
     * persisted through out
     *
     * For now, specifically defined the params to be null within Menu screen
     * when navigating from the screen
     *
     * https://github.com/react-navigation/react-navigation/issues/8263
     */
    useFocusEffect(
        useCallback(() => {
            if (route?.params?.selectedTab) {
                // update params to remove
                navigation.setParams({
                    selectedTab: null,
                });
            }
        }, [navigation, route?.params?.selectedTab])
    );

    useEffect(() => {
        if (isOnboard) {
            getNotifications(0);
            // getPromotionNotifications(0);
            // If isDisablePNSCall, use checkForUnseen.
            if (isDisablePNSCall) {
                checkForUnseen();
            }
        } else {
            setState((prev) => ({
                ...prev,
                loadMore: false,
            }));
        }

        return () => {
            // clear timeout
            timer.current && clearTimeout(timer.current);

            // hide any flash message
            hideToast();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_SETTINGS_NOTIFICATIONS}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        neverForceInset={["bottom"]}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={onBackButtonPressed} />
                                }
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Notifications"
                                    />
                                }
                                headerRightElement={
                                    <HeaderDotDotDotButton onPress={handleShowTopMenu} />
                                }
                            />
                        }
                    >
                        <View style={styles.container}>
                            <TabHeader
                                items={tabHeaderItems}
                                selectedValue={state.selectedTab}
                                onTabChange={handleTabPress}
                                forceTabChange={route?.params?.selectedTab}
                            />
                            <TabContent selectedTab={state.selectedTab}>
                                <TabContentItem id="new">
                                    <SectionList
                                        sections={state.promoNotifications}
                                        refreshing={state.loadMore}
                                        initialNumToRender={state.promoPageSize}
                                        ListEmptyComponent={
                                            <EmptyNotification loading={state.loadMore} />
                                        }
                                        ListFooterComponent={
                                            state.promoNotifications.length > 0 ? (
                                                <NoMoreNotification
                                                    visible={state.stopLoadMorePromo}
                                                />
                                            ) : null
                                        }
                                        renderItem={renderPromoRow}
                                        renderSectionHeader={renderSectionHeader}
                                        keyExtractor={extractKey}
                                        onEndReached={loadMorePromoData}
                                        onEndReachedThreshold={0.1}
                                        contentContainerStyle={
                                            !state.promoNotifications.length &&
                                            styles.contentContainer
                                        }
                                    />
                                </TabContentItem>
                                <TabContentItem id="activities">
                                    <SectionList
                                        sections={state.notifications}
                                        refreshing={state.loadMore}
                                        initialNumToRender={state.pageSize}
                                        ListEmptyComponent={
                                            <EmptyNotification loading={state.loadMore} />
                                        }
                                        ListFooterComponent={
                                            state.notifications.length > 0 ? (
                                                <NoMoreNotification visible={state.stopLoadMore} />
                                            ) : null
                                        }
                                        renderItem={renderRow}
                                        renderSectionHeader={renderSectionHeader}
                                        keyExtractor={extractKey}
                                        onEndReached={loadMoreData}
                                        onEndReachedThreshold={0.1}
                                        contentContainerStyle={
                                            !state.notifications.length && styles.contentContainer
                                        }
                                    />
                                </TabContentItem>
                            </TabContent>
                        </View>
                    </ScreenLayout>

                    {/* MAYA-3572 Show message for first visit */}
                    {!isNotificationVisited && (
                        <FirstTimePopup handleClose={handleFirstTimeClose} />
                    )}
                </>
            </ScreenContainer>
            <TopMenu
                showTopMenu={state.showTopMenu}
                onClose={handleCloseTopMenu}
                menuArray={topMenus}
                onItemPress={handleTopMenuPressed}
            />
        </>
    );
}

NotificationCenter.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    emptyContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 36,
    },
    emptyContainerInner: {
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainerText: {
        marginTop: 8,
    },
    endOfNotificationContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
    },
    endOfNotificationIcon: { height: 50, width: 50 },
    endOfNotificationIconContainer: {
        marginBottom: 10,
    },
    loaderDate: {
        backgroundColor: DARK_GREY,
        borderRadius: 3,
        height: 12,
        width: 100,
    },
    loaderDesc: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 12,
        width: "90%",
    },
    loaderDescParagraph: {
        marginBottom: 4,
    },
    loaderDescTwo: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 12,
        width: "60%",
    },
    loaderTitle: {
        backgroundColor: DARK_GREY,
        borderRadius: 3,
        height: 12,
        width: 200,
    },
    loaderTitleContainer: {
        marginBottom: 16,
    },
    notificationDeleteButton: {
        alignItems: "center",
        height: 90,
        justifyContent: "center",
        width: 90,
    },
    notificationItemBottomRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: 12,
        paddingVertical: 4,
    },
    notificationItemContainer: {
        backgroundColor: WHITE,
        borderBottomColor: NOTIFICATION_BORDER_GREY,
        borderBottomWidth: 1,
        minHeight: 101, // together with notification dot
        paddingLeft: 24,
        paddingRight: 12,
        paddingVertical: 16,
    },
    notificationItemMessage: {
        flex: 0.8,
    },
    notificationItemTimestamp: {
        flex: 0.2,
    },
    notificationItemTitle: {
        flex: 0.8,
        marginLeft: 8,
    },
    notificationItemTopRow: {
        alignItems: "center",
        flexDirection: "row",
    },
    notificationPromoItemMessage: { flex: 1 },
    notificationSwipeRow: {
        alignItems: "flex-end",
        backgroundColor: RED,
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    redDot: {
        backgroundColor: RED,
        borderRadius: 3,
        height: 6,
        width: 6,
    },
    ribbon: {
        height: 17,
        width: 4,
    },
    seenContainer: {
        alignItems: "flex-end",
        height: 7,
    },
    subHeader: {
        alignItems: "flex-start",
        backgroundColor: GREY,
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    tabContentContainer: {
        flex: 1,
        position: "relative",
    },
    tabContentItem: {
        ...StyleSheet.absoluteFill,
        zIndex: -1,
    },
    tabContentItemVisible: { zIndex: 7 },
    tabHeaderContainer: {
        position: "relative",
    },
    tabHeaderItemContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 24,
        paddingHorizontal: 12,
        paddingTop: 16,
    },
    tabHeaderItemTouchable: {
        alignItems: "center",
        flexDirection: "row",
    },
    tabHeaderRedDot: { position: "absolute", right: -12 },
    tabHeaderSelectedBorder: {
        backgroundColor: BLACK,
        height: 4,
        width: "100%",
    },
    tabHeaderSelectedContainer: {
        bottom: 20,
        height: 4,
        left: 0,
        position: "absolute",
        width: "100%",
    },
    tabItemContainer: {
        paddingHorizontal: 12,
    },
    whiteThrash: {
        height: 24,
        marginBottom: 4,
        width: 24,
    },
});

export default withModelContext(NotificationCenter);

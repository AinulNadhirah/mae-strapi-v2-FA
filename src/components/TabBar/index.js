import PropTypes from "prop-types";
import React, { useState, Fragment, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Dimensions, Animated } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";

import Typo from "@components/Text";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { YELLOW, TAB_BAR_BG, SPANISH_GRAY } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_HOME,
    FA_Scan_And_Pay,
    FA_SCREEN_NAME,
    FA_SELECT_FOOTER,
} from "@constants/strings";

import { generateHaptic } from "@utils";

import Images from "@assets";

const { width } = Dimensions.get("window");

function TabBar({ state, descriptors, navigation }) {
    const { getModel } = useModelController();
    const safeAreaInsets = useSafeArea();
    const [activeTabBorder] = useState(new Animated.Value(0));
    const { isOnboard } = getModel("user");
    const { isEnabled: qrEnabled } = getModel("qrPay");

    const tabWidth = (width - 24) / 5;

    //all the icon basically is gray color, we set tintColor while is highlighted.
    //if active and inactive images given seperately treat it as custom icon
    const customIcons = {
        More: { active: Images.tabBarMore, inactive: Images.tabBarMoreUnselected },
        Dashboard: { active: Images.tabBarDashboardOn, inactive: Images.tabBarDashboardOff },
    };

    useEffect(() => {
        Animated.spring(activeTabBorder, {
            toValue: state.index > 1 ? (state.index + 1) * tabWidth : state.index * tabWidth,
            velocity: 3,
            useNativeDriver: true,
        }).start();
    }, [activeTabBorder, state, tabWidth]);

    return (
        <Animatable.View
            animation="slideInUp"
            duration={500}
            delay={250}
            style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
            useNativeDriver
        >
            <View style={[StyleSheet.absoluteFillObject, styles.content]}>
                <Animated.View
                    style={[
                        styles.activeTab,
                        {
                            width: tabWidth,
                            transform: [{ translateX: activeTabBorder }],
                        },
                    ]}
                >
                    <View style={styles.activeTabInner} />
                </Animated.View>
            </View>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                function handleGoToOnboard() {
                    navigation.navigate("Onboarding", {
                        screen: "OnboardingStart",
                    });
                }

                function onPress() {
                    generateHaptic("selection", true);
                    if (!isOnboard) {
                        logEvent(FA_SELECT_FOOTER, {
                            [FA_ACTION_NAME]: route.name === "Dashboard" ? FA_HOME : route.name,
                        });
                    }
                    if (route.name !== "More" && route.name !== "Dashboard" && !isOnboard) {
                        //  go to onboarding flow
                        handleGoToOnboard();
                    } else {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                        });
                        logEvent(FA_SELECT_FOOTER, {
                            [FA_ACTION_NAME]: route.name === "Dashboard" ? FA_HOME : route.name,
                        });

                        if (!isFocused && !event.preventDefault) {
                            navigation.navigate(route.name);
                        }
                    }
                }

                async function onPressQr() {
                    if (!isOnboard) {
                        logEvent(FA_SELECT_FOOTER, {
                            [FA_ACTION_NAME]: FA_Scan_And_Pay,
                        });
                        handleGoToOnboard();
                    } else {
                        logEvent(FA_SELECT_FOOTER, {
                            [FA_ACTION_NAME]: FA_Scan_And_Pay,
                        });

                        if (!qrEnabled) {
                            navigation.navigate("QrStack", {
                                screen: "QrStart",
                                params: { primary: true, settings: false },
                            });
                        } else {
                            navigation.navigate("QrStack", {
                                screen: "QrMain",
                                params: {
                                    primary: true,
                                    settings: false,
                                    fromRoute: "",
                                    fromStack: "",
                                },
                            });
                        }
                    }
                }

                function onLongPress() {
                    if (route.name !== "Menu" && !isOnboard) {
                        //  go to onboarding flow
                        handleGoToOnboard();
                    } else {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    }
                }

                if (route.name === "Expenses") {
                    return (
                        // we add QR before it
                        <Fragment key={route.name}>
                            <TouchableOpacity
                                key="Qr"
                                accessibilityRole="button"
                                onPress={onPressQr}
                                style={styles.tab}
                            >
                                <View style={[styles.buttonTab, styles.qrButton]}>
                                    <View style={styles.qrButtonContainer}>
                                        <Image
                                            source={Images.tabBarQrActive}
                                            resizeMode="center"
                                            style={styles.qrButtonIcon}
                                        />
                                        <Typo
                                            lineHeight={15}
                                            fontWeight="600"
                                            fontSize={9}
                                            text="Scan"
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                key={route.name}
                                accessibilityRole="button"
                                accessibilityStates={isFocused ? ["selected"] : []}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={styles.tab}
                            >
                                <View style={styles.buttonTab}>
                                    <View style={styles.tabBarIconContainer}>
                                        <Image
                                            source={Images[`tabBar${route.name}`]}
                                            resizeMode="center"
                                            style={[
                                                styles.tabBarIcon,
                                                { tintColor: isFocused ? YELLOW : SPANISH_GRAY },
                                            ]}
                                        />
                                    </View>
                                    <Typo
                                        color={isFocused ? YELLOW : SPANISH_GRAY}
                                        lineHeight={15}
                                        fontWeight="600"
                                        fontSize={9}
                                        text={label}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Fragment>
                    );
                }

                return (
                    <TouchableOpacity
                        key={route.name}
                        accessibilityRole="button"
                        accessibilityStates={isFocused ? ["selected"] : []}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tab}
                    >
                        <View style={styles.buttonTab}>
                            <View style={styles.tabBarIconContainer}>
                                {customIcons[route.name] ? (
                                    <Image
                                        source={
                                            isFocused
                                                ? customIcons[route.name].active
                                                : customIcons[route.name].inactive
                                        }
                                        resizeMode="center"
                                        style={[styles.tabBarIcon]}
                                    />
                                ) : (
                                    <Image
                                        source={Images[`tabBar${route.name}`]}
                                        resizeMode="center"
                                        style={[
                                            styles.tabBarIcon,
                                            {
                                                tintColor: isFocused ? YELLOW : SPANISH_GRAY,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                            <Typo
                                color={isFocused ? YELLOW : SPANISH_GRAY}
                                lineHeight={15}
                                fontWeight="600"
                                fontSize={9}
                                text={label}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </Animatable.View>
    );
}

TabBar.propTypes = {
    state: PropTypes.object,
    descriptors: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    activeTab: {
        justifyContent: "flex-start",
        width: "100%",
    },
    activeTabInner: {
        backgroundColor: YELLOW,
        height: 4,
        width: "100%",
    },
    buttonTab: {
        alignItems: "center",
    },
    container: {
        backgroundColor: TAB_BAR_BG,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        position: "relative",
    },
    content: {
        paddingHorizontal: 12,
    },
    qrButton: {
        backgroundColor: YELLOW,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    qrButtonContainer: {
        alignItems: "center",
        height: 24,
        justifyContent: "center",
        width: 24,
    },
    qrButtonIcon: {
        width: 24,
    },
    tab: { alignItems: "center", flex: 1, paddingVertical: 12 },
    tabBarIcon: {
        width: 24,
        height: 24,
    },
    tabBarIconContainer: {
        alignItems: "center",
        height: 24,
        justifyContent: "center",
        width: 24,
    },
});

export default TabBar;

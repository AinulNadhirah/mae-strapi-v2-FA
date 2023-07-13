import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Typo from "@components/Text";

import { WHITE, ROYAL_BLUE } from "@constants/colors";

import Assets from "@assets";

const { width, height } = Dimensions.get("screen");

const TopMenuItem = ({ onTopMenuItemPressed, title, menuParam }) => {
    const handlePress = useCallback(
        () => onTopMenuItemPressed(menuParam),
        [onTopMenuItemPressed, menuParam]
    );

    return (
        <View style={styles.topMenuItem}>
            <TouchableOpacity onPress={handlePress} hitSlop={{ top: 9, bottom: 9 }}>
                <Typo text={title} fontWeight="600" lineHeight={18} color={ROYAL_BLUE} />
            </TouchableOpacity>
        </View>
    );
};

TopMenuItem.propTypes = {
    onTopMenuItemPressed: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    menuParam: PropTypes.any.isRequired,
};

const TopMenu = ({ onClose, menuArray, onItemPress, showTopMenu }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const containerTranslateYAnimationValue = useRef(new Animated.Value(0)).current;
    const menuTranslateYAnimationValue = useRef(new Animated.Value(0)).current;
    const opacityAnimationValue = useRef(new Animated.Value(0)).current;
    const [hideOverlay, setHideOverlay] = useState(true);

    const menuItems = menuArray.map((menu, index) => {
        const { menuParam, menuLabel } = menu;
        return (
            <TopMenuItem
                key={`${menuLabel}-${index}`}
                title={menuLabel}
                menuParam={menuParam}
                onTopMenuItemPressed={onItemPress}
            />
        );
    });

    const menuHeight = 54 * menuArray.length + 40 + 20 + 48 + safeAreaInsets.top;

    if (showTopMenu)
        Animated.sequence([
            Animated.timing(containerTranslateYAnimationValue, {
                toValue: height,
                duration: 1,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(menuTranslateYAnimationValue, {
                    toValue: menuHeight,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnimationValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    else
        Animated.sequence([
            Animated.parallel([
                Animated.timing(menuTranslateYAnimationValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnimationValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(containerTranslateYAnimationValue, {
                toValue: 0,
                duration: 1,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (!hideOverlay) setHideOverlay(true);
        });

    useEffect(() => {
        if (showTopMenu && hideOverlay) setHideOverlay(false);
    }, [hideOverlay, showTopMenu]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        {
                            translateY: containerTranslateYAnimationValue,
                        },
                    ],
                },
            ]}
        >
            <Animated.View
                style={[styles.overlay, { opacity: opacityAnimationValue }]}
                onTouchStart={onClose}
            >
                {!hideOverlay && <BlurView style={styles.blur} blurType="dark" blurAmount={10} />}
            </Animated.View>
            <Animated.View
                style={[
                    styles.menu,
                    {
                        top: -menuHeight,
                        height: menuHeight,
                        transform: [
                            {
                                translateY: menuTranslateYAnimationValue,
                            },
                        ],
                    },
                ]}
            >
                <View style={[styles.header, { paddingTop: 28 + safeAreaInsets.top }]}>
                    <TouchableOpacity onPress={onClose} style={styles.button}>
                        <Image style={styles.closeImage} source={Assets.icCloseBlack} />
                    </TouchableOpacity>
                </View>
                <View style={styles.body}>{menuItems}</View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    blur: {
        flex: 1,
    },
    body: {
        backgroundColor: WHITE,
        paddingBottom: 40,
        width: "100%",
    },
    button: {
        alignItems: "center",
        height: 20,
        justifyContent: "center",
        width: 20,
    },
    closeImage: {
        height: 15,
        width: 15,
    },
    container: {
        height,
        left: 0,
        position: "absolute",
        right: 0,
        top: -height,
        width,
    },
    header: {
        alignItems: "flex-end",
        backgroundColor: WHITE,
        paddingRight: 26,
        width: "100%",
    },
    menu: {
        backgroundColor: WHITE,
        position: "absolute",
        width: "100%",
    },
    overlay: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    topMenuItem: {
        alignItems: "center",
        height: 54,
        justifyContent: "center",
        width: "100%",
    },
});

TopMenu.propTypes = {
    onClose: PropTypes.func.isRequired,
    menuArray: PropTypes.array.isRequired,
    onItemPress: PropTypes.func.isRequired,
    showTopMenu: PropTypes.bool,
};

TopMenu.defaultProps = {
    showTopMenu: true,
};

export { TopMenu };

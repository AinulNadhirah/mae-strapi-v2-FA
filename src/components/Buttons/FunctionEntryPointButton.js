import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, Image, View } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import BaseSolidButton from "@components/Buttons/Base/BaseSolidButton";
import Typo from "@components/Text";

import { WHITE, SHADOW_LIGHT } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import assets from "@assets";

const SHADOW = "rgba(0, 0, 0, 0.08)";

const FunctionEntryPointButton = ({
    title,
    iconImage,
    value,
    onFunctionEntryPointButtonPressed,
    width,
    height,
    marginHorizontal,
    marginVertical,
}) => {
    const onPress = useCallback(
        () => onFunctionEntryPointButtonPressed({ value, title, iconImage }),
        [value, title, iconImage, onFunctionEntryPointButtonPressed]
    );

    return (
        <View style={styles.shadow}>
            <BaseSolidButton
                onPress={onPress}
                style={[
                    styles.container,
                    {
                        width, // should need the gutter built into, either container use space-between/or wrap in a view that hold specific gutter
                        height,
                        marginHorizontal,
                        marginVertical,
                    },
                ]}
            >
                <React.Fragment>
                    <View style={styles.iconContainer}>
                        <Image style={styles.icon} source={iconImage} resizeMode="contain" />
                    </View>
                    <View style={styles.titleContainer}>
                        <Typo text={title} fontSize={12} lineHeight={14} fontWeight="normal" />
                    </View>
                </React.Fragment>
            </BaseSolidButton>
        </View>
    );
};

export function ActionButton({
    width = 75,
    height = 88,
    onFunctionEntryPointButtonPressed = () => {},
    icon,
    title,
    value,
    isAccountSuspended = false,
    fontSize = 12,
    fontWeight = "normal",
    innerPaddingHorizontal = 8,
    innerPaddingVertical = 14,
    titlePaddingHorizontal = 0,
    containerButtonStyle,
}) {
    function onPress() {
        onFunctionEntryPointButtonPressed({ value, title, icon, isAccountSuspended });
    }

    return (
        <TouchableSpring scaleTo={0.95} onPress={onPress}>
            {({ animateProp }) => (
                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: animateProp,
                            },
                        ],
                    }}
                >
                    <View
                        style={[
                            styles.actionButtonContainer(isAccountSuspended),
                            containerButtonStyle,
                            { width, height },
                        ]}
                    >
                        <View
                            style={[
                                styles.actionButtonInner(
                                    innerPaddingHorizontal,
                                    innerPaddingVertical
                                ),
                                { width, height },
                            ]}
                        >
                            <>
                                <View style={styles.actionButtonIcon}>
                                    <CacheeImage
                                        style={styles.actionButtonIconImg}
                                        loadingIndicatorSource={assets.loading}
                                        source={icon}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.actionButtonTitle(titlePaddingHorizontal)}>
                                    <Typo
                                        text={title}
                                        fontSize={fontSize}
                                        lineHeight={14}
                                        fontWeight={fontWeight}
                                        numberOfLines={2}
                                    />
                                </View>
                            </>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

const styles = StyleSheet.create({
    actionButtonContainer: (isAccountSuspended) => ({
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        opacity: isAccountSuspended ? 0.5 : 1.0,
    }),
    actionButtonIcon: {
        height: 36,
        marginBottom: 6,
        width: 36,
    },
    actionButtonIconImg: {
        height: 36,
        width: 36,
    },
    actionButtonInner: (innerPaddingHorizontal, innerPaddingVertical) => ({
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: innerPaddingHorizontal,
        paddingVertical: innerPaddingVertical,
    }),
    actionButtonTitle: (titlePaddingHorizontal) => ({
        height: 28,
        justifyContent: "center",
        paddingHorizontal: titlePaddingHorizontal,
    }),
    container: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        justifyContent: "center",
        overflow: "hidden",
        padding: 8,
    },
    icon: {
        height: 36,
        width: 36,
    },
    iconContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    shadow: {
        ...getShadow({
            color: SHADOW,
            width: 0,
            shadowOpacity: 1,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    titleContainer: {
        alignItems: "center",
        height: 28,
        justifyContent: "center",
        marginTop: 4,
        // width: 75
    },
});

FunctionEntryPointButton.defaultProps = {
    width: 83,
    height: 106,
    marginHorizontal: 4,
    marginVertical: 9,
};

FunctionEntryPointButton.propTypes = {
    title: PropTypes.string.isRequired,
    iconImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    value: PropTypes.string.isRequired,
    onFunctionEntryPointButtonPressed: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    marginHorizontal: PropTypes.number,
    marginVertical: PropTypes.number,
};

ActionButton.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
    onFunctionEntryPointButtonPressed: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    marginHorizontal: PropTypes.number,
    marginVertical: PropTypes.number,
    icon: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.string,
    innerPaddingHorizontal: PropTypes.number,
    innerPaddingVertical: PropTypes.number,
    titlePaddingHorizontal: PropTypes.number,
    isAccountSuspended: PropTypes.bool,
    containerButtonStyle: PropTypes.object,
};

export default React.memo(FunctionEntryPointButton);

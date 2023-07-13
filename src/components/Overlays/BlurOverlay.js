import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { BlurView } from "@react-native-community/blur";

const SCREEN_HEIGHT = Dimensions.get("screen").height;

const BlurOverlay = ({ showOverlay, overlayBlurType, overlaySolidColor, children, ...props }) => {
    const blurContainerOpacityAnimationValue = useRef(new Animated.Value(0)).current;
    const blurContainerTranslateYAnimationValue = useRef(new Animated.Value(0)).current;
    const viewRef = useRef();
    const [hideOverlay, setHideOverlay] = useState(true);

    if (showOverlay)
        Animated.sequence([
            Animated.timing(blurContainerTranslateYAnimationValue, {
                toValue: -SCREEN_HEIGHT,
                duration: 1,
                useNativeDriver: true,
            }),
            Animated.timing(blurContainerOpacityAnimationValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    else
        Animated.sequence([
            Animated.timing(blurContainerOpacityAnimationValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(blurContainerTranslateYAnimationValue, {
                toValue: 0,
                duration: 1,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (!hideOverlay) setHideOverlay(true);
        });

    useEffect(() => {
        if (showOverlay && hideOverlay) setHideOverlay(false);
    }, [hideOverlay, showOverlay]);

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: overlaySolidColor,
                    },
                ]}
                ref={viewRef}
            >
                {children}
            </View>
            <Animated.View
                style={[
                    styles.blurContainer,
                    {
                        opacity: blurContainerOpacityAnimationValue,
                        transform: [
                            {
                                translateY: blurContainerTranslateYAnimationValue,
                            },
                        ],
                    },
                ]}
            >
                {!hideOverlay && (
                    <BlurView
                        style={styles.blur}
                        viewRef={viewRef.current}
                        blurType={overlayBlurType}
                        blurAmount={10}
                        {...props}
                    />
                )}
            </Animated.View>
        </>
    );
};

BlurOverlay.propTypes = {
    showOverlay: PropTypes.bool.isRequired,
    overlayBlurType: PropTypes.oneOf(["xlight", "light", "dark"]),
    overlayGradientColors: PropTypes.array,
    overlayType: PropTypes.oneOf(["solid", "gradient"]),
    overlaySolidColor: PropTypes.string,
    children: PropTypes.element.isRequired,
};

BlurOverlay.defaultProps = {
    overlayBlurType: "dark",
    overlayGradientColors: ["transparent", "#1e3c60"],
    overlayType: "solid",
    overlaySolidColor: "#ffffff",
};

const styles = StyleSheet.create({
    blur: { flex: 1 },
    blurContainer: {
        height: SCREEN_HEIGHT,
        left: 0,
        position: "absolute",
        right: 0,
        top: SCREEN_HEIGHT,
    },
    container: {
        flex: 1,
    },
});

export default React.memo(BlurOverlay);

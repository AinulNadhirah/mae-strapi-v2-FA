import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";

import Typography from "@components/Text";

import { WHITE, SHADOW_LIGHT } from "@constants/colors";

const tension = 70;
const friction = 7;

const styles = StyleSheet.create({
    entryPointCard: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    entryPointCardContent: {
        flex: 1,
        marginLeft: 20,
        minHeight: 50,
    },
    entryPointCardContentRow: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 25,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    entryPointCardIcon: {
        alignItems: "center",
        justifyContent: "center",
        width: 40,
    },
    entryPointCardIconImg: {
        height: 48,
        width: 48,
    },
    entryPointCardIconImgLarge: {
        height: 80,
        width: 80,
    },
    entryPointCardIconLarge: { width: 80 },
    entryPointCardInner: {
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
    },
    entryPointCardTouch: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    noGutter: {
        marginBottom: 0,
    },
});

function EntryPointCard({
    id,
    name,
    onPress,
    noGutter,
    icon,
    description,
    paddingBottom,
    displayLargeIcon,
}) {
    const cardAnimation = new Animated.Value(1);

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePress() {
        onPress(id);
    }

    return (
        <View style={[styles.entryPointCard, noGutter && styles.noGutter]}>
            <Animated.View
                style={[
                    styles.entryPointCardInner,
                    {
                        transform: [
                            {
                                scale: cardAnimation,
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={handlePress}
                >
                    <View style={styles.entryPointCardTouch}>
                        <Typography
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={18}
                            textAlign="left"
                            text={name}
                        />
                    </View>
                    <View
                        style={
                            paddingBottom
                                ? {
                                      ...styles.entryPointCardContentRow,
                                      paddingBottom: paddingBottom,
                                  }
                                : styles.entryPointCardContentRow
                        }
                    >
                        <View
                            style={[
                                styles.entryPointCardIcon,
                                displayLargeIcon && styles.entryPointCardIconLarge,
                            ]}
                        >
                            <Image
                                source={icon}
                                style={
                                    displayLargeIcon
                                        ? styles.entryPointCardIconImgLarge
                                        : styles.entryPointCardIconImg
                                }
                            />
                        </View>
                        <View style={styles.entryPointCardContent}>
                            <Typography
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                text={description}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

EntryPointCard.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    noGutter: PropTypes.bool,
    icon: PropTypes.any.isRequired,
    description: PropTypes.string.isRequired,
    displayLargeIcon: PropTypes.bool,
    paddingBottom: PropTypes.number,
};

EntryPointCard.defaultProps = {
    noGutter: false,
};

export default React.memo(EntryPointCard);

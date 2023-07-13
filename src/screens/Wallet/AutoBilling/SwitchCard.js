import PropTypes from "prop-types";
import React from "react";
import { View, Image, TouchableOpacity, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import { OVERLAY, TRANSPARENT } from "@constants/colors";

import Images from "@assets";

const { width } = Dimensions.get("window");

const SwitchCard = ({ number, code, type, children, isSelected, item, onPress, name }) => {
    const CARD_IMAGE = type === "casa" ? Images.cardbgOne : Images.onboardingMaeBg;

    function handlePress() {
        if (number && code) {
            onPress({
                no: number,
                code,
                name,
                item,
            });
        }
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.cardButton}>
            <View style={styles.cardContainer}>
                <View style={styles.cardInner}>
                    {isSelected && (
                        <Animatable.View
                            animation="fadeIn"
                            duration={500}
                            style={styles.selectedOverlay}
                        >
                            <Animatable.Image
                                animation="bounceIn"
                                duration={300}
                                source={Images.whiteTick}
                                style={styles.selectedCheck}
                            />
                        </Animatable.View>
                    )}
                    <Image source={CARD_IMAGE} style={styles.cardBg} />
                    <View style={styles.cardChildContainer}>{children}</View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

SwitchCard.propTypes = {
    number: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
    item: PropTypes.any,
    name: PropTypes.string,
};
const styles = {
    cardBg: {
        backgroundColor: TRANSPARENT,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        left: -24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    cardButton: {
        paddingBottom: 24,
        paddingHorizontal: 24,
        width,
    },
    cardChildContainer: {
        padding: 16,
    },
    cardContainer: {
        position: "relative",
        width: "100%",
    },
    cardInner: {
        borderRadius: 8,
        height: 110,
        overflow: "hidden",
        width: "100%",
    },
    selectedCheck: { height: 38, width: 38 },
    selectedOverlay: {
        alignItems: "center",
        backgroundColor: OVERLAY,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: width - 48,
        zIndex: 5,
    },
};
export default SwitchCard;

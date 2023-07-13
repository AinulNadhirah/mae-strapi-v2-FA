import PropTypes from "prop-types";
import React from "react";
import { View, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import { OVERLAY, SHADOW_LIGHT } from "@constants/colors";

import Images from "@assets";

const { width } = Dimensions.get("window");

const AccountSelectionCard = ({ account, number, code, type, children, isSelected, onPress }) => {
    const CARD_IMAGE = type === "casa" ? Images.casaFullBg : Images.maeFullBg;

    function handlePress() {
        if (number && code)
            onPress(
                account
                    ? {
                          no: number,
                          code,
                          account,
                      }
                    : {
                          no: number,
                          code,
                      }
            );
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.cardButton}>
            <View style={styles.cardContainer}>
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
        </TouchableOpacity>
    );
};

AccountSelectionCard.propTypes = {
    number: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    onPress: PropTypes.func,
    account: PropTypes.string,
};

const styles = StyleSheet.create({
    cardBg: {
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
        borderRadius: 8,
        elevation: 8,
        height: 116,
        overflow: "hidden",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
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
});

export default AccountSelectionCard;

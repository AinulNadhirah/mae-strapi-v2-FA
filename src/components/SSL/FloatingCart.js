import PropTypes from "prop-types";
import React from "react";
import { View, Image, Dimensions, StyleSheet, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

import assets from "@assets";

const { height } = Dimensions.get("window");

function FloatingCart({ count, onPress, hasFloatingOngoingOrder }) {
    return (
        <TouchableOpacity
            activeOpacity={0.5}
            style={[
                styles.cartContainer,
                {
                    bottom: hasFloatingOngoingOrder ? height / 6.5 : height / 12,
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.cartView}>
                <Image style={styles.cartImg} source={assets.SSLFloatingCart} />
                <View style={styles.cartCountView}>
                    <Typo fontSize={14} fontWeight="semi-bold" color={BLACK} text={`${count}`} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cartContainer: {
        alignItems: "center",
        bottom: height / 6.5,
        height: 80,
        justifyContent: "center",
        position: "absolute",
        right: 5,
        width: 80,
    },
    cartCountView: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 27 / 2,
        height: 27,
        justifyContent: "center",
        paddingLeft: 2,
        position: "absolute",
        right: 0,
        top: 0,
        width: 27,
    },
    cartImg: {
        height: 23,
        width: 22,
    },
    cartView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 30,
        height: 60,
        justifyContent: "center",
        width: 60,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
});

FloatingCart.propTypes = {
    count: PropTypes.number,
    onPress: PropTypes.func.isRequired,
    hasFloatingOngoingOrder: PropTypes.bool,
};
FloatingCart.defaultProps = {
    count: 0,
};
export default React.memo(FloatingCart);

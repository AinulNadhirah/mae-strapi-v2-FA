import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, GREY } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

export default function AddMinusSection({
    onPressMinus,
    tempCount,
    onPressPlus,
    avail,
    cartCount,
}) {
    /** Special handling when first time user enter, tempCount is 1 and minus is disabled */
    const isDisableMinus = (cartCount == 0 && tempCount == 1) || !avail;
    const isDisablePlus = !avail;
    return (
        <View style={styles.plusMinusContainer}>
            <TouchableOpacity
                style={styles.btnStyle}
                onPress={!isDisableMinus ? onPressMinus : null}
            >
                <Image
                    style={styles.btnIconStyle}
                    tintColor={isDisableMinus ? GREY : BLACK}
                    source={assets.SSLicon32BlackMinus}
                />
            </TouchableOpacity>
            <Typo
                fontSize={18}
                fontWeight="bold"
                lineHeight={32}
                letterSpacing={0}
                color={BLACK}
                textAlign="center"
                text={tempCount}
                style={styles.count}
            />

            <TouchableOpacity style={styles.btnStyle} onPress={onPressPlus}>
                <Image
                    style={styles.btnIconStyle}
                    tintColor={isDisablePlus ? GREY : BLACK}
                    source={assets.SSLicon32BlackAdd}
                />
            </TouchableOpacity>
        </View>
    );
}
AddMinusSection.propTypes = {
    onPressMinus: PropTypes.func,
    tempCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onPressPlus: PropTypes.func,
    avail: PropTypes.bool,
    cartCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const styles = StyleSheet.create({
    btnIconStyle: {
        height: 32,
        width: 32,
    },
    btnStyle: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 24,
        height: 48,
        justifyContent: "center",
        width: 48,
        ...SSLStyles.shadow,
    },
    count: { width: 80 },
    plusMinusContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
});

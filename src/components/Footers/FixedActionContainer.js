import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeArea } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    footer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        position: "relative",
    },
    footerNoSafe: {
        paddingBottom: 36,
    },
    linearGradient: {
        height: 36,
        left: 0,
        position: "absolute",
        right: 0,
        top: -36,
    },
});

const FixedActionContainer = ({
    hideGradient,
    gradient = ["rgba(239,239,243,0)", "rgba(239,239,243,1)"],
    children,
}) => {
    const safeArea = useSafeArea();

    return (
        <View style={[styles.footer, safeArea.bottom === 0 && styles.footerNoSafe]}>
            {!hideGradient && (
                <LinearGradient colors={[...gradient]} style={styles.linearGradient} />
            )}
            {children}
        </View>
    );
};

FixedActionContainer.propTypes = {
    hideGradient: PropTypes.bool,
    gradient: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
};

export default FixedActionContainer;

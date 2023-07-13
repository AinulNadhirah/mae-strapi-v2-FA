import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { withModelContext } from "@context";

import { WHITE } from "@constants/colors";

function ShimmerLoading({ isTrackerShow }) {
    const heightStyle = { height: isTrackerShow ? 350 : 150 };
    return (
        <View style={[styles.container, heightStyle]}>
            <View style={styles.loader}>
                <ShimmerPlaceHolder autoRun style={styles.loaderInner} />
            </View>
        </View>
    );
}

ShimmerLoading.propTypes = {
    isTrackerShow: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 350,
        marginBottom: 36,
        marginHorizontal: 24,
    },
    loader: {
        ...StyleSheet.absoluteFill,
        backgroundColor: WHITE,
        borderRadius: 8,
        padding: 16,
        width: "100%",
    },
    loaderInner: {
        borderRadius: 8,
        height: "100%",
        width: "100%",
    },
});

export default withModelContext(ShimmerLoading);

import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import { BRANDEIS } from "@constants/colors";

const SwipeIndicator = ({ totalItems, currentIndex }) => {
    const pages = Array(totalItems)
        .fill(null)
        .map((_, i) => i);
    const isVisible = pages.length > 1;
    return (
        isVisible && (
            <View style={styles.container}>
                {pages.map((index) => {
                    if (currentIndex === index) {
                        return <View key={index} style={styles.activeIndicator} />;
                    } else {
                        return <View key={index} style={styles.inactiveIndicator} />;
                    }
                })}
            </View>
        )
    );
};

SwipeIndicator.propTypes = {
    totalItems: PropTypes.number,
    currentIndex: PropTypes.number,
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    activeIndicator: {
        width: 7,
        height: 7,
        backgroundColor: BRANDEIS,
        borderRadius: 7 / 2,
        margin: 2,
    },
    inactiveIndicator: {
        width: 6,
        height: 6,
        backgroundColor: "black",
        opacity: 0.3,
        borderRadius: 6 / 2,
        margin: 2,
    },
});

export default SwipeIndicator;

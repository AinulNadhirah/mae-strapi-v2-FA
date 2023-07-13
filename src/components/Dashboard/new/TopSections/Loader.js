import React from "react";
import { StyleSheet, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ShimmerPlaceholder from "@components/ShimmerPlaceholder";

const Loader = () => {
    const shimmersColor = [
        "rgba(252,245,215,0.2)",
        "rgba(244,225,176,0.38)",
        "rgba(248,234,193,0.8)",
    ];
    return (
        <View style={styles.container}>
            <ShimmerPlaceholder style={styles.accountName} shimmerColors={shimmersColor} />
            <SpaceFiller height={16} />
            <ShimmerPlaceholder style={styles.accountName} shimmerColors={shimmersColor} />
            <SpaceFiller height={16} />
            <ShimmerPlaceholder style={styles.accountName} shimmerColors={shimmersColor} />
            <SpaceFiller height={24} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
    },
    accountName: {
        borderRadius: 8,
        height: 20,
        width: "40%",
    },
});
export default Loader;

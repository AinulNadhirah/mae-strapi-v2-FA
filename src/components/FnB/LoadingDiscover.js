import React from "react";
import { StyleSheet, View } from "react-native";

import { DiscoverItemLoading } from "./DiscoverItemLoading";

const styles = StyleSheet.create({
    discoverLoader: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 36,
        paddingLeft: 24,
    },
});

export default function LoadingDiscover() {
    return (
        <View style={styles.discoverLoader}>
            <DiscoverItemLoading />
            <DiscoverItemLoading />
        </View>
    );
}

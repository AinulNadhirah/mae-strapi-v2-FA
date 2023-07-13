import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { GREY_100, GREY_200, GREY_300 } from "@constants/colors";

const styles = StyleSheet.create({
    fnbLoaderButton: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 30,
        marginTop: 18,
        width: 130,
    },
    fnbLoaderContainer: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    lockedLoadingTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        maxWidth: 184,
    },
});

function FnBLoader() {
    return (
        <View style={styles.fnbLoaderContainer}>
            <ShimmerPlaceHolder style={styles.lockedLoadingTitle} />
            <ShimmerPlaceHolder style={styles.lockedLoadingTitle} />
            <ShimmerPlaceHolder style={styles.lockedLoadingTitle} />
            <ShimmerPlaceHolder style={styles.fnbLoaderButton} />
        </View>
    );
}

export default FnBLoader;

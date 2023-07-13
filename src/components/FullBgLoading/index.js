import React from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { MEDIUM_GREY } from "@constants/colors";
import ScreenLoader from "@components/Loaders/ScreenLoader";

export default function FullBgLoading() {
    return (
        <Animatable.View animation="fadeIn" style={styles.loadingBg}>
            <ScreenLoader showLoader />
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    loadingBg: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        justifyContent: "center",
    },
});

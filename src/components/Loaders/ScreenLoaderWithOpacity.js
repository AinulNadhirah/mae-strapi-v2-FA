import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import { WHITE } from "@constants/colors";

const ScreenLoaderWithOpacity = ({ showLoader, opacity = "1" }) =>
    showLoader ? (
        <Animatable.View
            animation="fadeIn"
            duration={300}
            style={[styles.container, { backgroundColor: `rgba(255,255,255, ${opacity})` }]}
        >
            <LottieView
                style={styles.lottieView}
                source={require("@assets/lottie/mae-loader.json")}
                autoPlay
                loop
                enableMergePathsAndroidForKitKatAndAbove
            />
        </Animatable.View>
    ) : null;
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: WHITE,
        bottom: 0,
        flex: 1,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    lottieView: {
        height: 135,
        width: 135,
    },
});

ScreenLoaderWithOpacity.propTypes = {
    showLoader: PropTypes.bool.isRequired,
    opacity: PropTypes.string,
};

export default ScreenLoaderWithOpacity;

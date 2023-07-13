import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import { WHITE } from "@constants/colors";

const ScreenLoader = ({ showLoader, bgColor }) =>
    showLoader ? (
        <Animatable.View
            animation="fadeIn"
            duration={300}
            style={[styles.container, bgColor ? styles.bgColorNone : styles.bgColorWhite]}
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
    // eslint-disable-next-line react-native/no-color-literals
    bgColorNone: {},
    bgColorWhite: {
        backgroundColor: WHITE,
    },
    container: {
        alignItems: "center",
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

ScreenLoader.propTypes = {
    showLoader: PropTypes.bool.isRequired,
    bgColor: PropTypes.any,
};

export default ScreenLoader;

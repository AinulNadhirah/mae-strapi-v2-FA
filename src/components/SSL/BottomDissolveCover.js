/* eslint-disable react-native/no-unused-styles */
import PropTypes from "prop-types";
import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

import assets from "@assets";

export function BottomDissolveCover({ children }) {
    return (
        <ImageBackground style={dissolveStyle.imageBackground} source={assets.rectangle_fade}>
            {children}
        </ImageBackground>
    );
}
BottomDissolveCover.propTypes = {
    children: PropTypes.object,
};

export const dissolveStyle = StyleSheet.create({
    imageBackground: {
        bottom: 0,
        height: 130,
        position: "absolute",
        width: "100%", // feel free to change to width if really needed
    },
    scrollPadding: {
        height: 130,
    },
    scrollPaddingWithKeyboard: {
        // use if needed
        height: 250,
    },
});

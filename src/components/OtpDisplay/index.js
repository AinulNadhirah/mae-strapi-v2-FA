import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

const styles = StyleSheet.create({
    otpContainer: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 3,
        justifyContent: "center",
        padding: 24,
    },
});

function OtpDisplay({ text, onPress }) {
    return (
        <TouchableOpacity
            style={styles.otpContainer}
            onPress={onPress}
            testID="otp_display_populate"
        >
            <Typo fontSize={12} fontWeight="600" lineHeight={12} text={text} textAlign="left" />
        </TouchableOpacity>
    );
}

OtpDisplay.propTypes = {
    text: PropTypes.string,
    onPress: PropTypes.func,
};

export default OtpDisplay;

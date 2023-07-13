import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, YELLOW, LIGHT_GREY, FADE_GREY } from "@constants/colors";

export default function SingleLineToggleWLabel({ onToggle, isToggled, text, isDisabled }) {
    function onPress() {
        if (!isDisabled) onToggle();
    }

    return (
        <View style={styles.displayView}>
            <TouchableOpacity activeOpacity={0.8} style={styles.toggleContainer} onPress={onPress}>
                <View
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                        borderWidth: 1,
                        borderColor: isDisabled ? FADE_GREY : BLACK,
                        backgroundColor: isToggled ? YELLOW : LIGHT_GREY,
                        borderRadius: 10,
                        height: 20,
                        width: 20,
                    }}
                />
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={24}
                    text={text}
                    style={styles.radioBtnText}
                    textAlign="left"
                    color={isDisabled ? FADE_GREY : BLACK}
                />
            </TouchableOpacity>
        </View>
    );
}
SingleLineToggleWLabel.propTypes = {
    onToggle: PropTypes.func,
    isToggled: PropTypes.bool,
    text: PropTypes.string,
    isDisabled: PropTypes.bool,
};
const styles = StyleSheet.create({
    displayView: {
        marginTop: 24,
    },
    radioBtnText: {
        marginLeft: 10,
    },
    toggleContainer: {
        alignItems: "center",
        flexDirection: "row",
    },
});

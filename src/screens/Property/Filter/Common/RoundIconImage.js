import PropTypes from "prop-types";
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';

import { WHITE, SHADOW_LIGHTER } from "@constants/colors";

const RoundIconImage = ({ icon, iconStyle, onPress, type, isDisabled }) => {
    const onRoundIconImagePress = () => {
        if (onPress) onPress(type);
    };

    return (
        <TouchableOpacity
            style={isDisabled ? styles.roundContainerDisabled : styles.roundContainer}
            disabled={isDisabled}
            onPress={onRoundIconImagePress}
        >
            <Image source={icon} style={iconStyle} />
        </TouchableOpacity>
    );
};

RoundIconImage.propTypes = {
    icon: PropTypes.any,
    iconStyle: PropTypes.object,
    onPress: PropTypes.func,
    type: PropTypes.string,
    isDisabled: PropTypes.bool,
};

const styles = StyleSheet.create({
    roundContainerDisabled: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 12,
        height: 24,
        justifyContent: "center",
        opacity: 0.3,
        shadowColor: SHADOW_LIGHTER,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        width: 24,
    },
    roundContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 12,
        height: 24,
        justifyContent: "center",
        shadowColor: SHADOW_LIGHTER,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        width: 24,
    },
});

export default RoundIconImage;

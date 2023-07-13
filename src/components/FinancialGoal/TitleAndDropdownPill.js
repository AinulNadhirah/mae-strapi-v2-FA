import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import assets from "@assets";

import { Dropdown } from "./DropDownButtonCenter";

export default function TitleAndDropdownPill({
    title,
    titleFontWeight,
    dropdownTitle,
    dropdownOnPress,
    isDisabled,
    onPressToolTip,
}) {
    return (
        <View style={styles.distanceContainer}>
            <View style={styles.subContainer}>
                <Typo
                    fontSize={14}
                    fontWeight={titleFontWeight ?? "400"}
                    lineHeight={24}
                    text={title}
                    textAlign="left"
                />
                {onPressToolTip && (
                    <TouchableOpacity onPress={onPressToolTip}>
                        <Image style={styles.infoIcon} source={assets.icInformation} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.dropdownContainer}>
                <Dropdown
                    title={dropdownTitle}
                    align="left"
                    onPress={dropdownOnPress}
                    disable={isDisabled}
                />
            </View>
        </View>
    );
}
TitleAndDropdownPill.propTypes = {
    title: PropTypes.string,
    dropdownTitle: PropTypes.string,
    dropdownOnPress: PropTypes.func,
    isDisabled: PropTypes.bool,
    titleFontWeight: PropTypes.string,
    onPressToolTip: PropTypes.func,
};

const styles = StyleSheet.create({
    distanceContainer: {
        marginTop: 24,
    },
    dropdownContainer: {
        marginTop: 12,
    },
    infoIcon: {
        height: 12,
        marginLeft: 6,
        top: 6,
        width: 12,
    },
    subContainer: { flexDirection: "row" },
});

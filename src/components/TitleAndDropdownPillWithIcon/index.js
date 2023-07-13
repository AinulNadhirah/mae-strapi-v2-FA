import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import { Dropdown } from "@components/Common/DropDownButtonCenter";
import Typo from "@components/Text";

import Assets from "@assets";

export default function TitleAndDropdownPillWithIcon({
    title,
    dropdownTitle,
    dropdownOnPress,
    isDisabled,
    titleFontWeight,
    infoIcon,
    dropdownOnInfoPress,
}) {
    return (
        <View style={styles.distanceContainer}>
            <View style={styles.infoLabelContainerCls}>
                <Typo
                    fontSize={14}
                    fontWeight={titleFontWeight ?? "600"}
                    lineHeight={24}
                    text={title}
                    textAlign="left"
                />
                <TouchableOpacity onPress={dropdownOnInfoPress}>
                    <Image style={styles.infoIcon} source={infoIcon ?? Assets.icInformation} />
                </TouchableOpacity>
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
TitleAndDropdownPillWithIcon.propTypes = {
    title: PropTypes.string,
    dropdownTitle: PropTypes.string,
    dropdownOnPress: PropTypes.func,
    isDisabled: PropTypes.bool,
    titleFontWeight: PropTypes.string,
    infoIcon: PropTypes.string,
    dropdownOnInfoPress: PropTypes.func,
};

const styles = StyleSheet.create({
    distanceContainer: {
        marginTop: 24,
    },
    dropdownContainer: {
        marginTop: 12,
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
    },
});

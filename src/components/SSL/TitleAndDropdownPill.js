import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import { Dropdown } from "@components/Common/DropDownButtonCenter";
import Typo from "@components/Text";

export default function TitleAndDropdownPill({
    title,
    titleFontWeight,
    dropdownTitle,
    dropdownOnPress,
    isDisabled,
}) {
    return (
        <View style={styles.distanceContainer}>
            <Typo
                fontSize={14}
                fontWeight={titleFontWeight ?? "600"}
                lineHeight={24}
                text={title}
                textAlign="left"
            />
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
};

const styles = StyleSheet.create({
    distanceContainer: {
        marginTop: 24,
    },
    dropdownContainer: {
        marginTop: 12,
    },
});

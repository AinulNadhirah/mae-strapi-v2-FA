import React from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import PropTypes from "prop-types";

import { DARK_GREY, BLACK, OFF_WHITE } from "@constants/colors";
import Typo from "@components/Text";

const StateScrollPickerItem = ({ stateName, isSelected, itemHeight }) => {
    const containerStyle = [Style.container, { height: itemHeight }];
    if (isSelected) containerStyle.push(Style.selectedItem);
    return (
        <View style={containerStyle}>
            <Typo
                fontSize={16}
                fontWeight={isSelected ? "600" : "normal"}
                lineHeight={19}
                ellipsizeMode="tail"
                numberOfLines={3}
                color={isSelected ? BLACK : DARK_GREY}
                text={stateName}
            />
        </View>
    );
};

const Style = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        width: Dimensions.get("screen").width,
    },
    selectedItem: {
        backgroundColor: OFF_WHITE,
    },
});

StateScrollPickerItem.propTypes = {
    isSelected: PropTypes.bool,
    stateName: PropTypes.string.isRequired,
    itemHeight: PropTypes.number,
};

StateScrollPickerItem.defaultProps = {
    isSelected: false,
    itemHeight: 44,
};

export default React.memo(StateScrollPickerItem);

import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Dimensions, Text, View } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, BLACK } from "@constants/colors";

const ScrollPickerItem = ({ title, isSelected, itemHeight, fontSize }) => {
    const containerStyle = [styles.container];
    if (itemHeight) containerStyle.push({ ...styles.textContainer, height: itemHeight });
    if (isSelected) containerStyle.push(styles.selectedItem);

    return (
        <View style={containerStyle}>
            <Typo
                fontSize={fontSize}
                fontWeight={isSelected ? "600" : "normal"}
                lineHeight={19}
                color={isSelected ? BLACK : DARK_GREY}
            >
                <Text>{title}</Text>
            </Typo>
        </View>
    );
};

const GREY = "#f8f8f8";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: Dimensions.get("screen").width,
    },
    selectedItem: {
        backgroundColor: GREY,
    },
    textContainer: {
        alignItems: "center",
        height: 60,
        justifyContent: "center",
        width: Dimensions.get("screen").width,
    },
});

ScrollPickerItem.propTypes = {
    isSelected: PropTypes.bool,
    itemHeight: PropTypes.any,
    title: PropTypes.string.isRequired,
    fontSize: PropTypes.number,
};

ScrollPickerItem.defaultProps = {
    isSelected: false,
    fontSize: 16,
};

const Memoiz = React.memo(ScrollPickerItem);

export default Memoiz;

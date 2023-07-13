import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { BLACK, RADIO_BTN_YELLOW, WHITE, MEDIUM_GREY } from "@constants/colors";

const ColorRadioButton = ({
    title,
    isSelected,
    fontSize,
    onRadioButtonPressed,
    fontWeight,
    ...props
}) => {
    const onPress = useCallback(() => onRadioButtonPressed(title));
    return (
        <View style={styles.radioButton}>
            <TouchableOpacity style={styles.circle} onPress={onPress} {...props}>
                <View style={isSelected ? styles.checkedCircle : styles.unCheckedCircle} />
            </TouchableOpacity>
            <Typo
                fontSize={fontSize}
                fontWeight={fontWeight}
                fontStyle="normal"
                lineHeight={18}
                letterSpacing={0}
                textAlign="left"
                text={title}
                style={styles.radioBtnText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    radioButton: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "80%",
        marginTop: 15,
    },
    circle: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 13,
        borderStyle: "solid",
        borderWidth: 1,
        height: 22,
        justifyContent: "center",
        width: 22,
    },
    checkedCircle: {
        backgroundColor: RADIO_BTN_YELLOW,
        borderRadius: 10,
        height: 16,
        width: 16,
    },
    unCheckedCircle: {
        backgroundColor: MEDIUM_GREY,
        borderRadius: 10,
        height: 16,
        width: 16,
    },
    radioBtnText: {
        marginLeft: 10,
    },
});

ColorRadioButton.propTypes = {
    title: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    onRadioButtonPressed: PropTypes.func.isRequired,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.number,
};

ColorRadioButton.defaultProps = {
    isSelected: false,
    fontSize: 14,
    fontWeight: "600",
};

const Memoiz = React.memo(ColorRadioButton);

export default Memoiz;

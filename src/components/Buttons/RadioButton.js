import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { Image, TouchableOpacity, StyleSheet, Text } from "react-native";

import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

import Assets from "@assets";

const RadioButton = ({
    isSquare,
    fontSize,
    fontWeight,
    title,
    isSelected,
    onRadioButtonPressed,
    textAlign,
    ...props
}) => {
    const onPress = useCallback(() => onRadioButtonPressed(title), [onRadioButtonPressed, title]);
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} {...props}>
            {isSquare ? (
                <Image
                    style={styles.imageSquare}
                    source={
                        isSelected ? Assets.icRadioSquareChecked : Assets.icRadioSquareUnchecked
                    }
                />
            ) : (
                <Image
                    style={styles.image}
                    source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
                />
            )}
            <Typo fontSize={fontSize} fontWeight={fontWeight} textAlign={textAlign} lineHeight={18}>
                <Text>{title}</Text>
            </Typo>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    imageSquare: {
        height: 20,
        marginRight: 7,
        width: 20,
    },
});

RadioButton.propTypes = {
    title: PropTypes.string.isRequired,
    isSquare: PropTypes.bool,
    isSelected: PropTypes.bool,
    onRadioButtonPressed: PropTypes.func.isRequired,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.string,
    textAlign: PropTypes.string,
};

RadioButton.defaultProps = {
    isSquare: false,
    isSelected: false,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
};

const Memoiz = React.memo(RadioButton);

export default Memoiz;

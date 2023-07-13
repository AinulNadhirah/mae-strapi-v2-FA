import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

import Assets from "@assets";

const TermsConditionRadioButton = ({
    isSelected,
    onRadioButtonPressed,
    textMap,
    titleStart,
    fontSizeStart,
    fontWeightStart,
    textAlignStart,
    ...props
}) => {
    const onPress = useCallback(() => onRadioButtonPressed());
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} {...props}>
            <Image
                style={styles.image}
                source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />

            <Typo
                fontSize={fontSizeStart}
                fontWeight={fontWeightStart}
                textAlign={textAlignStart}
                lineHeight={21}
            >
                {titleStart}
                {textMap.map((item) => {
                    return item.underline ? (
                        <Typo
                            key={item.key}
                            fontSize={item.fontSize}
                            fontWeight={item.fontWeight}
                            textAlign={item.textAlign}
                            lineHeight={21}
                            style={styles.underline}
                            onPress={item.onLinkDidTap}
                            text={item.text}
                        />
                    ) : (
                        <Typo
                            key={item.key}
                            fontSize={item.fontSize}
                            fontWeight={item.fontWeight}
                            textAlign={item.textAlign}
                            lineHeight={21}
                            text={item.text}
                        />
                    );
                })}
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
    underline: {
        textDecorationLine: "underline",
    },
});

TermsConditionRadioButton.propTypes = {
    textMap: PropTypes.object,
    isSelected: PropTypes.bool,
    onRadioButtonPressed: PropTypes.func.isRequired,
    titleStart: PropTypes.string.isRequired,
    fontSizeStart: PropTypes.number,
    fontWeightStart: PropTypes.string,
    textAlignStart: PropTypes.string,
};

TermsConditionRadioButton.defaultProps = {
    isSelected: false,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
};

const Memoiz = React.memo(TermsConditionRadioButton);

export default Memoiz;

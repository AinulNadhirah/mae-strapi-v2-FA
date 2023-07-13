import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, ViewPropTypes, TextInput, Dimensions } from "react-native";

import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE } from "@constants/colors";

const screenWidth = Dimensions.get("window").width;
const leftTextWidth = (screenWidth * 35) / 100;
const rightTextWidth = (screenWidth * 45) / 100;

const InlineEditor = ({
    label,
    value,
    placeHolder,
    isEditable,
    style,
    onValueChange,
    componentID,
    multiline,
    numberOfLines,
    labelNumberOfLines,
    maxLength,
    minLength,
    editType,
    onValuePress,
}) => {
    const valueCls = isEditable ? Style.editableInputCls : Style.nonEditableInputCls;

    const onTextChange = useCallback(
        (newValue) => {
            onValueChange(newValue, componentID);
        },
        [componentID, onValueChange]
    );

    const onTextPress = useCallback(() => {
        if (isEditable) {
            onValuePress(value, componentID);
        }
    }, [componentID, isEditable, onValuePress, value]);

    return (
        <View style={[Style.itemOuterCls, style]}>
            <Typo
                color={BLACK}
                textAlign="left"
                fontSize={14}
                fontWeight="normal"
                lineHeight={19}
                text={label}
                numberOfLines={labelNumberOfLines}
                style={{
                    width: leftTextWidth,
                }}
            />

            {editType == "inline" ? (
                <TextInput
                    placeholder={placeHolder}
                    autoFocus={false}
                    onChangeText={onTextChange}
                    value={value}
                    returnKeyType="done"
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    minLength={minLength}
                    editable={isEditable}
                    testID={"inlineEditorInput"}
                    accessibilityLabel={"inlineEditorInput"}
                    style={[Style.inputCls, valueCls]}
                    blurOnSubmit={true}
                    textAlignVertical="top"
                />
            ) : (
                <Typo
                    textAlign="right"
                    color={isEditable ? ROYAL_BLUE : BLACK}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    numberOfLines={2}
                    text={value}
                    style={{ maxWidth: rightTextWidth }}
                    onPress={onTextPress}
                />
            )}
        </View>
    );
};

const Style = StyleSheet.create({
    editableInputCls: {
        color: ROYAL_BLUE,
    },

    inputCls: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingTop: 0,
        textAlign: "right",
        width: rightTextWidth,
    },

    itemOuterCls: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        overflow: "visible",
    },

    nonEditableInputCls: {
        color: BLACK,
    },
});

InlineEditor.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    isEditable: PropTypes.bool,
    onValueChange: PropTypes.func,
    componentID: PropTypes.any,
    style: ViewPropTypes.style,
    multiline: PropTypes.bool,
    numberOfLines: PropTypes.number,
    labelNumberOfLines: PropTypes.number,
    maxLength: PropTypes.number,
    minLength: PropTypes.number,
    editType: PropTypes.oneOf(["inline", "press"]),
    onValuePress: PropTypes.func,
};

InlineEditor.defaultProps = {
    label: "",
    value: "",
    placeHolder: "",
    isEditable: false,
    componentID: "",
    onValueChange: () => {},
    style: {},
    multiline: true,
    numberOfLines: 2,
    labelNumberOfLines: 1,
    maxLength: 25,
    minLength: 2,
    editType: "inline", // inline | press
    onValuePress: () => {},
};

const Memoiz = React.memo(InlineEditor);

export default Memoiz;

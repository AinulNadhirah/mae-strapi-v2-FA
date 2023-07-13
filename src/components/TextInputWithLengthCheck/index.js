import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, PLACEHOLDER_TEXT, PREFILLED_PLACEHOLDER_TEXT, RED } from "@constants/colors";

import assets from "@assets";

const Styles = StyleSheet.create({
    hitSlop: {
        bottom: 10,
        left: 10,
        right: 10,
        top: 10,
    },
    infoBtn: {
        marginLeft: 5,
    },
    infoIcon: {
        height: 14,
        width: 14,
    },
    input: {
        alignSelf: "center",
        flex: 1,
        padding: 0,
    },
    inputFont: {
        color: BLACK,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 20,
    },
    inputLengthContainer: { position: "absolute", right: 3, top: 102.5 },
    inputLengthTxt: { flexGrow: 1 },
    labelContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 24,
    },
});

export default function TextInputWithLengthCheck({
    label,
    hasInfo,
    infoTitle = "",
    infoMessage = "",
    onPressInfoBtn,
    inputLengthCheck,
    showWarningColor,
    textInputRef,
    prefilledPlaceHolder,
    style,
    containerStyle,
    onFieldPress,
    ...props
}) {
    const { maxLength, value } = props;
    function onPressInfo() {
        onPressInfoBtn({ infoTitle, infoMessage });
    }

    return (
        <View style={containerStyle}>
            {label && (
                <>
                    <View style={Styles.labelContainer}>
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            lineHeight={18}
                            text={label}
                            textAlign="left"
                        />
                        {hasInfo && onPressInfo && (
                            <TouchableOpacity
                                style={Styles.infoBtn}
                                hitSlop={Styles.hitSlop}
                                onPress={onPressInfo}
                            >
                                <Image source={assets.info} style={Styles.infoIcon} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <SpaceFiller height={4} />
                </>
            )}
            <View onTouchEnd={onFieldPress}>
                <TextInput
                    inputRef={textInputRef}
                    style={[Styles.input, Styles.inputFont, style]}
                    placeholderTextColor={
                        prefilledPlaceHolder ? PREFILLED_PLACEHOLDER_TEXT : PLACEHOLDER_TEXT
                    }
                    {...props}
                />
            </View>
            {inputLengthCheck && maxLength && (
                <View style={Styles.inputLengthContainer}>
                    <Typo
                        style={Styles.inputLengthTxt}
                        text={value?.length > 0 ? maxLength - value?.length : maxLength}
                        fontSize={12}
                        lineHeight={15}
                        fontWeight="400"
                        color={
                            showWarningColor &&
                            maxLength - value?.length < 10 &&
                            maxLength - value?.length > 0
                                ? RED
                                : BLACK
                        }
                    />
                </View>
            )}
        </View>
    );
}

TextInputWithLengthCheck.propTypes = {
    label: PropTypes.string,
    hasInfo: PropTypes.bool,
    infoTitle: PropTypes.string,
    infoMessage: PropTypes.string,
    onPressInfoBtn: PropTypes.func,
    inputLengthCheck: PropTypes.bool,
    showWarningColor: PropTypes.bool,
    style: Text.propTypes.style,
    isValidate: PropTypes.bool,
    isValid: PropTypes.bool,
    isLoading: PropTypes.bool,
    errorMessage: PropTypes.string,
    prefix: PropTypes.string,
    prefixStyle: Text.propTypes.style,
    minLength: PropTypes.number,
    underlineStyle: Text.propTypes.style,
    containerStyle: Text.propTypes.style,
    onFieldPress: PropTypes.func,
    ...TextInput.propTypes,
};

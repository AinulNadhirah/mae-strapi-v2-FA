import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import {
    View,
    TextInput as Input,
    StyleSheet,
    Animated,
    ActivityIndicator,
    ViewPropTypes,
    TextInputProps,
    Platform,
} from "react-native";

import Typo from "@components/Text";

import { BLACK, FADE_GREY, PINKISH_GREY, PLACEHOLDER_TEXT, RED_ERROR } from "@constants/colors";

// import { useIsFocused } from "@react-navigation/native";

const TRANSPARENT = "transparent";

const Styles = StyleSheet.create({
    container: {
        alignItems: "stretch",
        flex: 1,
    },
    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        lineHeight: 24,
        padding: 0,
    },
    inputContainer: {
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    inputFont: {
        color: BLACK,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 20,
        // fontWeight: "bold",
    },
    invalidInput: {
        borderBottomColor: RED_ERROR,
    },
    prefix: {
        color: PLACEHOLDER_TEXT,
        lineHeight: 24,
        marginRight: 8,
    },
    wrapper: {
        flexDirection: "row",
        width: "100%",
    },
});

export default function LongTextInput({
    value,
    prefix,
    isValidate,
    isValid,
    errorMessage,
    isLoading,
    style,
    prefixStyle,
    autoFocus,
    inputRef,
    children,
    ...props
}) {
    const [isFilled, setFilled] = useState(false);
    const [inputHeight, setInputHeight] = useState(35);
    const [animateFill] = useState(new Animated.Value(0));
    const textInputRef = inputRef ?? useRef();

    let borderBottomColor = animateFill.interpolate({
        inputRange: [0, 1],
        outputRange: [PINKISH_GREY, BLACK],
    });

    useEffect(() => {
        if (!isFilled && value && value.length) {
            setFilled(true);

            Animated.timing(animateFill, {
                duration: 400,
                toValue: 1,
                useNativeDriver: false,
            }).start();
        } else if (isFilled && !value) {
            setFilled(false);

            Animated.timing(animateFill, {
                duration: 400,
                toValue: 0,
                useNativeDriver: false,
            }).start();
        }

        if (autoFocus && Platform.OS === "android") {
            setTimeout(() => {
                textInputRef.current && textInputRef.current.focus();
            }, 800);
        }
    }, [value, isValid, animateFill, isFilled, autoFocus, textInputRef]);

    useEffect(() => {
        // Workaround for 0.63.3 input
        // https://github.com/facebook/react-native/issues/30123
        Platform.OS === "android" &&
            textInputRef?.current?.setNativeProps({
                style: {
                    fontFamily: "Montserrat-Bold", // Bold seems to match the semibold on Android
                    fontWeight: "normal",
                },
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textInputRef]);

    const onContentSizeChange = (event) => {
        setInputHeight(event.nativeEvent.contentSize.height + 10);
    };

    return (
        <View style={Styles.wrapper}>
            <View style={Styles.container}>
                <Animated.View
                    style={[
                        Styles.inputContainer,
                        {
                            borderBottomColor,
                            height: Math.max(48, inputHeight),
                        },
                        isValidate && !isValid ? Styles.invalidInput : null,
                    ]}
                >
                    {prefix && (
                        <Typo
                            style={[Styles.inputFont, Styles.prefix, prefixStyle]}
                            textAlign="left"
                            text={prefix}
                        />
                    )}
                    <Input
                        ref={textInputRef}
                        value={value}
                        style={[Styles.input, Styles.inputFont, style]}
                        placeholderTextColor={PLACEHOLDER_TEXT}
                        underlineColorAndroid={TRANSPARENT}
                        autoFocus={Platform.OS === "ios" ? autoFocus : false}
                        onContentSizeChange={onContentSizeChange}
                        multiline
                        blurOnSubmit
                        {...props}
                    />
                    {isLoading && <ActivityIndicator size="small" color={FADE_GREY} />}
                    {children}
                </Animated.View>
                {isValidate && !isValid && errorMessage && (
                    <Typo style={Styles.errorMessage} textAlign="left" text={errorMessage} />
                )}
            </View>
        </View>
    );
}

LongTextInput.propTypes = {
    style: ViewPropTypes.style,
    isValidate: PropTypes.bool,
    isValid: PropTypes.bool,
    isLoading: PropTypes.bool,
    errorMessage: PropTypes.string,
    autoFocus: PropTypes.bool,
    prefix: ViewPropTypes.style,
    ...TextInputProps,
};

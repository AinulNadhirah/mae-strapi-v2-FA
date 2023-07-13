import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import {
    View,
    TextInput as Input,
    StyleSheet,
    Animated,
    ActivityIndicator,
    TextInputProps,
    Platform,
    Text,
} from "react-native";
import * as Anima from "react-native-animatable";

import Typo from "@components/Text";

import {
    BLACK,
    FADE_GREY,
    GREY,
    PINKISH_GREY,
    PLACEHOLDER_TEXT,
    RED_ERROR,
    TRANSPARENT,
} from "@constants/colors";

const Styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        position: "relative",
    },
    errorMessage: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
    errorTypo: {
        flexShrink: 1,
    },
    input: {
        alignSelf: "center",
        flex: 1,
        height: 24,
        padding: 0,
    },
    inputContainer: {
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 12,
    },
    inputFont: {
        color: BLACK,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 20,
    },
    invalidInput: {
        borderBottomColor: RED_ERROR,
    },
    prefix: {
        color: PLACEHOLDER_TEXT,
        lineHeight: 24,
        marginRight: 8,
    },
    suffix: {
        color: GREY,
        lineHeight: 24,
        marginLeft: 8,
    },
    textStyle: {
        fontFamily: "Montserrat-Bold", // Bold seems to match the semibold on Android
        fontWeight: "normal",
    },
    wrapper: {
        width: "100%",
    },
});

export default function TextInputWithReturnType({
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
    suffix,
    suffixStyle,
    testID,
    minLength = 0,
    children,
    returnKeyType,
    ...props
}) {
    const [isFilled, setFilled] = useState(false);
    const [animateFill] = useState(new Animated.Value(0));
    const textInputRef = inputRef ?? useRef();
    const securedText = props?.secureTextEntry ?? false;

    const borderBottomColor = animateFill.interpolate({
        inputRange: [0, 1],
        outputRange: [PINKISH_GREY, BLACK],
    });

    useEffect(() => {
        if (!isFilled && value?.length >= minLength) {
            setFilled(true);

            // we can't use native driver since we are animating the border color
            Animated.timing(animateFill, {
                duration: 400,
                toValue: 1,
                useNativeDriver: false,
            }).start();
        } else if (isFilled && value?.length < minLength) {
            setFilled(false);

            Animated.timing(animateFill, {
                duration: 400,
                toValue: 0,
                useNativeDriver: false,
            }).start();
        }
    }, [value, isValid, animateFill, isFilled, textInputRef, minLength]);

    useEffect(() => {
        if (autoFocus && Platform.OS === "android") {
            setTimeout(() => {
                textInputRef.current &&
                    !textInputRef.current.isFocused() &&
                    textInputRef.current.focus();
            }, 400);
        }
    }, [autoFocus, textInputRef]);

    useEffect(() => {
        // Workaround for 0.63.3 input
        // https://github.com/facebook/react-native/issues/30123
        Platform.OS === "android" &&
            textInputRef?.current?.setNativeProps({
                style: Styles.textStyle,
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textInputRef, securedText]);

    return (
        <View style={Styles.wrapper}>
            <View style={Styles.container}>
                <Animated.View
                    style={[
                        Styles.inputContainer,
                        {
                            borderBottomColor,
                        },
                        isValidate && !isValid ? Styles.invalidInput : null,
                    ]}
                >
                    {prefix && (
                        <Typo
                            style={[Styles.prefix, prefixStyle]}
                            fontSize={20}
                            fontWeight="bold"
                            lineHeight={24}
                            textAlign="left"
                            text={prefix}
                            testID={`textinput_prefix_${testID}`}
                        />
                    )}
                    <Input
                        ref={textInputRef}
                        value={value}
                        style={[Styles.input, Styles.inputFont, style]}
                        allowFontScaling={false}
                        placeholderTextColor={PLACEHOLDER_TEXT}
                        underlineColorAndroid={TRANSPARENT}
                        autoFocus={Platform.OS === "ios" ? autoFocus : false}
                        testID={testID}
                        returnKeyType={returnKeyType}
                        {...props}
                    />

                    {suffix && (
                        <Typo
                            style={[Styles.suffix, suffixStyle]}
                            fontSize={20}
                            fontWeight="bold"
                            lineHeight={24}
                            textAlign="right"
                            text={suffix}
                        />
                    )}

                    {isLoading && <ActivityIndicator size="small" color={FADE_GREY} />}
                    {children}
                </Animated.View>
                {isValidate && !isValid && errorMessage && (
                    <Anima.View
                        animation={{
                            from: {
                                translateY: -20,
                                opacity: 0,
                            },
                            to: {
                                translateY: 0,
                                opacity: 1,
                            },
                        }}
                        duration={200}
                        style={Styles.errorMessage}
                    >
                        <Typo
                            fontSize={12}
                            lineHeight={16}
                            textAlign="left"
                            color={RED_ERROR}
                            text={errorMessage}
                            style={Styles.errorTypo}
                            testID={`textinput_error_message_${testID}}`}
                        />
                    </Anima.View>
                )}
            </View>
        </View>
    );
}

TextInputWithReturnType.propTypes = {
    style: Text.propTypes.style,
    isValidate: PropTypes.bool,
    isValid: PropTypes.bool,
    isLoading: PropTypes.bool,
    errorMessage: PropTypes.string,
    autoFocus: PropTypes.bool,
    prefix: PropTypes.string,
    prefixStyle: Text.propTypes.style,
    minLength: PropTypes.number,
    returnKeyType: PropTypes.string,
    ...TextInputProps,
};

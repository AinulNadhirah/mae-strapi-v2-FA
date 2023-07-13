import React from "react";
import { View, TextInput } from "react-native";
import styles from "@styles/main";

const Input = ({
    label,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    editableType,
    placeholder,
    enabled,
    style,
    maxLength,
    minLength,
    onSubmitEditing,
    returnKeyType,
    autoFocus,
    numberOfLines,
    multiline = false,
    allowFontScaling = false,
    testID,
    accessibilityLabel,
    ...props
}) => {
    const { inputStyle, containerStyle, InputFocusStyle } = styles;

    // const setFocus = () => console.log('setFocus called');

    return (
        <View style={containerStyle}>
            <TextInput
                autoCorrect={false}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onSubmitEditing={onSubmitEditing}
                // onFocus={style=InputFocusStyle}
                style={style === null ? inputStyle : style}
                value={value}
                // keyboardType={keyboardType === null ? "default" : keyboardType}
                keyboardType={keyboardType}
                editable={editableType === null ? true : editableType}
                secureTextEntry={secureTextEntry === "true"}
                onChangeText={onChangeText}
                enabled={enabled}
                maxLength={maxLength}
                minLength={minLength}
                returnKeyType={returnKeyType}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
                numberOfLines={numberOfLines}
                multiline={multiline}
                allowFontScaling={allowFontScaling}
                autoCapitalize="none"
                {...props}
            />
        </View>
    );
};

export { Input };

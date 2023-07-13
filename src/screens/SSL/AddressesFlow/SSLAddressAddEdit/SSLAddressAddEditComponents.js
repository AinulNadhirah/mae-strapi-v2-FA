import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import { LongTextInput } from "@components/Common";
import Typo from "@components/Text";

import { BLACK, YELLOW, WHITE, FADE_GREY } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

export function AddressName({
    value,
    onChangeText,
    placeholder,
    maxLength,
    onEndEditing,
    isValid = true,
    errorMessage,

    // Home btn
    isHomeAvailable,
    isHomeSelected,
    onPressHome,

    // Work btn
    isWorkAvailable,
    isWorkSelected,
    onPressWork,
}) {
    return (
        <View>
            <Typo
                fontSize={14}
                fontWeight="normal"
                color={BLACK}
                textAlign="left"
                lineHeight={18}
                text="Address Name"
            />
            <View>
                <LongTextInput
                    fontFamily="montserrat-SemiBold"
                    placeholder={placeholder}
                    style={styles.notesArea}
                    value={value}
                    onChangeText={onChangeText}
                    maxLength={maxLength}
                    returnKeyType="done"
                    autoCorrect={false}
                    autoCapitalize="words"
                    onEndEditing={onEndEditing}
                    isValid={isValid}
                    isValidate
                    errorMessage={errorMessage}
                >
                    {(isHomeAvailable || isHomeSelected) && (
                        <TouchableOpacity
                            style={styles.homeIconContainer(isHomeSelected)}
                            onPress={onPressHome}
                        >
                            <Image source={assets.iconBlackHouse} style={styles.homeIcon} />
                        </TouchableOpacity>
                    )}

                    {(isWorkAvailable || isWorkSelected) && (
                        <TouchableOpacity
                            style={styles.workIconContainer(isWorkSelected)}
                            onPress={onPressWork}
                        >
                            <Image source={assets.iconBlackWork} style={styles.workIcon} />
                        </TouchableOpacity>
                    )}
                </LongTextInput>
            </View>
        </View>
    );
}
AddressName.propTypes = {
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    placeholder: PropTypes.string,
    maxLength: PropTypes.number,
    onEndEditing: PropTypes.func,
    isValid: PropTypes.bool,
    errorMessage: PropTypes.string,

    // Home btn
    isHomeAvailable: PropTypes.bool,
    isHomeSelected: PropTypes.bool,
    onPressHome: PropTypes.func,

    // Work btn
    isWorkAvailable: PropTypes.bool,
    isWorkSelected: PropTypes.bool,
    onPressWork: PropTypes.func,
};

export function Input({
    editable,
    subLabel,
    isShowBottomBorder,
    label,
    maxLength,
    onEndEditing,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    isValid = true,
    errorMessage,
    autoCapitalize = "words",
    children,
}) {
    return (
        <View style={styles.arbitraryMarginTop({ marginTop: 24 })}>
            <Typo
                fontSize={14}
                fontWeight="normal"
                color={BLACK}
                textAlign="left"
                lineHeight={18}
                text={label}
            />
            {!!subLabel && (
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    color={FADE_GREY}
                    textAlign="left"
                    lineHeight={18}
                    text={subLabel}
                    style={styles.arbitraryMarginTop({ marginTop: 4 })}
                />
            )}
            <View style={styles.arbitraryMarginTop({ marginTop: 10 })} />
            <LongTextInput
                placeholder={placeholder}
                isShowBottomBorder={isShowBottomBorder}
                editable={editable}
                numberOfLines={2}
                style={styles.notesArea}
                value={value}
                onChangeText={onChangeText}
                maxLength={maxLength}
                returnKeyType="done"
                autoCorrect={false}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                onEndEditing={onEndEditing}
                isValid={isValid}
                isValidate
                errorMessage={errorMessage}
                scrollEnabled={false}
            >
                {children}
            </LongTextInput>
        </View>
    );
}
Input.defaultProps = {
    keyboardType: "default",
};
Input.propTypes = {
    editable: PropTypes.bool,
    subLabel: PropTypes.string,
    isShowBottomBorder: PropTypes.bool,
    label: PropTypes.string,
    maxLength: PropTypes.number,
    onEndEditing: PropTypes.func,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,
    isValid: PropTypes.bool,
    autoCapitalize: PropTypes.string,
    errorMessage: PropTypes.string,
    children: PropTypes.any,
};

const styles = StyleSheet.create({
    arbitraryMarginTop: ({ marginTop }) => {
        return { marginTop: marginTop };
    },

    homeIcon: {
        height: 17,
        width: 17,
    },
    homeIconContainer: (isHomeSelected) => {
        return {
            height: 32,
            width: 32,
            borderRadius: 32 / 2,
            backgroundColor: isHomeSelected ? YELLOW : WHITE,
            alignItems: "center",
            justifyContent: "center",
            ...SSLStyles.shadow,
        };
    },
    notesArea: {
        fontSize: 20,
        letterSpacing: 0,
        marginRight: 5,
    },
    workIcon: {
        height: 17,
        width: 17,
    },
    workIconContainer: (isWorkSelected) => {
        return {
            height: 32,
            width: 32,
            marginLeft: 11,
            borderRadius: 32 / 2,
            backgroundColor: isWorkSelected ? YELLOW : WHITE,
            alignItems: "center",
            justifyContent: "center",
            ...SSLStyles.shadow,
        };
    },
});

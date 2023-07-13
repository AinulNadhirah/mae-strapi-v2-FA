import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { FADE_GREY, BLACK, ROYAL_BLUE, DARK_GREY } from "@constants/colors";

import Assets from "@assets";

// Detail Field Component
function DetailField({
    label,
    value,
    valueSubText1 = null,
    valueSubText2 = null,
    isEditable = false,
    onValuePress,
    style = {},
    infoNote = null,
    isShowLeftInfoIcon = false,
    onLeftInfoIconPress,
}) {
    const onTextPress = () => {
        if (onValuePress) onValuePress();
    };
    const onLeftInfoPress = () => {
        if (onLeftInfoIconPress) onLeftInfoIconPress();
    };

    return (
        <View style={[Style.detailFieldCont, style]}>
            <View style={Style.detailFieldInenCont}>
                <View style={Style.detailFieldLeftView}>
                    {/* Label */}
                    <Typo textAlign="left" lineHeight={19} text={label} />

                    {/* left info icon */}
                    {isShowLeftInfoIcon && (
                        <TouchableOpacity onPress={onLeftInfoPress}>
                            <Image
                                source={Assets.noteInfo}
                                style={Style.leftInfoIcon}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Spacer */}
                <View style={Style.spacerCls} />

                <View style={Style.detailFieldRightView}>
                    {/* Value */}
                    <Typo
                        textAlign="right"
                        color={isEditable ? ROYAL_BLUE : BLACK}
                        fontWeight="600"
                        lineHeight={18}
                        text={value}
                        onPress={onTextPress}
                    />

                    {/* Value Subtext 1 - Optional */}
                    {valueSubText1 && (
                        <Typo
                            textAlign="right"
                            color={FADE_GREY}
                            fontSize={12}
                            lineHeight={18}
                            style={Style.detailFieldSubtext1}
                            text={valueSubText1}
                        />
                    )}

                    {/* Value Subtext 2 - Optional */}
                    {valueSubText2 && (
                        <Typo
                            textAlign="right"
                            color={FADE_GREY}
                            fontSize={12}
                            lineHeight={18}
                            text={valueSubText2}
                        />
                    )}
                </View>
            </View>

            {infoNote && (
                <View style={Style.infoNoteContainer}>
                    <Image source={Assets.noteInfo} style={Style.infoIcon} resizeMode="contain" />

                    <Typo
                        fontSize={12}
                        textAlign="left"
                        lineHeight={15}
                        text={infoNote}
                        color={DARK_GREY}
                        style={Style.infoText}
                    />
                </View>
            )}
        </View>
    );
}

DetailField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    valueSubText1: PropTypes.string,
    valueSubText2: PropTypes.string,
    isEditable: PropTypes.bool,
    onValuePress: PropTypes.any,
    style: PropTypes.object,
    infoNote: PropTypes.string,
    isShowLeftInfoIcon: PropTypes.bool,
    onLeftInfoIconPress: PropTypes.any,
};

DetailField.defaultProps = {
    isEditable: false,
    onValuePress: () => {},
    style: {},
    infoNote: null,
};

const Style = StyleSheet.create({
    detailFieldCont: {
        marginHorizontal: 20,
        marginTop: 12,
    },

    detailFieldInenCont: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },

    detailFieldRightView: {
        flexShrink: 1,
        width: "50%",
    },

    detailFieldSubtext1: {
        marginTop: 5,
    },

    detailFieldLeftView: {
        alignItems: "flex-start",
        flexDirection: "row",
        width: "50%",
    },

    leftInfoIcon: {
        height: 16,
        width: 16,
        marginLeft: 10,
        marginTop: 3,
    },

    infoIcon: {
        height: 16,
        width: 16,
    },

    infoNoteContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 5,
        marginTop: 15,
    },

    infoText: {
        marginLeft: 8,
    },

    spacerCls: {
        width: 10,
    },
});

export default DetailField;

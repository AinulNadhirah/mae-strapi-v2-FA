import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { GREY, DARK_GREY, STATUS_GREEN, WHITE, BLACK } from "@constants/colors";

const VerticalStepper = ({
    number,
    color,
    title,
    titleColor,
    description,
    isLastItem,
    btnText,
    circleDimension,
}) => {
    return (
        <View style={Style.container}>
            {/* Left Container */}
            <View style={Style.leftContainer(circleDimension)}>
                {/* Circle with Number */}
                <View style={Style.circleContainer(circleDimension, color)}>
                    <Typo
                        fontSize={12}
                        fontWeight="600"
                        lineHeight={18}
                        text={number}
                        color={color === STATUS_GREEN ? WHITE : BLACK}
                    />
                </View>

                {/* Vertical Grey Line */}
                {!isLastItem && <View style={Style.verticalLine} />}
            </View>

            {/* Right Container */}
            <View style={Style.rightContainer}>
                {/* Title */}
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    text={title}
                    color={titleColor}
                    textAlign="left"
                    style={Style.titleCls}
                />

                {/* Description */}
                {description && (
                    <Typo
                        fontSize={12}
                        lineHeight={14}
                        text={description}
                        color={DARK_GREY}
                        textAlign="left"
                        style={[
                            Style.descriptionCls,
                            { marginBottom: description && !btnText ? 10 : 0 },
                        ]}
                    />
                )}

                {/* Button */}
                {btnText && (
                    <ActionButton
                        width={180}
                        height={30}
                        componentCenter={
                            <Typo fontSize={12} fontWeight="600" lineHeight={18} text={btnText} />
                        }
                        style={Style.btnCls}
                        // onPress={onApplyLoan}
                    />
                )}
            </View>
        </View>
    );
};

VerticalStepper.propTypes = {
    number: PropTypes.string,
    color: PropTypes.string,
    title: PropTypes.string,
    titleColor: PropTypes.string,
    description: PropTypes.string,
    isLastItem: PropTypes.bool,
    btnText: PropTypes.string,
    circleDimension: PropTypes.number,
};

VerticalStepper.defaultProps = {
    titleColor: BLACK,
    description: null,
    isLastItem: false,
    btnText: null,
    circleDimension: 25,
};

const Style = StyleSheet.create({
    btnCls: {
        marginBottom: 10,
        marginTop: 15,
    },

    circleContainer: (circleDimension, color) => ({
        height: circleDimension,
        width: circleDimension,
        borderRadius: circleDimension / 2,
        backgroundColor: color,
        textAlign: "center",
        justifyContent: "center",
    }),

    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        minHeight: 50,
        overflow: "hidden",
    },

    descriptionCls: {
        marginTop: 8,
    },

    leftContainer: (circleDimension) => ({
        alignItems: "center",
        width: circleDimension,
    }),

    rightContainer: {
        flex: 1,
        marginLeft: 20,
        paddingBottom: 8,
    },

    titleCls: {
        marginTop: 2,
    },

    verticalLine: {
        backgroundColor: GREY,
        flex: 1,
        marginVertical: 6,
        width: 1,
    },
});

export default VerticalStepper;

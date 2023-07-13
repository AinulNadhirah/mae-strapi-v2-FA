import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Platform } from "react-native";

import InlineTypography from "@components/FormComponents/InlineTypography";

import { WHITE, BLACK } from "@constants/colors";

const FormInline = ({
    title,
    titleFont,
    titleFontWeight,
    buttonTitle,
    buttonFont,
    buttonAction,
    buttonValue,
    subTextArray,
}) => {
    const onButtonPress = () => {
        buttonAction(buttonValue);
    };

    const subTextContent = (key, value) => {
        return value && value != "Please Select" ? (
            <InlineTypography
                label={key}
                value={value}
                componentID={buttonValue}
                numberOfLines={3}
                style={Style.inlineTypographyFieldCls}
            />
        ) : (
            <React.Fragment />
        );
    };

    return (
        <View style={Style.formDetail}>
            <InlineTypography
                label={title}
                leftFont={titleFont}
                leftFontWeight={titleFontWeight}
                value={buttonTitle}
                editType="press"
                isEditable={true}
                onValuePress={onButtonPress}
                rightFont={buttonFont}
                componentID={buttonValue}
                numberOfLines={3}
                style={Style.inlineTypographyTitle}
            />
            <View>
                {subTextArray.map((item) =>
                    subTextContent(Object.keys(item)[0], Object.values(item)[0])
                )}
            </View>
        </View>
    );
};

const Style = StyleSheet.create({
    formDetail: {
        backgroundColor: WHITE,
        marginTop: 24,
        // paddingBottom: 12,
        paddingHorizontal: 34,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
    },
    inlineTypographyFieldCls: {
        marginBottom: Platform.OS === "ios" ? 14 : 10,
    },
    inlineTypographyTitle: {
        height: 30,
        marginTop: 14,
        marginBottom: 14,
    },
});

FormInline.propTypes = {
    title: PropTypes.string.isRequired,
    titleFont: PropTypes.number,
    titleFontWeight: PropTypes.string,
    buttonTitle: PropTypes.string.isRequired,
    buttonFont: PropTypes.number,
    buttonAction: PropTypes.func,
    buttonValue: PropTypes.string,
    subTextArray: PropTypes.array.isRequired,
};

FormInline.defaultProps = {
    title: "",
    titleFont: 17,
    titleFontWeight: "600",
    buttonTitle: "Edit",
    buttonFont: 14,
    buttonAction: () => {},
    buttonValue: "",
    subTextArray: [],
};

const Memoiz = React.memo(FormInline);

export default Memoiz;

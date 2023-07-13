import Proptypes from "prop-types";
import React from "react";
import { Text as NativeText } from "react-native";

import { BLACK } from "@constants/colors";

const fontFamilyWeight = {
    100: "-Thin",
    200: "-ExtraLight",
    300: "-Light",
    400: "-Regular",
    500: "-Medium",
    600: "-SemiBold",
    700: "-Bold",
    800: "-ExtraBold",
    900: "-Black",
    normal: "-Regular",
    "semi-bold": "-SemiBold",
    bold: "-Bold",
};

const fontFamilyItalic = {
    100: "-ThinItalic",
    200: "-ExtraLightItalic",
    300: "-LightItalic",
    400: "-Regular",
    500: "-MediumItalic",
    600: "-SemiBoldItalic",
    700: "-BoldItalic",
    800: "-ExtraBoldItalic",
    900: "-BlackItalic",
    normal: "-Regular",
    "semi-bold": "-SemiBoldItalic",
    bold: "-BlackItalic",
};

const Text = ({
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    textAlign,
    color,
    backgroundColor,
    children,
    text,
    style,
    onPressText,
    ...props
}) => {
    return (
        <NativeText
            allowFontScaling={false}
            onPress={onPressText}
            style={[
                {
                    fontFamily: `Montserrat${
                        fontWeight
                            ? fontStyle === "italic"
                                ? fontFamilyItalic[fontWeight]
                                : fontFamilyWeight[fontWeight]
                            : ""
                    }`,
                },
                {
                    fontSize,
                    lineHeight,
                    letterSpacing,
                    textAlign,
                    color,
                    backgroundColor,
                },
                style,
            ]}
            {...props}
        >
            {children || text}
        </NativeText>
    );
};

Text.propTypes = {
    fontSize: Proptypes.number,
    fontWeight: Proptypes.string,
    fontStyle: Proptypes.string,
    lineHeight: Proptypes.number,
    letterSpacing: Proptypes.number,
    textAlign: Proptypes.string,
    color: Proptypes.string,
    backgroundColor: Proptypes.string,
    children: Proptypes.any,
    text: Proptypes.string,
    style: NativeText.propTypes.style,
    onPressText: Proptypes.func,
};

Text.defaultProps = {
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: "center",
    color: BLACK,
};

// nothing to memo, each prop changed will require update anyway
export default Text;

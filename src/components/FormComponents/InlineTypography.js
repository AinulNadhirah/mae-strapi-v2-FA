import PropTypes from "prop-types";
import React from "react";
import {
    View,
    StyleSheet,
    ViewPropTypes,
    Image,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
} from "react-native";

import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE } from "@constants/colors";

import Assets from "@assets";

const screenWidth = Dimensions.get("window").width;
const leftTextWidth = (screenWidth * 55) / 100;
const rightTextWidth = (screenWidth * 35) / 100;

const InlineTypography = ({
    label,
    value,
    isEditable,
    style,
    componentID,
    numberOfLines,
    labelNumberOfLines,
    onValuePress,
    leftFont,
    rightFont,
    leftFontWeight,
    rightFontWeight,
    infoBtn,
    infoBtnPress,
    isImage,
    img,
    isBase64,
}) => {
    const onTextPress = () => {
        if (isEditable || isImage) {
            onValuePress(value, componentID);
        }
    };

    const onInfoPress = () => {
        console.log("[inlineTypography] >> [onInfoPress]");
        infoBtnPress();
    };

    return (
        <View style={[Style.itemOuterCls, style]}>
            <View style={Style.leftItemCls}>
                <Typo
                    color={BLACK}
                    textAlign="left"
                    fontSize={leftFont}
                    fontWeight={leftFontWeight}
                    lineHeight={19}
                    text={label}
                    numberOfLines={labelNumberOfLines}
                    style={[
                        Style.leftTypography,
                        { height: labelNumberOfLines === 3 ? 60 : "auto" },
                    ]}
                />

                {infoBtn && (
                    <TouchableOpacity onPress={onInfoPress}>
                        <Image source={Assets.passwordInfo} style={Style.image} />
                    </TouchableOpacity>
                )}
            </View>
            {isImage ? (
                <TouchableOpacity onPress={onTextPress}>
                    {!isBase64 ? (
                        <Image source={img} style={Style.camImage} />
                    ) : (
                        <ImageBackground
                            style={Style.cardCaptureImg}
                            imageStyle={Style.backgroundImgView}
                            source={{
                                uri: isBase64,
                            }}
                        />
                    )}
                </TouchableOpacity>
            ) : (
                <Typo
                    textAlign="right"
                    color={isEditable ? ROYAL_BLUE : BLACK}
                    fontSize={rightFont}
                    fontWeight={rightFontWeight}
                    lineHeight={rightFont > 16 ? 24 : 18}
                    numberOfLines={numberOfLines}
                    text={value}
                    style={Style.rightTypography}
                    onPress={onTextPress}
                />
            )}
        </View>
    );
};

const Style = StyleSheet.create({
    inputCls: {
        fontFamily: "montserrat",
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
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

    rightTypography: { maxWidth: rightTextWidth },
    leftTypography: { maxWidth: leftTextWidth },

    image: {
        height: 15,
        marginLeft: 5,
        marginTop: 2,
        width: 15,
    },
    camImage: {
        height: 24,
        width: 24,
        marginLeft: 5,
    },
    leftItemCls: {
        alignItems: "flex-start",
        flexDirection: "row",
        overflow: "visible",
    },

    cardCaptureImg: {
        height: 50,
        width: 50,
        marginRight: -13,
    },
    backgroundImgView: {
        borderRadius: 25,
        height: 50,
        width: 50,
    },
});

InlineTypography.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    isEditable: PropTypes.bool,
    componentID: PropTypes.any,
    style: ViewPropTypes.style,
    numberOfLines: PropTypes.number,
    labelNumberOfLines: PropTypes.number,
    onValuePress: PropTypes.func,
    leftFont: PropTypes.number,
    rightFont: PropTypes.number,
    leftFontWeight: PropTypes.string,
    rightFontWeight: PropTypes.string,
    infoBtn: PropTypes.bool,
    infoBtnPress: PropTypes.func,
    isImage: PropTypes.bool,
    img: PropTypes.number,
    isBase64: PropTypes.string,
};

InlineTypography.defaultProps = {
    label: "",
    value: "",
    placeHolder: "",
    isEditable: false,
    componentID: "",
    style: {},
    numberOfLines: 2,
    labelNumberOfLines: 2,
    onValuePress: () => {},
    leftFont: 12,
    rightFont: 12,
    leftFontWeight: "normal",
    rightFontWeight: "600",
    infoBtn: false,
    infoBtnPress: () => {},
    isImage: false,
    img: "",
    isBase64: "",
};

const Memoiz = React.memo(InlineTypography);

export default Memoiz;

import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { OFF_WHITE, PINKISH_GREY, DARK_GREY, ROYAL_BLUE } from "@constants/colors";

import { getShadow, getShortNameTransfer } from "@utils/dataModel/utility";

import Assets from "@assets";

const TransferImageAndDetails = ({
    title,
    subtitle,
    description,
    viewButtonText,
    onBtPress,
    image,
    altenativeText,
    isVertical,
    fontWeight,
    textAlign,
    selectedState,
    hideLogo,
    additionalData,
}) => {
    const [imageData, setImageData] = useState(image);

    useEffect(() => {
        setImageData(image);
    }, [image, image.source]);

    return (
        <View style={isVertical ? Styles.billerInfoColumn : Styles.billerInfoRow}>
            {!hideLogo && (
                <View style={Styles.circleImageContainer}>
                    <View style={Styles.circleImageView}>
                        {imageData.type === "local" && (
                            <Image
                                style={Styles.circleImageView1}
                                source={imageData.source}
                                resizeMode="stretch"
                                resizeMethod="scale"
                            />
                        )}
                        {imageData.type === "url" && (
                            <Image
                                style={Styles.circleImageView1}
                                source={{ uri: imageData.source }}
                                resizeMode="stretch"
                                resizeMethod="scale"
                                onError={(error) =>
                                    setImageData({
                                        type: "text",
                                        source: title ? title : altenativeText,
                                    })
                                }
                            />
                        )}
                        {imageData.type === "text" && (
                            // <View style={{ backgroundColor: "#f8f8f8", width: "100%", height: "100%" }}>
                            <Typo
                                fontSize={24}
                                fontWeight="300"
                                lineHeight={50}
                                textAlign="center"
                                color={DARK_GREY}
                                text={getShortNameTransfer(imageData.source, 2)}
                                // style={{ borderWidth: 1, borderColor: "red", padding: 0 }}
                            />
                            // </View>
                        )}
                    </View>
                </View>
            )}
            <View style={isVertical ? Styles.billerInfoTextColumn : Styles.billerInfoTextRow}>
                <View
                    style={
                        isVertical
                            ? textAlign === "center"
                                ? Styles.logoTitleColumnCenter
                                : Styles.logoTitleColumn
                            : Styles.logoTitleRow
                    }
                >
                    <Typo
                        fontSize={14}
                        fontWeight={fontWeight ?? "600"}
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color="#000000"
                        textAlign={textAlign ?? "left"}
                        text={title}
                        style={!additionalData?.noStyleTitle && Styles.capitalize}
                    />

                    <View style={Styles.greenTick}>
                        <Image
                            display={title === selectedState ? "flex" : "none"}
                            source={Assets.icRoundedGreenTick}
                        />
                    </View>
                </View>
                {(subtitle ? true : false) && (
                    <View style={isVertical ? Styles.logoSubtitleColumn : Styles.logoSubtitleRow}>
                        <Typo
                            fontSize={isVertical ? 14 : 12}
                            fontWeight="300"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color="#000000"
                            textAlign="left"
                            text={subtitle}
                        />
                    </View>
                )}

                {description && (
                    <Typo
                        fontSize={12}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={17}
                        color="#7c7c7d"
                        textAlign="left"
                        text={description}
                    />
                )}

                {viewButtonText && (
                    <TouchableOpacity
                        onPress={onBtPress}
                        testID="txtViewButton"
                        accessibilityLabel="txtViewButton"
                    >
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            color={ROYAL_BLUE}
                            textAlign="left"
                            text={viewButtonText}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

TransferImageAndDetails.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    viewButtonText: PropTypes.string,
    onBtPress: PropTypes.func,
    image: PropTypes.object,
    altenativeText: PropTypes.string,
    isVertical: PropTypes.bool,
    logo: PropTypes.string,
    selectedState: PropTypes.string,
    hideLogo: PropTypes.bool,
    fontWeight: PropTypes.oneOf([
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
        "normal",
        "semi-bold",
        "bold",
    ]),
    textAlign: PropTypes.oneOf(["center", "left", "right", "auto", "justify"]),
    additionalData: PropTypes.object,
};

TransferImageAndDetails.defaultProps = {
    title: "",
    image: { source: "", type: "local" },
};

const Memoiz = React.memo(TransferImageAndDetails);

export default Memoiz;

const Styles = {
    billerInfoTextRow: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
        flexDirection: "column",
    },

    billerInfoTextColumn: {
        flex: 1,
        // marginLeft: 16,
        alignItems: "center",
        flexDirection: "column",
        // borderWidth: 1,
        // borderColor: "blue",
    },

    billerInfoRow: {
        width: "100%",
        flexDirection: "row",
        // paddingTop: 22,
        // paddingBottom: 17,
        // // borderBottomWidth: 1,
        // // borderBottomColor: "#cfcfcf",
    },
    billerInfoColumn: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
    },
    logoTitleColumn: { marginTop: 14, flexDirection: "row" },
    logoTitleColumnCenter: { marginTop: 14 },
    logoTitleRow: { flexDirection: "row", justifyContent: "space-between" },
    logoSubtitleColumn: { marginTop: 4 },
    logoSubtitleRow: {},
    capitalize: { textTransform: "capitalize" },
    circleImageView: {
        width: 64,
        height: 64,
        // alignItems: "center",
        borderColor: OFF_WHITE,
        backgroundColor: PINKISH_GREY,
        borderStyle: "solid",
        borderWidth: 2,

        // elevation: 5,
        // justifyContent: "center",
        // shadowColor: BLACK,
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        borderRadius: 64 / 2,
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
        justifyContent: "center",
        alignItems: "center",
    },
    circleImageContainer: {
        width: 70,
        height: 70,
        // borderColor: "green",
        // borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    greenTick: {
        // width: 260,
        height: 20,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        paddingRight: 15,
    },
    circleImageView1: {
        width: 60,
        height: 60,
    },
};

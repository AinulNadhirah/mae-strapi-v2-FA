/* eslint-disable react/prop-types */
import React from "react";
import { View, Image } from "react-native";
import Typo from "@components/Text";
import { WHITE, GREY, DARK_GREY } from "@constants/colors";

const CircularTextImage = ({ source, defaultImage, showText, text }) => {
    //const { text } = data;

    return (
        <View
            style={Styles.editIconView1}
            testID={"btnEditAmount"}
            accessibilityLabel={"btnEditAmount"}
        >
            {source && source.length && !showText ? (
                <Image
                    style={Styles.receiptIconBase64}
                    accessible={true}
                    resizeMode="cover"
                    source={{
                        uri:
                            source.indexOf("http") != -1
                                ? source
                                : "data:image/jpeg;base64," +
                                  source.replace("data:image/jpeg;base64,", ""),
                    }}
                />
            ) : text != undefined && text.length >= 1 ? (
                <Typo
                    fontSize={24}
                    fontWeight="300"
                    lineHeight={50}
                    textAlign="center"
                    color={DARK_GREY}
                    text={text}
                />
            ) : (
                <Image
                    style={Styles.receiptIcon}
                    source={defaultImage}
                    resizeMethod="resize"
                    resizeMode="stretch"
                />
            )}
        </View>
    );
};

const Styles = {
    editIconView1: {
        alignItems: "center",
        backgroundColor: GREY,
        borderColor: WHITE,
        borderRadius: 63 / 2,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        height: 63,
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 63,
    },
    receiptIcon: {
        width: 64,
        height: 64,
        borderRadius: 64 / 2,
        marginTop: -9.3,
    },
    receiptIconBase64: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
    },
    shortNameLabelBlack: {
        // fontFamily: 'montserrat_regular',
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
    shortNameLabel: {
        // fontFamily: 'montserrat_regular',
        fontFamily: "montserrat",
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
};

export { CircularTextImage };

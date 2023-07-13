import React from "react";
import { View, StyleSheet, Platform } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { LIGHT_GREY, LOADER_DARK_GRAY, WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

const LoadingPropertyTile = () => {
    return (
        <View style={[Platform.OS === "ios" ? Style.shadow : {}, Style.propTileOuterCont]}>
            <View style={[Platform.OS === "ios" ? {} : Style.shadow, Style.propTilerInnerCont]}>
                <View style={Style.propTopImgCont} />
                <View style={Style.propContentContainer}>
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine1} />
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine2} />
                    <ShimmerPlaceHolder
                        autoRun
                        visible={false}
                        style={Style.propContentLine3}
                        colorShimmer={[LIGHT_GREY, LOADER_DARK_GRAY]}
                    />
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine4} />
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine4} />
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine4} />
                    <ShimmerPlaceHolder autoRun visible={false} style={Style.propContentLine4} />
                </View>
            </View>
        </View>
    );
};

const Style = StyleSheet.create({
    propContentContainer: {
        alignItems: "flex-start",
        paddingHorizontal: 15,
        paddingVertical: 20,
    },

    propContentLine1: {
        borderRadius: 8,
        height: 8,
        width: "100%",
    },

    propContentLine2: {
        borderRadius: 8,
        height: 13,
        marginTop: 5,
        width: "100%",
    },

    propContentLine3: {
        borderRadius: 8,
        height: 12,
        marginBottom: 5,
        marginTop: 15,
        width: "75%",
    },

    propContentLine4: {
        borderRadius: 8,
        height: 10,
        marginTop: 7,
        width: "75%",
    },

    propTileOuterCont: {
        flexDirection: "row",
        marginHorizontal: 24,
        marginTop: 20,
    },

    propTilerInnerCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flex: 1,
        overflow: "hidden",
    },

    propTopImgCont: {
        backgroundColor: LOADER_DARK_GRAY,
        height: 200,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
});
export default LoadingPropertyTile;

import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Platform, Image } from "react-native";

import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import LoadingPropertyTile from "./Common/LoadingPropertyTile";

function DiscoverLoader({ loading, empty }) {
    const tempArray = [0, 1, 2];
    return (
        <>
            {loading && (
                <>
                    {/* Property Tile Loader */}
                    {tempArray.map((item, index) => (
                        <LoadingPropertyTile key={index} />
                    ))}
                </>
            )}

            {!loading && empty && <EmptyPropertyTile />}
        </>
    );
}

const EmptyPropertyTile = () => {
    return (
        <View style={[Platform.OS === "ios" ? Style.shadow : {}, Style.emptyTileOuterCont]}>
            <View style={[Platform.OS === "ios" ? {} : Style.shadow, Style.emptyTilerInnerCont]}>
                <View style={Style.emptyTileTextCont}>
                    <Typo
                        fontSize={13}
                        lineHeight={18}
                        text="Oops! There's nothing to show at this moment. Please try again later"
                    />
                </View>
                <Image style={Style.emptyTileImgCls} source={Assets.propertyTileEmptyState} />
            </View>
        </View>
    );
};

DiscoverLoader.propTypes = {
    loading: PropTypes.bool,
    empty: PropTypes.bool,
};

const Style = StyleSheet.create({
    emptyTileImgCls: {
        height: 180,
        width: "100%",
    },

    emptyTileOuterCont: {
        marginHorizontal: 24,
        marginVertical: 20,
    },

    emptyTileTextCont: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },

    emptyTilerInnerCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flex: 1,
        overflow: "hidden",
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
});

export default DiscoverLoader;

import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE, LOADER_DARK_GRAY, LIGHT_GREY } from "@constants/colors";

import Assets from "@assets";

function ApplicationLoader({ loading, empty }) {
    const tempArray = useMemo(() => {
        return [0, 1, 2];
    }, []);

    const loaderTiles = useMemo(() => {
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Application Tile Loader */}
                {tempArray.map((index) => (
                    <LoadingApplicationTile key={index} />
                ))}
            </ScrollView>
        );
    }, [tempArray]);

    const emptyScreen = useMemo(() => {
        return <EmptyScreen />;
    }, []);

    return (
        <>
            {loading && loaderTiles}

            {!loading && empty && emptyScreen}
        </>
    );
}

ApplicationLoader.propTypes = {
    loading: PropTypes.bool,
    empty: PropTypes.bool,
};

function EmptyScreen() {
    return (
        <View style={Style.emptyStateContainer}>
            <EmptyStateScreen
                headerText="No Applications Available"
                subText="You don't have any home financing applications at the moment."
                showBtn={false}
                imageSrc={Assets.propertyListEmptyState}
            />
        </View>
    );
}

function LoadingApplicationTile() {
    const tempArray = [0, 1, 2, 3];
    return (
        <View style={[Style.loadingContainer, Style.horizontalMargin]}>
            <View style={Style.loaderHeader} />
            <View style={Style.loadingTileBody}>
                <View style={Style.loadingTileInnerBody}>
                    {tempArray.map((index) => (
                        <View style={Style.contentBlock} key={index}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={Style.contentHeader}
                                colorShimmer={[LIGHT_GREY, LOADER_DARK_GRAY]}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={Style.contentValue}
                                colorShimmer={[LIGHT_GREY, LOADER_DARK_GRAY]}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const Style = StyleSheet.create({
    contentBlock: {
        marginBottom: 5,
        minHeight: 50,
        width: "50%",
    },

    contentHeader: {
        borderRadius: 8,
        height: 10,
        width: "80%",
    },

    contentValue: {
        borderRadius: 8,
        height: 7,
        marginTop: 8,
        width: "50%",
    },

    emptyStateContainer: {
        flex: 1,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    loaderHeader: {
        backgroundColor: LOADER_DARK_GRAY,
        height: 50,
        width: "100%",
    },

    loadingContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 25,
        overflow: "hidden",
    },

    loadingTileBody: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    loadingTileInnerBody: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
});

export default ApplicationLoader;

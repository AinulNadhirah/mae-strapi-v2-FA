import React from "react";
import { StyleSheet, View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { GREY_200, SHADOW_LIGHT, WHITE } from "@constants/colors";

const styles = StyleSheet.create({
    discoverItemLoading: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 200,
        marginRight: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 192,
    },
    discoverItemLoadingImg: {
        backgroundColor: GREY_200,
        height: 120,
        width: 192,
    },
    discoverItemLoadingInner: {
        borderRadius: 8,
        overflow: "hidden",
    },
    discoverItemLoadingMetaContainer: {
        padding: 16,
    },
    itemLoadingMetaTitle: {
        backgroundColor: GREY_200,
        height: 4,
        marginBottom: 8,
        width: "100%",
    },
    loadingText: {
        backgroundColor: GREY_200,
        height: 4,
        width: "50%",
    },
});

export function DiscoverItemLoading() {
    return (
        <View style={styles.discoverItemLoading}>
            <View style={styles.discoverItemLoadingInner}>
                <ShimmerPlaceHolder style={styles.discoverItemLoadingImg} />
                <View style={styles.discoverItemLoadingMetaContainer}>
                    <ShimmerPlaceHolder
                        autoRun
                        visible={false}
                        style={styles.itemLoadingMetaTitle}
                    />
                    <ShimmerPlaceHolder style={styles.loadingText} />
                </View>
            </View>
        </View>
    );
}

import React from "react";
import { StyleSheet, View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE, GREY_200, GREY_300, GREY_100, SEPARATOR } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

const styles = StyleSheet.create({
    containerCuisine: { flexDirection: "row", marginTop: 15 },

    containerTop: {
        flexDirection: "column",
        marginTop: 40,
        paddingHorizontal: 24,
    },
    detailsContainer: {
        backgroundColor: WHITE,
        flex: 2,
        justifyContent: "space-around",
        paddingBottom: 8,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    detailsLine1: {
        borderRadius: 3,
        height: 20,
        width: "45%",
    },
    detailsLine2: {
        borderRadius: 3,
        height: 20,
        width: "100%",
    },
    detailsLine3: {
        borderRadius: 3,
        height: 20,
        width: "20%",
    },
    imageContainer: { backgroundColor: GREY_200, flex: 1 },
    imageView: {
        height: 240,
        width: "100%",
    },
    menuItemContainer: {
        borderRadius: 8,
        flexDirection: "row",
        height: 112,
        overflow: "hidden",
    },
    menuItemShadow: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 16,
        ...SSLStyles.shadow,
    },
    paddingWidth: { width: "5%" },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginTop: 25,
    },
    shimmerCuisine: {
        borderRadius: 3,
        height: 20,
        width: "32.5%",
    },
    shimmerLine1: {
        borderRadius: 3,
        height: 20,
        overflow: "hidden",
        width: "90%",
    },
    shimmerLine2: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 20,
        marginTop: 15,
        width: "70%",
    },
    shimmerTitle: {
        borderRadius: 3,
        height: 20,
        marginBottom: 25,
        width: "20%",
    },
    titleContainer: {
        marginTop: 25,
        paddingHorizontal: 24,
    },
});

const colorShimmer = [GREY_300, GREY_100, GREY_300];

export default function SSLMerchantDetailsShimmer() {
    return (
        <View>
            <View style={[styles.imageView, { backgroundColor: GREY_200 }]} />
            <View style={styles.containerTop}>
                <ShimmerPlaceHolder
                    autoRun
                    colorShimmer={colorShimmer}
                    style={styles.shimmerLine1}
                />
                <ShimmerPlaceHolder
                    autoRun
                    colorShimmer={colorShimmer}
                    style={styles.shimmerLine2}
                />
                <View style={styles.containerCuisine}>
                    <ShimmerPlaceHolder
                        autoRun
                        colorShimmer={colorShimmer}
                        style={styles.shimmerCuisine}
                    />
                    <View style={styles.paddingWidth} />
                    <ShimmerPlaceHolder
                        autoRun
                        colorShimmer={colorShimmer}
                        style={styles.shimmerCuisine}
                    />
                </View>
            </View>

            <View style={styles.separator} />
            <View style={styles.titleContainer}>
                <ShimmerPlaceHolder
                    autoRun
                    colorShimmer={colorShimmer}
                    style={styles.shimmerTitle}
                />
                {[1, 2].map((index) => {
                    return (
                        <View style={styles.menuItemShadow} key={`${index}`}>
                            <View style={styles.menuItemContainer}>
                                <View style={styles.imageContainer} />
                                <View style={styles.detailsContainer}>
                                    <ShimmerPlaceHolder
                                        autoRun
                                        colorShimmer={colorShimmer}
                                        style={styles.detailsLine1}
                                    />
                                    <ShimmerPlaceHolder
                                        autoRun
                                        colorShimmer={colorShimmer}
                                        style={styles.detailsLine2}
                                    />
                                    <ShimmerPlaceHolder
                                        autoRun
                                        colorShimmer={colorShimmer}
                                        style={styles.detailsLine3}
                                    />
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

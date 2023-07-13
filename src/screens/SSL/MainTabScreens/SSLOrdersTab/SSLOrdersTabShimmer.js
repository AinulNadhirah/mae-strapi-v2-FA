import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE, GREY_300, GREY_100, SEPARATOR } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 8,
        flexDirection: "column",
        overflow: "hidden",
        padding: 15,
    },
    cardShadow: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 16,
        ...SSLStyles.shadow,
    },
    container: { flex: 1 },
    deliveryType: {
        borderRadius: 3,
        height: 20,
        width: "20%",
    },
    line1Container: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 20,
    },
    mainContainer: {
        paddingHorizontal: 24,
    },
    merchantName: {
        borderRadius: 3,
        height: 20,
        width: "45%",
    },
    orderStatus: {
        borderRadius: 3,
        height: 20,
        width: "20%",
    },
    placedDate: {
        borderRadius: 3,
        height: 20,
        width: "40%",
    },
    productIcon: {
        borderRadius: 3,
        height: 40,
        width: 40,
    },
    productName: {
        borderRadius: 3,
        height: 20,
        marginLeft: 15,
        width: "50%",
    },
    quantity: {
        borderRadius: 3,
        height: 20,
        width: "7%",
    },
    rating: {
        borderRadius: 3,
        height: 20,
        width: "20%",
    },
    separator: {
        backgroundColor: SEPARATOR,
        height: 1,
        marginTop: 20,
    },
});

const colorShimmer = [GREY_300, GREY_100, GREY_300];

export default function SSLOrdersTabShimmer() {
    return (
        <ScrollView style={styles.mainContainer}>
            {[1, 2].map((index) => {
                return (
                    <View style={styles.cardShadow} key={`${index}`}>
                        <View style={styles.cardContainer}>
                            {/** Merchant title */}
                            <ShimmerPlaceHolder
                                autoRun
                                colorShimmer={colorShimmer}
                                style={styles.merchantName}
                            />
                            {/** Product image, name, quantity */}
                            <View style={styles.line1Container}>
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.productIcon}
                                />
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.productName}
                                />
                                <View style={styles.container} />
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.quantity}
                                />
                            </View>
                            <View style={styles.separator} />

                            {/** Order placed date, order status */}
                            <View style={styles.line1Container}>
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.placedDate}
                                />
                                <View style={styles.container} />
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.orderStatus}
                                />
                            </View>

                            {/** Delivery type, rating */}
                            <View style={styles.line1Container}>
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.deliveryType}
                                />
                                <View style={styles.container} />
                                <ShimmerPlaceHolder
                                    autoRun
                                    colorShimmer={colorShimmer}
                                    style={styles.rating}
                                />
                            </View>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

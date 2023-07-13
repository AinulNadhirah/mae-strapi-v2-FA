import React from "react";
import { StyleSheet, View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import {
    YELLOW,
    WHITE,
    GREY,
    DARK_GREY,
    GREY_200,
    GREY_300,
    SHADOW,
    GREY_100,
} from "@constants/colors";

export default function MerchantDetailsShimmer() {
    return (
        <View>
            <ShimmerPlaceHolder autoRun style={styles.bannerViewShimmer} />

            <View style={styles.containerPadding}>
                <View>
                    <ShimmerPlaceHolder autoRun style={styles.shimmerTitle} />
                </View>
                <View style={styles.priceShimmerContainer}>
                    <ShimmerPlaceHolder autoRun style={styles.priceShimmerContainerValue} />
                    <View style={styles.circularView} />
                    <ShimmerPlaceHolder autoRun style={styles.priceShimmerContainerCuisine} />
                </View>

                <View style={styles.outletShimmerContainer}>
                    <ShimmerPlaceHolder autoRun style={styles.outletShimmerContainerItem} />
                </View>

                <View style={styles.contactsViewShimmer}>
                    <ShimmerPlaceHolder autoRun style={styles.shimmerTitle} />
                </View>
                <View style={styles.contactsViewShimmer}>
                    <ShimmerPlaceHolder autoRun style={styles.shimmerTitle} />
                </View>
                <View style={styles.contactsViewShimmer}>
                    <ShimmerPlaceHolder autoRun style={styles.shimmerTitle} />
                </View>

                <View style={styles.buttonsViewShimmer}>
                    <View style={styles.actionBtnSecondaryShimmer}>
                        <View style={styles.actionShimmerContainer}>
                            <ShimmerPlaceHolder autoRun style={styles.actionShimmerItem} />
                        </View>
                    </View>
                    <View style={styles.btnSpacing} />
                    <View style={styles.actionBtnPrimaryShimmer}>
                        <View style={styles.actionShimmerContainer}>
                            <ShimmerPlaceHolder autoRun style={styles.actionShimmerItem} />
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.moreMerchantShimmerOuterContainer}>
                <MoreMerchantShimmer />
                <MoreMerchantShimmer />
            </View>
        </View>
    );
}
function MoreMerchantShimmer() {
    return (
        <View style={styles.moreMerchantShimmerContainer}>
            <View style={styles.moreMerchantShimmerContainerInner}>
                <View>
                    <ShimmerPlaceHolder autoRun style={styles.moreMerchantShimmerContainerImage} />
                </View>
                <View style={styles.moreMerchantShimmerContainerContent}>
                    <ShimmerPlaceHolder
                        autoRun
                        style={styles.moreMerchantShimmerContainerContentTitle}
                    />
                    <ShimmerPlaceHolder
                        autoRun
                        style={styles.moreMerchantShimmerContainerContentMetaPrimary}
                    />
                    <ShimmerPlaceHolder
                        autoRun
                        style={styles.moreMerchantShimmerContainerContentMetaSecondary}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    actionBtnPrimaryShimmer: {
        backgroundColor: YELLOW,
        borderRadius: 48,
        flex: 1,
        height: 48,
        justifyContent: "center",
    },
    actionBtnSecondaryShimmer: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 48,
        borderWidth: 1,
        flex: 1,
        height: 48,
        justifyContent: "center",
    },
    actionShimmerContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    actionShimmerItem: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        width: 80,
    },
    bannerViewShimmer: {
        backgroundColor: GREY_200,
        height: 240,
        width: "100%",
    },
    btnSpacing: { width: 16 },
    buttonsViewShimmer: {
        flexDirection: "row",
        marginTop: 24,
    },
    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    contactsViewShimmer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 24,
        width: "90%",
    },
    containerPadding: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    moreMerchantShimmerContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 234,
        marginRight: 16,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 40,
        width: 192,
    },
    moreMerchantShimmerContainerContent: {
        alignItems: "center",
        padding: 16,
    },
    moreMerchantShimmerContainerContentMetaPrimary: {
        backgroundColor: GREY_100,
        borderRadius: 3,
        height: 4,
        marginBottom: 4,
        width: "60%",
    },
    moreMerchantShimmerContainerContentMetaSecondary: {
        backgroundColor: GREY_100,
        borderRadius: 3,
        height: 4,
        width: "70%",
    },
    moreMerchantShimmerContainerContentTitle: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        marginBottom: 32,
        width: "80%",
    },
    moreMerchantShimmerContainerImage: {
        backgroundColor: GREY_300,
        height: 120,
        width: "100%",
    },
    moreMerchantShimmerContainerInner: {
        borderRadius: 8,
        flex: 1,
        overflow: "hidden",
    },
    moreMerchantShimmerOuterContainer: {
        alignItems: "center",
        flexDirection: "row",
        padding: 24,
    },
    outletShimmerContainer: {
        backgroundColor: GREY_300,
        borderRadius: 24,
        height: 46,
        justifyContent: "center",
        marginTop: 24,
        paddingHorizontal: 24,
        width: "100%",
    },
    outletShimmerContainerItem: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        width: "100%",
    },
    priceShimmerContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 8,
        paddingTop: 14,
    },
    priceShimmerContainerCuisine: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        width: 80,
    },
    priceShimmerContainerValue: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        width: 30,
    },
    shimmerTitle: {
        backgroundColor: GREY_200,
        borderRadius: 3,
        height: 8,
        width: "90%",
    },
});

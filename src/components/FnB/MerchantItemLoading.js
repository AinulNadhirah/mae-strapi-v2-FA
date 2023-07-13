import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { GREY_200, SHADOW_LIGHT, WHITE } from "@constants/colors";

const styles = StyleSheet.create({
    itemLoadingMetaTitle: {
        backgroundColor: GREY_200,
        height: 4,
        marginBottom: 8,
        width: "100%",
    },
    merchantItemLoading: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 220,
        marginBottom: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    merchantItemLoadingImg: {
        backgroundColor: GREY_200,
        height: 120,
        width: "100%",
    },
    merchantItemLoadingInner: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flexDirection: "row",
        overflow: "hidden",
    },
    merchantItemLoadingMetaContainer: {
        justifyContent: "space-between",
        padding: 16,
    },
    merchantItemLoadingSecondary: {
        backgroundColor: GREY_200,
        height: 4,
        marginBottom: 20,
        width: "50%",
    },
});

export function MerchantItemLoading() {
    const imageRef = useRef();
    const lineOneRef = useRef();
    const lineTwoRef = useRef();
    const lineThreeRef = useRef();

    useEffect(() => {
        const itemAnimate = Animated.stagger(400, [
            imageRef.current.getAnimated(),
            Animated.parallel([
                lineOneRef.current.getAnimated(),
                lineTwoRef.current.getAnimated(),
                lineThreeRef.current.getAnimated(),
            ]),
        ]);
        Animated.loop(itemAnimate).start();
    }, []);

    return (
        <View style={styles.merchantItemLoading}>
            <View style={styles.merchantItemLoadingInner}>
                <ShimmerPlaceHolder
                    ref={imageRef}
                    visible={false}
                    style={styles.merchantItemLoadingImg}
                />
            </View>
            <View style={styles.merchantItemLoadingMetaContainer}>
                <View>
                    <ShimmerPlaceHolder
                        ref={lineOneRef}
                        visible={false}
                        style={styles.itemLoadingMetaTitle}
                    />
                    <ShimmerPlaceHolder
                        ref={lineTwoRef}
                        visible={false}
                        style={styles.merchantItemLoadingSecondary}
                    />
                </View>
                <ShimmerPlaceHolder ref={lineThreeRef} visible={false} style={styles.loadingText} />
            </View>
        </View>
    );
}

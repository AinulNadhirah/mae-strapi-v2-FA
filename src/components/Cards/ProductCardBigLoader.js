import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const ProductCardBigLoader = () => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <ShimmerPlaceHolder style={styles.title} />
                <ShimmerPlaceHolder style={styles.subTitle} />
                <View style={styles.filler} />
                <ShimmerPlaceHolder style={styles.titleAmount} />
                <ShimmerPlaceHolder style={styles.contentAmount} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 198,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    contentContainer: {
        marginLeft: 16,
        marginTop: 21,
        flex: 1,
    },
    title: {
        width: 180,
        height: 18,
        borderRadius: 6,
    },
    subTitle: {
        width: 120,
        height: 24,
        borderRadius: 6,
        marginTop: 48,
    },
    filler: {
        flex: 1,
    },
    titleAmount: {
        width: 130,
        height: 15,
        borderRadius: 6,
        marginBottom: 1,
    },
    contentAmount: {
        width: 110,
        height: 18,
        borderRadius: 6,
        marginBottom: 23,
    },
});

const Memoiz = React.memo(ProductCardBigLoader);

export default Memoiz;

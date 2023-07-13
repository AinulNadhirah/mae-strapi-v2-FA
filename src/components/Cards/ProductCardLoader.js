import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const ProductCardLoader = () => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <ShimmerPlaceHolder style={styles.title} />
                <ShimmerPlaceHolder style={styles.subTitle} />
                <View style={styles.filler} />
                <ShimmerPlaceHolder style={styles.contentAmount} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 116,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    contentContainer: {
        marginLeft: 16,
        marginTop: 16,
        flex: 1,
    },
    title: {
        width: 180,
        height: 18,
        borderRadius: 6,
    },
    subTitle: {
        width: 120,
        height: 18,
        borderRadius: 6,
        marginTop: 4,
    },
    filler: {
        flex: 1,
    },
    contentAmount: {
        width: 120,
        height: 18,
        borderRadius: 6,
        marginBottom: 16,
    },
});

const Memoiz = React.memo(ProductCardLoader);

export default Memoiz;

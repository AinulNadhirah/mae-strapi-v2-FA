import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { GREY_300, GREY_200 } from "@constants/colors";

const TabungLoaderCard = () => (
    <View style={styles.container}>
        <View style={styles.firstRow}>
            <ShimmerPlaceHolder style={styles.title} />
            <ShimmerPlaceHolder style={styles.avatar} />
        </View>
        <View style={styles.secondRow}>
            <ShimmerPlaceHolder style={styles.descOne} />
            <ShimmerPlaceHolder style={styles.descTwo} />
            <ShimmerPlaceHolder style={styles.descThree} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 16,
        height: 32,
        width: 32,
    },
    container: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 174,
        padding: 20,
        width: "100%",
    },
    descOne: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: 70,
    },
    descThree: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: "100%",
    },
    descTwo: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: 130,
    },
    firstRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 23,
        width: "100%",
    },
    secondRow: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "space-evenly",
    },
    title: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: 120,
    },
});

export default React.memo(TabungLoaderCard);

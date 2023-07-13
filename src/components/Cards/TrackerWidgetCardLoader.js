import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { BLACK, WHITE, YELLOW } from "@constants/colors";

const TrackerWidgetCardLoader = () => {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <ShimmerPlaceHolder style={styles.title} />
            </View>

            <React.Fragment>
                <ShimmerPlaceHolder style={styles.subTitle} />

                <View style={styles.totalBalContentContainer}>
                    <View>
                        <ShimmerPlaceHolder style={styles.contentAmount} />
                    </View>
                    <View style={styles.totalBalRightContainer}>
                        <ShimmerPlaceHolder style={styles.contentShort} />
                        <ShimmerPlaceHolder style={styles.contentShorter} />
                    </View>
                </View>
            </React.Fragment>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 5,
        marginTop: 2,
        marginBottom: 22,
        marginHorizontal: 24,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    headerContainer: {
        flexDirection: "row",
        height: 24,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 24,
    },
    totalBalContentContainer: {
        flexDirection: "row",
        height: 34,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-end",
    },
    contentShort: {
        width: 72,
        height: 13,
        borderRadius: 7,
        marginBottom: 2,
    },
    contentShorter: {
        width: 24,
        height: 13,
        borderRadius: 7,
        marginBottom: 2,
    },
    contentAmount: {
        width: 165,
        height: 32,
        borderRadius: 7,
    },
    title: {
        width: 88,
        height: 15,
        borderRadius: 7,
    },
    subTitle: {
        width: 88,
        height: 15,
        borderRadius: 7,
        marginBottom: 4,
    },
    totalBalRightContainer: {
        height: 34,
        width: 80,
        flexDirection: "column",
        alignItems: "center",
    },
});

const Memoiz = React.memo(TrackerWidgetCardLoader);

export default Memoiz;

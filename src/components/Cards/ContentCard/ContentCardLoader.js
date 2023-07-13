import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

const ContentCardLoader = () => {
    return (
        <View style={styles.container}>
            <ShimmerPlaceHolder style={styles.image} />
            <View style={styles.contentArea}>
                <ShimmerPlaceHolder style={styles.contentLong} />
                <ShimmerPlaceHolder style={styles.contentLong} />
                <ShimmerPlaceHolder style={styles.contentLong} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 367,
        width: "100%",
    },
    contentArea: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        paddingHorizontal: 15,
        paddingTop: 14,
    },
    contentLong: {
        borderRadius: 7,
        height: 15,
        marginBottom: 15,
        width: 252,
    },
    image: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 204,
        width: "100%",
    },
});

const Memoiz = React.memo(ContentCardLoader);

export default Memoiz;

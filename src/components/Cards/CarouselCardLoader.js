import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import { BLACK, WHITE } from "@constants/colors";
import PropTypes from "prop-types";

const CarouselCardLoader = () => {
    return (
        <View style={styles.container}>
            <View style={styles.cover}>
                <ShimmerPlaceHolder style={styles.image} />
            </View>
            <View style={styles.content}>
                <ShimmerPlaceHolder style={styles.contentLong} />
                <ShimmerPlaceHolder style={styles.contentLong} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        width: 192,
        height: 200,
        borderRadius: 8,
        marginLeft: 12,
        marginBottom: 24,
        marginRight: 12,
    },
    cover: {
        width: "100%",
        height: 120,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        height: 56,
    },
    contentLong: {
        borderRadius: 7,
        height: 16,
        marginBottom: 15,
        width: 160,
    },
});

const Memoiz = React.memo(CarouselCardLoader);

export default Memoiz;

import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const MAECardLoader = () => {
    return (
        <View style={[Style.container, Style.shadow]}>
            <View style={Style.contentContainer}>
                <ShimmerPlaceHolder style={Style.maeLabelCls} />
                <ShimmerPlaceHolder style={Style.cardNumCls} />
            </View>
        </View>
    );
};

const Style = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        overflow: "hidden",
        marginTop: 25,
        borderRadius: 16,
        height: 190,
        marginHorizontal: 24,
        padding: 15,
        marginTop: 30,
    },
    shadow: {
        ...getShadow({}),
    },
    contentContainer: {
        height: "100%",
        width: "100%",
    },
    maeLabelCls: {
        width: "22%",
        height: 21,
        borderRadius: 6,
    },
    cardNumCls: {
        width: "75%",
        height: 30,
        borderRadius: 10,
        marginTop: 35,
    },
});

export default React.memo(MAECardLoader);

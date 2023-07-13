import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const GroupLoaderCard = () => {
    return (
        <View style={[Style.container, Style.shadow]}>
            <View style={Style.contentContainer}>
                <ShimmerPlaceHolder style={Style.titleCls} />
                <ShimmerPlaceHolder style={Style.createDateCls} />
            </View>
        </View>
    );
};

const Style = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        overflow: "hidden",
        borderRadius: 8,
        height: 90,
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
        justifyContent: "space-between",
    },
    titleCls: {
        width: "65%",
        height: 18,
        borderRadius: 6,
        marginBottom: 30,
    },
    createDateCls: {
        width: "35%",
        height: 18,
        borderRadius: 6,
    },
});

export default React.memo(GroupLoaderCard);

import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const SBLoaderCard = () => {
    return (
        <View style={[Style.container, Style.shadow]}>
            <View style={Style.contentContainer}>
                <ShimmerPlaceHolder style={Style.titleCls} />
                <ShimmerPlaceHolder style={Style.statusCls} />
                <ShimmerPlaceHolder style={Style.amountCls} />
                <ShimmerPlaceHolder style={Style.expiryCls} />
            </View>
        </View>
    );
};

const Style = StyleSheet.create({
    amountCls: {
        borderRadius: 6,
        height: 18,
        width: "60%",
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 170,
        marginHorizontal: 24,
        marginTop: 30,
        overflow: "hidden",
        padding: 15,
    },
    contentContainer: {
        height: "100%",
        justifyContent: "space-between",
        width: "100%",
    },
    expiryCls: {
        borderRadius: 6,
        height: 18,
        width: "35%",
    },
    shadow: {
        ...getShadow({}),
    },
    statusCls: {
        borderRadius: 6,
        height: 18,
        width: "22%",
    },
    titleCls: {
        borderRadius: 6,
        height: 18,
        marginBottom: 30,
        width: "65%",
    },
});

export default React.memo(SBLoaderCard);

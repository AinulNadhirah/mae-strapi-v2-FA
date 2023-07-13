import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const ValidationCheck = ({ label, isChecked, paramLabelCls, paramContainerCls }) => {
    return (
        <View style={paramContainerCls ? paramContainerCls : styles.containerStyle}>
            {isChecked === true ? (
                <Image source={require("@assets/icons/boosterTick.png")} style={styles.tickimage} />
            ) : (
                <View style={styles.grayCircleCls} />
            )}
            <Text style={paramLabelCls ? paramLabelCls : styles.labelCls}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: "4%",
        marginBottom: "4%",
    },
    labelCls: {
        marginLeft: 10,
        marginRight: 20,
        fontFamily: "montserrat",
        color: "#7b7b7b",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
    },
    tickimage: {
        width: 20,
        height: 20,
    },

    grayCircleCls: {
        height: 20,
        width: 20,
        backgroundColor: "#cccccc",
        borderRadius: 20,
    },
});

export { ValidationCheck };

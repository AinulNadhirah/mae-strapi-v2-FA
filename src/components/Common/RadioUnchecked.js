import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";

import { BLACK } from "@constants/colors";
import Assets from "@assets";

const RadioUnchecked = ({ label, paramLabelCls, paramContainerCls, paramImageCls }) => {
    return (
        <View style={paramContainerCls}>
            <Image source={Assets.icRadioUnchecked} style={paramImageCls} resizeMode="contain" />
            {label && <Text style={paramLabelCls}>{label}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    labelCls: {
        color: BLACK,
        flexWrap: "wrap",
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: 10,
        marginRight: 20,
        paddingBottom: 10,
    },

    tickimage: {
        height: 20,
        width: 20,
    },
});

RadioUnchecked.propTypes = {
    label: PropTypes.string,
    paramContainerCls: PropTypes.any,
    paramImageCls: PropTypes.any,
    paramLabelCls: PropTypes.any,
};

RadioUnchecked.defaultProps = {
    label: null,
    paramContainerCls: styles.containerStyle,
    paramImageCls: styles.tickimage,
    paramLabelCls: styles.labelCls,
};

const Memoiz = React.memo(RadioUnchecked);

export default Memoiz;

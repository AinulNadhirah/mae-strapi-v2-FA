import React from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet, Image } from "react-native";

import Assets from "@assets";
import { BLACK, RADIO_BTN_YELLOW } from "@constants/colors";

const RadioChecked = ({
    label,
    paramLabelCls,
    paramContainerCls,
    paramImageCls,
    checkType,
    imageSrc,
    selectedColor,
}) => {
    return (
        <View style={paramContainerCls}>
            {checkType == "image" ? (
                <Image source={imageSrc} style={paramImageCls} />
            ) : (
                <View style={styles.colorContCls}>
                    <View style={[styles.colorCls, { backgroundColor: selectedColor }]} />
                </View>
            )}

            {label && <Text style={paramLabelCls}>{label}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    colorCls: {
        borderRadius: 7,
        height: 14,
        width: 14,
    },
    colorContCls: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 10,
        borderStyle: "solid",
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        width: 20,
    },
    containerStyle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    labelCls: {
        color: BLACK,
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
        paddingBottom: 10,
        width: 20,
    },
});

RadioChecked.propTypes = {
    label: PropTypes.string,
    paramContainerCls: PropTypes.any,
    paramImageCls: PropTypes.any,
    paramLabelCls: PropTypes.any,
    checkType: PropTypes.string,
    imageSrc: PropTypes.any,
    selectedColor: PropTypes.string,
};

RadioChecked.defaultProps = {
    label: null,
    paramContainerCls: styles.containerStyle,
    paramImageCls: styles.tickimage,
    paramLabelCls: styles.labelCls,
    checkType: "image",
    imageSrc: Assets.icRadioChecked,
    selectedColor: RADIO_BTN_YELLOW,
};

const Memoiz = React.memo(RadioChecked);

export default Memoiz;

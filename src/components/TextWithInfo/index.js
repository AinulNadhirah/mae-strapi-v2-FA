import Proptypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

import Typo from "@components/Text";

import assets from "@assets";

const Styles = StyleSheet.create({
    hasInfoStyle: {
        alignItems: "flex-end",
        flexDirection: "row",
    },
    hitSlop: {
        bottom: 10,
        left: 10,
        right: 10,
        top: 10,
    },
    infoBtn: {
        marginLeft: 5,
    },
    infoIcon: {
        height: 14,
        marginBottom: 2,
        width: 14,
    },
});

const Text = ({
    children,
    text,
    onPressText,
    hasInfo,
    infoTitle = "",
    infoMessage = "",
    onPressInfoBtn,
    ...props
}) => {
    function onPressInfo() {
        onPressInfoBtn({ infoTitle, infoMessage });
    }

    return (
        <View style={hasInfo && Styles.hasInfoStyle} onTouchEnd={onPressText}>
            <Typo {...props}>{children || text}</Typo>
            {hasInfo && (
                <TouchableOpacity
                    style={Styles.infoBtn}
                    hitSlop={Styles.hitSlop}
                    onPress={onPressInfo}
                >
                    <Image source={assets.info} style={Styles.infoIcon} />
                </TouchableOpacity>
            )}
        </View>
    );
};

Text.propTypes = {
    children: Proptypes.any,
    text: Proptypes.string,
    onPressText: Proptypes.func,
    hasInfo: Proptypes.bool,
    infoTitle: Proptypes.string,
    infoMessage: Proptypes.string,
    onPressInfoBtn: Proptypes.func,
    ...Typo.propTypes,
};

Text.defaultProps = {
    ...Typo.defaultProps,
};

// nothing to memo, each prop changed will require update anyway
export default Text;

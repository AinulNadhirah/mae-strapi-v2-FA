import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, Platform } from "react-native";

import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

function ActionTile({ icon, header, description, onPress, style, shadow }) {
    const onTilePress = () => {
        if (onPress) onPress();
    };

    return (
        <View style={shadow && Platform.OS === "ios" ? Style.shadow : {}}>
            <TouchableOpacity
                style={[
                    Platform.OS === "ios" && !shadow ? {} : Style.shadow,
                    Style.container,
                    Style.horizontalMargin,
                    style,
                ]}
                activeOpacity={0.8}
                onPress={onTilePress}
            >
                {/* Icon */}
                <Image style={Style.imgCls} source={icon} />

                <View style={Style.rightContainer}>
                    {/* Header */}
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        text={header}
                    />

                    {/* Description */}
                    <Typo textAlign="left" lineHeight={17} text={description} style={Style.desc} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

ActionTile.propTypes = {
    icon: PropTypes.any.isRequired,
    header: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    style: PropTypes.object,
    shadow: PropTypes.bool,
};

ActionTile.defaultProps = {
    icon: Assets.documents,
    header: "",
    description: "",
    onPress: () => {},
    shadow: false,
};

const Style = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 20,
    },

    desc: {
        marginTop: 5,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    imgCls: {
        height: 40,
        width: 40,
    },

    rightContainer: {
        flex: 1,
        marginLeft: 20,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
});

export default ActionTile;

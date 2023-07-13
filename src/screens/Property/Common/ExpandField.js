import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import Assets from "@assets";

function ExpandField({ show = false, label, infoIcon, infoIconPress, onExpandPress }) {
    return (
        <>
            {show && (
                <View style={Style.container}>
                    {/* Label container */}
                    {infoIcon ? (
                        <View style={Style.infoLabelContainerCls}>
                            <Typo lineHeight={20} fontWeight="600" textAlign="left" text={label} />
                            <TouchableOpacity onPress={infoIconPress} activeOpacity={0.8}>
                                <Image style={Style.infoIcon} source={Assets.icInformation} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Typo lineHeight={20} fontWeight="600" textAlign="left" text={label} />
                    )}

                    {/* Expand Icon */}
                    <TouchableOpacity onPress={onExpandPress} activeOpacity={0.8}>
                        <Image style={Style.expandIcon} source={Assets.addIcon} />
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}

ExpandField.propTypes = {
    show: PropTypes.bool,
    label: PropTypes.string.isRequired,
    infoIcon: PropTypes.bool,
    infoIconPress: PropTypes.func,
    onExpandPress: PropTypes.func,
};

ExpandField.defaultProps = {
    show: true,
    infoIcon: false,
    infoIconPress: () => {},
    onExpandPress: () => {},
};

const Style = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        height: 60,
        justifyContent: "space-between",
    },

    expandIcon: {
        height: 22,
        marginLeft: 20,
        width: 22,
    },

    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },

    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
});

export default ExpandField;

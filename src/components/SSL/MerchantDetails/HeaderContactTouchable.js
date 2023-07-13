import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE } from "@constants/colors";

export default function HeaderContactTouchable({ icon, text, onPress }) {
    return (
        <View style={styles.contactsView}>
            <Image style={styles.metaIcon} source={icon} />
            <View style={styles.container}>
                <TouchableOpacity onPress={onPress}>
                    <Typo
                        color={onPress ? ROYAL_BLUE : BLACK}
                        fontWeight={onPress ? "semi-bold" : "normal"}
                        fontSize={13}
                        textAlign="left"
                        lineHeight={17}
                        text={text}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
HeaderContactTouchable.propTypes = {
    icon: PropTypes.any,
    text: PropTypes.string,
    onPress: PropTypes.func,
};

/* eslint-disable react-native/sort-styles */
const styles = StyleSheet.create({
    contactsView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 17,
    },
    container: {
        flex: 1,
    },
    metaIcon: {
        height: 20,
        marginRight: 17,
        width: 20,
    },
});

import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

export default function HeaderOpeningHour({ icon, openingDay, openingHour }) {
    return (
        <View style={styles.contactsView}>
            <Image style={styles.metaIcon} source={icon} />
            <View style={styles.openingHrContainer}>
                <View style={styles.container}>
                    <Typo
                        color={BLACK}
                        fontWeight="normal"
                        fontSize={13}
                        textAlign="left"
                        lineHeight={20}
                        text={openingDay}
                    />
                </View>
                <View style={styles.container}>
                    <Typo
                        color={BLACK}
                        fontWeight="normal"
                        fontSize={13}
                        textAlign="left"
                        lineHeight={20}
                        text={openingHour}
                    />
                </View>
            </View>
        </View>
    );
}
HeaderOpeningHour.propTypes = {
    icon: PropTypes.number,
    openingDay: PropTypes.string,
    openingHour: PropTypes.string,
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
    openingHrContainer: {
        flexDirection: "row",
        flex: 1,
    },
});

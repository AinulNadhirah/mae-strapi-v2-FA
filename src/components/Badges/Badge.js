import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import Typo from "@components/Text";

const Badge = ({ title, color }) => (
    <View style={[styles.container, { backgroundColor: color }]}>
        <Typo fontSize={9} lineHeight={11} text={title} color="#ffffff" />
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: 11,
        justifyContent: "center",
        marginBottom: 4,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
});

Badge.propTypes = {
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default React.memo(Badge);

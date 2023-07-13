import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import Typo from "@components/Text";

import { WHITE } from "./../../constants/colors";

const GoalBadge = ({ title, backgroundColor }) => (
    <View style={[styles.container, { backgroundColor }]}>
        <Typo fontSize={9} lineHeight={11} text={title} color={WHITE} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: 13,
        justifyContent: "center",
        marginBottom: 4,
        paddingHorizontal: 13,
        paddingVertical: 5,
    },
});

GoalBadge.propTypes = {
    title: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
};

export default React.memo(GoalBadge);

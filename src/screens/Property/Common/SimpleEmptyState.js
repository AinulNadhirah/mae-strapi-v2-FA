import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import Typo from "@components/Text";

const SimpleEmptyState = ({ title, subtitle }) => {
    return (
        <View style={styles.container}>
            <Typo fontSize={18} fontWeight="700" lineHeight={20}>
                {title}
            </Typo>
            <Typo fontSize={14} fontWeight="400" lineHeight={20} style={styles.subtitle}>
                {subtitle}
            </Typo>
        </View>
    );
};

SimpleEmptyState.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 36,
    },
    subtitle: {
        paddingTop: 8,
    },
});

export default SimpleEmptyState;

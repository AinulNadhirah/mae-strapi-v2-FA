import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const TabungListContainer = ({ titleComponent, children }) => (
    <View style={styles.container}>
        <View style={styles.titleContainer}>{titleComponent}</View>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        width: "100%",
    },
    titleContainer: {
        height: 18,
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "flex-start",
    },
});

TabungListContainer.propTypes = {
    titleComponent: PropTypes.element.isRequired,
    children: PropTypes.element.isRequired,
};

export default React.memo(TabungListContainer);

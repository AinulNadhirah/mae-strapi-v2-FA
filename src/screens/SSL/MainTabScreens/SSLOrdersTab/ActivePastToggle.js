import ActionButton from "mae/src/components/Buttons/ActionButton.js";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { WHITE, BLACK, DARK_GREY } from "@constants/colors";

export default function ActivePastToggle({ selectedTab, setSelectedTab }) {
    const categories = ["Active", "Past"];

    function handlePress(item) {
        setSelectedTab(item);
    }
    return (
        <View style={styles.toggleContainer}>
            {categories.map((label) => {
                return (
                    <ToggleButton
                        label={label}
                        isActive={selectedTab === label}
                        onPress={handlePress}
                        key={label}
                    />
                );
            })}
        </View>
    );
}
ActivePastToggle.propTypes = {
    selectedTab: PropTypes.any,
    setSelectedTab: PropTypes.any,
    item: PropTypes.string,
};

const ToggleButton = ({ label, isActive, onPress }) => {
    function handlePress() {
        onPress(label);
    }
    return (
        <View style={styles.categoryContainer}>
            {isActive ? (
                <ActionButton
                    style={styles.ordersTabBar}
                    componentCenter={
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={-0.08}
                            lineHeight={15}
                            color={WHITE}
                            text={label}
                        />
                    }
                />
            ) : (
                <TouchableOpacity style={styles.unselectedTabBarItem} onPress={handlePress}>
                    <Typo
                        fontWeight="600"
                        textAlign="center"
                        fontSize={14}
                        lineHeight={15}
                        color={DARK_GREY}
                        text={label}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};
ToggleButton.propTypes = {
    label: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    categoryContainer: { marginBottom: 15, marginRight: 18 },
    ordersTabBar: {
        backgroundColor: BLACK,
        borderRadius: 16,
        height: 34,
        paddingLeft: 16,
        paddingRight: 16,
    },
    toggleContainer: { flexDirection: "row", marginLeft: 14 },
    unselectedTabBarItem: {
        alignItems: "center",
        height: 34,
        justifyContent: "center",
        paddingLeft: 16,
        paddingRight: 16,
    },
});

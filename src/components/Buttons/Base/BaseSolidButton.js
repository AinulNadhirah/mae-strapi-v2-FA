import { debounce } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { View, Pressable, StyleSheet, ViewPropTypes } from "react-native";

const BaseButton = ({ onPress, children, style, fullWidth, ...props }) => {
    function handlePress() {
        const debounceFn = debounce(onPress, 0);

        debounceFn();
    }

    if (fullWidth)
        return (
            <Pressable onPress={handlePress} style={styles.container} {...props}>
                <View style={style}>{children}</View>
            </Pressable>
        );
    return (
        <Pressable onPress={handlePress} {...props}>
            <View style={style}>{children}</View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
});

BaseButton.propTypes = {
    onPress: PropTypes.func,
    children: PropTypes.element.isRequired,
    style: ViewPropTypes.style,
    fullWidth: PropTypes.bool,
};

BaseButton.defaultProps = {
    style: {},
    fullWidth: false,
    onPress: () => {},
};

export default BaseButton;

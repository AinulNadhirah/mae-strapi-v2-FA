import React from "react";
import { Animated, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const Fade = ({ duration, delay, fadeMode, children, alreadyAnimated }) => {
    let animation = new Animated.Value(1);
    if (!alreadyAnimated) {
        animation = new Animated.Value(0);
        Animated.timing(animation, {
            toValue: fadeMode === "fadeIn" ? 1 : 0,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }

    return (
        <Animated.View style={[styles.container, { opacity: animation }]}>{children}</Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

Fade.propTypes = {
    children: PropTypes.object.isRequired,
    duration: PropTypes.number.isRequired,
    delay: PropTypes.number,
    fadeMode: PropTypes.oneOf(["fadeIn", "fadeOut"]).isRequired,
    alreadyAnimated: PropTypes.bool,
};

Fade.defaultProps = {
    delay: 0,
};

const Memoiz = React.memo(Fade);

export default Memoiz;

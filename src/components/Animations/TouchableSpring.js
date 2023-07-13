import PropTypes from "prop-types";
import React, { useRef } from "react";
import { Animated, TouchableWithoutFeedback } from "react-native";

function TouchableSpring({
    tension = 70,
    friction = 7,
    scaleTo = 0.97,
    onPress,
    children,
    ...props
}) {
    const springRef = useRef(new Animated.Value(1));

    function handlePress() {
        if (!onPress) return;
        onPress();
    }

    function handlePressIn() {
        Animated.spring(springRef.current, {
            toValue: scaleTo,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function handlePressOut() {
        Animated.spring(springRef.current, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    if (scaleTo > 1) {
        throw new Error(`"scaleTo" must be lower than 1`);
    }

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            {...props}
        >
            {children({ animateProp: springRef.current })}
        </TouchableWithoutFeedback>
    );
}

TouchableSpring.propTypes = {
    tension: PropTypes.number,
    friction: PropTypes.number,
    scaleTo: PropTypes.number,
    onPress: PropTypes.func,
    children: PropTypes.func,
};

export { TouchableSpring, Animated };

import PropTypes from "prop-types";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { Animated, TouchableOpacity } from "react-native";

const tension = 70;
const friction = 7;

const Spring = ({ children, ...props }) => {
    const cardAnimation = useRef(new Animated.Value(1)).current;
    const [cardPressState, setCardPressState] = useState("out");
    const onPressIn = useCallback(() => setCardPressState("in"), []);
    const onPressOut = useCallback(() => setCardPressState("out"), []);

    useEffect(() => {
        if (cardPressState === "in")
            Animated.spring(cardAnimation, {
                toValue: 0.97,
                tension,
                friction,
                useNativeDriver: true,
            }).start();
        else
            Animated.spring(cardAnimation, {
                toValue: 1,
                tension,
                friction,
                useNativeDriver: true,
            }).start();
    });

    return (
        <Animated.View
            style={{
                transform: [
                    {
                        scale: cardAnimation,
                    },
                ],
            }}
        >
            <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} {...props}>
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

Spring.propTypes = {
    children: PropTypes.node,
};

export default React.memo(Spring);

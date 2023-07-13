import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";

import NumericalKeyboard from "@components/NumericalKeyboard";

import { MEDIUM_GREY, BLACK } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

function SlidingNumPad({ showNumPad, onChange, onDone, value, getHeight, maxLength }) {
    const [keypadHeight, setKeypadHeight] = useState(null);
    const numKeypadAnimValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showNumPad)
            Animated.timing(numKeypadAnimValue, {
                toValue: -keypadHeight,
                duration: 500,
                useNativeDriver: true,
            }).start();
        else
            Animated.timing(numKeypadAnimValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
    }, [showNumPad]);

    const onNumKeypadRender = ({
        nativeEvent: {
            layout: { height },
        },
    }) => {
        setKeypadHeight(height);
        getHeight(height);
    };

    return (
        <Animated.View
            style={[
                Style.animContainer,
                {
                    bottom: keypadHeight ? -keypadHeight : -Dimensions.get("screen").height,
                    transform: [
                        {
                            translateY: numKeypadAnimValue,
                        },
                    ],
                },
            ]}
            useNativeDriver
        >
            <View style={Style.keypadContainer} onLayout={onNumKeypadRender}>
                <NumericalKeyboard
                    value={value}
                    onChangeText={onChange}
                    maxLength={maxLength}
                    onDone={onDone}
                />
            </View>
        </Animated.View>
    );
}

SlidingNumPad.propTypes = {
    showNumPad: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    getHeight: PropTypes.func.isRequired,
    value: PropTypes.any,
    maxLength: PropTypes.number,
};

SlidingNumPad.defaultProps = {
    showNumPad: false,
    onChange: () => {},
    onDone: () => {},
    getHeight: () => {},
    value: "",
    maxLength: 12,
};

const Style = StyleSheet.create({
    animContainer: {
        backgroundColor: MEDIUM_GREY,
        position: "absolute",
        width: "100%",
        ...getShadow({
            color: BLACK,
            width: 0,
            height: 2,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }),
    },

    keypadContainer: {
        flex: 1,
    },
});

export default SlidingNumPad;

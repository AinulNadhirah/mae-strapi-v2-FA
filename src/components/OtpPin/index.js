import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import * as Anima from "react-native-animatable";
import { BLACK } from "@constants/colors";

const ifToggledAnimate = (check) => (check ? "bounceIn" : "fadeIn");
const ifToggledDuration = (check) => (check ? 1000 : 250);

const OtpPin = ({ pin, space, ver, hor, border }) => {
    return (
        <View style={styles.container}>
            <Anima.View
                animation={ifToggledAnimate(pin.length > 0)}
                duration={ifToggledDuration(pin.length > 0)}
                useNativeDriver
                style={styles.pin1(pin, ver, hor, border)}
            />
            <Anima.View
                animation={ifToggledAnimate(pin.length > 1)}
                duration={ifToggledDuration(pin.length > 1)}
                useNativeDriver
                style={styles.pin2(pin, ver, hor, border, space)}
            />
            <Anima.View
                animation={ifToggledAnimate(pin.length > 2)}
                duration={ifToggledDuration(pin.length > 2)}
                useNativeDriver
                style={styles.pin3(pin, ver, hor, border, space)}
            />
            <Anima.View
                animation={ifToggledAnimate(pin.length > 3)}
                duration={ifToggledDuration(pin.length > 3)}
                useNativeDriver
                style={styles.pin4(pin, ver, hor, border, space)}
            />
            <Anima.View
                animation={ifToggledAnimate(pin.length > 4)}
                duration={ifToggledDuration(pin.length > 4)}
                useNativeDriver
                style={styles.pin5(pin, ver, hor, border, space)}
            />
            <Anima.View
                animation={ifToggledAnimate(pin.length > 5)}
                duration={ifToggledDuration(pin.length > 5)}
                useNativeDriver
                style={styles.pin6(pin, ver, hor, border, space)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: "flex-start", flexDirection: "row", marginTop: 10 },
    pin1: (pin, ver, hor, border) => ({
        width: pin.length > 0 ? ver - 1 : ver - 1,
        height: pin.length > 0 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 0 ? BLACK : "#DEDEDE",
    }),
    pin2: (pin, ver, hor, border, space) => ({
        marginLeft: space,
        width: pin.length > 1 ? ver - 1 : ver - 1,
        height: pin.length > 1 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 1 ? BLACK : "#DEDEDE",
    }),
    pin3: (pin, ver, hor, border, space) => ({
        marginLeft: space,
        width: pin.length > 2 ? ver - 1 : ver - 1,
        height: pin.length > 2 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 2 ? BLACK : "#DEDEDE",
    }),
    pin4: (pin, ver, hor, border, space) => ({
        marginLeft: space,
        width: pin.length > 3 ? ver - 1 : ver - 1,
        height: pin.length > 3 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 3 ? BLACK : "#DEDEDE",
    }),
    pin5: (pin, ver, hor, border, space) => ({
        marginLeft: space,
        width: pin.length > 4 ? ver - 1 : ver - 1,
        height: pin.length > 4 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 4 ? BLACK : "#DEDEDE",
    }),
    pin6: (pin, ver, hor, border, space) => ({
        marginLeft: space,
        width: pin.length > 5 ? ver - 1 : ver - 1,
        height: pin.length > 5 ? hor - 1 : hor - 1,
        borderRadius: border,
        backgroundColor: pin.length > 5 ? BLACK : "#DEDEDE",
    }),
});

OtpPin.propTypes = {
    pin: PropTypes.string,
    space: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ver: PropTypes.number,
    hor: PropTypes.number,
    border: PropTypes.number,
};

export default OtpPin;

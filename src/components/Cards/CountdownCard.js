import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import CountDown from "react-native-countdown-component";
import PropTypes from "prop-types";

import Typo from "@components/Text";

const CountdownCard = ({ show, length, title, image, ...props }) => (
    <View style={styles.containerCountdown}>
        <ImageBackground source={image} style={styles.countdownCover}>
            <View style={styles.containerCountdownBottom}>
                <View style={styles.containerCountdownTitle}>
                    <Typo fontSize={14} fontWeight="600" color="#fff">
                        <Text>{title}</Text>
                    </Typo>
                </View>
                <CountDown
                    until={length}
                    //onFinish={hideCountdown}
                    size={20}
                    timeLabels={{ d: "Days", h: "Hrs", m: "Mins", s: "Secs" }}
                    digitStyle={styles.countdownDigitStyle}
                    digitTxtStyle={styles.countdownDigitTxtStyle}
                    timeLabelStyle={styles.countdownTimeLabelStyle}
                    running={show}
                />
            </View>
        </ImageBackground>
    </View>
);

CountdownCard.propTypes = {
    show: PropTypes.bool,
    length: PropTypes.number,
    title: PropTypes.string,
    image: PropTypes.number,
};

CountdownCard.defaultProps = {
    show: false,
    length: 0,
    title: "",
    image: "",
};

const Memoiz = React.memo(CountdownCard);

export default Memoiz;

const styles = StyleSheet.create({
    containerCountdown: {
        marginTop: 24,
        marginHorizontal: 24,
        alignItems: "center",
        height: 82,
    },
    containerCountdownBottom: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    containerCountdownTitle: {
        marginBottom: -10,
    },
    countdownCover: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },
    countdownDigitStyle: {
        backgroundColor: "transparent",
    },
    countdownDigitTxtStyle: {
        fontFamily: "montserrat",
        fontSize: 22,
        fontWeight: "bold",
        fontStyle: "normal",
        lineHeight: 32,
        letterSpacing: 0,
        textAlign: "center",
        color: "#ffffff",
        textShadowColor: "rgba(0, 0, 0, 0.1)",
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 4,
        width: 55,
    },
    countdownTimeLabelStyle: {
        fontFamily: "montserrat",
        fontSize: 10,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 1,
        textAlign: "center",
        color: "#ffffff",
        textShadowColor: "rgba(0, 0, 0, 0.1)",
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 4,
        marginTop: -16,
        textTransform: "uppercase",
    },
});

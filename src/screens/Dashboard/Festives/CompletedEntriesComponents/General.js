import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { COMPLETED_TITLE } from "@constants/strings";

import { tapTasticAssets } from "@assets";

const { height } = Dimensions.get("window");
const General = ({ animation }) => {
    return (
        <>
            <Typo fontSize={height / 44} fontWeight="600" lineHeight={25} text={COMPLETED_TITLE} />
            <LottieView
                source={animation}
                autoPlay
                loop={false}
                style={[styles.completedAnimation, { height: height / 3 }]}
            />
            <View style={styles.completedTextContainer}>
                <Image
                    source={tapTasticAssets.yearend.completedText}
                    style={styles.completedTextImage}
                    resizeMode="contain"
                />
            </View>
        </>
    );
};

General.propTypes = {
    animation: PropTypes.any,
};

const styles = StyleSheet.create({
    completedAnimation: { width: "100%" },
    completedTextContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    completedTextImage: {
        height: 120,
        width: "100%",
    },
});

export default General;

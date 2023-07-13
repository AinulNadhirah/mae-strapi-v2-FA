import LottieView from "lottie-react-native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import {
    TouchableOpacity,
    View,
    Dimensions,
    StyleSheet,
    Image,
    ImageBackground,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW } from "@constants/colors";
import {
    CASHBACK,
    CASHBACK_FAILED_DESC,
    CASHBACK_FAILED_TITLE,
    CASHBACK_SUCCESS_DESC,
    CASHBACK_SUCCESS_TITLE,
} from "@constants/strings";

import { tapTasticAssets } from "@assets";

const { width, height } = Dimensions.get("window");

const YearEnd = ({ onButtonPressed, isSuccess, amount, buttonText }) => {
    const insets = useSafeAreaInsets();
    const yearEndAssets = tapTasticAssets.yearend;

    return (
        <ScreenContainer
            backgroundType="image"
            backgroundImage={
                isSuccess
                    ? yearEndAssets.cashbackEarnedBackground
                    : yearEndAssets.cashbackBackground
            }
        >
            <>
                <ScreenLayout paddingBottom={0} paddingTop={0} paddingHorizontal={0}>
                    {isSuccess ? (
                        <View style={styles.successContainer}>
                            <LottieView
                                source={yearEndAssets.cashbackCoinsSuccess}
                                autoPlay
                                loop={false}
                                resizeMode="cover"
                                style={[
                                    styles.coinsAnimation,
                                    {
                                        bottom: insets.bottom
                                            ? insets.bottom - 4
                                            : insets.bottom + 26,
                                    },
                                ]}
                            />
                            <Animatable.View
                                style={[styles.contentContainer, { top: height / 6 }]}
                                animation="bounceIn"
                                duration={800}
                            >
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={30}
                                    text={CASHBACK_SUCCESS_TITLE}
                                />
                                <SpaceFiller height={16} />

                                <LottieView
                                    source={yearEndAssets.cashbackConfettiSuccess}
                                    autoPlay
                                    loop={false}
                                    resizeMode="cover"
                                    style={styles.confettiAnimation}
                                />
                                <Image
                                    source={
                                        yearEndAssets.cashbackImageSuccessAmountContainerBrightness
                                    }
                                    style={styles.brightnessBackground}
                                />

                                <ImageBackground
                                    source={yearEndAssets.cashbackImageSuccessAmountContainer}
                                    resizeMode="contain"
                                    style={styles.amountContainer}
                                >
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={30}
                                        text={`RM ${numeral(amount).format("0,0.00")}`}
                                        textAlign="center"
                                    />
                                </ImageBackground>
                                <SpaceFiller height={24} />
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={25}
                                    text={CASHBACK}
                                />
                                <SpaceFiller height={24} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="400"
                                    lineHeight={20}
                                    text={CASHBACK_SUCCESS_DESC}
                                />
                            </Animatable.View>
                        </View>
                    ) : (
                        <View style={styles.failContainer}>
                            <Animatable.View animation="fadeInUp" duration={200} delay={200}>
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={37}
                                    text={CASHBACK_FAILED_TITLE}
                                />
                            </Animatable.View>
                            <LottieView
                                source={yearEndAssets.cashbackEmpty}
                                autoPlay
                                loop={false}
                                resizeMode="cover"
                                style={styles.noCashbackAnimation}
                            />
                            <Animatable.View animation="fadeInUp" duration={200} delay={400}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="400"
                                    lineHeight={20}
                                    text={CASHBACK_FAILED_DESC}
                                />
                            </Animatable.View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.buttonContainer, { bottom: insets.bottom + 24 }]}
                        onPress={onButtonPressed}
                    >
                        <Typo fontSize={14} fontWeight="600" lineHeight={18} text={buttonText} />
                    </TouchableOpacity>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
};

YearEnd.propTypes = {
    onButtonPressed: PropTypes.func,
    isSuccess: PropTypes.bool,
    amount: PropTypes.string,
    buttonText: PropTypes.string,
};

const styles = StyleSheet.create({
    amountContainer: {
        alignItems: "center",
        height: 130,
        justifyContent: "center",
        width: "100%",
    },
    brightnessBackground: {
        height: 250,
        opacity: 0.7,
        position: "absolute",
        top: 36,
        width: "100%",
    },
    buttonContainer: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: YELLOW,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        position: "absolute",
        width: width - 48,
    },
    coinsAnimation: {
        position: "absolute",
        width: "100%",
    },
    confettiAnimation: { height: 250, position: "absolute", top: 0 },
    contentContainer: {
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    failContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        width: "100%",
    },
    noCashbackAnimation: { height: 250, top: 0 },
    successContainer: { flex: 1 },
});

export default withModelContext(YearEnd);

import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY, FADE_GREY, GARGOYLE } from "@constants/colors";
import { FA_SETTINGS_ABOUT_US } from "@constants/strings";

import Images from "@assets";

const styles = StyleSheet.create({
    aboutContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    maeIcon: { height: 64, width: 64 },
    maeIconContainer: {
        marginBottom: 28,
    },
});

const supEnabled = {
    0: {
        scale: 1,
    },
    0.5: {
        scale: 2,
    },
    0.8: {
        scale: 0.8,
    },
    1: {
        scale: 1,
    },
};

function About({ navigation, getModel, updateModel }) {
    const [count, setCount] = useState(0);
    const { appVersion, supsonic } = getModel("misc");

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleOnSup() {
        if (count < 17) setCount((c) => c + 1);

        if (count === 17) {
            // 😈
            setSupSonic();
        }
    }

    async function setSupSonic() {
        if (!supsonic) {
            await AsyncStorage.setItem("supOn", "true");

            updateModel({
                misc: {
                    supsonic: true,
                },
            });
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_SETTINGS_ABOUT_US}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={GARGOYLE}
                        headerCenterElement={
                            <Typo text="About Us" fontWeight="600" fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
            >
                <View style={styles.aboutContainer}>
                    <View style={styles.maeIconContainer}>
                        <TouchableSpring onPress={handleOnSup}>
                            {({ animateProp }) => (
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                scale: animateProp,
                                            },
                                        ],
                                    }}
                                >
                                    <Animatable.Image
                                        animation={count === 17 ? supEnabled : "zoomIn"}
                                        duration={count === 17 ? 1000 : 250}
                                        delay={250}
                                        useNativeDriver
                                        source={Images.onboardingMaeIcon}
                                        style={styles.maeIcon}
                                    />
                                </Animated.View>
                            )}
                        </TouchableSpring>
                    </View>
                    <Animatable.View animation="zoomIn" duration={250} delay={500} useNativeDriver>
                        <Typo
                            text={`Version ${appVersion}`}
                            fontWeight="normal"
                            fontSize={12}
                            lineHeight={18}
                            color={FADE_GREY}
                        />
                    </Animatable.View>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

About.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(About);

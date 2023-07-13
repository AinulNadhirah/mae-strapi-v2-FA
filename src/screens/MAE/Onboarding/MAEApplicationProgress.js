import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import * as Animatable from "react-native-animatable";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import ActionButton from "@components/Buttons/ActionButton";
import Images from "@assets";
import Typo from "@components/Text";
import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { TAB_NAVIGATOR } from "@navigation/navigationConstant";
import FixedActionContainer from "@components/Footers/FixedActionContainer";

const animateFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function MAEApplicationProgress({ navigation, route }) {
    const filledUserDetails = route?.params?.filledUserDetails;
    function handleGoToOnboard() {
        console.log("Redirect to entry point");
        navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Animatable.Image
                                animation={animateFadeInUp}
                                delay={500}
                                duration={500}
                                source={Images.onboardingSuccessBg}
                                style={styles.imageBg}
                                useNativeDriver
                            />
                        </View>
                        <View style={styles.footer}>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1000}
                                style={styles.copy}
                            >
                                <Typo
                                    fontSize={16}
                                    lineHeight={19}
                                    fontWeight="600"
                                    text="Application in Progress"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text={`Your MAE account application is in progress.\nHang tight! We'll get back to you as soon as possible.`}
                                    textAlign="left"
                                />
                            </Animatable.View>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1100}
                            >
                                <FixedActionContainer>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={25}
                                        onPress={handleGoToOnboard}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text="Done"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </FixedActionContainer>
                            </Animatable.View>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}
MAEApplicationProgress.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    footer: {
        flex: 0.4,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    imageBg: {
        height: "100%",
        width: "100%",
    },
    label: {
        paddingVertical: 16,
    },
    meta: {
        alignItems: "center",
        flex: 0.6,
    },
});

export default MAEApplicationProgress;

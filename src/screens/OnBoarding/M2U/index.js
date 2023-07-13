import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

import {
    MAE_MODULE_STACK,
    MAE_INTRODUCTION,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { WHITE, MEDIUM_GREY, ROYAL_BLUE, SHADOW_LIGHT } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_APPLY_MAE_ACCOUNT,
    FA_LOGIN_M2U_MAE,
    FA_LOGIN_METHOD,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Images from "@assets";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

const OptionCard = ({ onPress, title, iconSrc, noGutter = false, smallerIcon, testID = "" }) => (
    <View style={!noGutter && styles.cardGutter}>
        <TouchableSpring onPress={onPress} testID={testID}>
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
                    <View style={styles.card}>
                        <View style={styles.cardIconContainer}>
                            <Image
                                source={iconSrc}
                                style={[styles.cardIcon, smallerIcon && styles.applyIcon]}
                            />
                        </View>
                        <Typo fontSize={14} fontWeight="normal" lineHeight={20} text={title} />
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    </View>
);

OptionCard.propTypes = {
    onPress: PropTypes.func,
    title: PropTypes.string,
    testID: PropTypes.string,
    iconSrc: PropTypes.number,
    noGutter: PropTypes.bool,
    bordered: PropTypes.bool,
    smallerIcon: PropTypes.bool,
};

/**
 * Start screen of onboarding
 */

function OnboardingStart({ navigation }) {
    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleNavigateM2uLink() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOGIN_METHOD,
            [FA_ACTION_NAME]: FA_LOGIN_M2U_MAE,
        });
        navigation.navigate("OnboardingM2uUsername");
    }

    function handleNavigateMaeOnBoarding() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOGIN_METHOD,
            [FA_ACTION_NAME]: FA_APPLY_MAE_ACCOUNT,
        });
        navigation.navigate(MAE_MODULE_STACK, {
            screen: MAE_INTRODUCTION,
            params: {
                entryStack: "Onboarding",
                entryScreen: "OnboardingStart",
            },
        });
    }

    function handleRegisterM2u() {
        const params = {
            uri: "https://www.maybank2u.com.my/home/m2u/common/signup.do",
            share: false,
            type: "Web",
            route: "OnboardingUsername",
            module: "Onboarding",
            title: "M2U Web",
            pdfType: "shareReceipt",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
        GASettingsScreen.onWebviewForgotLogin();
    }

    useEffect(() => {
        return () =>
            navigation.setParams({
                screen: "",
            });
    }, [navigation]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOGIN_METHOD,
        });
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <Animatable.Image
                    animation="fadeInDown"
                    source={Images.onboardingStartTop}
                    style={styles.topImage}
                />
                <Animatable.Image
                    animation="fadeInUp"
                    source={Images.onboardingStartBottom}
                    style={styles.bottomImage}
                />

                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={handleBack} testID="go_back" />
                            }
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.onboardingWrapper} testID="onboarding_start">
                        <View style={styles.startContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Let's Get Started!"
                            />
                            <View style={styles.copyContainer}>
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    text="Log in to enjoy the app to its fullest."
                                />
                            </View>
                            <View style={styles.optionsContainer}>
                                <OptionCard
                                    noGutter
                                    bordered
                                    title="Existing M2U/MAE user? Log in here"
                                    iconSrc={Images.onboardingMaeIcon}
                                    onPress={handleNavigateM2uLink}
                                    testID="onboarding_start_etb"
                                />
                                <OptionCard
                                    title="No account? Apply for a MAE account now"
                                    iconSrc={Images.onboardingApplyIcon}
                                    onPress={handleNavigateMaeOnBoarding}
                                    smallerIcon
                                    testID="onboarding_start_ntb"
                                />
                            </View>
                        </View>
                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleRegisterM2u}
                                testID="onboarding_register_m2u"
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Register for Maybank2u"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OnboardingStart.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    applyIcon: {
        height: 49,
        width: 46,
    },
    bottomImage: {
        bottom: 0,
        height: 196,
        left: 0,
        position: "absolute",
        right: 0,
        width: "100%",
    },
    card: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 4,
        height: 190,
        justifyContent: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 24,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 147,
    },
    cardGutter: {
        marginLeft: 20,
    },
    cardIcon: {
        height: "100%",
        width: "100%",
    },
    cardIconContainer: {
        alignItems: "center",
        height: 64,
        justifyContent: "center",
        marginBottom: 14,
        width: 64,
    },
    // cardIconWithBorder: {
    //     backgroundColor: WHITE,
    //     borderRadius: 69,
    //     elevation: 12,
    //     shadowColor: SHADOW,
    //     shadowOffset: {
    //         width: 0,
    //         height: 6,
    //     },
    //     shadowOpacity: 1,
    //     shadowRadius: 15,
    // },
    copyContainer: {
        paddingBottom: 40,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    footer: {
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    onboardingWrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    optionsContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
    },
    startContainer: {
        alignItems: "center",
        flex: 0.9,
        justifyContent: "center",
    },
    topImage: {
        height: 196,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
    },
});

export default OnboardingStart;

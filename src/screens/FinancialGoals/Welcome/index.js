import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Image, View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";

import {
    BANKINGV2_MODULE,
    FINANCIAL_GOALS_DASHBOARD_SCREEN,
    FINANCIAL_GOAL_SELECTION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, ROYAL_BLUE } from "@constants/colors";
import { GOAL_NOTIFICATION_SHOWN } from "@constants/localStorage";
import {
    FINANCIAL_WELCOME_SUBTITLE_1,
    FINANCIAL_WELCOME_SUBTITLE_2,
    FINANCIAL_WELCOME_SUBTITLE_3,
    FINANCIAL_WELCOME_SUBTITLE_4,
    FINANCIAL_WELCOME_TITLE,
    GOAL_BASED_INVESTMENT,
    LEARN_MORE,
    FIND_OUT_MORE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
} from "@constants/strings";
import { FINANCIAL_LEARN_MORE } from "@constants/url";

import assets from "@assets";

const Welcome = ({ navigation }) => {
    const [showBrowser, setShowBrowser] = useState(false);
    const [browserTitle, setbrowserTitle] = useState("");
    const [browserUrl, setbrowserUrl] = useState("");

    const SUBTITLE = [
        FINANCIAL_WELCOME_SUBTITLE_1,
        FINANCIAL_WELCOME_SUBTITLE_2,
        FINANCIAL_WELCOME_SUBTITLE_3,
        FINANCIAL_WELCOME_SUBTITLE_4,
    ];

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_Onboarding",
        });
    }, []);

    function onPressClose() {
        navigation.navigate("Dashboard", {
            screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
        });
    }

    function onPressLearnMore() {
        setbrowserTitle(FIND_OUT_MORE);
        setbrowserUrl(FINANCIAL_LEARN_MORE);
        setShowBrowser(true);
    }

    function _onCloseBrowser() {
        setbrowserTitle("");
        setbrowserUrl("");
        setShowBrowser(false);
    }

    async function onPressGetStarted() {
        await AsyncStorage.setItem(GOAL_NOTIFICATION_SHOWN, JSON.stringify(true));
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_SELECTION,
        });
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onPressClose} />}
                        headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Animatable.View animation="fadeInUp" delay={500} useNativeDriver>
                        <Image source={assets.financialWelcomeImage} style={styles.headerImage} />
                        <View style={styles.subContainer}>
                            <Typo
                                text={FINANCIAL_WELCOME_TITLE}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={24}
                                style={styles.welcomeTitle}
                                textAlign="left"
                            />

                            {SUBTITLE.map((item, index) => {
                                return (
                                    <View style={styles.subtitleContainer} key={index}>
                                        <View style={styles.subtitleBullet} />
                                        <Typo
                                            text={item}
                                            fontSize={14}
                                            fontWeight="400"
                                            style={styles.welcomeSubtitle}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </Animatable.View>
                </ScrollView>
                <FixedActionContainer>
                    <Animatable.View
                        animation="fadeInUp"
                        delay={700}
                        useNativeDriver
                        style={styles.buttonAnimatedView}
                    >
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Get Started"
                                />
                            }
                            onPress={onPressGetStarted}
                        />
                        <TouchableOpacity style={styles.learnMoreLink} onPress={onPressLearnMore}>
                            <Typo
                                text={LEARN_MORE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="center"
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </Animatable.View>
                </FixedActionContainer>
            </ScreenLayout>
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
                <Browser
                    source={{ uri: browserUrl }}
                    title={browserTitle}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
        </ScreenContainer>
    );
};
Welcome.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    buttonAnimatedView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    headerImage: {
        alignItems: "center",
        height: 250,
        resizeMode: "contain",
        width: "100%",
    },
    learnMoreLink: {
        alignSelf: "center",
        paddingTop: 15,
    },
    modal: {
        margin: 0,
    },
    subContainer: {
        alignItems: "flex-start",
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    subtitleBullet: {
        alignSelf: "center",
        backgroundColor: BLACK,
        borderRadius: 3,
        height: 6,
        marginRight: 12,
        width: 6,
    },
    subtitleContainer: {
        flexDirection: "row",
        paddingLeft: 5,
        paddingTop: 16,
    },
    welcomeSubtitle: {
        justifyContent: "flex-start",
        textAlign: "left",
    },
    welcomeTitle: {
        paddingTop: 16,
    },
});

export default Welcome;

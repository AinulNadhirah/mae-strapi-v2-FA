import PropTypes from "prop-types";
import React, { useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";

import { SETTINGS_MODULE, TAB_NAVIGATOR } from "@navigation/navigationConstant";
import navigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    CALL_HOTLINE,
    DEACTIVATED_M2U_SUBTITLE,
    DEACTIVATED_M2U_TITLE,
    VIEW_ALL_HELPLINE,
    VISIT_NEARBY_BRANCH,
} from "@constants/strings";

import assets from "@assets";

function M2UDeactivatedScreen({ navigation }) {
    console.log("M2UDeactivatedScreen");
    const bgAnimate = useRef(new Animated.Value(1));

    function handleClose() {
        navigationService.resetAndNavigateToModule(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Dashboard",
                params: {
                    refresh: true,
                },
            },
        });
    }

    function handleCallNow() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "Helpline",
        });
    }

    function bgScale() {
        return {
            transform: [
                {
                    scale: bgAnimate.current.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.2, 1, 1],
                    }),
                },
                {
                    translateY: bgAnimate.current.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <Animatable.View
                                    animation="fadeInDown"
                                    duration={200}
                                    delay={1000}
                                    style={styles.headerClose}
                                >
                                    <HeaderCloseButton onPress={handleClose} />
                                </Animatable.View>
                            }
                        />
                    }
                >
                    <View style={styles.container}>
                        <Animated.View style={[styles.bgContainer, bgScale()]}>
                            <Animatable.Image
                                animation="fadeInUp"
                                source={assets.m2uDeactivatedBg}
                                style={styles.bgImage}
                                useNativeDriver
                            />
                        </Animated.View>
                        <View style={styles.scrollContainer}>
                            <Animated.ScrollView
                                scrollEventThrottle={16}
                                onScroll={Animated.event(
                                    [
                                        {
                                            nativeEvent: {
                                                contentOffset: { y: bgAnimate.current },
                                            },
                                        },
                                    ],
                                    { useNativeDriver: true }
                                )}
                                showsVerticalScrollIndicator={false}
                                contentInsetAdjustmentBehavior="automatic"
                            >
                                <View style={styles.copyContainer}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={500}
                                        style={styles.titleContainer}
                                        useNativeDriver
                                    >
                                        <Typo
                                            fontWeight="bold"
                                            fontSize={18}
                                            lineHeight={32}
                                            text={DEACTIVATED_M2U_TITLE}
                                        />
                                    </Animatable.View>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={700}
                                        useNativeDriver
                                        style={styles.secondaryContainer}
                                    >
                                        <Typo
                                            fontWeight="normal"
                                            fontSize={14}
                                            lineHeight={18}
                                            style={styles.subtitle}
                                            text={DEACTIVATED_M2U_SUBTITLE}
                                        />
                                    </Animatable.View>

                                    <Animatable.View
                                        style={styles.pealHourRow}
                                        animation="fadeInUp"
                                        delay={900}
                                        useNativeDriver
                                    >
                                        <View style={styles.bulletDot} />
                                        <View style={styles.listItemRow}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                textAlign="left"
                                                color={BLACK}
                                                style={styles.margin10}
                                                text={CALL_HOTLINE}
                                            />
                                        </View>
                                    </Animatable.View>
                                    <Animatable.View
                                        style={styles.pealHourRow}
                                        animation="fadeInUp"
                                        delay={900}
                                        useNativeDriver
                                    >
                                        <View style={styles.bulletDot} />
                                        <View style={styles.listItemRow}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                textAlign="left"
                                                color={BLACK}
                                                style={styles.margin10}
                                                text={VISIT_NEARBY_BRANCH}
                                            />
                                        </View>
                                    </Animatable.View>

                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={1100}
                                        useNativeDriver
                                        style={styles.actionContainer}
                                    >
                                        <ActionButton
                                            borderRadius={20}
                                            height={40}
                                            onPress={handleCallNow}
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    text={VIEW_ALL_HELPLINE}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                />
                                            }
                                            style={styles.actionbutton}
                                        />
                                    </Animatable.View>
                                </View>
                            </Animated.ScrollView>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

M2UDeactivatedScreen.propTypes = {
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    actionContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    actionbutton: {
        paddingHorizontal: 44,
        marginTop: 50,
    },
    bgContainer: {
        bottom: 0,
        height: 365,
        left: 0,
        position: "absolute",
        right: 0,
    },
    bgImage: { height: "100%", width: "100%" },
    bulletDot: {
        backgroundColor: BLACK,
        borderRadius: 5 / 2,
        height: 5,
        marginRight: 10,
        marginTop: 10,
        width: 5,
    },
    container: {
        flex: 1,
    },
    copyContainer: {
        marginVertical: 50,
        paddingHorizontal: 24,
    },
    headerClose: { marginBottom: 8 },
    listItemRow: {
        flex: 1,
        marginTop: -6,
    },
    margin10: { marginTop: 10 },

    pealHourRow: {
        flexDirection: "row",
    },
    scrollContainer: {
        height: "50%",
    },
    secondaryContainer: {
        marginBottom: 16,
    },
    titleContainer: { marginBottom: 8 },
    subtitle: { textAlign: "left" },
});

export default M2UDeactivatedScreen;

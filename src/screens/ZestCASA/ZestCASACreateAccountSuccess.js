import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { DARK_GREY } from "@constants/colors";
import {
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    CREATE_MAYBANK2U_ID,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";

const ZestCASACreateAccountSuccess = ({ route }) => {
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    const title = route?.params?.title;
    const subTitle = route?.params?.subTitle;
    const description = route?.params?.description;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;

    const animateFadeInUp = {
        0: {
            opacity: 0,
            translateY: 10,
        },
        1: {
            opacity: 1,
            translateY: 0,
        },
    };

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASASuccess] >> [init]");

        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });

            if (needFormAnalytics) {
                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: analyticScreenName,
                });
            }
        }
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    header={<View />}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View>
                                    <Animatable.Image
                                        animation={animateFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={Assets.onboardingSuccessBg}
                                        style={Style.backgroundImage}
                                        useNativeDriver
                                    />
                                    <SpaceFiller height={28} />
                                    {buildSuccessfulView()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildSuccessfulView() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={28}
                        textAlign="left"
                        text={title}
                    />
                    <SpaceFiller height={16} />
                    <Typo
                        fontSize={12}
                        fontWeight="600"
                        lineHeight={28}
                        textAlign="left"
                        text={subTitle}
                    />
                    <SpaceFiller height={6} />
                    <Typo
                        fontSize={12}
                        fontWeight="500"
                        lineHeight={24}
                        textAlign="left"
                        text={description}
                        color={DARK_GREY}
                    />
                    <SpaceFiller height={25} />
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={Style.bottomBtnContCls}>
                    <View style={Style.buttonContainer}>
                        {onDoneButtonDidTap ? (
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CREATE_MAYBANK2U_ID}
                                    />
                                }
                                onPress={onDoneButtonDidTap}
                            />
                        ) : null}
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (ZestCASACreateAccountSuccess.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    backgroundImage: {
        width: "100%",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    buttonContainer: {
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default ZestCASACreateAccountSuccess;

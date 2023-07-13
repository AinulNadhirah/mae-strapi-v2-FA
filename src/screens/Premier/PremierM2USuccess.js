import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK } from "@constants/colors";
import {
    PREMIER_M2U_ID,
    PREMIER_INITIAL_DEPOSIT,
    PREMIER_VISIT_BRANCH,
    M2U_PREMIER_ONBOARDING_SUCCESS,
} from "@constants/premierStrings";
import {
    DONE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
} from "@constants/strings";



import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";

const PremierM2USuccess = ({ route }) => {
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;

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
        console.log("[PremierM2USuccess] >> [init]");

        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });

            if (needFormAnalytics) {
                if (referenceId) {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                        [FA_TRANSACTION_ID]: referenceId,
                    });
                } else {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                    });
                }
            }
        }
    };

    function productActivateAmount() {
        if (entryReducer.isPM1 || entryReducer.isPMA) {
            return accountActivationAmount;
        } else if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
            return kawankuamoutActivateAmount;
        }
    }

    return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    header={<View />}
                    useSafeArea
                >
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
                                        source={Assets.onboardingM2UAccountSuccessBg}
                                        style={Style.backgroundImage}
                                        useNativeDriver
                                    />
                                    <SpaceFiller height={50} />
                                    {onBoardingSuccess()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                </ScreenLayout>
            </ScreenContainer>
    );

    function onBoardingSuccess () {
        return (
            <View style={ Style.contentContainer }>
                <View style={ Style.formContainer }>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        text={PREMIER_M2U_ID}
                    />
                    <SpaceFiller height={20} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={M2U_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <Text style={Style.listNum}>1. {PREMIER_VISIT_BRANCH}</Text>
                    <Text style={Style.listNum}>
                        2. {PREMIER_INITIAL_DEPOSIT(productActivateAmount())}
                    </Text>
                    <SpaceFiller height={10} />
                </View>
            </View>
        );
    }

    function buildActionButton () {
        return (
            <FixedActionContainer>
                <View style={Style.bottomBtnContCls}>
                    <ActionButton
                        fullWidth
                        componentCenter={
                            <Typo fontSize={14} lineHeight={18} fontWeight="600" text={DONE} />
                        }
                        onPress={onDoneButtonDidTap}
                    />
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (PremierM2USuccess.propTypes = {
    ...entryPropTypes,
    onDoneButtonDidTap: PropTypes.func,
});

const Style = StyleSheet.create({
    backgroundImage: {
        marginTop: 6,
        width: "100%",
        resizeMode:'contain',
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 60,
    },

    listNum: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 20,
        marginTop: 8,
    },
});

export default PremierM2USuccess;

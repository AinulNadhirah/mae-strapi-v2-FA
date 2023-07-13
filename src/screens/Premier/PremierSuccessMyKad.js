import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK } from "@constants/colors";
import {
    PREMIER_INITIAL_DEPOSIT,
    PREMIER_SUCCESS_MESSAGE,
    MYKAD_PREMIER_ONBOARDING_SUCCESS,
} from "@constants/premierStrings";
import {
    CREATE_MAYBANK2U_ID,
    ACTIVATE_ACCOUNT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";
import { APPLY_M2U_CREATEM2UID } from "./helpers/AnalyticsEventConstants";

const PremierSuccessMyKad = (props) => {
    const { navigation, route } = props;
    const { filledUserDetails } = route.params;
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB; 

    const { isSuccessfulAccountActivation, analyticScreenName, needFormAnalytics, referenceId } =
        route?.params;

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
        console.log("[PremierSuccessMyKad] >> [init]");

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

    function onApplyM2U () {
        console.log("[PremierSuccessMyKad] >> [applyNowM2U]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: analyticScreenName,
            [FA_ACTION_NAME]: APPLY_M2U_CREATEM2UID,
        });
        navigation.navigate("MAEModuleStack", {
            screen: navigationConstant.MAE_M2U_USERNAME,
            params: { filledUserDetails },
        });
    }

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
                                        source={Assets.onboardingSuccessBg}
                                        style={Style.backgroundImage}
                                        useNativeDriver
                                    />
                                    <SpaceFiller height={10} />
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
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={17}
                        fontWeight="600"
                        lineHeight={21}
                        textAlign="left"
                        text={PREMIER_SUCCESS_MESSAGE}
                    />
                    <SpaceFiller height={36} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={13}
                        fontWeight="600"
                        lineHeight={21}
                        textAlign="left"
                        text={MYKAD_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <Text style={Style.listNum}>1. {CREATE_MAYBANK2U_ID}</Text>
                    <Text style={Style.listNum}>2. {ACTIVATE_ACCOUNT}</Text>
                    <Text style={Style.listNum}>
                        3. {PREMIER_INITIAL_DEPOSIT(productActivateAmount())}
                    </Text>
                    <SpaceFiller height={10} />
                </View>
            </View>
        );
    }

    function buildActionButton () {
        if (isSuccessfulAccountActivation) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
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
                            onPress={onApplyM2U}
                        />
                    </View>
                </FixedActionContainer>
            );
        }
    }
};

export const successPropTypes = (PremierSuccessMyKad.propTypes = {
    ...entryPropTypes,
    isSuccessfulAccountActivation: PropTypes.bool,
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

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 30,
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

export default PremierSuccessMyKad;

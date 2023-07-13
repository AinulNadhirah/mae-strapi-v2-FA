import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK } from "@constants/colors";
import { PREMIER_CLEAR_ALL } from "@constants/premierConfiguration";
import {
    PREMIER_SUCCESS_MESSAGE,
    PREMIER_VISIT_BRANCH,
    PREMIER_INITIAL_DEPOSIT,
    MYKAD_PREMIER_ONBOARDING_SUCCESS,
} from "@constants/premierStrings";
import {
    CREATE_MAYBANK2U_ID,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TRANSACTION_ID,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";
import { APPLY_M2U_CREATEM2UID } from "./helpers/AnalyticsEventConstants";

const PremierSuccessPassport = (props) => {
    const { navigation, route } = props;
    const { filledUserDetails } = route.params;
    const dispatch = useDispatch();
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB; 

    const { isSuccessfulAccountActivation, analyticScreenName, needFormAnalytics, referenceId } =
        route?.params || {};

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

    function onCloseTap () {
        console.log("[PremierSuccessPassport] >> [onCloseTap]");
        // Clear all data from  reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.popToTop();
        navigation.goBack();
    }

    function onApplyM2U () {
        console.log("[PremierSuccessPassport] >> [applyNowM2U]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: analyticScreenName,
            [FA_ACTION_NAME]: APPLY_M2U_CREATEM2UID,
        });
        // Clear all data from  reducers
        //dispatch({ type: PREMIER_CLEAR_ALL });
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

    function onBoardingSuccess() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        text={PREMIER_SUCCESS_MESSAGE}
                    />
                    <SpaceFiller height={20} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={MYKAD_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <View style={Style.viewTop1}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>{CREATE_MAYBANK2U_ID}</Text>
                    </View>
                    <View style={Style.viewTop2}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>{PREMIER_VISIT_BRANCH}</Text>
                    </View>
                    <View style={Style.viewTop3}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>
                            {PREMIER_INITIAL_DEPOSIT(accountActivationAmount)}
                        </Text>
                    </View>
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

    function onBoardingSuccess() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        text={PREMIER_SUCCESS_MESSAGE}
                    />
                    <SpaceFiller height={20} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={MYKAD_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <View style={Style.viewTop1}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>{CREATE_MAYBANK2U_ID}</Text>
                    </View>
                    <View style={Style.viewTop2}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>{PREMIER_VISIT_BRANCH}</Text>
                    </View>
                    <View style={Style.viewTop3}>
                        <Text style={Style.listDot}>{"\u2B24"}</Text>
                        <Text style={Style.listNum}>
                            {PREMIER_INITIAL_DEPOSIT(productActivateAmount())}
                        </Text>
                    </View>
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

    return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.imageContainer}>
                                    <Animatable.Image
                                        animation={animateFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={Assets.onboardingPassportSuccessBg}
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
};

export const successPropTypes = (PremierSuccessPassport.propTypes = {
    ...entryPropTypes,
    isSuccessfulAccountActivation: PropTypes.bool,
});

const Style = StyleSheet.create({
    imageContainer: {
        justifyContent: "center",
        alignItems: "center"
    },
    backgroundImage: {
        position: "absolute",
        top: 34,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
        marginTop: 150,
    },

    formContainer: {
        marginBottom: 50,
    },

    listDot: {
        color: BLACK,
        fontSize: 9,
        marginTop: 12,
    },

    listNum: {
        color: BLACK,
        flex: 1,
        fontFamily: "montserrat",
        fontSize: 16,
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 21,
        marginTop: 8,
        paddingLeft: 8,
    },

    viewTop1: {
        flexDirection: "row",
    },

    viewTop2: {
        flexDirection: "row",
    },

    viewTop3: {
        flexDirection: "row",
    },
});

export default PremierSuccessPassport;

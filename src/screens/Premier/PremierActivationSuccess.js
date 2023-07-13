import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { FADE_GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    ACTIVATION_SUCCESSFUL,
    APPLY_DEBIT_CARD,
    DOITLATER_READY,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    DONE
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { SuccessDetailsViewWithAccountNumber } from "../ZestCASA/components/SuccessDetailsView";
import { entryPropTypes } from "./PM1IntroScreen";

const PremierActivationSuccess = ({ route }) => {
    const { getModel, updateModel } = useModelController();
    const isSuccessfulAccountActivation = route?.params?.isSuccessfulAccountActivation;
    const isHighRiskUserResume = route?.params?.isHighRiskUserResume;
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    const onApplyDebitCardButtonDidTap = route?.params?.onApplyDebitCardButtonDidTap;
    const accountNumber = route?.params?.accountNumber;
    const accountType = route?.params?.accountType;
    const dateAndTime = route?.params?.dateAndTime;
    const title = route?.params?.title;
    const description = route?.params?.description;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;
    const { isEtbUser } = route?.params;
    const productName = route?.params?.productName;

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
        console.log("[AccountActivationSuccess] >> [init]");

        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });

            if (needFormAnalytics) {
                console.log("needFormAnalytics");
                console.log(referenceId);
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

        // [[UPDATE_BALANCE]] Update balance from response if transaction is success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled && isSuccessfulAccountActivation) {
            updateWalletBalance(updateModel);
        }
    };

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
                                    {isHighRiskUserResume
                                        ? buildSuccessfulViewResume()
                                        : buildSuccessfulView()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                </ScreenLayout>
            </ScreenContainer>
    );

    function buildSuccessfulViewResume () {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={20}
                        fontWeight="600"
                        lineHeight={28}
                        textAlign="left"
                        text={title}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={18}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={description}
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={25} />
                </View>
            </View>
        );
    }

    function buildSuccessfulView () {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        lineHeight={28}
                        textAlign="left"
                        text={ACTIVATION_SUCCESSFUL}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={13}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text="Congratulations! You can start using your account now."
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={25} />
                    { productName === "MAE_KAWANKU" || productName === "MAE_SAVING_I" 
                    ? <SuccessDetailsViewWithAccountNumber
                        accountType={accountType}
                        accountNumber={accountNumber}
                        dateAndTime={dateAndTime}
                      />
                : <SuccessDetailsViewWithAccountNumber
                    accountType={accountType}
                    accountNumber={accountNumber}
                    dateAndTime={dateAndTime}
                    referenceId={referenceId}
            />}
                    
                </View>
            </View>
        );
    }

    function buildActionButton () {
        if (isSuccessfulAccountActivation) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <SpaceFiller height={16} />
                            {isEtbUser && (
                                <ActionButton
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    borderWidth={1}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={DONE}
                                        />
                                    }
                                    onPress={onDoneButtonDidTap}
                                />
                            )}
                            <SpaceFiller height={16} />

                            {!isEtbUser && onApplyDebitCardButtonDidTap ? (
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={APPLY_DEBIT_CARD}
                                        />
                                    }
                                    onPress={onApplyDebitCardButtonDidTap}
                                />
                            ) : null}
                            <SpaceFiller height={16} />
                            {!isEtbUser && (
                                <TouchableOpacity onPress={onDoneButtonDidTap} activeOpacity={0.8}>
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={DOITLATER_READY}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </FixedActionContainer>
            );
        } else {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        {/* <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo fontSize={14} lineHeight={18} fontWeight="600" text={DONE} />
                            }
                            onPress={onDoneButtonDidTap}
                        /> */}
                        <TouchableOpacity onPress={onDoneButtonDidTap} activeOpacity={0.8}>
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={DOITLATER_READY}
                                textAlign="left"
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            );
        }
    }
};

export const successPropTypes = (PremierActivationSuccess.propTypes = {
    ...entryPropTypes,
    isSuccessfulAccountActivation: PropTypes.bool,
    onDoneButtonDidTap: PropTypes.func,
    onApplyDebitCardButtonDidTap: PropTypes.func,
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

export default PremierActivationSuccess;

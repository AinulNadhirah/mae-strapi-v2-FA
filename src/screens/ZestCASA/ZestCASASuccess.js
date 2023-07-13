import PropTypes from "prop-types";
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

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { FADE_GREY, GREY, WHITE } from "@constants/colors";
import {
    APPLY_DEBIT_CARD,
    DONE,
    BOOK_APPOINTMENT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    SHARE_RECEIPT,
} from "@constants/strings";

import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";
import { SuccessDetailsViewWithAccountNumber } from "./components/SuccessDetailsView";

const ZestCASASuccess = ({ route }) => {
    const { getModel, updateModel } = useModelController();

    const isSuccessfulAccountActivation = route?.params?.isSuccessfulAccountActivation;
    const isHighRiskUser = route?.params?.isHighRiskUser;
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    const onApplyDebitCardButtonDidTap = route?.params?.onApplyDebitCardButtonDidTap;
    const onBookAppointmentButtonDidTap = route?.params?.onBookAppointmentButtonDidTap;
    const accountNumber = route?.params?.accountNumber;
    const accountType = route?.params?.accountType;
    const dateAndTime = route?.params?.dateAndTime;
    const title = route?.params?.title;
    const description = route?.params?.description;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;
    const isHighRiskUserResume = route?.params?.isHighRiskUserResume;
    const isActivateDebitCardSuccessful = route?.params?.isActivateDebitCardSuccessful;
    const onShareReceiptButtonDidTap = route?.params?.onShareReceiptButtonDidTap;

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
                                    <SpaceFiller height={36} />
                                    {isHighRiskUserResume
                                        ? buildSuccessfulViewResume()
                                        : buildSuccessfulView()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildSuccessfulViewResume() {
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

    function buildSuccessfulView() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={20}
                        fontWeight="300"
                        lineHeight={28}
                        textAlign="left"
                        text={title}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={description}
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={25} />
                    <SuccessDetailsViewWithAccountNumber
                        accountType={accountType}
                        accountNumber={accountNumber}
                        dateAndTime={dateAndTime}
                        referenceId={referenceId}
                    />
                </View>
            </View>
        );
    }

    function buildActionButton() {
        if (isSuccessfulAccountActivation) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor={GREY}
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
                            <SpaceFiller height={16} />
                            {onApplyDebitCardButtonDidTap ? (
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
                        </View>
                    </View>
                </FixedActionContainer>
            );
        } else if (isActivateDebitCardSuccessful) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={SHARE_RECEIPT}
                                    />
                                }
                                onPress={onShareReceiptButtonDidTap}
                            />
                            <SpaceFiller height={16} />
                            <ActionButton
                                fullWidth
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
                        </View>
                    </View>
                </FixedActionContainer>
            );
        } else if (isHighRiskUser) {
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
                                    text={BOOK_APPOINTMENT}
                                />
                            }
                            onPress={onBookAppointmentButtonDidTap}
                        />
                    </View>
                </FixedActionContainer>
            );
        } else {
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
    }
};

export const successPropTypes = (ZestCASASuccess.propTypes = {
    ...entryPropTypes,

    isSuccessfulAccountActivation: PropTypes.bool,
    onDoneButtonDidTap: PropTypes.func,
    onApplyDebitCardButtonDidTap: PropTypes.func,
    onBookAppointmentButtonDidTap: PropTypes.func,
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

export default ZestCASASuccess;

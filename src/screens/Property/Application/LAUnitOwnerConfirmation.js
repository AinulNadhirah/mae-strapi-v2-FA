/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_UNIT_OWNER_CONFIRMATION,
    LA_CUST_ADDRESS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DARK_GREY, BLACK, ROYAL_BLUE, FADE_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    YES,
    NO,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_APPLY_LOAN_OWNER,
    LOAN_APPROVAL_OFFER_TEXT,
} from "@constants/strings";

import { useResetNavigation } from "../Common/PropertyController";
import { saveLAInput } from "./LAController";

function LAUnitOwnerConfirmation({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [headerText, setHeaderText] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [showExitPopup, setShowExitPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_APPLY_LOAN_OWNER,
        });
    }, []);

    const init = useCallback(() => {
        console.log("[LAUnitOwnerConfirmation] >> [init]");

        const navParams = route?.params ?? {};
        const headerText = navParams?.headerText ?? "";
        const propertyName = navParams?.propertyName ?? "";

        setHeaderText(headerText);
        setPropertyName(propertyName);

        let currentStep = navParams?.currentStep ?? 2;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo = `Step ${currentStep} of ${totalSteps}`;
        setStepperInfo(stepperInfo);
    }, []);

    const onBackPress = () => {
        console.log("[LAUnitOwnerConfirmation] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[LAUnitOwnerConfirmation] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    function onYesPress() {
        console.log("[LAUnitOwnerConfirmation] >> [onContinue]");

        onContinue("Y");

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_APPLY_LOAN_OWNER,
        });
    }

    function onNoPress() {
        console.log("[LAUnitOwnerConfirmation] >> [onNoPress]");

        onContinue("N");
    }

    async function onExitPopupSave() {
        console.log("[LAUnitOwnerConfirmation] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_UNIT_OWNER_CONFIRMATION,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LAUnitOwnerConfirmation] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAUnitOwnerConfirmation] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    async function onContinue(value) {
        console.log("[LAUnitOwnerConfirmation] >> [onContinue]");

        const navParams = route?.params ?? {};

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        // Retrieve form data
        const formData = getFormData(value);

        // Save Form Data in DB before moving to next screen
        await saveLAInput({
            screenName: LA_UNIT_OWNER_CONFIRMATION,
            formData,
            navParams,
        });

        // Navigate to Customer address screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CUST_ADDRESS,
            params: { ...navParams, ...formData, currentStep },
        });
    }

    function getFormData(value = "") {
        console.log("[LAUnitOwnerConfirmation] >> [getFormData]");

        return {
            isUnitOwner: value,
        };
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text={stepperInfo}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <View style={styles.wrapper}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={headerText}
                                textAlign="left"
                            />

                            {/* subheader text */}
                            <View>
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    textAlign="left"
                                >
                                    <Text>{`Are you going to be the sole owner of `}</Text>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={`${propertyName} ?`}
                                    />
                                </Typo>
                            </View>
                        </View>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={20}
                                    style={styles.noteLabel}
                                    text={LOAN_APPROVAL_OFFER_TEXT}
                                    textAlign="left"
                                    color={DARK_GREY}
                                />

                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={YES}
                                        />
                                    }
                                    onPress={onYesPress}
                                />

                                {/* No */}
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={NO}
                                    onPress={onNoPress}
                                    style={styles.noBtn}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

LAUnitOwnerConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    label: {
        paddingTop: 8,
    },

    noBtn: {
        marginVertical: 15,
    },

    noteLabel: {
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingTop: 8,
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});

export default LAUnitOwnerConfirmation;

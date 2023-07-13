/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_UNIT_OWNER_CONFIRMATION,
    LA_UNIT_NUMBER,
    LA_UNIT_CONFIRMATION,
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
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { validateUnitNumber } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, FADE_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    SAVE_NEXT,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_PROPERTY_APPLYLOAN,
} from "@constants/strings";

import Assets from "@assets";

import { useResetNavigation, getEncValue } from "../Common/PropertyController";
import { saveLAInput, isTextContainsAlphanumeric, fetchGetApplicants } from "./LAController";

const ERR_MSG1 = "Name must contains at least 1 numeric or alphabetic characters and space(s) only";
const ERR_MSG2 = "Unit must contains at least 1 character";

function LAUnitNumber({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [headerText, setHeaderText] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [unitNumber, setUnitNumber] = useState("");
    const [isUnitNumberValid, setIsUnitNumberValid] = useState(true);
    const [unitNumberErrorMsg, setUnitNumberErrorMsg] = useState("");

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setContinueDisabled(unitNumber.length < 1);
    }, [unitNumber]);

    const init = useCallback(async () => {
        console.log("[LAUnitNumber] >> [init]");

        const navParams = route?.params ?? {};
        const propertyName = navParams?.propertyName ?? "";
        const headerText = navParams?.headerText ?? "";
        const resumeFlow = navParams?.resumeFlow ?? false;

        setHeaderText(headerText);
        setPropertyName(propertyName + "?");

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo = `Step ${currentStep} of ${totalSteps}`;
        setStepperInfo(stepperInfo);

        // Pre-populate data for resume flow
        if (resumeFlow) populateSavedData();
    }, []);

    const onBackPress = () => {
        console.log("[LAUnitNumber] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[LAUnitNumber] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    function populateSavedData() {
        console.log("[LAUnitNumber] >> [populateSavedData]");

        const savedData = route.params?.savedData ?? {};
        const unitNo = savedData?.unitNo ?? null;

        // Unit Number
        if (unitNo) setUnitNumber(unitNo);
    }

    async function onExitPopupSave() {
        console.log("[LAUnitNumber] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_UNIT_NUMBER,
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
        console.log("[LAUnitNumber] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAUnitNumber] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onChangeUnitNumber(value) {
        setUnitNumber(value);
    }

    function validateFormDetails() {
        console.log("[LAUnitNumber] >> [validateFormDetails]");

        // Reset validation state
        setIsUnitNumberValid(true);
        setUnitNumberErrorMsg("");

        //spaces
        if (unitNumber.trim().length === 0) {
            setUnitNumberErrorMsg(ERR_MSG2);
            setIsUnitNumberValid(false);
            setUnitNumber("");
            return false;
        }

        // Valid length checking
        if (unitNumber.length < 1) {
            setUnitNumberErrorMsg(ERR_MSG2);
            setIsUnitNumberValid(false);
            return false;
        }

        if (!isTextContainsAlphanumeric(unitNumber)) {
            setUnitNumberErrorMsg(ERR_MSG1);
            setIsUnitNumberValid(false);
            return false;
        }

        // Return true if passes validation check
        return true;
    }

    async function onContinue() {
        console.log("[LAUnitNumber] >> [onContinue]");

        const navParams = route?.params ?? {};

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        let currentStep = navParams?.currentStep ?? 1;
        currentStep = currentStep + 1;

        const stpId = navParams?.stpApplicationId ?? "";
        const encStpId = await getEncValue(stpId);

        // Request object
        const params = {
            unitNo: unitNumber ? unitNumber.trim() : "",
            stpId: encStpId,
        };

        // Call getFinancingPlan based on finance type selected
        const httpResp = await validateUnitNumber(params, true).catch((error) => {
            console.log("[LAUnitNumber][validateUnitNumber] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

        if (statusCode !== "0000") {
            setUnitNumberErrorMsg(statusDesc);
            setIsUnitNumberValid(false);
            return;
        }

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        await saveLAInput({
            screenName: LA_UNIT_NUMBER,
            formData,
            navParams,
        });
        const syncId = String(navParams?.syncId);

        const encSyncId = await getEncValue(syncId);

        const { success, jointApplicantDetails, errorMessage } = await fetchGetApplicants(
            encSyncId,
            false
        );

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const isJointApplicant =
            jointApplicantDetails !== null && Object.keys(jointApplicantDetails).length > 0
                ? true
                : false;

        if (isJointApplicant) {
            // Navigate to owner confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_UNIT_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                },
            });
        } else {
            // Navigate to owner confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_UNIT_OWNER_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                },
            });
        }

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYLOAN,
        });
    }

    function getFormData() {
        console.log("[LAUnitNumber] >> [getFormData]");

        return {
            unitNo: unitNumber ? unitNumber.trim() : unitNumber,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_APPLYLOAN}
            >
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
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            style={styles.containerView}
                            keyboardVerticalOffset={150}
                            enabled
                        >
                            <ScrollView style={styles.scrollView}>
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
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={28}
                                        style={styles.label}
                                        text="What's your unit number at"
                                        textAlign="left"
                                    />

                                    <Typo
                                        fontSize={20}
                                        fontWeight="bold"
                                        lineHeight={28}
                                        style={styles.label}
                                        text={propertyName}
                                        textAlign="left"
                                    />

                                    <TextInput
                                        autoFocus
                                        minLength={1}
                                        maxLength={15}
                                        isValidate
                                        isValid={isUnitNumberValid}
                                        errorMessage={unitNumberErrorMsg}
                                        value={unitNumber}
                                        keyboardType="default"
                                        onChangeText={onChangeUnitNumber}
                                        blurOnSubmit
                                        style={styles.unitTextInput}
                                        returnKeyType="done"
                                    />
                                </View>

                                <Image style={styles.tileImage} source={Assets.unitNumberTile} />
                            </ScrollView>
                        </KeyboardAvoidingView>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={SAVE_NEXT}
                                    />
                                }
                                onPress={onContinue}
                            />
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

LAUnitNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    containerView: {
        flex: 1,
        width: "100%",
    },

    label: {
        paddingTop: 8,
    },

    scrollView: {
        flex: 1,
    },

    tileImage: {
        height: 294,
        marginVertical: 16,
        paddingVertical: 16,
        width: "100%",
    },

    unitTextInput: {
        marginTop: 24,
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});

export default LAUnitNumber;

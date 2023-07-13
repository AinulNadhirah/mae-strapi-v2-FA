/* eslint-disable radix */

/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import Slider from "react-native-slider";

import { CE_PERSONAL, BANKINGV2_MODULE, CE_TENURE } from "@navigation/navigationConstant";

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

import { MEDIUM_GREY, YELLOW, BLUE, WHITE, BLACK, FADE_GREY } from "@constants/colors";
import {
    CONTINUE,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    COMMON_ERROR_MSG,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    SAVE_NEXT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_PROPERTY_CE_SAVEPROGRESS,
    FA_PROPERTY_CE_MORTGAGETENURE,
} from "@constants/strings";

import { useResetNavigation } from "../Common/PropertyController";
import { saveEligibilityInput, removeCEEditRoutes } from "./CEController";

function CETenure({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [headerText, setHeaderText] = useState("");
    const [ctaText, setCtaText] = useState(CONTINUE);
    const [subHeaderText, setSubHeaderText] = useState(
        "How long would you like your financing period to be?"
    );

    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [tenureValue, setTenureValue] = useState(35);
    const [tenureMaxAge, setTenureMaxAge] = useState(35);
    const [loanValue, setLoanValue] = useState("RM 0.00");

    const [showSlider, setShowSlider] = useState(true);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [cancelEditPopup, setCancelEditPopup] = useState(false);

    const [editFlow, setEditFlow] = useState(false);

    useEffect(() => {
        init();
    }, []);

    function init() {
        console.log("[CETenure] >> [init]");

        const navParams = route?.params ?? {};
        const header = navParams?.headerText ?? "";
        const loanVal = navParams?.loanAmount
            ? `RM ${numeral(navParams.loanAmount).format("0,0.00")}`
            : "";
        const age = navParams?.age;
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;
        const eligibleAgeSliderMaxDiff = 70 - age;
        const sliderMaxValue = Math.min(35, eligibleAgeSliderMaxDiff);

        setHeaderText(header);
        setLoanValue(loanVal);

        //set Stepper info
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && totalSteps && !paramsEditFlow && currentStep < totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);
        setCurrentStep(currentStep);
        setTotalSteps(totalSteps);

        if (age === 65) {
            //hide Slider - set default to 5 years
            setShowSlider(false);
            setSubHeaderText("Your financing period is set at ");
        } else {
            // Set Tenure max age based on user age from mdm
            setTenureMaxAge(sliderMaxValue);

            // Set Tenure default value as max value
            setTenureValue(sliderMaxValue);

            // Pre-populate data for resume OR editflow
            if (resumeFlow || paramsEditFlow) populateSavedData();
        }
    }

    const onBackTap = () => {
        console.log("[CETenure] >> [onBackTap]");

        navigation.goBack();
    };

    const onCloseTap = () => {
        console.log("[CETenure] >> [onCloseTap]");

        if (editFlow) {
            setCancelEditPopup(true);
        } else {
            setShowExitPopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            });
        }
    };

    function populateSavedData() {
        console.log("[CETenure] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const savedTenure = savedData?.tenure ?? null;
        const editTenure = navParams?.tenure ?? null;
        const tenure = paramsEditFlow ? editTenure : savedTenure;

        // Tenure
        if (tenure && !isNaN(tenure)) setTenureValue(parseInt(tenure));

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            setHeaderText(EDIT_FIN_DETAILS);
            setCtaText(SAVE_NEXT);
        }
    }

    function handleSliderChange(value) {
        setTenureValue(value);
    }

    async function onExitPopupSave() {
        console.log("[CETenure] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_TENURE,
            formData,
            navParams: route?.params,
            saveData: "Y",
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: SAVE,
        });
    }

    function onExitPopupDontSave() {
        console.log("[CETenure] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[CETenure] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onCancelEditPopupLeave() {
        console.log("[CETenure] >> [onCancelEditPopupLeave]");

        // Hide popup
        closeCancelEditPopup();

        // Removes all Eligibility edit flow screens
        const updatedRoutes = removeCEEditRoutes(navigationState?.routes ?? []);

        // Navigate to Eligibility Confirmation screen
        navigation.reset({
            index: updatedRoutes.length - 1,
            routes: updatedRoutes,
        });
    }

    function closeCancelEditPopup() {
        console.log("[CETenure] >> [closeCancelEditPopup]");

        setCancelEditPopup(false);
    }

    async function onContinue() {
        console.log("[CETenure] >> [onContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        if (editFlow) {
            // Navigate to Personal details screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PERSONAL,
                params: {
                    ...navParams,
                    ...formData,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            const { syncId } = await saveEligibilityInput({
                screenName: CE_TENURE,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            });

            // Navigate to Personal details screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PERSONAL,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                },
            });
        }

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_MORTGAGETENURE,
            [FA_FIELD_INFORMATION]: formData?.tenure,
        });
    }

    function getFormData() {
        console.log("[CETenure] >> [getFormData]");

        return {
            tenure: String(tenureValue),
            tenureMaxValue: tenureMaxAge,
            currentStep,
            totalSteps,
            origTenure: String(tenureValue),
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_CE_MORTGAGETENURE}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Description */}
                            <View style={styles.subHeader}>
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    text={subHeaderText}
                                    textAlign="left"
                                />

                                {!showSlider && (
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={28}
                                        text="5 years"
                                        textAlign="left"
                                        style={styles.termYearsLabel}
                                    />
                                )}
                            </View>

                            {/* Slider value */}
                            {showSlider && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={32}
                                    style={styles.sliderValue}
                                    text={`${tenureValue} years`}
                                />
                            )}

                            {/* Slider component */}
                            {showSlider && (
                                <>
                                    <Slider
                                        value={tenureValue}
                                        minimumValue={5}
                                        maximumValue={tenureMaxAge}
                                        animateTransitions
                                        animationType="spring"
                                        step={1}
                                        minimumTrackTintColor={BLUE}
                                        maximumTrackTintColor={WHITE}
                                        trackStyle={styles.sliderTrack}
                                        thumbStyle={styles.sliderThumb}
                                        onValueChange={handleSliderChange}
                                    />

                                    {/* Min/Max Slider Value Label */}
                                    <View style={styles.sliderMinMaxLabelContainer}>
                                        <Typo fontSize={12} lineHeight={18} text="5 years" />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            text={`${tenureMaxAge} years`}
                                        />
                                    </View>
                                </>
                            )}

                            {/* Financing amount */}
                            <View
                                style={[styles.detailFieldContainer, styles.detailPrimaryContainer]}
                            >
                                <Typo
                                    fontWeight="400"
                                    lineHeight={18}
                                    text="Your Financing Amount"
                                />
                                <Typo
                                    fontSize={24}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={loanValue}
                                    style={styles.loan}
                                />
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo lineHeight={18} fontWeight="600" text={ctaText} />
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
                description={EXIT_POPUP_DESC}
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

            {/* Cancel edit confirmation popup */}
            <Popup
                visible={cancelEditPopup}
                title={CANCEL_EDITS}
                description={CANCEL_EDITS_DESC}
                onClose={closeCancelEditPopup}
                primaryAction={{
                    text: LEAVE,
                    onPress: onCancelEditPopupLeave,
                }}
                secondaryAction={{
                    text: GO_BACK,
                    onPress: closeCancelEditPopup,
                }}
            />
        </>
    );
}

CETenure.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    detailFieldContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        marginTop: 32,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    detailPrimaryContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingVertical: 20,
    },

    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },

    loan: {
        color: BLACK,
        marginTop: 15,
    },

    sliderMinMaxLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        marginTop: 5,
    },

    sliderThumb: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 13,
        borderWidth: 8,
        height: 26,
        width: 26,
    },

    sliderTrack: {
        borderRadius: 12,
        height: 8,
    },

    sliderValue: {
        marginTop: 24,
        paddingBottom: 8,
    },

    subHeader: {
        paddingTop: 8,
    },

    termYearsLabel: {
        paddingTop: 2,
    },
});

export default CETenure;

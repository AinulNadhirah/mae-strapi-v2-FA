/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    CE_RESULT,
    CE_PF_NUMBER,
    CE_PF_NUMBER_CONFIRMATION,
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

import { validatePFNumber } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK, FADE_GREY } from "@constants/colors";
import {
    CONFIRM,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    CHECK_ELIGIBILITY,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    PROPERTY_MDM_ERR,
    FA_PROPERTY_CE_STAFF_ID,
    FA_PROPERTY_CE_SAVEPROGRESS,
    SALES_REP_ASSISTING_TEXT,
} from "@constants/strings";

import { maeOnlyNumberRegex } from "@utils/dataModel";

import {
    fetchRFASwitchStatus,
    getJAButtonEnabled,
    useResetNavigation,
} from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import { saveEligibilityInput, checkEligibility, removeInputFormRoutes } from "./CEController";

const ERR_MSG = "Staff ID does not exist";

function CEPFNumber({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const navigationState = useNavigationState((state) => state);

    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");
    const [pfNumber, setPFNumber] = useState("");
    const [isPFNumberValid, setIsPFNumberValid] = useState(true);
    const [pfNumberErrorMsg, setPFNumberErrorMsg] = useState("");
    const [isSalesRepresentative, setIsSalesRepresentative] = useState("Y");

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [isContinueDisabled, setContinueDisabled] = useState(true);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const isDisabled = isSalesRepresentative === "Y" ? pfNumber.length < 1 : false;
        setContinueDisabled(isDisabled);
    }, [pfNumber, isSalesRepresentative]);

    function init() {
        console.log("[CEPFNumber] >> [init]");

        const navParams = route?.params ?? {};
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && totalSteps && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);
        setCurrentStep(currentStep);
        setTotalSteps(totalSteps);

        const resumeFlow = navParams?.resumeFlow ?? false;

        // Pre-populate data for resume flow
        if (resumeFlow) populateSavedData();
        setLoading(false);
    }

    function onBackPress() {
        console.log("[CEPFNumber] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    const onCloseTap = () => {
        console.log("[CEPFNumber] >> [onCloseTap]");

        setShowExitPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
        });
    };

    function populateSavedData() {
        console.log("[CEPFNumber] >> [populateSavedData]");

        const savedData = route.params?.savedData ?? {};
        const staffPfNo = savedData?.staffPfNo ?? null;

        // Staff ID
        if (staffPfNo) setPFNumber(staffPfNo);
    }

    function onChangePFNumber(value) {
        setPFNumber(value);
    }

    function validateFormDetails() {
        console.log("[CEPFNumber] >> [validateFormDetails]");

        // Reset validation state
        setIsPFNumberValid(true);
        setPFNumberErrorMsg("");

        // Valid length checking
        if (isSalesRepresentative === "Y") {
            if (pfNumber.length < 8) {
                setPFNumberErrorMsg(ERR_MSG);
                setIsPFNumberValid(false);
                return false;
            } else if (!maeOnlyNumberRegex(pfNumber)) {
                setPFNumberErrorMsg("Please enter valid staff ID.");
                setIsPFNumberValid(false);
                return false;
            }
        }

        // Return true if passes validation check
        return true;
    }

    async function onExitPopupSave() {
        console.log("[CEPFNumber] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PF_NUMBER,
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
        console.log("[CEPFNumber] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[CEPFNumber] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onSalesRepresentativeYesNoChange(value) {
        console.log("[CEPFNumber] >> [onSalesRepresentativeYesNoChange]");

        setIsSalesRepresentative(value);

        if (value === "N") setPFNumber("");
    }

    async function onPressConfirm() {
        console.log("[CEPFNumber] >> [onPressConfirm]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) {
            return;
        }

        setLoading(true);

        if (isSalesRepresentative === "Y") {
            // Request object
            const params = {
                pfid: pfNumber,
            };
            try {
                const httpResp = await validatePFNumber(params, false);
                const statusCode = httpResp?.data?.result?.statusCode ?? null;
                const staffName = httpResp?.data?.result?.staffName ?? null;
                if (statusCode === "0000" && staffName) {
                    // Call method to save data and continue to next screen
                    await saveAndContinue(staffName);
                } else {
                    setLoading(false);

                    // Show error message
                    const validationMsg = httpResp?.data?.result?.validationMsg ?? "";
                    if (validationMsg) {
                        setPFNumberErrorMsg(validationMsg);
                        setIsPFNumberValid(false);
                    } else {
                        const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;
                        showErrorToast({
                            message: statusDesc,
                        });
                    }
                }
            } catch (error) {
                setLoading(false);
                showErrorToast({
                    message: error?.message ?? COMMON_ERROR_MSG,
                });
            }
        } else {
            await saveAndContinue();
        }

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_STAFF_ID,
        });
    }

    function getFormData() {
        console.log("[CEPFNumber] >> [getFormData]");

        return {
            staffPfNo: pfNumber ?? "",
            currentStep,
            totalSteps,
        };
    }

    async function saveAndContinue(staffName = "") {
        console.log("[CEPFNumber] >> [saveAndContinue]");
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );

        if (isSalesRepresentative === "Y") {
            // Navigate to PF Number confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PF_NUMBER_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    staffName,
                    currentStep,
                },
            });
            setLoading(false);
        } else {
            // make Check Eligibility API
            callEligibilityAPI(navParams, formData);
        }
    }

    async function callEligibilityAPI(navParams, formData) {
        console.log("[CEPFNumber] >> [callEligibilityAPI]");

        const navigationRoutes = navigationState?.routes ?? [];
        const updatedRoutes = removeInputFormRoutes(navigationRoutes);

        const { successRes, result } = await getJAButtonEnabled(false);
        // Show error if failed to fetch MDM data
        if (!successRes) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }
        const { statusResp, response } = await fetchRFASwitchStatus(false);
        // Show error message
        if (!statusResp) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus, baseRateLabel } =
            await checkEligibility(
                {
                    ...navParams,
                    ...formData,
                },
                false
            );

        if (!success) {
            setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }

        const editFlow = navParams?.editFlow ?? false;

        const nextScreen = {
            name: CE_RESULT,
            params: {
                ...navParams,
                ...formData,
                stpApplicationId: stpId,
                eligibilityResult,
                eligibilityStatus: overallStatus,
                baseRateLabel,
                isEditFlow: editFlow,
                editFlow: null,
                currentScreenName: "MA_VIEW",
                isJAButtonEnabled: result,
                isRFAButtonEnabled: response,
            },
        };
        updatedRoutes.push(nextScreen);

        // Navigate to Eligibility result screen
        navigation.reset({
            index: updatedRoutes.length - 1,
            routes: updatedRoutes,
        });

        setLoading(false);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_CE_STAFF_ID}
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
                    <View style={styles.wrapper}>
                        <Typo
                            fontWeight="600"
                            lineHeight={18}
                            text={CHECK_ELIGIBILITY}
                            textAlign="left"
                        />
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            style={styles.label}
                            text={SALES_REP_ASSISTING_TEXT}
                            textAlign="left"
                        />

                        {/* Sales representative Selection */}
                        <RadioYesNo
                            defaultValue={isSalesRepresentative}
                            onChange={onSalesRepresentativeYesNoChange}
                        />

                        {/* PF number */}
                        {isSalesRepresentative === "Y" && (
                            <View>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={18}
                                    text="If yes, enter their staff ID number"
                                    textAlign="left"
                                />
                                <TextInput
                                    minLength={8}
                                    maxLength={8}
                                    isValidate
                                    isValid={isPFNumberValid}
                                    errorMessage={pfNumberErrorMsg}
                                    value={pfNumber}
                                    placeholder="00001234"
                                    keyboardType="numeric"
                                    onChangeText={onChangePFNumber}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>
                        )}
                    </View>

                    {/* Bottom Container */}
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
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
                                        text={CONFIRM}
                                    />
                                }
                                onPress={onPressConfirm}
                            />
                        </View>
                    </FixedActionContainer>
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
        </>
    );
}

CEPFNumber.propTypes = {
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

    skipBtn: {
        marginVertical: 15,
    },

    wrapper: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 36,
    },
});

export default CEPFNumber;

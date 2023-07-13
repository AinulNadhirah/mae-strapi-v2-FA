/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { CE_PF_NUMBER, CE_RESULT } from "@navigation/navigationConstant";

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

import { MEDIUM_GREY, YELLOW, WHITE, GREY, FADE_GREY } from "@constants/colors";
import {
    CONFIRM,
    EDIT,
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
    FA_PROPERTY_CE_CONFIRM_STAFFID,
    FA_PROPERTY_CE_SAVEPROGRESS,
    CONFIRM_DETAILS_SALES_REP,
} from "@constants/strings";

import {
    fetchRFASwitchStatus,
    getJAButtonEnabled,
    useResetNavigation,
} from "../Common/PropertyController";
import { saveEligibilityInput, checkEligibility, removeInputFormRoutes } from "./CEController";

function CEPFNumberConfirmation({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const navigationState = useNavigationState((state) => state);

    const [loading, setLoading] = useState(true);
    const [stepperInfo, setStepperInfo] = useState("");
    const [staffName, setStaffName] = useState("");
    const [staffID, setStaffID] = useState("");

    const [showExitPopup, setShowExitPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    function init() {
        console.log("[CEPFNumberConfirmation] >> [init]");

        const navParams = route?.params ?? {};
        const currentStep = navParams?.currentStep;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && totalSteps && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);

        setStaffName(navParams?.staffName ?? "");
        setStaffID(navParams?.staffPfNo ?? "");
        setLoading(false);
    }

    function onBackPress() {
        console.log("[CEPFNumberConfirmation] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEPFNumberConfirmation] >> [onCloseTap]");

        setShowExitPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
        });
    }

    async function onExitPopupSave() {
        console.log("[CEPFNumberConfirmation] >> [onExitPopupSave]");

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
        console.log("[CEPFNumberConfirmation] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[CEPFNumberConfirmation] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    async function onPressConfirm() {
        console.log("[CEPFNumberConfirmation] >> [onPressConfirm]");

        setLoading(true);
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

        // Call Check Eligibility API
        callEligibilityAPI(navParams, formData);

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_CONFIRM_STAFFID,
        });
    }

    function getFormData() {
        console.log("[CEPFNumberConfirmation] >> [getFormData]");

        return {
            staffPfNo: staffID,
            staffName,
        };
    }

    async function callEligibilityAPI(navParams, formData) {
        console.log("[CEPFNumberConfirmation] >> [callEligibilityAPI]");

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
                analyticScreenName={FA_PROPERTY_CE_CONFIRM_STAFFID}
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
                        <View style={styles.wrapper}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={CHECK_ELIGIBILITY}
                                textAlign="left"
                            />

                            {/* Subtext */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={CONFIRM_DETAILS_SALES_REP}
                                textAlign="left"
                            />

                            {/* Staff name */}
                            <View style={styles.fieldView}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="300"
                                    lineHeight={28}
                                    text="Staff name"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={staffName}
                                    textAlign="left"
                                />
                            </View>

                            {/* Staff ID */}
                            <View style={styles.fieldView}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="300"
                                    lineHeight={28}
                                    text="Staff ID number"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={28}
                                    text={staffID}
                                    textAlign="left"
                                />
                            </View>
                        </View>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                {/* Confirm */}
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={CONFIRM} />
                                    }
                                    onPress={onPressConfirm}
                                    style={styles.confirm}
                                />

                                {/* Edit */}
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderStyle="solid"
                                    borderWidth={1}
                                    borderColor={GREY}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={EDIT}
                                        />
                                    }
                                    onPress={onBackPress}
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

CEPFNumberConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },

    confirm: {
        marginVertical: 16,
    },

    fieldView: {
        marginTop: 25,
    },

    label: {
        paddingTop: 8,
    },

    wrapper: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 36,
    },
});

export default CEPFNumberConfirmation;

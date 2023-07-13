/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_TNC,
    LA_PRODUCT_PLANS,
    DASHBOARD_STACK,
    LA_CONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    BLACK,
    FADE_GREY,
    YELLOW,
    DISABLED,
    WHITE,
    SHADOW_LIGHT,
    DISABLED_TEXT,
    RED,
    STATUS_GREEN,
} from "@constants/colors";
import { PROP_LA_INPUT } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
} from "@constants/strings";

import {
    useResetNavigation,
    checkCCRISReportAvailability,
    getEncValue,
} from "../Common/PropertyController";
import { saveLAInput } from "./LAController";

const RECOMMENDED = "Recommended";
const UNAVAILABLE = "Unavailable";

function LAProductPlans({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [loading, setLoading] = useState(true);
    const [headerText, setHeaderText] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [productPlans, setProductPlans] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [editFlow, setEditFlow] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[LAProductPlans] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;

        const headerText = navParams?.headerText ?? "";
        const productPlans = navParams?.recommendedPlan ?? [];

        setHeaderText(headerText);
        setProductPlans(productPlans);

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && totalSteps && !paramsEditFlow && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);

        // Pre-populate data for resume OR edit flow
        if (resumeFlow || paramsEditFlow) populateSavedData();

        setLoading(false);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_FinancingPlan",
        });
    }, []);

    function onBackPress() {
        console.log("[LAProductPlans] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LAProductPlans] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    function populateSavedData() {
        console.log("[LAProductPlans] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const savedFinancingPlan = savedData?.financingPlan ?? null;
        const editFinancingPlan = navParams?.financingPlan ?? null;
        const financingPlanSelected = paramsEditFlow ? editFinancingPlan : savedFinancingPlan;

        const allFinancingPlans = masterData?.financePlan ?? [];

        if (financingPlanSelected) {
            const financingPlanObj = allFinancingPlans.find(
                ({ id }) => id === financingPlanSelected
            );
            if (financingPlanObj) {
                setSelectedItem(financingPlanObj);
            }
        }

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            setStepperInfo("Step 2 of 2");
            setHeaderText("Edit product details");
        }
    }

    function onPlanTypePress(data) {
        console.log("[LAProductPlans] >> [onPlanTypePress]");
        setLoading(true);
        // Update selected value
        setSelectedItem(data);

        // For edit flow, no need to call score party API
        if (editFlow) {
            saveAndContinue(data, null, null, null);
            return;
        }

        getCCrisLoansCount(data);

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_FinancingPlan",
            [FA_FIELD_INFORMATION]: data?.title,
        });
    }

    function onSeeMoreDetailsPress(data) {
        console.log("[LAProductPlans] >> [onSeeMoreDetailsPress]");

        //link to open browser
        const productLink = data?.productLink ?? null;
        if (productLink) {
            navigation.navigate(DASHBOARD_STACK, {
                screen: "ExternalUrl",
                params: {
                    title: data?.title ?? "",
                    url: productLink,
                },
            });
        }
    }

    async function onExitPopupSave() {
        console.log("[LAProductPlans] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData(selectedItem);

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_PRODUCT_PLANS,
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
        console.log("[LAProductPlans] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAProductPlans] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function getFormData(selectedPlan = {}) {
        console.log("[LAProductPlans] >> [getFormData]");
        const navParams = route?.params ?? {};
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        return {
            financingPlan: selectedPlan?.id ?? "",
            financingPlanTitle: selectedPlan?.title ?? "",
            currentStep,
        };
    }

    async function getCCrisLoansCount(data) {
        const encSyncId = await getEncValue(route?.params?.syncId ?? "");

        // Request object
        const params = {
            progressStatus: PROP_LA_INPUT,
            propertyId: route?.params?.propertyDetails?.property_id ?? "",
            syncId: encSyncId,
        };

        // API Call - To check CCRIS report availability for loans count.
        const { success, errorMessage, ccrisLoanCount, unmatchApplForCreditRecord } =
            await checkCCRISReportAvailability(params, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage || COMMON_ERROR_MSG });
            return;
        }
        saveAndContinue(data, ccrisLoanCount, unmatchApplForCreditRecord);
    }

    async function saveAndContinue(
        selectedPlan,
        ccrisLoanCount = 0,
        unmatchApplForCreditRecord = ""
    ) {
        console.log("[LAProductPlans] >> [saveAndContinue]");

        const navParams = route?.params ?? {};

        // Retrieve form data
        const formData = getFormData(selectedPlan);

        if (editFlow) {
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: LA_PRODUCT_PLANS,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            await saveLAInput(
                {
                    screenName: LA_PRODUCT_PLANS,
                    formData,
                    navParams,
                },
                false
            );

            // Navigate to next screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_TNC,
                params: {
                    ...navParams,
                    ...formData,
                    laCcrisLoanCount: ccrisLoanCount,
                    unmatchApplForCreditRecord,
                },
            });
        }
        setLoading(false);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
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
                            headerRightElement={
                                editFlow ? <></> : <HeaderCloseButton onPress={onCloseTap} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
                            {/* Title */}
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={headerText}
                                textAlign="left"
                                style={styles.title}
                            />

                            {/* subheader text */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Select your financing plan"
                                textAlign="left"
                            />

                            {/* Unit types */}
                            {productPlans?.length > 0 && (
                                <>
                                    <ScrollView
                                        style={styles.planTypeScrollView}
                                        contentContainerStyle={styles.plansListScrollContainer}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {productPlans.map((item, index) => {
                                            return (
                                                <PlanTypeTile
                                                    key={index}
                                                    index={index}
                                                    data={item}
                                                    onPress={onPlanTypePress}
                                                    onDetailsPress={onSeeMoreDetailsPress}
                                                    selectedItem={selectedItem}
                                                    editFlow={editFlow}
                                                />
                                            );
                                        })}
                                    </ScrollView>
                                </>
                            )}
                        </ScrollView>
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

LAProductPlans.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

// Plan Type Tile
const PlanTypeTile = ({ data, onPress, onDetailsPress, index, editFlow }) => {
    const onTilePress = () => {
        console.log("[PlanTypeTile] >> [onTilePress]", data);
        if (onPress) onPress(data, index);
    };

    const onMoreDetails = () => {
        console.log("[PlanTypeTile] >> [onMoreDetails]", data);
        if (onPress) onDetailsPress(data, index);
    };

    const features = data?.points ?? [];
    const tag = data?.tag ?? "";

    const isButtonDisabled = tag === UNAVAILABLE;

    const actionButtonText = editFlow ? "Select & Confirm" : "Select This Plan";

    return (
        <View style={styles.planTypeTile}>
            {/* Tags - Recommended, Unavailable */}
            {tag.length > 0 && (
                <View style={tag === RECOMMENDED ? styles.recommended : styles.unavailable}>
                    <Typo fontSize={12} lineHeight={16} fontWeight="600" text={tag} color={WHITE} />
                </View>
            )}

            {/* plan Name */}
            <Typo
                fontSize={14}
                lineHeight={18}
                fontWeight="600"
                text={data.title}
                textAlign="left"
            />

            {/* plan sub header */}
            <Typo
                fontSize={14}
                lineHeight={20}
                fontWeight="300"
                text={data.subTitle}
                style={styles.subLabel}
                textAlign="left"
            />

            {/* plan features */}
            <View style={styles.planTypeDetailsSection}>
                {features.map((item, index) => (
                    <FeatureRow text={item} key={index} />
                ))}
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onMoreDetails}>
                <Typo
                    lineHeight={18}
                    fontWeight="600"
                    text="See more details"
                    style={styles.moreDetails}
                />
            </TouchableOpacity>

            <View style={styles.bottomContainer}>
                <ActionButton
                    disabled={isButtonDisabled}
                    activeOpacity={isButtonDisabled ? 1 : 0.5}
                    backgroundColor={isButtonDisabled ? DISABLED : YELLOW}
                    fullWidth
                    componentCenter={
                        <Typo
                            lineHeight={18}
                            fontWeight="600"
                            text={actionButtonText}
                            color={isButtonDisabled ? DISABLED_TEXT : BLACK}
                        />
                    }
                    onPress={onTilePress}
                />
            </View>
        </View>
    );
};

PlanTypeTile.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    onDetailsPress: PropTypes.func,
    index: PropTypes.number,
    editFlow: PropTypes.bool,
};

const FeatureRow = ({ text }) => {
    return (
        <View style={styles.metaViewCls}>
            <View style={styles.circularView} />
            <Typo lineHeight={20} textAlign="left" text={text} style={styles.metaText} />
        </View>
    );
};

FeatureRow.propTypes = {
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    bottomContainer: {
        alignItems: "center",
        bottom: 16,
        left: 24,
        position: "absolute",
        right: 24,
    },
    circularView: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginRight: 8,
        marginTop: 10,
        width: 4,
    },
    label: {
        paddingLeft: 36,
        paddingTop: 8,
    },
    metaText: {
        paddingRight: 16,
    },
    metaViewCls: {
        flexDirection: "row",
        paddingTop: 8,
    },
    moreDetails: {
        paddingTop: 8,
        textDecorationLine: "underline",
    },
    planTypeDetailsSection: {
        alignItems: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 24,
    },
    planTypeScrollView: {
        flex: 1,
        marginVertical: 16,
    },
    planTypeTile: {
        alignItems: "flex-start",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        height: 480,
        margin: 8,
        padding: 24,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 303,
    },
    plansListScrollContainer: {
        padding: 24,
    },
    recommended: {
        backgroundColor: STATUS_GREEN,
        borderRadius: 12,
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    subLabel: {
        paddingTop: 8,
    },
    title: {
        paddingLeft: 36,
    },
    unavailable: {
        backgroundColor: RED,
        borderRadius: 12,
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    wrapper: {
        flex: 1,
    },
});

export default LAProductPlans;

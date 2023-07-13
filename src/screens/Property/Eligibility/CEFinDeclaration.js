/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigationState } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import { BANKINGV2_MODULE, CE_FIN_DECLARATION, CE_PF_NUMBER } from "@navigation/navigationConstant";

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

import { MEDIUM_GREY, YELLOW, DISABLED, BLACK, DISABLED_TEXT } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    PROP_PURCHASE_LBL,
    ONGOING_LOAN_LBL,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_PROPERTY_CE_ADDITIONALINFORMATION,
    FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
} from "@constants/strings";

import { useResetNavigation } from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import { saveEligibilityInput, removeCEEditRoutes } from "./CEController";

function CEFinDeclaration({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const navigationState = useNavigationState((state) => state);

    // const [headerText, setHeaderText] = useState("");
    const [loading, setLoading] = useState(true);
    const [propertyPurchase, setPropertyPurchase] = useState(null);
    const [ongoingLoan, setOngoingLoan] = useState(null);

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [cancelEditPopup, setCancelEditPopup] = useState(false);

    const [isContinueDisabled, setContinueDisabled] = useState(true);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setContinueDisabled(!(propertyPurchase && ongoingLoan));
    }, [propertyPurchase, ongoingLoan]);

    const init = () => {
        console.log("[CEFinDeclaration] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;

        // Set Header Text
        // setHeaderText(navParams?.headerText ?? "");

        // Pre-populate data for resume OR edit flow
        if (resumeFlow || paramsEditFlow) {
            populateSavedData();
        } else {
            setPropertyPurchase("Y");
            setOngoingLoan("N");
        }
        setLoading(false);
    };

    function onBackPress() {
        console.log("[CEFinDeclaration] >> [onBackPress]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEFinDeclaration] >> [onCloseTap]");

        setShowExitPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
        });
    }

    function populateSavedData() {
        console.log("[CEFinDeclaration] >> [populateSavedData]");

        // propertyPurchase,
        // ongoingLoan,

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const savedPropertyPurchase = savedData?.propertyPurchase ?? null;
        const editPropertyPurchase = navParams?.propertyPurchase ?? null;

        const savedOngoingLoan = savedData?.ongoingLoan ?? null;
        const editOngoingLoan = navParams?.ongoingLoan ?? null;

        // Property purchase
        if (paramsEditFlow) {
            setPropertyPurchase(editPropertyPurchase);
            setOngoingLoan(editOngoingLoan);
        }

        if (navParams?.resumeFlow) {
            setPropertyPurchase(savedPropertyPurchase);
            setOngoingLoan(savedOngoingLoan);
        }
    }

    async function onExitPopupSave() {
        console.log("[CEFinDeclaration] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_FIN_DECLARATION,
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
            [FA_SCREEN_NAME]: FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
            [FA_ACTION_NAME]: SAVE,
        });
    }

    function onExitPopupDontSave() {
        console.log("[CEFinDeclaration] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    const closeExitPopup = () => {
        console.log("[CEFinDeclaration] >> [closeExitPopup]");

        setShowExitPopup(false);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    };

    function onCancelEditPopupLeave() {
        console.log("[CEFinDeclaration] >> [onCancelEditPopupLeave]");

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
        console.log("[CEFinDeclaration] >> [closeCancelEditPopup]");

        setCancelEditPopup(false);
    }

    function onPropertyPurchaseChange(value) {
        console.log("[CEFinDeclaration] >> [onPropertyPurchaseChange]");

        setPropertyPurchase(value);
    }

    function onOngoingLoanChange(value) {
        console.log("[CEFinDeclaration] >> [onOngoingLoanChange]");

        setOngoingLoan(value);
    }

    async function onContinue() {
        console.log("[CEFinDeclaration] >> [onContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        const { syncId } = await saveEligibilityInput({
            screenName: CE_FIN_DECLARATION,
            formData,
            navParams: route?.params,
            saveData: resumeFlow ? "Y" : "N",
        });

        // Navigate to PFNumber screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PF_NUMBER,
            params: {
                ...navParams,
                ...formData,
                syncId,
            },
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_ADDITIONALINFORMATION,
        });
    }

    function getFormData() {
        console.log("[CEFinDeclaration] >> [getFormData]");

        return {
            propertyPurchase,
            ongoingLoan,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_CE_ADDITIONALINFORMATION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <ScrollView style={Style.container} showsVerticalScrollIndicator={false}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text="Additional information required"
                                numberOfLines={2}
                                textAlign="left"
                                style={Style.headerText}
                            />

                            {/* Property Purchase Selection */}
                            <RadioYesNo
                                label={PROP_PURCHASE_LBL}
                                defaultValue={propertyPurchase}
                                onChange={onPropertyPurchaseChange}
                            />

                            {/* Ongoing Loan Selection */}
                            <RadioYesNo
                                label={ONGOING_LOAN_LBL}
                                defaultValue={ongoingLoan}
                                onChange={onOngoingLoanChange}
                            />

                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text="Declaration"
                                textAlign="left"
                                style={Style.headerText}
                            />

                            <Typo
                                fontSize={14}
                                lineHeight={24}
                                text={`I am/We are aware that margin of finance for third residential property is up to 70% of Open Market Value or Sale & Purchase Price - whichever is lower
                                \n I/We hereby acknowledge that the processing of my/our mortage loan/financing is based partly on this Declaration. I/We further confirm that this Declaration is true and accurate as regards to the purpose intended.`}
                                textAlign="left"
                                style={Style.declarationText}
                            />
                        </ScrollView>
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
                                        text="Agree and Confirm"
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

CEFinDeclaration.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    declarationText: {
        marginBottom: 24,
    },

    headerText: {
        marginBottom: 25,
    },
});

export default CEFinDeclaration;

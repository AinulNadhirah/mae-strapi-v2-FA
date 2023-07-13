/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import {
    BANKINGV2_MODULE,
    PROPERTY_DETAILS,
    CE_PROPERTY_SEARCH_LIST,
    CE_PROPERTY_ADDRESS,
    CE_PROPERTY_NAME,
    CE_PURCHASE_DOWNPAYMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getPropertyList } from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    ROYAL_BLUE,
    FADE_GREY,
} from "@constants/colors";
import {
    SAVE_NEXT,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    COMMON_ERROR_MSG,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_PROPERTY_APPLYMORTGAGE_PROPERTYNAME,
    FIND_ADDRESS_MANUALLY,
    FA_PROPERTY_CE_SAVEPROGRESS,
} from "@constants/strings";

import Assets from "@assets";

import { useResetNavigation } from "../Common/PropertyController";
import { saveEligibilityInput } from "./CEController";

const ERR_MSG = "Name must contains at least 3 characters and space(s) only";

function CEPropertyName({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [propertyName, setPropertyName] = useState("");
    const [isPropertyNameValid, setIsPropertyNameValid] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setIsContinueDisabled(propertyName.length < 1);
    }, [propertyName]);

    const init = useCallback(() => {
        console.log("[CEPropertyName] >> [init]");

        const navParams = route?.params ?? {};
        const currentStep = 1;
        const totalSteps = 8;
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
    }, []);

    const onBackPress = () => {
        console.log("[CEPropertyName] >> [onBackPress]");

        const navParams = route?.params ?? {};
        const resumeFlow = route.params?.resumeFlow ?? false;

        if (resumeFlow) {
            navigation.goBack();
        } else if (navParams?.isPropertyListed === "N") {
            resetToDiscover();
        } else {
            // Navigate to Property details screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DETAILS,
            });
        }
    };

    function populateSavedData() {
        console.log("[CEPropertyName] >> [populateSavedData]");

        const savedData = route.params?.savedData ?? {};
        const savedPropertyName = savedData?.propertySearchName ?? null;

        // Property Name
        if (savedPropertyName) setPropertyName(savedPropertyName);
    }

    function onChangePropertyName(value) {
        setPropertyName(value);
    }

    async function onEnterManuallyPress() {
        console.log("[CEPropertyName] >> [onEnterManuallyPress]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        const { syncId } = await saveEligibilityInput({
            screenName: CE_PROPERTY_NAME,
            formData,
            navParams,
            saveData: resumeFlow ? "Y" : "N",
        });

        // Navigate to Property Address screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PROPERTY_ADDRESS,
            params: {
                ...navParams,
                ...formData,
                totalSteps,
                syncId,
            },
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_PROPERTYNAME,
            [FA_FIELD_INFORMATION]: FIND_ADDRESS_MANUALLY,
        });
    }

    function getProperties() {
        console.log("[CEPropertyName] >> [getProperties]");

        const navParams = route?.params ?? {};

        // Request params
        const params = {
            latitude: navParams?.latitude ?? "",
            longitude: navParams?.longitude ?? "",
            filter_Type: "nonListed",
            search_key: propertyName,
            page_no: 1,
            page_size: 5,
        };

        // API call to fetch properties
        getPropertyList(params)
            .then((httpResp) => {
                console.log("[CEPropertyName][getPropertyList] >> Response: ", httpResp);

                const propertyList = httpResp?.data?.result?.propertyList ?? [];
                saveAndContinue(propertyList);
            })
            .catch((error) => {
                console.log("[CEPropertyName][getPropertyList] >> Exception: ", error);

                saveAndContinue([]);
            });
    }

    async function onExitPopupSave() {
        console.log("[CEPropertyName] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PROPERTY_NAME,
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
        console.log("[CEPropertyName] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    function closeExitPopup() {
        console.log("[CEPropertyName] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function isTextContainsAlphanumeric(text) {
        const regex = /[a-zA-Z0-9]/;
        return regex.test(String(text).toLowerCase());
    }

    function validateFormDetails() {
        console.log("[CEPropertyName] >> [validateFormDetails]");

        // Reset validation state
        setIsPropertyNameValid(true);
        setErrorMsg("");

        //spaces
        if (propertyName.trim().length === 0) {
            setErrorMsg(ERR_MSG);
            setIsPropertyNameValid(false);
            setPropertyName("");
            return false;
        }

        // Min length checking
        if (propertyName.trim().length < 3) {
            setErrorMsg(ERR_MSG);
            setIsPropertyNameValid(false);
            return false;
        }

        // Valid character checking
        if (!isTextContainsAlphanumeric(propertyName)) {
            setErrorMsg(ERR_MSG);
            setIsPropertyNameValid(false);
            return false;
        }

        setPropertyName(propertyName.trim());

        // Return true if passes validation check
        return true;
    }

    function onContinue() {
        console.log("[CEPropertyName] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Call API to search Properties
        getProperties();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLYMORTGAGE_PROPERTYNAME,
            [FA_FIELD_INFORMATION]: propertyName,
        });
    }

    function getFormData() {
        console.log("[CEPropertyName] >> [getFormData]");
        const propertyNameTrimmed = propertyName ? propertyName.trim() : propertyName;
        return {
            propertyName: propertyNameTrimmed,
            propertySearchName: propertyNameTrimmed,
            currentStep,
            totalSteps,
        };
    }

    async function saveAndContinue(propertyList) {
        console.log("[CEPropertyName] >> [saveAndContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();
        const propertyNameTrimmed = propertyName ? propertyName.trim() : propertyName;

        // Save Form Data in DB before moving to next screen
        const { syncId } = await saveEligibilityInput({
            screenName: CE_PROPERTY_NAME,
            formData,
            navParams,
            saveData: resumeFlow ? "Y" : "N",
        });

        if (propertyList.length) {
            // Navigate to Property Search List screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PROPERTY_SEARCH_LIST,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                    propertyList,
                    propertySearchName: propertyNameTrimmed,
                },
            });
        } else {
            // Navigate to Purchase downpayment screen if no properties found
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PURCHASE_DOWNPAYMENT,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                    headerText: propertyName ? propertyName.trim() : propertyName,
                },
            });
        }
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_APPLYMORTGAGE_PROPERTYNAME}
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
                            // headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                                        text="Apply mortgage"
                                        textAlign="left"
                                    />

                                    {/* subheader text */}
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={28}
                                        style={styles.label}
                                        text="What is the property name?"
                                        textAlign="left"
                                    />

                                    <View style={styles.input}>
                                        <LongTextInput
                                            autoFocus
                                            minLength={1}
                                            maxLength={60}
                                            isValidate
                                            isValid={isPropertyNameValid}
                                            errorMessage={errorMsg}
                                            value={propertyName}
                                            onChangeText={onChangePropertyName}
                                            numberOfLines={2}
                                        />
                                    </View>
                                </View>

                                <Image style={styles.tileImage} source={Assets.propertyNameTile} />
                            </ScrollView>
                        </KeyboardAvoidingView>
                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContainer}>
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

                                <Typo
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Enter address manually"
                                    onPress={onEnterManuallyPress}
                                    style={styles.textButton}
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

CEPropertyName.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContainer: {
        width: "100%",
    },

    containerView: {
        flex: 1,
        width: "100%",
    },

    input: {
        marginTop: 24,
    },

    label: {
        paddingTop: 8,
    },

    scrollView: {
        flex: 1,
    },

    textButton: {
        marginVertical: 15,
    },

    tileImage: {
        height: 294,
        marginVertical: 16,
        paddingVertical: 16,
        width: "100%",
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});

export default CEPropertyName;

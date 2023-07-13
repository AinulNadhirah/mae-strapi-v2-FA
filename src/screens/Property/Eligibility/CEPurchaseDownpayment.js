/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable no-unused-vars */

/* eslint-disable no-case-declarations */

/* eslint-disable react-native/no-inline-styles */

/* eslint-disable react/jsx-no-bind */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import {
    BANKINGV2_MODULE,
    CE_TENURE,
    CE_PURCHASE_DOWNPAYMENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import {
    GREY,
    MEDIUM_GREY,
    DARK_GREY,
    YELLOW,
    DISABLED,
    BLACK,
    WHITE,
    DISABLED_TEXT,
    FADE_GREY,
} from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    CONTINUE,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    SAVE_NEXT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_PROPERTY_APPLYMORTGAGE_MORTGAGEDETAILS,
    FA_PROPERTY_CE_MORTGAGEDETAILS,
    FA_PROPERTY_CE_SAVEPROGRESS,
} from "@constants/strings";

import { useResetNavigation, fetchCCRISReport, getEncValue } from "../Common/PropertyController";
import SlidingNumPad from "../Common/SlidingNumPad";
import { saveEligibilityInput, removeCEEditRoutes } from "./CEController";

const MIN_AMOUNT = 10000; //For Non listed property
const note = "";
const PERCENTAGE = 0;

function CEPurchaseDownpayment({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [headerText, setHeaderText] = useState("");
    const [ctaText, setCtaText] = useState(CONTINUE);

    const [currentStep, setCurrentStep] = useState("");
    const [totalSteps, setTotalSteps] = useState("");
    const [stepperInfo, setStepperInfo] = useState("");

    const [rawPropertyPriceValue, setRawPropertyPriceValue] = useState(0);
    const [formattedPropertyPriceValue, setFormattedPropertyPriceValue] = useState("");
    const [keypadPropertyPriceValue, setKeypadPropertyPriceValue] = useState("");
    const [propertyPriceError, setPropertyPriceError] = useState("");
    const [showPropertyNotes, setShowPropertyNotes] = useState(true);

    const [rawDownpaymentValue, setRawDownpaymentValue] = useState("");
    const [formattedDownpaymentValue, setFormattedDownpaymentValue] = useState("");
    const [downPaymentPercent, setDownPaymentPercent] = useState("");
    const [keypadDownpaymentValue, setKeypadDownpaymentValue] = useState("");
    const [rawDownpaymentAmount, setRawDownpaymentAmount] = useState("");
    const [downpaymentError, setDownpaymentError] = useState("");

    const [maxFormattedAmount, setMaxFormattedAmount] = useState("");
    const [minFormattedAmount, setMinFormattedAmount] = useState("");
    const [minRawAmount, setMinRawAmount] = useState("");
    const [maxRawAmount, setMaxRawAmount] = useState("");
    const [loanFormattedValue, setLoanFormattedValue] = useState("RM 0.00");
    const [loanRawValue, setLoanRawValue] = useState(0);

    const [downpaymentOption, setDownpaymentOption] = useState("Percentage");
    const [textInputMaxLength, setTextInputMaxLength] = useState(12);
    const [isPropertyDownpaymentValue, setIsPropertyDownpaymentValue] = useState(false);

    const [showNumPad, setShowNumPad] = useState(false);
    const [numKeypadHeight, setNumKeypadHeight] = useState(0);
    const [keypadAmount, setKeypadAmount] = useState("");
    const [type, setType] = useState(0);
    const [isPropertyListed, setIsPropertyListed] = useState("");

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [cancelEditPopup, setCancelEditPopup] = useState(false);

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [editFlow, setEditFlow] = useState(false);
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setContinueDisabled(!isPropertyDownpaymentValue);
    }, [isPropertyDownpaymentValue]);

    useEffect(() => {
        const screenName =
            route.params?.flow === "applyMortgage"
                ? FA_PROPERTY_APPLYMORTGAGE_MORTGAGEDETAILS
                : FA_PROPERTY_CE_MORTGAGEDETAILS;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    }, [route.params?.flow]);

    function init() {
        console.log("[CEPurchaseDownpayment] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;
        const isPropertyListed = navParams?.isPropertyListed ?? "";
        const unitSelected = navParams?.unitType ?? {};

        const mdmData = navParams?.mdmData ?? {};
        const minPercentage = mdmData?.minPercentage ?? PERCENTAGE;
        const maxPercentage = mdmData?.maxPercentage ?? PERCENTAGE;

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

        const minAmt = unitSelected?.min_price ?? "";
        const minRawAmt = extractRawAmount(minAmt);

        const maxAmt = unitSelected?.max_price ?? "";
        const maxRawAmt = extractRawAmount(maxAmt);

        const maxLoanValue = maxRawAmt + (maxRawAmt * maxPercentage) / 100;
        const maxLoanFormattedValue = !maxLoanValue ? "" : numeral(maxLoanValue).format("0,0.00");

        const minLoanValue = minRawAmt - (minRawAmt * minPercentage) / 100;
        const minLoanFormattedValue = !minLoanValue ? "" : numeral(minLoanValue).format("0,0.00");

        setMinRawAmount(minLoanValue);
        setMaxRawAmount(maxLoanValue);
        setMinFormattedAmount(minLoanFormattedValue);
        setMaxFormattedAmount(maxLoanFormattedValue);
        setHeaderText(navParams?.headerText ?? "");
        setIsPropertyListed(isPropertyListed);

        if (isPropertyListed === "N") {
            const minLoanFormattedVal = numeral(MIN_AMOUNT).format("0,0.00");
            setMinRawAmount(MIN_AMOUNT);
            setMinFormattedAmount("RM " + minLoanFormattedVal);
        }

        // Pre-populate data for resume OR editflow
        if (resumeFlow || paramsEditFlow) populateSavedData();
        setLoading(false);
    }

    function onBackPress() {
        console.log("[CEPurchaseDownpayment] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEPurchaseDownpayment] >> [onCloseTap]");

        if (editFlow) {
            setCancelEditPopup(true);
        } else {
            setShowExitPopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            });
        }

        setShowNumPad(false);
    }

    function populateSavedData() {
        console.log("[CEPurchaseDownpayment] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const { propertyPrice, loanAmount, downPaymentPercent, downPaymentAmount } = getUIData(
            navParams,
            savedData,
            paramsEditFlow
        );
        let isPropertyPriceValid = false;

        // Property Price
        if (propertyPrice && !isNaN(propertyPrice)) {
            const keypadPropertyPriceValue = Math.floor(propertyPrice * 100).toString();
            const rawAmt = parseInt(keypadPropertyPriceValue, 10) / 100;
            const dispAmt = numeral(propertyPrice).format("0,0.00");

            setFormattedPropertyPriceValue(dispAmt);
            setRawPropertyPriceValue(rawAmt);
            setKeypadPropertyPriceValue(keypadPropertyPriceValue);
            isPropertyPriceValid = true;
        }

        // downPayment
        if (downPaymentPercent && !isNaN(downPaymentPercent)) {
            const keypadDownpaymentValue = Math.floor(downPaymentPercent * 100).toString();
            setNumericTextInputMaxLength("Percentage");
            setFormattedDownpaymentValue(numeral(downPaymentPercent).format("0,0.00"));
            setRawDownpaymentValue(parseFloat(downPaymentPercent));
            setDownPaymentPercent(downPaymentPercent);
            setDownpaymentOption("Percentage");
            setKeypadDownpaymentValue(keypadDownpaymentValue);
            setRawDownpaymentAmount(parseFloat(downPaymentAmount));
        } else if (downPaymentAmount && !isNaN(downPaymentAmount)) {
            const keypadDownpaymentValue = Math.floor(downPaymentAmount * 100).toString();
            setFormattedDownpaymentValue(numeral(downPaymentAmount).format("0,0.00"));
            setRawDownpaymentValue(parseFloat(downPaymentAmount));
            setDownpaymentOption("Amount");
            setKeypadDownpaymentValue(keypadDownpaymentValue);
            setRawDownpaymentAmount(parseFloat(downPaymentAmount));
        }

        // loanAmount
        if (loanAmount) {
            setLoanRawValue(loanAmount);
            setLoanFormattedValue("RM " + numeral(loanAmount).format("0,0.00"));
        }

        setIsPropertyDownpaymentValue(isPropertyPriceValid);

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            setHeaderText(EDIT_FIN_DETAILS);
            setCtaText(SAVE_NEXT);
        }
    }

    function getUIData(navParams, savedData, paramsEditFlow) {
        console.log("[CEPurchaseDownpayment] >> [getUIData]");

        if (paramsEditFlow) {
            return {
                propertyPrice: navParams?.propertyPrice ?? null,
                loanAmount: navParams?.loanAmount ?? null,
                downPaymentPercent: navParams?.downPaymentPercent ?? null,
                downPaymentAmount: navParams?.downPaymentAmount ?? null,
            };
        } else {
            return {
                propertyPrice: savedData?.propertyPriceRaw ?? null,
                loanAmount: savedData?.loanAmountRaw ?? null,
                downPaymentPercent: savedData?.downPaymentPercent ?? null,
                downPaymentAmount: savedData?.downPaymentAmountRaw ?? null,
            };
        }
    }

    function extractRawAmount(value = "") {
        return parseFloat(value.replace("RM", "").replace(/,/g, "").trim());
    }

    function onPressPropertyPriceField() {
        console.log("[CEPurchaseDownpayment] >> [onPressPropertyPriceField]");

        setNumericTextInputMaxLength("PROPERTY_PRICE");
        setShowNumPad(true);
        setType("PROPERTY_PRICE");
        setKeypadAmount(keypadPropertyPriceValue);
    }

    function onPressDownpaymentsField() {
        console.log("[CEPurchaseDownpayment] >> [onPressDownpaymentsField]");

        setNumericTextInputMaxLength(downpaymentOption);
        setShowNumPad(true);
        setType("DOWNPAYMENTS");
        setKeypadAmount(keypadDownpaymentValue);

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollToEnd({ animated: true });
        }, 500);
    }

    function getKeypadHeight(height) {
        setNumKeypadHeight(height);
    }

    function onNumKeypadChange(number) {
        console.log("[CEPurchaseDownpayment] >> [onNumKeypadChange]" + number);

        //if (number === "0" && !keypadAmount) return;
        if (number === "0000") return;

        const rawAmt = !number ? "" : parseInt(number, 10) / 100;
        const dispAmt = !number ? "" : numeral(rawAmt).format("0,0.00");

        setKeypadAmount(number);

        switch (type) {
            case "PROPERTY_PRICE":
                setFormattedPropertyPriceValue(dispAmt);
                setRawPropertyPriceValue(rawAmt);
                setKeypadPropertyPriceValue(number);
                break;
            case "DOWNPAYMENTS":
                const percent = downpaymentOption === "Percentage" ? rawAmt : "";
                setFormattedDownpaymentValue(dispAmt);
                setRawDownpaymentValue(rawAmt);
                setKeypadDownpaymentValue(number);
                setDownPaymentPercent(percent);
                break;
            default:
                break;
        }
    }

    function onNumKeypadDone() {
        console.log("[CEPurchaseDownpayment] >> [onNumKeypadDone]");

        setShowNumPad(false);

        const propertyPrice50Percent = (rawPropertyPriceValue * 50) / 100;

        const downPaymentRawAmount =
            downpaymentOption === "Percentage"
                ? (rawPropertyPriceValue * rawDownpaymentValue) / 100
                : rawDownpaymentValue;
        const downPaymentRawAmountFixed = parseFloat(downPaymentRawAmount).toFixed(2);

        //set loan value
        if (
            (rawPropertyPriceValue >= minRawAmount &&
                rawPropertyPriceValue <= maxRawAmount &&
                rawDownpaymentValue !== "" &&
                downPaymentRawAmount <= propertyPrice50Percent) ||
            (rawPropertyPriceValue >= minRawAmount &&
                isPropertyListed === "N" &&
                rawDownpaymentValue !== "" &&
                downPaymentRawAmount <= propertyPrice50Percent)
        ) {
            const loanRawVal = rawPropertyPriceValue - downPaymentRawAmount;
            const loanFormattedVal = !loanRawVal ? "" : numeral(loanRawVal).format("0,0.00");
            const loanRawValFixed = parseFloat(loanRawVal).toFixed(2);

            setLoanRawValue(loanRawValFixed);
            setLoanFormattedValue("RM " + loanFormattedVal);
            setShowPropertyNotes(true);
            setPropertyPriceError("");
            setDownpaymentError("");
            setRawDownpaymentAmount(downPaymentRawAmountFixed);
        } else {
            setLoanRawValue(0);
            setLoanFormattedValue("RM 0.00");
        }

        const hasValues = rawPropertyPriceValue === 0 || rawDownpaymentValue === "" ? false : true;
        setIsPropertyDownpaymentValue(hasValues);
    }

    function setNumericTextInputMaxLength(fieldType) {
        const maxLength = fieldType === "Percentage" ? 4 : 12;
        setTextInputMaxLength(maxLength);
    }

    const onPercentageRadioTap = () => {
        console.log("[CEPurchaseDownpayment] >> [onPercentageRadioTap]");

        resetDownpaymentValue("Percentage");
    };

    const onAmountRadioTap = () => {
        console.log("[CEPurchaseDownpayment] >> [onAmountRadioTap]");

        resetDownpaymentValue("Amount");
    };

    function resetDownpaymentValue(downpaymentType) {
        console.log("[CEPurchaseDownpayment] >> [resetDownpaymentValue]");
        const maxTextInputLength = downpaymentType === "Percentage" ? 4 : 12;

        setDownpaymentOption(downpaymentType);
        setFormattedDownpaymentValue("");
        setRawDownpaymentValue("");
        setRawDownpaymentAmount("");
        setDownpaymentError("");
        setKeypadDownpaymentValue("");
        setTextInputMaxLength(maxTextInputLength);
        setDownPaymentPercent("");
        setShowNumPad(false);
        setLoanRawValue(0);
        setLoanFormattedValue("RM 0.00");
        setContinueDisabled(true);
        setIsPropertyDownpaymentValue(false);
    }

    async function onExitPopupSave() {
        console.log("[CEPurchaseDownpayment] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PURCHASE_DOWNPAYMENT,
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
        console.log("[CEPurchaseDownpayment] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CE_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    }

    const closeExitPopup = () => {
        console.log("[CEPurchaseDownpayment] >> [closeExitPopup]");

        setShowExitPopup(false);
    };

    function onCancelEditPopupLeave() {
        console.log("[CEPurchaseDownpayment] >> [onCancelEditPopupLeave]");

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

    const closeCancelEditPopup = () => {
        console.log("[CEPurchaseDownpayment] >> [closeCancelEditPopup]");

        setCancelEditPopup(false);
    };

    function validateFormDetails() {
        const propertyPrice50Percent = (rawPropertyPriceValue * 50) / 100;
        let isPropertyPriceValid = false,
            isDownpaymentValid = false;

        // Min value check
        if (
            isPropertyListed !== "N" &&
            (rawPropertyPriceValue < minRawAmount || rawPropertyPriceValue > maxRawAmount)
        ) {
            setPropertyPriceError("Please input the appropriate amount");
            setShowPropertyNotes(false);
        } else if (isPropertyListed === "N" && rawPropertyPriceValue < minRawAmount) {
            setPropertyPriceError("Property price needs to be at least " + minFormattedAmount);
            setShowPropertyNotes(false);
        } else {
            setPropertyPriceError("");
            isPropertyPriceValid = true;
        }

        const downPaymentRawAmount =
            downpaymentOption === "Percentage"
                ? (rawPropertyPriceValue * rawDownpaymentValue) / 100
                : rawDownpaymentValue;
        if (downPaymentRawAmount > propertyPrice50Percent) {
            setDownpaymentError("Enter an amount within 50% of the property price");
        } else {
            setDownpaymentError("");
            isDownpaymentValid = true;
        }

        if (!isPropertyPriceValid || !isDownpaymentValid) {
            return false;
        }

        // Return true if all validation checks are passed
        return true;
    }

    async function onContinue() {
        console.log("[CEPurchaseDownpayment] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData();

        if (editFlow) {
            // Navigate to Tenure screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_TENURE,
                params: {
                    ...navParams,
                    ...formData,
                },
            });
        } else {
            setLoading(true);
            // Save Form Data in DB before moving to next screen
            const { syncId, stpId } = await saveEligibilityInput(
                {
                    screenName: CE_PURCHASE_DOWNPAYMENT,
                    formData,
                    navParams,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );

            //make requestCCrisReport api call
            const isFetchCCRISReportSuccess = await makeFetchCCRISReportCall();
            if (!isFetchCCRISReportSuccess) {
                setLoading(false);
                return;
            }

            // Navigate to Tenure screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_TENURE,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                    stpId,
                },
            });
            setLoading(false);
        }

        const screenName =
            route.params?.flow === "applyMortgage"
                ? FA_PROPERTY_APPLYMORTGAGE_MORTGAGEDETAILS
                : FA_PROPERTY_CE_MORTGAGEDETAILS;
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: screenName,
        });
    }

    /* Make requestCCrisReport api call when user taps on Continue/Skip button*/
    async function makeFetchCCRISReportCall() {
        const navParams = route?.params ?? {};
        const propertyId = navParams?.propertyDetails?.property_id ?? "";
        const encSyncId = await getEncValue(navParams?.syncId ?? "");

        // Request object
        const params = {
            propertyId,
            progressStatus: PROP_ELG_INPUT,
            syncId: encSyncId,
        };

        const { success, errorMessage } = await fetchCCRISReport(params, false);
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return false;
        }
        return true;
    }

    const getFormData = () => {
        console.log("[CEPurchaseDownpayment] >> [getFormData]");
        const propertyName = route?.params?.propertyName
            ? route?.params?.propertyName
            : route?.params?.savedData?.propertyName;

        return {
            propertyName,
            propertyPrice: rawPropertyPriceValue ? String(rawPropertyPriceValue) : "",
            downPaymentAmount: rawDownpaymentAmount ? String(rawDownpaymentAmount) : "",
            downPaymentPercent:
                downpaymentOption === "Percentage" ? String(downPaymentPercent) : "",
            loanAmount: loanRawValue ? String(loanRawValue) : "",
            currentStep,
            totalSteps,
            origLoanAmount: loanRawValue ? String(loanRawValue) : "",
        };
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <>
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
                        <ScrollView
                            style={styles.wrapper}
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Subtext */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Fill in the details below"
                                textAlign="left"
                            />

                            {/* Property price */}
                            <View style={styles.fieldView}>
                                <TouchableOpacity
                                    onPress={onPressPropertyPriceField}
                                    activeOpacity={1}
                                >
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        style={styles.label}
                                        text="Property price"
                                        textAlign="left"
                                    />
                                    <TextInput
                                        prefix="RM"
                                        placeholder="0.00"
                                        value={formattedPropertyPriceValue}
                                        editable={false}
                                        isValidate
                                        isValid={!propertyPriceError}
                                        errorMessage={propertyPriceError}
                                    />
                                </TouchableOpacity>

                                {showPropertyNotes && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={16}
                                        textAlign="left"
                                        text={note}
                                        color={DARK_GREY}
                                        style={styles.note}
                                    />
                                )}
                            </View>

                            {/* Downpayment */}
                            <View style={styles.fieldView}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={20}
                                    style={styles.label}
                                    text="Downpayment"
                                    textAlign="left"
                                />

                                <View style={styles.radioBtnOuterView}>
                                    {/* Percentage */}
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={onPercentageRadioTap}
                                        style={styles.radioBtnView}
                                    >
                                        {downpaymentOption === "Percentage" ? (
                                            <RadioChecked
                                                label="Percentage"
                                                paramLabelCls={styles.radioBtnLabel}
                                                checkType="color"
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label="Percentage"
                                                paramLabelCls={styles.radioBtnLabel}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    {/* Amount */}

                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={onAmountRadioTap}
                                        style={styles.radioBtnViewAmount}
                                    >
                                        {downpaymentOption === "Amount" ? (
                                            <RadioChecked
                                                label="Amount"
                                                paramLabelCls={styles.radioBtnLabel}
                                                checkType="color"
                                            />
                                        ) : (
                                            <RadioUnchecked
                                                label="Amount"
                                                paramLabelCls={styles.radioBtnLabel}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.amountFieldContainer}>
                                    <TouchableOpacity
                                        onPress={onPressDownpaymentsField}
                                        activeOpacity={1}
                                    >
                                        <TextInput
                                            prefix={
                                                downpaymentOption !== "Percentage" ? "RM" : null
                                            }
                                            suffix={downpaymentOption === "Percentage" ? "%" : null}
                                            placeholder={
                                                downpaymentOption === "Percentage" ? "0.0" : "0.00"
                                            }
                                            value={formattedDownpaymentValue}
                                            editable={false}
                                            isValidate
                                            isValid={!downpaymentError}
                                            errorMessage={downpaymentError}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

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
                                    text={loanFormattedValue}
                                    style={
                                        loanRawValue > 0 ? styles.loanValueDark : styles.loanValue
                                    }
                                />
                            </View>
                        </ScrollView>

                        {/* Vertical Spacer */}
                        <View
                            style={{
                                height: showNumPad ? numKeypadHeight : 0,
                            }}
                        />

                        {!showNumPad && (
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
                                            text={ctaText}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </FixedActionContainer>
                        )}
                    </>
                </ScreenLayout>

                {/* Sliding Numerical Keypad */}
                <SlidingNumPad
                    showNumPad={showNumPad}
                    value={keypadAmount}
                    onChange={onNumKeypadChange}
                    onDone={onNumKeypadDone}
                    getHeight={getKeypadHeight}
                    maxLength={textInputMaxLength}
                />

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
        </ScreenContainer>
    );
}

CEPurchaseDownpayment.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
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

    fieldView: {
        marginTop: 24,
    },

    label: {
        paddingTop: 8,
    },

    loanValue: {
        color: GREY,
        marginTop: 15,
    },

    loanValueDark: {
        color: BLACK,
        marginTop: 15,
    },

    note: {
        marginTop: 8,
    },

    radioBtnLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioBtnOuterView: {
        flexDirection: "row",
        marginBottom: 24,
        marginTop: 17,
    },

    radioBtnView: {
        justifyContent: "center",
    },

    radioBtnViewAmount: {
        justifyContent: "center",
        marginLeft: 25,
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});

export default CEPurchaseDownpayment;

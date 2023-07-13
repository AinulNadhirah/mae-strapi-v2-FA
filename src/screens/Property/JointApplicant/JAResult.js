/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-no-bind */

/* eslint-disable radix */
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { StyleSheet, Dimensions, View, ScrollView, Platform, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import RNekyc from "react-native-ekyc";

import { APPLICATION_DETAILS, BANKINGV2_MODULE, JA_RESULT } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { FAJAProperty } from "@services/analytics/analyticsJAProperty";

import { MEDIUM_GREY, WHITE, SEPARATOR, YELLOW, DARK_GREY } from "@constants/colors";
import { DT_ELG, DT_NOTELG, DT_RECOM } from "@constants/data";
import {
    REQ_ASSITANCE_POPUP_TITLE,
    REQ_ASSITANCE_POPUP_DESC,
    ADDITIONAL_FINANCING_INFO,
    FA_PROPERTY_JACEJA_FAIL,
    FA_PROPERTY_JACEJA_PASS,
    FA_PROPERTY_JACEJA_PASS_HLOAN,
    FA_PROPERTY_JACEJA_PASS_LLOAN,
    DONE,
    OKAY,
    MONTHLY_INSTALMENT_INFO,
    INC_DOWNPAYNT_SHORTLOAN_PERIOD,
    TOBE_ELIGIBLE_INC_DOWNPAYMENT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    CONGRATULATION_JA_TEXT,
    DESIRED_HOME_FIANCING_TEXT,
    DOWNPAYMENT,
    EFFECTIVE_PROFIT_RATE,
    ELIGIBLE_HOME_FINANCING_TEXT,
    FINANCING_AMOUNT_RANGE,
    HIGHER_HOME_FINANCING_TEXT,
    MONTHLY_INSTALLMENT,
    OUTCOME_JA_TEXT,
    PROPERTY_FIANANCING_AMOUNT,
    PROPERTY_PRICE,
    VIEW_OFFER_CONDITIONS,
} from "../../../constants/strings";
import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import DetailField from "../Common/DetailField";
import { getEncValue } from "../Common/PropertyController";
import OfferDisclaimerPopup from "../Eligibility/OfferDisclaimerPopup";

const screenHeight = Dimensions.get("window").height;
// const screenWidth = Dimensions.get("window").width;
// const btnWidth = (screenWidth * 42) / 100;
const imageHeight = Math.max((screenHeight * 40) / 100, 350);

const imgAnimFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

// Static status values to be used locally
const STATUS_PASS = "PASS";
const STATUS_SOFT_FAIL = "SOFT_FAIL";
const STATUS_HARD_FAIL = "HARD_FAIL";

// Initial state object
const initialState = {
    // UI Labels
    headerText: "Congratulations, you’re eligible for this financing!",
    subText1: "",
    subText2: null, //"Here's our offer:",
    tenureLabel: "Financing period",
    otherOptionText: "Not satisfied with our offer?",
    propertyName: null,
    isEditFlow: false,

    // Tenure Overlay
    showTenureOverlay: false,
    tenureMin: 5,
    tenureMax: 35,

    // Downpayment Overlay
    showDownpaymentOverlay: false,
    downpaymentOverlayKeypad: 0,
    downpaymentOverlayDisplay: "",
    downpaymentOverlayIsValid: true,
    downpaymentOverlayErrorMsg: "",

    // Loan Details
    loanAmount: "500",
    loanAmountFormatted: "",
    interestRate: "",
    interestRateFormatted: "",
    spreadRate: "",
    spreadRateFormatted: null,
    baseRate: "",
    baseRateFormatted: null,
    tenure: "",
    tenureFormatted: "",
    tenureEditable: false,
    monthlyInstalment: "",
    monthlyInstalmentFormatted: "",
    propertyPrice: "",
    propertyPriceFormatted: "",
    downpayment: "",
    downpaymentFormatted: "",
    downpaymentEditable: false,
    downpaymentInfoNote: null,
    recommendedDownpayment: "",
    publicSectorNameFinance: false,

    // Others
    showExitPopup: false,
    showOfferDiscPopup: false,
    showApplySuccessPopup: false,
    hideSaveProgressPopup: false,
    status: STATUS_PASS, // PASS | SOFT_FAIL | HARD_FAIL

    // Request Assistance
    showSalesRepReqPopup: false,
    isAssistanceRequested: false,
    showReqAssistSuccessPopup: false,
    popupTitle: REQ_ASSITANCE_POPUP_TITLE,
    popupDesc: REQ_ASSITANCE_POPUP_DESC,

    // Result response data
    dataType: null,
    disableScreenshot: false,

    loading: true,
    isJointApplicantAdded: true,

    isMainApplicant: false,

    jointApplicantInfo: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_LABELS":
            return {
                ...state,
                headerText: payload?.headerText ?? state.headerText,
                subText1: payload?.subText1 ?? state.subText1,
                subText2: payload?.subText2 ?? state.subText2,
                otherOptionText: payload?.otherOptionText ?? state.otherOptionText,
            };
        case "SET_SUBTEXT2":
            //to update after re-calculation
            return {
                ...state,
                subText2: payload,
            };
        case "SHOW_TENURE_OVERLAY":
            return {
                ...state,
                showTenureOverlay: payload,
            };
        case "SHOW_DOWNPAYMENT_OVERLAY":
            return {
                ...state,
                showDownpaymentOverlay: payload,
                downpaymentOverlayIsValid: true,
                downpaymentOverlayErrorMsg: "",
            };
        case "SET_DOWNPAY_OVERLAY_VALUE":
            return {
                ...state,
                downpaymentOverlayKeypad: payload?.keypad,
                downpaymentOverlayDisplay: payload?.display,
            };
        case "RESET_DOWNPAY_OVERLAY_VALUE":
            return {
                ...state,
                downpaymentOverlayKeypad: 0,
                downpaymentOverlayDisplay: "",
            };
        case "SET_DOWNPAY_TENURE_EDITABLE":
            return {
                ...state,
                downpaymentEditable: payload?.downpaymentEditable,
                tenureEditable: payload?.tenureEditable,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        case "SHOW_OFFER_DISC_POPUP":
            return {
                ...state,
                showOfferDiscPopup: payload,
            };
        case "SHOW_APPLY_SUCCESS_POPUP":
            return {
                ...state,
                showApplySuccessPopup: payload,
            };
        case "SHOW_REQ_ASSIST_SUCCESS_POPUP":
            return {
                ...state,
                showReqAssistSuccessPopup: payload,
            };
        case "HIDE_SAVE_PROGRESS_POPUP":
            return {
                ...state,
                hideSaveProgressPopup: payload,
            };
        case "SET_DOWNPAYMENT":
        case "SET_TENURE":
        case "SET_LOAN_DETAILS":
            return {
                ...state,
                ...payload,
            };
        case "SET_STATUS":
            return {
                ...state,
                status: payload,
            };
        case "SET_IS_EDIT_FLOW":
            return {
                ...state,
                isEditFlow: payload,
            };
        case "DISABLE_SCREENSHOT":
            return {
                ...state,
                disableScreenshot: payload,
            };
        case "SET_POPUP_TITLE_DESC":
            return {
                ...state,
                popupTitle: payload?.popupTitle,
                popupDesc: payload?.popupDesc,
            };
        case "SET_JOINT_APPLICANT_ADDED":
            return {
                ...state,
                isJointApplicantAdded: payload,
            };
        case "SET_MAIN_APPLICANT":
            return {
                ...state,
                isMainApplicant: payload,
            };
        case "SET_JOINT_APPLICANT_INFO":
            return {
                ...state,
                jointApplicantInfo: payload,
            };
        case "SET_ELIGIBILITY_STATUS":
            return {
                ...state,
                eligibilityStatus: payload,
            };
        default:
            return { ...state };
    }
}

function JAResult({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { status, disableScreenshot } = state;
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(() => {
        console.log("[JAResult] >> [init]");

        const navParams = route?.params ?? {};
        // Call method to populate result screen data
        populateData(navParams);
    }, [populateData, route.params]);

    /* disabling screenshot option for Android */
    useFocusEffect(
        useCallback(() => {
            // Screenshot disabling - Android Specific
            if (Platform.OS === "android" && disableScreenshot) {
                try {
                    RNekyc.screenshotDisable(true);
                } catch (error) {
                    console.log("[JAResult][screenshotDisable] >> Exception: ", error);
                }
                return () => {
                    try {
                        RNekyc.screenshotDisable(false);
                    } catch (error) {
                        console.log("[JAResult][screenshotDisable] >> Exception: ", error);
                    }
                };
            }
        }, [disableScreenshot])
    );

    const populateData = useCallback((navParams) => {
        const propertyName = navParams?.propertyName;
        const customerName = (() => {
            const custSeparateName = navParams?.customerName?.toLowerCase().split(" ");
            if (custSeparateName) {
                custSeparateName.forEach((item, index) => {
                    custSeparateName[index] = item.charAt(0).toUpperCase() + item.slice(1);
                });
                return custSeparateName.join(" ");
            }
            return "";
        })();
        const eligibilityLoanAmount = navParams?.propertyFinancingAmt;
        // const tenureMaxValue = navParams?.tenureMaxValue;
        const eligibilityResult = navParams?.eligibilityResult ?? {};
        const dataType = eligibilityResult?.dataType;
        const tempEligibilityStatus = navParams.eligibilityStatus;
        const tempStatus = getResultStatus(dataType);
        const loanAmount = eligibilityResult?.aipAmount;
        const monthlyInstalment = eligibilityResult?.installmentAmount;
        const savedPublicSectorNameFinance = eligibilityResult?.publicSectorNameFinance;
        const publicSectorNameFinance =
            savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y";
        const { propertyPrice, maxDownPayment } = getPropertyPrice(navParams);
        const { interestRate, spreadRate, baseRate } = getInterestRate(eligibilityResult);
        const { resultTenure, tenureEditable, maxTenure, minTenure } = getTenure(
            navParams,
            eligibilityResult,
            tempStatus
        );
        const {
            downpaymentEditable,
            recommendedDownpayment,
            resultDownpayment,
            downpaymentInfoNote,
        } = getDownpayment(
            tempStatus,
            navParams,
            eligibilityResult,
            tenureEditable,
            maxDownPayment
        );

        // Update screen status
        dispatch({
            actionType: "SET_STATUS",
            payload: tempStatus,
        });

        dispatch({
            actionType: "SET_ELIGIBILITY_STATUS",
            payload: tempEligibilityStatus,
        });

        // GA
        const screenName = (() => {
            switch (tempStatus) {
                case STATUS_PASS:
                    //  return "Property_CheckEligibility_Pass";
                    return FA_PROPERTY_JACEJA_PASS;
                case STATUS_SOFT_FAIL:
                    return route?.params?.eligibilityResult?.aipAmount > eligibilityLoanAmount
                        ? FA_PROPERTY_JACEJA_PASS_HLOAN
                        : FA_PROPERTY_JACEJA_PASS_LLOAN;
                case STATUS_HARD_FAIL:
                    return FA_PROPERTY_JACEJA_FAIL;
                //return "Property_CheckEligibility_Fail";
                default:
                    return null;
            }
        })();

        // Set Header labels
        const headerText = customerName ? `Dear ${customerName},` : "Dear,";
        if (tempStatus === STATUS_HARD_FAIL) {
            // Set header and subtext values
            dispatch({
                actionType: "SET_HEADER_LABELS",
                payload: {
                    headerText,
                    subText1: FINANCING_AMOUNT_RANGE,
                    subText2: OUTCOME_JA_TEXT,
                    otherOptionText: null,
                },
            });
        } else if (
            (tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS) &&
            eligibilityLoanAmount === route?.params?.eligibilityResult?.aipAmount
        ) {
            // Set header and subtext values
            dispatch({
                actionType: "SET_HEADER_LABELS",
                payload: {
                    headerText: CONGRATULATION_JA_TEXT,
                    subText1: ELIGIBLE_HOME_FINANCING_TEXT,
                    subText2: null,
                    otherOptionText: null,
                },
            });

            dispatch({
                actionType: "SET_SUBTEXT2",
                payload: null,
            });
        } else if (
            (tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS) &&
            route?.params?.eligibilityResult?.aipAmount > eligibilityLoanAmount
        ) {
            dispatch({
                actionType: "SET_HEADER_LABELS",
                payload: {
                    headerText: CONGRATULATION_JA_TEXT,
                    subText1: HIGHER_HOME_FINANCING_TEXT,
                    subText2: null,
                    otherOptionText: null,
                },
            });

            dispatch({
                actionType: "SET_SUBTEXT2",
                payload: null,
            });
        } else if (
            (tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS) &&
            route?.params?.eligibilityResult?.aipAmount < eligibilityLoanAmount
        ) {
            dispatch({
                actionType: "SET_HEADER_LABELS",
                payload: {
                    headerText: CONGRATULATION_JA_TEXT,
                    subText1: DESIRED_HOME_FIANCING_TEXT,
                    subText2: null,
                    otherOptionText: null,
                },
            });

            dispatch({
                actionType: "SET_SUBTEXT2",
                payload: null,
            });
        }

        if (navParams?.isJointApplicantAdded) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT_ADDED",
                payload: true,
            });
        }

        //joint info
        const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

        // Set Joint info
        if (jointApplicantInfo) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT_INFO",
                payload: "ddd",
            });
        }

        if (navParams?.isMainApplicant) {
            dispatch({
                actionType: "SET_MAIN_APPLICANT",
                payload: true,
            });
        }

        const baseRateLabel = navParams?.baseRateLabel ?? "Base rate";

        // Set Loan Details
        dispatch({
            actionType: "SET_LOAN_DETAILS",
            payload: {
                // Others
                dataType,

                // Property
                propertyName,
                propertyPrice,
                propertyPriceFormatted: !isNaN(propertyPrice)
                    ? `RM ${numeral(propertyPrice).format("0,0.00")}`
                    : null,

                // Loan Amount
                loanAmount,
                loanAmountFormatted: !isNaN(loanAmount)
                    ? `RM ${numeral(loanAmount).format("0,0.00")}`
                    : null,

                // Interest Rate
                interestRate,
                interestRateFormatted: !isNaN(interestRate) ? `${interestRate}% p.a` : "",
                baseRate,
                baseRateFormatted: !isNaN(baseRate) ? `${baseRateLabel}: ${baseRate}%` : "",
                spreadRate,
                spreadRateFormatted: !isNaN(spreadRate) ? `Spread: ${spreadRate}%` : "",

                // Tenure
                tenure: resultTenure,
                tenureFormatted: !isNaN(resultTenure) ? `${resultTenure} years` : "",
                tenureEditable,
                tenureLabel: tenureEditable ? "Recommended financing period" : state.tenureLabel,
                tenureMin: isNaN(minTenure) ? 5 : parseInt(minTenure),
                tenureMax: isNaN(maxTenure) ? 35 : parseInt(maxTenure),

                // Monthly Instalment
                monthlyInstalment,
                monthlyInstalmentFormatted: !isNaN(monthlyInstalment)
                    ? `RM ${numeral(monthlyInstalment).format("0,0.00")}`
                    : null,

                // Downpayment
                downpayment: resultDownpayment,
                downpaymentFormatted: !isNaN(resultDownpayment)
                    ? `RM ${numeral(resultDownpayment).format("0,0.00")}`
                    : null,
                downpaymentEditable,
                downpaymentInfoNote,
                recommendedDownpayment,
                publicSectorNameFinance,
            },
        });

        //disable screenshot
        dispatch({
            actionType: "DISABLE_SCREENSHOT",
            payload: Platform.OS === "android" && tempStatus !== STATUS_HARD_FAIL,
        });

        const isEditFlow = navParams?.isEditFlow ?? false;
        dispatch({
            actionType: "SET_IS_EDIT_FLOW",
            payload: isEditFlow,
        });

        if (tempStatus !== STATUS_HARD_FAIL) {
            FAJAProperty.onScreenSuccess(screenName, navParams?.stpApplicationId ?? "");
        } else {
            if (screenName === FA_PROPERTY_JACEJA_FAIL) {
                FAJAProperty.onScreenSuccess(screenName, navParams?.stpApplicationId ?? "");
            }
        }

        FAJAProperty.onScreen(screenName);

        setLoading(false);
    }, []);

    function getResultStatus(dataType) {
        switch (dataType) {
            case DT_ELG:
                return STATUS_PASS;
            case DT_RECOM:
                return STATUS_SOFT_FAIL;
            case DT_NOTELG:
                return STATUS_HARD_FAIL;
            default:
                return null;
        }
    }

    function getTenure(navParams, eligibilityResult, tempStatus) {
        try {
            const minTenure = eligibilityResult?.minTenure;
            const maxTenure = eligibilityResult?.maxTenure;
            const inputTenure = navParams?.tenure;
            const recommendedTenure = eligibilityResult?.tenure;
            const resultTenure = recommendedTenure;
            const tenureEditable =
                tempStatus === STATUS_SOFT_FAIL && parseInt(resultTenure) !== parseInt(inputTenure);

            return {
                resultTenure,
                tenureEditable,
                maxTenure,
                minTenure,
            };
        } catch (err) {
            console.log("[JAResult][getTenure] >> Exception: ", err);

            // Note: This is only for an exception case. Refer to logic in try block for Tenure calculation.
            return {
                resultTenure:
                    tempStatus === STATUS_SOFT_FAIL
                        ? eligibilityResult?.maxTenure
                        : navParams?.tenure,
                tenureEditable: tempStatus === STATUS_SOFT_FAIL,
                maxTenure: eligibilityResult?.maxTenure,
                minTenure: eligibilityResult?.minTenure,
            };
        }
    }

    function getInterestRate(eligibilityResult) {
        console.log("[JAResult] >> [getInterestRate]");

        const interestRate = eligibilityResult?.interestRate
            ? parseFloat(eligibilityResult.interestRate).toFixed(2)
            : "";
        const spreadRate = eligibilityResult?.spreadRate
            ? parseFloat(eligibilityResult.spreadRate).toFixed(2)
            : "";
        const baseRate = eligibilityResult?.baseRate
            ? parseFloat(eligibilityResult.baseRate).toFixed(2)
            : "";

        return { interestRate, spreadRate, baseRate };
    }

    function getDownpayment(
        tempStatus,
        navParams,
        eligibilityResult,
        tenureEditable,
        maxDownPayment
    ) {
        console.log("[JAResult] >> [getDownpayment]");
        try {
            const inputDowmpayment = parseFloat(
                eligibilityResult?.downPayment ?? eligibilityResult?.downpayment
            );
            const recommendedDownpayment =
                eligibilityResult?.recommendedDownPayment &&
                parseFloat(eligibilityResult.recommendedDownPayment) < parseFloat(maxDownPayment)
                    ? eligibilityResult.recommendedDownPayment
                    : maxDownPayment;
            const downpaymentEditable =
                tempStatus === STATUS_SOFT_FAIL &&
                parseFloat(recommendedDownpayment) < parseFloat(maxDownPayment);
            const resultDownpayment =
                tempStatus === STATUS_SOFT_FAIL ? recommendedDownpayment : inputDowmpayment;
            const downpaymentInfoNote1 = INC_DOWNPAYNT_SHORTLOAN_PERIOD;
            const downpaymentInfoNote2 = TOBE_ELIGIBLE_INC_DOWNPAYMENT;
            let downpaymentInfoNote =
                tenureEditable && downpaymentEditable ? downpaymentInfoNote1 : downpaymentInfoNote2;

            downpaymentInfoNote = tempStatus === STATUS_PASS ? null : downpaymentInfoNote;

            return {
                downpaymentEditable,
                recommendedDownpayment,
                resultDownpayment,
                downpaymentInfoNote,
            };
        } catch (err) {
            console.log("[JAResult][getDownpayment] >> Exception: ", err);

            // Note: This is only for an exception case. Refer to logic in try block for Downpayment calculation.
            return {
                downpaymentEditable: false,
                recommendedDownpayment: eligibilityResult?.recommendedDownPayment,
                resultDownpayment: navParams?.downPaymentAmount,
                downpaymentInfoNote: null,
            };
        }
    }

    function getPropertyPrice(navParams) {
        console.log("[JAResult] >> [getPropertyPrice]");

        const propertyPrice = navParams?.propertyPrice;
        const halfPropertyPrice = !isNaN(parseFloat(propertyPrice))
            ? (propertyPrice / 2).toFixed(2)
            : "";

        return { propertyPrice, maxDownPayment: halfPropertyPrice };
    }

    const closeOfferDiscPopup = () => {
        console.log("[JAResult] >> [closeOfferDiscPopup]");

        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: false,
        });
    };

    const onViewOfferDisclaimer = () => {
        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: true,
        });
    };

    async function onViewApplicationPress() {
        const encSyncId = await getEncValue(route?.params?.syncId);
        const encStpId = await getEncValue(route?.params?.stpApplicationId);

        const params = {
            syncId: encSyncId,
            stpId: encStpId,
        };

        const resultData = await fetchGetApplicants(params.syncId, true);

        if (!resultData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: resultData?.errorMessage });
            return;
        }

        const { mainApplicantDetails, jointApplicantDetails, currentUser } = resultData;

        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        // Navigate to details page
        navigation.replace(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
            params: {
                savedData,
                propertyDetails,
                syncId: route?.params?.syncId,
                cancelReason,
                mainApplicantDetails,
                jointApplicantDetails,
                currentUser,
                from: JA_RESULT,
                reload: true,
            },
        });
    }
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
                        {/* Top Image Component */}
                        <View style={Style.imageContainer(imageHeight)}>
                            <Animatable.Image
                                animation={imgAnimFadeInUp}
                                delay={500}
                                duration={500}
                                source={
                                    status === STATUS_PASS || status === STATUS_SOFT_FAIL
                                        ? Assets.eligibilitySuccess
                                        : Assets.eligibilityJHardFailL
                                }
                                style={Style.imageCls}
                                resizeMode="cover"
                                useNativeDriver
                            />
                        </View>
                        <View style={Style.horizontalMarginBig}>
                            {/* Header Text */}

                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={state.headerText}
                                textAlign="left"
                            />

                            {/* Sub Text 1 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={Style.subText1}
                                text={state.subText1}
                            />

                            {/* View offer disclaimer */}
                            {status !== STATUS_HARD_FAIL && (
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={VIEW_OFFER_CONDITIONS}
                                    fontWeight="bold"
                                    style={Style.textUnderline}
                                    onPress={onViewOfferDisclaimer}
                                />
                            )}

                            {/* Sub Text 2 */}
                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={state.subText2 ? Style.subText2 : Style.subText2Hide}
                                text={state.subText2 ? state.subText2 : ""}
                            />
                        </View>
                        {(status === STATUS_PASS || status === STATUS_SOFT_FAIL) && (
                            <>
                                {/* Loan Details Container */}
                                <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                                    <View
                                        style={[
                                            Platform.OS === "ios" ? {} : Style.shadow,
                                            Style.loanDetailsContainer,
                                            Style.horizontalMargin,
                                        ]}
                                    >
                                        {/* Property Name */}
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={state.propertyName}
                                            style={Style.propertyName}
                                        />

                                        {/* Financing Amount Label */}
                                        <Typo
                                            lineHeight={19}
                                            style={Style.loanAmountLabel}
                                            text={PROPERTY_FIANANCING_AMOUNT}
                                        />

                                        {/* Financing Amount value */}
                                        <Typo
                                            fontSize={24}
                                            lineHeight={29}
                                            fontWeight="bold"
                                            style={Style.loanAmount}
                                            text={state.loanAmountFormatted}
                                        />

                                        <View style={Style.infoNoteContainer}>
                                            <Image
                                                source={Assets.noteInfo}
                                                style={Style.infoIcon}
                                                resizeMode="contain"
                                            />

                                            <Typo
                                                fontSize={12}
                                                textAlign="left"
                                                lineHeight={15}
                                                text={ADDITIONAL_FINANCING_INFO}
                                                color={DARK_GREY}
                                                style={Style.infoText}
                                            />
                                        </View>

                                        {/* profit Rate */}
                                        <DetailField
                                            label={EFFECTIVE_PROFIT_RATE}
                                            value={state.interestRateFormatted}
                                            valueSubText1={state.baseRateFormatted}
                                            valueSubText2={state.spreadRateFormatted}
                                        />

                                        {/* Tenure */}
                                        <DetailField
                                            label={state.tenureLabel}
                                            value={state.tenureFormatted}
                                        />

                                        {/* Monthly Instalment */}
                                        <DetailField
                                            label={MONTHLY_INSTALLMENT}
                                            value={state.monthlyInstalmentFormatted}
                                            infoNote={MONTHLY_INSTALMENT_INFO}
                                        />

                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />

                                        {/* Property Price */}
                                        <DetailField
                                            label={PROPERTY_PRICE}
                                            value={state.propertyPriceFormatted}
                                        />

                                        {/* Downpayment */}
                                        <DetailField
                                            label={DOWNPAYMENT}
                                            value={state.downpaymentFormatted}
                                        />
                                    </View>
                                </View>

                                {/* Button Container */}
                                <View style={Style.horizontalMargin}>
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo fontWeight="600" lineHeight={18} text={DONE} />
                                        }
                                        onPress={onViewApplicationPress}
                                    />
                                </View>
                            </>
                        )}
                    </ScrollView>
                    {/* Button Container */}
                    {status === STATUS_HARD_FAIL && (
                        <View style={Style.horizontalMargin}>
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo fontWeight="600" lineHeight={18} text={OKAY} />
                                }
                                onPress={onViewApplicationPress}
                            />
                        </View>
                    )}
                </ScreenLayout>
            </ScreenContainer>

            {/* Offer Disclaimer popup */}
            <OfferDisclaimerPopup
                visible={state.showOfferDiscPopup}
                onClose={closeOfferDiscPopup}
            />
        </>
    );
}

JAResult.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },

    horizontalMargin: {
        marginHorizontal: 24,
        marginTop: 15,
    },

    horizontalMarginBig: {
        marginHorizontal: 36,
    },

    imageCls: {
        height: "100%",
        width: "100%",
    },

    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),

    infoIcon: {
        height: 16,
        width: 16,
    },

    infoNoteContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 5,
        marginHorizontal: 20,
        marginTop: 15,
    },

    infoText: {
        marginHorizontal: 12,
    },

    loanAmount: {
        marginTop: 10,
    },

    loanAmountLabel: {
        marginTop: 15,
    },

    loanDetailsContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginVertical: 25,
        paddingVertical: 25,
    },

    noteLabel2: {
        marginBottom: 24,
        marginTop: 10,
        paddingHorizontal: 24,
    },

    noteLabelBottom: {
        marginBottom: 24,
    },

    optionHeader: {
        marginTop: 10,
    },
    propertyName: {
        marginHorizontal: 16,
    },

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    subText1: {
        marginTop: 10,
    },

    subText2: {
        marginTop: 20,
    },

    subText2Hide: {
        height: 0,
        width: 0,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
});

export default JAResult;

/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable radix */
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useReducer, useEffect, useCallback, useRef } from "react";
import {
    StyleSheet,
    Dimensions,
    View,
    ScrollView,
    Platform,
    Image,
    TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNSafetyNet from "react-native-safety-net";

import {
    CE_PROPERTY_LIST,
    BANKINGV2_MODULE,
    LA_ELIGIBILITY_CONFIRM,
    CONNECT_SALES_REP,
    CE_RESULT,
    CE_ADD_JA_DETAILS,
    CE_ADD_JA_NOTIFY_RESULT,
    APPLICATION_DETAILS,
    CE_PF_NUMBER,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    saveResultData,
    invokeL3,
    pushNotificationToInviteJA,
    removeJointApplicant,
    getGroupChat,
} from "@services";
import { logEvent } from "@services/analytics";
import { FAProperty } from "@services/analytics/analyticsProperty";

import {
    MEDIUM_GREY,
    WHITE,
    GREY,
    DARK_GREY,
    SEPARATOR,
    YELLOW,
    BLACK,
    ROYAL_BLUE,
    IRISBLUE,
} from "@constants/colors";
import { PROP_ELG_RESULT, DT_ELG, DT_NOTELG, DT_RECOM, PROP_LA_INPUT } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    PROPERTY_MDM_ERR,
    APPLYSUCCPOPUP_TITLE,
    APPLYSUCCPOPUP_DESC,
    REQ_ASSITANCE_POPUP_TITLE,
    REQ_ASSITANCE_POPUP_DESC,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC,
    ADDITIONAL_FINANCING_INFO,
    MONTHLY_INSTALMENT_INFO,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TRANSACTION_ID,
    REQUEST_FOR_ASSISTANCE_DESC,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    EXIT_POPUP_TITLE,
    FA_COUPON,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA,
    FA_PROPERTY_JA_NOT_ELIGIBLE,
    FA_PROPERTY_JACEJA_ACCEPTED_INVITATION,
    FA_PROPERTY_JACEJA_REJECTED_INVITATION,
    CANCEL,
    REMOVE,
    REMOVE_JOINT_TITLE,
    REMOVE_JOINT_DESCRIPTION,
    GOT_IT,
    OKAY,
    INFO_NOTE,
    PUBLIC_SECTOR_FINANC_TEXT,
    SALES_REP_TEXT,
    SALES_REP_DESC,
    ADD_JOINT_APPLICANT_TEXT,
    ADD_NEW_JOINT_APPLICANT,
    OTHER_PROPERTIES,
    ADD_JOINT_APPLICANT,
    YOUR_JOINT_APPLICANT,
    VIEW_OTHER_PROPERTIES,
    REQ_ASSISTANCE_TEXT,
    VIEW_OFFER_CONDITIONS,
    BETTER_OFFER_TEXT,
    APPLY_LOAN_TEXT,
    APPLY_SUCCESS_POPUP_SUBTITLE,
    FA_VIEW_APPLICATION,
    FA_PROPERTY_JA_BAU_APPLICATION,
    FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
    FA_REMOVE_JOINT_APPLICANT,
    TENURE,
    PROCEED_WITH_APPLICATION,
    STILL_APPLY_FOR_LOAN_FINC,
    OUT_OF_AFFORDABILITY_RANGE,
    NOT_SATISFIED,
    JA_REJECT_INVIATATION,
    DESIRED_FIN_OUTOF_AFFORD_RANGE_INC_PERIOD,
    DESIRED_FIN_OUTOF_AFFORD_RANGE,
    WHAT_WE_CAN_OFFER,
    REGRET_TO_INFORM_OUTOF_AFFORD_RANGE_REAPPY,
    REGRET_TO_INFORM_OUTOF_AFFORD_RANGE,
    ADDED_JA_NOTELIGIBLE_RFA_REAPPLY,
    ADDED_JA_NOTELIGIBLE,
    RFA_SALE_REP_PROVIED_ADDITIONAL_DETAILS,
    INC_DOWNPAYNT_SHORTLOAN_PERIOD,
    TOBE_ELIGIBLE_INC_DOWNPAYMENT,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    fetchApplicationDetails,
    fetchGetApplicants,
    prequalCheckAPI,
} from "../Application/LAController";
import ActionTile from "../Common/ActionTile";
import DetailField from "../Common/DetailField";
import {
    useResetNavigation,
    getMasterData,
    getMDMData,
    fetchCCRISReport,
    getEncValue,
    fetchJACCRISReport,
} from "../Common/PropertyController";
import {
    isAgeEligible,
    saveEligibilityInput,
    checkEligibility,
    checkJAEligibility,
} from "./CEController";
import DownpaymentOverlay from "./DownpaymentOverlay";
import OfferDisclaimerPopup from "./OfferDisclaimerPopup";
import TenureOverlay from "./TenureOverlay";

const screenHeight = Dimensions.get("window").height;
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
const ELIGIBILTY_STATUS_AMBER = "AMBER";
const ELIGIBILTY_STATUS_ELIGIBLE = "ELIGIBLE";
const ELIGIBILTY_STATUS_GREEN = "GREEN";

// Initial state object
const initialState = {
    // UI Labels
    headerText: "Congratulations, you’re eligible for this financing!",
    subText1: "",
    subText2: null, //"Here's our offer:",
    tenureLabel: "Financing period",
    otherOptionText: NOT_SATISFIED,
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
    loanAmount: "",
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
    isJointApplicantAdded: false,
    isJARemoved: false,

    isMainApplicant: false,

    jointApplicantInfo: null,

    eligibilityStatus: "ELIGIBILTY_STATUS_AMBER",
    isMainEligDataType: null,
    isJAButtonEnabled: false,
    isRFASwitchEnabled: false,
    isApplyButtonFloating: true,
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
        case "SET_SUBTEXT1":
            //to update after re-calculation
            return {
                ...state,
                subText1: payload,
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
        case "SET_APPLY_BUTTON_FLOATING":
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
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        case "SET_JOINT_APPLICANT_ADDED":
            return {
                ...state,
                isJointApplicantAdded: payload,
            };
        case "SET_JOINT_APPLICANT_REMOVED":
            return {
                ...state,
                isJARemoved: payload,
            };
        case "SET_MAIN_APPLICANT_ELIGBILITY_ADDED":
            return {
                ...state,
                isMainEligDataType: payload,
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
        case "SHOW_REMOVE_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                removeJointApplicant: payload?.removeJointApplicant,
            };
        case "SET_JA_BUTTON_ENABLED":
            return {
                ...state,
                isJAButtonEnabled: payload,
            };
        case "SET_RFA_BUTTON_ENABLED":
            return {
                ...state,
                isRFASwitchEnabled: payload,
            };
        default:
            return { ...state };
    }
}

function CEResult({ route, navigation }) {
    const { getModel } = useModelController();
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const insets = useSafeAreaInsets();

    const { status, loading, disableScreenshot, isEditFlow, eligibilityStatus } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, [init]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.isAssistanceRequested) {
                init();
            }
        }, [init, route.params?.isAssistanceRequested])
    );

    useEffect(() => {
        // In case of edit eligibility from LA confirm - Save Data in DB
        async function saveResult() {
            if (isEditFlow) {
                await saveEligibilityResult();
            }
        }
        saveResult();
    }, [isEditFlow, saveEligibilityResult]);

    const init = useCallback(() => {
        console.log("[CEResult] >> [init]");

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
                    RNSafetyNet.screenshotDisable(true);
                } catch (error) {
                    console.log("[CEResult][screenshotDisable] >> Exception: ", error);
                }
                return () => {
                    try {
                        RNSafetyNet.screenshotDisable(false);
                    } catch (error) {
                        console.log("[CEResult][screenshotDisable] >> Exception: ", error);
                    }
                };
            }
        }, [disableScreenshot])
    );

    function onCloseTap() {
        console.log("[CEResult] >> [onCloseTap]");

        const navParams = route?.params ?? {};
        const isEditFlow = navParams?.isEditFlow ?? false;
        if (isEditFlow || state.hideSaveProgressPopup || state.isJointApplicantAdded) {
            // If its from edit eligibility flow dont show popup
            // Navigate back to application screen
            resetToApplication();
        } else {
            if (state.isAssistanceRequested) {
                onExitPopupSave();
            } else {
                dispatch({
                    actionType: "SHOW_EXIT_POPUP",
                    payload: true,
                });
            }

            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
            });
        }
    }

    const populateData = useCallback(
        (navParams) => {
            console.log("[CEResult] >> [populateData]");
            const subTextLabel1 = DESIRED_FIN_OUTOF_AFFORD_RANGE_INC_PERIOD;
            const subTextLabel2 = DESIRED_FIN_OUTOF_AFFORD_RANGE;
            const subTextLabel3 = WHAT_WE_CAN_OFFER;
            const subTextLabel4 = REGRET_TO_INFORM_OUTOF_AFFORD_RANGE_REAPPY;
            const subTextLabel5 = REGRET_TO_INFORM_OUTOF_AFFORD_RANGE;
            const subTextLabel6 = ADDED_JA_NOTELIGIBLE_RFA_REAPPLY;
            const subTextLabel7 = ADDED_JA_NOTELIGIBLE;
            const subTextLabel8 = RFA_SALE_REP_PROVIED_ADDITIONAL_DETAILS;

            const salesRepRequest = navParams?.salesRepRequest === "Y" ? true : false;
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
            // const tenureMaxValue = navParams?.tenureMaxValue;
            const mainEligDataType = navParams?.isMainEligDataType ?? navParams?.dataType;
            const isMainEligDataType = getResultStatus(mainEligDataType);
            const eligibilityResult = navParams?.eligibilityResult ?? {};
            const dataType = eligibilityResult?.dataType ?? null;
            const tempStatus = getResultStatus(
                navParams?.jaDataType ? navParams?.jaDataType : dataType
            );
            const loanAmount =
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult?.aipAmount
                    : eligibilityResult?.aipAmount;
            const monthlyInstalment =
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult?.installmentAmount
                    : eligibilityResult?.installmentAmount;
            const tempEligibilityStatus = navParams.eligibilityStatus;
            const isJointApplicantAdded = navParams?.isJointApplicantAdded;
            const isJARemoved = navParams?.isJARemoved;
            const savedPublicSectorNameFinance = eligibilityResult?.publicSectorNameFinance;
            const publicSectorNameFinance =
                savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y";

            const baseRateLabel = navParams?.baseRateLabel ?? "Standardised base rate";

            const { propertyPrice, maxDownPayment } = getPropertyPrice(navParams);
            const { interestRate, spreadRate, baseRate } = getInterestRate(
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult
            );
            const { resultTenure, tenureEditable, maxTenure, minTenure } = getTenure(
                navParams,
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult,
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                    navParams?.isJointApplicantAdded
                    ? STATUS_SOFT_FAIL
                    : tempStatus
            );
            const {
                downpaymentEditable,
                recommendedDownpayment,
                resultDownpayment,
                downpaymentInfoNote,
            } = getDownpayment(
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                    navParams?.isJointApplicantAdded
                    ? STATUS_SOFT_FAIL
                    : tempStatus,
                navParams,
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult,
                tenureEditable,
                maxDownPayment
            );
            const requestAssistanceButtonStatus = navParams?.isRFAButtonEnabled;
            if (navParams?.isRFAButtonEnabled) {
                dispatch({
                    actionType: "SET_RFA_BUTTON_ENABLED",
                    payload: requestAssistanceButtonStatus,
                });
            }
            // Update screen status
            dispatch({
                actionType: "SET_STATUS",
                payload: tempStatus,
            });

            dispatch({
                actionType: "SET_ELIGIBILITY_STATUS",
                payload: tempEligibilityStatus,
            });
            // dispatch({
            //     actionType: "SET_ELIGIBILITY_STATUS",
            //     payload: "ELIGIBLE",
            // });

            // GA
            const screenName = (() => {
                switch (tempStatus) {
                    case STATUS_PASS: {
                        if (navParams?.currentScreenName === "MA_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA;
                        } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                        } else {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA;
                        }
                    }
                    case STATUS_SOFT_FAIL: {
                        if (navParams?.currentScreenName === "MA_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
                        } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                        } else {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
                        }
                    }
                    case STATUS_HARD_FAIL: {
                        if (navParams?.currentScreenName === "MA_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA;
                        } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE;
                        } else {
                            return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA;
                        }
                    }
                    default:
                        return null;
                }
            })();

            // Set Header labels
            const headerText = customerName ? `Dear ${customerName},` : "Dear,";

            if (tempStatus === STATUS_SOFT_FAIL && !isJointApplicantAdded) {
                const subText1 =
                    tenureEditable && downpaymentEditable ? subTextLabel1 : subTextLabel2;

                // Set header and subtext values
                if (isJARemoved) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: "You have removed your joint applicant",
                            subText1: null,
                            subText2: null,
                            otherOptionText: "Your updated offer:",
                        },
                    });
                    dispatch({
                        actionType: "SET_SUBTEXT2",
                        payload: null,
                    });
                    dispatch({
                        actionType: "SET_SUBTEXT1",
                        payload: null,
                    });
                } else {
                    if (!navParams?.declinedFromJa) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1,
                                subText2: subTextLabel3,
                                otherOptionText: "",
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `${navParams?.JaHeaderMsg} has declined to be your joint applicant.`,
                                subText1: "",
                                subText2: null,
                                otherOptionText: "Your existing offer:",
                            },
                        });
                    }
                }
            } else if (tempStatus === STATUS_HARD_FAIL && !isJointApplicantAdded) {
                if (isJARemoved) {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: OUT_OF_AFFORDABILITY_RANGE,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: OUT_OF_AFFORDABILITY_RANGE,
                                subText2: subTextLabel8,
                                otherOptionText: null,
                            },
                        });
                    }
                } else {
                    if (!navParams?.declinedFromJa) {
                        // Set header and subtext values
                        if (!requestAssistanceButtonStatus) {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText,
                                    subText1: subTextLabel5,
                                    subText2: STILL_APPLY_FOR_LOAN_FINC,
                                    otherOptionText: NOT_SATISFIED,
                                },
                            });
                        } else {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText,
                                    subText1: subTextLabel4,
                                    subText2: null,
                                    otherOptionText: NOT_SATISFIED,
                                },
                            });
                        }
                    } else {
                        if (!requestAssistanceButtonStatus) {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText: `Dear ${navParams?.customerName},`,
                                    subText1: JA_REJECT_INVIATATION,
                                    subText2: null,
                                    otherOptionText: null,
                                },
                            });
                        } else {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText: `Dear ${navParams?.customerName},`,
                                    subText1: JA_REJECT_INVIATATION,
                                    subText2: subTextLabel8,
                                    otherOptionText: null,
                                },
                            });
                        }
                    }
                }
            } else if (tempStatus === STATUS_PASS && !isJointApplicantAdded) {
                // status pass
                // Set header and subtext values
                if (!navParams?.declinedFromJa || isJARemoved) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: "Congratulations, you're eligible for this financing!",
                            subText1: "",
                            subText2: null,
                            //otherOptionText: null,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} has declined to be your joint applicant.`,
                            subText1: "",
                            subText2: null,
                            otherOptionText: "Your existing offer:",
                        },
                    });
                }

                dispatch({
                    actionType: "SET_SUBTEXT2",
                    payload: null,
                });
            } else if (tempStatus === STATUS_PASS && isJointApplicantAdded) {
                // status pass
                // Set header and subtext values
                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: "Congratulations!",
                            subText1: `Together with your joint applicant,`,
                            subText2: "Here's what we can offer:",
                            otherOptionText: "View offer conditions",
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} has accepted your invitation to be a joint applicant`,
                            subText1: "Together, you're eligible for this home financing amount.",
                            subText2: null,
                        },
                    });
                }
            } else if (tempStatus === STATUS_SOFT_FAIL && isJointApplicantAdded) {
                // status pass
                // Set header and subtext values

                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText,
                            subText1:
                                "Adding a joint applicant has helped you increase your home financing amount but we’re still unable to match your desired amount.",
                            subText2: "Here's what we can offer:",
                            otherOptionText: null,
                        },
                    });
                } else if (navParams?.jaEligResult && navParams?.subModule === "JA_ELIG_PASS") {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} has accepted your invitation to be a joint applicant`,
                            subText1: `${
                                loanAmount > navParams?.jaLoanAmount
                                    ? "Your joint applicant has helped you qualify for a higher home financing but it is still lower than your expected amount."
                                    : loanAmount < navParams?.jaLoanAmount
                                    ? "Your joint applicant has helped you qualify for a higher home financing."
                                    : `Together, you're eligible for this home financing amount.`
                            }`,
                            subText2: null,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `Your joint applicant is not eligible for this home financing offer`,
                            subText1: `you can nominate another joint applicant or consider including any additional income details.`,
                            subText2: "Your existing offer:",
                            otherOptionText: "View offer conditions",
                        },
                    });
                }
            }
            // else if (tempStatus === STATUS_HARD_FAIL && isJointApplicantAdded) {
            //     // status pass
            //     // Set header and subtext values

            //     if (navParams?.jaEligResult && navParams?.subModule === "JA_ELIG_FAIL"){
            //         dispatch({
            //             actionType: "SET_HEADER_LABELS",
            //             payload: {
            //                 headerText: `Dear ${navParams?.customerName}`,
            //                 subText1: `The individual you've nominated as a joint applicant is not eligible to apply for this home financing alongside you.`,
            //                 subText2: `Request for assistance from our sales representative and provide some additional details to reapply for your home financing.`,
            //             },
            //         });
            //     }
            // }
            else if (
                isMainEligDataType === STATUS_SOFT_FAIL &&
                tempStatus === STATUS_HARD_FAIL &&
                isJointApplicantAdded &&
                tempEligibilityStatus === ELIGIBILTY_STATUS_AMBER
            ) {
                // Set header and subtext values
                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText:
                                "Your joint applicant does not qualify for the home financing",
                            subText1: "Consider naming another joint applicant.",
                            subText2: "Your existing offer:",
                            otherOptionText: "View offer conditions",
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `Your joint applicant is not eligible for this home financing offer`,
                            subText1:
                                "You can nominate another joint applicant or consider including any additional income details.",
                            subText2: null,
                            otherOptionText: "Your existing offer:",
                        },
                    });
                }
            } else if (
                isMainEligDataType === STATUS_HARD_FAIL &&
                tempStatus === STATUS_HARD_FAIL &&
                isJointApplicantAdded &&
                tempEligibilityStatus === ELIGIBILTY_STATUS_AMBER
            ) {
                if (!navParams?.jaEligResult) {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: subTextLabel7,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: subTextLabel6,
                                subText2: null,
                                otherOptionText: null,
                            },
                        });
                    }
                } else {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `Dear ${navParams?.customerName},`,
                                subText1: subTextLabel7,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `Dear ${navParams?.customerName},`,
                                subText1: subTextLabel7,
                                subText2: subTextLabel8,
                                otherOptionText: null,
                            },
                        });
                    }
                }
            }
            if (navParams?.isJointApplicantAdded) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_ADDED",
                    payload: true,
                });
            } else {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_ADDED",
                    payload: false,
                });
            }

            if (navParams?.isJARemoved) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_REMOVED",
                    payload: true,
                });
            }

            if (navParams?.isMainEligDataType ?? navParams?.dataType) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT_ELIGBILITY_ADDED",
                    payload: isMainEligDataType,
                });
            }

            if (navParams?.isMainApplicant) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT",
                    payload: true,
                });
            }

            if (navParams?.isJAButtonEnabled) {
                dispatch({
                    actionType: "SET_JA_BUTTON_ENABLED",
                    payload: true,
                });
            }

            //joint info
            const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

            // Set Joint info
            if (jointApplicantInfo) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_INFO",
                    payload: jointApplicantInfo,
                });
            }
            const financeAmount = navParams?.jaLoanAmount ?? loanAmount;
            // Set Loan Details
            dispatch({
                actionType: "SET_LOAN_DETAILS",
                payload: {
                    // Others
                    dataType,
                    isAssistanceRequested: route.params?.isAssistanceRequested || salesRepRequest,

                    // Property
                    propertyName,
                    propertyPrice,
                    propertyPriceFormatted: !isNaN(propertyPrice)
                        ? `RM ${numeral(propertyPrice).format("0,0.00")}`
                        : null,

                    // Loan Amount
                    loanAmount,
                    loanAmountFormatted: !isNaN(financeAmount)
                        ? `RM ${numeral(financeAmount).format("0,0.00")}`
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
                    tenureLabel: tenureEditable
                        ? "Recommended financing period"
                        : state.tenureLabel,
                    tenureMin:
                        minTenure !== null ? (isNaN(minTenure) ? 5 : parseInt(minTenure)) : 5,
                    tenureMax:
                        maxTenure !== null ? (isNaN(maxTenure) ? 35 : parseInt(maxTenure)) : 35,

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

            // Analytics
            if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
                FAProperty.onScreen(navParams?.stpApplicationId, FA_PROPERTY_JA_NOT_ELIGIBLE);
            } else if (route?.params?.subModule !== "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
                FAProperty.onScreen("", FA_PROPERTY_JACEJA_ACCEPTED_INVITATION);
            } else if (route?.params?.subModule === "JA_APPL_REJECT") {
                FAProperty.onScreen("", FA_PROPERTY_JACEJA_REJECTED_INVITATION);
            } else {
                FAProperty.onScreen(navParams?.stpApplicationId, screenName);
            }

            if (
                screenName === FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA ||
                screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA
            ) {
                FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
            }

            if (
                (!route?.params?.jaEligResult &&
                    screenName === FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA) ||
                screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA
            ) {
                FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
            } else if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
                FAProperty.onScreenFailed(navParams?.stpApplicationId, FA_PROPERTY_JA_NOT_ELIGIBLE);
            } else if (route?.params?.subModule !== "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
                FAProperty.onScreenSuccess(
                    navParams?.stpApplicationId,
                    FA_PROPERTY_JA_NOT_ELIGIBLE
                );
            }

            if (screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE) {
                FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
            }

            setLoading(false);
        },
        [route.params?.isAssistanceRequested, state.tenureLabel]
    );
    function getResultStatus(dataType) {
        console.log("[CEResult] >> [getResultStatus]");

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
        console.log("[CEResult] >> [getTenure]");

        // 12/08/2021: Commented old code to accomodate new changes from WOLOC response
        // const age = navParams?.age ?? 0;
        // const maxTenure = Math.min(70 - age, 35);
        // const inputTenure = navParams?.tenure;
        // const recommendedTenure =
        //     eligibilityResult?.tenure > maxTenure ? maxTenure : eligibilityResult?.tenure;
        // const resultTenure = tempStatus === STATUS_SOFT_FAIL ? recommendedTenure : inputTenure;
        // const tenureEditable = tempStatus === STATUS_SOFT_FAIL && resultTenure < maxTenure;
        try {
            const minTenure =
                eligibilityResult?.minTenure && eligibilityResult?.minTenure < 5
                    ? 5
                    : eligibilityResult?.minTenure;
            const maxTenure =
                eligibilityResult?.maxTenure && eligibilityResult?.maxTenure > 35
                    ? 35
                    : eligibilityResult?.maxTenure;
            const inputTenure = navParams?.tenure;
            const recommendedTenure = eligibilityResult?.tenure;
            const resultTenure =
                tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS
                    ? recommendedTenure
                    : inputTenure;
            const tenureEditable = tempStatus === STATUS_SOFT_FAIL || tempStatus === STATUS_PASS;

            return {
                resultTenure,
                tenureEditable:
                    recommendedTenure === maxTenure && maxTenure === minTenure
                        ? false
                        : tenureEditable,
                maxTenure,
                minTenure: minTenure === maxTenure ? 5 : minTenure,
            };
        } catch (err) {
            console.log("[CEResult][getTenure] >> Exception: ", err);

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
        console.log("[CEResult] >> [getInterestRate]");

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

    const onCloseRemoveJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });
    };
    const onOpenRemoveJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: true,
            },
        });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_REMOVE_JOINT_APPLICANT,
        });
    };

    async function removeJointApplicantOnClick() {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });
        setLoading(true);
        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId;
        const propertyDetails = navParams?.propertyDetails ?? {};
        const propertyId = propertyDetails?.property_id;
        const stpId = navParams?.savedData?.stpApplicationId;
        const operatorId = navParams?.agentId;
        const encSyncId = await getEncValue(syncId);
        const httpResp = await removeJointApplicant({ syncId: encSyncId }, false);
        if (httpResp?.data?.result?.statusCode === "0000") {
            if (operatorId != null) {
                const params = {
                    propertyId,
                    stpId,
                    operatorId,
                    syncId: encSyncId,
                    groupChatIndicator: "REMOVE_MEMBER",
                };
                await getGroupChat(params, false).catch((error) => {
                    console.log(
                        "[ApplicationDetails][removeJointApplicantOnClick] >> Exception: ",
                        error
                    );
                });
            }

            callEligibilityAPIForRemove(encSyncId);
        } else {
            const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
            setLoading(false);
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        const screenName =
            status === STATUS_PASS
                ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
                : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;

        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_NOT_ELIGIBLE,
                [FA_ACTION_NAME]: REMOVE_JOINT_TITLE,
            });
        } else if (route?.params?.subModule !== "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_ACCEPTED_INVITATION,
                [FA_ACTION_NAME]: REMOVE_JOINT_TITLE,
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: REMOVE_JOINT_TITLE,
            });
        }
    }

    async function callEligibilityAPIForRemove(encSyncId) {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        // setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        navParams.grossIncome = navParams?.grossIncomeMA ?? navParams?.grossIncome;
        // Retrieve form data
        const formData = getFormData(); //CE_COMMITMENTS screen

        //save
        await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );

        const mdmData = await getMDMData(false);
        navParams.loanAmount = navParams?.origLoanAmount;
        navParams.tenure = navParams?.origTenure;
        navParams.downPaymentAmount =
            navParams?.origDownPaymentAmount ?? navParams?.downPaymentAmount;

        // console.log(navParams, "navPARemove");

        const params = {
            ...navParams,
            applicationStpRefNo: navParams?.stpApplicationId ?? "",
        };

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus } =
            await checkEligibility(
                {
                    ...params,
                    mdmData,
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
        const { mainApplicantDetails, jointApplicantDetails } = await fetchApplicants(encSyncId);
        const isJointApplicantAdded = false;
        const isMainApplicant = true;
        const isJARemoved = true;
        navParams.eligibilityResult = eligibilityResult;
        navParams.stpApplicationId = stpId;
        navParams.eligibilityStatus = overallStatus;
        navParams.jointApplicantDetails = jointApplicantDetails;
        navParams.mainApplicantDetails = mainApplicantDetails;
        navParams.isJointApplicantAdded = isJointApplicantAdded;
        navParams.isMainApplicant = isMainApplicant;
        navParams.isJARemoved = isJARemoved;
        navParams.isMainEligDataType = null;
        navParams.dataType = null;
        navParams.jaDataType = null;
        navParams.currentScreenName = "REMOVED_VIEW";

        //update UI
        populateData(navParams);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    async function fetchApplicants(encSyncId) {
        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        return {
            mainApplicantDetails,
            jointApplicantDetails,
            currentUser,
        };
    }

    function getDownpayment(
        tempStatus,
        navParams,
        eligibilityResult,
        tenureEditable,
        maxDownPayment
    ) {
        console.log("[CEResult] >> [getDownpayment]");
        try {
            const inputDowmpayment = parseFloat(navParams?.downPaymentAmount);
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
            const downpaymentInfoNote3 = INFO_NOTE;
            let downpaymentInfoNote =
                tenureEditable && downpaymentEditable ? downpaymentInfoNote1 : downpaymentInfoNote2;

            downpaymentInfoNote = tempStatus === STATUS_PASS ? null : downpaymentInfoNote;
            downpaymentInfoNote =
                navParams?.eligibilityResult?.dataType === "NotEligible" &&
                navParams?.isJointApplicantAdded
                    ? downpaymentInfoNote3
                    : downpaymentInfoNote;
            return {
                downpaymentEditable,
                recommendedDownpayment,
                resultDownpayment,
                downpaymentInfoNote,
            };
        } catch (err) {
            console.log("[CEResult][getDownpayment] >> Exception: ", err);

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
        console.log("[CEResult] >> [getPropertyPrice]");

        const propertyPrice = navParams?.propertyPrice;
        const halfPropertyPrice = !isNaN(parseFloat(propertyPrice))
            ? (propertyPrice / 2).toFixed(2)
            : "";

        return { propertyPrice, maxDownPayment: halfPropertyPrice };
    }

    const onTenurePress = () => {
        console.log("[CEResult] >> [onTenurePress]");
        const currentScreenName = route?.params?.currentScreenName;

        dispatch({
            actionType: "SHOW_TENURE_OVERLAY",
            payload: true,
        });

        const screenName =
            currentScreenName === "MA_VIEW"
                ? FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA
                : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;

        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onTenurePress(FA_PROPERTY_JA_NOT_ELIGIBLE, "Period");
        } else {
            FAProperty.onTenurePress(screenName, TENURE);
        }
    };

    const onDownpaymentPress = () => {
        console.log("[CEResult] >> [onDownpaymentPress]");

        // Set Overlay Keypad data
        dispatch({
            actionType: "SET_DOWNPAY_OVERLAY_VALUE",
            payload: {
                keypad: Number((state.downpayment * 100).toFixed(2)).toString(),
                display: numeral(state.downpayment).format("0,0.00"),
            },
        });

        // Show overlay
        dispatch({
            actionType: "SHOW_DOWNPAYMENT_OVERLAY",
            payload: true,
        });
        const currentScreenName = route?.params?.currentScreenName;

        const screenName =
            currentScreenName === "MA_VIEW"
                ? FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA
                : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onDownPaymentPress(FA_PROPERTY_JA_NOT_ELIGIBLE, "Downpayment");
        } else {
            FAProperty.onDownPaymentPress(screenName, "Downpayment");
        }
    };

    // apply loan only for soft fail status and Amber
    async function onMainApplyLoan() {
        const navParams = route?.params ?? {};
        const syncId = String(navParams?.syncId);
        const encSyncId = await getEncValue(syncId);
        // const encStpId = await getEncValue(navParams?.stpId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const responseData = await fetchApplicationDetails(params, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }
        if (
            responseData?.savedData?.isAccepted &&
            responseData?.savedData?.jaStatus === "ELIGCOMP"
        ) {
            onApplyLoan();
            return;
        }
        const currentScreenName = route.params?.currentScreenName;
        let screenName;
        if (currentScreenName === "MA_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
        } else if (currentScreenName === "REMOVED_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE
                    : FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
        } else {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
        }
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: APPLY_LOAN_TEXT,
            [FA_TRANSACTION_ID]: route.params?.stpApplicationId ?? "",
        });

        // Call api to send notification - MAE will send notification to Joint applicant
        const httpResp = await pushNotificationToInviteJA(params).catch((error) => {
            console.log("[CEResult][pushNotificationToInviteJA] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

        if (statusCode !== "0000") {
            showErrorToast({ message: statusDesc });
            return;
        }

        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        navParams.jointApplicantDetails = jointApplicantDetails;
        navParams.mainApplicantDetails = mainApplicantDetails;
        navParams.currentUser = currentUser;

        // Navigate to Joint Applicant notify screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_NOTIFY_RESULT,
            params: { ...navParams },
        });
    }

    async function onApplyLoan() {
        console.log("[CEResult] >> [onApplyLoan]");
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            const httpResp = await invokeL3(false).catch((error) => {
                console.log("[CEResult][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                setLoading(false);
                return;
            }
        }
        // apply loan only for pass and soft fail status
        const currentScreenName = route.params?.currentScreenName;
        let screenName;
        if (currentScreenName === "MA_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
        } else if (currentScreenName === "REMOVED_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE
                    : FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
        } else {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
        }

        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onApplyNowBtnPress(FA_PROPERTY_JA_NOT_ELIGIBLE, APPLY_LOAN_TEXT);
        } else if (route?.params?.subModule !== "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onApplyNowBtnPress(FA_PROPERTY_JACEJA_ACCEPTED_INVITATION, APPLY_LOAN_TEXT);
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]:
                    currentScreenName === "REMOVED_VIEW"
                        ? PROCEED_WITH_APPLICATION
                        : APPLY_LOAN_TEXT,
                [FA_TRANSACTION_ID]: route.params?.stpApplicationId ?? "",
            });
        }

        // Show apply success popup
        if (status === STATUS_PASS && state.loanAmount > 1000000) {
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_BAU_APPLICATION,
            });
            return;
        }

        setLoading(true);

        // Save Result in DB before proceeding
        await saveEligibilityResult();

        const encSyncId = await getEncValue(route?.params?.syncId);
        const isJointApplicantAdded = state.isJointApplicantAdded;

        // Call prequal API
        const prequalResponseObj = await prequalCheckAPI(encSyncId, isJointApplicantAdded);
        const eligibilityStatus = prequalResponseObj.status;
        const onboardingInd = prequalResponseObj.onboardingInd;
        //if onboardingInd is Y then start New AIP flow BAU
        if (eligibilityStatus === "AMBER" && onboardingInd !== "Y") {
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });

            // Reset downpayment, tenure to non editable
            dispatch({
                actionType: "SET_DOWNPAY_TENURE_EDITABLE",
                payload: {
                    downpaymentEditable: false,
                    tenureEditable: false,
                },
            });
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_BAU_APPLICATION,
            });
            //if its BAU - dont show Save Progress popup on close press(onCloseTap)
            dispatch({
                actionType: "HIDE_SAVE_PROGRESS_POPUP",
                payload: true,
            });
            setLoading(false);
            return;
        }

        // L3 call to invoke password page

        // Prefetch required data
        const masterData = await getMasterData(false);
        const mdmData = await getMDMData(false);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }

        const navParams = route?.params ?? {};
        const propertyId = navParams?.propertyDetails?.property_id ?? "";

        // Request object for CCRIS report
        const params = {
            propertyId,
            progressStatus: PROP_LA_INPUT,
            syncId: encSyncId,
        };
        const { success, errorMessage } = await fetchCCRISReport(params, false);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        if (responseData?.jointApplicantDetails !== null) {
            const { success, errorMessage } = await fetchJACCRISReport(params, false);
            if (!success) {
                setLoading(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const resultDataParams = getResultScreenParams();

        //update downPaymentAmount with recommendedDownPayment
        if (route.params?.eligibilityResult?.recommendedDownPayment) {
            route.params.downPaymentAmount = route.params.eligibilityResult.recommendedDownPayment;
        }

        // Navigate to Eligibility confirm screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_ELIGIBILITY_CONFIRM,
            params: {
                ...route.params,
                ...resultDataParams,
                masterData,
                mdmData,
                age,
                eligibilityStatus,
            },
        });

        //Added to avoid the flickering of the screen navigation
        setTimeout(() => {
            setLoading(false);
        }, 10);
    }

    const onPressViewOtherProperties = () => {
        console.log("[CEResult] >> [onPressViewOtherProperties]");

        // only soft fail and fail will reached here

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PROPERTY_LIST,
            params: {
                latitude: route?.params?.latitude ?? "",
                longitude: route?.params?.longitude ?? "",
                recommended_property_amount: state.propertyPrice,
            },
        });
        const navParams = route?.params ?? {};
        const screenName = (() => {
            switch (status) {
                case STATUS_PASS: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA;
                    }
                }
                case STATUS_SOFT_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
                    }
                }
                case STATUS_HARD_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA;
                    }
                }
                default:
                    return null;
            }
        })();
        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onApplyNowBtnPress(FA_PROPERTY_JA_NOT_ELIGIBLE, VIEW_OTHER_PROPERTIES);
        } else if (route?.params?.subModule === "JA_APPL_REJECT") {
            FAProperty.onApplyNowBtnPress(
                FA_PROPERTY_JACEJA_REJECTED_INVITATION,
                VIEW_OTHER_PROPERTIES
            );
        } else {
            FAProperty.onApplyNowBtnPress(screenName, VIEW_OTHER_PROPERTIES);
        }
    };

    const onPressRequestForAssistance = () => {
        console.log("[CEResult] >> [onPressRequestForAssistance]");
        try {
            // If request already raised successfully, then show success popup
            if (state.isAssistanceRequested) {
                dispatch({
                    actionType: "SET_POPUP_TITLE_DESC",
                    payload: {
                        popupTitle: REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE,
                        popupDesc: REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC,
                    },
                });
                dispatch({
                    actionType: "SHOW_REQ_ASSIST_SUCCESS_POPUP",
                    payload: true,
                });
                return;
            }

            const propertyDetails = route?.params?.propertyDetails ?? "";

            // navigate to Request Assistance screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CONNECT_SALES_REP,
                params: {
                    propertyDetails,
                    syncId: route?.params?.syncId,
                    ...route.params,
                    from: CE_RESULT,
                },
            });
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            console.log("[CEResult] >> [onPressRequestForAssistance]", error);
        }
        const navParams = route?.params ?? {};
        const screenName = (() => {
            switch (status) {
                case STATUS_PASS: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA;
                    }
                }
                case STATUS_SOFT_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
                    }
                }
                case STATUS_HARD_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA;
                    }
                }
                default:
                    return null;
            }
        })();
        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onPressRequestForAssistance(
                FA_PROPERTY_JA_NOT_ELIGIBLE,
                REQ_ASSISTANCE_TEXT,
                ""
            );
        } else if (route?.params?.subModule === "JA_APPL_REJECT") {
            FAProperty.onPressRequestForAssistance(
                FA_PROPERTY_JACEJA_REJECTED_INVITATION,
                REQ_ASSISTANCE_TEXT,
                ""
            );
        } else {
            FAProperty.onPressRequestForAssistance(
                screenName,
                REQ_ASSISTANCE_TEXT,
                route.params?.stpApplicationId
            );
        }
    };

    const onTenureOverlayDone = (value) => {
        console.log("[CEResult] >> [onTenureOverlayDone]");

        onTenureOverlayClose();

        // Update Tenure value
        dispatch({
            actionType: "SET_TENURE",
            payload: {
                tenure: value,
                tenureFormatted: `${value} years`,
            },
        });

        const navParams = route?.params ?? {};
        navParams.loanTenure = String(value);
        navParams.origTenure = String(value);
        navParams.tenure = String(value);
        if (state.isJointApplicantAdded) {
            callJointEligibilityAPIForRecalculation();
        } else {
            callEligibilityAPIForRecalculation();
        }
    };

    const onTenureOverlayClose = () => {
        console.log("[CEResult] >> [onTenureOverlayClose]");

        dispatch({
            actionType: "SHOW_TENURE_OVERLAY",
            payload: false,
        });
    };

    const onDownpaymentOverlayDone = (value) => {
        console.log("[CEResult] >> [onDownpaymentOverlayDone]");

        const newValue = !value ? "" : parseFloat((value / 100).toFixed(2));
        const propertyPrice = parseFloat(state.propertyPrice);
        const recommendedDownpayment = parseFloat(state.recommendedDownpayment);
        const halfPropertyPrice = parseFloat((propertyPrice / 2).toFixed(2));
        const isValid = newValue >= recommendedDownpayment && newValue <= halfPropertyPrice;
        const recommendedDownpaymentFormatted = numeral(recommendedDownpayment).format("0,0.00");

        if (isValid) {
            dispatch({
                actionType: "SET_DOWNPAYMENT",
                payload: {
                    downpayment: newValue,
                    downpaymentFormatted: !isNaN(newValue)
                        ? `RM ${numeral(newValue).format("0,0.00")}`
                        : null,
                    downpaymentOverlayIsValid: true,
                    downpaymentOverlayErrorMsg: "",
                },
            });

            onDownpaymentOverlayClose();

            const navParams = route?.params ?? {};

            const propertyPrice = parseFloat(navParams.propertyPrice);
            const downPaymentAmount = parseFloat(newValue);
            const loanAmount = propertyPrice - downPaymentAmount;

            navParams.loanAmount = parseFloat(loanAmount).toFixed(2);
            navParams.origLoanAmount = parseFloat(loanAmount).toFixed(2);
            navParams.downPaymentAmount = parseFloat(downPaymentAmount).toFixed(2);

            if (downPaymentAmount && propertyPrice) {
                const downPaymentPercent = (downPaymentAmount / propertyPrice) * 100;
                navParams.downPaymentPercent = parseFloat(downPaymentPercent).toFixed(2);
            }
            if (state.isJointApplicantAdded) {
                callJointEligibilityAPIForRecalculation();
            } else {
                callEligibilityAPIForRecalculation();
            }
        } else {
            dispatch({
                actionType: "SET_DOWNPAYMENT",
                payload: {
                    downpaymentOverlayIsValid: false,
                    downpaymentOverlayErrorMsg: `Enter a value above RM${recommendedDownpaymentFormatted} or within 50% of the property price`,
                },
            });
        }
    };

    const onDownpaymentOverlayClose = () => {
        console.log("[CEResult] >> [onDownpaymentOverlayClose]");

        // Hide overlay
        dispatch({
            actionType: "SHOW_DOWNPAYMENT_OVERLAY",
            payload: false,
        });

        // Reset value
        dispatch({
            actionType: "RESET_DOWNPAY_OVERLAY_VALUE",
            payload: false,
        });
    };

    const onDownpaymentChange = (value) => {
        console.log("[CEResult] >> [onDownpaymentChange]");

        if (!value) {
            dispatch({
                actionType: "RESET_DOWNPAY_OVERLAY_VALUE",
                payload: false,
            });
            return;
        }

        const num = parseInt(value);
        if (num > 0) {
            const decimal = num / 100;

            dispatch({
                actionType: "SET_DOWNPAY_OVERLAY_VALUE",
                payload: {
                    keypad: String(num),
                    display: numeral(decimal).format("0,0.00"),
                },
            });
        }
    };

    async function onExitPopupSave() {
        console.log("[CEResult] >> [onExitPopupSave]");

        // Hide popup
        if (!state.isAssistanceRequested) {
            closeExitPopup();
        }

        // Save Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityResult();

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

    const onExitPopupDontSave = () => {
        console.log("[CEResult] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
            [FA_ACTION_NAME]: DONT_SAVE,
        });
    };

    const closeExitPopup = () => {
        console.log("[CEResult] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    };

    const closeOfferDiscPopup = () => {
        console.log("[CEResult] >> [closeOfferDiscPopup]");

        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: false,
        });
    };

    const closeReqAssistSuccessPopup = () => {
        console.log("[CEResult] >> [closeReqAssistSuccessPopup]");

        dispatch({
            actionType: "SHOW_REQ_ASSIST_SUCCESS_POPUP",
            payload: false,
        });
    };

    const closeApplySuccessPopup = () => {
        console.log("[CEResult] >> [closeApplySuccessPopup]");

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });
    };

    async function onPressOkApplySuccessPopup() {
        console.log("[CEResult] >> [onPressOkApplySuccessPopup]");

        const syncId = route?.params?.syncId;
        const encSyncId = await getEncValue(syncId);
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        const { propertyDetails, savedData, cancelReason } = await fetchApplicationDetails(
            params,
            false
        );

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });

        // Navigate back to application details screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
            params: {
                savedData,
                propertyDetails,
                syncId,
                cancelReason,
                mainApplicantDetails,
                jointApplicantDetails,
                currentUser,
                from: CE_RESULT,
                reload: true,
            },
        });
    }

    const onAddPromoPress = () => {
        console.log("[CEResult] >> [onAddPromoPress]");

        // add promo only for pass and soft fail status
        const currentScreenName = route.params?.currentScreenName;
        let screenName;
        if (currentScreenName === "MA_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
        } else {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: "Add promo",
            [FA_COUPON]: route.params?.stpApplicationId ?? "",
        });
    };

    const onViewOfferDisclaimer = () => {
        console.log("[CEResult] >> [onViewOfferDisclaimer]");

        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: true,
        });
    };

    const saveEligibilityResult = useCallback(async () => {
        console.log("[CEResult] >> [saveEligibilityResult]");

        // Construct request object
        const params = await getEligibilityRequestParams();

        // Call API to Save Input Data
        const httpResp = await saveResultData(params).catch((error) => {
            console.log("[CEResult][saveResultData] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.result?.statusCode ?? null;
        const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
        const syncId = httpResp?.data?.result?.syncId ?? null;

        return {
            success: statusCode === "0000",
            errorMessage: statusDesc,
            syncId,
        };
    }, [state.isAssistanceRequested, route?.params]);

    async function getEligibilityRequestParams() {
        const navParams = route?.params ?? {};

        const resultDataParams = getResultScreenParams();
        const encSyncId = await getEncValue(navParams?.syncId);

        return {
            // MDM Data
            customerName: navParams?.customerName,

            // Property Data
            propertyId: navParams?.propertyDetails?.property_id ?? "",
            propertyName: navParams?.propertyName,

            // Input Data
            staffPfNo: navParams?.staffPfNo,
            staffName: navParams?.staffName,
            unitId: navParams?.unitId,
            unitTypeName: navParams?.unitTypeName,
            propertyAddress1: navParams?.propertyAddress1,
            propertyAddress2: navParams?.propertyAddress2,
            propertyAddress3: navParams?.propertyAddress3,
            propertyPostcode: navParams?.propertyPostcode,
            propertyState: navParams?.propertyState,
            propertyPrice: navParams?.propertyPrice,
            downPaymentAmount: navParams?.origDownPaymentAmount
                ? navParams?.origDownPaymentAmount
                : navParams?.downPaymentAmount,
            downPaymentPercent: navParams?.downPaymentPercent,
            loanAmount: state?.loanAmount || navParams?.loanAmount,
            tenure: navParams?.tenure,
            residentStatus: navParams?.residentStatus,
            education: navParams?.education,
            maritalStatus: navParams?.maritalStatus,
            religion: navParams?.religion,
            spouseIncome: navParams?.spouseIncome,
            isFirstTimeBuyHomeIndc: navParams?.isFirstTimeBuyHomeIndc,
            employmentStatus: navParams?.employmentStatus,
            businessType: navParams?.businessType,
            occupation: navParams?.occupation,
            publicSectorNameFinance: navParams?.publicSectorNameFinance,
            title: navParams?.title,
            grossIncome: navParams?.grossIncome,
            houseLoan: navParams?.houseLoan,
            housingLoan: navParams?.housingLoan,
            personalLoan: navParams?.personalLoan,
            ccRepayments: navParams?.ccRepayments,
            carLoan: navParams?.carLoan,
            overdraft: navParams?.overdraft,
            nonBankCommitments: navParams?.nonBankCommitments,
            ccrisLoanCount: navParams?.ccrisLoanCount,
            propertyPurchase: navParams?.propertyPurchase,
            ongoingLoan: navParams?.ongoingLoan,

            // Common
            syncId: encSyncId,
            screenNo: navParams?.screenNo,
            saveData: "Y",
            isPropertyListed: navParams?.isPropertyListed,
            progressStatus: PROP_ELG_RESULT,

            // Result Data
            ...resultDataParams,
        };
    }

    function getResultScreenParams() {
        const navParams = route?.params ?? {};

        return {
            dataType: state.dataType,
            interestRate: state.interestRate,
            spreadRate: state.spreadRate,
            baseRate: state.baseRate,
            monthlyInstalment: state.monthlyInstalment,
            recommendedTenure: state.tenure,
            recommendedDownpayment: state.downpayment,
            salesRepRequest: state.isAssistanceRequested ? "Y" : "N",
            stpApplicationId: navParams?.stpApplicationId,
            eligibilityStatus: navParams?.eligibilityStatus,
            minTenure: state.tenureMin,
            maxTenure: state.tenureMax,
        };
    }

    async function callEligibilityAPIForRecalculation() {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData(); //CE_COMMITMENTS screen

        //save
        await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );

        const mdmData = await getMDMData(false);

        const params = {
            ...navParams,
            applicationStpRefNo: navParams?.stpApplicationId ?? "",
        };

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus, baseRateLabel } =
            await checkEligibility(
                {
                    ...params,
                    mdmData,
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

        navParams.eligibilityResult = eligibilityResult;
        navParams.stpApplicationId = stpId;
        navParams.eligibilityStatus = overallStatus;
        navParams.baseRateLabel = baseRateLabel;

        //update UI
        populateData(navParams);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    async function callJointEligibilityAPIForRecalculation() {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        setLoading(true);
        const navParams = route?.params ?? {};

        // Retrieve form data
        const formData = getFormData(); //CE_COMMITMENTS screen
        const response = await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
            },
            false
        );

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus } =
            await checkJAEligibility(
                {
                    ...navParams,
                    applicationStpRefNo: response?.stpId,
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

        navParams.eligibilityResult = eligibilityResult;
        navParams.stpApplicationId = stpId;
        navParams.eligibilityStatus = overallStatus;
        navParams.jaDataType = null;
        navParams.jaLoanAmount = null;

        //update UI
        populateData(navParams);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }
    function getFormData() {
        console.log("[CEResult] >> [getFormData]");
        const navParams = route?.params ?? {};

        return {
            grossIncome: navParams?.grossIncome ?? "",
            houseLoan: navParams?.houseLoan ?? "",
            housingLoan: navParams?.housingLoan ?? "",
            personalLoan: navParams?.personalLoan ?? "",
            ccRepayments: navParams?.ccRepayments ?? "",
            carLoan: navParams?.carLoan ?? "",
            overdraft: navParams?.overdraft ?? "",
            nonBankCommitments: navParams?.nonBankCommitments ?? "",
            staffPfNo: navParams?.staffPfNo,
            staffName: navParams?.staffName,
        };
    }

    const onPressAddJointApplicant = async () => {
        console.log("[CEResult] >> [onPressAddJointApplicant]");
        setLoading(true);

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? "";
        navParams.isMainEligDataType = navParams?.eligibilityResult?.dataType;
        navParams.loanAmount = navParams?.origLoanAmount
            ? navParams?.origLoanAmount
            : navParams?.loanAmount;
        navParams.downPaymentAmount = navParams?.origDownPaymentAmount
            ? navParams?.origDownPaymentAmount
            : navParams?.downPaymentAmount;
        navParams.tenure = navParams?.origTenure ? navParams?.origTenure : navParams?.tenure;
        navParams.maEligibilityResult = navParams?.eligibilityResult;

        // save CE result
        await saveEligibilityResult();

        let masterData = navParams?.masterData ?? {};
        let mdmData = navParams?.mdmData ?? {};

        //if masterData is not available then get the data
        if (Object.keys(masterData).length === 0) {
            // Prefetch required data
            masterData = await getMasterData(false);
            mdmData = await getMDMData(false);

            // Show error if failed to fetch MDM data
            if (!mdmData) {
                showErrorToast({
                    message: PROPERTY_MDM_ERR,
                });
                setLoading(false);
                return;
            }
        }

        // navigate to Add Joint Applicant details screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_DETAILS,
            params: {
                propertyDetails,
                syncId: route?.params?.syncId,
                ...navParams,
                masterData,
                mdmData,
            },
        });
        setLoading(false);

        const screenName = (() => {
            switch (status) {
                case STATUS_PASS: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA;
                    }
                }
                case STATUS_SOFT_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
                    }
                }
                case STATUS_HARD_FAIL: {
                    if (navParams?.currentScreenName === "MA_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA;
                    } else if (navParams?.currentScreenName === "REMOVED_VIEW") {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE;
                    } else {
                        return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA;
                    }
                }
                default:
                    return null;
            }
        })();
        if (route?.params?.subModule === "JA_ELIG_FAIL" && route?.params?.jaEligResult) {
            FAProperty.onPressRequestForAssistance(
                FA_PROPERTY_JA_NOT_ELIGIBLE,
                ADD_JOINT_APPLICANT,
                ""
            );
        } else if (route?.params?.subModule === "JA_APPL_REJECT") {
            FAProperty.onPressRequestForAssistance(
                FA_PROPERTY_JACEJA_REJECTED_INVITATION,
                ADD_NEW_JOINT_APPLICANT,
                ""
            );
        } else {
            FAProperty.onPressRequestForAssistance(
                screenName,
                STATUS_HARD_FAIL ? ADD_NEW_JOINT_APPLICANT : ADD_JOINT_APPLICANT,
                route.params?.stpApplicationId
            );
        }
    };
    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }
    const onViewApplicationPress = () => {
        resetToApplication();
    };

    const onScroll = ({ nativeEvent }) => {
        console.log("[CEResult] >> [onScroll]");

        const bottomSpaceHeight = 300;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - bottomSpaceHeight;
        console.log("[CEResult] >> [onScroll]", nativeEvent);
        console.log("[CEResult] >> [onScroll] isCloseToBottom: " + isCloseToBottom);

        const floating = !isCloseToBottom;
        dispatch({
            actionType: "SET_APPLY_BUTTON_FLOATING",
            payload: {
                isApplyButtonFloating: floating,
            },
        });
    };
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
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        ref={scrollRef}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {/* Top Image Component */}
                        <View style={Style.imageContainer(imageHeight)}>
                            {(eligibilityStatus === ELIGIBILTY_STATUS_AMBER ||
                                eligibilityStatus === ELIGIBILTY_STATUS_ELIGIBLE) &&
                            state.isJointApplicantAdded ? (
                                <>
                                    <Animatable.Image
                                        animation={imgAnimFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={
                                            status === STATUS_PASS
                                                ? Assets.eligibilitySuccess
                                                : status === STATUS_SOFT_FAIL &&
                                                  !route?.params?.jaEligResult
                                                ? Assets.eligibilitySoftFail
                                                : route?.params?.jaEligResult &&
                                                  status === STATUS_SOFT_FAIL &&
                                                  route?.params?.subModule !== "JA_ELIG_FAIL"
                                                ? Assets.eligibilitySuccess
                                                : Assets.eligibilityJHardFailL
                                        }
                                        style={Style.imageCls}
                                        resizeMode="cover"
                                        useNativeDriver
                                    />
                                </>
                            ) : (
                                <>
                                    <Animatable.Image
                                        animation={imgAnimFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={
                                            status === STATUS_PASS && !route?.params?.declinedFromJa
                                                ? Assets.eligibilitySuccess
                                                : !state.isJARemoved &&
                                                  !route?.params?.declinedFromJa
                                                ? Assets.eligibilitySoftFail
                                                : Assets.eligibilityJHardFailL
                                        }
                                        style={Style.imageCls}
                                        resizeMode="cover"
                                        useNativeDriver
                                    />
                                </>
                            )}
                            {/* Toolbar container for Close Icon */}
                            <View style={Style.toolbarContainer(insets.top)}>
                                <View style={Style.closeBtnCont}>
                                    <HeaderCloseButton onPress={onCloseTap} />
                                </View>
                            </View>
                        </View>

                        <View
                            style={
                                (!state.isJAButtonEnabled || !state.isRFASwitchEnabled) &&
                                Style.bottomMargin
                            }
                        >
                            {!state.isJointApplicantAdded &&
                            eligibilityStatus !== ELIGIBILTY_STATUS_ELIGIBLE ? (
                                <View>
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
                                            <>
                                                <Typo
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={VIEW_OFFER_CONDITIONS}
                                                    fontWeight="bold"
                                                    style={Style.textUnderline}
                                                    onPress={onViewOfferDisclaimer}
                                                />
                                                {status !== STATUS_PASS && (
                                                    <Typo
                                                        lineHeight={18}
                                                        textAlign="left"
                                                        style={Style.subText1}
                                                        text={state.otherOptionText}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {/* Sub Text 2 */}
                                        <Typo
                                            lineHeight={22}
                                            textAlign="left"
                                            style={
                                                state.subText2 ? Style.subText2 : Style.subText2Hide
                                            }
                                            text={state.subText2 ? state.subText2 : ""}
                                        />
                                    </View>

                                    {status !== STATUS_HARD_FAIL && (
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
                                                        text="Property financing amount"
                                                    />

                                                    {/* Financing Amount value */}
                                                    <Typo
                                                        fontSize={24}
                                                        lineHeight={29}
                                                        fontWeight="bold"
                                                        style={Style.loanAmount}
                                                        text={state.loanAmountFormatted}
                                                    />

                                                    {/* Info container */}
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

                                                    {/* publicSectorNameFinance info container*/}
                                                    {state.publicSectorNameFinance && (
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
                                                                text={PUBLIC_SECTOR_FINANC_TEXT}
                                                                color={DARK_GREY}
                                                                style={Style.infoText}
                                                            />
                                                        </View>
                                                    )}

                                                    {/* Gray separator line */}
                                                    <View style={Style.graySeparator} />

                                                    {/* profit Rate */}
                                                    <DetailField
                                                        label="Effective profit rate"
                                                        value={state.interestRateFormatted}
                                                        valueSubText1={state.baseRateFormatted}
                                                        valueSubText2={state.spreadRateFormatted}
                                                    />

                                                    {/* Tenure */}
                                                    <DetailField
                                                        label={state.tenureLabel}
                                                        value={state.tenureFormatted}
                                                        isEditable={state.tenureEditable}
                                                        onValuePress={
                                                            state.tenureEditable && onTenurePress
                                                        }
                                                    />

                                                    {/* Monthly Instalment */}
                                                    <DetailField
                                                        label="Monthly instalment"
                                                        value={state.monthlyInstalmentFormatted}
                                                        infoNote={MONTHLY_INSTALMENT_INFO}
                                                    />

                                                    {/* Gray separator line */}
                                                    <View style={Style.graySeparator} />

                                                    {/* Property Price */}
                                                    <DetailField
                                                        label="Property price"
                                                        value={state.propertyPriceFormatted}
                                                    />

                                                    {/* Downpayment */}
                                                    <DetailField
                                                        label="Downpayment"
                                                        value={state.downpaymentFormatted}
                                                        isEditable={state.downpaymentEditable}
                                                        onValuePress={
                                                            state.downpaymentEditable &&
                                                            onDownpaymentPress
                                                        }
                                                        infoNote={state.downpaymentInfoNote}
                                                    />
                                                </View>
                                            </View>

                                            {/* Add Promo */}
                                            {status === STATUS_PASS &&
                                                !route.params?.declinedFromJa && (
                                                    <View
                                                        style={
                                                            Platform.OS === "ios"
                                                                ? Style.shadow
                                                                : {}
                                                        }
                                                    >
                                                        <View
                                                            style={
                                                                Platform.OS === "ios"
                                                                    ? {}
                                                                    : Style.shadow
                                                            }
                                                        >
                                                            <AddPromoRow
                                                                onPress={onAddPromoPress}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                            {/* Joint Applicant */}

                                            {state.isMainApplicant &&
                                                state.isJointApplicantAdded &&
                                                route?.params?.subModule !== "JA_ELIG_FAIL" && (
                                                    <View>
                                                        <Typo
                                                            fontSize={16}
                                                            fontWeight="600"
                                                            lineHeight={20}
                                                            text={YOUR_JOINT_APPLICANT}
                                                            textAlign="left"
                                                            style={Style.horizontalMargin}
                                                        />
                                                        <JointApplicantDetail
                                                            jointApplicantInfo={
                                                                state.jointApplicantInfo
                                                            }
                                                            removeOpenJointApplicant={
                                                                onOpenRemoveJointApplicantPopup
                                                            }
                                                        />

                                                        {/* Gray separator line */}
                                                        <View style={Style.graySeparator} />
                                                    </View>
                                                )}

                                            <View style={Style.horizontalMargin}>
                                                {status !== STATUS_HARD_FAIL &&
                                                    state.isJARemoved && (
                                                        <ActionButton
                                                            fullWidth
                                                            backgroundColor={YELLOW}
                                                            componentCenter={
                                                                <Typo
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    text={PROCEED_WITH_APPLICATION}
                                                                />
                                                            }
                                                            onPress={onApplyLoan}
                                                            style={Style.viewOtherBtn}
                                                        />
                                                    )}
                                                {route?.params?.declinedFromJa && (
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
                                                                text={VIEW_OTHER_PROPERTIES}
                                                            />
                                                        }
                                                        onPress={onPressViewOtherProperties}
                                                        style={Style.viewOtherBtn}
                                                    />
                                                )}

                                                {status === STATUS_SOFT_FAIL &&
                                                    state.isJARemoved && (
                                                        <Typo
                                                            fontSize={16}
                                                            fontWeight="600"
                                                            lineHeight={20}
                                                            text={BETTER_OFFER_TEXT}
                                                            textAlign="center"
                                                            style={Style.viewOtherBtn}
                                                        />
                                                    )}

                                                {status === STATUS_SOFT_FAIL &&
                                                    !state.isJARemoved &&
                                                    !route?.params?.declinedFromJa && (
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
                                                                    text={VIEW_OTHER_PROPERTIES}
                                                                />
                                                            }
                                                            onPress={onPressViewOtherProperties}
                                                            style={Style.viewOtherBtn}
                                                        />
                                                    )}

                                                {status !== STATUS_HARD_FAIL &&
                                                    !state.isJARemoved && (
                                                        <ActionButton
                                                            fullWidth
                                                            backgroundColor={YELLOW}
                                                            componentCenter={
                                                                <Typo
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    text={PROCEED_WITH_APPLICATION}
                                                                />
                                                            }
                                                            onPress={onApplyLoan}
                                                        />
                                                    )}
                                            </View>
                                            {status !== STATUS_HARD_FAIL &&
                                                status !== STATUS_PASS &&
                                                state.isJARemoved &&
                                                state.isJAButtonEnabled && (
                                                    <ActionTile
                                                        header={ADD_JOINT_APPLICANT}
                                                        description={ADD_JOINT_APPLICANT_TEXT}
                                                        icon={Assets.jointApplicant}
                                                        style={Style.TileBtn}
                                                        onPress={onPressAddJointApplicant}
                                                    />
                                                )}
                                            {status === STATUS_SOFT_FAIL && state.isJARemoved && (
                                                <ActionTile
                                                    header={VIEW_OTHER_PROPERTIES}
                                                    description={OTHER_PROPERTIES}
                                                    icon={Assets.otherPropIcon}
                                                    style={Style.TileBtn}
                                                    onPress={onPressViewOtherProperties}
                                                />
                                            )}

                                            {status === STATUS_PASS &&
                                                state.isJARemoved &&
                                                state.isRFASwitchEnabled && (
                                                    <>
                                                        {/* Gray separator line */}
                                                        <View
                                                            style={[
                                                                Style.graySeparator,
                                                                Style.horizontalMargin,
                                                            ]}
                                                        />
                                                        {/* What other... */}
                                                        <Typo
                                                            fontSize={16}
                                                            fontWeight="600"
                                                            lineHeight={20}
                                                            textAlign="left"
                                                            style={[
                                                                Style.optionHeader,
                                                                Style.horizontalMarginBig,
                                                            ]}
                                                            text={state.otherOptionText}
                                                        />
                                                        <Typo
                                                            lineHeight={22}
                                                            textAlign="left"
                                                            style={[
                                                                Style.optionHeader,
                                                                Style.horizontalMarginBig,
                                                            ]}
                                                            text={SALES_REP_TEXT}
                                                        />
                                                    </>
                                                )}

                                            {/* Button Container */}
                                            {status !== STATUS_HARD_FAIL &&
                                                state.isJAButtonEnabled &&
                                                route?.params?.declinedFromJa && (
                                                    <ActionTile
                                                        header={ADD_JOINT_APPLICANT}
                                                        description={ADD_JOINT_APPLICANT_TEXT}
                                                        icon={Assets.jointApplicant}
                                                        style={Style.JATile}
                                                        onPress={onPressAddJointApplicant}
                                                    />
                                                )}

                                            {status !== STATUS_HARD_FAIL &&
                                                state.isJARemoved &&
                                                state.isRFASwitchEnabled && (
                                                    <ActionTile
                                                        header={REQ_ASSISTANCE_TEXT}
                                                        description={REQUEST_FOR_ASSISTANCE_DESC}
                                                        icon={Assets.addAssistanceIcon}
                                                        style={Style.additionalIncomeTile}
                                                        onPress={onPressRequestForAssistance}
                                                    />
                                                )}
                                        </>
                                    )}

                                    {/* Button Container if STATUS_HARD_FAIL */}
                                    {status === STATUS_HARD_FAIL && (
                                        <View style={Style.horizontalMargin}>
                                            {!state.isJARemoved &&
                                                !route?.params?.declinedFromJa && (
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
                                                                text={VIEW_OTHER_PROPERTIES}
                                                            />
                                                        }
                                                        onPress={onPressViewOtherProperties}
                                                        style={Style.viewOtherBtn}
                                                    />
                                                )}

                                            {state.isJARemoved && (
                                                <ActionButton
                                                    fullWidth
                                                    backgroundColor={WHITE}
                                                    style={Style.applyBtn}
                                                    componentCenter={
                                                        <Typo
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            text={VIEW_OTHER_PROPERTIES}
                                                        />
                                                    }
                                                    onPress={onPressViewOtherProperties}
                                                />
                                            )}
                                            {route?.params?.declinedFromJa && (
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
                                                            text={VIEW_OTHER_PROPERTIES}
                                                        />
                                                    }
                                                    onPress={onPressViewOtherProperties}
                                                    style={Style.viewOtherBtn}
                                                />
                                            )}

                                            <ActionButton
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={PROCEED_WITH_APPLICATION}
                                                    />
                                                }
                                                onPress={onApplyLoan}
                                                style={Style.viewOtherBtn}
                                            />
                                            {state.isJARemoved && state.isJAButtonEnabled && (
                                                <ActionButton
                                                    fullWidth
                                                    backgroundColor={YELLOW}
                                                    style={Style.applyBtn}
                                                    componentCenter={
                                                        <Typo
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            text={ADD_NEW_JOINT_APPLICANT}
                                                        />
                                                    }
                                                    onPress={onPressAddJointApplicant}
                                                />
                                            )}
                                            {route?.params?.declinedFromJa &&
                                                state.isJAButtonEnabled && (
                                                    <ActionButton
                                                        fullWidth
                                                        backgroundColor={YELLOW}
                                                        style={Style.applyBtn}
                                                        componentCenter={
                                                            <Typo
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                text={ADD_NEW_JOINT_APPLICANT}
                                                            />
                                                        }
                                                        onPress={onPressAddJointApplicant}
                                                    />
                                                )}
                                            {state.isJARemoved && state.isRFASwitchEnabled && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        onPressRequestForAssistance();
                                                    }}
                                                    activeOpacity={0.8}
                                                >
                                                    <Typo
                                                        color={ROYAL_BLUE}
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={REQ_ASSISTANCE_TEXT}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                    {status === STATUS_HARD_FAIL && state.isRFASwitchEnabled && (
                                        <ActionTile
                                            header={REQ_ASSISTANCE_TEXT}
                                            description={REQUEST_FOR_ASSISTANCE_DESC}
                                            icon={Assets.addAssistanceIcon}
                                            style={Style.additionalIncomeTile}
                                            onPress={onPressRequestForAssistance}
                                        />
                                    )}
                                    {/* Add a joint applicant to be shown in case of soft fail or hard fail */}
                                    {status !== STATUS_PASS &&
                                        !state.jointApplicantInfo?.customerId &&
                                        state.isJAButtonEnabled &&
                                        !route?.params?.declinedFromJa &&
                                        !state.isJARemoved && (
                                            <ActionTile
                                                header={ADD_JOINT_APPLICANT}
                                                description={ADD_JOINT_APPLICANT_TEXT}
                                                icon={Assets.jointApplicant}
                                                style={Style.JATile}
                                                onPress={onPressAddJointApplicant}
                                            />
                                        )}

                                    {status === STATUS_PASS &&
                                        !route.params?.declinedFromJa &&
                                        !state.isJARemoved &&
                                        state.isRFASwitchEnabled && (
                                            <>
                                                {/* Gray separator line */}
                                                <View
                                                    style={[
                                                        Style.graySeparator,
                                                        Style.horizontalMargin,
                                                    ]}
                                                />

                                                {/* What other... */}

                                                <Typo
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={20}
                                                    textAlign="left"
                                                    style={[
                                                        Style.optionHeader,
                                                        Style.horizontalMarginBig,
                                                    ]}
                                                    text={state.otherOptionText}
                                                />
                                                <Typo
                                                    lineHeight={22}
                                                    textAlign="left"
                                                    style={[
                                                        Style.optionHeader,
                                                        Style.horizontalMarginBig,
                                                    ]}
                                                    text={SALES_REP_TEXT}
                                                />
                                            </>
                                        )}
                                    {/* Request assistance to be shown in case of pass or soft fail */}

                                    {status !== STATUS_HARD_FAIL &&
                                        !state.isJARemoved &&
                                        state.isRFASwitchEnabled && (
                                            <ActionTile
                                                header={REQ_ASSISTANCE_TEXT}
                                                description={SALES_REP_DESC}
                                                icon={Assets.addIncomeIcon}
                                                style={Style.additionalIncomeTile}
                                                onPress={onPressRequestForAssistance}
                                            />
                                        )}
                                </View>
                            ) : (eligibilityStatus === ELIGIBILTY_STATUS_AMBER ||
                                  eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
                              state.isMainEligDataType === STATUS_HARD_FAIL &&
                              status === STATUS_HARD_FAIL &&
                              state.isJointApplicantAdded ? (
                                <>
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

                                        {/* Sub Text 2 */}
                                        <Typo
                                            lineHeight={22}
                                            textAlign="left"
                                            style={Style.subText1}
                                            text={state.subText2}
                                        />
                                    </View>
                                    {/* Button Container */}
                                    <View style={Style.horizontalMargin}>
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
                                                    text={VIEW_OTHER_PROPERTIES}
                                                />
                                            }
                                            onPress={onPressViewOtherProperties}
                                            style={Style.viewOtherBtn}
                                        />

                                        <ActionButton
                                            fullWidth
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={PROCEED_WITH_APPLICATION}
                                                />
                                            }
                                            onPress={onApplyLoan}
                                            style={Style.viewOtherBtn}
                                        />

                                        {state.isJAButtonEnabled && (
                                            <ActionButton
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                style={Style.applyBtn}
                                                componentCenter={
                                                    <Typo
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={ADD_NEW_JOINT_APPLICANT}
                                                    />
                                                }
                                                onPress={onPressAddJointApplicant}
                                            />
                                        )}
                                    </View>
                                    {state.isRFASwitchEnabled && (
                                        <ActionTile
                                            header={REQ_ASSISTANCE_TEXT}
                                            description={REQUEST_FOR_ASSISTANCE_DESC}
                                            icon={Assets.addAssistanceIcon}
                                            style={Style.additionalIncomeTile}
                                            onPress={onPressRequestForAssistance}
                                        />
                                    )}
                                </>
                            ) : (eligibilityStatus === ELIGIBILTY_STATUS_AMBER ||
                                  eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
                              state.isMainEligDataType === STATUS_SOFT_FAIL &&
                              status === STATUS_HARD_FAIL &&
                              state.isJointApplicantAdded ? (
                                <>
                                    <View>
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
                                            <Typo
                                                lineHeight={18}
                                                textAlign="left"
                                                text={VIEW_OFFER_CONDITIONS}
                                                fontWeight="bold"
                                                style={Style.textUnderline}
                                                onPress={onViewOfferDisclaimer}
                                            />
                                            {/* Sub Text 2 */}
                                            <Typo
                                                lineHeight={22}
                                                textAlign="left"
                                                style={
                                                    state.subText2
                                                        ? Style.subText2
                                                        : Style.subText2Hide
                                                }
                                                text={state.subText2 ? state.subText2 : ""}
                                            />
                                        </View>
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
                                                    text="Property financing amount"
                                                />

                                                {/* Financing Amount value */}
                                                <Typo
                                                    fontSize={24}
                                                    lineHeight={29}
                                                    fontWeight="bold"
                                                    style={Style.loanAmount}
                                                    text={state.loanAmountFormatted}
                                                />

                                                {/* Info container */}
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

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* profit Rate */}
                                                <DetailField
                                                    label="Effective profit rate"
                                                    value={state.interestRateFormatted}
                                                    valueSubText1={state.baseRateFormatted}
                                                    valueSubText2={state.spreadRateFormatted}
                                                />

                                                {/* Tenure */}
                                                <DetailField
                                                    label={state.tenureLabel}
                                                    value={state.tenureFormatted}
                                                    isEditable={state.tenureEditable}
                                                    onValuePress={
                                                        state.tenureEditable && onTenurePress
                                                    }
                                                />

                                                {/* Monthly Instalment */}
                                                <DetailField
                                                    label="Monthly instalment"
                                                    value={state.monthlyInstalmentFormatted}
                                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                                />

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* Property Price */}
                                                <DetailField
                                                    label="Property price"
                                                    value={state.propertyPriceFormatted}
                                                />

                                                {/* Downpayment */}
                                                <DetailField
                                                    label="Downpayment"
                                                    value={state.downpaymentFormatted}
                                                    isEditable={state.downpaymentEditable}
                                                    onValuePress={
                                                        state.downpaymentEditable &&
                                                        onDownpaymentPress
                                                    }
                                                    infoNote={state.downpaymentInfoNote}
                                                />
                                            </View>
                                        </View>

                                        {/* Button Container */}
                                        <View style={Style.horizontalMargin}>
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
                                                        text={VIEW_OTHER_PROPERTIES}
                                                    />
                                                }
                                                onPress={onPressViewOtherProperties}
                                                style={Style.viewOtherBtn}
                                            />

                                            <ActionButton
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                style={Style.applyBtn}
                                                componentCenter={
                                                    <Typo
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={PROCEED_WITH_APPLICATION}
                                                    />
                                                }
                                                onPress={onApplyLoan}
                                            />
                                        </View>
                                        {route?.params?.subModule !== "JA_ELIG_FAIL" && (
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={20}
                                                text={BETTER_OFFER_TEXT}
                                                textAlign="left"
                                                style={Style.horizontalMargin}
                                            />
                                        )}

                                        {state.isJAButtonEnabled && (
                                            <ActionTile
                                                header={ADD_JOINT_APPLICANT}
                                                description={ADD_JOINT_APPLICANT_TEXT}
                                                icon={Assets.jointApplicant}
                                                style={Style.JATile}
                                                onPress={onPressAddJointApplicant}
                                            />
                                        )}
                                        {state.isRFASwitchEnabled && (
                                            <ActionTile
                                                header={REQ_ASSISTANCE_TEXT}
                                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                                icon={Assets.addAssistanceIcon}
                                                style={Style.additionalIncomeTile}
                                                onPress={onPressRequestForAssistance}
                                            />
                                        )}
                                    </View>
                                </>
                            ) : (eligibilityStatus === ELIGIBILTY_STATUS_AMBER ||
                                  eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
                              (state.isMainEligDataType === STATUS_SOFT_FAIL ||
                                  state.isMainEligDataType === STATUS_PASS) &&
                              (status === STATUS_PASS || status === STATUS_SOFT_FAIL) &&
                              state.isJointApplicantAdded ? (
                                <>
                                    <View>
                                        <View style={Style.horizontalMarginBig}>
                                            {/* Header Text */}
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={20}
                                                text={state.headerText}
                                                textAlign="left"
                                                style={Style.applyBtn}
                                            />
                                            <Typo textAlign="left" fontSize={16} lineHeight={22}>
                                                {/* Sub Text 1 */}
                                                <Typo
                                                    lineHeight={22}
                                                    textAlign="left"
                                                    style={Style.subText1}
                                                    text={state.subText1}
                                                />
                                                {status === STATUS_PASS &&
                                                    !route?.params?.jaEligResult && (
                                                        <>
                                                            <Typo
                                                                lineHeight={20}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={` ${state.jointApplicantInfo.customerName}`}
                                                            />

                                                            <Typo
                                                                lineHeight={20}
                                                                textAlign="left"
                                                                text=", you’re now eligible for this home financing."
                                                            />
                                                        </>
                                                    )}
                                            </Typo>

                                            {/* View offer disclaimer */}
                                            <Typo
                                                lineHeight={18}
                                                textAlign="left"
                                                text={VIEW_OFFER_CONDITIONS}
                                                fontWeight="bold"
                                                style={Style.textUnderline}
                                                onPress={onViewOfferDisclaimer}
                                            />
                                            {/* Sub Text 2 */}
                                            <Typo
                                                lineHeight={22}
                                                textAlign="left"
                                                style={
                                                    state.subText2
                                                        ? Style.subText2
                                                        : Style.subText2Hide
                                                }
                                                text={state.subText2 ? state.subText2 : ""}
                                            />
                                        </View>
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
                                                    text="Property financing amount"
                                                />

                                                {/* Financing Amount value */}
                                                <Typo
                                                    fontSize={24}
                                                    lineHeight={29}
                                                    fontWeight="bold"
                                                    style={Style.loanAmount}
                                                    text={state.loanAmountFormatted}
                                                />

                                                {/* Info container */}
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

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* profit Rate */}
                                                <DetailField
                                                    label="Effective profit rate"
                                                    value={state.interestRateFormatted}
                                                    valueSubText1={state.baseRateFormatted}
                                                    valueSubText2={state.spreadRateFormatted}
                                                />

                                                {/* Tenure */}
                                                <DetailField
                                                    label={state.tenureLabel}
                                                    value={state.tenureFormatted}
                                                    isEditable={state.tenureEditable}
                                                    onValuePress={
                                                        state.tenureEditable && onTenurePress
                                                    }
                                                />

                                                {/* Monthly Instalment */}
                                                <DetailField
                                                    label="Monthly instalment"
                                                    value={state.monthlyInstalmentFormatted}
                                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                                />

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* Property Price */}
                                                <DetailField
                                                    label="Property price"
                                                    value={state.propertyPriceFormatted}
                                                />

                                                {/* Downpayment */}
                                                <DetailField
                                                    label="Downpayment"
                                                    value={state.downpaymentFormatted}
                                                    isEditable={state.downpaymentEditable}
                                                    onValuePress={
                                                        state.downpaymentEditable &&
                                                        onDownpaymentPress
                                                    }
                                                    infoNote={INFO_NOTE}
                                                />
                                            </View>
                                            {state.isMainApplicant &&
                                                state.isJointApplicantAdded &&
                                                route?.params?.subModule !== "JA_ELIG_FAIL" && (
                                                    <View
                                                        style={[
                                                            Style.paddingLeft_15,
                                                            Style.horizontalMargin,
                                                        ]}
                                                    >
                                                        {/* Joint Applicant */}
                                                        <Typo
                                                            fontSize={16}
                                                            fontWeight="600"
                                                            lineHeight={20}
                                                            text={YOUR_JOINT_APPLICANT}
                                                            textAlign="left"
                                                            style={Style.horizontalMargin}
                                                        />
                                                        <JointApplicantDetail
                                                            jointApplicantInfo={
                                                                state.jointApplicantInfo
                                                            }
                                                            removeOpenJointApplicant={
                                                                onOpenRemoveJointApplicantPopup
                                                            }
                                                        />
                                                        {/* Gray separator line */}
                                                        <View style={Style.graySeparator} />
                                                    </View>
                                                )}
                                        </View>

                                        {/* Button Container */}
                                        <View style={Style.horizontalMargin}>
                                            {!route?.params?.jaEligResult && (
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
                                                            text={VIEW_OTHER_PROPERTIES}
                                                        />
                                                    }
                                                    onPress={onPressViewOtherProperties}
                                                    style={Style.viewOtherBtn}
                                                />
                                            )}

                                            {route?.params?.jaEligResult &&
                                                route?.params?.subModule === "JA_ELIG_FAIL" && (
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
                                                                text={VIEW_OTHER_PROPERTIES}
                                                            />
                                                        }
                                                        onPress={onPressViewOtherProperties}
                                                        style={Style.viewOtherBtn}
                                                    />
                                                )}

                                            <ActionButton
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                style={Style.applyBtn}
                                                componentCenter={
                                                    <Typo
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={PROCEED_WITH_APPLICATION}
                                                    />
                                                }
                                                onPress={
                                                    route?.params?.isAccepted &&
                                                    route?.params?.statusMessage === "JA_ELIG_RECM"
                                                        ? onApplyLoan
                                                        : onMainApplyLoan
                                                }
                                            />
                                        </View>

                                        {state.isJAButtonEnabled &&
                                            route?.params?.jaEligResult &&
                                            route?.params?.subModule === "JA_ELIG_FAIL" && (
                                                <ActionTile
                                                    header={ADD_JOINT_APPLICANT}
                                                    description={ADD_JOINT_APPLICANT_TEXT}
                                                    icon={Assets.jointApplicant}
                                                    style={Style.JATile}
                                                    onPress={onPressAddJointApplicant}
                                                />
                                            )}

                                        {state.isRFASwitchEnabled && (
                                            <ActionTile
                                                header={REQ_ASSISTANCE_TEXT}
                                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                                icon={Assets.addAssistanceIcon}
                                                style={Style.additionalIncomeTile}
                                                onPress={onPressRequestForAssistance}
                                            />
                                        )}
                                    </View>
                                </>
                            ) : (eligibilityStatus === ELIGIBILTY_STATUS_AMBER ||
                                  eligibilityStatus === ELIGIBILTY_STATUS_GREEN) &&
                              state.isMainEligDataType === STATUS_HARD_FAIL &&
                              (status === STATUS_PASS || status === STATUS_SOFT_FAIL) &&
                              state.isJointApplicantAdded ? (
                                <>
                                    <View>
                                        <View style={Style.horizontalMarginBig}>
                                            {/* Header Text */}
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={20}
                                                text={state.headerText}
                                                textAlign="left"
                                                style={Style.applyBtn}
                                            />
                                            <Typo textAlign="left" fontSize={16} lineHeight={22}>
                                                {/* Sub Text 1 */}
                                                <Typo
                                                    lineHeight={22}
                                                    textAlign="left"
                                                    style={Style.subText1}
                                                    text={state.subText1}
                                                />
                                                {status === STATUS_PASS &&
                                                    !route?.params?.jaEligResult && (
                                                        <>
                                                            <Typo
                                                                lineHeight={20}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={` ${state.jointApplicantInfo.customerName}`}
                                                            />

                                                            <Typo
                                                                lineHeight={20}
                                                                textAlign="left"
                                                                text=", you’re now eligible for this home financing."
                                                            />
                                                        </>
                                                    )}
                                            </Typo>

                                            {/* View offer disclaimer */}
                                            <Typo
                                                lineHeight={18}
                                                textAlign="left"
                                                text={VIEW_OFFER_CONDITIONS}
                                                fontWeight="bold"
                                                style={Style.textUnderline}
                                                onPress={onViewOfferDisclaimer}
                                            />
                                            {/* Sub Text 2 */}
                                            <Typo
                                                lineHeight={22}
                                                textAlign="left"
                                                style={
                                                    state.subText2
                                                        ? Style.subText2
                                                        : Style.subText2Hide
                                                }
                                                text={state.subText2 ? state.subText2 : ""}
                                            />
                                        </View>
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
                                                    text="Property financing amount"
                                                />

                                                {/* Financing Amount value */}
                                                <Typo
                                                    fontSize={24}
                                                    lineHeight={29}
                                                    fontWeight="bold"
                                                    style={Style.loanAmount}
                                                    text={state.loanAmountFormatted}
                                                />

                                                {/* Info container */}
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

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* profit Rate */}
                                                <DetailField
                                                    label="Effective profit rate"
                                                    value={state.interestRateFormatted}
                                                    valueSubText1={state.baseRateFormatted}
                                                    valueSubText2={state.spreadRateFormatted}
                                                />

                                                {/* Tenure */}
                                                <DetailField
                                                    label={state.tenureLabel}
                                                    value={state.tenureFormatted}
                                                    isEditable={state.tenureEditable}
                                                    onValuePress={
                                                        state.tenureEditable && onTenurePress
                                                    }
                                                />

                                                {/* Monthly Instalment */}
                                                <DetailField
                                                    label="Monthly instalment"
                                                    value={state.monthlyInstalmentFormatted}
                                                    infoNote={MONTHLY_INSTALMENT_INFO}
                                                />

                                                {/* Gray separator line */}
                                                <View style={Style.graySeparator} />

                                                {/* Property Price */}
                                                <DetailField
                                                    label="Property price"
                                                    value={state.propertyPriceFormatted}
                                                />

                                                {/* Downpayment */}
                                                <DetailField
                                                    label="Downpayment"
                                                    value={state.downpaymentFormatted}
                                                    isEditable={state.downpaymentEditable}
                                                    onValuePress={
                                                        state.downpaymentEditable &&
                                                        onDownpaymentPress
                                                    }
                                                    infoNote={state.downpaymentInfoNote}
                                                />
                                            </View>
                                            {state.isMainApplicant && state.isJointApplicantAdded && (
                                                <View
                                                    style={[
                                                        Style.paddingLeft_15,
                                                        Style.horizontalMargin,
                                                    ]}
                                                >
                                                    {/* Joint Applicant */}
                                                    <Typo
                                                        fontSize={16}
                                                        fontWeight="600"
                                                        lineHeight={20}
                                                        text={YOUR_JOINT_APPLICANT}
                                                        textAlign="left"
                                                        style={Style.horizontalMargin}
                                                    />
                                                    <JointApplicantDetail
                                                        jointApplicantInfo={
                                                            state.jointApplicantInfo
                                                        }
                                                        removeOpenJointApplicant={
                                                            onOpenRemoveJointApplicantPopup
                                                        }
                                                    />
                                                    {/* Gray separator line */}
                                                    <View style={Style.graySeparator} />
                                                </View>
                                            )}
                                        </View>

                                        {/* Button Container */}
                                        <View style={Style.horizontalMargin}>
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
                                                        text={VIEW_OTHER_PROPERTIES}
                                                    />
                                                }
                                                onPress={onPressViewOtherProperties}
                                                style={Style.viewOtherBtn}
                                            />

                                            <ActionButton
                                                fullWidth
                                                backgroundColor={YELLOW}
                                                style={Style.applyBtn}
                                                componentCenter={
                                                    <Typo
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={PROCEED_WITH_APPLICATION}
                                                    />
                                                }
                                                onPress={
                                                    route?.params?.isAccepted &&
                                                    route?.params?.statusMessage === "JA_ELIG_RECM"
                                                        ? onApplyLoan
                                                        : onMainApplyLoan
                                                }
                                            />
                                        </View>

                                        {state.isRFASwitchEnabled && (
                                            <ActionTile
                                                header={REQ_ASSISTANCE_TEXT}
                                                description={REQUEST_FOR_ASSISTANCE_DESC}
                                                icon={Assets.addAssistanceIcon}
                                                style={Style.additionalIncomeTile}
                                                onPress={onPressRequestForAssistance}
                                            />
                                        )}
                                    </View>
                                </>
                            ) : (
                                <></>
                            )}
                        </View>
                    </ScrollView>
                    {status !== STATUS_HARD_FAIL &&
                    status !== STATUS_SOFT_FAIL &&
                    status !== STATUS_PASS &&
                    eligibilityStatus === ELIGIBILTY_STATUS_AMBER &&
                    state.isJointApplicantAdded ? (
                        <View style={Style.horizontalMargin}>
                            <FixedActionContainer>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={FA_VIEW_APPLICATION}
                                        />
                                    }
                                    style={Style.viewOtherBtn}
                                    onPress={onViewApplicationPress}
                                />
                            </FixedActionContainer>
                        </View>
                    ) : (
                        <></>
                    )}

                    {state.isApplyButtonFloating && status !== STATUS_HARD_FAIL && (
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={
                                    state.isJointApplicantAdded ? onMainApplyLoan : onApplyLoan
                                }
                            />
                        </FixedActionContainer>
                    )}
                </ScreenLayout>
            </ScreenContainer>

            {/* Tenure Overlay */}
            <TenureOverlay
                visible={state.showTenureOverlay}
                onDone={onTenureOverlayDone}
                onClose={onTenureOverlayClose}
                minValue={state.tenureMin}
                maxValue={state.tenureMax}
                value={state.tenure}
            />

            {/* Downpayment Overlay */}
            <DownpaymentOverlay
                visible={state.showDownpaymentOverlay}
                onDone={onDownpaymentOverlayDone}
                onClose={onDownpaymentOverlayClose}
                onChange={onDownpaymentChange}
                keypadValue={state.downpaymentOverlayKeypad}
                displayValue={state.downpaymentOverlayDisplay}
                isValid={state.downpaymentOverlayIsValid}
                errorMessage={state.downpaymentOverlayErrorMsg}
            />

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={state.isJointApplicantAdded ? EXIT_JA_POPUP_TITLE : EXIT_POPUP_TITLE}
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

            {/* Remove Joint Applicant Popup*/}
            <Popup
                visible={state.removeJointApplicant}
                onClose={onCloseRemoveJointApplicantPopup}
                title={REMOVE_JOINT_TITLE}
                description={REMOVE_JOINT_DESCRIPTION}
                primaryAction={{
                    text: REMOVE,
                    onPress: removeJointApplicantOnClick,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onCloseRemoveJointApplicantPopup,
                }}
            />

            {/* Offer Disclaimer popup */}
            <OfferDisclaimerPopup
                visible={state.showOfferDiscPopup}
                onClose={closeOfferDiscPopup}
            />

            {/* Req Assistance Success popup */}
            <Popup
                visible={state.showReqAssistSuccessPopup}
                title={state.popupTitle}
                description={state.popupDesc}
                onClose={closeReqAssistSuccessPopup}
                primaryAction={{
                    text: GOT_IT,
                    onPress: closeReqAssistSuccessPopup,
                }}
            />

            {/* Apply Loan Success popup */}
            <Popup
                visible={state.showApplySuccessPopup}
                title={APPLYSUCCPOPUP_TITLE}
                description={`${APPLY_SUCCESS_POPUP_SUBTITLE}\n\n${APPLYSUCCPOPUP_DESC}`}
                onClose={closeApplySuccessPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: onPressOkApplySuccessPopup,
                }}
            />
        </>
    );
}

CEResult.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

// Add Promo Row
function AddPromoRow({ onPress }) {
    return (
        <TouchableOpacity style={Style.addPromoContainer} onPress={onPress}>
            <View style={Style.addPromoInnerCont}>
                <Image
                    source={Assets.addPromoIcon}
                    style={Style.promoTagIcon}
                    resizeMode="contain"
                />

                <Typo textAlign="left" fontWeight="600" lineHeight={18} text="Add promo" />
            </View>

            <Image source={Assets.ic_Plus} style={Style.promoRowArrowIcon} resizeMode="contain" />
        </TouchableOpacity>
    );
}

function JointApplicantDetail({ jointApplicantInfo, removeOpenJointApplicant }) {
    const applicantName = jointApplicantInfo?.customerName ?? "";
    const profileImage = jointApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${jointApplicantInfo?.profilePicBase64}`
        : null;
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.jointApplicantHeader,
                Style.jointApplicanthorizontalMargin,
            ]}
        >
            <View style={Style.jointApplicantRow}>
                {/* Profile Logo */}

                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={Style.profileLogo}
                />
                {/* Joint Applicant Name */}
                <View style={Style.jointApplicantTile}>
                    <Typo
                        lineHeight={17}
                        textAlign="left"
                        fontWeight="400"
                        text={applicantName}
                        style={Style.jointApplicantName}
                    />
                    <Typo
                        lineHeight={18}
                        fontWeight="600"
                        text={REMOVE_JOINT_TITLE}
                        style={Style.jointApplicantStyle}
                        onPressText={removeOpenJointApplicant}
                    />
                </View>
            </View>
        </View>
    );
}

JointApplicantDetail.propTypes = {
    jointApplicantInfo: PropTypes.object,
    removeOpenJointApplicant: PropTypes.func,
};

AddPromoRow.propTypes = {
    onPress: PropTypes.func,
};

const Style = StyleSheet.create({
    JATile: {
        marginTop: 24,
    },
    TileBtn: {
        marginTop: 10,
    },
    addPromoContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 56,
        justifyContent: "space-between",
        marginBottom: 25,
        marginHorizontal: 24,
        marginTop: 6,
        padding: 18,
    },
    addPromoInnerCont: {
        flexDirection: "row",
    },

    additionalIncomeTile: {
        marginTop: 16,
    },
    applyBtn: {
        marginBottom: 24.1,
    },

    bottomMargin: {
        marginBottom: 30,
    },

    closeBtnCont: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

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

    jointApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    jointApplicantName: {
        marginBottom: 5,
        paddingLeft: 0,
    },

    jointApplicantRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
        width: "100%",
    },

    jointApplicantStyle: {
        fontSize: 14,
        marginBottom: 15,
        marginTop: 5,
        textDecorationColor: BLACK,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
    },

    jointApplicantTile: {
        marginLeft: 10,
    },

    jointApplicanthorizontalMargin: {
        marginHorizontal: 10,
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

    optionHeader: {
        marginTop: 10,
    },

    paddingLeft_15: {
        paddingLeft: 15,
    },
    profileLogo: {
        backgroundColor: IRISBLUE,
        borderColor: WHITE,
        borderRadius: 150 / 2,
        borderWidth: 2,
        height: 48,
        width: 48,
    },
    promoRowArrowIcon: {
        height: 24,
        marginLeft: 10,
        width: 24,
    },
    promoTagIcon: {
        height: 21,
        marginRight: 10,
        width: 21,
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
    toolbarContainer: (safeAreaInsetTop) => ({
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        width: "100%",
        zIndex: 1,
        top: 0,
        position: "absolute",
        paddingTop: safeAreaInsetTop,
        height: 70 + safeAreaInsetTop,
    }),
    viewOtherBtn: {
        marginBottom: 16,
    },
});

export default CEResult;

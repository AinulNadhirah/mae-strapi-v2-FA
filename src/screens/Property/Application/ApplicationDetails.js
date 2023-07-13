/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useState } from "react";
import { StyleSheet, Platform, View, ScrollView, Image } from "react-native";
import Share from "react-native-share";

import {
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
    APPLICATION_DETAILS,
    PROPERTY_DETAILS,
    CE_RESULT,
    CE_ADD_JA_DETAILS,
    CE_UNIT_SELECTION,
    CE_PROPERTY_NAME,
    LA_ELIGIBILITY_CONFIRM,
    LA_CANCEL,
    LA_RESULT,
    APPLICATION_DOCUMENT,
    CHAT_WINDOW,
    JA_PERSONAL_INFO,
    JA_ACCEPTANCE,
    CE_PROPERTY_SEARCH_LIST,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import {
    eligibilityCheck,
    getGroupChat,
    getUnlinkedMainApplicant,
    invokeL2,
    invokeL3,
    isExistingCustomer,
    removeJointApplicant,
} from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    GREY,
    FADE_GREY,
    DARK_GREY,
    WHITE,
    SEPARATOR,
    STATUS_GREEN,
    BLACK,
    RED,
    IRISBLUE,
    DISABLED,
} from "@constants/colors";
import {
    PROP_LA_INPUT,
    PROP_LA_RESULT,
    PROP_ELG_INPUT,
    PROP_ELG_RESULT,
    DT_ELG,
    DT_NOTELG,
    DT_RECOM,
} from "@constants/data";
import {
    PROPERTY_MDM_ERR,
    CONTINUE,
    APPLYSUCCPOPUP_TITLE,
    APPLYSUCCPOPUP_DESC,
    MONTHLY_INSTALMENT_INFO,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_OPEN_MENU,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_SELECT_MENU,
    COMMON_ERROR_MSG,
    CONFIRM,
    CANCEL,
    PROPERTY_APPLICATION_DETAILS,
    REMOVE_JOINT_TITLE,
    NO_NOTIFY_JOINTAPPLICANT_TITLE,
    NOTIFY_JOINT_APPLICANT_DESC,
    CONNECT_SALES_REP_TEXT,
    REMIND_JOINT_APPLICANT,
    REMOVE_JOINT_DESCRIPTION,
    REMOVE,
    OKAY,
    YOUR_MAIN_APPLICANT,
    SALES_REPRESENTTATIVE,
    YOUR_JOINT_APPLICANT,
    VIEW_OR_MANAGE_TEXT,
    PUBLIC_SECTOR_FINANC_TEXT,
    ADDITIONAL_FINANCING_INFO_TEXT,
    ELIGIBILY_CHECK_EXPIRY_TEXT,
    BANK_SELLING_TEXT,
    BANK_SELLING_TITLE,
    PROPERTY_APPLICATION_DETAILS_TEXT,
    VIEW_PROPERTY,
    FA_MESSAGE_SALES,
    FA_REMOVE_JOINT_APPLICANT,
    FA_CALL_SALES_ASSISTANCE,
    JA_VIEW,
    MA_VIEW,
    HER,
    HIS,
} from "@constants/strings";

import { getShadow, contactBankcall } from "@utils/dataModel/utility";

import Assets from "@assets";

import ActionTile from "../Common/ActionTile";
import DetailField from "../Common/DetailField";
import {
    getMasterData,
    getMDMData,
    fetchCCRISReport,
    getEncValue,
    getJAButtonEnabled,
    fetchRFASwitchStatus,
    getExistingData,
} from "../Common/PropertyController";
import { isAgeEligible, getEligibilityBasicNavParams } from "../Eligibility/CEController";
import { getJEligibilityBasicNavParams } from "../JointApplicant/JAController";
import { fetchGetApplicants, prequalCheckAPI } from "./LAController";
import VerticalStepper from "./VerticalStepper";

// NOTE: DO NOT REMOVE BELOW CONSTANTS EVEN IF THEY ARE UNUSED. ADDED FOR INFORMATION PURPOSE.

// Valid "stage" values
const STG_ELIGIBILITY = "ELIGIBILITY";
const STG_LOANAPP = "LOANAPP";
const STG_ACCEPTANCE = "ACCEPTANCE";
const STG_LEGALDOC = "LEGALDOC";
const STG_DISBURSE = "DISBURSE";

// Possible "status" values
const ELIGEXP = "ELIGEXP"; // Eligibility check expired
const REMOVED = "Y"; // Removed the application
const CANCELLED = "CANCELLED"; // Cancelled the loan application
const LOANSUB = "LOANSUB"; // Loan submitted
const mainInfo = "J";
const jointInfo = "M";

// Financing Type values, either islamic or conventional
const FIN_CONVENTIONAL = "conventional";

// Initial state object
const initialState = {
    // Common UI
    propertyName: "",
    unitTypeName: null,
    statusText: "",
    statusColor: STATUS_GREEN,
    showUnitNumber: false,
    unitNumber: "",
    stepperData: [],
    startDate: null,
    updatedDate: null,
    loanAmountLabel: "Property financing amount",
    interestRateLabel: "Effective profit rate",
    tenureLabel: "Financing period",
    bankSellingPrice: "",

    // Common Functionality
    isResultStatus: false,
    progressStatus: null,
    isCancelled: false,
    isRemoved: false,
    isExpired: false,
    isJointApplicant: false,
    isMainApplicant: false,
    infoPopup: false,
    infoPopupTitle: "",
    infoPopupDesc: "",
    expiryDate: null,

    // Loan Details
    loanAmount: "-",
    interestRate: "-",
    interestRateSubText1: null,
    interestRateSubText2: null,
    tenure: "-",
    monthlyInstalment: "-",
    propertyPrice: "-",
    downpayment: "-",
    financingTypeTitle: "",
    financingPlanTitle: "",
    monthlyInfoNote: MONTHLY_INSTALMENT_INFO,
    breakDownLabel: "Loan breakdown",
    totalLoanAmount: "-",
    propertyAmount: "-",
    otherRelatedExpenses: "-",
    fullDataEntryIndicator: false,
    publicSectorNameFinance: false,

    // Top Menu related
    showTopMenuIcon: true,
    showTopMenu: false,
    topMenuData: [],
    agentInfo: null,
    mainApplicantInfo: null,
    jointApplicantInfo: null,

    // Bottom CTA related
    ctaText: CONTINUE,
    showCTA: false,

    // Others
    reloadList: false,
    showApplySuccessPopup: false,
    loading: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_DETAILS":
        case "SET_INIT_DATA":
            return {
                ...state,
                ...payload,
            };
        case "SHOW_TOP_MENU":
            return {
                ...state,
                showTopMenu: payload,
            };
        case "SET_RELOAD_LIST":
            return {
                ...state,
                reloadList: payload,
            };
        case "SHOW_APPLY_SUCCESS_POPUP":
            return {
                ...state,
                showApplySuccessPopup: payload,
            };
        case "SHOW_INFO_POPUP":
            return {
                ...state,
                infoPopup: payload?.infoPopup,
                infoPopupTitle: payload?.infoPopupTitle,
                infoPopupDesc: payload?.infoPopupDesc,
            };
        case "SHOW_REMOVE_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                removeJointApplicant: payload?.removeJointApplicant,
            };
        case "SHOW_REMIND_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                remindJointApplicant: payload?.remindJointApplicant,
            };
        case "SET_AGENT_INFO":
            return {
                ...state,
                agentInfo: payload,
            };
        case "SET_MAIN_APPLICANT_INFO":
            return {
                ...state,
                mainApplicantInfo: payload,
            };
        case "SET_JOINT_APPLICANT_INFO":
            return {
                ...state,
                jointApplicantInfo: payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        default:
            return { ...state };
    }
}

function ApplicationDetails({ route, navigation }) {
    const { getModel } = useModelController();
    const [state, dispatch] = useReducer(reducer, initialState);
    const stpApplicationId = route?.params?.savedData?.stpApplicationId ?? "";
    const wolocStatus = route?.params?.savedData?.wolocStatus ?? false;
    const {
        progressStatus,
        showCTA,
        isCancelled,
        isRemoved,
        isExpired,
        isJointApplicant,
        isMainApplicant,
        showTopMenuIcon,
        agentInfo,
        mainApplicantInfo,
        jointApplicantInfo,
        fullDataEntryIndicator,
        loading,
    } = state;
    const [currentStage, setCurrentStage] = useState("");
    useEffect(() => {
        init();
    }, []);

    // Navigation params change handler
    useEffect(() => {
        const reload = route?.params?.reload;
        if (reload) {
            // Reload UI state if navigation params have changed
            prepopulateData();

            // Reset reload param
            navigation.setParams({
                reload: null,
            });

            // Set reload list flag
            dispatch({
                actionType: "SET_RELOAD_LIST",
                payload: true,
            });
        }
    }, [route.params]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
        });
    }, [stpApplicationId]);

    function init() {
        console.log("[ApplicationDetails] >> [init]");

        // Populate data on UI
        prepopulateData();
    }

    function onBackTap() {
        console.log("[ApplicationDetails] >> [onBackTap]");

        const from = route.params?.from;

        if (from !== LA_RESULT) {
            // Navigate to Property Dashboard page - Application tab
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
                params: {
                    activeTabIndex: 1,
                    reload: true,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    async function prepopulateData() {
        console.log("[ApplicationDetails] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const progressStatus = savedData?.progressStatus;
        const eligibilityStatus = savedData?.eligibilityStatus;
        const status = savedData?.status;
        const statusRemoved = savedData?.isRemoved;
        const updatedDateRaw = savedData?.updatedDate;
        const createdDateRaw = savedData?.createdDate;
        const statusOrder = savedData?.statusOrder;
        const isInActive =
            status === ELIGEXP ||
            status === CANCELLED ||
            statusRemoved === REMOVED ||
            statusOrder === 3;
        const isPropertyListed = savedData?.isPropertyListed;
        const isAccepted = savedData?.isAccepted;
        const isRemind = savedData?.isRemind;

        const { showCTA, ctaText } = await getCTADetails(
            status,
            progressStatus,
            eligibilityStatus,
            navParams?.jointApplicantDetails,
            navParams?.currentUser
        );

        // Header details
        const propertyName = savedData?.propertyName;
        const unitTypeName = savedData?.unitTypeName;
        const unitNumber = savedData?.unitNo;
        const financingType = savedData?.financingType ?? null;
        const { statusText, statusColor } = getStatusDetails(isInActive);
        const { startDate, updatedDate } = getDates(createdDateRaw, updatedDateRaw);
        // expiryDate = propertyDetails?.expiry_date;

        // Loan details
        const dataType = savedData?.dataType;
        const isResultStatus = dataType === "Eligible" || dataType === "Recomendation";
        const interestRate = savedData?.interestRate
            ? `${parseFloat(savedData.interestRate).toFixed(2)}% p.a`
            : "-";
        const baseRate = savedData?.baseRate
            ? `${parseFloat(savedData?.baseRate).toFixed(2)}%`
            : null;
        const spreadRate = savedData?.spreadRate
            ? `${parseFloat(savedData?.spreadRate).toFixed(2)}%`
            : null;
        const savedPublicSectorNameFinance = savedData?.publicSectorNameFinance;
        const publicSectorNameFinance =
            savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y";

        const loanAmountRaw = savedData?.loanAmountRaw;
        let loanAmount = loanAmountRaw ? `RM ${numeral(loanAmountRaw).format("0,0.00")}` : "-";

        const monthlyInstalmentRaw = savedData?.monthlyInstalmentRaw;
        const monthlyInstalment = monthlyInstalmentRaw
            ? `RM ${numeral(monthlyInstalmentRaw).format("0,0.00")}`
            : "-";

        const propertyPriceRaw = savedData?.propertyPriceRaw;
        const propertyPrice = propertyPriceRaw
            ? `RM ${numeral(propertyPriceRaw).format("0,0.00")}`
            : "-";

        const savedTenure = savedData?.tenure ? `${savedData.tenure} years` : "-";
        const recommendedTenure = savedData?.recommendedTenure
            ? `${savedData.recommendedTenure} years`
            : "-";
        const tenure = isResultStatus ? recommendedTenure : savedTenure;

        const savedDownpaymentRaw = savedData?.downPaymentAmountRaw;
        const savedDownpayment = savedDownpaymentRaw
            ? `RM ${numeral(savedDownpaymentRaw).format("0,0.00")}`
            : "-";

        const recommendedDownPaymentRaw = savedData?.recommendedDownpaymentRaw ?? "-";
        const recommendedDownPayment = recommendedDownPaymentRaw
            ? `RM ${numeral(recommendedDownPaymentRaw).format("0,0.00")}`
            : "-";

        const downpayment = isResultStatus ? recommendedDownPayment : savedDownpayment;
        const bankSellingPriceRaw = savedData?.bankSellingPrice ?? "";
        const bankSellingPrice = getBankSellingPrice(financingType, bankSellingPriceRaw);

        const financingTypeTitle = savedData?.financingTypeTitle ?? "";
        const financingPlanTitle = savedData?.financingPlanTitle ?? "";

        /* if full data entry is done at sales force */
        const fullDataEntryIndicator = savedData?.fullDataEntryIndicator ?? null;
        const totalLoanAmountRaw = savedData?.totalLoanAmount ?? null;
        const otherRelatedExpensesRaw = savedData?.otherRelatedExpenses ?? null;
        const totalLoanAmount = totalLoanAmountRaw
            ? `RM ${numeral(totalLoanAmountRaw).format("0,0.00")}`
            : "-";
        const otherRelatedExpenses = otherRelatedExpensesRaw
            ? `RM ${numeral(otherRelatedExpensesRaw).format("0,0.00")}`
            : "-";
        let loanAmountLabel = state.loanAmountLabel;
        let propertyAmount = state.propertyAmount;
        let breakDownLabel = state.breakDownLabel;
        let monthlyInfoNote = state.monthlyInfoNote;
        if (fullDataEntryIndicator === "Y") {
            loanAmountLabel =
                financingType === FIN_CONVENTIONAL ? "Total loan amount" : "Total financing amount";
            breakDownLabel =
                financingType === FIN_CONVENTIONAL ? "Loan breakdown" : "Financing breakdown";
            monthlyInfoNote = null;
            propertyAmount = loanAmount;
            loanAmount = totalLoanAmount;
        } else {
            loanAmountLabel =
                financingType === FIN_CONVENTIONAL
                    ? "Property loan amount"
                    : "Property financing amount";
        }
        const interestRateLabel =
            financingType === FIN_CONVENTIONAL
                ? "Effective interest rate"
                : "Effective profit rate";
        const tenureLabel = financingType === FIN_CONVENTIONAL ? "Loan period" : "Financing period";

        // Get Top Menu data
        const menuData = getTopMenuData({
            status,
            statusRemoved,
            isPropertyListed,
            propertyDetails,
            progressStatus,
        });

        const baseRateLabel = savedData?.baseRateLabel ?? "Base rate";

        // Retrieve stepper data
        const stepperData = massageStepperData();

        //agent info
        const agentInfo = savedData?.agentInfo ?? null;

        //main info
        const mainApplicantInfo = navParams?.mainApplicantDetails ?? null;

        //joint info
        const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

        // Set Header Details
        dispatch({
            actionType: "SET_HEADER_DETAILS",
            payload: {
                propertyName,
                unitTypeName,
                showUnitNumber:
                    progressStatus === PROP_LA_INPUT ||
                    progressStatus === PROP_LA_RESULT ||
                    (progressStatus === PROP_ELG_RESULT && navParams?.currentUser === "J"),
                unitNumber,
                statusText,
                statusColor,
                startDate,
                updatedDate,
                loanAmountLabel,
                breakDownLabel,
                monthlyInfoNote,
                interestRateLabel,
                tenureLabel,
                isJointApplicant: mainInfo === navParams?.currentUser,
                isMainApplicant: jointInfo === navParams?.currentUser,
                isAccepted,
                isRemind,
            },
        });

        // Set Loan Details
        dispatch({
            actionType: "SET_INIT_DATA",
            payload: {
                // Loan Details
                loanAmount,
                interestRate,
                interestRateSubText1: baseRate ? `${baseRateLabel}: ${baseRate}` : null,
                interestRateSubText2: spreadRate ? `Spread: ${spreadRate}` : null,
                tenure,
                monthlyInstalment,
                propertyPrice,
                downpayment,
                bankSellingPrice,
                financingTypeTitle,
                financingPlanTitle,
                totalLoanAmount,
                propertyAmount,
                otherRelatedExpenses,
                fullDataEntryIndicator: fullDataEntryIndicator === "Y" ? true : false,
                publicSectorNameFinance,

                // Common
                isResultStatus,
                progressStatus,
                isCancelled: status === CANCELLED,
                isExpired: status === ELIGEXP,
                isRemoved: statusRemoved === REMOVED,

                // CTA related
                ctaText,
                showCTA: !isInActive && showCTA,

                // Top Menu related
                showTopMenuIcon: !!menuData && statusRemoved !== REMOVED,
                topMenuData: menuData,

                // Stepper
                stepperData,
            },
        });

        // Set Agent info
        if (agentInfo) {
            dispatch({
                actionType: "SET_AGENT_INFO",
                payload: agentInfo,
            });
        }

        // Set Main info
        if (mainApplicantInfo) {
            dispatch({
                actionType: "SET_MAIN_APPLICANT_INFO",
                payload: mainApplicantInfo,
            });
        }

        // Set Joint info
        if (jointApplicantInfo) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT_INFO",
                payload: jointApplicantInfo,
            });
        }

        if (savedData?.isRemoved || savedData?.isCancelled) {
            const encSyncId = await getEncValue(navParams?.syncId);
            const httpResp = await getUnlinkedMainApplicant(encSyncId, true).catch((error) => {
                console.log("[ApplicationDetails][prepopulateData] >> Exception: ", error);
            });

            const result = httpResp?.data?.result ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? null;
            const mainApplicantDetails = result?.mainApplicant ?? null;
            const currentUser = result?.currentUser ?? null;

            if (mainApplicantDetails) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT_INFO",
                    payload: mainApplicantDetails,
                });
            }

            // Set Header Details
            if (currentUser === "J") {
                dispatch({
                    actionType: "SET_HEADER_DETAILS",
                    payload: {
                        isJointApplicant: true,
                    },
                });
            }

            if (currentUser === "J") {
                dispatch({
                    actionType: "SET_HEADER_DETAILS",
                    payload: {
                        isMainApplicant: false,
                    },
                });
            }

            if (!statusCode === "0000") {
                setLoading(false);
                // Show error message
                showErrorToast({ message: statusDesc });
                return;
            }
        }

        setLoading(false);
    }

    function getDates(stDate = "", updDate = "") {
        console.log("[ApplicationDetails] >> [getDates]");

        const startDate = moment(stDate).format("DD MMM YYYY, h:mm a");
        const updatedDate = moment(updDate).format("DD MMM YYYY");

        return { startDate, updatedDate };
    }

    function getStatusDetails(isInActive) {
        console.log("[ApplicationDetails] >> [getStatusDetails]");

        return {
            statusText: isInActive ? "Inactive" : "Active",
            statusColor: isInActive ? FADE_GREY : STATUS_GREEN,
        };
    }

    async function getCTADetails(
        status,
        progressStatus,
        eligibilityStatus,
        jointApplicantInfo,
        currentUser
    ) {
        console.log("[ApplicationDetails] >> [getCTADetails]");

        let ctaText = CONTINUE;
        const isJointApplicant = currentUser === "J" ? true : false;
        let showCTA =
            (progressStatus === PROP_ELG_INPUT && jointApplicantInfo === null) ||
            (progressStatus === PROP_ELG_RESULT && status !== "INPROGRESS") ||
            progressStatus === PROP_LA_INPUT;

        if (isJointApplicant) {
            showCTA = false;
        }

        if (status === "INPROGRESS" && jointApplicantInfo?.customerId && isJointApplicant) {
            showCTA = true;
        }

        //BAU CASE
        if (eligibilityStatus === "AMBER" && status === LOANSUB) {
            showCTA = false;
        }

        if ((isCancelled && wolocStatus) || (isExpired && wolocStatus)) {
            showCTA = false;
        }

        if (progressStatus === PROP_ELG_RESULT && jointApplicantInfo?.customerId)
            ctaText = eligibilityStatus === "AMBER" ? "Proceed" : "Apply now";
        return { showCTA, ctaText };
    }

    function getBankSellingPrice(financingType, bankSellingPriceRaw) {
        if (bankSellingPriceRaw) {
            return !isNaN(bankSellingPriceRaw)
                ? `RM ${numeral(bankSellingPriceRaw).format("0,0.00")}`
                : "";
        } else {
            return "";
        }
    }

    function massageStepperData() {
        console.log("[ApplicationDetails] >> [massageStepperData]");

        const savedData = route?.params?.savedData ?? {};
        const stageArray = savedData?.stage ?? [];
        const statusColor = (() => {
            if (savedData?.statusColor === "Y") return YELLOW;
            else if (savedData?.statusColor === "G") return STATUS_GREEN;
            else if (savedData?.statusColor === "R") return RED;
            else return GREY;
        })();
        const { currentStageIndex } = stageArray.reduce(
            (value, item, index) => {
                if (item?.isActiveStage === "Y") {
                    setCurrentStage(item?.stage);
                    return {
                        currentStageIndex: index,
                    };
                } else {
                    return { ...value };
                }
            },
            { currentStageIndex: null }
        );

        //const isLoanSubmissionDone = savedData?.status === LOANSUB;
        const financingType = savedData?.financingType ?? null;

        const defaultStepperObj = [
            {
                title: "Eligibility checking",
                titleColor: DARK_GREY,
                description: null,
                stage: STG_ELIGIBILITY,
            },
            {
                title:
                    financingType === FIN_CONVENTIONAL
                        ? "Loan application"
                        : "Financing application",
                titleColor: DARK_GREY,
                description: null,
                stage: STG_LOANAPP,
            },
            {
                title:
                    financingType === FIN_CONVENTIONAL ? "Loan acceptance" : "Financing acceptance",
                titleColor: DARK_GREY,
                description: null,
                stage: STG_ACCEPTANCE,
            },
            {
                title: "Legal documentation",
                titleColor: DARK_GREY,
                description: null,
                stage: STG_LEGALDOC,
            },
            {
                title:
                    financingType === FIN_CONVENTIONAL
                        ? "Loan disbursement"
                        : "Financing disbursement",
                titleColor: DARK_GREY,
                description: null,
                stage: STG_DISBURSE,
            },
        ];

        const updatedStepperObj = defaultStepperObj.map((item, index) => {
            const titleColor = index <= currentStageIndex ? BLACK : item.titleColor;
            let color = item.color;
            let description;
            if (
                stageArray?.[index]?.stage === "ELIGIBILITY" &&
                isMainApplicant &&
                jointApplicantInfo.customerId !== null
            ) {
                description = savedData?.statusMessage;
            } else {
                description = stageArray?.[index]?.stageDesc ?? null;
            }

            color = (() => {
                if (index < currentStageIndex) return STATUS_GREEN;
                else if (index === currentStageIndex) return statusColor;
                else return GREY;
            })();

            if (index > currentStageIndex) description = null;

            return {
                ...item,
                titleColor,
                color,
                description: description === "" ? null : description,
                number: String(index + 1),
                isLastItem: index === defaultStepperObj.length - 1,
            };
        });

        return updatedStepperObj;
    }

    function getTopMenuData({
        status,
        isPropertyListed,
        propertyDetails,
        progressStatus,
        statusRemoved,
    }) {
        console.log("[ApplicationDetails] >> [getTopMenuData]");

        const menuData = [];

        // Applicable only for listed properties.
        if (isPropertyListed === "Y" && propertyDetails)
            menuData.push({
                menuLabel: "View Property",
                menuParam: "VIEW_PROPERTY",
            });
        // Applicable only for Active applications.
        if (
            status !== ELIGEXP &&
            status !== CANCELLED &&
            statusRemoved !== REMOVED &&
            route?.params?.currentUser !== "J"
        )
            menuData.push({
                menuLabel:
                    progressStatus === PROP_ELG_INPUT || progressStatus === PROP_ELG_RESULT
                        ? "Remove eligibility"
                        : "Cancel Application",
                menuParam: "CANCEL_REMOVE",
            });

        return menuData.length ? menuData : null;
    }

    function showMenu() {
        console.log("[ApplicationDetails] >> [showMenu]");

        // Show Menu
        dispatch({
            actionType: "SHOW_TOP_MENU",
            payload: true,
        });

        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
        });
    }

    function closeTopMenu() {
        console.log("[ApplicationDetails] >> [closeTopMenu]");

        // Hide Menu
        dispatch({
            actionType: "SHOW_TOP_MENU",
            payload: false,
        });
    }

    function onTopMenuItemPress(param) {
        console.log("[ApplicationDetails] >> [onTopMenuItemPress]");

        // Hide menu
        closeTopMenu();

        // Need this delay as the popup is not opening instantly due to the TOP MENU being open
        setTimeout(() => {
            switch (param) {
                case "VIEW_PROPERTY":
                    onViewProperty();
                    break;
                case "CANCEL_REMOVE":
                    onCancelApplication();
                    break;
                default:
                    break;
            }
        }, 200);
    }

    async function onCancelApplication() {
        console.log("[ApplicationDetails] >> [onCancelApplication]");

        setLoading(true);

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        const navParams = route?.params ?? {};
        const deleteRecord =
            progressStatus === PROP_ELG_INPUT || progressStatus === PROP_ELG_RESULT ? "Y" : "N";
        navigation.pop();
        // Navigate to Cancellation screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CANCEL,
            params: {
                ...navParams,
                deleteRecord,
            },
        });

        setLoading(false);

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS_TEXT,
            [FA_ACTION_NAME]: state.topMenuData?.[1]?.menuLabel, // different label name based on logic
        });
    }

    async function onViewProperty() {
        console.log("[ApplicationDetails] >> [onViewProperty]");
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        // Navigate to Property details page
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyDetail: propertyDetails,
                latitude,
                longitude,
                from: APPLICATION_DETAILS,
            },
        });

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS_TEXT,
            [FA_ACTION_NAME]: VIEW_PROPERTY,
        });
    }

    async function onViewDocuments() {
        console.log("[ApplicationDetails] >> [onViewDocuments]");

        setLoading(true);

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLICATION_DOCUMENT,
            navigation,
            params: {
                ...route.params,
            },
        });

        setLoading(false);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            [FA_ACTION_NAME]: VIEW_PROPERTY,
        });
    }

    async function resumeLAInputFlow() {
        console.log("[ApplicationDetails] >> [resumeLAInputFlow]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const syncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(syncId);

        setLoading(true);

        const isJointApplicantAdded = jointApplicantInfo?.customerId ? true : false;

        // Call prequal API
        const prequalResponseObj = await prequalCheckAPI(encSyncId, isJointApplicantAdded);
        const eligibilityStatus = prequalResponseObj.status;
        const onboardingInd = prequalResponseObj.onboardingInd;
        //if onboardingInd is Y then start New AIP flow BAU
        if (eligibilityStatus === "AMBER" && onboardingInd !== "Y") {
            setLoading(false);
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });
            return;
        }

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        // Prefetch required data
        let masterData = null;
        let mdmData = null;
        try {
            masterData = await getMasterData(false);
            mdmData = await getMDMData(false);
        } catch (error) {
            showErrorToast({ message: COMMON_ERROR_MSG });
            return;
        }

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            setLoading(false);
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        const propertyId = navParams?.propertyDetails?.property_id ?? "";

        // Request for CCRIS report
        const ccrisReqParams = {
            propertyId,
            progressStatus: PROP_LA_INPUT,
            syncId: encSyncId,
        };
        const { success, errorMessage } = await fetchCCRISReport(ccrisReqParams);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const params = await getCEResultNavParams();

        // Navigate to Eligibility confirm screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_ELIGIBILITY_CONFIRM,
            params: {
                ...params,
                masterData,
                mdmData,
                age,
                eligibilityStatus,

                // Resume specific params
                resumeFlow: true,
                savedData,
            },
        });

        setLoading(false);
    }

    async function routeToResultScreen() {
        console.log("[ApplicationDetails] >> [onViewDocuments]");
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

        // Construct Nav Params
        const params = await getCEResultNavParams();
        params.isJAButtonEnabled = result;
        params.isRFAButtonEnabled = response;

        // Navigate to Eligibility result screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params,
        });
    }

    async function routeToCEAddJADetails() {
        console.log("[ApplicationDetails] >> [onViewDocuments]");

        // Construct Nav Params
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
        navParams.isMainEligDataType = navParams?.savedData?.dataType;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_DETAILS,
            params: {
                ...navParams,
                masterData,
                mdmData,
            },
        });
    }

    async function getCEResultNavParams() {
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const savedData = navParams?.savedData ?? {};
        const { age } = await isAgeEligible(savedData?.dob);
        const baseRateLabel = savedData?.baseRateLabel ?? "Base rate";

        return {
            ...savedData,

            // Common
            latitude,
            longitude,
            propertyDetails,
            age,
            syncId: navParams?.syncId,
            baseRateLabel,
            jointApplicantDetails: jointApplicantInfo,
            mainApplicantDetails: mainApplicantInfo,
            isJointApplicantAdded: jointApplicantInfo?.customerId ? true : false,
            isMainApplicant,
            isAccepted: savedData?.isAccepted,

            // Property Data
            propertyId: propertyDetails?.property_id ?? "",
            propertyName: state.propertyName,

            // Input Data
            propertyPrice: savedData?.propertyPriceRaw,
            origDownPaymentAmount: savedData?.downPaymentAmount,
            downPaymentAmount: savedData?.downPaymentAmountRaw,
            loanAmount: savedData?.loanAmountRaw,
            tenure: savedData?.tenure,
            spouseIncome: savedData?.spouseIncomeRaw,
            grossIncome: savedData?.grossIncomeRaw,
            housingLoan: savedData?.housingLoan,
            personalLoan: savedData?.personalLoanRaw,
            ccRepayments: savedData?.ccRepaymentsRaw,
            carLoan: savedData?.carLoanRaw,
            overdraft: savedData?.overdraft,
            nonBankCommitments: savedData?.nonBankCommitmentsRaw,

            // Result Data
            eligibilityResult: {
                dataType: savedData?.dataType,
                aipAmount: savedData?.loanAmountRaw,
                interestRate: savedData?.interestRate,
                tenure: savedData?.recommendedTenure,
                recommendedDownPayment: savedData?.recommendedDownpaymentRaw,
                installmentAmount: savedData?.monthlyInstalmentRaw,
                baseRate: savedData?.baseRate,
                spreadRate: savedData?.spreadRate,
                minTenure: savedData?.minTenure,
                maxTenure: savedData?.maxTenure,
                publicSectorNameFinance: savedData?.publicSectorNameFinance,
            },
            aipAmount: savedData?.loanAmountRaw,
            recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
            installmentAmount: savedData?.monthlyInstalmentRaw,
            monthlyInstalment: savedData?.monthlyInstalmentRaw,
            stpApplicationId: savedData?.stpApplicationId,
            origLoanAmount: savedData?.origLoanAmount,
            origTenure: savedData?.origTenure,
            currentScreenName: jointApplicantInfo?.customerId ? JA_VIEW : MA_VIEW,
            agentId: agentInfo?.pf_id,
            salesRepRequest: savedData?.isReqAsst,
            isFirstTimeBuyHomeIndc: savedData?.isFirstTimeBuyHomeIndc ?? "",
        };
    }

    async function resumeCEInputFlow() {
        console.log("[ApplicationDetails] >> [resumeCEInputFlow]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const savedData = navParams?.savedData ?? {};
        const syncId = navParams?.syncId;

        // L2 call to invoke login page
        const { isPostLogin, isPostPassword } = getModel("auth");
        if (!isPostPassword && !isPostLogin) {
            try {
                const httpResp = await invokeL2(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }

        // Prefetch required data
        const masterData = await getMasterData(true);
        const mdmData = await getMDMData(true);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const propertyName = propertyDetails?.property_name ?? "";
        const basicNavParams = getEligibilityBasicNavParams({
            propertyName,
            propertyDetails,
            masterData,
            mdmData,
            age,
            latitude,
            longitude,
        });

        const screenName =
            basicNavParams?.isPropertyListed === "Y"
                ? CE_UNIT_SELECTION
                : navParams?.propertyDetails != null
                ? CE_PROPERTY_NAME
                : CE_PROPERTY_SEARCH_LIST;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: screenName,
            params: {
                // Original params
                ...basicNavParams,
                propertyName,
                // Resume specific params
                resumeFlow: true,
                savedData,
                syncId,
                from: APPLICATION_DETAILS,
            },
        });
    }

    async function resumeJAFlow() {
        console.log("[ApplicationDetails] >> [resumeJAFlow]");

        const propertyData = route?.params?.propertyDetails ?? {};
        const { JAAcceptance } = getModel("property");
        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";
        const saveData = route?.params?.savedData ?? {};
        const syncId = route?.params?.syncId;

        // L2 call to invoke login page
        const { isPostLogin, isPostPassword } = getModel("auth");
        if (!isPostPassword && !isPostLogin) {
            try {
                const httpResp = await invokeL2(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }

        // Prefetch required data
        const masterData = await getMasterData(true);
        const mdmData = await getMDMData(true);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }
        const navParams = getJEligibilityBasicNavParams({
            masterData,
            mdmData,
            propertyData,
            saveData,
            latitude,
            longitude,
        });
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JAAcceptance ? JA_PERSONAL_INFO : JA_ACCEPTANCE,
            params: {
                ...navParams,
                syncId,
            },
        });
    }

    function closeApplySuccessPopup() {
        console.log("[ApplicationDetails] >> [closeApplySuccessPopup]");

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        console.log("[ApplicationDetails] >> [onContinue]");
        const { isPostPassword } = getModel("auth");
        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const isActive = savedData?.isActive;
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }
        switch (progressStatus) {
            case PROP_ELG_INPUT: {
                // Resume Check Eligibility input flow
                if (isJointApplicant) {
                    resumeJAFlow();
                } else {
                    resumeCEInputFlow();
                }
                break;
            }
            case PROP_ELG_RESULT:
                // Redirect user to Eligibility result screen
                if (isActive === "W") {
                    routeToCEAddJADetails();
                } else {
                    routeToResultScreen();
                }
                break;
            case PROP_LA_INPUT:
                // Resume Loan Application Input Flow
                resumeLAInputFlow();
                break;
            case PROP_LA_RESULT:
                // TODO: Redirect to Loan Application result screen
                break;
            default:
                break;
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            [FA_ACTION_NAME]: state.ctaText,
        });
    }

    function onPressCall() {
        console.log("[ApplicationDetails] >> [onPressCall]");

        const mobileNo = agentInfo?.mobile_no ?? "";
        if (mobileNo) {
            contactBankcall(mobileNo);
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            [FA_ACTION_NAME]: FA_CALL_SALES_ASSISTANCE,
        });
    }

    async function onPressMessage() {
        console.log("[ApplicationDetails] >> [onPressMessage]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const propertyId = propertyDetails?.property_id;
        const stpId = navParams?.savedData?.stpApplicationId;
        const operatorId = agentInfo?.pf_id;
        const syncId = navParams?.syncId;
        const encSyncId = await getEncValue(syncId);

        const params = {
            propertyId,
            stpId,
            operatorId,
            syncId: encSyncId,
            groupChatIndicator: "CREATE_CHAT",
        };

        const httpResp = await getGroupChat(params, false).catch((error) => {
            console.log("[ApplicationDetails][getGroupChat] >> Exception: ", error);
        });

        const result = httpResp?.data?.result ?? {};
        const url = result?.url + "?token=" + result?.token;

        const showGroupCoApplicant = isJointApplicant
            ? result?.mainCustomerName
            : navParams?.savedData?.isAccepted
            ? result?.jointCustomerName
            : "";

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CHAT_WINDOW,
            params: {
                chatUrl: url,
                syncId,
                stpId,
                currentUser: route?.params?.currentUser,
                mainApplicantDetails: navParams?.mainApplicantDetails ?? null,
                jointApplicantDetails: navParams?.jointApplicantDetails ?? null,
                propertyName: propertyDetails?.property_name
                    ? propertyDetails?.property_name
                    : navParams?.savedData?.propertyName,
                salesPersonName: agentInfo?.name,
                salesPersonMobileNo: agentInfo?.mobile_no,
                propertyPrice:
                    navParams?.savedData?.propertyPrice ?? navParams?.savedData?.propertyPriceRaw,
                showGroupCoApplicant,
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            [FA_ACTION_NAME]: FA_MESSAGE_SALES,
        });
    }

    const onBankSellingIconPress = () => {
        console.log("[ApplicationDetails] >> [onBankSellingIconPress]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: true,
                infoPopupTitle: BANK_SELLING_TITLE,
                infoPopupDesc: BANK_SELLING_TEXT,
            },
        });
    };

    const onCloseInfoPopup = () => {
        console.log("[ApplicationDetails] >> [onCloseInfoPopup]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: false,
                infoPopupTitle: "",
                infoPopupDesc: "",
            },
        });
    };

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

    const onOpenRemindJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMIND_JOINT_APPLICANT_POPUP",
            payload: {
                remindJointApplicant: true,
            },
        });
    };
    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    async function removeJointApplicantOnClick() {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            [FA_ACTION_NAME]: REMOVE_JOINT_TITLE,
        });
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const propertyId = propertyDetails?.property_id;
        const stpId = navParams?.savedData?.stpApplicationId;
        const operatorId = agentInfo?.pf_id;
        const syncId = navParams?.syncId;
        const encSyncId = await getEncValue(syncId);

        try {
            const httpResp = await removeJointApplicant(
                { syncId: await getEncValue(navParams?.syncId) },
                true
            );

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
                const formData = await getFormData(navParams);
                callEligibilityAPI(formData);
            }
        } catch (error) {
            showErrorToast({
                message: error.message,
            });
        }
    }

    async function getFormData(navParams) {
        const mdmData = await getMDMData(true);
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        return {
            gender: mdmData?.gender,
            idType: mdmData?.idType,
            mobileNoCtryCd: "+6",
            nationality: mdmData?.citizenship,
            residentStatus: mdmData?.residentStatus,
            maritalStatus: navParams?.savedData?.maritalStatus,
            religion: navParams?.savedData?.religion,
            address: [
                {
                    addressType: mdmData?.addressType,
                    addressLine1: mdmData?.addr1,
                    addressLine2: mdmData?.addr2,
                    addressLine3: mdmData?.addr3,
                    addressLine4: "",
                    postCode: mdmData?.postCode,
                    countryCode: mdmData?.country,
                    state: mdmData?.state,
                    email: "",
                },
            ],
            additionalIncome: [
                {
                    additionalIncomeSource: "",
                    additionalAmount: "",
                },
            ],
            grossIncome: navParams?.savedData?.grossIncomeRaw,
            spouseGrossIncome: navParams?.savedData?.spouseIncomeRaw,
            nonBankCommitment: navParams?.savedData?.nonBankCommitmentsRaw,
            education: navParams?.savedData?.education,
            employmentType: navParams?.savedData?.employmentStatus,
            occupation: mdmData?.occupation,
            occupationSector: mdmData?.occupationSector,
            nameOfEmployer: mdmData?.employerName,
            businessType: navParams?.savedData?.businessType,
            publicSectorNameFinance: null,
            title: navParams?.savedData?.title,
            downpayment: navParams?.savedData?.downPaymentAmount,
            loanFinancingAmountRM: navParams?.savedData?.origLoanAmount,
            loanTenure: navParams?.savedData?.origTenure,
            propertyId: navParams?.propertyDetails?.property_id,
            unitId: navParams?.savedData?.unitId,
            customerSegment: mdmData?.customerSegment,
            customerGroup: navParams?.savedData?.residentStatus,
            ocrisStpRefNo: navParams?.savedData?.stpApplicationId ?? "",
            syncId: encSyncId,
            isNonListed: navParams?.savedData?.isPropertyListed === "Y" ? "N" : "Y",

            // Below fields are added on 13/08/2021
            propertyPurchase: navParams?.savedData?.propertyPurchase,
            ongoingLoan: navParams?.savedData?.ongoingLoan,
            totalHouseCount: navParams?.savedData?.houseLoan ?? "",
            ccrisLoanCount: navParams?.savedData?.ccrisLoanCount ?? "",
            isCcrisReportAvailable: navParams?.savedData?.ccrisReportFlag ? "Y" : "N",
            bankCommitment: {
                housingLoan: navParams?.savedData?.housingLoan,
                personalLoanOrOtherTermLoan: navParams?.savedData?.personalLoanRaw,
                creditCardRepayment: navParams?.savedData?.ccRepaymentsRaw,
                carLoan: navParams?.savedData?.carLoanRaw,
                overdraft: navParams?.savedData?.overdraft,
            },
        };
    }

    async function callEligibilityAPI(params) {
        console.log("[ApplicationDetails] >> [callEligibilityAPI]");
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
        const httpResp = await eligibilityCheck(params, true).catch((error) => {
            console.log("[ApplicationDetails][eligibilityCheck] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.result?.statusCode ?? null;
        const stpId = httpResp?.data?.result?.stpId ?? null;
        const overallStatus = httpResp?.data?.result?.overallStatus ?? null;
        const eligibilityResult = httpResp?.data?.result?.eligibilityResult ?? null;
        const massagedResult = massageEligibilityResult(eligibilityResult);

        if (!statusCode === "0000") {
            setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }
        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails } =
            await fetchGetApplicants(params.syncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const navParams = await getEligiblityCEResultNavParams();
        navParams.isMainEligDataType = null;
        navParams.dataType = null;
        navParams.jaDataType = null;

        // Navigate to Eligibility result screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params: {
                ...navParams,
                stpApplicationId: stpId,
                eligibilityResult: massagedResult,
                eligibilityStatus: overallStatus,
                isEditFlow: null,
                editFlow: null,
                jointApplicantDetails,
                mainApplicantDetails,
                isJointApplicantAdded: false,
                isMainApplicant: true,
                isJARemoved: true,
                currentScreenName: "REMOVED_VIEW",
                isJAButtonEnabled: result,
                isRFAButtonEnabled: response,
            },
        });

        setLoading(false);
    }

    function massageEligibilityResult(result) {
        console.log("[ApplicationDetails] >> [massageEligibilityResult]");

        // For invalid response
        if (!(result instanceof Array)) return null;

        // For Eligible/NotEligible scenario
        if (
            result.length === 1 &&
            (result[0]?.dataType === DT_ELG || result[0]?.dataType === DT_NOTELG)
        )
            return result[0];

        // For Recommendation scenario
        let resultObj;
        result.some((item) => {
            const dataType = item?.dataType;
            if (dataType === DT_RECOM) {
                resultObj = item;
                return true;
            }

            return false;
        });

        return resultObj;
    }

    async function getEligiblityCEResultNavParams() {
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const savedData = navParams?.savedData ?? {};
        const { age } = await isAgeEligible(savedData?.dob);

        return {
            ...savedData,

            // Common
            latitude,
            longitude,
            propertyDetails,
            age,
            syncId: navParams?.syncId,

            // Property Data
            propertyId: propertyDetails?.property_id ?? "",
            propertyName: state.propertyName,

            // Input Data
            propertyPrice: savedData?.propertyPriceRaw,
            downPaymentAmount: savedData?.downPaymentAmountRaw,
            loanAmount: savedData?.loanAmountRaw,
            tenure: savedData?.tenure,
            spouseIncome: savedData?.spouseIncomeRaw,
            grossIncome: savedData?.grossIncomeRaw,
            housingLoan: savedData?.housingLoan,
            personalLoan: savedData?.personalLoanRaw,
            ccRepayments: savedData?.ccRepaymentsRaw,
            carLoan: savedData?.carLoanRaw,
            overdraft: savedData?.overdraft,
            nonBankCommitments: savedData?.nonBankCommitmentsRaw,

            aipAmount: savedData?.loanAmountRaw,
            recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
            installmentAmount: savedData?.monthlyInstalmentRaw,
            monthlyInstalment: savedData?.monthlyInstalmentRaw,
            stpApplicationId: savedData?.stpApplicationId,
        };
    }

    function closeNotifyJAPopup() {
        console.log("[ApplicationDetails] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_REMIND_JOINT_APPLICANT_POPUP",
            payload: {
                remindJointApplicant: false,
            },
        });
    }
    async function onNotifyJAPopupConfirm() {
        console.log("[ApplicationDetails] >> [onNotifyJAPopupConfirm]");
        const checkExistingCustomer = await isExistingCustomer(
            {
                syncId: await getEncValue(route.params?.syncId),
                idNumber: state?.jointApplicantInfo?.customerId,
                mobileNo: "",
            },
            false
        );
        // close popup
        closeNotifyJAPopup();
        const navParams = route?.params;
        const masterData = await getMasterData(false);
        const mdmData = await getMDMData(false);
        const savedData = navParams?.savedData;
        const mdmTitle = savedData?.title ?? mdmData?.title;
        const mdmGender = savedData?.gender ?? mdmData?.gender;
        const gender = mdmGender === "F" ? HER : HIS;

        const titleSelect = getExistingData(mdmTitle, masterData?.title);
        const titleName = titleSelect.name.includes("/")
            ? titleSelect.name.substring(0, titleSelect.name.indexOf("/") - 0)
            : titleSelect.name;
        const mainApplicantName = state?.mainApplicantInfo?.customerName;

        const deepLinkUrl = checkExistingCustomer?.data?.result?.maeAppUrl;
        const propertyName = state.propertyName;
        if (!deepLinkUrl) return;

        const shareMsg = `${titleName} ${mainApplicantName} has invited you to be a joint applicant for ${gender} mortgage application at ${propertyName} Please install MAE from App Store to proceed the loan application.`;
        const message = `${shareMsg}\n${deepLinkUrl}`;

        // Open native share window
        Share.open({
            message,
            subject: shareMsg,
        })
            .then(() => {
                console.log(
                    "[ApplicationDetails][onNotifyJAPopupConfirm] >> Link shared successfully."
                );
            })
            .catch((error) => {
                console.log("[ApplicationDetails][onNotifyJAPopupConfirm] >> Exception: ", error);
            });
    }
    function onNotifyJAPopupCancel() {
        console.log("[ApplicationDetails] >> [onNotifyJAPopupCancel]");

        // close popup
        closeNotifyJAPopup();
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
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={
                                showTopMenuIcon ? (
                                    <HeaderDotDotDotButton onPress={showMenu} />
                                ) : (
                                    <></>
                                )
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={20}
                    useSafeArea={showCTA}
                >
                    <>
                        <ScrollView>
                            <View style={Style.horizontalMargin}>
                                {/* Status Pill */}
                                <View
                                    style={[
                                        Style.statusPillCls,
                                        {
                                            backgroundColor: state.statusColor,
                                        },
                                    ]}
                                >
                                    <Typo
                                        text={state.statusText}
                                        fontSize={9}
                                        lineHeight={11}
                                        numberOfLines={1}
                                        color={WHITE}
                                    />
                                </View>

                                {/* Property Name */}
                                <Typo
                                    fontSize={18}
                                    fontWeight="600"
                                    lineHeight={25}
                                    textAlign="left"
                                    text={state.propertyName}
                                    style={Style.headerText}
                                />

                                {/* Unit Number */}
                                {state.showUnitNumber && state.unitNumber && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={`Unit No: ${state.unitNumber}`}
                                        color={FADE_GREY}
                                        style={Style.subText}
                                    />
                                )}

                                {/* Creation - Date & Time */}
                                {state.startDate && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={`Started on ${state.startDate}`}
                                        color={FADE_GREY}
                                        style={Style.subText}
                                    />
                                )}

                                {/* Cancel/Terminated Date */}

                                {isCancelled && isMainApplicant && !wolocStatus && (
                                    <View
                                        style={Style.cancelDateCont}
                                        testID="application_details_terminated_lable"
                                    >
                                        {state.updatedDate ? (
                                            <View style={Style.removedTextField}>
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={20}
                                                    textAlign="center"
                                                    fontWeight="600"
                                                    text={`You've`}
                                                />
                                                <Typo
                                                    lineHeight={20}
                                                    textAlign="center"
                                                    color="red"
                                                    text="terminated"
                                                    style={Style.leftText}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={20}
                                                    fontWeight="600"
                                                    alignItems="center"
                                                    style={Style.leftText}
                                                    text="your eligibility check on"
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={20}
                                                    fontWeight="600"
                                                    alignItems="center"
                                                    style={Style.leftText}
                                                    text={`${state.updatedDate}`}
                                                />
                                            </View>
                                        ) : (
                                            <Typo
                                                fontSize={12}
                                                lineHeight={20}
                                                fontWeight="600"
                                                text="Your application has been cancelled"
                                            />
                                        )}
                                    </View>
                                )}

                                {/* Cancel/Terminated Date */}
                                {isRemoved && !wolocStatus && (
                                    <View style={Style.cancelDateCont}>
                                        <View style={Style.removedTextField}>
                                            <Typo
                                                lineHeight={20}
                                                textAlign="center"
                                                text={` This application is`}
                                            />

                                            <Typo
                                                lineHeight={20}
                                                textAlign="center"
                                                color="red"
                                                text="invalid"
                                                style={Style.leftText}
                                            />
                                        </View>

                                        <View style={Style.removedTextField}>
                                            <Typo
                                                lineHeight={20}
                                                textAlign="left"
                                                text={`because you are `}
                                            />
                                            <Typo
                                                lineHeight={20}
                                                fontWeight="600"
                                                textAlign="left"
                                                text="no longer a joint applicant."
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Cancel/Terminated Date */}
                                {isCancelled && isJointApplicant && !wolocStatus && (
                                    <View
                                        style={Style.cancelDateCont}
                                        testID="application_details_terminated_lable"
                                    >
                                        {state.updatedDate ? (
                                            <>
                                                <View style={Style.removedTextField}>
                                                    <Typo
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                        textAlign="center"
                                                        text="Your application was"
                                                    />
                                                    <Typo
                                                        lineHeight={18}
                                                        fontSize={12}
                                                        textAlign="center"
                                                        color="red"
                                                        text="cancelled"
                                                        style={Style.leftText}
                                                    />
                                                    <Typo
                                                        fontSize={12}
                                                        lineHeight={20}
                                                        fontWeight="600"
                                                        textAlign="center"
                                                        style={Style.leftText}
                                                        text="on"
                                                    />
                                                </View>
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textAlign="center"
                                                    fontWeight="800"
                                                    style={Style.leftText}
                                                    text={`${state.updatedDate}`}
                                                />
                                            </>
                                        ) : (
                                            <Typo
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                style={Style.leftText}
                                                text="Your application has been cancelled"
                                            />
                                        )}
                                    </View>
                                )}

                                {/* Expired*/}
                                {isExpired && isMainApplicant && !wolocStatus && (
                                    <View style={Style.cancelDateCont}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={ELIGIBILY_CHECK_EXPIRY_TEXT}
                                        />
                                    </View>
                                )}

                                {isExpired && isJointApplicant && !wolocStatus && (
                                    <View style={Style.cancelDateCont}>
                                        <View style={Style.removedTextField}>
                                            <Typo
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                text="This application has"
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={18}
                                                fontWeight="600"
                                                color="red"
                                                text={` expired`}
                                            />
                                        </View>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="center"
                                            fontWeight="800"
                                            style={Style.leftText}
                                            text={`on ${state.updatedDate}`}
                                        />
                                    </View>
                                )}

                                {/* Highlighted text on expired scenario */}
                                {isExpired && wolocStatus && (
                                    <View style={Style.cancelDateCont}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text="This application has expired."
                                        />
                                    </View>
                                )}

                                {/* Highlighted text on cancelled scenario */}
                                {isCancelled && wolocStatus && (
                                    <View style={Style.cancelDateCont}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={`We're unable to proceed with your application.`}
                                        />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text="Please contact your sales representative for"
                                        />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text="further information."
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Status Detail Indicator */}
                            {!isCancelled && !isExpired && !isRemoved && (
                                <StatusIndicator data={state.stepperData} />
                            )}

                            {/* Loan Details Container */}
                            {!wolocStatus &&
                                (progressStatus !== PROP_ELG_INPUT ||
                                    (jointApplicantInfo !== null &&
                                        jointApplicantInfo?.customerId !== null) ||
                                    (route?.params?.currentUserJA === "Y" &&
                                        isRemoved &&
                                        route?.params?.savedData?.dataType !== null)) && (
                                    <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                                        <View
                                            style={[
                                                Platform.OS === "ios" ? {} : Style.shadow,
                                                Style.loanDetailsContainer,
                                                Style.horizontalMargin,
                                            ]}
                                        >
                                            {/* Loan Amount Label */}
                                            <Typo
                                                lineHeight={19}
                                                style={Style.loanAmountLabel}
                                                text={state.loanAmountLabel}
                                            />

                                            {/* Loan Amount value */}
                                            <Typo
                                                fontSize={24}
                                                lineHeight={29}
                                                fontWeight="bold"
                                                style={Style.loanAmount}
                                                text={state.loanAmount}
                                            />

                                            {/* Info container */}

                                            {!fullDataEntryIndicator && (
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
                                                        text={ADDITIONAL_FINANCING_INFO_TEXT}
                                                        color={DARK_GREY}
                                                        style={Style.infoText}
                                                    />
                                                </View>
                                            )}

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

                                            {fullDataEntryIndicator && (
                                                <>
                                                    {/* Loan breakdown */}
                                                    <Typo
                                                        textAlign="left"
                                                        fontSize={12}
                                                        lineHeight={18}
                                                        color={FADE_GREY}
                                                        text={state.breakDownLabel}
                                                        style={Style.breakDownHeader}
                                                    />

                                                    {/* Property */}
                                                    <DetailField
                                                        label="Property"
                                                        value={state.propertyAmount}
                                                    />

                                                    {/* Other related expenses */}
                                                    <DetailField
                                                        label="Other related expenses"
                                                        value={state.otherRelatedExpenses}
                                                    />
                                                </>
                                            )}

                                            {/* Gray separator line */}
                                            <View style={Style.graySeparator} />

                                            {/* Interest Rate */}
                                            <DetailField
                                                label={state.interestRateLabel}
                                                value={state.interestRate}
                                                valueSubText1={state.interestRateSubText1}
                                                valueSubText2={state.interestRateSubText2}
                                                style={Style.firstDetailField}
                                            />

                                            {/* Loan period */}
                                            <DetailField
                                                label={state.tenureLabel}
                                                value={state.tenure}
                                            />

                                            {/* Monthly Instalment */}
                                            <DetailField
                                                label="Monthly instalment"
                                                value={state.monthlyInstalment}
                                                infoNote={state.monthlyInfoNote}
                                            />

                                            {/* Gray separator line */}
                                            <View style={Style.graySeparator} />

                                            {/* Property Price */}
                                            <DetailField
                                                label="Property price"
                                                value={state.propertyPrice}
                                                style={Style.firstDetailField}
                                            />

                                            {/* Downpayment */}
                                            <DetailField
                                                label="Downpayment"
                                                value={state.downpayment}
                                            />

                                            {/* Bank selling price */}
                                            {state.bankSellingPrice.length > 0 && (
                                                <DetailField
                                                    label="Bank's selling price"
                                                    value={state.bankSellingPrice}
                                                    isShowLeftInfoIcon={true}
                                                    onLeftInfoIconPress={onBankSellingIconPress}
                                                />
                                            )}

                                            {/* Financing details */}
                                            {(progressStatus === PROP_LA_RESULT ||
                                                progressStatus === PROP_LA_INPUT ||
                                                currentStage !== STG_ELIGIBILITY) &&
                                                state.financingTypeTitle !== "" &&
                                                state.financingPlanTitle !== "" && (
                                                    <>
                                                        {/* Gray separator line */}
                                                        <View style={Style.graySeparator} />

                                                        {/* Selected home financing */}
                                                        <Typo
                                                            textAlign="left"
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            text="Selected home financing"
                                                            style={Style.homeFinancingHeader}
                                                        />

                                                        {/* Financing type */}
                                                        <DetailField
                                                            label="Financing type"
                                                            value={state.financingTypeTitle}
                                                        />

                                                        {/* Financing product */}
                                                        <DetailField
                                                            label="Financing product"
                                                            value={state.financingPlanTitle}
                                                        />
                                                    </>
                                                )}
                                        </View>
                                    </View>
                                )}

                            {((isCancelled && wolocStatus) || (isExpired && wolocStatus)) && (
                                <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                                    <View
                                        style={[
                                            Platform.OS === "ios" ? {} : Style.shadow,
                                            Style.loanDetailsContainer,
                                            Style.horizontalMargin,
                                        ]}
                                    >
                                        {/* Loan Amount Label */}
                                        {isCancelled && (
                                            <Typo
                                                lineHeight={19}
                                                style={Style.loanAmountLabel}
                                                text="Property loan amount"
                                            />
                                        )}
                                        {isExpired && (
                                            <Typo
                                                lineHeight={19}
                                                style={Style.loanAmountLabel}
                                                text="Loan amount"
                                            />
                                        )}

                                        {/* Loan Amount value */}
                                        <Typo
                                            fontSize={24}
                                            lineHeight={29}
                                            fontWeight="bold"
                                            style={Style.loanAmount}
                                            text={state.loanAmount}
                                        />

                                        {/* Gray separator line */}
                                        {isExpired && <View style={Style.graySeparator} />}

                                        {/* Info container */}
                                        {isCancelled && (
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
                                                    text={ADDITIONAL_FINANCING_INFO_TEXT}
                                                    color={DARK_GREY}
                                                    style={Style.infoText}
                                                />
                                            </View>
                                        )}
                                        {/* Interest Rate */}
                                        <DetailField
                                            label={state.interestRateLabel}
                                            value={state.interestRate}
                                            valueSubText1={state.interestRateSubText1}
                                            valueSubText2={state.interestRateSubText2}
                                            style={Style.firstDetailField}
                                        />

                                        {/* Loan period */}
                                        <DetailField label="Loan period" value={state.tenure} />

                                        {/* Monthly Instalment */}
                                        {isCancelled && (
                                            <DetailField
                                                label="Monthly instalment"
                                                value={state.monthlyInstalment}
                                                infoNote={state.monthlyInfoNote}
                                            />
                                        )}

                                        {isCancelled && (
                                            <DetailField
                                                label="Monthly instalment"
                                                value={state.monthlyInstalment}
                                            />
                                        )}

                                        {/* Gray separator line */}
                                        <View style={Style.graySeparator} />

                                        {/* Property Price */}
                                        <DetailField
                                            label="Property price"
                                            value={state.propertyPrice}
                                            style={Style.firstDetailField}
                                        />

                                        {/* Downpayment */}
                                        <DetailField
                                            label="Downpayment"
                                            value={state.downpayment}
                                        />

                                        {/* Bank selling price */}
                                        {state.bankSellingPrice.length > 0 && (
                                            <DetailField
                                                label="Bank's selling price"
                                                value={state.bankSellingPrice}
                                                isShowLeftInfoIcon={true}
                                                onLeftInfoIconPress={onBankSellingIconPress}
                                            />
                                        )}

                                        {/* Financing details */}
                                        {state.financingTypeTitle !== "" &&
                                            state.financingPlanTitle !== "" && (
                                                <>
                                                    {/* Gray separator line */}
                                                    <View style={Style.graySeparator} />

                                                    {/* Selected home financing */}
                                                    <Typo
                                                        textAlign="left"
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text="Selected home financing"
                                                        style={Style.homeFinancingHeader}
                                                    />

                                                    {/* Financing type */}
                                                    <DetailField
                                                        label="Financing type"
                                                        value={state.financingTypeTitle}
                                                    />

                                                    {/* Financing product */}
                                                    <DetailField
                                                        label="Financing product"
                                                        value={state.financingPlanTitle}
                                                    />
                                                </>
                                            )}
                                    </View>
                                </View>
                            )}

                            {/* Documents */}
                            <ActionTile
                                header="Documents"
                                description={VIEW_OR_MANAGE_TEXT}
                                style={Style.documentTile}
                                icon={Assets.documents}
                                onPress={onViewDocuments}
                                shadow
                            />

                            {/* Main Applicant */}
                            {isMainApplicant &&
                                jointApplicantInfo !== null &&
                                jointApplicantInfo?.customerId !== null && (
                                    <>
                                        {/* Gray separator line */}
                                        <View
                                            style={[Style.graySeparatorBig, Style.horizontalMargin]}
                                        />
                                        <View style={Style.detailsInfo}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={20}
                                                text={YOUR_JOINT_APPLICANT}
                                                textAlign="left"
                                                style={Style.horizontalMargin}
                                            />

                                            <JointApplicantDetail
                                                jointApplicantInfo={state.jointApplicantInfo}
                                                status={route?.params?.savedData?.status}
                                                jaStatus={route?.params?.savedData?.jaStatus}
                                                isAccepted={state.isAccepted}
                                                isRemind={state.isAccepted}
                                                isCancelled={isCancelled}
                                                removeOpenJointApplicant={
                                                    onOpenRemoveJointApplicantPopup
                                                }
                                                remindOpenJointApplicant={
                                                    onOpenRemindJointApplicantPopup
                                                }
                                            />
                                        </View>
                                    </>
                                )}

                            {/* Joint Applicant */}
                            {isJointApplicant && mainApplicantInfo?.customerId !== null && (
                                <>
                                    <View
                                        style={[Style.graySeparatorBig, Style.horizontalMargin]}
                                    />
                                    <View style={Style.detailsInfo}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={20}
                                            text={YOUR_MAIN_APPLICANT}
                                            textAlign="left"
                                            style={Style.horizontalMargin}
                                        />
                                        <MainApplicantDetail
                                            mainApplicantInfo={mainApplicantInfo}
                                        />
                                    </View>
                                </>
                            )}

                            {/* Gray separator line */}
                            <View style={[Style.graySeparatorBig, Style.horizontalMargin]} />

                            {/* Sales Representative */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={SALES_REPRESENTTATIVE}
                                textAlign="left"
                                style={Style.horizontalMargin}
                            />

                            {/* <SalesRepEmptyTile /> */}
                            {agentInfo ? (
                                <AgentInfoTile
                                    agentInfo={agentInfo}
                                    onPressCall={onPressCall}
                                    onPressMessage={onPressMessage}
                                    isRemoved={isRemoved}
                                    isCancelled={isCancelled}
                                />
                            ) : (
                                <SalesRepEmptyTile />
                            )}
                        </ScrollView>

                        {showCTA && (
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={state.ctaText}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </FixedActionContainer>
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Top Menu */}
            {showTopMenuIcon && (
                <TopMenu
                    showTopMenu={state.showTopMenu}
                    onClose={closeTopMenu}
                    navigation={navigation}
                    menuArray={state.topMenuData}
                    onItemPress={onTopMenuItemPress}
                />
            )}

            {/* Apply Loan Success popup */}
            <Popup
                visible={state.showApplySuccessPopup}
                title={APPLYSUCCPOPUP_TITLE}
                description={APPLYSUCCPOPUP_DESC}
                onClose={closeApplySuccessPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeApplySuccessPopup,
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

            {/* Info Popup */}
            <Popup
                visible={state.infoPopup}
                title={state.infoPopupTitle}
                description={state.infoPopupDesc}
                onClose={onCloseInfoPopup}
            />
            <Popup
                visible={state.remindJointApplicant}
                title={NO_NOTIFY_JOINTAPPLICANT_TITLE}
                description={NOTIFY_JOINT_APPLICANT_DESC}
                onClose={closeNotifyJAPopup}
                primaryAction={{
                    text: CONFIRM,
                    onPress: onNotifyJAPopupConfirm,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onNotifyJAPopupCancel,
                }}
            />
        </>
    );
}

ApplicationDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
function StatusIndicator({ data }) {
    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <View
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.statusDetailsContainer,
                    Style.horizontalMargin,
                ]}
            >
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={20}
                    text="Status"
                    textAlign="left"
                    style={Style.statusLabel}
                />
                <>
                    {data.map((item, index) => {
                        return (
                            <VerticalStepper
                                key={index}
                                number={item.number}
                                color={item.color}
                                title={item.title}
                                titleColor={item.titleColor}
                                description={item.description}
                                isLastItem={item.isLastItem}
                            />
                        );
                    })}
                </>
            </View>
        </View>
    );
}

StatusIndicator.propTypes = {
    data: PropTypes.array,
};

function SalesRepEmptyTile() {
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.salesRepEmptyCont,
                Style.horizontalMargin,
            ]}
        >
            <View style={[Platform.OS === "ios" ? {} : Style.shadow, Style.salesRepEmptyInnerCont]}>
                <View style={Style.salesRepEmptyTextCont}>
                    <Typo fontSize={13} lineHeight={18} text={CONNECT_SALES_REP_TEXT} />
                </View>
                <Image style={Style.salesRepEmptyImgCls} source={Assets.salesRepEmpty} />
            </View>
        </View>
    );
}

function AgentInfoTile({ agentInfo, onPressCall, onPressMessage, isRemoved, isCancelled }) {
    const agentName = (agentInfo?.name || agentInfo?.display_name) ?? "";
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.salesRepEmptyCont,
                Style.horizontalMargin,
            ]}
        >
            <View style={[Platform.OS === "ios" ? {} : Style.shadow, Style.salesRepEmptyInnerCont]}>
                <View style={Style.salesRepEmptyTextCont}>
                    <Typo lineHeight={18} fontWeight="600" text={agentName} />
                    <View style={Style.agentButtonRow}>
                        {/* Call */}
                        <ActionButton
                            width={120}
                            backgroundColor={WHITE}
                            borderStyle="solid"
                            borderWidth={1}
                            borderColor={GREY}
                            componentCenter={<Typo fontWeight="600" lineHeight={18} text="Call" />}
                            style={Style.call}
                            onPress={onPressCall}
                        />

                        {/* Message */}
                        <ActionButton
                            width={120}
                            backgroundColor={isRemoved || isCancelled ? DISABLED : YELLOW}
                            disabled={isRemoved || isCancelled ? true : false}
                            componentCenter={
                                <Typo
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Message"
                                    style={
                                        isRemoved || isCancelled ? Style.disableMessageText : null
                                    }
                                />
                            }
                            onPress={onPressMessage}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

AgentInfoTile.propTypes = {
    agentInfo: PropTypes.object,
    propertyId: PropTypes.number,
    onPressCall: PropTypes.func,
    onPressMessage: PropTypes.func,
    isRemoved: PropTypes.bool,
    isCancelled: PropTypes.bool,
};

function MainApplicantDetail({ mainApplicantInfo }) {
    const applicantName = mainApplicantInfo?.customerName ?? "";
    const profileImage = mainApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${mainApplicantInfo?.profilePicBase64}`
        : null;

    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.mainApplicantHeader,
                Style.mainApplicanthorizontalMargin,
            ]}
        >
            <View style={Style.jointApplicantRow}>
                {/* Profile Logo */}

                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={Style.profileLogo}
                />
                {/* Main Applicant Name */}
                <View>
                    <Typo
                        lineHeight={17}
                        fontWeight="400"
                        text={applicantName}
                        textAlign="left"
                        style={Style.applicantInfoName}
                    />
                </View>
            </View>
        </View>
    );
}

MainApplicantDetail.propTypes = {
    mainApplicantInfo: PropTypes.object,
};

function JointApplicantDetail({
    jointApplicantInfo,
    removeOpenJointApplicant,
    remindOpenJointApplicant,
    isAccepted,
    status,
    isCancelled,
    jaStatus,
}) {
    const applicantName = jointApplicantInfo?.customerName ?? "";
    const profileImage = jointApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${jointApplicantInfo?.profilePicBase64}`
        : null;
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.mainApplicantHeader,
                Style.mainApplicanthorizontalMargin,
            ]}
        >
            <View style={Style.jointApplicantRow}>
                {/* Profile Logo */}
                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={Style.profileLogo}
                />
                {/* Main Applicant Name */}
                <View>
                    <Typo
                        lineHeight={17}
                        fontWeight="400"
                        text={applicantName}
                        textAlign="left"
                        style={Style.applicantInfoName}
                    />
                    {(status === "ELIGCOMP" ||
                        status === "INPROGRESS" ||
                        status === "ELGCFAIL" ||
                        jaStatus === "INPROGRESS" ||
                        jaStatus === "ELIGCOMP") &&
                        isAccepted &&
                        !isCancelled && (
                            <Typo
                                lineHeight={18}
                                fontWeight="600"
                                text={REMOVE_JOINT_TITLE}
                                style={Style.jointApplicantStyle}
                                onPressText={removeOpenJointApplicant}
                            />
                        )}

                    {!isAccepted && !isCancelled && (
                        <Typo
                            lineHeight={18}
                            fontWeight="600"
                            text={REMIND_JOINT_APPLICANT}
                            style={Style.jointApplicantStyle}
                            onPressText={remindOpenJointApplicant}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

JointApplicantDetail.propTypes = {
    jointApplicantInfo: PropTypes.object,
    removeOpenJointApplicant: PropTypes.func,
    remindOpenJointApplicant: PropTypes.func,
    isAccepted: PropTypes.bool,
    status: PropTypes.string,
    jaStatus: PropTypes.string,
    isCancelled: PropTypes.bool,
};

const Style = StyleSheet.create({
    agentButtonRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25,
        width: "100%",
    },

    applicantInfoName: {
        marginBottom: 5,
        paddingLeft: 20,
    },

    breakDownHeader: {
        marginHorizontal: 20,
        marginTop: 16,
    },

    call: {
        marginRight: 7,
    },

    cancelDateCont: {
        backgroundColor: YELLOW,
        borderRadius: 8,
        marginTop: 15,
        opacity: 0.6,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    detailsInfo: {
        flex: 1,
        flexDirection: "column",
    },

    disableMessageText: {
        color: GREY,
    },

    documentTile: {
        marginBottom: 0,
        marginTop: 15,
    },

    firstDetailField: {
        marginTop: 0,
    },

    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },

    graySeparatorBig: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 25,
    },

    headerText: {
        marginTop: 12,
    },

    homeFinancingHeader: {
        marginHorizontal: 20,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

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
        marginLeft: 8,
    },

    jointApplicantRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
        width: "100%",
    },

    jointApplicantStyle: {
        fontSize: 14,
        marginBottom: 5,
        marginLeft: 20,
        textDecorationColor: BLACK,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
    },

    leftText: {
        marginLeft: 5,
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
        marginTop: 15,
        paddingBottom: 15,
    },

    mainApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    mainApplicanthorizontalMargin: {
        marginHorizontal: 10,
    },

    profileLogo: {
        backgroundColor: IRISBLUE,
        borderColor: WHITE,
        borderRadius: 150 / 2,
        borderWidth: 2,
        height: 48,
        width: 48,
    },
    removedTextField: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        textAlign: "center",
    },
    salesRepEmptyCont: {
        marginBottom: 40,
        marginTop: 20,
    },
    salesRepEmptyImgCls: {
        height: 180,
        width: "100%",
    },
    salesRepEmptyInnerCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flex: 1,
        overflow: "hidden",
    },
    salesRepEmptyTextCont: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    statusDetailsContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 24,
        paddingTop: 24,
    },

    statusLabel: {
        marginBottom: 15,
    },

    statusPillCls: {
        alignItems: "center",
        borderRadius: 50,
        height: 22,
        justifyContent: "center",
        width: 60,
    },
    subText: {
        marginTop: 5,
    },
});

export default ApplicationDetails;

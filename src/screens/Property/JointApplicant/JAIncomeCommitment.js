/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable radix */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useRef, useCallback, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import {
    JA_INCOME_COMMITMENT,
    BANKINGV2_MODULE,
    JA_CEF_IN_DECLARATION,
    JA_TNC,
    JA_CONFIRMATION,
    APPLICATION_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED_TEXT,
    DISABLED,
    BLACK,
    FADE_GREY,
    DARK_GREY,
} from "@constants/colors";
import { PROP_ELG_INPUT, EXISTING_LOANS_DATA } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_DESC,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    SAVE_NEXT,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    LEAVE,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_FINANCIALCOMMITMENTS,
    EDIT,
    JOINT_APPLICATION,
    EDIT_PERSONAL_DETAILS,
    HOME_FINANCING_NOTES,
    MONTHLY_GROSS_INCOME_TITLE,
    MONTHLY_GROSS_INCOME_BEFORE_DEDUCTIONS,
    MONTHLY_NONBANK_COMMITMENTS,
    MONTHLY_COMMITMENTS_DESC,
    FIRST_TIME_PURCHASING_HOUSE,
    MONTHLY_INTREST_PAYMENT,
    NON_BANK_COMMITMENTS,
    CAR_FINANCING,
    CREADIT_CARD_REPAYMENTS,
    ENTER_MONTHLY_INCOME,
    EXISTING_HOME_FINANCING,
    HOME_FINANCING,
    MONTHLY_GROSS_INCOME,
    OVERDRAFT,
    PERSONAL_FINANCING,
} from "@constants/strings";

import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import AmountInput from "../Common/AmountInput";
import ExpandField from "../Common/ExpandField";
import { getExistingData, getEncValue, useResetNavigation } from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import SlidingNumPad from "../Common/SlidingNumPad";
import { saveEligibilityInput, removeCEEditRoutes, getUIData } from "./JAController";

const initialState = {
    //stepper info
    currentStep: "",
    totalSteps: "",
    stepperInfo: "",

    // Gross Income related
    grossIncomeDisplayAmt: "",
    grossIncomeRawAmt: "",
    grossIncomeKeypadAmt: "",

    // Existing housing loan related
    existHouseLoan: PLEASE_SELECT,
    existHouseLoanValue: null,
    existHouseLoanValueIndex: 0,
    existHouseLoanData: EXISTING_LOANS_DATA,
    existHouseLoanPicker: false,
    existHouseLoanObj: null,

    // House Loan related
    housingLoanDisplayAmt: "",
    housingLoanRawAmt: "",
    housingLoanKeypadAmt: "",
    showHousingLoan: false,

    // Personal Loan related
    personalLoanDisplayAmt: "",
    personalLoanRawAmt: "",
    personalLoanKeypadAmt: "",
    showPersonalLoan: false,

    // CC Repayments related
    creditCardDisplayAmt: "",
    creditCardRawAmt: "",
    creditCardKeypadAmt: "",
    showCreditCard: false,

    // Car Loan related
    carLoanDisplayAmt: "",
    carLoanRawAmt: "",
    carLoanKeypadAmt: "",
    showCarLoan: false,

    // Overdraft related
    overdraftDisplayAmt: "",
    overdraftRawAmt: "",
    overdraftKeypadAmt: "",
    showOverdraft: false,

    // Non bank commitments related
    nonBankCommitDisplayAmt: "",
    nonBankCommitRawAmt: "",
    nonBankCommitKeypadAmt: "",
    showNonBankCommit: false,
    nonBankCommitInfoPopup: false,

    // Numerical Keypad related
    showNumPad: false,
    keypadAmount: "",
    numKeypadHeight: 0,
    currentKeypadType: "",

    // Others
    showExitPopup: false,
    isContinueDisabled: true,
    headerText: "",
    ccrisReportFlag: false,
    editFlow: false,
    loading: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_TEXT":
            return {
                ...state,
                headerText: payload,
            };
        case "SET_CCRICS_FLAG":
            return {
                ...state,
                ccrisReportFlag: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                existHouseLoanPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                existHouseLoanPicker: payload === "existHouseLoan",
                showNumPad: false,
            };
        case "SET_KEYPAD_HEIGHT":
            return {
                ...state,
                numKeypadHeight: payload,
            };
        case "SHOW_NUM_PAD":
            return {
                ...state,
                showNumPad: payload?.value ?? false,
                currentKeypadType: payload?.fieldType ?? null,
                keypadAmount: payload?.amount ?? state.keypadAmount,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        case "SET_STEPPER_INFO":
        case "SHOW_HOUSE_LOAN":
        case "SET_EXIST_HOUSE_LOAN":
        case "EXPAND_FIELD":
        case "SET_GROSS_INCOME":
        case "SET_HOUSING_LOAN":
        case "SET_PERSONAL_LOAN":
        case "SET_CC_REPAYMENTS":
        case "SET_CAR_LOAN":
        case "SET_OVERDRAFT":
        case "SET_NON_BANK_COMMIT":
            return {
                ...state,
                ...payload,
            };
        case "SHOW_NONBANK_COMMIT_INFO_POPUP":
            return {
                ...state,
                nonBankCommitInfoPopup: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "SET_EDIT_FLOW":
            return {
                ...state,
                editFlow: payload,
            };
        case "SHOW_CANCEL_EDIT_POPUP":
            return {
                ...state,
                cancelEditPopup: payload,
            };
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
            };
        case "SHOW_MONTHLY_GROSS_INFO_POPUP":
            return {
                ...state,
                showMonthlyGrossIcome: payload,
            };
        default:
            return { ...state };
    }
}

function JAIncomeCommitment({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isFirstTimeBuyHomeIndc, setIsFirstTimeBuyHomeIndc] = useState("");
    const [resetToApplication] = useResetNavigation(navigation);
    const [loading, setLoading] = useState(true);

    const {
        isContinueDisabled,
        showNumPad,
        numKeypadHeight,
        ccrisReportFlag,
        showHousingLoan,
        showPersonalLoan,
        showCreditCard,
        showCarLoan,
        showOverdraft,
        showNonBankCommit,
        existHouseLoanValue,
        grossIncomeRawAmt,
        existHouseLoan,
        housingLoanRawAmt,
        editFlow,
    } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                !grossIncomeRawAmt ||
                isFirstTimeBuyHomeIndc === null ||
                (isFirstTimeBuyHomeIndc === "N" && existHouseLoan === PLEASE_SELECT) ||
                (showHousingLoan && !housingLoanRawAmt),
        });
        dispatch({
            actionType: "SHOW_HOUSE_LOAN",
            payload: {
                showHousingLoan:
                    !ccrisReportFlag &&
                    (existHouseLoanValue === "1" ||
                        existHouseLoanValue === "2" ||
                        existHouseLoanValue === "More than 2"),
            },
        });
    }, [
        grossIncomeRawAmt,
        existHouseLoan,
        housingLoanRawAmt,
        showHousingLoan,
        isFirstTimeBuyHomeIndc,
        existHouseLoanValue,
        ccrisReportFlag,
    ]);

    const init = useCallback(() => {
        const navParams = route?.params ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;
        const headerText = navParams?.headerText ?? "";
        const ccrisReportFlag = navParams?.ccrisReportFlag ?? false;
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && !paramsEditFlow && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";

        // Set Header Text
        dispatch({
            actionType: "SET_HEADER_TEXT",
            payload: headerText,
        });

        //Set Stepper Info
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                currentStep,
                totalSteps,
                stepperInfo,
            },
        });

        // Set CCRIS Flag
        if (ccrisReportFlag) {
            dispatch({
                actionType: "SET_CCRICS_FLAG",
                payload: true,
            });
        }

        populateSavedData();
        setLoading(false);
    }, [route, navigation]);

    function onBackTap() {
        navigation.goBack();
    }

    async function onCloseTap() {
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        // Show Exit OR Cancel Edit Popup
        dispatch({
            actionType: editFlow ? "SHOW_CANCEL_EDIT_POPUP" : "SHOW_EXIT_POPUP",
            payload: true,
        });

        // Hide keypad
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });
    }

    function populateSavedData() {
        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;
        const {
            grossIncomeRaw,
            houseLoan,
            housingLoanRaw,
            personalLoanRaw,
            ccRepaymentsRaw,
            carLoanRaw,
            overdraftRaw,
            isFirstTimeBuyHomeIndc,
            nonBankCommitmentsRaw,
        } = getUIData(navParams, savedData, paramsEditFlow);

        // Gross Income
        if (grossIncomeRaw && !isNaN(grossIncomeRaw)) {
            const grossIncomeData = getPrepopulateAmount(grossIncomeRaw);

            dispatch({
                actionType: "SET_GROSS_INCOME",
                payload: {
                    grossIncomeDisplayAmt: grossIncomeData?.dispAmt,
                    grossIncomeRawAmt: grossIncomeData?.rawAmt,
                    grossIncomeKeypadAmt: grossIncomeData?.keypadAmt,
                },
            });
        }

        //Is First Time Purchase
        if (isFirstTimeBuyHomeIndc) {
            setIsFirstTimeBuyHomeIndc(isFirstTimeBuyHomeIndc);
        }

        // House Loans
        if (houseLoan) {
            const houseLoanSelect = getExistingData(houseLoan, EXISTING_LOANS_DATA);
            dispatch({
                actionType: "SET_EXIST_HOUSE_LOAN",
                payload: {
                    existHouseLoan: houseLoanSelect.name,
                    existHouseLoanValue: houseLoanSelect.value,
                    existHouseLoanObj: houseLoanSelect.obj,
                    existHouseLoanValueIndex: houseLoanSelect.index,
                },
            });
        }

        // Housing Loan
        if (housingLoanRaw && !isNaN(housingLoanRaw)) {
            const housingLoanData = getPrepopulateAmount(housingLoanRaw);
            dispatch({
                actionType: "SET_HOUSING_LOAN",
                payload: {
                    housingLoanDisplayAmt: housingLoanData?.dispAmt,
                    housingLoanRawAmt: housingLoanData?.rawAmt,
                    housingLoanKeypadAmt: housingLoanData?.keypadAmt,
                },
            });
        }

        // Personal Loan
        if (personalLoanRaw && !isNaN(personalLoanRaw)) {
            const personalLoanData = getPrepopulateAmount(personalLoanRaw);
            dispatch({
                actionType: "SET_PERSONAL_LOAN",
                payload: {
                    personalLoanDisplayAmt: personalLoanData?.dispAmt,
                    personalLoanRawAmt: personalLoanData?.rawAmt,
                    personalLoanKeypadAmt: personalLoanData?.keypadAmt,
                },
            });
        }

        // CC Repayments
        if (ccRepaymentsRaw && !isNaN(ccRepaymentsRaw)) {
            const ccRepaymentsData = getPrepopulateAmount(ccRepaymentsRaw);
            dispatch({
                actionType: "SET_CC_REPAYMENTS",
                payload: {
                    creditCardDisplayAmt: ccRepaymentsData?.dispAmt,
                    creditCardRawAmt: ccRepaymentsData?.rawAmt,
                    creditCardKeypadAmt: ccRepaymentsData?.keypadAmt,
                },
            });
        }

        // Car Loan
        if (carLoanRaw && !isNaN(carLoanRaw)) {
            const carLoanData = getPrepopulateAmount(carLoanRaw);
            dispatch({
                actionType: "SET_CAR_LOAN",
                payload: {
                    carLoanDisplayAmt: carLoanData?.dispAmt,
                    carLoanRawAmt: carLoanData?.rawAmt,
                    carLoanKeypadAmt: carLoanData?.keypadAmt,
                },
            });
        }

        // Overdraft
        if (overdraftRaw && !isNaN(overdraftRaw)) {
            const overdraftData = getPrepopulateAmount(overdraftRaw);
            dispatch({
                actionType: "SET_OVERDRAFT",
                payload: {
                    overdraftDisplayAmt: overdraftData?.dispAmt,
                    overdraftRawAmt: overdraftData?.rawAmt,
                    overdraftKeypadAmt: overdraftData?.keypadAmt,
                },
            });
        }

        // Non-bank commitments
        if (nonBankCommitmentsRaw && !isNaN(nonBankCommitmentsRaw)) {
            const nonBankCommitmentsData = getPrepopulateAmount(nonBankCommitmentsRaw);
            dispatch({
                actionType: "SET_NON_BANK_COMMIT",
                payload: {
                    nonBankCommitDisplayAmt: nonBankCommitmentsData?.dispAmt,
                    nonBankCommitRawAmt: nonBankCommitmentsData?.rawAmt,
                    nonBankCommitKeypadAmt: nonBankCommitmentsData?.keypadAmt,
                },
            });
        }

        // Changes specific to edit flow
        if (paramsEditFlow) {
            dispatch({
                actionType: "SET_EDIT_FLOW",
                payload: paramsEditFlow,
            });
            dispatch({
                actionType: "SET_HEADER_TEXT",
                payload: EDIT_FIN_DETAILS,
            });
        }
    }

    function getPrepopulateAmount(rawAmt) {
        const defaultResponse = {
            dispAmt: "",
            rawAmt: "",
            keypadAmt: "",
        };

        if (!rawAmt) return defaultResponse;

        return {
            dispAmt: numeral(rawAmt).format("0,0.00"),
            rawAmt,
            keypadAmt: String(rawAmt * 100),
        };
    }

    function onExistHouseLoanTap() {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "existHouseLoan",
        });
    }

    function onGrossIncomePress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "GROSS_INCOME",
                amount: state.grossIncomeKeypadAmt,
            },
        });
    }

    function onPressFirstTimePurchasingRadio(value) {
        console.log("[JAIncomeCommitment] >> [onPressFirstTimePurchasingRadio]");
        setIsFirstTimeBuyHomeIndc(value);
    }

    function onHousingLoanPress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "HOUSING_LOAN",
                amount: state.housingLoanKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 150 });
        }, 500);
    }

    function onPersonalLoanPress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "PERSONAL_LOAN",
                amount: state.personalLoanKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 200 });
        }, 500);
    }

    function onCCRepaymentsPress() {
        const { creditCardKeypadAmt } = state;
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "CC_REPAYMENTS",
                amount: creditCardKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 250 });
        }, 500);
    }

    function onCarLoanPress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "CAR_LOAN",
                amount: state.carLoanKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 350 });
        }, 500);
    }

    function onOverdraftPress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "OVERDRAFT",
                amount: state.overdraftKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollToEnd({ animated: true });
        }, 500);
    }

    function onNonBankCommitPress() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "NON_BANK_COMMIT",
                amount: state.nonBankCommitKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollToEnd({ animated: true });
        }, 500);
    }

    function onExpandField(actionTypeValue) {
        dispatch({
            actionType: actionTypeValue,
            payload: {
                payloadValue: true,
            },
        });
    }

    function onPickerCancel() {
        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        if (state.pickerType === "existHouseLoan") {
            dispatch({
                actionType: "SET_EXIST_HOUSE_LOAN",
                payload: {
                    existHouseLoan: item?.name ?? PLEASE_SELECT,
                    existHouseLoanValue: item?.value ?? null,
                    existHouseLoanObj: item,
                    existHouseLoanValueIndex: index,
                },
            });
        }

        // Close picker
        onPickerCancel();
    }

    function getKeypadHeight(height) {
        dispatch({ actionType: "SET_KEYPAD_HEIGHT", payload: height });
    }

    function onNumKeypadChange(number) {
        const { currentKeypadType, keypadAmount } = state;

        if (number === "0" && !keypadAmount) return;

        const rawAmt = !number ? "" : parseInt(number, 10) / 100;
        const dispAmt = !number ? "" : numeral(rawAmt).format("0,0.00");
        const payload = {
            dispAmt,
            rawAmt,
            keypadAmt: number,
        };

        switch (currentKeypadType) {
            case "GROSS_INCOME":
                dispatch({
                    actionType: "SET_GROSS_INCOME",
                    payload: {
                        grossIncomeDisplayAmt: payload?.dispAmt,
                        grossIncomeRawAmt: payload?.rawAmt,
                        grossIncomeKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "HOUSING_LOAN":
                dispatch({
                    actionType: "SET_HOUSING_LOAN",
                    payload: {
                        housingLoanDisplayAmt: payload?.dispAmt,
                        housingLoanRawAmt: payload?.rawAmt,
                        housingLoanKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "PERSONAL_LOAN":
                dispatch({
                    actionType: "SET_PERSONAL_LOAN",
                    payload: {
                        personalLoanDisplayAmt: payload?.dispAmt,
                        personalLoanRawAmt: payload?.rawAmt,
                        personalLoanKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "CC_REPAYMENTS":
                dispatch({
                    actionType: "SET_CC_REPAYMENTS",
                    payload: {
                        creditCardDisplayAmt: payload?.dispAmt,
                        creditCardRawAmt: payload?.rawAmt,
                        creditCardKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "CAR_LOAN":
                dispatch({
                    actionType: "SET_CAR_LOAN",
                    payload: {
                        carLoanDisplayAmt: payload?.dispAmt,
                        carLoanRawAmt: payload?.rawAmt,
                        carLoanKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "OVERDRAFT":
                dispatch({
                    actionType: "SET_OVERDRAFT",
                    payload: {
                        overdraftDisplayAmt: payload?.dispAmt,
                        overdraftRawAmt: payload?.rawAmt,
                        overdraftKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "NON_BANK_COMMIT":
                dispatch({
                    actionType: "SET_NON_BANK_COMMIT",
                    payload: {
                        nonBankCommitDisplayAmt: payload?.dispAmt,
                        nonBankCommitRawAmt: payload?.rawAmt,
                        nonBankCommitKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            default:
                break;
        }
    }

    function onNumKeypadDone() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });
    }

    function showNonBankCommitInfoPopup() {
        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: true,
        });
    }

    function closeNonBankCommitInfoPopup() {
        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: false,
        });
    }

    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_INCOME_COMMITMENT,
            formData,
            navParams,
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
        // Hide popup
        closeExitPopup();
        resetToApplication();
    }

    function closeExitPopup() {
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function closeCancelRemovePopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        setLoading(false);
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (savedData?.isSaveData === "Y" && success) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    ...navParams,
                    savedData,
                    cancelReason,
                    propertyDetails,
                    reload: true,
                },
            });
        } else {
            resetToApplication();
        }
    }

    function onCancelEditPopupLeave() {
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
        dispatch({
            actionType: "SHOW_CANCEL_EDIT_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        console.warn("[JAIncomeCommitment] >> [onContinue]");
        setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const ccrisLoanCount = navParams?.ccrisLoanCount ?? null;
        // // Retrieve form data
        const formData = getFormData();
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }

        if (ccrisReportFlag && ccrisLoanCount && parseInt(ccrisLoanCount) > 0) {
            // // Save Input data before checking eligibility
            const { syncId } = await saveEligibilityInput(
                {
                    screenName: JA_INCOME_COMMITMENT,
                    formData,
                    navParams: route?.params,
                    editFlow,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );
            // If CCRIS report is available & loan count fetched in report is greater than zero then Navigate to Fiance declaration screen.
            if (syncId != null) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: JA_CEF_IN_DECLARATION,
                    params: {
                        ...navParams,
                        ...formData,
                    },
                });
            }
        } else {
            // Save Input data before checking eligibility
            const response = await saveEligibilityInput(
                {
                    screenName: JA_INCOME_COMMITMENT,
                    formData,
                    navParams: route?.params,
                    editFlow,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );

            if (response?.stpId) {
                navParams.applicationStpRefNo = response?.stpId;
            }
            navigation.navigate(BANKINGV2_MODULE, {
                screen: editFlow ? JA_CONFIRMATION : JA_TNC,
                params: {
                    ...navParams,
                    ...formData,
                },
            });
        }
        setLoading(false);
    }

    function getFormData() {
        const {
            grossIncomeRawAmt,
            nonBankCommitRawAmt,
            carLoanRawAmt,
            personalLoanRawAmt,
            creditCardRawAmt,
            overdraftRawAmt,
            existHouseLoanValue,
            housingLoanRawAmt,
        } = state;

        return {
            grossIncome: String(grossIncomeRawAmt),
            isFirstTimeBuyHomeIndc,
            houseLoan: existHouseLoanValue,
            housingLoan: String(housingLoanRawAmt),
            personalLoan: String(personalLoanRawAmt),
            ccRepayments: String(creditCardRawAmt),
            carLoan: String(carLoanRawAmt),
            overdraft: String(overdraftRawAmt),
            nonBankCommitments: String(nonBankCommitRawAmt),
            progressStatus: PROP_ELG_INPUT,
        };
    }

    function monthlyGrossIcomePopup(payloadValue) {
        dispatch({
            actionType: "SHOW_MONTHLY_GROSS_INFO_POPUP",
            payload: payloadValue,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_FINANCIALCOMMITMENTS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow 
                                ? (
                                    <Typo
                                        text={EDIT}
                                        fontWeight="600"
                                        fontSize={12}
                                        lineHeight={16}
                                        color={BLACK}
                                    />
                                ) 
                                : (
                                    <Typo
                                        text={state.stepperInfo}
                                        fontWeight="600"
                                        fontSize={12}
                                        lineHeight={16}
                                        color={FADE_GREY}
                                    />
                                )
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
                        <ScrollView
                            style={Style.container}
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={editFlow ? EDIT_PERSONAL_DETAILS : JOINT_APPLICATION}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Description */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.label}
                                text={ENTER_MONTHLY_INCOME}
                                textAlign="left"
                            />

                            {/* Monthly gross income */}
                            <AmountInput
                                label={MONTHLY_GROSS_INCOME}
                                onPress={onGrossIncomePress}
                                value={state.grossIncomeDisplayAmt}
                                infoIcon
                                infoIconPress={() => monthlyGrossIcomePopup(true)}
                            />

                            {/* first time purchasing */}
                            <RadioYesNo
                                label={FIRST_TIME_PURCHASING_HOUSE}
                                defaultValue={isFirstTimeBuyHomeIndc}
                                onChange={onPressFirstTimePurchasingRadio}
                            />

                            {/* Existing housing loans */}
                            {isFirstTimeBuyHomeIndc === "N" && (
                                <LabeledDropdown
                                    label={EXISTING_HOME_FINANCING}
                                    dropdownValue={state.existHouseLoan}
                                    onPress={onExistHouseLoanTap}
                                    style={Style.fieldViewCls}
                                />
                            )}

                            {/* Home financing notes */}
                            <Typo
                                fontSize={12}
                                lineHeight={16}
                                style={Style.homeFinancingNotes}
                                color={DARK_GREY}
                                text={HOME_FINANCING_NOTES}
                                textAlign="left"
                            />

                            {/* Housing financing */}
                            <AmountInput
                                label={HOME_FINANCING}
                                onPress={onHousingLoanPress}
                                value={state.housingLoanDisplayAmt}
                                show={showHousingLoan}
                            />

                            {/* Personal financing */}
                            <ExpandField
                                label={PERSONAL_FINANCING}
                                show={!ccrisReportFlag && !showPersonalLoan}
                                onExpandPress={() => onExpandField("EXPAND_FIELD")}
                            />
                            <AmountInput
                                label={PERSONAL_FINANCING}
                                onPress={onPersonalLoanPress}
                                value={state.personalLoanDisplayAmt}
                                show={!ccrisReportFlag && showPersonalLoan}
                            />

                            {/* CC Repayments */}
                            <ExpandField
                                label={CREADIT_CARD_REPAYMENTS}
                                show={!ccrisReportFlag && !showCreditCard}
                                onExpandPress={() => onExpandField("showCreditCard")}
                            />
                            <AmountInput
                                label={CREADIT_CARD_REPAYMENTS}
                                onPress={onCCRepaymentsPress}
                                value={state.creditCardDisplayAmt}
                                note="Enter your monthly minimum payment"
                                show={!ccrisReportFlag && showCreditCard}
                            />

                            {/* Car financing */}
                            <ExpandField
                                label={CAR_FINANCING}
                                show={!ccrisReportFlag && !showCarLoan}
                                onExpandPress={() => onExpandField("showCarLoan")}
                            />
                            <AmountInput
                                label={CAR_FINANCING}
                                onPress={onCarLoanPress}
                                value={state.carLoanDisplayAmt}
                                show={!ccrisReportFlag && showCarLoan}
                            />

                            {/* Overdraft */}
                            <ExpandField
                                label={OVERDRAFT}
                                show={!ccrisReportFlag && !showOverdraft}
                                onExpandPress={() => onExpandField("showOverdraft")}
                            />
                            <AmountInput
                                label={OVERDRAFT}
                                onPress={onOverdraftPress}
                                value={state.overdraftDisplayAmt}
                                note={MONTHLY_INTREST_PAYMENT}
                                show={!ccrisReportFlag && showOverdraft}
                            />

                            {/* Non-bank commitments */}
                            {ccrisReportFlag 
                            ? (
                                <AmountInput
                                    label={NON_BANK_COMMITMENTS}
                                    subLabel="(Optional)"
                                    onPress={onNonBankCommitPress}
                                    value={state.nonBankCommitDisplayAmt}
                                    note={NON_BANK_COMMITMENTS}
                                    infoIcon
                                    infoIconPress={showNonBankCommitInfoPopup}
                                />
                            ) 
                            : (
                                <>
                                    <ExpandField
                                        label={NON_BANK_COMMITMENTS}
                                        infoIcon
                                        infoIconPress={showNonBankCommitInfoPopup}
                                        show={!ccrisReportFlag && !showNonBankCommit}
                                        onExpandPress={() => onExpandField("showNonBankCommit")}
                                    />
                                    <AmountInput
                                        label={NON_BANK_COMMITMENTS}
                                        onPress={onNonBankCommitPress}
                                        value={state.nonBankCommitDisplayAmt}
                                        note={NON_BANK_COMMITMENTS}
                                        infoIcon
                                        infoIconPress={showNonBankCommitInfoPopup}
                                        show={!ccrisReportFlag && showNonBankCommit}
                                    />
                                </>
                            )}

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={Style.bottomSpacer} />
                        </ScrollView>

                        {/* Vertical Spacer */}
                        <View
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={{
                                height: showNumPad ? numKeypadHeight : 0,
                            }}
                        />

                        {/* Bottom docked button container */}
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
                                            text={SAVE_NEXT}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </FixedActionContainer>
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Sliding Numerical Keypad */}
            <SlidingNumPad
                showNumPad={showNumPad}
                value={state.keypadAmount}
                onChange={onNumKeypadChange}
                onDone={onNumKeypadDone}
                getHeight={getKeypadHeight}
            />

            {/* Existing housing loan Picker */}
            {state.existHouseLoanData && (
                <ScrollPickerView
                    showMenu={state.existHouseLoanPicker}
                    list={state.existHouseLoanData}
                    selectedIndex={state.existHouseLoanValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Non-Bank Commitments Info Popup */}
            <Popup
                visible={state.nonBankCommitInfoPopup}
                title={MONTHLY_NONBANK_COMMITMENTS}
                description={MONTHLY_COMMITMENTS_DESC}
                onClose={closeNonBankCommitInfoPopup}
            />

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={EXIT_JA_POPUP_TITLE}
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
                visible={state.cancelEditPopup}
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
            {/*Application Removed popup */}
            <Popup
                visible={state.showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeCancelRemovePopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
            {/* Monthly Gross Info popup */}
            <Popup
                visible={state.showMonthlyGrossIcome}
                title={MONTHLY_GROSS_INCOME_TITLE}
                description={MONTHLY_GROSS_INCOME_BEFORE_DEDUCTIONS}
                onClose={() => monthlyGrossIcomePopup(false)}
            />
        </>
    );
}

JAIncomeCommitment.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomSpacer: {
        marginTop: 60,
    },

    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    fieldViewCls: {
        marginBottom: 5,
    },

    homeFinancingNotes: {
        paddingBottom: 28,
    },

    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },
});

export default JAIncomeCommitment;

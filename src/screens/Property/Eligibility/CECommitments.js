/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-use-before-define */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useRef, useCallback, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import {
    CE_PF_NUMBER,
    CE_COMMITMENTS,
    CE_FIN_DECLARATION,
    BANKINGV2_MODULE,
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

import { FAProperty } from "@services/analytics/analyticsProperty";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED_TEXT,
    DISABLED,
    BLACK,
    FADE_GREY,
    DARK_GREY,
} from "@constants/colors";
import { EXISTING_LOANS_DATA } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_TITLE,
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
    ENTER_MONTHLY_INCOME,
    HOME_FINANCING_NOTES,
    MONTHLY_NONBANK_COMMITMENTS,
    MONTHLY_GROSS_INCOME_BEFORE_DEDUCTIONS,
    MONTHLY_GROSS_INCOME_TITLE,
    MONTHLY_COMMITMENTS_DESC,
    NON_BANK_COMMITMENTS,
    EXISTING_HOME_FINANCING,
    HOME_FINANCING,
    PERSONAL_FINANCING,
    CAR_FINANCING,
    OVERDRAFT,
    CREDIT_CARD_REPAYMENT,
    ENTER_YOUR_MONTHLY_NON_BANK_COMM,
    FIRST_TIME_PURCHASING_HOUSE,
    FA_PROPERTY_CE_FINANCIALDETAILS,
    FA_PROPERTY_CE_FINANCIALCOMMITMENTS,
    FA_PROPERTY_CE_SAVEPROGRESS,
    ENTER_MONTHLY_INT_PAYMENT,
    ENTER_MONTHLY_MIN_PAYMENT,
} from "@constants/strings";

import AmountInput from "../Common/AmountInput";
import ExpandField from "../Common/ExpandField";
import { useResetNavigation, getExistingData } from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import SlidingNumPad from "../Common/SlidingNumPad";
import {
    saveEligibilityInput,
    removeCEEditRoutes,
    getCECommittmentUIData,
    getPrepopulateAmount,
} from "./CEController";

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
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
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

function CECommitments({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const navigationState = useNavigationState((state) => state);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isFirstTimeBuyHomeIndc, setIsFirstTimeBuyHomeIndc] = useState("");

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
        loading,
    } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, [init]);

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
    }, [
        grossIncomeRawAmt,
        existHouseLoan,
        housingLoanRawAmt,
        showHousingLoan,
        isFirstTimeBuyHomeIndc,
    ]);

    // Event handler to show/hide Housing Loan amount field
    useEffect(() => {
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
    }, [existHouseLoanValue, ccrisReportFlag]);

    useEffect(() => {
        const screenName = route.params?.ccrisReportFlag
            ? FA_PROPERTY_CE_FINANCIALDETAILS
            : FA_PROPERTY_CE_FINANCIALCOMMITMENTS;
        FAProperty.onPressViewScreen(screenName);
    }, [route.params?.ccrisReportFlag]);

    const init = useCallback(() => {
        console.log("[CECommitments] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;
        const headerText = navParams?.headerText ?? "";
        const ccrisReportFlag = navParams?.ccrisReportFlag ?? false;

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && !paramsEditFlow && currentStep < totalSteps
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

        // Pre-populate data for resume OR editflow
        if (resumeFlow || paramsEditFlow) populateSavedData();

        setLoading(false);
    }, [route, navigation]);

    function onBackTap() {
        console.log("[CECommitments] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CECommitments] >> [onCloseTap]");

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

        if (!editFlow) {
            FAProperty.onPressViewScreen(FA_PROPERTY_CE_SAVEPROGRESS);
        }
    }

    function populateSavedData() {
        console.log("[CECommitments] >> [populateSavedData]");

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
        } = getCECommittmentUIData(navParams, savedData, paramsEditFlow);

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

        //Is First Time Purchase
        if (isFirstTimeBuyHomeIndc) {
            setIsFirstTimeBuyHomeIndc(isFirstTimeBuyHomeIndc);
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

    function onExistHouseLoanTap() {
        console.log("[CECommitments] >> [onExistHouseLoanTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "existHouseLoan",
        });
    }

    function onGrossIncomePress() {
        console.log("[CECommitments] >> [onGrossIncomePress]");

        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "GROSS_INCOME",
                amount: state.grossIncomeKeypadAmt,
            },
        });
    }

    function onHousingLoanPress() {
        console.log("[CECommitments] >> [onHousingLoanPress]");

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
        console.log("[CECommitments] >> [onPersonalLoanPress]");

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
        console.log("[CECommitments] >> [onCCRepaymentsPress]");

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
        console.log("[CECommitments] >> [onCarLoanPress]");

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
        console.log("[CECommitments] >> [onOverdraftPress]");

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

    function onPressFirstTimePurchasingRadio(value) {
        console.log("[CECommitments] >> [onPressFirstTimePurchasingRadio]");

        setIsFirstTimeBuyHomeIndc(value);
    }

    function onNonBankCommitPress() {
        console.log("[CECommitments] >> [onNonBankCommitPress]");

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

    function onPersonalLoanExpand() {
        console.log("[CECommitments] >> [onPersonalLoanExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showPersonalLoan: true,
            },
        });
    }

    function onCCRepaymentsExpand() {
        console.log("[CECommitments] >> [onCCRepaymentsExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showCreditCard: true,
            },
        });
    }

    function onCarLoanExpand() {
        console.log("[CECommitments] >> [onCarLoanExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showCarLoan: true,
            },
        });
    }

    function onOverdraftExpand() {
        console.log("[CECommitments] >> [onOverdraftExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showOverdraft: true,
            },
        });
    }

    function onNonBankCommitExpand() {
        console.log("[CECommitments] >> [onNonBankCommitExpand]");

        dispatch({
            actionType: "EXPAND_FIELD",
            payload: {
                showNonBankCommit: true,
            },
        });
    }

    function onPickerCancel() {
        console.log("[CECommitments] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[CECommitments] >> [onPickerDone]");

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
        console.log("[CECommitments] >> [showNonBankCommitInfoPopup]");

        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: true,
        });
    }

    function closeNonBankCommitInfoPopup() {
        console.log("[CECommitments] >> [closeNonBankCommitInfoPopup]");

        dispatch({
            actionType: "SHOW_NONBANK_COMMIT_INFO_POPUP",
            payload: false,
        });
    }

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    async function onExitPopupSave() {
        console.log("[CECommitments] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_COMMITMENTS,
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

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, SAVE);
    }

    function onExitPopupDontSave() {
        console.log("[CECommitments] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();
        resetToDiscover();

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, DONT_SAVE);
    }

    function closeExitPopup() {
        console.log("[CECommitments] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function onCancelEditPopupLeave() {
        console.log("[CECommitments] >> [onCancelEditPopupLeave]");

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
        console.log("[CECommitments] >> [closeCancelEditPopup]");

        dispatch({
            actionType: "SHOW_CANCEL_EDIT_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        console.log("[CECommitments] >> [onContinue]");
        setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const ccrisLoanCount = navParams?.ccrisLoanCount ?? null;

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        // Retrieve form data
        const formData = getFormData();

        // Save Input data before checking eligibility
        if (!editFlow) {
            await saveEligibilityInput(
                {
                    screenName: CE_COMMITMENTS,
                    formData,
                    navParams: route?.params,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );
        }

        if (ccrisReportFlag && ccrisLoanCount && ccrisLoanCount > 0) {
            // If CCRIS report is available & loan count fetched in report is greater than zero then Navigate to Fiance declaration screen.
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_FIN_DECLARATION,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                },
            });
        } else {
            // Save Input data before checking eligibility
            if (editFlow) {
                await saveEligibilityInput(
                    {
                        screenName: CE_COMMITMENTS,
                        formData,
                        navParams: route?.params,
                        saveData: resumeFlow ? "Y" : "N",
                    },
                    false
                );
            }

            // Navigate to PFNumber screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_PF_NUMBER,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                },
            });
        }

        const screenName = route.params?.ccrisReportFlag
            ? FA_PROPERTY_CE_FINANCIALDETAILS
            : FA_PROPERTY_CE_FINANCIALCOMMITMENTS;

        FAProperty.onPressFormProceed(screenName);
        setLoading(false);
    }

    function getFormData() {
        console.log("[CECommitments] >> [getFormData]");

        const {
            nonBankCommitRawAmt,
            carLoanRawAmt,
            personalLoanRawAmt,
            creditCardRawAmt,
            overdraftRawAmt,
        } = state;

        return {
            grossIncome: String(grossIncomeRawAmt),
            houseLoan: existHouseLoanValue,
            housingLoan: String(housingLoanRawAmt),
            personalLoan: String(personalLoanRawAmt),
            ccRepayments: String(creditCardRawAmt),
            carLoan: String(carLoanRawAmt),
            overdraft: String(overdraftRawAmt),
            isFirstTimeBuyHomeIndc,
            nonBankCommitments: String(nonBankCommitRawAmt),
        };
    }

    function showMonthlyGrossIcomePopup() {
        dispatch({
            actionType: "SHOW_MONTHLY_GROSS_INFO_POPUP",
            payload: true,
        });
    }
    function closeMonthlyGrossIcomePopup() {
        dispatch({
            actionType: "SHOW_MONTHLY_GROSS_INFO_POPUP",
            payload: false,
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
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    text={state.stepperInfo}
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
                            style={Style.container}
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={state.headerText}
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
                                label={MONTHLY_GROSS_INCOME_TITLE}
                                onPress={onGrossIncomePress}
                                value={state.grossIncomeDisplayAmt}
                                infoIcon
                                infoIconPress={showMonthlyGrossIcomePopup}
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
                                onExpandPress={onPersonalLoanExpand}
                            />
                            <AmountInput
                                label={PERSONAL_FINANCING}
                                onPress={onPersonalLoanPress}
                                value={state.personalLoanDisplayAmt}
                                show={!ccrisReportFlag && showPersonalLoan}
                            />

                            {/* CC Repayments */}
                            <ExpandField
                                label={CREDIT_CARD_REPAYMENT}
                                show={!ccrisReportFlag && !showCreditCard}
                                onExpandPress={onCCRepaymentsExpand}
                            />
                            <AmountInput
                                label={CREDIT_CARD_REPAYMENT}
                                onPress={onCCRepaymentsPress}
                                value={state.creditCardDisplayAmt}
                                note={ENTER_MONTHLY_MIN_PAYMENT}
                                show={!ccrisReportFlag && showCreditCard}
                            />

                            {/* Car financing */}
                            <ExpandField
                                label={CAR_FINANCING}
                                show={!ccrisReportFlag && !showCarLoan}
                                onExpandPress={onCarLoanExpand}
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
                                onExpandPress={onOverdraftExpand}
                            />
                            <AmountInput
                                label={OVERDRAFT}
                                onPress={onOverdraftPress}
                                value={state.overdraftDisplayAmt}
                                note={ENTER_MONTHLY_INT_PAYMENT}
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
                                    note={ENTER_YOUR_MONTHLY_NON_BANK_COMM}
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
                                        onExpandPress={onNonBankCommitExpand}
                                    />
                                    <AmountInput
                                        label={NON_BANK_COMMITMENTS}
                                        onPress={onNonBankCommitPress}
                                        value={state.nonBankCommitDisplayAmt}
                                        note={ENTER_YOUR_MONTHLY_NON_BANK_COMM}
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
                        <View style={Style.verticalSpacer(showNumPad, numKeypadHeight)} />

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

            {/* Monthly Gross Info popup */}
            <Popup
                visible={state.showMonthlyGrossIcome}
                title={MONTHLY_GROSS_INCOME_TITLE}
                description={MONTHLY_GROSS_INCOME_BEFORE_DEDUCTIONS}
                onClose={closeMonthlyGrossIcomePopup}
            />
        </>
    );
}

CECommitments.propTypes = {
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
    verticalSpacer: (showNumPad, numKeypadHeight) => ({
        height: showNumPad ? numKeypadHeight : 0,
    }),
});

export default CECommitments;

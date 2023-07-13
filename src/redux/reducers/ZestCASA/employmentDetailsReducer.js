import { validateEmployerName } from "@screens/ZestCASA/ZestCASAValidation";

import {
    EMPLOYER_NAME_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    MONTHLY_INCOME_ACTION,
    INCOME_SOURCE_ACTION,
    GET_OCCUPATION_DROPDOWN_ITEMS_ACTION,
    GET_SECTOR_DROPDOWN_ITEMS_ACTION,
    GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION,
    GET_MONTHLY_INCOME_DROPDOWN_ITEMS_ACTION,
    GET_INCOME_SOURCE_DROPDOWN_ITEMS_ACTION,
    EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION,
    EMPLOYMENT_DETAILS_CLEAR,
    EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
} from "@redux/actions/ZestCASA/employmentDetailsAction";

// Employment details default value
const initialState = {
    employerName: null,
    occupationIndex: null,
    occupationValue: null,
    sectorIndex: null,
    sectorValue: null,
    employmentTypeIndex: null,
    employmentTypeValue: null,
    monthlyIncomeIndex: null,
    monthlyIncomeValue: null,
    incomeSourceIndex: null,
    incomeSourceValue: null,

    occupationDropdownItems: [],
    sectorDropdownItems: [],
    employmentTypeDropdownItems: [],
    monthlyIncomeDropdownItems: [],
    incomeSourceDropdownItems: [],
    isEmploymentContinueButtonEnabled: false,
    isFromConfirmationScreenForEmploymentDetails: false,
    employerNameErrorMessage: null,
};

// Employment details reducer
export default function employmentDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_OCCUPATION_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                occupationDropdownItems: action.occupationDropdownItems,
            };

        case GET_SECTOR_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                sectorDropdownItems: action.sectorDropdownItems,
            };

        case GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                employmentTypeDropdownItems: action.employmentTypeDropdownItems,
            };

        case GET_MONTHLY_INCOME_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                monthlyIncomeDropdownItems: action.monthlyIncomeDropdownItems,
            };

        case GET_INCOME_SOURCE_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                incomeSourceDropdownItems: action.incomeSourceDropdownItems,
            };

        case EMPLOYER_NAME_ACTION:
            return {
                ...state,
                employerName: action.employerName,
                employerNameErrorMessage: validateEmployerName(action.employerName),
            };

        case OCCUPATION_ACTION:
            return {
                ...state,
                occupationIndex: action.occupationIndex,
                occupationValue: action.occupationValue,
            };

        case SECTOR_ACTION:
            return {
                ...state,
                sectorIndex: action.sectorIndex,
                sectorValue: action.sectorValue,
            };

        case EMPLOYMENT_TYPE_ACTION:
            return {
                ...state,
                employmentTypeIndex: action.employmentTypeIndex,
                employmentTypeValue: action.employmentTypeValue,
            };

        case MONTHLY_INCOME_ACTION:
            return {
                ...state,
                monthlyIncomeIndex: action.monthlyIncomeIndex,
                monthlyIncomeValue: action.monthlyIncomeValue,
            };

        case INCOME_SOURCE_ACTION:
            return {
                ...state,
                incomeSourceIndex: action.incomeSourceIndex,
                incomeSourceValue: action.incomeSourceValue,
            };

        case EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isEmploymentContinueButtonEnabled:
                    checkEmploymentDetailsContinueButtonStatus(state),
            };

        case EMPLOYMENT_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForEmploymentDetails:
                    action.isFromConfirmationScreenForEmploymentDetails,
            };

        case EMPLOYMENT_DETAILS_CLEAR:
            return {
                ...state,
                employerName: null,
                occupationIndex: null,
                occupationValue: null,
                sectorIndex: null,
                sectorValue: null,
                employmentTypeIndex: null,
                employmentTypeValue: null,
                monthlyIncomeIndex: null,
                monthlyIncomeValue: null,
                incomeSourceIndex: null,
                incomeSourceValue: null,

                occupationDropdownItems: [],
                sectorDropdownItems: [],
                employmentTypeDropdownItems: [],
                monthlyIncomeDropdownItems: [],
                incomeSourceDropdownItems: [],
                isEmploymentContinueButtonEnabled: false,
                employerNameErrorMessage: null,
            };

        default:
            return state;
    }
}

// Check employment details continue button status
export const checkEmploymentDetailsContinueButtonStatus = (state) => {
    return (
        state.employerName &&
        state.employerName.trim().length > 0 &&
        state.occupationIndex !== null &&
        state.occupationValue &&
        state.sectorIndex !== null &&
        state.sectorValue &&
        state.employmentTypeIndex !== null &&
        state.employmentTypeValue &&
        state.monthlyIncomeIndex !== null &&
        state.monthlyIncomeValue &&
        state.incomeSourceIndex !== null &&
        state.incomeSourceValue &&
        state.employerNameErrorMessage === null
    );
};

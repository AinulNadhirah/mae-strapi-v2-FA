import { validateEmployerName } from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    EMPLOYER_NAME_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    FROM_EMPLOYMENT_DURATION_ACTION,
    TO_EMPLOYMENT_DURATION_ACTION,
    GET_OCCUPATION_DROPDOWN_ITEMS_ACTION,
    GET_SECTOR_DROPDOWN_ITEMS_ACTION,
    GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION,
    GET_FROM_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
    GET_TO_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION,
    EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION,
    EMPLOYMENT_DETAILS_CLEAR,
    EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
} from "@redux/actions/ASBFinance/occupationInformationAction";

// Employment details default value
const initialState = {
    employerName: null,
    occupationIndex: null,
    occupationValue: null,
    sectorIndex: null,
    sectorValue: null,
    employmentTypeIndex: null,
    employmentTypeValue: null,
    fromEmploymentDurationIndex: null,
    fromEmploymentDurationValue: null,
    toEmploymentDurationIndex: null,
    toEmploymentDurationValue: null,

    occupationDropdownItems: [],
    sectorDropdownItems: [],
    employmentTypeDropdownItems: [],
    fromEmploymentDurationDropdownItems: [],
    toEmploymentDurationDropdownItems: [],
    isEmploymentContinueButtonEnabled: false,
    isFromConfirmationScreenForEmploymentDetails: false,
    employerNameErrorMessage: null,
};

// Occupation Information reducer
export default function occupationInformationReducer(state = initialState, action) {
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

        case GET_FROM_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                fromEmploymentDurationDropdownItems: action.fromEmploymentDurationDropdownItems,
            };

        case GET_TO_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION:
            return {
                ...state,
                toEmploymentDurationDropdownItems: action.toEmploymentDurationDropdownItems,
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

        case FROM_EMPLOYMENT_DURATION_ACTION:
            return {
                ...state,
                fromEmploymentDurationIndex: action.fromEmploymentDurationIndex,
                fromEmploymentDurationValue: action.fromEmploymentDurationValue,
            };

        case TO_EMPLOYMENT_DURATION_ACTION:
            return {
                ...state,
                toEmploymentDurationIndex: action.toEmploymentDurationIndex,
                toEmploymentDurationValue: action.toEmploymentDurationValue,
            };

        case EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION:
            console.log("EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION");
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
                fromEmploymentDurationIndex: null,
                fromEmploymentDurationValue: null,
                toEmploymentDurationIndex: null,
                toEmploymentDurationValue: null,

                occupationDropdownItems: [],
                sectorDropdownItems: [],
                employmentTypeDropdownItems: [],
                fromEmploymentDurationDropdownItems: [],
                toEmploymentDurationDropdownItems: [],
                isEmploymentContinueButtonEnabled: false,
                employerNameErrorMessage: null,
            };

        default:
            return state;
    }
}

// Check employment details continue button status
export const checkEmploymentDetailsContinueButtonStatus = (state) => {
    console.log("checkEmploymentDetailsContinueButtonStatus-> ", state.occupationIndex, state);
    console.log("checkIfUSeries", state.occupationValue);
    const occupationData = state && state.occupationValue?.value;
    if (occupationData?.charAt(0) == "U" || occupationData?.charAt(0) == "u") {
        return state.occupationIndex !== null && state.occupationValue;
    } else {
        return (
            state.employerName &&
            state.employerName.trim().length > 0 &&
            state.occupationIndex !== null &&
            state.occupationValue &&
            state.occupationValue !== "Please Select" &&
            state.sectorIndex !== null &&
            state.sectorValue &&
            state.sectorValue !== "Please Select" &&
            state.employmentTypeIndex !== null &&
            state.employmentTypeValue &&
            state.employmentTypeValue !== "Please Select" &&
            state.employerNameErrorMessage === null
        );
    }
};

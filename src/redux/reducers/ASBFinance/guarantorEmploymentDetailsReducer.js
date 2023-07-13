import { validateEmployerName } from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    GUARANTOR_EMPLOYER_NAME_ACTION,
    GUARANTOR_OCCUPATION_ACTION,
    GUARANTOR_SECTOR_ACTION,
    GUARANTOR_EMPLOYMENT_TYPE_ACTION,
    GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION,
    GUARANTOR_EMPLOYMENT_DETAILS_CLEAR,
} from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";

// Employment details default value
const initialState = {
    employerName: null,
    occupationIndex: null,
    occupationValue: null,
    sectorIndex: null,
    sectorValue: null,
    employmentTypeIndex: null,
    employmentTypeValue: null,

    employerNameErrorMessage: null,
    isUSeries: false,
    isEmploymentDetailsContinueButtonEnabled: false,
};

// Employment details reducer
export default function guarantorEmploymentDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_EMPLOYER_NAME_ACTION:
            return {
                ...state,
                employerName: action.employerName,
                employerNameErrorMessage: validateEmployerName(action.employerName),
            };

        case GUARANTOR_OCCUPATION_ACTION:
            return {
                ...state,
                occupationIndex: action.occupationIndex,
                occupationValue: action.occupationValue,
                isUSeries:
                    action.occupationValue?.value &&
                    (action.occupationValue?.value.charAt(0) === "U" ||
                        action.occupationValue?.value.charAt(0) === "u")
                        ? true
                        : false,
            };

        case GUARANTOR_SECTOR_ACTION:
            return {
                ...state,
                sectorIndex: action.sectorIndex,
                sectorValue: action.sectorValue,
            };

        case GUARANTOR_EMPLOYMENT_TYPE_ACTION:
            return {
                ...state,
                employmentTypeIndex: action.employmentTypeIndex,
                employmentTypeValue: action.employmentTypeValue,
            };

        case GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION:
            return {
                ...state,
                isEmploymentDetailsContinueButtonEnabled:
                    checkEmploymentDetailsContinueButtonStatus(state),
            };

        case GUARANTOR_EMPLOYMENT_DETAILS_CLEAR:
            return {
                ...state,
                employerName: null,
                occupationIndex: null,
                occupationValue: null,
                sectorIndex: null,
                sectorValue: null,
                employmentTypeIndex: null,
                employmentTypeValue: null,
                employerNameErrorMessage: null,

                isEmploymentDetailsContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check employment details continue button status
export const checkEmploymentDetailsContinueButtonStatus = (state) => {
    if (state.isUSeries) {
        return state.occupationIndex !== null && state.occupationValue;
    } else {
        return (
            state.employerName?.trim()?.length > 0 &&
            state.occupationValue &&
            state.sectorValue &&
            state.employmentTypeValue &&
            state.employerNameErrorMessage === null
        );
    }
};

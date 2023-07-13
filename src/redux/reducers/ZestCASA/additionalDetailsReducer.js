import {
    PRIMARY_INCOME_ACTION,
    PRIMARY_WEALTH_ACTION,
    ADDITIONAL_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION,
    ADDITIONAL_DETAILS_CLEAR,
    ADDITIONAL_DETAILS_CONFIRMATION_ACTION,
} from "@redux/actions/ZestCASA/additionalDetailsAction";

// Employment details default value
const initialState = {
    primaryIncomeIndex: null,
    primaryIncomeValue: null,
    primaryWealthIndex: null,
    primaryWealthValue: null,

    isAdditionalDetailsContinueButtonEnabled: false,
    isFromConfirmationScreenForAdditionalDetails: false,
};

// Source of fund details reducer
export default function additionalDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case PRIMARY_INCOME_ACTION:
            return {
                ...state,
                primaryIncomeIndex: action.primaryIncomeIndex,
                primaryIncomeValue: action.primaryIncomeValue,
            };

        case PRIMARY_WEALTH_ACTION:
            return {
                ...state,
                primaryWealthIndex: action.primaryWealthIndex,
                primaryWealthValue: action.primaryWealthValue,
            };

        case ADDITIONAL_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isAdditionalDetailsContinueButtonEnabled:
                    checkAdditionalDetailsContinueButtonStatus(state),
            };

        case ADDITIONAL_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForAdditionalDetails:
                    action.isFromConfirmationScreenForAdditionalDetails,
            };

        case ADDITIONAL_DETAILS_CLEAR:
            return {
                ...state,
                primaryIncomeIndex: null,
                primaryIncomeValue: null,
                primaryWealthIndex: null,
                primaryWealthValue: null,

                isAdditionalDetailsContinueButtonEnabled: false,
                isFromConfirmationScreenForAdditionalDetails: false,
            };

        default:
            return state;
    }
}

// Check source of funds continue button status
export const checkAdditionalDetailsContinueButtonStatus = (state) => {
    return (
        state.primaryIncomeIndex !== null &&
        state.primaryIncomeValue &&
        state.primaryWealthIndex !== null &&
        state.primaryWealthValue
    );
};

import {
    SELECT_CASA_ACTION,
    SELECT_CASA_CONTINUE_BUTTON_DISABLED_ACTION,
    SELECT_CASA_CLEAR,
} from "@redux/actions/ZestCASA/selectCASAAction";

const initialState = {
    accountIndex: null,
    accountCode: null,
    accountNumber: null,

    isSelectCASAContinueButtonEnabled: false,
};

// Select CASA reducer
export default function selectCASAReducer(state = initialState, action) {
    switch (action.type) {
        case SELECT_CASA_ACTION:
            return {
                ...state,
                accountIndex: action.accountIndex,
                accountCode: action.accountCode,
                accountNumber: action.accountNumber,
            };

        case SELECT_CASA_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isSelectCASAContinueButtonEnabled: checkSelectCASAContinueButtonStatus(state),
            };

        case SELECT_CASA_CLEAR:
            return {
                ...state,
                accountIndex: null,
                accountCode: null,
                accountNumber: null,

                isSelectCASAContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check select CASA continue button status
export const checkSelectCASAContinueButtonStatus = (state) => {
    return state.accountIndex !== null && state.accountCode && state.accountNumber;
};

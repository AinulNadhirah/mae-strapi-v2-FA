import {
    SELECT_FPX_BANK_ACTION,
    SELECT_FPX_BANK_CLEAR,
} from "@redux/actions/ZestCASA/selectFPXBankAction";

const initialState = {
    bankDetails: null,
};

// Select debit card reducer
export default function selectFPXBankReducer(state = initialState, action) {
    switch (action.type) {
        case SELECT_FPX_BANK_ACTION:
            return {
                ...state,
                bankDetails: action.bankDetails,
            };

        case SELECT_FPX_BANK_CLEAR:
            return {
                ...state,
                bankDetails: null,
            };

        default:
            return state;
    }
}

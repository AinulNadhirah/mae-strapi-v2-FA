import {
    DEBIT_CARD_SELECT_ACCOUNT_ACTION,
    DEBIT_CARD_SELECT_ACCOUNT_CONTINUE_BUTTON_DISABLED_ACTION,
    DEBIT_CARD_SELECT_ACCOUNT_CLEAR,
} from "@redux/actions/ZestCASA/debitCardSelectAccountAction";

const initialState = {
    debitCardSelectAccountIndex: null,
    debitCardSelectAccountCode: null,
    debitCardSelectAccountNumber: null,

    isDebitCardSelectAccountContinueButtonEnabled: false,
};

// Debit Card Select Account reducer
export default function debitCardSelectAccountReducer(state = initialState, action) {
    switch (action.type) {
        case DEBIT_CARD_SELECT_ACCOUNT_ACTION:
            return {
                ...state,
                debitCardSelectAccountIndex: action.debitCardSelectAccountIndex,
                debitCardSelectAccountCode: action.debitCardSelectAccountCode,
                debitCardSelectAccountNumber: action.debitCardSelectAccountNumber,
            };

        case DEBIT_CARD_SELECT_ACCOUNT_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isDebitCardSelectAccountContinueButtonEnabled:
                    checkSelectCASAContinueButtonStatus(state),
            };

        case DEBIT_CARD_SELECT_ACCOUNT_CLEAR:
            return {
                ...state,
                debitCardSelectAccountIndex: null,
                debitCardSelectAccountCode: null,
                debitCardSelectAccountNumber: null,
                isDebitCardSelectAccountContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check select CASA continue button status
export const checkSelectCASAContinueButtonStatus = (state) => {
    return (
        state.debitCardSelectAccountIndex !== null &&
        state.debitCardSelectAccountCode &&
        state.debitCardSelectAccountNumber
    );
};

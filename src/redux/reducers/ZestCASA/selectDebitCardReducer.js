import {
    SELECT_DEBIT_CARD_ACTION,
    SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION,
    SELECT_DEBIT_CARD_CLEAR,
} from "@redux/actions/ZestCASA/selectDebitCardAction";

const initialState = {
    debitCardIndex: null,
    debitCardValue: null,

    isSelectDebitCardContinueButtonEnabled: false,
};

// Select debit card reducer
export default function selectDebitCardReducer(state = initialState, action) {
    switch (action.type) {
        case SELECT_DEBIT_CARD_ACTION:
            return {
                ...state,
                debitCardIndex: action.debitCardIndex,
                debitCardValue: action.debitCardValue,
            };

        case SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isSelectDebitCardContinueButtonEnabled:
                    checkSelectDebitCardContinueButtonStatus(state),
            };

        case SELECT_DEBIT_CARD_CLEAR:
            return {
                ...state,
                debitCardIndex: null,
                debitCardValue: null,

                isSelectDebitCardContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check select debit card continue button status
export const checkSelectDebitCardContinueButtonStatus = (state) => {
    return state.debitCardIndex !== null && state.debitCardValue ? true : false;
};

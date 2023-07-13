import {
    DEBIT_CARD_ENTER_PIN,
    DEBIT_CARD_RE_ENTER_PIN,
    DEBIT_CARD_CLEAR_PIN,
    DEBIT_CARD_LAST_8_DIGIT_ENTER,
} from "@redux/actions/ZestCASA/debitCardPinAction";

const initialState = {
    enterPin: "",
    reEnterPin: "",
    debitCardLast8Digit: "",
};

export default function debitCardPinReducer(state = initialState, action) {
    switch (action.type) {
        case DEBIT_CARD_ENTER_PIN:
            return {
                ...state,
                enterPin: action.enterPin,
            };
        case DEBIT_CARD_RE_ENTER_PIN:
            return {
                ...state,
                reEnterPin: action.reEnterPin,
            };
        case DEBIT_CARD_LAST_8_DIGIT_ENTER:
            return {
                ...state,
                debitCardLast8Digit: action.debitCardLast8Digit,
            };

        case DEBIT_CARD_CLEAR_PIN:
            return {
                ...state,
                enterPin: "",
                reEnterPin: "",
                debitCardLast8Digit: "",
            };

        default:
            return state;
    }
}

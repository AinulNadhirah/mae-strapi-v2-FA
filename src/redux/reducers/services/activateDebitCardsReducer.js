import {
    ACTIVATE_DEBIT_CARDS_LOADING,
    ACTIVATE_DEBIT_CARDS_ERROR,
    ACTIVATE_DEBIT_CARDS_SUCCESS,
    ACTIVATE_DEBIT_CARDS_CLEAR,
} from "@redux/actions/services/activateDebitCardsAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    statusCode: null,
    statusDesc: null,
    error: null,
    data: null,
    msgBody: null,
    msgHeader: null,
    additionalStatusCodes: null,
};

// Reducer
function activateDebitCardsReducer(state = initialState, action) {
    switch (action.type) {
        case ACTIVATE_DEBIT_CARDS_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ACTIVATE_DEBIT_CARDS_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ACTIVATE_DEBIT_CARDS_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                msgBody: action.msgBody,
                msgHeader: action.msgHeader,
                additionalStatusCodes: action.additionalStatusCodes,
            };

        case ACTIVATE_DEBIT_CARDS_CLEAR:
            return {
                ...state,
                status: "idle",
                statusCode: null,
                statusDesc: null,
                error: null,
                data: null,
                msgBody: null,
                msgHeader: null,
                additionalStatusCodes: null,
            };

        default:
            return state;
    }
}

export default activateDebitCardsReducer;

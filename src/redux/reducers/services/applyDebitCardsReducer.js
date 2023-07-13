import {
    APPLY_DEBIT_CARDS_LOADING,
    APPLY_DEBIT_CARDS_ERROR,
    APPLY_DEBIT_CARDS_SUCCESS,
    APPLY_DEBIT_CARDS_CLEAR,
} from "@redux/actions/services/applyDebitCardsAction";

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
function applyDebitCardsReducer(state = initialState, action) {
    switch (action.type) {
        case APPLY_DEBIT_CARDS_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case APPLY_DEBIT_CARDS_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case APPLY_DEBIT_CARDS_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                msgBody: action.msgBody,
                msgHeader: action.msgHeader,
                additionalStatusCodes: action.additionalStatusCodes,
            };

        case APPLY_DEBIT_CARDS_CLEAR:
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

export default applyDebitCardsReducer;

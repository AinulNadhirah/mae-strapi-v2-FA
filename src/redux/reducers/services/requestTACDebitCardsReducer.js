import {
    REQUEST_TAC_DEBIT_CARDS_LOADING,
    REQUEST_TAC_DEBIT_CARDS_ERROR,
    REQUEST_TAC_DEBIT_CARDS_SUCCESS,
    REQUEST_TAC_DEBIT_CARDS_CLEAR,
} from "@redux/actions/services/requestTACDebitCardsAction";

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
    token: null,
};

// Reducer
function requestTACDebitCardsReducer(state = initialState, action) {
    switch (action.type) {
        case REQUEST_TAC_DEBIT_CARDS_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case REQUEST_TAC_DEBIT_CARDS_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case REQUEST_TAC_DEBIT_CARDS_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                msgBody: action.msgBody,
                msgHeader: action.msgHeader,
                additionalStatusCodes: action.additionalStatusCodes,
                token: action.token,
            };

        case REQUEST_TAC_DEBIT_CARDS_CLEAR:
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
                token: null,
            };

        default:
            return state;
    }
}

export default requestTACDebitCardsReducer;

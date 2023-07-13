import {
    GET_DEBIT_CARDS_LOADING,
    GET_DEBIT_CARDS_ERROR,
    GET_DEBIT_CARDS_SUCCESS,
    GET_DEBIT_CARDS_CLEAR,
} from "@redux/actions/services/getDebitCardsAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    statusCode: null,
    statusDesc: null,
    error: null,
    data: null,
    cardData: [],
};

// Reducer
function getDebitCardsReducer(state = initialState, action) {
    switch (action.type) {
        case GET_DEBIT_CARDS_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case GET_DEBIT_CARDS_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case GET_DEBIT_CARDS_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                cardData: action.cardData,
            };

        case GET_DEBIT_CARDS_CLEAR:
            return {
                ...state,
                status: "idle",
                statusCode: null,
                statusDesc: null,
                error: null,
                data: null,
                cardData: [],
            };

        default:
            return state;
    }
}

export default getDebitCardsReducer;

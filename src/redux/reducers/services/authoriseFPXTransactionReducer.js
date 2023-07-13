import {
    AUTHORISE_FPX_TRANSACTION_LOADING,
    AUTHORISE_FPX_TRANSACTION_ERROR,
    AUTHORISE_FPX_TRANSACTION_SUCCESS,
    AUTHORISE_FPX_TRANSACTION_CLEAR,
} from "@redux/actions/services/authoriseFPXTransactionAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    statusCode: null,
    statusDesc: null,
};

// Reducer
function authoriseFPXTransactionReducer(state = initialState, action) {
    switch (action.type) {
        case AUTHORISE_FPX_TRANSACTION_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case AUTHORISE_FPX_TRANSACTION_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case AUTHORISE_FPX_TRANSACTION_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
            };

        case AUTHORISE_FPX_TRANSACTION_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                statusCode: null,
                statusDesc: null,
            };

        default:
            return state;
    }
}

export default authoriseFPXTransactionReducer;

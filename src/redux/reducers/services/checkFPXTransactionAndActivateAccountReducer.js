import {
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_CLEAR,
} from "@redux/actions/services/checkFPXTransactionAndActivateAccountAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    statusCode: null,
    statusDesc: null,
    fpxTransactionId: null,
    refId: null,
    time: null,
};

// Reducer
function checkFPXTransactionAndActivateAccountReducer(state = initialState, action) {
    switch (action.type) {
        case CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                fpxTransactionId: action.fpxTransactionId,
                refId: action.refId,
                time: action.time,
            };

        case CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                statusCode: null,
                statusDesc: null,
                fpxTransactionId: null,
                refId: null,
                time: null,
            };

        default:
            return state;
    }
}

export default checkFPXTransactionAndActivateAccountReducer;

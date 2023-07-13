import {
    GET_ACCOUNT_LIST_LOADING,
    GET_ACCOUNT_LIST_ERROR,
    GET_ACCOUNT_LIST_SUCCESS,
    UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
    GET_ACCOUNT_LIST_CLEAR,
} from "@redux/actions/services/getAccountListAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    statusCode: null,
    statusDesc: null,
    total: null,
    totalMfca: null,
    name: null,
    maeAvailable: null,
    jointAccAvailable: null,
    productGroupings: null,
    accountListings: null,
};

// Reducer
function getAccountListReducer(state = initialState, action) {
    switch (action.type) {
        case GET_ACCOUNT_LIST_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case GET_ACCOUNT_LIST_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case GET_ACCOUNT_LIST_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                total: action.total,
                totalMfca: action.totalMfca,
                name: action.name,
                maeAvailable: action.maeAvailable,
                jointAccAvailable: action.jointAccAvailable,
                productGroupings: action.productGroupings,
                accountListings: action.accountListings,
            };

        case UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION:
            return {
                ...state,
                accountListings: action.accountListings,
                maeAvailable: action.maeAvailable,
            };

        case GET_ACCOUNT_LIST_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                statusCode: null,
                statusDesc: null,
                total: null,
                totalMfca: null,
                name: null,
                maeAvailable: null,
                jointAccAvailable: null,
                productGroupings: null,
                accountListings: null,
            };

        default:
            return state;
    }
}

export default getAccountListReducer;

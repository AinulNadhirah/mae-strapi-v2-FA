import {
    REQUEST_VERIFY_LOADING,
    REQUEST_VERIFY_ERROR,
    REQUEST_VERIFY_SUCCESS,
    REQUEST_VERIFY_CLEAR,
} from "@redux/actions/services/requestVerifyOtpAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
};

// Reducer
function requestVerifyOtpReducer(state = initialState, action) {
    switch (action.type) {
        case REQUEST_VERIFY_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case REQUEST_VERIFY_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case REQUEST_VERIFY_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case REQUEST_VERIFY_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
            };

        default:
            return state;
    }
}

export default requestVerifyOtpReducer;

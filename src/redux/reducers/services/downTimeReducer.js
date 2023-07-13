import {
    DOWNTIME_LOADING,
    DOWNTIME_ERROR,
    DOWNTIME_SUCCESS,
    DOWNTIME_CLEAR,
} from "@redux/actions/services/downTimeAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
};

// Reducer
function downTimeReducer(state = initialState, action) {
    switch (action.type) {
        case DOWNTIME_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case DOWNTIME_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case DOWNTIME_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case DOWNTIME_CLEAR:
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

export default downTimeReducer;

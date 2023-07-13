import {
    POTENTIAL_EARNING_LOADING,
    POTENTIAL_EARNING_ERROR,
    POTENTIAL_EARNING_SUCCESS,
    POTENTIAL_EARNING_CLEAR,
} from "@redux/actions/services/calculatePotentialEarningsAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
};

// Reducer
function calculatePotentialEarningsReducer(state = initialState, action) {
    switch (action.type) {
        case POTENTIAL_EARNING_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case POTENTIAL_EARNING_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case POTENTIAL_EARNING_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case POTENTIAL_EARNING_CLEAR:
            return {
                ...state,
                data: [],
            };

        default:
            return state;
    }
}

export default calculatePotentialEarningsReducer;

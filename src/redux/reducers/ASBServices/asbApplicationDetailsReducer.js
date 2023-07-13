import {
    ASB_APPLICAION_DEATAILS_LOADING,
    ASB_APPLICAION_DEATAILS_ERROR,
    ASB_APPLICAION_DEATAILS_SUCCESS,
    ASB_APPLICAION_DEATAILSP_CLEAR,
} from "@redux/actions/ASBServices/asbApplicationDetailsAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    data: null,
};

// Reducer
function asbApplicationDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_APPLICAION_DEATAILS_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ASB_APPLICAION_DEATAILS_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ASB_APPLICAION_DEATAILS_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ASB_APPLICAION_DEATAILSP_CLEAR:
            return {
                ...state,
                status: "idle",
                data: null,
            };

        default:
            return state;
    }
}

export default asbApplicationDetailsReducer;

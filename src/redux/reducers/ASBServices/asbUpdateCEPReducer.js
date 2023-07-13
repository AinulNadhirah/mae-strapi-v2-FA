import {
    ASB_UPDATE_CEP_LOADING,
    ASB_UPDATE_CEP_ERROR,
    ASB_UPDATE_CEP_SUCCESS,
    ASB_UPDATE_CEP_CLEAR,
} from "@redux/actions/ASBServices/asbUpdateCEPAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    data: null,
};

// Reducer
function asbUpdateCEPReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_UPDATE_CEP_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ASB_UPDATE_CEP_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ASB_UPDATE_CEP_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ASB_UPDATE_CEP_CLEAR:
            return {
                ...state,
                status: "idle",
                data: null,
            };

        default:
            return state;
    }
}

export default asbUpdateCEPReducer;

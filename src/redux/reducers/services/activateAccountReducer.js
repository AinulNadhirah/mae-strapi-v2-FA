import {
    ACTIVATE_ACCOUNT_LOADING,
    ACTIVATE_ACCOUNT_ERROR,
    ACTIVATE_ACCOUNT_SUCCESS,
    ACTIVATE_ACCOUNT_CLEAR,
    ZEST_CASA_ACTIVATE_ACCOUNT_BODY,
} from "@redux/actions/services/activateAccountAction";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    body: {},
};

// Reducer
function activateAccountReducer(state = initialState, action) {
    switch (action.type) {
        case ACTIVATE_ACCOUNT_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ACTIVATE_ACCOUNT_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ACTIVATE_ACCOUNT_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ACTIVATE_ACCOUNT_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                body: {},
            };

        case ZEST_CASA_ACTIVATE_ACCOUNT_BODY:
            return {
                ...state,
                idNo: action.state.idNo,
                mobileNo: action.state.mobileNo,
                body: zestActivateAccountBody(action.state),
            };

        default:
            return state;
    }
}

export default activateAccountReducer;

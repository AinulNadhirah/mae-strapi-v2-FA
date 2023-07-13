import {
    ACTIVATE_ACCOUNT_CASA_LOADING,
    ACTIVATE_ACCOUNT_CASA_ERROR,
    ACTIVATE_ACCOUNT_CASA_SUCCESS,
    ACTIVATE_ACCOUNT_CASA_CLEAR,
    ZEST_CASA_ACTIVATE_ACCOUNT_CASA_BODY,
} from "@redux/actions/services/activateAccountCASAAction";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    body: {},
};

// Reducer
function activateAccountCASAReducer(state = initialState, action) {
    switch (action.type) {
        case ACTIVATE_ACCOUNT_CASA_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ACTIVATE_ACCOUNT_CASA_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ACTIVATE_ACCOUNT_CASA_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ACTIVATE_ACCOUNT_CASA_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                body: {},
            };

        case ZEST_CASA_ACTIVATE_ACCOUNT_CASA_BODY:
            return {
                ...state,
                body: zestActivateAccountBody(action.state),
            };

        default:
            return state;
    }
}

export default activateAccountCASAReducer;

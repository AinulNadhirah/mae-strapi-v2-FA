import {
    ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING,
    ASB_DECLINE_BECOME_GUARANTOR_ERROR,
    ASB_DECLINE_BECOME_GUARANTOR_SUCCESS,
    ASB_DECLINE_BECOME_GUARANTOR_CLEAR,
} from "@redux/actions/ASBServices/asbDeclineBecomeAGuarantorAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    data: null,
};

// Reducer
function asbDeclineBecomeAGuarantor(state = initialState, action) {
    switch (action.type) {
        case ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ASB_DECLINE_BECOME_GUARANTOR_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ASB_DECLINE_BECOME_GUARANTOR_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ASB_DECLINE_BECOME_GUARANTOR_CLEAR:
            return {
                ...state,
                status: "idle",
                data: null,
            };

        default:
            return state;
    }
}

export default asbDeclineBecomeAGuarantor;

import {
    UPDATE_APPLICATION_FINANCE_DETAILS,
    GET_APPLICATION_FINANCE_DETAILS,
} from "@redux/actions/ASBFinance/asbFinanceDetailsAction";

// Employment details default value
const initialState = {
    applicationFinanceDetails: null,
};

// Occupation Information reducer
export default function asbFinanceDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case UPDATE_APPLICATION_FINANCE_DETAILS:
            return {
                ...state,
                applicationFinanceDetails: action.applicationFinanceDetails,
            };

        case GET_APPLICATION_FINANCE_DETAILS:
            return {
                ...state,
            };

        default:
            return state;
    }
}

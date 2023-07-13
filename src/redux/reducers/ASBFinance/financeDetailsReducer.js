import {
    FINANCE_DETAILS_LOAN_TYPE,
    FINANCE_DETAILS_LOAN_TYPE_CLEAR,
} from "@redux/actions/ASBFinance/financeDetailsAction";

const initialState = {
    loanTypeIsConv: false,
};

export default function financeDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case FINANCE_DETAILS_LOAN_TYPE:
            return {
                ...state,
                loanTypeIsConv: action.loanTypeIsConv,
            };

        case FINANCE_DETAILS_LOAN_TYPE_CLEAR:
            return {
                ...state,
                loanTypeIsConv: false,
            };

        default:
            return state;
    }
}

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";

const initialState = {
    eligibilitData: null,
    loanInformation: null,
    grassIncome: null,
    totalMonthNonBank: null,
};

export default function eligibilityReducer(state = initialState, action) {
    switch (action.type) {
        case ELIGIBILITY_SUCCESS:
            return {
                ...state,
                eligibilitData: action.data,
                loanInformation: action.loanInformation,
                grassIncome: action.grassIncome,
                totalMonthNonBank: action.totalMonthNonBank,
            };

        default:
            return state;
    }
}

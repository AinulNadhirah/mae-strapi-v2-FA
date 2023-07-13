import { validateMonthlyloanInformation } from "@screens/ASB/Financing/AsbFinanceValidation";
import { addCommas } from "@screens/ASB/Financing/helpers/ASBHelpers";

import {
    GUARANTOR_MONTHLY_GROSS_INCOME,
    GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
    GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE,
    GUARANTOR_INCOME_DETAILS_CLEAR,
} from "@redux/actions/ASBFinance/guarantorIncomeDetailsAction";

const initialState = {
    monthlyGrossInformation: null,
    totalMonthlyNonBNankingCommitments: null,
    incomeDetailsNextBottonEnable: false,

    monthlyloanInformationError: null,
    totalMonthlyNonBankingCommitmentsError: null,
};

export default function guarantorIncomeDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_MONTHLY_GROSS_INCOME:
            return {
                ...state,
                monthlyGrossInformation: addCommas(action.monthlyGrossInformation),
                monthlyloanInformationError: validateMonthlyloanInformation(
                    action.monthlyGrossInformation
                ),
            };

        case GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS:
            return {
                ...state,
                totalMonthlyNonBNankingCommitments: addCommas(
                    action.totalMonthlyNonBNankingCommitments
                ),
            };

        case GUARANTOR_INCOME_DETAILS_NEXT_BUTTON_ENABLE:
            return {
                ...state,
                incomeDetailsNextBottonEnable: checkIncomeDetailsNextBottonEnable(state),
            };

        case GUARANTOR_INCOME_DETAILS_CLEAR:
            return {
                ...state,
                monthlyGrossInformation: null,
                totalMonthlyNonBNankingCommitments: null,
                incomeDetailsNextBottonEnable: false,
                monthlyloanInformationError: null,
                totalMonthlyNonBankingCommitmentsError: null,
            };

        default:
            return state;
    }
}

const checkIncomeDetailsNextBottonEnable = (state) => {
    return (
        state.monthlyGrossInformation?.trim()?.length && state.monthlyloanInformationError == null
    );
};

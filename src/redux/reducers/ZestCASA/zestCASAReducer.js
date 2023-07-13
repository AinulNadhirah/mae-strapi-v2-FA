import { combineReducers } from "redux";

import accountDetailsReducer from "@redux/reducers/ZestCASA/accountDetailsReducer";
import additionalDetailsReducer from "@redux/reducers/ZestCASA/additionalDetailsReducer";
import debitCardPinReducer from "@redux/reducers/ZestCASA/debitCardPinReducer";
import debitCardResidentialDetailsReducer from "@redux/reducers/ZestCASA/debitCardResidentialDetailsReducer";
import debitCardSelectAccountReducer from "@redux/reducers/ZestCASA/debitCardSelectAccountReducer";
import declarationReducer from "@redux/reducers/ZestCASA/declarationReducer";
import editCASATransferAmountReducer from "@redux/reducers/ZestCASA/editCASATransferAmountReducer";
import employmentDetailsReducer from "@redux/reducers/ZestCASA/employmentDetailsReducer";
import entryReducer from "@redux/reducers/ZestCASA/entryReducer";
import identityDetailsReducer from "@redux/reducers/ZestCASA/identityDetailsReducer";
import personalDetailsReducer from "@redux/reducers/ZestCASA/personalDetailsReducer";
import residentialDetailsReducer from "@redux/reducers/ZestCASA/residentialDetailsReducer";
import selectCASAReducer from "@redux/reducers/ZestCASA/selectCASAReducer";
import selectDebitCardReducer from "@redux/reducers/ZestCASA/selectDebitCardReducer";
import selectFPXBankReducer from "@redux/reducers/ZestCASA/selectFPXBankReducer";
import suitabilityAssessmentReducer from "@redux/reducers/ZestCASA/suitabilityAssessmentReducer";

import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

const combinedReducers = combineReducers({
    accountDetailsReducer,
    declarationReducer,
    editCASATransferAmountReducer,
    employmentDetailsReducer,
    entryReducer,
    identityDetailsReducer,
    personalDetailsReducer,
    residentialDetailsReducer,
    selectDebitCardReducer,
    suitabilityAssessmentReducer,
    additionalDetailsReducer,
    selectFPXBankReducer,
    selectCASAReducer,
    debitCardResidentialDetailsReducer,
    debitCardSelectAccountReducer,
    debitCardPinReducer,
});

const zestCASAReducer = (state, action) => {
    if (action.type === ZEST_CASA_CLEAR_ALL) {
        state = undefined;
    }
    return combinedReducers(state, action);
};

export default zestCASAReducer;

import { combineReducers } from "redux";

import SingleapplicantReducer from "@redux/reducers/ASBFinance/SingleApplicantReducer";
import SingleApplicantbookingform from "@redux/reducers/ASBFinance/SingleApplicantbookingform";
import asbFinanceReducer from "@redux/reducers/ASBFinance/asbFinanceReducer";
import eligibilityReducer from "@redux/reducers/ASBFinance/eligibilityReducer";
import resumeReducer from "@redux/reducers/ASBFinance/resumeReducer";
import asbServicesReducer from "@redux/reducers/ASBServices";
import zestCasaReducer from "@redux/reducers/ZestCASA/zestCASAReducer";
import activateAccountCASAReducer from "@redux/reducers/services/activateAccountCASAReducer";
import activateAccountReducer from "@redux/reducers/services/activateAccountReducer";
import activateDebitCardsReducer from "@redux/reducers/services/activateDebitCardsReducer";
import applyDebitCardsReducer from "@redux/reducers/services/applyDebitCardsReducer";
import authoriseFPXTransactionReducer from "@redux/reducers/services/authoriseFPXTransactionReducer";
import calculatePotentialEarningsReducer from "@redux/reducers/services/calculatePotentialEarningsReducer";
import checkFPXTransactionAndActivateAccountReducer from "@redux/reducers/services/checkFPXTransactionAndActivateAccountReducer";
import createAccountReducer from "@redux/reducers/services/createAccountReducer";
import debitCardInquiryReducer from "@redux/reducers/services/debitcardInquiryReducer";
import downTimeReducer from "@redux/reducers/services/downTimeReducer";
import draftUserAccountInquiryReducer from "@redux/reducers/services/draftUserAccountInquiryReducer";
import getAccountListReducer from "@redux/reducers/services/getAccountListReducer";
import getBankListReducer from "@redux/reducers/services/getBankListReducer";
import getDebitCardsReducer from "@redux/reducers/services/getDebitCardsReducer";
import masterDataReducer from "@redux/reducers/services/masterDataReducer";
import prePostQualReducer from "@redux/reducers/services/prePostQualReducer";
import requestTACDebitCardsReducer from "@redux/reducers/services/requestTACDebitCardsReducer";
import requestVerifyOtpReducer from "@redux/reducers/services/requestVerifyOtpReducer";
import scorePartyReducer from "@redux/reducers/services/scorePartyReducer";

const rootReducer = combineReducers({
    zestCasaReducer,
    masterDataReducer,
    downTimeReducer,
    prePostQualReducer,
    requestVerifyOtpReducer,
    createAccountReducer,
    scorePartyReducer,
    getBankListReducer,
    authoriseFPXTransactionReducer,
    checkFPXTransactionAndActivateAccountReducer,
    getAccountListReducer,
    activateAccountReducer,
    activateAccountCASAReducer,
    draftUserAccountInquiryReducer,
    getDebitCardsReducer,
    applyDebitCardsReducer,
    requestTACDebitCardsReducer,
    activateDebitCardsReducer,
    debitCardInquiryReducer,

    calculatePotentialEarningsReducer,
    asbFinanceReducer,
    SingleapplicantReducer,
    SingleApplicantbookingform,
    eligibilityReducer,
    asbServicesReducer,
    resumeReducer,
});

export default rootReducer;

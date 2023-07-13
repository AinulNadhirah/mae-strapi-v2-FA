import { combineReducers } from "redux";

import asbFinanceDetailsReducer from "@redux/reducers/ASBFinance/asbFinanceDetailsReducer";
import financeDetailsReducer from "@redux/reducers/ASBFinance/financeDetailsReducer";
import guarantorDeclarationReducer from "@redux/reducers/ASBFinance/guarantorDeclarationReducer";
import guarantorEmploymentDetailsReducer from "@redux/reducers/ASBFinance/guarantorEmploymentDetailsReducer";
import guarantorFatcaDeclarationReducer from "@redux/reducers/ASBFinance/guarantorFatcaDeclarationReducer";
import guarantorIdentityDetailsReducer from "@redux/reducers/ASBFinance/guarantorIdentityDetailsReducer";
import guarantorIncomeDetailsReducer from "@redux/reducers/ASBFinance/guarantorIncomeDetailsReducer";
import guarantorPersonalInformationReducer from "@redux/reducers/ASBFinance/guarantorPersonalInformationReducer";
import occupationInformation2Reducer from "@redux/reducers/ASBFinance/occupationInformation2Reducer";
import occupationInformationReducer from "@redux/reducers/ASBFinance/occupationInformationReducer";
import personalInformationReducer from "@redux/reducers/ASBFinance/personalInformationReducer";

import { ASB_FINANCE_CLEAR_ALL } from "@constants/strings";

const combinedReducers = combineReducers({
    personalInformationReducer,
    occupationInformationReducer,
    occupationInformation2Reducer,
    asbFinanceDetailsReducer,
    guarantorIdentityDetailsReducer,
    guarantorPersonalInformationReducer,
    guarantorEmploymentDetailsReducer,
    guarantorDeclarationReducer,
    guarantorIncomeDetailsReducer,
    guarantorFatcaDeclarationReducer,
    financeDetailsReducer,
});

const asbFinanceReducer = (state, action) => {
    if (action.type === ASB_FINANCE_CLEAR_ALL) {
        state = null;
    }
    return combinedReducers(state, action);
};

export default asbFinanceReducer;

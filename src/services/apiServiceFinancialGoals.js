import { METHOD_GET, METHOD_POST, TOKEN_TYPE_MAYA } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

import ApiManager from "./ApiManager";

export const getGoalCount = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goals`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getCustomerRisk = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/risk`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getRiskQuestionnaire = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/get/questionnaire`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const saveRiskQuestionnaire = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/financial/v1/customer/save/questionnaire`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const goalSimulation = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/financial/v1/customer/simulate/goal`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const saveGoalSimulation = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/financial/v1/customer/save/investment/goal`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const goalMiscData = async (goalType, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/menuitems/range?goalType=${goalType}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getFinancialGoalsList = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/details`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getGoalOverview = async (goalId, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/details/${goalId}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getModelPortfolio = async (goalType, timeHorizon, riskLevel, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/modelPortfolios/${goalType}/${timeHorizon}/${riskLevel}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const deleteGoalReason = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/redemption/reasons/DELETE_REASON`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const redempGoal = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/redemption`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getGoalMonetaryInfo = async (goalId, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/monetary/investment/details/${goalId}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const kickStartGoal = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/execute/goal`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const topupGoal = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/otd/create`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getGoalPerformance = async (
    goalId,
    investmentStartDate,
    mode,
    showPreloader = true
) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/performance/${goalId}?investmentStartDt=${investmentStartDate}&mode=${mode}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getTransactionHistory = async (goalId, offset, limit, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/transaction/history?goalId=${goalId}&offset=${offset}&limit=${limit}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const saveModelPortfolio = async (
    goalId,
    mpCode,
    nonFlexi,
    productCodeAllocationList,
    showPreloader = true
) => {
    let urlParam = "";
    if (nonFlexi) {
        urlParam = `${ENDPOINT_BASE}/financial/v1/customer/modelPortfolio/update?goalId=${goalId}&mpCode=${mpCode}`;
    } else {
        const allocationList = productCodeAllocationList.join("&productCodeAllocationList=");
        urlParam = `${ENDPOINT_BASE}/financial/v1/customer/modelPortfolio/update?goalId=${goalId}&mpCode=${mpCode}&productCodeAllocationList=${allocationList}`;
    }
    return ApiManager.service({
        url: urlParam,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const withdrawFundMisc = async (goalId, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/gbiSummary/${goalId}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getWithdrawReason = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/goal/redemption/reasons/WITHDRAW_REASON`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const deletePendingGoal = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/delete/pending/goal`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const saveContactNo = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/save/investment/contact`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getCommonParam = async (param, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/common/details/${param}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const saveGoalDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/update/details`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getAllEduTargetAmt = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/education/allTargetAmount`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const customerEligibilityCheck = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/custEligibilityCheck`,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const createUTAccount = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/saveClient`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const getUTReferenceData = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/getReferenceData`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

export const setUpFinancialsMAD = async (data, showPreloader = true) => {
    const url = `${ENDPOINT_BASE}/financial/v1/customer/mad/setup`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader,
    });
};

export const deactivateFinancialsMAD = async (gbiMonthlyInvId, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/financial/v1/customer/mad/deactivate/${gbiMonthlyInvId}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader,
    });
};

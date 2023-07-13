import ApiManager from "@services/ApiManager";

import { TOKEN_TYPE_M2U, METHOD_POST, METHOD_GET, METHOD_PUT } from "@constants/api";
import { ENDPOINT_BASE } from "@constants/url";

export const getPropertyList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getPropertyList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getPromoList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getPromoList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const loanCalculator = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/loanCalculator`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getPropertyPrice = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getPropertyPrice`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getPropertyDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getPropertyDetails`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getChatList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getChatList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
        promptError: false,
    });
};

export const getChatDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getChatDetails`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getGroupChat = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/groupChat`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getChatReadStatus = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getChatReadStatus`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
        promptError: false,
    });
};

export const updateBookmarkProperty = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/updateBookmark`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getBookmarkedPropertyList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getBookmarkedPropertyList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getDocumentsList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getDocumentsList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getDocument = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/chat/getDocument`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const eligibilityMasterData = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/masterData`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const eligibilityLoanDetails = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/loanDetails`,
        data: null,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getJAButtonData = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getJASwitchStatus`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getRFASwitchStatus = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getRFASwitchStatus`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const saveInputData = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/saveInputData`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const saveResultData = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/saveResultData`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getApplicationList = async (data, showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getApplicationList`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getApplicationDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getApplicationDetails`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getJointApplicationDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getJointApplicationDetails`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getProfileInfoDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getApplicants`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getUnlinkedMainApplicant = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getUnlinkedMainApplicant`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const eligibilityCheck = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/eligibilityCheck`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const jointApplicantEligibilityCheck = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/eligibilityCheckForJointApplicant`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const requestAssistance = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/requestAssistance`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const checkCCrisReportAvailability = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/checkCCrisReportAvailability`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getfilterCriteria = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getfilterCriteria`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const validatePFNumber = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/validatePFNumber`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const validateUnitNumber = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/validateUnitNumber`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const requestCCrisReport = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/requestCCrisReport`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const requestJACCrisReport = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/requestJACCrisReport`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const loanScoreParty = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/scoreParty`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const loanCancellation = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/loanCancellation`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const eligibilityResultStatus = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/eligibilityResultStatus`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getFinancingPlan = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/getFinancingPlan`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const tncAgreement = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/tcAgreement`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const loanSubmission = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/loan/loanSubmission`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const saveJAApplicantData = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/saveInputJointApplicantData`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const isExistingCustomer = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/isExistingCustomer`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};
export const JointApplicationInviteResponse = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/saveJAInviteResponse`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};
export const updateUserConsent = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/updateUserConsent`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};
export const getJAPendingInvitations = async (showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/getJAPendingInvitation`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};
export const eligibilityCheckJointApplicant = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/eligibilityCheckForJointApplicant`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};
export const removeJointApplicant = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/removeJointApplicant`,
        data,
        reqType: METHOD_PUT,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getPreLoginPropertyList = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getPreLoginPropertyList`,
        data,
        reqType: METHOD_POST,
        showPreloader,
    });
};

export const getPreLoginPropertyDetails = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/getPreLoginPropertyDetails`,
        data,
        reqType: METHOD_POST,
        showPreloader,
    });
};

export const pushNotificationToInviteJA = async (data, showPreloader = true) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/checkeligibility/pushNotificationToInviteJA`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const getPropertyStaffConsentCheck = async (showPreloader = false) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/home/v1/property/staffConsentCheck`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

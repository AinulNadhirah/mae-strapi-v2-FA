import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";

import ApiManager from "@services/ApiManager";
import { callCloudApi } from "@services/ApiManagerCloud";

import {
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    METHOD_POST,
    METHOD_GET,
    CONTENT_TYPE_URLENCODED,
    TOKEN_TYPE_M2U_TRANSFER,
    TIMEOUT,
} from "@constants/api";
import {
    ENDPOINT_BASE,
    LOAN_V1_ENDPOINT,
    GOAL_ENDPOINT_V1,
    IMG_V1_ENDPOINT,
    APPLEPAY_V1_ENDPOINT,
    TRANSFER_ENDPOINT_V1,
    BANKING_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V2,
    RPP_ENDPOINT_V1,
    GOAL_DOWNTIME,
} from "@constants/url";

// add new api in here
export const getS2WUuid = (data) => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/playinfo`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType, showPreloader: false });
};
export const getS2WgameEarnChance = (data) => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/gameEarnChance`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

export const checkS2WSpinWheelChances = () => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/spinwheel`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, reqType: method, tokenType, promptError: false });
};

export const checkS2WEarnedChances = (data) => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/has${data?.oneTime ? "OneTimeChance" : "Chance"}`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getCampaignTrackerSummary = async ({ uri, token }) => {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-APP-VERSION": DeviceInfo.getVersion(),
        "X-APP-ENVIRONMENT": Config.ENV_FLAG,
        Authorization: `bearer ${token}`,
    };

    return callCloudApi({ uri, method: "GET", headers });
};

export const launchMae = () => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/launchMAEApp`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const gameValidation = () => {
    const url = `${ENDPOINT_BASE}/campaign/v1/s2w/gameValidation`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url,
        contentType: CONTENT_TYPE_URLENCODED,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const rtpActionApi = (data) => {
    const url = TRANSFER_ENDPOINT_V2 + "/rtp/action";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const rtpAddFavoriteApi = (data) => {
    const url = TRANSFER_ENDPOINT_V1 + "/rtp/favorite/add";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getRtpFavoritesList = (suburl, data) => {
    const url = RPP_ENDPOINT_V1 + suburl;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getRtpList = (suburl, data) => {
    const url = RPP_ENDPOINT_V1 + suburl;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    data = { ...data, data: "CREATE_DATETIME", sortOrder: "DESC" };
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getRtpListV1 = (suburl, data) => {
    const url = TRANSFER_ENDPOINT_V1 + suburl;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    data = { ...data, data: "CREATE_DATETIME", sortOrder: "DESC" };
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const fundRtpTransferInquiryApi = (data) => {
    const url = RPP_ENDPOINT_V1 + "/inquiryAndValidate";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getClearTPK = async (data = null) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + "/resetPwd/getclearTpk",
        data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const forgotLoginVerifyPin = async (subUrl, data = null) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/resetPwd${subUrl}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const forgotLoginVerifyMaeUser = async (data = null) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + "/resetPwd/forgotLoginVerifyMaeUser",
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getASNBNewTransferEnum = () => {
    const url = `${ENDPOINT_BASE}/transfer/v1/asnb/inquiry`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const validateASNBNewTransferDetail = (data) => {
    const url = `${ENDPOINT_BASE}/transfer/v1/asnb/validateAcct`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getASNBFavouriteList = () => {
    const url = `${ENDPOINT_BASE}/banking/v1/asnb/getASNBAccountSummaryDetails?accType=ASNB&serviceType=ASNB_Transfer`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const transferFundToASNB = (data) => {
    const url = `${ENDPOINT_BASE}/transfer/v1/asnb/transfer`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const checkASNBProductDownTime = (productName = "") => {
    const url = `${ENDPOINT_BASE}/transfer/v1/asnb/checkTime/${productName}`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const addFavouriteASNBAccount = (data) => {
    const url = `${ENDPOINT_BASE}/transfer/v1/asnb/favorite/add`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getDonationData = (showPreloader) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/payment/v1/donation/contributions`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

/**
 * Send greeting
 */
export const sendGreeting = (data) => {
    const url = `${ENDPOINT_BASE}/notification/v1/deepavali/greeting/send`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const createSoloGoal = (data) => {
    const url = `${ENDPOINT_BASE}/goal/v2/goal/saveGoal`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const autoTopupInquiry = async (body, subUrl) => {
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url: ENDPOINT_BASE + "/" + subUrl,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        promptError: true,
        showPreloader: true,
    });
};

export const autoTopupRegister = async (data, loader = true, subUrl) => {
    const url = ENDPOINT_BASE + "/" + subUrl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const autoTopupDeregister = async (data, loader = true, subUrl) => {
    const url = ENDPOINT_BASE + "/" + subUrl;
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const updateSoundPref = (data) => {
    const url = `${ENDPOINT_BASE}/notification/v1/setting/customSoundUpdate`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const getSoundPref = (data) => {
    const url = `${ENDPOINT_BASE}/notification/v1/setting/customSound`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};
//campaign turn on/off
export const getCampaignAnimationState = async (uri, token) => {
    console.log("userPrefuserPref", token);
    const headers = {
        "Content-Type": "application/json",
        "X-APP-VERSION": DeviceInfo.getVersion(),
        "X-APP-ENVIRONMENT": Config.ENV_FLAG,
        Authorization: `bearer ${token}`,
    };

    return callCloudApi({
        uri: `${uri}/campaign/user-preferences`,
        body: null,
        method: "GET",
        headers,
    });
};

export const updateCampaignAnimationPref = async (uri, token, state) => {
    const headers = {
        "Content-Type": "application/json",
        "X-APP-VERSION": DeviceInfo.getVersion(),
        "X-APP-ENVIRONMENT": Config.ENV_FLAG,
        Authorization: `bearer ${token}`,
    };

    return callCloudApi({
        uri: `${uri}/campaign/preferences`,
        body: JSON.stringify({
            campaign_notification: state,
        }),
        method: "POST",
        headers,
    });
};

// PLSTP

export const plstpPrequalCheck = () => {
    const url = `${LOAN_V1_ENDPOINT}/loan/prequal1`; //remove
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, reqType: method, tokenType, secondTokenType });
};

export const validateIncome = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/validateIncome`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        secondTokenType,
        promptError: false,
    });
};

export const saveCRAData = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/saveCRAData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const plstpPrequalCheck2 = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/prequal2Check`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const savePPData = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/savePPData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const saveGeneralData = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/saveGeneralData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const saveEmploymentData = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/saveEmployeeData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const saveEmploymentAddress = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/saveOfficeData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const saveAdditionalData = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/saveAdditionalData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const calculateLoan = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/calculateLoan`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const PLRiskUpdate = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/riskUpdateData`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const pl2FA = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/pl2fa`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const PLFinalSubmit = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/finalSubmit`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        secondTokenType,
        promptError: false,
    });
};

export const scorePartyPLSTP = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/scoreParty`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const plstpCounterOffer = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/counterOffer`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        secondTokenType,
        promptError: false,
    });
};

export const plstpResumeInquiry = () => {
    const url = `${LOAN_V1_ENDPOINT}/loan/resumeInquiry`; //removeRes
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, reqType: method, tokenType });
};

export const plstpResumeData = () => {
    const url = `${LOAN_V1_ENDPOINT}/loan/resumeData`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({ url, reqType: method, tokenType, secondTokenType });
};

export const plstpResumeCounter = (data) => {
    const url = `${LOAN_V1_ENDPOINT}/loan/resumeCounter`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const plstpUploadDoc = (data, isMultipart = true) => {
    const url = `${IMG_V1_ENDPOINT}/loan/uploadDoc`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        secondTokenType,
        isMultipart,
    });
};

export const getCalculatedGoalESIFrequency = (startDate, endDate, amount) => {
    const url = `${GOAL_ENDPOINT_V1}/esi/calculate?startDate=${startDate}&endDate=${endDate}&amount=${amount}`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        showPreloader: false,
    });
};

export const deleteAccess = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}` + "/mae/v1/m2u/delete",
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader: false,
    });
};

export const deactivateM2UAccess = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}` + "/user/v1/iBDeactivate/m2uIBDeactivation",
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader: false,
        promptError: false,
    });
};

export const submitASNBConsent = (url, data) => {
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
    });
};

export const fetchFDSummary = (data) => {
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url: `${BANKING_ENDPOINT_V1}/fd/fdSummary`,
        data,
        reqType: method,
        tokenType,
    });
};

//Apple Pay

export const getAPEligibleCardsNew = (showPreloader, data) => {
    const url = `${APPLEPAY_V1_ENDPOINT}/cards`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader,
    });
};

export const apProvisionCard = (data) => {
    const url = `${APPLEPAY_V1_ENDPOINT}/provision`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const getAPPrompterDetails = () => {
    const url = `${APPLEPAY_V1_ENDPOINT}/prompter`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const getRsaChallengeQuestion = (data) => {
    const url = `${APPLEPAY_V1_ENDPOINT}/rsa`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

// kill switch
export const getCasaCardsListEnquiry = async (accType) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/summary/getListInquiry?accountType=${accType}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader: false,
    });
};

export const suspendCASA = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/freezeaccount`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const blockCards = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/freezeCards`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getOnlineBkngDetails = (data) => {
    const url = `${TRANSFER_ENDPOINT_V2}/rtp/redirectInquiry`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const fundTransferOnlineBkngApi = (data) => {
    const url = TRANSFER_ENDPOINT_V2 + "/fundTransfer/monetary/rtp/redirect";
    const body = data;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const onlineBkngRedirect = (data) => {
    const url = `${RPP_ENDPOINT_V1}/redirect/cancelPayment`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const merchantAPI = (data) => {
    const url = `${RPP_ENDPOINT_V1}/merchant/list`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const productInfo = (data) => {
    const url = `${RPP_ENDPOINT_V1}/merchant/product`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const productList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/merchant/productList`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const autoDebitAcceptance = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/acceptance`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const deregistrationPayer = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/deregistrationPayer`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const deregistrationMerchant = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/deregistrationMerchant`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentRegister = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/register`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentStatus = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/status`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentRejection = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/rejection`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentApproval = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/approval`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentIncomingRequest = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/incomingRequest`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentRequest = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/request`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentUpdate = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/update`;

    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const consentTransfer = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/transfer`;

    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const getBillingList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consentListing`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    data = { ...data, data: "CREATE_DATETIME", sortOrder: "DESC" };
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const getCancelReasonList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/util/cancelReason`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    data = { ...data };
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const nonMonetoryValidate = (data) => {
    const url = `${ENDPOINT_BASE}/2fa/v1/tac/validate`;
    const body = data;
    const token = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_POST,
        tokenType: token,
        promptError: true,
        showPreloader: true,
    });
};

export const getAutoDebitBlockedList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/merchant/blocked`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    data = { ...data, limit: 20 };
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};
export const unblockAutoDebitBlockedList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/merchant/unblock`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const chargeCustomerAPI = (data) => {
    const url = `${RPP_ENDPOINT_V1}/debit/request`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const consentEnquiry = (data) => {
    const url = `${TRANSFER_ENDPOINT_V2}/rtp/consentEnquiryId`;

    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: false,
    });
};

export const duitNowAutodebitList = (data) => {
    const url = `${RPP_ENDPOINT_V1}/consent/enquiry`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getAutoDebitOnlineBkngDetails = (data) => {
    const url = `${RPP_ENDPOINT_V1}/redirect/retrieveConsent`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};
export const consentRedirectUpdate = (data) => {
    const url = `${RPP_ENDPOINT_V1}/redirect/updateConsent`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, data, reqType: method, tokenType, secondTokenType });
};

export const getDuitNowFlags = (showPreloader) => {
    return ApiManager.service({
        url: `${RPP_ENDPOINT_V1}/util/flag`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader,
    });
};

export const senderDetails = () => {
    const url = `${RPP_ENDPOINT_V1}/util/senderDetails`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: null,
        reqType: method,
        tokenType,
        secondTokenType,
        showPreloader: true,
    });
};

export const getDebitCardListEnquiry = async () => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/cards/debitCardInquiry`,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader: false,
    });
};

export const blockDebitCard = async (data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/banking/v1/killSwitch/freezeDebitCard`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const checkGoalDowntime = async () => {
    const tokenType = TOKEN_TYPE_MAYA;
    return ApiManager.service({
        url: `${GOAL_ENDPOINT_V1}/${GOAL_DOWNTIME}`,
        reqType: METHOD_GET,
        tokenType,
    });
};

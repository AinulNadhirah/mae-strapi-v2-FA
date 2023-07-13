import ApiManagerSSO from "@services/ApiManagerSSO";
import ApiManager from "@services/ApiManager";

import {
    METHOD_GET,
    METHOD_POST,
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MDIP,
    TOKEN_TYPE_MAYA,
} from "@constants/api";
import {
    PREMIER_MASTER_DATA,
    PREMIER_REQUEST_OTP_ETB,
    PREMIER_GET_DEBIT_CARDS,
    PREMIER_GET_TOKEN,
    PREMIER_DEBIT_CARD_INQUIRY_URL,
    PREMIER_ACTIVATE_DEBIT_CARDS,
    PREMIER_REQUEST_TAC_DEBIT_CARDS,
    PREMIER_APPLY_DEBIT_CARDS,
    PREMIER_AUTHORISE_FPX_TRANSACTION,
    PREMIER_CREATE_ACCOUNT,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_ACTIVATE_ACCOUNT_VIA_CASA,
    PREMIER_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION,
    PREMIER_GET_BANK_LIST,
    PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
    PREMIER_GET_ACCOUNT_LIST,
    PREMIER_CHECK_DOWNTIME,
    PREMIER_PRE_POST_ETB,
    PREMIER_SCORE_PARTY,
    PREMIER_REQUEST_OTP,
    PREMIER_UPDATE_SEURITY_QUESTIONS_FLAG,
} from "@constants/premierUrl";
import { STP_ENDPOINT_BASE, ENDPOINT_BASE } from "@constants/url";

export const activateAccountService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_ACTIVATE_ACCOUNT}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: true,
    });

export const prePostQualService = (endpoint, data, needCallbackInExcaption) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${endpoint}`,
        data,
        reqType: METHOD_POST,
        tokenType:
            endpoint === PREMIER_RESUME_CUSTOMER_INQUIRY_ETB || endpoint === PREMIER_PRE_POST_ETB
                ? TOKEN_TYPE_MDIP
                : null,
        secondTokenType:
            endpoint === PREMIER_RESUME_CUSTOMER_INQUIRY_ETB || endpoint === PREMIER_PRE_POST_ETB
                ? TOKEN_TYPE_MAYA
                : null,
        promptError: !needCallbackInExcaption,
        showPreloader: true,
    });

export const checkDownTimeService = (subUrl, isPMA) =>
    ApiManagerSSO.service({
        url: subUrl ? `${STP_ENDPOINT_BASE}/${subUrl}` : `${STP_ENDPOINT_BASE}/${PREMIER_CHECK_DOWNTIME}`,
        data: null,
        reqType: METHOD_POST,
        promptError: true,
        showPreloader: true,
    });

export const activateAccountCASAService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_ACTIVATE_ACCOUNT_VIA_CASA}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: false,
        showPreloader: true,
        withToken: true,
    });

export const authoriseFPXTransactionService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_AUTHORISE_FPX_TRANSACTION}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
        withToken: true,
    });

export const checkFPXTransactionAndActivateAccountService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: false,
        showPreloader: true,
        withToken: true,
    });

export const createAccountService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_CREATE_ACCOUNT}`,
        data,
        reqType: METHOD_POST,
        promptError: true,
        showPreloader: true,
    });

export const draftUserAccountInquiryService = (subUrl, data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${subUrl}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: true,
    });

export const fetchAccountListService = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${PREMIER_GET_ACCOUNT_LIST}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
        withToken: true,
    });

export const fetchCASABankListService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_GET_BANK_LIST}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: false,
        showPreloader: true,
    });

export const fetchMasterDataServicePremier = () =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_MASTER_DATA}`,
        reqType: METHOD_GET,
        promptError: false,
        showPreloader: true,
    });

export const requestVerifyOtpService = (isNTB, data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${isNTB ? PREMIER_REQUEST_OTP : PREMIER_REQUEST_OTP_ETB}`,
        data,
        reqType: METHOD_POST,
        tokenType: isNTB ? null : TOKEN_TYPE_MDIP,
        promptError: true,
        showPreloader: true,
    });

export const scorePartyService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_SCORE_PARTY}`,
        data,
        reqType: METHOD_POST,
        promptError: true,
        showPreloader: true,
    });

export const requestGetDebitCards = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_GET_DEBIT_CARDS}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: true,
        showPreloader: true,
    });

export const applyDebitCardService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_APPLY_DEBIT_CARDS}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: true,
    });

export const requestTACDebitCardService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_REQUEST_TAC_DEBIT_CARDS}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: true,
        showPreloader: true,
    });

export const activateDebitCardService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_ACTIVATE_DEBIT_CARDS}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: true,
    });

export const debitCardInquiryService = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_DEBIT_CARD_INQUIRY_URL}`,
        reqType: METHOD_POST,
        data,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: false,
    });

export const getCasaToken = (token) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_GET_TOKEN}`,
        reqType: METHOD_POST,
        reqHeaders: {
            Authorization: `bearer ${token}`,
        },
        promptError: false,
        showPreloader: false,
    });

export const updatePremierSecurityQuestionsFlag = (data) =>
    ApiManagerSSO.service({
        url: `${STP_ENDPOINT_BASE}/${PREMIER_UPDATE_SEURITY_QUESTIONS_FLAG}`,
        reqType: METHOD_POST,
        data,
        promptError: false,
        showPreloader: false,
    });

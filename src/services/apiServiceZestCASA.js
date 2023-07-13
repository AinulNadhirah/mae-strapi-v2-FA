import {
    METHOD_GET,
    METHOD_POST,
    TOKEN_TYPE_MDIP,
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
} from "@constants/api";
import {
    PREMIER_GET_DEBIT_CARDS,
    PREMIER_APPLY_DEBIT_CARDS,
    PREMIER_REQUEST_TAC_DEBIT_CARDS,
    PREMIER_DEBIT_CARD_INQUIRY_URL,
    PREMIER_ACTIVATE_DEBIT_CARDS
} from "@constants/premierUrl";
import {
    ENDPOINT_BASE,
    STP_ENDPOINT_BASE,
    ZEST_CASA_ACTIVATE_ACCOUNT,
    ZEST_CASA_ACTIVATE_ACCOUNT_VIA_CASA,
    ZEST_CASA_AUTHORISE_FPX_TRANSACTION,
    ZEST_CASA_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION,
    ZEST_CASA_CREATE_ACCOUNT,
    ZEST_CASA_GET_ACCOUNT_LIST,
    ZEST_CASA_GET_BANK_LIST,
    ZEST_CASA_MASTER_DATA,
    ZEST_CASA_REQUEST_OTP,
    ZEST_CASA_REQUEST_OTP_ETB,
    ZEST_CASA_SCORE_PARTY,
} from "@constants/url";

import ApiManager from "./ApiManager";
import ApiManagerSSO from "./ApiManagerSSO";

export const activateAccountService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_ACTIVATE_ACCOUNT}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });

export const prePostQualService = (endpoint, data, needCallbackInExcaption) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${endpoint}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: needCallbackInExcaption ? false : true,
        showPreloader: true,
    });

export const checkDownTimeService = (subURL) =>
    ApiManager.service({
        url: subURL ? `${ENDPOINT_BASE}/${subURL}` : `${STP_ENDPOINT_BASE}/${subURL}`,
        data: null,
        reqType: METHOD_POST,
        promptError: true,
        showPreloader: true,
    });

export const activateAccountCASAService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_ACTIVATE_ACCOUNT_VIA_CASA}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });

export const authoriseFPXTransactionService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_AUTHORISE_FPX_TRANSACTION}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const checkFPXTransactionAndActivateAccountService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_CHECK_FPX_AND_ACTIVATE_ACCOUNT_TRANSACTION}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });

export const createAccountService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_CREATE_ACCOUNT}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const draftUserAccountInquiryService = (subUrl, data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${subUrl}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: false,
        showPreloader: true,
    });

export const fetchAccountListService = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_GET_ACCOUNT_LIST}`,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        secondTokenType: TOKEN_TYPE_MAYA,
        promptError: true,
        showPreloader: true,
    });

export const fetchBankListService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_GET_BANK_LIST}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const fetchMasterDataService = () =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_MASTER_DATA}`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const requestVerifyOtpService = (isNTB, data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${isNTB ? ZEST_CASA_REQUEST_OTP : ZEST_CASA_REQUEST_OTP_ETB}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: true,
    });

export const scorePartyService = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/${ZEST_CASA_SCORE_PARTY}`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
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

export const debitCardInquiryService = (data, isCASA) =>
ApiManagerSSO.service({
        // url: isCASA ? `${STP_ENDPOINT_BASE}/${PREMIER_DEBIT_CARD_INQUIRY_URL}` : `${ENDPOINT_BASE}/${DEBIT_CARD_INQUIRY_URL}`,
        url: `${STP_ENDPOINT_BASE}/${PREMIER_DEBIT_CARD_INQUIRY_URL}`,
        reqType: METHOD_POST,
        data,
        tokenType: TOKEN_TYPE_MDIP,
        promptError: false,
        showPreloader: false,
    });
    
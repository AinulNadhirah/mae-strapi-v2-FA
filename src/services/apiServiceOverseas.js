/**
 * API definition for OVERSEAS services
 */
import { METHOD_GET, METHOD_POST, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import { BAKONG_ENDPOINT, OVERSEAS_ENDPOINT_V1 } from "@constants/url";

import ApiManager from "./ApiManager";

export const getOverseasFavoriteList = (
    data = {
        favFTTInd: "Y",
        favRTInd: "Y",
        favBakongInd: "Y",
        favWUSenderInd: "Y",
        favWUBeneficiaryInd: "Y",
        favVisaInd: "Y",
    }
) => {
    const url = `${OVERSEAS_ENDPOINT_V1}/overseas/favorites`;
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

export const getRateInquiry = (data, showPreloader = true) => {
    const url = `${OVERSEAS_ENDPOINT_V1}/overseas/rateInquiry`;
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

export const validateVDCardNumber = (data) => {
    const url = `${OVERSEAS_ENDPOINT_V1}/overseas/visa/cardValidation`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const getDateValidate = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/validateCutOffDate`,
        data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const validateMOTBankAccount = (data) => {
    // endpoint for validateMOTBankAccount
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/accountInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getOverseasPurpose = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/purposeSubPurposeCode`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const performOverSeaTransfer = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/transfer`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const requestForQuotation = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/rfq2`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const getSenderDetails = () => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/senderDetails`,
        data: null,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const addTofav = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/addFavorite`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const requestFTTCharge = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/chargeInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuValidatePayment = (data) => {
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuValidatePayment`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const bakongWalletInquiry = (data) => {
    return ApiManager.service({
        url: `${BAKONG_ENDPOINT}/payment/walletInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuTxnList = () => {
    //early txn data
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuTxnListInquiry`,
        //data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuTxnInquiryReq = (data) => {
    //status txn
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuTxnInquiry`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuTxnStatusSearch = (data) => {
    //early cancelation
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuRefundSearch`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuRefundStore = (data) => {
    //early cancelation
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuRefundStore`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const wuPickupValidate = (data) => {
    //final cancelation, on click cancel
    return ApiManager.service({
        url: `${OVERSEAS_ENDPOINT_V1}/overseas/wuPickUpValidate`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

export const bauBakongDateValidation = (data) => {
    return ApiManager.service({
        url: `${BAKONG_ENDPOINT}/payment/dateValidate`,
        data,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_M2U,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: true,
    });
};

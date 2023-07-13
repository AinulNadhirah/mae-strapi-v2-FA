import ApiManager from "@services/ApiManager";

import {
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    METHOD_POST,
    METHOD_GET,
    TIMEOUT,
    TOKEN_TYPE_M2U_TRANSFER,
    METHOD_PUT,
    METHOD_DELETE,
} from "@constants/api";
import {
    ENDPOINT_BASE,
    WALLET_ENDPOINT_V1,
    S2U_ENDPOINT_V1,
    GOAL_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V2,
    PFM_ENDPOINT_V1,
    BANKING_ENDPOINT_V1,
    USERS_ENDPOINT_V2,
    BANKING_ENDPOINT_V2,
} from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

export const postTicketOrderDetails = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/orderDetails";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const initKLIA = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/initKLIA";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                let responseObject = respone.data;
                console.log(" RESPONSE RECEIVED: ", respone.data);
                let result;
                let ticketCodes;
                let ticketsFaresStation;
                let stationsList;
                let maxTotalTicket = 0;
                if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.message !== null &&
                    responseObject.message !== undefined &&
                    responseObject.message === "Success"
                ) {
                    console.log("response.data.result  RESPONSE RECEIVED: ", respone.data.result);
                    result = respone.data.result;
                    ModelClass.KLIA_DATA.initKliaData = result;

                    if (result != null && result != undefined) {
                        maxTotalTicket = result.maxTotalTicket;
                        stationsList = result.stationsList;
                        ticketCodes = result.ticketCodes;
                        ticketsFaresStation = result.ticketsFaresStation;

                        ModelClass.KLIA_DATA.maxTotalTicket = maxTotalTicket;
                        ModelClass.KLIA_DATA.stationsList = stationsList;
                        ModelClass.KLIA_DATA.ticketCodes = ticketCodes;
                        ModelClass.KLIA_DATA.ticketsFaresStation = ticketsFaresStation;
                        ModelClass.KLIA_DATA.klaiAdultReturn = ticketCodes.klaiAdultReturn;
                        ModelClass.KLIA_DATA.klaiAdultSingle = ticketCodes.klaiAdultSingle;
                        ModelClass.KLIA_DATA.klaiChildReturn = ticketCodes.klaiChildReturn;
                        ModelClass.KLIA_DATA.klaiChildSingle = ticketCodes.klaiChildSingle;

                        console.log("================================================= ");
                        console.log("maxTotalTicket : ", maxTotalTicket);
                        console.log("================================================= ");
                        console.log("stationsList : ", stationsList);
                        console.log("================================================= ");
                        console.log("ticketCodes : ", ticketCodes);
                        console.log(
                            "ModelClass.KLIA_DATA.klaiAdultReturn : ",
                            ModelClass.KLIA_DATA.klaiAdultReturn
                        );
                        console.log(
                            "ModelClass.KLIA_DATA.klaiAdultSingle : ",
                            ModelClass.KLIA_DATA.klaiAdultSingle
                        );
                        console.log(
                            "ModelClass.KLIA_DATA.klaiChildReturn : ",
                            ModelClass.KLIA_DATA.klaiChildReturn
                        );

                        console.log(
                            "ModelClass.KLIA_DATA.klaiChildSingle : ",
                            ModelClass.KLIA_DATA.klaiChildSingle
                        );

                        console.log("================================================= ");
                        if (
                            ticketCodes != undefined &&
                            ticketCodes != null &&
                            ticketsFaresStation != undefined &&
                            ticketsFaresStation != null
                        ) {
                            for (let i = 0; i < ticketsFaresStation.length; i++) {
                                let ticketsFaresStationObj = ticketsFaresStation[i];
                                if (
                                    ModelClass.KLIA_DATA.klaiAdultReturn ===
                                    ticketsFaresStationObj.ticketCode
                                ) {
                                    // Adult Return
                                    ModelClass.KLIA_DATA.klaiAdultReturnDetail =
                                        ticketsFaresStationObj;

                                    ModelClass.KLIA_DATA.klaiAdultReturnKliaPrice =
                                        ticketsFaresStationObj.tktkliaPrice;

                                    ModelClass.KLIA_DATA.klaiAdultReturnNetPrice =
                                        ticketsFaresStationObj.tktmbbNetPrice;

                                    ModelClass.KLIA_DATA.klaiAdultReturnSellingPrice =
                                        ticketsFaresStationObj.tktmbbSellingPrice;
                                } else if (
                                    ModelClass.KLIA_DATA.klaiAdultSingle ===
                                    ticketsFaresStationObj.ticketCode
                                ) {
                                    // Adult Single
                                    ModelClass.KLIA_DATA.klaiAdultSingleDetail =
                                        ticketsFaresStationObj;

                                    ModelClass.KLIA_DATA.klaiAdultSingleKliaPrice =
                                        ticketsFaresStationObj.tktkliaPrice;

                                    ModelClass.KLIA_DATA.klaiAdultSingleNetPrice =
                                        ticketsFaresStationObj.tktmbbNetPrice;

                                    ModelClass.KLIA_DATA.klaiAdultSingleSellingPrice =
                                        ticketsFaresStationObj.tktmbbSellingPrice;
                                } else if (
                                    ModelClass.KLIA_DATA.klaiChildReturn ===
                                    ticketsFaresStationObj.ticketCode
                                ) {
                                    // Child Return
                                    ModelClass.KLIA_DATA.klaiChildReturnDetail =
                                        ticketsFaresStationObj;

                                    ModelClass.KLIA_DATA.klaiChildReturnKliaPrice =
                                        ticketsFaresStationObj.tktkliaPrice;

                                    ModelClass.KLIA_DATA.klaiChildReturnNetPrice =
                                        ticketsFaresStationObj.tktmbbNetPrice;

                                    ModelClass.KLIA_DATA.klaiChildReturnSellingPrice =
                                        ticketsFaresStationObj.tktmbbSellingPrice;
                                } else if (
                                    ModelClass.KLIA_DATA.klaiChildSingle ===
                                    ticketsFaresStationObj.ticketCode
                                ) {
                                    // Child Single
                                    ModelClass.KLIA_DATA.klaiChildSingleDetail =
                                        ticketsFaresStationObj;

                                    ModelClass.KLIA_DATA.klaiChildSingleKliaPrice =
                                        ticketsFaresStationObj.tktkliaPrice;

                                    ModelClass.KLIA_DATA.klaiChildSingleNetPrice =
                                        ticketsFaresStationObj.tktmbbNetPrice;

                                    ModelClass.KLIA_DATA.klaiChildSingleSellingPrice =
                                        ticketsFaresStationObj.tktmbbSellingPrice;
                                }
                            }

                            if (
                                ModelClass.KLIA_DATA.klaiAdultSingleDetail != null &&
                                ModelClass.KLIA_DATA.klaiAdultSingleDetail != undefined &&
                                ModelClass.KLIA_DATA.klaiChildSingleDetail != null &&
                                ModelClass.KLIA_DATA.klaiChildSingleDetail != undefined
                            ) {
                                ModelClass.KLIA_DATA.adultMaxCount =
                                    ModelClass.KLIA_DATA.klaiAdultSingleDetail.maxTickets;
                                ModelClass.KLIA_DATA.childMaxCount =
                                    ModelClass.KLIA_DATA.klaiChildSingleDetail.maxTickets;
                            }
                            console.log("================================================= ");
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultReturnDetail : ",
                                ModelClass.KLIA_DATA.klaiAdultReturnDetail
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultReturnKliaPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultReturnKliaPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultReturnNetPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultReturnNetPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultReturnSellingPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultReturnSellingPrice
                            );
                            console.log("================================================= ");
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultSingleDetail : ",
                                ModelClass.KLIA_DATA.klaiAdultSingleDetail
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultSingleKliaPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultSingleKliaPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultSingleNetPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultSingleNetPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiAdultSingleSellingPrice : ",
                                ModelClass.KLIA_DATA.klaiAdultSingleSellingPrice
                            );

                            console.log("================================================= ");
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildReturnDetail : ",
                                ModelClass.KLIA_DATA.klaiChildReturnDetail
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildReturnKliaPrice : ",
                                ModelClass.KLIA_DATA.klaiChildReturnKliaPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildReturnNetPrice : ",
                                ModelClass.KLIA_DATA.klaiChildReturnNetPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildReturnSellingPrice : ",
                                ModelClass.KLIA_DATA.klaiChildReturnSellingPrice
                            );

                            console.log("================================================= ");
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildSingleDetail : ",
                                ModelClass.KLIA_DATA.klaiChildSingleDetail
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildSingleKliaPrice : ",
                                ModelClass.KLIA_DATA.klaiChildSingleKliaPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildSingleNetPrice : ",
                                ModelClass.KLIA_DATA.klaiChildSingleNetPrice
                            );
                            console.log(
                                "ModelClass.KLIA_DATA.klaiChildSingleSellingPrice : ",
                                ModelClass.KLIA_DATA.klaiChildSingleSellingPrice
                            );
                            console.log("================================================= ");
                        }
                    }
                }

                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const calTicketKLIA = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/calTicketKLIA";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getTicketHistoryKlia = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/getTicketHistory?" + suburl;
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getBarcodeKLIA = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/payment/v1/ticket/getBarcodeKLIA";
        console.log("req is " + url);

        // set data/body
        const body = date;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getSubCategoriesMayaUserAPI = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = PFM_ENDPOINT_V1 + suburl;
        console.log("Token m2u: " + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({ url, data: body, reqType: method, tokenType, promptError: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getAllOwnAccounts = async () => {
    // set URL
    const url = `${BANKING_ENDPOINT_V1}/accounts/all`;
    console.log("getAllOwnAccounts req is " + url);
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url,
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_M2U_TRANSFER,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getBanksListApi = () => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = `${BANKING_ENDPOINT_V1}/banks`;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getAllTelcoAmount = (payeeCode) => {
    const url = ENDPOINT_BASE + "/payment/v1/mobilereload/reloadamount/" + payeeCode;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({ url, reqType: method, tokenType });
};

export const getAllTelcoList = () => {
    const url = ENDPOINT_BASE + "/payment/v1/mobilereload/telcoproviders";
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({ url, reqType: method, tokenType });
};

export const getGenericFavoritesList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getLoyalityCards = (pageNo) => {
    const url = `${BANKING_ENDPOINT_V2}/loyaltyCards?page=${pageNo}&size=10`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, reqType: method, tokenType, secondTokenType });
};

export const getColourCodes = () => {
    const url = `${BANKING_ENDPOINT_V2}/loyaltyCards/colorCodeList`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, reqType: method, tokenType, secondTokenType });
};

export const submitLoyalityCard = (data, isMultipart = true) => {
    const url = `${BANKING_ENDPOINT_V2}/loyaltyCards`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;
    const body = data;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        secondTokenType,
        isMultipart,
    });
};

export const editLoyalityCard = (data) => {
    const url = `${BANKING_ENDPOINT_V2}/loyaltyCards`;
    const method = METHOD_PUT;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;
    const body = data;

    return ApiManager.service({ url, data: body, reqType: method, tokenType, secondTokenType });
};

export const removeLoyalityCard = (id) => {
    const url = `${BANKING_ENDPOINT_V2}/loyaltyCards/${id}`;
    const method = METHOD_DELETE;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, reqType: method, tokenType, secondTokenType });
};

export const getLoyaltyImage = (url) => {
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;
    const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        secondTokenType,
        responseType: "arraybuffer",
    });
};

export const validateICNo = async (data) => {
    const url = `${USERS_ENDPOINT_V2}/validateICNo`;
    return ApiManager.service({
        url,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U_TRANSFER,
    });
};

export const changeM2UPassword = (data) => {
    const url = ENDPOINT_BASE + "/user/v3/users/changePassword";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};
export const getDuitNowEnquiryDetails = () => {
    const url = ENDPOINT_BASE + "/transfer/v1/duitnow/inquiry";
    return ApiManager.service({
        url,
        reqType: METHOD_GET,
        tokenType: TOKEN_TYPE_MAYA,
    });
};

export const deactivateDevice = (params, data) =>
    ApiManager.service({
        url: `${WALLET_ENDPOINT_V1}/device/deactive?${params}`,
        data,
        reqType: METHOD_PUT,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });

export const changePhoneNo = (data) =>
    ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/changePhoneNo`,
        data,
        reqType: METHOD_PUT,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });
export const updateUserEmail = (data) =>
    ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/changeEmail`,
        data,
        reqType: METHOD_PUT,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });

export const updateProfilePicture = (data) =>
    ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/updateProfilePicture`,
        data,
        reqType: METHOD_PUT,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });

export const updateUserProfile = (data) =>
    ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/updateUser`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });

export const otaRegistrationCount = (data, suburl) => {
    const url = `${ENDPOINT_BASE}/${suburl}`;

    return ApiManager.service({
        url,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
    });
};

export const validateOta = (data) => {
    const url = `${S2U_ENDPOINT_V1}/secure2u/validate`;
    const tokenType = TOKEN_TYPE_M2U;
    const reqType = METHOD_POST;

    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const updateS2uMultiOTP = (data, subUrl) => {
    const url = ENDPOINT_BASE + "/" + subUrl;
    const tokenType = TOKEN_TYPE_M2U;
    const reqType = METHOD_POST;

    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const unregisterOta = async (data, suburl) => {
    const url = ENDPOINT_BASE + "/" + suburl;
    return ApiManager.service({
        url,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
    });
};

export const getPaymentType = (swiftCode, bankCode) => {
    // set URL
    const reqParams = `?swiftCode=${swiftCode || ""}&bankCode=${bankCode}`;
    const url = `${BANKING_ENDPOINT_V1}/banks/paymentOptions${reqParams}`;
    console.log("req is " + url);
    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
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

export const validateForgotPasswordID = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfPwdResetValidateV2Req";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const selfPwdResetVerifyOtp = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfPwdResetVerifyOtp";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const selfPwdResetVerifyOtpV2 = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfPwdResetVerifyOtpV2";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const setPasswordV1 = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfResetPwdReq";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const setPassword = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfResetPwdV2Req";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const setPasswordV3 = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/selfResetPwdV3Req";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: true,
    });
};

export const forgotLoginValidateReq = (data) => {
    const url = ENDPOINT_BASE + "/resetPwd/forgotLoginValidateReq";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const validateNTBCustomerDetails = (data) => {
    const url = ENDPOINT_BASE + "/mae/ntb/api/v1/validateCustomerDetails";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const validateNTBCustDetails = (data) => {
    const url = ENDPOINT_BASE + "/mae/ntb/api/v1/validateNTBCustDetails";
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType, tokenType });
};

export const getCategoryList = () => {
    const url = `${PFM_ENDPOINT_V1}/pfm/subCategories/mayauser/all`;
    const reqType = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const setUpdateBooster = (path, data) => {
    const url = `${GOAL_ENDPOINT_V1}${path}`;
    const tokenType = TOKEN_TYPE_M2U;
    const reqType = METHOD_POST;

    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const getBoosterGoalById = (id) => {
    const url = `${GOAL_ENDPOINT_V1}/booster/${id}/goals`;
    const reqType = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const getBoosterDetailsById = (params) => {
    const url = `${GOAL_ENDPOINT_V1}/booster-detail/${params}`;

    // set method
    const reqType = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const getBoosterTransactionByType = (boosterType) => {
    const url = `${GOAL_ENDPOINT_V1}/booster-trx?boosterType=${boosterType}&pageSize=200&page=0`;
    const reqType = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const goalBoosterOn = (data) => {
    const url = `${GOAL_ENDPOINT_V1}/goalBooster/on`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

export const goalBoosterOff = (data) => {
    const url = `${GOAL_ENDPOINT_V1}/goalBooster/off`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data,
        reqType,
        tokenType,
        promptError: false,
        showPreloader: false,
    });
};

/** FnB API Start - Promotion we still using Maya backend, other FnB related we moved to Cloud */
export const getAllFnBPromotions = (data, pageName, value, page) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/promotion/nearByPromotions?pageName=${pageName}&viewAll=${value}&pageSize=20&page=${page}`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({
        url,
        data,
        reqType: method,
        tokenType,
        showPreloader: false,
        promptError: false,
    });
};

export const getPromotionDetails = (id) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/promotion/promotionContent/${id}`;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, reqType: method, tokenType });
};
export const getPromotionSearch = (data, page) => {
    const url = `${ENDPOINT_BASE}/fnb/v1/promotion/search?pageName=Promotion&pageSize=20&page=${
        page && page >= 1 ? page : 1
    }`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};
/** FnB API End */

/** Tickets API Start */
export const getTicketInfo = (data) => {
    const url = `${ENDPOINT_BASE}/payment/v1/ticket/init`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};
export const getTicketOrderDetails = (data) => {
    const url = `${ENDPOINT_BASE}/payment/v1/ticket/orderDetails`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};
export const ticketPayment = (data) => {
    const url = `${ENDPOINT_BASE}/payment/v1/ticket/payTicket`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType, promptError: false });
};
export const generateTicketInfo = (data) => {
    const url = `${ENDPOINT_BASE}/payment/v1/ticket/generateTicket`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};
/** Tickets API End */

export const findAndm2uLinked = (data) => {
    const url = `${ENDPOINT_BASE}/wallet/v1/wallet/findAndm2uLinked`;
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data, reqType: method, tokenType });
};

// End of service 8. Please insert to next file

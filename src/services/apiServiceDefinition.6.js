import NetInfo from "@react-native-community/netinfo";

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
import * as FundConstants from "@constants/fundConstants";
import { APP_ID } from "@constants/strings";
import {
    ENDPOINT_BASE_V2,
    ENDPOINT_BASE,
    BILLS_ENDPOINT_V2,
    GOAL_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V2,
    TRANSFER_ENDPOINT_V1,
} from "@constants/url";
import * as URL from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

import { regCountAPI, secure2uValidateApiAPI } from "./apiServiceDefinition.3";

export const getGoalDetailsAPI = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const joinGoalAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = data;

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

export const rejectGoalAPI = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

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

export const getGoalsDetails = (path) => {
    const url = GOAL_ENDPOINT_V1 + path;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({ url, reqType: method, tokenType, showPreloader: false });
};

export const fundTabungAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = data;

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

// this method is implemented in so few place. adding this code here for a while so it can be called from anywhere.
export const callRegCountApi = async () => {
    return new Promise((resolve, reject) => {
        try {
            let params = {};
            let subUrl = "/secure2u/regCount";
            params = JSON.stringify({
                app_id: APP_ID,
            });

            let returnVal = {
                SECURE2U_SERVICE_ENABLE: false,
            };

            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    regCountAPI(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(" secure2u/regCount RESPONSE RECEIVED: ", response.data);
                            if (
                                responseObject.text == "success" ||
                                responseObject.status == "M000" ||
                                responseObject.status == "000"
                            ) {
                                returnVal.SECURE2U_SERVICE_ENABLE =
                                    ModelClass.SECURE2U_DATA.USE_SECURE2U;

                                ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE =
                                    ModelClass.SECURE2U_DATA.USE_SECURE2U;
                                let regCount = responseObject.payload[0];
                                ModelClass.SECURE2U_DATA.regCount = regCount;
                                ModelClass.SECURE2U_DATA.device_name = regCount.device_name;
                                ModelClass.SECURE2U_DATA.device_status = regCount.device_status;
                                ModelClass.SECURE2U_DATA.hardware_id = regCount.hardware_id;
                                ModelClass.SECURE2U_DATA.mdip_id = regCount.mdip_id;
                                ModelClass.SECURE2U_DATA.registration_attempts =
                                    regCount.registration_attempts;
                                ModelClass.SECURE2U_DATA.updateGCM = regCount.updateGCM;
                                ModelClass.SECURE2U_DATA.updateMutliOTP = regCount.updateMutliOTP;
                                ModelClass.SECURE2U_DATA.updatePublicKey = regCount.updatePublicKey;

                                console.log(
                                    "\n regCount: ",
                                    JSON.stringify(regCount) +
                                        "\n USE_SECURE2U " +
                                        ModelClass.SECURE2U_DATA.USE_SECURE2U +
                                        "\n SECURE2U_SERVICE_ENABLE " +
                                        ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE +
                                        "\n device_name " +
                                        ModelClass.SECURE2U_DATA.device_name +
                                        "\n device_status " +
                                        ModelClass.SECURE2U_DATA.device_status +
                                        "\n hardware_id " +
                                        ModelClass.SECURE2U_DATA.hardware_id +
                                        "\n mdip_id " +
                                        ModelClass.SECURE2U_DATA.mdip_id +
                                        "\n registration_attempts " +
                                        ModelClass.SECURE2U_DATA.registration_attempts +
                                        "\n updateGCM " +
                                        ModelClass.SECURE2U_DATA.updateGCM +
                                        "\n updateMutliOTP " +
                                        ModelClass.SECURE2U_DATA.updateMutliOTP +
                                        "\n updatePublicKey " +
                                        ModelClass.SECURE2U_DATA.updatePublicKey
                                );

                                returnVal = { ...returnVal, ...responseObject.payload[0] };
                                resolve(returnVal);
                            } else {
                                returnVal.SECURE2U_DATA.regCount = null;
                                returnVal.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE = false;
                                resolve(returnVal);
                            }
                        })
                        .catch((error) => {
                            reject("secure2u/regCount ERROR: ", error);
                            console.log("secure2u/regCount ERROR: ", error);
                        });
                }
            });
        } catch (error) {
            console.log("secure2u/regCount ERROR: ", error);
            reject("secure2u/regCount ERROR: ", error);
        }
    });
};

/**
 *
 * this.state.transferFlow Transfer Flows
 * transferFlow == 1 --> FN00002 --> Own Account Fund transfer
 * transferFlow == 2 --> FN00003 --> Favourite Maybank Account Open Fund transfer
 * transferFlow == 3 --> FN00005 --> MayBank Third Party Fund Transfer
 * transferFlow == 4 --> FN00008 --> IBFT Other Bank Open Fund Transfer
 * transferFlow == 5 --> FN00006 --> IBFT Favorite Fund Transfer
 * transferFlow ==  6 --> FN00004 --> Favourite First Time Maybank Account Fund transfer
 * transferFlow ==  7 --> FN00007 --> IBFT Favorite Fund Transfer First Time
 *  transferFlow == 11 --> FN00015 --> Mobile RELOAD
 *  transferFlow == 12 --> FN00009 --> DuIt Now Maybank Open
 *  transferFlow == 13 --> FN00016 --> Pay to Cards
 *  transferFlow == 14 --> FN00002 --> PartnerPayment
 *	transferFlow == 15 --> FN00005 --> Send Money
 * 	transferFlow == 16 -->   --> Request Money
 * 	transferFlow == 17 --> FN00017 --> Pay bills
 * 	transferFlow == 18 --> FN00025  --> Goal Tabung Funding
 * transferFlow == 19 -->  FN00026 --> Goal Tabung  Withdraw
 * transferFlow == 20 -->  FN00026 --> Goal Remove
 * transferFlow == 21 --> FN00019 --> Wetix setup / payment
 * transferFlow == 22 --> FN00020 --> Airpass setup / payment
 * transferFlow == 23 --> FN00018 -->  KLIA
 * transferFlow == 24 --> FN00021 --> Catch the Bus setup / payment
 *  transferFlow ==   25 --> FN00010 --> DuIt Now Maybank Favorite
 *  transferFlow ==   26 --> FN00011 --> DuIt Now Maybank Favorite First Time
 *  transferFlow ==   27  --> FN00012 --> DuIt Now Other Bank Open
 * 	transferFlow ==   28 --> FN00013 --> DuIt Now Other Bank Favorite
 * 	transferFlow ==   29  --> FN00014 --> DuIt Now Other Bank Favorite Time
 *  transferFlow ==   30 --> FN00024  --> DuIt Now Recurring Transfer
 *
 *  transferFlow ==   44 --> FN00143  --> Sama2Lokal 3rd party transfer
 *  transferFlow ==   46 --> FN00145  --> ATM cash-out witnhdrawal
 *  transferFlow ==  55 --> FN00192 ---> M2U ID Deactivation
 */
export const getFunctionCode = (functions) => {
    if (functions) return FundConstants.fundingCode[functions];

    return null;
};

// this method is implemented in so few place. adding this code here for a while so it can be called from anywhere.
export const callSecure2uValidateApi = async (functions, mobileSDK, suburl, txnNameData) => {
    return new Promise((resolve, reject) => {
        const functionCode = getFunctionCode(functions);
        console.log("functions : ", functions);
        console.log("functionCode : ", functionCode);
        let params = {};
        const subUrl = "/secure2u/validate";
        params = JSON.stringify({
            app_id: APP_ID,
            function_code: functionCode,
            mobileSDKData: mobileSDK,
            txnName: txnNameData,
        });
        let action_flow = "TAC";
        if (
            functions === FundConstants.FN_FUND_TRANSFER_MAYBANK_FAVOURITE ||
            functions === FundConstants.FN_FUND_TRANSFER_OTHER_BANK_FAVOURITE ||
            functions === FundConstants.FN_DUIT_MAYBANK_FAVOURITE ||
            functions === FundConstants.FN_DUIT_OTHER_BANK_FAVOURITE
        ) {
            action_flow = "NA";
        } else {
            action_flow = "TAC";
        }

        let returnVal = {
            app_id: APP_ID,
            SECURE2U_SERVICE_ENABLE: false,
            function_code: functionCode,
            action_flow: action_flow,
            device_name: "",
            device_status: "",
            hardware_id: "",
            mdip_id: "",
            registration_attempts: 0,
            s2u_enabled: false,
            updateGCM: false,
            updateMutliOTP: false,
            updatePublicKey: false,
            SECURE2U_DATA: {},
        };
        console.log(subUrl + "  RESPONSE RECEIVED params : ", params);
        secure2uValidateApiAPI(JSON.parse(params), suburl)
            .then((response) => {
                let responseObject = response.data;
                console.log(subUrl + "  RESPONSE RECEIVED: ", response.data);
                console.log("[Index] >> [getS2uFlowType] response : ", response);
                console.log("[Index] >> [getS2uFlowType] responseObject : ", responseObject);
                // responseObject.text == "success" ||
                // responseObject.status == "M000" ||
                // responseObject.status == "000"
                if (responseObject) {
                    returnVal.SECURE2U_SERVICE_ENABLE = ModelClass.SECURE2U_DATA.USE_SECURE2U;

                    ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE =
                        ModelClass.SECURE2U_DATA.USE_SECURE2U;

                    const s2uInfo = responseObject.s2uInfo;
                    const payload = responseObject.payload;
                    console.log("[Index] >> [getS2uFlowType] s2uInfo : ", s2uInfo);
                    console.log("[Index] >> [getS2uFlowType] payload : ", payload);
                    if (
                        Object.prototype.hasOwnProperty.call(responseObject, "payload") &&
                        payload
                    ) {
                        let regCount = responseObject?.payload[0];
                        console.log("  regCount RECEIVED: ", regCount);
                        ModelClass.SECURE2U_DATA.regCount = regCount;
                        ModelClass.SECURE2U_DATA.device_name = regCount.device_name;
                        ModelClass.SECURE2U_DATA.device_status = regCount.device_status;
                        ModelClass.SECURE2U_DATA.hardware_id = regCount.hardware_id;
                        ModelClass.SECURE2U_DATA.mdip_id = regCount.mdip_id;
                        ModelClass.SECURE2U_DATA.registration_attempts =
                            regCount.registration_attempts;
                        ModelClass.SECURE2U_DATA.updateGCM = regCount.updateGCM;
                        ModelClass.SECURE2U_DATA.updateMutliOTP = regCount.updateMutliOTP;
                        ModelClass.SECURE2U_DATA.updatePublicKey = regCount.updatePublicKey;

                        console.log(
                            "\n regCount: ",
                            JSON.stringify(regCount) +
                                "\n USE_SECURE2U " +
                                ModelClass.SECURE2U_DATA.USE_SECURE2U +
                                "\n SECURE2U_SERVICE_ENABLE " +
                                ModelClass.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE +
                                "\n device_name " +
                                ModelClass.SECURE2U_DATA.device_name +
                                "\n device_status " +
                                ModelClass.SECURE2U_DATA.device_status +
                                "\n hardware_id " +
                                ModelClass.SECURE2U_DATA.hardware_id +
                                "\n mdip_id " +
                                ModelClass.SECURE2U_DATA.mdip_id +
                                "\n registration_attempts " +
                                ModelClass.SECURE2U_DATA.registration_attempts +
                                "\n updateGCM " +
                                ModelClass.SECURE2U_DATA.updateGCM +
                                "\n updateMutliOTP " +
                                ModelClass.SECURE2U_DATA.updateMutliOTP +
                                "\n updatePublicKey " +
                                ModelClass.SECURE2U_DATA.updatePublicKey
                        );

                        returnVal = { ...returnVal, ...responseObject.payload[0], ...s2uInfo };
                        console.log(
                            "[Index] >> [getS2uFlowType] success S2u returnVal : ",
                            returnVal
                        );
                    } else {
                        console.log(
                            "[Index] >> [getS2uFlowType] success TAC/NA returnVal : ",
                            returnVal
                        );
                        returnVal = { ...returnVal, ...s2uInfo };
                    }
                    console.log("[Index] >> [getS2uFlowType] success returnVal : ", returnVal);
                    resolve(returnVal);
                } else {
                    let s2uInfo = responseObject.s2uInfo;
                    returnVal.SECURE2U_DATA.regCount = null;
                    ModelClass.SECURE2U_DATA.s2u_enabled = false;
                    ModelClass.SECURE2U_DATA.action_flow = action_flow;
                    returnVal.SECURE2U_DATA.SECURE2U_SERVICE_ENABLE = false;
                    returnVal = { ...returnVal, ...s2uInfo };
                    console.log("[Index] >> [getS2uFlowType] Error returnVal : ", returnVal);
                    resolve(returnVal);
                }
            })
            .catch((error) => {
                console.log("secure2u/validate ERROR: ", error);
                reject(error);
            });
    });
};

// export const getAllUserAccounts = () => {
//     console.log("getAllUserAccounts ==> ");
//     console.log("getAllUserAccounts");
//     const variables = {
//         tokenType: TOKEN_TYPE_M2U,
//         m2uauthorization:
//             ModelClass.COMMON_DATA.serverAuth + ModelClass.TRANSFER_DATA.m2uAccessToken,
//         mayaUserId: ModelClass.COMMON_DATA.mayaUserId,
//         showPreloader: false,
//         promptError: false,
//     };

//     return new Promise((resolve, reject) => {
//         getUserAccount(variables)
//             .then((respone) => {
//                 console.log("getUserAccount ", respone);
//                 console.log("getUserAccount " + respone);
//                 let data = respone.data.data;
//                 if (data) {
//                     console.log("data ==> ", data);
//                     // console.log('error ==> ' ,error);

//                     if (data != undefined && data != null) {
//                         console.log("data1 ==> ", data);
//                         let listData = data.getAllUserAccounts;
//                         ModelClass.TRANSFER_DATA.userAccountList = listData;
//                         if (listData) {
//                             console.log("getAllUserAccounts:", listData);
//                             console.log("getAllUserAccounts:", listData.length);
//                             let fromAccount = ModelClass.TRANSFER_DATA.fromAccount.substring(0, 12);

//                             console.log("fromAccount ==> " + fromAccount);
//                             let newAccountList = [];
//                             let accountItem = "";
//                             for (let i = 0; i < listData.length; i++) {
//                                 let account = listData[i].acctNo.substring(0, 12);
//                                 accountItem = listData[i];
//                                 if (accountItem.primary) {
//                                     ModelClass.TRANSFER_DATA.primaryAccount = accountItem.acctNo;
//                                 }
//                                 if (
//                                     fromAccount != account &&
//                                     accountItem != undefined &&
//                                     accountItem.acctStatusCode != undefined &&
//                                     accountItem.acctStatusCode == "00"
//                                 ) {
//                                     newAccountList.push(listData[i]);
//                                 } else {
//                                     //console.log("acc ==> " + account);
//                                 }
//                             }
//                             ModelClass.TRANSFER_DATA.userToAccountList = newAccountList;

//                             ModelClass.TRANSFER_DATA.maybankAvailable = "true";
//                             ModelClass.TRANSFER_DATA.maybankTitle = "Maybank2u";
//                             console.log("getAllUserAccounts newAccountList :", newAccountList);
//                             resolve(newAccountList);
//                         }
//                     }
//                 } else {
//                     ModelClass.TRANSFER_DATA.maybankAvailable = "false";
//                     ModelClass.TRANSFER_DATA.maybankTitle = "Add Maybank Accounts";
//                     console.log(` Error`, data);
//                     reject(data);
//                 }
//             })
//             .catch((error) => {
//                 console.log(` Error`, error);
//                 reject(error);
//             });
//     });
// };

export const fundTransferApi = (data) => {
    return new Promise((resolve, reject) => {
        const url = TRANSFER_ENDPOINT_V2 + "/fundTransfer/monetary";
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
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

export const sendMoneyApi = (data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + "/sendRcvMoney/send";
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
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
export const sendMoneyPaidApi = (data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + "/sendRcvMoney/paid?notify=true";
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
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

export const requestMoneyAPI = (data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE_V2 + "/sendRcvMoney/request";
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;
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

export const renameGoalAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_PUT;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

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

export const editImageGoalAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_PUT;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

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

export const maeStepupCusEnquiry = async (data, loader = true) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/stepUpInquiry";
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

export const maegetStepupData = (loader) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/mae/ntb/api/v1/masterData";
        console.log("req is " + url);
        // set data/body
        const body = null;

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
            showPreloader: loader,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const switchToMAEIslamic = async (data, loader = true) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/switchToMAEIslamic";
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

export const switchRequestStatus = async (data, loader = true) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/switchRequestStatus";
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

export const fundTransferInquiryApi = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = TRANSFER_ENDPOINT_V2 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
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

export const removeGroupsApi = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = BILLS_ENDPOINT_V2 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_DELETE;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const addFavoriteFundTransferApi = (data) => {
    return new Promise((resolve, reject) => {
        const url = TRANSFER_ENDPOINT_V1 + "/favorite/add";
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
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

export const maestepUpSubmit = async (loader = false, data) => {
    const url = ENDPOINT_BASE + "/mae/api/v1/stepUpSubmit";
    const body = data;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const checkOperationTime = async (loader = false, data) => {
    const url = ENDPOINT_BASE + "/" + URL.MAE_OPRN_TIME_API;
    const body = data;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: METHOD_POST,
        tokenType,
        promptError: true,
        showPreloader: loader,
    });
};

export const deleteGoalAPI = (suburl, date) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + "/" + suburl;
        console.log("req is " + url);
        // set data/body
        const body = date;

        // set method
        const method = METHOD_DELETE;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

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

export const maeCustomerInfo = async (urlParams = "", loader = false) => {
    const url = `${ENDPOINT_BASE}/${URL.MAE_CUST_INFO}${urlParams}`;
    const body = null;
    const method = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: loader,
    });
};

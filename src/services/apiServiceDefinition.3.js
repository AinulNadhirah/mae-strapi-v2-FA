import ApiManager from "@services/ApiManager";

import {
    TOKEN_TYPE_M2U,
    TOKEN_TYPE_MAYA,
    METHOD_POST,
    METHOD_GET,
    TIMEOUT,
    TOKEN_TYPE_M2U_TRANSFER,
    METHOD_PUT,
} from "@constants/api";
import {
    ENDPOINT_BASE_V2,
    ENDPOINT_BASE,
    WALLET_ENDPOINT_V1,
    S2U_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V1,
    USERS_ENDPOINT_V2,
    S2U_ENDPOINT_V2,
    FORGOT_LOGIN_ENDPOINT_V2,
} from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

import requestTimeOut from "./requestTimeout";

export const favoriteList = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const getFitRequestWithoutData = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/fitness/v1/fitness" + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        if (
            suburl.includes("/getStepsByUser?") ||
            suburl.includes("getActiveBrandedChallenges") ||
            suburl.includes("getOngoingChallengesByUser") ||
            suburl.includes("getStepTarget") ||
            suburl.includes("/getFitnessConfig") ||
            suburl.includes("getAllPartners") ||
            suburl.includes("getFitnessConfig")
        ) {
            ApiManager.service({
                url,
                data: body,
                reqType: method,
                tokenType,
                timeout: 10000,
                promptError: false,
                showPreloader: false,
            })
                .then((respone) => {
                    resolve(respone);
                })
                .catch((error) => {
                    reject(error);
                });
        } else if (suburl.includes("getFitnessConfig")) {
            ApiManager.service({
                url,
                data: body,
                reqType: method,
                tokenType,
                timeout: 3000,
                promptError: false,
                showPreloader: false,
            })
                .then((respone) => {
                    resolve(respone);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            ApiManager.service({ url, data: body, reqType: method, tokenType })
                .then((respone) => {
                    resolve(respone);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

export const postFitRequestWithData = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = ENDPOINT_BASE + "/fitness/v1/fitness" + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_MAYA;

        //for no preloader
        // const showPreloader = false;

        if (suburl.includes("/acceptRejectChallenge") || suburl.includes("/createChallenge")) {
            ApiManager.service({ url, data: body, reqType: method, tokenType })
                .then((respone) => {
                    console.log(" Sucessful Response is", respone);
                    resolve(respone);
                })
                .catch((error) => {
                    console.log(" Error Response is", error);
                    if (error.status == 100) {
                        resolve(error);
                    } else {
                        reject(error);
                    }
                });
        } else if (suburl.includes("/addJournal") || suburl.includes("/getPaginatedMessages")) {
            ApiManager.service({
                url,
                data: body,
                reqType: method,
                tokenType,
                timeout: 10000,
                promptError: false,
                showPreloader: false,
            })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            ApiManager.service({ url, data: body, reqType: method, tokenType })
                .then((respone) => {
                    resolve(respone);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

export const fundTransferDetail = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    // const url = 'http://172.31.100.152:8081/wallet/v1'+suburl;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const fundTransferDetailPOST = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const getServerPublicKeyAPI = () => {
    const url = `${S2U_ENDPOINT_V1}/secure2u/publicKey`;
    const reqType = METHOD_GET;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({ url, reqType, tokenType });
};

export const getServerPublicKey = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = S2U_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/text",
                Accept: "application/json",
                authorization: authorization,
            },
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const createOtpFetch = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = S2U_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const createOtp = async (suburl, data) => {
    console.log("Request is  ", S2U_ENDPOINT_V1 + suburl, data);
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: S2U_ENDPOINT_V1 + suburl,
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_M2U_TRANSFER,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const createOtpForgotLogin = (suburl, data) => {
    const url = FORGOT_LOGIN_ENDPOINT_V2 + suburl;
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
    });
};

export const thirdPartyFundTransferSms = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const ibftFundTransfer = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const interBankFundTransfer = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = TRANSFER_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

/*
export const thirdPartyFundTransferSecure2u = async (suburl, data, token) => {
  // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
  let authorization = "bearer " + token;
  const url = WALLET_ENDPOINT_V1 + suburl;
  console.log('Request is', url, data + " \n Token : " + authorization);
  const race = Promise.race([
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": authorization },
      body: data
    }),
    requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
  ]);
  return race;
};
*/
export const thirdPartyFundTransferSecure2u = (suburl, data) => {
    return new Promise((resolve, reject) => {
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("Request is", url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        //for no preloader
        // const showPreloader = false;
        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const secure2uRegister = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    // const url = 'http://172.31.100.152:8081/wallet/v1'+suburl;
    const url = S2U_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const secure2uDeRegister = async (suburl, data) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");

    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const url = S2U_ENDPOINT_V1 + suburl;

        ApiManager.service({
            url,
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_M2U,
            timeout: 2 * 60000,
            promptError: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });

    // let authorization = "bearer " + token;
    // // const url = 'http://172.31.100.152:8081/wallet/v1'+suburl;
    // console.log("Request is", url, data);
    // const race = Promise.race([
    // 	fetch(url, {
    // 		method: "POST",
    // 		headers: { "Content-Type": "application/json", Accept: "application/json", authorization: authorization },
    // 		body: data
    // 	}),
    // 	requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;
};

export const secure2uChallenge = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    // const url = 'http://172.31.100.152:8081/wallet/v1'+suburl;
    const url = S2U_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const secure2uSignTransaction = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    // const url = 'http://172.31.100.152:8081/wallet/v1'+suburl;
    const url = S2U_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const addFavoriteFundTransfer = async (suburl, data, token) => {
    // let token = "bearer " + await AsyncStorage.getItem("m2uAccessToken");
    let authorization = "bearer " + token;
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("Request is", url, data + " \n Token : " + authorization);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: authorization,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const contactsSync = async (data, loader = true) => {
    const body = data;

    return ApiManager.service({
        url: ENDPOINT_BASE + "/user/v2/usercontact/sync/contacts",
        data: body,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

//contact with type "recent" and "other"
export const newContactsSync = async (data, loader = true) => {
    return ApiManager.service({
        url: ENDPOINT_BASE + "/user/v2/usercontact/sync/contacts/new",
        data: data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        promptError: true,
        showPreloader: loader,
    });
};

export const isWalletExits = () => {
    const url = `${WALLET_ENDPOINT_V1}/wallet/est`;
    const reqType = METHOD_GET;

    return ApiManager.service({
        url,
        reqType,
        promptError: false,
        showPreloader: false,
    });
};

export const doUpdateUserDetails = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // call api CONTENT_TYPE_APP_JSON
        ApiManager.service({
            url: ENDPOINT_BASE + "/user/v2/users/updateUser",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const doUpdateUserProfileDetails = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // call api CONTENT_TYPE_APP_JSON
        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/secure/updateUserProfile",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const doUserExitsCheck = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // call api
        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/userExists",
            data: body,
            reqType: METHOD_POST,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const requestUserRest = (loader) => {
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/secure/userDetails",
            data: null,
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_MAYA,
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

export const answerContent = (data) => {
    const body = data;

    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/cms/api/v1/poll/pollAnswer",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const spilitBillViewd = (data) => {
    const url = ENDPOINT_BASE + "/user/v1/notifications/seen/" + data;
    console.log("Request is", url);

    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: url,
            reqType: METHOD_PUT,
            tokenType: TOKEN_TYPE_MAYA,
            timeout: 10000,
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

export const BookmarkHomeContent = (contentId) => {
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/user/v1/bookmark?contentId=" + contentId,
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
export const updateProfilePict = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url:
                ENDPOINT_BASE +
                "user/v2/users/updateProfilePicture?userId=" +
                ModelClass.USER_DATA.mayaUserId,
            data: body,
            reqType: METHOD_PUT,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const updateFcmToken = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/notification/v1/pns/update`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        promptError: false,
        showPreloader: false,
    });

export const registerGcmToken = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/notification/v1/pns/register`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        showPreloader: false,
        promptError: false,
    });

export const unregisterGcmToken = (data) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/notification/v1/pns/deRegister`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_MAYA,
        promptError: false,
    });

export const updateS2uGcmToken = (data) =>
    ApiManager.service({
        url: `${S2U_ENDPOINT_V2}/secure2u/updateGCMToken`,
        data,
        reqType: METHOD_POST,
        tokenType: TOKEN_TYPE_M2U,
        showPreloader: false,
        promptError: false,
    });

export const updateWalletPIN = (data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/wallet/v1/wallet/updatePinNo",
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const logout = () => {
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/secure/logout",
            reqType: METHOD_GET,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const unlinkM2uAccount = () => {
    return new Promise((resolve, reject) => {
        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/secure/unlinkM2u",
            reqType: METHOD_PUT,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const createNewUSerRecord = (userId, data) => {
    console.log("API Create new Record Press");

    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE + "/v2/users/createNewUser/" + userId,
            data: body,
            reqType: METHOD_POST,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const requestEMAILOTP = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE_V2 + "/users/" + suburl,
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const requestOTP = (data) => {
    return ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/requestotp`,
        data,
        tokenType: TOKEN_TYPE_MAYA,
        reqType: METHOD_POST,
    });
};
export const requesandValidateOTP = (suburl, data) => {
    return ApiManager.service({
        url: `${ENDPOINT_BASE}/${suburl}`,
        data,
        tokenType: TOKEN_TYPE_MAYA,
        reqType: METHOD_POST,
    });
};

export const ValidateEMAILOTP = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        console.log("req is " + suburl, data);
        const body = data;

        ApiManager.service({
            url: ENDPOINT_BASE_V2 + "/users/" + suburl,
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_MAYA,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const validateOTP = (data) => {
    return ApiManager.service({
        url: `${USERS_ENDPOINT_V2}/validateotp`,
        data,
        tokenType: TOKEN_TYPE_MAYA,
        reqType: METHOD_POST,
    });
};

export const favoriteListApi = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V1 + suburl;
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

export const thirdPartyNameApi = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
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

export const ibftFavoriteFundTransfer = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;
        const url = WALLET_ENDPOINT_V1 + suburl;

        console.log("Request is", url, JSON.stringify(data));
        ApiManager.service({ url, data: body, reqType: METHOD_POST, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const ibftFavoriteFirstTimeFundTransfer = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const url = WALLET_ENDPOINT_V1 + suburl;
        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;
        console.log("Request is", url, JSON.stringify(data));
        ApiManager.service({ url, data: body, reqType: METHOD_POST, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const regCountAPI = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set data/body
        const body = data;
        const url = S2U_ENDPOINT_V1 + suburl;
        // token type
        const tokenType = TOKEN_TYPE_M2U;
        console.log("Request is", url, data);
        ApiManager.service({ url, data: body, reqType: METHOD_POST, tokenType, promptError: false })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                console.log("requestOTP", error);
                reject(error);
            });
    });
};

export const secure2uValidateApiAPI = (data, suburl) => {
    return new Promise((resolve, reject) => {
        const url = `${ENDPOINT_BASE}/${suburl}`;
        const tokenType = TOKEN_TYPE_M2U;
        const reqType = METHOD_POST;

        ApiManager.service({
            url,
            data,
            reqType,
            tokenType,
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

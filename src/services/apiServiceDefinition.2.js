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
    ENDPOINT_BASE,
    OAUTH_ENDPOINT_V1,
    WALLET_ENDPOINT_V1,
    TRANSFER_ENDPOINT_V1,
    GOAL_ENDPOINT_V1,
    ENROLLMENT_ENDPOINT,
    ENDPOINT_BASE_V2,
} from "@constants/url";

import * as ModelClass from "@utils/dataModel/modelClass";

import requestTimeOut from "./requestTimeout";

export const safetyNetInit = (customerKey) =>
    ApiManager.service({
        url: `${ENDPOINT_BASE}/init?custKey=${customerKey}`,
        reqType: METHOD_GET,
        promptError: false,
        showPreloader: true,
    });

export const m2uEnrollment = (data, isPrelogin, handleError, showPreloader = true) => {
    const url = ENROLLMENT_ENDPOINT;
    const reqType = METHOD_POST;
    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        // tokenType: isPrelogin ? null : TOKEN_TYPE_MAYA,
        reqType,
        promptError: handleError,
        showPreloader,
    });
};

export const loginM2uQR = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = OAUTH_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        let tokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: true,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getPublicKey = async (suburl) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = ENDPOINT_BASE + '/' +  suburl;
    // console.log('Request is : ', url)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json" },

    //   }),
    //   requestTimeOut("Unable to get publicKey, Timeout please try later.")
    // ]);
    // return race;

    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/" + suburl;
        //const url = "https://uat-maya.maybank.com.my/pubKey";
        console.log("req is " + url);

        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = null;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const mobileReloadInquiry = (data) => {
    const url = ENDPOINT_BASE + "/payment/v1/mobilereload/inquiry/";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U;
    return ApiManager.service({ url, data: data, reqType: method, tokenType });
};

export const mobileReload = (data) => {
    const url = ENDPOINT_BASE + "/payment/v1/mobilereload/topup";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;

    return ApiManager.service({
        url,
        data: data,
        reqType: method,
        tokenType,
        promptError: false,
    });
};

export const duitnowServices = (data) => {
    const url = ENDPOINT_BASE + "/transfer/v1/duitnow/register";
    const method = METHOD_POST;
    const tokenType = TOKEN_TYPE_M2U_TRANSFER;
    return ApiManager.service({ url, data: data, reqType: method, tokenType });
};

export const duitnowRegister = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const duitnowFavoriteList = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V1 + suburl;
        console.log("Token m2u" + ModelClass.TRANSFER_DATA.m2uToken);
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const duitnowStatusInquiry = (suburl) => {
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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const loadCountries = (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V1 + suburl;
        console.log("req is TRANSFER_ENDPOINT_V1 : ", TRANSFER_ENDPOINT_V1);
        console.log("req is ", url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U_TRANSFER;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getQRPullString = async (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getQRPullStatus = async (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
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

export const getQRPullTranAuth = async (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url);
        // set data/body
        const body = null;

        // set method
        const method = METHOD_GET;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({ url, data: body, reqType: method, tokenType })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const goalExistInquiry = (suburl) => {
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

export const goalValidateParticipants = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const goalCreate = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const enableEsi = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const disableEsi = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const esiPostServiceWrapper = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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

export const goalWithdraw = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const accountInquiry = async (suburl) => {
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

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getQRCategories = async (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const goalRemove = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const goalDrop = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = GOAL_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getWalletData = async (suburl, showPreloader) => {
    // set URL
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("req is " + url);

    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;
    // const secondTokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showPreloader,
    });
};

export const updatePrimaryAccount = async (suburl, data, showPreloader = true) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U;
        const secondTokenType = TOKEN_TYPE_MAYA;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
            showPreloader,
            secondTokenType,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const updateWalletPin = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// export const getDevices = async (data) => {
//     const url = `${WALLET_ENDPOINT_V1}/device/listByUsername`;
//     // const url = `${WALLET_ENDPOINT_V1}/device/list`;
//     const reqType = METHOD_POST;
//     // const reqType = METHOD_GET;

//     // token type
//     // const tokenType = TOKEN_TYPE_MAYA;

//     return ApiManager.service({
//         url,
//         data,
//         reqType,
//         // tokenType,
//         promptError: false,
//         showPreloader: false,
//     });
// };

export const removeDevice = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/" + suburl;
        console.log("req is " + url, data);

        // set data/body
        const body = data;

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// export const addDevice = async (suburl, data) => {
//     const url = `${WALLET_ENDPOINT_V1}/device/add`;
//     const reqType = METHOD_POST;
//     const tokenType = TOKEN_TYPE_M2U;

//     return ApiManager.service({
//         url,
//         data,
//         reqType,
//         tokenType,
//         promptError: false,
//         showPreloader: false,
//     });
// };

export const getM2UInfo = async (suburl) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = ENDPOINT_BASE + "/" + suburl;
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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const qrMerchantInquiry = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = WALLET_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);
        // set data/body
        const body = data;

        // set method
        const method = METHOD_POST;

        // token type
        const tokenType = TOKEN_TYPE_M2U;

        ApiManager.service({
            url,
            data: body,
            reqType: method,
            tokenType,
            timeout: TIMEOUT,
            promptError: false,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const favoriteCreditTransfer = async (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = TRANSFER_ENDPOINT_V1 + suburl;
        console.log("req is " + url, data);

        // set data/body
        const body = data;

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
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const favoriteCreditTransfer1 = async (suburl, data, token) => {
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

export const ownfundTransfer = async (suburl, data, token) => {
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

export const favoriteFundTransfer = async (suburl, data, token) => {
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

import AsyncStorage from "@react-native-community/async-storage";

import ApiManager from "@services/ApiManager";

import { TOKEN_TYPE_M2U, TOKEN_TYPE_MAYA, METHOD_POST, METHOD_GET, TIMEOUT } from "@constants/api";
import {
    ENDPOINT_BASE_V2,
    ENDPOINT_BASE,
    OAUTH_ENDPOINT_V1,
    WALLET_ENDPOINT_V1,
    APOLLO_HTTP_ENDPOINT,
    GOAL_ENDPOINT_V1,
    USERS_ENDPOINT_V2,
    USERS_ENDPOINT,
    VERIFY_USERNAME_URL,
} from "@constants/url";

import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";

import requestTimeOut from "./requestTimeout";

export const featchRequestForData = (suburl, data, reqType) => {
    let token = "bearer " + ModelClass.authToken;
    const url = ENDPOINT_BASE + "/user/v2" + "/users" + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: reqType,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: token,
            },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, please try later."),
    ]);
    return race;
};

export const doMobileOTPAuthentication = (suburl, data) => {
    const url = ENDPOINT_BASE_V2 + "/users" + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const getGraphql = (data) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);

        console.log(data);

        // call api CONTENT_TYPE_APP_JSON
        ApiManager.service({
            url: APOLLO_HTTP_ENDPOINT,
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

export const getGraphqlM2U = (data) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);

        console.log(data);

        // call api CONTENT_TYPE_APP_JSON
        ApiManager.service({
            url: APOLLO_HTTP_ENDPOINT,
            data: body,
            reqType: METHOD_POST,
            tokenType: TOKEN_TYPE_M2U,
        })
            .then((respone) => {
                resolve(respone);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const getRequestwithData = async (suburl) => {
    const url = ENDPOINT_BASE_V2 + "/users" + suburl;
    console.log("getRequestwithData is", url);
    const race = Promise.race([
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const authenticatewithServer = (suburl, data) => {
    const url = ENDPOINT_BASE_V2 + "/users" + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const postRequestwithData = (suburl, data) => {
    const url = ENDPOINT_BASE_V2 + "/users" + suburl;
    console.log("Request is", url, data);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const postRequestuser = (suburl, data) => {
    let token = "bearer " + ModelClass.authToken;
    const url = ENDPOINT_BASE + "/user/v2" + "/users" + suburl;
    console.log("url & body  is", url, data);

    return Promise.race([
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: token,
            },
            body: JSON.parse(JSON.stringify(data)),
        }),
    ])
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

export const putRequestwithData = (suburl, data) => {
    let token = "bearer " + ModelClass.authToken;
    const url = ENDPOINT_BASE + "/user/v2" + "/users" + suburl;
    console.log("url & body  is", url, data);

    return Promise.race([
        fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: token,
            },
            body: JSON.parse(JSON.stringify(data)),
        }),
    ])
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

export const requestForNewToken = async () => {
    const url = ENDPOINT_BASE + "/oauth/v1/token";
    var temp_data = {
        grantType: "REFRESH_TOKEN",
        refreshToken: await AsyncStorage.getItem("mayaRefreshtoken"),
    };
    console.log("token ", url, await AsyncStorage.getItem("mayaRefreshtoken"));

    fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(temp_data), // body data type must match "Content-Type" header
    })
        .then((response) => {
            console.log("response ", response);

            return response.json();
        })
        .catch((error) => console.warn("fetch error:", error))
        .then((response) => {
            console.log("token is", response);
        });
};

export const doRefreshTokenAuthentication = () => {
    const url = ENDPOINT_BASE_V2 + "/token";
    console.log("Request is", url);
    const race = Promise.race([
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grantType: "REFRESH_TOKEN",
                refreshToken: ModelClass.authRefreshToken,
            }),
        }),
        requestTimeOut("Unable to authenticate your credential, Timeout please try later."),
    ]);
    return race;
};

export const requestM2UOTP = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = USERS_ENDPOINT_V2 + suburl;
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

export const validateM2UOTP = (suburl, data) => {
    return new Promise((resolve, reject) => {
        // set URL
        const url = USERS_ENDPOINT_V2 + suburl;
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

export const getQRPushString = async (suburl, data) => {
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

export const verifyQRString = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // //Alert.alert(mayatoken)
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const checkQRStatus = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // //Alert.alert(mayatoken)
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const checkPromoStatus = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // //Alert.alert(mayatoken)
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const executeQRTransaction = async (suburl, data) => {
    //{"accountFrom": "string", "customerKey": "string", "transactionRefNo": "string" }
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const executeQRPushCashBack = async (suburl, data) => {
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

export const getQRLimit = async (suburl) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },

    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const updateQRLimit = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // console.log('Token is', token)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const verifyQRLimit = async (suburl) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is  verifyQRLimit : ', url)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },

    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const updateTxnCategory = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // let token = "bearer " + ModelClass.COMMON_DATA.m2uAccessToken;
    // const url = WALLET_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "application/json", "authorization": token },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

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

export const verifyM2uUserName = async (showLoader = true, username) => {
    const url = OAUTH_ENDPOINT_V1 + VERIFY_USERNAME_URL;
    // set method
    const method = METHOD_POST;
    const encUsername = await DataModel.encryptData(username);
    const body = JSON.stringify({
        username: encUsername,
    });

    return ApiManager.service({
        url,
        reqType: method,
        // tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showLoader,
        data: body,
    });
};

export const loginM2u = async (suburl, data) => {
    // try {
    //   IdleManager.doCheck()
    // } catch (e) {
    //   console.log(e);
    // }
    // //let mayatoken = "bearer " + await AsyncStorage.getItem("mayatoken");
    // const url = OAUTH_ENDPOINT_V1 + suburl;
    // console.log('Request is', url, data)
    // const race = Promise.race([
    //   fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", "Accept": "text/plain", },
    //     body: data
    //   }),
    //   requestTimeOut("Unable to authenticate your credential, Timeout please try later.")
    // ]);
    // return race;

    return new Promise((resolve, reject) => {
        // set URL
        const url = OAUTH_ENDPOINT_V1 + suburl;
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

export const getQRMobileNo = (suburl) => {
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

export const getQRUserName = (suburl) => {
    // set URL
    const url = WALLET_ENDPOINT_V1 + suburl;
    console.log("req is " + url);
    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
    });
};

export const getGoalNotifications = (suburl) => {
    // set URL
    const url = GOAL_ENDPOINT_V1 + suburl;
    console.log("req is " + url);
    // set data/body
    const body = null;

    // set method
    const method = METHOD_GET;

    // token type
    const tokenType = TOKEN_TYPE_M2U;

    return ApiManager.service({
        url,
        data: body,
        reqType: method,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: false,
    });
};

export const updateGoalNotifications = (
    suburl,
    method,
    handleError = false,
    showLoader = false
) => {
    const url = GOAL_ENDPOINT_V1 + suburl;
    const tokenType = TOKEN_TYPE_MAYA;
    console.log("req is " + url);

    return ApiManager.service({
        url,
        reqType: method,
        tokenType,
        promptError: handleError,
        showPreloader: showLoader,
    });
};

export const onboardingLogin = (data, showLoader) => {
    const url = `${USERS_ENDPOINT}/login`;
    // const reqType = METHOD_POST;
    // const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        // reqType,
        // tokenType,
        timeout: TIMEOUT,
        promptError: false,
        showPreloader: showLoader,
    });
};

export const onboardingOtp = (data, showLoader) => {
    const url = `${USERS_ENDPOINT}/requestotp`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        reqType,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: showLoader,
    });
};

export const onboardingValidateOtp = (data, showLoader) => {
    const url = `${USERS_ENDPOINT}/validateotpRegistration`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        reqType,
        tokenType,
        timeout: TIMEOUT,
        promptError: true,
        showPreloader: showLoader,
    });
};

export const onboardingComplete = (data) => {
    const url = `${USERS_ENDPOINT}/secure/updateUserProfile`;
    const tokenType = TOKEN_TYPE_MAYA;
    const reqType = METHOD_POST;

    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        reqType,
        tokenType,
        promptError: true,
        showPreloader: false,
    });
};

export const contactValidation = (data) => {
    const url = `${USERS_ENDPOINT_V2}/validatePhoneNo`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: JSON.stringify(data),
        reqType,
        tokenType,
    });
};

export const contactValidationPostLogin = (phoneNo) => {
    const url = `${USERS_ENDPOINT_V2}/v2/validatePhoneNo`;
    const reqType = METHOD_POST;
    const tokenType = TOKEN_TYPE_MAYA;

    return ApiManager.service({
        url,
        data: JSON.stringify({ phoneNo }),
        reqType,
        tokenType,
    });
};

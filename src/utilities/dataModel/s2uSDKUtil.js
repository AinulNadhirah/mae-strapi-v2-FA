//S2U V4
import { Platform } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";

import {
    FUNDTRANSFER_MODULE,
    S2U_TRANSFER_ACKNOWLEDGE_SCREEN,
} from "@navigation/navigationConstant";

import { showInfoToast } from "@components/Toast";

import ApiManager from "@services/ApiManager";

import { SMS_TAC } from "@constants/data";
import {
    AUTHORISATION_FAILURE,
    AUTHORISATION_WAS_REJECTED,
    CUMULATIVE_LIMIT,
    DATE_AND_TIME,
    NICK_NAME,
    QR_DAILY_LIMIT,
    REFERENCE_ID,
    SECURE2U_IS_DOWN,
    TRANSACTION_TYPE,
} from "@constants/strings";
import { S2U_ENABLEMENT_API } from "@constants/url";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { storeCloudLogs } from "@utils/cloudLog";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { S2uSdk } from "@utils/s2usdk/s2uSdk";

const s2uSDK = new S2uSdk();
let maeConfig = "";
let utilGetModel = null;
let utilUpdateModel = null;
let transactionToken = "";
let timeStamp = "";
let transactionType = "";

function showLoader(visible) {
    utilUpdateModel({
        ui: {
            showLoader: visible,
        },
    });
}

export function s2uSdkLogs(error, identifier) {
    storeCloudLogs(utilGetModel, {
        errorType: `S2U SDK V4 ${identifier}`,
        errorDetails: error,
    });
}

export async function s2uV4load(ota, getModel, updateModel) {
    let os = Platform.OS.toUpperCase();
    utilGetModel = getModel;
    utilUpdateModel = updateModel;
    if (isPureHuawei) {
        os = "HUAWEI";
    }
    updateS2UV4Model({ isS2UV4Load: ota });
    return await s2uSDK.load(ota, S2U_ENABLEMENT_API, os);
}

export async function init(functionCode, transactionPayload) {
    /**
     * Trigger SDK init() call
     * Collect Mobile SDK data using getModel
     * Adding effective date to the transaction payload, which insert the date in mapper object of the response of initChallenge().
     * Stringify the transaction payload
     * Input parameters : Payload and maeConfig
     * Payload : Function code, Transaction payload and Mobile SDK data
     * maeConfig : API request config to hit the MAE api
     */

    showLoader(true);
    const { deviceInformation } = utilGetModel("device");
    const { isS2uV4Flag } = utilGetModel("misc");

    if (!isS2uV4Flag) {
        showLoader(false);
        return { actionFlow: SMS_TAC, statusCode: 0 };
    }

    const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo);
    if (!transactionPayload?.effectiveDate) transactionPayload.effectiveDate = "00000000";
    const payload = {
        functionCode,
        transactionPayload: JSON.stringify(transactionPayload),
        mobileSDKData,
    };
    //Collect APP config to hit the init and execute API.
    maeConfig = ApiManager.formConfigObj();

    const result = await s2uSDK.init(payload, maeConfig);
    showLoader(false);
    updateS2UV4Model({ init: result });
    transactionToken = result?.transactionToken;
    timeStamp = result?.timestamp;
    if (result?.error) {
        console.log("S2u SDK Util : Error : ", result.error);
        s2uSdkLogs(result.error, "S2U SDK Init");
    }
    return result;
}

export function showS2UDownToast() {
    const { isS2uV4ToastFlag } = utilGetModel("misc");
    if (isS2uV4ToastFlag) {
        showInfoToast({
            message: SECURE2U_IS_DOWN,
        });
    }
}

export function updateS2UV4Model(result) {
    if (Config?.DEV_ENABLE === "true") {
        utilUpdateModel({
            s2uV4DecryptedResponse: result,
        });
    }
}

export async function initChallenge(data = {}) {
    /**
     * data : it is empty JSON
     */
    showLoader(true);
    const result = await s2uSDK.initChallenge(data);
    showLoader(false);
    transactionType = result?.mapperData?.header;
    updateS2UV4Model({ initChallenge: result });
    if (result?.error) {
        console.log("S2u SDK Util init challenge : Error : ", result.error);
        s2uSdkLogs(result.error, "S2U SDK Init Challenge");
    }
    return result;
}

export async function validateChallenge(data, pushData) {
    /**
     * data : action, hotp and mdip counter
     * pushData : id, ref, value, secret, accessToken. (Only for M2U Web)
     */
    const result = await s2uSDK.validateChallenge(data, pushData);
    updateS2UV4Model({ validateChallenge: result });
    if (result?.error) {
        console.log("S2u SDK Util : validate challenge : Error : ", result.error);
        s2uSdkLogs(result.error, "S2U SDK Validate Challenge");
    }
    return result;
}

export async function execute(payload) {
    maeConfig = ApiManager.formConfigObj();
    if (!payload?.token) {
        payload.token = transactionToken;
    }
    const result = await s2uSDK.execute(payload, maeConfig);
    /**
     * Don't add any code here to get the transaction reference number.
     * If below code satisfies your requirement then reuse it else pass the transaction reference number from respective component via handleS2UAcknowledgementScreen transactiondetails object.
     */
    const transactionResult = result?.payload?.result;
    transactionToken =
        transactionResult?.transactionRefNo ||
        transactionResult?.transactionRefNumber ||
        transactionResult?.txnRefNo ||
        transactionToken;
    updateS2UV4Model({ execute: result });
    if (result?.error) {
        console.log("S2u SDK Util : execute : Error : ", result.error);
        s2uSdkLogs(result.error, "S2U SDK Execute");
    }
    return result;
}

export async function decryptS2uPush(data) {
    const decData = await s2uSDK.decryptS2uPush(data);
    updateS2UV4Model({ decryptedPush: decData });
    return decData;
}

// Preparing required params to display on Acnowledgement Screen.
export const preparedServiceParams = (transactionDetails = {}, showTransactionType) => {
    const referenceIdValue = transactionDetails?.transactionToken
        ? transactionDetails?.transactionToken?.slice(-10).toString().toUpperCase()
        : transactionToken?.slice(-10).toString().toUpperCase();
    transactionType = !showTransactionType ? transactionType : null;
    const requiredParams = [
        { title: REFERENCE_ID, value: referenceIdValue },
        { title: DATE_AND_TIME, value: timeStamp },
        { title: TRANSACTION_TYPE, value: transactionType || transactionDetails?.transactionType },
        { title: QR_DAILY_LIMIT, value: transactionDetails?.dailyLimit },
        { title: CUMULATIVE_LIMIT, value: transactionDetails?.cumulativeLimit },
        { title: NICK_NAME, value: transactionDetails?.nickName },
    ];
    return requiredParams.filter((item) => item && item.value && item);
};

// Common Acnowledgement Screen Handler
export const handleS2UAcknowledgementScreen = (ackDetails) => {
    const {
        transactionSuccess,
        transactionDetails,
        entryPoint,
        navigate,
        executePayload,
        titleMessage,
    } = ackDetails;
    const message = executePayload?.message
        ? executePayload?.message
        : executePayload?.payload?.message;

    const serviceParams = preparedServiceParams(transactionDetails, executePayload?.executed);
    const descMessage = message || AUTHORISATION_WAS_REJECTED;
    const params = {
        isTxnSuccess: transactionSuccess,
        title: titleMessage || AUTHORISATION_FAILURE,
        descriptionMessage: !executePayload?.executed ? descMessage : "",
        serviceParams,
        entryPoint,
        navigate,
    };

    navigate(FUNDTRANSFER_MODULE, {
        screen: S2U_TRANSFER_ACKNOWLEDGE_SCREEN,
        params,
    });
};

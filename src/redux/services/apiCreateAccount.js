import { showErrorToast } from "@components/Toast";

import { createAccountService } from "@services/apiServiceZestCASA";

import {
    CREATE_ACCOUNT_LOADING,
    CREATE_ACCOUNT_ERROR,
    CREATE_ACCOUNT_SUCCESS,
} from "@redux/actions/services/createAccountAction";
import { PREPOSTQUAL_UPDATE_FROM_CREATE_ACCOUNT } from "@redux/actions/services/prePostQualAction";

import { COMMON_ERROR_MSG } from "@constants/strings";
import { CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT } from "@constants/zestCasaConfiguration";

export const createAccount = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: CREATE_ACCOUNT_LOADING });

        try {
            const response = await createAccountService(dataReducer);
            console.log("[ZestCASA][createAccount] >> Success");
            console.log(response);

            const result = response?.data?.result;
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? null;

            if (statusCode === "0000" && result) {
                dispatch({
                    type: CREATE_ACCOUNT_SUCCESS,
                    data: result,
                    accessNo: result.accessNo,
                    acctCode: result.acctCode,
                    acctNo: result.acctNo,
                    acctType: result.acctType,
                    assessmentId: result.assessmentId,
                    customerRiskRating: result.customerRiskRating,
                    customerRiskRatingValue: result.customerRiskRatingValue,
                    debitCardNo: result.debitCardNo,
                    expiryDate: result.expiryDate,
                    inviteCode: result.inviteCode,
                    nameScreenFlag: result.nameScreenFlag,
                    nextReviewDate: result.nextReviewDate,
                    numOfWatchlistHits: result.numOfWatchlistHits,
                    primBitMap: result.primBitMap,
                    refNo: result.refNo,
                    s2w: result.s2w,
                    sanctionsTagging: result.sanctionsTagging,
                    sanctionsTaggingValue: result.sanctionsTaggingValue,
                    screeningId: result.screeningId,
                    statusCode: statusCode,
                    statusDesc: statusDesc,
                    gcif: result.gcif,
                    universalCifNo: result.universalCifNo,
                });

                dispatch({
                    type: PREPOSTQUAL_UPDATE_FROM_CREATE_ACCOUNT,
                    accessNo: result.accessNo,
                    acctCode: result.acctCode,
                    acctNo: result.acctNo,
                    acctType: result.acctType,
                    assessmentId: result.assessmentId,
                    customerRiskRating: result.customerRiskRating,
                    customerRiskRatingValue: result.customerRiskRatingValue,
                    debitCardNo: result.debitCardNo,
                    expiryDate: result.expiryDate,
                    inviteCode: result.inviteCode,
                    nameScreenFlag: result.nameScreenFlag,
                    nextReviewDate: result.nextReviewDate,
                    numOfWatchlistHits: result.numOfWatchlistHits,
                    primBitMap: result.primBitMap,
                    refNo: result.refNo,
                    s2w: result.s2w,
                    sanctionsTagging: result.sanctionsTagging,
                    sanctionsTaggingValue: result.sanctionsTaggingValue,
                    screeningId: result.screeningId,
                    gcif: result.gcif,
                    universalCifNo: result.universalCifNo,
                });
                if (callback) {
                    callback(result);
                }
            } else {
                console.log("[ZestCASA][createAccount] >> Failure 1");
                console.log("[ZestCASA][createAccount] >> statusCode" + JSON.stringify(statusCode));
                if (statusCode === CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT) {
                    const exception = {
                        statusCode: statusCode,
                        statusDesc: statusDesc,
                    };
                    if (callback) {
                        callback(null, exception);
                    }
                } else {
                    if (callback) {
                        callback();
                    }
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
                dispatch({
                    type: CREATE_ACCOUNT_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][createAccount] >> Failure 2");
            console.log("[ZestCASA][createAccount] >> error 2" + JSON.stringify(error));
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: CREATE_ACCOUNT_ERROR, error: error });
        }
    };
};

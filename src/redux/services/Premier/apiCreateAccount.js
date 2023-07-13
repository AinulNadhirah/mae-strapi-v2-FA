import { showErrorToast } from "@components/Toast";

import { createAccountService } from "@services/apiServicePremier";

import {
    CREATE_ACCOUNT_LOADING,
    CREATE_ACCOUNT_ERROR,
    CREATE_ACCOUNT_SUCCESS
} from "@redux/actions/services/createAccountAction";
import { PREPOSTQUAL_UPDATE_FROM_CREATE_ACCOUNT } from "@redux/actions/services/prePostQualAction";

import { CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT } from "@constants/premierConfiguration";
import { COMMON_ERROR_MSG } from "@constants/strings";

export const createAccount = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: CREATE_ACCOUNT_LOADING });

        try {
            const response = await createAccountService(dataReducer);

            const result = response?.result;
            const statusCode = result?.statusCode;
            const statusDesc = result?.statusDesc;
            const accessNo = result?.accessNo;
            const acctCode = result?.acctCode;
            const acctNo = result?.acctNo;
            const acctType = result?.acctType;
            const assessmentId = result?.assessmentId;
            const customerRiskRating = result?.customerRiskRating;
            const customerRiskRatingValue = result?.customerRiskRatingValue;
            const debitCardNo = result?.debitCardNo;
            const expiryDate = result?.expiryDate;
            const inviteCode = result?.inviteCode;
            const nameScreenFlag = result?.nameScreenFlag;
            const nextReviewDate = result?.nextReviewDate;
            const numOfWatchlistHits = result?.numOfWatchlistHits;
            const primBitMap = result?.primBitMap;
            const refNo = result?.refNo;
            const s2w = result?.s2w;
            const sanctionsTagging = result?.sanctionsTagging;
            const sanctionsTaggingValue = result?.sanctionsTaggingValue;
            const screeningId = result?.screeningId;
            const gcif = result?.gcif;
            const universalCifNo = result?.universalCifNo;

            if (statusCode === "0000" && result) {
                dispatch({
                    type: CREATE_ACCOUNT_SUCCESS,
                    data: result,
                    accessNo,
                    acctCode,
                    acctNo,
                    acctType,
                    assessmentId,
                    customerRiskRating,
                    customerRiskRatingValue,
                    debitCardNo,
                    expiryDate,
                    inviteCode,
                    nameScreenFlag,
                    nextReviewDate,
                    numOfWatchlistHits,
                    primBitMap,
                    refNo,
                    s2w,
                    sanctionsTagging,
                    sanctionsTaggingValue,
                    screeningId,
                    statusCode,
                    statusDesc,
                    gcif,
                    universalCifNo,
                });

                dispatch({
                    type: PREPOSTQUAL_UPDATE_FROM_CREATE_ACCOUNT,
                    accessNo,
                    acctCode,
                    acctNo,
                    acctType,
                    assessmentId,
                    customerRiskRating,
                    customerRiskRatingValue,
                    debitCardNo,
                    expiryDate,
                    inviteCode,
                    nameScreenFlag,
                    nextReviewDate,
                    numOfWatchlistHits,
                    primBitMap,
                    refNo: result?.refNo,
                    s2w: result?.s2w,
                    sanctionsTagging,
                    sanctionsTaggingValue,
                    screeningId,
                    gcif,
                    universalCifNo,
                });
                if (callback) {
                    callback(result);
                }
            } else {
                if (statusCode === CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT) {
                    const exception = {
                        statusCode,
                        statusDesc,
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
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: CREATE_ACCOUNT_ERROR, error });
        }
    };
};

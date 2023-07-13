import { checkFPXTransactionAndActivateAccountService } from "@services/apiServicePremier";

import {
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS
} from "@redux/actions/services/checkFPXTransactionAndActivateAccountAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const checkFPXTransactionAndActivateAccount = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING });

        try {
            const response = await checkFPXTransactionAndActivateAccountService(dataReducer);
            
            const result = response?.result;
            const statusCode = result?.statusCode;
            const refNo = result?.refNo ?? result?.refId;

            if (statusCode === "0000" && result) {
                const fpxTransactionId = result.fpxTransactionId || "";
                const refId = result?.refNo || "";
                const time = result?.time || "";

                if (callback) {
                    callback(result, false, refId);
                }
                dispatch({
                    type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS,
                    data: result,
                    statusDesc: result.statusDesc,
                    statusCode: result.statusCode,
                    fpxTransactionId,
                    refId,
                    time,
                });
            } else {
                const statusDesc = result?.statusDesc;
                console.log("[ZestCASA][checkFPXTransaction] >> Failure");
                dispatch({
                    type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });

                if (callback) {
                    /// Retry on Name matching or /// Retry on FPX Failed
                    const isRetry = statusCode === "1111" || statusCode === "9999";
                    callback(null, isRetry, refNo);
                }
            }
        } catch (error) {
            console.log("[ZestCASA][checkFPXTransaction] >> Failure");
            const errorFromMAE = error?.error;
            const refNo = errorFromMAE?.refNo ?? errorFromMAE?.refId;

            dispatch({
                type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
                error,
            });
            if (callback) {
                callback(null, false, refNo);
            }
        }
    };
};

import { checkFPXTransactionAndActivateAccountService } from "@services/apiServiceZestCASA";

import {
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
    CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS,
} from "@redux/actions/services/checkFPXTransactionAndActivateAccountAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const checkFPXTransactionAndActivateAccount = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING });

        try {
            const response = await checkFPXTransactionAndActivateAccountService(dataReducer);
            console.log("[ZestCASA][checkFPXTransaction] >> Success");
            console.log(response.data.result);

            const result = response?.data?.result;
            const statusCode = result?.statusCode ?? null;
            const refNo = result?.refNo ?? result?.refId ?? result?.fpxTransactionId ?? null;

            if (statusCode === "0000" && result) {
                const fpxTransactionId = result.fpxTransactionId || "";
                const time = result?.time || "";

                if (callback) {
                    callback(result, false, refNo);
                }
                dispatch({
                    type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS,
                    data: result,
                    statusDesc: result.statusDesc,
                    statusCode: result.statusCode,
                    fpxTransactionId: fpxTransactionId,
                    refId: refNo,
                    time: time,
                });
            } else {
                const statusDesc = result?.statusDesc ?? null;
                console.log("[ZestCASA][checkFPXTransaction] >> Failure");
                dispatch({
                    type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });

                if (callback) {
                    /// Retry on Name matching
                    if (statusCode === "1111") {
                        callback(null, true, refNo);

                        /// Retry on FPX Failed
                    } else if (statusCode === "9999") {
                        callback(null, true, refNo);
                    } else {
                        callback(null, false, refNo);
                    }
                }
            }
        } catch (error) {
            console.log("[ZestCASA][checkFPXTransaction] >> Failure");
            const errorFromMAE = error?.error;
            const refNo =
                errorFromMAE?.refNo ??
                errorFromMAE?.refId ??
                errorFromMAE?.fpxTransactionId ??
                null;

            dispatch({
                type: CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR,
                error: error,
            });
            if (callback) {
                callback(null, false, refNo);
            }
        }
    };
};

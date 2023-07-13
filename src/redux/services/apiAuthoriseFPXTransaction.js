import { showErrorToast } from "@components/Toast";

import { authoriseFPXTransactionService } from "@services/apiServiceZestCASA";

import {
    AUTHORISE_FPX_TRANSACTION_LOADING,
    AUTHORISE_FPX_TRANSACTION_ERROR,
    AUTHORISE_FPX_TRANSACTION_SUCCESS,
} from "@redux/actions/services/authoriseFPXTransactionAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const authoriseFPXTransaction = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: AUTHORISE_FPX_TRANSACTION_LOADING });

        try {
            const response = await authoriseFPXTransactionService(dataReducer);
            console.log("[ZestCASA][authoriseFPXTransaction] >> Success");
            console.log(response.data.result);

            const result = response?.data?.result;
            const statusCode = result.statusCode ?? null;

            if (statusCode === "0000" && result) {
                if (callback) {
                    callback(result);
                }
                dispatch({
                    type: AUTHORISE_FPX_TRANSACTION_SUCCESS,
                    data: result,
                    statusDesc: result.statusDesc,
                    statusCode: result.statusCode,
                });
            } else {
                const statusDesc = response?.data?.statusDesc ?? null;
                console.log("[ZestCASA][authoriseFPXTransaction] >> Failure");
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: AUTHORISE_FPX_TRANSACTION_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][authoriseFPXTransaction] >> Failure");
            dispatch({ type: AUTHORISE_FPX_TRANSACTION_ERROR, error: error });
        }
    };
};

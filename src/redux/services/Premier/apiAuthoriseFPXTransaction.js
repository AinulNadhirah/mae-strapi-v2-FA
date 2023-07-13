import { showErrorToast } from "@components/Toast";

import { authoriseFPXTransactionService } from "@services/apiServicePremier";

import {
    AUTHORISE_FPX_TRANSACTION_LOADING,
    AUTHORISE_FPX_TRANSACTION_ERROR,
    AUTHORISE_FPX_TRANSACTION_SUCCESS
} from "@redux/actions/services/authoriseFPXTransactionAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const authoriseFPXTransactionPremier = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: AUTHORISE_FPX_TRANSACTION_LOADING });

        try {
            const response = await authoriseFPXTransactionService(dataReducer);

            const result = response?.result;
            const statusCode = result?.statusCode;

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
                const statusDesc = response?.statusDesc;
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: AUTHORISE_FPX_TRANSACTION_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: AUTHORISE_FPX_TRANSACTION_ERROR, error });
        }
    };
};

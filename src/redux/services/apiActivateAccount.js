import { showErrorToast } from "@components/Toast";

import { activateAccountService } from "@services/apiServiceZestCASA";

import {
    ACTIVATE_ACCOUNT_LOADING,
    ACTIVATE_ACCOUNT_ERROR,
    ACTIVATE_ACCOUNT_SUCCESS,
} from "@redux/actions/services/activateAccountAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const activateAccount = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: ACTIVATE_ACCOUNT_LOADING });
        try {
            const response = await activateAccountService(dataReducer);
            console.log("[ZestCASA][activateAccount] >> Success");
            console.log(response);

            const result = response?.data?.result;
            const statusCode = result?.statusCode ?? null;
            const refNo = result?.refNo ?? null;

            if (statusCode === "0000" && result) {
                if (callback) {
                    callback(response, refNo);
                }
                dispatch({ type: ACTIVATE_ACCOUNT_SUCCESS, data: response });
            } else {
                console.log("[ZestCASA][activateAccount] >> Failure");
                const statusDesc = response?.data?.statusDesc ?? null;

                if (callback) {
                    callback(null, refNo);
                }

                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });

                dispatch({
                    type: ACTIVATE_ACCOUNT_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][activateAccount] >> Failure");

            if (callback) {
                callback();
            }
            dispatch({ type: ACTIVATE_ACCOUNT_ERROR, error: error });
        }
    };
};

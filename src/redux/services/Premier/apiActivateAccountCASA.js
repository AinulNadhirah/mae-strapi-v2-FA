import { showErrorToast } from "@components/Toast";

import { activateAccountCASAService } from "@services/apiServicePremier";

import {
    ACTIVATE_ACCOUNT_CASA_LOADING,
    ACTIVATE_ACCOUNT_CASA_ERROR,
    ACTIVATE_ACCOUNT_CASA_SUCCESS
} from "@redux/actions/services/activateAccountCASAAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const activateAccountCASA = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: ACTIVATE_ACCOUNT_CASA_LOADING });
        try {
            const response = await activateAccountCASAService(dataReducer);

            const result = response?.result;
            const statusCode = result?.statusCode;

            if (statusCode === "0000" && result) {
                if (callback) {
                    callback(result, null);
                }
                dispatch({ type: ACTIVATE_ACCOUNT_CASA_SUCCESS, data: response });
            } else {
                const statusDesc = response?.statusDesc;

                if (callback) {
                    callback(null, statusDesc);
                }

                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });

                dispatch({
                    type: ACTIVATE_ACCOUNT_CASA_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: ACTIVATE_ACCOUNT_CASA_ERROR, error });
        }
    };
};

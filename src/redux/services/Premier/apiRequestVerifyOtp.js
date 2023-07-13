import { showErrorToast } from "@components/Toast";

import { requestVerifyOtpService } from "@services/apiServicePremier";

import {
    REQUEST_VERIFY_LOADING,
    REQUEST_VERIFY_ERROR,
    REQUEST_VERIFY_SUCCESS
} from "@redux/actions/services/requestVerifyOtpAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const requestVerifyOtp = (dataReducer, isNTB, callback) => {
    return async (dispatch) => {
        dispatch({ type: REQUEST_VERIFY_LOADING });

        try {
            const response = await requestVerifyOtpService(isNTB, dataReducer);
            console.log("[PM1][requestVerifyOtp] >> Success");
            const statusCode = response?.statusCode;
            const statusDesc = response?.statusDesc;

            if (statusCode !== "0000") {
                console.log("[PM1][requestVerifyOtp] >> Failure");
                if (callback) {
                    callback(false);
                }
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: REQUEST_VERIFY_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            } else {
                if (callback) {
                    callback(true, response);
                }
                dispatch({ type: REQUEST_VERIFY_SUCCESS, data: response });
            }
        } catch (error) {
            console.log("[PM1][requestVerifyOtp] >> Failure");
            if (callback) {
                callback(false);
            }
            dispatch({ type: REQUEST_VERIFY_ERROR, error });
        }
    };
};

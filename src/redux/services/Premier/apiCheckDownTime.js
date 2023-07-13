import { showErrorToast } from "@components/Toast";

import { checkDownTimeService } from "@services/apiServicePremier";

import {
    DOWNTIME_LOADING,
    DOWNTIME_ERROR,
    DOWNTIME_SUCCESS
} from "@redux/actions/services/downTimeAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const checkDownTimePremier = (subUrl, callback) => {
    return async (dispatch) => {
        dispatch({ type: DOWNTIME_LOADING });

        try {
            const response = await checkDownTimeService(subUrl);
            console.log("[PM1][checkDownTime] >> Success");

            if (response && response.result) {
                const result = response?.result;
                if (callback) {
                    callback(result);
                }

                dispatch({
                    type: DOWNTIME_SUCCESS,
                    data: result,
                });
            } else {
                const statusDesc = response?.statusDesc;
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({ type: DOWNTIME_ERROR, error: statusDesc || COMMON_ERROR_MSG });
            }
        } catch (error) {
            const errorFromMAE = error?.error;
           
            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: DOWNTIME_ERROR, error });
        }
    };
};

import { showErrorToast } from "@components/Toast";

import { checkDownTimeService } from "@services/apiServiceZestCASA";

import {
    DOWNTIME_LOADING,
    DOWNTIME_ERROR,
    DOWNTIME_SUCCESS,
} from "@redux/actions/services/downTimeAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const checkDownTime = (subURL, callback) => {
    return async (dispatch) => {
        dispatch({ type: DOWNTIME_LOADING });

        try {
            const response = await checkDownTimeService(subURL);
            console.log("[ZestCASA][checkDownTime] >> Success");
            console.log(response.data);

            if (response && response.data && response.data.result) {
                const result = response.data.result;
                if (callback) {
                    callback(result);
                }

                dispatch({
                    type: DOWNTIME_SUCCESS,
                    data: result,
                });
            } else {
                const statusDesc = response?.data?.statusDesc ?? null;
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                console.log("[ZestCASA][checkDownTime] >> Failure");
                dispatch({ type: DOWNTIME_ERROR, error: statusDesc || COMMON_ERROR_MSG });
            }
        } catch (error) {
            console.log("[ZestCASA][checkDownTime] >> Failure");
            dispatch({ type: DOWNTIME_ERROR, error: error });
        }
    };
};

import { showErrorToast } from "@components/Toast";

import { asbCheckEligibilityService } from "@services";

import {
    ASB_SEND_NOTIFICATION_LOADING,
    ASB_SEND_NOTIFICATION_ERROR,
    ASB_SEND_NOTIFICATION_SUCCESS,
} from "@redux/actions/ASBServices/asbSendNotificationAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbCheckEligibility = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_SEND_NOTIFICATION_LOADING });

            const response = await asbCheckEligibilityService(dataReducer);

            const result = response?.data?.result;
            const statusCode = result?.pnbResponse?.overallStatus?.statusCode;
            console.log("[ASB][asbCheckEligibility][response]", JSON.stringify(result));

            if (statusCode === "0000") {
                dispatch({
                    type: ASB_SEND_NOTIFICATION_ERROR,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][asbCheckEligibility][catch] >> Failure");
            dispatch({ type: ASB_SEND_NOTIFICATION_SUCCESS, error: error });
        }
    };
};

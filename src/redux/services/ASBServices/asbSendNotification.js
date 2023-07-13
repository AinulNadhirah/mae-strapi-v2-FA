import { showErrorToast } from "@components/Toast";

import { asbSendNotificationService } from "@services";

import {
    ASB_SEND_NOTIFICATION_LOADING,
    ASB_SEND_NOTIFICATION_ERROR,
    ASB_SEND_NOTIFICATION_SUCCESS,
} from "@redux/actions/ASBServices/asbSendNotificationAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbSendNotification = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_SEND_NOTIFICATION_LOADING });

            const response = await asbSendNotificationService(dataReducer);
            console.log("[ASB][asbSendNotification][response]", JSON.stringify(response));

            const result = response?.data?.result;

            let status = result.status ?? null;

            if (status == "Accepted") {
                dispatch({
                    type: ASB_SEND_NOTIFICATION_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                console.log(
                    "[ASB][asbSendNotification][result errorMsg ==>]",
                    result?.statusDescription
                );
                dispatch({
                    type: ASB_SEND_NOTIFICATION_ERROR,
                    error: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][asbSendNotification][catch] >> Failure");
            dispatch({ type: ASB_SEND_NOTIFICATION_ERROR, error: error });
        }
    };
};

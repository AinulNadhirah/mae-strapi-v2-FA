import { showErrorToast } from "@components/Toast";

import { asbBecomeAGuarantorService } from "@services";

import {
    ASB_BECOME_GUARANTOR_CONSENT_LOADING,
    ASB_BECOME_GUARANTOR_ERROR,
    ASB_BECOME_GUARANTOR_SUCCESS,
} from "@redux/actions/ASBServices/asbBecomeAGuarantorAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbBecomeAGuarantor = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_BECOME_GUARANTOR_CONSENT_LOADING });

            const response = await asbBecomeAGuarantorService(dataReducer, true);
            const result = response?.data?.result;
            const message = response?.data?.message;

            console.log("[ASB][asbBecomeAGuarantor][response]", JSON.stringify(response));

            if (message == "Success" && result) {
                dispatch({
                    type: ASB_BECOME_GUARANTOR_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                console.log(
                    "[ASB][asbBecomeAGuarantor][result errorMsg ==>]",
                    result?.statusDescription
                );
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][asbBecomeAGuarantor][catch] >> Failure");
            dispatch({ type: ASB_BECOME_GUARANTOR_ERROR, error: error });
        }
    };
};

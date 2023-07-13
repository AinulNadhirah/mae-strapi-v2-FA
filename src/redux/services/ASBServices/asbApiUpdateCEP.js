import { showErrorToast } from "@components/Toast";

import { updateApiCEP } from "@services";

import {
    ASB_UPDATE_CEP_LOADING,
    ASB_UPDATE_CEP_ERROR,
    ASB_UPDATE_CEP_SUCCESS,
} from "@redux/actions/ASBServices/asbUpdateCEPAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbUpdateCEP = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_UPDATE_CEP_LOADING });

            const response = await updateApiCEP(dataReducer);
            const result = response?.data?.result.msgHeader;

            console.log("[ASB][asbUpdateCEP][response]", JSON.stringify(result));
            let statusCode = result.responseCode ?? null;

            if (statusCode == "0000") {
                dispatch({
                    type: ASB_UPDATE_CEP_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                console.log("[ASB][asbUpdateCEP][result errorMsg ==>]", result?.statusDescription);
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][asbUpdateCEP][catch] >> Failure");
            dispatch({ type: ASB_UPDATE_CEP_ERROR, error: error });
        }
    };
};

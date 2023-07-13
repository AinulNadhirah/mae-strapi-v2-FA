import { showErrorToast } from "@components/Toast";

import { applicationDetailsApi } from "@services";

import {
    ASB_APPLICAION_DEATAILS_LOADING,
    ASB_APPLICAION_DEATAILS_ERROR,
    ASB_APPLICAION_DEATAILS_SUCCESS,
} from "@redux/actions/ASBServices/asbApplicationDetailsAction";

import {
    COMMON_ERROR_MSG,
    MONTHLY_PAYMENT,
    PROFIT_INTEREST,
    TAKAFUL_INSURANCE_FEE,
    TENURE,
} from "@constants/strings";

export const asbApplicationDetails = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_APPLICAION_DEATAILS_LOADING });

            const response = await applicationDetailsApi(dataReducer, true);
            const result = response?.data?.result?.msgBody?.stpApp;
            const message = response?.data?.message;

            console.log("[ASB][asbApplicationDetails][response]", JSON.stringify(response));

            if (message == "Success" && result) {
                const bodyList = [
                    { heading: TENURE, headingValue: `${result?.stpFinancingTenure} year` },

                    { heading: PROFIT_INTEREST, headingValue: `${result?.stpProfitRate} %` },
                    { heading: MONTHLY_PAYMENT, headingValue: `RM ${result?.stpMonthlyPayment}` },
                    {
                        heading: TAKAFUL_INSURANCE_FEE,
                        headingValue: `RM ${result?.stpInsuranceRate}`,
                    },
                ];

                dispatch({
                    type: ASB_APPLICAION_DEATAILS_SUCCESS,
                    data: result,
                    bodyList: bodyList,
                });

                if (callback) {
                    callback(result, bodyList);
                }
            } else {
                console.log(
                    "[ASB][asbApplicationDetails][result errorMsg ==>]",
                    result?.statusDescription
                );
                showErrorToast({
                    message: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ASB][asbApplicationDetails][catch] >> Failure");
            dispatch({ type: ASB_APPLICAION_DEATAILS_ERROR, error: error });
        }
    };
};

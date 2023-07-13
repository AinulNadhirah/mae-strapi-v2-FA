// import { identifyUserStatus } from "@screens/ZestCASA/helpers/ZestHelpers";
import { showErrorToast } from "@components/Toast";

import ApiManager from "@services/ApiManager";

import {
    POTENTIAL_EARNING_LOADING,
    POTENTIAL_EARNING_ERROR,
    POTENTIAL_EARNING_SUCCESS,
} from "@redux/actions/services/calculatePotentialEarningsAction";

import { TOKEN_TYPE_M2U, METHOD_POST } from "@constants/api";
import { COMMON_ERROR_MSG } from "@constants/strings";
import { ENDPOINT_BASE, ASB_CALCULATE_POTENTIAL_EARNING_URL } from "@constants/url";

export const calculatePotentialEarnings = (dataReducer, callback) => {
    console.log("dataReducer", dataReducer);
    return async (dispatch) => {
        try {
            dispatch({ type: POTENTIAL_EARNING_LOADING });
            const url = `${ENDPOINT_BASE}/${ASB_CALCULATE_POTENTIAL_EARNING_URL}`;
            console.log("[calculatePotentialEarnings][url]", url);
            ApiManager.service({
                url: url,
                data: dataReducer,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                promptError: true,
                showPreloader: true,
            })
                .then((response) => {
                    console.log("[calculatePotentialEarnings][Success]");
                    console.log("[calculatePotentialEarnings][response]", response);
                    // const result = response?.data?.result;
                    // const statusCode = result?.statusCode ?? null;
                    // console.warn("[ASB][calculatePotentialEarnings] >> response", result);
                    // console.warn("[ASB][calculatePotentialEarnings] >> response", statusCode);

                    // if (statusCode == "0000" && result) {
                    //     console.warn("[ASB][calculatePotentialEarnings] >> Success");
                    // }
                    const status = response?.data?.result?.msgHeader?.responseMsg;
                    const result = response?.data?.result?.msgBody;
                    if (status === "SUCCESS") {
                        callback(result);
                        console.log("[calculatePotentialEarnings][Success]");
                        console.log("[calculatePotentialEarnings][result]", result);
                        dispatch({
                            type: POTENTIAL_EARNING_SUCCESS,
                            data: result,
                        });
                    }
                })
                .catch((error) => {
                    console.log("[ASB][calculatePotentialEarnings] >> Failure");
                    console.log("[ASB][calculatePotentialEarnings] >> error", error);
                    dispatch({ type: POTENTIAL_EARNING_ERROR, error: error });
                });
        } catch (error) {
            console.log("[ASB][calculatePotentialEarnings] >> Failure");
            console.log("[ASB][calculatePotentialEarnings] >> catch error", error);
            dispatch({ type: POTENTIAL_EARNING_ERROR, error: error });
        }
    };
};

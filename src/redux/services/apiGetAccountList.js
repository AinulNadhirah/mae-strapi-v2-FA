import { showErrorToast } from "@components/Toast";

import { fetchAccountListService } from "@services/apiServiceZestCASA";

import {
    GET_ACCOUNT_LIST_LOADING,
    GET_ACCOUNT_LIST_ERROR,
    GET_ACCOUNT_LIST_SUCCESS,
} from "@redux/actions/services/getAccountListAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const fetchAccountList = (callback) => {
    return async (dispatch) => {
        dispatch({ type: GET_ACCOUNT_LIST_LOADING });

        try {
            const response = await fetchAccountListService();
            const result = response?.data?.result;
            const httpStatus = response?.status;
            const code = response?.data?.code ?? null;
            console.log("[ZestCASA][fetchAccountList] >> Success");
            console.log(result);

            if (httpStatus === 200 && code === 0) {
                dispatch({
                    type: GET_ACCOUNT_LIST_SUCCESS,
                    data: result,
                    statusDesc: result.statusDesc,
                    statusCode: result.statusCode,
                    total: result.total,
                    totalMfca: result.totalMfca,
                    name: result.name,
                    maeAvailable: result.maeAvailable,
                    jointAccAvailable: result.jointAccAvailable,
                    productGroupings: result.productGroupings,
                    accountListings: result.accountListings,
                });
                if (callback) {
                    callback(result);
                }
            } else {
                console.log("[ZestCASA][fetchAccountList] >> Failure");

                const statusDesc = response?.data?.statusDesc ?? null;

                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: GET_ACCOUNT_LIST_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][fetchAccountList] >> Failure");
            dispatch({ type: GET_ACCOUNT_LIST_ERROR, error: error });
        }
    };
};

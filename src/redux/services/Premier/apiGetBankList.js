import { showErrorToast } from "@components/Toast";

import { fetchCASABankListService } from "@services/apiServicePremier";

import {
    GET_BANK_LIST_LOADING,
    GET_BANK_LIST_ERROR,
    GET_BANK_LIST_SUCCESS
} from "@redux/actions/services/getBankListAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const fetchBankList = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: GET_BANK_LIST_LOADING });

        try {
            const response = await fetchCASABankListService(dataReducer);
            
            const result = response?.result;
            const statusCode = result.statusCode;

            if (statusCode === "0000" && result) {
                if (callback) {
                    callback(result);
                }
                dispatch({
                    type: GET_BANK_LIST_SUCCESS,
                    data: result,
                    statusDesc: result?.statusDesc,
                    statusCode: result?.statusCode,
                    cardDetails: result?.cardDetails,
                    bankDetails: result?.bankDetails,
                    applicantType: result?.applicantType,
                    m2uInd: result?.m2uInd,
                    fpxBuyerEmail: result?.fpxBuyerEmail,
                    bpgFlag: result?.bpgFlag,
                    customerType: result?.customerType,
                });
            } else {
                const statusDesc = response?.data?.statusDesc;
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: GET_BANK_LIST_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: GET_BANK_LIST_ERROR, error });
        }
    };
};

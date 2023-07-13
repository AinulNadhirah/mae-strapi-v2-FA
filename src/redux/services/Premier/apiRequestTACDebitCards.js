import { showErrorToast } from "@components/Toast";

import { requestTACDebitCardService } from "@services/apiServicePremier";

import {
    REQUEST_TAC_DEBIT_CARDS_LOADING,
    REQUEST_TAC_DEBIT_CARDS_ERROR,
    REQUEST_TAC_DEBIT_CARDS_SUCCESS,
} from "@redux/actions/services/requestTACDebitCardsAction";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { COMMON_ERROR_MSG } from "@constants/strings";

export const requestTACDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: REQUEST_TAC_DEBIT_CARDS_LOADING });

        try {
            const result = await requestTACDebitCardService(dataReducer);
            const statusDesc =
                result?.statusDesc ??
                result?.statusDescription ??
                result?.Msg?.MsgHeader?.StatusDesc ??
                null;
            const statusCode = result?.Msg?.MsgHeader?.StatusCode;
            console.log("[Premier][requestTACDebitCards] >> Success");
            if (statusCode === STATUS_CODE_SUCCESS) {
                const msgBody = result?.Msg?.MsgBody;
                const msgHeader = result?.Msg?.MsgHeader;
                const additionalStatusCodes = msgHeader?.AdditionalStatusCodes;
                const token = msgBody?.Token;

                dispatch({
                    type: REQUEST_TAC_DEBIT_CARDS_SUCCESS,
                    data: result,
                    msgBody,
                    msgHeader,
                    additionalStatusCodes,
                    token,
                });
                if (callback) {
                    callback(result, token);
                }
            } else {
                console.log("[Premier][requestTACDebitCards] >> Failure");
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: REQUEST_TAC_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[Premier][requestTACDebitCards] >> Failure2");
            const errorFromMAE = error?.error;
            dispatch({ type: REQUEST_TAC_DEBIT_CARDS_ERROR, error: errorFromMAE });
        }
    };
};

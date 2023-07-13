import moment from "moment";

import { showErrorToast } from "@components/Toast";

import { requestTACDebitCardService } from "@services/apiServiceZestCASA";

import {
    REQUEST_TAC_DEBIT_CARDS_LOADING,
    REQUEST_TAC_DEBIT_CARDS_ERROR,
    REQUEST_TAC_DEBIT_CARDS_SUCCESS,
} from "@redux/actions/services/requestTACDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const requestTACDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: REQUEST_TAC_DEBIT_CARDS_LOADING });

        try {
            const result = await requestTACDebitCardService(dataReducer);
            const statusDesc = result?.statusDesc ?? result?.statusDescription ?? result?.Msg?.MsgHeader?.StatusDesc ?? null;
            const statusCode = result?.Msg?.MsgHeader?.StatusCode;
            console.log("[ZestCASA][requestTACDebitCards] >> Success");
            console.log(result);

            if (statusCode === "0000") {
                const msgBody = result?.Msg?.MsgBody;
                const msgHeader = result?.Msg?.MsgHeader;
                const additionalStatusCodes = msgHeader?.AdditionalStatusCodes;
                const token = msgBody?.Token;

                dispatch({
                    type: REQUEST_TAC_DEBIT_CARDS_SUCCESS,
                    data: result,
                    msgBody: msgBody,
                    msgHeader: msgHeader,
                    additionalStatusCodes: additionalStatusCodes,
                    token: token,
                });
                if (callback) {
                    callback(result, token, moment().format("DD MMM YYYY, HH:mm A"));
                }
            } else {
                console.log("[ZestCASA][requestTACDebitCards] >> Failure");
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: REQUEST_TAC_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][requestTACDebitCards] >> Failure2");
            console.log(error);
            const errorFromMAE = error?.error;
            dispatch({ type: REQUEST_TAC_DEBIT_CARDS_ERROR, error: errorFromMAE });
        }
    };
};

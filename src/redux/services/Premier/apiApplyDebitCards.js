import { applyDebitCardService } from "@services/apiServicePremier";

import {
    APPLY_DEBIT_CARDS_LOADING,
    APPLY_DEBIT_CARDS_ERROR,
    APPLY_DEBIT_CARDS_SUCCESS
} from "@redux/actions/services/applyDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const applyDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: APPLY_DEBIT_CARDS_LOADING });
        const successStatusCodes = ["000", "0000", "0"];

        try {
            const result = await applyDebitCardService(dataReducer);
            const statusDesc = result?.statusDesc ?? result?.statusDescription;
            const msgBody = result?.Msg?.MsgBody;
            const msgHeader = result?.Msg?.MsgHeader;
            const additionalStatusCodes = msgHeader?.AdditionalStatusCodes;
            const messageID = msgHeader?.MsgID;
            // zimp-7907 -> zim -34 user story
            const statusCode = msgBody?.StatusCode;

            if (successStatusCodes.includes(statusCode) && result) {
                dispatch({
                    type: APPLY_DEBIT_CARDS_SUCCESS,
                    data: result,
                    msgBody,
                    msgHeader,
                    additionalStatusCodes,
                });
                if (callback) {
                    callback(result, messageID);
                }
            } else {
                if (callback) {
                    callback(null, messageID);
                }

                dispatch({
                    type: APPLY_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, null, errorFromMAE);
            }

            dispatch({ type: APPLY_DEBIT_CARDS_ERROR, error });
        }
    };
};

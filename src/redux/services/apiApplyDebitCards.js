import { applyDebitCardService } from "@services/apiServiceZestCASA";

import {
    APPLY_DEBIT_CARDS_LOADING,
    APPLY_DEBIT_CARDS_ERROR,
    APPLY_DEBIT_CARDS_SUCCESS,
} from "@redux/actions/services/applyDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const applyDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: APPLY_DEBIT_CARDS_LOADING });

        try {
            const result = await applyDebitCardService(dataReducer);
            const statusDesc = result?.statusDesc ?? result?.statusDescription ?? null;
            console.log("[ZestCASA][applyDebitCards] >> Success");
            console.log(result);
            const msgBody = result?.Msg?.MsgBody;
            const msgHeader = result?.Msg?.MsgHeader;
            const additionalStatusCodes = msgHeader?.AdditionalStatusCodes;
            const messageID = msgHeader?.MsgID;
            // zimp-7907 -> zim -34 user story
            const statusCode = msgBody?.StatusCode;

            if ((statusCode === "000" || statusCode === "0000" || statusCode === "0") && result) {
                dispatch({
                    type: APPLY_DEBIT_CARDS_SUCCESS,
                    data: result,
                    msgBody: msgBody,
                    msgHeader: msgHeader,
                    additionalStatusCodes: additionalStatusCodes,
                });
                if (callback) {
                    callback(result, messageID);
                }
            } else {
                console.log("[ZestCASA][applyDebitCards] >> Failure");

                if (callback) {
                    callback(null, messageID);
                }

                dispatch({
                    type: APPLY_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][applyDebitCards] >> Failure2");
            console.log(error);
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, null, errorFromMAE);
            }

            dispatch({ type: APPLY_DEBIT_CARDS_ERROR, error: error });
        }
    };
};

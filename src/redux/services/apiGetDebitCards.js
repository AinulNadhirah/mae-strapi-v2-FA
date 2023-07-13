import { showErrorToast } from "@components/Toast";

import { requestGetDebitCards } from "@services/apiServiceZestCASA";

import {
    GET_DEBIT_CARDS_LOADING,
    GET_DEBIT_CARDS_ERROR,
    GET_DEBIT_CARDS_SUCCESS,
} from "@redux/actions/services/getDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const getDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: GET_DEBIT_CARDS_LOADING });

        try {
            const result = await requestGetDebitCards(dataReducer);
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? result?.statusDescription ?? null;
            console.log("[ZestCASA][getDebitCards] >> Success");
            console.log(result);

            if (statusCode === "0000" && result) {
                const cardList = getCardsData(result?.cardtls);
                console.log(cardList);

                if (callback) {
                    callback(result);
                }
                dispatch({
                    type: GET_DEBIT_CARDS_SUCCESS,
                    data: result,
                    cardData: cardList,
                });
            } else {
                console.log("[ZestCASA][getDebitCards] >> Failure");

                if (callback) {
                    callback(null, statusDesc);
                }

                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: GET_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][getDebitCards] >> Failure2");
            console.log(error);
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, errorFromMAE);
            }

            dispatch({ type: GET_DEBIT_CARDS_ERROR, error: error });
        }
    };
};

const getCardsData = (data) => {
    return data.map((obj) => {
        const {
            cardCategory,
            cardCode,
            cardMinLimit,
            cardType,
            productOverview,
            displayName,
            thumbnailImage,
            displayOrder,
        } = obj;
        return {
            cardCategory: cardCategory,
            cardCode: cardCode,
            cardMinLimit: cardMinLimit,
            cardType: cardType,
            productOverview: productOverview,
            cardName: displayName,
            cardImage: thumbnailImage,
            cardIndex: displayOrder,
            obj: obj,
        };
    });
};

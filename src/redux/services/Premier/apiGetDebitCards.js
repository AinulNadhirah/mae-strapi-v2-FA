import { showErrorToast } from "@components/Toast";

import { requestGetDebitCards } from "@services/apiServicePremier";

import {
    GET_DEBIT_CARDS_LOADING,
    GET_DEBIT_CARDS_ERROR,
    GET_DEBIT_CARDS_SUCCESS
} from "@redux/actions/services/getDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const getDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: GET_DEBIT_CARDS_LOADING });

        try {
            const result = await requestGetDebitCards(dataReducer);
            
            const statusCode = result?.statusCode;
            const statusDesc = result.statusDesc ?? result.statusDescription;

            if (statusCode === "0000" && result) {
                const cardList = getCardsData(result?.cardtls);

                if (callback) {
                    callback(result);
                }
                dispatch({
                    type: GET_DEBIT_CARDS_SUCCESS,
                    data: result,
                    cardData: cardList,
                });
            } else {
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
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, errorFromMAE);
            }

            dispatch({ type: GET_DEBIT_CARDS_ERROR, error });
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
            cardCategory,
            cardCode,
            cardMinLimit,
            cardType,
            productOverview,
            cardName: displayName,
            cardImage: thumbnailImage,
            cardIndex: displayOrder,
            obj,
        };
    });
};

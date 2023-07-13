export const REQUEST_TAC_DEBIT_CARDS_LOADING = () => ({});

export const REQUEST_TAC_DEBIT_CARDS_ERROR = (error) => ({
    error: error,
});

export const REQUEST_TAC_DEBIT_CARDS_SUCCESS = (
    data,
    msgBody,
    msgHeader,
    additionalStatusCodes,
    token
) => ({
    data: data,
    msgBody: msgBody,
    msgHeader: msgHeader,
    additionalStatusCodes: additionalStatusCodes,
    token: token,
});

export const REQUEST_TAC_DEBIT_CARDS_CLEAR = () => ({});

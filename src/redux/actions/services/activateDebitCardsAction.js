export const ACTIVATE_DEBIT_CARDS_LOADING = () => ({});

export const ACTIVATE_DEBIT_CARDS_ERROR = (error) => ({
    error: error,
});

export const ACTIVATE_DEBIT_CARDS_SUCCESS = (data, msgBody, msgHeader, additionalStatusCodes) => ({
    data: data,
    msgBody: msgBody,
    msgHeader: msgHeader,
    additionalStatusCodes: additionalStatusCodes,
});

export const ACTIVATE_DEBIT_CARDS_CLEAR = () => ({});

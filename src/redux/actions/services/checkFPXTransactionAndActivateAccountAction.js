export const CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_LOADING = () => ({});

export const CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_ERROR = (error) => ({
    error: error,
});

export const CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_SUCCESS = (
    data,
    fpxTransactionId,
    refId,
    time
) => ({
    data: data,
    fpxTransactionId: fpxTransactionId,
    refId: refId,
    time: time,
});

export const CHECK_FPX_TRANSACTION_AND_ACTIVATE_ACCOUNT_CLEAR = () => ({});

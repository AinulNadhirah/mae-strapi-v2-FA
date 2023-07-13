export const GET_ACCOUNT_LIST_LOADING = () => ({});

export const GET_ACCOUNT_LIST_ERROR = (error) => ({
    error: error,
});

export const GET_ACCOUNT_LIST_SUCCESS = (
    data,
    statusCode,
    statusDesc,
    total,
    totalMfca,
    name,
    maeAvailable,
    jointAccAvailable,
    productGroupings,
    accountListings
) => ({
    data: data,
    statusCode: statusCode,
    statusDesc: statusDesc,
    total: total,
    totalMfca: totalMfca,
    name: name,
    maeAvailable: maeAvailable,
    jointAccAvailable: jointAccAvailable,
    productGroupings: productGroupings,
    accountListings: accountListings,
});

export const UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION = (accountListings, maeAvailable) => ({
    accountListings: accountListings,
    maeAvailable: maeAvailable,
});

export const GET_ACCOUNT_LIST_CLEAR = () => ({});

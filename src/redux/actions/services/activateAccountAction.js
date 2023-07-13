export const ACTIVATE_ACCOUNT_LOADING = () => ({});

export const ACTIVATE_ACCOUNT_ERROR = (error) => ({
    error: error,
});

export const ACTIVATE_ACCOUNT_SUCCESS = (data) => ({
    data: data,
});

export const ACTIVATE_ACCOUNT_CLEAR = () => ({});

export const ZEST_CASA_ACTIVATE_ACCOUNT_BODY = (state) => ({
    state,
});

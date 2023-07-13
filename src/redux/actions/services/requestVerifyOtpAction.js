export const REQUEST_VERIFY_LOADING = () => ({});

export const REQUEST_VERIFY_ERROR = (error) => ({
    error: error,
});

export const REQUEST_VERIFY_SUCCESS = (data) => ({
    data: data,
});

export const REQUEST_VERIFY_CLEAR = () => ({});

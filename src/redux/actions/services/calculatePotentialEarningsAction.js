export const POTENTIAL_EARNING_LOADING = () => ({});

export const POTENTIAL_EARNING_ERROR = (error) => ({
    error: error,
});

export const POTENTIAL_EARNING_SUCCESS = (data) => ({
    data: data,
});

export const POTENTIAL_EARNING_CLEAR = () => ({
    data: null,
});

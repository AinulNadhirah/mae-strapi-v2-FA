export const DOWNTIME_LOADING = () => ({});

export const DOWNTIME_ERROR = (error) => ({
    error: error,
});

export const DOWNTIME_SUCCESS = (data) => ({
    data: data,
});

export const DOWNTIME_CLEAR = () => ({});

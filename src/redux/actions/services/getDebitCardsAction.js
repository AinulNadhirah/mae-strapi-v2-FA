export const GET_DEBIT_CARDS_LOADING = () => ({});

export const GET_DEBIT_CARDS_ERROR = (error) => ({
    error: error,
});

export const GET_DEBIT_CARDS_SUCCESS = (data, cardData) => ({
    data: data,
    cardData: cardData,
});

export const GET_DEBIT_CARDS_CLEAR = () => ({});

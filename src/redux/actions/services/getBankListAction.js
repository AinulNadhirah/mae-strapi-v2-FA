export const GET_BANK_LIST_LOADING = () => ({});

export const GET_BANK_LIST_ERROR = (error) => ({
    error: error,
});

export const GET_BANK_LIST_SUCCESS = (
    data,
    statusCode,
    statusDesc,
    cardDetails,
    bankDetails,
    applicantType,
    m2uInd,
    fpxBuyerEmail,
    bpgFlag,
    customerType
) => ({
    data: data,
    statusCode: statusCode,
    statusDesc: statusDesc,
    cardDetails: cardDetails,
    bankDetails: bankDetails,
    applicantType: applicantType,
    m2uInd: m2uInd,
    fpxBuyerEmail: fpxBuyerEmail,
    bpgFlag: bpgFlag,
    customerType: customerType,
});

export const GET_BANK_LIST_CLEAR = () => ({});

export const GET_BANK_SELECTED_ITEM = (selectedData) => ({
    selectedData: selectedData,
});

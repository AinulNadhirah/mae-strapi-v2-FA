import {
    GET_BANK_LIST_LOADING,
    GET_BANK_LIST_ERROR,
    GET_BANK_LIST_SUCCESS,
    GET_BANK_LIST_CLEAR,
    GET_BANK_SELECTED_ITEM,
} from "@redux/actions/services/getBankListAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    error: null,
    data: null,
    statusCode: null,
    statusDesc: null,
    cardDetails: null,
    bankDetails: null,
    applicantType: null,
    m2uInd: null,
    fpxBuyerEmail: null,
    bpgFlag: null,
    customerType: null,
    selectedBankData: null,
};

// Reducer
function getBankListReducer(state = initialState, action) {
    switch (action.type) {
        case GET_BANK_LIST_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case GET_BANK_LIST_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case GET_BANK_LIST_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                cardDetails: action.cardDetails,
                bankDetails: action.bankDetails,
                applicantType: action.applicantType,
                m2uInd: action.m2uInd,
                fpxBuyerEmail: action.fpxBuyerEmail,
                bpgFlag: action.bpgFlag,
                customerType: action.customerType,
            };

        case GET_BANK_LIST_CLEAR:
            return {
                ...state,
                status: "idle",
                error: null,
                data: null,
                statusCode: null,
                statusDesc: null,
                cardDetails: null,
                bankDetails: null,
                applicantType: null,
                m2uInd: null,
                fpxBuyerEmail: null,
                bpgFlag: null,
                customerType: null,
                selectedBankData: null,
            };

        case GET_BANK_SELECTED_ITEM:
            return {
                ...state,
                selectedBankData: action.selectedData,
            };

        default:
            return state;
    }
}

export default getBankListReducer;

import {
    IS_PM1_ACTION,
    IS_PMA_ACTION,
    IS_ZEST_ACTION,
    ENTRY_CLEAR,
    IS_KAWANKU_SAVINGS_ACTION,
    IS_KAWANKU_SAVINGS_I_ACTION,
} from "@redux/actions/ZestCASA/entryAction";

const initialState = {
    isZest: null,
    isPM1: null,
    isPMA: null,
    isKawanku: null,
    isKawankuSavingsI: null,
};

export default function entryReducer(state = initialState, action) {
    switch (action.type) {
        case IS_ZEST_ACTION:
            return {
                ...state,
                isZest: action.isZest,
            };

        case IS_PM1_ACTION:
            return {
                ...state,
                isPM1: action.isPM1,
            };

        case IS_PMA_ACTION:
            return {
                ...state,
                isPMA: action.isPMA,
            };

        case IS_KAWANKU_SAVINGS_ACTION:
            return {
                ...state,
                isKawanku: action.isKawanku,
            };
        case IS_KAWANKU_SAVINGS_I_ACTION:
            return {
                ...state,
                isKawankuSavingsI: action.isKawankuSavingsI,
            };

        case ENTRY_CLEAR:
            return {
                ...state,
                isZest: null,
                isPM1: null,
                isPMA: null,
                isKawanku: null,
                isKawankuSavingsI: null,
            };

        default:
            return state;
    }
}

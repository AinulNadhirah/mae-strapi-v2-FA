import {
    GUARANTOR_DECLARATION_AGREE_ACTION,
    GUARANTOR_DECLARATION_CLEAR_ACTION,
} from "@redux/actions/ASBFinance/guarantorDeclarationAction";

const initialState = {
    agreeDeclaration: null,
};

// Personal details reducer
export default function guarantorDeclarationReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_DECLARATION_AGREE_ACTION:
            return {
                ...state,
                agreeDeclaration: action.agreeDeclaration,
            };

        case GUARANTOR_DECLARATION_CLEAR_ACTION:
            return {
                ...state,
                agreeDeclaration: null,
            };

        default:
            return state;
    }
}

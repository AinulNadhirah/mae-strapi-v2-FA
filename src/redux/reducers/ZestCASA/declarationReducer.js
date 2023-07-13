import {
    AGREE_TO_BE_CONTACTED_ACTION,
    DECLARATION_CONTINUE_BUTTON_DISABLED_ACTION,
    DECLARATION_CLEAR,
} from "@redux/actions/ZestCASA/declarationAction";

const initialState = {
    isAgreeToBeContacted: null,
    privacyPolicy: null,
    fatcaStateDeclaration: null,
    termsAndConditions: null,

    isDeclarationContinueButtonEnabled: false,
};

// Declaration reducer
export default function declarationReducer(state = initialState, action) {
    switch (action.type) {
        case AGREE_TO_BE_CONTACTED_ACTION:
            console.log("isAgreeToBeContacted" + action.isAgreeToBeContacted);
            return {
                ...state,
                isAgreeToBeContacted: action.isAgreeToBeContacted,
                privacyPolicy: "Y",
                fatcaStateDeclaration: "Y",
                termsAndConditions: "Y",
            };

        case DECLARATION_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isDeclarationContinueButtonEnabled: checkDeclarationContinueButtonStatus(state),
            };

        case DECLARATION_CLEAR:
            return {
                ...state,
                isAgreeToBeContacted: null,

                isSelectDebitCardContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check declaration continue button status
export const checkDeclarationContinueButtonStatus = (state) => {
    return state.isAgreeToBeContacted;
};

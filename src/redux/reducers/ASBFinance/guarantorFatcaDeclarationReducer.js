import {
    GUARANTOR_FATCA_DECLARATION_IS_US_PERSON,
    GUARANTOR_FATCA_DECLARATION_SUBMIT_BUTTON_ENABLE,
    GUARANTOR_FATCA_DECLARATION_CLEAR,
} from "@redux/actions/ASBFinance/guarantorFatcaDeclarationAction";

const initialState = {
    isUSPerson: null,
    isFatcaDeclarationButtonEnabled: false,
};

export default function guarantorFatcaDeclarationReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_FATCA_DECLARATION_IS_US_PERSON:
            return {
                ...state,
                isUSPerson: action.isUSPerson,
            };

        case GUARANTOR_FATCA_DECLARATION_SUBMIT_BUTTON_ENABLE:
            return {
                ...state,
                isFatcaDeclarationButtonEnabled: checkFatcaDeclarationSubmitBottonEnable(state),
            };

        case GUARANTOR_FATCA_DECLARATION_CLEAR:
            return {
                ...state,
                isUSPerson: null,
                isFatcaDeclarationButtonEnabled: false,
            };

        default:
            return state;
    }
}

const checkFatcaDeclarationSubmitBottonEnable = (state) => {
    return state.isUSPerson === true || state.isUSPerson === false ? true : false;
};

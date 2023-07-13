import { validateTransferAmount } from "@screens/ZestCASA/ZestCASAValidation";

import {
    TRANSFER_AMOUNT_ACTION,
    UPDATE_VALID_TRANSFER_AMOUNT,
    EDIT_CASA_TRANSFER_AMOUNT_CONTINUE_BUTTON_DISABLED_ACTION,
    EDIT_CASA_TRANSFER_AMOUNT_CLEAR,
} from "@redux/actions/ZestCASA/editCASATransferAmountAction";

const initialState = {
    transferAmount: null,
    validTransferAmount: null,
    transferAmountWithoutFormated: "",

    transferAmountErrorMessage: null,
    isEditCASATransferAmountContinueButtonEnabled: false,
};

export default function editCASATransferAmountReducer(state = initialState, action) {
    switch (action.type) {
        case TRANSFER_AMOUNT_ACTION:
            return {
                ...state,
                transferAmount: action.transferAmount,
                transferAmountWithoutFormated: action.transferAmountWithoutFormated,
                transferAmountErrorMessage: validateTransferAmount(
                    action.transferAmount,
                    action.minimumTransferAmount
                ),
            };

        case UPDATE_VALID_TRANSFER_AMOUNT:
            return {
                ...state,
                validTransferAmount: action.validTransferAmount,
            };

        case EDIT_CASA_TRANSFER_AMOUNT_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isEditCASATransferAmountContinueButtonEnabled:
                    checkEmploymentDetailsContinueButtonStatus(state),
            };

        case EDIT_CASA_TRANSFER_AMOUNT_CLEAR:
            return {
                ...state,
                transferAmount: null,
                validTransferAmount: null,
                transferAmountWithoutFormated: null,
                transferAmountErrorMessage: null,
                isEditCASATransferAmountContinueButtonEnabled: false,
            };

        default:
            return state;
    }
}

// Check edit CASA Transfer Amount continue button status
export const checkEmploymentDetailsContinueButtonStatus = (state) => {
    return state.transferAmount && state.transferAmountErrorMessage === null;
};

// Edit CASA Transfer Amount actions

export const TRANSFER_AMOUNT_ACTION = (
    transferAmountWithoutFormated,
    transferAmount,
    minimumTransferAmount
) => ({
    transferAmountWithoutFormated: transferAmountWithoutFormated,
    transferAmount: transferAmount,
    minimumTransferAmount: minimumTransferAmount,
});

export const UPDATE_VALID_TRANSFER_AMOUNT = (validTransferAmount) => ({
    validTransferAmount: validTransferAmount,
});

export const EDIT_CASA_TRANSFER_AMOUNT_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const EDIT_CASA_TRANSFER_AMOUNT_CLEAR = () => ({});

export const DEBIT_CARD_SELECT_ACCOUNT_ACTION = (
    debitCardSelectAccountIndex,
    debitCardSelectAccountCode,
    debitCardSelectAccountNumber
) => ({
    debitCardSelectAccountIndex: debitCardSelectAccountIndex,
    debitCardSelectAccountCode: debitCardSelectAccountCode,
    debitCardSelectAccountNumber: debitCardSelectAccountNumber,
});

export const DEBIT_CARD_SELECT_ACCOUNT_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const DEBIT_CARD_SELECT_ACCOUNT_CLEAR = () => ({});

// Additional details actions

export const PRIMARY_INCOME_ACTION = (primaryIncomeIndex, primaryIncomeValue) => ({
    primaryIncomeIndex: primaryIncomeIndex,
    primaryIncomeValue: primaryIncomeValue,
});

export const PRIMARY_WEALTH_ACTION = (primaryWealthIndex, primaryWealthValue) => ({
    primaryWealthIndex: primaryWealthIndex,
    primaryWealthValue: primaryWealthValue,
});

export const ADDITIONAL_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForAdditionalDetails
) => ({
    isFromConfirmationScreenForAdditionalDetails: isFromConfirmationScreenForAdditionalDetails,
});

export const ADDITIONAL_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const ADDITIONAL_DETAILS_CLEAR = () => ({});

// Employment details actions

export const EMPLOYER_NAME_ACTION = (employerName) => ({
    employerName: employerName,
});

export const OCCUPATION_ACTION = (occupationIndex, occupationValue) => ({
    occupationIndex: occupationIndex,
    occupationValue: occupationValue,
});

export const SECTOR_ACTION = (sectorIndex, sectorValue) => ({
    sectorIndex: sectorIndex,
    sectorValue: sectorValue,
});

export const EMPLOYMENT_TYPE_ACTION = (employmentTypeIndex, employmentTypeValue) => ({
    employmentTypeIndex: employmentTypeIndex,
    employmentTypeValue: employmentTypeValue,
});

export const MONTHLY_INCOME_ACTION = (monthlyIncomeIndex, monthlyIncomeValue) => ({
    monthlyIncomeIndex: monthlyIncomeIndex,
    monthlyIncomeValue: monthlyIncomeValue,
});

export const INCOME_SOURCE_ACTION = (incomeSourceIndex, incomeSourceValue) => ({
    incomeSourceIndex: incomeSourceIndex,
    incomeSourceValue: incomeSourceValue,
});

export const GET_OCCUPATION_DROPDOWN_ITEMS_ACTION = (occupationDropdownItems) => ({
    occupationDropdownItems: occupationDropdownItems,
});

export const GET_SECTOR_DROPDOWN_ITEMS_ACTION = (sectorDropdownItems) => ({
    sectorDropdownItems: sectorDropdownItems,
});

export const GET_EMPLOYMENT_TYPE_DROPDOWN_ITEMS_ACTION = (employmentTypeDropdownItems) => ({
    employmentTypeDropdownItems: employmentTypeDropdownItems,
});

export const GET_MONTHLY_INCOME_DROPDOWN_ITEMS_ACTION = (monthlyIncomeDropdownItems) => ({
    monthlyIncomeDropdownItems: monthlyIncomeDropdownItems,
});

export const GET_INCOME_SOURCE_DROPDOWN_ITEMS_ACTION = (incomeSourceDropdownItems) => ({
    incomeSourceDropdownItems: incomeSourceDropdownItems,
});

export const EMPLOYMENT_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForEmploymentDetails
) => ({
    isFromConfirmationScreenForEmploymentDetails: isFromConfirmationScreenForEmploymentDetails,
});

export const EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const EMPLOYMENT_DETAILS_CLEAR = () => ({});

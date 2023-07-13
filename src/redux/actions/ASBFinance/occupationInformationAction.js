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

export const FROM_EMPLOYMENT_DURATION_ACTION = (
    fromEmploymentDurationIndex,
    fromEmploymentDurationValue
) => ({
    fromEmploymentDurationIndex: fromEmploymentDurationIndex,
    fromEmploymentDurationValue: fromEmploymentDurationValue,
});

export const TO_EMPLOYMENT_DURATION_ACTION = (
    toEmploymentDurationIndex,
    toEmploymentDurationValue
) => ({
    toEmploymentDurationIndex: toEmploymentDurationIndex,
    toEmploymentDurationValue: toEmploymentDurationValue,
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

export const GET_FROM_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION = (
    fromEmploymentDurationDropdownItems
) => ({
    fromEmploymentDurationDropdownItems: fromEmploymentDurationDropdownItems,
});

export const GET_TO_EMPLOYMENT_DURATION_DROPDOWN_ITEMS_ACTION = (
    toEmploymentDurationDropdownItems
) => ({
    toEmploymentDurationDropdownItems: toEmploymentDurationDropdownItems,
});

export const EMPLOYMENT_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForEmploymentDetails
) => ({
    isFromConfirmationScreenForEmploymentDetails: isFromConfirmationScreenForEmploymentDetails,
});

export const EMPLOYMENT_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const EMPLOYMENT_DETAILS_CLEAR = () => ({});

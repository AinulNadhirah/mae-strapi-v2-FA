// Employment details actions

export const GUARANTOR_EMPLOYER_NAME_ACTION = (employerName) => ({
    employerName,
});

export const GUARANTOR_OCCUPATION_ACTION = (occupationIndex, occupationValue) => ({
    occupationIndex,
    occupationValue,
});

export const GUARANTOR_SECTOR_ACTION = (sectorIndex, sectorValue) => ({
    sectorIndex,
    sectorValue,
});

export const GUARANTOR_EMPLOYMENT_TYPE_ACTION = (employmentTypeIndex, employmentTypeValue) => ({
    employmentTypeIndex,
    employmentTypeValue,
});

export const GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION = () => ({});

export const GUARANTOR_EMPLOYMENT_DETAILS_CLEAR = () => ({});

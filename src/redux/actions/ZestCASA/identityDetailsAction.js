// Identity details actions

export const ID_TYPE_ACTION = (identityType) => ({
    identityType: identityType,
});

export const ID_NUMBER_ACTION = (identityNumber) => ({
    identityNumber: identityNumber,
});

export const ACTIVATE_ACCOUNT_ID_NUMBER_ACTION = (identityNumber) => ({
    identityNumber: identityNumber,
});

export const PASSPORT_NUMBER_ACTION = (passportNumber) => ({
    passportNumber: passportNumber,
});

export const FULL_NAME_ACTION = (fullName) => ({
    fullName: fullName,
});

export const PASSPORT_EXPIRY_DATE_ACTION = (passportExpiryDate, passportExpiryDateObject) => ({
    passportExpiryDate: passportExpiryDate,
    passportExpiryDateObject: passportExpiryDateObject,
});

export const DATE_OF_BIRTH_ACTION = (dateOfBirth, dateOfBirthDateObject) => ({
    dateOfBirth: dateOfBirth,
    dateOfBirthDateObject: dateOfBirthDateObject,
});

export const GET_NATIONALITY_DROPDOWN_ITEMS_ACTION = (nationalityDropdownItems) => ({
    nationalityDropdownItems: nationalityDropdownItems,
});

export const NATIONALITY_ACTION = (nationalityIndex, nationalityValue) => ({
    nationalityIndex: nationalityIndex,
    nationalityValue: nationalityValue,
});

export const IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const ACTIVATE_ACCOUNT_IDENTITY_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const IDENTITY_DETAILS_CLEAR = () => ({});

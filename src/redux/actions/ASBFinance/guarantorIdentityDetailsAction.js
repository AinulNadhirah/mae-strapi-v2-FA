// Identity details actions

export const ID_NUMBER_ACTION = (identityNumber) => ({
    identityNumber,
});

export const FULL_NAME_ACTION = (fullName) => ({
    fullName,
});

export const RELATIONSHIP_ACTION = (relationshipIndex, relationshipValue) => ({
    relationshipIndex,
    relationshipValue,
});

export const MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION = (mobileNumberWithoutExtension) => ({
    mobileNumberWithoutExtension,
});

export const MOBILE_NUMBER_WITH_EXTENSION_ACTION = (mobileNumberWithExtension) => ({
    mobileNumberWithExtension,
});

export const EMAIL_ADDRESS_ACTION = (emailAddress) => ({
    emailAddress,
});

export const GUARANTOR_IDENTITY_CONTINUE_BUTTON_ENABLE_ACTION = () => ({});

export const GUARANTOR_IDENTITY_DETAILS_CLEAR = () => ({});

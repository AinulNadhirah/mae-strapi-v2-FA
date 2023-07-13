// Personal details actions

export const TITLE_ACTION = (titleIndex, titleValue) => ({
    titleIndex: titleIndex,
    titleValue: titleValue,
});

export const GENDER_ACTION = (gender, genderValue) => ({
    gender: gender,
    genderValue: genderValue,
});

export const RACE_ACTION = (raceIndex, raceValue) => ({
    raceIndex: raceIndex,
    raceValue: raceValue,
});

export const MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION = (mobileNumberWithoutExtension) => ({
    mobileNumberWithoutExtension: mobileNumberWithoutExtension,
});

export const MOBILE_NUMBER_WITH_EXTENSION_ACTION = (mobileNumberWithExtension) => ({
    mobileNumberWithExtension: mobileNumberWithExtension,
});

export const EMAIL_ADDRESS_ACTION = (emailAddress) => ({
    emailAddress: emailAddress,
});

export const POLITICAL_EXPOSURE_ACTION = (politicalExposure) => ({
    politicalExposure: politicalExposure,
});

export const GET_TITLE_DROPDOWN_ITEMS_ACTION = (titleDropdownItems) => ({
    titleDropdownItems: titleDropdownItems,
});

export const GET_RACE_DROPDOWN_ITEMS_ACTION = (raceDropdownItems) => ({
    raceDropdownItems: raceDropdownItems,
});

export const PERSONAL_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForPersonalDetails
) => ({
    isFromConfirmationScreenForPersonalDetails: isFromConfirmationScreenForPersonalDetails,
});

export const PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const PERSONAL_DETAILS_CLEAR = () => ({});

export const MOBILE_NUMBER_MASK_ACTION = (isMobileNumberMaskingOn) => ({
    isMobileNumberMaskingOn: isMobileNumberMaskingOn,
});

export const EMAIL_MASK_ACTION = (isEmailMaskingOn) => ({
    isEmailMaskingOn,
});

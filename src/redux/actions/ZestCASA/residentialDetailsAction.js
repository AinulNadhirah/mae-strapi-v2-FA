// Residential details actions

export const ADDRESS_LINE_ONE_ACTION = (addressLineOne) => ({
    addressLineOne,
});

export const ADDRESS_LINE_TWO_ACTION = (addressLineTwo) => ({
    addressLineTwo,
});

export const ADDRESS_LINE_THREE_ACTION = (addressLineThree) => ({
    addressLineThree,
});

export const POSTAL_CODE_ACTION = (postalCode) => ({
    postalCode,
});

export const STATE_ACTION = (stateIndex, stateValue) => ({
    stateIndex,
    stateValue,
});

export const CITY_ACTION = (city) => ({
    city,
});

export const GET_STATE_DROPDOWN_ITEMS_ACTION = (stateDropdownItems) => ({
    stateDropdownItems,
});

export const RESIDENTIAL_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForResidentialDetails
) => ({
    isFromConfirmationScreenForResidentialDetails,
});

export const RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION = (
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage,
    emailAddress,
    emailAddressErrorMessage
) => ({
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage,
    emailAddress,
    emailAddressErrorMessage,
});

export const RESIDENTIAL_DETAILS_CLEAR = () => ({});

export const ADDRESS_LINE_ONE_MASK_ACTION = (isAddressLineOneMaskingOn) => ({
    isAddressLineOneMaskingOn,
});

export const ADDRESS_LINE_TWO_MASK_ACTION = (isAddressLineTwoMaskingOn) => ({
    isAddressLineTwoMaskingOn,
});

export const ADDRESS_LINE_THREE_MASK_ACTION = (isAddressLineThreeMaskingOn) => ({
    isAddressLineThreeMaskingOn,
});

export const CITY_MASK_ACTION = (isCityMaskingOn) => ({
    isCityMaskingOn,
});

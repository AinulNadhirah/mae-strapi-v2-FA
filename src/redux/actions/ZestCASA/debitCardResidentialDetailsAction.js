// Residential details actions

export const DEBIT_CARD_ADDRESS_LINE_ONE_ACTION = (addressLineOne) => ({
    addressLineOne: addressLineOne,
});

export const DEBIT_CARD_ADDRESS_LINE_TWO_ACTION = (addressLineTwo) => ({
    addressLineTwo: addressLineTwo,
});

export const DEBIT_CARD_ADDRESS_LINE_THREE_ACTION = (addressLineThree) => ({
    addressLineThree: addressLineThree,
});

export const DEBIT_CARD_POSTAL_CODE_ACTION = (postalCode) => ({
    postalCode: postalCode,
});

export const DEBIT_CARD_STATE_ACTION = (stateIndex, stateValue) => ({
    stateIndex: stateIndex,
    stateValue: stateValue,
});

export const DEBIT_CARD_CITY_ACTION = (city) => ({
    city: city,
});

export const DEBIT_CARD_GET_STATE_DROPDOWN_ITEMS_ACTION = (stateDropdownItems) => ({
    stateDropdownItems: stateDropdownItems,
});

export const DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION = (
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage
) => ({
    userStatus: userStatus,
    mobileNumber: mobileNumber,
    mobileNumberErrorMessage: mobileNumberErrorMessage,
});

export const DEBIT_CARD_RESIDENTIAL_DETAILS_CLEAR = () => ({});

export const DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION = (isAddressLineOneMaskingOn) => ({
    isAddressLineOneMaskingOn: isAddressLineOneMaskingOn,
});

export const DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION = (isAddressLineTwoMaskingOn) => ({
    isAddressLineTwoMaskingOn: isAddressLineTwoMaskingOn,
});

export const DEBIT_CARD_TERMS_CONDITION = (isAddressLineThreeMaskingOn) => ({
    isAddressLineThreeMaskingOn: isAddressLineThreeMaskingOn,
});

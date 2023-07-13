// Residential details actions

export const EMPLOYMENT_ADDRESS_LINE_ONE_ACTION = (addressLineOne) => ({
    addressLineOne: addressLineOne,
});

export const EMPLOYMENT_ADDRESS_LINE_TWO_ACTION = (addressLineTwo) => ({
    addressLineTwo: addressLineTwo,
});

export const EMPLOYMENT_ADDRESS_LINE_THREE_ACTION = (addressLineThree) => ({
    addressLineThree: addressLineThree,
});

export const EMPLOYMENT_POSTAL_CODE_ACTION = (postalCode) => ({
    postalCode: postalCode,
});

export const EMPLOYMENT_STATE_ACTION = (stateIndex, stateValue) => ({
    stateIndex: stateIndex,
    stateValue: stateValue,
});

// export const MARITAL_ACTION = (maritalIndex, maritalValue) => ({
//     maritalIndex: maritalIndex,
//     maritalValue: maritalValue,
// });

// export const EDUCATION_ACTION = (educationIndex, educationValue) => ({
//     educationIndex: educationIndex,
//     educationValue: educationValue,
// });

export const EMPLOYMENT_COUNTRY_ACTION = (countryIndex, countryValue) => ({
    countryIndex: countryIndex,
    countryValue: countryValue,
});

export const EMPLOYMENT_CITY_ACTION = (city) => ({
    city: city,
});

export const GET_STATE_DROPDOWN_ITEMS_ACTION = (stateDropdownItems) => ({
    stateDropdownItems: stateDropdownItems,
});

// export const GET_MARITAL_DROPDOWN_ITEMS_ACTION = (maritalDropdownItems) => ({
//     maritalDropdownItems: maritalDropdownItems,
// });

// export const GET_EDUCATION_DROPDOWN_ITEMS_ACTION = (educationDropdownItems) => ({
//     educationDropdownItems: educationDropdownItems,
// });

export const GET_COUNTRY_DROPDOWN_ITEMS_ACTION = (countryDropdownItems) => ({
    countryDropdownItems: countryDropdownItems,
});

export const RESIDENTIAL_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForResidentialDetails
) => ({
    isFromConfirmationScreenForResidentialDetails: isFromConfirmationScreenForResidentialDetails,
});

export const RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION = (
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage
) => ({
    userStatus: userStatus,
    mobileNumber: mobileNumber,
    mobileNumberErrorMessage: mobileNumberErrorMessage,
});

export const RESIDENTIAL_DETAILS_CLEAR = () => ({});

export const EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION = (isAddressLineOneMaskingOn) => ({
    isAddressLineOneMaskingOn: isAddressLineOneMaskingOn,
});

export const EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION = (isAddressLineTwoMaskingOn) => ({
    isAddressLineTwoMaskingOn: isAddressLineTwoMaskingOn,
});

export const EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION = (isAddressLineThreeMaskingOn) => ({
    isAddressLineThreeMaskingOn: isAddressLineThreeMaskingOn,
});

// export const EMAIL_ADDRESS_ACTION = (emailAddress) => ({
//     emailAddress: emailAddress,
// });

// export const RACE_ACTION = (raceIndex, raceValue) => ({
//     raceIndex: raceIndex,
//     raceValue: raceValue,
// });

// export const GET_RACE_DROPDOWN_ITEMS_ACTION = (raceDropdownItems) => ({
//     raceDropdownItems: raceDropdownItems,
// });

export const EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION = (
    mobileNumberWithoutExtension
) => ({
    mobileNumberWithoutExtension: mobileNumberWithoutExtension,
});

export const EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION = (mobileNumberWithExtension) => ({
    mobileNumberWithExtension: mobileNumberWithExtension,
});

export const EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION = (isMobileNumberMaskingOn) => ({
    isMobileNumberMaskingOn: isMobileNumberMaskingOn,
});
export const EMPLOYMENT_POSTAL_CODE_MASK_ACTION = (isPostalCodeMaskingOn) => ({
    isPostalCodeMaskingOn: isPostalCodeMaskingOn,
});
export const EMPLOYMENT_CITY_MASK_ACTION = (isCityMaskingOn) => ({
    isCityMaskingOn: isCityMaskingOn,
});

import {
    APPLICATION_NOT_ALLOWED_BELOW_18,
    CITY_NAME_NOT_LESS_THAN_TWO_CHAR,
    DO_NOT_ENTER_TWO_OR_MORE_SPACES,
    ENTER_ADDRESS_DETAILS,
    INVALID_EMPLOYER_NAME,
    INVALID_FULL_NAME,
    MINIMUM_AMOUNT_GREATER_THEN_FIVEHUNDRED,
    MOBILE_NO_ATLEAST_TEN_DIGITS,
    MOBILE_NO_INVALID,
    MOBILE_NO_SHOULD_DIGITS,
    MYKAD_ID_NOT_LESS_TWELVE,
    MYKAD_ID_NUMERIC,
    NAME_TOO_SHORT,
    OFFICE_MOBILE_NO_DIGITS,
    OFFICE_NO_INVALID,
    OFFICE_NO_SHOULD_DIGITS,
    PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
    POSTCODE_NOT_CONTAIN_ALBHABETS,
    POSTCODE_NOT_LESS_THAN_FIVE,
    SHORT_EMPLOYER_NAME,
    VALID_EMAIL_ADDRESS,
} from "@constants/strings";

import {
    validateEmail, // maeNameRegex,
    maeOnlyNumberRegex,
    charRepeatRegex,
    addressCharRegex,
    leadingOrDoubleSpaceRegex,
    nameRegex,
    numericRegex,
    validateMyKadM2UPremierAge,
    maeNameRegex,
    employerNameSpclCharRegexASB,
} from "@utils/dataModel";

export const validateIdentityNumber = (identityNumber) => {
    const trimmedIdentityNumber = identityNumber.trim();
    const invalidAgeError = APPLICATION_NOT_ALLOWED_BELOW_18;
    const myKadLengthError = MYKAD_ID_NOT_LESS_TWELVE;
    const numericError = MYKAD_ID_NUMERIC;
    const spaceAddrErr = DO_NOT_ENTER_TWO_OR_MORE_SPACES;

    if (trimmedIdentityNumber.length > 0) {
        if (trimmedIdentityNumber.length < 12) {
            // Min length check
            return myKadLengthError;
        } else if (!numericRegex(identityNumber)) {
            // Numeric check
            return numericError;
        } else if (!leadingOrDoubleSpaceRegex(identityNumber)) {
            return spaceAddrErr;
        } else if (!validateMyKadM2UPremierAge(identityNumber)) {
            // MyKad age range validation
            return invalidAgeError;
        } else {
            return null;
        }
    } else return null;
};

export const validatAddress = (address) => {
    //Common error messages
    const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
    const spaceAddrErr = DO_NOT_ENTER_TWO_OR_MORE_SPACES;
    const invalidLengthError = ENTER_ADDRESS_DETAILS;
    const alphaNumericRegex = /^[0-9A-Za-z\d\s\.\,\*\/\-\#]+$/;

    if (address?.trim()?.length > 0) {
        if (address?.trim()?.length < 2) {
            return invalidLengthError;
        } else if (!leadingOrDoubleSpaceRegex(address.trim())) {
            return spaceAddrErr;
        } else if (!address.trim().match(alphaNumericRegex)) {
            return commErr1;
        } else return null;
    } else return null;
};

export const validateAddress = (address) => {
    //Common error messages
    const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
    const spaceAddrErr = DO_NOT_ENTER_TWO_OR_MORE_SPACES;
    const invalidLengthError = ENTER_ADDRESS_DETAILS;
    const alphaNumericRegex = /^[0-9A-Za-z\d\s\.\,\*\/\-\#]+$/;

    if (address?.trim()?.length > 0) {
        if (address?.trim()?.length < 1) {
            return invalidLengthError;
        } else if (!leadingOrDoubleSpaceRegex(address.trim())) {
            return spaceAddrErr;
        } else if (!address.trim().match(alphaNumericRegex)) {
            return commErr1;
        } else return null;
    } else return null;
};

export const validatePostalCode = (postalCode) => {
    const invalidPostcodeErr = POSTCODE_NOT_CONTAIN_ALBHABETS;
    const validPostcodeErr = POSTCODE_NOT_LESS_THAN_FIVE;

    // Check there are no other characters except numbers
    if (postalCode?.trim()?.length > 0) {
        if (postalCode?.trim()?.length != 5) {
            return validPostcodeErr;
        } else if (!maeOnlyNumberRegex(postalCode)) {
            return invalidPostcodeErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateCity = (city) => {
    const commErr1 = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
    const spaceAddrErr = DO_NOT_ENTER_TWO_OR_MORE_SPACES;
    const validCityNameErr = PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS;
    const invalidLengthError = CITY_NAME_NOT_LESS_THAN_TWO_CHAR;

    if (city?.trim()?.length > 0) {
        if (city?.trim()?.length < 2) {
            return invalidLengthError;
        } else if (!nameRegex(city)) {
            return validCityNameErr;
        } else if (!addressCharRegex(city.trim())) {
            return commErr1;
        } else if (!leadingOrDoubleSpaceRegex(city.trim())) {
            return spaceAddrErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateMobileNumber = (mobileNumber) => {
    const numberTooShortError = MOBILE_NO_ATLEAST_TEN_DIGITS;
    const validNumErr = MOBILE_NO_SHOULD_DIGITS;
    const invalidNumErr = MOBILE_NO_INVALID;

    if (mobileNumber?.trim()?.length > 0) {
        if (!maeOnlyNumberRegex(mobileNumber.trim())) {
            return validNumErr;
        } else if (mobileNumber?.trim()?.length < 9) {
            return numberTooShortError;
        } else if (mobileNumber.trim().indexOf("1") != 0 || charRepeatRegex(mobileNumber.trim())) {
            // Check for consecutive same digit 8 times repeat
            return invalidNumErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateOfficeMobileNumber = (mobileNumber) => {
    const numberTooShortError = OFFICE_MOBILE_NO_DIGITS;
    const validNumErr = OFFICE_NO_SHOULD_DIGITS;
    const invalidNumErr = OFFICE_NO_INVALID;

    if (mobileNumber?.trim()?.length > 0) {
        if (!maeOnlyNumberRegex(mobileNumber.trim())) {
            return validNumErr;
        } else if (mobileNumber?.trim()?.length < 8) {
            return numberTooShortError;
        } else if (
            mobileNumber?.trim()?.length > 10 ||
            charRepeatRegex(mobileNumber.trim()) ||
            mobileNumber.charAt(0) === 0
        ) {
            // Check for consecutive same digit 8 times repeat
            return invalidNumErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateEmailAddress = (emailAddress) => {
    const validEmailErr = VALID_EMAIL_ADDRESS;

    if (emailAddress?.trim()?.length > 0) {
        if (!validateEmail(emailAddress.trim())) {
            return validEmailErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateEmployerName = (employerName) => {
    const spclCharErr = INVALID_EMPLOYER_NAME;
    const leadingOrDoubleSpace = DO_NOT_ENTER_TWO_OR_MORE_SPACES;
    const invalidLengthError = SHORT_EMPLOYER_NAME;

    if (employerName?.trim()?.length > 0) {
        if (employerName?.trim()?.length < 5) {
            return invalidLengthError;
        } else if (!employerNameSpclCharRegexASB(employerName.trim())) {
            return spclCharErr;
        } else if (!leadingOrDoubleSpaceRegex(employerName.trim())) {
            return leadingOrDoubleSpace;
        } else {
            return null;
        }
    } else return null;
};

export const validateFullName = (fullName) => {
    const spaceAddrErr = DO_NOT_ENTER_TWO_OR_MORE_SPACES;
    const validFullNameErr = INVALID_FULL_NAME;
    const fullNameLengthErr = NAME_TOO_SHORT;

    if (fullName?.trim()?.length > 0) {
        if (fullName?.trim()?.length < 3) {
            return fullNameLengthErr;
        } else if (!maeNameRegex(fullName.trim())) {
            return validFullNameErr;
        } else if (!leadingOrDoubleSpaceRegex(fullName.trim()) && fullName?.trim()?.length > 0) {
            return spaceAddrErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateMonthlyloanInformation = (monthlyloanInformation) => {
    const errorMessage = MINIMUM_AMOUNT_GREATER_THEN_FIVEHUNDRED;
    if (monthlyloanInformation < 500) {
        return errorMessage;
    } else return null;
};

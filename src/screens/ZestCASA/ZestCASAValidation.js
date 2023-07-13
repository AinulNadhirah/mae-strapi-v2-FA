import { CURRENCY } from "@constants/strings";
import { ENTER_VALID_ADD_MSG } from "@constants/premierStrings";

import {
    validateEmail,
    maeNameRegex,
    maeOnlyNumberRegex,
    charRepeatRegex,
    addressCharRegex,
    leadingOrDoubleSpaceRegex,
    zestCASAEmployerNameSpclCharRegex,
    nameRegex,
    anySpaceRegex,
    alphaNumericNoSpaceRegex,
    validateMyKadZestAge,
    validateMyKadM2UPremierAge,
    zestCASAAddresRegex,
    hasLettersNumbers,
    numericRegex,
    passwordLengthCheck,
    validateAddressWords
} from "@utils/dataModel";

export const validateIdentityNumber = (identityNumber, isZest) => {
    const trimmedIdentityNumber = identityNumber.trim();
    const m2uPremierInvalidAgeError = "Application is only open for those aged between 18 to 65.";
    const zestInvalidAgeError =
        "Sorry, application for this account is only allowed for applicants age 18 years old and above. Thank you for your interest.";
    const myKadLengthError = "MyKad ID must not be less than 12 characters.";
    const numericError = "MyKad should be numeric only.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const ageRangeValidator = isZest ? validateMyKadZestAge : validateMyKadM2UPremierAge;

    if (trimmedIdentityNumber.length > 0) {
        if (trimmedIdentityNumber.length < 12) {
            // Min length check
            return myKadLengthError;
        } else if (!numericRegex(identityNumber)) {
            // Numeric check
            return numericError;
        } else if (!leadingOrDoubleSpaceRegex(identityNumber)) {
            return spaceAddrErr;
        } else if (!ageRangeValidator(identityNumber)) {
            // MyKad age range validation
            return isZest ? zestInvalidAgeError : m2uPremierInvalidAgeError;
        } else {
            return null;
        }
    } else return null;
};

export const activateAccountValidateIdentityNumber = (identityNumber) => {
    const trimmedIdentityNumber = identityNumber.trim();
    const myKadLengthError = "MyKad ID must not be less than 12 characters.";
    const numericError = "MyKad should be numeric only.";
    const spaceAddrErr = "Please do not enter two or more spaces.";

    if (trimmedIdentityNumber.length > 0) {
        if (trimmedIdentityNumber.length < 12) {
            // Min length check
            return myKadLengthError;
        } else if (!maeOnlyNumberRegex(identityNumber)) {
            // Numeric check
            return numericError;
        } else if (!leadingOrDoubleSpaceRegex(identityNumber)) {
            return spaceAddrErr;
        } else {
            return null;
        }
    } else return null;
};

export const validatAddress = (address) => {
    //Common error messages
    const commErr1 = "Please remove invalid special characters.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const invalidLengthError = "Please enter your address details.";

    if (address.trim().length > 0) {
        if (address.trim().length < 1) {
            return invalidLengthError;
        } else if (!leadingOrDoubleSpaceRegex(address.trim())) {
            return spaceAddrErr;
        } else if (!zestCASAAddresRegex(address.trim())) {
            return commErr1;
        } else if (validateAddressWords(address.trim())) {
            return ENTER_VALID_ADD_MSG;
        } else return null;
    } else return null;
};

export const validatePostalCode = (postalCode) => {
    const invalidPostcodeErr = "Your postcode must not contain alphabets or special characters.";
    const validPostcodeErr = "Postcode should not be less than 5 characters.";

    // Check there are no other characters except numbers
    if (postalCode.trim().length > 0) {
        if (postalCode.trim().length != 5) {
            return validPostcodeErr;
        } else if (!maeOnlyNumberRegex(postalCode)) {
            return invalidPostcodeErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateCity = (city) => {
    const commErr1 = "Please remove invalid special characters.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const validCityNameErr = "Invalid city";
    const invalidLengthError = "City name must not be lesser than 2 characters.";

    if (city.trim().length > 0) {
        if (city.trim().length < 3) {
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
    const numberTooShortError = "Mobile number should contain at least 10 digits.";
    const validNumErr = "Your mobile number should contain digits only.";
    const invalidNumErr = "The mobile number you entered is invalid.";

    if (mobileNumber.trim().length > 0) {
        if (!maeOnlyNumberRegex(mobileNumber.trim())) {
            return validNumErr;
        } else if (mobileNumber.trim().length < 9) {
            return numberTooShortError;
        } else if (mobileNumber.trim().indexOf("1") != 0 || charRepeatRegex(mobileNumber.trim())) {
            // Check for consecutive same digit 8 times repeat
            return invalidNumErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateAccountNumber = (accountNumber) => {
    const numberTooShortError = "Account number should contain at least 8 digits.";
    const validNumErr = "Your account number should contain digits only.";

    if (accountNumber.trim().length > 0) {
        if (accountNumber.trim().length < 8) {
            return numberTooShortError;
        } else if (!maeOnlyNumberRegex(accountNumber.trim())) {
            return validNumErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateEmailAddress = (emailAddress) => {
    const validEmailErr = "Please enter a valid email address.";

    if (emailAddress.trim().length > 0) {
        if (!validateEmail(emailAddress.trim())) {
            return validEmailErr;
        } else {
            return null;
        }
    } else return null;
};

export const validateEmployerName = (employerName) => {
    const spclCharErr = "Employer name is invalid.";
    const leadingOrDoubleSpace = "Please do not enter two or more spaces.";
    const invalidLengthError = "Employer name is too short.";

    if (employerName.trim().length > 0) {
        if (employerName.trim().length < 5) {
            return invalidLengthError;
        } else if (!zestCASAEmployerNameSpclCharRegex(employerName.trim())) {
            return spclCharErr;
        } else if (!leadingOrDoubleSpaceRegex(employerName.trim())) {
            return leadingOrDoubleSpace;
        } else {
            return null;
        }
    } else return null;
};

export const validateFullName = (fullName) => {
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const validFullNameErr = "Invalid full name";
    const fullNameLengthErr = "Your name is too short";

    if (fullName.trim().length > 0) {
        if (fullName.trim().length < 3) {
            return fullNameLengthErr;
        } else if (!maeNameRegex(fullName.trim())) {
            return validFullNameErr;
        } else if (!leadingOrDoubleSpaceRegex(fullName.trim()) && fullName.trim().length > 0) {
            return spaceAddrErr;
        } else {
            return null;
        }
    } else return null;
};

export const validatePassportNumber = (passportNumber) => {
    const validPassortError = "The passport number you entered is invalid.";
    const spaceCheckError = "Passport Number does not accept spaces.";
    const specialSymbolError = "Passport Number should not contain symbol";

    if (passportNumber.trim().length > 0) {
        // Space check
        if (passportNumber.trim().length < 6 && passportNumber.trim().length > 2) {
            // Min length check
            return validPassortError;
        } else if (!anySpaceRegex(passportNumber.trim()) && passportNumber.trim().length > 0) {
            return spaceCheckError;
        } else if (
            !alphaNumericNoSpaceRegex(passportNumber.trim()) &&
            passportNumber.trim().length > 0
        ) {
            // Special character check
            return specialSymbolError;
        } else if (!hasLettersNumbers(passportNumber.trim())) {
            return validPassortError;
        } else if (!passwordLengthCheck(passportNumber.trim())) {
            return validPassortError;
        } else {
            return null;
        }
    } else return null;
};

export const validateTransferAmount = (amount, minimumAmount) => {
    const trimmedAmount = amount;
    const trimmedMinimumAmount = parseFloat(minimumAmount.trim());

    const amountTooLessErr = `Transfer amount should not be lesser than ${CURRENCY}${minimumAmount}. Please enter an amount that is higher than the minimum transferable amount.`;
    if (trimmedAmount >= 0.0) {
        if (trimmedAmount < trimmedMinimumAmount) {
            return amountTooLessErr;
        } else {
            return null;
        }
    } else return null;
};

export const numberWithCommas = (val) => {
    console.log("[ZestCASAEditCASATransferAmount] >> [numberWithCommas] val : ", val);
    const text = JSON.stringify(val);
    let x = "0.00";
    if (text) {
        let resStr = "";
        if (text.length === 1) {
            resStr = text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
        } else if (text.length < 3) {
            resStr = text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
        } else {
            if (parseInt(text) > 0) {
                resStr = text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
            } else {
                resStr = "0.00";
            }
        }

        x = resStr.toString();
        const pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    }
    return x;
};

export const validatAddressDebitCard = (address) => {
    //Common error messages
    const commErr1 = "Please remove invalid special characters.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const invalidLengthError = "Please enter your address details.";

    if (address.trim().length > 0) {
        if (address.trim().length < 1) {
            return invalidLengthError;
        } else if (!leadingOrDoubleSpaceRegex(address.trim())) {
            return spaceAddrErr;
        } else if (!zestCASAAddresRegex(address.trim())) {
            return commErr1;
        } else return null;
    } else return null;
};

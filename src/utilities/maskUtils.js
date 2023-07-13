/*
    Masking of addresses:

    - For more than 8 characters. Only display last 5 characters only. If length is 7 or less, display last 3 characters only.
    - Mask the rest of the characters with *
    - Note: Spacing is counted as a character

    Example:
    1. More than 8: Jalan Tun 60, to ********n 60,
    2. 7 or less: Tun60, to ***60,
*/
export const maskAddress = (value) => {
    if (!value) return value;

    const length = value.length;
    const maskCharacter = "*";
    let maskedString = "";
    let unmaskedString = "";
    if (length >= 8) {
        maskedString = value.substring(0, length - 5);
        unmaskedString = value.substring(length - 5, length);
    } else if (length < 8) {
        maskedString = value.substring(0, length - 3);
        unmaskedString = value.substring(length - 3, length);
    }
    return `${maskedString.replace(/./gi, maskCharacter)}${unmaskedString}`;
};

/*
    Masking ID number: 
    - To mask all except first 2 digits and last 2 digits. Applicable for New IC no, Old IC, Policy/Army ID, PR ID and passport.

    Example:
    1. NRIC: 900923435238 to 90********38
    2. Police/Army ID: RF23456 to RF***56
    3. Passport ID: I234567 to I2***67 and A41239567 to A4****67
*/
export const maskIDNumber = (value) => {
    if (!value) return value;

    const length = value.length;
    const maskCharacter = "*";
    const maskedString = value.substring(2, length - 2);
    const unmaskedString1 = value.substring(0, 2);
    const unmaskedString2 = value.substring(length - 2, length);
    return `${unmaskedString1}${maskedString.replace(/./gi, maskCharacter)}${unmaskedString2}`;
};

/*
    Masking email address:

    For an email name@domain.com,
    1. If name length is less than or equal to 3, the first character will be shown, rest of the name will be masked with *; for eg., a**@mail.com
    2. If name length is greater than 3, then first 2 characters will be shown, rest of the name will be masked with *; for eg., ab***@mail.com
*/
export const maskEmail = (email) => {
    if (email) {
        const [name, domain] = email.split("@");
        const maskingChar = "*";

        const nameLength = name.length;
        let maskedName;
        if (nameLength <= 3) {
            maskedName = name[0] + maskingChar.repeat(nameLength - 1);
        } else {
            maskedName = name.substring(0, 2) + maskingChar.repeat(nameLength - 2);
        }

        return `${maskedName}@${domain}`;
    }
    return email;
};

/*
      Masking mobile number:
    - Last 4 digits of the phone number should be masked with *; for eg., if phone number is 60123456789, then the result returned would be 60 12 345* ***
*/
export function maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
        // Remove all existing whitespace from incoming mobileNumber
        const strippedNumber = mobileNumber.replace(/ /g, "");
        // Mask last 4 digits with ****
        const maskedNumber = `${strippedNumber.substring(0, strippedNumber.length - 4)}****`;
        // Check if phone number has + at the start, if yes then first block of maskedMobileNumber will be +60, else 60
        const start = maskedNumber.indexOf("+") === 0 ? 3 : 2;
        // Split maskedNumber into separate sections separated by whitespaces in the above given format
        return `${maskedNumber.substring(
            0,
            start
        )} ${maskedNumber.substring(start, start + 2)} ${maskedNumber.substring(
            start + 2,
            start + 6
        )} ${maskedNumber.substring(start + 6)}`;
    }
    return mobileNumber;
}

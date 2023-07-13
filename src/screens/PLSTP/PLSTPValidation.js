import {
    addCommas,
    removeCommas,
    validateLoanPercentage,
    divideBy,
    percentage,
} from "@screens/PLSTP/PLSTPController";

import {
    validateEmail,
    maeOnlyNumberRegex,
    charRepeatRegex,
    stpAddressRegex,
    leadingOrDoubleSpaceRegex,
    employerNameSpclCharRegex,
    nameRegex,
} from "@utils/dataModel";
import { isEmpty } from "@utils/dataModel/utility";

export const validateMonthlyGrossInc = (income) => {
    let err = "";
    const invalidAmountErr = "Monthly Gross Income you entered is invalid.";
    // Length check
    if (!maeOnlyNumberRegex(income)) {
        err = invalidAmountErr;
    }
    // Return true if no validation error
    return {
        isValid: err ? false : true,
        message: err,
    };
};

export const validateMonthlyCommitment = (income, grossIncome, netIncome = 0) => {
    if (!income && !grossIncome) return;

    let err = "";
    let actionType = "monthlyNetIncomeValid";

    const invalidNetIncomeErr = "Monthly Net Income you entered is invalid.";
    const netIncomeErr = "Monthly Net Income cannot be more than Monthly Gross Income.";
    if (netIncome !== 0 && !maeOnlyNumberRegex(netIncome)) {
        err = invalidNetIncomeErr;
    } else if (netIncome >= grossIncome) {
        err = netIncomeErr;
    }

    if (!err) {
        const invalidAmountErr = "Non-Bank monthly commitment you entered is invalid.";
        actionType = "monthlyCommitmentValid";
        if (income !== 0 && !maeOnlyNumberRegex(income)) {
            err = invalidAmountErr;
        }
        //Story 2895: Need to remove this validation
        // else if (income >= grossIncome) {
        //     err = incomeErr;
        // }
    }

    // if (!err) {
    //     actionType = "monthlyNetIncomeValid";
    //     const invalidNetIncomeErr = "Monthly Net Income you entered is invalid.";
    //     const netIncomeErr = "Monthly Net Income cannot be more than Monthly Gross Income.";
    //     if (netIncome !== 0 && !maeOnlyNumberRegex(netIncome)) {
    //         err = invalidNetIncomeErr;
    //     } else if (netIncome >= grossIncome) {
    //         err = netIncomeErr;
    //     }
    // }
    // Return true if no validation error
    return {
        isValid: !err,
        message: err,
        actionType,
    };
};

/*export const validateMyKadNum = (mykadNumber) => {
    
    let err = "";
    const err1 = "Application is only open to those aged between 21-60.";
    const err2 = "The MyKad number you entered is invalid.";
    const err3 = "MyKad number should contain 12 digits.";
    const err4 = "MyKad number should contain digits only.";

    const first6Digits = mykadNumber.substring(0, 6);
    // Length check
    if (mykadNumber.length != 12) {
        err = err3;
    } else if (!maeOnlyNumberRegex(mykadNumber)) {
        // Check there are no other characters except numbers
        err = err4;
    } else if (!isValidDOBYYMMDD(first6Digits)) {
        // Valid DOB check
        err = err2;
    } else if (!validateMyKadAge(first6Digits, 21, 60)) {
        // MyKad 21-60 age limit check
        err = err1;
    }

    // Store DOB from MyKad number once it passes all validation checks
    retrieveMyKadDOB(first6Digits);
    // Return true if no validation error
    return {
        isValid: err ? false : true,
        message: err
    };
}*/

export const validateLoanApplication = (data, masterData, maxLoanAmount) => {
    //If no data
    if (!data) return data;

    let err, actionType;
    //Type of loan
    const { loanTypeValue, amountNeed, minAmount } = data;

    const type1 = loanTypeValue === "015" ? "finance" : "borrow";
    const type2 = loanTypeValue === "015" ? "financing" : "loan";
    const loanAmount = amountNeed;
    const minLoanAmount = minAmount;
    const roundDown = masterData?.roundOff || 100;
    const minPercentage = masterData?.minAmountPercentage || 10;
    const maxPercentage = masterData?.maxAmountPercentage || 50;
    const maxLoanLimit = masterData?.maxLoanLimit || 100000;

    //Amount I need field messages
    actionType = "amountNeedValid";
    const roundedDownErr = "Your loan amount has been rounded down.";
    const lessthanMinLoanErr = `The loan amount should not be lessthan ${addCommas(
        masterData?.minAmountLoan
    )}.`;
    const maxLoanCheckErr = `The maximum amount you can ${type1} is RM ${addCommas(
        maxLoanAmount
    )}.`;
    const maxLoanRoundDownErr = `Your ${type2} amount has been rounded down.`;
    const loanMaxAmountErr = `The maximum amount you can ${type1} is RM ${addCommas(
        maxLoanLimit
    )}.`;
    const loanMinAmountErr = `The minimum amount you can ${type1} is RM ${addCommas(
        masterData?.minAmountLoan
    )}`;
    const invalidAmount = "Loan amount you entered is invalid.";

    const amountNeedRound = loanAmount % roundDown;
    //Amount I need field validation
    if (!maeOnlyNumberRegex(loanAmount)) {
        err = invalidAmount;
    } else if (loanAmount < masterData?.minAmountLoan) {
        err = loanMinAmountErr;
    } else if (!divideBy(loanAmount, roundDown)) {
        err = maxLoanRoundDownErr;
    } else if (amountNeedRound != 0) {
        err = roundedDownErr;
    } else if (loanAmount < Number(masterData?.minAmountLoan)) {
        err = lessthanMinLoanErr;
    } else if (loanAmount > Number(maxLoanAmount)) {
        if (Number(maxLoanAmount) === maxLoanLimit) {
            err = loanMaxAmountErr;
        } else {
            err = maxLoanCheckErr;
        }
    }

    let fromAmount = percentage(maxPercentage, loanAmount);
    let toAmount = percentage(100 - minPercentage, loanAmount);
    toAmount = toAmount < masterData?.minAmountLoan ? masterData?.minAmountLoan : toAmount;

    toAmount = toAmount - (removeCommas(toAmount) % 100);
    fromAmount = fromAmount - (removeCommas(fromAmount) % 100);

    fromAmount =
        loanTypeValue === "015"
            ? fromAmount < 5000
                ? 5000
                : fromAmount
            : masterData?.minAmountLoan;

    //Min amount field Messages
    const moreThanLoanErr = `Your minimum amount to ${type1} must be lower than the amount you need.`; //message for islamic has borrow
    const minAmountCheckErr = `The minimum amount you can ${type1} is RM ${addCommas(
        masterData?.minAmountLoan
    )}.`;
    const minAmountBetErr = `The minimum amount you can ${type1} must be between RM ${addCommas(
        fromAmount
    )} and RM ${addCommas(toAmount)}`; //the space between RM and amount
    const minFinAmountBetErr = `The minimum amount you can finance must be between RM ${addCommas(
        fromAmount
    )} and RM ${addCommas(toAmount)}`; //what was the xxxx values.
    const minLoanRoundErr = `Your minimum ${type2} amount has been rounded down.`; //** round down for min amount, fe need to round down or need to show error message */
    const invalidMinAmount = "Minimum amount you entered is invalid.";

    //Min amount field validation
    if (!err) {
        actionType = "minAmountValid";
        if (!maeOnlyNumberRegex(minLoanAmount)) {
            err = invalidMinAmount;
        } else if (minLoanAmount < Number(masterData?.minAmountLoan)) {
            err = minAmountCheckErr;
        } else if (!divideBy(minLoanAmount, roundDown)) {
            err = minLoanRoundErr;
        } else if (loanAmount != masterData?.minAmountLoan && minLoanAmount >= loanAmount) {
            err = moreThanLoanErr;
        } else if (validateLoanPercentage(loanAmount, minLoanAmount) < minPercentage) {
            const result = (minPercentage / 100) * masterData?.minAmountLoan;
            const minLoanApply = result + masterData?.minAmountLoan;
            if (loanAmount > minLoanApply) {
                err = fromAmount === toAmount ? loanMinAmountErr : minAmountBetErr;
            } else if (loanAmount <= minLoanApply && minLoanAmount != masterData?.minAmountLoan) {
                err = loanMinAmountErr;
            }
        }

        if (!err && loanTypeValue === "015") {
            //Islamic
            if (validateLoanPercentage(loanAmount, minLoanAmount) > maxPercentage) {
                err = minFinAmountBetErr;
            }
        }
    }
    //Return validation
    console.log("!!err :: ", !err);
    return {
        isValid: !err,
        message: err,
        actionType,
    };
};

export const validateEmploymentDetails = (data) => {
    if (!data) return data;

    const { employerName } = data;
    let err;
    const actionType = "employerNameValid";
    const spclCharErr = "Employer Name is invalid.";
    const leadingOrDoubleSpace = "Employer name must not contain leading/double spaces.";

    // Check for accepting valid special characters
    if (!employerNameSpclCharRegex(employerName)) {
        err = spclCharErr;
    } else if (!leadingOrDoubleSpaceRegex(employerName)) {
        err = leadingOrDoubleSpace;
    }

    //Return validation
    return {
        isValid: !err,
        message: err,
        actionType,
    };
};

export const validateEmploymentAddress = (data) => {
    if (!data) return data;

    const {
        officeAddress1,
        officeAddress2,
        officeAddress3,
        officeCity,
        officePostcode,
        officePhoneNum,
    } = data;
    let err, actionType;

    actionType = "addr1Valid";

    //Common error messages
    const commErr1 = "Please remove invalid special characters.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const emptyAddrErr = "Please enter your address details.";

    // Check for accepting valid special characters
    if (!stpAddressRegex(officeAddress1)) {
        err = commErr1;
    } else if (isEmpty(officeAddress1)) {
        // Min length check
        err = emptyAddrErr;
    } else if (!leadingOrDoubleSpaceRegex(officeAddress1)) {
        err = spaceAddrErr;
    }

    if (!err) {
        actionType = "addr2Valid";

        // Check for accepting valid special characters
        if (!stpAddressRegex(officeAddress2)) {
            err = commErr1;
        } else if (isEmpty(officeAddress2)) {
            // Min length check
            err = emptyAddrErr;
        } else if (!leadingOrDoubleSpaceRegex(officeAddress2)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "addr3Valid";

        // Check for accepting valid special characters
        if (!stpAddressRegex(officeAddress3)) {
            err = commErr1;
        } else if (isEmpty(officeAddress3)) {
            // Min length check
            err = emptyAddrErr;
        } else if (!leadingOrDoubleSpaceRegex(officeAddress3)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "cityValid";

        const enterCityErr = "Please enter your city.";
        const validCityNameErr = "Invalid city";
        // Check for accepting valid special characters
        // if (!cityCharRegex(officeCity)) {
        //     err = commErr1;
        // } else
        if (isEmpty(officeCity)) {
            // Min length check
            err = enterCityErr;
        } else if (!nameRegex(officeCity)) {
            err = validCityNameErr;
        } else if (!leadingOrDoubleSpaceRegex(officeCity)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "postcodeValid";

        const emptyPostcodeErr = "Please enter your postcode.";
        const invalidPostcodeErr =
            "Your postcode must not contain alphabets or special characters.";
        const validPostcodeErr = "Postcode should not be less than 5 characters.";

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(officePostcode)) {
            err = invalidPostcodeErr;
        } else if (isEmpty(officePostcode)) {
            err = emptyPostcodeErr;
        } else if (officePostcode.length != 5) {
            err = validPostcodeErr;
        }
    }

    if (!err) {
        actionType = "mobileValid";

        // const invalidPrefixErr = "The prefix you entered is invalid.";
        const numLenErr = "Office phone number should contain between 8 to 10 digits"; //"Office phone number should contain at least 10 digits.";
        const validNumErr = "Office phone number should contain digits only.";
        const invalidNumErr = "Office phone number you entered is invalid.";

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(officePhoneNum)) {
            err = validNumErr;
        } else if (officePhoneNum.length < 8 || officePhoneNum.length > 10) {
            err = numLenErr;
        } else if (charRepeatRegex(officePhoneNum)) {
            // Check for consecutive same digit 8 times repeat
            err = invalidNumErr;
        } else if (officePhoneNum.indexOf("2") == 0 || officePhoneNum.indexOf("81") == 0) {
            // officePhoneNum  prefix check
            err = invalidNumErr;
        }
    }

    //Return validation
    return {
        isValid: !err,
        message: err,
        actionType,
    };
};

export const validatePersonalDetails = (data, resumeEditData) => {
    if (!data) return data;

    const { emailAddress, mobile, homeAddress1, homeAddress2, homeAddress3, city, postcode } = data;
    let err, actionType;

    actionType = "emailValid";

    //Common error messages
    const commErr1 = "Please remove invalid special characters.";
    const spaceAddrErr = "Please do not enter two or more spaces.";
    const emptyAddrErr = "Please enter your address details.";

    const validEmailErr = "Please enter a valid email address.";
    const emptyEmailErr = "Please enter your email address.";
    // Check for accepting valid special characters
    if (!validateEmail(emailAddress)) {
        err = validEmailErr;
    } else if (emailAddress.length === 0) {
        // Min length check
        err = emptyEmailErr;
    }

    if (!err) {
        actionType = "mobileValid";

        const numLenErr = "Mobile number should contain at least 10 digits.";
        const validNumErr = "Your mobile number should contain digits only.";
        const invalidNumErr = "The mobile number you entered is invalid.";

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(mobile)) {
            err = validNumErr;
        } else if (mobile.length < 9 || mobile.length > 10) {
            err = numLenErr;
        } else if (mobile.indexOf("1") != 0 || charRepeatRegex(mobile)) {
            // Check for consecutive same digit 8 times repeat
            err = invalidNumErr;
        }
    }

    if (!err) {
        actionType = "addr1Valid";

        // Check for accepting valid special characters
        if (!stpAddressRegex(homeAddress1)) {
            err = commErr1;
        } else if (isEmpty(homeAddress1)) {
            // Min length check
            err = emptyAddrErr;
        } else if (!leadingOrDoubleSpaceRegex(homeAddress1)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "addr2Valid";

        // Check for accepting valid special characters
        if (!stpAddressRegex(homeAddress2)) {
            err = commErr1;
        } else if (isEmpty(homeAddress2)) {
            // Min length check
            err = emptyAddrErr;
        } else if (!leadingOrDoubleSpaceRegex(homeAddress2)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "addr3Valid";

        // Check for accepting valid special characters
        if (!stpAddressRegex(homeAddress3)) {
            err = commErr1;
        } else if (isEmpty(homeAddress3)) {
            // Min length check
            err = emptyAddrErr;
        } else if (!leadingOrDoubleSpaceRegex(homeAddress3)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "cityValid";

        const enterCityErr = "Please enter your city.";
        const validCityNameErr = "Invalid city";
        // Check for accepting valid special characters
        // if (!cityCharRegex(city)) {
        //     err = commErr1;
        // } else
        if (isEmpty(city)) {
            // Min length check
            err = enterCityErr;
        } else if (!nameRegex(city)) {
            err = validCityNameErr;
        } else if (!leadingOrDoubleSpaceRegex(city)) {
            err = spaceAddrErr;
        }
    }

    if (!err) {
        actionType = "postcodeValid";

        const emptyPostcodeErr = "Please enter your postcode.";
        const invalidPostcodeErr =
            "Your postcode must not contain alphabets or special characters.";
        const validPostcodeErr = "Postcode should not be less than 5 characters.";

        // Check there are no other characters except numbers
        if (!maeOnlyNumberRegex(postcode)) {
            err = invalidPostcodeErr;
        } else if (isEmpty(postcode)) {
            err = emptyPostcodeErr;
        } else if (postcode.length != 5) {
            err = validPostcodeErr;
        }
    }

    //Return validation
    return {
        isValid: !err,
        message: err,
        actionType,
    };
};

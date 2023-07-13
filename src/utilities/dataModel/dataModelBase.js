import moment from "moment";
import ImgToBase64 from "react-native-image-base64";
import { INVALID_ADDRESSES } from "@constants/data";
import { ENTER_VALID_ADD_MSG } from "@constants/premierStrings";

import * as ModelClass from "./modelClass";

export const validateEmail = (email) => {
    let isEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return isEmail.test(String(email).toLowerCase());
};
export const nameRegex = (text) => {
    let isValid = /^[a-zA-Z ]*$/;
    return isValid.test(String(text).toLowerCase());
};

export const phoneRegex = (text) => {
    let isValid = /^[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    return isValid.test(String(text).toLowerCase());
};

export const onlyNumber = (text) => {
    let isValid = /^\d*[0-9](|.\d*[0-9]|,\d*[0-9])?$/;
    return isValid.test(String(text).toLowerCase());
};
export const allowonlyFewCharacters = (text) => {
    var isValid = /[a-zA-Z0-9()*,.]+/;
    return isValid.test(String(text).toLowerCase());
};

export const validateAlphaNumaric = (text) => {
    let istext = /^[A-Za-z\d\s]+$/;
    return istext.test(String(text).toLowerCase());
};

export const m2uPasswordRegex = (text) => {
    let isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^!&*+=";'(),-./:?\\_|~[\]{}<>]).*$/;
    return isValid.test(String(text));
};
export const consecutiveCharacters = (text) => {
    let isValid =
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|yza|zab|012|123|234|345|456|567|678|789|890|901)+/gi;
    return isValid.test(String(text).toLowerCase());
};

export const consecutiveCharsOnly = (text) => {
    let isValid =
        /(aaa|bbb|ccc|ddd|eee|fff|ggg|hhh|iii|jjj|kkk|lll|mmm|nnn|ooo|ppp|qqq|rrr|sss|ttt|uuu|vvv|www|xxx|yyy|zzz)+/gi;
    return isValid.test(String(text).toLowerCase());
};

export const leadingOrDoubleSpaceRegex = (text) => {
    if (text) {
        let isValid = /^(?!\s)([^](?!\s{2,})){1,}$/;
        return isValid.test(String(text).toLowerCase());
    } else {
        return false;
    }
};

export const securityQuestionRegex = (text) => {
    var isValid = /^[a-zA-Z0-9*,.@!$\-_=/:\d\s]+$/;
    return isValid.test(String(text).toLowerCase());
};

export const inviteCodeRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\.\@,'‘’()`\/-\s]){1,}$/;
        return isValid.test(String(text).toLowerCase());
    } else {
        return false;
    }
};

export const anySpaceRegex = (text) => {
    if (text) {
        let isValid = /^(?!\s)([^](?!\s{1,})){1,}$/;
        return isValid.test(String(text).toLowerCase());
    } else {
        return false;
    }
};

export const spaceBetweenChar = (text) => {
    if (text) {
        return text.replace(/\d{4}(?=.)/g, "$& ");
    }
};

export const hasNumberRegex = (text) => {
    if (text) {
        let isValid = /\d+/;
        return isValid.test(String(text).toLowerCase());
    } else {
        return false;
    }
};

export const maeNameRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z\.@,/`'‘’-\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const empNameRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\.\@(),'\/-\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const validateArmyId = (text) => {
    const istext = /^[!@#$%^&*]/;
    return istext.test(String(text).toLowerCase());
};

export const m2uUsernameRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\._]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const employerNameSpclCharRegexASB = (text) => {
    if (text) {
        const isValid = /^([a-zA-Z\.@`'‘’,-/\s]){0,}([0-9]){0,1}([a-zA-Z\.@`'‘’,-/\s]){0,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const employerNameSpclCharRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\._@`'‘’,-/\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const employerNameAllowSomeSpclCharRegex = (text) => {
    if (text) {
        const isValid = /[!#$%^*_+“"\=\[\]{};`:\\|<>\?~]+/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const stpEmployerNameRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\._@!%`'‘’,-/\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const stpAddressRegex = (text) => {
    if (text) {
        let isValid = /^[a-zA-Z0-9]+(((['.,()#&-/@]){0,}([ ]){0,1})+[a-zA-Z0-9])*$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const remittanceAddressRegex = (text, type) => {
    const regex = {
        ftt: /^[\/\‘\-\?\:\(\)\.\,\'\’\+ 0-9a-zA-Z]+$/g,
        rt: /^[\`\.\,\(\)\#\$\-\/\@+ 0-9a-zA-Z]+$/g,
        wu: /^[\.\,\(\)\[\]\#\$\-\\/\'\’\@+ 0-9a-zA-Z]+$/g,
        bk: /^[\‘\;\:\@\&\.\,\/\\\-\+ 0-9a-zA-Z]+$/g,
    };
    if (text) {
        return regex[type].test(text);
    }
    return false;
};

export const overseasAddressRegex = (text) => {
    if (text) {
        let isValid = /^[\sa-zA-Z0-9./,-]*$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const zestCASAEmployerNameSpclCharRegex = (text) => {
    if (text) {
        const isValid = /^([a-zA-Z0-9\.@&`'‘’,-/\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const zestCASAAddresRegex = (text) => {
    if (text) {
        const isValid = /^[().&'£0-9a-zA-Z\s,/@'-]+$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const addressCharRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\._@`'‘’,-/\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

//Cards stp
export const addressCharRegexCC = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\.\@#,'’£&()\/-\s]){1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const cityCharRegex = (text) => {
    if (text) {
        let isValid = /^([a-zA-Z0-9\.@`'‘’,-/\s]){1,}$/;
        // var isValid = /^([a-zA-Z0-9]+\s)*[a-zA-Z0-9]+$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const maeNamePrefixRegex = (text) => {
    if (text) {
        let isValid = /^(?:dr|mr|mrs|miss|master|shri|mister|ms)\.?$/;
        return isValid.test(String(text).toLowerCase());
    } else {
        return false;
    }
};

export const maeOnlyNumberRegex = (text) => {
    if (text) {
        let isValid = /^[\d]{1,}$/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const isURL = (str) => {
    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return !!regex.test(str);
};

export const isMalaysianMobileNum = (mobileNo) => {
    var regex = /^(\+6|6)?(01)\d{8,9}$/; //Malayasia mobile number verification
    // return !mobileNo ? false : /^(\+6|6)?(0|1)\d{8,10}$/.test(mobileNo);
    return !mobileNo ? false : regex.test(mobileNo);
};

/*
 * DOB: 6 character string date input in format YYMMDD
 */
export const isValidDOBYYMMDD = (DOB) => {
    // Empty & length error check
    if (!DOB || DOB.length != 6) {
        return false;
    }

    let custYear = DOB.substring(0, 2);
    let custMonth = DOB.substring(2, 4);
    let custDay = DOB.substring(4, 6);
    let custYearFull = "";

    let currentDate = new Date();
    let currentYearFull = currentDate.getFullYear();
    let currentYear = currentYearFull.toString().substring(2, 4);

    if (parseInt(custYear) > currentYear) {
        custYearFull = "19" + custYear;
    } else {
        custYearFull = "20" + custYear;
    }

    var date = new Date(custYear + "-" + custMonth + "-" + custDay);
    if (date == "Invalid Date") {
        return false;
    } else {
        return true;
    }
};

export const validateMyKadAge = (DOB) => {
    try {
        var custYear = DOB.substring(0, 2);
        var custMonth = DOB.substring(2, 4);
        var custDay = DOB.substring(4, 6);
        var custYearFull = "";

        var currentDate = new Date();
        var currentYearFull = currentDate.getFullYear();
        var currentYear = currentYearFull.toString().substring(2, 4);

        if (parseInt(custYear) > currentYear) {
            custYearFull = "19" + custYear;
        } else {
            custYearFull = "20" + custYear;
        }

        var years = calculateAge(parseInt(custMonth), parseInt(custDay), parseInt(custYearFull));

        if (parseInt(years) > 80 || parseInt(years) < 12) {
            return false;
        } else if (parseInt(years) >= 12) {
            return true;
        }
    } catch (e) {
        console.log("[DataModel][validateMyKadAge] >> Exception: ", e);
    }
};

export const validateMyKadZestAge = (DOB) => {
    try {
        let custYear = DOB.substring(0, 2);
        let custMonth = DOB.substring(2, 4);
        let custDay = DOB.substring(4, 6);
        let custYearFull = "";

        let currentDate = new Date();
        let currentYearFull = currentDate.getFullYear();
        let currentYear = currentYearFull.toString().substring(2, 4);

        if (parseInt(custYear) > currentYear) {
            custYearFull = "19" + custYear;
        } else {
            custYearFull = "20" + custYear;
        }

        const dobConvertToDate = `${custYearFull}-${custMonth}-${custDay}`;
        const dobDate = moment(dobConvertToDate);
        const dateNow = moment(new Date());
        const age = dateNow.diff(dobDate, "years");

        if (age < 18) {
            return false;
        } else if (age >= 18) {
            return true;
        }
    } catch (e) {
        console.log("[DataModel][validateMyKadAge] >> Exception: ", e);
    }
};

export const validateMyKadM2UPremierAge = (DOB) => {
    try {
        let custYear = DOB.substring(0, 2);
        let custMonth = DOB.substring(2, 4);
        let custDay = DOB.substring(4, 6);
        let custYearFull = "";

        let currentDate = new Date();
        let currentYearFull = currentDate.getFullYear();
        let currentYear = currentYearFull.toString().substring(2, 4);

        if (parseInt(custYear) > currentYear) {
            custYearFull = "19" + custYear;
        } else {
            custYearFull = "20" + custYear;
        }

        const dobConvertToDate = `${custYearFull}-${custMonth}-${custDay}`;
        const dobDate = moment(dobConvertToDate);
        const dateNow = moment(new Date());
        const age = dateNow.diff(dobDate, "years");

        if (age > 65 || age < 18) {
            return false;
        } else if (age >= 18) {
            return true;
        }
    } catch (e) {
        console.log("[DataModel][validateMyKadAge] >> Exception: ", e);
    }
};

export const calculateAge = (birthMonth, birthDay, birthYear) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        let calculatedAge = currentYear - birthYear;
        // if (calculateAge === 80 && currentMonth < birthMonth - 1) {
        //     calculatedAge--;
        // }
        if (calculatedAge === 80) {
            if (currentMonth > birthMonth - 1) {
                calculatedAge++;
            } else if (currentMonth === birthMonth - 1 && currentDay > birthDay) {
                calculatedAge++;
            } else {
                console.log("age is lessthan actual limit");
            }
        } else if (calculatedAge === 12) {
            if (currentMonth < birthMonth - 1) {
                calculatedAge--;
            } else if (currentMonth === birthMonth - 1 && currentDay < birthDay) {
                calculatedAge--;
            } else {
                console.log("age is greaterthan actual limit");
            }
        }
        return calculatedAge;
    } catch (e) {
        console.log("[DataModel][calculateAge] >> Exception: ", e);
    }
};

export const charRepeatRegex = (text) => {
    if (text) {
        let isValid = /(.)\1{7,}/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const charCapRegex = (text) => {
    if (text) {
        let isValid = /^[A-Z]/;
        return isValid.test(String(text));
    } else {
        return false;
    }
};

export const numericRegex = (text) => {
    let isValid = /^\d+$/;
    return isValid.test(String(text).toLowerCase());
};

export const alphaNumericRegex = (text) => {
    let isValid = /^[a-z\d\-_\s]+$/i;
    return isValid.test(String(text).toLowerCase());
};

export const alphaNumericCommaAmpersandRegex = (text) => {
    let isValid = /^[a-z\d,&\s]+$/i;
    return isValid.test(String(text).toLowerCase());
};

export const alphaNumericRegexExtra = (text) => {
    let isValid = /^[a-z0-9\d\-_()*,.\s]+$/i;
    return isValid.test(String(text).toLowerCase());
};

export const alphaNumericNoSpaceRegex = (text) => {
    let isValid = /^[a-z0-9]+$/i;
    return isValid.test(String(text).toLowerCase());
};

export const referenceRegex = (text) => {
    let isValid = /^[a-zA-Z0-9+-_.,\\()’:?/ ]+$/g;
    return isValid.test(String(text).toLowerCase());
};

export const paymentDetailsRegex = (text) => {
    let isValid = /^[a-zA-Z0-9+-_.,\\()’:?/ ]+$/g;
    return isValid.test(String(text).toLowerCase());
};

export const referenceRegexOtherBank = (text) => {
    let isValid = /^[a-zA-Z0-9+-_.,\\()’:?@/' ]+$/g;
    return isValid.test(String(text).toLowerCase());
};

export const referenceRegexBakong = (text) => {
    let isValid = /^[a-zA-Z0-9’:;@'`‘ ]+$/g;
    return isValid.test(String(text).toLowerCase());
};

export const paymentDetailsRegexOtherBank = (text) => {
    let isValid = /^[a-zA-Z0-9+-_.,\\()’:@?/' ]+$/g;
    return isValid.test(String(text).toLowerCase());
};

export const numberCardsRegex = (val) => {
    const regex = /^-?([0-9]\d*|(?=\.))(\.\d+)?$/;
    return regex.test(val);
};

export const decimalCardsRegex = (val) => {
    const regex = /^[1-9]\d*$/;
    return regex.test(val);
};

export const getbase64string = (image) => {
    ImgToBase64.getBase64String(image)
        .then((base64String) => {
            return base64String;
        })
        .catch((err) => {
            return err;
        });
};

export const maskAccount = (text) => {
    let acc = text.substring(0, 12);
    let mask = "**** **** " + acc.substring(8, 12);
    return mask;
};
export const maskCard = (text) => {
    let cha = text.substring(0, 1);
    if (cha === "3") {
        let acc = text.substring(0, 15);
        let mask = "*** **** **** " + acc.substring(11, 15);
        return mask;
    } else {
        let acc = text.substring(0, 16);
        let mask = "**** **** **** " + acc.substring(12, 16);
        return mask;
    }
};
export const maskDCard = (text) => {
    let acc = text.substring(0, 16);
    let mask = "**** **** **** " + acc.substring(12, 16);
    return mask;
};
export const maskTextNumber = (text) => {
    let acc = text.substring(0, 12);
    let mask = "*** *** " + acc.substring(6, 12);
    return mask;
};
export const getPreviousYear = (date) => {
    var currentDate = new Date();
    var pastYear = currentDate.getFullYear() - date;
    //currentDate.setFullYear(pastYear);
    return pastYear;
};

export const getNextYear = (date) => {
    var currentDate = new Date();
    var pastYear = currentDate.getFullYear() + date;
    currentDate.setFullYear(pastYear);
    return currentDate;
};
export const getNextMonths = (numOfMonth) => {
    var future = new Date();
    future = new Date(future.getFullYear(), future.getMonth() + numOfMonth, 1);
    return future;
};

export const getNextDates = (date) => {
    var future = new Date();
    future.setDate(future.getDate() + date);
    return future;
};

export const getNextYears = () => {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 90, month, day);
    console.log("year is", c);
    return c;
};

export const getPreviousYears = (yearscount) => {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year - yearscount, month, day);

    return c;
};

// Get feature Date From Specic Date

export const getNextEndDate = (startDate, date) => {
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + date);
    console.log("end date is", endDate);
    return endDate;
};
export const getParamsQuery = (query) => {
    switch (query) {
        case "profile":
            return ModelClass.QueryType.Type;
        case "registration":
            return ModelClass.QueryType.Type;

        default:
            return "";
    }
};
export const getFirstStringChar = (type) => {
    return type.charAt(0);
};

export const getDateNameFormat = (date) => {
    const today = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const toDate = today.toLocaleDateString("en-GB", options);
    return toDate.toString();
};

// get YYYY-MM-DD Format date

export const dateToStringinYearFormat = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
};

// get YYYY/MM/DD Format date
export const getformteddate = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("/");
};

export const getNextYearsData = (startYear, inCrement) => {
    var tempArray = [],
        i;
    var years_list = {
        year: "",
    };
    for (i = startYear; i < startYear + inCrement; i += 1) {
        (years_list.year = i), tempArray.push(years_list);
        years_list = {
            year: "",
        };
    }
    return tempArray;
};

// export const getNextMonthsData = () => {
//   var tempArray = [],
//     i;
//   var years_list = {
//     year: ""
//   };
//   for (i = 1; i < 1 + 31; i += 1) {
//     (years_list.year = i), tempArray.push(years_list);
//     years_list = {
//       year: ""
//     };
//   }
//   return tempArray;
// };
export const getNextMonthsData = (inCrement) => {
    var tempArray = [],
        i;
    var years_list = {
        year: "",
    };
    for (i = 1; i < 1 + inCrement; i += 1) {
        (years_list.year = i), tempArray.push(years_list);
        years_list = {
            year: "",
        };
    }
    return tempArray;
};

export const numberdaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};

export const getPreviousYearsData = (startYear, inCrement) => {
    var tempArray = [],
        i;
    var years_list = {
        year: "",
    };

    for (i = startYear; i > startYear - inCrement - 1; i--) {
        (years_list.year = i), tempArray.push(years_list);
        years_list = {
            year: "",
        };
    }

    return tempArray;
};
export const getAllMonths = () => {
    var tempArray = [
        { Name: "January", month: "1", Day: "1" },
        { Name: "February", month: "2", Day: "1" },
        { Name: "March", month: "3", Day: "1" },
        { Name: "April", month: "4", Day: "1" },
        { Name: "May", month: "5", Day: "1" },
        { Name: "June", month: "6", Day: "1" },
        { Name: "July", month: "7", Day: "1" },
        { Name: "August", month: "8", Day: "1" },
        { Name: "September", month: "9", Day: "1" },
        { Name: "October", month: "10", Day: "1" },
        { Name: "November", month: "11", Day: "1" },
        { Name: "December", month: "12", Day: "1" },
    ];
    return tempArray;
};

export const getGenders = () => {
    var tempArray = [
        { Name: "Male", Value: "M", id: "1" },
        { Name: "Female", Value: "F", id: "2" },
    ];
    return tempArray;
};

// Get Current Date in MMMM DD YYYY (Jan 29 2019) Format

export const getDateFormated = (date) => {
    var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year;
};

// Get Current Date in MMMM DD YYYY (Jan 29 2019) Format

export const getDateFormatmed = (date) => {
    const today = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return today.toLocaleDateString("en-GB", options);
};

// SSL related
export const validateSSLRecipientName = (name) => {
    const regex = /^.{2,40}$/;
    return regex.test(name);
};

export const validateSSLContactNo = (contactNo) => {
    const regex = /^.{7,12}$/;
    return regex.test(contactNo);
};

export const hasLettersNumbers = (text) => {
    const isValid = /(?=.*\d)(?=.*\D)/;
    return isValid.test(text);
};

export const passwordLengthCheck = (text) => {
    let isValid = /^[A-Za-z0-9]{6,20}$/;
    return isValid.test(text);
};

export const validateAddressWords = (text) => {
    const regex = new RegExp(INVALID_ADDRESSES.join("|"), "i");
    const isAvailable = regex.test(text); 
    if (isAvailable) {
        return {
            isValid: false,
            message: ENTER_VALID_ADD_MSG,
        }; 
    }
    // special word checks
    if (INVALID_ADDRESSES.indexOf(text.trim().toUpperCase()) > -1) {
        return {
            isValid: false,
            message: ENTER_VALID_ADD_MSG,
        };
    }
};

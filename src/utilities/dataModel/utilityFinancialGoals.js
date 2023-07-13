import { EDUCATION_GOAL, GROWTH_WEATH_GOAL, RETIREMENT_GOAL } from "@constants/strings";

export const getAgeByDob = (birthDate) => {
    if (!birthDate) return null;

    const getDobYear = birthDate.split(" ")?.[2];
    const currentDate = new Date();
    const currentYear = currentDate.toISOString().split("-")?.[0];
    return currentYear - getDobYear;
};

export const getGoalTitle = (goalType) => {
    switch (goalType) {
        case "R":
            return RETIREMENT_GOAL;
        case "E":
            return EDUCATION_GOAL;
        case "W":
            return GROWTH_WEATH_GOAL;
    }
};

export const numberWithCommas = (val) => {
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

export const mapRiskScore = (risk) => {
    switch (risk) {
        case "Conservative":
            return "1";
        case "Moderately Conservative":
            return "2";
        case "Balanced":
            return "3";
        case "Moderately Aggressive":
            return "4";
        case "Aggressive":
            return "5";
        default:
            return null;
    }
};

export const mapRiskScoreToText = (text) => {
    switch (text) {
        case "1":
            return "Conservative";
        case "2":
            return "Moderately Conservative";
        case "3":
            return "Balanced";
        case "4":
            return "Moderately Aggressive";
        case "5":
            return "Aggressive";
        default:
            return "";
    }
};

export const maskString = ({ text, startIndex, endIndex, maskCharacter = "*" }) => {
    return text.split("").map((char, index) => {
        if (index >= startIndex && index < endIndex) {
            return maskCharacter;
        } else {
            return char;
        }
    });
};

export const maskAddress = (text) => {
    if (!text) return;

    if (text.length > 8) {
        return maskString({ text, startIndex: 0, endIndex: text.length - 5, maskCharacter: "*" });
    } else {
        return maskString({ text, startIndex: 0, endIndex: text.length - 3, maskCharacter: "*" });
    }
};

export const maskMobileNo = (text) => {
    if (!text) return;

    return maskString({
        text,
        startIndex: text.length - 4,
        endIndex: text.length,
        maskCharacter: "*",
    });
};

export const maskEmail = (text) => {
    if (!text) return;

    const indexEmail = text.indexOf("@");

    // email before @ with 2 character
    if (indexEmail <= 2) {
        return maskString({
            text,
            startIndex: 1,
            endIndex: indexEmail,
            maskCharacter: "*",
        });
    } //email before @ with 3 character
    else if (indexEmail <= 3) {
        return maskString({
            text,
            startIndex: 1,
            endIndex: indexEmail,
            maskCharacter: "*",
        });
    } else {
        return maskString({
            text,
            startIndex: 2,
            endIndex: indexEmail,
            maskCharacter: "*",
        });
    }
};

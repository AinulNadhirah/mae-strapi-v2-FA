import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import { Platform } from "react-native";
import Config from "react-native-config";

import { postFitRequestWithData } from "@services";

import { CARDIMAGEURL_PROD, SIT_UAT_CARDIMAGEURL } from "@constants/url";

import * as ModelClass from "./modelClass";

export const storeFitData = async (fitData, fitType, dailyTarget) => {
    console.log("Fitness Data", fitData);
    let stepCount;
    let calCount;
    let distCount;
    let fitnessApp;
    stepCount = Number(fitData[fitData.length - 1].steps);
    calCount = Number(fitData[fitData.length - 1].calories).toFixed(2);
    distCount = Number(fitData[fitData.length - 1].distance).toFixed(2);
    console.log(" - - - - _____ =" + "step " + stepCount + "cal " + calCount + "dist " + distCount);

    if (fitType == "googleFit") {
        fitnessApp = "G";
    } else if (fitType == "fitBit") {
        fitnessApp = "F";
    } else if (fitType == "sHealth") {
        fitnessApp = "S";
    } else if (fitType == "appleHealth") {
        fitnessApp = "A";
    }

    let lastSyncTime = new Date();
    let userId = await AsyncStorage.getItem("mayaUserId");
    console.log("ee hai user -----   ------" + userId);
    let data = {
        accessToken: "UI token",
        deviceName: "string",
        fitUserid: "3XFG9",
        fitnessApp: fitnessApp,
        fitnessData: fitData,
        stepTarget: dailyTarget,
        syncDate: moment(lastSyncTime).format("YYYY-MM-DD HH:mm:ss"),
        userId: userId,
    };

    return postFitRequestWithData("/addFitnessData", JSON.stringify(data))
        .then(async (res) => {
            console.log("res - ", res);
            if (res) {
                try {
                    console.log("lastSyncTime.toString() Response is", new Date().toString());
                    await AsyncStorage.setItem("isFitSynced", JSON.stringify(true));
                    await AsyncStorage.setItem("fitnessType", JSON.stringify(fitType));
                    await AsyncStorage.setItem("stepsCount", JSON.stringify(stepCount));
                    await AsyncStorage.setItem("calCount", JSON.stringify(calCount));
                    await AsyncStorage.setItem("distCount", JSON.stringify(distCount));
                    await AsyncStorage.setItem("lastSyncTime", new Date().toString());
                    //console.log("lastSyncTime.toString() Response is", lastSyncTime.toString());
                    await AsyncStorage.setItem("lastSyncTime", new Date().toString());
                    const lastSyncTime = await AsyncStorage.getItem("lastSyncTime");
                    console.log("Last sync Data is", lastSyncTime);
                    console.log("dailyTarget Data is", dailyTarget);

                    if (dailyTarget) {
                        await AsyncStorage.setItem("stepTarget", JSON.stringify(dailyTarget));
                        await AsyncStorage.setItem("isFitReady", "true");
                        // await AsyncStorage.multiSet([
                        // 	["stepTarget", JSON.stringify(dailyTarget)],
                        // 	["isFitReady", "true"]
                        // ]);
                    }
                    return 200;
                } catch (error) {
                    console.log("error", error);
                    return 0;
                }
            }
        })
        .catch((err) => {
            console.log("err - ", err);
            return 0;
        });

    // const saveFitDataResponse = await postFitRequestWithData("/addFitnessData", JSON.stringify(data));

    // if (saveFitDataResponse.status == 200) {
    // 	try {
    // 		console.log("Sucess Response is", saveFitDataResponse);
    // 		console.log("lastSyncTime.toString() Response is", new Date().toString());
    // 		await AsyncStorage.setItem("isFitSynced", JSON.stringify(true));
    // 		await AsyncStorage.setItem("fitnessType", JSON.stringify(fitType));
    // 		await AsyncStorage.setItem("stepsCount", JSON.stringify(stepCount));
    // 		await AsyncStorage.setItem("calCount", JSON.stringify(calCount));
    // 		await AsyncStorage.setItem("distCount", JSON.stringify(distCount));
    // 		await AsyncStorage.setItem("lastSyncTime", new Date().toString());

    // 		console.log("lastSyncTime.toString() Response is", lastSyncTime.toString());

    // 		await AsyncStorage.setItem("lastSyncTime", new Date().toString());

    // 		// await AsyncStorage.multiSet([
    // 		// 	["isFitSynced", JSON.stringify(true)],
    // 		// 	["fitnessType", JSON.stringify(fitType)],
    // 		// 	["stepsCount", JSON.stringify(stepCount)],
    // 		// 	["calCount", JSON.stringify(calCount)],
    // 		// 	["distCount", JSON.stringify(distCount)],
    // 		// 	["lastSyncTime", lastSyncTime.toString()]
    // 		// ]);
    // 		const lastSyncTime = await AsyncStorage.getItem("lastSyncTime");
    // 		console.log("Last sync Data is", lastSyncTime);

    // 		if (dailyTarget) {
    // 			await AsyncStorage.multiSet([["stepTarget", JSON.stringify(dailyTarget)], ["isFitReady", "true"]]);
    // 		}
    // 		return 200;
    // 		console.log("yeeyyyyyyy");
    // 	} catch (error) {
    // 		return 0;
    // 		console.log(error);
    // 	}
    // } else {
    // 	return 0;
    // 	console.log("bhak bhud-bak -----------------------" + JSON.stringify(saveFitDataResponse));
    // }
};

export function getShortName(text) {
    if (!text) return "-";

    let givenName = text;
    const isnum = /^\d+$/.test(text);
    let participantName =
        givenName && givenName.indexOf("+") === -1 && givenName.indexOf("-") === -1 && !isnum
            ? givenName
            : "#";

    let shortName = participantName && participantName.indexOf("#") === -1 ? participantName : "#";
    let result = shortName
        ? shortName
              .toString()
              .trim()
              .split(" ")
              .reduce(
                  (acc, cur, idx, arr) =>
                      acc +
                      (arr.length > 1
                          ? idx == 0 || idx == arr.length - 1
                              ? cur.substring(0, 1)
                              : ""
                          : cur.substring(0, 2)),
                  ""
              )
              .toUpperCase()
        : "";
    return result;
}

export const digitToNumber = (num) => {
    let numberString;
    switch (num) {
        case 1:
            numberString = "one";
            break;
        case 2:
            numberString = "two";
            break;
        case 3:
            numberString = "three";
            break;
        case 4:
            numberString = "four";
            break;
        case 5:
            numberString = "five";
            break;
        case 6:
            numberString = "six";
            break;
        case 7:
            numberString = "seven";
            break;
        case 8:
            numberString = "eight";
            break;
        case 9:
            numberString = "nine";
            break;
        case 10:
            numberString = "ten";
            break;
        default:
            numberString = num;
    }
    return numberString;
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

export const maskCards = (text, cardType) => {
    if (cardType === "amex") {
        let acc = text.substring(1, 16);
        let mask = "*** **** **** " + acc.substring(11, 15);
        return mask;
    } else {
        let acc = text.substring(0, 16);
        let mask = "**** **** **** " + acc.substring(12, 16);
        return mask;
    }
};

export const getCardNoLength = (cardNo) => {
    let cha = cardNo.substring(0, 1);
    if (cha === "3") {
        return 15;
    } else {
        return 16;
    }
};

export function formateAccountNumber(accText, length) {
    let result = 0.0;
    result =
        accText != undefined
            ? accText
                  .toString()
                  .substring(0, length)
                  .replace(/[^\dA-Z]/g, "")
                  .replace(/(.{4})/g, "$1 ")
                  .trim()
            : 0.0;
    return result;
}

export function formateAmount(text) {
    let result = text
        .substring(0, this.state.accountNumberLength)
        .replace(/[^\dA-Z]/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    return result;
}

export function formateCardNo(value) {
    return value
        .toString()
        .substring(0, value.length)
        .replace(/[^0-9]/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

export function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    return x;
}

export function floatWithCommas(x) {
    console.log("IN " + x);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    console.log("OUT " + parts.join("."));
    return parts.join(".");
}

export function removeSpecialChar(str) {
    str = str.replace(/[^0-9 a-z A-Z]/g, "");
    return str;
}

export function addSlashesForBreakableSpecialCharacter(str) {
    let escapeSpecial = str.replace(/\\/g, "\\\\");
    return escapeSpecial.replace(/"/g, '\\"');
}

export function addDecimals(x) {
    x = x.toString();
    let parts = x.split(".");
    if (parts.length === 1) {
        x = x + ".00";
    }

    return x;
}

export function formateAmountZeroComma(tempAmount) {
    let resStr = "";
    if (tempAmount.length === 1) {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "0.0" +
            tempAmount.toString().substring(tempAmount.length - 2);
    } else if (tempAmount.length < 3) {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "0." +
            tempAmount.toString().substring(tempAmount.length - 2);
    } else {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "." +
            tempAmount.toString().substring(tempAmount.length - 2);
    }

    resStr = numberWithCommas(resStr);
    return resStr;
}

export function formateAmountZero(tempAmount) {
    // reset format
    // tempAmount = tempAmount.replace(".", "");
    let resStr = "";
    if (tempAmount.length === 1) {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "0.0" +
            tempAmount.toString().substring(tempAmount.length - 2);
    } else if (tempAmount.length < 3) {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "0." +
            tempAmount.toString().substring(tempAmount.length - 2);
    } else {
        resStr =
            tempAmount.toString().substring(0, tempAmount.length - 2) +
            "." +
            tempAmount.toString().substring(tempAmount.length - 2);
    }
    return resStr;
}

// type 1 = get first character of first two word
// type 2 = get first character of first two word or if only 1 word, get first 2 character of first word
export function getShortNameTransfer(text, type = 1) {
    if (!text) return "-";
    let result = text
        .split(/\s/)
        .reduce((response, word, index, array) => {
            if (array.length == 1 && type == 2) {
                return word;
            } else {
                return (response += word.slice(0, 1));
            }
        }, "")
        .toUpperCase()
        .substring(0, 2);
    return result;
}

export function getOSBasedSMSBodyDivider() {
    return Platform.OS === "ios" ? "&" : "?";
}

export function getVersionBasedSMSUri() {
    return Platform.Version >= 27 ? "sms://" : "sms:";
}

export function getFormatedAccountNumber(text) {
    let result = text
        ? text
              .substring(0, 12)
              .replace(/[^\dA-Z]/g, "")
              .replace(/(.{4})/g, "$1 ")
              .trim()
        : "";
    return result;
}

export function getFormatedCardNumber(text) {
    let cha = text.substring(0, 1);
    if (cha === "3") {
        let first = text.substring(0, 3);
        let result = text
            .substring(3, 15)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        return first + " " + result;
    } else {
        let result = text
            .substring(0, 16)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        return result;
    }
}

export function getCardNumber(text) {
    const cha = text.substring(0, 1);
    return cha === "3" ? text.substring(0, 15).trim() : text.substring(0, 16).trim();
}

export function phoneNumberMask(mobileNo) {
    let part = mobileNo;
    let n = part.length;
    let f = part.substring(0, 3);
    let l = part.substring(n - 3, n);
    let mask = f;
    for (let i = 0; i < n - 6; i++) {
        mask += "*";
    }
    mask += l;
    return mask;
}

export function phoneNumberMaskNew(mobileNo) {
    let part = mobileNo ? mobileNo : "";
    let n = part.length;
    let f = part.substring(0, 4);
    let l = part.substring(n - 3, n);

    let mask = `${f} `;
    for (let i = 0; i < n - 7; i++) {
        mask += "*";
    }
    mask += ` ${l}`;
    return mask;
}

export function formateReferenceNumber(referenceNumber) {
    return referenceNumber
        ? referenceNumber.toString().substr(referenceNumber.length - 10)
        : referenceNumber;
}

export function updateProfileNumberMask(mobileNo) {
    let part = mobileNo;
    let n = part.length;
    let f = part.substring(0, 4);
    let l = part.substring(n, n);
    let mask = f;
    for (let i = 0; i < n; i++) {
        mask += "*";
    }
    mask += l;
    return mask;
}

export function maskFirstPart(text) {
    let part = text;
    let n = part.length;
    let l = part.substring(n - 4, n);
    let mask = "";
    for (let i = 0; i < n - 4; i++) {
        mask += "*";
    }
    mask += l;
    return mask;
}

export function toFixed(num, fixed) {
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return Math.floor(num * fixed) / fixed;
}

export const getHighlightedText = (textString) => {
    console.log("getHighlightedText - ", textString);
    // let arr = ["work\\?"];
    let arr = [];
    let splitstring = textString.split("<b>");
    if (splitstring.length > 1) {
        for (let j = 0; j < splitstring.length; j++) {
            if (splitstring[j].includes("</b>")) {
                let boldword = splitstring[j].split("</b>");
                if (boldword && boldword.length > 0) {
                    //boldword[0] = boldword[0].replace(/\?/g, '//?');
                    arr.push(boldword[0]);
                }
            }
        }
    }
    console.log(arr);
    return arr;
};

export const checkifUrlImage = (imageString) => {
    if (imageString != null) {
        let firstFour = imageString.substring(0, 4);
        if (firstFour == "http") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const maskAccount = (text) => {
    //console.log("Account : " +text, type)
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

export const maskAccountNumber = (text) => {
    let acc = text.substring(0, 12);
    let mask = "**** **** " + acc.substring(8, 12);
    return mask;
};
export const maskOrderNumber = (text) => {
    return text
        .split("")
        .map(function (char, index) {
            if (index <= 1) {
                return char;
            } else {
                return "X";
            }
        })
        .join("");
};

export const maskIdValue = (value) => {
    if (value.length <= 4) {
        return value;
    } else {
        const number = value.replace(/[^a-zA-Z0-9]/g, "");
        const masked =
            number.substring(0, number.length - 4).replace(/[a-z\d]/gi, "*") +
            number.substring(number.length - 4, number.length);
        return masked;
    }
};

export const getAnswerSliderStyle = (length) => {
    switch (length) {
        case 1:
            return {
                marginTop: 50,
                backgroundColor: "transparent",
                marginLeft: 35,
                marginRight: 35,
                height: "40%",
            };
        case 2:
            return {
                marginTop: 20,
                backgroundColor: "transparent",
                marginLeft: 35,
                marginRight: 35,
                height: "65%",
            };
        case 3:
            return {
                marginTop: 10,
                backgroundColor: "transparent",
                marginLeft: 35,
                marginRight: 35,
                height: "70%",
            };
        default:
            return "";
    }
};

export const resetMAECustomerDetails = () => {
    var keys = Object.keys(ModelClass.MAE_CUSTOMER_DETAILS ? ModelClass.MAE_CUSTOMER_DETAILS : {});
    if (keys && keys instanceof Array && keys.length) {
        keys.forEach((keyName) => {
            ModelClass.MAE_CUSTOMER_DETAILS[keyName] = "";
        });
    }
};

export const formatAccNumberTo16Digits = (accNo) => {
    if (accNo.length <= 16) return accNo;
    else return accNo.slice(0, 16);
};

export const removeWhiteSpaces = (message) => {
    return message.toString().replace(/\s/g, "");
};

export const getCreditCardImageURL = (cardImage) => {
    let cardImageUrl = cardImage;
    try {
        if (cardImageUrl) {
            const newCardImageUrl = cardImageUrl?.replace(/\\/gi, "/") || "";

            if (cardImageUrl?.includes("https")) {
                console.log(cardImageUrl);
            } else if (newCardImageUrl !== "") {
                if (Config.ENV_FLAG === "UAT" || Config.ENV_FLAG === "SIT") {
                    cardImageUrl = `${SIT_UAT_CARDIMAGEURL}${newCardImageUrl}`;
                } else cardImageUrl = `${CARDIMAGEURL_PROD}${newCardImageUrl}`;
            } else {
                cardImageUrl = "";
            }
            return cardImageUrl;
        }
    } catch {
        cardImageUrl = "";
    }
    return cardImageUrl;
};

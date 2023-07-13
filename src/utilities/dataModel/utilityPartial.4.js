import AsyncStorage from "@react-native-community/async-storage";
import crashlytics from "@react-native-firebase/crashlytics";
import { parseInt } from "lodash";
import moment from "moment";
import { Alert, Dimensions, Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import DeviceInfo from "react-native-device-info";
import call from "react-native-phone-call";

import { setUserId } from "@services/analytics";
import { clearAll } from "@services/localStorage";

import { GOOGLE_ANALYTICS } from "@constants/data";
import { SERVER_DATE_FORMAT } from "@constants/strings";

import assets from "@assets";

import * as ModelClass from "./modelClass";
import { getDeviceRSAInformation, isEmpty } from "./utilityPartial.2";
import {
    getCustomerKey,
    getDigitalId,
    removeSecureStorage,
    setDigitalId,
} from "./utilitySecureStorage";

// Utility method to reset all values to empty for a ModelClass object
export const resetModelClassObject = (objName) => {
    try {
        if (!isEmpty(objName) && Object.prototype.hasOwnProperty.call(ModelClass, objName)) {
            var keys = Object.keys(ModelClass[objName]);
            if (keys && keys instanceof Array && keys.length) {
                keys.forEach((keyName) => {
                    ModelClass[objName][keyName] = "";
                });
            }
        }
    } catch (e) {
        console.log("[Utility][resetModelClassObject] >> Exception: ", e);
    }
};

export const accountNumSeparator = (accNo) => {
    if (accNo) {
        // var tempAccSep = '';
        // tempAccSep = accNo.substr(0, 4) + "  " + accNo.substr(4, 4) + "  " + accNo.substr(8);
        return accNo.match(/.{1,4}/g).join(" ");
    } else {
        return accNo;
    }
};

export const debitCardNumSeperator = (cardNo) => {
    if (cardNo) {
        return cardNo.match(/.{1,4}/g).join("  ");
    } else {
        return cardNo;
    }
};

export const contactBankcall = (number) => {
    if (Platform.OS == "ios") {
        // Linking.openURL(`tel:${number}`);
        const args = {
            number: number,
            prompt: true,
        };
        call(args).catch(console.error);
    } else {
        Alert.alert(number, "", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Call",
                onPress: () => {
                    const args = {
                        number: number,
                        prompt: false,
                    };
                    call(args).catch(console.error);
                },
            },
        ]);
    }
};

export const formatMobileNumber = (number) => {
    if (number) {
        const mobileNo = number
            .toString()
            .replace(/(\d{1,4})?(\d{1,4})?(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3, p4) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                if (p4) output += ` ${p4}`;
                return output;
            });
        return mobileNo;
    }
    return;
};

export const formatReloadMobileNumber = (number) => {
    if (number) {
        const mobileNo = number
            .toString()
            .replace(/(\d{1,3})?(\d{1,4})?(\d{1,3})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
        return mobileNo;
    }
    return;
};

export const convertMayaMobileFormat = (mobileNo) => {
    // Empty check
    if (!mobileNo) return "";

    // Return same if it is already in expected format
    if (mobileNo.indexOf("60") == 0) return mobileNo;

    if (mobileNo.indexOf("+60") == 0) return mobileNo.replace("+60", "60");

    if (mobileNo.indexOf("01") == 0) return mobileNo.replace("01", "601");

    if (mobileNo.indexOf("1") == 0) return mobileNo.replace("1", "601");

    // By default, return the same number
    return mobileNo;
};

export const convertMAEMobileFormat = (mobileNo) => {
    // Empty check
    if (!mobileNo) return "";

    if (mobileNo.indexOf("60") == 0) return mobileNo.replace("60", "0");

    if (mobileNo.indexOf("+60") == 0) return mobileNo.replace("+60", "0");

    // By default, return the same number
    return mobileNo;
};

export const getPosition = (string, subString, index) => {
    return string && subString ? string.split(subString, index).join(subString).length : 0;
};

export const setCharAt = (string, subString, index) => {
    let text;
    if (index > string.length - 1) {
        console.log("setCharAt 1 : ");
        text = string;
    } else {
        console.log("setCharAt 2 : ", index);
        if (string && subString) {
            const first = string.substr(0, index);
            const second = string.substr(index + 1);

            console.log("first : ", first);
            console.log("second : ", second);
            text = `${first}${subString}${second}`;

            console.log("text : ", text);
        } else {
            text = string;
        }
    }
    return text;
};

export const formateIDName = (name, replace) => {
    let text = name
        ? name
              .toString()
              .trim()
              .replace(/(?:\r\n|\r|\n)/g, " ")
              .replace(/\s\s+/g, " ")
              .replace(/  +/g, " ")
        : "";
    console.log("name : ", name);
    if (text && text.length > 17) {
        const matchArray = text.match(new RegExp(replace, "g")) || [];
        const match = matchArray.length;
        console.log("matchArray : ", matchArray);
        console.log("match : ", match);
        if (match === 1) {
            console.log("match : ", match);
            const position1 = getPosition(text, replace, 1);
            console.log("proxyTypeText position : ", position1);

            if (position1 > 1) {
                text = setCharAt(text, "\n", position1);
                console.log("proxyTypeText text : ", text);
            }
        } else {
            for (var i = 2; i <= match; i += 1) {
                console.log("proxyTypeText i : ", i);
                let position = getPosition(text, replace, i);
                console.log("proxyTypeText position : ", position);

                if (position > 1) {
                    text = setCharAt(text, "\n", position);
                    console.log("proxyTypeText text : ", text);
                }
            }
        }
        console.log("name : ", text);
    }
    return text;
};

export const cleanTextParams = (value) => {
    let text = value
        ? value
              .toString()
              .trim()
              .replace(/(?:\r\n|\r|\n)/g, " ")
              .replace("\n", " ")
              // eslint-disable-next-line no-control-regex
              .replace(new RegExp("\n", "g"), " ")
              // eslint-disable-next-line no-control-regex
              .replace(new RegExp("\r?\n", "g"), " ")
              .replace(/\s\s+/g, " ")
              .replace(/  +/g, " ")
        : value;
    return text;
};

// TODO: need to refactor this code. Taken from old code in some module and add it here
export const getAccountExtraInfo = (accountItem) => {
    const type = accountItem.type;
    const code = accountItem.code;
    let image = "Maybank.png";
    let accountType;
    let cardType;

    if (type === "D") {
        // MAE account && Special Account
        if (code === "0Y" || code === "CC") {
            // MAE account
            image = assets.icMAE;
            accountType = "mae";
        } else if (type === "D") {
            //TODO need to get the Special Account details and upload later
            // Special Account
            image = assets.icMaybankAccount;
            accountType = "mae";
        }
    } else if (type === "C" || type === "J" || type === "R") {
        // Cards
        if (
            code === "3G" ||
            code === "3O" ||
            code === "38" ||
            code === "4J" ||
            code === "4P" ||
            code === "3N" ||
            code === "3B" ||
            code === "4L" ||
            code === "31" ||
            code === "3M" ||
            code === "33" ||
            code === "3A" ||
            code === "4D" ||
            code === "4I" ||
            code === "36" ||
            code === "4B" ||
            code === "3X" ||
            code === "4O" ||
            code === "3C" ||
            code === "4G"
        ) {
            //Visa Logo
            cardType = "visa";
            image = assets.icVisa;
        } else if (
            code === "3R" ||
            code === "3T" ||
            code === "32" ||
            code === "3Q" ||
            code === "39" ||
            code === "4E" ||
            code === "4F" ||
            code === "3H" ||
            code === "4H"
        ) {
            //MasterCard Logo
            cardType = "master";
            image = assets.icMasterCard;
        } else if (
            code === "34" ||
            code === "3J" ||
            code === "3D" ||
            code === "4K" ||
            code === "3K" ||
            code === "3Ed" ||
            code === "4A" ||
            code === "3L" ||
            code === "3U" ||
            code === "3I" ||
            code === "3F" ||
            code === "3V" ||
            code === "3E" ||
            code === "D2" ||
            code === "D6" ||
            code === "D4" ||
            code === "D3" ||
            code === "D5" ||
            code === "D1" ||
            code === "4M" ||
            code === "4N" ||
            code === "4C"
        ) {
            //Amex Logo
            cardType = "amex";
            image = assets.icAmex;
        } else {
            image = assets.icMaybankAccount;
        }
        accountType = "card";
    } else if (type === "L" || type === "H" || type === "N") {
        // Loan Account
        image = assets.icMaybankAccount;
        accountType = "loan";
    } else {
        // default All Other maybank Account Maybank.png
        image = assets.icMaybankAccount;
        accountType = "casa";
    }

    return { image, accountType, cardType };
};

export const checkNumber = (val) => {
    try {
        val = val.replace(/\s/g, "");
        val = val.replace(/[{()}]/g, "");
        val = val.replace(/[[\]']+/g, "");
        val = val.replace(/-/g, "");
        val = val.replace(/\*/g, "");
        val = val.replace(/#/g, "");
        val = val.replace(/\D/g, "");
    } catch (e) {
        console.log(e);
    }
    let first = val.substring(0, 1);
    let value = "";
    if (first === "+") {
        value = val.substring(1, val.length);
    } else {
        value = val;
    }
    return value;
};

export const formatICNumber = (val) => {
    val = checkNumber(val);
    const first = val.toString().substring(0, 6);
    const second = val.toString().substring(6, 8);
    const third = val.toString().substring(8, val.length);
    return `${first} ${second} ${third}`.trim();
};

export const formatMobileNumbers = (val) => {
    const val1 = checkNumber(val);
    const startVal = 3;
    const first = val1.toString().substring(0, startVal);
    const second = val1
        .toString()
        .substring(startVal, val1.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return `${first} ${second}`.trim();
};

export const formatMobileNumbersList = (val) => {
    const val1 = checkNumber(val);
    const startVal =
        val1 && val1.toString().length >= 2 && val1.toString().substring(0, 2) === "60" ? 4 : 3;
    const first = val1.toString().substring(0, startVal);
    const second = val1
        .toString()
        .substring(startVal, val1.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return `${first} ${second}`.trim();
};

export const formatMobileNumbersRequest = (val) => {
    val = checkNumber(val);
    let stringFirstPart = val.toString().substring(0, 4);
    stringFirstPart =
        stringFirstPart && stringFirstPart.indexOf("+") === -1
            ? `+${stringFirstPart}`
            : stringFirstPart;
    const stringSecondPart = val.toString().substring(4, 8);
    const stringThirdPart = val.toString().substring(8, val.length);
    return `${stringFirstPart} ${stringSecondPart} ${stringThirdPart}`.trim();
};

export const addDaysToDate = (date = new Date(), days = 0) => {
    let result = moment(date);
    result = result.add(days, "days");
    return result.toDate();
};

export const trimOuterInnerExtraSpaces = (string = "") => {
    return string.trim().replace(/\s\s+/g, " ");
};

export function lastFourDigitMask(input) {
    const len = input.length;
    return `${input.substring(0, len - 4)}XXXX`;
}

export const formatOverseasMobileNumber = (number) => {
    if (number) {
        let sign = "";
        let tempNumber = number;
        if (number.trim().charAt(0) == "+") {
            sign = "+";
            tempNumber = number.substring(1);
        }
        const mobileNo = tempNumber
            .toString()
            .replace(/\s/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        return `${sign}${mobileNo}`;
    }
    return null;
};

export const getInitItem = async (keyName) => {
    try {
        const retrievedItem = await AsyncStorage.getItem(keyName);
        const item = retrievedItem ? JSON.parse(retrievedItem) : "";
        return item;
    } catch (error) {
        console.log(error);
    }
    return;
};

export const removeInitCache = async () => {
    await AsyncStorage.setItem("initCache", "false");
};

export const clearStorage = async (resetModel, updateModel) => {
    resetModel(null, ["device", "appSession"]);

    await removeLocalStorage();

    updateModel({
        ui: {
            secureStorageFailedPopup: true,
        },
    });
    return;
};

export const getDigitalIdentityByType = async (type, getModel) => {
    const digitalId = await getDigitalId(getModel);
    if (digitalId) {
        const digitalIdentity = JSON.parse(digitalId);
        return digitalIdentity?.find((obj) => obj.idType === type).idValue;
    }
    return "";
};

export const setFirebaseAnalyticsId = async (getModel) => {
    const gaId = await getDigitalIdentityByType(GOOGLE_ANALYTICS, getModel);
    if (gaId) {
        await setUserId(gaId);
    }
};

export const setCrashlyticsAttributes = async (getModel) => {
    try {
        const { deviceInformation, deviceId } = getModel("device");
        const { osId, hardwareID } = getDeviceRSAInformation(
            deviceInformation,
            DeviceInfo,
            deviceId
        );
        const gaId = await getDigitalIdentityByType(GOOGLE_ANALYTICS, getModel);
        if (gaId) await crashlytics().setUserId(gaId);
        await crashlytics().setAttributes({
            osId,
            hardwareID,
        });
    } catch (error) {
        console.log(`crashlytics attributes: ${error?.toString()}`);
        return error;
    }
};

export const saveAndSetDigitalIdentity = async (serverDate, digitalIdentity, getModel) => {
    await saveServerDate(serverDate);
    if (digitalIdentity && serverDate) {
        await setDigitalId(digitalIdentity);
        await setFirebaseAnalyticsId(getModel);
        await setIsAnalyticsExpired(false);
    }
};

export const getCloudToken = async () => {
    return AsyncStorage.getItem("MbbCloudToken");
};

export const saveCloudToken = async (cloudToken) => {
    if (cloudToken) {
        await AsyncStorage.setItem("MbbCloudToken", cloudToken);
    }
};

export const setCloudTokenRequired = async (params) => {
    const cloudToken = await getCloudToken();
    if (!cloudToken) {
        params.cloudTokenRequired = true;
    }
};

export const saveServerDate = async (serverDate) => {
    if (serverDate) {
        await AsyncStorage.setItem("serverDate", serverDate);
    }
};

export const getServerDate = () => {
    return AsyncStorage.getItem("serverDate");
};

export const checkAnalyticsExpired = async (serverDate, analyticsExpiry, getModel) => {
    const digitalId = await getDigitalId(getModel);
    let isAnalyticsExpired;

    if (digitalId) {
        const initServerDate = await getServerDate();
        const currentDate = moment(serverDate, SERVER_DATE_FORMAT);
        const endDate = moment(initServerDate, SERVER_DATE_FORMAT);
        isAnalyticsExpired =
            moment.duration(endDate.diff(currentDate)).asDays() > parseInt(analyticsExpiry);
    } else {
        isAnalyticsExpired = true;
    }

    await setIsAnalyticsExpired(isAnalyticsExpired);
};

export const setIsAnalyticsExpired = async (isAnalyticsExpired) => {
    await AsyncStorage.setItem("isAnalyticsExpired", JSON.stringify(isAnalyticsExpired));
};

export const getIsAnalyticsExpired = async () => {
    const isAnalyticsExpired = await AsyncStorage.getItem("isAnalyticsExpired");
    return JSON.parse(isAnalyticsExpired) || isAnalyticsExpired === null;
};

export const removeLocalStorage = async () => {
    await clearAll();
    await removeSecureStorage();
};

export const getHalfCustomerKey = async (getModel) => {
    try {
        let key = await getCustomerKey(getModel, true);
        const k = key ? (key.length % 2 === 0 ? key.length / 2 : key.length / 2 - 1) : 0;
        key = key.substring(0, k);
        return key || "";
    } catch (error) {
        return "";
    }
};

export const goToAppSetting = () => {
    if (Platform.OS === "ios") {
        Linking.canOpenURL("app-settings:")
            .then((supported) => {
                if (!supported) {
                    console.log("Can't handle settings url");
                } else {
                    return Linking.openURL("app-settings:");
                }
            })
            .catch((err) => console.error("An error occurred", err));
        return;
    }
    AndroidOpenSettings.appDetailsSettings();
};

export const saveAppEnv = (appEnv) => {
    AsyncStorage.setItem("appEnv", appEnv);
};

export const formatMobileNumbersNew = (val) => {
    const val1 = checkNumber(val);
    const startVal = val.charAt(0) === "6" ? 4 : 2;
    const first = val1.toString().substring(0, startVal);
    const second = val1
        .toString()
        .substring(startVal, val1.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return `${first} ${second}`.trim();
};

export function formateRefnumber(referenceNumber, start) {
    return referenceNumber
        ? referenceNumber?.substr(start ?? 10, referenceNumber.length)
        : referenceNumber;
}

export function formateReqIdNumber(referenceNumber) {
    return referenceNumber
        ? referenceNumber.toString().substr(referenceNumber.length - 14)
        : referenceNumber;
}

export const isIPhoneSmall = () => {
    const { width } = Dimensions.get("window");
    const X_WIDTH = 375;
    return Platform.OS === "ios" && width <= X_WIDTH;
};

import AsyncStorage from "@react-native-community/async-storage";

import * as navigationConstant from "@navigation/navigationConstant";

import {
    BOOSTERS_INITIAL_TABANG_DATA,
    BOOSTERS_SECOND_TABANG_DATA,
    BOOSTERS_THIRD_TABANG_DATA,
} from "@constants/data";
import * as Strings from "@constants/strings";

import assets from "@assets";

export const getGoalDetailText = (goal) => {
    switch (goal) {
        case "Travel":
            return Strings.WHERE_WOULD_YOU_LIKE_TO_GO;
        case "Rainy Day":
            return Strings.RAINYDAY_DETAIL_TEXT;
        case "Shopping":
            return Strings.SHOPING_DETAIL_TEXT;
        case "Coin Jar":
            return Strings.COINJAR_DETAIL_TEXT;
        case "Others":
            return Strings.OTHER_DETAIL_TEXT;
        default:
            return "";
    }
};

export const getInitialBoosternameText = (name) => {
    switch (name) {
        case "Spare \nChange":
            return BOOSTERS_INITIAL_TABANG_DATA[0];
        case "Get Fit \nor Get Fat":
            return BOOSTERS_INITIAL_TABANG_DATA[1];
        case "QR Pay \nSavers":
            return BOOSTERS_INITIAL_TABANG_DATA[2];
        case "Guilty \nPleasure":
            return BOOSTERS_INITIAL_TABANG_DATA[3];
        default:
            return "";
    }
};
export const getBoosterType = (name) => {
    switch (name) {
        case "Spare \nChange":
            return "S";
        case "Get Fit \nor Get Fat":
            return "F";
        case "QR Pay \nSavers":
            return "Q";
        case "Guilty \nPleasure":
            return "G";
        default:
            return "";
    }
};

export const getInitialBoosterNavigation = (name) => {
    switch (name) {
        case "Spare \nChange":
            return navigationConstant.BOOSTER_SPARE_CHANGE;
        case "Get Fit \nor Get Fat":
            return navigationConstant.FIT_BOOSTER_SETUP;
        case "QR Pay \nSavers":
            return navigationConstant.QRPAY_SAVER_SETUP;
        case "Guilty \nPleasure":
            return navigationConstant.GUILTY_PLEASURE_SETUP;
        default:
            return "";
    }
};
export const getBoosterDeactivatioNavigation = (name) => {
    switch (name) {
        case "Spare \nChange":
            return navigationConstant.SPARE_CHANGE_BOOSTER_DEACTIVATE;
        case "Get Fit \nor Get Fat":
            return navigationConstant.GETFIT_BOOSTER_DEACTIVATE;
        case "QR Pay \nSavers":
            return navigationConstant.QRPAY_BOOSTER_DEACTIVATE;
        case "Guilty \nPleasure":
            return navigationConstant.GUILTY_PLEASURE_BOOSTER_DEACTIVATE;
        default:
            return "";
    }
};

export const editFitBooster = (name) => {
    switch (name) {
        case "EditSteps":
            return navigationConstant.FIT_BOOSTER_STEPS_SETUP;
        case "EditAmount":
            return navigationConstant.FIT_BOOSTER_AMOUNT_SETUP;
        case "EditBooster":
            return navigationConstant.GETFIT_BOOSTER_DEACTIVATE;
        case "Amount":
            return navigationConstant.FIT_BOOSTER_AMOUNT_SETUP;
        default:
            return navigationConstant.FIT_BOOSTER_AMOUNT_SETUP;
    }
};

export const getImageForCategory = (name) => {
    switch (name) {
        case "Food & Beverage":
            return require("@assets/icons/Food.png");
        case "Arts & Entertainment":
            return require("@assets/icons/Arts.png");
        case "Travel":
            return require("@assets/icons/Travel.png");
        case "Electronics":
            return require("@assets/icons/Electronics.png");
        case "Health & Beauty":
            return require("@assets/icons/Health.png");
        case "Shopping":
            return require("@assets/icons/Shopping.png");
        case "Sports & Recreation":
            return require("@assets/icons/Sports.png");
        case "Add Another Category":
            return require("@assets/icons/AddCategory.png");
        default:
            return "";
    }
};

export function withTimeout(msecs, promise) {
    const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error("timeout"));
        }, msecs);
    });
    return Promise.race([timeout, promise]);
}

export const categorydataExists = (categoryName, arr, newlimit, newAmout) => {
    console.log("utility newAmout is", newAmout);

    for (var index in arr) {
        // don't actually do this
        // console.log('index is', index);

        if (arr[index].name === categoryName) {
            console.log("inside el is", arr[index].name);

            arr[index].amount = newAmout;
            arr[index].limitAmount = newlimit;
            arr[index].description =
                Strings.CATEGORY_START_TEXT +
                " RM " +
                newlimit +
                " " +
                Strings.CATEGORY_START_TEXT_DETAIL +
                " RM " +
                newAmout;
        } else {
            console.log("outside el is", arr[index].name);
        }
    }
    return arr;
};

export const dataExists = (categoryName, arr) => {
    return arr.some(function (el) {
        return el.name === categoryName;
    });
};
export const addcategorydataExists = (categoryName, arr) => {
    return arr.some(function (el) {
        return el.description === categoryName;
    });
};

export const getSecondBoosternameText = (name) => {
    switch (name) {
        case "Spare \nChange":
            return BOOSTERS_SECOND_TABANG_DATA[0];
        case "Get Fit \nor Get Fat":
            return BOOSTERS_SECOND_TABANG_DATA[1];
        case "QR Pay \nSavers":
            return BOOSTERS_SECOND_TABANG_DATA[2];
        case "Guilty \nPleasure":
            return BOOSTERS_SECOND_TABANG_DATA[3];
        default:
            return name;
    }
};

export const getcategorygId = (text) => {
    switch (text) {
        case "Food & Beverage":
            return "1";
        case "Arts & Entertainment":
            return "2";
        case "Travel":
            return "3";
        case "Electronics":
            return "4";
        case "Health & Beauty":
            return "5";
        case "Shopping":
            return "6";
        case "Sports & Recreation":
            return "7";

        default:
            return navigationConstant.FIT_BOOSTER_AMOUNT_SETUP;
    }
};

export const getThirdBoosternameText = (name) => {
    switch (name) {
        case "Spare \nChange":
            return BOOSTERS_THIRD_TABANG_DATA[0];
        case "Get Fit \nor Get Fat":
            return BOOSTERS_THIRD_TABANG_DATA[1];
        case "QR Pay \nSavers":
            return BOOSTERS_THIRD_TABANG_DATA[2];
        case "Guilty \nPleasure":
            return BOOSTERS_THIRD_TABANG_DATA[3];
        default:
            return name;
    }
};

export const getThirdBoosterRoundupValue = (value) => {
    switch (value) {
        case "RM 1.00":
            return "ROUND_UP_ONE";
        case "RM 5.00":
            return "ROUND_UP_TWO";
        case "RM 10.00":
            return "ROUND_UP_THREE";
        default:
            return "";
    }
    // return value
};

export const getAmountRoundupValue = (value) => {
    switch (value) {
        case "ROUND_UP_ONE":
            return "1.00";
        case "ROUND_UP_TWO":
            return "5.00";
        case "ROUND_UP_THREE":
            return "10.00";
        default:
            return "";
    }
    // return value
};

export const getCoinJarValue = (value) => {
    switch (value) {
        case "Day":
            return "D";
        case "Weekly":
            return "W";
        case "Month":
            return "M";
        default:
            return "";
    }
    // return value
};

export const getGoalPlaceHolder = (goal) => {
    switch (goal) {
        case "Travel":
            return "e.g. Paris";
        case "Rainy Day":
            return "e.g. Emergency";
        case "Shopping":
            return "e.g. New Phone";
        case "Coin Jar":
            return "";
        case "Others":
            return "e.g. New Car";
        default:
            return goal;
    }
};

export const setAsyncData = (keyname, value) => {
    if (value !== null && value !== "") {
        // do something
        AsyncStorage.setItem(keyname, value);
    } else {
        AsyncStorage.setItem(keyname, "");
    }
};

export const setTabungUserData = (savedData) => {
    try {
        AsyncStorage.setItem("IsTabung", savedData);
    } catch (error) {
        // Error retrieving data
        console.log(error.message);
    }
};

export const setISReadData = (savedData) => {
    try {
        AsyncStorage.setItem("isDateReaded", savedData);
    } catch (error) {
        // Error retrieving data
        console.log(error.message);
    }
};

export const getTabungItem = async (keyName) => {
    try {
        const retrievedItem = await AsyncStorage.getItem(keyName);
        const item = JSON.parse(retrievedItem);
        return item;
    } catch (error) {
        console.log(error.message);
    }
    return;
};

export const setTabungData = (keyName, value) => {
    try {
        var jsonOfItem = AsyncStorage.setItem(keyName, JSON.stringify(value));
        console.log(jsonOfItem);
        return jsonOfItem;
    } catch (error) {
        console.log(error.message);
    }
};

export const deleteTabungData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (exception) {
        return false;
    }
};

export const commaAdder = (number) => {
    if (number || number == 0) {
        number = number.toString();
        let parts = number.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const newNum = parts.join(".");
        return newNum.toString();
    } else {
        return "";
    }
};

export const commaAndDecimalAdder = (number) => {
    return commaAdder(parseFloat(number).toFixed(2));
};

export const getCardProviderImage = (number) => {
    let provider = number.charAt(0);

    if (provider == 5) return assets.iconMasterWhite;
    if (provider == 4) return assets.iconVisaWhite;
    if (provider == 3) return assets.iconAmexWhite;

    return;
};

export const getCardProviderFullLogo = (number) => {
    let provider = number.charAt(0);

    if (provider == 5) return assets.icMasterCard;
    if (provider == 4) return assets.icVisa;
    if (provider == 3) return assets.icAmex;

    return;
};

export const createBoosterData = (data) => {
    console.log("data is", data);
    const BOOSTER_DATA = [
        {
            id: 0,
            title: "Spare \nChange",
            Amount: data.S ? "RM " + data["S"] : "",
            des: data.S ? "Used in " + data["S"] + " goal" : "Not in use",
            path: data.S
                ? require("@assets/icons/boosterTick.png")
                : require("@assets/icons/spareChangeIcon.png"),
            value: data.S ? data["S"] : 0,
        },
        {
            id: 1,
            title: "Get Fit \nor Get Fat",
            Amount: data.F ? "RM " + data["F"] : "",
            des: data.F ? "Used in " + data["F"] + " goal" : "Not in use",
            path: data.F
                ? require("@assets/icons/boosterTick.png")
                : require("@assets/icons/getFitIcon.png"),
            value: data.F ? data["F"] : 0,
        },
        {
            id: 2,
            title: "QR Pay \nSavers",
            Amount: data.Q ? "RM " + data["Q"] : "",
            des: data.Q ? "Used in " + data["Q"] + " goal" : "Not in use",
            path: data.Q
                ? require("@assets/icons/boosterTick.png")
                : require("@assets/icons/qrPayIcon.png"),
            value: data.Q ? data["Q"] : 0,
        },
        {
            id: 3,
            title: "Guilty \nPleasure",
            Amount: data.G ? "RM " + data["G"] : "",
            des: data.G ? "Used in " + data["G"] + " goal" : "Not in use",
            path: data.G
                ? require("@assets/icons/boosterTick.png")
                : require("@assets/icons/guiltyPleasureIcon.png"),
            value: data.G ? data["G"] : 0,
        },
    ];

    return BOOSTER_DATA;
};

export const weekdayNumberToDayCharacter = (date) => {
    let day = date.format("dddd");
    day = day.charAt(0);
    return day;
};

export const shortText = (text, maxLength = 20) => {
    let newTxt = text.substring(0, maxLength);
    if (text.length > maxLength) {
        newTxt += "*";
    }
    return newTxt;
};

export const getExternalPartnerName = (type) => {
    switch (type) {
        case Strings.WETIX:
            return "Wetix";
        case Strings.AIRPAZ:
            return "AirPaz";
        case Strings.MYGROSER:
            return "Groceries";
        default:
            return "CTB";
    }
};

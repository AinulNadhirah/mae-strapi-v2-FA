import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNRsaSdk from "react-native-rsa-sdk";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import {
    getPublicKey,
    requestTAC,
    isWalletExits,
    maeStepupCusEnquiry,
    checkOperationTime,
} from "@services";

import { TOKEN_TYPE_MAYA } from "@constants/api";
import * as Data from "@constants/data";
import * as Strings from "@constants/strings";

import { JSEncrypt } from "@libs/jsencrypt";

import * as Utility from "@utils";
import { ErrorLogger } from "@utils/logs";

import * as ModelClass from "./modelClass";

export const alphaNumericWithDashOnlyRegex = (text) => {
    let isValid = /^[a-z\d\-\s]+$/i;
    return isValid.test(String(text).toLowerCase());
};

export const getmonthNumberofDays = (month, year) => {
    return new Date(year, month, 0).getDate();
};

// a and b are javascript Date objects

export const getDifferenceBetweenTwoDates = (startDate, endDate) => {
    var date1 = new Date(startDate);
    var date2 = new Date(endDate);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
};

export const getDifferenceBetweenlastdaymonth = (startDate, endDate) => {
    var date1 = new Date(startDate);
    var date2 = new Date(endDate);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
};

// Get Current Date in DD/MM/YYY Format

export const getDayDateFormat = (date) => {
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    var year = date.getFullYear();
    return month + "/" + day + "/" + year;
};
// Get Current Date in YYYY/MM/DD Format

export const getcurrentDate = () => {
    var today = new Date();
    var day = String(today.getDate()).padStart(2, "0");
    var month = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var year = today.getFullYear();
    return year + "/" + month + "/" + day;
};

// Get Current Year
export const getCurrentYear = () => {
    var today = new Date();
    var year = today.getFullYear();
    return year;
};
// Get Current Month Number
//January is 0!

export const getCurrentMonth = () => {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    console.log("getCurrentMonth : ", month);
    return month;
};

export const getNextMonthNumber = (date) => {
    var today = date;
    var month = String(today.getMonth() + 1).padStart(2, "0");

    console.log("getNextMonthNumber : ", month);
    return month;
};

export const getNextMonthNumberNew = (date) => {
    var today = moment(date, "YYYY/MM/DD");
    var month = today.format("M");

    console.log("#getNextMonthNumber : ", month);
    return month;
};

//get Age
export const getAge = (birthDayDate, format) => {
    return moment().diff(moment(birthDayDate, format), "years");
};

// Get Current Month Name
export const getCurrentMonthName = () => {
    var today = new Date();
    var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return monthNames[today.getMonth()];
};
export const getmonthNumber = (month) => {
    switch (month) {
        case "January":
            return "1";
        case "February":
            return "2";
        case "March":
            return "3";
        case "April":
            return "4";
        case "May":
            return "5";
        case "June":
            return "6";
        case "July":
            return "7";
        case "August":
            return "8";
        case "September":
            return "9";
        case "October":
            return "10";
        case "November":
            return "11";
        case "December":
            return "12";
    }
};

export const getmonthNameFromNumber = (month) => {
    console.log("month : ", month);
    switch (month) {
        case "01":
            return "January";
        case 1:
            return "January";
        case "02":
            return "February";
        case 2:
            return "February";
        case "03":
            return "March";
        case 3:
            return "March";
        case "04":
            return "April";
        case 4:
            return "April";
        case "05":
            return "May";
        case 5:
            return "May";
        case "06":
            return "June";
        case 6:
            return "June";
        case "07":
            return "July";
        case 7:
            return "July";
        case "08":
            return "August";
        case 8:
            return "August";
        case "09":
            return "September";
        case 9:
            return "September";
        case "10":
            return "October";
        case 10:
            return "October";
        case "11":
            return "November";
        case 11:
            return "November";
        case "12":
            return "December";
        case 12:
            return "December";
    }
};

export const getFormatedTodays = () => {
    let todayDate = new Date();
    console.log("todayDate : " + todayDate);
    let formatedTodayDate = moment(todayDate).format("DD MMMM, YYYY hh:mm");
    console.log("formatedTodayDate : " + formatedTodayDate);

    return formatedTodayDate;
};

export const getFormatedTodaysMoments = (formate) => {
    let todayDate = new Date();
    console.log("todayDate : " + todayDate);
    let formatedTodayDate = moment(todayDate).format(formate);
    console.log("formatedTodayDate : " + formatedTodayDate);

    return formatedTodayDate;
};

export const getFormatedDateMoments = (date, formate) => {
    console.log("date : " + date);
    let formatedTodayDate = moment(date).format(formate);
    console.log("formatedTodayDate : " + formatedTodayDate);

    return formatedTodayDate;
};

export const getCurrentDat = () => {
    var today = new Date();
    var day = String(today.getDate()).padStart(2, "0");
    return day;
};

export const getDuplicateobjectCount = (data, prop) => {
    return data.reduce(
        (res, item) =>
            Object.assign(res, {
                [item[prop]]: 1 + (res[item[prop]] || 0),
            }),
        Object.create(null)
    );
};
export const getItemDataDromKeyValue = (arr, key, val) => {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) return arr[i];
    }
};

export const getSendingFormatDate = (date, monthNameType) => {
    const today = new Date(date);
    const { longMonthNames, shortMonthNames } = Data;

    // return monthNameType == "short"
    // 	? today.getDate() + " " + shortMonthNames[today.getMonth()] + " " + today.getFullYear()
    // 	: today.getDate() + " " + longMonthNames[today.getMonth()] + " " + today.getFullYear();

    return monthNameType == "short"
        ? `${today.getDate()} ${shortMonthNames[today.getMonth()]} ${today.getFullYear()}`
        : `${today.getDate()} ${longMonthNames[today.getMonth()]} ${today.getFullYear()}`;
};

export const getSendingFormatDateTime = (date) => {
    const today = new Date(date);
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    let hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return (
        today.getDate() +
        " " +
        monthNames[today.getMonth()] +
        " " +
        today.getFullYear() +
        " " +
        today.getHours() +
        ":" +
        today.getMinutes +
        ampm
    );
};

export const _getTodayDate = () => {
    let today = moment(new Date()).format("DD MMMM, YYYY hh:mm");
    console.log(" today Date ==> ", today);
    return today;
};

export const getDateShortMonthFormat = (date) => {
    var today = new Date(date);
    var monthShortNames = [
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
    return today.getDate() + " " + monthShortNames[today.getMonth()] + " " + today.getFullYear();
};

export const getFullMonthName = (monthName) => {
    switch (monthName) {
        case "Jan":
            return "January";
        case "Feb":
            return "February";
        case "Mar":
            return "March";
        case "Apr":
            return "April";
        case "May":
            return "May";
        case "Jun":
            return "June";
        case "Jul":
            return "July";
        case "Aug":
            return "August";
        case "Sep":
            return "September";
        case "Oct":
            return "October";
        case "Nov":
            return "November";
        case "Dec":
            return "December";
        default:
            return "";
    }
};
export const getshortMoontName = (monthName) => {
    switch (monthName) {
        case "January":
            return "Jan";
        case "February":
            return "Feb";
        case "March":
            return "Mar";
        case "April":
            return "Apr";
        case "May":
            return "May";
        case "June":
            return "Jun";
        case "July":
            return "Jul";
        case "August":
            return "Aug";
        case "September":
            return "Sep";
        case "October":
            return "Oct";
        case "November":
            return "Nov";
        case "December":
            return "Dec";
        default:
            return "";
    }
};

export const getFullMonthNumber = (monthName) => {
    switch (monthName) {
        case "Jan":
            return "1";
        case "Feb":
            return "2";
        case "Mar":
            return "3";
        case "Apr":
            return "4";
        case "May":
            return "5";
        case "Jun":
            return "6";
        case "Jul":
            return "7";
        case "Aug":
            return "8";
        case "Sep":
            return "9";
        case "Oct":
            return "10";
        case "Nov":
            return "11";
        case "Dec":
            return "12";
        default:
            return "";
    }
};

export const getWishesPerTime = () => {
    const myDate = new Date();
    const hrs = myDate.getHours();
    if (hrs < 12) return "Good morning!";
    else if (hrs >= 12 && hrs <= 17) return "Good afternoon!";
    else if (hrs >= 17 && hrs <= 24) return "Good evening!";
};

export const getUserDetails = () => {
    Utility.getTabungItem("userDetails")
        .then((data) => {
            console.log("data user Details is", data);

            ModelClass.USER_DATA.userID = data.userId;
            ModelClass.USER_DATA.username = data.userName;
            ModelClass.USER_DATA.userStatus = data.status;

            console.log("User id oooooooooo", ModelClass.USER_DATA.userID);
        })
        .catch(() => {
            this.props.navigation.navigate(navigationConstant.BOOSTER_INITIAL);
        });
};

export const encryptData = async (text) => {
    let encrypted = "";
    let pubKey = null;
    try {
        pubKey = await AsyncStorage.getItem("publicKey");
        if (pubKey === null || pubKey === "null" || pubKey === "") {
            await getPublicKey("/pubKey")
                .then(async (response) => {
                    console.log("RES", response);
                    const pkObject = await response.data;
                    console.log("Qrobject", pkObject);
                    await AsyncStorage.setItem("publicKey", pkObject.message);

                    var jsencrypt = new JSEncrypt();
                    jsencrypt.setPublicKey(pkObject.message);
                    encrypted = await jsencrypt.encrypt(text);
                    console.log("Enc", encrypted);
                })
                .catch((err) => {
                    encrypted = null;
                    console.log("ERR", err);
                });
        } else {
            var jsencrypt = new JSEncrypt();
            jsencrypt.setPublicKey(pubKey);
            encrypted = await jsencrypt.encrypt(text);
            console.log("Enc", encrypted);
        }
    } catch (e) {
        encrypted = null;
        console.log("Error", e);
    }
    return encrypted;
};

export const maeRequestOTP = (view) => {
    console.log("[DataModel] >> [maeRequestOTP]");

    // Request object
    if (
        ModelClass.MAE_CUSTOMER_DETAILS.hasM2UAccess == "Y" ||
        ModelClass.MAE_CUSTOMER_DETAILS.isM2ULinked == "Y"
    ) {
        ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag = "postlogin";
    } else {
        ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag = "prelogin";
    }

    var params = JSON.stringify({
        mobileNo: ModelClass.MAE_CUSTOMER_DETAILS.mobileNumber,
        // mobileNo: ModelClass.MAE_CUSTOMER_DETAILS.tempMobileNumber,
        idNo: ModelClass.MAE_CUSTOMER_DETAILS.userIDNumber,
        transactionType: "MAE_ENROL_OTP",
        otp: "",
        preOrPostFlag: ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag,
    });

    var url = "mae/api/v1/requestTAC";
    if (ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag == "postlogin") {
        url = "mae/api/v1/requestTACETB";
    }

    requestTAC(params, true, url)
        .then((response) => {
            console.log("[DataModel][requestTAC] >> Success");
            maeRequestOTPSuccCb(response, view);
        })
        .catch((error) => {
            console.log("[DataModel][requestTAC] >> Failure");
            maeRequestOTPFailCb(error, view);
        });
};

export const maeRequestOTPSuccCb = (response, view) => {
    console.log("[DataModel] >> [maeRequestOTPSuccCb]");
    try {
        let result = response.data;
        var statusCode = result.statusCode;
        var statusDesc = result.statusDesc;

        switch (statusCode) {
            case "0000":
                var token = result.token;
                if (token) {
                    ModelClass.MAE_CUSTOMER_DETAILS.token = token;
                }

                view.props.navigation.push(navigationConstant.MAE_OTP_VALIDATION);
                break;
            default:
                if (statusDesc && statusDesc != "") {
                    view.showErrorPopup(statusDesc);
                } else {
                    view.showErrorPopup(Strings.COMMON_ERROR_MSG);
                }
                break;
        }
    } catch (e) {
        console.log("[DataModel][maeRequestOTPSuccCb] >> Exception: " + e);
    }
};

export const maeRequestOTPFailCb = (error, view) => {
    console.log("[DataModel] >> [maeRequestOTPFailCb]");
    try {
        if (view && Object.prototype.hasOwnProperty.call(view, "showErrorPopup")) {
            if (
                error &&
                Object.prototype.hasOwnProperty.call(error, "message") &&
                !Utility.isEmpty(error.message)
            ) {
                view.showErrorPopup(error.message);
            } else {
                view.showErrorPopup(Strings.COMMON_ERROR_MSG);
            }
        }
    } catch (e) {
        console.log("[DataModel][maeRequestOTPFailCb] >> Exception: " + e);
    }
};

export const gotoMAYAWallet = () => {
    try {
        // Navigate to MAYA Wallet
        NavigationService.navigateToModule(
            navigationConstant.WALLET_MODULE,
            navigationConstant.WALLET_LOGIN
        );
    } catch (e) {
        console.log("[DataModel][gotoMAYAWallet] >> Exception: " + e);
    }
};

export const checkWalletExits = async () => {
    try {
        const variables = {
            mayaAuthorization: ModelClass.COMMON_DATA.serverAuth + ModelClass.COMMON_DATA.mayaToken,
            tokenType: TOKEN_TYPE_MAYA,
        };
        const response = await isWalletExits(variables);
        const isWalletExists = response.data.data.isWalletExists.exists;
        AsyncStorage.setItem("walletExists", response.data.data.isWalletExists.exists.toString());
        AsyncStorage.setItem(
            "hasPrimaryAccount",
            response.data.data.isWalletExists.hasPrimaryAccount.toString()
        );
        AsyncStorage.setItem("m2uLinked", response.data.data.isWalletExists.m2uLinked.toString());
        if (isWalletExists !== null && isWalletExists) {
            AsyncStorage.setItem("walletId", response.data.data.isWalletExists.walletId.toString());
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

export const checkStepUpEnquiry = async () => {
    try {
        const variables = {
            maeAcctNo: ModelClass.VIEW_ACCOUNT_DATA.acctNo,
        };
        const response = await maeStepupCusEnquiry(true, variables);
        let enquirystatus = response.data.result;
        return enquirystatus;
    } catch (error) {
        return false;
    }
};
export const checkServerOperationTime = async (type) => {
    console.log("[DataModel] >> [checkServerOperationTime]");

    let fail_Response = {
        statusCode: "9999",
        statusDesc: "Server communication error",
    };
    try {
        let body = {
            requestType: type,
        };
        const response = await checkOperationTime(true, body);
        let enquirystatus = response.data.result;
        return enquirystatus;
    } catch (error) {
        return fail_Response;
    }
};

export const _getDeviceInformation = async () => {
    try {
        const deviceInformation = await RNRsaSdk.getRSAMobileSDK();

        if (deviceInformation) _handleDeviceInformation(deviceInformation);
    } catch (err) {
        console.error("TCL: SplashScreen -> getUuid _getAndroidDeviceInformation -> error", err);
    }
};

export const _handleDeviceInformation = async (deviceInformation) => {
    try {
        const { result } = JSON.parse(deviceInformation);
        const { RSA_ApplicationKey, DeviceName, DeviceModel, DeviceSystemVersion, HardwareID } =
            JSON.parse(result);
        const DeviceIsEmulator = await DeviceInfo.isEmulator();
        console.table({
            RSA_ApplicationKey,
            DeviceName,
            DeviceModel,
            DeviceSystemVersion,
            DeviceIsEmulator,
            DeviceID: DeviceInfo.getDeviceId(),
            DeviceInfo: DeviceInfo.getUniqueId(),
            HardwareID,
        });
        console.log(" result >> ", result);
        //FIXME: Marked for code cleanup
        ModelClass.COMMON_DATA.rsa_key = RSA_ApplicationKey;
        ModelClass.COMMON_DATA.isEmulator = DeviceIsEmulator;
        ModelClass.COMMON_DATA.device_id = DeviceInfo.getDeviceId();
        ModelClass.COMMON_DATA.device_name = DeviceInfo.getDeviceNameSync();
        ModelClass.COMMON_DATA.device_model = DeviceModel;
        ModelClass.COMMON_DATA.os_version = DeviceSystemVersion;

        if (Platform.OS === "ios") {
            if (
                ModelClass.COMMON_DATA.hardwareId === undefined ||
                ModelClass.COMMON_DATA.hardwareId === null
            ) {
                ModelClass.COMMON_DATA.hardwareId = DeviceInfo.getUniqueId();
            } else {
                ModelClass.COMMON_DATA.hardwareId = HardwareID;
            }
        } else {
            let systemVersion = DeviceInfo.getSystemVersion();
            console.log(" Android getSystemVersion >> ", systemVersion);
            console.log(" ModelClass.COMMON_DATA.uuid >> ", ModelClass.COMMON_DATA.uuid);

            if (systemVersion >= 10) {
                ModelClass.COMMON_DATA.hardwareId = ModelClass.COMMON_DATA.uuid;
            } else {
                ModelClass.COMMON_DATA.hardwareId = HardwareID;
            }

            if (
                ModelClass.COMMON_DATA.hardwareId === undefined ||
                ModelClass.COMMON_DATA.hardwareId === null
            ) {
                if (
                    ModelClass.COMMON_DATA.uuid === undefined ||
                    ModelClass.COMMON_DATA.uuid === null
                ) {
                    ModelClass.COMMON_DATA.hardwareId = DeviceInfo.getUniqueId();
                } else {
                    ModelClass.COMMON_DATA.hardwareId = ModelClass.COMMON_DATA.uuid;
                }
            }
            console.log(
                " ModelClass.COMMON_DATA.hardwareId >> ",
                ModelClass.COMMON_DATA.hardwareId
            );
        }
        return;
    } catch (error) {
        ErrorLogger(error);
        return;
    }
};
export const getRequiredDateFormat = (inputDate) => {
    return moment(inputDate, "YYYYMMDD").format("DD MMM YYYY")
};

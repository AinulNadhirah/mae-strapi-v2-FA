/* eslint-disable react-native/split-platform-components */
import HMSLocation from "@hmscore/react-native-hms-location";
import { Platform, PermissionsAndroid, AppState } from "react-native";
import DeviceInfo from "react-native-device-info";
import Geolocation from "react-native-geolocation-service";
import Permissions from "react-native-permissions";
import { selectContactPhone } from "react-native-select-contact";

import { isPureHuawei } from "@utils/checkHMSAvailability";

export const isEmpty = (value) => {
    try {
        if (value == "" || value === null || value === undefined) {
            return true;
        } else if (
            typeof value == "object" &&
            !(value instanceof Array) &&
            !(value instanceof Date)
        ) {
            if (Object.keys(value).length < 1) {
                return true;
            } else {
                return false;
            }
        } else if (value instanceof Array) {
            if (value.length) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    } catch (e) {
        console.log("[Utility][isEmpty] >> Exception: " + e);
        return true;
    }
};

export const checkCamPermission = async () => {
    var camPerm, storagePerm;

    if (Platform.OS === "ios") {
        camPerm = true;
        storagePerm = true;
    } else {
        try {
            const storageGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (storageGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the storage");
                storagePerm = true;
            } else {
                console.log("Storage permission denied");
            }
        } catch (err) {
            console.warn(err);
            return;
        }

        try {
            const camGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );

            if (camGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the storage");
                camPerm = true;
            } else {
                console.log("Storage permission denied");
                return;
            }
        } catch (err) {
            console.warn(err);
            return;
        }
    }

    return storagePerm && camPerm;
};

export const clone = (obj) => {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== "object") {
        return obj;
    }
    // array deep copy
    if (obj instanceof Array) {
        var cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = clone(obj[i]);
        }
        return cloneA;
    }
    // object deep copy
    var cloneO = {};
    for (let j in obj) {
        cloneO[j] = clone(obj[j]);
    }
    return cloneO;
};

export const addSpaceAfter4Chars = (text) => {
    try {
        // Empty check
        if (isEmpty(text)) {
            return text;
        }

        // Type check
        if (typeof text != "string") {
            text = String(text);
        }

        text = text
            // eslint-disable-next-line no-empty-character-class
            .replace(/[]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        return text;
    } catch (e) {
        console.log("[Utility][addSpaceAfter4Chars] >> Exception: ", e);
    }
};

export const calculateDaysBetweenDates = (date1, date2) => {
    try {
        if (date1 instanceof Date && date2 instanceof Date) {
            let diffInTime = date2.getTime() - date1.getTime();
            let diffInDays = diffInTime / (1000 * 3600 * 24);

            return diffInDays.toFixed(0);
        } else {
            return null;
        }
    } catch (e) {
        console.log("[Utility][calculateDaysBetweenDates] >> Exception: ", e);
    }
};

export const getShadow = ({
    color = "rgba(0,0,0, .4)",
    height = 4,
    width = 1,
    shadowOpacity = 0.2,
    shadowRadius = 2,
    elevation = 5,
}) => {
    return {
        shadowColor: color, // IOS
        shadowOffset: { height, width }, // IOS
        shadowOpacity: shadowOpacity, // IOS
        shadowRadius: shadowRadius, //IOS
        elevation: elevation, // Android
    };
};

export const getDeviceRSAInformation = (deviceInfo, dv, deviceId = "") => {
    const geolocationInfo = deviceInfo.GeoLocationInfo[0];

    return {
        deviceDetail: deviceInfo.DeviceSystemName || "",
        deviceId: DeviceInfo.getDeviceId(),
        deviceModel: deviceInfo.DeviceModel || "",
        deviceName: deviceInfo.DeviceName || "",
        devicePrint: "string",
        osType: Platform.OS,
        osVersion: deviceInfo.DeviceSystemVersion || "",
        rsaKey: deviceInfo.RSA_ApplicationKey || "",
        hardwareID: deviceInfo.HardwareID || deviceId || "",
        screenSize: deviceInfo.ScreenSize || "",
        languages: deviceInfo.Languages || "",
        multitaskingSupported: deviceInfo.MultitaskingSupported,
        timestamp: deviceInfo.TIMESTAMP || "",
        geoLocationInfo: {
            Latitude: geolocationInfo.Latitude || "",
            Longitude: geolocationInfo.Longitude || "",
            Status: geolocationInfo.Status || "",
            Timestamp: geolocationInfo.Timestamp || "",
            HorizontalAccuracy: geolocationInfo.HorizontalAccuracy || "",
        },
        emulator: deviceInfo.Emulator,
        osId: deviceInfo.OS_ID || "",
        compromised: deviceInfo.Compromised,
        sdkVersion: deviceInfo.SDK_VERSION || "",
        appState: AppState.currentState || "",
        keyChainErrorOnStoring: deviceInfo?.KeychainErrorOnStoring || "NA",
        keyChainErrorOnRetrieve: deviceInfo?.KeyChainErrorOnRetrieve || "NA",
    };
};

export const securityQuestionsRSAInfo = (deviceInfo, DeviceInfo, deviceID) => {
    const geolocationInfo = deviceInfo.GeoLocationInfo[0];
    return {
        deviceDetail: deviceInfo.DeviceSystemName || "",
        deviceId: DeviceInfo.getDeviceId(),
        deviceModel: deviceInfo.DeviceModel || "",
        deviceName: deviceInfo.DeviceName || "",
        devicePrint: "string",
        osType: Platform.OS,
        osVersion: deviceInfo.DeviceSystemVersion || "",
        rsaKey: deviceInfo.RSA_ApplicationKey || "",
        hardwareID: deviceInfo.HardwareID || deviceID,
        screenSize: deviceInfo.ScreenSize || "",
        languages: deviceInfo.Languages || "",
        multitaskingSupported: deviceInfo.MultitaskingSupported,
        timestamp: deviceInfo.TIMESTAMP || "",
        geoLocationInfo: {
            Status: geolocationInfo.Status || "",
            Timestamp: geolocationInfo.Timestamp || "",
        },
        emulator: deviceInfo.Emulator,
        osId: deviceInfo.OS_ID || "",
        compromised: deviceInfo.Compromised,
        sdkVersion: deviceInfo.SDK_VERSION || "",
        appState: AppState.currentState || "",
        keyChainErrorOnStoring: deviceInfo?.KeychainErrorOnStoring || "NA",
        keyChainErrorOnRetrieve: deviceInfo?.KeyChainErrorOnRetrieve || "NA",
    };
};

export const checkFormatNumber = (text) => {
    const val = text.replace(/[^a-zA-Z0-9]/g, "");
    const first = val.substring(0, 1);
    let value = "";
    if (first === "+") {
        value = val.substring(1, val.length);
    } else if (first === "6") {
        value = val.substring(2, val.length);
    } else if (first === "0") {
        value = val.substring(1, val.length);
    } else {
        value = val;
    }
    if (value.length > 15) {
        value = value.substring(0, 15);
    }
    return formatNumber(value);
};

export const formatNumber = (val) => {
    const first = val.toString().substring(0, 3);
    const second = val
        .toString()
        .substring(3, val.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return first + `${""}` + second;
};
// TODO: this function is same with openNativeContactPicker, will sort out later
export const checkNativeContatPermission = async () => {
    let permissionResult;
    if (isPureHuawei) {
        permissionResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
    } else {
        permissionResult = await Permissions.request("contacts").then((response) => {
            console.log("R", response);
            return response;
        });
    }

    if (
        permissionResult == "denied" ||
        permissionResult == "undetermined" ||
        permissionResult == "restricted"
    ) {
        // Return Error with Message
        return {
            status: false,
            message: "Please go to mobile settings and allow app to access contacts",
        };
    } else {
        return selectContactPhone().then((selection) => {
            if (!selection) {
                return null;
            }

            let { selectedPhone } = selection;
            // Return Error with Message
            return { status: true, mobileNo: checkFormatNumber(selectedPhone.number) };
        });
    }
};
export const convertStringToNumber = (val) => {
    if (val) {
        let num = Number(val.replace(/,/g, ""));
        return num;
    }

    return 0;
};
export const getLocationDetails = async () => {
    if (Platform.OS === "ios") {
        return getLocationPermissionDetails();
    } else {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Application wants location Permission",
                message: "Application wants location Permission",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK",
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("[Utility][getLocationAccuracy] location Permisssion Enabled:", granted);
            return getLocationPermissionDetails();
        } else {
            console.log("[Utility][getLocationAccuracy] location Permisssion disbled:", granted);
            return new Promise((resolve, reject) => {
                const error = {
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 2,
                    TIMEOUT: 3,
                    code: 2,
                    message: "No location provider available.",
                };
                const data = { status: false, location: error };
                reject(data);
            });
        }
    }
};

checkLocationSettings = () =>
    HMSLocation.FusedLocation.Native.checkLocationSettings(locationSettingsRequest)
        .then((res) => this.setState({ locationSettings: res }))
        .catch((err) => alert(err.message));

// Get last known location with HMS getLastLocation
export const getLocationPermissionDetails = async () => {
    if (isPureHuawei) {
        // uses last position, since dashboard *should* already getting the current position
        // and it'd be in the cache by now

        return new Promise((resolve, reject) => {
            //try{
            const locationRequest = {
                priority: HMSLocation.FusedLocation.Native.PriorityConstants.PRIORITY_NO_POWER,
                interval: 3,
                numUpdates: 1,
                fastestInterval: 1000.0,
                expirationTime: 200000.0,
                expirationTimeDuration: 200000.0,
                smallestDisplacement: 0.0,
                maxWaitTime: 7000.0,
                needAddress: true,
                language: "en",
            };

            const LocationSettingsRequest = {
                locationRequests: [locationRequest],
                needBle: true,
                alwaysShow: true,
            };

            HMSLocation.FusedLocation.Native.getLastLocationWithAddress(locationRequest)
                .then((lastPosition) => {
                    const data = { status: true, location: lastPosition };
                    resolve(data);
                })
                .catch((error) => {
                    const data = { status: false, location: error };
                    reject(data);
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    // if location is on
                    console.tron.log("[Utility][getLocationAccuracy] position:", position);
                    const data = { status: true, location: position?.coords };
                    resolve(data);
                },
                (error) => {
                    // if location is off
                    console.tron.log(
                        "[Utility][getLocationAccuracy] Couldn't get location! Error:",
                        error
                    );
                    const data = { status: false, location: error };
                    reject(data);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 7000,
                }
            );
        });
    }
};

export const getContactNameInitial = (name) => {
    if (!name) return name;

    const formattedName = name
        .trim()
        .replace(/[^0-9a-zA-Z ]/g, "")
        .toUpperCase();

    const splitName = formattedName.split(" ");
    const cleanUpWhiteSpace = splitName.filter((ele) => ele.trim().length > 0);

    const contactInitial =
        cleanUpWhiteSpace.length > 0
            ? cleanUpWhiteSpace.length > 1
                ? cleanUpWhiteSpace[0].substring(0, 1) + cleanUpWhiteSpace[1].substring(0, 1)
                : cleanUpWhiteSpace[0].substring(0, 2)
            : "#";

    return isNaN(contactInitial) ? contactInitial : "#";
};

export const removeAllCharInImage = (imageName) => {
    const val = imageName
        ? imageName
              .toString()
              .replace(/ /g, "")
              .replace(/\s/g, "")
              .replace(/\s+/, "")
              .replace("@", "")
              .replace("@3x", "")
              .replace("3x", "")
              .replace("@2x", "")
              .replace("2x", "")
              .replace(".png", "")
              .replace(/[^\w\s]/gi, "")
        : "";
    return val;
};

export const formatPhoneNumber = (phoneNumberString) => {
    //Filter only numbers from the input
    let cleaned = ("" + phoneNumberString).replace(/\D/g, "");

    const isMalaysia = cleaned.indexOf("60") == 0 || cleaned.indexOf("0") == 0;

    let match = null;

    if (isMalaysia) {
        const isMobile = cleaned.indexOf("601") == 0 || cleaned.indexOf("01") == 0;
        if (isMobile) {
            // malaysia format  - 10 digit mobile
            match = cleaned.match(/^(\d{1})?(\d{3})(\d{3})(\d{4})$/);

            // malaysia format - 11 digit mobile
            if (!match) match = cleaned.match(/^(\d{1})?(\d{3})(\d{4})(\d{4})$/);

            if (!match || match[2].indexOf("01") != 0)
                match = cleaned.match(/^(\d{1})?(\d{3})(\d{4})(\d{4})$/);
        } else {
            // malaysia format  - 9 digit - landline
            match = cleaned.match(/^(\d{1})?(\d{2})(\d{3})(\d{4})$/);

            if (!match) match = cleaned.match(/^(\d{1})?(\d{2})(\d{4})(\d{4})$/);
        }
    }

    if (match) {
        //Remove the matched extension code
        //Change this to format for any country code.
        let intlCode = match[1] ? `+${match[1]} ` : "";
        return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return phoneNumberString;
};

export const openNativeContactPicker = async () => {
    let permissionResult;
    if (isPureHuawei) {
        permissionResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
    } else {
        permissionResult = await Permissions.request("contacts");
    }

    return new Promise(function (resolve, reject) {
        if (
            permissionResult == "denied" ||
            permissionResult == "undetermined" ||
            permissionResult == "restricted"
        ) {
            reject({ message: "Please go to mobile settings and allow app to access contacts" });
        } else {
            // if (Platform.OS === "ios") {
            // 	try {
            // 		const { RNSelectContactPhone } = NativeModules;
            // 		let phoneNumber = await RNSelectContactPhone.selectPhone(true);
            // 		resolve({ phoneNumber: phoneNumber });
            // 	} catch (error) {
            // 		reject({ message: error.message });
            // 	}
            // } else {
            selectContactPhone()
                .then((selection) => {
                    if (selection) {
                        let { selectedPhone } = selection;
                        let phoneNumber = selectedPhone.number;
                        resolve({ phoneNumber: phoneNumber });
                    }
                })
                .catch((error) => {
                    reject({ message: error.message });
                });
            // }
        }
    });
};

export const formatDeviceName = (deviceInformation) => {
    const formattedDeviceName = deviceInformation.DeviceName.replace(/[^a-zA-Z\d]/g, "");
    const formattedDeviceModel = formatDeviceModel(deviceInformation);
    return formattedDeviceName && formattedDeviceName.length >= 5
        ? formattedDeviceName
        : formattedDeviceModel;
};

export const formatDeviceModel = (deviceInformation) => {
    const deviceModel = !deviceInformation.DeviceModel
        ? DeviceInfo.getModel()
        : deviceInformation.DeviceModel;
    return deviceModel.replace(/[^a-zA-Z\d]/g, "");
};

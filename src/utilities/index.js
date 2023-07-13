import { Platform, Vibration, Dimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import Haptic from "react-native-haptic";
import {
    widthPercentageToDP as wp2dp,
    heightPercentageToDP as hp2dp,
} from "react-native-responsive-screen";
import { detectVPN } from "react-native-vpn-status";

import { showInfoToast, showErrorToast } from "@components/Toast";

import { requestUserRest, checkGoalDowntime } from "@services";

import {
    NETWORK_ERROR,
    COMMON_ERROR_MSG,
    NETWORK_ERROR_MSG_DESC,
    NETWORK_ERROR_MSG_HEADER,
    MISSING_USERNAME,
    SECURITY_VPN,
} from "@constants/strings";

// Utility function for masking user Name
export function maskName(text) {
    if (!text) return "N/A";

    const length = text.length;
    const first = text.substring(0, 2);
    const last = text.substring(length - 2, length);
    let mask = "";

    for (let i = 0; i < length - 4; i++) {
        mask += "*";
    }

    return `${first}${mask}${last}`;
}
/*
    Utility for masking email address

    For an email name@domain.com,
    1. If name length is less than or equal to 3, the first character will be shown, rest of the name will be masked with *; for eg., a**@mail.com
    2. If name length is greater than 3, then first 2 characters will be shown, rest of the name will be masked with *; for eg., ab***@mail.com
*/
export function maskedEmail(email) {
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
}

/*
    Utility for masking mobile number as per new rule:
    - Last 4 digits of the phone number should be masked with *; for eg., if phone number is 60123456789, then the result returned would be 60 12 345* ***
*/
export function maskedMobileNumber(mobileNumber) {
    if (mobileNumber) {
        // Remove all existing whitespace from incoming mobileNumber
        const strippedNumber = mobileNumber.replace(/ /g, "");
        // Mask last 4 digits with ****
        const maskedNumber = `${strippedNumber.substring(0, strippedNumber.length - 4)}****`;
        // Check if phone number has + at the start, if yes then first block of maskedMobileNumber will be +60, else 60
        const start = maskedNumber.indexOf("+") === 0 ? 3 : 2;
        let maskedNumberWithSpaces;
        // Split maskedNumber into separate sections separated by whitespaces in the above given format
        if (maskedNumber.length <= 10) {
            maskedNumberWithSpaces = `${maskedNumber.substring(0, start)} ${maskedNumber.substring(
                start,
                maskedNumber.length - 4
            )} ${maskedNumber.substring(maskedNumber.length - 4)}`;
        } else if (maskedNumber.length > 10 && maskedNumber.length < 13) {
            maskedNumberWithSpaces = `${maskedNumber.substring(0, start)} ${maskedNumber.substring(
                start,
                start + 2
            )} ${maskedNumber.substring(
                start + 2,
                maskedNumber.length - 4
            )} ${maskedNumber.substring(maskedNumber.length - 4)}`;
        } else {
            maskedNumberWithSpaces = `${maskedNumber.substring(0, start)} ${maskedNumber.substring(
                start,
                maskedNumber.length - 8
            )} ${maskedNumber.substring(
                maskedNumber.length - 8,
                maskedNumber.length - 4
            )} ${maskedNumber.substring(maskedNumber.length - 4)}`;
        }
        return maskedNumberWithSpaces;
    }
    return mobileNumber;
}

export function getMobileSdkParams({
    DeviceName,
    deviceId,
    DeviceModel,
    DeviceSystemVersion,
    RSA_ApplicationKey,
    OS_ID,
}) {
    return {
        deviceDetail: DeviceName,
        deviceId: deviceId,
        deviceModel: DeviceModel,
        deviceName: DeviceName,
        devicePrint: DeviceName,
        osType: Platform.OS,
        osVersion: DeviceSystemVersion,
        rsaKey: RSA_ApplicationKey,
        osId: OS_ID,
    };
}

export const responsive = {
    width: (width: Number, referenceWidth: Number): Number => {
        if (!width) throw new Error("Element's width is required");
        if (!referenceWidth)
            throw new Error("Refrence width is needed to calculate the percentage value");

        return wp2dp((width / referenceWidth) * 100);
    },
    height: (height: Number, referenceHeight: Number): Number => {
        if (!height) throw new Error("Element's height is required");
        if (!referenceHeight)
            throw new Error("Refrence height is needed to calculate the percentage value");

        return hp2dp((height / referenceHeight) * 100);
    },
    widthPercentage: (width: Number): Number => {
        if (!width) throw new Error("Element's width is required");

        return wp2dp(width);
    },
    heightPercentage: (height: Number): Number => {
        if (!height) throw new Error("Element's height is required");

        return hp2dp(height);
    },
    conditionalByHeight: ({
        defaultValue,
        defaultHeight,
        biggerValue = 0,
        biggerHeight = 0,
        smallerValue = 0,
        smallerHeight = 0,
    }) => {
        const screenHeight = Dimensions.get("window").height;

        if (screenHeight <= defaultHeight && screenHeight > smallerHeight) return defaultValue;
        if (screenHeight > defaultHeight && screenHeight >= biggerHeight) return biggerValue;
        if (screenHeight < defaultHeight && screenHeight <= smallerHeight) return smallerValue;
    },
};

const androidVibrationEmulate = {
    impact: [0, 50],
    notification: [0, 35, 65, 21],
    selection: [0, 70],
    impactMedium: [0, 43],
    impactHeavy: [0, 61],
    notificationError: [0, 30, 40, 30, 50, 80],
    notificationWarning: [0, 27, 45, 50],
};
export const validateBlacklistContacts = async (
    isContactBlacklistingValidation,
    dataToValidate,
    validateContact
) => {
    if (isContactBlacklistingValidation) {
        try {
            const response = await validateContact(dataToValidate);
            const { blacklisted, message } = response.data;
            if (blacklisted) {
                return {
                    status: false,
                    message,
                };
            }
        } catch (error) {
            const { message } = error;
            return {
                status: false,
                message: message || COMMON_ERROR_MSG,
            };
        }
    }
    return {
        status: true,
    };
};

/**
 *
 * @param {String} type Type of the haptic/vibration
 *
 * On android we just emulate it using timing and vibration
 */
export function generateHaptic(
    type:
        | "impact"
        | "notification"
        | "selection"
        | "impactLight"
        | "impactMedium"
        | "impactHeavy"
        | "notificationError"
        | "notificationSuccess"
        | "notificationWarning" = "impactLight",
    disableAndroid: Boolean = false
) {
    if (Platform.OS === "ios") {
        Haptic.generate(type);
    } else if (!disableAndroid) {
        switch (type) {
            case "impact":
            case "impactLight":
                Vibration.vibrate(androidVibrationEmulate.impact);
                break;
            case "notification":
            case "notificationSuccess":
                Vibration.vibrate(androidVibrationEmulate.notification);
                break;
            case "selection":
                Vibration.vibrate(androidVibrationEmulate.selection);
                break;
            case "impactMedium":
                Vibration.vibrate(androidVibrationEmulate.impactMedium);
                break;
            case "impactHeavy":
                Vibration.vibrate(androidVibrationEmulate.impactHeavy);
                break;
            case "notificationError":
                Vibration.vibrate(androidVibrationEmulate.notificationError);
                break;
            case "notificationWarning":
                Vibration.vibrate(androidVibrationEmulate.notificationWarning);
                break;

            default:
                break;
        }
    }
}

/*
    Utility for getting error message, header text & status for network error at the time of doing payment related. This function will be called in acknowledgement page
    - headerMsg: header text for acknowledgement screen
    - descMsg: description for the error 
    - pending: refer to payment status which is pending because of network error. Used to specifiy which icon to be displayed in acknowledge page
*/
export function getNetworkMsg(error) {
    if (error === NETWORK_ERROR) {
        return {
            headerMsg: NETWORK_ERROR_MSG_HEADER,
            descMsg: NETWORK_ERROR_MSG_DESC,
            pending: true,
        };
    } else {
        return "";
    }
}

/*
    Utility for calling /userDetails api
    1. At the time of opening the apps - Dashbord/index
    2. At the time of missing username when call verifyUsername api - M2uLogin
*/
export const getUserProfile = async (updateModel, onLoginCancelled) => {
    try {
        const response = await requestUserRest(false);

        if (response && response?.data?.result) {
            const {
                fullName,
                phone: mobileNumber,
                imageBase64,
                username,
                email,
                userId,
                birthDate,
            } = response.data.result;

            updateModel({
                user: {
                    fullName,
                    mobileNumber,
                    email,
                    birthDate,
                    username,
                    m2uUserId: userId,
                    mayaUserId: userId,
                    profileImage: imageBase64 ? `data:jpeg;base64,${imageBase64}` : null,
                },
            });

            return response;
        }
    } catch (error) {
        //error handling
        console.log("[Error calling /userDetails api", error);
        onLoginCancelled(MISSING_USERNAME);
    }
};

export const checkSimulator = () => {
    return DeviceInfo.isEmulator();
};

export const showGoalDowntimeError = async () => {
    try {
        const downtimeRes = await checkGoalDowntime();
        if (downtimeRes && downtimeRes.status === 200) {
            const {
                data: {
                    result: { canCreateGoals, errorMessage },
                },
            } = downtimeRes;
            if (!canCreateGoals) {
                showInfoToast({ message: errorMessage });
                return true;
            }
        }
        return false;
    } catch (error) {
        //error handling
        showErrorToast({ message: error.message });
    }
};

const timeoutPromise = (key, func) => {
    const PROMISE_TIMEOUT = 3000; //Mili Seconds
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`${key} timeout after ${PROMISE_TIMEOUT} ms`));
        }, PROMISE_TIMEOUT);

        func()
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
};

export const isAndroid = () => {
    return Platform.OS === "android";
};

export const checkVPN = async () => {
    try {
        const status = await timeoutPromise(SECURITY_VPN, () => detectVPN());
        return status;
    } catch (error) {
        return error?.toString();
    }
};

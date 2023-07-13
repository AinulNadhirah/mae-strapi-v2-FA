import AsyncStorage from "@react-native-community/async-storage";

import {
    LS_KEY_MAYA_TOKEN,
    LS_KEY_MAYA_REFRESH_TOKEN,
    LS_IS_SECURE2U_ENABLE,
} from "@constants/localStorage";

export default class LocalStorageManager {
    static getItem = (keyName) => {
        console.log(`LocalStorageManager:getName ${keyName}`);
        return AsyncStorage.getItem(keyName);
    };

    static setItem = (keyName, value) => {
        console.log(`LocalStorageManager:setItem ${keyName} : ${value}`);

        return AsyncStorage.setItem(keyName, value);
    };

    static removeItem = (keyName) => {
        console.log(`LocalStorageManager:removeItem ${keyName}`);
        return AsyncStorage.removeItem(keyName);
    };

    static multiSet = (array) => {
        console.log(`LocalStorageManager:multiSet`);
        return AsyncStorage.multiSet(array);
    };

    static clearAll = () => {
        return AsyncStorage.clear();
    };
}

export function clearAll() {
    return LocalStorageManager.clearAll();
}

// ---------------------------------
// PREDEFINE METHOD
// ---------------------------------

// MAYA_TOKEN
export function setMayaToken(val) {
    return LocalStorageManager.setItem(LS_KEY_MAYA_TOKEN, val);
}
export function getMayaToken() {
    return LocalStorageManager.getItem(LS_KEY_MAYA_TOKEN);
}
export function removeMayaToken() {
    return LocalStorageManager.removeItem(LS_KEY_MAYA_TOKEN);
}

// MAYA_REFRESH_TOKEN
export function setMayaRefreshToken(val) {
    return LocalStorageManager.setItem(LS_KEY_MAYA_REFRESH_TOKEN, val);
}
export function getMayaRefreshToken() {
    return LocalStorageManager.getItem(LS_KEY_MAYA_REFRESH_TOKEN);
}
export function removeMayaRefreshToken() {
    return LocalStorageManager.removeItem(LS_KEY_MAYA_REFRESH_TOKEN);
}

// isSecure2uEnable
export function setIsSecure2uEnable(val) {
    return LocalStorageManager.setItem(LS_IS_SECURE2U_ENABLE, val);
}
export function getIsSecure2uEnable() {
    return LocalStorageManager.getItem(LS_IS_SECURE2U_ENABLE);
}
export function removeIsSecure2uEnable() {
    return LocalStorageManager.removeItem(LS_IS_SECURE2U_ENABLE);
}

import SecureStorage from "@services/SecureStorage";

import { storeCloudLogs } from "@utils/cloudLog";

const STORAGE_KEYS = {
    CUSTOMER_KEY: "customerKey",
    DIGITAL_ID: "digitalId",
    REFRESH_TOKEN: "refreshToken",
};

export const isEmpty = (value) => !value || (value && value === "");

function logError(getModel, error) {
    storeCloudLogs(getModel, {
        errorType: "Secure Storage Error",
        errorDetails: error,
    });
}

//Customer Key
export async function getCustomerKey(getModel, findContext = false, ignoreError = true) {
    let value;

    //Find the context for value
    if (findContext && getModel && typeof getModel === "function") {
        const { customerKey } = getModel("auth");
        value = customerKey;

        if (!isEmpty(value)) {
            //If customer key found in the context, return
            return value || "";
        }
    }

    //Get value from secure storage
    value = await SecureStorage.getItem(
        STORAGE_KEYS.CUSTOMER_KEY,
        !ignoreError ? (error) => logError(getModel, error) : null,
        ignoreError
    );

    return value || "";
}

export async function setCustomerKey(value) {
    await SecureStorage.setItem(STORAGE_KEYS.CUSTOMER_KEY, value);
}

export async function removeCustomerKey() {
    await SecureStorage.removeItem(STORAGE_KEYS.CUSTOMER_KEY);
}

//Refresh Token
export async function getRefreshToken(getModel) {
    return await SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN, (error) =>
        logError(getModel, error)
    );
}

export async function setRefreshToken(value) {
    await SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, value);
}

export async function removeRefreshToken() {
    await SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

//Digital Id
export async function getDigitalId(getModel) {
    return await SecureStorage.getItem(STORAGE_KEYS.DIGITAL_ID, (error) =>
        logError(getModel, error)
    );
}

export async function setDigitalId(value) {
    await SecureStorage.setItem(STORAGE_KEYS.DIGITAL_ID, JSON.stringify(value));
}

export async function removeDigitalId() {
    await SecureStorage.removeItem(STORAGE_KEYS.DIGITAL_ID);
}

//Remove Secure Storage
export async function removeSecureStorage() {
    await removeCustomerKey();
    await removeRefreshToken();
    await removeDigitalId();
}

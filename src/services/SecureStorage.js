import { getBundleId } from "react-native-device-info";
import SecureStorage, { ACCESSIBLE } from "react-native-secure-storage";

const RETRY_DELAY = [500, 1000, 1500]; //Mili Seconds
const PROMISE_TIMEOUT = 3000; //Mili Seconds

const getSecureStorageConfig = () => {
    const bundleId = getBundleId();
    return {
        accessible: ACCESSIBLE.WHEN_UNLOCKED,
        service: bundleId,
    };
};

//Format the error string
const getError = (error, key) =>
    error instanceof Error || typeof error === "object"
        ? { key, stack: error }
        : `Secure storage error occured with the key : "${key}", Error: ${error?.toString()}`;

//Function to set delay
const delay = (millis, callback = null) =>
    new Promise((resolve, reject) => {
        setTimeout((_) => {
            callback && callback();
            resolve();
        }, millis);
    });

//Check the value is undefined or empty string
const isEmpty = (value) => !value || (value && value === "");

//Function to timeout in given seconds, argument function will be rejected once PROMISE_TIMEOUT exceeded
const timeoutPromise = (func) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Secure Storage timeout after ${PROMISE_TIMEOUT} ms`));
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

const handleError = (errorCallback, error, key) => {
    errorCallback && errorCallback(getError(error, key));
};

//Get Item from Secure Storage
const getItem = async (key, onErrorCallback = null, ignoreError = true) => {
    let value;
    let count = 0;

    try {
        value = await timeoutPromise(() => SecureStorage.getItem(key, getSecureStorageConfig()));

        //If value not found, retry for 3 times
        if (isEmpty(value)) {
            while (isEmpty(value) && count < 3) {
                //Wait and retry
                delay(RETRY_DELAY[count]);
                value = await timeoutPromise(() =>
                    SecureStorage.getItem(key, getSecureStorageConfig())
                );
                count++;
            }
        }

        return value;
    } catch (error) {
        handleError(onErrorCallback, error, key);
        return ignoreError ? value : { error: true, data: getError(error) };
    }
};

//Set Item in Secure Storage
const setItem = async (key, value, onErrorCallback = null) => {
    try {
        await timeoutPromise(() => SecureStorage.setItem(key, value, getSecureStorageConfig()));
    } catch (error) {
        handleError(onErrorCallback, error, key);
    }
};

//Remove Item from Secure Storage
const removeItem = async (key, onErrorCallback = null) => {
    try {
        await timeoutPromise(() => SecureStorage.removeItem(key, getSecureStorageConfig()));
    } catch (error) {
        handleError(onErrorCallback, error, key);
    }
};

export default { getItem, setItem, removeItem };

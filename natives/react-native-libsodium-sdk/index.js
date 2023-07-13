import { NativeModules } from "react-native";

const { ReactNativeLibsodiumSdk } = NativeModules;

/**
 * Am object wrapper to the native SDK
 * So we could get promise support implementation
 * while also supporting callback
 */
const RNLibSodiumSdk = {
    /**
     * initKey
     * @param {function} callback
     * @returns Promise with keypair from the sodium SDK
     */
    initKey: function (callback) {
        return new Promise((resolve, reject) => {
            ReactNativeLibsodiumSdk.initKey((error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
    encryptAndAuthenticate: function (params, callback) {
        return new Promise((resolve, reject) => {
            ReactNativeLibsodiumSdk.encryptAndAuthenticate(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
    decryptAndVerify: function (params, callback) {
        return new Promise((resolve, reject) => {
            ReactNativeLibsodiumSdk.decryptAndVerify(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
};

export default RNLibSodiumSdk;

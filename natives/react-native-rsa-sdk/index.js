import { NativeModules } from "react-native";

const { RsaSdk } = NativeModules;

const RNRsaSdk = {
    /**
     * getRSAMobileSDK
     * @param {function} callback
     * @returns Promise with device information from the RSA SDK
     */
    getRSAMobileSDK: function (callback) {
        const timeout = 4000;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`RSA Mobile SDK timeout ${timeout} ms`));
            }, timeout);

            RsaSdk.getRSAMobileSDK((error, message) => {
                callback && callback(error, message);

                if (error) {
                    clearTimeout(timer);
                    reject(error);
                } else {
                    clearTimeout(timer);
                    resolve(message);
                }
            });
        });
    },
};

export default RNRsaSdk;

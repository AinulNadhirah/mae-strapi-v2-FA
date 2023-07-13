import { NativeModules } from "react-native";

const { ReactNativeSafetyNet, MaeModule } = NativeModules;

const RNSafetyNet = {
    /**
     * getSafetyNetAttestationToken
     * @param {String} nonce the nonce from backend
     * @param {function} callback (err, response)
     * @returns Promise with safetynet response
     */
    getSafetyNetAttestationToken: function (nonce, callback) {
        return new Promise((resolve, reject) => {
            ReactNativeSafetyNet.getSafetyNetAttestationToken(
                nonce,
                (err) => {
                    callback && callback(err, null);
                    reject(err);
                },
                (response) => {
                    callback && callback(false, response);

                    resolve(response);
                }
            );
        });
    },

    /**
     * screenshotDisable
     * @param Object params
     * @param function callback
     * @returns Promise
     */
    screenshotDisable: function (params, callback) {
        return new Promise((resolve, reject) => {
            ReactNativeSafetyNet.screenshotDisable(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },

    /**
     * downloadManagerFromURL
     * @param Object params
     * @param function callback
     * @returns Promise
     */
    downloadManagerFromURL: function (params, callback) {
        return new Promise((resolve, reject) => {
            ReactNativeSafetyNet.downloadManagerFromURL(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
};

export default RNSafetyNet;

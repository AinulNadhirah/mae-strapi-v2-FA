import { NativeModules } from "react-native";

const { ReactNativeEkyc, ReactNativeEzBio } = NativeModules;

const eKycEzBio = {
    /**
     *
     * @param Object params
     * @param Boolean isSimulator will skip on simulator since nothing will happen on simulator
     * @param function callback
     * @returns Promise
     */
    startKYC: function (params, isSimulator, callback) {
        return new Promise((resolve, reject) => {
            if (isSimulator) {
                resolve({
                    message: "Skip startKYC method on simulator",
                });

                return;
            }

            ReactNativeEkyc.startKYC(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
    /**
     * startSelfie
     * @param Object params
     * @param Boolean isSimulator will skip on simulator since nothing will happen on simulator
     * @param function callback
     * @returns Promise
     */
    startSelfie: function (params, isSimulator, callback) {
        return new Promise((resolve, reject) => {
            if (isSimulator) {
                resolve({
                    message: "Skip startSelfie method on simulator",
                });
                return;
            }

            ReactNativeEzBio.startSelfie(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
    /**
     * verifySelfieWithDoc
     * @param Object params
     * @param Boolean isSimulator will skip on simulator since nothing will happen on simulator
     * @param function callback
     * @returns Promise
     */
    verifySelfieWithDoc: function (params, isSimulator, callback) {
        return new Promise((resolve, reject) => {
            if (isSimulator) {
                resolve({
                    message: "Skip verifySelfieWithDoc method on simulator",
                });
                return;
            }

            ReactNativeEzBio.verifySelfieWithDoc(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
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
            ReactNativeEzBio.screenshotDisable(params, (error, message) => {
                callback && callback(error, message);

                if (error) reject(error);
                else resolve(message);
            });
        });
    },
};

export default eKycEzBio;

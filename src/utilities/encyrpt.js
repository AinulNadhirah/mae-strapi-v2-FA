import AsyncStorage from "@react-native-community/async-storage";

import { JSEncrypt } from "@libs/jsencrypt";

export const encryptData = async (data, publicKey) => {
    let pubKey = publicKey;

    if (!pubKey) {
        pubKey = await AsyncStorage.getItem("publicKey");

        if (!pubKey) {
            // throw an error
            throw new Error(
                "Public key are required to encrypt the data. It doesn't exists in the storage, thus need to be provided in the request"
            );
        }
    }

    const jsencrypt = new JSEncrypt();

    jsencrypt.setPublicKey(pubKey);

    try {
        const encrypted = await jsencrypt.encrypt(data);

        if (encrypted) return encrypted;
    } catch (error) {
        console.tron.log("encrypt failed");
        return null;
    }
};

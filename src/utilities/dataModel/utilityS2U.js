import RNLibSodiumSdk from "natives/react-native-libsodium-sdk";

import { getServerPublicKeyAPI, syncOsId } from "@services";

import { doEncrypt } from "./utilityPartial.5";

const getPublicAndDeviceSecretKey = async (getModel) => {
    let { serverPublicKey, deviceSecretKey, deviceId } = getModel("ota");
    if (!serverPublicKey) {
        const response = await getServerPublicKeyAPI();

        if (response && response.data) {
            const { publicKey } = response.data;
            serverPublicKey = publicKey;
        }
    }
    if (!deviceSecretKey) {
        const init = await RNLibSodiumSdk.initKey();
        if (init) {
            // the public key and secret key
            const keys = JSON.parse(init);
            deviceSecretKey = keys.sk;
        }
    }

    return {
        serverPublicKey,
        deviceSecretKey,
        deviceId,
    };
};

export const onSyncOsId = async (getModel) => {
    const { deviceInformation } = getModel("device");
    const { deviceSecretKey, serverPublicKey, deviceId } = await getPublicAndDeviceSecretKey(
        getModel
    );
    // check local storage if value exist
    // deviceKeys & serverPublicKey
    if (deviceSecretKey && serverPublicKey) {
        const message = JSON.stringify({
            ...deviceInformation,
            HardwareID: deviceId,
        });
        const params = { message, publicKey: serverPublicKey, secretKey: deviceSecretKey };
        const response = await doEncrypt(params);
        if (response && response?.ct && response?.nonce) {
            const { ct, nonce } = response;
            try {
                await syncOsId(ct, nonce);
            } catch (error) {
                console.log(error);
            }
        }
    }
};

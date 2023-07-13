import { encode as btoa } from "base-64";
import AesGcmCrypto from "react-native-aes-gcm-crypto";
import { box, randomBytes } from "tweetnacl";
import { decodeUTF8, encodeUTF8 } from "tweetnacl-util";

import hotp from "@libs/hotp";
import SecureCryptoJS from "@libs/pbkdf2";

import { S2uUtil } from "./s2uUtil";

const newNonce = () => randomBytes(box.nonceLength);

export class S2uNacl {
    static generateAESKey() {
        const result = [];
        const length = 32;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length; // 62
        const buf = new Uint8Array(length);
        window.crypto.getRandomValues(buf);
        for (let i = 0; i < length; i++) {
            const index = buf[i] % charactersLength;
            result.push(characters[index]);
        }
        return btoa(result.join(""));
    }

    static encryptAESData(text, key) {
        return AesGcmCrypto.encrypt(JSON.stringify(text), false, key)
            .then((result) => {
                console.log(">>>>gcm enc : ", result);
                return result;
            })
            .catch((error) => {
                throw error;
            });
    }

    static decryptAESData(cipherText, key, iv, tag) {
        return AesGcmCrypto.decrypt(cipherText, key, iv, tag, false)
            .then((decryptedData) => {
                console.log(">>>>gcm dec : ", decryptedData);
                return decryptedData;
            })
            .catch((error) => {
                throw error;
            });
    }

    static async encrypt(json, platformOS, serverPK, deviceSK, addPlatform) {
        console.log("------  Encrypt : json data  ------");
        console.log(json);
        const nonce = newNonce();
        const msg = decodeUTF8(JSON.stringify(json));

        const msgBufferArray = S2uUtil.buff(msg);
        const nonceBufferArray = S2uUtil.buff(nonce);
        const pkBufferArray = S2uUtil.buff(serverPK);
        const skBufferArray = S2uUtil.buff(deviceSK);

        let boxMsg;
        try {
            boxMsg = box(msgBufferArray, nonceBufferArray, pkBufferArray, skBufferArray);
        } catch (error) {
            console.log("S2U SDK Catch : encrypt", error);
            throw error;
        }
        if (["android", "huawei"].includes(platformOS.toLowerCase())) {
            return {
                payload: S2uUtil.arrayBufferToBase64(S2uUtil.padding(msg.length, boxMsg)),
                ref: addPlatform
                    ? platformOS.substring(0, 1) + nonceBufferArray.toString("base64")
                    : nonceBufferArray.toString("base64"),
            };
        }
        return {
            payload: S2uUtil.arrayBufferToBase64([...nonceBufferArray, ...boxMsg]),
            ref: addPlatform
                ? platformOS.substring(0, 1) + nonceBufferArray.toString("base64")
                : nonceBufferArray.toString("base64"),
        };
    }

    static async decrypt(boxMsg, nonce, os, pk, sk) {
        console.log("------  Decrypt : data  ------");
        console.log(boxMsg);
        let boxBufferArray = S2uUtil.buff(boxMsg);
        const pkBufferArray = S2uUtil.buff(pk);
        const nonceBufferArray = S2uUtil.buff(nonce);
        const skBufferArray = S2uUtil.buff(sk);

        if (["android", "huawei"].includes(os.toLowerCase())) {
            boxBufferArray = boxBufferArray.slice(16);
        }

        try {
            const message = box.open(
                boxBufferArray,
                nonceBufferArray,
                pkBufferArray,
                skBufferArray
            );
            return JSON.parse(encodeUTF8(message));
        } catch (error) {
            console.log("S2U SDK Catch : decrypt : ", error);
            throw error;
        }
    }

    static async verifyChallengeCipherText(
        action,
        hOtp,
        mdipCounterVal,
        challengeValue,
        challengeSecret
    ) {
        try {
            const mdipCounter = parseInt(mdipCounterVal);
            console.log("------  Hasing data  ------");
            console.log(
                "Action : ",
                action,
                "hOtp : ",
                hOtp,
                "mdipCounterVal : ",
                mdipCounterVal,
                "challengeValue : ",
                challengeValue,
                "challengeSecret : ",
                challengeSecret,
                "mdipCounter : ",
                mdipCounter
            );
            if (mdipCounter != null && mdipCounter >= 1) {
                const userAction = action === "APPROVE" ? 0 : 1;
                /* Step 1 : Create HOTP*/
                const generatedHOTP = hotp(hOtp, mdipCounter, "dec6");
                console.log("------  Hasing generateHOTP  ------");
                console.log(generatedHOTP);

                /*Step2 : Create H1*/
                const h1 = SecureCryptoJS.PBKDF2(generatedHOTP, challengeValue, {
                    keySize: 8,
                    iterations: 1,
                });
                console.log("------  Hasing challenge value  ------");
                console.log(h1);
                /*Step3 : Create H2*/
                const h2 = SecureCryptoJS.PBKDF2(h1.toString(), challengeSecret, {
                    keySize: 8,
                    iterations: 1,
                });
                console.log("------  Hasing challenge secret  ------");
                console.log(h2);
                return {
                    hotp: generatedHOTP,
                    hash: h2.toString(),
                    userAction: parseInt(userAction),
                };
            }
        } catch (error) {
            console.log("verifyChallengeCipherText fail - exception : ", error);
            throw error;
        }
    }
}

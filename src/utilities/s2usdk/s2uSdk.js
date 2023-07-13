import * as DataModel from "@utils/dataModel";

import { S2uApi } from "./s2uApi";
import { S2uNacl } from "./s2uNacl";
import { S2uUtil } from "./s2uUtil";

const COMMON_ERROR_MSG = "We are experiencing communication error. Please try again.";
const FAILED_AUTH =
    "We are unable to process your request due to an authentication failure. Please try again.";

async function encPayload(data) {
    return await DataModel.encryptData(data);
}

async function doDecryptData(data, nonce, os, s2uOta) {
    return await S2uNacl.decrypt(data, nonce, os, s2uOta?.serverPublicKey, s2uOta?.deviceSecretKey);
}

async function doEncryptData(data, s2uOta, os, addPlatform = true) {
    return await S2uNacl.encrypt(
        data,
        os,
        s2uOta?.serverPublicKey,
        s2uOta?.deviceSecretKey,
        addPlatform
    );
}

export class S2uSdk {
    static s2uOta;
    static os;
    static s2uApiList;
    static aesKey;
    static encAesKey;
    static s2uInitResponse;
    static initChallengeResponse;
    static accessToken;

    static s2uUtil = new S2uUtil();
    static s2uNacl = new S2uNacl();
    static s2uApi = new S2uApi();

    async load(ota, s2uApiList, os) {
        this.s2uOta = ota;
        this.s2uApiList = s2uApiList;
        this.os = os;
        //OTA and Screen Lock check
        return !!this.s2uOta?.isEnabled;
    }

    async init(payload, config) {
        try {
            console.log("------------------------ init ------------------------");
            //Fetch s2uOta data
            const s2uOta = this.s2uOta;
            payload.devicePublicKey = s2uOta?.devicePublicKey;
            payload.mdipDeviceId = s2uOta?.deviceId;
            console.log("init Payload : ", payload);
            // Payload contains : functionCode, mdipDeviceId, transactionPayload, devicePublicKey, mobileSDKData,

            //Step 1 : generate AES key
            this.aesKey = S2uNacl.generateAESKey();
            console.log("SDK > aes key :: ", this.aesKey);

            //Step 2 : encrypt payload
            const { content, iv, tag } = await S2uNacl.encryptAESData(payload, this.aesKey);

            //Step 3 : encrypt key with RSA (BAU process)
            this.encAesKey = await encPayload(this.aesKey);
            console.log("SDK > encAesKey : ", this.encAesKey);

            //Invoke init api
            const initAESPayload = { key: this.encAesKey, base64CipherText: content, tag, iv };
            const result = await S2uApi.s2uApiReq(this.s2uApiList.init, initAESPayload, config);
            console.log("SDK > init api Result : ", result);
            if (result?.status === 200) {
                const response = result?.data;
                //Decrypt the response with the key that generated in step 1
                const decText = await S2uNacl.decryptAESData(
                    response?.ciphertext,
                    this.aesKey,
                    response?.hexIV,
                    response?.tag
                );
                //Storing data global variables
                this.s2uInitResponse = JSON.parse(decText);
                this.accessToken = this.s2uInitResponse?.gatewayToken;
                console.log("SDK > init api decrypt result : ", this.s2uInitResponse);
                if (this.s2uInitResponse?.statusCode !== 0) {
                    return {
                        message: this.s2uInitResponse?.statusDesc,
                    };
                }
                return this.s2uInitResponse;
            } else {
                // If any eccryption or data not pass then only else block will get trigger
                return {
                    message: COMMON_ERROR_MSG,
                };
            }
        } catch (error) {
            return {
                message: FAILED_AUTH,
                error,
            };
        }
    }

    async initChallenge(data = {}) {
        try {
            console.log("------------------------ initChallenge ------------------------");
            data.is_push = false;
            data.device_id = this.s2uOta.deviceId;
            data.token = this.s2uInitResponse?.transactionToken;
            data.challenge_details = JSON.stringify(this.s2uInitResponse?.s2uContent);
            console.log("--------- initChallenge Data -----------");
            console.log(data);
            //Step 1 : Encrypt the data
            const challengeParams = await doEncryptData(data, this.s2uOta, this.os);
            console.log("--------- initChallenge Encrypted Data and API Request Data -----------");
            console.log(challengeParams);

            //Step 2 : trigger challenge api
            const config = S2uUtil.prepareConfig(this.accessToken);
            console.log("--------- initChallenge API Config -----------");
            console.log(config);
            const result = await S2uApi.s2uApiReq(
                this.s2uApiList.initChallenge,
                challengeParams,
                config
            );
            console.log("--------- initChallenge API Result -----------");
            console.log(result);
            if (result?.status === 200) {
                const response = result?.data || result;
                //Decrypt the initChallenge Response data
                const decryptChallengeRes = await doDecryptData(
                    response?.payload,
                    response?.ref,
                    this.os,
                    this.s2uOta
                );
                if (decryptChallengeRes?.status !== "MS3000") {
                    return decryptChallengeRes;
                }
                console.log("--------- initChallenge API Decrypted Result -----------");
                console.log(decryptChallengeRes);
                //Decrypt the cipher_text in decrypted initchallenge Response data
                const decryptCipherText = await doDecryptData(
                    decryptChallengeRes?.payload?.cipher_text,
                    decryptChallengeRes?.payload?.nonce,
                    this.os,
                    this.s2uOta
                );
                console.log(
                    "--------- initChallenge API Decrypted Cipher text and final decrypted result -----------"
                );
                console.log(decryptCipherText);
                //Store data in global variable
                this.initChallengeResponse = decryptCipherText; // {id, secret, value, ref}
                return {
                    decData: decryptCipherText,
                    mapperData: this.s2uInitResponse?.s2uContent,
                    status: decryptChallengeRes?.status,
                };
            } else {
                return {
                    message:
                        result?.data?.statusDesc ||
                        result?.data?.message ||
                        result?.response?.data?.payload
                            ? COMMON_ERROR_MSG
                            : result?.message || COMMON_ERROR_MSG,
                };
            }
        } catch (error) {
            return {
                message: FAILED_AUTH,
                error,
            };
        }
    }

    async validateChallenge(data, pushData) {
        try {
            console.log("------------------------ validateChallenge ------------------------");
            console.log("data : ", data);
            const accessToken = pushData?.accessToken || this.accessToken || "";
            const challengeValue = pushData?.value || this.initChallengeResponse?.value;
            const challengeSecret = pushData?.secret
                ? pushData?.secret
                : this.initChallengeResponse?.secret;
            console.log(
                "accToken",
                accessToken,
                " : value : ",
                challengeValue,
                " : secret : ",
                challengeSecret
            );
            //1st hashing
            const verifyCipherText = await S2uNacl.verifyChallengeCipherText(
                data?.action, //Accept/reject
                data?.hOtp, // hopt after s2u registration
                data?.mdipCounter, // increment by 1 for each transaction
                challengeValue, // init challenge response
                challengeSecret // init challenge response
            );
            console.log("-------- Validate Challenge Hasing ----------");
            console.log(verifyCipherText);
            // 2nd encrypt the hash
            const encCipherText = await doEncryptData(
                verifyCipherText,
                this.s2uOta,
                this.os,
                false
            );
            console.log("-------- Validate Challenge Encrypt the Hash ----------");
            console.log(encCipherText);
            const payloadEncData = {
                challenge_id: pushData?.id || this.initChallengeResponse?.id, // init challenge id
                ref: pushData?.ref || this.initChallengeResponse?.ref, // init challenge response
                cipher_text: encCipherText.payload,
                nonce: encCipherText.ref,
            };
            console.log(
                "-------- Validate Challenge Encrypt the Encrypted Hash with ID and Ref ----------"
            );
            console.log(payloadEncData);
            //3rd encrypt the payload data
            const verifyChallengePayloadData = await doEncryptData(
                payloadEncData,
                this.s2uOta,
                this.os
            );
            //For interop push
            if (pushData?.value && pushData?.secret) {
                verifyChallengePayloadData.pk = this.s2uOta.devicePublicKey;
            }
            const config = S2uUtil.prepareConfig(accessToken);
            console.log("-------- Validate Challenge valdateChallengeRequset Data ----------");
            console.log(verifyChallengePayloadData);
            const result = await S2uApi.s2uApiReq(
                this.s2uApiList.verifyChallenge,
                verifyChallengePayloadData,
                config
            );
            console.log("-------- Validate Challenge valdateChallengeResponse ----------");
            console.log(result);
            // trigger challenge api
            if (result?.status === 200) {
                const response = result?.data || result;
                const decryptChallengeRes = await doDecryptData(
                    response?.payload,
                    response?.ref,
                    this.os,
                    this.s2uOta
                );
                console.log(
                    "-------- Validate Challenge Decrypted valdateChallengeResponse ----------"
                );
                console.log(decryptChallengeRes);
                return decryptChallengeRes;
            } else {
                if (result.response?.data?.payload) {
                    const decryptChallengeRes = await doDecryptData(
                        result.response?.data?.payload,
                        result.response?.data?.ref,
                        this.os,
                        this.s2uOta
                    );
                    console.log(
                        "-------- Validate Challenge Decrypted valdateChallengeResponse where result !=200 ----------"
                    );
                    console.log(decryptChallengeRes);
                    return decryptChallengeRes;
                }
                return {
                    message:
                        result?.data?.statusDesc ||
                        result?.data?.message ||
                        result?.message ||
                        COMMON_ERROR_MSG,
                };
            }
        } catch (error) {
            return {
                message: FAILED_AUTH,
                error,
            };
        }
    }

    async execute(payload, config) {
        try {
            console.log("------------------------ executeTransaction ------------------------");
            payload.gatewayToken = this.accessToken; // || s2uInitResponse?.gatewayToken;
            console.log("-------- Execute API Request Data ----------");
            console.log(payload);
            //Step 1 : Use the key that generate in init and encrypt the payload
            const { content, iv, tag } = await S2uNacl.encryptAESData(payload, this.aesKey);

            //Step 2 : Invoke execute API
            const executeAESPayload = { key: this.encAesKey, base64CipherText: content, tag, iv };
            const result = await S2uApi.s2uApiReq(
                this.s2uApiList.execute,
                executeAESPayload,
                config
            );
            console.log("-------- Execute API Result ----------");
            console.log(result);
            if (result?.status === 200) {
                const response = result?.data;
                //Decrypt the response data
                const decText = await S2uNacl.decryptAESData(
                    response?.ciphertext,
                    this.aesKey,
                    response?.hexIV,
                    response?.tag
                );
                console.log("-------- Execute API Decrypted Result ----------");
                console.log(JSON.parse(decText));
                return JSON.parse(decText);
            } else {
                return {
                    message: COMMON_ERROR_MSG,
                };
            }
        } catch (error) {
            return {
                message: FAILED_AUTH,
                error,
            };
        }
    }

    async decryptS2uPush(data) {
        try {
            const decryptPushMessage = await doDecryptData(
                data?.message,
                data?.nonce,
                this.os,
                this.s2uOta
            );
            const secret = JSON.parse(decryptPushMessage?.secret);
            return {
                decryptPushMessage,
                secret,
            };
        } catch (error) {
            return {
                decryptPushMessage: "",
                secret: "",
                error,
            };
        }
    }
}

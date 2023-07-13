import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNLibSodiumSdk from "react-native-libsodium-sdk";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import { COMMON_MODULE, RSA_DENY_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getServerPublicKeyAPI, secure2uRegisterApi } from "@services";
import { logEvent } from "@services/analytics";
import { getFCMToken } from "@services/pushNotifications";

import {
    MEDIUM_GREY,
    FADE_GREY,
    YELLOW,
    DISABLED,
    BLACK,
    DISABLED_TEXT,
    PINKISH_GREY,
    GRAY,
} from "@constants/colors";
import {
    SERVER_ERROR,
    APP_ID,
    FA_SCREEN_NAME,
    FA_S2U_DEVICENAME,
    FA_VIEW_SCREEN,
    CONTINUE,
    YOUR_DEVICE_MSG,
    CONFIRM_DEVICE,
    DEVICE_NAME,
} from "@constants/strings";

import { isPureHuawei } from "@utils/checkHMSAvailability";
import { storeCloudLogs } from "@utils/cloudLog";
import { s2uV4load } from "@utils/dataModel/s2uSDKUtil";
import { formatDeviceName, getDeviceRSAInformation } from "@utils/dataModel/utility";

function Device({ navigation, route, getModel, updateModel }) {
    const maxRetryCount = 3;
    const minRetryCount = 1;

    const [loading, setLoading] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [challengeRequest, setChallengeRequest] = useState(null);
    const [isRsaRequired, setIsRsaRequired] = useState(false);
    const [isRsaLoader, setIsRsaLoader] = useState(false);
    const [challengeQuestion, setChallengeQuestion] = useState(null);
    const [rsaCount, setRsaCount] = useState(0);
    const [rsaError, setRsaError] = useState(false);
    const [retryCount, setRetryCount] = useState(minRetryCount);

    const { deviceId, deviceInformation } = getModel("device");
    const { devicePublicKey, deviceSecretKey, nonce, cipherText, serverPublicKey } =
        getModel("ota");
    const { fcmToken } = getModel("auth");
    const { mdipS2uEnable } = getModel("s2uIntrops");
    function handleClose() {
        if (route?.params?.flowParams) {
            const { flowParams } = route.params;

            navigation.navigate(flowParams?.fail?.stack, {
                screen: flowParams?.fail?.screen,
                params: {
                    auth: "cancel",
                    ...flowParams.params,
                },
            });
        } else {
            // go back to settings
            navigation.navigate("Dashboard", {
                screen: "Settings",
            });
        }
    }

    function handleGoToFail(reason, isTokenEmpty = false) {
        navigation.navigate("Fail", {
            reason,
            isTokenEmpty,
            // in case we're from other module doing onboarding
            ...route?.params,
        });
    }

    function handleKeyboardChange(value) {
        setDeviceName(value);
    }

    async function doDecryptS2u(params) {
        try {
            const decrypted = await RNLibSodiumSdk.decryptAndVerify(params);

            if (decrypted) {
                return decrypted;
            }
        } catch (error) {
            return error;
        }
    }

    async function decryptS2uData(payload) {
        const params = [payload.encriptedSeeds, serverPublicKey, payload.nonce, deviceSecretKey];

        try {
            const response = await doDecryptS2u(params);
            if (response && response?.plainText) {
                const { plainText } = response;
                const { totp, hotp } = JSON.parse(plainText);
                const deviceId = payload.deviceId;
                const isUnderCoolDown = payload.isUnderCoolDown;
                const coolDownPeriod = payload.coolDownPeriod;

                const ota = {
                    isEnabled: true,
                    mdipCounter: 1,
                    hOtp: hotp,
                    isUnderCoolDown,
                    coolDownPeriod,
                    tOtp: totp,
                    deviceId,
                    serverPublicKey,
                    devicePublicKey,
                    deviceSecretKey,
                };
                // update AS and context
                updateModel({ ota });

                await AsyncStorage.setItem("isOtaEnabled", "true");
                await AsyncStorage.setItem("mdipCounter", "1");
                await AsyncStorage.setItem("otaHotp", hotp);
                await AsyncStorage.setItem("otaTotp", totp);
                await AsyncStorage.setItem("otaDeviceId", deviceId);
                await AsyncStorage.setItem("fcmSync", "true"); // Prod s2u DB need to update with dynamic FCM token keys, Currently its hardcoded so need to sync

                //S2U V4 Load : here we passing the s2u ota information
                s2uV4load(ota, getModel, updateModel);

                // if under cooldown, go to S2UCooling screen
                if (isUnderCoolDown) {
                    const {
                        flowParams: { params: { showS2UCoolingToast = true } = {} },
                    } = route.params;
                    const { navigate } = navigation;
                    await AsyncStorage.setItem("isUnderCoolDown", "true");
                    navigateToS2UCooling(navigate, false, showS2UCoolingToast);
                    return;
                }
                // if not, go to success screen
                navigation.navigate("Success", {
                    // in case we're from other module doing onboarding
                    ...route?.params,
                });
            }
        } catch (error) {
            console.log("error", error);
            handleGoToFail();
        }
    }

    function handleGoToRsaLocked({ reason, loggedOutDateTime, lockedOutDateTime }) {
        navigation.navigate("Locked", {
            reason,
            loggedOutDateTime,
            lockedOutDateTime,
        });
    }

    function validateFCMToken(token) {
        try {
            if (typeof token !== "string") {
                storeCloudLogs(getModel, {
                    errorType: "FCM TOKEN S2U",
                    errorDetails: token?.message ?? token,
                });
                handleGoToFail("", true);
                return false;
            }
            return true;
        } catch (error) {
            console.log(error);
            handleGoToFail("", true);
            return false;
        }
    }

    async function registerS2u(params) {
        setLoading(true);
        const s2uTransactionId = route?.params?.s2uTransactionId ?? null;
        const paramsNew = { ...params, s2uTransactionId };
        // eslint-disable-next-line camelcase
        const { gcm_token } = params;
        // filter gcm_token
        if (!validateFCMToken(gcm_token)) {
            return;
        }
        try {
            //s2u interops changes call v2 url when MDIP migrated
            const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/register`;
            const response = await secure2uRegisterApi(subUrl, paramsNew);
            if (
                response &&
                response.data &&
                response.data?.status === "M000" &&
                response.data?.code === "200"
            ) {
                const { payload } = response.data;

                setIsRsaRequired(false);
                setIsRsaLoader(false);

                // do the decryption
                decryptS2uData(payload[0]);
            } else {
                throw new Error();
            }
        } catch (error) {
            setLoading(false);
            /**
             * RSA stuff. Take a look at this @shabeer if anything is incorrect
             */
            if (error.status === 428) {
                setChallengeRequest({
                    ...challengeRequest,
                    challenge: error.error.challenge,
                });

                setIsRsaRequired(true);
                setIsRsaLoader(false);
                setChallengeQuestion(error.error.challenge.questionText);
                setRsaCount(rsaCount + 1);
                setRsaError(rsaCount > 0);
            } else if (error.status === 423) {
                const { statusDescription, serverDate } = error.error;

                setIsRsaRequired(false);
                setIsRsaLoader(false);

                // handleGoToFail(error.error.challenge.errorMessage);
                handleGoToRsaLocked({
                    reason: statusDescription,
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                });
            } else if (error.status === 422) {
                /**
                 * RSA Deny
                 */
                const { statusDescription, serverDate } = error.error;

                const params = {
                    statusDescription,
                    additionalStatusDescription: "",
                    serverDate,
                    nextParams: route?.params?.flowParams ?? {},
                    nextModule: route?.params?.flowParams?.fail?.stack ?? "Dashboard",
                    nextScreen: route?.params?.flowParams?.fail?.screen ?? "Settings",
                };

                navigation.navigate(COMMON_MODULE, {
                    screen: RSA_DENY_SCREEN,
                    params,
                });
            } else {
                setRetryCount(retryCount + 1);
                if (retryCount > maxRetryCount) {
                    handleGoToFail();
                }
            }
        }
    }

    async function generateParams(rsaParams = {}) {
        const mappedDeviceData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const latestToken = await getFCMToken(fcmToken);
        let deviceOS = "";
        try {
            if (isPureHuawei) {
                deviceOS = "Huawei";
            } else {
                deviceOS = Platform.select({ android: "Android", ios: "iOS" });
            }
            console.tron.log("//// deviceOS : " + deviceOS);
        } catch (error) {
            console.tron.log("OS identification error : " + error);
        }
        return {
            app_id: APP_ID,
            cipher_text: cipherText,
            device_name: deviceName,
            device_nonce: nonce,
            device_os: deviceOS, //Platform.OS === "android" ? "Android" : "iOS",
            device_public_key: devicePublicKey,
            gcm_token: latestToken,
            hardwareId: deviceId,
            mobileSDKData: mappedDeviceData,
            ...rsaParams,
        };
    }

    async function handleRegisterOta() {
        if (!serverPublicKey) {
            showErrorToast({
                message: SERVER_ERROR,
            });

            return;
        }

        const params = await generateParams();
        registerS2u(params);
    }

    const getDevicePairKeys = useCallback(async () => {
        try {
            const init = await RNLibSodiumSdk.initKey();

            if (init) {
                // the public key and secret key
                const keys = JSON.parse(init);

                // store the keys in AS
                await AsyncStorage.setItem("deviceKeys", `${init}`);

                // update it context
                updateModel({
                    ota: {
                        devicePublicKey: keys.pk,
                        deviceSecretKey: keys.sk,
                    },
                });

                return {
                    devicePublicKey: keys.pk,
                    deviceSecretKey: keys.sk,
                };
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    }, [updateModel]);

    async function doEncrypt(params) {
        try {
            const encrypt = await RNLibSodiumSdk.encryptAndAuthenticate(params);

            if (encrypt) {
                return encrypt;
            }
        } catch (error) {
            return error;
        }
    }

    const encryptDeviceData = useCallback(
        async (publicKey, deviceKeys) => {
            const paramsObj = {
                message: JSON.stringify({
                    ...deviceInformation,
                    /**
                     * because we rely on deviceId for most encryption stuff, and we didn't use the one given
                     * by RSA, due to some issue especially on android where after deleting cache,
                     * it will be empty. so to be consistent, we must use this value instead. the rest as is.
                     */
                    HardwareID: deviceId,
                }),
                publicKey,
                secretKey: deviceKeys.deviceSecretKey,
            };
            const params = [paramsObj.message, paramsObj.publicKey, paramsObj.secretKey];

            try {
                const response = await doEncrypt(params);
                console.tron.log("in encryptDeviceData after do encrypt", response);
                console.log("in encryptDeviceData after do encrypt", response);

                if (response && response?.ct && response?.nonce) {
                    const { ct, nonce } = response;
                    console.tron.log("in encryptDeviceData after do encrypt response", response);
                    console.log("in encryptDeviceData after do encrypt response", response);

                    // we don't actually need this in context,
                    // but for quicker movement we update the context
                    updateModel({
                        ota: {
                            nonce,
                            cipherText: ct,
                        },
                    });

                    // const params = [ct, publicKey, nonce, deviceKeys.deviceSecretKey];

                    // decrypt the device data
                    // comment out, it seems it is useless, no body do anything with it
                    // decryptDeviceData(params);
                } else {
                    throw new Error("no nonce and ct");
                }
            } catch (error) {
                console.log("error", error);
            }
        },
        [deviceId, deviceInformation, updateModel]
    );

    const generateDeviceKeys = useCallback(
        async (publicKey) => {
            try {
                console.log("deviceInformation = " + JSON.stringify(deviceInformation));
                const deviceKeys = await getDevicePairKeys();

                if (deviceKeys) {
                    // get the device information, and auto populate device name
                    // remove all special characters and spaces
                    const formattedDeviceName = formatDeviceName(deviceInformation);
                    setDeviceName(formattedDeviceName);

                    // encrypt the device information
                    encryptDeviceData(publicKey, deviceKeys);
                }
            } catch (error) {
                console.log("error", error);
            }
        },
        [getDevicePairKeys, deviceInformation, encryptDeviceData]
    );

    const getServerPublicKey = useCallback(async () => {
        try {
            const response = await getServerPublicKeyAPI();

            if (response && response.data) {
                const { publicKey } = response.data;

                if (publicKey) {
                    await AsyncStorage.setItem("serverPublicKey", `${publicKey}`);

                    // save in context
                    updateModel({
                        ota: {
                            serverPublicKey: publicKey,
                        },
                    });

                    // carry on with generate key pair for device key
                    generateDeviceKeys(publicKey);
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }, [generateDeviceKeys, updateModel]);

    useEffect(() => {
        if (retryCount > minRetryCount && retryCount <= maxRetryCount) {
            handleRegisterOta();
        }
    }, [retryCount]);

    useEffect(() => {
        getServerPublicKey();
    }, [getServerPublicKey]);

    async function onChallengeQuestionSubmitPress(answer) {
        const { challenge } = challengeRequest;
        const mergedChallenge = {
            ...challengeRequest,
            challenge: {
                ...challenge,
                answer,
            },
        };
        const params = await generateParams(mergedChallenge);

        setChallengeRequest(mergedChallenge);
        setIsRsaLoader(true);
        setRsaError(false);

        registerS2u(params);
    }

    function onChallengeSnackClosePress() {
        setRsaError(false);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
            analyticScreenName={FA_S2U_DEVICENAME}
        >
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={42}
                    paddingHorizontal={24}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                style={styles.label}
                                text={DEVICE_NAME}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={CONFIRM_DEVICE}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.info}
                                color={FADE_GREY}
                                text={YOUR_DEVICE_MSG}
                                textAlign="left"
                            />
                            <TextInput
                                onChangeText={handleKeyboardChange}
                                value={deviceName}
                                placeholder="Your device name"
                                style={styles.disabledColor}
                                underlineStyle={styles.disabledUnderlineStyle}
                                editable={false}
                                selectTextOnFocus={false}
                                maxLength={15}
                            />
                        </View>
                        <View style={styles.footer}>
                            <ActionButton
                                fullWidth
                                disabled={loading}
                                isLoading={loading}
                                borderRadius={25}
                                onPress={handleRegisterOta}
                                backgroundColor={deviceName ? YELLOW : DISABLED}
                                componentCenter={
                                    <Typo
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={deviceName ? BLACK : DISABLED_TEXT}
                                    />
                                }
                            />
                        </View>
                    </View>
                </ScreenLayout>
                {isRsaRequired && (
                    <ChallengeQuestion
                        loader={isRsaLoader}
                        display={isRsaRequired}
                        displyError={rsaError}
                        questionText={challengeQuestion}
                        onSubmitPress={onChallengeQuestionSubmitPress}
                        onSnackClosePress={onChallengeSnackClosePress}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

Device.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    disabledColor: {
        color: GRAY,
    },
    disabledUnderlineStyle: {
        borderBottomColor: PINKISH_GREY,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
    },
    label: {
        paddingVertical: 4,
    },
    meta: {
        paddingHorizontal: 12,
    },
});

export default withModelContext(Device);

import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Keyboard, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SoftInputMode from "react-native-set-soft-input-mode";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { verifyM2uUserName, m2uEnrollment } from "@services";

import {
    MEDIUM_GREY,
    ROYAL_BLUE,
    WHITE,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    YELLOW,
    SHADOW,
} from "@constants/colors";
import { FRGT_LOGIN_PWD, LOGIN_RSA_DENY } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { getUserProfile } from "@utils";
import { pushCloudLogs } from "@utils/cloudLog";
import * as DataModel from "@utils/dataModel";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { getCustomerKey, setRefreshToken } from "@utils/dataModel/utilitySecureStorage";
import useFestive from "@utils/useFestive";

import assets from "@assets";

function maskName(text) {
    if (!text) return "N/A";

    const length = text.length;
    const first = text.substring(0, 2);
    const last = text.substring(length - 2, length);
    let mask = "";

    for (let i = 0; i < length - 4; i++) {
        mask += "*";
    }

    return `${first}${mask}${last}`;
}

const Avatar = ({ imageUrl }) => (
    <Animatable.View animation="fadeInUp" delay={300} style={styles.avatarContainer}>
        <View style={styles.avatarInner}>
            <Image source={{ uri: imageUrl }} resizeMode="stretch" style={styles.avatar} />
        </View>
    </Animatable.View>
);

Avatar.propTypes = {
    imageUrl: PropTypes.string,
};

const timestamp = moment().valueOf();

function M2uLogin({ getModel, updateModel, onLoginSuccess, onLoginCancelled }) {
    const [secureDetails, setSecureDetails] = useState(null);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { mdipS2uEnable } = getModel("s2uIntrops");
    const { username } = getModel("user");
    const { isFestiveFlow, supsonic, isTapTasticReady } = getModel("misc");
    const challengeParams = useRef({});
    const { festiveAssets } = useFestive();
    // const toastRef = useRef();
    const [state, setState] = useState({
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    });
    const initialState = {
        isRSARequired: false,
        challengeQuestion: "",
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    };

    function handleLoginSuccess(data) {
        // reset the festive flow flag
        if (isFestiveFlow) {
            updateModel({
                misc: {
                    isFestiveFlow: false,
                },
            });
        }

        typeof onLoginSuccess === "function" && onLoginSuccess(data);
    }

    function handleLoginCancelled(reason) {
        // reset the festive flow flag
        if (isFestiveFlow) {
            updateModel({
                misc: {
                    isFestiveFlow: false,
                },
            });
        }

        typeof onLoginCancelled === "function" && onLoginCancelled(reason);
    }

    async function login() {
        if (!password.length) {
            setError("Password cannot be left empty.");
            return;
        }

        if (password.length < 6) {
            setError("Please enter valid Maybank2u password.");
            return;
        }

        if (password) {
            Keyboard.dismiss();
            const pw = await DataModel.encryptData(password);
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            const customerKey = getCustomerKey(getModel, true);

            if (customerKey && deviceId) {
                setLoading(true);

                const params = {
                    grantType: "PASSWORD",
                    tokenType: "LOGIN",
                    username,
                    passwd: pw,
                    mobileSDKData,
                    limitApproved: false,
                };

                challengeParams.current = params;

                m2uloginServiceHandler(params, false);
                //If any error push to AES cloudwatch
                pushCloudLogs({ getModel });
            }
        }
    }

    async function m2uloginServiceHandler(params, token) {
        try {
            const response = await m2uEnrollment(params, token, false, true);
            if (response && response.data) {
                const {
                    access_token,
                    refresh_token,
                    contact_number,
                    ic_number,
                    cus_segment,
                    cus_type,
                    cus_name,
                    isUnderCoolDown,
                    coolDownPeriod,
                } = response.data;

                setState({
                    isRSARequired: false,
                    isRSALoader: false,
                });

                updateModel({
                    auth: {
                        token: access_token,
                        refreshToken: refresh_token,
                        isPostLogin: true,
                        isPostPassword: true,
                    },
                    m2uDetails: {
                        m2uPhoneNumber: contact_number,
                    },
                    user: {
                        icNumber: ic_number,
                        cus_type,
                        soleProp: cus_type === "02",
                        cus_segment,
                        cus_name,
                    },
                    qrPay: {
                        authenticated: true,
                    },
                    ota: {
                        isUnderCoolDown,
                        coolDownPeriod,
                    },
                });

                setPassword("");

                setRefreshToken(refresh_token);

                setLoading(false);
                Keyboard.dismiss();
                handleLoginSuccess(response.data);
                if (mdipS2uEnable) {
                    s2uSlientChannelDereg(cus_segment);
                }
            }
        } catch (error) {
            setLoading(false);
            Keyboard.dismiss();

            callRSAErrorHandler(error);
        }
    }

    function s2uSlientChannelDereg(s2uFlag) {
        /**
         * cus_segment flag will return 0,1,2,3 after enter password from Host
         * 0 - s2u not registered
         * 1 - s2u registered in RMBP
         * 2 - s2u registered in MAYA
         * 3 - s2u registered in Both MAYA and RMBP, Need to show popup to dereg RMBP, only one time it will happen when merge
         */
        if (s2uFlag) {
            console.log("s2uFlag is ", s2uFlag);
            switch (s2uFlag) {
                case "0":
                case "1":
                    /** Need to clear only app s2u data*/
                    s2uClearLocalData();
                    break;
                case "2":
                    /**
                     * 2 - s2u registered in MAYA, API to check,diff hardware id means dereg
                     */
                    //callS2uCheckSetting();
                    //currently only one device need to uncommand when multiple(3) device support
                    console.log("s2u registered in MAYA");
                    break;
                case "3":
                    /**
                     * 3 - s2u registered in both MAYA and RMBP, show popup to dereg RMBP
                     */
                    updateModel({
                        ui: {
                            showS2uDeregPopup: true,
                        },
                    });
                    break;
                default:
                    console.log("s2uFlag is 3");
                    break;
            }
        }
    }

    async function s2uClearLocalData() {
        await AsyncStorage.multiRemove([
            "isOtaEnabled",
            "isUnderCoolDown",
            "mdipCounter",
            "otaHotp",
            "otaTotp",
            "deviceKeys",
            "serverPublicKey",
            "otaDeviceId",
        ]);
        // clear the context
        updateModel({
            ota: {
                isEnabled: false,
                isUnderCoolDown: false,
                deviceId: null,
                mdipCounter: 0,
                hOtp: null,
                tOtp: null,
                serverPublicKey: null,
                devicePublicKey: null,
                deviceSecretKey: null,
                nonce: "",
                cipherText: "",
            },
        });
        console.log("ota is cleared");
    }
    //currently only one device need to uncommand when multiple(3) device support
    /*
    async function callS2uCheckSetting() {
        console.log("callS2uCheckSetting");
        const { deviceInformation, deviceId } = getModel("device");
        let mobileSDK = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        mobileSDK.hardwareID = deviceId; //s2u android 10 and above, same as s2u reg
        const params = {
            app_id: APP_ID,
            function_code: "FN00005",
            mobileSDKData: mobileSDK,
        };

        try {
            const response = await checkS2uSettings(JSON.stringify(params));
            console.log(response);
            if (response && response.data && response.data.text.toLowerCase() === "success") {
                if (response.data.payload && response.data.payload.length) {
                    const { hardware_id } = response.data.payload[0];
                    if (hardware_id && hardware_id !== deviceId) {
                        s2uClearLocalData();
                    }
                }
            }
        } catch (error) {
            console.tron.log("fail when retrieving checkS2uSettings ");
        }
    }*/

    async function callRSAErrorHandler(err) {
        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428

            challengeParams.current = {
                ...challengeParams.current,
                challenge: err.error.challenge,
            };

            setState({
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: err.error.challenge.questionText,
                RSACount: state.RSACount + 1,
                RSAError: state.RSACount > 0,
            });
        } else if (err.status === 423) {
            console.log("423:", err);
            setState({
                isRSARequired: false,
                isRSALoader: false,
            });
        } else if (err.status === 422) {
            /**
             * RSA Deny. For deny we close the screen and navigate to deny screen
             */
            // reset the festive flow flag
            if (isFestiveFlow) {
                updateModel({
                    misc: {
                        isFestiveFlow: false,
                    },
                });
            }

            typeof onLoginCancelled === "function" && onLoginCancelled(LOGIN_RSA_DENY, err.error);
        } else {
            setState({
                isRSARequired: false,
                isRSALoader: false,
            });

            if (err?.error?.error !== "deactivated") {
                showErrorToast({
                    message: err?.message ?? "Error",
                });
            }
        }
    }
    function onChallengeSnackClosePress() {
        setState({ ...initialState });
    }

    async function onChallengeQuestionSubmitPress(answer) {
        // const { challenge } = state;
        const mergedChallenge = {
            ...challengeParams.current,
            challenge: {
                ...challengeParams.current.challenge,
                answer,
            },
        };

        setState({
            ...state,
            isRSALoader: true,
            RSAError: false,
        });

        m2uloginServiceHandler(mergedChallenge, true);
    }

    function handleClose() {
        handleLoginCancelled("User cancelled auth");
    }

    function handleSubmitInput() {
        login();
    }

    function handleUpdateInput(text) {
        error && setError("");
        setPassword(text);
    }

    function handleForgotPassword() {
        typeof onLoginCancelled === "function" && onLoginCancelled(FRGT_LOGIN_PWD);
    }

    const verifyUsername = useCallback(async () => {
        if (username) {
            try {
                // verify username API
                const response = await verifyM2uUserName(true, username);

                if (response) {
                    const { data } = response;

                    setSecureDetails({
                        secureImage:
                            (data && data?.url) ??
                            "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                        securePhrase: (data && data?.caption) ?? "I'm cool",
                    });
                }
            } catch (error) {
                setSecureDetails({
                    secureImage:
                        "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                    securePhrase: "I'm cool",
                });
            }
        } else {
            // we can't continue
            handleMissingUsername();
        }
    }, [username, onLoginCancelled]);

    const handleMissingUsername = useCallback(async () => {
        try {
            const response = await getUserProfile(updateModel, onLoginCancelled);
            console.log("[getUserProfile] response >> ", response);
        } catch (error) {
            console.log("[HandleMissingUsername] >> error", error);
            onLoginCancelled("Missing username");
        }
    });

    const handleKeyboardShow = useCallback(() => {
        if (Platform.OS === "android") SoftInputMode.set(SoftInputMode.ADJUST_PAN);
    }, []);

    useEffect(() => {
        verifyUsername();
        challengeParams.current = {};

        return () => {
            setState({
                isRSALoader: false,
                RSAError: false,
                isRSARequired: false,
            });
        };
    }, [verifyUsername, handleKeyboardShow]);

    const bgImage = {
        uri: `${ENDPOINT_BASE}/wallet/bankAndTelcoImages/avatar/festive_images/raya_festival-01.jpg?date=${timestamp}`,
        cache: "reload",
        headers: {
            Pragma: "no-cache",
        },
    };

    return (
        /**
         * modal are too problematic in Android in terms of device height inconsistency.
         * change to animated view for remedy
         * */
        <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.loginContainer}
            useNativeDriver
        >
            <ScreenContainer
                showLoaderModal={loading}
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
            >
                <>
                    <Animatable.View
                        animation="fadeInDown"
                        delay={300}
                        useNativeDriver
                        style={{
                            ...StyleSheet.absoluteFill,
                        }}
                    >
                        <CacheeImageWithDefault
                            image={festiveAssets?.login.background}
                            resizeMode="stretch"
                            style={styles.bgImg}
                        />
                    </Animatable.View>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <View style={styles.headerCenterContainer}>
                                        <Image
                                            source={assets.maybankLogo}
                                            style={styles.headerCenterImg}
                                        />
                                    </View>
                                }
                                headerRightElement={
                                    <HeaderCloseButton isWhite={false} onPress={handleClose} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <KeyboardAwareScrollView enableOnAndroid={false}>
                                <View style={styles.container}>
                                    <View style={styles.meta}>
                                        {secureDetails?.secureImage && (
                                            <Avatar imageUrl={secureDetails?.secureImage} />
                                        )}
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={400}
                                            useNativeDriver
                                        >
                                            <Typo
                                                fontSize={20}
                                                fontWeight="600"
                                                lineHeight={32}
                                                text={maskName(username)}
                                            />
                                        </Animatable.View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            delay={500}
                                            style={styles.securePhrase}
                                            useNativeDriver
                                        >
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={secureDetails?.securePhrase ?? ""}
                                            />
                                        </Animatable.View>
                                    </View>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        delay={600}
                                        style={styles.inputContainer}
                                        useNativeDriver
                                    >
                                        <Typo
                                            fontSize={20}
                                            fontWeight="300"
                                            lineHeight={28}
                                            style={styles.label}
                                            text="Enter your password"
                                            textAlign="left"
                                        />
                                        <TextInput
                                            autoFocus
                                            secureTextEntry
                                            enablesReturnKeyAutomatically
                                            isLoading={loading}
                                            isValidate
                                            isValid={!error}
                                            errorMessage={error}
                                            importantForAutofill="no"
                                            returnKeyType="next"
                                            value={password}
                                            onChangeText={handleUpdateInput}
                                            onSubmitEditing={handleSubmitInput}
                                            onFocus={handleKeyboardShow}
                                            textContentType={supsonic ? "password" : "oneTimeCode"} // try to force no save password offering by iOS
                                            placeholder="M2U password"
                                            autoCapitalize="none"
                                            maxLength={12}
                                        />
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={handleForgotPassword}
                                        >
                                            <Typo
                                                color={ROYAL_BLUE}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                style={styles.forgotDetails}
                                                text="Forgot Password"
                                                textAlign="left"
                                            />
                                        </TouchableOpacity>
                                    </Animatable.View>
                                </View>

                                {state.isRSARequired && (
                                    <ChallengeQuestion
                                        loader={state.isRSALoader}
                                        display={state.isRSARequired}
                                        displyError={state.RSAError}
                                        questionText={state.challengeQuestion}
                                        onSubmitPress={onChallengeQuestionSubmitPress}
                                        onSnackClosePress={onChallengeSnackClosePress}
                                    />
                                )}
                            </KeyboardAwareScrollView>
                            <FixedActionContainer hideGradient={isTapTasticReady}>
                                <Animatable.View
                                    animation="fadeInUp"
                                    delay={700}
                                    style={styles.footer}
                                    useNativeDriver
                                >
                                    <ActionButton
                                        disabled={loading || !!error || !password.length}
                                        isLoading={loading}
                                        fullWidth
                                        borderRadius={25}
                                        onPress={handleSubmitInput}
                                        backgroundColor={
                                            loading || error || !password.length ? DISABLED : YELLOW
                                        }
                                        componentCenter={
                                            <Typo
                                                color={
                                                    loading || error || !password.length
                                                        ? DISABLED_TEXT
                                                        : BLACK
                                                }
                                                text="Continue"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </Animatable.View>
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        </Animatable.View>
    );
}

M2uLogin.propTypes = {
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    onLoginSuccess: PropTypes.func,
    onLoginFailed: PropTypes.func,
    onLoginCancelled: PropTypes.func,
};

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 40,
        height: 78,
        width: 78,
    },
    avatarContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        elevation: 12,
        height: 80,
        justifyContent: "center",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 80,
    },
    avatarInner: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        padding: 2,
        width: "100%",
    },
    bgImg: { height: 319, width: "100%" },
    container: {
        flex: 1,
        paddingTop: 18,
    },
    footer: { flexDirection: "row", width: "100%" },
    forgotDetails: {
        paddingVertical: 24,
    },
    headerCenterContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    headerCenterImg: { height: 23, width: 116 },
    inputContainer: { paddingHorizontal: 36 },
    label: {
        paddingBottom: 8,
        paddingTop: 24,
    },
    loginContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    meta: {
        alignItems: "center",
    },
    securePhrase: {
        borderColor: BLACK,
        borderRadius: 28,
        borderWidth: 1,
        marginTop: 4,
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
});

export default withModelContext(M2uLogin);

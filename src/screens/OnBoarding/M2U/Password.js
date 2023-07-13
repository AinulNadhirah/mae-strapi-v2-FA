import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    DASHBOARD,
    FORGOT_LOGIN_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ManageDevices from "@components/ManageDevices";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { getDevices, getPublicKey, loginPassword } from "@services/api/methods";

import {
    MEDIUM_GREY,
    ROYAL_BLUE,
    WHITE,
    BLACK,
    DISABLED,
    YELLOW,
    DISABLED_TEXT,
    SHADOW,
} from "@constants/colors";
import { FA_LOGIN_PASSWORD, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { encryptData } from "@utils/encyrpt";
import { errorMessageMap } from "@utils/errorMap";

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
    <View style={styles.avatarContainer}>
        <View style={styles.avatarInner}>
            <Image source={{ uri: imageUrl }} resizeMode="stretch" style={styles.avatar} />
        </View>
    </View>
);

Avatar.propTypes = {
    imageUrl: PropTypes.string,
};

function OnboardingPassword({ navigation, route, api }) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [isManageDevice, setIsManageDevice] = useState(false);
    const [error, setError] = useState("");
    const [state, setState] = useState({
        isRSARequired: false,
        challengeQuestion: "",
        challengeRequest: {},
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    });
    const { getModel } = useModelController();
    const challengeParams = useRef({});
    const encryptedPassword = useRef(null);
    const registeredPhone = useRef(null);
    const { deviceId, deviceInformation } = getModel("device");
    const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);

    const initialState = {
        isRSARequired: false,
        challengeQuestion: "",
        challengeRequest: {},
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,
    };

    const isMaeOnboarding = route?.params?.isMaeOnboarding ?? false;
    const screenName = route?.params?.screenName ?? "";
    const username = route?.params?.username;

    async function progressOnboarding() {
        setIsManageDevice(false);

        if (isMaeOnboarding) {
            navigation.navigate("MAEModuleStack", {
                screen: screenName,
                params: {
                    username,
                    pw: encryptedPassword.current,
                    phone: registeredPhone.current,
                    filledUserDetails: route.params?.filledUserDetails,
                },
            });
        } else {
            navigation.navigate("OnboardingM2uCreatePin", {
                username,
                pw: encryptedPassword.current,
                phone: registeredPhone.current,
                screenName,
                filledUserDetails: route.params?.filledUserDetails,
            });
        }
    }

    async function checkRegisteredDeviceList() {
        const params = {
            username,
            mobileSDKData,
        };

        setLoading(true);

        try {
            const response = await getDevices(api, params);

            if (response && response.data) {
                const { resultCount } = response.data;

                if (resultCount > 0) {
                    setIsManageDevice(true);
                    setLoading(false);
                } else {
                    // addNewDevice();
                    // proceed
                    progressOnboarding();
                }
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function requestForKey() {
        try {
            const request = await getPublicKey(api);

            if (request) {
                const { message } = request?.data;

                return message;
            } else {
                throw new Error();
            }
        } catch (error) {
            return error;
        }
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
            // encrypt the password
            let pubKey = await AsyncStorage.getItem("publicKey");

            if (!pubKey) {
                pubKey = await requestForKey();

                if (!pubKey) {
                    throw new Error("Failed retrieving the public key");
                } else {
                    await AsyncStorage.setItem("publicKey", pubKey);
                }
            }

            const pw = await encryptData(password, pubKey);
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
            const params = {
                m2uPasswd: pw,
                m2uUsername: username,
                mobileSDKData, // Required For RSA,
                attestationPayload: route?.params?.attestationPayload ?? "",
            };
            encryptedPassword.current = pw;

            setLoading(true);

            challengeParams.current = params;

            loginService(params);
        }
    }

    async function loginService(params) {
        // try login
        try {
            const response = await loginPassword(api, params);
            // const response = await onboardingLogin(params, true);

            if (response) {
                const { message, code } = response.data;
                registeredPhone.current = message.trim();

                // clear the password field
                setPassword("");

                if (code === 0 && message) {
                    setState({
                        isRSARequired: false,
                        isRSALoader: false,
                    });

                    // check registered device
                    checkRegisteredDeviceList();
                }
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            callRSAErrorHandler(error);
        }
    }

    function callRSAErrorHandler(err) {
        if (err.status == 428) {
            // Display RSA Challenge Questions if status is 428
            setState({
                ...state,
                challenge: err.error.challenge,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: err.error.challenge.questionText,
                RSACount: state.RSACount + 1,
                RSAError: state.RSACount > 0,
            });
        } else if (err.status == 423) {
            console.log("423:", err);
            setState({
                ...state,
                isRSALoader: false,
                RSAError: false,
                isSubmitDisable: true,
                isRSARequired: false,
            });
        } else if (err.status == 422) {
            /**
             * RSA Deny
             */
            const { statusDescription, serverDate } = err.error;

            const params = {
                statusDescription,
                additionalStatusDescription: "",
                serverDate,
                nextParams: { screen: DASHBOARD },
                nextModule: TAB_NAVIGATOR,
                nextScreen: "Tab",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params,
            });
        } else {
            const error = err?.error?.error;

            if (!["tagblock", "rsacqblock", "locked", "deactivated"].includes(error)) {
                console.log("ERROR", err);
                showErrorToast({
                    message: errorMessageMap(err?.error) || "Something is wrong. Try again later.",
                });
            }
        }
    }

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    function handleCloseManageDevice() {
        setIsManageDevice(false);
        handleClose();
    }

    function handleSubmitInput() {
        login();
    }

    function handleForgotPassword() {
        console.warn(route.params);
        navigation.navigate("Onboarding", {
            screen: FORGOT_LOGIN_DETAILS,
            params: {
                ...route.params,
            },
        });
    }

    function handleUpdateInput(text) {
        error && setError("");
        setPassword(text);
    }

    function onChallengeSnackClosePress() {
        setState({ ...initialState });
    }

    async function onChallengeQuestionSubmitPress(answer) {
        const { challenge } = state;
        const mergedChallenge = {
            ...challengeParams.current,
            challenge: {
                ...challenge,
                answer,
            },
        };

        setState((prevState) => ({
            ...prevState,
            isRSALoader: true,
            RSAError: false,
        }));

        loginService(mergedChallenge);
    }

    useEffect(() => {
        challengeParams.current = {};

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOGIN_PASSWORD,
        });

        return () => {
            setState({
                isRSALoader: false,
                RSAError: false,
                isSubmitDisable: true,
                isRSARequired: false,
            });
        };
    }, []);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView enableOnAndroid={false}>
                            <View style={styles.container}>
                                <View style={styles.meta}>
                                    <Avatar imageUrl={route.params?.secureImage} />
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={32}
                                        text={maskName(route.params?.username ?? "NA")}
                                    />
                                    <View style={styles.securePhrase}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={route.params?.securePhrase ?? ""}
                                        />
                                    </View>
                                </View>
                                <View>
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
                                        isValidate
                                        isValid={!error}
                                        errorMessage={error}
                                        importantForAutofill="no"
                                        returnKeyType="next"
                                        autoCapitalize="none"
                                        value={password}
                                        onChangeText={handleUpdateInput}
                                        onSubmitEditing={handleSubmitInput}
                                        textContentType="oneTimeCode"
                                        maxLength={12}
                                        testID="password"
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
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={loading || !!error || !password.length}
                                isLoading={loading}
                                fullWidth
                                borderRadius={25}
                                onPress={handleSubmitInput}
                                testID="password_submit"
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
                        </FixedActionContainer>

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
                    </>
                </ScreenLayout>
                {isManageDevice && (
                    <ManageDevices
                        isLoading={loading}
                        onProceed={progressOnboarding}
                        onClose={handleCloseManageDevice}
                        onBoardUsername={username}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

OnboardingPassword.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    api: PropTypes.object,
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
    container: {
        flex: 1,
        paddingHorizontal: 36,
        paddingTop: 18,
    },
    forgotDetails: {
        paddingVertical: 24,
    },
    label: {
        paddingBottom: 8,
        paddingTop: 24,
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

export default withApi(OnboardingPassword);

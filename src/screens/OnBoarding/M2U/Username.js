import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import RNSafetyNet from "react-native-safety-net";

import { TAB_NAVIGATOR, FORGOT_LOGIN_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { verifyM2uUserName } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, ROYAL_BLUE, DISABLED, YELLOW, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_LOGIN_USERNAME_FTL,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FRGT_LOGIN_DTLS,
} from "@constants/strings";

import { m2uUsernameRegex } from "@utils/dataModel";

function OnboardingUsername({ navigation, route, getModel }) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const isMaeOnboarding = route?.params?.isMaeOnboarding ?? false;
    const skipSecurityImage = route?.params?.skipSecurityImage ?? false;
    const screenName = route?.params?.screenName;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_LOGIN_USERNAME_FTL,
        });
    }, []);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.canGoBack() && navigation.navigate(TAB_NAVIGATOR);
    }

    async function attestationCheckAndNavigate(data, nonce) {
        try {
            const safetyNet = await RNSafetyNet.getSafetyNetAttestationToken(nonce);

            if (safetyNet) {
                navigation.navigate("OnboardingM2uSecurityImage", {
                    username,
                    secureImage:
                        (data && data?.url) ??
                        "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                    securePhrase: (data && data?.caption) ?? "I'm cool",
                    filledUserDetails: route.params?.filledUserDetails,
                    isMaeOnboarding,
                    screenName,
                    attestationPayload: safetyNet.JW_TOKEN,
                });
            } else {
                throw new Error();
            }
        } catch (error) {
            navigation.navigate("OnboardingM2uSecurityImage", {
                username,
                secureImage:
                    (data && data?.url) ??
                    "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                securePhrase: (data && data?.caption) ?? "I'm cool",
                filledUserDetails: route.params?.filledUserDetails,
                isMaeOnboarding,
                screenName,
                attestationPayload: "",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitInput() {
        if (username.length < 6 || !m2uUsernameRegex(username)) {
            setError("Please enter valid Maybank2u username");
            return;
        }

        if (username) {
            const { snEnabled } = getModel("misc");

            setLoading(true);

            try {
                // verify username API
                const response = await verifyM2uUserName(false, username);

                if (response) {
                    const { data } = response;
                    const nonce = data?.nonce;

                    if (skipSecurityImage) {
                        setLoading(false);
                        navigation.navigate("OnboardingM2uPassword", {
                            username,
                            filledUserDetails: route.params?.filledUserDetails,
                            isMaeOnboarding,
                            screenName,
                        });
                    } else {
                        // go to security image verification
                        if (Platform.OS === "android" && !__DEV__ && snEnabled) {
                            attestationCheckAndNavigate(data, nonce);
                        } else {
                            setLoading(false);
                            navigation.navigate("OnboardingM2uSecurityImage", {
                                username,
                                secureImage:
                                    (data && data?.url) ??
                                    "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                                securePhrase: (data && data?.caption) ?? "I'm cool",
                                filledUserDetails: route.params?.filledUserDetails,
                                isMaeOnboarding,
                                screenName,
                            });
                        }
                    }
                }
            } catch (err) {
                if (Platform.OS === "android" && !__DEV__ && snEnabled) {
                    attestationCheckAndNavigate(null, "");
                } else {
                    setLoading(false);

                    navigation.navigate("OnboardingM2uSecurityImage", {
                        username,
                        secureImage:
                            "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg",
                        securePhrase: "I'm cool",
                        nonce: "",
                    });
                }
            }
        }
    }

    function handleUpdateUsername(text) {
        error && setError("");
        setUsername(text);
    }

    function handleNotMine() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOGIN_USERNAME_FTL,
            [FA_ACTION_NAME]: FRGT_LOGIN_DTLS,
        });
        // Navigate to Forgot Login Details flow
        navigation.navigate(FORGOT_LOGIN_DETAILS, {
            filledUserDetails: route.params?.filledUserDetails,
            isMaeOnboarding,
            screenName,
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                <HeaderBackButton onPress={handleBack} testID="go_back" />
                            }
                            headerRightElement={
                                <HeaderCloseButton onPress={handleClose} testID="close" />
                            }
                        />
                    }
                    useSafeArea
                >
                    <>
                        <View style={styles.container} testID="onboarding_username">
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Login to Maybank2u"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Please enter your username"
                                textAlign="left"
                            />
                            <TextInput
                                autoFocus
                                autoCorrect={false}
                                autoCapitalize="none"
                                isLoading={loading}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                                enablesReturnKeyAutomatically
                                importantForAutofill="no"
                                returnKeyType="next"
                                value={username}
                                onSubmitEditing={handleSubmitInput}
                                onChangeText={handleUpdateUsername}
                                testID="onboarding_username_input"
                            />
                            <Pressable
                                onPress={handleNotMine}
                                activeOpacity={0.8}
                                testID="onboarding_username_forgot_login_details"
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    style={styles.forgotDetails}
                                    text="Forgot Login Details"
                                    textAlign="left"
                                />
                            </Pressable>
                        </View>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={loading || !!error || !username.length}
                                enabled={false}
                                isLoading={loading}
                                fullWidth
                                borderRadius={25}
                                onPress={handleSubmitInput}
                                backgroundColor={
                                    loading || !!error || !username.length ? DISABLED : YELLOW
                                }
                                componentCenter={
                                    <Typo
                                        color={
                                            loading || !!error || !username.length
                                                ? DISABLED_TEXT
                                                : BLACK
                                        }
                                        text="Continue"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                                testID="onboarding_username_continue"
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

OnboardingUsername.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    forgotDetails: {
        paddingVertical: 24,
    },
    label: {
        paddingBottom: 24,
        paddingTop: 8,
    },
});

export default withModelContext(OnboardingUsername);

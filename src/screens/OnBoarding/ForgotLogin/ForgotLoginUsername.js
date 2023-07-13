import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import {
    ON_BOARDING_M2U_PASSWORD,
    SETTINGS_MODULE,
    CHANGE_M2U_PASSWORD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { verifyM2uUserName } from "@services";

import { MEDIUM_GREY, WHITE, SHADOW, YELLOW, ROYAL_BLUE } from "@constants/colors";
import { LOGIN_NOW, RESET_PASSWORD_LBL } from "@constants/strings";
import { VERIFY_USERNAME } from "@constants/url";

const Avatar = ({ imageUrl }) => (
    <View style={Style.avatarContainer}>
        <View style={Style.avatarInner}>
            <Image source={{ uri: imageUrl }} resizeMode="stretch" style={Style.avatar} />
        </View>
    </View>
);

Avatar.propTypes = {
    imageUrl: PropTypes.string,
};

function ForgotLoginUsername({ route, navigation }) {
    const [username, setUsername] = useState(route?.params?.username ?? null);
    const [secImage, setSecImage] = useState(
        "https://www.maybank2u.com.my/maybank_gif/adapt/images/AnimalsWildlife/IAN_CL1_PX01220.jpg"
    );
    const [secPhrase, setSecPhrase] = useState("I'm cool");

    useEffect(() => {
        if (username) callVerifyM2uUserName();
    }, [username]);

    const callVerifyM2uUserName = async () => {
        console.log("[ForgotLoginUsername] >> [callVerifyM2uUserName]");

        try {
            // verify username API
            const response = await verifyM2uUserName(false, username);
            if (response) {
                const { data } = response;
                const secureImage = (data && data?.url) ?? null;
                const securePhrase = (data && data?.caption) ?? null;

                if (secureImage) setSecImage(secureImage);
                if (securePhrase) setSecPhrase(securePhrase);
            } else {
                console.log("[ForgotLoginUsername][callVerifyM2uUserName] >> Error");
            }
        } catch (error) {
            console.log("[ForgotLoginUsername][callVerifyM2uUserName] >> Exception:", error);
        }
    };

    const onResetPassword = () => {
        console.log("[ForgotLoginUsername] >> [onResetPassword]");
        navigation.navigate(SETTINGS_MODULE, {
            screen: CHANGE_M2U_PASSWORD,
            params: {
                ...route.params,
                isFromForgotPassword: true,
                refNo: route?.params?.refNo ?? null,
                username,
                isAccessNumber: route?.params?.isAccessNumber ?? false,
                isMAEAccount: route?.params?.isMAEAccount ?? false,
            },
        });
    };

    const onLoginNow = () => {
        console.log("[ForgotLoginUsername] >> [onLoginNow]");

        if (username) {
            // Navigate to password screen
            navigation.navigate(ON_BOARDING_M2U_PASSWORD, {
                ...route.params,
                username,
                secureImage: secImage,
                securePhrase: secPhrase,
            });
        }
    };

    const onCloseTap = () => {
        console.log("[ForgotLoginUsername] >> [onCloseTap]");
        navigation.goBack();
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
                }
                paddingHorizontal={24}
                paddingBottom={10}
                paddingTop={0}
                useSafeArea
            >
                <>
                    <View style={Style.container}>
                        <View style={Style.innerContainer}>
                            {/* Security Image  */}
                            <Avatar imageUrl={secImage ?? ""} />

                            {/* Your username is */}
                            <Typo
                                fontSize={14}
                                lineHeight={32}
                                text="Your username is"
                                style={Style.usernameLabel}
                            />

                            {/* Username */}
                            {username && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="600"
                                    lineHeight={32}
                                    text={username}
                                />
                            )}
                        </View>
                    </View>
                    <View style={Style.bottomContainer}>
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            onPress={onResetPassword}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={RESET_PASSWORD_LBL}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                        <TouchableOpacity onPress={onLoginNow} activeOpacity={0.8}>
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={LOGIN_NOW}
                                textAlign="left"
                                style={Style.loginNowLabel}
                            />
                        </TouchableOpacity>
                    </View>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ForgotLoginUsername.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Style = StyleSheet.create({
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

    bottomContainer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    container: {
        flex: 1,
    },

    innerContainer: {
        alignItems: "center",
    },

    loginNowLabel: {
        paddingVertical: 24,
    },

    usernameLabel: {
        marginBottom: 10,
        marginTop: 20,
    },
});

export default ForgotLoginUsername;

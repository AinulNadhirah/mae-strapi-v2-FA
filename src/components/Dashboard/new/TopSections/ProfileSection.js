import { useNavigation } from "@react-navigation/core";
import PropTypes from "prop-types";
import React from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

import useLogout from "@screens/Dashboard/useLogout";

import { TouchableSpring } from "@components/Animations/TouchableSpring";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { ARSENIC, BLACK, INDEPENDENCE, SHADOW, WHITE } from "@constants/colors";

import { insertSeparators } from "@utils/array";

import Images from "@assets";

const ProfileSection = ({ onPressSetting, isPostLogin, showNotificationsIcon }) => {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const { fullName: profileName, profileImage } = getModel("user");
    const { handleLogout } = useLogout();

    const onPressNotifications = () => {
        navigation.navigate("Notifications");
    };

    const onPressLogout = () => {
        handleLogout && handleLogout();
    };

    const icons = [
        showNotificationsIcon
            ? {
                  id: "notifications",
                  source: require("@assets/dashboard/notifications.png"),
                  onPress: onPressNotifications,
                  style: {
                      height: 24,
                      width: 24,
                      tintColor: ARSENIC,
                  },
              }
            : {},
        {
            id: "login",
            source: isPostLogin ? Images.logout : Images.login,
            text: isPostLogin ? "Logout" : "Login",
            onPress: onPressLogout,
            style: {
                height: 18,
                width: 19,
                tintColor: ARSENIC,
            },
        },
    ];
    return (
        <View style={styles.container}>
            <View style={styles.userContainer}>
                <TouchableSpring
                    scaleTo={0.9}
                    tension={150}
                    onPress={onPressSetting}
                    testID={"profile_settings_button"}
                >
                    {({ animateProp }) => (
                        <View style={styles.profileContainer}>
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            scale: animateProp,
                                        },
                                    ],
                                }}
                            >
                                <View style={styles.profileAvatarContainer}>
                                    <Image
                                        source={
                                            profileImage
                                                ? { uri: profileImage }
                                                : Images.dashboard.topSection.avatarDefault
                                        }
                                        style={styles.profileAvatarImg}
                                    />
                                </View>
                                <View style={styles.iconContainer}>
                                    <Image
                                        source={Images.iconSettingsWhite}
                                        style={styles.iconStyle}
                                    />
                                </View>
                            </Animated.View>
                        </View>
                    )}
                </TouchableSpring>

                <View>
                    <Typo
                        text={`Hello${profileName ? "," : "!"}`}
                        fontWeight="normal"
                        fontSize={13}
                        lineHeight={15}
                        textAlign="left"
                    />
                    {!!profileName && (
                        <Typo
                            text={profileName}
                            fontWeight="600"
                            fontSize={15}
                            lineHeight={18}
                            textAlign="left"
                            numberOfLines={1}
                        />
                    )}
                </View>
            </View>
            <View style={styles.rightIconContainer}>
                {insertSeparators(
                    icons.map((item, index) => {
                        return (
                            <TouchableSpring
                                key={`icon-${index}`}
                                testID={item.id}
                                scaleTo={0.9}
                                tension={150}
                                onPress={item.onPress}
                            >
                                {({ animateProp }) => (
                                    <Animated.View
                                        style={[
                                            {
                                                transform: [
                                                    {
                                                        scale: animateProp,
                                                    },
                                                ],
                                                alignItems: "center",
                                            },
                                        ]}
                                    >
                                        <Image source={item.source} style={item.style} />
                                        {item.text && (
                                            <>
                                                <SpaceFiller height={4} />
                                                <Typo
                                                    fontSize={11}
                                                    fontWeight="500"
                                                    lineHeight={12}
                                                    text={item.text}
                                                    color={INDEPENDENCE}
                                                />
                                            </>
                                        )}
                                    </Animated.View>
                                )}
                            </TouchableSpring>
                        );
                    }),
                    (index) => {
                        return <SpaceFiller key={`separator-${index}`} width={24} />;
                    }
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center" },
    userContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
    rightIconContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    profileAvatarContainer: {
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 18,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 12,
        height: 36,
        overflow: "hidden",
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 12,
        width: 36,
    },
    profileAvatarImg: {
        height: 32,
        width: 32,
    },
    profileContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingRight: 24,
        paddingBottom: 4,
    },
    iconContainer: {
        top: 16,
        backgroundColor: WHITE,
        height: 24,
        width: 24,
        borderRadius: 24 / 2,
        position: "absolute",
        bottom: 0,
        right: -14,
        alignItems: "center",
        justifyContent: "center",
        elevation: 14,
    },
    iconStyle: { tintColor: BLACK, width: 16, height: 16 },
});

ProfileSection.propTypes = {
    onPressSetting: PropTypes.func,
    isPostLogin: PropTypes.bool,
    showNotificationsIcon: PropTypes.bool,
};

export default ProfileSection;

import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Platform, BackHandler } from "react-native";
import * as Animatable from "react-native-animatable";
import RNExitApp from "react-native-exit-app";

import { SETTINGS_MODULE, TAB_NAVIGATOR } from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, FADE_GREY, YELLOW, ROYAL_BLUE, LIGHT_GREY, WHITE } from "@constants/colors";
import {
    BACK_TO_DASHBOARD,
    BACK_TO_HOME,
    CALL_US_NOW,
    DEACTIVATE_LOGOUT_DESC,
    DEACTIVATE_LOGOUT_TITLE,
    DELETED_M2U,
    DELETE_LOGOUT_DESC,
    LOGOUT_M2U,
    REGISTER_M2U,
    QUIT_APP_HEADER,
} from "@constants/strings";

import { logoutTypeEnum } from "@utils/dataModel/utilityEnum";

import Images from "@assets";

const styles = StyleSheet.create({
    actionContainer: {
        alignItems: "center",
        flex: 0.1,
        justifyContent: "flex-end",
        paddingHorizontal: 24,
    },
    footer: {
        paddingVertical: 24,
    },
    logoutContainer: {
        flex: 1,
    },
    logoutInner: {
        alignItems: "center",
        flex: 0.9,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    logoutLogo: {
        alignItems: "center",
        height: 96,
        width: 96,
    },
    logoutMeta: {
        paddingVertical: 24,
    },
    title: {
        marginBottom: 15,
    },
});

export default function LogoutScreen({ route, navigation }) {
    const params = route?.params;
    const logoutType = params?.type;
    const [loggedOutDateTime, setLogoutDateTime] = useState("");

    const handleBackToDashboard = useCallback(() => {
        if (logoutType === logoutTypeEnum.DELETE) {
            console.log("deletedashboard");
            NavigationService.resetAndNavigateToModule("Splashscreen", "", { skipIntro: true });
        } else if (logoutType === logoutTypeEnum.DEACTIVATE) {
            console.log("Deactivate > Dashboard");
            NavigationService.resetAndNavigateToModule("Splashscreen", "", { skipIntro: true });
        } else {
            navigation.navigate(TAB_NAVIGATOR, {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                },
            });
        }
    }, [navigation]);

    const handleRegisterM2u = useCallback(() => {
        const backAction = () => {
            NavigationService.resetAndNavigateToModule("Splashscreen", "", { skipIntro: true });
        };

        const navParams = {
            source: "https://www.maybank2u.com.my/home/m2u/common/signup.do",
            title: "M2U Web",
            headerColor: LIGHT_GREY,
            backAction: backAction,
        };

        navigation.navigate("SettingsModule", {
            screen: "PdfSetting",
            params: navParams,
        });
    });

    const handleQuitApp = () => {
        Platform.OS === "ios" ? RNExitApp.exitApp() : BackHandler.exitApp();
    };

    function getText() {
        let returnObj;
        switch (logoutType) {
            case logoutTypeEnum.DELETE: {
                returnObj = { titleText: DELETED_M2U, descriptionText: DELETE_LOGOUT_DESC };
                break;
            }
            case logoutTypeEnum.DEACTIVATE: {
                returnObj = {
                    titleText: DEACTIVATE_LOGOUT_TITLE,
                    descriptionText: DEACTIVATE_LOGOUT_DESC,
                };
                break;
            }
            default:
                returnObj = { titleText: LOGOUT_M2U, descriptionText: loggedOutDateTime };
        }

        return returnObj;
    }

    function handleCallNow() {
        navigation.navigate(SETTINGS_MODULE, {
            screen: "Helpline",
        });
    }

    useEffect(() => {
        if (!loggedOutDateTime) {
            const dateNow = moment().format("dddd, DD MMM YYYY [at] h:mm A");

            setLogoutDateTime(`Logged out on ${dateNow}`);
        }
    }, [loggedOutDateTime]);

    return (
        <Animatable.View animation="fadeIn" duration={500} style={styles.logoutContainer}>
            <ScreenContainer backgroundType={"color"} backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={<View />}
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={36}
                    paddingTop={0}
                    neverForceInset={["bottom"]}
                >
                    <>
                        <View style={styles.logoutInner}>
                            <View style={styles.logoutLogo}>
                                <Image source={Images.icMAE} />
                            </View>
                            <View style={styles.logoutMeta}>
                                <Typo
                                    fontWeight="300"
                                    fontSize={20}
                                    lineHeight={28}
                                    text={getText().titleText}
                                    style={styles.title}
                                />
                                <Typo
                                    fontWeight="normal"
                                    color={FADE_GREY}
                                    fontSize={12}
                                    lineHeight={18}
                                    text={getText().descriptionText}
                                />
                            </View>
                        </View>
                        {logoutType === logoutTypeEnum.DEACTIVATE ? (
                            <>
                                <View style={styles.actionContainer}>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={24}
                                        onPress={handleCallNow}
                                        backgroundColor={WHITE}
                                        componentCenter={
                                            <Typo
                                                text={CALL_US_NOW}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                                <View style={styles.actionContainer}>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={24}
                                        onPress={handleBackToDashboard}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text={BACK_TO_HOME}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.actionContainer}>
                                    <ActionButton
                                        fullWidth
                                        borderRadius={24}
                                        onPress={handleBackToDashboard}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text={BACK_TO_DASHBOARD}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>

                                <View style={styles.footer}>
                                    <TouchableOpacity activeOpacity={0.8} onPress={handleQuitApp}>
                                        <Typo
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={QUIT_APP_HEADER}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {logoutType && (
                                    <View style={styles.footer}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={handleRegisterM2u}
                                            testID="onboarding_register_m2u"
                                        >
                                            <Typo
                                                color={ROYAL_BLUE}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={REGISTER_M2U}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>
        </Animatable.View>
    );
}

LogoutScreen.propTypes = {
    navigation: PropTypes.object,
};

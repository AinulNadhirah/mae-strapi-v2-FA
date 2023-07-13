import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import Conf from "react-native-config";
import SoundPlayer from "react-native-sound-player";
import SwitchToggle from "react-native-switch-toggle";
import SystemSetting from "react-native-system-setting";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    invokeL2,
    updateSoundPref,
    getSoundPref,
    getCampaignAnimationState,
    updateCampaignAnimationPref,
} from "@services";
import { logEvent } from "@services/analytics";
import { registerPushNotification } from "@services/pushNotifications";

import { MEDIUM_GREY, WHITE, SWITCH_GREY, SWITCH_GREEN, GREY, GARGOYLE } from "@constants/colors";
import { FA_FORM_COMPLETE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { generateHaptic } from "@utils";

import assets from "@assets";

const styles = StyleSheet.create({
    aboutContainer: {
        flex: 1,
    },
    playIcon: {
        bottom: 10,
        flex: 1,
        left: 10,
    },
    description: {
        top: 25,
        flex: 1,
        left: -126,
        flexDirection: "row",
        marginHorizontal: -80,
        marginBottom: 15,
    },
    playNotification: {
        width: 30,
        height: 30,
        flex: 1,
        bottom: -5,
    },
    rowPlaying: {
        opacity: 0.5,
    },
    settingItemChildSwitchCircle: {
        backgroundColor: WHITE,
        borderRadius: 10,
        height: 20,
        width: 20,
    },
    settingItemChildSwitchContainer: {
        backgroundColor: SWITCH_GREY,
        borderRadius: 20,
        height: 22,
        padding: 1,
        width: 40,
    },
    switchRow: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    switchRowLast: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    switchRowTTW: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    titleContainer: {
        marginBottom: 36,
        paddingHorizontal: 24,
    },
});

function Notifications({ getModel, updateModel, navigation }) {
    const [loading, setLoading] = useState(false);
    const [loadingAlert, setLoadingAlert] = useState(false);
    const [loadingAlertCampaign, setLoadingCampaign] = useState(false);

    const [fileLoaded, setLoaded] = useState(false);
    const [audioIsPlaying, setPlaying] = useState(false);
    const {
        auth: { isPostLogin, fcmToken, token },
        misc: { isPromotionsEnabled, isCustomAlertEnabled = true, isCampaignEnabled },
        user: { mobileNumber },
        device: { deviceId },
    } = getModel(["auth", "misc", "user", "device"]);
    const _onFinishedPlayingSubscription = useRef(null);
    const _onFinishedLoadingSubscription = useRef(null);
    const _onFinishedLoadingFileSubscription = useRef(null);

    const handleBack = useCallback(() => {
        navigation.canGoBack() && navigation.goBack();
    }, [navigation]);

    async function handlePressSwitch() {
        const switchStatus = !isPromotionsEnabled;

        setLoading(true);

        updateModel({
            misc: {
                isPromotionsEnabled: switchStatus,
            },
        });

        const screenName = switchStatus ? "_Enabled_Successful" : "_Disabled_Successful";
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `Settings_Notifications${screenName}`,
        });
        /**
         * notify_type
         * A: transactions and marketing
         * T: Transactions only
         */
        try {
            const notification = registerPushNotification(
                mobileNumber,
                deviceId,
                fcmToken,
                switchStatus ? "A" : "T"
            );

            if (notification) {
                showSuccessToast({
                    message: switchStatus
                        ? "Notification preferences successfully saved."
                        : "Notifications successfully disabled.",
                });
                generateHaptic("selection", true);
                await AsyncStorage.setItem("isPromotionsEnabled", switchStatus.toString());
            }
        } catch (error) {
            showErrorToast({
                message: error?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handlePressSwitchCampaign() {
        const switchStatus = !isCampaignEnabled;

        updateModel({
            misc: {
                isCampaignEnabled: switchStatus,
            },
        });

        try {
            const notification = await updateCampaignAnimationPref(
                Conf?.CAMPAIGN_TRACKER_URL,
                token,
                switchStatus
            );
            if (notification) {
                showSuccessToast({
                    message: switchStatus ? "Notification enabled." : "Notification disabled.",
                });
                generateHaptic("selection", true);
            }
        } catch (error) {
            updateModel({
                misc: {
                    isCampaignEnabled: !switchStatus,
                },
            });

            showErrorToast({
                message: error?.message || "Something went wrong.",
            });
        } finally {
            setLoadingCampaign(false);
        }
    }

    async function handlePressAlertSwitch() {
        const switchStatus = !isCustomAlertEnabled;

        setLoadingAlert(true);

        /**
         * Save the customer notification alert preferences
         */
        try {
            const updatePref = await updateSoundPref({
                customSound: switchStatus,
            });

            if (updatePref && updatePref?.data?.code === 200) {
                updateModel({
                    misc: {
                        isCustomAlertEnabled: switchStatus,
                    },
                });

                showSuccessToast({
                    message: switchStatus
                        ? "Money is in! This is our special tone to let you know you have received money."
                        : "Custom alert disabled.",
                });

                generateHaptic("selection", true);

                await AsyncStorage.setItem("isCustomAlertEnabled", switchStatus.toString());
            }
        } catch (error) {
            showErrorToast({
                message: error?.message || "Something went wrong.",
            });
        } finally {
            setLoadingAlert(false);
        }
    }

    async function playSound() {
        // check for the volumne
        try {
            const systemVol = await SystemSetting.getVolume("system");
            const musicVol = await SystemSetting.getVolume("music");

            if (systemVol > 0 && musicVol > 0) {
                setPlaying(true);

                SoundPlayer.play();
            } else {
                showInfoToast({
                    message:
                        "Please enable sound settings and increase volume to listen to the preview.",
                });
            }
        } catch (error) {
            console.log("cannot play the sound file", error);
            showErrorToast({
                message: "Error when trying to play the sound.",
            });
        }
    }

    const checkAndSetPref = useCallback(async () => {
        try {
            const userPref = await getSoundPref();

            if (userPref && userPref.data?.result?.statusCode === 200) {
                const { customSound } = userPref.data?.result;

                updateModel({
                    misc: {
                        isCustomAlertEnabled: customSound,
                    },
                });

                await AsyncStorage.setItem("isCustomAlertEnabled", customSound.toString());
            }
        } catch (e) {
            updateModel({
                misc: {
                    isCustomAlertEnabled: true,
                },
            });

            await AsyncStorage.setItem("isCustomAlertEnabled", "true");
        }
    }, [updateModel]);

    const checkCampaignAnimation = useCallback(async () => {
        try {
            const userPref = await getCampaignAnimationState(Conf?.CAMPAIGN_TRACKER_URL, token);

            // console.tron.log("Debug1","userPrefuserPref", userPref);
            if (userPref && userPref.status === 200 && userPref.data.length > 0) {
                const { campaign_notification } = userPref.data[userPref.data.length - 1];
                updateModel({
                    misc: {
                        isCampaignEnabled: campaign_notification,
                    },
                });
            }
        } catch (e) {
            updateModel({
                misc: {
                    isCampaignEnabled: true,
                },
            });
            await AsyncStorage.setItem("isCustomAlertEnabled", "true");
        }
    }, [updateModel]);

    const checkAuth = useCallback(async () => {
        try {
            const check = await invokeL2();

            if (!check) {
                throw new Error();
            }

            // setup sound pref
            checkAndSetPref();
        } catch (error) {
            handleBack();
        }
    }, [checkAndSetPref, handleBack]);

    useEffect(() => {
        if (isPostLogin) checkAndSetPref();
    }, [isPostLogin, checkAndSetPref]);

    useEffect(() => {
        if (!isPostLogin) checkAuth();
    }, [isPostLogin, checkAuth]);

    useEffect(() => {
        if (isPostLogin) checkCampaignAnimation();
    }, [isPostLogin, checkCampaignAnimation]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_Notifications",
        });
    }, []);

    useEffect(() => {
        _onFinishedPlayingSubscription.current = SoundPlayer.addEventListener(
            "FinishedPlaying",
            ({ success }) => {
                console.log("finished playing", success);
                setPlaying(false);
            }
        );
        _onFinishedLoadingSubscription.current = SoundPlayer.addEventListener(
            "FinishedLoading",
            ({ success }) => {
                console.log("finished loading", success);
                setLoaded(true);
            }
        );
        _onFinishedLoadingFileSubscription.current = SoundPlayer.addEventListener(
            "FinishedLoadingFile",
            ({ success, name, type }) => {
                console.log("finished loading file", success, name, type);
            }
        );

        SoundPlayer.loadSoundFile("mae_coin", "m4a");

        return () => {
            _onFinishedPlayingSubscription.current?.remove();
            _onFinishedLoadingSubscription.current?.remove();
            _onFinishedLoadingFileSubscription.current?.remove();
        };
    }, []);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={!isPostLogin && !fileLoaded}
        >
            <>
                {isPostLogin ? (
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={40}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                backgroundColor={GARGOYLE}
                                headerCenterElement={
                                    <Typo
                                        text="Notifications"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                            />
                        }
                        scrollable
                    >
                        <View style={styles.aboutContainer}>
                            <View style={styles.titleContainer}>
                                <Typo
                                    text="Manage notifications you receive from the app."
                                    fontWeight="300"
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign="left"
                                />
                            </View>
                            <View style={[styles.switchRow, styles.switchRowLast]}>
                                <Typo
                                    text="Promotions"
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                                {loading ? (
                                    <ActivityIndicator size="small" color={SWITCH_GREY} />
                                ) : (
                                    <SwitchToggle
                                        containerStyle={styles.settingItemChildSwitchContainer}
                                        circleStyle={styles.settingItemChildSwitchCircle}
                                        switchOn={isPromotionsEnabled}
                                        onPress={handlePressSwitch}
                                        backgroundColorOn={SWITCH_GREEN}
                                        backgroundColorOff={SWITCH_GREY}
                                        circleColorOff={WHITE}
                                        circleColorOn={WHITE}
                                        duration={200}
                                    />
                                )}
                            </View>
                            <View style={[styles.switchRow, styles.switchRowLast]}>
                                <Typo
                                    text="Money Received"
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />
                                <View style={styles.playIcon}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={playSound}
                                        disabled={audioIsPlaying}
                                        style={audioIsPlaying && styles.rowPlaying}
                                    >
                                        <Image
                                            source={assets.playNotification}
                                            style={styles.playNotification}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {loadingAlert ? (
                                    <ActivityIndicator size="small" color={SWITCH_GREY} />
                                ) : (
                                    <SwitchToggle
                                        containerStyle={styles.settingItemChildSwitchContainer}
                                        circleStyle={styles.settingItemChildSwitchCircle}
                                        switchOn={isCustomAlertEnabled}
                                        onPress={handlePressAlertSwitch}
                                        backgroundColorOn={SWITCH_GREEN}
                                        backgroundColorOff={SWITCH_GREY}
                                        circleColorOff={WHITE}
                                        circleColorOn={WHITE}
                                        duration={200}
                                    />
                                )}
                            </View>
                            <View style={[styles.switchRow, styles.switchRowTTW]}>
                                <Typo
                                    text="Tap, Track, Win Notifications"
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                />

                                <View style={styles.description}>
                                    <Typo
                                        text="You will receive notification from us every time you win an entry"
                                        fontWeight="300"
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                </View>

                                {loadingAlertCampaign ? (
                                    <ActivityIndicator size="small" color={SWITCH_GREY} />
                                ) : (
                                    <SwitchToggle
                                        containerStyle={styles.settingItemChildSwitchContainer}
                                        circleStyle={styles.settingItemChildSwitchCircle}
                                        switchOn={isCampaignEnabled}
                                        onPress={handlePressSwitchCampaign}
                                        backgroundColorOn={SWITCH_GREEN}
                                        backgroundColorOff={SWITCH_GREY}
                                        circleColorOff={WHITE}
                                        circleColorOn={WHITE}
                                        duration={200}
                                    />
                                )}
                            </View>
                        </View>
                    </ScreenLayout>
                ) : null}
            </>
        </ScreenContainer>
    );
}

Notifications.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(Notifications);

import messaging from "@react-native-firebase/messaging";
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { View, Alert, StyleSheet, Image, Linking, Platform, ScrollView } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import DeviceInfo from "react-native-device-info";
import { checkNotifications, requestNotifications, RESULTS } from "react-native-permissions";

import {
    SETTINGS_MODULE,
    ONE_TAP_AUTH_MODULE,
    PDF_VIEW,
    COMMON_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import S2UInfoCard from "@components/Cards/S2UInfoCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { otaRegistrationCount } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, WHITE, GREY, BLUE } from "@constants/colors";
import {
    ALLOW,
    ALLOW_PERMISSIONS_BODY,
    ALLOW_PERMISSIONS_TITLE,
    APP_ID,
    DONT_ALLOW,
    FA_S2U_ACTIVATE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";
import { S2U_ABOUT } from "@constants/url";

import { formatDeviceModel, formatDeviceName } from "@utils/dataModel/utilityPartial.2";

import Images from "@assets";

/**
 * For registration coming from outside of settings,
 * it expect external params in side a param call flowParams,
 * it must have 3 things, stack, screen, and params
 * stack: the route stack where will we be returning
 * screen: the screen name where it will be going
 * params: whatever parameter you want to carry on
 *
 * Upon navigating to the given stack/screen, it will return a
 * param called auth. it'd be "success" if the registration is
 * successfull and "fail" for failure.
 *
 * note that the approach taken here is that it will pop back to the
 * screen where it is initially coming from, then the screen decided where
 * to go. So the given stack/screen must already mounted and exists in the history
 */
function Activate({ navigation, route, getModel, updateModel }) {
    const [loading, setLoading] = useState(false);
    const [back, setBack] = useState(true);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isPinOrFingerprintSet, setIsPinOrFingerprintSet] = useState(false);
    const { m2uPhoneNumber } = getModel("m2uDetails");
    const { deviceId, deviceInformation } = getModel("device");
    const { mdipS2uEnable } = getModel("s2uIntrops");
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_S2U_ACTIVATE,
        });
        checkNotificationPermission();
    }, []);

    const checkNotificationPermission = async () => {
        const { status } = await checkNotifications();
        if (status === RESULTS.BLOCKED) {
            Alert.alert(ALLOW_PERMISSIONS_TITLE, ALLOW_PERMISSIONS_BODY, [
                {
                    text: DONT_ALLOW,
                    onPress: () => {},
                    style: "cancel",
                },
                {
                    text: ALLOW,
                    onPress: async () => {
                        Linking.openSettings();
                    },
                },
            ]);
            return false;
        } else {
            return true;
        }
    };

    function handleClose() {
        if (!back) return;
        setBack(false);
        setIsPinOrFingerprintSet(false);

        navigation.canGoBack() && navigation.goBack();
    }

    function handleToOtp() {
        setIsWaiting(true);
        const deviceName = formatDeviceName(deviceInformation);
        const deviceModel = formatDeviceModel(deviceInformation);

        navigation.navigate(SETTINGS_MODULE, {
            screen: "ConfirmPhoneNumber",
            params: {
                otpType: "SEC2U_REGISTRATION_REQ",
                otpParams: { deviceName, deviceModel },
                otpTypeVerify: "SEC2U_REGISTRATION_VERIFY",
                externalSource: {
                    stack: ONE_TAP_AUTH_MODULE,
                    screen: "Activate",
                    params: {
                        ...route?.params,
                    },
                },
                // should send to m2u phone
                phone: m2uPhoneNumber || route?.params?.phone,
            },
        });
    }

    function handleProceed() {
        setIsPinOrFingerprintSet(false);

        if (Platform.OS == "android") {
            AndroidOpenSettings.generalSettings();
        } else {
            //Currently not required for iOS
            Linking.canOpenURL("App-prefs:root=General")
                .then((supported) => {
                    if (!supported) {
                        console.log("Can't handle settings url");
                    } else {
                        return Linking.openURL("App-prefs:root=General");
                    }
                })
                .catch((err) => console.error("An error occurred", err));
            // return;
        }
    }
    async function handleActivate() {
        const enabled = await checkNotificationPermission();
        if (enabled) {
            //Check device has pin or fingerprint lock
            const isSet = await DeviceInfo.isPinOrFingerprintSet();
            const subUrl = `2fa/${
                mdipS2uEnable ? "v2/secure2u/checkEligibility" : "v1/secure2u/regCount"
            }`;

            //s2u interops changes call v2 url when MDIP migrated, changed URL because added new check MYA01(Max attempts) & MYA02(S2u Down)
            if (!isSet) {
                setIsPinOrFingerprintSet(true);
                return;
            }

            // check for s2u registration whether already registered somewhere or same device
            if (!loading) {
                const params = {
                    app_id: APP_ID,
                };

                setLoading(true);

                try {
                    // we should check this all the time before proceeding with s2u
                    // in case it has been
                    const response = await otaRegistrationCount(params, subUrl);

                    if (
                        response &&
                        response.data &&
                        response.data.text.toLowerCase() === "success"
                    ) {
                        if (response.data.payload && response.data.payload.length) {
                            const { hardware_id: hardwareId } = response.data.payload[0];

                            if (hardwareId && hardwareId !== deviceId) {
                                // show already register on another device section
                                setIsRegistered(true);
                            } else {
                                handleToOtp();
                            }
                        } else {
                            // navigatte to otp
                            handleToOtp();
                        }
                    } else {
                        if (response?.data?.code === "9999") {
                            throw new Error(
                                "Your request could not be processed at this time. Check your connection or come back later."
                            );
                        } else if (response?.data?.code === "MYA01") {
                            //Max attempts
                            showInfoToast({
                                message:
                                    response.data?.statusDescription ??
                                    "You have reached the maximum attempts for Secure2u registration",
                            });
                            return;
                        } else if (response?.data?.code === "MYA02") {
                            //S2u Down
                            throw new Error(
                                response.data?.statusDescription ??
                                    "Secure2u is unavailable at this moment. Please continue with SMS TAC"
                            );
                        }

                        throw new Error(response.data.status);
                    }
                } catch (error) {
                    console.log("fail when retrieving registration count");
                    showErrorToast({
                        message: error.message || "Unable to retrieve registration status",
                    });
                } finally {
                    setLoading(false);
                }
            }
        }
    }

    useFocusEffect(
        useCallback(() => {
            // we got auth for activating
            if (route?.params?.auth === "Success") {
                const flowParams = route?.params.flowParams;
                const s2uTransactionId = route?.params?.s2uTransactionId ?? null;

                navigation.setParams({ auth: null, flowParams: null });

                // just reset the params before going
                navigation.navigate("IdNumber", {
                    flowParams,
                    s2uTransactionId,
                });
            } else {
                setIsWaiting(false);
                setIsRegistered(false);
            }
        }, [navigation, route])
    );

    function openInfo() {
        const params = {
            uri: S2U_ABOUT,
            type: "Web",
            title: "Secure2u",
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                {!isWaiting && (
                    <ScreenLayout
                        paddingBottom={10}
                        paddingTop={36}
                        paddingHorizontal={24}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    !route?.params?.disableBackCloseButton && (
                                        <HeaderBackButton onPress={handleClose} />
                                    )
                                }
                                headerCenterElement={
                                    <Typo
                                        text="Secure2u"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    !route?.params?.disableBackCloseButton && (
                                        <HeaderCloseButton onPress={handleClose} />
                                    )
                                }
                            />
                        }
                        neverForceInset={["bottom"]}
                        useSafeArea
                    >
                        <View style={styles.wrapper}>
                            <ScrollView contentContainerStyle={styles.container}>
                                <View style={styles.otaIcon}>
                                    <Image source={Images.s2u} style={{}} />
                                </View>
                                <Typo
                                    fontSize={isRegistered ? 20 : 16}
                                    fontWeight={isRegistered ? "300" : "400"}
                                    lineHeight={isRegistered ? 28 : 20}
                                    style={styles.label}
                                    text={
                                        isRegistered
                                            ? "You've already registered for Secure2u. Would you like to use it here instead?"
                                            : "Activate Secure2u to approve transactions safely and quickly with a single tap."
                                    }
                                />

                                {!isRegistered && (
                                    <>
                                        <S2UInfoCard
                                            img={Images.s2uSecurity}
                                            title="Safer & More Convenient"
                                            desc="Secure2u’s unique device binding reduces your exposure to SMS TAC fraud."
                                        />
                                        <SpaceFiller backgroundColor="transparent" height={15} />
                                        <S2UInfoCard
                                            img={Images.s2uTimer}
                                            title="Less Waiting Time"
                                            desc="Receive notifications to approve transactions faster than SMS TAC."
                                        />
                                        <SpaceFiller backgroundColor="transparent" height={30} />
                                        <Typo
                                            onPressText={openInfo}
                                            text="What is Secure2u?"
                                            fontSize={14}
                                            color={BLUE}
                                            fontWeight="500"
                                            lineHeight={18}
                                        />
                                        <SpaceFiller backgroundColor="transparent" height={30} />
                                    </>
                                )}
                            </ScrollView>
                            <View style={styles.footer}>
                                {isRegistered ? (
                                    <View style={styles.otaRegisteredContainer}>
                                        <View style={styles.otaRegisteredActionLeft}>
                                            <ActionButton
                                                fullWidth
                                                borderRadius={25}
                                                onPress={handleClose}
                                                backgroundColor={WHITE}
                                                style={styles.otaRegisteredActionLeftButton}
                                                componentCenter={
                                                    <Typo
                                                        text="No"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </View>
                                        <View style={styles.otaRegisteredActionRight}>
                                            <ActionButton
                                                fullWidth
                                                borderRadius={25}
                                                onPress={handleToOtp}
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        text="Yes"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <ActionButton
                                        fullWidth
                                        disabled={loading}
                                        isLoading={loading}
                                        borderRadius={25}
                                        onPress={handleActivate}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text="Activate Now"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                        style={styles.actionButton}
                                    />
                                )}
                            </View>
                        </View>
                    </ScreenLayout>
                )}

                <Popup
                    visible={isPinOrFingerprintSet}
                    title="Screen Lock Disabled"
                    description="Please enable your screen lock to use credential storage and to proceed with using the app securely."
                    onClose={handleClose}
                    primaryAction={{
                        text: "Proceed",
                        onPress: handleProceed,
                    }}
                />
            </>
        </ScreenContainer>
    );
}

Activate.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    actionButton: {
        marginBottom: 20,
    },
    container: {
        alignItems: "center",
        paddingHorizontal: 12,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    label: {
        paddingVertical: 24,
    },
    otaIcon: {
        height: 64,
        width: 64,
    },
    otaRegisteredActionLeft: {
        flex: 0.5,
        paddingRight: 8,
    },
    otaRegisteredActionLeftButton: {
        borderColor: GREY,
        borderWidth: 1,
    },
    otaRegisteredActionRight: {
        flex: 0.5,
        paddingLeft: 8,
    },
    otaRegisteredContainer: {
        alignItems: "center",
        flexDirection: "row",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(Activate);

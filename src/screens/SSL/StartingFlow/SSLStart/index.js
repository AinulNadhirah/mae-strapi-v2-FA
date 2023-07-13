import AsyncStorage from "@react-native-community/async-storage";
import { useNavigation, useRoute } from "@react-navigation/core";
import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Platform,
} from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";

import { SSL_ONBOARDING, SSL_STACK, SSL_TAB_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton.js";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import { BottomDissolveCover } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";

import { withModelContext, useModelController } from "@context";

import { GeocoderAddress, getSSLInit, getSSLAddress, getMbbCloudTokenByMayaToken } from "@services";

import { YELLOW, BLUE, MEDIUM_GREY } from "@constants/colors";

import { getLocationDetails, SSLDetermineDefaultLocation } from "@utils/dataModel/utility";
import {
    delyvaReverseGeoResultToAddrFormat,
    massageAddressFormat,
} from "@utils/dataModel/utilitySSLGeolocation";
import { useDidMount, useUpdateEffect } from "@utils/hooks";

import Images from "@assets";

const { width } = Dimensions.get("window");

export const screenEnum = Object.freeze({
    loading: "loading", // Mae loader
    ssldown: "ssldown", // SSL Down custom error screen
    serverError: "serverError", // server error
    locationDisabled: "locationDisabled", // location disabled screen -> Open Settings CTA
    locationEnabling: "locationEnabling", // location disabled screen -> Try again CTA
});

function SSLStart() {
    const [screenState, setScreenState] = useState(screenEnum.loading);
    const { updateModel, getModel } = useModelController();
    const navigation = useNavigation();
    const route = useRoute();
    const { params } = route;
    const { sslReady, currSelectedLocationV1, geolocationUrl } = getModel("ssl");

    const init = useCallback(async () => {
        // Reset everything
        setScreenState(screenEnum.loading);

        // SSL Init (Onboarding flow)
        try {
            if ((await AsyncStorage.getItem("SSL_onboarded")) !== "true") {
                const onboardingData = await getSSLInit();
                const result = onboardingData.data?.result;

                if (!result?.onboarded) {
                    navigation.navigate(SSL_ONBOARDING, {
                        data: result?.screenDetails,
                    });
                    return;
                }
                await AsyncStorage.setItem("SSL_onboarded", "true");
            }
        } catch (e) {
            setScreenState(screenEnum.serverError);
            return;
        }

        // Get cloud token (to communicate with DP -> Delyva)
        try {
            if (!(await AsyncStorage.getItem("MbbCloudToken"))) {
                const mayaResponse = await getMbbCloudTokenByMayaToken();
                const headerToken = mayaResponse?.data?.access_token;
                await AsyncStorage.setItem("MbbCloudToken", headerToken);
            }
        } catch (e) {
            setScreenState(screenEnum.serverError);
            return;
        }

        let location;
        // Get device location (already get location from MAE dashboard)
        try {
            location = getModel("location");
            console.log("location123", location);
            if (!location?.latitude) {
                location = await getLocationDetails();
                updateModel({
                    location,
                });
            }
        } catch (e) {
            setScreenState(screenEnum.locationDisabled);
            return;
        }

        // Get address nearest to current location
        try {
            const defaultLocation = await SSLDetermineDefaultLocation({
                getSSLAddress,
                deviceLocation: location,
                massageAddressFormat,
                currSelectedLocationV1,
                geolocationUrl,
                GeocoderAddress,
                delyvaReverseGeoResultToAddrFormat,
            });

            AsyncStorage.setItem("currSelectedLocationV1", JSON.stringify(defaultLocation));
            updateModel({
                ssl: {
                    currSelectedLocationV1: defaultLocation,
                },
            });
        } catch (e) {
            setScreenState(screenEnum.serverError);
            return;
        }
        console.log("");

        navigation.replace("SSLStack", {
            screen: "SSLTabScreen",
        });
    }, [currSelectedLocationV1, geolocationUrl, getModel, navigation, updateModel]);

    useUpdateEffect(() => {
        init();
    }, [params?.isDoneOnboarding]);

    useDidMount(() => {
        if (!sslReady) {
            setScreenState(screenEnum.ssldown);
        } else {
            init();
        }
    });

    /** User functions */
    function handleSettingsNavigation() {
        console.log("SSLStart handleSettingsNavigation");
        if (screenEnum.locationEnabling) {
            init();
        } else {
            setScreenState(screenEnum.locationEnabling);
            if (Platform.OS === "ios") {
                Linking.canOpenURL("app-settings:")
                    .then((supported) => {
                        if (!supported) {
                            console.log("Can't handle settings url");
                        } else {
                            return Linking.openURL("app-settings:");
                        }
                    })
                    .catch((err) => console.error("An error occurred", err));
                return;
            }
            AndroidOpenSettings.appDetailsSettings();
        }
    }

    function onClose() {
        navigation.goBack();
    }

    function manualSetLocation() {
        navigation.replace(SSL_STACK, {
            screen: SSL_TAB_SCREEN,
            params: { isSetLocationManually: true },
        });
    }

    return (
        <>
            {screenState === screenEnum.loading ? (
                <View style={styles.loaderContainer}>
                    <ScreenLoader showLoader />
                </View>
            ) : (
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerRightElement={<HeaderCloseButton onPress={onClose} />}
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                        paddingTop={0}
                    >
                        <View style={styles.container}>
                            {screenState === screenEnum.ssldown ? (
                                <View style={styles.container}>
                                    <EmptyState
                                        title="Sama-Sama Lokal will be serving you soon"
                                        subTitle="Get ready for some delicious Lokal delights."
                                    />
                                </View>
                            ) : screenState === screenEnum.serverError ? (
                                <View style={styles.container}>
                                    <EmptyState
                                        title="Server is busy"
                                        subTitle="Sorry for the inconvenience, please try again later"
                                        buttonLabel="Try Again"
                                        onActionBtnClick={init}
                                    />
                                </View>
                            ) : (
                                <View style={styles.containerView}>
                                    <Image source={Images.globe} style={styles.image} />
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={28}
                                        text="Let us know where you are"
                                        style={styles.title}
                                    />
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        style={styles.desc}
                                        text="We need to know your current location in order to suggest a nearby merchant and promotions"
                                    />
                                    <BottomDissolveCover>
                                        <ActionButton
                                            style={{ width: width - 50 }}
                                            borderRadius={25}
                                            onPress={handleSettingsNavigation}
                                            borderWidth={1}
                                            backgroundColor={YELLOW}
                                            componentCenter={
                                                <Typo
                                                    text={
                                                        screenState === screenEnum.locationEnabling
                                                            ? "Try Again"
                                                            : "Enable Location Services"
                                                    }
                                                    fontSize={14}
                                                    fontWeight="semi-bold"
                                                    lineHeight={18}
                                                />
                                            }
                                        />

                                        <TouchableOpacity
                                            style={styles.subButton}
                                            onPress={manualSetLocation}
                                        >
                                            <Typo
                                                text="Set Location Manually"
                                                fontSize={14}
                                                fontWeight="semi-bold"
                                                lineHeight={18}
                                                color={BLUE}
                                            />
                                        </TouchableOpacity>
                                    </BottomDissolveCover>
                                </View>
                            )}
                        </View>
                    </ScreenLayout>
                </ScreenContainer>
            )}
        </>
    );
}

export default withModelContext(SSLStart);

const styles = StyleSheet.create({
    container: { flex: 1 },
    containerView: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: 130, // BottomDissolveCover is absolute, so add some padding to center
        paddingHorizontal: 24,
    },
    desc: { marginTop: 24 },
    image: { height: 64, width: 64 },
    loaderContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
    },
    subButton: {
        marginTop: 24,
    },
    title: { marginTop: 24 },
});

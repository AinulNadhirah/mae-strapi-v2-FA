import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Conf from "react-native-config";
import DeviceInfo from "react-native-device-info";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { GREY, TRANSPARENT } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import useFestive from "@utils/useFestive";

export default function TapTrackWin({ navigation, route }) {
    const [isReady, setReady] = useState(false);
    const webview = useRef(null);
    const { getModel } = useModelController();

    const {
        qrPay: { isEnabled: qrEnabled },
        misc: { campaignWebViewUrl },
        auth: { token },
        // data1: { data },
    } = getModel(["auth", "qrPay", "misc", "user", "device"]);

    const webViewUrl = campaignWebViewUrl || Conf?.CAMPAIGN_WEBVIEW_URL;
    const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}`;

    const [uri, setUri] = useState(baseUrl);
    const { festiveAssets } = useFestive();

    function renderLoading() {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={GREY} size="small" />
            </View>
        );
    }
    const handleOnback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    function handleLoadReady() {
        setReady(true);
    }

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.isRefresh) {
                // update params to reset
                navigation.setParams({
                    isRefresh: false,
                });
            }
        }, [navigation, route?.params?.isRefresh])
    );

    useEffect(() => {
        if (route?.params?.isRefresh) {
            webview?.current?.reload && webview?.current?.reload();
        }
    }, [baseUrl, route?.params?.isRefresh]);

    const handleRedirection = useCallback(
        ({ stack = null, screen, params = {} }) => {
            if (stack) {
                navigation.push(stack, {
                    screen,
                    params,
                });
            } else if (screen) {
                navigation.push(screen, params);
            }
        },
        [navigation]
    );

    function applyRule(data) {
        // TODO: Error handling ;)
        // if(data === undefined) return data;
        if (typeof data === "string" || data instanceof String) {
            return data;
        }
        if (typeof data === "object" && !Array.isArray(data) && data !== null) {
            const key = Object.keys(data)[0];
            return data[key][qrEnabled];
        }
    }

    function handleOnEvent(event) {
        console.log("CTA Button ", event?.nativeEvent?.data);

        // handle token error
        const data = event?.nativeEvent?.data;
        console.log(
            "CTA Button ",
            event?.nativeEvent?.data,
            "Check",
            data,
            festiveAssets?.DeepLinking[data]
        );

        if (data === "mae_dashboard") {
            handleOnback();
        } else if (data && festiveAssets?.DeepLinking[data]) {
            const { stack, screen, params } = festiveAssets?.DeepLinking[data];
            handleRedirection({
                stack,
                screen: applyRule(screen),
                params,
            });
        } else {
            console.warn("Unhandled event:", data);
        }
    }

    function onError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView error: ", nativeEvent);
        showErrorToast({
            message: COMMON_ERROR_MSG,
        });
        handleOnback();
    }

    function onHttpError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView HTTP error: ", nativeEvent);
    }

    function onLoad(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        setUri(nativeEvent.url);
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={TRANSPARENT}
                showLoaderModal={!isReady}
                // onPress={onOpenLink}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        isGame
                        header={
                            <HeaderLayout
                                backgroundColor={TRANSPARENT}
                                headerLeftElement={
                                    <HeaderBackButton isWhite={false} onPress={handleOnback} />
                                }
                                // resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                                // headerRightElement={null}
                                // width={100}
                                // width ={"100%"}
                                // left={10}
                                // paddingLeft={0}
                                // backgroundColor= {BLACK}
                            />
                        }
                        contentContainerStyle={styles.gameContainer}
                    >
                        <WebView
                            ref={webview}
                            originWhitelist={["*"]}
                            source={{
                                uri,
                            }}
                            startInLoadingState
                            javaScriptEnabled
                            bounces={false}
                            allowUniversalAccessFromFileURLs
                            renderLoading={renderLoading}
                            mixedContentMode="always"
                            containerStyle={styles.webviewContainer}
                            onMessage={handleOnEvent}
                            onLoadEnd={handleLoadReady}
                            onError={onError}
                            onHttpError={onHttpError}
                            onLoad={onLoad}
                            // cacheEnabled={false}
                        />
                    </ScreenLayout>
                </>
            </ScreenContainer>
        </>
    );
}

TapTrackWin.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    gameContainer: { flex: 1 },
    loaderContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    webviewContainer: {
        flex: 1,
    },
});

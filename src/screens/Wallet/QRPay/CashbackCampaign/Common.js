import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Conf from "react-native-config";
import DeviceInfo from "react-native-device-info";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { TRANSPARENT, GREY } from "@constants/colors";
import { COMMON_ERROR_MSG } from "@constants/strings";

import useFestive from "@utils/useFestive";

const Common = ({ onButtonPressed, isSuccess, amount, isSpecial, getModel, navigation }) => {
    const { festiveAssets, getLottieAnimation } = useFestive();

    const [animation, setAnimation] = useState(null);
    const {
        misc: { campaignWebViewUrl, tapTasticType },
        auth: { token },
    } = getModel(["auth", "qrPay", "misc"]);
    const [isReady, setReady] = useState(false);

    function getAnimationType() {
        return isSpecial && isSuccess
            ? "special-cashback-animation"
            : isSuccess
            ? "cashback-animation"
            : "no-cashback-animation";
    }

    const webview = useRef(null);
    const webViewUrl = campaignWebViewUrl || Conf?.CAMPAIGN_WEBVIEW_URL;
    // const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}&animation=${getAnimationType()}&amount=${amount}&campaignCode=${tapTasticType}`;
    const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}&animation=${getAnimationType()}&amount=${amount}&campaignCode=${tapTasticType}`;

    console.log("DEBUG1", "Checking baseUrl", baseUrl);
    const [uri, setUri] = useState(baseUrl);

    useEffect(() => {
        if (!festiveAssets) return;
        const imagePath =
            isSpecial && isSuccess
                ? festiveAssets?.gameStatus.tapTrackWin
                : isSuccess
                ? festiveAssets?.qrPay.cashback?.success.animation
                : festiveAssets?.qrPay.cashback?.failed.animation;
        setAnimation(getLottieAnimation(imagePath));
    }, [festiveAssets, animation != null]);

    const handleRedirection = useCallback(
        ({ stack = null, screen, params = {} }) => {
            if (module) {
                navigation.push(module, {
                    screen,
                    params,
                });
            } else if (screen) {
                navigation.push(screen, params);
            }
        },
        [navigation]
    );

    function handleLoadReady() {
        setReady(true);
    }

    function handleOnEvent(event) {
        // handle token error
        const data = event?.nativeEvent?.data;
        console.log("CTA Button ", event?.nativeEvent?.data, "Check", data);
        if (data === "mae_dashboard") {
            onButtonPressed();
        } else if (data && festiveAssets?.DeepLinking[data]) {
            const { module, screen, params } = festiveAssets?.DeepLinking[data];
            handleRedirection({
                module,
                screen,
                params,
            });
        }
    }

    function renderLoading() {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={GREY} size="small" />
            </View>
        );
    }
    function onError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.log("WebView error: ", nativeEvent);
        showErrorToast({
            message: COMMON_ERROR_MSG,
        });
        handleOnback();
    }

    const handleOnback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

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
                        header={<HeaderLayout backgroundColor={TRANSPARENT} />}
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
};

Common.propTypes = {
    onButtonPressed: PropTypes.func,
    isSuccess: PropTypes.bool,
    amount: PropTypes.string,
    buttonText: PropTypes.string,
    tapTasticType: PropTypes.string,
};

const styles = StyleSheet.create({
    gameContainer: {
        flex: 1,
    },
    webviewContainer: {
        flex: 1,
    },
});

export default withModelContext(Common);

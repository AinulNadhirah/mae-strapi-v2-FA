import PropTypes from "prop-types";
import React, { useState, useCallback, useRef } from "react";
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

const GameStatus = ({
    navigation,
    totalEarned = 0,
    isGrandPrize,
    isConsolationWeekly, //booster
    isCompleted, //tru and false
    getModel,
}) => {
    const { festiveAssets } = useFestive();
    // console.log("DEBUG1", "checkfestiveassets", festiveAssets?.DeepLinking);
    // const { getModel, updateModel } = useModelController();
    const {
        misc: { campaignWebViewUrl, isPromotionsEnabled = true, tapTasticType },
        auth: { token },
    } = getModel(["auth", "qrPay", "misc", "user", "device"]);
    const [isReady, setReady] = useState(false);

    function campaignStatus() {
        return isCompleted
            ? "completed-entry-animation"
            : isConsolationWeekly && !isGrandPrize
            ? "special-entry-animation"
            : isGrandPrize
            ? "grand-entry-animation"
            : "special-entry-animation";
    }

    const webview = useRef(null);
    const webViewUrl = campaignWebViewUrl || Conf?.CAMPAIGN_WEBVIEW_URL;
    const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}&animation=${campaignStatus()}&amount=${totalEarned}&campaignCode=${tapTasticType}&booster=${isConsolationWeekly}&promotion=${isPromotionsEnabled}`;

    // console.log("DEBUG1", "Checking baseUrl", baseUrl);
    const [uri, setUri] = useState(baseUrl);

    function handleLoadReady() {
        setReady(true);
    }
    const handleOnback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleRedirection = useCallback(
        ({ module = null, screen, params = {} }) => {
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
    //console.log("CTA Button1 ", festiveAssets?.DeepLinking["mae_dashboard"]);
    function handleOnEvent(event) {
        // console.log("CTA Button ", event?.nativeEvent?.data);

        // handle token error
        const data = event?.nativeEvent?.data;
        // console.log(
        //     "CTA Button ",
        //     event?.nativeEvent?.data,
        //     "Check",
        //     data,
        //     festiveAssets?.DeepLinking[data]
        // );
        if (data === festiveAssets?.DeepLinking[data]) {
            handleOnback();
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

GameStatus.propTypes = {
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    // updateModel: PropTypes.func,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    gameContainer: {
        flex: 1,
    },
    webviewContainer: {
        flex: 1,
    },
});

GameStatus.propTypes = {
    isGrandPrize: PropTypes.bool,
    isConsolationWeekly: PropTypes.bool,
    isCompleted: PropTypes.bool,
    totalEarned: PropTypes.number,
    navigation: PropTypes.object,
    tapTasticType: PropTypes.string,
    route: PropTypes.object,
    // controller: PropTypes.object,
};

const GameStatusMemo = React.memo(withModelContext(GameStatus));

export default GameStatusMemo;

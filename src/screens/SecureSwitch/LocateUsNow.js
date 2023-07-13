import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast } from "@components/Toast";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { GREY, TRANSPARENT } from "@constants/colors";
import { COMMON_ERROR_MSG, LOCATE_NEAREST_BRANCH } from "@constants/strings";
import { LOCATE_US_NOW } from "@constants/url";

export default function LocateUsNow({ navigation, route }) {
    const [isReady, setReady] = useState(false);
    const webview = useRef(null);
    const { getModel } = useModelController();
    const {
        auth: { token },
    } = getModel(["auth"]);

    const webViewUrl = LOCATE_US_NOW;
    const baseUrl = `${webViewUrl}?token=${token}&appVersion=${DeviceInfo.getVersion()}`;
    const [uri, setUri] = useState(baseUrl);

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
        route?.params?.isRefresh && setUri(baseUrl);
    }, [baseUrl, route?.params?.isRefresh]);

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
            >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea={true}
                        header={
                            <HeaderLayout
                                backgroundColor={TRANSPARENT}
                                headerLeftElement={
                                    <HeaderBackButton isWhite={false} onPress={handleOnback} />
                                }
                                headerRightElement={null}
                                headerCenterElement={
                                  <Typo
                                      text={LOCATE_NEAREST_BRANCH}
                                      fontWeight="600"
                                      fontSize={16}
                                      lineHeight={19}
                                  />
                              }
                            />
                        }
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
                            onLoadEnd={handleLoadReady}
                            onError={onError}
                            onHttpError={onHttpError}
                            onLoad={onLoad}
                        />
                    </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

LocateUsNow.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    loaderContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center",
    },
    webviewContainer: {
        height: 300,
    },
});

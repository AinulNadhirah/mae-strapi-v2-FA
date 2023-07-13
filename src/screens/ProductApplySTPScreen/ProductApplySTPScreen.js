import PropTypes from "prop-types";
import React, { useCallback, useRef } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";

import { MEDIUM_GREY, BLACK } from "@constants/colors";

function ProductApplySTPScreen({ navigation, route }) {
    const webView = useRef(null);

    const onCloseTap = useCallback(() => {
        console.log("[ProductApplySTPScreen] >> [onCloseTap]");

        if (webView.current) {
            webView.current?.goBack();
            webView.current = null;
        }

        navigation.goBack();
    }, [navigation]);

    const handleWebViewNavigationStateChange = useCallback((webViewState) => {
        console.log("[ProductApplySTPScreen] >> [loading webview]", webViewState.loading);
        console.log(
            "[ProductApplySTPScreen] >> [handleWebViewNavigationStateChange]",
            webViewState
        );
    }, []);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="MBB_STP"
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={
                                    route.params && route.params.headerText
                                        ? route.params.headerText
                                        : "Apply"
                                }
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={styles.webPageContainer}>
                    {route.params &&
                        route.params.url &&
                        (Platform.OS === "ios" ? (
                            <WebView
                                source={{ uri: route.params.url }}
                                style={styles.webPage}
                                // userAgent="Maybank-MY"
                                incognito
                                originWhitelist={["*"]}
                                ref={webView}
                                // injectedJavaScript={jsCode}
                                onNavigationStateChange={handleWebViewNavigationStateChange}
                            />
                        ) : (
                            <KeyboardAvoidingView
                                style={styles.viewKeyboard}
                                enabled
                                behavior={Platform.OS === "ios" ? "position" : "padding"}
                            >
                                <WebView
                                    source={{ uri: route.params.url }}
                                    style={styles.webPage}
                                    // userAgent="Maybank-MY"
                                    incognito
                                    originWhitelist={["*"]}
                                    ref={webView}
                                    // injectedJavaScript={jsCode}
                                    onNavigationStateChange={handleWebViewNavigationStateChange}
                                />
                            </KeyboardAvoidingView>
                        ))}
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ProductApplySTPScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    viewKeyboard: { flex: 1 },
    webPage: {
        backgroundColor: MEDIUM_GREY,
        opacity: 0.99,
    },
    webPageContainer: {
        borderColor: BLACK,
        flex: 1,
    },
});

export default ProductApplySTPScreen;

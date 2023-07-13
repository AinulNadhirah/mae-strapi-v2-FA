import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import PDFView from "react-native-view-pdf";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getSettingsAnalyticName } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: "center",
        bottom: 0,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    pdfView: { flex: 1 },
});

function renderLoading() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
        </View>
    );
}

function SettingPdfScreen({ navigation, route }) {
    const pageTitle = route?.params?.title ?? "No title";
    const source = route?.params?.source ?? "";
    const headerColor = route?.params?.headerColor ?? YELLOW;

    const isPdf = source && (source.endsWith("pdf") || source.endsWith("PDF"));
    const backAction = route?.params?.backAction ?? null;

    function handleBack() {
        backAction ? backAction() : navigation.canGoBack() && navigation.goBack();
    }

    if (!source) throw new Error(`"Source" are required`);

    const analyticScreenName = useMemo(() => getSettingsAnalyticName(pageTitle), [pageTitle]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        backgroundColor={headerColor}
                        headerCenterElement={
                            <Typo text={pageTitle} fontWeight="600" fontSize={16} lineHeight={19} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                    />
                }
                neverForceInset={["bottom"]}
                useSafeArea
            >
                <>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" />
                    </View>

                    {isPdf ? (
                        <PDFView
                            fadeInDuration={250}
                            style={styles.pdfView}
                            resource={source}
                            resourceType="url"
                            onError={(error) => console.log("Cannot render PDF", error)}
                        />
                    ) : (
                        <WebView
                            source={{ uri: source }}
                            startInLoadingState={true}
                            renderLoading={renderLoading}
                            style={styles.pdfView}
                        />
                    )}
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

SettingPdfScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(SettingPdfScreen);

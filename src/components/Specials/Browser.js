import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import PDFView from "react-native-view-pdf";
import { WebView } from "react-native-webview";

import GenericImageButton from "@components/Buttons/GenericImageButton";
import Typo from "@components/Text";

import { LIGHT_GREY } from "@constants/colors";

import assets from "@assets";

const Browser = ({ title, onCloseButtonPressed, source, ...props }) => {
    const safeArea = useSafeArea();
    const uri = source?.uri ?? "";
    const uriLength = uri.length;
    const isPDF = uriLength && uri.slice(uriLength - 4).toLowerCase() === ".pdf";

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: safeArea.top }]}>
                <View style={styles.headerColumn}>
                    <GenericImageButton
                        width={45}
                        height={45}
                        radius={0}
                        image={assets.icClose}
                        onPress={onCloseButtonPressed}
                    />
                </View>
                <View style={styles.titleArea}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        textAlign="center"
                        numberOfLines={1}
                        text={title}
                    />
                </View>
                <View style={styles.headerColumn} />
            </View>
            {isPDF ? (
                <PDFView style={styles.pdfView} resource={uri} resourceType="url" />
            ) : (
                <WebView style={styles.webview} source={source} {...props} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: LIGHT_GREY,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flex: 1,
    },
    header: {
        alignItems: "center",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerColumn: {
        flex: 0.1,
    },
    pdfView: {
        flex: 1,
    },
    titleArea: {
        alignItems: "center",
        flex: 0.8,
        justifyContent: "center",
        paddingLeft: 12,
    },
    webview: {
        flex: 1,
        opacity: 0.99,
    },
});

Browser.propTypes = {
    title: PropTypes.string.isRequired,
    onCloseButtonPressed: PropTypes.func.isRequired,
    source: PropTypes.shape({ uri: PropTypes.string }).isRequired,
};

export default Browser;

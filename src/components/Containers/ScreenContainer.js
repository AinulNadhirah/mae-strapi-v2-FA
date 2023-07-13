import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

import BackHandlerInterceptor from "@components/BackHandlerInterceptor";
import { ErrorMessageV2 } from "@components/Common";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import BlurOverlay from "@components/Overlays/BlurOverlay";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { FA_SCREEN_NAME, FA_TAB_NAME, FA_VIEW_SCREEN } from "@constants/strings";

const ScreenContainer = ({
    backgroundType,
    backgroundImage,
    backgroundColor,
    showLoaderModal,
    showErrorModal,
    errorTitle,
    errorMessage,
    onErrorModalDismissed,
    showOverlay,
    overlayType,
    overlayGradientColors,
    overlaySolidColor,
    children,
    updateModel,
    analyticScreenName,
    analyticTabName,
}) => {
    const [showError, setError] = useState(false);

    function handleCloseError() {
        setError(false);
        onErrorModalDismissed();
    }

    const _renderErrorModal = () => (
        <ErrorMessageV2 title={errorTitle} onClose={handleCloseError} description={errorMessage} />
    );

    const _renderChildren = () => {
        if (backgroundType === "image") {
            return (
                <View style={[styles.container, { backgroundColor }]}>
                    <ImageBackground
                        resizeMode="stretch"
                        source={backgroundImage}
                        style={styles.imageBackground}
                    >
                        {children}
                        {showError && _renderErrorModal()}
                        <ScreenLoader showLoader={showLoaderModal} />
                    </ImageBackground>
                </View>
            );
        } else {
            return (
                <View style={[styles.container, { backgroundColor }]}>
                    {children}
                    {showError && _renderErrorModal()}
                    <ScreenLoader showLoader={showLoaderModal} />
                </View>
            );
        }
    };

    useEffect(() => {
        if (showErrorModal && !showError) {
            setTimeout(() => {
                setError(true);
            }, 1000);
        }
    }, [showErrorModal, showError, updateModel]);

    useEffect(() => {
        if (analyticScreenName) {
            console.tron.display({
                name: "Set analytics screen name",
                value: analyticScreenName,
            });

            if (analyticTabName) {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: analyticScreenName,
                    [FA_TAB_NAME]: analyticTabName,
                });
            } else {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: analyticScreenName,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <BlurOverlay
                showOverlay={showOverlay}
                overlayType={overlayType}
                overlayGradientColors={overlayGradientColors}
                overlaySolidColor={overlaySolidColor}
            >
                {_renderChildren()}
            </BlurOverlay>
            {/* Back handler */}
            <BackHandlerInterceptor />
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        height: "100%",
        width: "100%",
    },
});

ScreenContainer.propTypes = {
    backgroundType: PropTypes.oneOf(["image", "color"]).isRequired,
    backgroundImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    backgroundColor: PropTypes.string,
    showLoaderModal: PropTypes.bool,
    showErrorModal: PropTypes.bool,
    errorTitle: PropTypes.string,
    errorMessage: PropTypes.string,
    onErrorModalDismissed: PropTypes.func,
    showOverlay: PropTypes.bool,
    overlayType: PropTypes.oneOf(["solid", "gradient"]),
    overlayGradientColors: PropTypes.array,
    overlaySolidColor: PropTypes.string,
    children: PropTypes.node,
    updateModel: PropTypes.func,
    analyticScreenName: PropTypes.string,
    analyticTabName: PropTypes.string,
};

ScreenContainer.defaultProps = {
    backgroundImage: 0,
    backgroundColor: MEDIUM_GREY,
    showLoaderModal: false,
    showErrorModal: false,
    errorTitle: "MAE",
    errorMessage: "",
    onErrorModalDismissed: () => {},
    showOverlay: false,
    overlayType: "solid",
    overlayGradientColors: ["transparent", "#1e3c60"],
    overlaySolidColor: WHITE,
};

export default withModelContext(ScreenContainer);

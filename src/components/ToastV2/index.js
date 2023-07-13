import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import FlashMessage from "react-native-flash-message";
import { useSafeArea } from "react-native-safe-area-context";

import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import Images from "@assets";

import {
    styles,
    successToastProp,
    errorToastProp,
    infoToastProp,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    hideToast,
} from "../Toast/index";

const ToastV2 = ({ toastRef, handleCloseToast = () => {}, handleToastPress = () => {} }) => {
    const safeArea = useSafeArea();

    const onPressToast = useCallback(() => {
        handleToastPress();
        toastRef.current.hideMessage();
    }, [handleToastPress, toastRef]);

    const onPressClose = useCallback(() => {
        handleCloseToast();
        toastRef.current.hideMessage();
    }, [handleCloseToast, toastRef]);

    const renderToastComponent = useCallback(
        ({ position, style, message: { message: toastMessage } }) => {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPressToast}
                    style={[
                        styles.toastContainer,
                        styles.topToast,
                        styles.bottomToast,
                        position === "bottom" &&
                            safeArea.bottom > 0 && {
                                paddingBottom: safeArea.bottom,
                            },
                        position === "top" &&
                            safeArea.top > 0 && {
                                paddingTop: safeArea.top,
                            },
                        style,
                    ]}
                >
                    <View style={styles.toastContent}>
                        <View style={styles.toastCopy}>
                            <Typo
                                textAlign="left"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={WHITE}
                                text={toastMessage}
                            />
                        </View>
                        <TouchableOpacity onPress={onPressClose} style={styles.toastClose}>
                            <Image source={Images.icCloseWhite} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            );
        },
        [onPressClose, onPressToast, safeArea.bottom, safeArea.top]
    );

    return (
        <FlashMessage
            MessageComponent={renderToastComponent}
            ref={toastRef}
            onClose={handleCloseToast}
        />
    );
};

ToastV2.propTypes = {
    toastRef: PropTypes.object,
    handleCloseToast: PropTypes.func,
    handleToastPress: PropTypes.func,
};

export default ToastV2;

export {
    successToastProp,
    errorToastProp,
    infoToastProp,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    hideToast,
};

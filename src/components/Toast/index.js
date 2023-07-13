import PropTypes from "prop-types";
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, ViewPropTypes } from "react-native";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useSafeArea } from "react-native-safe-area-context";

import Typo from "@components/Text";

import { DARK_GREY, GREEN, RED, WHITE } from "@constants/colors";

import Images from "@assets";

export const successToastProp = ({
    message = "Success",
    duration = 5000,
    autoHide = true,
    position = "bottom",
    hideOnPress = true,
    ...props
}) => ({
    ...props,
    message,
    duration,
    autoHide,
    position,
    hideOnPress,
    animationDuration: 280,
    style: styles.successContainer,
});

export const errorToastProp = ({
    message = "Something is wrong",
    duration = 5000,
    autoHide = true,
    position = "bottom",
    hideOnPress = true,
    ...props
}) => ({
    ...props,
    message,
    duration,
    autoHide,
    position,
    hideOnPress,
    animationDuration: 280,
    style: styles.errorContainer,
});

export const infoToastProp = ({
    message = "Info",
    duration = 5000,
    autoHide = true,
    position = "bottom",
    hideOnPress = true,
    ...props
}) => ({
    ...props,
    message,
    duration,
    autoHide,
    position,
    hideOnPress,
    animationDuration: 280,
    style: styles.infoContainer,
});

export const showSuccessToast = ({
    message,
    duration,
    autoHide,
    position,
    onToastPress,
    ...props
}) => {
    showMessage(
        successToastProp({ message, duration, autoHide, position, onToastPress, ...props })
    );
};

export const showErrorToast = ({
    message,
    duration,
    autoHide,
    position,
    onToastPress,
    ...props
}) => {
    showMessage(errorToastProp({ message, duration, autoHide, position, onToastPress, ...props }));
};

export const showInfoToast = ({
    message,
    duration,
    autoHide,
    position,
    onToastPress,
    ...props
}) => {
    showMessage(infoToastProp({ message, duration, autoHide, position, onToastPress, ...props }));
};

export const hideToast = () => hideMessage();

const Toast = ({ position, style, message: { message: toastMessage, onToastPress }, onClose }) => {
    const safeArea = useSafeArea();

    function handleClosePress() {
        if (typeof onClose === "function") onClose();
        else hideMessage();
    }

    function handleToastPress() {
        if (typeof onToastPress === "function") {
            onToastPress();
            hideMessage();
        } else {
            hideMessage();
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToastPress}
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
                <TouchableOpacity onPress={handleToastPress} style={styles.toastCopy}>
                    <Typo
                        textAlign="left"
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        color={WHITE}
                        text={toastMessage}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClosePress} style={styles.toastClose}>
                    <Image source={Images.icCloseWhite} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

Toast.propTypes = {
    position: PropTypes.string,
    style: ViewPropTypes.style,
    message: PropTypes.object,
    toastMessage: PropTypes.string,
    onClose: PropTypes.func,
    onToastPress: PropTypes.func,
};

export default Toast;

export const styles = StyleSheet.create({
    bottomToast: {
        paddingBottom: 20,
    },
    errorContainer: {
        backgroundColor: RED,
    },
    infoContainer: {
        backgroundColor: DARK_GREY,
    },
    successContainer: {
        backgroundColor: GREEN,
    },
    toastClose: {
        height: 20,
        width: 20,
    },
    toastContainer: {
        minHeight: 90,
        paddingHorizontal: 24,
    },
    toastContent: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    toastCopy: {
        flex: 0.95,
    },
    topToast: {
        paddingTop: 20,
    },
});

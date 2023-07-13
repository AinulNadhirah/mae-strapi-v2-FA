import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modal";

import Typo from "@components/Text";

import { GREY, WHITE, YELLOW } from "@constants/colors";

import assets from "@assets";

const MADPopup = ({
    visible,
    text,
    title,
    primaryButtonText,
    secondaryButtonText,
    primaryButtonAction,
    secondaryButtonAction,
    onClose,
}) => {
    if (!visible) return null;
    return (
        <>
            <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
            <Modal
                visible={visible}
                transparent
                hardwareAccelerated
                onRequestClose={onClose}
                animationType="fade"
            >
                <View style={styles.container}>
                    <TouchableOpacity onPress={onClose} style={styles.crossButton}>
                        <Image style={styles.button} source={assets.icClose} />
                    </TouchableOpacity>
                    <Typo
                        text={title}
                        fontSize={14}
                        fontWeight="600"
                        textAlign="left"
                        style={styles.title}
                    />
                    <Typo
                        text={text}
                        fontSize={13}
                        fontWeight="400"
                        textAlign="left"
                        lineHeight={20}
                    />
                    <View style={styles.buttonContainer}>
                        {primaryButtonText && (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={primaryButtonAction}
                            >
                                <Typo
                                    text={primaryButtonText}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            </TouchableOpacity>
                        )}
                        {secondaryButtonText && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={secondaryButtonAction}
                            >
                                <Typo
                                    text={secondaryButtonText}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

MADPopup.propTypes = {
    visible: PropTypes.bool,
    text: PropTypes.string,
    title: PropTypes.string,
    primaryButtonText: PropTypes.string,
    primaryButtonAction: PropTypes.func,
    secondaryButtonText: PropTypes.string,
    secondaryButtonAction: PropTypes.func,
    onClose: PropTypes.func,
};
const styles = StyleSheet.create({
    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    button: {
        height: 40,
        width: 40,
    },
    buttonContainer: {
        flexDirection: "row",
        paddingBottom: 20,
        paddingTop: 30,
    },
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    crossButton: {
        alignSelf: "flex-end",
    },
    primaryButton: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 26,
        borderWidth: 1,
        flex: 1,
        marginRight: 10,
        padding: 10,
    },
    secondaryButton: {
        backgroundColor: YELLOW,
        borderRadius: 26,
        flex: 1,
        marginLeft: 10,
        padding: 10,
    },
    title: {
        paddingBottom: 10,
        top: -15,
    },
});
export default MADPopup;

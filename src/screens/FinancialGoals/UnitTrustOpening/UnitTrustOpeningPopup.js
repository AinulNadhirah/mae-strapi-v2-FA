import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import { Modal, TouchableOpacity, Image, StyleSheet, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import assets from "@assets";

const UnitTrustOpeningPopup = ({ title, subtitle, visible, onPressPrimaryButton, onClose }) => {
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
                <View style={styles.fillScreenContainer}>
                    <View style={styles.popupContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Image source={assets.icCloseBlack} />
                        </TouchableOpacity>
                        <Typo
                            text={title}
                            fontWeight="600"
                            textAlign="left"
                            lineHeight={20}
                            fontSize={15}
                        />
                        <Typo
                            text={subtitle}
                            textAlign="left"
                            lineHeight={20}
                            style={styles.subText}
                        />
                        <ActionButton
                            componentCenter={
                                <Typo
                                    text="Open Unit Trust Account"
                                    fontWeight="600"
                                    fontSize={14}
                                />
                            }
                            onPress={onPressPrimaryButton}
                            style={styles.ctaButton}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

UnitTrustOpeningPopup.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    visible: PropTypes.bool,
    onPressPrimaryButton: PropTypes.func,
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
    closeButton: {
        alignItems: "center",
        alignSelf: "flex-end",
        height: 20,
        marginTop: 15,
        width: 20,
    },
    ctaButton: {
        marginBottom: 30,
    },
    fillScreenContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    popupContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginHorizontal: 24,
        paddingHorizontal: 30,
        width: "90%",
    },
    subText: {
        paddingBottom: 50,
        paddingTop: 25,
    },
});

export default UnitTrustOpeningPopup;

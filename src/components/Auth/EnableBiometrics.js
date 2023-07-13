import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Alert, View, StyleSheet, TouchableOpacity, Image, Platform, Modal } from "react-native";
import * as Animatable from "react-native-animatable";
import Biometrics from "react-native-biometrics";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { handleRequestClose } from "@components/BackHandlerInterceptor";
import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { LogGesture } from "@components/NetworkLog";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_BIOMETRIC_SETUP,
    FA_ENABLE_NOW,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SETUP_LATER,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Images from "@assets";

// temp
const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

function EnableBiometrics({ onClose, onEnable, onSetupLater, isManage }) {
    const { updateModel, getModel } = useModelController();
    const { biometricType } = getModel("device");

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_BIOMETRIC_SETUP,
        });
    }, []);

    function handleToggleBio(enable) {
        AsyncStorage.setItem("biometricEnabled", `${enable}`);
        updateModel({
            auth: {
                biometricEnabled: enable,
            },
        });
    }

    async function handleEnableBiometric() {
        try {
            const prompt = await Biometrics.simplePrompt({
                promptMessage:
                    biometricType === Biometrics.FaceID ? "Face ID" : "Confirm biometrics",
            });

            if (prompt) {
                const { success } = prompt;

                if (success) {
                    handleToggleBio(true);
                    onEnable();
                } else {
                    console.tron.log("User cancelled biometric confirmation");
                }
            }
        } catch (error) {
            Alert.alert(
                biometricType === Biometrics.FaceID
                    ? "Face ID Authentication"
                    : `${
                          biometricType === Biometrics.TouchID ? "Touch ID" : "Biometrics"
                      } Authentication`,
                "Unable to verify biometrics"
            );
        }
    }

    function enableBiometricsAlert() {
        if (biometricType !== Biometrics.FaceID) {
            Alert.alert(
                `Allow ${
                    biometricType === Biometrics.TouchID ? "Touch ID" : "Biometrics"
                } for authentication?`,
                "",
                [
                    {
                        text: "Don't Allow",
                        onPress: handleToggleBio(false),
                        style: "cancel",
                    },
                    {
                        text: "Allow",
                        onPress: handleEnableBiometric,
                    },
                ]
            );
        } else {
            handleEnableBiometric();
        }
    }

    function handleClose() {
        onClose();
    }

    async function handleEnable() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_BIOMETRIC_SETUP,
            [FA_ACTION_NAME]: FA_ENABLE_NOW,
        });
        try {
            const { biometryType } = await Biometrics.isSensorAvailable();

            if (biometryType) {
                enableBiometricsAlert();
            } else {
                onEnable();
            }
        } catch (error) {
            onEnable();
        }
    }

    function handleLater() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_BIOMETRIC_SETUP,
            [FA_ACTION_NAME]: FA_SETUP_LATER,
        });
        onSetupLater();
    }

    function handleAndroid() {
        handleRequestClose(updateModel);
    }

    return (
        <Modal visible hardwareAccelerated animationType="slide" onRequestClose={handleAndroid}>
            <LogGesture modal>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={98}
                            paddingHorizontal={0}
                            header={
                                <HeaderLayout
                                    headerRightElement={
                                        isManage ? <CloseButton onPress={handleClose} /> : null
                                    }
                                />
                            }
                            useSafeArea
                        >
                            <>
                                <View style={styles.container}>
                                    <View style={styles.meta}>
                                        <View style={styles.thumbContainer}>
                                            <Animatable.Image
                                                animation="bounceIn"
                                                duration={500}
                                                delay={250}
                                                source={
                                                    biometricType === Biometrics.FaceID
                                                        ? Images.biometricFace
                                                        : Images.biometricPrint
                                                }
                                                style={
                                                    biometricType === Biometrics.FaceID
                                                        ? styles.faceId
                                                        : styles.thumb
                                                }
                                            />
                                        </View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            duration={250}
                                            delay={500}
                                        >
                                            <Typo
                                                fontSize={20}
                                                fontWeight="300"
                                                lineHeight={28}
                                                text={`Enable ${
                                                    biometricType === Biometrics.FaceID
                                                        ? "Face ID"
                                                        : Platform.OS === "ios"
                                                        ? "Touch ID"
                                                        : "biometric ID"
                                                } for instant access`}
                                            />
                                        </Animatable.View>
                                    </View>
                                </View>
                                <FixedActionContainer>
                                    <View style={styles.footer}>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            duration={250}
                                            delay={700}
                                            style={styles.footer}
                                        >
                                            <ActionButton
                                                fullWidth
                                                borderRadius={25}
                                                onPress={handleEnable}
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        text="Enable Now"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </Animatable.View>
                                        <Animatable.View
                                            animation="fadeInUp"
                                            duration={250}
                                            delay={800}
                                            style={styles.footer}
                                        >
                                            <TouchableOpacity
                                                onPress={handleLater}
                                                testID="biometric_set_later"
                                            >
                                                <Typo
                                                    color={ROYAL_BLUE}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text="Set Up Later"
                                                    textAlign="left"
                                                    style={styles.later}
                                                />
                                            </TouchableOpacity>
                                        </Animatable.View>
                                    </View>
                                </FixedActionContainer>
                            </>
                        </ScreenLayout>
                    </>
                </ScreenContainer>
            </LogGesture>
        </Modal>
    );
}

EnableBiometrics.propTypes = {
    onClose: PropTypes.func,
    onEnable: PropTypes.func,
    onSetupLater: PropTypes.func,
    isManage: PropTypes.bool,
};

const styles = StyleSheet.create({
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    faceId: {
        height: 110,
        width: 110,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    later: {
        paddingVertical: 24,
    },
    meta: {
        alignItems: "center",
        paddingHorizontal: 36,
    },
    thumb: {
        height: 120,
        width: 90,
    },
    thumbContainer: {
        marginBottom: 24,
    },
});

export default EnableBiometrics;

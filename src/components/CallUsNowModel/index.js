import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Modal, ScrollView, Linking, Platform } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import { LogGesture } from "@components/NetworkLog";
import Typo from "@components/Text";

import { WHITE, DODGER_BLUE, LIGHT_WHITE } from "@constants/colors";
import { CALL_US_NOW_MALAYSIA, CALL_US_NOW_OVERSEAS, CANCEL, MALAYSIA_NUMBER, OVERSEAS_NUMBER } from "@constants/strings";

const CallUsNowModel = ({ visible, onClose }) => {
    if (!visible) return null;

    const callNow = (number) => {
        const url = `${Platform.OS === "ios" ? "telprompt:" : "tel:"}${number}`;
        Linking.canOpenURL(url).then((canOpen) => {
            if (!canOpen) {
                console.log("invalid url");
            } else {
                Linking.openURL(url);
            }
        });
    };

    return (
        <>
            <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
            <Modal
                visible
                transparent
                hardwareAccelerated
                onRequestClose={onClose}
                animationType="fade"
            >
                <LogGesture modal>
                    <ScrollView
                        bounces={false}
                        contentContainerStyle={styles.flexFull}
                    >
                        <View style={styles.popupInner}>
                            <ActionButton
                                backgroundColor={LIGHT_WHITE}
                                componentCenter={
                                    <Typo
                                        fontSize={20}
                                        fontWeight="400"
                                        lineHeight={24}
                                        color={DODGER_BLUE}
                                        text={CALL_US_NOW_MALAYSIA}
                                    />
                                }
                                fullWidth
                                height={54}
                                borderRadius={13}
                                marginBottom={10}
                                onPress={() => callNow(MALAYSIA_NUMBER)}
                            />
                            <ActionButton
                                backgroundColor={LIGHT_WHITE}
                                componentCenter={
                                    <Typo
                                        fontSize={20}
                                        fontWeight="400"
                                        lineHeight={24}
                                        color={DODGER_BLUE}
                                        text={CALL_US_NOW_OVERSEAS}
                                    />
                                }
                                fullWidth
                                height={54}
                                borderRadius={13}
                                marginBottom={10}
                                onPress={() => callNow(OVERSEAS_NUMBER)}
                            />
                            <ActionButton
                                backgroundColor={WHITE}
                                componentCenter={
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={24}
                                        color={DODGER_BLUE}
                                        text={CANCEL}
                                    />
                                }
                                fullWidth
                                height={54}
                                borderRadius={13}
                                marginBottom={10}
                                onPress={onClose}
                            />
                        </View>
                    </ScrollView>
                </LogGesture>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    blur: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    flexFull: {
        flex: 1,
        width: "100%",
    },
    popupInner: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
        padding: 24,
    },
});

CallUsNowModel.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
};

export default CallUsNowModel;

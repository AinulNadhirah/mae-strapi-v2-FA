import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ActionButton from "@components/Buttons/ActionButton";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { YELLOW, WHITE, GREY, TRANSPARENT, BLACK } from "@constants/colors";

function SalesRepRequestPopup({ visible, onClose, onConfirm }) {
    const renderContent = () => {
        return <PopupBody onClose={onClose} onConfirm={onConfirm} />;
    };

    return <Popup visible={visible} onClose={onClose} ContentComponent={renderContent} />;
}

SalesRepRequestPopup.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
};

const PopupBody = ({ onClose, onConfirm }) => {
    const [message, setMessage] = useState("");

    const onMessageChange = (value) => {
        setMessage(value);
    };

    const onDone = () => {
        if (onConfirm) onConfirm(message);
    };

    return (
        <>
            <KeyboardAwareScrollView
                style={Style.container}
                behavior={Platform.OS === "ios" ? "padding" : ""}
                enabled
                showsVerticalScrollIndicator={false}
            >
                <Typo
                    text="Connect with a sales representative"
                    textAlign="left"
                    lineHeight={18}
                    fontWeight="600"
                    style={Style.title}
                />

                <Typo
                    text="How can we help you?"
                    textAlign="left"
                    lineHeight={20}
                    style={Style.subText}
                />

                <View style={Style.textAreaContainer}>
                    <TextInput
                        style={[Style.textArea, Style.inputFont]}
                        placeholder="e.g. I'd like to..."
                        maxLength={500}
                        numberOfLines={6}
                        multiline
                        allowFontScaling={false}
                        placeholderTextColor="rgb(199,199,205)"
                        underlineColorAndroid={TRANSPARENT}
                        autoFocus={Platform.OS === "ios"}
                        value={message}
                        onChangeText={onMessageChange}
                    />
                </View>
            </KeyboardAwareScrollView>
            <View style={Style.footerContainer}>
                <View style={Style.leftFooterContainer}>
                    <ActionButton
                        fullWidth
                        borderRadius={20}
                        height={40}
                        onPress={onClose}
                        backgroundColor={WHITE}
                        style={Style.leftButton}
                        componentCenter={
                            <Typo
                                text="Cancel"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                numberOfLines={1}
                                textBreakStrategys="simple"
                            />
                        }
                    />
                </View>
                <View style={Style.rightFooterContainer}>
                    <ActionButton
                        fullWidth
                        borderRadius={20}
                        height={40}
                        onPress={onDone}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo
                                text="Confirm"
                                fontWeight="600"
                                lineHeight={18}
                                numberOfLines={1}
                                textBreakStrategys="simple"
                            />
                        }
                    />
                </View>
            </View>
        </>
    );
};

PopupBody.propTypes = {
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
};

const Style = StyleSheet.create({
    container: {
        paddingBottom: 16,
        paddingHorizontal: 40,
        paddingTop: 40,
    },

    footerContainer: {
        flexDirection: "row",
        marginTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 40,
        width: "100%",
    },

    inputFont: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
    },

    leftButton: {
        borderColor: GREY,
        borderWidth: 1,
    },

    leftFooterContainer: {
        flexDirection: "row",
        paddingRight: 4,
        width: "50%",
    },

    rightFooterContainer: {
        flexDirection: "row",
        paddingLeft: 4,
        width: "50%",
    },

    subText: {
        flex: 1,
        marginBottom: 20,
        marginLeft: 5,
    },

    textArea: {
        height: 120,
        justifyContent: "flex-start",
        textAlignVertical: "top",
    },

    textAreaContainer: {
        borderColor: GREY,
        borderRadius: 8,
        borderWidth: 1,
        padding: 5,
    },

    title: {
        marginBottom: 20,
    },
});

export default SalesRepRequestPopup;

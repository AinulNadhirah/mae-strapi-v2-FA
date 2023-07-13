import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";

import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { GREY, MEDIUM_GREY } from "@constants/colors";

function DownpaymentOverlay({
    visible,
    onDone,
    onClose,
    onChange,
    keypadValue,
    displayValue,
    isValid,
    errorMessage,
}) {
    const donePress = () => {
        onDone(keypadValue);
    };

    const closePress = () => {
        onClose();
    };

    return (
        <>
            {visible && (
                <Animatable.View
                    style={Style.blur}
                    animation="fadeIn"
                    duration={200}
                    useNativeDriver
                >
                    <BlurView style={Style.blur} blurType="dark" blurAmount={10} />
                </Animatable.View>
            )}
            <Modal
                animationIn="fadeIn"
                animationOut="fadeOut"
                visible={visible}
                style={Style.modal}
                onRequestClose={closePress}
                useNativeDriver
                transparent
            >
                <View style={Style.containerBottom}>
                    {/* Overlay Mask - Used to hide this when tapped on this part */}
                    <TouchableWithoutFeedback onPress={closePress} style={Style.touchable}>
                        <View style={Style.empty} />
                    </TouchableWithoutFeedback>

                    {/* Overlay Content Body */}
                    <Animatable.View
                        animation="slideInUp"
                        duration={300}
                        useNativeDriver
                        style={Style.contentBody}
                    >
                        <View style={Style.outerContentBody}>
                            {/* Grey Dash */}
                            <View style={Style.greyDash} />

                            {/* Header */}
                            <Typo
                                fontSize={18}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                                text="Downpayment"
                                style={Style.headerText}
                            />

                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={displayValue}
                                editable={false}
                                isValidate
                                isValid={isValid}
                                errorMessage={errorMessage}
                            />
                        </View>

                        {/* Numeric Keyboard */}
                        <NumericalKeyboard
                            value={keypadValue}
                            onChangeText={onChange}
                            maxLength={12}
                            onDone={donePress}
                        />
                    </Animatable.View>
                </View>
            </Modal>
        </>
    );
}

DownpaymentOverlay.propTypes = {
    visible: PropTypes.bool.isRequired,
    onDone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.number,
    keypadValue: PropTypes.number,
    displayValue: PropTypes.string,
    isValid: PropTypes.bool,
    errorMessage: PropTypes.string,
};

DownpaymentOverlay.defaultProps = {
    visible: false,
    onDone: () => {},
    onClose: () => {},
    onChange: () => {},
};

const Style = StyleSheet.create({
    headerText: {
        marginBottom: 20,
    },

    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    containerBottom: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },

    contentBody: {
        backgroundColor: MEDIUM_GREY,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        width: "100%",
    },

    empty: {
        flex: 1,
        width: "100%",
    },

    greyDash: {
        alignSelf: "center",
        backgroundColor: GREY,
        borderRadius: 4,
        height: 6,
        marginBottom: 25,
        marginTop: 8,
        width: 40,
    },

    modal: {
        margin: 0,
    },

    outerContentBody: {
        marginBottom: 25,
        paddingHorizontal: 36,
    },

    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default DownpaymentOverlay;

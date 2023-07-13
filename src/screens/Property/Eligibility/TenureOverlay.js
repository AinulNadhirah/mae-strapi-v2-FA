import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeArea } from "react-native-safe-area-context";
import Slider from "react-native-slider";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { GREY, BLUE, WHITE, YELLOW, MEDIUM_GREY, LIGHT_GREY } from "@constants/colors";

function TenureOverlay({ visible, onDone, onClose, minValue, maxValue, value }) {
    const safeArea = useSafeArea();
    const [tenureValue, setTenureValue] = useState(5);

    useEffect(() => {
        if (isNaN(value)) {
            setTenureValue(5);
        } else {
            setTenureValue(parseInt(value));
        }
    }, [value]);

    const donePress = () => {
        onDone(tenureValue);
    };

    const closePress = () => {
        onClose();
    };

    function handleSliderChange(value) {
        setTenureValue(value);
    }

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
                            {/* Grey Dashs */}
                            <View style={Style.greyDash} />

                            {/* Header */}
                            <Typo
                                fontSize={18}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                                text="Adjust your financing period"
                            />

                            {/* Slider value */}
                            <Typo
                                fontSize={20}
                                fontWeight="600"
                                lineHeight={28}
                                style={Style.sliderValueCls}
                                text={`${tenureValue} years`}
                            />

                            {/* Slider component */}
                            <Slider
                                value={tenureValue}
                                minimumValue={minValue}
                                maximumValue={maxValue}
                                animateTransitions
                                animationType="spring"
                                step={1}
                                minimumTrackTintColor={BLUE}
                                maximumTrackTintColor={LIGHT_GREY}
                                trackStyle={Style.sliderTrackCls}
                                thumbStyle={Style.sliderThumbCls}
                                onValueChange={handleSliderChange}
                            />

                            {/* Min/Max Slider Value Label */}
                            <View style={Style.sliderMinMaxLabelCont}>
                                <Typo fontSize={12} lineHeight={18} text={`${minValue} years`} />
                                <Typo fontSize={12} lineHeight={18} text={`${maxValue} years`} />
                            </View>
                        </View>

                        {/* Bottom button container */}
                        <View
                            style={Style.bottomBtnContainer(
                                safeArea.bottom === 0 ? 36 : safeArea.bottom
                            )}
                        >
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo lineHeight={18} fontWeight="600" text="Confirm" />
                                }
                                onPress={donePress}
                            />
                        </View>
                    </Animatable.View>
                </View>
            </Modal>
        </>
    );
}

TenureOverlay.propTypes = {
    visible: PropTypes.bool.isRequired,
    onDone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    value: PropTypes.string,
};

TenureOverlay.defaultProps = {
    visible: false,
    onDone: () => {},
    onClose: () => {},
};

const Style = StyleSheet.create({
    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    bottomBtnContainer: (paddingBottom) => ({
        paddingHorizontal: 24,
        paddingBottom: paddingBottom,
    }),

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
        paddingHorizontal: 36,
    },

    sliderMinMaxLabelCont: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
        marginHorizontal: 10,
        marginTop: 5,
    },

    sliderThumbCls: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 13,
        borderWidth: 8,
        height: 26,
        width: 26,
    },

    sliderTrackCls: {
        borderRadius: 12,
        height: 8,
    },

    sliderValueCls: {
        paddingBottom: 8,
        paddingTop: 30,
    },

    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default TenureOverlay;

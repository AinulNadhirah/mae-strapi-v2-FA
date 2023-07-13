import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";
import ScrollPicker from "react-native-picker-scrollview";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, BLUE, DARK_GREY, GREY_200, WHITE, YELLOW } from "@constants/colors";

import { generateHaptic } from "@utils";

const ScrollPickerViewWithResetOption = (props) => {
    const showMenu = props.showMenu;
    const list = props.list ?? [];
    const selectedIndex = props?.selectedIndex ?? 0;
    const resetValue = props?.resetValue ?? false;
    const expandedMode = props.expandedMode ?? false;
    const leftButtonText = props?.leftButtonText;
    const rightButtonText = props?.rightButtonText;
    const onResetValueCallback = props?.onResetValueCallback;

    const [selectedValueIndex, setSelectedValueIndex] = useState(0);
    const [selectedValue, setSelectedValue] = useState({});

    useEffect(() => {
        setSelectedValueIndex(selectedIndex ?? 0);
        setSelectedValue(list?.length >= 1 ? list[selectedIndex ?? 0] : {});
    }, []);

    function _onSendDateBack() {
        props.onRightButtonPress(selectedValue, selectedValueIndex);
    }

    function onRightButtonPress() {
        const value = selectedValue;
        if (
            (selectedValueIndex === 0 &&
                (value === undefined || Object.keys(value).length === 0)) ||
            resetValue
        ) {
            if (resetValue) {
                if (onResetValueCallback) {
                    onResetValueCallback();
                }
            }
            setSelectedValue(list[0]);
            setSelectedValueIndex(0);

            props?.onRightButtonPress(list[0], 0);
        } else {
            _onSendDateBack();
        }
    }

    function _onLeftButtonPress() {
        props.onLeftButtonPress(selectedValue, selectedValueIndex);
    }

    const scrollpicker = useRef();

    function handleItemPress(data, index) {
        scrollpicker.current.scrollToIndex(index);
        setSelectedValue(data);
        setSelectedValueIndex(index);
        generateHaptic("impact", true);
    }

    function onValueChange(data, selectedIndex) {
        setSelectedValue(data);
        setSelectedValueIndex(selectedIndex);
        generateHaptic("impact", true);
    }

    function renderItem(data, index, isSelected) {
        if (index !== 0 && isSelected) {
            if (onResetValueCallback) {
                onResetValueCallback();
            }
        }

        function onPress(data, index) {
            handleItemPress(data, index);
        }

        function handlePress() {
            onPress(data, index);
        }

        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={styles.itemRowContainer}
            >
                {isSelected ? (
                    <View style={styles.itemRowSelectedContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={22}
                            color={BLACK}
                            text={data.name}
                            numberOfLines={2}
                        />
                    </View>
                ) : (
                    <Typo
                        fontSize={16}
                        fontWeight="normal"
                        lineHeight={22}
                        color={DARK_GREY}
                        text={data.name}
                        numberOfLines={2}
                    />
                )}
            </TouchableOpacity>
        );
    }

    return (
        <>
            {showMenu && (
                <Animatable.View style={styles.blur} animation="fadeIn" duration={200}>
                    <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
                </Animatable.View>
            )}
            <Modal
                animationIn="fadeIn"
                animationOut="fadeOut"
                visible={showMenu}
                style={styles.modal}
                onRequestClose={_onLeftButtonPress}
                // hideModalContentWhileAnimating
                useNativeDriver
                transparent
            >
                <View style={styles.containerBottom}>
                    <TouchableWithoutFeedback onPress={_onLeftButtonPress} style={styles.touchable}>
                        <View style={styles.empty}>
                            <View />
                        </View>
                    </TouchableWithoutFeedback>
                    <Animatable.View
                        animation="slideInUp"
                        duration={300}
                        useNativeDriver
                        style={styles.containerModal}
                    >
                        {/* Top bar section */}
                        <View style={styles.containerTopBar}>
                            {/* Close button */}
                            <View style={styles.btnClose}>
                                <TouchableOpacity onPress={_onLeftButtonPress}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="left"
                                        color={BLUE}
                                        text={leftButtonText ?? "Close"}
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Done button */}
                            <View style={styles.btnDone}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    borderRadius={15}
                                    height={30}
                                    width={96}
                                    componentCenter={
                                        <Typo
                                            fontSize={12}
                                            color={BLACK}
                                            fontWeight="600"
                                            lineHeight={15}
                                            text={rightButtonText ?? "Done"}
                                        />
                                    }
                                    onPress={onRightButtonPress}
                                />
                            </View>
                        </View>

                        {/* Picker section */}
                        <View style={styles.containerPicker}>
                            <ScrollPicker
                                ref={scrollpicker}
                                dataSource={list}
                                selectedIndex={selectedIndex ?? 0}
                                itemHeight={expandedMode ? 64 : 44}
                                wrapperHeight={240}
                                wrapperColor={WHITE}
                                highlightColor={GREY_200}
                                renderItem={renderItem}
                                onValueChange={onValueChange}
                            />
                        </View>
                    </Animatable.View>
                </View>
            </Modal>
        </>
    );
};

export const ScrollPickerViewWithResetOptionPropTypes = (ScrollPickerViewWithResetOption.propTypes =
    {
        showMenu: PropTypes.bool,
        list: PropTypes.array,
        selectedIndex: PropTypes.number,
        onRightButtonPress: PropTypes.func.isRequired,
        onLeftButtonPress: PropTypes.func.isRequired,
        rightButtonText: PropTypes.string.isRequired,
        leftButtonText: PropTypes.string.isRequired,
        expandedMode: PropTypes.bool,
        onValueChange: PropTypes.func,
        resetValue: PropTypes.bool,
        onResetValueCallback: PropTypes.func,
    });

const styles = StyleSheet.create({
    blur: { bottom: 0, elevation: 99, left: 0, position: "absolute", right: 0, top: 0 },
    btnClose: {
        backgroundColor: WHITE,
        flex: 1,
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: WHITE,
    },
    containerBottom: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    containerModal: {
        height: 300,
        width: "100%",
    },
    containerPicker: {
        height: 240,
        width: "100%",
    },
    containerTopBar: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        height: 60,
        paddingHorizontal: 24,
        width: "100%",
    },
    empty: {
        flex: 1,
        width: "100%",
    },
    itemRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    itemRowSelectedContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    modal: { margin: 0 },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export { ScrollPickerViewWithResetOption };

import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";
import ScrollPicker from "react-native-picker-scrollview";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, BLUE, DARK_GREY, GREY_200, WHITE, YELLOW } from "@constants/colors";

import { generateHaptic } from "@utils";

class ScrollPickerView extends Component {
    static propTypes = {
        showMenu: PropTypes.bool,
        list: PropTypes.array,
        selectedIndex: PropTypes.number,
        onRightButtonPress: PropTypes.func.isRequired,
        onLeftButtonPress: PropTypes.func.isRequired,
        rightButtonText: PropTypes.string.isRequired,
        leftButtonText: PropTypes.string.isRequired,
        expandedMode: PropTypes.bool,
        onValueChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            list: this.props.list,
            showMenu: this.props.showMenu,
            rand: 100,
            selectedValue:
                this.props.list.length >= 1
                    ? this.props.list[this.props.selectedIndex ? this.props.selectedIndex : 0]
                    : {},
            selectedValueIndex: this.props.selectedIndex ? this.props.selectedIndex : 0,
            expandedMode: this.props.expandedMode ? this.props.expandedMode : false,
            isScrolled: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.onValueChange) {
            this._handleScrollOnchange(prevProps, prevState);
        }
    }
    _handleScrollOnchange = (prevProps, prevState) => {
        if (
            (this.state.isScrolled &&
                this.state.isScrolled !== prevState?.isScrolled &&
                this.props?.showMenu &&
                this.state.selectedValueIndex !== this.props.selectedIndex) ||
            (prevProps?.list && this.props?.list?.length !== prevProps?.list?.length)
        ) {
            this.setState({
                selectedValueIndex: this.state.isScrolled ? this.state.selectedValueIndex : 0,
                selectedValue: this.state.isScrolled
                    ? this.props.list[this.state.selectedValueIndex]
                    : {},
            });
        }
    };

    _onSendDateBack = () => {
        this.props.onRightButtonPress(this.state.selectedValue, this.state.selectedValueIndex);
    };

    onRightButtonPress = () => {
        const value = this.state.selectedValue;
        if (
            (this.props.onValueChange && !this.state.isScrolled) ||
            (this.state.selectedValueIndex === 0 &&
                (value === undefined || Object.keys(value).length === 0)) || (this.state.selectedValueIndex === 0 && Object.keys(value).length !== 0)
        ) {
            this.setState({
                selectedValue: this.props.list[this.state.selectedValueIndex],
                selectedValueIndex: this.state.selectedValueIndex,
            });

            this.props.onRightButtonPress(this.props.list[this.state.selectedValueIndex], this.state.selectedValueIndex);
        } else {
            this._onSendDateBack();
        }
    };

    _onLeftButtonPress = () => {
        this.props.onLeftButtonPress(this.state.selectedValue, this.state.selectedValueIndex);
    };

    setRef = (ref) => (this.scrollpicker = ref);

    handleItemPress = (data, index) => {
        this.scrollpicker.scrollToIndex(index);

        this.setState(
            {
                selectedValue: data,
                selectedValueIndex: index,
                isScrolled: true,
            },
            () => {
                if (this.props.onValueChange) this.props.onValueChange(data, index);

                this.setState({ isScrolled: false });
            }
        );

        generateHaptic("impact", true);
    };

    onValueChange = (data, selectedIndex) => {
        this.setState(
            {
                selectedValue: data,
                selectedValueIndex: selectedIndex,
                isScrolled: true,
            },
            () => {
                if (this.props.onValueChange) this.props.onValueChange(data, selectedIndex);
                this.setState({ isScrolled: false });
            }
        );

        generateHaptic("impact", true);
    };

    renderItem = (data, index, isSelected) => {
        // const { expandedMode } = this.state;
        /**
         * overkill to get no arrow zzz
         */
        const onPress = (data, index) => this.handleItemPress(data, index);

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
    };

    render() {
        const { showMenu } = this.props;
        const { expandedMode } = this.state;

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
                    onRequestClose={this._onLeftButtonPress}
                    // hideModalContentWhileAnimating
                    useNativeDriver
                    transparent
                >
                    <View style={styles.containerBottom}>
                        <TouchableWithoutFeedback
                            onPress={this._onLeftButtonPress}
                            style={styles.touchable}
                        >
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
                                    <TouchableOpacity onPress={this._onLeftButtonPress}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="left"
                                            color={BLUE}
                                            text={
                                                this.props.leftButtonText
                                                    ? this.props.leftButtonText
                                                    : "Close"
                                            }
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
                                                text={
                                                    this.props.rightButtonText
                                                        ? this.props.rightButtonText
                                                        : "Done"
                                                }
                                            />
                                        }
                                        onPress={this.onRightButtonPress}
                                    />
                                </View>
                            </View>

                            {/* Picker section */}
                            <View style={styles.containerPicker}>
                                <ScrollPicker
                                    ref={this.setRef}
                                    dataSource={this.props.list ? this.props.list : []}
                                    selectedIndex={
                                        this.props.selectedIndex ? this.props.selectedIndex : 0
                                    }
                                    itemHeight={expandedMode ? 64 : 44}
                                    wrapperHeight={240}
                                    wrapperColor={WHITE}
                                    highlightColor={GREY_200}
                                    renderItem={this.renderItem}
                                    onValueChange={this.onValueChange}
                                />
                            </View>
                        </Animatable.View>
                    </View>
                </Modal>
            </>
        );
    }
}

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
    // itemContainer: {
    //     alignItems: "center",
    //     height: 44,
    //     justifyContent: "center",
    //     width: "100%",
    // },
    // itemContainerExpanded: {
    //     alignItems: "center",
    //     height: 64,
    //     justifyContent: "center",
    //     width: "100%",
    // },
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
    // selectedItemContainer: {
    //     alignItems: "center",
    //     backgroundColor: OFF_WHITE,
    //     height: 44,
    //     justifyContent: "center",
    //     width: "100%",
    // },
    // selectedItemContainerExpanded: {
    //     alignItems: "center",
    //     backgroundColor: OFF_WHITE,
    //     height: 64,
    //     justifyContent: "center",
    //     width: "100%",
    // },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export { ScrollPickerView };

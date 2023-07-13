import React, { Component, useCallback } from "react";
import {
    Animated,
    Easing,
    I18nManager,
    PanResponder,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from "react-native";
import PropTypes from "prop-types";
import { BLACK, RED } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const SwitchItem = ({ index, disabled, onSwitchItemPressed, isSelected, label, indicator }) => {
    const onPress = useCallback(() => onSwitchItemPressed(index), [onSwitchItemPressed, index]);

    return (
        <TouchableOpacity key={index} disabled={disabled} style={styles.button} onPress={onPress}>
            <Text
                style={[
                    styles.buttonText,
                    isSelected ? styles.selectedTextStyle : styles.textStyle,
                ]}
            >
                {label}
            </Text>
            {indicator && !isSelected ? <View style={styles.indicator} /> : <View />}
        </TouchableOpacity>
    );
};

SwitchItem.propTypes = {
    index: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    onSwitchItemPressed: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    indicator: PropTypes.bool.isRequired,
};

export default class SwitchSelector extends Component {
    static propTypes = {
        initial: PropTypes.number,
        options: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        animationDuration: PropTypes.number,
        onPress: PropTypes.func.isRequired,
        disableValueChangeOnPress: PropTypes.bool,
        returnAsObject: PropTypes.bool,
        indicator: PropTypes.bool,
    };

    static defaultProps = {
        initial: 0,
        disabled: false,
        animationDuration: 100,
        disableValueChangeOnPress: false,
        returnAsObject: false,
        indicator: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.initial ? this.props.initial : 0,
        };

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.shouldSetResponder,
            onMoveShouldSetPanResponder: this.shouldSetResponder,
            onPanResponderRelease: this.responderEnd,
            onPanResponderTerminate: this.responderEnd,
        });

        let value = 0;

        if (this.props.initial) {
            const { initial, options } = this.props;
            const v = initial / options.length;
            if (I18nManager.isRTL) value = -v;
            else value = v;
        }

        this.animatedValue = new Animated.Value(value);
    }

    shouldSetResponder = (evt, gestureState) => {
        return (
            evt.nativeEvent.touches.length === 1 &&
            !(Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5)
        );
    };

    responderEnd = (evt, gestureState) => {
        if (this.props.disabled) return;
        const swipeDirection = this._getSwipeDirection(gestureState);
        if (swipeDirection === "RIGHT" && this.state.selected < this.props.options.length - 1) {
            this.toggleItem(this.state.selected + 1);
        } else if (swipeDirection === "LEFT" && this.state.selected > 0) {
            this.toggleItem(this.state.selected - 1);
        } else return;
    };

    _getSwipeDirection(gestureState) {
        const { dx, dy, vx } = gestureState;
        if (Math.abs(vx) > 0.1 && Math.abs(dy) < 80) {
            return dx > 0 ? "RIGHT" : "LEFT";
        }
        return null;
    }

    getBgColor() {
        const { selected } = this.state;
        const { options } = this.props;
        return options[selected].activeColor;
    }

    animate = (value, last) => {
        this.animatedValue.setValue(last);
        Animated.timing(this.animatedValue, {
            toValue: value,
            duration: this.props.animationDuration,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();
    };

    toggleItem = (index, callOnPress = true) => {
        const { options, returnAsObject, onPress } = this.props;
        if (options.length <= 1 || index === null || isNaN(index)) return;
        this.animate(
            I18nManager.isRTL ? -(index / options.length) : index / options.length,
            I18nManager.isRTL
                ? -(this.state.selected / options.length)
                : this.state.selected / options.length
        );
        if (callOnPress && onPress) {
            onPress(returnAsObject ? options[index] : options[index].value);
        }
        this.setState({ selected: index });
    };

    _onLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        this.setState({
            sliderWidth: width,
        });
    };

    _onSwitchItemPressed = (index) => this.toggleItem(index);

    render() {
        const { disabled, indicator } = this.props;

        const options = this.props.options.map((element, index) => {
            const isSelected = this.state.selected === index;

            return (
                <SwitchItem
                    key={`${element.label}-${index}`}
                    index={index}
                    disabled={disabled}
                    isSelected={isSelected}
                    label={element.label}
                    onSwitchItemPressed={this._onSwitchItemPressed}
                    indicator={indicator}
                />
            );
        });

        return (
            <View style={styles.containerOne}>
                <View {...this._panResponder.panHandlers} style={styles.containerTwo}>
                    <View style={styles.containerThree} onLayout={this._onLayout}>
                        <View style={styles.containerFour}>
                            {!!this.state.sliderWidth && (
                                <Animated.View
                                    style={[
                                        styles.animatedContainer,
                                        {
                                            backgroundColor: this.getBgColor(),
                                            width:
                                                this.state.sliderWidth / this.props.options.length,
                                            transform: [
                                                {
                                                    translateX: this.animatedValue.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, this.state.sliderWidth],
                                                    }),
                                                },
                                            ],
                                        },
                                        styles.animated,
                                        getShadow({}),
                                    ]}
                                />
                            )}
                            {options}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const BUTTON_TEXT_BG_COLOR = "transparent";
const CONTAINER_COLOR = "#e5e5e5";

const styles = StyleSheet.create({
    animated: {
        borderWidth: 0,
        position: "absolute",
    },
    animatedContainer: {
        borderRadius: 22,
        height: 36,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    buttonText: {
        backgroundColor: BUTTON_TEXT_BG_COLOR,
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
    containerFour: {
        flex: 1,
        flexDirection: "row",
        borderColor: CONTAINER_COLOR,
        borderRadius: 22,
        borderWidth: 0,
    },
    containerOne: {
        flexDirection: "row",
    },
    containerThree: {
        backgroundColor: CONTAINER_COLOR,
        borderRadius: 22,
        height: 36,
    },
    containerTwo: {
        flex: 1,
    },
    indicator: {
        alignSelf: "center",
        backgroundColor: RED,
        borderRadius: 8,
        height: 8,
        marginLeft: 4,
        width: 8,
    },
    selectedTextStyle: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        textAlign: "center",
    },
    textStyle: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 18,
        textAlign: "center",
    },
});

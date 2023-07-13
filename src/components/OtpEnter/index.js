import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import CountDown from "react-native-countdown-component";
import FlashMessage from "react-native-flash-message";

import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typo from "@components/Text";
import Toast, { errorToastProp } from "@components/Toast";

import { FADE_GREY, BLACK, ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
import * as Strings from "@constants/strings";
import { TAC_RESEND_COUNTDOWN_SECONDS } from "@constants/url";

import Assets from "@assets";

const { width } = Dimensions.get("window");

class OtpEnter extends Component {
    static propTypes = {
        withTouch: PropTypes.bool,
        title: PropTypes.string,
        description: PropTypes.string,
        footer: PropTypes.string,
        enabled: PropTypes.bool,
        securepin: PropTypes.bool,
        otpScreen: PropTypes.bool,
        ischangepin: PropTypes.bool,
        subdescription: PropTypes.string,
        customErrMsg: PropTypes.string,
        changePin: PropTypes.bool,
        autoSubmit: PropTypes.bool,
        countDownInt: PropTypes.number,
        hideResendOTP: PropTypes.bool,
    };

    static defaultProps = {
        applyBackspaceTint: true,
        decimal: false,
        size: 0,
        withTouch: true,
        disabled: true,
        securepin: false,
        otpScreen: false,
        ischangepin: false,
        subdescription: "",
        customErrMsg: null,
        changePin: false,
        autoSubmit: false,
        hideResendOTP: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            defaultErrorMsg: Strings.OTP_ERR_MSG,
            pin: "",
            isOtpDisabled: true,
            stopTimertime: false,
            isKeyboardPress: false,
            timer: "",
            error: "",
            countDownInt: this.props.countDownInt ?? TAC_RESEND_COUNTDOWN_SECONDS,
        };
    }

    componentDidMount() {
        console.log("[OtpEnter] >> [componentDidMount]");
        if (this.props.securepin) {
            this.setState({ isOtpDisabled: false });
        }
    }

    changeText = (val) => {
        const { disabled, onDonePress, autoSubmit } = this.props;

        if (!disabled) {
            if (val.length < 6) {
                this.setState({ pin: val });
            } else if (val.length === 6) {
                if (autoSubmit && onDonePress) {
                    console.log("[OtpEnter][changeText] >> Value: " + val);
                    onDonePress(val);
                    this.setState({ pin: "" });
                } else {
                    this.setState({ pin: val });
                }
            } else {
                return;
            }
        }
    };

    doneClick = (val) => {
        const { pin } = this.state;
        const { disabled, onDonePress, customErrMsg } = this.props;

        if (!disabled) {
            if (pin.length === 6) {
                console.log("[OtpEnter][doneClick] >> Value: " + pin);

                if (onDonePress) onDonePress(pin);

                this.setState({ pin: "" });
            } else {
                // onDonePress(pin);
                this.showErrorToast(customErrMsg);
            }
        }
    };

    onFooterTap = () => {
        console.log("[OtpEnter] >> [onFooterTap]");

        const { onFooterPress } = this.props;

        this.setState({ isOtpDisabled: true, pin: "" });

        if (onFooterPress) onFooterPress();
    };

    onBioFingerTap = () => {
        console.log("[OtpEnter] >> [onBioFingerTap]");

        const { onTouchPress } = this.props;
        if (onTouchPress) onTouchPress();
    };

    onCountdownFinish = () => {
        console.log("[OtpEnter] >> [onCountdownFinish]");

        this.setState({ isOtpDisabled: false });
    };

    refForToast = (ref) => {
        this.toastRef = ref;
    };

    renderToastComponent = (props) => <Toast {...props} />;

    showErrorToast = (errorMessage) => {
        const { defaultErrorMsg } = this.state;

        this.toastRef.showMessage(
            errorToastProp({
                message: errorMessage || defaultErrorMsg,
            })
        );
    };

    render() {
        const { isOtpDisabled, pin, countDownInt } = this.state;
        const {
            title,
            description,
            subdescription,
            securepin,
            footer,
            withTouch,
            // autoValidate,
        } = this.props;

        return (
            <View style={Style.container}>
                <View style={Style.block}>
                    <View style={Style.contentContainer}>
                        {/* Title */}
                        <Typo
                            fontWeight="600"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text={title}
                            style={Style.titleContainer}
                        />

                        {/* Description */}
                        <Typo
                            fontWeight="300"
                            fontSize={20}
                            lineHeight={28}
                            textAlign="left"
                            text={description}
                            style={Style.descriptionContainer}
                        />

                        {/* Sub-Description */}
                        {subdescription && subdescription.length > 0 ? (
                            <Typo
                                color={FADE_GREY}
                                fontWeight="normal"
                                fontSize={12}
                                lineHeight={18}
                                textAlign="left"
                                text={subdescription}
                            />
                        ) : null}
                    </View>

                    {/* Pin block */}
                    <View style={Style.inputContainer}>
                        <OtpPin pin={pin} space="15%" ver={8} hor={8} border={5} />
                    </View>

                    <View style={Style.descStyle}>
                        {/* Resend & Countdown Component */}
                        <View style={Style.footerContainer}>
                            {securepin ? (
                                <TouchableOpacity
                                    disabled={isOtpDisabled && !securepin}
                                    onPress={this.onFooterTap}
                                >
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        color={ROYAL_BLUE}
                                        fontWeight="600"
                                        text={footer}
                                    />
                                </TouchableOpacity>
                            ) : (
                                !this.props.hideResendOTP && (
                                    <View style={Style.footerStyle}>
                                        {isOtpDisabled ? (
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={`${footer} in `}
                                            />
                                        ) : (
                                            <View style={Style.footerStyle}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    textAlign="left"
                                                    text={`OTP timeout. `}
                                                />
                                                <TouchableOpacity
                                                    disabled={isOtpDisabled && !securepin}
                                                    onPress={this.onFooterTap}
                                                >
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        color={ROYAL_BLUE}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        text={`${footer}?`}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        <View style={Style.timerContainer}>
                                            {isOtpDisabled && (
                                                <View style={Style.descStyle}>
                                                    <CountDown
                                                        until={countDownInt}
                                                        onFinish={this.onCountdownFinish}
                                                        size={7}
                                                        timeToShow={["M", "S"]}
                                                        timeLabels={{ m: null, s: null }}
                                                        digitStyle={Style.digitStyle}
                                                        separatorStyle={Style.seperator}
                                                        digitTxtStyle={Style.digitTextStyle}
                                                        showSeparator
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            )}
                        </View>

                        {/* Biometric Finger Component */}
                        <View style={Style.touchContainer}>
                            {withTouch && (
                                <TouchableOpacity onPress={this.onBioFingerTap}>
                                    <Image
                                        style={Style.image}
                                        source={Assets.biometricPrintCircular}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Keypad */}
                <NumericalKeyboard
                    value={pin}
                    onChangeText={this.changeText}
                    maxLength={6}
                    onDone={this.doneClick}
                />

                {/* Toast Msg Component */}
                <FlashMessage MessageComponent={this.renderToastComponent} ref={this.refForToast} />
            </View>
        );
    }
}

const Style = StyleSheet.create({
    block: {
        flexDirection: "column",
        flex: 1,
    },
    container: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        width: "100%",
    },
    contentContainer: {
        marginBottom: 42,
        marginHorizontal: 36,
    },
    descStyle: {
        flexDirection: "row",
    },
    descriptionContainer: {
        marginBottom: 8,
        marginTop: 8,
    },
    digitStyle: {
        backgroundColor: TRANSPARENT,
        fontFamily: "montserrat",
    },
    digitTextStyle: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        lineHeight: 18,
        textAlign: "center",
        width: 26,
    },
    footerContainer: {
        flex: 2,
        justifyContent: "flex-start",
        marginHorizontal: 36,
        marginTop: 20,
        width: width - 100,
    },
    footerStyle: {
        alignItems: "center",
        flexDirection: "row",
    },
    image: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: 50,
        width: 50,
    },
    inputContainer: {
        alignItems: "flex-start",
        alignSelf: "center",
        height: 50,
        justifyContent: "flex-start",
        width: width - 100,
    },
    seperator: {
        backgroundColor: TRANSPARENT,
        margin: 0,
        padding: 0,
    },
    timerContainer: {
        width: 40,
    },
    titleContainer: {
        marginBottom: 8,
        marginTop: 16,
    },
    touchContainer: {
        flex: 1,
        justifyContent: "flex-end",
        marginRight: 10,
        marginTop: 40,
    },
});

//make this component available to the app
export default OtpEnter;

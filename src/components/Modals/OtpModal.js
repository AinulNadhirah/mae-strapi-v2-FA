import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Modal } from "react-native";
import Config from "react-native-config";
import FlashMessage from "react-native-flash-message";

import { DASHBOARD, TAB, TAB_NAVIGATOR } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { LogGesture } from "@components/NetworkLog";
import OtpEnter from "@components/OtpEnter";
import Toast, { infoToastProp, errorToastProp } from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_OTP_VALIDATE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    ONE_TIME_PASSWORD,
    RESEND_OTP,
    SECURE2U_IS_DOWN,
} from "@constants/strings";

const Header = ({ onClosePress }) => {
    return <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onClosePress} />} />;
};

Header.propTypes = {
    onClosePress: PropTypes.func,
};

class OtpModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: false,
        };

        this.toastRef = {};
    }

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_VALIDATE,
        });
        const { otpCode, onLoadErrorMessage } = this.props;

        if (otpCode) this.displayOtp();

        if (onLoadErrorMessage) {
            this.displayError(onLoadErrorMessage);
        } else {
            if (this.props.isS2UDown) {
                this.toastRef.showMessage(
                    infoToastProp({
                        message: SECURE2U_IS_DOWN,
                    })
                );
            }
        }
    }

    displayError = (errorMessage) => {
        this.setState({ showLoader: false });

        console.log("[OtpModal] >> [displayError]");

        if (errorMessage) {
            this.toastRef.showMessage(
                errorToastProp({
                    message: errorMessage,
                })
            );
        }
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onClosePress = () => {
        this.props.onOtpClosePress();
    };

    onOtpDonePress = (code) => {
        console.log("onOtpDonePress", code);
        if (code.length != 6) {
            this.errorCallback(this.props.errorMessage);
            return;
        }

        this.setState(
            {
                showLoader: true,
            },
            () => {
                this.props.onOtpDonePress(code, this.errorCallback);
            }
        );
    };

    errorCallback = (errorMessage) => {
        console.log("[OtpModal] >> [errorCallback]");

        // Show error
        if (errorMessage) {
            this.displayError(errorMessage);
        }

        // Hide loader
        this.setState({
            showLoader: false,
        });
    };

    onResentOtpPress = () => {
        console.log("[OtpModal] >> [onResentOtpPress]");

        this.props.onResendOtpPress(this.displayOtp);
    };

    // -----------------------
    // API CALL
    // -----------------------

    displayOtp = () => {
        console.log("getOtp", this.props);
        if (Config?.DEV_ENABLE === "true") {
            const timeout = this.props.isS2UDown ? 6000 : 0;
            setTimeout(() => {
                this.toastRef.showMessage(
                    infoToastProp({
                        message: `Your Otp no. is ${this.props.otpCode}`,
                        position: "top",
                        duration: 6000,
                    })
                );
            }, timeout);
        }
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    refForToast = (ref) => {
        this.toastRef = ref;
    };

    homePageNavigation = () => {
        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: TAB,
            params: {
                screen: DASHBOARD,
                params: { refresh: true },
            },
        });
    };

    renderToastComponent = (props) =>
        !this.props.hideResendOTP ? (
            <Toast {...props} />
        ) : (
            <Toast onClose={this.homePageNavigation} {...props} />
        );

    render() {
        console.log("render", this.state);
        return (
            <Modal visible animated animationType="slide" hardwareAccelerated transparent>
                <LogGesture modal>
                    <ScreenContainer
                        backgroundType="color"
                        backgroundColor={MEDIUM_GREY}
                        showLoaderModal={this.state.showLoader}
                    >
                        <React.Fragment>
                            <ScreenLayout
                                scrollable={false}
                                paddingLeft={0}
                                paddingRight={0}
                                paddingBottom={0}
                                header={<Header onClosePress={this.onClosePress} />}
                            >
                                <View style={Styles.mainContainer}>
                                    {/* OTP */}
                                    <OtpEnter
                                        onDonePress={this.onOtpDonePress}
                                        title={ONE_TIME_PASSWORD}
                                        securepin={false}
                                        description={`Enter OTP sent to \n${this.props.mobileNumber}`}
                                        footer={RESEND_OTP}
                                        withTouch={false}
                                        disabled={false}
                                        otpScreen={true}
                                        onFooterPress={this.onResentOtpPress}
                                        hideResendOTP={this.props.hideResendOTP}
                                    />
                                </View>
                            </ScreenLayout>
                        </React.Fragment>
                    </ScreenContainer>
                    <FlashMessage
                        MessageComponent={this.renderToastComponent}
                        ref={this.refForToast}
                    />
                </LogGesture>
            </Modal>
        );
    }
}

OtpModal.propTypes = {
    errorMessage: PropTypes.string,
    mobileNumber: PropTypes.string,
    onLoadErrorMessage: PropTypes.func,
    onOtpClosePress: PropTypes.func,
    onOtpDonePress: PropTypes.func,
    onResendOtpPress: PropTypes.func,
    otpCode: PropTypes.string,
    hideResendOTP: PropTypes.bool,
    navigation: PropTypes.object,
    isS2UDown: PropTypes.bool,
};

OtpModal.defaultProps = {
    otpCode: "",
    mobileNumber: "",
    hideResendOTP: false,
    errorMessage: "Your OTP must consist of 6 digits",
    onOtpDonePress: () => {},
    onOtpClosePress: () => {},
    onResendOtpPress: () => {},
    isS2UDown: false,
};

export default withModelContext(OtpModal);

const Styles = {
    mainContainer: {
        flex: 1,
    },
};

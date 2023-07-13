import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    SET_PASSWORD,
    NTB_USERNAME_SCREEN,
    TAB_NAVIGATOR,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { validateForgotPasswordID, verifyM2uUserName, selfPwdResetVerifyOtpV2 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    VERIFY_OTP_EXCEEDED_CODE,
    FA_OTP_REQUEST,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import * as DataModel from "@utils/dataModel";
import { contactBankcall, getDeviceRSAInformation } from "@utils/dataModel/utility";

class MobileNumberConfirmation extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                refData: PropTypes.shape({
                    accessNo: PropTypes.any,
                    from: PropTypes.any,
                    idNo: PropTypes.any,
                    mobileNumber: PropTypes.any,
                    refNo: PropTypes.any,
                    token: PropTypes.any,
                    userName: PropTypes.any,
                    username: PropTypes.any,
                }),
            }),
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            mobileNumber: maskedMobileNumber(`${props.route?.params?.refData?.mobileNumber}`),
            displayOtpFlow: false,
            loading: false,
            notMine: false,
            hideResendOTP: false,
            refNo: props.route?.params?.refData?.refNo,
            token: props.route?.params?.refData?.token,
            username: props.route?.params?.refData?.username,
            accessNo: props.route?.params?.refData?.accessNo,
            idNo: props.route?.params?.refData?.idNo,
            userName: props.route?.params?.refData?.userName,
            from: props.route?.params?.refData?.from,
        };
    }

    componentDidMount = () => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_OTP_REQUEST,
        });
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        console.log("[MobileNumberConfirmation] >> [onScreenFocus]");
        if (this.state.from !== "NTB") {
            this.setState({ displayOtpFlow: true });
        }
    };

    handleBack = () => {
        console.log("[MobileNumberConfirmation] >> [handleBack]");
        this.props.navigation.goBack();
    };
    onOtpPress = (code, otpModalErrorCb) => {
        console.log("[MobileNumberConfirmation] >> [onOtpPress]");
        const data = {
            refNo: this.state.refNo,
            token: code,
        };

        this.verifyOtp(
            { otpCode: code, token: this.state.token, refNo: this.state.refNo },
            otpModalErrorCb
        );
    };

    verifyOtp = async (params, otpModalErrorCb) => {
        try {
            console.log("[ForgotPassword] >> [verifyOtp] decrypt : ", this.state.refNo);

            const { userName, idNo, accessNo } = this.state;
            const deviceInfo = this.props.getModel("device");
            const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
            const otpParams = {
                mobileSDKData: mobileSDK,
                token: await DataModel.encryptData(params.otpCode),
                refNo: params.refNo,
                accessNo: accessNo,
                username: await DataModel.encryptData(userName),
                idNo: idNo,
            };
            console.log("[ForgotPassword] >> [verifyOtp]: ", otpParams);
            const response = await selfPwdResetVerifyOtpV2(otpParams);
            if (response?.data?.result) {
                const result = response?.data?.result;
                if (result?.statusCode === "0000") {
                    otpModalErrorCb();
                    this.setState({ displayOtpFlow: false });
                    if (this.state.from === "NTB") {
                        //make verifyUserName api call
                        const verifyUserNameResp = await verifyM2uUserName(false, this.state.userName);
                        if (verifyUserNameResp) {
                            console.log("RES", verifyUserNameResp);
                            const authenticationObject = verifyUserNameResp?.data;
                            if (authenticationObject?.code === "200") {
                                this.setState({ displayOtpFlow: false });
                                //show user name and image for NTB screen
                                this.props.navigation.navigate(NTB_USERNAME_SCREEN, {
                                    refData: {
                                        refNo: this.state.refNo,
                                        userName: this.state.userName,
                                        authObj: authenticationObject,
                                        from: this.state.from,
                                        otpCode: params.otpCode,
                                    },
                                });
                            } else {
                                showErrorToast(
                                    authenticationObject.message
                                        ? authenticationObject.message
                                        : COMMON_ERROR_MSG
                                );
                            }
                        }
                    } else {
                        this.props.navigation.navigate(SET_PASSWORD, {
                            refData: {
                                refNo: this.state.refNo,
                                token: otpParams.token,
                                otpCode: params.otpCode,
                                userName: otpParams.username,
                                refData: {
                                    refNo: this.state.refNo,
                                    token: this.state.token,
                                    otpCode: params.otpCode,
                                },
                            },
                        });
                    }
                } else {
                    otpModalErrorCb(result?.statusDesc ?? response?.data?.message ?? "");
                }
            }
        } catch (err) {
            // showErrorToast(err.message ? err.message : Strings.COMMON_ERROR_MSG);
            if (err?.error?.code === VERIFY_OTP_EXCEEDED_CODE)
                this.setState({ hideResendOTP: true });
            otpModalErrorCb(err.message ? err.message : COMMON_ERROR_MSG);
        }
    };

    onOtpClosePress = () => {
        console.log("[ForgotPassword] >> [onOtpClosePress]");
        this.setState({ displayOtpFlow: false }, () => {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: DASHBOARD,
                params: { refresh: true },
            });
        });
    };
    onResendOtpPress = (resendCB) => {
        console.log("[ForgotPassword] >> [onResendOtpPress]");
        this.validateForgotPasswordIDAPICall(resendCB);
    };
    handleProceedOtp = () => {
        console.log("[MobileNumberConfirmation] >> [handleProceedOtp]");
        if (this.state.from === "NTB") {
            //make request otp
            this.validateForgotPasswordIDAPICall();
        } else {
            this.setState({ displayOtpFlow: true });
        }
    };
    handleNotMine = () => {
        console.log("[MobileNumberConfirmation] >> [handleNotMine]");
        this.setState({ notMine: true });
    };
    handleCloseNotMine = () => {
        console.log("[MobileNumberConfirmation] >> [handleCloseNotMine]");
        this.setState({ notMine: false });
    };
    handleCallHotline = () => {
        console.log("[MobileNumberConfirmation] >> [handleCallHotline]");
        this.setState(
            {
                notMine: false,
            },
            () => contactBankcall("1300886688")
        );
    };
    validateForgotPasswordIDAPICall = async (resendCB) => {
        console.log("[MobileNumberConfirmation] >> [validateForgotPasswordIDAPICall]");
        const data = await this.getAPIParams();
        validateForgotPasswordID(data)
            .then((respone) => {
                const result = respone?.data?.result;
                if (result?.statusCode === "0000") {
                    if (resendCB) {
                        this.setState(
                            { refNo: result?.refNo, token: result?.token, displayOtpFlow: true },
                            () => {
                                resendCB();
                            }
                        );
                    } else {
                        this.setState({
                            refNo: result?.refNo,
                            token: result?.token,
                            displayOtpFlow: true,
                        });
                    }
                    return;
                }
                showErrorToast({
                    message: result.statusDesc,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message,
                });
            });
    };
    getMobileNumber = () => {
        console.log("[MobileNumberConfirmation] >> [getMobileNumber]");
        return this.state.mobileNumber.startsWith("+")
            ? this.state.mobileNumber.substr(1)
            : this.state.mobileNumber;
    };
    // getAPIParams
    getAPIParams = async () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const username = await DataModel.encryptData(this.state.userName);
        const idNo = await DataModel.encryptData(this.state.idNo);
        const refNo = await DataModel.encryptData(this.state.refNo);
        const accessNo =
            this.state.from !== "NTB"
                ? await DataModel.encryptData(this.state.accessNo)
                : this.state.accessNo;
        return refNo
            ? {
                  refNo,
                  mobileSDKData: deviceInfo,
                  username,
                  accessNo,
                  idNo,
              }
            : {
                  mobileSDKData: deviceInfo,
                  username,
                  accessNo,
                  idNo,
              };
    };

    render() {
        const { displayOtpFlow, mobileNumber, loading, notMine } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={16}
                        paddingHorizontal={24}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                            />
                        }
                        useSafeArea
                    >
                        <View style={styles.wrapper}>
                            <View style={styles.container}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="One Time Password"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text={`Your OTP will be sent to\n${mobileNumber}. Please confirm your mobile number.`}
                                    textAlign="left"
                                />
                            </View>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    disabled={loading}
                                    isLoading={loading}
                                    borderRadius={25}
                                    onPress={this.handleProceedOtp}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Confirm"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                                <TouchableOpacity
                                    disabled={loading}
                                    onPress={this.handleNotMine}
                                    activeOpacity={0.8}
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Not Mine"
                                        textAlign="left"
                                        style={styles.changeNumber}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScreenLayout>
                    <Popup
                        visible={notMine}
                        onClose={this.handleCloseNotMine}
                        title="Contact Bank"
                        description="For any enquiries regarding your account, please call the Customer Care Hotline at 1 300 88 6688."
                        primaryAction={{
                            text: "Call Now",
                            onPress: this.handleCallHotline,
                        }}
                    />
                    {displayOtpFlow && (
                        <OtpModal
                            otpCode={this.state.token}
                            onOtpDonePress={this.onOtpPress}
                            onOtpClosePress={this.onOtpClosePress}
                            onResendOtpPress={this.onResendOtpPress}
                            mobileNumber={this.getMobileNumber()}
                            hideResendOTP={this.state.hideResendOTP}
                            navigation={this.props.navigation}
                        />
                    )}
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    label: {
        paddingVertical: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(MobileNumberConfirmation);

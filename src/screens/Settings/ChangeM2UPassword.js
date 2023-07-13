import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    TAB_NAVIGATOR,
    DASHBOARD,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    CHANGE_M2U_PASSWORD,
    SETTINGS,
    PROFILE_MODULE,
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { errorToastProp, showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { createOtp, changeM2UPassword, createOtpForgotLogin } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import {
    YELLOW,
    SILVER_CHALICE,
    FADE_GREY,
    SWITCH_GREY,
    DISABLED,
    MEDIUM_GREY,
    GARGOYLE,
} from "@constants/colors";
import { CHANGE_PASSWORD_VALIDATIONS, M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_CHANGE_PASSWORD } from "@constants/fundConstants";
import {
    CHANGE_PASSWORD,
    CHANGE_PASSWORDSUCESS,
    CONFIRM_PASSWORD,
    CONTINUE,
    CURRENT_PASSWORD,
    DATE_AND_TIME,
    FA_SETTINGS_CHANGEPASSWORD,
    NEW_PASSWORD,
    PREVIOUS_PASSWORDS,
    REFERENCE_ID,
    RESET_PASSWORD_FAILED,
    RESET_PASSWORD_SUCCESSFUL,
    SHOW_PASSWORD,
    WE_FACING_SOME_ISSUE,
    SUCC_STATUS,
    PWD_CHANGE_SUCCESSFUL,
    PWD_CHANGE_UNSUCCESSFUL,
    FA_PASSWORD_RESET_CREATE_PASSWORD,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import * as DataModel from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import * as Utility from "@utils/dataModel/utility";

import Assets from "@assets";

class ChangeM2UPassword extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
            replace: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                auth: PropTypes.string,
                isFromForgotPassword: PropTypes.bool,
                username: PropTypes.string,
                refNo: PropTypes.string,
            }),
        }),
    };
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState = () => {
        return {
            currentPassword: "",
            newPassword: "",
            ConfirmPassword: "",
            isSecurePassword: true,
            isSubmitButtonEnable: false,
            isFromForgotPassword: this.props?.route?.params?.isFromForgotPassword,
            isPasswordValidated: false,
            isNewPasswordValidated: false,
            isConfirmPasswordValidated: false,
            validationsData: CHANGE_PASSWORD_VALIDATIONS,
            showTACModal: false,
            tacParams: {},

            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            hideResendOTP: false,
            showOTP: false,
            token: "",
            refNo: "",
            mobileNumber: "",

            //S2U V4
            showS2UModal: false,
            mapperData: {},
            nonTxnData: { isNonTxn: true },
            isS2UDown: false,
        };
    };

    componentDidMount = () => {
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };
    onScreenFocus = () => {
        console.log("[ChangeM2UPassword] >> [onScreenFocus]");
        if (this.props?.route?.params?.auth === "successful") {
            this.getAPIParams().then((params) => {
                this.changePasswordAPICall(params);
            });
        }
    };
    resetState = () => {
        console.log("[ChangeM2UPassword] >> [resetState]");
        this.setState(this.getInitialState());
    };
    onNewPasswordChange = (text) => {
        this.setState({ newPassword: text }, () => {
            this.validatePasswordConditions(text, text.length);
        });
    };
    onCurrentPasswordChange = (text) => {
        this.setState(
            {
                currentPassword: text,
                isPasswordValidated: text.length >= 8 && text.length <= 12,
            },
            () => this.enableSubmitAction()
        );
    };
    onConfirmPasswordChange = (text) => {
        this.setState({ ConfirmPassword: text }, () => {
            this.validateConfirmPassword(text);
        });
    };
    validateConfirmPassword = (password) => {
        console.log("[ChangeM2UPassword] >> [validateConfirmPassword]");
        // Both Passwords Match Validations
        const newPassword = this.state.newPassword;
        const selectedValue = [...this.state.validationsData];

        selectedValue[4].status = newPassword === password && password.trim().length > 0;
        this.setState(
            {
                validationsData: selectedValue,
            },
            () => this.enableSubmitAction()
        );
    };
    enableSubmitAction = () => {
        console.log("[ChangeM2UPassword] >> [enableSubmitAction]");

        // Enable / disble Submit Button if all conditions are statisified
        const selectedValue = [...this.state.validationsData];
        const isValidPassword = selectedValue.every(function (e) {
            return e.status === true;
        });

        const currentPasswordValidated = this.state.isFromForgotPassword
            ? true
            : this.state.isPasswordValidated;

        this.setState({
            isSubmitButtonEnable: currentPasswordValidated && isValidPassword,
            isConfirmPasswordValidated: currentPasswordValidated && isValidPassword,
            isNewPasswordValidated: currentPasswordValidated && isValidPassword,
        });
    };

    validatePasswordConditions = (password, length) => {
        console.log("[ChangeM2UPassword] >> [validatePasswordConditions]");
        const selectedValue = [...this.state.validationsData];
        const user = this.props.getModel("user");

        const username = this.state.isFromForgotPassword
            ? this.props?.route?.params?.username
            : user?.username;
        console.log("username = " + username);
        // New and confirm password  Length validation
        selectedValue[0].status = length >= 8 && length <= 12;
        this.setState({ validationsData: selectedValue });

        // New and confirm password uppercase and alphanumeric validation
        const caseCharCheckValidate = DataModel.m2uPasswordRegex(password);
        selectedValue[1].status = caseCharCheckValidate;
        this.setState({ validationsData: caseCharCheckValidate });

        // New and confirm password consecutiveCharacters validation
        const consecutiveValidate = DataModel.consecutiveCharacters(password);
        selectedValue[2].status = password.trim().length >= 3 && !consecutiveValidate;
        this.setState({ validationsData: selectedValue });

        // New and confirm password include usernamee validation
        const tempuser = password.includes(username);
        selectedValue[3].status = !tempuser && password.trim().length > 0;
        this.setState({ validationsData: selectedValue });

        this.validateConfirmPassword(this.state.ConfirmPassword);
        this.enableSubmitAction();
    };

    onShowPasswordClick = () => {
        console.log("[ChangeM2UPassword] >> [onShowPasswordClick]");
        this.setState({ isSecurePassword: !this.state.isSecurePassword });
    };

    handleToastBar = (type, text) => {
        if (type) {
            showSuccessToast({ message: text });
            return;
        }
        showErrorToast({ message: text });
    };
    changePasswordAPICall = async (params) => {
        console.log("[ChangeM2UPassword] >> [changePasswordAPI]");
        try {
            const response = await changeM2UPassword(params);
            if (response) {
                const result = response?.data?.result;
                console.tron.log("Change Password ", result);
                this.setState({
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                });
                if (result?.statusCode === "0000") {
                    this.handleToastBar(true, CHANGE_PASSWORDSUCESS);
                    if (this.state.isFromForgotPassword) {
                        GASettingsScreen.onSuccessResetPassword();
                    } else {
                        GASettingsScreen.onSuccessChangePassword();
                    }
                } else if (result && result?.statusCode !== "0000") {
                    this.resetState();
                    this.handleToastBar(false, result.statusDesc);
                }
                this.props.navigation.navigate("Settings");
                return;
            }
        } catch (error) {
            this.callAPIErrorHandler(error);
        }
    };

    callAPIErrorHandler = (err) => {
        console.log("callAPIErrorHandler:error:", err);
        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428
            if (this.state.isFromForgotPassword) {
                GASettingsScreen.onOpenResetPasswordChallenge();
            }
            this.setState((prevState) => ({
                challenge: err.error.result.challenge,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: err.error.result.challenge.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
                tacParams: null,
                transferAPIParams: null,
            }));
        } else if (err.status === 423) {
            this.setState(
                {
                    tacParams: null,
                    transferAPIParams: null,
                    isRSALoader: false,
                    RSAError: false,
                    isSubmitDisable: true,
                    isRSARequired: false,
                },
                () => {
                    const reason = err.error.result?.statusDesc;
                    const loggedOutDateTime = err.error.result?.serverDate;
                    const lockedOutDateTime = err.error.result?.serverDate;
                    this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                        screen: "Locked",
                        params: {
                            reason,
                            loggedOutDateTime,
                            lockedOutDateTime,
                        },
                    });
                }
            );
        } else if (err.status === 422) {
            // RSA Deny
            const { statusDesc, additionalStatusDescription, serverDate } = err.error.result;

            const params = {
                statusDesc,
                additionalStatusDescription,
                serverDate,
                nextParams: { screen: DASHBOARD },
                nextModule: TAB_NAVIGATOR,
                nextScreen: "Tab",
            };
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params,
            });
        } else {
            this.resetState();
            this.handleToastBar(false, err?.payload?.message || err?.message);
            this.props.navigation.navigate("Settings");
        }
    };

    submitPress = async () => {
        console.log("[ChangeM2UPassword] >> [SubmitPressed]");
        if (this.state.isFromForgotPassword) {
            this.navigateToTACFlow();
            return;
        }
        //S2U V4
        try {
            const s2uInitResponse = await this.s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    const { getModel } = this.props;
                    const { isS2uV4ToastFlag } = getModel("misc");
                    this.setState({ isS2UDown: isS2uV4ToastFlag ?? false });
                    this.navigateToTACFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "ChangeM2UPassword");
            s2uSdkLogs(error, "Change Password");
        }
    };
    //S2U V4
    initS2UPull = async (s2uInitResponse) => {
        const {
            navigation: { navigate },
        } = this.props;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.message) {
                    console.log("challenge init request failed");
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    this.setState({
                        showS2UModal: true,
                        mapperData: challengeRes?.mapperData,
                    });
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: CHANGE_M2U_PASSWORD,
        };
        navigateToS2UReg(navigate, this?.route?.params, redirect);
    };

    //S2U V4
    s2uSDKInit = async () => {
        const transactionPayload = await this.getAPIParams();
        delete transactionPayload.mobileSDKData;
        return await init(FN_CHANGE_PASSWORD, transactionPayload);
    };

    //S2U V4
    onS2uDone = (response) => {
        const { transactionStatus, executePayload } = response;
        this.onS2uClose();
        const entryPoint = {
            entryStack: SETTINGS,
            entryScreen: PROFILE_MODULE,
            params: {},
        };
        let ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            const titleMessage =
                executePayload?.message?.toLowerCase() === SUCC_STATUS
                    ? PWD_CHANGE_SUCCESSFUL
                    : PWD_CHANGE_UNSUCCESSFUL;
            ackDetails = {
                ...ackDetails,
                titleMessage,
            };
        }
        handleS2UAcknowledgementScreen(ackDetails);
        this.resetState();
    };

    //S2U V4
    onS2uClose = () => {
        this.setState({ showS2UModal: false });
    };

    resetPasswordValidation = () => {
        return this.state.validationsData.map((prop) => (prop.status = false));
    };

    onSuccessAndFailedNavigation = (result) => {
        const isSuccessful = result?.statusCode === "0000" ?? result?.status;
        const statusDesc = result?.statusDesc ?? result?.message;
        const refNo = result?.refNo;
        const txnTime = result?.serverDate;
        const title = isSuccessful ? RESET_PASSWORD_SUCCESSFUL : RESET_PASSWORD_FAILED;

        const detailsArray = [];
        // Update details array
        if (!Utility.isEmpty(refNo)) {
            detailsArray.push({
                title: REFERENCE_ID,
                value: refNo,
            });
        }
        if (!Utility.isEmpty(txnTime)) {
            detailsArray.push({
                title: DATE_AND_TIME,
                value: txnTime,
            });
        }
        this.setState({ validationsData: this.resetPasswordValidation() }, () => {
            this.props.navigation.replace("ResetPasswordStatus", {
                ...this.props.route.params,
                isSuccessful,
                detailsArray,
                title,
                statusDesc,
            });
        });
    };

    onBackTap = () => {
        this.setState({ validationsData: this.resetPasswordValidation() }, () => {
            console.log("[ChangeM2UPassword] >> [handleBackTap]", this.state.validationsData);
            this.props.navigation.goBack();
        });
    };

    renderPasswordRules = (prop) => {
        return (
            <View style={styles.validationCircleView}>
                {prop.status ? (
                    <View style={styles.validationCircleChecked}>
                        <Image style={styles.tickImage} source={Assets.tickhighlighted} />
                    </View>
                ) : (
                    <View style={styles.validationCircle} />
                )}

                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    fontStyle="normal"
                    lineHeight={18}
                    letterSpacing={0}
                    color={FADE_GREY}
                    textAlign="left"
                    text={prop.desc}
                    style={styles.validationText}
                />
            </View>
        );
    };

    // getAPIParams
    getAPIParams = async () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        return {
            mobileSDKData: mobileSDK,
            oldPwd: await DataModel.encryptData(this.state.currentPassword),
            newPwd: await DataModel.encryptData(this.state.newPassword),
            newHashPwd: await DataModel.encryptData(this.state.ConfirmPassword),
        };
    };

    // RSA event
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        console.log("onChallengeQuestionSubmitPress", this.tac);
        const { challenge } = this.state;
        this.getAPIParams().then((params) => {
            this.setState(
                {
                    isRSALoader: true,
                    RSAError: false,
                    isSubmitDisable: true,
                },
                () => {
                    this.changePasswordAPICall({ ...params, challenge: { ...challenge, answer } });
                }
            );
        });
    };

    //TAC
    navigateToTACFlow = async () => {
        console.log("[ChangeM2UPassword] >> [navigateToTACFlow] = ");
        // Show TAC Modal
        if (this.state.isFromForgotPassword) {
            await this.requestOtpForgotPassword();
        } else {
            const params = {
                fundTransferType: "CHANGE_PASSWORD",
            };
            this.setState({ showTACModal: true, tacParams: params });
        }
    };

    onTACDone = (tac) => {
        console.log("[ChangeM2UPassword] >> [onTACDone]" + tac);
        this.verifyTAC(tac);
    };

    onTacModalCloseButtonPressed = () => {
        console.log("[ChangeM2UPassword] >> [onTacModalCloseButtonPressed]");
        this.setState({ showTACModal: false });
    };

    errorHandler = (error) => {
        console.log("[ChangeM2UPassword] >> [verifyTAC ERROR]" + JSON.stringify(error));
        showErrorToast({
            message: error?.message ?? WE_FACING_SOME_ISSUE,
        });
        this.setState({
            showTACModal: false,
        });
    };

    verifyTAC = async (code) => {
        console.log("[ChangeM2UPassword] >> [verifyTAC]");
        const fundTransferType = "CHANGE_PASSWORD_VERIFY";
        const subUrl = "/tac/validate";
        //VerifyTAC
        try {
            const params = JSON.stringify({
                fundTransferType,
                tacNumber: code,
            });
            const response = await createOtp(subUrl, JSON.parse(params));
            const responseObject = response?.data;
            console.log("[ChangeM2UPassword] >> [verifyTAC RESPONSE]", response?.data);
            this.setState({ showTACModal: false });
            if (responseObject?.responseStatus === "0000") {
                const apiParams = await this.getAPIParams();
                this.changePasswordAPICall(apiParams);
            } else {
                showErrorToast({
                    message:
                        responseObject?.responseStatus === "00A5" ||
                        responseObject?.responseStatus === "00A4"
                            ? responseObject?.statusDesc
                            : WE_FACING_SOME_ISSUE,
                });
            }
        } catch (error) {
            this.errorHandler(error);
            this.setState({
                showTACModal: false,
            });
        }
    };

    requestOtpForgotPassword = async (isResend, callback) => {
        const { username, refNo, isAccessNumber, isMAEAccount } = this.props?.route?.params;
        const params = {
            refNo,
            username: await DataModel.encryptData(username),
            ...(isAccessNumber && { caseParam: "accessNo" }),
            ...(isMAEAccount && { caseParam: "maeAccount" }),
        };
        createOtpForgotLogin("/otp", params)
            .then((response) => {
                console.log("response tes = ", JSON.stringify(response));
                const result = response?.data?.result;
                if (result?.statusCode === "0000") {
                    // Navigate to MobileNumber Flow
                    let mobileNumber = result?.mobNo.startsWith("+")
                        ? result?.mobNo.substr(1)
                        : result?.mobNo;

                    const first = mobileNumber.substring(0, 1);
                    const second = mobileNumber.substring(0, 2);
                    if (first === "0") {
                        mobileNumber = `6${mobileNumber}`;
                    } else if (second !== "60") {
                        mobileNumber = `60${mobileNumber}`;
                    }

                    this.setState({
                        token: result?.token,
                        mobileNumber: maskedMobileNumber(mobileNumber),
                        refNo: result?.refNo,
                    });

                    this.showOTPModal();

                    if (isResend) {
                        callback();
                    }
                    return;
                }
                showErrorToast({
                    message: result.statusDesc,
                });
            })
            .catch((error) => {
                console.log("[OtpModal][requestOtp] >> Exception: ", error);
                const message = `${error.message}`;

                this.toastRef.showMessage(
                    errorToastProp({
                        message,
                    })
                );

                // Hide TAC Modal for any other HTTP status code apart from 200
                this.hideOTPModal();
            })
            .finally(() => console.log("Finally ChangeM2UPassword"));
    };

    onOTPDone = (code, otpModalErrorCb) => {
        this.verifyForgotPasswordOTP(code, otpModalErrorCb);
    };

    showOTPModal = () => {
        this.setState({ showOTP: true });
    };

    hideOTPModal = () => {
        this.setState({ showOTP: false });
    };

    onOTPResend = (showOTPCb) => {
        this.requestOtpForgotPassword(true, showOTPCb);
    };

    verifyForgotPasswordOTP = async (code, errorCallback) => {
        const subUrl = "/otp/verify";
        const { username } = this.props?.route?.params;
        const { refNo } = this.state;
        const token = await DataModel.encryptData(code);
        const newPwd = await DataModel.encryptData(this.state.newPassword);
        console.log("username verifyForgotPasswordOTP= ", username, code);
        const otpParams = {
            token,
            refNo,
            newPwd,
        };

        console.log("otpParams = ", otpParams);
        //VerifyTAC
        try {
            const response = await createOtpForgotLogin(subUrl, otpParams);
            if (response?.data?.result) {
                const result = response?.data?.result;
                const resultCode = result?.statusCode;
                if (resultCode === "0000") {
                    errorCallback();
                    this.hideOTPModal();
                    this.onSuccessAndFailedNavigation(result);
                } else {
                    if (resultCode === "00A5") {
                        //stay on the TAC Modal and showing error toast
                        errorCallback(result?.statusDesc);
                    } else if (resultCode === "00A4") {
                        this.setState({ hideResendOTP: true });
                        errorCallback(result?.statusDesc);
                    } else {
                        this.onSuccessAndFailedNavigation(result);
                    }
                }
            }
        } catch (error) {
            this.onSuccessAndFailedNavigation(error);
        }
    };

    render() {
        const {
            currentPassword,
            newPassword,
            ConfirmPassword,
            isSecurePassword,
            validationsData,
            isSubmitButtonEnable,
            showTACModal,
            tacParams,
            showOTP,
            token,
            mobileNumber,
            isS2UDown,
        } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={
                    this.state.isFromForgotPassword
                        ? FA_PASSWORD_RESET_CREATE_PASSWORD
                        : FA_SETTINGS_CHANGEPASSWORD
                }
            >
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        scrollable
                        header={
                            <HeaderLayout
                                backgroundColor={GARGOYLE}
                                headerCenterElement={
                                    <Typo
                                        text={CHANGE_PASSWORD}
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            />
                        }
                        useSafeArea
                    >
                        <React.Fragment>
                            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                                <View style={styles.containerView}>
                                    {!this.state.isFromForgotPassword && (
                                        <View style={styles.passwordView}>
                                            <TextInput
                                                maxLength={12}
                                                autoFocus
                                                secureTextEntry={isSecurePassword}
                                                value={currentPassword}
                                                placeholder={CURRENT_PASSWORD}
                                                onChangeText={this.onCurrentPasswordChange}
                                                style={styles.inputtext}
                                            />
                                        </View>
                                    )}
                                    <View style={styles.passwordView}>
                                        <TextInput
                                            maxLength={12}
                                            secureTextEntry={isSecurePassword}
                                            value={newPassword}
                                            placeholder={NEW_PASSWORD}
                                            onChangeText={this.onNewPasswordChange}
                                            style={styles.inputtext}
                                        />
                                    </View>
                                    <View style={styles.passwordView}>
                                        <TextInput
                                            maxLength={12}
                                            secureTextEntry={isSecurePassword}
                                            value={ConfirmPassword}
                                            placeholder={CONFIRM_PASSWORD}
                                            onChangeText={this.onConfirmPasswordChange}
                                            style={styles.inputtext}
                                        />
                                    </View>
                                    <View style={styles.showPasswordView}>
                                        <TouchableOpacity
                                            style={styles.circle}
                                            onPress={this.onShowPasswordClick}
                                        >
                                            {!isSecurePassword && (
                                                <View style={styles.checkedCircle}>
                                                    <Image
                                                        style={styles.displayPasswordImage}
                                                        source={Assets.tickhighlighted}
                                                    />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={19}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={SHOW_PASSWORD}
                                            style={styles.radioBtnText}
                                        />
                                    </View>

                                    <View style={styles.validationView}>
                                        {validationsData.map((prop) =>
                                            this.renderPasswordRules(prop)
                                        )}
                                    </View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={PREVIOUS_PASSWORDS}
                                        style={styles.noteText}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </React.Fragment>
                        {this.state.showS2UModal && (
                            <Secure2uAuthenticationModal
                                token=""
                                onS2UDone={this.onS2uDone}
                                onS2uClose={this.onS2uClose}
                                s2uPollingData={this.state.mapperData}
                                transactionDetails={this.state.mapperData}
                                secure2uValidateData={this.state.mapperData}
                                nonTxnData={this.state.nonTxnData}
                                s2uEnablement={true}
                                navigation={this.props.navigation}
                                extraParams={{
                                    metadata: {
                                        txnType: "CHANGE_PASSWORD",
                                    },
                                }}
                            />
                        )}
                    </ScreenLayout>

                    {/* TAC Modal */}
                    {showTACModal && (
                        <TacModal
                            tacParams={tacParams}
                            validateByOwnAPI={true}
                            validateTAC={this.onTACDone}
                            onTacClose={this.onTacModalCloseButtonPressed}
                            isS2UDown={isS2UDown}
                        />
                    )}

                    {showOTP && (
                        <OtpModal
                            otpCode={token}
                            onOtpDonePress={this.onOTPDone}
                            onOtpClosePress={this.hideOTPModal}
                            onResendOtpPress={this.onOTPResend}
                            mobileNumber={mobileNumber}
                            hideResendOTP={this.state.hideResendOTP}
                            navigation={this.props.navigation}
                        />
                    )}

                    {/* Challenge Question */}
                    {this.state.isRSARequired && (
                        <ChallengeQuestion
                            loader={this.state.isRSALoader}
                            display={this.state.isRSARequired}
                            displyError={this.state.RSAError}
                            questionText={this.state.challengeQuestion}
                            onSubmitPress={this.onChallengeQuestionSubmitPress}
                            onSnackClosePress={this.onChallengeSnackClosePress}
                        />
                    )}

                    {/* Continue Button */}
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={isSubmitButtonEnable ? YELLOW : DISABLED}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={CONTINUE}
                                    />
                                }
                                disabled={!isSubmitButtonEnable}
                                onPress={this.submitPress}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        marginBottom: 36,
        width: "100%",
    },
    checkedCircle: {
        alignItems: "center",
        borderRadius: 7,
        height: 14,
        justifyContent: "center",
        width: 14,
    },
    circle: {
        alignItems: "center",
        borderColor: SILVER_CHALICE,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        width: 20,
    },
    container: {
        flex: 1,
    },
    containerView: {
        flex: 1,
        paddingBottom: 16,
        paddingHorizontal: 36,
    },
    displayPasswordImage: {
        height: 15,
        width: 15,
    },
    inputtext: {
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
    },
    noteText: {
        marginTop: 20,
    },
    passwordView: {
        height: 50,
        marginTop: 12,
    },
    radioBtnText: {
        marginLeft: 15,
        marginTop: -1,
    },
    showPasswordView: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 30,
    },
    tickImage: {
        height: 16,
        width: 16,
    },
    validationCircle: {
        alignItems: "center",
        backgroundColor: SWITCH_GREY,
        borderRadius: 4,
        height: 8,
        marginLeft: 3,
        marginTop: 5,
        width: 8,
    },
    validationCircleChecked: {
        alignItems: "center",
        borderRadius: 8,
        height: 16,
        marginTop: 5,
        width: 16,
    },
    validationCircleView: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 15,
    },
    validationText: {
        marginLeft: 15,
    },
    validationView: {
        flex: 1,
        marginTop: 15,
        paddingRight: 5,
    },
});

export default withModelContext(ChangeM2UPassword);

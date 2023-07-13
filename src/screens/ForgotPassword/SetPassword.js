import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { from } from "readable-stream";

import {
    TAB,
    TAB_NAVIGATOR,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { setPasswordV3 } from "@services";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import {
    YELLOW,
    SILVER_CHALICE,
    FADE_GREY,
    SWITCH_GREY,
    DISABLED,
    MEDIUM_GREY,
} from "@constants/colors";
import { CHANGE_PASSWORD_VALIDATIONS } from "@constants/data";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import Assets from "@assets";

class SetPassword extends Component {
    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState = () => {
        return {
            newPassword: "",
            ConfirmPassword: "",
            isSecurePassword: true,
            isSubmitButtonEnable: false,
            isnewPasswordValidated: false,
            isConfirmPasswordValidated: false,
            validationsData: CHANGE_PASSWORD_VALIDATIONS,
            from: this.props.route?.params?.refData?.from,
            userName: this.props.route?.params?.refData?.userName,

            // RSA State Objects
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
        };
    };
    onNewPasswordChange = (text) => {
        this.setState({ newPassword: text }, () => {
            this.validatePasswordConditions(text, text.length);
        });
    };
    onConfirmPasswordChange = (text) => {
        this.setState({ ConfirmPassword: text }, () => {
            this.validateConfirmPassword(text);
        });
    };
    validateConfirmPassword = (password) => {
        console.log("[SetPassword] >> [validateConfirmPassword]");
        // Both Passwords Match Validations
        const newPassword = this.state.newPassword;
        const selectedValue = [...this.state.validationsData];

        if (newPassword === password && password.trim().length > 0) {
            selectedValue[4].status = true;
            this.setState({ validationsData: selectedValue });
        } else {
            selectedValue[4].status = false;
            this.setState({ validationsData: selectedValue });
        }

        this.enableSubitmitAction();
    };
    enableSubitmitAction = () => {
        console.log("[SetPassword] >> [enableSubitmitAction]");

        // Enable / disble Submit Button if all conditions are statisified
        const selectedValue = [...this.state.validationsData];
        const isValidPassword = selectedValue.every(function (e) {
            return e.status === true;
        });
        if (isValidPassword) {
            this.setState({
                isSubmitButtonEnable: true,
                isConfirmPasswordValidated: true,
                isnewPasswordValidated: true,
            });
        }

        if (!isValidPassword) {
            this.setState({
                isSubmitButtonEnable: false,
                isConfirmPasswordValidated: false,
                isnewPasswordValidated: false,
            });
        }
        return;
    };

    validatePasswordConditions = (password, length) => {
        console.log("[SetPassword] >> [validatePasswordConditions]");
        const selectedValue = [...this.state.validationsData];

        const { userName } = this.state;

        // New and confirm password Length validation
        selectedValue[0].status = length >= 8 && length <= 12;
        this.setState({ validationsData: selectedValue });

        // New and confirm password uppercase and alphanumeric validation
        const caseCharCheckValidate = DataModel.m2uPasswordRegex(password);
        selectedValue[1].status = caseCharCheckValidate;
        this.setState({ validationsData: selectedValue });

        // New and confirm password consecutive Characters validation
        const consecutiveValidate = DataModel.consecutiveCharacters(password);
        selectedValue[2].status = password.trim().length > 3 && !consecutiveValidate;
        this.setState({ validationsData: selectedValue });

        // New and confirm password include username validation
        const tempuser = password.includes(userName);
        selectedValue[3].status = !tempuser && password.trim().length > 0;
        this.setState({ validationsData: selectedValue });

        this.validateConfirmPassword(this.state.ConfirmPassword);
        this.enableSubitmitAction();
    };

    onShowPasswordClick = () => {
        console.log("[SetPassword] >> [onShowPasswordClick]");
        this.setState({ isSecurePassword: !this.state.isSecurePassword });
    };
    submitPress = async () => {
        console.log("[SetPassword] >> [SubmitPressed]");
        const params = await this.getAPIParams();
        this.setPasswordAPICall(params);
    };
    resetState = () => {
        console.log("[SetPassword] >> [resetState]");
        this.setState(this.getInitialState());
    };
    handleBackTap = () => {
        console.log("[SetPassword] >> [handleBackTap]");
        const selectedValue = this.state.validationsData.map((prop) => (prop.status = false));
        this.setState({ validationsData: selectedValue }, () => {
            console.log("[SetPassword] >> [handleBackTap]", this.state.validationsData);
            this.props.navigation.goBack();
        });
    };
    handleClose = () => {
        console.log("[SetPassword] >> [handleClose]");

        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: TAB,
            params: {
                screen: DASHBOARD,
                params: { refresh: true },
            },
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

    setPasswordAPICall = async (params) => {
        console.log("[SetPassword] >> [setPasswordAPICall]");
        try {
            const respone = await setPasswordV3(params);
            const result = respone?.data?.result;
            this.setState({
                // update state values
                isRSARequired: false,
                isRSALoader: false,
            });

            if (result?.statusCode === "0000") {
                if (this.state.from === "NTB") {
                    this.props.navigation.navigate("Onboarding", {
                        screen: "OnboardingM2uPassword",
                        params: {
                            username: this.state.userName,
                            secureImage: this.props.route?.params?.refData?.secureImage,
                            securePhrase: this.props.route?.params?.refData?.caption,
                        },
                    });
                } else {
                    this.props.navigation.navigate(TAB_NAVIGATOR, {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    });
                }
                showSuccessToast({
                    message: Strings.REST_PASSWORD_SUCESS,
                });
                GASettingsScreen.onSuccessResetPassword();
                return;
            } else if (result?.statusCode === "9001") {
                //wrong otp entered
                setTimeout(() => {
                    this.handleBackTap();
                }, 2000);
            }
            showErrorToast({
                message: result?.statusDesc ?? Strings.COMMON_ERROR_MSG,
            });
        } catch (error) {
            this.callAPIErrorHandler(error);
        }
    };

    callAPIErrorHandler = (err) => {
        console.log("callAPIErrorHandler:error:", err);
        if (err.status === 428) {
            // Display RSA Challenge Questions if status is 428
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
            GASettingsScreen.onOpenResetPasswordChallenge();
        } else if (err.status === 423) {
            // RSA Locked
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
                    const reason = err.error.result?.statusDescription;
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
            const { statusDescription, serverDate } = err.error.result;

            const params = {
                statusDescription,
                additionalStatusDescription: "",
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
            console.log(`is Error`, err);
            const errMsg = err.message ? err.message : Strings.COMMON_ERROR_MSG;
            showErrorToast({
                message: errMsg,
            });
        }
    };
    // getAPIParams
    getAPIParams = async () => {
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const newPwd = await DataModel.encryptData(this.state.newPassword);
        const token = await DataModel.encryptData(this.props.route?.params?.refData?.otpCode);

        return {
            mobileSDKData: mobileSDK,
            newPwd,
            newHashPwd: "",
            challenge: {},
            refNo: this.props.route?.params?.refData?.refNo,
            token,
            oldPwd: "",
        };
    };
    // RSA event
    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = async (answer) => {
        console.log("onChallengeQuestionSubmitPress", this.tac);
        const { challenge } = this.state;
        let params = await this.getAPIParams();
        this.setState(
            {
                isRSALoader: true,
                RSAError: false,
                isSubmitDisable: true,
            },
            () => {
                this.setPasswordAPICall({ ...params, challenge: { ...challenge, answer } });
            }
        );
    };

    render() {
        const {
            newPassword,
            ConfirmPassword,
            isSecurePassword,
            validationsData,
            isSubmitButtonEnable,
        } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={Strings.FA_PASSWORD_RESET_CREATE_PASSWORD}
            >
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        scrollable
                        header={
                            <HeaderLayout
                                backgroundColor={"transparent"}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this.handleClose} />
                                }
                                headerLeftElement={
                                    <HeaderBackButton onPress={this.handleBackTap} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <React.Fragment>
                            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                                <View style={styles.containerView}>
                                    <Typo
                                        text={Strings.ACCOUNT_LOGIN}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.setPassword}
                                    />
                                    <Typo
                                        text={Strings.CREATE_PASSWORD}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        fontSize={20}
                                        lineHeight={28}
                                        textAlign="left"
                                        style={styles.createPassword}
                                    />
                                    <View style={styles.passwordView}>
                                        <TextInput
                                            maxLength={12}
                                            secureTextEntry={isSecurePassword}
                                            value={newPassword}
                                            placeholder={Strings.NEW_PASSWORD}
                                            onChangeText={this.onNewPasswordChange}
                                            style={styles.inputtext}
                                        />
                                    </View>
                                    <View style={styles.passwordView}>
                                        <TextInput
                                            maxLength={12}
                                            secureTextEntry={isSecurePassword}
                                            value={ConfirmPassword}
                                            placeholder={Strings.CONFIRM_PASSWORD}
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
                                            lineHeight={19}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={Strings.SHOW_PASSWORD}
                                            style={styles.radioBtnText}
                                        />
                                    </View>
                                    <View style={styles.validationView}>
                                        {validationsData.map(this.renderPasswordRules)}
                                    </View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        letterSpacing={0}
                                        textAlign="left"
                                        text={Strings.PREVIOUS_PASSWORDS}
                                        style={styles.noteText}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </React.Fragment>
                    </ScreenLayout>

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
                                        text="Continue"
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
    setPassword: {
        marginTop: 20,
    },
    createPassword: {
        marginTop: 10,
        flex: 1,
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        paddingBottom: 16,
    },
    checkedCircle: {
        borderRadius: 7,
        height: 14,
        width: 14,
        alignItems: "center",
        justifyContent: "center",
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
    displayPasswordImage: {
        height: 15,
        width: 15,
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
    bottomBtnContCls: {
        width: "100%",
        marginBottom: 36,
    },
});

export default withModelContext(SetPassword);

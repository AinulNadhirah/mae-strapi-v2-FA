import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LinearGradient from "react-native-linear-gradient";

import { APPLY_M2U_M2UPASSWORD } from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { maeRegisterM2U, maeRegisterM2UZestI, maeRegisterM2UCASA } from "@services";
import { logEvent } from "@services/analytics";
import { getGcmParams, getFCMToken } from "@services/pushNotifications";

import {
    YELLOW,
    FADE_GREY,
    SWITCH_GREY,
    DISABLED,
    MEDIUM_GREY,
    DISABLED_TEXT,
    BLACK,
} from "@constants/colors";
import { CHANGE_PASSWORD_VALIDATIONS } from "@constants/data";
import {
    PM1_NTB_USER,
    PMA_NTB_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGSI_NTB_USER,
} from "@constants/premierConfiguration";
import {
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    NEW_MAE,
    SHOW_PASSWORD,
    COMMON_ERROR_MSG,
    CREATE_PASSWORD,
    NEW_PASSWORD,
    CONFIRM_PASSWORD,
} from "@constants/strings";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import { saveCloudToken, setCloudTokenRequired } from "@utils/dataModel/utility";

import Assets from "@assets";

class MAEM2UPassword extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                filledUserDetails: PropTypes.any,
            }),
        }),
    };

    casaUsers = [PM1_NTB_USER, PMA_NTB_USER, KAWANKU_SAVINGS_NTB_USER, KAWANKU_SAVINGSI_NTB_USER];
    isCASA = false;

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        const navigateFrom = props.route.params?.filledUserDetails?.onBoardDetails2?.from;
        this.isCASA = this.casaUsers.includes(navigateFrom);
        if (navigateFrom === ZEST_NTB_USER || navigateFrom === NEW_MAE || this.isCASA) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: APPLY_M2U_M2UPASSWORD,
            });
        }
    }

    getInitialState = () => {
        return {
            filledUserDetails: this.props.route.params?.filledUserDetails,
            newPassword: "",
            ConfirmPassword: "",
            encryptedPW: "",
            isSecurePassword: true,
            isSubmitButtonEnable: false,
            isnewPasswordValidated: false,
            isConfirmPasswordValidated: false,
            validationsData: CHANGE_PASSWORD_VALIDATIONS,
        };
    };

    componentDidMount() {
        console.log("[MAEM2UPassword] >> [componentDidMount]");
    }

    onNewPasswordChange = (text) => {
        const newPassword = text.trim();
        this.setState({ newPassword }, () => {
            this.validatePasswordConditions(newPassword, newPassword.length);
        });
    };
    onConfirmPasswordChange = (text) => {
        const ConfirmPassword = text.trim();
        this.setState({ ConfirmPassword }, () => {
            this.validateConfirmPassword(ConfirmPassword);
        });
    };
    validateConfirmPassword = (password) => {
        console.log("[ChangeM2UPassword] >> [validateConfirmPassword]");
        // Both Passwords Match Validations
        const newPassword = this.state.newPassword;
        const selectedValue = [...this.state.validationsData];

        selectedValue[4].status = newPassword === password;
        this.setState(
            {
                validationsData: selectedValue,
            },
            () => this.enableSubmitAction()
        );
    };
    enableSubmitAction = () => {
        console.log("[ChangeM2UPassword] >> [enableSubitmitAction]");

        // Enable / disble Submit Button if all conditions are statisified
        const selectedValue = [...this.state.validationsData];
        const isValidPassword = selectedValue.every(function (e) {
            return e.status == true;
        });
        this.setState({
            isSubmitButtonEnable: isValidPassword,
            isConfirmPasswordValidated: isValidPassword,
            isnewPasswordValidated: isValidPassword,
        });
        return;
    };

    validatePasswordConditions = (password, length) => {
        console.log("[ChangeM2UPassword] >> [validatePasswordConditions]");

        const selectedValue = [...this.state.validationsData];
        // Added temp Remove After API integration
        const { username } = this.state.filledUserDetails.usernameDetails;

        // New and confirm password  Length validation
        selectedValue[0].status = length >= 8 && length <= 12;
        this.setState({ validationsData: selectedValue });

        // New and confirm password uppercase and alphanumeric validation
        const caseCharCheckValidate = DataModel.m2uPasswordRegex(password);
        selectedValue[1].status = caseCharCheckValidate;
        this.setState({ validationsData: caseCharCheckValidate });

        // New and confirm password consecutiveCharacters validation
        const consecutiveValidate = DataModel.consecutiveCharacters(password);
        selectedValue[2].status = password.length >= 3 && !consecutiveValidate;
        this.setState({ validationsData: selectedValue });

        // New and confirm password include usernamee validation
        const tempuser = password.includes(username);
        selectedValue[3].status = !tempuser;
        this.setState({ validationsData: selectedValue });

        this.validateConfirmPassword(this.state.ConfirmPassword);
        this.enableSubmitAction();
        if (length === 0) {
            this.state.validationsData.map((prop) => (prop.status = false));
        }
    };

    onShowPasswordClick = () => {
        console.log("[ChangeM2UPassword] >> [onShowPasswordClick]");
        this.setState({ isSecurePassword: !this.state.isSecurePassword });
    };

    resetState = () => {
        console.log("[ChangeM2UPassword] >> [resetState]");
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
        console.log("[MAEM2UPassword] >> [handleClose]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    submitClick = async () => {
        console.log("[MAEM2UPassword] >> [submitClick]");
        const { filledUserDetails, newPassword, ConfirmPassword } = this.state;
        // const deviceInfo = this.props.getModel("device");
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const { isPromotionsEnabled } = this.props.getModel("misc");
        let fcmToken = await AsyncStorage.getItem("fcmToken");
        //If no FCM token then get token and set it to AsyncStorage
        if (!fcmToken) {
            fcmToken = await getFCMToken();
        }
        const pnsRegParams = await getGcmParams(
            "",
            deviceId,
            fcmToken,
            isPromotionsEnabled ? "A" : "T"
        );
        const mobileSDKData = Utility.getDeviceRSAInformation(deviceInformation, DeviceInfo);
        const username = await DataModel.encryptData(filledUserDetails.usernameDetails.username);
        const password = await DataModel.encryptData(newPassword);
        const confirmPassword = await DataModel.encryptData(ConfirmPassword);
        const data = {
            username,
            password,
            confirmPassword,
            idNo: this.state.filledUserDetails.onBoardDetails2.idNo,
            deviceId,
            fullName: this.state?.filledUserDetails?.onBoardDetails?.fullName,
            UUIDKey: deviceInformation.HardwareID,
            devicePrint: "",
            deviceModel: deviceInformation.DeviceModel,
            mobileSDKData,
            pnsRegParams,
        };
        this.setState({ encryptedPW: data.password });
        console.log("[MAEOnboardDetails2][getNationalityList] >> Success --> ");

        if (this.state.filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER) {
            try {
                const response = await maeRegisterM2UZestI(data);

                const result = response?.data?.result;
                if (result?.statusCode === "0000") {
                    const filledUserDetails = this.prepareUserDetails(result);
                    this.props.navigation.navigate(navigationConstant.UPLOAD_SECURITY_IMAGE, {
                        filledUserDetails,
                    });

                    //save cloud token
                    await saveCloudToken(result?.cloudToken);
                    return;
                }
                showErrorToast({
                    message: result?.statusDesc ?? COMMON_ERROR_MSG,
                });
            } catch (error) {
                console.log("[MAEOnboardDetails2][maeRegisterM2UZestI] >> Failure");
                console.log(
                    "[MAEOnboardDetails2][maeRegisterM2UZestI] >> error" + JSON.stringify(error)
                );
                showErrorToast({
                    message: error.message,
                });
            }
        } else if (this.isCASA) {
            try {
                const response = await maeRegisterM2UCASA(data);
                console.log("[MAEOnboardDetails2][maeRegisterM2UCASA] >> Success");

                const result = response?.data?.result;

                if (result?.statusCode === "0000") {
                    const filledUserDetails = this.prepareUserDetails(result);
                    this.props.navigation.navigate(navigationConstant.UPLOAD_SECURITY_IMAGE, {
                        filledUserDetails,
                    });
                    return;
                }
                showErrorToast({
                    message: result?.statusDesc ?? COMMON_ERROR_MSG,
                });
            } catch (error) {
                console.log("[MAEOnboardDetails2][maeRegisterM2UCASA] >> Failure");
                console.log(
                    "[MAEOnboardDetails2][maeRegisterM2UCASA] >> error" + JSON.stringify(error)
                );
                showErrorToast({
                    message: error.message,
                });
            }
        } else {
            await setCloudTokenRequired(data);
            maeRegisterM2U(data)
                .then(async (response) => {
                    console.log("[MAEOnboardDetails2][getNationalityList] >> Success");
                    console.log(response);
                    const result = response?.data?.result;
                    if (result?.statusCode === "0000") {
                        const filledUserDetails = this.prepareUserDetails(result);
                        this.props.navigation.navigate(navigationConstant.UPLOAD_SECURITY_IMAGE, {
                            filledUserDetails,
                        });
                        return;
                    }
                    showErrorToast({});
                })
                .catch((error) => {
                    console.log("[MAEOnboardDetails2][getNationalityList] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        }
    };

    prepareUserDetails = (result) => {
        const MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.usernameDetails.password = this.state.encryptedPW;
        MAEUserDetails.registerUserResult = result;
        console.log("MAEM2UUsername >> prepareUserDetails >> ", MAEUserDetails);
        return MAEUserDetails;
    };

    renderPasswordRules = (prop) => {
        return (
            <View style={styles.validationCircleView}>
                {prop.status ? (
                    // <View style={styles.validationCircleChecked}>
                    <Image style={styles.tickImage} source={Assets.tickhighlighted} />
                ) : (
                    // </View>
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

    render() {
        const {
            newPassword,
            ConfirmPassword,
            isSecurePassword,
            validationsData,
            isSubmitButtonEnable,
        } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            backgroundColor="transparent"
                            headerRightElement={<HeaderCloseButton onPress={this.handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={this.handleBackTap} />}
                        />
                    }
                >
                    <ScrollView>
                        <KeyboardAwareScrollView
                            style={styles.container}
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                        >
                            <Typo
                                text="Create a Maybank2u ID"
                                fontWeight="600"
                                fontStyle="normal"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.setPassword}
                            />
                            <Typo
                                text={CREATE_PASSWORD}
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
                                    placeholder={NEW_PASSWORD}
                                    onChangeText={this.onNewPasswordChange}
                                    style={styles.inputtext}
                                />
                            </View>
                            <View style={styles.confirmPasswordView}>
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
                                {/* <TouchableOpacity
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
                                </TouchableOpacity> */}
                                <TouchableOpacity onPress={this.onShowPasswordClick}>
                                    <Image
                                        style={styles.image}
                                        source={
                                            !isSecurePassword
                                                ? Assets.icRadioChecked
                                                : Assets.icRadioUnchecked
                                        }
                                    />
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
                                {validationsData.map((prop) => this.renderPasswordRules(prop))}
                            </View>
                            <Typo
                                fontSize={12}
                                fontWeight="300"
                                lineHeight={18}
                                letterSpacing={0}
                                textAlign="left"
                                text="Note: Your new password must not be the same as your security phrase."
                                style={styles.noteText}
                            />
                        </KeyboardAwareScrollView>
                    </ScrollView>
                    <View style={styles.bottomBtnContCls}>
                        <LinearGradient
                            colors={["#efeff300", MEDIUM_GREY]}
                            style={styles.linearGradient}
                        />
                        <ActionButton
                            height={48}
                            fullWidth
                            borderRadius={24}
                            disabled={!isSubmitButtonEnable}
                            backgroundColor={isSubmitButtonEnable ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={isSubmitButtonEnable ? BLACK : DISABLED_TEXT}
                                    text="Continue"
                                />
                            }
                            onPress={this.submitClick}
                        />
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    confirmPasswordView: {
        marginTop: 10,
    },

    container: {
        marginBottom: 40,
        paddingHorizontal: 36,
    },
    createPassword: {
        marginTop: 10,
    },
    image: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        width: 20,
    },
    inputtext: {
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        //color: GREY
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    noteText: {
        marginTop: 20,
    },
    passwordView: {
        marginTop: 30,
    },
    radioBtnText: {
        marginLeft: 15,
        marginTop: -1,
    },
    setPassword: {
        marginTop: 20,
    },
    showPasswordView: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 30,
    },
    tickImage: {
        height: 16,
        marginLeft: 1,
        marginTop: 2,
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
    },
});

export default withModelContext(MAEM2UPassword);

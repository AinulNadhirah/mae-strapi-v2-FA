import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Keyboard, ScrollView, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { APPLY_M2U_SECURITY_PHRASE } from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { maeSecurityImgPhrase, m2uEnrollment } from "@services";
import { logEvent } from "@services/analytics";

import {
    YELLOW,
    DISABLED,
    FADE_TEXT_GREY,
    DISABLED_TEXT,
    BLACK,
    MEDIUM_GREY,
} from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, NEW_MAE } from "@constants/strings";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import * as DataModel from "@utils/dataModel";

class SecurityPhaseScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            securityPhrase: "",
            isValidSecurityPhrase: "",
            isNextDisabled: true,
        };
        const navigateFrom = props.route.params?.filledUserDetails?.onBoardDetails2?.from;
        if (navigateFrom === ZEST_NTB_USER || navigateFrom === NEW_MAE) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: APPLY_M2U_SECURITY_PHRASE,
            });
        }
    }

    componentDidMount() {
        console.log("[SecurityPhaseScreen] >> [componentDidMount]");
        // this.enrollmentCall();
    }

    onSecurityPhraseChange = (params) => {
        console.log("[SecurityPhaseScreen] >> [onSecurityPhraseChange]");
        const key = params["key"];
        const value = params["value"].trimStart();
        this.setState(
            {
                [key]: value,
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        console.log("[MAEM2UUsername] >> [enableDisableBtn]");
        if (this.state.securityPhrase) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    checkSecurityPhrase = () => {
        console.log("[SecurityPhaseScreen] >> [checkSecurityPhrase]");

        var securityPhrase = this.state.securityPhrase;

        let err = "";
        const err1 = "Please create a security phrase containing 4 to 40 characters.";
        const err2 = "Please remove invalid special characters.";

        // Min/max length check
        if (securityPhrase.length < 4 || securityPhrase.length > 40) {
            err = err1;
        }

        // Special character check
        if (!DataModel.alphaNumericRegex(securityPhrase)) {
            err = err2;
        }

        this.setState({ isValidSecurityPhrase: err });
        // If validation check passes, move to next screen
        return err ? false : true;
    };

    onContinueTap = async () => {
        console.log("[SecurityPhaseScreen] >> [onContinueTap]");
        // const filledUserDetails = this.prepareUserDetails();
        // this.props.navigation.navigate(navigationConstant.MAE_SECURITY_QUESTIONS , {filledUserDetails});
        // return;
        const { filledUserDetails, securityPhrase } = this.state;
        Keyboard.dismiss();
        if (this.checkSecurityPhrase()) {
            const data = {
                selectedImage: filledUserDetails.securityPhraseImage.selfieImage,
                securityPhrase: securityPhrase,
                username: await DataModel.encryptData(filledUserDetails.usernameDetails.username),
            };
            maeSecurityImgPhrase(data)
                .then((response) => {
                    console.log("[MAEOnboardDetails2][getNationalityList] >> Success");
                    const result = response.data.result;
                    if ((result.statusCode = "0000")) {
                        //registerUserResult
                        const filledUserDetails = this.prepareUserDetails();
                        if (
                            filledUserDetails.MAEAccountCreateResult?.nameScreenFlag &&
                            filledUserDetails.MAEAccountCreateResult?.nameScreenFlag === "Y"
                        ) {
                            this.props.navigation.navigate(
                                navigationConstant.MAE_APPLICATION_PROGRESS,
                                { filledUserDetails }
                            );
                        } else {
                            this.props.navigation.navigate(
                                navigationConstant.MAE_SECURITY_QUESTIONS,
                                {
                                    filledUserDetails,
                                }
                            );
                        }
                        return;
                    }
                    showErrorToast({
                        message: result.statusDesc,
                    });
                })
                .catch((error) => {
                    console.log("[MAEOnboardDetails2][getNationalityList] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        }
    };

    enrollmentCall = async () => {
        const { updateModel } = this.props;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        // const customerKey = this.state.filledUserDetails.registerUserResult.customerKey;
        const params = {
            grantType: "PASSWORD",
            tokenType: "LOGIN",
            // customerKey,
            username: this.state.filledUserDetails.usernameDetails.username,
            passwd: this.state.filledUserDetails.usernameDetails.password,
            mobileSDKData: {
                deviceDetail: deviceInformation.DeviceName,
                deviceId,
                deviceModel: deviceInformation.DeviceModel,
                deviceName: deviceInformation.DeviceName,
                devicePrint: deviceInformation.DeviceName,
                osType: Platform.OS,
                osVersion: deviceInformation.DeviceSystemVersion,
                rsaKey: deviceInformation.RSA_ApplicationKey,
            },
        };
        console.log(params);
        // const response = await m2uEnrollment(params, true);

        m2uEnrollment(params, true)
            .then((response) => {
                console.log("[MAEOnboardDetails2][getNationalityList] >> Success");
                if (response && response.data) {
                    const { access_token, refresh_token, cus_key } = response.data;
                    updateModel({
                        auth: {
                            token: access_token,
                            refreshToken: refresh_token,
                            customerKey: cus_key,
                            isPostLogin: false,
                        },
                        qrPay: {
                            authenticated: false,
                        },
                        property: {
                            isConsentGiven: false,
                            JAAcceptance: false,
                        },
                    });

                    const { filledUserDetails } = this.state;
                    filledUserDetails.authData = response.data;
                    // this.props.navigation.navigate(navigationConstant.MAE_SECURITY_QUESTIONS , {filledUserDetails});
                    return;
                }
                showErrorToast({
                    message: result.statusDesc,
                });
            })
            .catch((error) => {
                console.log("[MAEOnboardDetails2][getNationalityList] >> Failure");
                showErrorToast({
                    message: error.message,
                });
            });
    };

    prepareUserDetails = () => {
        const securityPhraseDetails = { securityPhrase: this.state.securityPhrase };
        let MAEUserDetails = this.state.filledUserDetails || {};
        MAEUserDetails.securityPhrase = securityPhraseDetails;
        console.log("SecurityPhaseScreen >> prepareUserDetails >> ", MAEUserDetails);
        return MAEUserDetails;
    };

    onCloseTap = () => {
        console.log("[SecurityPhaseScreen] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    render() {
        const { securityPhrase, isValidSecurityPhrase, isNextDisabled, filledUserDetails } =
            this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            filledUserDetails?.from != "updateDetails" ? (
                                <HeaderLayout
                                    headerRightElement={
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    }
                                />
                            ) : null
                        }
                    >
                        <ScrollView>
                            <View
                                style={
                                    filledUserDetails?.from === "updateDetails"
                                        ? styles.updateFormContainer
                                        : styles.fieldContainer
                                }
                            >
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={"Create a Maybank2u ID"}
                                />
                                <Typo
                                    fontSize={20}
                                    lineHeight={33}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={"Enter a security phrase."}
                                />
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    color={FADE_TEXT_GREY}
                                    text={
                                        "Your security phrase may consist of up to 40 alphanumeric characters. Spaces are allowed."
                                    }
                                />
                                <View style={styles.inputContainer}>
                                    <LongTextInput
                                        maxLength={40}
                                        isValid={!isValidSecurityPhrase}
                                        isValidate
                                        errorMessage={isValidSecurityPhrase}
                                        value={securityPhrase}
                                        autoCapitalize="none"
                                        autoFocus
                                        numberOfLines={2}
                                        placeholder={"Enter Security Phrase"}
                                        onChangeText={(value) => {
                                            this.onSecurityPhraseChange({
                                                key: "securityPhrase",
                                                value,
                                            });
                                        }}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueTap}
                                disabled={isNextDisabled}
                                backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                        text="Continue"
                                    />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    confirmButton: {
        marginTop: 40,
    },
    containerTitle: {
        marginBottom: 8,
        marginTop: 24,
    },
    fieldContainer: {
        marginHorizontal: 36,
    },
    updateFormContainer: {
        marginHorizontal: 36,
        marginTop: 80,
    },
    viewContainer: {
        flex: 1,
    },
    inputContainer: {
        marginTop: 46,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(SecurityPhaseScreen);

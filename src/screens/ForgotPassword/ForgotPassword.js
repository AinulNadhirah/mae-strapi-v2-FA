import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    FORGOT_PASSWORD_MOBILE_CONFIRMATION,
    FORGOT_PASSWORD_NTB,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

// import OtpModal from "@components/Modals/OtpModal";
import { validateForgotPasswordID, forgotLoginValidateReq } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import Assets from "@assets";

class ForgotPassword extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                refNo: PropTypes.any,
            }),
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            cardNumber: "",
            idNumber: "",
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupType: "",
            isSubmitDisabled: true,
            isValidUsername: "",
            isValidCardNumber: "",
            isValidIdNumber: "",
            passwordParams: {},
            displayOtpFlow: false,
            refNo: "",
            token: "",
            mobileNumber: "",
        };
    }
    enableDisableBtn = () => {
        console.log("[ForgotPassword] >> [enableDisableBtn]");
        const { username, cardNumber, idNumber } = this.state;
        if (username.length > 0 && cardNumber.length > 0 && idNumber.length > 0) {
            this.setState({ isSubmitDisabled: false });
            return;
        }
        this.setState({ isSubmitDisabled: true });
    };
    onInputTextChange = (key, value) => {
        console.log("[ForgotPassword] >> [onInputTextChange]");
        this.setState(
            {
                [key]: value,
                isValidExp: "",
                isValidName: "",
                isValidNumber: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onConfirmTap = () => {
        console.log("[ForgotPassword] >> [onConfirmTap]");
        this.validateIDNumber();
    };

    validateIDNumber = async () => {
        console.log("[ForgotPassword] >> [validateIDNumber]");
        const deviceInfo = this.props.getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const username = await DataModel.encryptData(this.state.username);
        const accessNo = await DataModel.encryptData(this.state.cardNumber);
        const idNo = await DataModel.encryptData(this.state.idNumber);

        const refNo = this.props.route?.params?.refNo;
        if (refNo) {
            //from ForgotLoginDetails
            const params = {
                mobileSDKData: mobileSDK,
                username,
                accessNo,
                idNo,
                refNo,
            };
            forgotLoginValidateReq(params)
                .then((respone) => {
                    const result = respone.data.result;
                    this.handleApiResponse(result);
                })
                .catch((error) => {
                    console.log(`is Error`, error);
                    showErrorToast({
                        message: error.message,
                    });
                });
        } else {
            const data = {
                mobileSDKData: mobileSDK,
                username,
                accessNo,
                idNo,
            };
            validateForgotPasswordID(data)
                .then((respone) => {
                    const result = respone.data.result;
                    this.handleApiResponse(result);
                })
                .catch((error) => {
                    console.log(`is Error`, error);
                    showErrorToast({
                        message: error.message,
                    });
                });
        }
    };

    handleApiResponse = (result) => {
        if (result?.statusCode === "0000") {
            // Navigate to MobileNumber Flow
            let mobileNumber = result?.mobNo.startsWith("+")
                ? result?.mobNo.substr(1)
                : result?.mobNo;

            let first = mobileNumber.substring(0, 1);
            let second = mobileNumber.substring(0, 2);
            if (first == "0") {
                mobileNumber = `6${mobileNumber}`;
            } else if (second !== "60") {
                mobileNumber = `60${mobileNumber}`;
            }

            this.props.navigation.navigate(FORGOT_PASSWORD_MOBILE_CONFIRMATION, {
                refData: {
                    refNo: result?.refNo,
                    token: result?.token,
                    mobileNumber: mobileNumber,
                    userName: this.state.username,
                    accessNo: this.state.cardNumber,
                    idNo: this.state.idNumber,
                },
            });
            return;
        }
        showErrorToast({
            message: result.statusDesc,
        });
    };

    onCardNumberPress = () => {
        console.log("[ForgotPassword] >> [onCardNumberPress]");
        this.setState({
            isPopupDisplay: true,
            popupTitle: Strings.CARD_ACCESS,
            popupDesc: Strings.CARD_ACCESS_DETAILS,
            popupType: "CardNumber",
        });
    };

    onIdNumberPress = () => {
        console.log("[ForgotPassword] >> [onIdNumberPress]");
        this.setState({
            isPopupDisplay: true,
            popupTitle: Strings.CARD_IDNUMBER,
            popupDesc: Strings.CARD_IDNUMBER_DETAIL,
            popupType: "IdNumber",
        });
    };
    onPressOnlyMAEAccount = () => {
        console.log("[ForgotPassword] >> [onPressOnlyMAEAccount]");
        this.props.navigation.navigate(FORGOT_PASSWORD_NTB);
    };
    handleClose = () => {
        console.log("[ForgotPassword] >> [handleClose]");
        this.props.navigation.goBack();
    };
    popupClose = () => {
        console.log("[ForgotPassword] >> [handleClose]");
        this.setState({ isPopupDisplay: false });
    };
    render() {
        const {
            username,
            cardNumber,
            idNumber,
            isPopupDisplay,
            popupTitle,
            popupDesc,
            isSubmitDisabled,
            isValidUsername,
            isValidCardNumber,
            isValidIdNumber,
        } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                backgroundColor={TRANSPARENT}
                                headerCenterElement={
                                    <Typo
                                        text="Forgot Password"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this.handleClose} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                            <View style={styles.containerView}>
                                <Typo
                                    text={Strings.RESET_PASSWORD}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign="left"
                                    style={styles.resetPassword}
                                />

                                {/* Username  */}
                                <View style={styles.containerTitle}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Username"
                                    />
                                    <TextInput
                                        maxLength={20}
                                        isValidate
                                        isValid={!isValidUsername}
                                        errorMessage={isValidUsername}
                                        value={username}
                                        placeholder="Enter your username"
                                        onChangeText={(value) => {
                                            this.onInputTextChange("username", value);
                                        }}
                                    />
                                </View>

                                {/* card Number  */}
                                <View style={styles.containerTitle}>
                                    <View style={styles.cardContainerTitle}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Card/Access Number"
                                        />
                                        <TouchableOpacity onPress={this.onCardNumberPress}>
                                            <Image
                                                source={Assets.passwordInfo}
                                                style={styles.image}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput
                                        maxLength={20}
                                        value={cardNumber}
                                        isValidate
                                        keyboardType="numeric"
                                        returnKeyType="done"
                                        isValid={!isValidCardNumber}
                                        errorMessage={isValidCardNumber}
                                        placeholder="Enter your card No."
                                        onChangeText={(value) => {
                                            this.onInputTextChange("cardNumber", value);
                                        }}
                                    />
                                </View>

                                {/* Id Number  */}
                                <View style={styles.containerTitle}>
                                    <View style={styles.cardContainerTitle}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text="ID Number"
                                        />
                                        <TouchableOpacity onPress={this.onIdNumberPress}>
                                            <Image
                                                source={Assets.passwordInfo}
                                                style={styles.image}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput
                                        maxLength={20}
                                        value={idNumber}
                                        isValidate
                                        isValid={!isValidIdNumber}
                                        errorMessage={isValidIdNumber}
                                        placeholder="Enter ID number"
                                        onChangeText={(value) => {
                                            this.onInputTextChange("idNumber", value);
                                        }}
                                    />
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                        {/* Continue Button */}
                        <FixedActionContainer>
                            <View style={styles.footerContainer}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    }
                                    onPress={this.onConfirmTap}
                                    disabled={isSubmitDisabled}
                                    backgroundColor={isSubmitDisabled ? DISABLED : YELLOW}
                                />
                                <TouchableOpacity
                                    onPress={this.onPressOnlyMAEAccount}
                                    activeOpacity={0.8}
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="I only have a MAE account"
                                        textAlign="left"
                                        style={styles.changeNumber}
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
                    </ScreenLayout>
                    <Popup
                        visible={isPopupDisplay}
                        title={popupTitle}
                        description={popupDesc}
                        onClose={this.popupClose}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    cardContainerTitle: {
        flexDirection: "row",
    },
    changeNumber: {
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    containerTitle: {
        marginTop: 24,
    },
    containerView: {
        flex: 1,
    },
    footerContainer: {
        alignItems: "center",
        flex: 1,
    },
    image: {
        height: 15,
        marginLeft: 5,
        marginTop: 2,
        width: 15,
    },
    resetPassword: {
        marginTop: 20,
    },
});

export default withModelContext(ForgotPassword);

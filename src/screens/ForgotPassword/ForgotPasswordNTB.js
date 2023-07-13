import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { FORGOT_PASSWORD_MOBILE_CONFIRMATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { validateNTBCustDetails } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

const TRANSPARENT = "transparent";

class ForgotPasswordNTB extends Component {
    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            idNumber: "",
            mobileNumber: "",
            email: "",
            isPopupDisplay: false,
            isSubmitDisabled: true,
            isValidIDNumber: "",
            isValidMobileNumber: "",
            isValidEmail: "",
            passwordParams: {},
            displayOtpFlow: false,
            refNo: "",
            token: "",
        };
    }

    enableDisableBtn = () => {
        console.log("[ForgotPasswordNTB] >> [enableDisableBtn]");
        const { idNumber, mobileNumber, email } = this.state;
        if (
            !idNumber.trim().length < 3 &&
            !mobileNumber.trim().length < 3 &&
            email.trim().length > 0
        ) {
            this.setState({ isSubmitDisabled: false });
            return;
        }
        this.setState({ isSubmitDisabled: true });
    };

    onInputTextChange = (key, value) => {
        console.log("[ForgotPasswordNTB] >> [onInputTextChange]");
        this.setState(
            {
                [key]: value,
                isValidIDNumber: "",
                isValidMobileNumber: "",
                isValidEmail: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    onConfirmTap = () => {
        console.log("[ForgotPasswordNTB] >> [onConfirmTap]");
        if (this.validateMobileNumber() && this.validateIDNumber() && this.validateEmail()) {
            this.validateUserDetailsAPICall();
        }
    };

    validateUserDetailsAPICall = async () => {
        console.log("[ForgotPasswordNTB] >> [validateUserDetailsAPICall]");
        const customerId = await DataModel.encryptData(this.state.idNumber.trim());

        const data = {
            customerId,
            mobileNo: "0" + this.state.mobileNumber.trim(),
            email: this.state.email.trim(),
        };

        validateNTBCustDetails(data)
            .then((respone) => {
                const result = respone?.data?.result;
                if (result?.statusCode === "0000") {
                    // Navigate to MobileNumber Flow
                    let mobileNumber = data.mobileNo;

                    let first = mobileNumber.substring(0, 1);
                    let second = mobileNumber.substring(0, 2);
                    let m2uNumber = "";
                    if (first === "0") {
                        mobileNumber = `6${mobileNumber}`;
                    } else if (second === "60") {
                        mobileNumber = mobileNumber;
                    } else {
                        mobileNumber = `60${mobileNumber}`;
                    }

                    this.props.navigation.navigate(FORGOT_PASSWORD_MOBILE_CONFIRMATION, {
                        refData: {
                            mobileNumber: mobileNumber,
                            idNo: this.state.idNumber,
                            userName: result?.userName,
                            accessNo: result?.cardNo,
                            from: "NTB",
                        },
                    });
                    return;
                }
                showErrorToast({
                    message: result.statusDesc ? result.statusDesc : Strings.COMMON_ERROR_MSG,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message ? error.message : Strings.COMMON_ERROR_MSG,
                });
            });
    };

    onHeaderBackPress = () => {
        console.log("[ForgotPasswordNTB] >> [onHeaderBackPress]");
        this.props.navigation.goBack();
    };

    /* VALIDATIONS */

    validateEmail = () => {
        console.log("[ForgotPasswordNTB] >> [validateEmail]");

        const email = this.state.email.trim();
        const err1 = "Please enter a valid email address.";
        const err2 = "Please enter your email address.";
        let err = "";

        // Check for accepting valid special characters
        if (!DataModel.validateEmail(email)) {
            err = err1;
        } else if (email.length == 0) {
            // Min length check
            err = err2;
        }

        this.setState({ isValidEmail: err });
        // Return true if no validation error
        return err ? false : true;
    };

    validateIDNumber = () => {
        console.log("[ForgotPasswordNTB] >> [validateIDNumber]");

        const idNumber = this.state.idNumber.trim();
        const err1 = "Please enter a valid MyKad/Passport number.";
        const err2 = "MyKad/Passport should be alphanumeric only. ";
        let err = "";

        if (idNumber.length < 3) {
            // Min length check
            err = err1;
        } else if (!DataModel.validateAlphaNumaric(idNumber)) {
            // Alphanumeric check
            err = err2;
        }

        this.setState({ isValidIDNumber: err });
        // Return true if no validation error
        return err ? false : true;
    };

    validateMobileNumber = () => {
        console.log("[ForgotPasswordNTB] >> [validateMobileNumber]");

        const mobileNumber = this.state.mobileNumber;
        let err = "";
        const err1 = "The prefix you entered is invalid.";
        const err2 = "Mobile number should be between 9-10 digits only.";
        const err3 = "Your mobile number should contain digits only.";
        const err4 = "The mobile number you entered is invalid.";
        const err5 = "Your phone number is already registered in our system.";

        // Check there are no other characters except numbers
        if (!DataModel.maeOnlyNumberRegex(mobileNumber)) {
            err = err3;
        } else if (mobileNumber.length < 9 || mobileNumber.length > 10) {
            err = err2;
        } else if (mobileNumber.indexOf("1") != 0) {
            // Mobile number prefix check
            err = err1;
        } else if (DataModel.charRepeatRegex(mobileNumber)) {
            // Check for consecutive same digit 8 times repeat
            err = err4;
        }
        this.setState({ isValidMobileNumber: err });

        // Return true if no validation error
        return err ? false : true;
    };

    render() {
        const {
            idNumber,
            mobileNumber,
            email,
            isSubmitDisabled,
            isValidIDNumber,
            isValidMobileNumber,
            isValidEmail,
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
                                headerLeftElement={
                                    <HeaderBackButton onPress={this.onHeaderBackPress} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                                <View style={styles.containerView}>
                                    <Typo
                                        text={Strings.RESET_PASSWORD_NTB}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        fontSize={20}
                                        lineHeight={28}
                                        textAlign="left"
                                        style={styles.resetPassword}
                                    />

                                    {/* MyKad/Passport  */}
                                    <View style={styles.containerTitle}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text="MyKad/Passport number"
                                        />
                                        <TextInput
                                            maxLength={20}
                                            isValidate
                                            isValid={!isValidIDNumber}
                                            errorMessage={isValidIDNumber}
                                            value={idNumber}
                                            placeholder="Enter your MyKad/Passport"
                                            onChangeText={(value) => {
                                                this.onInputTextChange("idNumber", value);
                                            }}
                                        />
                                    </View>

                                    {/* Mobile Number  */}
                                    <View style={styles.containerTitle}>
                                        <View style={styles.cardContainerTitle}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Mobile number"
                                            />
                                        </View>

                                        <TextInput
                                            maxLength={10}
                                            isValid={!isValidMobileNumber}
                                            isValidate
                                            errorMessage={isValidMobileNumber}
                                            prefix="+60"
                                            keyboardType={"number-pad"}
                                            value={mobileNumber}
                                            onChangeText={(value) => {
                                                this.onInputTextChange("mobileNumber", value);
                                            }}
                                        />
                                    </View>

                                    {/* Email Address  */}
                                    <View style={styles.containerTitle}>
                                        <View style={styles.cardContainerTitle}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text="Email Address"
                                            />
                                        </View>
                                        <LongTextInput
                                            maxLength={40}
                                            isValid={!isValidEmail}
                                            isValidate
                                            errorMessage={isValidEmail}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            keyboardType={"email-address"}
                                            value={email}
                                            placeholder="Enter email address"
                                            onChangeText={(value) => {
                                                this.onInputTextChange("email", value);
                                            }}
                                        />
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                            {/* Continue Button */}
                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
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
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    cardContainerTitle: {
        flexDirection: "row",
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
    resetPassword: {
        marginTop: 20,
    },
});

export default withModelContext(ForgotPasswordNTB);

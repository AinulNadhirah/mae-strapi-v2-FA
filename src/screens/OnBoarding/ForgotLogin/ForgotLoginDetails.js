import PropTypes from "prop-types";
import React, { useReducer, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Platform, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    formatCreditCardNumber,
    get_pinBlockEncrypt,
} from "@screens/MAE/CardManagement/CardManagementController";

import { FORGOT_LOGIN_USERNAME } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { getClearTPK, forgotLoginVerifyPin, forgotLoginVerifyMaeUser } from "@services";

import { YELLOW, MEDIUM_GREY, BLACK, DISABLED, DISABLED_TEXT } from "@constants/colors";
import { FORGOT_LOGIN_DETAILS_DATA } from "@constants/data";
import {
    FRGT_LOGIN_DTLS,
    SUBMIT,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    VALID_MOBILE_NUMBER,
    COMMON_ERROR_MSG,
    ENTER_YOUR_CARD_NUMBER,
    ENTER_PIN_NUMBER,
    ENTER_YOUR_EMAIL_ADDRESS,
    ENTER_YOUR_ACCESS_NUMBER,
    ENTER_YOUR_MYKAD_PASSPORT,
    FA_PASSWORD_RESET,
} from "@constants/strings";
import { FORGOT_LOGIN_VERIFY_ACCESS_NUMBER_PIN, FORGOT_LOGIN_VERIFY_PIN } from "@constants/url";

import {
    maeOnlyNumberRegex,
    alphaNumericNoSpaceRegex,
    isMalaysianMobileNum,
    validateEmail as validateEmailRegex,
} from "@utils/dataModel";
import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

// Initial state object
const initialState = {
    // Reset details using
    resetDetails: "Debit Card",
    resetDetailsValue: "DEBIT_CARD",
    resetDetailsData: FORGOT_LOGIN_DETAILS_DATA,
    showResetDetailsPicker: false,
    resetDetailsValueIndex: 2,

    // Card Number related
    cardNumber: "",
    cardNumberValid: true,
    cardNumberErrorMsg: "",
    showCardNumber: true,

    // PIN related
    pin: "",
    pinValid: true,
    pinErrorMsg: "",
    showPin: true,

    // Access Number related
    accessNumber: "",
    accessNumberValid: true,
    accessNumberErrorMsg: "",
    showAccessNumber: false,

    // ID Number related
    idNumber: "",
    idNumberValid: true,
    idNumberErrorMsg: "",
    showIdNumber: false,

    // Resistered mobile number related
    mobileNumber: "",
    mobileNumberValid: true,
    mobileNumberErrorMsg: "",
    showMobileNumber: false,

    // Registered email address related
    email: "",
    emailValid: true,
    emailErrorMsg: "",
    showEmail: false,

    // Others
    isSubmitDisabled: true,

    // Popup related
    showPopup: false,
    popupTitle: "",
    popupDescription: "",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "showResetDetailsPicker":
            return {
                ...state,
                showResetDetailsPicker: payload,
            };
        case "resetDetails": {
            const pickerValue = payload?.value ?? null;
            return {
                ...state,
                resetDetails: payload?.name ?? PLEASE_SELECT,
                resetDetailsValue: pickerValue,
                resetDetailsValueIndex: payload?.index ?? 0,

                // Reset all fields after dropdown selections
                cardNumber: "",
                cardNumberValid: true,
                cardNumberErrorMsg: "",
                pin: "",
                pinValid: true,
                pinErrorMsg: "",
                accessNumber: "",
                accessNumberValid: true,
                accessNumberErrorMsg: "",
                idNumber: "",
                idNumberValid: true,
                idNumberErrorMsg: "",
                mobileNumber: "",
                mobileNumberValid: true,
                mobileNumberErrorMsg: "",
                email: "",
                emailValid: true,
                emailErrorMsg: "",

                showCardNumber: pickerValue !== "ACCESS_NUMBER" && pickerValue !== "MAE_ACCOUNT",
                showPin: pickerValue !== "MAE_ACCOUNT",
                showAccessNumber: pickerValue === "ACCESS_NUMBER",
                showIdNumber: pickerValue === "MAE_ACCOUNT",
                showMobileNumber: pickerValue === "MAE_ACCOUNT",
                showEmail: pickerValue === "MAE_ACCOUNT",
            };
        }
        case "cardNumber":
            return {
                ...state,
                cardNumber: payload,
            };
        case "pin":
            return {
                ...state,
                pin: payload,
            };
        case "accessNumber":
            return {
                ...state,
                accessNumber: payload,
            };
        case "idNumber":
            return {
                ...state,
                idNumber: payload,
            };
        case "mobileNumber":
            return {
                ...state,
                mobileNumber: payload,
            };
        case "email":
            return {
                ...state,
                email: payload,
            };
        case "isSubmitDisabled":
            return {
                ...state,
                isSubmitDisabled: payload,
            };
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
            };
        case "updateValidationErrors":
            return {
                ...state,
                cardNumberValid: payload?.cardNumberValid ?? true,
                cardNumberErrorMsg: payload?.cardNumberErrorMsg ?? "",
                pinValid: payload?.pinValid ?? true,
                pinErrorMsg: payload?.pinErrorMsg ?? "",
                accessNumberValid: payload?.accessNumberValid ?? true,
                accessNumberErrorMsg: payload?.accessNumberErrorMsg ?? "",
                idNumberValid: payload?.idNumberValid ?? true,
                idNumberErrorMsg: payload?.idNumberErrorMsg ?? "",
                mobileNumberValid: payload?.mobileNumberValid ?? true,
                mobileNumberErrorMsg: payload?.mobileNumberErrorMsg ?? "",
                emailValid: payload?.emailValid ?? true,
                emailErrorMsg: payload?.emailErrorMsg ?? "",
            };
        default:
            return { ...state };
    }
}

function ForgotLoginDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        cardNumber,
        pin,
        accessNumber,
        idNumber,
        mobileNumber,
        email,
        resetDetailsValue,
        isSubmitDisabled,
    } = state;

    // Used to enable "Submit" when all fields are filled in
    useEffect(() => {
        switch (resetDetailsValue) {
            case "MAE_ACCOUNT":
                dispatch({
                    actionType: "isSubmitDisabled",
                    payload: !(
                        idNumber.length >= 3 &&
                        mobileNumber.length >= 3 &&
                        email.length >= 3
                    ),
                });
                break;
            case "ACCESS_NUMBER":
                dispatch({
                    actionType: "isSubmitDisabled",
                    payload: !(accessNumber.length >= 3 && pin.length >= 3),
                });
                break;
            default:
                dispatch({
                    actionType: "isSubmitDisabled",
                    payload: !(cardNumber.length >= 3 && pin.length >= 3),
                });
                break;
        }
    }, [cardNumber, pin, accessNumber, idNumber, mobileNumber, email, resetDetailsValue]);

    function onBackTap() {
        console.log("[ForgotLoginDetails] >> [onBackTap]");

        navigation.goBack();
    }

    function onDropdownPress() {
        console.log("[ForgotLoginDetails] >> [onDropdownPress]");

        dispatch({ actionType: "showResetDetailsPicker", payload: true });
    }

    function onPickerDone(item, index) {
        console.log("[ForgotLoginDetails] >> [onPickerDone]");

        dispatch({ actionType: "resetDetails", payload: { ...item, index } });

        // Close picker
        onPickerCancel();
    }

    function onPickerCancel() {
        console.log("[ForgotLoginDetails] >> [onPickerCancel]");

        dispatch({ actionType: "showResetDetailsPicker", payload: false });
    }

    const formatNumber = (value) => {
        return value
            .toString()
            .substring(0, value.length)
            .replace(/[^0-9]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
    };

    const formatMobileNumber = (value) => {
        return value
            .toString()
            .replace(/[^0-9]/g, "")
            .replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
    };

    function onCardNumberChange(value) {
        const formattedValued = formatNumber(value);
        dispatch({ actionType: "cardNumber", payload: formattedValued });
    }

    function onPinChange(value) {
        return dispatch({ actionType: "pin", payload: value });
    }

    function onAccessNumberChange(value) {
        const formattedValued = formatNumber(value);
        dispatch({ actionType: "accessNumber", payload: formattedValued });
    }

    function onIdNumberChange(value) {
        return dispatch({ actionType: "idNumber", payload: value });
    }

    function onMobileNumberChange(value) {
        const formattedValued = formatMobileNumber(value);
        dispatch({ actionType: "mobileNumber", payload: formattedValued });
    }

    function onEmailChange(value) {
        return dispatch({ actionType: "email", payload: value });
    }

    function onResetDetailsInfoPress() {
        console.log("[ForgotLoginDetails] >> [onResetDetailsInfoPress]");

        dispatch({
            actionType: "showPopup",
            payload: {
                title: "Reset your login details",
                description:
                    "Please select the Card/Access Number details which you used to create your Maybank2u account.\n\nIf you are MAE account holder only without physical card, please select MAE Account.",
            },
        });
    }

    function onPinInfoPress() {
        console.log("[ForgotLoginDetails] >> [onPinInfoPress]");

        dispatch({
            actionType: "showPopup",
            payload: {
                title: "PIN",
                description:
                    "Your PIN number is your card PIN, or your Internet Banking PIN created at Maybank branch.",
            },
        });
    }

    function onAccessNumberInfoPress() {
        console.log("[ForgotLoginDetails] >> [onAccessNumberInfoPress]");

        dispatch({
            actionType: "showPopup",
            payload: {
                title: "Access Number",
                description: "Access Number can be obtained at the branch",
            },
        });
    }

    function onPopupClose() {
        console.log("[ForgotLoginDetails] >> [onPopupClose]");

        dispatch({ actionType: "hidePopup", payload: false });
    }

    const validateCardNumber = () => {
        console.log("[ForgotLoginDetails] >> [validateCardNumber]");

        const trimmedCardNumber = cardNumber.replace(/\s/g, "");

        // Min length check
        if (trimmedCardNumber.length < 16) {
            return {
                cardNumberValid: false,
                cardNumberErrorMsg: "Card number must consist of 16 digits.",
            };
        }

        // Only numberical check
        if (!maeOnlyNumberRegex(trimmedCardNumber)) {
            return {
                cardNumberValid: false,
                cardNumberErrorMsg: "Card number must consist of numerical digits only.",
            };
        }

        // Return true if no validation error
        return {
            cardNumberValid: true,
            cardNumberErrorMsg: "",
        };
    };

    const validateAccessNumber = () => {
        console.log("[ForgotLoginDetails] >> [validateAccessNumber]");

        const trimmedAccessNumber = accessNumber.replace(/\s/g, "");

        // Min length check
        if (trimmedAccessNumber.length < 16) {
            return {
                accessNumberValid: false,
                accessNumberErrorMsg: "Access number must consist of 16 digits.",
            };
        }

        // Only numberical check
        if (!maeOnlyNumberRegex(trimmedAccessNumber)) {
            return {
                accessNumberValid: false,
                accessNumberErrorMsg: "Access number must consist of numerical digits only.",
            };
        }

        // Return true if no validation error
        return {
            accessNumberValid: true,
            accessNumberErrorMsg: "",
        };
    };

    const validatePin = () => {
        console.log("[ForgotLoginDetails] >> [validatePin]");

        // Min length check
        if (pin.length < 6) {
            return {
                pinValid: false,
                pinErrorMsg: "Your PIN must consist of at least 6 digits.",
            };
        }

        // Only numberical check
        if (!maeOnlyNumberRegex(pin)) {
            return {
                pinValid: false,
                pinErrorMsg: "Your pin must consist of numerical digits only.",
            };
        }

        // Return true if no validation error
        return {
            pinValid: true,
            pinErrorMsg: "",
        };
    };

    const validateIDNumber = () => {
        console.log("[ForgotLoginDetails] >> [validateIDNumber]");

        // Min length check
        if (idNumber.length < 5) {
            return {
                idNumberValid: false,
                idNumberErrorMsg: "ID number must consist of minimum 5 characters.",
            };
        }

        // Only alphanumeric check
        if (!alphaNumericNoSpaceRegex(idNumber)) {
            return {
                idNumberValid: false,
                idNumberErrorMsg: "ID number should be alphanumeric only.",
            };
        }

        // Return true if no validation error
        return {
            idNumberValid: true,
            idNumberErrorMsg: "",
        };
    };

    const validateMobileNumber = () => {
        console.log("[ForgotLoginDetails] >> [validateMobileNumber]");

        const trimmedMobileNumber = mobileNumber.replace(/\s/g, "");

        // Min length check
        if (trimmedMobileNumber.length < 9) {
            return {
                mobileNumberValid: false,
                mobileNumberErrorMsg: "Mobile number must consist of minimum 9 digits.",
            };
        }

        // Valid mobile number check
        if (!isMalaysianMobileNum(`0${trimmedMobileNumber}`)) {
            return {
                mobileNumberValid: false,
                mobileNumberErrorMsg: VALID_MOBILE_NUMBER,
            };
        }

        // Only numberical check
        if (!maeOnlyNumberRegex(trimmedMobileNumber)) {
            return {
                mobileNumberValid: false,
                mobileNumberErrorMsg: "Your mobile number must consist numerical digits only.",
            };
        }

        // Return true if no validation error
        return {
            mobileNumberValid: true,
            mobileNumberErrorMsg: "",
        };
    };

    const validateEmail = () => {
        console.log("[ForgotLoginDetails] >> [validateEmail]");

        // Valid email check
        if (!validateEmailRegex(email)) {
            return {
                emailValid: false,
                emailErrorMsg: "Please enter a valid email address.",
            };
        }

        // Return true if no validation error
        return {
            emailValid: true,
            emailErrorMsg: "",
        };
    };

    const validateForm = () => {
        console.log("[ForgotLoginDetails] >> [validateForm]");

        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        if (resetDetailsValue === "MAE_ACCOUNT") {
            // For MAE Account

            const { idNumberValid, idNumberErrorMsg } = validateIDNumber();
            const { mobileNumberValid, mobileNumberErrorMsg } = validateMobileNumber();
            const { emailValid, emailErrorMsg } = validateEmail();

            // Update inline errors(if any)
            dispatch({
                actionType: "updateValidationErrors",
                payload: {
                    idNumberValid,
                    idNumberErrorMsg,
                    mobileNumberValid,
                    mobileNumberErrorMsg,
                    emailValid,
                    emailErrorMsg,
                },
            });

            return idNumberValid && mobileNumberValid && emailValid;
        } else {
            const { pinValid, pinErrorMsg } = validatePin();

            if (resetDetailsValue === "ACCESS_NUMBER") {
                // For Access Number

                const { accessNumberValid, accessNumberErrorMsg } = validateAccessNumber();

                // Update inline errors(if any)
                dispatch({
                    actionType: "updateValidationErrors",
                    payload: {
                        accessNumberValid,
                        accessNumberErrorMsg,
                        pinValid,
                        pinErrorMsg,
                    },
                });

                return accessNumberValid && pinValid;
            } else {
                // For Debit, Credit, Charge & Prepaid Card

                const { cardNumberValid, cardNumberErrorMsg } = validateCardNumber();

                // Update inline errors(if any)
                dispatch({
                    actionType: "updateValidationErrors",
                    payload: {
                        cardNumberValid,
                        cardNumberErrorMsg,
                        pinValid,
                        pinErrorMsg,
                    },
                });

                return cardNumberValid && pinValid;
            }
        }

        // This is unreachable. i'n commenting it out

        // For Debit, Credit, Charge & Prepaid Card

        // const { cardNumberValid, cardNumberErrorMsg } = validateCardNumber();

        // // Update inline errors(if any)
        // dispatch({
        //     actionType: "updateValidationErrors",
        //     payload: {
        //         cardNumberValid,
        //         cardNumberErrorMsg,
        //         pinValid,
        //         pinErrorMsg,
        //     },
        // });

        // return cardNumberValid && pinValid;
    };

    function onSubmitPress() {
        console.log("[ForgotLoginDetails] >> [onSubmitPress]");

        // Return is form validation fails
        const isFormValid = validateForm();
        if (!isFormValid) return;

        if (resetDetailsValue === "MAE_ACCOUNT") {
            verifyMAEAccountDetails();
        } else {
            verifyCardAccessDetails();
        }
    }

    const verifyCardAccessDetails = async () => {
        console.log("[ForgotLoginDetails] >> [verifyCardAccessDetails]");
        const isAccessNumber = resetDetailsValue === "ACCESS_NUMBER";
        const number = isAccessNumber ? accessNumber : cardNumber;
        const trimmedCardNumber = number.replace(/\s/g, "");
        const chipCardType = "Z";
        const chipCardCode = "VS";

        // Retrieve PIN Block data
        const chipCardNum16digit = formatCreditCardNumber(
            trimmedCardNumber,
            chipCardType,
            chipCardCode
        );

        let subUrl;
        let params;
        const cardNo = await DataModel.encryptData(trimmedCardNumber);

        if (!isAccessNumber) {
            const httpResp = await getClearTPK().catch((error) => {
                console.log("[ForgotLoginDetails][getClearTPK] >> Exception: ", error);
            });

            const chipMasterData = httpResp?.data?.result ?? null;

            const { statusCode, statusDesc } = chipMasterData;
            if (statusCode !== "0000") {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                return;
            }

            const hsmTpk = chipMasterData.hsmTpk;
            const clearTpk = await DataModel.encryptData(hsmTpk);
            const pinBlock = get_pinBlockEncrypt(pin, chipCardNum16digit, hsmTpk, chipMasterData);

            params = { cardNo, clearTpk, pinBlock };
            subUrl = FORGOT_LOGIN_VERIFY_PIN;
        } else {
            const pinEncrypted = await DataModel.encryptData(pin);
            params = { accessNo: cardNo, pin: pinEncrypted };
            subUrl = FORGOT_LOGIN_VERIFY_ACCESS_NUMBER_PIN;
        }

        console.log("Forgot Login details params = ", subUrl, JSON.stringify(params));
        // Call API to verify details
        verifyCardAccessAPI(subUrl, params, isAccessNumber);
    };

    const verifyCardAccessAPI = (subUrl, params, isAccessNumber) => {
        console.log("[ForgotLoginDetails] >> [verifyCardAccessAPI]");

        forgotLoginVerifyPin(subUrl, params)
            .then((httpResp) => {
                console.log("[ForgotLoginDetails][verifyCardAccessAPI] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                    return;
                }

                const { statusCode, statusDesc, custName, refNo } = result;

                if (statusCode === "0000" && custName) {
                    // Navigate to Username display screen
                    navigation.navigate(FORGOT_LOGIN_USERNAME, {
                        ...route.params,
                        username: custName,
                        refNo,
                        isAccessNumber,
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            })
            .catch((error) => {
                console.log("[ForgotLoginDetails][verifyCardAccessAPI] >> Exception: ", error);

                showErrorToast({
                    message: error?.message ?? COMMON_ERROR_MSG,
                });
            });
    };

    const verifyMAEAccountDetails = async () => {
        console.log("[ForgotLoginDetails] >> [verifyMAEAccountDetails]");

        const trimmedMobileNumber = mobileNumber.replace(/\s/g, "");
        const idNo = await DataModel.encryptData(idNumber);

        // Request object
        const params = {
            idNo,
            email: email,
            mobileNo: `0${trimmedMobileNumber}`,
        };

        forgotLoginVerifyMaeUser(params, true)
            .then((httpResp) => {
                console.log(
                    "[ForgotLoginDetails][verifyMAEAccountDetails] >> Response: ",
                    httpResp
                );

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                    return;
                }

                const { statusCode, statusDesc, custName, refNo } = result;

                if (statusCode === "0000" && custName) {
                    // Navigate to Username display screen
                    navigation.navigate(FORGOT_LOGIN_USERNAME, {
                        ...route.params,
                        username: custName,
                        refNo,
                        isMAEAccount: true,
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            })
            .catch((error) => {
                console.log("[ForgotLoginDetails][verifyMAEAccountDetails] >> Exception: ", error);

                showErrorToast({
                    message: error?.message ?? COMMON_ERROR_MSG,
                });
            });
    };

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PASSWORD_RESET}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                route.params?.hideBackButton ? (
                                    <></>
                                ) : (
                                    <HeaderBackButton onPress={onBackTap} testID="go_back" />
                                )
                            }
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={FRGT_LOGIN_DTLS}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={20}
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView
                            style={Style.container}
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            testID="onboarding_forgot_login_details"
                        >
                            {/* Reset details using */}
                            <View style={Style.fieldViewCls}>
                                <InfoLabel
                                    label="Reset details using"
                                    onPress={onResetDetailsInfoPress}
                                />

                                <Dropdown
                                    value={state.resetDetails}
                                    style={Style.resetDetailsDropdownCls}
                                    onPress={onDropdownPress}
                                />
                            </View>

                            {/* Card number */}
                            {state.showCardNumber && (
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Card number"
                                    />
                                    <TextInput
                                        autoFocus
                                        minLength={3}
                                        maxLength={19}
                                        isValidate
                                        isValid={state.cardNumberValid}
                                        errorMessage={state.cardNumberErrorMsg}
                                        value={cardNumber}
                                        placeholder={ENTER_YOUR_CARD_NUMBER}
                                        keyboardType="numeric"
                                        onChangeText={onCardNumberChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}

                            {/* Access Number */}
                            {state.showAccessNumber && (
                                <View style={Style.fieldViewCls}>
                                    <InfoLabel
                                        label="Access Number"
                                        onPress={onAccessNumberInfoPress}
                                    />
                                    <TextInput
                                        minLength={3}
                                        maxLength={19}
                                        isValidate
                                        isValid={state.accessNumberValid}
                                        errorMessage={state.accessNumberErrorMsg}
                                        value={accessNumber}
                                        placeholder={ENTER_YOUR_ACCESS_NUMBER}
                                        keyboardType="numeric"
                                        onChangeText={onAccessNumberChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}

                            {/* PIN */}
                            {state.showPin && (
                                <View style={Style.fieldViewCls}>
                                    <InfoLabel label="PIN" onPress={onPinInfoPress} />

                                    <TextInput
                                        minLength={3}
                                        maxLength={6}
                                        isValidate
                                        secureTextEntry
                                        isValid={state.pinValid}
                                        errorMessage={state.pinErrorMsg}
                                        value={pin}
                                        placeholder={ENTER_PIN_NUMBER}
                                        keyboardType="numeric"
                                        onChangeText={onPinChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}

                            {/* ID Number */}
                            {state.showIdNumber && (
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="MyKad/Passport number"
                                    />
                                    <TextInput
                                        maxLength={12}
                                        isValidate
                                        isValid={state.idNumberValid}
                                        errorMessage={state.idNumberErrorMsg}
                                        value={idNumber}
                                        placeholder={ENTER_YOUR_MYKAD_PASSPORT}
                                        // keyboardType="numeric"
                                        onChangeText={onIdNumberChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}

                            {/* Registered mobile number */}
                            {state.showMobileNumber && (
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Registered mobile number"
                                    />
                                    <TextInput
                                        prefix="+60"
                                        minLength={9}
                                        maxLength={12}
                                        isValidate
                                        isValid={state.mobileNumberValid}
                                        errorMessage={state.mobileNumberErrorMsg}
                                        value={mobileNumber}
                                        placeholder=""
                                        keyboardType="numeric"
                                        onChangeText={onMobileNumberChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}

                            {/* Registered email address */}
                            {state.showEmail && (
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Registered email address"
                                    />
                                    <TextInput
                                        maxLength={50}
                                        isValidate
                                        isValid={state.emailValid}
                                        errorMessage={state.emailErrorMsg}
                                        value={email}
                                        placeholder={ENTER_YOUR_EMAIL_ADDRESS}
                                        keyboardType="email-address"
                                        onChangeText={onEmailChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>
                            )}
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isSubmitDisabled}
                                // isLoading={loading}
                                fullWidth
                                borderRadius={25}
                                onPress={onSubmitPress}
                                backgroundColor={isSubmitDisabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={isSubmitDisabled ? DISABLED_TEXT : BLACK}
                                        text={SUBMIT}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Reset Details Picker */}
            {state.resetDetailsData && (
                <ScrollPickerView
                    showMenu={state.showResetDetailsPicker}
                    list={state.resetDetailsData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={state.resetDetailsValueIndex}
                />
            )}

            {/* Info Popup */}
            <Popup
                visible={state.showPopup}
                onClose={onPopupClose}
                title={state.popupTitle}
                description={state.popupDescription}
            />
        </React.Fragment>
    );
}

ForgotLoginDetails.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const InfoLabel = ({ label, onPress = () => {} }) => {
    return (
        <View style={Style.infoLabelContainerCls}>
            <Typo fontSize={14} lineHeight={18} textAlign="left" text={label} />
            <TouchableOpacity onPress={onPress}>
                <Image style={Style.infoIcon} source={Assets.icInformation} />
            </TouchableOpacity>
        </View>
    );
};

InfoLabel.propTypes = {
    label: PropTypes.string,
    onPress: PropTypes.func,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },

    fieldViewCls: {
        marginBottom: 25,
    },

    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },

    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },

    resetDetailsDropdownCls: {
        marginTop: 10,
    },
});

export default ForgotLoginDetails;

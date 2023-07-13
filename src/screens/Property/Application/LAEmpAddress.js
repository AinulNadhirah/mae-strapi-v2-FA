import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    LA_EMP_ADDRESS,
    LA_FINANCING_TYPE,
    LA_CONFIRMATION,
    LA_TNC,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { FAProperty } from "@services/analytics/analyticsProperty";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    RED_ERROR,
    FADE_GREY,
} from "@constants/colors";
import { AMBER } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    SAVE_NEXT,
    CONFIRM,
    FA_PROPERTY_APPLYLOAN_CONF_EDITOFFICE_ADDRESS,
    FA_PROPERTY_APPLYLOAN_OFFICE_ADDRESS,
    REVIEW_AND_UPDATE_OFFICE_ADD,
    STEPUP_MAE_ADDRESS_ONE,
    STEPUP_MAE_ADDRESS_TWO,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_ADDRESS_CONTACT,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_ADDRESS_THREE,
} from "@constants/strings";

import { maskAddress, maskMobileNumber } from "@utils/maskUtils";

import { useResetNavigation, getExistingData } from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressThree,
    validateAddressTwo,
    validateCity,
    validatePostcode,
} from "../Eligibility/CEController";
import { saveLAInput } from "./LAController";
import { getLAEmpAddressUIData } from "./LAFormController";

// Initial state object
const initialState = {
    //stepper info
    stepperInfo: "",

    // Address 1
    addressOne: "",
    addressOneDisp: "",
    addressOneValid: true,
    addressOneErrorMsg: "",
    addressOneFocus: false,

    // Address 2
    addressTwo: "",
    addressTwoDisp: "",
    addressTwoValid: true,
    addressTwoErrorMsg: "",
    addressTwoFocus: false,

    // Address 3
    addressThree: "",
    addressThreeDisp: "",
    addressThreeValid: true,
    addressThreeErrorMsg: "",
    addressThreeFocus: false,

    // City
    city: "",
    cityDisp: "",
    cityValid: true,
    cityErrorMsg: "",
    cityFocus: false,

    // Postcode
    postcode: "",
    postcodeDisp: "",
    postcodeValid: true,
    postcodeErrorMsg: "",
    postcodeFocus: false,

    // State related
    state: PLEASE_SELECT,
    stateValue: null,
    stateValueIndex: 0,
    stateData: null,
    statePicker: false,
    stateObj: null,
    stateShow: false,

    // Country related
    country: PLEASE_SELECT,
    countryValue: null,
    countryValueIndex: 0,
    countryData: null,
    countryPicker: false,
    countryObj: null,

    // Contact number
    contactNum: "",
    contactNumDisp: "",
    contactNumValid: true,
    contactNumErrorMsg: "",
    contactNumFocus: false,

    // UI Labels
    headerText: "",
    ctaText: SAVE_NEXT,

    // Others
    showExitPopup: false,
    isContinueDisabled: true,
    pickerType: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                statePicker: false,
                countryPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                statePicker: payload === "state",
                countryPicker: payload === "country",
            };
        case "SET_UI_LABELS":
        case "SET_PICKER_DATA":
        case "SET_STATE":
        case "SET_COUNTRY":
        case "RESET_VALIDATION_ERRORS":
        case "SET_ADDRESS_ONE_ERROR":
        case "SET_ADDRESS_TWO_ERROR":
        case "SET_ADDRESS_THREE_ERROR":
        case "SET_CITY_ERROR":
        case "SET_POSTCODE_ERROR":
        case "SET_CONTACT_NUM_ERROR":
        case "SET_INIT_DATA":
        case "SET_ADDRESS_ONE_FOCUS":
        case "SET_ADDRESS_TWO_FOCUS":
        case "SET_ADDRESS_THREE_FOCUS":
        case "SET_CITY_FOCUS":
        case "SET_POSTCODE_FOCUS":
        case "SET_CONTACT_NUM_FOCUS":
        case "SET_STATE_SHOW":
        case "SET_STEPPER_INFO":
            return {
                ...state,
                ...payload,
            };
        case "SET_ADDRESS_ONE":
            return {
                ...state,
                addressOne: payload,
                addressOneDisp: payload,
            };
        case "SET_ADDRESS_TWO":
            return {
                ...state,
                addressTwo: payload,
                addressTwoDisp: payload,
            };
        case "SET_ADDRESS_THREE":
            return {
                ...state,
                addressThree: payload,
                addressThreeDisp: payload,
            };
        case "SET_CITY":
            return {
                ...state,
                city: payload,
                cityDisp: payload,
            };
        case "SET_POSTCODE":
            return {
                ...state,
                postcode: payload,
                postcodeDisp: payload,
            };
        case "SET_CONTACT_NUM":
            return {
                ...state,
                contactNum: payload,
                contactNumDisp: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        case "SET_EDIT_FLAG":
            return {
                ...state,
                editFlow: payload,
            };
        default:
            return { ...state };
    }
}

function LAEmpAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const {
        isContinueDisabled,
        addressOne,
        addressTwo,
        addressThree,
        city,
        postcode,
        contactNum,
        country,
        countryValue,
        stateShow,
        editFlow,
    } = state;

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const screenName = route.params?.editFlow
            ? FA_PROPERTY_APPLYLOAN_CONF_EDITOFFICE_ADDRESS
            : FA_PROPERTY_APPLYLOAN_OFFICE_ADDRESS;
        FAProperty.onPressViewScreen(screenName);
    }, [route.params?.editFlow]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                addressOne === "" ||
                addressTwo === "" ||
                postcode === "" ||
                (countryValue === "MYS" && state.state === PLEASE_SELECT) ||
                country === PLEASE_SELECT ||
                contactNum === "",
        });
    }, [
        addressOne,
        addressTwo,
        addressThree,
        state.state,
        postcode,
        country,
        contactNum,
        countryValue,
    ]);

    // // Show state field only if country is Malaysia
    useEffect(() => {
        dispatch({
            actionType: "SET_STATE_SHOW",
            payload: {
                stateShow: countryValue === "MYS",
            },
        });
    }, [countryValue]);

    const init = useCallback(() => {
        console.log("[LAEmpAddress] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();
    }, [route, navigation]);

    function onBackTap() {
        console.log("[LAEmpAddress] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LAEmpAddress] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    function setPickerData() {
        console.log("[LAEmpAddress] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                stateData: masterData?.state ?? null,
                countryData: masterData?.country ?? null,
            },
        });
    }

    function prepopulateData() {
        console.log("[LAEmpAddress] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};

        const headerText = navParams?.headerText ?? "";
        const paramsEditFlow = navParams?.editFlow ?? false;

        const {
            empAddress1,
            empAddress2,
            empAddress3,
            empCity,
            empPostcode,
            empState,
            empCountry,
            empContactNumber,
        } = getLAEmpAddressUIData(navParams, savedData, mdmData, paramsEditFlow);

        const maskedAddress1 = maskAddress(empAddress1);
        const maskedAddress2 = maskAddress(empAddress2);
        const maskedAddress3 = maskAddress(empAddress3);
        const maskedCity = maskAddress(empCity);
        const maskedContactNum = maskMobileNumber(empContactNumber);

        // Set Edit Flag
        dispatch({
            actionType: "SET_EDIT_FLAG",
            payload: paramsEditFlow,
        });

        // Set UI labels
        dispatch({
            actionType: "SET_UI_LABELS",
            payload: {
                headerText: paramsEditFlow ? "Edit office address" : headerText,
                ctaText: paramsEditFlow ? CONFIRM : SAVE_NEXT,
            },
        });

        dispatch({
            actionType: "SET_INIT_DATA",
            payload: {
                addressOne: empAddress1,
                addressTwo: empAddress2,
                addressThree: empAddress3,
                city: empCity,
                postcode: empPostcode,
                contactNum: empContactNumber,

                addressOneDisp: maskedAddress1,
                addressTwoDisp: maskedAddress2,
                addressThreeDisp: maskedAddress3,
                cityDisp: maskedCity,
                postcodeDisp: empPostcode,
                contactNumDisp: maskedContactNum,
            },
        });

        // State
        if (empState) {
            const stateSelect = getExistingData(empState, masterData?.state ?? null);
            dispatch({
                actionType: "SET_STATE",
                payload: {
                    state: stateSelect.name,
                    stateValue: stateSelect.value,
                    stateObj: stateSelect.obj,
                    stateValueIndex: stateSelect.index,
                },
            });
        }

        // Country
        if (empCountry) {
            const countrySelect = getExistingData(empCountry, masterData?.country ?? null);
            dispatch({
                actionType: "SET_COUNTRY",
                payload: {
                    country: countrySelect.name,
                    countryValue: countrySelect.value,
                    countryObj: countrySelect.obj,
                    countryValueIndex: countrySelect.index,
                },
            });
        }

        // stepper info
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : "";
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                stepperInfo,
            },
        });
    }

    function onPickerCancel() {
        console.log("[LAEmpAddress] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[LAEmpAddress] >> [onPickerDone]");

        if (state.pickerType === "state") {
            dispatch({
                actionType: "SET_STATE",
                payload: {
                    state: item?.name ?? PLEASE_SELECT,
                    stateValue: item?.value ?? null,
                    stateObj: item,
                    stateValueIndex: index,
                },
            });
        }

        if (state.pickerType === "country") {
            dispatch({
                actionType: "SET_COUNTRY",
                payload: {
                    country: item?.name ?? PLEASE_SELECT,
                    countryValue: item?.value ?? null,
                    countryObj: item,
                    countryValueIndex: index,
                },
            });
        }

        // Close picker
        onPickerCancel();
    }

    function onDropdownTap(pickerType) {
        console.log("[LAEmpAddress] >> [onStateTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: pickerType,
        });
    }

    function onAddressOneChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_ONE",
            payload: value,
        });
    }

    function onAddressTwoChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_TWO",
            payload: value,
        });
    }

    function onAddressThreeChange(value) {
        dispatch({
            actionType: "SET_ADDRESS_THREE",
            payload: value,
        });
    }

    function onCityChange(value) {
        dispatch({
            actionType: "SET_CITY",
            payload: value,
        });
    }

    function onPostcodeChange(value) {
        dispatch({
            actionType: "SET_POSTCODE",
            payload: value,
        });
    }

    function onContactNumChange(value) {
        dispatch({
            actionType: "SET_CONTACT_NUM",
            payload: value,
        });
    }

    function onAddressOneFocus() {
        if (!state.addressOneFocus) {
            dispatch({
                actionType: "SET_ADDRESS_ONE_FOCUS",
                payload: {
                    addressOne: "",
                    addressOneDisp: "",
                    addressOneFocus: true,
                },
            });
        }
    }

    function onAddressTwoFocus() {
        if (!state.addressTwoFocus) {
            dispatch({
                actionType: "SET_ADDRESS_TWO_FOCUS",
                payload: {
                    addressTwo: "",
                    addressTwoDisp: "",
                    addressTwoFocus: true,
                },
            });
        }
    }

    function onAddressThreeFocus() {
        if (!state.addressThreeFocus) {
            dispatch({
                actionType: "SET_ADDRESS_THREE_FOCUS",
                payload: {
                    addressThree: "",
                    addressThreeDisp: "",
                    addressThreeFocus: true,
                },
            });
        }
    }

    function onCityFocus() {
        if (!state.cityFocus) {
            dispatch({
                actionType: "SET_CITY_FOCUS",
                payload: {
                    city: "",
                    cityDisp: "",
                    cityFocus: true,
                },
            });
        }
    }

    function onPostcodeFocus() {
        if (!state.postcodeFocus) {
            dispatch({
                actionType: "SET_POSTCODE_FOCUS",
                payload: {
                    postcode: "",
                    postcodeDisp: "",
                    postcodeFocus: true,
                },
            });
        }
    }

    function onContactNumFocus() {
        if (!state.contactNumFocus) {
            dispatch({
                actionType: "SET_CONTACT_NUM_FOCUS",
                payload: {
                    contactNum: "",
                    contactNumDisp: "",
                    contactNumFocus: true,
                },
            });
        }
    }

    async function onExitPopupSave() {
        console.log("[LAEmpAddress] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_EMP_ADDRESS,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LAEmpAddress] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();
        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAEmpAddress] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function resetValidationErrors() {
        console.log("[LAEmpAddress] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                addressOneValid: true,
                addressOneErrorMsg: "",
                addressTwoValid: true,
                addressTwoErrorMsg: "",
                addressThreeValid: true,
                addressThreeErrorMsg: "",
                cityValid: true,
                cityErrorMsg: "",
                postcodeValid: true,
                postcodeErrorMsg: "",
                contactNumValid: true,
                contactNumErrorMsg: "",
            },
        });
    }

    function validateFormDetails() {
        console.log("[LAEmpAddress] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        // Address One
        const { isValid: addressOneValid, message: addressOneErrorMsg } =
            validateAddressOne(addressOne);
        if (!addressOneValid) {
            dispatch({
                actionType: "SET_ADDRESS_ONE_ERROR",
                payload: { addressOneValid, addressOneErrorMsg },
            });
        }

        // Address Two
        const { isValid: addressTwoValid, message: addressTwoErrorMsg } =
            validateAddressTwo(addressTwo);
        if (!addressTwoValid) {
            dispatch({
                actionType: "SET_ADDRESS_TWO_ERROR",
                payload: { addressTwoValid, addressTwoErrorMsg },
            });
        }

        // Address Three
        const { isValid: addressThreeValid, message: addressThreeErrorMsg } =
            validateAddressThree(addressThree);
        if (!addressThreeValid) {
            dispatch({
                actionType: "SET_ADDRESS_THREE_ERROR",
                payload: { addressThreeValid, addressThreeErrorMsg },
            });
        }

        // City
        const { isValid: cityValid, message: cityErrorMsg } = validateCity(city);
        if (!cityValid) {
            dispatch({
                actionType: "SET_CITY_ERROR",
                payload: { cityValid, cityErrorMsg },
            });
        }

        // Post Code
        const { isValid: postcodeValid, message: postcodeErrorMsg } = validatePostcode(
            postcode,
            state.countryValue
        );
        if (!postcodeValid) {
            dispatch({
                actionType: "SET_POSTCODE_ERROR",
                payload: { postcodeValid, postcodeErrorMsg },
            });
        }

        return !(
            !addressOneValid ||
            !addressTwoValid ||
            !addressThreeValid ||
            !cityValid ||
            !postcodeValid
        );
    }

    async function onContinue() {
        console.log("[LAEmpAddress] >> [onContinue]");

        const navParams = route?.params ?? {};
        const eligibilityStatus = navParams?.eligibilityStatus ?? "";

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const formData = getFormData();

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        if (editFlow) {
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: LA_EMP_ADDRESS,
                    currentStep,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            await saveLAInput({
                screenName: LA_EMP_ADDRESS,
                formData,
                navParams,
            });

            navigation.navigate(BANKINGV2_MODULE, {
                screen: eligibilityStatus === AMBER ? LA_TNC : LA_FINANCING_TYPE,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                },
            });
        }
        FAProperty.onPressFormProceed(FA_PROPERTY_APPLYLOAN_OFFICE_ADDRESS);
    }

    function getFormData() {
        console.log("[LAEmpAddress] >> [getFormData]");

        return {
            employerAddr1: addressOne,
            employerAddr2: addressTwo,
            employerAddr3: addressThree,
            employerCity: city,
            employerPostCode: postcode,
            employerState: stateShow ? state.stateValue : "",
            employerCountry: countryValue,
            employerPhoneNo: contactNum,
        };
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow
                                ? (
                                    <></>
                                )
                                : (
                                    <Typo
                                        text={state.stepperInfo}
                                        lineHeight={16}
                                        fontSize={12}
                                        fontWeight="600"
                                        color={FADE_GREY}
                                    />
                                )
                            }
                            headerRightElement={
                                editFlow ? <></> : <HeaderCloseButton onPress={onCloseTap} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={state.headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            {!editFlow && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.headerText}
                                    text={REVIEW_AND_UPDATE_OFFICE_ADD}
                                    textAlign="left"
                                />
                            )}

                            {/* Country */}
                            <LabeledDropdown
                                label="Country"
                                dropdownValue={state.country}
                                onPress={() => onDropdownTap("country")}
                                style={Style.fieldViewCls}
                            />

                            {/* Address line 1 */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_ONE}
                                />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressOneValid}
                                    errorMessage={state.addressOneErrorMsg}
                                    value={state.addressOneDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onAddressOneChange}
                                    numberOfLines={2}
                                    onFocus={onAddressOneFocus}
                                />
                            </View>

                            {/* Address line 2 */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_TWO}
                                />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressTwoValid}
                                    errorMessage={state.addressTwoErrorMsg}
                                    value={state.addressTwoDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onAddressTwoChange}
                                    numberOfLines={2}
                                    onFocus={onAddressTwoFocus}
                                />
                            </View>

                            {/* Address line 3 */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_THREE}
                                />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressThreeValid}
                                    errorMessage={state.addressThreeErrorMsg}
                                    value={state.addressThreeDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onAddressThreeChange}
                                    numberOfLines={2}
                                    onFocus={onAddressThreeFocus}
                                />
                            </View>

                            {/* City */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_CITY}
                                />
                                <LongTextInput
                                    minLength={1}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.cityValid}
                                    errorMessage={state.cityErrorMsg}
                                    value={state.cityDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onCityChange}
                                    numberOfLines={2}
                                    onFocus={onCityFocus}
                                />
                            </View>

                            {/* Postcode */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_POSTAL}
                                />
                                <TextInput
                                    minLength={1}
                                    maxLength={8}
                                    isValidate
                                    isValid={state.postcodeValid}
                                    errorMessage={state.postcodeErrorMsg}
                                    value={state.postcodeDisp}
                                    placeholder={STEPUP_MAE_POSTCODE_PLACEHOLDER}
                                    onChangeText={onPostcodeChange}
                                    blurOnSubmit
                                    returnKeyType="done"
                                    onFocus={onPostcodeFocus}
                                />
                            </View>

                            {/* State */}
                            {stateShow && (
                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.state}
                                    onPress={() => onDropdownTap("state")}
                                    style={Style.fieldViewCls}
                                />
                            )}

                            {/* Contact number */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_ADDRESS_CONTACT}
                                />
                                <TextInput
                                    maxLength={14}
                                    isValidate
                                    isValid={state.contactNumValid}
                                    errorMessage={state.contactNumErrorMsg}
                                    value={state.contactNumDisp}
                                    keyboardType="numeric"
                                    onChangeText={onContactNumChange}
                                    blurOnSubmit
                                    returnKeyType="done"
                                    onFocus={onContactNumFocus}
                                />
                            </View>

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={Style.bottomSpacer} />
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={state.ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* State Picker */}
            {state.stateData && (
                <ScrollPickerView
                    showMenu={state.statePicker}
                    list={state.stateData}
                    selectedIndex={state.stateValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Country Picker */}
            {state.countryData && (
                <ScrollPickerView
                    showMenu={state.countryPicker}
                    list={state.countryData}
                    selectedIndex={state.countryValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

LAEmpAddress.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomSpacer: {
        marginTop: 60,
    },

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        lineHeight: 16,
        paddingVertical: 15,
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerText: {
        paddingTop: 8,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
});

export default LAEmpAddress;

/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    JA_INCOME_COMMITMENT,
    JA_EMPLOYMENT_ADDRESS,
    JA_CONFIRMATION,
    APPLICATION_DETAILS,
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

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    RED_ERROR,
    FADE_GREY,
} from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    SAVE_NEXT,
    CONFIRM,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_OFFICEADRESS,
    EDIT,
    JOINT_APPLICATION,
    EDIT_OFFICE_ADDRESS,
    SAVE_AND_NEXT,
} from "@constants/strings";

import { maskAddress, maskMobileNumber } from "@utils/maskUtils";

import {
    ADDRESS_LINE_THREE,
    ADDRESS_ONE,
    ADDRESS_TWO,
    REVIEW_UPDATE_OFICE_ADDR,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_ADDRESS_CONTACT,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
} from "../../../constants/strings";
import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import {
    getExistingData,
    getEncValue,
    checkCCRISReportAvailability,
    useResetNavigation,
} from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressThree,
    validateAddressTwo,
    validateCity,
    validatePostcode,
} from "../Eligibility/CEController";
import { saveEligibilityInput, saveJAInput } from "./JAController";

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
    loading: true,
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
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
            };
        default:
            return { ...state };
    }
}
function JAEmployementAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(true);
    const [resetToApplication] = useResetNavigation(navigation);
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

    // Show state field only if country is Malaysia
    useEffect(() => {
        dispatch({
            actionType: "SET_STATE_SHOW",
            payload: {
                stateShow: countryValue === "MYS",
            },
        });
    }, [countryValue]);

    const init = useCallback(() => {
        // Populate Picker Data
        setPickerData();
        // Prepopulate any existing details
        prepopulateData();
        setLoading(false);
    }, [route, navigation]);

    function onBackTap() {
        navigation.goBack();
    }

    async function onCloseTap() {
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    function setPickerData() {
        const masterData = route.params?.masterData ?? {};
        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                stateData: masterData?.state ?? null,
                countryData: masterData?.country ?? null,
            },
        });
    }

    function closeRemoveAppPopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };
        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (savedData?.isSaveData === "Y" && success) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    ...navParams,
                    savedData,
                    cancelReason,
                    propertyDetails,
                    reload: true,
                },
            });
        } else {
            resetToApplication();
        }
    }

    function prepopulateData() {
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
        } = getUIData(navParams, savedData, mdmData, paramsEditFlow);
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
            currentStep && currentStep < totalSteps ? `Step ${currentStep} of ${totalSteps}` : "";
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                stepperInfo,
            },
        });
    }
    function getUIData(navParams, savedData, mdmData, paramsEditFlow) {
        if (paramsEditFlow) {
            return {
                empAddress1: navParams?.employerAddr1 ?? "",
                empAddress2: navParams?.employerAddr2 ?? "",
                empAddress3: navParams?.employerAddr3 ?? "",
                empCity: navParams?.employerCity ?? "",
                empPostcode: navParams?.employerPostCode ?? "",
                empState: navParams?.employerState ?? "",
                empCountry: navParams?.employerCountry ?? "",
                empContactNumber: navParams?.employerPhoneNo ?? "",
            };
        } else {
            return {
                empAddress1: savedData?.employerAddr1 ?? mdmData?.empAddr1,
                empAddress2: savedData?.employerAddr2 ?? mdmData?.empAddr2,
                empAddress3: savedData?.employerAddr3 ?? mdmData?.empAddr3,
                empCity: savedData?.employerCity ?? mdmData?.empCity,
                empPostcode: savedData?.employerPostCode ?? mdmData?.empPostCode,
                empState: savedData?.employerState ?? mdmData?.empState,
                empCountry: savedData?.employerCountry ?? mdmData?.empCountry,
                empContactNumber: savedData?.employerPhoneNo ?? mdmData?.empTelephone,
            };
        }
    }

    function onPickerCancel() {
        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
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

    function onTap(payloadValue) {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: payloadValue,
        });
    }

    function onTextFieldChange(value, actionTypeValue) {
        dispatch({
            actionType: actionTypeValue,
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
        // Hide popup
        closeExitPopup();
        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_EMPLOYMENT_ADDRESS,
            formData,
            navParams,
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
        // Hide popup
        closeExitPopup();
        resetToApplication();
    }

    function closeExitPopup() {
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function resetValidationErrors() {
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
        return !(!addressOneValid ||
            !addressTwoValid ||
            !addressThreeValid ||
            !cityValid ||
            !postcodeValid);
    }
    async function onContinue() {
        const navParams = route?.params ?? {};
        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;
        // Retrieve form data
        const formData = getFormData();
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        // Request object
        const params = {
            progressStatus: PROP_ELG_INPUT,
            propertyId: route?.params?.propertyDetails?.property_id ?? "",
            syncId: encSyncId,
        };
        // API Call - To check CCRIS report availability.
        const { applicationStpRefNo, ccrisReportFlag } = await checkCCRISReportAvailability(
            params,
            false
        );
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        // Save Form Data in DB before moving to next screen
        const httpReq = await saveJAInput({
            screenName: JA_EMPLOYMENT_ADDRESS,
            formData,
            navParams,
        });
        // Navigate to Financing Type screen
        if (httpReq.success === true) {
            if (editFlow) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: JA_CONFIRMATION,
                    params: {
                        ...navParams,
                        ...formData,
                        updateData: true,
                    },
                });
            } else {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: JA_INCOME_COMMITMENT,
                    params: {
                        ...navParams,
                        ...formData,
                        currentStep,
                        applicationStpRefNo,
                        ccrisReportFlag,
                    },
                });
            }
        }
    }

    function getFormData() {
        return {
            employerAddr1: addressOne,
            employerAddr2: addressTwo,
            employerAddr3: addressThree,
            employerCity: city,
            employerPostCode: postcode,
            employerState: stateShow ? state.stateValue : "",
            employerCountry: countryValue,
            employerPhoneNo: contactNum,
            progressStatus: PROP_ELG_INPUT,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_OFFICEADRESS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow
                                ? (
                                    <Typo
                                        text={EDIT}
                                        lineHeight={16}
                                        fontSize={12}
                                        fontWeight="600"
                                        color={BLACK}
                                    />
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
                                text={editFlow ? EDIT_OFFICE_ADDRESS : JOINT_APPLICATION}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text={REVIEW_UPDATE_OFICE_ADDR}
                                textAlign="left"
                            />

                            {/* Country */}
                            <LabeledDropdown
                                label="Country"
                                dropdownValue={state.country}
                                onPress={() => onTap("country")}
                                style={Style.fieldViewCls}
                            />

                            {/* Address line 1 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={ADDRESS_ONE} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressOneValid}
                                    errorMessage={state.addressOneErrorMsg}
                                    value={state.addressOneDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_ONE")}
                                    numberOfLines={2}
                                    onFocus={onAddressOneFocus}
                                />
                            </View>

                            {/* Address line 2 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={ADDRESS_TWO} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressTwoValid}
                                    errorMessage={state.addressTwoErrorMsg}
                                    value={state.addressTwoDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_TWO")}
                                    numberOfLines={2}
                                    onFocus={onAddressTwoFocus}
                                />
                            </View>

                            {/* Address line 3 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={ADDRESS_LINE_THREE} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressThreeValid}
                                    errorMessage={state.addressThreeErrorMsg}
                                    value={state.addressThreeDisp}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={(v) => onTextFieldChange(v, "SET_ADDRESS_THREE")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_CITY")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_POSTCODE")}
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
                                    onPress={() => onTap("state")}
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
                                    onChangeText={(v) => onTextFieldChange(v, "SET_CONTACT_NUM")}
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
                                        text={state.editFlow ? SAVE_AND_NEXT : state.ctaText}
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
                title={EXIT_JA_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
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
            {/*Application Removed popup */}
            <Popup
                visible={state.showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeRemoveAppPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeRemoveAppPopup,
                }}
            />
        </>
    );
}

JAEmployementAddress.propTypes = {
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

export default JAEmployementAddress;

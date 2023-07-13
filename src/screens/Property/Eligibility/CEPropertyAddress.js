/* eslint-disable sonarjs/cognitive-complexity */
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    CE_PROPERTY_ADDRESS,
    BANKINGV2_MODULE,
    CE_PURCHASE_DOWNPAYMENT,
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
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    SAVE_NEXT,
    FA_PROPERTY_APPLYMORTGAGE_PROPERTYADDRESS,
    FA_PROPERTY_CE_SAVEPROGRESS,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    ENTER_PROPERTY_ADDRESS,
    APPLY_MORTGAGE,
    STEPUP_MAE_ADDRESS_ONE,
    STEPUP_MAE_ADDRESS_TWO,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_ADDRESS_POSTAL,
} from "@constants/strings";

import { useResetNavigation, getExistingData } from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressTwo,
    validateCity,
    validatePostcode,
    saveEligibilityInput,
} from "../Eligibility/CEController";

// Initial state object
const initialState = {
    //stepper info
    currentStep: "",
    totalSteps: "",
    stepperInfo: "",

    // Address 1
    addressOne: "",
    addressOneValid: true,
    addressOneErrorMsg: "",

    // Address 2
    addressTwo: "",
    addressTwoValid: true,
    addressTwoErrorMsg: "",

    // City
    city: "",
    cityValid: true,
    cityErrorMsg: "",

    // Postcode
    postcode: "",
    postcodeValid: true,
    postcodeErrorMsg: "",

    // State related
    state: PLEASE_SELECT,
    stateValue: null,
    stateValueIndex: 0,
    stateData: null,
    statePicker: false,
    stateObj: null,

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
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                statePicker: payload === "state",
            };
        case "SET_STEPPER_INFO":
        case "SET_PICKER_DATA":
        case "SET_STATE":
        case "RESET_VALIDATION_ERRORS":
        case "SET_ADDRESS_ONE_ERROR":
        case "SET_ADDRESS_TWO_ERROR":
        case "SET_CITY_ERROR":
        case "SET_POSTCODE_ERROR":
            return {
                ...state,
                ...payload,
            };
        case "SET_ADDRESS_ONE":
            return {
                ...state,
                addressOne: payload,
            };
        case "SET_ADDRESS_TWO":
            return {
                ...state,
                addressTwo: payload,
            };
        case "SET_CITY":
            return {
                ...state,
                city: payload,
            };
        case "SET_POSTCODE":
            return {
                ...state,
                postcode: payload,
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
        default:
            return { ...state };
    }
}

function CEPropertyAddress({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const { isContinueDisabled, addressOne, addressTwo, city, postcode } = state;

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                addressOne.trim() === "" ||
                addressTwo.trim() === "" ||
                postcode.trim() === "" ||
                state.state === PLEASE_SELECT,
        });
    }, [addressOne, addressTwo, state.state, postcode]);

    const init = useCallback(() => {
        console.log("[CEPropertyAddress] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && currentStep < totalSteps ? `Step ${currentStep} of ${totalSteps}` : "";

        // Populate Picker Data
        setPickerData();

        //Set Stepper Info
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                currentStep,
                totalSteps,
                stepperInfo,
            },
        });

        // Pre-populate data for resume flow
        if (resumeFlow) populateSavedData();
    }, [route, navigation]);

    function onBackTap() {
        console.log("[CEPropertyAddress] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEPropertyAddress] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });

        FAProperty.onPressViewScreen(FA_PROPERTY_CE_SAVEPROGRESS);
    }

    function setPickerData() {
        console.log("[CEPropertyAddress] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                stateData: masterData?.stateNonListed ?? null,
            },
        });
    }

    function populateSavedData() {
        console.log("[CEPropertyAddress] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const propertyAddress1 = savedData?.propertyAddress1;
        const propertyAddress2 = savedData?.propertyAddress2;
        const propertyAddress3 = savedData?.propertyAddress3;
        const propertyPostcode = savedData?.propertyPostcode;
        const propertyState = savedData?.propertyState;

        // Address 1
        if (propertyAddress1) {
            dispatch({
                actionType: "SET_ADDRESS_ONE",
                payload: propertyAddress1,
            });
        }

        // Address 2
        if (propertyAddress2) {
            dispatch({
                actionType: "SET_ADDRESS_TWO",
                payload: propertyAddress2,
            });
        }

        // City
        if (propertyAddress3) {
            dispatch({
                actionType: "SET_CITY",
                payload: propertyAddress3,
            });
        }

        // Postcode
        if (propertyPostcode) {
            dispatch({
                actionType: "SET_POSTCODE",
                payload: propertyPostcode,
            });
        }

        // State
        if (propertyState) {
            const stateSelect = getExistingData(propertyState, masterData?.stateNonListed ?? null);
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
    }

    function onPickerCancel() {
        console.log("[CEPropertyAddress] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[CEPropertyAddress] >> [onPickerDone]");

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

        // Close picker
        onPickerCancel();
    }

    function onStateTap() {
        console.log("[CEPropertyAddress] >> [onStateTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "state",
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

    async function onExitPopupSave() {
        console.log("[CEPropertyAddress] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PROPERTY_ADDRESS,
            formData,
            navParams: route?.params,
            saveData: "Y",
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, SAVE);
    }

    function onExitPopupDontSave() {
        console.log("[CEPropertyAddress] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, DONT_SAVE);
    }

    function closeExitPopup() {
        console.log("[CEPropertyAddress] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function resetValidationErrors() {
        console.log("[CEPropertyAddress] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                addressOneValid: true,
                addressOneErrorMsg: "",
                addressTwoValid: true,
                addressTwoErrorMsg: "",
                cityValid: true,
                cityErrorMsg: "",
                postcodeValid: true,
                postcodeErrorMsg: "",
            },
        });
    }

    function getFormattedPropertyName() {
        console.log("[CEPropertyAddress] >> [getFormattedPropertyName]");

        const data = [addressOne, addressTwo, city, state.state, postcode];
        const { formattedText } = data.reduce(
            (obj, rec, index) => {
                if (rec) {
                    if (index === 3) {
                        if (state.stateValue) {
                            // Convert State value to Title Case
                            const stateTitleCase = rec
                                .toLowerCase()
                                .replace(/(^|\s)\S/g, function (t) {
                                    return t.toUpperCase();
                                });

                            return {
                                formattedText: obj.formattedText
                                    ? `${obj.formattedText}, ${stateTitleCase}`
                                    : stateTitleCase,
                            };
                        } else {
                            return { ...obj };
                        }
                    } else {
                        return {
                            formattedText: obj.formattedText ? `${obj.formattedText}, ${rec}` : rec,
                        };
                    }
                } else {
                    return { ...obj };
                }
            },
            { formattedText: "" }
        );

        // Replaces consecutive duplicate spaces and commas with just one instance.
        return formattedText.replace(/  +/g, " ").replace(/,+/g, ",");
    }

    function validateFormDetails() {
        console.log("[CEPropertyAddress] >> [validateFormDetails]");

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
            "MYS"
        );
        if (!postcodeValid) {
            dispatch({
                actionType: "SET_POSTCODE_ERROR",
                payload: { postcodeValid, postcodeErrorMsg },
            });
        }

        return !(!addressOneValid || !addressTwoValid || !cityValid || !postcodeValid);
    }

    async function onContinue() {
        console.log("[CEPropertyAddress] >> [onContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        const { syncId } = await saveEligibilityInput({
            screenName: CE_PROPERTY_ADDRESS,
            formData,
            navParams,
            saveData: resumeFlow ? "Y" : "N",
        });

        // Navigate to Downpayment screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PURCHASE_DOWNPAYMENT,
            params: { ...navParams, ...formData, syncId },
        });

        FAProperty.onPressFormProceed(FA_PROPERTY_APPLYMORTGAGE_PROPERTYADDRESS);
    }

    function getFormData() {
        console.log("[CEPropertyAddress] >> [getFormData]");

        const propertyName = getFormattedPropertyName();
        const { currentStep, totalSteps } = state;

        return {
            propertyAddress1: addressOne,
            propertyAddress2: addressTwo,
            propertyAddress3: city,
            propertyPostcode: postcode,
            propertyState: state.stateValue,
            propertyName,
            propertyAddressName: propertyName,
            headerText: propertyName,
            currentStep,
            totalSteps,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_APPLYMORTGAGE_PROPERTYADDRESS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    text={state.stepperInfo}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                            {/* Apply mortgage */}
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={APPLY_MORTGAGE}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text={ENTER_PROPERTY_ADDRESS}
                                textAlign="left"
                            />

                            {/* Address line 1 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_ONE} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressOneValid}
                                    errorMessage={state.addressOneErrorMsg}
                                    value={addressOne}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onAddressOneChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Address line 2 */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_TWO} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressTwoValid}
                                    errorMessage={state.addressTwoErrorMsg}
                                    value={addressTwo}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onAddressTwoChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* City */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_CITY} />
                                <LongTextInput
                                    minLength={1}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.cityValid}
                                    errorMessage={state.cityErrorMsg}
                                    value={city}
                                    placeholder={STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER}
                                    onChangeText={onCityChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Postcode */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_POSTAL} />
                                <TextInput
                                    minLength={1}
                                    maxLength={8}
                                    isValidate
                                    isValid={state.postcodeValid}
                                    errorMessage={state.postcodeErrorMsg}
                                    value={postcode}
                                    placeholder={STEPUP_MAE_POSTCODE_PLACEHOLDER}
                                    onChangeText={onPostcodeChange}
                                    blurOnSubmit
                                    returnKeyType="done"
                                />
                            </View>

                            {/* State */}
                            <LabeledDropdown
                                label="State"
                                dropdownValue={state.state}
                                onPress={onStateTap}
                                style={Style.fieldViewCls}
                            />

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
                                        text={SAVE_NEXT}
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

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={EXIT_POPUP_TITLE}
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
        </>
    );
}

CEPropertyAddress.propTypes = {
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

export default CEPropertyAddress;

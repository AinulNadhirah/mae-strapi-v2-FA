import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { CE_RESULT, BANKINGV2_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { TextInput, LongTextInput } from "@components/Common";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED_TEXT, DISABLED, RED_ERROR } from "@constants/colors";
import { PLEASE_SELECT, DONE, CANCEL } from "@constants/strings";

import { getExistingData } from "../Common/PropertyController";
import {
    validateAddressOne,
    validateAddressTwo,
    validateCity,
    validatePostcode,
} from "../Eligibility/CEController";

// Initial state object
const initialState = {
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

    // Country related
    country: PLEASE_SELECT,
    countryValue: null,
    countryValueIndex: 0,
    countryData: null,
    countryPicker: false,
    countryObj: null,

    // Email
    email: "",
    emailValid: true,
    emailErrorMsg: "",

    // Telephone
    telephone: "",
    telephoneValid: true,
    telephoneErrorMsg: "",

    // Others
    isContinueDisabled: true,
    pickerType: null,
    propUnitTypeName: "",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_PROP_UNIT_NAME":
            return {
                ...state,
                propUnitTypeName: payload,
            };
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
        case "SET_PICKER_DATA":
        case "SET_STATE":
        case "SET_COUNTRY":
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
        case "SET_EMAIL":
            return {
                ...state,
                email: payload,
            };
        case "SET_TELEPHONE":
            return {
                ...state,
                telephone: payload,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

function LAEmployer({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        isContinueDisabled,
        addressOne,
        addressTwo,
        city,
        postcode,
        country,
        email,
        telephone,
    } = state;

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
                city.trim() === "" ||
                postcode.trim() === "" ||
                state.state === PLEASE_SELECT ||
                country === PLEASE_SELECT ||
                email.trim() === "" ||
                telephone.trim() === "",
        });
    }, [addressOne, addressTwo, city, state.state, postcode, country, email, telephone]);

    const init = async () => {
        console.log("[LAEmployer] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();

        const propertyName = route.params?.propertyName;

        // Set Property-Unit Type name
        dispatch({
            actionType: "SET_PROP_UNIT_NAME",
            payload: propertyName,
        });
    };

    const onBackTap = () => {
        console.log("[LAEmployer] >> [onBackTap]");

        navigation.goBack();
    };

    const onCloseTap = () => {
        console.log("[LAEmployer] >> [onCloseTap]");
    };

    const prepopulateData = () => {
        console.log("[LAEmployer] >> [prepopulateData]");

        const masterData = route.params?.masterData ?? {};
        const mdmData = route.params?.mdmData ?? {};

        const mdmAddressOne = mdmData?.empAddr1 ?? null;
        const mdmAddressTwo = mdmData?.empAddr2 ?? null;
        const mdmCity = mdmData?.empAddr3 ?? null;
        const mdmPostcode = mdmData?.empPostCode ?? null;
        const mdmState = mdmData?.empState ?? null;
        const mdmCountry = mdmData?.empCountry ?? null;
        const mdmEmail = mdmData?.empEmail ?? null;
        const mdmTelephone = mdmData?.empTelephone ?? null;

        // Address One
        if (mdmAddressOne) {
            dispatch({
                actionType: "SET_ADDRESS_ONE",
                payload: mdmAddressOne,
            });
        }

        // Address Two
        if (mdmAddressTwo) {
            dispatch({
                actionType: "SET_ADDRESS_TWO",
                payload: mdmAddressTwo,
            });
        }

        // City
        if (mdmCity) {
            dispatch({
                actionType: "SET_CITY",
                payload: mdmCity,
            });
        }

        // Postcode
        if (mdmPostcode) {
            dispatch({
                actionType: "SET_POSTCODE",
                payload: mdmPostcode,
            });
        }

        // State
        if (mdmState) {
            const stateSelect = getExistingData(mdmState, masterData?.state ?? null);
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
        if (mdmCountry) {
            const countrySelect = getExistingData(mdmCountry, masterData?.country ?? null);
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

        // Email
        if (mdmEmail) {
            dispatch({
                actionType: "SET_EMAIL",
                payload: mdmEmail,
            });
        }

        // Telephone
        if (mdmTelephone) {
            dispatch({
                actionType: "SET_TELEPHONE",
                payload: mdmTelephone,
            });
        }
    };

    const setPickerData = () => {
        console.log("[CEAddress] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                stateData: masterData?.state ?? null,
                countryData: masterData?.country ?? null,
            },
        });
    };

    const onPickerCancel = () => {
        console.log("[LAEmployer] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
        console.log("[LAEmployer] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "state":
                dispatch({
                    actionType: "SET_STATE",
                    payload: {
                        state: item?.name ?? PLEASE_SELECT,
                        stateValue: item?.value ?? null,
                        stateObj: item,
                        stateValueIndex: index,
                    },
                });
                break;
            case "country":
                dispatch({
                    actionType: "SET_COUNTRY",
                    payload: {
                        country: item?.name ?? PLEASE_SELECT,
                        countryValue: item?.value ?? null,
                        countryObj: item,
                        countryValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    const onStateTap = () => {
        console.log("[LAEmployer] >> [onStateTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "state",
        });
    };

    const onCountryTap = () => {
        console.log("[LAEmployer] >> [onCountryTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "country",
        });
    };

    const onAddressOneChange = (value) => {
        dispatch({
            actionType: "SET_ADDRESS_ONE",
            payload: value,
        });
    };

    const onAddressTwoChange = (value) => {
        dispatch({
            actionType: "SET_ADDRESS_TWO",
            payload: value,
        });
    };

    const onCityChange = (value) => {
        dispatch({
            actionType: "SET_CITY",
            payload: value,
        });
    };

    const onPostcodeChange = (value) => {
        dispatch({
            actionType: "SET_POSTCODE",
            payload: value,
        });
    };

    const onEmailChange = (value) => {
        dispatch({
            actionType: "SET_EMAIL",
            payload: value,
        });
    };

    const onTelephoneChange = (value) => {
        dispatch({
            actionType: "SET_TELEPHONE",
            payload: value,
        });
    };

    const resetValidationErrors = () => {
        console.log("[CEAddress] >> [resetValidationErrors]");

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
                emailValid: true,
                emailErrorMsg: "",
                telephoneValid: true,
                telephoneErrorMsg: "",
            },
        });
    };

    const validateFormDetails = () => {
        console.log("[CEAddress] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        // TODO: Add validations for Email & Telephone

        // Address One
        const { isValid: addressOneValid, message: addressOneErrorMsg } =
            validateAddressOne(addressOne);
        if (!addressOneValid)
            dispatch({
                actionType: "SET_ADDRESS_ONE_ERROR",
                payload: { addressOneValid, addressOneErrorMsg },
            });

        // Address Two
        const { isValid: addressTwoValid, message: addressTwoErrorMsg } =
            validateAddressTwo(addressTwo);
        if (!addressTwoValid)
            dispatch({
                actionType: "SET_ADDRESS_TWO_ERROR",
                payload: { addressTwoValid, addressTwoErrorMsg },
            });

        // City
        const { isValid: cityValid, message: cityErrorMsg } = validateCity(city);
        if (!cityValid)
            dispatch({
                actionType: "SET_CITY_ERROR",
                payload: { cityValid, cityErrorMsg },
            });

        // Post Code
        const { isValid: postcodeValid, message: postcodeErrorMsg } = validatePostcode(postcode);
        if (!postcodeValid)
            dispatch({
                actionType: "SET_POSTCODE_ERROR",
                payload: { postcodeValid, postcodeErrorMsg },
            });

        if (!addressOneValid || !addressTwoValid || !cityValid || !postcodeValid) {
            return false;
        }

        // Return true if all validation checks are passed
        return true;
    };

    const onContinue = () => {
        console.log("[LAEmployer] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const formData = getFormData();

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params: { ...formData },
        });
    };

    const getFormData = () => {
        console.log("[LAEmployer] >> [getFormData]");
    };

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={18}
                                text={state.propUnitTypeName}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text="Please enter your employer address"
                                textAlign="left"
                            />

                            {/* Address line one */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Address line one" />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressOneValid}
                                    errorMessage={state.addressOneErrorMsg}
                                    value={addressOne}
                                    placeholder="Enter your address"
                                    onChangeText={onAddressOneChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Address line two */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Address line two" />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.addressTwoValid}
                                    errorMessage={state.addressTwoErrorMsg}
                                    value={addressTwo}
                                    placeholder="Enter your address"
                                    onChangeText={onAddressTwoChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* City */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="City" />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.cityValid}
                                    errorMessage={state.cityErrorMsg}
                                    value={city}
                                    placeholder="Enter your city"
                                    onChangeText={onCityChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Postcode */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Postcode" />
                                <TextInput
                                    minLength={5}
                                    maxLength={5}
                                    isValidate
                                    isValid={state.postcodeValid}
                                    errorMessage={state.postcodeErrorMsg}
                                    value={postcode}
                                    placeholder="Enter your postcode"
                                    keyboardType="numeric"
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

                            {/* Country */}
                            <LabeledDropdown
                                label="Country"
                                dropdownValue={country}
                                onPress={onCountryTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Email */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Email" />
                                <LongTextInput
                                    maxLength={40}
                                    isValidate
                                    isValid={state.emailValid}
                                    errorMessage={state.errorMessage}
                                    value={email}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    onChangeText={onEmailChange}
                                    numberOfLines={2}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Telephone */}
                            <View style={Style.fieldViewCls}>
                                <Typo lineHeight={19} textAlign="left" text="Telephone" />
                                <TextInput
                                    prefix="+60"
                                    minLength={9}
                                    maxLength={12}
                                    isValidate
                                    isValid={state.telephoneValid}
                                    errorMessage={state.telephoneErrorMsg}
                                    value={telephone}
                                    placeholder=""
                                    keyboardType="numeric"
                                    onChangeText={onTelephoneChange}
                                    blurOnSubmit
                                    returnKeyType="done"
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
                                        text="Next"
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
        </>
    );
}

LAEmployer.propTypes = {
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

    radioBtnLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioBtnOuterViewCls: {
        flexDirection: "row",
        marginTop: 15,
    },

    radioBtnViewCls: {
        justifyContent: "center",
        width: 100,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
});

export default LAEmployer;

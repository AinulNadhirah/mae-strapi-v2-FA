import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { maskAddress, maskPostCode } from "@screens/PLSTP/PLSTPController";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView, LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { cardsUpdate } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    FA_APPLY_CREDITCARD_EMPLOYMENTDETAILS2,
    FA_APPLY_CREDITCARD_ETB_EMPLOYMENTDETAILS2,
} from "@constants/strings";

import {
    addressCharRegexCC,
    leadingOrDoubleSpaceRegex,
    maeOnlyNumberRegex,
    cityCharRegex,
} from "@utils/dataModel";

import assets from "@assets";

const initialState = {
    // State related
    stateOff: PLEASE_SELECT,
    stateOffValue: null,
    stateOffObj: {},
    stateOffValid: true,
    stateOffErrorMsg: "",
    stateOffData: [],
    stateOffValueIndex: 0,
    stateOffPicker: false,

    // Home address line 1
    address1Off: "",
    address1OffValid: true,
    address1OffErrorMsg: "",
    address1OffFocus: false,
    address1OffMask: "",

    // Home address line 2
    address2Off: "",
    address2OffValid: true,
    address2OffErrorMsg: "",
    address2OffFocus: false,
    address2OffMask: "",

    // Home address line 3
    address3Off: "",
    address3OffValid: true,
    address3OffErrorMsg: "",
    address3OffFocus: false,
    address3OffMask: "",

    // Postcode related
    postcodeOff: "",
    postcodeOffValid: true,
    postcodeOffErrorMsg: "",
    postcodeOffFocus: false,
    postcodeOffMask: "",

    // City related
    cityOff: "",
    cityOffValid: true,
    cityOffErrorMsg: "",
    cityOffFocus: false,
    cityOffMask: "",

    // Mobile Prefix related
    phonePrefix: "Select",
    phonePrefixValue: null,
    phonePrefixObj: {},
    phonePrefixValid: true,
    phonePrefixErrorMsg: "",
    phonePrefixData: [],
    phonePrefixValueIndex: 0,
    phonePrefixPicker: false,

    // Contact number
    contactOff: "",
    contactOffValid: true,
    contactOffErrorMsg: "",

    //Info Popup
    showInfo: false,
    infoTitle: "",
    infoDescription: "",

    // Others
    isContinueDisabled: true,
    addressBlock: ["UNKNOWN", "NIL", "NOT APPLICABLE", "NOTAPPL", "NOT/APPL"],
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns": {
            const stateArr = payload?.serverData?.stateData?.statesList;
            const stateFilter = stateArr.filter((item) => item?.value.indexOf("FEDERAL") != 0);
            return {
                ...state,
                stateOffData: stateFilter ?? state.stateOffData,
                phonePrefixData: payload?.serverData?.masterData?.homeOfficeExt ?? state.raceData,
            };
        }

        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                stateOffPicker: false,
                phonePrefixPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                stateOffPicker: payload === "stateOff",
                phonePrefixPicker: payload === "phonePrefix",
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? state?.infoTitle,
                infoDescription: payload?.desc ?? state?.infoDescription,
            };
        case "stateOffDone":
            return {
                ...state,
                stateOff: payload?.stateOff,
                stateOffValue: payload?.stateOffValue,
                stateOffObj: payload?.stateOffObj,
                stateOffValueIndex: payload?.stateOffValueIndex,
            };
        case "phonePrefixDone":
            return {
                ...state,
                phonePrefix: payload?.phonePrefix,
                phonePrefixValue: payload?.phonePrefixValue,
                phonePrefixObj: payload?.phonePrefixObj,
                phonePrefixValueIndex: payload?.phonePrefixValueIndex,
            };

        case "address1Off":
            return {
                ...state,
                address1Off: payload.address1Off,
                address1OffFocus: payload.address1OffFocus,
                address1OffMask: payload.address1OffMask,
            };
        case "address2Off":
            return {
                ...state,
                address2Off: payload.address2Off,
                address2OffFocus: payload.address2OffFocus,
                address2OffMask: payload.address2OffMask,
            };
        case "address3Off":
            return {
                ...state,
                address3Off: payload.address3Off,
                address3OffFocus: payload.address3OffFocus,
                address3OffMask: payload.address3OffMask,
            };
        case "postcodeOff":
            return {
                ...state,
                postcodeOff: payload.postcodeOff,
                postcodeOffFocus: payload.postcodeOffFocus,
                postcodeOffMask: payload.postcodeOffMask,
            };
        case "cityOff":
            return {
                ...state,
                cityOff: payload.cityOff,
                cityOffFocus: payload.cityOffFocus,
                cityOffMask: payload.cityOffMask,
            };
        case "contactOff":
            return {
                ...state,
                contactOff: payload,
            };
        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                address1OffValid: payload?.address1OffValid ?? true,
                address1OffErrorMsg: payload?.address1OffErrorMsg ?? "",
                address2OffValid: payload?.address2OffValid ?? true,
                address2OffErrorMsg: payload?.address2OffErrorMsg ?? "",
                address3OffValid: payload?.address3OffValid ?? true,
                address3OffErrorMsg: payload?.address3OffErrorMsg ?? "",
                postcodeOffValid: payload?.postcodeOffValid ?? true,
                postcodeOffErrorMsg: payload?.postcodeOffErrorMsg ?? "",
                cityOffValid: payload?.cityOffValid ?? true,
                cityOffErrorMsg: payload?.cityOffErrorMsg ?? "",
                contactOffValid: payload?.contactOffValid ?? true,
                contactOffErrorMsg: payload?.contactOffErrorMsg ?? "",
            };
        default:
            return { ...state };
    }
}

function CardsOfficeAddress({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            console.log(params);
            dispatch({
                actionType: "PopulateDropdowns",
                payload: params,
            });

            //prePopulate Data
            populateData();
        } catch (error) {
            console.log(error);
            navigation.canGoBack() && navigation.goBack();
        }
    }, [navigation, populateData, route?.params]);

    const populateData = useCallback(() => {
        const params = route?.params ?? {};
        const {
            stateData: { statesList },
            masterData: { homeOfficeExt },
        } = params?.serverData;

        const {
            officeAddress1,
            officeAddress2,
            officeAddress3,
            officePostcode,
            officeCity,
            officePrefix,
            officeContact,
            officeState,
        } = params?.populateObj;

        const newMobilePrefix = officePrefix ? officePrefix : "03";

        //Home Address1
        if (officeAddress1) {
            const addrSubStr = officeAddress1.substring(0, 30);
            const maskedAddress1 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address1Off",
                payload: {
                    address1Off: officeAddress1,
                    address1OffFocus: false,
                    address1OffMask: maskedAddress1,
                },
            });
        }

        //Home Address2
        if (officeAddress2) {
            const addrSubStr = officeAddress2.substring(0, 30);
            const maskedAddress2 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address2Off",
                payload: {
                    address2Off: officeAddress2,
                    address2OffFocus: false,
                    address2OffMask: maskedAddress2,
                },
            });
        }

        //Home Address3
        if (officeAddress3) {
            const addrSubStr = officeAddress3.substring(0, 30);
            const maskedAddress3 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address3Off",
                payload: {
                    address3Off: officeAddress3,
                    address3OffFocus: false,
                    address3OffMask: maskedAddress3,
                },
            });
        }

        //Postcode
        if (officePostcode) {
            dispatch({
                actionType: "postcodeOff",
                payload: {
                    postcodeOff: officePostcode,
                    postcodeOffFocus: false,
                    postcodeOffMask: maskPostCode(officePostcode),
                },
            });
        }

        //City
        if (officeCity) {
            dispatch({
                actionType: "cityOff",
                payload: {
                    cityOff: officeCity,
                    cityOffFocus: false,
                    cityOffMask: maskAddress(officeCity),
                },
            });
        }

        //State
        if (officeState && statesList) {
            const emp = statesList.find((item) => item.value === officeState);
            emp &&
                dispatch({
                    actionType: "stateOffDone",
                    payload: { stateOff: emp?.name, stateOffValue: emp?.value, stateOffObj: emp },
                });
        }

        //Home Phone Number Prefix
        if (newMobilePrefix && homeOfficeExt) {
            const home = homeOfficeExt.find((item) => item.value === newMobilePrefix);
            home &&
                dispatch({
                    actionType: "phonePrefixDone",
                    payload: {
                        phonePrefix: home?.name,
                        phonePrefixValue: home?.value,
                        phonePrefixObj: home,
                    },
                });
        }

        //office Contact
        officeContact && dispatch({ actionType: "contactOff", payload: officeContact });
    }, [route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.stateOff === PLEASE_SELECT ||
                state.phonePrefix === "Select" ||
                state.address1Off === "" ||
                state.address2Off === "" ||
                //state.address3Off === "" ||
                state.postcodeOff === "" ||
                state.cityOff === "" ||
                state.contactOff === "",
        });
    }, [
        state.stateOff,
        state.phonePrefix,
        state.address1Off,
        state.address2Off,
        state.address3Off,
        state.postcodeOff,
        state.cityOff,
        state.contactOff,
    ]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: { show: false, title: "", desc: "" },
        });
    }

    function handleInfoPress() {
        console.log("handleInfoPress");
        const popupTitle = "Office address line ";
        const popupDesc = "P.O. Box is not allowed.";
        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title: popupTitle, desc: popupDesc },
        });
    }

    function onStateOffTap() {
        dispatch({
            actionType: "showPicker",
            payload: "stateOff",
        });
    }

    function onPhonePrefixTap() {
        dispatch({
            actionType: "showPicker",
            payload: "phonePrefix",
        });
    }

    function onPickerCancel() {
        dispatch({
            actionType: "hidePicker",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        const { pickerType } = state;
        switch (pickerType) {
            case "stateOff":
                dispatch({
                    actionType: "stateOffDone",
                    payload: {
                        stateOff: item?.name ?? PLEASE_SELECT,
                        stateOffValue: item?.value ?? null,
                        stateOffObj: item,
                        stateOffValueIndex: index,
                    },
                });
                break;

            case "phonePrefix":
                dispatch({
                    actionType: "phonePrefixDone",
                    payload: {
                        phonePrefix: item?.name ?? PLEASE_SELECT,
                        phonePrefixValue: item?.value ?? null,
                        phonePrefixObj: item,
                        phonePrefixValueIndex: index,
                    },
                });

                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onAddress1OffChange(value) {
        return dispatch({
            actionType: "address1Off",
            payload: { address1Off: value, address1OffFocus: true, address1OffMask: value },
        });
    }
    function onAddress2OffChange(value) {
        return dispatch({
            actionType: "address2Off",
            payload: { address2Off: value, address2OffFocus: true, address2OffMask: value },
        });
    }
    function onAddress3OffChange(value) {
        return dispatch({
            actionType: "address3Off",
            payload: { address3Off: value, address3OffFocus: true, address3OffMask: value },
        });
    }

    function onPostcodeOffChange(value) {
        return dispatch({
            actionType: "postcodeOff",
            payload: { postcodeOff: value, postcodeOffFocus: true, postcodeOffMask: value },
        });
    }

    function onCityOffChange(value) {
        return dispatch({
            actionType: "cityOff",
            payload: { cityOff: value, cityOffFocus: true, cityOffMask: value },
        });
    }

    function onContactOffChange(value) {
        return dispatch({ actionType: "contactOff", payload: value });
    }

    function onAddress1Focus() {
        if (!state.address1OffFocus) {
            return dispatch({
                actionType: "address1Off",
                payload: { address1Off: "", address1OffFocus: true, address1OffMask: "" },
            });
        }
    }

    function onAddress2Focus() {
        if (!state.address2Focus) {
            return dispatch({
                actionType: "address2Off",
                payload: { address2Off: "", address2OffFocus: true, address2OffMask: "" },
            });
        }
    }

    function onAddress3Focus() {
        if (!state.address3Focus) {
            return dispatch({
                actionType: "address3Off",
                payload: { address3Off: "", address3OffFocus: true, address3OffMask: "" },
            });
        }
    }

    function onCityFocus() {
        if (!state.cityOffFocus) {
            return dispatch({
                actionType: "cityOff",
                payload: { cityOff: "", cityOffFocus: true, cityOffMask: "" },
            });
        }
    }

    function onPostcodeFocus() {
        if (!state.postcodeOffFocus) {
            return dispatch({
                actionType: "postcodeOff",
                payload: { postcodeOff: "", postcodeOffFocus: true, postcodeOffMask: "" },
            });
        }
    }

    const validateAddess1 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address1Off)) {
            return {
                address1OffValid: false,
                address1OffErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Office Address.",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.address1Off)) {
            return {
                address1OffValid: false,
                address1OffErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 1.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address1Off.toUpperCase()) > -1) {
            return {
                address1OffValid: false,
                address1OffErrorMsg: "Please enter valid Mailing Address 1.",
            };
        }

        // Return true if no validation error
        return {
            address1OffValid: true,
            address1OffErrorMsg: "",
        };
    }, [state.address1Off, state.addressBlock]);

    const validateAddess2 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address2Off)) {
            return {
                address2OffValid: false,
                address2OffErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Office Address.",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.address2Off)) {
            return {
                address2OffValid: false,
                address2OffErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 2.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address2Off.toUpperCase()) > -1) {
            return {
                address2OffValid: false,
                address2OffErrorMsg: "Please enter valid Mailing Address 2.",
            };
        }

        // Return true if no validation error
        return {
            address2OffValid: true,
            address2OffErrorMsg: "",
        };
    }, [state.address2Off, state.addressBlock]);

    const validateAddess3 = useCallback(() => {
        // No special characters check
        if (state.address3Off !== "" && !addressCharRegexCC(state.address3Off)) {
            return {
                address3OffValid: false,
                address3OffErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Office Address.",
            };
        }

        //  space check
        if (state.address3Off !== "" && !leadingOrDoubleSpaceRegex(state.address3Off)) {
            return {
                address3OffValid: false,
                address3OffErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 3.",
            };
        }

        //  special word checks
        if (
            state.address3Off !== "" &&
            state.addressBlock.indexOf(state.address3Off.toUpperCase()) > -1
        ) {
            return {
                address3OffValid: false,
                address3OffErrorMsg: "Please enter valid Mailing Address 3.",
            };
        }

        // Return true if no validation error
        return {
            address3OffValid: true,
            address3OffErrorMsg: "",
        };
    }, [state.address3Off, state.addressBlock]);

    const validatePostcode = useCallback(() => {
        // Min length check
        if (state.postcodeOff.length !== 5) {
            return {
                postcodeOffValid: false,
                postcodeOffErrorMsg: "Sorry, your Postcode must consists of 5 digits only",
            };
        }
        // No special characters check
        if (!maeOnlyNumberRegex(state.postcodeOff)) {
            return {
                postcodeOffValid: false,
                postcodeOffErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Postcode.",
            };
        }

        // Return true if no validation error
        return {
            postcodeOffValid: true,
            postcodeOffErrorMsg: "",
        };
    }, [state.postcodeOff]);

    const validateCity = useCallback(() => {
        // No special characters check
        if (!cityCharRegex(state.cityOff)) {
            return {
                cityOffValid: false,
                cityOffErrorMsg: "City must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            cityOffValid: true,
            cityOffErrorMsg: "",
        };
    }, [state.cityOff]);

    const validateContactNum = useCallback(() => {
        // Only alphanumeric check
        if (!maeOnlyNumberRegex(state.contactOff)) {
            return {
                contactOffValid: false,
                contactOffErrorMsg:
                    "Sorry, your Office Phone Number must consists of numeric only.",
            };
        }

        // Return true if no validation error
        return {
            contactOffValid: true,
            contactOffErrorMsg: "",
        };
    }, [state.contactOff]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { address1OffValid, address1OffErrorMsg } = validateAddess1();
        const { address2OffValid, address2OffErrorMsg } = validateAddess2();
        const { address3OffValid, address3OffErrorMsg } = validateAddess3();
        const { postcodeOffValid, postcodeOffErrorMsg } = validatePostcode();
        const { cityOffValid, cityOffErrorMsg } = validateCity();
        const { contactOffValid, contactOffErrorMsg } = validateContactNum();

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                address1OffValid,
                address1OffErrorMsg,
                address2OffValid,
                address2OffErrorMsg,
                address3OffValid,
                address3OffErrorMsg,
                postcodeOffValid,
                postcodeOffErrorMsg,
                cityOffValid,
                cityOffErrorMsg,
                contactOffValid,
                contactOffErrorMsg,
            },
        });
        return (
            address1OffValid &&
            address2OffValid &&
            address3OffValid &&
            postcodeOffValid &&
            cityOffValid &&
            contactOffValid
        );
    }

    function getParamData() {
        const {
            address1Off,
            address2Off,
            address3Off,
            postcodeOff,
            cityOff,
            contactOff,
            stateOff,
            stateOffValue,
            stateOffObj,
            phonePrefix,
            phonePrefixValue,
            phonePrefixObj,
        } = state;

        return {
            prepopulateData: {
                officeAddress1: address1Off ?? "",
                officeAddress2: address2Off ?? "",
                officeAddress3: address3Off ?? "",
                officePostcode: postcodeOff ?? "",
                officeCity: cityOff ?? "",
                officePrefix: phonePrefixValue ?? "",
                officeContact: contactOff ?? "",
                officeState: stateOffValue ?? "",
            },
            displayData: {
                officeAddress1: {
                    displayKey: "Office address line 1",
                    displayValue: address1Off,
                },
                officeAddress2: {
                    displayKey: "Office address line 2",
                    displayValue: address2Off,
                },
                officeAddress3: {
                    displayKey: "Office address line 3",
                    displayValue: address3Off,
                },
                officePostcode: {
                    displayKey: "Postcode",
                    displayValue: postcodeOff,
                },
                officeCity: {
                    displayKey: "City",
                    displayValue: cityOff,
                },
                officeAddress1Mask: {
                    displayKey: "Office address line 1",
                    displayValue: maskAddress(address1Off),
                },
                officeAddress2Mask: {
                    displayKey: "Office address line 2",
                    displayValue: maskAddress(address2Off),
                },
                officeAddress3Mask: {
                    displayKey: "Office address line 3",
                    displayValue: maskAddress(address3Off),
                },
                officePostcodeMask: {
                    displayKey: "Postcode",
                    displayValue: maskPostCode(postcodeOff),
                },
                officeCityMask: {
                    displayKey: "City",
                    displayValue: maskAddress(cityOff),
                },
                officePrefix: {
                    displayKey: "Office Phone Prefix",
                    displayValue: phonePrefix,
                    selectedValue: phonePrefixValue,
                    selectedDisplay: phonePrefix,
                    selectedObj: phonePrefixObj,
                },
                officeContact: {
                    displayKey: "Office phone number",
                    displayValue: phonePrefix + contactOff,
                    selectedValue: contactOff,
                },
                officeState: {
                    displayKey: "State",
                    displayValue: stateOff,
                    selectedValue: stateOffValue,
                    selectedDisplay: stateOff,
                    selectedObj: stateOffObj,
                },
            },
        };
    }

    function getServerParams(params) {
        return {
            nc02data: {
                idNo: params?.userAction?.idNumber?.displayValue,
                idType: params?.userAction?.idType?.selectedValue,
                idTypeDisp: params?.userAction?.idType?.selectedDisplay,
                mobNo: params?.userAction?.mobileNumber?.selectedValue,
                mobPrefix: params?.userAction?.mobilePrefix?.selectedValue,
                name: params?.userAction?.name?.displayValue,
                title: params?.userAction?.title?.selectedValue,
                titleDisp: params?.userAction?.title?.selectedDisplay,
                residentialStatus: params?.userAction?.residential?.selectedValue,
                residentialStatusDisp: params?.userAction?.residential?.selectedDisplay,
                countryOfBirth: "MYS",
                countryOfBirthDisp: "Malaysia",
                countryOfPermanentRes: "MYS",
                countryOfPermanentResDisp: "Malaysia",
                eduLevel: params?.userAction?.education?.selectedValue,
                eduLevelDisp: params?.userAction?.education?.selectedDisplay,
                emailAdd: params?.userAction?.email?.displayValue,
                gender: params?.userAction?.gender?.selectedValue,
                genderDisp: params?.userAction?.gender?.displayValue,
                maritalStatus: params?.userAction?.marital?.selectedValue,
                maritalStatusDisp: params?.userAction?.marital?.selectedDisplay,
                nationality: params?.userAction?.nationality?.displayValue,
                pep: params?.userAction?.pep?.selectedValue,
                pepDisp: params?.userAction?.pep?.selectedDisplay, // need to add
                race: params?.userAction?.race?.selectedValue,
                raceDisp: params?.userAction?.race?.selectedDisplay,
                homeAdd1: params?.userAction?.homeAddress1?.displayValue,
                homeAdd2: params?.userAction?.homeAddress2?.displayValue,
                homeAdd3: params?.userAction?.homeAddress3?.displayValue,
                homeAddCity: params?.userAction?.city?.displayValue,
                homeAddPin: params?.userAction?.postcode?.displayValue,
                homeAddState: params?.userAction?.state?.selectedValue,
                homeAddStateDisp: params?.userAction?.state?.selectedDisplay,
                houseAreaCode: params?.userAction?.homePrefix?.selectedValue,
                housePheNo: params?.userAction?.houseNumber?.selectedValue,
                busiessClassification: params?.userAction?.businessClassification?.selectedValue,
                busiessClassificationDisp:
                    params?.userAction?.businessClassification?.selectedDisplay,
                sector: params?.userAction?.sector?.selectedValue, // need to check  no requirement gcif compliance  -required
                sectorDisp: params?.userAction?.sector?.selectedDisplay, // need to check  no requirement gcif compliance  -required
                empTerms: params?.userAction?.termsOfEmployment?.selectedValue,
                empTermsDisp: params?.userAction?.termsOfEmployment?.selectedDisplay,
                employerName: params?.userAction?.empName?.displayValue,
                /*natureOfBusiness: params?.userAction?.natureOfBusiness?.selectedValue,
                natureOfBusinessDisp: params?.userAction?.natureOfBusiness?.selectedDisplay,*/
                occupation: params?.userAction?.occupation?.selectedValue,
                occupationDisp: params?.userAction?.occupation?.selectedDisplay,
                occupationOther: "", // need to check  no requirement gcif compliance -not needed
                serviceLenthM: params?.userAction?.serviceMonth?.selectedValue,
                serviceLenthY: params?.userAction?.serviceYear?.selectedValue,
                employmentType: params?.userAction?.empType?.selectedValue, // need to check  no requirement gcif compliance  -required
                employmentTypeDisp: params?.userAction?.empType?.selectedDisplay, // need to check  no requirement gcif compliance  -required
                ofcAddCity: params?.userAction?.officeCity?.displayValue,
                ofcAddL1: params?.userAction?.officeAddress1?.displayValue,
                ofcAddL2: params?.userAction?.officeAddress2?.displayValue,
                ofcAddL3: params?.userAction?.officeAddress3?.displayValue,
                ofcAreaCode: params?.userAction?.officePrefix?.displayValue,
                ofcAddPhNo: params?.userAction?.officeContact?.selectedValue,
                ofcAddPinCode: params?.userAction?.officePostcode?.displayValue,
                ofcAddState: params?.userAction?.officeState?.selectedValue,
                ofcAddStateDisp: params?.userAction?.officeState?.selectedDisplay,
                sourceOfIncomeAfRetirement: params?.userAction?.sourceIncome?.selectedValue, //need to check -required
                sourceOfIncomeAfRetirementDisp: params?.userAction?.sourceIncome?.selectedDisplay, //need to check  -required
            },
            empName: params?.userAction?.empName?.displayValue,
            /*natOfBusinessCode: params?.userAction?.natureOfBusiness?.selectedValue,
            natOfBusinessDesc: params?.userAction?.natureOfBusiness?.selectedDisplay,*/
            offAdd1: params?.userAction?.officeAddress1?.displayValue,
            offAdd2: params?.userAction?.officeAddress2?.displayValue,
            offAdd3: params?.userAction?.officeAddress3?.displayValue,
            termsOfEmpDesc: params?.userAction?.termsOfEmployment?.selectedDisplay,
            termsOfEmpCode: params?.userAction?.termsOfEmployment?.selectedValue,
            busClassificationDesc: params?.userAction?.businessClassification?.selectedDisplay,
            busClassificationCode: params?.userAction?.businessClassification?.selectedValue,
            occupationDesc: params?.userAction?.occupation?.selectedDisplay,
            occupationCode: params?.userAction?.occupation?.selectedValue,
            officStateDesc: params?.userAction?.officeState?.selectedDisplay,
            officStateCode: params?.userAction?.officeState?.selectedValue,
            occupationOther: "", // need to check  no requirement gcif compliance  -no need
            sectorDesc: params?.userAction?.sector?.selectedDisplay, //need to check no requirement gcif compliance  -required
            sectorCode: params?.userAction?.sector?.selectedValue, //need to check  no requirement gcif compliance -required
            sectorOther: "", //need to check  no requirement gcif compliance -no need
            employmentTypeDesc: params?.userAction?.empType?.selectedDisplay, // need to check no requirement gcif compliance  -required
            employmentTypeCode: params?.userAction?.empType?.selectedValue, // need to check no requirement gcif compliance -required
            officPoCode: params?.userAction?.officePostcode?.displayValue,
            losYears: params?.userAction?.serviceYear?.selectedValue,
            losMonths: params?.userAction?.serviceMonth?.selectedValue,
            officArea: params?.userAction?.officePrefix?.displayValue,
            officNo: params?.userAction?.officeContact?.selectedValue,
            officCity: params?.userAction?.officeCity?.displayValue,
            pageNo: "NC02",
            stpRefNo: params?.serverData?.stpRefNo,
            etb: params?.postLogin ? params?.postLogin : params?.flow === "ETBWOM2U",
        };
    }

    async function updateEmpDetailsApi() {
        const obj = getParamData();
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, ...obj.displayData };
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        const url = params?.postLogin
            ? `loan/v1/cardStp/insertNC02`
            : `loan/ntb/v1/cardStp/insertNC02`;
        try {
            const httpResp = await cardsUpdate(param, url);
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc } = result;
            if (statusCode === "0000") {
                navigation.navigate("CardsCollection", {
                    ...params,
                    populateObj: { ...params?.populateObj, ...obj.prepopulateData },
                    userAction: { ...userAction, dataObj: param["nc02data"] },
                });
            } else {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    async function handleProceedButton() {
        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;

            updateEmpDetailsApi();
            /*const obj = getParamData();
            const params = route?.params ?? {};
            console.log(obj);
            navigation.navigate("CardsCollection", {
                ...params,
                userAction: { ...params?.userAction, ...obj },
            });*/
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_EMPLOYMENTDETAILS2
        : FA_APPLY_CREDITCARD_ETB_EMPLOYMENTDETAILS2;

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 5 of 6"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS == "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.view}>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={16}
                                        text="Credit Card Application"
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="bold"
                                        lineHeight={17}
                                        text="Please fill in your employment details"
                                        textAlign="left"
                                    />
                                </View>
                                <SpaceFiller height={25} />
                                <View style={styles.info}>
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Office address line 1"
                                            textAlign="left"
                                        />
                                        <TouchableOpacity onPress={handleInfoPress}>
                                            <Image
                                                style={styles.infoIcon}
                                                source={assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address1OffValid}
                                        errorMessage={state.address1OffErrorMsg}
                                        value={state.address1OffMask}
                                        placeholder="e.g. Unit no/Floor/Building"
                                        onChangeText={onAddress1OffChange}
                                        onFocus={onAddress1Focus}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Office address line 2"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address2OffValid}
                                        errorMessage={state.address2OffErrorMsg}
                                        value={state.address2OffMask}
                                        placeholder="e.g. Street name"
                                        onChangeText={onAddress2OffChange}
                                        onFocus={onAddress2Focus}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Office address line 3"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address3OffValid}
                                        errorMessage={state.address3OffErrorMsg}
                                        value={state.address3OffMask}
                                        placeholder="e.g. Neighbourhood name"
                                        onChangeText={onAddress3OffChange}
                                        onFocus={onAddress3Focus}
                                        numberOfLines={2}
                                    />
                                </View>

                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Postcode"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onPostcodeOffChange}
                                        placeholder="e.g. 52200"
                                        keyboardType="number-pad"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.postcodeOffValid}
                                        errorMessage={state.postcodeOffErrorMsg}
                                        value={state.postcodeOffMask}
                                        onFocus={onPostcodeFocus}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="City"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onCityOffChange}
                                        placeholder="e.g. Kuala Lumpur"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.cityOffValid}
                                        errorMessage={state.cityOffErrorMsg}
                                        value={state.cityOffMask}
                                        onFocus={onCityFocus}
                                        maxLength={20}
                                    />
                                </View>

                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.stateOff}
                                    isValid={state.stateOffValid}
                                    errorMessage={state.stateOffErrorMsg}
                                    onPress={onStateOffTap}
                                    style={styles.info}
                                />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Office phone number"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />

                                    <View style={styles.rowPhone}>
                                        <LabeledDropdown
                                            label=""
                                            dropdownValue={state.phonePrefix}
                                            isValid={state.phonePrefixValid}
                                            errorMessage={state.phonePrefixErrorMsg}
                                            onPress={onPhonePrefixTap}
                                            style={styles.dropDownRow}
                                        />
                                        <View style={styles.textRow}>
                                            <TextInput
                                                autoCorrect={false}
                                                onChangeText={onContactOffChange}
                                                placeholder="e.g. 33456789"
                                                keyboardType="number-pad"
                                                enablesReturnKeyAutomatically
                                                returnKeyType="next"
                                                isValidate
                                                isValid={state.contactOffValid}
                                                errorMessage={state.contactOffErrorMsg}
                                                value={state.contactOff}
                                                maxLength={20}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    disabled={state.isContinueDisabled}
                                    borderRadius={25}
                                    onPress={handleProceedButton}
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Save and Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={state.isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </View>
                </ScreenLayout>
                {state.stateOffData && (
                    <ScrollPickerView
                        showMenu={state.stateOffPicker}
                        list={state.stateOffData}
                        selectedIndex={state.stateOffValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                {state.phonePrefixData && (
                    <ScrollPickerView
                        showMenu={state.phonePrefixPicker}
                        list={state.phonePrefixData}
                        selectedIndex={state.phonePrefixValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}

                <Popup
                    visible={state.showInfo}
                    title={state.infoTitle}
                    description={state.infoDescription}
                    onClose={onPopupClose}
                />
            </>
        </ScreenContainer>
    );
}

CardsOfficeAddress.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 24,
        width: "100%",
    },
    dropDownRow: {
        marginTop: -10,
        paddingBottom: 0,
        width: "33%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },
    infoView: {
        alignItems: "center",
        flexDirection: "row",
    },
    rowPhone: {
        alignItems: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    subheader: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 6,
    },
    textRow: {
        width: "60%",
    },
    view: {
        paddingHorizontal: 12,
    },
});

export default CardsOfficeAddress;

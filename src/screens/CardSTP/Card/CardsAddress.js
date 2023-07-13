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
    FA_APPLY_CREDITCARD_PERSONALDETAILS3,
    FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS3,
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
    stat: PLEASE_SELECT,
    statValue: null,
    statObj: {},
    statValid: true,
    statErrorMsg: "",
    statData: [],
    statValueIndex: 0,
    statPicker: false,

    // Residential Status related
    residential: PLEASE_SELECT,
    residentialValue: null,
    residentialObj: {},
    residentialValid: true,
    residentialErrorMsg: "",
    residentialData: [],
    residentialValueIndex: 0,
    residentialPicker: false,

    // Home address line 1
    address1: "",
    address1Valid: true,
    address1ErrorMsg: "",
    address1Focus: false,
    address1Mask: "",

    // Home address line 2
    address2: "",
    address2Valid: true,
    address2ErrorMsg: "",
    address2Focus: false,
    address2Mask: "",

    // Home address line 3
    address3: "",
    address3Valid: true,
    address3ErrorMsg: "",
    address3Focus: false,
    address3Mask: "",

    // Postcode related
    postcode: "",
    postcodeValid: true,
    postcodeErrorMsg: "",
    postcodeFocus: false,
    postcodeMask: "",

    // City related
    city: "",
    cityValid: true,
    cityErrorMsg: "",
    cityFocus: false,
    cityMask: "",

    /*// Emergency contact person
    emContact: "",
    emContactValid: true,
    emContactErrorMsg: "",

    // Contact number
    contactNum: "",
    contactNumValid: true,
    contactNumErrorMsg: "",*/

    //Info Popup
    showInfo: false,
    infoTitle: "ID number",
    infoDescription: "You may select the Principal Card with a maximum of 5 cards per application",

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
                statData: stateFilter ?? state.statData,
                residentialData:
                    payload?.serverData?.masterData?.residentalstatus ?? state.residentialData,
            };
        }
        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                statPicker: false,
                residentialPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                statPicker: payload === "stat",
                residentialPicker: payload === "residential",
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? state?.infoTitle,
                infoDescription: payload?.desc ?? state?.infoDescription,
            };
        case "statDone":
            return {
                ...state,
                stat: payload?.stat,
                statValue: payload?.statValue,
                statObj: payload?.statObj,
                statValueIndex: payload?.statValueIndex,
            };
        case "residentialDone":
            return {
                ...state,
                residential: payload?.residential,
                residentialValue: payload?.residentialValue,
                residentialObj: payload?.residentialObj,
                residentialValueIndex: payload?.residentialValueIndex,
            };
        case "address1":
            return {
                ...state,
                address1: payload.address1,
                address1Focus: payload.address1Focus,
                address1Mask: payload.address1Mask,
            };
        case "address2":
            return {
                ...state,
                address2: payload.address2,
                address2Focus: payload.address2Focus,
                address2Mask: payload.address2Mask,
            };
        case "address3":
            return {
                ...state,
                address3: payload.address3,
                address3Focus: payload.address3Focus,
                address3Mask: payload.address3Mask,
            };
        case "postcode":
            return {
                ...state,
                postcode: payload.postcode,
                postcodeFocus: payload.postcodeFocus,
                postcodeMask: payload.postcodeMask,
            };
        case "city":
            return {
                ...state,
                city: payload.city,
                cityFocus: payload.cityFocus,
                cityMask: payload.cityMask,
            };
        /*case "emContact":
            return {
                ...state,
                emContact: payload,
            };
        case "contactNum":
            return {
                ...state,
                contactNum: payload,
            };*/
        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                address1Valid: payload?.address1Valid ?? true,
                address1ErrorMsg: payload?.address1ErrorMsg ?? "",
                address2Valid: payload?.address2Valid ?? true,
                address2ErrorMsg: payload?.address2ErrorMsg ?? "",
                address3Valid: payload?.address3Valid ?? true,
                address3ErrorMsg: payload?.address3ErrorMsg ?? "",
                postcodeValid: payload?.postcodeValid ?? true,
                postcodeErrorMsg: payload?.postcodeErrorMsg ?? "",
                cityValid: payload?.cityValid ?? true,
                cityErrorMsg: payload?.cityErrorMsg ?? "",
                /*emContactValid: payload?.emContactValid ?? true,
                emContactErrorMsg: payload?.emContactErrorMsg ?? "",
                contactNumValid: payload?.contactNumValid ?? true,
                contactNumErrorMsg: payload?.contactNumErrorMsg ?? "",*/
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        default:
            return { ...state };
    }
}

function CardsAddress({ navigation, route }) {
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
            masterData: { residentalstatus },
        } = params?.serverData;
        const {
            homeAddress1,
            homeAddress2,
            homeAddress3,
            postcode,
            city,
            stateValue,
            residential,
        } = params?.populateObj;

        //Home Address1
        if (homeAddress1) {
            const addrSubStr = homeAddress1.substring(0, 30);
            const maskedAddress1 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address1",
                payload: {
                    address1: homeAddress1,
                    address1Focus: false,
                    address1Mask: maskedAddress1,
                },
            });
        }

        //Home Address2
        if (homeAddress2) {
            const addrSubStr = homeAddress2.substring(0, 30);
            const maskedAddress2 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address2",
                payload: {
                    address2: homeAddress2,
                    address2Focus: false,
                    address2Mask: maskedAddress2,
                },
            });
        }

        //Home Address3
        if (homeAddress3) {
            const addrSubStr = homeAddress3.substring(0, 30);
            const maskedAddress3 = maskAddress(addrSubStr);
            dispatch({
                actionType: "address3",
                payload: {
                    address3: homeAddress3,
                    address3Focus: false,
                    address3Mask: maskedAddress3,
                },
            });
        }
        //Postcode
        if (postcode) {
            dispatch({
                actionType: "postcode",
                payload: {
                    postcode: postcode,
                    postcodeFocus: false,
                    postcodeMask: maskPostCode(postcode),
                },
            });
        }

        //City
        if (city) {
            dispatch({
                actionType: "city",
                payload: {
                    city: city,
                    cityFocus: false,
                    cityMask: maskAddress(city),
                },
            });
        }

        //State
        if (stateValue && statesList) {
            const st = statesList.find((item) => item.value === stateValue);
            st &&
                dispatch({
                    actionType: "statDone",
                    payload: { stat: st?.name, statValue: st?.value, statObj: st },
                });
        }
        // residential
        if (residential && residentalstatus) {
            const res = residentalstatus.find((item) => item.value === residential);
            res &&
                dispatch({
                    actionType: "residentialDone",
                    payload: {
                        residential: res?.name,
                        residentialValue: res?.value,
                        residentialObj: res,
                    },
                });
        }
    }, [route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.stat === PLEASE_SELECT ||
                state.residential === PLEASE_SELECT ||
                state.address1 === "" ||
                state.address2 === "" ||
                //state.address3 === "" ||
                state.postcode === "" ||
                state.city === "",
            //emContact === "" ||
            //contactNum === "",
        });
    }, [
        state.stat,
        state.residential,
        state.address1,
        state.address2,
        state.address3,
        state.postcode,
        state.city,
        /*state.emContact,
        state.contactNum,*/
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
        const popupTitle = "Home address line";
        const popupDesc = "P.O. Box is not allowed.";
        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title: popupTitle, desc: popupDesc },
        });
    }

    function onStatTap() {
        dispatch({
            actionType: "showPicker",
            payload: "stat",
        });
    }

    function onResidentialTap() {
        dispatch({
            actionType: "showPicker",
            payload: "residential",
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
            case "stat":
                dispatch({
                    actionType: "statDone",
                    payload: {
                        stat: item?.name ?? PLEASE_SELECT,
                        statValue: item?.value ?? null,
                        statObj: item,
                        statValueIndex: index,
                    },
                });
                break;
            case "residential":
                dispatch({
                    actionType: "residentialDone",
                    payload: {
                        residential: item?.name ?? PLEASE_SELECT,
                        residentialValue: item?.value ?? null,
                        residentialObj: item,
                        residentialValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onAddress1Change(value) {
        return dispatch({
            actionType: "address1",
            payload: { address1: value, address1Focus: true, address1Mask: value },
        });
    }
    function onAddress2Change(value) {
        return dispatch({
            actionType: "address2",
            payload: { address2: value, address2Focus: true, address2Mask: value },
        });
    }
    function onAddress3Change(value) {
        return dispatch({
            actionType: "address3",
            payload: { address3: value, address3Focus: true, address3Mask: value },
        });
    }

    function onPostcodeChange(value) {
        return dispatch({
            actionType: "postcode",
            payload: { postcode: value, postcodeFocus: true, postcodeMask: value },
        });
    }

    function onCityChange(value) {
        return dispatch({
            actionType: "city",
            payload: { city: value, cityFocus: true, cityMask: value },
        });
    }

    function onAddress1Focus() {
        if (!state.address1Focus) {
            return dispatch({
                actionType: "address1",
                payload: { address1: "", address1Focus: true, address1Mask: "" },
            });
        }
    }

    function onAddress2Focus() {
        if (!state.address2Focus) {
            return dispatch({
                actionType: "address2",
                payload: { address2: "", address2Focus: true, address2Mask: "" },
            });
        }
    }

    function onAddress3Focus() {
        if (!state.address3Focus) {
            return dispatch({
                actionType: "address3",
                payload: { address3: "", address3Focus: true, address3Mask: "" },
            });
        }
    }

    function onCityFocus() {
        if (!state.cityFocus) {
            return dispatch({
                actionType: "city",
                payload: { city: "", cityFocus: true, cityMask: "" },
            });
        }
    }

    function onPostcodeFocus() {
        if (!state.postcodeFocus) {
            return dispatch({
                actionType: "postcode",
                payload: { postcode: "", postcodeFocus: true, postcodeMask: "" },
            });
        }
    }

    /*function onContactNumChange(value) {
        return dispatch({ actionType: "contactNum", payload: value });
    }

    function onEmContactChange(value) {
        return dispatch({ actionType: "emContact", payload: value });
    }*/

    const validateAddess1 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address1)) {
            return {
                address1Valid: false,
                address1ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space checks
        if (!leadingOrDoubleSpaceRegex(state.address1)) {
            return {
                address1Valid: false,
                address1ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 1.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address1.toUpperCase()) > -1) {
            return {
                address1Valid: false,
                address1ErrorMsg: "Please enter valid Mailing Address 1.",
            };
        }

        // Return true if no validation error
        return {
            address1Valid: true,
            address1ErrorMsg: "",
        };
    }, [state.address1, state.addressBlock]);

    const validateAddess2 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address2)) {
            return {
                address2Valid: false,
                address2ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.address2)) {
            return {
                address2Valid: false,
                address2ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 2.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address2.toUpperCase()) > -1) {
            return {
                address2Valid: false,
                address2ErrorMsg: "Please enter valid Mailing Address 2.",
            };
        }

        // Return true if no validation error
        return {
            address2Valid: true,
            address2ErrorMsg: "",
        };
    }, [state.address2, state.addressBlock]);

    const validateAddess3 = useCallback(() => {
        // No special characters check
        if (state.address3 !== "" && !addressCharRegexCC(state.address3)) {
            return {
                address3Valid: false,
                address3ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space check
        if (state.address3 !== "" && !leadingOrDoubleSpaceRegex(state.address3)) {
            return {
                address3Valid: false,
                address3ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 3.",
            };
        }

        //  special word checks
        if (
            state.address3 !== "" &&
            state.addressBlock.indexOf(state.address3.toUpperCase()) > -1
        ) {
            return {
                address3Valid: false,
                address3ErrorMsg: "Please enter valid Mailing Address 3.",
            };
        }

        // Return true if no validation error
        return {
            address3Valid: true,
            address3ErrorMsg: "",
        };
    }, [state.address3, state.addressBlock]);

    const validatePostcode = useCallback(() => {
        // Min length check
        if (state.postcode.length !== 5) {
            return {
                postcodeValid: false,
                postcodeErrorMsg: "Sorry, your Postcode must consists of 5 digits only",
            };
        }
        // No special characters check
        if (!maeOnlyNumberRegex(state.postcode)) {
            return {
                postcodeValid: false,
                postcodeErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Postcode.",
            };
        }

        // Return true if no validation error
        return {
            postcodeValid: true,
            postcodeErrorMsg: "",
        };
    }, [state.postcode]);

    const validateCity = useCallback(() => {
        // No special characters check
        if (!cityCharRegex(state.city)) {
            return {
                cityValid: false,
                cityErrorMsg: "City must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            cityValid: true,
            cityErrorMsg: "",
        };
    }, [state.city]);

    /*const validateEmContact = useCallback(() => {
        // Min length check
        if (state.emContact.length < 5) {
            return {
                emContactValid: false,
                emContactErrorMsg:
                    "Sorry, the length for your Emergency Contact Person must be more than 5 characters.",
            };
        }
        // Only alphanumeric check
        if (!nameRegex(state.emContact)) {
            return {
                emContactValid: false,
                emContactErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Emergency Contact Person.",
            };
        }

        // Return true if no validation error
        return {
            emContactValid: true,
            emContactErrorMsg: "",
        };
    }, [state.emContact]);

    const validateContactNum = useCallback(() => {
        // Only alphanumeric check
        if (!maeOnlyNumberRegex(state.contactNum)) {
            return {
                contactNumValid: false,
                contactNumErrorMsg:
                    "Sorry, your Emergency Contact Number must consists of numeric only.",
            };
        }

        // Return true if no validation error
        return {
            contactNumValid: true,
            contactNumErrorMsg: "",
        };
    }, [state.contactNum]);*/

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { address1Valid, address1ErrorMsg } = validateAddess1();
        const { address2Valid, address2ErrorMsg } = validateAddess2();
        const { address3Valid, address3ErrorMsg } = validateAddess3();
        const { postcodeValid, postcodeErrorMsg } = validatePostcode();
        const { cityValid, cityErrorMsg } = validateCity();
        /*const { emContactValid, emContactErrorMsg } = validateEmContact();
        const { contactNumValid, contactNumErrorMsg } = validateContactNum();*/

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                address1Valid,
                address1ErrorMsg,
                address2Valid,
                address2ErrorMsg,
                address3Valid,
                address3ErrorMsg,
                postcodeValid,
                postcodeErrorMsg,
                cityValid,
                cityErrorMsg,
                /*emContactValid,
                emContactErrorMsg,
                contactNumValid,
                contactNumErrorMsg,*/
            },
        });
        return (
            address1Valid && address2Valid && address3Valid && postcodeValid && cityValid
            //emContactValid &&
            //contactNumValid
        );
    }

    function getParamData() {
        const {
            address1,
            address2,
            address3,
            postcode,
            city,
            stat,
            statValue,
            statObj,
            residential,
            residentialValue,
            residentialObj,
        } = state;

        return {
            prepopulateData: {
                homeAddress1: address1 ?? "",
                homeAddress2: address2 ?? "",
                homeAddress3: address3 ?? "",
                postcode: postcode ?? "",
                city: city ?? "",
                stateValue: statValue ?? "",
                residential: residentialValue ?? "",
            },
            displayData: {
                homeAddress1: {
                    displayKey: "House address line 1",
                    displayValue: address1,
                },
                homeAddress2: {
                    displayKey: "House address line 2",
                    displayValue: address2,
                },
                homeAddress3: {
                    displayKey: "House address line 3",
                    displayValue: address3,
                },
                postcode: {
                    displayKey: "Postcode",
                    displayValue: postcode,
                },
                city: {
                    displayKey: "City",
                    displayValue: city,
                },
                homeAddress1Mask: {
                    displayKey: "House address line 1",
                    displayValue: maskAddress(address1),
                },
                homeAddress2Mask: {
                    displayKey: "House address line 2",
                    displayValue: maskAddress(address2),
                },
                homeAddress3Mask: {
                    displayKey: "House address line 3",
                    displayValue: maskAddress(address3),
                },
                postcodeMask: {
                    displayKey: "Postcode",
                    displayValue: maskPostCode(postcode),
                },
                cityMask: {
                    displayKey: "City",
                    displayValue: maskAddress(city),
                },
                state: {
                    displayKey: "State",
                    displayValue: stat,
                    selectedValue: statValue,
                    selectedDisplay: stat,
                    selectedObj: statObj,
                },
                residential: {
                    displayKey: "Residential status",
                    displayValue: residential,
                    selectedValue: residentialValue,
                    selectedDisplay: residential,
                    selectedObj: residentialObj,
                },
            },
        };
    }

    function getServerParams(params) {
        return {
            basicInfo: {
                title: params?.userAction?.title?.selectedValue,
                dob: params?.userAction?.dob?.selectedValue,
                idtype: params?.userAction?.idType?.selectedValue,
                idtypeDisp: params?.userAction?.idType?.selectedDisplay,
                idno: params?.userAction?.idNumber?.displayValue,
                name: params?.userAction?.name?.displayValue,
                educationDisp: params?.userAction?.education?.selectedDisplay,
                education: params?.userAction?.education?.selectedValue,
                monthlyIncome: params?.userAction?.salaryRange,
                organization: params?.userAction?.cardDispOrganization,
                netIncome: "",
                grossIncome: "",
                pageNo: "1",
            },
            updatedbasicInfo: {
                nameOnCard: params?.userAction?.nameOfCard?.displayValue, //trinity enhancement, no need to send in this api
                email: params?.userAction?.email?.displayValue,
                mbext: params?.userAction?.mobilePrefix?.selectedValue,
                mbno: params?.userAction?.mobileNumber?.selectedValue,
                houseArea: params?.userAction?.homePrefix?.selectedValue,
                houseNumber: params?.userAction?.houseNumber?.selectedValue,
                gender: params?.userAction?.gender?.selectedValue,
                genderDisplay: params?.userAction?.gender?.displayValue,
                stpCustType: params?.custInfo?.stpCustType,
                mrgstatusCode: params?.userAction?.marital?.selectedValue,
                mrgstatusDesc: params?.userAction?.marital?.selectedDisplay,
                raceCode: params?.userAction?.race?.selectedValue,
                raceDesc: params?.userAction?.race?.selectedDisplay,
                nationalityCode: "MY",
                nationalityDesc: params?.userAction?.nationality?.displayValue,
                page: "NC01",
                pepDesc:
                    params?.userAction?.pep?.selectedDisplay !== PLEASE_SELECT
                        ? params?.userAction?.pep?.selectedDisplay
                        : "",
                pepCode: params?.userAction?.pep?.selectedValue ?? "",
            },
            preapprovedsource: "",
            pageNo: "NC01",
            postCode: params?.userAction?.postcode?.displayValue,
            stateCode: params?.userAction?.state?.selectedValue,
            stateDesc: params?.userAction?.state?.selectedDisplay,
            resStatusDesc: params?.userAction?.residential?.selectedDisplay,
            resStatusCode: params?.userAction?.residential?.selectedValue,
            add3: params?.userAction?.homeAddress3?.displayValue,
            add2: params?.userAction?.homeAddress2?.displayValue,
            add1: params?.userAction?.homeAddress1?.displayValue,
            city: params?.userAction?.city?.displayValue,
            stpRefNo: params?.serverData?.stpRefNo,
            selectedCardArray: params?.userAction?.selectedCard,
            updateincome: false,
            etb: params?.postLogin ? params?.postLogin : params?.flow === "ETBWOM2U",
        };
    }

    async function updatePersonalDetailsApi() {
        const obj = getParamData();
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, ...obj.displayData };
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        const url = params?.postLogin
            ? "loan/v1/cardStp/insertNC01"
            : "loan/ntb/v1/cardStp/insertNC01";
        try {
            const httpResp = await cardsUpdate(param, url);
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc } = result;
            if (statusCode === "0000") {
                navigation.navigate("CardsEmployer", {
                    ...params,
                    populateObj: { ...params?.populateObj, ...obj.prepopulateData },
                    userAction: { ...userAction },
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

            /*const obj = getParamData();
            const params = route?.params ?? {};
            navigation.navigate("CardsEmployer", {
                ...params,
                userAction: { ...params?.userAction, ...obj },
            });*/

            updatePersonalDetailsApi();
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_PERSONALDETAILS3
        : FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS3;

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
                                    text="Step 3 of 6"
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
                                        text="Please fill in your details"
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
                                            text="Home address line 1"
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
                                        isValid={state.address1Valid}
                                        errorMessage={state.address1ErrorMsg}
                                        value={state.address1Mask}
                                        placeholder="e.g. Unit no/Floor/Building"
                                        onChangeText={onAddress1Change}
                                        onFocus={onAddress1Focus}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Home address line 2"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address2Valid}
                                        errorMessage={state.address2ErrorMsg}
                                        value={state.address2Mask}
                                        placeholder="e.g. Street name"
                                        onChangeText={onAddress2Change}
                                        onFocus={onAddress2Focus}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Home address line 3"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address3Valid}
                                        errorMessage={state.address3ErrorMsg}
                                        value={state.address3Mask}
                                        placeholder="e.g. Neighbourhood name"
                                        onChangeText={onAddress3Change}
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
                                        onChangeText={onPostcodeChange}
                                        placeholder="e.g. 52200"
                                        keyboardType="number-pad"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.postcodeValid}
                                        errorMessage={state.postcodeErrorMsg}
                                        value={state.postcodeMask}
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
                                        onChangeText={onCityChange}
                                        placeholder="e.g. Kuala Lumpur"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.cityValid}
                                        errorMessage={state.cityErrorMsg}
                                        value={state.cityMask}
                                        onFocus={onCityFocus}
                                        maxLength={20}
                                    />
                                </View>

                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.stat}
                                    isValid={state.statValid}
                                    errorMessage={state.statErrorMsg}
                                    onPress={onStatTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Residential status"
                                    dropdownValue={state.residential}
                                    isValid={state.residentialValid}
                                    errorMessage={state.residentialErrorMsg}
                                    onPress={onResidentialTap}
                                    style={styles.info}
                                />

                                {/* needs to confirm with business because RMBP didnot had this 
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Emergency contact person"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onEmContactChange}
                                        placeholder="e.g. Nur Nadia"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.emContactValid}
                                        errorMessage={state.emContactErrorMsg}
                                        value={state.emContact}
                                        maxLength={20}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Contact number"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onContactNumChange}
                                        placeholder="e.g. +6012 3456 789"
                                        keyboardType="number-pad"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.contactNumValid}
                                        errorMessage={state.contactNumErrorMsg}
                                        value={state.contactNum}
                                        maxLength={20}
                                    />
                </View>*/}
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
                {state.statData && (
                    <ScrollPickerView
                        showMenu={state.statPicker}
                        list={state.statData}
                        selectedIndex={state.statValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.residentialData && (
                    <ScrollPickerView
                        showMenu={state.residentialPicker}
                        list={state.residentialData}
                        selectedIndex={state.residentialValueIndex}
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

CardsAddress.propTypes = {
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
    subheader: {
        alignItems: "center",
        flexDirection: "row",
        paddingBottom: 6,
    },
    view: {
        paddingHorizontal: 12,
    },
});

export default CardsAddress;

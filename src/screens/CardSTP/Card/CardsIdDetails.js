/* eslint-disable react/jsx-no-bind */
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { maskEmail, maskMobile } from "@screens/PLSTP/PLSTPController";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import DatePicker from "@components/Pickers/DatePicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { customerInquiry } from "@services";

import {
    FADE_GREY,
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    GREY,
    PLACEHOLDER_TEXT,
} from "@constants/colors";
import { getDateRangeDefaultData } from "@constants/datePickerDefaultData";
import { CARDS_ID_DOB } from "@constants/dateScenarios";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    FA_APPLY_CREDITCARD_PERSONALDETAILS1,
    FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS1,
} from "@constants/strings";

import {
    maeNameRegex,
    onlyNumber,
    getAge,
    validateEmail,
    maeOnlyNumberRegex,
    leadingOrDoubleSpaceRegex,
} from "@utils/dataModel";
import { getDateRange, getDefaultDate, getEndDate, getStartDate } from "@utils/dateRange";

import assets from "@assets";

const initialState = {
    // CC Type related
    title: PLEASE_SELECT,
    titleValue: null,
    titleObj: {},
    titleValid: true,
    titleErrorMsg: "",
    titleData: [],
    titleValueIndex: 0,
    titlePicker: false,

    // CC Type Id related
    cidType: "New IC",
    cidTypeValue: "01",
    cidTypeObj: {},
    cidTypeValid: true,
    cidTypeErrorMsg: "",
    cidTypeData: [],
    cidTypeValueIndex: 0,
    cidTypePicker: false,

    // CC Type Id related
    eduType: PLEASE_SELECT,
    eduTypeValue: null,
    eduTypeObj: {},
    eduTypeValid: true,
    eduTypeErrorMsg: "",
    eduTypeData: [],
    eduTypeValueIndex: 0,
    eduTypePicker: false,

    // Id Number related
    name: "",
    nameValid: true,
    nameErrorMsg: "",

    // DOB related
    dOB: "e.g. 02/01/1991",
    dOBValid: true,
    datePicker: false,
    datePickerDate: new Date(new Date().getFullYear() - 21 + "-" + "01-01"),

    // Id Number related
    idNum: "",
    idNumValid: true,
    idNumErrorMsg: "",

    // Email related
    email: "",
    emailValid: true,
    emailErrorMsg: "",
    emailFocus: false,
    emailMask: "",

    // Mob Number related
    mobNum: "",
    mobNumValid: true,
    mobNumErrorMsg: "",
    mobNumFocus: false,
    mobNumMask: "",

    // Mobile Prefix related
    mobPrefix: "Select",
    mobPrefixValue: null,
    mobPrefixObj: {},
    mobPrefixValid: true,
    mobPrefixErrorMsg: "",
    mobPrefixData: [],
    mobPrefixValueIndex: 0,
    mobPrefixPicker: false,

    //Info Popup
    showInfo: false,
    infoTitle: "ID number",
    infoDescription: "You may select the Principal Card with a maximum of 5 cards per application",
    // Others
    isContinueDisabled: false,
    isPostLogin: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns":
            return {
                ...state,
                titleData: payload?.serverData?.masterData?.titles ?? state.titleData,
                cidTypeData: payload?.serverData?.masterData?.icTypes ?? state.cidTypeData,
                eduTypeData: payload?.serverData?.masterData?.education ?? state.eduTypeData,
                mobPrefixData: payload?.serverData?.masterData?.mobileext ?? state.mobPrefixData,
            };
        case "disableFields":
            return {
                ...state,
                isPostLogin: payload,
            };
        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                titlePicker: false,
                cidTypePicker: false,
                eduTypePicker: false,
                mobPrefixPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                titlePicker: payload === "title",
                //cidTypePicker: payload === "cidType",
                eduTypePicker: payload === "eduType",
                mobPrefixPicker: payload === "mobPrefix",
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? state?.infoTitle,
                infoDescription: payload?.desc ?? state?.infoDescription,
            };
        case "titleDone":
            return {
                ...state,
                title: payload?.title,
                titleValue: payload?.titleValue,
                titleObj: payload?.titleObj,
                titleValueIndex: payload?.titleValueIndex,
            };
        case "cidTypeDone":
            return {
                ...state,
                cidType: payload?.cidType,
                cidTypeValue: payload?.cidTypeValue,
                cidTypeObj: payload?.cidTypeObj,
                cidTypeValueIndex: payload?.cidTypeValueIndex,
            };
        case "eduTypeDone":
            return {
                ...state,
                eduType: payload?.eduType,
                eduTypeValue: payload?.eduTypeValue,
                eduTypeObj: payload?.eduTypeObj,
                eduTypeValueIndex: payload?.eduTypeValueIndex,
            };
        case "mobPrefixDone":
            return {
                ...state,
                mobPrefix: payload?.mobPrefix,
                mobPrefixValue: payload?.mobPrefixValue,
                mobPrefixObj: payload?.mobPrefixObj,
                mobPrefixValueIndex: payload?.mobPrefixValueIndex,
            };
        case "name":
            return {
                ...state,
                name: payload,
            };
        case "idNum":
            return {
                ...state,
                idNum: payload,
            };
        case "DOB":
            return {
                ...state,
                dOB: payload?.dOB,
                datePickerDate: payload?.datePickerDate,
            };
        case "email":
            return {
                ...state,
                email: payload.email,
                emailFocus: payload.emailFocus,
                emailMask: payload.emailMask,
            };
        case "mobNum":
            return {
                ...state,
                mobNum: payload.mobNum,
                mobNumFocus: payload.mobNumFocus,
                mobNumMask: payload.mobNumMask,
            };
        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                idNumValid: payload?.idNumValid ?? true,
                idNumErrorMsg: payload?.idNumErrorMsg ?? "",
                nameValid: payload?.nameValid ?? true,
                nameErrorMsg: payload?.nameErrorMsg ?? "",
                dOBValid: payload?.dOBValid ?? "",
                emailValid: payload?.emailValid ?? true,
                emailErrorMsg: payload?.emailErrorMsg ?? "",
                mobNumValid: payload?.mobNumValid ?? true,
                mobNumErrorMsg: payload?.mobNumErrorMsg ?? "",
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

function CardsIdDetails({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [validDateRangeData, setValidDateRangeData] = useState(
        getDateRangeDefaultData(CARDS_ID_DOB)
    );
    const [defaultSelectedDate, setDefaultSelectedDate] = useState(
        getDefaultDate(validDateRangeData)
    );

    useEffect(() => {
        getDatePickerData();
        init();
    }, [init]);

    const getDatePickerData = () => {
        getDateRange(CARDS_ID_DOB).then((data) => {
            setValidDateRangeData(data);
        });
    };

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            console.log(params);

            //DropDown Values
            dispatch({
                actionType: "PopulateDropdowns",
                payload: params,
            });

            // PrePopulate Data
            populateData();

            //disable all fields
            params?.postLogin &&
                dispatch({
                    actionType: "disableFields",
                    payload: true,
                });
        } catch (error) {
            console.log(error);
            //navigation.canGoBack() && navigation.goBack();
        }
    }, [route?.params, populateData]);

    // Used enable/disable "Continue"
    useEffect(() => {
        const isPostLogin = route?.params?.postLogin ?? false;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                (!isPostLogin && state.title === PLEASE_SELECT) ||
                (!isPostLogin && state.eduType === PLEASE_SELECT) ||
                (!isPostLogin && state.cidType === PLEASE_SELECT) ||
                state.mobPrefix === "Select" ||
                (!isPostLogin && state.name === "") ||
                (!isPostLogin && state.dOB === "") ||
                (!isPostLogin && state.idNum === "") ||
                state.email === "" ||
                state.mobNum === "",
        });
    }, [
        state.title,
        state.eduType,
        state.cidType,
        state.name,
        state.dOB,
        state.idNum,
        state.email,
        state.mobNum,
        state.mobPrefix,
        route?.params,
    ]);

    const populateData = useCallback(() => {
        const params = route?.params ?? {};
        console.log(params);
        const {
            masterData: { education, titles, icTypes, mobileext },
        } = params?.serverData;
        const {
            title,
            name,
            dob,
            idNumber,
            email,
            mobileNumber,
            mobilePrefix,
            idType,
            educationCode,
        } = params?.populateObj;
        const newMobilePrefix = mobilePrefix ? mobilePrefix : "010";

        //Title
        if (title) {
            const tle = titles.find((item) => item.name === title || item.value === title);
            tle &&
                dispatch({
                    actionType: "titleDone",
                    payload: { title: tle?.name, titleValue: tle?.value, titleObj: tle },
                });
        }

        //Name
        name && dispatch({ actionType: "name", payload: name });

        //DOB
        if (dob)
            dispatch({
                actionType: "DOB",
                payload: { dOB: dob, datePickerDate: new Date(dob) },
            });

        //ID Type
        if (idType) {
            const ic = icTypes.find((item) => item.name.toLowerCase() === idType.toLowerCase());
            ic &&
                dispatch({
                    actionType: "cidTypeDone",
                    payload: { cidType: ic?.name, cidTypeValue: ic?.value, cidTypeObj: ic },
                });
        }

        //ID Number
        idNumber && dispatch({ actionType: "idNum", payload: idNumber });

        //Email
        if (email) {
            const maskedEmail = maskEmail(email);
            dispatch({
                actionType: "email",
                payload: { email, emailFocus: false, emailMask: maskedEmail },
            });
        }

        //Mobile Number Prefix
        if (newMobilePrefix) {
            const me = mobileext.find((item) => item.value === newMobilePrefix);
            me &&
                dispatch({
                    actionType: "mobPrefixDone",
                    payload: { mobPrefix: me?.name, mobPrefixValue: me?.value, mobPrefixObj: me },
                });
        }

        //Mobile Number
        if (mobileNumber) {
            const maskedMobile = maskMobile(mobileNumber);
            dispatch({
                actionType: "mobNum",
                payload: { mobNum: mobileNumber, mobNumFocus: false, mobNumMask: maskedMobile },
            });
        }

        //Education
        if (educationCode) {
            const edu = education.find((item) => item.value === educationCode);
            edu &&
                dispatch({
                    actionType: "eduTypeDone",
                    payload: { eduType: edu?.name, eduTypeValue: edu?.value, eduTypeObj: edu },
                });
        }
    }, [route?.params]);

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

    function handleInfoPress(from) {
        const popupTitle = from === "name" ? "Name as per ID" : "ID Number";
        const popupDesc = from === "name" ? "Name as per ID" : "Example\nNew IC: 820931121123";

        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title: popupTitle, desc: popupDesc },
        });
    }

    function onTitleTap() {
        dispatch({
            actionType: "showPicker",
            payload: "title",
        });
    }

    function onCidTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cidType",
        });
    }

    function onEduTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "eduType",
        });
    }

    function onMobPrefixTap() {
        dispatch({
            actionType: "showPicker",
            payload: "mobPrefix",
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
            case "title":
                dispatch({
                    actionType: "titleDone",
                    payload: {
                        title: item?.name ?? PLEASE_SELECT,
                        titleValue: item?.value ?? null,
                        titleObj: item,
                        titleValueIndex: index,
                    },
                });
                break;
            case "cidType":
                dispatch({
                    actionType: "cidTypeDone",
                    payload: {
                        cidType: item?.name ?? PLEASE_SELECT,
                        cidTypeValue: item?.value ?? null,
                        cidTypeObj: item,
                        cidTypeValueIndex: index,
                    },
                });
                break;
            case "eduType":
                dispatch({
                    actionType: "eduTypeDone",
                    payload: {
                        eduType: item?.name ?? PLEASE_SELECT,
                        eduTypeValue: item?.value ?? null,
                        eduTypeObj: item,
                        eduTypeValueIndex: index,
                    },
                });
                break;
            case "mobPrefix":
                dispatch({
                    actionType: "mobPrefixDone",
                    payload: {
                        mobPrefix: item?.name ?? PLEASE_SELECT,
                        mobPrefixValue: item?.value ?? null,
                        mobPrefixObj: item,
                        mobPrefixValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onNameChange(value) {
        return dispatch({ actionType: "name", payload: value });
    }

    function onIdNumChange(value) {
        return dispatch({ actionType: "idNum", payload: value });
    }

    function onEmailChange(value) {
        return dispatch({
            actionType: "email",
            payload: { email: value, emailFocus: true, emailMask: value },
        });
    }

    function onMobNumChange(value) {
        return dispatch({
            actionType: "mobNum",
            payload: { mobNum: value, mobNumFocus: true, mobNumMask: value },
        });
    }

    function onDOBChange() {
        Keyboard.dismiss();
        return dispatch({ actionType: "showDatePicker", payload: true });
    }

    function onDatePickerCancel() {
        return dispatch({ actionType: "showDatePicker", payload: false });
    }

    function onEmailFocus() {
        if (!state.emailFocus) {
            return dispatch({
                actionType: "email",
                payload: { email: "", emailFocus: true, emailMask: "" },
            });
        }
    }

    function onMobileFocus() {
        if (!state.mobNumFocus) {
            return dispatch({
                actionType: "mobNum",
                payload: { mobNum: "", mobNumFocus: true, mobNumMask: "" },
            });
        }
    }

    function onDatePickerDone(date) {
        // Form the date format to be shown on form
        const selectedDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const selectedMonth =
            date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        const selectedYear = date.getFullYear();
        const dateText = selectedDate + "/" + selectedMonth + "/" + selectedYear;
        setDefaultSelectedDate(date);

        dispatch({
            actionType: "DOB",
            payload: { dOB: dateText, datePickerDate: date },
        });
        onDatePickerCancel();
    }

    const validateName = useCallback(() => {
        // Min length check
        if (state.name.length < 5) {
            return {
                nameValid: false,
                nameErrorMsg:
                    "Sorry, the length for Name (As per ID) must be more than 5 characters.",
            };
        }

        // Only alphanumeric check
        if (!maeNameRegex(state.name)) {
            return {
                nameValid: false,
                nameErrorMsg: "Sorry, special characters are not allowed for Name (As per ID).",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.name)) {
            return {
                nameValid: false,
                nameErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Name (As per ID).",
            };
        }

        // Return true if no validation error
        return {
            nameValid: true,
            nameErrorMsg: "",
        };
    }, [state.name]);

    const validateIDNumber = useCallback(() => {
        // Min length check
        if (state.idNum.length !== 12) {
            return {
                idNumValid: false,
                idNumErrorMsg: "Sorry, your New IC must consist of 12 digits only.",
            };
        }
        // Only Number
        if (!onlyNumber(state.idNum)) {
            return {
                idNumValid: false,
                idNumErrorMsg: "Sorry, your ID No must be numeric only.",
            };
        }

        // Return true if no validation error
        return {
            idNumValid: true,
            idNumErrorMsg: "",
        };
    }, [state.idNum]);

    const validateDOB = useCallback(() => {
        const age = getAge(state.dOB, "DD/MM/YYYY");

        //Max age 65
        if (age > 65) {
            showErrorToast({
                message:
                    "We are sorry. The maximum age allowed for card application is 65 years and below.",
            });
            return { dOBValid: false };
        }

        //Min age 65
        if (age < 21) {
            showErrorToast({
                message:
                    "We are sorry. Application is only allowed for applicants 21 years old & above.",
            });
            return { dOBValid: false };
        }

        // Return true if no validation error
        return { dOBValid: true };
    }, [state.dOB]);

    const validateEml = useCallback(() => {
        // Only alphanumeric check
        if (!validateEmail(state.email)) {
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
    }, [state.email]);

    const validateMobNum = useCallback(() => {
        // Max length check
        if (state.mobNum.length > 10) {
            return {
                mobNumValid: false,
                mobNumErrorMsg:
                    "Sorry, the length for Mobile Number must not be more than 10 digits.",
            };
        }
        // Only alphanumeric check
        if (!maeOnlyNumberRegex(state.mobNum)) {
            return {
                mobNumValid: false,
                mobNumErrorMsg: "Sorry, your Mobile Number must consists of numeric only.",
            };
        }

        // Return true if no validation error
        return {
            mobNumValid: true,
            mobNumErrorMsg: "",
        };
    }, [state.mobNum]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { idNumValid, idNumErrorMsg } = validateIDNumber();
        const { nameValid, nameErrorMsg } = validateName();
        const { dOBValid } = validateDOB();
        const { emailValid, emailErrorMsg } = validateEml();
        const { mobNumValid, mobNumErrorMsg } = validateMobNum();

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                idNumValid,
                idNumErrorMsg,
                nameValid,
                nameErrorMsg,
                dOBValid,
                emailValid,
                emailErrorMsg,
                mobNumValid,
                mobNumErrorMsg,
            },
        });

        return idNumValid && nameValid && dOBValid && emailValid && mobNumValid;
    }

    function getParamData() {
        const {
            title,
            titleValue,
            titleObj,
            name,
            dOB,
            cidType,
            cidTypeValue,
            cidTypeObj,
            idNum,
            eduType,
            eduTypeValue,
            eduTypeObj,
            email,
            mobNum,
            mobPrefix,
            mobPrefixValue,
            mobPrefixObj,
        } = state;
        return {
            prepopulateData: {
                title: titleValue,
                idType: cidType,
                name,
                dob: dOB,
                idNumber: idNum,
                email,
                mobileNumber: mobNum,
                mobilePrefix: mobPrefix,
                educationCode: eduTypeValue,
            },
            displayData: {
                title: {
                    displayKey: "Title",
                    displayValue: title,
                    selectedValue: titleValue,
                    selectedDisplay: title,
                    selectedObj: titleObj,
                },
                name: {
                    displayKey: "Name as per ID",
                    displayValue: name,
                },
                dob: {
                    displayKey: "Date of birth",
                    displayValue: moment(dOB.replace(/[/]/g, ""), "DDMMYYYY").format("DD MMM YYYY"),
                    selectedValue: dOB.replace(/[/]/g, ""),
                },
                idNumber: {
                    displayKey: "ID number",
                    displayValue: idNum,
                },
                email: {
                    displayKey: "Email address",
                    displayValue: email,
                },
                emailMask: {
                    displayKey: "Email address",
                    displayValue: maskEmail(email),
                },
                mobileNumber: {
                    displayKey: "Mobile number",
                    displayValue: mobPrefix + mobNum,
                    selectedValue: mobNum,
                },
                mobileNumberMask: {
                    displayKey: "Mobile number",
                    displayValue: mobPrefix + maskMobile(mobNum),
                    selectedValue: mobNum,
                },
                mobilePrefix: {
                    displayKey: "Mobile Number Prefix",
                    displayValue: mobPrefix,
                    selectedValue: mobPrefixValue,
                    selectedDisplay: mobPrefix,
                    selectedObj: mobPrefixObj,
                },
                idType: {
                    displayKey: "ID type",
                    displayValue: cidType,
                    selectedValue: cidTypeValue,
                    selectedDisplay: cidType,
                    selectedObj: cidTypeObj,
                },
                education: {
                    displayKey: "Education level",
                    displayValue: eduType,
                    selectedValue: eduTypeValue,
                    selectedDisplay: eduType,
                    selectedObj: eduTypeObj,
                },
            },
        };
    }

    function getServerParams(params) {
        return {
            mbbTitle: params?.userAction?.title?.selectedValue,
            mobileNo: params?.userAction?.mobileNumber?.selectedValue,
            mobExt: params?.userAction?.mobilePrefix?.selectedValue,
            birthDate: params?.userAction?.dob?.selectedValue,
            mbbName: params?.userAction?.name?.displayValue,
            email: params?.userAction?.email?.displayValue,
            icNo: params?.userAction?.idNumber?.displayValue,
        };
    }

    async function customerInqApi() {
        const obj = getParamData();
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, ...obj.displayData };
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        try {
            const httpResp = await customerInquiry(param, "loan/ntb/v1/cardStp/stpCustInqInfo");
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc, custInd, m2uCustInd, staffInd, stpRefNo } = result;
            if (statusCode === "0000") {
                if (staffInd && staffInd !== "N") {
                    showInfoToast({
                        message:
                            "We are sorry this service is not applicable for Maybank employee.",
                    });
                    return;
                }
                const newServerData = { ...params?.serverData, stpRefNo: stpRefNo ?? "" };
                //stpRefNo && navigation.setParams({ serverData: { ...params?.serverData, stpRefNo } });
                if (custInd === "0" && m2uCustInd === "0") {
                    // ETB without M2U flow
                    proceedETBWithoutM2u(obj, newServerData);
                } else if (custInd === "0" && m2uCustInd === "1") {
                    // ETB with M2U flow
                    navigation.navigate("Onboarding", {
                        screen: "OnboardingM2uUsername",
                        params: {
                            screenName: "CardsLanding",
                        },
                    });
                    showInfoToast({
                        message:
                            "We notice you're an existing Maybank2u user. Please login to continue.'",
                    });
                } else {
                    //NTB flow
                    proceedPersonalDetails(obj, newServerData);
                }
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

    function proceedPersonalDetails(obj, newServerData) {
        const params = route?.params ?? {};
        navigation.navigate("CardsPersonalDetails", {
            ...params,
            serverData: newServerData ?? params?.serverData,
            userAction: { ...params?.userAction, ...obj.displayData },
            populateObj: { ...params?.populateObj, ...obj.prepopulateData },
        });
    }

    function proceedETBWithoutM2u(obj, newServerData) {
        const params = route?.params ?? {};
        console.log("---", obj.displayData);
        navigation.navigate("CardsOTPNumber", {
            ...params,
            userAction: { ...params?.userAction, ...obj.displayData },
            idNum: obj.displayData?.idNumber?.displayValue,
            populateObj: { ...obj.prepopulateData },
            flow: "ETBWOM2U",
            serverData: newServerData,
            mobileNum: obj.displayData?.mobileNumber?.displayValue,
        });
    }

    function handleProceedButton() {
        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;

            if (!route?.params?.postLogin) {
                customerInqApi();
            } else {
                const obj = getParamData();
                proceedPersonalDetails(obj);
            }

            /**/
        } catch (error) {
            console.log(error);
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_PERSONALDETAILS1
        : FA_APPLY_CREDITCARD_ETB_PERSONALDETAILS1;
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showOverlay={state.datePicker}
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
                                        text="Step 1 of 6"
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
                                    <LabeledDropdown
                                        label="Title"
                                        dropdownValue={state.title}
                                        disabled={
                                            state.title !== PLEASE_SELECT && state.isPostLogin
                                        }
                                        isValid={state.titleValid}
                                        errorMessage={state.titleErrorMsg}
                                        onPress={onTitleTap}
                                        style={styles.info}
                                    />
                                    <View style={styles.info}>
                                        <View style={styles.infoView}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={18}
                                                text="Name as per ID"
                                                textAlign="left"
                                            />
                                            {/*<TouchableOpacity
                                            // eslint-disable-next-line react/jsx-no-bind
                                            onPress={() => {
                                                handleInfoPress("name");
                                            }}
                                        >
                                            <Image
                                                style={styles.infoIcon}
                                                source={assets.icInformation}
                                            />
                                        </TouchableOpacity>*/}
                                        </View>
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            autoCorrect={false}
                                            onChangeText={onNameChange}
                                            placeholder="e.g. Danial Ariff"
                                            enablesReturnKeyAutomatically
                                            returnKeyType="next"
                                            editable={!state.isPostLogin}
                                            isValidate
                                            isValid={state.nameValid}
                                            errorMessage={state.nameErrorMsg}
                                            value={state.name}
                                            color={state.isPostLogin ? FADE_GREY : BLACK}
                                            maxLength={30}
                                        />
                                    </View>
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={14}
                                            text="Date of birth"
                                            textAlign="left"
                                        />
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            accessible={false}
                                            testID="inputView"
                                            accessibilityLabel="inputView"
                                            style={
                                                state.dOB == "e.g. 02/01/1991"
                                                    ? styles.inputContainer
                                                    : styles.inputContainerSelect
                                            }
                                            disabled={state.isPostLogin}
                                            onPress={onDOBChange}
                                        >
                                            <Typo
                                                fontSize={20}
                                                fontWeight="700"
                                                fontStyle="normal"
                                                lineHeight={20}
                                                textAlign="left"
                                                style={styles.dobView}
                                                text={state.dOB}
                                                //color={state.isPostLogin && styles.disableText}
                                                color={
                                                    state.dOB == "e.g. 02/01/1991"
                                                        ? PLACEHOLDER_TEXT
                                                        : state.isPostLogin
                                                        ? FADE_GREY
                                                        : BLACK
                                                }
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <LabeledDropdown
                                        label="ID type"
                                        disabled={state.isPostLogin}
                                        dropdownValue={state.cidType}
                                        isValid={state.cidTypeValid}
                                        errorMessage={state.cidTypeErrorMsg}
                                        onPress={onCidTypeTap}
                                        style={styles.info}
                                    />
                                    <View style={styles.info}>
                                        <View style={styles.infoView}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                lineHeight={18}
                                                text="ID number"
                                                textAlign="left"
                                            />
                                            <TouchableOpacity
                                                onPress={() => {
                                                    handleInfoPress("idNum");
                                                }}
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            autoCorrect={false}
                                            onChangeText={onIdNumChange}
                                            editable={!state.isPostLogin}
                                            placeholder="e.g. 910102 03 5678"
                                            keyboardType="number-pad"
                                            enablesReturnKeyAutomatically
                                            returnKeyType="next"
                                            isValidate
                                            isValid={state.idNumValid}
                                            errorMessage={state.idNumErrorMsg}
                                            color={state.isPostLogin ? FADE_GREY : BLACK}
                                            value={state.idNum}
                                            maxLength={12}
                                        />
                                    </View>
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Email address"
                                            textAlign="left"
                                        />
                                        <SpaceFiller height={4} />
                                        <TextInput
                                            autoCorrect={false}
                                            onChangeText={onEmailChange}
                                            placeholder="e.g. danial@gmail.com"
                                            enablesReturnKeyAutomatically
                                            returnKeyType="next"
                                            isValidate
                                            isValid={state.emailValid}
                                            errorMessage={state.emailErrorMsg}
                                            onFocus={onEmailFocus}
                                            value={state.emailMask}
                                            maxLength={40}
                                        />
                                    </View>
                                    <View style={styles.info}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Mobile number"
                                            textAlign="left"
                                        />

                                        <View style={styles.rowPhone}>
                                            <LabeledDropdown
                                                label=""
                                                dropdownValue={state.mobPrefix}
                                                isValid={state.mobPrefixValid}
                                                errorMessage={state.mobPrefixErrorMsg}
                                                onPress={onMobPrefixTap}
                                                style={styles.dropDownRow}
                                            />
                                            <View style={styles.textRow}>
                                                <TextInput
                                                    autoCorrect={false}
                                                    onChangeText={onMobNumChange}
                                                    placeholder="e.g. 213 8888"
                                                    keyboardType="number-pad"
                                                    enablesReturnKeyAutomatically
                                                    returnKeyType="next"
                                                    isValidate
                                                    isValid={state.mobNumValid}
                                                    errorMessage={state.mobNumErrorMsg}
                                                    value={state.mobNumMask}
                                                    onFocus={onMobileFocus}
                                                    maxLength={20}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <LabeledDropdown
                                        label="Education level"
                                        disabled={
                                            state.eduType !== PLEASE_SELECT && state.isPostLogin
                                        }
                                        dropdownValue={state.eduType}
                                        isValid={state.eduTypeValid}
                                        errorMessage={state.eduTypeErrorMsg}
                                        onPress={onEduTypeTap}
                                        style={styles.info}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                            <FixedActionContainer>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        disabled={state.isContinueDisabled}
                                        borderRadius={25}
                                        onPress={handleProceedButton}
                                        backgroundColor={
                                            state.isContinueDisabled ? DISABLED : YELLOW
                                        }
                                        componentCenter={
                                            <Typo
                                                text="Continue"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={
                                                    state.isContinueDisabled ? DISABLED_TEXT : BLACK
                                                }
                                            />
                                        }
                                    />
                                </View>
                            </FixedActionContainer>
                        </View>
                    </ScreenLayout>
                    {state.titleData && (
                        <ScrollPickerView
                            showMenu={state.titlePicker}
                            list={state.titleData}
                            selectedIndex={state.titleValueIndex}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                        />
                    )}
                    {state.cidTypeData && (
                        <ScrollPickerView
                            showMenu={state.cidTypePicker}
                            list={state.cidTypeData}
                            selectedIndex={state.cidTypeValueIndex}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                        />
                    )}
                    {state.eduTypeData && (
                        <ScrollPickerView
                            showMenu={state.eduTypePicker}
                            list={state.eduTypeData}
                            selectedIndex={state.eduTypeValueIndex}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                        />
                    )}
                    {state.mobPrefixData && (
                        <ScrollPickerView
                            showMenu={state.mobPrefixPicker}
                            list={state.mobPrefixData}
                            selectedIndex={state.mobPrefixValueIndex}
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
                        //description="You may select the Principal Card with a maximum of 5 cards per application"
                        onClose={onPopupClose}
                    />
                </>
            </ScreenContainer>
            <DatePicker
                showDatePicker={state.datePicker}
                onCancelButtonPressed={onDatePickerCancel}
                onDoneButtonPressed={onDatePickerDone}
                dateRangeStartDate={getStartDate(validDateRangeData)}
                dateRangeEndDate={getEndDate(validDateRangeData)}
                defaultSelectedDate={defaultSelectedDate}
            />
        </>
    );
}

CardsIdDetails.propTypes = {
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
    dobView: { marginTop: 5 },
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
    inputContainer: {
        alignItems: "center",
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
    },
    inputContainerSelect: {
        alignItems: "center",
        borderBottomColor: BLACK,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "flex-start",
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

export default CardsIdDetails;

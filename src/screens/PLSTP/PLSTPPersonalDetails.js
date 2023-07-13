import React, { useReducer, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { prequalCheck2, maskAddress, maskEmail, maskMobile } from "@screens/PLSTP/PLSTPController";
import { validatePersonalDetails } from "@screens/PLSTP/PLSTPValidation";

import {
    PLSTP_EMPLOYMENT_DETAILS,
    PLSTP_PREQUAL2_FAIL,
    PLSTP_REPAYMENT_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView, LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { saveGeneralData } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    STEP_5,
    PERSONAL_DETAILS_DESC,
    PLSTP_TITLE,
    PLSTP_MARITAL_STATUS,
    PLSTP_EDUCATION,
    PLSTP_RESIDENTIAL_STATUS,
    PLSTP_EMAIL,
    PLSTP_EMAIL_PH,
    PLSTP_MOBILE_NUM,
    PLSTP_HOME_ADDR1,
    PLSTP_HOME_ADDR2,
    PLSTP_HOME_ADDR3,
    PLSTP_CITY,
    PLSTP_STATE,
    PLSTP_POSTCODE,
    PLSTP_SAVE_NEXT,
    DONE,
    CANCEL,
    PLEASE_SELECT,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

// Initial state object
const initialState = {
    // Title
    title: PLEASE_SELECT,
    titleValue: null,
    titleValid: true,
    titleErrorMsg: "",
    titleData: null,
    titleKeyVal: null,
    titlePicker: false,
    titlePickerIndex: 0,

    // Marital Status
    maritalStatus: PLEASE_SELECT,
    maritalStatusValue: null,
    maritalStatusValid: true,
    maritalStatusErrorMsg: "",
    maritalStatusData: null,
    maritalStatusKeyVal: null,
    maritalStatusPicker: false,
    maritalPickerIndex: 0,

    // Education
    education: PLEASE_SELECT,
    educationValue: null,
    educationValid: true,
    educationErrorMsg: "",
    educationData: null,
    educationKeyVal: null,
    educationPicker: false,
    educationPickerIndex: 0,

    // Residential
    residential: PLEASE_SELECT,
    residentialValue: null,
    residentialValid: true,
    residentialErrorMsg: "",
    residentialData: null,
    residentialKeyVal: null,
    residentialPicker: false,
    residentialPickerIndex: 0,

    //Email
    email: "",
    maskedEmail: "",
    emailValid: true,
    emailErrorMsg: "",
    emailEditable: false,

    //Mobile
    mobile: "",
    maskedMobile: "",
    mobileValid: true,
    mobileErrorMsg: "",
    mobileEditable: false,

    //Home Addr 1
    addr1: "",
    maskedAddr1: "",
    addr1Valid: true,
    addr1ErrorMsg: "",
    addr1Editable: false,

    //Home Addr 2
    addr2: "",
    maskedAddr2: "",
    addr2Valid: true,
    addr2ErrorMsg: "",
    addr2Editable: false,

    //Home Addr 3
    addr3: "",
    maskedAddr3: "",
    addr3Valid: true,
    addr3ErrorMsg: "",
    addr3Editable: false,

    //City
    city: "",
    maskedCity: "",
    cityValid: true,
    cityErrorMsg: "",
    cityEditable: false,

    // State
    stateField: PLEASE_SELECT,
    stateValue: null,
    stateValid: true,
    stateErrorMsg: "",
    stateData: null,
    stateKeyVal: null,
    statePicker: false,
    statePickerIndex: 0,

    //Postcode
    postcode: "",
    postcodeValid: true,
    postcodeErrorMsg: "",

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                titleData: payload?.title ?? state.titleData,
                maritalStatusData: payload?.maritalStatus ?? state.maritalStatusData,
                residentialData: payload?.residenceStatus ?? state.residentialData,
                educationData: payload?.education ?? state.educationData,
                stateData: payload?.state ?? state.stateData,
            };
        case "titlePicker":
            return {
                ...state,
                titlePicker: payload,
                pickerType: payload && "title",
            };
        case "title":
            return {
                ...state,
                title: payload?.name ?? PLEASE_SELECT,
                titleValue: payload?.id ?? null,
                titlePickerIndex: payload?.index ?? 0,
            };
        case "maritalStatusPicker":
            return {
                ...state,
                maritalStatusPicker: payload,
                pickerType: payload && "maritalStatus",
            };
        case "maritalStatus":
            return {
                ...state,
                maritalStatus: payload?.name ?? PLEASE_SELECT,
                maritalStatusValue: payload?.id ?? null,
                maritalPickerIndex: payload?.index ?? 0,
            };
        case "educationPicker":
            return {
                ...state,
                educationPicker: payload,
                pickerType: payload && "education",
            };
        case "education":
            return {
                ...state,
                education: payload?.name ?? PLEASE_SELECT,
                educationValue: payload?.id ?? null,
                educationPickerIndex: payload?.index ?? 0,
            };
        case "residentialPicker":
            return {
                ...state,
                residentialPicker: payload,
                pickerType: payload && "residential",
            };
        case "residential":
            return {
                ...state,
                residential: payload?.name ?? PLEASE_SELECT,
                residentialValue: payload?.id ?? null,
                residentialPickerIndex: payload?.index ?? 0,
            };
        case "email":
            return {
                ...state,
                email: payload.email,
                maskedEmail: payload.maskedEmail,
                emailEditable: payload.emailEditable,
            };
        case "emailValid":
            return {
                ...state,
                emailValid: payload?.valid,
                emailErrorMsg: payload?.errorMsg,
            };
        case "mobile":
            return {
                ...state,
                mobile: payload.mobile,
                maskedMobile: payload.maskedMobile,
                mobileEditable: payload.mobileEditable,
            };
        case "mobileValid":
            return {
                ...state,
                mobileValid: payload?.valid,
                mobileErrorMsg: payload?.errorMsg,
            };
        case "addr1":
            return {
                ...state,
                addr1: payload.addr1,
                maskedAddr1: payload.maskedAddr1,
                addr1Editable: payload.addr1Editable,
            };
        case "addr1Valid":
            return {
                ...state,
                addr1Valid: payload?.valid,
                addr1ErrorMsg: payload?.errorMsg,
            };
        case "addr2":
            return {
                ...state,
                addr2: payload.addr2,
                maskedAddr2: payload.maskedAddr2,
                addr2Editable: payload.addr2Editable,
            };
        case "addr2Valid":
            return {
                ...state,
                addr2Valid: payload?.valid,
                addr2ErrorMsg: payload?.errorMsg,
            };
        case "addr3":
            return {
                ...state,
                addr3: payload.addr3,
                maskedAddr3: payload.maskedAddr3,
                addr3Editable: payload.addr3Editable,
            };
        case "addr3Valid":
            return {
                ...state,
                addr3Valid: payload?.valid,
                addr3ErrorMsg: payload?.errorMsg,
            };
        case "city":
            return {
                ...state,
                city: payload.city,
                maskedCity: payload.maskedCity,
                cityEditable: payload.cityEditable,
            };
        case "cityValid":
            return {
                ...state,
                cityValid: payload?.valid,
                cityErrorMsg: payload?.errorMsg,
            };
        case "statePicker":
            return {
                ...state,
                statePicker: payload,
                pickerType: payload && "stateField",
            };
        case "stateField":
            return {
                ...state,
                stateField: payload?.name ?? PLEASE_SELECT,
                stateValue: payload?.id ?? null,
                statePickerIndex: payload?.index ?? 0,
            };
        case "postcode":
            return {
                ...state,
                postcode: payload.postcode,
            };
        case "postcodeValid":
            return {
                ...state,
                postcodeValid: payload?.valid,
                postcodeErrorMsg: payload?.errorMsg,
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

function PLSTPPersonalDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { initParams } = route?.params;
    const { masterData, customerInfo, stpRefNum, gcifData } = initParams;
    const [clearErr, SetClearErr] = useState("");

    useEffect(() => {
        init();
    }, [route.params]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPPersonalDetails] >> [Form Fields Updated]");
        const {
            title,
            maritalStatus,
            email,
            mobile,
            addr1,
            addr2,
            addr3,
            city,
            education,
            residential,
            stateField,
            postcode,
        } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                title === PLEASE_SELECT ||
                maritalStatus === PLEASE_SELECT ||
                education === PLEASE_SELECT ||
                residential === PLEASE_SELECT ||
                email === "" ||
                mobile === "" ||
                addr1 === "" ||
                addr2 === "" ||
                addr3 === "" ||
                city === "" ||
                stateField === PLEASE_SELECT ||
                postcode === "",
        });
    }, [
        state.title,
        state.maritalStatus,
        state.email,
        state.mobile,
        state.education,
        state.residential,
        state.addr1,
        state.addr2,
        state.addr3,
        state.city,
        state.stateField,
        state.postcode,
    ]);

    const init = () => {
        console.log("[PLSTPPersonalDetails] >> [init]");

        const {
            titleKeyVal,
            maritalStatusKeyVal,
            educationKeyVal,
            residentialKeyVal,
            stateKeyVal,
        } = masterData;

        let userData;
        if (customerInfo.emailAddress) {
            userData = customerInfo;
        } else {
            Object.assign(customerInfo, {
                title: gcifData?.title?.type,
                titleValue: gcifData?.title?.id,
                maritalStatus: gcifData?.maritalStatus?.type,
                maritalStatusValue: gcifData?.maritalStatus?.id,
                education: gcifData?.education?.type,
                educationValue: gcifData?.education?.id,
                residential: gcifData?.residentialStatus?.type,
                residentialValue: gcifData?.residentialStatus?.id,
                emailAddress: gcifData?.emailAddress,
                mobile: gcifData?.mobileNum,
                homeAddress1: gcifData?.homeAddress?.addressLine1,
                homeAddress2: gcifData?.homeAddress?.addressLine2,
                homeAddress3: gcifData?.homeAddress?.addressLine3,
                city: gcifData?.homeAddress?.city,
                state: gcifData?.homeAddress?.state?.type,
                stateValue: gcifData?.homeAddress?.state?.id,
                postcode: gcifData?.homeAddress?.postCode,
            });
            userData = customerInfo;
        }
        const {
            titleValue,
            maritalStatusValue,
            educationValue,
            residentialValue,
            emailAddress,
            mobile,
            homeAddress1,
            homeAddress2,
            homeAddress3,
            city,
            stateValue,
            postcode,
        } = userData;
        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: masterData });

        // Pre-populate field values if any existing and mask the data
        if (titleValue)
            dispatch({
                actionType: "title",
                payload: {
                    name: titleKeyVal[titleValue],
                    id: titleValue,
                },
            });
        if (maritalStatusValue)
            dispatch({
                actionType: "maritalStatus",
                payload: {
                    name: maritalStatusKeyVal[maritalStatusValue],
                    id: maritalStatusValue,
                },
            });
        if (educationValue)
            dispatch({
                actionType: "education",
                payload: {
                    name: educationKeyVal[educationValue],
                    id: educationValue,
                },
            });
        if (residentialValue)
            dispatch({
                actionType: "residential",
                payload: {
                    name: residentialKeyVal[residentialValue],
                    id: residentialValue,
                },
            });
        if (emailAddress) {
            const maskedEmail = maskEmail(emailAddress);
            dispatch({
                actionType: "email",
                payload: { email: emailAddress, maskedEmail, emailEditable: false },
            });
        }
        if (mobile) {
            let mobileSubStr = mobile;
            if (mobileSubStr.startsWith(0)) {
                mobileSubStr = mobileSubStr.substring(1);
            }
            const maskedMobile = maskMobile(mobileSubStr);
            dispatch({
                actionType: "mobile",
                payload: { mobile: mobileSubStr, maskedMobile, mobileEditable: false },
            });
        }
        if (homeAddress1) {
            const addrSubStr = homeAddress1.substring(0, 30);
            const maskedAddress = maskAddress(addrSubStr);
            dispatch({
                actionType: "addr1",
                payload: { addr1: homeAddress1, maskedAddr1: maskedAddress, addr1Editable: false },
            });
        }
        if (homeAddress2) {
            const addrSubStr = homeAddress2.substring(0, 30);
            const maskedAddress = maskAddress(addrSubStr);
            dispatch({
                actionType: "addr2",
                payload: { addr2: homeAddress2, maskedAddr2: maskedAddress, addr2Editable: false },
            });
        }
        //Not getting address3 from gcif
        if (homeAddress3) {
            const addrSubStr = homeAddress3.substring(0, 30);
            const maskedAddress = maskAddress(addrSubStr);
            dispatch({
                actionType: "addr3",
                payload: { addr3: homeAddress3, maskedAddr3: maskedAddress, addr3Editable: false },
            });
        }
        if (city)
            dispatch({
                actionType: "city",
                payload: { city: city, maskedCity: maskAddress(city), cityEditable: false },
            });

        if (stateValue)
            dispatch({
                actionType: "stateField",
                payload: {
                    name: stateKeyVal[stateValue],
                    id: stateValue,
                },
            });
        if (postcode) {
            dispatch({
                actionType: "postcode",
                payload: {
                    postcode: postcode,
                },
            });
        }
    };

    // Actions
    function onTitleFieldTap() {
        dispatch({
            actionType: "titlePicker",
            payload: true,
        });
    }

    function onMaritalStatusFieldTap() {
        dispatch({
            actionType: "maritalStatusPicker",
            payload: true,
        });
    }

    function onEducationFieldTap() {
        dispatch({
            actionType: "educationPicker",
            payload: true,
        });
    }

    function onResidentialFieldTap() {
        dispatch({
            actionType: "residentialPicker",
            payload: true,
        });
    }

    function onStateFieldTap() {
        dispatch({
            actionType: "statePicker",
            payload: true,
        });
    }

    function onEmailChange(value) {
        console.log("[PLSTPPersonalDetails] >> [onEmailChange]");

        dispatch({
            actionType: "email",
            payload: { email: value, maskedEmail: value, emailEditable: true },
        });
    }

    function onMobileChange(value) {
        console.log("[PLSTPPersonalDetails] >> [onMobileChange]");

        dispatch({
            actionType: "mobile",
            payload: { mobile: value, maskedMobile: value, mobileEditable: true },
        });
    }

    function onAddr1Change(value) {
        console.log("[PLSTPPersonalDetails] >> [onAddr1Change]");

        dispatch({
            actionType: "addr1",
            payload: { addr1: value, maskedAddr1: value, addr1Editable: true },
        });
    }

    function onAddr2Change(value) {
        console.log("[PLSTPPersonalDetails] >> [onAddr2Change]");

        dispatch({
            actionType: "addr2",
            payload: { addr2: value, maskedAddr2: value, addr2Editable: true },
        });
    }

    function onAddr3Change(value) {
        console.log("[PLSTPPersonalDetails] >> [onAddr3Change]");

        dispatch({
            actionType: "addr3",
            payload: { addr3: value, maskedAddr3: value, addr3Editable: true },
        });
    }

    function onCityChange(value) {
        console.log("[PLSTPPersonalDetails] >> [onCityChange]");

        dispatch({
            actionType: "city",
            payload: { city: value, maskedCity: value, cityEditable: true },
        });
    }

    function onPostcodeChange(value) {
        console.log("[PLSTPPersonalDetails] >> [onPostcodeChange]");

        dispatch({
            actionType: "postcode",
            payload: { postcode: value },
        });
    }

    function onEditBtnPressed(filed) {
        switch (filed) {
            case "email":
                if (!state.emailEditable)
                    dispatch({
                        actionType: "email",
                        payload: { email: "", maskedEmail: "", emailEditable: true },
                    });
                break;
            case "mobile":
                if (!state.mobileEditable)
                    dispatch({
                        actionType: "mobile",
                        payload: { mobile: "", maskedMobile: "", mobileEditable: true },
                    });
                break;
            case "addr1":
                if (!state.addr1Editable)
                    dispatch({
                        actionType: "addr1",
                        payload: { addr1: "", maskedAddr1: "", addr1Editable: true },
                    });
                break;
            case "addr2":
                if (!state.addr2Editable)
                    dispatch({
                        actionType: "addr2",
                        payload: { addr2: "", maskedAddr2: "", addr2Editable: true },
                    });
                break;
            case "addr3":
                if (!state.addr3Editable)
                    dispatch({
                        actionType: "addr3",
                        payload: { addr3: "", maskedAddr3: "", addr3Editable: true },
                    });
                break;
            case "city":
                if (!state.cityEditable)
                    dispatch({
                        actionType: "city",
                        payload: { city: "", maskedCity: "", cityEditable: true },
                    });
                break;
            default:
                break;
        }
    }

    function onPickerDone(item, selectedIndex) {
        item.index = selectedIndex;
        dispatch({ actionType: state.pickerType, payload: item });
        // Close picker
        onPickerCancel();
    }

    function onPickerCancel() {
        switch (state.pickerType) {
            case "title":
                dispatch({
                    actionType: "titlePicker",
                    payload: false,
                });
                break;
            case "maritalStatus":
                dispatch({
                    actionType: "maritalStatusPicker",
                    payload: false,
                });
                break;
            case "education":
                dispatch({
                    actionType: "educationPicker",
                    payload: false,
                });
                break;
            case "residential":
                dispatch({
                    actionType: "residentialPicker",
                    payload: false,
                });
                break;
            case "stateField":
                dispatch({
                    actionType: "statePicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    }

    const onDoneTap = async () => {
        console.log("[PLSTPPersonalDetails] >> [onDoneTap]");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_5",
        });
        // Return if button is disabled
        if (state.isContinueDisabled) return;

        if (clearErr) {
            dispatch({
                actionType: clearErr,
                payload: { valid: true, errorMsg: "" },
            });
        }

        // const validateResult = { isValid: false, message: "", actionType: "" };
        const personalData = getFormData();
        const validateResult = validatePersonalDetails(personalData, {});
        // Object.assign(validateResult, validatePersonalDetails(personalData, {}));
        dispatch({
            actionType: validateResult.actionType,
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        SetClearErr(validateResult.actionType);
        if (!validateResult.isValid) return;
        let initData = initParams;
        if (!initParams.isSAL && !initParams?.prequal2Status) {
            const prequal2Data = {
                stpRefNo: stpRefNum,
                callType: "INQUERY",
                isLastPage: false,
            };
            const response = await prequalCheck2(prequal2Data);
            /**
             * Response.codes -> 200,400,408,701,702
             * 200 -> prequal 2 status success
             * 400 -> prequal 2 status declined
             * 408 -> prequal 2 status timeout
             * 701 -> prequal 2 status In progress
             * 702 -> prequal 2 status Withdraw
             */
            switch (response?.data?.code) {
                case 200:
                    initData = { ...initData, prequal2Status: true };
                    navToNextScreen(personalData, initData);
                    break;
                case 400:
                    const custInfo = {
                        ...customerInfo,
                        shortRefNo: response?.data?.result?.stpRefNo,
                        dateTime: response?.data?.result?.dateTime,
                    };
                    initData = Object.assign(initData, {
                        customerInfo: custInfo,
                    });
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                    });
                    break;
                case 702:
                    initData = { ...initData, isSAL: true };
                    navToNextScreen(personalData, initData);
                    break;
                case 701:
                case 408:
                    navToNextScreen(personalData, initData);
                    break;
                default:
                    showErrorToast({
                        message: response?.data?.message,
                    });
                    break;
            }
        } else {
            navToNextScreen(personalData, initData);
        }
    };

    const navToNextScreen = (personalData, initData) => {
        const {
            title,
            titleValue,
            maritalStatus,
            maritalStatusValue,
            education,
            educationValue,
            residential,
            residentialValue,
            emailAddress,
            mobile,
            homeAddress1,
            homeAddress2,
            homeAddress3,
            city,
            stateField,
            stateValue,
            postcode,
        } = personalData;
        const data = {
            title: {
                id: titleValue,
                type: title,
            },
            maritalStatus: {
                id: maritalStatusValue,
                type: maritalStatus,
            },
            education: {
                id: educationValue,
                type: education,
            },
            residentialStatus: {
                id: residentialValue,
                type: residential,
            },
            emailAddress,
            mobilePrefix: `0${mobile.substring(0, 2)}`,
            mobileNum: mobile.substring(2, mobile.length),
            homeAddress: {
                addressLine1: homeAddress1,
                addressLine2: homeAddress2,
                addressLine3: homeAddress3,
                city,
                state: {
                    id: stateValue,
                    type: stateField,
                },
                postCode: postcode,
            },
            personalCarePlan: customerInfo?.personalCarePlan,
            stpRefNo: stpRefNum,
        };

        saveGeneralData(data)
            .then((result) => {
                // Navigate to Next screen (ScreenName : PLSTP_REPAYMENT_DETAILS)
                if (result?.data?.code === 200) {
                    const custData = Object.assign(customerInfo, personalData);
                    initData = { ...initData, customerInfo: custData, age: gcifData?.age };
                    console.log("personal details route.params", route?.params);
                    navigation.navigate(PLSTP_EMPLOYMENT_DETAILS, {
                        ...route.params,
                        initParams: initData,
                    });
                } else {
                    showErrorToast({
                        message: result?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPPersonalDetails][saveGeneralData] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    function onBackTap() {
        console.log("[PLSTPPersonalDetails] >> [onBackTap]");
        navigation.navigate(PLSTP_REPAYMENT_DETAILS, {
            ...route.params,
        });
    }

    function onCloseTap() {
        console.log("[PLSTPPersonalDetails] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function getFormData() {
        console.log("[PLSTPPersonalDetails] >> [getFormData]");
        return {
            title: state.title,
            titleValue: state.titleValue,
            maritalStatus: state.maritalStatus,
            maritalStatusValue: state.maritalStatusValue,
            education: state.education,
            educationValue: state.educationValue,
            residential: state.residential,
            residentialValue: state.residentialValue,
            emailAddress: state.email.trim(),
            maskedEmail: maskEmail(state.maskedEmail.trim()),
            mobile: state.mobile.trim(),
            maskedMobile: maskMobile(state.maskedMobile.trim()),
            homeAddress1: state.addr1.trim(),
            homeAddress2: state.addr2.trim(),
            homeAddress3: state.addr3.trim(),
            maskedAddr1: maskAddress(state.maskedAddr1.trim()),
            maskedAddr2: maskAddress(state.maskedAddr2.trim()),
            maskedAddr3: maskAddress(state.maskedAddr3.trim()),
            city: state.city.trim(),
            maskedCity: maskAddress(state.maskedCity.trim()),
            stateField: state.stateField,
            stateValue: state.stateValue,
            postcode: state.postcode,
        };
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_5">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_5}
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
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <KeyboardAwareScrollView
                                behavior={Platform.OS == "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    {/* Personal details desc */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={30}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={PERSONAL_DETAILS_DESC}
                                        style={Style.headerLabelCls}
                                    />

                                    {/* Title */}
                                    <LabeledDropdown
                                        label={PLSTP_TITLE}
                                        dropdownValue={state.title}
                                        isValid={state.titleValid}
                                        errorMessage={state.titleErrorMsg}
                                        onPress={onTitleFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Marital Status */}
                                    <LabeledDropdown
                                        label={PLSTP_MARITAL_STATUS}
                                        dropdownValue={state.maritalStatus}
                                        isValid={state.maritalStatusValid}
                                        errorMessage={state.maritalStatusErrorMsg}
                                        onPress={onMaritalStatusFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Education */}
                                    <LabeledDropdown
                                        label={PLSTP_EDUCATION}
                                        dropdownValue={state.education}
                                        isValid={state.educationValid}
                                        errorMessage={state.educationErrorMsg}
                                        onPress={onEducationFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Residential Status */}
                                    <LabeledDropdown
                                        label={PLSTP_RESIDENTIAL_STATUS}
                                        dropdownValue={state.residential}
                                        isValid={state.residentialValid}
                                        errorMessage={state.residentialErrorMsg}
                                        onPress={onResidentialFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Email address */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_EMAIL}
                                        />
                                        <LongTextInput
                                            maxLength={40}
                                            isValid={state.emailValid}
                                            isValidate
                                            errorMessage={state.emailErrorMsg}
                                            value={state.maskedEmail}
                                            keyboardType={"email-address"}
                                            placeholder={PLSTP_EMAIL_PH}
                                            onChangeText={onEmailChange}
                                            numberOfLines={2}
                                            onFocus={() => onEditBtnPressed("email")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Mobile */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_MOBILE_NUM}
                                        />
                                        <LongTextInput
                                            maxLength={10}
                                            isValid={state.mobileValid}
                                            isValidate
                                            errorMessage={state.mobileErrorMsg}
                                            numberOfLines={1}
                                            keyboardType={"number-pad"}
                                            value={state.maskedMobile}
                                            prefix="+60"
                                            onChangeText={onMobileChange}
                                            onFocus={() => onEditBtnPressed("mobile")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Home address 1 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_HOME_ADDR1}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr1Valid}
                                            isValidate
                                            errorMessage={state.addr1ErrorMsg}
                                            numberOfLines={2}
                                            value={state.maskedAddr1}
                                            onChangeText={onAddr1Change}
                                            onFocus={() => onEditBtnPressed("addr1")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Home address 2 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_HOME_ADDR2}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr2Valid}
                                            isValidate
                                            errorMessage={state.addr2ErrorMsg}
                                            numberOfLines={2}
                                            value={state.maskedAddr2}
                                            onChangeText={onAddr2Change}
                                            onFocus={() => onEditBtnPressed("addr2")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Home address 3 */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_HOME_ADDR3}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.addr3Valid}
                                            isValidate
                                            errorMessage={state.addr3ErrorMsg}
                                            numberOfLines={2}
                                            value={state.maskedAddr3}
                                            onChangeText={onAddr3Change}
                                            onFocus={() => onEditBtnPressed("addr3")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Postcode */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_POSTCODE}
                                        />
                                        <LongTextInput
                                            maxLength={5}
                                            isValid={state.postcodeValid}
                                            isValidate
                                            errorMessage={state.postcodeErrorMsg}
                                            keyboardType={"number-pad"}
                                            value={state.postcode}
                                            onChangeText={onPostcodeChange}
                                        />
                                    </View>

                                    {/* City */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_CITY}
                                        />
                                        <LongTextInput
                                            maxLength={30}
                                            isValid={state.cityValid}
                                            isValidate
                                            errorMessage={state.cityErrorMsg}
                                            numberOfLines={2}
                                            value={state.maskedCity}
                                            onChangeText={onCityChange}
                                            onFocus={() => onEditBtnPressed("city")}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* State */}
                                    <LabeledDropdown
                                        label={PLSTP_STATE}
                                        dropdownValue={state.stateField}
                                        isValid={state.stateValid}
                                        errorMessage={state.stateErrorMsg}
                                        onPress={onStateFieldTap}
                                        style={Style.fieldViewCls}
                                    />
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={state.isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_SAVE_NEXT}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
            {/* Title Picker */}
            {state.titleData && (
                <ScrollPickerView
                    showMenu={state.titlePicker}
                    selectedIndex={state.titlePickerIndex}
                    list={state.titleData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Marital status Picker */}
            {state.maritalStatusData && (
                <ScrollPickerView
                    showMenu={state.maritalStatusPicker}
                    selectedIndex={state.maritalPickerIndex}
                    list={state.maritalStatusData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Education Picker */}
            {state.educationData && (
                <ScrollPickerView
                    showMenu={state.educationPicker}
                    selectedIndex={state.educationPickerIndex}
                    list={state.educationData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Residential Picker */}
            {state.residentialData && (
                <ScrollPickerView
                    showMenu={state.residentialPicker}
                    selectedIndex={state.residentialPickerIndex}
                    list={state.residentialData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* State Picker */}
            {state.stateData && (
                <ScrollPickerView
                    showMenu={state.statePicker}
                    selectedIndex={state.statePickerIndex}
                    list={state.stateData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    formContainer: {
        marginBottom: 40,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PLSTPPersonalDetails;

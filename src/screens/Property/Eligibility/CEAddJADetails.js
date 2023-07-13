/* eslint-disable sonarjs/cognitive-complexity */
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    CE_ADD_JA_ETB,
    CE_ADD_JA_NOTIFY_RESULT,
    CE_ADD_JA_NTB,
    PROPERTY_DASHBOARD,
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
import { showErrorToast } from "@components/Toast";

import { saveJAApplicantData } from "@services";

import {
    MEDIUM_GREY,
    YELLOW,
    FADE_GREY,
    DISABLED,
    DISABLED_TEXT,
    RED_ERROR,
    BLACK,
} from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    PLEASE_SELECT,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    DONE,
    CANCEL,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_ADDJA_JOINTAPPLICANTDETAILS,
    NO_NOTIFY_JOINTAPPLICANT_TITLE,
    NO_NOTIFY_JOINTAPPLICANT_DESC,
    CONFIRM,
    INVITE_JOINT_APPLICANT,
    ADDJOINT_APPLICANT,
    ENTER_YOUR_JOINT_APPLICANT_DETAILS,
    ASB_ADD_GUARANTOR_FULL_NAME_PLACEHOLDER,
    JA_ID_NUMBER_PLACEHOLDER,
    JA_MOBILE_NUMBER_PLACEHOLDER,
} from "@constants/strings";

import { useResetNavigation, getExistingData, getEncValue } from "../Common/PropertyController";
import {
    validateJAName,
    validateJAIDNumber,
    validateJAMobileNumber,
    fetchIsExistingCustomer,
    sendPushNotificationToInviteJA,
} from "./CEController";

const initialState = {
    //stepper info
    currentStep: "",
    totalSteps: "",
    stepperInfo: "",

    // Applicant Name
    applicantName: "",
    applicantNameValid: true,
    applicantNameErrorMsg: "",
    applicantNameFocus: false,

    // ID type
    idType: PLEASE_SELECT,
    idTypeValue: null,
    idTypeValueIndex: 0,
    idTypeData: null,
    idTypePicker: false,
    idTypeObj: null,

    // ID number
    idNumber: "",
    idNumberValid: true,
    idNumberErrorMsg: "",
    idNumberFocus: false,

    // Relationship
    relationship: PLEASE_SELECT,
    relationshipValue: null,
    relationshipValueIndex: 0,
    relationshipData: null,
    relationshipPicker: false,
    relationshipObj: null,

    // Mobile number
    mobileNumber: "",
    mobileNumberValid: true,
    mobileNumberErrorMsg: "",
    mobileNumberFocus: false,

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
                idTypePicker: false,
                relationshipPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                idTypePicker: payload === "idType",
                relationshipPicker: payload === "relationship",
            };
        case "SET_STEPPER_INFO":
        case "SET_PICKER_DATA":
        case "SET_ID_TYPE":
        case "SET_RELATIONSHIP":
        case "RESET_VALIDATION_ERRORS":
        case "SET_APPLICANT_NAME_ERROR":
        case "SET_ID_NUMBER_ERROR":
        case "SET_MOBILE_NUMBER_ERROR":
        case "SET_APPLICANT_NAME_FOCUS":
        case "SET_ID_NUMBER_FOCUS":
        case "SET_MOBILE_NUMBER_FOCUS":
            return {
                ...state,
                ...payload,
            };
        case "SET_APPLICANT_NAME":
            return {
                ...state,
                applicantName: payload,
            };
        case "SET_ID_NUMBER":
            return {
                ...state,
                idNumber: payload,
            };
        case "SET_MOBILE_NUMBER":
            return {
                ...state,
                mobileNumber: payload,
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

function CEAddJADetails({ route, navigation }) {
    const [resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [propertyDetails, setPropertyDetails] = useState(null);
    const {
        isContinueDisabled,
        applicantName,
        idNumber,
        mobileNumber,
        idType,
        idTypeValue,
        relationship,
        relationshipValue,
    } = state;
    const [idNumberError, setIdNumberError] = useState("");
    const [showNotifyJAPopup, setShowNotifyJAPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[CEAddJADetails] >> [init]");

        const currentStep = 1;
        const totalSteps = 2;
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
        populateSavedData();
    }, [route?.params, populateSavedData]);

    function populateSavedData() {
        console.log("[CEAddJADetails] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const {
            jaName,
            applicantName,
            jaIcNumber,
            idNumber,
            jaPhone,
            mobileNumber,
            idType,
            jaIdType,
            relationship,
            jaRelationship,
        } = savedData;

        const applicantNameData = jaName ?? applicantName;
        const idNumberData = jaIcNumber ?? idNumber;
        const mobileNumberData = jaPhone ?? mobileNumber;
        const idTypeData = jaIdType ?? idType;
        const relationshipData = jaRelationship ?? relationship;

        setPropertyDetails(route?.params);
        // Name
        if (applicantNameData) {
            dispatch({
                actionType: "SET_APPLICANT_NAME",
                payload: applicantNameData,
            });
        }

        // ID number
        if (idNumberData) {
            dispatch({
                actionType: "SET_ID_NUMBER",
                payload: idNumberData,
            });
        }

        // MobileNumber
        if (mobileNumberData) {
            dispatch({
                actionType: "SET_MOBILE_NUMBER",
                payload: mobileNumberData,
            });
        }

        // idType
        if (idTypeData) {
            const idTypeSelected = getExistingData(idTypeData, masterData?.idType ?? null);
            dispatch({
                actionType: "SET_ID_TYPE",
                payload: {
                    idType: idTypeSelected.name,
                    idTypeValue: idTypeSelected.value,
                    idTypeObj: idTypeSelected.obj,
                    idTypeValueIndex: idTypeSelected.index,
                },
            });
        }

        // relationship
        if (relationshipData) {
            const relationshipSelect = getExistingData(
                relationshipData,
                masterData?.relationship ?? null
            );
            dispatch({
                actionType: "SET_RELATIONSHIP",
                payload: {
                    relationship: relationshipSelect.name,
                    relationshipValue: relationshipSelect.value,
                    relationshipObj: relationshipSelect.obj,
                    relationshipValueIndex: relationshipSelect.index,
                },
            });
        }
    }

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                applicantName.trim() === "" ||
                idNumber.trim() === "" ||
                mobileNumber.trim() === "" ||
                idType === PLEASE_SELECT ||
                relationship === PLEASE_SELECT,
        });
    }, [applicantName, idNumber, mobileNumber, idType, relationship]);

    function onBackPress() {
        console.log("[CEAddJADetails] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEAddJADetails] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    }

    const setPickerData = () => {
        console.log("[CEAddJADetails] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                idTypeData: masterData?.idType ?? null,
                relationshipData: masterData?.relationship ?? null,
            },
        });
    };

    function onNameChange(value) {
        dispatch({
            actionType: "SET_APPLICANT_NAME",
            payload: value,
        });
    }

    function onIDNumberChange(value) {
        setIdNumberError(null);
        dispatch({
            actionType: "SET_ID_NUMBER",
            payload: value,
        });
    }

    function onMobileNumberChange(value) {
        dispatch({
            actionType: "SET_MOBILE_NUMBER",
            payload: value,
        });
    }

    function onNameFocus() {
        if (!state.applicantNameFocus) {
            dispatch({
                actionType: "SET_APPLICANT_NAME_FOCUS",
                payload: {
                    applicantName: "",
                    applicantNameFocus: true,
                },
            });
        }
    }

    function onIDNumberFocus() {
        if (!state.idNumberFocus) {
            dispatch({
                actionType: "SET_ID_NUMBER_FOCUS",
                payload: {
                    idNumber: "",
                    idNumberFocus: true,
                },
            });
        }
    }

    function onMobileNumberFocus() {
        if (!state.mobileNumberFocus) {
            dispatch({
                actionType: "SET_MOBILE_NUMBER_FOCUS",
                payload: {
                    mobileNumber: "",
                    mobileNumberFocus: true,
                },
            });
        }
    }

    function onIDTypeTap() {
        console.log("[CEAddJADetails] >> [onIDTypeTap]");
        setIdNumberError(null);
        resetIdNoValidationErrors();
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "idType",
        });
    }

    function onRelatioshipTap() {
        console.log("[CEAddJADetails] >> [onRelatioshipTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "relationship",
        });
    }

    function onPickerCancel() {
        console.log("[CEAddJADetails] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    }

    function onPickerDone(item, index) {
        console.log("[CEAddJADetails] >> [onPickerDone]");

        if (state.pickerType === "idType") {
            dispatch({
                actionType: "SET_ID_TYPE",
                payload: {
                    idType: item?.name ?? PLEASE_SELECT,
                    idTypeValue: item?.value ?? null,
                    idTypeObj: item,
                    idTypeValueIndex: index,
                },
            });
        }

        if (state.pickerType === "relationship") {
            dispatch({
                actionType: "SET_RELATIONSHIP",
                payload: {
                    relationship: item?.name ?? PLEASE_SELECT,
                    relationshipValue: item?.value ?? null,
                    relationshipObj: item,
                    relationshipValueIndex: index,
                },
            });
        }

        // Close picker
        onPickerCancel();
    }

    async function onExitPopupSave() {
        console.log("[CEAddJADetails] >> [onExitPopupSave]");
        const navParams = route?.params ?? {};
        // Hide popup
        closeExitPopup();
        const isRemoved = null;
        const isActive = "W";

        // Retrieve form data
        const formData = getFormData(isRemoved, isActive);

        // Save Form Data in DB before exiting the flow
        const response = await saveJAApplicantData(
            { ...formData, syncId: await getEncValue(navParams?.syncId) },
            true
        );
        const success = response?.data?.result?.statusCode ?? null;
        const errorMessage = response?.data?.result?.statusDesc ?? null;

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    async function onExitPopupDontSave() {
        console.log("[CEAddJADetails] >> [onExitPopupDontSave]");
        const navParams = route?.params ?? {};
        // Hide popup
        closeExitPopup();

        const isRemoved = "Y";
        const isActive = "W";
        // Retrieve form data
        const formData = getFormData(isRemoved, isActive);

        //Save Form Data in DB before exiting the flow
        const response = await saveJAApplicantData(
            { ...formData, syncId: await getEncValue(navParams?.syncId) },
            true
        );

        const success = response?.data?.result?.statusCode ?? null;
        const errorMessage = response?.data?.result?.statusDesc ?? null;

        if (success) {
            // resetToApplication();
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 1,
                            reload: true,
                        },
                    },
                ],
            });
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function closeExitPopup() {
        console.log("[CEAddJADetails] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function resetValidationErrors() {
        console.log("[CEAddJADetails] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                applicantNameValid: true,
                applicantNameErrorMsg: "",
                idNumberValid: true,
                idNumberErrorMsg: "",
                mobileNumberValid: true,
                mobileNumberErrorMsg: "",
            },
        });
    }

    function resetIdNoValidationErrors() {
        console.log("[CEAddJADetails] >> [resetIdNoValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                idNumberValid: true,
                idNumberErrorMsg: "",
            },
        });
    }

    function validateFormDetails() {
        console.log("[CEAddJADetails] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        // Applicant Name
        const { isValid: applicantNameValid, message: applicantNameErrorMsg } =
            validateJAName(applicantName);
        if (!applicantNameValid) {
            dispatch({
                actionType: "SET_APPLICANT_NAME_ERROR",
                payload: { applicantNameValid, applicantNameErrorMsg },
            });
        }

        // ID number
        const { isValid: idNumberValid, message: idNumberErrorMsg } = validateJAIDNumber(
            idNumber,
            idTypeValue
        );
        if (!idNumberValid) {
            dispatch({
                actionType: "SET_ID_NUMBER_ERROR",
                payload: { idNumberValid, idNumberErrorMsg },
            });
        }

        // Mobile number
        const { isValid: mobileNumberValid, message: mobileNumberErrorMsg } =
            validateJAMobileNumber(mobileNumber);
        if (!mobileNumberValid) {
            dispatch({
                actionType: "SET_MOBILE_NUMBER_ERROR",
                payload: { mobileNumberValid, mobileNumberErrorMsg },
            });
        }

        return applicantNameValid && idNumberValid && mobileNumberValid;
    }

    async function onContinue() {
        console.log("[CEAddJADetails] >> [onContinue]");

        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId);
        const stpId = navParams?.stpId ?? "";

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const isRemoved = null;
        const isActive = "W";

        const formData = getFormData(isRemoved, isActive);

        // check NTB/ETB
        try {
            const params = {
                syncId: encSyncId,
                idNumber: formData?.idNumber,
                mobileNo: formData?.mobileNumber,
            };

            const {
                success,
                statusDesc,
                existingCustomer,
                hasAllMandatoryFields,
                isSelfCustomerId,
                maeAppUrl,
            } = await fetchIsExistingCustomer(params, true);
            if (!success) {
                showErrorToast({ message: statusDesc });
                return;
            }

            if (isSelfCustomerId) {
                validateForSelfCustomorID(idNumber, idTypeValue, isSelfCustomerId);
            } else {
                if (existingCustomer) {
                    //save input data
                    try {
                        const response = await saveJAApplicantData(
                            { ...formData, syncId: encSyncId },
                            true
                        );
                        if (
                            response?.data?.code === 200 &&
                            (navParams?.applicationStpRefNo === null ||
                                navParams?.applicationStpRefNo === undefined)
                        ) {
                            navParams.applicationStpRefNo = response?.data?.result?.stpId;
                        }
                        if (response?.data?.code === 400) {
                            setIdNumberError(response?.data?.result?.statusDesc);
                            return;
                        }
                    } catch ({ error }) {
                        const errorMsg = error?.message || error?.result?.statusDesc;
                        showErrorToast({ message: errorMsg });
                        return;
                    }

                    if (hasAllMandatoryFields) {
                        // Request object
                        const commonParams = {
                            syncId: encSyncId,
                            stpId,
                        };

                        // Call api to send notification - MAE will send notification to Joint applicant
                        const { pushNotificationSuccess, result } =
                            await sendPushNotificationToInviteJA(commonParams);

                        if (pushNotificationSuccess) {
                            navigation.navigate(CE_ADD_JA_ETB, {
                                ...formData,
                                deepLinkUrl: result?.maeAppUrl,
                                ...navParams,
                                currentDateTime: moment(new Date()).format("DD MMM YYYY, hh:mm A"),
                            });
                        }
                    } else {
                        //Show notify Joint applicant popup as all mandatory fields available
                        setShowNotifyJAPopup(true);
                    }
                } else {
                    navigation.navigate(CE_ADD_JA_NTB, {
                        deepLinkUrl: maeAppUrl,
                        ...navParams,
                    });
                }
            }
        } catch (error) {
            showErrorToast({ message: error });
        }
    }

    function getFormData(isRemoved, isActive) {
        console.log("[CEAddJADetails] >> [getFormData]");

        return {
            name: applicantName,
            idType: idTypeValue,
            idNumber,
            relationship: relationshipValue,
            mobileNumber,
            propertyId: propertyDetails?.propertyDetails?.property_id,
            propertyName:
                propertyDetails?.propertyName ?? route?.params?.propertyDetails?.property_name,
            propertyPrice:
                propertyDetails?.propertyPrice ?? route?.params?.savedData?.propertyPriceRaw,
            downPaymentAmount:
                propertyDetails?.downPaymentAmount ??
                route?.params?.savedData?.downPaymentAmountRaw,
            downPaymentPercent:
                propertyDetails?.downPaymentPercent ?? route?.params?.savedData?.downPaymentPercent,
            monthlyInstalment:
                propertyDetails?.eligibilityResult?.installmentAmount ??
                route?.params?.savedData?.monthlyInstalmentRaw,
            loanAmount: propertyDetails?.loanAmount ?? route?.params?.savedData?.loanAmountRaw,
            grossIncome: propertyDetails?.grossIncome,
            tenure: propertyDetails?.tenure ?? route?.params?.savedData?.tenure,
            unitId: propertyDetails?.unitId ?? route?.params?.savedData?.unitId,
            progressStatus: PROP_ELG_INPUT,
            unitTypeName: route?.params?.unitTypeName ?? route?.params?.savedData?.unitTypeName,
            saveData: "N",
            isActive,
            isAccepted: null,
            isRemoved,
            currentScreenName: "JA_VIEW",
        };
    }

    function validateForSelfCustomorID(idNumber, idTypeValue, isSelfCustomerId) {
        const { isValid: idNumberValid, message: idNumberErrorMsg } = validateJAIDNumber(
            idNumber,
            idTypeValue,
            isSelfCustomerId
        );
        if (!idNumberValid) {
            dispatch({
                actionType: "SET_ID_NUMBER_ERROR",
                payload: { idNumberValid, idNumberErrorMsg },
            });
        }
    }

    async function onNotifyJAPopupConfirm() {
        console.log("[CEAddJADetails] >> [onNotifyJAPopupConfirm]");

        // close popup
        closeNotifyJAPopup();
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");

        // Request object
        const params = {
            syncId: encSyncId,
            stpId: navParams?.stpId ?? "",
        };

        // Call api to send notification - MAE will send notification to Joint applicant
        await sendPushNotificationToInviteJA(params);

        // Navigate to Joint Applicant notify screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_NOTIFY_RESULT,
            params: { ...navParams },
        });
    }

    function onNotifyJAPopupCancel() {
        console.log("[CEAddJADetails] >> [onNotifyJAPopupCancel]");

        // close popup
        closeNotifyJAPopup();
    }

    function closeNotifyJAPopup() {
        console.log("[CEAddJADetails] >> [closeExitPopup]");

        setShowNotifyJAPopup(false);
    }
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_ADDJA_JOINTAPPLICANTDETAILS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
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
                            style={styles.scrollViewCls}
                        >
                            {/* Add joint applicant */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={ADDJOINT_APPLICANT}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.headerText}
                                text={ENTER_YOUR_JOINT_APPLICANT_DETAILS}
                                textAlign="left"
                            />
                            {/* Name */}
                            <View style={styles.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Name" />
                                <LongTextInput
                                    minLength={3}
                                    maxLength={150}
                                    isValidate
                                    isValid={state.applicantNameValid}
                                    errorMessage={state.applicantNameErrorMsg}
                                    value={state.applicantName}
                                    placeholder={ASB_ADD_GUARANTOR_FULL_NAME_PLACEHOLDER}
                                    numberOfLines={2}
                                    onChangeText={onNameChange}
                                    onFocus={onNameFocus}
                                />
                            </View>

                            {/* ID type */}
                            <LabeledDropdown
                                label="ID type"
                                dropdownValue={state.idType}
                                onPress={onIDTypeTap}
                                style={styles.fieldViewCls}
                            />

                            {/* ID number */}
                            <View style={styles.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="ID number" />
                                <LongTextInput
                                    minLength={4}
                                    maxLength={20}
                                    isValidate
                                    isValid={state.idNumberValid}
                                    errorMessage={state.idNumberErrorMsg}
                                    value={state.idNumber}
                                    placeholder={JA_ID_NUMBER_PLACEHOLDER}
                                    numberOfLines={1}
                                    onChangeText={onIDNumberChange}
                                    onFocus={onIDNumberFocus}
                                />
                                {!!idNumberError && (
                                    <Typo text={idNumberError} style={styles.errorMessage} />
                                )}
                            </View>

                            {/* Relationship */}
                            <LabeledDropdown
                                label="Relationship"
                                dropdownValue={state.relationship}
                                onPress={onRelatioshipTap}
                                style={styles.fieldViewCls}
                            />

                            {/* Mobile number */}
                            <View style={styles.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text="Mobile number" />
                                <LongTextInput
                                    maxLength={14}
                                    isValidate
                                    isValid={state.mobileNumberValid}
                                    errorMessage={state.mobileNumberErrorMsg}
                                    value={state.mobileNumber}
                                    placeholder={JA_MOBILE_NUMBER_PLACEHOLDER}
                                    keyboardType="numeric"
                                    blurOnSubmit
                                    returnKeyType="done"
                                    onChangeText={onMobileNumberChange}
                                    onFocus={onMobileNumberFocus}
                                />
                            </View>

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={styles.bottomSpacer} />
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
                                        text={INVITE_JOINT_APPLICANT}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            {/* ID type Picker */}
            {state.idTypeData && (
                <ScrollPickerView
                    showMenu={state.idTypePicker}
                    list={state.idTypeData}
                    selectedIndex={state.idTypeValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Relationship Picker */}
            {state.relationshipData && (
                <ScrollPickerView
                    showMenu={state.relationshipPicker}
                    list={state.relationshipData}
                    selectedIndex={state.relationshipValueIndex}
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

            {/* Notify Joint Applicant popup */}
            <Popup
                visible={showNotifyJAPopup}
                title={NO_NOTIFY_JOINTAPPLICANT_TITLE}
                description={NO_NOTIFY_JOINTAPPLICANT_DESC}
                onClose={closeNotifyJAPopup}
                primaryAction={{
                    text: CONFIRM,
                    onPress: onNotifyJAPopupConfirm,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onNotifyJAPopupCancel,
                }}
            />
        </>
    );
}

CEAddJADetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomSpacer: {
        marginTop: 75,
    },

    errorMessage: {
        color: RED_ERROR,
        fontSize: 12,
        paddingTop: 5,
        textAlign: "left",
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

export default CEAddJADetails;

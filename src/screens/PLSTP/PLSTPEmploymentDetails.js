import React, { useReducer, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { prequalCheck2 } from "@screens/PLSTP/PLSTPController";
import { validateEmploymentDetails } from "@screens/PLSTP/PLSTPValidation";

import {
    PLSTP_EMPLOYMENT_ADDRESS,
    PLSTP_PREQUAL2_FAIL,
    PLSTP_PERSONAL_DETAILS,
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

import { saveEmploymentData } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    STEP_6,
    PLSTP_EMPLOYER_TITLE,
    PLSTP_EMPLOYER_NAME,
    PLSTP_EMPLOYER_NAME_PH,
    PLSTP_OCCUPATION,
    PLSTP_EMPLOYMENT_TYPE,
    PLSTP_SECTOR,
    PLSTP_BUSINESS_CLASSIFICATION,
    PLSTP_SERVICE_YEARS,
    PLSTP_SERVICE_MONTHS,
    PLSTP_EMPLOYMENT_TERMS,
    PLSTP_SAVE_NEXT,
    DONE,
    CANCEL,
    PLEASE_SELECT,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

// Initial state object
const initialState = {
    //Eployer Name
    employerName: "",
    employerValid: true,
    employerErrorMsg: "",
    employerEditable: true,

    // Occupation
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationValid: true,
    occupationErrorMsg: "",
    occupationData: null,
    occupationKeyVal: null,
    occupationPicker: false,
    occupationPickerIndex: 0,

    // Employemnt Type
    employmentType: PLEASE_SELECT,
    employmentTypeValue: null,
    employmentTypeValid: true,
    employmentTypeErrorMsg: "",
    employmentTypeData: null,
    employmentTypeKeyVal: null,
    employmentTypePicker: false,
    employmentTypePickerIndex: 0,

    // Sector
    sector: PLEASE_SELECT,
    sectorValue: null,
    sectorValid: true,
    sectorErrorMsg: "",
    sectorData: null,
    sectorKeyVal: null,
    sectorPicker: false,
    sectorPickerIndex: 0,

    // Business Classification
    businessClassification: PLEASE_SELECT,
    businessClassificationValue: null,
    businessClassificationValid: true,
    businessClassificationErrorMsg: "",
    businessClassificationData: null,
    businessClassificationKeyVal: null,
    businessClassificationPicker: false,
    businessClassificationPickerIndex: 0,

    // Length of service Years
    lengthOfServiceYear: PLEASE_SELECT,
    lengthOfServiceYearValue: null,
    lengthOfServiceYearValid: true,
    lengthOfServiceYearErrorMsg: "",
    lengthOfServiceYearData: null,
    lengthOfServiceYearKeyVal: null,
    lengthOfServiceYearPicker: false,
    lengthOfServiceYearPickerIndex: 0,

    // Length of service Months
    lengthOfServiceMonth: PLEASE_SELECT,
    lengthOfServiceMonthValue: null,
    lengthOfServiceMonthValid: true,
    lengthOfServiceMonthErrorMsg: "",
    lengthOfServiceMonthData: null,
    lengthOfServiceMonthKeyVal: null,
    lengthOfServiceMonthPicker: false,
    lengthOfServiceMonthPickerIndex: 0,

    // Terms of Employment
    termOfEmployment: PLEASE_SELECT,
    termOfEmploymentValue: null,
    termOfEmploymentValid: true,
    termOfEmploymentErrorMsg: "",
    termOfEmploymentData: null,
    termOfEmploymentKeyVal: null,
    termOfEmploymentPicker: false,
    termOfEmploymentPickerIndex: 0,

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                occupationData: payload?.occupation ?? state.occupationData,
                sectorData: payload?.occupationSector ?? state.sectorData,
                employmentTypeData: payload?.employmentType ?? state.employmentTypeData,
                businessClassificationData:
                    payload?.businessClassification ?? state.businessClassificationData,
                lengthOfServiceYearData:
                    payload?.lengthOfServiceYear ?? state.lengthOfServiceYearData,
                lengthOfServiceMonthData:
                    payload?.lengthOfServiceMonth ?? state.lengthOfServiceMonthData,
                termOfEmploymentData: payload?.termOfEmployment ?? state.termOfEmploymentData,
            };

        case "employerName":
            return {
                ...state,
                employerName: payload.employerName,
            };
        case "employerNameValid":
            return {
                ...state,
                employerValid: payload?.valid,
                employerErrorMsg: payload?.errorMsg,
            };
        case "occupationPicker":
            return {
                ...state,
                occupationPicker: payload,
                pickerType: payload && "occupation",
            };
        case "occupation":
            return {
                ...state,
                occupation: payload?.name ?? PLEASE_SELECT,
                occupationValue: payload?.id ?? null,
                occupationPickerIndex: payload?.index ?? 0,
            };
        case "employmentTypePicker":
            return {
                ...state,
                employmentTypePicker: payload,
                pickerType: payload && "employmentType",
            };
        case "employmentType":
            return {
                ...state,
                employmentType: payload?.name ?? PLEASE_SELECT,
                employmentTypeValue: payload?.id ?? null,
                employmentTypePickerIndex: payload?.index ?? 0,
            };
        case "sectorPicker":
            return {
                ...state,
                sectorPicker: payload,
                pickerType: payload && "sector",
            };
        case "sector":
            return {
                ...state,
                sector: payload?.name ?? PLEASE_SELECT,
                sectorValue: payload?.id ?? null,
                sectorPickerIndex: payload?.index ?? 0,
            };
        case "businessClassificationPicker":
            return {
                ...state,
                businessClassificationPicker: payload,
                pickerType: payload && "businessClassification",
            };
        case "businessClassification":
            return {
                ...state,
                businessClassification: payload?.name ?? PLEASE_SELECT,
                businessClassificationValue: payload?.id ?? null,
                businessClassificationPickerIndex: payload?.index ?? 0,
            };
        case "lengthOfServiceYearPicker":
            return {
                ...state,
                lengthOfServiceYearPicker: payload,
                pickerType: payload && "serviceYears",
            };
        case "serviceYears":
            return {
                ...state,
                lengthOfServiceYear: payload?.name ?? PLEASE_SELECT,
                lengthOfServiceYearValue: payload?.id ?? null,
                lengthOfServiceYearPickerIndex: payload?.index ?? 0,
            };
        case "lengthOfServiceMonthPicker":
            return {
                ...state,
                lengthOfServiceMonthPicker: payload,
                pickerType: payload && "serviceMonths",
            };
        case "serviceMonths":
            return {
                ...state,
                lengthOfServiceMonth: payload?.name ?? PLEASE_SELECT,
                lengthOfServiceMonthValue: payload?.id ?? null,
                lengthOfServiceMonthPickerIndex: payload?.index ?? 0,
            };
        case "termOfEmploymentPicker":
            return {
                ...state,
                termOfEmploymentPicker: payload,
                pickerType: payload && "termOfEmployment",
            };
        case "termOfEmployment":
            return {
                ...state,
                termOfEmployment: payload?.name ?? PLEASE_SELECT,
                termOfEmploymentValue: payload?.id ?? null,
                termOfEmploymentPickerIndex: payload?.index ?? 0,
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

function PLSTPEmploymentDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { initParams } = route?.params;
    const { masterData, customerInfo, stpRefNum, gcifData } = initParams;
    const [clearErr, SetClearErr] = useState("");

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPEmploymentDetails] >> [Form Fields Updated]");
        const {
            employerName,
            occupation,
            employmentType,
            sector,
            businessClassification,
            lengthOfServiceYear,
            lengthOfServiceMonth,
            termOfEmployment,
        } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                employerName === "" ||
                occupation === PLEASE_SELECT ||
                employmentType === PLEASE_SELECT ||
                sector === PLEASE_SELECT ||
                businessClassification === PLEASE_SELECT ||
                lengthOfServiceYear === PLEASE_SELECT ||
                lengthOfServiceMonth === PLEASE_SELECT ||
                termOfEmployment === PLEASE_SELECT,
        });
    }, [
        state.employerName,
        state.occupation,
        state.employmentType,
        state.sector,
        state.businessClassification,
        state.lengthOfServiceYear,
        state.lengthOfServiceMonth,
        state.termOfEmployment,
    ]);

    const init = () => {
        console.log("[PLSTPEmploymentDetails] >> [init]");

        const {
            occupationKeyVal,
            employmentTypeKeyVal,
            occupationSectorKeyVal,
            businessClassificationKeyVal,
            lengthOfServiceYearKeyVal,
            lengthOfServiceMonthKeyVal,
            termOfEmploymentKeyVal,
        } = masterData;
        // const { emailAddress, mobileNum, addressLine1, addressLine2, homeCity, postCode} = gcifData;
        let employerData;
        if (customerInfo?.employerName) {
            employerData = customerInfo;
        } else {
            Object.assign(customerInfo, {
                employerName: gcifData?.employerName,
                occupation: gcifData?.occupation?.type,
                occupationValue: gcifData?.occupation?.id,
                sector: gcifData?.sector?.type,
                sectorValue: gcifData?.sector?.id,
                employmentType: gcifData?.employmentType?.type,
                employmentTypeValue: gcifData?.employmentType?.id,
                businessClassification: gcifData?.businessClassification?.type,
                businessClassificationValue: gcifData?.businessClassification?.id,
                lengthOfServiceYear: gcifData?.lengthOfServiceYear?.type,
                lengthOfServiceYearValue: gcifData?.lengthOfServiceYear?.id,
                lengthOfServiceMonth: gcifData?.lengthOfServiceMonth?.type,
                lengthOfServiceMonthValue: gcifData?.lengthOfServiceMonth?.id,
                termOfEmployment: gcifData?.termOfEmployment?.type,
                termOfEmploymentValue: gcifData?.termOfEmployment?.id,
            });
            employerData = customerInfo;
        }
        const {
            employerName,
            occupationValue,
            sectorValue,
            employmentTypeValue,
            businessClassificationValue,
            lengthOfServiceYearValue,
            lengthOfServiceMonthValue,
            termOfEmploymentValue,
        } = employerData;
        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: masterData });

        // Pre-populate field values if any existing and mask the data
        if (employerName)
            dispatch({
                actionType: "employerName",
                payload: {
                    employerName,
                },
            });

        if (occupationValue)
            dispatch({
                actionType: "occupation",
                payload: {
                    name: occupationKeyVal[occupationValue],
                    id: occupationValue,
                },
            });

        if (employmentTypeValue)
            dispatch({
                actionType: "employmentType",
                payload: {
                    name: employmentTypeKeyVal[employmentTypeValue],
                    id: employmentTypeValue,
                },
            });

        if (sectorValue)
            dispatch({
                actionType: "sector",
                payload: {
                    name: occupationSectorKeyVal[sectorValue],
                    id: sectorValue,
                },
            });

        if (businessClassificationValue)
            dispatch({
                actionType: "businessClassification",
                payload: {
                    name: businessClassificationKeyVal[businessClassificationValue],
                    id: businessClassificationValue,
                },
            });

        if (lengthOfServiceYearValue)
            dispatch({
                actionType: "serviceYears",
                payload: {
                    name: lengthOfServiceYearKeyVal[lengthOfServiceYearValue],
                    id: lengthOfServiceYearValue,
                },
            });

        if (lengthOfServiceMonthValue)
            dispatch({
                actionType: "serviceMonths",
                payload: {
                    name: lengthOfServiceMonthKeyVal[lengthOfServiceMonthValue],
                    id: lengthOfServiceMonthValue,
                },
            });

        if (termOfEmploymentValue)
            dispatch({
                actionType: "termOfEmployment",
                payload: {
                    name: termOfEmploymentKeyVal[termOfEmploymentValue],
                    id: termOfEmploymentValue,
                },
            });
    };

    // Actions
    const onoccupationFieldTap = () => {
        dispatch({
            actionType: "occupationPicker",
            payload: true,
        });
    };

    const onemploymentTypeFieldTap = () => {
        dispatch({
            actionType: "employmentTypePicker",
            payload: true,
        });
    };

    const onsectorFieldTap = () => {
        dispatch({
            actionType: "sectorPicker",
            payload: true,
        });
    };

    const onbusinessClassificationTap = () => {
        dispatch({
            actionType: "businessClassificationPicker",
            payload: true,
        });
    };

    const onlengthOfServiceYearTap = () => {
        dispatch({
            actionType: "lengthOfServiceYearPicker",
            payload: true,
        });
    };

    const onlengthOfServiceMonthTap = () => {
        dispatch({
            actionType: "lengthOfServiceMonthPicker",
            payload: true,
        });
    };

    const ontermOfEmploymentTap = () => {
        dispatch({
            actionType: "termOfEmploymentPicker",
            payload: true,
        });
    };

    const onEmployerNameChange = (value) => {
        console.log("[PLSTPEmploymentDetails] >> [onEmployerNameChange]");

        dispatch({
            actionType: "employerName",
            payload: {
                employerName: value,
            },
        });
    };

    const onPickerDone = (item, selectedIndex) => {
        item.index = selectedIndex;
        dispatch({ actionType: state.pickerType, payload: item });
        // Close picker
        onPickerCancel();
    };

    const onPickerCancel = () => {
        switch (state.pickerType) {
            case "occupation":
                dispatch({
                    actionType: "occupationPicker",
                    payload: false,
                });
                break;
            case "employmentType":
                dispatch({
                    actionType: "employmentTypePicker",
                    payload: false,
                });
                break;
            case "sector":
                dispatch({
                    actionType: "sectorPicker",
                    payload: false,
                });
                break;
            case "businessClassification":
                dispatch({
                    actionType: "businessClassificationPicker",
                    payload: false,
                });
                break;
            case "serviceYears":
                dispatch({
                    actionType: "lengthOfServiceYearPicker",
                    payload: false,
                });
                break;
            case "serviceMonths":
                dispatch({
                    actionType: "lengthOfServiceMonthPicker",
                    payload: false,
                });
                break;
            case "termOfEmployment":
                dispatch({
                    actionType: "termOfEmploymentPicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    };

    const onDoneTap = async () => {
        console.log("[PLSTPEmploymentDetails] >> [onDoneTap]");

        // Return if button is disabled
        if (state.isContinueDisabled) return;

        if (clearErr) {
            dispatch({
                actionType: clearErr,
                payload: { valid: true, errorMsg: "" },
            });
        }

        const validateResult = { isValid: false, message: "", actionType: "" };
        const employmentData = getFormData();
        Object.assign(validateResult, validateEmploymentDetails(employmentData, {}));
        dispatch({
            actionType: validateResult.actionType,
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        SetClearErr(validateResult.actionType);
        if (!validateResult.isValid) return;

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_6",
        });
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
                    navToNextScreen(employmentData, initData);
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
                    navToNextScreen(employmentData, initData);
                    break;
                case 701:
                case 408:
                    navToNextScreen(employmentData, initData);
                    break;
                default:
                    showErrorToast({
                        message: response?.data?.message,
                    });
                    break;
            }
        } else {
            navToNextScreen(employmentData, initData);
        }
    };

    const navToNextScreen = (employmentData, initData) => {
        const {
            employerName,
            occupation,
            occupationValue,
            employmentType,
            employmentTypeValue,
            sector,
            sectorValue,
            businessClassification,
            businessClassificationValue,
            lengthOfServiceYear,
            lengthOfServiceYearValue,
            lengthOfServiceMonth,
            lengthOfServiceMonthValue,
            termOfEmployment,
            termOfEmploymentValue,
        } = employmentData;
        const data = {
            employerName,
            occupation: {
                id: occupationValue,
                type: occupation,
            },
            employmentType: {
                id: employmentTypeValue,
                type: employmentType,
            },
            sector: {
                id: sectorValue,
                type: sector,
            },
            businessClassification: {
                id: businessClassificationValue,
                type: businessClassification,
            },
            lengthOfServiceYear: {
                id: lengthOfServiceYearValue,
                type: lengthOfServiceYear,
            },
            lengthOfServiceMonth: {
                id: lengthOfServiceMonthValue,
                type: lengthOfServiceMonth,
            },
            termOfEmployment: {
                id: termOfEmploymentValue,
                type: termOfEmployment,
            },
            stpRefNo: stpRefNum,
        };
        saveEmploymentData(data)
            .then((result) => {
                // Navigate to Next screen (ScreenName : PLSTP_REPAYMENT_DETAILS)

                if (result?.data?.code === 200) {
                    const custData = Object.assign(customerInfo, employmentData);
                    initData = { ...initData, customerInfo: custData };
                    console.log("employment details initData", initData);
                    navigation.navigate(PLSTP_EMPLOYMENT_ADDRESS, {
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
                console.log("[PLSTPEmploymentDetails][onDoneTap] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    const onBackTap = () => {
        console.log("[PLSTPEmploymentDetails] >> [onBackTap]");
        navigation.navigate(PLSTP_PERSONAL_DETAILS, {
            ...route.params,
        });
    };

    const onCloseTap = () => {
        console.log("[PLSTPEmploymentDetails] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    const getFormData = () => {
        console.log("[PLSTPEmploymentDetails] >> [getFormData]");

        return {
            employerName: state.employerName.trim(),
            occupation: state.occupation,
            occupationValue: state.occupationValue,
            employmentType: state.employmentType,
            employmentTypeValue: state.employmentTypeValue,
            sector: state.sector,
            sectorValue: state.sectorValue,
            businessClassification: state.businessClassification,
            businessClassificationValue: state.businessClassificationValue,
            lengthOfServiceYear: state.lengthOfServiceYear,
            lengthOfServiceYearValue: state.lengthOfServiceYearValue,
            lengthOfServiceMonth: state.lengthOfServiceMonth,
            lengthOfServiceMonthValue: state.lengthOfServiceMonthValue,
            termOfEmployment: state.termOfEmployment,
            termOfEmploymentValue: state.termOfEmploymentValue,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_6">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_6}
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
                                    {/* Screen Title */}
                                    <Typo
                                        fontSize={20}
                                        lineHeight={30}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={PLSTP_EMPLOYER_TITLE}
                                        style={Style.headerLabelCls}
                                    />

                                    {/* Employer Name */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            lineHeight={18}
                                            textAlign="left"
                                            text={PLSTP_EMPLOYER_NAME}
                                        />
                                        <LongTextInput
                                            maxLength={40}
                                            isValid={state.employerValid}
                                            isValidate
                                            errorMessage={state.employerErrorMsg}
                                            numberOfLines={2}
                                            autoCapitalize="none"
                                            value={state.employerName}
                                            placeholder={PLSTP_EMPLOYER_NAME_PH}
                                            onChangeText={onEmployerNameChange}
                                        />
                                    </View>

                                    {/* occupation Status */}
                                    <LabeledDropdown
                                        label={PLSTP_OCCUPATION}
                                        dropdownValue={state.occupation}
                                        isValid={state.occupationValid}
                                        errorMessage={state.occupationErrorMsg}
                                        onPress={onoccupationFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* employmentType */}
                                    <LabeledDropdown
                                        label={PLSTP_EMPLOYMENT_TYPE}
                                        dropdownValue={state.employmentType}
                                        isValid={state.employmentTypeValid}
                                        errorMessage={state.employmentTypeErrorMsg}
                                        onPress={onemploymentTypeFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* sector Status */}
                                    <LabeledDropdown
                                        label={PLSTP_SECTOR}
                                        dropdownValue={state.sector}
                                        isValid={state.sectorValid}
                                        errorMessage={state.sectorErrorMsg}
                                        onPress={onsectorFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Business Classification */}
                                    <LabeledDropdown
                                        label={PLSTP_BUSINESS_CLASSIFICATION}
                                        dropdownValue={state.businessClassification}
                                        isValid={state.businessClassificationValid}
                                        errorMessage={state.businessClassificationErrorMsg}
                                        onPress={onbusinessClassificationTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Length of service Years */}
                                    <LabeledDropdown
                                        label={PLSTP_SERVICE_YEARS}
                                        dropdownValue={state.lengthOfServiceYear}
                                        isValid={state.lengthOfServiceYearValid}
                                        errorMessage={state.lengthOfServiceYearErrorMsg}
                                        onPress={onlengthOfServiceYearTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Length of service months */}
                                    <LabeledDropdown
                                        label={PLSTP_SERVICE_MONTHS}
                                        dropdownValue={state.lengthOfServiceMonth}
                                        isValid={state.lengthOfServiceMonthValid}
                                        errorMessage={state.lengthOfServiceMonthErrorMsg}
                                        onPress={onlengthOfServiceMonthTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Terms of employment */}
                                    <LabeledDropdown
                                        label={PLSTP_EMPLOYMENT_TERMS}
                                        dropdownValue={state.termOfEmployment}
                                        isValid={state.termOfEmploymentValid}
                                        errorMessage={state.termOfEmploymentErrorMsg}
                                        onPress={ontermOfEmploymentTap}
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
            {/* occupation status Picker */}
            {state.occupationData && (
                <ScrollPickerView
                    showMenu={state.occupationPicker}
                    selectedIndex={state.occupationPickerIndex}
                    list={state.occupationData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* employmentType Picker */}
            {state.employmentTypeData && (
                <ScrollPickerView
                    showMenu={state.employmentTypePicker}
                    selectedIndex={state.employmentTypePickerIndex}
                    list={state.employmentTypeData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* sector Picker */}
            {state.sectorData && (
                <ScrollPickerView
                    showMenu={state.sectorPicker}
                    selectedIndex={state.sectorPickerIndex}
                    list={state.sectorData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* business classification Picker */}
            {state.businessClassificationData && (
                <ScrollPickerView
                    showMenu={state.businessClassificationPicker}
                    selectedIndex={state.businessClassificationPickerIndex}
                    list={state.businessClassificationData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Length of service years picker */}
            {state.lengthOfServiceYearData && (
                <ScrollPickerView
                    showMenu={state.lengthOfServiceYearPicker}
                    selectedIndex={state.lengthOfServiceYearPickerIndex}
                    list={state.lengthOfServiceYearData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Length of service months picker */}
            {state.lengthOfServiceMonthData && (
                <ScrollPickerView
                    showMenu={state.lengthOfServiceMonthPicker}
                    selectedIndex={state.lengthOfServiceMonthPickerIndex}
                    list={state.lengthOfServiceMonthData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Terms of employment picker */}
            {state.termOfEmploymentData && (
                <ScrollPickerView
                    showMenu={state.termOfEmploymentPicker}
                    selectedIndex={state.termOfEmploymentPickerIndex}
                    list={state.termOfEmploymentData}
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

export default PLSTPEmploymentDetails;

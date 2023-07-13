import React, { useReducer, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import { ScrollPickerView, LongTextInput } from "@components/Common";

import { YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import {
    MAE_REQUESTCARD,
    DONE,
    PLEASE_SELECT,
    STEPUP_MAE_EMPLOYEE,
    STEPUP_MAE_EMPLOYER_NAME,
    STEPUP_MAE_MONTHLY_INCOME,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    CANCEL,
} from "@constants/strings";
import { validateEmpName } from "./CardManagementController";
import { MAE_CARD_PEP } from "@navigation/navigationConstant";

// Initial state object
const initialState = {
    // Employee Type related
    empType: PLEASE_SELECT,
    empTypeValue: null,
    empTypeValid: true,
    empTypeErrorMsg: "",
    empTypeData: null,
    empTypeKeyVal: null,
    empTypePicker: false,

    // Employer Namer related
    empName: "",
    empNameValid: true,
    empNameErrorMsg: "",

    // Monthly Income related
    monthInc: PLEASE_SELECT,
    monthIncValue: null,
    monthIncValid: true,
    monthIncErrorMsg: "",
    monthIncData: null,
    monthIncKeyVal: null,
    monthIncPicker: false,

    // Occupation related
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationValid: true,
    occupationErrorMsg: "",
    occupationData: null,
    occupationKeyVal: null,
    occupationPicker: null,

    // Sector related
    sector: PLEASE_SELECT,
    sectorValue: null,
    sectorValid: true,
    sectorErrorMsg: "",
    sectorData: null,
    sectorKeyVal: null,
    sectorPicker: null,

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                empTypeData: payload?.masterData?.employmentType ?? state.empTypeData,
                monthIncData: payload?.masterData?.incomeRange ?? state.monthIncData,
                occupationData: payload?.masterData?.occupation ?? state.occupationData,
                sectorData: payload?.masterData?.sector ?? state.sectorData,
            };
        case "empTypePicker":
            return {
                ...state,
                empTypePicker: payload,
                pickerType: payload ? "empType" : null,
            };
        case "monthIncPicker":
            return {
                ...state,
                monthIncPicker: payload,
                pickerType: payload ? "monthInc" : null,
            };
        case "occupationPicker":
            return {
                ...state,
                occupationPicker: payload,
                pickerType: payload ? "occupation" : null,
            };
        case "sectorPicker":
            return {
                ...state,
                sectorPicker: payload,
                pickerType: payload ? "sector" : null,
            };
        case "empName":
            return {
                ...state,
                empName: payload,
            };
        case "empType":
            return {
                ...state,
                empType: payload?.name ?? PLEASE_SELECT,
                empTypeValue: payload?.value ?? null,
            };
        case "monthInc":
            return {
                ...state,
                monthInc: payload?.name ?? PLEASE_SELECT,
                monthIncValue: payload?.value ?? null,
            };
        case "occupation":
            return {
                ...state,
                occupation: payload?.name ?? PLEASE_SELECT,
                occupationValue: payload?.value ?? null,
            };
        case "sector":
            return {
                ...state,
                sector: payload?.name ?? PLEASE_SELECT,
                sectorValue: payload?.value ?? null,
            };
        case "empNameValid":
            return {
                ...state,
                empNameValid: payload?.valid,
                empNameErrorMsg: payload?.errorMsg,
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

function MAECardEmployment({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[MAECardEmployment] >> [Form Fields Updated]");
        const { empName } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                empName.trim() === "" ||
                state.empType === PLEASE_SELECT ||
                state.monthInc === PLEASE_SELECT ||
                state.occupation === PLEASE_SELECT ||
                state.sector === PLEASE_SELECT,
        });
    }, [state.empName, state.empType, state.monthInc, state.occupation, state.sector]);

    const init = () => {
        console.log("[MAECardEmployment] >> [init]");

        const params = route?.params ?? {};
        const gcifData = params?.gcifData ?? {};
        const masterData = params?.masterData ?? {};
        const { empType, empName, monthInc, occupation, sector } = gcifData;
        const { empTypeKeyVal, monthlyIncomeKeyVal, occupationKeyVal, sectorKeyVal } = masterData;

        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: params });

        // Pre-populate field values if any existing
        if (empName) dispatch({ actionType: "empName", payload: empName });

        if (empType)
            dispatch({
                actionType: "empType",
                payload: { name: empTypeKeyVal[empType], value: empType },
            });

        if (monthInc)
            dispatch({
                actionType: "monthInc",
                payload: { name: monthlyIncomeKeyVal[monthInc], value: monthInc },
            });

        if (occupation)
            dispatch({
                actionType: "occupation",
                payload: { name: occupationKeyVal[occupation], value: occupation },
            });

        if (sector)
            dispatch({
                actionType: "sector",
                payload: { name: sectorKeyVal[sector], value: sector },
            });
    };

    const onEmpTypeFieldTap = () => {
        console.log("[MAECardEmployment] >> [onEmpTypeFieldTap]");

        dispatch({
            actionType: "empTypePicker",
            payload: true,
        });
    };

    const onMonthlyIncomeFieldTap = () => {
        console.log("[MAECardEmployment] >> [onMonthlyIncomeFieldTap]");

        dispatch({
            actionType: "monthIncPicker",
            payload: true,
        });
    };

    const onOccupationFieldTap = () => {
        console.log("[MAECardEmployment] >> [onOccupationFieldTap]");

        dispatch({
            actionType: "occupationPicker",
            payload: true,
        });
    };

    const onSectorFieldTap = () => {
        console.log("[MAECardEmployment] >> [onSectorFieldTap]");

        dispatch({
            actionType: "sectorPicker",
            payload: true,
        });
    };

    const onPickerCancel = () => {
        console.log("[MAECardEmployment] >> [onPickerCancel]");

        switch (state.pickerType) {
            case "empType":
                dispatch({
                    actionType: "empTypePicker",
                    payload: false,
                });
                break;
            case "monthInc":
                dispatch({
                    actionType: "monthIncPicker",
                    payload: false,
                });
                break;
            case "occupation":
                dispatch({
                    actionType: "occupationPicker",
                    payload: false,
                });
                break;
            case "sector":
                dispatch({
                    actionType: "sectorPicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    };

    const onPickerDone = (item) => {
        console.log("[MAECardEmployment] >> [onPickerDone]");

        dispatch({ actionType: state.pickerType, payload: item });

        // Close picker
        onPickerCancel();
    };

    const onEmpNameTextChange = (value) => {
        console.log("[MAECardEmployment] >> [onEmpNameTextChange]");

        dispatch({ actionType: "empName", payload: value });
    };

    const onDoneTap = () => {
        console.log("[MAECardEmployment] >> [onDoneTap]");

        // Return if button is disabled
        if (state.isContinueDisabled) return;

        // Employer Name validation
        const { isValid, message } = validateEmpName(state.empName);
        dispatch({
            actionType: "empNameValid",
            payload: { valid: isValid, errorMsg: message },
        });
        if (!isValid) return;

        // Retrieve form data
        const formData = getFormData();

        // Navigate to PEP screen
        navigation.navigate(MAE_CARD_PEP, {
            ...route.params,
            ...formData,
        });
    };

    const onBackTap = () => {
        console.log("[MAECardEmployment] >> [onBackTap]");

        navigation.goBack();
    };

    const getFormData = () => {
        console.log("[MAECardEmployment] >> [getFormData]");

        return {
            empType: state.empTypeValue,
            employerName: state.empName,
            monthlyIncome: state.monthIncValue,
            occupation: state.occupationValue,
            occupationSector: state.sectorValue,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={MAE_REQUESTCARD}
                                />
                            }
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
                            {/* Fill in your... */}
                            <Typo
                                fontSize={20}
                                lineHeight={28}
                                fontWeight="300"
                                textAlign="left"
                                text="Fill in your employment details."
                                style={Style.headerLabelCls}
                            />

                            {/* Employee Type */}
                            <LabeledDropdown
                                label={STEPUP_MAE_EMPLOYEE}
                                dropdownValue={state.empType}
                                isValid={state.empTypeValid}
                                errorMessage={state.empTypeErrorMsg}
                                onPress={onEmpTypeFieldTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Employer Name */}
                            <View style={Style.fieldViewCls}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={STEPUP_MAE_EMPLOYER_NAME}
                                />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.empNameValid}
                                    errorMessage={state.empNameErrorMsg}
                                    value={state.empName}
                                    placeholder="Enter your employer name"
                                    onChangeText={onEmpNameTextChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Monthly Income */}
                            <LabeledDropdown
                                label={STEPUP_MAE_MONTHLY_INCOME}
                                dropdownValue={state.monthInc}
                                isValid={state.monthIncValid}
                                errorMessage={state.monthIncErrorMsg}
                                onPress={onMonthlyIncomeFieldTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Occupation */}
                            <LabeledDropdown
                                label={STEPUP_MAE_OCUPATION}
                                dropdownValue={state.occupation}
                                isValid={state.occupationValid}
                                errorMessage={state.occupationErrorMsg}
                                onPress={onOccupationFieldTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Sector */}
                            <LabeledDropdown
                                label={STEPUP_MAE_SECTOR}
                                dropdownValue={state.sector}
                                isValid={state.sectorValid}
                                errorMessage={state.sectorErrorMsg}
                                onPress={onSectorFieldTap}
                                style={[Style.fieldViewCls, Style.sectorFieldCls]}
                            />
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
                                            text={DONE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            {/* Emp Type Picker */}
            {state.empTypeData && (
                <ScrollPickerView
                    showMenu={state.empTypePicker}
                    list={state.empTypeData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Monthly Income Picker */}
            {state.monthIncData && (
                <ScrollPickerView
                    showMenu={state.monthIncPicker}
                    list={state.monthIncData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Occupation Picker */}
            {state.occupationData && (
                <ScrollPickerView
                    showMenu={state.occupationPicker}
                    list={state.occupationData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Sector Picker */}
            {state.sectorData && (
                <ScrollPickerView
                    showMenu={state.sectorPicker}
                    list={state.sectorData}
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

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },

    sectorFieldCls: {
        marginBottom: 25,
    },
});

export default MAECardEmployment;

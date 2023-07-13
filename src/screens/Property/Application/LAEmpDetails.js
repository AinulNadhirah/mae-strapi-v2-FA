/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    BANKINGV2_MODULE,
    LA_EMP_DETAILS,
    LA_EMP_ADDRESS,
    LA_CONFIRMATION,
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
import Dropdown from "@components/FormComponents/Dropdown";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED_TEXT, DISABLED, FADE_GREY } from "@constants/colors";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    SAVE_NEXT,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    CONFIRM,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_PROPERTY_APPLY_CONF_EDITEMPLOYMENT_DETAILS,
    FA_PROPERTY_APPLY_EMPLOYMENTDETAILS,
} from "@constants/strings";

import { getExistingData, useResetNavigation } from "../Common/PropertyController";
import { saveLAInput, validateEmpName } from "./LAController";

const YEARS = "Years";
const MONTHS = "Months";

// Initial state object
const initialState = {
    //stepper info
    stepperInfo: "",

    // Occupation related
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationValueIndex: 0,
    occupationData: null,
    occupationPicker: false,
    occupationObj: null,

    // Employer Name related
    empName: "",
    empNameValid: true,
    empNameErrorMsg: "",

    // Sector related
    sector: PLEASE_SELECT,
    sectorValue: null,
    sectorValueIndex: 0,
    sectorData: null,
    sectorPicker: false,
    sectorObj: null,

    // Years related
    years: YEARS,
    yearsValue: null,
    yearsValueIndex: 0,
    yearsData: null,
    yearsPicker: false,
    yearsObj: null,

    // Months related
    months: MONTHS,
    monthsValue: null,
    monthsValueIndex: 0,
    monthsData: null,
    monthsPicker: false,
    monthsObj: null,

    // UI Labels
    headerText: "",
    ctaText: SAVE_NEXT,

    // Others
    hideFields: false,
    showExitPopup: false,
    isContinueDisabled: true,
    pickerType: null,
    editFlow: false,
    loading: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                occupationPicker: false,
                sectorPicker: false,
                yearsPicker: false,
                monthsPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                occupationPicker: payload === "occupation",
                sectorPicker: payload === "sector",
                yearsPicker: payload === "years",
                monthsPicker: payload === "months",
            };
        case "SET_UI_LABELS":
        case "SET_PICKER_DATA":
        case "SET_OCCUPATION":
        case "SET_SECTOR":
        case "SET_YEARS":
        case "SET_MONTHS":
        case "RESET_VALIDATION_ERRORS":
        case "SET_EMP_TYPE_ERROR":
        case "SET_STEPPER_INFO":
            return {
                ...state,
                ...payload,
            };
        case "SET_EMPLOYER_NAME":
            return {
                ...state,
                empName: payload,
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
        case "SET_HIDE_FIELDS":
            return {
                ...state,
                hideFields: payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        default:
            return { ...state };
    }
}

function LAEmpDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const { isContinueDisabled, occupation, empName, sector, years, months, hideFields, editFlow } =
        state;

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const screenName = route.params?.editFlow
            ? FA_PROPERTY_APPLY_CONF_EDITEMPLOYMENT_DETAILS
            : FA_PROPERTY_APPLY_EMPLOYMENTDETAILS;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    }, [route.params?.editFlow]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                empName.trim() === "" ||
                sector === PLEASE_SELECT ||
                years === YEARS ||
                months === MONTHS,
        });
    }, [occupation, empName, sector, years, months, hideFields]);

    useEffect(() => {
        const navParams = route?.params ?? {};

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps ?? 7;
        const newTotalSteps = hideFields ? totalSteps - 1 : totalSteps;

        const stepperInfo =
            currentStep && currentStep <= newTotalSteps
                ? `Step ${currentStep} of ${newTotalSteps}`
                : "";

        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                stepperInfo,
            },
        });
    }, [hideFields]);

    const init = async () => {
        console.log("[LAEmpDetails] >> [init]");

        const yearsDropdownData = getYearData();
        const monthsDropdownData = getMonthData();

        // Populate Picker Data
        setPickerData(yearsDropdownData, monthsDropdownData);

        // Prepopulate any existing details
        prepopulateData(yearsDropdownData, monthsDropdownData);
    };

    const onBackTap = () => {
        console.log("[LAEmpDetails] >> [onBackTap]");

        navigation.goBack();
    };

    const onCloseTap = () => {
        console.log("[LAEmpDetails] >> [onCloseTap]");

        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    };

    const prepopulateData = (yearsDropdownData, monthsDropdownData) => {
        console.log("[LAEmpDetails] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const headerText = navParams?.headerText ?? "";
        const paramsEditFlow = navParams?.editFlow ?? false;

        const { mdmEmpName, mdmSector, savedEmpYears, savedEmpMonths } = getUIData(
            navParams,
            savedData,
            mdmData,
            paramsEditFlow
        );

        // Set Edit Flag
        dispatch({
            actionType: "SET_EDIT_FLAG",
            payload: paramsEditFlow,
        });

        // Set Header Text
        dispatch({
            actionType: "SET_UI_LABELS",
            payload: {
                headerText: paramsEditFlow ? "Edit employment details" : headerText,
                ctaText: paramsEditFlow ? CONFIRM : SAVE_NEXT,
            },
        });

        // Employer Name
        if (mdmEmpName) {
            dispatch({
                actionType: "SET_EMPLOYER_NAME",
                payload: mdmEmpName,
            });
        }

        // Sector
        if (mdmSector) {
            const sectorSelect = getExistingData(mdmSector, masterData?.occupationSector ?? null);
            dispatch({
                actionType: "SET_SECTOR",
                payload: {
                    sector: sectorSelect.name,
                    sectorValue: sectorSelect.value,
                    sectorObj: sectorSelect.obj,
                    sectorValueIndex: sectorSelect.index,
                },
            });
        }

        // Years
        if (savedEmpYears) {
            const yearsSelect = getExistingData(savedEmpYears, yearsDropdownData, YEARS);
            dispatch({
                actionType: "SET_YEARS",
                payload: {
                    years: yearsSelect.name,
                    yearsValue: yearsSelect.value,
                    yearsObj: yearsSelect.obj,
                    yearsValueIndex: yearsSelect.index,
                },
            });
        }

        // Months
        if (savedEmpMonths) {
            const monthsSelect = getExistingData(savedEmpMonths, monthsDropdownData, MONTHS);
            dispatch({
                actionType: "SET_MONTHS",
                payload: {
                    months: monthsSelect.name,
                    monthsValue: monthsSelect.value,
                    monthsObj: monthsSelect.obj,
                    monthsValueIndex: monthsSelect.index,
                },
            });
        }

        setLoading(false);
    };

    function getUIData(navParams, savedData, mdmData, paramsEditFlow) {
        console.log("[LAEmpDetails] >> [getUIData]");

        if (paramsEditFlow) {
            return {
                mdmEmpName: navParams?.employerName,
                mdmSector: navParams?.occupationSector,
                savedEmpYears: navParams?.empYears,
                savedEmpMonths: navParams?.empMonths,
            };
        } else {
            return {
                mdmEmpName: savedData?.employerName ?? mdmData?.employerName,
                mdmSector: savedData?.occupationSector ?? mdmData?.occupationSector,
                savedEmpYears: savedData?.empYears,
                savedEmpMonths: savedData?.empMonths,
            };
        }
    }

    const setPickerData = (yearsDropdownData, monthsDropdownData) => {
        console.log("[LAEmpDetails] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                sectorData: masterData?.occupationSector ?? null,
                yearsData: yearsDropdownData,
                monthsData: monthsDropdownData,
            },
        });
    };

    const onPickerCancel = () => {
        console.log("[LAEmpDetails] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
        console.log("[LAEmpDetails] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "sector":
                dispatch({
                    actionType: "SET_SECTOR",
                    payload: {
                        sector: item?.name ?? PLEASE_SELECT,
                        sectorValue: item?.value ?? null,
                        sectorObj: item,
                        sectorValueIndex: index,
                    },
                });
                break;
            case "years":
                dispatch({
                    actionType: "SET_YEARS",
                    payload: {
                        years: item?.name ?? YEARS,
                        yearsValue: item?.value ?? null,
                        yearsObj: item,
                        yearsValueIndex: index,
                    },
                });
                break;
            case "months":
                dispatch({
                    actionType: "SET_MONTHS",
                    payload: {
                        months: item?.name ?? MONTHS,
                        monthsValue: item?.value ?? null,
                        monthsObj: item,
                        monthsValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    const onSectorTap = () => {
        console.log("[LAEmpDetails] >> [onSectorTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "sector",
        });
    };

    const onYearsTap = () => {
        console.log("[LAEmpDetails] >> [onYearsTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "years",
        });
    };

    const onMonthsTap = () => {
        console.log("[LAEmpDetails] >> [onMonthsTap]");

        dispatch({
            actionType: "SHOW_PICKER",
            payload: "months",
        });
    };

    const onEmpNameTextChange = (value) => {
        dispatch({
            actionType: "SET_EMPLOYER_NAME",
            payload: value,
        });
    };

    function getMonthData() {
        const minValue = 0;
        const maxValue = 11;
        const monthData = [];

        for (let i = minValue; i <= maxValue; i++) {
            monthData.push({ name: i === 1 ? `${i} month` : `${i} months`, value: String(i) });
        }

        return monthData;
    }

    function getYearData() {
        const minValue = 0;
        const maxValue = 50;
        const yearData = [];

        for (let i = minValue; i <= maxValue; i++) {
            yearData.push({ name: i === 1 ? `${i} year` : `${i} years`, value: String(i) });
        }

        return yearData;
    }

    async function onExitPopupSave() {
        console.log("[LAEmpDetails] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_EMP_DETAILS,
            formData,
            navParams: route?.params,
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
        console.log("[LAEmpDetails] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAEmpDetails] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    const resetValidationErrors = () => {
        console.log("[LAEmpDetails] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                empNameValid: true,
                empNameErrorMsg: "",
            },
        });
    };

    const validateFormDetails = () => {
        console.log("[LAEmpDetails] >> [validateFormDetails]");

        // Reset existing error state
        resetValidationErrors();

        //if fields are hidden then return true

        if (hideFields) return true;

        // Employer Name
        const { isValid: empNameValid, message: empNameErrorMsg } = validateEmpName(empName);
        if (!empNameValid)
            dispatch({
                actionType: "SET_EMP_TYPE_ERROR",
                payload: { empNameValid, empNameErrorMsg },
            });

        if (!empNameValid) return false;

        // Return true if all validation checks are passed
        return true;
    };

    async function onContinue() {
        console.log("[LAEmpDetails] >> [onContinue]");

        const navParams = route?.params ?? {};

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        setLoading(true);

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps ?? 7;
        const newTotalSteps = hideFields ? totalSteps - 1 : totalSteps;

        // Retrieve form data
        const formData = getFormData();

        if (editFlow) {
            // Navigate to Confirmation screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_CONFIRMATION,
                params: {
                    ...navParams,
                    ...formData,
                    updateData: true,
                    editScreenName: LA_EMP_DETAILS,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            await saveLAInput({
                screenName: LA_EMP_DETAILS,
                formData,
                navParams,
            });

            // Navigate to Employer Address screen
            // If occupation is specific category(Employer Address is not required) then Navigate to Financing Type Screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_EMP_ADDRESS,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep,
                    totalSteps: newTotalSteps,
                },
            });
        }

        setLoading(false);

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_EMPLOYMENTDETAILS,
        });
    }

    const getFormData = () => {
        console.log("[LAEmpDetails] >> [getFormData]");

        const navParams = route?.params ?? {};
        const { sectorValue, yearsValue, monthsValue } = state;
        const employeeName = empName ? empName.trim() : "";

        return {
            ...navParams,
            occupationSector: hideFields ? "" : sectorValue,
            employerName: hideFields ? "" : employeeName,
            empYears: hideFields ? "" : yearsValue,
            empMonths: hideFields ? "" : monthsValue,
        };
    };

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={state.loading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow ? (
                                    <></>
                                ) : (
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
                                text={state.headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            {!editFlow && (
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={Style.headerText}
                                    text="Please review and update your employment details"
                                    textAlign="left"
                                />
                            )}

                            {/* Name of employer */}
                            {!hideFields && (
                                <View>
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Name of employer"
                                        />
                                        <LongTextInput
                                            autoFocus
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.empNameValid}
                                            errorMessage={state.empNameErrorMsg}
                                            value={empName}
                                            placeholder="Enter your employer name"
                                            onChangeText={onEmpNameTextChange}
                                            numberOfLines={2}
                                        />
                                    </View>

                                    {/* Occupation sector */}
                                    <LabeledDropdown
                                        label="Occupation sector"
                                        dropdownValue={sector}
                                        onPress={onSectorTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Work duration */}
                                    <View style={Style.fieldViewCls}>
                                        {/* Label */}
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text="How long have you worked here?"
                                        />

                                        <View style={Style.dateCompInnerView}>
                                            {/* Year */}
                                            <Dropdown
                                                value={state.years}
                                                onPress={onYearsTap}
                                                style={Style.dateCompYear}
                                            />

                                            {/* Month */}
                                            <Dropdown
                                                value={state.months}
                                                onPress={onMonthsTap}
                                                style={Style.dateCompMonth}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}

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
                                        text={state.ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Occupation sector Picker */}
            {state.sectorData && (
                <ScrollPickerView
                    showMenu={state.sectorPicker}
                    list={state.sectorData}
                    selectedIndex={state.sectorValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    expandedMode
                />
            )}

            {/* Years Picker */}
            {state.yearsData && (
                <ScrollPickerView
                    showMenu={state.yearsPicker}
                    list={state.yearsData}
                    selectedIndex={state.yearsValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Months Picker */}
            {state.monthsData && (
                <ScrollPickerView
                    showMenu={state.monthsPicker}
                    list={state.monthsData}
                    selectedIndex={state.monthsValueIndex}
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
                description={LA_EXIT_POPUP_DESC}
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

LAEmpDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomSpacer: {
        marginTop: 60,
    },

    dateCompInnerView: {
        flexDirection: "row",
        marginTop: 10,
    },

    dateCompMonth: {
        flex: 1,
        marginLeft: 10,
    },

    dateCompYear: {
        flex: 1,
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

export default LAEmpDetails;

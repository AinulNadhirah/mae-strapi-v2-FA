/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useReducer } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
    APPLICATION_DETAILS,
    BANKINGV2_MODULE,
    JA_CONFIRMATION,
    JA_EMPLOYMENT_ADDRESS,
    JA_EMPLOYMENT_DETAILS,
    JA_INCOME_COMMITMENT,
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

import { MEDIUM_GREY, YELLOW, BLACK, DISABLED_TEXT, DISABLED, FADE_GREY } from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    SAVE_NEXT,
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    CONFIRM,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_EMPLOYMENTDETAILS,
    EDIT,
    EDIT_EMPLOYMENT_DETAILS,
    SAVE_AND_NEXT,
} from "@constants/strings";

import {
    CARDS_OCCUPATION,
    EMPLOYER_NAME_TEXT,
    EMPLOYMENT_JA_DETAILS,
    JOINT_APPLICATION,
    OCCUPATION_SECTOR,
    PLSTP_EMPLOYER_NAME_PH,
    WORK_PERIOD,
} from "../../../constants/strings";
import {
    fetchGetApplicants,
    fetchJointApplicationDetails,
    validateEmpName,
} from "../Application/LAController";
import { getEncValue, getExistingData, useResetNavigation, isOccupationSpecificCateg } from "../Common/PropertyController";
import { saveJAInput } from "./JAController";

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
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
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

function JAEmploymentDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [resetToApplication] = useResetNavigation(navigation);

    const {
        isContinueDisabled,
        occupation,
        empName,
        sector,
        years,
        months,
        hideFields,
        editFlow,
        loading,
    } = state;

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        let isValidation = false;
        if (hideFields) {
            isValidation = occupation === PLEASE_SELECT;
        } else {
            isValidation =
                occupation === PLEASE_SELECT ||
                empName.trim() === "" ||
                sector === PLEASE_SELECT ||
                years === YEARS ||
                months === MONTHS;
        }
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: isValidation,
        });
    }, [occupation, empName, sector, years, months, hideFields]);

    useEffect(() => {
        // set stepper info
        const currentStep = 3;
        const totalSteps = hideFields ? 4 : 5;
        const stepperInfo =
            currentStep && currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : "";

        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                stepperInfo,
            },
        });
    }, [hideFields]);

    const init = async () => {
        const yearsDropdownData = getYearData();
        const monthsDropdownData = getMonthData();

        // Populate Picker Data
        setPickerData(yearsDropdownData, monthsDropdownData);

        // Prepopulate any existing details
        prepopulateData(yearsDropdownData, monthsDropdownData);
        setLoading(false);
    };

    const onBackTap = () => {
        navigation.goBack();
    };

    const onCloseTap = async () => {
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }
        // Show Exit Popup
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: true,
        });
    };

    const prepopulateData = (yearsDropdownData, monthsDropdownData) => {
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const headerText = navParams?.headerText ?? "";
        const paramsEditFlow = navParams?.editFlow ?? false;

        const { mdmOccupation, mdmEmpName, mdmSector, savedEmpYears, savedEmpMonths } = getUIData(
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

        // Occupation
        if (mdmOccupation) {
            const occupationSelect = getExistingData(mdmOccupation, masterData?.occupation ?? null);
            dispatch({
                actionType: "SET_OCCUPATION",
                payload: {
                    occupation: occupationSelect.name,
                    occupationValue: occupationSelect.value,
                    occupationObj: occupationSelect.obj,
                    occupationValueIndex: occupationSelect.index,
                },
            });

            dispatch({
                actionType: "SET_HIDE_FIELDS",
                payload: isOccupationSpecificCateg(occupationSelect.value),
            });
        }

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
    };

    function getUIData(navParams, savedData, mdmData, paramsEditFlow) {
        if (paramsEditFlow) {
            return {
                mdmOccupation: navParams?.occupation,
                mdmEmpName: navParams?.employerName,
                mdmSector: navParams?.occupationSector,
                savedEmpYears: navParams?.empYears,
                savedEmpMonths: navParams?.empMonths,
            };
        } else {
            return {
                mdmOccupation: savedData?.occupation ?? mdmData?.occupation,
                mdmEmpName: savedData?.employerName ?? mdmData?.employerName,
                mdmSector: savedData?.occupationSector ?? mdmData?.occupationSector,
                savedEmpYears: savedData?.empYears,
                savedEmpMonths: savedData?.empMonths,
            };
        }
    }

    const setPickerData = (yearsDropdownData, monthsDropdownData) => {
        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                occupationData: masterData?.occupation ?? null,
                sectorData: masterData?.occupationSector ?? null,
                yearsData: yearsDropdownData,
                monthsData: monthsDropdownData,
            },
        });
    };

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    const onPickerCancel = () => {
        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
        const { pickerType } = state;

        switch (pickerType) {
            case "occupation":
                dispatch({
                    actionType: "SET_OCCUPATION",
                    payload: {
                        occupation: item?.name ?? PLEASE_SELECT,
                        occupationValue: item?.value ?? null,
                        occupationObj: item,
                        occupationValueIndex: index,
                    },
                });
                dispatch({
                    actionType: "SET_HIDE_FIELDS",
                    payload: isOccupationSpecificCateg(item?.value),
                });
                break;
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

    const onPickerTap = (payloadValue) => {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: payloadValue,
        });
    };

    const onSectorTap = () => {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "sector",
        });
    };

    const onYearsTap = () => {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: "years",
        });
    };

    const onMonthsTap = () => {
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
            monthData.push({
                name: i === 1 ? `${i} month` : `${i} months`,
                value: String(i),
            });
        }

        return monthData;
    }

    function getYearData() {
        const minValue = 0;
        const maxValue = 50;
        const yearData = [];

        for (let i = minValue; i <= maxValue; i++) {
            yearData.push({
                name: i === 1 ? `${i} year` : `${i} years`,
                value: String(i),
            });
        }

        return yearData;
    }

    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveJAInput({
            screenName: JA_EMPLOYMENT_DETAILS,
            formData,
            navParams,
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
        // Hide popup
        closeExitPopup();

        resetToApplication();
    }

    function closeCancelRemovePopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (savedData?.isSaveData === "Y" && success) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    ...navParams,
                    savedData,
                    cancelReason,
                    propertyDetails,
                    reload: true,
                },
            });
        } else {
            resetToApplication();
        }
    }

    function closeExitPopup() {
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    const resetValidationErrors = () => {
        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                empNameValid: true,
                empNameErrorMsg: "",
            },
        });
    };

    const validateFormDetails = () => {
        // Reset existing error state
        resetValidationErrors();

        //if fields are hidden then return true

        if (hideFields) return true;

        // Employer Name
        const { isValid: empNameValid, message: empNameErrorMsg } = validateEmpName(empName);
        if (!empNameValid) {
            dispatch({
                actionType: "SET_EMP_TYPE_ERROR",
                payload: { empNameValid, empNameErrorMsg },
            });
        }

        return !(!empNameValid);
    };

    async function onContinue() {
        const navParams = route?.params ?? {};

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const formData = getFormData();

        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            dispatch({
                actionType: "SHOW_APPLICATION_REMOVE_POPUP",
                payload: true,
            });
            return;
        }

        // Save Form Data in DB before moving to next screen
        const httpReq = await saveJAInput({
            screenName: JA_EMPLOYMENT_DETAILS,
            formData,
            navParams,
        });

        if (editFlow) {
            if (httpReq.success === true) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: JA_CONFIRMATION,
                    params: {
                        ...navParams,
                        ...formData,
                        updateData: true,
                    },
                });
            }
        } else {
            // Navigate to Employer Address screen
            if (httpReq.success === true) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: hideFields ? JA_INCOME_COMMITMENT : JA_EMPLOYMENT_ADDRESS,
                    // screen: JA_EMPLOYMENT_ADDRESS,
                    params: {
                        ...navParams,
                        ...formData,
                        currentStep: 3,
                        totalSteps: hideFields ? 4 : 5,
                    },
                });
            }
        }
    }

    const getFormData = () => {
        const navParams = route?.params ?? {};
        const { occupationValue, sectorValue, yearsValue, monthsValue } = state;
        const employeeName = empName ? empName.trim() : "";

        return {
            ...navParams,
            occupation: occupationValue,
            employerName: hideFields ? "" : employeeName,
            occupationSector: hideFields ? "" : sectorValue,
            empYears: hideFields ? "" : yearsValue,
            empMonths: hideFields ? "" : monthsValue,
            progressStatus: PROP_ELG_INPUT,
        };
    };

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_EMPLOYMENTDETAILS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                editFlow 
                                ? (
                                    <Typo
                                        text={EDIT}
                                        lineHeight={16}
                                        fontSize={12}
                                        fontWeight="600"
                                        color={BLACK}
                                    />
                                ) 
                                : (
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
                                text={editFlow ? EDIT_EMPLOYMENT_DETAILS : JOINT_APPLICATION}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text={EMPLOYMENT_JA_DETAILS}
                                textAlign="left"
                            />

                            {/* Occupation */}
                            <LabeledDropdown
                                label={CARDS_OCCUPATION}
                                dropdownValue={occupation}
                                onPress={() => onPickerTap("occupation")}
                                style={Style.fieldViewCls}
                            />

                            {/* Name of employer */}
                            {!hideFields && (
                                <View>
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={EMPLOYER_NAME_TEXT}
                                        />
                                        <LongTextInput
                                            autoFocus
                                            minLength={5}
                                            maxLength={40}
                                            isValidate
                                            isValid={state.empNameValid}
                                            errorMessage={state.empNameErrorMsg}
                                            value={empName}
                                            placeholder={PLSTP_EMPLOYER_NAME_PH}
                                            onChangeText={onEmpNameTextChange}
                                            numberOfLines={2}
                                        />
                                    </View>

                                    {/* Occupation sector */}
                                    <LabeledDropdown
                                        label={OCCUPATION_SECTOR}
                                        dropdownValue={sector}
                                        onPress={onSectorTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Work duration */}
                                    <View style={Style.fieldViewCls}>
                                        {/* Label */}
                                        <Typo lineHeight={18} textAlign="left" text={WORK_PERIOD} />

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
                                        text={state.editFlow ? SAVE_AND_NEXT : state.ctaText}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Occupation Picker */}
            {state.occupationData && (
                <ScrollPickerView
                    showMenu={state.occupationPicker}
                    list={state.occupationData}
                    selectedIndex={state.occupationValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    expandedMode
                />
            )}

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
            {/*Application Removed popup */}
            <Popup
                visible={state.showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeCancelRemovePopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
        </>
    );
}

JAEmploymentDetails.propTypes = {
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

export default JAEmploymentDetails;

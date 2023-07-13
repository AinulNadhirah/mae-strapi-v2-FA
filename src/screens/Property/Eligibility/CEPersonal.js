/* eslint-disable sonarjs/cognitive-complexity */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BANKINGV2_MODULE, CE_PERSONAL, CE_COMMITMENTS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common/ScrollPickerView";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    RED_ERROR,
    FADE_GREY,
} from "@constants/colors";
import { PROP_ELG_INPUT } from "@constants/data";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    SAVE_NEXT,
    SPOUSE_MONTHLY_INCOME_TITLE,
    SPOUSE_MONTHLY_GROSS_INCOME_DESC,
    FA_PROPERTY_CE_PD,
    FA_PROPERTY_CE_SAVEPROGRESS,
    PERSONAL_DETAILS_HEADER_TEXT,
    TITLE,
    RESIDENT_STATUS,
    PLSTP_EDUCATION,
    MARITAL_STATUS,
    RELIGION,
    PLSTP_SPOUNSE_GROSS_INCOME,
    EMP_STATUS,
    EMP_BUISINESS_TYPE,
    PLSTP_OCCUPATION,
    PUBLIC_SECTOR_HOME_FINANCING,
} from "@constants/strings";

import { FAProperty } from "@services/analytics/analyticsProperty";
import AmountInput from "../Common/AmountInput";
import {
    getExistingData,
    useResetNavigation,
    checkCCRISReportAvailability,
    getEncValue,
} from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import SlidingNumPad from "../Common/SlidingNumPad";
import { saveEligibilityInput, removeCEEditRoutes, getCEPersonalUIData } from "./CEController";

// Initial state object
const initialState = {
    //stepper info
    currentStep: "",
    totalSteps: "",
    stepperInfo: "",

    // Title related
    title: PLEASE_SELECT,
    titleValue: null,
    titleValueIndex: 0,
    titleData: null,
    titlePicker: false,
    titleObj: null,

    // Resident Status related
    resident: PLEASE_SELECT,
    residentValue: null,
    residentValueIndex: 0,
    residentData: null,
    residentPicker: false,
    residentObj: null,

    // Education related
    education: PLEASE_SELECT,
    educationValue: null,
    educationValueIndex: 0,
    educationData: null,
    educationPicker: false,
    educationObj: null,

    // Marital Status related
    marital: PLEASE_SELECT,
    maritalValue: null,
    maritalValueIndex: 0,
    maritalData: null,
    maritalPicker: false,
    maritalObj: null,

    // Religion related
    religion: PLEASE_SELECT,
    religionValue: null,
    religionValueIndex: 0,
    religionData: null,
    religionPicker: false,
    religionObj: null,

    // Spouse Gross Income
    showSpouseIncome: true,
    spouseIncomeDispAmt: "",
    spouseIncomeRawAmt: "",
    spouseIncomeKeypadAmt: "",

    // Employment type related
    empType: PLEASE_SELECT,
    empTypeValue: null,
    empTypeValueIndex: 0,
    empTypeData: null,
    empTypePicker: false,
    empTypeObj: null,

    // Occupation related
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationValueIndex: 0,
    occupationData: null,
    occupationPicker: false,
    occupationObj: null,

    // Business Classification related
    bizClassification: PLEASE_SELECT,
    bizClassificationValue: null,
    bizClassificationValueIndex: 0,
    bizClassificationData: null,
    bizClassificationPicker: false,
    bizClassificationObj: null,

    publicSectorNameFinance: "N",
    showPublicSectorNameFinance: false,

    // Numerical Keypad related
    showNumPad: false,
    keypadAmount: "",
    numKeypadHeight: 0,

    // Others
    showExitPopup: false,
    cancelEditPopup: false,
    isContinueDisabled: true,
    pickerType: null,
    headerText: "",
    ctaText: SAVE_NEXT,
    ccrisReportFlag: false,
    applicationStpRefNo: null,
    editFlow: false,
    loading: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_TEXT":
            return {
                ...state,
                headerText: payload,
            };
        case "HIDE_PICKER":
            return {
                ...state,
                pickerType: null,
                titlePicker: false,
                residentPicker: false,
                educationPicker: false,
                maritalPicker: false,
                religionPicker: false,
                empTypePicker: false,
                occupationPicker: false,
                bizClassificationPicker: false,
            };
        case "SHOW_PICKER":
            return {
                ...state,
                pickerType: payload,
                titlePicker: payload === "title",
                residentPicker: payload === "resident",
                educationPicker: payload === "education",
                maritalPicker: payload === "marital",
                religionPicker: payload === "religion",
                empTypePicker: payload === "empType",
                occupationPicker: payload === "occupation",
                bizClassificationPicker: payload === "bizClassification",
                showNumPad: false,
            };
        case "SET_STEPPER_INFO":
        case "SET_PICKER_DATA":
        case "SET_TITLE":
        case "SET_RESIDENT":
        case "SET_EDUCATION":
        case "SET_MARITAL":
        case "SET_RELIGION":
        case "SET_SPOUSE_INCOME":
        case "SET_EMPLOYMENT_TYPE":
        case "SET_OCCUPATION":
        case "SET_BIZ_CLASSIFICATION":
            return {
                ...state,
                ...payload,
            };
        case "SET_KEYPAD_HEIGHT":
            return {
                ...state,
                numKeypadHeight: payload,
            };
        case "SHOW_NUM_PAD":
            return {
                ...state,
                showNumPad: payload?.value ?? false,
            };
        case "SHOW_SPOUSE_INCOME":
            return {
                ...state,
                showSpouseIncome: payload,
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
        case "SHOW_CANCEL_EDIT_POPUP":
            return {
                ...state,
                cancelEditPopup: payload,
            };
        case "SET_EDIT_FLOW":
            return {
                ...state,
                editFlow: payload,
            };
        case "SET_CTA_TEXT":
            return {
                ...state,
                ctaText: payload,
            };
        case "SET_PUBLIC_SECTOR_NAME_FINANCE":
            return {
                ...state,
                publicSectorNameFinance: payload,
            };
        case "SHOW_PUBLIC_SECTOR_NAME_FINANCE":
            return {
                ...state,
                showPublicSectorNameFinance: payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        case "SHOW_SPOUCE_INCOME_INFO_POPUP":
            return {
                ...state,
                showSpouceIcome: payload,
            };
        default:
            return { ...state };
    }
}

function CEPersonal({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        isContinueDisabled,
        title,
        resident,
        education,
        marital,
        maritalValue,
        religion,
        religionValue,
        empType,
        occupation,
        bizClassification,
        bizClassificationValue,
        publicSectorNameFinance,
        showPublicSectorNameFinance,
        showNumPad,
        showSpouseIncome,
        spouseIncomeRawAmt,
        editFlow,
        loading,
    } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    // Handler to show/hide Spouse Income field
    useEffect(() => {
        dispatch({
            actionType: "SHOW_SPOUSE_INCOME",
            payload: maritalValue === "M",
        });
    }, [maritalValue]);

    // Handler to show/hide public sector home finance field
    useEffect(() => {
        dispatch({
            actionType: "SHOW_PUBLIC_SECTOR_NAME_FINANCE",
            payload: bizClassificationValue === "005",
        });
    }, [bizClassificationValue]);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload:
                title === PLEASE_SELECT ||
                resident === PLEASE_SELECT ||
                education === PLEASE_SELECT ||
                marital === PLEASE_SELECT ||
                religion === PLEASE_SELECT ||
                empType === PLEASE_SELECT ||
                occupation === PLEASE_SELECT ||
                bizClassification === PLEASE_SELECT,
        });
    }, [title, resident, education, marital, religion, empType, occupation, bizClassification]);

    function init() {
        console.log("[CEPersonal] >> [init]");

        // Populate Picker Data
        setPickerData();

        // Prepopulate any existing details
        prepopulateData();

        setLoading(false);
    }

    function onBackTap() {
        console.log("[CEPersonal] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[CEPersonal] >> [onCloseTap]");

        // Show Exit OR Cancel Edit Popup
        dispatch({
            actionType: editFlow ? "SHOW_CANCEL_EDIT_POPUP" : "SHOW_EXIT_POPUP",
            payload: true,
        });

        // Hide keypad
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });

        if (!editFlow) {
            FAProperty.onPressViewScreen(FA_PROPERTY_CE_SAVEPROGRESS);
        }
    }

    const prepopulateData = () => {
        console.log("[CEPersonal] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const headerText = route.params?.headerText ?? "";
        const {
            mdmTitle,
            mdmResident,
            mdmEducation,
            mdmMarital,
            mdmReligion,
            mdmEmpType,
            mdmOccupation,
            mdmBizClassification,
        } = getCEPersonalUIData(navParams, savedData, mdmData, paramsEditFlow);

        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && !paramsEditFlow && currentStep < totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";

        // Set Header Text
        dispatch({
            actionType: "SET_HEADER_TEXT",
            payload: paramsEditFlow ? EDIT_FIN_DETAILS : headerText,
        });

        //Set Stepper Info
        dispatch({
            actionType: "SET_STEPPER_INFO",
            payload: {
                currentStep,
                totalSteps,
                stepperInfo,
            },
        });

        //Title
        if (mdmTitle) {
            const titleSelect = getExistingData(mdmTitle, masterData?.title ?? null);
            dispatch({
                actionType: "SET_TITLE",
                payload: {
                    title: titleSelect.name,
                    titleValue: titleSelect.value,
                    titleObj: titleSelect.obj,
                    titleValueIndex: titleSelect.index,
                },
            });
        }

        // Resident
        if (mdmResident) {
            const residentSelect = getExistingData(mdmResident, masterData?.customerGroup ?? null);
            dispatch({
                actionType: "SET_RESIDENT",
                payload: {
                    resident: residentSelect.name,
                    residentValue: residentSelect.value,
                    residentObj: residentSelect.obj,
                    residentValueIndex: residentSelect.index,
                },
            });
        }

        // Education
        if (mdmEducation) {
            const educationSelect = getExistingData(mdmEducation, masterData?.education ?? null);
            dispatch({
                actionType: "SET_EDUCATION",
                payload: {
                    education: educationSelect.name,
                    educationValue: educationSelect.value,
                    educationObj: educationSelect.obj,
                    educationValueIndex: educationSelect.index,
                },
            });
        }

        // Marital
        if (mdmMarital) {
            const maritalSelect = getExistingData(mdmMarital, masterData?.maritalStatus ?? null);
            dispatch({
                actionType: "SET_MARITAL",
                payload: {
                    marital: maritalSelect.name,
                    maritalValue: maritalSelect.value,
                    maritalObj: maritalSelect.obj,
                    maritalValueIndex: maritalSelect.index,
                },
            });
        }

        //religion
        if (mdmReligion) {
            const religionSelect = getExistingData(mdmReligion, masterData?.religion ?? null);
            dispatch({
                actionType: "SET_RELIGION",
                payload: {
                    religion: religionSelect.name,
                    religionValue: religionSelect.value,
                    religionObj: religionSelect.obj,
                    religionValueIndex: religionSelect.index,
                },
            });
        }

        // Employment Type
        if (mdmEmpType) {
            const empTypeSelect = getExistingData(mdmEmpType, masterData?.employmentType ?? null);
            dispatch({
                actionType: "SET_EMPLOYMENT_TYPE",
                payload: {
                    empType: empTypeSelect.name,
                    empTypeValue: empTypeSelect.value,
                    empTypeObj: empTypeSelect.obj,
                    empTypeValueIndex: empTypeSelect.index,
                },
            });
        }

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
        }

        // Business Classification
        if (mdmBizClassification) {
            const bizClassificationSelect = getExistingData(
                mdmBizClassification,
                masterData?.businessClassification ?? null
            );
            dispatch({
                actionType: "SET_BIZ_CLASSIFICATION",
                payload: {
                    bizClassification: bizClassificationSelect.name,
                    bizClassificationValue: bizClassificationSelect.value,
                    bizClassificationObj: bizClassificationSelect.obj,
                    bizClassificationValueIndex: bizClassificationSelect.index,
                },
            });
        }

        //public sector name finance
        let savedPublicSectorNameFinance = savedData?.publicSectorNameFinance;
        if (savedPublicSectorNameFinance) {
            savedPublicSectorNameFinance =
                savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y"
                    ? "Y"
                    : "N";
            dispatch({
                actionType: "SET_PUBLIC_SECTOR_NAME_FINANCE",
                payload: savedPublicSectorNameFinance,
            });
        }

        // Changes specific to edit flow
        if (paramsEditFlow) {
            dispatch({
                actionType: "SET_EDIT_FLOW",
                payload: paramsEditFlow,
            });
            dispatch({
                actionType: "SET_CTA_TEXT",
                payload: SAVE_NEXT,
            });
        }
    };

    const setPickerData = () => {
        console.log("[CEPersonal] >> [setPickerData]");

        const masterData = route.params?.masterData ?? {};

        dispatch({
            actionType: "SET_PICKER_DATA",
            payload: {
                titleData: masterData?.title ?? null,
                residentData: masterData?.customerGroup ?? null,
                educationData: masterData?.education ?? null,
                maritalData: masterData?.maritalStatus ?? null,
                religionData: masterData?.religion ?? null,
                empTypeData: masterData?.employmentType ?? null,
                occupationData: masterData?.occupation ?? null,
                bizClassificationData: masterData?.businessClassification ?? null,
            },
        });
    };

    const onPickerCancel = () => {
        console.log("[CEPersonal] >> [onPickerCancel]");

        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
        console.log("[CEPersonal] >> [onPickerDone]");

        const { pickerType } = state;

        switch (pickerType) {
            case "title":
                dispatch({
                    actionType: "SET_TITLE",
                    payload: {
                        title: item?.name ?? PLEASE_SELECT,
                        titleValue: item?.value ?? null,
                        titleObj: item,
                        titleValueIndex: index,
                    },
                });
                break;
            case "resident":
                dispatch({
                    actionType: "SET_RESIDENT",
                    payload: {
                        resident: item?.name ?? PLEASE_SELECT,
                        residentValue: item?.value ?? null,
                        residentObj: item,
                        residentValueIndex: index,
                    },
                });
                break;
            case "education":
                dispatch({
                    actionType: "SET_EDUCATION",
                    payload: {
                        education: item?.name ?? PLEASE_SELECT,
                        educationValue: item?.value ?? null,
                        educationObj: item,
                        educationValueIndex: index,
                    },
                });
                break;
            case "marital":
                dispatch({
                    actionType: "SET_MARITAL",
                    payload: {
                        marital: item?.name ?? PLEASE_SELECT,
                        maritalValue: item?.value ?? null,
                        maritalObj: item,
                        maritalValueIndex: index,
                    },
                });
                break;
            case "religion":
                dispatch({
                    actionType: "SET_RELIGION",
                    payload: {
                        religion: item?.name ?? PLEASE_SELECT,
                        religionValue: item?.value ?? null,
                        religionObj: item,
                        religionValueIndex: index,
                    },
                });
                break;
            case "empType":
                dispatch({
                    actionType: "SET_EMPLOYMENT_TYPE",
                    payload: {
                        empType: item?.name ?? PLEASE_SELECT,
                        empTypeValue: item?.value ?? null,
                        empTypeObj: item,
                        empTypeValueIndex: index,
                    },
                });
                break;
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
                break;
            case "bizClassification":
                dispatch({
                    actionType: "SET_BIZ_CLASSIFICATION",
                    payload: {
                        bizClassification: item?.name ?? PLEASE_SELECT,
                        bizClassificationValue: item?.value ?? null,
                        bizClassificationObj: item,
                        bizClassificationValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    };

    const onPickerDropdownTap = (pickerType) => {
        console.log("[CEPersonal] >> [onPickerDropdownTap] >>", pickerType);

        dispatch({
            actionType: "SHOW_PICKER",
            payload: pickerType,
        });
    };

    const onSpouseIncomePress = () => {
        console.log("[CEPersonal] >> [onSpouseIncomePress]");

        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 385 });
        }, 500);
    };

    const onNumKeypadChange = (number) => {
        const { spouseIncomeKeypadAmt } = state;

        if (number === "0" && !spouseIncomeKeypadAmt) return;

        const rawAmt = !number ? "" : parseInt(number, 10) / 100;
        const dispAmt = !number ? "" : numeral(rawAmt).format("0,0.00");

        dispatch({
            actionType: "SET_SPOUSE_INCOME",
            payload: {
                spouseIncomeDispAmt: dispAmt,
                spouseIncomeRawAmt: rawAmt,
                spouseIncomeKeypadAmt: number,
            },
        });
    };

    const onNumKeypadDone = () =>
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });

    const getKeypadHeight = (height) => {
        dispatch({ actionType: "SET_KEYPAD_HEIGHT", payload: height });
    };

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    async function onExitPopupSave() {
        console.log("[CEPersonal] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: CE_PERSONAL,
            formData,
            navParams: route?.params,
            saveData: "Y",
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, SAVE);
    }

    function onPublicSectorNameFinanceChange(value) {
        console.log("[CEPersonal] >> [onPublicSectorNameFinanceChange]" + value);
        dispatch({
            actionType: "SET_PUBLIC_SECTOR_NAME_FINANCE",
            payload: value,
        });
    }

    function onExitPopupDontSave() {
        console.log("[CEPersonal] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();

        FAProperty.onPressSelectAction(FA_PROPERTY_CE_SAVEPROGRESS, DONT_SAVE);
    }

    function closeExitPopup() {
        console.log("[CEPersonal] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function onCancelEditPopupLeave() {
        console.log("[CEPersonal] >> [onCancelEditPopupLeave]");

        // Hide popup
        closeCancelEditPopup();

        // Removes all Eligibility edit flow screens
        const updatedRoutes = removeCEEditRoutes(navigationState?.routes ?? []);

        // Navigate to Eligibility Confirmation screen
        navigation.reset({
            index: updatedRoutes.length - 1,
            routes: updatedRoutes,
        });
    }

    function closeCancelEditPopup() {
        console.log("[CEPersonal] >> [closeCancelEditPopup]");

        dispatch({
            actionType: "SHOW_CANCEL_EDIT_POPUP",
            payload: false,
        });
    }

    async function checkCCRICSAvailability() {
        console.log("[CEPersonal] >> [checkCCRICSAvailability]");
        const encSyncId = await getEncValue(route?.params?.syncId ?? "");

        // Request object
        const params = {
            progressStatus: PROP_ELG_INPUT,
            propertyId: route?.params?.propertyDetails?.property_id ?? "",
            syncId: encSyncId,
        };

        // API Call - To check CCRIS report availability.
        const { success, errorMessage, applicationStpRefNo, ccrisLoanCount, ccrisReportFlag } =
            await checkCCRISReportAvailability(params, false);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        // Navigate to manual commitments screen.
        saveAndContinue(applicationStpRefNo, ccrisReportFlag, ccrisLoanCount);
    }

    async function onContinue() {
        console.log("[CEPersonal] >> [onContinue]");
        setLoading(true);
        // Call API to check CCRIS report availability
        checkCCRICSAvailability();

        FAProperty.onPressFormProceed(FA_PROPERTY_CE_PD);
    }

    function getFormData(ccrisLoanCount) {
        console.log("[CEPersonal] >> [getFormData]");

        const navParams = route?.params ?? {};
        const mdmData = navParams?.mdmData ?? {};
        let employerName = mdmData?.employerName ?? "";
        employerName = employerName.toLowerCase();
        const isEtiqa = employerName.includes("etiqa");

        let localPublicSectorNameFinance = showPublicSectorNameFinance
            ? publicSectorNameFinance
            : "";
        // eslint-disable-next-line no-unused-vars
        if (isEtiqa) localPublicSectorNameFinance = "Y";

        const {
            titleValue,
            residentValue,
            educationValue,
            empTypeValue,
            bizClassificationValue,
            occupationValue,
            currentStep,
            totalSteps,
        } = state;

        return {
            title: titleValue,
            residentStatus: residentValue,
            education: educationValue,
            maritalStatus: maritalValue,
            religion: religionValue,
            spouseIncome: String(spouseIncomeRawAmt),
            employmentStatus: empTypeValue,
            businessType: bizClassificationValue,
            occupation: occupationValue,
            publicSectorNameFinance: showPublicSectorNameFinance ? publicSectorNameFinance : "",
            ccrisLoanCount,
            currentStep,
            totalSteps,
        };
    }

    async function saveAndContinue(applicationStpRefNo = "", ccrisReportFlag, ccrisLoanCount) {
        console.log("[CEPersonal] >> [saveAndContinue]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData(ccrisLoanCount);

        if (editFlow) {
            // Navigate to Commitments Input screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_COMMITMENTS,
                params: {
                    ...navParams,
                    ...formData,
                    applicationStpRefNo,
                    ccrisReportFlag,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            const { syncId } = await saveEligibilityInput(
                {
                    screenName: CE_PERSONAL,
                    formData,
                    navParams,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );

            // Navigate to Commitments Input screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CE_COMMITMENTS,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                    applicationStpRefNo,
                    ccrisReportFlag,
                },
            });
        }
        setLoading(false);
    }

    function showSpouceIncomePopup() {
        dispatch({
            actionType: "SHOW_SPOUCE_INCOME_INFO_POPUP",
            payload: true,
        });
    }
    function closeSpouceIncomePopup() {
        dispatch({
            actionType: "SHOW_SPOUCE_INCOME_INFO_POPUP",
            payload: false,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_CE_PD}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                            ref={scrollRef}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={state.headerText}
                                numberOfLines={2}
                                textAlign="left"
                            />

                            {/* Sub Header */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.headerText}
                                text={PERSONAL_DETAILS_HEADER_TEXT}
                                textAlign="left"
                            />

                            {/* Title */}
                            <LabeledDropdown
                                label={TITLE}
                                dropdownValue={title}
                                onPress={() => onPickerDropdownTap("title")}
                                style={Style.fieldViewCls}
                            />

                            {/* Resident status */}
                            <LabeledDropdown
                                label={RESIDENT_STATUS}
                                dropdownValue={resident}
                                onPress={() => onPickerDropdownTap("resident")}
                                style={Style.fieldViewCls}
                            />

                            {/* Education */}
                            <LabeledDropdown
                                label={PLSTP_EDUCATION}
                                dropdownValue={education}
                                onPress={() => onPickerDropdownTap("education")}
                                style={Style.fieldViewCls}
                            />

                            {/* Marital status */}
                            <LabeledDropdown
                                label={MARITAL_STATUS}
                                dropdownValue={marital}
                                onPress={() => onPickerDropdownTap("marital")}
                                style={Style.fieldViewCls}
                            />

                            {/* Religion */}
                            <LabeledDropdown
                                label={RELIGION}
                                dropdownValue={religion}
                                onPress={() => onPickerDropdownTap("religion")}
                                style={Style.fieldViewCls}
                            />

                            {/* Spouse Income */}
                            {showSpouseIncome && (
                                <AmountInput
                                    label={PLSTP_SPOUNSE_GROSS_INCOME}
                                    onPress={onSpouseIncomePress}
                                    value={state.spouseIncomeDispAmt}
                                    style={Style.fieldViewCls}
                                    infoIcon
                                    infoIconPress={showSpouceIncomePopup}
                                />
                            )}

                            {/* Employment type */}
                            <LabeledDropdown
                                label={EMP_STATUS}
                                dropdownValue={empType}
                                onPress={() => onPickerDropdownTap("empType")}
                                style={Style.fieldViewCls}
                            />

                            {/* Business Classification */}
                            <LabeledDropdown
                                label={EMP_BUISINESS_TYPE}
                                dropdownValue={bizClassification}
                                onPress={() => onPickerDropdownTap("bizClassification")}
                                style={Style.fieldViewCls}
                            />

                            {/* Occupation */}
                            <LabeledDropdown
                                label={PLSTP_OCCUPATION}
                                dropdownValue={occupation}
                                onPress={() => onPickerDropdownTap("occupation")}
                                style={Style.fieldViewCls}
                            />

                            {/* Public sector home financing */}
                            {showPublicSectorNameFinance && (
                                <View>
                                    <Typo
                                        lineHeight={18}
                                        text={PUBLIC_SECTOR_HOME_FINANCING}
                                        textAlign="left"
                                        style={Style.fieldViewCls}
                                    />
                                    <RadioYesNo
                                        defaultValue={publicSectorNameFinance}
                                        onChange={onPublicSectorNameFinanceChange}
                                    />
                                </View>
                            )}

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={Style.bottomSpacer} />
                        </ScrollView>

                        {/* Vertical Spacer */}
                        <View
                            style={Style.verticalSpacer(showNumPad, state.numKeypadHeight)}
                        />

                        {/* Bottom docked button container */}
                        {!showNumPad && (
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
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Title Picker */}
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

            {/* Resident status Picker */}
            {state.residentData && (
                <ScrollPickerView
                    showMenu={state.residentPicker}
                    list={state.residentData}
                    selectedIndex={state.residentValueIndex}
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
                    list={state.educationData}
                    selectedIndex={state.educationValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Marital status Picker */}
            {state.maritalData && (
                <ScrollPickerView
                    showMenu={state.maritalPicker}
                    list={state.maritalData}
                    selectedIndex={state.maritalValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Religion Picker */}
            {state.religionData && (
                <ScrollPickerView
                    showMenu={state.religionPicker}
                    list={state.religionData}
                    selectedIndex={state.religionValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Employment type Picker */}
            {state.empTypeData && (
                <ScrollPickerView
                    showMenu={state.empTypePicker}
                    list={state.empTypeData}
                    selectedIndex={state.empTypeValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Business classification Picker */}
            {state.bizClassificationData && (
                <ScrollPickerView
                    showMenu={state.bizClassificationPicker}
                    list={state.bizClassificationData}
                    selectedIndex={state.bizClassificationValueIndex}
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
                    selectedIndex={state.occupationValueIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    expandedMode
                />
            )}

            {/* Sliding Numerical Keypad */}
            <SlidingNumPad
                showNumPad={showNumPad}
                onChange={onNumKeypadChange}
                onDone={onNumKeypadDone}
                getHeight={getKeypadHeight}
                value={state.spouseIncomeKeypadAmt}
            />

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={EXIT_POPUP_TITLE}
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

            {/* Cancel edit confirmation popup */}
            <Popup
                visible={state.cancelEditPopup}
                title={CANCEL_EDITS}
                description={CANCEL_EDITS_DESC}
                onClose={closeCancelEditPopup}
                primaryAction={{
                    text: LEAVE,
                    onPress: onCancelEditPopupLeave,
                }}
                secondaryAction={{
                    text: GO_BACK,
                    onPress: closeCancelEditPopup,
                }}
            />

            {/* Spouse income tooltip popup  */}
            <Popup
                visible={state.showSpouceIcome}
                title={SPOUSE_MONTHLY_INCOME_TITLE}
                description={SPOUSE_MONTHLY_GROSS_INCOME_DESC}
                onClose={closeSpouceIncomePopup}
            />
        </>
    );
}

CEPersonal.propTypes = {
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
    verticalSpacer: (showNumPad, numKeypadHeight) => ({
        height: showNumPad ? numKeypadHeight : 0,
    }),
});

export default CEPersonal;

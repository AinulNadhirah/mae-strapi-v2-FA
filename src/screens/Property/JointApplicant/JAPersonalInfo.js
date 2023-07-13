/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/jsx-no-bind */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
    BANKINGV2_MODULE,
    JA_PERSONAL_INFO,
    JA_INCOME_COMMITMENT,
    APPLICATION_DETAILS,
    JA_CUST_ADDRESS,
} from "@navigation/navigationConstant";

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
    EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    LEAVE,
    GO_BACK,
    CANCEL_EDITS,
    CANCEL_EDITS_DESC,
    EDIT_FIN_DETAILS,
    SAVE_NEXT,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_JA_POPUP_TITLE,
    FA_PROPERTY_JACEJA_PESONALDETAILS,
    EDIT,
    JOINT_APPLICATION,
    EDIT_PERSONAL_DETAILS,
    SAVE_AND_NEXT,
    SPOUSE_MONTHLY_INCOME_TITLE,
    SPOUSE_MONTHLY_GROSS_INCOME_DESC,
} from "@constants/strings";

import {
    EMP_BUISINESS_TYPE,
    EMP_STATUS,
    PERSONAL_DETAILS_HEADER_TEXT,
    PLSTP_EDUCATION,
    PLSTP_MARITAL_STATUS,
    PUBLIC_SECTOR_HOME_FINANCING,
    RELIGION,
    RESIDENT_STATUS,
    SPOUSE_GROSS_INCOME,
} from "../../../constants/strings";
import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import AmountInput from "../Common/AmountInput";
import {
    getExistingData,
    checkCCRISReportAvailability,
    getEncValue,
    useResetNavigation,
} from "../Common/PropertyController";
import RadioYesNo from "../Common/RadioYesNo";
import SlidingNumPad from "../Common/SlidingNumPad";
import { saveEligibilityInput, removeCEEditRoutes } from "../JointApplicant/JAController";

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

    // JA Relationship with MA
    jaRelationshipName: null,
    jaRelationshipValue: null,

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
                bizClassificationPicker: payload === "bizClassification",
                showNumPad: false,
            };
        case "SET_STEPPER_INFO":
        case "SET_PICKER_DATA":
        case "SET_TITLE":
        case "SET_RESIDENT":
        case "SET_EDUCATION":
        case "SET_MARITAL":
        case "SET_JA_RELATIONSHIP_WITH_MA":
        case "SET_RELIGION":
        case "SET_SPOUSE_INCOME":
        case "SET_EMPLOYMENT_TYPE":
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
        case "SHOW_APPLICATION_REMOVE_POPUP":
            return {
                ...state,
                showApplicationRemovePopup: payload,
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
function JAPersonalInfo({ route, navigation }) {
    const navigationState = useNavigationState((state) => state);
    const [resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(true);

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
        bizClassification,
        bizClassificationValue,
        publicSectorNameFinance,
        showPublicSectorNameFinance,
        showNumPad,
        showSpouseIncome,
        spouseIncomeRawAmt,
        editFlow,
    } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    // Handler to show/hide Spouse Income field
    useEffect(() => {
        const relationship = route?.params?.jaRelationship;
        dispatch({
            actionType: "SHOW_SPOUSE_INCOME",
            payload: relationship === "Spouse" ? false : maritalValue === "M",
        });
        dispatch({
            actionType: "SHOW_PUBLIC_SECTOR_NAME_FINANCE",
            payload: bizClassificationValue === "005",
        });
    }, [maritalValue, route?.params?.jaRelationship, bizClassificationValue]);

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
                bizClassification === PLEASE_SELECT,
        });
    }, [title, resident, education, marital, religion, empType, bizClassification]);

    function init() {
        // Populate Picker Data
        setPickerData();
        // Prepopulate any existing details
        prepopulateData();
        setLoading(false);
    }

    function onBackTap() {
        navigation.goBack();
    }

    async function onCloseTap() {
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
    }

    function closeRemoveAppPopup() {
        dispatch({
            actionType: "SHOW_APPLICATION_REMOVE_POPUP",
            payload: false,
        });
        setLoading(false);
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

    const prepopulateData = () => {
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
            mdmJARelationship,
            mdmReligion,
            mdmEmpType,
            mdmBizClassification,
        } = getUIData(navParams, savedData, mdmData, paramsEditFlow);

        // let currentStep = navParams?.currentStep;
        let currentStep = 0;
        currentStep = currentStep + 1;
        const totalSteps = 5;
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

        //JA Relationship to MA
        if (mdmJARelationship) {
            const jaRelationshipSelect = getExistingData(
                mdmJARelationship,
                masterData?.relationship ?? null
            );
            dispatch({
                actionType: "SET_JA_RELATIONSHIP_WITH_MA",
                payload: {
                    jaRelationshipName: jaRelationshipSelect.name,
                    jaRelationshipValue: jaRelationshipSelect.value,
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
            const spouseIncome = navParams?.spouseIncome ?? "";
            // Gross Income
            if (spouseIncome && !isNaN(spouseIncome)) {
                const grossIncomeData = getPrepopulateAmount(spouseIncome);
                dispatch({
                    actionType: "SET_SPOUSE_INCOME",
                    payload: {
                        spouseIncomeDispAmt: grossIncomeData?.dispAmt,
                        spouseIncomeRawAmt: grossIncomeData?.rawAmt,
                        spouseIncomeKeypadAmt: grossIncomeData?.keypadAmt,
                    },
                });
            }
        }
    };

    function getPrepopulateAmount(rawAmt) {
        const defaultResponse = { dispAmt: "", rawAmt: "", keypadAmt: "" };
        if (!rawAmt) return defaultResponse;
        return {
            dispAmt: numeral(rawAmt).format("0,0.00"),
            rawAmt,
            keypadAmt: String(rawAmt * 100),
        };
    }

    function getUIData(navParams, savedData, mdmData, paramsEditFlow) {
        if (paramsEditFlow) {
            return {
                mdmTitle: navParams?.title,
                mdmResident: navParams?.residentStatus,
                mdmEducation: navParams?.education,
                mdmMarital: navParams?.maritalStatus,
                mdmJARelationship: navParams?.jaRelationship,
                mdmReligion: navParams?.religion,
                mdmEmpType: navParams?.employmentStatus,
                mdmBizClassification: navParams?.businessType,
            };
        } else {
            return {
                mdmTitle: savedData?.title ?? mdmData?.title,
                mdmResident: savedData?.residentStatus ?? mdmData?.customerGroup,
                mdmEducation: savedData?.education ?? mdmData?.education,
                mdmMarital: savedData?.maritalStatus ?? mdmData?.maritalStatus,
                mdmJARelationship: savedData?.jaRelationship ?? navParams?.jaRelationship,
                mdmReligion: savedData?.religion ?? mdmData?.religion,
                mdmEmpType: savedData?.employmentStatus ?? mdmData?.employmentType,
                mdmBizClassification: savedData?.businessType ?? mdmData?.businessClassification,
            };
        }
    }

    const setPickerData = () => {
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
                bizClassificationData: masterData?.businessClassification ?? null,
            },
        });
    };

    const onPickerCancel = () => {
        dispatch({
            actionType: "HIDE_PICKER",
            payload: true,
        });
    };

    const onPickerDone = (item, index) => {
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

    const onShowPickerTap = (payloadValue) => {
        dispatch({
            actionType: "SHOW_PICKER",
            payload: payloadValue,
        });
    };

    const onSpouseIncomePress = () => {
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

    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();
        // Retrieve form data
        const formData = getFormData();
        const navParams = route?.params;
        navParams.saveData = "Y";
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_PERSONAL_INFO,
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

    function onPublicSectorNameFinanceChange(value) {
        dispatch({
            actionType: "SET_PUBLIC_SECTOR_NAME_FINANCE",
            payload: value,
        });
    }

    function onExitPopupDontSave() {
        // Hide popup
        closeExitPopup();
        resetToApplication();
    }

    function closeExitPopup() {
        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    }

    function onCancelEditPopupLeave() {
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
        dispatch({
            actionType: "SHOW_CANCEL_EDIT_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
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
        if (!editFlow) {
            // Call API to check CCRIS report availability
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
            // Retrieve form data
            const formData = getFormData(ccrisLoanCount);
            // Save Form Data in DB before moving to next screen
            const { syncId } = await saveEligibilityInput(
                {
                    screenName: JA_PERSONAL_INFO,
                    formData,
                    navParams,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );
            if (syncId != null) {
                // Navigate to Commitments Input screen
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: editFlow ? JA_INCOME_COMMITMENT : JA_CUST_ADDRESS,
                    params: {
                        ...navParams,
                        ...formData,
                        syncId,
                        applicationStpRefNo,
                        ccrisReportFlag,
                    },
                });
            }
        } else {
            const formData = getFormData(navParams);

            const { syncId } = await saveEligibilityInput(
                {
                    screenName: JA_PERSONAL_INFO,
                    formData,
                    navParams,
                    editFlow,
                    saveData: resumeFlow ? "Y" : "N",
                },
                false
            );
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_INCOME_COMMITMENT,
                params: {
                    ...navParams,
                    ...formData,
                    syncId,
                },
            });
        }
        setLoading(false);
    }
    function getFormData(ccrisLoanCount) {
        const {
            titleValue,
            residentValue,
            educationValue,
            empTypeValue,
            bizClassificationValue,
            currentStep,
            totalSteps,
        } = state;
        if (editFlow) {
            return {
                title: titleValue,
                residentStatus: residentValue,
                education: educationValue,
                maritalStatus: maritalValue,
                religion: religionValue,
                spouseIncome: String(spouseIncomeRawAmt),
                employmentStatus: empTypeValue,
                businessType: bizClassificationValue,
                publicSectorNameFinance: showPublicSectorNameFinance ? publicSectorNameFinance : "",
                ccrisLoanCount: ccrisLoanCount?.ccrisLoanCount,
                ccrisReportFlag: ccrisLoanCount?.ccrisReportFlag,
                progressStatus: PROP_ELG_INPUT,
            };
        } else {
            return {
                title: titleValue,
                residentStatus: residentValue,
                education: educationValue,
                maritalStatus: maritalValue,
                religion: religionValue,
                spouseIncome: String(spouseIncomeRawAmt),
                employmentStatus: empTypeValue,
                businessType: bizClassificationValue,
                publicSectorNameFinance: showPublicSectorNameFinance ? publicSectorNameFinance : "",
                ccrisLoanCount,
                currentStep,
                totalSteps,
                progressStatus: PROP_ELG_INPUT,
            };
        }
    }
    function spouceIncomePopup(payloadValue) {
        dispatch({
            actionType: "SHOW_SPOUCE_INCOME_INFO_POPUP",
            payload: payloadValue,
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_PESONALDETAILS}
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
                                        fontWeight="600"
                                        fontSize={12}
                                        lineHeight={16}
                                        color={BLACK}
                                    />
                                ) 
                                : (
                                    <Typo
                                        text={state.stepperInfo}
                                        fontWeight="600"
                                        fontSize={12}
                                        lineHeight={16}
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
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={Style.scrollViewCls}
                            ref={scrollRef}
                        >
                            {/* Property - Unit Type Name */}
                            <Typo
                                fontWeight="600"
                                lineHeight={24}
                                text={state.editFlow ? EDIT_PERSONAL_DETAILS : JOINT_APPLICATION}
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
                                label="Title"
                                dropdownValue={title}
                                onPress={() => onShowPickerTap("title")}
                                style={Style.fieldViewCls}
                            />
                            {/* Resident status */}
                            <LabeledDropdown
                                label={RESIDENT_STATUS}
                                dropdownValue={resident}
                                onPress={() => onShowPickerTap("resident")}
                                style={Style.fieldViewCls}
                            />
                            {/* Education */}
                            <LabeledDropdown
                                label={PLSTP_EDUCATION}
                                dropdownValue={education}
                                onPress={() => onShowPickerTap("education")}
                                style={Style.fieldViewCls}
                            />
                            {/* Marital status */}
                            <LabeledDropdown
                                label={PLSTP_MARITAL_STATUS}
                                dropdownValue={marital}
                                onPress={() => onShowPickerTap("marital")}
                                style={Style.fieldViewCls}
                            />
                            {/* Religion */}
                            <LabeledDropdown
                                label={RELIGION}
                                dropdownValue={religion}
                                onPress={() => onShowPickerTap("religion")}
                                style={Style.fieldViewCls}
                            />
                            {/* Spouse Income */}
                            {showSpouseIncome && (
                                <AmountInput
                                    label={SPOUSE_GROSS_INCOME}
                                    onPress={onSpouseIncomePress}
                                    value={state.spouseIncomeDispAmt}
                                    style={Style.fieldViewCls}
                                    infoIcon
                                    infoIconPress={() => spouceIncomePopup(true)}
                                />
                            )}
                            {/* Employment type */}
                            <LabeledDropdown
                                label={EMP_STATUS}
                                dropdownValue={empType}
                                onPress={() => onShowPickerTap("empType")}
                                style={Style.fieldViewCls}
                            />
                            {/* Business Classification */}
                            <LabeledDropdown
                                label={EMP_BUISINESS_TYPE}
                                dropdownValue={bizClassification}
                                onPress={() => onShowPickerTap("bizClassification")}
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
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={{
                                height: showNumPad ? state.numKeypadHeight : 0,
                            }}
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
                                            text={state.editFlow ? SAVE_AND_NEXT : state.ctaText}
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
                onClose={closeRemoveAppPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeRemoveAppPopup,
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
                visible={state.nonBankCommitInfoPopup}
                title={SPOUSE_MONTHLY_INCOME_TITLE}
                description={SPOUSE_MONTHLY_GROSS_INCOME_DESC}
                onClose={() => spouceIncomePopup(false)}
            />
        </>
    );
}

JAPersonalInfo.propTypes = {
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

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
});

export default JAPersonalInfo;

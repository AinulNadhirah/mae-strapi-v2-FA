import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import SearchableList from "@components/FormComponents/SearchableList";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    FA_APPLY_CREDITCARD_EMPLOYMENTDETAILS1,
    FA_APPLY_CREDITCARD_ETB_EMPLOYMENTDETAILS1,
    CARDS_OCCPT_TOOLTIP,
    CARDS_BUSCLASS_TOOLTIP,
    CARDS_OCCUPATION,
    CARDS_BUSINESS,
    CARDS_SECTOR,
    CARDS_SECT_TOOLTIP,
    CARDS_EMPLOYEMENT,
    CARDS_EMP_TOOLTIP,
} from "@constants/strings";

import { empNameRegex, nameRegex, leadingOrDoubleSpaceRegex } from "@utils/dataModel";

const initialState = {
    // Occupation related
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationObj: {},
    occupationValid: true,
    occupationErrorMsg: "",
    occupationData: [],
    occupationValueIndex: 0,
    occupationPicker: false,

    // Nature of business related
    /*natBusiness: PLEASE_SELECT,
    natBusinessValue: null,
    natBusinessObj: {},
    natBusinessValid: true,
    natBusinessErrorMsg: "",
    natBusinessData: [],
    natBusinessValueIndex: 0,
    natBusinessPicker: false,*/

    // Business classification related
    clsBusiness: PLEASE_SELECT,
    clsBusinessValue: null,
    clsBusinessObj: {},
    clsBusinessValid: true,
    clsBusinessErrorMsg: "",
    clsBusinessData: [],
    clsBusinessValueIndex: 0,
    clsBusinessPicker: false,

    // Sector related
    sector: PLEASE_SELECT,
    sectorValue: null,
    sectorObj: {},
    sectorValid: true,
    sectorErrorMsg: "",
    sectorData: [],
    sectorValueIndex: 0,
    sectorPicker: false,

    // Employment Type related
    sourceIncome: PLEASE_SELECT,
    sourceIncomeValue: null,
    sourceIncomeObj: {},
    sourceIncomeValid: true,
    sourceIncomeErrorMsg: "",
    sourceIncomeData: [],
    sourceIncomeValueIndex: 0,
    sourceIncomePicker: false,

    // Source of Income related
    empType: PLEASE_SELECT,
    empTypeValue: null,
    empTypeObj: {},
    empTypeValid: true,
    empTypeErrorMsg: "",
    empTypeData: [],
    empTypeValueIndex: 0,
    empTypePicker: false,

    // Length of services related
    serviceYear: "Years",
    serviceYearValue: null,
    serviceYearObj: {},
    serviceYearValid: true,
    serviceYearErrorMsg: "",
    serviceYearData: [],
    serviceYearValueIndex: 0,
    serviceYearPicker: false,

    serviceMonth: "Months",
    serviceMonthValue: null,
    serviceMonthObj: {},
    serviceMonthValid: true,
    serviceMonthErrorMsg: "",
    serviceMonthData: [],
    serviceMonthValueIndex: 0,
    serviceMonthPicker: false,

    // Terms of employment related
    termsEmp: PLEASE_SELECT,
    termsEmpValue: null,
    termsEmpObj: {},
    termsEmpValid: true,
    termsEmpErrorMsg: "",
    termsEmpData: [],
    termsEmpValueIndex: 0,
    termsEmpPicker: false,

    //Employer name
    eName: "",
    eNameValid: true,
    eNameErrorMsg: "",

    // Others
    isContinueDisabled: true,

    //Popup Display
    showInfo: false,
    infoTitle: "",
    infoDescription: "",

    //Modal Display
    occupationModal: false,
    sectorModal: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns":
            return {
                ...state,
                occupationData:
                    payload?.serverData?.masterData?.occupations ?? state.occupationData,
                /*natBusinessData:
                    payload?.serverData?.masterData?.natureOfBusiness ?? state.natBusinessData,*/
                clsBusinessData:
                    payload?.serverData?.masterData?.businessClassification ??
                    state.clsBusinessData,

                sourceIncomeData:
                    payload?.serverData?.masterData?.country ?? state.sourceIncomeData,
                sectorData: payload?.serverData?.masterData?.sectors ?? state.sectorData,
                empTypeData: payload?.serverData?.masterData?.employmentType ?? state.empTypeData,
                serviceYearData:
                    payload?.serverData?.masterData?.lengthsOfServiceMonths ??
                    state.serviceYearData,
                serviceMonthData:
                    payload?.serverData?.masterData?.lengthsOfServiceYears ??
                    state.serviceMonthData,
                termsEmpData:
                    payload?.serverData?.masterData?.termsOfEmployment ?? state.termsEmpData,
            };

        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                occupationPicker: false,
                //natBusinessPicker: false,
                clsBusinessPicker: false,
                sectorPicker: false,
                sourceIncomePicker: false,
                empTypePicker: false,
                serviceYearPicker: false,
                serviceMonthPicker: false,
                termsEmpPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                occupationPicker: payload === "occupation",
                //natBusinessPicker: payload === "natBusiness",
                clsBusinessPicker: payload === "clsBusiness",
                sectorPicker: payload === "sector",
                sourceIncomePicker: payload === "sourceIncome",
                empTypePicker: payload === "empType",
                serviceYearPicker: payload === "serviceYear",
                serviceMonthPicker: payload === "serviceMonth",
                termsEmpPicker: payload === "termsEmp",
            };

        case "showModal":
            return payload === "occupation"
                ? { ...state, occupationModal: true }
                : payload === "sector"
                ? { ...state, sectorModal: true }
                : { ...state };

        case "hideModal":
            return {
                ...state,
                sectorModal: false,
                occupationModal: false,
            };

        case "updateValidationErrors":
            return {
                ...state,
                eNameValid: payload?.eNameValid ?? true,
                eNameErrorMsg: payload?.eNameErrorMsg ?? "",
            };

        case "occupationDone":
            return {
                ...state,
                occupation: payload?.occupation,
                occupationValue: payload?.occupationValue,
                occupationObj: payload?.occupationObj,
                occupationValueIndex: payload?.occupationValueIndex,
            };
        /*case "natBusinessDone":
            return {
                ...state,
                natBusiness: payload?.natBusiness,
                natBusinessValue: payload?.natBusinessValue,
                natBusinessObj: payload?.natBusinessObj,
                natBusinessValueIndex: payload?.natBusinessValueIndex,
            };*/
        case "clsBusinessDone":
            return {
                ...state,
                clsBusiness: payload?.clsBusiness,
                clsBusinessValue: payload?.clsBusinessValue,
                clsBusinessObj: payload?.clsBusinessObj,
                clsBusinessValueIndex: payload?.clsBusinessValueIndex,
            };
        case "sourceIncomeDone":
            return {
                ...state,
                sourceIncome: payload?.sourceIncome,
                sourceIncomeValue: payload?.sourceIncomeValue,
                sourceIncomeObj: payload?.sourceIncomeObj,
                sourceIncomeValueIndex: payload?.sourceIncomeValueIndex,
            };
        case "empTypeDone":
            return {
                ...state,
                empType: payload?.empType,
                empTypeValue: payload?.empTypeValue,
                empTypeObj: payload?.empTypeObj,
                empTypeValueIndex: payload?.empTypeValueIndex,
            };
        case "sectorDone":
            return {
                ...state,
                sector: payload?.sector,
                sectorValue: payload?.sectorValue,
                sectorObj: payload?.sectorObj,
                sectorValueIndex: payload?.sectorValueIndex,
            };
        case "serviceYearDone":
            return {
                ...state,
                serviceYear: payload?.serviceYear,
                serviceYearValue: payload?.serviceYearValue,
                serviceYearObj: payload?.serviceYearObj,
                serviceYearValueIndex: payload?.serviceYearValueIndex,
            };
        case "serviceMonthDone":
            return {
                ...state,
                serviceMonth: payload?.serviceMonth,
                serviceMonthValue: payload?.serviceMonthValue,
                serviceMonthObj: payload?.serviceMonthObj,
                serviceMonthValueIndex: payload?.serviceMonthValueIndex,
            };

        case "termsEmpDone":
            return {
                ...state,
                termsEmp: payload?.termsEmp,
                termsEmpValue: payload?.termsEmpValue,
                termsEmpObj: payload?.termsEmpObj,
                termsEmpValueIndex: payload?.termsEmpValueIndex,
            };

        case "eName":
            return {
                ...state,
                eName: payload,
            };

        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };

        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? "",
                infoDescription: payload?.desc ?? "",
            };
        default:
            return { ...state };
    }
}

function CardsEmployer({ navigation, route }) {
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
            masterData: {
                occupations,
                businessClassification,
                lengthsOfServiceMonths,
                lengthsOfServiceYears,
                termsOfEmployment,
                sectors,
                employmentType,
            },
        } = params?.serverData;
        const {
            empName,
            occupationCode,
            busClassification,
            sector,
            empType,
            serviceYear,
            serviceMonth,
            termOfEmployment,
        } = params?.populateObj;

        //Employer Name
        empName && dispatch({ actionType: "eName", payload: empName });

        //occupation
        if (occupationCode) {
            const occ = occupations.find((item) => item.value === occupationCode);
            occ &&
                dispatch({
                    actionType: "occupationDone",
                    payload: {
                        occupation: occ?.name,
                        occupationValue: occ?.value,
                        occupationObj: occ,
                    },
                });
        }
        //Business Classification
        if (busClassification) {
            const occ = businessClassification.find((item) => item.value === busClassification);
            occ &&
                dispatch({
                    actionType: "clsBusinessDone",
                    payload: {
                        clsBusiness: occ?.name,
                        clsBusinessValue: occ?.value,
                        clsBusinessObj: occ,
                    },
                });
        }

        //service Month
        if (serviceMonth) {
            const occ = lengthsOfServiceMonths.find((item) => item.value === serviceMonth);
            occ &&
                dispatch({
                    actionType: "serviceMonthDone",
                    payload: {
                        serviceMonth: occ?.name,
                        serviceMonthValue: occ?.value,
                        serviceMonthObj: occ,
                    },
                });
        }

        //service year
        if (serviceYear) {
            const occ = lengthsOfServiceYears.find((item) => item.value === serviceYear);
            occ &&
                dispatch({
                    actionType: "serviceYearDone",
                    payload: {
                        serviceYear: occ?.name,
                        serviceYearValue: occ?.value,
                        serviceYearObj: occ,
                    },
                });
        }

        //terms Of Employment
        if (termOfEmployment) {
            const term = termsOfEmployment.find((item) => item.value === termOfEmployment);
            term &&
                dispatch({
                    actionType: "termsEmpDone",
                    payload: {
                        termsEmp: term?.name,
                        termsEmpValue: term?.value,
                        termsEmpObj: term,
                    },
                });
        }

        //sector
        if (sector) {
            const term = sectors.find((item) => item.value === sector);
            console.log(sector);
            console.log(sectors);
            term &&
                dispatch({
                    actionType: "sectorDone",
                    payload: {
                        sector: term?.name,
                        sectorValue: term?.value,
                        sectorObj: term,
                    },
                });
        }

        //Employment Type
        if (empType) {
            const term = employmentType.find(
                (item) => item.name === empType || item.value === empType
            );
            term &&
                dispatch({
                    actionType: "empTypeDone",
                    payload: {
                        empType: term?.name,
                        empTypeValue: term?.value,
                        empTypeObj: term,
                    },
                });
        }
    }, [route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.occupation === PLEASE_SELECT ||
                //state.natBusiness === PLEASE_SELECT ||
                state.clsBusiness === PLEASE_SELECT ||
                state.empType === PLEASE_SELECT ||
                state.sector === PLEASE_SELECT ||
                state.sourceIncome === PLEASE_SELECT ||
                state.serviceYear === "Years" ||
                state.serviceMonth === "Months" ||
                state.termsEmp === PLEASE_SELECT ||
                state.eName === "",
        });
    }, [
        state.occupation,
        //state.natBusiness,
        state.clsBusiness,
        state.sourceIncome,
        state.sector,
        state.empType,
        state.serviceYear,
        state.serviceMonth,
        state.termsEmp,
        state.eName,
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

    function onCallbackModal(item, type) {
        switch (type) {
            case "occupation":
                dispatch({
                    actionType: "occupationDone",
                    payload: {
                        occupation: item?.name ?? PLEASE_SELECT,
                        occupationValue: item?.value ?? null,
                        occupationObj: item,
                    },
                });
                break;
            case "sector":
                dispatch({
                    actionType: "sectorDone",
                    payload: {
                        sector: item?.name ?? PLEASE_SELECT,
                        sectorValue: item?.value ?? null,
                        sectorObj: item,
                    },
                });
                break;
            default:
                break;
        }
        onCloseModal();
    }

    function onOccupationTap() {
        dispatch({
            actionType: "showModal",
            payload: "occupation",
        });
    }

    /*function onNatBusinessTap() {
        dispatch({
            actionType: "showPicker",
            payload: "natBusiness",
        });
    }*/

    function onClsBusinessTap() {
        dispatch({
            actionType: "showPicker",
            payload: "clsBusiness",
        });
    }

    function onSourceIncomeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "sourceIncome",
        });
    }

    function onSectorTap() {
        dispatch({
            actionType: "showModal",
            payload: "sector",
        });
    }

    function onEmpTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "empType",
        });
    }

    function onServiceYearTap() {
        dispatch({
            actionType: "showPicker",
            payload: "serviceYear",
        });
    }

    function onServiceMonthTap() {
        dispatch({
            actionType: "showPicker",
            payload: "serviceMonth",
        });
    }
    function onTermsEmpTap() {
        dispatch({
            actionType: "showPicker",
            payload: "termsEmp",
        });
    }

    function handleInfoPress({ title, desc }) {
        console.log("handleInfoPress");
        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title, desc },
        });
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: { show: false, title: "", desc: "" },
        });
    }

    function onCloseModal() {
        dispatch({
            actionType: "hideModal",
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
        console.log(pickerType);
        switch (pickerType) {
            case "occupation":
                dispatch({
                    actionType: "occupationDone",
                    payload: {
                        occupation: item?.name ?? PLEASE_SELECT,
                        occupationValue: item?.value ?? null,
                        occupationObj: item,
                        occupationValueIndex: index,
                    },
                });
                break;
            /*case "natBusiness":
                dispatch({
                    actionType: "natBusinessDone",
                    payload: {
                        natBusiness: item?.name ?? PLEASE_SELECT,
                        natBusinessValue: item?.value ?? null,
                        natBusinessObj: item,
                        natBusinessValueIndex: index,
                    },
                });
                break;*/
            case "clsBusiness":
                dispatch({
                    actionType: "clsBusinessDone",
                    payload: {
                        clsBusiness: item?.name ?? PLEASE_SELECT,
                        clsBusinessValue: item?.value ?? null,
                        clsBusinessObj: item,
                        clsBusinessValueIndex: index,
                    },
                });
                break;
            case "sourceIncome":
                dispatch({
                    actionType: "sourceIncomeDone",
                    payload: {
                        sourceIncome: item?.name ?? PLEASE_SELECT,
                        sourceIncomeValue: item?.value ?? null,
                        sourceIncomeObj: item,
                        sourceIncomeValueIndex: index,
                    },
                });
                break;
            case "sector":
                dispatch({
                    actionType: "sectorDone",
                    payload: {
                        sector: item?.name ?? PLEASE_SELECT,
                        sectorValue: item?.value ?? null,
                        sectorObj: item,
                        sectorValueIndex: index,
                    },
                });
                break;
            case "empType":
                dispatch({
                    actionType: "empTypeDone",
                    payload: {
                        empType: item?.name ?? PLEASE_SELECT,
                        empTypeValue: item?.value ?? null,
                        empTypeObj: item,
                        empTypeValueIndex: index,
                    },
                });
                break;
            case "serviceYear":
                dispatch({
                    actionType: "serviceYearDone",
                    payload: {
                        serviceYear: item?.name ?? PLEASE_SELECT,
                        serviceYearValue: item?.value ?? null,
                        serviceYearObj: item,
                        serviceYearValueIndex: index,
                    },
                });
                break;
            case "serviceMonth":
                dispatch({
                    actionType: "serviceMonthDone",
                    payload: {
                        serviceMonth: item?.name ?? PLEASE_SELECT,
                        serviceMonthValue: item?.value ?? null,
                        serviceMonthObj: item,
                        serviceMonthValueIndex: index,
                    },
                });
                break;
            case "termsEmp":
                dispatch({
                    actionType: "termsEmpDone",
                    payload: {
                        termsEmp: item?.name ?? PLEASE_SELECT,
                        termsEmpValue: item?.value ?? null,
                        termsEmpObj: item,
                        termsEmpValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onENameChange(value) {
        return dispatch({ actionType: "eName", payload: value });
    }

    const validateName = useCallback(() => {
        // name filter check
        if (!empNameRegex(state.eName)) {
            return {
                eNameValid: false,
                eNameErrorMsg: "Sorry, special characters are not allowed for Employer Name.",
            };
        }

        // Only alphanumeric check
        if (!nameRegex(state.eName)) {
            return {
                eNameValid: false,
                eNameErrorMsg: "Numeric characters are not allowed for Employer Name.",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.eName)) {
            return {
                eNameValid: false,
                eNameErrorMsg: "Sorry, your Name On Card must consist of alphabets only.",
            };
        }

        // Return true if no validation error
        return {
            eNameValid: true,
            eNameErrorMsg: "",
        };
    }, [state.eName]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });
        const { eNameValid, eNameErrorMsg } = validateName();

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                eNameValid,
                eNameErrorMsg,
            },
        });

        return eNameValid;
    }

    function getParamData() {
        const {
            eName,
            occupation,
            occupationValue,
            occupationObj,
            /*natBusiness,
            natBusinessValue,
            natBusinessObj,*/
            clsBusiness,
            clsBusinessValue,
            clsBusinessObj,
            sector,
            sectorValue,
            sectorObj,
            sourceIncome,
            sourceIncomeValue,
            sourceIncomeObj,
            empType,
            empTypeValue,
            empTypeObj,
            serviceYear,
            serviceYearValue,
            serviceYearObj,
            serviceMonth,
            serviceMonthValue,
            serviceMonthObj,
            termsEmp,
            termsEmpValue,
            termsEmpObj,
        } = state;

        return {
            prepopulateData: {
                empName: eName ?? "",
                occupationCode: occupationValue ?? "",
                natureOfBusiness: "",
                busClassification: clsBusinessValue ?? "",
                sourceIncome: sourceIncomeValue,
                sector: sectorValue ?? "",
                empType: empType ?? "",
                serviceYear: serviceYearValue ?? "",
                serviceMonth: serviceMonthValue ?? "",
                termOfEmployment: termsEmpValue ?? "",
            },
            displayData: {
                empName: {
                    displayKey: "Employer name ",
                    displayValue: eName,
                },
                occupation: {
                    displayKey: "Occupation",
                    displayValue: occupation,
                    selectedValue: occupationValue,
                    selectedDisplay: occupation,
                    selectedObj: occupationObj,
                },
                /*natureOfBusiness: {
                displayKey: "Nature of business",
                displayValue: natBusiness,
                selectedValue: natBusinessValue,
                selectedDisplay: natBusiness,
                selectedObj: natBusinessObj,
            },*/
                businessClassification: {
                    displayKey: "Business classification",
                    displayValue: clsBusiness,
                    selectedValue: clsBusinessValue,
                    selectedDisplay: clsBusiness,
                    selectedObj: clsBusinessObj,
                },
                sourceIncome: {
                    displayKey: "Source of Income",
                    displayValue: sourceIncome,
                    selectedValue: sourceIncomeValue,
                    selectedDisplay: sourceIncome,
                    selectedObj: sourceIncomeObj,
                },
                sector: {
                    displayKey: "Sector",
                    displayValue: sector,
                    selectedValue: sectorValue,
                    selectedDisplay: sector,
                    selectedObj: sectorObj,
                },
                empType: {
                    displayKey: "Employment Type",
                    displayValue: empType,
                    selectedValue: empTypeValue,
                    selectedDisplay: empType,
                    selectedObj: empTypeObj,
                },
                lengthOfService: {
                    displayKey: "Length of service",
                    displayValue: `${serviceYear}s ${serviceMonth}s `,
                    selectedValue: serviceYearValue,
                    selectedDisplay: serviceYear,
                    selectedObj: serviceYearObj,
                },
                serviceYear: {
                    displayKey: "Service Year",
                    displayValue: serviceYear,
                    selectedValue: serviceYearValue,
                    selectedDisplay: serviceYear,
                    selectedObj: serviceYearObj,
                },
                serviceMonth: {
                    displayKey: "Service Months",
                    displayValue: serviceMonth,
                    selectedValue: serviceMonthValue,
                    selectedDisplay: serviceMonth,
                    selectedObj: serviceMonthObj,
                },
                termsOfEmployment: {
                    displayKey: "Terms of employment",
                    displayValue: termsEmp,
                    selectedValue: termsEmpValue,
                    selectedDisplay: termsEmp,
                    selectedObj: termsEmpObj,
                },
            },
        };
    }

    async function handleProceedButton() {
        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;

            const obj = getParamData();
            const params = route?.params ?? {};
            const isSoleProp = state?.clsBusinessValue === "O";
            navigation.navigate("CardsOfficeAddress", {
                ...params,
                populateObj: { ...params?.populateObj, ...obj.prepopulateData },
                userAction: { ...params?.userAction, ...obj.displayData },
                isSoleProp,
            });
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_EMPLOYMENTDETAILS1
        : FA_APPLY_CREDITCARD_ETB_EMPLOYMENTDETAILS1;

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
                                    text="Step 4 of 6"
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
                                        text="Please fill in your employment details"
                                        textAlign="left"
                                    />
                                </View>
                                <SpaceFiller height={25} />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Employer name"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onENameChange}
                                        placeholder="e.g. Maybank"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.eNameValid}
                                        errorMessage={state.eNameErrorMsg}
                                        value={state.eName}
                                        maxLength={30}
                                    />
                                </View>

                                <LabeledDropdown
                                    label="Occupation"
                                    dropdownValue={state.occupation}
                                    isValid={state.occupationValid}
                                    errorMessage={state.occupationErrorMsg}
                                    onPress={onOccupationTap}
                                    style={styles.info}
                                    infoDetail={{
                                        title: CARDS_OCCUPATION,
                                        desc: CARDS_OCCPT_TOOLTIP,
                                    }}
                                    onInfoPress={handleInfoPress}
                                />
                                {/*<LabeledDropdown
                                    label="Nature of business"
                                    dropdownValue={state.natBusiness}
                                    isValid={state.natBusinessValid}
                                    errorMessage={state.natBusinessErrorMsg}
                                    onPress={onNatBusinessTap}
                                    style={styles.info}
                                />*/}
                                <LabeledDropdown
                                    label="Business classification"
                                    dropdownValue={state.clsBusiness}
                                    isValid={state.clsBusinessValid}
                                    errorMessage={state.clsBusinessErrorMsg}
                                    onPress={onClsBusinessTap}
                                    style={styles.info}
                                    infoDetail={{
                                        title: CARDS_BUSINESS,
                                        desc: CARDS_BUSCLASS_TOOLTIP,
                                    }}
                                    onInfoPress={handleInfoPress}
                                />
                                <LabeledDropdown
                                    label="Sector"
                                    dropdownValue={state.sector}
                                    isValid={state.sectorValid}
                                    errorMessage={state.sectorErrorMsg}
                                    onPress={onSectorTap}
                                    style={styles.info}
                                    infoDetail={{
                                        title: CARDS_SECTOR,
                                        desc: CARDS_SECT_TOOLTIP,
                                    }}
                                    onInfoPress={handleInfoPress}
                                />
                                <LabeledDropdown
                                    label="Employment Type"
                                    dropdownValue={state.empType}
                                    isValid={state.empTypeValid}
                                    errorMessage={state.empTypeErrorMsg}
                                    onPress={onEmpTypeTap}
                                    style={styles.info}
                                    infoDetail={{
                                        title: CARDS_EMPLOYEMENT,
                                        desc: CARDS_EMP_TOOLTIP,
                                    }}
                                    onInfoPress={handleInfoPress}
                                />
                                <View style={styles.rowPhone}>
                                    <LabeledDropdown
                                        label="Length of services"
                                        dropdownValue={state.serviceYear}
                                        isValid={state.serviceYearValid}
                                        errorMessage={state.serviceYearErrorMsg}
                                        onPress={onServiceYearTap}
                                        style={styles.dropDownRow}
                                    />
                                    <LabeledDropdown
                                        label=""
                                        dropdownValue={state.serviceMonth}
                                        isValid={state.serviceMonthValid}
                                        errorMessage={state.serviceMonthErrorMsg}
                                        onPress={onServiceMonthTap}
                                        style={styles.dropDownRow}
                                    />
                                </View>
                                <LabeledDropdown
                                    label="Terms of employment"
                                    dropdownValue={state.termsEmp}
                                    isValid={state.termsEmpValid}
                                    errorMessage={state.termsEmpErrorMsg}
                                    onPress={onTermsEmpTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Source of income"
                                    dropdownValue={state.sourceIncome}
                                    isValid={state.sourceIncomeValid}
                                    errorMessage={state.sourceIncomeErrorMsg}
                                    onPress={onSourceIncomeTap}
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
                                    backgroundColor={state.isContinueDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Continue"
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
                {state.occupationModal && state.occupationData && (
                    <SearchableList
                        onCallback={onCallbackModal}
                        onClose={onCloseModal}
                        data={state.occupationData}
                        type="occupation"
                        noResultMsg="Please select the category that is the closest match to your occupation."
                    />
                )}
                {/*state.natBusinessData && (
                    <ScrollPickerView
                        showMenu={state.natBusinessPicker}
                        list={state.natBusinessData}
                        selectedIndex={state.natBusinessValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )*/}
                {state.clsBusinessData && (
                    <ScrollPickerView
                        showMenu={state.clsBusinessPicker}
                        list={state.clsBusinessData}
                        selectedIndex={state.clsBusinessValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.sourceIncomeData && (
                    <ScrollPickerView
                        showMenu={state.sourceIncomePicker}
                        list={state.sourceIncomeData}
                        selectedIndex={state.sourceIncomeIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.sectorModal && state.sectorData && (
                    <SearchableList
                        data={state.sectorData}
                        onClose={onCloseModal}
                        onCallback={onCallbackModal}
                        type="sector"
                        noResultMsg="Please select the category that is the closest match to your job sector."
                    />
                )}
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
                {state.serviceYearData && (
                    <ScrollPickerView
                        showMenu={state.serviceYearPicker}
                        list={state.serviceYearData}
                        selectedIndex={state.serviceYearValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.serviceMonthData && (
                    <ScrollPickerView
                        showMenu={state.serviceMonthPicker}
                        list={state.serviceMonthData}
                        selectedIndex={state.serviceMonthValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.termsEmpData && (
                    <ScrollPickerView
                        showMenu={state.termsEmpPicker}
                        list={state.termsEmpData}
                        selectedIndex={state.termsEmpValueIndex}
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

CardsEmployer.propTypes = {
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
    dropDownRow: {
        paddingBottom: 24,
        width: "49%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    info: {
        paddingBottom: 24,
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
    view: {
        paddingHorizontal: 12,
    },
});

export default CardsEmployer;

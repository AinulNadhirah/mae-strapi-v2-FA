import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView, LongTextInput } from "@components/Common";
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
    CURRENCY,
    FA_APPLY_SUPPLEMENTARYCARD_PERSONALDETAILS,
    CARDS_OCCUPATION,
    CARDS_OCCPT_TOOLTIP,
    HOME_ADDRESS_LINE,
    HOME_ADDRESS_INFO,
    CARDS_SECTOR,
    CARDS_SECT_TOOLTIP,
    CARDS_EMPLOYEMENT,
    CARDS_EMP_TOOLTIP,
} from "@constants/strings";

import {
    addressCharRegexCC,
    leadingOrDoubleSpaceRegex,
    maeOnlyNumberRegex,
    cityCharRegex,
    validateEmail,
    nameRegex,
    numberCardsRegex,
    decimalCardsRegex,
    empNameRegex,
    numericRegex,
} from "@utils/dataModel";

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

    // Mobile Prefix related
    mobPrefix: "010..",
    mobPrefixValue: null,
    mobPrefixObj: {},
    mobPrefixValid: true,
    mobPrefixErrorMsg: "",
    mobPrefixData: [],
    mobPrefixValueIndex: 0,
    mobPrefixPicker: false,

    // Race related
    race: PLEASE_SELECT,
    raceValue: null,
    raceObj: {},
    raceValid: true,
    raceErrorMsg: "",
    raceData: [],
    raceValueIndex: 0,
    racePicker: false,

    // empType related
    empType: PLEASE_SELECT,
    empTypeValue: null,
    empTypeObj: {},
    empTypeValid: true,
    empTypeErrorMsg: "",
    empTypeData: [],
    empTypeValueIndex: 0,
    empTypePicker: false,

    // relationship related
    relationship: PLEASE_SELECT,
    relationshipValue: null,
    relationshipObj: {},
    relationshipValid: true,
    relationshipErrorMsg: "",
    relationshipData: [],
    relationshipValueIndex: 0,
    relationshipPicker: false,

    // Occupation related
    occupation: PLEASE_SELECT,
    occupationValue: null,
    occupationObj: {},
    occupationValid: true,
    occupationErrorMsg: "",
    occupationData: [],
    occupationValueIndex: 0,
    occupationPicker: false,

    // Sector related
    sector: PLEASE_SELECT,
    sectorValue: null,
    sectorObj: {},
    sectorValid: true,
    sectorErrorMsg: "",
    sectorData: [],
    sectorValueIndex: 0,
    sectorPicker: false,

    // State related
    stat: PLEASE_SELECT,
    statValue: null,
    statObj: {},
    statValid: true,
    statErrorMsg: "",
    statData: [],
    statValueIndex: 0,
    statPicker: false,

    // CC Credit limit
    cccLimt: PLEASE_SELECT,
    cccLimtValue: null,
    cccLimtValid: true,
    cccLimtErrorMsg: "",
    cccLimtData: [
        { name: "Assigned Credit Limit", value: "1" },
        { name: "Shared Credit Limit", value: "2" },
    ],
    cccLimtValueIndex: 0,
    cccLimtPicker: false,

    // CC Monthly statement
    cccStatement: PLEASE_SELECT,
    cccStatementValue: null,
    cccStatementValid: true,
    cccStatementErrorMsg: "",
    cccStatementData: [
        { name: "Separate Statement", value: "1" },
        { name: "Joint Statement", value: "2" },
    ],
    cccStatementValueIndex: 0,
    cccStatementPicker: false,

    // CC collection method
    /*cccMethod: PLEASE_SELECT,
    cccMethodValue: null,
    cccMethodValid: true,
    cccMethodErrorMsg: "",
    cccMethodData: [],
    cccMethodValueIndex: 0,
    cccMethodPicker: false,*/

    // CC collection state
    cccState: PLEASE_SELECT,
    cccStateValue: null,
    cccStateValid: true,
    cccStateErrorMsg: "",
    cccStateData: [],
    cccStateValueIndex: 0,
    cccStatePicker: false,

    // CC collection area/district
    cccDistrict: PLEASE_SELECT,
    cccDistrictValue: null,
    cccDistrictValid: true,
    cccDistrictErrorMsg: "",
    cccDistrictData: [],
    cccDistrictValueIndex: 0,
    cccDistrictPicker: false,

    // CC collection branch
    cccBranch: PLEASE_SELECT,
    cccBranchValue: null,
    cccBranchValid: true,
    cccBranchErrorMsg: "",
    cccBranchData: [],
    cccBranchValueIndex: 0,
    cccBranchPicker: false,

    // pep related
    pep: PLEASE_SELECT,
    pepValue: null,
    pepObj: {},
    pepValid: true,
    pepErrorMsg: "",
    pepData: [],
    pepValueIndex: 0,
    pepPicker: false,

    // Source of Income related
    sourceIncome: PLEASE_SELECT,
    sourceIncomeValue: null,
    sourceIncomeObj: {},
    sourceIncomeValid: true,
    sourceIncomeErrorMsg: "",
    sourceIncomeData: [],
    sourceIncomeValueIndex: 0,
    sourceIncomePicker: false,

    // Card Name related
    name: "",
    nameValid: true,
    nameErrorMsg: "",

    // full Name related
    nama: "",
    namaValid: true,
    namaErrorMsg: "",

    // Email related
    email: "",
    emailValid: true,
    emailErrorMsg: "",

    // Mob Number related
    mobNum: "",
    mobNumValid: true,
    mobNumErrorMsg: "",

    nationality: "Malaysia",
    nationalityValid: true,
    nationalityErrorMsg: "",

    selectedGenderType: "",
    selectedGenderCode: "",
    isMale: false,
    isFemale: false,

    // Home address line 1
    address1: "",
    address1Valid: true,
    address1ErrorMsg: "",

    // Home address line 2
    address2: "",
    address2Valid: true,
    address2ErrorMsg: "",

    // Home address line 3
    address3: "",
    address3Valid: true,
    address3ErrorMsg: "",

    // Postcode related
    postcode: "",
    postcodeValid: true,
    postcodeErrorMsg: "",

    // City related
    city: "",
    cityValid: true,
    cityErrorMsg: "",

    // amount related
    amount: "",
    amountValid: true,
    amountErrorMsg: "",
    isAmount: true,

    // percentage related
    percentage: "",
    percentageValid: true,
    percentageErrorMsg: "",
    isPercentage: false,

    //Monthly net income
    income: "",
    incomeValid: true,
    incomeErrorMsg: "",

    //Employer name
    eName: "",
    eNameValid: true,
    eNameErrorMsg: "",

    //Popup Display
    showInfo: false,
    infoTitle: "",
    infoDescription: "",

    //Modal Display
    occupationModal: false,
    sectorModal: false,

    // Others
    isContinueDisabled: false,
    addressBlock: ["UNKNOWN", "NIL", "NOT APPLICABLE", "NOTAPPL", "NOT/APPL"],
    showLimitOption: false,
    convertedCreditLimit2String: "0",
    convertedCreditLimit1String: "20000",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateData": {
            const stateArr = payload?.serverData?.stateData?.statesList;
            return {
                ...state,
                titleData: payload?.serverData?.masterData?.titles ?? state.titleData,
                mobPrefixData: payload?.serverData?.masterData?.mobileext ?? state.mobPrefixData,
                raceData: payload?.serverData?.masterData?.race ?? state.raceData,
                empTypeData:
                    payload?.serverData?.masterData?.employmentType ?? state.employmentType,
                relationshipData:
                    payload?.serverData?.masterData?.relationStatus ?? state.relationshipData,
                occupationData:
                    payload?.serverData?.masterData?.occupations ?? state.occupationData,
                sectorData: payload?.serverData?.masterData?.sectors ?? state.sectorData,
                statData: stateArr ?? state.statData,
                sourceIncomeData:
                    payload?.serverData?.masterData?.country ?? state.sourceIncomeData,
                //cccMethodData: payload?.cccMethod ?? state.cccMethodData,
                cccStateData: stateArr ?? state.cccStateData,
                cccDistrictData: payload?.cccDistrict ?? state.cccDistrictData,
                cccBranchData: payload?.cccBranch ?? state.cccBranchData,
                pepData: payload?.serverData?.masterData?.pep ?? state.pepData,
                // To bind the data to the employment details form
                title: payload?.userAction?.title?.displayValue ?? state.title,
                nama: payload?.userAction?.nama?.displayValue ?? state.nama,
                relationship: payload?.userAction?.relationship?.displayValue ?? state.relationship,
                name: payload?.userAction?.name?.displayValue ?? state.name,
                email: payload?.userAction?.email2?.displayValue ?? state.email,
                mobPrefix: payload?.userAction?.mobilePrefix?.displayValue ?? state.mobPrefix,
                mobNum: payload?.userAction?.mobileNumber?.selectedValue ?? state.mobNum,
                selectedGenderCode:
                    payload?.userAction?.gender?.selectedValue ?? state.selectedGenderCode,
                isMale:
                    payload?.userAction?.gender?.selectedValue === "M"
                        ? true
                        : false ?? state.isMale,
                isFemale:
                    payload?.userAction?.gender?.selectedValue === "F"
                        ? true
                        : false ?? state.isFemale,
                race: payload?.userAction?.race?.displayValue ?? state.race,
                nationality: payload?.userAction?.nationality?.displayValue ?? state.nationality,
                occupation: payload?.userAction?.occupation?.displayValue ?? state.occupation,
                sector: payload?.userAction?.sector?.displayValue ?? state.sector,
                empType: payload?.userAction?.empType?.displayValue ?? state.empType,
                address1: payload?.userAction?.homeAddress1?.displayValue ?? state.address1,
                address2: payload?.userAction?.homeAddress2?.displayValue ?? state.address2,
                address3: payload?.userAction?.homeAddress3?.displayValue ?? state.address3,
                postcode: payload?.userAction?.postcode?.displayValue ?? state.postcode,
                city: payload?.userAction?.city?.displayValue ?? state.city,
                stat: payload?.userAction?.state?.displayValue ?? state.stat,
                cccLimt: payload?.userAction?.creditLimit?.displayValue ?? state.cccLimt,
                amount: payload?.userAction?.amountRM?.displayValue ?? state.amount,
                percentage: payload?.userAction?.amountPercentage?.displayValue ?? state.percentage,
                pep: payload?.userAction?.pep?.displayValue ?? state.pep,
                sourceIncome: payload?.userAction?.sourceIncome?.displayValue ?? state.sourceIncome,
                income: payload?.userAction?.income?.selectedValue ?? state.income,
                eName: payload?.userAction?.empName?.displayValue ?? state.eName,
                cccStatement:
                    payload?.userAction?.monthlyStatement?.displayValue ?? state.cccStatement,
                cccState: payload?.userAction?.collectionState?.displayValue ?? state.cccState,
                cccDistrict:
                    payload?.userAction?.collectionDistrict?.displayValue ?? state.cccDistrict,
                cccBranch: payload?.userAction?.collectionBranch?.displayValue ?? state.cccBranch,
            };
        }

        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? "",
                infoDescription: payload?.desc ?? "",
            };

        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                titlePicker: false,
                mobPrefixPicker: false,
                racePicker: false,
                empTypePicker: false,
                relationshipPicker: false,
                occupationPicker: false,
                sectorPicker: false,
                cccLimtPicker: false,
                cccStatementPicker: false,
                sourceIncomePicker: false,
                //cccMethodPicker: false,
                statPicker: false,
                cccStatePicker: false,
                cccDistrictPicker: false,
                cccBranchPicker: false,
                pepPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                titlePicker: payload === "title",
                mobPrefixPicker: payload === "mobPrefix",
                racePicker: payload === "race",
                empTypePicker: payload === "empType",
                relationshipPicker: payload === "relationship",
                occupationPicker: payload === "occupation",
                sectorPicker: payload === "sector",
                cccLimtPicker: payload === "cccLimt",
                cccStatementPicker: payload === "cccStatement",
                sourceIncomePicker: payload === "sourceIncome",
                //cccMethodPicker: payload === "cccMethod",
                statPicker: payload === "stat",
                cccStatePicker: payload === "cccState",
                cccDistrictPicker: payload === "cccDistrict",
                cccBranchPicker: payload === "cccBranch",
                pepPicker: payload === "pep",
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
        case "titleDone":
            return {
                ...state,
                title: payload?.title,
                titleValue: payload?.titleValue,
                titleObj: payload?.titleObj,
                titleValueIndex: payload?.titleValueIndex,
            };
        case "relationshipDone":
            return {
                ...state,
                relationship: payload?.relationship,
                relationshipValue: payload?.relationshipValue,
                relationshipObj: payload?.relationshipObj,
                relationshipValueIndex: payload?.relationshipValueIndex,
            };
        case "mobPrefixDone":
            return {
                ...state,
                mobPrefix: payload?.mobPrefix,
                mobPrefixValue: payload?.mobPrefixValue,
                mobPrefixObj: payload?.mobPrefixObj,
                mobPrefixValueIndex: payload?.mobPrefixValueIndex,
            };
        case "raceDone":
            return {
                ...state,
                race: payload?.race,
                raceValue: payload?.raceValue,
                raceObj: payload?.raceObj,
                raceValueIndex: payload?.raceValueIndex,
            };
        case "empTypeDone":
            return {
                ...state,
                empType: payload?.empType,
                empTypeValue: payload?.empTypeValue,
                empTypeObj: payload?.empTypeObj,
                empTypeValueIndex: payload?.empTypeValueIndex,
            };
        case "occupationDone":
            return {
                ...state,
                occupation: payload?.occupation,
                occupationValue: payload?.occupationValue,
                occupationObj: payload?.occupationObj,
                occupationValueIndex: payload?.occupationValueIndex,
            };
        case "sectorDone":
            return {
                ...state,
                sector: payload?.sector,
                sectorValue: payload?.sectorValue,
                sectorObj: payload?.sectorObj,
                sectorValueIndex: payload?.sectorValueIndex,
            };
        case "statDone":
            return {
                ...state,
                stat: payload?.stat,
                statValue: payload?.statValue,
                statObj: payload?.statObj,
                statValueIndex: payload?.statValueIndex,
            };

        case "cccLimtDone":
            return {
                ...state,
                cccLimt: payload?.cccLimt,
                cccLimtValue: payload?.cccLimtValue,
                cccLimtObj: payload?.cccLimtObj,
                cccLimtValueIndex: payload?.cccLimtValueIndex,
                showLimitOption: payload?.showLimitOption,
            };
        case "cccStatementDone":
            return {
                ...state,
                cccStatement: payload?.cccStatement,
                cccStatementValue: payload?.cccStatementValue,
                cccStatementObj: payload?.cccStatementObj,
                cccStatementValueIndex: payload?.cccStatementValueIndex,
            };
        case "cccStateDone":
            return {
                ...state,
                cccState: payload?.cccState,
                cccStateValue: payload?.cccStateValue,
                cccStateObj: payload?.cccStateObj,
                cccStateValueIndex: payload?.cccStateValueIndex,
                cccDistrictData: payload?.cccDistrictData,
            };
        case "cccDistrictDone":
            return {
                ...state,
                cccDistrict: payload?.cccDistrict,
                cccDistrictValue: payload?.cccDistrictValue,
                cccDistrictObj: payload?.cccDistrictObj,
                cccDistrictValueIndex: payload?.cccDistrictValueIndex,
                cccBranchData: payload?.cccBranchData,
            };
        case "cccBranchDone":
            return {
                ...state,
                cccBranch: payload?.cccBranch,
                cccBranchValue: payload?.cccBranchValue,
                cccBranchObj: payload?.cccBranchObj,
                cccBranchValueIndex: payload?.cccBranchValueIndex,
            };
        case "pepDone":
            return {
                ...state,
                pep: payload?.pep,
                pepValue: payload?.pepValue,
                pepObj: payload?.pepObj,
                pepValueIndex: payload?.pepValueIndex,
            };
        case "sourceIncomeDone":
            return {
                ...state,
                sourceIncome: payload?.sourceIncome,
                sourceIncomeValue: payload?.sourceIncomeValue,
                sourceIncomeObj: payload?.sourceIncomeObj,
                sourceIncomeValueIndex: payload?.sourceIncomeValueIndex,
            };
        case "gender":
            return {
                ...state,
                selectedGenderType: payload?.selectedGenderType,
                selectedGenderCode: payload?.selectedGenderCode,
                isMale: payload?.isMale,
                isFemale: payload?.isFemale,
            };
        case "amountSelect":
        case "percentageSelect":
            return {
                ...state,
                isAmount: payload?.isAmount,
                isPercentage: payload?.isPercentage,
            };
        case "nama":
            return {
                ...state,
                nama: payload,
            };
        case "name":
            return {
                ...state,
                name: payload,
            };
        case "email":
            return {
                ...state,
                email: payload,
            };
        case "mobNum":
            return {
                ...state,
                mobNum: payload,
            };
        case "nationality":
            return {
                ...state,
                nationality: payload,
            };
        case "address1":
            return {
                ...state,
                address1: payload,
            };
        case "address2":
            return {
                ...state,
                address2: payload,
            };
        case "address3":
            return {
                ...state,
                address3: payload,
            };
        case "postcode":
            return {
                ...state,
                postcode: payload,
            };
        case "city":
            return {
                ...state,
                city: payload,
            };
        case "amount":
            return {
                ...state,
                amount: payload,
            };
        case "percentage":
            return {
                ...state,
                percentage: payload,
            };
        case "income":
            return {
                ...state,
                income: payload,
            };
        case "eName":
            return {
                ...state,
                eName: payload,
            };
        case "isContinueDisabled":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "updateValidationErrors":
            return {
                ...state,
                nameValid: payload?.nameValid ?? true,
                nameErrorMsg: payload?.nameErrorMsg ?? "",
                namaValid: payload?.namaValid ?? true,
                namaErrorMsg: payload?.namaErrorMsg ?? "",
                emailValid: payload?.emailValid ?? true,
                emailErrorMsg: payload?.emailErrorMsg ?? "",
                mobNumValid: payload?.mobNumValid ?? true,
                mobNumErrorMsg: payload?.mobNumErrorMsg ?? "",
                address1Valid: payload?.address1Valid ?? true,
                address1ErrorMsg: payload?.address1ErrorMsg ?? "",
                address2Valid: payload?.address2Valid ?? true,
                address2ErrorMsg: payload?.address2ErrorMsg ?? "",
                address3Valid: payload?.address3Valid ?? true,
                address3ErrorMsg: payload?.address3ErrorMsg ?? "",
                postcodeValid: payload?.postcodeValid ?? true,
                postcodeErrorMsg: payload?.postcodeErrorMsg ?? "",
                cityValid: payload?.cityValid ?? true,
                cityErrorMsg: payload?.cityErrorMsg ?? "",
                amountValid: payload?.amountValid ?? true,
                amountErrorMsg: payload?.amountErrorMsg ?? "",
                percentageValid: payload?.percentageValid ?? true,
                percentageErrorMsg: payload?.percentageErrorMsg ?? "",
                incomeValid: payload?.incomeValid ?? true,
                incomeErrorMsg: payload?.incomeErrorMsg ?? "",
                eNameValid: payload?.eNameValid ?? true,
                eNameErrorMsg: payload?.eNameErrorMsg ?? "",
            };
        default:
            return { ...state };
    }
}

function CardSuppCollection({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const customerFlag = route?.params?.customerFlag;

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            dispatch({
                actionType: "PopulateData",
                payload: params,
            });
        } catch (error) {
            console.log(error);
            navigation.canGoBack() && navigation.goBack();
        }
    }, [navigation, route?.params]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.title === PLEASE_SELECT ||
                state.mobPrefix === "010.." ||
                state.race === PLEASE_SELECT ||
                state.empType === PLEASE_SELECT ||
                state.relationship === PLEASE_SELECT ||
                state.occupation === PLEASE_SELECT ||
                state.stat === PLEASE_SELECT ||
                state.cccLimt === PLEASE_SELECT ||
                state.cccStatement === PLEASE_SELECT ||
                state.cccMethod === PLEASE_SELECT ||
                state.cccState === PLEASE_SELECT ||
                state.cccDistrict === PLEASE_SELECT ||
                state.cccBranch === PLEASE_SELECT ||
                state.nama === "" ||
                state.name === "" ||
                state.email === "" ||
                state.mobNum === "" ||
                state.nationality === "" ||
                state.address1 === "" ||
                state.address2 === "" ||
                state.postcode === "" ||
                state.city === "" ||
                state.selectedGenderCode === "" ||
                (customerFlag === "0" && state.income === "") ||
                (customerFlag === "0" && state.pep === PLEASE_SELECT) ||
                (customerFlag === "0" && state.sourceIncome === PLEASE_SELECT) ||
                (state.showLimitOption && state.isAmount && state.amount === "") ||
                (state.showLimitOption && state.isPercentage && state.percentage === "") ||
                (customerFlag === "0" && state.eName === ""),
        });
    }, [
        state.address1,
        state.address2,
        state.address3,
        state.cccBranch,
        state.cccDistrict,
        state.cccLimt,
        state.cccMethod,
        state.cccState,
        state.cccStatement,
        state.city,
        state.email,
        state.empType,
        state.mobNum,
        state.mobPrefix,
        state.nama,
        state.name,
        state.nationality,
        state.occupation,
        state.postcode,
        state.race,
        state.relationship,
        state.stat,
        state.title,
        state.selectedGenderCode,
        state.amount,
        state.percentage,
        state.showLimitOption,
        state.isPercentage,
        state.isAmount,
        state.pep,
        state.income,
        state.eName,
        state.sourceIncome,
        route.params.customerFlag,
        customerFlag,
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

    function handleInfoPress({ title, desc }) {
        console.log("handleInfoPress");

        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title, desc },
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
            case "race":
                dispatch({
                    actionType: "raceDone",
                    payload: {
                        race: item?.name ?? PLEASE_SELECT,
                        raceValue: item?.value ?? null,
                        raceObj: item,
                        raceValueIndex: index,
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
            case "relationship":
                dispatch({
                    actionType: "relationshipDone",
                    payload: {
                        relationship: item?.name ?? PLEASE_SELECT,
                        relationshipValue: item?.value ?? null,
                        relationshipObj: item,
                        relationshipValueIndex: index,
                    },
                });
                break;
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
            case "stat":
                dispatch({
                    actionType: "statDone",
                    payload: {
                        stat: item?.name ?? PLEASE_SELECT,
                        statValue: item?.value ?? null,
                        statObj: item,
                        statValueIndex: index,
                    },
                });
                break;
            case "cccLimt":
                dispatch({
                    actionType: "cccLimtDone",
                    payload: {
                        cccLimt: item?.name ?? PLEASE_SELECT,
                        cccLimtValue: item?.value ?? null,
                        cccLimtObj: item,
                        cccLimtValueIndex: index,
                        showLimitOption: item?.value === "1",
                    },
                });
                break;
            case "cccStatement":
                dispatch({
                    actionType: "cccStatementDone",
                    payload: {
                        cccStatement: item?.name ?? PLEASE_SELECT,
                        cccStatementValue: item?.value ?? null,
                        cccStatementObj: item,
                        cccStatementValueIndex: index,
                    },
                });
                break;
            case "cccState": {
                const district = getDistrictData(item);
                dispatch({
                    actionType: "cccStateDone",
                    payload: {
                        cccState: item?.name ?? PLEASE_SELECT,
                        cccStateValue: item?.value ?? null,
                        cccStateObj: item,
                        cccStateValueIndex: index,
                        cccDistrictData: district ?? [],
                    },
                });
                break;
            }
            case "cccDistrict": {
                const branch = getBranchData(item);
                dispatch({
                    actionType: "cccDistrictDone",
                    payload: {
                        cccDistrict: item?.name ?? PLEASE_SELECT,
                        cccDistrictValue: item?.value ?? null,
                        cccDistrictObj: item,
                        cccDistrictValueIndex: index,
                        cccBranchData: branch,
                    },
                });
                break;
            }
            case "cccBranch":
                dispatch({
                    actionType: "cccBranchDone",
                    payload: {
                        cccBranch: item?.name ?? PLEASE_SELECT,
                        cccBranchValue: item?.value ?? null,
                        cccBranchObj: item,
                        cccBranchValueIndex: index,
                    },
                });
                break;
            case "pep":
                dispatch({
                    actionType: "pepDone",
                    payload: {
                        pep: item?.name ?? PLEASE_SELECT,
                        pepValue: item?.value ?? null,
                        pepObj: item,
                        pepValueIndex: index,
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
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function onPickerCancel() {
        dispatch({
            actionType: "hidePicker",
            payload: true,
        });
    }

    function onCloseModal() {
        dispatch({
            actionType: "hideModal",
        });
    }

    function onSourceIncomeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "sourceIncome",
        });
    }

    function handleToggle(param) {
        const radioBtnId = param.radioBtnId;
        switch (radioBtnId) {
            case "Male":
                dispatch({
                    actionType: "gender",
                    payload: {
                        selectedGenderType: radioBtnId,
                        selectedGenderCode: "M",
                        isMale: true,
                        isFemale: false,
                    },
                });
                break;
            case "Female":
                dispatch({
                    actionType: "gender",
                    payload: {
                        selectedGenderType: radioBtnId,
                        selectedGenderCode: "F",
                        isMale: false,
                        isFemale: true,
                    },
                });
                break;
            case "Percentage":
                dispatch({
                    actionType: "percentageSelect",
                    payload: {
                        isAmount: false,
                        isPercentage: true,
                    },
                });
                break;
            case "Amount":
                dispatch({
                    actionType: "amountSelect",
                    payload: {
                        isAmount: true,
                        isPercentage: false,
                    },
                });
                break;
            default:
                break;
        }
    }

    function onTitleTap() {
        dispatch({
            actionType: "showPicker",
            payload: "title",
        });
    }
    function onMobPrefixTap() {
        dispatch({
            actionType: "showPicker",
            payload: "mobPrefix",
        });
    }
    function onRaceTap() {
        dispatch({
            actionType: "showPicker",
            payload: "race",
        });
    }
    function onEmpTypeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "empType",
        });
    }
    function onRelationshipTap() {
        dispatch({
            actionType: "showPicker",
            payload: "relationship",
        });
    }

    function onOccupationTap() {
        dispatch({
            actionType: "showModal",
            payload: "occupation",
        });
    }

    function onSectorTap() {
        dispatch({
            actionType: "showModal",
            payload: "sector",
        });
    }

    function onCccLimtTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccLimt",
        });
    }

    function onCccStatementTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccStatement",
        });
    }

    function onCccStateTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccState",
        });
    }

    /*function onCccMethodTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccMethod",
        });
    }*/
    function onCccDistricTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccDistrict",
        });
    }
    function onCccBranchTap() {
        dispatch({
            actionType: "showPicker",
            payload: "cccBranch",
        });
    }

    function onStatTap() {
        dispatch({
            actionType: "showPicker",
            payload: "stat",
        });
    }

    function onPepTap() {
        dispatch({
            actionType: "showPicker",
            payload: "pep",
        });
    }

    function onENameChange(value) {
        return dispatch({ actionType: "eName", payload: value });
    }

    function onNamaChange(value) {
        return dispatch({ actionType: "nama", payload: value });
    }

    function onNameChange(value) {
        return dispatch({ actionType: "name", payload: value });
    }

    function onEmailChange(value) {
        return dispatch({ actionType: "email", payload: value });
    }

    function onMobNumChange(value) {
        return dispatch({ actionType: "mobNum", payload: value });
    }

    function onNationalityChange(value) {
        return dispatch({ actionType: "nationality", payload: value });
    }

    function onAddress1Change(value) {
        return dispatch({ actionType: "address1", payload: value });
    }
    function onAddress2Change(value) {
        return dispatch({ actionType: "address2", payload: value });
    }
    function onAddress3Change(value) {
        return dispatch({ actionType: "address3", payload: value });
    }

    function onPostcodeChange(value) {
        return dispatch({ actionType: "postcode", payload: value });
    }

    function onCityChange(value) {
        return dispatch({ actionType: "city", payload: value });
    }

    function onPercentageChange(value) {
        return dispatch({ actionType: "percentage", payload: value });
    }

    function onAmountChange(value) {
        return dispatch({ actionType: "amount", payload: value });
    }

    function onIncomeChange(value) {
        return dispatch({ actionType: "income", payload: value });
    }

    const validateIncome = useCallback(() => {
        // Only number check
        if (customerFlag === "0" && !numericRegex(state.income)) {
            return {
                incomeValid: false,
                incomeErrorMsg:
                    "Sorry, your Monthly Net Income should be rounded down with no decimal point.",
            };
        }
        // Return true if no validation error
        return {
            incomeValid: true,
            incomeErrorMsg: "",
        };
    }, [state.income]);

    const validateEName = useCallback(() => {
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

    const validateName = useCallback(() => {
        // Only alphanumeric check
        if (!nameRegex(state.name)) {
            return {
                nameValid: false,
                nameErrorMsg: "Sorry, your Name On Card must consist of alphabets only.",
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

    const validateNama = useCallback(() => {
        // Only alphanumeric check
        if (!nameRegex(state.nama)) {
            return {
                namaValid: false,
                namaErrorMsg: "Sorry, special characters are not allowed for Name (As per ID).",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.nama)) {
            return {
                namaValid: false,
                namaErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Name (As per ID).",
            };
        }

        // Return true if no validation error
        return {
            namaValid: true,
            namaErrorMsg: "",
        };
    }, [state.nama]);

    const validateEml = useCallback(() => {
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

    const validateAddess1 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address1)) {
            return {
                address1Valid: false,
                address1ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space checks
        if (!leadingOrDoubleSpaceRegex(state.address1)) {
            return {
                address1Valid: false,
                address1ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 1.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address1.toUpperCase()) > -1) {
            return {
                address1Valid: false,
                address1ErrorMsg: "Please enter valid Mailing Address 1.",
            };
        }

        // Return true if no validation error
        return {
            address1Valid: true,
            address1ErrorMsg: "",
        };
    }, [state.address1, state.addressBlock]);

    const validateAddess2 = useCallback(() => {
        // No special characters check
        if (!addressCharRegexCC(state.address2)) {
            return {
                address2Valid: false,
                address2ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space check
        if (!leadingOrDoubleSpaceRegex(state.address2)) {
            return {
                address2Valid: false,
                address2ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 2.",
            };
        }

        //  special word checks
        if (state.addressBlock.indexOf(state.address2.toUpperCase()) > -1) {
            return {
                address2Valid: false,
                address2ErrorMsg: "Please enter valid Mailing Address 2.",
            };
        }

        // Return true if no validation error
        return {
            address2Valid: true,
            address2ErrorMsg: "",
        };
    }, [state.address2, state.addressBlock]);

    const validateAddess3 = useCallback(() => {
        // No special characters check
        if (state.address3 !== "" && !addressCharRegexCC(state.address3)) {
            return {
                address3Valid: false,
                address3ErrorMsg:
                    "Sorry, you are not allowed to key in special characters for House Address.",
            };
        }

        //  space check
        if (state.address3 !== "" && !leadingOrDoubleSpaceRegex(state.address3)) {
            return {
                address3Valid: false,
                address3ErrorMsg:
                    "Sorry, Double spaces or leading spaces are not allowed for Mailing Address 3.",
            };
        }

        //  special word checks
        if (
            state.address3 !== "" &&
            state.addressBlock.indexOf(state.address3.toUpperCase()) > -1
        ) {
            return {
                address3Valid: false,
                address3ErrorMsg: "Please enter valid Mailing Address 3.",
            };
        }

        // Return true if no validation error
        return {
            address3Valid: true,
            address3ErrorMsg: "",
        };
    }, [state.address3, state.addressBlock]);

    const validatePostcode = useCallback(() => {
        // Min length check
        if (state.postcode.length !== 5) {
            return {
                postcodeValid: false,
                postcodeErrorMsg: "Sorry, your Postcode must consists of 5 digits only",
            };
        }
        // No special characters check
        if (!maeOnlyNumberRegex(state.postcode)) {
            return {
                postcodeValid: false,
                postcodeErrorMsg:
                    "Sorry, you are not allowed to key in special characters for Postcode.",
            };
        }

        // Return true if no validation error
        return {
            postcodeValid: true,
            postcodeErrorMsg: "",
        };
    }, [state.postcode]);

    const validateCity = useCallback(() => {
        // No special characters check
        if (!cityCharRegex(state.city)) {
            return {
                cityValid: false,
                cityErrorMsg: "City must not contain special character.",
            };
        }

        // Return true if no validation error
        return {
            cityValid: true,
            cityErrorMsg: "",
        };
    }, [state.city]);

    const validateAmount = useCallback(() => {
        if (state.showLimitOption && state.amount) {
            const ctype = route?.params?.userAction?.ccType?.selectedDisplay;
            const limitString =
                ctype.charAt(0).toUpperCase() === "C"
                    ? state.convertedCreditLimit1String
                    : state.convertedCreditLimit2String;
            if (!numberCardsRegex(state.amount)) {
                return {
                    amountValid: false,
                    amountErrorMsg: "Credit Limit must be numeric.",
                };
            }

            if (!decimalCardsRegex(state.amount)) {
                return {
                    amountValid: false,
                    amountErrorMsg:
                        "Sorry,Credit Limit should be round down with no decimal point.",
                };
            }

            if (Numeral(state.amount) <= 0) {
                return {
                    amountValid: false,
                    amountErrorMsg: "Invalid Credit Limit",
                };
            }

            if (Numeral(state.amount) > Numeral(limitString)) {
                return {
                    amountValid: false,
                    amountErrorMsg: "RM Exceeds credit limit",
                };
            }
        }

        // Return true if no validation error
        return {
            amountValid: true,
            amountErrorMsg: "",
        };
    }, [
        route?.params?.userAction?.ccType?.selectedDisplay,
        state.amount,
        state.convertedCreditLimit1String,
        state.convertedCreditLimit2String,
        state.showLimitOption,
    ]);

    const validatePercentage = useCallback(() => {
        if (state.showLimitOption && state.percentage) {
            if (!numberCardsRegex(state.percentage)) {
                return {
                    percentageValid: false,
                    percentageErrorMsg: "Credit Limit must be numeric.",
                };
            }

            if (!decimalCardsRegex(state.percentage)) {
                return {
                    percentageValid: false,
                    percentageErrorMsg:
                        "Sorry,Credit Limit should be round down with no decimal point.",
                };
            }

            if (state.percentage >= 100 || state.percentage <= 0) {
                return {
                    percentageValid: false,
                    percentageErrorMsg: "Invalid Credit Limit",
                };
            }
        }

        // Return true if no validation error
        return {
            percentageValid: true,
            percentageErrorMsg: "",
        };
    }, [state.percentage, state.showLimitOption]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { nameValid, nameErrorMsg } = validateName();
        const { namaValid, namaErrorMsg } = validateNama();
        const { emailValid, emailErrorMsg } = validateEml();
        const { mobNumValid, mobNumErrorMsg } = validateMobNum();
        const { address1Valid, address1ErrorMsg } = validateAddess1();
        const { address2Valid, address2ErrorMsg } = validateAddess2();
        const { address3Valid, address3ErrorMsg } = validateAddess3();
        const { postcodeValid, postcodeErrorMsg } = validatePostcode();
        const { cityValid, cityErrorMsg } = validateCity();
        const { amountValid, amountErrorMsg } = validateAmount();
        const { percentageValid, percentageErrorMsg } = validatePercentage();
        const { incomeValid, incomeErrorMsg } = validateIncome();
        const { eNameValid, eNameErrorMsg } = validateEName();
        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                namaValid,
                namaErrorMsg,
                nameValid,
                nameErrorMsg,
                emailValid,
                emailErrorMsg,
                mobNumValid,
                mobNumErrorMsg,
                address1Valid,
                address1ErrorMsg,
                address2Valid,
                address2ErrorMsg,
                address3Valid,
                address3ErrorMsg,
                postcodeValid,
                postcodeErrorMsg,
                cityValid,
                cityErrorMsg,
                amountValid,
                amountErrorMsg,
                percentageValid,
                percentageErrorMsg,
                incomeValid,
                incomeErrorMsg,
                eNameValid,
                eNameErrorMsg,
            },
        });

        return (
            nameValid &&
            namaValid &&
            emailValid &&
            mobNumValid &&
            address1Valid &&
            address2Valid &&
            address3Valid &&
            postcodeValid &&
            cityValid &&
            amountValid &&
            percentageValid &&
            incomeValid
        );
    }

    function getParamData() {
        const {
            title,
            titleValue,
            titleObj,
            nama,
            name,
            email,
            mobNum,
            selectedGenderType,
            selectedGenderCode,
            relationship,
            relationshipValue,
            relationshipObj,
            race,
            raceValue,
            raceObj,
            empType,
            empTypeValue,
            empTypeObj,
            nationality,
            occupation,
            occupationValue,
            occupationObj,
            sector,
            sectorValue,
            sectorObj,
            mobPrefix,
            mobPrefixValue,
            mobPrefixObj,
            address1,
            address2,
            address3,
            postcode,
            city,
            stat,
            statValue,
            statObj,
            amount,
            percentage,
            cccLimt,
            cccLimtValue,
            cccLimtObj,
            cccStatement,
            cccStatementValue,
            cccStatementObj,
            cccState,
            cccStateValue,
            cccStateObj,
            cccDistrict,
            cccDistrictValue,
            cccDistrictObj,
            cccBranch,
            cccBranchValue,
            cccBranchObj,
            pep,
            pepValue,
            pepObj,
            income,
            eName,
            sourceIncome,
            sourceIncomeValue,
            sourceIncomeObj,
        } = state;
        return {
            displayData: {
                title: {
                    displayKey: "Title",
                    displayValue: title,
                    selectedValue: titleValue,
                    selectedDisplay: title,
                    selectedObj: titleObj,
                },
                nama: {
                    displayKey: "Name",
                    displayValue: nama,
                },
                name: {
                    displayKey: "Name on card",
                    displayValue: name,
                },
                relationship: {
                    displayKey: "Relationship to principal",
                    displayValue: relationship,
                    selectedValue: relationshipValue,
                    selectedDisplay: relationship,
                    selectedObj: relationshipObj,
                },
                email2: {
                    displayKey: "Email address",
                    displayValue: email,
                },
                mobileNumber: {
                    displayKey: "Mobile number",
                    displayValue: mobPrefix + mobNum,
                    selectedValue: mobNum,
                },
                mobilePrefix: {
                    displayKey: "Mobile Number Prefix",
                    displayValue: mobPrefix,
                    selectedValue: mobPrefixValue,
                    selectedDisplay: mobPrefix,
                    selectedObj: mobPrefixObj,
                },
                gender: {
                    displayKey: "Gender",
                    displayValue: selectedGenderType,
                    selectedValue: selectedGenderCode,
                },
                race: {
                    displayKey: "Race",
                    displayValue: race,
                    selectedValue: raceValue,
                    selectedDisplay: race,
                    selectedObj: raceObj,
                },
                empType: {
                    displayKey: "Employment Type",
                    displayValue: empType,
                    selectedValue: empTypeValue,
                    selectedDisplay: empType,
                    selectedObj: empTypeObj,
                },
                nationality: {
                    displayKey: "Nationality",
                    displayValue: nationality,
                },
                occupation: {
                    displayKey: "Occupation",
                    displayValue: occupation,
                    selectedValue: occupationValue,
                    selectedDisplay: occupation,
                    selectedObj: occupationObj,
                },
                sector: {
                    displayKey: "Sector",
                    displayValue: sector,
                    selectedValue: sectorValue,
                    selectedDisplay: sector,
                    selectedObj: sectorObj,
                },
                homeAddress1: {
                    displayKey: "House address line 1",
                    displayValue: address1,
                },
                homeAddress2: {
                    displayKey: "House address line 2",
                    displayValue: address2,
                },
                homeAddress3: {
                    displayKey: "House address line 3",
                    displayValue: address3,
                },
                postcode: {
                    displayKey: "Postcode",
                    displayValue: postcode,
                },
                city: {
                    displayKey: "City",
                    displayValue: city,
                },
                state: {
                    displayKey: "State",
                    displayValue: stat,
                    selectedValue: statValue,
                    selectedDisplay: stat,
                    selectedObj: statObj,
                },
                creditLimit: {
                    displayKey: "Credit limit",
                    displayValue: cccLimt,
                    selectedValue: cccLimtValue,
                    selectedDisplay: cccLimt,
                    selectedObj: cccLimtObj,
                },
                amountRM: {
                    displayKey: "Amount in RM",
                    displayValue: amount,
                },
                amountPercentage: {
                    displayKey: "Amount in Percentage",
                    displayValue: percentage,
                },
                income: {
                    displayKey: "Monthly income",
                    displayValue: income ? CURRENCY + Numeral(income).format("0,0.00") : "",
                    selectedValue: income ?? "",
                },
                empName: {
                    displayKey: "Employer name",
                    displayValue: eName ?? "",
                },
                sourceIncome: {
                    displayKey: "Source of Income",
                    displayValue: sourceIncome !== PLEASE_SELECT ? sourceIncome : "",
                    selectedValue: sourceIncomeValue,
                    selectedDisplay: sourceIncome !== PLEASE_SELECT ? sourceIncome : "",
                    selectedObj: sourceIncomeObj,
                },
                monthlyStatement: {
                    displayKey: "Monthly statement",
                    displayValue: cccStatement,
                    selectedValue: cccStatementValue,
                    selectedDisplay: cccStatement,
                    selectedObj: cccStatementObj,
                },
                collectionState: {
                    displayKey: "Card collection state",
                    displayValue: cccState,
                    selectedValue: cccStateValue,
                    selectedDisplay: cccState,
                    selectedObj: cccStateObj,
                },
                collectionDistrict: {
                    displayKey: "Card collection state",
                    displayValue: cccDistrict,
                    selectedValue: cccDistrictValue,
                    selectedDisplay: cccDistrict,
                    selectedObj: cccDistrictObj,
                },
                collectionBranch: {
                    displayKey: "Card collection state",
                    displayValue: cccBranch,
                    selectedValue: cccBranchValue,
                    selectedDisplay: cccBranch,
                    selectedObj: cccBranchObj,
                },
                pep: {
                    displayKey: "Are you a Politically Exposed Person?",
                    displayValue: pep !== PLEASE_SELECT ? pep : "",
                    selectedValue: pepValue ?? "",
                    selectedDisplay: pep !== PLEASE_SELECT ? pep : "",
                    selectedObj: pepObj,
                },
            },
        };
    }

    async function handleProceedButton() {
        try {
            const isFormValid = validateForm();
            if (!isFormValid) return;
            const obj = getParamData();
            const params = route?.params ?? {};
            navigation.navigate("CardSuppConfirmation", {
                ...params,
                userAction: { ...params?.userAction, ...obj.displayData },
            });
        } catch (error) {
            console.log(error);
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }
    function getDistrictData(data) {
        const params = route?.params ?? {};
        const districtArr = params?.serverData?.stateData?.states?.district;
        const district = districtArr[data?.value];
        return district;
    }

    function getBranchData(items) {
        const param = route?.params ?? {};
        const branchArr = param?.serverData?.stateData?.states?.states;
        const branch = branchArr.find((data) => data[items?.value]);
        const branchData = branch[items?.value].map((item) => ({
            ...item,
            name: item?.branchName,
            value: item?.branchCode,
        }));
        return branchData;
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: { show: false, title: "", desc: "" },
        });
    }
    function handleAddressInfoPress() {
        handleInfoPress({ title: HOME_ADDRESS_LINE, desc: HOME_ADDRESS_INFO });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_SUPPLEMENTARYCARD_PERSONALDETAILS}
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
                                    text="Step 2 of 2"
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
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.view}>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={16}
                                        text="Supplementary Card Application"
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
                                    isValid={state.titleValid}
                                    errorMessage={state.titleErrorMsg}
                                    onPress={onTitleTap}
                                    style={styles.info}
                                />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Name"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onNamaChange}
                                        placeholder="e.g. Danial Ariff"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.namaValid}
                                        errorMessage={state.namaErrorMsg}
                                        value={state.nama}
                                        maxLength={26}
                                    />
                                </View>

                                <LabeledDropdown
                                    label="Relationship to principal"
                                    dropdownValue={state.relationship}
                                    isValid={state.relationshipValid}
                                    errorMessage={state.relationshipErrorMsg}
                                    onPress={onRelationshipTap}
                                    style={styles.info}
                                />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Name on card"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onNameChange}
                                        placeholder="e.g. Danial Ariff"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.nameValid}
                                        errorMessage={state.nameErrorMsg}
                                        value={state.name}
                                        maxLength={26}
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
                                        value={state.email}
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
                                                value={state.mobNum}
                                                maxLength={20}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="400"
                                        lineHeight={28}
                                        text="Gender"
                                        textAlign="left"
                                    />
                                    <View style={styles.radioContainer}>
                                        <View style={styles.leftRadioBtn}>
                                            <ColorRadioButton
                                                title="Male"
                                                isSelected={state.isMale}
                                                fontWeight="normal"
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Male" });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.rightRadioBtn}>
                                            <ColorRadioButton
                                                title="Female"
                                                fontWeight="normal"
                                                isSelected={state.isFemale}
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Female" });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <LabeledDropdown
                                    label="Race"
                                    dropdownValue={state.race}
                                    isValid={state.raceValid}
                                    errorMessage={state.raceErrorMsg}
                                    onPress={onRaceTap}
                                    style={styles.info}
                                />
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Nationality"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onNationalityChange}
                                        placeholder="e.g. Malaysia"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        editable={false}
                                        isValidate
                                        isValid={state.nationalityValid}
                                        errorMessage={state.nationalityErrorMsg}
                                        value={state.nationality}
                                        maxLength={20}
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
                                <View style={styles.info}>
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Home address line 1"
                                            textAlign="left"
                                        />
                                        <TouchableOpacity onPress={handleAddressInfoPress}>
                                            <Image
                                                style={styles.infoIcon}
                                                source={assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address1Valid}
                                        errorMessage={state.address1ErrorMsg}
                                        value={state.address1}
                                        style={styles.notesArea}
                                        placeholder="e.g. Unit no/Floor/Building"
                                        onChangeText={onAddress1Change}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Home address line 2"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address2Valid}
                                        errorMessage={state.address2ErrorMsg}
                                        value={state.address2}
                                        style={styles.notesArea}
                                        placeholder="e.g. Street name"
                                        onChangeText={onAddress2Change}
                                        numberOfLines={2}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Home address line 3"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={state.address3Valid}
                                        errorMessage={state.address3ErrorMsg}
                                        value={state.address3}
                                        style={styles.notesArea}
                                        placeholder="e.g. Neighbourhood name"
                                        onChangeText={onAddress3Change}
                                        numberOfLines={2}
                                    />
                                </View>

                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="Postcode"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onPostcodeChange}
                                        placeholder="e.g. 52200"
                                        keyboardType="number-pad"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.postcodeValid}
                                        errorMessage={state.postcodeErrorMsg}
                                        value={state.postcode}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text="City"
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onCityChange}
                                        placeholder="e.g. Kuala Lumpur"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.cityValid}
                                        errorMessage={state.cityErrorMsg}
                                        value={state.city}
                                        maxLength={20}
                                    />
                                </View>

                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state.stat}
                                    isValid={state.statValid}
                                    errorMessage={state.statErrorMsg}
                                    onPress={onStatTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Credit limit"
                                    dropdownValue={state.cccLimt}
                                    isValid={state.cccLimtValid}
                                    errorMessage={state.cccLimtErrorMsg}
                                    onPress={onCccLimtTap}
                                    style={styles.info}
                                />

                                {/*<LabeledDropdown
                                    label="Card collection method"
                                    dropdownValue={state.cccMethod}
                                    isValid={state.cccMethodValid}
                                    errorMessage={state.cccMethodErrorMsg}
                                    onPress={onCccMethodTap}
                                    style={styles.info}
                                />*/}
                                {state.showLimitOption && (
                                    <View style={styles.info}>
                                        <View>
                                            <ColorRadioButton
                                                title="Enter amount"
                                                isSelected={state.isAmount}
                                                fontWeight="normal"
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Amount" });
                                                }}
                                            />
                                            <SpaceFiller height={4} />
                                            {state.isAmount && (
                                                <TextInput
                                                    autoCorrect={false}
                                                    onChangeText={onAmountChange}
                                                    placeholder="0.00"
                                                    enablesReturnKeyAutomatically
                                                    returnKeyType="next"
                                                    keyboardType="numeric"
                                                    prefix="RM"
                                                    isValidate
                                                    isValid={state.amountValid}
                                                    errorMessage={state.amountErrorMsg}
                                                    value={state.amount}
                                                    maxLength={9}
                                                />
                                            )}
                                            <ColorRadioButton
                                                title="Enter percentage (%)"
                                                fontWeight="normal"
                                                isSelected={state.isPercentage}
                                                fontSize={14}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onRadioButtonPressed={() => {
                                                    handleToggle({ radioBtnId: "Percentage" });
                                                }}
                                            />
                                            <SpaceFiller height={4} />
                                            {state.isPercentage && (
                                                <TextInput
                                                    autoCorrect={false}
                                                    onChangeText={onPercentageChange}
                                                    placeholder="percentage (%)"
                                                    enablesReturnKeyAutomatically
                                                    returnKeyType="next"
                                                    isValidate
                                                    isValid={state.percentageValid}
                                                    errorMessage={state.percentageErrorMsg}
                                                    value={state.percentage}
                                                    maxLength={20}
                                                />
                                            )}
                                        </View>
                                    </View>
                                )}
                                {customerFlag === "0" && (
                                    <View>
                                        <LabeledDropdown
                                            label="Are you a Politically Exposed Person?"
                                            dropdownValue={state.pep}
                                            isValid={state.pepValid}
                                            errorMessage={state.pepErrorMsg}
                                            onPress={onPepTap}
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
                                        <View style={styles.info}>
                                            <View style={styles.infoView}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    lineHeight={18}
                                                    text="Monthly income"
                                                    textAlign="left"
                                                />
                                            </View>
                                            <SpaceFiller height={4} />
                                            <TextInput
                                                autoCorrect={false}
                                                onChangeText={onIncomeChange}
                                                prefix="RM"
                                                placeholder="0.00"
                                                keyboardType="numeric"
                                                enablesReturnKeyAutomatically
                                                returnKeyType="next"
                                                isValidate
                                                isValid={state.incomeValid}
                                                errorMessage={state.incomeErrorMsg}
                                                value={state.income}
                                                maxLength={20}
                                            />
                                        </View>
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
                                    </View>
                                )}

                                <LabeledDropdown
                                    label="Monthly statement"
                                    dropdownValue={state.cccStatement}
                                    isValid={state.cccStatementValid}
                                    errorMessage={state.cccStatementErrorMsg}
                                    onPress={onCccStatementTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Card collection state"
                                    dropdownValue={state.cccState}
                                    isValid={state.cccStateValid}
                                    errorMessage={state.cccStateErrorMsg}
                                    onPress={onCccStateTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Card collection area/district"
                                    dropdownValue={state.cccDistrict}
                                    isValid={state.cccDistrictValid}
                                    errorMessage={state.cccDistrictErrorMsg}
                                    onPress={onCccDistricTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Card collection branch"
                                    dropdownValue={state.cccBranch}
                                    isValid={state.cccBranchValid}
                                    errorMessage={state.cccBranchErrorMsg}
                                    onPress={onCccBranchTap}
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
                                            text="Save and Continue"
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
                {state.raceData && (
                    <ScrollPickerView
                        showMenu={state.racePicker}
                        list={state.raceData}
                        selectedIndex={state.raceValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
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
                {state.occupationModal && state.occupationData && (
                    <SearchableList
                        onCallback={onCallbackModal}
                        onClose={onCloseModal}
                        data={state.occupationData}
                        type="occupation"
                        noResultMsg="Please select the category that is the closest match to your occupation."
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
                {state.statData && (
                    <ScrollPickerView
                        showMenu={state.statPicker}
                        list={state.statData}
                        selectedIndex={state.statValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.cccLimtData && (
                    <ScrollPickerView
                        showMenu={state.cccLimtPicker}
                        list={state.cccLimtData}
                        selectedIndex={state.cccLimtValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.cccStatementData && (
                    <ScrollPickerView
                        showMenu={state.cccStatementPicker}
                        list={state.cccStatementData}
                        selectedIndex={state.cccStatementValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {/*state.cccMethodData && (
                    <ScrollPickerView
                        showMenu={state.cccMethodPicker}
                        list={state.cccMethodData}
                        selectedIndex={state.cccMethodValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )*/}
                {state.cccStateData && (
                    <ScrollPickerView
                        showMenu={state.cccStatePicker}
                        list={state.cccStateData}
                        selectedIndex={state.cccStateValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.cccDistrictData && (
                    <ScrollPickerView
                        showMenu={state.cccDistrictPicker}
                        list={state.cccDistrictData}
                        selectedIndex={state.cccDistrictValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.cccBranchData && (
                    <ScrollPickerView
                        showMenu={state.cccBranchPicker}
                        list={state.cccBranchData}
                        selectedIndex={state.cccBranchValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {customerFlag === "0" && state.pepData && (
                    <ScrollPickerView
                        showMenu={state.pepPicker}
                        list={state.pepData}
                        selectedIndex={state.pepValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {customerFlag === "0" && state.sourceIncomeData && (
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

CardSuppCollection.propTypes = {
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
    leftRadioBtn: {
        width: "100%",
    },
    notesArea: {
        color: BLACK,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 20,
        fontWeight: "600",
    },
    radioContainer: {
        flexDirection: "row",
    },
    rightRadioBtn: {
        height: 50,
        marginLeft: 120,
        position: "absolute",
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

export default CardSuppCollection;

/* eslint-disable react-native/no-unused-styles */
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
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
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { cardsUpdate } from "@services";
import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    PLEASE_SELECT,
    DONE,
    CANCEL,
    CURRENCY,
    FA_APPLY_CREDITCARD_ADDITIONALDETAILS,
    FA_APPLY_CREDITCARD_ETB_ADDITIONALDETAILS,
} from "@constants/strings";

import { numericRegex } from "@utils/dataModel";

import assets from "@assets";

const initialState = {
    // primary income income after retirement related
    primaryIncome: PLEASE_SELECT,
    primaryIncomeValue: null,
    primaryIncomeObj: {},
    primaryIncomeValid: true,
    primaryIncomeErrorMsg: "",
    primaryIncomeData: [],
    primaryIncomeValueIndex: 0,
    primaryIncomePicker: false,

    // Source Of Wealth income after retirement related
    wealth: PLEASE_SELECT,
    wealthValue: null,
    wealthObj: {},
    wealthValid: true,
    wealthErrorMsg: "",
    wealthData: [],
    wealthValueIndex: 0,
    wealthPicker: false,

    // Source of income after retirement related
    sourceIncome: PLEASE_SELECT,
    sourceIncomeValue: null,
    sourceIncomeObj: {},
    sourceIncomeValid: true,
    sourceIncomeErrorMsg: "",
    sourceIncomeData: [],
    sourceIncomeValueIndex: 0,
    sourceIncomePicker: false,

    // Statement delivery related
    delivery: PLEASE_SELECT,
    deliveryValue: null,
    deliveryObj: {},
    deliveryValid: true,
    deliveryErrorMsg: "",
    deliveryData: [],
    deliveryValueIndex: 0,
    deliveryPicker: false,

    // Card collection method related
    collMethod: PLEASE_SELECT,
    collMethodValue: null,
    collMethodObj: {},
    collMethodValid: true,
    collMethodErrorMsg: "",
    collMethodData: [],
    collMethodValueIndex: 0,
    collMethodPicker: false,

    // Card collection state related
    collState: PLEASE_SELECT,
    collStateValue: null,
    collStateObj: {},
    collStateValid: true,
    collStateErrorMsg: "",
    collStateData: [],
    collStateValueIndex: 0,
    collStatePicker: false,

    // Card collection area/district
    collArea: PLEASE_SELECT,
    collAreaValue: null,
    collAreaObj: {},
    collAreaValid: true,
    collAreaErrorMsg: "",
    collAreaData: [],
    collAreaValueIndex: 0,
    collAreaPicker: false,

    // Card collection branch
    collBranch: PLEASE_SELECT,
    collBranchValue: null,
    collBranchObj: {},
    collBranchValid: true,
    collBranchErrorMsg: "",
    collBranchData: [],
    collBranchValueIndex: 0,
    collBranchPicker: false,

    //Monthly net income
    income: "",
    incomeValid: true,
    incomeErrorMsg: "",

    //Other monthly commitments
    otherIncome: "",
    otherIncomeValid: true,
    otherIncomeErrorMsg: "",

    //Info Popup
    showInfo: false,
    infoTitle: "ID number",
    infoDescription: "You may select the Principal Card with a maximum of 5 cards per application",

    // Others
    isContinueDisabled: true,
    isEtb: false,
    isPep: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "PopulateDropdowns": {
            const stateArr = payload?.serverData?.stateData?.statesList;
            const sendMyStatements = payload?.serverData?.masterData?.sendMyStatements;
            const collectionData = sendMyStatements.filter((item) => item?.value.indexOf("E") != 0);
            return {
                ...state,
                sourceIncomeData:
                    payload?.serverData?.masterData?.sourceOfIncome ?? state.sourceIncomeData,
                deliveryData: sendMyStatements ?? state.deliveryData,
                collMethodData: collectionData ?? state.collMethodData,
                collStateData: stateArr ?? state.collStateData,
                collAreaData: state.collAreaData,
                collBranchData: state.collBranchData,
                primaryIncomeData:
                    payload?.serverData?.masterData?.primaryIncome ?? state.primaryIncomeData,
                wealthData: payload?.serverData?.masterData?.sourceWeath ?? state.wealthData,
            };
        }
        case "etbFields":
            return {
                ...state,
                isEtb: payload,
            };
        case "pepField":
            return {
                ...state,
                isPep: payload,
            };
        case "hidePicker":
            return {
                ...state,
                pickerType: null,
                primaryIncomePicker: false,
                wealthPicker: false,
                sourceIncomePicker: false,
                deliveryPicker: false,
                collMethodPicker: false,
                collStatePicker: false,
                collAreaPicker: false,
                collBranchPicker: false,
            };
        case "showPicker":
            return {
                ...state,
                pickerType: payload,
                primaryIncomePicker: payload === "primaryIncome",
                wealthPicker: payload === "wealth",
                sourceIncomePicker: payload === "sourceIncome",
                deliveryPicker: payload === "delivery",
                collMethodPicker: payload === "collMethod",
                collStatePicker: payload === "collState",
                collAreaPicker: payload === "collArea",
                collBranchPicker: payload === "collBranch",
            };
        case "primaryIncomeDone":
            return {
                ...state,
                primaryIncome: payload?.primaryIncome,
                primaryIncomeValue: payload?.primaryIncomeValue,
                primaryIncomeObj: payload?.primaryIncomeObj,
                primaryIncomeValueIndex: payload?.primaryIncomeValueIndex,
            };
        case "wealthDone":
            return {
                ...state,
                wealth: payload?.wealth,
                wealthValue: payload?.wealthValue,
                wealthObj: payload?.wealthObj,
                wealthValueIndex: payload?.wealthValueIndex,
            };
        case "sourceIncomeDone":
            return {
                ...state,
                sourceIncome: payload?.sourceIncome,
                sourceIncomeValue: payload?.sourceIncomeValue,
                sourceIncomeObj: payload?.sourceIncomeObj,
                sourceIncomeValueIndex: payload?.sourceIncomeValueIndex,
            };
        case "deliveryDone":
            return {
                ...state,
                delivery: payload?.delivery,
                deliveryValue: payload?.deliveryValue,
                deliveryObj: payload?.deliveryObj,
                deliveryValueIndex: payload?.deliveryValueIndex,
            };
        case "collStateDone":
            return {
                ...state,
                collState: payload?.collState,
                collStateValue: payload?.collStateValue,
                collStateObj: payload?.collStateObj,
                collStateValueIndex: payload?.collStateValueIndex,
                collAreaData: payload?.collAreaData,
            };
        case "collAreaDone":
            return {
                ...state,
                collArea: payload?.collArea,
                collAreaValue: payload?.collAreaValue,
                collAreaObj: payload?.collAreaObj,
                collAreaValueIndex: payload?.collAreaValueIndex,
                collBranchData: payload?.collBranchData,
            };

        case "collMethodDone":
            return {
                ...state,
                collMethod: payload?.collMethod,
                collMethodValue: payload?.collMethodValue,
                collMethodObj: payload?.collMethodObj,
                collMethodValueIndex: payload?.collMethodValueIndex,
            };
        case "collBranchDone":
            return {
                ...state,
                collBranch: payload?.collBranch,
                collBranchValue: payload?.collBranchValue,
                collBranchObj: payload?.collBranchObj,
                collBranchValueIndex: payload?.collBranchValueIndex,
            };

        case "income":
            return {
                ...state,
                income: payload,
            };
        case "otherIncome":
            return {
                ...state,
                otherIncome: payload,
            };

        case "showDatePicker":
            return {
                ...state,
                datePicker: payload,
            };
        case "popupDisplay":
            return {
                ...state,
                showInfo: payload?.show,
                infoTitle: payload?.title ?? state?.infoTitle,
                infoDescription: payload?.desc ?? state?.infoDescription,
            };
        case "updateValidationErrors":
            return {
                ...state,
                incomeValid: payload?.incomeValid ?? true,
                incomeErrorMsg: payload?.incomeErrorMsg ?? "",
                otherIncomeValid: payload?.otherIncomeValid ?? true,
                otherIncomeErrorMsg: payload?.otherIncomeErrorMsg ?? "",
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

function CardsCollection({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(async () => {
        try {
            const params = route?.params ?? {};
            const stpCustType = params?.custInfo?.stpCustType;
            const statementDel = params?.masterData?.sendMyStatements;
            dispatch({
                actionType: "PopulateDropdowns",
                payload: params,
            });

            //Default Statement Delivery to Email
            if (statementDel) {
                const sd = statementDel.find((item) => item.value === "E");
                sd &&
                    dispatch({
                        actionType: "deliveryDone",
                        payload: { title: sd?.name, titleValue: sd?.value, titleObj: sd },
                    });
            }

            (stpCustType === "00" || params?.postLogin) &&
                dispatch({
                    actionType: "etbFields",
                    payload: true,
                });

            params?.userAction?.pep?.selectedValue === "Yes" &&
                dispatch({
                    actionType: "pepField",
                    payload: true,
                });
        } catch (error) {
            console.log(error);
            navigation.canGoBack() && navigation.goBack();
        }
    }, [navigation, route?.params]);

    useEffect(() => {
        populateData();
    }, [
        populateData,
        state.collAreaData,
        state.collBranchData,
        state.collMethodData,
        state.collStateData,
        state.deliveryData,
        state.primaryIncomeData,
        state.sourceIncomeData,
        state.wealthData,
    ]);

    const populateData = useCallback(() => {
        const params = route?.params ?? {};
        const {
            income,
            otherIncome,
            primryIncome,
            wealth,
            incomeAfterRetirement,
            statementDelivery,
            cardCollectionMethod,
        } = params?.populateObj;

        //income
        income && dispatch({ actionType: "income", payload: income });

        //other income
        otherIncome && dispatch({ actionType: "otherIncome", payload: otherIncome });

        if (primryIncome) {
            const home = state.primaryIncomeData.find((item) => item.value === primryIncome);
            home &&
                dispatch({
                    actionType: "primaryIncomeDone",
                    payload: {
                        primaryIncome: home?.name,
                        primaryIncomeValue: home?.value,
                        primaryIncomeObj: home,
                    },
                });
        }

        if (wealth) {
            const home = state.wealthData.find((item) => item.value === primryIncome);
            home &&
                dispatch({
                    actionType: "wealthDone",
                    payload: {
                        wealth: home?.name,
                        wealthValue: home?.value,
                        wealthObj: home,
                    },
                });
        }

        if (incomeAfterRetirement) {
            const home = state.sourceIncomeData.find(
                (item) => item.value === incomeAfterRetirement
            );
            console.log(state.sourceIncomeData);
            console.log(incomeAfterRetirement);
            home &&
                dispatch({
                    actionType: "sourceIncomeDone",
                    payload: {
                        sourceIncome: home?.name,
                        sourceIncomeValue: home?.value,
                        sourceIncomeObj: home,
                    },
                });
        }

        if (statementDelivery) {
            const home = state.deliveryData.find((item) => item.value === statementDelivery);
            console.log(state.deliveryData);
            console.log(statementDelivery);
            home &&
                dispatch({
                    actionType: "deliveryDone",
                    payload: {
                        delivery: home?.name,
                        deliveryValue: home?.value,
                        deliveryObj: home,
                    },
                });
        }

        if (cardCollectionMethod) {
            const home = state.collMethodData.find((item) => item.value === cardCollectionMethod);
            console.log(state.collMethodData);
            console.log(cardCollectionMethod);
            home &&
                dispatch({
                    actionType: "collMethodDone",
                    payload: {
                        collMethod: home?.name,
                        collMethodValue: home?.value,
                        collMethodObj: home,
                    },
                });
        }
    }, [
        route?.params,
        state.collMethodData,
        state.deliveryData,
        state.primaryIncomeData,
        state.sourceIncomeData,
        state.wealthData,
    ]);

    // Used enable/disable "Continue"
    useEffect(() => {
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                state.sourceIncome === PLEASE_SELECT ||
                state.delivery === PLEASE_SELECT ||
                (state.isPep && state.wealth === PLEASE_SELECT) ||
                (state.isPep && state.primaryIncome === PLEASE_SELECT) ||
                (state.isEtb && state.collMethod === PLEASE_SELECT) ||
                (!state.isEtb && state.collState === PLEASE_SELECT) ||
                (!state.isEtb && state.collArea === PLEASE_SELECT) ||
                (!state.isEtb && state.collBranch === PLEASE_SELECT) ||
                state.income === "" ||
                state.otherIncome === "",
        });
    }, [
        state.sourceIncome,
        state.delivery,
        state.collMethod,
        state.collState,
        state.collArea,
        state.collBranch,
        state.income,
        state.otherIncome,
        state.isEtb,
        state.isPep,
        state.primaryIncome,
        state.wealth,
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

    function handleInfoPress(from) {
        const popupTitle =
            from === "mIncome" ? "Monthly Net Income(RM)" : "Other Monthly Commitments (RM)";
        const popupDesc =
            from === "mIncome"
                ? `Monthly Net Income (monthly income e.g. salary, rental, commissions, allowances, etc) after deduction of Income Tax, SOCSO & EPF.`
                : `Monthly Commitment to non Banking Institutions e.g.: Monthly installment to finance the purhase of electronic appliances or home furnitures from "Consumer Electronics and Furniture Retailers".`;

        dispatch({
            actionType: "popupDisplay",
            payload: { show: true, title: popupTitle, desc: popupDesc },
        });
    }

    function onPopupClose() {
        dispatch({
            actionType: "popupDisplay",
            payload: { show: false, title: "", desc: "" },
        });
    }

    function onSourceIncomeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "sourceIncome",
        });
    }

    function onPrimaryIncomeTap() {
        dispatch({
            actionType: "showPicker",
            payload: "primaryIncome",
        });
    }

    function onWealthTap() {
        dispatch({
            actionType: "showPicker",
            payload: "wealth",
        });
    }

    function onDeliveryTap() {
        dispatch({
            actionType: "showPicker",
            payload: "delivery",
        });
    }

    function onCollMethodTap() {
        dispatch({
            actionType: "showPicker",
            payload: "collMethod",
        });
    }

    function onCollStateTap() {
        dispatch({
            actionType: "showPicker",
            payload: "collState",
        });
    }

    function onCollAreaTap() {
        dispatch({
            actionType: "showPicker",
            payload: "collArea",
        });
    }
    function onCollBranchTap() {
        dispatch({
            actionType: "showPicker",
            payload: "collBranch",
        });
    }

    function onPickerCancel() {
        dispatch({
            actionType: "hidePicker",
            payload: true,
        });
    }

    function resetCollBranch() {
        dispatch({
            actionType: "collBranchDone",
            payload: {
                collBranch: PLEASE_SELECT,
                collBranchValue: null,
                collBranchObj: {},
                collBranchValueIndex: 0,
            },
        });
    }

    function onPickerDone(item, index) {
        const { pickerType } = state;
        switch (pickerType) {
            case "primaryIncome":
                dispatch({
                    actionType: "primaryIncomeDone",
                    payload: {
                        primaryIncome: item?.name ?? PLEASE_SELECT,
                        primaryIncomeValue: item?.value ?? null,
                        primaryIncomeObj: item,
                        primaryIncomeValueIndex: index,
                    },
                });
                break;
            case "wealth":
                dispatch({
                    actionType: "wealthDone",
                    payload: {
                        wealth: item?.name ?? PLEASE_SELECT,
                        wealthValue: item?.value ?? null,
                        wealthObj: item,
                        wealthValueIndex: index,
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
            case "delivery":
                dispatch({
                    actionType: "deliveryDone",
                    payload: {
                        delivery: item?.name ?? PLEASE_SELECT,
                        deliveryValue: item?.value ?? null,
                        deliveryObj: item,
                        deliveryValueIndex: index,
                    },
                });
                break;
            case "collMethod":
                dispatch({
                    actionType: "collMethodDone",
                    payload: {
                        collMethod: item?.name ?? PLEASE_SELECT,
                        collMethodValue: item?.value ?? null,
                        collMethodObj: item,
                        collMethodValueIndex: index,
                    },
                });
                break;
            case "collState": {
                const district = getDistrictData(item);
                dispatch({
                    actionType: "collStateDone",
                    payload: {
                        collState: item?.name ?? PLEASE_SELECT,
                        collStateValue: item?.value ?? null,
                        collStateObj: item,
                        collStateValueIndex: index,
                        collAreaData: district ?? [],
                    },
                });
                if (state.collArea !== PLEASE_SELECT) {
                    dispatch({
                        actionType: "collAreaDone",
                        payload: {
                            collArea: PLEASE_SELECT,
                            collAreaValue: null,
                            collAreaObj: {},
                            collAreaValid: true,
                            collAreaErrorMsg: "",
                            collAreaValueIndex: 0,
                            collAreaData: [],
                        },
                    });
                }
                if (state.collBranch !== PLEASE_SELECT) {
                    resetCollBranch();
                }
                break;
            }

            case "collArea": {
                const branch = getBranchData(item);
                dispatch({
                    actionType: "collAreaDone",
                    payload: {
                        collArea: item?.name ?? PLEASE_SELECT,
                        collAreaValue: item?.value ?? null,
                        collAreaObj: item,
                        collAreaValueIndex: index,
                        collBranchData: branch,
                    },
                });
                if (state.collBranch !== PLEASE_SELECT) {
                    resetCollBranch();
                }
                break;
            }
            case "collBranch":
                dispatch({
                    actionType: "collBranchDone",
                    payload: {
                        collBranch: item?.name ?? PLEASE_SELECT,
                        collBranchValue: item?.value ?? null,
                        collBranchObj: item,
                        collBranchValueIndex: index,
                    },
                });
                break;
            default:
                break;
        }

        // Close picker
        onPickerCancel();
    }

    function getDistrictData(data) {
        const params = route?.params ?? {};
        const districtArr = params?.serverData?.stateData?.states?.district;
        return districtArr[data?.value];
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
        console.log(branchData);
        return branchData;
    }

    function onIncomeChange(value) {
        return dispatch({ actionType: "income", payload: value });
    }

    function onOtherIncomeChange(value) {
        return dispatch({ actionType: "otherIncome", payload: value });
    }

    const validateIncome = useCallback(() => {
        // Only number check
        if (!numericRegex(state.income)) {
            return {
                incomeValid: false,
                incomeErrorMsg:
                    "Sorry, your Monthly Net Income should be rounded down with no decimal point.",
            };
        }

        if (Number(state.income) <= 2000) {
            return {
                incomeValid: false,
                incomeErrorMsg: "Sorry, your Monthly Net Income must be above 2k.",
            };
        }

        // Return true if no validation error
        return {
            incomeValid: true,
            incomeErrorMsg: "",
        };
    }, [state.income]);

    const validateOtherIncome = useCallback(() => {
        // Only number check
        if (!numericRegex(state.otherIncome)) {
            return {
                otherIncomeValid: false,
                otherIncomeErrorMsg:
                    "Sorry, your Other Monthly Commitments should be round up with no decimal point.",
            };
        }

        // Return true if no validation error
        return {
            otherIncomeValid: true,
            otherIncomeErrorMsg: "",
        };
    }, [state.otherIncome]);

    function validateForm() {
        // Reset existing error state
        dispatch({ actionType: "updateValidationErrors", payload: {} });

        const { incomeValid, incomeErrorMsg } = validateIncome();
        const { otherIncomeValid, otherIncomeErrorMsg } = validateOtherIncome();

        // Update inline errors(if any)
        dispatch({
            actionType: "updateValidationErrors",
            payload: {
                incomeValid,
                incomeErrorMsg,
                otherIncomeValid,
                otherIncomeErrorMsg,
            },
        });

        return incomeValid && otherIncomeValid;
    }

    function getParamData() {
        const {
            income,
            otherIncome,
            primaryIncome,
            primaryIncomeValue,
            primaryIncomeObj,
            wealth,
            wealthValue,
            wealthObj,
            sourceIncome,
            sourceIncomeValue,
            sourceIncomeObj,
            delivery,
            deliveryValue,
            deliveryObj,
            collMethod,
            collMethodValue,
            collMethodObj,
            collState,
            collStateValue,
            collStateObj,
            collArea,
            collAreaValue,
            collAreaObj,
            collBranch,
            collBranchValue,
            collBranchObj,
            isPep,
        } = state;

        return {
            prepopulateData: {
                income: income ?? "",
                otherIncome: otherIncome ?? "",
                primryIncome: isPep ? primaryIncomeValue : "",
                wealth: isPep ? wealthValue : "",
                incomeAfterRetirement: sourceIncomeValue ?? "",
                statementDelivery: deliveryValue ?? "",
                cardCollectionMethod: collMethodValue ?? "",
                cardCollectionState: collStateValue ?? "",
                cardCollectionDistrict: collAreaValue ?? "",
                cardCollectionBranch: collBranchValue ?? "",
            },
            displayData: {
                income: {
                    displayKey: "Monthly net income",
                    displayValue: CURRENCY + Numeral(income).format("0,0.00"),
                    selectedValue: income,
                },
                otherIncome: {
                    displayKey: "Other monthly commitments",
                    displayValue: CURRENCY + Numeral(otherIncome).format("0,0.00"),
                    selectedValue: otherIncome,
                },
                primaryIncome: {
                    displayKey: "Primary Income",
                    displayValue: isPep ? primaryIncome : "",
                    selectedValue: isPep ? primaryIncomeValue : "",
                    selectedDisplay: isPep ? primaryIncome : "",
                    selectedObj: isPep ? primaryIncomeObj : "",
                },
                wealth: {
                    displayKey: "Source of Wealth",
                    displayValue: isPep ? wealth : "",
                    selectedValue: isPep ? wealthValue : "",
                    selectedDisplay: isPep ? wealth : "",
                    selectedObj: isPep ? wealthObj : "",
                },
                incomeAfterRetirement: {
                    displayKey: "Income after retirement",
                    displayValue: sourceIncome,
                    selectedValue: sourceIncomeValue,
                    selectedDisplay: sourceIncome,
                    selectedObj: sourceIncomeObj,
                },
                statementDelivery: {
                    displayKey: "Statement delivery",
                    displayValue: delivery,
                    selectedValue: deliveryValue,
                    selectedDisplay: delivery,
                    selectedObj: deliveryObj,
                },
                cardCollectionMethod: {
                    displayKey: "Card collection Method",
                    displayValue: collMethod === PLEASE_SELECT ? "" : collMethod,
                    selectedValue: collMethodValue,
                    selectedDisplay: collMethod === PLEASE_SELECT ? "" : collMethod,
                    selectedObj: collMethodObj,
                },
                cardCollectionState: {
                    displayKey: "Card collection state",
                    displayValue: collState === PLEASE_SELECT ? "" : collState,
                    selectedValue: collStateValue,
                    selectedDisplay: collState === PLEASE_SELECT ? "" : collState,
                    selectedObj: collStateObj,
                },
                cardCollectionDistrict: {
                    displayKey: "Card collection area/district",
                    displayValue: collArea === PLEASE_SELECT ? "" : collArea,
                    selectedValue: collAreaValue,
                    selectedDisplay: collArea === PLEASE_SELECT ? "" : collArea,
                    selectedObj: collAreaObj,
                },
                cardCollectionBranch: {
                    displayKey: "Card collection branch",
                    displayValue: collBranch === PLEASE_SELECT ? "" : collBranch,
                    selectedValue: collBranchValue,
                    selectedDisplay: collBranch === PLEASE_SELECT ? "" : collBranch,
                    selectedObj: collBranchObj,
                },
            },
        };
    }

    function getServerParams(params) {
        return {
            etb: params?.postLogin ? params?.postLogin : params?.flow === "ETBWOM2U",
            idNo: params?.userAction?.idNumber?.displayValue ?? "",
            nameOnCard: params?.userAction?.nameOfCard?.displayValue,
            netIncome: params?.userAction?.income?.selectedValue,
            otherMonCom: params?.userAction?.otherIncome?.selectedValue,
            soiaRetirementDesc: params?.userAction?.incomeAfterRetirement?.selectedDisplay,
            soiaRetirementCode: params?.userAction?.incomeAfterRetirement?.selectedValue,
            collectionValue: state.isEtb
                ? params?.userAction?.cardCollectionMethod?.selectedDisplay
                : "",
            collection: state.isEtb ? params?.userAction?.cardCollectionMethod?.selectedValue : "",
            statementValue: params?.userAction?.statementDelivery?.selectedDisplay,
            statement: params?.userAction?.statementDelivery?.selectedValue,
            cardCollStateDesc: !state.isEtb
                ? params?.userAction?.cardCollectionState?.selectedDisplay
                : "",
            state: params?.userAction?.cardCollectionState?.selectedValue,
            area: params?.userAction?.cardCollectionDistrict?.selectedValue,
            cardCollDistDesc: !state.isEtb
                ? params?.userAction?.cardCollectionBranch?.selectedObj?.district
                : "",
            branchCode: !state.isEtb
                ? params?.userAction?.cardCollectionBranch?.selectedObj?.branchCode
                : "",
            branch: !state.isEtb
                ? params?.userAction?.cardCollectionBranch?.selectedObj?.branch
                : "",
            branchAddress: !state.isEtb
                ? params?.userAction?.cardCollectionBranch?.selectedObj?.address
                : "",
            grossIncome: "",
            pageNo: "NC03",
            stpRefNo: params?.serverData?.stpRefNo,
        };
    }

    async function updateCollectionDetailsApi() {
        const obj = getParamData();
        const params = route?.params ?? {};
        const userAction = { ...params?.userAction, ...obj.displayData };
        const param = getServerParams({ ...params, userAction: { ...userAction } });
        const url = params?.postLogin
            ? "loan/v1/cardStp/insertNC03"
            : "loan/ntb/v1/cardStp/insertNC03";
        try {
            const httpResp = await cardsUpdate(param, url);
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { statusCode, statusDesc } = result;
            if (statusCode === "0000") {
                navigation.navigate("CardsConfirmation", {
                    ...params,
                    populateObj: { ...params?.populateObj, ...obj.prepopulateData },
                    userAction: { ...userAction },
                });
            } else {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    async function handleProceedButton() {
        applyCC.onProceedCardCollection(analyticScreenName, state.dealerName);
        try {
            // Return is form validation fails
            const isFormValid = validateForm();
            if (!isFormValid) return;
            updateCollectionDetailsApi();
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const params = route?.params ?? {};
    const analyticScreenName = !params?.postLogin
        ? FA_APPLY_CREDITCARD_ADDITIONALDETAILS
        : FA_APPLY_CREDITCARD_ETB_ADDITIONALDETAILS;

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
                                    text="Step 6 of 6"
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
                                        text="Credit Card Application"
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.subheader}>
                                    <Typo
                                        fontSize={15}
                                        fontWeight="bold"
                                        lineHeight={17}
                                        text="Please fill in additional details"
                                        textAlign="left"
                                    />
                                </View>
                                <SpaceFiller height={25} />
                                {state.isPep && (
                                    <LabeledDropdown
                                        label="Primary Income"
                                        dropdownValue={state.primaryIncome}
                                        isValid={state.primaryIncomeValid}
                                        errorMessage={state.primaryIncomeErrorMsg}
                                        onPress={onPrimaryIncomeTap}
                                        style={styles.info}
                                    />
                                )}
                                {state.isPep && (
                                    <LabeledDropdown
                                        label="Source of Wealth"
                                        dropdownValue={state.wealth}
                                        isValid={state.wealthValid}
                                        errorMessage={state.wealthErrorMsg}
                                        onPress={onWealthTap}
                                        style={styles.info}
                                    />
                                )}
                                <View style={styles.info}>
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Monthly net income"
                                            textAlign="left"
                                        />
                                        {
                                            <TouchableOpacity
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onPress={() => {
                                                    handleInfoPress("mIncome");
                                                }}
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        }
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
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text="Other monthly commitments"
                                            textAlign="left"
                                        />
                                        {
                                            <TouchableOpacity
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onPress={() => {
                                                    handleInfoPress("oIncome");
                                                }}
                                            >
                                                <Image
                                                    style={styles.infoIcon}
                                                    source={assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    <SpaceFiller height={4} />
                                    <TextInput
                                        autoCorrect={false}
                                        onChangeText={onOtherIncomeChange}
                                        prefix="RM"
                                        placeholder="0.00"
                                        keyboardType="number-pad"
                                        enablesReturnKeyAutomatically
                                        returnKeyType="next"
                                        isValidate
                                        isValid={state.otherIncomeValid}
                                        errorMessage={state.otherIncomeErrorMsg}
                                        value={state.otherIncome}
                                        maxLength={20}
                                    />
                                </View>
                                <LabeledDropdown
                                    label="Source of income after retirement"
                                    dropdownValue={state.sourceIncome}
                                    isValid={state.sourceIncomeValid}
                                    errorMessage={state.sourceIncomeErrorMsg}
                                    onPress={onSourceIncomeTap}
                                    style={styles.info}
                                />
                                <LabeledDropdown
                                    label="Statement delivery"
                                    dropdownValue={state.delivery}
                                    isValid={state.deliveryValid}
                                    errorMessage={state.deliveryErrorMsg}
                                    onPress={onDeliveryTap}
                                    style={styles.info}
                                />
                                {state.isEtb && (
                                    <LabeledDropdown
                                        label="Card collection method"
                                        dropdownValue={state.collMethod}
                                        isValid={state.collMethodValid}
                                        errorMessage={state.collMethodErrorMsg}
                                        onPress={onCollMethodTap}
                                        style={styles.info}
                                    />
                                )}
                                {!state.isEtb && (
                                    <LabeledDropdown
                                        label="Card collection state"
                                        dropdownValue={state.collState}
                                        isValid={state.collStateValid}
                                        errorMessage={state.collStateErrorMsg}
                                        onPress={onCollStateTap}
                                        style={styles.info}
                                    />
                                )}
                                {!state.isEtb && (
                                    <LabeledDropdown
                                        label="Card collection area/district"
                                        dropdownValue={state.collArea}
                                        isValid={state.collAreaValid}
                                        errorMessage={state.collAreaErrorMsg}
                                        onPress={onCollAreaTap}
                                        style={styles.info}
                                    />
                                )}
                                {!state.isEtb && (
                                    <LabeledDropdown
                                        label="Card collection branch"
                                        dropdownValue={state.collBranch}
                                        isValid={state.collBranchValid}
                                        errorMessage={state.collBranchErrorMsg}
                                        onPress={onCollBranchTap}
                                        style={styles.info}
                                    />
                                )}
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
                {state.isPep && state.primaryIncomeData && (
                    <ScrollPickerView
                        showMenu={state.primaryIncomePicker}
                        list={state.primaryIncomeData}
                        selectedIndex={state.primaryIncomeIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.isPep && state.wealthData && (
                    <ScrollPickerView
                        showMenu={state.wealthPicker}
                        list={state.wealthData}
                        selectedIndex={state.wealthIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.deliveryData && (
                    <ScrollPickerView
                        showMenu={state.deliveryPicker}
                        list={state.deliveryData}
                        selectedIndex={state.deliveryValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {state.isEtb && state.collMethodData && (
                    <ScrollPickerView
                        showMenu={state.collMethodPicker}
                        list={state.collMethodData}
                        selectedIndex={state.collMethodValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {!state.isEtb && state.collStateData && (
                    <ScrollPickerView
                        showMenu={state.collStatePicker}
                        list={state.collStateData}
                        selectedIndex={state.collStateValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {!state.isEtb && state.collAreaData && (
                    <ScrollPickerView
                        showMenu={state.collAreaPicker}
                        list={state.collAreaData}
                        selectedIndex={state.collAreaValueIndex}
                        onRightButtonPress={onPickerDone}
                        onLeftButtonPress={onPickerCancel}
                        rightButtonText={DONE}
                        leftButtonText={CANCEL}
                    />
                )}
                {!state.isEtb && state.collBranchData && (
                    <ScrollPickerView
                        showMenu={state.collBranchPicker}
                        list={state.collBranchData}
                        selectedIndex={state.collBranchValueIndex}
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
                    //description="You may select the Principal Card with a maximum of 5 cards per application"
                    onClose={onPopupClose}
                />
            </>
        </ScreenContainer>
    );
}

CardsCollection.propTypes = {
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
    label: {
        paddingVertical: 4,
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

export default CardsCollection;

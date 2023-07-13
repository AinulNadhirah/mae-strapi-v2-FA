import React, { useState, useEffect, useReducer } from "react";
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from "react-native";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";
import { validateMonthlyCommitment } from "@screens/PLSTP/PLSTPValidation";

import { PLSTP_EMPLOYMENT_ADDRESS, PLSTP_TNC } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { saveAdditionalData } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    STEP_8,
    PLSTP_NON_BANK_LOANS,
    PLSTP_NON_BANK_LOANS_1,
    PLSTP_NET_INCOME,
    PLSTP_NET_INCOME_NOTE,
    PLSTP_SAVE_NEXT,
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    PLSTP_PRIMARY_INCOME,
    PLSTP_SOURCE_WEALTH,
    PLSTP_SOURCE_INCOME,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    PLEASE_SELECT,
    PLSTP_NON_BANK_TT_TITLE,
    PLSTP_NON_BANK_TT_DESC,
    DONE,
    CANCEL,
} from "@constants/strings";

import Assets from "@assets";

// Initial state object
const initialState = {
    // Montly commitment
    monthlyCommitment: "",
    monthlyCommitmentValid: true,
    monthlyCommitmentErrorMsg: "",

    // Primary Income
    primaryIncome: PLEASE_SELECT,
    primaryIncomeValue: null,
    primaryIncomeValid: true,
    primaryIncomeErrorMsg: "",
    primaryIncomeData: null,
    primaryIncomeKeyVal: null,
    primaryIncomePicker: false,
    primaryIncomePickerIndex: 0,

    // Source Of Wealth
    sourceOfWealth: PLEASE_SELECT,
    sourceOfWealthValue: null,
    sourceOfWealthValid: true,
    sourceOfWealthErrorMsg: "",
    sourceOfWealthData: null,
    sourceOfWealthKeyVal: null,
    sourceOfWealthPicker: false,
    sourceOfWealthPickerIndex: 0,

    // Source of Income After Retirement
    sourceOfIncome: PLEASE_SELECT,
    sourceOfIncomeValue: null,
    sourceOfIncomeValid: true,
    sourceOfIncomeErrorMsg: "",
    sourceOfIncomeData: null,
    sourceOfIncomeKeyVal: null,
    sourceOfIncomePicker: false,
    sourceOfIncomePickerIndex: 0,

    // Montly Net Income
    monthlyNetIncome: "",
    monthlyNetIncomeValid: true,
    monthlyNetIncomeErrorMsg: "",

    // Others
    isContinueDisabled: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                sourceOfWealthData: payload?.sourceOfWealth ?? state.sourceOfWealthData,
                primaryIncomeData: payload?.sourceOfFund ?? state.primaryIncomeData,
                sourceOfIncomeData: payload?.sourceOfIncomeArr ?? state.sourceOfIncomeData,
            };
        case "monthlyCommitment":
            return {
                ...state,
                monthlyCommitment: payload,
            };
        case "monthlyCommitmentValid":
            return {
                ...state,
                monthlyCommitmentValid: payload?.valid,
                monthlyCommitmentErrorMsg: payload?.errorMsg,
            };
        case "primaryIncomePicker":
            return {
                ...state,
                primaryIncomePicker: payload,
                pickerType: payload && "primaryIncome",
            };
        case "primaryIncome":
            return {
                ...state,
                primaryIncome: payload?.name ?? PLEASE_SELECT,
                primaryIncomeValue: payload?.id ?? null,
                primaryIncomePickerIndex: payload?.index ?? 0,
            };
        case "sourceOfWealthPicker":
            return {
                ...state,
                sourceOfWealthPicker: payload,
                pickerType: payload && "sourceOfWealth",
            };
        case "sourceOfWealth":
            return {
                ...state,
                sourceOfWealth: payload?.name ?? PLEASE_SELECT,
                sourceOfWealthValue: payload?.id ?? null,
                sourceOfWealthPickerIndex: payload?.index ?? 0,
            };
        case "sourceOfIncomePicker":
            return {
                ...state,
                sourceOfIncomePicker: payload,
                pickerType: payload && "sourceOfIncome",
            };
        case "sourceOfIncome":
            return {
                ...state,
                sourceOfIncome: payload?.name ?? PLEASE_SELECT,
                sourceOfIncomeValue: payload?.id ?? null,
                sourceOfIncomePickerIndex: payload?.index ?? 0,
            };
        case "monthlyNetIncome":
            return {
                ...state,
                monthlyNetIncome: payload,
            };
        case "monthlyNetIncomeValid":
            return {
                ...state,
                monthlyNetIncomeValid: payload?.valid,
                monthlyNetIncomeErrorMsg: payload?.errorMsg,
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

function PLSTPOtherDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { initParams } = route?.params;
    const { masterData, customerInfo, stpRefNum, customerRiskRating, isSAL, age } = initParams;
    const [clearErr, SetClearErr] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState(false);
    const [popupDesc, setPopupDesc] = useState(false);
    const showDD = customerRiskRating == "HR" ? true : false;
    const aboveAge = age > 48; //TODO : API Pending (For age above 48)

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPOtherDetails] >> [Form Fields Updated]");
        const {
            monthlyCommitment,
            primaryIncome,
            sourceOfWealth,
            monthlyNetIncome,
            sourceOfIncome,
        } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                monthlyCommitment === "" ||
                (showDD && primaryIncome === PLEASE_SELECT) ||
                (showDD && sourceOfWealth === PLEASE_SELECT) ||
                (aboveAge && sourceOfIncome === PLEASE_SELECT) ||
                (isSAL && monthlyNetIncome === ""),
        });
    }, [
        state.monthlyCommitment,
        state.primaryIncome,
        state.sourceOfWealth,
        state.monthlyNetIncome,
        state.sourceOfIncome,
    ]);

    const init = async () => {
        console.log("[PLSTPOtherDetails] >> [init]");
        const { sourceOfWealthKeyVal, sourceOfFundKeyVal, sourceOfIncomeKeyVal } = masterData;
        const {
            primaryIncomeValue,
            sourceOfWealthValue,
            sourceOfIncomeValue,
            otherCommitment,
            netIncome,
        } = customerInfo;
        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: masterData });

        // Pre-populate field values if any existing
        if (otherCommitment)
            dispatch({ actionType: "monthlyCommitment", payload: addCommas(otherCommitment) });

        if (primaryIncomeValue)
            dispatch({
                actionType: "primaryIncome",
                payload: {
                    name: sourceOfFundKeyVal[primaryIncomeValue],
                    id: primaryIncomeValue,
                },
            });

        if (sourceOfWealthValue)
            dispatch({
                actionType: "sourceOfWealth",
                payload: {
                    name: sourceOfWealthKeyVal[sourceOfWealthValue],
                    id: sourceOfWealthValue,
                },
            });

        if (sourceOfIncomeValue)
            dispatch({
                actionType: "sourceOfIncome",
                payload: {
                    name: sourceOfIncomeKeyVal[sourceOfIncomeValue],
                    id: sourceOfIncomeValue,
                },
            });

        if (netIncome) dispatch({ actionType: "monthlyNetIncome", payload: addCommas(netIncome) });
    };

    const onPrimaryIncomeFieldTap = () => {
        dispatch({
            actionType: "primaryIncomePicker",
            payload: true,
        });
    };

    const onSourceOfWealthFieldTap = () => {
        dispatch({
            actionType: "sourceOfWealthPicker",
            payload: true,
        });
    };

    const onsourceOfIncomeFieldTap = () => {
        dispatch({
            actionType: "sourceOfIncomePicker",
            payload: true,
        });
    };

    const onmonthlyCommitmentChange = (value) => {
        console.log("[PLSTPOtherDetails] >> [onmonthlyCommitmentChange]");

        value = addCommas(value);
        dispatch({
            actionType: "monthlyCommitment",
            payload: value,
        });
    };

    const onmonthlyNetIncomeChange = (value) => {
        console.log("[PLSTPOtherDetails] >> [onmonthlyNetIncomeChange]");

        value = addCommas(value);
        dispatch({
            actionType: "monthlyNetIncome",
            payload: value,
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
            case "primaryIncome":
                dispatch({
                    actionType: "primaryIncomePicker",
                    payload: false,
                });
                break;
            case "sourceOfWealth":
                dispatch({
                    actionType: "sourceOfWealthPicker",
                    payload: false,
                });
                break;
            case "sourceOfIncome":
                dispatch({
                    actionType: "sourceOfIncomePicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    };

    const onDoneTap = async () => {
        console.log("[PLSTPOtherDetails] >> [onDoneTap]");
        // Return if button is disabled
        if (state.isContinueDisabled) return;
        if (clearErr) {
            dispatch({
                actionType: clearErr,
                payload: { valid: true, errorMsg: "" },
            });
        }

        // Monthly Gross Income validation
        const income = removeCommas(state.monthlyCommitment);
        const netIncome = removeCommas(state.monthlyNetIncome);
        const validateResult = validateMonthlyCommitment(
            income,
            customerInfo?.monthlyGrossInc,
            netIncome ? netIncome : 0
        );

        dispatch({
            actionType: validateResult.actionType,
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        SetClearErr(validateResult.actionType);
        if (!validateResult.isValid) return;

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_8",
        });
        const additionalData = getFormData();
        const source = {
            id: additionalData.sourceOfWealthValue,
            type: additionalData.sourceOfWealth,
        };

        const fund = {
            id: additionalData.primaryIncomeValue,
            type: additionalData.primaryIncome,
        };

        const retire = {
            id: additionalData.sourceOfIncomeValue,
            type: additionalData.sourceOfIncome,
        };

        const data = {
            sourceOfWealth: additionalData.sourceOfWealthValue ? source : {},
            sourceOfFund: additionalData.primaryIncomeValue ? fund : {},
            retirementIncomeSource: additionalData.sourceOfIncomeValue ? retire : {},
            stpRefNo: stpRefNum,
            otherCommitment: income,
            netIncome: additionalData.netIncome || "",
        };
        saveAdditionalData(data)
            .then((result) => {
                // Navigate to Next screen (ScreenName : PLSTP_REPAYMENT_DETAILS)
                console.log("save employment address :: ", result);
                if (result?.data?.code === 200) {
                    Object.assign(customerInfo, additionalData);
                    console.log("route.params ::: ", route.params);
                    navigation.navigate(PLSTP_TNC, {
                        ...route.params,
                    });
                } else {
                    showErrorToast({
                        message: result?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPEmploymentAddress][onDoneTap] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    const onBackTap = () => {
        console.log("[PLSTPOtherDetails] >> [onBackTap]");

        navigation.navigate(PLSTP_EMPLOYMENT_ADDRESS, {
            ...route.params,
        });
    };

    const onCloseTap = () => {
        console.log("[PLSTPOtherDetails] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    function toggleBtnPress(from) {
        console.log("[PLSTPOtherDetails] >> [toggleBtnPress]");
        setPopupTitle(from === "MonthlyCommitment" ? PLSTP_NON_BANK_TT_TITLE : PLSTP_NET_INCOME);
        setPopupDesc(from === "MonthlyCommitment" ? PLSTP_NON_BANK_TT_DESC : PLSTP_NET_INCOME_NOTE);
        setShowPopup(!showPopup);
    }

    const getFormData = () => {
        console.log("[PLSTPOtherDetails] >> [getFormData]");

        return {
            otherCommitment: removeCommas(state.monthlyCommitment),
            primaryIncome: state.primaryIncomeValue ? state.primaryIncome : "",
            primaryIncomeValue: state.primaryIncomeValue,
            sourceOfWealth: state.sourceOfWealthValue ? state.sourceOfWealth : "",
            sourceOfWealthValue: state.sourceOfWealthValue,
            sourceOfIncome: state.sourceOfIncomeValue ? state.sourceOfIncome : "",
            sourceOfIncomeValue: state.sourceOfIncomeValue,
            netIncome: removeCommas(state.monthlyNetIncome),
        };
    };

    const nonBankComponent = () => {
        return (
            <View style={Style.popUp}>
                <Typo
                    fontSize={14}
                    fontWeight="700"
                    lineHeight={20}
                    textAlign="left"
                    text={popupTitle}
                    style={Style.popUpTitle}
                />
                <ScrollView>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={popupDesc}
                    />
                </ScrollView>
            </View>
        );
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_8">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_8}
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
                            <View style={Style.formContainer}>
                                {/* PLSTP_NON_BANK_TITLE */}
                                {showDD && (
                                    <React.Fragment>
                                        <LabeledDropdown
                                            label={PLSTP_PRIMARY_INCOME}
                                            dropdownValue={state.primaryIncome}
                                            isValid={state.primaryIncomeValid}
                                            errorMessage={state.primaryIncomeErrorMsg}
                                            onPress={onPrimaryIncomeFieldTap}
                                            style={Style.fieldViewCls}
                                        />

                                        <LabeledDropdown
                                            label={PLSTP_SOURCE_WEALTH}
                                            dropdownValue={state.sourceOfWealth}
                                            isValid={state.sourceOfWealthValid}
                                            errorMessage={state.sourceOfWealthErrorMsg}
                                            onPress={onSourceOfWealthFieldTap}
                                            style={Style.fieldViewCls}
                                        />
                                    </React.Fragment>
                                )}
                                {/* Net Income */}
                                {isSAL && (
                                    <View style={Style.fieldViewCls}>
                                        <View style={Style.leftItemCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={PLSTP_NET_INCOME}
                                            />
                                            <TouchableOpacity
                                                onPress={() => toggleBtnPress("NetIncome")}
                                                style={Style.rightTouch}
                                            >
                                                <Image
                                                    source={Assets.passwordInfo}
                                                    style={Style.imageNetInc}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput
                                            maxLength={7}
                                            isValidate
                                            isValid={state.monthlyNetIncomeValid}
                                            errorMessage={state.monthlyNetIncomeErrorMsg}
                                            keyboardType={"number-pad"}
                                            value={state.monthlyNetIncome}
                                            placeholder={AMOUNT_PLACEHOLDER}
                                            onChangeText={onmonthlyNetIncomeChange}
                                            prefix={CURRENCY_CODE}
                                        />
                                    </View>
                                )}
                                {/* Monthly commitment */}
                                <View style={Style.fieldViewCls}>
                                    <View style={Style.leftItemCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            style={Style.leftTypo}
                                        >
                                            {PLSTP_NON_BANK_LOANS}
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="left"
                                                text=" non-bank "
                                            />
                                            {PLSTP_NON_BANK_LOANS_1}
                                        </Typo>
                                        <TouchableOpacity
                                            onPress={() => toggleBtnPress("MonthlyCommitment")}
                                            style={Style.rightTouch}
                                        >
                                            <Image
                                                source={Assets.passwordInfo}
                                                style={Style.image}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        maxLength={7}
                                        isValidate
                                        isValid={state.monthlyCommitmentValid}
                                        errorMessage={state.monthlyCommitmentErrorMsg}
                                        keyboardType="number-pad"
                                        value={state.monthlyCommitment}
                                        placeholder={AMOUNT_PLACEHOLDER}
                                        onChangeText={onmonthlyCommitmentChange}
                                        prefix={CURRENCY_CODE}
                                    />
                                </View>
                                {/* Primary Income */}
                                {aboveAge && (
                                    <LabeledDropdown
                                        label={PLSTP_SOURCE_INCOME}
                                        dropdownValue={state.sourceOfIncome}
                                        isValid={state.sourceOfIncomeValid}
                                        errorMessage={state.sourceOfIncomeErrorMsg}
                                        onPress={onsourceOfIncomeFieldTap}
                                        style={Style.fieldViewCls}
                                    />
                                )}
                            </View>
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
                <Popup
                    visible={showPopup}
                    title="" //{PLSTP_NON_BANK_TT_TITLE}
                    // description={PLSTP_NON_BANK_TT_DESC}
                    ContentComponent={nonBankComponent}
                    onClose={toggleBtnPress}
                />
            </ScreenContainer>
            {/* primaryIncome Picker */}
            {state.primaryIncomeData && (
                <ScrollPickerView
                    showMenu={state.primaryIncomePicker}
                    selectedIndex={state.primaryIncomePickerIndex}
                    list={state.primaryIncomeData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* sourceOfWealth Picker */}
            {state.sourceOfWealthData && (
                <ScrollPickerView
                    showMenu={state.sourceOfWealthPicker}
                    selectedIndex={state.sourceOfWealthPickerIndex}
                    list={state.sourceOfWealthData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* sourceOfIncome Picker */}
            {state.sourceOfIncomeData && (
                <ScrollPickerView
                    showMenu={state.sourceOfIncomePicker}
                    selectedIndex={state.sourceOfIncomePickerIndex}
                    list={state.sourceOfIncomeData}
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

    image: {
        height: 15,
        marginLeft: 15,
        marginTop: 18,
        width: 15,
    },

    imageNetInc: {
        height: 15,
        marginLeft: 15,
        marginTop: 3,
        width: 15,
    },

    leftItemCls: {
        alignItems: "flex-start",
        flexDirection: "row",
        overflow: "visible",
    },

    leftTypo: { width: "90%" },

    popUp: {
        maxHeight: 580,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },

    popUpTitle: {
        marginVertical: 14,
    },
    rightTouch: { width: "10%" },
    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PLSTPOtherDetails;

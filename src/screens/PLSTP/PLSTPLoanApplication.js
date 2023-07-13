import React, { useReducer, useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";
import { validateLoanApplication } from "@screens/PLSTP/PLSTPValidation";

import { PLSTP_REPAYMENT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import AccountsDropdownInnerBody from "@components/FormComponents/AccountsDropdownInnerBody";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { calculateLoan } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED } from "@constants/colors";
import {
    STEP_3,
    TYPE_OF_LOAN,
    AMOUNT_NEED,
    AMOUNT_NEED_NOTE,
    MIN_AMOUNT_BORROW,
    MIN_AMOUNT_NOTE,
    MIN_AMOUNT_TT_TITLE,
    MIN_AMOUNT_TT,
    TENURE,
    LOAN_PURPOSE,
    PAYOUT_ACCOUNT,
    PAYOUT_NOTE,
    DONE,
    CANCEL,
    PLEASE_SELECT,
    PLSTP_SAVE_NEXT,
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
} from "@constants/strings";

import Assets from "@assets";

// Initial state object
const initialState = {
    // Loan Type
    loanType: PLEASE_SELECT,
    loanTypeValue: null,
    loanTypeValid: true,
    loanTypeErrorMsg: "",
    loanTypeData: null,
    loanTypeKeyVal: null,
    loanTypePicker: false,
    loanPickerIndex: 0,

    //Amount Need
    amountNeed: "",
    amountNeedValid: true,
    amountNeedErrorMsg: "",

    //Min Amount
    minAmount: "",
    minAmountValid: true,
    minAmountErrorMsg: "",

    // Tenure
    tenure: PLEASE_SELECT,
    tenureValue: null,
    tenureValid: true,
    tenureErrorMsg: "",
    tenureData: null,
    tenureKeyVal: null,
    tenurePicker: false,
    tenurePickerIndex: 0,

    // Purpose
    purpose: PLEASE_SELECT,
    purposeValue: null,
    purposeValid: true,
    purposeErrorMsg: "",
    purposeData: null,
    purposeKeyVal: null,
    purposePicker: false,
    purposePickerIndex: 0,

    // Payout
    payout: PLEASE_SELECT,
    payoutName: "",
    payoutValue: null,
    payoutValid: true,
    payoutErrorMsg: "",
    payoutData: null,
    payoutKeyVal: null,
    payoutPicker: false,
    payoutPickerIndex: 0,

    // Others
    isContinueDisabled: true,
    eligibleMinAmount: MIN_AMOUNT_NOTE,
    eligibleMaxAmount: AMOUNT_NEED_NOTE,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "populateDropdowns":
            return {
                ...state,
                loanTypeData: payload?.typeOfLoan ?? state.loanTypeData,
                tenureData: payload?.tenure ?? state.tenureData,
                purposeData: payload?.purposeOfLoan ?? state.purposeData,
                payoutData: payload?.payout ?? state.payoutData,
            };
        case "clearErrorMsgs":
            return {
                ...state,
                amountNeedValid: payload?.valid,
                amountNeedErrorMsg: payload?.errorMsg,
                minAmountValid: payload?.valid,
                minAmountErrorMsg: payload?.errorMsg,
            };
        case "eligibleMinAmount":
            return {
                ...state,
                eligibleMinAmount: payload,
            };
        case "eligibleMaxAmount":
            return {
                ...state,
                eligibleMaxAmount: payload,
            };
        case "loanTypePicker":
            return {
                ...state,
                loanTypePicker: payload,
                pickerType: payload && "loanType",
            };
        case "loanType":
            return {
                ...state,
                loanType: payload?.name ?? PLEASE_SELECT,
                loanTypeValue: payload?.id ?? null,
                loanPickerIndex: payload.index ?? 0,
            };
        case "amountNeed":
            return {
                ...state,
                amountNeed: payload,
            };
        case "amountNeedValid":
            return {
                ...state,
                amountNeedValid: payload?.valid,
                amountNeedErrorMsg: payload?.errorMsg,
            };
        case "minAmount":
            return {
                ...state,
                minAmount: payload.value,
            };
        case "minAmountValid":
            return {
                ...state,
                minAmountValid: payload?.valid,
                minAmountErrorMsg: payload?.errorMsg,
            };
        case "tenurePicker":
            return {
                ...state,
                tenurePicker: payload,
                pickerType: payload && "tenure",
            };
        case "tenure":
            return {
                ...state,
                tenure: payload?.name ?? PLEASE_SELECT,
                tenureValue: payload?.id ?? null,
                tenurePickerIndex: payload.index ?? 0,
            };
        case "purposePicker":
            return {
                ...state,
                purposePicker: payload,
                pickerType: payload && "purpose",
            };
        case "purpose":
            return {
                ...state,
                purpose: payload?.name ?? PLEASE_SELECT,
                purposeValue: payload?.id ?? null,
                purposePickerIndex: payload.index ?? 0,
            };
        case "payoutPicker":
            return {
                ...state,
                payoutPicker: payload,
                pickerType: payload && "payout",
            };
        case "payout":
            return {
                ...state,
                payout: payload?.acctId ? `${payload?.acctId}` : PLEASE_SELECT,
                payoutValue: payload?.id ?? null,
                payoutPickerIndex: payload.index ?? 0,
                payoutName: payload?.productName,
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

function PLSTPLoanApplication({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [maxLoanAmount, setMaxLoanAmount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const params = route?.params ?? {};
    const { customerInfo, masterData, stpRefNum, isSAL } = params?.initParams;
    const showPayoutAccount = !!masterData?.payout?.length;
    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        // console.log("[PLSTPLoanApplication] >> [Form Fields Updated]");
        const { loanType, amountNeed, minAmount, tenure, purpose, payout } = state;
        dispatch({
            actionType: "isContinueDisabled",
            payload:
                loanType === PLEASE_SELECT ||
                amountNeed === "" ||
                minAmount === "" ||
                tenure === PLEASE_SELECT ||
                purpose === PLEASE_SELECT ||
                (showPayoutAccount && payout === PLEASE_SELECT),
        });
    }, [
        state.loanType,
        state.amountNeed,
        state.minAmount,
        state.tenure,
        state.purpose,
        state.payout,
    ]);

    const init = async () => {
        console.log("[PLSTPLoanApplication] >> [init]");
        // const params = route?.params ?? {};
        // console.log("params ::: ",params);
        // const { customerInfo, masterData } = params?.initParams;

        //Need to change below after GCIF and Resume implemented
        const { loanTypeValue, amountNeed, minAmount, tenureValue, purposeValue, payoutValue } =
            customerInfo;
        const { loanTypeKeyVal, tenureKeyVal, purposeKeyVal, payoutKeyVal } = masterData;

        navigation.setParams({
            ...route?.params,
            initParams: {
                ...route?.params?.initParams,
                prequal2Status: false,
            },
        });
        // Update Notes
        const grossInc = isSAL
            ? removeCommas(customerInfo?.monthlyGrossInc)
            : removeCommas(customerInfo?.ietGrossIncome);
        let amt = masterData?.maxAmountLoan * grossInc;
        if (amt > masterData?.maxLoanLimit) {
            amt = masterData?.maxLoanLimit;
        }
        setMaxLoanAmount(amt);
        const minAmountNote = state.eligibleMinAmount.replace(
            "{MINAMOUNT}",
            addCommas(masterData.minAmountLoan)
        );
        const maxAmountNote = state.eligibleMaxAmount.replace("{MAXAMOUNT}", addCommas(amt));
        dispatch({ actionType: "eligibleMinAmount", payload: minAmountNote });
        dispatch({ actionType: "eligibleMaxAmount", payload: maxAmountNote });

        // Populate drodown data
        dispatch({ actionType: "populateDropdowns", payload: masterData });

        // Pre-populate field values if any existing
        if (loanTypeValue)
            dispatch({
                actionType: "loanType",
                payload: {
                    name: loanTypeKeyVal[loanTypeValue],
                    id: loanTypeValue,
                },
            });
        if (amountNeed) dispatch({ actionType: "amountNeed", payload: addCommas(amountNeed) });
        if (minAmount)
            dispatch({ actionType: "minAmount", payload: { value: addCommas(minAmount) } });
        if (tenureValue)
            dispatch({
                actionType: "tenure",
                payload: {
                    name: tenureKeyVal[tenureValue],
                    id: tenureValue,
                },
            });
        if (purposeValue)
            dispatch({
                actionType: "purpose",
                payload: {
                    name: purposeKeyVal[purposeValue],
                    id: purposeValue,
                },
            });
        if (payoutValue)
            dispatch({
                actionType: "payout",
                payload: {
                    acctId: payoutKeyVal[payoutValue],
                    id: payoutValue,
                    productName: customerInfo?.payoutName,
                },
            });
    };

    function toggleBtnPress() {
        console.log("[PLSTPLoanApplication] >> [toggleBtnPress]");
        setShowPopup(!showPopup);
    }

    // Actions
    const onLoanTypeFieldTap = () => {
        dispatch({
            actionType: "loanTypePicker",
            payload: true,
        });
    };

    const onTenureFieldTap = () => {
        dispatch({
            actionType: "tenurePicker",
            payload: true,
        });
    };

    const onPurposeFieldTap = () => {
        dispatch({
            actionType: "purposePicker",
            payload: true,
        });
    };

    const onPayoutFieldTap = () => {
        dispatch({
            actionType: "payoutPicker",
            payload: true,
        });
    };

    const onAmountNeedChange = (value) => {
        console.log("[PLSTPLoanApplication] >> [onAmountNeedChange]");

        value = addCommas(value);
        dispatch({
            actionType: "amountNeed",
            payload: value,
        });
    };

    const onMinAmountChange = (value) => {
        console.log("[PLSTPLoanApplication] >> [onMinAmountChange]");

        value = addCommas(value);
        dispatch({
            actionType: "minAmount",
            payload: { value },
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
            case "loanType":
                dispatch({
                    actionType: "loanTypePicker",
                    payload: false,
                });
                break;
            case "tenure":
                dispatch({
                    actionType: "tenurePicker",
                    payload: false,
                });
                break;
            case "purpose":
                dispatch({
                    actionType: "purposePicker",
                    payload: false,
                });
                break;
            case "payout":
                dispatch({
                    actionType: "payoutPicker",
                    payload: false,
                });
                break;
            default:
                break;
        }
    };

    const onDoneTap = () => {
        console.log("[PLSTPLoanApplication] >> [onDoneTap]");

        // Return if button is disabled
        if (state.isContinueDisabled) return;
        //clear error messages
        dispatch({
            actionType: "clearErrorMsgs",
            payload: { valid: true, errorMsg: "" },
        });
        const validateResult = { isValid: false, message: "", actionType: "" };
        const loanApplicationData = getFormData();
        Object.assign(
            validateResult,
            validateLoanApplication(loanApplicationData, masterData, maxLoanAmount)
        );
        const diffLoanAmount = removeCommas(state.amountNeed) % (masterData?.roundOff || 100);
        const diffMinAmount = removeCommas(state.minAmount) % (masterData?.roundOff || 100);
        if (diffLoanAmount && diffLoanAmount != 0) {
            const roundDownAmount = removeCommas(state.amountNeed) - diffLoanAmount;
            dispatch({ actionType: "amountNeed", payload: addCommas(roundDownAmount) });
        } else if (diffMinAmount && diffMinAmount != 0) {
            const roundDownAmount = removeCommas(state.minAmount) - diffMinAmount;
            dispatch({ actionType: "minAmount", payload: { value: addCommas(roundDownAmount) } });
        }
        const result = (masterData?.minAmountPercentage / 100) * masterData?.minAmountLoan;
        const minLoanApply = result + masterData?.minAmountLoan;
        if (removeCommas(state.amountNeed) <= minLoanApply) {
            dispatch({
                actionType: "minAmount",
                payload: { value: addCommas(masterData?.minAmountLoan) },
            });
        }

        dispatch({
            actionType: validateResult.actionType,
            payload: { valid: validateResult.isValid, errorMsg: validateResult.message },
        });
        if (!validateResult.isValid) return;
        Object.assign(customerInfo, loanApplicationData);
        const data = {
            stpRefNo: stpRefNum,
            loanAmount: removeCommas(state.amountNeed),
            minLoanAmount: removeCommas(state.minAmount),
            loanTenure: {
                id: state.tenureValue,
                type: state.tenure,
            },
            typeOfLoan: {
                id: state.loanTypeValue,
                type: state.loanType,
            },
            purpose: {
                id: state.purposeValue,
                type: state.purpose,
            },
            account: {
                id: state.payoutValue,
                acctId: state.payout,
                productName: state.payoutName,
            },
        };
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_3",
        });

        calculateLoan(data)
            .then((response) => {
                // Navigate to Next screen (ScreenName : PLSTP_REPAYMENT_DETAILS)
                if (response?.data?.code === 200) {
                    const { loanInteret, monthlyInstalment, premiumAmount } =
                        response?.data?.result;
                    const custInfo = {
                        ...route?.params?.initParams?.customerInfo,
                        loanInteret,
                        monthlyInstalment,
                        premiumAmount,
                    };
                    const initData = {
                        ...route?.params?.initParams,
                        prequal2Status: false,
                        isSAL: !isSAL ? !showPayoutAccount : true,
                        customerInfo: custInfo,
                    };
                    console.log("calculate route.params", route?.params);
                    navigation.navigate(PLSTP_REPAYMENT_DETAILS, {
                        ...route.params,
                        initParams: initData,
                    });
                } else {
                    showErrorToast({
                        message: response?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[PLSTPIncomeDetails][onDoneTap] >> Catch", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    function renderPayoutAccount() {
        if (state.payout !== PLEASE_SELECT)
            return <AccountsDropdownInnerBody title={state.payoutName} subtitle={state.payout} />;
        return null;
    }

    const onCloseTap = () => {
        console.log("[PLSTPLoanApplication] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    };

    const getFormData = () => {
        console.log("[PLSTPLoanApplication] >> [getFormData]");
        return {
            loanType: state.loanType,
            loanTypeValue: state.loanTypeValue,
            amountNeed: removeCommas(state.amountNeed),
            minAmount: removeCommas(state.minAmount),
            tenure: state.tenure,
            tenureValue: state.tenureValue,
            purpose: state.purpose,
            purposeValue: state.purposeValue,
            payout: state.payout,
            payoutValue: state.payoutValue,
            payoutName: state.payoutName,
        };
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_PersonalLoan_3">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={STEP_3}
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
                                style={Style.container}
                                behavior={Platform.OS == "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    {/* Type of loan */}
                                    <LabeledDropdown
                                        label={TYPE_OF_LOAN}
                                        dropdownValue={state.loanType}
                                        isValid={state.loanTypeValid}
                                        errorMessage={state.loanTypeErrorMsg}
                                        onPress={onLoanTypeFieldTap}
                                        style={Style.fieldViewCls}
                                    />
                                    {/* Amount need */}
                                    <View style={Style.fieldViewCls}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={AMOUNT_NEED}
                                        />
                                        <TextInput
                                            maxLength={10}
                                            isValidate
                                            isValid={state.amountNeedValid}
                                            errorMessage={state.amountNeedErrorMsg}
                                            keyboardType={"number-pad"}
                                            value={state.amountNeed}
                                            placeholder={AMOUNT_PLACEHOLDER}
                                            onChangeText={onAmountNeedChange}
                                            prefix={CURRENCY_CODE}
                                        />
                                        <Typo
                                            fontSize={11}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={state.eligibleMaxAmount}
                                        />
                                    </View>

                                    {/* Minimum Amount */}
                                    <View style={Style.fieldViewCls}>
                                        <View style={Style.leftItemCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={MIN_AMOUNT_BORROW}
                                            />
                                            <TouchableOpacity
                                                onPress={toggleBtnPress}
                                                style={Style.rightTouch}
                                            >
                                                <Image
                                                    source={Assets.passwordInfo}
                                                    style={Style.imageTT}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput
                                            maxLength={10}
                                            isValidate
                                            isValid={state.minAmountValid}
                                            errorMessage={state.minAmountErrorMsg}
                                            keyboardType={"number-pad"}
                                            value={state.minAmount}
                                            placeholder={AMOUNT_PLACEHOLDER}
                                            onChangeText={onMinAmountChange}
                                            prefix={CURRENCY_CODE}
                                        />
                                        <Typo
                                            fontSize={11}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={state.eligibleMinAmount}
                                        />
                                    </View>

                                    {/* Tenure */}
                                    <LabeledDropdown
                                        label={TENURE}
                                        dropdownValue={state.tenure}
                                        isValid={state.tenureValid}
                                        errorMessage={state.tenureErrorMsg}
                                        onPress={onTenureFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Purpose of Loan */}
                                    <LabeledDropdown
                                        label={LOAN_PURPOSE}
                                        dropdownValue={state.purpose}
                                        isValid={state.purposeValid}
                                        errorMessage={state.purposeErrorMsg}
                                        onPress={onPurposeFieldTap}
                                        style={Style.fieldViewCls}
                                    />

                                    {/* Payout Account */}
                                    {showPayoutAccount && (
                                        <View style={Style.fieldViewCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="left"
                                                text={PAYOUT_ACCOUNT}
                                            />
                                            <Typo
                                                fontSize={14}
                                                lineHeight={20}
                                                textAlign="left"
                                                text={PAYOUT_NOTE}
                                                style={Style.payoutNote}
                                            />
                                            <LabeledDropdown
                                                label=""
                                                dropdownValue={state.payout}
                                                customInnerBody={renderPayoutAccount()}
                                                onPress={onPayoutFieldTap}
                                            />
                                        </View>
                                    )}
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
                <Popup
                    visible={showPopup}
                    title={MIN_AMOUNT_TT_TITLE}
                    description={MIN_AMOUNT_TT}
                    onClose={toggleBtnPress}
                />
            </ScreenContainer>
            {/* Loan Type Picker */}
            {state.loanTypeData && (
                <ScrollPickerView
                    showMenu={state.loanTypePicker}
                    selectedIndex={state.loanPickerIndex}
                    list={state.loanTypeData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Tenure Picker */}
            {state.tenureData && (
                <ScrollPickerView
                    showMenu={state.tenurePicker}
                    selectedIndex={state.tenurePickerIndex}
                    list={state.tenureData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Purpose Picker */}
            {state.purposeData && (
                <ScrollPickerView
                    showMenu={state.purposePicker}
                    selectedIndex={state.purposePickerIndex}
                    list={state.purposeData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
            {/* Payout Picker */}
            {state.payoutData && (
                <ScrollPickerView
                    showMenu={state.payoutPicker}
                    selectedIndex={state.payoutPickerIndex}
                    list={state.payoutData}
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

    imageTT: {
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

    payoutNote: {
        marginTop: 18,
    },

    rightTouch: { width: "10%" },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PLSTPLoanApplication;

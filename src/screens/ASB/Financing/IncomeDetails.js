import React, { useReducer } from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { addCommas } from "@screens/PLSTP/PLSTPController";

import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import {
    PLEASE_SELECT,
    ASB_FINANCING,
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    MONTHLY_GROSS_INC,
    TOTAL_MONTHLY_NON,
    INCLUDIN_YOU_MONTHLY_COMMITMENTS,
} from "@constants/strings";

import Assets from "@assets";

const initialState = {
    title: PLEASE_SELECT,
    showPopup: false,

    grassIncome: "",
    grassIncomeValid: true,
    grassIncomeErrorMsg: "",

    totalMonthNonBank: "",
    totalMonthNonBankValid: true,
    totalMonthNonBankErrorMsg: "",
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "grassIncome":
            return {
                ...state,
                grassIncome: payload.grassIncome,
                grassIncomeErrorMsg: payload.grassIncomeErrorMsg,
                grassIncomeValid: payload.grassIncomeValid,
            };
        case "totalMonthNonBank":
            return {
                ...state,
                totalMonthNonBank: payload,
            };
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
            };
        default:
            return { ...state };
    }
}

function IncomeDetails() {
    const [state, dispatch] = useReducer(reducer, initialState);

    function onGrassIncomeChange(value) {
        const min = 500;
        const result = addCommas(value);
        let err = "";
        let isValid = false;
        if (value < min) {
            err = "Minimum amount must be greater than RM 500,00";
            isValid = false;
        } else {
            err = "";
            isValid = true;
        }
        dispatch({
            actionType: "grassIncome",
            payload: {
                grassIncome: result,
                grassIncomeErrorMsg: err,
                grassIncomeValid: isValid,
            },
        });
    }

    function onTotalMonthNonBankChange(value) {
        const result = addCommas(value);
        dispatch({
            actionType: "totalMonthNonBank",
            payload: result,
        });
    }

    function onTotalMonthInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: TOTAL_MONTHLY_NON,
                description: INCLUDIN_YOU_MONTHLY_COMMITMENTS,
            },
        });
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    return (
        <>
            <View style={styles.container}>
                <KeyboardAwareScrollView
                    style={styles.containerView}
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    enabled
                    showsVerticalScrollIndicator={false}
                >
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={20}
                        text={ASB_FINANCING}
                        textAlign="left"
                    />

                    <View style={styles.fieldViewCls}>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text={MONTHLY_GROSS_INC}
                        />
                        <TextInput
                            maxLength={7}
                            isValidate
                            isValid={state.grassIncomeValid}
                            errorMessage={state.grassIncomeErrorMsg}
                            keyboardType="number-pad"
                            value={state.grassIncome}
                            placeholder={AMOUNT_PLACEHOLDER}
                            onChangeText={onGrassIncomeChange}
                            prefix={CURRENCY_CODE}
                        />
                    </View>

                    <View style={styles.fieldViewCls}>
                        <View style={styles.infoLabelContainerCls}>
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                text={TOTAL_MONTHLY_NON}
                            />
                            <TouchableOpacity onPress={onTotalMonthInfoPress}>
                                <Image style={styles.infoIcon} source={Assets.icInformation} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            maxLength={7}
                            isValidate
                            isValid={state.totalMonthNonBankValid}
                            errorMessage={state.amountNeedErrorMsg}
                            keyboardType="number-pad"
                            value={state.totalMonthNonBank}
                            placeholder={AMOUNT_PLACEHOLDER}
                            onChangeText={onTotalMonthNonBankChange}
                            prefix={CURRENCY_CODE}
                        />
                    </View>
                </KeyboardAwareScrollView>
                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDescription}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    fieldViewCls: {
        marginTop: 25,
    },
    info: {
        paddingBottom: 24,
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
});

export default IncomeDetails;

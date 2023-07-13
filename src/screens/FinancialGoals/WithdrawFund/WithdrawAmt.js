import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_GOAL_OVERVIEW,
    FINANCIAL_REMOVE_GOAL,
    FINANCIAL_WITHDRAW_REASON,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withdrawFundMisc } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, RED } from "@constants/colors";
import {
    PROCEED,
    WITHDRAW_FUND,
    HOW_MUCH_WITHDRAW,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    DET_SUB_GAMCD,
    DET_WITHDRAW_GAMCD,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import GoalMatrixWarningPopUp from "../GoalOverview/GoalMatrixWarningPopUp";

const WithdrawAmt = ({ navigation, route }) => {
    const [responseData, setResponseData] = useState(null);
    const [keypadValue, setKeypadValue] = useState(
        route?.params?.withdrawAmt ? (route?.params?.withdrawAmt * 100).toString() : ""
    );
    const [rawValue, setRawValue] = useState(route?.params?.withdrawAmt ?? 0);
    const [formattedValue, setFormattedValue] = useState(
        route?.params?.withdrawAmt?.toString() ?? ""
    );
    const [error, setError] = useState(false);
    const totalPortfolioValueRaw = route.params.totalAmount;
    const [withdrawWarnPopup, setWithdrawWarnPopup] = useState(false);
    const WITHDRAW_FUND_WARN_DESC =
        "Your withdrawal amount will leave you with a portfolio value of less than RM400. Your portfolio will be suspended and we'll return all your investment plus returns to you. \n\nAre you sure you want to proceed?";
    const ERROR_MSG = `Your withdrawal amount must be between RM ${Number(
        responseData?.minBalAmt
    ).toFixed(2)} and RM ${numberWithCommas(responseData?.totalPortfolioValue ?? 0)}`;
    const TOTAL_PORTFOLIO_VALUE = `Total portfolio value: RM ${numberWithCommas(
        (responseData?.totalPortfolioValue ?? 0)?.toFixed(2)
    )}`;

    const isGoalDeletable = route?.params?.isGoalDeletable;
    const goalMatrixGamCd = route?.params?.goalMatrixGamCd;

    const goalMatrixPopupDelText =
        "Oops, we are processing your transaction. Please come back after your transaction is completed to delete your goal";

    const [goalMatrixText, setGoalMatrixText] = useState("");
    const [goalMatrixPopupTitle, setGoalMatrixPopupTitle] = useState("");
    const [goalMatrixPopUp, setGoalMatrixPopUp] = useState(false);

    useEffect(() => {
        fetchMiscData();
    }, [fetchMiscData]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_WithdrawFunds_Amount",
        });
    }, []);

    const fetchMiscData = useCallback(async () => {
        try {
            const response = await withdrawFundMisc(route?.params?.goalId, true);
            if (response?.data) {
                setResponseData(response?.data);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, [route?.params?.goalId]);

    function onPressBack() {
        navigation.goBack();
    }

    function handleKeyboardChange(value) {
        setError(false);
        if (!value) {
            console.tron.log("no value", rawValue);
            setRawValue(0);
            setFormattedValue("");
            setKeypadValue("");
            return;
        }

        const num = Number(value);
        if (num > 0) {
            const decimal = num / 100;

            setRawValue(decimal);
            setFormattedValue(numeral(decimal).format("0,0.00"));
            setKeypadValue(value);
        }
    }

    function handleKeyboardDone() {
        // Check for validations
        if (!validateForm()) {
            setError(true);
            return;
        } else if (!validateBalance()) {
            setWithdrawWarnPopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "FinancialGoals_WithdrawFunds_Confirm",
            });
            return;
        } else {
            setError(false);
            if (route?.params?.fromScreen) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: route?.params?.fromScreen,
                    params: {
                        ...route?.params,
                        withdrawAmt: rawValue,
                        goalName: route?.params?.goalName,
                        goalId: route?.params?.goalId,
                    },
                });
            } else {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_WITHDRAW_REASON,
                    params: {
                        withdrawAmt: rawValue,
                        goalName: route?.params?.goalName,
                        goalId: route?.params?.goalId,
                    },
                });
            }
        }
    }

    function validateBalance() {
        return responseData?.totalPortfolioValue - rawValue >= responseData?.minBalAmt;
    }

    function validateForm() {
        return (
            (rawValue >= responseData?.minBalAmt &&
                rawValue <= responseData?.totalPortfolioValue) || responseData?.totalPortfolioValue <= responseData?.minBalAmt
        );
    }

    function onCloseWithdrawFundWarn() {
        setWithdrawWarnPopup(false);
    }

    function onPressWithdrawProceed() {
        setWithdrawWarnPopup(false);

        if (
            goalMatrixGamCd === DET_SUB_GAMCD ||
            goalMatrixGamCd === DET_WITHDRAW_GAMCD ||
            !isGoalDeletable
        ) {
            // show Screen 3 template
            setGoalMatrixText(goalMatrixPopupDelText);
            setGoalMatrixPopupTitle("Delete This Goal");
            setGoalMatrixPopUp(true);
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FINANCIAL_REMOVE_GOAL,
                params: {
                    withdrawAmt: totalPortfolioValueRaw,
                    goalName: route?.params?.goalName,
                    totalWithdrawAmount: route?.params?.totalWithdrawAmount,
                    totalPortfolioValue: route?.params?.totalPortfolioValue,
                    roiAmount: route?.params?.roiAmount,
                    goalId: route?.params?.goalId,
                },
            });
        }
    }

    function onGoalMatrixPopupCancel() {
        setGoalMatrixPopUp(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>{WITHDRAW_FUND}</HeaderLabel>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    neverForceInset={["bottom"]}
                >
                    <View style={Style.wrapper}>
                        <View style={Style.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={TOTAL_PORTFOLIO_VALUE}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={20}
                                style={Style.label}
                                textAlign="left"
                                text={HOW_MUCH_WITHDRAW}
                            />
                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={formattedValue}
                                editable={false}
                                isValidate={true}
                                isValid={true}
                            />
                            {error && (
                                <Typo
                                    text={ERROR_MSG}
                                    fontSize={12}
                                    color={RED}
                                    fontWeight="400"
                                    textAlign="left"
                                    style={Style.error}
                                />
                            )}
                        </View>
                    </View>
                    <NumericalKeyboard
                        value={keypadValue}
                        maxLength={11}
                        onChangeText={handleKeyboardChange}
                        onDone={handleKeyboardDone}
                    />
                </ScreenLayout>
                <Popup
                    visible={withdrawWarnPopup}
                    title={WITHDRAW_FUND}
                    description={WITHDRAW_FUND_WARN_DESC}
                    onClose={onCloseWithdrawFundWarn}
                    primaryAction={{
                        text: PROCEED,
                        onPress: onPressWithdrawProceed,
                    }}
                    secondaryAction={{
                        text: "No",
                        onPress: onCloseWithdrawFundWarn,
                    }}
                />
                <GoalMatrixWarningPopUp
                    visible={goalMatrixPopUp}
                    title={goalMatrixPopupTitle}
                    description={goalMatrixText}
                    showActionButtons={false}
                    cancelMatrixPopUp={onGoalMatrixPopupCancel}
                />
            </ScreenContainer>
        </>
    );
};

WithdrawAmt.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    error: {
        paddingTop: 10,
    },
    label: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default WithdrawAmt;

import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View } from "react-native";

import AmountInput from "@screens/Property/Common/AmountInput";
import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import {
    BANKINGV2_MODULE,
    GOAL_SIMULATION,
    OTHER_SOURCES_CUSTOMIZE_PLAN,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import { CONTINUE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

function InvestmentSavingsContribution({ navigation, route }) {
    const screenType = route?.params?.screenType;

    useEffect(() => {
        const screenName = (() => {
            if (route?.params?.goalType === "E" && route?.params?.fundsFor === "myself") {
                if (screenType === "existSaving") {
                    return "FinancialGoals_Education_ExistingSavings_SavingsDetails";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_Education_ExistingInvestments_InvestmentDetails";
                }
            } else if (route?.params?.goalType === "E" && route?.params?.fundsFor === "child") {
                if (screenType === "existSaving") {
                    return "FinancialGoals_EducationChild_ExistingSavings_SavingsDetails";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_EducationChild_ExistingInvestments_InvestmentDetails";
                }
            } else {
                if (screenType === "existSaving") {
                    return "FinancialGoals_Wealth_ExistingSavings_SavingsDetails";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_Wealth_ExistingInvestments_InvestmentDetails";
                }
            }
        })();

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    }, []);

    const screenObject = {
        existSaving: {
            header: "Include Existing Savings",
            question1: "How much total savings and cash deposit do you currently have?",
            question2: "How much do you contribute monthly to your savings?",
            onPressContinue: onPressContinueExistSaving,
        },
        existInvestment: {
            header: "Include Existing Investments",
            question1: "What is the total value of your current investment?",
            question2: "How much do you contribute monthly to your investments?",
            onPressContinue: onPressContinueExistInvestment,
        },
    };

    const defaultTotalAmount = (() => {
        if (screenType === "existSaving") {
            return route?.params?.totalSavingCash;
        } else {
            // exist investment
            return route?.params?.totalOthInvestment;
        }
    })();

    const defaultMonthlyAmount = (() => {
        if (screenType === "existSaving") {
            return route?.params?.monthlySavingCash;
        } else {
            return route?.params?.monthlyOthInvestment;
        }
    })();

    const [showSlidingPad, setShowSlidingPad] = useState(false);
    const [totalAmount, setTotalAmount] = useState(
        defaultTotalAmount ? numberWithCommas(Number(defaultTotalAmount)?.toFixed(2) ?? "") : ""
    );
    const [keypadTotalAmount, setKeypadTotalAmount] = useState(
        defaultTotalAmount ? Math.round(defaultTotalAmount * 100) ?? "" : ""
    );
    const [rawTotalAmount, setRawTotalAmount] = useState(defaultTotalAmount ?? 0);

    const [monthlyAmount, setMonthlyAmount] = useState(
        defaultMonthlyAmount ? numberWithCommas(Number(defaultMonthlyAmount)?.toFixed(2) ?? "") : ""
    );
    const [keypadMonthlyAmount, setKeypadMonthlyAmount] = useState(
        defaultMonthlyAmount ? Math.round(defaultMonthlyAmount * 100) ?? "" : ""
    );
    const [rawMonthlyAmount, setRawMonthlyAmount] = useState(defaultMonthlyAmount ?? 0);

    function onDoneButtonPress() {
        setShowSlidingPad(false);
    }

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen:
                route?.params?.from === GOAL_SIMULATION ? GOAL_SIMULATION : FINANCIAL_GOAL_OVERVIEW,
        });
    }

    function changeText(value) {
        if (!value) {
            if (showSlidingPad === 1) {
                setRawTotalAmount(0);
                setTotalAmount("");
                setKeypadTotalAmount("");
                return;
            } else if (showSlidingPad === 2) {
                setRawMonthlyAmount(0);
                setMonthlyAmount("");
                setKeypadMonthlyAmount("");
                return;
            } else {
                return;
            }
        }

        const num = parseInt(value);
        if (num > 0) {
            const decimal = num / 100;

            if (showSlidingPad === 1) {
                setRawTotalAmount(decimal);
                setTotalAmount(numeral(decimal).format("0,0.00"));
                setKeypadTotalAmount(value);
            } else if (showSlidingPad === 2) {
                setRawMonthlyAmount(decimal);
                setMonthlyAmount(numeral(decimal).format("0,0.00"));
                setKeypadMonthlyAmount(value);
            } else {
                return;
            }
        }
    }

    function onPressContinueExistSaving() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: OTHER_SOURCES_CUSTOMIZE_PLAN,
            params: {
                ...route?.params,
                totalSavingCash: rawTotalAmount,
                monthlySavingCash: rawMonthlyAmount,
            },
        });
    }

    function onPressContinueExistInvestment() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: OTHER_SOURCES_CUSTOMIZE_PLAN,
            params: {
                ...route?.params,
                totalOthInvestment: rawTotalAmount,
                monthlyOthInvestment: rawMonthlyAmount,
            },
        });
    }

    function onPressTotal() {
        setShowSlidingPad(1);
    }

    function onPressMonthlyInvestment() {
        setShowSlidingPad(2);
    }

    const numPadValue = (() => {
        if (showSlidingPad === 1) {
            return keypadTotalAmount;
        } else if (showSlidingPad === 2) {
            return keypadMonthlyAmount;
        } else {
            return "";
        }
    })();

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseButtonPress} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={screenObject?.[screenType]?.header}
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <View style={styles.container}>
                            <AmountInput
                                style={styles.amountInput}
                                label={screenObject?.[screenType]?.question1}
                                onPress={onPressTotal}
                                subLabel="RM"
                                value={`${totalAmount}`}
                            />

                            <AmountInput
                                style={styles.amountInput}
                                label={screenObject?.[screenType]?.question2}
                                onPress={onPressMonthlyInvestment}
                                subLabel="RM"
                                value={`${monthlyAmount}`}
                            />
                        </View>
                        {!showSlidingPad && (
                            <FixedActionContainer>
                                <ActionButton
                                    onPress={screenObject?.[screenType]?.onPressContinue}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={CONTINUE}
                                        />
                                    }
                                    fullWidth
                                />
                            </FixedActionContainer>
                        )}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            <SlidingNumPad
                value={`${numPadValue}`}
                onChange={changeText}
                maxLength={8}
                showNumPad={!!showSlidingPad}
                onDone={onDoneButtonPress}
            />
        </>
    );
}

InvestmentSavingsContribution.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default InvestmentSavingsContribution;

const styles = {
    container: {
        flex: 1,
        alignItems: "stretch",
        paddingHorizontal: 24,
    },
    amountInput: {
        paddingTop: 20,
    },
};

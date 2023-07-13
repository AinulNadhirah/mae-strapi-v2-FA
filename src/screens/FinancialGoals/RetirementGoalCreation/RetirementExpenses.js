import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_RET_YEAR_RANGE } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { useModelController, withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, RED } from "@constants/colors";
import {
    GOAL_BASED_INVESTMENT,
    RETIREMENT_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_RETIREMENT_EXPENSES,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const RetirementExpenses = ({ navigation, route }) => {
    function onPressBack() {
        navigation.goBack();
    }

    const { getModel } = useModelController();
    const { retirementData } = getModel("financialGoal");
    const minValue = retirementData?.["Monthly Expenses Input Range"]?.[0]?.minValue ?? 500;
    const maxValue = retirementData?.["Monthly Expenses Input Range"]?.[0]?.maxValue ?? 999999;

    const [keypadValue, setKeypadValue] = useState(
        route?.params?.monthlyExpenses
            ? (route?.params?.monthlyExpenses * 100).toString()
            : "500000"
    );
    const [rawValue, setRawValue] = useState(route?.params?.monthlyExpenses ?? 5000.0);
    const [formattedValue, setFormattedValue] = useState(
        route?.params?.monthlyExpenses
            ? numeral(route?.params?.monthlyExpenses).format("0,0.00")
            : "5,000.00"
    );
    const [error, setError] = useState(false);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_RETIREMENT_EXPENSES,
        });
    }, []);

    function handleKeyboardChange(value) {
        if (!value) {
            console.tron.log("no value", rawValue);
            setRawValue(0);
            setFormattedValue("");
            setKeypadValue("");
            return;
        }

        const num = parseInt(value);
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
        } else setError(false);

        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_RET_YEAR_RANGE,
            params: {
                ...route?.params,
                monthlyExpenses: rawValue,
            },
        });
    }

    function validateForm() {
        return rawValue >= minValue && rawValue <= maxValue;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
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
                            text={RETIREMENT_GOAL}
                            textAlign="left"
                        />
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={20}
                            style={Style.label}
                            textAlign="left"
                            text="How much is your estimated monthly expenses after retirement?"
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
                                text={`Please enter a value between RM ${numberWithCommas(
                                    minValue.toFixed(2)
                                )} and RM ${numberWithCommas(maxValue.toFixed(2))}`}
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
                    maxLength={8}
                    onChangeText={handleKeyboardChange}
                    onDone={handleKeyboardDone}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

RetirementExpenses.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
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

export default withModelContext(RetirementExpenses);

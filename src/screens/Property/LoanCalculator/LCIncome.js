import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { LC_COMMITMENTS, BANKINGV2_MODULE, LC_RESULT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_FORM_PROCEED, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

function LCIncome({ route, navigation }) {
    const [rawValue, setRawValue] = useState(0);
    const [formattedValue, setFormattedValue] = useState("");
    const [keypadValue, setKeypadValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        init();
    }, []);

    // Used to detect if navigated from LC Result screen "Calculate Again" CTA
    useEffect(() => {
        const from = route.params?.from ?? null;
        if (from === LC_RESULT) resetAmount();
    }, [route.params]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_MonthlyIncome",
        });
    }, []);

    const init = async () => {
        console.log("[LCIncome] >> [init]");
    };

    const onBackTap = () => {
        console.log("[LCIncome] >> [onBackTap]");

        navigation.goBack();
    };

    const resetAmount = () => {
        console.log("[LCIncome] >> [resetAmount]");

        setRawValue(0);
        setFormattedValue("");
        setKeypadValue("");
        setError("");
    };

    function handleKeyboardChange(value) {
        console.log("[LCIncome] >> [handleKeyboardChange]");

        if (!value) {
            console.tron.log("no value", value);
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
        console.log("[LCIncome] >> [handleKeyboardDone]");

        // Check for validations
        if (!validateForm()) return;

        // Retrieve form data
        const formData = getFormData();

        navigation.navigate(BANKINGV2_MODULE, {
            screen: LC_COMMITMENTS,
            params: { ...formData },
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_MonthlyIncome",
        });
    }

    const validateForm = () => {
        console.log("[LCIncome] >> [validateForm]");

        // Min value check
        if (!rawValue || rawValue < 0.01) {
            setError("Amount needs to be at least RM 0.01");
            return false;
        }

        // Set empty error value
        setError("");

        // Return true if passes validation checks
        return true;
    };

    const getFormData = () => {
        console.log("[LCIncome] >> [getFormData]");

        return {
            ...route.params,
            monthlyGrossIncome: String(rawValue),
        };
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackTap} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={24}
                useSafeArea
                neverForceInset={["bottom"]}
            >
                <>
                    <View style={Style.wrapper}>
                        <View style={Style.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Financing Calculator"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={Style.label}
                                text="What is your monthly gross income?"
                                textAlign="left"
                            />
                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={formattedValue}
                                editable={false}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                            />
                        </View>
                    </View>
                    <NumericalKeyboard
                        value={keypadValue}
                        onChangeText={handleKeyboardChange}
                        maxLength={12}
                        onDone={handleKeyboardDone}
                    />
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

LCIncome.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default LCIncome;

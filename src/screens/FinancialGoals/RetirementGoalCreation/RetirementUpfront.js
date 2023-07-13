import { useFocusEffect } from "@react-navigation/core";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { FINANCIAL_RET_UPFRONT } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getCustomerRisk } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, RED } from "@constants/colors";
import {
    GOAL_BASED_INVESTMENT,
    RETIREMENT_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_RETIREMENT_AMT,
} from "@constants/strings";

import { mapRiskScore, mapRiskScoreToText } from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import RiskProfilePopup from "../RiskProfile/RiskProfilePopup";

const RetirementUpfront = ({ navigation, route }) => {
    function onPressBack() {
        navigation.goBack();
    }

    const { getModel } = useModelController();
    const { retirementData } = getModel("financialGoal");
    const minValue = retirementData?.["One-Time Investment Input Range"]?.[0]?.minValue ?? 400;
    const maxValue =
        retirementData?.["One-Time Investment Input Range"]?.[0]?.maxValue ?? 100000000;
    const [keypadValue, setKeypadValue] = useState(
        route?.params?.initialAmt
            ? (route?.params?.initialAmt * 100).toString()
            : String(minValue * 100)
    );
    const [rawValue, setRawValue] = useState(route?.params?.initialAmt ?? minValue);
    const [formattedValue, setFormattedValue] = useState(
        route?.params?.initialAmt
            ? numeral(route?.params?.initialAmt).format("0,0.00")
            : String(minValue.toFixed(2))
    );
    const [customerRisk, setCustomerRisk] = useState(null);
    const [customerRiskDate, setCustomerRiskDate] = useState(null);
    const [showRiskPopup, setShowRiskPopup] = useState(false);
    const [error, setError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.showPopup) {
                setShowRiskPopup(true);
                setCustomerRisk(mapRiskScoreToText(route?.params?.customerRiskLevel));
            }
        }, [route?.params?.customerRiskLevel, route?.params?.showPopup])
    );

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_RETIREMENT_AMT,
        });
    }, []);

    function handleKeyboardChange(value) {
        console.log("[RetirementGoalCreation] >> [handleKeyboardChange]");

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

    async function handleKeyboardDone() {
        // Check for validations
        if (!validateForm()) {
            setError(true);
            return;
        } else {
            setError(false);
            await fetchCustomerRisk();
        }
    }

    async function fetchCustomerRisk() {
        try {
            const response = await getCustomerRisk();
            const risk = response?.data?.riskProfileName;

            if (risk && risk !== "") {
                setCustomerRisk(risk);
                setCustomerRiskDate(response?.data?.riskDateEntered);
            } else {
                setCustomerRisk("No Risk Profile");
            }
            setShowRiskPopup(true);
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }

    function onCloseRiskPopup() {
        setShowRiskPopup(false);
    }

    function validateForm() {
        return rawValue >= minValue && rawValue <= maxValue;
    }

    return (
        <>
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
                                text="I can commit an upfront amount of"
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
                        maxLength={11}
                        onChangeText={handleKeyboardChange}
                        onDone={handleKeyboardDone}
                    />
                </ScreenLayout>
            </ScreenContainer>
            <RiskProfilePopup
                visible={showRiskPopup}
                riskLevel={customerRisk}
                onClose={onCloseRiskPopup}
                navigation={navigation}
                navigationParams={{
                    ...route?.params,
                    initialAmt: rawValue,
                    gbiRiskLevel: mapRiskScore(customerRisk),
                    customerRiskLevel: mapRiskScore(customerRisk),
                    clientRiskDate: customerRiskDate,
                    fromScreen: FINANCIAL_RET_UPFRONT,
                }}
            />
        </>
    );
};

RetirementUpfront.propTypes = {
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

export default RetirementUpfront;

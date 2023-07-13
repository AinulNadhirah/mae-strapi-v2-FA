import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    KICKSTART_SELECTION,
    KICKSTART_CONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { RED } from "@constants/colors";
import {
    CURRENCY_CODE,
    GOAL_BASED_INVESTMENT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_AMT,
    FA_FORM_ERROR,
    FA_FIELD_INFORMATION,
    FA_VALUE,
} from "@constants/strings";

import { getGoalTitle } from "@utils/dataModel/utilityFinancialGoals";

const KickStartDeposit = ({ navigation, route }) => {
    const title = getGoalTitle(route?.params?.goalType);

    const [deposit, setDeposit] = useState(route?.params?.deposit ?? 0);
    const [formattedValue, setFormattedValue] = useState(
        numeral(route?.params?.deposit).format("0,0.00") ?? ""
    );
    const [keypadValue, setKeypadValue] = useState(
        route?.params?.deposit ? route?.params?.deposit * 100 : ""
    );
    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_AMT,
        });
    }, []);

    function onPressClose() {
        navigation.pop(2);
    }

    function onPressBack() {
        navigation.goBack();
    }

    function handleKeyboardChange(value) {
        setErrorMsg("");
        setShowError(false);

        if (!value) {
            setFormattedValue("");
            setKeypadValue("");
            return;
        }

        const num = parseInt(value);
        if (num > 0) {
            const decimal = num / 100;

            setFormattedValue(numeral(decimal).format("0,0.00"));
            setDeposit(decimal);
            setKeypadValue(value);
        }
    }

    const minValue =
        route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.minValue ??
        400;

    const maxValue =
        route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.maxValue ??
        10000000;

    const fieldInfo = (() => {
        switch (route?.params?.goalType) {
            case "R":
                return "Retirement";
            case "E":
                return route?.params?.fundsFor === "myself" ? "Education" : "ChildEducation";
            case "W":
                return "Wealth";
        }
    })();

    function handleKeyboardDone() {
        if (deposit < minValue) {
            setErrorMsg(`A minimum amount of RM ${minValue} is required`);
            setShowError(true);
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_AMT,
                [FA_FIELD_INFORMATION]: fieldInfo,
                [FA_VALUE]: deposit,
            });
        } else if (deposit > maxValue) {
            setErrorMsg(`A maximum amount of RM ${numeral(maxValue).format("0,0.00")} is allowed`);
            setShowError(true);
            logEvent(FA_FORM_ERROR, {
                [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_AMT,
                [FA_FIELD_INFORMATION]: fieldInfo,
                [FA_VALUE]: deposit,
            });
        } else {
            setShowError(false);
            if (route?.params?.from) {
                navigation.pop();
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: route?.params?.from,
                    params: {
                        deposit,
                    },
                });
            } else {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: KICKSTART_SELECTION,
                    params: {
                        ...route?.params,
                        deposit,
                    },
                });
            }
        }
    }

    return (
        <>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={
                                route?.params?.from !== KICKSTART_CONFIRMATION && (
                                    <HeaderCloseButton onPress={onPressClose} />
                                )
                            }
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={
                                <Typo
                                    text={GOAL_BASED_INVESTMENT}
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={styles.container}>
                        <Typo text={title} fontWeight="600" fontSize={14} textAlign="left" />
                        <Typo
                            text="How much would you like to deposit to kickstart your investment goal?"
                            fontWeight="400"
                            fontSize={14}
                            textAlign="left"
                            style={styles.question}
                        />
                        <TextInput
                            value={`${formattedValue}`}
                            prefix={CURRENCY_CODE}
                            placeholder="0.00"
                            editable={false}
                        />
                        {showError && (
                            <Typo
                                text={errorMsg}
                                fontSize={12}
                                color={RED}
                                fontWeight="400"
                                textAlign="left"
                                style={styles.error}
                            />
                        )}
                    </View>
                </ScreenLayout>
            </ScreenContainer>
            <NumericalKeyboard
                value={`${keypadValue}`}
                maxLength={12}
                onChangeText={handleKeyboardChange}
                onDone={handleKeyboardDone}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    error: {
        paddingTop: 10,
    },
    question: {
        paddingVertical: 24,
    },
});

KickStartDeposit.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default KickStartDeposit;

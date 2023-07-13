import { useFocusEffect } from "@react-navigation/core";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { FINANCIAL_EDUCATION_COMMIT_UPFRONT } from "@navigation/navigationConstant";

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

import { RED } from "@constants/colors";
import {
    ENTER_UPFRONT_AMOUNT,
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_EDU_AMT,
    FA_FIN_GOAL_CHILD_EDU_AMT,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import {
    mapRiskScore,
    mapRiskScoreToText,
    numberWithCommas,
} from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas as commaFormatted } from "@utils/dataModel/utilityPartial.3";

import RiskProfilePopup from "../RiskProfile/RiskProfilePopup";

const EducationCommitUpfront = ({ navigation, route }) => {
    const { getModel } = useModelController();
    const { educationData } = getModel("financialGoal");
    const minValue = educationData?.["One-Time Investment Input Range"]?.[0]?.minValue ?? 400;
    const maxValue = educationData?.["One-Time Investment Input Range"]?.[0]?.maxValue ?? 100000000;

    const initAmount = route?.params?.initialAmt;
    const [amount, setAmount] = useState(initAmount ? initAmount.toString() : String(minValue));
    const [amountValue, setAmountValue] = useState(initAmount ? initAmount * 100 : minValue * 100);
    const [showUpfrontAmountError, setShowUpfrontAmountError] = useState(false);
    const [showRiskPopup, setShowRiskPopup] = useState(false);
    const [customerRisk, setCustomerRisk] = useState(null);
    const [customerRiskDate, setCustomerRiskDate] = useState(null);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]:
                route?.params?.fundsFor === "myself"
                    ? FA_FIN_GOAL_EDU_AMT
                    : FA_FIN_GOAL_CHILD_EDU_AMT,
        });
    }, [route?.params?.fundsFor]);

    function onPressBack() {
        navigation.goBack();
    }

    // show popup when user navigate back from previous page
    useFocusEffect(
        useCallback(() => {
            if (route?.params?.showPopup) {
                setShowRiskPopup(true);
                setCustomerRisk(mapRiskScoreToText(route?.params?.customerRiskLevel));
            }
        }, [route?.params?.customerRiskLevel, route?.params?.showPopup])
    );

    function onNumPadChange(value) {
        const val = value ? Number(value) : 0;

        if (val > 0) {
            setAmount(numberWithCommas(val));
            setAmountValue(val);
        } else {
            setAmount("");
            setAmountValue(val);
        }
    }

    async function onNumPadDonePress() {
        const nonFormattedAmount = amountValue / 100;

        if (!nonFormattedAmount || nonFormattedAmount < minValue || nonFormattedAmount > maxValue) {
            setShowUpfrontAmountError(true);
        } else {
            setShowUpfrontAmountError(false);
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
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }

    function onCloseRiskPopup() {
        setShowRiskPopup(false);
    }
    return (
        <>
            <ScreenContainer backgroundType="color">
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
                >
                    <View style={styles.container}>
                        <View>
                            <Typo
                                text={EDUCATION_GOAL}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={24}
                                textAlign="left"
                                style={styles.title}
                            />

                            <Typo
                                text={ENTER_UPFRONT_AMOUNT}
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={24}
                                textAlign="left"
                                style={styles.title}
                            />

                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={amount ? Numeral(amount).format("0,0.00") : ""}
                                editable={false}
                                isValidate={true}
                                isValid={!showUpfrontAmountError}
                                errorMessage={`Please enter a value between RM ${commaFormatted(
                                    minValue.toFixed(2)
                                )} and RM ${commaFormatted(maxValue?.toFixed(2))}`}
                            />
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>

            <NumericalKeyboard
                value={`${amountValue}`}
                maxLength={11}
                onChangeText={onNumPadChange}
                onDone={onNumPadDonePress}
            />
            <RiskProfilePopup
                visible={showRiskPopup}
                riskLevel={customerRisk}
                onClose={onCloseRiskPopup}
                navigation={navigation}
                navigationParams={{
                    ...route?.params,
                    initialAmt: amountValue / 100,
                    gbiRiskLevel: mapRiskScore(customerRisk),
                    customerRiskLevel: mapRiskScore(customerRisk),
                    clientRiskDate: customerRiskDate,
                    fromScreen: FINANCIAL_EDUCATION_COMMIT_UPFRONT,
                }}
            />
        </>
    );
};

EducationCommitUpfront.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    errorMessage: {
        color: RED,
        marginTop: -5,
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingBottom: 8,
        paddingTop: 16,
    },
});

export default EducationCommitUpfront;

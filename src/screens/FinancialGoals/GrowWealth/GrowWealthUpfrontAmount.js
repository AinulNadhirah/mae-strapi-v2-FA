import { useFocusEffect } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View } from "react-native";

import { GROWTH_WEALTH_UPFRONT_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getCustomerRisk } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    CURRENCY_CODE,
    GOAL_BASED_INVESTMENT,
    GROWTH_WEATH_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_WEALTH_AMT,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import {
    mapRiskScore,
    mapRiskScoreToText,
    numberWithCommas,
} from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas as commaFormatted } from "@utils/dataModel/utilityPartial.3";

import RiskProfilePopup from "../RiskProfile/RiskProfilePopup";

const GrowWealthUpfrontAmount = ({ navigation, route }) => {
    const defaultAmount =
        route?.params?.miscData?.menuItemRangeDTOs?.["One-Time Investment Input Range"]?.[0]
            ?.minValue;

    const [amountValue, setAmountValue] = useState(
        route?.params?.initialAmt ? route?.params?.initialAmt * 100 : defaultAmount * 100
    );
    const [amount, setAmount] = useState(
        route?.params?.initialAmt
            ? numberWithCommas(route?.params?.initialAmt * 100)
            : numberWithCommas(defaultAmount * 100)
    );
    const [errAmount, setErrorAmount] = useState("");
    const [showRiskPopup, setShowRiskPopup] = useState(false);
    const [customerRisk, setCustomerRisk] = useState(null);
    const [customerRiskDate, setCustomerRiskDate] = useState(null);

    const { getModel } = useModelController();
    const { wealthData } = getModel("financialGoal");

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
            [FA_SCREEN_NAME]: FA_FIN_GOAL_WEALTH_AMT,
        });
    }, []);

    async function onDoneButtonPress() {
        const minValue = wealthData?.["One-Time Investment Input Range"]?.[0]?.minValue ?? 400;
        const maxValue =
            wealthData?.["One-Time Investment Input Range"]?.[0]?.maxValue ?? 100000000;

        const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";
        if (
            parseFloat(amountText).toFixed(2) < minValue ||
            parseFloat(amountText).toFixed(2) > maxValue
        ) {
            setErrorAmount(
                `Please enter a value between RM ${commaFormatted(
                    minValue?.toFixed(2)
                )} and RM ${commaFormatted(maxValue?.toFixed(2))}`
            );
            return;
        } else {
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

    function onBackButtonPress() {
        navigation.goBack();
    }

    function changeText(val) {
        console.log("changeText : ", val);
        const value = val ? Number(val) : 0;

        if (value > 0) {
            const formatted = numberWithCommas(value);
            console.log("formatted : ", formatted);
            setAmount(formatted);
            setAmountValue(value);
            setErrorAmount("");
        } else {
            setAmount("");
            setAmountValue(value);
        }
    }

    function onCloseRiskPopup() {
        setShowRiskPopup(false);
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={GOAL_BASED_INVESTMENT}
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <View style={styles.container}>
                            <View style={styles.blockNew}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={GROWTH_WEATH_GOAL}
                                    textAlign="left"
                                />

                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.sublabel}
                                    text="I can commit an upfront amount of"
                                    textAlign="left"
                                />
                                <View style={styles.amountViewTransfer}>
                                    <TextInput
                                        accessibilityLabel={"Password"}
                                        prefixStyle={[{ color: GREY }]}
                                        style={{ color: amount == 0 ? GREY : BLACK }}
                                        isValid={!errAmount}
                                        isValidate
                                        errorMessage={errAmount}
                                        value={amount}
                                        prefix={CURRENCY_CODE}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={false}
                                    />
                                </View>
                            </View>
                        </View>
                        <NumericalKeyboard
                            value={`${amountValue}`}
                            onChangeText={changeText}
                            maxLength={11}
                            onDone={onDoneButtonPress}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
            <RiskProfilePopup
                visible={showRiskPopup}
                riskLevel={customerRisk}
                onClose={onCloseRiskPopup}
                navigation={navigation}
                navigationParams={{
                    ...route?.params,
                    initialAmt: amount.toString().replace(/,/g, ""),
                    gbiRiskLevel: mapRiskScore(customerRisk),
                    customerRiskLevel: mapRiskScore(customerRisk),
                    clientRiskDate: customerRiskDate,
                    fromScreen: GROWTH_WEALTH_UPFRONT_AMOUNT,
                }}
            />
        </>
    );
};

GrowWealthUpfrontAmount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default GrowWealthUpfrontAmount;

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    sublabel: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        color: BLACK,
    },
    blockNew: {
        flexDirection: "column",
        flex: 1,
        paddingHorizontal: 24,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
};

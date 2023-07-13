import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, MAD_CONFIRMATION } from "@navigation/navigationConstant";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { RED } from "@constants/colors";
import {
    AUTO_DEDUCTION,
    FA_FIN_GOAL_AUTODEDUCT_AMOUNT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const MADInput = ({ navigation, route }) => {
    const recommendedAmt =
        route?.params?.overviewData?.gbiMonthlyInvestmentModel?.recommendedAmount ?? 0;
    const [formattedValue, setFormattedValue] = useState(
        numeral(recommendedAmt).format("0,0.00") ?? ""
    );
    const [rawValue, setRawValue] = useState(recommendedAmt);
    const [keypadValue, setKeypadValue] = useState(recommendedAmt * 100 + "");
    const [error, setError] = useState(false);
    const salesCharge = route?.params?.overviewData?.gbiMonthlyInvestmentModel?.mtdSalesCharge ?? 0;
    const [salesChargeAmount, setSalesChargeAmount] = useState(recommendedAmt * salesCharge);
    const startDate = route?.params?.overviewData?.gbiMonthlyInvestmentModel?.startDate
        ? moment(route?.params?.overviewData?.gbiMonthlyInvestmentModel?.startDate, "YYYY-MM-DD")
        : "";
    const madActiveLabel = route?.params?.overviewData?.gbiMonthlyInvestmentModel?.isActive;

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_AUTODEDUCT_AMOUNT,
        });
    }, []);

    function onPressClose() {
        navigation.goBack();
    }

    function handleKeyboardChange(value) {
        if (!value) {
            setRawValue(0);
            setFormattedValue("");
            setKeypadValue("");
        }

        const num = Number(value);
        if (num > 0) {
            const decimal = num / 100;

            setRawValue(decimal);
            setSalesChargeAmount(decimal * salesCharge);
            setFormattedValue(numeral(decimal).format("0,0.00"));
            setKeypadValue(value);
            return;
        }
    }

    function handleKeyboardDone() {
        if (!validateAmount()) {
            setError(true);
            return;
        }
        setError(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: MAD_CONFIRMATION,
            params: {
                amount: rawValue?.toFixed(2),
                salesChargeAmount: salesChargeAmount?.toFixed(2),
                salesCharge,
                madData: route?.params?.overviewData ?? null,
            },
        });
    }

    function validateAmount() {
        return rawValue >= 200 && rawValue <= 100000;
    }

    return (
        <ScreenContainer>
            <ScreenLayout
                header={
                    <HeaderLayout
                        // headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{AUTO_DEDUCTION}</HeaderLabel>}
                        headerRightElement={<HeaderCloseButton onPress={onPressClose} />}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <View style={styles.container}>
                    <Typo
                        //text="Set up your monthly investment to achieve your goal faster"
                        text={`${
                            madActiveLabel === true ? "Increase" : "Set up"
                        } your monthly investment to achieve your goal faster`}
                        fontSize={16}
                        fontWeight="600"
                        textAlign="left"
                        lineHeight={20}
                    />
                    <Typo
                        text="How much would you like to contribute monthly?"
                        fontSize={14}
                        fontWeight="400"
                        textAlign="left"
                        style={styles.subtitle}
                    />
                    <TextInput
                        prefix="RM"
                        placeholder="0.00"
                        value={formattedValue}
                        editable={false}
                        isValidate={false}
                        errorMessage="Error component "
                        isValid={false}
                    />
                    {error && (
                        <Typo
                            text="Your monthly investment must be between RM 200 and RM 100,000."
                            fontSize={12}
                            color={RED}
                            fontWeight="400"
                            textAlign="left"
                            style={styles.error}
                        />
                    )}
                    <Typo
                        text={`Monthly Sale Charge ${salesCharge * 100}% = RM ${numberWithCommas(
                            salesChargeAmount?.toFixed(2)
                        )}`}
                        textAlign="left"
                        fontSize={12}
                        fontWeight="600"
                        style={styles.salesCharge}
                    />
                    <Typo
                        text={`First deduction is due on ${moment(startDate).format(
                            "DD MMM YYYY"
                        )}`}
                        textAlign="left"
                        fontSize={12}
                        fontWeight="600"
                        style={styles.startDate}
                    />
                </View>
                <NumericalKeyboard
                    value={keypadValue}
                    maxLength={11}
                    onChangeText={handleKeyboardChange}
                    onDone={handleKeyboardDone}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

MADInput.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    error: {
        paddingTop: 10,
    },
    salesCharge: { paddingTop: 15 },
    startDate: { paddingTop: 10 },
    subtitle: { paddingTop: 20 },
});
export default MADInput;

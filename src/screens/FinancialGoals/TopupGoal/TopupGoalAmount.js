import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_GOAL_OVERVIEW,
    TOPUP_PROMO,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    CURRENCY_CODE,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_TOPUP_AMOUNT,
    FA_VIEW_SCREEN,
    TOPUP_GOAL,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

function TopupGoalAmount({ route, navigation }) {
    const initialAmount = route?.params?.amount ?? null;
    const initialAmountString = initialAmount?.toFixed(2).toString();
    const suggestedAmount = route?.params?.suggestedAmount ?? 0;
    const { minAmount, maxAmount } = route?.params;

    const [amountValue, setAmountValue] = useState(initialAmountString);
    const [keypadValue, setKeypadValue] = useState(initialAmount ? initialAmount * 100 : "");
    const [rawAmount, setRawAmount] = useState(initialAmount);
    const [showError, setShowError] = useState();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_AMOUNT,
        });
    }, []);

    function onDoneButtonPress() {
        if (rawAmount < minAmount || rawAmount > maxAmount) {
            setShowError(true);
        } else {
            setShowError(false);
            navigation.navigate(BANKINGV2_MODULE, {
                screen: TOPUP_PROMO,
                params: {
                    ...route?.params,
                    amount: rawAmount,
                    salesChargeAmount: rawAmount * route?.params?.salesChargePrctg,
                    gstCharge:
                        rawAmount * route?.params?.salesChargePrctg * route?.params?.gstChargePrctg,
                },
            });
        }
    }

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
        });
    }

    function changeText(val) {
        if (!val) {
            setRawAmount(0);
            setAmountValue("");
            setKeypadValue("");
        }

        const num = Number(val);
        if (num > 0) {
            const decimal = num / 100;
            setRawAmount(decimal);
            setAmountValue(numeral(decimal).format("0,0.00"));
            setKeypadValue(val);
        } else {
            setRawAmount(0);
            setAmountValue("");
            setKeypadValue("");

            return;
        }
    }

    return (
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
                                text={TOPUP_GOAL}
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
                        {!!suggestedAmount && (
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={`Top up RM${numberWithCommas(
                                    suggestedAmount.toFixed(2) ?? 0
                                )} to catch up with your goal target`}
                                textAlign="left"
                                style={styles.topupText}
                            />
                        )}
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            style={styles.sublabel}
                            text="How much would you like to deposit to your investment goal fund?"
                            textAlign="left"
                        />
                        <View style={styles.amountViewTransfer}>
                            <TextInput
                                placeholder="0.00"
                                prefixStyle={[{ color: GREY }]}
                                style={{ color: amountValue === 0 ? GREY : BLACK }}
                                isValid={!showError}
                                isValidate
                                value={amountValue}
                                prefix={CURRENCY_CODE}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                editable={false}
                                errorMessage={`Your top up amount must be between RM ${numberWithCommas(
                                    minAmount ?? 0
                                )} and RM ${numberWithCommas(maxAmount ?? 0)}.`}
                            />
                        </View>
                    </View>

                    <NumericalKeyboard
                        value={`${keypadValue}`}
                        onChangeText={changeText}
                        maxLength={11}
                        onDone={onDoneButtonPress}
                    />
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

TopupGoalAmount.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default TopupGoalAmount;

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingHorizontal: 24,
    },
    sublabel: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        color: "#000000",
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },

    titleContainerTransferNewSmall: {
        justifyContent: "flex-start",
        marginTop: -15,
    },
    descriptionContainerAmount: {
        marginTop: 15,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    topupText: {
        marginBottom: 24,
    },
    smallDescCls: {
        marginTop: 8,
        opacity: 0.5,
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 12,
        lineHeight: 16,
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "left",
        letterSpacing: 0,
    },
};

import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";

import { BANKINGV2_MODULE, GROWTH_WEALTH_WITHDRAW_AGE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { goalMiscData } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    CURRENCY_CODE,
    GOAL_BASED_INVESTMENT,
    GROWTH_WEATH_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_WEALTH_GOAL,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas as commaFormatted } from "@utils/dataModel/utilityPartial.3";

function GrowWealthAccumulateAmount({ navigation, route }) {
    const [amountValue, setAmountValue] = useState(
        route?.params?.inputTargetAmt ? route?.params?.inputTargetAmt * 100 : 0
    );
    const [amount, setAmount] = useState(
        route?.params?.inputTargetAmt ? numberWithCommas(route?.params?.inputTargetAmt * 100) : null
    );

    const [errAmount, setErrorAmount] = useState("");
    const [amountValidate, setAmountValidate] = useState([]);

    let miscData = route?.params?.miscData;

    const { updateModel } = useModelController();

    useEffect(() => {
        fetchMiscData();
    }, [fetchMiscData]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_WEALTH_GOAL,
        });
    }, []);

    const fetchMiscData = useCallback(() => {
        try {
            if (miscData?.menuItemRangeDTOs) {
                updateModel({
                    financialGoal: {
                        wealthData: miscData?.menuItemRangeDTOs,
                    },
                });
                setAmountValidate(miscData?.menuItemRangeDTOs?.["Gbi Target Amount Input Range"]);
                changeText(
                    miscData?.menuItemRangeDTOs?.["Gbi Target Amount Input Range"][0]
                        ?.defaultValue * 100
                );
            } else {
                getMiscData();
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, [updateModel]);

    async function getMiscData() {
        try {
            const response = await goalMiscData("W", true);
            miscData = response?.data;
            setAmountValidate(response?.data.menuItemRangeDTOs?.["Gbi Target Amount Input Range"]);
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }

    function onDoneButtonPress() {
        const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";
        const minValue = amountValidate?.[0]?.minValue ?? 1000;
        const maxValue = amountValidate?.[0]?.maxValue ?? 999999999;
        if (
            parseFloat(amountText).toFixed(2) >= minValue &&
            parseFloat(amountText).toFixed(2) <= maxValue
        ) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: GROWTH_WEALTH_WITHDRAW_AGE,
                params: {
                    ...route?.params,
                    inputTargetAmt: amountText,
                    goalType: "W",
                    miscData,
                },
            });
        } else {
            setErrorAmount(
                `Please enter a value between RM ${commaFormatted(
                    minValue.toFixed(2)
                )} and RM ${commaFormatted(maxValue.toFixed(2))}`
            );
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
            setAmount(null);
            setAmountValue(value);
        }
    }

    return (
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
                                text="How much money do you want to accumulate at the end of this goal?"
                                textAlign="left"
                            />
                            <View style={styles.amountViewTransfer}>
                                <TextInput
                                    accessibilityLabel="Password"
                                    prefixStyle={[{ color: GREY }]}
                                    style={{ color: amount === 0 ? GREY : BLACK }}
                                    isValid={!errAmount}
                                    isValidate
                                    errorMessage={errAmount}
                                    value={amount}
                                    prefix={CURRENCY_CODE}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={false}
                                    placeholder="0.00"
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
    );
}

GrowWealthAccumulateAmount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default GrowWealthAccumulateAmount;

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

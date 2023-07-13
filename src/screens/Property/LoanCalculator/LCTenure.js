import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import Slider from "react-native-slider";

import { LC_RESULT, BANKINGV2_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { loanCalculator } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, BLUE, WHITE, DARK_GREY } from "@constants/colors";
import {
    CONTINUE,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

const GENERIC_RESP_ERROR =
    "Your request could not be processed at this time. Please try again later.";
const DESCRIPTION = "How long would you like your financing period to be?";
const NOTE_DESC =
    "The maximum financing period is 35 years or up to 70 years of age, whichever comes first.";

function LCTenure({ route, navigation }) {
    const [tenureValue, setTenureValue] = useState(35);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_LoanTenure",
        });
    }, []);

    const init = async () => {
        console.log("[LCTenure] >> [init]");
    };

    const onBackTap = () => {
        console.log("[LCTenure] >> [onBackTap]");

        navigation.goBack();
    };

    function handleSliderChange(value) {
        setTenureValue(value);
    }

    const onContinue = () => {
        console.log("[LCTenure] >> [onContinue]");

        // Call API to fetch Loan Eligibility Amount
        getEligibilityAmount();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_LoanCalculator_LoanTenure",
            [FA_FIELD_INFORMATION]: tenureValue + " years",
        });
    };

    const getEligibilityAmount = () => {
        console.log("[LCTenure] >> [getEligibilityAmount]");

        // Request object
        const params = {
            monthlyGrossIncome: route.params?.monthlyGrossIncome,
            housingLoan: route.params?.housingLoan,
            carLoan: route.params?.carLoan,
            personalLoan: route.params?.personalLoan,
            creditCardRepayments: route.params?.creditCardRepayments,
            overDraft: route.params?.overdraft,
            nonBankCommitments: route.params?.nonBankCommitments,
            tenure: String(tenureValue),
        };

        loanCalculator(params)
            .then((httpResp) => {
                console.log("[LCTenure][loanCalculator] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? {};
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? null;

                if (statusCode === "0000") {
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: LC_RESULT,
                        params: {
                            ...route.params,
                            loanAmount: result?.eligibleLoanAmtRaw ?? "",
                            loanAmountDisp: result?.eligibleLoanAmt ?? "",
                            instalmentAmount: result?.monthlyInstalmentAmtRaw ?? "",
                            instalmentAmountDisp: result?.monthlyInstalmentAmt ?? "",
                            interestRate: result?.interestRateRaw ?? "",
                            interestRateDisp: result?.interestRate ?? "",
                            propertyValue: result?.suggestedPropertyValRaw ?? "",
                            propertyValueDisp: result?.suggestedPropertyVal ?? "",
                        },
                    });
                } else {
                    // Show error message
                    showErrorToast({
                        message: statusDesc || GENERIC_RESP_ERROR,
                    });
                }
            })
            .catch((error) => {
                console.log("[LCTenure][loanCalculator] >> Exception: ", error);

                // Show error msg
                showErrorToast({
                    message: error?.message ?? GENERIC_RESP_ERROR,
                });
            });
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
            >
                <>
                    <ScrollView style={Style.container} showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text="Financing Calculator"
                            textAlign="left"
                        />

                        {/* Description */}
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            style={Style.label}
                            text={DESCRIPTION}
                            textAlign="left"
                        />

                        {/* Slider value */}
                        <Typo
                            fontSize={20}
                            fontWeight="600"
                            lineHeight={28}
                            style={Style.sliderValueCls}
                            text={`${tenureValue} years`}
                        />

                        {/* Slider component */}
                        <Slider
                            value={tenureValue}
                            minimumValue={5}
                            maximumValue={35}
                            animateTransitions
                            animationType="spring"
                            step={1}
                            minimumTrackTintColor={BLUE}
                            maximumTrackTintColor={WHITE}
                            trackStyle={Style.sliderTrackCls}
                            thumbStyle={Style.sliderThumbCls}
                            onValueChange={handleSliderChange}
                        />

                        {/* Min/Max Slider Value Label */}
                        <View style={Style.sliderMinMaxLabelCont}>
                            <Typo fontSize={12} lineHeight={18} text="5 years" />
                            <Typo fontSize={12} lineHeight={18} text="35 years" />
                        </View>
                    </ScrollView>

                    {/* Note */}
                    <View style={Style.noteContaienr}>
                        <Typo
                            fontSize={12}
                            lineHeight={16}
                            textAlign="left"
                            text="Note:"
                            color={DARK_GREY}
                        />
                        <Typo
                            fontSize={12}
                            lineHeight={16}
                            textAlign="left"
                            text={NOTE_DESC}
                            color={DARK_GREY}
                        />
                    </View>

                    <FixedActionContainer>
                        <ActionButton
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={CONTINUE}
                                />
                            }
                            onPress={onContinue}
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

LCTenure.propTypes = {
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

    noteContaienr: {
        marginBottom: 30,
        paddingHorizontal: 36,
    },

    sliderMinMaxLabelCont: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 10,
        marginTop: 5,
    },

    sliderThumbCls: {
        backgroundColor: WHITE,
        borderColor: BLUE,
        borderRadius: 13,
        borderWidth: 8,
        height: 26,
        width: 26,
    },

    sliderTrackCls: {
        borderRadius: 12,
        height: 8,
    },

    sliderValueCls: {
        paddingBottom: 8,
        paddingTop: 20,
    },
});

export default LCTenure;

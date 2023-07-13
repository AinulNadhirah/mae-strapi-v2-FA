import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    EXISTING_INVESTMENT_SAVINGS_ENTRY,
    GOAL_SIMULATION,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import CustomizePlanCard from "@components/FinancialGoal/CustomizePlanCard";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { saveGoalDetails } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    DONE,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

const OtherSourcesCustomizePlan = ({ navigation, route }) => {
    const { bottom } = useSafeAreaInsets();
    const title = (() => {
        if (route?.params?.gapCount > 0) {
            return "Help me get back on track";
        } else {
            if (route?.params?.goalType === "E") {
                return "Help me improve my education fund";
            } else {
                return "Help me improve my grow wealth fund";
            }
        }
    })();

    const totalSaving =
        route?.params?.totalSavingCash > 0 ? Number(route?.params?.totalSavingCash).toFixed(2) : "";
    const monthlySaving =
        route?.params?.monthlySavingCash > 0
            ? Number(route?.params?.monthlySavingCash).toFixed(2)
            : "";
    const totalInvestment =
        route?.params?.totalOthInvestment > 0
            ? Number(route?.params?.totalOthInvestment).toFixed(2)
            : "";
    const monthlyInvestment =
        route?.params?.monthlyOthInvestment > 0
            ? Number(route?.params?.monthlyOthInvestment).toFixed(2)
            : "";

    const existSavingValueDisplay = (() => {
        const formattedTotalSaving = numberWithCommas(totalSaving);
        const formattedMonthlySaving = numberWithCommas(monthlySaving);

        if (formattedTotalSaving && formattedMonthlySaving) {
            return `RM ${formattedTotalSaving} + RM ${formattedMonthlySaving} (every month)`;
        } else if (formattedTotalSaving) {
            return `RM ${formattedTotalSaving}`;
        } else if (formattedMonthlySaving) {
            return `RM ${formattedMonthlySaving} (every month)`;
        } else {
            return null;
        }
    })();

    const existInvestmentValueDisplay = (() => {
        const formattedTotalInvestment = numberWithCommas(totalInvestment);
        const formattedMonthlyInvestment = numberWithCommas(monthlyInvestment);

        if (formattedTotalInvestment && formattedMonthlyInvestment) {
            return `RM ${formattedTotalInvestment} + RM ${formattedMonthlyInvestment} (every month)`;
        } else if (formattedTotalInvestment) {
            return `RM ${formattedTotalInvestment}`;
        } else if (formattedMonthlyInvestment) {
            return `RM ${formattedMonthlyInvestment} (every month)`;
        } else {
            return null;
        }
    })();

    const PlanInfo = [
        // {
        //     title: "Step-up Investment",
        //     image: assets.goalStepUp,
        //     description:
        //         "Increase your savings periodically by a certain amount at a set interval as defined by you.",
        // },
        {
            title: "Include Existing Savings",
            image: assets.existSaving,
            value: existSavingValueDisplay,
            description:
                "Get a more accurate sum for your plan by including the current value & monthly growth of your savings.",
            onPress: onPressExistSaving,
        },
        {
            title: "Include Existing Investments",
            image: assets.existInvestment,
            value: existInvestmentValueDisplay,
            description:
                "Get a more accurate sum for your plan by including the current value & monthly growth of your investments.",
            onPress: onPressExistInvestment,
        },
    ];

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_" + route?.params?.goalType + "_CustomisePlan",
        });
    }, [route?.params?.goalType]);

    function onPressExistSaving() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals_" + route?.params?.goalType + "_CustomisePlan",
            [FA_ACTION_NAME]: "Savings",
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: EXISTING_INVESTMENT_SAVINGS_ENTRY,
            params: {
                ...route?.params,
                screenType: "existSaving",
                totalSavingCash: totalSaving,
                monthlySavingCash: monthlySaving,
                savingReturnRate: route?.params?.savingReturnRate,
            },
        });
    }

    function onPressExistInvestment() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals_" + route?.params?.goalType + "_CustomisePlan",
            [FA_ACTION_NAME]: "Investment",
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: EXISTING_INVESTMENT_SAVINGS_ENTRY,
            params: {
                ...route?.params,
                screenType: "existInvestment",
                totalOthInvestment: totalInvestment,
                monthlyOthInvestment: monthlyInvestment,
                investReturnRate: route?.params?.investReturnRate,
                goalId: route?.params?.goalId,
            },
        });
    }
    function onPressBack() {
        navigation.goBack();
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen:
                route?.params?.from === FINANCIAL_GOAL_OVERVIEW
                    ? FINANCIAL_GOAL_OVERVIEW
                    : GOAL_SIMULATION,
        });
    }

    function onPressDone() {
        if (route?.params?.from === GOAL_SIMULATION) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: GOAL_SIMULATION,
                params: {
                    ...route?.params,
                    totalSavingCash: parseFloat(totalSaving || 0),
                    monthlySavingCash: parseFloat(monthlySaving || 0),
                    totalOthInvestment: parseFloat(totalInvestment || 0),
                    monthlyOthInvestment: parseFloat(monthlyInvestment || 0),
                },
            });
        } else {
            saveEPFDetails();
        }
    }

    async function saveEPFDetails() {
        // call saving API and return to Goal overview page
        const savingRequest = {
            goalId: route?.params?.goalId,
            totalSavingCash: parseFloat(totalSaving || 0),
            monthlySavingCash: parseFloat(monthlySaving || 0),
            totalOthInvestment: parseFloat(totalInvestment || 0),
            monthlyOthInvestment: parseFloat(monthlyInvestment || 0),
        };
        try {
            const response = await saveGoalDetails(savingRequest, true);
            if (response?.data) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_GOAL_OVERVIEW,
                    params: {
                        ...route?.params,
                    },
                });
                showSuccessToast({ message: "Your changes have been successfully saved." });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Customise My Plan"
                            />
                        }
                        headerLeftElement={
                            <View style={styles.headerCloseButtonContainer}>
                                <HeaderBackButton onPress={onPressBack} />
                            </View>
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseButtonPress} />}
                    />
                }
                paddingHorizontal={0}
                paddingBottom={bottom}
            >
                <View style={styles.container}>
                    <Typo text={title} fontWeight="400" fontSize={14} textAlign="left" />
                    {PlanInfo.map((item, index) => {
                        return (
                            <CustomizePlanCard
                                key={index}
                                title={item?.title}
                                image={item?.image}
                                value={item?.value}
                                description={item?.description}
                                onPress={item?.onPress}
                            />
                        );
                    })}
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressDone}
                        componentCenter={<Typo text={DONE} fontWeight="600" fontSize={14} />}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
});

OtherSourcesCustomizePlan.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default OtherSourcesCustomizePlan;

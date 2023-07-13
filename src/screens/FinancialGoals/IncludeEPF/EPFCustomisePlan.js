import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    EPF_SAVING_ENTRY,
    GOAL_SIMULATION,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import CustomizePlanCard from "@components/FinancialGoal/CustomizePlanCard";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { saveGoalDetails } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    INCLUDE_EPF_SAVING,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL,
    FA_FIN_GOAL_CUSTOMIZE,
    FA_FIN_RETIREMENT,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

export default function EPFCustomisePlan({ route, navigation }) {
    const { bottom } = useSafeAreaInsets();
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_RETIREMENT + FA_FIN_GOAL_CUSTOMIZE,
        });
    }, []);

    const screenFrom =
        route?.params?.from === GOAL_SIMULATION ? GOAL_SIMULATION : FINANCIAL_GOAL_OVERVIEW;

    const pageSubtitle =
        route?.params?.shortFallAmt > 0
            ? "Help me get back on track"
            : "Help me improve my retirement plan";

    const epfAccountBal = route?.params?.epfAccountBal ?? null;
    const epfMonthlyContribution = route?.params?.epfMonthlyContribution ?? null;

    const epfValueDisplay = (() => {
        if (epfAccountBal && epfMonthlyContribution) {
            return `RM ${numberWithCommas(epfAccountBal?.toFixed(2))} + RM ${numberWithCommas(
                epfMonthlyContribution?.toFixed(2)
            )} (every month)`;
        } else if (epfAccountBal) {
            return `RM ${numberWithCommas(epfAccountBal?.toFixed(2))}`;
        } else if (epfMonthlyContribution) {
            return `RM ${numberWithCommas(epfMonthlyContribution?.toFixed(2))} (every month)`;
        }
    })();

    function onPressBack() {
        navigation.goBack();
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: screenFrom,
        });
    }

    function onPressDone() {
        if (screenFrom === GOAL_SIMULATION) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: GOAL_SIMULATION,
                params: {
                    ...route?.params,
                    epfAccountBal: parseFloat(route?.params?.epfAccountBal || 0),
                    epfMonthlyContribution: parseFloat(route?.params?.epfMonthlyContribution || 0),
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
            epfAccountBal: parseFloat(route?.params?.epfAccountBal || 0),
            epfMonthlyContribution: parseFloat(route?.params?.epfMonthlyContribution || 0),
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

    function onPressEPFCard() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_RETIREMENT + FA_FIN_GOAL_CUSTOMIZE,
            [FA_ACTION_NAME]: "EPF Savings",
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: EPF_SAVING_ENTRY,
            params: {
                ...route?.params,
            },
        });
    }

    return (
        <React.Fragment>
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
                    <View style={styles.viewFlexStyles}>
                        <Typo
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={20}
                            textAlign="left"
                            text={pageSubtitle}
                        />
                        <CustomizePlanCard
                            title={INCLUDE_EPF_SAVING}
                            image={assets.kwsp}
                            description="Include your EPF savings into your goal to get a  comprehensive overall retirement plan."
                            value={epfValueDisplay}
                            onPress={onPressEPFCard}
                        />
                    </View>

                    <FixedActionContainer>
                        <ActionButton
                            onPress={onPressDone}
                            componentCenter={
                                <Typo fontSize={14} fontWeight="600" lineHeight={18} text="Done" />
                            }
                            fullWidth
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

EPFCustomisePlan.propTypes = {
    route: PropTypes.object,
    gapCount: PropTypes.number,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    viewFlexStyles: { flex: 1, paddingHorizontal: 24 },
});

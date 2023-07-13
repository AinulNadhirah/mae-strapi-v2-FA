import { useFocusEffect } from "@react-navigation/native";
import moment from "moment/moment";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Image, TouchableOpacity, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_EDUCATION_FOR,
    FINANCIAL_GOALS_DASHBOARD_SCREEN,
    FINANCIAL_GOAL_OVERVIEW,
    FINANCIAL_RET_AGE,
    GOAL_SIMULATION,
    GROWTH_WEALTH_ACCUMULATE_AMOUNT,
} from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getGoalCount, goalMiscData } from "@services";
import { logEvent } from "@services/analytics";
import { getGoalOverview } from "@services/apiServiceFinancialGoals";

import { WHITE, BADGE_YELLOW } from "@constants/colors";
import {
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    GOAL_BASED_INVESTMENT,
    GOAL_SELECT_DESC,
    GOAL_SELECT_EDUCATION_SUBTITLE,
    GOAL_SELECT_EDUCATION_TITLE,
    GOAL_SELECT_GROW_WEALTH_SUBTITLE,
    GOAL_SELECT_GROW_WEALTH_TITLE,
    GOAL_SELECT_RETIREMENT_SUBTITLE,
    GOAL_SELECT_RETIREMENT_TITLE,
} from "@constants/strings";

import assets from "@assets";

const GOAL_SELECTION_ITEM = [
    {
        icon: assets.goalRetirement,
        title: GOAL_SELECT_RETIREMENT_TITLE,
        subtitle: GOAL_SELECT_RETIREMENT_SUBTITLE,
        screenTo: FINANCIAL_RET_AGE,
        type: "R",
    },
    {
        icon: assets.goalEducation,
        title: GOAL_SELECT_EDUCATION_TITLE,
        subtitle: GOAL_SELECT_EDUCATION_SUBTITLE,
        screenTo: FINANCIAL_EDUCATION_FOR,
        type: "E",
    },
    {
        icon: assets.goalGrowWealth,
        title: GOAL_SELECT_GROW_WEALTH_TITLE,
        subtitle: GOAL_SELECT_GROW_WEALTH_SUBTITLE,
        screenTo: GROWTH_WEALTH_ACCUMULATE_AMOUNT,
        type: "W",
    },
];

const GoalSelection = ({ navigation }) => {
    const GOAL_ERROR_POPUP = {
        R: {
            title: "Retirement Goal",
            subtitle:
                "You can only set 1 retirement plan.\n\nWould you like to review your existing retirement plan?",
            proceedButton: onPressRetirementProceed,
        },
        E: {
            title: "Education Goal",
            subtitle:
                "You can only set up to 3 education goals for you and/or your child.\n\nWould you like to review and edit your existing education plans?",
            proceedButton: onPressNavigateToDashboard,
        },
        W: {
            title: "Grow Wealth goal",
            subtitle:
                "You can only set 3 grow wealth plans.\n\nWould you like to review your existing grow wealth plan?",
            proceedButton: onPressNavigateToDashboard,
        },
    };

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorPopupObject, setErrorPopupObject] = useState({});
    const [goalSummary, setGoalSummary] = useState(null);
    const [retirementId, setRetirementId] = useState(null);
    const [componentEnabled, setComponentEnabled] = useState(false);
    const [recommended, setRecommended] = useState(null);

    const [goalValidations, setGoalValidations] = useState(null);

    const { updateModel } = useModelController();

    useFocusEffect(
        //clear current goal id for saving goal when back to goal selection
        useCallback(() => {
            updateModel({
                financialGoal: {
                    currentGoalId: null,
                },
            });
        }, [updateModel])
    );
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_Category",
        });
    }, []);

    useEffect(() => {
        callGoalAmount();
    }, [callGoalAmount]);

    const callGoalAmount = useCallback(async () => {
        try {
            const response = await getGoalCount(true);
            if (response?.data) {
                setGoalSummary(response?.data?.goalSummary);
                setRetirementId(response?.data?.goalDetails?.[0]?.goalId);
                setComponentEnabled(true);
                setRecommended(response?.data?.recommendedGoalCode);
                setGoalValidations(response?.data?.goalValidations);
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }, []);

    async function onPressRetirementProceed() {
        setShowErrorPopup(false);

        try {
            const response = await getGoalOverview(retirementId, true);
            if (response?.data) {
                if (response?.data?.gamCd === "SIM" || response?.data?.gamCd === "AFF") {
                    const params = {
                        goalType: response?.data.goalType,
                        inputTargetAmt: response?.data.inputTargetAmt,
                        retireAge: response?.data?.retireAge,
                        monthlyExpenses: response?.data?.monthlyExpenses,
                        lastFor: response?.data?.lastFor,
                        initialAmt: response?.data?.initialAmt,
                        epfAccountBal: response?.data?.epfAccountBal ?? 0,
                        epfMonthlyContribution: response?.data?.epfMonthlyContribution ?? 0,
                        monthlyAmt:
                            response?.data?.gamCd !== "AFF" ? response?.data.monthlyAmt ?? 0 : 0,
                        stepUpAmt: response?.data?.stepUpAmt ?? 0,
                        gbiRiskLevel: response?.data?.gbiRiskLevel,
                        contactNo: response?.data?.contactNo,
                    };

                    navigation.navigate(BANKINGV2_MODULE, {
                        screen:
                            response?.data?.gamCd === "AFF" ? FINANCIAL_RET_AGE : GOAL_SIMULATION,
                        params,
                        customerRiskLevel: response?.data?.clientRiskLevel,
                        // date format here a bit tricky, need to pass as YYYYMMDD, in simulation saving, it will formatted back to YYYY-MM-DD
                        clientRiskDate: response?.data?.clientRiskDate
                            ? moment(response?.data?.clientRiskDate, "YYYY-MM-DD").format(
                                  "YYYYMMDD"
                              )
                            : null,
                        goalId: retirementId,
                    });
                } else {
                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: FINANCIAL_GOAL_OVERVIEW,
                        params: {
                            goalId: retirementId,
                        },
                    });
                }
            } else {
                showErrorToast({ message: "Something went wrong" });
            }
        } catch (error) {
            showErrorToast({ message: "Something went wrong" });
        }
    }

    function onPressNavigateToDashboard() {
        setShowErrorPopup(false);
        navigation.navigate("Dashboard", {
            screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
        });
    }

    function onPressBack() {
        navigation.goBack();
    }

    async function navigateTo(screenTo) {
        const goalType = (() => {
            switch (screenTo) {
                case FINANCIAL_RET_AGE:
                    return "R";
                case GROWTH_WEALTH_ACCUMULATE_AMOUNT:
                    return "W";
                case FINANCIAL_EDUCATION_FOR:
                    return "E";
                default:
                    return null;
            }
        })();

        function checkForGoalCountWithType(type) {
            if (type === "E") {
                let countTrue = 0;
                goalValidations.forEach((item) => {
                    if (item.goalType === "Echild" || item.goalType === "Emyself") {
                        if (item.maxCountHit) {
                            countTrue++;
                        }
                    }
                });
                return {
                    maxCountHit: countTrue === 2 ? true : false,
                };
            } else {
                return goalValidations.find((item) => {
                    return item?.goalType === type;
                });
            }
        }

        try {
            const response = await goalMiscData(goalType, true);

            if (checkForGoalCountWithType(goalType)?.maxCountHit) {
                setErrorPopupObject(GOAL_ERROR_POPUP[goalType]);
                setShowErrorPopup(true);
            } else {
                let params = null;
                if (goalType === "R" || goalType === "W") {
                    params = {
                        miscData: response?.data,
                    };
                } else {
                    params = goalType === "E" && {
                        Emyself: goalSummary?.Emyself,
                        Echild: goalSummary?.Echild,
                    };
                }

                navigation.navigate(BANKINGV2_MODULE, {
                    screen: screenTo,
                    params,
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }

        // GA logging
        const fieldInfo = (() => {
            switch (goalType) {
                case "R":
                    return "Retirement";
                case "E":
                    return "Education";
                case "W":
                    return "Grow Wealth";
            }
        })();
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "FinancialGoals_Category",
            [FA_FIELD_INFORMATION]: fieldInfo,
        });
    }

    function renderSelectionItem({ item }) {
        return (
            <GoalSelectionItem
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => navigateTo(item.screenTo)}
                enabled={componentEnabled}
                showRecommended={item?.type === recommended}
            />
        );
    }

    renderSelectionItem.propTypes = {
        item: PropTypes.object,
    };

    function keyExtractor(item, index) {
        return `${item?.title}-${index}`;
    }

    function onClosePopup() {
        setShowErrorPopup(false);
    }

    return (
        <>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
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
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <Typo
                        text={GOAL_SELECT_DESC}
                        fontSize={14}
                        fontWeight="400"
                        textAlign="left"
                        style={styles.desc}
                    />
                    <FlatList
                        data={GOAL_SELECTION_ITEM}
                        renderItem={renderSelectionItem}
                        keyExtractor={keyExtractor}
                    />
                </ScreenLayout>
            </ScreenContainer>
            <Popup
                visible={showErrorPopup}
                onClose={onClosePopup}
                title={errorPopupObject?.title}
                description={errorPopupObject?.subtitle}
                primaryAction={{
                    text: "Proceed",
                    onPress: errorPopupObject?.proceedButton,
                }}
                secondaryAction={{
                    text: "Later",
                    onPress: onClosePopup,
                }}
            />
        </>
    );
};

GoalSelection.propTypes = {
    navigation: PropTypes.object,
};

const GoalSelectionItem = ({ onPress, icon, title, subtitle, showRecommended, enabled }) => {
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress} disabled={!enabled}>
            <Image source={icon} style={styles.itemImage} />
            <View style={styles.itemTextContainer}>
                {showRecommended && (
                    <View style={styles.recommendedBadge}>
                        <Typo text="Recommended" fontSize={10} fontWeight="600" textAlign="left" />
                    </View>
                )}
                <Typo fontWeight="600" fontSize={16} textAlign="left" lineHeight={25}>
                    {title}
                </Typo>
                <Typo
                    fontWeight="400"
                    fontSize={14}
                    textAlign="left"
                    lineHeight={25}
                    style={styles.subtitle}
                >
                    {subtitle}
                </Typo>
            </View>
        </TouchableOpacity>
    );
};

GoalSelectionItem.propTypes = {
    onPress: PropTypes.func,
    icon: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showRecommended: PropTypes.bool,
    enabled: PropTypes.bool,
};

const styles = StyleSheet.create({
    desc: {
        paddingHorizontal: 24,
    },
    itemContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 16,
        marginHorizontal: 24,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: WHITE,
        borderRadius: 8,
        shadowOffset: {
            shadowColor: "rgba(0, 0, 0, 0.8)",
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
    },
    itemImage: {
        alignSelf: "center",
    },
    itemTextContainer: {
        paddingLeft: 14,
    },
    recommendedBadge: {
        alignSelf: "flex-start",
        backgroundColor: BADGE_YELLOW,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    subtitle: {
        marginRight: 20,
    },
});

export default GoalSelection;

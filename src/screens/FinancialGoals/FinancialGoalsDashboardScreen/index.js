import AsyncStorage from "@react-native-community/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Dimensions, Image } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    BANKINGV2_MODULE,
    FINANCIAL_GOAL_OVERVIEW,
    FINANCIAL_GOAL_SELECTION,
    FINANCIAL_GOAL_WELCOME,
    GOAL_SIMULATION,
    FINANCIAL_RET_AGE,
    GROWTH_WEALTH_ACCUMULATE_AMOUNT,
    FINANCIAL_EDUCATION_FUND_YEAR,
    FINANCIAL_EDUCATION_CHILD_INFO,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import GoalCard from "@components/FinancialGoal/GoalCard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { getFinancialGoalsList, invokeL2 } from "@services";
import { logEvent } from "@services/analytics";
import { getGoalOverview } from "@services/apiServiceFinancialGoals";

import { BLACK, MEDIUM_GREY, SHADOW_LIGHT, WHITE } from "@constants/colors";
import { GOAL_NOTIFICATION_SHOWN } from "@constants/localStorage";
import {
    COMMON_ERROR_MSG,
    CREATE_GOAL_LABEL,
    FA_ACTION_NAME,
    FA_FIN_GOAL,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    NO_GOALS_LABEL,
    NO_GOALS_SUBLABEL,
} from "@constants/strings";

import assets from "@assets";

const SCREEN_WIDTH = Dimensions.get("window").width;

function FinancialGoalsDashboardScreen({ navigation }) {
    const [goalList, setGoalList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { updateModel } = useModelController();

    useFocusEffect(
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
            [FA_SCREEN_NAME]: "FinancialGoals",
        });
    }, []);

    useEffect(() => {
        invokePin();
    }, [invokePin]);

    const invokePin = useCallback(async () => {
        try {
            const response = await invokeL2(false);
            if (!response) {
                throw new Error();
            }
            if (response) {
                await showWelcome();
                await fetchGoalList();
            }
        } catch (error) {
            navigation.goBack();
            return;
        }
    }, [fetchGoalList, navigation, showWelcome]);

    const showWelcome = useCallback(async () => {
        const isWelcomeShown = JSON.parse(await AsyncStorage.getItem(GOAL_NOTIFICATION_SHOWN));

        if (!isWelcomeShown) {
            navigation.push(BANKINGV2_MODULE, {
                screen: FINANCIAL_GOAL_WELCOME,
            });
        }
    }, [navigation]);

    const fetchGoalList = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getFinancialGoalsList(false);
            if (response?.data) {
                setIsLoading(false);
                setGoalList(response?.data?.goalDetailsList);
                updateModel({
                    financialGoal: {
                        utAccount: response?.data?.utaccountNumber,
                        isUTWithSingle: response?.data?.isUTWithSingle,
                        isUTWithOnlyJoint: response?.data?.isUTWithOnlyJoint,
                    },
                });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, [updateModel]);

    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function onPressCreateGoal(btnText) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals",
            [FA_ACTION_NAME]: btnText,
        });

        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_SELECTION,
        });
    }

    function renderGoalCard({ item }) {
        return (
            <GoalCard
                title={item?.gbiName}
                badgeText={item?.goalDescription}
                targetAmount={item?.gbiTargetAmt}
                goalId={item?.goalId}
                onPress={onPressCard}
                executedAmount={item?.totalPortfolioValue}
                gamCd={item?.gamCd}
            />
        );
    }

    async function onPressCard(id, status, gamCd) {
        if (status === "Pending" || gamCd === "AFF") {
            try {
                const response = await getGoalOverview(id, true);
                if (response?.data) {
                    let yearSelectionIdx = 0;
                    if (response?.data?.fundsBy) {
                        yearSelectionIdx = (() => {
                            let startingYear = new Date().getFullYear();
                            //let years = [];
                            const yearCount = 30;
                            for (let i = 0; i <= yearCount; i++) {
                                startingYear += 1;
                                if (response?.data?.fundsBy === startingYear) {
                                    return i;
                                }
                            }
                            return 0;
                        })();
                    }
                    const simulateParams = (() => {
                        switch (response?.data?.goalType) {
                            case "R":
                                return {
                                    goalType: response?.data.goalType,
                                    inputTargetAmt: response?.data.inputTargetAmt,
                                    retireAge: response?.data?.retireAge,
                                    monthlyExpenses: response?.data?.monthlyExpenses,
                                    lastFor: response?.data?.lastFor,
                                    initialAmt: response?.data?.initialAmt,
                                    epfAccountBal: response?.data?.epfAccountBal ?? 0,
                                    epfMonthlyContribution:
                                        response?.data?.epfMonthlyContribution ?? 0,
                                    monthlyAmt:
                                        gamCd !== "AFF" ? response?.data.monthlyAmt ?? 0 : 0,
                                    stepUpAmt: response?.data?.stepUpAmt ?? 0,
                                    gbiRiskLevel: response?.data?.gbiRiskLevel,
                                    contactNo: response?.data?.contactNo,
                                    screenTo: FINANCIAL_RET_AGE,
                                };
                            case "E":
                                return {
                                    goalType: response?.data?.goalType,
                                    fundsFor: response?.data?.fundsFor,
                                    childName: response?.data?.childName ?? "",
                                    childAge: response?.data?.childAge ?? "",
                                    fundsBy: response?.data?.fundsBy ?? "0",
                                    educationLvl: response?.data?.educationLvl,
                                    studyArea: response?.data?.studyArea,
                                    educationCtr: response?.data?.educationCtr,
                                    inputTargetAmt: response?.data?.inputTargetAmt,
                                    initialAmt: response?.data?.initialAmt,
                                    totalSavingCash: response?.data?.totalSavingCash ?? 0,
                                    monthlySavingCash: response?.data?.monthlySavingCash ?? 0,
                                    totalOthInvestment: response?.data?.totalOthInvestment ?? 0,
                                    monthlyOthInvestment: response?.data?.monthlyOthInvestment ?? 0,
                                    monthlyAmt:
                                        gamCd !== "AFF" ? response?.data.monthlyAmt ?? 0 : 0,
                                    stepUpAmt: response?.data?.stepUpAmt ?? 0,
                                    gbiRiskLevel: response?.data?.gbiRiskLevel,
                                    contactNo: response?.data?.contactNo,
                                    screenTo:
                                        response?.data?.fundsFor === "myself"
                                            ? FINANCIAL_EDUCATION_FUND_YEAR
                                            : FINANCIAL_EDUCATION_CHILD_INFO,
                                    fundsByIdx: yearSelectionIdx,
                                };
                            case "W":
                                return {
                                    goalType: response?.data?.goalType,
                                    inputTargetAmt: response?.data?.inputTargetAmt,
                                    fundsByAge: response?.data?.fundsByAge,
                                    initialAmt: response?.data?.initialAmt,
                                    totalSavingCash: response?.data?.totalSavingCash ?? 0,
                                    monthlySavingCash: response?.data?.monthlySavingCash ?? 0,
                                    totalOthInvestment: response?.data?.totalOthInvestment ?? 0,
                                    monthlyOthInvestment: response?.data?.monthlyOthInvestment ?? 0,
                                    monthlyAmt:
                                        gamCd !== "AFF" ? response?.data.monthlyAmt ?? 0 : 0,
                                    stepUpAmt: response?.data?.stepUpAmt ?? 0,
                                    gbiRiskLevel: response?.data?.gbiRiskLevel,
                                    contactNo: response?.data?.contactNo,
                                    screenTo: GROWTH_WEALTH_ACCUMULATE_AMOUNT,
                                };
                            default:
                                return;
                        }
                    })();

                    navigation.navigate(BANKINGV2_MODULE, {
                        screen: gamCd === "AFF" ? simulateParams.screenTo : GOAL_SIMULATION,
                        params: {
                            ...simulateParams,
                            customerRiskLevel: response?.data?.clientRiskLevel,
                            // date format here a bit tricky, need to pass as YYYYMMDD, in simulation saving, it will formatted back to YYYY-MM-DD
                            clientRiskDate: response?.data?.clientRiskDate
                                ? moment(response?.data?.clientRiskDate, "YYYY-MM-DD").format(
                                      "YYYYMMDD"
                                  )
                                : null,
                            goalId: id,
                        },
                    });
                } else {
                    showErrorToast({ message: COMMON_ERROR_MSG });
                }
            } catch (error) {
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            }
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FINANCIAL_GOAL_OVERVIEW,
                params: {
                    goalId: id,
                },
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL,
            [FA_ACTION_NAME]: "View Goal",
        });
    }

    function keyExtractor(item, index) {
        return `${item?.goalId}-${index}`;
    }

    function renderContent() {
        if (isLoading) {
            const array = [{}, {}, {}];
            return array?.map((_, index) => {
                return <LoadingGoalCard key={index} />;
            });
        } else if (goalList.length <= 0) {
            return (
                <EmptyStateScreen
                    imageSrc={assets.goalEmptyState}
                    headerText={NO_GOALS_LABEL}
                    subText={NO_GOALS_SUBLABEL}
                    showNote={false}
                    showBtn={true}
                    btnText={CREATE_GOAL_LABEL}
                    // eslint-disable-next-line react/jsx-no-bind
                    onBtnPress={() => onPressCreateGoal("Create a Goal")}
                />
            );
        } else {
            return (
                <>
                    <FlatList
                        data={goalList}
                        renderItem={renderGoalCard}
                        refreshing={isLoading}
                        onRefresh={fetchGoalList}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.goalCardContainerStyle}
                    />
                    <View style={styles.createGoalViewBtnStyle}>
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            backgroundColor={WHITE}
                            // eslint-disable-next-line react/jsx-no-bind
                            onPress={() => onPressCreateGoal("Create Goal")}
                            componentCenter={
                                <View style={styles.createBtnLogoView}>
                                    <Image source={assets.ic_Plus} style={styles.actionBtnImage} />
                                    <Typo
                                        color={BLACK}
                                        text="Create Goal"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                </View>
                            }
                        />
                    </View>
                </>
            );
        }
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
                                    text="Financial Goals"
                                />
                            }
                            headerLeftElement={
                                <View style={styles.headerCloseButtonContainer}>
                                    <HeaderBackButton onPress={_onHeaderBackButtonPressed} />
                                </View>
                            }
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    {renderContent()}
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

export default FinancialGoalsDashboardScreen;
FinancialGoalsDashboardScreen.propTypes = {
    navigation: PropTypes.object,
    item: PropTypes.object,
};

const LoadingGoalCard = () => {
    return (
        <View style={styles.goalCardContainer}>
            <ShimmerPlaceHolder style={styles.shimmer} />
            <SpaceFiller height={41} />
            <ShimmerPlaceHolder style={styles.shimmerText} />
            <ShimmerPlaceHolder style={styles.shimmerText} />
            <SpaceFiller height={11} />
            <ShimmerPlaceHolder style={styles.shimmer} />
        </View>
    );
};

const styles = StyleSheet.create({
    actionBtnImage: {
        height: 20,
        width: 20,
    },
    createBtnLogoView: { flexDirection: "row" },
    createGoalViewBtnStyle: {
        alignItems: "center",
        bottom: 20,
        justifyContent: "center",
        left: SCREEN_WIDTH / 4,
        position: "absolute",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        width: "50%",
    },
    goalCardContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        marginHorizontal: 24,
        marginTop: 20,
        padding: 24,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
    },
    goalCardContainerStyle: {
        paddingBottom: 70,
    },

    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    shimmer: {
        borderRadius: 8,
        height: 20,
        width: "100%",
    },
    shimmerText: {
        borderRadius: 8,
        height: 15,
        width: "50%",
    },
});

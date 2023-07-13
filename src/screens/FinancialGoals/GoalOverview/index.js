import { BlurView } from "@react-native-community/blur";
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, Fragment, useRef } from "react";
import { Image, View, TouchableOpacity, Modal } from "react-native";
import Swiper from "react-native-swiper";

import {
    BANKINGV2_MODULE,
    EPF_SAVING_ENTRY,
    FINANCIAL_REMOVE_GOAL,
    FINANCIAL_TOPUP_LANDING,
    FINANCIAL_WITHDRAW_AMT,
    OTHER_SOURCES_CUSTOMIZE_PLAN,
    FINANCIAL_GOAL_OVERVIEW,
    EXISTING_INVESTMENT_SAVINGS_ENTRY,
    MAD_INPUT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import SwitchSelector from "@components/Buttons/SwitchButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { getGoalOverview, withdrawFundMisc, deactivateFinancialsMAD } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, INACTIVE_COLOR, ACTIVE_COLOR } from "@constants/colors";
import {
    FINANCIAL_GOAL,
    TOP_UP_TIPS,
    MAD_TIPS,
    EPF_TIPS,
    EXISTING_SAVINGS_TIPS,
    EXISTING_INVESTMENT_TIPS,
    PROCEED,
    CONFIRM,
    NO,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_AUTODEDUCT_DEACTIVE,
    PENDING_EXECUTION,
    DET_SUB_GAMCD,
    DET_WITHDRAW_GAMCD,
    DET_DELETE_GAMCD,
    FA_TAB_NAME,
    FA_OPEN_MENU,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_SELECT_MENU,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import assets from "@assets";

import GoalMatrixWarningPopUp from "./GoalMatrixWarningPopUp";
import MADPopup from "./MADPopup";
import Overview from "./Overview";
import Performance from "./Performance";

const TABS = Object.freeze({
    OVERVIEW: "OVERVIEW",
    PERFORMANCE: "PERFORMANCE",
});

const GoalOverview = ({ navigation, route }) => {
    const goalId = route?.params?.goalId;
    const switchOptions = [
        { label: TABS.OVERVIEW, activeColor: WHITE, value: TABS.OVERVIEW },
        { label: TABS.PERFORMANCE, activeColor: WHITE, value: TABS.PERFORMANCE },
    ];

    const menuArrayRetire = [
        {
            menuLabel: "Include EPF Savings",
            menuParam: "includeEPFSavings",
        },
        {
            menuLabel: "Tips to Improve Investment",
            menuParam: "tipsToImproveInvestment",
        },
        {
            menuLabel: "Withdraw Funds",
            menuParam: "withdrawFunds",
        },

        {
            menuLabel: "Remove Goal",
            menuParam: "removeGoal",
        },
    ];

    const menuArrayOther = [
        {
            menuLabel: "Other Sources",
            menuParam: "includeOtherSources",
        },
        {
            menuLabel: "Tips to Improve Investment",
            menuParam: "tipsToImproveInvestment",
        },
        {
            menuLabel: "Withdraw Funds",
            menuParam: "withdrawFunds",
        },

        {
            menuLabel: "Remove Goal",
            menuParam: "removeGoal",
        },
    ];

    const [tipsCarousel, setTipsCarousel] = useState([]);

    const removeGoalDescription =
        "You may take longer to reach your ideal financial state when you remove this goal. \n\nWe'll return all your investments plus returns to you when you delete this goal.";

    const withdrawFundDesc =
        "It may take you longer to reach your goals when you withdraw from your Goal. \n\nAre you sure you'd ike to withdraw from your Goal?";

    const goalMatrixPopupDelText =
        "Oops, we are processing your transaction. Please come back after your transaction is completed to delete your goal";

    const [currentTab, setCurrentTab] = useState(TABS.OVERVIEW);
    const [showMenu, setShowMenu] = useState(false);
    const [showTipsImproveInvestment, setShowTipsImproveInvestment] = useState(false);
    const [showRemoveGoalPopup, setShowRemoveGoalPopup] = useState(false);
    const [showWidhdrawFundPopup, setShowWithdrawFundPopup] = useState(false);
    const [goalList, setGoalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [goalType, setGoalType] = useState(null);
    const [showMADPopup, setShowMADPopup] = useState(false);

    const [pendingExecution, setPendingExecution] = useState(null);
    const overviewRef = useRef();

    const [goalMatrixGamCd, setGoalMatrixGamCd] = useState(null);
    const [isGoalDeletable, setIsGoalDeletable] = useState(false);

    const [goalMatrixText, setGoalMatrixText] = useState("");
    const [goalMatrixPopupTitle, setGoalMatrixPopupTitle] = useState("");
    const [showGoalMatrixPrimaryButton, setShowGoalMatrixPrimaryButton] = useState(false);
    const [goalMatrixPopUp, setGoalMatrixPopUp] = useState(false);

    const [selectedTabIndex, setSelectedTabIndex] = useState(
        route?.params?.currentTab === TABS.PERFORMANCE ? 1 : 0
    );

    const totalSavings = useRef();
    const savingMonthly = useRef();
    const totalInvest = useRef();
    const investMonthly = useRef();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_TAB_NAME]: "Overview",
        });
    }, []);

    useEffect(() => {
        if (route?.params?.currentTab === TABS.PERFORMANCE) {
            setCurrentTab(TABS.PERFORMANCE);
            setSelectedTabIndex(() => 1);
        } else {
            setCurrentTab(TABS.OVERVIEW);
            setSelectedTabIndex(() => 0);
        }
    }, [route]);

    useFocusEffect(
        useCallback(() => {
            fetchGoalList();
            fetchGoalSummary();
        }, [fetchGoalList, fetchGoalSummary])
    );

    const fetchGoalList = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getGoalOverview(goalId, false);
            if (response?.data) {
                setGoalType(response?.data?.goalType);
                setGoalList(response?.data);
                setPendingExecution(response?.data?.goalProgressDesc);
                setGoalMatrixGamCd(response?.data?.gamCd);

                totalSavings.current = response?.data?.totalSavingCash;
                savingMonthly.current = response?.data?.monthlySavingCash;
                totalInvest.current = response?.data?.totalOthInvestment;
                investMonthly.current = response?.data?.monthlyOthInvestment;
                const newCarousel = [
                    {
                        title: "Top Up Goal",
                        image: assets.goalTopUp,
                        gaScreenName: "FinancialGoals_TopUpGoal",
                        subtitle: TOP_UP_TIPS,
                        buttonTitle: "Top Up Goal",
                        onPress: onPressTopupGoal,
                    },
                ];

                if (!response?.data?.gbiMonthlyInvestmentModel?.isActive) {
                    const newCarouselAutoDeduct = {
                        title: "Set Up Monthly Auto Deduction",
                        image: assets.autoDection,
                        gaScreenName: "FinancialGoals_MonthlyAutoDeduction",
                        subtitle: MAD_TIPS,
                        buttonTitle: "Set Up Now",
                        onPress: onPressSetupMAD,
                    };
                    newCarousel.push(newCarouselAutoDeduct);
                }

                if (
                    response?.data?.epfAccountBal <= 0 &&
                    response?.data?.epfMonthlyContribution <= 0 &&
                    response?.data?.goalType === "R"
                ) {
                    const newCarouselAutoDeduct = {
                        title: "Include Your EPF Savings",
                        image: assets.kwsp,
                        gaScreenName: "FinancialGoals_IncludeEPFSavings",
                        subtitle: EPF_TIPS,
                        buttonTitle: "Plan Now",
                        onPress: onPressIncludeEPF,
                    };
                    newCarousel.push(newCarouselAutoDeduct);
                }

                if (
                    response?.data?.totalSavingCash <= 0 &&
                    response?.data?.monthlySavingCash <= 0 &&
                    (response?.data?.goalType === "E" || response?.data?.goalType === "W")
                ) {
                    const newCarouselAutoDeduct = {
                        title: "Include Your Existing Savings",
                        image: assets.existSaving,
                        gaScreenName: "FinancialGoals_IncludeExistingSavings",
                        subtitle: EXISTING_SAVINGS_TIPS,
                        buttonTitle: "Plan Now",
                        onPress: onPressIncludeSaving,
                    };
                    newCarousel.push(newCarouselAutoDeduct);
                }

                if (
                    response?.data?.totalOthInvestment <= 0 &&
                    response?.data?.monthlyOthInvestment <= 0 &&
                    (response?.data?.goalType === "E" || response?.data?.goalType === "W")
                ) {
                    const newCarouselAutoDeduct = {
                        title: "Include Your Existing Investments",
                        image: assets.existInvestment,
                        gaScreenName: "FinancialGoals_IncludeExistingInvestments",
                        subtitle: EXISTING_INVESTMENT_TIPS,
                        buttonTitle: "Plan Now",
                        onPress: onPressIncludeExistInvest,
                    };
                    newCarousel.push(newCarouselAutoDeduct);
                }

                setTipsCarousel(newCarousel);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                showErrorToast({ message: response });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, [goalId]);

    const fetchGoalSummary = useCallback(async () => {
        try {
            const response = await withdrawFundMisc(goalId, true);
            if (response?.data) {
                setIsGoalDeletable(response?.data?.isDeletable);
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, [goalId]);

    function onPressBack() {
        navigation.goBack();
    }

    function onSwitchTab(index) {
        setCurrentTab(index);
    }

    function onMoreOptionButtonPressed() {
        setShowMenu(() => true);
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_TAB_NAME]: currentTab === TABS.OVERVIEW ? "Overview" : "Performance",
        });
    }

    function onTopMenuCloseButtonPressed() {
        setShowMenu(() => false);
    }

    function handleTopMenuItemPress(item) {
        switch (item) {
            case "includeEPFSavings":
                setShowMenu(false);
                onPressIncludeEPF();
                break;
            case "includeOtherSources":
                onPressIncludeOtherSources();
                //onPressIncludeSaving();
                setShowMenu(false);
                break;
            case "tipsToImproveInvestment":
                setShowMenu(false);
                setShowTipsImproveInvestment(true);
                logEvent(FA_SELECT_MENU, {
                    [FA_SCREEN_NAME]: "FinancialGoals_View",
                    [FA_ACTION_NAME]: "Investment Tips",
                });

                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "FinancialGoals_TopUpGoal",
                });
                break;
            case "withdrawFunds":
                setShowMenu(false);
                logEvent(FA_SELECT_MENU, {
                    [FA_SCREEN_NAME]: "FinancialGoals_View",
                    [FA_ACTION_NAME]: "Withdraw Funds",
                });

                if (goalMatrixGamCd !== DET_DELETE_GAMCD) {
                    setShowWithdrawFundPopup(true);
                }
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "FinancialGoals_WithdrawFunds",
                });
                break;
            case "removeGoal":
                setShowMenu(false);

                logEvent(FA_SELECT_MENU, {
                    [FA_SCREEN_NAME]: "FinancialGoals_View",
                    [FA_ACTION_NAME]: "Remove Goal",
                });
                if (
                    goalMatrixGamCd === DET_SUB_GAMCD ||
                    goalMatrixGamCd === DET_WITHDRAW_GAMCD ||
                    !isGoalDeletable
                ) {
                    // show Screen 3 template
                    setGoalMatrixText(goalMatrixPopupDelText);
                    setGoalMatrixPopupTitle("Delete This Goal");
                    setShowGoalMatrixPrimaryButton(false);
                    setGoalMatrixPopUp(true);
                } else {
                    setShowRemoveGoalPopup(true);
                }
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal",
                });
                break;
            default:
                break;
        }
    }

    function closeTipsImproveInvestment() {
        setShowTipsImproveInvestment(false);
    }

    function onPressTopupGoal() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_LANDING,
            params: {
                goalId,
                goalType: goalList?.goalType,
            },
        });
    }

    function onPressSetupMAD() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: MAD_INPUT,
            params: {
                overviewData: goalList,
            },
        });
    }

    function onPressIncludeEPF() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: EPF_SAVING_ENTRY,
            params: {
                epfAccountBal: goalList?.epfAccountBal,
                epfMonthlyContribution: goalList?.epfMonthlyContribution,
                goalId: route?.params?.goalId,
                from: FINANCIAL_GOAL_OVERVIEW,
                shortFallAmt: goalList?.shortFallAmt,
            },
        });

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_ACTION_NAME]: "Include EPF Savings",
        });
    }

    function onPressIncludeSaving() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: EXISTING_INVESTMENT_SAVINGS_ENTRY,
            params: {
                screenType: "existSaving",
                goalType: goalList?.goalType,
                goalId: route?.params?.goalId,
                fundsFor: goalList?.fundsFor,
                totalSavingCash: totalSavings.current,
                monthlySavingCash: savingMonthly.current,
                totalOthInvestment: totalInvest.current,
                monthlyOthInvestment: investMonthly.current,
                from: FINANCIAL_GOAL_OVERVIEW,
            },
        });

        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_ACTION_NAME]: "Other Sources",
        });
    }

    function onPressIncludeExistInvest() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: EXISTING_INVESTMENT_SAVINGS_ENTRY,
            params: {
                screenType: "existInvestment",
                goalType: goalList?.goalType,
                goalId: route?.params?.goalId,
                fundsFor: goalList?.fundsFor,
                totalSavingCash: totalSavings.current,
                monthlySavingCash: savingMonthly.current,
                totalOthInvestment: totalInvest.current,
                monthlyOthInvestment: investMonthly.current,
                from: FINANCIAL_GOAL_OVERVIEW,
            },
        });
    }

    function onPressIncludeOtherSources() {
        setShowTipsImproveInvestment(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: OTHER_SOURCES_CUSTOMIZE_PLAN,
            params: {
                goalType: goalList?.goalType,
                goalId: route?.params?.goalId,
                fundsFor: goalList?.fundsFor,
                totalSavingCash: goalList?.totalSavingCash,
                monthlySavingCash: goalList?.monthlySavingCash,
                totalOthInvestment: goalList?.totalOthInvestment,
                monthlyOthInvestment: goalList?.monthlyOthInvestment,
                from: FINANCIAL_GOAL_OVERVIEW,
            },
        });
    }

    function onIndexChanged(index) {
        const screenName = tipsCarousel?.[index]?.gaScreenName;

        if (screenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
        }
    }

    function onPressRemoveGoalProceed() {
        setShowRemoveGoalPopup(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_REMOVE_GOAL,
            params: {
                totalWithdrawAmount: goalList?.netDeposit + goalList?.investmentReturn,
                totalPortfolioValue: goalList?.totalPortfolioValue,
                roiAmount: goalList?.investmentReturn,
                goalId: route?.params?.goalId,
                goalName: goalList?.gbiName,
            },
        });
    }

    function onCloseRemoveGoalPopup() {
        setShowRemoveGoalPopup(false);
    }

    function onCloseWithdrawFund() {
        setShowWithdrawFundPopup(false);
    }

    function onPressWithdrawProceed() {
        setShowWithdrawFundPopup(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_WITHDRAW_AMT,
            params: {
                totalAmount: goalList?.totalPortfolioValue,
                goalName: goalList?.gbiName,
                totalWithdrawAmount: goalList?.netDeposit + goalList?.investmentReturn,
                totalPortfolioValue: goalList?.totalPortfolioValue,
                roiAmount: goalList?.investmentReturn,
                isGoalDeletable,
                goalMatrixGamCd,
                goalId,
            },
        });
    }

    function onPressDeactiveMADNo() {
        setShowMADPopup(false);
    }

    async function onPressDeactiveMADConfirm() {
        setShowMADPopup(false);
        // add API call for Auto deduction deactivate
        try {
            const response = await deactivateFinancialsMAD(
                goalList?.gbiMonthlyInvestmentModel?.gbiMthlyInvId ?? null,
                true
            );
            if (response?.data && response?.data?.goalId) {
                // success deactivated
                overviewRef.current.toggleOffMAD();
                fetchGoalList();
                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: "FinancialGoals_View",
                    [FA_TAB_NAME]: "Overview",
                    [FA_ACTION_NAME]: "Disable Auto-Deduction",
                });
            } else {
                showErrorToast({
                    message: "Something went wrong. Please try again.",
                });
            }
        } catch (e) {
            showErrorToast({ message: e?.message ?? COMMON_ERROR_MSG });
        }
    }

    function onCloseMAD() {
        setShowMADPopup(false);
    }

    function onPressMADPopup() {
        setShowMADPopup(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_AUTODEDUCT_DEACTIVE,
        });
    }

    function onGoalMatrixPopupCancel() {
        setGoalMatrixPopUp(false);
    }

    function goalMatrixProceed() {
        setGoalMatrixPopUp(false);
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_LANDING,
            params: {
                goalId,
                goalType: goalList?.goalType,
            },
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={WHITE}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={
                                <View>
                                    <View style={Styles.topHeaderTitle}>
                                        <HeaderLabel>{FINANCIAL_GOAL}</HeaderLabel>
                                    </View>
                                </View>
                            }
                            headerRightElement={
                                pendingExecution !== PENDING_EXECUTION &&
                                goalList?.gamCd !== DET_DELETE_GAMCD ? (
                                    <HeaderDotDotDotButton onPress={onMoreOptionButtonPressed} />
                                ) : null
                            }
                            backgroundColor={MEDIUM_GREY}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    {isLoading && (
                        <View style={Styles.swiper}>
                            <ScreenLoader showLoader />
                        </View>
                    )}
                    {!isLoading && (
                        <View style={Styles.selectorContainer}>
                            <SwitchSelector
                                options={switchOptions}
                                backgroundColor={WHITE}
                                initial={selectedTabIndex}
                                value={selectedTabIndex}
                                onPress={onSwitchTab}
                            />
                        </View>
                    )}
                    {currentTab === TABS.OVERVIEW && !isLoading && (
                        <Overview
                            title={goalList?.gbiName}
                            behindAmount={`RM ${numeral(goalList?.shortFallAmt).format("0,0.00")}`}
                            savedAmount={`RM ${numeral(goalList?.totalPortfolioValue).format(
                                "0,0.00"
                            )}`}
                            onTrackFlag={goalList?.goalProgressDesc === "On Track"}
                            overviewData={goalList}
                            navigation={navigation}
                            goalId={goalId}
                            onPressMADPopup={onPressMADPopup}
                            pendingExecution={pendingExecution}
                            setGoalMatrixPopUp={setGoalMatrixPopUp}
                            goalMatrixGamCd={goalMatrixGamCd}
                            setGoalMatrixPopupTitle={setGoalMatrixPopupTitle}
                            setGoalMatrixText={setGoalMatrixText}
                            setShowGoalMatrixPrimaryButton={setShowGoalMatrixPrimaryButton}
                            ref={overviewRef}
                        />
                    )}
                    {currentTab === TABS.PERFORMANCE && (
                        <Performance
                            navigation={navigation}
                            goalId={goalId}
                            overviewData={goalList}
                            investmentStartDt={goalList?.investmentStartDt ?? null}
                        />
                    )}
                </ScreenLayout>
                <Popup
                    visible={showRemoveGoalPopup}
                    title="Remove This Goal"
                    description={removeGoalDescription}
                    onClose={onCloseRemoveGoalPopup}
                    primaryAction={{
                        text: PROCEED,
                        onPress: onPressRemoveGoalProceed,
                    }}
                />
                <Popup
                    visible={showWidhdrawFundPopup}
                    title="Withdraw Funds"
                    description={withdrawFundDesc}
                    onClose={onCloseWithdrawFund}
                    primaryAction={{
                        text: PROCEED,
                        onPress: onPressWithdrawProceed,
                    }}
                    secondaryAction={{
                        text: "No",
                        onPress: onCloseWithdrawFund,
                    }}
                />
                {showTipsImproveInvestment && (
                    <BlurView style={Styles.blurView} blurType="dark" blurAmount={10} />
                )}
                <Modal
                    transparent={true}
                    visible={showTipsImproveInvestment}
                    onRequestClose={closeTipsImproveInvestment}
                >
                    <View style={Styles.swiper}>
                        <View style={Styles.tipsContainer}>
                            <View>
                                <TouchableOpacity
                                    style={Styles.closeXButton}
                                    onPress={closeTipsImproveInvestment}
                                >
                                    <Image source={assets.icCloseBlack} />
                                </TouchableOpacity>
                                <Typo
                                    text="Tips to catch up on your goal"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="center"
                                />
                                <Swiper
                                    loop={false}
                                    containerStyle={Styles.swiperContainer}
                                    dot={<View style={Styles.swiperDot} />}
                                    onIndexChanged={onIndexChanged}
                                >
                                    {tipsCarousel.map((item, index) => {
                                        return (
                                            <View key={index}>
                                                <TipsPage
                                                    title={item?.title}
                                                    image={item?.image}
                                                    subtitle={item?.subtitle}
                                                    buttonTitle={item?.buttonTitle}
                                                    onPress={item?.onPress}
                                                />
                                            </View>
                                        );
                                    })}
                                </Swiper>
                            </View>
                        </View>
                    </View>
                </Modal>
                <GoalMatrixWarningPopUp
                    visible={goalMatrixPopUp}
                    title={goalMatrixPopupTitle}
                    cancelMatrixPopUp={onGoalMatrixPopupCancel}
                    description={goalMatrixText}
                    showActionButtons={showGoalMatrixPrimaryButton}
                    onPressProceedMatrix={goalMatrixProceed}
                />
            </ScreenContainer>
            <TopMenu
                showTopMenu={showMenu}
                onClose={onTopMenuCloseButtonPressed}
                menuArray={goalType === "R" ? menuArrayRetire : menuArrayOther}
                onItemPress={handleTopMenuItemPress}
            />
            {showMADPopup && (
                <MADPopup
                    visible={showMADPopup}
                    title="Deactivate Auto Deduction"
                    text="Are you sure you want to deactivate the auto deduction? You will need to manually top up this goal in the future."
                    primaryButtonText={NO}
                    primaryButtonAction={onPressDeactiveMADNo}
                    secondaryButtonText={CONFIRM}
                    secondaryButtonAction={onPressDeactiveMADConfirm}
                    onClose={onCloseMAD}
                />
            )}
        </>
    );
};

GoalOverview.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const TipsPage = ({ image, title, subtitle, buttonTitle, onPress }) => {
    return (
        <Fragment>
            <Image source={image} style={Styles.tipsImgContainer} />
            <Typo
                text={title}
                fontSize={14}
                fontWeight="600"
                lineHeight={20}
                textAlign="center"
                style={Styles.tipsSubtitle}
            />
            <Typo
                text={subtitle}
                fontSize={12}
                fontWeight="400"
                lineHeight={20}
                textAlign="center"
                style={Styles.tipsDescription}
            />
            <View style={Styles.actionButton}>
                <ActionButton
                    fullWidth
                    componentCenter={
                        <Typo fontSize={14} fontWeight="600" lineHeight={18} text={buttonTitle} />
                    }
                    onPress={onPress}
                />
            </View>
        </Fragment>
    );
};

TipsPage.propTypes = {
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    buttonTitle: PropTypes.string,
    onPress: PropTypes.func,
};

const Styles = {
    swiperContainer: {
        flex: 0,
        height: 390,
    },
    swiperActionButton: {
        marginBottom: 15,
        marginTop: 30,
    },
    selectorContainer: {
        justifyContent: "center",
        paddingHorizontal: 50,
        backgroundColor: MEDIUM_GREY,
        paddingBottom: 20,
    },
    topHeaderTitle: { paddingTop: 5 },
    swiper: {
        justifyContent: "center",
        alignSelf: "center",
        flex: 1,
    },
    swiperDot: {
        backgroundColor: INACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    swiperDotActive: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 4,
        width: 6,
    },
    tipsContainer: {
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
        justifyContent: "space-between",
        height: 450,
    },
    closeXButton: {
        height: 20,
        width: 20,
        alignSelf: "flex-end",
    },
    tipsImgContainer: {
        marginTop: 30,
        alignSelf: "center",
    },
    tipsSubtitle: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    tipsDescription: {
        marginHorizontal: 24,
    },
    blurView: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    actionButton: {
        paddingHorizontal: 24,
        marginTop: 25,
        marginBottom: 20,
    },
};

export default GoalOverview;

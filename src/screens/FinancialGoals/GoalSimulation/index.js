import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from "react-native";
import Modal from "react-native-modal";

import {
    BANKINGV2_MODULE,
    EPF_CUSTOMIZE_PLAN,
    FINANCIAL_GOALS_DASHBOARD_SCREEN,
    FINANCIAL_LEAVE_CONTACT,
    FUND_ALLOCATION,
    GOAL_SIMULATION,
    OTHER_SOURCES_CUSTOMIZE_PLAN,
    RISK_LEVEL_EDIT,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import BatteryBar from "@components/FinancialGoal/BatteryBar";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Slider from "@components/Inputs/Slider";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import { goalSimulation, saveGoalSimulation, deletePendingGoal, getCommonParam } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    SIMULATION,
    GOAL_NOT_DELETED,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL,
    FA_FIN_GOAL_SIMULATION,
    FA_FIN_RETIREMENT,
    FA_FIN_WEALTH,
    FA_FIN_EDUCATION,
    FA_FIN_CHILDEDUCATION,
    FA_OPEN_MENU,
    FA_ACTION_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
} from "@constants/strings";

import { getGoalTitle, mapRiskScoreToText } from "@utils/dataModel/utilityFinancialGoals";
import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import assets from "@assets";

export default function GoalSimulation({ navigation, route }) {
    const { getModel, updateModel } = useModelController();
    const menuArray = [
        {
            menuLabel: "How Simulation Works",
            menuParam: "simulationWorks",
        },
        {
            menuLabel: "Leave Your Contact Details",
            menuParam: "leaveContact",
        },
        {
            menuLabel: "Frequently Asked Questions",
            menuParam: "frequentAskQuestion",
        },
        {
            menuLabel: "Terms & Conditions",
            menuParam: "termConditions",
        },
        {
            menuLabel: "Remove Goal",
            menuParam: "removeGoal",
        },
    ];

    const [showBrowser, setShowBrowser] = useState(false);
    const browserUrl = useRef("");
    const browserTitle = useRef("");

    const defaultSimulateParams = (() => {
        switch (route?.params?.goalType) {
            case "R":
                return {
                    goalType: route?.params?.goalType,
                    inputTargetAmt: route?.params?.inputTargetAmt,
                    retireAge: route?.params?.retireAge,
                    monthlyExpenses: route?.params?.monthlyExpenses,
                    lastFor: route?.params?.lastFor,
                    initialAmt: route?.params?.initialAmt,
                    epfAccountBal: route?.params?.epfAccountBal ?? 0,
                    epfMonthlyContribution: route?.params?.epfMonthlyContribution ?? 0,
                    monthlyAmt: route?.params?.monthlyAmt ?? 0,
                    stepUpAmt: route?.params?.stepUpAmt ?? 0,
                    gbiRiskLevel: route?.params?.gbiRiskLevel,
                    countryCd: "MYS",
                };
            case "E":
                return {
                    goalType: route?.params?.goalType,
                    fundsFor: route?.params?.fundsFor,
                    childName: route?.params?.childName ?? "",
                    childAge: route?.params?.childAge ?? "",
                    fundsBy: route?.params?.fundsBy ?? "0",
                    educationLvl: route?.params?.educationLvl,
                    studyArea: route?.params?.studyArea,
                    educationCtr: route?.params?.educationCtr,
                    inputTargetAmt: route?.params?.inputTargetAmt,
                    initialAmt: route?.params?.initialAmt,
                    totalSavingCash: route?.params?.totalSavingCash ?? 0,
                    monthlySavingCash: route?.params?.monthlySavingCash ?? 0,
                    totalOthInvestment: route?.params?.totalOthInvestment ?? 0,
                    monthlyOthInvestment: route?.params?.monthlyOthInvestment ?? 0,
                    monthlyAmt: route?.params?.monthlyAmt ?? 0,
                    stepUpAmt: route?.params?.stepUpAmt ?? 0,
                    gbiRiskLevel: route?.params?.gbiRiskLevel,
                    countryCd: "MYS",
                };
            case "W":
                return {
                    goalType: route?.params?.goalType,
                    inputTargetAmt: route?.params?.inputTargetAmt,
                    fundsByAge: route?.params?.fundsByAge,
                    initialAmt: route?.params?.initialAmt,
                    totalSavingCash: route?.params?.totalSavingCash ?? 0,
                    monthlySavingCash: route?.params?.monthlySavingCash ?? 0,
                    totalOthInvestment: route?.params?.totalOthInvestment ?? 0,
                    monthlyOthInvestment: route?.params?.monthlyOthInvestment ?? 0,
                    monthlyAmt: route?.params?.monthlyAmt ?? 0,
                    stepUpAmt: route?.params?.stepUpAmt ?? 0,
                    gbiRiskLevel: route?.params?.gbiRiskLevel,
                    countryCd: "MYS",
                };
            default:
                return {};
        }
    })();

    useEffect(() => {
        logFirebaseEvent(FA_VIEW_SCREEN, null);
    }, []);

    function logFirebaseEvent(eventName, actionName) {
        if (actionName == null) {
            switch (route?.params?.goalType) {
                case "E":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]:
                            route?.params?.fundsFor === "myself"
                                ? FA_FIN_GOAL + FA_FIN_EDUCATION + FA_FIN_GOAL_SIMULATION
                                : FA_FIN_GOAL + FA_FIN_CHILDEDUCATION + FA_FIN_GOAL_SIMULATION,
                    });
                    break;
                case "R":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_RETIREMENT + FA_FIN_GOAL_SIMULATION,
                    });
                    break;
                case "W":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_WEALTH + FA_FIN_GOAL_SIMULATION,
                    });
                    break;
                default:
                    return;
            }
        } else {
            switch (route?.params?.goalType) {
                case "E":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]:
                            route?.params?.fundsFor === "myself"
                                ? FA_FIN_GOAL + FA_FIN_EDUCATION + FA_FIN_GOAL_SIMULATION
                                : FA_FIN_GOAL + FA_FIN_CHILDEDUCATION + FA_FIN_GOAL_SIMULATION,
                        [FA_ACTION_NAME]: actionName,
                    });
                    break;
                case "R":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_RETIREMENT + FA_FIN_GOAL_SIMULATION,
                        [FA_ACTION_NAME]: actionName,
                    });
                    break;
                case "W":
                    logEvent(eventName, {
                        [FA_SCREEN_NAME]: FA_FIN_GOAL + FA_FIN_WEALTH + FA_FIN_GOAL_SIMULATION,
                        [FA_ACTION_NAME]: actionName,
                    });
                    break;
                default:
                    return;
            }
        }
    }

    const goalType = route?.params?.goalType;
    const [showMenu, setShowMenu] = useState(false);
    const simulateParams = useRef(defaultSimulateParams);
    const [simulateResult, setSimulateResult] = useState(null);
    const [batterBarObject, setBatteryObject] = useState({});
    const [sliderValue, setSliderValue] = useState(0);
    const [goalId, setGoalId] = useState(null);
    const [educationByAge, setEducationByAge] = useState(0);
    const { currentGoalId } = getModel("financialGoal");

    useEffect(() => {
        // replace new gbiRiskLevel value after user edit and navigate back this page
        const {
            gbiRiskLevel,
            totalSavingCash,
            monthlySavingCash,
            totalOthInvestment,
            monthlyOthInvestment,
            epfMonthlyContribution,
            epfAccountBal,
            goalId,
        } = route?.params;

        simulateParams.current = {
            ...simulateParams.current,
            gbiRiskLevel,
            totalSavingCash: totalSavingCash ?? 0,
            monthlySavingCash: monthlySavingCash ?? 0,
            totalOthInvestment: totalOthInvestment ?? 0,
            monthlyOthInvestment: monthlyOthInvestment ?? 0,
            epfAccountBal: epfAccountBal ?? 0,
            epfMonthlyContribution: epfMonthlyContribution ?? 0,
        };

        //update goalId after user add contact no and navigate back to this page
        // current goalId to retain in context when user navigate back from simulation and back to simulation again
        setGoalId(goalId ?? currentGoalId);
        fetchEducationMiscData(route?.params?.goalType, route?.params?.fundsFor);
        fetchSimulationResponse(route?.params?.sliderValue ?? null);
    }, [currentGoalId, route?.params]);

    const fetchEducationMiscData = useCallback(
        async (goalType, fundsForVal) => {
            if (goalType === "E" && fundsForVal === "child") {
                const param = (() => {
                    switch (route?.params?.educationLvl) {
                        case "Postgraduate":
                            return "POG";
                        case "University":
                            return "UNI";
                        case "College":
                            return "COL";
                        default:
                            return "";
                    }
                })();
                const response = await getCommonParam(param, true);
                if (response?.data) {
                    setEducationByAge(response?.data?.[0]?.paramMaxValue);
                }
            }
        },
        [route?.params?.educationLvl]
    );

    const fetchSimulationResponse = useCallback(
        async (sliderValue) => {
            try {
                const response = await goalSimulation(simulateParams.current, true);
                if (response?.data) {
                    setSimulateResult(response?.data);

                    //set battery bar object
                    const battery = (() => {
                        const gapColor = "#9E9E9E";
                        const gapStripe = response?.data?.gapStripe ?? 0;
                        const futureInvestmentColor = "#499664";
                        const futureInvestmentStripe = response?.data?.futureStripe ?? 0;
                        const otherSourceColor = "#33C5FF";
                        const otherSourceStripe = response?.data?.otherSourcesStripe ?? 0;

                        const object = [];

                        if (gapStripe > 0) {
                            object.push({
                                color: gapColor,
                                stripe: gapStripe,
                            });
                        }

                        if (futureInvestmentStripe > 0) {
                            object.push({
                                color: futureInvestmentColor,
                                stripe: futureInvestmentStripe,
                            });
                        }

                        if (otherSourceStripe > 0) {
                            object.push({
                                color: otherSourceColor,
                                stripe: otherSourceStripe,
                            });
                        }

                        return object;
                    })();
                    setBatteryObject(battery);

                    /* handling where user edited other sources/epf, max/min value will be updated
                    to smaller/bigger than original slider value, handling slider value should not be more/less
                    then min/max value
                    */
                    const value = (() => {
                        switch (true) {
                            case sliderValue && sliderValue > response?.data?.maxValue:
                                return response?.data?.maxValue;
                            case sliderValue && sliderValue < response?.data?.minValue:
                                return response?.data?.minValue;
                            default:
                                return (
                                    sliderValue ??
                                    response?.data?.monthlyAmt ??
                                    response?.data?.defaultValue
                                );
                        }
                    })();

                    setSliderValue(value);
                }
            } catch (error) {
                showErrorToast({ message: error?.message });
            }
            setShowMenu(() => false);
        },
        [simulateParams]
    );

    function onPressBack() {
        // different handling to show risk popup in previous page
        if (route?.params?.fromScreen) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.fromScreen,
                params: {
                    showPopup: true,
                    customerRiskLevel: route?.params?.customerRiskLevel,
                    ...route?.params,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    function onPressThreeDot() {
        logFirebaseEvent(FA_OPEN_MENU, null);

        //Note: in some condition showMenu not return false, have to handle this to re-render
        setShowMenu(() => true);
    }

    function onTopMenuCloseButtonPressed() {
        setShowMenu(() => false);
    }

    function handleTopMenuItemPress(item) {
        setShowMenu(false);
        const { birthDate } = getModel("user");
        const formattedClientRiskDate = route?.params?.clientRiskDate
            ? moment(route?.params?.clientRiskDate, "YYYYMMDD").format("YYYY-MM-DD")
            : null;

        switch (item) {
            case "simulationWorks":
                logFirebaseEvent(FA_SELECT_MENU, "How Simulation Works");
                browserTitle.current = "How Simulation Works";
                browserUrl.current =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/wealth/financialgoals_whitepaper.pdf";
                setShowBrowser(true);
                break;
            case "leaveContact":
                logFirebaseEvent(FA_SELECT_MENU, "Leave Contact Details");
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FINANCIAL_LEAVE_CONTACT,
                    params: {
                        ...route?.params,
                        goalId,
                        dob: birthDate,
                        gbiTargetAmt: simulateResult?.gbiTargetAmt,
                        clientRiskDate: formattedClientRiskDate,
                        clientRiskLevel: route?.params?.customerRiskLevel,
                        monthlyAmt: sliderValue,
                        timeHorizon: simulateResult?.timeHorizon,
                        investmentDuration: simulateResult?.investmentDuration,
                        contactNo: route?.params?.contactNo,
                        channelCd: "MAE",
                        countryCd: "MYS",
                    },
                });
                break;
            case "frequentAskQuestion":
                logFirebaseEvent(FA_SELECT_MENU, "FAQ");
                browserTitle.current = "Frequently Asked Questions";
                browserUrl.current =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/wealth/financialgoals_faq.pdf";
                setShowBrowser(true);
                break;
            case "termConditions":
                logFirebaseEvent(FA_SELECT_MENU, "Terms & Conditions");
                browserTitle.current = "Terms & Conditions";
                browserUrl.current =
                    "https://www.maybank2u.com.my/iwov-resources/pdf/personal/wealth/financialgoals_tnc.pdf";
                setShowBrowser(true);
                break;
            case "removeGoal":
                logFirebaseEvent(FA_SELECT_MENU, "Remove Goal");
                removePendingGoalConfirm();
                break;
        }
    }

    async function removePendingGoalConfirm() {
        const reqObject = {
            goalId: goalId ?? "",
        };
        try {
            const response = await deletePendingGoal(reqObject, true);
            if (response?.data) {
                if (response?.data?.status === "SUCCESS") {
                    showSuccessToast({ message: "Goal deleted successfully!" });
                    navigation.navigate("Dashboard", {
                        screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
                    });
                } else {
                    // some error while deleting
                    showErrorToast({ message: response?.data?.message ?? GOAL_NOT_DELETED });
                }
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    const onSliderDragged = useCallback((value) => {
        setSliderValue(Math.round(value));
    }, []);

    const onSlidingComplete = useCallback(
        (value) => {
            simulateParams.current = { ...simulateParams.current, monthlyAmt: Math.round(value) };

            fetchSimulationResponse(Math.round(value));
        },

        [fetchSimulationResponse, simulateParams]
    );

    function onPressRiskLevelEdit() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: RISK_LEVEL_EDIT,
            params: {
                riskLevel: simulateResult?.gbiRiskLevel,
                riskOptions: simulateResult?.riskRateMenuItemDTOList,
                customerRiskLevel: route?.params?.customerRiskLevel,
                sliderValue,
            },
        });
    }

    // function _gotoStepUpInvestmentPage() {
    //     logFirebaseEvent(FA_SELECT_ACTION, "Optimize Plan");
    //     navigation.navigate(BANKINGV2_MODULE, {
    //         screen: STEPUP_INVESTMENT_DETAILS,
    //         // params: {
    //         //     goalDetails: { futureStripe: 2, gapStripe: 10, epfStripe: 2, gapValue: 200 },
    //         // },
    //     });
    // }

    const goalImage = () => {
        switch (goalType) {
            case "E":
                return assets.goalEducation;
            case "R":
                return assets.goalRetirement;
            case "W":
                return assets.goalGrowWealth;
            default:
                return null;
        }
    };

    function renderGoalStatusLabel() {
        if (simulateResult?.projectedGoalShortfall <= 0) {
            return (
                <View style={styles.onTrackSignView}>
                    <Image source={assets.icRoundedGreenTick} style={styles.rightPanel3} />
                    <Typo text="You're on track!" fontSize={12} />
                </View>
            );
        } else {
            return (
                <View style={styles.warningSignView}>
                    <Image source={assets.icWarning} style={styles.rightPanel3} />
                    <View style={styles.rightPanel4}>
                        <Typo text="There's a gap of" fontSize={12} fontWeight="400" />
                        <Typo
                            text={`RM ${numberWithCommas(
                                simulateResult?.projectedGoalShortfall?.toFixed(2) ?? 0
                            )}`}
                            fontWeight="600"
                            fontSize={12}
                        />
                    </View>
                </View>
            );
        }
    }

    function renderFutureInvestmentValue() {
        return (
            <BatteryBarLabel
                image={assets.simulateGreenRadio}
                title="Your contribution"
                label={`RM ${numberWithCommas(
                    simulateResult?.projectedGoalContribution?.toFixed(2) ?? 0
                )}`}
            />
        );
    }

    function onPressEPF() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: EPF_CUSTOMIZE_PLAN,
            params: {
                ...route?.params,
                epfReturnRate: simulateResult?.simulationParamDTO?.epfReturnRateStr,
                epfAccountBal: route?.params?.epfAccountBal,
                epfMonthlyContribution: route?.params?.epfMonthlyContribution,
                shortFallAmt: simulateResult?.projectedGoalShortfall,
                sliderValue,
                from: GOAL_SIMULATION,
            },
        });
    }

    function onPressOtherSources() {
        const { monthlySavingCash, totalSavingCash, monthlyOthInvestment, totalOthInvestment } =
            route?.params;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: OTHER_SOURCES_CUSTOMIZE_PLAN,
            params: {
                ...route?.params,
                totalSavingCash,
                monthlySavingCash,
                totalOthInvestment,
                monthlyOthInvestment,
                savingReturnRate: simulateResult?.simulationParamDTO?.savingsReturnRateStr,
                investReturnRate: simulateResult?.simulationParamDTO?.invReturnRateStr,
                goalType,
                gapCount: simulateResult?.projectedGoalShortfall,
                sliderValue,
                from: GOAL_SIMULATION,
            },
        });
    }

    function renderAdditionSourceLabel() {
        const title = (() => {
            switch (goalType) {
                case "R":
                    return "Your estimated EPF value";
                case "E":
                case "W":
                    return "Your estimated other sources of wealth";
            }
        })();

        const editLabel = (() => {
            switch (goalType) {
                case "R":
                    return "+ Add Your EPF Value";
                case "E":
                case "W":
                    return "+ Add your other sources";
            }
        })();

        const onPress = (() => {
            switch (goalType) {
                case "R":
                    return onPressEPF;
                case "E":
                case "W":
                    return onPressOtherSources;
            }
        })();

        const otherSourceAmount = (() => {
            switch (goalType) {
                case "R":
                    return simulateResult?.projectedEpf > 0
                        ? `RM ${numberWithCommas(simulateResult?.projectedEpf?.toFixed(2) ?? 0)}`
                        : null;
                case "E":
                case "W":
                    return simulateResult?.projectedInvestmentSum > 0
                        ? `RM ${numberWithCommas(
                              simulateResult?.projectedInvestmentSum?.toFixed(2) ?? 0
                          )}`
                        : null;
            }
        })();
        return (
            <BatteryBarLabel
                image={assets.simulateBlueRadio}
                editLabel={editLabel}
                title={title}
                label={otherSourceAmount}
                onPress={onPress}
            />
        );
    }

    async function onPressViewFund() {
        logFirebaseEvent(FA_SELECT_ACTION, "View Fund Allocation");
        const prefix = "+60";
        const { birthDate } = getModel("user");
        const formattedClientRiskDate = route?.params?.clientRiskDate
            ? moment(route?.params?.clientRiskDate, "YYYYMMDD").format("YYYY-MM-DD")
            : null;

        const savingRequest = {
            ...route?.params,
            goalId,
            dob: birthDate,
            gbiTargetAmt: simulateResult?.gbiTargetAmt,
            clientRiskDate: formattedClientRiskDate,
            clientRiskLevel: route?.params?.customerRiskLevel,
            monthlyAmt: sliderValue,
            timeHorizon: simulateResult?.timeHorizon,
            investmentDuration: simulateResult?.investmentDuration,
            channelCd: "MAE",
            countryCd: "MYS",
            contactNo: route?.params?.contactNo != null ? prefix + route?.params?.contactNo : null,
        };

        try {
            const response = await saveGoalSimulation(savingRequest, true);
            if (response?.data) {
                /* create ----- without goalId,
                   edit ----- with goalId */
                setGoalId(response?.data?.goalId);
                updateModel({
                    financialGoal: {
                        currentGoalId: response?.data?.goalId,
                    },
                });
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: FUND_ALLOCATION,
                    params: {
                        goalType: route?.params?.goalType,
                        timeHorizon: simulateResult?.timeHorizon,
                        gbiRiskLevel: route?.params?.gbiRiskLevel,
                        initialDeposit: route?.params?.initialAmt,
                        monthlyDeposit: sliderValue,
                        gbiTargetAmt: simulateResult?.gbiTargetAmt,
                        goalId: response?.data?.goalId,
                        fundsFor: route?.params?.fundsFor,
                        clientRiskDate: formattedClientRiskDate,
                    },
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }

    const goalTitle = (() => {
        if (goalType === "W") {
            return "Grow My Wealth";
        } else if (goalType === "E" && route?.params?.fundsFor === "child") {
            return `${route?.params?.childName}'s ${getGoalTitle(goalType)}`;
        } else {
            return `My ${getGoalTitle(goalType)}`;
        }
    })();

    const targetTime = (() => {
        switch (true) {
            case goalType === "R":
                return `by age ${route?.params?.retireAge}`;
            case goalType === "W":
                return `by age ${route?.params?.fundsByAge}`;
            case goalType === "E" && route?.params?.fundsFor === "child":
                return `by age ${educationByAge}`;
            case goalType === "E" && route?.params?.fundsFor === "myself":
                return `by ${route?.params?.fundsBy}`;
        }
    })();

    return (
        <>
            <ScreenContainer>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>{SIMULATION}</HeaderLabel>}
                            headerRightElement={<HeaderDotDotDotButton onPress={onPressThreeDot} />}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView style={styles.scrollViewContainer}>
                        <View style={styles.container}>
                            <View style={styles.topLeftSubContainer}>
                                <Image source={goalImage()} style={styles.batteryBarImage} />
                                <BatteryBar
                                    batteryObject={batterBarObject}
                                    stripeHeight={8}
                                    width={40}
                                />
                            </View>
                            <View style={styles.topRightSubContainer}>
                                <View style={styles.goalTitleAmount}>
                                    <Typo text={goalTitle} fontSize={12} fontWeight="400" />
                                    <Typo
                                        text={`RM ${numberWithCommas(
                                            simulateResult?.gbiTargetAmt?.toFixed(2) ?? 0
                                        )}`}
                                        fontSize={12}
                                        fontWeight="600"
                                    />
                                    <Typo
                                        text={targetTime}
                                        fontSize={12}
                                        fontWeight="400"
                                        textAlign="center"
                                    />
                                </View>

                                {renderGoalStatusLabel()}
                                {renderFutureInvestmentValue()}
                                {renderAdditionSourceLabel()}
                            </View>
                        </View>

                        <View>
                            <Typo
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                style={styles.descText}
                                text="Based on your information, here's your recommended monthly investment amount."
                            />

                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={19}
                                text="Monthly Investment"
                                textAlign="left"
                            />

                            <Typo
                                fontWeight="normal"
                                fontSize={12}
                                lineHeight={20}
                                textAlign="left"
                                text={`Future Investment: RM ${numberWithCommas(
                                    simulateResult?.projectedGoalContribution?.toFixed(2) ?? 0
                                )}`}
                            />
                        </View>

                        <View style={styles.rightQ4}>
                            <Typo
                                fontSize={24}
                                fontWeight="600"
                                lineHeight={25}
                                text={`RM ${numberWithCommas(sliderValue)}`}
                            />

                            <View style={styles.sliderSection}>
                                <Slider
                                    minimumValue={simulateResult?.minValue ?? 0}
                                    maximumValue={simulateResult?.maxValue ?? 0}
                                    minimumTrackTintColor="#499664"
                                    maximumTrackTintColor="#ececee"
                                    thumbTintColor="#499664"
                                    value={sliderValue}
                                    onValueChange={onSliderDragged}
                                    onSlidingComplete={onSlidingComplete}
                                />
                                <View style={styles.sliderValueContainer}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text={`RM ${numberWithCommas(
                                            simulateResult?.minValue ?? 0
                                        )}`}
                                    />

                                    <Typo
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text={`RM ${numberWithCommas(
                                            simulateResult?.maxValue ?? 0
                                        )}`}
                                    />
                                </View>
                                <View style={styles.riskLevelContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        text="Risk level"
                                    />
                                    <TouchableOpacity onPress={onPressRiskLevelEdit}>
                                        <Typo
                                            color={ROYAL_BLUE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={mapRiskScoreToText(simulateResult?.gbiRiskLevel)}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <View style={styles.actionButtonContainer}>
                            <ActionButton
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="View Fund Allocation"
                                    />
                                }
                                fullWidth
                                onPress={onPressViewFund}
                            />

                            {/* <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.secondaryButtonLink}
                            onPress={_gotoStepUpInvestmentPage}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={
                                    greyStripe < 0
                                        ? "Lets optimise further"
                                        : "Help Me Close The Gap"
                                }
                            />
                        </TouchableOpacity> */}
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
                <Browser
                    source={{ uri: browserUrl.current }}
                    title={browserTitle.current}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
            <TopMenu
                showTopMenu={showMenu}
                onClose={onTopMenuCloseButtonPressed}
                menuArray={
                    goalId
                        ? menuArray
                        : menuArray?.filter((item) => item?.menuParam !== "removeGoal")
                }
                onItemPress={handleTopMenuItemPress}
            />
        </>
    );
}

GoalSimulation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const BatteryBarLabel = ({ onPress, image, title, label, editLabel }) => {
    const Wrapper = onPress ? TouchableOpacity : View;

    if (!label && onPress) {
        return (
            <TouchableOpacity onPress={onPress} style={styles.batteryBarEditLabelContainer}>
                <Typo
                    text={editLabel}
                    fontSize={12}
                    fontWeight="600"
                    color={ROYAL_BLUE}
                    numberOfLines={2}
                    textAlign="left"
                />
            </TouchableOpacity>
        );
    } else {
        return (
            <View style={styles.batteryBarLabelContainer}>
                <Image source={image} style={styles.batteryBarLabelImage} />
                <View>
                    <Typo text={title} fontWeight="400" fontSize={10} textAlign="left" />
                    <Wrapper onPress={onPress}>
                        <Typo
                            text={label}
                            fontSize={12}
                            fontWeight="600"
                            textAlign="left"
                            color={onPress ? ROYAL_BLUE : BLACK}
                        />
                    </Wrapper>
                </View>
            </View>
        );
    }
};

BatteryBarLabel.propTypes = {
    onPress: PropTypes.func,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    editLabel: PropTypes.string,
};

const styles = StyleSheet.create({
    actionButtonContainer: {
        flexDirection: "column",
        flex: 1,
    },
    batteryBarEditLabelContainer: {
        alignItems: "flex-start",
        marginLeft: 15,
        paddingBottom: 15,
    },
    batteryBarImage: {
        marginBottom: 15,
    },
    batteryBarLabelContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        paddingBottom: 5,
        marginRight: 24,
    },
    batteryBarLabelImage: {
        alignSelf: "center",
        marginHorizontal: 10,
    },
    container: {
        flexDirection: "row",
    },
    descText: {
        paddingVertical: 20,
    },
    goalTitleAmount: {
        width: 180,
    },
    modal: {
        margin: 0,
    },
    onTrackSignView: {
        alignItems: "center",
        backgroundColor: `#CCF1D7`,
        borderRadius: 8,
        flexDirection: "row",
        height: 40,
        justifyContent: "flex-start",
        width: 175,
    },
    rightPanel3: { margin: 12 },
    riskLevelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 24,
        width: "100%",
    },
    scrollViewContainer: {
        paddingHorizontal: 24,
    },
    sliderValueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    topLeftSubContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
    },
    topRightSubContainer: {
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-between",
    },
    warningSignView: {
        alignItems: "center",
        backgroundColor: `rgba(251, 228, 121, 1)`,
        borderRadius: 8,
        flexDirection: "row",
        height: 54,
        justifyContent: "flex-start",
        width: 175,
    },
    rightPanel4: {
        alignItems: "flex-start",
        flexDirection: "column",
    },
    rightQ4: { marginTop: 24 },
    sliderSection: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 34,
        width: "100%",
    },
});

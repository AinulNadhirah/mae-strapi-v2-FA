import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, Fragment, useImperativeHandle, forwardRef, useEffect } from "react";
import { View, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PieChart } from "react-native-svg-charts";
import SwitchToggle from "react-native-switch-toggle";

import {
    BANKINGV2_MODULE,
    MAD_INPUT,
    FINANCIAL_TOPUP_LANDING,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    LIGHT_GREEN,
    FADED_RED,
    BLUER_GREEN,
    ROYAL_BLUE,
    GREY,
    WHITE,
    SWITCH_GREEN,
    RED,
} from "@constants/colors";
import {
    PENDING,
    PENDING_EXECUTION,
    DET_SUB_GAMCD,
    DET_DELETE_GAMCD,
    FA_SELECT_ACTION,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_ACTION_NAME,
    PENDING_EXECUTION_OVERVIEW_MSG,
} from "@constants/strings";

import { commaAndDecimalAdder } from "@utils/dataModel/utilityPartial.1";

import assets from "@assets";

import { getDateShortMonthFormat } from "../../../utilities/dataModel/dataModelExtend";

const Overview = (
    {
        title,
        savedAmount,
        behindAmount,
        overviewData,
        onTrackFlag,
        navigation,
        goalId,
        onPressMADPopup,
        pendingExecution,
        setGoalMatrixPopUp,
        goalMatrixGamCd,
        setGoalMatrixPopupTitle,
        setGoalMatrixText,
        setShowGoalMatrixPrimaryButton,
    },
    ref
) => {
    const statusObject = {
        onTrack: {
            image: assets.tickIcon,
            backgroundColor: LIGHT_GREEN,
            text: "You're right on track to reach your goal!",
        },
        fallBehind: {
            image: assets.warningRed,
            backgroundColor: FADED_RED,
            text: "You're behind by " + behindAmount + " from your expected goal progress.",
        },
        pending: {
            text: "Goal Created, please allow few day while we process your transaction",
        },
    };
    const status = onTrackFlag ? statusObject.onTrack : statusObject.fallBehind;
    const otherEPFSourceAmt = (() => {
        if (overviewData?.goalType === "R") {
            return overviewData?.projectedEpf !== 0 ? overviewData?.projectedEpf : null;
        } else {
            return overviewData?.otherFunds !== 0 ? overviewData?.otherFunds : null;
        }
    })();

    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [autoDeductToggle, setAutoDeductToggle] = useState(false);

    useEffect(() => {
        setAutoDeductToggle(overviewData?.gbiMonthlyInvestmentModel?.isActive);
    }, [overviewData]);

    const currentDate = moment().format("DD MMM YYYY");
    //const [stepUpToggle, setStepUpToggle] = useState(false);
    //const [buttonEnabled, setButtonEnabled] = useState(false);
    const monthlyAmountFormatted = `RM ${
        overviewData?.gbiMonthlyInvestmentModel?.amount &&
        commaAndDecimalAdder(overviewData?.gbiMonthlyInvestmentModel?.amount)
    }`;
    const nextMonthlyAutoDeductDate = `${getDateShortMonthFormat(
        overviewData?.gbiMonthlyInvestmentModel?.nextBillDate
    )}`;
    const autoDeductionSubOff =
        "Set up an automated contribution to ensure you reach your goals on time. ";
    const autoDeductionSubOn =
        monthlyAmountFormatted +
        " monthly. Next deposit on " +
        nextMonthlyAutoDeductDate +
        ". To change your contribution amount, ";
    const EPFOtherAvailable = overviewData?.projectedEpf || overviewData?.otherFunds ? true : false;
    const EPFDisclaimer =
        "* The EPF amount is projected based on the details you've provided, and does not reflect your actual savings. You can always adjust your EPF details under your goal details.";
    const otherFundDisclaimer =
        "* The Cash & Deposits and Investment amount is projected based on details you've provided and does not reflect your actual savings. You can always adjust your existing investments under your goal details.";

    const goalMatrixFreezeLabel =
        "Your goal is being deleted and we're currently processing your transactions. This may take up to 10 business days. We'll notify you once the process is completed.";

    const goalMatrixOTDLabel =
        "You have a one-time deposit that is still being processed.\n It may take up to 10 business days for your one-time deposit to be reflected in your goal.";

    const pieData = [
        {
            //Total Portfolio value without other income
            value: overviewData?.totalPortfolioValue,
            svg: {
                fill: onTrackFlag ? "#469561" : "#E35D5D",
            },
            key: 1,
        },
        {
            //Other income (EPF or other Saving + investment)
            value: otherEPFSourceAmt,
            svg: {
                fill: "#32C5FF",
            },
            key: 2,
        },
        {
            //Target goal balance = Target Goal - (Total Portfolio value + Other income)
            value:
                overviewData?.gbiTargetAmt -
                    otherEPFSourceAmt -
                    overviewData?.totalPortfolioValue >=
                0
                    ? overviewData?.gbiTargetAmt -
                      otherEPFSourceAmt -
                      overviewData?.totalPortfolioValue
                    : 0,
            svg: {
                fill: "#CCCCCC",
            },
            key: 3,
        },
    ];

    const additionalDataEPF = [
        {
            title: "Goal target",
            value: `RM ${numeral(overviewData?.gbiTargetAmt).format("0,0.00")}`,
        },
        {
            title: "Monthly investment",
            value: `RM ${numeral(overviewData?.amount).format("0,0.00")}`,
        },
        {
            title: "Average annual return",
            value:
                pendingExecution === PENDING_EXECUTION
                    ? PENDING
                    : `${overviewData?.avgAnnualReturn ?? 0}%`,
        },
        {
            //this field is hardcode as the requirement is still out of scope for now
            title: overviewData?.goalType === "R" ? "EPF" : "Other Sources",
            value: `RM ${numeral(otherEPFSourceAmt).format("0,0.00")}`,
        },
        /*{
            title: "Start date",
            value: "N/A",
        },
        {
            title: "End date",
            value: "N/A",
        },*/
    ];

    const additionalData = [
        {
            title: "Goal target",
            value: `RM ${numeral(overviewData?.gbiTargetAmt).format("0,0.00")}`,
        },
        {
            title: "Monthly investment",
            value: `RM ${numeral(overviewData?.amount).format("0,0.00")}`,
        },
        {
            title: "Average annual return",
            value:
                pendingExecution === PENDING_EXECUTION
                    ? PENDING
                    : `${overviewData?.avgAnnualReturn ?? 0}%`,
        },
        /*{
            title: "Start date",
            value: "N/A",
        },
        {
            title: "End date",
            value: "N/A",
        },*/
    ];

    useImperativeHandle(ref, () => ({
        toggleOffMAD: () => {
            setAutoDeductToggle(false);
        },
    }));

    function onPressAdditionalInfo() {
        setShowMoreInfo(!showMoreInfo);
    }

    function onPressAutoDeduct() {
        if (goalMatrixGamCd !== DET_DELETE_GAMCD) {
            if (autoDeductToggle) {
                onPressMADPopup();
            } else {
                onPressMADAmount();
                // setAutoDeductToggle(!autoDeductToggle);
            }
        }
    }

    /*function onPressStepupInvest() {
        setStepUpToggle(!stepUpToggle);
    }*/

    function onPressTopupGoal() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals_View",
            [FA_TAB_NAME]: "Overview",
            [FA_ACTION_NAME]: "Top Up Goal",
        });

        if (goalMatrixGamCd === DET_SUB_GAMCD) {
            // show Screen 1 template
            setGoalMatrixPopupTitle("One-Time Deposit");
            setGoalMatrixText(goalMatrixOTDLabel);
            setShowGoalMatrixPrimaryButton(true);
            setGoalMatrixPopUp(true);
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FINANCIAL_TOPUP_LANDING,
                params: {
                    goalId,
                    goalType: overviewData?.goalType,
                },
            });
        }
    }

    const percentageGain = (() => {
        if (!overviewData?.avgAnnualReturn) return "0%";

        return `${overviewData?.avgAnnualReturn >= 0 ? "+" : ""}${overviewData?.avgAnnualReturn}%`;
    })();

    function onPressMADAmount() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: MAD_INPUT,
            params: {
                overviewData,
            },
        });
    }

    return (
        <>
            <ScrollView style={styles.container}>
                <Typo
                    text={title}
                    fontSize={20}
                    fontWeight="600"
                    lineHeight={24}
                    style={styles.goalTitle}
                />
                {goalMatrixGamCd !== DET_DELETE_GAMCD &&
                    (pendingExecution === PENDING_EXECUTION ? (
                        <Typo
                            text={PENDING_EXECUTION_OVERVIEW_MSG}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    ) : (
                        <StatusLabel
                            image={status?.image}
                            text={status?.text}
                            backgroundColor={status?.backgroundColor}
                        />
                    ))}
                {goalMatrixGamCd === DET_DELETE_GAMCD && (
                    <StatusLabel
                        image={statusObject.fallBehind.image}
                        text={goalMatrixFreezeLabel}
                        backgroundColor={statusObject.fallBehind.backgroundColor}
                    />
                )}
                <GoalPieChart
                    data={pieData}
                    title="Saved so far"
                    subtitle={`As of ${currentDate}`}
                    savedAmount={savedAmount}
                />
                <View style={styles.chartLabelContainer}>
                    <InfoLabel
                        title="Total Deposit"
                        subtitle={
                            pendingExecution === PENDING_EXECUTION
                                ? PENDING
                                : `RM ${numeral(overviewData?.netDeposit).format("0,0.00")}`
                        }
                    />
                    <InfoLabel
                        title="Investment return"
                        subtitle={
                            pendingExecution === PENDING_EXECUTION
                                ? PENDING
                                : `${overviewData?.investmentReturn >= 0 ? "" : "-"} RM ${numeral(
                                      Math.abs(overviewData?.investmentReturn)
                                  ).format("0,0.00")}`
                        }
                        percentageGain={
                            pendingExecution === PENDING_EXECUTION ? null : percentageGain
                        }
                        percentageGainColor={overviewData?.avgAnnualReturn >= 0 ? BLUER_GREEN : RED}
                    />
                </View>
                {EPFOtherAvailable && (
                    <InfoLabel
                        bulletColor="#32C5FF"
                        title={overviewData?.goalType === "R" ? "EPF" : "Other Sources"}
                        subtitle={`RM ${numeral(otherEPFSourceAmt).format("0,0.00")}`}
                    />
                )}
                <AdditionalInfo
                    showLessLabel="View Less Details"
                    showMoreLabel="View More Details"
                    onPress={onPressAdditionalInfo}
                    expandStatus={showMoreInfo}
                    data={EPFOtherAvailable ? additionalDataEPF : additionalData}
                    epfOtherAvailable={EPFOtherAvailable}
                    disclaimer={
                        overviewData?.goalType === "R" ? EPFDisclaimer : otherFundDisclaimer
                    }
                    pendingExecution={pendingExecution}
                />
                {!(
                    pendingExecution === PENDING_EXECUTION || goalMatrixGamCd === DET_DELETE_GAMCD
                ) && (
                    <BoosterComponent
                        title="Auto Deduction"
                        onPress={onPressAutoDeduct}
                        toggleStatus={autoDeductToggle}
                        subtitle={autoDeductToggle ? autoDeductionSubOn : autoDeductionSubOff}
                        onPressChangeAmount={onPressMADAmount}
                    />
                )}
                {/* Out of scope will be enable when the requirement is in scope       
            <BoosterComponent
                title="Step-up investment"
                onPress={onPressStepupInvest}
                toggleStatus={stepUpToggle}
                subtitle="RM 500.00 step-up investment every year. View Schedule"
            />*/}
            </ScrollView>
            {!(pendingExecution === PENDING_EXECUTION || goalMatrixGamCd === DET_DELETE_GAMCD) && (
                <View style={styles.actionButtonContainer}>
                    <ActionButton
                        fullWidth
                        style={styles.actionButton}
                        onPress={onPressTopupGoal}
                        componentCenter={<Typo text="Top up goal" fontSize={14} fontWeight="600" />}
                    />
                </View>
            )}
        </>
    );
};

Overview.propTypes = {
    title: PropTypes.string,
    behindAmount: PropTypes.string,
    savedAmount: PropTypes.string,
    onTrackFlag: PropTypes.bool,
    overviewData: PropTypes.object,
    navigation: PropTypes.object,
    goalId: PropTypes.number,
    onPressMADPopup: PropTypes.func,
    pendingExecution: PropTypes.string,
    setGoalMatrixPopUp: PropTypes.func,
    goalMatrixGamCd: PropTypes.string,
    setGoalMatrixPopupTitle: PropTypes.func,
    setGoalMatrixText: PropTypes.func,
    setShowGoalMatrixPrimaryButton: PropTypes.func,
};

const GoalPieChart = ({ data, title, subtitle, savedAmount }) => {
    return (
        <>
            <PieChart
                data={data}
                style={styles.pieChart}
                innerRadius="85%"
                padAngle={0}
                // eslint-disable-next-line react/jsx-no-bind
                sort={(a, b) => b.value + a.value}
            />
            <View style={styles.pieChartCenterTextContainer}>
                <Typo text={title} fontSize={14} fontWeight="400" />
                <Typo text={savedAmount} fontSize={16} fontWeight="600" lineHeight={20} />
                <Typo text={subtitle} fontSize={14} fontWeight="400" lineHeight={20} />
            </View>
        </>
    );
};

GoalPieChart.propTypes = {
    data: PropTypes.array.isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    savedAmount: PropTypes.string,
};

const InfoLabel = ({ bulletColor, title, subtitle, percentageGain, percentageGainColor }) => {
    return (
        <View style={styles.infoLabelContainer}>
            <View style={styles.infoLabelTitleContainer}>
                {bulletColor && (
                    <View
                        style={[
                            styles.infoLabelBulletColor,
                            {
                                backgroundColor: bulletColor,
                            },
                        ]}
                    />
                )}
                <Typo text={title} fontSize={14} fontWeight="400" lineHeight={16} />
            </View>
            <Typo text={subtitle} fontSize={16} fontWeight="600" lineHeight={20} />
            {percentageGain && (
                <Typo
                    text={percentageGain}
                    fontWeight="600"
                    fontSize={12}
                    color={percentageGainColor}
                    lineHeight={20}
                />
            )}
        </View>
    );
};

InfoLabel.propTypes = {
    bulletColor: PropTypes.string,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    percentageGain: PropTypes.string,
    percentageGainColor: PropTypes.string,
};

const StatusLabel = ({ image, text, backgroundColor }) => {
    return (
        <View style={[styles.statusLabelContainer, { backgroundColor }]}>
            <Image source={image} style={styles.statusLabelImage} />
            <Typo
                text={text}
                fontWeight="400"
                fontSize={12}
                textAlign="left"
                style={styles.statusLabelText}
            />
        </View>
    );
};

StatusLabel.propTypes = {
    image: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
};

const AdditionalInfo = ({
    showMoreLabel,
    showLessLabel,
    onPress,
    expandStatus,
    data,
    disclaimer,
    epfOtherAvailable,
    pendingExecution,
}) => {
    function renderLabelValue({ item }) {
        return (
            <View style={styles.additionalInfoItem}>
                <Typo text={item?.title} fontSize={14} fontWeight="400" />
                <Typo text={item?.value} fontSize={14} fontWeight="600" />
            </View>
        );
    }
    return (
        <View
            style={[
                styles.additionalContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    borderBottomWidth:
                        expandStatus && pendingExecution !== PENDING_EXECUTION ? 1 : 0,
                },
            ]}
        >
            <TouchableOpacity onPress={onPress}>
                <Typo
                    text={expandStatus ? showLessLabel : showMoreLabel}
                    fontSize={14}
                    fontWeight="600"
                    color={ROYAL_BLUE}
                    style={styles.additionalShowMoreLabel}
                />
            </TouchableOpacity>
            {expandStatus && (
                <FlatList data={data} renderItem={renderLabelValue} scrollEnabled={false} />
            )}
            {disclaimer && expandStatus && epfOtherAvailable && (
                <Typo
                    text={disclaimer}
                    fontSize={12}
                    fontWeight="300"
                    textAlign="left"
                    style={styles.additionalDisclaimer}
                />
            )}
        </View>
    );
};

AdditionalInfo.propTypes = {
    showLessLabel: PropTypes.string.isRequired,
    showMoreLabel: PropTypes.string.isRequired,
    onPress: PropTypes.func,
    expandStatus: PropTypes.bool,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
            value: PropTypes.string,
        })
    ),
    disclaimer: PropTypes.string,
    epfOtherAvailable: PropTypes.bool,
    item: PropTypes.object,
    pendingExecution: PropTypes.string,
};

const BoosterComponent = ({ title, subtitle, onPress, toggleStatus, onPressChangeAmount }) => {
    return (
        <Fragment>
            <View style={styles.boosterHeader}>
                <Typo text={title} fontSize={14} fontWeight="600" />
                <SwitchToggle
                    circleColorOff={WHITE}
                    backgroundColorOff={GREY}
                    backgroundColorOn={SWITCH_GREEN}
                    onPress={onPress}
                    containerStyle={styles.boosterToggle}
                    circleStyle={styles.boosterToggleCircle}
                    switchOn={toggleStatus}
                />
            </View>
            {!toggleStatus && (
                <Typo
                    text={subtitle}
                    textAlign="left"
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={20}
                    style={styles.boosterSubtitle}
                />
            )}
            {toggleStatus && (
                <Typo
                    text={subtitle}
                    textAlign="left"
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={20}
                    style={styles.boosterSubtitle}
                >
                    {subtitle}
                    <TouchableOpacity onPress={onPressChangeAmount}>
                        <Typo
                            text=" click here"
                            fontSize={14}
                            fontWeight="600"
                            textAlign="left"
                            style={styles.clickHere}
                        />
                    </TouchableOpacity>
                </Typo>
            )}
        </Fragment>
    );
};

BoosterComponent.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    onPress: PropTypes.func,
    toggleStatus: PropTypes.bool,
    onPressChangeAmount: PropTypes.func,
};

const styles = StyleSheet.create({
    actionButton: {
        marginVertical: 20,
    },
    actionButtonContainer: {
        bottom: 0,
        paddingHorizontal: 24,
    },
    additionalContainer: {
        borderBottomColor: GREY,
        paddingBottom: 10,
        paddingTop: 30,
    },
    additionalDisclaimer: {
        paddingBottom: 15,
        paddingTop: 8,
    },
    additionalInfoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    additionalShowMoreLabel: {
        paddingBottom: 20,
    },
    boosterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 25,
    },
    boosterSubtitle: {
        width: "80%",
    },
    boosterToggle: {
        borderRadius: 20,
        height: 22,
        padding: 1,
        width: 45,
    },
    boosterToggleCircle: {
        borderRadius: 10,
        height: 20,
        width: 20,
    },
    chartLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    clickHere: { textDecorationLine: "underline", top: 1 },
    container: {
        backgroundColor: WHITE,
        paddingHorizontal: 24,
    },
    goalTitle: {
        paddingVertical: 12,
    },
    infoLabelBulletColor: {
        borderRadius: 7,
        height: 14,
        marginRight: 8,
        width: 14,
    },
    infoLabelContainer: {
        paddingHorizontal: 20,
    },
    infoLabelTitleContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    pieChart: {
        height: 220,
        marginTop: 20,
    },

    pieChartCenterTextContainer: {
        alignContent: "center",
        justifyContent: "center",
        top: -135,
    },
    statusLabelContainer: {
        borderRadius: 8,
        flexDirection: "row",
        paddingVertical: 12,
    },
    statusLabelImage: {
        marginLeft: 18,
        marginRight: 12,
        resizeMode: "contain",
    },
    statusLabelText: {
        alignSelf: "center",
        paddingRight: 60,
    },
});

export default forwardRef(Overview);

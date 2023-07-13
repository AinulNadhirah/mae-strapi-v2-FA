import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { ProgressCircle } from "react-native-svg-charts";

import Switch from "@components/Inputs/Switch";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { SWITCH_GREY } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_TABUNG_TABUNGVIEW } from "@constants/strings";

import Assets from "@assets";

const Progress = ({
    formattedSaveSoFar,
    formattedTotalBoosterAmount,
    formattedTotalAmount,
    remainingAmount,
    duration,
    formattedStartDate,
    formattedEndDate,
    userDetails,
    onEsiTogglePressed,
    percentage,
    status,
    goalMature,
}) => {
    const completed = status === "COMPLETED";
    const {
        esiDetail: { formattedEsiAmount, frequency, formattedNextDDate },
    } = userDetails;
    const moreDetailsContainerHeightAnimation = useRef(new Animated.Value(36)).current;
    const moreDetailsContainerOpacityAnimation = useRef(new Animated.Value(0)).current;
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [moreDetailsContainerHeight, setMoreDetailsContainerHeight] = useState(0);

    const onViewMoreDetailsButtonPressed = useCallback(
        () => setShowMoreDetails(!showMoreDetails),
        [setShowMoreDetails, showMoreDetails]
    );

    const onMoreDetailsFirstRender = useCallback(
        ({
            nativeEvent: {
                layout: { height },
            },
        }) => setMoreDetailsContainerHeight(height),
        []
    );

    const onEsiToggleValueChanged = useCallback(
        () => onEsiTogglePressed(userDetails),
        [userDetails, onEsiTogglePressed]
    );

    const esiDeductionDescription = useMemo(() => {
        if (frequency.toLowerCase() === "w") return `RM ${formattedEsiAmount} weekly`;
        else return `RM ${formattedEsiAmount} monthly`;
    }, [frequency, formattedEsiAmount]);

    useEffect(() => {
        if (showMoreDetails)
            Animated.parallel([
                Animated.timing(moreDetailsContainerHeightAnimation, {
                    toValue: moreDetailsContainerHeight + 60,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(moreDetailsContainerOpacityAnimation, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]).start();
        else
            Animated.parallel([
                Animated.timing(moreDetailsContainerHeightAnimation, {
                    toValue: 36,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(moreDetailsContainerOpacityAnimation, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]).start();
    });

    const renderChartSummary = (isCompleted) => {
        if (isCompleted)
            return (
                <React.Fragment>
                    <Typo text="Completed" fontSize={14} lineHeight={18} />
                    <SpaceFiller height={4} />
                    <Typo
                        text={`RM ${formattedSaveSoFar}`}
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                    />
                    <Image style={styles.completionTrophyImage} source={Assets.tabungTrophy} />
                </React.Fragment>
            );
        else
            return (
                <React.Fragment>
                    <Typo text="Saved so far" fontSize={14} lineHeight={18} />
                    <SpaceFiller height={4} />
                    <Typo
                        text={`RM ${formattedSaveSoFar}`}
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                    />
                    <SpaceFiller height={24} />
                    <Typo text="Boosters" fontSize={14} lineHeight={18} />
                    <SpaceFiller height={4} />
                    <Typo
                        text={`RM ${formattedTotalBoosterAmount}`}
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        color="#67cc89"
                    />
                </React.Fragment>
            );
    };

    const renderBanner = () => {
        const savedSoFarValue = numeral(formattedSaveSoFar).value();
        const goalAmountValue = numeral(formattedTotalAmount).value();
        if (completed)
            return (
                <View style={styles.completionContainer}>
                    <Image style={styles.completionImage} source={Assets.icRoundedGreenTick} />
                    <View style={styles.completionTextContainer}>
                        <Typo
                            text="Congrats! This goal is complete."
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={17}
                        />
                    </View>
                </View>
            );
        else if (goalMature && !completed) {
            if (savedSoFarValue < goalAmountValue)
                return (
                    <View style={styles.maturedContainer}>
                        <Image style={styles.completionImage} source={Assets.icWarning} />
                        <View style={styles.completionTextContainer}>
                            <Typo
                                text="This goal is behind schedule."
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={17}
                            />
                        </View>
                    </View>
                );
            return (
                <View style={styles.maturedContainer}>
                    <Image style={styles.completionImage} source={Assets.icWarning} />
                    <View style={styles.completionTextContainer}>
                        <Typo
                            text="Top up to reach your goal on time."
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={17}
                        />
                    </View>
                </View>
            );
        } else return null;
    };

    const containerStyle = completed ? [styles.container, { paddingTop: 24 }] : styles.container;

    return (
        <View style={containerStyle}>
            {renderBanner()}
            <View style={styles.chartContainer}>
                {renderChartSummary(completed)}
                <ProgressCircle
                    style={styles.chart}
                    progress={percentage?.boosterPercentage ?? 0}
                    progressColor="#67cc89"
                    strokeWidth={20}
                    cornerRadius={0}
                    backgroundColor={SWITCH_GREY}
                />
                <ProgressCircle
                    style={styles.chart}
                    progress={percentage?.contribPercentage ?? 0}
                    progressColor="#469561"
                    backgroundColor="transparent"
                    strokeWidth={20}
                    cornerRadius={0}
                />
            </View>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryTextContainer}>
                    <Typo text="Goal amount" fontSize={14} lineHeight={18} />
                    <Typo
                        text={`RM ${formattedTotalAmount}`}
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                    />
                </View>
                <View style={styles.summaryTextContainer}>
                    <Typo text="Remaining" fontSize={14} lineHeight={18} />
                    <Typo
                        text={`RM ${remainingAmount}`}
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                    />
                </View>
            </View>
            <TouchableOpacity onPress={onViewMoreDetailsButtonPressed}>
                {showMoreDetails ? (
                    <Typo
                        text="View Less Details"
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        color="#4a90e2"
                    />
                ) : (
                    <Typo
                        text="View More Details"
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        color="#4a90e2"
                    />
                )}
            </TouchableOpacity>
            <Animated.View
                style={[
                    styles.moreDetailsContainer,
                    {
                        height: moreDetailsContainerHeightAnimation,
                        opacity: moreDetailsContainerOpacityAnimation,
                    },
                ]}
            >
                <View style={styles.moreDetailsChildContainer} onLayout={onMoreDetailsFirstRender}>
                    <View style={styles.moreDetailsRowContainer}>
                        <Typo text="Goal duration" fontSize={14} lineHeight={18} />
                        <Typo text={`${duration}`} fontSize={14} fontWeight="600" lineHeight={18} />
                    </View>
                    <SpaceFiller height={16} />
                    <View style={styles.moreDetailsRowContainer}>
                        <Typo text="Start date" fontSize={14} lineHeight={18} />
                        <Typo
                            text={`${formattedStartDate}`}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    </View>
                    <SpaceFiller height={16} />
                    <View style={styles.moreDetailsRowContainer}>
                        <Typo text="End date" fontSize={14} lineHeight={18} />
                        <Typo
                            text={`${formattedEndDate}`}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    </View>
                    {!goalMature && (
                        <React.Fragment>
                            <View style={styles.moreDetailSeparator} />
                            <View style={styles.esiContainer}>
                                <View style={styles.esiTextContainer}>
                                    <Typo
                                        text="Auto Deduction"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        text="Set up an automated contribution to ensure you reach your goals on time."
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={16} />
                                    <Typo
                                        text={esiDeductionDescription}
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        text={`Next deduction will be on ${formattedNextDDate}`}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={styles.esiToggleContainer}>
                                    <Switch
                                        value={{
                                            active:
                                                userDetails.esiDetail?.esiStatus.toLowerCase() ===
                                                    "on" ||
                                                userDetails.esiDetail?.esiStatus.toLowerCase() ===
                                                    "pending_on",
                                        }}
                                        onTogglePressed={onEsiToggleValueChanged}
                                    />
                                </View>
                            </View>
                        </React.Fragment>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const COMPLETION_GREEN = "#ccf1d7";
const MATURED_YELLOW = "#fbe479";
const SPACE_BETWEEN = "space-between";

const styles = StyleSheet.create({
    chart: { height: 240, position: "absolute", width: 240 },
    chartContainer: {
        alignItems: "center",
        height: 250,
        justifyContent: "center",
        width: 250,
    },
    completionContainer: {
        alignItems: "center",
        backgroundColor: COMPLETION_GREEN,
        borderRadius: 8,
        flexDirection: "row",
        height: 41,
        justifyContent: "center",
        marginBottom: 16,
        width: "100%",
    },
    completionImage: {
        height: 16,
        marginRight: 12,
        width: 16,
    },
    completionTextContainer: {
        opacity: 0.6,
    },
    completionTrophyImage: {
        height: 36,
        marginTop: 16,
        width: 32,
    },
    container: {
        alignItems: "center",
        paddingTop: 36,
        width: "100%",
    },
    esiContainer: {
        flexDirection: "row",
    },
    esiTextContainer: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: SPACE_BETWEEN,
    },
    esiToggleContainer: {
        justifyContent: "flex-start",
        paddingLeft: 7,
    },
    maturedContainer: {
        alignItems: "center",
        backgroundColor: MATURED_YELLOW,
        borderRadius: 8,
        flexDirection: "row",
        height: 41,
        justifyContent: "center",
        marginBottom: 16,
        width: "100%",
    },
    moreDetailSeparator: {
        borderBottomWidth: 1,
        borderColor: SWITCH_GREY,
        marginVertical: 24,
        width: "100%",
    },
    moreDetailsChildContainer: {
        left: 0,
        paddingHorizontal: 16,
        position: "absolute",
        right: 0,
        top: 24,
        width: "100%",
    },
    moreDetailsContainer: {
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    moreDetailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        width: "100%",
    },
    summaryContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        paddingBottom: 28,
        paddingHorizontal: 16,
        paddingTop: 15,
        width: "100%",
    },
    summaryTextContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
});

Progress.propTypes = {
    formattedSaveSoFar: PropTypes.string.isRequired,
    formattedTotalBoosterAmount: PropTypes.string.isRequired,
    formattedTotalAmount: PropTypes.string.isRequired,
    remainingAmount: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    formattedStartDate: PropTypes.string.isRequired,
    formattedEndDate: PropTypes.string.isRequired,
    userDetails: PropTypes.object.isRequired,
    onEsiTogglePressed: PropTypes.func.isRequired,
    percentage: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    goalMature: PropTypes.bool.isRequired,
};

export default React.memo(Progress);

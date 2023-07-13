import PropTypes from "prop-types";
import React from "react";
import { TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

import {
    BEHIND_STATUS,
    PENDING_CANCEL,
    PROGRESS_BAR_GRAY,
    PROGRESS_BAR_GREEN,
    ROYAL_BLUE,
    SHADOW_LIGHT,
    WHITE,
} from "../../constants/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

const GoalCard = ({ title, badgeText, executedAmount, targetAmount, goalId, onPress, gamCd }) => {
    const badgeColor = (() => {
        switch (badgeText) {
            case "Pending":
            case "Pending Cancellation":
                return PENDING_CANCEL;
            case "Behind":
                return BEHIND_STATUS;
            default:
                return WHITE;
        }
    })();

    function onPressCard() {
        onPress(goalId, badgeText, gamCd);
    }

    return (
        <TouchableOpacity
            style={styles.goalCardContainer}
            activeOpacity={0.6}
            onPress={onPressCard}
        >
            <Typo text={title} fontSize={14} fontWeight="600" textAlign="left" />
            {!!badgeText ? (
                <View style={styles.cardBadgeContainer(badgeColor)}>
                    <Typo
                        text={badgeText}
                        fontSize={11}
                        fontWeight="400"
                        textAlign="left"
                        color={WHITE}
                    />
                </View>
            ) : (
                <SpaceFiller height={30} />
            )}
            <Typo
                text="Saved so far"
                fontSize={12}
                fontWeight="400"
                textAlign="left"
                style={styles.goalCardSavedSoFar}
            />
            <Typo
                text={`RM ${numberWithCommas(executedAmount ?? 0)} of RM ${numberWithCommas(
                    targetAmount ?? 0
                )}`}
                textAlign="left"
                fontSize={12}
                fontWeight="600"
            />
            <Progress.Bar
                progress={targetAmount && executedAmount ? executedAmount / targetAmount : 0}
                style={styles.progressBarStyle}
                width={SCREEN_WIDTH - 90}
                height={7}
                animated={false}
                borderRadius={3}
                borderWidth={0}
                color={PROGRESS_BAR_GREEN}
                unfilledColor={PROGRESS_BAR_GRAY}
                borderColor={ROYAL_BLUE}
            />
        </TouchableOpacity>
    );
};

GoalCard.propTypes = {
    title: PropTypes.string,
    badgeText: PropTypes.string,
    executedAmount: PropTypes.number,
    targetAmount: PropTypes.number,
    goalId: PropTypes.string,
    onPress: PropTypes.func,
    gamCd: PropTypes.string,
};

const styles = StyleSheet.create({
    cardBadgeContainer: (badgeColor) => ({
        backgroundColor: badgeColor,
        paddingVertical: 5,
        paddingHorizontal: 18,
        borderRadius: 13,
        marginVertical: 8,
        alignSelf: "flex-start",
    }),
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
    goalCardSavedSoFar: {
        paddingBottom: 5,
        paddingTop: 8,
    },
    progressBarStyle: {
        marginTop: 10,
    },
});

export default GoalCard;

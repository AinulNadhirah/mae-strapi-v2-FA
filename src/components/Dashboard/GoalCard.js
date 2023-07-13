import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

import {
    CREATE_GOALS_SELECT_GOAL_TYPE,
    GOALS_MODULE,
    TABUNG_STACK,
    TABUNG_DETAILS_SCREEN,
    TABUNG_MAIN,
} from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { WHITE, YELLOW, SHADOW_LIGHT } from "@constants/colors";
import { FA_FIELD_INFORMATION, FA_SCREEN_NAME, FA_SELECT_TABUNG } from "@constants/strings";

import { showGoalDowntimeError } from "@utils";

import Images from "@assets";

const PROGRESS_BG = "rgba(0,0,0,0.3)";

const styles = StyleSheet.create({
    goalCardBg: {
        bottom: 0,
        height: 256, // quirks with the image not in its correct size, because of the alpha channel
        left: -16,
        position: "absolute",
        resizeMode: "stretch",
        right: 0,
        top: -14,
        width: 174,
    },
    goalCardContainer: {
        paddingHorizontal: 12,
        paddingVertical: 24,
    },
    goalCardContainerInner: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 202,
        padding: 0,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 142,
    },
    goalCardContent: {
        borderRadius: 8,
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
    goalCardMeta: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    goalCardMetaAmount: {
        flex: 0.5,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    goalCardMetaAmountProgressContainer: {
        paddingVertical: 4,
        width: "100%",
    },
    goalCardMetaAmountProgressCurrent: {
        backgroundColor: YELLOW,
        borderRadius: 4,
        bottom: 0,
        height: 8,
        left: 0,
        position: "absolute",
        top: 0,
    },
    goalCardMetaAmountProgressFull: {
        backgroundColor: PROGRESS_BG,
        borderRadius: 4,
        height: 8,
        position: "relative",
        width: "100%",
    },
    goalCardMetaDetails: {
        flex: 0.5,
    },
    goalCardMetaIcon: {
        height: 36,
        width: 36,
    },
    goalCardMetaTitle: {
        paddingVertical: 8,
    },
    goalCardNew: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-between",
        paddingBottom: 24,
        paddingTop: 44,
    },
    goalCardNewAction: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    goalCardNewActionContainer: {
        paddingHorizontal: 14,
    },
    goalCardNewIcon: {
        height: 64,
        width: 64,
    },
    goalCardWrapper: {
        borderRadius: 8,
        height: "100%",
        position: "relative",
        width: "100%",
    },
});

function GoalCard({
    id,
    goalType,
    name,
    totalAmount,
    contributedAmount,
    isNew,
    navigation,
    formattedContributedAmount,
}) {
    const [iconSrc, setIcon] = useState("");

    function progressToWidth() {
        return contributedAmount > totalAmount ? 100 : (contributedAmount / totalAmount) * 100;
    }

    async function handleNewTabung() {
        logEvent(FA_SELECT_TABUNG, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "Create Tabung",
        });

        // check if downtime
        const isDowntime = await showGoalDowntimeError();
        !isDowntime &&
            navigation.navigate(GOALS_MODULE, {
                screen: CREATE_GOALS_SELECT_GOAL_TYPE,
            });
    }

    function handleGoToTabung() {
        logEvent(FA_SELECT_TABUNG, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "Select Tabung",
        });

        navigation.navigate(TABUNG_STACK, {
            screen: TABUNG_MAIN,
            params: {
                screen: TABUNG_DETAILS_SCREEN,
                params: {
                    id,
                },
            },
        });
    }

    function handleOnPress() {
        if (isNew) {
            handleNewTabung();
        } else {
            handleGoToTabung();
        }
    }

    useEffect(() => {
        switch (goalType) {
            case "T":
                setIcon(Images.dashboardTabungWidgetFlight);
                break;
            case "S":
                setIcon(Images.dashboardTabungWidgetShopping);
                break;
            case "R":
                setIcon(Images.dashboardTabungWidgetRainyDay);
                break;
            case "C":
                setIcon(Images.dashboardTabungWidgetCoinJar);
                break;
            case "O":
                setIcon(Images.dashboardTabungWidgetOthers);
                break;
            default:
                setIcon(Images.dashboardTabungWidgetOthers);
                break;
        }
    }, [goalType]);

    return (
        <TouchableSpring onPress={isNew ? handleNewTabung : handleOnPress}>
            {({ animateProp }) => (
                <Animated.View
                    style={[
                        styles.goalCardContainer,
                        {
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.goalCardContainerInner}>
                        <View style={styles.goalCardWrapper}>
                            <View style={styles.goalCardContent}>
                                {!isNew
? (
                                    <>
                                        <Image
                                            source={Images.dashboardTabungWidgetBg}
                                            style={styles.goalCardBg}
                                        />
                                        <View style={styles.goalCardMeta}>
                                            <View style={styles.goalCardMetaDetails}>
                                                {!!iconSrc && (
                                                    <Image
                                                        source={iconSrc}
                                                        style={styles.goalCardMetaIcon}
                                                    />
                                                )}
                                                <View style={styles.goalCardMetaTitle}>
                                                    <Typo
                                                        color={WHITE}
                                                        fontSize={12}
                                                        fontWeight="normal"
                                                        lineHeight={14}
                                                        textAlign="left"
                                                        text={name}
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.goalCardMetaAmount}>
                                                <Typo
                                                    color={WHITE}
                                                    fontSize={14}
                                                    fontWeight="bold"
                                                    lineHeight={14}
                                                    textAlign="left"
                                                    text={`RM ${formattedContributedAmount}`}
                                                />
                                                <View
                                                    style={
                                                        styles.goalCardMetaAmountProgressContainer
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.goalCardMetaAmountProgressFull
                                                        }
                                                    >
                                                        <View
                                                            style={[
                                                                styles.goalCardMetaAmountProgressCurrent,
                                                                {
                                                                    width: `${progressToWidth()}%`,
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                </View>
                                                <Typo
                                                    color={WHITE}
                                                    fontSize={10}
                                                    fontWeight="normal"
                                                    lineHeight={14}
                                                    textAlign="left"
                                                    text={`from RM ${numeral(totalAmount).format(
                                                        "0,0"
                                                    )}`}
                                                />
                                            </View>
                                        </View>
                                    </>
                                )
: (
                                    <View style={styles.goalCardNew}>
                                        <Image
                                            source={Images.dashboardTabungWidgetNew}
                                            style={styles.goalCardNewIcon}
                                        />
                                        <View style={styles.goalCardNewActionContainer}>
                                            <ActionButton
                                                activeOpacity={0.8}
                                                backgroundColor={YELLOW}
                                                borderRadius={15}
                                                height={30}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={15}
                                                        text="New Tabung"
                                                    />
                                                }
                                                style={styles.goalCardNewAction}
                                                onPress={handleNewTabung}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

GoalCard.propTypes = {
    id: PropTypes.number,
    goalType: PropTypes.string,
    name: PropTypes.string,
    totalAmount: PropTypes.number,
    contributedAmount: PropTypes.number,
    formattedContributedAmount: PropTypes.string,
    isNew: PropTypes.bool,
    navigation: PropTypes.object,
};

export default GoalCard;

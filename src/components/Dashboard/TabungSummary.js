import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

import { GOALS_MODULE, CREATE_GOALS_SELECT_GOAL_TYPE } from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getDashboardTabungList, getDashboardTabungCount, invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import { ROYAL_BLUE, SHADOW_LIGHT, WHITE, YELLOW } from "@constants/colors";
import {
    FA_CREATE_TABUNG,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_TABUNG,
} from "@constants/strings";

import { showGoalDowntimeError } from "@utils";

import Images from "@assets";

import GoalCard from "./GoalCard";
import LoadingWithLockComponent from "./LoadingWithLockComponent";
import DashboardViewPortAware from "./ViewPortAware";

const styles = StyleSheet.create({
    goalContainer: {
        flex: 1,
        paddingBottom: 12,
    },
    goalContainerLockedContainer: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        position: "relative",
    },
    goalEmptyCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    goalEmptyCardAction: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    goalEmptyCardActionContainer: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 24,
    },
    goalEmptyCardBgContainer: {
        bottom: 0,
        height: 340,
        left: 0,
        position: "absolute",
        right: 0,
    },
    goalEmptyCardImg: { height: 340, width: "100%" },
    goalEmptyCardMeta: { paddingBottom: 24, paddingHorizontal: 24, paddingTop: 46 },
    goalEmptyCardMetaTitle: {
        paddingBottom: 12,
    },
    goalEmptyCardWrapper: {
        borderRadius: 8,
        overflow: "hidden",
        paddingBottom: 120,
        position: "relative",
    },
    goalEmptyContainer: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    goalHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    goalListContainerInner: {
        paddingHorizontal: 12,
    },
    goalLoadingContainer: {
        padding: 24,
    },
    goalLockedAction: {
        paddingHorizontal: 16,
    },
    goalLockedActionContainer: {
        alignItems: "center",
        flexDirection: "row",
    },
    goalLockedBg: {
        height: "100%",
        position: "absolute",
        width: "100%",
    },
    goalLockedContent: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 54,
        paddingVertical: 26,
    },
    goalLockedDescription: {
        paddingVertical: 12,
    },
    goalLockedIcon: {
        height: 64,
        width: 64,
    },
    goalLockedInner: {
        borderRadius: 8,
        height: 202,
        overflow: "hidden",
        position: "relative",
    },
});

function TabungLocked({ handleGoToTabung }) {
    return (
        <View style={styles.goalContainerLockedContainer}>
            <TouchableSpring onPress={handleGoToTabung}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={styles.goalLockedInner}>
                            <Image
                                source={Images.dashboardTabungWidgetLargeBg}
                                style={styles.goalLockedBg}
                            />
                            <View style={styles.goalLockedContent}>
                                <Image
                                    source={Images.dashboardTabungLocked}
                                    style={styles.goalLockedIcon}
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    color={WHITE}
                                    text="Log in to view your Tabung's progress here."
                                    style={styles.goalLockedDescription}
                                />
                                <View style={styles.goalLockedActionContainer}>
                                    <ActionButton
                                        backgroundColor={YELLOW}
                                        borderRadius={15}
                                        width="auto"
                                        height={30}
                                        componentCenter={
                                            <Typo
                                                fontSize={12}
                                                fontWeight="600"
                                                lineHeight={15}
                                                text="Tap to View"
                                            />
                                        }
                                        style={styles.goalLockedAction}
                                        onPress={handleGoToTabung}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

TabungLocked.propTypes = {
    handleGoToTabung: PropTypes.func,
};
function TabungSummary({ navigation, getModel, initialLoaded, updateModel }) {
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState([]);
    const [haveGoals, setHaveGoals] = useState(false);
    const [haveGoalsData, setHaveGoalsData] = useState(null);
    const { isPostLogin } = getModel("auth");
    const { isOnboard } = getModel("user");
    const isUnmount = useRef(false);
    const [loaded, setLoaded] = useState(0);
    const [isFromGoalLogin, setIsFromGoalLogin] = useState(false);

    function handleGoToOnboard() {
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    const handleGoToTabung = useCallback(() => {
        setIsFromGoalLogin(true);
        navigation.navigate("TabungTab");
    }, [navigation]);

    const handleViewAll = useCallback(() => {
        logEvent(FA_SELECT_TABUNG, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "View All",
        });

        handleGoToTabung();
    }, [handleGoToTabung]);

    async function handleDashboardAuth() {
        if (!isOnboard) {
            handleGoToOnboard();
        } else if (!isPostLogin) {
            // go to tabung dashboard screen
            // trigger step up
            await invokeL2(false);
            setIsFromGoalLogin(true);
        } else {
            handleGoToTabung();
        }
    }

    async function handleGoToCreateTabung() {
        if (!isOnboard) {
            logEvent(FA_SELECT_TABUNG, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_FIELD_INFORMATION]: FA_CREATE_TABUNG,
            });
            handleGoToOnboard();
        } else {
            logEvent(FA_SELECT_TABUNG, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_FIELD_INFORMATION]: FA_CREATE_TABUNG,
            });
            // check if Tabung Downtime
            const isDowntime = await showGoalDowntimeError();
            !isDowntime &&
                navigation.navigate(GOALS_MODULE, {
                    screen: CREATE_GOALS_SELECT_GOAL_TYPE,
                });
        }
    }

    const getGoals = useCallback(async () => {
        if (isOnboard && !isUnmount.current) {
            setLoading(true);

            if (!isPostLogin) {
                // onboard but only pre login. get number of goal
                setGoals([]);

                try {
                    const response = await getDashboardTabungCount();

                    if (response && response.data && !isUnmount.current) {
                        const { result } = response.data;
                        setHaveGoals(result?.exists);
                        setHaveGoalsData(result?.exists);
                        updateModel({
                            isGoalObjLaunch: response,
                        });
                    }
                } catch (error) {
                    // show locked state on failure
                    if (!isUnmount.current) setHaveGoals(true);
                } finally {
                    if (!isUnmount.current) setLoading(false);
                }
            } else {
                // onboard and post login, get goal list
                setHaveGoals(false);

                try {
                    const response = await getDashboardTabungList();

                    if (response && response.data && !isUnmount.current) {
                        const { resultList } = response.data;

                        setGoals(resultList);
                    }
                } catch (error) {
                    if (!isUnmount.current) setHaveGoals(true);
                } finally {
                    if (!isUnmount.current) setLoading(false);
                }
            }
        }
    }, [isOnboard, isPostLogin]);

    const handleViewportEnter = () => {
        if (loaded !== initialLoaded) {
            isUnmount.current = false;
            setLoaded(initialLoaded);
            getGoals();
        }

        return () => {
            isUnmount.current = true;
            setIsFromGoalLogin(false);
        };
    };

    useEffect(() => {
        if (isPostLogin) {
            setLoaded(0);
        } else {
            if (haveGoalsData === null) {
                setLoaded(0);
            } else {
                setGoals([]);
                setHaveGoals(haveGoalsData);
            }
        }
    }, [isPostLogin]);

    useEffect(() => {
        if (isPostLogin && isFromGoalLogin && loaded === 0) {
            handleViewportEnter();
        }
    }, [loaded, isFromGoalLogin]);

    return (
        <DashboardViewPortAware callback={handleViewportEnter} preTriggerRatio={0.5}>
            <View style={styles.goalContainer}>
                {(haveGoals || (isPostLogin && !!goals.length)) && (
                    <View>
                        <View style={styles.goalHeading}>
                            <Typo fontSize={16} fontWeight="600" lineHeight={18} text="Tabung" />
                            <TouchableOpacity onPress={handleViewAll}>
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="View All"
                                />
                            </TouchableOpacity>
                        </View>
                        {loading && (
                            <View style={styles.goalLoadingContainer}>
                                <LoadingWithLockComponent type="tabung" isPostLogin={isPostLogin} />
                            </View>
                        )}

                        {!loading && haveGoals && !isPostLogin && (
                            <TabungLocked handleGoToTabung={handleDashboardAuth} />
                        )}

                        {!loading && isPostLogin && !!goals.length && (
                            <ScrollView
                                contentContainerStyle={styles.goalListContainerInner}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                {goals.map((goal) => (
                                    <GoalCard
                                        key={`${goal.id}`}
                                        {...goal}
                                        navigation={navigation}
                                    />
                                ))}
                                {goals.length < 10 && <GoalCard isNew navigation={navigation} />}
                            </ScrollView>
                        )}
                    </View>
                )}

                {loading && (
                    <View style={styles.goalLoadingContainer}>
                        <LoadingWithLockComponent type="tabung" isPostLogin={isPostLogin} />
                    </View>
                )}

                {!loading && (!isOnboard || (!haveGoals && !goals.length)) && (
                    <View style={styles.goalEmptyContainer}>
                        <TouchableSpring onPress={handleGoToCreateTabung}>
                            {({ animateProp }) => (
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                scale: animateProp,
                                            },
                                        ],
                                    }}
                                >
                                    <View style={styles.goalEmptyCard}>
                                        <View style={styles.goalEmptyCardWrapper}>
                                            <View style={styles.goalEmptyCardBgContainer}>
                                                <Image
                                                    source={Images.dashboardTabungEmptyBg}
                                                    style={styles.goalEmptyCardImg}
                                                />
                                            </View>
                                            <View style={styles.goalEmptyCardMeta}>
                                                <Typo
                                                    fontSize={18}
                                                    fontWeight="bold"
                                                    lineHeight={18}
                                                    text="Tabung"
                                                    style={styles.goalEmptyCardMetaTitle}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="normal"
                                                    lineHeight={18}
                                                    text="Track your saving progress right here when you create your Tabung."
                                                />
                                                <View style={styles.goalEmptyCardActionContainer}>
                                                    <ActionButton
                                                        backgroundColor={YELLOW}
                                                        borderRadius={15}
                                                        height={30}
                                                        componentCenter={
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="600"
                                                                lineHeight={15}
                                                                text="Create Tabung"
                                                            />
                                                        }
                                                        style={styles.goalEmptyCardAction}
                                                        onPress={handleGoToCreateTabung}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Animated.View>
                            )}
                        </TouchableSpring>
                    </View>
                )}
            </View>
        </DashboardViewPortAware>
    );
}

TabungSummary.propTypes = {
    isOnboard: PropTypes.bool,
    initialLoaded: PropTypes.number,
    isPostLogin: PropTypes.bool,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object,
};

export default withModelContext(TabungSummary);

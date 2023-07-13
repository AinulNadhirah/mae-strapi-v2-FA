import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useCallback, useRef } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { pfmGetData, invokeL2 } from "@services";
import { logEvent } from "@services/analytics";

import {
    WHITE,
    ROYAL_BLUE,
    LIGHT_GREY,
    DARK_GREY,
    RED,
    SHADOW,
    SHADOW_LIGHT,
    GREEN,
    GREY,
    YELLOW,
    GREY_200,
    MEDIUM_GREY,
} from "@constants/colors";
import { FA_FIELD_INFORMATION, FA_SCREEN_NAME, FA_SELECT_EXPENSES } from "@constants/strings";

import { commaAdder } from "@utils/dataModel/utility";

import Images from "@assets";

import LoadingWithLockComponent from "./LoadingWithLockComponent";
import DashboardViewPortAware from "./ViewPortAware";

const styles = StyleSheet.create({
    actionToExpense: {
        paddingHorizontal: 16,
    },
    dummyRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 8,
    },
    dummyRowIcon: {
        backgroundColor: GREY_200,
        borderRadius: 18,
        height: 36,
        width: 36,
    },
    dummyRowItems: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    dummyRowMain: {
        flex: 0.8,
        paddingHorizontal: 8,
    },
    dummyRowMainSecondary: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: "30%",
    },
    dummyRowMainTitle: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 4,
        width: "50%",
    },
    dummyRowSecondary: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        flex: 0.2,
        height: 8,
    },
    expensesCategoryCardTitle: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        marginBottom: 16,
        paddingBottom: 16,
    },
    expensesCategoryIcon: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 18,
        elevation: 12,
        height: 33,
        justifyContent: "center",
        marginRight: 6,
        overflow: "visible",
        padding: 1,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 33,
    },
    expensesCategoryIconImg: { height: 32, width: 32 },
    expensesCategoryIconWrapper: {
        alignItems: "center",
        borderRadius: 18,
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
    },
    expensesContainer: {
        flex: 1,
        paddingTop: 16,
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    expensesContainerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        padding: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    expensesContainerHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    expensesList: {
        paddingVertical: 8,
    },
    expensesListLessContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
        paddingHorizontal: 36,
    },
    expensesMeta: { flexDirection: "column" },
    expensesMetaTitle: {
        marginBottom: 4,
    },
    expensesRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    expensesRowContainerInner: {
        alignItems: "center",
        flexDirection: "row",
        flex: 0.65,
    },
    expensesUnavailableBg: { height: 270, width: "100%" },
    expensesUnavailableCard: {
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
    expensesUnavailableCardInner: {
        borderRadius: 8,
        overflow: "hidden",
    },
    expensesUnavailableTitle: { paddingBottom: 24, paddingHorizontal: 34, paddingTop: 40 },
});

function ExpenseRow({
    description,
    btsProductTypeCode,
    btsCategory,
    btsMerchant,
    btsSubCategory,
    amount,
    transactionDate,
}) {
    function getDescription() {
        if (btsProductTypeCode === "CASH_WALLET") return "CASH";
        if (description) return description;
        return "-";
    }

    function getBgColor() {
        if (btsMerchant) return btsMerchant?.colorCode;
        if (btsSubCategory) return btsSubCategory?.colorCode;
        if (btsCategory) return btsCategory?.colorCode;
        return WHITE;
    }

    function getImage() {
        if (btsMerchant) return btsMerchant?.image;
        if (btsSubCategory) return btsSubCategory?.image;
        if (btsCategory) return btsCategory?.image;
        return null;
    }

    return (
        <View style={styles.expensesRowContainer}>
            <View style={styles.expensesRowContainerInner}>
                <View style={styles.expensesCategoryIcon}>
                    <View
                        style={[
                            styles.expensesCategoryIconWrapper,
                            {
                                backgroundColor: getBgColor(),
                            },
                        ]}
                    >
                        {getImage() ? (
                            <Image
                                source={{
                                    uri: getImage(),
                                }}
                                style={styles.expensesCategoryIconImg}
                            />
                        ) : (
                            <View
                                style={[styles.expensesCategoryIconImg, { backgroundColor: GREY }]}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.expensesMeta}>
                    <Typo
                        textAlign="left"
                        fontSize={12}
                        fontWeight="600"
                        lineHeight={12}
                        text={getDescription()}
                        style={styles.expensesMetaTitle}
                        numberOfLines={1}
                    />
                    <Typo
                        textAlign="left"
                        fontSize={12}
                        fontWeight="normal"
                        lineHeight={12}
                        text={moment(transactionDate, "YYYY-MM-DD HH:mm:ss.0").format("DD/MM/YYYY")}
                        color={DARK_GREY}
                    />
                </View>
            </View>
            <View>
                <Typo
                    textAlign="right"
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={15}
                    text={`${Math.sign(amount) === -1 && "-"}RM ${commaAdder(
                        Math.abs(amount).toFixed(2)
                    )}`}
                    color={amount < 0 ? RED : GREEN}
                />
            </View>
        </View>
    );
}

ExpenseRow.propTypes = {
    btsCategory: PropTypes.object,
    btsSubCategory: PropTypes.object,
    btsMerchant: PropTypes.object,
    description: PropTypes.string,
    btsProductTypeCode: PropTypes.string,
    transactionDate: PropTypes.string,
    amount: PropTypes.number,
};

function DummyRow() {
    return (
        <View style={styles.dummyRowContainer}>
            <View style={styles.dummyRowIcon} />
            <View style={styles.dummyRowItems}>
                <View style={styles.dummyRowMain}>
                    <View style={styles.dummyRowMainTitle} />
                    <View style={styles.dummyRowMainSecondary} />
                </View>
                <View style={styles.dummyRowSecondary} />
            </View>
        </View>
    );
}

function DummyExpense({ handleGoToExpenses }) {
    return (
        <TouchableSpring onPress={handleGoToExpenses}>
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
                    <View style={styles.expensesContainerCard}>
                        <View style={styles.expensesCategoryCardTitle}>
                            <Typo
                                textAlign="left"
                                fontSize={14}
                                fontWeight="normal"
                                lineHeight={18}
                                text="Total spending: "
                            />
                            <Typo
                                textAlign="left"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="RM****"
                            />
                        </View>
                        <View>
                            <Typo
                                textAlign="left"
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Top Expenses"
                            />
                            <View style={styles.expensesList}>
                                <DummyRow />
                                <DummyRow />
                                <View style={styles.expensesListLessContainer}>
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
                                        style={styles.actionToExpense}
                                        onPress={handleGoToExpenses}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

DummyExpense.propTypes = {
    handleGoToExpenses: PropTypes.func,
};

/**
 * Spending Summary
 */
function SpendingSummary({ isOnboard, isPostLogin, navigation, initialLoaded }) {
    const [loading, setLoading] = useState(false);
    const [expensesSummary, setExpenses] = useState({});
    const isUnmount = useRef(false);
    const [loaded, setLoaded] = useState(0);

    function handleGoToOnboard() {
        logEvent(FA_SELECT_EXPENSES, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "Spending Summary",
        });
        navigation.navigate("Onboarding", {
            screen: "OnboardingStart",
        });
    }

    async function handleDashboardAuth() {
        if (!isOnboard) handleGoToOnboard();
        else if (!isPostLogin) {
            try {
                await invokeL2(false);
            } catch (error) {
                // do nothing
            }
        } else {
            logEvent(FA_SELECT_EXPENSES, {
                [FA_SCREEN_NAME]: "Dashboard",
                [FA_FIELD_INFORMATION]: "Spending Summary",
            });

            handleGoToExpenses();
        }
    }

    // separated just for the sake of analytics
    const handleViewAll = useCallback(() => {
        logEvent(FA_SELECT_EXPENSES, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "View All",
        });
        handleGoToExpenses();
    }, []);

    function handleGoToExpenses() {
        navigation.navigate("Expenses");
    }

    const showEmptyState = useCallback(() => {
        return (!loading && !isOnboard) || (isPostLogin && !expensesSummary?.haveExpenses);
    }, [loading, isOnboard, expensesSummary, isPostLogin]);

    const getExpenses = useCallback(async () => {
        setExpenses(null);

        // call api
        if (isOnboard && !isUnmount.current) {
            const path = `/pfm/creditCard/transaction/history/weekly`;

            setLoading(true);

            try {
                const response = await pfmGetData(path, false, false);

                if (response?.data?.topTransactions) {
                    const { totalAmount, topTransactions, weeklyIndicator } = response.data;

                    if (topTransactions.length) {
                        !isUnmount.current &&
                            setExpenses({
                                totalAmount,
                                topTransactions,
                                weeklyIndicator,
                                haveExpenses: true,
                            });
                    } else {
                        !isUnmount.current &&
                            setExpenses((prev) => ({ ...prev, haveExpenses: false }));
                    }
                }
            } catch (error) {
                !isUnmount.current && setExpenses((prev) => ({ ...prev, haveExpenses: false }));
            } finally {
                !isUnmount.current && setLoading(false);
            }
        }
    }, [isOnboard, isUnmount]);

    const _handleViewportEnter = () => {
        if (loaded !== initialLoaded && isOnboard) {
            isUnmount.current = false;
            setLoaded(initialLoaded);
            getExpenses();
        }
        return () => {
            isUnmount.current = true;
        };
    };

    return (
        <DashboardViewPortAware callback={_handleViewportEnter} preTriggerRatio={0.1}>
            <View style={styles.expensesContainer}>
                {isOnboard && (
                    <View>
                        {expensesSummary && (
                            <View style={styles.expensesContainerHeading}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Spending Summary"
                                />
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
                        )}
                        {loading && (
                            <LoadingWithLockComponent type="expenses" isPostLogin={isPostLogin} />
                        )}
                        {!loading && !isPostLogin && (
                            <DummyExpense handleGoToExpenses={handleDashboardAuth} />
                        )}
                        {!loading && expensesSummary?.haveExpenses && isPostLogin && (
                            <TouchableSpring onPress={handleDashboardAuth}>
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
                                        <View style={styles.expensesContainerCard}>
                                            <View style={styles.expensesCategoryCardTitle}>
                                                <Typo
                                                    textAlign="left"
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    lineHeight={18}
                                                    text={
                                                        expensesSummary.weeklyIndicator === "M"
                                                            ? "Total monthly spending: "
                                                            : expensesSummary.weeklyIndicator ===
                                                              "W"
                                                            ? "This week's spending: "
                                                            : "Last month's spending: "
                                                    }
                                                />
                                                <Typo
                                                    textAlign="left"
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    text={`RM ${commaAdder(
                                                        Math.abs(
                                                            expensesSummary.totalAmount
                                                        ).toFixed(2)
                                                    )}`}
                                                />
                                            </View>
                                            <View>
                                                <Typo
                                                    textAlign="left"
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={19}
                                                    text="Top Expenses"
                                                />
                                                <View style={styles.expensesList}>
                                                    {expensesSummary.topTransactions.map(
                                                        (expense) => (
                                                            <ExpenseRow
                                                                key={expense.btsId}
                                                                {...expense}
                                                            />
                                                        )
                                                    )}
                                                    {expensesSummary.topTransactions.length < 3 && (
                                                        <View
                                                            style={styles.expensesListLessContainer}
                                                        >
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="normal"
                                                                lineHeight={14}
                                                                text="Spend more and this space will track your money's activity."
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </Animated.View>
                                )}
                            </TouchableSpring>
                        )}
                    </View>
                )}

                {!isOnboard && loading && (
                    <LoadingWithLockComponent type="expenses" isPostLogin={false} />
                )}

                {showEmptyState() && (
                    <TouchableSpring onPress={!isOnboard ? handleGoToOnboard : handleGoToExpenses}>
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
                                <View style={styles.expensesUnavailableCard}>
                                    <View style={styles.expensesUnavailableCardInner}>
                                        <View style={styles.expensesUnavailableTitle}>
                                            <Typo
                                                fontSize={16}
                                                fontWeight="normal"
                                                lineHeight={18}
                                                text="Start spending and this space will reflect your money's activity."
                                            />
                                        </View>
                                        <Image
                                            source={Images.dashboardTrackerEmptyBg}
                                            resizeMode="cover"
                                            style={styles.expensesUnavailableBg}
                                        />
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                    </TouchableSpring>
                )}
            </View>
        </DashboardViewPortAware>
    );
}

SpendingSummary.propTypes = {
    isPostLogin: PropTypes.bool,
    initialLoaded: PropTypes.number,
    isOnboard: PropTypes.bool,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};

export default SpendingSummary;

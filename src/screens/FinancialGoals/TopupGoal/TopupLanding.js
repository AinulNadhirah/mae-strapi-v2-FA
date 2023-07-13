import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, FlatList } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_TOPUP_GOAL_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getGoalMonetaryInfo } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, SHADOW_LIGHT, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_FIN_GOAL_TOPUP_TYPE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    TOPUP_GOAL,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

export default function TopupLanding({ navigation, route }) {
    const [result, setResult] = useState();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_TYPE,
            [FA_ACTION_NAME]: "Suggested Amount",
        });
    }, []);

    useEffect(() => {
        fetchTopupMonetary();
    }, [fetchTopupMonetary]);

    const fetchTopupMonetary = useCallback(async () => {
        try {
            const response = await getGoalMonetaryInfo(route?.params?.goalId, true);

            if (response?.data) {
                setResult(response?.data);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, [route?.params?.goalId]);

    const cardObject = [
        {
            title: "Minimum amount",
            amount: result?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.minValue ?? 0,
            onPress: () =>
                onPressCard(
                    result?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.minValue ?? 0,
                    "Minimum Amount"
                ),
        },
        {
            title: "Suggested amount",
            amount: result?.gbiMonthlyInvestmentModel?.shortFallAmt ?? 0,
            onPress: () =>
                onPressCard(
                    result?.gbiMonthlyInvestmentModel?.shortFallAmt ?? 0,
                    "Suggested Amount"
                ),
        },
        {
            title: "Preferred amount",
            amount: 0,
            onPress: () => onPressCard(null, "Any Amount"),
        },
    ];

    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function onPressCard(amount, gaAction) {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_GOAL_AMOUNT,
            params: {
                ...route?.params,
                amount,
                suggestedAmount: result?.gbiMonthlyInvestmentModel?.shortFallAmt,
                minAmount: result?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.minValue,
                maxAmount: result?.gbiMonthlyInvestmentModel?.otdMenuItemRangeDTO?.maxValue,
                utAccount: result?.unitTrustAccount,
                email: result?.gbiMonthlyInvestmentModel?.email,
                salesChargePrctg: result?.gbiMonthlyInvestmentModel?.otdSalesCharge,
                gstChargePrctg: result?.gbiMonthlyInvestmentModel?.gstChargePrctg ?? 0,
                govCharge: result?.govCharge ?? "",
            },
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_TYPE,
            [FA_ACTION_NAME]: gaAction,
        });
    }

    function renderCard({ item }) {
        return <TopupCard title={item?.title} amount={item?.amount} onPress={item?.onPress} />;
    }

    function keyExtractor(item, index) {
        return `${item?.title}-${index}`;
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
                                    text={TOPUP_GOAL}
                                />
                            }
                            headerLeftElement={
                                <View style={styles.headerCloseButtonContainer}>
                                    <HeaderBackButton onPress={_onHeaderBackButtonPressed} />
                                </View>
                            }
                            headerRightElement={
                                <HeaderCloseButton
                                    isWhite={false}
                                    onPress={_onHeaderBackButtonPressed}
                                />
                            }
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                        />
                    }
                    paddingHorizontal={24}
                    paddingBottom={0}
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View>
                        <Typo
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={20}
                            textAlign="left"
                            text="How much would you like to deposit to your investment goal funds?"
                        />
                    </View>
                    <FlatList
                        data={cardObject}
                        renderItem={renderCard}
                        keyExtractor={keyExtractor}
                    />
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

TopupLanding.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    item: PropTypes.object,
};

const TopupCard = ({ title, amount, onPress }) => {
    const tension = 70;
    const friction = 7;
    const cardAnimation = new Animated.Value(1);

    function onPressIn() {
        Animated.spring(cardAnimation, {
            toValue: 0.97,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    function onPressOut() {
        Animated.spring(cardAnimation, {
            toValue: 1,
            tension,
            friction,
            useNativeDriver: true,
        }).start();
    }

    return (
        <Animated.View
            style={[
                styles.topupCardContainer,
                {
                    transform: [
                        {
                            scale: cardAnimation,
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={onPress}
                style={styles.topupCardSubContainer}
            >
                <Typo
                    text={title}
                    fontWeight="400"
                    fontSize={14}
                    style={styles.topupCardText}
                    textAlign="left"
                />
                <Typo
                    text={`RM ${numberWithCommas(Number(amount).toFixed(2))}`}
                    fontWeight="600"
                    fontSize={14}
                    color={amount ? BLACK : ROYAL_BLUE}
                    style={styles.topupCardText}
                    textAlign="right"
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

TopupCard.propTypes = {
    title: PropTypes.string,
    amount: PropTypes.number,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    topupCardContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 3,
        marginTop: 20,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    topupCardSubContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 22,
        paddingVertical: 35,
    },
    topupCardText: {
        flex: 1,
    },
});

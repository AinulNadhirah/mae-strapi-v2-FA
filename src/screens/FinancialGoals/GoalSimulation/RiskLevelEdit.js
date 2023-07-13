import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, FlatList } from "react-native";

import { BANKINGV2_MODULE, GOAL_SIMULATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, SHADOW_LIGHT } from "@constants/colors";
import {
    DONE,
    GOAL_BASED_INVESTMENT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_FIELD_INFORMATION,
} from "@constants/strings";

import RiskProfilePopup from "../RiskProfile/RiskProfilePopup";

const tension = 40;
const friction = 7;

const styles = StyleSheet.create({
    boosterCardContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        marginBottom: 16,
        padding: 20,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    boosterCardTouch: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 8,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    subContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    subtitle: {
        paddingBottom: 15,
        paddingTop: 20,
    },
});

function RiskCard({ label, onPress, value, description, cardSelectedIs }) {
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

    function handlePress() {
        onPress({ value });
    }

    return (
        <Animated.View
            style={[
                styles.boosterCardContainer,
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
                onPress={handlePress}
            >
                <View style={styles.boosterCardTouch}>
                    <Typo
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                        text={label}
                    />

                    {value === cardSelectedIs ? (
                        <RadioChecked checkType="color" />
                    ) : (
                        <RadioUnchecked />
                    )}
                </View>
                <Typo
                    fontWeight="400"
                    fontSize={12}
                    lineHeight={18}
                    textAlign="left"
                    text={description}
                />
            </TouchableOpacity>
        </Animated.View>
    );
}

RiskCard.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onPress: PropTypes.func,
    cardSelectedIs: PropTypes.string,
    description: PropTypes.string,
};

function RiskLevelEdit({ navigation, route }) {
    const options = route?.params?.riskOptions ?? [];
    const gbiRiskLevel = route?.params?.riskLevel;
    const customerRiskLevel = route?.params?.customerRiskLevel;

    const riskToShownMatrix = (() => {
        // business requirement to show edit selection based on client risk level
        switch (customerRiskLevel) {
            case "1":
                return 1;
            case "2":
                return 3;
            case "3":
                return 4;
            case "4":
            case "5":
                return 5;
            default:
                break;
        }
    })();

    const displayRisk = (() => {
        return options.filter((_, index) => index < riskToShownMatrix);
    })();

    const [cardSelect, setCardSelect] = useState(gbiRiskLevel);
    const [showRiskPopUp, setShowRiskPopup] = useState(false);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_AdjustRiskLevel",
        });
    }, []);

    function handleGoTo({ value }) {
        setCardSelect(value);
    }

    function _onHeaderBackButtonPressed() {
        navigation.goBack();
    }

    function renderRiskItem({ item, index }) {
        return (
            <RiskCard
                key={index}
                onPress={handleGoTo}
                cardSelectedIs={cardSelect}
                value={item?.value}
                {...item}
            />
        );
    }

    renderRiskItem.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    function onCloseRiskPopup() {
        setShowRiskPopup(false);
    }

    function onPressDone() {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "FinancialGoals_AdjustRiskLevel",
            [FA_FIELD_INFORMATION]: cardSelect,
        });
        if (cardSelect > customerRiskLevel) {
            setShowRiskPopup(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: "FinancialGoals_UnderstandYourRisk",
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: GOAL_SIMULATION,
                params: {
                    gbiRiskLevel: cardSelect,
                    sliderValue: route?.params?.sliderValue,
                },
            });
        }
    }

    function keyExtractor(item, index) {
        return `${item?.title}-${index}`;
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={GOAL_BASED_INVESTMENT}
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
                >
                    <View style={styles.container}>
                        <View style={styles.subContainer}>
                            <Typo
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={18}
                                textAlign="left"
                                text="Adjust Risk Level"
                            />
                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={16}
                                textAlign="left"
                                style={styles.subtitle}
                                text="What level of risk are you willing to take for this goal?"
                            />

                            <FlatList
                                data={displayRisk}
                                renderItem={renderRiskItem}
                                keyExtractor={keyExtractor}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            onPress={onPressDone}
                            componentCenter={
                                <Typo fontSize={14} fontWeight="600" lineHeight={18} text={DONE} />
                            }
                            fullWidth
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
            <RiskProfilePopup
                visible={showRiskPopUp}
                riskLevel="Higher Risk"
                onClose={onCloseRiskPopup}
                navigation={navigation}
                navigationParams={{
                    gbiRiskLevel: cardSelect,
                    sliderValue: route?.params?.sliderValue,
                }}
            />
        </>
    );
}

RiskLevelEdit.propTypes = {
    getModel: PropTypes.func,
    itemDetails: PropTypes.object,
    props: PropTypes.object,
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default RiskLevelEdit;

import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import {
    BANKINGV2_MODULE,
    KICKSTART_PROMO,
    KICKSTART_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, WHITE, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    GOAL_BASED_INVESTMENT,
    RETIREMENT_GOAL,
    EDUCATION_GOAL,
    GROWTH_WEATH_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_CONTRIBUTINGTYPE,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
} from "@constants/strings";

const KickStartSelection = ({ navigation, route }) => {
    const title = (() => {
        switch (route.params?.goalType) {
            case "R":
                return RETIREMENT_GOAL;
            case "E":
                return EDUCATION_GOAL;
            case "W":
                return GROWTH_WEATH_GOAL;
        }
        //return RETIREMENT_GOAL;
    })();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_CONTRIBUTINGTYPE,
        });
    }, []);

    const monthlyAmt =
        route?.params?.from === KICKSTART_CONFIRMATION
            ? route?.params?.monthlyAmt
            : route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.monthlyAmt
            ? route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.monthlyAmt
            : route?.params?.monthlyDeposit;

    const startDate =
        route?.params?.from === KICKSTART_CONFIRMATION
            ? route?.params?.startDate
            : route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate
            ? moment(
                  route?.params?.gbiInfoDetail?.gbiMonthlyInvestmentModel?.startDate,
                  "YYYY-MM-DD"
              )
            : "";

    const defaultSelection = (() => {
        if (route?.params?.selectionType?.transactionType === "Monthly Auto Deposit") {
            return 0;
        } else if (route?.params?.selectionType?.transactionType === "One Time Deposit") {
            return 1;
        } else return 0;
    })();

    const [selected, setSelected] = useState(defaultSelection);

    function onPressClose() {
        navigation.pop(3);
    }

    function onPressBack() {
        navigation.goBack();
    }

    function onPressCard(index) {
        setSelected(index);
    }

    function onPressContinue() {
        const selectionType = (() => {
            if (selected === 0) {
                return {
                    transactionType: "Monthly Auto Deposit",
                    fieldInfo: "Auto Deduction",
                };
            } else {
                return {
                    transactionType: "One Time Deposit",
                    fieldInfo: "One Time Deposit",
                };
            }
        })();

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_CONTRIBUTINGTYPE,
            [FA_FIELD_INFORMATION]: selectionType.fieldInfo,
        });

        if (route?.params?.from) {
            navigation.pop();
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.from,
                params: {
                    selectionType,
                },
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: KICKSTART_PROMO,
                params: {
                    selectionType,
                    monthlyAmt,
                    ...route?.params,
                },
            });
        }
    }
    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerRightElement={
                            route?.params?.from !== KICKSTART_CONFIRMATION ? (
                                <HeaderCloseButton onPress={onPressClose} />
                            ) : (
                                <></>
                            )
                        }
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={
                            <Typo
                                text={GOAL_BASED_INVESTMENT}
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView style={styles.container}>
                    <Typo text={title} fontWeight="600" fontSize={14} textAlign="left" />
                    <Typo
                        text="How much would you like to start contributing to this goal?"
                        fontWeight="400"
                        fontSize={14}
                        textAlign="left"
                        style={styles.question}
                    />
                    <SelectionItem
                        title="Auto Deduction"
                        description="Never worry about forgetting to save for your goal again. You can switch it off to pause your auto-deposits at any time, with no additional charges."
                        subtitle={`RM ${numeral(monthlyAmt).format("0,0.00")} / Monthly`}
                        subtitle2={`First deduction will start on ${moment(startDate).format(
                            "DD MMM YYYY"
                        )}`}
                        selected={selected === 0}
                        // eslint-disable-next-line react/jsx-no-bind
                        onPressCard={() => onPressCard(0)}
                    />
                    <SelectionItem
                        title="One Time Deposit"
                        description="I would like to make a one-off deposit and top up at a later time."
                        subtitle={`RM ${numeral(route?.params?.deposit).format("0,0.00")}`}
                        selected={selected === 1}
                        // eslint-disable-next-line react/jsx-no-bind
                        onPressCard={() => onPressCard(1)}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressContinue}
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo text={CONTINUE} fontWeight="600" fontSize={14} color={BLACK} />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

KickStartSelection.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const SelectionItem = ({ selected, title, description, subtitle, subtitle2, onPressCard }) => {
    return (
        <TouchableOpacity style={styles.selectionItemContainer} onPress={onPressCard}>
            <View style={styles.selectionItemTitle}>
                <Typo text={title} fontSize={14} fontWeight="600" textAlign="left" />
                {selected ? (
                    <RadioChecked checkType="color" />
                ) : (
                    <RadioUnchecked checkType="color" />
                )}
            </View>
            <Typo
                text={description}
                fontSize={12}
                fontWeight="400"
                lineHeight={18}
                textAlign="left"
            />
            <Typo
                text={subtitle}
                fontSize={12}
                fontWeight="600"
                lineHeight={20}
                textAlign="left"
                style={styles.selectionItemSubtitle}
            />
            {subtitle2 && (
                <Typo
                    text={subtitle2}
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={20}
                    textAlign="left"
                />
            )}
        </TouchableOpacity>
    );
};

SelectionItem.propTypes = {
    selected: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    subtitle: PropTypes.string,
    subtitle2: PropTypes.string,
    onPressCard: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    question: {
        paddingVertical: 24,
    },
    selectionItemContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 18,
        padding: 24,
        shadowOffset: {
            shadowColor: "rgba(0, 0, 0, 0.8)",
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
    },
    selectionItemSubtitle: {
        paddingTop: 25,
    },
    selectionItemTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 8,
    },
});

export default KickStartSelection;

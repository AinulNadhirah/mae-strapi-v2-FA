import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BANKINGV2_MODULE, INVESTMENT_SAVINGS_CONTRIBUTION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getCommonParam } from "@services";
import { logEvent } from "@services/analytics";

import { COMMON_ERROR_MSG, CONTINUE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import assets from "@assets";

export default function ExistingInvestmentSavingsEntry({ navigation, route }) {
    const { bottom } = useSafeAreaInsets();
    const screenType = route?.params?.screenType;
    const [isLoading, setIsLoading] = useState(false);
    const [rate, setRate] = useState("");
    const [screenName, setScreenName] = useState(null);
    const screenObject = {
        existSaving: {
            header: "Include Existing Savings",
            image: assets.existSaving,
            title: `Improve your chances of reaching your financial goals faster by including the current value & monthly growth of your savings.
            \nThe calculation assumes an interest rate of ${rate} based on the average Fixed Deposit rate of the top 8 banks in Malaysia as of 2020.`,
            subtitle:
                "Kindly take note that the figures you provide will be used solely for calculation purposes.",
            onPressContinue: onPressContinueExistSaving,
        },
        existInvestment: {
            header: "Include Existing Investments",
            image: assets.existInvestment,
            title: `Improve your chances of reaching your financial goals faster by including the current value & monthly growth of your investments.
                    \nThis calculation factors in the estimated return of your investments and the values are taken into consideration for your entire plan. The calculation assumes a ${rate} annual return.`,
            subtitle:
                "Kindly take note that the figures  you provide will be used solely for calculation purposes.",
            onPressContinue: onPressContinueExistInvestment,
        },
    };

    useEffect(() => {
        getOtherSourcesRate();
    }, [getOtherSourcesRate]);

    const getOtherSourcesRate = useCallback(async () => {
        const param = route?.params?.screenType === "existSaving" ? "SAV_R" : "INV_R";
        try {
            setIsLoading(true);
            const response = await getCommonParam(param, false);
            if (response?.data) {
                setRate(
                    response?.data[0]?.paramValue
                        ? numeral(response?.data[0]?.paramValue * 100).format("0,0.00") + "%"
                        : 0 + "%"
                );
                setIsLoading(false);
            } else {
                setIsLoading(false);
                showErrorToast({ message: "Something went wrong, please try again" });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }, []);

    useEffect(() => {
        const screenName = (() => {
            if (route?.params?.goalType === "E" && route?.params?.fundsFor === "myself") {
                if (screenType === "existSaving") {
                    return "FinancialGoals_Education_ExistingSavings";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_Education_ExistingInvestments";
                }
            } else if (route?.params?.goalType === "E" && route?.params?.fundsFor === "child") {
                if (screenType === "existSaving") {
                    return "FinancialGoals_EducationChild_ExistingSavings";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_EducationChild_ExistingInvestments";
                }
            } else {
                if (screenType === "existSaving") {
                    return "FinancialGoals_Wealth_ExistingSavings";
                } else if (screenType === "existInvestment") {
                    return "FinancialGoals_Wealth_ExistingInvestments";
                }
            }
        })();

        setScreenName(screenName);
    }, []);

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onPressContinueExistSaving() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: INVESTMENT_SAVINGS_CONTRIBUTION,
            params: {
                ...route?.params,
                screenType: "existSaving",
            },
        });
    }

    function onPressContinueExistInvestment() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: INVESTMENT_SAVINGS_CONTRIBUTION,
            params: {
                ...route?.params,
                screenType: "existInvestment",
            },
        });
    }

    return (
        <ScreenContainer backgroundType="image" analyticScreenName={screenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={screenObject?.[screenType]?.header}
                            />
                        }
                        headerLeftElement={
                            <HeaderBackButton onPress={onBackButtonPress} testID="go_back" />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={bottom}
            >
                {isLoading && (
                    <View style={styles.loader}>
                        <ScreenLoader showLoader />
                    </View>
                )}
                {!isLoading && (
                    <>
                        <View style={styles.viewFlexStyles}>
                            <View style={styles.centerStyle}>
                                <Image source={screenObject?.[screenType]?.image} />
                            </View>

                            <SpaceFiller height={24} />

                            <Typo
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={22}
                                textAlign="left"
                                text={screenObject?.[screenType]?.title}
                            />

                            <SpaceFiller height={24} />

                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={22}
                                textAlign="left"
                                text={screenObject?.[screenType]?.subtitle}
                            />
                        </View>
                        <FixedActionContainer>
                            <ActionButton
                                onPress={screenObject?.[screenType]?.onPressContinue}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={CONTINUE}
                                    />
                                }
                                fullWidth
                            />
                        </FixedActionContainer>
                    </>
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
}

ExistingInvestmentSavingsEntry.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    centerStyle: { alignItems: "center", flexDirection: "column" },
    loader: {
        alignSelf: "center",
        flex: 1,
        justifyContent: "center",
    },
    viewFlexStyles: { flex: 1, paddingHorizontal: 24 },
});

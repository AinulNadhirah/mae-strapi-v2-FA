import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";

import {
    BANKINGV2_MODULE,
    GOAL_SIMULATION,
    RISK_PROFILE_QUESTION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { saveRiskQuestionnaire } from "@services";
import { logEvent } from "@services/analytics";

import { WHITE, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    FA_FIELD_INFORMATION,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    RETAKE_THE_TEST,
    RISK_PROFILE_TEST,
} from "@constants/strings";

import assets from "@assets";

const RiskProfileResult = ({ navigation, route }) => {
    const [resultObject, setResultObject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_RiskProfileTest_Results",
        });
    }, []);

    useEffect(() => {
        fetchQuestionnaireResult();
    }, [fetchQuestionnaireResult]);

    const fetchQuestionnaireResult = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await saveRiskQuestionnaire(route?.params?.totalAnswerObject, true);
            if (response?.data) {
                setIsLoading(false);
                const image = (() => {
                    switch (response?.data?.riskProfilingScores) {
                        case "1":
                            return assets.riskConservative;
                        case "2":
                            return assets.riskModerateConservative;
                        case "3":
                            return assets.riskBalance;
                        case "4":
                            return assets.riskModerateAggressive;
                        case "5":
                            return assets.riskAggressive;
                    }
                })();

                const result = {
                    title: response?.data?.riskProfileName,
                    desc: response?.data?.riskProfileDesc,
                    scores: response?.data?.riskProfilingScores,
                    image,
                };

                setResultObject(result);

                logEvent(FA_FORM_COMPLETE, {
                    [FA_SCREEN_NAME]: "FinancialGoals_RiskProfileTest_Results",
                    [FA_FIELD_INFORMATION]: response?.data?.riskProfileName,
                });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message });
        }
    }, [route?.params?.totalAnswerObject]);

    function onPressRetake() {
        // remove questionaire related params on retake
        const newParams = Object.keys(route?.params)
            .filter(
                (key) =>
                    !key.includes("totalAnswerObject") &&
                    !key.includes("currentQuestionNo") &&
                    !key.includes("totalQuestionObject")
            )
            .reduce((cur, key) => {
                return Object.assign(cur, { [key]: route?.params[key] });
            }, {});

        navigation.push(BANKINGV2_MODULE, {
            screen: RISK_PROFILE_QUESTION,
            params: {
                ...newParams,
            },
        });
    }

    function onPressContinue() {
        // filter route params not needed to bring forward, but keep route params in this page for navigation purposes
        const filterRouteParams = Object.keys(route?.params)
            .filter((key) => !key.includes("fromScreen") && !key.includes("showPopup"))
            .reduce((cur, key) => {
                return Object.assign(cur, { [key]: route?.params[key] });
            }, {});

        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
            params: {
                ...filterRouteParams,
                gbiRiskLevel: resultObject?.scores,
                customerRiskLevel: resultObject?.scores,
            },
        });
    }

    function onPressClose() {
        if (route?.params?.fromScreen) {
            navigation.pop(8);
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.fromScreen,
                params: {
                    ...route?.params,
                    showPopup: true,
                    customerRiskLevel: route?.params?.customerRiskLevel,
                },
            });
        }
    }

    if (isLoading) {
        return <ScreenLoader showLoader={isLoading} />;
    } else {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={<HeaderLabel>{RISK_PROFILE_TEST}</HeaderLabel>}
                            headerRightElement={<HeaderCloseButton onPress={onPressClose} />}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={styles.container}>
                        <View>
                            <View style={styles.imageContainer}>
                                <Image source={resultObject?.image} style={styles.image} />
                            </View>
                            <Typo
                                text={`Your current risk profile is ${resultObject?.title}`}
                                textAlign="left"
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={20}
                            />
                            <Typo
                                text={resultObject?.desc}
                                textAlign="left"
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={20}
                                style={styles.description}
                            />
                        </View>
                    </View>
                    <FixedActionContainer>
                        <View style={styles.actionButtonContainer}>
                            <ActionButton
                                backgroundColor={WHITE}
                                borderRadius={24}
                                height={50}
                                fullWidth
                                style={styles.button}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={RETAKE_THE_TEST}
                                    />
                                }
                                onPress={onPressRetake}
                            />
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={24}
                                height={50}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text={CONTINUE}
                                    />
                                }
                                onPress={onPressContinue}
                            />
                        </View>
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
};

RiskProfileResult.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    button: {
        marginBottom: 20,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    description: {
        paddingTop: 16,
    },
    image: {
        alignSelf: "center",
    },
    imageContainer: {
        paddingVertical: 24,
    },
    actionButtonContainer: {
        flex: 1,
    },
});

export default RiskProfileResult;

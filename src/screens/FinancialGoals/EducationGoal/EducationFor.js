import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_EDUCATION_CHILD_INFO,
    FINANCIAL_EDUCATION_FUND_YEAR,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { goalMiscData } from "@services";

import { RED } from "@constants/colors";
import {
    EDUCATION_FIND_MYCHILD_ERROR,
    EDUCATION_FUND_CREATION_FOR,
    EDUCATION_FUND_MYSELF_ERROR,
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    FA_FIN_GOAL_EDU_TYPE,
    COMMON_ERROR_MSG,
} from "@constants/strings";

const EducationFor = ({ navigation, route }) => {
    const { updateModel } = useModelController();

    const SELECTION = {
        MYSELF: "Myself",
        MYCHILD: "My Child",
    };

    const [fundFor, setFundFor] = useState(SELECTION.MYSELF);
    const [showMyselfErrorMessage, setShowMySelfErrorMessage] = useState(false);
    const [showMychildErrorMessage, setShowMychildErrorMessage] = useState(false);
    const [maxCountHit, setMaxCountHit] = useState(false);

    useEffect(() => {
        fetchMiscData(fundFor);
    }, [fetchMiscData, fundFor]);

    const fetchMiscData = useCallback(
        async (fundForVal) => {
            try {
                const response = await goalMiscData(
                    fundForVal === SELECTION.MYSELF ? "Emyself" : "Echild",
                    true
                );
                if (response?.data?.menuItemRangeDTOs) {
                    updateModel({
                        financialGoal: {
                            educationData: response?.data?.menuItemRangeDTOs,
                        },
                    });
                }

                if (response?.data) {
                    setMaxCountHit(response?.data?.maxCountHit ?? false);
                }
            } catch (error) {
                showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
            }
        },
        [SELECTION.MYSELF, updateModel]
    );

    function onPressBack() {
        navigation.goBack();
    }

    function onNavigateNext() {
        const fundForParamKey = (() => {
            return fundFor === SELECTION.MYCHILD ? "child" : "myself";
        })();

        if (fundFor === SELECTION.MYCHILD) {
            if (maxCountHit) {
                setShowMychildErrorMessage(true);
                setShowMySelfErrorMessage(false);
                return;
            }
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FINANCIAL_EDUCATION_CHILD_INFO,
                params: {
                    fundsFor: fundForParamKey,
                    goalType: "E",
                },
            });
        } else {
            if (maxCountHit) {
                setShowMySelfErrorMessage(true);
                setShowMychildErrorMessage(false);
                return;
            }
            navigation.navigate(BANKINGV2_MODULE, {
                screen: FINANCIAL_EDUCATION_FUND_YEAR,
                params: {
                    fundsFor: fundForParamKey,
                    goalType: "E",
                },
            });
        }
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={FA_FIN_GOAL_EDU_TYPE}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo
                        text={EDUCATION_GOAL}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={24}
                        textAlign="left"
                        style={styles.title}
                    />
                    <Typo
                        text={EDUCATION_FUND_CREATION_FOR}
                        fontWeight="400"
                        fontSize={14}
                        style={styles.subtitle}
                        textAlign="left"
                    />
                    <ColorRadioButton
                        title={SELECTION.MYSELF}
                        onRadioButtonPressed={setFundFor}
                        isSelected={fundFor === SELECTION.MYSELF}
                    />
                    {showMyselfErrorMessage && (
                        <Typo
                            style={styles.errorMessage}
                            textAlign="left"
                            fontWeight="500"
                            text={EDUCATION_FUND_MYSELF_ERROR}
                        />
                    )}
                    <ColorRadioButton
                        title={SELECTION.MYCHILD}
                        onRadioButtonPressed={setFundFor}
                        isSelected={fundFor === SELECTION.MYCHILD}
                    />
                    {showMychildErrorMessage && (
                        <Typo
                            style={styles.errorMessage}
                            textAlign="left"
                            fontWeight="500"
                            text={EDUCATION_FIND_MYCHILD_ERROR}
                        />
                    )}
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onNavigateNext}
                        componentCenter={<Typo text="Next" fontWeight="600" fontSize={14} />}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    errorMessage: {
        color: RED,
        paddingTop: 5,
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
});

EducationFor.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default EducationFor;

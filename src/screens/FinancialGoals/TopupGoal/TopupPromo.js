import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_TOPUP_CONFIRMATION,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, WHITE, YELLOW } from "@constants/colors";
import { CONTINUE, SKIP, TOPUP_GOAL, TOPUP_PROMO_PLACEHOLDER } from "@constants/strings";

import { getGoalTitle } from "@utils/dataModel/utilityFinancialGoals";

const TopupPromo = ({ navigation, route }) => {
    const [promo, setPromo] = useState(route?.params?.promo ?? null);

    function onPressBack() {
        navigation.goBack();
    }

    function onChangeText(val) {
        setPromo(val);
    }

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_CONFIRMATION,
            params: {
                ...route?.params,
                promo,
            },
        });
    }

    function onPressSkip() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_TOPUP_CONFIRMATION,
            params: {
                ...route?.params,
                promo: null,
            },
        });
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
        });
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{TOPUP_GOAL}</HeaderLabel>}
                        headerRightElement={<HeaderCloseButton onPress={onCloseButtonPress} />}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo
                        text={getGoalTitle(route?.params?.goalType)}
                        fontWeight="600"
                        fontSize={14}
                        textAlign="left"
                    />
                    <Typo
                        text="If you have a promo code, please enter it in the field below"
                        fontWeight="400"
                        textAlign="left"
                        lineHeight={20}
                        style={styles.question}
                    />
                    <TextInput
                        value={promo}
                        onChangeText={onChangeText}
                        placeholder={TOPUP_PROMO_PLACEHOLDER}
                    />
                </View>
                <FixedActionContainer>
                    <View style={styles.buttonContainer}>
                        <ActionButton
                            fullWidth
                            onPress={onPressSkip}
                            backgroundColor={WHITE}
                            style={styles.skipButton}
                            componentCenter={
                                <Typo text={SKIP} fontWeight="600" fontSize={14} color={BLACK} />
                            }
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <ActionButton
                            fullWidth
                            onPress={onPressContinue}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={CONTINUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    color={BLACK}
                                />
                            }
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

TopupPromo.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: "46%",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    question: {
        paddingTop: 24,
    },
    skipButton: {
        borderWidth: 1,
    },
});

export default TopupPromo;

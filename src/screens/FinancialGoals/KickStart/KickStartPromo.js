import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, KICKSTART_CONFIRMATION } from "@navigation/navigationConstant";

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

import { logEvent } from "@services/analytics";

import { BLACK, WHITE, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    GOAL_BASED_INVESTMENT,
    SKIP,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_PROMOCODE,
    FA_FORM_PROCEED,
    FA_COUPON,
    TOPUP_PROMO_PLACEHOLDER,
} from "@constants/strings";

import { getGoalTitle } from "@utils/dataModel/utilityFinancialGoals";

const KickStartPromo = ({ navigation, route }) => {
    const title = getGoalTitle(route?.params?.goalType);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_PROMOCODE,
        });
    }, []);

    const [promo, setPromo] = useState(route?.params?.promo ?? null);

    function onPressBack() {
        navigation.goBack();
    }

    function onPressClose() {
        navigation.pop(4);
    }

    function onChangeText(val) {
        setPromo(val === "" ? null : val);
    }

    function onPressContinue() {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_PROMOCODE,
            [FA_COUPON]: promo,
        });

        if (route?.params?.from) {
            navigation.pop();
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.from,
                params: { promo },
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: KICKSTART_CONFIRMATION,
                params: {
                    promo,
                    ...route?.params,
                },
            });
        }
    }

    function onPressSkip() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: KICKSTART_CONFIRMATION,
            params: {
                ...route?.params,
            },
        });
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
                        headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo text={title} fontWeight="600" fontSize={14} textAlign="left" />
                    <Typo
                        text="If you have a promo code, please enter it in the field below"
                        fontWeight="400"
                        textAlign="left"
                        lineHeight={20}
                        style={styles.question}
                    />
                    <TextInput
                        value={promo}
                        placeholder={TOPUP_PROMO_PLACEHOLDER}
                        onChangeText={onChangeText}
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

KickStartPromo.propTypes = {
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

export default KickStartPromo;

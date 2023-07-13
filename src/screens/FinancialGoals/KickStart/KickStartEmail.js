import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    KICKSTART_DEPOSIT,
    KICKSTART_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { getGoalMonetaryInfo } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, RED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    EDUCATION_GOAL,
    GOAL_BASED_INVESTMENT,
    GROWTH_WEATH_GOAL,
    RETIREMENT_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_STARTINVEST_EMAIL,
} from "@constants/strings";

import { validateEmail } from "@utils/dataModel";

const KickStartEmail = ({ navigation, route }) => {
    const [email, setEmail] = useState(route?.params?.email ?? null);
    const [buttonEnabled, setButtonEnabled] = useState(route?.params?.email ?? false);
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gbiInfoDetail, setGbiInfoDetail] = useState("");

    function onPressClose() {
        navigation.pop(1);
    }
    function onPressBack() {
        navigation.goBack();
    }

    useEffect(() => {
        fetchGoalMonetaryInfo();
    }, [fetchGoalMonetaryInfo]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_STARTINVEST_EMAIL,
        });
    }, []);

    const title = (() => {
        switch (route.params?.goalType) {
            case "R":
                return RETIREMENT_GOAL;
            case "E":
                return EDUCATION_GOAL;
            case "W":
                return GROWTH_WEATH_GOAL;
        }
    })();

    const fetchGoalMonetaryInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getGoalMonetaryInfo(route?.params?.goalId, false);
            setIsLoading(false);
            if (response?.data) {
                setGbiInfoDetail(response?.data);
                if (response?.data?.gbiMonthlyInvestmentModel?.email) {
                    if (email == null) {
                        onEmailChanged(response.data.gbiMonthlyInvestmentModel?.email);
                    }
                }
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message });
        }
    }, []);

    function onEmailChanged(val) {
        setEmail(val);
        setButtonEnabled(val);
    }

    function onPressContinue() {
        if (validateEmail(email)) {
            setShowError(false);
            if (route?.params?.from) {
                // edit mode from kick start confirmation
                navigation.pop();
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: route?.params?.from,
                    params: {
                        email,
                    },
                });
            } else {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: KICKSTART_DEPOSIT,
                    params: {
                        email,
                        initialDeposit: route?.params?.initialDeposit,
                        monthlyDeposit: route?.params?.monthlyDeposit,
                        gbiInfoDetail,
                        ...route?.params,
                    },
                });
            }
        } else {
            setShowError(true);
            return;
        }
    }
    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ScreenLoader showLoader />
            </View>
        );
    } else {
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
                    <View style={styles.container}>
                        <Typo
                            text={title}
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={24}
                            textAlign="left"
                            style={styles.title}
                        />
                        <Typo
                            text="Please ensure your email address is correct and current."
                            fontWeight="400"
                            fontSize={14}
                            textAlign="left"
                        />
                        <TextInput
                            value={email}
                            onChangeText={onEmailChanged}
                            fontWeight="600"
                            fontSize={12}
                        />
                        {showError && (
                            <Typo
                                text="Please enter your email addresss in format: yourname@example.com"
                                fontSize={12}
                                color={RED}
                                fontWeight="400"
                                textAlign="left"
                                style={styles.error}
                            />
                        )}
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={onPressContinue}
                            backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    text={CONTINUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
};

KickStartEmail.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    error: {
        paddingTop: 10,
    },
    loader: {
        alignSelf: "center",
        flex: 1,
        justifyContent: "center",
    },
    title: {
        paddingBottom: 15,
    },
});

export default KickStartEmail;

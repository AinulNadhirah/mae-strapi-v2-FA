import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BANKINGV2_MODULE, RISK_PROFILE_QUESTION } from "@navigation/navigationConstant";

import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { GREY, WHITE, YELLOW } from "@constants/colors";
import {
    DO_LATER,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    LET_BEGIN,
    RISK_PROFILE_TEST,
} from "@constants/strings";

import assets from "@assets";

const RiskProfileTestEntry = ({ navigation, route }) => {
    const { bottom, top } = useSafeAreaInsets();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_RiskProfileTest",
        });
    }, []);

    function onPressLater() {
        if (route?.params?.fromScreen) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route?.params?.fromScreen,
                params: {
                    showPopup: true,
                    customerRiskLevel: route?.params?.customerRiskLevel,
                    ...route?.params,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    async function onPressBegin() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: RISK_PROFILE_QUESTION,
            params: {
                ...route?.params,
            },
        });
    }

    return (
        <View style={[styles.container, { paddingBottom: bottom, marginTop: -(top + 50) }]}>
            <View>
                <Image source={assets.riskProfileStart} style={styles.image} />
                <Typo
                    text={RISK_PROFILE_TEST}
                    fontWeight="600"
                    fontSize={16}
                    style={styles.title}
                />
                <Typo
                    text="Before we proceed, please take a risk profiling test to allow us to determine how much risk you're comfortable with and can afford to take. "
                    fontWeight="400"
                    fontSize={12}
                    style={styles.subtitle}
                />
            </View>
            <View style={[styles.buttonContainer, { paddingBottom: !bottom && 20 }]}>
                <TouchableOpacity style={styles.leftButton} onPress={onPressLater}>
                    <Typo text={DO_LATER} fontWeight="bold" fontSize={14} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rightButton} onPress={onPressBegin}>
                    <Typo text={LET_BEGIN} fontWeight="bold" fontSize={14} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    image: {
        height: "70%",
        resizeMode: "contain",
        width: "100%",
    },
    leftButton: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 24,
        borderWidth: 1,
        flex: 1,
        marginRight: 10,
        paddingVertical: 18,
    },
    rightButton: {
        backgroundColor: YELLOW,
        borderRadius: 24,
        flex: 1,
        marginLeft: 10,
        paddingVertical: 18,
    },
    subtitle: {
        lineHeight: 20,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    title: {
        paddingTop: 50,
    },
});

RiskProfileTestEntry.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default RiskProfileTestEntry;

import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { logEvent } from "@services/analytics";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { FA_SCREEN_NAME, FA_S2U_ENABLED, FA_VIEW_SCREEN } from "@constants/strings";

import Images from "@assets";

const animateFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function Success({ navigation, route, getModel }) {
    const timer = useRef();
    const {
        misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
        s2w: { txnTypeList },
    } = getModel(["misc", "s2w"]);

    /**
     * Added for Raya s2w
     * S2W chances earned checkers
     */
    const checkForEarnedChances = useCallback(async () => {
        console.log("[PaybillsAcknowledgeScreen] >> [checkForEarnedChances]");

        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        timer.current && clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            if ((isCampaignPeriod || isTapTasticReady) && txnTypeList.includes("M2US2UREG")) {
                try {
                    const params = {
                        txnType: "M2US2UREG",
                    };

                    const response = await checkS2WEarnedChances(params);

                    if (response) {
                        const { displayPopup, chance } = response.data;
                        console.tron.log("displayPopup", displayPopup, "chance", chance);

                        if (displayPopup) {
                            // go to earned chances screen
                            navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } catch (error) {
                    // can't do nothing
                }
            }
        }, 400);
    }, [isCampaignPeriod, navigation, txnTypeList]);

    function handleContinue() {
        if (route?.params?.flowParams?.success) {
            const { flowParams } = route.params;
            navigation.navigate(flowParams.success.stack, {
                screen: flowParams?.success.screen,
                params: {
                    auth: "success",
                    ...flowParams.params,
                },
            });
        } else {
            // go back to settings
            navigation.navigate("Dashboard", {
                screen: "Settings",
            });
            GASettingsScreen.onEnableSecure2U();
        }
    }

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_S2U_ENABLED,
        });
        // this is only for campaign while using tracker and earned entries / chances for user
        // comment it out first, Year End Campaign using push notifications way to show CampaignChancesEarned.js
        // if (isCampaignPeriod) checkForEarnedChances();
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top", "bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Animatable.Image
                                animation={animateFadeInUp}
                                delay={500}
                                duration={500}
                                source={Images.onboardingSuccessBg}
                                style={styles.imageBg}
                                useNativeDriver
                            />
                        </View>
                        <View style={styles.footer}>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1000}
                                style={styles.copy}
                                useNativeDriver
                            >
                                <Typo
                                    fontSize={16}
                                    lineHeight={19}
                                    fontWeight="600"
                                    text="Secure2u enabled"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    text="You may now authorise your transactions securely via the app."
                                    textAlign="left"
                                />
                            </Animatable.View>
                            <Animatable.View
                                animation={animateFadeInUp}
                                duration={250}
                                delay={1100}
                                style={styles.actionContainer}
                                useNativeDriver
                            >
                                <ActionButton
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleContinue}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </Animatable.View>
                        </View>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

Success.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    footer: {
        flex: 0.4,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    imageBg: { height: "100%", width: "100%" },
    label: {
        paddingVertical: 16,
    },
    meta: {
        alignItems: "center",
        flex: 0.6,
    },
});

export default withModelContext(Success);

import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BANKINGV2_MODULE, FUND_ALLOCATION } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, YELLOW } from "@constants/colors";
import {
    DONE,
    FA_FIN_GOAL_APPLY_UT_SUCCESS,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import assets from "@assets";

const UnitTrustOpeningAcknowledgement = ({ navigation, route }) => {
    const { bottom } = useSafeAreaInsets();

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_APPLY_UT_SUCCESS,
        });

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_APPLY_UT_SUCCESS,
        });
    }, [route?.params?.refId]);

    function onPressDone() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: route?.params?.fromScreen ?? FUND_ALLOCATION,
        });
    }
    return (
        <ScreenContainer>
            <ScreenLayout paddingTop={0} paddingHorizontal={0} paddingBottom={bottom}>
                <Image source={assets.onboardingSuccessBg} style={styles.bgImage} />

                <View style={styles.container}>
                    <Typo
                        text="Congratulations! Your Unit Trust Account has been successfully created"
                        fontSize={16}
                        lineHeight={24}
                        fontWeight="600"
                        textAlign="left"
                    />
                    <Typo
                        text="You can now proceed with setting up your goals and look forward to your financial success!"
                        fontSize={14}
                        lineHeight={20}
                        fontWeight="400"
                        textAlign="left"
                        style={styles.subtitle}
                    />
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        backgroundColor={YELLOW}
                        onPress={onPressDone}
                        style={styles.button}
                        componentCenter={
                            <Typo text={DONE} fontWeight="600" fontSize={14} color={BLACK} />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

UnitTrustOpeningAcknowledgement.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    bgImage: { resizeMode: "cover", width: "100%" },
    button: {
        marginRight: 24,
    },
    container: {
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 36,
        paddingTop: 70,
    },
    subtitle: { paddingTop: 20 },
});

export default UnitTrustOpeningAcknowledgement;

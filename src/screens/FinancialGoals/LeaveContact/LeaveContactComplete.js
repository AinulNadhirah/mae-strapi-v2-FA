import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, GOAL_SIMULATION } from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import { DONE, FA_SCREEN_NAME, FA_VIEW_SCREEN } from "@constants/strings";

import assets from "@assets";

const LeaveContactComplete = ({ navigation, route }) => {
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_Queries_Submitted",
        });
    }, []);

    function onPressDone() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
            params: {
                ...route?.params,
            },
        });
    }
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout useSafeArea paddingTop={0} paddingHorizontal={0} paddingBottom={0}>
                <View style={styles.container}>
                    <Image source={assets.icTickNew} style={styles.image} />
                    <Typo
                        text="Thank you for submitting your details. Our sales advisor will be in touch with you as soon as possible."
                        fontSize={20}
                        fontWeight="300"
                        textAlign="left"
                        lineHeight={25}
                    />
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressDone}
                        componentCenter={<Typo text={DONE} fontWeight="600" fontSize={14} />}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

LeaveContactComplete.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    image: { height: 56, marginBottom: 25, marginTop: 120, width: 56 },
});
export default LeaveContactComplete;

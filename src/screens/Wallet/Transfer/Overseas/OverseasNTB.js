import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleSheet, ScrollView, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";

function OverseasNTB() {
    const navigation = useNavigation();
    function getHeaderUI() {
        return (
            <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onBackButtonPress} />} />
        );
    }

    const onBackButtonPress = () => {
        navigation.goBack();
    };

    function onContinue() {
        navigation.navigate("More", {
            screen: "Apply",
        });
    }
    useEffect(() => {
        RemittanceAnalytics.stepUpLoaded();
    }, []);
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={getHeaderUI()}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.subContentContainer}>
                        <Typo
                            textAlign="left"
                            text="Step Up Account"
                            fontWeight="400"
                            fontSize={14}
                            lineHeight={19}
                        />
                    </View>
                    <Typo
                        textAlign="left"
                        text="The MAE account does not support this feature. You can step up for another account to make overseas transfers."
                        fontWeight="600"
                        fontSize={14}
                        lineHeight={19}
                    />
                </ScrollView>
                <FixedActionContainer>
                    <ActionButton
                        backgroundColor={YELLOW}
                        fullWidth
                        componentCenter={
                            <Typo
                                color={BLACK}
                                lineHeight={18}
                                fontWeight="600"
                                fontSize={14}
                                text="Step Up Now"
                            />
                        }
                        onPress={onContinue}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 25,
    },
    subContentContainer: { paddingVertical: 8 },
});

export default OverseasNTB;

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, DISABLED, BLACK, DISABLED_TEXT, MEDIUM_GREY } from "@constants/colors";
import {
    WHAT_IS_PEP,
    PEP_DEFINITION,
    WHAT_IS_RCA,
    RCA_DEFINITION1,
    RCA_DEFINITION2,
    DECLARATION,
    ARE_YOU_PEP_OR_RCA,
    CONFIRM,
    YES,
    NO,
} from "@constants/strings";

function MAEOnboardDeclaration({ route, navigation }) {
    const [isPEP, setIsPEP] = useState("");
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const routeParams = route?.params;
    const filledUserDetails = routeParams?.filledUserDetails;

    useEffect(() => {
        setIsNextDisabled(isPEP === "");    
    }, [isPEP]);

    function onBackTap() {
        navigation.goBack();
    }

    function onCloseTap() {
        navigation.navigate(filledUserDetails?.entryStack || navigationConstant.MORE, {
            screen: filledUserDetails?.entryScreen || navigationConstant.APPLY_SCREEN,
            params: filledUserDetails?.entryParams,
        });
    }

    function toggleRadioPEP(radioTitle) {
        setIsPEP(radioTitle);
    }

    function onContinueTap() {
        const filledUserDetails = prepareUserDetails();
        navigation.navigate(navigationConstant.MAE_ONBOARD_DETAILS4, {
            filledUserDetails,
        });
    }

    function prepareUserDetails() {
        const onPepDeclaration = {
            pepDeclaration: isPEP === YES,
        };
        const MAEUserDetails = filledUserDetails || {};
        MAEUserDetails.pepDeclaration = onPepDeclaration;

        return MAEUserDetails;
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <View style={styles.viewContainer}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                >
                    <ScrollView>
                        <View style={styles.formContainer}>
                            <Typo
                                fontSize={16}
                                lineHeight={24}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="left"
                                text={DECLARATION}
                            />

                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    textAlign="left"
                                    text={ARE_YOU_PEP_OR_RCA}
                                />
                            </View>
                            <View style={styles.radioBtnContainer}>
                                <View style={styles.leftRadioBtn}>
                                    <ColorRadioButton
                                        title={YES}
                                        isSelected={isPEP === YES}
                                        disabled={isPEP === YES}
                                        fontSize={14}
                                        fontWeight="600"
                                        onRadioButtonPressed={toggleRadioPEP}
                                    />
                                </View>
                                <View style={styles.rightRadioBtn}>
                                    <ColorRadioButton
                                        title={NO}
                                        isSelected={isPEP === NO}
                                        disabled={isPEP === NO}
                                        fontSize={14}
                                        fontWeight="600"
                                        onRadioButtonPressed={toggleRadioPEP}
                                    />
                                </View>
                            </View>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={24}
                                    text={WHAT_IS_PEP}
                                    textAlign="left"
                                />
                                <View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        textAlign="left"
                                        style={styles.infoContent}
                                        text={PEP_DEFINITION}
                                    />
                                </View>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={23}
                                    text={WHAT_IS_RCA}
                                    textAlign="left"
                                />
                                <View>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={RCA_DEFINITION1}
                                        style={styles.infoContent}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={RCA_DEFINITION2}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    {/* Continue Button */}
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            onPress={onContinueTap}
                            disabled={isNextDisabled}
                            backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                    text={CONFIRM}
                                />
                            }
                        />
                    </View>
                </ScreenLayout>
            </View>
        </ScreenContainer>
    );
}

MAEOnboardDeclaration.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },
    infoContent: {
        marginBottom: 10,
        marginTop: 8,
    },
    leftRadioBtn: {
        marginRight: 80,
    },
    radioBtnContainer: {
        alignItems: "flex-start",
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    viewContainer: {
        flex: 1,
    },
});

export default withModelContext(MAEOnboardDeclaration);

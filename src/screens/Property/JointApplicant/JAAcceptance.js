/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, JA_PERSONAL_INFO } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { updateUserConsent } from "@services";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import { FA_PROPERTY_JACEJA_CREDITCHECK, JOINT_APPLICATION, PLSTP_AGREE } from "@constants/strings";

import { getMasterData, getMDMData } from "../Common/PropertyController";
import { getJEligibilityBasicNavParams } from "./JAController";

function JAAcceptance({ route, navigation }) {
    const { updateModel } = useModelController();
    const [saveData, setSaveData] = useState(null);
    const [propertyData, setPropertyData] = useState(null);
    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[JAAcceptance] >> [init]");
        const saveData = prepopulateData();
        setSaveData(saveData);
        setPropertyData(route?.params?.propertyDetails);
    };

    const prepopulateData = () => {
        const navParams = route?.params ?? {};
        return {
            baseRate: navParams?.baseRate,
            customerName: navParams?.customerName,
            downPayment: navParams?.downPayment,
            downPaymentPercent: navParams?.downPaymentPercent,
            effectiveProfitRate: navParams?.effectiveProfitRate,
            financingPeriod: navParams?.financingPeriod,
            grossIncome: navParams?.grossIncome,
            headerText: navParams?.headerText,
            isPropertyListed: navParams?.isPropertyListed,
            monthlyInstalment: navParams?.monthlyInstalment,
            propertyFinancingAmt: navParams?.propertyFinancingAmt,
            propertyId: navParams?.propertyId,
            propertyName: navParams?.propertyName,
            propertyPrice: navParams?.propertyPrice,
            spread: navParams?.spread,
            unitId: navParams?.unitId,
            unitTypeName: navParams?.unitTypeName,
            jaRelationship: navParams?.jaRelationship,
        };
    };
    const onBackPress = () => {
        navigation.goBack();
    };

    const onPressConfirm = async () => {
        updateModel({
            property: {
                JAAcceptance: true,
            },
        });
        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";
        const masterData = await getMasterData();
        const mdmData = await getMDMData();
        const navParams = getJEligibilityBasicNavParams({
            masterData,
            mdmData,
            saveData,
            propertyData,
            latitude,
            longitude,
        });
        await updateUserConsent();
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JA_PERSONAL_INFO,
            params: {
                ...navParams,
                syncId: route.params.syncId,
            },
        });
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_PROPERTY_JACEJA_CREDITCHECK}
        >
            <ScreenLayout
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackPress} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={24}
                useSafeArea
            >
                <>
                    <View style={styles.wrapper}>
                        <Typo
                            fontWeight="600"
                            lineHeight={18}
                            text={JOINT_APPLICATION}
                            textAlign="left"
                        />

                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            style={styles.label}
                            text="Before we proceed, kindly allow us to check your credit score and history"
                            textAlign="left"
                        />

                        <View style={styles.radioCheckContainer}>
                            <Typo
                                lineHeight={20}
                                textAlign="left"
                                style={styles.agreeLabel}
                                text={`I agree that my personal and business data may be processed by Maybank or Maybank's selected credit reporting agency in accordance with the Credit Reporting Agencies (CRA) Act 2020 and Central Bank of Malaysia Act 2009.`}
                            />
                        </View>
                    </View>

                    <FixedActionContainer>
                        <ActionButton
                            activeOpacity={1}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    color={BLACK}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PLSTP_AGREE}
                                />
                            }
                            onPress={onPressConfirm}
                        />
                    </FixedActionContainer>
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

JAAcceptance.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    agreeLabel: {
        paddingRight: 24,
    },

    label: {
        paddingBottom: 24,
        paddingTop: 8,
    },

    radioCheckContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    wrapper: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 36,
    },
});

export default JAAcceptance;

import { useNavigation, useRoute } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";

import {
    COMMON_MODULE,
    PDF_VIEW,
    REMITTANCE_OVERSEAS_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/TextWithInfo";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, YELLOW } from "@constants/colors";
import { OVERSEAS_TERMS_CONDITION_DATA } from "@constants/data/Overseas";
import { BAKONG_REMITTANCE_TNC } from "@constants/strings";
import { BAKONG_TnC, BNM_FEP, FTT_DECLARAION, MOT_TNC } from "@constants/url";

const OverseasTerms = () => {
    const {
        headerTitle = "",
        preDesc,
        linkBNMDesc,
        midDesc,
        secondMidDesc,
        linkDeclaration,
        linkTerms,
    } = OVERSEAS_TERMS_CONDITION_DATA;

    const navigation = useNavigation();
    const route = useRoute();
    const { transferParams } = route?.params || {};
    const isBakong = transferParams?.transactionTo || transferParams?.name === "BK";
    function getHeaderUI() {
        return (
            <HeaderLayout
                headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                headerCenterElement={
                    <Typo text={headerTitle} fontWeight="600" fontSize={16} lineHeight={18} />
                }
            />
        );
    }

    const onBackButtonPress = () => {
        navigation.goBack();
    };

    function onConfirm() {
        navigation.navigate(REMITTANCE_OVERSEAS_CONFIRMATION, {
            ...route?.params,
        });
    }

    function navigateUrl(url, title = "Terms & Conditions") {
        const data = url?.includes(".pdf")
            ? {
                file: url,
                share: false,
                pdfType: "shareReceipt",
                type: "url",
            }
            : {
                uri: url,
                type: "Web",
            };
        const params = {
            title,
            ...data,
        };

        navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    }

    useEffect(() => {
        RemittanceAnalytics.overseasTerms();
    });

    function TermsAndConditions({ isBakong }) {
        if (isBakong) {
            return (
                <View>
                    <Typo
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={18}
                        textAlign="left"
                        style={styles.termsContainer}
                        text={BAKONG_REMITTANCE_TNC}
                    />
                    <View style={styles.bakongLinkContainer}>
                        <Typo
                            style={[styles.underline, styles.txtContainer]}
                            fontWeight={600}
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text="Terms & Conditions"
                            onPressText={() => navigateUrl(BAKONG_TnC)}
                        />
                        <Typo
                            style={styles.underline}
                            fontWeight={600}
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text="FEA Requirement"
                            onPressText={() => navigateUrl(BNM_FEP, "BNM Foreign Exchange Rules")}
                        />
                    </View>
                    <Typo
                        text="Money withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to a non PIDM members."
                        style={styles.txtContainer}
                        textAlign="left"
                        fontWeight="400"
                        fontSize={14}
                        lineHeight={18}
                    />
                </View>
            );
        }

        return (
            <>
                <Typo
                    fontWeight={400}
                    fontSize={14}
                    lineHeight={19}
                    textAlign="left"
                    style={styles.termsContainer}
                >
                    {preDesc}
                    <Text
                        onPress={() => navigateUrl(BNM_FEP, "BNM Foreign Exchange Rules")}
                        style={styles.underline2}
                    >
                        {linkBNMDesc}
                    </Text>
                    {midDesc}
                    <Text
                        onPress={() => navigateUrl(FTT_DECLARAION, "Declaration")}
                        style={styles.underline2}
                    >
                        {linkDeclaration}
                    </Text>
                    {secondMidDesc}

                    <Text onPress={() => navigateUrl(MOT_TNC)} style={styles.underline2}>
                        {linkTerms}
                    </Text>
                </Typo>
                <Typo
                    text={`\nMoney withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to a non PIDM members.`}
                    style={styles.txtContainer}
                    textAlign="left"
                    fontWeight="400"
                    fontSize={14}
                    lineHeight={18}
                />
            </>
        );
    }

    TermsAndConditions.propTypes = {
        isBakong: PropTypes.bool,
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={16}
                paddingHorizontal={24}
                useSafeArea
                header={getHeaderUI()}
            >
                <View style={styles.contentContainer}>
                    <Typo
                        textAlign="left"
                        text={isBakong ? "Declaration" : "Terms & Conditions"}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={19}
                    />

                    <TermsAndConditions isBakong={isBakong} />
                </View>
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
                                text="Agree and Confirm"
                            />
                        }
                        onPress={onConfirm}
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    bakongLinkContainer: { flexDirection: "row", marginVertical: "6.5%" },
    contentContainer: {
        flex: 1,
        paddingBottom: 25,
    },
    termsContainer: { marginTop: 30 },
    txtContainer: { paddingRight: 34 },
    underline: {
        textDecorationLine: "underline",
    },
    underline2: {
        fontFamily: "Montserrat-SemiBold",
        fontWeight: "600",
        lineHeight: 19,
        textDecorationLine: "underline",
    },
});

export default OverseasTerms;

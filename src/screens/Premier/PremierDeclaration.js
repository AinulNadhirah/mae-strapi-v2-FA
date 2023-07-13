import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { getAnalyticScreenName } from "@screens/Premier/helpers/premierHelpers";

import { SETTINGS_MODULE, PREMIER_CONFIRMATION, PREMIER_DECLARATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import declarationProps from "@redux/connectors/ZestCASA/declarationConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes
} from "@redux/connectors/services/masterDataConnector";

import { YELLOW, DISABLED, TRANSPARENT } from "@constants/colors";
import { PREMIER_CLEAR_ALL } from "@constants/premierConfiguration";
import {
    PREMIER_ALLOW_PROCESS_PI,
    PREMIER_NOT_ALLOW_PROCESS_PI,
    PREMIER_DCRSR,
    PREMIER_PRIVACY_NOTE,
    PREMIER_FATCA,
    PREMIER_DCRSR_CONTINUED,
    PM1_DECLARATION_TEXT,
    PREMIER_PIDM_PHRASE,
    PMA_PIDM_PHRASE,
    PREMIER_PLSTP_AGREE_NOTE,
    SAVINGS_DECLARATION_FATCA,
    SAVINGS_DECLARATION_FATCA_HL,
    SAVINGS_DECLARATION_DCRSR,
    SAVINGS_DECLARATION_CRS_CERTIFICATION,
    SAVINGS_DECLARATION_FATCA_AGREE,
    SAVINGS_DECLARATION_CRS_CONTINUED,
    SAVINGS_DECLARATION_DCRSR_CONTINUED,
} from "@constants/premierStrings";
import {
    PREMIER_FATCA_URL,
    PMA_PDS_URL,
    PREMIER_FATCA_CRS_URL,
    PREMIER_PDPA_URL,
    PREMIER_PIDM_URL,
    PM1_TNC_URL,
    PMA_SPECIFIC_TNC_URL,
    KAWANKU_SAVINGS_TNC_URL,
    KAWANKU_SAVINGS_FATCA_URL,
    KAWANKU_SAVINGS_PIDM_URL,
    KAWANKU_SAVINGS_FATCA_CRS_URL,
    KAWANKU_SAVINGS_PDPA_URL,
    KAWANKU_SAVINGSI_SPECIFIC_TNC_URL,
    KAWANKU_SAVINGSI_PDS_URL,
} from "@constants/premierUrl";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    PLSTP_PDS_BOLD,
    AND,
    ATTACHED,
    ZEST_CASA_FATCA_HL,
    ZEST_CASA_FATCA_AGREE,
    PRIVACY_STATEMENT,
    PRIVACY_NOTICE,
    ZEST_CASA_PIDM_LINK,
    MAE_FATCA_ACT,
    STP_TNC,
    PIDM,
    ZEST_CASA_CRS_CERTIFICATION,
    ZEST_CASA_CRS_CONTINUED
} from "@constants/strings";

const PremierDeclaration = (props) => {
    const { navigation, isAgreeToBeContacted, isPMA } = props;
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAgreeToBeContacted]);

    function onBackTap () {
        console.log("[PremierDeclaration] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap () {
        // Clear all data from Premier reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap () {
        if (props.isDeclarationContinueButtonEnabled) navigation.navigate(PREMIER_CONFIRMATION);
    }

    function onTNCLinkDidTap () {
        const title = STP_TNC;
        const url = entryReducer.isPM1
            ? PM1_TNC_URL
            : entryReducer.isKawanku
            ? KAWANKU_SAVINGS_TNC_URL
            : entryReducer.isKawankuSavingsI
            ? KAWANKU_SAVINGSI_SPECIFIC_TNC_URL
            : PMA_SPECIFIC_TNC_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onPDSLinkDidTap () {
        const title = PLSTP_PDS_BOLD;
        const url = entryReducer.isKawankuSavingsI ? KAWANKU_SAVINGSI_PDS_URL : PMA_PDS_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onFATCALinkDidTap () {
        const title = MAE_FATCA_ACT;
        const url = entryReducer.isKawanku ? KAWANKU_SAVINGS_FATCA_URL : PREMIER_FATCA_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onFATCACRSLinkDidTap () {
        const title = ZEST_CASA_CRS_CERTIFICATION;
        const url = entryReducer.isKawanku ? KAWANKU_SAVINGS_FATCA_CRS_URL : PREMIER_FATCA_CRS_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onPrivacyLinkDidTap () {
        const title = PRIVACY_NOTICE;
        const url = entryReducer.isKawanku ? KAWANKU_SAVINGS_PDPA_URL : PREMIER_PDPA_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onPIDMLinkDidTap () {
        const title = PIDM;
        const url = entryReducer.isKawanku ? KAWANKU_SAVINGS_PIDM_URL : PREMIER_PIDM_URL;

        const params = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params,
        });
    }

    function onAgreeRadioButtonDidTap () {
        props.updateAgreeToBeContacted("Y");
    }

    function onDisagreeRadioButtonDidTap () {
        props.updateAgreeToBeContacted("N");
    }

    const analyticScreenName = getAnalyticScreenName(entryReducer, PREMIER_DECLARATION, "");

    return (
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={DECLARATION}
                                        />
                                        {entryReducer.isPM1 && (
                                            <>
                                                <SpaceFiller height={24} />
                                                {buildDeclarationMainText()}
                                            </>
                                        )}
                                        <SpaceFiller height={24} />
                                        {buildTNCParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildFATCAParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildDCRSRParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildPrivacyParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildRadioButtonGroupView()}
                                        <SpaceFiller height={24} />
                                        {buildPIDMParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildProductAndServicesParagraph()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isDeclarationContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isDeclarationContinueButtonEnabled ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_AGREE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    
                </ScreenLayout>
            </ScreenContainer>
    );

    function buildTNCParagraph () {
        return (
            <Typo fontSize={14} lineHeight={24} fontWeight="400" textAlign="left">
                {PLSTP_TNC_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={STP_TNC}
                    onPress={onTNCLinkDidTap}
                />
                {(entryReducer.isPMA || entryReducer.isKawankuSavingsI) && (
                    <>
                        {AND}
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="700"
                            letterSpacing={0}
                            textAlign="left"
                            style={Style.underline}
                            text={PLSTP_PDS_BOLD}
                            onPress={onPDSLinkDidTap}
                        />
                    </>
                )}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={` ${ATTACHED}.`}
                />
            </Typo>
        );
    }

    function buildDeclarationFATCAText() {
        return entryReducer.isKawanku ? SAVINGS_DECLARATION_FATCA : PREMIER_FATCA;
    }

    function buildDeclarationMainText() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {PM1_DECLARATION_TEXT}
            </Typo>
        );
    }

    function buildFATCAParagraph () {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {buildDeclarationFATCAText()}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={
                        entryReducer.isKawanku ? SAVINGS_DECLARATION_FATCA_HL : ZEST_CASA_FATCA_HL
                    }
                    onPress={onFATCALinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={
                        entryReducer.isKawanku
                            ? SAVINGS_DECLARATION_FATCA_AGREE
                            : ZEST_CASA_FATCA_AGREE
                    }
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={
                        entryReducer.isKawanku
                            ? SAVINGS_DECLARATION_CRS_CERTIFICATION
                            : ZEST_CASA_CRS_CERTIFICATION
                    }
                    onPress={onFATCACRSLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={
                        entryReducer.isKawanku
                            ? SAVINGS_DECLARATION_CRS_CONTINUED
                            : ZEST_CASA_CRS_CONTINUED
                    }
                />
            </Typo>
        );
    }

    function buildDCRSRParagraph () {
        return (
            <Typo fontSize={15} lineHeight={21} fontWeight="400" textAlign="left">
                {entryReducer.isKawanku ? SAVINGS_DECLARATION_DCRSR : PREMIER_DCRSR}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={
                        entryReducer.isKawanku
                            ? SAVINGS_DECLARATION_CRS_CERTIFICATION
                            : ZEST_CASA_CRS_CERTIFICATION
                    }
                    onPress={onFATCACRSLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={
                        entryReducer.isKawanku
                            ? SAVINGS_DECLARATION_DCRSR_CONTINUED
                            : PREMIER_DCRSR_CONTINUED
                    }
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={!entryReducer.isKawanku ? ZEST_CASA_CRS_CONTINUED : ""}
                />
            </Typo>
        );
    }

    function buildPrivacyParagraph () {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {PREMIER_PRIVACY_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={` ${PRIVACY_STATEMENT} `}
                    onPress={onPrivacyLinkDidTap}
                />
            </Typo>
        );
    }

    function buildRadioButtonGroupView () {
        return (
            <>
                <RadioButton
                    fontSize={14}
                    lineHeight={21}
                    textAlign="left"
                    fontWeight="400"
                    title={PREMIER_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "Y" ? true : false}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                />
                <SpaceFiller height={25} />
                <RadioButton
                    fontSize={14}
                    lineHeight={21}
                    textAlign="left"
                    fontWeight="400"
                    title={PREMIER_NOT_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "N" ? true : false}
                    onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                />
            </>
        );
    }

    function buildPIDMParagraph () {
        const PIDM_PHRASE = isPMA ? PMA_PIDM_PHRASE : PREMIER_PIDM_PHRASE;

        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {PIDM_PHRASE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={ZEST_CASA_PIDM_LINK}
                    onPress={onPIDMLinkDidTap}
                />
            </Typo>
        );
    }

    function buildProductAndServicesParagraph () {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="400"
                textAlign="left"
                text={PREMIER_PLSTP_AGREE_NOTE}
            />
        );
    }
};

export const declarationPropTypes = (PremierDeclaration.propTypes = {
    // External props
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,

    // State
    isAgreeToBeContacted: PropTypes.string,
    privacyPolicy: PropTypes.string,
    fatcaStateDeclaration: PropTypes.string,
    termsAndConditions: PropTypes.string,
    isDeclarationContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateAgreeToBeContacted: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearDeclarationReducer: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },

    underline: {
        textDecorationLine: "underline",
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(entryProps(declarationProps(PremierDeclaration)))
);

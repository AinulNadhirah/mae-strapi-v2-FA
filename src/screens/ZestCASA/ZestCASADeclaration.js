import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";

import "@navigation/navigationConstant";
import { SETTINGS_MODULE, ZEST_CASA_CONFIRMATION } from "@navigation/navigationConstant";

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
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { YELLOW, DISABLED, TRANSPARENT } from "@constants/colors";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    PLSTP_PDS_BOLD,
    OTHER_RELEVANT_DOCUMENTS,
    AND,
    ATTACHED,
    ZEST_CASA_FATCA,
    ZEST_CASA_FATCA_HL,
    ZEST_CASA_FATCA_AGREE,
    ZEST_CASA_DCRSR,
    ZEST_CASA_PRIVACY_NOTE,
    PRIVACY_NOTICE,
    ZEST_CASA_PRIVACY_NOTE_MM,
    ZEST_CASA_ALLOW_PROCESS_PI,
    PLSTP_NOT_ALLOW_PROCESS_PI,
    ZEST_CASA_PIDM_LINK,
    PLSTP_AGREE_NOTE,
    MAE_FATCA_ACT,
    TERMS_CONDITIONS,
    PIDM,
    ZEST_CASA_CRS_CERTIFICATION,
    ZEST_CASA_CRS_CONTINUED,
    ZEST_CASA_DCRSR_CONTINUED,
    OTHER_RELEVANT_DOCUMENTS_TITLE,
    ZEST_PIDM_PHRASE,
    M2U_PREMIER_PIDM_PHRASE,
} from "@constants/strings";
import {
    CASA_SPECIFIC_TNC,
    ZEST_FATCA,
    ZEST_FATCA_CRS,
    ZEST_GENERAL_TNC,
    ZEST_PDPA,
    ZEST_PDS,
    ZEST_PIDM,
    ZEST_SPECIFIC_TNC,
} from "@constants/url";
import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_M2U_PREMIER_DECLARATION,
    APPLY_ZESTI_DECLARATION,
} from "./helpers/AnalyticsEventConstants";

const ZestCASADeclaration = (props) => {
    const { navigation, isAgreeToBeContacted, isZest } = props;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAgreeToBeContacted]);

    const init = async () => {
        console.log("[ZestCASADeclaration] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASADeclaration] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        if (props.isDeclarationContinueButtonEnabled) navigation.navigate(ZEST_CASA_CONFIRMATION);
    }

    function onTNCLinkDidTap() {
        const title = TERMS_CONDITIONS;
        const url = isZest ? ZEST_GENERAL_TNC : CASA_SPECIFIC_TNC;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPDSLinkDidTap() {
        const title = PLSTP_PDS_BOLD;
        const url = ZEST_PDS;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onOtherRelevantDocumentsDidTap() {
        const title = OTHER_RELEVANT_DOCUMENTS_TITLE;
        const url = ZEST_SPECIFIC_TNC;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onFATCALinkDidTap() {
        const title = MAE_FATCA_ACT;
        const url = ZEST_FATCA;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onFATCACRSLinkDidTap() {
        const title = ZEST_CASA_CRS_CERTIFICATION;
        const url = ZEST_FATCA_CRS;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPrivacyLinkDidTap() {
        const title = PRIVACY_NOTICE;
        const url = ZEST_PDPA;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPIDMLinkDidTap() {
        const title = PIDM;
        const url = ZEST_PIDM;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onAgreeRadioButtonDidTap() {
        props.updateAgreeToBeContacted("Y");
    }

    function onDisagreeRadioButtonDidTap() {
        props.updateAgreeToBeContacted("N");
    }

    const analyticScreenName = props.isZest
        ? APPLY_ZESTI_DECLARATION
        : APPLY_M2U_PREMIER_DECLARATION;

    return (
        <React.Fragment>
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
                    <React.Fragment>
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
                                        <SpaceFiller height={24} />
                                        {buildTNCParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildFATCAParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildDCRSRParagraph()}
                                        <SpaceFiller height={24} />
                                        {buildPrivacyParagraph()}
                                        <SpaceFiller height={16} />
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
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildTNCParagraph() {
        if (props.isZest) {
            return (
                <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                    {PLSTP_TNC_NOTE}
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={TERMS_CONDITIONS}
                        onPress={onTNCLinkDidTap}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={`, ${PLSTP_PDS_BOLD}`}
                        onPress={onPDSLinkDidTap}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="400"
                        letterSpacing={0}
                        textAlign="left"
                        text={AND}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={OTHER_RELEVANT_DOCUMENTS}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
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
        } else {
            return (
                <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                    {PLSTP_TNC_NOTE}
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={`${TERMS_CONDITIONS}.`}
                        onPress={onTNCLinkDidTap}
                    />
                </Typo>
            );
        }
    }

    function buildFATCAParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ZEST_CASA_FATCA}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={ZEST_CASA_FATCA_HL}
                    onPress={onFATCALinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={ZEST_CASA_FATCA_AGREE}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={ZEST_CASA_CRS_CERTIFICATION}
                    onPress={onFATCACRSLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={ZEST_CASA_CRS_CONTINUED}
                />
            </Typo>
        );
    }

    function buildDCRSRParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ZEST_CASA_DCRSR}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={ZEST_CASA_CRS_CERTIFICATION}
                    onPress={onFATCACRSLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={ZEST_CASA_DCRSR_CONTINUED}
                />
            </Typo>
        );
    }

    function buildPrivacyParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ZEST_CASA_PRIVACY_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={` ${PRIVACY_NOTICE}. `}
                    onPress={onPrivacyLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_PRIVACY_NOTE_MM}
                />
            </Typo>
        );
    }

    function buildRadioButtonGroupView() {
        return (
            <React.Fragment>
                <RadioButton
                    title={ZEST_CASA_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "Y" ? true : false}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                />
                <SpaceFiller height={25} />
                <RadioButton
                    title={PLSTP_NOT_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "N" ? true : false}
                    onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                />
            </React.Fragment>
        );
    }

    function buildPIDMParagraph() {
        const PIDM_PHRASE = isZest ? ZEST_PIDM_PHRASE : M2U_PREMIER_PIDM_PHRASE;

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

    function buildProductAndServicesParagraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="400"
                textAlign="left"
                text={PLSTP_AGREE_NOTE}
            />
        );
    }
};

export const declarationPropTypes = (ZestCASADeclaration.propTypes = {
    // External props
    ...entryPropTypes,
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
    downTimeServiceProps(entryProps(declarationProps(ZestCASADeclaration)))
);

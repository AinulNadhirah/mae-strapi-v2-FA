import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    SETTINGS_MODULE,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_RESIDENTIAL_DETAILS
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import suitabilityAssessmentProps from "@redux/connectors/ZestCASA/suitabilityAssessmentConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, YELLOW, DISABLED, TRANSPARENT, SEPARATOR_GRAY, DARK_GREY } from "@constants/colors";
import { PMA_NTB_USER, PREMIER_CLEAR_ALL } from "@constants/premierConfiguration";
import { PMA_PDS_URL, PMA_SPECIFIC_TNC_URL } from "@constants/premierUrl";
import {
    CONTINUE,
    PLEASE_SELECT,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
    PMA_OF,
    PMA_APPLICATION_TITLE,
    ZEST_CASA_ZEST_EXPLANATION,
    ZEST_CASA_FINANCIAL_OBJECTIVE,
    ZEST_CASA_SUITABILITY_QUESTION_ONE,
    ZEST_CASA_SUITABILITY_QUESTION_TWO,
    ZEST_CASA_SUITABILITY_QUESTION_THREE,
    ZEST_CASA_SUITABILITY_QUESTION_FOUR,
    ZEST_CASA_SUITABILITY_QUESTION_FIVE,
    YES,
    NO,
    DECLARATION,
    ZEST_CASA_READ_AND_UNDERSTOOD,
    PREMIER_PDS_BOLD,
    OTHER_RELEVANT_DOCUMENTS_TITLE,
    ZEST_CASA_ACKNOWLEDGE_INFORMATION,
    ZEST_CASA_UNDERSTOOD_FEATURES,
    AND_OTHER,
    RELEVANT_DOCUMENTS,
    STEP1OF6,
    DONE,
    CANCEL
} from "@constants/strings";

import { APPLY_PMA_SUITABILITY_ASSESMENT } from "./helpers/AnalyticsEventConstants";

const PremierSuitabilityAssessment = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        financialObjectiveIndex,
        hasDealtWithSecurities,
        hasRelevantKnowledge,
        hasInvestmentExperience,
        hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled,
    } = props;

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    useEffect(() => {
        props.checkButtonEnabled();
    }, [
        financialObjectiveIndex,
        hasDealtWithSecurities,
        hasRelevantKnowledge,
        hasInvestmentExperience,
        hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled,
    ]);

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
        const { userStatus } = prePostQualReducer;
        if (isSuitabilityAssessmentContinueButtonEnabled) {
            userStatus && userStatus !== PMA_NTB_USER
                ? navigation.navigate(PREMIER_RESIDENTIAL_DETAILS)
                : navigation.navigate(PREMIER_PERSONAL_DETAILS);
        }
    }

    function handleInfoPopup () {
        setIsPopupVisible(!isPopupVisible);
    }

    function onFinancialObjectiveDropdownPillDidTap () {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: financialObjectiveIndex,
            filterType: "",
            data: props.financialObjective,
        });
    }

    function scrollPickerOnPressDone (data, index) {
        props.updateFinancialObjective(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel () {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onPDSLinkDidTap () {
        const title = PREMIER_PDS_BOLD;
        const url = PMA_PDS_URL;

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

    function onOtherRelevantDocumentsDidTap () {
        const title = OTHER_RELEVANT_DOCUMENTS_TITLE;
        const url = PMA_SPECIFIC_TNC_URL;

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

    return (
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_PMA_SUITABILITY_ASSESMENT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            // headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={STEP1OF6}
                                    color={DARK_GREY}
                                />
                            }
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
                                {buildHeader()}
                                {buildForm()}
                                <SpaceFiller height={24} />
                                {buildDeclarationSection()}
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isSuitabilityAssessmentContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isSuitabilityAssessmentContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                </ScreenLayout>
                <Popup
                    visible={isPopupVisible}
                    title={ZEST_CASA_SUITABILITY_ASSESSMENT}
                    description={ZEST_CASA_ZEST_EXPLANATION}
                    onClose={handleInfoPopup}
                />
                <ScrollPickerView
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    selectedIndex={scrollPicker.selectedIndex}
                    onRightButtonPress={scrollPickerOnPressDone}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            </ScreenContainer>
    );

    function buildHeader () {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.headerContainer}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={21}
                        textAlign="left"
                        text={ZEST_CASA_SUITABILITY_ASSESSMENT}
                    />
                    <TouchableOpacity onPress={handleInfoPopup}>
                        <Image
                            source={require("@assets/Fitness/info_black.png")}
                            style={Style.infoImage}
                        />
                    </TouchableOpacity>
                </View>
                <SpaceFiller height={4} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={PMA_APPLICATION_TITLE}
                />
            </View>
        );
    }

    function buildForm () {
        return (
            <View style={Style.contentContainer}>
                <TitleAndDropdownPill
                    title={ZEST_CASA_FINANCIAL_OBJECTIVE}
                    titleFontWeight="400"
                    dropdownTitle={props?.financialObjectiveValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onFinancialObjectiveDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_ONE}
                />
                {buildRadioButtonGroupView(hasDealtWithSecurities, props.updateSecuritiesAnswer)}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_TWO}
                />
                {buildRadioButtonGroupView(
                    hasRelevantKnowledge,
                    props.updateRelevantKnowledgeAnswer
                )}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_THREE}
                />
                {buildRadioButtonGroupView(
                    hasInvestmentExperience,
                    props.updateInvestmentExperienceAnswer
                )}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_FOUR}
                />
                {buildRadioButtonGroupView(
                    hasUnderstoodInvestmentAccount,
                    props.updateUnderstandInvestmentAccountAnswer
                )}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_FIVE}
                />
                {buildRadioButtonGroupView(
                    hasUnderstoodAccountTerms,
                    props.updateUnderstandAccountTermsAnswer
                )}
            </View>
        );
    }

    function buildDeclarationSection () {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.separator} />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={21}
                    textAlign="left"
                    text={`${DECLARATION}:`}
                    color={DARK_GREY}
                />
                <SpaceFiller height={8} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={`1. ${ZEST_CASA_UNDERSTOOD_FEATURES}`}
                    color={DARK_GREY}
                />
                <SpaceFiller height={8} />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    color={DARK_GREY}
                    textAlign="left"
                >
                    {"2. " + ZEST_CASA_READ_AND_UNDERSTOOD + " "}
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={PREMIER_PDS_BOLD}
                        onPress={onPDSLinkDidTap}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="400"
                        letterSpacing={0}
                        textAlign="left"
                        color={DARK_GREY}
                        text={AND_OTHER}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="700"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={RELEVANT_DOCUMENTS}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="400"
                        letterSpacing={0}
                        textAlign="left"
                        color={DARK_GREY}
                        text={PMA_OF}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
                </Typo>
                <SpaceFiller height={8} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    color={DARK_GREY}
                    text={`3. ${ZEST_CASA_ACKNOWLEDGE_INFORMATION}`}
                />
                <SpaceFiller height={40} />
            </View>
        );
    }
};

function buildRadioButtonGroupView (answer, dispatch) {
    return (
        <>
            <View style={Style.radioContentContainer}>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={() => dispatch(true)}
                    >
                        {answer === true ? <RadioChecked checkType="color" /> : <RadioUnchecked />}

                        <View style={Style.radioButtonTitle}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                text={YES}
                                color={BLACK}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={() => dispatch(false)}
                    >
                        {answer === false ? <RadioChecked checkType="color" /> : <RadioUnchecked />}

                        <View style={Style.radioButtonTitle}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                text={NO}
                                color={BLACK}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

PremierSuitabilityAssessment.propTypes = {
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,

    // State
    financialObjectiveIndex: PropTypes.number,
    financialObjectiveValue: PropTypes.object,
    hasDealtWithSecurities: PropTypes.bool,
    hasRelevantKnowledge: PropTypes.bool,
    hasInvestmentExperience: PropTypes.bool,
    hasUnderstoodInvestmentAccount: PropTypes.bool,
    hasUnderstoodAccountTerms: PropTypes.bool,
    isSuitabilityAssessmentContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateFinancialObjective: PropTypes.func,
    updateSecuritiesAnswer: PropTypes.func,
    updateRelevantKnowledgeAnswer: PropTypes.func,
    updateInvestmentExperienceAnswer: PropTypes.func,
    updateUnderstandInvestmentAccountAnswer: PropTypes.func,
    updateUnderstandAccountTermsAnswer: PropTypes.func,
    checkButtonEnable: PropTypes.func,
    clearSuitabilityAssessmentReducer: PropTypes.func,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    headerContainer: {
        alignItems: "center",
        flexDirection: "row",
    },

    infoImage: {
        height: 16,
        width: 16,
    },

    radioButtonContainer: {
        flexDirection: "row",
        marginRight: 40,
        marginTop: 16,
    },

    radioButtonTitle: {
        marginLeft: 12,
    },

    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    radioContentContainer: {
        flexDirection: "row",
    },

    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },

    underline: {
        textDecorationLine: "underline",
    },
});

export default downTimeServiceProps(
    masterDataServiceProps(entryProps(suitabilityAssessmentProps(PremierSuitabilityAssessment)))
);

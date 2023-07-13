import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    SETTINGS_MODULE,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_RESIDENTIAL_DETAILS,
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
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, YELLOW, DISABLED, TRANSPARENT, SEPARATOR_GRAY } from "@constants/colors";
import {
    CONTINUE,
    PLEASE_SELECT,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
    ZEST_CASA_ZEST_DESCRIPTION,
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
    PLSTP_PDS_BOLD,
    OTHER_RELEVANT_DOCUMENTS_TITLE,
    ZEST_CASA_ACKNOWLEDGE_INFORMATION,
    ZEST_CASA_UNDERSTOOD_FEATURES,
    AND_OTHER,
    RELEVANT_DOCUMENTS,
} from "@constants/strings";
import { ZEST_PDS, ZEST_SPECIFIC_TNC } from "@constants/url";
import { ZEST_NTB_USER, ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import { APPLY_ZESTI_SUITABILITY_ASSESMENT } from "./helpers/AnalyticsEventConstants";

const ZestCASASuitabilityAssessment = (props) => {
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
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        financialObjectiveIndex,
        hasDealtWithSecurities,
        hasRelevantKnowledge,
        hasInvestmentExperience,
        hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled,
    ]);

    const init = async () => {
        console.log("[ZestCASASuitabilityAssessment] >> [init]");
    };

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
        const { userStatus } = prePostQualReducer;
        if (isSuitabilityAssessmentContinueButtonEnabled)
            userStatus && userStatus !== ZEST_NTB_USER
                ? navigation.navigate(ZEST_CASA_RESIDENTIAL_DETAILS)
                : navigation.navigate(ZEST_CASA_PERSONAL_DETAILS);
    }

    function handleInfoPopup() {
        setIsPopupVisible(!isPopupVisible);
    }

    function onFinancialObjectiveDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: financialObjectiveIndex,
            filterType: "",
            data: props.financialObjective,
        });
    }

    function scrollPickerOnPressDone(data, index) {
        props.updateFinancialObjective(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onPDSLinkDidTap() {
        let title = PLSTP_PDS_BOLD;
        let url = ZEST_PDS;

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
        let title = OTHER_RELEVANT_DOCUMENTS_TITLE;
        let url = ZEST_SPECIFIC_TNC;

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

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ZESTI_SUITABILITY_ASSESMENT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
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
                    </React.Fragment>
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
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildHeader() {
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
                    text={ZEST_CASA_ZEST_DESCRIPTION}
                />
            </View>
        );
    }

    function buildForm() {
        return (
            <View style={Style.contentContainer}>
                {/* <SpaceFiller height={16} /> */}
                <TitleAndDropdownPill
                    title={ZEST_CASA_FINANCIAL_OBJECTIVE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.financialObjectiveValue && props.financialObjectiveValue.name
                            ? props.financialObjectiveValue.name
                            : PLEASE_SELECT
                    }
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
                {buildRadioButtonGroupView(hasDealtWithSecurities, (value) => {
                    props.updateSecuritiesAnswer(value);
                })}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_TWO}
                />
                {buildRadioButtonGroupView(hasRelevantKnowledge, (value) => {
                    props.updateRelevantKnowledgeAnswer(value);
                })}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_THREE}
                />
                {buildRadioButtonGroupView(hasInvestmentExperience, (value) => {
                    props.updateInvestmentExperienceAnswer(value);
                })}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_FOUR}
                />
                {buildRadioButtonGroupView(hasUnderstoodInvestmentAccount, (value) => {
                    props.updateUnderstandInvestmentAccountAnswer(value);
                })}
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_FIVE}
                />
                {buildRadioButtonGroupView(hasUnderstoodAccountTerms, (value) => {
                    props.updateUnderstandAccountTermsAnswer(value);
                })}
            </View>
        );
    }

    function buildDeclarationSection() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.separator} />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text={`${DECLARATION}:`}
                    color={BLACK}
                />
                <SpaceFiller height={4} />
                <Typo
                    fontSize={12}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={`1. ${ZEST_CASA_UNDERSTOOD_FEATURES}`}
                    color={BLACK}
                />
                <SpaceFiller height={4} />
                <Typo fontSize={12} lineHeight={18} fontWeight="400" textAlign="left">
                    {"2. " + ZEST_CASA_READ_AND_UNDERSTOOD + " "}
                    <Typo
                        fontSize={12}
                        lineHeight={18}
                        fontWeight="600"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={PLSTP_PDS_BOLD}
                        onPress={onPDSLinkDidTap}
                    />
                    <Typo
                        fontSize={12}
                        lineHeight={18}
                        fontWeight="400"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={AND_OTHER}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
                    <Typo
                        fontSize={12}
                        lineHeight={18}
                        fontWeight="600"
                        letterSpacing={0}
                        textAlign="left"
                        style={Style.underline}
                        text={RELEVANT_DOCUMENTS}
                        onPress={onOtherRelevantDocumentsDidTap}
                    />
                </Typo>
                <SpaceFiller height={4} />
                <Typo
                    fontSize={12}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={`3. ${ZEST_CASA_ACKNOWLEDGE_INFORMATION}`}
                    color={BLACK}
                />
                <SpaceFiller height={40} />
            </View>
        );
    }
};

function buildRadioButtonGroupView(answer, callback) {
    function onSelectedTap() {
        callback(true);
    }

    function onDeSelectedTap() {
        callback(false);
    }

    return (
        <React.Fragment>
            <View style={Style.radioContentContainer}>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity style={Style.radioButtonContainer} onPress={onSelectedTap}>
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
                    <TouchableOpacity style={Style.radioButtonContainer} onPress={onDeSelectedTap}>
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
        </React.Fragment>
    );
}

ZestCASASuitabilityAssessment.propTypes = {
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,
    ...entryPropTypes,

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
});

export default downTimeServiceProps(
    masterDataServiceProps(entryProps(suitabilityAssessmentProps(ZestCASASuitabilityAssessment)))
);

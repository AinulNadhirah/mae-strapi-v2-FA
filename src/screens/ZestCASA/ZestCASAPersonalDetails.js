import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";

import { entryPropTypes } from "@screens/ZestCASA/ZestCASAEntry";

import { ZEST_CASA_RESIDENTIAL_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import personalDetailsProps from "@redux/connectors/ZestCASA/personalDetailsConnector";
import suitabilityAssessmentProps from "@redux/connectors/ZestCASA/suitabilityAssessmentConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    DUMMY_EMAIL,
    EMAIL_LBL,
    FILL_IN_PERSONAL_DETAILS,
    GENDER_LBL,
    PLEASE_SELECT,
    MALE,
    FEMALE,
    TITLE,
    ZEST_APPLICATION,
    STEPUP_MAE_RACE,
    PLSTP_MOBILE_NUM,
    POLITICAL_EXPOSURE_QUESTION,
    MOBILE_NUMBER_DUMMY,
    YES,
    NO,
    STEP1OF4,
    M2U_PREMIER_APPLICATION,
    MOB_CODE,
    SETTINGS_DEFAULT_NUMBER,
} from "@constants/strings";
import {
    GENDER_FEMALE_CODE,
    GENDER_MALE_CODE,
    ZEST_CASA_CLEAR_ALL,
} from "@constants/zestCasaConfiguration";

import { identityDetailsPropTypes } from "./ZestCASAIdentityDetails";
import {
    APPLY_M2U_PREMIER_PERSONAL_DETAILS,
    APPLY_ZESTI_PERSONAL_DETAILS,
} from "./helpers/AnalyticsEventConstants";

const ZestCASAPersonalDetails = (props) => {
    const { navigation } = props;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        titleIndex,
        titleValue,
        gender,
        raceIndex,
        raceValue,
        mobileNumberWithoutExtension,
        emailAddress,
        politicalExposure,
        identityType,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [titleScrollPicker, setTitleScrollPicker] = useState(scrollPickerInitialState);

    const [raceScrollPicker, setRaceScrollPicker] = useState(scrollPickerInitialState);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        titleIndex,
        titleValue,
        gender,
        raceIndex,
        raceValue,
        mobileNumberWithoutExtension,
        emailAddress,
        politicalExposure,
    ]);

    const init = async () => {
        console.log("[ZestCASAPersonalDetails] >> [init]");
        if (identityType === 2) {
            var index = props.race.findIndex((race) => race.value === "OTH");
            props.updateRace(index, props.race[index]);
        }
    };

    function onBackTap() {
        console.log("[ZestCASAPersonalDetails] >> [onBackTap]");
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
        if (props.isPersonalContinueButtonEnabled) {
            props.isFromConfirmationScreenForPersonalDetails
                ? navigation.goBack()
                : navigation.navigate(ZEST_CASA_RESIDENTIAL_DETAILS);
        }
    }

    function onMaleRadioButtonDidTap() {
        props.updateGender(GENDER_MALE_CODE, MALE);
    }

    function onFemaleRadioButtonDidTap() {
        props.updateGender(GENDER_FEMALE_CODE, FEMALE);
    }

    function onMobileInputDidChange(value) {
        props.updateMobileNumberWithoutExtension(value);
    }

    function onMobileInputEndEditing() {
        props.updateMobileNumberWithExtension(
            SETTINGS_DEFAULT_NUMBER + props.mobileNumberWithoutExtension
        );
    }

    function onEmailInputDidChange(value) {
        props.updateEmailAddress(value);
    }

    function onPoliticsYesRadioButtonDidTap() {
        props.updatePoliticalExposure(true);
    }

    function onPoliticsNoRadioButtonDidTap() {
        props.updatePoliticalExposure(false);
    }

    function onTitleDropdownPillDidTap() {
        setTitleScrollPicker({
            isDisplay: true,
            selectedIndex: props.titleIndex,
            filterType: "",
            data: props.title,
        });
    }

    function onRaceDropdownPillDidTap() {
        setRaceScrollPicker({
            isDisplay: true,
            selectedIndex: props.raceIndex,
            filterType: "",
            data: props.race,
        });
    }

    function onTitleScrollPickerDoneButtonDidTap(data, index) {
        props.updateTitle(index, data);
        setTitleScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onRaceScrollPickerDoneButtonDidTap(data, index) {
        props.updateRace(index, data);
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setTitleScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    const analyticScreenName = props.isZest
        ? APPLY_ZESTI_PERSONAL_DETAILS
        : APPLY_M2U_PREMIER_PERSONAL_DETAILS;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                props.isZest ? (
                                    <HeaderBackButton onPress={onBackTap} />
                                ) : (
                                    <React.Fragment />
                                )
                            }
                            headerCenterElement={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={STEP1OF4}
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
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={
                                                props.isZest
                                                    ? ZEST_APPLICATION
                                                    : M2U_PREMIER_APPLICATION
                                            }
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={FILL_IN_PERSONAL_DETAILS}
                                        />
                                        {buildPersonalDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={props.isPersonalContinueButtonEnabled ? 1 : 0.5}
                                    backgroundColor={
                                        props.isPersonalContinueButtonEnabled ? YELLOW : DISABLED
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
                <ScrollPickerView
                    showMenu={titleScrollPicker.isDisplay}
                    list={titleScrollPicker.data}
                    selectedIndex={titleScrollPicker.selectedIndex}
                    onRightButtonPress={onTitleScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={raceScrollPicker.isDisplay}
                    list={raceScrollPicker.data}
                    selectedIndex={raceScrollPicker.selectedIndex}
                    onRightButtonPress={onRaceScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildPersonalDetailsForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={TITLE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.titleValue && props.titleValue.name
                            ? props.titleValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onTitleDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                {buildGenderRadioButtonGroupView()}
                <SpaceFiller height={8} />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_RACE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.raceValue && props.raceValue.name
                            ? props.raceValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onRaceDropdownPillDidTap}
                    isDisabled={identityType === 2}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={PLSTP_MOBILE_NUM}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.mobileNumberErrorMessage}
                    isValid={props.mobileNumberErrorMessage === null}
                    isValidate
                    maxLength={10}
                    value={props.mobileNumberWithoutExtension}
                    placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                    onChangeText={onMobileInputDidChange}
                    onEndEditing={onMobileInputEndEditing}
                    prefix={MOB_CODE}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={EMAIL_LBL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.emailAddressErrorMessage}
                    isValid={props.emailAddressErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.emailAddress}
                    placeholder={`e.g ${DUMMY_EMAIL}`}
                    onChangeText={onEmailInputDidChange}
                />
                <SpaceFiller height={24} />
                {buildPoliticsRadioButtonGroupView()}
            </React.Fragment>
        );
    }

    function buildGenderRadioButtonGroupView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={GENDER_LBL}
                />
                <View style={Style.radioContentContainer}>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onMaleRadioButtonDidTap}
                        >
                            {props.gender === GENDER_MALE_CODE ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={MALE}
                                    color={BLACK}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onFemaleRadioButtonDidTap}
                        >
                            {props.gender === GENDER_FEMALE_CODE ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={FEMALE}
                                    color={BLACK}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </React.Fragment>
        );
    }

    function buildPoliticsRadioButtonGroupView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={POLITICAL_EXPOSURE_QUESTION}
                />
                <View style={Style.radioContentContainer}>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onPoliticsYesRadioButtonDidTap}
                        >
                            {props.politicalExposure === true ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

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
                            onPress={onPoliticsNoRadioButtonDidTap}
                        >
                            {props.politicalExposure === false ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

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
};

export const personalDetailsPropTypes = (ZestCASAPersonalDetails.propTypes = {
    // Entry props
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...entryPropTypes,
    ...identityDetailsPropTypes,

    // State
    titleIndex: PropTypes.number,
    titleValue: PropTypes.object,
    gender: PropTypes.number,
    raceIndex: PropTypes.number,
    raceValue: PropTypes.object,
    mobileNumberWithoutExtension: PropTypes.string,
    mobileNumberWithExtension: PropTypes.string,
    emailAddress: PropTypes.string,
    politicalExposure: PropTypes.bool,
    mobileNumberErrorMessage: PropTypes.string,
    emailAddressErrorMessage: PropTypes.string,
    isPersonalContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForPersonalDetails: PropTypes.bool,
    titleDropdownItems: PropTypes.array,
    raceDropdownItems: PropTypes.array,
    isMobileNumberMaskingOn: PropTypes.bool,

    // Dispatch
    getTitleDropdownItems: PropTypes.func,
    getRaceDropdownItems: PropTypes.func,
    updateTitle: PropTypes.func,
    updateGender: PropTypes.func,
    updateRace: PropTypes.func,
    updateMobileNumberWithoutExtension: PropTypes.func,
    updateMobileNumberWithExtension: PropTypes.func,
    updateEmailAddress: PropTypes.func,
    updatePoliticalExposure: PropTypes.func,
    updateConfirmationScreenStatusForPersonalDetails: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearPersonalReducer: PropTypes.func,
    updateMobileNumberMaskFlag: PropTypes.func,
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
});

export default masterDataServiceProps(
    downTimeServiceProps(
        entryProps(
            suitabilityAssessmentProps(
                identityDetailsProps(personalDetailsProps(ZestCASAPersonalDetails))
            )
        )
    )
);

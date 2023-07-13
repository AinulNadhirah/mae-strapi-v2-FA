import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile } from "@screens/PLSTP/PLSTPController";

import { ZEST_CASA_EMPLOYMENT_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TextInputWithReturnType from "@components/TextInputWithReturnType";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import personalDetailsProps from "@redux/connectors/ZestCASA/personalDetailsConnector";
import residentialDetailsProps from "@redux/connectors/ZestCASA/residentialDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    FILL_IN_RESIDENTIAL_DETAILS,
    ZEST_APPLICATION,
    STEP2OF4,
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_TWO,
    ADDRESS_LINE_THREE,
    UNIT_NUMBER,
    FLOOR,
    BUILDING,
    STREET_NAME,
    NEIGHBOURHOOD_NAME,
    STEPUP_MAE_ADDRESS_POSTAL,
    POSTAL_CODE_DUMMY,
    PLEASE_SELECT,
    STEPUP_MAE_ADDRESS_CITY,
    DUMMY_KUALA_LUMPUR,
    PLSTP_STATE,
    M2U_PREMIER_APPLICATION,
    PLSTP_MOBILE_NUM,
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE,
    STEP1OF3,
    PERSONAL_DETAILS_DESC,
} from "@constants/strings";
import { ZEST_NTB_USER, ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import { personalDetailsPropTypes } from "./ZestCASAPersonalDetails";
import {
    APPLY_M2U_PREMIER_ETB_DETAILS,
    APPLY_M2U_PREMIER_RESIDENTAIL_DETAILS,
    APPLY_ZESTI_ETB_DETAILS,
    APPLY_ZESTI_RESIDENTAIL_DETAILS,
} from "./helpers/AnalyticsEventConstants";
import { userStatusBasedAnalyticsName } from "./helpers/ZestHelpers";

const ZestCASAResidentialDetails = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        city,
        mobileNumberWithoutExtension,
        mobileNumberErrorMessage,
        isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn,
        emailAddress,
        emailAddressErrorMessage,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        userStatus === ZEST_NTB_USER
            ? props.checkButtonEnabled()
            : props.checkButtonEnabled(
                  userStatus,
                  mobileNumberWithoutExtension,
                  mobileNumberErrorMessage,
                  emailAddress,
                  emailAddressErrorMessage
              );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        city,
        mobileNumberWithoutExtension,
        emailAddress,
    ]);

    const init = async () => {
        console.log("[ZestCASAResidentialDetails] >> [init]");
        userStatusBasedAnalyticsName(
            userStatus,
            props.isZest,
            APPLY_ZESTI_RESIDENTAIL_DETAILS,
            APPLY_ZESTI_ETB_DETAILS,
            APPLY_M2U_PREMIER_RESIDENTAIL_DETAILS,
            APPLY_M2U_PREMIER_ETB_DETAILS
        );
    };

    function onBackTap() {
        console.log("[ZestCASAResidentialDetails] >> [onBackTap]");
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
        if (props.isResidentialContinueButtonEnabled) {
            props.isFromConfirmationScreenForResidentialDetails
                ? navigation.goBack()
                : navigation.navigate(ZEST_CASA_EMPLOYMENT_DETAILS);
        }
    }

    const stepCount = () => (userStatus === ZEST_NTB_USER ? STEP2OF4 : STEP1OF3);

    const screenDescription = () =>
        userStatus === ZEST_NTB_USER ? FILL_IN_RESIDENTIAL_DETAILS : PERSONAL_DETAILS_DESC;

    function onAddressLineOneInputDidChange(value) {
        props.updateAddressLineOne(value);
    }
    function onAddressLineOneFocus() {
        if (isAddressLineOneMaskingOn) {
            props.updateAddressLineOneMaskFlag(false);
            props.updateAddressLineOne("");
        }
    }

    function onAddressLineTwoInputDidChange(value) {
        props.updateAddressLineTwo(value);
    }
    function onAddressLineTwoFocus() {
        if (isAddressLineTwoMaskingOn) {
            props.updateAddressLineTwoMaskFlag(false);
            props.updateAddressLineTwo("");
        }
    }

    function onAddressLineThreeInputDidChange(value) {
        props.updateAddressLineThree(value);
    }
    function onAddressLineThreeFocus() {
        if (isAddressLineThreeMaskingOn) {
            props.updateAddressLineThreeMaskFlag(false);
            props.updateAddressLineThree("");
        }
    }

    function onPostalCodeInputDidChange(value) {
        props.updatePostalCode(value);
    }

    function onCityInputDidChange(value) {
        props.updateCity(value);
    }

    function onMobileInputDidChange(value) {
        props.updateMobileNumberWithoutExtension(value);
    }

    function onMobileInputFocus() {
        if (isMobileNumberMaskingOn) {
            props.updateMobileNumberMaskFlag(false);
            props.updateMobileNumberWithoutExtension("");
        }
    }

    function onMobileInputEndEditing() {
        props.updateMobileNumberWithExtension(
            SETTINGS_DEFAULT_NUMBER + props.mobileNumberWithoutExtension
        );
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: props.stateIndex,
            filterType: "",
            data: props.stateData,
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        props.updateState(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function getAddressLineOneValue() {
        if (props.addressLineOne) {
            return userStatus && userStatus !== ZEST_NTB_USER && isAddressLineOneMaskingOn
                ? maskAddress(props.addressLineOne)
                : props.addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (props.addressLineTwo) {
            return userStatus && userStatus !== ZEST_NTB_USER && isAddressLineTwoMaskingOn
                ? maskAddress(props.addressLineTwo)
                : props.addressLineTwo;
        }
    }

    function getAddressLineThreeValue() {
        if (props.addressLineThree) {
            return userStatus && userStatus !== ZEST_NTB_USER && isAddressLineThreeMaskingOn
                ? maskAddress(props.addressLineThree)
                : props.addressLineThree;
        }
    }

    function getPostalCodeValue() {
        if (props.postalCode) {
            return props.postalCode;
        }
    }

    function getMobileNumberValue() {
        if (props.mobileNumberWithoutExtension) {
            return userStatus && userStatus !== ZEST_NTB_USER && isMobileNumberMaskingOn
                ? maskMobile(props.mobileNumberWithoutExtension)
                : props.mobileNumberWithoutExtension;
        }
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={stepCount()}
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
                                            text={screenDescription()}
                                        />
                                        <SpaceFiller height={24} />
                                        {buildResidentialDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        props.isResidentialContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        props.isResidentialContinueButtonEnabled ? YELLOW : DISABLED
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
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    selectedIndex={scrollPicker.selectedIndex}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildResidentialDetailsForm() {
        return (
            <React.Fragment>
                {buildMobileNumberTextInput()}
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_ONE}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.addressLineOneErrorMessage}
                    isValid={props.addressLineOneErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
                    onFocus={onAddressLineOneFocus}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_TWO}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.addressLineTwoErrorMessage}
                    isValid={props.addressLineTwoErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
                    onFocus={onAddressLineTwoFocus}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_THREE}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.addressLineThreeErrorMessage}
                    isValid={props.addressLineThreeErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineThreeValue()}
                    placeholder={`e.g ${NEIGHBOURHOOD_NAME}`}
                    onChangeText={onAddressLineThreeInputDidChange}
                    onFocus={onAddressLineThreeFocus}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_POSTAL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={props.postalCodeErrorMessage}
                    isValid={props.postalCodeErrorMessage === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    keyboardType="number-pad"
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                    returnKeyType="done"
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.stateValue && props.stateValue.name
                            ? props.stateValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onStateDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_CITY}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.cityErrorMessage}
                    isValid={props.cityErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.city}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                />
            </React.Fragment>
        );
    }

    function buildMobileNumberTextInput() {
        if (userStatus && userStatus !== ZEST_NTB_USER)
            return (
                <React.Fragment>
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
                        value={getMobileNumberValue()}
                        placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                        onChangeText={onMobileInputDidChange}
                        onFocus={onMobileInputFocus}
                        onEndEditing={onMobileInputEndEditing}
                        prefix={MOB_CODE}
                    />
                    <SpaceFiller height={24} />
                </React.Fragment>
            );
    }
};

export const residentialDetailsPropTypes = (ZestCASAResidentialDetails.propTypes = {
    ...masterDataServicePropTypes,
    ...entryPropTypes,
    ...downTimeServicePropTypes,
    ...personalDetailsPropTypes,

    // State
    addressLineOne: PropTypes.string,
    addressLineTwo: PropTypes.string,
    addressLineThree: PropTypes.string,
    postalCode: PropTypes.string,
    stateIndex: PropTypes.number,
    stateValue: PropTypes.object,
    city: PropTypes.string,
    isResidentialContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForResidentialDetails: PropTypes.bool,
    addressLineOneErrorMessage: PropTypes.string,
    addressLineTwoErrorMessage: PropTypes.string,
    addressLineThreeErrorMessage: PropTypes.string,
    postalCodeErrorMessage: PropTypes.string,
    cityErrorMessage: PropTypes.string,
    stateDropdownItems: PropTypes.array,
    isAddressLineOneMaskingOn: PropTypes.bool,
    isAddressLineTwoMaskingOn: PropTypes.bool,
    isAddressLineThreeMaskingOn: PropTypes.bool,

    // Dispatch
    getStateDropdownItems: PropTypes.func,
    updateAddressLineOne: PropTypes.func,
    updateAddressLineTwo: PropTypes.func,
    updateAddressLineThree: PropTypes.func,
    updatePostalCode: PropTypes.func,
    updateState: PropTypes.func,
    updateCity: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearResidentialReducer: PropTypes.func,
    updateConfirmationScreenStatusForResidentialDetails: PropTypes.func,
    updateAddressLineOneMaskFlag: PropTypes.func,
    updateAddressLineTwoMaskFlag: PropTypes.func,
    updateAddressLineThreeMaskFlag: PropTypes.func,
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
});

export default masterDataServiceProps(
    downTimeServiceProps(
        entryProps(personalDetailsProps(residentialDetailsProps(ZestCASAResidentialDetails)))
    )
);

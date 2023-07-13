import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile, maskCity, maskEmail } from "@screens/PLSTP/PLSTPController";
import { isNTBUser, getAnalyticScreenName } from "@screens/Premier/helpers/premierHelpers";

import {
    PREMIER_EMPLOYMENT_DETAILS,
    PREMIER_RESIDENTIAL_DETAILS,
} from "@navigation/navigationConstant";

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
import { PREMIER_CLEAR_ALL, PMA_NTB_USER } from "@constants/premierConfiguration";
import {
    PM1_APPLICATION_TITLE,
    PMA_APPLICATION_TITLE,
    KAWANKU_SAVINGS_APPLICATION_TITLE,
    KAWANKU_SAVINGSI_APPLICATION_TITLE,
    STEP1OF3,
    STEP2OF4,
} from "@constants/premierStrings";
import {
    CONTINUE,
    FILL_IN_RESIDENTIAL_DETAILS,
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
    PLSTP_MOBILE_NUM,
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE,
    PERSONAL_DETAILS_DESC,
    DUMMY_EMAIL,
    EMAIL_LBL,
    DONE,
    CANCEL,
} from "@constants/strings";

import { personalDetailsPropTypes } from "./PremierPersonalDetails";

const PremierResidentialDetails = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        addressLineOne,
        addressLineTwo,
        addressLineThree,
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
        isCityMaskingOn,
        isEmailMaskingOn,
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
    const [residentialDetailsObject, setResidentialDetailsObject] = useState({});

    useEffect(() => {
        setResidentialDetailsObject({
            addressLineOne,
            addressLineTwo,
            addressLineThree,
            postalCode,
            stateIndex,
            stateValue,
            city,
            mobileNumberWithoutExtension,
            emailAddress,
        });
    }, []);

    useEffect(() => {
        isNTBUser(userStatus)
            ? props.checkButtonEnabled()
            : props.checkButtonEnabled(
                  userStatus,
                  mobileNumberWithoutExtension,
                  mobileNumberErrorMessage,
                  emailAddress,
                  emailAddressErrorMessage
              );
    }, [
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        postalCode,
        stateIndex,
        stateValue,
        city,
        mobileNumberWithoutExtension,
        emailAddress,
    ]);

    function onBackTap() {
        console.log("[PremierResidentialDetails] >> [onBackTap]");

        if (props.isFromConfirmationScreenForResidentialDetails) {
            if (!isNTBUser(userStatus) && emailAddress !== residentialDetailsObject.emailAddress) {
                props.updateEmailAddress(residentialDetailsObject.emailAddress);
                props.updateEmailMaskFlag(true);
            }
            if (
                !isNTBUser(userStatus) &&
                mobileNumberWithoutExtension !==
                    residentialDetailsObject.mobileNumberWithoutExtension
            ) {
                props.updateMobileNumberWithoutExtension(
                    residentialDetailsObject.mobileNumberWithoutExtension
                );
                props.updateMobileNumberMaskFlag(true);
            }
            if (
                addressLineOne !== "" &&
                addressLineOne !== residentialDetailsObject.addressLineOne
            ) {
                props.updateAddressLineOne(residentialDetailsObject.addressLineOne);
                props.updateAddressLineOneMaskFlag(true);
            }
            if (
                addressLineTwo !== "" &&
                addressLineTwo !== residentialDetailsObject.addressLineTwo
            ) {
                props.updateAddressLineTwo(residentialDetailsObject.addressLineTwo);
                props.updateAddressLineTwoMaskFlag(true);
            }
            if (
                (typeof addressLineThree === "string" || !addressLineThree) &&
                addressLineThree !== residentialDetailsObject.addressLineThree
            ) {
                props.updateAddressLineThree(
                    residentialDetailsObject.addressLineThree === null
                        ? ""
                        : residentialDetailsObject.addressLineThree
                );
                props.updateAddressLineThreeMaskFlag(true);
            }
            if (postalCode !== residentialDetailsObject.postalCode) {
                props.updatePostalCode(residentialDetailsObject.postalCode);
            }
            if (stateValue) {
                props.updateState(
                    residentialDetailsObject.stateIndex,
                    residentialDetailsObject.stateValue
                );
            }
            if (city !== residentialDetailsObject.city) {
                props.updateCity(residentialDetailsObject.city);
                props.updateCityMaskFlag(true);
            }
        }
        navigation.goBack();
    }

    function onCloseTap() {
        // Clear all data from PMA reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.popToTop();
        navigation.goBack();
    }

    function getProductTitle() {
        if (entryReducer.isPM1) {
            return PM1_APPLICATION_TITLE;
        } else if (entryReducer.isPMA) {
            return PMA_APPLICATION_TITLE;
        } else if (entryReducer.isKawanku) {
            return KAWANKU_SAVINGS_APPLICATION_TITLE;
        } else if (entryReducer.isKawankuSavingsI) {
            return KAWANKU_SAVINGSI_APPLICATION_TITLE;
        }
    }

    function onNextTap() {
        if (props.isResidentialContinueButtonEnabled) {
            props.isFromConfirmationScreenForResidentialDetails
                ? navigation.goBack()
                : navigation.navigate(PREMIER_EMPLOYMENT_DETAILS);
        }
    }

    const stepCount = () => {
        if (userStatus === PMA_NTB_USER) {
            return STEP2OF4;
        } else {
            return isNTBUser(userStatus) ? STEP2OF4 : STEP1OF3;
        }
    };

    const screenDescription = () =>
        isNTBUser(userStatus) ? FILL_IN_RESIDENTIAL_DETAILS : PERSONAL_DETAILS_DESC;

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

    function onCityFocus() {
        if (isCityMaskingOn) {
            props.updateCityMaskFlag(false);
            props.updateCity("");
        }
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

    function onEmailInputDidChange(value) {
        props.updateEmailAddress(value);
    }

    function onEmailFocus() {
        if (isEmailMaskingOn) {
            props.updateEmailMaskFlag(false);
            props.updateEmailAddress("");
        }
    }

    function getAddressLineOneValue() {
        if (props.addressLineOne) {
            return !isNTBUser(userStatus) && isAddressLineOneMaskingOn
                ? maskAddress(props.addressLineOne)
                : props.addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (props.addressLineTwo) {
            return !isNTBUser(userStatus) && isAddressLineTwoMaskingOn
                ? maskAddress(props.addressLineTwo)
                : props.addressLineTwo;
        }
    }

    function getAddressLineThreeValue() {
        if (props.addressLineThree) {
            return !isNTBUser(userStatus) && isAddressLineThreeMaskingOn
                ? maskAddress(props.addressLineThree)
                : props.addressLineThree;
        }
    }

    function getCityValue() {
        if (props.city) {
            return props.city;
        }
    }

    function getEmailValue() {
        if (props.emailAddress) {
            return !isNTBUser(userStatus) && isEmailMaskingOn
                ? maskEmail(props.emailAddress)
                : props.emailAddress;
        }
    }

    function getPostalCodeValue() {
        if (props.postalCode) {
            return props.postalCode;
        }
    }

    function getMobileNumberValue() {
        if (props.mobileNumberWithoutExtension) {
            return !isNTBUser(userStatus) && isMobileNumberMaskingOn
                ? maskMobile(props.mobileNumberWithoutExtension)
                : props.mobileNumberWithoutExtension;
        }
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer,
        PREMIER_RESIDENTIAL_DETAILS,
        userStatus
    );

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
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
                                    text={getProductTitle()}
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
                            activeOpacity={props.isResidentialContinueButtonEnabled ? 1 : 0.5}
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
            </ScreenLayout>
            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={onScrollPickerDoneButtonDidTap}
                onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );

    function buildResidentialDetailsForm() {
        return (
            <>
                {buildMobileNumberTextInput()}
                {buildEmailTextInput()}
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_ONE}
                    color={BLACK}
                />
                <SpaceFiller height={16} />
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
                <SpaceFiller height={16} />
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
                <SpaceFiller height={16} />
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
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={props.postalCodeErrorMessage}
                    isValid={props.postalCodeErrorMessage === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    keyboardType="number-pad"
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    titleFontWeight="400"
                    dropdownTitle={props?.stateValue?.name ?? PLEASE_SELECT}
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
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={props.cityErrorMessage}
                    isValid={props.cityErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getCityValue()}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                    onFocus={onCityFocus}
                />
            </>
        );
    }

    function buildMobileNumberTextInput() {
        if (!isNTBUser(userStatus)) {
            return (
                <>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={PLSTP_MOBILE_NUM}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <TextInput
                        errorMessage={props.mobileNumberErrorMessage}
                        isValid={props.mobileNumberErrorMessage === null}
                        isValidate
                        maxLength={10}
                        keyboardType="number-pad"
                        value={getMobileNumberValue()}
                        placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                        onChangeText={onMobileInputDidChange}
                        onFocus={onMobileInputFocus}
                        onEndEditing={onMobileInputEndEditing}
                        prefix={MOB_CODE}
                    />
                    <SpaceFiller height={24} />
                </>
            );
        }
    }

    function buildEmailTextInput() {
        if (!isNTBUser(userStatus)) {
            return (
                <>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={EMAIL_LBL}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <TextInput
                        errorMessage={props.emailAddressErrorMessage}
                        isValid={props.emailAddressErrorMessage === null}
                        isValidate
                        maxLength={40}
                        value={getEmailValue()}
                        placeholder={`e.g ${DUMMY_EMAIL}`}
                        onChangeText={onEmailInputDidChange}
                        onFocus={onEmailFocus}
                    />
                    <SpaceFiller height={24} />
                </>
            );
        }
    }
};

export const residentialDetailsPropTypes = (PremierResidentialDetails.propTypes = {
    ...masterDataServicePropTypes,
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
        entryProps(personalDetailsProps(residentialDetailsProps(PremierResidentialDetails)))
    )
);

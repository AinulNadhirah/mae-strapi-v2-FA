import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile, maskEmail, maskPostCode } from "@screens/PLSTP/PLSTPController";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TextInputWithReturnType from "@components/TextInputWithReturnType";

import {
    GUARANTOR_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_CITY_ACTION,
    GUARANTOR_CITY_MASK_ACTION,
    GUARANTOR_COUNTRY_ACTION,
    GUARANTOR_EDUCATION_ACTION,
    GUARANTOR_EMAIL_MASK_ACTION,
    GUARANTOR_MARITAL_ACTION,
    GUARANTOR_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
    GUARANTOR_POSTAL_CODE_ACTION,
    GUARANTOR_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_RACE_ACTION,
    GUARANTOR_STATE_ACTION,
    GUARANTOR_EMAIL_ADDRESS_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_IS_STATE_ENABLED_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_TWO,
    UNIT_NUMBER,
    FLOOR,
    BUILDING,
    STREET_NAME,
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
    DUMMY_EMAIL,
    EMAIL_LBL,
    PLSTP_MARITAL_STATUS,
    PLSTP_EDUCATION,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    CANCEL,
    UPDATE_PERSONAL_DETAILS,
    DEC_PERSONAL_DETAILS,
    ASB_GUARANTOR_PERSONAL_INFORMATION_HEADING,
    ASB_GUARANTOR_PERSONAL_INFORMATION_SUB_HEADING,
    RESIDENT_STATUS,
    PLSTP_SAVE_NEXT,
    DONE,
    OKAY,
    LEAVE,
    COUNTRY,
    STEP,
    ASB_NATIVE,
} from "@constants/strings";

const GuarantorPersonalInformation = ({ navigation, route }) => {
    const { currentSteps, totalSteps } = route?.params;

    // Hooks for access reducer data
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );
    const allStateList = masterDataReducer.status === "success" ? masterDataReducer?.allState : [];
    const raceData = prePostQualReducer.raceValue;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const {
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        postalCode,
        stateIndex,
        stateValue,
        maritalIndex,
        maritalValue,
        educationIndex,
        educationValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        mobileNumberErrorMessage,
        isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn,
        isMobileNumberMaskingOn,
        isPostalCodeMaskingOn,
        isCityMaskingOn,
        isEmailMaskingOn,
        emailAddress,
        raceIndex,
        raceValue,
        isPersonalInformationContinueButtonEnabled,
        emailAddressErrorMessage,
        cityErrorMessage,
        postalCodeErrorMessage,
        addressLineTwoErrorMessage,
        addressLineOneErrorMessage,
        isStateDropdownEnabled,
    } = personalInformationReducer;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);
    const [maritalScrollPicker, setMaritalScrollPicker] = useState(scrollPickerInitialState);
    const [educationScrollPicker, setEducationScrollPicker] = useState(scrollPickerInitialState);
    const [countryScrollPicker, setCountryScrollPicker] = useState(scrollPickerInitialState);
    const [raceScrollPicker, setRaceScrollPicker] = useState(scrollPickerInitialState);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [stateDropdownList, setStateDropdownList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const stpReferenceNumber = route?.params?.stpDetails
        ? route.params.stpDetails?.stpReferenceNo
        : prePostQualReducer?.stpreferenceNo;

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch({
            type: GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
            raceData: raceData,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        maritalIndex,
        maritalValue,
        educationIndex,
        educationValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        emailAddress,
        raceIndex,
        raceValue,
    ]);

    const init = async () => {
        console.log("[GuarantorPersonalInformation] >> [init]");
        if (countryValue && countryValue.value) {
            getReleventState(countryValue.value);
        }
    };

    const getReleventState = async (country) => {
        const stateList = allStateList.find(({ value }) => value === country);
        var stateListData = JSON.stringify(stateList.name);
        const stateListDataArray = stateListData.split('"');
        const finalStateList = stateListDataArray[1].split(",");
        var arr = [];
        var len = finalStateList.length;
        for (var i = 0; i < len; i++) {
            arr.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }
        setStateDropdownList(arr);
    };

    function onBackTap() {
        console.log("[GuarantorPersonalInformation] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("open confirm popup");
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        console.log("[GuarantorPersonalInformation]->>[handleLeaveButton]");
        updateApiCEP(() => {});
    };

    const onNextTap = async () => {
        setShowPopup(false);
        if (isPersonalInformationContinueButtonEnabled) {
            console.log("[GuarantorPersonalInformation]->>[onNextTap]");
            updateApiCEP(() => {});
        }
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "10",
            stpReferenceNo: stpReferenceNumber,
            maritalStatusCode: maritalValue?.value,
            maritalStatusDesc: maritalValue?.name,
            educationCode: educationValue?.value,
            educationDesc: educationValue?.name,
            mobileNumber: mobileNumberWithoutExtension,
            emailAddress: emailAddress,
            homeCountry: countryValue?.value,
            addressLine1: addressLineOne,
            addressLine2: addressLineTwo,
            addressLine3: addressLineThree,
            homePostCode: postalCode,
            homeStateCode: stateValue?.value,
            homeStateDesc: stateValue?.name,
            homeCity: city,
            raceCode: raceValue?.value,
            raceDesc: raceValue?.name,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data) {
                    if (callback) {
                        callback();
                    }
                }
            })
        );
    }

    function onAddressLineOneInputDidChange(value) {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOn: false,
        });
        dispatch({ type: GUARANTOR_ADDRESS_LINE_ONE_ACTION, addressLineOne: value });
    }

    function onAddressLineTwoInputDidChange(value) {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOn: false,
        });
        dispatch({ type: GUARANTOR_ADDRESS_LINE_TWO_ACTION, addressLineTwo: value });
    }

    function onPostalCodeInputDidChange(value) {
        dispatch({ type: GUARANTOR_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
        dispatch({ type: GUARANTOR_POSTAL_CODE_ACTION, postalCode: value });
    }

    function onCityInputDidChange(value) {
        dispatch({ type: GUARANTOR_CITY_MASK_ACTION, isCityMaskingOn: false });
        dispatch({ type: GUARANTOR_CITY_ACTION, city: value });
    }

    function onMobileInputDidChange(value) {
        dispatch({ type: GUARANTOR_MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: false });
        dispatch({
            type: GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: value,
        });
    }

    function onMobileInputEndEditing() {
        dispatch({
            type: GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension: SETTINGS_DEFAULT_NUMBER + mobileNumberWithoutExtension,
        });
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: stateIndex,
            filterType: "",
            data: stateDropdownList,
        });
    }

    function onMaritalDropdownPillDidTap() {
        setMaritalScrollPicker({
            isDisplay: true,
            selectedIndex: maritalIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.maritalStatus : [],
        });
    }

    function onEducationDropdownPillDidTap() {
        setEducationScrollPicker({
            isDisplay: true,
            selectedIndex: educationIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.education : [],
        });
    }

    function onCountryDropdownPillDidTap() {
        setCountryScrollPicker({
            isDisplay: true,
            selectedIndex: countryIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.country : [],
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_STATE_ACTION, stateIndex: index, stateValue: data });
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onMaritalScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_MARITAL_ACTION, maritalIndex: index, maritalValue: data });
        setMaritalScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEducationScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_EDUCATION_ACTION, educationIndex: index, educationValue: data });
        setEducationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_COUNTRY_ACTION, countryIndex: index, countryValue: data });
        dispatch({ type: GUARANTOR_STATE_ACTION, stateIndex: 0, stateValue: null });
        getReleventState(data.value);
        dispatch({ type: GUARANTOR_IS_STATE_ENABLED_ACTION, isStateDropdownEnabled: true });
        setCountryScrollPicker({
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

    function onMaritalScrollPickerCancelButtonDidTap() {
        setMaritalScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEducationScrollPickerCancelButtonDidTap() {
        setEducationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerCancelButtonDidTap() {
        setCountryScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onRaceDropdownPillDidTap() {
        setRaceScrollPicker({
            isDisplay: true,
            selectedIndex: raceIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.personalInfoRace : [], //fetch data from master data
        });
    }

    function onRaceScrollPickerDoneButtonDidTap(data, index) {
        console.log("onRaceScrollPickerDoneButtonDidTap -> ", data, index);
        dispatch({ type: GUARANTOR_RACE_ACTION, raceIndex: index, raceValue: data });
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmailInputDidChange(value) {
        dispatch({ type: GUARANTOR_EMAIL_MASK_ACTION, isEmailMaskingOn: false });
        dispatch({ type: GUARANTOR_EMAIL_ADDRESS_ACTION, emailAddress: value });
    }

    function getAddressLineOneValue() {
        if (addressLineOne) {
            return isAddressLineOneMaskingOn ? maskAddress(addressLineOne) : addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (addressLineTwo) {
            return isAddressLineTwoMaskingOn ? maskAddress(addressLineTwo) : addressLineTwo;
        }
    }

    function getPostalCodeValue() {
        return isPostalCodeMaskingOn ? maskPostCode(postalCode) : postalCode;
    }

    function getMobileNumberValue() {
        if (mobileNumberWithoutExtension) {
            return isMobileNumberMaskingOn
                ? maskMobile(mobileNumberWithoutExtension)
                : mobileNumberWithoutExtension;
        }
    }

    function getEmailAddressValue() {
        if (emailAddress) {
            return isEmailMaskingOn ? maskEmail(emailAddress) : emailAddress;
        }
    }
    function getCityValue() {
        if (city) {
            return isCityMaskingOn ? maskAddress(city) : city;
        }
    }

    function onPopupShow() {
        setShowPopup(true);
    }

    function onPopupDismiss() {
        setShowPopup(false);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Asb_Finance_Personal_Information"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={`${STEP} ${currentSteps} of ${totalSteps}`}
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
                                style={Style.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={Style.formContainer}>
                                    <View>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={ASB_GUARANTOR_PERSONAL_INFORMATION_HEADING}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={ASB_GUARANTOR_PERSONAL_INFORMATION_SUB_HEADING}
                                        />
                                        {buildPersonalInformationForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isPersonalInformationContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isPersonalInformationContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_SAVE_NEXT}
                                        />
                                    }
                                    onPress={onPopupShow}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupDismiss}
                    title={UPDATE_PERSONAL_DETAILS}
                    description={DEC_PERSONAL_DETAILS}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupDismiss,
                    }}
                    primaryAction={{
                        text: OKAY,
                        onPress: onNextTap,
                    }}
                />
                <ScrollPickerView
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    selectedIndex={scrollPicker.selectedIndex}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={raceScrollPicker.isDisplay}
                    list={raceScrollPicker.data}
                    selectedIndex={raceScrollPicker.selectedIndex}
                    onRightButtonPress={onRaceScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <ScrollPickerView
                    showMenu={maritalScrollPicker.isDisplay}
                    list={maritalScrollPicker.data}
                    selectedIndex={maritalScrollPicker.selectedIndex}
                    onRightButtonPress={onMaritalScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onMaritalScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={educationScrollPicker.isDisplay}
                    list={educationScrollPicker.data}
                    selectedIndex={educationScrollPicker.selectedIndex}
                    onRightButtonPress={onEducationScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onEducationScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={countryScrollPicker.isDisplay}
                    list={countryScrollPicker.data}
                    selectedIndex={countryScrollPicker.selectedIndex}
                    onRightButtonPress={onCountryScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onCountryScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildPersonalInformationForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={PLSTP_MARITAL_STATUS}
                    dropdownTitle={
                        maritalValue && maritalValue.name ? maritalValue.name : PLEASE_SELECT
                    }
                    dropdownOnPress={onMaritalDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                <TitleAndDropdownPill
                    title={PLSTP_EDUCATION}
                    dropdownTitle={educationValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onEducationDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                {raceData === ASB_NATIVE ? (
                    <TitleAndDropdownPill
                        title={RESIDENT_STATUS}
                        dropdownTitle={raceValue?.name ?? PLEASE_SELECT}
                        dropdownOnPress={onRaceDropdownPillDidTap}
                        removeTopMargin={true}
                        titleFontWeight="400"
                    />
                ) : null}

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
                    errorMessage={emailAddressErrorMessage}
                    isValid={emailAddressErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getEmailAddressValue()}
                    placeholder={`e.g ${DUMMY_EMAIL}`}
                    onChangeText={onEmailInputDidChange}
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
                <TextInputWithReturnType
                    errorMessage={mobileNumberErrorMessage}
                    isValid={mobileNumberErrorMessage === null}
                    isValidate
                    maxLength={10}
                    value={getMobileNumberValue()}
                    placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                    onChangeText={onMobileInputDidChange}
                    onEndEditing={onMobileInputEndEditing}
                    prefix={MOB_CODE}
                    keyboardType="number-pad"
                />

                <TitleAndDropdownPill
                    title={COUNTRY}
                    dropdownTitle={
                        countryValue && countryValue?.name ? countryValue?.name : PLEASE_SELECT
                    }
                    dropdownOnPress={onCountryDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                <SpaceFiller height={24} />

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
                    errorMessage={addressLineOneErrorMessage}
                    isValid={addressLineOneErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
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
                    errorMessage={addressLineTwoErrorMessage}
                    isValid={addressLineTwoErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
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
                    errorMessage={cityErrorMessage}
                    isValid={cityErrorMessage === null}
                    isValidate
                    maxLength={30}
                    value={getCityValue()}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    dropdownTitle={stateValue && stateValue.name ? stateValue.name : PLEASE_SELECT}
                    dropdownOnPress={onStateDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    isDisabled={!isStateDropdownEnabled}
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
                    errorMessage={postalCodeErrorMessage}
                    isValid={postalCodeErrorMessage === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                    keyboardType="number-pad"
                />
            </React.Fragment>
        );
    }
};

export const personalInformationPropTypes = (GuarantorPersonalInformation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
});

export default GuarantorPersonalInformation;

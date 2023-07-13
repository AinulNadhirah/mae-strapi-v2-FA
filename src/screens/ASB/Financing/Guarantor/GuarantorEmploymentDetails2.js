import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile, maskPostCode } from "@screens/PLSTP/PLSTPController";

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
    GUARANTOR_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_POSTAL_CODE_ACTION,
    GUARANTOR_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_STATE_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_IS_STATE_ENABLED_ACTION,
    GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
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
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    CANCEL,
    UPDATE_PERSONAL_DETAILS,
    DEC_PERSONAL_DETAILS,
    DONE,
    OKAY,
    LEAVE,
    COUNTRY,
    GUARANTOR,
    OCCUPATION_INFORMATION_CHECK_UPDATE,
    CONTINUE,
    OFFICE_ADDR1,
    OFFICE_PHNO,
    OFFICE_ADDR2,
    STEP,
} from "@constants/strings";

const GuarantorEmploymentDetails2 = ({ navigation, route }) => {
    const { currentSteps, totalSteps } = route?.params;

    // Hooks for access reducer data
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const allStateList = masterDataReducer.status === "success" ? masterDataReducer?.allState : [];

    const {
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        maritalValue,
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
        isEmploeymentDetails2ContinueButtonEnabled,
        cityErrorMessage,
        postalCodeErrorMessage,
        addressLineTwoErrorMessage,
        addressLineOneErrorMessage,
        isStateDropdownEnabled,
    } = personalInformationReducer;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);
    const [countryScrollPicker, setCountryScrollPicker] = useState(scrollPickerInitialState);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [stateDropdownList, setStateDropdownList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const stpReferenceNumber = prePostQualReducer?.stpreferenceNo;

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
    ]);

    const init = async () => {
        console.log("[GuarantorEmploymentDetails2] >> [init]");
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
        console.log("[GuarantorEmploymentDetails2] >> [onBackTap]");
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
        console.log("[GuarantorEmploymentDetails2]->>[handleLeaveButton]", maritalValue);
        updateApiCEP(() => {});
    };

    const onNextTap = async () => {
        setShowPopup(false);
        if (isEmploeymentDetails2ContinueButtonEnabled) {
            console.log("[GuarantorEmploymentDetails2]->>[onNextTap]", maritalValue);
            updateApiCEP(() => {});
        }
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "12",
            stpReferenceNo: stpReferenceNumber,
            officePhoneNumber: mobileNumberWithoutExtension,
            employerCountry: countryValue?.value,
            officeAddressLine1: addressLineOne,
            officeAddressLine2: addressLineTwo,
            officeAddressLine3: null,
            employerPostCode: postalCode,
            employerStateCode: stateValue?.value,
            employerStateDesc: stateValue?.name,
            employerCity: city,
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

    function onCountryScrollPickerCancelButtonDidTap() {
        setCountryScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
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
                                    fontSize={12}
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
                                            text={GUARANTOR}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={OCCUPATION_INFORMATION_CHECK_UPDATE}
                                        />
                                        {buildOccupationInformation2Form()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isEmploeymentDetails2ContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isEmploeymentDetails2ContinueButtonEnabled
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

    function buildOccupationInformation2Form() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={COUNTRY}
                    dropdownTitle={countryValue?.name ?? PLEASE_SELECT}
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
                    text={OFFICE_ADDR1}
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
                    text={OFFICE_ADDR2}
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
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    dropdownTitle={stateValue.name ?? PLEASE_SELECT}
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
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={OFFICE_PHNO}
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
            </React.Fragment>
        );
    }
};

export const personalInformationPropTypes = (GuarantorEmploymentDetails2.propTypes = {
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

export default GuarantorEmploymentDetails2;

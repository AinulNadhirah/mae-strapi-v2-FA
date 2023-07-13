import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile, maskEmail } from "@screens/PLSTP/PLSTPController";

import {
    OCCUPATION_INFORMATION,
    APPLY_LOANS,
    APPLICATIONCONFIRMATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import { ScrollPickerViewWithResetOption } from "@components/Common/ScrollPickerViewWithResetOption";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import entryProps from "@redux/connectors/ASBFinance/entryConnector";
import personalInformationProps from "@redux/connectors/ASBFinance/personalInformationConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/ASBServices/masterDataConnector";

import { BLACK, DISABLED, YELLOW } from "@constants/colors";
import {
    ASB_FINANCING,
    PERSONAL_INFORMATION_CHECK_UPDATE,
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
    DUMMY_EMAIL,
    EMAIL_LBL,
    STEPUP_MAE_RACE,
    PLSTP_MARITAL_STATUS,
    PLSTP_EDUCATION,
    COUNTRY,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    UPDATE,
    UPDATE_PERSONAL_DETAILS,
    DEC_PERSONAL_DETAILS,
    CANCEL,
    OKAY,
    DONE,
    LEAVE,
    ASB_NTB_USER,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import { ResumeDataForPersonalDetails } from "./helpers/CustomerDetailsPrefiller";

const AsbFinancePersonalInformation = (props) => {
    const { navigation } = props;
    const { route } = props;

    // Hooks for access reducer data
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);

    const { userStatus } = prePostQualReducer;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const allStateList = masterDataReducer.status === "success" ? masterDataReducer?.allState : [];
    const resumeReducer = useSelector((state) => state.resumeReducer);

    const {
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
        mobileNumberErrorMessage,
        isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn,
        isPostalCodeMaskingOn,
        isCityMaskingOn,
        isEmailMaskingOn,
        emailAddress,
        raceIndex,
        raceValue,
    } = props;

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
    const [isNative, setIsNative] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [stateDropdownList, setStateDropdownList] = useState([]);
    const resumeStpDetails = resumeReducer?.stpDetails;

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const [showPopup, setShowPopup] = useState(false);
    const [resetValueState, setResetValueState] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        userStatus === ASB_NTB_USER
            ? props.checkButtonEnabled()
            : props.checkButtonEnabled(
                  userStatus,
                  mobileNumberWithoutExtension,
                  mobileNumberErrorMessage,
                  prePostQualReducer.raceValue
              );

        checkIfNative();
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
        if (props.countryValue && props.countryValue.value) {
            getReleventState(props.countryValue.value);
        }
    };

    useEffect(() => {
        const reload = route?.params?.reload;

        if (reload || resumeStpDetails) {
            let stpHomeCountry = "";
            let stpHomeCountryCode = "";
            let stpHomeStateIndex = "";
            const stpFilteredHomeCountry = masterDataReducer?.country?.filter((employee) => {
                return employee.value === resumeStpDetails?.stpHomeCountry;
            });

            if (stpFilteredHomeCountry && stpFilteredHomeCountry.length > 0) {
                stpHomeCountry = stpFilteredHomeCountry[0].name;
                stpHomeCountryCode = stpFilteredHomeCountry[0].value;
            }

            const data = {
                stpHomeCountry,
                stpHomeCountryCode,

                stpMaritalStatusDesc: resumeStpDetails?.stpMaritalStatusDesc,
                stpEducationDesc: resumeStpDetails?.stpEducationDesc,
                stpEmployerStateCode: resumeStpDetails?.stpEmployerStateCode,
                stpHomeStateDesc: resumeStpDetails?.stpHomeStateDesc,
                stpHomeStateCode: resumeStpDetails?.stpHomeStateCode,
            };

            props.updateMobileNumberWithoutExtension(
                resumeStpDetails?.stpMobileContactPrefix?.replace(/^0+/, "") +
                    resumeStpDetails?.stpMobileContactNumber
            );
            props.updateMobileNumberMaskFlag(true);

            props.updateEmailAddress(resumeStpDetails?.stpEmail);
            props.updateEmailMaskFlag(true);

            props.updateAddressLineOne(resumeStpDetails?.stpHomeAddress1);
            props.updateAddressLineOneMaskFlag(true);

            props.updateAddressLineTwo(resumeStpDetails?.stpHomeAddress2);
            props.updateAddressLineTwoMaskFlag(true);

            props.updateAddressLineThree(resumeStpDetails?.stpHomeAddress3);
            props.updateAddressLineThreeMaskFlag(true);

            props.updatePostalCode(resumeStpDetails?.stpHomePostcode);
            props.updatePostalCodeMaskFlag(true);

            getReleventState(resumeStpDetails?.stpHomeCountry);

            if (resumeStpDetails?.stpHomeCountry && stateDropdownList) {
                stateDropdownList.map((data, index) => {
                    if (data.name === resumeStpDetails?.stpHomeStateDesc) {
                        stpHomeStateIndex = index;
                    }
                });

                props.updateState(stpHomeStateIndex, {
                    name: resumeStpDetails?.stpHomeStateDesc,
                    value: resumeStpDetails?.stpHomeStateDesc,
                });
            }

            props.updateCity(resumeStpDetails?.stpHomeCity);
            props.updateCityMaskFlag(true);

            ResumeDataForPersonalDetails(dispatch, data, masterDataReducer);
        }
    }, [route.params]);

    const getReleventState = async (country) => {
        const stateList = allStateList?.find(({ value }) => value === country);

        var stateListData = JSON.stringify(stateList?.name);
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
        if (
            props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION &&
            props?.route?.params?.isEmployeeDataMissing
        ) {
            navigation.navigate(APPLICATIONCONFIRMATION); // resume *
        } else if (props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION) {
            navigation.navigate(APPLICATIONCONFIRMATION);
        } else {
            navigation.navigate(APPLICATIONCONFIRMATION); // resume *
        }
    }

    function onCloseTap() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    const onPopupCloseConfirm = () => {
        setShowPopupConfirm(false);
    };

    const handleLeaveBtn = async () => {
        try {
            setShowPopupConfirm(false);

            const body = {
                screenNo: "10",
                stpReferenceNo: stpReferenceNumber,
                maritalStatusCode: props?.maritalValue?.value,
                maritalStatusDesc: props?.maritalValue?.name,
                educationCode: props?.educationValue?.value,
                educationDesc: props?.educationValue?.name,
                mobileNumber: props?.mobileNumberWithoutExtension,
                emailAddress: props?.emailAddress,
                homeCountry: props?.countryValue?.value,
                addressLine1: props?.addressLineOne?.trim(),
                addressLine2: props?.addressLineTwo?.trim(),
                addressLine3: props?.addressLineThree?.trim(),
                homePostCode: props?.postalCode,
                homeStateCode: props?.stateValue?.value,
                homeStateDesc: props?.stateValue?.name,
                homeCity: props?.city?.trim(),
                raceCode: prePostQualReducer?.raceCode,
                raceDesc: prePostQualReducer?.raceValue,
                ethnicCode: props?.raceValue?.value,
            };

            const response = await updateApiCEP(body, false);
            const result = response?.data?.result.msgHeader;

            if (result.responseCode === "0000") {
                navigation.navigate(APPLY_LOANS);
            }
        } catch (error) {
            console.log("try ", error);
        }
    };

    const onNextTap = async () => {
        setShowPopup(false);
        try {
            if (props.isResidentialContinueButtonEnabled) {
                const body = {
                    screenNo: "10",
                    stpReferenceNo: stpReferenceNumber,
                    maritalStatusCode: props?.maritalValue?.value,
                    maritalStatusDesc: props?.maritalValue?.name,
                    educationCode: props?.educationValue?.value,
                    educationDesc: props?.educationValue?.name,
                    mobileNumber: props?.mobileNumberWithoutExtension,
                    emailAddress: props?.emailAddress,
                    homeCountry: props?.countryValue?.value,
                    addressLine1: props?.addressLineOne?.trim(),
                    addressLine2: props?.addressLineTwo?.trim(),
                    addressLine3: props?.addressLineThree?.trim(),
                    homePostCode: props?.postalCode,
                    homeStateCode: props?.stateValue?.value,
                    homeStateDesc: props?.stateValue?.name,
                    homeCity: props?.city?.trim(),
                    raceCode: prePostQualReducer?.raceCode,
                    raceDesc: prePostQualReducer?.raceValue,
                    ethnicCode: props?.raceValue?.value,
                };
                dispatch({
                    screenNo: "10",
                    type: "RESUME_UPDATE",
                    stpEmail: props.emailAddress,
                    stpHomeAddress1: props.addressLineOne?.trim(),
                    stpHomeAddress2: props.addressLineTwo?.trim(),
                    stpHomeAddress3: props.addressLineThree?.trim(),
                    stpHomePostcode: props.postalCode,
                    stpHomeCity: props.city?.trim(),
                    stpMobileContactNumber: props.mobileNumberWithoutExtension,
                    stpMaritalStatusDesc: props.maritalValue?.name,
                    stpMaritalStatusCode: props.maritalValue?.value,
                    stpEducationCode: props.educationValue?.value,
                    stpEducationDesc: props.educationValue?.name,
                    stpHomeCountry: props.countryValue?.value,
                    stpHomeStateCode: props.stateValue?.value,
                    stpHomeStateDesc: props.stateValue?.name,
                });

                const response = await updateApiCEP(body, false);
                const result = response?.data?.result.msgHeader;

                if (result.responseCode === "0000") {
                    if (
                        (props?.route?.params?.comingFrom === APPLICATIONCONFIRMATION &&
                            props?.route?.params?.isEmployeeDataMissing) ||
                        props?.route?.params?.isEmployeeDataMissing
                    ) {
                        navigation.navigate(OCCUPATION_INFORMATION, {
                            comingFrom: APPLICATIONCONFIRMATION,
                        });
                    } else {
                        navigation.navigate(APPLICATIONCONFIRMATION);
                    }
                }
            }
        } catch (error) {}
    };

    function checkIfNative() {
        if (prePostQualReducer.raceValue) {
            const raceData = prePostQualReducer.raceValue;
            if (raceData === "NATIVE") {
                setIsNative(true);
            } else {
                setIsNative(false);

                props.updateRace(0, props.race[0]);
            }
        }
    }

    function onAddressLineOneInputDidChange(value) {
        props.updateAddressLineOneMaskFlag(false);
        props.updateAddressLineOne(value);
    }
    function onAddressLineOneInputDidFocus() {
        props.updateAddressLineOneMaskFlag(false);
    }

    function onAddressLineTwoInputDidChange(value) {
        props.updateAddressLineTwoMaskFlag(false);
        props.updateAddressLineTwo(value);
    }
    function onAddressLineTwoInputDidFocus() {
        props.updateAddressLineTwoMaskFlag(false);
    }

    function onAddressLineThreeInputDidChange(value) {
        props.updateAddressLineThreeMaskFlag(false);
        props.updateAddressLineThree(value);
    }
    function onAddressLineThreeInputDidFocus() {
        props.updateAddressLineThreeMaskFlag(false);
    }

    function onPostalCodeInputDidChange(value) {
        props.updatePostalCodeMaskFlag(false);
        props.updatePostalCode(value);
    }

    function onPostalCodeInputDidFocus() {
        props.updatePostalCodeMaskFlag(false);
    }

    function onCityInputDidChange(value) {
        props.updateCityMaskFlag(false);
        props.updateCity(value);
    }

    function onCityInputDidFocus() {
        props.updateCityMaskFlag(false);
    }

    function onMobileInputDidChange(value) {
        props.updateMobileNumberMaskFlag(false);
        props.updateMobileNumberWithoutExtension(value);
    }
    function onMobileInputDidFocus() {
        props.updateMobileNumberMaskFlag(false);
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
            data: stateDropdownList,
        });
    }

    function onMaritalDropdownPillDidTap() {
        setMaritalScrollPicker({
            isDisplay: true,
            selectedIndex: props.maritalIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.maritalStatus : [],
        });
    }

    function onEducationDropdownPillDidTap() {
        setEducationScrollPicker({
            isDisplay: true,
            selectedIndex: props.educationIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.education : [],
        });
    }

    function onCountryDropdownPillDidTap() {
        setCountryScrollPicker({
            isDisplay: true,
            selectedIndex: props.countryIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.country : [],
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

    function onMaritalScrollPickerDoneButtonDidTap(data, index) {
        props.updateMarital(index, data);
        setMaritalScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEducationScrollPickerDoneButtonDidTap(data, index) {
        props.updateEducation(index, data);
        setEducationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerDoneButtonDidTap(data, index) {
        setResetValueState(true);
        props.updateCountry(index, data);
        props.updateState(0, null);
        getReleventState(data.value);
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
            selectedIndex: props.raceIndex,
            filterType: "",
            data: masterDataReducer.status === "success" ? masterDataReducer?.personalInfoRace : [],
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
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmailInputDidChange(value) {
        props.updateEmailMaskFlag(false);
        props.updateEmailAddress(value);
    }

    function onEmailInputDidFocus() {
        props.updateEmailMaskFlag(false);
    }

    function getAddressLineOneValue() {
        if (props.addressLineOne) {
            return isAddressLineOneMaskingOn
                ? maskAddress(props.addressLineOne)
                : props.addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (props.addressLineTwo) {
            return isAddressLineTwoMaskingOn
                ? maskAddress(props.addressLineTwo)
                : props.addressLineTwo;
        }
    }

    function getAddressLineThreeValue() {
        if (props.addressLineThree) {
            return isAddressLineThreeMaskingOn
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
            return isMobileNumberMaskingOn
                ? maskMobile(props.mobileNumberWithoutExtension)
                : props.mobileNumberWithoutExtension;
        }
    }

    function getEmailAddressValue() {
        if (props.emailAddress) {
            return isEmailMaskingOn ? maskEmail(props.emailAddress) : props.emailAddress;
        }
    }
    function getCityValue() {
        if (props.city) {
            return isCityMaskingOn ? maskAddress(props.city) : props.city;
        }
    }

    const onPopupClose = () => {
        setShowPopup(false);
    };

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_ASBFinancing_PersonalDetails"
            >
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
                                            text={ASB_FINANCING}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={PERSONAL_INFORMATION_CHECK_UPDATE}
                                        />
                                        <SpaceFiller height={24} />
                                        {buildPersonalInformationForm()}
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
                                            text={UPDATE}
                                        />
                                    }
                                    onPress={() => setShowPopup(true)}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={UPDATE_PERSONAL_DETAILS}
                    description={DEC_PERSONAL_DETAILS}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupClose,
                    }}
                    primaryAction={{
                        text: OKAY,
                        onPress: onNextTap,
                    }}
                />

                <ScrollPickerViewWithResetOption
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={scrollPicker.selectedIndex}
                    resetValue={resetValueState}
                    onResetValueCallback={() => {
                        setResetValueState(false);
                    }}
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

    function displayNativeForm() {
        return (
            <React.Fragment>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={20}
                        textAlign="left"
                        text={STEPUP_MAE_RACE}
                    />
                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.raceValue && props.raceValue?.name
                                ? props.raceValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onRaceDropdownPillDidTap}
                    />
                </View>
            </React.Fragment>
        );
    }

    function buildPersonalInformationForm() {
        return (
            <React.Fragment>
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={PLSTP_MARITAL_STATUS}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.maritalValue && props.maritalValue?.name
                                ? props.maritalValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onMaritalDropdownPillDidTap}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={PLSTP_EDUCATION}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.educationValue && props.educationValue?.name
                                ? props.educationValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onEducationDropdownPillDidTap}
                    />
                </View>

                {isNative ? displayNativeForm() : null}

                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        value={getMobileNumberValue()}
                        placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                        onChangeText={onMobileInputDidChange}
                        onFocus={onMobileInputDidFocus}
                        onEndEditing={onMobileInputEndEditing}
                        prefix={MOB_CODE}
                    />
                </View>

                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        value={getEmailAddressValue()}
                        placeholder={`e.g ${DUMMY_EMAIL}`}
                        onChangeText={onEmailInputDidChange}
                        onFocus={onEmailInputDidFocus}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={COUNTRY}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.countryValue && props.countryValue?.name
                                ? props.countryValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onCountryDropdownPillDidTap}
                    />
                </View>

                <SpaceFiller height={24} />

                <View style={Style.fieldViewCls}>
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
                        onFocus={onAddressLineOneInputDidFocus}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        onFocus={onAddressLineTwoInputDidFocus}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        onFocus={onAddressLineThreeInputDidFocus}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                        onChangeText={onPostalCodeInputDidChange}
                        onFocus={onPostalCodeInputDidFocus}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={PLSTP_STATE}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <Dropdown
                        value={
                            props.stateValue && props.stateValue?.name
                                ? props.stateValue?.name
                                : PLEASE_SELECT
                        }
                        onPress={onStateDropdownPillDidTap}
                    />
                </View>
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
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
                        maxLength={30}
                        value={getCityValue()}
                        placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                        onChangeText={onCityInputDidChange}
                        onFocus={onCityInputDidFocus}
                    />
                </View>
            </React.Fragment>
        );
    }
};

export const personalInformationPropTypes = (AsbFinancePersonalInformation.propTypes = {
    ...masterDataServicePropTypes,

    // State
    addressLineOne: PropTypes.string,
    addressLineTwo: PropTypes.string,
    addressLineThree: PropTypes.string,
    postalCode: PropTypes.string,
    stateIndex: PropTypes.number,
    stateValue: PropTypes.object,
    maritalIndex: PropTypes.number,
    maritalValue: PropTypes.object,
    city: PropTypes.string,
    isResidentialContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForResidentialDetails: PropTypes.bool,
    addressLineOneErrorMessage: PropTypes.string,
    addressLineTwoErrorMessage: PropTypes.string,
    addressLineThreeErrorMessage: PropTypes.string,
    postalCodeErrorMessage: PropTypes.string,
    cityErrorMessage: PropTypes.string,
    stateDropdownItems: PropTypes.array,
    maritalDropdownItems: PropTypes.array,
    isAddressLineOneMaskingOn: PropTypes.bool,
    isAddressLineTwoMaskingOn: PropTypes.bool,
    isAddressLineThreeMaskingOn: PropTypes.bool,
    isPostalCodeMaskingOn: PropTypes.bool,
    isCityMaskingOn: PropTypes.bool,
    isEmailMaskingOn: PropTypes.bool,
    emailAddress: PropTypes.string,
    emailAddressErrorMessage: PropTypes.string,
    raceIndex: PropTypes.number,
    raceValue: PropTypes.object,
    raceDropdownItems: PropTypes.array,

    // Dispatch
    getStateDropdownItems: PropTypes.func,
    getMaritalDropdownItems: PropTypes.func,
    updateAddressLineOne: PropTypes.func,
    updateAddressLineTwo: PropTypes.func,
    updateAddressLineThree: PropTypes.func,
    updatePostalCode: PropTypes.func,
    updateState: PropTypes.func,
    updateMarital: PropTypes.func,
    updateCity: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearResidentialReducer: PropTypes.func,
    updateConfirmationScreenStatusForResidentialDetails: PropTypes.func,
    updateAddressLineOneMaskFlag: PropTypes.func,
    updateAddressLineTwoMaskFlag: PropTypes.func,
    updateAddressLineThreeMaskFlag: PropTypes.func,
    updatePostalCodeMaskFlag: PropTypes.func,
    updateCityMaskFlag: PropTypes.func,
    updateEmailMaskFlag: PropTypes.func,
    updateEmailAddress: PropTypes.func,
    getRaceDropdownItems: PropTypes.func,
    updateRace: PropTypes.func,
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

    contentContainer: {
        marginHorizontal: 24,
    },
    fieldViewCls: {
        marginTop: 25,
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
});

export default masterDataServiceProps(
    entryProps(personalInformationProps(AsbFinancePersonalInformation))
);

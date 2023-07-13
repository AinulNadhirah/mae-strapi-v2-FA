import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile } from "@screens/PLSTP/PLSTPController";

import {
    APPLY_LOANS,
    APPLICATIONCONFIRMATION,
    OCCUPATION_INFORMATION,
    OCCUPATION_INFORMATION2,
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
import occupationInformation2Props from "@redux/connectors/ASBFinance/occupationInformation2Connector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/ASBServices/masterDataConnector";

import { BLACK, DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    ASB_FINANCING,
    OCCUPATION_INFORMATION_CHECK_UPDATE,
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
    PLSTP_STATE, // M2U_PREMIER_APPLICATION,
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE, // STEP1OF3,
    COUNTRY, // PLSTP_MOBILE_NUM,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    UPDATE,
    OFFICE_ADDR1,
    OFFICE_ADDR2,
    OFFICE_ADDR3,
    OFFICE_PHNO,
    DONE,
    CANCEL,
    LEAVE,
    STEP2OF2,
    ASB_NTB_USER,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import { ResumeDataForOccupationTwo } from "./helpers/CustomerDetailsPrefiller";

const AsbFinanceOccupationInformation2 = (props) => {
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
    const resumeStpDetails = resumeReducer?.stpDetails;

    const {
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        postalCode,
        stateIndex,
        stateValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        mobileNumberErrorMessage,
        isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn,
        emailAddress,
        isCityMaskingOn,
    } = props;

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

    const stpReferenceNumber =
        resumeReducer?.stpDetails?.stpReferenceNo ?? prePostQualReducer?.stpreferenceNo;

    const [resetValueState, setResetValueState] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const reload = route?.params?.reload;

        if (reload || resumeStpDetails) {
            if (resumeStpDetails) {
                let stpEmployerCountry = "";
                let stpEmployerCountryCode = "";
                let stpHomeStateIndex = "";

                const stpFilteredHomeCountry = masterDataReducer?.country?.filter((employee) => {
                    return employee.value === resumeStpDetails?.stpEmployerCountry;
                });

                if (stpFilteredHomeCountry && stpFilteredHomeCountry.length > 0) {
                    stpEmployerCountry = stpFilteredHomeCountry[0].name;
                    stpEmployerCountryCode = stpFilteredHomeCountry[0].value;
                }

                const data = {
                    stpEmployerCountry,
                    stpEmployerCountryCode,
                    stpEmployerStateDesc: resumeStpDetails?.stpEmployerStateDesc,
                    stpEmployerStateCode: resumeStpDetails?.stpEmployerStateCode,
                };

                props.updateAddressLineOne(resumeStpDetails?.stpEmployerAddress1);
                props.updateAddressLineOneMaskFlag(true);

                props.updateAddressLineTwo(resumeStpDetails?.stpEmployerAddress2);
                props.updateAddressLineTwoMaskFlag(true);

                props.updateAddressLineThree(resumeStpDetails?.stpEmployerAddress3);
                props.updateAddressLineThreeMaskFlag(true);

                props.updatePostalCode(resumeStpDetails?.stpEmployerPostcode);
                props.updatePostalCodeMaskFlag(true);

                props.updateCity(resumeStpDetails?.stpEmployerCity);
                props.updateCityMaskFlag(true);

                props.updateMobileNumberWithoutExtension(
                    (resumeStpDetails?.stpEmployerContactPrefix
                        ? resumeStpDetails?.stpEmployerContactPrefix?.replace(/^0+/, "")
                        : "") + resumeStpDetails?.stpEmployerContactNumber
                );

                getReleventState(resumeStpDetails?.stpEmployerCountry);

                if (resumeStpDetails?.stpEmployerCountry && stateDropdownList) {
                    stateDropdownList.map((data, index) => {
                        if (data.name === resumeStpDetails?.stpEmployerStateDesc) {
                            stpHomeStateIndex = index;
                        }
                    });

                    props.updateState(stpHomeStateIndex, {
                        name: resumeStpDetails?.stpEmployerStateDesc,
                        value: resumeStpDetails?.stpEmployerStateDesc,
                    });
                }
                ResumeDataForOccupationTwo(dispatch, data, masterDataReducer);
            }
        }
    }, [route.params]);

    useEffect(() => {
        userStatus === ASB_NTB_USER
            ? props.checkButtonEnabled()
            : props.checkButtonEnabled(
                  userStatus,
                  mobileNumberWithoutExtension,
                  mobileNumberErrorMessage
              );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        postalCode,
        stateIndex,
        stateValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        emailAddress,
    ]);

    const init = async () => {
        try {
            if (props.countryValue && props.countryValue.value) {
                getReleventState(props.countryValue.value);
            }
        } catch (error) {
            console.log("try ", error);
        }
    };

    function onBackTap() {
        navigation.navigate(OCCUPATION_INFORMATION, {
            comingFrom: OCCUPATION_INFORMATION2,
            reload: true,
        }); // resume *
    }

    function onCloseTap() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveBtn = async () => {
        try {
            setShowPopupConfirm(false);

            const body = {
                screenNo: "12",
                stpReferenceNo: stpReferenceNumber,
                officePhoneNumber: props?.mobileNumberWithoutExtension,
                employerCountry: props?.countryValue?.value,
                officeAddressLine1: props?.addressLineOne?.trim(),
                officeAddressLine2: props?.addressLineTwo?.trim(),
                officeAddressLine3: props?.addressLineThree?.trim(),
                employerPostCode: props?.postalCode,
                employerStateCode: props?.stateValue?.value,
                employerStateDesc: props?.stateValue?.name,
                employerCity: props?.city?.trim(),
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

    async function onNextTap() {
        try {
            if (props.isResidentialContinueButtonEnabled) {
                const body = {
                    screenNo: "12",
                    stpReferenceNo: stpReferenceNumber,
                    officePhoneNumber: props?.mobileNumberWithoutExtension,
                    employerCountry: props?.countryValue.value,
                    officeAddressLine1: props?.addressLineOne?.trim(),
                    officeAddressLine2: props?.addressLineTwo?.trim(),
                    officeAddressLine3: props?.addressLineThree?.trim(),
                    employerPostCode: props?.postalCode,
                    employerStateCode: props?.stateValue?.value,
                    employerStateDesc: props?.stateValue?.name,
                    employerCity: props?.city?.trim(),
                };

                dispatch({
                    screenNo: "12",
                    type: "RESUME_UPDATE",
                    stpMobileContactNumber: props?.mobileNumberWithoutExtension,
                    stpEmployerAddress1: props?.addressLineOne?.trim(),
                    stpEmployerAddress2: props?.addressLineTwo?.trim(),
                    stpEmployerAddress3: props?.addressLineThree?.trim(),
                    stpEmployerPostcode: props?.postalCode,
                    stpEmployerCity: props?.stateValue?.value,
                    stpEmployerStateDesc: props?.stateValue?.name,
                    stpEmployerStateCode: props?.stateValue?.value,
                    stpEmployerCountry: props?.countryValue?.value,
                    stpEmployerContactNumber: props?.mobileNumberWithoutExtension,
                });

                const response = await updateApiCEP(body, false);
                const result = response?.data?.result.msgHeader;

                if (result.responseCode === "0000") {
                    navigation.navigate(APPLICATIONCONFIRMATION);
                }
            }
        } catch (error) {
            // console.log(error);
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
    function onPostalCodeInputDidCFocus() {
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

    const getReleventState = async (country) => {
        const stateList = allStateList.find(({ value }) => value === country);
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
        return props.addressLineOne && isAddressLineOneMaskingOn
            ? maskAddress(props.addressLineOne)
            : props.addressLineOne;
    }

    function getAddressLineTwoValue() {
        return isAddressLineTwoMaskingOn && props.addressLineTwo
            ? maskAddress(props.addressLineTwo)
            : props.addressLineTwo;
    }

    function getAddressLineThreeValue() {
        return isAddressLineThreeMaskingOn && props.addressLineThree
            ? maskAddress(props.addressLineThree)
            : props.addressLineThree;
    }

    function getPostalCodeValue() {
        return props.postalCode;
    }

    function getMobileNumberValue() {
        return isMobileNumberMaskingOn && !!props.mobileNumberWithoutExtension
            ? maskMobile(props.mobileNumberWithoutExtension)
            : props.mobileNumberWithoutExtension;
    }

    function getCityValue() {
        return isCityMaskingOn && props.city ? maskAddress(props.city) : props.city;
    }

    function resetValue() {
        setResetValueState(false);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_ASBFinancing_EmploymentDetails"
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
                                    text={STEP2OF2}
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
                                            text={ASB_FINANCING}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={OCCUPATION_INFORMATION_CHECK_UPDATE}
                                        />
                                        <SpaceFiller height={24} />
                                        {buildOccupationInformation2Form()}
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
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>

                <ScrollPickerViewWithResetOption
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                    selectedIndex={scrollPicker.selectedIndex}
                    resetValue={resetValueState}
                    onResetValueCallback={resetValue}
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
                            countryValue && countryValue?.name ? countryValue?.name : PLEASE_SELECT
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
                        text={OFFICE_ADDR1}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <TextInput
                        errorMessage={props.addressLineOneErrorMessage}
                        isValid={props.addressLineOneErrorMessage === null}
                        isValidate
                        minLength={2}
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
                        text={OFFICE_ADDR2}
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
                        text={OFFICE_ADDR3}
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
                        onFocus={onPostalCodeInputDidCFocus}
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
                <SpaceFiller height={24} />
                <View style={Style.fieldViewCls}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={OFFICE_PHNO}
                        color={BLACK}
                    />
                    <SpaceFiller height={16} />
                    <TextInput
                        errorMessage={mobileNumberErrorMessage}
                        isValid={mobileNumberErrorMessage === null}
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
            </React.Fragment>
        );
    }
};

export const occupationInformation2PropTypes = (AsbFinanceOccupationInformation2.propTypes = {
    ...masterDataServicePropTypes,

    // State
    countryValue: PropTypes.object,
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
    emailAddress: PropTypes.string,
    emailAddressErrorMessage: PropTypes.string,

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
    updateEmailAddress: PropTypes.func,
    getRaceDropdownItems: PropTypes.func,
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
    entryProps(occupationInformation2Props(AsbFinanceOccupationInformation2))
);

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { entryPropTypes } from "@screens/ZestCASA/ZestCASAEntry";

import {
    ZEST_CASA_ACCOUNT_NOT_FOUND,
    ZEST_CASA_LOGIN_ENTRY,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
} from "@navigation/navigationConstant";

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
import DatePicker from "@components/Pickers/DatePicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import prePostQualServiceProps, {
    prePostQualServicePropTypes,
} from "@redux/connectors/services/prePostQualConnector";

import { BLACK, DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    DOB_LBL,
    DUMMY_CALENDER_DATE2,
    MYKAD_NUMBER,
    MYKAD_NUMBER_PLACEHOLDER,
    ZEST_APPLICATION,
    SELECT_YOUR_ID_TYPE,
    TELL_US_YOUR_ID_TYPE,
    NATIONALITY_LBL,
    PLSTP_UD_MYKAD,
    PASSPORT,
    FULLNAME_LBL,
    SIGNUP_MAE_FULLNAME,
    PASSPORTID_LBL,
    PASSPORT_NO_DUMMY,
    PASSPORT_EXPIRY_DATE,
    PLEASE_SELECT,
    M2U_PREMIER_APPLICATION,
    WELCOME_BACK,
    RESUME_FLOW_MESSAGE,
    OKAY,
    FA_SCREEN_NAME,
    FA_FIELD_INFORMATION,
    FA_FORM_PROCEED,
    ALREADY_HAVE_ACCOUNT_ERROR,
    ZEST_08_ACC_TYPE_ERROR,
} from "@constants/strings";
import { ZEST_CASA_PRE_POST } from "@constants/url";
import {
    MYKAD_CODE,
    ZEST_NTB_USER,
    PASSPORT_CODE,
    PRE_QUAL_PRE_LOGIN_FLAG,
    ZEST_CASA_CLEAR_ALL,
    ZEST_UNIDENTIFIED_USER,
    ZEST_M2U_ONLY_USER,
    ZEST_FULL_ETB_USER,
    MYKAD_ID_TYPE,
    PASSPORT_ID_TYPE,
    ZEST_DRAFT_USER,
    ZEST_DRAFT_BRANCH_USER,
} from "@constants/zestCasaConfiguration";

import { apiToMhDateLocal, apiToMhDateLocalServer } from "@utils/momentUtils";

import { APPLY_M2U_PREMIER_ID_TYPE, APPLY_ZESTI_ID_TYPE } from "./helpers/AnalyticsEventConstants";

const ZestCASAIdentityDetails = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();

    // Hooks to access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const [isDOBDatePickerVisible, setIsDOBDatePickerVisible] = useState(false);
    const [isPassportDatePickerVisible, setIsPassportDatePickerVisible] = useState(false);
    const [isWelcomePopupVisible, setIsWelcomePopupVisible] = useState(false);

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    // DOB DatePicker Start Date
    const dateRangeDOBStartDate = new Date(
        new Date().getFullYear() - 65,
        new Date().getMonth(),
        new Date().getDate()
    );
    // DOB DatePicker End Date
    const dateRangeDOBEndDate = new Date(
        new Date().getFullYear() - 18,
        new Date().getMonth(),
        new Date().getDate()
    );
    // Passport DatePicker Start Date
    const dateRangePassportStartDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );
    // Passport DatePicker End Date
    const dateRangePassportEndDate = new Date(
        new Date().getFullYear() + 30,
        new Date().getMonth(),
        new Date().getDate()
    );
    // Passport DatePicker End Date
    const dateRangePassportDefaultDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAIdentityDetails] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASAIdentityDetails] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASAIdentityDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    // SetUp Pre Call Pre Login Data
    const fetchPreQualPreLoginData = (state) => {
        return {
            idType: state.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
            birthDate:
                state.identityType === 1 ? "" : apiToMhDateLocalServer(state.dateOfBirthDateObject),
            passportExpiryDate:
                state.identityType === 1
                    ? ""
                    : apiToMhDateLocalServer(state.passportExpiryDateObject),
            preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
            icNo: state.identityType === 1 ? state.identityNumber : state.passportNumber,
            mobileNo: "",
            isZestI: entryReducer.isZest,
        };
    };

    function onNextTap() {
        if (props.isIdentityContinueButtonEnabled) {
            callPreQualService();
        }
    }

    async function callPreQualService() {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: entryReducer.isZest ? APPLY_ZESTI_ID_TYPE : APPLY_M2U_PREMIER_ID_TYPE,
            [FA_FIELD_INFORMATION]:
                identityDetailsReducer.identityType == 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE,
        });

        var body = fetchPreQualPreLoginData(identityDetailsReducer);

        console.log("body", body);

        await props.prePostQual(ZEST_CASA_PRE_POST, body, (result, userStatus, exception) => {
            if (result) {
                console.log("userStatus =======>" + userStatus);

                if (userStatus && userStatus === ZEST_UNIDENTIFIED_USER)
                    return showErrorToast({
                        message: "We currently have not opened application for you.",
                    });

                handleNavigationBasedOnModuleFlag(props.isZest, userStatus, result);
            } else {
                if (exception) {
                    const { statusCode } = exception;

                    if (statusCode === "4775") {
                        navigation.navigate(ZEST_CASA_LOGIN_ENTRY, {
                            needToCheck08: true,
                        });
                    } else if (statusCode === "4774") {
                        showErrorToast({
                            message: ALREADY_HAVE_ACCOUNT_ERROR,
                        });
                    } else if (statusCode === "6608") {
                        showErrorToast({
                            message: ZEST_08_ACC_TYPE_ERROR,
                        });
                    } else if (statusCode === "6610") {
                        navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    } else {
                        dispatch({ type: ZEST_CASA_CLEAR_ALL });
                        props.clearDownTimeReducer();
                        props.clearMasterDataReducer();
                        dispatch({ type: PREPOSTQUAL_CLEAR });
                        navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    }
                }
            }
        });
    }

    function handleNavigationBasedOnModuleFlag(isZest, userStatus, prePostQualResult) {
        if (userStatus === ZEST_M2U_ONLY_USER || userStatus === ZEST_FULL_ETB_USER) {
            navigation.navigate(ZEST_CASA_LOGIN_ENTRY, {
                needToCheck08: false,
            });
        } else if (userStatus === ZEST_DRAFT_USER) {
            const { isOnboard } = getModel("user");
            if (!isOnboard) {
                navigation.navigate(ZEST_CASA_LOGIN_ENTRY, {
                    needToCheck08: userStatus === ZEST_DRAFT_USER ? true : false,
                });
            }
        } else if (userStatus === ZEST_NTB_USER) {
            if (prePostQualResult.statusCode === "3300") {
                navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                    isVisitBranchMode: true,
                });
                // dispatchCreateAccountBody(prePostQualResult);
                // setIsWelcomePopupVisible(true);
            } else if (prePostQualResult.statusCode === "4400") {
                isZest
                    ? navigation.navigate(ZEST_CASA_SUITABILITY_ASSESSMENT)
                    : navigation.navigate(ZEST_CASA_PERSONAL_DETAILS);
                // dispatchCreateAccountBody(prePostQualResult);
                // setIsWelcomePopupVisible(true);
            } else if (prePostQualResult.statusCode === "0000") {
                isZest
                    ? navigation.navigate(ZEST_CASA_SUITABILITY_ASSESSMENT)
                    : navigation.navigate(ZEST_CASA_PERSONAL_DETAILS);
            }
        } else if (userStatus === ZEST_DRAFT_BRANCH_USER) {
            navigation.navigate(ZEST_CASA_ACCOUNT_NOT_FOUND, {
                isVisitBranchMode: true,
            });
        }
    }

    function onMyKadRadioButtonDidTap() {
        props.updateIdentityType(1);
        props.checkButtonEnable();
    }

    function onPassportRadioButtonDidTap() {
        props.updateIdentityType(2);
        props.checkButtonEnable();
    }

    function onFullNameInputDidChange(value) {
        props.updateFullName(value);
        props.checkButtonEnable();
    }

    function onMyKadInputDidChange(value) {
        props.updateIdentityNumber(value, entryReducer.isZest);
        props.checkButtonEnable();
    }

    function onPassportNumberInputDidChange(value) {
        props.updatePassportNumber(value);
        props.checkButtonEnable();
    }

    function handleDOBDatePickerVisibility() {
        setIsDOBDatePickerVisible(!isDOBDatePickerVisible);
    }

    function handlePassportDatePickerVisibility() {
        setIsPassportDatePickerVisible(!isPassportDatePickerVisible);
    }

    function onDOBDatePickerDoneButtonDidTap(value) {
        handleDOBDatePickerVisibility();
        props.updateDateOfBirth(apiToMhDateLocal(value), value);
        props.checkButtonEnable();
    }

    function onPassportDatePickerDoneButtonDidTap(value) {
        handlePassportDatePickerVisibility();
        props.updatePassportExpiryDate(apiToMhDateLocal(value), value);
        props.checkButtonEnable();
    }

    function onNationalityDropdownDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: props.nationalityIndex,
            filterType: "",
            data: props.residentialcountryforeigner,
        });
    }

    function scrollPickerOnPressDone(data, index) {
        props.updateNationality(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
        props.checkButtonEnable();
    }

    function scrollPickerOnPressCancel() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onWelcomePopupOkayButtonDidTap() {
        setIsWelcomePopupVisible(false);
        navigation.navigate(ZEST_CASA_OTP_VERIFICATION);
    }

    // function dispatchCreateAccountBody(prePostQualResult) {
    //     var raceValue, genderCode, genderValue;
    //     raceValue = prePostQualResult.race;
    //     if (prePostQualResult.race) {
    //         filterDropdownList(prePostQualResult.race, masterDataReducer.race, (index, value) => {
    //             raceValue = value;
    //         });
    //     }

    //     if (prePostQualResult.gender) {
    //         if (prePostQualResult.gender === GENDER_FEMALE_CODE) {
    //             genderCode = GENDER_FEMALE_CODE;
    //             genderValue = FEMALE;
    //         } else {
    //             genderCode = GENDER_MALE_CODE;
    //             genderValue = MALE;
    //         }
    //     }

    //     dispatch({
    //         type: ZEST_CASA_CREATE_ACCOUNT_BODY,
    //         state: {
    //             idType: identityDetailsReducer.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
    //             customerEmail: prePostQualResult.customerEmail ?? prePostQualResult.emailAddress,
    //             customerName:
    //                 identityDetailsReducer.fullName ?? identityDetailsReducer.customerName,
    //             birthDate:
    //                 identityDetailsReducer.identityType === 1
    //                     ? retrieveuserDOB(identityDetailsReducer.identityNumber.substring(0, 6))
    //                     : apiToMhDateLocalServer(identityDetailsReducer.dateOfBirthDateObject),
    //             mobileNo: prePostQualResult.mobileNo,
    //             idNo: prePostQualResult.idNo,
    //             preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
    //             nationality: prePostQualResult.countryOfBirthValue ?? prePostQualResult.nationality,
    //             pdpa: prePostQualResult.pdpa,
    //             addr1: prePostQualResult.addr1,
    //             addr2: prePostQualResult.addr2,
    //             addr3: prePostQualResult.addr3,
    //             custStatus: prePostQualResult.custStatus,
    //             m2uIndicator: prePostQualResult.m2uIndicator,
    //             postCode: prePostQualResult.postCode,
    //             state: prePostQualResult.state,
    //             stateValue: prePostQualResult.stateValue,
    //             fatcaStateValue: prePostQualResult.fatcaStateValue,
    //             empType: prePostQualResult.empType,
    //             empTypeValue: prePostQualResult.empTypeValue,
    //             occupation: prePostQualResult.occupation,
    //             occupationValue: prePostQualResult.occupationValue,
    //             employerName: prePostQualResult.employerName,
    //             sector: prePostQualResult.sector,
    //             sectorValue: prePostQualResult.sectorValue,
    //             gender: genderCode,
    //             genderValue: genderValue,
    //             passportExpiry:
    //                 identityDetailsReducer.identityType == 1
    //                     ? ""
    //                     : apiToMhDateLocalServer(identityDetailsReducer.passportExpiryDateObject),
    //             issuedCountry: identityDetailsReducer.nationalityValue?.value,
    //             issuedCountryValue: identityDetailsReducer.nationalityValue?.name,
    //             title: prePostQualResult.title ?? prePostQualResult.salutationCode,
    //             titleValue: prePostQualResult.titleValue ?? prePostQualResult.salutationValue,
    //             customerType: prePostQualResult.type,
    //             race: raceValue?.value,
    //             raceValue: raceValue?.name,
    //             pep: prePostQualResult.pep ?? prePostQualResult.pepDeclare,
    //             city: prePostQualResult.city,
    //             monthlyIncomeRange: prePostQualResult.monthlyIncomeRange,
    //             monthlyIncomeRangeValue: prePostQualResult.monthlyIncomeRangeValue,
    //             sourceOfFundCountry: prePostQualResult.sourceOfFund,
    //             sourceOfFundCountryValue: prePostQualResult.sourceOfFundValue,
    //             declarePdpaPromotion: "Y",
    //             tc: prePostQualResult.tc,
    //             purpose: prePostQualResult.purpose,
    //             preferredBRDistrict: prePostQualResult.preferredBRDistrict,
    //             preferredBRState: prePostQualResult.preferredBRState,
    //             preferredBranch: prePostQualResult.preferredBranch,
    //             preferredBranchValue: prePostQualResult.preferredBranchValue,
    //             saFormInvestmentExp: prePostQualResult.saFormInvestmentExp,
    //             saFormInvestmentNature: prePostQualResult.saFormInvestmentNature,
    //             saFormInvestmentRisk: prePostQualResult.saFormInvestmentRisk,
    //             saFormInvestmentTerm: prePostQualResult.saFormInvestmentTerm,
    //             saFormSecurities: prePostQualResult.saFormSecurities,
    //             saFormPIDM: prePostQualResult.saFormPIDM ?? AGREE,
    //             saFormProductFeature: prePostQualResult.saFormProductFeature ?? AGREE,
    //             saFormSuitability: prePostQualResult.saFormSuitability ?? AGREE,
    //             onBoardingStatusInfo: prePostQualResult.onBoardingStatusInfo,
    //             isZestI: entryReducer.isZest,
    //             gcif: prePostQualResult.gcif,
    //             universalCifNo: prePostQualResult.universalCifNo,
    //             finanicalObjective: prePostQualResult.finanicalObjective,
    //             finanicalObjectiveValue: prePostQualResult.finanicalObjectiveValue,
    //         },
    //     });
    // }

    function onWelcomePopupCloseButtonDidTap() {
        setIsWelcomePopupVisible(false);
    }

    const analyticScreenName = entryReducer.isZest
        ? APPLY_ZESTI_ID_TYPE
        : APPLY_M2U_PREMIER_ID_TYPE;

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
                                            text={TELL_US_YOUR_ID_TYPE}
                                        />
                                        <SpaceFiller height={36} />
                                        {buildRadioButtonGroupView()}
                                        <SpaceFiller height={24} />
                                        {switchDetailsView()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={props.isIdentityContinueButtonEnabled ? 1 : 0.5}
                                    backgroundColor={
                                        props.isIdentityContinueButtonEnabled ? YELLOW : DISABLED
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
                {isWelcomePopupVisible && (
                    <Popup
                        visible={isWelcomePopupVisible}
                        onClose={onWelcomePopupCloseButtonDidTap}
                        title={WELCOME_BACK}
                        description={RESUME_FLOW_MESSAGE}
                        primaryAction={{
                            text: OKAY,
                            onPress: onWelcomePopupOkayButtonDidTap,
                        }}
                    />
                )}
                {isDOBDatePickerVisible && entryReducer.isZest && (
                    <DatePicker
                        showDatePicker={isDOBDatePickerVisible}
                        onCancelButtonPressed={handleDOBDatePickerVisibility}
                        onDoneButtonPressed={onDOBDatePickerDoneButtonDidTap}
                        dateRangeEndDate={dateRangeDOBEndDate}
                        defaultSelectedDate={dateRangeDOBEndDate}
                    />
                )}
                {isDOBDatePickerVisible && !entryReducer.isZest && (
                    <DatePicker
                        showDatePicker={isDOBDatePickerVisible}
                        onCancelButtonPressed={handleDOBDatePickerVisibility}
                        onDoneButtonPressed={onDOBDatePickerDoneButtonDidTap}
                        dateRangeStartDate={dateRangeDOBStartDate}
                        dateRangeEndDate={dateRangeDOBEndDate}
                        defaultSelectedDate={dateRangeDOBEndDate}
                    />
                )}
                {isPassportDatePickerVisible && (
                    <DatePicker
                        showDatePicker={isPassportDatePickerVisible}
                        onCancelButtonPressed={handlePassportDatePickerVisibility}
                        onDoneButtonPressed={onPassportDatePickerDoneButtonDidTap}
                        dateRangeStartDate={dateRangePassportStartDate}
                        dateRangeEndDate={dateRangePassportEndDate}
                        defaultSelectedDate={dateRangePassportDefaultDate}
                    />
                )}
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

    function buildRadioButtonGroupView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    text={SELECT_YOUR_ID_TYPE}
                />
                <SpaceFiller height={16} />
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={onMyKadRadioButtonDidTap}
                    >
                        {props.identityType == 1 ? (
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
                                text={PLSTP_UD_MYKAD}
                                color={BLACK}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={onPassportRadioButtonDidTap}
                    >
                        {props.identityType == 2 ? (
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
                                text={PASSPORT}
                                color={BLACK}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </React.Fragment>
        );
    }

    function switchDetailsView() {
        if (props.identityType == 1) {
            return buildMyKadDetailsView();
        } else if (props.identityType == 2) {
            return buildPassportDetailsView();
        } else {
            return;
        }
    }

    function buildMyKadDetailsView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={MYKAD_NUMBER}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.identityNumberErrorMessage}
                    isValid={props.identityNumberErrorMessage === null}
                    isValidate
                    maxLength={12}
                    keyboardType="number-pad"
                    placeholder={MYKAD_NUMBER_PLACEHOLDER}
                    onChangeText={onMyKadInputDidChange}
                    value={props.identityNumber}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={FULLNAME_LBL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.fullNameErrorMessage}
                    isValid={props.fullNameErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.fullName}
                    placeholder={SIGNUP_MAE_FULLNAME}
                    onChangeText={onFullNameInputDidChange}
                />
            </React.Fragment>
        );
    }

    function buildPassportDetailsView() {
        return (
            <React.Fragment>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={FULLNAME_LBL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.fullNameErrorMessage}
                    isValid={props.fullNameErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.fullName}
                    placeholder={SIGNUP_MAE_FULLNAME}
                    onChangeText={onFullNameInputDidChange}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={PASSPORTID_LBL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    maxLength={20}
                    errorMessage={props.isValidPassportError}
                    isValid={props.isValidPassportError === null}
                    isValidate
                    value={props.passportNumber}
                    autoCapitalize="characters"
                    placeholder={`e.g. ${PASSPORT_NO_DUMMY}`}
                    onChangeText={onPassportNumberInputDidChange}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={PASSPORT_EXPIRY_DATE}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TouchableOpacity onPress={handlePassportDatePickerVisibility}>
                    <View pointerEvents="none">
                        <TextInput
                            maxLength={30}
                            value={props.passportExpiryDate}
                            placeholder={`e.g. ${DUMMY_CALENDER_DATE2}`}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
                <SpaceFiller height={24} />
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={DOB_LBL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TouchableOpacity onPress={handleDOBDatePickerVisibility}>
                    <View pointerEvents="none">
                        <TextInput
                            maxLength={30}
                            value={props.dateOfBirth}
                            placeholder={`e.g. ${DUMMY_CALENDER_DATE2}`}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
                <TitleAndDropdownPill
                    title={NATIONALITY_LBL}
                    titleFontWeight="400"
                    dropdownTitle={
                        props.nationalityValue && props.nationalityValue.name
                            ? props.nationalityValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onNationalityDropdownDidTap}
                />
            </React.Fragment>
        );
    }
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
});

export const identityDetailsPropTypes = (ZestCASAIdentityDetails.propTypes = {
    // Entry props
    ...entryPropTypes,
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,
    ...prePostQualServicePropTypes,

    // State
    identityType: PropTypes.number,
    identityNumber: PropTypes.string,
    fullName: PropTypes.string,
    passportExpiryDate: PropTypes.string,
    dateOfBirth: PropTypes.string,
    nationalityIndex: PropTypes.number,
    nationalityValue: PropTypes.object,
    identityNumberErrorMessage: PropTypes.string,
    fullNameErrorMessage: PropTypes.string,
    isIdentityContinueButtonEnabled: PropTypes.bool,
    passportNumber: PropTypes.string,
    isValidPassportError: PropTypes.string,

    // Dispatch
    updateIdentityType: PropTypes.func,
    updateIdentityNumber: PropTypes.func,
    updateFullName: PropTypes.func,
    updatePassportExpiryDate: PropTypes.func,
    updateDateOfBirth: PropTypes.func,
    updateNationality: PropTypes.func,
    checkButtonEnable: PropTypes.func,
    updatePassportNumber: PropTypes.func,
    prePostQual: PropTypes.func,
});

export default prePostQualServiceProps(
    downTimeServiceProps(
        masterDataServiceProps(entryProps(identityDetailsProps(ZestCASAIdentityDetails)))
    )
);

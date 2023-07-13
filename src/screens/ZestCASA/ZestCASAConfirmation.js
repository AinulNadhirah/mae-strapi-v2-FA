import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskEmail, maskMobile } from "@screens/PLSTP/PLSTPController";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { ZEST_CASA_CREATE_ACCOUNT_BODY } from "@redux/actions/services/createAccountAction";
import {
    PREPOSTQUAL_CLEAR,
    PREPOSTQUAL_FINANICAL_OBJECTIVE,
    UPDATE_PRE_QUAL_REDUCER,
} from "@redux/actions/services/prePostQualAction";
import accountDetailsProps from "@redux/connectors/ZestCASA/accountDetailsConnector";
import additionalDetailsProps from "@redux/connectors/ZestCASA/additionalDetailsConnector";
import declarationProps from "@redux/connectors/ZestCASA/declarationConnector";
import employmentDetailsProps from "@redux/connectors/ZestCASA/employmentDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import personalDetailsProps from "@redux/connectors/ZestCASA/personalDetailsConnector";
import residentialDetailsProps from "@redux/connectors/ZestCASA/residentialDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import {
    PLSTP_AGREE,
    PLSTP_CONFIRMATION_DESC,
    CONFIRMATION,
    YES,
    NO,
    AGREE,
    MALE,
    FEMALE,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_EMPLOYMENT_DETAILS,
    ZEST_CASA_ACCOUNT_DETAILS,
    ZEST_CASA_ADDITIONAL_DETAILS,
    ZEST_CASA_RESIDENTIAL_DETAILS,
} from "@constants/strings";
import {
    ZEST_CASA_CLEAR_ALL,
    PRE_QUAL_PRE_LOGIN_FLAG,
    MYKAD_CODE,
    PASSPORT_CODE,
    ZEST_NTB_USER,
    MYKAD_ID_TYPE,
    PASSPORT_ID_TYPE,
    ZEST_M2U_ONLY_USER,
    ZEST_FULL_ETB_USER,
} from "@constants/zestCasaConfiguration";

import { apiToMhDateLocalServer, retrieveuserDOB } from "@utils/momentUtils";

import { accountDetailsPropTypes } from "./ZestCASAAccountDetails";
import { additionalDetailsPropTypes } from "./ZestCASAAdditionalDetails";
import { declarationPropTypes } from "./ZestCASADeclaration";
import { employmentDetailsPropTypes } from "./ZestCASAEmploymentDetails";
import { identityDetailsPropTypes } from "./ZestCASAIdentityDetails";
import { personalDetailsPropTypes } from "./ZestCASAPersonalDetails";
import { residentialDetailsPropTypes } from "./ZestCASAResidentialDetails";
import {
    APPLY_M2U_PREMIER_CONFIRMATION,
    APPLY_ZESTI_CONFIRMATION,
} from "./helpers/AnalyticsEventConstants";
import {
    getAccountDetails,
    getAdditionalDetails,
    getEmploymentDetails,
    getPersonalDetails,
    getPersonalDetailsETB,
    getResidentialDetails,
} from "./helpers/ZestHelpers";

const ZestCASAConfirmation = (props) => {
    const { navigation } = props;
    const [personalDetails, setPersonalDetails] = useState([]);
    const [employmentDetails, setEmploymentDetails] = useState([]);
    const [accountDetails, setAccountDetails] = useState([]);
    const [additionalDetails, setAdditionalDetails] = useState([]);
    const [residentialDetails, setResidentialDetails] = useState([]);

    // Hooks to access reducer data
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const suitabilityAssessmentReducer = useSelector(
        (state) => state.zestCasaReducer.suitabilityAssessmentReducer
    );
    const personalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.personalDetailsReducer
    );
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.residentialDetailsReducer
    );
    const employmentDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.employmentDetailsReducer
    );
    const accountDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.accountDetailsReducer
    );
    const additionalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.additionalDetailsReducer
    );
    const declarationReducer = useSelector((state) => state.zestCasaReducer.declarationReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);

    const { userStatus } = prePostQualReducer;
    const { isMobileNumberMaskingOn } = personalDetailsReducer;
    const { isAddressLineOneMaskingOn, isAddressLineTwoMaskingOn, isAddressLineThreeMaskingOn } =
        residentialDetailsReducer;
    const { isZest } = entryReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        userStatus && userStatus === ZEST_NTB_USER
            ? setPersonalDetails(
                  getPersonalDetails(
                      personalDetailsReducer.titleValue && personalDetailsReducer.titleValue.name
                          ? personalDetailsReducer.titleValue.name
                          : "",

                      personalDetailsReducer.gender && personalDetailsReducer.gender === "M"
                          ? MALE
                          : FEMALE,
                      personalDetailsReducer.raceValue && personalDetailsReducer.raceValue.name
                          ? personalDetailsReducer.raceValue.name
                          : "",
                      props.mobileNumberWithExtension
                          ? userStatus && userStatus !== ZEST_NTB_USER && isMobileNumberMaskingOn
                              ? maskMobile(props.mobileNumberWithExtension)
                              : props.mobileNumberWithExtension
                          : "",
                      props.emailAddress
                          ? userStatus && userStatus !== ZEST_NTB_USER
                              ? maskEmail(props.emailAddress)
                              : props.emailAddress
                          : "",
                      personalDetailsReducer.politicalExposure
                  )
              )
            : setPersonalDetails(
                  getPersonalDetailsETB(
                      props.mobileNumberWithExtension
                          ? userStatus && userStatus !== ZEST_NTB_USER && isMobileNumberMaskingOn
                              ? maskMobile(props.mobileNumberWithExtension)
                              : props.mobileNumberWithExtension
                          : "",
                      props.emailAddress
                          ? userStatus && userStatus !== ZEST_NTB_USER
                              ? maskEmail(props.emailAddress)
                              : props.emailAddress
                          : "",
                      residentialDetailsReducer.addressLineOne
                          ? userStatus && userStatus !== ZEST_NTB_USER && isAddressLineOneMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineOne)
                              : residentialDetailsReducer.addressLineOne
                          : "",

                      residentialDetailsReducer.addressLineTwo
                          ? userStatus && userStatus !== ZEST_NTB_USER && isAddressLineTwoMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineTwo)
                              : residentialDetailsReducer.addressLineTwo
                          : "",
                      residentialDetailsReducer.addressLineThree
                          ? userStatus &&
                            userStatus !== ZEST_NTB_USER &&
                            isAddressLineThreeMaskingOn
                              ? maskAddress(residentialDetailsReducer.addressLineThree)
                              : residentialDetailsReducer.addressLineThree
                          : "",
                      props.postalCode ? props.postalCode : "",
                      residentialDetailsReducer.stateValue &&
                          residentialDetailsReducer.stateValue.name
                          ? residentialDetailsReducer.stateValue.name
                          : "",
                      residentialDetailsReducer.city
                  )
              );
    }, [
        isAddressLineOneMaskingOn,
        isAddressLineThreeMaskingOn,
        isAddressLineTwoMaskingOn,
        isMobileNumberMaskingOn,
        personalDetailsReducer.gender,
        personalDetailsReducer.politicalExposure,
        personalDetailsReducer.raceValue,
        personalDetailsReducer.titleValue,
        props.emailAddress,
        props.mobileNumberWithExtension,
        props.postalCode,
        residentialDetailsReducer.addressLineOne,
        residentialDetailsReducer.addressLineThree,
        residentialDetailsReducer.addressLineTwo,
        residentialDetailsReducer.city,
        residentialDetailsReducer.stateValue,
        userStatus,
    ]);

    useEffect(() => {
        setEmploymentDetails(
            getEmploymentDetails(
                props.employerName,
                props.occupationValue && props.occupationValue.name
                    ? props.occupationValue.name
                    : "",
                props.sectorValue && props.sectorValue.name ? props.sectorValue.name : "",
                props.employmentTypeValue && props.employmentTypeValue.name
                    ? props.employmentTypeValue.name
                    : "",
                props.monthlyIncomeValue && props.monthlyIncomeValue.name
                    ? props.monthlyIncomeValue.name
                    : "",

                props.incomeSourceValue && props.incomeSourceValue.name
                    ? props.incomeSourceValue.name
                    : ""
            )
        );
    }, [
        props.employerName,
        props.employmentTypeValue,
        props.incomeSourceValue,
        props.monthlyIncomeValue,
        props.occupationValue,
        props.sectorValue,
    ]);

    useEffect(() => {
        setAccountDetails(
            getAccountDetails(
                props.accountPurposeValue && props.accountPurposeValue.name
                    ? props.accountPurposeValue.name
                    : "",
                props.branchValue && props.branchValue.name ? props.branchValue.name : "",
                props.branchStateValue && props.branchStateValue.name
                    ? props.branchStateValue.name
                    : "",
                props.branchDistrictValue && props.branchDistrictValue.name
                    ? props.branchDistrictValue.name
                    : ""
            )
        );
    }, [
        props.accountPurposeValue,
        props.branchDistrictValue,
        props.branchStateValue,
        props.branchValue,
    ]);

    useEffect(() => {
        setAdditionalDetails(
            getAdditionalDetails(
                additionalDetailsReducer.primaryIncomeValue &&
                    additionalDetailsReducer.primaryIncomeValue.name
                    ? additionalDetailsReducer.primaryIncomeValue.name
                    : "",
                additionalDetailsReducer.primaryWealthValue &&
                    additionalDetailsReducer.primaryWealthValue.name
                    ? additionalDetailsReducer.primaryWealthValue.name
                    : ""
            )
        );
    }, [additionalDetailsReducer.primaryIncomeValue, additionalDetailsReducer.primaryWealthValue]);

    useEffect(() => {
        setResidentialDetails(
            getResidentialDetails(
                props.addressLineOne
                    ? userStatus && userStatus !== ZEST_NTB_USER && isAddressLineOneMaskingOn
                        ? maskAddress(props.addressLineOne)
                        : props.addressLineOne
                    : "",
                props.addressLineTwo
                    ? userStatus && userStatus !== ZEST_NTB_USER && isAddressLineTwoMaskingOn
                        ? maskAddress(props.addressLineTwo)
                        : props.addressLineTwo
                    : "",

                props.addressLineThree
                    ? userStatus && userStatus !== ZEST_NTB_USER && isAddressLineThreeMaskingOn
                        ? maskAddress(props.addressLineThree)
                        : props.addressLineThree
                    : "",

                props.postalCode ? props.postalCode : "",
                props.stateValue && props.stateValue.name ? props.stateValue.name : "",
                props.city
            )
        );
    }, [
        isAddressLineOneMaskingOn,
        isAddressLineThreeMaskingOn,
        isAddressLineTwoMaskingOn,
        props.addressLineOne,
        props.addressLineThree,
        props.addressLineTwo,
        props.city,
        props.postalCode,
        props.stateValue,
        userStatus,
    ]);

    function onBackTap() {
        console.log("[ZestCASAConfirmation] >> [onBackTap]");
        props.updateConfirmationScreenStatusForPersonalDetails(false);
        props.updateConfirmationScreenStatusForResidentialDetails(false);
        props.updateConfirmationScreenStatusForEmploymentDetails(false);
        props.updateConfirmationScreenStatusForAccountDetails(false);
        props.updateConfirmationScreenStatusForAdditionalDetails(false);
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
        console.log("[ZestCASAConfirmation] >> [onNextTap]");
        handleUserBasedOnUserStatus();
    }

    function handleUserBasedOnUserStatus() {
        console.log("handleUserBasedOnUserStatus");
        console.log(userStatus);

        switch (userStatus) {
            case ZEST_NTB_USER:
                dispatchCreateAccountBody();
                navigation.navigate(navigationConstant.ZEST_CASA_OTP_VERIFICATION);
                break;

            case ZEST_FULL_ETB_USER:
                navigation.navigate(navigationConstant.ZEST_CASA_SELECT_CASA);
                break;

            case ZEST_M2U_ONLY_USER:
                navigation.navigate(navigationConstant.ZEST_CASA_ACTIVATE_ACCOUNT);
                break;

            default:
                break;
        }
    }

    function dispatchCreateAccountBody() {
        dispatch({
            type: ZEST_CASA_CREATE_ACCOUNT_BODY,
            state: {
                customerName: identityDetailsReducer.fullName,
                idNo:
                    identityDetailsReducer.identityType === 1
                        ? identityDetailsReducer.identityNumber
                        : identityDetailsReducer.passportNumber,
                idType: identityDetailsReducer.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
                birthDate:
                    identityDetailsReducer.identityType === 1
                        ? retrieveuserDOB(identityDetailsReducer.identityNumber.substring(0, 6))
                        : apiToMhDateLocalServer(identityDetailsReducer.dateOfBirthDateObject),
                nationality:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.name,

                passportExpiry:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : apiToMhDateLocalServer(identityDetailsReducer.passportExpiryDateObject),
                issuedCountry:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.value,

                issuedCountryValue:
                    identityDetailsReducer.identityType === 1
                        ? ""
                        : identityDetailsReducer.nationalityValue?.name,

                mobileNo: personalDetailsReducer.mobileNumberWithExtension,
                customerEmail: personalDetailsReducer.emailAddress,
                pep: personalDetailsReducer.politicalExposure ? YES : NO,
                gender: personalDetailsReducer.gender,
                genderValue: personalDetailsReducer.genderValue,
                title: personalDetailsReducer.titleValue?.value,
                titleValue: personalDetailsReducer.titleValue?.name,
                race: personalDetailsReducer.raceValue?.value,

                preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
                pdpa: declarationReducer.privacyPolicy,
                transactionType: "",
                referalCode: "",

                addr1: residentialDetailsReducer.addressLineOne,
                addr2: residentialDetailsReducer.addressLineTwo,
                addr3: residentialDetailsReducer.addressLineThree,
                addr4: "",
                postCode: residentialDetailsReducer.postalCode,
                state: residentialDetailsReducer.stateValue?.value,
                stateValue: residentialDetailsReducer.stateValue?.name,
                city: residentialDetailsReducer.city,

                custStatus: prePostQualReducer.custStatus,
                m2uIndicator: prePostQualReducer.m2uIndicator,
                pan: "",
                gcif: prePostQualReducer.gcif,
                onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
                riskRating: prePostQualReducer.customerRiskRating,

                fatcaStateValue: declarationReducer.fatcaStateDeclaration,
                ekycRefId: "",
                empType: employmentDetailsReducer.employmentTypeValue?.value,
                empTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
                employerName: employmentDetailsReducer.employerName,
                occupation: employmentDetailsReducer.occupationValue?.value,
                occupationValue: employmentDetailsReducer.occupationValue?.name,
                sector: employmentDetailsReducer.sectorValue?.value,
                sectorValue: employmentDetailsReducer.sectorValue?.name,
                monthlyIncomeRange: employmentDetailsReducer.monthlyIncomeValue?.value,
                monthlyIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
                sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
                sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
                sourceOfFund: additionalDetailsReducer.primaryIncomeValue?.value,
                sourceOfFundValue: additionalDetailsReducer.primaryIncomeValue?.name,
                sourceOfWealth: additionalDetailsReducer.primaryWealthValue?.value,
                sourceOfWealthValue: additionalDetailsReducer.primaryWealthValue?.name,

                customerType: "",
                userId: "",

                declarePdpaPromotion: declarationReducer.isAgreeToBeContacted,
                tc: declarationReducer.termsAndConditions,

                purpose: accountDetailsReducer.accountPurposeValue?.value,
                purposeValue: accountDetailsReducer.accountPurposeValue?.name,
                preferredBRState: accountDetailsReducer.branchStateValue?.value,
                preferredBRStateValue: accountDetailsReducer.branchStateValue?.name,
                preferredBRDistrict: accountDetailsReducer.branchDistrictValue?.value,
                preferredBRDistrictValue: accountDetailsReducer.branchDistrictValue?.name,
                preferredBranch: accountDetailsReducer.branchValue?.branchCode,
                preferredBranchValue: accountDetailsReducer.branchValue?.name,

                financialObjective: suitabilityAssessmentReducer.financialObjectiveValue?.value,
                financialObjectiveValue: suitabilityAssessmentReducer.financialObjectiveValue?.name,
                saFormSecurities: suitabilityAssessmentReducer.hasDealtWithSecurities ? YES : NO,
                saFormInvestmentRisk: suitabilityAssessmentReducer.hasRelevantKnowledge ? YES : NO,
                saFormInvestmentExp: suitabilityAssessmentReducer.hasInvestmentExperience
                    ? YES
                    : NO,
                saFormInvestmentNature: suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount
                    ? YES
                    : NO,
                saFormInvestmentTerm: suitabilityAssessmentReducer.hasUnderstoodAccountTerms
                    ? YES
                    : NO,
                saFormProductFeature: AGREE,
                saFormPIDM: AGREE,
                saFormSuitability: AGREE,
                isZestI: isZest,
                from: navigationConstant.APPLY_CARD_INTRO,
                onBoardDetails2From: userStatus,
                selectedIDType:
                    identityDetailsReducer.identityType == 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE,
            },
        });

        dispatch({
            type: PREPOSTQUAL_FINANICAL_OBJECTIVE,
            finanicalObjective: suitabilityAssessmentReducer.financialObjectiveValue?.value,
            finanicalObjectiveValue: suitabilityAssessmentReducer.financialObjectiveValue?.name,
        });

        dispatch({
            type: UPDATE_PRE_QUAL_REDUCER,
            idType: identityDetailsReducer.identityType == 1 ? MYKAD_CODE : PASSPORT_CODE,
            customerName: identityDetailsReducer.fullName,
            idNo:
                identityDetailsReducer.identityType == 1
                    ? identityDetailsReducer.identityNumber
                    : identityDetailsReducer.passportNumber,
            nationality:
                identityDetailsReducer.identityType == 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.name,
            passportExpiry:
                identityDetailsReducer.identityType == 1
                    ? ""
                    : apiToMhDateLocalServer(identityDetailsReducer.passportExpiryDateObject),
            issuedCountry:
                identityDetailsReducer.identityType == 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.value,
            issuedCountryValue:
                identityDetailsReducer.identityType == 1
                    ? ""
                    : identityDetailsReducer.nationalityValue?.name,
            customerEmail: personalDetailsReducer.emailAddress,
            mobileNo: personalDetailsReducer.mobileNumberWithExtension,
            gender: personalDetailsReducer.gender,
            genderValue: personalDetailsReducer.genderValue,
            title: personalDetailsReducer.titleValue?.value,
            titleValue: personalDetailsReducer.titleValue?.name,
            race: personalDetailsReducer.raceValue?.value,
            raceValue: personalDetailsReducer.raceValue?.name,
            pep: personalDetailsReducer.politicalExposure ? YES : NO,
            addr1: residentialDetailsReducer.addressLineOne,
            addr2: residentialDetailsReducer.addressLineTwo,
            addr3: residentialDetailsReducer.addressLineThree,
            addr4: "",
            postCode: residentialDetailsReducer.postalCode,
            state: residentialDetailsReducer.stateValue?.value,
            stateValue: residentialDetailsReducer.stateValue?.name,
            city: residentialDetailsReducer.city,
            custStatus: prePostQualReducer.custStatus,
            m2uIndicator: prePostQualReducer.m2uIndicator,
            riskRating: prePostQualReducer.customerRiskRating,
            onBoardingStatusInfo: prePostQualReducer.onBoardingStatusInfo,
            pdpa: declarationReducer.privacyPolicy,
            fatcaStateValue: declarationReducer.fatcaStateDeclaration,
            declarePdpaPromotion: declarationReducer.isAgreeToBeContacted,
            tc: declarationReducer.termsAndConditions,
            empType: employmentDetailsReducer.employmentTypeValue?.value,
            empTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
            employerName: employmentDetailsReducer.employerName,
            occupation: employmentDetailsReducer.occupationValue?.value,
            occupationValue: employmentDetailsReducer.occupationValue?.name,
            sector: employmentDetailsReducer.sectorValue?.value,
            sectorValue: employmentDetailsReducer.sectorValue?.name,
            monthlyIncomeRange: employmentDetailsReducer.monthlyIncomeValue?.value,
            monthlyIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
            sourceOfIncome: employmentDetailsReducer.incomeSourceValue?.value,
            sourceOfIncomeValue: employmentDetailsReducer.incomeSourceValue?.name,
            sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
            sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
            purpose: accountDetailsReducer.accountPurposeValue?.value,
            purposeValue: accountDetailsReducer.accountPurposeValue?.name,
            preferredBRState: accountDetailsReducer.branchStateValue?.value,
            preferredBRStateValue: accountDetailsReducer.branchStateValue?.name,
            preferredBRDistrict: accountDetailsReducer.branchDistrictValue?.value,
            preferredBRDistrictValue: accountDetailsReducer.branchDistrictValue?.name,
            preferredBranch: accountDetailsReducer.branchValue?.branchCode,
            preferredBranchValue: accountDetailsReducer.branchValue?.name,
            saFormInvestmentExp: suitabilityAssessmentReducer.hasInvestmentExperience ? YES : NO,
            saFormInvestmentNature: suitabilityAssessmentReducer.hasUnderstoodInvestmentAccount
                ? YES
                : NO,
            saFormInvestmentTerm: suitabilityAssessmentReducer.hasUnderstoodAccountTerms ? YES : NO,
            saFormInvestmentRisk: suitabilityAssessmentReducer.hasRelevantKnowledge ? YES : NO,
            saFormPIDM: AGREE,
            saFormSuitability: AGREE,
            isZestI: isZest,
            saFormProductFeature: AGREE,
            saFormSecurities: suitabilityAssessmentReducer.hasDealtWithSecurities ? YES : NO,
        });
    }

    function onPersonalDetailsEditDidTap() {
        props.updateConfirmationScreenStatusForPersonalDetails(true);
        return userStatus && userStatus !== ZEST_NTB_USER
            ? navigation.push(navigationConstant.ZEST_CASA_RESIDENTIAL_DETAILS)
            : navigation.push(navigationConstant.ZEST_CASA_PERSONAL_DETAILS);
    }

    function onResidentialDetailsEditDidTap() {
        props.updateConfirmationScreenStatusForResidentialDetails(true);
        navigation.push(navigationConstant.ZEST_CASA_RESIDENTIAL_DETAILS);
    }

    function onEmploymentDetailsEditDidTap() {
        props.updateConfirmationScreenStatusForEmploymentDetails(true);
        navigation.push(navigationConstant.ZEST_CASA_EMPLOYMENT_DETAILS);
    }

    function onAccountDetailsEditDidTap() {
        props.updateConfirmationScreenStatusForAccountDetails(true);
        navigation.push(navigationConstant.ZEST_CASA_ACCOUNT_DETAILS);
    }

    function onAdditionalDetailsEditDidTap() {
        props.updateConfirmationScreenStatusForAdditionalDetails(true);
        navigation.push(navigationConstant.ZEST_CASA_ADDITIONAL_DETAILS);
    }

    const analyticScreenName = isZest ? APPLY_ZESTI_CONFIRMATION : APPLY_M2U_PREMIER_CONFIRMATION;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={CONFIRMATION}
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
                                <View style={Style.contentContainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={21}
                                        textAlign="left"
                                        text={PLSTP_CONFIRMATION_DESC}
                                    />
                                </View>
                                <SpaceFiller height={24} />
                                <InfoDetails
                                    title={ZEST_CASA_PERSONAL_DETAILS}
                                    info={personalDetails}
                                    handlePress={
                                        userStatus && userStatus === ZEST_NTB_USER
                                            ? onPersonalDetailsEditDidTap
                                            : onResidentialDetailsEditDidTap
                                    }
                                    buttonValue={ZEST_CASA_PERSONAL_DETAILS}
                                />
                                {userStatus && userStatus === ZEST_NTB_USER && (
                                    <InfoDetails
                                        title={ZEST_CASA_RESIDENTIAL_DETAILS}
                                        info={residentialDetails}
                                        handlePress={onResidentialDetailsEditDidTap}
                                        buttonValue={ZEST_CASA_RESIDENTIAL_DETAILS}
                                    />
                                )}
                                <InfoDetails
                                    title={ZEST_CASA_EMPLOYMENT_DETAILS}
                                    info={employmentDetails}
                                    handlePress={onEmploymentDetailsEditDidTap}
                                    buttonValue={ZEST_CASA_EMPLOYMENT_DETAILS}
                                />
                                <InfoDetails
                                    title={ZEST_CASA_ACCOUNT_DETAILS}
                                    info={accountDetails}
                                    handlePress={onAccountDetailsEditDidTap}
                                    buttonValue={ZEST_CASA_ACCOUNT_DETAILS}
                                />
                                {additionalDetailsReducer.primaryIncomeIndex !== null &&
                                    additionalDetailsReducer.primaryIncomeValue && (
                                        <InfoDetails
                                            title={ZEST_CASA_ADDITIONAL_DETAILS}
                                            info={additionalDetails}
                                            handlePress={onAdditionalDetailsEditDidTap}
                                            buttonValue={ZEST_CASA_ADDITIONAL_DETAILS}
                                        />
                                    )}
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_AGREE}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

ZestCASAConfirmation.propTypes = {
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...identityDetailsPropTypes,
    ...personalDetailsPropTypes,
    ...residentialDetailsPropTypes,
    ...employmentDetailsPropTypes,
    ...declarationPropTypes,
    ...accountDetailsPropTypes,
    ...additionalDetailsPropTypes,
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
});

export default masterDataServiceProps(
    downTimeServiceProps(
        entryProps(
            identityDetailsProps(
                personalDetailsProps(
                    residentialDetailsProps(
                        employmentDetailsProps(
                            declarationProps(
                                additionalDetailsProps(accountDetailsProps(ZestCASAConfirmation))
                            )
                        )
                    )
                )
            )
        )
    )
);

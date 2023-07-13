/* eslint-disable radix */
import { useNavigationState } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import {
    JA_CONFIRMATION,
    JA_RESULT,
    BANKINGV2_MODULE,
    JA_ADDITIONAL,
    JA_PERSONAL_INFO,
    JA_OWNER_CONFIRMATION,
    JA_EMPLOYMENT_ADDRESS,
    JA_EMPLOYMENT_DETAILS,
    JA_CUST_ADDRESS,
    APPLICATION_DETAILS,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { loanScoreParty } from "@services";

import { MEDIUM_GREY } from "@constants/colors";
import { PROP_ELG_INPUT, INELGIBLE_OCCUPATION_LIST } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    SAVE,
    DONT_SAVE,
    PROP_PURCHASE_LBL,
    ONGOING_LOAN_LBL,
    JA_CONFIRMATION_TITLE,
    CONFIRMATION,
    PROPERTY_DETAILS,
    PERSONAL_DETAILS_TEXT,
    CONTACT_DETAILS,
    EMPLOYMENT_DETAILS_TEXT,
    OFFICE_ADDRESS,
    APPLICATION_REMOVE_TITLE,
    APPLICATION_REMOVE_DESCRIPTION,
    OKAY,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    PLSTP_AGREE,
    FA_PROPERTY_JACEJA_CONFIRMATION,
    FIRST_TIME_PURCHASING_HOUSE,
} from "@constants/strings";

import { maskAddress, maskMobileNumber } from "@utils/maskUtils";

import { fetchGetApplicants, fetchJointApplicationDetails } from "../Application/LAController";
import { getExistingData, getEncValue } from "../Common/PropertyController";
import SummaryContainer from "../Common/SummaryContainer";
import {
    saveEligibilityInput,
    checkEligibilityForJointApplicant,
    removeInputFormRoutes,
} from "./JAController";

function JAConfirmation({ route, navigation }) {
    const safeAreaInsets = useSafeArea();
    const [loading, setLoading] = useState(true);
    const [propertyData, setPropertyData] = useState([]);
    const [personalData, setPersonalData] = useState([]);
    const [contactDetailsData, setContactDetailsData] = useState([]);
    const [empData, setEmpData] = useState([]);
    const [empAddressData, setEmpAddressData] = useState([]);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [stpId, setStpId] = useState();
    const navigationState = useNavigationState((state) => state);
    const [showApplicationRemovePopup, setShowApplicationRemovePopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const updateData = route?.params?.updateData ?? null;
        if (updateData) {
            // Call method to refresh data
            refreshData();
        }
    }, [route.params]);

    const init = useCallback(() => {
        console.log("[JAConfirmation] >> [init]");

        // Populate details
        setDetails();
        setLoading(false);
    }, [route, navigation]);

    async function onCloseTap() {
        console.log("[JAConfirmation] >> [onCloseTap]");
        const navParams = route?.params ?? {};
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            return;
        }

        setShowExitPopup(true);
    }

    async function refreshData() {
        console.log("[JAConfirmation] >> [refreshData]");

        // Reset updateData value
        navigation.setParams({
            updateData: null,
        });

        // Call method to update latest data on UI
        setDetails();

        // Save updated data in DB
        const { success, errorMessage, stpId } = await saveEligibilityInput({
            screenName: JA_CONFIRMATION,
            formData: {},
            navParams: route?.params,
        });

        if (!success) {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
        if (stpId) {
            setStpId(stpId);
        }
    }

    function setDetails() {
        console.log("[JAConfirmation] >> [setDetails]");

        // Call methods to populate details
        setEmpContactDetails();
        setPropertyDetails();
        setPersonalDetails();
        setEmpDetails();
        setEmpAddressDetails();
        // setAdditionalDetails();
    }

    function setPropertyDetails() {
        console.log("[JAConfirmation] >> [setPropertyDetails]");
        const navParams = route?.params ?? {};
        const propertyName = navParams?.propertyName ?? "";
        const unitTypeyName = navParams?.unitTypeName ?? "";
        const propertyPrice = navParams?.propertyPrice ?? "";
        const propertyPriceDisp = getFormattedAmount(propertyPrice);
        const downPaymentAmount = navParams?.downPayment;
        const downPaymentAmountDisp = getFormattedAmount(downPaymentAmount);
        const loanAmount =
            navParams?.eligibilityResult?.aipAmount ?? navParams?.propertyFinancingAmt;
        const loanAmountDisp = getFormattedAmount(loanAmount);
        const tenure = navParams?.financingPeriod ? `${navParams?.financingPeriod} years` : "";
        setPropertyData([
            // {
            //     label: "Owner of unit?",
            //     value: isUnitOwnerText,
            // },
            {
                label: "Property name",
                value: propertyName,
            },
            {
                label: "Unit type",
                value: unitTypeyName,
            },
            {
                label: "Property price",
                value: propertyPriceDisp,
            },
            {
                label: "Downpayment",
                value: downPaymentAmountDisp,
            },
            {
                label: "Property financing amount",
                value: loanAmountDisp,
            },
            {
                label: "Financing period",
                value: tenure,
            },
        ]);
    }

    function setPersonalDetails() {
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const financingType = navParams?.financingType ?? "";
        const residentStatus = navParams?.residentStatus ?? "";
        const residentSelect = getExistingData(
            residentStatus,
            masterData?.customerGroup ?? null,
            ""
        );
        const education = navParams?.education ?? "";
        const educationSelect = getExistingData(education, masterData?.education ?? null, "");
        const employmentStatus = navParams?.employmentStatus ?? "";
        const empTypeSelect = getExistingData(
            employmentStatus,
            masterData?.employmentType ?? null,
            ""
        );
        const businessType = navParams?.businessType ?? "";
        const bizClassificationSelect = getExistingData(
            businessType,
            masterData?.businessClassification ?? null,
            ""
        );
        const grossIncome = navParams?.grossIncome ?? "";
        const grossIncomeDisp = getFormattedAmount(grossIncome);
        const housingLoan = navParams?.housingLoan ?? "";
        const housingLoanDisp = getFormattedAmount(housingLoan);
        const personalLoan = navParams?.personalLoan ?? "";
        const personalLoanDisp = getFormattedAmount(personalLoan);
        const overdraft = navParams?.overdraft ?? "";
        const overdraftDisp = getFormattedAmount(overdraft);
        const ccRepayments = navParams?.ccRepayments ?? "";
        const ccRepaymentsDisp = getFormattedAmount(ccRepayments);
        const carLoan = navParams?.carLoan ?? "";
        const carLoanDisp = getFormattedAmount(carLoan);
        const maritalStatus = navParams?.maritalStatus ?? "";
        const maritalSelect = getExistingData(maritalStatus, masterData?.maritalStatus ?? null, "");
        const religion = navParams?.religion ?? "";
        const religionSelect = getExistingData(religion, masterData?.religion ?? null, "");
        const spouseIncome = navParams?.spouseIncome ?? "";
        const spouseIncomeDisp = getFormattedAmount(spouseIncome);
        const isFirstTimeBuyHomeIndc = navParams?.isFirstTimeBuyHomeIndc === "Y" ? "Yes" : "No";
        const houseLoan = navParams?.houseLoan ?? "";
        const nonBankCommitments = navParams?.nonBankCommitments ?? "";
        const nonBankCommitmentsDisp = getFormattedAmount(nonBankCommitments);
        const ccrisLoanCount = navParams?.ccrisLoanCount ?? "";
        const showFinDeclarationDetails =
            !isNaN(parseInt(ccrisLoanCount)) && parseInt(ccrisLoanCount) > 0;
        const propertyPurchase = navParams?.propertyPurchase ?? "";
        const propertyPurchaseText = propertyPurchase === "Y" ? "Yes" : "No";
        const ongoingLoan = navParams?.ongoingLoan ?? "";
        const ongoingLoanText = ongoingLoan === "Y" ? "Yes" : "No";
        const title = navParams?.title ?? "";
        const titleSelect = getExistingData(title, masterData?.title ?? null, "");

        const finDeclarationDetails = [
            {
                label: PROP_PURCHASE_LBL,
                value: propertyPurchaseText,
            },
            {
                label: ONGOING_LOAN_LBL,
                value: ongoingLoanText,
            },
        ];
        const detailsArray = [
            {
                label: "Title",
                value: titleSelect?.name,
            },
            {
                label: "Resident status",
                value: residentSelect?.name,
            },
            {
                label: "Education",
                value: educationSelect?.name,
            },
            {
                label: "Employment status",
                value: empTypeSelect?.name,
            },
            {
                label: "Employment business type",
                value: bizClassificationSelect?.name,
            },
            {
                label: "Gross monthly income",
                value: grossIncomeDisp,
            },
            {
                label: "Marital status",
                value: maritalSelect?.name,
            },
            {
                label: "Spouse gross income",
                value: spouseIncomeDisp,
            },
            {
                label: "Religion",
                value: religionSelect?.name,
            },
            {
                label: FIRST_TIME_PURCHASING_HOUSE,
                value: isFirstTimeBuyHomeIndc,
            },
            {
                label:
                    financingType === "islamic"
                        ? "Existing home financing"
                        : "Existing housing loans",
                value: houseLoan,
            },
            {
                label: "Home financing",
                value: housingLoanDisp,
            },
            {
                label: "Personal financing",
                value: personalLoanDisp,
            },
            {
                label: "Credit card repayments",
                value: ccRepaymentsDisp,
            },
            {
                label: "Car financing",
                value: carLoanDisp,
            },
            {
                label: "Overdraft",
                value: overdraftDisp,
            },
            {
                label: "Non-bank commitments",
                value: nonBankCommitmentsDisp,
            },
        ];
        if (showFinDeclarationDetails) {
            //console.log(detailsArray,'if')
            setPersonalData([...detailsArray, ...finDeclarationDetails]);
        } else {
            // console.log(detailsArray,'else')
            setPersonalData(detailsArray);
        }
    }

    function setEmpDetails() {
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};

        const occupation = navParams?.occupation ?? "";
        const occupationSelect = getExistingData(occupation, masterData?.occupation ?? null, "");
        const employerName = navParams?.employerName ?? "";
        const occupationSector = navParams?.occupationSector ?? "";
        const sectorSelect = getExistingData(
            occupationSector,
            masterData?.occupationSector ?? null,
            ""
        );
        const empYears = navParams?.empYears ?? "";
        const empMonths = navParams?.empMonths ?? "";
        let durationText = "";
        if (empYears && empMonths) {
            const empYearsText = empYears === 1 ? `${empYears} year` : `${empYears} years`;
            const empMonthsText = empMonths === 1 ? `${empMonths} month` : `${empMonths} months`;
            durationText = empMonths < 1 ? empYearsText : `${empYearsText} ${empMonthsText}`;
        }

        setEmpData([
            {
                label: "Occupation",
                value: occupationSelect.name,
            },
            {
                label: "Name of employer",
                value: employerName,
            },
            {
                label: "Occupation sector",
                value: sectorSelect.name,
            },
            {
                label: "Duration of service",
                value: durationText,
            },
        ]);
    }

    function setEmpAddressDetails() {
        console.log("[JAConfirmation] >> [setEmpAddressDetails]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};

        const empAddress1 = navParams?.employerAddr1;
        const empAddress2 = navParams?.employerAddr2;
        const empAddress3 = navParams?.employerAddr3;
        const empCity = navParams?.employerCity;
        const empPostcode = navParams?.employerPostCode;
        const empState = navParams?.employerState;
        const stateSelect = getExistingData(empState, masterData?.state ?? null, "");
        const empCountry = navParams?.employerCountry;
        const countrySelect = getExistingData(empCountry, masterData?.country ?? null, "");
        const empContactNumber = navParams?.employerPhoneNo;

        const maskedAddress1 = maskAddress(empAddress1);
        const maskedAddress2 = maskAddress(empAddress2);
        const maskedAddress3 = maskAddress(empAddress3);
        const maskedCity = maskAddress(empCity);
        const maskedContactNum = maskMobileNumber(empContactNumber);

        const occupationValue = navParams?.occupation ?? "";
        //dont show office details if occupation is above mentioned
        if (!INELGIBLE_OCCUPATION_LIST.includes(occupationValue)) {
            setEmpAddressData([
                {
                    label: "Country",
                    value: countrySelect.name,
                },
                {
                    label: "Address line 1",
                    value: maskedAddress1,
                },
                {
                    label: "Address line 2",
                    value: maskedAddress2,
                },
                {
                    label: "Address line 3",
                    value: maskedAddress3,
                },
                {
                    label: "City",
                    value: maskedCity,
                },
                {
                    label: "Postcode",
                    value: empPostcode,
                },
                {
                    label: "State",
                    value: stateSelect.name,
                },

                {
                    label: "Contact number",
                    value: maskedContactNum,
                },
            ]);
        }
    }
    function setEmpContactDetails() {
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const isMailingAddr = navParams?.isMailingAddr ?? "";

        const homeAddr1 = navParams?.homeAddr1 ?? "";
        const homeAddr2 = navParams?.homeAddr2 ?? "";
        const homeAddr3 = navParams?.homeAddr3 ?? "";
        const homeCity = navParams?.homeCity ?? "";
        const homePostCode = navParams?.homePostCode ?? "";
        const homeState = navParams?.homeState ?? "";
        const homeStateSelect = getExistingData(homeState, masterData?.state ?? null, "");

        const maskedHomeAddress1 = maskAddress(homeAddr1);
        const maskedHomeAddress2 = maskAddress(homeAddr2);
        const maskedHomeAddress3 = maskAddress(homeAddr3);
        const maskedHomeCity = maskAddress(homeCity);
        const correspondenseCountry = navParams?.homeCountry;
        const countrySelect = getExistingData(
            correspondenseCountry,
            masterData?.country ?? null,
            ""
        );
        const isMailingAddrText = isMailingAddr === "Y" ? "Yes" : "No";

        const homeAddress = [
            {
                label: "Country",
                value: countrySelect.name,
            },
            {
                label: "Home address line 1",
                value: maskedHomeAddress1,
            },
            {
                label: "Home address line 2",
                value: maskedHomeAddress2,
            },
            {
                label: "Home address line 3",
                value: maskedHomeAddress3,
            },
            {
                label: "City",
                value: maskedHomeCity,
            },
            {
                label: "Postcode",
                value: homePostCode,
            },

            {
                label: "State",
                value: homeStateSelect.name,
            },
        ];

        if (isMailingAddr === "N") {
            const mailingAddr1 = navParams?.mailingAddr1 ?? "";
            const mailingAddr2 = navParams?.mailingAddr2 ?? "";
            const mailingAddr3 = navParams?.mailingAddr3 ?? "";
            const mailingCity = navParams?.mailingCity ?? "";
            const mailingPostCode = navParams?.mailingPostCode ?? "";
            const mailingState = navParams?.mailingState ?? "";
            const mailingStateSelect = getExistingData(mailingState, masterData?.state ?? null, "");

            const maskedMailAddress1 = maskAddress(mailingAddr1);
            const maskedMailAddress2 = maskAddress(mailingAddr2);
            const maskedMailAddress3 = maskAddress(mailingAddr3);
            const maskedMailCity = maskAddress(mailingCity);
            const mailingCountry = navParams?.mailingCountry;
            const countrySelect = getExistingData(mailingCountry, masterData?.country ?? null, "");

            const mailingAddress = [
                {
                    label: "Country",
                    value: countrySelect.name,
                },
                {
                    label: "Mailing address line 1",
                    value: maskedMailAddress1,
                },
                {
                    label: "Mailing address line 2",
                    value: maskedMailAddress2,
                },
                {
                    label: "Mailing address line 3",
                    value: maskedMailAddress3,
                },
                {
                    label: "City",
                    value: maskedMailCity,
                },
                {
                    label: "Postcode",
                    value: mailingPostCode,
                },
                {
                    label: "State",
                    value: mailingStateSelect.name,
                },
            ];
            setContactDetailsData([...homeAddress, ...mailingAddress]);
        } else {
            setContactDetailsData([
                ...homeAddress,
                {
                    label: "Same as mailing address?",
                    value: isMailingAddrText,
                },
            ]);
        }
    }
    function getFormattedAmount(amount) {
        return amount ? `RM ${numeral(amount).format("0,0.00")}` : "";
    }
    async function onExitPopupSave() {
        // Hide popup
        closeExitPopup();
        const navParams = route?.params;
        navParams.saveData = "Y";
        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityInput({
            screenName: JA_CONFIRMATION,
            formData: { progressStatus: PROP_ELG_INPUT },
            navParams,
        });
        if (success) {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 1,
                            reload: true,
                        },
                    },
                ],
            });
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[JAConfirmation] >> [onExitPopupDontSave]");
        // Hide popup
        closeExitPopup();
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                },
            ],
        });
    }

    function closeExitPopup() {
        console.log("[JAConfirmation] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onPropertyDetailsEdit() {
        console.log("[JAConfirmation] >> [onPropertyDetailsEdit]");
        // Navigate to Unit Number edit screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JA_OWNER_CONFIRMATION,
            params: {
                ...route.params,
            },
        });
    }

    function onPersonalDetailsEdit() {
        console.log("[JAConfirmation] >> [onPersonalDetailsEdit]");
        // Navigate to Customer Address edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: JA_PERSONAL_INFO,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onEmpDetailsEdit() {
        console.log("[JAConfirmation] >> [onEmpDetailsEdit]");

        // Navigate to Employer details edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: JA_EMPLOYMENT_DETAILS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onEmpAddressEdit() {
        console.log("[JAConfirmation] >> [onEmpAddressEdit]");

        // Navigate to Employer Address edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: JA_EMPLOYMENT_ADDRESS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onEmpContactEdit() {
        console.log("[JAConfirmation] >> [onEmpContactEdit]");
        // Navigate to Additional details edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: JA_CUST_ADDRESS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function closeCancelRemovePopup() {
        setShowApplicationRemovePopup(false);
        reloadApplicationDetails();
    }
    function closeRemoveAppPopup() {
        setShowApplicationRemovePopup(false);
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        const navParams = route?.params ?? {};
        const encSyncId = await getEncValue(navParams?.syncId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchJointApplicationDetails(params, true);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (savedData?.isSaveData === "Y" && success) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: APPLICATION_DETAILS,
                params: {
                    ...navParams,
                    savedData,
                    cancelReason,
                    propertyDetails,
                    reload: true,
                },
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: PROPERTY_DASHBOARD,
                        params: {
                            activeTabIndex: 1,
                            reload: true,
                        },
                    },
                ],
            });
        }
    }

    async function onContinue() {
        const navigationRoutes = navigationState?.routes ?? [];
        const updatedRoutes = removeInputFormRoutes(navigationRoutes);
        const navParams = route?.params ?? {};
        navParams.saveData = "Y";
        if (stpId) {
            navParams.applicationStpRefNo = stpId;
        }
        const mdmData = navParams?.mdmData ?? {};
        const params = {
            pepDeclaration: mdmData?.pep ?? "",
            empType: navParams?.employmentStatus,
            employerName: navParams?.employerName,
            occupation: navParams?.occupation,
            occupationSector: navParams?.occupationSector,
        };
        const httpResp = await loanScoreParty(params, true).catch((error) => {
            console.log("[JAConfirmation][loanScoreParty] >> Exception: ", error);
        });
        const customerRiskRating = httpResp?.data?.result?.customerRiskRating ?? null;
        // const customerRiskRating = "HR";//navParams?.customerRiskRating ?? "";
        const showDetails = customerRiskRating === "HR";
        const getSyncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(getSyncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setShowApplicationRemovePopup(true);
            return;
        }
        // Call API to check eligibility for joint applicant
        if (showDetails) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: JA_ADDITIONAL,
                params: {
                    ...navParams,
                    // ...formData,
                },
            });
            setLoading(false);
        } else {
            setLoading(true);
            const {
                success,
                errorMessage,
                stpId,
                eligibilityResult,
                overallStatus,
                baseRateLabel,
            } = await checkEligibilityForJointApplicant(
                {
                    ...navParams,
                },
                false
            );
            if (!success) {
                setLoading(false);
                showErrorToast({
                    message: errorMessage || COMMON_ERROR_MSG,
                });
                return;
            }

            const nextScreen = {
                name: JA_RESULT,
                params: {
                    ...navParams,
                    stpApplicationId: stpId,
                    eligibilityResult,
                    eligibilityStatus: overallStatus,
                    editFlow: null,
                    baseRateLabel,
                },
            };
            updatedRoutes.push(nextScreen);

            // Navigate to Eligibility result screen
            navigation.reset({
                index: updatedRoutes.length - 1,
                routes: updatedRoutes,
            });
            setLoading(false);
        }
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_JACEJA_CONFIRMATION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={CONFIRMATION}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                >
                    <ScrollView style={Style.scrollContainer} showsVerticalScrollIndicator={false}>
                        <Typo
                            lineHeight={18}
                            text={JA_CONFIRMATION_TITLE}
                            textAlign="left"
                            style={Style.horizontalMargin}
                        />

                        {/* Personal details */}
                        <SummaryContainer
                            headerText={PERSONAL_DETAILS_TEXT}
                            data={personalData}
                            sectionEdit
                            style={Style.summaryContCls}
                            editPress={onPersonalDetailsEdit}
                        />
                        {/* Property details */}
                        <SummaryContainer
                            headerText={PROPERTY_DETAILS}
                            data={propertyData}
                            sectionEdit={false}
                            style={Style.summaryContCls}
                            editPress={onPropertyDetailsEdit}
                        />
                        {/* Contact details */}

                        <SummaryContainer
                            headerText={CONTACT_DETAILS}
                            data={contactDetailsData}
                            sectionEdit
                            style={Style.summaryContCls}
                            editPress={onEmpContactEdit}
                        />

                        {/* Employment details */}
                        <SummaryContainer
                            headerText={EMPLOYMENT_DETAILS_TEXT}
                            data={empData}
                            sectionEdit
                            style={Style.summaryContCls}
                            editPress={onEmpDetailsEdit}
                        />
                        {/* Office address */}
                        {empAddressData.length > 0 && (
                            <SummaryContainer
                                headerText={OFFICE_ADDRESS}
                                data={empAddressData}
                                sectionEdit
                                style={Style.summaryContCls}
                                editPress={onEmpAddressEdit}
                            />
                        )}

                        {/* Bottom  button container */}
                        <View
                            style={[
                                Style.horizontalMargin,
                                Style.bottomBtnContCls(safeAreaInsets.bottom),
                            ]}
                        >
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo lineHeight={18} fontWeight="600" text={PLSTP_AGREE} />
                                }
                                onPress={onContinue}
                            />
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_JA_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
            {/*Application Removed popup */}
            <Popup
                visible={showApplicationRemovePopup}
                title={APPLICATION_REMOVE_TITLE}
                description={APPLICATION_REMOVE_DESCRIPTION}
                onClose={closeRemoveAppPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeCancelRemovePopup,
                }}
            />
        </>
    );
}

JAConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: (paddingBottom) => ({
        marginVertical: 30,
        paddingBottom,
    }),

    horizontalMargin: {
        marginHorizontal: 24,
    },

    scrollContainer: {
        flex: 1,
    },

    summaryContCls: {
        marginBottom: 0,
    },
});

export default JAConfirmation;

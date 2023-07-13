/* eslint-disable sonarjs/cognitive-complexity */

/* eslint-disable radix */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import {
    LA_CONFIRMATION,
    LA_RESULT,
    BANKINGV2_MODULE,
    LA_UNIT_NUMBER_EDIT,
    LA_CUST_ADDRESS,
    LA_EMP_DETAILS,
    LA_EMP_ADDRESS,
    LA_FINANCING_TYPE,
    LA_ADDITIONAL,
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
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    PROP_PURCHASE_LBL,
    ONGOING_LOAN_LBL,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_PROPERTY_APPLY_CONFIRMATION,
    FIRST_TIME_PURCHASING_HOUSE,
    CONFIRMATION,
    CONFIRM_SUBMIT,
    ELIGIBILITY_DETAILS,
    EMPLOYMENT_DETAILS_TEXT,
    JA_CONFIRMATION_TITLE,
    OFFICE_ADDRESS,
    PERSONAL_DETAILS_TEXT,
    PRODUCT_DETAILS,
    PROPERTY_DETAILS,
} from "@constants/strings";

import { maskAddress, maskMobileNumber } from "@utils/maskUtils";

import {
    getExistingData,
    useResetNavigation,
    getEncValue,
    isOccupationSpecificCateg,
} from "../Common/PropertyController";
import SummaryContainer from "../Common/SummaryContainer";
import { saveLAInput, loanSubmissionRequest, fetchGetApplicants } from "./LAController";

function LAConfirmation({ route, navigation }) {
    const safeAreaInsets = useSafeArea();
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [loading, setLoading] = useState(true);
    const [eligibilityData, setEligibilityData] = useState([]);
    const [propertyData, setPropertyData] = useState([]);
    const [personalData, setPersonalData] = useState([]);
    const [empData, setEmpData] = useState([]);
    const [empAddressData, setEmpAddressData] = useState([]);
    const [financingData, setFinancingData] = useState([]);

    const [showExitPopup, setShowExitPopup] = useState(false);

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
        console.log("[LAConfirmation] >> [init]");

        // Populate details
        setDetails();
        setLoading(false);
    }, [route, navigation]);

    function onCloseTap() {
        console.log("[LAConfirmation] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    async function refreshData() {
        console.log("[LAConfirmation] >> [refreshData]");

        // Reset updateData value
        navigation.setParams({
            updateData: null,
        });

        // Call method to update latest data on UI
        setDetails();

        // Save updated data in DB
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_CONFIRMATION,
            formData: {},
            navParams: route?.params,
        });

        if (!success) {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function setDetails() {
        console.log("[LAConfirmation] >> [setDetails]");

        // Call methods to populate details
        setEligibilityDetails();
        setPropertyDetails();
        setPersonalDetails();
        setEmpDetails();
        setEmpAddressDetails();
        setFinancingsDetails();
    }

    function setEligibilityDetails() {
        console.log("[LAConfirmation] >> [setEligibilityDetails]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};

        const propertyName = navParams?.propertyName ?? "";
        const financingType = navParams?.financingType ?? "";
        const unitTypeName = navParams?.unitTypeName ?? "";
        const propertyPrice = navParams?.propertyPrice ?? "";
        const propertyPriceDisp = getFormattedAmount(propertyPrice);
        const downPaymentAmount = navParams?.downPaymentAmount;
        const downPaymentAmountDisp = getFormattedAmount(downPaymentAmount);
        const loanAmount = navParams?.eligibilityResult?.aipAmount ?? navParams?.loanAmount;
        const loanAmountDisp = getFormattedAmount(loanAmount);
        const tenure = (() => {
            if (navParams?.eligibilityResult?.tenure) { return `${navParams?.eligibilityResult?.tenure} years`; } else if (navParams?.tenure) return `${navParams?.tenure} years`;
            else return "";
        })();

        const title = navParams?.title ?? "";
        const titleSelect = getExistingData(title, masterData?.title ?? null, "");

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
        const occupation = navParams?.occupation ?? "";
        const occupationSelect = getExistingData(occupation, masterData?.occupation ?? null, "");
        const grossIncome = navParams?.grossIncome ?? "";
        const grossIncomeDisp = getFormattedAmount(grossIncome);
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
                label: "Property name",
                value: propertyName,
            },
            {
                label: "Unit type",
                value: unitTypeName,
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
                label:
                    financingType === "islamic"
                        ? "Property financing amount"
                        : "Property loan amount",
                value: loanAmountDisp,
            },
            {
                label: financingType === "islamic" ? "Financing period" : "Loan period",
                value: tenure,
            },
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
                label: "Occupation",
                value: occupationSelect?.name,
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
                label: "Religion",
                value: religionSelect?.name,
            },
            {
                label: "Spouse gross income",
                value: spouseIncomeDisp,
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
                label: "Non-bank commitments",
                value: nonBankCommitmentsDisp,
            },
        ];

        if (showFinDeclarationDetails) {
            setEligibilityData([...detailsArray, ...finDeclarationDetails]);
        } else {
            setEligibilityData(detailsArray);
        }
    }

    function setPropertyDetails() {
        console.log("[LAConfirmation] >> [setPropertyDetails]");

        const navParams = route?.params ?? {};
        const unitNo = navParams?.unitNo ?? "";
        const isUnitOwner = navParams?.isUnitOwner ?? null;
        const isJaUnitOwner = navParams?.isJaUnitOwner ?? null;
        let isUnitOwnerText;
        if (isUnitOwner !== null) {
            isUnitOwnerText = isUnitOwner === "" ? "" : isUnitOwner === "Y" ? "Yes" : "No";
        } else {
            isUnitOwnerText = isJaUnitOwner === "" ? "" : isJaUnitOwner === "Y" ? "Yes" : "No";
        }

        if (unitNo && isUnitOwnerText) {
            setPropertyData([
                {
                    label: "Unit Number",
                    value: unitNo,
                },
                {
                    label: "Owner of unit?",
                    value: isUnitOwnerText,
                },
            ]);
        }
    }

    function setPersonalDetails() {
        console.log("[LAConfirmation] >> [setPersonalDetails]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};

        const correspondenseAddr1 = navParams?.correspondenseAddr1 ?? "";
        const correspondenseAddr2 = navParams?.correspondenseAddr2 ?? "";
        const correspondenseAddr3 = navParams?.correspondenseAddr3 ?? "";
        const correspondenseCity = navParams?.correspondenseCity ?? "";
        const correspondensePostCode = navParams?.correspondensePostCode ?? "";
        const correspondenseState = navParams?.correspondenseState ?? "";
        const correspondenseStateSelect = getExistingData(
            correspondenseState,
            masterData?.state ?? null,
            ""
        );
        const isMailingAddr = navParams?.isMailingAddr ?? "";
        const isMailingAddrText = isMailingAddr === "Y" ? "Yes" : "No";

        const maskedAddress1 = maskAddress(correspondenseAddr1);
        const maskedAddress2 = maskAddress(correspondenseAddr2);
        const maskedAddress3 = maskAddress(correspondenseAddr3);
        const maskedCity = maskAddress(correspondenseCity);
        const correspondenseCountry = navParams?.correspondenseCountry;
        const countrySelect = getExistingData(
            correspondenseCountry,
            masterData?.country ?? null,
            ""
        );

        const correspondenceAddress = [
            {
                label: "Country",
                value: countrySelect.name,
            },
            {
                label: "Home address line 1",
                value: maskedAddress1,
            },
            {
                label: "Home address line 2",
                value: maskedAddress2,
            },
            {
                label: "Home address line 3",
                value: maskedAddress3,
            },
            {
                label: "City",
                value: maskedCity,
            },
            {
                label: "Postcode",
                value: correspondensePostCode,
            },
            {
                label: "State",
                value: correspondenseStateSelect.name,
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
                    label: "country",
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

            setPersonalData([...correspondenceAddress, ...mailingAddress]);
        } else {
            setPersonalData([
                ...correspondenceAddress,
                {
                    label: "Same as mailing address?",
                    value: isMailingAddrText,
                },
            ]);
        }
    }

    function setEmpDetails() {
        console.log("[LAConfirmation] >> [setEmpDetails]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};

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

        const occupationValue = navParams?.occupation ?? "";
        const isSpecificOccupation = isOccupationSpecificCateg(occupationValue);
        const empData = [];
        if (!isSpecificOccupation) {
            const empDataArray = [
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
            ];
            empData.push(...empDataArray);
        }

        setEmpData(empData);
    }

    function setEmpAddressDetails() {
        console.log("[LAConfirmation] >> [setEmpAddressDetails]");

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
        const isSpecificOccupation = isOccupationSpecificCateg(occupationValue);
        //dont show office details if occupation is above mentioned
        if (!isSpecificOccupation) {
            setEmpAddressData([
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
                    label: "Country",
                    value: countrySelect.name,
                },
                {
                    label: "Contact number",
                    value: maskedContactNum,
                },
            ]);
        }
    }

    function setFinancingsDetails() {
        console.log("[LAConfirmation] >> [setFinancingsDetails]");

        const navParams = route?.params ?? {};
        const financingTypeTitle = navParams?.financingTypeTitle ?? "";
        const financingPlanTitle = navParams?.financingPlanTitle ?? "";
        if (financingTypeTitle && financingPlanTitle) {
            setFinancingData([
                {
                    label: "Financing type",
                    value: financingTypeTitle,
                },
                {
                    label: "Financing plan",
                    value: financingPlanTitle,
                },
            ]);
        }
    }

    function getFormattedAmount(amount) {
        return amount ? `RM ${numeral(amount).format("0,0.00")}` : "";
    }

    async function onExitPopupSave() {
        console.log("[LAConfirmation] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_CONFIRMATION,
            formData: {},
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LAConfirmation] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAConfirmation] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onPropertyDetailsEdit() {
        console.log("[LAConfirmation] >> [onPropertyDetailsEdit]");

        // Navigate to Unit Number edit screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_UNIT_NUMBER_EDIT,
            params: {
                ...route.params,
            },
        });
    }

    function onPersonalDetailsEdit() {
        console.log("[LAConfirmation] >> [onPersonalDetailsEdit]");

        // Navigate to Customer Address edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: LA_CUST_ADDRESS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onEmpDetailsEdit() {
        console.log("[LAConfirmation] >> [onEmpDetailsEdit]");

        // Navigate to Employer details edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: LA_EMP_DETAILS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onEmpAddressEdit() {
        console.log("[LAConfirmation] >> [onEmpAddressEdit]");

        // Navigate to Employer Address edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: LA_EMP_ADDRESS,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function onProductDetailsEdit() {
        console.log("[LAConfirmation] >> [onProductDetailsEdit]");

        // Navigate to Financing Type edit screen
        navigation.push(BANKINGV2_MODULE, {
            screen: LA_FINANCING_TYPE,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    async function onContinue() {
        console.log("[LAConfirmation] >> [onContinue]");

        setLoading(true);

        const navParams = route?.params ?? {};
        const mdmData = navParams?.mdmData ?? {};

        const params = {
            pepDeclaration: mdmData?.pep ?? "",
            empType: navParams?.employmentStatus,
            employerName: navParams?.employerName,
            occupation: navParams?.occupation,
            occupationSector: navParams?.occupationSector,
        };

        // Call API to loanScoreParty
        const httpResp = await loanScoreParty(params, true).catch((error) => {
            console.log("[LAConfirmation][loanScoreParty] >> Exception: ", error);
        });

        const statusCode = httpResp?.data?.result?.statusCode;
        const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;
        const customerRiskRating = httpResp?.data?.result?.customerRiskRating;

        if (statusCode !== "0000") {
            setLoading(false);
            showErrorToast({ message: statusDesc ?? COMMON_ERROR_MSG });
            return;
        }

        // HR is High Risk Customer
        if (customerRiskRating === "HR") {
            setLoading(false);
            navigation.push(BANKINGV2_MODULE, {
                screen: LA_ADDITIONAL,
                params: {
                    ...route.params,
                    customerRiskRating,
                },
            });
        } else {
            // Save Form Data in DB before moving to next screen
            await saveLAInput(
                {
                    screenName: LA_CONFIRMATION,
                    formData: {},
                    navParams,
                },
                false
            );

            const encSyncId = await getEncValue(navParams?.syncId ?? "");

            // Loan Application submission API
            // Request object
            const params = {
                stpId: navParams?.stpApplicationId ?? "",
                productCode: navParams?.financingPlan ?? "", //MAXIHOME/MFHS/CMHF - expected values
                unitNo: navParams?.unitNo ?? "",
                syncId: encSyncId,
                employmentPeriodInYear: navParams?.empYears ?? "",
                employmentPeriodInMonth: navParams?.empMonths ?? "",
                financingType: navParams?.financingType ?? "",
                customerRiskRating: customerRiskRating ?? "",
                ccrisLoanCount: navParams?.ccrisLoanCount ?? "",
                unmatchApplForCreditRecord: navParams?.unmatchApplForCreditRecord ?? "",
                occupation: navParams?.occupation ?? "",
                occupationSector: navParams?.occupationSector ?? "",
                employerName: navParams?.employerName ?? "",
                employerPhoneNo: navParams?.employerPhoneNo ?? "",
                sourceOfFund: navParams?.primaryIncome ?? "",
                sourceOfWealth: navParams?.primarySourceOfIncome ?? "",
                privacyNotice: navParams?.radioPNYesChecked ? "Yes" : "No",
                address: [
                    {
                        addressLine1: navParams?.correspondenseAddr1 ?? "",
                        addressLine2: navParams?.correspondenseAddr2 ?? "",
                        addressLine3: navParams?.correspondenseAddr3 ?? "",
                        addressLine4: navParams?.correspondenseCity ?? "",
                        postCode: navParams?.correspondensePostCode ?? "",
                        countryCode: navParams?.correspondenseCountry ?? "",
                        state: navParams?.correspondenseState ?? "",
                    },
                ],
                mailingAddress: {
                    addressLine1: navParams?.mailingAddr1 ?? "",
                    addressLine2: navParams?.mailingAddr2 ?? "",
                    addressLine3: navParams?.mailingAddr3 ?? "",
                    addressLine4: navParams?.mailingCity ?? "",
                    postCode: navParams?.mailingPostCode ?? "",
                    countryCode: navParams?.mailingCountry ?? "",
                    state: navParams?.mailingState ?? "",
                },
                empAddress: {
                    addressLine1: navParams?.employerAddr1 ?? "",
                    addressLine2: navParams?.employerAddr2 ?? "",
                    addressLine3: navParams?.employerAddr3 ?? "",
                    addressLine4: navParams?.employerCity ?? "",
                    postCode: navParams?.employerPostCode ?? "",
                    countryCode: navParams?.employerCountry ?? "",
                    state: navParams?.employerState ?? "",
                },
            };

            // call to final loan submission
            const {
                success,
                errorMessage,
                stpId,
                eligibilityResult,
                overallStatus,
                baseRateLabel,
            } = await loanSubmissionRequest(params, false);

            if (!success) {
                setLoading(false);
                showErrorToast({
                    message: errorMessage || COMMON_ERROR_MSG,
                });
                return;
            }
            const responseData = await fetchGetApplicants(encSyncId, false);

            if (!responseData?.success) {
                setLoading(false);
                // Show error message
                showErrorToast({ message: responseData?.errorMessage });
                return;
            }

            const { jointApplicantDetails, currentUser } = responseData;

            // Navigate to Loan Application result screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_RESULT,
                params: {
                    ...navParams,
                    stpApplicationId: stpId,
                    eligibilityResult,
                    eligibilityStatus: overallStatus,
                    baseRateLabel,
                    jointApplicantDetails,
                    currentUser,
                },
            });

            setLoading(false);

            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: FA_PROPERTY_APPLY_CONFIRMATION,
            });
        }
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_APPLY_CONFIRMATION}
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
                        {/* Eligibility details */}
                        <SummaryContainer
                            headerText={ELIGIBILITY_DETAILS}
                            data={eligibilityData}
                            style={Style.summaryContCls}
                        />
                        {/* Property details */}
                        {propertyData.length > 0 && (
                            <SummaryContainer
                                headerText={PROPERTY_DETAILS}
                                data={propertyData}
                                sectionEdit
                                style={Style.summaryContCls}
                                editPress={onPropertyDetailsEdit}
                            />
                        )}
                        {/* Personal details */}
                        <SummaryContainer
                            headerText={PERSONAL_DETAILS_TEXT}
                            data={personalData}
                            sectionEdit
                            style={Style.summaryContCls}
                            editPress={onPersonalDetailsEdit}
                        />
                        {/* Employment details */}
                        {empData.length > 0 && (
                            <SummaryContainer
                                headerText={EMPLOYMENT_DETAILS_TEXT}
                                data={empData}
                                sectionEdit
                                style={Style.summaryContCls}
                                editPress={onEmpDetailsEdit}
                            />
                        )}
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
                        {/* Product details */}
                        {financingData.length > 0 && (
                            <SummaryContainer
                                headerText={PRODUCT_DETAILS}
                                data={financingData}
                                sectionEdit
                                style={Style.summaryContCls}
                                editPress={onProductDetailsEdit}
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
                                    <Typo lineHeight={18} fontWeight="600" text={CONFIRM_SUBMIT} />
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
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
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
        </>
    );
}

LAConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: (paddingBottomVal) => ({
        marginVertical: 30,
        paddingBottom: paddingBottomVal,
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

export default LAConfirmation;

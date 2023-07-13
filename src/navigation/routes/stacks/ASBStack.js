import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import AddAdditionalIncome from "@screens/ASB/Financing/AddAdditionalIncome";
import AdditionalDetailsIncome from "@screens/ASB/Financing/AdditionalDetailsIncome";
import AdditionalMonthlyIncome from "@screens/ASB/Financing/AdditionalMonthlyIncome";
import ApplicantAuthorization from "@screens/ASB/Financing/ApplicantAuthorization";
import ApplicationConfirmAuthScreen from "@screens/ASB/Financing/ApplicationConfirmAndAuth";
import ApplicationConfirmation from "@screens/ASB/Financing/ApplicationConfirmationScreen";
import ApplicationFinanceDetails from "@screens/ASB/Financing/ApplicationFinanceDetails";
import ApplicationFinancingSuccessful from "@screens/ASB/Financing/ApplicationFinancingSuccessful";
import ApplicationUnsuccessfulScreen from "@screens/ASB/Financing/ApplicationUnsuccessful";
import ApprovedFinanceDetails from "@screens/ASB/Financing/ApprovedFinanceDetails";
import AsbFixedAccount from "@screens/ASB/Financing/AsbFixedAccount";
import BankOfficer from "@screens/ASB/Financing/BankOfficer";
import ASBConsentScreen from "@screens/ASB/Financing/Consent";
import CurrentLocation from "@screens/ASB/Financing/CurrentLocation";
import ASBDeclaration from "@screens/ASB/Financing/Declaration";
import EligibilitySoftFailScreen from "@screens/ASB/Financing/EligibilitySoftFail";
import ExploreFunds from "@screens/ASB/Financing/ExploreFunds";
import FatcaDeclaration from "@screens/ASB/Financing/FatcaDeclaration";
import GuarantorAdditionalDetailsIncome from "@screens/ASB/Financing/Guarantor/GuarantorAdditionalDetailsIncome";
import GuarantorAdditionalIncome from "@screens/ASB/Financing/Guarantor/GuarantorAdditionalIncome";
import GuarantorConsent from "@screens/ASB/Financing/Guarantor/GuarantorConsent";
import GuarantorDeclaration from "@screens/ASB/Financing/Guarantor/GuarantorDeclaration";
import GuarantorEmploymentDetails from "@screens/ASB/Financing/Guarantor/GuarantorEmploymentDetails";
import GuarantorEmploymentDetails2 from "@screens/ASB/Financing/Guarantor/GuarantorEmploymentDetails2";
import GuarantorFatcaDeclaration from "@screens/ASB/Financing/Guarantor/GuarantorFatcaDeclaration";
import GuarantorIdentityDetails from "@screens/ASB/Financing/Guarantor/GuarantorIdentityDetails";
import GuarantorIncomeDetails from "@screens/ASB/Financing/Guarantor/GuarantorIncomeDetails";
import GuarantorPersonalInformation from "@screens/ASB/Financing/Guarantor/GuarantorPersonalInformation";
import GuarantorSuccess from "@screens/ASB/Financing/Guarantor/GuarantorSuccess";
import GuarantorValidation from "@screens/ASB/Financing/Guarantor/GuarantorValidation";
import DocumentViewer from "@screens/ASB/Financing/KYC/DocumentViewer";
import JointApplicantScreen from "@screens/ASB/Financing/KYC/JointApplicantScreen";
import ApplicantSingle from "@screens/ASB/Financing/KYC/Single/ApplicantSingle";
import OtherApplicantSingle from "@screens/ASB/Financing/KYC/Single/OtherApplicantSingle";
import NonIetApplicationFinancingSuccessful from "@screens/ASB/Financing/NonIetApplicationFinancingSuccessful";
import NonIetApplicationUnsuccessfulScreen from "@screens/ASB/Financing/NonIetApplicationUnsuccessful";
import OccupationInformation from "@screens/ASB/Financing/OccupationInformation";
import OccupationInformation2 from "@screens/ASB/Financing/OccupationInformation2";
import PersonalInformation from "@screens/ASB/Financing/PersonalInformation";
import ReceivedDocumentScreen from "@screens/ASB/Financing/ReceivedDocument";
import SelectAccount from "@screens/ASB/Financing/SelectAccount";
import UnableToOfferScreen from "@screens/ASB/Financing/UnableToOffer";
import ApplyLoansScreen from "@screens/ApplyLoans";
import ViewBreakDownScreen from "@screens/ApplyLoans/ViewBreakDown";
import ArticleScreen from "@screens/ApplyLoans/article";
import ArticleDetailsScreen from "@screens/ApplyLoans/articleDetails";

import {
    ASB_GUARANTOR_IDENTITY_DETAILS,
    ASB_GUARANTOR_CONSENT,
    ASB_GUARANTOR_SUCCESS,
    ASB_GUARANTOR_INCOME_DETAILS,
    ASB_GUARANTOR_DECLARATION,
    ASB_GUARANTOR_ADDITIONAL_INCOME,
    ASB_GUARANTOR_VALIDATION,
    ASB_GUARANTOR_PERSONAL_INFORMATION,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS_2,
    ASB_GUARANTOR_FATCA_DECLARATION,
    ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME,
    APPLY_LOANS,
} from "@navigation/navigationConstant";

import { useModelController } from "@context";

const Stack = createStackNavigator();

export default function ASBStack() {
    return (
        <Stack.Navigator
            initialRouteName={APPLY_LOANS}
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="ASBDeclaration" component={ASBDeclaration} />
            <Stack.Screen
                name={ASB_GUARANTOR_IDENTITY_DETAILS}
                component={GuarantorIdentityDetails}
            />
            <Stack.Screen name={ASB_GUARANTOR_CONSENT} component={GuarantorConsent} />
            <Stack.Screen name={ASB_GUARANTOR_SUCCESS} component={GuarantorSuccess} />
            <Stack.Screen name={ASB_GUARANTOR_INCOME_DETAILS} component={GuarantorIncomeDetails} />
            <Stack.Screen name={ASB_GUARANTOR_DECLARATION} component={GuarantorDeclaration} />
            <Stack.Screen
                name={ASB_GUARANTOR_ADDITIONAL_INCOME}
                component={GuarantorAdditionalIncome}
            />
            <Stack.Screen name={ASB_GUARANTOR_VALIDATION} component={GuarantorValidation} />
            <Stack.Screen
                name={ASB_GUARANTOR_PERSONAL_INFORMATION}
                component={GuarantorPersonalInformation}
            />
            <Stack.Screen
                name={ASB_GUARANTOR_EMPLOYMENT_DETAILS}
                component={GuarantorEmploymentDetails}
            />
            <Stack.Screen
                name={ASB_GUARANTOR_EMPLOYMENT_DETAILS_2}
                component={GuarantorEmploymentDetails2}
            />
            <Stack.Screen
                name={ASB_GUARANTOR_FATCA_DECLARATION}
                component={GuarantorFatcaDeclaration}
            />
            <Stack.Screen
                name={ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME}
                component={GuarantorAdditionalDetailsIncome}
            />
            <Stack.Screen name="OtherApplicantSingle" component={OtherApplicantSingle} />
            <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
            <Stack.Screen name="JointApplicant" component={JointApplicantScreen} />
            <Stack.Screen name="ApplicantSingle" component={ApplicantSingle} />
            <Stack.Screen name="ArticleDetails" component={ArticleDetailsScreen} />
            <Stack.Screen name="ApplicationConfirmAuth" component={ApplicationConfirmAuthScreen} />
            <Stack.Screen name="EligibilitySoftFail" component={EligibilitySoftFailScreen} />
            <Stack.Screen name="UnableToOffer" component={UnableToOfferScreen} />
            <Stack.Screen
                name="ApplicationUnsuccessful"
                component={ApplicationUnsuccessfulScreen}
            />
            <Stack.Screen
                name="NonIetApplicationUnsuccessful"
                component={NonIetApplicationUnsuccessfulScreen}
            />
            <Stack.Screen name="ReceivedDocument" component={ReceivedDocumentScreen} />
            <Stack.Screen name="SelectAccount" component={SelectAccount} />
            <Stack.Screen name="ApplicationFinanceDetails" component={ApplicationFinanceDetails} />
            <Stack.Screen name="FatcaDeclaration" component={FatcaDeclaration} />
            <Stack.Screen
                name="ApplicationFinancingSuccessful"
                component={ApplicationFinancingSuccessful}
            />
            <Stack.Screen
                name="NonIetApplicationFinancingSuccessful"
                component={NonIetApplicationFinancingSuccessful}
            />
            <Stack.Screen name="ASBConsentScreen" component={ASBConsentScreen} />
            <Stack.Screen name="AddAdditionalIncome" component={AddAdditionalIncome} />
            <Stack.Screen name="AdditionalMonthlyIncome" component={AdditionalMonthlyIncome} />
            <Stack.Screen name="ExploreFunds" component={ExploreFunds} />
            <Stack.Screen name="CurrentLocation" component={CurrentLocation} />
            <Stack.Screen name="BankOfficer" component={BankOfficer} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformation} />
            <Stack.Screen name="OccupationInformation" component={OccupationInformation} />
            <Stack.Screen name="OccupationInformation2" component={OccupationInformation2} />
            <Stack.Screen name="ApplicationConfirmation" component={ApplicationConfirmation} />
            <Stack.Screen name="AsbFixedAccount" component={AsbFixedAccount} />
            <Stack.Screen name="ApprovedFinanceDetails" component={ApprovedFinanceDetails} />
            <Stack.Screen name="AdditionalDetailsIncome" component={AdditionalDetailsIncome} />
            <Stack.Screen name="ApplicantAuthorization" component={ApplicantAuthorization} />
            <Stack.Screen name="ApplyLoans" component={ApplyLoansScreen} />
            <Stack.Screen name="ViewBreakDown" component={ViewBreakDownScreen} />
            <Stack.Screen name="Article" component={ArticleScreen} />
        </Stack.Navigator>
    );
}

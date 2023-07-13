import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import M2UOnlineRegistration from "@screens/Premier/Components/M2UOnlineRegistration";
import KawankuSavingsIntroScreen from "@screens/Premier/KawankuSavingsIntroScreen";
import KawankuSavingsIIntroScreen from "@screens/Premier/KawankuSavingsIIntroScreen";
import PM1IntroScreen from "@screens/Premier/PM1IntroScreen";
import PMAIntroScreen from "@screens/Premier/PMAIntroScreen";
import PremierAccountDetails from "@screens/Premier/PremierAccountDetails";
import PremierAccountNotFound from "@screens/Premier/PremierAccountNotFound";
import PremierActivateAccount from "@screens/Premier/PremierActivateAccount";
import PremierActivateAccountIdentityDetails from "@screens/Premier/PremierActivateAccountIdentityDetails";
import PremierActivationChoice from "@screens/Premier/PremierActivationChoice";
import PremierActivationFailure from "@screens/Premier/PremierActivationFailure";
import PremierActivationPending from "@screens/Premier/PremierActivationPending";
import PremierActivationSuccess from "@screens/Premier/PremierActivationSuccess";
import PremierAdditionalDetails from "@screens/Premier/PremierAdditionalDetails";
import PremierConfirmation from "@screens/Premier/PremierConfirmation";
import PremierDeclaration from "@screens/Premier/PremierDeclaration";
import PremierEditCASATransferAmount from "@screens/Premier/PremierEditCASATransferAmount";
import PremierEmploymentDetails from "@screens/Premier/PremierEmploymentDetails";
import PremierIdentityDetails from "@screens/Premier/PremierIdentityDetails";
import PremierLoginEntry from "@screens/Premier/PremierLoginEntry";
import PremierM2USuccess from "@screens/Premier/PremierM2USuccess";
import PremierOtpVerification from "@screens/Premier/PremierOtpVerification";
import PremierPersonalDetails from "@screens/Premier/PremierPersonalDetails";
import PremierResidentialDetails from "@screens/Premier/PremierResidentialDetails";
import PremierSelectCASA from "@screens/Premier/PremierSelectCASA";
import PremierSelectFPXBank from "@screens/Premier/PremierSelectFPXBank";
import PremierSuccessMyKad from "@screens/Premier/PremierSuccessMyKad";
import PremierSuccessPassport from "@screens/Premier/PremierSuccessPassport";
import PremierSuitabilityAssessment from "@screens/Premier/PremierSuitabilityAssessment";

import {
    PM1_INTRO_SCREEN,
    PMA_INTRO_SCREEN,
    PREMIER_IDENTITY_DETAILS,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_RESIDENTIAL_DETAILS,
    PREMIER_EMPLOYMENT_DETAILS,
    PREMIER_ACCOUNT_DETAILS,
    PREMIER_ADDITIONAL_DETAILS,
    PREMIER_DECLARATION,
    PREMIER_CONFIRMATION,
    PREMIER_SUITABILITY_ASSESSMENT,
    PREMIER_OTP_VERIFICATION,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_SELECT_FPX_BANK,
    PREMIER_SELECT_CASA,
    PREMIER_LOGIN_ENTRY,
    PREMIER_EDIT_CASA_TRANSFER_AMOUNT,
    PREMIER_ACTIVATION_PENDING,
    PREMIER_ACCOUNT_NOT_FOUND,
    PREMIER_SUCCESS_MYKAD,
    PREMIER_SUCCESS_PASSPORT,
    PREMIER_ACTIVATION_CHOICE,
    PREMIER_ACTIVATION_SUCCESS,
    PREMIER_ACTIVATION_FAILURE,
    PREMIER_M2U_REGISTRATION,
    PREMIER_M2U_SUCCESS,
    PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS,
    KAWANKU_SAVINGS_INTRO_SCREEN,
    KAWANKU_SAVINGSI_INTRO_SCREEN
} from "@navigation/navigationConstant";

const Stack = createStackNavigator();

export default function PremierModuleStack () {
    return (
        <Stack.Navigator
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name={PM1_INTRO_SCREEN} component={PM1IntroScreen} />
            <Stack.Screen name={PMA_INTRO_SCREEN} component={PMAIntroScreen} />
            <Stack.Screen name={PREMIER_IDENTITY_DETAILS} component={PremierIdentityDetails} />
            <Stack.Screen
                name={PREMIER_SUITABILITY_ASSESSMENT}
                component={PremierSuitabilityAssessment}
            />
            <Stack.Screen name={PREMIER_PERSONAL_DETAILS} component={PremierPersonalDetails} />
            <Stack.Screen
                name={PREMIER_RESIDENTIAL_DETAILS}
                component={PremierResidentialDetails}
            />
            <Stack.Screen name={PREMIER_EMPLOYMENT_DETAILS} component={PremierEmploymentDetails} />
            <Stack.Screen name={PREMIER_ACCOUNT_DETAILS} component={PremierAccountDetails} />
            <Stack.Screen name={PREMIER_ADDITIONAL_DETAILS} component={PremierAdditionalDetails} />
            <Stack.Screen name={PREMIER_DECLARATION} component={PremierDeclaration} />
            <Stack.Screen name={PREMIER_CONFIRMATION} component={PremierConfirmation} />
            <Stack.Screen name={PREMIER_LOGIN_ENTRY} component={PremierLoginEntry} />
            <Stack.Screen name={PREMIER_SELECT_CASA} component={PremierSelectCASA} />
            <Stack.Screen name={PREMIER_SELECT_FPX_BANK} component={PremierSelectFPXBank} />
            <Stack.Screen name={PREMIER_ACTIVATION_PENDING} component={PremierActivationPending} />
            <Stack.Screen name={PREMIER_ACCOUNT_NOT_FOUND} component={PremierAccountNotFound} />
            <Stack.Screen
                name={PREMIER_EDIT_CASA_TRANSFER_AMOUNT}
                component={PremierEditCASATransferAmount}
            />
            <Stack.Screen name={PREMIER_SUCCESS_MYKAD} component={PremierSuccessMyKad} />
            <Stack.Screen name={PREMIER_SUCCESS_PASSPORT} component={PremierSuccessPassport} />
            <Stack.Screen name={PREMIER_ACTIVATION_CHOICE} component={PremierActivationChoice} />
            <Stack.Screen name={PREMIER_M2U_SUCCESS} component={PremierM2USuccess} />
            <Stack.Screen name={PREMIER_OTP_VERIFICATION} component={PremierOtpVerification} />
            <Stack.Screen name={PREMIER_ACTIVATE_ACCOUNT} component={PremierActivateAccount} />
            <Stack.Screen name={PREMIER_M2U_REGISTRATION} component={M2UOnlineRegistration} />
            <Stack.Screen
                name={PREMIER_ACTIVATE_ACCOUNT_IDENTITY_DETAILS}
                component={PremierActivateAccountIdentityDetails}
            />
            <Stack.Screen name={PREMIER_ACTIVATION_SUCCESS} component={PremierActivationSuccess} />
            <Stack.Screen name={PREMIER_ACTIVATION_FAILURE} component={PremierActivationFailure} />
            <Stack.Screen
                name={KAWANKU_SAVINGS_INTRO_SCREEN}
                component={KawankuSavingsIntroScreen}
            />
            <Stack.Screen
                name={KAWANKU_SAVINGSI_INTRO_SCREEN}
                component={KawankuSavingsIIntroScreen}
            />
        </Stack.Navigator>
    );
}

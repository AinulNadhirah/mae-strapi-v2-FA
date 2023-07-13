import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import {
    ZEST_CASA_ENTRY,
    ZEST_CASA_ACCOUNT_DETAILS,
    ZEST_CASA_EMPLOYMENT_DETAILS,
    ZEST_CASA_IDENTITY_DETAILS,
    ZEST_CASA_PERSONAL_DETAILS,
    ZEST_CASA_RESIDENTIAL_DETAILS,
    ZEST_CASA_DECLARATION,
    ZEST_CASA_CONFIRMATION,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_SELECT_DEBIT_CARD,
    ZEST_CASA_ACTIVATE_ACCOUNT,
    ZEST_CASA_ACTIVATION_CHOICE,
    ZEST_CASA_BRANCH_ACTIVATION,
    ZEST_CASA_KYC_ENTRY,
    ZEST_CASA_SUCCESS,
    ZEST_CASA_FAILURE,
    ZEST_CASA_ADDITIONAL_DETAILS,
    ZEST_CASA_SELECT_FPX_BANK,
    ZEST_CASA_SELECT_CASA,
    ZEST_CASA_LOGIN_ENTRY,
    ZEST_CASA_EDIT_CASA_TRANSFER_AMOUNT,
    ZEST_CASA_ACTIVATION_PENDING,
    ZEST_CASA_ACCOUNT_NOT_FOUND,
    ZEST_CASA_ACTIVATE_ACCOUNT_IDENTITY_DETAILS,
    ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
    ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT,
    ZEST_CASA_DEBIT_CARD_ENTER_PIN,
    ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN,
    ZEST_DEBIT_CARD_LAST_8_DIGIT,
    ZEST_CASA_CREATE_ACCOUNT_SUCCESS,
} from "@navigation/navigationConstant";

import { useModelController } from "@context";

function ZestCasaEntry(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAEntry").default;
    return <Screen {...props} />;
}

function ZestCASAIdentityDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAIdentityDetails").default;
    return <Screen {...props} />;
}

function ZestCASAPersonalDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAPersonalDetails").default;
    return <Screen {...props} />;
}

function ZestCASAResidentialDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAResidentialDetails").default;
    return <Screen {...props} />;
}

function ZestCASAEmploymentDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAEmploymentDetails").default;
    return <Screen {...props} />;
}

function ZestCASAAccountDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAAccountDetails").default;
    return <Screen {...props} />;
}

function ZestCASADeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASADeclaration").default;
    return <Screen {...props} />;
}

function ZestCASAConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAConfirmation").default;
    return <Screen {...props} />;
}

function ZestCASASuitabilityAssessment(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASASuitabilityAssessment").default;
    return <Screen {...props} />;
}

function ZestCASAOtpVerification(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAOtpVerification").default;
    return <Screen {...props} />;
}

function ZestCASASelectDebitCard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASASelectDebitCard").default;
    return <Screen {...props} />;
}

function ZestCASAActivationChoice(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAActivationChoice").default;
    return <Screen {...props} />;
}

function ZestCASAKYCEntry(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAKYCEntry").default;
    return <Screen {...props} />;
}

function ZestCASABranchActivation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASABranchActivation").default;
    return <Screen {...props} />;
}

function ZestCASAActivateAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAActivateAccount").default;
    return <Screen {...props} />;
}

function ZestCASASuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASASuccess").default;
    return <Screen {...props} />;
}

function ZestCASAFailure(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAFailure").default;
    return <Screen {...props} />;
}

function ZestCASAAdditionalDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAAdditionalDetails").default;
    return <Screen {...props} />;
}

function ZestCASASelectFPXBank(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASASelectFPXBank").default;
    return <Screen {...props} />;
}

function ZestCASASelectCASA(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASASelectCASA").default;
    return <Screen {...props} />;
}

function ZestCASALoginEntry(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASALoginEntry").default;
    return <Screen {...props} />;
}

function ZestCASAEditCASATransferAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAEditCASATransferAmount").default;
    return <Screen {...props} />;
}

function ZestCASAActivationPending(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAActivationPending").default;
    return <Screen {...props} />;
}

function ZestCASAAccountNotFound(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAAccountNotFound").default;
    return <Screen {...props} />;
}

function ZestCASAActivateAccountIdentityDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASAActivateAccountIdentityDetails").default;
    return <Screen {...props} />;
}

function ZestCASADebitCardResidentailDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASADebitCardResidentailDetails").default;
    return <Screen {...props} />;
}

function DebitCardZestCASASelectAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/DebitCardZestCASASelectAccount").default;
    return <Screen {...props} />;
}

function ZestDebitCardPin(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestDebitCardPin").default;
    return <Screen {...props} />;
}

function ZestDebitCardVerifyPin(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestDebitCardVerifyPin").default;
    return <Screen {...props} />;
}

function ZestDebitCardLast8Digit(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestDebitCardLast8Digit").default;
    return <Screen {...props} />;
}

function ZestCASACreateAccountSuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZestCASA/ZestCASACreateAccountSuccess").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function ZestCASAStack() {
    return (
        <Stack.Navigator
            initialRouteName={ZEST_CASA_ENTRY}
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name={ZEST_CASA_ENTRY} component={ZestCasaEntry} />
            <Stack.Screen name={ZEST_CASA_IDENTITY_DETAILS} component={ZestCASAIdentityDetails} />
            <Stack.Screen name={ZEST_CASA_PERSONAL_DETAILS} component={ZestCASAPersonalDetails} />
            <Stack.Screen
                name={ZEST_CASA_RESIDENTIAL_DETAILS}
                component={ZestCASAResidentialDetails}
            />
            <Stack.Screen
                name={ZEST_CASA_EMPLOYMENT_DETAILS}
                component={ZestCASAEmploymentDetails}
            />
            <Stack.Screen name={ZEST_CASA_ACCOUNT_DETAILS} component={ZestCASAAccountDetails} />
            <Stack.Screen name={ZEST_CASA_DECLARATION} component={ZestCASADeclaration} />
            <Stack.Screen name={ZEST_CASA_CONFIRMATION} component={ZestCASAConfirmation} />
            <Stack.Screen
                name={ZEST_CASA_SUITABILITY_ASSESSMENT}
                component={ZestCASASuitabilityAssessment}
            />
            <Stack.Screen name={ZEST_CASA_OTP_VERIFICATION} component={ZestCASAOtpVerification} />
            <Stack.Screen name={ZEST_CASA_SELECT_DEBIT_CARD} component={ZestCASASelectDebitCard} />
            <Stack.Screen name={ZEST_CASA_ACTIVATE_ACCOUNT} component={ZestCASAActivateAccount} />
            <Stack.Screen name={ZEST_CASA_ACTIVATION_CHOICE} component={ZestCASAActivationChoice} />
            <Stack.Screen name={ZEST_CASA_BRANCH_ACTIVATION} component={ZestCASABranchActivation} />
            <Stack.Screen name={ZEST_CASA_KYC_ENTRY} component={ZestCASAKYCEntry} />
            <Stack.Screen name={ZEST_CASA_SUCCESS} component={ZestCASASuccess} />
            <Stack.Screen name={ZEST_CASA_FAILURE} component={ZestCASAFailure} />
            <Stack.Screen
                name={ZEST_CASA_ADDITIONAL_DETAILS}
                component={ZestCASAAdditionalDetails}
            />
            <Stack.Screen name={ZEST_CASA_SELECT_FPX_BANK} component={ZestCASASelectFPXBank} />
            <Stack.Screen name={ZEST_CASA_SELECT_CASA} component={ZestCASASelectCASA} />
            <Stack.Screen name={ZEST_CASA_LOGIN_ENTRY} component={ZestCASALoginEntry} />
            <Stack.Screen
                name={ZEST_CASA_EDIT_CASA_TRANSFER_AMOUNT}
                component={ZestCASAEditCASATransferAmount}
            />
            <Stack.Screen
                name={ZEST_CASA_ACTIVATION_PENDING}
                component={ZestCASAActivationPending}
            />
            <Stack.Screen name={ZEST_CASA_ACCOUNT_NOT_FOUND} component={ZestCASAAccountNotFound} />
            <Stack.Screen
                name={ZEST_CASA_ACTIVATE_ACCOUNT_IDENTITY_DETAILS}
                component={ZestCASAActivateAccountIdentityDetails}
            />
            <Stack.Screen
                name={ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS}
                component={ZestCASADebitCardResidentailDetails}
            />
            <Stack.Screen
                name={ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT}
                component={DebitCardZestCASASelectAccount}
            />
            <Stack.Screen name={ZEST_CASA_DEBIT_CARD_ENTER_PIN} component={ZestDebitCardPin} />
            <Stack.Screen
                name={ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN}
                component={ZestDebitCardVerifyPin}
            />
            <Stack.Screen name={ZEST_DEBIT_CARD_LAST_8_DIGIT} component={ZestDebitCardLast8Digit} />
            <Stack.Screen
                name={ZEST_CASA_CREATE_ACCOUNT_SUCCESS}
                component={ZestCASACreateAccountSuccess}
            />
        </Stack.Navigator>
    );
}

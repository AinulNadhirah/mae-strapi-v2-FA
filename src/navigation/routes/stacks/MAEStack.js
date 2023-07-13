import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import MAEApplicationProgress from "@screens/MAE/Onboarding/MAEApplicationProgress";

import { useModelController } from "@context";

function ApplyDashboardTab(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/ApplyDashboardTab").default;
    return <Screen {...props} />;
}

function AccountsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/AccountsScreen").default;
    return <Screen {...props} />;
}

function ApplyMAEScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/ApplyMAEScreen").default;
    return <Screen {...props} />;
}

function CaptureDocumentScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CaptureDocumentScreen").default;
    return <Screen {...props} />;
}

function MAENameVerification(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAENameVerification").default;
    return <Screen {...props} />;
}

function ScanKYCScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/ScanKYCScreen").default;
    return <Screen {...props} />;
}

function CaptureSelfieScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/CaptureSelfieScreen").default;
    return <Screen {...props} />;
}

function MAEIntroductionScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEIntroductionScreen").default;
    return <Screen {...props} />;
}

function MAEHuaweiScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEHuaweiScreen").default;
    return <Screen {...props} />;
}

function MAEOnboardDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardDetails").default;
    return <Screen {...props} />;
}

function MAEOnboardDetails2(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardDetails2").default;
    return <Screen {...props} />;
}

function MAEOnboardDetails3(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardDetails3").default;
    return <Screen {...props} />;
}

function MAEOnboardEmploymentDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardEmploymentDetails").default;
    return <Screen {...props} />;
}

function MAEOnboardDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardDeclaration").default;
    return <Screen {...props} />;
}

function MAEOnboardDetails4(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAEOnboardDetails4").default;
    return <Screen {...props} />;
}

function MAETnC(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/MAETnC").default;
    return <Screen {...props} />;
}

function MAEOTPConformation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/MAEOTPConformation").default;
    return <Screen {...props} />;
}

function MAEM2UUsername(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/MAEM2UUsername").default;
    return <Screen {...props} />;
}

function MAEM2UPassword(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/MAEM2UPassword").default;
    return <Screen {...props} />;
}

function UploadSecurityImage(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/UploadSecurityImage").default;
    return <Screen {...props} />;
}

function VirtualCardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/VirtualCardScreen").default;
    return <Screen {...props} />;
}

function SecurityPhaseScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/SecurityPhaseScreen").default;
    return <Screen {...props} />;
}

function SecurityQuestions(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/SecurityQuestions").default;
    return <Screen {...props} />;
}

function InviteCode(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Onboarding/InviteCode").default;
    return <Screen {...props} />;
}

function MAEResume(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEResume").default;
    return <Screen {...props} />;
}

function MAESignup(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAESignup").default;
    return <Screen {...props} />;
}

function MAEGoToAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEGoToAccount").default;
    return <Screen {...props} />;
}

function MAESuccessfulScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAESuccessfulScreen").default;
    return <Screen {...props} />;
}

function MAESuccessfulScreen2(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAESuccessfulScreen2").default;
    return <Screen {...props} />;
}

function MAEInAppBrowser(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEInAppBrowser").default;
    return <Screen {...props} />;
}

function MAEReupload(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEReupload").default;
    return <Screen {...props} />;
}

function MAEReuploadSuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEReuploadSuccess").default;
    return <Screen {...props} />;
}

function MAEAddressEntryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEAddressEntryScreen").default;
    return <Screen {...props} />;
}

function MAEResumeSuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/MAE/Resume/MAEResumeSuccess").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function MaeStack() {
    return (
        <Stack.Navigator initialRouteName="ApplyDashboardTab" headerMode="none">
            <Stack.Screen name="ApplyDashboardTab" component={ApplyDashboardTab} />
            <Stack.Screen name="AccountsScreen" component={AccountsScreen} />
            <Stack.Screen name="MAEIntroductionScreen" component={MAEIntroductionScreen} />
            <Stack.Screen name="MAEHuaweiScreen" component={MAEHuaweiScreen} />
            <Stack.Screen name="MAEOnboardDetails" component={MAEOnboardDetails} />
            <Stack.Screen name="MAEOnboardDeclaration" component={MAEOnboardDeclaration} />
            <Stack.Screen name="MAEOnboardDetails2" component={MAEOnboardDetails2} />
            <Stack.Screen name="MAEOnboardDetails3" component={MAEOnboardDetails3} />
            <Stack.Screen
                name="MAEOnboardEmploymentDetails"
                component={MAEOnboardEmploymentDetails}
            />
            <Stack.Screen name="MAEOnboardDetails4" component={MAEOnboardDetails4} />
            <Stack.Screen name="ApplyMAEScreen" component={ApplyMAEScreen} />
            <Stack.Screen name="CaptureDocumentScreen" component={CaptureDocumentScreen} />
            <Stack.Screen name="MAENameVerification" component={MAENameVerification} />
            <Stack.Screen name="CaptureSelfieScreen" component={CaptureSelfieScreen} />
            <Stack.Screen name="MAETnC" component={MAETnC} />
            <Stack.Screen name="MAEOTPConformation" component={MAEOTPConformation} />
            <Stack.Screen name="MAEM2UUsername" component={MAEM2UUsername} />
            <Stack.Screen name="MAEM2UPassword" component={MAEM2UPassword} />
            <Stack.Screen name="UploadSecurityImage" component={UploadSecurityImage} />
            <Stack.Screen name="ScanKYCScreen" component={ScanKYCScreen} />
            <Stack.Screen name="SecurityPhaseScreen" component={SecurityPhaseScreen} />
            <Stack.Screen name="SecurityQuestions" component={SecurityQuestions} />
            <Stack.Screen name="VirtualCardScreen" component={VirtualCardScreen} />
            {/* Resume */}
            <Stack.Screen name="MAEResume" component={MAEResume} />
            <Stack.Screen name="MAESignup" component={MAESignup} />
            <Stack.Screen name="MAEGoToAccount" component={MAEGoToAccount} />
            <Stack.Screen name="MAESuccessfulScreen" component={MAESuccessfulScreen} />
            <Stack.Screen name="MAESuccessfulScreen2" component={MAESuccessfulScreen2} />
            <Stack.Screen name="MAEResumeSuccess" component={MAEResumeSuccess} />
            {/* Reupload */}
            <Stack.Screen name="MAEReupload" component={MAEReupload} />
            <Stack.Screen name="MAEAddressEntryScreen" component={MAEAddressEntryScreen} />
            <Stack.Screen name="MAEReuploadSuccess" component={MAEReuploadSuccess} />
            {/* ETB WO M2U */}
            <Stack.Screen name="MAEInAppBrowser" component={MAEInAppBrowser} />
            <Stack.Screen name="InviteCode" component={InviteCode} />
            <Stack.Screen name="MAEApplicationProgress" component={MAEApplicationProgress} />
        </Stack.Navigator>
    );
}

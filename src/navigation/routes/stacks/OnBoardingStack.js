import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ForgotLoginDetails from "@screens/OnBoarding/ForgotLogin/ForgotLoginDetails";
import ForgotLoginUsername from "@screens/OnBoarding/ForgotLogin/ForgotLoginUsername";
import IntroductionScreen from "@screens/OnBoarding/Introduction/IntroductionScreen";
import OnboardingStartScreen from "@screens/OnBoarding/M2U";
import OnboardingM2uChangePhoneNumberScreen from "@screens/OnBoarding/M2U/ChangePhoneNumber";
import OnboardingM2uAccountsScreen from "@screens/OnBoarding/M2U/ChooseAccount";
import OnboardingM2uConfirmPinScreen from "@screens/OnBoarding/M2U/ConfirmPin";
import OnboardingM2uCreatePinScreen from "@screens/OnBoarding/M2U/CreatePin";
import OnboardingM2uOtpScreen from "@screens/OnBoarding/M2U/Otp";
import OnboardingM2uPasswordScreen from "@screens/OnBoarding/M2U/Password";
import OnboardingM2uPhoneNumberConfirmationScreen from "@screens/OnBoarding/M2U/PhoneNumberConfirmation";
import OnboardingM2uProfileScreen from "@screens/OnBoarding/M2U/Profile";
import OnboardingM2uReferralScreen from "@screens/OnBoarding/M2U/Referral";
import OnboardingM2uSecurityImageScreen from "@screens/OnBoarding/M2U/SecurityImage";
import OnboardingM2uSignUpCampaignScreen from "@screens/OnBoarding/M2U/SignUpCampaign";
import OnboardingM2uSuccessScreen from "@screens/OnBoarding/M2U/Success";
import OnboardingM2uUsernameScreen from "@screens/OnBoarding/M2U/Username";
import OnboardingIntroScreen from "@screens/OnBoarding/OnboardingIntroScreen";

const Stack = createStackNavigator();
const OnboardingIntroStack = createStackNavigator();

export function OnBoardingIntro() {
    return (
        <OnboardingIntroStack.Navigator initialRouteName="OnboardingIntroScreen" headerMode="none">
            <OnboardingIntroStack.Screen
                name="OnboardingIntroScreen"
                component={OnboardingIntroScreen}
            />
        </OnboardingIntroStack.Navigator>
    );
}

export default function OnBoardingStack() {
    return (
        <Stack.Navigator initialRouteName="OnboardingStart" headerMode="none">
            <Stack.Screen name="OnboardingStart" component={OnboardingStartScreen} />
            <Stack.Screen name="OnboardingM2uUsername" component={OnboardingM2uUsernameScreen} />
            <Stack.Screen
                name="OnboardingM2uSecurityImage"
                component={OnboardingM2uSecurityImageScreen}
            />
            <Stack.Screen
                name="OnboardingM2uPassword"
                options={{
                    gestureEnabled: false,
                }}
                component={OnboardingM2uPasswordScreen}
            />
            <Stack.Screen
                name="OnboardingM2uCreatePin"
                options={{
                    gestureEnabled: false,
                }}
                component={OnboardingM2uCreatePinScreen}
            />
            <Stack.Screen
                name="OnboardingM2uConfirmPin"
                component={OnboardingM2uConfirmPinScreen}
            />
            <Stack.Screen
                options={{
                    gestureEnabled: false,
                }}
                name="OnboardingM2uPhoneNumberConfirmation"
                component={OnboardingM2uPhoneNumberConfirmationScreen}
            />
            <Stack.Screen
                name="OnboardingM2uChangePhoneNumber"
                component={OnboardingM2uChangePhoneNumberScreen}
            />
            <Stack.Screen name="OnboardingM2uOtp" component={OnboardingM2uOtpScreen} />
            <Stack.Screen
                name="OnboardingM2uProfile"
                component={OnboardingM2uProfileScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="OnboardingM2uAccounts"
                component={OnboardingM2uAccountsScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="OnboardingM2uReferral"
                component={OnboardingM2uReferralScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="OnboardingM2uSignUpCampaign"
                component={OnboardingM2uSignUpCampaignScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="OnboardingM2uSuccess"
                component={OnboardingM2uSuccessScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="ForgotLoginDetails"
                options={{
                    gestureEnabled: false,
                }}
                component={ForgotLoginDetails}
            />
            <Stack.Screen
                name="ForgotLoginUsername"
                options={{
                    gestureEnabled: false,
                }}
                component={ForgotLoginUsername}
            />
            <Stack.Screen
                name="IntroductionScreen"
                options={{
                    gestureEnabled: false,
                }}
                component={IntroductionScreen}
            />
        </Stack.Navigator>
    );
}

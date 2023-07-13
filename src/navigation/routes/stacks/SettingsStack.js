import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import AboutScreen from "@screens/Settings/About";
import ChangeM2UPasswordScreen from "@screens/Settings/ChangeM2UPassword";
import ChangePinScreen from "@screens/Settings/ChangePin";
import BlockedIDList from "@screens/Settings/DuitNow/BlockedIDList";
import DuitNowAutoDebitDetails from "@screens/Settings/DuitNow/DuitNowAutoDebitDetails";
import DuitNowAutodebitList from "@screens/Settings/DuitNow/DuitNowAutodebitList";
import DuitnowADSwitchAccountConfirmation from "@screens/Settings/DuitNow/DuitnowADSwitchAccountConfirmation";
import DuitnowConfirmationScreen from "@screens/Settings/DuitNow/DuitnowConfirmation";
import DuitnowDashboardScreen from "@screens/Settings/DuitNow/DuitnowDashboard";
import DuitnowDetailsScreen from "@screens/Settings/DuitNow/DuitnowDetails";
import DuitnowFailureScreen from "@screens/Settings/DuitNow/DuitnowFailure";
import DuitnowSelectAccountScreen from "@screens/Settings/DuitNow/DuitnowSelectAccount";
import DuitnowSucessScreen from "@screens/Settings/DuitNow/DuitnowSucess";
import ForgotPinScreen from "@screens/Settings/ForgotPin";
import HelplineScreen from "@screens/Settings/Helpline";
import M2UDeletion from "@screens/Settings/M2UDeletion";
import NotificationsScreen from "@screens/Settings/Notifications";
import PdfScreen from "@screens/Settings/PdfScreen";
import ProfileScreen from "@screens/Settings/Profile";
import ChangePhoneNumberScreen from "@screens/Settings/Profile/ChangePhoneNumber";
import ConfirmPhoneNumberScreen from "@screens/Settings/Profile/ConfirmPhoneNumber";
import OtpScreen from "@screens/Settings/Profile/Otp";
import ProfileCameraScreen from "@screens/Settings/Profile/ProfileCamera";
import ReferralScreen from "@screens/Settings/Profile/Referral";
import ResetPasswordStatus from "@screens/Settings/ResetPasswordStatus";
import AccountConfirm from "@screens/Settings/ZakatDebit/AccountConfirm";
import AccountSelection from "@screens/Settings/ZakatDebit/AccountSelection";
import ZakatAutoDebitCancelled from "@screens/Settings/ZakatDebit/ZakatAutoDebitCancelled";
import ZakatAutoDebitSettings from "@screens/Settings/ZakatDebit/ZakatAutoDebitSettings";
import ZakatBodyConfirm from "@screens/Settings/ZakatDebit/ZakatBodyConfirm";
import ZakatUpdateBody from "@screens/Settings/ZakatDebit/ZakatUpdateBody";
import ZakatUpdateMobile from "@screens/Settings/ZakatDebit/ZakatUpdateMobile";
import ZakatUpdateSuccess from "@screens/Settings/ZakatDebit/ZakatUpdateSuccess";

const Stack = createStackNavigator();

export default function SettingsStack() {
    return (
        <Stack.Navigator initialRouteName="Profile" headerMode="none">
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ProfileCamera" component={ProfileCameraScreen} />
            <Stack.Screen name="ChangePhoneNumber" component={ChangePhoneNumberScreen} />
            <Stack.Screen name="ConfirmPhoneNumber" component={ConfirmPhoneNumberScreen} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="ChangePin" component={ChangePinScreen} />
            <Stack.Screen name="ChangeM2UPassword" component={ChangeM2UPasswordScreen} />
            <Stack.Screen name="DuitnowDashboard" component={DuitnowDashboardScreen} />
            <Stack.Screen name="DuitnowDetails" component={DuitnowDetailsScreen} />
            <Stack.Screen name="DuitnowSelectAccount" component={DuitnowSelectAccountScreen} />
            <Stack.Screen name="DuitnowConfirmation" component={DuitnowConfirmationScreen} />
            <Stack.Screen name="DuitnowSucess" component={DuitnowSucessScreen} />
            <Stack.Screen name="DuitnowFailure" component={DuitnowFailureScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PdfSetting" component={PdfScreen} />
            <Stack.Screen name="Helpline" component={HelplineScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="ForgotPin" component={ForgotPinScreen} />
            <Stack.Screen name="M2UDeletion" component={M2UDeletion} />
            <Stack.Screen name="ResetPasswordStatus" component={ResetPasswordStatus} />
            <Stack.Screen name="ZakatAutoDebitSettings" component={ZakatAutoDebitSettings} />
            <Stack.Screen name="ZakatUpdateMobile" component={ZakatUpdateMobile} />
            <Stack.Screen name="ZakatUpdateBody" component={ZakatUpdateBody} />
            <Stack.Screen name="ZakatBodyConfirm" component={ZakatBodyConfirm} />
            <Stack.Screen name="ZakatAutoDebitCancelled" component={ZakatAutoDebitCancelled} />
            <Stack.Screen name="AccountSelection" component={AccountSelection} />
            <Stack.Screen name="AccountConfirm" component={AccountConfirm} />
            <Stack.Screen name="ZakatUpdateSuccess" component={ZakatUpdateSuccess} />
            <Stack.Screen name="BlockedIDList" component={BlockedIDList} />
            <Stack.Screen name="DuitNowAutodebitList" component={DuitNowAutodebitList} />
            <Stack.Screen name="DuitNowAutoDebitDetails" component={DuitNowAutoDebitDetails} />
            <Stack.Screen
                name="DuitnowADSwitchAccountConfirmation"
                component={DuitnowADSwitchAccountConfirmation}
            />
        </Stack.Navigator>
    );
}

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ForgotPasswordScreen from "@screens/ForgotPassword/ForgotPassword";
import MobileNumberConfirmation from "@screens/ForgotPassword/MobileNumberConfirmation";
import SetPasswordScreen from "@screens/ForgotPassword/SetPassword";
import ForgotPasswordNTB from "@screens/ForgotPassword/ForgotPasswordNTB";
import NTBUserNameScreen from "@screens/ForgotPassword/NTBUserNameScreen";

const Stack = createStackNavigator();

export default function SettingsStack() {
    return (
        <Stack.Navigator initialRouteName="ForgotPassword" headerMode="none">
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="MobileNumberConfirmation" component={MobileNumberConfirmation} />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen name="ForgotPasswordNTB" component={ForgotPasswordNTB} />
            <Stack.Screen name="NTBUserNameScreen" component={NTBUserNameScreen} />
        </Stack.Navigator>
    );
}

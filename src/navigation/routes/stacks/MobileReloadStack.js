import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ReloadSelectTelcoScreen from "@screens/Reload/ReloadSelectTelco";
import ReloadSelectAmountScreen from "@screens/Reload/ReloadSelectAmount";
import ReloadSelectContactScreen from "@screens/Reload/ReloadSelectContact";
import ReloadConfirmationScreen from "@screens/Reload/ReloadConfirmation";
import ReloadStatusScreen from "@screens/Reload/ReloadStatus";
import PDFViewer from "@screens/CommonScreens/PDFViewer";

const Stack = createStackNavigator();

export default function ReloadStack() {
    return (
        <Stack.Navigator initialRouteName="ReloadSelectTelco" headerMode="none">
            <Stack.Screen name="ReloadSelectTelco" component={ReloadSelectTelcoScreen} />
            <Stack.Screen name="ReloadSelectContactScreen" component={ReloadSelectContactScreen} />
            <Stack.Screen name="ReloadSelectAmount" component={ReloadSelectAmountScreen} />
            <Stack.Screen name="ReloadConfirmation" component={ReloadConfirmationScreen} />
            <Stack.Screen name="ReloadStatus" component={ReloadStatusScreen} />
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
        </Stack.Navigator>
    );
}

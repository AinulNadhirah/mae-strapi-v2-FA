import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SavedDashboardScreen from "@screens/Saved/SavedDashboardScreen";
import SavedVouchersScreen from "@screens/Saved/SavedVouchersScreen";
import PromotionDetailsScreen from "@screens/Promotions/PromotionDetailsScreen";

const Stack = createStackNavigator();

export default function SavedStack() {
    return (
        <Stack.Navigator initialRouteName="SavedDashboard" headerMode="none">
            <Stack.Screen name="SavedDashboard" component={SavedDashboardScreen} />
            <Stack.Screen name="SavedVouchers" component={SavedVouchersScreen} />
            <Stack.Screen name="PromotionDetails" component={PromotionDetailsScreen} />
        </Stack.Navigator>
    );
}

import { useFocusEffect } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PropTypes from "prop-types";
import React from "react";

import ArticlesScreen from "@screens/Articles";
import TransactionHistoryScreen from "@screens/Banking/TransactionHistoryScreen";
import HomeScreen from "@screens/Dashboard/Home";
import FinancialGoalsDashboardScreen from "@screens/FinancialGoals/FinancialGoalsDashboardScreen";
import TabungTabScreen from "@screens/Goals/TabungTabScreen";
import LoyaltyCardsScreen from "@screens/Loyalty/LoyaltyCardsScreen";
import MAEDashboardScreen from "@screens/MAE/ApplyDashboardTab";
import NotificationsScreen from "@screens/Notifications";
import SecureTACScreen from "@screens/OneTapAuth/SecureTAC";
import PromotionsScreen from "@screens/Promotions/PromotionsDashboardScreen";
import SettingsScreen from "@screens/Settings";
import MoreScreen from "@screens/TabNav/Menu";
import WalletDashboardScreen from "@screens/Wallet/WalletMainDashboard";

const Stack = createStackNavigator();

export default function HomeStack({ navigation }) {
    /**
     * more stacks has been defined to be unmount on blur in the tab
     * apparently, param didn't get reset upon unmount
     * https://github.com/react-navigation/react-navigation/issues/6915
     * eg navigate('More', { screen: 'TabTabung' }) the screen param will
     * persist as long as its here. So this help to reset the param when
     * the stack got unmounted
     */
    useFocusEffect(
        React.useCallback(() => {
            return () => navigation.setParams({ screen: undefined });
        }, [navigation])
    );

    return (
        <Stack.Navigator initialRouteName="Home" headerMode="none">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Menu" component={MoreScreen} />

            <Stack.Screen name="Wallet" component={WalletDashboardScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="TabungTab" component={TabungTabScreen} />
            <Stack.Screen name="Promotions" component={PromotionsScreen} />
            <Stack.Screen name="Loyalty" component={LoyaltyCardsScreen} />
            <Stack.Screen name="Articles" component={ArticlesScreen} />
            <Stack.Screen name="Apply" component={MAEDashboardScreen} />
            <Stack.Screen name="SecureTAC" component={SecureTACScreen} />
            <Stack.Screen
                name="FinancialGoalsDashboardScreen"
                component={FinancialGoalsDashboardScreen}
            />
        </Stack.Navigator>
    );
}

HomeStack.propTypes = {
    navigation: PropTypes.object,
};

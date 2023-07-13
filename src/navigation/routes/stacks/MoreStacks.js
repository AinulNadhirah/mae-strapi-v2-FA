import { useFocusEffect } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PropTypes from "prop-types";
import React from "react";

import ArticlesScreen from "@screens/Articles";
import TransactionHistoryScreen from "@screens/Banking/TransactionHistoryScreen";
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

export default function MoreStacks({ navigation }) {
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
        <Stack.Navigator initialRouteName="Apply" headerMode="none">
            {/*<Stack.Screen name="Menu" component={MoreScreen} />*/}
            {/* Wallet */}
            <Stack.Screen name="Wallet" component={WalletDashboardScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            {/* Replace the component with actual FnB module later */}
            {/* <Stack.Screen name="Food" component={Food} /> */}
            <Stack.Screen name="TabungTab" component={TabungTabScreen} />
            <Stack.Screen name="Promotions" component={PromotionsScreen} />
            {/* Replace the component with the actual Loyalty screen dashboard */}
            <Stack.Screen name="Loyalty" component={LoyaltyCardsScreen} />
            <Stack.Screen name="Articles" component={ArticlesScreen} />
            {/*<Stack.Screen name="Notifications" component={NotificationsScreen} />*/}
            {/* replace with the actual component */}
            <Stack.Screen name="Apply" component={MAEDashboardScreen} />
            {/*<Stack.Screen name="Settings" component={SettingsScreen} />*/}
            <Stack.Screen name="SecureTAC" component={SecureTACScreen} />
            <Stack.Screen
                name="FinancialGoalsDashboardScreen"
                component={FinancialGoalsDashboardScreen}
            />
        </Stack.Navigator>
    );
}

MoreStacks.propTypes = {
    navigation: PropTypes.object,
};

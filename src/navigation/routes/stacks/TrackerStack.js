import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import CardReceiptsScreen from "@screens/Tracker/CardReceiptsScreen";

import { useModelController } from "@context";

function TrackerDashboardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/TrackerDashboardScreen").default;
    return <Screen {...props} />;
}

function ExpensesDashboardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ExpensesDashboardScreen").default;
    return <Screen {...props} />;
}

function ProductHoldingsDashboardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ProductHoldingsDashboardScreen").default;
    return <Screen {...props} />;
}

function ManageWidgetsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ManageWidgetsScreen").default;
    return <Screen {...props} />;
}

function ExpensesL2Screen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ExpensesL2Screen").default;
    return <Screen {...props} />;
}

function ExpenseDetailScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ExpenseDetailScreen").default;
    return <Screen {...props} />;
}

function ProductDetailScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/ProductDetailScreen").default;
    return <Screen {...props} />;
}

function TotalBalanceDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/TotalBalanceDashboard").default;
    return <Screen {...props} />;
}

function TotalBalanceTransactionsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/TotalBalanceTransactionsScreen").default;
    return <Screen {...props} />;
}

function CashWalletScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/CashWalletScreen").default;
    return <Screen {...props} />;
}

function CashWalletEditScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/CashWalletEditScreen").default;
    return <Screen {...props} />;
}

function CreditCardUtilisationDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/CreditCardUtilisationDashboard").default;
    return <Screen {...props} />;
}

function AddOrEditTransactionScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/AddOrEditTransactionScreen").default;
    return <Screen {...props} />;
}

function EditTransactionCategoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/EditTransactionCategoryScreen").default;
    return <Screen {...props} />;
}

function EditTransactionSubCategoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/EditTransactionSubCategoryScreen").default;
    return <Screen {...props} />;
}

function AddTransactionCustomSubCategoryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Tracker/AddTransactionCustomSubCategoryScreen").default;
    return <Screen {...props} />;
}

const TrackerNavigator = createStackNavigator();

export default function TrackerStack() {
    return (
        <TrackerNavigator.Navigator
            initialRouteName="TrackerDashboardScreen"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <TrackerNavigator.Screen
                name="TrackerDashboardScreen"
                component={TrackerDashboardScreen}
            />
            <TrackerNavigator.Screen
                name="ExpensesDashboardScreen"
                component={ExpensesDashboardScreen}
            />
            <TrackerNavigator.Screen
                name="ProductHoldingsDashboardScreen"
                component={ProductHoldingsDashboardScreen}
            />
            <TrackerNavigator.Screen name="ManageWidgetsScreen" component={ManageWidgetsScreen} />
            <TrackerNavigator.Screen name="ExpensesL2Screen" component={ExpensesL2Screen} />
            <TrackerNavigator.Screen name="ExpenseDetailScreen" component={ExpenseDetailScreen} />
            <TrackerNavigator.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <TrackerNavigator.Screen
                name="TotalBalanceDashboard"
                component={TotalBalanceDashboard}
            />
            <TrackerNavigator.Screen
                name="TotalBalanceTransactionsScreen"
                component={TotalBalanceTransactionsScreen}
            />
            <TrackerNavigator.Screen name="CashWalletScreen" component={CashWalletScreen} />
            <TrackerNavigator.Screen name="CashWalletEditScreen" component={CashWalletEditScreen} />
            <TrackerNavigator.Screen
                name="CreditCardUtilisationDashboard"
                component={CreditCardUtilisationDashboard}
            />
            <TrackerNavigator.Screen
                name="AddOrEditTransactionScreen"
                component={AddOrEditTransactionScreen}
            />
            <TrackerNavigator.Screen
                name="EditTransactionCategoryScreen"
                component={EditTransactionCategoryScreen}
            />
            <TrackerNavigator.Screen
                name="EditTransactionSubCategoryScreen"
                component={EditTransactionSubCategoryScreen}
            />
            <TrackerNavigator.Screen
                name="AddTransactionCustomSubCategoryScreen"
                component={AddTransactionCustomSubCategoryScreen}
            />
            <TrackerNavigator.Screen name="CardReceiptsScreen" component={CardReceiptsScreen} />
        </TrackerNavigator.Navigator>
    );
}

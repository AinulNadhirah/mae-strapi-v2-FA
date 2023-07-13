import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function RequestsDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/SendRequestMoney/RequestsDetailsScreen").default;
    return <Screen {...props} />;
}

function SendRequestMoneyDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/SendRequestMoney/SendRequestMoneyDashboard").default;
    return <Screen {...props} />;
}

function SendRequestMoneyAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/SendRequestMoney/SendRequestMoneyAmount").default;
    return <Screen {...props} />;
}

function TransferConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferConfirmationScreen").default;
    return <Screen {...props} />;
}

function TransferAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/TransferAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function AddToFavouritesScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/Transfer/AddToFavouritesScreen").default;
    return <Screen {...props} />;
}

function GatewayScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@components/Overlays/GatewayScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function SendRequestMoneyStack() {
    return (
        <Stack.Navigator initialRouteName="SendRequestMoneyDashboard" headerMode="none">
            <Stack.Screen
                name="SendRequestMoneyDashboard"
                component={SendRequestMoneyDashboard}
                options={{
                    animationTypeForReplace: "pop",
                }}
            />
            <Stack.Screen name="SendRequestMoneyAmount" component={SendRequestMoneyAmount} />
            <Stack.Screen name="RequestsDetailsScreen" component={RequestsDetailsScreen} />

            <Stack.Screen
                name="TransferConfirmationScreen"
                component={TransferConfirmationScreen}
            />
            <Stack.Screen name="TransferAcknowledgeScreen" component={TransferAcknowledgeScreen} />
            <Stack.Screen name="AddToFavouritesScreen" component={AddToFavouritesScreen} />
            <Stack.Screen name="GatewayScreen" component={GatewayScreen} />
        </Stack.Navigator>
    );
}

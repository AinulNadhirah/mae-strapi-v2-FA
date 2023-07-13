import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function JompayPayeeDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/JomPay/JompayPayeeDetails").default;
    return <Screen {...props} />;
}

function JompayEnterAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/JomPay/JompayEnterAmount").default;
    return <Screen {...props} />;
}

function JompayConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/JomPay/JompayConfirmationScreen").default;
    return <Screen {...props} />;
}

function JompayAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/JomPay/JompayAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function JompayAddFavScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/JomPay/JompayAddFavScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function JomPayStack() {
    return (
        <Stack.Navigator initialRouteName="JompayPayeeDetails" headerMode="none">
            <Stack.Screen name="JompayPayeeDetails" component={JompayPayeeDetails} />
            <Stack.Screen name="JompayEnterAmount" component={JompayEnterAmount} />
            <Stack.Screen name="JompayConfirmationScreen" component={JompayConfirmationScreen} />
            <Stack.Screen name="JompayAcknowledgeScreen" component={JompayAcknowledgeScreen} />
            <Stack.Screen name="JompayAddFavScreen" component={JompayAddFavScreen} />
        </Stack.Navigator>
    );
}

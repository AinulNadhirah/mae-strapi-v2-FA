import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function AmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/TransferAmount/AmountScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function AmountStack() {
    return (
        <Stack.Navigator
            initialRouteName="AmountScreen"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="AmountScreen" component={AmountScreen} />
        </Stack.Navigator>
    );
}

import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function PayCardsAdd(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayCards/PayCardsAdd").default;
    return <Screen {...props} />;
}

function PayCardsSelectAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayCards/PayCardsSelectAmount").default;
    return <Screen {...props} />;
}

function PayCardsEnterAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayCards/PayCardsEnterAmount").default;
    return <Screen {...props} />;
}

function PayCardsConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayCards/PayCardsConfirmationScreen").default;
    return <Screen {...props} />;
}

function PayCardsAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayCards/PayCardsAcknowledgeScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function PayCardStack() {
    return (
        <Stack.Navigator initialRouteName="PayCardsSelectAmount" headerMode="none">
            <Stack.Screen name="PayCardsAdd" component={PayCardsAdd} />
            <Stack.Screen name="PayCardsSelectAmount" component={PayCardsSelectAmount} />
            <Stack.Screen name="PayCardsEnterAmount" component={PayCardsEnterAmount} />
            <Stack.Screen
                name="PayCardsConfirmationScreen"
                component={PayCardsConfirmationScreen}
            />
            <Stack.Screen name="PayCardsAcknowledgeScreen" component={PayCardsAcknowledgeScreen} />
        </Stack.Navigator>
    );
}

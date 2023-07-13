import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function LoyaltyCardsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyCardsScreen").default;
    return <Screen {...props} />;
}

function LoyaltyAddCardForm(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyAddCardForm").default;
    return <Screen {...props} />;
}

function LoyaltyCardConfirm(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyCardConfirm").default;
    return <Screen {...props} />;
}

function LoyaltyScanCard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyScanCard").default;
    return <Screen {...props} />;
}

function LoyaltyCardPhoto(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyCardPhoto").default;
    return <Screen {...props} />;
}

function LoyaltyColours(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Loyalty/LoyaltyColours").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function LoyaltyStack() {
    return (
        <Stack.Navigator initialRouteName="LoyaltyCardsScreen" headerMode="none">
            <Stack.Screen name="LoyaltyCardsScreen" component={LoyaltyCardsScreen} />
            <Stack.Screen name="LoyaltyAddCardForm" component={LoyaltyAddCardForm} />
            <Stack.Screen name="LoyaltyCardConfirm" component={LoyaltyCardConfirm} />
            <Stack.Screen name="LoyaltyScanCard" component={LoyaltyScanCard} />
            <Stack.Screen name="LoyaltyCardPhoto" component={LoyaltyCardPhoto} />
            <Stack.Screen name="LoyaltyColours" component={LoyaltyColours} />
        </Stack.Navigator>
    );
}

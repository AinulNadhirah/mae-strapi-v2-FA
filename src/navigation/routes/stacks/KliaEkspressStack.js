import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function KliaEkspressDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/KliaEkspressDashboard").default;
    return <Screen {...props} />;
}

function FromPlaceScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/FromPlaceScreen").default;
    return <Screen {...props} />;
}

function ToPlaceScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/ToPlaceScreen").default;
    return <Screen {...props} />;
}

function SelectTravelDateScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/SelectTravelDateScreen").default;
    return <Screen {...props} />;
}

function TicketCountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/TicketCountScreen").default;
    return <Screen {...props} />;
}

function TicketBookingSummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/TicketBookingSummaryScreen").default;
    return <Screen {...props} />;
}

function TicketBookingAcknowledgmentScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/TicketBookingAcknowledgmentScreen").default;
    return <Screen {...props} />;
}

function TicketViewScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/TicketViewScreen").default;
    return <Screen {...props} />;
}

function KLIAEkspressConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/KliaEkspres/KLIAEkspressConfirmationScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function KliaExpressStack() {
    return (
        <Stack.Navigator
            initialRouteName="KliaEkspressDashboard"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="KliaEkspressDashboard" component={KliaEkspressDashboard} />
            <Stack.Screen name="FromPlaceScreen" component={FromPlaceScreen} />
            <Stack.Screen name="ToPlaceScreen" component={ToPlaceScreen} />
            <Stack.Screen name="SelectTravelDateScreen" component={SelectTravelDateScreen} />
            <Stack.Screen name="TicketCountScreen" component={TicketCountScreen} />
            <Stack.Screen
                name="TicketBookingSummaryScreen"
                component={TicketBookingSummaryScreen}
            />
            <Stack.Screen
                name="TicketBookingAcknowledgmentScreen"
                component={TicketBookingAcknowledgmentScreen}
            />
            <Stack.Screen name="TicketViewScreen" component={TicketViewScreen} />
            <Stack.Screen
                name="KLIAEkspressConfirmationScreen"
                component={KLIAEkspressConfirmationScreen}
            />
        </Stack.Navigator>
    );
}

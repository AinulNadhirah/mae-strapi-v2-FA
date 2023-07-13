import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function BoosterSetupScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/Boosters/Setup/index").default;
    return <Screen {...props} />;
}

function BoosterSummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/Boosters/Summary/index").default;
    return <Screen {...props} />;
}

function BoosterDailyLimitScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/Boosters/Setup/DailyLimit").default;
    return <Screen {...props} />;
}

function BoosterFundAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/Boosters/Setup/FundAmount").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function BoosterStack() {
    return (
        <Stack.Navigator initialRouteName="BoosterSetup" headerMode="none">
            <Stack.Screen name="BoosterSetup" component={BoosterSetupScreen} />
            <Stack.Screen name="BoosterSummary" component={BoosterSummaryScreen} />
            <Stack.Screen name="BoosterDailyLimit" component={BoosterDailyLimitScreen} />
            <Stack.Screen name="BoosterFundAmount" component={BoosterFundAmountScreen} />
        </Stack.Navigator>
    );
}

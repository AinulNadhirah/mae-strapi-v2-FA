import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function PromotionsDashboardScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Promotions/PromotionsDashboardScreen").default;
    return <Screen {...props} />;
}

function PromotionDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Promotions/PromotionDetailsScreen").default;
    return <Screen {...props} />;
}

function SearchScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Search/SearchScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function PromotionStack() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="PromotionsDashboardScreen" component={PromotionsDashboardScreen} />
            <Stack.Screen name="PromotionDetailsScreen" component={PromotionDetailsScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
        </Stack.Navigator>
    );
}

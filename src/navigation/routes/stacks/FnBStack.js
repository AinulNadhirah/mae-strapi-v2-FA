import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function FnBTabScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/FnBTabScreen").default;
    return <Screen {...props} />;
}

function ViewAllPromotions(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/ViewAllPromotions").default;
    return <Screen {...props} />;
}

function ViewAllCraving(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/ViewAllCraving").default;
    return <Screen {...props} />;
}

function MerchantListing(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/MerchantListing").default;
    return <Screen {...props} />;
}

function MerchantListingSimple(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/MerchantListingSimple").default;
    return <Screen {...props} />;
}

function MerchantSearchListing(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/MerchantSearchListing").default;
    return <Screen {...props} />;
}

function FilterScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/FilterScreen").default;
    return <Screen {...props} />;
}

function PromotionDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/PromotionDetails").default;
    return <Screen {...props} />;
}

function MerchantDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FnB/MerchantDetails").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

const forFade = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

export default function FnBStack() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="FnBTabScreen" component={FnBTabScreen} />
            <Stack.Screen name="ViewAllPromotions" component={ViewAllPromotions} />
            <Stack.Screen name="ViewAllCraving" component={ViewAllCraving} />

            <Stack.Screen name="MerchantListing" component={MerchantListing} />
            <Stack.Screen name="MerchantListingSimple" component={MerchantListingSimple} />

            <Stack.Screen
                name="MerchantSearchListing"
                component={MerchantSearchListing}
                options={{ cardStyleInterpolator: forFade }}
            />
            <Stack.Screen name="FilterScreen" component={FilterScreen} />
            <Stack.Screen name="PromotionDetails" component={PromotionDetails} />
            <Stack.Screen name="MerchantDetails" component={MerchantDetails} />
        </Stack.Navigator>
    );
}

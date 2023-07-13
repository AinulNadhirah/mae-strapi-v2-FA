import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function FDEntryPointValidationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDEntryPointValidationScreen").default;
    return <Screen {...props} />;
}

function FDProductDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDProductDetailsScreen").default;
    return <Screen {...props} />;
}

function FDPlacementAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDPlacementAmountScreen").default;
    return <Screen {...props} />;
}

function FDPlacementDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDPlacementDetailsScreen").default;
    return <Screen {...props} />;
}

function FDTrinityPersonalDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDTrinityPersonalDetailsScreen").default;
    return <Screen {...props} />;
}

function FDTrinityEmploymentDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDTrinityEmploymentDetailsScreen").default;
    return <Screen {...props} />;
}

function FDTrinityHighRiskDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDTrinityHighRiskDetailsScreen").default;
    return <Screen {...props} />;
}

function FDConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDConfirmationScreen").default;
    return <Screen {...props} />;
}

function FDPlacementAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDPlacementAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function FDCertificateDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/FixedDeposit/FDCertificateDetailsScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function TacStack() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen
                name="FDEntryPointValidationScreen"
                component={FDEntryPointValidationScreen}
            />
            <Stack.Screen name="FDProductDetailsScreen" component={FDProductDetailsScreen} />
            <Stack.Screen name="FDPlacementAmountScreen" component={FDPlacementAmountScreen} />
            <Stack.Screen name="FDPlacementDetailsScreen" component={FDPlacementDetailsScreen} />
            <Stack.Screen
                name="FDTrinityPersonalDetailsScreen"
                component={FDTrinityPersonalDetailsScreen}
            />
            <Stack.Screen
                name="FDTrinityEmploymentDetailsScreen"
                component={FDTrinityEmploymentDetailsScreen}
            />
            <Stack.Screen
                name="FDTrinityHighRiskDetailsScreen"
                component={FDTrinityHighRiskDetailsScreen}
            />
            <Stack.Screen name="FDConfirmationScreen" component={FDConfirmationScreen} />
            <Stack.Screen
                name="FDPlacementAcknowledgementScreen"
                component={FDPlacementAcknowledgementScreen}
            />
            <Stack.Screen
                name="FDCertificateDetailsScreen"
                component={FDCertificateDetailsScreen}
            />
        </Stack.Navigator>
    );
}

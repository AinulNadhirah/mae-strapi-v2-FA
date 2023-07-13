import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function ABAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABAmountScreen").default;
    return <Screen {...props} />;
}

function ABAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABAcknowledgement").default;
    return <Screen {...props} />;
}
function ABConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABConfirmation").default;
    return <Screen {...props} />;
}

function ABCancelDuitNowAD(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABCancelDuitNowAD").default;
    return <Screen {...props} />;
}
function ABAutoDebitDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABAutoDebitDetails").default;
    return <Screen {...props} />;
}
function MerchantSearchScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/MerchantSearch").default;
    return <Screen {...props} />;
}
function MerchantDetailScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/MerchantDetails").default;
    return <Screen {...props} />;
}
function AutoBillingDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/AutoBillingDetailsScreen").default;
    return <Screen {...props} />;
}

function ABViewAllScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/ABViewAllScreen").default;
    return <Screen {...props} />;
}

function BillStatusScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/BillStatusScreen").default;
    return <Screen {...props} />;
}

function AutoBillingDashboard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/AutoBillingDashboard").default;
    return <Screen {...props} />;
}

function SwitchAccountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/AutoBilling/SwitchAccount").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function AutoBillingStack() {
    return (
        <Stack.Navigator initialRouteName="AutoBillingDashboard" headerMode="none">
            <Stack.Screen
                name="AutoBillingDashboard"
                component={AutoBillingDashboard}
                options={{
                    animationTypeForReplace: "pop",
                }}
            />
            <Stack.Screen name="BillStatusScreen" component={BillStatusScreen} />
            <Stack.Screen name="ABViewAllScreen" component={ABViewAllScreen} />
            <Stack.Screen name="AutoBillingDetailsScreen" component={AutoBillingDetailsScreen} />
            <Stack.Screen name="MerchantDetailScreen" component={MerchantDetailScreen} />
            <Stack.Screen name="MerchantSearchScreen" component={MerchantSearchScreen} />
            <Stack.Screen name="ABAutoDebitDetailsScreen" component={ABAutoDebitDetailsScreen} />
            <Stack.Screen name="ABConfirmationScreen" component={ABConfirmationScreen} />
            <Stack.Screen name="ABCancelDuitNowAD" component={ABCancelDuitNowAD} />
            <Stack.Screen name="ABAcknowledgementScreen" component={ABAcknowledgementScreen} />
            <Stack.Screen name="ABAmountScreen" component={ABAmountScreen} />
            <Stack.Screen name="SwitchAccountScreen" component={SwitchAccountScreen} />
        </Stack.Navigator>
    );
}

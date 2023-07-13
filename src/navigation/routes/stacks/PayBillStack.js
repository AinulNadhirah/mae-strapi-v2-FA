import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function PayBillsLandingScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsLandingScreen").default;
    return <Screen {...props} />;
}

function PayBillsListScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsListScreen").default;
    return <Screen {...props} />;
}

function PayBillsEnterAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsEnterAmount").default;
    return <Screen {...props} />;
}

function PayBillsPayeeDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsPayeeDetails").default;
    return <Screen {...props} />;
}

function PayBillsConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsConfirmationScreen").default;
    return <Screen {...props} />;
}

function PayBillsAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function PayBillsAddFavScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsAddFavScreen").default;
    return <Screen {...props} />;
}

function PayBillsViewBillScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/PayBillsViewBillScreen").default;
    return <Screen {...props} />;
}

function ZakatMobileNumber(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/ZakatMobileNumber").default;
    return <Screen {...props} />;
}

function ZakatDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/ZakatDetails").default;
    return <Screen {...props} />;
}

function ZakatType(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/ZakatType").default;
    return <Screen {...props} />;
}

function MaybankHeartTaptastic(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/PayBills/MaybankHeartTaptastic").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function PaylBillStack() {
    return (
        <Stack.Navigator initialRouteName="PayBillsLandingScreen" headerMode="none">
            <Stack.Screen name="PayBillsLandingScreen" component={PayBillsLandingScreen} />
            <Stack.Screen name="PayBillsListScreen" component={PayBillsListScreen} />
            <Stack.Screen name="PayBillsPayeeDetails" component={PayBillsPayeeDetails} />
            <Stack.Screen name="PayBillsEnterAmount" component={PayBillsEnterAmount} />
            <Stack.Screen
                name="PayBillsConfirmationScreen"
                component={PayBillsConfirmationScreen}
            />
            <Stack.Screen name="PayBillsAcknowledgeScreen" component={PayBillsAcknowledgeScreen} />
            <Stack.Screen name="PayBillsAddFavScreen" component={PayBillsAddFavScreen} />
            <Stack.Screen name="PayBillsViewBillScreen" component={PayBillsViewBillScreen} />
            <Stack.Screen name="ZakatMobileNumber" component={ZakatMobileNumber} />
            <Stack.Screen name="ZakatDetails" component={ZakatDetails} />
            <Stack.Screen name="ZakatType" component={ZakatType} />
            <Stack.Screen name="MaybankHeartTaptastic" component={MaybankHeartTaptastic} />
        </Stack.Navigator>
    );
}

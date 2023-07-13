import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function QRStartScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRStartScreen").default;
    return <Screen {...props} />;
}

function QRPayMainScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRPayMainScreen").default;
    return <Screen {...props} />;
}

function QRLimitScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRDailyLimit").default;
    return <Screen {...props} />;
}

function QRNumberScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRNumberValidate").default;
    return <Screen {...props} />;
}

function QRConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRConfirmationScreen").default;
    return <Screen {...props} />;
}

function QRAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function QRCameraScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRCamerDenyScreen").default;
    return <Screen {...props} />;
}

function QRSuccessScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRSuccess").default;
    return <Screen {...props} />;
}

function QRAccountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRAccountSelect").default;
    return <Screen {...props} />;
}

function QRCashBackScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/QRPay/QRCashBackScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function QrStacks() {
    return (
        <Stack.Navigator
            initialRouteName="QrStart"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="QrMain" component={QRPayMainScreen} />
            <Stack.Screen name="QrStart" component={QRStartScreen} />
            <Stack.Screen name="QrLimit" component={QRLimitScreen} />
            <Stack.Screen name="QrNumber" component={QRNumberScreen} />
            <Stack.Screen name="QrCamera" component={QRCameraScreen} />
            <Stack.Screen name="QrConf" component={QRConfirmationScreen} />
            <Stack.Screen name="QrAck" component={QRAcknowledgeScreen} />
            <Stack.Screen name="QrSucc" component={QRSuccessScreen} />
            <Stack.Screen name="QrAcc" component={QRAccountScreen} />
            <Stack.Screen name="QrCB" component={QRCashBackScreen} />
        </Stack.Navigator>
    );
}

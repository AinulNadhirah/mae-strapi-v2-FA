import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function ADAcknowledgement(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/ADAcknowledgement").default;
    return <Screen {...props} />;
}

function ADConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/ADConfirmation").default;
    return <Screen {...props} />;
}

function ADDecoupleScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/ADDecoupleScreen").default;
    return <Screen {...props} />;
}

function AutoDebitIDScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/AutoDebitIDScreen").default;
    return <Screen {...props} />;
}

function AutoDebitConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/AutoDebitConfirmation").default;
    return <Screen {...props} />;
}

function OnlineBanking(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/OnlineBanking").default;
    return <Screen {...props} />;
}

function NotFoundScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/NotFound").default;
    return <Screen {...props} />;
}

function ViewAllScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");
    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Wallet/requestToPay/ViewAllScreen").default;
    return <Screen {...props} />;
}
function DuitnowRequestDetailScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");
    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Wallet/requestToPay/DuitnowRequestDetailScreen").default;
    return <Screen {...props} />;
}
function AmountToggleScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");
    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Wallet/TransferAmount/AmountToggleScreen").default;
    return <Screen {...props} />;
}
function DuitnowRequestConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");
    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Wallet/requestToPay/DuitnowRequestConfirmationScreen").default;
    return <Screen {...props} />;
}
function DuitnowRequestAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");
    if (!shouldLoadOtherModule) return null;
    const Screen = require("@screens/Wallet/requestToPay/DuitnowRequestAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function RequestToPayIDScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayIDScreen").default;
    return <Screen {...props} />;
}

function RequestToPayAccount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayAccount").default;
    return <Screen {...props} />;
}

function RequestToPayAmount(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayAmount").default;
    return <Screen {...props} />;
}

function RequestToPayReference(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayReference").default;
    return <Screen {...props} />;
}

function RequestToPayConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayConfirmationScreen").default;
    return <Screen {...props} />;
}

function RequestToPayAcknowledgeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayAcknowledgeScreen").default;
    return <Screen {...props} />;
}

function RequestToPayAddToFavouritesScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen =
        require("@screens/Wallet/requestToPay/RequestToPayAddToFavouritesScreen").default;
    return <Screen {...props} />;
}

function RequestToPayDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/requestToPay/RequestToPayDetailsScreen").default;
    return <Screen {...props} />;
}

function PDFViewer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PDFViewer").default;
    return <Screen {...props} />;
}

function AmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Wallet/TransferAmount/AmountScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function RequestToPayStack() {
    return (
        <Stack.Navigator
            initialRouteName="RequestToPayIDScreen"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            {/* <Stack.Screen
                name="RequestToPayDashboard"
                component={RequestToPayDashboard}
                options={{
                    animationTypeForReplace: "pop",
                }}
            /> */}
            <Stack.Screen name="RequestToPayIDScreen" component={RequestToPayIDScreen} />
            <Stack.Screen name="RequestToPayAccount" component={RequestToPayAccount} />
            <Stack.Screen name="RequestToPayReference" component={RequestToPayReference} />
            <Stack.Screen name="RequestToPayDetailsScreen" component={RequestToPayDetailsScreen} />
            <Stack.Screen name="RequestToPayAmount" component={RequestToPayAmount} />
            <Stack.Screen
                name="RequestToPayConfirmationScreen"
                component={RequestToPayConfirmationScreen}
            />
            <Stack.Screen
                name="RequestToPayAcknowledgeScreen"
                component={RequestToPayAcknowledgeScreen}
            />
            <Stack.Screen
                name="RequestToPayAddToFavouritesScreen"
                component={RequestToPayAddToFavouritesScreen}
            />
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
            <Stack.Screen name="AmountScreen" component={AmountScreen} />
            <Stack.Screen name="ViewAllScreen" component={ViewAllScreen} />
            <Stack.Screen name="NotFoundScreen" component={NotFoundScreen} />
            <Stack.Screen name="OnlineBanking" component={OnlineBanking} />
            <Stack.Screen
                name="AutoDebitConfirmationScreen"
                component={AutoDebitConfirmationScreen}
            />
            <Stack.Screen name="AutoDebitIDScreen" component={AutoDebitIDScreen} />
            <Stack.Screen name="ADDecoupleScreen" component={ADDecoupleScreen} />
            <Stack.Screen name="ADConfirmation" component={ADConfirmation} />
            <Stack.Screen name="ADAcknowledgement" component={ADAcknowledgement} />
            <Stack.Screen name="AmountToggleScreen" component={AmountToggleScreen} />
            <Stack.Screen
                name="DuitnowRequestDetailScreen"
                component={DuitnowRequestDetailScreen}
            />
            <Stack.Screen
                name="DuitnowRequestConfirmationScreen"
                component={DuitnowRequestConfirmationScreen}
            />
            <Stack.Screen
                name="DuitnowRequestAcknowledgeScreen"
                component={DuitnowRequestAcknowledgeScreen}
            />
        </Stack.Navigator>
    );
}

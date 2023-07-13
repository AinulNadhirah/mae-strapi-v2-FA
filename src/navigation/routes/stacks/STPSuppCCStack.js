import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function CardSuppDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/SuppCard/CardSuppDetails").default;
    return <Screen {...props} />;
}

function CardSuppCollection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/SuppCard/CardSuppCollection").default;
    return <Screen {...props} />;
}

function CardSuppConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/SuppCard/CardSuppConfirmation").default;
    return <Screen {...props} />;
}

function CardSuppDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/SuppCard/CardSuppDeclaration").default;
    return <Screen {...props} />;
}

function CardSuppUploadDocs(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/SuppCard/CardSuppUploadDocs").default;
    return <Screen {...props} />;
}

function CardsFail(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsFail").default;
    return <Screen {...props} />;
}
function CardsSuccess(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsSuccess").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function STPSuppCCStack() {
    return (
        <Stack.Navigator initialRouteName="CardSuppDetails" headerMode="none">
            <Stack.Screen name="CardSuppDetails" component={CardSuppDetails} />
            <Stack.Screen name="CardSuppCollection" component={CardSuppCollection} />
            <Stack.Screen name="CardSuppConfirmation" component={CardSuppConfirmation} />
            <Stack.Screen name="CardSuppDeclaration" component={CardSuppDeclaration} />
            <Stack.Screen name="CardSuppUploadDocs" component={CardSuppUploadDocs} />
            <Stack.Screen name="CardsSuccess" component={CardsSuccess} />
            <Stack.Screen name="CardsFail" component={CardsFail} />
        </Stack.Navigator>
    );
}

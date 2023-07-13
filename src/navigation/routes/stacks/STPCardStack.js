import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function CardsLanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsLanding").default;
    return <Screen {...props} />;
}
function CardsTypeSelection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsTypeSelection").default;
    return <Screen {...props} />;
}

function CardsIntro(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsIntro").default;
    return <Screen {...props} />;
}

function CardsIdDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsIdDetails").default;
    return <Screen {...props} />;
}

function CardsPersonalDetails(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsPersonalDetails").default;
    return <Screen {...props} />;
}

function CardsAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsAddress").default;
    return <Screen {...props} />;
}

function CardsEmployer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsEmployer").default;
    return <Screen {...props} />;
}

function CardsOfficeAddress(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsOfficeAddress").default;
    return <Screen {...props} />;
}

function CardsCollection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsCollection").default;
    return <Screen {...props} />;
}

function CardsConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsConfirmation").default;
    return <Screen {...props} />;
}

function CardsDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsDeclaration").default;
    return <Screen {...props} />;
}

function CardsUploadDocs(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsUploadDocs").default;
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
function CardsIdResume(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsIdResume").default;
    return <Screen {...props} />;
}

function CardsOTPNumber(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsOTPNumber").default;
    return <Screen {...props} />;
}

function CardsResumeLanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsResumeLanding").default;
    return <Screen {...props} />;
}
function CardsCamera(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CardSTP/Card/CardsCamera").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function STPCardStack() {
    return (
        <Stack.Navigator initialRouteName="CardsLanding" headerMode="none">
            <Stack.Screen name="CardsLanding" component={CardsLanding} />
            <Stack.Screen name="CardsTypeSelection" component={CardsTypeSelection} />
            <Stack.Screen name="CardsIntro" component={CardsIntro} />
            <Stack.Screen name="CardsIdDetails" component={CardsIdDetails} />
            <Stack.Screen name="CardsPersonalDetails" component={CardsPersonalDetails} />
            <Stack.Screen name="CardsAddress" component={CardsAddress} />
            <Stack.Screen name="CardsEmployer" component={CardsEmployer} />
            <Stack.Screen name="CardsOfficeAddress" component={CardsOfficeAddress} />
            <Stack.Screen name="CardsCollection" component={CardsCollection} />
            <Stack.Screen name="CardsConfirmation" component={CardsConfirmation} />
            <Stack.Screen name="CardsDeclaration" component={CardsDeclaration} />
            <Stack.Screen name="CardsUploadDocs" component={CardsUploadDocs} />
            <Stack.Screen name="CardsSuccess" component={CardsSuccess} />
            <Stack.Screen name="CardsFail" component={CardsFail} />
            <Stack.Screen name="CardsIdResume" component={CardsIdResume} />
            <Stack.Screen name="CardsOTPNumber" component={CardsOTPNumber} />
            <Stack.Screen name="CardsResumeLanding" component={CardsResumeLanding} />
            <Stack.Screen name="CardsCamera" component={CardsCamera} />
        </Stack.Navigator>
    );
}

import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import {
    SECURE_SWITCH_LANDING,
    DEACTIVATE_M2U_CARDS_CASA_LANDING,
    M2U_DEACTIVATE,
    DEACTIVATE_CARDS_CASA_CONFIRMATION,
    SELECT_REASON_TO_BLOCK_CARDS,
    SELECT_CARDS_CASA_TO_DEACTIVATE,
    DEACTIVATE_CARDS_CASA_ACK,
    LOCATE_US_NOW_SCREEN,
} from "@navigation/navigationConstant";

import { useModelController } from "@context";

function DeactivateM2UCardsCASALanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/DeactivateM2UCardsCASALanding").default;
    return <Screen {...props} />;
}

function M2UDeactivate(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/M2UDeactivate").default;
    return <Screen {...props} />;
}

function SecureSwitchLanding(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/SecureSwitchLanding").default;
    return <Screen {...props} />;
}

function DeactivateCardsCASAConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/DeactivateCardsCASAConfirmation").default;
    return <Screen {...props} />;
}

function SelectReasonToBlockCard(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/SelectReasonToBlockCard").default;
    return <Screen {...props} />;
}

function SelectCardsCasaToDeactivate(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/SelectCardsCasaToDeactivate").default;
    return <Screen {...props} />;
}

function DeactivateCardsCASAAcknowledgement(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/DeactivateCardsCASAAcknowledgement").default;
    return <Screen {...props} />;
}

function LocateUsNow(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/SecureSwitch/LocateUsNow").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function SecureSwitchStack() {
    return (
        <Stack.Navigator initialRouteName="SecureSwitchLanding" headerMode="none">
            <Stack.Screen name={SECURE_SWITCH_LANDING} component={SecureSwitchLanding} />
            <Stack.Screen name={DEACTIVATE_M2U_CARDS_CASA_LANDING} component={DeactivateM2UCardsCASALanding} />
            <Stack.Screen name={M2U_DEACTIVATE} component={M2UDeactivate} />
            <Stack.Screen
                name={DEACTIVATE_CARDS_CASA_CONFIRMATION}
                component={DeactivateCardsCASAConfirmation}
            />
            <Stack.Screen name={SELECT_REASON_TO_BLOCK_CARDS} component={SelectReasonToBlockCard} />
            <Stack.Screen name={SELECT_CARDS_CASA_TO_DEACTIVATE} component={SelectCardsCasaToDeactivate} />
            <Stack.Screen name={DEACTIVATE_CARDS_CASA_ACK} component={DeactivateCardsCASAAcknowledgement} />
            <Stack.Screen name={LOCATE_US_NOW_SCREEN} component={LocateUsNow} />
        </Stack.Navigator>
    );
}

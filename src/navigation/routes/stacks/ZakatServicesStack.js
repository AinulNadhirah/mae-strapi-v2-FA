import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import {
    ZAKAT_SERVICES_ENTRY,
    ZAKAT_DEBIT_ACCT_SELECT,
    ZAKAT_DEBIT_ACCT_DECLARATION,
    ZAKAT_DEBIT_CONFIRMATION,
    ZAKAT_ACKNOWLEDGE,
    ZAKAT_FAIL
} from "@navigation/navigationConstant";

import { useModelController } from "@context";

function ZakatDebitCalculation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/ZakatDebitCalculation").default;
    return <Screen {...props} />;
}

function ZakatDebitAccountSelection(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/ZakatDebitAccountSelection").default;
    return <Screen {...props} />;
}

function ZakatDeclaration(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/Declaration").default;
    return <Screen {...props} />;
}

function ZakatConfirmation(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/Confirmation").default;
    return <Screen {...props} />;
}

function ZakatAcknowledgement(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/ZakatAcknowledgement").default;
    return <Screen {...props} />;
}

function ZakatFail(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ZakatServices/ZakatFail").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function ZakatServicesStack() {
    return (
        <Stack.Navigator
            initialRouteName={ZAKAT_SERVICES_ENTRY}
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name={ZAKAT_SERVICES_ENTRY} component={ZakatDebitCalculation} />
            <Stack.Screen name={ZAKAT_DEBIT_ACCT_SELECT} component={ZakatDebitAccountSelection} />
            <Stack.Screen name={ZAKAT_DEBIT_ACCT_DECLARATION} component={ZakatDeclaration} />
            <Stack.Screen name={ZAKAT_DEBIT_CONFIRMATION} component={ZakatConfirmation} />
            <Stack.Screen name={ZAKAT_ACKNOWLEDGE} component={ZakatAcknowledgement} />
            <Stack.Screen name={ZAKAT_FAIL} component={ZakatFail} />
        </Stack.Navigator>
    );
}

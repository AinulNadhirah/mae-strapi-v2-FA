import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function ContactScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/ContactScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function ContactStack() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="ContactScreen" component={ContactScreen} />
        </Stack.Navigator>
    );
}

import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function MainScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Merdeka/MerdekaScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function MerdekaStack() {
    return (
        <Stack.Navigator initialRouteName="Main" headerMode="none">
            <Stack.Screen name="Main" component={MainScreen} />
        </Stack.Navigator>
    );
}

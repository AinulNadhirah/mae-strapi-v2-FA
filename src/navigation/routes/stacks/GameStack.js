import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import TapTrackWin from "@screens/Gaming/TapTrackWin";

import { useModelController } from "@context";

function MainScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Gaming/SortToWin").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function GameStack() {
    return (
        <Stack.Navigator initialRouteName="Main" headerMode="none">
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="TapTrackWin" component={TapTrackWin} />
        </Stack.Navigator>
    );
}

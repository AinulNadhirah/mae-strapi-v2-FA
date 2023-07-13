import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function NotificationCenterScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Notifications/index").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function notiticationStack() {
    return (
        <Stack.Navigator
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="NotificationCenterScreen" component={NotificationCenterScreen} />
        </Stack.Navigator>
    );
}

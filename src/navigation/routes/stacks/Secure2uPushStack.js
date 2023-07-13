import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PushStatus from "@screens/OneTapAuth/PushStatus";
import PushAuthentication from "@screens/OneTapAuth/PushAuthentication";

const Stack = createStackNavigator();

export default function Secure2uPushStack() {
    return (
        <Stack.Navigator
            initialRouteName="PushAuthentication"
            headerMode="none"
            screenOptions={{
                gestureEnabled: false,
            }}
        >
            <Stack.Screen name="PushStatus" component={PushStatus} />
            <Stack.Screen name="PushAuthentication" component={PushAuthentication} />
        </Stack.Navigator>
    );
}

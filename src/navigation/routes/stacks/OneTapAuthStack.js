import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ActivateScreen from "@screens/OneTapAuth/Activate";
import DeviceScreen from "@screens/OneTapAuth/Device";
import FailScreen from "@screens/OneTapAuth/Fail";
import IdNumberScreen from "@screens/OneTapAuth/IdNumber";
import RsaLockedScreen from "@screens/OneTapAuth/RsaLocked";
import S2UCooling from "@screens/OneTapAuth/S2UCooling";
import SuccessScreen from "@screens/OneTapAuth/Success";

import { SECURE2U_COOLING } from "@navigation/navigationConstant";

const Stack = createStackNavigator();

export default function OneTapAuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Activate"
            headerMode="none"
            screenOptions={{
                gestureEnabled: false,
            }}
        >
            <Stack.Screen name="Activate" component={ActivateScreen} />
            <Stack.Screen name="IdNumber" component={IdNumberScreen} />
            <Stack.Screen name="Device" component={DeviceScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="Fail" component={FailScreen} />
            <Stack.Screen name="Locked" component={RsaLockedScreen} />
            <Stack.Screen name={SECURE2U_COOLING} component={S2UCooling} />
        </Stack.Navigator>
    );
}

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ReceiptDetailScreen from "@screens/VirtualReceipt/ReceiptDetailScreen";

const Stack = createStackNavigator();

export default function VirtualReceiptStack() {
    return (
        <Stack.Navigator
            initialRouteName="ReceiptDetailScreen"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="ReceiptDetailScreen" component={ReceiptDetailScreen} />
        </Stack.Navigator>
    );
}

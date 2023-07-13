import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import AirpazInAppBrowser from "@screens/Tickets/AirpazInAppBrowser";
import BusTicketInAppBrowser from "@screens/Tickets/BusTicketInAppBrowser";
import ExpediaInAppBrowser from "@screens/Tickets/ExpediaInAppBrowser";
import MyGrocerInAppBrowser from "@screens/Tickets/MyGrocerInAppBrowser";
import TicketConfirmation from "@screens/Tickets/TicketConfirmation";
import TicketStatus from "@screens/Tickets/TicketStatus";
import TicketViewScreen from "@screens/Tickets/TicketViewScreen";
import ViewTicket from "@screens/Tickets/ViewTicket";
import WetixInAppBrowser from "@screens/Tickets/WetixInAppBrowser";

const Stack = createStackNavigator();

export default function TicketStack() {
    return (
        <Stack.Navigator
            initialRouteName="WetixInAppBrowser"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="ExpediaInAppBrowser" component={ExpediaInAppBrowser} />
            <Stack.Screen name="WetixInAppBrowser" component={WetixInAppBrowser} />
            <Stack.Screen name="TicketConfirmation" component={TicketConfirmation} />
            <Stack.Screen name="TicketStatus" component={TicketStatus} />
            <Stack.Screen name="AirpazInAppBrowser" component={AirpazInAppBrowser} />
            <Stack.Screen name="TicketViewScreen" component={TicketViewScreen} />
            <Stack.Screen name="BusTicketInAppBrowser" component={BusTicketInAppBrowser} />
            <Stack.Screen name="MyGrocerInAppBrowser" component={MyGrocerInAppBrowser} />
            <Stack.Screen name="ViewTicket" component={ViewTicket} />
        </Stack.Navigator>
    );
}

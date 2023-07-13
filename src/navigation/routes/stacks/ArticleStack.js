import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// import DetailsScreen from "@screens/Articles/Details";
import DetailsScreen from "@screens/Dashboard/DashboardContentDetails";

const Stack = createStackNavigator();

export default function ArticleStacks() {
    return (
        <Stack.Navigator
            initialRouteName="ArticleDetails"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="ArticleDetails" component={DetailsScreen} />
        </Stack.Navigator>
    );
}

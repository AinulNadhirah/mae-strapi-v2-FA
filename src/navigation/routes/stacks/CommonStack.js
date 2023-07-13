import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function WebViewInAppScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/WebViewInAppScreen").default;
    return <Screen {...props} />;
}
function PdfViewScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PdfViewScreen").default;
    return <Screen {...props} />;
}

function StatusCheckScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/StatusCheckScreen").default;
    return <Screen {...props} />;
}

function PDFViewer(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/PDFViewer").default;
    return <Screen {...props} />;
}

function RsaDenyScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/CommonScreens/RsaDenyScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function CommonStack() {
    return (
        <Stack.Navigator initialRouteName="WebViewInAppScreen" headerMode="none">
            <Stack.Screen name="WebViewInAppScreen" component={WebViewInAppScreen} />
            <Stack.Screen name="PdfViewScreen" component={PdfViewScreen} />
            <Stack.Screen name="StatusCheckScreen" component={StatusCheckScreen} />
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
            <Stack.Screen
                name="RsaDenyScreen"
                options={{
                    gestureEnabled: false,
                }}
                component={RsaDenyScreen}
            />
        </Stack.Navigator>
    );
}

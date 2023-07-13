import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useModelController } from "@context";

function TabungLandingScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/TabungLandingScreen").default;
    return <Screen {...props} />;
}

function TabungTabScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/TabungTabScreen").default;
    return <Screen {...props} />;
}

function PendingInvitationsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/PendingInvitationsScreen").default;
    return <Screen {...props} />;
}

function InvitedDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/InvitedDetailsScreen").default;
    return <Screen {...props} />;
}

function TabungDetailsScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/TabungDetailsScreen").default;
    return <Screen {...props} />;
}

function EnterEditGoalName(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/EnterEditGoalName").default;
    return <Screen {...props} />;
}

function ESIAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/ESIAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function ESICreationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/ESICreationScreen").default;
    return <Screen {...props} />;
}

function GoalTopUpAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalTopUpAmountScreen").default;
    return <Screen {...props} />;
}

function GoalTopUpAndWithdrawalConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalTopUpAndWithdrawalConfirmationScreen").default;
    return <Screen {...props} />;
}

function GoalPartialWithdrawalAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalPartialWithdrawalAmountScreen").default;
    return <Screen {...props} />;
}

function GoalGroupWithdrawalTransferSelectionScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalGroupWithdrawalTransferSelectionScreen").default;
    return <Screen {...props} />;
}

function GoalGroupWithdrawalTransferToCreatorScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalGroupWithdrawalTransferToCreatorScreen").default;
    return <Screen {...props} />;
}

function GoalTopUpAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalTopUpAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function GoalWithdrawalAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalWithdrawalAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function GoalRemoveScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalRemoveScreen").default;
    return <Screen {...props} />;
}

function GoalRemovalAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalRemovalAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function GoalTransferAcknowledgementScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalTransferAcknowledgementScreen").default;
    return <Screen {...props} />;
}

function GoalEditPictureScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalEditPictureScreen").default;
    return <Screen {...props} />;
}

function GoalRenameScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/GoalRenameScreen").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

function TabungMain() {
    return (
        <Stack.Navigator
            initialRouteName="TabungTabScreen"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <Stack.Screen name="TabungTabScreen" component={TabungTabScreen} />
            <Stack.Screen name="PendingInvitationsScreen" component={PendingInvitationsScreen} />
            <Stack.Screen name="InvitedDetailsScreen" component={InvitedDetailsScreen} />
            <Stack.Screen name="TabungDetailsScreen" component={TabungDetailsScreen} />
            <Stack.Screen name="EnterEditGoalName" component={EnterEditGoalName} />
            <Stack.Screen name="ESIAcknowledgementScreen" component={ESIAcknowledgementScreen} />
            <Stack.Screen name="ESICreationScreen" component={ESICreationScreen} />
            <Stack.Screen name="GoalTopUpAmountScreen" component={GoalTopUpAmountScreen} />
            <Stack.Screen
                name="GoalTopUpAndWithdrawalConfirmationScreen"
                component={GoalTopUpAndWithdrawalConfirmationScreen}
            />
            <Stack.Screen
                name="GoalPartialWithdrawalAmountScreen"
                component={GoalPartialWithdrawalAmountScreen}
            />
            <Stack.Screen
                name="GoalGroupWithdrawalTransferSelectionScreen"
                component={GoalGroupWithdrawalTransferSelectionScreen}
            />
            <Stack.Screen
                name="GoalGroupWithdrawalTransferToCreatorScreen"
                component={GoalGroupWithdrawalTransferToCreatorScreen}
            />
            <Stack.Screen
                name="GoalTopUpAcknowledgementScreen"
                component={GoalTopUpAcknowledgementScreen}
            />
            <Stack.Screen
                name="GoalWithdrawalAcknowledgementScreen"
                component={GoalWithdrawalAcknowledgementScreen}
            />
            <Stack.Screen name="GoalRemoveScreen" component={GoalRemoveScreen} />
            <Stack.Screen
                name="GoalRemovalAcknowledgementScreen"
                component={GoalRemovalAcknowledgementScreen}
            />
            <Stack.Screen
                name="GoalTransferAcknowledgementScreen"
                component={GoalTransferAcknowledgementScreen}
            />
            <Stack.Screen name="GoalRenameScreen" component={GoalRenameScreen} />
            <Stack.Screen name="GoalEditPictureScreen" component={GoalEditPictureScreen} />
        </Stack.Navigator>
    );
}

const TabungRootStack = createStackNavigator();

export default function TabungRoot() {
    return (
        <TabungRootStack.Navigator
            initialRouteName="TabungLanding"
            headerMode="none"
            screenOptions={{
                gesturesEnabled: false,
            }}
        >
            <TabungRootStack.Screen
                name="TabungLanding"
                component={TabungLandingScreen}
                options={{
                    animationEnabled: false,
                }}
            />
            <TabungRootStack.Screen name="TabungMain" component={TabungMain} />
        </TabungRootStack.Navigator>
    );
}

import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

//Common
import PDFViewer from "@screens/CommonScreens/PDFViewer";
//Create flow
import AddFriends from "@screens/Goals/CreateGoals/AddFriends";
import EditParticipantAmount from "@screens/Goals/CreateGoals/EditParticipantAmount";
import ParticipantsSummary from "@screens/Goals/CreateGoals/ParticipantsSummary";
import InvitationAcknowledgement from "@screens/Goals/Invitation/Acknowledgement";
import InvitationConfirmation from "@screens/Goals/Invitation/Confirmation";
//Invitation flow
import InvitationDetails from "@screens/Goals/Invitation/InvitationDetails";
import InvitationSummary from "@screens/Goals/Invitation/Summary";

import { useModelController } from "@context";

function CreatGoalsStartScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/Start").default;
    return <Screen {...props} />;
}

function CreatGoalsSelectGoalTypeScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/SelectGoalType").default;
    return <Screen {...props} />;
}

function CreatGoalsEnterGoalNameScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/EnterGoalName").default;
    return <Screen {...props} />;
}

function CreatGoalsEnterGoalAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/EnterGoalAmount").default;
    return <Screen {...props} />;
}

function CreatGoalsEnterGoalStartDateScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/EnterGoalStartDate").default;
    return <Screen {...props} />;
}

function CreatGoalsEnterGoalEndDateScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/EnterGoalEndDate").default;
    return <Screen {...props} />;
}

function CreatGoalsSummaryScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/Summary").default;
    return <Screen {...props} />;
}

function CreatGoalsConfirmationScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/Confirmation").default;
    return <Screen {...props} />;
}

function CreatGoalsAcknowledgmentScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/Acknowledgment").default;
    return <Screen {...props} />;
}

function CreatGoalsEditAmountScreen(props) {
    const { getModel } = useModelController();
    const { shouldLoadOtherModule } = getModel("moduleLoader");

    if (!shouldLoadOtherModule) return null;

    const Screen = require("@screens/Goals/CreateGoals/EditAmount").default;
    return <Screen {...props} />;
}

const Stack = createStackNavigator();

export default function GoalStack() {
    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name="CreatGoalsStartScreen" component={CreatGoalsStartScreen} />
            <Stack.Screen
                name="CreatGoalsSelectGoalTypeScreen"
                component={CreatGoalsSelectGoalTypeScreen}
            />
            <Stack.Screen
                name="CreatGoalsEnterGoalNameScreen"
                component={CreatGoalsEnterGoalNameScreen}
            />
            <Stack.Screen
                name="CreatGoalsEnterGoalAmountScreen"
                component={CreatGoalsEnterGoalAmountScreen}
            />
            <Stack.Screen
                name="CreatGoalsEnterGoalStartDateScreen"
                component={CreatGoalsEnterGoalStartDateScreen}
            />
            <Stack.Screen
                name="CreatGoalsEnterGoalEndDateScreen"
                component={CreatGoalsEnterGoalEndDateScreen}
            />
            <Stack.Screen name="CreatGoalsSummaryScreen" component={CreatGoalsSummaryScreen} />
            <Stack.Screen
                name="CreatGoalsConfirmationScreen"
                component={CreatGoalsConfirmationScreen}
            />
            <Stack.Screen
                name="CreatGoalsAcknowledgmentScreen"
                component={CreatGoalsAcknowledgmentScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="CreatGoalsEditAmountScreen"
                component={CreatGoalsEditAmountScreen}
            />
            <Stack.Screen name="CreateGoalsAddFriendsScreen" component={AddFriends} />
            <Stack.Screen
                name="CreateGoalsParticipantsSummaryScreen"
                component={ParticipantsSummary}
            />
            <Stack.Screen
                name="CreateGoalsEditParticipantAmountScreen"
                component={EditParticipantAmount}
            />
            {/* Invitation Flow  */}
            <Stack.Screen name="InvitationDetailsScreen" component={InvitationDetails} />
            <Stack.Screen name="InvitationSummaryScreen" component={InvitationSummary} />
            <Stack.Screen name="InvitationConfirmationScreen" component={InvitationConfirmation} />
            <Stack.Screen
                name="InvitationAcknowledgementScreen"
                component={InvitationAcknowledgement}
            />

            {/* Common */}
            <Stack.Screen name="PDFViewer" component={PDFViewer} />
        </Stack.Navigator>
    );
}

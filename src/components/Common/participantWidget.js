import React, { Component } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import * as Strings from "@constants/strings";
import { commaAdder } from "@utils/dataModel/utility";
import WidgetStyles from "@styles/Fitness/participantwidgetStyles";
import { OverlappingPictures } from "@components/Common/overlappingPictures";

class ParticipantWidget extends Component {
    constructor(props) {
        super(props);
        console.log("in ParticipantWidget", this.props);
    }

    render() {
        return (
            <TouchableOpacity
                style={
                    this.props.onLeaderboard
                        ? [WidgetStyles.mainLeaderboardView]
                        : this.props.currentUser && this.props.challengeStatus == "O"
                        ? [WidgetStyles.mainElevatedView]
                        : [WidgetStyles.mainNormalView]
                }
                activeOpacity={
                    this.props.currentUser && this.props.challengeStatus == "O" ? 0.6 : 1
                }
                onPress={
                    this.props.currentUser && this.props.challengeStatus == "O"
                        ? this.props.onPress
                        : null
                }
                accessibilityLabel={
                    this.props.currentUser && this.props.challengeStatus == "O"
                        ? "widgetButtonUser"
                        : "widgetButton"
                }
                testID={
                    this.props.currentUser && this.props.challengeStatus == "O"
                        ? "widgetButtonUser"
                        : "widgetButton"
                }
            >
                <View
                    style={[WidgetStyles.profilePicView]}
                    accessibilityLabel={"profilePicView"}
                    testID={"profilePicView"}
                >
                    {this.props.profileImage || this.props.participantName ? (
                        <OverlappingPictures
                            picArray={[
                                {
                                    participantPic: this.props.profileImage,
                                    participantName: this.props.participantName,
                                },
                            ]}
                            small={false}
                        />
                    ) : null}
                </View>
                <View
                    style={[WidgetStyles.rankingView]}
                    accessibilityLabel={"rankingView"}
                    testID={"rankingView"}
                >
                    {this.props.onLeaderboard ? (
                        <Text
                            style={[WidgetStyles.rankingText]}
                            accessibilityLabel={"rankingText"}
                            testID={"rankingText"}
                        >
                            {this.props.rank}
                        </Text>
                    ) : this.props.accepted &&
                      (this.props.challengeStatus == "O" || this.props.challengeStatus == "C") ? (
                        <Text
                            style={[WidgetStyles.rankingText]}
                            accessibilityLabel={"rankingText"}
                            testID={"rankingText"}
                        >
                            {this.props.rank}
                        </Text>
                    ) : (
                        <Text
                            style={[WidgetStyles.rankingText]}
                            accessibilityLabel={"rankingText"}
                            testID={"rankingText"}
                        >
                            -
                        </Text>
                    )}
                </View>
                <View
                    style={[WidgetStyles.nameView]}
                    accessibilityLabel={"nameView"}
                    testID={"nameView"}
                >
                    <Text
                        style={
                            this.props.currentUser
                                ? [WidgetStyles.nameTextIsUser]
                                : [WidgetStyles.nameTextNotUser]
                        }
                        accessibilityLabel={"nameText"}
                        testID={"nameText"}
                    >
                        {this.props.currentUser ? Strings.YOU : this.props.participantName}
                    </Text>
                </View>
                <View
                    style={[WidgetStyles.stepsView]}
                    accessibilityLabel={"stepsView"}
                    testID={"stepsView"}
                >
                    {this.props.onLeaderboard ? (
                        <Text
                            style={[WidgetStyles.stepsText]}
                            accessibilityLabel={"stepsText"}
                            testID={"stepsText"}
                        >
                            {commaAdder(this.props.stepCount)}
                        </Text>
                    ) : this.props.accepted ? (
                        this.props.challengeStatus == "O" || this.props.challengeStatus == "C" ? (
                            <Text
                                style={[WidgetStyles.stepsText]}
                                accessibilityLabel={"stepsText"}
                                testID={"stepsText"}
                            >
                                {commaAdder(this.props.stepCount)}
                            </Text>
                        ) : (
                            <Text
                                style={[WidgetStyles.stepsText]}
                                accessibilityLabel={"stepsText"}
                                testID={"stepsText"}
                            >
                                -
                            </Text>
                        )
                    ) : (
                        <Text
                            style={[WidgetStyles.pendingText]}
                            accessibilityLabel={"stepsText"}
                            testID={"stepsText"}
                        >
                            {Strings.PENDING}
                        </Text>
                    )}
                </View>
                {this.props.onLeaderboard ? null : (
                    <View
                        style={[WidgetStyles.statusView]}
                        accessibilityLabel={"statusView"}
                        testID={"statusView"}
                    >
                        {this.props.accepted ? (
                            <Text
                                style={[WidgetStyles.statusText]}
                                accessibilityLabel={"statusText"}
                                testID={"statusText"}
                            >
                                {Strings.LAST_SYNC}
                                {this.props.syncTime}
                            </Text>
                        ) : (
                            <Text
                                style={[WidgetStyles.statusText]}
                                accessibilityLabel={"statusText"}
                                testID={"statusText"}
                            >
                                {Strings.ACCEPT_WAITING}
                            </Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    }
}

export default ParticipantWidget;

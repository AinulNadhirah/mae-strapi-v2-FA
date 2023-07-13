import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    ONE_TAP_AUTH_MODULE,
    DASHBOARD,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { goalWithdraw } from "@services";
import { logEvent } from "@services/analytics";

import { FA_SCREEN_NAME, FA_TABUNG_REMOVETABUNG, FA_VIEW_SCREEN } from "@constants/strings";

import { getDeviceRSAInformation } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Asset from "@assets";

const REFERENCE_ID_LABEL = "Reference ID";
const DATE_TIME_LABEL = "Date & time";

const RemoveSoloTabungTemplate = ({ title, body, description }) => (
    <View style={styles.container}>
        <Typo text={title} fontSize={14} lineHeight={18} fontWeight="600" />
        <SpaceFiller height={9} />
        <Typo text={body} fontSize={20} lineHeight={28} fontWeight="300" textAlign="left" />
        <SpaceFiller height={24} />
        <Typo text={description} fontSize={12} lineHeight={18} textAlign="left" color="#787878" />
    </View>
);

RemoveSoloTabungTemplate.propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

const RemoveGoalTabungTemplate = ({ title, body, checklist, checklistTitle, description }) => (
    <View style={styles.container}>
        <Typo text={title} fontSize={14} lineHeight={18} fontWeight="600" />
        <SpaceFiller height={9} />
        <Typo text={body} fontSize={20} lineHeight={28} fontWeight="300" textAlign="left" />
        {checklistTitle && (
            <React.Fragment>
                <SpaceFiller height={24} />
                <Typo text={checklistTitle} fontSize={14} lineHeight={20} textAlign="left" />
                <SpaceFiller height={16} />
            </React.Fragment>
        )}
        {checklist &&
            checklist.map((text, index) => (
                <React.Fragment key={`${text}-${index}`}>
                    <View style={styles.checklistContainer}>
                        <Image source={Asset.icTickBlackSmall} style={styles.tickImage} />
                        <Typo text={text} fontSize={14} lineHeight={20} textAlign="left" />
                    </View>
                    {index < checklist.length - 1 && <SpaceFiller height={12} />}
                </React.Fragment>
            ))}
        {description && (
            <React.Fragment>
                <SpaceFiller height={28} />
                <Typo
                    text={description}
                    fontSize={12}
                    lineHeight={18}
                    textAlign="left"
                    color="#787878"
                />
            </React.Fragment>
        )}
    </View>
);

RemoveGoalTabungTemplate.propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    description: PropTypes.string,
    checklist: PropTypes.array,
    checklistTitle: PropTypes.string,
};

class GoalRemoveScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
    };

    state = {
        showRSALoader: false,
        showRSAChallengeQuestion: false,
        rsaChallengeQuestion: "",
        showRSAError: false,
        challengeRequest: {},
        rsaCount: 0,
    };
    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_REMOVETABUNG,
        });
    }
    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onContinueButtonPressed = async () => {
        const {
            route: {
                params: { formattedAmount, goalId },
            },
            navigation: { navigate },
        } = this.props;
        if (numeral(formattedAmount).value() > 0)
            navigate("TabungMain", {
                screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                params: {
                    ...this.props.route.params,
                },
            });
        else {
            const payload = {
                goalId,
                mobileSDKData: this._getMobileSDKData(),
            };
            this._handleRemoveTabung(payload);
        }
    };

    _handleRemoveTabung = async (payload) => {
        const {
            navigation: { navigate },
        } = this.props;
        try {
            const request = await this._removeTabung(payload);
            if (request?.status === 200)
                this.setState({ showRSAChallengeQuestion: false }, () =>
                    navigate("TabungMain", {
                        screen: "GoalRemovalAcknowledgementScreen",
                        params: {
                            isRemovalOnly: true,
                            isRemovalSuccessful: true,
                            topUpDetailsData: [
                                {
                                    title: REFERENCE_ID_LABEL,
                                    value: request.data.result.trxRefId,
                                },
                                {
                                    title: DATE_TIME_LABEL,
                                    value: request.data.result.formattedServerDate,
                                },
                            ],
                        },
                    })
                );
            else
                this.setState({ showRSAChallengeQuestion: false }, () =>
                    navigate("TabungMain", {
                        screen: "GoalRemovalAcknowledgementScreen",
                        params: {
                            errorMessage: request.message,
                            isRemovalOnly: true,
                            isRemovalSuccessful: false,
                            topUpDetailsData: [
                                {
                                    title: REFERENCE_ID_LABEL,
                                    value: request.data.result.trxRefId,
                                },
                                {
                                    title: DATE_TIME_LABEL,
                                    value: request.data.result.formattedServerDate,
                                },
                            ],
                        },
                    })
                );
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this.setState({ showRSAChallengeQuestion: false }, () =>
                navigate("TabungMain", {
                    screen: "GoalRemovalAcknowledgementScreen",
                    params: {
                        errorMessage: error.message,
                        isRemovalOnly: true,
                        isRemovalSuccessful: false,
                        topUpDetailsData: [
                            {
                                title: REFERENCE_ID_LABEL,
                                value: error?.error?.result?.trxRefId ?? "N/A",
                            },
                            {
                                title: DATE_TIME_LABEL,
                                value: error?.error?.result?.formattedServerDate ?? "N/A",
                            },
                        ],
                    },
                })
            );
        }
    };

    _removeTabung = async (payload) => {
        try {
            return await goalWithdraw("/goal/remove", payload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _handleRSAFailure = (error) => {
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.result.rsaResponse.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.result.rsaResponse.challenge.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.result?.rsaResponse?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.result?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription:
                        error?.error?.result?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription:
                        error?.error?.result?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.result?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, () => {
            const payload = {
                goalId: this.props.route.params.goalId,
                mobileSDKData: this._getMobileSDKData(),
                challenge: { ...this.state.challengeRequest.challenge, answer },
            };
            this._handleRemoveTabung(payload);
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    _getMobileSDKData = () => {
        const { getModel } = this.props;
        const { deviceInformation, deviceId } = getModel("device");
        return getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
    };

    _renderRemoveSoloTabung = () => {
        const {
            route: {
                params: { formattedAmount, goalTitle },
            },
        } = this.props;
        const convertedAmount = numeral(formattedAmount).value();
        if (convertedAmount === 0)
            return (
                <RemoveSoloTabungTemplate
                    title="Remove Tabung"
                    body={`You’ve withdrawn all past contributions or none were made to the ${goalTitle} Tabung.`}
                    description="Removing this Tabung will cancel all future plans of saving towards this goal."
                />
            );
        else
            return (
                <RemoveSoloTabungTemplate
                    title="Remove Tabung"
                    body={`You’ve contributed RM ${formattedAmount} to the ${goalTitle} Tabung.`}
                    description="The amount you’ve contributed will be transferred back into your selected account."
                />
            );
    };

    _renderRemoveGroupTabung = () => {
        const {
            route: {
                params: {
                    didCreatorFullyWithdraw,
                    didParticipantFullyWithdraw,
                    goalTitle,
                    isGoalOwner,
                    formattedAmount,
                    didCreatorRemoveGoal,
                    creatorName,
                },
            },
        } = this.props;
        const convertedAmount = numeral(formattedAmount).value();
        if (isGoalOwner) {
            if (convertedAmount === 0) {
                if (didCreatorFullyWithdraw)
                    return (
                        <RemoveGoalTabungTemplate
                            title="Remove Tabung"
                            body={`You’ve withdrawn all past contributions to the ${goalTitle} Tabung.`}
                            checklistTitle="This Tabung will be removed for good, which means that all members will:"
                            checklist={[
                                "No longer be able to contribute to this goal",
                                "Get back their contributed portions",
                            ]}
                            description="Group members will be notified once you confirm the removal of this Tabung. The amount you’ve contributed will be transferred back into your account."
                        />
                    );
                else
                    return (
                        <RemoveGoalTabungTemplate
                            title="Remove Tabung"
                            body={`You’ve not made any contributions to the ${goalTitle} Tabung.`}
                            checklistTitle="This Tabung will be removed for good, which means that all members will:"
                            checklist={[
                                "No longer be able to contribute to this goal",
                                "Get back their contributed portions",
                            ]}
                            description="Group members will be notified once you confirm the removal of this Tabung. The amount you’ve contributed will be transferred back into your account."
                        />
                    );
            } else
                return (
                    <RemoveGoalTabungTemplate
                        title="Remove Tabung"
                        body={`You’ve contributed RM ${formattedAmount} in total to the ${goalTitle} Tabung.`}
                        checklistTitle="This Tabung will be removed for good, which means that all members will:"
                        checklist={[
                            "No longer be able to contribute to this goal",
                            "Get back their contributed portions",
                        ]}
                        description="Group members will be notified once you confirm the removal of this Tabung. The amount you’ve contributed will be transferred back into your account."
                    />
                );
        } else {
            if (didCreatorRemoveGoal) {
                if (convertedAmount === 0) {
                    if (didParticipantFullyWithdraw)
                        return (
                            <RemoveGoalTabungTemplate
                                title="Remove Tabung"
                                body={`The ${goalTitle} Tabung has been removed by ${creatorName}.`}
                                checklistTitle="You’ve withdrawn all past contributions towards this Tabung, and will no longer be contributing towards this goal."
                            />
                        );
                    else
                        return (
                            <RemoveGoalTabungTemplate
                                title="Remove Tabung"
                                body={`The ${goalTitle} Tabung has been removed by ${creatorName}.`}
                                checklistTitle="You’ve not made any contributions to the goal, and will no longer be able to contribute towards this group Tabung. "
                            />
                        );
                } else
                    return (
                        <RemoveGoalTabungTemplate
                            title="Remove Tabung"
                            body={`The ${goalTitle} Tabung has been removed by ${creatorName}.`}
                            checklistTitle="This Tabung will be removed for good. This means:"
                            checklist={[
                                "You’ll no longer be saving for this goal",
                                `Your total contributed amount of RM ${formattedAmount} will be transferred back into your account.`,
                            ]}
                        />
                    );
            } else {
                if (convertedAmount === 0) {
                    if (didParticipantFullyWithdraw)
                        return (
                            <RemoveGoalTabungTemplate
                                title="Remove Tabung"
                                body={`You’ve withdrawn all past contributions to the ${goalTitle} Tabung. Leaving this Tabung means you’ll no longer be saving towards this goal.`}
                                description="Group members will be notified once you leave this Tabung."
                            />
                        );
                    else
                        return (
                            <RemoveGoalTabungTemplate
                                title="Remove Tabung"
                                body={`You’ve not made any contributions to the ${goalTitle} Tabung. Leaving this Tabung means you’ll no longer be saving towards this goal. `}
                                description="Group members will be notified once you leave this Tabung."
                            />
                        );
                } else
                    return (
                        <RemoveGoalTabungTemplate
                            title="Remove Tabung"
                            body={`You’ve contributed RM ${formattedAmount} in total to the ${goalTitle} Tabung. Your contributions will be transferred back into your selected account.`}
                            description="Leaving this Tabung means you’ll no longer be saving towards this goal, and group members will be notified accordingly. "
                        />
                    );
            }
        }
    };

    render() {
        const { showRSALoader, showRSAChallengeQuestion, showRSAError, rsaChallengeQuestion } =
            this.state;

        return (
            <ScreenContainer backgroundType="color">
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                                }
                            />
                        }
                        paddingBottom={0}
                        paddingHorizontal={0}
                        useSafeArea
                    >
                        <>
                            <ScrollView>
                                {!this.props.route.params.isGroupGoal
                                    ? this._renderRemoveSoloTabung()
                                    : this._renderRemoveGroupTabung()}
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    onPress={this._onContinueButtonPressed}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            text="Continue"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                    <ChallengeQuestion
                        loader={showRSALoader}
                        display={showRSAChallengeQuestion}
                        displyError={showRSAError}
                        questionText={rsaChallengeQuestion}
                        onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                        onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                    />
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    checklistContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    container: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 36,
    },
    tickImage: {
        height: 16,
        marginRight: 8,
        width: 16,
    },
});

export default withModelContext(GoalRemoveScreen);

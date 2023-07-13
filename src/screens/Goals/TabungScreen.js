import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    Dimensions,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
} from "react-native";

import {
    GOALS_MODULE,
    CREATE_GOALS_SELECT_GOAL_TYPE,
    TABUNG_STACK,
    PENDING_INVITATIONS_SCREEN,
    TABUNG_MAIN,
    TABUNG_DETAILS_SCREEN,
} from "@navigation/navigationConstant";

import TabungListLayout from "@layouts/TabungListLayout";

import ActionButton from "@components/Buttons/ActionButton";
import TabungCard from "@components/Cards/TabungCards/TabungCard";
import TabungLoaderCard from "@components/Cards/TabungCards/TabungLoaderCard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { logEvent } from "@services/analytics";
import { getGoalsList, checkGoalDowntime } from "@services/index";

import { GREY_300, WHITE, WARNING_YELLOW } from "@constants/colors";
import {
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_CREATE_TABUNG,
    FA_TABUNG,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_VIEW_TABUNG,
    ACTIVE_TABUNG,
    ADD_TABUNG,
    CREATE_TABUNG,
    PAST_TABUNG,
    SAVE_WITH_TABUNG,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

export default class TabungScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object,
        setParentTabIndex: PropTypes.func.isRequired,
        onCancelledTabungItemPressed: PropTypes.func.isRequired,
        activeTabungList: PropTypes.array.isRequired,
        pastTabungList: PropTypes.array.isRequired,
        pendingInvitationList: PropTypes.array.isRequired,
        onPullToRefresh: PropTypes.func.isRequired,
        showLoader: PropTypes.bool.isRequired,
        hasActiveTabung: PropTypes.bool.isRequired,
        hasPastTabung: PropTypes.bool.isRequired,
        hasPendingInvitation: PropTypes.bool.isRequired,
        model: PropTypes.object.isRequired,
    };

    state = {
        hidePastTabung: true,
        isDownTime: false,
        downtimeWarningMessage: "",
        downTimeErrorMessage: "",
    };

    componentDidMount() {
        this._updateGoalDowntime();
    }

    _updateGoalDowntime = async () => {
        try {
            const response = await checkGoalDowntime();
            if (response && response.status === 200) {
                const {
                    data: {
                        result: { canCreateGoals, warningMessage, errorMessage },
                    },
                } = response;
                this.setState({
                    isDownTime: !canCreateGoals,
                    downtimeWarningMessage: warningMessage ?? "N/A",
                    downTimeErrorMessage: errorMessage ?? "N/A",
                });
            }
        } catch (error) {
            showErrorToast({ message: error.message });
        }
    };

    _getExistingGoalCount = async () => {
        try {
            const response = await getGoalsList("/goal/exists");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            showErrorToast(error);
            return null;
        }
    };

    _onCreateGoalsButtonPressed = async () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG,
            [FA_TAB_NAME]: FA_TABUNG,
            [FA_ACTION_NAME]: FA_CREATE_TABUNG,
        });

        this._updateGoalDowntime();
        if (this.state.isDownTime) {
            showInfoToast({ message: this.state.downTimeErrorMessage });
            return null;
        }

        const request = await this._getExistingGoalCount();
        if (request) {
            const {
                data: {
                    result: { count, canCreateGoals, errorMessage },
                },
            } = request;
            if (!canCreateGoals) {
                showErrorToast({ message: errorMessage });
            } else if (count > 10)
                showErrorToast({
                    message:
                        "You may only have a maximum of 10 goals at a given time. Please delete a goal before adding another.",
                });
            else
                this.props.navigation.navigate(GOALS_MODULE, {
                    screen: CREATE_GOALS_SELECT_GOAL_TYPE,
                });
        }
    };

    _onPendingInvitationButtonPressed = () => {
        this.props.navigation.navigate(TABUNG_STACK, {
            screen: "TabungMain",
            params: {
                screen: PENDING_INVITATIONS_SCREEN,
                params: { refresh: this._refresh },
            },
        });
    };

    _onTabungCardPressed = ({ id, status }) => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_TABUNG,
            [FA_TAB_NAME]: FA_TABUNG,
            [FA_ACTION_NAME]: FA_VIEW_TABUNG,
        });

        if (status === "CANCELLED_PENDING")
            this.props.onCancelledTabungItemPressed({
                id,
                description:
                    "Your friend has declined to join the Tabung. Would you like to remove it?",
            });
        else this._navigateToTabungDetailsScreen(id);
    };

    _navigateToTabungDetailsScreen = (id) => {
        this.props.navigation.navigate(TABUNG_STACK, {
            screen: TABUNG_MAIN,
            params: {
                screen: TABUNG_DETAILS_SCREEN,
                params: {
                    id,
                    setParentTabIndex: this.props.setParentTabIndex,
                },
            },
        });
    };

    _onHidePastTabungTextButtonPressed = () => this.setState({ hidePastTabung: false });

    _renderCreateTabungButton = () => (
        <View style={styles.actionButtonContainer}>
            <View style={[styles.createButton, styles.actionButtonShadow]}>
                <ActionButton
                    componentCenter={
                        <View style={styles.actionButtonCenterComponentContainer}>
                            <Image style={styles.actionButtonImage} source={Assets.ic_Plus} />
                            <Typo
                                text={CREATE_TABUNG}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                            />
                        </View>
                    }
                    backgroundColor={WHITE}
                    width={176}
                    height={40}
                    onPress={this._onCreateGoalsButtonPressed}
                />
            </View>
        </View>
    );

    _renderPendingInvitationButton = () => (
        <ActionButton
            borderRadius={8}
            fullWidth
            height={41}
            backgroundColor="#fbe479"
            onPress={this._onPendingInvitationButtonPressed}
            componentCenter={
                <Typo
                    text={`You have ${this.props.pendingInvitationList.length} pending invitations.`}
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    color="#645b30"
                />
            }
        />
    );

    _onPullToRefresh = () => {
        this._updateGoalDowntime();
        this.props.onPullToRefresh();
    };

    _renderTabungCard = ({
        name,
        imageUrl,
        participants,
        boosterCount,
        duration,
        formattedSaveSoFar,
        formattedTotalAmount,
        status,
        deletedDate,
        id,
        percentage,
    }) => (
        <TabungCard
            title={name}
            imageUrl={imageUrl}
            imageUrlToken={`bearer ${this.props.model?.token ?? ""}`}
            avatarsData={participants}
            boosterCount={`${boosterCount}`}
            timeLeft={duration}
            contributedAmountString={formattedSaveSoFar}
            totalAmountString={formattedTotalAmount}
            status={status}
            onTabungCardPressed={this._onTabungCardPressed}
            isDeleted={deletedDate ? true : false}
            id={id}
            contributedAmountPercentage={percentage?.contribPercentage ?? 0}
            boosterAmountPercentage={percentage?.boosterPercentage ?? 0}
        />
    );

    _renderActiveTabungCards = (activeTabungList: []) =>
        activeTabungList.map((item, index) => (
            <React.Fragment key={`${item.name}-${index}`}>
                {this._renderTabungCard(item)}
                {index !== activeTabungList.length - 1 && <SpaceFiller height={16} width={1} />}
            </React.Fragment>
        ));

    _renderPastTabungCards = (pastTabungList: []) =>
        pastTabungList.map((item, index) => (
            <React.Fragment key={`${item.name}-${index}`}>
                {this._renderTabungCard(item)}
                {index !== pastTabungList.length - 1 && <SpaceFiller height={16} width={1} />}
            </React.Fragment>
        ));

    renderWarning = () => {
        return (
            <View style={styles.warningContainer}>
                <Image style={styles.alertIcon} source={Assets.icWarning} />
                <Typo
                    text={this.state.downtimeWarningMessage}
                    fontWeight="600"
                    textAlign="left"
                    fontSize={12}
                    lineHeight={16}
                    style={styles.warningText}
                />
            </View>
        );
    };

    render() {
        const {
            showLoader,
            activeTabungList,
            pastTabungList,
            hasActiveTabung,
            hasPastTabung,
            hasPendingInvitation,
        } = this.props;

        if (showLoader)
            return (
                <View style={styles.container}>
                    <ShimmerPlaceHolder style={styles.loaderNotification} />
                    <TabungListLayout
                        titleComponent={
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loaderTitle}
                            />
                        }
                    >
                        <TabungLoaderCard />
                    </TabungListLayout>
                </View>
            );

        if (hasActiveTabung && !hasPastTabung && !showLoader)
            return (
                <View style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={showLoader}
                                onRefresh={this._onPullToRefresh}
                            />
                        }
                    >
                        {this.state.isDownTime && this.renderWarning()}
                        {hasPendingInvitation && this._renderPendingInvitationButton()}
                        <TabungListLayout
                            titleComponent={
                                <Typo
                                    text={ACTIVE_TABUNG}
                                    fontSize={16}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            }
                        >
                            <React.Fragment>
                                {this._renderActiveTabungCards(activeTabungList)}
                                <SpaceFiller height={98} width={1} />
                            </React.Fragment>
                        </TabungListLayout>
                    </ScrollView>
                    {this._renderCreateTabungButton()}
                </View>
            );
        else if (!hasActiveTabung && hasPastTabung && !showLoader)
            return (
                <React.Fragment>
                    <View style={styles.container}>
                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={showLoader}
                                    onRefresh={this._onPullToRefresh}
                                />
                            }
                        >
                            {this.state.isDownTime && this.renderWarning()}
                            {hasPendingInvitation && this._renderPendingInvitationButton()}
                            <TabungListLayout
                                titleComponent={
                                    <Typo
                                        text={PAST_TABUNG}
                                        fontSize={16}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                            >
                                <React.Fragment>
                                    {this._renderPastTabungCards(pastTabungList)}
                                    <SpaceFiller height={98} width={1} />
                                </React.Fragment>
                            </TabungListLayout>
                        </ScrollView>
                    </View>
                    {this._renderCreateTabungButton()}
                </React.Fragment>
            );
        else if (hasActiveTabung && hasPastTabung && !showLoader)
            return (
                <View style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={showLoader}
                                onRefresh={this._onPullToRefresh}
                            />
                        }
                    >
                        {this.state.isDownTime && this.renderWarning()}
                        {hasPendingInvitation && this._renderPendingInvitationButton()}
                        <TabungListLayout
                            titleComponent={
                                <Typo
                                    text={ACTIVE_TABUNG}
                                    fontSize={16}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            }
                        >
                            <React.Fragment>
                                {this._renderActiveTabungCards(activeTabungList)}
                                <SpaceFiller height={20} width={1} />
                            </React.Fragment>
                        </TabungListLayout>
                        {this.state.hidePastTabung ? (
                            <React.Fragment>
                                <TouchableOpacity onPress={this._onHidePastTabungTextButtonPressed}>
                                    <Typo
                                        text={`View Past Tabung (${pastTabungList.length})`}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color="#4a90e2"
                                    />
                                </TouchableOpacity>
                                <SpaceFiller height={98} width={1} />
                            </React.Fragment>
                        ) : (
                            <TabungListLayout
                                titleComponent={
                                    <Typo
                                        text={PAST_TABUNG}
                                        fontSize={16}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                            >
                                <React.Fragment>
                                    {this._renderPastTabungCards(pastTabungList)}
                                    <SpaceFiller height={98} width={1} />
                                </React.Fragment>
                            </TabungListLayout>
                        )}
                    </ScrollView>
                    {this._renderCreateTabungButton()}
                </View>
            );
        else if (!hasActiveTabung && !hasPastTabung && !showLoader && hasPendingInvitation)
            return (
                <View style={styles.container}>
                    {this.state.isDownTime && this.renderWarning()}
                    {hasPendingInvitation && this._renderPendingInvitationButton()}
                    {this._renderCreateTabungButton()}
                </View>
            );
        else
            return (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={showLoader} onRefresh={this._onPullToRefresh} />
                    }
                    style={styles.scrollView}
                >
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyWarningContainer}>
                            {this.state.isDownTime && this.renderWarning()}
                            {hasPendingInvitation && this._renderPendingInvitationButton()}
                        </View>
                        <View style={styles.emptyStateContainer}>
                            <View style={styles.emptyStateActionArea}>
                                <Typo
                                    text={SAVE_WITH_TABUNG}
                                    fontSize={18}
                                    lineHeight={32}
                                    fontWeight="bold"
                                />
                                <View style={styles.emptyStateDescriptionContainer}>
                                    <Typo text={ADD_TABUNG} fontSize={12} lineHeight={18} />
                                </View>
                                <ActionButton
                                    style={styles.emptyCreateActionButton}
                                    componentCenter={
                                        <Typo
                                            text={CREATE_TABUNG}
                                            fontSize={14}
                                            lineHeight={21}
                                            fontWeight="600"
                                        />
                                    }
                                    onPress={this._onCreateGoalsButtonPressed}
                                />
                            </View>
                            <View style={styles.emptyStateIllustrationImageContainer}>
                                <Image
                                    source={Assets.dashboardTabungEmptyBg}
                                    style={styles.emptyStateIllustrationImage}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            );
    }
}

const styles = StyleSheet.create({
    actionButtonCenterComponentContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 4,
    },
    actionButtonContainer: {
        alignItems: "center",
        bottom: 20,
        justifyContent: "center",
        position: "absolute",
        width: Dimensions.get("window").width,
    },
    actionButtonImage: {
        height: 24,
        width: 24,
    },
    actionButtonShadow: {
        ...getShadow({}),
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    createButton: {
        backgroundColor: WHITE,
        borderRadius: 20,
        height: 40,
        width: 176,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    emptyStateActionArea: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 36,
        zIndex: 1,
    },
    emptyStateContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 36,
    },
    emptyStateDescriptionContainer: {
        marginBottom: 20,
        marginTop: 8,
        width: 327,
    },
    emptyStateIllustrationImage: {
        height: "100%",
        width: "100%",
    },
    emptyStateIllustrationImageContainer: {
        bottom: 0,
        height: Dimensions.get("window").height * 0.5,
        width: Dimensions.get("window").width,
        zIndex: 0,
    },
    emptyWarningContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    emptyCreateActionButton: {
        width: 176,
        height: 40,
    },
    loaderNotification: {
        backgroundColor: GREY_300,
        borderRadius: 8,
        height: 41,
        width: "100%",
    },
    loaderTitle: {
        backgroundColor: GREY_300,
        borderRadius: 4,
        height: 8,
        width: 120,
    },
    scrollView: { flexGrow: 1 },
    alertIcon: {
        marginTop: 5,
        marginRight: 10,
    },
    warningContainer: {
        backgroundColor: WARNING_YELLOW,
        borderRadius: 8,
        flexDirection: "row",
        marginTop: 10,
        padding: 15,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    warningText: {
        flex: 1,
    },
});

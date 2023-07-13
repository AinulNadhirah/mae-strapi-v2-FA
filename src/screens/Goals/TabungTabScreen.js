import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import {
    errorToastProp,
    showErrorToast,
    showSuccessToast,
    successToastProp,
} from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { getGoalsList, goalBoosterPostServiceWrapper, invokeL2 } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import {
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_TABUNG,
    BOOSTERS,
} from "@constants/strings";

import { showGoalDowntimeError } from "@utils";
import { ErrorLogger } from "@utils/logs";

import BoostersScreen from "./Boosters";
import TabungScreen from "./TabungScreen";

class TabungTabScreen extends React.Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        updateModel: PropTypes.func.isRequired,
        getModel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            source: props.route.params?.source ?? "",
            showDualOptionsPopUp: false,
            dualOptionsPopUpTitle: "",
            dualOptionsPopUpDescription: "",
            dualOptionsPopUpPrimaryActionsTitle: "",
            dualOptionsPopUpPrimaryActions: () => { },
            dualOptionsPopUpSecondaryActionsTitle: "",
            dualOptionsPopUpSecondaryActions: () => { },
            activeTabungList: [],
            pastTabungList: [],
            pendingInvitationList: [],
            showTabungListLoader: true,
            hasActiveTabung: false,
            hasPastTabung: false,
            hasPendingInvitation: false,
            isInitialRender: true,
        };
        this.toastRef = {};
    }

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG,
            [FA_TAB_NAME]: FA_TABUNG,
        });
        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });

        this._setTabIndex(this.props.route.params?.index ?? 0);
        this._initTabung();
        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            if (!this.state.isInitialRender) {
                this._updateTabPosition();
                this._initTabung();
            }
        });
        this._updateInitialRenderFlag();
        this.props.navigation.setParams({
            index: null,
        });
    }

    componentWillUnmount() {
        this._unsubscribeFocusListener();
    }

    _updateInitialRenderFlag = () =>
        this.setState({
            isInitialRender: false,
        });

    onCancelLogin = () => this.props.navigation.goBack();

    _updateTabPosition = () => {
        const index = this.props.route.params?.index ?? -1;
        if (index >= 0) {
            this._setTabIndex(index);
            this.props.navigation.setParams({
                index: null,
            });
        }
    };

    _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _requestL2Permission = async () => {
        try {
            const response = await invokeL2(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _initTabung = async () => {
        const request = await this._requestL2Permission();
        if (!request) {
            this.props.navigation.navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Dashboard",
                },
            });
            return;
        }

        const tabungCountRequest = await this._getExistingGoalCount();
        if (tabungCountRequest?.data?.result?.goalParticipantCount > 0) {
            const [activeTabungRequest, pastTabungRequest, pendingInvitationRequest] =
                await new Promise.all([
                    this._getActiveTabung(),
                    this._getPastTabung(),
                    this._getPendingInvitationList(),
                ]);
            if (!activeTabungRequest || !pastTabungRequest || !pendingInvitationRequest) {
                this._promptServerError();
                return;
            }
            this.setState({
                showTabungListLoader: false,
                activeTabungList: activeTabungRequest?.data?.resultList ?? [],
                pastTabungList: pastTabungRequest?.data?.resultList ?? [],
                pendingInvitationList: pendingInvitationRequest?.data?.resultList ?? [],
            });
        } else {
            this.setState({
                showTabungListLoader: false,
                activeTabungList: [],
                pastTabungList: [],
            });
        }
    };

    _getExistingGoalCount = async () => {
        try {
            const response = await getGoalsList("/goal/exists");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _getActiveTabung = async () => {
        try {
            const response = await getGoalsList("/goal");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _getPastTabung = async () => {
        try {
            const response = await getGoalsList("/goal/remove/list");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _getPendingInvitationList = async () => {
        try {
            const response = await getGoalsList("/goal/participants/pending");
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _deleteTabungFromCancelledList = async (id) => {
        try {
            const response = await goalBoosterPostServiceWrapper(
                `/goal/remove/dashboard?goalId=${id}`,
                null
            );
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _promptServerError = () =>
        showErrorToast({
            ...errorToastProp({
                message:
                    "Your request could not be processed at this time. Please try again later.",
            }),
        });

    _onTabungListPullToRefresh = () => {
        this.setState({ showTabungListLoader: true });
        this._initTabung();
    };

    _setTabIndex = (index) =>
        this.setState({
            index,
        });

    _onHeaderBackButtonPressed = () => {
        const { source } = this.state;
        if (source) NavigationService.navigateToModule(source);
        else if (this.props.route?.params?.redirect) {
            this.props.navigation.navigate(
                this.props.route?.params?.redirect.screen,
                this.props.route?.params?.redirect.params
            );
        } else this.props.navigation.goBack();
    };

    _onTabIndexChanged = (index) => {
        this.setState({ index });

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG,
            [FA_TAB_NAME]: index ? BOOSTERS : FA_TABUNG,
        });
    };

    _onTabungItemPressed = ({ id, description }) =>
        this.setState({
            showDualOptionsPopUp: true,
            dualOptionsPopUpTitle: "Tabung Cancelled",
            dualOptionsPopUpDescription: description,
            dualOptionsPopUpPrimaryActionsTitle: "Remove",
            dualOptionsPopUpPrimaryActions: () => this._deleteCancelledTabung(id),
            dualOptionsPopUpSecondaryActionsTitle: "Keep",
            dualOptionsPopUpSecondaryActions: this._onDualOptionsPopUpDismissed,
        });

    _deleteCancelledTabung = async (id) => {
        this._onDualOptionsPopUpDismissed();
        // check and show error popup if downtime
        const isDownTime = await showGoalDowntimeError();
        if (!isDownTime) {
            const request = await this._deleteTabungFromCancelledList(id);
            if (request) {
                await this._initTabung();
                showSuccessToast({
                    ...successToastProp({
                        message: "Your tabung is succesfully deleted.",
                    }),
                });
            } else {
                showErrorToast({
                    ...errorToastProp({
                        message: "Unable to delete your tabung. Please try again later.",
                    }),
                });
            }
        }
    };

    _onDualOptionsPopUpDismissed = () =>
        this.setState({
            showDualOptionsPopUp: false,
            dualOptionsPopUpTitle: "",
            dualOptionsPopUpDescription: "",
            dualOptionsPopUpPrimaryActionsTitle: "",
            dualOptionsPopUpPrimaryActions: () => { },
            dualOptionsPopUpSecondaryActionsTitle: "",
            dualOptionsPopUpSecondaryActions: () => { },
        });

    render() {
        const { navigation, getModel } = this.props;
        const {
            index,
            showDualOptionsPopUp,
            dualOptionsPopUpTitle,
            dualOptionsPopUpDescription,
            dualOptionsPopUpPrimaryActionsTitle,
            dualOptionsPopUpPrimaryActions,
            dualOptionsPopUpSecondaryActionsTitle,
            dualOptionsPopUpSecondaryActions,
            activeTabungList,
            pastTabungList,
            pendingInvitationList,
            showTabungListLoader,
        } = this.state;

        const model = getModel("auth");
        const hasActiveTabung = activeTabungList.length > 0;
        const hasPastTabung = pastTabungList.length > 0;
        const hasPendingInvitation = pendingInvitationList.length > 0;

        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Tabung"
                                    />
                                }
                                headerLeftElement={
                                    <View style={styles.headerCloseButtonContainer}>
                                        <HeaderBackButton
                                            onPress={this._onHeaderBackButtonPressed}
                                        />
                                    </View>
                                }
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={16}
                                horizontalPaddingCustomRightValue={16}
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        useSafeArea
                        neverForceInset={["bottom"]}
                    >
                        <TabView
                            defaultTabIndex={index}
                            onTabChange={this._onTabIndexChanged}
                            titles={["TABUNG", "BOOSTERS"]}
                            screens={[
                                <TabungScreen
                                    key="1"
                                    navigation={navigation}
                                    setParentTabIndex={this._setTabIndex}
                                    onCancelledTabungItemPressed={this._onTabungItemPressed}
                                    activeTabungList={activeTabungList}
                                    pastTabungList={pastTabungList}
                                    pendingInvitationList={pendingInvitationList}
                                    onPullToRefresh={this._onTabungListPullToRefresh}
                                    showLoader={showTabungListLoader}
                                    hasActiveTabung={hasActiveTabung}
                                    hasPastTabung={hasPastTabung}
                                    hasPendingInvitation={hasPendingInvitation}
                                    model={model}
                                />,
                                <BoostersScreen key="2" />,
                            ]}
                        />
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={showDualOptionsPopUp}
                    title={dualOptionsPopUpTitle}
                    description={dualOptionsPopUpDescription}
                    onClose={this._onDualOptionsPopUpDismissed}
                    primaryAction={{
                        text: dualOptionsPopUpPrimaryActionsTitle,
                        onPress: dualOptionsPopUpPrimaryActions,
                    }}
                    secondaryAction={{
                        text: dualOptionsPopUpSecondaryActionsTitle,
                        onPress: dualOptionsPopUpSecondaryActions,
                    }}
                />
            </React.Fragment>
        );
    }
}

export default withModelContext(TabungTabScreen);

const styles = StyleSheet.create({
    headerCloseButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
});

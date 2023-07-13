import AsyncStorage from "@react-native-community/async-storage";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Modal from "react-native-modal";

import {
    MAE_MODULE_STACK,
    MAE_ACC_DASHBOARD,
    BANKINGV2_MODULE,
    CARDS_LIST,
    SECURE_SWITCH_STACK,
    SECURE_SWITCH_LANDING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import { ContactBankDialog } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HighlightOverlay from "@components/Modals/HighlightOverlay";
import PopupBanner from "@components/PopupBanner";
import Browser from "@components/Specials/Browser";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { TopMenu } from "@components/TopMenu";

import { withModelContext } from "@context";

import { GABanking, GABankingApplePay } from "@services/analytics/analyticsBanking";

import { MEDIUM_GREY } from "@constants/colors";
import {
    SECURE_SWITCH,
    KILL_SWITCH,
    SS_PROMPTER_DESC,
    GOT_IT,
    CONTACT_BANK,
} from "@constants/strings";

import { contactBankcall } from "@utils/dataModel/utility";

import BankingL1Screen from "./BankingL1Screen";

class BankingDashboardScreen extends Component {
    state = {
        activeTabIndex: this.props.route?.params?.index ?? 0,
        showMenu: false,
        showContactBankModal: false,
        showBrowser: false,
        browserUrl: "",
        browserTitle: "",
        redirectScreen: this.props.route?.params?.screen ?? null,
        applePayPrompter: {},
        isPopupVisible: false,
        isScheduled: false,
        prompterPosition: { x: 0, y: 0, h: 0, w: 0 },
        showHighlight: false,
    };

    tabs = [
        { acctTypeName: "Accounts" },
        { acctTypeName: "Cards" },
        { acctTypeName: "Fixed Deposits" },
        { acctTypeName: "Loans" },
        { acctTypeName: "Wealth" },
    ];

    misc = this.props.getModel("misc");
    showSecureSwitch = this.misc.isShowSecureSwitch;
    secureSwitchPrompter = this.misc.isSecureSwitchCampaign;

    componentDidMount = () => {
        // By default, log "Accounts" tab when this screen mounts (when tab selected)
        const paramsTabName = this.tabs[0].acctTypeName;
        GABanking._analyticsLogCurrentTab(paramsTabName);

        // const { getModel } = this.props;
        // const { isApplePayEnable, isEligibleDevice } = getModel("applePay");
        // if (isApplePayEnable && isEligibleDevice && Platform.OS === "ios") {
        //     this._initApplePayPrompter();
        // }

        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            console.log("[BankingDashboardScreen] _unsubscribeFocusListener");
            this.setShowHighlight();
            this._updateTabPosition();
            this._resetNavParams();
        });
    };

    componentWillUnmount() {
        this._unsubscribeFocusListener();
    }

    getMenuArray = () => {
        const menuArray = [
            ...(this.showSecureSwitch
                ? [
                      {
                          menuLabel: KILL_SWITCH,
                          menuParam: "secureSwitch",
                      },
                  ]
                : []),
            {
                menuLabel: CONTACT_BANK,
                menuParam: "contact",
            },
        ];

        return menuArray;
    };

    setShowHighlight = async () => {
        //to display feature highlight / prompter
        const showHighlightLocal = (await AsyncStorage.getItem("isHighlightShown")) ?? "true";
        const show =
            JSON.parse(showHighlightLocal) && this.secureSwitchPrompter && this.showSecureSwitch;
        this.setState({ showHighlight: show });
    };

    handleTabChange = (index) => {
        this.setState({ activeTabIndex: index });

        console.log("[BankingDashboardScreen][handleTabChange] activeTabIndex: " + index);

        // Every time tab changes, report current tab to analytics
        const paramsTabName = this.tabs[index].acctTypeName;
        GABanking._analyticsLogCurrentTab(paramsTabName);
    };

    _resetNavParams = () => {
        console.log("[BankingDashboardScreen][_resetNavParams]");
        this.props.navigation.setParams({
            index: null,
            screen: null,
        });
    };

    _updateTabPosition = () => {
        const index = this.props.route?.params?.index ?? -1;

        console.log("[BankingDashboardScreen] _updateTabPosition index: " + index);
        if (index >= 0) {
            this._setTabIndex(index);
            this._resetNavParams();

            // Log to analytics of correct tab shown
            const paramsTabName = this.tabs[index].acctTypeName;
            GABanking._analyticsLogCurrentTab(paramsTabName);
        }
    };

    _setTabIndex = (index) =>
        this.setState({
            activeTabIndex: index,
        });

    _toggleMenu = () => {
        const { activeTabIndex, showMenu } = this.state;
        if (!showMenu) {
            const paramsTabName = this.tabs[activeTabIndex].acctTypeName;
            GABanking.showMenu(paramsTabName);
        }
        this.setState({ showMenu: !showMenu });
    };

    _setUpMAE = () => {
        console.log("_setUpMAE");

        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: MAE_ACC_DASHBOARD,
        });
    };

    _handleTopMenuItemPress = async (param) => {
        switch (param) {
            case "contact": {
                GABanking.pressContactBank();
                this.setState({ showMenu: false });
                setTimeout(() => this.setState({ showContactBankModal: true }), 0);
                break;
            }
            case "secureSwitch": {
                this.props.navigation.navigate(SECURE_SWITCH_STACK, {
                    screen: SECURE_SWITCH_LANDING,
                    params: { fromModule: "Tab", fromScreen: "Maybank2u" },
                });
            }
        }
    };

    // HANDLE APPLE PAY PROMPTER
    _navigateToAppleWallet = () => {
        GABankingApplePay.addCardNowApplePay();
        this.setState({
            isPopupVisible: false,
        });
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: CARDS_LIST,
            params: {
                entryPoint: "BANKINGDASHBOARDSCREEN",
            },
        });
    };

    _popupOnClose = () => {
        GABankingApplePay.nextTimeCardApplePay();
        this.setState({
            isPopupVisible: false,
        });
    };

    // CONTACT BANK
    _onPressCallNow = () => {
        this.setState({ showContactBankModal: false });
        contactBankcall("1300886688");
    };

    _onDismissCallNow = () => {
        this.setState({ showContactBankModal: false });
    };

    // IN-APP BROWSER
    _closeBrowser = () => this.setState({ showBrowser: false, browserTitle: "", browserUrl: "" });

    _openBrowser = (title, url) => {
        this.setState({
            showBrowser: true,
            browserTitle: title,
            browserUrl: url,
        });
    };

    // APPLE PAY
    showPopup = (data) => {
        console.log("showPopup");
        if (data?.isPopupVisible) {
            GABankingApplePay.onModalPopUpApplePay();
        }
        this.setState({
            isScheduled: data?.isScheduled,
            isPopupVisible: data?.isPopupVisible,
            applePayPrompter: data?.applePayPrompter,
        });
    };

    layoutCallback = (event) => {
        //to retrive position of component - hightlightOverlay
        const { x, y, height, width } = event.nativeEvent.layout;
        this.setState({
            prompterPosition: { x, y, h: height, w: width },
        });
    };

    onCloseCallback = async () => {
        await AsyncStorage.setItem("isHighlightShown", "false");
        this.setState({
            showHighlight: false,
        });
    };

    render() {
        const {
            showContactBankModal,
            showMenu,
            activeTabIndex,
            showBrowser,
            browserTitle,
            browserUrl,
            isPopupVisible,
            isScheduled,
            applePayPrompter,
            redirectScreen,
            prompterPosition,
            showHighlight,
        } = this.state;

        const { navigation } = this.props;

        const screens = this.tabs.map((item, index) => {
            return (
                <>
                    <BankingL1Screen
                        index={index}
                        navigation={navigation}
                        tabName={item.acctTypeName}
                        activeTabIndex={activeTabIndex}
                        key={item.acctTypeName}
                        openBrowser={this._openBrowser}
                        setParentTabIndex={this._setTabIndex}
                        redirectScreen={this.props.route?.params?.screen ?? null}
                        resetNavParams={this._resetNavParams}
                        showPopup={this.showPopup}
                    />
                </>
            );
        });

        const titles = this.tabs.map((item) => {
            return item.acctTypeName;
        });

        return (
            <React.Fragment>
                <HighlightOverlay
                    highlightPosition={prompterPosition}
                    showHighlight={showHighlight}
                    onClose={this.onCloseCallback}
                    onNext={this.onCloseCallback}
                    title={KILL_SWITCH}
                    description={SS_PROMPTER_DESC}
                    primaryBtn={GOT_IT}
                >
                    <ScreenContainer
                        backgroundType="color"
                        showOverlay={showBrowser}
                        backgroundColor={MEDIUM_GREY}
                    >
                        <React.Fragment>
                            <ScreenLayout
                                paddingBottom={0}
                                paddingTop={0}
                                paddingHorizontal={0}
                                neverForceInset={["bottom"]}
                                useSafeArea
                                header={
                                    <HeaderLayout
                                        horizontalPaddingMode="custom"
                                        horizontalPaddingCustomLeftValue={16}
                                        horizontalPaddingCustomRightValue={16}
                                        headerCenterElement={
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={19}
                                                text="Maybank2u"
                                            />
                                        }
                                        headerRightElement={
                                            <HeaderDotDotDotButton onPress={this._toggleMenu} />
                                        }
                                        rightLayoutCallback={this.layoutCallback}
                                    />
                                }
                            >
                                <>
                                    {this.state.activeTabIndex >= 0 ? (
                                        <TabView
                                            defaultTabIndex={activeTabIndex}
                                            titles={titles}
                                            onTabChange={this.handleTabChange}
                                            scrollToEnd={false}
                                            screens={screens}
                                        />
                                    ) : null}
                                </>
                            </ScreenLayout>

                            {/* In-app browser for credit card application */}
                            <Modal
                                isVisible={showBrowser}
                                hasBackdrop={false}
                                useNativeDriver
                                style={{ margin: 0 }}
                            >
                                <Browser
                                    source={{ uri: browserUrl }}
                                    title={browserTitle}
                                    onCloseButtonPressed={this._closeBrowser}
                                />
                            </Modal>
                        </React.Fragment>
                    </ScreenContainer>
                    <TopMenu
                        showTopMenu={showMenu}
                        onClose={this._toggleMenu}
                        navigation={navigation}
                        menuArray={this.getMenuArray()}
                        onItemPress={this._handleTopMenuItemPress}
                    />

                    {activeTabIndex === 1 && isScheduled && (
                        <PopupBanner
                            visible={isPopupVisible}
                            hideCloseButton={true}
                            banner={applePayPrompter?.url}
                            title={applePayPrompter?.title}
                            description={applePayPrompter?.description}
                            primaryAction={{
                                text: applePayPrompter?.cta?.[0]?.title,
                                onPress: this._navigateToAppleWallet,
                            }}
                            textLink={{
                                text: applePayPrompter?.cta?.[1]?.title,
                                onPress: this._popupOnClose,
                            }}
                        />
                    )}
                    {/* Contact Bank modal */}
                    {showContactBankModal && (
                        <ContactBankDialog
                            onClose={this._onDismissCallNow}
                            onParam1Press={this._onPressCallNow}
                        />
                    )}
                </HighlightOverlay>
            </React.Fragment>
        );
    }
}

BankingDashboardScreen.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
        setParams: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            index: PropTypes.number,
            screen: PropTypes.any,
        }),
    }),
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(BankingDashboardScreen);

import moment from "moment";
import PropTypes from "prop-types";
import * as React from "react";
import { Keyboard } from "react-native";

import TransferBakongTab from "@screens/Wallet/Transfer/TransferBakongTab";

import {
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    SELF,
    OTHERS,
    DUITNOW,
    ASNB,
    TABUNG_HAJI,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    OVERSEAS,
    FA_DASHBOARD,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import TransferASNBTab from "./TransferASNBTab";
import TransferDuitNowFavScreen from "./TransferDuitNowFavScreen";
import TransferOtherAccounts from "./TransferOtherAccounts";
import TransferOwnAccount from "./TransferOwnAccount";
import TransferTabungHajiTab from "./TransferTabungHajiTab";

const TRANSFER_ASNB_TAB_KEY = 3;
const TRANSFER_TH_TAB_KEY = 4;
const TRANSFER_OVERSEAS = 5;

class TransferTabScreen extends React.Component {
    /***
     * constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            rand: 0,
            acctNo: "",
            activeTabIndex: this.props.route?.params?.index ?? 0,
            screenDate: {},
            showLoaderModal: true,
            firstTimeLoad: true,
            showContent: false,
            showTab: true,
        };
        //Add password model on close button click listener
        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    /***
     * componentDidMount
     */
    async componentDidMount() {
        //Load tab view after some delay because when enter this screen need to
        //show loader and decide which tab to show based on own account api response
        setTimeout(() => {
            this.setState({ showContent: true });
        }, 100);
        // AppEventsLogger.logEvent("TransferTabScreen");

        // function to set active tab index if navigated through deeplink.
        if (this.props.route.params.index != null) {
            this._setActiveTabIndex(this.props.route.params.index, true);
        }

        console.log("[TransferTabScreen] >> [componentDidMount] : ", this.state.showLoaderModal);
        //Load Screen data
        this._updateDataInScreen();
        this._handleNewASNBTransferEntryPoint();
        this._handleNewTabungHajiTransferEntryPoint();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            //Load Screen data on every time come back to this screen
            console.log(
                "[TransferTabScreen] >> [componentDidMount] focusSubscription : ",
                this.state.showLoaderModal
            );
            Keyboard.dismiss();
            this._invokeL3();
            this._updateDataInScreenAlways();
            this._handleNewASNBTransferEntryPoint();
            this._handleNewTabungHajiTransferEntryPoint();
        });
        this.analyticsLogCurrentTab(this.state.activeTabIndex);
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription) {
            this.focusSubscription();
        }
    }

    _handleNewASNBTransferEntryPoint = () => {
        if (this.props?.route?.params?.isNewASNBTransferEntryPoint)
            this._setActiveTabIndex(TRANSFER_ASNB_TAB_KEY, true);
    };

    _handleNewTabungHajiTransferEntryPoint = () => {
        if (this.props?.route?.params?.isNewTabungHajiTransferEntryPoint)
            this._setActiveTabIndex(TRANSFER_TH_TAB_KEY, true);
    };

    _handleOverseasDown = () => {
        this._setActiveTabIndex(TRANSFER_OVERSEAS, true);
    };

    /***
     * _updateDataInScreenAlways
     * Load Screen data on every time come back to this screen
     */
    _updateDataInScreenAlways = async () => {
        console.log("[TransferTabScreen] >> [_updateDataInScreenAlways] : ");
        // const activeTabIndex = this.props.route.params?.index ?? 0;
        const { activeTabIndex } = this.state;
        console.log(
            "[TransferTabScreen] >> [_updateDataInScreenAlways] activeTabIndex : ",
            activeTabIndex
        );
        this.setState({ showLoaderModal: true, firstTimeLoad: true }, () => {
            this._setActiveTabIndex(activeTabIndex, true);
        });
    };

    /***
     * _invokeL3
     * Check and invoke L3 Password for Transfer Flow always check its L3
     */
    _invokeL3 = async () => {
        console.log("[TransferTabScreen] >> [invokeL3] : ");

        try {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code != 0) {
                return;
            }
        } catch (error) {
            console.log("[TransferTabScreen] >> [_InvokeL3] Error, ", error);
            if (error.status === "nonetwork") {
                this.setState({ showLoaderModal: false });
                this.props.navigation.goBack();
                // showErrorToast({ message: "NO NETWORK" });
            } else {
                return;
            }
        }
    };

    /***
     * onCancelLogin
     * When user click close button on Password pop up go back to previous screen
     */
    onCancelLogin = () => {
        console.log("onCancelLogin:");
        this.props.navigation.goBack();
    };

    /***
     * _updateDataInScreen
     * Load Screen data on every time come back to this screen
     */
    _updateDataInScreen = async () => {
        Keyboard.dismiss();
        const { getModel, updateModel } = this.props;
        const { primaryAccount } = getModel("wallet");

        // From primary account
        const acctNo1 = primaryAccount?.number ?? null;
        console.log("TransferTabScreen _updateDataInScreen ==>  FromAccount ==> ", acctNo1);
        const acctNo = this.props.route.params?.acctNo ?? acctNo1;
        console.log("TransferTabScreen FromAccount ==> ", acctNo);
        const screenDate = this.props.route.params?.screenDate ?? null;
        console.log("TransferTabScreen FromAccount ==> ", screenDate);
        this.setState({ acctNo: acctNo, screenDate: screenDate, showLoaderModal: true });

        let routeFrom = screenDate?.routeFrom ?? "Dashboard";

        await updateModel({
            transfer: {
                routeFrom: routeFrom,
            },
        });

        console.log(this.state.transferData);
    };

    /***
     * _onBackPress
     * Handle screen back button
     */
    _onBackPress = () => {
        console.log("_onBackPress");
        const transferParams = this.props.route.params?.transferParams ?? {};
        const screenDate = this.props.route.params?.screenDate ?? null;

        console.log("[TransferTabScreen] >> [_onBackPress] transferParams ", transferParams);
        console.log("[TransferTabScreen] >> [_onBackPress] screenDate ", screenDate);
        console.log("_onBackPress screenDate : ", screenDate);
        let route = screenDate
            ? screenDate.routeFrom
            : transferParams.routeFrom
            ? transferParams.routeFrom
            : "Dashboard";
        console.log("route ", route);

        if (route === "WalletMainDashboard") {
            // navigate to home wallet section
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: "Dashboard",
            });
        } else if (route === "AccountDetails") {
            // navigate to banking particular account detail screen
            const prevData = this.props.route.params?.prevData ?? null;
            console.log("_onBackPress prevData : ", prevData);
            console.log("_onBackPress ACCOUNT_DETAILS_SCREEN : ", ACCOUNT_DETAILS_SCREEN);
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
                params: {
                    prevData: prevData,
                },
            });
        } else if (route === "SortToWin" || route === "TapTrackWin") {
            // navigate to home wallet section
            this.props.navigation.navigate("GameStack", {
                screen: "Dashboard",
            });
        } else if (route === "ASNBTransactionHistoryScreen") {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: "ASNBTransactionHistoryScreen",
            });
        } else if (route === "TabungHajiTransactionHistoryScreen") {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: "TabungHajiTransactionHistoryScreen",
            });
        } else if (route === "MerdekaScreen") {
            this.props.navigation.navigate("MerdekaStack", {
                screen: "MerdekaScreen",
            });
        } else {
            // navigate to home screen by default
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: DASHBOARD,
            });
        }
    };

    /***
     * handleTabChange
     * Handle Tab View tab change
     */
    handleTabChange = (activeTabIndex) => {
        console.log(
            "[TransferTabScreen] >> [handleTabChange] >> activeTabIndex: " + activeTabIndex
        );
        if (activeTabIndex <= 5) {
            this.setState({ activeTabIndex }, () => {
                this.analyticsLogCurrentTab(activeTabIndex);
                this._showOverlay(false);
                this._toggleTab(false);
            });
        }
    };

    /***
     * _showOverlay
     * Toggle Screen Overlay
     */
    _showOverlay = (show) => {
        console.log("[TransferTabScreen] >> [_showOverlay] >> show: ", show);
        setTimeout(() => {
            this.setState({ showLoaderModal: show });
        }, 50);
    };

    /***
     * _setActiveTabIndex
     * Set tab view current tab
     */
    _setActiveTabIndex = (index, firstTimeLoad) => {
        console.log("[TransferTabScreen] >> [_setActiveTabIndex] index : ", index);
        const activeIndex = index ? index : 0;
        if (index) {
            this.setState(
                {
                    firstTimeLoad: firstTimeLoad,
                    showLoaderModal: true,
                    activeTabIndex: activeIndex,
                    index: activeIndex,
                },
                () => {
                    setTimeout(() => {
                        this._showOverlay(false);
                    }, 200);
                }
            );
        }
    };

    /***
     * analyticsLogCurrentTab
     * analytics Log Current Tab
     */
    analyticsLogCurrentTab = (index) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "M2U - Transfer",
            [FA_TAB_NAME]:
                index === 0
                    ? "Self"
                    : index === 1
                    ? "Others"
                    : index === 2
                    ? "DuitNow"
                    : index === 3
                    ? "ASNB"
                    : index === 4 && this.state.tabunghajiEnabled
                    ? "Tabung Haji"
                    : "Overseas",
        });
    };

    _toggleTab = (isSearchMode) =>
        this.setState({
            showTab: !isSearchMode,
        });

    render() {
        const { navigation } = this.props;
        const { getModel } = this.props;
        const { isBakongReady } = getModel("misc");
        const {
            showLoaderModal,
            showErrorModal,
            errorMessage,
            activeTabIndex,
            firstTimeLoad,
            showContent,
            showTab,
        } = this.state;
        const isSoleProp = getModel("user").soleProp;
        const { prevData, acctNo, screenDate } = this.props.route.params || {};
        const { routeFrom } = screenDate;
        const tabs = [SELF, OTHERS, DUITNOW, TABUNG_HAJI, OVERSEAS];
        if (!isSoleProp) {
            // insert ASNB tab in screens and titles array if user not a sole proprietor
            tabs.splice(TRANSFER_ASNB_TAB_KEY, 0, ASNB);
        }
        const screens = [
            <TransferOwnAccount
                key={`${tabs.indexOf(SELF)}`}
                index={tabs.indexOf(SELF)}
                activeTabIndex={activeTabIndex}
                navigation={navigation}
                props={this.props}
                fromAccount={acctNo}
                data={prevData}
                screenDate={screenDate}
                showOverlay={this._showOverlay}
                setActiveTabIndex={this._setActiveTabIndex}
                firstTimeLoad={firstTimeLoad}
                toggleSearchMode={this._toggleTab}
            />,
            <TransferOtherAccounts
                key={`${tabs.indexOf(OTHERS)}`}
                index={tabs.indexOf(OTHERS)}
                activeTabIndex={activeTabIndex}
                navigation={navigation}
                props={this.props}
                fromAccount={acctNo}
                data={prevData}
                screenDate={screenDate}
                showOverlay={this._showOverlay}
                setActiveTabIndex={this._setActiveTabIndex}
                toggleSearchMode={this._toggleTab}
                onOverseasDown={this._handleOverseasDown}
            />,
            <TransferDuitNowFavScreen
                key={`${tabs.indexOf(DUITNOW)}`}
                index={tabs.indexOf(DUITNOW)}
                activeTabIndex={activeTabIndex}
                navigation={navigation}
                props={this.props}
                fromAccount={acctNo}
                data={prevData}
                screenDate={screenDate}
                showOverlay={this._showOverlay}
                setActiveTabIndex={this._setActiveTabIndex}
                toggleSearchMode={this._toggleTab}
            />,
            <TransferTabungHajiTab
                key={`${tabs.indexOf(TABUNG_HAJI)}`}
                index={tabs.indexOf(TABUNG_HAJI)}
                activeTabIndex={activeTabIndex}
                setActiveTabIndex={this._setActiveTabIndex}
                toggleSearchMode={this._toggleTab}
                {...this.props}
            />,
            <TransferBakongTab
                key={`${tabs.indexOf(OVERSEAS)}`}
                index={tabs.indexOf(OVERSEAS)}
                isEnabled={isBakongReady}
                entryPoint={{
                    routeFrom: routeFrom ?? FA_DASHBOARD,
                    prevData,
                }}
                fromAccount={acctNo}
                activeTabIndex={activeTabIndex}
                toggleSearchMode={this._toggleTab}
                {...this.props}
            />,
        ];
        if (!isSoleProp) {
            screens.splice(
                TRANSFER_ASNB_TAB_KEY,
                0,
                <TransferASNBTab
                    key={`${tabs.indexOf(ASNB)}`}
                    index={tabs.indexOf(ASNB)}
                    activeTabIndex={activeTabIndex}
                    updateTime={moment()}
                    toggleSearchMode={this._toggleTab}
                    {...this.props}
                />
            );
        }
        return (
            <ScreenContainer
                backgroundType={"color"}
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showLoaderModal={showLoaderModal}
                backgroundColor={MEDIUM_GREY}
            >
                {showContent && (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={TRANSFER_TO_HEADER}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            {this.state.activeTabIndex >= 0 ? (
                                <TabView
                                    defaultTabIndex={activeTabIndex}
                                    showTab={showTab}
                                    keyboardShouldPersistTaps="handled"
                                    onTabChange={this.handleTabChange}
                                    titles={tabs}
                                    screens={screens}
                                />
                            ) : null}
                        </React.Fragment>
                    </ScreenLayout>
                )}
                {showLoaderModal && <ScreenLoader showLoader={true} />}
            </ScreenContainer>
        );
    }
}

TransferTabScreen.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            acctNo: PropTypes.any,
            index: PropTypes.number,
            isNewASNBTransferEntryPoint: PropTypes.any,
            isNewTabungHajiTransferEntryPoint: PropTypes.any,
            prevData: PropTypes.any,
            screenDate: PropTypes.any,
            transferParams: PropTypes.object,
        }),
    }),
    updateModel: PropTypes.func,
};

export default withModelContext(TransferTabScreen);

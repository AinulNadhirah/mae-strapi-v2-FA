import * as React from "react";
import { View, Dimensions, AsyncStorage } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import ScreenLayout from "@layouts/ScreenLayout";

import {
    HeaderPageIndicator,
    FloatingActionStaticButton,
    BottomOverlayMenu,
} from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TabView from "@components/Specials/TabView";

import { SEND_REQUEST_ACTION } from "@constants/data";
import * as Strings from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import PendingRequestsScreen from "./PendingRequestsScreen";
import ReceivedRequestsScreen from "./ReceivedRequestsScreen";
import SentRequestsScreen from "./SentRequestsScreen";

const initialLayout = {
    height: 50,
    width: Dimensions.get("window").width,
};

export default class SendRequestMoneyTabScreen extends React.Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            rand: 0,
        };

        this.onOpenBillsMenuClick = this._onOpenBillsMenuClick.bind(this);
        this.closeMenu = this._closeMenu.bind(this);
        this.onActionItemClick = this._onActionItemClick.bind(this);
    }

    componentDidMount() {
        ModelClass.SEND_MONEY_DATA.pendingData = [];
        ModelClass.SEND_MONEY_DATA.pendingDataCalled = false;

        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            ModelClass.SELECTED_CONTACT = [];
            ModelClass.SEND_MONEY_DATA.pendingData = [];
            ModelClass.SEND_MONEY_DATA.pendingDataCalled = false;
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription.remove();
        this.blurSubscription.remove();
    }

    _updateDataInScreenAlways = async () => {
        try {
            ModelClass.SECURE2U_DATA.isSecure2uEnable = await AsyncStorage.getItem(
                "isSecure2uEnable"
            );
            this.setState({
                referenceText: ModelClass.TRANSFER_DATA.recipientReference,
            });
        } catch (e) {
            console.log(" catch: ", e);
        }
    };

    _onActionItemClick = async (item) => {
        this.setState({ showMenu: false });
        let index = item.id;
        switch (index) {
            case 1:
                this._navigateToSendMoney();
                break;
            case 2:
                this._navigateToRequestMoney();
                break;
        }
    };

    _navigateToSendMoney = async () => {
        ModelClass.clearTransferData();
        ModelClass.clearSendMoneyData();

        ModelClass.TRANSFER_DATA.isFutureTransfer = false;
        ModelClass.TRANSFER_DATA.effectiveDate = "00000000";
        ModelClass.TRANSFER_DATA.fromAccount = ModelClass.TRANSFER_DATA.primaryAccount;
        ModelClass.TRANSFER_DATA.formatedFromAccount = Utility.getFormatedAccountNumber(
            ModelClass.TRANSFER_DATA.primaryAccount
        );
        // ModelClass.TRANSFER_DATA.fromAccountName = this.state.title;
        // ModelClass.TRANSFER_DATA.fromAccountCode = this.state.acctCode;
        ModelClass.TRANSFER_DATA.recipientReference = "";
        ModelClass.TRANSFER_DATA.transferAmount = "";
        ModelClass.COMMON_DATA.isSplitBillsFlow = false;

        ModelClass.settings.moduleName = navigationConstant.WALLET_MODULE;
        ModelClass.settings.routeName = navigationConstant.WALLET_TAB_SCREEN;

        ModelClass.COMMON_DATA.walletFlow = 5;
        ModelClass.COMMON_DATA.walletScreenIndex = 3;
        ModelClass.SEND_MONEY_DATA.sendMoneyFlow = 1;
        ModelClass.SEND_MONEY_DATA.isSendMoneyAsOpen = true;
        ModelClass.SEND_MONEY_DATA.isFromQuickAction = false;
        ModelClass.SELECTING_CONTACT = [];

        if (
            ModelClass.TRANSFER_DATA.m2uToken != null &&
            ModelClass.TRANSFER_DATA.m2uToken.length >= 1
        ) {
            ModelClass.SEND_MONEY_DATA.isPasswordFlow = false;
            this.navigateToSendAndRequestMoney();
        } else {
            ModelClass.SEND_MONEY_DATA.isPasswordFlow = true;
            this.callNavigation();
        }
    };

    _navigateToRequestMoney = async () => {
        ModelClass.clearTransferData();
        ModelClass.clearSendMoneyData();
        ModelClass.TRANSFER_DATA.isFutureTransfer = false;
        ModelClass.TRANSFER_DATA.effectiveDate = "00000000";
        ModelClass.TRANSFER_DATA.fromAccount = ModelClass.TRANSFER_DATA.primaryAccount;
        ModelClass.TRANSFER_DATA.formatedFromAccount = Utility.getFormatedAccountNumber(
            ModelClass.TRANSFER_DATA.primaryAccount
        );

        ModelClass.TRANSFER_DATA.recipientReference = "";
        ModelClass.TRANSFER_DATA.transferAmount = "";
        ModelClass.COMMON_DATA.isSplitBillsFlow = false;
        ModelClass.SEND_MONEY_DATA.isFromQuickAction = false;

        ModelClass.settings.moduleName = navigationConstant.WALLET_MODULE;
        ModelClass.settings.routeName = navigationConstant.WALLET_TAB_SCREEN;

        ModelClass.COMMON_DATA.walletFlow = 6;
        ModelClass.COMMON_DATA.walletScreenIndex = 3;
        ModelClass.SEND_MONEY_DATA.sendMoneyFlow = 2;
        ModelClass.SELECTING_CONTACT = [];
        this.navigateToSendAndRequestMoney();
    };

    navigateToSendAndRequestMoney = async () => {
        ModelClass.COMMON_DATA.contactsSelectLimit = 1;
        ModelClass.COMMON_DATA.contactsMultiSelectAllowed = false;
        this.props.navigation.navigate("ContactScreen", {
            navigationRoute: "SendRequestMoneyTabScreen",
            addFactor: 1,
        });
    };

    callNavigation = async () => {
        NavigationService.navigateToModule(
            navigationConstant.M2U_LOGIN_MODULE,
            navigationConstant.M2U_LOGIN_SCREEN,
            {
                onLoginSuccess: this.onLoginSuccess,
            }
        );
    };

    onLoginSuccess = (data) => {
        if (ModelClass.COMMON_DATA.walletFlow === 5 || ModelClass.COMMON_DATA.walletFlow === 6) {
            this.navigateToSendAndRequestMoney();
        }
    };

    _onOpenBillsMenuClick = () => {
        ModelClass.SEND_MONEY_DATA.requestResponseError = "";
        this.setState({ showMenu: true });
    };

    _closeMenu = () => {
        this.setState({ showMenu: false });
    };

    onBackPress = () => {};

    render() {
        const { navigation } = this.props;
        const { showOverlay, showErrorModal, errorMessage, index } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={OFF_WHITE}
            >
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderPageIndicator
                                showBack={true}
                                showClose={true}
                                showIndicator={false}
                                showTitle={true}
                                showTitleCenter={true}
                                showBackIndicator={true}
                                pageTitle={Strings.SEND_AND_REQUEST}
                                numberOfPages={0}
                                currentPage={0}
                                onBackPress={this.onBackPress}
                                navigation={this.props.navigation}
                                moduleName={navigationConstant.WALLET_MODULE}
                                routeName={navigationConstant.WALLET_TAB_SCREEN}
                                testID={"header"}
                                accessibilityLabel={"header"}
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <TabView
                                defaultTabIndex={index}
                                titles={[
                                    Strings.PENDING_CAP,
                                    Strings.SENT_MONEY,
                                    Strings.RECEIVED_MONEY,
                                ]}
                                screens={[
                                    <PendingRequestsScreen key="1" navigation={navigation} />,
                                    <SentRequestsScreen key="2" navigation={navigation} />,
                                    <ReceivedRequestsScreen key="3" navigation={navigation} />,
                                ]}
                            />

                            {!this.state.showMenu ? (
                                <FloatingActionStaticButton
                                    accessible={true}
                                    testID={"createBill"}
                                    accessibilityLabel={"createBill"}
                                    showMenu={true}
                                    onPress={this.onOpenBillsMenuClick}
                                    icon={require("@assets/icons/ic_add_plus_white.png")}
                                />
                            ) : (
                                <View />
                            )}
                        </React.Fragment>
                    </ScreenLayout>

                    {this.state.showMenu ? (
                        <BottomOverlayMenu
                            showMenu={this.state.showMenu}
                            menuTitle={Strings.WOULD_YOU_LIKE_TO_SEND_OR_REQUEST_MONEY}
                            menuItemArray={SEND_REQUEST_ACTION}
                            onItemPress={(item) => this.onActionItemClick(item)}
                            onCloseMenuPress={this.closeMenu}
                        />
                    ) : (
                        <View />
                    )}
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

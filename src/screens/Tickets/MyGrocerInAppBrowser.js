import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { WebView } from "react-native-webview";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    TICKET_STACK,
    TICKET_CONFIRMATION,
    WETIX_INAPP_WEBVIEW_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    getTicketInfo,
    getTicketOrderDetails,
    bankingGetDataMayaM2u,
    invokeL3,
    invokeL2Challenge,
} from "@services/index";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import { DEEP_LINK_URL, FA_PARTNER_GROCERIES, GROCERY } from "@constants/strings";

import { checks2UFlow } from "@utils/dataModel/utility";

class MyGrocerInAppBrowser extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object.isRequired,
        navigation: PropTypes.object.isRequired,
    };
    webView = {
        canGoBack: false,
        ref: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            proceedCheckout: false,
            key: 100,
            webURL: null,
            orderDetails: [],
            ticketId: "",
            accountNo: "",
            accountCode: "",
            isEnablePayment: false,
            routeFrom: this.props.route.params?.routeFrom ?? "Dashboard",
        };
    }
    componentDidMount() {
        console.log("[MyGrocerInAppBrowser] >> [componentDidMount]");
        // this.props.navigation.addListener("focus", this.onScreenFocus);
        this.getTicketInfo();
        this.updateAccountNum();
    }
    updateAccountNum = () => {
        console.log("[MyGrocerInAppBrowser] >> [updateAccountNum]");

        const prevData = this.props.route.params?.prevData ?? "";
        const { getModel } = this.props;
        const { primaryAccount } = getModel("wallet");

        // From selected account
        const number = prevData?.number ?? null;
        const code = prevData?.code ?? null;

        // From primary account
        const acctNo = primaryAccount?.number ?? null;
        const acctCode = primaryAccount?.code ?? null;

        // Choose whichever is available
        const accountNo = number || acctNo || "";
        const accountCode = code || acctCode || "";

        this.setState({ accountNo, accountCode });
    };

    onScreenFocus = () => {
        console.log("[MyGrocerInAppBrowser] >> [onScreenFocus]");
        if (this.props?.route?.params) {
            this.setState(
                {
                    isLoading: true,
                },
                () => this.getTicketInfo()
            );
        }
    };

    getTicketInfo = async () => {
        const { getModel } = this.props;
        const isL2ChallengeNeeded = await invokeL2Challenge(getModel);
        if (isL2ChallengeNeeded) {
            this.props.navigation.goBack();
            return;
        }

        console.log("[MyGrocerInAppBrowser] >> [getTicketInfo]");
        try {
            const params = {
                mode: "",
                ticketType: "MYGROSER",
            };
            const respone = await getTicketInfo(params);
            const result = respone?.data?.result;
            console.log("result isss", result);
            this.setState({
                webURL: result,
                key: this.state.key + 1,
                isLoading: false,
            });
        } catch (error) {
            console.log(`is getTicketInfo error `, error);
            if (error.message === "login cancelled" || error.status === "nonetwork") {
                this.props.navigation.goBack();
                return;
            }
            this.setState({
                isLoading: false,
            });
            showErrorToast({
                message: error?.message,
            });
        }
    };

    getOrderDetails = async (number) => {
        console.log("[MyGrocerInAppBrowser] >> [getOrderDetails]");
        try {
            const params = {
                orderNumber: number,
                ticketType: "MYGROSER",
            };
            const response = await getTicketOrderDetails(params);
            console.log("result isss", response?.data?.result);
            this.setState(
                { orderDetails: response?.data?.result, ticketId: number, isEnablePayment: false },
                () => {
                    this.handleConfirmationNavigation();
                }
            );
        } catch (error) {
            console.log(`is Error`, error);
            showErrorToast({
                message: error?.message,
            });
        }
    };
    fetchAccountsList = async () => {
        console.log("[MyGrocerInAppBrowser] >> [fetchAccountsList]");

        const { accountNo } = this.state;
        const subUrl = "/summary";
        const params = "?type=A";

        const httpResp = await bankingGetDataMayaM2u(subUrl + params, true);
        if (httpResp?.data?.result != null) {
            const accountListings = httpResp?.data?.result?.accountListings || [];
            const massagedAccounts = this.massageAccountsData(accountListings, accountNo);

            return massagedAccounts;
        } else {
            return [];
        }
    };

    massageAccountsData = (accountsList, accountNo) => {
        console.log(
            "[MyGrocerInAppBrowser] >> [massageAccountsData]",
            `accountsList: ${accountsList} \n accountNo: ${accountNo}`
        );
        // Empty check
        if (!accountsList || !(accountsList instanceof Array) || !accountsList.length) {
            return [];
        }
        // Filter other accounts and mark selected as false
        return accountsList.map((account, i) => {
            return {
                ...account,
                index: i,
                selected: account?.number === accountNo,
            };
        });
    };

    handleConfirmationNavigation = async () => {
        console.log("[MyGrocerInAppBrowser] >> [handleConfirmationNavigation]");

        const params = {
            orderDetails: this.state.orderDetails,
            ticketType: "MYGROSER",
            ticketShortName: "MyGroser",
        };

        const stateData = this.state;
        const { isPostLogin, isPostPassword } = this.props.getModel("auth");
        this.setState({
            proceedCheckout: false,
        });

        this._handleloading(false);

        if (!isPostLogin || !isPostPassword) {
            // L3 call to invoke login page
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code != 0) return;
        }

        // Fetch CASA accounts
        const casaAccounts = await this.fetchAccountsList();
        stateData.casaAccounts = casaAccounts;
        const selectedAcc = casaAccounts.filter((casaAcc) => {
            return casaAcc.selected;
        });
        stateData.selectedAccount = selectedAcc.length > 0 ? selectedAcc[0] : casaAccounts[0] ?? "";
        stateData.selectedParms = params;

        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            45,
            this.props.getModel,
            this.props.updateModel
        );

        stateData.flow = flow;
        stateData.secure2uValidateData = secure2uValidateData;
        const {
            navigation: { navigate },
        } = this.props;
        if (flow === SECURE2U_COOLING) {
            stateData.flowType = flow;
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            stateData.flowType = flow;
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: TICKET_STACK,
                            screen: TICKET_CONFIRMATION,
                        },
                        fail: {
                            stack: TICKET_STACK,
                            screen: WETIX_INAPP_WEBVIEW_SCREEN,
                        },

                        params: { ...stateData, isFromS2uReg: true },
                    },
                },
            });
        } else {
            navigate(TICKET_CONFIRMATION, {
                params: stateData,
            });
        }
    };

    _onCloseClick = () => {
        console.log("[MyGrocerInAppBrowser] >> [_onCloseClick]");
        this.props.navigation.goBack();
    };

    _onBackPress = () => {
        console.log("[MyGrocerInAppBrowser] >> [_onBackClick]");
        console.log("this.webView.canGoBack : ", this.webView.canGoBack);
        if (this.webView.canGoBack && this.webView.ref) {
            this.webView.ref.goBack();
        } else {
            this.props.navigation.goBack();
        }
    };

    _handleloading = (isLoading) => {
        this.props.updateModel({
            ui: {
                showLoader: isLoading,
            },
        });
    };

    _handlePayment = (webviewUrl) => {
        // if (webviewUrl && webviewUrl.includes(DEEP_LINK_DOMAIN)) {
        console.log("_handlePayment webviewUrl >> ", webviewUrl);
        this._handleloading(true);
        this.setState(
            {
                isEnablePayment: true,
            },
            () => {
                const txnOrderNo = webviewUrl
                    .toString()
                    .replace(DEEP_LINK_URL + "=")
                    .replace("undefined")
                    .trim()
                    .toString()
                    .replace("undefined")
                    .substring(9, txnOrderNo?.length)
                    .trim();
                console.log("[MyGrocerInAppBrowser] >> [_handlePayment] >> ", txnOrderNo);
                this.getOrderDetails(txnOrderNo);
            }
        );
        // }
    };

    onShouldStartLoadWithRequest = (navigator) => {
        console.log("[MyGrocerInAppBrowser] >> [onShouldStartLoadWithRequest] >> ", navigator?.url);
        if (navigator.url.indexOf("maybank2umae:") !== -1) {
            setTimeout(() => {
                this._handlePayment(navigator?.url);
            }, 100);

            return false;
        }

        return true;
    };

    handleWebViewNavigationStateChange = (webViewState) => {
        console.log("[MyGrocerInAppBrowser] >> [handleWebViewNaviagtion]");
        this.webView.canGoBack = webViewState.canGoBack;
    };

    onLoad = (webViewState) => {
        console.log("[MyGrocerInAppBrowser] >> [onLoad]: ", webViewState?.url);
    };

    onLoadStart = (webViewState) => {
        console.log("[MyGrocerInAppBrowser] >> [onLoadStart]: ", webViewState?.url);
    };

    onLoadEnd = (webViewState) => {
        console.log("[MyGrocerInAppBrowser] >> [onLoadEnd]: ", webViewState?.url);
        this.setState({ isLoading: false });
    };

    webViewRef = (ref) => {
        console.log("[MyGrocerInAppBrowser] >> [webViewRef]");
        this.webView.ref = ref;
    };

    render() {
        const jsCode = "window.postMessage(document.getElementsByClassName('App'))";
        const { webURL, isEnablePayment, proceedCheckout } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={proceedCheckout || this.state.isLoading}
                analyticScreenName={FA_PARTNER_GROCERIES}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={this._onCloseClick} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={GROCERY}
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingLeft={0}
                    paddingRight={0}
                    paddingBottom={0}
                    paddingTop={0}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "" : "height"}
                        style={proceedCheckout ? styles.containerHidden : styles.container}
                    >
                        {webURL && !isEnablePayment && (
                            <WebView
                                ref={(webView) => {
                                    this.webView.ref = webView;
                                }}
                                key={this.state.key}
                                source={{ uri: webURL }}
                                style={styles.webView}
                                userAgent="Maybank-MY"
                                originWhitelist={["*"]}
                                onLoadStart={this.onLoadStart}
                                onLoad={this.onLoad}
                                injectedJavaScript={jsCode}
                                onLoadEnd={this.onLoadEnd}
                                onNavigationStateChange={this.handleWebViewNavigationStateChange}
                                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                            />
                        )}
                    </KeyboardAvoidingView>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerHidden: {
        flex: 0,
    },
    webView: {
        flex: 1,
    },
});

export default withModelContext(MyGrocerInAppBrowser);

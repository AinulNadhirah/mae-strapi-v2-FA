import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Platform } from "react-native";
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
import {
    DEEP_LINK_DOMAIN,
    DEEP_LINK_URL,
    FA_PARTNER_WETIX,
    MOVIE_TICKETS,
} from "@constants/strings";

import { checks2UFlow } from "@utils/dataModel/utility";

class WetixInAppBrowser extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
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
            paymentURL: "",
        };
    }
    componentDidMount() {
        console.log("[WetixInAppBrowser] >> [componentDidMount]");
        // this.props.navigation.addListener("focus", this.onScreenFocus);
        this.getTicketInfo();
        this.updateAccountNum();
    }
    updateAccountNum = () => {
        console.log("[WetixInAppBrowser] >> [updateAccountNum]");

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
        console.log("[WetixInAppBrowser] >> [onScreenFocus]");
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
        console.log("[WetixInAppBrowser] >> [getTicketInfo]");
        const params = {
            mode: "",
            ticketType: "WETIX",
        };

        const { getModel } = this.props;
        const isL2ChallengeNeeded = await invokeL2Challenge(getModel);
        if (isL2ChallengeNeeded) {
            this.props.navigation.goBack();
            return;
        }

        try {
            const response = await getTicketInfo(params);
            const result = response.data.result;
            console.log("result isss", result);
            this.setState({
                webURL: result,
                key: this.state.key + 1,
                isLoading: false,
            });
        } catch (error) {
            console.log(`is getTicketInfo error `, error.message);
            if (error.message === "login cancelled" || error.status === "nonetwork") {
                this.props.navigation.goBack();
                return;
            }
            this.setState({
                isLoading: false,
            });
            showErrorToast({
                message: error.message,
            });
        }
    };
    onShouldStartLoadWithRequest = (navigator) => {
        console.log("[WetixInAppBrowser] >> [onShouldStartLoadWithRequest] >> ", navigator?.url);
        if (navigator.url.indexOf("maybank2umae:") !== -1) {
            setTimeout(() => {
                this._handlePayment(navigator?.url);
            }, 100);

            return false;
        }

        return true;
    };

    _handlePayment = (webviewUrl) => {
        // if (webviewUrl && webviewUrl.includes(DEEP_LINK_DOMAIN)) {
        console.log("_handlePayment webviewUrl >> ", webviewUrl);
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
                console.log("[WetixInAppBrowser] >> [_handlePayment] >> ", txnOrderNo);
                this.getOrderDetails(txnOrderNo);
            }
        );
        // }
    };

    getOrderDetails = (number) => {
        console.log("[WetixInAppBrowser] >> [getOrderDetails]");
        const params = {
            orderNumber: number,
            ticketType: "WETIX",
        };
        getTicketOrderDetails(params)
            .then((respone) => {
                const result = respone.data.result;
                this.setState(
                    {
                        orderDetails: result,
                        ticketId: number,
                        isEnablePayment: false,
                        webURL: this.state.paymentURL,
                    },
                    () => {
                        this.handleConfirmationNavigation();
                    }
                );
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message,
                });
            });
    };
    fetchAccountsList = async () => {
        console.log("[WetixInAppBrowser] >> [fetchAccountsList]");

        const { accountNo } = this.state;
        let subUrl = "/summary";
        let params = "?type=A";

        const httpResp = await bankingGetDataMayaM2u(subUrl + params, true);
        const result = httpResp.data.result;
        if (result != null) {
            const accountListings = result.accountListings || [];
            const massagedAccounts = this.massageAccountsData(accountListings, accountNo);

            return massagedAccounts;
        } else {
            return [];
        }
    };
    massageAccountsData = (accountsList, accountNo) => {
        console.log("[WetixInAppBrowser] >> [massageAccountsData]");

        let defaultAccount;

        // Empty check
        if (!accountsList || !(accountsList instanceof Array) || !accountsList.length) {
            return [];
        }

        // Filter other accounts and mark selected as false
        const nonSelectedAccounts = accountsList
            .filter((account) => {
                if (account.number == accountNo) {
                    defaultAccount = account;
                    return false;
                } else {
                    return true;
                }
            })
            .map((updatedAccount) => {
                return {
                    ...updatedAccount,
                    selected: false,
                };
            });

        if (defaultAccount) {
            defaultAccount.selected = true;
            return [defaultAccount, ...nonSelectedAccounts];
        } else {
            return nonSelectedAccounts;
        }
    };

    handleConfirmationNavigation = async () => {
        console.log("[WetixInAppBrowser] >> [handleConfirmationNavigation]");

        const params = {
            orderDetails: this.state.orderDetails,
            ticketType: "WETIX",
            ticketShortName: "WeTix",
        };

        let stateData = this.state;
        let getModel = this.props.getModel;
        const ota = getModel("ota");

        this.setState({
            proceedCheckout: false,
            isLoading: false,
        });
        // L3 call to invoke login page
        const httpResp = await invokeL3(true);
        const result = httpResp.data;
        const { code, message } = result;
        if (code != 0) return;

        // Fetch CASA accounts
        const casaAccounts = await this.fetchAccountsList();
        stateData.casaAccounts = casaAccounts;
        stateData.selectedAccount = casaAccounts.length ? casaAccounts[0] : "";
        stateData.selectedParms = params;
        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        let { flow, secure2uValidateData } = await checks2UFlow(
            21,
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
        console.log("[WetixInAppBrowser] >> [_onCloseClick]");
        this.props.navigation.goBack();
    };

    _onBackPress = () => {
        console.log("[WetixInAppBrowser] >> [_onBackClick]");
        console.log("this.webView.canGoBack : ", this.webView.canGoBack);
        if (this.webView.canGoBack && this.webView.ref) {
            this.webView.ref.goBack();
        } else {
            this.props.navigation.goBack();
        }
    };

    handleWebViewNavigationStateChange = (webViewState) => {
        console.log("[WetixInAppBrowser] >> [handleWebViewNaviagtion]");
        this.webView.canGoBack = webViewState.canGoBack;
        let linkingInitialURL = webViewState.url;
        const paymentUrl = "wetix.my/#/payment";
        console.log("linkingInitialURL >> ", linkingInitialURL);
        console.log("Strings  deepLinkUrlDomin >> ", DEEP_LINK_DOMAIN);
        if (linkingInitialURL?.includes(paymentUrl)) {
            this.setState({
                proceedCheckout: true,
                isLoading: true,
                paymentURL: linkingInitialURL,
            });
            return;
        }
        if (linkingInitialURL && linkingInitialURL.includes(DEEP_LINK_DOMAIN)) {
            console.log(" Pay now Data iss linkingInitialURL >> ", linkingInitialURL);
            this.setState(
                {
                    isEnablePayment: true,
                },
                () => {
                    let txnOrderNo = "";
                    txnOrderNo = linkingInitialURL
                        .toString()
                        .replace(DEEP_LINK_URL + "=")
                        .replace("undefined")
                        .trim();
                    console.log("txnOrderNo 1 >> ", txnOrderNo);
                    txnOrderNo = txnOrderNo
                        .toString()
                        .replace("undefined")
                        .substring(9, txnOrderNo.length)
                        .trim();

                    this.getOrderDetails(txnOrderNo);
                }
            );
        }
    };

    onLoad = (webViewState) => {
        console.log("[WetixInAppWebViewScreen] >> [onLoad]");
    };

    onLoadStart = (webViewState) => {
        console.log("[WetixInAppWebViewScreen] >> [onLoadStart]");
    };

    onLoadEnd = (webViewState) => {
        console.log("[WetixInAppWebViewScreen] >> [onLoadEnd]");
        this.setState({ isLoading: false });
    };
    webViewRef = (ref) => {
        console.log("[WetixInAppWebViewScreen] >> [webViewRef]");
        this.webView.ref = ref;
    };

    render() {
        const jsCode = "window.postMessage(document.getElementsByClassName('App'))";
        const { webURL, proceedCheckout } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={proceedCheckout || this.state.isLoading}
                analyticScreenName={FA_PARTNER_WETIX}
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
                                    text={MOVIE_TICKETS}
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
                    <View style={proceedCheckout ? styles.containerHidden : styles.container}>
                        {webURL && (
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
                                //onMessage={this._onMessage}
                                injectedJavaScript={jsCode}
                                onLoadEnd={this.onLoadEnd}
                                onNavigationStateChange={this.handleWebViewNavigationStateChange}
                                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                            />
                        )}
                    </View>
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

export default withModelContext(WetixInAppBrowser);

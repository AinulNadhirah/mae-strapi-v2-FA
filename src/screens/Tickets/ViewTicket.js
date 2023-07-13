import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
    DASHBOARD,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
    TAB_NAVIGATOR,
    TICKET_CONFIRMATION,
    TICKET_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

// import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import {
    generateTicketInfo,
    getTicketOrderDetails,
    bankingGetDataMayaM2u,
    invokeL3,
} from "@services/index";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

class ViewTicket extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.object.isRequired,
    };
    webView = {
        canGoBack: false,
        ref: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            key: 100,
            webURL: "",
            OrderID: props.route.params?.params?.orderID ?? "",
            ticketType: props.route.params?.params?.ticketType ?? "",
            orderDetails: [],
            ticketId: "",
            accountNo: "",
            accountCode: "",
        };
    }

    componentDidMount() {
        console.log("[ViewTicket] >> [componentDidMount]");
        this.generateTicketInfo();
    }

    generateTicketInfo = () => {
        console.log("[ViewTicket] >> [generateTicketInfo]");

        const params = {
            orderNumber: this.state.OrderID,
            ticketType: this.state.ticketType,
        };
        generateTicketInfo(params)
            .then((respone) => {
                const result = respone.data.result;
                console.log("result isss", result);
                this.setState({
                    webURL: result,
                    key: this.state.key + 1,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    handleWebViewNaviagtion(webViewState) {
        console.log("[ViewTicket] >> [handleWebViewNaviagtion]");
        console.log(webViewState.url);
    }

    _onCloseClick = () => {
        console.log("[ViewTicket] >> [_onCloseClick]");
        const route = this.props.route.params?.params?.routeFrom;
        if (route === "AccountDetails") {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
                params: {
                    auth: "successful",
                },
            });
            return;
        } else if (route === "Dashboard") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: DASHBOARD,
                params: { refresh: true },
            });
            return;
        }
        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: route,
                params: { refresh: true },
            },
        });
        return;
    };

    onLoad(webViewState) {
        console.log("[ViewTicket] >> [onLoad]");
    }

    onLoadStart(webViewState) {
        console.log("[ViewTicket] >> [onLoadStart]");
    }

    onLoadEnd(webViewState) {
        console.log("[ViewTicket] >> [onLoadEnd]");
    }
    getTicketType = () => {
        console.log("[ViewTicket] >> [getTicketType]");

        switch (this.state.ticketType) {
            case "AIRPAZ":
                return Strings.FLIGHT_TICKETS;
            case "CTB":
                return Strings.BUS_TICKETS;
            case "MYGROSER":
                return "MyGroser";
            default:
                return Strings.MOVIE_TICKETS;
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
                    .replace(Strings.DEEP_LINK_URL + "=")
                    .replace("undefined")
                    .trim()
                    .toString()
                    .replace("undefined")
                    .substring(9, txnOrderNo?.length)
                    .trim();
                console.log("[ViewTicket] >> [_handlePayment] >> ", txnOrderNo);
                this.getOrderDetails(txnOrderNo);
            }
        );
        // }
    };

    getOrderDetails = async (number) => {
        console.log("[ViewTicket] >> [getOrderDetails]");
        try {
            const params = {
                orderNumber: number,
                ticketType: this.state.ticketType,
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
        console.log("[ViewTicket] >> [fetchAccountsList]");

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
            "[ViewTicket] >> [massageAccountsData]",
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
        console.log("[ViewTicket] >> [handleConfirmationNavigation]: ", {
            orderDetails: this.state.orderDetails,
            ticketType: this.state.ticketType,
            ticketShortName: this.getTicketType(),
        });

        const params = {
            orderDetails: this.state.orderDetails,
            ticketType: this.state.ticketType,
            ticketShortName: this.getTicketType(),
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
            21,
            this.props.getModel,
            this.props.updateModel
        );

        stateData.flow = flow;
        stateData.secure2uValidateData = secure2uValidateData;
        const {
            navigation: { navigate },
        } = this.props;
        console.tron.log("stateData: ", stateData);
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
                            stack: TAB_NAVIGATOR,
                            screen: "Dashboard",
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
    onShouldStartLoadWithRequest = (navigator) => {
        console.log("[ViewTicket] >> [onShouldStartLoadWithRequest] >> ", navigator?.url);
        if (navigator.url.indexOf("maybank2umae:") !== -1) {
            setTimeout(() => {
                this._handlePayment(navigator?.url);
            }, 100);

            return false;
        }

        return true;
    };
    render() {
        const jsCode = "window.postMessage(document.getElementsByClassName('App'))";
        const { webURL } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerRightElement={<HeaderCloseButton onPress={this._onCloseClick} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={this.getTicketType()}
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
                    <View style={styles.container}>
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
                            onNavigationStateChange={(navState) => {
                                this.webView.canGoBack = navState.canGoBack;
                                this.handleWebViewNaviagtion(navState);
                            }}
                            onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                        />
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
    webView: {
        marginTop: 20,
    },
});

export default withModelContext(ViewTicket);

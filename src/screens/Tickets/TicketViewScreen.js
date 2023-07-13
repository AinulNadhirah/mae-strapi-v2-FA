import NetInfo from "@react-native-community/netinfo";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Linking } from "react-native";
import { WebView } from "react-native-webview";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import { HeaderPageIndicator } from "@components/Common";

import { generateTicket } from "@services";

import * as Strings from "@constants/strings";

import * as ModelClass from "@utils/dataModel/modelClass";

class TicketViewScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            key: 100,
            webURL: "",
            isHTML: false,
            deepLinkUrl: ModelClass.WETIX_DATA.deepLinkUrl,
        };
        this.updateScreenData = this._updateScreenData.bind(this);
        this.onCloseClick = this._onCloseClick.bind(this);
        this.onBackPress = this._onBackPress.bind(this);
    }

    async componentDidMount() {
        console.log("TicketViewScreen componentDidMount 1 :");

        this._generateTicketAPI();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    removeEventListner() {
        Linking.removeEventListener("maybank2u:", this._handleOpenURL);
    }

    extractToken = (ev) => {
        console.log("extracting the token ===>>>>>>>> --->" + ev);
        NavigationService.navigateToModule(
            navigationConstant.KLIA_EKSPRESS_STACK,
            navigationConstant.KLIA_EKSPRESS_DASHBOARD
        );
    };

    _onCloseClick = () => {
        console.log("_onCloseClick :");
        NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
    };

    _onBackPress = () => {
        console.log("_onBackClick :");
        NavigationService.navigateToModule(navigationConstant.TAB_NAVIGATOR);
    };

    _onMessage = (source) => {
        console.log("_onCloseClick : ", source);
    };

    _handleOpenURL = (event) => {
        console.log("_handleOpenURL :", event);
        console.log("_handleOpenURL  event.url :", event.url);

        try {
            console.log("_updateScreenData :");
        } catch (e) {
            console.log("_updateScreenData catch: ", e);
        }
    };

    _updateScreenData = () => {
        console.log("_updateScreenData :");

        try {
            console.log("_updateScreenData :");
        } catch (e) {
            console.log("_updateScreenData catch: ", e);
        }
    };

    _generateTicketAPI = async () => {
        console.log("_getTicketInitAPI ==> ", ModelClass.WETIX_DATA.ticketFlow);

        //this.setState({ loader: true });

        let subUrl = "";
        let params = {};

        try {
            params = JSON.stringify({
                orderNumber: ModelClass.WETIX_DATA.ticketID,
                ticketType: ModelClass.WETIX_DATA.ticketFlow,
            });
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    generateTicket(subUrl, JSON.parse(params))
                        .then((response) => {
                            let responseObject = response.data;
                            console.log(subUrl + " RESPONSE RECEIVED: ", response.data);

                            if (responseObject?.message === "Success") {
                                console.log(
                                    "response.data.result  RESPONSE RECEIVED: ",
                                    response.data.result
                                );
                                this.setState({
                                    webURL: response.data.result,
                                    key: this.state.key + 1,
                                });
                            } else if (
                                responseObject !== null &&
                                responseObject !== undefined &&
                                responseObject.message !== null &&
                                responseObject.message !== undefined &&
                                responseObject.message === "failed"
                            ) {
                                this.setState({ loader: false });
                            } else {
                                this.setState({ loader: false });
                            }
                        })
                        .catch((error) => {
                            console.log(subUrl + "  ERROR==> ", error);
                            this.setState({ loader: false });
                        });
                } else {
                    this.setState({ loader: false });
                }
            });
        } catch (e) {
            this.setState({ loader: false });
            console.log(subUrl + "  catch ERROR==> " + e);
        }
    };

    showSpinner = () => {
        console.log("Show Spinner");
        //stateManager.showLoader(true);
    };

    hideSpinner() {
        console.log("Hide Spinner");
    }

    _onNavigationStateChange = (webViewState) => {
        console.log("[_onNavigationStateChange] >> [onLoad] ", webViewState);
        console.log(webViewState.url);
        // console.log("[TicketViewScreen][_onNavigationStateChange] >> webViewState: ", webViewState);
    };

    onLoad(webViewState) {
        console.log("[TicketViewScreen] >> [onLoad]", webViewState);
    }

    onLoadStart(webViewState) {
        console.log("[TicketViewScreen] >> [onLoadStart]", webViewState);

        //stateManager.showLoader(true);
    }

    onLoadEnd(webViewState) {
        console.log("[TicketViewScreen] >> [onLoadEnd]", webViewState);
    }

    render() {
        return (
            <View
                style={{
                    backgroundColor: "#f8f5f3",
                    flex: 1,
                    width: "100%",
                }}
            >
                <HeaderPageIndicator
                    showBack={false}
                    showClose={true}
                    showIndicator={false}
                    showTitle={true}
                    showTitleCenter={true}
                    showShare={false}
                    showRightShare={false}
                    showBackIndicator={false}
                    pageTitle={
                        ModelClass.COMMON_DATA.transferFlow === 21
                            ? Strings.MOVIE_TICKETS
                            : ModelClass.COMMON_DATA.transferFlow === 22
                            ? Strings.FLIGHT_TICKETS
                            : ModelClass.COMMON_DATA.transferFlow === 23
                            ? Strings.KLIA_EKSPRES
                            : ModelClass.COMMON_DATA.transferFlow === 24
                            ? Strings.TRAVEL
                            : ""
                    }
                    numberOfPages={4}
                    currentPage={4}
                    onBackPress={this.onBackPress}
                    noClose={true}
                    onClosePress={this.onCloseClick}
                    navigation={this.props.navigation}
                    moduleName={navigationConstant.HOME_DASHBOARD}
                    routeName={navigationConstant.HOME_DASHBOARD}
                    testID={"header"}
                    accessibilityLabel={"header"}
                />
                <View
                    style={{
                        flex: 1,
                    }}
                >
                    <WebView
                        key={this.state.key}
                        source={
                            this.state.isHTML
                                ? { html: this.state.webURL }
                                : { uri: this.state.webURL }
                        }
                        style={{ marginTop: 20 }}
                        onMessage={this._onMessage}
                        userAgent={"Maybank-MY"}
                        onLoadStart={this.onLoadStart}
                        onLoad={this.onLoad}
                        onLoadEnd={this.onLoadEnd}
                        onNavigationStateChange={this._onNavigationStateChange}
                    />
                </View>
            </View>
        );
    }
}

TicketViewScreen.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
    }),
};
export default TicketViewScreen;

import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

// import { showErrorToast } from "@components/Toast";
import { withModelContext } from "@context";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import { FA_PARTNER_EXPEDIA } from "@constants/strings";

class ExpediaInAppBrowser extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
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
            key: 100,
            routeFrom: this.props.route.params?.routeFrom ?? "Dashboard",
            canGoBack: false,
            pagesLoaded: 0,
        };
    }
    componentDidMount() {
        console.log("[ExpediaInAppBrowser] >> [componentDidMount]");
    }

    _onCloseClick = () => {
        console.log("[ExpediaInAppBrowser] >> [_onCloseClick]");
        this.props.navigation.goBack();
    };

    _onBackPress = () => {
        console.log("[ExpediaInAppBrowser] >> [_onBackClick]");

        if (this.state.canGoBack) {
            this.setState({ isLoading: true });
            this.webView.ref.goBack();
        } else {
            this.props.navigation.goBack();
        }
    };

    handleWebViewNavigationStateChange = (webViewState) => {
        console.log("[ExpediaInAppBrowser] >> [handleWebViewNavigationStateChange]");

        if (this.state.pagesLoaded > 2) {
            this.setState({
                canGoBack: webViewState.canGoBack,
            });
        }
    };

    onLoad = (webViewState) => {
        console.log("[ExpediaInAppWebViewScreen] >> [onLoad]");
    };

    onLoadStart = (webViewState) => {
        console.log("[ExpediaInAppWebViewScreen] >> [onLoadStart]");
    };

    onLoadEnd = (webViewState) => {
        console.log("[ExpediaInAppWebViewScreen] >> [onLoadEnd]");
        this.setState({ isLoading: false, pagesLoaded: this.state.pagesLoaded + 1 });
    };

    webViewRef = (ref) => {
        console.log("[ExpediaInAppWebViewScreen] >> [webViewRef]");
        this.webView.ref = ref;
    };

    render() {
        const jsCode = "window.postMessage(document.getElementsByClassName('App'))";
        const { canGoBack } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
                analyticScreenName={FA_PARTNER_EXPEDIA}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerLeftElement={
                                canGoBack && <HeaderBackButton onPress={this._onBackPress} />
                            }
                            headerRightElement={<HeaderCloseButton onPress={this._onCloseClick} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text="Travel"
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
                            source={{ uri: "https://expedia.com.my/" }}
                            style={styles.webView}
                            userAgent="Maybank-MY"
                            originWhitelist={["*"]}
                            onLoadStart={this.onLoadStart}
                            onLoad={this.onLoad}
                            //onMessage={this._onMessage}
                            injectedJavaScript={jsCode}
                            onLoadEnd={this.onLoadEnd}
                            onNavigationStateChange={this.handleWebViewNavigationStateChange}
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
        flex: 1,
    },
});

export default withModelContext(ExpediaInAppBrowser);

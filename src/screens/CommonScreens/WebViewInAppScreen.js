import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { WebView } from "react-native-webview";

import { HeaderPageIndicator } from "@components/Common";

import { withModelContext } from "@context";

import { MEDIUM_GREY } from "@constants/colors";

import * as ModelClass from "@utils/dataModel/modelClass";

class WebViewInAppScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        navigation: PropTypes.object,
        updateModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    showLoader = (visible) => {
        this.props.updateModel({
            ui: {
                showLoader: visible,
            },
        });
    };

    showSpinner = () => {
        console.log("Show Spinner");
        // this.showLoader(true);
    };

    hideSpinner = () => {
        console.log("Hide Spinner");
        // this.showLoader(false);
    };

    _onNavigationStateChange = () => {
        // console.log("[WebViewInAppScreen][_onNavigationStateChange] >> webViewState: ", webViewState);
    };

    onLoad = () => {
        console.log("[WebViewInAppScreen] >> [onLoad]");

        // this.showLoader(false);
    };

    onLoadStart = () => {
        console.log("[WebViewInAppScreen] >> [onLoadStart]");

        // this.showLoader(true);
    };

    onLoadEnd = () => {
        console.log("[WebViewInAppScreen] >> [onLoadEnd]");
        // this.showLoader(false);
    };

    handleOnClose = () => {
        if (ModelClass.WEBVIEW_DATA.onClosePress) ModelClass.WEBVIEW_DATA.onClosePress();
    };

    handleNavigationChange = () => {
        if (ModelClass.WEBVIEW_DATA.onNavigationStateChange) {
            ModelClass.WEBVIEW_DATA.onNavigationStateChange();
        } else this._onNavigationStateChange();
    };

    render() {
        return (
            <View style={Styles.container}>
                <HeaderPageIndicator
                    showBack={ModelClass.WEBVIEW_DATA.showBack}
                    showClose={ModelClass.WEBVIEW_DATA.showClose}
                    showIndicator={false}
                    showTitle={true}
                    showTitleCenter={true}
                    showShare={false}
                    showRightShare={ModelClass.WEBVIEW_DATA.share}
                    showBackIndicator={false}
                    pageTitle={ModelClass.WEBVIEW_DATA.title}
                    numberOfPages={4}
                    currentPage={4}
                    onBackPress={this.onBackPress}
                    noClose={
                        typeof ModelClass.WEBVIEW_DATA.noClose === "boolean"
                            ? ModelClass.WEBVIEW_DATA.noClose
                            : false
                    }
                    onClosePress={this.handleOnClose}
                    navigation={this.props.navigation}
                    moduleName={ModelClass.WEBVIEW_DATA.module}
                    routeName={ModelClass.WEBVIEW_DATA.route}
                    testID="header"
                    accessibilityLabel="header"
                />
                <View style={Styles.webviewWrapper}>
                    {/* Add KeyboardAvoidingView to make screen aware of Keyboard open/close */}
                    <KeyboardAvoidingView
                        style={Styles.viewKeyboard}
                        enabled
                        behavior={Platform.OS === "ios" ? "" : "padding"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
                    >
                        <WebView
                            source={
                                ModelClass.WEBVIEW_DATA.isHTML
                                    ? { html: ModelClass.WEBVIEW_DATA.url }
                                    : { uri: ModelClass.WEBVIEW_DATA.url }
                            }
                            style={Styles.webviewInner}
                            onLoadStart={
                                ModelClass.WEBVIEW_DATA.onLoadStart
                                    ? ModelClass.WEBVIEW_DATA.onLoadStart
                                    : this.onLoadStart
                            }
                            onLoad={
                                ModelClass.WEBVIEW_DATA.onLoad
                                    ? ModelClass.WEBVIEW_DATA.onLoad
                                    : this.onLoad
                            }
                            onLoadEnd={
                                ModelClass.WEBVIEW_DATA.onLoadEnd
                                    ? ModelClass.WEBVIEW_DATA.onLoadEnd
                                    : this.onLoadEnd
                            }
                            onNavigationStateChange={this.handleNavigationChange}
                        />
                    </KeyboardAvoidingView>
                </View>
            </View>
        );
    }
}

const Styles = StyleSheet.create({
    container: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        width: "100%",
    },
    viewKeyboard: { flex: 1 },
    webviewInner: { marginTop: 20 },
    webviewWrapper: {
        flex: 1,
    },
});
export default withModelContext(WebViewInAppScreen);

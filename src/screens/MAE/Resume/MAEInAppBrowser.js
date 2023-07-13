import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import * as navigationConstant from "@navigation/navigationConstant";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { MEDIUM_GREY } from "@constants/colors";

class MAEInAppBrowser extends Component {
    static navigationOptions = { title: "", header: null };
    webView = {
        canGoBack: false,
        ref: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            loader: false,
            key: 100,
            webURL:
                props.route.params?.filledUserDetails?.onBoardDetails2?.maeCustomerInquiry
                    ?.onlineRegUrl,
            isHTML: false,
        };
    }

    componentDidMount() {
        console.log("[MAEInAppBrowser] >> [componentDidMount]");
    }

    onCloseTap = () => {
        console.log("[MAEInAppBrowser] >> [onCloseTap] :");
        //Navigate to username page
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(navigationConstant.MAE_ONBOARD_DETAILS2, {
            filledUserDetails,
            from: "MAEInApp",
        });
    };

    onLoad = (webViewState) => {
        console.log("[MAEInAppBrowser] >> [onLoad]", webViewState);
    };

    onLoadEnd = (webViewState) => {
        console.log("[MAEInAppBrowser] >> [onLoadEnd]", webViewState);
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <View style={{ flex: 1 }}>
                        <WebView
                            ref={(webView) => {
                                this.webView.ref = webView;
                            }}
                            key={this.state.key}
                            source={{ uri: this.state.webURL }}
                            style={{ backgroundColor: MEDIUM_GREY, opacity: 0.99 }}
                            userAgent={"Maybank-MY"}
                            originWhitelist={["*"]}
                            onLoad={this.onLoad}
                            onLoadEnd={this.onLoadEnd}
                        />
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

MAEInAppBrowser.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.shape({
                onBoardDetails2: PropTypes.shape({
                    maeCustomerInquiry: PropTypes.shape({
                        onlineRegUrl: PropTypes.any,
                    }),
                }),
            }),
        }),
    }),
};
export default MAEInAppBrowser;

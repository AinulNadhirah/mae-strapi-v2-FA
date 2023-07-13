import React, { Component } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import * as ModelClass from "@utils/dataModel/modelClass";
import Style from "@styles/MAE/MAEOnboardStyle";
import { ErrorMessage, NextRightButton } from "@components/Common";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import * as DataModel from "@utils/dataModel";
import * as MAEOnboardController from "./MAEOnboardController";

class M2ULoginIntro extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            // Error state variable
            errorText: "",
            isError: false,
            errorTitleText: "Alert",
            currentScreen: ModelClass.MAE_CUSTOMER_DETAILS.isORFlow == "Y" ? "m2uOR" : "m2uLogin", // Possible values - m2uLogin/m2uOR
            headerText: Strings.SIGN_UP_FOR_MAE,
            introText:
                ModelClass.MAE_CUSTOMER_DETAILS.isORFlow == "Y"
                    ? Strings.M2U_OR_INTRO_LOGIN
                    : Strings.M2U_INTRO_LOGIN,
        };
    }

    async componentDidMount() {
        console.log("[M2ULoginIntro] >> [componentDidMount]");

        if (this.state.currentScreen == "m2uOR") {
            this.focusSubscription = this.props.navigation.addListener("focus", () => {
                this.focusBackOnScreen();
            });
            this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        }
    }

    componentWillUnmount() {
        console.log("[M2ULoginIntro] >> [componentWillUnmount]");

        if (this.state.currentScreen == "m2uOR") {
            this.focusSubscription();
            this.blurSubscription();
        }
    }

    focusBackOnScreen = () => {
        console.log("[M2ULoginIntro] >> [focusBackOnScreen]");
        try {
            if (ModelClass.MAE_CUSTOMER_DETAILS.isORWebOpen == "Y") {
                // Update the OR web open flag
                ModelClass.MAE_CUSTOMER_DETAILS.isORWebOpen = "N";

                // Call customer enquriy again to check status
                var params = JSON.stringify({
                    idType: ModelClass.MAE_CUSTOMER_DETAILS.selectedIDCode,
                    birthDate: ModelClass.MAE_CUSTOMER_DETAILS.custDOB,
                    preOrPostFlag: ModelClass.MAE_CUSTOMER_DETAILS.preOrPostFlag,
                    icNo: ModelClass.MAE_CUSTOMER_DETAILS.userIDNumber,
                });
                MAEOnboardController.maeCustomerInquiryCall(params, this);
            }
        } catch (e) {
            console.log("[M2ULoginIntro][openORWeb] >> Exception: ", e);
        }
    };

    onNavigationStateChange = (webViewState) => {
        console.log("[M2ULoginIntro][onNavigationStateChange] >> webViewState: ", webViewState);
        try {
            if (
                webViewState &&
                webViewState.hasOwnProperty("loading") &&
                webViewState.loading === false
            ) {
                // stateManager.showLoader(false);
            }
        } catch (e) {
            console.log("[M2ULoginIntro][onNavigationStateChange] >> Exception: ", e);
        }
    };

    moveToNext = () => {
        console.log("[M2ULoginIntro] >> [moveToNext]");

        if (this.state.currentScreen == "m2uLogin") {
            this.props.navigation.navigate(navigationConstant.M2U_LOGIN_USERNAME);
        } else {
            this.openORWeb();
        }
    };

    showErrorPopup = (msg, title) => {
        console.log("[M2ULoginIntro] >> [showErrorPopup]");

        this.setState({
            isError: true,
            errorText: msg,
            errorTitleText: title && title != "" ? title : this.state.errorTitleText,
        });
    };

    onBackTap = () => {
        console.log("[M2ULoginIntro] >> [onBackTap]");

        // Empty values if user taps on back
        ModelClass.MAE_CUSTOMER_DETAILS.isORFlow = "";

        this.props.navigation.pop();
    };

    onCloseTap = () => {
        console.log("[M2ULoginIntro] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    openORWeb = () => {
        console.log("[M2ULoginIntro] >> [openORWeb]");
        try {
            ModelClass.WEBVIEW_DATA.url = ModelClass.MAE_CUSTOMER_DETAILS.onlineRegUrl; //"https://www.maybank2u.com.my/home/m2u/common/signup.do";
            ModelClass.WEBVIEW_DATA.share = false;
            ModelClass.WEBVIEW_DATA.showBack = false;
            ModelClass.WEBVIEW_DATA.showClose = true;
            ModelClass.WEBVIEW_DATA.type = "url";
            ModelClass.WEBVIEW_DATA.route = navigationConstant.M2U_LOGIN_INTRO;
            ModelClass.WEBVIEW_DATA.module = navigationConstant.MAE_MODULE_STACK;
            ModelClass.WEBVIEW_DATA.title = "M2U Registration";
            ModelClass.WEBVIEW_DATA.pdfType = "shareReceipt";
            ModelClass.WEBVIEW_DATA.onNavigationStateChange = (webViewState) => {
                this.onNavigationStateChange(webViewState);
            };
            NavigationService.navigateToModule(
                navigationConstant.COMMON_MODULE,
                navigationConstant.WEBVIEW_INAPP_SCREEN
            );

            // Update the OR web open flag
            ModelClass.MAE_CUSTOMER_DETAILS.isORWebOpen = "Y";
        } catch (e) {
            console.log("[M2ULoginIntro][openORWeb] >> Exception: ", e);
        }
    };

    render() {
        return (
            <ScreenContainer backgroundType="color">
                <React.Fragment>
                    <ScreenLayout
                        useSafeArea
                        scrollable
                        paddingHorizontal={50}
                        paddingBottom={0}
                        header={
                            <HeaderLayout
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={16}
                                horizontalPaddingCustomRightValue={16}
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <React.Fragment>
                            <View style={Style.nameView}>
                                {/* Title */}
                                <Text
                                    style={Style.snapName}
                                    accessible={true}
                                    testID={"txtEmailVerification"}
                                    accessibilityLabel={"txtEmailVerification"}
                                >
                                    {this.state.headerText}
                                </Text>

                                {/* Description */}
                                <Text
                                    style={Style.snapText}
                                    accessible={true}
                                    testID={"txtEmailVerification"}
                                    accessibilityLabel={"txtEmailVerification"}
                                >
                                    {this.state.introText}
                                </Text>
                            </View>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* Error popup */}
                    {this.state.isError && this.state.errorText != "" ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({
                                    isError: false,
                                    errorText: "",
                                });
                            }}
                            title={this.state.errorTitleText}
                            description={this.state.errorText}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({
                                    isError: false,
                                    errorText: "",
                                });
                            }}
                        />
                    ) : null}

                    {/* Next buton docked at bottom */}
                    <View style={Style.RightImageView}>
                        <NextRightButton
                            onPress={this.moveToNext.bind(this)}
                            accessibilityLabel={"imgRight"}
                            testID={"imgRight"}
                            imageSource={require("@assets/icons/ic_left_arrow.png")}
                        />
                    </View>
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

export default M2ULoginIntro;

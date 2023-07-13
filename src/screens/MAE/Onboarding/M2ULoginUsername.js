import React, { Component } from "react";
import { ImageBackground, ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import commonStyle from "@styles/main";
import * as ModelClass from "@utils/dataModel/modelClass";
import Style from "@styles/MAE/MAEOnboardStyle";
import { ErrorMessage, Input, HeaderPageIndicator, NextRightButton } from "@components/Common";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import * as Controller from "../Onboarding/MAEOnboardController";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import FormLayout from "@layouts/FormLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";

class M2ULoginUsername extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            m2uLoginUsername: "",
            errorText: "",
            isError: false,
            errorTitleText: "Alert",
        };
    }

    onUsernameChange = (val) => {
        console.log("[M2ULoginUsername] >> [onUsernameChange]");

        this.setState({
            m2uLoginUsername: val,
        });

        ModelClass.MAE_CUSTOMER_DETAILS.m2uLoginUsername = val;
    };

    onUsernameSubmit = () => {
        console.log("[M2ULoginUsername] >> [onUsernameSubmit]");

        var username = ModelClass.MAE_CUSTOMER_DETAILS.m2uLoginUsername;

        // Min/max length check
        if (username.length < 6 || username.length > 16) {
            this.showErrorPopup(Strings.UNAME_MINMAX_ERR);
            return false;
        }

        // Special character check
        if (!DataModel.m2uUsernameRegex(username)) {
            this.showErrorPopup(Strings.UNAME_SPCLCHAR_ERR);
            return false;
        }

        Controller.verifyM2UUserName(this, username, "M2U_LOGIN_USERNAME");
    };

    moveToNext = () => {
        console.log("[M2ULoginUsername] >> [moveToNext]");
        this.props.navigation.navigate(navigationConstant.M2U_SECIMGPHRASE_VERIFY);
    };

    onBackTap = () => {
        console.log("[M2ULoginUsername] >> [onBackTap]");

        this.props.navigation.pop();
    };

    onCloseTap = () => {
        console.log("[M2ULoginUsername] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    showErrorPopup = (msg, title) => {
        console.log("[M2ULoginUsername] >> [showErrorPopup]");

        this.setState({
            isError: true,
            errorText: msg,
            errorTitleText: title && title != "" ? title : this.state.errorTitleText,
        });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    useSafeArea
                    paddingHorizontal={36}
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
                    <FormLayout>
                        <React.Fragment>
                            {/* Security Image */}
                            <ImageBackground
                                resizeMode="cover"
                                style={Style.defaultProfileImgViewCls}
                                imageStyle={Style.defaultProfileImgCls}
                                source={require("@assets/icons/ic_dp_default.png")}
                            />

                            {/* Header */}
                            <Text style={[Style.snapName, { height: 30 }]}>
                                {Strings.M2U_LOGIN}
                            </Text>

                            {/* Description 1 */}
                            <Text
                                style={Style.snapText}
                                accessible={true}
                                testID={"txtTabungDetail"}
                                accessibilityLabel={"txtTabungDetail"}
                            >
                                {Strings.M2U_LOGIN_UNAMEDESC}
                            </Text>

                            {/* Username input */}
                            <View style={Style.textInputViewCls}>
                                <Input
                                    label=""
                                    style={Style.inputStyle}
                                    testID={"inputCardNumber"}
                                    accessibilityLabel={"inputCardNumber"}
                                    autoFocus={true}
                                    secureTextEntry="false"
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={40}
                                    minLength={2}
                                    placeholder={"Enter username"}
                                    value={this.state.m2uLoginUsername}
                                    onChangeText={(value) => {
                                        this.onUsernameChange(value);
                                    }}
                                    onSubmitEditing={this.onUsernameSubmit}
                                />
                            </View>

                            {/* Forgot Login Details Hyperlink */}
                            {/* <View style={Style.hyperlinkViewCls}>
									<Text
										style={Style.hyperlinkCls}
										accessible={true}
										testID={"txtLoyaltyRewards"}
										accessibilityLabel={"txtLoyaltyRewards"}
									>
										{Strings.FRGT_LOGIN_DTLS}
									</Text>
								</View> */}

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
                        </React.Fragment>
                    </FormLayout>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default M2ULoginUsername;

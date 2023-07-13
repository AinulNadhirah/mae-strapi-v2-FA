import React, { Component } from "react";
import { ImageBackground, ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import * as ModelClass from "@utils/dataModel/modelClass";
import Style from "@styles/MAE/MAEOnboardStyle";
import { ErrorMessage, Input } from "@components/Common";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
import * as DataModel from "@utils/dataModel";
import * as Controller from "../Onboarding/MAEOnboardController";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import FormLayout from "@layouts/FormLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";

class M2ULoginPassword extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            m2uSecImgData: ModelClass.MAE_CUSTOMER_DETAILS.m2uSecImgData,
            m2uLoginPassword: "",
            charlenCheck: false,
            caseCharCheck: false,
            errorText: "",
            isError: false,
            errorTitleText: "Alert",
        };
    }

    onPasswordChange = (val) => {
        console.log("[M2ULoginPassword] >> [onUsernameChange]");

        var length = val.length;

        // Length validation check
        if (length >= 8 && length < 13) {
            this.setState({ charlenCheck: true });
        } else {
            this.setState({ charlenCheck: false });
        }

        // Uppercase, lowercase, number and special character check
        var caseCharCheckValidate = DataModel.m2uPasswordRegex(val);
        if (caseCharCheckValidate) {
            this.setState({ caseCharCheck: true });
        } else {
            this.setState({ caseCharCheck: false });
        }

        this.setState({
            m2uLoginPassword: val,
        });

        ModelClass.MAE_CUSTOMER_DETAILS.m2uLoginPassword = val;
    };

    onPasswordSubmit = () => {
        console.log("[M2ULoginPassword] >> [onUsernameSubmit]");

        var password = this.state.m2uLoginPassword;

        // Empty check
        if (password == "") {
            this.showErrorPopup(Strings.PWD_EMPTY_ERR);
            return false;
        }

        // Check password length
        if (!this.state.charlenCheck) {
            this.showErrorPopup(Strings.PWD_MINMAXCHAR_ERR);
            return false;
        }

        // Space character check
        if (!DataModel.anySpaceRegex(password)) {
            this.showErrorPopup(Strings.PWD_SPACES_ERR);
            return false;
        }

        Controller.callVerifyPassword(this);
    };

    moveToNext = () => {
        console.log("[M2ULoginPassword] >> [moveToNext]");
        this.props.navigation.navigate(navigationConstant.ETB_ONBOARD_SUCC);
    };

    onBackTap = () => {
        console.log("[M2ULoginPassword] >> [onBackTap]");

        this.props.navigation.pop();
    };

    onCloseTap = () => {
        console.log("[M2ULoginPassword] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    showErrorPopup = (msg, title) => {
        console.log("[M2ULoginPassword] >> [showErrorPopup]");

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
                            {/* User Security Image */}
                            <ImageBackground
                                resizeMode="cover"
                                style={Style.profileImgViewCls}
                                imageStyle={Style.profileImgCls}
                                source={{
                                    uri: this.state.m2uSecImgData,
                                }}
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
                                {Strings.M2U_LOGIN_PWDDESC}
                            </Text>

                            {/* Password input */}
                            <View style={Style.textInputViewCls}>
                                <Input
                                    label=""
                                    style={Style.inputStyle}
                                    testID={"inputCardNumber"}
                                    accessibilityLabel={"inputCardNumber"}
                                    autoFocus={true}
                                    secureTextEntry="true"
                                    multiline={false}
                                    numberOfLines={1}
                                    maxLength={25}
                                    minLength={2}
                                    placeholder={"Enter password"}
                                    value={this.state.m2uLoginPassword}
                                    importantForAutofill="no"
                                    onChangeText={(value) => {
                                        this.onPasswordChange(value);
                                    }}
                                    onSubmitEditing={this.onPasswordSubmit}
                                />
                            </View>

                            {/* Forgot Password Hyperlink */}
                            {/* <View style={Style.hyperlinkViewCls}>
									<Text
										style={Style.hyperlinkCls}
										accessible={true}
										testID={"txtLoyaltyRewards"}
										accessibilityLabel={"txtLoyaltyRewards"}
									>
										{Strings.FRGT_LOGIN_PWD}
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

export default M2ULoginPassword;

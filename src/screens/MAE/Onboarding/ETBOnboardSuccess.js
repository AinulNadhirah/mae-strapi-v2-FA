import React, { Component } from "react";
import { ImageBackground, ScrollView, Text, View, TouchableOpacity, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { SetupNow, ErrorMessage, Input, HeaderPageIndicator } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";

import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";

import Style from "@styles/MAE/MAEOnboardStyle";

class ETBOnboardSuccess extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            acctNo: ModelClass.MAE_CUSTOMER_DETAILS.acctNo,
            errorText: "",
            isError: false,
            errorTitleText: Strings.ALERT,
        };
    }

    goToWallet = () => {
        console.log("[ETBOnboardSuccess] >> [goToWallet]");
        DataModel.gotoMAYAWallet();
    };

    onShareInviteCode = () => {
        console.log("[ETBOnboardSuccess] >> [onShareInviteCode]");
        this.props.navigation.navigate(navigationConstant.INVITE_CODE);
    };

    onCloseTap = () => {
        console.log("[M2ULoginPassword] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.HOME_DASHBOARD,
            navigationConstant.HOME_DASHBOARD
        );
    };

    showErrorPopup = (msg, title) => {
        console.log("[ETBOnboardSuccess] >> [showErrorPopup]");

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
                    paddingBottom={0}
                    header={
                        <HeaderLayout
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={16}
                            horizontalPaddingCustomRightValue={16}
                            headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                        />
                    }
                >
                    <React.Fragment>
                        <View style={Style.etbOnboardSuccTopBlockCls}>
                            {/* MAE Image */}
                            <ImageBackground
                                resizeMode="cover"
                                style={Style.maeIconImgViewCls}
                                imageStyle={Style.profileImgCls}
                                source={require("@assets/MAE/MAE_ICON.png")}
                            />

                            {/* MAE Acc Created Label */}
                            <Text style={Style.accNumCls}>{Strings.M2U_ACC_CREATED}</Text>

                            {/* Your Bank Acc.... Label */}
                            <Text style={Style.bankLabelCls}>{Strings.BANK_ACC_NUM}</Text>

                            {/* Account Number */}
                            <Text style={[Style.accNumCls, { marginTop: 0 }]}>
                                {Utility.accountNumSeparator(this.state.acctNo)}
                            </Text>
                        </View>

                        {/* Bottom buttons block */}
                        <View style={Style.etbOnboardSuccBottomBlockCls}>
                            <SetupNow
                                isBigIcon={true}
                                text={Strings.GO_TO_WALLET}
                                url={require("@assets/icons/ic_yellow_wallet.png")}
                                onPress={this.goToWallet.bind(this)}
                            />

                            {/* <SetupNow
                                isBigIcon={true}
                                text={Strings.SHR_INVITE_CODE}
                                url={require("@assets/MAE/share_icon.png")}
                                onPress={this.onShareInviteCode.bind(this)}
                            /> */}
                        </View>

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
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default ETBOnboardSuccess;

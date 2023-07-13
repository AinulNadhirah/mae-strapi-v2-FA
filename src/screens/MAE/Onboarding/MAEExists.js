import React, { Component } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import * as ModelClass from "@utils/dataModel/modelClass";
import Style from "@styles/MAE/MAEOnboardStyle";
import { SetupNow, HeaderPageIndicator } from "@components/Common";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as Strings from "@constants/strings";
import * as DataModel from "@utils/dataModel";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";

class MAEExists extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
    }

    goToWallet = () => {
        console.log("[MAEExists] >> [goToWallet]");

        DataModel.gotoMAYAWallet();
    };

    onCloseTap = () => {
        console.log("[MAEExists] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    render() {
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    useSafeArea
                    // scrollable
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
                        <View style={Style.nameView}>
                            <Text
                                style={Style.snapName}
                                accessible={true}
                                testID={"txtEmailVerification"}
                                accessibilityLabel={"txtEmailVerification"}
                            >
                                {Strings.SIGN_UP_FOR_MAE}
                            </Text>

                            <Text
                                style={Style.snapText}
                                accessible={true}
                                testID={"txtEmailVerification"}
                                accessibilityLabel={"txtEmailVerification"}
                            >
                                {Strings.MAE_EXIST_DESC}
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
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default MAEExists;

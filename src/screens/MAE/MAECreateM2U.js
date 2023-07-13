import React, { Component } from "react";
import { Text, View, Keyboard } from "react-native";
import * as Strings from "@constants/strings";
import Styles from "@styles/MAE/AccountDashboardStyle";
import * as navigationConstant from "@navigation/navigationConstant";
import { NextRightButton } from "@components/Common";
import NavigationService from "@navigation/navigationService";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";

class MAECreateM2U extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {};
    }

    moveToNext = () => {
        console.log("[MAECreateM2U] >> [moveToNext]");

        Keyboard.dismiss();
        this.props.navigation.navigate(navigationConstant.MAE_M2U_USERNAME);
    };

    onCloseTap = () => {
        console.log("[MAECreateM2U] >> [onCloseTap]");

        NavigationService.resetAndNavigateToModule(
            navigationConstant.MAE_MODULE_STACK,
            navigationConstant.MAE_ACC_DASHBOARD
        );
    };

    render() {
        console.log("[MAECreateM2U] >> [render]");

        return (
            <ScreenContainer backgroundType="color">
                <React.Fragment>
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
                        <View style={Styles.nameView}>
                            {/* Header */}
                            <Text style={Styles.snapName}>{Strings.CREATE_M2U_HEADER}</Text>

                            {/* Description */}
                            <Text
                                style={Styles.snapText}
                                accessible={true}
                                testID={"txtTabungDetail"}
                                accessibilityLabel={"txtTabungDetail"}
                            >
                                {Strings.CREATE_M2U_DESC}
                            </Text>
                        </View>
                    </ScreenLayout>

                    {/* Bottom NEXT button */}
                    <View style={Styles.RightImageView}>
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

export default MAECreateM2U;

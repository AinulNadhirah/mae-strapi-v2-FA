import React, { Component, Fragment } from "react";
import {
    Text,
    View,
    ScrollView,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Platform,
    Linking,
} from "react-native";
import {
    AvatarCircle,
    ButtonRound,
    ImageButtonCustom,
    SetupNow,
    MyView,
    Input,
    HeaderPageIndicator,
    ErrorMessage,
} from "@components/Common";
import commonStyle from "@styles/main";
import Styles from "@styles/Wallet/WalletScreen";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";

import Permissions from "react-native-permissions";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import { MEDIUM_GREY, ROYAL_BLUE, WHITE, BLACK } from "@constants/colors";
import Assets from "@assets";
class QRCamerDenyScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
            error: false,
        };
    }
    componentDidMount() {}

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
    }

    closePress() {
        this.props.navigation.navigate("TabNavigator", {
            screen: "Dashboard",
        });
    }

    backPress() {
        this.props.navigation.navigate("TabNavigator", {
            screen: "Dashboard",
        });
    }

    errorPress() {
        this.setState({ error: false });
    }

    async enablePress() {
        if (Platform.OS == "ios") {
            Linking.canOpenURL("app-settings:")
                .then((supported) => {
                    if (!supported) {
                        console.log("Can't handle settings url");
                        this.setState({ error: true });
                    } else {
                        console.log(" handle settings url");

                        return Linking.openURL("app-settings:");
                    }
                })
                .catch((err) => console.error("An error occurred", err));
        } else {
            let permissionResult = await Permissions.request("camera").then((response) => {
                console.log("R", response);
                return response;
            });

            if (permissionResult == "denied" || permissionResult == "undetermined") {
            } else if (permissionResult == "restricted") {
                this.setState({ error: true });
            } else {
                this.props.navigation.navigate("TabNavigator", {
                    screen: "Dashboard",
                });
            }
        }
    }

    render() {
        return (
            //<View style={[commonStyle.childContainer, commonStyle.greyBackgroundColor]}>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        // header={
                        //     <HeaderLayout
                        //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        //     />
                        // }
                        useSafeArea
                    >
                        <HeaderPageIndicator
                            showBack={false}
                            showClose={true}
                            showIndicator={false}
                            showTitle={false}
                            showBackIndicator={false}
                            pageTitle={""}
                            numberOfPages={1}
                            currentPage={1}
                            navigation={this.props.navigation}
                            testID={"header"}
                            accessibilityLabel={"header"}
                            noPop={true}
                            noClose={true}
                            onClosePress={this.closePress}
                            onBackPress={() => {}}
                        />
                        <ScrollView>
                            <View style={Styles.addedTitleContainer}>
                                <Text
                                    style={[Styles.addedTitle, commonStyle.font]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    QRPay
                                </Text>
                            </View>
                            <View style={Styles.addedDescriptionContainer}>
                                <Text
                                    style={[Styles.addedDescription, commonStyle.font]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    Required camera permission
                                </Text>
                            </View>
                            <View style={[Styles.addedSetupTop, { marginTop: 60 }]}>
                                <SetupNow
                                    isBigIcon={true}
                                    text="Enable Camera"
                                    url={Assets.yellowCamera}
                                    onPress={this.enablePress}
                                />
                            </View>
                            {/* {ModelClass.QR_DATA.fromWallet === true ? (
                                <View style={Styles.addedSetupDown}>
                                    <SetupNow
                                        isBigIcon={true}
                                        text={Strings.BACK_TO_WALLET}
                                        url={require("@assets/icons/ic_yellow_wallet.png")}
                                        onPress={this.backPress()}
                                    />
                                </View>
                            ) : null} */}

                            {this.state.error == true && (
                                <Fragment>
                                    <ErrorMessage
                                        onClose={() => {
                                            this.setState({ error: false });
                                        }}
                                        title={Strings.APP_NAME_ALERTS}
                                        description={
                                            "Please go to mobile settings and enable camera"
                                        }
                                        showOk={true}
                                        onOkPress={this.errorPress}
                                    />
                                </Fragment>
                            )}
                        </ScrollView>
                        {/* </View> */}
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

export default QRCamerDenyScreen;

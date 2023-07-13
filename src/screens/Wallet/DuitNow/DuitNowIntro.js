import React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Alert,
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
import DuitnowList from "@components/Others/DuitnowList";
import { Register } from "./Start/Register";
import { Welcome } from "./Start/Welcome";

class DuitNowIntro extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
            error: false,
            currentScreen: 1,
        };
    }
    componentDidMount() {}

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
    }
    render() {
        return (
            <View style={[commonStyle.childContainer, commonStyle.blueBackgroundColor]}>
                <HeaderPageIndicator
                    showBack={this.state.currentScreen !== 1}
                    showClose={true}
                    showIndicator={false}
                    showTitle={true}
                    showTitleCenter={true}
                    showBackIndicator={false}
                    pageTitle={"Wallet"}
                    numberOfPages={1}
                    currentPage={1}
                    navigation={this.props.navigation}
                    moduleName={navigationConstant.DUITNOW_MODULE}
                    routeName={navigationConstant.DUITNOW_REGISTER}
                    testID={"header"}
                    accessibilityLabel={"header"}
                    noPop={true}
                    onBackPress={() => {
                        //todo revert back api
                        if (this.state.currentScreen > 1)
                            this.setState({ currentScreen: this.state.currentScreen - 1 });
                    }}
                />

                {this.state.currentScreen === 1 ? <Welcome /> : null}

                {this.state.currentScreen === 1 ? (
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                        }}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 10,
                                backgroundColor: "transparent",
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ currentScreen: 2 });
                                }}
                            >
                                <Image
                                    accessible={true}
                                    testID={"imgWalNext"}
                                    accessibilityLabel={"imgWalNext"}
                                    style={{
                                        height: 70,
                                        width: 70,
                                    }}
                                    source={require("@assets/icons/ic_next_white.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {this.state.currentScreen === 2 ? (
                    <Register
                        registerCall={() => {
                            NavigationService.navigateToModule(
                                navigationConstant.DUITNOW_MODULE,
                                navigationConstant.DUITNOW_SELECT_ACCOUNT
                            );
                        }}
                        remainderCall={() => {
                            NavigationService.navigateToModule(
                                navigationConstant.DUITNOW_MODULE,
                                navigationConstant.DUITNOW_REGISTER
                            );
                        }}
                    />
                ) : null}

                {this.state.error === true ? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title={Strings.APP_NAME_ALERTS}
                        description={"Please go to mobile settings and enable camera"}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                ) : null}
            </View>
        );
    }
}

export default DuitNowIntro;

import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, View, ImageBackground, Dimensions, StyleSheet } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import { HeaderPageIndicator, WalletEnter, ErrorMessage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, BLACK } from "@constants/colors";
import { FA_SCREEN_NAME, FA_VIEW_SCREEN, FA_SCANPAY_ONBOARDING } from "@constants/strings";

export const { width, height } = Dimensions.get("window");

class QRStartScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentScreen: 1,
            error: false,
            isSensorAvailable: false,
            pin: "",
            mutVariables: {},
            routeFrom: "",
            routeTo: "",
            routeFromModule: "",
            routeToModule: "",
            settings: false,
            primary: false,
            wallet: false,
            data: {},
            quickAction: false,
        };

        this.onClosePressHandler = this.onClosePressHandler.bind(this);
    }

    state = {
        currentScreen: 1,
        error: false,
    };

    onClosePressHandler = () => {
        if (this.state.primary) {
            if (this.state.settings) {
                this.props.navigation.navigate("Settings");
            } else if (this.state.wallet) {
                this.props.navigation.navigate(navigationConstant.MORE, {
                    screen: "Wallet",
                });
            } else {
                this.props.navigation.navigate("Tab", {
                    screen: "Dashboard",
                    params: {
                        refresh: true,
                    },
                });
            }
        } else {
            if (this.state.wallet) {
                this.props.navigation.navigate(navigationConstant.MORE, {
                    screen: "Wallet",
                });
            } else {
                this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                    screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                });
            }
        }
    };

    onBackPressHandler = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.initData();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    setScreen = () => {
        const { route } = this.props;
        const routeFrom = route.params?.routeFrom ?? "";
        const routeTo = route.params?.routeTo ?? "";
        const routeFromModule = route.params?.routeFromModule ?? "";
        const routeToModule = route.params?.routeToModule ?? "";
        const settings = route.params?.settings ?? false;
        const primary = route.params?.primary ?? false;
        const wallet = route.params?.wallet ?? false;
        const data = route.params?.data ?? {};
        const quickAction = route.params?.quickAction ?? false;
        this.setState({
            routeFrom,
            routeTo,
            routeFromModule,
            routeToModule,
            settings,
            primary,
            wallet,
            data,
            quickAction,
        });
    };

    initData = async () => {
        try {
            this.setScreen();
            const { getModel, updateModel, route } = this.props;
            const { isPostPassword } = getModel("auth");
            const quickAction = route.params?.quickAction ?? false;

            updateModel({
                misc: {
                    isFestiveFlow: quickAction,
                },
            });

            if (!isPostPassword) {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                console.log("result > ", result);
                const { code, message } = result;

                if (code !== 0) {
                    this.onClosePressHandler();
                }
            }
        } catch (err) {
            console.log("err1", err);
            this.onClosePressHandler();
        }
    };

    nextPress = () => {
        this.props.navigation.navigate(navigationConstant.QR_STACK, {
            screen: "QrLimit",
            params: {
                routeFrom: this.state.routeFrom,
                routeTo: navigationConstant.QRPAY_DAILY_LIMIT,
                routeFromModule: this.state.routeFromModule,
                routeToModule: this.state.routeToModule,
                settings: this.state.settings,
                primary: this.state.primary,
                wallet: this.state.wallet,
                setup: true,
                data: this.state.data,
                quickAction: this.state.quickAction,
            },
        });
    };

    render() {
        return (
            //<View style={[commonStyle.childContainer, commonStyle.blueBackgroundColor]}>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_SCANPAY_ONBOARDING}
            >
                <>
                    <ScreenLayout paddingBottom={0} paddingTop={0} paddingHorizontal={0}>
                        <ImageBackground
                            resizeMode={"cover"}
                            style={{
                                width: width,
                                flex: 1,
                            }}
                            source={require("@assets/images/im_qrStart.png")}
                        >
                            <HeaderPageIndicator
                                showBack={true}
                                showClose={true}
                                showIndicator={false}
                                showTitle={false}
                                showBackIndicator={false}
                                pageTitle={""}
                                numberOfPages={1}
                                currentPage={this.state.currentScreen}
                                navigation={this.props.navigation}
                                noClose={true}
                                noPop={true}
                                routeName={this.state.routeFrom}
                                moduleName={this.state.routeFromModule}
                                onClosePress={this.onClosePressHandler}
                                onBackPress={this.onBackPressHandler}
                            />
                            <View style={styles.mainContainer}>
                                <View style={styles.titleContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={20}
                                        style={{ marginTop: 30 }}
                                        text="Go cashless with Scan & Pay"
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight={"300"}
                                        color={BLACK}
                                        lineHeight={18}
                                        textAlign={"center"}
                                        style={{ marginTop: 10 }}
                                        text={`Activate your Scan & Pay once to seamlessly pay at participating merchants by scanning QR codes.\n\nYou can also send or receive money from friends by scanning their QR codes, or get them to scan yours.`}
                                    />
                                </View>
                            </View>
                            <View style={styles.btnFooter}>
                                <TouchableOpacity
                                    style={styles.buttonContainer}
                                    onPress={this.nextPress}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight={"600"}
                                        color={BLACK}
                                        lineHeight={18}
                                        textAlign={"center"}
                                        text="Next"
                                    />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    // container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    // block: { flexDirection: "column" },
    titleContainer: {
        justifyContent: "center",
        marginTop: height > 700 ? height / 2 + 10 : height / 2 - 30,
    },
    descriptionContainer: {
        width: width - 48,
        justifyContent: "center",
    },
    buttonContainer: {
        width: width - 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffdd00",
        borderRadius: 48,
    },
    btnFooter: {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        position: "absolute",
        bottom: 30,
        height: 50,
    },
    mainContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
});

export default withModelContext(QRStartScreen);

import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, View, Dimensions, StyleSheet, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { BRIGHT_ORANGE, BRIGHT_YELLOW, WHITE } from "@constants/colors";

import { lottie } from "@assets";

export const { width, height } = Dimensions.get("window");
class QRCashBackScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                amount: PropTypes.string,
                quickAction: PropTypes.bool,
                success: PropTypes.bool,
                text: PropTypes.string,
            }),
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            amount: "",
            success: false,
            quickAction: false,
        };
    }

    state = {
        currentScreen: 1,
        error: false,
    };

    onBackPressHandler = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        this.initData();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.initData();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    initData = async () => {
        const { route } = this.props;

        this.setState({
            text: route.params?.text ?? "Done",
            amount: route.params?.amount ?? "",
            success: route.params?.success ?? false,
            quickAction: route.params?.quickAction ?? false,
        });
    };

    render() {
        // if (this.state.quickAction) {
        //     return (
        //         <CampaignCashbackAnimationTemplate
        //             success={this.state.success}
        //             amount={this.state.amount}
        //             onDone={this.onBackPressHandler}
        //             isCashback
        //         />
        //     );
        // }

        return (
            <ScreenContainer backgroundType="color" backgroundColor={BRIGHT_YELLOW}>
                <>
                    <ScreenLayout paddingBottom={0} paddingTop={0} paddingHorizontal={0}>
                        {this.state.success ? (
                            <View style={styles.successContainer}>
                                <Animatable.View
                                    style={styles.textView}
                                    animation="fadeInUp"
                                    duration={500}
                                    delay={500}
                                >
                                    <Typo
                                        fontSize={26}
                                        fontWeight="900"
                                        lineHeight={30}
                                        style={styles.text1}
                                        text="CONGRATULATIONS!"
                                    />
                                    <Typo
                                        fontSize={22}
                                        fontWeight="700"
                                        lineHeight={25}
                                        style={styles.text2}
                                        text="YOU'VE WON"
                                    />
                                    <View style={styles.amountContainer}>
                                        <Typo
                                            fontSize={35}
                                            fontWeight="bold"
                                            lineHeight={30}
                                            style={styles.amount}
                                            text={this.state.amount}
                                        />
                                    </View>
                                </Animatable.View>
                                <Animatable.View
                                    style={styles.cbText}
                                    animation="fadeInUp"
                                    duration={200}
                                    delay={1000}
                                >
                                    <Typo
                                        fontSize={22}
                                        fontWeight="700"
                                        lineHeight={25}
                                        style={styles.text4}
                                        text="CASHBACK!"
                                    />
                                </Animatable.View>
                                <LottieView
                                    style={styles.successCBAnim}
                                    source={lottie.qrCbSuccess}
                                    autoPlay
                                    autoSize
                                    loop
                                    resizeMode="cover"
                                />
                            </View>
                        ) : (
                            <View style={styles.container}>
                                <View style={styles.failContainer}>
                                    <Animatable.View
                                        animation="fadeInUp"
                                        duration={500}
                                        delay={500}
                                    >
                                        <Typo
                                            fontSize={23}
                                            fontWeight="700"
                                            lineHeight={37}
                                            style={styles.failtext1}
                                            text="Oops, no cashback this time."
                                        />
                                    </Animatable.View>

                                    <Animatable.View
                                        animation="fadeInUp"
                                        duration={200}
                                        delay={1000}
                                    >
                                        <Typo
                                            fontSize={20}
                                            fontWeight="400"
                                            lineHeight={25}
                                            style={styles.failtext2}
                                            text="Better luck next time!"
                                        />
                                    </Animatable.View>
                                </View>
                                <LottieView
                                    style={styles.failCBAnim}
                                    source={lottie.qrCbFail}
                                    autoPlay
                                    autoSize
                                    loop={true}
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        <View style={styles.bottomView}>
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={this.onBackPressHandler}
                            >
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={this.state.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}
const styles = StyleSheet.create({
    amount: { paddingTop: 20 },
    amountContainer: {
        backgroundColor: WHITE,
        borderRadius: 20,
        height: "30%",
        width: "80%",
    },
    bottomView: {
        alignItems: "center",
        alignSelf: "center",
        bottom: height / 10,
        height: 50,
        justifyContent: "center",
        position: "absolute",
    },
    buttonContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 48,
        height: 48,
        justifyContent: "center",
        width: width - 48,
    },
    cbText: { marginTop: 10 },
    container: { flex: 1 },
    failCBAnim: {
        bottom: "8%",
        position: "absolute",
        width: "100%",
    },
    failContainer: {
        flex: 1,
        marginTop: "20%",
        position: "absolute",
        width: "100%",
        zIndex: 10,
    },
    failtext1: { marginTop: "35%" },
    failtext2: { marginTop: "3%" },
    successCBAnim: {
        bottom: "-3%",
        position: "absolute",
        width: "100%",
        zIndex: -10,
    },
    successContainer: { flex: 1, top: "-13%" },
    text1: { padding: 25 },
    text2: { paddingBottom: 15 },
    textView: {
        alignItems: "center",
        alignSelf: "center",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        top: height / 4,
    },
});

export default withModelContext(QRCashBackScreen);

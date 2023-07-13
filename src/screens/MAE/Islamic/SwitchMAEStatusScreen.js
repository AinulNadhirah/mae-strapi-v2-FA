import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";

import Images from "@assets";

const animateFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

class SwitchMAEStatusScreen extends Component {
    constructor(props) {
        super(props);
    }

    /* EVENT HANDLERS */

    onDoneButtonPress = () => {
        console.log("[SwitchMAEStatusScreen] >> [onDoneButtonPress]");
        const routeFrom = this.props.route.params.routeFrom;
        if (routeFrom == "AccountDetails") {
            this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
            });
        } else if (routeFrom === "WalletMainDashboard") {
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: "Dashboard",
            });
        }
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={<View />}
                        useSafeArea
                        neverForceInset={["top"]}
                    >
                        <View style={styles.container}>
                            <View style={styles.meta}>
                                <Animatable.Image
                                    animation={animateFadeInUp}
                                    delay={500}
                                    duration={500}
                                    source={Images.onboardingSuccessBg}
                                    style={styles.imageBg}
                                    useNativeDriver
                                />
                            </View>
                            <View style={styles.footer}>
                                <Animatable.View
                                    animation={animateFadeInUp}
                                    duration={250}
                                    delay={1000}
                                    style={styles.copy}
                                >
                                    <Typo
                                        fontSize={16}
                                        lineHeight={19}
                                        fontWeight="600"
                                        text="Request Successful"
                                        textAlign="left"
                                    />
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={28}
                                        style={styles.label}
                                        text="Your account will be updated after 1 working day."
                                        textAlign="left"
                                    />
                                </Animatable.View>
                                <Animatable.View
                                    animation={animateFadeInUp}
                                    duration={250}
                                    delay={1100}
                                    style={styles.actionContainer}
                                >
                                    <ActionButton
                                        fullWidth
                                        borderRadius={25}
                                        onPress={this.onDoneButtonPress}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                text="Done"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </Animatable.View>
                            </View>
                        </View>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

export default SwitchMAEStatusScreen;

const styles = StyleSheet.create({
    actionContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    copy: {
        paddingHorizontal: 36,
    },
    footer: {
        flex: 0.4,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    imageBg: { height: "100%", width: "100%" },
    label: {
        paddingVertical: 16,
    },
    meta: {
        alignItems: "center",
        flex: 0.6,
    },
});

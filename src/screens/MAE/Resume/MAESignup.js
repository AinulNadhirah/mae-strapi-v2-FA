import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PropTypes from "prop-types";
import LinearGradient from "react-native-linear-gradient";
import * as navigationConstant from "@navigation/navigationConstant";
import Typo from "@components/Text";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { withModelContext } from "@context";

class MAESignup extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            screenName: props.route.params?.screenName,
            desc: "",
        };
    }

    componentDidMount() {
        console.log("[MAESignup] >> [componentDidMount]");
        let desc =
            "It looks like you don't have a Maybank2u account set up. You'll need one in order to continue.";
        if (
            this.props.route.params?.from == "WithMAE" ||
            this.props.route.params?.from == "ETBWithM2U"
        ) {
            desc = "Log in to your Maybank2U account to continue.";
        }
        this.setState({
            desc,
        });
    }

    onBackTap = () => {
        console.log("[MAESignup] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[MAESignup] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAESignup] >> [onContinueTap]");
        const { filledUserDetails } = this.state;
        if (
            this.props.route?.params?.from == "WithMAE" ||
            this.props.route?.params?.from == "ETBWithM2U"
        ) {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uUsername",
                params: {
                    isMaeOnboarding: this.props.route?.params?.from == "WithMAE" ? true : false,
                    screenName: this.state.screenName,
                    filledUserDetails,
                },
            });
        } else if (this.props.route?.params?.from == "ETBWithCredit/Debit") {
            this.props.navigation.navigate(navigationConstant.MAE_INAPP, {
                filledUserDetails,
                screenName: "MAEOnboardDetails4",
                from: "ETBWithCredit/Debit",
            });
        } else {
            this.props.navigation.navigate(navigationConstant.MAE_OTP_REQUEST, {
                filledUserDetails,
            });
        }
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text="Sign up for MAE"
                                />
                                <Typo
                                    fontSize={20}
                                    style={styles.description}
                                    lineHeight={30}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={this.state.desc}
                                />
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueTap}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Continue"
                                    />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    fieldContainer: {
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
    },
    description: {
        marginTop: 12,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default withModelContext(MAESignup);
